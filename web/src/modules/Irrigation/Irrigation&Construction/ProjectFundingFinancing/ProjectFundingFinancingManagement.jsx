import { useEffect, useMemo, useState } from 'react';
import { App } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import irrigationApi from '../../../../services/api/irrigationApi';
import useIrrigationRecords from '../../shared/hooks/useIrrigationRecords';
import { CURRENT_FISCAL_YEAR } from '../../shared/constants';
import { exportRowsToCsv, extractName, notifyApiError, sumBy, toNumber } from '../../shared/utils';
import IrrigationBreadcrumb from '../../shared/components/IrrigationBreadcrumb';
import IrrigationPageHeader from '../../shared/components/IrrigationPageHeader';
import LoadErrorAlert from '../../shared/components/LoadErrorAlert';
import IrrigationStatsSection from '../../shared/components/IrrigationStatsSection';
import FundingStats, { FundingChart } from './ProjectFundingFinancingStats';
import FundingFilters from './ProjectFundingFinancingFilters';
import FundingTable from './ProjectFundingFinancingTable';
import FundingFormModal, { DisbursementModal } from './ProjectFundingFinancingForm';
import FundingDossierModal from './ProjectFundingFinancingDetail';

/* --- Specific Financing & Program Sources (100% Excel Aligned) --- */
export const FINANCING_PROGRAMS = [
  { value: 'Regional Government Budget', label: 'Regional Government Budget (በክልል መንግስት በጀት)', color: 'default' },
  { value: 'Federal Government Budget', label: 'Federal Government Budget (በፌደራል መንግስት በጀት)', color: 'default' },
  { value: 'PACT Program', label: 'PACT Program (በPACT በጀት)', color: 'default' },
  { value: 'FSRP Program', label: 'FSRP Program (በFSRP በጀት)', color: 'default' },
  { value: 'Lease / Direct Support', label: 'Lease / Direct Support (በኪራይ/ግልጽ ድጋፍ)', color: 'default' },
  { value: 'GCF (Climate Fund)', label: 'Green Climate Fund (GCF) (በGCF በጀት)', color: 'green' },
  { value: 'DRDIP Project', label: 'DRDIP Project (በDRDIP በጀት)', color: 'orange' },
  { value: 'CREW Project', label: 'CREW Project (በCREW በጀት)', color: 'volcano' },
  { value: 'CRIPS Project', label: 'CRIPS Project (በCRIPS በጀት)', color: 'gold' },
];

/* --- Financial Allocation Statuses --- */
export const ALLOCATION_STATUSES = [
  { value: 'Active Disbursement', label: 'Active Disbursement (Under Construction)', color: 'processing' },
  { value: 'Fully Disbursed', label: 'Fully Disbursed (100% Paid)', color: 'success' },
  { value: 'Funds Committed', label: 'Funds Committed (Contract Awarded)', color: 'default' },
  { value: 'Disbursement Paused', label: 'Disbursement Paused (Audit / Dispute)', color: 'error' },
];

/**
 * Construction contracts store funding labels like
 * "Regional Government Capital Budget (በክልል መንግስት በጀት)"; map them onto
 * the financing-program values (the server applies the same mapping).
 */
const PROGRAM_ALIASES = {
  'Regional Government Capital Budget': 'Regional Government Budget',
  'Lease / Direct Support Financing': 'Lease / Direct Support',
  'Green Climate Fund (GCF)': 'GCF (Climate Fund)',
  'Green Climate Fund': 'GCF (Climate Fund)',
};

export const toFinancingProgram = (fundingSource) => {
  if (!fundingSource) return 'Regional Government Budget';
  if (FINANCING_PROGRAMS.some((p) => p.value === fundingSource)) return fundingSource;
  const alias = Object.keys(PROGRAM_ALIASES).find((a) => fundingSource.startsWith(a));
  if (alias) return PROGRAM_ALIASES[alias];
  const short = fundingSource.split('(')[0].trim();
  return PROGRAM_ALIASES[short] || short;
};

export const toMillions = (value, digits = 1) => ((Number(value) || 0) / 1000000).toFixed(digits);



