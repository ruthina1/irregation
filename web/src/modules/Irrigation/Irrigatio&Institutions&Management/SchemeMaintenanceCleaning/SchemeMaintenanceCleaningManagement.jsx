import { useMemo, useState } from 'react';
import { App } from 'antd';
import { useNavigate } from 'react-router-dom';
import irrigationApi from '../../../../services/api/irrigationApi';
import useIrrigationRecords from '../../shared/hooks/useIrrigationRecords';
import { CURRENT_FISCAL_YEAR } from '../../shared/constants';
import { exportRowsToCsv, extractName, notifyApiError, percent, sumBy, toNumber } from '../../shared/utils';
import IrrigationBreadcrumb from '../../shared/components/IrrigationBreadcrumb';
import IrrigationPageHeader from '../../shared/components/IrrigationPageHeader';
import LoadErrorAlert from '../../shared/components/LoadErrorAlert';
import IrrigationStatsSection from '../../shared/components/IrrigationStatsSection';
import MaintenanceStats, { MaintenanceCanalChart } from './SchemeMaintenanceCleaningStats';
import MaintenanceFilters from './SchemeMaintenanceCleaningFilters';
import MaintenanceTable from './SchemeMaintenanceCleaningTable';
import MaintenanceFormModal from './SchemeMaintenanceCleaningForm';
import MaintenanceDossierModal from './SchemeMaintenanceCleaningDetail';

/* --- Canal Network Types (Excel Aligned; IrrigationEnums::CANAL_TYPES) --- */
export const CANAL_NETWORK_TYPES = [
  { value: 'Modern Concrete Scheme (በዘመናዊ)', label: 'Modern Concrete Scheme (በዘመናዊ)', color: 'default' },
  { value: 'Traditional Earth Scheme (በባህላዊ)', label: 'Traditional Earth Scheme (በባህላዊ)', color: 'gold' },
];

/* --- Multi-Select Intervention Types Grouped by Scope (IrrigationEnums::OM_INTERVENTIONS) --- */
export const INTERVENTION_CATALOG_GROUPS = [
  {
    category: 'Desilting & Cleaning (የቦይ ጽዳትና ደለል ማንሳት)',
    options: [
      'Seasonal Canal Silt Removal (የደለል ማንሳት ስራ)',
      'Aquatic Invasive Weed Clearance (የመጤና የውሃ ውስጥ አረም ማጽዳት)',
      'Canal Sediment Trap & Basin Flushing (የደለል ማጠራቀሚያ ገንዳ ማጽዳት)',
      'Post-Flood Emergency Debris Removal (የድንገተኛ ጎርፍ ቆሻሻ ማጽዳት)',
    ],
  },
  {
    category: 'Structural Civil & Headwork Repair (የመሠረተ-ልማትና ቦይ ጥገና)',
    options: [
      'Canal Lining Masonry Crack Injection & Plastering (የስንጥቅ ጥገና)',
      'Headwork Weir Crest & Intake Gate Repair (የመጥለፊያ ግድብና በር ጥገና)',
      'Aqueduct & Flume Crossing Pipe Replacement (የቦይ ማስተላለፊያ ቱቦ መቀየር)',
      'Breached Embankment Gabion & Riprap Protection (የቦይ ዳርቻ ጋቢዮን መከላከል)',
      'Scour Sluice Basin Concrete Floor Rehabilitation',
    ],
  },
  {
    category: 'Electro-Mechanical & Solar (ኤሌክትሮ-መካኒካል)',
    options: [
      'Solar PV Array Cleaning & Wiring Maintenance',
      'Solar Surface/Submersible Pump Impeller Servicing',
      'Control Gate Spindle Lubrication & Seal Replacement',
    ],
  },
];

