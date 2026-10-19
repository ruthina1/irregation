import React, { useMemo, useState } from 'react';
import { App } from 'antd';
import { useNavigate } from 'react-router-dom';
import { irrigationStudyDesignApi } from '../../../../services/api/irrigationApi';
import useIrrigationRecords from '../../shared/hooks/useIrrigationRecords';
import { CURRENT_FISCAL_YEAR } from '../../shared/constants';
import { exportRowsToCsv, extractName, notifyApiError, toNumber } from '../../shared/utils';
import IrrigationBreadcrumb from '../../shared/components/IrrigationBreadcrumb';
import IrrigationPageHeader from '../../shared/components/IrrigationPageHeader';
import LoadErrorAlert from '../../shared/components/LoadErrorAlert';
import IrrigationStatsSection from '../../shared/components/IrrigationStatsSection';

import ConstructionReadyDesignsStats from './ConstructionReadyDesignsStats';
import ConstructionReadyDesignsFilters from './ConstructionReadyDesignsFilters';
import ConstructionReadyDesignsTable from './ConstructionReadyDesignsTable';
import ConstructionReadyDesignsForm from './ConstructionReadyDesignsForm';
import ConstructionReadyDesignsDetail from './ConstructionReadyDesignsDetail';


export const SHELF_STATUSES = [
  { value: 'Available on Shelf', label: 'Available on Shelf (Awaiting Budget)', color: 'default' },
  { value: 'Packaging Tender Dossier', label: 'Packaging Tender Dossier', color: 'orange' },
  { value: 'Packaged & Tender Ready', label: 'Packaged & Tender Ready', color: 'default' },
  { value: 'Handed Over to Construction', label: 'Handed Over to Construction', color: 'success' },
  { value: 'Archived / Redesign Needed', label: 'Archived / Redesign Needed', color: 'default' },
];

