import { useEffect, useState } from 'react';
import { App, AutoComplete, Col, Divider, Form, Input, InputNumber, Modal, Row, Select } from 'antd';
import { ThunderboltOutlined } from '@ant-design/icons';
import ComputedTotal from '../../shared/components/ComputedTotal';
import { ETHIOPIAN_FISCAL_YEARS } from '../../shared/constants';
import { extractName, toNumber } from '../../shared/utils';
import { NEW_SOURCE_DEFAULTS, TECHNOLOGY_CATALOG_GROUPS } from './WaterSourcesTechnologiesManagement';

const sectionStyle = { margin: '6px 0 10px', fontSize: 12, color: '#1a5f2c', fontWeight: 600 };
const YEAR_OPTIONS = ETHIOPIAN_FISCAL_YEARS.map((y) => ({ value: y, label: y }));
const TECHNOLOGY_OPTIONS = TECHNOLOGY_CATALOG_GROUPS.map((group) => ({
  label: group.category,
  options: group.options.map((opt) => ({ value: opt, label: opt })),
}));

const EDITABLE_FIELDS = [
  'scheme_name', 'wua_name', 'technology_type', 'energy_source', 'fiscal_year',
  'installation_eth_year', 'zone', 'woreda', 'kebele', 'technical_specs',
];

/**
 * Register / edit a water abstraction source or lift technology.
 * `wuaOptions` (array of WUA records) switches the WUA field from free text to a dropdown.
 */
export default function WaterSourceFormModal({
  open, editingRecord, schemes, wuaOptions, fiscalYear, findScheme, labels, onCancel, onSubmit,
}) {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    if (editingRecord) {
      form.setFieldsValue({
        ...Object.fromEntries(EDITABLE_FIELDS.map((f) => [f, editingRecord[f] ?? undefined])),
        zone: extractName(editingRecord.zone, null),
        woreda: extractName(editingRecord.woreda, null),
        kebele: extractName(editingRecord.kebele, null),
        discharge_capacity_liters_sec: toNumber(editingRecord.discharge_capacity_liters_sec),
        equipment_units_count: toNumber(editingRecord.equipment_units_count) || 1,
        command_area_served_ha: toNumber(editingRecord.command_area_served_ha),
        farmers_male: toNumber(editingRecord.farmers_male),
        farmers_female: toNumber(editingRecord.farmers_female),
        fiscal_year: editingRecord.fiscal_year || fiscalYear,
        installation_eth_year: editingRecord.installation_eth_year || fiscalYear,
      });
    } else {
      form.setFieldsValue({ ...NEW_SOURCE_DEFAULTS, fiscal_year: fiscalYear, installation_eth_year: fiscalYear });
    }
  }, [open, editingRecord, form, fiscalYear]);

  // Smart combobox: pre-fill scheme parameters (half the scheme's command area / beneficiaries) and its WUA.
  const handleSchemeChange = (value) => {
    const matched = findScheme(value);
    if (!matched) return;
    form.setFieldsValue({
      wua_name: matched.wua_name || `${matched.scheme_name} WUA`,
      command_area_served_ha: Math.round(toNumber(matched.command_area_ha) * 0.5),
      farmers_male: Math.round(toNumber(matched.beneficiaries_male) * 0.5),
      farmers_female: Math.round(toNumber(matched.beneficiaries_female) * 0.5),
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

  const withWuaDropdown = Array.isArray(wuaOptions);

  return (
    <Modal
      title={(
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ThunderboltOutlined style={{ color: '#1a5f2c', fontSize: 18 }} />
          <span style={{ fontSize: 15, fontWeight: 700, color: '#1a5f2c' }}>
            {editingRecord ? 'Edit Water Source / Technology Record' : 'Register Water Abstraction Source & Lift Technology'}
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
        <Divider titlePlacement="start" style={{ ...sectionStyle, margin: '0 0 10px' }}>{labels.formSection1}</Divider>
        <Row gutter={10}>
          <Col span={24}>
            <Form.Item
              name="scheme_name"
              label="Irrigation Scheme Name (Select Registered Scheme or Type)"
              rules={[{ required: true, message: 'Scheme name required' }]}
            >
              <AutoComplete
                placeholder="Select scheme to auto-fill details or type new name..."
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
        </Row>

        <Row gutter={10}>
          <Col span={16}>
            {withWuaDropdown ? (
              <Form.Item
                name="wua_name"
                label="Responsible Water Users Association (WUA Dropdown)"
                rules={[{ required: true, message: 'Please select a Water Users Association' }]}
              >
                <Select
                  placeholder="Select Water Users Association..."
                  showSearch
                  allowClear
                  optionFilterProp="label"
                  options={wuaOptions.map((w) => ({
                    key: w.id,
                    value: w.wua_name,
                    label: `${w.wua_name}${w.scheme_name ? ` (${w.scheme_name})` : ''}`,
                  }))}
                  notFoundContent="No registered WUAs for this fiscal year"
                />
              </Form.Item>
            ) : (
              <Form.Item name="wua_name" label="Responsible Water Users Association (WUA)" rules={[{ required: true }]}>
                <Input placeholder="WUA Legal Name" />
              </Form.Item>
            )}
          </Col>
          <Col span={8}>
            <Form.Item name="fiscal_year" label="Fiscal Year (E.C.)" rules={[{ required: true }]}>
              <Select placeholder="Fiscal Year" options={YEAR_OPTIONS} />
            </Form.Item>
          </Col>
        </Row>

        {/* Auto-populated attributes */}
        <Form.Item name="zone" hidden><Input /></Form.Item>
        <Form.Item name="woreda" hidden><Input /></Form.Item>
        <Form.Item name="kebele" hidden><Input /></Form.Item>

        <Divider titlePlacement="start" style={sectionStyle}>2. Abstraction Source, Pumps & Wells (Excel Indicators)</Divider>
        <Row gutter={10}>
          <Col span={16}>
            <Form.Item name="technology_type" label="Abstraction Technology / Source Type" rules={[{ required: true }]}>
              <Select placeholder="Select Technology / Source" options={TECHNOLOGY_OPTIONS} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="equipment_units_count" label="Equipment Units Installed" rules={[{ required: true }]}>
              <InputNumber min={1} max={50} style={{ width: '100%' }} suffix="Units" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={10}>
          <Col span={8}>
            <Form.Item name="discharge_capacity_liters_sec" label="Discharge Capacity (L/s)" rules={[{ required: true }]}>
              <InputNumber min={0.1} style={{ width: '100%' }} suffix="L/s" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="command_area_served_ha" label="Command Area Served (Ha)" rules={[{ required: true }]}>
              <InputNumber min={0.1} style={{ width: '100%' }} suffix="Ha" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="energy_source" label="Energy / Drive Source" rules={[{ required: true }]}>
              <Input placeholder="e.g. Solar PV, Diesel, Gravity" />
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

        <Row gutter={10}>
          <Col span={12}>
            <Form.Item name="installation_eth_year" label="Installation Year (E.C.)" rules={[{ required: true }]}>
              <Select placeholder="Installation Year" options={YEAR_OPTIONS} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="technical_specs" label="Technical Specifications & Dimensions" style={{ marginBottom: 0 }}>
              <Input placeholder="e.g. 120m drilled depth, 72 solar panels, ogee weir" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
