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
import WuaStats from './WaterUsersAssociationsStats';
import WuaFilters from './WaterUsersAssociationsFilters';
import WuaTable from './WaterUsersAssociationsTable';
import WuaFormModal from './WaterUsersAssociationsForm';
import WuaDossierModal from './WaterUsersAssociationsDetail';

/* --- Association Establishment Categories (Excel Aligned) --- */
export const ASSOCIATION_TYPES = [
  { value: 'Newly Established WUA', label: 'Newly Established WUA (አዲስ የተቋቋመ ማህበር)', color: 'default' },
  { value: 'Strengthened Existing WUA', label: 'Strengthened Existing WUA (የሚጠናከር ነባር ማህበር)', color: 'default' },
  { value: 'Traditional Irrigation Group', label: 'Traditional Irrigation Group (በባህላዊ የተደራጀ ማህበር)', color: 'gold' },
];

/* --- Institutional Governance Health Statuses --- */
export const GOVERNANCE_STATUSES = [
  { value: 'Active & Fully Functional', label: 'Active & Fully Functional (Grade A)', color: 'success' },
  { value: 'Moderate Functionality', label: 'Moderate Functionality (Grade B)', color: 'processing' },
  { value: 'Weak Governance', label: 'Weak Governance / Needs Restructuring (Grade C)', color: 'warning' },
  { value: 'Under Establishment', label: 'Under Legal Chartering & Formation', color: 'default' },
];

/* --- Water Distribution Regimes --- */
export const WATER_DISTRIBUTION_REGIMES = [
  '7-Day Rotational Block Schedule (የ7 ቀን ተራ)',
  '10-Day Rotational Block Schedule (የ10 ቀን ተራ)',
  '14-Day Rotational Block Schedule (የ14 ቀን ተራ)',
  'Continuous Flow by Demand (ቀጣይ ፍሰት)',
  'Night Storage / Peak Hour Scheduling',
];

export const BYLAW_STATUSES = [
  { value: 'Formally Enacted & Stamped', label: 'Enacted & Stamped' },
  { value: 'Draft Bylaws Under Review', label: 'Draft Under Review' },
  { value: 'Draft Bylaws Under Community Review', label: 'Draft Under Community Review' },
];

/** Defaults for a newly registered association. */
export const NEW_WUA_DEFAULTS = {
  establishment_type: 'Newly Established WUA',
  committee_male: 5,
  committee_female: 2,
  sub_ketenas_count: 4,
  distribution_regime: WATER_DISTRIBUTION_REGIMES[0],
  annual_water_fee_etb_ha: 500,
  fee_collection_rate_pct: 85,
  bylaw_charter_status: 'Formally Enacted & Stamped',
};



const COLUMNS = [
  ['Registration Code', (w) => w.wua_reg_code],
  ['Association Name', (w) => w.wua_name],
  ['Scheme Name', (w) => w.scheme_name],
  ['Establishment Type', (w) => w.establishment_type],
  ['Command Area (Ha)', (w) => toNumber(w.command_area_ha)],
  ['Male Members', (w) => toNumber(w.members_male)],
  ['Female Members', (w) => toNumber(w.members_female)],
  ['Total Members', (w) => toNumber(w.members_male) + toNumber(w.members_female)],
  ['Exec Male', (w) => toNumber(w.committee_male)],
  ['Exec Female', (w) => toNumber(w.committee_female)],
  ['Chairperson', (w) => w.chairperson_name],
  ['Water Master', (w) => w.water_master_name],
  ['Ketenas', (w) => toNumber(w.sub_ketenas_count)],
  ['Regime', (w) => w.distribution_regime],
  ['Annual Fee (ETB/Ha)', (w) => toNumber(w.annual_water_fee_etb_ha)],
  ['Collection (%)', (w) => toNumber(w.fee_collection_rate_pct)],
  ['Status', (w) => w.governance_status],
  ['Established Date', (w) => w.establishment_eth_date],
  ['Zone', (w) => extractName(w.zone)],
  ['Woreda', (w) => extractName(w.woreda)],
];

export const exportWuaRegistry = (rows) => exportRowsToCsv(rows, COLUMNS, 'Water_Users_Associations_Registry');



/**
 * State and server interaction for the Water Users' Associations registry:
 * loading, filters, KPI statistics and create / update / status / delete.
 */
