import { useEffect, useState } from 'react';
import { Alert, App, Col, Divider, Form, Input, InputNumber, Modal, Row, Select } from 'antd';
import { LineChartOutlined } from '@ant-design/icons';
import EthDateFields from '../../shared/components/EthDateFields';
import { ethDateFields, extractName } from '../../shared/utils';
import { NEW_LOG_DEFAULTS } from './ConstructionProgressPerformanceManagement';

const { TextArea } = Input;
const sectionStyle = { margin: '6px 0 10px', fontSize: 12, color: '#1a5f2c', fontWeight: 600 };

/** Fields copied from the selected contract's latest evaluation, when the contract has them. */
const CONTRACT_PREFILL = [
  'planned_progress_pct', 'physical_progress_pct', 'financial_progress_pct', 'weir_concreting_pct',
  'canal_excavation_pct', 'canal_lining_km', 'target_canal_lining_km', 'gates_installed_count',
  'target_gates_count', 'resident_engineer',
];

const PctInput = () => <InputNumber min={0} max={100} style={{ width: '100%' }} suffix="%" />;

/** Log / edit a site inspection progress record linked to a construction contract. */
export default function ProgressFormModal({ open, editingRecord, contracts, nextCode, onCancel, onSubmit }) {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const contractId = Form.useWatch('contract_id', form);
  const selectedContract = contracts.find((c) => c.id === contractId);

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    if (editingRecord) {
      form.setFieldsValue({ ...editingRecord, ...ethDateFields(editingRecord.reporting_ethiopian_date) });
    } else {
      form.setFieldsValue({ ...NEW_LOG_DEFAULTS, progress_log_code: nextCode, ...ethDateFields(null) });
    }
  }, [open, editingRecord, form, nextCode]);

  // Smart pre-fill from the parent contract's latest evaluated progress.
  const handleContractSelect = (id) => {
    const matched = contracts.find((c) => c.id === id);
    if (!matched) return;
    const values = Object.fromEntries(
      CONTRACT_PREFILL.filter((f) => matched[f] !== null && matched[f] !== undefined).map((f) => [f, matched[f]])
    );
    form.setFieldsValue(values);
    message.info(`Auto-filled progress parameters from contract ${matched.contract_code}`);
  };

  const handleFinish = async (values) => {
    setSubmitting(true);
    const saved = await onSubmit(values, form);
    setSubmitting(false);
    if (saved) onCancel();
  };

  const contractOptions = contracts.map((c) => ({
    value: c.id,
    label: `${c.scheme_name} (${c.contract_code}) — ${c.command_area_ha ?? 0} Ha`,
  }));
  // Keep the saved contract visible even if it is not in the current fiscal-year list.
  if (editingRecord && !contracts.some((c) => c.id === editingRecord.contract_id)) {
    contractOptions.push({
      value: editingRecord.contract_id,
      label: `${editingRecord.scheme_name} (${editingRecord.contract_code})`,
    });
  }

  return (
    <Modal
      title={(
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <LineChartOutlined style={{ color: '#1a5f2c', fontSize: 18 }} />
          <span style={{ fontSize: 15, fontWeight: 700, color: '#1a5f2c' }}>
            {editingRecord ? 'Edit Site Progress Inspection Log' : 'Log Weekly / Monthly Site Execution Progress'}
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
              name="contract_id"
              label="Select Active Scheme Contract"
              rules={[{ required: true, message: 'Please select a contract' }]}
            >
              <Select
                placeholder="Select contract to auto-fill parameters"
                onChange={handleContractSelect}
                showSearch
                optionFilterProp="label"
                options={contractOptions}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="progress_log_code" label="Progress Inspection Ref" rules={[{ required: true }]}>
              <Input placeholder="e.g. PRG-2019-01" style={{ fontFamily: 'monospace' }} />
            </Form.Item>
          </Col>
        </Row>
        {selectedContract && (
          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 12, fontSize: 12 }}
            message={`${selectedContract.scheme_type || 'Scheme'} • ${selectedContract.project_code || ''} • ${extractName(selectedContract.woreda)}, ${extractName(selectedContract.zone)}`}
            description="Contract code, project code, scheme type, contract sum, command area, location and fiscal year are taken from this contract by the server; variance and schedule health are computed from the percentages below."
          />
        )}

        <Divider titlePlacement="start" style={sectionStyle}>
          2. Progress Curve Gauges (Planned vs Physical vs Financial)
        </Divider>
        <Row gutter={10}>
          <Col span={8}>
            <Form.Item name="planned_progress_pct" label="Planned Target Progress (%)" rules={[{ required: true }]}>
              <PctInput />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="physical_progress_pct" label="Actual Physical Progress (%)" rules={[{ required: true }]}>
              <PctInput />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="financial_progress_pct" label="Financial Disbursed (%)" rules={[{ required: true }]}>
              <PctInput />
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="start" style={sectionStyle}>
          3. Physical Work-Breakdown Volumes (WBS)
        </Divider>
        <Row gutter={10}>
          <Col span={8}>
            <Form.Item name="weir_concreting_pct" label="Weir Concreting Progress (%)" rules={[{ required: true }]}>
              <PctInput />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="canal_lining_km" label="Lined Canal Completed (km)" rules={[{ required: true }]}>
              <InputNumber min={0} style={{ width: '100%' }} suffix="km" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="target_canal_lining_km" label="Total Target Canal (km)" rules={[{ required: true }]}>
              <InputNumber min={0} style={{ width: '100%' }} suffix="km" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={10}>
          <Col span={8}>
            <Form.Item name="canal_excavation_pct" label="Canal Excavation (%)" rules={[{ required: true }]}>
              <PctInput />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="gates_installed_count" label="Control Gates Installed" rules={[{ required: true }]}>
              <InputNumber min={0} precision={0} style={{ width: '100%' }} suffix="Units" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="target_gates_count" label="Total Planned Gates" rules={[{ required: true }]}>
              <InputNumber min={0} precision={0} style={{ width: '100%' }} suffix="Units" />
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="start" style={sectionStyle}>
          4. Resident Supervision Engineer & Inspection Date
        </Divider>
        <Row gutter={10}>
          <Col span={10}>
            <Form.Item name="resident_engineer" label="Reporting Resident Engineer" rules={[{ required: true }]}>
              <Input placeholder="e.g. Eng. Worku Mengesha" />
            </Form.Item>
          </Col>
          <Col span={14}>
            <EthDateFields label="Inspection Date (Ethiopian Calendar)" />
          </Col>
        </Row>

        <Form.Item name="site_engineering_remarks" label="Resident Engineer Site Progress Observations" style={{ marginBottom: 0 }}>
          <TextArea rows={2} placeholder="Detail headwork curing, precast panel delivery, excavation dewatering, or local labor availability..." />
        </Form.Item>
      </Form>
    </Modal>
  );
}
