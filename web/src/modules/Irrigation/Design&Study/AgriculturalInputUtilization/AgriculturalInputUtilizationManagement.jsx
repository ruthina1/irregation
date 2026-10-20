import React, { useEffect, useMemo, useState } from 'react';
import { App } from 'antd';
import { irrigationStudyDesignApi } from '../../../../services/api/irrigationApi';
import useIrrigationRecords from '../../shared/hooks/useIrrigationRecords';
import { CURRENT_FISCAL_YEAR } from '../../shared/constants';
import { exportRowsToCsv, extractName, notifyApiError, percent, sumBy, toNumber } from '../../shared/utils';
import IrrigationBreadcrumb from '../../shared/components/IrrigationBreadcrumb';
import IrrigationPageHeader from '../../shared/components/IrrigationPageHeader';
import LoadErrorAlert from '../../shared/components/LoadErrorAlert';
import IrrigationStatsSection from '../../shared/components/IrrigationStatsSection';

import AgriculturalInputUtilizationStats from './AgriculturalInputUtilizationStats';
import AgriculturalInputUtilizationFilters from './AgriculturalInputUtilizationFilters';
import AgriculturalInputUtilizationTable from './AgriculturalInputUtilizationTable';
import AgriculturalInputUtilizationForm, { DispatchModal } from './AgriculturalInputUtilizationForm';
import AgriculturalInputUtilizationDetail from './AgriculturalInputUtilizationDetail';

/* --- Irrigation Season --- */
export const IRRIGATION_SEASONS = [
  { value: 'Bega Irrigation', label: 'Bega Irrigation (Dry Season)' },
  { value: 'Meher Supplemental', label: 'Meher Supplemental Irrigation' },
];

/* --- Input Name Options (IrrigationEnums::INPUT_NAMES) --- */
export const INPUT_NAME_OPTIONS = [
  {
    value: 'Fertilizer',
    label: 'Fertilizer',
    color: 'default',
    defaultUnit: 'Quintals',
    subTypes: ['DAP', 'Urea', 'NPS / NPSB + Zn', 'Bio-Fertilizer'],
  },
  {
    value: 'Improved Seed',
    label: 'Improved Seed',
    color: 'green',
    defaultUnit: 'Quintals',
    subTypes: ['Highland Irrigated Wheat', 'Hybrid Maize', 'Selected Teff', 'Pulses / Legumes', 'Horticultural Seeds'],
  },
  {
    value: 'Compost',
    label: 'Compost',
    color: 'orange',
    defaultUnit: 'Cubic Meters',
    subTypes: ['Local Pit Compost', 'Community Vermicompost', 'Decomposed Biomass'],
  },
  {
    value: 'Agro-Chemicals & Pesticides',
    label: 'Agro-Chemicals & Pesticides',
    color: 'red',
    defaultUnit: 'Liters',
    subTypes: ['Selective Herbicide', 'Fungicide / Rust Killer', 'Insecticide / Pesticide'],
  },
  {
    value: 'Other Inputs',
    label: 'Other Inputs',
    color: 'default',
    defaultUnit: 'Packets / Pieces',
    subTypes: ['Bio-Inoculants', 'Agricultural Lime', 'Sprayer Equipment', 'Irrigation Accessories'],
  },
];

export const findInputOption = (value) => INPUT_NAME_OPTIONS.find((o) => o.value === value) || INPUT_NAME_OPTIONS[0];

export const INPUT_UNITS = [
  { value: 'Quintals', label: 'Quintals' },
  { value: 'Liters', label: 'Liters' },
  { value: 'Cubic Meters', label: 'Cubic Meters' },
  { value: 'Packets / Pieces', label: 'Packets' },
];

export const CROPPING_ROUNDS = ['Round 1', 'Round 2', 'Round 3', 'Highland Irrigated Wheat'];

export const FUNDING_PROGRAMS = [
  'Regional Government Budget',
  'Federal Government Budget',
  'PACT Program',
  'FSRP Support',
  'GCF (Green Climate Fund)',
  'DRDIP Project',
  'CREW Project',
  'CRIPS Project',
  'Community SWC Contribution',
];

/** Server-owned allocation status (Pending -> In Progress -> Completed). */
export const INPUT_STATUS_COLORS = { Pending: 'default', 'In Progress': 'processing', Completed: 'success' };

/**
 * Suggested administrative stations (zone -> woreda -> kebeles). Free text is
 * also accepted; locations already used by saved records are added too.
 */
export const LOCATION_SUGGESTIONS = {
  'East Gojjam': { Dejen: ['Kurar', 'Gelgel'], Machakel: [] },
  'West Gojjam': { Mecha: ['Kudur', 'Merawi 01'], 'Yilmana Densa': [] },
  'North Shewa': { 'Basona Werana': ['Goshebado', 'Keyit'], 'Moretna Jiru': [] },
  'South Gondar': { Fogera: ['Woreta Zuria', 'Kuhar Michael'], Dera: [] },
};

