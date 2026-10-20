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
import UtilizationStats, { UtilizationChart } from './IrrigatedLandUtilizationStats';
import UtilizationFilters from './IrrigatedLandUtilizationFilters';
import UtilizationTable from './IrrigatedLandUtilizationTable';
import UtilizationFormModal from './IrrigatedLandUtilizationForm';
import UtilizationDossierModal from './IrrigatedLandUtilizationDetail';

/* --- Cropping Rounds (Excel Aligned; IrrigationEnums::CROPPING_ROUNDS) --- */
export const CROPPING_ROUNDS = [
  { value: 'Round 1 (1ኛ ዙር)', label: 'Round 1 (1ኛ ዙር - Main Bega Irrigation)' },
  { value: 'Round 2 (2ኛ ዙር)', label: 'Round 2 (2ኛ ዙር - Mid-Season Cropping)' },
  { value: 'Round 3 (3ኛ ዙር)', label: 'Round 3 (3ኛ ዙር - Pre-Meher Supplemental)' },
];

/* --- Scheme Land Modality (Excel Aligned: በነባር vs በአዲስ) --- */
export const SCHEME_LAND_MODALITIES = [
  { value: 'Existing Scheme Land (በነባር)', label: 'Existing Scheme Land (በነባር የሚለማ)', color: 'default' },
  { value: 'New Scheme Land (በአዲስ)', label: 'New Scheme Land (በአዲስ የሚለማ)', color: 'green' },
];

/* --- Command Expansion Network (Excel Aligned: በዘመናዊ vs በባህላዊ) --- */
export const EXPANSION_METHODS = [
  { value: 'Modern Conveyance Expansion (በዘመናዊ አውታር)', label: 'Modern Conveyance Expansion (በዘመናዊ አውታር)', color: 'default' },
  { value: 'Traditional Diversion Expansion (በባህላዊ ጠለፋ)', label: 'Traditional Diversion Expansion (በባህላዊ ጠለፋ)', color: 'gold' },
  { value: 'No Expansion (Standard In-Command)', label: 'No Expansion (Standard In-Command Area)', color: 'default' },
];

/* --- Water Availability / Adequacy Statuses --- */
export const WATER_ADEQUACY_STATUSES = [
  { value: 'Optimal Water Supply', label: 'Optimal Water Supply (100% Demand Met)', color: 'success' },
  { value: 'Moderate Water Stress', label: 'Moderate Water Stress (Rotational Roster)', color: 'warning' },
  { value: 'Critical Water Deficit', label: 'Critical Water Deficit (Low Streamflow)', color: 'error' },
];

/** Defaults for a newly logged utilization record. */
export const NEW_RECORD_DEFAULTS = {
  cropping_round: CROPPING_ROUNDS[0].value,
  land_modality: 'New Scheme Land (በአዲስ)',
  expansion_method: EXPANSION_METHODS[0].value,
  planned_command_ha: 100,
  actual_irrigated_ha: 100,
  expansion_area_ha: 0,
  farmers_male: 80,
  farmers_female: 25,
};

export const CONSTRUCTION_PROJECTS_PATH = '/irrigation/construction/projects';



const COLUMNS = [
  ['Log Code', (r) => r.utilization_code],
  ['Scheme Code', (r) => r.scheme_code],
  ['Scheme Name', (r) => r.scheme_name],
  ['Round', (r) => r.cropping_round],
  ['Modality', (r) => r.land_modality],
  ['Expansion Method', (r) => r.expansion_method],
  ['Planned (Ha)', (r) => toNumber(r.planned_command_ha)],
  ['Actual Irrigated (Ha)', (r) => toNumber(r.actual_irrigated_ha)],
  ['Expansion (Ha)', (r) => toNumber(r.expansion_area_ha)],
  ['Effective Total (Ha)', (r) => toNumber(r.total_effective_irrigated_ha)],
  ['Male Farmers', (r) => toNumber(r.farmers_male)],
  ['Female Farmers', (r) => toNumber(r.farmers_female)],
  ['Total Farmers', (r) => toNumber(r.farmers_male) + toNumber(r.farmers_female)],
  ['Water Adequacy', (r) => r.water_adequacy_status],
  ['Crops', (r) => r.dominant_crops],
  ['Date', (r) => r.reporting_ethiopian_date],
  ['Zone', (r) => extractName(r.zone)],
  ['Woreda', (r) => extractName(r.woreda)],
];

