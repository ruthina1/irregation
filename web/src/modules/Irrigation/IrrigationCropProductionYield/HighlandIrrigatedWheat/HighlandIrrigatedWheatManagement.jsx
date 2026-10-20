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
import WheatStats, { WheatCharts } from './HighlandIrrigatedWheatStats';
import WheatFilters from './HighlandIrrigatedWheatFilters';
import WheatTable from './HighlandIrrigatedWheatTable';
import WheatFormModal from './HighlandIrrigatedWheatForm';
import WheatDossierModal from './HighlandIrrigatedWheatDetail';

/* --- Strategic Highland Wheat Seed Varieties --- */
export const WHEAT_VARIETIES = [
  'Kakaba (ቀቀባ)',
  'Danda’a (ዳንዳዓ)',
  'Kingbird (ኪንግበርድ)',
  'Ogolcho (ኦጎልቾ)',
  'Hidase (ህዳሴ)',
  'Lemu (ለሙ)',
];

/* --- Cropping Campaign Rounds (Excel Aligned) --- */
export const WHEAT_ROUNDS = [
  { value: 'Round 1 (1ኛ ዙር)', label: 'Round 1 (1ኛ ዙር - Main Bega Dry Season)' },
  { value: 'Round 2 (2ኛ ዙር)', label: 'Round 2 (2ኛ ዙር - Mid-Season Intensive)' },
  { value: 'Round 3 (3ኛ ዙር)', label: 'Round 3 (3ኛ ዙር - Pre-Meher Supplemental)' },
];

/* --- Harvesting & Field Verification Status --- */
export const WHEAT_STATUSES = [
  { value: 'Harvest Weighed & Warehoused', label: 'Harvest Weighed & Warehoused', color: 'success' },
  { value: 'Grain Ripening / Maturing', label: 'Grain Ripening / Dough Stage', color: 'processing' },
  { value: 'Tillering & Stem Elongation', label: 'Tillering & Vegetative Growth', color: 'default' },
  { value: 'Yield Loss Reported', label: 'Yield Loss / Rust Infestation', color: 'error' },
];

export const VARIETY_COLORS = ['#a16207', '#5b8a6b', '#2f7d4a', '#64748b', '#64748b', '#64748b'];

/** Defaults for a new wheat cluster record. */
export const NEW_RECORD_DEFAULTS = {
  cropping_round: 'Round 1 (1ኛ ዙር)',
  wheat_variety: 'Danda’a (ዳንዳዓ)',
  wheat_command_ha: 200,
  expected_yield_qt: 8400,
  farmers_male: 180,
  farmers_female: 55,
  mechanized_harvesting: true,
};



const COLUMNS = [
  ['Initiative Code', (r) => r.initiative_code],
  ['Scheme Code', (r) => r.scheme_code],
  ['Scheme Name', (r) => r.scheme_name],
  ['Cluster Code', (r) => r.cluster_block_code],
  ['Round', (r) => r.cropping_round],
  ['Variety', (r) => r.wheat_variety],
  ['Command Area (Ha)', (r) => toNumber(r.wheat_command_ha)],
  ['Yield (Quintals)', (r) => toNumber(r.expected_yield_qt)],
  ['Productivity (Qt/Ha)', (r) => toNumber(r.productivity_qt_ha)],
  ['Male Farmers', (r) => toNumber(r.farmers_male)],
  ['Female Farmers', (r) => toNumber(r.farmers_female)],
  ['Total Farmers', (r) => toNumber(r.farmers_male) + toNumber(r.farmers_female)],
  ['Mechanized', (r) => (r.mechanized_harvesting ? 'Yes' : 'No')],
  ['Status', (r) => r.verification_status],
  ['Date', (r) => r.field_survey_eth_date],
  ['Zone', (r) => extractName(r.zone)],
  ['Woreda', (r) => extractName(r.woreda)],
];

export const exportHighlandWheat = (rows) => exportRowsToCsv(rows, COLUMNS, 'Highland_Irrigated_Wheat_Ledger');



/**
 * State and server interaction for the Highland Irrigated Wheat Initiative ledger:
 * loading, filters, KPI statistics, chart data and create / update / status / delete.
 */
