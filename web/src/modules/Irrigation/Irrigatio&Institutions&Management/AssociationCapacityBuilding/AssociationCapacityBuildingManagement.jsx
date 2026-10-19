import { useState } from 'react';
import { App } from 'antd';
import { useNavigate } from 'react-router-dom';
import irrigationApi from '../../../../services/api/irrigationApi';
import useIrrigationRecords from '../../shared/hooks/useIrrigationRecords';
import { CURRENT_FISCAL_YEAR } from '../../shared/constants';
import { exportRowsToCsv, extractName, notifyApiError, sumBy, toNumber } from '../../shared/utils';
import IrrigationBreadcrumb from '../../shared/components/IrrigationBreadcrumb';
import IrrigationPageHeader from '../../shared/components/IrrigationPageHeader';
import LoadErrorAlert from '../../shared/components/LoadErrorAlert';
import IrrigationStatsSection from '../../shared/components/IrrigationStatsSection';
import TrainingStats from './AssociationCapacityBuildingStats';
import TrainingFilters from './AssociationCapacityBuildingFilters';
import TrainingTable from './AssociationCapacityBuildingTable';
import TrainingFormModal from './AssociationCapacityBuildingForm';
import TrainingDossierModal from './AssociationCapacityBuildingDetail';

/* --- Community Training Curriculum Modules (IrrigationEnums::COMMUNITY_TRAINING_MODULES) --- */
export const COMMUNITY_TRAINING_MODULES = [
  'Water Distribution Scheduling & Rotational Rosters (የውሃ ክፍፍል ተራ)',
  'WUA By-Law Enforcement & Dispute Resolution (ደንብና መመሪያ ማስከበር)',
  'Water Fee Tariff Setting, Collection & Cashbook Accounting',
  'Participatory Scheme Operation & Minor Canal Maintenance',
  'Water Users Groups (Ketenas) Leadership & Coordination',
  'Gender Inclusion & Female Farmer Empowerment in Irrigation',
];

/* --- Target Trainee Groups (Excel Aligned) --- */
export const TARGET_AUDIENCE_GROUPS = [
  { value: 'WUA Executive Committee Leaders', label: 'WUA Executive Committee Leaders (በማህበሩ አመራር)', color: 'default' },
  { value: 'Water Masters & Tertiary Distributors', label: 'Water Masters & Turn Distributors (ውሃ ዳኛ / አከፋፋዮች)', color: 'default' },
  { value: 'General Farmer Members', label: 'General Water User Farmer Members (አባላት)', color: 'green' },
  { value: 'Control & Dispute Committee', label: 'Control & Dispute Resolution Committee (የቁጥጥር ኮሚቴ)', color: 'gold' },
];

/* --- Training Delivery Statuses --- */
export const TRAINING_STATUSES = [
  { value: 'Completed', label: 'Conducted / Completed', color: 'success' },
  { value: 'In Session', label: 'Currently in Session', color: 'processing' },
  { value: 'Scheduled', label: 'Scheduled / Planned', color: 'default' },
  { value: 'Postponed', label: 'Postponed', color: 'warning' },
];

/* --- Sponsoring Funding / Facilitator Channels --- */
export const FACILITATOR_PROGRAMS = [
  'Woreda Agriculture Office Extension Team (በባለሙያ)',
  'Zonal Cooperative Promotion Directorate (በባለሙያ)',
  'PACT Program Community Capacity Fund',
  'FSRP Community Irrigation Strengthening Component',
  'DRDIP Project Social Development Fund',
  'Regional Water Bureau Technical Assistance Unit',
];

/** Defaults for a newly logged training session. */
export const NEW_TRAINING_DEFAULTS = {
  training_module: COMMUNITY_TRAINING_MODULES[0],
  target_group: 'WUA Executive Committee Leaders',
  facilitator_channel: FACILITATOR_PROGRAMS[0],
  training_duration_days: 3,
  exec_leaders_male: 0,
  exec_leaders_female: 0,
  members_male: 25,
  members_female: 10,
};

export const WUA_REGISTRY_PATH = '/irrigation/institutions/water-users-associations';