/** Defaults for a new allocation plan. */
export const NEW_ALLOCATION_DEFAULTS = {
  irrigation_season: 'Bega Irrigation',
  cropping_round: 'Round 1',
  funding_program: 'Regional Government Budget',
  input_name: 'Fertilizer',
  unit: 'Quintals',
  specification: 'DAP',
  planned_target_qty: 0,
  covered_hectares: 0,
  beneficiaries_male: 0,
  beneficiaries_female: 0,
};




/** Share of the planned target already dispatched (0-100). */
export const deliveryPercent = (r) => {
  const planned = toNumber(r.planned_target_qty);
  return planned > 0 ? Math.min(100, Math.round((toNumber(r.distributed_qty) / planned) * 100)) : 0;
};




const COLUMNS = [
  ['Input Code', (r) => r.input_code],
  ['Fiscal Year', (r) => r.fiscal_year],
  ['Irrigation Season', (r) => r.irrigation_season],
  ['Input Name', (r) => r.input_name],
  ['Specification', (r) => r.specification],
  ['Unit', (r) => r.unit],
  ['Target Qty', (r) => toNumber(r.planned_target_qty)],
  ['Distributed Qty', (r) => toNumber(r.distributed_qty)],
  ['Covered Land (Ha)', (r) => toNumber(r.covered_hectares)],
  ['Male Beneficiaries', (r) => toNumber(r.beneficiaries_male)],
  ['Female Beneficiaries', (r) => toNumber(r.beneficiaries_female)],
  ['Round', (r) => r.cropping_round],
  ['Program', (r) => r.funding_program],
  ['Status', (r) => r.status],
  ['Zone', (r) => extractName(r.zone)],
  ['Woreda', (r) => extractName(r.woreda)],
  ['Kebele', (r) => extractName(r.kebele)],
];

export const exportInputs = (rows) => exportRowsToCsv(rows, COLUMNS, 'Irrigation_Input_Utilization');











/**
 * Agricultural input allocations: loading, filters, KPIs, create / update /
 * delete and dispatch logging. The server owns distributed_qty,
 * dispatch_history and status; the page only shows what it returns.
 */
function useAgriculturalInputs() {
  const { message } = App.useApp();

  const [fiscalYear, setFiscalYear] = useState(CURRENT_FISCAL_YEAR);
  const [searchTerm, setSearchTerm] = useState('');
  const [nameFilter, setNameFilter] = useState(null);
  const [seasonFilter, setSeasonFilter] = useState(null);
  const [roundFilter, setRoundFilter] = useState(null);

  const inputs = useIrrigationRecords(irrigationStudyDesignApi.inputs, { fiscalYear });

  const filteredRecords = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return inputs.records.filter((r) => {
      const haystack = [r.input_code, r.item_name, r.input_name, r.specification, r.zone, r.woreda, r.kebele]
        .map((v) => extractName(v, '').toLowerCase());
      return haystack.some((v) => v.includes(q))
        && (!nameFilter || r.input_name === nameFilter)
        && (!seasonFilter || r.irrigation_season === seasonFilter)
        && (!roundFilter || r.cropping_round === roundFilter);
    });
  }, [inputs.records, searchTerm, nameFilter, seasonFilter, roundFilter]);

  const stats = useMemo(() => {
    const totalPlanned = sumBy(filteredRecords, 'planned_target_qty');
    const totalDistributed = sumBy(filteredRecords, 'distributed_qty');
    return {
      totalRecords: filteredRecords.length,
      totalDistributed,
      totalLandHectares: sumBy(filteredRecords, 'covered_hectares'),
      totalBeneficiaries: sumBy(filteredRecords, 'beneficiaries_male') + sumBy(filteredRecords, 'beneficiaries_female'),
      completionRate: percent(totalDistributed, totalPlanned),
    };
  }, [filteredRecords]);

  /** Zone -> woreda -> kebeles suggestions, merged with saved records' locations. */
  const locations = useMemo(() => {
    const map = {};
    const add = (zone, woreda, kebele) => {
      if (!zone) return;
      map[zone] = map[zone] || {};
      if (!woreda) return;
      map[zone][woreda] = map[zone][woreda] || new Set();
      if (kebele) map[zone][woreda].add(kebele);
    };
    Object.entries(LOCATION_SUGGESTIONS).forEach(([z, ws]) => {
      add(z);
      Object.entries(ws).forEach(([w, ks]) => {
        add(z, w);
        ks.forEach((k) => add(z, w, k));
      });
    });
    inputs.records.forEach((r) => add(extractName(r.zone, ''), extractName(r.woreda, ''), extractName(r.kebele, '')));
    return Object.fromEntries(Object.entries(map).map(([z, ws]) => [
      z, Object.fromEntries(Object.entries(ws).map(([w, ks]) => [w, [...ks]])),
    ]));
  }, [inputs.records]);

  /** Create or update; resolves true when the server accepted the record. */
  const saveAllocation = async (values, editingRecord, form) => {
    try {
      if (editingRecord) {
        await inputs.update(editingRecord.id, values);
        message.success('Input allocation record updated successfully');
      } else {
        await inputs.create(values);
        message.success('New input allocation registered successfully');
      }
      return true;
    } catch (err) {
      notifyApiError(message, err, 'Failed to save input record', form);
      return false;
    }
  };

  /** Log a dispatch; the server appends the ledger entry and recomputes totals. */
  const dispatchInput = async (record, values, form) => {
    try {
      await inputs.runAction(() => irrigationStudyDesignApi.inputs.dispatch(record.id, values));
      message.success(`Logged ${Number(values.dispatch_qty).toLocaleString()} ${record.unit} distribution successfully`);
      return true;
    } catch (err) {
      notifyApiError(message, err, 'Failed to log dispatched quantity', form);
      return false;
    }
  };

  const deleteAllocation = async (record) => {
    try {
      await inputs.remove(record.id);
      message.success('Input utilization record deleted successfully');
    } catch (err) {
      notifyApiError(message, err, 'Failed to delete input record');
    }
  };

  const exportCsv = () => {
    if (!filteredRecords.length) {
      message.warning('No records available to export');
      return;
    }
    exportInputs(filteredRecords);
    message.success('Input utilization dataset exported successfully');
  };

  return {
    fiscalYear,
    setFiscalYear,
    searchTerm,
    setSearchTerm,
    nameFilter,
    setNameFilter,
    seasonFilter,
    setSeasonFilter,
    roundFilter,
    setRoundFilter,
    inputs,
    filteredRecords,
    stats,
    locations,
    saveAllocation,
    dispatchInput,
    deleteAllocation,
    exportCsv,
  };
}