/* --- Intervention Statuses --- */
export const OPERATION_STATUSES = [
  { value: 'Completed', label: 'Intervention Completed & Functional', color: 'success' },
  { value: 'In Progress', label: 'Active Work / Mobilization on Site', color: 'processing' },
  { value: 'Labor Mobilization', label: 'Community Labor Mobilizing Stage', color: 'default' },
  { value: 'Damage Assessed', label: 'Damage Assessed (Awaiting Funding)', color: 'warning' },
];

/* --- Funding Source Options --- */
export const OANDM_FUND_SOURCES = [
  'WUA Internal O&M Reserve Fund (የማህበሩ የጥገና ፈንድ)',
  'Community Voluntary Labor Contribution (የህዝብ ጉልበት)',
  'Woreda Agriculture Maintenance Allocation',
  'Regional Emergency Scheme Rehabilitation Fund',
  'PACT / FSRP Community Scheme Grant',
];

/** Interventions that mobilise community labour (shows the labour section of the form). */
export const isLabourIntervention = (type) => ['Silt', 'Weed', 'Debris', 'ጽዳት', 'ደለል'].some((k) => type.includes(k));

/** Interventions shown as "cleaning" (green) tags. */
export const isCleaningTag = (type) => type.includes('Silt') || type.includes('Weed');

/** intervention_types is an array; tolerate a legacy comma-separated string. */
export const interventionList = (value) => (Array.isArray(value)
  ? value
  : String(value || '').split(',').map((t) => t.trim()).filter(Boolean));

/** Defaults for a newly logged intervention. */
export const NEW_RECORD_DEFAULTS = {
  canal_type: CANAL_NETWORK_TYPES[0].value,
  intervention_types: ['Seasonal Canal Silt Removal (የደለል ማንሳት ስራ)'],
  funding_source: OANDM_FUND_SOURCES[0],
  repaired_cleaned_km: 5.0,
  financial_cost_etb: 150000,
  mobilized_labor_male: 150,
  mobilized_labor_female: 45,
};



const COLUMNS = [
  ['Scheme Name', (r) => r.scheme_name],
  ['Canal Type', (r) => r.canal_type],
  ['WUA Name', (r) => r.wua_name],
  ['Intervention Types', (r) => interventionList(r.intervention_types).join('; ')],
  ['Delivered Canal (km)', (r) => toNumber(r.repaired_cleaned_km)],
  ['Protected Command (Ha)', (r) => toNumber(r.command_area_protected_ha)],
  ['Male Labor', (r) => toNumber(r.mobilized_labor_male)],
  ['Female Labor', (r) => toNumber(r.mobilized_labor_female)],
  ['Total Labor', (r) => toNumber(r.mobilized_labor_male) + toNumber(r.mobilized_labor_female)],
  ['Cost (ETB)', (r) => r.financial_cost_etb],
  ['Funding Source', (r) => r.funding_source],
  ['Status', (r) => r.operation_status],
  ['Date', (r) => r.activity_ethiopian_date],
  ['Zone', (r) => extractName(r.zone)],
  ['Woreda', (r) => extractName(r.woreda)],
];

export const exportMaintenanceLedger = (rows) => exportRowsToCsv(rows, COLUMNS, 'Irrigation_Maintenance_Cleaning_Ledger');



const isModern = (r) => Boolean(r.canal_type?.includes('Modern'));
const isTraditional = (r) => Boolean(r.canal_type?.includes('Traditional'));

/**
 * State and server interaction for the scheme maintenance & canal cleaning
 * ledger: loading, filters, KPIs, chart data and create / update / status / delete.
 */
