import React, { useEffect, useState } from 'react';
import { Alert, AutoComplete, Button, Checkbox, Col, Divider, Form, Input, InputNumber, Modal, Row, Select, Space, Tag } from 'antd';
import { CheckSquareOutlined, CompassOutlined, SearchOutlined } from '@ant-design/icons';
import EthDateFields from '../../shared/components/EthDateFields';
import ComputedTotal from '../../shared/components/ComputedTotal';
import { ETHIOPIAN_FISCAL_YEARS } from '../../shared/constants';
import { ethDateFields, extractName, toNumber } from '../../shared/utils';
import {
  INITIATIVE_SOURCES,
  NEW_PIPELINE_DEFAULTS,
  PENDING_EXPERT,
  PIPELINE_APPROVED,
  PIPELINE_STATUSES,
  PRIORITY_LEVELS,
  WATER_SOURCES,
} from './ProjectIdentificationPipelineManagement';









const { TextArea } = Input;
const sectionStyle = { margin: '6px 0 10px', fontSize: 12, color: '#1a5f2c', fontWeight: 600 };
const toOptions = (values) => values.map((v) => ({ value: v, label: v }));
const filterOption = (input, option) => (option?.value || '').toLowerCase().includes(input.toLowerCase());

/** Log / edit an identified irrigation pipeline scheme. */
function PipelineFormModal({ open, editingProject, fiscalYear, locations, onCancel, onSubmit }) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const zoneId = Form.useWatch('zone_id', form);
  const woredaId = Form.useWatch('woreda_id', form);
  const { zones, woredasByZone, kebelesByWoreda, loadWoredas, loadKebeles } = locations;

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    if (editingProject) {
      form.setFieldsValue({
        ...editingProject,
        zone: extractName(editingProject.zone, undefined),
        woreda: extractName(editingProject.woreda, undefined),
        kebele: extractName(editingProject.kebele, undefined),
      });
      loadWoredas(editingProject.zone_id);
      loadKebeles(editingProject.woreda_id);
    } else {
      form.setFieldsValue({ ...NEW_PIPELINE_DEFAULTS, fiscal_year: fiscalYear });
    }
  }, [open, editingProject, form, fiscalYear, loadWoredas, loadKebeles]);

  const handleZoneChange = (value) => {
    const match = zones.find((z) => z.value === value);
    form.setFieldsValue({ zone_id: match?.id ?? null, woreda: undefined, woreda_id: null, kebele: undefined, kebele_id: null });
    if (match) loadWoredas(match.id);
  };

  const handleWoredaChange = (value) => {
    const match = (woredasByZone[zoneId] || []).find((w) => w.value === value);
    form.setFieldsValue({ woreda_id: match?.id ?? null, kebele: undefined, kebele_id: null });
    if (match) loadKebeles(match.id);
  };

  const handleKebeleChange = (value) => {
    const match = (kebelesByWoreda[woredaId] || []).find((k) => k.value === value);
    form.setFieldsValue({ kebele_id: match?.id ?? null });
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
          <CompassOutlined style={{ color: '#1a5f2c', fontSize: 18 }} />
          <span style={{ fontSize: 15, fontWeight: 700, color: '#1a5f2c' }}>
            {editingProject ? 'Edit Pipeline Project Identification' : 'Log New Irrigation Pipeline Scheme'}
          </span>
        </div>
      )}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={submitting}
      width={700}
      style={{ top: 24 }}
      styles={{ body: { padding: '16px 20px', maxHeight: '80vh', overflowY: 'auto' } }}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" size="middle" onFinish={handleFinish}>
        <Divider titlePlacement="start" style={{ ...sectionStyle, margin: '0 0 10px' }}>
          1. Administrative Station & Origin of Proposal
        </Divider>

        <Form.Item name="zone_id" hidden><Input /></Form.Item>
        <Form.Item name="woreda_id" hidden><Input /></Form.Item>
        <Form.Item name="kebele_id" hidden><Input /></Form.Item>

        <Row gutter={10}>
          <Col span={8}>
            <Form.Item name="zone" label="Zone" rules={[{ required: true, message: 'Zone required' }]}>
              <AutoComplete placeholder="Select or type Zone" options={zones} onChange={handleZoneChange} filterOption={filterOption} allowClear />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="woreda" label="Woreda" rules={[{ required: true, message: 'Woreda required' }]}>
              <AutoComplete
                placeholder="Select or type Woreda"
                options={woredasByZone[zoneId] || []}
                onChange={handleWoredaChange}
                filterOption={filterOption}
                allowClear
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="kebele" label="Kebele" rules={[{ required: true, message: 'Kebele required' }]}>
              <AutoComplete
                placeholder="Select or type Kebele"
                options={kebelesByWoreda[woredaId] || []}
                onChange={handleKebeleChange}
                filterOption={filterOption}
                allowClear
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={10}>
          <Col span={8}>
            <Form.Item name="fiscal_year" label="Fiscal Year (E.C.)" rules={[{ required: true }]}>
              <Select placeholder="Fiscal Year" options={toOptions(ETHIOPIAN_FISCAL_YEARS)} />
            </Form.Item>
          </Col>
          <Col span={16}>
            <Form.Item name="initiative_source" label="Source of Identification / Proposal" rules={[{ required: true }]}>
              <Select placeholder="Select Initiative Source" options={toOptions(INITIATIVE_SOURCES)} />
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="start" style={sectionStyle}>2. Proposed Scheme Details & Water Technology</Divider>
        <Row gutter={10}>
          <Col span={6}>
            <Form.Item name="pipeline_code" label="Pipeline Code" rules={[{ required: true, message: 'Code required' }]}>
              <Input placeholder="e.g. PLN-2019-01" style={{ fontFamily: 'monospace' }} />
            </Form.Item>
          </Col>
          <Col span={10}>
            <Form.Item name="scheme_name" label="Proposed Scheme Name" rules={[{ required: true, message: 'Name required' }]}>
              <Input placeholder="e.g. Zana River Diversion Site" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="water_source" label="Water Source Technology" rules={[{ required: true }]}>
              <Select placeholder="Select Source" options={toOptions(WATER_SOURCES)} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={10}>
          <Col span={8}>
            <Form.Item name="priority_level" label="Regional Priority Level" rules={[{ required: true }]}>
              <Select placeholder="Priority" options={toOptions(PRIORITY_LEVELS)} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="potential_area_ha" label="Estimated Command Area (Ha)" rules={[{ required: true }]}>
              <InputNumber min={0} style={{ width: '100%' }} suffix="Ha" placeholder="0.00" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="estimated_budget_etb" label="Estimated Implementation (ETB)">
              <InputNumber min={0} style={{ width: '100%' }} placeholder="ETB" />
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="start" style={sectionStyle}>3. Estimated Beneficiary Farmers</Divider>
        <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 12 }}>
          <Row gutter={10} align="middle">
            <Col span={8}>
              <Form.Item name="estimated_beneficiaries_male" label="Male Farmers" rules={[{ required: true }]} style={{ marginBottom: 0 }}>
                <InputNumber min={0} precision={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="estimated_beneficiaries_female" label="Female Farmers" rules={[{ required: true }]} style={{ marginBottom: 0 }}>
                <InputNumber min={0} precision={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <ComputedTotal
                fields={['estimated_beneficiaries_male', 'estimated_beneficiaries_female']}
                label="Total Beneficiaries"
                suffix="Households"
              />
            </Col>
          </Row>
        </div>

        <Form.Item name="site_notes" label="Initial Site Observations & Farmer Community Comments" style={{ marginBottom: 0 }}>
          <TextArea rows={2} placeholder="Describe water discharge observations, river bank stability, access road conditions..." />
        </Form.Item>
      </Form>
    </Modal>
  );
}









