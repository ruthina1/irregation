import { useMemo, useState } from 'react';
import { App, Badge, Tabs } from 'antd';
import { BankOutlined, EnvironmentOutlined } from '@ant-design/icons';
import IrrigationBreadcrumb from '../../shared/components/IrrigationBreadcrumb';
import IrrigationStatsSection from '../../shared/components/IrrigationStatsSection';
import ReportHeader from '../shared/ReportHeader';
import useIrrigationReport from '../shared/useIrrigationReport';
import { exportReport, pct, sum } from '../shared/reportUtils';
import DirectorateKpis, { DirectorateCharts } from './IrrigationDirectorateMasterReportStats';
import { ProgramPortfolioTable, ZonalSynthesisTable } from './IrrigationDirectorateMasterReportTable';
import IrrigationDirectorateMasterReportFilters from './IrrigationDirectorateMasterReportFilters';
import IrrigationDirectorateMasterReportForm from './IrrigationDirectorateMasterReportForm';
import IrrigationDirectorateMasterReportDetail from './IrrigationDirectorateMasterReportDetail';

const CSV_COLUMNS = [
  ['Administrative Zone', (r) => r.zone],
  ['Active Studies', (r) => r.active_studies],
  ['Construction-Ready Shelf', (r) => r.construction_ready_schemes],
  ['Active Construction Schemes', (r) => r.active_construction_schemes],
  ['Avg Physical Progress (%)', (r) => r.avg_physical_progress_pct],
  ['Allocated Budget (ETB)', (r) => r.allocated_construction_budget_etb],
  ['Disbursed (ETB)', (r) => r.disbursed_budget_etb],
  ['Command Area (Ha)', (r) => r.managed_command_ha],
  ['Actual Irrigated (Ha)', (r) => r.irrigated_actual_ha],
  ['Total Harvest (Qt)', (r) => r.total_yield_quintals],
  ['Wheat Harvest (Qt)', (r) => r.wheat_initiative_yield_qt],
  ['WUAs Total', (r) => r.registered_wuas],
  ['Audited WUAs', (r) => r.audited_wuas],
  ['Modern Canals (km)', (r) => r.modern_canal_km],
  ['Traditional Canals (km)', (r) => r.traditional_canal_km],
  ['Male Farmers', (r) => r.farmers_male],
  ['Female Farmers', (r) => r.farmers_female],
  ['Total Farmers', (r) => r.total_farmers],
];

function useDirectorateMasterReport() {
  const { message } = App.useApp();
  const report = useIrrigationReport('directorate-master');
  const { rows } = report;
  const portfolio = Array.isArray(report.payload.program_portfolio) ? report.payload.program_portfolio : [];

  const stats = useMemo(() => {
    const totalAllocatedBudget = sum(rows, 'allocated_construction_budget_etb');
    const totalDisbursedBudget = sum(rows, 'disbursed_budget_etb');
    const totalMale = sum(rows, 'farmers_male');
    const totalFemale = sum(rows, 'farmers_female');
    return {
      totalStudies: sum(rows, 'active_studies'),
      totalReadyOnShelf: sum(rows, 'construction_ready_schemes'),
      totalActiveConstruction: sum(rows, 'active_construction_schemes'),
      totalAllocatedBudget,
      totalDisbursedBudget,
      totalHarvestQt: sum(rows, 'total_yield_quintals'),
      totalWuas: sum(rows, 'registered_wuas'),
      totalAuditedWuas: sum(rows, 'audited_wuas'),
      totalCanalKm: (sum(rows, 'modern_canal_km') + sum(rows, 'traditional_canal_km')).toFixed(1),
      grandTotalFarmers: totalMale + totalFemale,
      femaleSharePct: pct(totalFemale, totalMale + totalFemale),
      overallBurnRate: pct(totalDisbursedBudget, totalAllocatedBudget),
    };
  }, [rows]);

  const exportCsv = () => exportReport(
    message, rows, CSV_COLUMNS, 'Irrigation_Directorate_Master_Executive_Report',
    'Directorate Master Report exported successfully'
  );

  return {
    report,
    rows,
    portfolio,
    zonalRows: rows,
    portfolioRows: portfolio,
    stats,
    exportCsv,
  };
}


function IrrigationDirectorateMasterReportContent() {
  const { report, zonalRows, portfolioRows, stats, exportCsv } = useDirectorateMasterReport();
  const [detailRecord, setDetailRecord] = useState(null);
  const showCharts = report.viewMode === 'charts';
  const showTable = report.viewMode === 'table';

  const tabItems = [
    {
      key: 'zonal',
      label: (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
          <EnvironmentOutlined style={{ color: '#1a5f2c' }} />
          <span>Regional Zonal Synthesis (የዞኖች ዋና ሪፖርት)</span>
          <Badge count={zonalRows.length} overflowCount={99} style={{ backgroundColor: '#1a5f2c' }} />
        </span>
      ),
      children: (
        <ZonalSynthesisTable
          rows={zonalRows}
          loading={report.loading}
          onView={(record) => setDetailRecord(record)}
        />
      ),
    },
    {
      key: 'portfolio',
      label: (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
          <BankOutlined style={{ color: '#5b8a6b' }} />
          <span>Capital Budget & Financing Portfolio (የበጀትና ፕሮግራሞች ፖርትፎሊዮ)</span>
          <Badge count={portfolioRows.length} overflowCount={99} style={{ backgroundColor: '#5b8a6b' }} />
        </span>
      ),
      children: (
        <ProgramPortfolioTable
          rows={portfolioRows}
          loading={report.loading}
        />
      ),
    },
  ];

  return (
    <div className="irr-page">
      <IrrigationBreadcrumb section="Irrigation Directorate" title="Directorate Master Synthesis (የመስኖ ዳይሬክቶሬት ዋና ሪፖርት)" />

      <IrrigationStatsSection onRefresh={report.reload} loading={report.loading}>
        <DirectorateKpis stats={stats} />
      </IrrigationStatsSection>

      <ReportHeader
        section="Irrigation Directorate"
        title="Directorate Master Synthesis (የመስኖ ዳይሬክቶሬት ዋና ሪፖርት)"
        subtitle="Executive scorecard synthesizing physical completion, capital financing execution, command area hectares, and farmer beneficiaries across all regional zones"
        report={report}
        onExport={exportCsv}
      />

      {showCharts && <DirectorateCharts rows={zonalRows} stats={stats} selectedZone={report.selectedZone} />}

      {showTable && (
        <Tabs
          defaultActiveKey="zonal"
          className="irr-report-tabs"
          style={{ marginBottom: 24 }}
          items={tabItems}
        />
      )}

      <IrrigationDirectorateMasterReportFilters />
      <IrrigationDirectorateMasterReportForm />
      <IrrigationDirectorateMasterReportDetail
        record={detailRecord}
        onClose={() => setDetailRecord(null)}
        fiscalYear={report.fiscalYear}
      />
    </div>
  );
}

export default function IrrigationDirectorateMasterReportManagement() {
  return (
    <App>
      <IrrigationDirectorateMasterReportContent />
    </App>
  );
}
