import { useMemo, useState } from 'react';
import { App } from 'antd';
import { useNavigate } from 'react-router-dom';
import irrigationApi from '../../../../services/api/irrigationApi';
import useIrrigationRecords from '../../shared/hooks/useIrrigationRecords';
import { CURRENT_FISCAL_YEAR } from '../../shared/constants';
import { exportRowsToCsv, extractName, notifyApiError, percent, sumBy, toNumber } from '../../shared/utils';
import IrrigationBreadcrumb from '../../shared/components/IrrigationBreadcrumb';
import IrrigationPageHeader from '../../shared/components/IrrigationPageHeader';
import LoadErrorAlert from '../../shared/components/LoadErrorAlert';
import IrrigationStatsSection from '../../shared/components/IrrigationStatsSection';
import BenefitStats, { BenefitCharts } from './DevelopedLandBeneficiariesStats';
import BenefitFilters from './DevelopedLandBeneficiariesFilters';
import BenefitTable from './DevelopedLandBeneficiariesTable';
import BenefitFormModal from './DevelopedLandBeneficiariesForm';
import BenefitDossierModal from './DevelopedLandBeneficiariesDetail';

export * from './DevelopedLandBeneficiariesConstants';
import {
  SCHEME_TYPES,
  FUNDING_PROGRAMS,
  BENEFIT_STATUSES,
  CROP_CATALOG_GROUPS,
  NEW_BENEFIT_DEFAULTS,
  cropList,
} from './DevelopedLandBeneficiariesConstants';



const COLUMNS = [
  ['Benefit Code', (r) => r.benefit_code],
  ['Contract Code', (r) => r.contract_code],
  ['Project Code', (r) => r.project_code],
  ['Scheme Name', (r) => r.scheme_name],
  ['Type', (r) => r.scheme_type],
  ['Funding Source', (r) => r.funding_source],
  ['Planned Command (Ha)', (r) => toNumber(r.planned_command_ha)],
  ['Developed (Ha)', (r) => toNumber(r.actual_developed_ha)],
  ['Cultivated (Ha)', (r) => toNumber(r.operational_cultivated_ha)],
  ['Male Farmers', (r) => toNumber(r.beneficiaries_male)],
  ['Female Farmers', (r) => toNumber(r.beneficiaries_female)],
  ['Total Farmers', (r) => toNumber(r.beneficiaries_male) + toNumber(r.beneficiaries_female)],
  ['Youth Farmers', (r) => toNumber(r.youth_beneficiaries_count)],
  ['Cropping Intensity', (r) => toNumber(r.cropping_intensity_ratio)],
  ['Primary Crops', (r) => cropList(r.primary_crops_cultivated).join('; ')],
  ['Status', (r) => r.benefit_status],
  ['Date', (r) => r.verification_ethiopian_date],
  ['Zone', (r) => extractName(r.zone)],
  ['Woreda', (r) => extractName(r.woreda)],
];

export const exportBenefits = (rows) => exportRowsToCsv(rows, COLUMNS, 'Irrigation_Developed_Land_Beneficiaries');



