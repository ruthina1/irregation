import { useEffect, useState } from 'react';
import { AutoComplete, Col, Divider, Form, Input, InputNumber, Modal, Row, Select } from 'antd';
import { ReadOutlined } from '@ant-design/icons';
import ComputedTotal from '../../shared/components/ComputedTotal';
import EthDateFields from '../../shared/components/EthDateFields';
import { ETHIOPIAN_FISCAL_YEARS } from '../../shared/constants';
import { ethDateFields, extractName } from '../../shared/utils';
import {
  NEW_TRAINING_DEFAULTS, SPONSORING_PROGRAMS, TARGET_AUDIENCE_TIERS, TRAINING_DISCIPLINES,
} from './ProfessionalCapacityBuildingManagement';

const { TextArea } = Input;
const sectionStyle = { margin: '6px 0 10px', fontSize: 12, color: '#1a5f2c', fontWeight: 600 };
const toOptions = (list) => list.map((v) => ({ value: v, label: v }));
const matchOption = (input, option) => (option?.value || '').toLowerCase().includes(input.toLowerCase());

/** Register / edit a professional capacity-building course. */
export default function ProfessionalCapacityBuildingForm({ open, editingTraining, fiscalYear, nextCode, locations = {}, onCancel, onSubmit }) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const selectedZone = Form.useWatch('zone', form);

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    if (editingTraining) {
      form.setFieldsValue({
        ...editingTraining,
        zone: extractName(editingTraining.zone, undefined),
        woreda: extractName(editingTraining.woreda, undefined),
        ...ethDateFields(editingTraining.ethiopian_date),
      });
    } else {
      form.setFieldsValue({ ...NEW_TRAINING_DEFAULTS, fiscal_year: fiscalYear, training_code: nextCode, ...ethDateFields(null) });
    }
  }, [open, editingTraining, form, fiscalYear, nextCode]);

  const handleFinish = async (values) => {
    setSubmitting(true);
    const saved = await onSubmit(values, form);
    setSubmitting(false);
    if (saved) onCancel();
  };

  const woredaOptions = toOptions(locations?.[selectedZone] || []);

  return (
    <Modal
      title={(
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ReadOutlined style={{ color: '#1a5f2c', fontSize: 18 }} />
          <span style={{ fontSize: 15, fontWeight: 700, color: '#1a5f2c' }}>
            {editingTraining ? 'Edit Professional Training Record' : 'Register New Professional Capacity Building Course'}
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
      forceRender
    >
      <Form form={form} layout="vertical" size="middle" onFinish={handleFinish}>
        <Divider titlePlacement="start" style={{ ...sectionStyle, margin: '0 0 10px' }}>
          1. Course Identification & Curriculum Focus
        </Divider>
        <Row gutter={10}>
          <Col span={6}>
            <Form.Item name="training_code" label="Course Code" rules={[{ required: true, message: 'Code required' }]}>
              <Input placeholder="e.g. TRN-2019-01" style={{ fontFamily: 'monospace' }} />
            </Form.Item>
          </Col>
          <Col span={18}>
            <Form.Item name="course_title" label="Course Title" rules={[{ required: true, message: 'Title required' }]}>
              <Input placeholder="e.g. Advanced HEC-RAS Hydraulic Modeling & Flood Analysis" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={10}>
          <Col span={14}>
            <Form.Item name="discipline" label="Engineering Discipline Focus" rules={[{ required: true }]}>
              <Select placeholder="Select Discipline" options={toOptions(TRAINING_DISCIPLINES)} />
            </Form.Item>
          </Col>
          <Col span={10}>
            <Form.Item name="target_tier" label="Target Trainee Institution Level" rules={[{ required: true }]}>
              <Select placeholder="Select Tier" options={toOptions(TARGET_AUDIENCE_TIERS)} />
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="start" style={sectionStyle}>2. Host Location, Duration & Program Sponsorship</Divider>
        <Row gutter={10}>
          <Col span={8}>
            <Form.Item name="zone" label="Training Zone" rules={[{ required: true, message: 'Zone required' }]}>
              <AutoComplete
                placeholder="Select or type zone"
                allowClear
                options={toOptions(Object.keys(locations))}
                filterOption={matchOption}
                onChange={() => form.setFieldsValue({ woreda: undefined })}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="woreda" label="Training Woreda / City">
              <AutoComplete placeholder="Select or type woreda" allowClear options={woredaOptions} filterOption={matchOption} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="fiscal_year" label="Fiscal Year (E.C.)" rules={[{ required: true }]}>
              <Select placeholder="Fiscal Year" options={toOptions(ETHIOPIAN_FISCAL_YEARS)} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={10}>
          <Col span={10}>
            <Form.Item name="training_venue" label="Training Facility / Venue" rules={[{ required: true }]}>
              <Input placeholder="e.g. ARARI Computer Lab, Bahir Dar" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="sponsoring_program" label="Sponsoring Program" rules={[{ required: true }]}>
              <Select placeholder="Select Program" options={toOptions(SPONSORING_PROGRAMS)} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="training_duration_days" label="Duration (Days)" rules={[{ required: true }]}>
              <InputNumber min={1} max={365} style={{ width: '100%' }} suffix="Days" />
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="start" style={sectionStyle}>3. Trainee Capacity (Gender Disaggregated Counts)</Divider>
        <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 12 }}>
          <Row gutter={10} align="middle">
            <Col span={8}>
              <Form.Item name="male_participants" label="Male Technical Experts" rules={[{ required: true }]} style={{ marginBottom: 0 }}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="female_participants" label="Female Technical Experts" rules={[{ required: true }]} style={{ marginBottom: 0 }}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <ComputedTotal fields={['male_participants', 'female_participants']} label="Total Trained Experts" suffix="Experts" />
            </Col>
          </Row>
        </div>
        <Row gutter={10}>
          <Col span={10}>
            <Form.Item name="lead_trainer" label="Lead Trainer / Senior Specialist" rules={[{ required: true }]}>
              <Input placeholder="e.g. Dr. Getachew Tefera" />
            </Form.Item>
          </Col>
          <Col span={14}>
            <EthDateFields label="Course Start Date (Ethiopian Calendar)" />
          </Col>
        </Row>
        <Form.Item name="course_objectives" label="Technical Learning Objectives & Outcomes" style={{ marginBottom: 0 }}>
          <TextArea rows={2} placeholder="Summarize core engineering competencies, practical software used, and post-training evaluation criteria..." />
        </Form.Item>
      </Form>
    </Modal>
  );
}
