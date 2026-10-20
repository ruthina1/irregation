import { locationApi } from '../../../../services/api/locationApi';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { App } from 'antd';
import { irrigationStudyDesignApi } from '../../../../services/api/irrigationApi';
import useIrrigationRecords from '../../shared/hooks/useIrrigationRecords';
import { CURRENT_FISCAL_YEAR } from '../../shared/constants';
import { exportRowsToCsv, extractName, notifyApiError, sumBy, toNumber } from '../../shared/utils';
import IrrigationBreadcrumb from '../../shared/components/IrrigationBreadcrumb';
import IrrigationPageHeader from '../../shared/components/IrrigationPageHeader';
import LoadErrorAlert from '../../shared/components/LoadErrorAlert';
import IrrigationStatsSection from '../../shared/components/IrrigationStatsSection';

import ProjectIdentificationPipelineStats from './ProjectIdentificationPipelineStats';
import ProjectIdentificationPipelineFilters from './ProjectIdentificationPipelineFilters';
import ProjectIdentificationPipelineTable from './ProjectIdentificationPipelineTable';
import ProjectIdentificationPipelineForm from './ProjectIdentificationPipelineForm';
import ProjectIdentificationPipelineDetail from './ProjectIdentificationPipelineDetail';

/* Values mirror api/Modules/Irrigation/app/Support/IrrigationEnums.php exactly. */

/* --- Source of Initiative / Proposal --- */
export const INITIATIVE_SOURCES = [
  'Community Petition & Demand (የአርሶ አደር ጥያቄ)',
  'Woreda Agriculture Master Plan',
  'Integrated Watershed Catchment Scouting',
  'Regional Water Basin Survey',
  'Donor & Program Scouting (PACT/FSRP/GCF)',
];

/* --- Water Source Technologies --- */
export const WATER_SOURCES = [
  'River Diversion Weir (ወንዝ ጠለፋ)',
  'Micro-Earth Dam / Reservoir (የመስኖ ግድብ)',
  'Spring Development & Collection (ምንጭ ማጎልበት)',
  'Groundwater Shallow / Deep Wells (ጥልቅ/እጅ ጉድጓድ)',
  'River Pumping Scheme (Solar / Electric)',
];

/* --- Pipeline & Reconnaissance Screening Statuses --- */
export const PIPELINE_STATUSES = [
  'Initial Pipeline Identification',
  'Field Reconnaissance Completed',
  'Hydrologically Feasible',
  'Approved for Detailed Study & Design',
  'Infeasible / Deferred',
];

export const PIPELINE_APPROVED = 'Approved for Detailed Study & Design';

/* --- Priority Levels --- */
export const PRIORITY_LEVELS = ['High Priority', 'Medium Priority', 'Low Priority'];

export const PRIORITY_COLORS = { 'High Priority': 'red', 'Medium Priority': 'orange' };

export const STATUS_COLORS = {
  'Approved for Detailed Study & Design': 'success',
  'Hydrologically Feasible': 'processing',
  'Field Reconnaissance Completed': 'warning',
};

/** Placeholder the server stores until a reconnaissance is recorded. */
export const PENDING_EXPERT = 'Pending Field Reconnaissance';

/** Defaults for a newly identified pipeline scheme. */
export const NEW_PIPELINE_DEFAULTS = {
  initiative_source: INITIATIVE_SOURCES[0],
  water_source: WATER_SOURCES[0],
  priority_level: 'High Priority',
  potential_area_ha: 0,
  estimated_beneficiaries_male: 0,
  estimated_beneficiaries_female: 0,
};







const toList = (res) => {
  const list = res?.data?.data?.data || res?.data?.data || res?.data || [];
  return Array.isArray(list) ? list : [];
};

const toOption = (item, nameKey) => {
  const id = item.id ?? item._id;
  const name = item.name || item[nameKey] || String(id);
  return { id, value: name, label: name };
};

/**
 * Zone → woreda → kebele lookups from the shared location service.
 * Lists are cached per parent id; if a lookup fails the user is told and
 * can still type the location names (the form uses AutoComplete).
 */
