import { useEffect, useMemo, useRef, useState } from 'react';
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
import HandoverStats from './ProjectCompletionHandoverStats';
import HandoverFilters from './ProjectCompletionHandoverFilters';
import HandoverTable from './ProjectCompletionHandoverTable';
import HandoverFormModal from './ProjectCompletionHandoverForm';
import HandoverDossierModal from './ProjectCompletionHandoverDetail';

/** Contract status that makes a construction contract eligible for WUA handover. */
export const HANDED_OVER_STATUS = 'Handed Over to Users';

/* --- Handover protocol statuses (backend: IrrigationEnums::HANDOVER_STATUSES) --- */
export const HANDOVER_STATUSES = [
  { value: 'Handed Over to Users', label: 'Handed Over to Users (Active WUA Operation)', color: 'success' },
  { value: 'DLP Completed & Retention Released', label: 'DLP Completed (Final Warranty Clearance)', color: 'default' },
  { value: 'Snag List Pending', label: 'Snag / Punch List Pending Clearance', color: 'orange' },
  { value: 'Wet Run Commissioned', label: 'Hydraulic Wet Run Commissioned', color: 'default' },
];

export const statusColor = (status) => HANDOVER_STATUSES.find((s) => s.value === status)?.color || 'default';

/** Options of the protocol-status filter ("all" shows every record). */
export const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All Handover Protocols' },
  { value: 'Handed Over to Users', label: 'Only "Handed Over to Users"' },
  { value: 'DLP Completed & Retention Released', label: 'DLP Completed & Released' },
  { value: 'Snag List Pending', label: 'Snag List Pending' },
  { value: 'Wet Run Commissioned', label: 'Wet Run Commissioned' },
];

/**
 * Statutory protocol gates: form field (check_*) sent to the server, key in the
 * server-computed `protocol_checklist`, and the labels used in form and dossier.
 */
export const PROTOCOL_GATES = [
  { field: 'check_wet_run', key: 'hydraulic_wet_run_tested', formLabel: 'Hydraulic Wet Run Tested', dossierLabel: 'Hydraulic Wet Run Tested', yes: 'Passed', no: 'Failed', noColor: 'error' },
  { field: 'check_as_built', key: 'as_built_drawings_submitted', formLabel: 'As-Built Drawings Stamped', dossierLabel: 'As-Built Drawings Stamped', yes: 'Complete', no: 'Pending', noColor: 'error' },
  { field: 'check_om_manual', key: 'om_manual_delivered', formLabel: 'O&M Manual Handed to WUA', dossierLabel: 'O&M Manual to WUA', yes: 'Delivered', no: 'Pending', noColor: 'error' },
  { field: 'check_wua_trained', key: 'wua_executive_trained', formLabel: 'WUA Operators Trained', dossierLabel: 'WUA Operators Trained', yes: 'Certified', no: 'Pending', noColor: 'error' },
  { field: 'check_snags_cleared', key: 'snags_cleared', formLabel: 'Snag List 100% Cleared', dossierLabel: 'Snags 100% Cleared', yes: 'Yes (0 Snags)', no: null, noColor: 'warning' },
  { field: 'check_retention_released', key: 'retention_released', formLabel: 'Retention Released', dossierLabel: '5% Retention Released', yes: 'Released', no: 'Held under Warranty', noColor: 'default' },
];

/** Defaults for a newly registered handover certificate. */
export const NEW_HANDOVER_DEFAULTS = {
  handover_status: HANDED_OVER_STATUS,
  defect_liability_months: 12,
  snag_items_count: 0,
  handover_committee_lead: 'Regional Irrigation Handover Commission Lead',
  check_wet_run: true,
  check_as_built: true,
  check_om_manual: true,
  check_wua_trained: true,
  check_snags_cleared: true,
  check_retention_released: false,
};

/** 5% warranty retention of a contract sum. */
export const retentionFor = (contractSum) => Math.round((Number(contractSum) || 0) * 0.05);



