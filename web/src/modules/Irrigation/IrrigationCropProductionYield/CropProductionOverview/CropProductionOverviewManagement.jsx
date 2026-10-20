import { useCallback, useEffect, useMemo, useState } from 'react';
import { App, Button } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import irrigationApi from '../../../../services/api/irrigationApi';
import useIrrigationRecords from '../../shared/hooks/useIrrigationRecords';
import { CURRENT_FISCAL_YEAR } from '../../shared/constants';
import { exportRowsToCsv, extractName, getApiErrorMessage, notifyApiError, percent, sumBy, toNumber } from '../../shared/utils';
import IrrigationBreadcrumb from '../../shared/components/IrrigationBreadcrumb';
import IrrigationPageHeader from '../../shared/components/IrrigationPageHeader';
import LoadErrorAlert from '../../shared/components/LoadErrorAlert';
import IrrigationStatsSection from '../../shared/components/IrrigationStatsSection';
import ProductionStats, { ProductionCharts } from './CropProductionOverviewStats';
import ProductionFilters from './CropProductionOverviewFilters';
import ProductionTable from './CropProductionOverviewTable';
import CropProductionOverviewDetail from './CropProductionOverviewDetail';
import CropProductionOverviewForm from './CropProductionOverviewForm';

/* Cropping rounds and crop families (match IrrigationEnums on the server). */
export const CROPPING_ROUNDS = ['Round 1 (1ኛ ዙር)', 'Round 2 (2ኛ ዙር)', 'Round 3 (3ኛ ዙር)'];

export const CROP_CATEGORIES = [
  'Cereals (አዝርዕት)',
  'Pulses (ጥራጥሬ)',
  'Vegetables (አትክልት)',
  'Spices (ቅመማ ቅመም)',
  'Fruits (ፍራፍሬ)',
];

/** Pie colours per crop family (the server returns names and values only). */
export const CATEGORY_COLORS = {
  'Cereals (አዝርዕት)': '#a16207',
  'Vegetables (አትክልት)': '#b42318',
  'Spices (ቅመማ ቅመም)': '#64748b',
  'Pulses (ጥራጥሬ)': '#2f7d4a',
  'Fruits (ፍራፍሬ)': '#64748b',
};
export const FALLBACK_COLORS = ['#1a5f2c', '#5b8a6b', '#64748b', '#a16207'];

export const ROUTES = {
  seasonal: '/irrigation/production/seasonal-production',
  wheat: '/irrigation/production/summer-wheat',
  projects: '/irrigation/construction/projects',
};



const COLUMNS = [
  ['Scheme Code', (r) => r.scheme_code],
  ['Scheme Name', (r) => r.scheme],
  ['Crop', (r) => r.crop],
  ['Category', (r) => r.category],
  ['Cropping Round', (r) => r.round],
  ['Cultivated Area (Ha)', (r) => toNumber(r.area_ha)],
  ['Yield (Quintals)', (r) => toNumber(r.yield_qt)],
  ['Productivity', (r) => r.productivity],
  ['Male Farmers', (r) => toNumber(r.farmers_male)],
  ['Female Farmers', (r) => toNumber(r.farmers_female)],
  ['Date', (r) => r.date],
  ['Zone', (r) => extractName(r.zone)],
  ['Woreda', (r) => extractName(r.woreda)],
];

export const exportProductionOverview = (rows) => exportRowsToCsv(rows, COLUMNS, 'Crop_Production_Overview');



/**
 * Crop production overview (GET irrigation/production/overview):
 * harvest rows from seasonal production + highland wheat, the server summary,
 * round and crop-family aggregates, plus client-side table filters.
 */