function useLocationOptions() {
  const { message } = App.useApp();
  const [zones, setZones] = useState([]);
  const [woredasByZone, setWoredasByZone] = useState({});
  const [kebelesByWoreda, setKebelesByWoreda] = useState({});
  const requested = useRef(new Set());

  useEffect(() => {
    let current = true;
    locationApi.getZones().then(
      (res) => {
        if (current) setZones(toList(res).map((z) => toOption(z, 'zone_name')));
      },
      (err) => {
        if (current) notifyApiError(message, err, 'Zone list could not be loaded; type the location names instead.');
      }
    );
    return () => {
      current = false;
    };
  }, [message]);

  const loadWoredas = useCallback((zoneId) => {
    const key = `w${zoneId}`;
    if (!zoneId || requested.current.has(key)) return;
    requested.current.add(key);
    locationApi.getWoredas(zoneId).then(
      (res) => setWoredasByZone((prev) => ({ ...prev, [zoneId]: toList(res).map((w) => toOption(w, 'woreda_name')) })),
      (err) => {
        requested.current.delete(key);
        notifyApiError(message, err, 'Woreda list could not be loaded; type the woreda name instead.');
      }
    );
  }, [message]);

  const loadKebeles = useCallback((woredaId) => {
    const key = `k${woredaId}`;
    if (!woredaId || requested.current.has(key)) return;
    requested.current.add(key);
    locationApi.getKebeles(woredaId).then(
      (res) => setKebelesByWoreda((prev) => ({ ...prev, [woredaId]: toList(res).map((k) => toOption(k, 'kebele_name')) })),
      (err) => {
        requested.current.delete(key);
        notifyApiError(message, err, 'Kebele list could not be loaded; type the kebele name instead.');
      }
    );
  }, [message]);

  return { zones, woredasByZone, kebelesByWoreda, loadWoredas, loadKebeles };
}




const COLUMNS = [
  ['Pipeline Code', (p) => p.pipeline_code],
  ['Scheme Name', (p) => p.scheme_name],
  ['Fiscal Year', (p) => p.fiscal_year],
  ['Initiative Source', (p) => p.initiative_source],
  ['Water Source', (p) => p.water_source],
  ['Potential Area (Ha)', (p) => toNumber(p.potential_area_ha)],
  ['Male Beneficiaries', (p) => toNumber(p.estimated_beneficiaries_male)],
  ['Female Beneficiaries', (p) => toNumber(p.estimated_beneficiaries_female)],
  ['Priority', (p) => p.priority_level],
  ['Status', (p) => p.pipeline_status],
  ['Promoted to Study', (p) => (p.promoted_to_study ? 'Yes' : 'No')],
  ['Zone', (p) => extractName(p.zone)],
  ['Woreda', (p) => extractName(p.woreda)],
  ['Kebele', (p) => extractName(p.kebele)],
];

export const exportPipeline = (rows) => exportRowsToCsv(rows, COLUMNS, 'Irrigation_Project_Pipeline');











/** Client-writable pipeline fields (server-owned screening fields are never sent). */
const WRITABLE_FIELDS = [
  'pipeline_code', 'scheme_name', 'initiative_source', 'water_source', 'priority_level',
  'potential_area_ha', 'estimated_budget_etb', 'estimated_beneficiaries_male', 'estimated_beneficiaries_female',
  'site_notes', 'fiscal_year', 'zone', 'woreda', 'kebele', 'zone_id', 'woreda_id', 'kebele_id',
];

const toPayload = (values) => Object.fromEntries(
  WRITABLE_FIELDS.filter((f) => values[f] !== undefined).map((f) => [f, values[f] === '' ? null : values[f]])
);

/**
 * State and server interaction for the Project Identification & Pipeline page:
 * loading, filters, KPIs, create / update / delete and reconnaissance screening.
 */
function useProjectIdentificationPipeline() {
  const { message } = App.useApp();

  const [fiscalYear, setFiscalYear] = useState(CURRENT_FISCAL_YEAR);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);
  const [priorityFilter, setPriorityFilter] = useState(null);
  const [waterSourceFilter, setWaterSourceFilter] = useState(null);

  const pipeline = useIrrigationRecords(irrigationStudyDesignApi.pipeline, { fiscalYear });

  const filteredProjects = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return pipeline.records.filter((p) => {
      const haystack = [p.pipeline_code, p.scheme_name, p.zone, p.woreda, p.kebele]
        .map((v) => extractName(v, '').toLowerCase());
      return (
        haystack.some((v) => v.includes(q))
        && (!statusFilter || p.pipeline_status === statusFilter)
        && (!priorityFilter || p.priority_level === priorityFilter)
        && (!waterSourceFilter || p.water_source === waterSourceFilter)
      );
    });
  }, [pipeline.records, searchTerm, statusFilter, priorityFilter, waterSourceFilter]);

  const stats = useMemo(() => ({
    totalIdentified: filteredProjects.length,
    approvedForStudyCount: filteredProjects.filter((p) => p.pipeline_status === PIPELINE_APPROVED).length,
    totalPotentialArea: sumBy(filteredProjects, 'potential_area_ha'),
    totalBeneficiaries: sumBy(filteredProjects, 'estimated_beneficiaries_male') + sumBy(filteredProjects, 'estimated_beneficiaries_female'),
    highPriorityCount: filteredProjects.filter((p) => p.priority_level === 'High Priority').length,
  }), [filteredProjects]);

  /** Create or update; resolves true when the server accepted the record. */
  const saveProject = async (values, editingProject, form) => {
    try {
      if (editingProject) {
        await pipeline.update(editingProject.id, toPayload(values));
        message.success('Pipeline project updated successfully');
      } else {
        await pipeline.create(toPayload(values));
        message.success('New irrigation pipeline project identified and logged successfully');
      }
      return true;
    } catch (err) {
      notifyApiError(message, err, 'Failed to save pipeline project', form);
      return false;
    }
  };

  /** Record a reconnaissance screening decision (PATCH pipeline/{id}/screening). */
  const screenProject = async (project, values, form) => {
    try {
      const updated = await pipeline.runAction(() => irrigationStudyDesignApi.pipeline.screen(project.id, {
        pipeline_status: values.pipeline_status,
        promoted_to_study: Boolean(values.promoted_to_study),
        reconnaissance_expert: values.reconnaissance_expert,
        site_notes: values.site_notes || null,
        eth_month: values.eth_month,
        eth_day: values.eth_day,
        eth_year: values.eth_year,
      }));
      message.success('Reconnaissance screening evaluation logged successfully');
      if (updated.promoted_study_id && !project.promoted_study_id) {
        message.info(`"${updated.scheme_name}" was promoted: a study & design project was created for it.`);
      }
      return true;
    } catch (err) {
      notifyApiError(message, err, 'Failed to update screening evaluation', form);
      return false;
    }
  };

  const deleteProject = async (record) => {
    try {
      await pipeline.remove(record.id);
      message.success('Pipeline project record removed successfully');
    } catch (err) {
      notifyApiError(message, err, 'Failed to delete pipeline project');
    }
  };

  const exportCsv = () => {
    if (!filteredProjects.length) {
      message.warning('No pipeline records available to export');
      return;
    }
    exportPipeline(filteredProjects);
    message.success('Project pipeline exported successfully');
  };

  return {
    fiscalYear,
    setFiscalYear,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    waterSourceFilter,
    setWaterSourceFilter,
    pipeline,
    filteredProjects,
    stats,
    saveProject,
    screenProject,
    deleteProject,
    exportCsv,
  };
}


