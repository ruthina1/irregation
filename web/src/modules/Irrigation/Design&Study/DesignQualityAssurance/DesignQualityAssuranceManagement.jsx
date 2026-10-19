import React, { useEffect, useMemo, useState } from 'react';
import { App } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { irrigationStudyDesignApi } from '../../../../services/api/irrigationApi';
import useIrrigationRecords from '../../shared/hooks/useIrrigationRecords';
import { CURRENT_FISCAL_YEAR } from '../../shared/constants';
import { exportRowsToCsv, extractName, notifyApiError, toNumber } from '../../shared/utils';
import IrrigationBreadcrumb from '../../shared/components/IrrigationBreadcrumb';
import IrrigationPageHeader from '../../shared/components/IrrigationPageHeader';
import LoadErrorAlert from '../../shared/components/LoadErrorAlert';
import IrrigationStatsSection from '../../shared/components/IrrigationStatsSection';

import DesignQualityAssuranceStats from './DesignQualityAssuranceStats';
import DesignQualityAssuranceFilters from './DesignQualityAssuranceFilters';
import DesignQualityAssuranceTable from './DesignQualityAssuranceTable';
import DesignQualityAssuranceForm from './DesignQualityAssuranceForm';
import DesignQualityAssuranceDetail, { LinkedReviewModal } from './DesignQualityAssuranceDetail';

/* --- QA certification statuses (backend IrrigationEnums::QA_STATUSES) --- */
export const QA_CERTIFIED = 'Certified QA Passed';

export const QA_STATUSES = [
  { value: 'Certified QA Passed', label: 'Certified QA Passed (Full Clearance)', color: 'success' },
  { value: 'Conditional Clearance', label: 'Conditional Clearance (Minor Fixes)', color: 'default' },
  { value: 'Rectifications Required', label: 'Rectifications Required (Audit Failed)', color: 'warning' },
  { value: 'Rejected Non-Compliant', label: 'Rejected Non-Compliant', color: 'error' },
  { value: 'Under QA Audit', label: 'Under QA Audit (In Progress)', color: 'processing' },
];

/* --- QA audit focus domains (backend IrrigationEnums::QA_DOMAINS) --- */
export const QA_DOMAINS = [
  'Full Comprehensive Multi-Disciplinary QA',
  'Headwork Structural & Hydrological Audit',
  'Main Conveyance & Distribution System Audit',
  'Geotechnical Foundation & Dam Safety Audit',
  'Environmental & Social Safeguards (ESIA) Audit',
];

/**
 * Statutory safety gates: form field (check_*) → key of the server's
 * verification_checklist, with the form label and the dossier label.
 */
export const QA_CHECKS = [
  { field: 'check_hydrology', key: 'hydrology_safety', label: '1:100yr Flood Peak Safety', dossier: '1:100yr Flood Safety' },
  { field: 'check_structural', key: 'structural_stability', label: 'Sliding & Overturning Stability', dossier: 'Structural Stability (Overturning/Sliding)' },
  { field: 'check_geotech', key: 'geotech_foundation', label: 'Foundation Bearing Capacity', dossier: 'Foundation Bearing Capacity' },
  { field: 'check_seepage', key: 'seepage_cutoff', label: 'Seepage Cutoff Depth', dossier: 'Seepage Piping Cutoff' },
  { field: 'check_boq', key: 'boq_cost_rationality', label: 'BoQ Market Rationality', dossier: 'BoQ Market Rationality' },
  { field: 'check_esia', key: 'esia_clearance', label: 'ESIA Safeguard Certificate', dossier: 'ESIA Safeguards', softFail: true },
];

/* --- Disciplinary checklist of a linked design document review --- */
export const REVIEW_CHECKS = [
  { key: 'hydrology', label: 'Hydrology & Yield' },
  { key: 'structural', label: 'Structural Design' },
  { key: 'geotechnical', label: 'Geotechnical & Foundation' },
  { key: 'agronomy', label: 'Agronomy Layout' },
  { key: 'esia', label: 'ESIA Safeguards' },
];

/** Defaults for a newly registered QA audit session. */
export const NEW_QA_DEFAULTS = {
  qa_domain: 'Full Comprehensive Multi-Disciplinary QA',
  compliance_score: 90,
  qa_institution: 'Regional Water & Irrigation Quality Assurance Directorate',
  ...Object.fromEntries(QA_CHECKS.map((c) => [c.field, true])),
};

export const scoreColor = (score) => {
  if (score >= 85) return '#1a5f2c';
  if (score >= 70) return '#a16207';
  return '#b42318';
};