function useSchemeMaintenance() {
  const { message } = App.useApp();

  const [fiscalYear, setFiscalYear] = useState(CURRENT_FISCAL_YEAR);
  const [searchTerm, setSearchTerm] = useState('');
  const [canalTypeFilter, setCanalTypeFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);

  const records = useIrrigationRecords(irrigationApi.schemeMaintenance, { fiscalYear });
  // Candidate schemes for the scheme AutoComplete (construction contracts, incl. wua_name).
  const schemes = useIrrigationRecords(irrigationApi.constructionProjects, { fiscalYear });

  const filteredRecords = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return records.records.filter((r) => {
      const haystack = [r.scheme_name, r.wua_name, interventionList(r.intervention_types).join(' '), r.zone, r.woreda]
        .map((v) => extractName(v, '').toLowerCase());
      return (
        haystack.some((v) => v.includes(q))
        && (!canalTypeFilter || r.canal_type === canalTypeFilter)
        && (!statusFilter || r.operation_status === statusFilter)
      );
    });
  }, [records.records, searchTerm, canalTypeFilter, statusFilter]);

  const stats = useMemo(() => {
    const modernCanalKm = sumBy(filteredRecords.filter(isModern), 'repaired_cleaned_km');
    const traditionalCanalKm = sumBy(filteredRecords.filter(isTraditional), 'repaired_cleaned_km');
    const totalMale = sumBy(filteredRecords, 'mobilized_labor_male');
    const totalFemale = sumBy(filteredRecords, 'mobilized_labor_female');
    return {
      totalInterventions: filteredRecords.length,
      completedCount: filteredRecords.filter((r) => r.operation_status === 'Completed').length,
      modernCanalKm: Number(modernCanalKm.toFixed(1)),
      traditionalCanalKm: Number(traditionalCanalKm.toFixed(1)),
      totalCanalKm: Number((modernCanalKm + traditionalCanalKm).toFixed(1)),
      totalProtectedHa: sumBy(filteredRecords, 'command_area_protected_ha'),
      totalMobilizedLabor: totalMale + totalFemale,
      totalMale,
      totalFemale,
      femaleSharePct: percent(totalFemale, totalMale + totalFemale),
      totalFinancialExpenditure: sumBy(filteredRecords, 'financial_cost_etb'),
    };
  }, [filteredRecords]);

  const chartData = useMemo(() => filteredRecords.map((r) => {
    const name = extractName(r.scheme_name, '');
    return {
      name: name.length > 14 ? `${name.substring(0, 14)}...` : name,
      modernKm: isModern(r) ? toNumber(r.repaired_cleaned_km) : 0,
      traditionalKm: isTraditional(r) ? toNumber(r.repaired_cleaned_km) : 0,
    };
  }), [filteredRecords]);

  /** Create or update; resolves true when the server accepted the record. */
  const saveRecord = async (values, editingRecord, form) => {
    try {
      if (editingRecord) {
        await records.update(editingRecord.id, values);
        message.success('O&M maintenance and cleaning record updated successfully');
      } else {
        await records.create(values);
        message.success('New scheme maintenance & canal desilting intervention logged successfully');
      }
      return true;
    } catch (err) {
      notifyApiError(message, err, 'Failed to save record', form);
      return false;
    }
  };

  const changeStatus = async (record, operationStatus) => {
    try {
      await records.patch(record.id, { operation_status: operationStatus });
      message.success(`Status updated to "${operationStatus}"`);
    } catch (err) {
      notifyApiError(message, err, 'Failed to update status');
    }
  };

  const deleteRecord = async (record) => {
    try {
      await records.remove(record.id);
      message.success('O&M intervention record removed');
    } catch (err) {
      notifyApiError(message, err, 'Failed to delete O&M record');
    }
  };

  const exportCsv = () => {
    if (!filteredRecords.length) {
      message.warning('No records available to export');
      return;
    }
    exportMaintenanceLedger(filteredRecords);
    message.success('O&M ledger exported successfully');
  };

  const reload = () => {
    records.reload();
    schemes.reload();
  };

  /** Matching construction contract for a scheme name typed/selected in the form. */
  const findScheme = (schemeName) => schemes.records.find(
    (s) => extractName(s.scheme_name, '').toLowerCase() === (schemeName || '').toLowerCase()
  );

  const openWua = (record) => {
    navigate('/irrigation/institutions/water-users-associations', {
      state: { searchWua: record?.wua_name },
    });
  };

  return {
    fiscalYear,
    setFiscalYear,
    searchTerm,
    setSearchTerm,
    canalTypeFilter,
    setCanalTypeFilter,
    typeFilter: canalTypeFilter,
    setTypeFilter: setCanalTypeFilter,
    statusFilter,
    setStatusFilter,
    records,
    campaigns: records,
    schemes,
    wuas: schemes,
    filteredRecords,
    stats,
    chartData,
    reload,
    saveRecord,
    saveCampaign: saveRecord,
    changeStatus,
    deleteRecord,
    deleteCampaign: deleteRecord,
    exportCsv,
    findScheme,
    openWua,
  };
}


