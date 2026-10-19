import { useEffect, useState } from 'react';
import { App, AutoComplete, Checkbox, Col, Divider, Form, Input, InputNumber, Modal, Row, Select, Space } from 'antd';
import { FileProtectOutlined } from '@ant-design/icons';
import ComputedTotal from '../../shared/components/ComputedTotal';
import EthDateFields from '../../shared/components/EthDateFields';
import { ethDateFields, extractName } from '../../shared/utils';
import { HANDOVER_STATUSES, NEW_HANDOVER_DEFAULTS, PROTOCOL_GATES, checklistToFields, contractToFields } from './ProjectCompletionHandoverManagement';

const { TextArea } = Input;
const sectionStyle = { margin: '6px 0 10px', fontSize: 12, color: '#1a5f2c', fontWeight: 600 };

/**
 * Register / edit a scheme completion & WUA handover certificate.
 * `prefill` is a contract handed over from the Construction Projects page.
 */
export default function HandoverFormModal({
  open, editingRecord, prefill, contracts, fiscalYear, nextCode, findContract, onCancel, onSubmit,
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
        ...checklistToFields(editingRecord.protocol_checklist),
        ...ethDateFields(editingRecord.provisional_handover_eth_date),
      });
    } else {
      form.setFieldsValue({
        ...NEW_HANDOVER_DEFAULTS,
        fiscal_year: fiscalYear,
        handover_certificate_no: nextCode,
        ...ethDateFields(null),
        ...(prefill ? contractToFields(prefill) : {}),
      });
    }
  }, [open, editingRecord, prefill, form, fiscalYear, nextCode]);

  // Smart combobox: pre-fill from contracts marked "Handed Over to Users".
  const handleSchemeChange = (value) => {
    const matched = findContract(value);
    if (!matched) return;
    form.setFieldsValue(contractToFields(matched));
    message.info(`Auto-filled handover parameters from contract ${matched.contract_code}`);
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
          <FileProtectOutlined style={{ color: '#1a5f2c', fontSize: 18 }} />
          <span style={{ fontSize: 15, fontWeight: 700, color: '#1a5f2c' }}>
            {editingRecord ? 'Edit Handover & Commissioning Certificate' : 'Register Scheme Completion & WUA Handover'}
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
          1. Completed Contract & Recipient Water Users Association
        </Divider>
        <Row gutter={10}>
          <Col span={16}>
            <Form.Item
              name="scheme_name"
              label="Completed Scheme (Select 'Handed Over to Users' Contract)"
              rules={[{ required: true, message: 'Scheme name required' }]}
            >
              <AutoComplete
                placeholder="Select completed contract or type scheme name..."
                onChange={handleSchemeChange}
                allowClear
                filterOption={(input, option) => (option?.value || '').toLowerCase().includes(input.toLowerCase())}
                options={[{
                  label: "Contracts Marked 'Handed Over to Users'",
                  options: contracts.map((c) => ({
                    key: c.id,
                    value: extractName(c.scheme_name, ''),
                    label: `${extractName(c.scheme_name, '')} (${c.contract_code}) — ${c.command_area_ha} Ha`,
                  })),
                }]}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="handover_certificate_no" label="Handover Certificate No" rules={[{ required: true }]}>
              <Input placeholder="e.g. HND-CERT-2019-01" style={{ fontFamily: 'monospace' }} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={10}>
          <Col span={8}>
            <Form.Item name="contract_code" label="Contract Ref Code" rules={[{ required: true }]}>
              <Input placeholder="e.g. CNTR-2019-03" style={{ fontFamily: 'monospace' }} />
            </Form.Item>
          </Col>
          <Col span={16}>
            <Form.Item name="recipient_wua" label="Recipient Water Users Association (WUA)" rules={[{ required: true }]}>
              <Input placeholder="e.g. Goshebado Spring Irrigation Cooperative" />
            </Form.Item>
          </Col>
        </Row>

        {/* Auto-populated attributes */}
        <Form.Item name="project_code" hidden><Input /></Form.Item>
        <Form.Item name="contractor_name" hidden><Input /></Form.Item>
        <Form.Item name="consultant_supervisor" hidden><Input /></Form.Item>
        <Form.Item name="fiscal_year" hidden><Input /></Form.Item>
        <Form.Item name="zone" hidden><Input /></Form.Item>
        <Form.Item name="woreda" hidden><Input /></Form.Item>
        <Form.Item name="kebele" hidden><Input /></Form.Item>

        <Divider titlePlacement="start" style={sectionStyle}>
          2. Commissioned Command Area, Beneficiaries & 5% Warranty Retention
        </Divider>
        <Row gutter={10}>
          <Col span={6}>
            <Form.Item name="command_area_ha" label="Handed Over Land (Ha)" rules={[{ required: true }]}>
              <InputNumber min={0} style={{ width: '100%' }} suffix="Ha" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="beneficiaries_male" label="Male Beneficiaries" rules={[{ required: true }]}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="beneficiaries_female" label="Female Beneficiaries" rules={[{ required: true }]}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <ComputedTotal fields={['beneficiaries_male', 'beneficiaries_female']} label="Total Beneficiaries" suffix="HH" style={{ marginBottom: 24 }} />
          </Col>
        </Row>
        <Row gutter={10}>
          <Col span={8}>
            <Form.Item name="contract_sum_etb" label="Final Contract Sum (ETB)" rules={[{ required: true }]}>
              <InputNumber min={0} style={{ width: '100%' }} placeholder="ETB" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="retention_money_etb" label="5% Warranty Retention (ETB)" rules={[{ required: true }]}>
              <InputNumber min={0} style={{ width: '100%' }} placeholder="5% Retention" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="defect_liability_months" label="Warranty Period (Months)" rules={[{ required: true }]}>
              <InputNumber min={3} max={36} style={{ width: '100%' }} suffix="Months" />
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="start" style={sectionStyle}>
          3. Statutory Commissioning & Handover Protocol Checklist
        </Divider>
        <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 12 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#1a5f2c', display: 'block', marginBottom: 6 }}>
            Formal Handover Prerequisite Gates Verified by Regional Commission:
          </span>
          <Space wrap size={[16, 8]}>
            {PROTOCOL_GATES.map((g) => (
              <Form.Item key={g.field} name={g.field} valuePropName="checked" noStyle>
                <Checkbox>{g.formLabel}</Checkbox>
              </Form.Item>
            ))}
          </Space>
        </div>
        <Row gutter={10}>
          <Col span={6}>
            <Form.Item name="snag_items_count" label="Remaining Snags" rules={[{ required: true }]}>
              <InputNumber min={0} max={20} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={10}>
            <Form.Item name="handover_committee_lead" label="Regional Handover Commission Lead" rules={[{ required: true }]}>
              <Input placeholder="Lead Engineer Name" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <EthDateFields label="Handover Date (E.C.)" />
          </Col>
        </Row>
        <Form.Item name="handover_status" label="Handover Protocol Status" rules={[{ required: true }]}>
          <Select options={HANDOVER_STATUSES.map((s) => ({ value: s.value, label: s.label }))} />
        </Form.Item>
        <Form.Item name="handover_remarks" label="Commission Minutes, Gate Handover & Key Directives" style={{ marginBottom: 0 }}>
          <TextArea rows={2} placeholder="Detail headwork sluice keys transfer, Water Users Association executive signatures, operation schedule..." />
        </Form.Item>
      </Form>
    </Modal>
  );
}
