import React, { useEffect, useMemo, useState } from 'react';
import { App } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { irrigationStudyDesignApi } from '../../../../services/api/irrigationApi';
import useIrrigationRecords from '../../shared/hooks/useIrrigationRecords';
import { CURRENT_FISCAL_YEAR } from '../../shared/constants';
import { exportRowsToCsv, extractName, notifyApiError, sumBy, toNumber } from '../../shared/utils';
import IrrigationBreadcrumb from '../../shared/components/IrrigationBreadcrumb';
import IrrigationPageHeader from '../../shared/components/IrrigationPageHeader';
import LoadErrorAlert from '../../shared/components/LoadErrorAlert';
import IrrigationStatsSection from '../../shared/components/IrrigationStatsSection';

import IrrigationStudyDesignStats from './IrrigationStudyDesignStats';
import IrrigationStudyDesignFilters from './IrrigationStudyDesignFilters';
import IrrigationStudyDesignTable from './IrrigationStudyDesignTable';
import IrrigationStudyDesignForm from './IrrigationStudyDesignForm';
import IrrigationStudyDesignDetail from './IrrigationStudyDesignDetail';

/* Values mirror api/Modules/Irrigation/app/Support/IrrigationEnums.php. */

/* --- Study Modality / Execution Entities (Mapped to Excel rows) --- */
export const STUDY_MODALITIES = [
  { value: 'Consultant - Existing', label: 'Consultant-Led (Existing Scheme Rehabilitation)' },
  { value: 'Consultant - New', label: 'Consultant-Led (New Irrigation Scheme)' },
  { value: 'Program-Led', label: 'Program-Led Study (PACT / FSRP / GCF / CRIPS)' },
  { value: 'In-House Regional', label: 'In-House Capacity (Regional Bureau Experts)' },
  { value: 'In-House Zonal', label: 'In-House Capacity (Zonal Agriculture Office)' },
  { value: 'In-House Woreda', label: 'In-House Capacity (Woreda Irrigation Experts)' },
];

/* --- Study & Design Stages --- */
export const STUDY_STAGES = [
  'Preliminary Identification & Pipeline',
  'Feasibility & Hydrology Study',
  'Detailed Engineering Design',
  'Design Completed (Construction-Ready)',
];

/* --- Water Source Technologies --- */
export const WATER_SOURCES = [
  'River Diversion Weir (ወንዝ ጠለፋ)',
  'Micro-Earth Dam / Reservoir (የመስኖ ግድብ)',
  'Spring Development & Collection Chamber (ምንጭ ማጎልበት)',
  'Shallow / Deep Groundwater Wells (ጥልቅ/እጅ ጉድጓድ)',
  'River Pumping Scheme (Solar / Electric Pump)',
];

/* Pipeline page labels for the same water sources (same order). */
export const PIPELINE_WATER_SOURCES = [
  'River Diversion Weir (ወንዝ ጠለፋ)',
  'Micro-Earth Dam / Reservoir (የመስኖ ግድብ)',
  'Spring Development & Collection (ምንጭ ማጎልበት)',
  'Groundwater Shallow / Deep Wells (ጥልቅ/እጅ ጉድጓድ)',
  'River Pumping Scheme (Solar / Electric)',
];

/* --- Review & QA Statuses --- */
export const REVIEW_STATUSES = [
  'Pending Document Review',
  'Under Multi-Disciplinary Review',
  'Reviewed & Verified',
  'Revisions Required',
];

export const QA_STATUSES = [
  'Pending QA Audit',
  'Quality Assured (Certified Passed)',
  'Rectifications Required',
];

export const QA_PASSED = 'Quality Assured (Certified Passed)';
export const REVIEW_VERIFIED = 'Reviewed & Verified';

/** Defaults for a newly registered study project. */
export const NEW_STUDY_DEFAULTS = {
  study_modality: 'Consultant - New',
  study_stage: 'Detailed Engineering Design',
  water_source: WATER_SOURCES[0],
  command_area_hectares: 0,
  beneficiaries_male: 0,
  beneficiaries_female: 0,
  experts_trained_male: 0,
  experts_trained_female: 0,
  is_construction_ready: false,
};

/** Fields the client may write on create / update (server owns review & QA fields). */
export const STUDY_WRITABLE_FIELDS = [
  'fiscal_year', 'zone', 'woreda', 'kebele',
  'project_code', 'project_name', 'study_modality', 'study_stage', 'water_source',
  'lead_consultant_or_office', 'study_cost_etb', 'command_area_hectares',
  'beneficiaries_male', 'beneficiaries_female', 'experts_trained_male', 'experts_trained_female',
  'is_construction_ready',
];

export const modalityColor = (modality = '') => {
  if (modality.includes('Consultant')) return 'default';
  if (modality.includes('Program')) return 'default';
  if (modality.includes('Regional')) return 'default';
  return 'green';
};

export const isQaPassed = (status) => Boolean(status?.includes('Quality Assured'));




