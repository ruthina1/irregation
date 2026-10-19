import { useEffect, useState } from 'react';
import { App, Col, Divider, Form, Input, InputNumber, Modal, Row, Select } from 'antd';
import { ReadOutlined } from '@ant-design/icons';
import ComputedTotal from '../../shared/components/ComputedTotal';
import EthDateFields from '../../shared/components/EthDateFields';
import { ETHIOPIAN_FISCAL_YEARS } from '../../shared/constants';
import { ethDateFields, extractName } from '../../shared/utils';
import { COMMUNITY_TRAINING_MODULES, FACILITATOR_PROGRAMS, NEW_TRAINING_DEFAULTS, TARGET_AUDIENCE_GROUPS } from './AssociationCapacityBuildingManagement';

const { TextArea } = Input;
const sectionStyle = { margin: '6px 0 10px', fontSize: 12, color: '#1a5f2c', fontWeight: 600 };

/** Fields of a training record that the form edits. */
const EDITABLE_FIELDS = [
  'wua_id', 'training_code', 'fiscal_year', 'target_group', 'training_module', 'facilitator_channel',
  'training_venue', 'training_duration_days', 'exec_leaders_male', 'exec_leaders_female',
  'members_male', 'members_female', 'lead_facilitator', 'course_learning_outcomes',
];