/** Scheme Maintenance & Canal Cleaning (Irrigation Institutions Management). */
function SchemeMaintenanceCleaningContent() {
  const navigate = useNavigate();
  const page = useSchemeMaintenance();

  const [formState, setFormState] = useState({ open: false, record: null });
  const [dossierRecord, setDossierRecord] = useState(null);

  const campaignsObj = page.campaigns || page.records || {};

  return (
    <div className="irr-page">
      <IrrigationBreadcrumb section="Irrigation Institutions Management" title="Scheme Maintenance & Canal Cleaning (የመስኖ ቦይ ጥገና እና ፅዳት)" />

      <LoadErrorAlert error={campaignsObj.error} onRetry={page.reload} />

      <IrrigationStatsSection onRefresh={page.reload} loading={campaignsObj.loading}>
        <MaintenanceStats stats={page.stats} />
      </IrrigationStatsSection>

      <IrrigationPageHeader
        section="Irrigation Institutions Management"
        title="Scheme Maintenance & Canal Cleaning (የመስኖ ቦይ ጥገና እና ፅዳት)"
        subtitle="Annual desilting campaigns, community labor mobilization, canal breach repairs, and gate lubrication logs"
        fiscalYear={page.fiscalYear}
        onFiscalYearChange={page.setFiscalYear}
        onRefresh={page.reload}
        loading={campaignsObj.loading}
      >
        <MaintenanceFilters
          searchTerm={page.searchTerm}
          onSearchChange={page.setSearchTerm}
          canalTypeFilter={page.canalTypeFilter}
          onCanalTypeChange={page.setCanalTypeFilter}
          statusFilter={page.statusFilter}
          onStatusChange={page.setStatusFilter}
          onExport={page.exportCsv}
          onCreate={() => setFormState({ open: true, record: null })}
        />
      </IrrigationPageHeader>

      <MaintenanceTable
        data={page.filteredRecords}
        loading={campaignsObj.loading}
        onView={setDossierRecord}
        onEdit={(record) => setFormState({ open: true, record })}
        onDelete={page.deleteCampaign}
        onStatusChange={page.changeStatus}
        onOpenWua={page.openWua}
      />

      <MaintenanceCanalChart data={page.chartData} />

      <MaintenanceFormModal
        open={formState.open}
        editingRecord={formState.record}
        schemes={page.schemes?.records || []}
        fiscalYear={page.fiscalYear}
        findScheme={page.findScheme}
        nextCode={`MNT-${page.fiscalYear.slice(0, 4)}-${String((campaignsObj.records || []).length + 1).padStart(3, '0')}`}
        onCancel={() => setFormState({ open: false, record: null })}
        onSubmit={(values, form) => page.saveCampaign(values, formState.record, form)}
      />

      <MaintenanceDossierModal
        record={dossierRecord}
        onClose={() => setDossierRecord(null)}
        onOpenWua={page.openWua}
      />
    </div>
  );
}

export default function SchemeMaintenanceCleaningManagement() {
  return (
    <App>
      <SchemeMaintenanceCleaningContent />
    </App>
  );
}
