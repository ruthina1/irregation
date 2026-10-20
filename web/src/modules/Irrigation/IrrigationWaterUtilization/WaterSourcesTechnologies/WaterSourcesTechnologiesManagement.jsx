import { useMemo, useState } from 'react';
import { App } from 'antd';
import irrigationApi from '../../../../services/api/irrigationApi';
import useIrrigationRecords from '../../shared/hooks/useIrrigationRecords';
import { CURRENT_FISCAL_YEAR } from '../../shared/constants';
import { exportRowsToCsv, extractName, notifyApiError, sumBy, toNumber } from '../../shared/utils';
import IrrigationBreadcrumb from '../../shared/components/IrrigationBreadcrumb';
import IrrigationPageHeader from '../../shared/components/IrrigationPageHeader';
import LoadErrorAlert from '../../shared/components/LoadErrorAlert';
import IrrigationStatsSection from '../../shared/components/IrrigationStatsSection';
import WaterSourceStats, { WaterSourceCategoryChart } from './WaterSourcesTechnologiesStats';
import WaterSourceFilters from './WaterSourcesTechnologiesFilters';
import WaterSourceTable from './WaterSourcesTechnologiesTable';
import WaterSourceFormModal from './WaterSourcesTechnologiesForm';
import WaterSourceDossierModal from './WaterSourcesTechnologiesDetail';

export * from './WaterSourcesTechnologiesConstants';
import {
  TECHNOLOGY_CATALOG_GROUPS,
  TECHNOLOGY_STATUSES,
  SOURCE_COLORS,
  NEW_SOURCE_DEFAULTS,
  isSolar,
  isDeepWell,
  technologyColor,
} from './WaterSourcesTechnologiesConstants';



const COLUMNS = [
  ['Scheme Name', (r) => r.scheme_name],
  ['WUA Name', (r) => r.wua_name],
  ['Technology Type', (r) => r.technology_type],
  ['Category', (r) => r.source_category],
  ['Discharge (L/s)', (r) => toNumber(r.discharge_capacity_liters_sec)],
  ['Units', (r) => toNumber(r.equipment_units_count)],
  ['Command Area (Ha)', (r) => toNumber(r.command_area_served_ha)],
  ['Energy Source', (r) => r.energy_source],
  ['Male Farmers', (r) => toNumber(r.farmers_male)],
  ['Female Farmers', (r) => toNumber(r.farmers_female)],
  ['Total Farmers', (r) => toNumber(r.farmers_male) + toNumber(r.farmers_female)],
  ['Status', (r) => r.operational_status],
  ['Year', (r) => r.installation_eth_year],
  ['Zone', (r) => extractName(r.zone)],
  ['Woreda', (r) => extractName(r.woreda)],
];

export const exportWaterSources = (rows) => exportRowsToCsv(rows, COLUMNS, 'Irrigation_Water_Sources_Ledger');



/**
 * Water sources & abstraction technologies (irrigation/water-utilization/water-sources):
 * loading, filters, KPIs, category chart data and mutations.
 * `withWuaLookup` also loads registered WUAs for the WUA dropdown.
 */
function useWaterSources({ withWuaLookup = false } = {}) {
  const { message } = App.useApp();

  const [fiscalYear, setFiscalYear] = useState(CURRENT_FISCAL_YEAR);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);

  const sources = useIrrigationRecords(irrigationApi.waterSources, { fiscalYear });
  const schemes = useIrrigationRecords(irrigationApi.constructionProjects, { fiscalYear });
  const wuas = useIrrigationRecords(irrigationApi.waterUsersAssociations, { fiscalYear, enabled: withWuaLookup });

  const filteredRecords = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return sources.records.filter((r) => {
      const haystack = [r.scheme_name, r.wua_name, r.technology_type, r.zone, r.woreda].map((v) => extractName(v, '').toLowerCase());
      return haystack.some((v) => v.includes(q)) && (!statusFilter || r.operational_status === statusFilter);
    });
  }, [sources.records, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const totalMale = sumBy(filteredRecords, 'farmers_male');
    const totalFemale = sumBy(filteredRecords, 'farmers_female');
    return {
      totalSchemes: filteredRecords.length,
      totalDischargeCapacity: sumBy(filteredRecords, 'discharge_capacity_liters_sec'),
      totalCommandHa: sumBy(filteredRecords, 'command_area_served_ha'),
      solarPumpCount: filteredRecords.filter((r) => isSolar(r.technology_type)).length,
      deepWellCount: filteredRecords.filter((r) => isDeepWell(r.technology_type)).length,
      totalMale,
      totalFemale,
      totalFarmers: totalMale + totalFemale,
    };
  }, [filteredRecords]);

  const categoryChartData = useMemo(() => {
    const map = {};
    filteredRecords.forEach((r) => {
      const cat = r.source_category || 'Surface Water & Gravity Diversion';
      map[cat] = (map[cat] || 0) + (Number(r.command_area_served_ha) || 0);
    });
    return Object.entries(map).map(([name, value], i) => ({ name, value, color: SOURCE_COLORS[i % SOURCE_COLORS.length] }));
  }, [filteredRecords]);

  const saveRecord = async (values, editing, form) => {
    try {
      if (editing) {
        await sources.update(editing.id, values);
        message.success('Water source technology record updated successfully');
      } else {
        await sources.create(values);
        message.success('New water abstraction technology record registered successfully');
      }
      return true;
    } catch (err) {
      notifyApiError(message, err, 'Failed to save record', form);
      return false;
    }
  };

  const changeStatus = async (record, status) => {
    try {
      await sources.patch(record.id, { operational_status: status });
      message.success(`Status updated to "${status}"`);
    } catch (err) {
      notifyApiError(message, err, 'Failed to update status');
    }
  };

  const deleteRecord = async (record) => {
    try {
      await sources.remove(record.id);
      message.success('Source record removed');
    } catch (err) {
      notifyApiError(message, err, 'Failed to delete record');
    }
  };

  const exportCsv = () => {
    if (!filteredRecords.length) {
      message.warning('No records available to export');
      return;
    }
    exportWaterSources(filteredRecords);
    message.success('Water sources ledger exported successfully');
  };

  const findScheme = (name) => schemes.records.find(
    (s) => extractName(s.scheme_name, '').toLowerCase() === (name || '').toLowerCase()
  );

  return {
    fiscalYear, setFiscalYear, searchTerm, setSearchTerm, statusFilter, setStatusFilter,
    sources, schemes: schemes.records, wuas: wuas.records,
    lookupError: schemes.error || wuas.error,
    reloadLookups: () => { schemes.reload(); wuas.reload(); },
    filteredRecords, stats, categoryChartData,
    saveRecord, changeStatus, deleteRecord, exportCsv, findScheme,
  };
}