export const FINANCING_CHANNELS = [
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

export const PROCUREMENT_METHODS = [
  { value: 'National Competitive Bidding (NCB)', label: 'National Competitive Bidding (NCB)' },
  { value: 'International Competitive Bidding (ICB)', label: 'International Competitive Bidding (ICB)' },
  { value: 'Regional Direct Contracting (Woreda / WUA)', label: 'Regional Direct Contracting (Woreda / WUA)' },
  { value: 'Force Account (Government Enterprise)', label: 'Force Account (Gov Enterprise)' },
];

export const HANDED_OVER = 'Handed Over to Construction';
export const ARCHIVED = 'Archived / Redesign Needed';


const COLUMNS = [
  ['Shelf Ref', (r) => r.shelf_reference_code],
  ['Scheme Name', (r) => r.scheme_name],
  ['Study Ref', (r) => r.study_project_code],
  ['Command Area (Ha)', (r) => toNumber(r.command_area_ha)],
  ['Estimated Cost (ETB)', (r) => toNumber(r.estimated_cost_etb)],
  ['Status', (r) => r.packaging_status],
  ['Packaging Date', (r) => r.packaging_date],
  ['Expected Financing', (r) => r.expected_financing_source],
  ['Tender Procurement Method', (r) => r.tender_procurement_method],
  ['Readiness Level', (r) => r.readiness_level],
  ['Handover Date', (r) => r.handover_date],
  ['Handover Entity', (r) => r.handover_entity],
  ['Zone', (r) => extractName(r.zone)],
  ['Woreda', (r) => extractName(r.woreda)],
  ['Kebele', (r) => extractName(r.kebele)],
];

function ConstructionReadyDesignsManagementContent() {
  const { message } = App.useApp();
  const navigate = useNavigate();

  const [fiscalYear, setFiscalYear] = useState(CURRENT_FISCAL_YEAR);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);
  const [fundingFilter, setFundingFilter] = useState(null);

  const [handoverRecord, setHandoverRecord] = useState(null);
  const [dossierId, setDossierId] = useState(null);

  const shelf = useIrrigationRecords(irrigationStudyDesignApi.constructionReady, { fiscalYear });

  const filteredRecords = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return shelf.records.filter((r) => {
      const haystack = [r.shelf_reference_code, r.scheme_name, r.study_project_code, r.expected_financing_source, r.handover_entity, r.zone, r.woreda]
        .map((v) => extractName(v, '').toLowerCase());
      return (
        haystack.some((v) => v.includes(q))
        && (!statusFilter || r.packaging_status === statusFilter)
        && (!fundingFilter || r.expected_financing_source === fundingFilter)
      );
    });
  }, [shelf.records, searchTerm, statusFilter, fundingFilter]);

  const stats = useMemo(() => {
    const totalProjects = filteredRecords.length;
    const totalHa = filteredRecords.reduce((acc, r) => acc + toNumber(r.command_area_ha), 0);
    const handedOverCount = filteredRecords.filter((r) => r.packaging_status === HANDED_OVER).length;
    const totalBudgetEtb = filteredRecords.reduce((acc, r) => acc + toNumber(r.estimated_cost_etb), 0);
    return {
      totalProjects,
      totalHa,
      handedOverCount,
      totalBudgetMillions: Math.round((totalBudgetEtb / 1_000_000) * 10) / 10,
    };
  }, [filteredRecords]);

  const changeStatus = async (record, nextStatus) => {
    if (record.packaging_status === ARCHIVED) {
      message.warning('Archived designs cannot change status without a formal re-screening audit');
      return;
    }
    try {
      await shelf.patch(record.id, { packaging_status: nextStatus });
      message.success(`Shelf design status updated to "${nextStatus}"`);
    } catch (err) {
      notifyApiError(message, err, 'Failed to update shelf design status');
    }
  };

  const handoverDesign = async (values, record, form) => {
    try {
      await irrigationStudyDesignApi.constructionReady.handover(record.id, values);
      message.success(`Design successfully handed over to construction: ${values.contract_code}`);
      shelf.reload();
      return true;
    } catch (err) {
      notifyApiError(message, err, 'Failed to process construction handover', form);
      return false;
    }
  };

  const openContract = (contractCode) => {
    navigate('/irrigation/construction/projects', { state: { searchCode: contractCode } });
  };

  const exportCsv = () => {
    exportRowsToCsv(filteredRecords, COLUMNS, 'Construction_Ready_Designs_Shelf');
  };

  const dossierRecord = shelf.records.find((r) => r.id === dossierId) || null;

  return (
    <div className="irr-page">
      <IrrigationBreadcrumb section="Irrigation Study & Design" title="Construction-Ready Designs (ለግንባታ ዝግጁ የሆኑ ዲዛይኖች ባንክ)" />

      <LoadErrorAlert error={shelf.error} onRetry={shelf.reload} />

      <IrrigationStatsSection onRefresh={shelf.reload} loading={shelf.loading}>
        <ConstructionReadyDesignsStats stats={stats} />
      </IrrigationStatsSection>

      <IrrigationPageHeader
        section="Irrigation Study & Design"
        title="Construction-Ready Designs (ለግንባታ ዝግጁ የሆኑ ዲዛይኖች ባንክ)"
        subtitle="Regional shelf project bank of fully engineered, QA-certified irrigation schemes packaged for tender advertisement and construction handover"
        fiscalYear={fiscalYear}
        onFiscalYearChange={setFiscalYear}
        onRefresh={shelf.reload}
        loading={shelf.loading}
      >
        <ConstructionReadyDesignsFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          fundingFilter={fundingFilter}
          onFundingChange={setFundingFilter}
          onExport={exportCsv}
        />
      </IrrigationPageHeader>

      <ConstructionReadyDesignsTable
        data={filteredRecords}
        loading={shelf.loading}
        onView={(record) => setDossierId(record.id)}
        onStatusChange={changeStatus}
        onHandover={setHandoverRecord}
        onOpenContract={openContract}
      />

      <ConstructionReadyDesignsForm
        open={Boolean(handoverRecord)}
        record={handoverRecord}
        onCancel={() => setHandoverRecord(null)}
        onSubmit={(values, form) => handoverDesign(values, handoverRecord, form)}
      />

      <ConstructionReadyDesignsDetail record={dossierRecord} onClose={() => setDossierId(null)} />
    </div>
  );
}

export default function ConstructionReadyDesignsManagement() {
  return (
    <App>
      <ConstructionReadyDesignsManagementContent />
    </App>
  );
}
