import { useEffect, useState } from 'react';
import { Alert, App, AutoComplete, Col, Divider, Form, Input, InputNumber, Modal, Row, Select } from 'antd';
import { RiseOutlined } from '@ant-design/icons';
import ComputedTotal from '../../shared/components/ComputedTotal';
import EthDateFields from '../../shared/components/EthDateFields';
import { ETHIOPIAN_FISCAL_YEARS } from '../../shared/constants';
import { ethDateFields, extractName, toNumber } from '../../shared/utils';
import { CROP_CATALOG_GROUPS, CROP_CATEGORIES, CROPPING_ROUNDS, NEW_RECORD_DEFAULTS } from './SeasonalCropProductionYieldManagement';

const { TextArea } = Input;
const sectionStyle = { margin: '6px 0 10px', fontSize: 12, color: '#1a5f2c', fontWeight: 600 };
const matchOption = (input, option) => String(option?.value || '').toLowerCase().includes(input.toLowerCase());

/** Read-only productivity (Qt/Ha) derived live from yield and area; the server stores the same value. */
function ProductivityField({ areaField, yieldField }) {
  return (
    <Form.Item
      label="Productivity (Qt/Ha)"
      shouldUpdate={(prev, cur) => prev[areaField] !== cur[areaField] || prev[yieldField] !== cur[yieldField]}
    >
      {({ getFieldValue }) => {
        const area = toNumber(getFieldValue(areaField));
        const value = area > 0 ? (toNumber(getFieldValue(yieldField)) / area).toFixed(1) : '0.0';
        return (
          <div
            style={{
              height: 32, background: '#f6ffed', border: '1px dashed #d1d5db', borderRadius: 6, display: 'flex',
              alignItems: 'center', padding: '0 8px', fontWeight: 700, color: '#1a5f2c',
            }}
          >
            {value} Qt/Ha
          </div>
        );
      }}
    </Form.Item>
  );
}