const COLUMNS = [
  ['QA Cert No', (r) => r.qa_certificate_no],
  ['Project Code', (r) => r.project_code],
  ['Scheme Name', (r) => r.scheme_name],
  ['Linked Review', (r) => r.linked_review_code],
  ['Review Verdict', (r) => r.review_verdict_snapshot],
  ['QA Domain', (r) => r.qa_domain],
  ['Command Area (Ha)', (r) => toNumber(r.command_area_ha)],
  ['Score', (r) => toNumber(r.compliance_score)],
  ['QA Status', (r) => r.qa_status],
  ['Auditor', (r) => r.lead_qa_auditor],
  ['QA Date', (r) => r.qa_ethiopian_date],
  ['Zone', (r) => extractName(r.zone)],
  ['Woreda', (r) => extractName(r.woreda)],
  ['Kebele', (r) => extractName(r.kebele)],
];

export const exportQaLedger = (rows) => exportRowsToCsv(rows, COLUMNS, 'Irrigation_Design_Quality_Assurance');











/** Fields the client may write on a QA audit (the server derives the rest). */
const toPayload = (values, qaStatus) => ({
  project_id: values.project_id,
  qa_certificate_no: values.qa_certificate_no,
  qa_domain: values.qa_domain,
  command_area_ha: values.command_area_ha,
  fiscal_year: values.fiscal_year,
  lead_qa_auditor: values.lead_qa_auditor,
  qa_institution: values.qa_institution,
  compliance_score: values.compliance_score,
  qa_audit_findings: values.qa_audit_findings,
  qa_status: qaStatus,
  eth_month: values.eth_month,
  eth_day: values.eth_day,
  eth_year: values.eth_year,
  ...Object.fromEntries(QA_CHECKS.map((c) => [c.field, Boolean(values[c.field])])),
});

/**
 * State and server interaction for the Design Quality Assurance page:
 * QA audits, the parent study-design projects (with their latest review
 * outcome), filters, KPIs, the linked-review lookup and all mutations.
 */
function useDesignQualityAssurance() {
  const { message } = App.useApp();

  const [fiscalYear, setFiscalYear] = useState(CURRENT_FISCAL_YEAR);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);
  const [domainFilter, setDomainFilter] = useState(null);
  const [zoneFilter, setZoneFilter] = useState(null);

  const audits = useIrrigationRecords(irrigationStudyDesignApi.qualityAssurance, { fiscalYear });
  const studies = useIrrigationRecords(irrigationStudyDesignApi.studyDesign, { fiscalYear });

  const [linkedReview, setLinkedReview] = useState({ open: false, loading: false, review: null, code: null });

  const zoneOptions = useMemo(
    () => [...new Set(audits.records.map((r) => extractName(r.zone, '')).filter(Boolean))].sort(),
    [audits.records]
  );

  const filteredAudits = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return audits.records.filter((r) => {
      const haystack = [r.qa_certificate_no, r.project_code, r.scheme_name, r.lead_qa_auditor, r.zone, r.woreda]
        .map((v) => extractName(v, '').toLowerCase());
      return (
        haystack.some((v) => v.includes(q))
        && (!statusFilter || r.qa_status === statusFilter)
        && (!domainFilter || r.qa_domain === domainFilter)
        && (!zoneFilter || extractName(r.zone, '') === zoneFilter)
      );
    });
  }, [audits.records, searchTerm, statusFilter, domainFilter, zoneFilter]);

  const stats = useMemo(() => {
    const totalAudited = filteredAudits.length;
    const certified = filteredAudits.filter((r) => r.qa_status === QA_CERTIFIED);
    return {
      totalAudited,
      certifiedPassedCount: certified.length,
      pendingRectificationCount: filteredAudits.filter((r) => r.qa_status === 'Rectifications Required').length,
      totalCertifiedArea: sumBy(certified, 'command_area_ha'),
      avgComplianceScore: totalAudited > 0 ? Math.round(sumBy(filteredAudits, 'compliance_score') / totalAudited) : 0,
    };
  }, [filteredAudits]);

  /** Certifying moves the parent study to the construction-ready shelf, so refresh it too. */
  const afterCertification = (record) => {
    if (record.qa_status === QA_CERTIFIED) studies.reload();
  };

  /** Create or update; resolves true when the server accepted the record. */
  const saveAudit = async (values, editingAudit, form) => {
    try {
      if (editingAudit) {
        const saved = await audits.update(editingAudit.id, toPayload(values, editingAudit.qa_status));
        afterCertification(saved);
        message.success('Quality Assurance audit record updated successfully');
      } else {
        await audits.create(toPayload(values, 'Under QA Audit'));
        message.success('New Quality Assurance audit session registered successfully');
      }
      return true;
    } catch (err) {
      notifyApiError(message, err, 'Failed to save QA record', form);
      return false;
    }
  };

  /** The server refuses certification (422) unless the latest document review is approved. */
  const changeStatus = async (record, qaStatus) => {
    try {
      const saved = await audits.patch(record.id, { qa_status: qaStatus });
      afterCertification(saved);
      message.success(
        qaStatus === QA_CERTIFIED
          ? `QA certified — ${saved.project_code || 'the design'} is now on the construction-ready shelf`
          : `QA certification status updated to "${qaStatus}"`
      );
    } catch (err) {
      notifyApiError(message, err, 'Failed to update QA certification status');
    }
  };

  const deleteAudit = async (record) => {
    try {
      await audits.remove(record.id);
      message.success('QA audit dossier removed successfully');
    } catch (err) {
      notifyApiError(message, err, 'Failed to delete QA record');
    }
  };

  const exportCsv = () => {
    if (!filteredAudits.length) {
      message.warning('No QA audit records available to export');
      return;
    }
    exportQaLedger(filteredAudits);
    message.success('Quality assurance ledger exported successfully');
  };

  /** Open the linked design document review, fetched by its review code. */
  const openReview = async (code) => {
    if (!code || code === 'Pending Review') {
      message.info('No design document review has been logged for this project yet.');
      return;
    }
    setLinkedReview({ open: true, loading: true, review: null, code });
    try {
      const res = await irrigationStudyDesignApi.documentReview.list({ code });
      const review = (res.data?.data || [])[0] || null;
      if (!review) {
        setLinkedReview({ open: false, loading: false, review: null, code: null });
        message.info(`Detailed document review report for ${code} was not found.`);
        return;
      }
      setLinkedReview({ open: true, loading: false, review, code });
    } catch (err) {
      setLinkedReview({ open: false, loading: false, review: null, code: null });
      notifyApiError(message, err, `Failed to load document review ${code}`);
    }
  };

  const closeReview = () => setLinkedReview({ open: false, loading: false, review: null, code: null });

  const reload = () => {
    audits.reload();
    studies.reload();
  };

  return {
    fiscalYear,
    setFiscalYear,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    domainFilter,
    setDomainFilter,
    zoneFilter,
    setZoneFilter,
    zoneOptions,
    audits,
    studies,
    filteredAudits,
    stats,
    saveAudit,
    changeStatus,
    deleteAudit,
    exportCsv,
    linkedReview,
    openReview,
    closeReview,
    reload,
  };
}