function AgriculturalInputUtilizationContent() {
  const page = useAgriculturalInputs();
  const [formState, setFormState] = useState({ open: false, record: null });
  const [dispatchRecord, setDispatchRecord] = useState(null);
  const [dossierId, setDossierId] = useState(null);

  const dossierRecord = page.inputs.records.find((r) => r.id === dossierId) || null;

  return (
    <div className="irr-page">
      <IrrigationBreadcrumb section="Irrigation Development & Drainage" title="Agricultural Input Utilization" />

      <LoadErrorAlert error={page.inputs.error} onRetry={page.inputs.reload} />

      <IrrigationStatsSection onRefresh={page.inputs.reload} loading={page.inputs.loading}>
        <AgriculturalInputUtilizationStats stats={page.stats} />
      </IrrigationStatsSection>

      <IrrigationPageHeader
        section="Irrigation Development & Drainage"
        title="Agricultural Input Utilization"
        subtitle="Distribution tracking for Fertilizer, Improved Seeds, Compost, and Agro-Chemicals across irrigation seasons"
        fiscalYear={page.fiscalYear}
        onFiscalYearChange={page.setFiscalYear}
        onRefresh={page.inputs.reload}
        loading={page.inputs.loading}
      >
        <AgriculturalInputUtilizationFilters
          searchTerm={page.searchTerm}
          onSearchChange={page.setSearchTerm}
          nameFilter={page.nameFilter}
          onNameChange={page.setNameFilter}
          seasonFilter={page.seasonFilter}
          onSeasonChange={page.setSeasonFilter}
          roundFilter={page.roundFilter}
          onRoundChange={page.setRoundFilter}
          onExport={page.exportCsv}
          onCreate={() => setFormState({ open: true, record: null })}
        />
      </IrrigationPageHeader>

      <AgriculturalInputUtilizationTable
        data={page.filteredRecords}
        loading={page.inputs.loading}
        onDispatch={setDispatchRecord}
        onView={(record) => setDossierId(record.id)}
        onEdit={(record) => setFormState({ open: true, record })}
        onDelete={page.deleteAllocation}
      />

      <AgriculturalInputUtilizationForm
        open={formState.open}
        editingRecord={formState.record}
        fiscalYear={page.fiscalYear}
        nextCode={`INP-${page.fiscalYear.slice(0, 4)}-${String(page.inputs.records.length + 1).padStart(3, '0')}`}
        locations={page.locations}
        onCancel={() => setFormState({ open: false, record: null })}
        onSubmit={(values, form) => page.saveAllocation(values, formState.record, form)}
        dispatchRecord={dispatchRecord}
        onCancelDispatch={() => setDispatchRecord(null)}
        onSubmitDispatch={page.dispatchInput}
      />

      <AgriculturalInputUtilizationDetail record={dossierRecord} onClose={() => setDossierId(null)} />
    </div>
  );
}

export default function AgriculturalInputUtilizationManagement() {
  return (
    <App>
      <AgriculturalInputUtilizationContent />
    </App>
  );
}
