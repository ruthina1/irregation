import React, { useEffect, useState } from 'react';
import { Alert, AutoComplete, Button, Checkbox, Col, Divider, Form, Input, InputNumber, Modal, Row, Select, Space, Spin, Tag } from 'antd';
import { AuditOutlined, ExperimentOutlined, FileDoneOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import EthDateFields from '../../shared/components/EthDateFields';
import { ETHIOPIAN_FISCAL_YEARS } from '../../shared/constants';
import { ethDateFields, extractName, toNumber } from '../../shared/utils';
import useLocationLookup from '../../shared/hooks/useLocationLookup';
import { STUDY_MODALITIES, STUDY_STAGES, QA_STATUSES, QA_PASSED, REVIEW_STATUSES, WATER_SOURCES, NEW_STUDY_DEFAULTS } from './IrrigationStudyDesignManagement';









const sectionStyle = { margin: '6px 0 10px', fontSize: 12, color: '#1a5f2c', fontWeight: 600 };
const toOptions = (list) => list.map((item) => {
  const name = extractName(item, '');
  return { key: item.id ?? item._id ?? name, value: name, label: name };
});
const filterOption = (input, option) => (option?.value || '').toLowerCase().includes(input.toLowerCase());

/** Register / edit an irrigation study & design project. */
function StudyFormModal({ open, editingProject, prefill, fiscalYear, onCancel, onSubmit }) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const locations = useLocationLookup();
  const { loadWoredas, loadKebeles } = locations;

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    if (editingProject) {
      form.setFieldsValue({
        ...editingProject,
        zone: extractName(editingProject.zone, undefined),
        woreda: extractName(editingProject.woreda, undefined),
        kebele: extractName(editingProject.kebele, undefined),
        fiscal_year: editingProject.fiscal_year || fiscalYear,
        is_construction_ready: Boolean(editingProject.is_construction_ready),
      });
    } else {
      form.setFieldsValue({ ...NEW_STUDY_DEFAULTS, fiscal_year: fiscalYear, ...(prefill || {}) });
    }
  }, [open, editingProject, prefill, form, fiscalYear]);

  // Load the woreda / kebele lists of the record being edited (async, once the zones are known).
  const zoneCount = locations.zones.length;
  useEffect(() => {
    if (!open || !zoneCount) return;
    const source = editingProject || prefill;
    if (!source?.zone) return;
    loadWoredas(extractName(source.zone, '')).then((list) => loadKebeles(extractName(source.woreda, ''), list));
  }, [open, zoneCount, editingProject, prefill, loadWoredas, loadKebeles]);

  const handleZoneSelect = (zone) => {
    form.setFieldsValue({ woreda: undefined, kebele: undefined });
    loadWoredas(zone);
  };

  const handleWoredaSelect = (woreda) => {
    form.setFieldsValue({ kebele: undefined });
    loadKebeles(woreda);
  };

  const handleFinish = async (values) => {
    setSubmitting(true);
    const saved = await onSubmit({ ...values, ...locations.idsFor(values) }, form);
    setSubmitting(false);
    if (saved) onCancel();
  };

  return (
    <Modal
      title={(
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileDoneOutlined style={{ color: '#1a5f2c', fontSize: 18 }} />
          <span style={{ fontSize: 15, fontWeight: 700, color: '#1a5f2c' }}>
            {editingProject ? 'Edit Irrigation Study & Design' : 'Register Irrigation Study & Design Project'}
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
          1. Administrative Station & Study Modality
        </Divider>

        {locations.error && (
          <Alert
            type="warning"
            showIcon
            style={{ marginBottom: 10 }}
            message="Location lookup unavailable — type the zone, woreda and kebele names."
            description={locations.error}
          />
        )}

        <Spin spinning={locations.loading}>
          <Row gutter={10}>
            <Col span={8}>
              <Form.Item name="zone" label="Zone" rules={[{ required: true, message: 'Zone required' }]}>
                <AutoComplete
                  placeholder="Select Zone"
                  options={toOptions(locations.zones)}
                  filterOption={filterOption}
                  onSelect={handleZoneSelect}
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="woreda" label="Woreda" rules={[{ required: true, message: 'Woreda required' }]}>
                <AutoComplete
                  placeholder="Select Woreda"
                  options={toOptions(locations.woredas)}
                  filterOption={filterOption}
                  onSelect={handleWoredaSelect}
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="kebele" label="Kebele" rules={[{ required: true, message: 'Kebele required' }]}>
                <AutoComplete
                  placeholder="Select Kebele"
                  options={toOptions(locations.kebeles)}
                  filterOption={filterOption}
                  allowClear
                />
              </Form.Item>
            </Col>
          </Row>
        </Spin>

        <Row gutter={10}>
          <Col span={8}>
            <Form.Item name="fiscal_year" label="Fiscal Year (E.C.)" rules={[{ required: true }]}>
              <Select placeholder="Fiscal Year" options={ETHIOPIAN_FISCAL_YEARS.map((fy) => ({ value: fy, label: fy }))} />
            </Form.Item>
          </Col>
          <Col span={16}>
            <Form.Item name="study_modality" label="Study Modality" rules={[{ required: true }]}>
              <Select placeholder="Select Study Entity" options={STUDY_MODALITIES} />
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="start" style={sectionStyle}>2. Scheme Identification & Technical Stage</Divider>
        <Row gutter={10}>
          <Col span={6}>
            <Form.Item name="project_code" label="Project Code" rules={[{ required: true, message: 'Code required' }]}>
              <Input placeholder="e.g. IRR-STD-01" style={{ fontFamily: 'monospace' }} />
            </Form.Item>
          </Col>
          <Col span={10}>
            <Form.Item name="project_name" label="Irrigation Scheme Name" rules={[{ required: true, message: 'Name required' }]}>
              <Input placeholder="e.g. Birr River Diversion Scheme" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="water_source" label="Water Source Technology" rules={[{ required: true }]}>
              <Select placeholder="Select Water Source" popupMatchSelectWidth={false} options={WATER_SOURCES.map((ws) => ({ value: ws, label: ws }))} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={10}>
          <Col span={10}>
            <Form.Item name="study_stage" label="Current Engineering Stage" rules={[{ required: true }]}>
              <Select placeholder="Select Stage" options={STUDY_STAGES.map((s) => ({ value: s, label: s }))} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="lead_consultant_or_office" label="Lead Consultant / Office" rules={[{ required: true }]}>
              <Input placeholder="e.g. Tropics Consulting / Regional Bureau" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="study_cost_etb" label="Study Budget (ETB)">
              <InputNumber min={0} style={{ width: '100%' }} placeholder="ETB" />
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="start" style={sectionStyle}>3. Irrigable Command Area & Target Beneficiaries</Divider>
        <Row gutter={10}>
          <Col span={8}>
            <Form.Item name="command_area_hectares" label="Command Area (Hectares)" rules={[{ required: true }]}>
              <InputNumber min={0} style={{ width: '100%' }} suffix="Ha" placeholder="0.00" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="beneficiaries_male" label="Male Farmers" rules={[{ required: true }]}>
              <InputNumber min={0} precision={0} style={{ width: '100%' }} placeholder="0" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="beneficiaries_female" label="Female Farmers" rules={[{ required: true }]}>
              <InputNumber min={0} precision={0} style={{ width: '100%' }} placeholder="0" />
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="start" style={sectionStyle}>4. Capacity Building (Technical Experts Trained During Study)</Divider>
        <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 6 }}>
          <Row gutter={10} align="middle">
            <Col span={8}>
              <Form.Item name="experts_trained_male" label="Male Experts Trained" rules={[{ required: true }]} style={{ marginBottom: 0 }}>
                <InputNumber min={0} precision={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="experts_trained_female" label="Female Experts Trained" rules={[{ required: true }]} style={{ marginBottom: 0 }}>
                <InputNumber min={0} precision={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="is_construction_ready" label="Construction Readiness" rules={[{ required: true }]} style={{ marginBottom: 0 }}>
                <Select
                  options={[
                    { value: true, label: 'Ready for Construction' },
                    { value: false, label: 'Design Under Progress' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
        </div>
      </Form>
    </Modal>
  );
}









const { TextArea } = Input;

/** Technical document review & QA certification of a study (review-qa workflow action). */
function ReviewQaModal({ project, onCancel, onSubmit }) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const qaStatus = Form.useWatch('qa_status', form);
  const ready = Form.useWatch('is_construction_ready', form);

  useEffect(() => {
    if (!project) return;
    form.resetFields();
    form.setFieldsValue({
      review_status: project.review_status,
      qa_status: project.qa_status,
      is_construction_ready: Boolean(project.is_construction_ready),
      reviewer_expert: project.reviewed_by || undefined,
      review_notes: project.review_notes,
      ...ethDateFields(project.review_ethiopian_date),
    });
  }, [project, form]);

  const handleFinish = async (values) => {
    setSubmitting(true);
    const saved = await onSubmit(project, values, form);
    setSubmitting(false);
    if (saved) onCancel();
  };

  return (
    <Modal
      title={(
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SafetyCertificateOutlined style={{ color: '#1a5f2c', fontSize: 18 }} />
          <span style={{ fontSize: 15, fontWeight: 700, color: '#1a5f2c' }}>Technical Document Review & QA Certification</span>
        </div>
      )}
      open={Boolean(project)}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={submitting}
      width={560}
      destroyOnHidden
    >
      {project && (
        <Form form={form} layout="vertical" onFinish={handleFinish} style={{ marginTop: 12 }}>
          <div style={{ background: '#f6ffed', border: '1px solid #d1d5db', padding: '10px 14px', borderRadius: 8, marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span>Scheme: <strong style={{ color: '#1a5f2c' }}>{project.project_name}</strong></span>
              <span>Command: <strong>{toNumber(project.command_area_hectares).toLocaleString()} Ha</strong></span>
            </div>
            <div style={{ fontSize: 11, color: '#595959', marginTop: 4 }}>
              Modality: <strong style={{ color: '#5b8a6b' }}>{project.study_modality}</strong> | Stage: {project.study_stage}
            </div>
            <div style={{ fontSize: 11, color: '#595959', marginTop: 4 }}>
              Latest design review:{' '}
              {project.latest_review_code ? (
                <strong style={{ color: project.review_cleared ? '#2f7d4a' : '#a16207' }}>
                  {project.latest_review_code} — {project.latest_review_verdict}
                  {project.latest_review_score !== null && project.latest_review_score !== undefined ? ` (${project.latest_review_score}/100)` : ''}
                </strong>
              ) : (
                <span>None logged yet</span>
              )}
            </div>
          </div>

          <Row gutter={10}>
            <Col span={12}>
              <Form.Item name="review_status" label="Document Review Status" rules={[{ required: true, message: 'Review status required' }]}>
                <Select placeholder="Select Review Status" options={REVIEW_STATUSES.map((rs) => ({ value: rs, label: rs }))} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="qa_status" label="Quality Assurance (QA) Audit" rules={[{ required: true, message: 'QA status required' }]}>
                <Select placeholder="Select QA Status" popupMatchSelectWidth={false} options={QA_STATUSES.map((qa) => ({ value: qa, label: qa }))} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="is_construction_ready" label="Approve as Construction-Ready?" rules={[{ required: true }]}>
            <Select
              options={[
                { value: true, label: 'Yes - Construction Ready (Final Approval)' },
                { value: false, label: 'No - Requires Corrections / Remaining Stages' },
              ]}
            />
          </Form.Item>
          {ready && qaStatus !== QA_PASSED && (
            <Alert
              type="warning"
              showIcon
              style={{ marginTop: -8, marginBottom: 12 }}
              message="A design can only be marked construction-ready after it is Quality Assured (Certified Passed)."
            />
          )}

          <Form.Item name="reviewer_expert" label="Evaluating Senior Engineer / QA Auditor" rules={[{ required: true, message: 'Expert name required' }]}>
            <Input placeholder="e.g. Eng. Solomon Tadesse (Irrigation Lead)" />
          </Form.Item>

          <EthDateFields label="Review Evaluation Date (Ethiopian Calendar)" />

          <Form.Item name="review_notes" label="Technical Review Notes & QA Findings">
            <TextArea rows={3} placeholder="Detail findings on hydraulic calculations, structural stability, soil classification, or environmental safeguards..." />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
}


export { ReviewQaModal };

export default function IrrigationStudyDesignForm({
  open, editingProject, locations, fiscalYear, nextCode, onCancel, onSubmit,
  reviewProject, onCancelReview, onSubmitReview,
}) {
  return (
    <>
      <StudyFormModal
        open={open}
        editingProject={editingProject}
        locations={locations}
        fiscalYear={fiscalYear}
        nextCode={nextCode}
        onCancel={onCancel}
        onSubmit={onSubmit}
      />
      {reviewProject && (
        <ReviewQaModal
          project={reviewProject}
          onCancel={onCancelReview}
          onSubmit={onSubmitReview}
        />
      )}
    </>
  );
}
