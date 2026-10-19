import { Button, Descriptions, Divider, Modal, Table, Tag } from 'antd';
import { AuditOutlined, CalendarOutlined, EnvironmentOutlined, LinkOutlined } from '@ant-design/icons';
import { extractName, toNumber } from '../../shared/utils';
import { AUDIT_VERDICTS, COMPLIANCE_CHECKS, GOVERNANCE_GRADES, scoreColor } from './AssociationStrengtheningAuditManagement';

const verdictColor = (v) => AUDIT_VERDICTS.find((x) => x.value === v)?.color || 'default';
const has = (v) => v !== null && v !== undefined && v !== '';

const HISTORY_COLUMNS = [
  { title: 'Fiscal Year', dataIndex: 'year', key: 'year' },
  { title: 'Opinion Verdict', dataIndex: 'verdict', key: 'verdict', render: (v) => <Tag color={verdictColor(v)}>{v || 'Not recorded'}</Tag> },
  { title: 'Score', dataIndex: 'score', key: 'score', render: (s) => <strong>{has(s) ? `${s}%` : 'Not tracked'}</strong> },
  { title: 'Auditor', dataIndex: 'auditor', key: 'auditor', render: (a) => a || '-' },
];

/** Yearly audit & strengthening dossier with history and compliance checklist. */
export default function AuditDossierModal({ record, onClose, onOpenWua }) {
  const grade = GOVERNANCE_GRADES.find((g) => g.value === record?.governance_grade);
  const history = Array.isArray(record?.audit_history) ? record.audit_history : [];
  const checklist = record?.compliance_checklist || {};
  const variance = toNumber(record?.unaccounted_variance_etb);

  return (
    <Modal
      title={(
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <AuditOutlined style={{ color: '#1a5f2c', fontSize: 18 }} />
          <span style={{ fontSize: 16, fontWeight: 'bold', color: '#1a5f2c' }}>{record?.wua_name} - Audit & Strengthening Dossier</span>
        </div>
      )}
      open={Boolean(record)}
      onCancel={onClose}
      footer={[<Button key="close" type="primary" onClick={onClose} style={{ backgroundColor: '#1a5f2c' }}>Close</Button>]}
      width={750}
      destroyOnHidden
    >
      {record && (
        <div style={{ paddingTop: 6 }}>
          <Descriptions bordered size="small" column={2}>
            <Descriptions.Item label="Audit Inspection Code" span={1}>
              <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1a5f2c' }}>{record.audit_code}</span>
            </Descriptions.Item>
            <Descriptions.Item label="WUA Reference" span={1}>
              <Button type="link" size="small" icon={<LinkOutlined />} style={{ padding: 0 }} onClick={() => onOpenWua(record.wua_name)}>
                {record.wua_reg_code}
              </Button>
            </Descriptions.Item>
            <Descriptions.Item label="Irrigation Scheme" span={1}><strong>{record.scheme_name}</strong></Descriptions.Item>
            <Descriptions.Item label="Managed Command Area" span={1}>
              <strong style={{ color: '#1a5f2c' }}>
                {has(record.command_area_ha) ? `${toNumber(record.command_area_ha).toLocaleString()} Hectares` : 'Not tracked'}
              </strong>
            </Descriptions.Item>
            <Descriptions.Item label="Audit Focus Scope" span={2}><strong>{record.audit_scope || 'Not set'}</strong></Descriptions.Item>
            <Descriptions.Item label="Governance Health Grade" span={1}>
              {record.governance_grade
                ? <Tag color={grade ? grade.color : 'default'}>{record.governance_grade}</Tag>
                : <span style={{ color: '#8c8c8c' }}>Not graded (audit pending)</span>}
            </Descriptions.Item>
            <Descriptions.Item label="Compliance Score" span={1}>
              {has(record.overall_health_score) ? (
                <strong style={{ fontSize: 14, color: scoreColor(toNumber(record.overall_health_score)) }}>{record.overall_health_score}%</strong>
              ) : <span style={{ color: '#8c8c8c' }}>Not tracked</span>}
            </Descriptions.Item>
            <Descriptions.Item label="Audit Opinion Verdict" span={1}>
              <Tag color={verdictColor(record.audit_verdict)}>{record.audit_verdict || 'Not recorded'}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Audit Inspection Date" span={1}>
              <span><CalendarOutlined style={{ marginRight: 6, color: '#1a5f2c' }} />{record.audit_ethiopian_date || 'Not recorded'}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Audited Total Revenue" span={1}>
              <strong style={{ color: '#1a5f2c' }}>{has(record.audited_revenue_etb) ? `${toNumber(record.audited_revenue_etb).toLocaleString()} ETB` : 'Not tracked'}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Audited O&M Expenses" span={1}>
              {has(record.audited_expense_etb) ? `${toNumber(record.audited_expense_etb).toLocaleString()} ETB` : 'Not tracked'}
            </Descriptions.Item>
            <Descriptions.Item label="Unaccounted Variance" span={2}>
              {has(record.unaccounted_variance_etb) ? (
                <span style={{ color: variance > 0 ? '#b42318' : '#2f7d4a', fontWeight: 600 }}>
                  {variance > 0 ? `${variance.toLocaleString()} ETB (Disallowance Recovery Pending)` : '0.00 ETB (Clean Balance Reconciliation)'}
                </span>
              ) : <span style={{ color: '#8c8c8c' }}>Not tracked</span>}
            </Descriptions.Item>
            <Descriptions.Item label="Lead Auditor" span={1}>{record.lead_auditor || 'Not assigned'}</Descriptions.Item>
            <Descriptions.Item label="Regulatory Directorate" span={1}>{record.audit_institution || '-'}</Descriptions.Item>
            <Descriptions.Item label="Administrative Station" span={2}>
              <EnvironmentOutlined style={{ color: '#1a5f2c', marginRight: 4 }} />
              {extractName(record.kebele)} &gt; {extractName(record.woreda)} &gt; {extractName(record.zone)}
            </Descriptions.Item>
            <Descriptions.Item label="Strengthening Interventions & Directives" span={2}>
              <div style={{ color: '#595959', fontSize: 12, fontStyle: 'italic' }}>{record.strengthening_interventions || 'No corrective actions logged.'}</div>
            </Descriptions.Item>
          </Descriptions>

          {history.length > 0 && (
            <>
              <Divider titlePlacement="start" style={{ margin: '16px 0 10px', fontSize: 13, color: '#1a5f2c' }}>Historical Yearly Audit Opinions</Divider>
              <Table dataSource={history} rowKey={(h) => `${h.year}-${h.verdict}`} pagination={false} size="small" bordered columns={HISTORY_COLUMNS} />
            </>
          )}

          <Divider titlePlacement="start" style={{ margin: '16px 0 10px', fontSize: 13, color: '#1a5f2c' }}>
            Statutory Governance & Compliance Verification
          </Divider>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {COMPLIANCE_CHECKS.map((c) => (
              <Tag key={c.key} color={checklist[c.key] ? 'success' : c.noColor}>
                {c.tag}: {checklist[c.key] ? c.yes : c.no}
              </Tag>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
}