const COLUMNS = [
  ['Course Code', (t) => t.training_code],
  ['Project Code', (t) => t.project_code],
  ['WUA Name', (t) => t.wua_name],
  ['Scheme Name', (t) => t.scheme_name],
  ['Module', (t) => t.training_module],
  ['Target Group', (t) => t.target_group],
  ['Exec Male', (t) => toNumber(t.exec_leaders_male)],
  ['Exec Female', (t) => toNumber(t.exec_leaders_female)],
  ['Members Male', (t) => toNumber(t.members_male)],
  ['Members Female', (t) => toNumber(t.members_female)],
  ['Total Trainees', (t) => toNumber(t.total_trainees)],
  ['Facilitator', (t) => t.lead_facilitator],
  ['Venue', (t) => t.training_venue],
  ['Status', (t) => t.training_status],
  ['Date', (t) => t.ethiopian_date],
  ['Zone', (t) => extractName(t.zone)],
  ['Woreda', (t) => extractName(t.woreda)],
];

export const exportTrainings = (rows) => exportRowsToCsv(rows, COLUMNS, 'WUA_Community_Training_Ledger');



/**
 * State and server interaction for the WUA capacity-building ledger:
 * loading, filters, KPI statistics and create / update / status / delete.
 */
function useAssociationCapacityBuilding() {
  const { message } = App.useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const [fiscalYear, setFiscalYear] = useState(CURRENT_FISCAL_YEAR);
  // The WUA registry links here with { state: { searchWua } }.
  const [searchTerm, setSearchTerm] = useState(() => location.state?.searchWua || '');
  const [moduleFilter, setModuleFilter] = useState(null);
  const [targetGroupFilter, setTargetGroupFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);

  const trainings = useIrrigationRecords(irrigationApi.associationTrainings, { fiscalYear });
  // Every registered WUA (a training may target an association registered in an earlier year).
  const wuas = useIrrigationRecords(irrigationApi.waterUsersAssociations);

  // Consume the navigation state once so a refresh does not re-apply it.
  useEffect(() => {
    const incoming = location.state?.searchWua;
    if (!incoming) return;
    message.info(`Filtered training courses for "${incoming}"`);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.state, location.pathname, navigate, message]);

  const filteredTrainings = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return trainings.records.filter((t) => {
      const haystack = [t.training_code, t.project_code, t.wua_name, t.scheme_name, t.lead_facilitator, t.zone, t.woreda]
        .map((v) => extractName(v, '').toLowerCase());
      return (
        haystack.some((v) => v.includes(q))
        && (!moduleFilter || t.training_module === moduleFilter)
        && (!targetGroupFilter || t.target_group === targetGroupFilter)
        && (!statusFilter || t.training_status === statusFilter)
      );
    });
  }, [trainings.records, searchTerm, moduleFilter, targetGroupFilter, statusFilter]);

  const stats = useMemo(() => {
    const totalExecMale = sumBy(filteredTrainings, 'exec_leaders_male');
    const totalExecFemale = sumBy(filteredTrainings, 'exec_leaders_female');
    const totalMembersMale = sumBy(filteredTrainings, 'members_male');
    const totalMembersFemale = sumBy(filteredTrainings, 'members_female');
    const grandTotalTrainees = totalExecMale + totalExecFemale + totalMembersMale + totalMembersFemale;
    const totalFemaleTrainees = totalExecFemale + totalMembersFemale;
    return {
      totalCourses: filteredTrainings.length,
      completedCoursesCount: filteredTrainings.filter((t) => t.training_status === 'Completed').length,
      totalExecLeaders: totalExecMale + totalExecFemale,
      totalExecMale,
      totalExecFemale,
      grandTotalTrainees,
      totalFemaleTrainees,
      femaleSharePct: percent(totalFemaleTrainees, grandTotalTrainees),
    };
  }, [filteredTrainings]);

  /** Create or update; resolves true when the server accepted the record. */
  const saveTraining = async (values, editingTraining, form) => {
    try {
      if (editingTraining) {
        await trainings.update(editingTraining.id, values);
        message.success('WUA capacity building course updated successfully');
      } else {
        await trainings.create(values);
        message.success('New WUA capacity building course logged successfully');
      }
      return true;
    } catch (err) {
      notifyApiError(message, err, 'Failed to save training record', form);
      return false;
    }
  };

  const changeStatus = async (record, trainingStatus) => {
    try {
      await trainings.patch(record.id, { training_status: trainingStatus });
      message.success(`Training course status updated to "${trainingStatus}"`);
    } catch (err) {
      notifyApiError(message, err, 'Failed to update training status');
    }
  };

  const deleteTraining = async (record) => {
    try {
      await trainings.remove(record.id);
      message.success('WUA training record deleted');
    } catch (err) {
      notifyApiError(message, err, 'Failed to delete training record');
    }
  };

  const exportCsv = () => {
    if (!filteredTrainings.length) {
      message.warning('No training records available to export');
      return;
    }
    exportTrainings(filteredTrainings);
    message.success('WUA training dataset exported successfully');
  };

  const reload = () => {
    trainings.reload();
    wuas.reload();
  };

  return {
    fiscalYear,
    setFiscalYear,
    searchTerm,
    setSearchTerm,
    moduleFilter,
    setModuleFilter,
    targetGroupFilter,
    setTargetGroupFilter,
    statusFilter,
    setStatusFilter,
    trainings,
    wuas,
    filteredTrainings,
    stats,
    reload,
    saveTraining,
    changeStatus,
    deleteTraining,
    exportCsv,
  };
}


