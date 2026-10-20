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
import AuditStats, { AuditChart } from './AssociationStrengtheningAuditStats';
import AuditFilters from './AssociationStrengtheningAuditFilters';
import AuditTable from './AssociationStrengtheningAuditTable';
import YearlyAuditModal from './AssociationStrengtheningAuditForm';
import AuditDossierModal from './AssociationStrengtheningAuditDetail';

/* --- Regulatory Audit Opinion Verdicts --- */
export const AUDIT_IN_PROGRESS = 'Audit In Progress';

export const AUDIT_VERDICTS = [
  { value: 'Unqualified Audit Opinion', label: 'Unqualified (Clean / Compliant)', color: 'success' },
  { value: 'Qualified Audit Opinion', label: 'Qualified (Minor Observations / Fixes)', color: 'default' },
  { value: 'Adverse Audit Opinion', label: 'Adverse (Severe Financial Irregularities)', color: 'error' },
  { value: 'Disclaimer of Opinion', label: 'Disclaimer (Inadequate Ledger Records)', color: 'warning' },
  { value: AUDIT_IN_PROGRESS, label: 'Audit Inspection In Progress', color: 'processing' },
];

/* --- Institutional Governance Health Grades --- */
export const GOVERNANCE_GRADES = [
  { value: 'Grade A - High Functionality', label: 'Grade A - High Functionality (85-100%)', color: 'success' },
  { value: 'Grade B - Moderate Functionality', label: 'Grade B - Moderate Functionality (65-84%)', color: 'default' },
  { value: 'Grade C - Weak Governance', label: 'Grade C - Weak Governance / Needs Restructuring (<65%)', color: 'warning' },
];

/* --- Audit Focus Scopes --- */
export const AUDIT_SCOPES = [
  'Comprehensive Financial & Legal Compliance Audit',
  'Annual Water Fee Revenue & Bank Reconciliation Audit',
  'Operation & Maintenance Fund Utilization Audit',
  'Governance & Leadership By-Law Compliance Inspection',
];

/** Form check field -> compliance_checklist key returned by the server. */
export const COMPLIANCE_CHECKS = [
  { field: 'check_assembly', key: 'annual_general_assembly_held', label: 'General Assembly Convened', tag: 'Annual General Assembly', yes: 'Convened', no: 'Not Held', noColor: 'error' },
  { field: 'check_bank', key: 'bank_reconciliation_verified', label: 'Bank Reconciled', tag: 'Bank Reconciliation', yes: 'Verified', no: 'Unreconciled', noColor: 'error' },
  { field: 'check_receipts', key: 'water_fee_receipts_audited', label: 'Fee Receipts Audited', tag: 'Water Fee Receipts', yes: 'Audited', no: 'Missing Receipts', noColor: 'error' },
  { field: 'check_bylaws', key: 'by_laws_enforced', label: 'Bylaws Enforced', tag: 'By-Laws Enforced', yes: 'Yes', no: 'Partial', noColor: 'warning' },
  { field: 'check_disputes', key: 'dispute_resolution_active', label: 'Dispute Resolution Active', tag: 'Dispute Committee', yes: 'Active', no: 'Inactive', noColor: 'default' },
  { field: 'check_assets', key: 'asset_register_updated', label: 'Asset Register Maintained', tag: 'Asset Register', yes: 'Updated', no: 'Pending', noColor: 'default' },
];

/** Pending audits (auto-created per WUA) have no verdict/grade/score yet. */
export const isPendingAudit = (record) => !record?.audit_verdict || record.audit_verdict === AUDIT_IN_PROGRESS;

/** "Grade A - High Functionality" -> "Grade A"; null-safe. */
export const gradeShort = (grade) => (typeof grade === 'string' && grade ? grade.split('-')[0].trim() : null);

export const isStrengthenedGrade = (grade) => typeof grade === 'string' && (grade.includes('Grade A') || grade.includes('Grade B'));

export const scoreColor = (score) => {
  if (score >= 85) return '#1a5f2c';
  if (score >= 65) return '#5b8a6b';
  return '#b42318';
};



const num = (v) => (v === null || v === undefined || v === '' ? '' : Number(v));