/** Developed land & beneficiaries: loading, filters, KPIs, charts and create / update / status / delete. */
function useDevelopedLandBeneficiaries() {
  const { message } = App.useApp();

  const [fiscalYear, setFiscalYear] = useState(CURRENT_FISCAL_YEAR);
  const [searchTerm, setSearchTerm] = useState('');
  const [schemeTypeFilter, setSchemeTypeFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [fundingFilter, setFundingFilter] = useState(null);

  const benefits = useIrrigationRecords(irrigationApi.constructionBenefits, { fiscalYear });
  const contracts = useIrrigationRecords(irrigationApi.constructionProjects, { fiscalYear });

  const filteredRecords = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return benefits.records.filter((r) => {
      const haystack = [r.benefit_code, r.contract_code, r.scheme_name, r.zone, r.woreda]
        .map((v) => extractName(v, '').toLowerCase())
        .concat(cropList(r.primary_crops_cultivated).join(' ').toLowerCase());
      return haystack.some((v) => v.includes(q))
        && (!schemeTypeFilter || r.scheme_type === schemeTypeFilter)
        && (!statusFilter || r.benefit_status === statusFilter)
        && (!fundingFilter || r.funding_source === fundingFilter);
    });
  }, [benefits.records, searchTerm, schemeTypeFilter, statusFilter, fundingFilter]);

  const stats = useMemo(() => {
    const totalPlannedHa = sumBy(filteredRecords, 'planned_command_ha');
    const totalDevelopedHa = sumBy(filteredRecords, 'actual_developed_ha');
    const totalMale = sumBy(filteredRecords, 'beneficiaries_male');
    const totalFemale = sumBy(filteredRecords, 'beneficiaries_female');
    return {
      totalSchemes: filteredRecords.length,
      totalPlannedHa,
      totalDevelopedHa,
      totalCultivatedHa: sumBy(filteredRecords, 'operational_cultivated_ha'),
      totalBeneficiaryFarmers: totalMale + totalFemale,
      totalMale,
      totalFemale,
      femaleSharePct: percent(totalFemale, totalMale + totalFemale),
      overallLandDevRate: totalPlannedHa > 0 ? ((totalDevelopedHa / totalPlannedHa) * 100).toFixed(1) : '0.0',
    };
  }, [filteredRecords]);

  const chartData = useMemo(() => filteredRecords.map((r) => {
    const name = r.scheme_name || '';
    return {
      name: name.length > 14 ? `${name.substring(0, 14)}...` : name,
      planned: toNumber(r.planned_command_ha),
      developed: toNumber(r.actual_developed_ha),
      cultivated: toNumber(r.operational_cultivated_ha),
    };
  }), [filteredRecords]);

  const genderShareData = useMemo(() => [
    { name: 'Male Farmers (ወንድ)', value: stats.totalMale, color: '#5b8a6b' },
    { name: 'Female Farmers (ሴት)', value: stats.totalFemale, color: '#64748b' },
  ], [stats.totalMale, stats.totalFemale]);

  const saveRecord = async (values, editing, form) => {
    try {
      if (editing) {
        await benefits.update(editing.id, values);
        message.success('Developed land & beneficiary verification record updated successfully');
      } else {
        await benefits.create(values);
        message.success('New irrigation developed command & farmer record logged successfully');
      }
      return true;
    } catch (err) {
      notifyApiError(message, err, 'Failed to save benefit record', form);
      return false;
    }
  };

  const changeStatus = async (record, benefitStatus) => {
    try {
      await benefits.patch(record.id, { benefit_status: benefitStatus });
      message.success(`Land operational status updated to "${benefitStatus}"`);
    } catch (err) {
      notifyApiError(message, err, 'Failed to update land operational status');
    }
  };

  const deleteRecord = async (record) => {
    try {
      await benefits.remove(record.id);
      message.success('Benefit record removed');
    } catch (err) {
      notifyApiError(message, err, 'Failed to delete benefit record');
    }
  };

  const exportCsv = () => {
    if (!filteredRecords.length) {
      message.warning('No benefit records available to export');
      return;
    }
    exportBenefits(filteredRecords);
    message.success('Beneficiaries dataset exported successfully');
  };

  const findContract = (schemeName) => contracts.records.find(
    (c) => extractName(c.scheme_name, '').toLowerCase() === (schemeName || '').toLowerCase()
  );

  const openContract = (contractCode) => navigate('/irrigation/construction/projects', { state: { filterContractCode: contractCode } });

  return {
    fiscalYear, setFiscalYear, searchTerm, setSearchTerm, schemeTypeFilter, setSchemeTypeFilter,
    statusFilter, setStatusFilter, fundingFilter, setFundingFilter,
    benefits,
    reload: benefits.reload,
    contracts: contracts.records,
    filteredRecords,
    stats,
    chartData,
    genderShareData,
    saveRecord,
    saveBenefit: saveRecord,
    changeStatus,
    deleteRecord,
    deleteBenefit: deleteRecord,
    exportCsv,
    findContract,
    openContract,
  };
}


/** Developed Land & Beneficiaries (Irrigation Construction & Monitoring). */
function DevelopedLandBeneficiariesContent() {
  const navigate = useNavigate();
  const page = useDevelopedLandBeneficiaries();

  const [formState, setFormState] = useState({ open: false, record: null });
  const [dossierRecord, setDossierRecord] = useState(null);

  const benefitsObj = page.benefits || {};

  return (
    <div className="irr-page">
      <IrrigationBreadcrumb section="Irrigation Construction & Monitoring" title="Developed Land & Beneficiaries (የለማ መሬት እና ተጠቃሚዎች)" />

      <LoadErrorAlert error={benefitsObj.error} onRetry={page.reload} />

      <IrrigationStatsSection onRefresh={page.reload} loading={benefitsObj.loading}>
        <BenefitStats stats={page.stats} />
      </IrrigationStatsSection>

      <IrrigationPageHeader
        section="Irrigation Construction & Monitoring"
        title="Developed Land & Beneficiaries (የለማ መሬት እና ተጠቃሚዎች)"
        subtitle="Hectares irrigated, male & female smallholder farmers, youth employment, and cropping mix"
        fiscalYear={page.fiscalYear}
        onFiscalYearChange={page.setFiscalYear}
        onRefresh={page.reload}
        loading={benefitsObj.loading}
      >
        <BenefitFilters
          searchTerm={page.searchTerm}
          onSearchChange={page.setSearchTerm}
          schemeType={page.schemeTypeFilter}
          onSchemeTypeChange={page.setSchemeTypeFilter}
          status={page.statusFilter}
          onStatusChange={page.setStatusFilter}
          onExport={page.exportCsv}
          onCreate={() => setFormState({ open: true, record: null })}
        />
      </IrrigationPageHeader>

      <BenefitTable
        data={page.filteredRecords}
        loading={benefitsObj.loading}
        onView={setDossierRecord}
        onEdit={(record) => setFormState({ open: true, record })}
        onDelete={page.deleteBenefit}
        onStatusChange={page.changeStatus}
        onOpenContract={page.openContract}
      />

      <BenefitCharts chartData={page.chartData} genderShareData={page.genderShareData} />

      <BenefitFormModal
        open={formState.open}
        editingRecord={formState.record}
        contracts={page.contracts}
        nextCode={`BEN-${page.fiscalYear.slice(0, 4)}-${String((benefitsObj.records || []).length + 1).padStart(3, '0')}`}
        onCancel={() => setFormState({ open: false, record: null })}
        onSubmit={(values, form) => page.saveBenefit(values, formState.record, form)}
      />

      <BenefitDossierModal
        record={dossierRecord}
        onClose={() => setDossierRecord(null)}
        onOpenContract={page.openContract}
      />
    </div>
  );
}

export default function DevelopedLandBeneficiariesManagement() {
  return (
    <App>
      <DevelopedLandBeneficiariesContent />
    </App>
  );
}
