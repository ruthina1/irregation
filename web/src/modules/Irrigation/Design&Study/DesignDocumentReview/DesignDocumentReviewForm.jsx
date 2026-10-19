import React, { useEffect, useState } from 'react';
import { Checkbox, Col, Divider, Form, Input, InputNumber, Modal, Row, Select, Space, Tag } from 'antd';
import { AuditOutlined } from '@ant-design/icons';
import EthDateFields from '../../shared/components/EthDateFields';
import { ETHIOPIAN_FISCAL_YEARS } from '../../shared/constants';
import { ethDateFields, extractName } from '../../shared/utils';

export const DOCUMENT_VOLUMES = [
  'Volume I: Main Engineering & Feasibility Report',
  'Volume II: Hydrology & Water Resource Assessment',
  'Volume III: Geotechnical & Soil Investigation',
  'Volume IV: Hydraulic & Structural Design Calculations',
  'Volume V: Irrigation Agronomy & Command Area Layout',
  'Volume VI: Environmental & Social Impact Assessment (ESIA)',
  'Volume VII: Bill of Quantities (BoQ) & Tender Dossier',
];

export const REVIEW_MILESTONES = [
  'Inception Report Review Gate',
  'Mid-Term Interim Draft Review Gate',
  'Draft Final Engineering Review Gate',
  'Final Tender Dossier & BoQ Validation',
];

export const REVIEW_VERDICTS = [
  { value: 'Approved Without Comments', label: 'Approved (Clear)', color: 'success' },
  { value: 'Approved with Minor Comments', label: 'Approved (Minor Comments)', color: 'default' },
  { value: 'Major Revisions Required', label: 'Major Revisions Required', color: 'warning' },
  { value: 'Rejected / Incomplete', label: 'Rejected', color: 'error' },
  { value: 'Under Review', label: 'Under Review', color: 'processing' },
];

export const DISCIPLINE_CHECKS = [
  { field: 'check_hydrology', key: 'hydrology', label: 'Hydrology & Yield', dossierLabel: 'Hydrology & Yield' },
  { field: 'check_structural', key: 'structural', label: 'Structural Calculations', dossierLabel: 'Structural Design' },
  { field: 'check_geotechnical', key: 'geotechnical', label: 'Geotech & Foundation', dossierLabel: 'Geotechnical' },
  { field: 'check_agronomy', key: 'agronomy', label: 'Agronomy & Layout', dossierLabel: 'Agronomy Layout' },
  { field: 'check_esia', key: 'esia', label: 'ESIA Safeguards', dossierLabel: 'ESIA Safeguards' },
];

export const NEW_REVIEW_DEFAULTS = {
  document_volume: 'Volume IV: Hydraulic & Structural Design Calculations',
  review_milestone: 'Draft Final Engineering Review Gate',
  submission_version: 'Draft Final (v1.0)',
  overall_technical_score: 85,
  review_team_size: 4,
  check_hydrology: true,
  check_structural: true,
  check_geotechnical: true,
  check_agronomy: true,
  check_esia: false,
};

export const scoreColor = (score) => (score >= 80 ? '#1a5f2c' : score >= 65 ? '#a16207' : '#b42318');


const { TextArea } = Input;
const sectionStyle = { margin: '6px 0 10px', fontSize: 12, color: '#1a5f2c', fontWeight: 600 };

