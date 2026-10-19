import { App } from 'antd';
import IrrigationBreadcrumb from '../../shared/components/IrrigationBreadcrumb';
import IrrigationStatsSection from '../../shared/components/IrrigationStatsSection';
import ReportHeader from '../shared/ReportHeader';
import useIrrigationReport from '../shared/useIrrigationReport';
import { exportReport, sum } from '../shared/reportUtils';
import InstitutionsKpis from './InstitutionsReportsStats';
import InstitutionsTable from './InstitutionsReportsTable';
import InstitutionsReportsFilters from './InstitutionsReportsFilters';
import InstitutionsReportsForm from './InstitutionsReportsForm';
import InstitutionsReportsDetail from './InstitutionsReportsDetail';

const CSV_COLUMNS = [
  ['Administrative Zone', (r) => r.zone],
  ['Total WUAs', (r) => r.total_wuas],
  ['New Established', (r) => r.new_wuas],
  ['Strengthened', (r) => r.strengthened_wuas],
  ['Audited', (r) => r.audited_wuas],
  ['Clean Audits', (r) => r.unqualified_audits],
  ['Modern Canal (km)', (r) => r.modern_canal_maintained_km],
  ['Traditional Canal (km)', (r) => r.traditional_canal_maintained_km],
  ['Mobilized Labor', (r) => r.community_labor_count],
  ['Total Members', (r) => r.wua_members_total],
];

function useInstitutionsReport() {
  const { message } = App.useApp();
  const report = useIrrigationReport('institutions');
  const { rows } = report;

  const stats = useMemo(() => {
    const modernKm = sum(rows, 'modern_canal_maintained_km');
    const traditionalKm = sum(rows, 'traditional_canal_maintained_km');
    return {
      totalWuas: sum(rows, 'total_wuas'),
      newWuas: sum(rows, 'new_wuas'),
      strengthenedWuas: sum(rows, 'strengthened_wuas'),
      auditedWuas: sum(rows, 'audited_wuas'),
      modernKm: modernKm.toFixed(1),
      traditionalKm: traditionalKm.toFixed(1),
      totalCanalKm: Number((modernKm + traditionalKm).toFixed(1)),
      totalLabor: sum(rows, 'community_labor_count'),
      totalMembers: sum(rows, 'wua_members_total'),
    };
  }, [rows]);

  const exportCsv = () => exportReport(
    message, rows, CSV_COLUMNS, 'WUA_Institutions_Report', 'WUA institutions report exported successfully'
  );

  return { report, rows, stats, exportCsv };
}


function InstitutionsReportsContent() {
  const { report, rows, stats, exportCsv } = useInstitutionsReport();

  return (
    <div className="irr-page">
      <IrrigationBreadcrumb section="Irrigation Institutions Management" title="Institutions & Capacity Reports (የተቋማት አቅም ሪፖርት)" />

      <IrrigationStatsSection onRefresh={report.reload} loading={report.loading}>
        <InstitutionsKpis stats={stats} />
      </IrrigationStatsSection>

      <ReportHeader
        section="Irrigation Institutions Management"
        title="Institutions & Capacity Reports (የተቋማት አቅም ሪፖርት)"
        subtitle="Zonal rollups of registered WUAs, executive gender balance, audit grades, fee collection, and canal desilting campaigns"
        report={report}
        onExport={exportCsv}
      />

      <InstitutionsTable rows={rows} loading={report.loading} />

      <InstitutionsReportsFilters />
      <InstitutionsReportsForm />
      <InstitutionsReportsDetail />
    </div>
  );
}

export default function InstitutionsReportsManagement() {
  return (
    <App>
      <InstitutionsReportsContent />
    </App>
  );
}
