import { useEffect, useState } from 'react';
import { App, AutoComplete, Col, Divider, Form, Input, InputNumber, Modal, Row, Select } from 'antd';
import { BankOutlined, PayCircleOutlined } from '@ant-design/icons';
import { ETHIOPIAN_FISCAL_YEARS } from '../../shared/constants';
import { extractName, ethDateFields, toNumber } from '../../shared/utils';
import { FINANCING_PROGRAMS, toFinancingProgram, toMillions } from './ProjectFundingFinancingManagement';
import EthDateFields from '../../shared/components/EthDateFields';

const { TextArea } = Input;
const sectionStyle = { margin: '6px 0 10px', fontSize: 12, color: '#1a5f2c', fontWeight: 600 };

/** Register / edit a capital funding allocation linked to a construction contract. */
export default function FundingFormModal({ open, editingRecord, contracts, fiscalYear, nextCode, findContract, onCancel, onSubmit }) {
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
        fiscal_year: editingRecord.fiscal_year || fiscalYear,
      });
    } else {
      form.setFieldsValue({
        fiscal_year: fiscalYear,
        funding_code: nextCode,
        funding_program: 'Regional Government Budget',
        cumulative_disbursed_etb: 0,
      });
    }
  }, [open, editingRecord, form, fiscalYear, nextCode]);

  // Smart combobox: pre-fill the budget from the selected construction contract.
  const handleSchemeChange = (value) => {
    const matched = findContract(value);
    if (!matched) return;
    form.setFieldsValue({
      contract_code: matched.contract_code,
      project_code: matched.project_code,
      funding_program: toFinancingProgram(matched.funding_source),
      total_allocated_budget_etb: matched.contract_sum_etb,
      zone: extractName(matched.zone, null),
      woreda: extractName(matched.woreda, null),
      kebele: extractName(matched.kebele, null),
    });
    message.info(`Auto-filled budget parameters from contract ${matched.contract_code}`);
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
          <BankOutlined style={{ color: '#1a5f2c', fontSize: 18 }} />
          <span style={{ fontSize: 15, fontWeight: 700, color: '#1a5f2c' }}>
            {editingRecord ? 'Edit Capital Allocation Parameters' : 'Register New Project Capital Funding Allocation'}
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
          1. Link with Active Construction Contract
        </Divider>
        <Row gutter={10}>
          <Col span={16}>
            <Form.Item
              name="scheme_name"
              label="Irrigation Scheme Name (Select Contract or Type Name)"
              rules={[{ required: true, message: 'Scheme name is required' }]}
            >
              <AutoComplete
                placeholder="Select active contract to auto-fill budget..."
                onChange={handleSchemeChange}
                allowClear
                filterOption={(input, option) => (option?.value || '').toLowerCase().includes(input.toLowerCase())}
                options={[{
                  label: 'Active Construction Contracts',
                  options: contracts.map((c) => ({
                    key: c.id,
                    value: c.scheme_name,
                    label: `${c.scheme_name} (${c.contract_code}) — ${toMillions(c.contract_sum_etb)}M ETB`,
                  })),
                }]}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="funding_code" label="Funding Allocation Ref" rules={[{ required: true }]}>
              <Input placeholder="e.g. FND-2019-01" style={{ fontFamily: 'monospace' }} />
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
            <Form.Item name="project_code" label="Design Project Code" rules={[{ required: true }]}>
              <Input placeholder="e.g. IRR-STD-2019-01" style={{ fontFamily: 'monospace' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="fiscal_year" label="Fiscal Year (E.C.)" rules={[{ required: true }]}>
              <Select placeholder="Fiscal Year" options={ETHIOPIAN_FISCAL_YEARS.map((fy) => ({ value: fy, label: fy }))} />
            </Form.Item>
          </Col>
        </Row>

        {/* Auto-populated attributes */}
        <Form.Item name="zone" hidden><Input /></Form.Item>
        <Form.Item name="woreda" hidden><Input /></Form.Item>
        <Form.Item name="kebele" hidden><Input /></Form.Item>

        <Divider titlePlacement="start" style={sectionStyle}>2. Financing Program Channel & Donor Account</Divider>
        <Row gutter={10}>
          <Col span={12}>
            <Form.Item name="funding_program" label="Financing Program / Channel (Excel Indicator)" rules={[{ required: true }]}>
              <Select placeholder="Select Program" options={FINANCING_PROGRAMS.map((p) => ({ value: p.value, label: p.label.split('(')[0] }))} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="donor_account_ref" label="Donor Special Account / Ledger Ref" rules={[{ required: true }]}>
              <Input placeholder="e.g. IDA-PACT-CR-6842-ET / BOFED-CAP-2019" />
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="start" style={sectionStyle}>3. Capital Budget & Cumulative Disbursed</Divider>
        <Row gutter={10}>
          <Col span={12}>
            <Form.Item name="total_allocated_budget_etb" label="Total Approved Capital Budget (ETB)" rules={[{ required: true }]}>
              <InputNumber min={0} style={{ width: '100%' }} placeholder="Total Allocated ETB" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="cumulative_disbursed_etb" label="Cumulative Disbursed to Date (ETB)" rules={[{ required: true }]}>
              <InputNumber min={0} style={{ width: '100%' }} placeholder="Cumulative Disbursed ETB" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="financial_notes" label="Financial Auditing & Budget Control Notes" style={{ marginBottom: 0 }}>
          <TextArea rows={2} placeholder="Detail special account ceiling, counterpart funding contribution, tax exemptions..." />
        </Form.Item>
      </Form>
    </Modal>
  );
}


// --- DisbursementModal ---

/**
 * Log an interim payment (IPC) against a funding allocation. The server
 * updates the ledger, cumulative total, balance and status, and rejects
 * amounts above the remaining balance (422).
 */
export function DisbursementModal({ record, onCancel, onSubmit }) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // Reset when an allocation is opened (keyed on id, not on the record object).
  const recordId = record?.id ?? null;
  const nextIpcNo = `IPC-0${(record?.disbursement_ledger?.length || 0) + 1}`;
  useEffect(() => {
    if (!recordId) return;
    form.resetFields();
    form.setFieldsValue({ ipc_no: nextIpcNo, recipient: 'Awarded Construction Contractor', ...ethDateFields(null) });
  }, [recordId, nextIpcNo, form]);

  const handleFinish = async (values) => {
    setSubmitting(true);
    const saved = await onSubmit(record, values, form);
    setSubmitting(false);
    if (saved) onCancel();
  };

  const remaining = toNumber(record?.remaining_balance_etb);

  return (
    <Modal
      title={(
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <PayCircleOutlined style={{ color: '#1a5f2c', fontSize: 18 }} />
          <span style={{ fontSize: 15, fontWeight: 700, color: '#1a5f2c' }}>
            Process Disbursement Payment: {record?.scheme_name}
          </span>
        </div>
      )}
      open={Boolean(record)}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText="Authorize & Log Payment"
      okButtonProps={{ style: { backgroundColor: '#1a5f2c', borderColor: '#1a5f2c' }, disabled: remaining <= 0 }}
      confirmLoading={submitting}
      width={560}
      destroyOnHidden
    >
      {record && (
        <Form form={form} layout="vertical" size="middle" onFinish={handleFinish} style={{ marginTop: 12 }}>
          <div style={{ background: '#f6ffed', border: '1px solid #d1d5db', padding: '10px 14px', borderRadius: 8, marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span>Program: <strong style={{ color: '#1a5f2c' }}>{record.funding_program}</strong></span>
              <span>Total Budget: <strong>{toMillions(record.total_allocated_budget_etb)} M ETB</strong></span>
            </div>
            <div style={{ fontSize: 11, color: '#595959', marginTop: 4 }}>
              Remaining Balance: <strong style={{ color: '#a16207' }}>{toMillions(remaining, 2)} M ETB</strong> | Burn Rate: {toNumber(record.financial_burn_rate_pct)}%
            </div>
            {remaining <= 0 && (
              <div style={{ fontSize: 11, color: '#b42318', marginTop: 4 }}>
                This allocation is fully disbursed; no further payments can be logged.
              </div>
            )}
          </div>

          <Row gutter={10}>
            <Col span={14}>
              <Form.Item
                name="disbursement_amount"
                label="Disbursement Payment Amount (ETB)"
                rules={[{ required: true, message: 'Please enter payment amount' }]}
              >
                <InputNumber min={1} max={remaining || undefined} style={{ width: '100%' }} placeholder="Enter amount in ETB" />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item name="ipc_no" label="Interim Certificate (IPC #)" rules={[{ required: true }]}>
                <Input placeholder="e.g. IPC-03" />
              </Form.Item>
            </Col>
          </Row>

          <EthDateFields label="Disbursement Date (Ethiopian Calendar)" />

          <Row gutter={10}>
            <Col span={12}>
              <Form.Item name="recipient" label="Payee / Contractor Entity" rules={[{ required: true }]}>
                <Input placeholder="Recipient Organization" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="voucher_ref" label="Bank Payment Voucher / Cheque Ref">
                <Input placeholder="e.g. PV-2019-9812 / CBE-FT" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      )}
    </Modal>
  );
}