const COLUMNS = [
  ['Funding Code', (r) => r.funding_code],
  ['Contract Code', (r) => r.contract_code],
  ['Project Code', (r) => r.project_code],
  ['Scheme Name', (r) => r.scheme_name],
  ['Funding Program', (r) => r.funding_program],
  ['Account Ref', (r) => r.donor_account_ref],
  ['Allocated (ETB)', (r) => toNumber(r.total_allocated_budget_etb)],
  ['Disbursed (ETB)', (r) => toNumber(r.cumulative_disbursed_etb)],
  ['Remaining (ETB)', (r) => toNumber(r.remaining_balance_etb)],
  ['Burn Rate (%)', (r) => toNumber(r.financial_burn_rate_pct)],
  ['Status', (r) => r.allocation_status],
  ['Zone', (r) => extractName(r.zone)],
  ['Woreda', (r) => extractName(r.woreda)],
];

export const exportFundingLedger = (rows) => exportRowsToCsv(rows, COLUMNS, 'Irrigation_Project_Funding_Ledger');



/** Funding ledger: loading, filters, KPIs and create / update / status / disburse / delete. */
function useProjectFunding() {
  const { message } = App.useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const [fiscalYear, setFiscalYear] = useState(CURRENT_FISCAL_YEAR);
  // Construction Projects links here with { state: { filterContractCode } }.
  const [searchTerm, setSearchTerm] = useState(() => location.state?.filterContractCode || '');
  const [programFilter, setProgramFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);

  const funding = useIrrigationRecords(irrigationApi.constructionFunding, { fiscalYear });
  const contracts = useIrrigationRecords(irrigationApi.constructionProjects, { fiscalYear });

  useEffect(() => {
    const code = location.state?.filterContractCode;
    if (code) {
      message.info(`Filtered financial ledger for contract ${code}`);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.state, location.pathname, navigate, message]);

  const filteredRecords = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return funding.records.filter((r) => {
      const haystack = [r.funding_code, r.contract_code, r.scheme_name, r.funding_program, r.zone, r.woreda]
        .map((v) => extractName(v, '').toLowerCase());
      return haystack.some((v) => v.includes(q))
        && (!programFilter || r.funding_program === programFilter)
        && (!statusFilter || r.allocation_status === statusFilter);
    });
  }, [funding.records, searchTerm, programFilter, statusFilter]);

  const stats = useMemo(() => {
    const totalAllocated = sumBy(filteredRecords, 'total_allocated_budget_etb');
    const totalDisbursed = sumBy(filteredRecords, 'cumulative_disbursed_etb');
    return {
      totalSchemes: filteredRecords.length,
      totalAllocated,
      totalDisbursed,
      totalRemaining: sumBy(filteredRecords, 'remaining_balance_etb'),
      avgBurnRate: totalAllocated > 0 ? ((totalDisbursed / totalAllocated) * 100).toFixed(1) : '0.0',
    };
  }, [filteredRecords]);

  const chartData = useMemo(() => filteredRecords.map((r) => {
    const name = r.scheme_name || '';
    return {
      name: name.length > 14 ? `${name.substring(0, 14)}...` : name,
      allocated: Math.round((Number(r.total_allocated_budget_etb) || 0) / 1000000),
      disbursed: Math.round((Number(r.cumulative_disbursed_etb) || 0) / 1000000),
      balance: Math.round((Number(r.remaining_balance_etb) || 0) / 1000000),
    };
  }), [filteredRecords]);

  const saveRecord = async (values, editing, form) => {
    try {
      if (editing) {
        await funding.update(editing.id, values);
        message.success('Funding allocation ledger record updated successfully');
      } else {
        await funding.create(values);
        message.success('New capital funding allocation registered successfully');
      }
      return true;
    } catch (err) {
      notifyApiError(message, err, 'Failed to save funding record', form);
      return false;
    }
  };

  const changeStatus = async (record, allocationStatus) => {
    try {
      await funding.patch(record.id, { allocation_status: allocationStatus });
      message.success(`Funding status updated to "${allocationStatus}"`);
    } catch (err) {
      notifyApiError(message, err, 'Failed to update funding status');
    }
  };

  const disburse = async (record, values, form) => {
    try {
      await funding.runAction(() => irrigationApi.constructionFunding.disburse(record.id, values));
      message.success(
        `Disbursed ${((Number(values.disbursement_amount) || 0) / 1000000).toFixed(2)} Million ETB successfully for "${record.scheme_name}"!`
      );
      return true;
    } catch (err) {
      notifyApiError(message, err, 'Failed to log disbursement transaction', form);
      return false;
    }
  };

  const deleteRecord = async (record) => {
    try {
      await funding.remove(record.id);
      message.success('Funding ledger record removed');
    } catch (err) {
      notifyApiError(message, err, 'Failed to delete funding record');
    }
  };

  const exportCsv = () => {
    if (!filteredRecords.length) {
      message.warning('No funding records available to export');
      return;
    }
    exportFundingLedger(filteredRecords);
    message.success('Funding ledger exported successfully');
  };

  const findContract = (schemeName) => contracts.records.find(
    (c) => extractName(c.scheme_name, '').toLowerCase() === (schemeName || '').toLowerCase()
  );

  const openContract = (contractCode) => navigate('/irrigation/construction/projects', { state: { filterContractCode: contractCode } });

  return {
    fiscalYear, setFiscalYear, searchTerm, setSearchTerm, programFilter, setProgramFilter, statusFilter, setStatusFilter,
    funding, funds: funding, contracts: contracts.records, filteredRecords, stats, chartData,
    reload: funding.reload,
    saveRecord, saveFunding: saveRecord,
    changeStatus, disburse,
    deleteRecord, deleteFunding: deleteRecord,
    exportCsv, findContract, openContract,
  };
}


