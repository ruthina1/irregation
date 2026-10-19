import { useEffect, useState } from 'react';
import { App, AutoComplete, Col, Divider, Form, Input, InputNumber, Modal, Row, Select } from 'antd';
import { AreaChartOutlined } from '@ant-design/icons';
import ComputedTotal from '../../shared/components/ComputedTotal';
import EthDateFields from '../../shared/components/EthDateFields';
import { ETHIOPIAN_FISCAL_YEARS } from '../../shared/constants';
import { ethDateFields, extractName } from '../../shared/utils';
import { CROPPING_ROUNDS, EXPANSION_METHODS, NEW_RECORD_DEFAULTS, SCHEME_LAND_MODALITIES } from './IrrigatedLandUtilizationManagement';

const { TextArea } = Input;
const sectionStyle = { margin: '6px 0 10px', fontSize: 12, color: '#1a5f2c', fontWeight: 600 };

/** Fields of a utilization record that the form edits. */
const EDITABLE_FIELDS = [
  'utilization_code', 'scheme_code', 'scheme_name', 'wua_name', 'cropping_round', 'fiscal_year', 'land_modality',
  'expansion_method', 'planned_command_ha', 'actual_irrigated_ha', 'expansion_area_ha', 'farmers_male',
  'farmers_female', 'dominant_crops', 'verifying_expert', 'field_observations',
];