function DesignQualityAssuranceContent() {
  const page = useDesignQualityAssurance();
  const [formState, setFormState] = useState({ open: false, audit: null });
  const [dossierAudit, setDossierAudit] = useState(null);

  return (
    <div className="irr-page">
      <IrrigationBreadcrumb section="Irrigation Study & Design" title="Design Quality Assurance (የጥራት ማረጋገጫ ስራዎች)" />

      <LoadErrorAlert error={page.audits.error} onRetry={page.audits.reload} />
      <LoadErrorAlert error={page.studies.error} onRetry={page.studies.reload} />

      <IrrigationStatsSection onRefresh={page.reload} loading={page.audits.loading}>
        <DesignQualityAssuranceStats stats={page.stats} />
      </IrrigationStatsSection>

      <IrrigationPageHeader
        section="Irrigation Study & Design"
        title="Design Quality Assurance (የጥራት ማረጋገጫ ስራዎች)"
        subtitle="Engineering compliance audits, structural safety checks, and formal construction-readiness certification"
        fiscalYear={page.fiscalYear}
        onFiscalYearChange={page.setFiscalYear}
        onRefresh={page.reload}
        loading={page.audits.loading}
      >
        <DesignQualityAssuranceFilters
          searchTerm={page.searchTerm}
          onSearchChange={page.setSearchTerm}
          statusFilter={page.statusFilter}
          onStatusChange={page.setStatusFilter}
          domainFilter={page.domainFilter}
          onDomainChange={page.setDomainFilter}
          zoneFilter={page.zoneFilter}
          onZoneChange={page.setZoneFilter}
          zoneOptions={page.zoneOptions}
          onExport={page.exportCsv}
          onCreate={() => setFormState({ open: true, audit: null })}
        />
      </IrrigationPageHeader>

      <DesignQualityAssuranceTable
        data={page.filteredAudits}
        loading={page.audits.loading}
        onView={setDossierAudit}
        onEdit={(audit) => setFormState({ open: true, audit })}
        onDelete={page.deleteAudit}
        onStatusChange={page.changeStatus}
        onOpenReview={page.openReview}
      />

      <DesignQualityAssuranceForm
        open={formState.open}
        editingAudit={formState.audit}
        studies={page.studies.records}
        fiscalYear={page.fiscalYear}
        nextCode={`QA-${page.fiscalYear.slice(0, 4)}-${String(page.audits.records.length + 1).padStart(3, '0')}`}
        onCancel={() => setFormState({ open: false, audit: null })}
        onSubmit={(values, form) => page.saveAudit(values, formState.audit, form)}
      />

      <DesignQualityAssuranceDetail audit={dossierAudit} onClose={() => setDossierAudit(null)} />
      <LinkedReviewModal reviewId={page.linkedReviewId} onClose={page.closeLinkedReview} />
    </div>
  );
}

export default function DesignQualityAssuranceManagement() {
  return (
    <App>
      <DesignQualityAssuranceContent />
    </App>
  );
}