const COLUMNS = [
  ['Project Code', (p) => p.project_code],
  ['Project Name', (p) => p.project_name],
  ['Fiscal Year', (p) => p.fiscal_year],
  ['Modality', (p) => p.study_modality],
  ['Stage', (p) => p.study_stage],
  ['Water Source', (p) => p.water_source],
  ['Command Area (Ha)', (p) => toNumber(p.command_area_hectares)],
  ['Male Beneficiaries', (p) => toNumber(p.beneficiaries_male)],
  ['Female Beneficiaries', (p) => toNumber(p.beneficiaries_female)],
  ['Review Status', (p) => p.review_status],
  ['Latest Review Code', (p) => p.latest_review_code],
  ['Latest Review Verdict', (p) => p.latest_review_verdict],
  ['Latest Review Score', (p) => p.latest_review_score],
  ['QA Status', (p) => p.qa_status],
  ['Construction Ready', (p) => (p.is_construction_ready ? 'Yes' : 'No')],
  ['Zone', (p) => extractName(p.zone)],
  ['Woreda', (p) => extractName(p.woreda)],
  ['Kebele', (p) => extractName(p.kebele)],
];

export const exportStudyDesign = (rows) => exportRowsToCsv(rows, COLUMNS, 'Irrigation_Study_Design_Registry');












/** Map a pipeline record (navigation state) onto study form values. */
const pipelinePrefill = (p) => {
  const sourceIndex = PIPELINE_WATER_SOURCES.indexOf(p.water_source);
  return {
    project_code: `STD-${p.pipeline_code?.replace('PLN-', '') || Date.now()}`,
    project_name: p.scheme_name,
    water_source: WATER_SOURCES.includes(p.water_source) ? p.water_source : WATER_SOURCES[Math.max(sourceIndex, 0)],
    command_area_hectares: p.potential_area_ha,
    beneficiaries_male: p.estimated_beneficiaries_male,
    beneficiaries_female: p.estimated_beneficiaries_female,
    zone: extractName(p.zone, undefined),
    woreda: extractName(p.woreda, undefined),
    kebele: extractName(p.kebele, undefined),
    fiscal_year: p.fiscal_year || CURRENT_FISCAL_YEAR,
    study_modality: 'Consultant - New',
    study_stage: 'Feasibility & Hydrology Study',
    is_construction_ready: false,
  };
};

/**
 * State and server interaction for the Irrigation Study & Design registry:
 * loading, filters, KPIs, create / update / delete and the review & QA action.
 */
function useIrrigationStudyDesign() {
  const { message } = App.useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const [fiscalYear, setFiscalYear] = useState(CURRENT_FISCAL_YEAR);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalityFilter, setModalityFilter] = useState(null);
  const [stageFilter, setStageFilter] = useState(null);
  const [qaStatusFilter, setQaStatusFilter] = useState(null);

  // "Promote from Pipeline" bridge: { state: { fromPipeline: true, pipelineData } } opens a prefilled form.
  const [formState, setFormState] = useState(() => (
    location.state?.fromPipeline && location.state.pipelineData
      ? { open: true, project: null, prefill: pipelinePrefill(location.state.pipelineData) }
      : { open: false, project: null, prefill: null }
  ));

  const projects = useIrrigationRecords(irrigationStudyDesignApi.studyDesign, { fiscalYear });

  // Consume the navigation state once so a refresh does not re-open the form.
  useEffect(() => {
    if (location.state?.fromPipeline) navigate(location.pathname, { replace: true, state: null });
  }, [location.state, location.pathname, navigate]);

  const filteredProjects = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return projects.records.filter((p) => {
      const haystack = [p.project_code, p.project_name, p.lead_consultant_or_office, p.zone, p.woreda, p.kebele]
        .map((v) => extractName(v, '').toLowerCase());
      return (
        haystack.some((v) => v.includes(q))
        && (!modalityFilter || p.study_modality === modalityFilter)
        && (!stageFilter || p.study_stage === stageFilter)
        && (!qaStatusFilter || p.qa_status === qaStatusFilter)
      );
    });
  }, [projects.records, searchTerm, modalityFilter, stageFilter, qaStatusFilter]);

  const stats = useMemo(() => ({
    totalProjects: filteredProjects.length,
    readyForConstructionCount: filteredProjects.filter((p) => p.is_construction_ready).length,
    totalCommandArea: sumBy(filteredProjects, 'command_area_hectares'),
    totalBeneficiaries: sumBy(filteredProjects, 'beneficiaries_male') + sumBy(filteredProjects, 'beneficiaries_female'),
    totalTrainedExperts: sumBy(filteredProjects, 'experts_trained_male') + sumBy(filteredProjects, 'experts_trained_female'),
  }), [filteredProjects]);

  /** Create or update; resolves true when the server accepted the record. */
  const saveProject = async (values, editingProject, form) => {
    const payload = Object.fromEntries(
      [...STUDY_WRITABLE_FIELDS, 'zone_id', 'woreda_id', 'kebele_id']
        .filter((f) => values[f] !== undefined)
        .map((f) => [f, values[f]])
    );
    try {
      if (editingProject) {
        await projects.update(editingProject.id, payload);
        message.success('Study & Design record updated successfully');
      } else {
        await projects.create(payload);
        message.success('New irrigation study & design project registered successfully');
      }
      return true;
    } catch (err) {
      notifyApiError(message, err, 'Failed to save study record', form);
      return false;
    }
  };

  /** Document review & QA certification (PATCH study-design/{id}/review-qa). */
  const submitReviewQa = async (project, values, form) => {
    try {
      await projects.runAction(() => irrigationStudyDesignApi.studyDesign.reviewQa(project.id, {
        review_status: values.review_status,
        qa_status: values.qa_status,
        is_construction_ready: values.is_construction_ready,
        reviewer_expert: values.reviewer_expert,
        review_notes: values.review_notes,
        eth_month: values.eth_month,
        eth_day: values.eth_day,
        eth_year: values.eth_year,
      }));
      message.success('Technical Document Review and QA certification saved successfully');
      return true;
    } catch (err) {
      notifyApiError(message, err, 'Failed to log review & QA status', form);
      return false;
    }
  };

  const deleteProject = async (record) => {
    try {
      await projects.remove(record.id);
      message.success('Study record removed successfully');
    } catch (err) {
      notifyApiError(message, err, 'Failed to delete study record');
    }
  };

  const exportCsv = () => {
    if (!filteredProjects.length) {
      message.warning('No study records available to export');
      return;
    }
    exportStudyDesign(filteredProjects);
    message.success('Irrigation Study & Design ledger exported successfully');
  };

  return {
    fiscalYear,
    setFiscalYear,
    searchTerm,
    setSearchTerm,
    modalityFilter,
    setModalityFilter,
    stageFilter,
    setStageFilter,
    qaStatusFilter,
    setQaStatusFilter,
    projects,
    filteredProjects,
    stats,
    formState,
    openCreate: () => setFormState({ open: true, project: null, prefill: null }),
    openEdit: (project) => setFormState({ open: true, project, prefill: null }),
    closeForm: () => setFormState({ open: false, project: null, prefill: null }),
    saveProject,
    submitReviewQa,
    deleteProject,
    exportCsv,
  };
}