function useHighlandWheat() {
  const { message } = App.useApp();

  const [fiscalYear, setFiscalYear] = useState(CURRENT_FISCAL_YEAR);
  const [searchTerm, setSearchTerm] = useState('');
  const [roundFilter, setRoundFilter] = useState(null);
  const [varietyFilter, setVarietyFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);

  const ledger = useIrrigationRecords(irrigationApi.highlandWheat, { fiscalYear });
  // Registered schemes for the scheme autocomplete (construction contracts of every year,
  // since a scheme built in an earlier fiscal year still grows wheat this year).
  const schemes = useIrrigationRecords(irrigationApi.constructionProjects);

  const filteredRecords = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return ledger.records.filter((r) => {
      const haystack = [r.initiative_code, r.scheme_code, r.scheme_name, r.wheat_variety, r.cluster_block_code, r.zone, r.woreda]
        .map((v) => extractName(v, '').toLowerCase());
      return (
        haystack.some((v) => v.includes(q))
        && (!roundFilter || r.cropping_round === roundFilter)
        && (!varietyFilter || r.wheat_variety === varietyFilter)
        && (!statusFilter || r.verification_status === statusFilter)
      );
    });
  }, [ledger.records, searchTerm, roundFilter, varietyFilter, statusFilter]);

  const stats = useMemo(() => {
    const totalWheatCommandHa = sumBy(filteredRecords, 'wheat_command_ha');
    const totalHarvestQuintals = sumBy(filteredRecords, 'expected_yield_qt');
    const totalMale = sumBy(filteredRecords, 'farmers_male');
    const totalFemale = sumBy(filteredRecords, 'farmers_female');
    return {
      totalClusters: filteredRecords.length,
      totalWheatCommandHa,
      totalHarvestQuintals,
      avgProductivity: totalWheatCommandHa > 0 ? (totalHarvestQuintals / totalWheatCommandHa).toFixed(1) : '0.0',
      totalMale,
      totalFemale,
      totalFarmers: totalMale + totalFemale,
      femaleSharePct: percent(totalFemale, totalMale + totalFemale),
      mechanizedClusters: filteredRecords.filter((r) => r.mechanized_harvesting).length,
    };
  }, [filteredRecords]);

  // Bar chart: harvest output per cluster (quintals).
  const chartData = useMemo(() => filteredRecords.map((r) => ({
    name: r.cluster_block_code || (r.scheme_name || '').substring(0, 14),
    yieldQt: toNumber(r.expected_yield_qt),
    areaHa: toNumber(r.wheat_command_ha),
  })), [filteredRecords]);

  // Pie chart: command area by seed variety (ha).
  const varietyShareData = useMemo(() => {
    const map = {};
    filteredRecords.forEach((r) => {
      const v = r.wheat_variety?.split('(')[0]?.trim() || 'Other';
      map[v] = (map[v] || 0) + toNumber(r.wheat_command_ha);
    });
    return Object.entries(map).map(([name, value], i) => ({ name, value, color: VARIETY_COLORS[i % VARIETY_COLORS.length] }));
  }, [filteredRecords]);

  /** Create or update; resolves true when the server accepted the record. */
  const saveRecord = async (values, editingRecord, form) => {
    const payload = { ...values, mechanized_harvesting: Boolean(values.mechanized_harvesting) };
    try {
      if (editingRecord) {
        await ledger.update(editingRecord.id, payload);
        message.success('Highland irrigated wheat record updated successfully');
      } else {
        await ledger.create(payload);
        message.success('New highland irrigated wheat cluster registered successfully');
      }
      return true;
    } catch (err) {
      notifyApiError(message, err, 'Failed to save wheat cluster record', form);
      return false;
    }
  };

  const changeStatus = async (record, verificationStatus) => {
    try {
      await ledger.patch(record.id, { verification_status: verificationStatus });
      message.success(`Wheat initiative status updated to "${verificationStatus}"`);
    } catch (err) {
      notifyApiError(message, err, 'Failed to update verification status');
    }
  };

  const toggleMechanized = async (record, mechanized) => {
    try {
      await ledger.patch(record.id, { mechanized_harvesting: mechanized });
      message.success(mechanized ? 'Marked as combine harvested' : 'Marked as manual (sickle) harvest');
    } catch (err) {
      notifyApiError(message, err, 'Failed to update harvesting method');
    }
  };

  const deleteRecord = async (record) => {
    try {
      await ledger.remove(record.id);
      message.success('Record removed');
    } catch (err) {
      notifyApiError(message, err, 'Failed to delete wheat cluster record');
    }
  };

  const exportCsv = () => {
    if (!filteredRecords.length) {
      message.warning('No records available to export');
      return;
    }
    exportHighlandWheat(filteredRecords);
    message.success('Wheat initiative ledger exported successfully');
  };

  const findScheme = (schemeName) => schemes.records.find(
    (s) => extractName(s.scheme_name, '').toLowerCase() === (schemeName || '').toLowerCase()
  );

  const openSeasonal = () => navigate('/irrigation/production/seasonal-production');

  return {
    fiscalYear, setFiscalYear,
    searchTerm, setSearchTerm,
    roundFilter, setRoundFilter,
    varietyFilter, setVarietyFilter,
    statusFilter, setStatusFilter,
    ledger,
    records: ledger,
    reload: ledger.reload,
    schemes: schemes.records,
    schemesError: schemes.error,
    filteredRecords,
    stats,
    chartData,
    varietyShareData,
    saveRecord,
    changeStatus,
    toggleMechanized,
    deleteRecord,
    exportCsv,
    findScheme,
    openSeasonal,
  };
}


