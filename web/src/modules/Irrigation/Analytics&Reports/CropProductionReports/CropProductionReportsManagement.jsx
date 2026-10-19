import { App } from 'antd';
import IrrigationBreadcrumb from '../../shared/components/IrrigationBreadcrumb';
import IrrigationStatsSection from '../../shared/components/IrrigationStatsSection';
import ReportHeader from '../shared/ReportHeader';
import useIrrigationReport from '../shared/useIrrigationReport';
import { exportReport, pct, sum } from '../shared/reportUtils';
import CropProductionKpis from './CropProductionReportsStats';
import CropProductionTable from './CropProductionReportsTable';
import CropProductionReportsFilters from './CropProductionReportsFilters';
import CropProductionReportsForm from './CropProductionReportsForm';
import CropProductionReportsDetail from './CropProductionReportsDetail';

const n = (v) => Number(v) || 0;

const CSV_COLUMNS = [
  ['Zone', (r) => r.zone],
  ['Cultivated (Ha)', (r) => r.cultivated_ha],
  ['Total Harvest (Quintals)', (r) => r.total_yield_qt],
  ['Wheat Area (Ha)', (r) => r.wheat_ha],
  ['Wheat Yield (Quintals)', (r) => r.wheat_yield_qt],
  ['Male Farmers', (r) => r.farmers_male],
  ['Female Farmers', (r) => r.farmers_female],
  ['Total Farmers', (r) => n(r.farmers_male) + n(r.farmers_female)],
  ['Fertilizer (Qt)', (r) => r.fertilizer_qt],
  ['Seed (Qt)', (r) => r.seed_qt],
  ['Compost (m3)', (r) => r.compost_m3],
];

function useCropProductionReport() {
  const { message } = App.useApp();
  const report = useIrrigationReport('production');
  const { rows } = report;

  const stats = useMemo(() => {
    const totalMale = sum(rows, 'farmers_male');
    const totalFemale = sum(rows, 'farmers_female');
    return {
      totalArea: sum(rows, 'cultivated_ha'),
      totalYield: sum(rows, 'total_yield_qt'),
      totalWheatYield: sum(rows, 'wheat_yield_qt'),
      totalWheatArea: sum(rows, 'wheat_ha'),
      totalFarmers: totalMale + totalFemale,
      femaleSharePct: pct(totalFemale, totalMale + totalFemale),
      totalFertilizer: sum(rows, 'fertilizer_qt'),
    };
  }, [rows]);

  const exportCsv = () => exportReport(
    message, rows, CSV_COLUMNS, 'Crop_Production_Harvest_Report', 'Crop production report exported successfully'
  );

  return { report, rows, stats, exportCsv };
}


function CropProductionReportsContent() {
  const { report, rows, stats, exportCsv } = useCropProductionReport();

  return (
    <div className="irr-page">
      <IrrigationBreadcrumb section="Irrigation Crop Production & Yield" title="Crop Production Reports (የምርት መጠን ሪፖርት)" />

      <IrrigationStatsSection onRefresh={report.reload} loading={report.loading}>
        <CropProductionKpis stats={stats} />
      </IrrigationStatsSection>

      <ReportHeader
        section="Irrigation Crop Production & Yield"
        title="Crop Production Reports (የምርት መጠን ሪፖርት)"
        subtitle="Zonal harvest volume (ኩንታል), crop mix, productivity per hectare, and farmer beneficiaries across all rounds"
        report={report}
        onExport={exportCsv}
      />

      <CropProductionTable rows={rows} loading={report.loading} />

      <CropProductionReportsFilters />
      <CropProductionReportsForm />
      <CropProductionReportsDetail />
    </div>
  );
}

export default function CropProductionReportsManagement() {
  return (
    <App>
      <CropProductionReportsContent />
    </App>
  );
}
