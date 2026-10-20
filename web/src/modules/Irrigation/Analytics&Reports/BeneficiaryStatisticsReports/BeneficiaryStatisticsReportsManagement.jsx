import { exportRowsToCsv } from '../../shared/utils';
import { useMemo, useState } from 'react';
import { App } from 'antd';
import IrrigationBreadcrumb from '../../shared/components/IrrigationBreadcrumb';
import IrrigationStatsSection from '../../shared/components/IrrigationStatsSection';
import ReportHeader from '../shared/ReportHeader';
import useIrrigationReport from '../shared/useIrrigationReport';
import { NOT_TRACKED, pct, sum } from '../shared/reportUtils';
import BeneficiaryKpis, { BeneficiaryCharts } from './BeneficiaryStatisticsReportsStats';
import BeneficiaryTable from './BeneficiaryStatisticsReportsTable';
import BeneficiaryStatisticsReportsForm from './BeneficiaryStatisticsReportsForm';
import BeneficiaryStatisticsReportsDetail from './BeneficiaryStatisticsReportsDetail';

const isNull = (v) => v === null || v === undefined;

const CSV_COLUMNS = [
  ['Administrative Zone', (r) => r.zone],
  ['Schemes Count', (r) => r.schemes_count],
  ['Command Area (Ha)', (r) => r.command_area_ha],
  ['Male Farmers', (r) => r.farmers_male],
  ['Female Farmers', (r) => r.farmers_female],
  ['Total Farmers', (r) => r.total_farmers],
  ['Female Share (%)', (r) => r.female_share_pct],
  ['Youth Farmers', (r) => r.youth_farmers],
  ['Female-Headed Households', (r) => (isNull(r.female_headed_households) ? NOT_TRACKED : r.female_headed_households)],
  ['WUA Registered Members', (r) => r.wua_members_total],
  ['Highland Wheat Farmers', (r) => r.wheat_initiative_farmers],
];

function useBeneficiaryStatisticsReport() {
  const { message } = App.useApp();
  const report = useIrrigationReport('beneficiaries');
  const { rows, meta } = report;

  const fhhTracked = !(Array.isArray(meta.untracked_metrics) && meta.untracked_metrics.includes('female_headed_households'))
    && (!rows.length || rows.some((r) => !isNull(r.female_headed_households)));

  const stats = useMemo(() => {
    const totalMale = sum(rows, 'farmers_male');
    const totalFemale = sum(rows, 'farmers_female');
    const grandTotalFarmers = totalMale + totalFemale;
    return {
      totalSchemes: sum(rows, 'schemes_count'),
      totalCommandHa: sum(rows, 'command_area_ha'),
      grandTotalFarmers,
      totalMale,
      totalFemale,
      femaleSharePct: pct(totalFemale, grandTotalFarmers),
      totalYouth: sum(rows, 'youth_farmers'),
      totalFHH: fhhTracked ? sum(rows, 'female_headed_households') : null,
      totalWuaMembers: sum(rows, 'wua_members_total'),
      totalWheatFarmers: sum(rows, 'wheat_initiative_farmers'),
    };
  }, [rows, fhhTracked]);

  const exportCsv = () => {
    if (!rows.length) {
      message.warning('No beneficiary demographic records available to export');
      return;
    }
    exportRowsToCsv(rows, CSV_COLUMNS, 'Irrigation_Beneficiary_Statistics_Report');
    message.success('Beneficiary statistics report exported successfully');
  };

  return {
    report, rows, stats, exportCsv,
  };
}


function BeneficiaryStatisticsReportsContent() {
  const { report, rows, stats, exportCsv } = useBeneficiaryStatisticsReport();
  const [detailRecord, setDetailRecord] = useState(null);
  const showCharts = report.viewMode === 'charts';
  const showTable = report.viewMode === 'table';

  return (
    <div className="irr-page">
      <IrrigationBreadcrumb section="Irrigation Construction & Monitoring" title="Beneficiary Statistics Reports (የተጠቃሚዎች ስታትስቲክስ ሪፖርት)" />

      <IrrigationStatsSection onRefresh={report.reload} loading={report.loading}>
        <BeneficiaryKpis stats={stats} />
      </IrrigationStatsSection>

      <ReportHeader
        section="Irrigation Construction & Monitoring"
        title="Beneficiary Statistics Reports (የተጠቃሚዎች ስታትስቲክስ ሪፖርት)"
        subtitle="Zonal and program rollups of male, female, youth, and emerging-woreda smallholder farmers benefiting from developed schemes"
        report={report}
        onExport={exportCsv}
      />

      {showCharts && <BeneficiaryCharts rows={rows} stats={stats} selectedZone={report.selectedZone} />}
      {showTable && (
        <BeneficiaryTable
          rows={rows}
          loading={report.loading}
          onView={(record) => setDetailRecord(record)}
        />
      )}

      <BeneficiaryStatisticsReportsForm />
      <BeneficiaryStatisticsReportsDetail
        record={detailRecord}
        onClose={() => setDetailRecord(null)}
      />
    </div>
  );
}

export default function BeneficiaryStatisticsReportsManagement() {
  return (
    <App>
      <BeneficiaryStatisticsReportsContent />
    </App>
  );
}
