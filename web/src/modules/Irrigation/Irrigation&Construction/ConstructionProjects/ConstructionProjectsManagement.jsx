import { useEffect, useMemo, useRef, useState } from 'react';
import { App } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import irrigationApi from '../../../../services/api/irrigationApi';
import useIrrigationRecords from '../../shared/hooks/useIrrigationRecords';
import { CURRENT_FISCAL_YEAR } from '../../shared/constants';
import { exportRowsToCsv, extractName, notifyApiError, sumBy, toNumber } from '../../shared/utils';
import IrrigationBreadcrumb from '../../shared/components/IrrigationBreadcrumb';
import IrrigationPageHeader from '../../shared/components/IrrigationPageHeader';
import LoadErrorAlert from '../../shared/components/LoadErrorAlert';
import IrrigationStatsSection from '../../shared/components/IrrigationStatsSection';
import ProjectStats from './ConstructionProjectsStats';
import ProjectFilters from './ConstructionProjectsFilters';
import ProjectTable from './ConstructionProjectsTable';
import ProjectFormModal, { EvaluateProgressModal } from './ConstructionProjectsForm';
import ProjectDossierModal from './ConstructionProjectsDetail';

export const SCHEME_TYPES = [
  { value: 'Existing Rehabilitation', label: 'Existing Scheme Rehabilitation (የነባር መስኖ ግንባታ)' },
  { value: 'New Construction', label: 'New Scheme Construction (የአዲስ መስኖ ግንባታ)' },
];

export const FUNDING_PROGRAMS = [
  'Regional Government Capital Budget (በክልል መንግስት በጀት)',
  'Federal Government Budget (በፌደራል መንግስት በጀት)',
  'PACT Program (በPACT በጀት)',
  'FSRP Program (በFSRP በጀት)',
  'Lease / Direct Support Financing (በኪራይ/ግልጽ ድጋፍ)',
  'Green Climate Fund (GCF) (በGCF በጀት)',
  'DRDIP Project (በDRDIP በጀት)',
  'CREW Project (በCREW በጀት)',
  'CRIPS Project (በCRIPS በጀት)',
];

export const CONTRACTOR_GRADES = [
  'Water Works General Contractor (WWGC - Grade 1)',
  'Water Works General Contractor (WWGC - Grade 2 to 4)',
  'General Contractor (GC - Grade 1 to 3)',
  'Woreda / Community Force Account (ቀጥታ አፈፃፀም)',
  'Specialized Electro-Mechanical Contractor',
];

export const CONSTRUCTION_STATUSES = [
  { value: 'Mobilization & Site Handover', label: 'Mobilization & Site Handover', color: 'default' },
  { value: 'Active Construction', label: 'Active Construction', color: 'processing' },
  { value: 'Headwork Completed', label: 'Headwork Weir Completed', color: 'default' },
  { value: 'Substantially Completed', label: 'Substantially Completed (Testing / Wet Run)', color: 'default' },
  { value: 'Handed Over to Users', label: 'Handed Over to Water Users (Completed)', color: 'success' },
  { value: 'Suspended / Delayed', label: 'Suspended / In Dispute', color: 'error' },
];

export const PROGRESS_HEALTH_STATUSES = [
  { value: 'On Track', label: 'On Track (Normal Execution)', color: 'success' },
  { value: 'Minor Delay', label: 'Minor Delay (Lag < 10%)', color: 'default' },
  { value: 'Critical Delay', label: 'Critical Delay (Lag > 20%)', color: 'error' },
  { value: 'Ahead of Schedule', label: 'Ahead of Schedule', color: 'default' },
];

export const NEW_CONTRACT_DEFAULTS = {
  scheme_type: 'New Construction',
  funding_source: FUNDING_PROGRAMS[0],
  contractor_grade: CONTRACTOR_GRADES[0],
  physical_progress_pct: 0,
  defect_liability_months: 12,
};



