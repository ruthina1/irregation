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
import SeasonalStats, { SeasonalCharts } from './SeasonalCropProductionYieldStats';
import SeasonalFilters from './SeasonalCropProductionYieldFilters';
import SeasonalTable from './SeasonalCropProductionYieldTable';
import SeasonalFormModal from './SeasonalCropProductionYieldForm';
import SeasonalDossierModal from './SeasonalCropProductionYieldDetail';

/* --- Cropping Rounds (100% Excel Aligned) --- */
export const CROPPING_ROUNDS = [
  { value: 'Round 1 (1ኛ ዙር)', label: 'Round 1 (1ኛ ዙር - Main Bega Dry Season)', color: 'default' },
  { value: 'Round 2 (2ኛ ዙር)', label: 'Round 2 (2ኛ ዙር - Mid-Season Cropping)', color: 'default' },
  { value: 'Round 3 (3ኛ ዙር)', label: 'Round 3 (3ኛ ዙር - Pre-Meher Supplemental)', color: 'default' },
];

/* --- Crop Domain Categories (100% Excel Aligned) --- */
export const CROP_CATEGORIES = [
  { value: 'Cereals (አዝርዕት)', label: 'Cereals (አዝርዕት - Wheat, Maize, Teff, Rice)', color: 'gold' },
  { value: 'Pulses (ጥራጥሬ)', label: 'Pulses (ጥራጥሬ - Chickpea, Lentil, Faba Bean)', color: 'green' },
  { value: 'Vegetables (አትክልት)', label: 'Vegetables (አትክልት - Onion, Tomato, Potato, Pepper)', color: 'volcano' },
  { value: 'Spices (ቅመማ ቅመም)', label: 'Spices (ቅመማ ቅመም - Garlic, Ginger, Fenugreek)', color: 'default' },
  { value: 'Fruits (ፍራፍሬ)', label: 'Fruits (ፍራፍሬ - Avocado, Mango, Apple, Papaya)', color: 'orange' },
];

/* --- Specific Crop Catalog by Category (suggestions; free text allowed) --- */
export const CROP_CATALOG_GROUPS = [
  { category: 'Cereals (አዝርዕት)', crops: ['Highland Irrigated Wheat (የደጋ ስንዴ)', 'Lowland Wheat (የቆላ ስንዴ)', 'Hybrid Maize (በቆሎ)', 'Irrigated Teff (ጤፍ)', 'Barley (ገብስ)', 'Lowland Rice (ሩዝ)'] },
  { category: 'Pulses (ጥራጥሬ)', crops: ['Chickpea (ሽንብራ)', 'Lentils (ምስር)', 'Faba Bean (ባቄላ)', 'Haricot Bean (ቦሎቄ)', 'Soybean (አኩሪ አተር)'] },
  { category: 'Vegetables (አትክልት)', crops: ['Red Onion (ቀይ ሽንኩርት)', 'Tomato (ቲማቲም)', 'Potato (ድንች)', 'Green Pepper (ቃሪያ/በርበሬ)', 'Cabbage (ጎመን)', 'Carrot (ካሮት)'] },
  { category: 'Spices (ቅመማ ቅመም)', crops: ['Garlic (ነጭ ሽንኩርት)', 'Ginger (ዝንጅብል)', 'Fenugreek (አብሽ)', 'Black Cumin (ጥቁር አዝሙድ)'] },
  { category: 'Fruits (ፍራፍሬ)', crops: ['Highland Apple (ፖም)', 'Avocado (አቮካዶ)', 'Mango (ማንጎ)', 'Papaya (ፓፓያ)', 'Orange / Citrus (ብርቱካን)'] },
];

/* --- Harvest Verification Statuses --- */
export const HARVEST_STATUSES = [
  { value: 'Harvest Completed & Weighed', label: 'Harvest Completed & Weighed', color: 'success' },
  { value: 'Field Stand Verified', label: 'Field Stand Verified (Pre-Harvest Estimate)', color: 'processing' },
  { value: 'Vegetative / Grain Filling', label: 'Vegetative / Grain Filling Stage', color: 'default' },
  { value: 'Yield Loss Reported', label: 'Yield Loss Reported (Frost/Pest/Disease)', color: 'error' },
];

export const CATEGORY_COLORS = ['#a16207', '#2f7d4a', '#b42318', '#64748b', '#64748b'];

/** Defaults for a new harvest record. */
export const NEW_RECORD_DEFAULTS = {
  cropping_round: 'Round 1 (1ኛ ዙር)',
  crop_category: 'Cereals (አዝርዕት)',
  specific_crop: 'Highland Irrigated Wheat (የደጋ ስንዴ)',
  cultivated_area_ha: 100,
  production_yield_quintals: 4000,
  productivity_qt_per_ha: 40.0,
  farmers_male: 80,
  farmers_female: 25,
};