function ProjectIdentificationContent() {
  const page = useProjectIdentificationPipeline();
  const locations = useLocationOptions();

  const [formState, setFormState] = useState({ open: false, project: null });
  const [screeningProject, setScreeningProject] = useState(null);
  const [dossierProject, setDossierProject] = useState(null);

  return (
    <div className="irr-page">
      <IrrigationBreadcrumb section="Irrigation Study & Design" title="Project Identification & Pipeline (አዳዲስ የመስኖ ፕሮጀክቶች የጥናት ስራ)" />

      <LoadErrorAlert error={page.pipeline.error} onRetry={page.pipeline.reload} />

      <IrrigationStatsSection onRefresh={page.pipeline.reload} loading={page.pipeline.loading}>
        <ProjectIdentificationPipelineStats stats={page.stats} />
      </IrrigationStatsSection>

      <IrrigationPageHeader
        section="Irrigation Study & Design"
        title="Project Identification & Pipeline (አዳዲስ የመስኖ ፕሮጀክቶች የጥናት ስራ)"
        subtitle="Preliminary screening, reconnaissance surveys, community demand verification, and preparation for detailed engineering design"
        fiscalYear={page.fiscalYear}
        onFiscalYearChange={page.setFiscalYear}
        onRefresh={page.pipeline.reload}
        loading={page.pipeline.loading}
      >
        <ProjectIdentificationPipelineFilters
          searchTerm={page.searchTerm}
          onSearchChange={page.setSearchTerm}
          statusFilter={page.statusFilter}
          onStatusChange={page.setStatusFilter}
          priorityFilter={page.priorityFilter}
          onPriorityChange={page.setPriorityFilter}
          waterSourceFilter={page.waterSourceFilter}
          onWaterSourceChange={page.setWaterSourceFilter}
          onExport={page.exportCsv}
          onCreate={() => setFormState({ open: true, project: null })}
        />
      </IrrigationPageHeader>

      <ProjectIdentificationPipelineTable
        data={page.filteredProjects}
        loading={page.pipeline.loading}
        onView={setDossierProject}
        onScreen={setScreeningProject}
        onEdit={(project) => setFormState({ open: true, project })}
        onDelete={page.deleteProject}
      />

      <ProjectIdentificationPipelineForm
        open={formState.open}
        editingProject={formState.project}
        locations={locations}
        fiscalYear={page.fiscalYear}
        nextCode={`PIP-${page.fiscalYear.slice(0, 4)}-${String(page.pipeline.records.length + 1).padStart(3, '0')}`}
        onCancel={() => setFormState({ open: false, project: null })}
        onSubmit={(values, form) => page.saveProject(values, formState.project, form)}
        screeningProject={screeningProject}
        onCancelScreening={() => setScreeningProject(null)}
        onSubmitScreening={page.saveScreening}
      />

      <ProjectIdentificationPipelineDetail project={dossierProject} onClose={() => setDossierProject(null)} />
    </div>
  );
}

export default function ProjectIdentificationPipelineManagement() {
  return (
    <App>
      <ProjectIdentificationContent />
    </App>
  );
}