export const exportUtilizationLedger = (rows) => exportRowsToCsv(rows, COLUMNS, 'Irrigated_Land_Utilization_Ledger');



const isExisting = (r) => Boolean(r.land_modality?.includes('Existing') || r.land_modality?.includes('በነባር'));
const isNew = (r) => Boolean(r.land_modality?.includes('New') || r.land_modality?.includes('በአዲስ'));

/**
 * State and server interaction for the irrigated land & seasonal utilization
 * ledger: loading, filters, KPIs, chart data and create / update / status / delete.
 */
function useIrrigatedLandUtilization() {
  const { message } = App.useApp();

  const [fiscalYear, setFiscalYear] = useState(CURRENT_FISCAL_YEAR);
  const [searchTerm, setSearchTerm] = useState('');
  const [roundFilter, setRoundFilter] = useState(null);
  const [modalityFilter, setModalityFilter] = useState(null);
  const [adequacyFilter, setAdequacyFilter] = useState(null);

  const records = useIrrigationRecords(irrigationApi.irrigatedArea, { fiscalYear });
  // Candidate schemes for the scheme AutoComplete (construction contracts, incl. wua_name).
  const schemes = useIrrigationRecords(irrigationApi.constructionProjects, { fiscalYear });

  const filteredRecords = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return records.records.filter((r) => {
      const haystack = [r.utilization_code, r.scheme_code, r.scheme_name, r.wua_name, r.dominant_crops, r.zone, r.woreda]
        .map((v) => extractName(v, '').toLowerCase());
      return (
        haystack.some((v) => v.includes(q))
        && (!roundFilter || r.cropping_round === roundFilter)
        && (!modalityFilter || r.land_modality === modalityFilter)
        && (!adequacyFilter || r.water_adequacy_status === adequacyFilter)
      );
    });
  }, [records.records, searchTerm, roundFilter, modalityFilter, adequacyFilter]);

  const stats = useMemo(() => {
    const totalActualIrrigatedHa = sumBy(filteredRecords, 'actual_irrigated_ha');
    const totalExpansionHa = sumBy(filteredRecords, 'expansion_area_ha');
    const totalMale = sumBy(filteredRecords, 'farmers_male');
    const totalFemale = sumBy(filteredRecords, 'farmers_female');
    return {
      totalSchemes: filteredRecords.length,
      totalPlannedHa: sumBy(filteredRecords, 'planned_command_ha'),
      totalActualIrrigatedHa,
      totalExpansionHa,
      grandEffectiveHa: totalActualIrrigatedHa + totalExpansionHa,
      existingLandHa: sumBy(filteredRecords.filter(isExisting), 'actual_irrigated_ha'),
      newLandHa: sumBy(filteredRecords.filter(isNew), 'actual_irrigated_ha'),
      totalFarmers: totalMale + totalFemale,
      totalMale,
      totalFemale,
      femaleSharePct: percent(totalFemale, totalMale + totalFemale),
    };
  }, [filteredRecords]);

  const chartData = useMemo(() => filteredRecords.map((r) => {
    const name = extractName(r.scheme_name, '');
    return {
      name: name.length > 14 ? `${name.substring(0, 14)}...` : name,
      irrigatedHa: toNumber(r.actual_irrigated_ha),
      expansionHa: toNumber(r.expansion_area_ha),
    };
  }), [filteredRecords]);

  /** Create or update; resolves true when the server accepted the record. */
  const saveRecord = async (values, editingRecord, form) => {
    try {
      if (editingRecord) {
        await records.update(editingRecord.id, values);
        message.success('Irrigated land seasonal utilization record updated successfully');
      } else {
        await records.create(values);
        message.success('New seasonal land utilization record logged successfully');
      }
      return true;
    } catch (err) {
      notifyApiError(message, err, 'Failed to save record', form);
      return false;
    }
  };

  const changeAdequacy = async (record, status) => {
    try {
      await records.patch(record.id, { water_adequacy_status: status });
      message.success(`Water adequacy status updated to "${status}"`);
    } catch (err) {
      notifyApiError(message, err, 'Failed to update water adequacy status');
    }
  };

  const deleteRecord = async (record) => {
    try {
      await records.remove(record.id);
      message.success('Utilization record removed');
    } catch (err) {
      notifyApiError(message, err, 'Failed to delete utilization record');
    }
  };

  const exportCsv = () => {
    if (!filteredRecords.length) {
      message.warning('No records available to export');
      return;
    }
    exportUtilizationLedger(filteredRecords);
    message.success('Seasonal land utilization ledger exported successfully');
  };

  const reload = () => {
    records.reload();
    schemes.reload();
  };

  /** Matching construction contract for a scheme name typed/selected in the form. */
  const findScheme = (schemeName) => schemes.records.find(
    (s) => extractName(s.scheme_name, '').toLowerCase() === (schemeName || '').toLowerCase()
  );

  const navigate = useNavigate();
  const openScheme = (record) => {
    navigate('/irrigation/construction/projects', {
      state: { filterContractCode: record?.scheme_code },
    });
  };

  return {
    fiscalYear,
    setFiscalYear,
    searchTerm,
    setSearchTerm,
    roundFilter,
    setRoundFilter,
    modalityFilter,
    setModalityFilter,
    adequacyFilter,
    setAdequacyFilter,
    records,
    schemes,
    filteredRecords,
    stats,
    chartData,
    reload,
    saveRecord,
    changeAdequacy,
    deleteRecord,
    exportCsv,
    findScheme,
    openScheme,
  };
}


