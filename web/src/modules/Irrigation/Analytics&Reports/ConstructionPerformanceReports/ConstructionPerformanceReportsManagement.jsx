import { useMemo, useState } from 'react';
import { App } from 'antd';
import IrrigationBreadcrumb from '../../shared/components/IrrigationBreadcrumb';
import IrrigationStatsSection from '../../shared/components/IrrigationStatsSection';
import ReportHeader from '../shared/ReportHeader';
import useIrrigationReport from '../shared/useIrrigationReport';
import { exportReport, pct, sum } from '../shared/reportUtils';
import ConstructionKpis, { ConstructionCharts } from './ConstructionPerformanceReportsStats';
import ConstructionProgramTable from './ConstructionPerformanceReportsTable';
import ConstructionPerformanceReportsFilters from './ConstructionPerformanceReportsFilters';
import ConstructionPerformanceReportsForm from './ConstructionPerformanceReportsForm';
import ConstructionPerformanceReportsDetail from './ConstructionPerformanceReportsDetail';

const CSV_COLUMNS = [
  ['Funding Program', (r) => r.program],
  ['New Schemes', (r) => r.new_schemes_count],
  ['Rehab Schemes', (r) => r.existing_rehab_count],
  ['Avg New Physical (%)', (r) => r.avg_new_physical_pct],
  ['Avg Rehab Physical (%)', (r) => r.avg_rehab_physical_pct],
  ['Allocated Budget (ETB)', (r) => r.allocated_budget_etb],
  ['Disbursed (ETB)', (r) => r.disbursed_etb],
  ['Developed Land (Ha)', (r) => r.developed_land_ha],
  ['Total Beneficiaries', (r) => r.beneficiaries_total],
];

function useConstructionPerformanceReport() {
  const { message } = App.useApp();
  const report = useIrrigationReport('construction');
  const { rows, meta } = report;
  const milestoneAdherencePct = meta.milestone_adherence_pct ?? null;

  const stats = useMemo(() => {
    const totalBudget = sum(rows, 'allocated_budget_etb');
    const totalDisbursed = sum(rows, 'disbursed_etb');
    return {
      totalNew: sum(rows, 'new_schemes_count'),
      totalRehab: sum(rows, 'existing_rehab_count'),
      totalBudget,
      totalDisbursed,
      totalLand: sum(rows, 'developed_land_ha'),
      totalFarmers: sum(rows, 'beneficiaries_total'),
      burnRate: pct(totalDisbursed, totalBudget),
      milestoneAdherencePct,
    };
  }, [rows, milestoneAdherencePct]);

  const exportCsv = () => exportReport(
    message, rows, CSV_COLUMNS, 'Construction_Performance_Report',
    'Construction performance report exported successfully'
  );

  return { report, rows, stats, exportCsv };
}


function ConstructionPerformanceReportsContent() {
  const { report, rows, stats, exportCsv } = useConstructionPerformanceReport();
  const [detailRecord, setDetailRecord] = useState(null);
  const showCharts = report.viewMode === 'charts';
  const showTable = report.viewMode === 'table';

  return (
    <div className="irr-page">
      <IrrigationBreadcrumb section="Irrigation Construction & Monitoring" title="Construction Performance Reports (የግንባታ ክትትል ሪፖርት)" />

      <IrrigationStatsSection onRefresh={report.reload} loading={report.loading}>
        <ConstructionKpis stats={stats} />
      </IrrigationStatsSection>

      <ReportHeader
        section="Irrigation Construction & Monitoring"
        title="Construction Performance Reports (የግንባታ ክትትል ሪፖርት)"
        subtitle="Physical execution tracking across new schemes (66% target) and rehabilitation (30.3% benchmark) by funding channel"
        report={report}
        onExport={exportCsv}
      />

      {showCharts && <ConstructionCharts rows={rows} stats={stats} selectedProgram={report.selectedZone} />}
      {showTable && (
        <ConstructionProgramTable
          rows={rows}
          loading={report.loading}
          onView={(record) => setDetailRecord(record)}
        />
      )}

      <ConstructionPerformanceReportsFilters />
      <ConstructionPerformanceReportsForm />
      <ConstructionPerformanceReportsDetail
        record={detailRecord}
        onClose={() => setDetailRecord(null)}
      />
    </div>
  );
}

export default function ConstructionPerformanceReportsManagement() {
  return (
    <App>
      <ConstructionPerformanceReportsContent />
    </App>
  );
}
