import React, { useMemo, useState } from 'react';
import { App } from 'antd';
import { irrigationStudyDesignApi } from '../../../../services/api/irrigationApi';
import useIrrigationRecords from '../../shared/hooks/useIrrigationRecords';
import { CURRENT_FISCAL_YEAR } from '../../shared/constants';
import { exportRowsToCsv, extractName, notifyApiError, percent, sumBy, toNumber } from '../../shared/utils';
import IrrigationBreadcrumb from '../../shared/components/IrrigationBreadcrumb';
import IrrigationPageHeader from '../../shared/components/IrrigationPageHeader';
import LoadErrorAlert from '../../shared/components/LoadErrorAlert';
import IrrigationStatsSection from '../../shared/components/IrrigationStatsSection';

import ProfessionalCapacityBuildingStats from './ProfessionalCapacityBuildingStats';
import ProfessionalCapacityBuildingFilters from './ProfessionalCapacityBuildingFilters';
import ProfessionalCapacityBuildingTable from './ProfessionalCapacityBuildingTable';
import ProfessionalCapacityBuildingForm from './ProfessionalCapacityBuildingForm';
import ProfessionalCapacityBuildingDetail from './ProfessionalCapacityBuildingDetail';

/* --- Training Focus Disciplines (IrrigationEnums::PROFESSIONAL_DISCIPLINES) --- */
export const TRAINING_DISCIPLINES = [
  'Hydrology & Catchment Runoff Modeling (HEC-RAS / GIS)',
  'Hydraulic & Structural Design of Diversion Weirs',
  'Geotechnical Foundation Testing & Seepage Analysis',
  'Solar-Powered Irrigation Engineering & Pump Sizing',
  'Irrigation Canal Network Layout & Water Duty Sizing',
  'Environmental & Social Safeguards (ESIA) in Irrigation',
  'Bill of Quantities (BoQ) & Standard Tender Documentation',
];

/* --- Target Trainee Institution Tiers --- */
export const TARGET_AUDIENCE_TIERS = [
  'Regional Design Bureau Senior Specialists',
  'Zonal Water & Irrigation Department Engineers',
  'Woreda Irrigation & Agricultural Extension Experts',
  'Multi-Disciplinary Design Review Committee Members',
  'Joint Regional & University Research Teams',
];

/* --- Training Status Options --- */
export const TRAINING_STATUSES = [
  { value: 'Completed', label: 'Conducted / Completed', color: 'success' },
  { value: 'In Progress', label: 'Currently in Session', color: 'processing' },
  { value: 'Scheduled', label: 'Scheduled / Planned', color: 'default' },
  { value: 'Postponed', label: 'Postponed', color: 'warning' },
  { value: 'Cancelled', label: 'Cancelled', color: 'error' },
];

/* --- Sponsoring / Funding Programs --- */
export const SPONSORING_PROGRAMS = [
  'Regional Government Training Budget',
  'PACT Program Capacity Fund',
  'FSRP Institutional Strengthening Component',
  'Green Climate Fund (GCF) Readiness',
  'DRDIP Project Technical Support',
];

/**
 * Suggested training locations (zone -> woredas / cities). Free text is also
 * accepted; zones and woredas already used by saved records are added too.
 */
export const LOCATION_SUGGESTIONS = {
  'East Gojjam': ['Dejen', 'Machakel'],
  'West Gojjam': ['Mecha', 'Yilmana Densa'],
  'North Shewa': ['Basona Werana', 'Moretna Jiru'],
  'South Gondar': ['Fogera', 'Dera'],
  'Regional Bureau Level': ['Bahir Dar Regional Center'],
};

/** Defaults for a newly registered course. */
export const NEW_TRAINING_DEFAULTS = {
  discipline: 'Hydraulic & Structural Design of Diversion Weirs',
  target_tier: 'Zonal Water & Irrigation Department Engineers',
  sponsoring_program: 'Regional Government Training Budget',
  training_duration_days: 5,
  male_participants: 20,
  female_participants: 8,
};




const COLUMNS = [
  ['Course Code', (t) => t.training_code],
  ['Course Title', (t) => t.course_title],
  ['Discipline', (t) => t.discipline],
  ['Target Tier', (t) => t.target_tier],
  ['Male Experts', (t) => toNumber(t.male_participants)],
  ['Female Experts', (t) => toNumber(t.female_participants)],
  ['Total Trainees', (t) => toNumber(t.male_participants) + toNumber(t.female_participants)],
  ['Duration (Days)', (t) => toNumber(t.training_duration_days)],
  ['Lead Trainer', (t) => t.lead_trainer],
  ['Venue', (t) => t.training_venue],
  ['Sponsoring Program', (t) => t.sponsoring_program],
  ['Status', (t) => t.training_status],
  ['Ethiopian Date', (t) => t.ethiopian_date],
  ['Zone', (t) => extractName(t.zone)],
  ['Woreda', (t) => extractName(t.woreda)],
];

export const exportTrainings = (rows) => exportRowsToCsv(rows, COLUMNS, 'Irrigation_Capacity_Building_Ledger');











/**
 * Professional capacity-building ledger: loading, filters, KPIs and
 * create / update / status / delete against irrigationStudyDesignApi.professionalTraining.
 */