/** Log / edit a WUA leadership & member training session (linked to a registered WUA). */
export default function TrainingFormModal({ open, editingTraining, wuas, fiscalYear, nextCode, onCancel, onSubmit }) {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const selectedWuaId = Form.useWatch('wua_id', form);
  const selectedWua = wuas.find((w) => w.id === selectedWuaId) || null;

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    if (editingTraining) {
      const values = Object.fromEntries(EDITABLE_FIELDS.map((f) => [f, editingTraining[f]]));
      form.setFieldsValue({ ...values, ...ethDateFields(editingTraining.ethiopian_date) });
    } else {
      form.setFieldsValue({ ...NEW_TRAINING_DEFAULTS, fiscal_year: fiscalYear, training_code: nextCode, ...ethDateFields(null) });
    }
  }, [open, editingTraining, form, fiscalYear, nextCode]);

  // Selecting a WUA pre-fills the leadership trainee counts from its executive committee.
  const handleWuaSelect = (wuaId) => {
    const matched = wuas.find((w) => w.id === wuaId);
    if (!matched) return;
    form.setFieldsValue({
      exec_leaders_male: matched.committee_male || 5,
      exec_leaders_female: matched.committee_female || 2,
    });
    message.info(`Linked WUA "${matched.wua_name}" & Scheme "${matched.scheme_name}"`);
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
          <ReadOutlined style={{ color: '#1a5f2c', fontSize: 18 }} />
          <span style={{ fontSize: 15, fontWeight: 700, color: '#1a5f2c' }}>
            {editingTraining ? 'Edit WUA Capacity Building Session' : 'Register WUA Leadership & Member Training Session'}
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
          1. Select Water Users Association (WUA)
        </Divider>
        <Row gutter={10}>
          <Col span={16}>
            <Form.Item
              name="wua_id"
              label="Water Users Association (Select Registered WUA)"
              rules={[{ required: true, message: 'Please select an association' }]}
            >
              <Select
                placeholder="Select WUA from Registry..."
                onChange={handleWuaSelect}
                showSearch
                optionFilterProp="label"
                notFoundContent="No registered WUAs — register one in the WUA Registry first"
                options={wuas.map((w) => ({ value: w.id, label: `${w.wua_name} (${w.wua_reg_code})` }))}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="training_code" label="Training Session Code" rules={[{ required: true }]}>
              <Input placeholder="e.g. TRN-WUA-2019-01" style={{ fontFamily: 'monospace' }} />
            </Form.Item>
          </Col>
        </Row>

        {selectedWua && (
          <div style={{ background: '#f6ffed', border: '1px solid #d1d5db', padding: '10px 14px', borderRadius: 8, marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span>Selected WUA: <strong style={{ color: '#1a5f2c' }}>{selectedWua.wua_name}</strong></span>
              <span>Reg Code: <strong>{selectedWua.wua_reg_code}</strong></span>
            </div>
            <div style={{ fontSize: 11, color: '#595959', marginTop: 4 }}>
              Linked Scheme: <strong style={{ color: '#5b8a6b' }}>{selectedWua.scheme_name}</strong> | Station: {extractName(selectedWua.woreda)}, {extractName(selectedWua.zone)} | Command: {selectedWua.command_area_ha} Ha
            </div>
          </div>
        )}

        <Row gutter={10}>
          <Col span={8}>
            <Form.Item name="fiscal_year" label="Fiscal Year (E.C.)" rules={[{ required: true }]}>
              <Select placeholder="Fiscal Year" options={ETHIOPIAN_FISCAL_YEARS.map((fy) => ({ value: fy, label: fy }))} />
            </Form.Item>
          </Col>
          <Col span={16}>
            <Form.Item name="target_group" label="Target Trainee Group (Excel Indicator)" rules={[{ required: true }]}>
              <Select placeholder="Select Target Group" options={TARGET_AUDIENCE_GROUPS.map((g) => ({ value: g.value, label: g.label.split('(')[0] }))} />
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="start" style={sectionStyle}>2. Curriculum Module & Facilitating Institution</Divider>
        <Form.Item name="training_module" label="Governance & Operation Curriculum Module" rules={[{ required: true }]}>
          <Select placeholder="Select Curriculum Module" options={COMMUNITY_TRAINING_MODULES.map((m) => ({ value: m, label: m }))} />
        </Form.Item>
        <Row gutter={10}>
          <Col span={14}>
            <Form.Item name="facilitator_channel" label="Facilitator Program / Institution (በባለሙያ)" rules={[{ required: true }]}>
              <Select placeholder="Select Facilitator Program" options={FACILITATOR_PROGRAMS.map((f) => ({ value: f, label: f.split('(')[0] }))} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="training_venue" label="Training Venue / FTC" rules={[{ required: true }]}>
              <Input placeholder="e.g. Kebele FTC Hall" />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item name="training_duration_days" label="Duration" rules={[{ required: true }]}>
              <InputNumber min={1} max={15} style={{ width: '100%' }} suffix="Days" />
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="start" style={sectionStyle}>3. Trainee Breakdown (Leadership vs. General Members Gender Split)</Divider>
        <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 12 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#1a5f2c', display: 'block', marginBottom: 6 }}>
            A. WUA Executive Committee Leadership Trainees (በማህበሩ አመራር):
          </span>
          <Row gutter={10} align="middle">
            <Col span={8}>
              <Form.Item name="exec_leaders_male" label="Male Executive Leaders" rules={[{ required: true }]} style={{ marginBottom: 0 }}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="exec_leaders_female" label="Female Executive Leaders" rules={[{ required: true }]} style={{ marginBottom: 0 }}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <ComputedTotal fields={['exec_leaders_male', 'exec_leaders_female']} label="Total Leaders" suffix="Leaders" />
            </Col>
          </Row>

          <Divider style={{ margin: '10px 0' }} />

          <span style={{ fontSize: 11, fontWeight: 600, color: '#5b8a6b', display: 'block', marginBottom: 6 }}>
            B. General Farmer Member Trainees (የተጠቃሚ አባላት):
          </span>
          <Row gutter={10} align="middle">
            <Col span={8}>
              <Form.Item name="members_male" label="Male Farmer Members" rules={[{ required: true }]} style={{ marginBottom: 0 }}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="members_female" label="Female Farmer Members" rules={[{ required: true }]} style={{ marginBottom: 0 }}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <ComputedTotal
                fields={['exec_leaders_male', 'exec_leaders_female', 'members_male', 'members_female']}
                label="Grand Total Trainees"
                suffix="Trainees"
              />
            </Col>
          </Row>
        </div>

        <Divider titlePlacement="start" style={sectionStyle}>4. Lead Facilitator & Course Date (E.C.)</Divider>
        <Row gutter={10}>
          <Col span={10}>
            <Form.Item name="lead_facilitator" label="Lead Facilitator / Expert" rules={[{ required: true }]}>
              <Input placeholder="e.g. Ato Mulugeta Desta (Woreda Expert)" />
            </Form.Item>
          </Col>
          <Col span={14}>
            <EthDateFields label="Course Start Date (Ethiopian Calendar)" />
          </Col>
        </Row>
        <Form.Item name="course_learning_outcomes" label="Course Learning Outcomes & Action Agreements" style={{ marginBottom: 0 }}>
          <TextArea rows={2} placeholder="Detail key agreements, water fee receipting adoption, seasonal water roster schedules..." />
        </Form.Item>
      </Form>
    </Modal>
  );
}