/** Log / edit a technical document review session linked to a study-design project. */
export default function DesignDocumentReviewForm({ open, visible, editingReview, projects = [], fiscalYear, nextCode, onCancel, onSubmit }) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const projectId = Form.useWatch('project_id', form);
  const isOpen = visible !== undefined ? visible : open;

  useEffect(() => {
    if (!isOpen) return;
    form.resetFields();
    if (editingReview) {
      const checklist = editingReview.disciplinary_checklist || {};
      form.setFieldsValue({
        project_id: editingReview.project_id,
        review_code: editingReview.review_code,
        submitting_entity: editingReview.submitting_entity,
        document_volume: editingReview.document_volume,
        review_milestone: editingReview.review_milestone,
        submission_version: editingReview.submission_version,
        command_area_ha: editingReview.command_area_ha,
        overall_technical_score: editingReview.overall_technical_score,
        lead_reviewer: editingReview.lead_reviewer,
        review_team_size: editingReview.review_team_size,
        fiscal_year: editingReview.fiscal_year || fiscalYear,
        technical_remarks: editingReview.technical_remarks,
        ...Object.fromEntries(DISCIPLINE_CHECKS.map((c) => [c.field, Boolean(checklist[c.key])])),
        ...ethDateFields(editingReview.review_ethiopian_date),
      });
    } else {
      form.setFieldsValue({ ...NEW_REVIEW_DEFAULTS, fiscal_year: fiscalYear, review_code: nextCode, ...ethDateFields(null) });
    }
  }, [isOpen, editingReview, form, fiscalYear, nextCode]);

  const projectOptions = projects.map((p) => ({ value: p.id, label: `${p.project_name} (${p.project_code})` }));
  if (editingReview?.project_id && !projects.some((p) => p.id === editingReview.project_id)) {
    projectOptions.unshift({ value: editingReview.project_id, label: `${editingReview.scheme_name} (${editingReview.project_code})` });
  }

  const selectedProject = projects.find((p) => p.id === projectId);
  const linked = selectedProject
    ? { code: selectedProject.project_code, source: selectedProject.study_modality, zone: selectedProject.zone, woreda: selectedProject.woreda, kebele: selectedProject.kebele }
    : editingReview && editingReview.project_id === projectId
      ? { code: editingReview.project_code, source: editingReview.document_source, zone: editingReview.zone, woreda: editingReview.woreda, kebele: editingReview.kebele }
      : null;

  const handleProjectSelect = (id) => {
    const matched = projects.find((p) => p.id === id);
    if (!matched) return;
    form.setFieldsValue({
      submitting_entity: matched.study_modality?.includes('Consultant') ? (matched.consultant_name || 'Design Consultant') : 'Regional Design Team (In-House)',
      command_area_ha: matched.command_area_ha,
    });
  };

  const handleFinish = async (values) => {
    setSubmitting(true);
    try {
      const checklist = Object.fromEntries(DISCIPLINE_CHECKS.map((c) => [c.key, Boolean(values[c.field])]));
      DISCIPLINE_CHECKS.forEach((c) => delete values[c.field]);
      const payload = {
        ...values,
        disciplinary_checklist: checklist,
        scheme_name: selectedProject?.project_name || editingReview?.scheme_name || 'Scheme',
        project_code: linked?.code || editingReview?.project_code || 'PRJ',
        document_source: linked?.source || editingReview?.document_source || 'In-House Regional Engineering Team',
        zone: linked?.zone || editingReview?.zone,
        woreda: linked?.woreda || editingReview?.woreda,
        kebele: linked?.kebele || editingReview?.kebele,
      };
      const ok = await onSubmit(payload, form);
      if (ok) onCancel();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={(
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <AuditOutlined style={{ color: '#1a5f2c', fontSize: 18 }} />
          <span style={{ fontSize: 16, fontWeight: 'bold', color: '#1a5f2c' }}>
            {editingReview ? `Edit Design Review - ${editingReview.review_code}` : 'Log Design Document Review Session'}
          </span>
        </div>
      )}
      open={isOpen}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText={editingReview ? 'Save Changes' : 'Log Review Session'}
      confirmLoading={submitting}
      width={780}
      okButtonProps={{ style: { backgroundColor: '#1a5f2c', borderColor: '#1a5f2c' } }}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={handleFinish} style={{ marginTop: 12 }}>
        <div style={sectionStyle}>1. LINKED STUDY & DESIGN PROJECT</div>
        <Row gutter={12}>
          <Col xs={24} md={16}>
            <Form.Item name="project_id" label="Parent Study Project" rules={[{ required: true, message: 'Please select a study project' }]}>
              <Select placeholder="Select parent study project" options={projectOptions} onChange={handleProjectSelect} showSearch optionFilterProp="label" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="review_code" label="Review Code" rules={[{ required: true, message: 'Review code required' }]}>
              <Input placeholder="e.g. REV-2018-001" />
            </Form.Item>
          </Col>
        </Row>

        {linked && (
          <div style={{ background: '#f4fbf6', border: '1px solid #b7eb8f', borderRadius: 6, padding: '8px 12px', marginBottom: 12, fontSize: 12 }}>
            <Space split={<span style={{ color: '#d9d9d9' }}>|</span>} wrap>
              <span><strong>Code:</strong> {linked.code}</span>
              <span><strong>Source:</strong> <Tag color="green">{linked.source?.split('(')[0]}</Tag></span>
              <span><strong>Location:</strong> {[extractName(linked.zone), extractName(linked.woreda), extractName(linked.kebele)].filter(Boolean).join(' > ')}</span>
            </Space>
          </div>
        )}

        <div style={sectionStyle}>2. DOCUMENT & REVIEW GATE ATTRIBUTES</div>
        <Row gutter={12}>
          <Col xs={24} md={12}>
            <Form.Item name="review_milestone" label="Review Milestone Gate" rules={[{ required: true }]}>
              <Select options={REVIEW_MILESTONES.map((m) => ({ value: m, label: m }))} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="document_volume" label="Document Volume / Discipline Report" rules={[{ required: true }]}>
              <Select options={DOCUMENT_VOLUMES.map((v) => ({ value: v, label: v }))} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="submitting_entity" label="Submitting Entity (Consultant / Internal Directorate)" rules={[{ required: true }]}>
              <Input placeholder="e.g. Amhara Water Works Design Enterprise (AWWDE)" />
            </Form.Item>
          </Col>
          <Col xs={12} md={6}>
            <Form.Item name="submission_version" label="Version" rules={[{ required: true }]}>
              <Input placeholder="e.g. Draft Final (v1.0)" />
            </Form.Item>
          </Col>
          <Col xs={12} md={6}>
            <Form.Item name="command_area_ha" label="Command Area (Ha)" rules={[{ required: true }]}>
              <InputNumber style={{ width: '100%' }} min={0.1} />
            </Form.Item>
          </Col>
        </Row>

        <div style={sectionStyle}>3. REVIEW TIMELINE & EVALUATION TEAM</div>
        <Row gutter={12}>
          <Col xs={24} md={14}>
            <EthDateFields form={form} label="Review Session Date" />
          </Col>
          <Col xs={12} md={5}>
            <Form.Item name="fiscal_year" label="Fiscal Year" rules={[{ required: true }]}>
              <Select options={ETHIOPIAN_FISCAL_YEARS.map((y) => ({ value: y, label: y }))} />
            </Form.Item>
          </Col>
          <Col xs={12} md={5}>
            <Form.Item name="overall_technical_score" label="Score (0-100%)" rules={[{ required: true }]}>
              <InputNumber min={0} max={100} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={24} md={16}>
            <Form.Item name="lead_reviewer" label="Lead Technical Reviewer (Chair of QA Committee)" rules={[{ required: true }]}>
              <Input placeholder="e.g. Eng. Yohannes Getachew (Senior Hydraulic Specialist)" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="review_team_size" label="Review Committee Size" rules={[{ required: true }]}>
              <InputNumber min={1} max={15} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <div style={sectionStyle}>4. MULTI-DISCIPLINARY TECHNICAL VERIFICATION CHECKLIST</div>
        <div style={{ background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: 6, padding: '10px 14px', marginBottom: 12 }}>
          <Row gutter={[12, 8]}>
            {DISCIPLINE_CHECKS.map((c) => (
              <Col xs={24} sm={12} key={c.field}>
                <Form.Item name={c.field} valuePropName="checked" noStyle>
                  <Checkbox style={{ fontSize: 13 }}>{c.label}</Checkbox>
                </Form.Item>
              </Col>
            ))}
          </Row>
        </div>

        <div style={sectionStyle}>5. KEY TECHNICAL FINDINGS & REQUIRED REVISIONS</div>
        <Form.Item name="technical_remarks">
          <TextArea rows={3} placeholder="Record major engineering findings, BoQ discrepancies, foundation concerns..." />
        </Form.Item>
      </Form>
    </Modal>
  );
}