/** Highland Irrigated Wheat Initiative (Irrigation Crop Production & Yield). */
function HighlandIrrigatedWheatContent() {
  const navigate = useNavigate();
  const page = useHighlandWheat();

  const [formState, setFormState] = useState({ open: false, record: null });
  const [dossierRecord, setDossierRecord] = useState(null);

  const recordsObj = page.records || page.ledger || {};

  return (
    <div className="irr-page">
      <IrrigationBreadcrumb section="Irrigation Crop Production & Yield" title="Highland Irrigated Wheat (የደጋ የመስኖ ስንዴ ልማት)" />

      <LoadErrorAlert error={recordsObj.error} onRetry={page.reload} />

      <IrrigationStatsSection onRefresh={page.reload} loading={recordsObj.loading}>
        <WheatStats stats={page.stats} />
      </IrrigationStatsSection>

      <IrrigationPageHeader
        section="Irrigation Crop Production & Yield"
        title="Highland Irrigated Wheat (የደጋ የመስኖ ስንዴ ልማት)"
        subtitle="National food security flagship initiative: certified seeds, NPS/Urea fertilizers, mechanized harvesting, and productivity benchmarking"
        fiscalYear={page.fiscalYear}
        onFiscalYearChange={page.setFiscalYear}
        onRefresh={page.reload}
        loading={recordsObj.loading}
      >
        <WheatFilters
          searchTerm={page.searchTerm}
          onSearchChange={page.setSearchTerm}
          variety={page.varietyFilter}
          onVarietyChange={page.setVarietyFilter}
          harvestMethod={page.harvestFilter}
          onHarvestMethodChange={page.setHarvestFilter}
          onExport={page.exportCsv}
          onCreate={() => setFormState({ open: true, record: null })}
        />
      </IrrigationPageHeader>

      <WheatTable
        data={page.filteredRecords}
        loading={recordsObj.loading}
        onView={setDossierRecord}
        onEdit={(record) => setFormState({ open: true, record })}
        onDelete={page.deleteRecord}
        onStatusChange={page.changeStatus}
        onToggleMechanized={page.toggleMechanized}
        onOpenSeasonal={page.openSeasonal}
      />

      <WheatCharts clusterData={page.chartData} varietyData={page.varietyShareData} />

      <WheatFormModal
        open={formState.open}
        editingRecord={formState.record}
        schemes={page.schemes}
        fiscalYear={page.fiscalYear}
        nextCode={`WHT-${page.fiscalYear.slice(0, 4)}-${String((recordsObj.records || []).length + 1).padStart(3, '0')}`}
        onCancel={() => setFormState({ open: false, record: null })}
        onSubmit={(values, form) => page.saveRecord(values, formState.record, form)}
      />

      <WheatDossierModal
        record={dossierRecord}
        onClose={() => setDossierRecord(null)}
        onOpenSeasonal={page.openSeasonal}
      />
    </div>
  );
}

export default function HighlandIrrigatedWheatManagement() {
  return (
    <App>
      <HighlandIrrigatedWheatContent />
    </App>
  );
}