/** Log / edit a seasonal irrigated land utilization & expansion record. */
export default function UtilizationFormModal({ open, editingRecord, schemes, fiscalYear, nextCode, findScheme, onCancel, onSubmit }) {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    if (editingRecord) {
      const values = Object.fromEntries(EDITABLE_FIELDS.map((f) => [f, editingRecord[f]]));
      form.setFieldsValue({
        ...values,
        zone: extractName(editingRecord.zone, null),
        woreda: extractName(editingRecord.woreda, null),
        kebele: extractName(editingRecord.kebele, null),
        ...ethDateFields(editingRecord.reporting_ethiopian_date),
      });
    } else {
      form.setFieldsValue({ ...NEW_RECORD_DEFAULTS, fiscal_year: fiscalYear, utilization_code: nextCode, ...ethDateFields(null) });
    }
  }, [open, editingRecord, form, fiscalYear, nextCode]);

  // Smart AutoComplete: pre-fill scheme attributes from the construction registry.
  const handleSchemeChange = (value) => {
    const matched = findScheme(value);
    if (!matched) return;
    form.setFieldsValue({
      scheme_code: matched.project_code || matched.contract_code,
      wua_name: matched.wua_name || `${matched.scheme_name} WUA`,
      planned_command_ha: matched.command_area_ha,
      actual_irrigated_ha: matched.command_area_ha,
      farmers_male: matched.beneficiaries_male,
      farmers_female: matched.beneficiaries_female,
      zone: extractName(matched.zone, null),
      woreda: extractName(matched.woreda, null),
      kebele: extractName(matched.kebele, null),
    });
    message.info(`Auto-filled scheme attributes for "${matched.scheme_name}"`);
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
          <AreaChartOutlined style={{ color: '#1a5f2c', fontSize: 18 }} />
          <span style={{ fontSize: 15, fontWeight: 700, color: '#1a5f2c' }}>
            {editingRecord ? 'Edit Irrigated Land Utilization Record' : 'Log Seasonal Irrigated Land Utilization & Expansion'}
          </span>
        </div>
      )}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={submitting}
      width={740}
      style={{ top: 24 }}
      styles={{ body: { padding: '16px 20px', maxHeight: '80vh', overflowY: 'auto' } }}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" size="middle" onFinish={handleFinish}>
        <Divider titlePlacement="start" style={{ ...sectionStyle, margin: '0 0 10px' }}>
          1. Irrigation Scheme & Operating WUA Linkage
        </Divider>
        <Row gutter={10}>
          <Col span={16}>
            <Form.Item
              name="scheme_name"
              label="Irrigation Scheme Name (Select Registered Scheme or Type)"
              rules={[{ required: true, message: 'Scheme name required' }]}
            >
              <AutoComplete
                placeholder="Select scheme to auto-fill details..."
                onChange={handleSchemeChange}
                allowClear
                filterOption={(input, option) => (option?.value || '').toLowerCase().includes(input.toLowerCase())}
                options={[{
                  label: 'Active Registered Schemes',
                  options: schemes.map((s) => ({
                    key: s.id,
                    value: s.scheme_name,
                    label: `${s.scheme_name} — ${s.command_area_ha} Ha${s.wua_name ? ` (${s.wua_name})` : ''}`,
                  })),
                }]}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="utilization_code" label="Utilization Log Code" rules={[{ required: true }]}>
              <Input placeholder="e.g. UTL-2019-01" style={{ fontFamily: 'monospace' }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={10}>
          <Col span={8}>
            <Form.Item name="scheme_code" label="Scheme Reference Code" rules={[{ required: true }]}>
              <Input placeholder="e.g. IRR-STD-2019-01" style={{ fontFamily: 'monospace' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="cropping_round" label="Cropping Season / Round (Excel Indicator)" rules={[{ required: true }]}>
              <Select placeholder="Select Round" options={CROPPING_ROUNDS.map((r) => ({ value: r.value, label: r.label }))} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="fiscal_year" label="Fiscal Year (E.C.)" rules={[{ required: true }]}>
              <Select placeholder="Fiscal Year" options={ETHIOPIAN_FISCAL_YEARS.map((fy) => ({ value: fy, label: fy }))} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="wua_name" label="Responsible Water Users Association (WUA)" rules={[{ required: true }]}>
          <Input placeholder="e.g. Birr River Primary Water Users Cooperative" />
        </Form.Item>

        {/* Auto-populated location */}
        <Form.Item name="zone" hidden><Input /></Form.Item>
        <Form.Item name="woreda" hidden><Input /></Form.Item>
        <Form.Item name="kebele" hidden><Input /></Form.Item>

        <Divider titlePlacement="start" style={sectionStyle}>
          2. Land Modality (በነባር / በአዲስ) & Expansion Method (በዘመናዊ / በባህላዊ)
        </Divider>
        <Row gutter={10}>
          <Col span={12}>
            <Form.Item name="land_modality" label="Scheme Land Modality (Excel Indicator)" rules={[{ required: true }]}>
              <Select placeholder="Select Modality" options={SCHEME_LAND_MODALITIES.map((m) => ({ value: m.value, label: m.label }))} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="expansion_method" label="Command Area Expansion Network (Excel Indicator)" rules={[{ required: true }]}>
              <Select placeholder="Select Expansion Network" options={EXPANSION_METHODS.map((e) => ({ value: e.value, label: e.label }))} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={10}>
          <Col span={8}>
            <Form.Item name="planned_command_ha" label="Planned Command Area (Ha)" rules={[{ required: true }]}>
              <InputNumber min={0} style={{ width: '100%' }} suffix="Ha" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="actual_irrigated_ha" label="Actual Irrigated Land (Ha)" rules={[{ required: true }]}>
              <InputNumber min={0} style={{ width: '100%' }} suffix="Ha" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="expansion_area_ha" label="Expansion Network Area (Ha)">
              <InputNumber min={0} style={{ width: '100%' }} suffix="Ha" />
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="start" style={sectionStyle}>3. Beneficiary Farmers (ተጠቃሚ አ/አደር — ወንድ / ሴት / ድምር)</Divider>
        <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 12 }}>
          <Row gutter={10} align="middle">
            <Col span={8}>
              <Form.Item name="farmers_male" label="Male Farmers (ወንድ)" rules={[{ required: true }]} style={{ marginBottom: 0 }}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="farmers_female" label="Female Farmers (ሴት)" rules={[{ required: true }]} style={{ marginBottom: 0 }}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <ComputedTotal fields={['farmers_male', 'farmers_female']} label="Total Farmers (ድምር)" suffix="Households" />
            </Col>
          </Row>
        </div>

        <Form.Item name="dominant_crops" label="Dominant Crops Cultivated Under This Round" rules={[{ required: true }]}>
          <Input placeholder="e.g. Highland Wheat (የደጋ ስንዴ), Hybrid Maize, Red Onion, Tomato" maxLength={500} />
        </Form.Item>

        <Row gutter={10}>
          <Col span={10}>
            <Form.Item name="verifying_expert" label="Verifying Agronomist / Woreda Expert" rules={[{ required: true }]}>
              <Input placeholder="e.g. Ato Yohannes Belay" />
            </Form.Item>
          </Col>
          <Col span={14}>
            <EthDateFields label="Field Survey Date (Ethiopian Calendar)" />
          </Col>
        </Row>
        <Form.Item name="field_observations" label="Field Water Delivery & Crop Stand Remarks" style={{ marginBottom: 0 }}>
          <TextArea rows={2} placeholder="Detail streamflow discharge adequacy, tail-end water access, soil moisture retention..." />
        </Form.Item>
      </Form>
    </Modal>
  );
}