const COLUMNS = [
  ['Production Code', (r) => r.production_code],
  ['Scheme Code', (r) => r.scheme_code],
  ['Scheme Name', (r) => r.scheme_name],
  ['Round', (r) => r.cropping_round],
  ['Category', (r) => r.crop_category],
  ['Specific Crop', (r) => r.specific_crop],
  ['Cultivated (Ha)', (r) => toNumber(r.cultivated_area_ha)],
  ['Yield (Quintals)', (r) => toNumber(r.production_yield_quintals)],
  ['Productivity (Qt/Ha)', (r) => toNumber(r.productivity_qt_per_ha)],
  ['Male Farmers', (r) => toNumber(r.farmers_male)],
  ['Female Farmers', (r) => toNumber(r.farmers_female)],
  ['Total Farmers', (r) => toNumber(r.farmers_male) + toNumber(r.farmers_female)],
  ['Status', (r) => r.harvest_status],
  ['Date', (r) => r.survey_ethiopian_date],
  ['Zone', (r) => extractName(r.zone)],
  ['Woreda', (r) => extractName(r.woreda)],
];

export const exportSeasonalProduction = (rows) => exportRowsToCsv(rows, COLUMNS, 'Irrigation_Crop_Production_Yield');



/**
 * State and server interaction for the Seasonal Production & Yield ledger:
 * loading, filters, KPI statistics, chart data and create / update / status / delete.
 */
function useSeasonalProduction() {
  const { message } = App.useApp();

  const [fiscalYear, setFiscalYear] = useState(CURRENT_FISCAL_YEAR);
  const [searchTerm, setSearchTerm] = useState('');
  const [roundFilter, setRoundFilter] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);

  const ledger = useIrrigationRecords(irrigationApi.seasonalProduction, { fiscalYear });
  // Registered schemes for the scheme autocomplete (construction contracts of every year,
  // since a scheme built in an earlier fiscal year still produces crops this year).
  const schemes = useIrrigationRecords(irrigationApi.constructionProjects);

  const filteredRecords = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return ledger.records.filter((r) => {
      const haystack = [r.production_code, r.scheme_code, r.scheme_name, r.specific_crop, r.crop_category, r.zone, r.woreda]
        .map((v) => extractName(v, '').toLowerCase());
      return (
        haystack.some((v) => v.includes(q))
        && (!roundFilter || r.cropping_round === roundFilter)
        && (!categoryFilter || r.crop_category === categoryFilter)
        && (!statusFilter || r.harvest_status === statusFilter)
      );
    });
  }, [ledger.records, searchTerm, roundFilter, categoryFilter, statusFilter]);

  const stats = useMemo(() => {
    const totalCultivatedHa = sumBy(filteredRecords, 'cultivated_area_ha');
    const totalProductionQuintals = sumBy(filteredRecords, 'production_yield_quintals');
    const totalMale = sumBy(filteredRecords, 'farmers_male');
    const totalFemale = sumBy(filteredRecords, 'farmers_female');
    return {
      totalRecords: filteredRecords.length,
      totalCultivatedHa,
      totalProductionQuintals,
      avgProductivityQtHa: totalCultivatedHa > 0 ? (totalProductionQuintals / totalCultivatedHa).toFixed(1) : '0.0',
      totalMale,
      totalFemale,
      totalFarmers: totalMale + totalFemale,
      femaleSharePct: percent(totalFemale, totalMale + totalFemale),
    };
  }, [filteredRecords]);

  // Bar chart: production yield by crop (quintals).
  const chartCropData = useMemo(() => {
    const map = {};
    filteredRecords.forEach((r) => {
      const key = (r.specific_crop || 'Unspecified').split('(')[0].trim();
      map[key] = (map[key] || 0) + (Number(r.production_yield_quintals) || 0);
    });
    return Object.entries(map).map(([name, yieldQt]) => ({
      name: name.length > 14 ? `${name.substring(0, 14)}...` : name,
      yieldQt,
    }));
  }, [filteredRecords]);

  // Pie chart: cultivated land share by crop category (ha).
  const categoryShareData = useMemo(() => {
    const map = {};
    filteredRecords.forEach((r) => {
      const key = (r.crop_category || 'Unspecified').split('(')[0].trim();
      map[key] = (map[key] || 0) + (Number(r.cultivated_area_ha) || 0);
    });
    return Object.entries(map).map(([name, value], i) => ({ name, value, color: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }));
  }, [filteredRecords]);

  /** Create or update; resolves true when the server accepted the record. */
  const saveRecord = async (values, editingRecord, form) => {
    try {
      if (editingRecord) {
        await ledger.update(editingRecord.id, values);
        message.success('Seasonal crop production record updated successfully');
      } else {
        await ledger.create(values);
        message.success('New seasonal crop harvest record registered successfully');
      }
      return true;
    } catch (err) {
      notifyApiError(message, err, 'Failed to save production record', form);
      return false;
    }
  };

  const changeStatus = async (record, harvestStatus) => {
    try {
      await ledger.patch(record.id, { harvest_status: harvestStatus });
      message.success(`Harvest status updated to "${harvestStatus}"`);
    } catch (err) {
      notifyApiError(message, err, 'Failed to update harvest status');
    }
  };

  const deleteRecord = async (record) => {
    try {
      await ledger.remove(record.id);
      message.success('Production record removed');
    } catch (err) {
      notifyApiError(message, err, 'Failed to delete production record');
    }
  };

  const exportCsv = () => {
    if (!filteredRecords.length) {
      message.warning('No production records available to export');
      return;
    }
    exportSeasonalProduction(filteredRecords);
    message.success('Production yield ledger exported successfully');
  };

  const findScheme = (schemeName) => schemes.records.find(
    (s) => extractName(s.scheme_name, '').toLowerCase() === (schemeName || '').toLowerCase()
  );
  const openWheat = () => navigate('/irrigation/production/summer-wheat');

  return {
    fiscalYear, setFiscalYear,
    searchTerm, setSearchTerm,
    roundFilter, setRoundFilter,
    categoryFilter, setCategoryFilter,
    statusFilter, setStatusFilter,
    ledger,
    records: ledger,
    reload: ledger.reload,
    schemes: schemes.records,
    schemesError: schemes.error,
    filteredRecords,
    stats,
    chartCropData,
    categoryShareData,
    chartData: chartCropData,
    saveRecord,
    changeStatus,
    deleteRecord,
    exportCsv,
    findScheme,
    openWheat,
  };
}


