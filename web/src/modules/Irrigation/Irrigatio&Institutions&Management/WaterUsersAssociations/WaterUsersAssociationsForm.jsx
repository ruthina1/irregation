import { useEffect, useState } from 'react';
import { App, AutoComplete, Col, Divider, Form, Input, InputNumber, Modal, Row, Select } from 'antd';
import { TeamOutlined } from '@ant-design/icons';
import ComputedTotal from '../../shared/components/ComputedTotal';
import EthDateFields from '../../shared/components/EthDateFields';
import { ethDateFields, extractName } from '../../shared/utils';
import { ASSOCIATION_TYPES, BYLAW_STATUSES, NEW_WUA_DEFAULTS, WATER_DISTRIBUTION_REGIMES } from './WaterUsersAssociationsManagement';

const { TextArea } = Input;
const sectionStyle = { margin: '6px 0 10px', fontSize: 12, color: '#1a5f2c', fontWeight: 600 };

/** Register / edit a Water Users Association. */
export default function WuaFormModal({ open, editingWua, schemes, fiscalYear, nextCode, findScheme, onCancel, onSubmit }) {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    if (editingWua) {
      form.setFieldsValue({ ...editingWua, ...ethDateFields(editingWua.establishment_eth_date) });
    } else {
      form.setFieldsValue({ ...NEW_WUA_DEFAULTS, fiscal_year: fiscalYear, wua_reg_code: nextCode, ...ethDateFields(null) });
    }
  }, [open, editingWua, form, fiscalYear, nextCode]);

  // Smart combobox: pre-fill scheme attributes from the construction registry.
  const handleSchemeChange = (value) => {
    const matched = findScheme(value);
    if (!matched) return;
    form.setFieldsValue({
      contract_code: matched.contract_code,
      command_area_ha: matched.command_area_ha,
      members_male: matched.beneficiaries_male,
      members_female: matched.beneficiaries_female,
      zone: extractName(matched.zone, null),
      woreda: extractName(matched.woreda, null),
      kebele: extractName(matched.kebele, null),
      wua_name: `${matched.scheme_name} Water Users Association`,
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
          <TeamOutlined style={{ color: '#1a5f2c', fontSize: 18 }} />
          <span style={{ fontSize: 15, fontWeight: 700, color: '#1a5f2c' }}>
            {editingWua ? 'Edit Water Users Association Profile' : 'Register New Water Users Association (WUA)'}
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
          1. Irrigation Scheme Association & Legal Registry Code
        </Divider>
        <Row gutter={10}>
          <Col span={16}>
            <Form.Item
              name="scheme_name"
              label="Irrigation Scheme Name (Select Scheme or Type Name)"
              rules={[{ required: true, message: 'Scheme name required' }]}
            >
              <AutoComplete
                placeholder="Select completed scheme to auto-fill location..."
                onChange={handleSchemeChange}
                allowClear
                filterOption={(input, option) => (option?.value || '').toLowerCase().includes(input.toLowerCase())}
                options={[{
                  label: 'Active & Handed-Over Irrigation Schemes',
                  options: schemes.map((s) => ({ key: s.id, value: s.scheme_name, label: `${s.scheme_name} — ${s.command_area_ha} Ha` })),
                }]}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="wua_reg_code" label="WUA Registration Code" rules={[{ required: true }]}>
              <Input placeholder="e.g. WUA-2019-01" style={{ fontFamily: 'monospace' }} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={10}>
          <Col span={16}>
            <Form.Item name="wua_name" label="Water Users Association Legal Name" rules={[{ required: true }]}>
              <Input placeholder="e.g. Goshebado Spring Water Users Cooperative Association" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="establishment_type" label="Establishment Category (Excel Indicator)" rules={[{ required: true }]}>
              <Select placeholder="Select Type" options={ASSOCIATION_TYPES.map((t) => ({ value: t.value, label: t.label.split('(')[0] }))} />
            </Form.Item>
          </Col>
        </Row>

        {/* Auto-populated attributes */}
        <Form.Item name="contract_code" hidden><Input /></Form.Item>
        <Form.Item name="fiscal_year" hidden><Input /></Form.Item>
        <Form.Item name="zone" hidden><Input /></Form.Item>
        <Form.Item name="woreda" hidden><Input /></Form.Item>
        <Form.Item name="kebele" hidden><Input /></Form.Item>

        <Divider titlePlacement="start" style={sectionStyle}>2. Command Area (Ha) & Gender-Disaggregated Farmer Members</Divider>
        <Row gutter={10}>
          <Col span={8}>
            <Form.Item name="command_area_ha" label="Managed Command Area (Ha)" rules={[{ required: true }]}>
              <InputNumber min={0} style={{ width: '100%' }} suffix="Ha" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="members_male" label="Male Members (ወንድ)" rules={[{ required: true }]}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="members_female" label="Female Members (ሴት)" rules={[{ required: true }]}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="start" style={sectionStyle}>3. Leadership, Committee Gender Split & Water Master (ውሃ ዳኛ)</Divider>
        <Row gutter={10}>
          <Col span={12}>
            <Form.Item name="chairperson_name" label="WUA Chairperson Name" rules={[{ required: true }]}>
              <Input placeholder="Chairperson Name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="water_master_name" label="Water Master / Distributor (ውሃ ዳኛ)" rules={[{ required: true }]}>
              <Input placeholder="Water Master Name" />
            </Form.Item>
          </Col>
        </Row>
        <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 12 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#1a5f2c', display: 'block', marginBottom: 6 }}>
            Executive Committee Leadership Composition (በማህበሩ አመራር):
          </span>
          <Row gutter={10} align="middle">
            <Col span={8}>
              <Form.Item name="committee_male" label="Male Leaders (ወንድ አመራር)" rules={[{ required: true }]} style={{ marginBottom: 0 }}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="committee_female" label="Female Leaders (ሴት አመራር)" rules={[{ required: true }]} style={{ marginBottom: 0 }}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <ComputedTotal fields={['committee_male', 'committee_female']} label="Total Executive Leaders" suffix="Committee Members" />
            </Col>
          </Row>
        </div>

        <Divider titlePlacement="start" style={sectionStyle}>4. Water Distribution Regime & Tertiary Ketenas</Divider>
        <Row gutter={10}>
          <Col span={14}>
            <Form.Item name="distribution_regime" label="Water Distribution Schedule / Regime" rules={[{ required: true }]}>
              <Select placeholder="Select Distribution Schedule" options={WATER_DISTRIBUTION_REGIMES.map((r) => ({ value: r, label: r }))} />
            </Form.Item>
          </Col>
          <Col span={10}>
            <Form.Item name="sub_ketenas_count" label="Sub-Ketenas / WUGs (ቀጠናዎች)" rules={[{ required: true }]}>
              <InputNumber min={1} max={30} style={{ width: '100%' }} suffix="Groups" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={10}>
          <Col span={8}>
            <Form.Item name="annual_water_fee_etb_ha" label="Annual Water Fee (ETB/Ha)" rules={[{ required: true }]}>
              <InputNumber min={0} style={{ width: '100%' }} suffix="ETB" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="fee_collection_rate_pct" label="Collection Rate (%)" rules={[{ required: true }]}>
              <InputNumber min={0} max={100} style={{ width: '100%' }} suffix="%" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="bank_account_balance_etb" label="Bank Balance (ETB)">
              <InputNumber min={0} style={{ width: '100%' }} suffix="ETB" />
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="start" style={sectionStyle}>5. Legal Registration Decree, Bylaws & Ethiopian Date</Divider>
        <Row gutter={10}>
          <Col span={10}>
            <Form.Item name="registration_decree_ref" label="Cooperative Decree Certificate Ref" rules={[{ required: true }]}>
              <Input placeholder="e.g. COOP-REG-AMH-2019-441" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="bylaw_charter_status" label="Bylaws Status" rules={[{ required: true }]}>
              <Select options={BYLAW_STATUSES} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <EthDateFields label="Registration Date (E.C.)" />
          </Col>
        </Row>
        <Form.Item name="governance_remarks" label="WUA Functionality & Water Distribution Remarks" style={{ marginBottom: 0 }}>
          <TextArea rows={2} placeholder="Detail rotational water distribution, tertiary canal cleaning participation, conflict resolution..." />
        </Form.Item>
      </Form>
    </Modal>
  );
}
