import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { Alert, App } from 'antd';
import irrigationApi from '../../../../services/api/irrigationApi';
import useIrrigationRecords from '../../shared/hooks/useIrrigationRecords';
import { CURRENT_FISCAL_YEAR } from '../../shared/constants';
import { exportRowsToCsv, extractName, notifyApiError, sumBy, toNumber } from '../../shared/utils';
import IrrigationBreadcrumb from '../../shared/components/IrrigationBreadcrumb';
import IrrigationPageHeader from '../../shared/components/IrrigationPageHeader';
import LoadErrorAlert from '../../shared/components/LoadErrorAlert';
import IrrigationStatsSection from '../../shared/components/IrrigationStatsSection';
import ProgressStats, { ProgressChart } from './ConstructionProgressPerformanceStats';
import ProgressFilters from './ConstructionProgressPerformanceFilters';
import ProgressTable from './ConstructionProgressPerformanceTable';
import ProgressFormModal from './ConstructionProgressPerformanceForm';
import ProgressDossierModal from './ConstructionProgressPerformanceDetail';

export * from './ConstructionProgressPerformanceConstants';
import {
  SCHEME_TYPES,
  PROGRESS_HEALTH_STATUSES,
  HEALTHY_STATUSES,
  NEW_LOG_DEFAULTS,
  PROJECTS_PATH,
  NOT_TRACKED,
  orNotTracked,
} from './ConstructionProgressPerformanceConstants';



const COLUMNS = [
  ['Log Code', (r) => r.progress_log_code],
  ['Contract Code', (r) => r.contract_code],
  ['Project Code', (r) => r.project_code],
  ['Scheme Name', (r) => r.scheme_name],
  ['Type', (r) => r.scheme_type],
  ['Planned (%)', (r) => toNumber(r.planned_progress_pct)],
  ['Physical (%)', (r) => toNumber(r.physical_progress_pct)],
  ['Financial (%)', (r) => toNumber(r.financial_progress_pct)],
  ['Variance (%)', (r) => toNumber(r.variance_pct)],
  ['Lined Canal (km)', (r) => toNumber(r.canal_lining_km)],
  ['Gates Installed', (r) => toNumber(r.gates_installed_count)],
  ['Status', (r) => r.health_status],
  ['Date', (r) => r.reporting_ethiopian_date],
  ['Engineer', (r) => r.resident_engineer],
  ['Zone', (r) => extractName(r.zone)],
  ['Woreda', (r) => extractName(r.woreda)],
];

export const exportConstructionProgress = (rows) => exportRowsToCsv(rows, COLUMNS, 'Irrigation_Construction_Progress');



/** Fields a progress log owns; contract fields, fiscal year, variance and health are derived by the server. */
const LOG_FIELDS = [
  'contract_id', 'progress_log_code', 'planned_progress_pct', 'physical_progress_pct', 'financial_progress_pct',
  'weir_concreting_pct', 'canal_excavation_pct', 'canal_lining_km', 'target_canal_lining_km',
  'gates_installed_count', 'target_gates_count', 'resident_engineer', 'site_engineering_remarks',
  'eth_month', 'eth_day', 'eth_year',
];

const pick = (values) => Object.fromEntries(LOG_FIELDS.filter((f) => f in values).map((f) => [f, values[f]]));

const average = (rows, field) => (rows.length ? (sumBy(rows, field) / rows.length).toFixed(1) : '0.0');

/**
 * State and server interaction for Construction Progress & Performance:
 * progress logs, the parent-contract lookup, filters, KPIs, chart data and CRUD.
 */