/** Project Funding & Financing (Irrigation Construction & Monitoring). */
function ProjectFundingFinancingContent() {
  const navigate = useNavigate();
  const page = useProjectFunding();

  const [formState, setFormState] = useState({ open: false, record: null });
  const [disbursingRecord, setDisbursingRecord] = useState(null);
  const [dossierRecord, setDossierRecord] = useState(null);

  const fundingObj = page.funding || page.funds || {};

  return (
    <div className="irr-page">
      <IrrigationBreadcrumb section="Irrigation Construction & Monitoring" title="Project Funding & Financing (የመስኖ ፋይናንስ እና በጀት)" />

      <LoadErrorAlert error={fundingObj.error} onRetry={page.reload} />

      <IrrigationStatsSection onRefresh={page.reload} loading={fundingObj.loading}>
        <FundingStats stats={page.stats} />
      </IrrigationStatsSection>

      <IrrigationPageHeader
        section="Irrigation Construction & Monitoring"
        title="Project Funding & Financing (የመስኖ ፋይናንስ እና በጀት)"
        subtitle="Capital budget appropriations, multilateral donor disbursements, co-financing ledger, and financial execution tracking"
        fiscalYear={page.fiscalYear}
        onFiscalYearChange={page.setFiscalYear}
        onRefresh={page.reload}
        loading={fundingObj.loading}
      >
        <FundingFilters
          searchTerm={page.searchTerm}
          onSearchChange={page.setSearchTerm}
          program={page.programFilter}
          onProgramChange={page.setProgramFilter}
          status={page.statusFilter}
          onStatusChange={page.setStatusFilter}
          onExport={page.exportCsv}
          onCreate={() => setFormState({ open: true, record: null })}
        />
      </IrrigationPageHeader>

      <FundingTable
        data={page.filteredRecords}
        loading={fundingObj.loading}
        onView={setDossierRecord}
        onEdit={(record) => setFormState({ open: true, record })}
        onDelete={page.deleteFunding}
        onStatusChange={page.changeStatus}
        onDisburse={setDisbursingRecord}
        onOpenContract={page.openContract}
      />

      <FundingChart data={page.chartData} />

      <FundingFormModal
        open={formState.open}
        editingRecord={formState.record}
        contracts={page.contracts}
        nextCode={`FND-${page.fiscalYear.slice(0, 4)}-${String((fundingObj.records || []).length + 1).padStart(3, '0')}`}
        onCancel={() => setFormState({ open: false, record: null })}
        onSubmit={(values, form) => page.saveFunding(values, formState.record, form)}
      />

      <DisbursementModal
        record={disbursingRecord}
        onCancel={() => setDisbursingRecord(null)}
        onSubmit={page.disburse}
      />

      <FundingDossierModal
        record={dossierRecord}
        onClose={() => setDossierRecord(null)}
        onOpenContract={page.openContract}
      />
    </div>
  );
}

export default function ProjectFundingFinancingManagement() {
  return (
    <App>
      <FundingFinancingAppWrapper />
    </App>
  );
}

function FundingFinancingAppWrapper() {
  return <ProjectFundingFinancingContent />;
}