const COLUMNS = [
  ['Contract Code', (p) => p.contract_code],
  ['Project Code', (p) => p.project_code],
  ['Scheme Name', (p) => p.scheme_name],
  ['Type', (p) => p.scheme_type],
  ['Funding Source', (p) => p.funding_source],
  ['Contractor', (p) => p.contractor_name],
  ['Grade', (p) => p.contractor_grade],
  ['Supervisor', (p) => p.consultant_supervisor],
  ['Contract Sum (ETB)', (p) => toNumber(p.contract_sum_etb)],
  ['Physical (%)', (p) => toNumber(p.physical_progress_pct)],
  ['Command Area (Ha)', (p) => toNumber(p.command_area_ha)],
  ['Male Beneficiaries', (p) => toNumber(p.beneficiaries_male)],
  ['Female Beneficiaries', (p) => toNumber(p.beneficiaries_female)],
  ['Status', (p) => p.construction_status],
  ['Registered WUA', (p) => p.wua_name],
  ['Zone', (p) => extractName(p.zone)],
  ['Woreda', (p) => extractName(p.woreda)],
];

export const exportConstructionProjects = (rows) => exportRowsToCsv(rows, COLUMNS, 'Irrigation_Construction_Projects');



const avgProgress = (rows) => (rows.length ? (sumBy(rows, 'physical_progress_pct') / rows.length).toFixed(1) : '0.0');

/**
 * Construction contracts: loading, filters, KPIs and create / update /
 * status / progress evaluation / delete against the Irrigation API.
 */
function useConstructionProjects(initialSearch = '') {
  const { message } = App.useApp();

  const [fiscalYear, setFiscalYear] = useState(CURRENT_FISCAL_YEAR);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [schemeTypeFilter, setSchemeTypeFilter] = useState(null);
  const [fundingFilter, setFundingFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);

  const projects = useIrrigationRecords(irrigationApi.constructionProjects, { fiscalYear });
  // Approved construction-ready designs offered in the registration combobox.
  const shelf = useIrrigationRecords(irrigationApi.constructionReady, { fiscalYear });

  const filteredProjects = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return projects.records.filter((p) => {
      const haystack = [p.contract_code, p.project_code, p.scheme_name, p.contractor_name, p.zone, p.woreda, p.wua_name]
        .map((v) => extractName(v, '').toLowerCase());
      return (
        haystack.some((v) => v.includes(q))
        && (!schemeTypeFilter || p.scheme_type === schemeTypeFilter)
        && (!fundingFilter || p.funding_source === fundingFilter)
        && (!statusFilter || p.construction_status === statusFilter)
      );
    });
  }, [projects.records, searchTerm, schemeTypeFilter, fundingFilter, statusFilter]);

  const stats = useMemo(() => {
    const existing = filteredProjects.filter((p) => p.scheme_type === 'Existing Rehabilitation');
    const fresh = filteredProjects.filter((p) => p.scheme_type === 'New Construction');
    return {
      totalProjects: filteredProjects.length,
      existingRehabCount: existing.length,
      newConstructionCount: fresh.length,
      avgExistingProgress: avgProgress(existing),
      avgNewProgress: avgProgress(fresh),
      totalCommandHectares: sumBy(filteredProjects, 'command_area_ha'),
      totalBeneficiaries: sumBy(filteredProjects, 'beneficiaries_male') + sumBy(filteredProjects, 'beneficiaries_female'),
    };
  }, [filteredProjects]);

  const saveProject = async (values, editingProject, form) => {
    try {
      if (editingProject) {
        await projects.update(editingProject.id, values);
        message.success('Construction contract record updated successfully');
      } else {
        await projects.create(values);
        message.success('New irrigation construction project registered successfully');
      }
      return true;
    } catch (err) {
      notifyApiError(message, err, 'Failed to save construction record', form);
      return false;
    }
  };

  const changeStatus = async (record, constructionStatus) => {
    try {
      await projects.patch(record.id, { construction_status: constructionStatus });
      message.success(`Construction status updated to "${constructionStatus}"`);
    } catch (err) {
      notifyApiError(message, err, 'Failed to update construction status');
    }
  };

  const evaluateProgress = async (project, values, form) => {
    try {
      const updated = await projects.runAction(() => irrigationApi.constructionProjects.evaluateProgress(project.id, values));
      message.success(`Physical progress updated to ${updated.physical_progress_pct}% for scheme "${project.scheme_name}"`);
      return true;
    } catch (err) {
      notifyApiError(message, err, 'Failed to update progress evaluation', form);
      return false;
    }
  };

  const deleteProject = async (record) => {
    try {
      await projects.remove(record.id);
      message.success('Construction project record removed');
    } catch (err) {
      notifyApiError(message, err, 'Failed to delete construction project');
    }
  };

  const exportCsv = () => {
    if (!filteredProjects.length) {
      message.warning('No construction records available to export');
      return;
    }
    exportConstructionProjects(filteredProjects);
    message.success('Construction ledger exported successfully');
  };

  const findShelf = (schemeName) => shelf.records.find(
    (s) => extractName(s.scheme_name, '').toLowerCase() === (schemeName || '').toLowerCase()
  );

  return {
    fiscalYear,
    setFiscalYear,
    searchTerm,
    setSearchTerm,
    schemeTypeFilter,
    setSchemeTypeFilter,
    fundingFilter,
    setFundingFilter,
    statusFilter,
    setStatusFilter,
    projects,
    shelf: shelf.records,
    filteredProjects,
    stats,
    saveProject,
    changeStatus,
    evaluateProgress,
    deleteProject,
    exportCsv,
    findShelf,
  };
}