const COLUMNS = [
  ['Audit Code', (r) => r.audit_code],
  ['WUA Code', (r) => r.wua_reg_code],
  ['Association Name', (r) => r.wua_name],
  ['Scheme Name', (r) => r.scheme_name],
  ['Scope', (r) => r.audit_scope],
  ['Verdict', (r) => r.audit_verdict],
  ['Grade', (r) => r.governance_grade],
  ['Health Score (%)', (r) => num(r.overall_health_score)],
  ['Revenue (ETB)', (r) => num(r.audited_revenue_etb)],
  ['Expense (ETB)', (r) => num(r.audited_expense_etb)],
  ['Discrepancy (ETB)', (r) => num(r.unaccounted_variance_etb)],
  ['Auditor', (r) => r.lead_auditor],
  ['Institution', (r) => r.audit_institution],
  ['Date', (r) => r.audit_ethiopian_date],
  ['Zone', (r) => extractName(r.zone)],
  ['Woreda', (r) => extractName(r.woreda)],
];

export const exportAuditLedger = (rows) => exportRowsToCsv(rows, COLUMNS, 'WUA_Assessment_Audit_Ledger');



/**
 * WUA strengthening audits. One (pending) audit is created by the server for
 * every registered WUA, so this page only lists, certifies (update) and deletes.
 */
function useAssociationAudits() {
  const { message } = App.useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const [fiscalYear, setFiscalYear] = useState(CURRENT_FISCAL_YEAR);
  // The WUA registry links here with { state: { searchWua } }.
  const [searchTerm, setSearchTerm] = useState(() => location.state?.searchWua || '');
  const [verdictFilter, setVerdictFilter] = useState(null);
  const [gradeFilter, setGradeFilter] = useState(null);

  const audits = useIrrigationRecords(irrigationApi.associationAudits, { fiscalYear });

  useEffect(() => {
    const wua = location.state?.searchWua;
    if (wua) {
      message.info(`Filtered audit inspection records for "${wua}"`);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.state, location.pathname, navigate, message]);

  const filteredRecords = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return audits.records.filter((r) => {
      const haystack = [r.audit_code, r.wua_reg_code, r.wua_name, r.scheme_name, r.lead_auditor, r.zone, r.woreda]
        .map((v) => extractName(v, '').toLowerCase());
      return haystack.some((v) => v.includes(q))
        && (!verdictFilter || r.audit_verdict === verdictFilter)
        && (!gradeFilter || r.governance_grade === gradeFilter);
    });
  }, [audits.records, searchTerm, verdictFilter, gradeFilter]);

  const stats = useMemo(() => {
    const completed = filteredRecords.filter((r) => !isPendingAudit(r));
    const scored = completed.filter((r) => r.overall_health_score !== null && r.overall_health_score !== undefined);
    return {
      totalAuditedWuas: completed.length,
      pendingCount: filteredRecords.length - completed.length,
      cleanAuditCount: completed.filter((r) => r.audit_verdict === 'Unqualified Audit Opinion').length,
      strengthenedCount: completed.filter((r) => isStrengthenedGrade(r.governance_grade)).length,
      totalAuditedRevenue: sumBy(completed, 'audited_revenue_etb'),
      totalAuditedExpenses: sumBy(completed, 'audited_expense_etb'),
      totalUnaccountedDiscrepancies: sumBy(completed, 'unaccounted_variance_etb'),
      // null when no audit has a score yet -> "Not tracked"
      avgHealthScore: scored.length ? Math.round(sumBy(scored, 'overall_health_score') / scored.length) : null,
    };
  }, [filteredRecords]);

  const chartData = useMemo(() => filteredRecords.filter((r) => !isPendingAudit(r)).map((r) => {
    const name = r.wua_name || r.audit_code || '';
    return {
      name: name.length > 14 ? `${name.substring(0, 14)}...` : name,
      revenue: Math.round(toNumber(r.audited_revenue_etb) / 1000),
      expense: Math.round(toNumber(r.audited_expense_etb) / 1000),
    };
  }), [filteredRecords]);

  /** Certify the yearly audit; the server rolls the previous result into audit_history. */
  const certifyAudit = async (record, values, form) => {
    try {
      const saved = await audits.update(record.id, values);
      message.success(`Yearly audit inspection successfully certified for "${record.wua_name}"!`);
      if (saved.fiscal_year !== fiscalYear) {
        message.info(`The audit now belongs to fiscal year ${saved.fiscal_year}; switch years to see it.`);
      }
      return true;
    } catch (err) {
      notifyApiError(message, err, 'Failed to log yearly audit inspection', form);
      return false;
    }
  };

  const deleteAudit = async (record) => {
    try {
      await audits.remove(record.id);
      message.success('Audit record removed');
    } catch (err) {
      notifyApiError(message, err, 'Failed to delete audit record');
    }
  };

  const exportCsv = () => {
    if (!filteredRecords.length) {
      message.warning('No audit records available to export');
      return;
    }
    exportAuditLedger(filteredRecords);
    message.success('Audit ledger exported successfully');
  };

  return {
    fiscalYear, setFiscalYear, searchTerm, setSearchTerm, verdictFilter, setVerdictFilter, gradeFilter, setGradeFilter,
    audits, filteredRecords, stats, chartData, certifyAudit, deleteAudit, exportCsv,
  };
}