/** Irrigated Land Utilization by Typology (Irrigation Water Utilization). */
function IrrigatedLandUtilizationContent() {
  const page = useIrrigatedLandUtilization();

  const [formState, setFormState] = useState({ open: false, record: null });
  const [dossierRecord, setDossierRecord] = useState(null);

  const recordsObj = page.records || {};

  return (
    <div className="irr-page">
      <IrrigationBreadcrumb section="Irrigation Water Utilization" title="Irrigated Land Utilization (የመስኖ መሬት አጠቃቀም)" />

      <LoadErrorAlert error={recordsObj.error} onRetry={page.reload} />

      <IrrigationStatsSection onRefresh={page.reload} loading={recordsObj.loading}>
        <UtilizationStats stats={page.stats} />
      </IrrigationStatsSection>

      <IrrigationPageHeader
        section="Irrigation Water Utilization"
        title="Irrigated Land Utilization (የመስኖ መሬት አጠቃቀም)"
        subtitle="Smallholder community, modern commercial and medium/large irrigation schemes across traditional & improved typologies"
        fiscalYear={page.fiscalYear}
        onFiscalYearChange={page.setFiscalYear}
        onRefresh={page.reload}
        loading={recordsObj.loading}
      >
        <UtilizationFilters
          searchTerm={page.searchTerm}
          onSearchChange={page.setSearchTerm}
          roundFilter={page.roundFilter}
          onRoundChange={page.setRoundFilter}
          modalityFilter={page.modalityFilter}
          onModalityChange={page.setModalityFilter}
          adequacyFilter={page.adequacyFilter}
          onAdequacyChange={page.setAdequacyFilter}
          onExport={page.exportCsv}
          onCreate={() => setFormState({ open: true, record: null })}
        />
      </IrrigationPageHeader>

      <UtilizationTable
        data={page.filteredRecords}
        loading={recordsObj.loading}
        onView={setDossierRecord}
        onEdit={(record) => setFormState({ open: true, record })}
        onDelete={page.deleteRecord}
        onAdequacyChange={page.changeAdequacy}
        onOpenScheme={page.openScheme}
      />

      <UtilizationChart data={page.chartData} />

      <UtilizationFormModal
        open={formState.open}
        editingRecord={formState.record}
        schemes={page.schemes?.records || []}
        fiscalYear={page.fiscalYear}
        findScheme={page.findScheme}
        nextCode={`UTL-${page.fiscalYear.slice(0, 4)}-${String((recordsObj.records || []).length + 1).padStart(3, '0')}`}
        onCancel={() => setFormState({ open: false, record: null })}
        onSubmit={(values, form) => page.saveRecord(values, formState.record, form)}
      />

      <UtilizationDossierModal record={dossierRecord} onClose={() => setDossierRecord(null)} />
    </div>
  );
}

export default function IrrigatedLandUtilizationManagement() {
  return (
    <App>
      <IrrigatedLandUtilizationContent />
    </App>
  );
}