const CONFIG = {
  title: 'Water Sources & Technologies (የመስኖ መገኛ እና ቴክኖሎጂዎች)',
  subtitle: 'Abstraction infrastructure: Diversions, springs, solar/motor pumps, deep/shallow wells, geomembrane and concrete ponds',
  formSection1: '1. Irrigation Scheme & Operating WUA Linkage',
  withWuaDropdown: false,
};

function WaterSourcesTechnologiesContent() {
  const page = useWaterSources({ withWuaLookup: CONFIG.withWuaDropdown });

  const [formState, setFormState] = useState({ open: false, record: null });
  const [dossierRecord, setDossierRecord] = useState(null);

  const refresh = () => {
    page.sources.reload();
    page.reloadLookups();
  };

  return (
    <div className="irr-page">
      <IrrigationBreadcrumb section="Irrigation Water Utilization" title={CONFIG.title} />

      <LoadErrorAlert error={page.sources.error} onRetry={page.sources.reload} />
      <LoadErrorAlert
        error={page.lookupError ? `Scheme / WUA lookups: ${page.lookupError}` : null}
        onRetry={page.reloadLookups}
      />

      <IrrigationStatsSection onRefresh={refresh} loading={page.sources.loading}>
        <WaterSourceStats stats={page.stats} />
      </IrrigationStatsSection>

      <IrrigationPageHeader
        section="Irrigation Water Utilization"
        title={CONFIG.title}
        subtitle={CONFIG.subtitle}
        fiscalYear={page.fiscalYear}
        onFiscalYearChange={page.setFiscalYear}
        onRefresh={refresh}
        loading={page.sources.loading}
      >
        <WaterSourceFilters
          searchTerm={page.searchTerm}
          onSearchChange={page.setSearchTerm}
          statusFilter={page.statusFilter}
          onStatusChange={page.setStatusFilter}
          onExport={page.exportCsv}
          onCreate={() => setFormState({ open: true, record: null })}
        />
      </IrrigationPageHeader>

      <WaterSourceTable
        data={page.filteredRecords}
        loading={page.sources.loading}
        onView={setDossierRecord}
        onEdit={(record) => setFormState({ open: true, record })}
        onDelete={page.deleteRecord}
        onStatusChange={page.changeStatus}
      />

      <WaterSourceCategoryChart data={page.categoryChartData} />

      <WaterSourceFormModal
        open={formState.open}
        editingRecord={formState.record}
        schemes={page.schemes}
        wuaOptions={CONFIG.withWuaDropdown ? page.wuas : undefined}
        fiscalYear={page.fiscalYear}
        findScheme={page.findScheme}
        labels={{ formSection1: CONFIG.formSection1 }}
        onCancel={() => setFormState({ open: false, record: null })}
        onSubmit={(values, form) => page.saveRecord(values, formState.record, form)}
      />

      <WaterSourceDossierModal
        record={dossierRecord}
        onClose={() => setDossierRecord(null)}
        emphasizeWua={CONFIG.withWuaDropdown}
      />
    </div>
  );
}

export default function WaterSourcesTechnologiesManagement() {
  return (
    <App>
      <WaterSourcesTechnologiesContent />
    </App>
  );
}
