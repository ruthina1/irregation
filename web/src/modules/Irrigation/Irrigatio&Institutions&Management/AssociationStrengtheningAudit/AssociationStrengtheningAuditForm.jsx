import { useState } from 'react';
import { Checkbox, Col, Divider, Form, Input, InputNumber, Modal, Row, Select, Space } from 'antd';
import { AuditOutlined } from '@ant-design/icons';
import EthDateFields from '../../shared/components/EthDateFields';
import { ETHIOPIAN_FISCAL_YEARS } from '../../shared/constants';
import { ethDateFields, extractName } from '../../shared/utils';
import { AUDIT_SCOPES, AUDIT_VERDICTS, COMPLIANCE_CHECKS, GOVERNANCE_GRADES } from './AssociationStrengtheningAuditManagement';

const { TextArea } = Input;
const sectionStyle = { margin: '6px 0 10px', fontSize: 12, color: '#1a5f2c', fontWeight: 600 };

/** Initial form values: the saved result when there is one, blanks for a pending audit. */
const initialValues = (record, fiscalYear) => {
  const checklist = record.compliance_checklist || {};
  return {
    fiscal_year: fiscalYear,
    audit_scope: record.audit_scope || AUDIT_SCOPES[0],
    audit_verdict: record.audit_verdict || undefined,
    governance_grade: record.governance_grade || undefined,
    overall_health_score: record.overall_health_score ?? undefined,
    audited_revenue_etb: record.audited_revenue_etb ?? undefined,
    audited_expense_etb: record.audited_expense_etb ?? undefined,
    unaccounted_variance_etb: record.unaccounted_variance_etb ?? 0,
    lead_auditor: record.lead_auditor || undefined,
    audit_institution: record.audit_institution || undefined,
    strengthening_interventions: record.strengthening_interventions || undefined,
    ...Object.fromEntries(COMPLIANCE_CHECKS.map((c) => [c.field, Boolean(checklist[c.key])])),
    // A new yearly inspection defaults to today's date.
    ...ethDateFields(null),
  };
};

/**
 * Certify the yearly audit of one WUA (profile locked). The server moves the
 * previous result into audit_history. The parent keys this component by the
 * audit id, so the form initialises once per opened audit.
 */
export default function YearlyAuditModal({ record, fiscalYear, onCancel, onSubmit }) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const handleFinish = async (values) => {
    setSubmitting(true);
    const saved = await onSubmit(record, values, form);
    setSubmitting(false);
    if (saved) onCancel();
  };

  return (
    <Modal
      title={(
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <AuditOutlined style={{ color: '#1a5f2c', fontSize: 18 }} />
          <span style={{ fontSize: 15, fontWeight: 700, color: '#1a5f2c' }}>Conduct Yearly Audit Inspection: {record?.wua_name}</span>
        </div>
      )}
      open={Boolean(record)}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText="Certify Yearly Audit"
      okButtonProps={{ style: { backgroundColor: '#1a5f2c', borderColor: '#1a5f2c' } }}
      confirmLoading={submitting}
      width={740}
      style={{ top: 24 }}
      styles={{ body: { maxHeight: '80vh', overflowY: 'auto' } }}
      destroyOnHidden
    >
      {record && (
        <Form form={form} layout="vertical" size="middle" onFinish={handleFinish} initialValues={initialValues(record, fiscalYear)}>
          <div style={{ background: '#f6ffed', border: '1px solid #d1d5db', padding: '12px 14px', borderRadius: 8, marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, flexWrap: 'wrap', gap: 8 }}>
              <span>WUA Registration: <strong style={{ color: '#1a5f2c' }}>{record.wua_reg_code}</strong></span>
              <span>Command: <strong>{record.command_area_ha ?? 'Not tracked'} Ha</strong></span>
              <span>Members: <strong>{record.total_members ?? 'Not tracked'} Farmers</strong></span>
            </div>
            <div style={{ fontSize: 11, color: '#595959', marginTop: 4 }}>
              Scheme: <strong>{record.scheme_name}</strong> | Station: {extractName(record.woreda)}, {extractName(record.zone)}
            </div>
          </div>

          <Divider titlePlacement="start" style={{ ...sectionStyle, margin: '0 0 10px' }}>1. Yearly Audit Scope & Inspection Fiscal Year</Divider>
          <Row gutter={10}>
            <Col span={8}>
              <Form.Item name="fiscal_year" label="Audit Fiscal Year (E.C.)" rules={[{ required: true }]}>
                <Select placeholder="Fiscal Year" options={ETHIOPIAN_FISCAL_YEARS.map((fy) => ({ value: fy, label: fy }))} />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item name="audit_scope" label="Yearly Audit Inspection Scope" rules={[{ required: true }]}>
                <Select placeholder="Select Scope" options={AUDIT_SCOPES.map((s) => ({ value: s, label: s }))} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={10}>
            <Col span={12}>
              <Form.Item name="audit_verdict" label="Regulatory Audit Opinion Verdict" rules={[{ required: true }]}>
                <Select placeholder="Select Verdict" options={AUDIT_VERDICTS.map((v) => ({ value: v.value, label: v.label }))} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="governance_grade" label="Institutional Functionality Grade" rules={[{ required: true }]}>
                <Select placeholder="Select Grade" options={GOVERNANCE_GRADES.map((g) => ({ value: g.value, label: g.label }))} />
              </Form.Item>
            </Col>
          </Row>

          <Divider titlePlacement="start" style={sectionStyle}>2. Annual Financial Ledger Reconciliation (ETB)</Divider>
          <Row gutter={10}>
            <Col span={8}>
              <Form.Item name="audited_revenue_etb" label="Annual Water Fee Revenue (ETB)" rules={[{ required: true }]}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="audited_expense_etb" label="Annual O&M Expenses (ETB)" rules={[{ required: true }]}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="unaccounted_variance_etb" label="Unaccounted Discrepancy">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Divider titlePlacement="start" style={sectionStyle}>3. Annual Governance & Compliance Checklist</Divider>
          <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#1a5f2c', display: 'block', marginBottom: 6 }}>
              Statutory Governance Gates Verified for Current Year:
            </span>
            <Space wrap size={[16, 8]}>
              {COMPLIANCE_CHECKS.map((c) => (
                <Form.Item key={c.field} name={c.field} valuePropName="checked" noStyle>
                  <Checkbox>{c.label}</Checkbox>
                </Form.Item>
              ))}
            </Space>
          </div>

          <Row gutter={10}>
            <Col span={6}>
              <Form.Item name="overall_health_score" label="Health Score (100%)" rules={[{ required: true }]}>
                <InputNumber min={0} max={100} precision={0} style={{ width: '100%' }} suffix="%" />
              </Form.Item>
            </Col>
            <Col span={9}>
              <Form.Item name="lead_auditor" label="Lead Auditor" rules={[{ required: true }]}>
                <Input placeholder="Auditor Name" />
              </Form.Item>
            </Col>
            <Col span={9}>
              <Form.Item name="audit_institution" label="Regulatory Directorate / Institution">
                <Input placeholder="e.g. Zonal Cooperative Regulatory Directorate" />
              </Form.Item>
            </Col>
          </Row>
          <EthDateFields label="Inspection Date (E.C.)" />

          <Form.Item name="strengthening_interventions" label="Auditor Directives & Strengthening Corrective Actions" style={{ marginBottom: 0 }}>
            <TextArea rows={2} placeholder="Detail corrective action directives, cashbook training, by-law revisions, disallowance recoveries..." />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
}
