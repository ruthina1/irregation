import { useMemo, useState } from 'react';
import { App } from 'antd';
import IrrigationBreadcrumb from '../../shared/components/IrrigationBreadcrumb';
import IrrigationStatsSection from '../../shared/components/IrrigationStatsSection';
import ReportHeader from '../shared/ReportHeader';
import useIrrigationReport from '../shared/useIrrigationReport';
import { NOT_TRACKED, exportReport, sum } from '../shared/reportUtils';
import WaterUtilizationKpis, { WaterUtilizationCharts } from './WaterUtilizationReportsStats';
import WaterUtilizationTable from './WaterUtilizationReportsTable';
import WaterUtilizationReportsFilters from './WaterUtilizationReportsFilters';
import WaterUtilizationReportsForm from './WaterUtilizationReportsForm';
import WaterUtilizationReportsDetail from './WaterUtilizationReportsDetail';

const isNull = (v) => v === null || v === undefined;
const orNotTracked = (v) => (isNull(v) ? NOT_TRACKED : v);

const CSV_COLUMNS = [
  ['Zone', (r) => r.zone],
  ['Round 1 (Ha)', (r) => r.round_1_ha],
  ['Round 2 (Ha)', (r) => r.round_2_ha],
  ['Round 3 (Ha)', (r) => r.round_3_ha],
  ['Total Effective (Ha)', (r) => r.total_effective_ha],
  ['Drip & Sprinkler (Ha)', (r) => orNotTracked(r.drip_sprinkler_ha)],
  ['Surface (Ha)', (r) => orNotTracked(r.surface_furrow_ha)],
  ['Solar Pump Sites', (r) => r.solar_pump_sites],
  ['Deep Wells', (r) => r.deep_well_sites],
  ['Application Efficiency (%)', (r) => orNotTracked(r.avg_application_efficiency_pct)],
];

function useWaterUtilizationReport() {
  const { message } = App.useApp();
  const report = useIrrigationReport('water-utilization');
  const { rows, meta } = report;
  const untracked = useMemo(() => (Array.isArray(meta.untracked_metrics) ? meta.untracked_metrics : []), [meta]);

  const stats = useMemo(() => {
    // A metric is "not tracked" when the API flags it or no row carries a value for it.
    const tracked = (field) => !untracked.includes(field) && (!rows.length || rows.some((r) => !isNull(r[field])));
    const valued = (field) => rows.filter((r) => !isNull(r[field]));
    const effRows = valued('avg_application_efficiency_pct');
    return {
      totalR1: sum(rows, 'round_1_ha'),
      totalR2: sum(rows, 'round_2_ha'),
      totalR3: sum(rows, 'round_3_ha'),
      totalEffective: sum(rows, 'total_effective_ha'),
      totalMicro: tracked('drip_sprinkler_ha') ? sum(rows, 'drip_sprinkler_ha') : null,
      totalSolar: sum(rows, 'solar_pump_sites'),
      totalDeepWells: sum(rows, 'deep_well_sites'),
      avgEfficiency: tracked('avg_application_efficiency_pct')
        ? (effRows.length ? (sum(effRows, 'avg_application_efficiency_pct') / effRows.length).toFixed(1) : '0.0')
        : null,
    };
  }, [rows, untracked]);

  const exportCsv = () => exportReport(
    message, rows, CSV_COLUMNS, 'Water_Utilization_Technologies_Report', 'Water utilization report exported successfully'
  );

  return { report, rows, stats, exportCsv };
}


function WaterUtilizationReportsContent() {
  const { report, rows, stats, exportCsv } = useWaterUtilizationReport();
  const [detailRecord, setDetailRecord] = useState(null);
  const showCharts = report.viewMode === 'charts';
  const showTable = report.viewMode === 'table';

  return (
    <div className="irr-page">
      <IrrigationBreadcrumb section="Irrigation Water Utilization" title="Water Utilization Reports (የውሃ አጠቃቀም ሪፖርት)" />

      <IrrigationStatsSection onRefresh={report.reload} loading={report.loading}>
        <WaterUtilizationKpis stats={stats} />
      </IrrigationStatsSection>

      <ReportHeader
        section="Irrigation Water Utilization"
        title="Water Utilization Reports (የውሃ አጠቃቀም ሪፖርት)"
        subtitle="Zonal synthesis of developed vs irrigated land, smallholder/commercial typologies, and abstraction schemes"
        report={report}
        onExport={exportCsv}
      />

      {showCharts && <WaterUtilizationCharts rows={rows} stats={stats} selectedZone={report.selectedZone} />}
      {showTable && (
        <WaterUtilizationTable
          rows={rows}
          loading={report.loading}
          onView={(record) => setDetailRecord(record)}
        />
      )}

      <WaterUtilizationReportsFilters />
      <WaterUtilizationReportsForm />
      <WaterUtilizationReportsDetail
        record={detailRecord}
        onClose={() => setDetailRecord(null)}
      />
    </div>
  );
}

export default function WaterUtilizationReportsManagement() {
  return (
    <App>
      <WaterUtilizationReportsContent />
    </App>
  );
}
