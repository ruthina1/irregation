import { useEffect, useState } from 'react';
import { App, AutoComplete, Col, Divider, Form, Input, InputNumber, Modal, Row, Select } from 'antd';
import { ToolOutlined } from '@ant-design/icons';
import ComputedTotal from '../../shared/components/ComputedTotal';
import EthDateFields from '../../shared/components/EthDateFields';
import { ETHIOPIAN_FISCAL_YEARS } from '../../shared/constants';
import { ethDateFields, extractName } from '../../shared/utils';
import { CANAL_NETWORK_TYPES, INTERVENTION_CATALOG_GROUPS, NEW_RECORD_DEFAULTS, OANDM_FUND_SOURCES, interventionList, isLabourIntervention } from './SchemeMaintenanceCleaningManagement';

const { TextArea } = Input;
const sectionStyle = { margin: '6px 0 10px', fontSize: 12, color: '#1a5f2c', fontWeight: 600 };

/** Fields of an O&M record that the form edits. */
const EDITABLE_FIELDS = [
  'scheme_name', 'canal_type', 'fiscal_year', 'wua_name', 'repaired_cleaned_km', 'command_area_protected_ha',
  'financial_cost_etb', 'mobilized_labor_male', 'mobilized_labor_female', 'funding_source', 'lead_coordinator',
  'field_remarks', 'zone', 'woreda', 'kebele',
];

/** Log / edit a scheme maintenance & canal cleaning intervention. */
export default function MaintenanceFormModal({ open, editingRecord, schemes, fiscalYear, findScheme, onCancel, onSubmit }) {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  // The community labour section only applies to cleaning / desilting interventions.
  const selectedTypes = Form.useWatch('intervention_types', form) || [];
  const showLabour = selectedTypes.some(isLabourIntervention);

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
        intervention_types: interventionList(editingRecord.intervention_types),
        ...ethDateFields(editingRecord.activity_ethiopian_date),
      });
    } else {
      form.setFieldsValue({ ...NEW_RECORD_DEFAULTS, fiscal_year: fiscalYear, ...ethDateFields(null) });
    }
  }, [open, editingRecord, form, fiscalYear]);

  // Smart AutoComplete: pre-fill scheme attributes from the construction registry.
  const handleSchemeChange = (value) => {
    const matched = findScheme(value);
    if (!matched) return;
    form.setFieldsValue({
      wua_name: matched.wua_name || `${matched.scheme_name} WUA`,
      command_area_protected_ha: matched.command_area_ha,
      mobilized_labor_male: matched.beneficiaries_male,
      mobilized_labor_female: matched.beneficiaries_female,
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
          <ToolOutlined style={{ color: '#1a5f2c', fontSize: 18 }} />
          <span style={{ fontSize: 15, fontWeight: 700, color: '#1a5f2c' }}>
            {editingRecord ? 'Edit Scheme Maintenance & Cleaning Record' : 'Log Scheme Infrastructure Maintenance & Canal Cleaning'}
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
          1. Irrigation Scheme & Operating Water Users Association
        </Divider>
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
                label: `${s.scheme_name} — ${s.scheme_type || 'Scheme'} (${s.command_area_ha} Ha)`,
              })),
            }]}
          />
        </Form.Item>

        <Row gutter={10}>
          <Col span={12}>
            <Form.Item name="canal_type" label="Canal Infrastructure Type (Excel Indicator)" rules={[{ required: true }]}>
              <Select placeholder="Select Type" options={CANAL_NETWORK_TYPES.map((t) => ({ value: t.value, label: t.label }))} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="fiscal_year" label="Fiscal Year (E.C.)" rules={[{ required: true }]}>
              <Select placeholder="Fiscal Year" options={ETHIOPIAN_FISCAL_YEARS.map((fy) => ({ value: fy, label: fy }))} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="wua_name" label="Responsible Water Users Association (WUA)" rules={[{ required: true }]}>
          <Input placeholder="e.g. Koga Left Bank Apex WUA Federation" />
        </Form.Item>

        {/* Auto-populated location */}
        <Form.Item name="zone" hidden><Input /></Form.Item>
        <Form.Item name="woreda" hidden><Input /></Form.Item>
        <Form.Item name="kebele" hidden><Input /></Form.Item>

        <Divider titlePlacement="start" style={sectionStyle}>2. Intervention Type Selector (Grouped Multi-Select Dropdown)</Divider>
        <Form.Item
          name="intervention_types"
          label="Select Intervention Types (Cleaning, Civil Repairs, Electro-Mechanical)"
          rules={[{ required: true, message: 'Please select at least one intervention type' }]}
        >
          <Select
            mode="multiple"
            placeholder="Select intervention types..."
            style={{ width: '100%' }}
            maxTagCount="responsive"
            showSearch
            allowClear
            options={INTERVENTION_CATALOG_GROUPS.map((group) => ({
              label: group.category,
              options: group.options.map((opt) => ({ value: opt, label: opt })),
            }))}
          />
        </Form.Item>

        <Row gutter={10}>
          <Col span={8}>
            <Form.Item name="repaired_cleaned_km" label="Delivered Canal Distance (km)" rules={[{ required: true }]}>
              <InputNumber min={0.1} step={0.1} style={{ width: '100%' }} suffix="km" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="command_area_protected_ha" label="Protected Command Area (Ha)" rules={[{ required: true }]}>
              <InputNumber min={0} style={{ width: '100%' }} suffix="Ha" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="financial_cost_etb" label="Expenditure / Cost (ETB)">
              <InputNumber min={0} style={{ width: '100%' }} placeholder="ETB" />
            </Form.Item>
          </Col>
        </Row>

        {showLabour && (
          <>
            <Divider titlePlacement="start" style={sectionStyle}>
              3. Mobilized Community Labor (ተሳታፊ የሰው ኃይል — ወንድ / ሴት / ድምር)
            </Divider>
            <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 12 }}>
              <Row gutter={10} align="middle">
                <Col span={8}>
                  <Form.Item name="mobilized_labor_male" label="Male Community Labor (ወንድ)" rules={[{ required: true }]} style={{ marginBottom: 0 }}>
                    <InputNumber min={0} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="mobilized_labor_female" label="Female Community Labor (ሴት)" rules={[{ required: true }]} style={{ marginBottom: 0 }}>
                    <InputNumber min={0} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <ComputedTotal fields={['mobilized_labor_male', 'mobilized_labor_female']} label="Total Farmers (ድምር)" suffix="Farmers" />
                </Col>
              </Row>
            </div>
          </>
        )}

        <Divider titlePlacement="start" style={sectionStyle}>4. Funding Channel, Lead Coordinator & Intervention Date</Divider>
        <Row gutter={10}>
          <Col span={12}>
            <Form.Item name="funding_source" label="Funding / Reserve Source" rules={[{ required: true }]}>
              <Select placeholder="Select Fund Source" options={OANDM_FUND_SOURCES.map((f) => ({ value: f, label: f.split('(')[0] }))} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="lead_coordinator" label="Lead Technician / WUA Coordinator" rules={[{ required: true }]}>
              <Input placeholder="e.g. Eng. Solomon Tadesse / WUA Chair" />
            </Form.Item>
          </Col>
        </Row>
        <EthDateFields label="Intervention Date (Ethiopian Calendar)" />
        <Form.Item name="field_remarks" label="Field Inspection Observations & Engineering Notes" style={{ marginBottom: 0 }}>
          <TextArea rows={2} placeholder="Detail mortar injection strength, sluice seal adjustments, weed clearing participation, water conveyance restoration..." />
        </Form.Item>
      </Form>
    </Modal>
  );
}
