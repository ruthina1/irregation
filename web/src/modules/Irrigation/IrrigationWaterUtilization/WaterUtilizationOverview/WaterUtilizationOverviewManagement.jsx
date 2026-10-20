const SOURCE_COLORS = ['#1a5f2c', '#5b8a6b', '#a16207', '#64748b'];
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import IrrigationBreadcrumb from '../../shared/components/IrrigationBreadcrumb';
import IrrigationPageHeader from '../../shared/components/IrrigationPageHeader';
import LoadErrorAlert from '../../shared/components/LoadErrorAlert';
import IrrigationStatsSection from '../../shared/components/IrrigationStatsSection';
import irrigationApi from '../../../../services/api/irrigationApi';
import useIrrigationRecords from '../../shared/hooks/useIrrigationRecords';
import useIrrigationReport from '../../Analytics&Reports/shared/useIrrigationReport';
import { CURRENT_FISCAL_YEAR } from '../../shared/constants';
import { extractName, sumBy, toNumber } from '../../shared/utils';
import OverviewKpis, { WaterSourceCategoryChart } from './WaterUtilizationOverviewStats';
import ZoneUtilizationTable from './WaterUtilizationOverviewTable';
import WaterPageLinks from './WaterUtilizationOverviewDetail';
import WaterUtilizationOverviewFilters from './WaterUtilizationOverviewFilters';
import WaterUtilizationOverviewForm from './WaterUtilizationOverviewForm';

/** Zone summary from the water-utilization report plus the water-source category breakdown. */
function useWaterUtilizationOverview() {
  const report = useIrrigationReport('water-utilization');
  const sources = useIrrigationRecords(irrigationApi.waterSources, { fiscalYear: report.fiscalYear });

  const kpis = useMemo(() => {
    const rows = report.rows;
    const tracked = rows.filter((r) => r.avg_utilization_rate_pct !== null && r.avg_utilization_rate_pct !== undefined);
    return {
      totalEffectiveHa: sumBy(rows, 'total_effective_ha'),
      round1Ha: sumBy(rows, 'round_1_ha'),
      round2Ha: sumBy(rows, 'round_2_ha'),
      round3Ha: sumBy(rows, 'round_3_ha'),
      solarSites: sumBy(rows, 'solar_pump_sites'),
      deepWellSites: sumBy(rows, 'deep_well_sites'),
      avgUtilization: tracked.length ? sumBy(tracked, 'avg_utilization_rate_pct') / tracked.length : null,
      sourceCount: sources.records.length,
      commandAreaHa: sumBy(sources.records, 'command_area_served_ha'),
    };
  }, [report.rows, sources.records]);

  const categoryData = useMemo(() => {
    const map = {};
    sources.records.forEach((r) => {
      const cat = r.source_category || 'Surface Water & Gravity Diversion';
      map[cat] = (map[cat] || 0) + (Number(r.command_area_served_ha) || 0);
    });
    return Object.entries(map).map(([name, value], i) => ({ name, value, color: SOURCE_COLORS[i % SOURCE_COLORS.length] }));
  }, [sources.records]);

  const reload = () => {
    report.reload();
    sources.reload();
  };

  return {
    report, sources, kpis, categoryData, reload,
    loading: report.loading || sources.loading,
    error: report.error || sources.error,
  };
}


/** Irrigation Water Utilization overview: KPIs, zone summary, source categories and links to the registers. */
export default function WaterUtilizationOverviewManagement() {
  const navigate = useNavigate();
  const page = useWaterUtilizationOverview();

  return (
    <div className="irr-page">
      <IrrigationBreadcrumb section="Irrigation Water Utilization" title="Water Utilization Overview (የመስኖ ውሃ አጠቃቀም አጠቃላይ እይታ)" />

      <LoadErrorAlert error={page.error} onRetry={page.reload} />

      <IrrigationStatsSection onRefresh={page.reload} loading={page.loading}>
        <OverviewKpis kpis={page.kpis} />
      </IrrigationStatsSection>

      <IrrigationPageHeader
        section="Irrigation Water Utilization"
        title="Water Utilization Overview (የመስኖ ውሃ አጠቃቀም አጠቃላይ እይታ)"
        subtitle="Effective irrigated area, abstraction technologies and utilization rates across zones for the selected fiscal year"
        fiscalYear={page.report.fiscalYear}
        onFiscalYearChange={page.report.setFiscalYear}
        onRefresh={page.reload}
        loading={page.loading}
      />

      <ZoneUtilizationTable rows={page.report.rows} loading={page.report.loading} />

      <WaterSourceCategoryChart data={page.categoryData} />

      <WaterPageLinks onNavigate={navigate} />

      <WaterUtilizationOverviewFilters />
      <WaterUtilizationOverviewForm />
    </div>
  );
}