/** Construction Projects & Contracts (Irrigation Construction & Monitoring). */
function ConstructionProjectsContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const page = useConstructionProjects(location.state?.search || '');

  const [formState, setFormState] = useState({ open: false, project: null });
  const [evaluatingProject, setEvaluatingProject] = useState(null);
  const [dossierProject, setDossierProject] = useState(null);

  const initialDossierHandled = useRef(false);
  useEffect(() => {
    if (initialDossierHandled.current) return;
    const targetCode = location.state?.projectCode;
    if (!targetCode || !page.projects.records.length) return;
    const match = page.projects.records.find((p) => p.contract_code === targetCode || p.project_code === targetCode);
    if (match) {
      setDossierProject(match);
      initialDossierHandled.current = true;
    }
  }, [location.state, page.projects.records]);

  return (
    <div className="irr-page">
      <IrrigationBreadcrumb section="Irrigation Construction & Monitoring" title="Construction Projects & Contracts (የመስኖ ግንባታ ፕሮጀክቶች)" />

      <LoadErrorAlert error={page.projects.error} onRetry={page.reload} />

      <IrrigationStatsSection onRefresh={page.reload} loading={page.projects.loading}>
        <ProjectStats stats={page.stats} />
      </IrrigationStatsSection>

      <IrrigationPageHeader
        section="Irrigation Construction & Monitoring"
        title="Construction Projects & Contracts (የመስኖ ግንባታ ፕሮጀክቶች)"
        subtitle="Contract lifecycle tracking, civil contractor commitments, physical milestones, and commission handovers"
        fiscalYear={page.fiscalYear}
        onFiscalYearChange={page.setFiscalYear}
        onRefresh={page.reload}
        loading={page.projects.loading}
      >
        <ProjectFilters
          searchTerm={page.searchTerm}
          onSearchChange={page.setSearchTerm}
          schemeType={page.schemeTypeFilter}
          onSchemeTypeChange={page.setSchemeTypeFilter}
          funding={page.fundingFilter}
          onFundingChange={page.setFundingFilter}
          status={page.statusFilter}
          onStatusChange={page.setStatusFilter}
          onExport={page.exportCsv}
          onCreate={() => setFormState({ open: true, project: null })}
        />
      </IrrigationPageHeader>

      <ProjectTable
        data={page.filteredProjects}
        loading={page.projects.loading}
        onView={setDossierProject}
        onEdit={(p) => setFormState({ open: true, project: p })}
        onDelete={page.deleteProject}
        onStatusChange={page.changeStatus}
        onEvaluate={setEvaluatingProject}
        onViewProgressLog={(project) =>
          navigate('/irrigation/construction/progress', { state: { contractCode: project.contract_code } })
        }
      />

      <ProjectFormModal
        open={formState.open}
        editingProject={formState.project}
        shelf={page.shelf}
        fiscalYear={page.fiscalYear}
        nextCode={`CTR-${page.fiscalYear.slice(0, 4)}-${String(page.projects.records.length + 1).padStart(3, '0')}`}
        onCancel={() => setFormState({ open: false, project: null })}
        onSubmit={(values, form) => page.saveProject(values, formState.project, form)}
      />

      <EvaluateProgressModal
        project={evaluatingProject}
        onCancel={() => setEvaluatingProject(null)}
        onSubmit={page.evaluateProgress}
      />

      <ProjectDossierModal project={dossierProject} onClose={() => setDossierProject(null)} />
    </div>
  );
}

export default function ConstructionProjectsManagement() {
  return (
    <App>
      <ConstructionProjectsContent />
    </App>
  );
}