/** Form values taken from a completed construction contract. */
export const contractToFields = (c) => ({
  scheme_name: extractName(c.scheme_name, null),
  contract_code: c.contract_code,
  project_code: c.project_code,
  contractor_name: c.contractor_name,
  consultant_supervisor: c.consultant_supervisor,
  command_area_ha: c.command_area_ha,
  beneficiaries_male: c.beneficiaries_male,
  beneficiaries_female: c.beneficiaries_female,
  contract_sum_etb: c.contract_sum_etb,
  retention_money_etb: retentionFor(c.contract_sum_etb),
  ...(c.defect_liability_months ? { defect_liability_months: c.defect_liability_months } : {}),
  recipient_wua: c.wua_name || `${extractName(c.scheme_name, '')} Water Users Association`,
  zone: extractName(c.zone, null),
  woreda: extractName(c.woreda, null),
  kebele: extractName(c.kebele, null),
});

/** Saved checklist object -> check_* form fields. */
export const checklistToFields = (checklist) => Object.fromEntries(
  PROTOCOL_GATES.map((g) => [g.field, Boolean(checklist?.[g.key])])
);



const COLUMNS = [
  ['Certificate No', (r) => r.handover_certificate_no],
  ['Contract Code', (r) => r.contract_code],
  ['Project Code', (r) => r.project_code],
  ['Scheme Name', (r) => r.scheme_name],
  ['Recipient WUA', (r) => r.recipient_wua],
  ['Command Area (Ha)', (r) => toNumber(r.command_area_ha)],
  ['Total Beneficiaries', (r) => toNumber(r.beneficiaries_male) + toNumber(r.beneficiaries_female)],
  ['Handover Date', (r) => r.provisional_handover_eth_date],
  ['Status', (r) => r.handover_status],
  ['DLP (Months)', (r) => toNumber(r.defect_liability_months)],
  ['DLP Expiry', (r) => r.dlp_expiry_eth_date],
  ['Retention (ETB)', (r) => toNumber(r.retention_money_etb)],
  ['Zone', (r) => extractName(r.zone)],
  ['Woreda', (r) => extractName(r.woreda)],
];

export const exportHandoverLedger = (rows) => exportRowsToCsv(rows, COLUMNS, 'Irrigation_Project_Handover_Ledger');



const HANDED_OVER_PARAMS = { status: HANDED_OVER_STATUS };

/**
 * State and server interaction for the Project Completion & WUA Handover
 * register: loading, filters, KPIs and create / update / status / delete.
 */
function useProjectCompletionHandover() {
  const { message } = App.useApp();

  const [fiscalYear, setFiscalYear] = useState(CURRENT_FISCAL_YEAR);
  const [searchTerm, setSearchTerm] = useState('');
  // Defaults to the "Handed Over to Users" view, as before.
  const [statusFilter, setStatusFilter] = useState(HANDED_OVER_STATUS);

  const handovers = useIrrigationRecords(irrigationApi.constructionCompletion, { fiscalYear });
  // Contracts completed and marked "Handed Over to Users" (any fiscal year: a
  // contract finished last year can still be formally handed over this year).
  const contracts = useIrrigationRecords(irrigationApi.constructionProjects, { params: HANDED_OVER_PARAMS });

  const filteredRecords = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return handovers.records.filter((r) => {
      const haystack = [r.handover_certificate_no, r.contract_code, r.scheme_name, r.recipient_wua, r.zone, r.woreda]
        .map((v) => extractName(v, '').toLowerCase());
      return haystack.some((v) => v.includes(q)) && (statusFilter === 'all' || !statusFilter || r.handover_status === statusFilter);
    });
  }, [handovers.records, searchTerm, statusFilter]);

  const stats = useMemo(() => ({
    totalHandedOverProjects: filteredRecords.filter((r) => r.handover_status === HANDED_OVER_STATUS).length,
    totalHandedOverHectares: sumBy(filteredRecords, 'command_area_ha'),
    totalBeneficiaryFarmers: sumBy(filteredRecords, 'beneficiaries_male') + sumBy(filteredRecords, 'beneficiaries_female'),
    totalRetentionSecured: sumBy(filteredRecords, 'retention_money_etb'),
  }), [filteredRecords]);

  /** Create or update; resolves true when the server accepted the record. */
  const saveHandover = async (values, editingRecord, form) => {
    try {
      if (editingRecord) {
        await handovers.update(editingRecord.id, values);
        message.success('Project completion & handover record updated successfully');
      } else {
        await handovers.create(values);
        message.success('New scheme completion & WUA handover certificate registered successfully');
      }
      return true;
    } catch (err) {
      notifyApiError(message, err, 'Failed to save handover record', form);
      return false;
    }
  };

  const changeStatus = async (record, handoverStatus) => {
    try {
      await handovers.patch(record.id, { handover_status: handoverStatus });
      message.success(`Protocol status updated to "${handoverStatus}"`);
    } catch (err) {
      notifyApiError(message, err, 'Failed to update handover protocol status');
    }
  };

  const deleteHandover = async (record) => {
    try {
      await handovers.remove(record.id);
      message.success('Handover certificate record removed');
    } catch (err) {
      notifyApiError(message, err, 'Failed to delete handover record');
    }
  };

  const exportCsv = () => {
    if (!filteredRecords.length) {
      message.warning('No handover records available to export');
      return;
    }
    exportHandoverLedger(filteredRecords);
    message.success('Handover ledger exported successfully');
  };

  /** Handed-over contract matching a scheme name typed/selected in the form. */
  const findContract = (schemeName) => contracts.records.find(
    (c) => extractName(c.scheme_name, '').toLowerCase() === (schemeName || '').toLowerCase()
  );

  const reload = () => {
    handovers.reload();
    contracts.reload();
  };

  return {
    fiscalYear,
    setFiscalYear,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    handovers,
    contracts: contracts.records,
    contractsError: contracts.error,
    reloadContracts: contracts.reload,
    reload,
    filteredRecords,
    stats,
    saveHandover,
    changeStatus,
    deleteHandover,
    exportCsv,
    findContract,
  };
}