function useWaterUsersAssociations() {
  const { message } = App.useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const [fiscalYear, setFiscalYear] = useState(CURRENT_FISCAL_YEAR);
  // Other institution pages link here with { state: { searchWua } }.
  const [searchTerm, setSearchTerm] = useState(() => location.state?.searchWua || '');
  const [typeFilter, setTypeFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);

  const wuas = useIrrigationRecords(irrigationApi.waterUsersAssociations, { fiscalYear });
  // Candidate schemes for the registration combobox (construction contracts).
  const schemes = useIrrigationRecords(irrigationApi.constructionProjects, { fiscalYear });

  // Consume the navigation state once so a refresh does not re-apply it.
  useEffect(() => {
    if (location.state?.searchWua) navigate(location.pathname, { replace: true, state: null });
  }, [location.state, location.pathname, navigate]);

  const filteredWuas = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return wuas.records.filter((w) => {
      const haystack = [w.wua_reg_code, w.wua_name, w.scheme_name, w.chairperson_name, w.zone, w.woreda]
        .map((v) => extractName(v, '').toLowerCase());
      return (
        haystack.some((v) => v.includes(q))
        && (!typeFilter || w.establishment_type === typeFilter)
        && (!statusFilter || w.governance_status === statusFilter)
      );
    });
  }, [wuas.records, searchTerm, typeFilter, statusFilter]);

  const stats = useMemo(() => {
    const totalMale = sumBy(filteredWuas, 'members_male');
    const totalFemale = sumBy(filteredWuas, 'members_female');
    return {
      totalWuas: filteredWuas.length,
      newEstablishedCount: filteredWuas.filter((w) => w.establishment_type === 'Newly Established WUA').length,
      strengthenedCount: filteredWuas.filter((w) => w.establishment_type === 'Strengthened Existing WUA').length,
      totalManagedCommandHa: sumBy(filteredWuas, 'command_area_ha'),
      totalMale,
      totalFemale,
      totalMembers: totalMale + totalFemale,
      femaleSharePct: percent(totalFemale, totalMale + totalFemale),
      totalExecMale: sumBy(filteredWuas, 'committee_male'),
      totalExecFemale: sumBy(filteredWuas, 'committee_female'),
    };
  }, [filteredWuas]);

  /** Create or update; resolves true when the server accepted the record. */
  const saveWua = async (values, editingWua, form) => {
    try {
      if (editingWua) {
        await wuas.update(editingWua.id, values);
        message.success('WUA registration record updated successfully');
      } else {
        await wuas.create(values);
        message.success('New Water Users Association registered successfully');
      }
      return true;
    } catch (err) {
      notifyApiError(message, err, 'Failed to save WUA record', form);
      return false;
    }
  };

  const changeStatus = async (record, governanceStatus) => {
    try {
      await wuas.patch(record.id, { governance_status: governanceStatus });
      message.success(`Governance status updated to "${governanceStatus}"`);
    } catch (err) {
      notifyApiError(message, err, 'Failed to update governance status');
    }
  };

  const deleteWua = async (record) => {
    try {
      await wuas.remove(record.id);
      message.success('WUA registry record removed');
    } catch (err) {
      notifyApiError(message, err, 'Failed to delete WUA record');
    }
  };

  const exportCsv = () => {
    if (!filteredWuas.length) {
      message.warning('No WUA records available to export');
      return;
    }
    exportWuaRegistry(filteredWuas);
    message.success('WUA registry exported successfully');
  };

  /** Matching construction contract for a scheme name typed/selected in the form. */
  const findScheme = (schemeName) => schemes.records.find(
    (s) => extractName(s.scheme_name, '').toLowerCase() === (schemeName || '').toLowerCase()
  );

  return {
    fiscalYear,
    setFiscalYear,
    searchTerm,
    setSearchTerm,
    typeFilter,
    setTypeFilter,
    statusFilter,
    setStatusFilter,
    wuas,
    schemes: schemes.records,
    filteredWuas,
    stats,
    saveWua,
    changeStatus,
    deleteWua,
    exportCsv,
    findScheme,
  };
}


/** Water Users Associations (WUAs) Registry (Irrigation Institutions Management). */
function WaterUsersAssociationsContent() {
  const navigate = useNavigate();
  const page = useWaterUsersAssociations();

  const [formState, setFormState] = useState({ open: false, record: null });
  const [dossierRecord, setDossierRecord] = useState(null);

  return (
    <div className="irr-page">
      <IrrigationBreadcrumb section="Irrigation Institutions Management" title="Water Users Associations (የውሃ ተጠቃሚዎች ማህበራት)" />

      <LoadErrorAlert error={page.wuas.error} onRetry={page.reload} />

      <IrrigationStatsSection onRefresh={page.reload} loading={page.wuas.loading}>
        <WuaStats stats={page.stats} />
      </IrrigationStatsSection>

      <IrrigationPageHeader
        section="Irrigation Institutions Management"
        title="Water Users Associations (የውሃ ተጠቃሚዎች ማህበራት)"
        subtitle="WUA legal registration proclamation compliance, executive leadership gender mix, and scheme operational governance"
        fiscalYear={page.fiscalYear}
        onFiscalYearChange={page.setFiscalYear}
        onRefresh={page.reload}
        loading={page.wuas.loading}
      >
        <WuaFilters
          searchTerm={page.searchTerm}
          onSearchChange={page.setSearchTerm}
          status={page.statusFilter}
          onStatusChange={page.setStatusFilter}
          strength={page.strengthFilter}
          onStrengthChange={page.setStrengthFilter}
          onExport={page.exportCsv}
          onCreate={() => setFormState({ open: true, record: null })}
        />
      </IrrigationPageHeader>

      <WuaTable
        data={page.filteredRecords}
        loading={page.wuas.loading}
        onView={setDossierRecord}
        onEdit={(record) => setFormState({ open: true, record })}
        onDelete={page.deleteWua}
        onStatusChange={page.changeStatus}
        onViewAudits={(wua) => navigate('/irrigation/institutions/audits', { state: { wuaRegistrationNo: wua.registration_no } })}
      />

      <WuaFormModal
        open={formState.open}
        editingRecord={formState.record}
        schemes={page.schemes}
        fiscalYear={page.fiscalYear}
        nextCode={`WUA-${page.fiscalYear.slice(0, 4)}-${String(page.wuas.records.length + 1).padStart(3, '0')}`}
        onCancel={() => setFormState({ open: false, record: null })}
        onSubmit={(values, form) => page.saveWua(values, formState.record, form)}
      />

      <WuaDossierModal
        record={dossierRecord}
        onClose={() => setDossierRecord(null)}
        onViewAudits={(wua) => navigate('/irrigation/institutions/audits', { state: { wuaRegistrationNo: wua.registration_no } })}
      />
    </div>
  );
}

export default function WaterUsersAssociationsManagement() {
  return (
    <App>
      <WaterUsersAssociationsContent />
    </App>
  );
}
