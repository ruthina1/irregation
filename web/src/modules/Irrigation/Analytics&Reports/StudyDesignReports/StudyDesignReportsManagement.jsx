import { useMemo, useState } from 'react';
import { App } from 'antd';
import IrrigationBreadcrumb from '../../shared/components/IrrigationBreadcrumb';
import IrrigationStatsSection from '../../shared/components/IrrigationStatsSection';
import ReportHeader from '../shared/ReportHeader';
import useIrrigationReport from '../shared/useIrrigationReport';
import { exportReport, sum } from '../shared/reportUtils';
import StudyDesignKpis, { StudyDesignChart } from './StudyDesignReportsStats';
import StudyDesignTable from './StudyDesignReportsTable';
import StudyDesignReportsFilters from './StudyDesignReportsFilters';
import StudyDesignReportsForm from './StudyDesignReportsForm';
import StudyDesignReportsDetail from './StudyDesignReportsDetail';

const CSV_COLUMNS = [
  ['Administrative Zone', (r) => r.zone],
  ['Total Pipeline', (r) => r.total_pipeline],
  ['Consultant Studies', (r) => r.consultant_studies],
  ['In-House Studies', (r) => r.inhouse_studies],
  ['Command Area (Ha)', (r) => r.command_area_ha],
  ['Male Farmers', (r) => r.beneficiaries_male],
  ['Female Farmers', (r) => r.beneficiaries_female],
  ['Reviewed', (r) => r.reviewed_count],
  ['QA Passed', (r) => r.qa_passed_count],
  ['Construction Ready', (r) => r.construction_ready_count],
  ['Trained Experts', (r) => (Number(r.experts_trained_male) || 0) + (Number(r.experts_trained_female) || 0)],
];

function useStudyDesignReport() {
  const { message } = App.useApp();
  const report = useIrrigationReport('study-design');
  const { rows } = report;

  const stats = useMemo(() => ({
    totalPipeline: sum(rows, 'total_pipeline'),
    totalConsultant: sum(rows, 'consultant_studies'),
    totalInhouse: sum(rows, 'inhouse_studies'),
    totalArea: sum(rows, 'command_area_ha'),
    totalFarmers: sum(rows, 'beneficiaries_male') + sum(rows, 'beneficiaries_female'),
    totalReady: sum(rows, 'construction_ready_count'),
    totalTrained: sum(rows, 'experts_trained_male') + sum(rows, 'experts_trained_female'),
  }), [rows]);

  const exportCsv = () => exportReport(message, rows, CSV_COLUMNS, 'Study_Design_Consolidated_Report', 'Study & Design report exported successfully');

  return { report, rows, stats, exportCsv };
}


function StudyDesignReportsContent() {
  const { report, rows, stats, exportCsv } = useStudyDesignReport();
  const [detailRecord, setDetailRecord] = useState(null);
  const showCharts = report.viewMode === 'charts';
  const showTable = report.viewMode === 'table';

  return (
    <div className="irr-page">
      <IrrigationBreadcrumb section="Irrigation Study & Design" title="Study & Design Reports (የጥናት እና ዲዛይን ሪፖርት)" />

      <IrrigationStatsSection onRefresh={report.reload} loading={report.loading}>
        <StudyDesignKpis stats={stats} />
      </IrrigationStatsSection>

      <ReportHeader
        section="Irrigation Study & Design"
        title="Study & Design Reports (የጥናት እና ዲዛይን ሪፖርት)"
        subtitle="Consolidated progress across Pipeline, Detailed Study & Design, Document Review, QA Certification, Shelf and Capacity Building"
        report={report}
        onExport={exportCsv}
      />

      {showCharts && <StudyDesignChart rows={rows} stats={stats} selectedZone={report.selectedZone} />}
      {showTable && (
        <StudyDesignTable
          rows={rows}
          loading={report.loading}
          onView={(record) => setDetailRecord(record)}
        />
      )}

      <StudyDesignReportsFilters />
      <StudyDesignReportsForm />
      <StudyDesignReportsDetail
        record={detailRecord}
        onClose={() => setDetailRecord(null)}
      />
    </div>
  );
}

export default function StudyDesignReportsManagement() {
  return (
    <App>
      <StudyDesignReportsContent />
    </App>
  );
}