function useConstructionProgress() {
  const { message } = App.useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const incomingContract = location.state?.filterContractCode || '';

  const [fiscalYear, setFiscalYear] = useState(CURRENT_FISCAL_YEAR);
  // The Construction Projects page links here with { state: { filterContractCode } }.
  const [searchTerm, setSearchTerm] = useState(incomingContract);
  const [schemeTypeFilter, setSchemeTypeFilter] = useState(null);
  const [healthStatusFilter, setHealthStatusFilter] = useState(null);

  const logs = useIrrigationRecords(irrigationApi.constructionProgress, { fiscalYear });
  const contracts = useIrrigationRecords(irrigationApi.constructionProjects, { fiscalYear });

  // Consume the navigation state once so a refresh does not re-apply it.
  useEffect(() => {
    if (!incomingContract) return;
    message.info(`Filtered progress view for contract ${incomingContract}`);
    navigate(location.pathname, { replace: true, state: null });
  }, [incomingContract, location.pathname, navigate, message]);

  const filteredRecords = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return logs.records.filter((r) => {
      const haystack = [r.progress_log_code, r.contract_code, r.scheme_name, r.resident_engineer, r.zone, r.woreda]
        .map((v) => extractName(v, '').toLowerCase());
      return (
        haystack.some((v) => v.includes(q))
        && (!schemeTypeFilter || r.scheme_type === schemeTypeFilter)
        && (!healthStatusFilter || r.health_status === healthStatusFilter)
      );
    });
  }, [logs.records, searchTerm, schemeTypeFilter, healthStatusFilter]);

  const stats = useMemo(() => ({
    totalTracked: filteredRecords.length,
    onTrackCount: filteredRecords.filter((r) => HEALTHY_STATUSES.includes(r.health_status)).length,
    avgNewProgress: average(filteredRecords.filter((r) => r.scheme_type === 'New Construction'), 'physical_progress_pct'),
    avgExistingProgress: average(filteredRecords.filter((r) => r.scheme_type === 'Existing Rehabilitation'), 'physical_progress_pct'),
    totalLinedCanalsKm: sumBy(filteredRecords, 'canal_lining_km').toFixed(1),
  }), [filteredRecords]);

  const chartData = useMemo(() => filteredRecords.map((r) => {
    const name = extractName(r.scheme_name, r.progress_log_code || '');
    return {
      name: name.length > 15 ? `${name.substring(0, 15)}...` : name,
      planned: Number(r.planned_progress_pct) || 0,
      physical: Number(r.physical_progress_pct) || 0,
      financial: Number(r.financial_progress_pct) || 0,
    };
  }), [filteredRecords]);

  /** Create or update; resolves true when the server accepted the record. */
  const saveLog = async (values, editingRecord, form) => {
    try {
      if (editingRecord) {
        await logs.update(editingRecord.id, pick(values));
        message.success('Site progress monitoring record updated successfully');
      } else {
        await logs.create(pick(values));
        message.success('New site progress log recorded successfully');
      }
      return true;
    } catch (err) {
      notifyApiError(message, err, 'Failed to save progress update', form);
      return false;
    }
  };

  const changeHealth = async (record, healthStatus) => {
    try {
      await logs.patch(record.id, { health_status: healthStatus });
      message.success(`Progress schedule health updated to "${healthStatus}"`);
    } catch (err) {
      notifyApiError(message, err, 'Failed to update schedule health');
    }
  };

  const deleteLog = async (record) => {
    try {
      await logs.remove(record.id);
      message.success('Progress log removed');
    } catch (err) {
      notifyApiError(message, err, 'Failed to delete progress log');
    }
  };

  const exportCsv = () => {
    if (!filteredRecords.length) {
      message.warning('No progress records available to export');
      return;
    }
    exportConstructionProgress(filteredRecords);
    message.success('Progress monitoring ledger exported successfully');
  };

  const openContract = (contractCode) => navigate(PROJECTS_PATH, { state: { searchCode: contractCode } });

  const reload = () => {
    logs.reload();
    contracts.reload();
  };

  return {
    fiscalYear,
    setFiscalYear,
    searchTerm,
    setSearchTerm,
    schemeTypeFilter,
    setSchemeTypeFilter,
    healthStatusFilter,
    setHealthStatusFilter,
    logs,
    contracts: contracts.records,
    contractsError: contracts.error,
    filteredRecords,
    stats,
    chartData,
    saveLog,
    changeHealth,
    deleteLog,
    exportCsv,
    openContract,
    reload,
  };
}


/** Construction Progress & Performance (Irrigation Construction & Monitoring). */
function ConstructionProgressPerformanceContent() {
  const page = useConstructionProgress();

  const [formState, setFormState] = useState({ open: false, record: null });
  const [dossierRecord, setDossierRecord] = useState(null);

  return (
    <div className="irr-page">
      <IrrigationBreadcrumb section="Irrigation Construction & Monitoring" title="Construction Progress & Performance (የግንባታ አፈፃፀም እና ሂደት ክትትል)" />

      <LoadErrorAlert error={page.logs.error} onRetry={page.reload} />
      {page.contractsError && (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          message="Construction contracts could not be loaded, so new inspection logs cannot be linked."
          description={page.contractsError}
        />
      )}

      <IrrigationStatsSection onRefresh={page.reload} loading={page.logs.loading}>
        <ProgressStats stats={page.stats} />
      </IrrigationStatsSection>

      <IrrigationPageHeader
        section="Irrigation Construction & Monitoring"
        title="Construction Progress & Performance (የግንባታ አፈፃፀም እና ሂደት ክትትል)"
        subtitle="Engineering physical S-curves, headwork concrete volume tracking, canal lining distance, and milestone health monitoring"
        fiscalYear={page.fiscalYear}
        onFiscalYearChange={page.setFiscalYear}
        onRefresh={page.reload}
        loading={page.logs.loading}
      >
        <ProgressFilters
          searchTerm={page.searchTerm}
          onSearchChange={page.setSearchTerm}
          schemeType={page.schemeTypeFilter}
          onSchemeTypeChange={page.setSchemeTypeFilter}
          health={page.healthStatusFilter}
          onHealthChange={page.setHealthStatusFilter}
          onExport={page.exportCsv}
          onCreate={() => setFormState({ open: true, record: null })}
        />
      </IrrigationPageHeader>

      <ProgressTable
        data={page.filteredRecords}
        loading={page.logs.loading}
        onView={setDossierRecord}
        onEdit={(record) => setFormState({ open: true, record })}
        onDelete={page.deleteLog}
        onHealthChange={page.changeHealth}
        onOpenContract={page.openContract}
      />

      <ProgressChart data={page.chartData} />

      <ProgressFormModal
        open={formState.open}
        editingRecord={formState.record}
        contracts={page.contracts}
        nextCode={`PRG-${page.fiscalYear.slice(0, 4)}-${String(page.logs.records.length + 1).padStart(3, '0')}`}
        onCancel={() => setFormState({ open: false, record: null })}
        onSubmit={(values, form) => page.saveLog(values, formState.record, form)}
      />

      <ProgressDossierModal record={dossierRecord} onClose={() => setDossierRecord(null)} onOpenContract={page.openContract} />
    </div>
  );
}

export default function ConstructionProgressPerformanceManagement() {
  return (
    <App>
      <ConstructionProgressPerformanceContent />
    </App>
  );
}