/** Association Strengthening & Audit (Irrigation Institutions Management). */
function AssociationStrengtheningAuditContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const page = useAssociationAudits(location.state?.wuaRegistrationNo || '');

  const [auditingRecord, setAuditingRecord] = useState(null);
  const [dossierRecord, setDossierRecord] = useState(null);

  const initialDossierHandled = useRef(false);
  useEffect(() => {
    if (initialDossierHandled.current) return;
    const target = location.state?.wuaRegistrationNo;
    if (!target || !page.audits.records.length) return;
    const match = page.audits.records.find((a) => a.registration_no === target);
    if (match) {
      setDossierRecord(match);
      initialDossierHandled.current = true;
    }
  }, [location.state, page.audits.records]);

  return (
    <div className="irr-page">
      <IrrigationBreadcrumb section="Irrigation Institutions Management" title="Association Strengthening & Audit (የማህበራት አቅም ምዘና እና ኦዲት)" />

      <LoadErrorAlert error={page.audits.error} onRetry={page.reload} />

      <IrrigationStatsSection onRefresh={page.reload} loading={page.audits.loading}>
        <AuditStats stats={page.stats} />
      </IrrigationStatsSection>

      <IrrigationPageHeader
        section="Irrigation Institutions Management"
        title="Association Strengthening & Audit (የማህበራት አቅም ምዘና እና ኦዲት)"
        subtitle="Maturity tier assessments (Grade A / B / C / D), statutory financial audits, fee collection rates, and bypass dispute resolution"
        fiscalYear={page.fiscalYear}
        onFiscalYearChange={page.setFiscalYear}
        onRefresh={page.reload}
        loading={page.audits.loading}
      >
        <AuditFilters
          searchTerm={page.searchTerm}
          onSearchChange={page.setSearchTerm}
          tier={page.tierFilter}
          onTierChange={page.setTierFilter}
          status={page.statusFilter}
          onStatusChange={page.setStatusFilter}
          onExport={page.exportCsv}
        />
      </IrrigationPageHeader>

      <AuditTable
        data={page.filteredRecords}
        loading={page.audits.loading}
        onView={setDossierRecord}
        onAudit={setAuditingRecord}
        onOpenWua={page.openWuaRegistry}
      />

      <AuditChart data={page.chartData} />

      <YearlyAuditModal
        record={auditingRecord}
        onCancel={() => setAuditingRecord(null)}
        onSubmit={page.saveAudit}
      />

      <AuditDossierModal
        record={dossierRecord}
        onClose={() => setDossierRecord(null)}
        onAudit={(record) => { setDossierRecord(null); setAuditingRecord(record); }}
        onOpenWua={page.openWuaRegistry}
      />
    </div>
  );
}

export default function AssociationStrengtheningAuditManagement() {
  return (
    <App>
      <AssociationStrengtheningAuditContent />
    </App>
  );
}