/** Log / edit a seasonal irrigated crop harvest record. */
export default function SeasonalFormModal({
  open, editingRecord, schemes, schemesError, fiscalYear, nextCode, findScheme, onCancel, onSubmit,
}) {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    if (editingRecord) {
      form.setFieldsValue({
        ...editingRecord,
        zone: extractName(editingRecord.zone, null),
        woreda: extractName(editingRecord.woreda, null),
        kebele: extractName(editingRecord.kebele, null),
        ...ethDateFields(editingRecord.survey_ethiopian_date),
      });
    } else {
      form.setFieldsValue({ ...NEW_RECORD_DEFAULTS, fiscal_year: fiscalYear, production_code: nextCode, ...ethDateFields(null) });
    }
  }, [open, editingRecord, form, fiscalYear, nextCode]);

  // Smart autocomplete: pre-fill scheme attributes from the construction registry.
  const handleSchemeChange = (value) => {
    const matched = findScheme(value);
    if (!matched) return;
    form.setFieldsValue({
      scheme_code: matched.scheme_code || matched.project_code,
      wua_name: matched.wua_name || `${matched.scheme_name} WUA`,
      cultivated_area_ha: Math.round(toNumber(matched.command_area_ha) * 0.4) || undefined,
      farmers_male: Math.round(toNumber(matched.beneficiaries_male) * 0.4),
      farmers_female: Math.round(toNumber(matched.beneficiaries_female) * 0.4),
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
          <RiseOutlined style={{ color: '#1a5f2c', fontSize: 18 }} />
          <span style={{ fontSize: 15, fontWeight: 700, color: '#1a5f2c' }}>
            {editingRecord ? 'Edit Seasonal Crop Production Record' : 'Log Seasonal Irrigated Crop Production & Yield'}
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
      {schemesError && (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 12 }}
          message="Registered schemes could not be loaded; type the scheme name manually."
          description={schemesError}
        />
      )}
      <Form form={form} layout="vertical" size="middle" onFinish={handleFinish}>
        <Divider titlePlacement="start" style={{ ...sectionStyle, margin: '0 0 10px' }}>
          1. Irrigation Scheme Identification & Cropping Season
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
            filterOption={matchOption}
            options={[{
              label: 'Active Registered Schemes',
              options: schemes.map((s) => ({
                key: s.id,
                value: s.scheme_name,
                label: `${s.scheme_name} — ${toNumber(s.command_area_ha).toLocaleString()} Ha${s.wua_name ? ` (${s.wua_name})` : ''}`,
              })),
            }]}
          />
        </Form.Item>

        <Row gutter={10}>
          <Col span={10}>
            <Form.Item name="cropping_round" label="Cropping Season / Round (Excel Indicator)" rules={[{ required: true }]}>
              <Select placeholder="Select Round" options={CROPPING_ROUNDS.map((r) => ({ value: r.value, label: r.label }))} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="production_code" label="Production Record Ref" rules={[{ required: true }]}>
              <Input placeholder="e.g. PRD-2019-001" style={{ fontFamily: 'monospace' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="fiscal_year" label="Fiscal Year (E.C.)" rules={[{ required: true }]}>
              <Select placeholder="Fiscal Year" options={ETHIOPIAN_FISCAL_YEARS.map((fy) => ({ value: fy, label: fy }))} />
            </Form.Item>
          </Col>
        </Row>

        {/* Auto-populated attributes */}
        <Form.Item name="scheme_code" hidden><Input /></Form.Item>
        <Form.Item name="wua_name" hidden><Input /></Form.Item>
        <Form.Item name="zone" hidden><Input /></Form.Item>
        <Form.Item name="woreda" hidden><Input /></Form.Item>
        <Form.Item name="kebele" hidden><Input /></Form.Item>

        <Divider titlePlacement="start" style={sectionStyle}>2. Crop Category & Specific Cultivar (Excel Indicators)</Divider>
        <Row gutter={10}>
          <Col span={10}>
            <Form.Item name="crop_category" label="Crop Category (Excel Indicator)" rules={[{ required: true }]}>
              <Select placeholder="Select Category" options={CROP_CATEGORIES.map((c) => ({ value: c.value, label: c.label }))} />
            </Form.Item>
          </Col>
          <Col span={14}>
            <Form.Item name="specific_crop" label="Specific Crop Cultivated (Cereals, Pulses, Vegetables)" rules={[{ required: true }]}>
              <AutoComplete
                placeholder="Select or type specific crop"
                allowClear
                filterOption={matchOption}
                options={CROP_CATALOG_GROUPS.map((g) => ({
                  label: g.category,
                  options: g.crops.map((crop) => ({ value: crop, label: crop })),
                }))}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={10}>
          <Col span={8}>
            <Form.Item name="cultivated_area_ha" label="Cultivated Land (Ha)" rules={[{ required: true }]}>
              <InputNumber min={0.1} style={{ width: '100%' }} suffix="Ha" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="production_yield_quintals" label="Harvest Yield (Quintals)" rules={[{ required: true }]}>
              <InputNumber min={0} style={{ width: '100%' }} suffix="Qt" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <ProductivityField areaField="cultivated_area_ha" yieldField="production_yield_quintals" />
          </Col>
        </Row>

        <Divider titlePlacement="start" style={sectionStyle}>3. Beneficiary Farmers (ተጠቃሚ አ/አደር — ወንድ / ሴት / ድምር)</Divider>
        <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 12 }}>
          <Row gutter={10} align="middle">
            <Col span={8}>
              <Form.Item name="farmers_male" label="Male Farmers (ወንድ)" rules={[{ required: true }]} style={{ marginBottom: 0 }}>
                <InputNumber min={0} precision={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="farmers_female" label="Female Farmers (ሴት)" rules={[{ required: true }]} style={{ marginBottom: 0 }}>
                <InputNumber min={0} precision={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <ComputedTotal fields={['farmers_male', 'farmers_female']} label="Total Beneficiaries (ድምር)" suffix="Households" />
            </Col>
          </Row>
        </div>

        <Row gutter={10}>
          <Col span={10}>
            <Form.Item name="verifying_agronomist" label="Verifying Agronomist / Woreda DA" rules={[{ required: true }]}>
              <Input placeholder="e.g. Ato Yohannes Belay" />
            </Form.Item>
          </Col>
          <Col span={14}>
            <EthDateFields label="Survey / Weighing Date (Ethiopian Calendar)" />
          </Col>
        </Row>
        <Form.Item name="agronomic_remarks" label="Agronomic Performance & Market Linkage Observations" style={{ marginBottom: 0 }}>
          <TextArea rows={2} placeholder="Detail crop stand vigor, pest incidents, grain filling quality, cooperative farm-gate market prices..." />
        </Form.Item>
      </Form>
    </Modal>
  );
}