/** Project Completion & Handover (Irrigation Construction & Monitoring). */
function ProjectCompletionHandoverContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const page = useProjectCompletionHandover(location.state?.search || '');

  const [formState, setFormState] = useState({ open: false, record: null });
  const [dossierRecord, setDossierRecord] = useState(null);

  const initialDossierHandled = useRef(false);
  useEffect(() => {
    if (initialDossierHandled.current) return;
    const targetCode = location.state?.certificateNo;
    if (!targetCode || !page.handovers.records.length) return;
    const match = page.handovers.records.find((h) => h.certificate_no === targetCode);
    if (match) {
      setDossierRecord(match);
      initialDossierHandled.current = true;
    }
  }, [location.state, page.handovers.records]);

  return (
    <div className="irr-page">
      <IrrigationBreadcrumb section="Irrigation Construction & Monitoring" title="Project Completion & Handover (የመስኖ ግንባታ ርክክብ)" />

      <LoadErrorAlert error={page.handovers.error} onRetry={page.reload} />

      <IrrigationStatsSection onRefresh={page.reload} loading={page.handovers.loading}>
        <HandoverStats stats={page.stats} />
      </IrrigationStatsSection>

      <IrrigationPageHeader
        section="Irrigation Construction & Monitoring"
        title="Project Completion & Handover (የመስኖ ግንባታ ርክክብ)"
        subtitle="Substantial & final acceptance certification, defects liability tracking, and WUA asset commissioning protocols"
        fiscalYear={page.fiscalYear}
        onFiscalYearChange={page.setFiscalYear}
        onRefresh={page.reload}
        loading={page.handovers.loading}
      >
        <HandoverFilters
          searchTerm={page.searchTerm}
          onSearchChange={page.setSearchTerm}
          status={page.statusFilter}
          onStatusChange={page.setStatusFilter}
          onExport={page.exportCsv}
          onCreate={() => setFormState({ open: true, record: null })}
        />
      </IrrigationPageHeader>

      <HandoverTable
        data={page.filteredRecords}
        loading={page.handovers.loading}
        onView={setDossierRecord}
        onEdit={(record) => setFormState({ open: true, record })}
        onDelete={page.deleteHandover}
        onOpenContract={page.openContract}
      />

      <HandoverFormModal
        open={formState.open}
        editingRecord={formState.record}
        contracts={page.contracts}
        wuas={page.wuas}
        nextCode={`HND-${page.fiscalYear.slice(0, 4)}-${String(page.handovers.records.length + 1).padStart(3, '0')}`}
        onCancel={() => setFormState({ open: false, record: null })}
        onSubmit={(values, form) => page.saveHandover(values, formState.record, form)}
      />

      <HandoverDossierModal
        record={dossierRecord}
        onClose={() => setDossierRecord(null)}
        onOpenContract={page.openContract}
      />
    </div>
  );
}

export default function ProjectCompletionHandoverManagement() {
  return (
    <App>
      <ProjectCompletionHandoverContent />
    </App>
  );
}