/** Seasonal Crop Production & Yield (Irrigation Crop Production & Yield). */
function SeasonalCropProductionYieldContent() {
  const navigate = useNavigate();
  const page = useSeasonalProduction();

  const [formState, setFormState] = useState({ open: false, record: null });
  const [dossierRecord, setDossierRecord] = useState(null);

  const recordsObj = page.records || page.ledger || {};

  return (
    <div className="irr-page">
      <IrrigationBreadcrumb section="Irrigation Crop Production & Yield" title="Seasonal Crop Production & Yield (የወቅቱ የመስኖ ሰብል ምርት እና ምርታማነት)" />

      <LoadErrorAlert error={recordsObj.error} onRetry={page.reload} />

      <IrrigationStatsSection onRefresh={page.reload} loading={recordsObj.loading}>
        <SeasonalStats stats={page.stats} />
      </IrrigationStatsSection>

      <IrrigationPageHeader
        section="Irrigation Crop Production & Yield"
        title="Seasonal Crop Production & Yield (የወቅቱ የመስኖ ሰብል ምርት እና ምርታማነት)"
        subtitle="Harvest rounds (1st, 2nd, 3rd, off-season), crop typology productivity (Quintals/Ha), and smallholder beneficiary tracking"
        fiscalYear={page.fiscalYear}
        onFiscalYearChange={page.setFiscalYear}
        onRefresh={page.reload}
        loading={recordsObj.loading}
      >
        <SeasonalFilters
          searchTerm={page.searchTerm}
          onSearchChange={page.setSearchTerm}
          round={page.roundFilter}
          onRoundChange={page.setRoundFilter}
          category={page.categoryFilter}
          onCategoryChange={page.setCategoryFilter}
          crop={page.cropFilter}
          onCropChange={page.setCropFilter}
          onExport={page.exportCsv}
          onCreate={() => setFormState({ open: true, record: null })}
        />
      </IrrigationPageHeader>

      <SeasonalTable
        data={page.filteredRecords}
        loading={recordsObj.loading}
        onView={setDossierRecord}
        onEdit={(record) => setFormState({ open: true, record })}
        onDelete={page.deleteRecord}
        onStatusChange={page.changeStatus}
        onOpenWheat={page.openWheat}
      />

      <SeasonalCharts cropData={page.chartCropData} categoryData={page.categoryShareData} />

      <SeasonalFormModal
        open={formState.open}
        editingRecord={formState.record}
        schemes={page.schemes}
        fiscalYear={page.fiscalYear}
        nextCode={`PRD-${page.fiscalYear.slice(0, 4)}-${String((recordsObj.records || []).length + 1).padStart(3, '0')}`}
        onCancel={() => setFormState({ open: false, record: null })}
        onSubmit={(values, form) => page.saveRecord(values, formState.record, form)}
      />

      <SeasonalDossierModal
        record={dossierRecord}
        onClose={() => setDossierRecord(null)}
        onOpenWheat={page.openWheat}
      />
    </div>
  );
}

export default function SeasonalCropProductionYieldManagement() {
  return (
    <App>
      <SeasonalCropProductionYieldContent />
    </App>
  );
}