function IrrigationStudyDesignContent() {
  const page = useIrrigationStudyDesign();
  const [reviewProject, setReviewProject] = useState(null);
  const [dossierProject, setDossierProject] = useState(null);

  return (
    <div className="irr-page">
      <IrrigationBreadcrumb section="Irrigation Study & Design" title="Irrigation Study & Design Projects" />

      <LoadErrorAlert error={page.projects.error} onRetry={page.projects.reload} />

      <IrrigationStatsSection onRefresh={page.projects.reload} loading={page.projects.loading}>
        <IrrigationStudyDesignStats stats={page.stats} />
      </IrrigationStatsSection>

      <IrrigationPageHeader
        section="Irrigation Study & Design"
        title="Irrigation Study & Design Projects"
        subtitle="Tracking of consultant, program, and in-house engineering designs, technical document review, QA certification, and construction readiness"
        fiscalYear={page.fiscalYear}
        onFiscalYearChange={page.setFiscalYear}
        onRefresh={page.projects.reload}
        loading={page.projects.loading}
      >
        <IrrigationStudyDesignFilters
          searchTerm={page.searchTerm}
          onSearchChange={page.setSearchTerm}
          modalityFilter={page.modalityFilter}
          onModalityChange={page.setModalityFilter}
          stageFilter={page.stageFilter}
          onStageChange={page.setStageFilter}
          qaStatusFilter={page.qaStatusFilter}
          onQaStatusChange={page.setQaStatusFilter}
          onExport={page.exportCsv}
          onCreate={page.openCreate}
        />
      </IrrigationPageHeader>

      <IrrigationStudyDesignTable
        data={page.filteredProjects}
        loading={page.projects.loading}
        onView={setDossierProject}
        onReviewQa={setReviewProject}
        onEdit={page.openEdit}
        onDelete={page.deleteProject}
      />

      <IrrigationStudyDesignForm
        open={page.formState.open}
        editingProject={page.formState.project}
        locations={page.locations}
        fiscalYear={page.fiscalYear}
        nextCode={page.nextCode}
        onCancel={page.closeForm}
        onSubmit={page.saveProject}
        reviewProject={reviewProject}
        onCancelReview={() => setReviewProject(null)}
        onSubmitReview={page.saveReviewQa}
      />

      <IrrigationStudyDesignDetail project={dossierProject} onClose={() => setDossierProject(null)} />
    </div>
  );
}

export default function IrrigationStudyDesignManagement() {
  return (
    <App>
      <IrrigationStudyDesignContent />
    </App>
  );
}
