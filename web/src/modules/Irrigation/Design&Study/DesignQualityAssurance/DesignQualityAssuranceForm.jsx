import { useEffect, useMemo, useState } from 'react';
import {
  Alert, Button, Checkbox, Col, Divider, Form, Input, InputNumber, Modal, Row, Select, Space, Tag,
} from 'antd';
import {
  CheckCircleOutlined, FileSearchOutlined, SafetyCertificateOutlined, WarningOutlined,
} from '@ant-design/icons';
import EthDateFields from '../../shared/components/EthDateFields';
import { ETHIOPIAN_FISCAL_YEARS } from '../../shared/constants';
import { ethDateFields, toNumber } from '../../shared/utils';
import { NEW_QA_DEFAULTS, QA_CHECKS, QA_DOMAINS } from './DesignQualityAssuranceManagement';

const { TextArea } = Input;
const sectionStyle = { margin: '6px 0 10px', fontSize: 12, color: '#1a5f2c', fontWeight: 600 };

/**
 * Review prerequisite of the selected study, read from the study row's
 * latest_review_* fields (never from its review_status).
 */
function ReviewGateAlert({ gate, onOpenReview }) {
  if (!gate) return null;

  const inspect = (danger) => (
    <Button
      type="link"
      size="small"
      icon={<FileSearchOutlined />}
      style={{ padding: 0, height: 'auto', fontWeight: 600, ...(danger ? { color: '#b42318' } : {}) }}
      onClick={() => onOpenReview(gate.code)}
      disabled={!gate.code}
    >
      Inspect Review Modal ({gate.code || 'No review yet'})
    </Button>
  );

  return (
    <div style={{ marginBottom: 14 }}>
      {gate.cleared ? (
        <Alert
          type="success"
          showIcon
          icon={<CheckCircleOutlined />}
          message={(
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 600 }}>Prerequisite Verified: Design Document Review is Cleared</span>
              {inspect(false)}
            </div>
          )}
          description={(
            <div style={{ fontSize: 11, marginTop: 2 }}>
              Status: <strong>{gate.verdict}</strong> (Score: {gate.score}%)
            </div>
          )}
        />
      ) : (
        <Alert
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          message={(
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#b42318' }}>
                Warning: Design Document Review Gate Not Fully Cleared!
              </span>
              {inspect(true)}
            </div>
          )}
          description={(
            <div style={{ fontSize: 11, marginTop: 2 }}>
              Current Status: <Tag color="warning">{gate.verdict}</Tag> (Score: {gate.score}%). Technical committee
              comments must be verified before granting full QA clearance; certification is refused until the latest
              review is approved.
            </div>
          )}
        />
      )}
    </div>
  );
}