/** Field reconnaissance survey & feasibility screening (PATCH pipeline/{id}/screening). */
function ScreeningModal({ project, onCancel, onSubmit }) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const status = Form.useWatch('pipeline_status', form);
  const alreadyPromoted = Boolean(project?.promoted_study_id);

  useEffect(() => {
    if (!project) return;
    form.resetFields();
    form.setFieldsValue({
      pipeline_status: project.pipeline_status,
      promoted_to_study: Boolean(project.promoted_to_study),
      reconnaissance_expert: project.reconnaissance_expert !== PENDING_EXPERT ? project.reconnaissance_expert : undefined,
      site_notes: project.site_notes,
      ...ethDateFields(project.reconnaissance_ethiopian_date),
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
          <CompassOutlined style={{ color: '#1a5f2c', fontSize: 18 }} />
          <span style={{ fontSize: 15, fontWeight: 700, color: '#1a5f2c' }}>Field Reconnaissance Survey & Feasibility Screening</span>
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
              <span>Scheme: <strong style={{ color: '#1a5f2c' }}>{project.scheme_name}</strong></span>
              <span>Potential: <strong>{toNumber(project.potential_area_ha).toLocaleString()} Ha</strong></span>
            </div>
            <div style={{ fontSize: 11, color: '#595959', marginTop: 4 }}>
              Source: <strong style={{ color: '#5b8a6b' }}>{project.initiative_source}</strong> | Priority: {project.priority_level}
            </div>
          </div>

          {alreadyPromoted && (
            <Alert
              type="info"
              showIcon
              style={{ marginBottom: 12, fontSize: 12 }}
              message="Already promoted to a study & design project"
              description="The approval can no longer be withdrawn; you can still update the surveyor, date and remarks."
            />
          )}

          <Row gutter={10}>
            <Col span={14}>
              <Form.Item name="pipeline_status" label="Screening Feasibility Decision" rules={[{ required: true, message: 'Status required' }]}>
                <Select
                  placeholder="Select Status"
                  options={PIPELINE_STATUSES.map((s) => ({ value: s, label: s, disabled: alreadyPromoted && s !== PIPELINE_APPROVED }))}
                />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item
                name="promoted_to_study"
                label="Promote to Detailed Design?"
                rules={[{ required: true }]}
                extra={status !== PIPELINE_APPROVED ? 'Only approved schemes can be promoted.' : 'Promoting creates a study & design project.'}
              >
                <Select
                  disabled={alreadyPromoted || status !== PIPELINE_APPROVED}
                  options={[
                    { value: true, label: 'Yes - Advance to Study' },
                    { value: false, label: 'No - Keep in Pipeline' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="reconnaissance_expert"
            label="Field Reconnaissance Surveyor / Team Leader"
            rules={[{ required: true, message: 'Expert name required' }]}
          >
            <Input placeholder="e.g. Eng. Worku Mengesha (Water Resource Specialist)" />
          </Form.Item>

          <EthDateFields label="Survey Verification Date (Ethiopian Calendar)" />

          <Form.Item name="site_notes" label="Technical Reconnaissance Survey Remarks & Hydrological Verdict">
            <TextArea rows={3} placeholder="Record perennial stream yield, soil permeability, canal alignment feasibility, settlement safety, and environmental risks..." />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
}


export { ScreeningModal };

export default function ProjectIdentificationPipelineForm({
  open, editingProject, locations, fiscalYear, nextCode, onCancel, onSubmit,
  screeningProject, onCancelScreening, onSubmitScreening,
}) {
  return (
    <>
      <PipelineFormModal
        open={open}
        editingProject={editingProject}
        locations={locations}
        fiscalYear={fiscalYear}
        nextCode={nextCode}
        onCancel={onCancel}
        onSubmit={onSubmit}
      />
      {screeningProject && (
        <ScreeningModal
          project={screeningProject}
          onCancel={onCancelScreening}
          onSubmit={onSubmitScreening}
        />
      )}
    </>
  );
}