/** Association Capacity Building & Leadership Training (Irrigation Institutions Management). */
function AssociationCapacityBuildingContent() {
  const navigate = useNavigate();
  const page = useAssociationCapacityBuilding();

  const [formState, setFormState] = useState({ open: false, record: null });
  const [dossierRecord, setDossierRecord] = useState(null);

  return (
    <div className="irr-page">
      <IrrigationBreadcrumb section="Irrigation Institutions Management" title="Association Capacity Building (የማህበራት ስልጠና እና አቅም ግንባታ)" />

      <LoadErrorAlert error={page.trainings.error} onRetry={page.reload} />

      <IrrigationStatsSection onRefresh={page.reload} loading={page.trainings.loading}>
        <TrainingStats stats={page.stats} />
      </IrrigationStatsSection>

      <IrrigationPageHeader
        section="Irrigation Institutions Management"
        title="Association Capacity Building (የማህበራት ስልጠና እና አቅም ግንባታ)"
        subtitle="Water allocation bylaws, conflict mediation, financial bookkeeping, and O&M practical drills for WUA leaders"
        fiscalYear={page.fiscalYear}
        onFiscalYearChange={page.setFiscalYear}
        onRefresh={page.reload}
        loading={page.trainings.loading}
      >
        <TrainingFilters
          searchTerm={page.searchTerm}
          onSearchChange={page.setSearchTerm}
          module={page.moduleFilter}
          onModuleChange={page.setModuleFilter}
          onExport={page.exportCsv}
          onCreate={() => setFormState({ open: true, record: null })}
        />
      </IrrigationPageHeader>

      <TrainingTable
        data={page.filteredRecords}
        loading={page.trainings.loading}
        onView={setDossierRecord}
        onEdit={(record) => setFormState({ open: true, record })}
        onDelete={page.deleteTraining}
        onOpenWua={page.openWua}
      />

      <TrainingFormModal
        open={formState.open}
        editingRecord={formState.record}
        wuas={page.wuas}
        fiscalYear={page.fiscalYear}
        nextCode={`TRN-${page.fiscalYear.slice(0, 4)}-${String(page.trainings.records.length + 1).padStart(3, '0')}`}
        onCancel={() => setFormState({ open: false, record: null })}
        onSubmit={(values, form) => page.saveTraining(values, formState.record, form)}
      />

      <TrainingDossierModal
        record={dossierRecord}
        onClose={() => setDossierRecord(null)}
        onOpenWua={page.openWua}
      />
    </div>
  );
}

export default function AssociationCapacityBuildingManagement() {
  return (
    <App>
      <AssociationCapacityBuildingContent />
    </App>
  );
}