/** Register / edit a design quality-assurance audit. */
export default function DesignQualityAssuranceForm({
  open, editingAudit, studies, fiscalYear, nextCode, onOpenReview, onCancel, onSubmit,
}) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const projectId = Form.useWatch('project_id', form);

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    if (editingAudit) {
      form.setFieldsValue({
        project_id: editingAudit.project_id,
        qa_certificate_no: editingAudit.qa_certificate_no,
        qa_domain: editingAudit.qa_domain,
        command_area_ha: toNumber(editingAudit.command_area_ha),
        compliance_score: toNumber(editingAudit.compliance_score),
        lead_qa_auditor: editingAudit.lead_qa_auditor,
        qa_institution: editingAudit.qa_institution,
        fiscal_year: editingAudit.fiscal_year || fiscalYear,
        qa_audit_findings: editingAudit.qa_audit_findings,
        ...ethDateFields(editingAudit.qa_ethiopian_date),
        ...Object.fromEntries(QA_CHECKS.map((c) => [c.field, Boolean(editingAudit.verification_checklist?.[c.key])])),
      });
    } else {
      form.setFieldsValue({ ...NEW_QA_DEFAULTS, fiscal_year: fiscalYear, qa_certificate_no: nextCode, ...ethDateFields(null) });
    }
  }, [open, editingAudit, form, fiscalYear, nextCode]);

  const projectOptions = useMemo(() => {
    const options = studies.map((p) => ({ value: p.id, label: `${p.project_name} (${p.project_code})` }));
    if (editingAudit && !studies.some((p) => p.id === editingAudit.project_id)) {
      options.unshift({ value: editingAudit.project_id, label: `${editingAudit.scheme_name} (${editingAudit.project_code})` });
    }
    return options;
  }, [studies, editingAudit]);

  // Review gate of the linked study: live study row first, else the audit's own snapshot.
  const gate = useMemo(() => {
    if (!projectId) return null;
    const study = studies.find((p) => p.id === projectId);
    if (study) {
      return {
        code: study.latest_review_code,
        verdict: study.latest_review_verdict || 'No document review logged',
        score: toNumber(study.latest_review_score),
        cleared: Boolean(study.review_cleared),
      };
    }
    if (editingAudit && editingAudit.project_id === projectId) {
      return {
        code: editingAudit.linked_review_code === 'Pending Review' ? null : editingAudit.linked_review_code,
        verdict: editingAudit.review_verdict_snapshot,
        score: toNumber(editingAudit.review_score_snapshot),
        cleared: Boolean(editingAudit.review_cleared),
      };
    }
    return null;
  }, [projectId, studies, editingAudit]);

  // Auto-link: pre-fill the command area of the selected study.
  const handleProjectChange = (id) => {
    const study = studies.find((p) => p.id === id);
    if (study) form.setFieldsValue({ command_area_ha: toNumber(study.command_area_hectares) });
  };

  const handleFinish = async (values) => {
    setSubmitting(true);
    const saved = await onSubmit(values, form);
    setSubmitting(false);
    if (saved) onCancel();
  };

  return (
    <Modal
      title={(
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SafetyCertificateOutlined style={{ color: '#1a5f2c', fontSize: 18 }} />
          <span style={{ fontSize: 15, fontWeight: 700, color: '#1a5f2c' }}>
            {editingAudit ? 'Edit Quality Assurance Audit Record' : 'Log New Design Quality Assurance (QA) Audit'}
          </span>
        </div>
      )}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={submitting}
      width={720}
      style={{ top: 24 }}
      styles={{ body: { padding: '16px 20px', maxHeight: '80vh', overflowY: 'auto' } }}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" size="middle" onFinish={handleFinish}>
        <Divider titlePlacement="start" style={{ ...sectionStyle, margin: '0 0 10px' }}>
          1. Link to Registered Study & Design Project
        </Divider>
        <Row gutter={10}>
          <Col span={16}>
            <Form.Item
              name="project_id"
              label="Select Irrigation Scheme (from Study & Design Registry)"
              rules={[{ required: true, message: 'Please select an existing project' }]}
            >
              <Select
                placeholder="Select scheme to auto-link review data"
                onChange={handleProjectChange}
                showSearch
                optionFilterProp="label"
                options={projectOptions}
                notFoundContent="No study & design projects for this fiscal year"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="qa_certificate_no" label="QA Certificate No" rules={[{ required: true }]}>
              <Input placeholder="e.g. QA-CERT-2019-01" style={{ fontFamily: 'monospace' }} />
            </Form.Item>
          </Col>
        </Row>

        <ReviewGateAlert gate={gate} onOpenReview={onOpenReview} />

        <Row gutter={10}>
          <Col span={12}>
            <Form.Item name="qa_domain" label="QA Audit Focus Scope" rules={[{ required: true }]}>
              <Select placeholder="Select Scope" options={QA_DOMAINS.map((d) => ({ value: d, label: d }))} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="command_area_ha" label="Command Area (Ha)" rules={[{ required: true }]}>
              <InputNumber min={0} style={{ width: '100%' }} suffix="Ha" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="fiscal_year" label="Fiscal Year (E.C.)" rules={[{ required: true }]}>
              <Select placeholder="Fiscal Year" options={ETHIOPIAN_FISCAL_YEARS.map((fy) => ({ value: fy, label: fy }))} />
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="start" style={sectionStyle}>2. QA Auditor & Regulatory Directorate</Divider>
        <Row gutter={10}>
          <Col span={12}>
            <Form.Item name="lead_qa_auditor" label="Lead QA Auditor / Inspector" rules={[{ required: true }]}>
              <Input placeholder="e.g. Eng. Yohannes Gizaw (Chief QA Inspector)" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="qa_institution" label="Auditing Regulatory Directorate" rules={[{ required: true }]}>
              <Input placeholder="e.g. Regional Water & Irrigation QA Directorate" />
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="start" style={sectionStyle}>3. Statutory Safety Gates & Compliance Score</Divider>
        <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 12 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#1a5f2c', display: 'block', marginBottom: 6 }}>
            Mandatory National Technical Safety Gates Audited Compliant:
          </span>
          <Space wrap size={[16, 8]}>
            {QA_CHECKS.map((c) => (
              <Form.Item key={c.field} name={c.field} valuePropName="checked" noStyle>
                <Checkbox>{c.label}</Checkbox>
              </Form.Item>
            ))}
          </Space>
        </div>

        <Row gutter={10}>
          <Col span={8}>
            <Form.Item name="compliance_score" label="Compliance Score (100%)" rules={[{ required: true }]}>
              <InputNumber min={0} max={100} style={{ width: '100%' }} suffix="%" />
            </Form.Item>
          </Col>
          <Col span={16}>
            <EthDateFields label="QA Audit Session Date (Ethiopian Calendar)" />
          </Col>
        </Row>

        <Form.Item name="qa_audit_findings" label="Lead Auditor Technical Notes & Directives" style={{ marginBottom: 0 }}>
          <TextArea rows={2} placeholder="Summarize safety factors, energy dissipator performance, foundation seepage cutoff verification..." />
        </Form.Item>
      </Form>
    </Modal>
  );
}