function useProfessionalCapacityBuilding() {
  const { message } = App.useApp();

  const [fiscalYear, setFiscalYear] = useState(CURRENT_FISCAL_YEAR);
  const [searchTerm, setSearchTerm] = useState('');
  const [disciplineFilter, setDisciplineFilter] = useState(null);
  const [tierFilter, setTierFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);

  const trainings = useIrrigationRecords(irrigationStudyDesignApi.professionalTraining, { fiscalYear });

  const filteredTrainings = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return trainings.records.filter((t) => {
      const haystack = [t.training_code, t.course_title, t.lead_trainer, t.training_venue, t.zone]
        .map((v) => extractName(v, '').toLowerCase());
      return haystack.some((v) => v.includes(q))
        && (!disciplineFilter || t.discipline === disciplineFilter)
        && (!tierFilter || t.target_tier === tierFilter)
        && (!statusFilter || t.training_status === statusFilter);
    });
  }, [trainings.records, searchTerm, disciplineFilter, tierFilter, statusFilter]);

  // Excel indicators: total experts, male, female, completed courses.
  const stats = useMemo(() => {
    const totalMale = sumBy(filteredTrainings, 'male_participants');
    const totalFemale = sumBy(filteredTrainings, 'female_participants');
    return {
      totalTrainings: filteredTrainings.length,
      completedCoursesCount: filteredTrainings.filter((t) => t.training_status === 'Completed').length,
      totalExperts: totalMale + totalFemale,
      totalMale,
      totalFemale,
      femaleSharePct: percent(totalFemale, totalMale + totalFemale),
    };
  }, [filteredTrainings]);

  /** Zone -> woreda suggestions, merged with the locations of saved records. */
  const locations = useMemo(() => {
    const map = Object.fromEntries(Object.entries(LOCATION_SUGGESTIONS).map(([z, ws]) => [z, new Set(ws)]));
    trainings.records.forEach((t) => {
      const zone = extractName(t.zone, '');
      if (!zone) return;
      if (!map[zone]) map[zone] = new Set();
      const woreda = extractName(t.woreda, '');
      if (woreda) map[zone].add(woreda);
    });
    return Object.fromEntries(Object.entries(map).map(([z, ws]) => [z, [...ws]]));
  }, [trainings.records]);

  /** Create or update; resolves true when the server accepted the record. */
  const saveTraining = async (values, editingTraining, form) => {
    try {
      if (editingTraining) {
        await trainings.update(editingTraining.id, values);
        message.success('Capacity building course record updated successfully');
      } else {
        await trainings.create(values);
        message.success('New technical capacity building course registered successfully');
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
      message.success(`Course status updated to "${trainingStatus}"`);
    } catch (err) {
      notifyApiError(message, err, 'Failed to update course status');
    }
  };

  const deleteTraining = async (record) => {
    try {
      await trainings.remove(record.id);
      message.success('Training course record deleted successfully');
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
    message.success('Capacity building dataset exported successfully');
  };

  return {
    fiscalYear,
    setFiscalYear,
    searchTerm,
    setSearchTerm,
    disciplineFilter,
    setDisciplineFilter,
    tierFilter,
    setTierFilter,
    statusFilter,
    setStatusFilter,
    trainings,
    filteredTrainings,
    stats,
    locations,
    saveTraining,
    changeStatus,
    deleteTraining,
    exportCsv,
  };
}


function ProfessionalCapacityBuildingContent() {
  const page = useProfessionalCapacityBuilding();
  const [formState, setFormState] = useState({ open: false, training: null });
  const [dossierTraining, setDossierTraining] = useState(null);

  return (
    <div className="irr-page">
      <IrrigationBreadcrumb section="Irrigation Study & Design" title="Professional Capacity Building (የባለሙያዎች የአቅም ግንባታ ስልጠና)" />

      <LoadErrorAlert error={page.trainings.error} onRetry={page.trainings.reload} />

      <IrrigationStatsSection onRefresh={page.trainings.reload} loading={page.trainings.loading}>
        <ProfessionalCapacityBuildingStats stats={page.stats} />
      </IrrigationStatsSection>

      <IrrigationPageHeader
        section="Irrigation Study & Design"
        title="Professional Capacity Building (የባለሙያዎች የአቅም ግንባታ ስልጠና)"
        subtitle="Engineering skill development, hydraulic modeling masterclasses, and gender-disaggregated training tracking for irrigation experts"
        fiscalYear={page.fiscalYear}
        onFiscalYearChange={page.setFiscalYear}
        onRefresh={page.trainings.reload}
        loading={page.trainings.loading}
      >
        <ProfessionalCapacityBuildingFilters
          searchTerm={page.searchTerm}
          onSearchChange={page.setSearchTerm}
          disciplineFilter={page.disciplineFilter}
          onDisciplineChange={page.setDisciplineFilter}
          tierFilter={page.tierFilter}
          onTierChange={page.setTierFilter}
          statusFilter={page.statusFilter}
          onStatusChange={page.setStatusFilter}
          onExport={page.exportCsv}
          onCreate={() => setFormState({ open: true, training: null })}
        />
      </IrrigationPageHeader>

      <ProfessionalCapacityBuildingTable
        data={page.filteredTrainings}
        loading={page.trainings.loading}
        onView={setDossierTraining}
        onEdit={(training) => setFormState({ open: true, training })}
        onDelete={page.deleteTraining}
        onStatusChange={page.changeStatus}
      />

      <ProfessionalCapacityBuildingForm
        open={formState.open}
        editingTraining={formState.training}
        locations={page.locations}
        fiscalYear={page.fiscalYear}
        nextCode={`TRN-${page.fiscalYear.slice(0, 4)}-${String(page.trainings.records.length + 1).padStart(3, '0')}`}
        onCancel={() => setFormState({ open: false, training: null })}
        onSubmit={(values, form) => page.saveTraining(values, formState.training, form)}
      />

      <ProfessionalCapacityBuildingDetail training={dossierTraining} onClose={() => setDossierTraining(null)} />
    </div>
  );
}

export default function ProfessionalCapacityBuildingManagement() {
  return (
    <App>
      <ProfessionalCapacityBuildingContent />
    </App>
  );
}