function useProductionOverview() {
  const { message } = App.useApp();

  const [fiscalYear, setFiscalYear] = useState(CURRENT_FISCAL_YEAR);
  const [searchTerm, setSearchTerm] = useState('');
  const [roundFilter, setRoundFilter] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState(null);

  const [version, setVersion] = useState(0);
  const [result, setResult] = useState({ key: null, payload: null, error: null });
  const requestKey = `${fiscalYear}#${version}`;

  useEffect(() => {
    let current = true;
    irrigationApi.productionOverview({ fiscal_year: fiscalYear }).then(
      (res) => { if (current) setResult({ key: requestKey, payload: res.data || {}, error: null }); },
      (err) => { if (current) setResult({ key: requestKey, payload: null, error: getApiErrorMessage(err, 'Failed to load the production overview.') }); }
    );
    return () => { current = false; };
  }, [fiscalYear, requestKey]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);
  const loading = result.key !== requestKey;
  const payload = result.payload || {};
  const rows = useMemo(() => (Array.isArray(payload.data) ? payload.data : []), [payload.data]);

  const stats = useMemo(() => {
    const s = payload.summary || {};
    const totalYield = toNumber(s.totalYieldQuintals);
    const wheat = toNumber(s.wheatHarvestQuintals);
    const totalFarmers = toNumber(s.totalFarmers);
    const totalFemale = toNumber(s.totalFemaleFarmers);
    return {
      totalYieldQuintals: totalYield,
      wheatHarvestQuintals: wheat,
      wheatSharePct: percent(wheat, totalYield),
      totalCultivatedHa: toNumber(s.totalCultivatedHa),
      harvestCompletionPct: s.harvestCompletionPct ?? null,
      totalFarmers,
      totalFemaleFarmers: totalFemale,
      totalMaleFarmers: totalFarmers - totalFemale,
      femaleSharePct: percent(totalFemale, totalFarmers, 1),
    };
  }, [payload.summary]);

  const roundChartData = useMemo(
    () => (Array.isArray(payload.rounds) ? payload.rounds : []).map((r) => ({
      round: r.round, yieldQt: toNumber(r.yieldQt), areaHa: toNumber(r.areaHa),
    })),
    [payload.rounds]
  );

  const categoryChartData = useMemo(
    () => (Array.isArray(payload.categories) ? payload.categories : [])
      .map((c, i) => ({ name: c.name, value: toNumber(c.value), color: CATEGORY_COLORS[c.name] || FALLBACK_COLORS[i % FALLBACK_COLORS.length] })),
    [payload.categories]
  );

  const filteredRows = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return rows.filter((r) => {
      const haystack = [r.scheme, r.scheme_code, r.crop, r.category, r.zone, r.woreda].map((v) => extractName(v, '').toLowerCase());
      return (
        haystack.some((v) => v.includes(q))
        && (!roundFilter || (r.round || '').includes(roundFilter))
        && (!categoryFilter || (r.category || '').includes(categoryFilter))
      );
    });
  }, [rows, searchTerm, roundFilter, categoryFilter]);

  const exportCsv = () => {
    if (!filteredRows.length) {
      message.warning('No harvest data available to export');
      return;
    }
    exportProductionOverview(filteredRows);
    message.success('Production overview report exported successfully');
  };

  return {
    fiscalYear, setFiscalYear, searchTerm, setSearchTerm, roundFilter, setRoundFilter, categoryFilter, setCategoryFilter,
    loading, error: result.error, reload,
    stats, roundChartData, categoryChartData, filteredRows, exportCsv,
  };
}


/** Crop Production & Yield executive overview (seasonal production + highland wheat). */
function CropProductionOverviewContent() {
  const navigate = useNavigate();
  const page = useProductionOverview();

  return (
    <div className="irr-page">
      <IrrigationBreadcrumb section="Irrigation Crop Production & Yield" title="Crop Production & Yield Overview (የምርት መጠን አጠቃላይ እይታ)" />

      <LoadErrorAlert error={page.error} onRetry={page.reload} />

      <IrrigationStatsSection onRefresh={page.reload} loading={page.loading}>
        <ProductionStats stats={page.stats} onNavigate={navigate} />
      </IrrigationStatsSection>

      <IrrigationPageHeader
        section="Irrigation Crop Production & Yield"
        title="Crop Production & Yield Overview (የምርት መጠን አጠቃላይ እይታ)"
        subtitle="Executive scorecard tracking regional harvest output (ኩንታል), command area utilization, and farmer beneficiaries across all rounds"
        fiscalYear={page.fiscalYear}
        onFiscalYearChange={page.setFiscalYear}
        onRefresh={page.reload}
        loading={page.loading}
        extra={(
          <Button
            type="primary"
            icon={<ArrowRightOutlined />}
            onClick={() => navigate(ROUTES.seasonal)}
            style={{ backgroundColor: '#1a5f2c', borderColor: '#1a5f2c' }}
          >
            Go to Seasonal Ledger
          </Button>
        )}
      >
        <ProductionFilters
          searchTerm={page.searchTerm}
          onSearchChange={page.setSearchTerm}
          roundFilter={page.roundFilter}
          onRoundChange={page.setRoundFilter}
          categoryFilter={page.categoryFilter}
          onCategoryChange={page.setCategoryFilter}
          onExport={page.exportCsv}
        />
      </IrrigationPageHeader>

      <ProductionTable data={page.filteredRows} loading={page.loading} onNavigate={navigate} />

      <ProductionCharts data={page.chartData} />

      <CropProductionOverviewDetail />
      <CropProductionOverviewForm />
    </div>
  );
}

export default function CropProductionOverviewManagement() {
  return (
    <App>
      <CropProductionOverviewContent />
    </App>
  );
}
