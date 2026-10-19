import { useEffect, useState } from 'react';
import { App, AutoComplete, Col, Divider, Form, Input, InputNumber, Modal, Row, Select } from 'antd';
import { AreaChartOutlined } from '@ant-design/icons';
import ComputedTotal from '../../shared/components/ComputedTotal';
import EthDateFields from '../../shared/components/EthDateFields';
import { ethDateFields, extractName } from '../../shared/utils';
import { CROP_CATALOG_GROUPS, FUNDING_PROGRAMS, NEW_BENEFIT_DEFAULTS, SCHEME_TYPES, cropList } from './DevelopedLandBeneficiariesManagement';

const { TextArea } = Input;
const sectionStyle = { margin: '6px 0 10px', fontSize: 12, color: '#1a5f2c', fontWeight: 600 };

const CROP_OPTIONS = CROP_CATALOG_GROUPS.map((group) => ({
  label: group.category,
  options: group.crops.map((crop) => ({ value: crop, label: crop })),
}));

/** Log / edit a field-verified developed land & beneficiaries record. */
export default function BenefitFormModal({ open, editingRecord, contracts, fiscalYear, nextCode, findContract, onCancel, onSubmit }) {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    if (editingRecord) {
      form.setFieldsValue({
        ...editingRecord,
        primary_crops_cultivated: cropList(editingRecord.primary_crops_cultivated),
        zone: extractName(editingRecord.zone, null),
        woreda: extractName(editingRecord.woreda, null),
        kebele: extractName(editingRecord.kebele, null),
        fiscal_year: editingRecord.fiscal_year || fiscalYear,
        ...ethDateFields(editingRecord.verification_ethiopian_date),
      });
    } else {
      form.setFieldsValue({ ...NEW_BENEFIT_DEFAULTS, fiscal_year: fiscalYear, benefit_code: nextCode, ...ethDateFields(null) });
    }
  }, [open, editingRecord, form, fiscalYear, nextCode]);

  // Smart combobox: pre-fill the baseline command area and farmers from the contract.
  const handleSchemeChange = (value) => {
    const matched = findContract(value);
    if (!matched) return;
    form.setFieldsValue({
      contract_code: matched.contract_code,
      project_code: matched.project_code,
      scheme_type: matched.scheme_type,
      funding_source: matched.funding_source,
      planned_command_ha: matched.command_area_ha,
      beneficiaries_male: matched.beneficiaries_male,
      beneficiaries_female: matched.beneficiaries_female,
      zone: extractName(matched.zone, null),
      woreda: extractName(matched.woreda, null),
      kebele: extractName(matched.kebele, null),
    });
    message.info(`Auto-filled land & farmer parameters from contract ${matched.contract_code}`);
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
            {editingRecord ? 'Edit Command Area & Beneficiary Record' : 'Log Field Verified Developed Land & Beneficiaries'}
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
        <Divider titlePlacement="start" style={{ ...sectionStyle, margin: '0 0 10px' }}>1. Link with Construction Contract</Divider>
        <Row gutter={10}>
          <Col span={16}>
            <Form.Item
              name="scheme_name"
              label="Irrigation Scheme Name (Select Contract or Type Name)"
              rules={[{ required: true, message: 'Scheme name required' }]}
            >
              <AutoComplete
                placeholder="Select contract to auto-fill baseline command area..."
                onChange={handleSchemeChange}
                allowClear
                filterOption={(input, option) => (option?.value || '').toLowerCase().includes(input.toLowerCase())}
                options={[{
                  label: 'Active Construction Contracts',
                  options: contracts.map((c) => ({
                    key: c.id,
                    value: c.scheme_name,
                    label: `${c.scheme_name} (${c.contract_code}) — ${c.command_area_ha} Ha`,
                  })),
                }]}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="benefit_code" label="Benefit Survey Ref" rules={[{ required: true }]}>
              <Input placeholder="e.g. BNF-2019-01" style={{ fontFamily: 'monospace' }} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={10}>
          <Col span={8}>
            <Form.Item name="contract_code" label="Contract Code" rules={[{ required: true }]}>
              <Input placeholder="e.g. CNTR-2019-01" style={{ fontFamily: 'monospace' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="scheme_type" label="Scheme Classification" rules={[{ required: true }]}>
              <Select placeholder="Select Type" options={SCHEME_TYPES.map((t) => ({ value: t.value, label: t.label.split('(')[0] }))} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="funding_source" label="Financing Program" rules={[{ required: true }]}>
              <Select placeholder="Select Program" options={FUNDING_PROGRAMS.map((f) => ({ value: f, label: f.split('(')[0] }))} />
            </Form.Item>
          </Col>
        </Row>

        {/* Auto-populated attributes */}
        <Form.Item name="project_code" hidden><Input /></Form.Item>
        <Form.Item name="fiscal_year" hidden><Input /></Form.Item>
        <Form.Item name="zone" hidden><Input /></Form.Item>
        <Form.Item name="woreda" hidden><Input /></Form.Item>
        <Form.Item name="kebele" hidden><Input /></Form.Item>

        <Divider titlePlacement="start" style={sectionStyle}>2. Irrigable Command Area Verification (የሚለማ መሬት ስፋት በሄ/ር)</Divider>
        <Row gutter={10}>
          <Col span={8}>
            <Form.Item name="planned_command_ha" label="Planned Command Area (Ha)" rules={[{ required: true }]}>
              <InputNumber min={0} style={{ width: '100%' }} suffix="Ha" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="actual_developed_ha" label="Actual Developed Land (Ha)" rules={[{ required: true }]}>
              <InputNumber min={0} style={{ width: '100%' }} suffix="Ha" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="operational_cultivated_ha" label="Cultivated Under Irrigation (Ha)" rules={[{ required: true }]}>
              <InputNumber min={0} style={{ width: '100%' }} suffix="Ha" />
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="start" style={sectionStyle}>3. Direct Beneficiary Farmers Demographics (ተጠቃሚ አ/አደር — ወንድ / ሴት / ድምር)</Divider>
        <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 12 }}>
          <Row gutter={10} align="middle">
            <Col span={6}>
              <Form.Item name="beneficiaries_male" label="Male Farmers (ወንድ)" rules={[{ required: true }]} style={{ marginBottom: 0 }}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="beneficiaries_female" label="Female Farmers (ሴት)" rules={[{ required: true }]} style={{ marginBottom: 0 }}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="youth_beneficiaries_count" label="Youth Beneficiaries" style={{ marginBottom: 0 }}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <ComputedTotal fields={['beneficiaries_male', 'beneficiaries_female']} label="Total Farmers (ድምር)" suffix="Households" />
            </Col>
          </Row>
        </div>

        <Divider titlePlacement="start" style={sectionStyle}>4. Crop Multi-Select Catalog & Agronomic Verification</Divider>
        <Row gutter={10}>
          <Col span={16}>
            <Form.Item
              name="primary_crops_cultivated"
              label="Primary Crops Cultivated Under Scheme (Cereals, Pulses, Vegetables, Fruits)"
              rules={[{ required: true, message: 'Please select at least one cultivated crop' }]}
            >
              <Select mode="multiple" placeholder="Select cultivated crops..." style={{ width: '100%' }} maxTagCount="responsive"
                showSearch allowClear options={CROP_OPTIONS} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="cropping_intensity_ratio" label="Cropping Intensity" rules={[{ required: true }]}>
              <InputNumber min={1.0} max={3.5} step={0.1} style={{ width: '100%' }} suffix="x Cycles/Yr" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={10}>
          <Col span={12}>
            <Form.Item name="verifying_agronomist" label="Verifying Irrigation Agronomist" rules={[{ required: true }]}>
              <Input placeholder="e.g. Ato Yohannes Belay (Field Agronomist)" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <EthDateFields label="Field Survey Date (Ethiopian Calendar)" />
          </Col>
        </Row>
        <Form.Item name="field_survey_remarks" label="Agronomic Field Inspection Observations" style={{ marginBottom: 0 }}>
          <TextArea rows={2} placeholder="Detail tertiary canal water delivery, farmer water distribution roster adherence, soil fertility notes..." />
        </Form.Item>
      </Form>
    </Modal>
  );
}
