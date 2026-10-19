import { App } from 'antd';
import IrrigationBreadcrumb from '../../shared/components/IrrigationBreadcrumb';
import IrrigationStatsSection from '../../shared/components/IrrigationStatsSection';
import ReportHeader from '../shared/ReportHeader';
import useIrrigationReport from '../shared/useIrrigationReport';
import { NOT_TRACKED, pct, sum } from '../shared/reportUtils';
import BeneficiaryKpis, { BeneficiaryCharts } from './BeneficiaryStatisticsReportsStats';
import BeneficiaryFilterBar from './BeneficiaryStatisticsReportsFilters';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setZoneFilter] = useState(null);

  const zoneOptions = useMemo(() => rows.map((r) => ({ value: r.zone, label: r.zone })), [rows]);
  // A selected zone that is absent from the newly loaded fiscal year is dropped (derived, no effect needed).
  const zoneFilter = selectedZone && rows.some((r) => r.zone === selectedZone) ? selectedZone : null;

  const filteredRows = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return rows.filter((r) => {
      const zone = String(r.zone || '').toLowerCase();
      const matchesSearch = zone.includes(q);
      const matchesZone = zoneFilter ? zone === zoneFilter.toLowerCase() : true;
      return matchesSearch && matchesZone;
    });
  }, [rows, searchTerm, zoneFilter]);

  const fhhTracked = !(Array.isArray(meta.untracked_metrics) && meta.untracked_metrics.includes('female_headed_households'))
    && (!rows.length || rows.some((r) => !isNull(r.female_headed_households)));

  const stats = useMemo(() => {
    const totalMale = sum(filteredRows, 'farmers_male');
    const totalFemale = sum(filteredRows, 'farmers_female');
    const grandTotalFarmers = totalMale + totalFemale;
    return {
      totalSchemes: sum(filteredRows, 'schemes_count'),
      totalCommandHa: sum(filteredRows, 'command_area_ha'),
      grandTotalFarmers,
      totalMale,
      totalFemale,
      femaleSharePct: pct(totalFemale, grandTotalFarmers),
      totalYouth: sum(filteredRows, 'youth_farmers'),
      totalFHH: fhhTracked ? sum(filteredRows, 'female_headed_households') : null,
      totalWuaMembers: sum(filteredRows, 'wua_members_total'),
      totalWheatFarmers: sum(filteredRows, 'wheat_initiative_farmers'),
    };
  }, [filteredRows, fhhTracked]);

  const exportCsv = () => {
    if (!filteredRows.length) {
      message.warning('No beneficiary demographic records available to export');
      return;
    }
    exportRowsToCsv(filteredRows, CSV_COLUMNS, 'Irrigation_Beneficiary_Statistics_Report');
    message.success('Beneficiary statistics report exported successfully');
  };

  return {
    report, filteredRows, zoneOptions, searchTerm, setSearchTerm, zoneFilter, setZoneFilter, stats, exportCsv,
  };
}


function BeneficiaryStatisticsReportsContent() {
  const { report, filteredRows, stats, filter, setFilter, search, setSearch, exportCsv } =
    useBeneficiaryStatisticsReport();

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

      <BeneficiaryFilterBar filter={filter} onFilterChange={setFilter} search={search} onSearchChange={setSearch} />

      <BeneficiaryTable rows={filteredRows} loading={report.loading} />

      <BeneficiaryCharts rows={report.rows} />

      <BeneficiaryStatisticsReportsForm />
      <BeneficiaryStatisticsReportsDetail />
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
