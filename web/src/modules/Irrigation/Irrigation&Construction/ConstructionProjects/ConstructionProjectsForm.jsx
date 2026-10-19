import { useEffect, useState } from 'react';
import { App, AutoComplete, Col, Divider, Form, Input, InputNumber, Modal, Row, Select } from 'antd';
import { BuildOutlined, LineChartOutlined } from '@ant-design/icons';
import ComputedTotal from '../../shared/components/ComputedTotal';
import EthDateFields from '../../shared/components/EthDateFields';
import { ETHIOPIAN_FISCAL_YEARS } from '../../shared/constants';
import { ethDateFields, extractName, toNumber } from '../../shared/utils';
import { CONTRACTOR_GRADES, FUNDING_PROGRAMS, NEW_CONTRACT_DEFAULTS, SCHEME_TYPES, PROGRESS_HEALTH_STATUSES } from './ConstructionProjectsManagement';

const { TextArea } = Input;
const sectionStyle = { margin: '6px 0 10px', fontSize: 12, color: '#1a5f2c', fontWeight: 600 };

/** Location fields as plain strings (records may hold objects). */
const locationOf = (record) => ({
  zone: extractName(record.zone, null),
  woreda: extractName(record.woreda, null),
  kebele: extractName(record.kebele, null),
});

/** Default completion date: Sene 30 of the contract's fiscal year. */
const endOfFiscalYear = (fiscalYear) => ({ eth_end_month: 'Sene', eth_end_day: 30, eth_end_year: fiscalYear });

/**
 * Register / edit a construction contract. `shelfProject` (navigation from the
 * Construction-ready shelf handover) pre-fills a new contract.
 */
export default function ProjectFormModal({
  open, editingProject, shelfProject, shelf, fiscalYear, nextContractCode, findShelf, onCancel, onSubmit,
}) {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    if (editingProject) {
      form.setFieldsValue({
        ...editingProject,
        ...locationOf(editingProject),
        contractor_grade: editingProject.contractor_grade || CONTRACTOR_GRADES[0],
        defect_liability_months: editingProject.defect_liability_months || 12,
        ...ethDateFields(editingProject.contract_signing_eth_date, undefined, 'eth_start_'),
        ...ethDateFields(editingProject.planned_completion_eth_date, undefined, 'eth_end_'),
      });
    } else if (shelfProject) {
      const suffix = String(shelfProject.project_code || '').split('-').pop();
      form.setFieldsValue({
        ...NEW_CONTRACT_DEFAULTS,
        fiscal_year: fiscalYear,
        scheme_name: shelfProject.scheme_name,
        project_code: shelfProject.project_code,
        contract_code: suffix ? `CNTR-${fiscalYear.slice(0, 4)}-${suffix}` : nextContractCode,
        scheme_type: shelfProject.scheme_type || NEW_CONTRACT_DEFAULTS.scheme_type,
        funding_source: shelfProject.funding_source || NEW_CONTRACT_DEFAULTS.funding_source,
        command_area_ha: shelfProject.command_area_ha,
        beneficiaries_male: shelfProject.beneficiaries_male,
        beneficiaries_female: shelfProject.beneficiaries_female,
        contract_sum_etb: shelfProject.contract_sum_etb,
        ...locationOf(shelfProject),
        site_progress_notes: shelfProject.notes,
        ...ethDateFields(null, undefined, 'eth_start_'),
        ...endOfFiscalYear(fiscalYear),
      });
    } else {
      form.setFieldsValue({
        ...NEW_CONTRACT_DEFAULTS,
        fiscal_year: fiscalYear,
        contract_code: nextContractCode,
        ...ethDateFields(null, undefined, 'eth_start_'),
        ...endOfFiscalYear(fiscalYear),
      });
    }
  }, [open, editingProject, shelfProject, form, fiscalYear, nextContractCode]);

  // Smart combobox: pre-fill design parameters from an approved shelf scheme.
  const handleSchemeChange = (value) => {
    const matched = findShelf(value);
    if (!matched) return;
    form.setFieldsValue({
      project_code: matched.project_code,
      scheme_type: matched.scheme_type || form.getFieldValue('scheme_type'),
      funding_source: matched.preferred_funding_channel || form.getFieldValue('funding_source'),
      command_area_ha: matched.command_area_ha,
      beneficiaries_male: matched.beneficiaries_male,
      beneficiaries_female: matched.beneficiaries_female,
      contract_sum_etb: matched.handover_details?.allocated_budget_etb || matched.estimated_construction_etb,
      ...locationOf(matched),
    });
    message.info(`Auto-filled parameters from approved shelf scheme (${matched.project_code})`);
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
          <BuildOutlined style={{ color: '#1a5f2c', fontSize: 18 }} />
          <span style={{ fontSize: 15, fontWeight: 700, color: '#1a5f2c' }}>
            {editingProject ? 'Edit Construction Contract Parameters' : 'Register New Construction Project Contract'}
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
      forceRender
    >
      <Form form={form} layout="vertical" size="middle" onFinish={handleFinish}>
        <Divider titlePlacement="start" style={{ ...sectionStyle, margin: '0 0 10px' }}>
          1. Irrigation Scheme Identification & Procurement Source
        </Divider>
        <Row gutter={10}>
          <Col span={16}>
            <Form.Item
              name="scheme_name"
              label="Irrigation Scheme Name (Select Approved Shelf Scheme or Type New)"
              rules={[{ required: true, message: 'Scheme name is required' }]}
              tooltip="Pick an approved shelf project to auto-fill design parameters, or type directly for unlisted contracts."
            >
              <AutoComplete
                placeholder="Select approved shelf project or type scheme name..."
                onChange={handleSchemeChange}
                allowClear
                filterOption={(input, option) => String(option?.value || '').toLowerCase().includes(input.toLowerCase())}
                options={[{
                  label: 'Approved Construction-Ready Shelf Bank',
                  options: shelf.map((s) => ({
                    key: s.id,
                    value: s.scheme_name,
                    label: `${s.scheme_name} (${s.project_code}) — ${s.command_area_ha} Ha`,
                  })),
                }]}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="contract_code" label="Contract Code / Reference" rules={[{ required: true }]}>
              <Input placeholder="e.g. CNTR-2019-01" style={{ fontFamily: 'monospace' }} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={10}>
          <Col span={8}>
            <Form.Item name="project_code" label="Engineering Design Ref" rules={[{ required: true }]}>
              <Input placeholder="e.g. IRR-STD-2019-01" style={{ fontFamily: 'monospace' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="scheme_type" label="Scheme Classification" rules={[{ required: true }]}>
              <Select placeholder="Select Type" options={SCHEME_TYPES.map((t) => ({ value: t.value, label: t.label.split('(')[0] }))} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="funding_source" label="Budget / Funding Program" rules={[{ required: true }]}>
              <Select placeholder="Select Program Source" options={FUNDING_PROGRAMS.map((f) => ({ value: f, label: f.split('(')[0] }))} />
            </Form.Item>
          </Col>
        </Row>

        {/* Auto-populated location attributes */}
        <Form.Item name="zone" hidden><Input /></Form.Item>
        <Form.Item name="woreda" hidden><Input /></Form.Item>
        <Form.Item name="kebele" hidden><Input /></Form.Item>

        <Divider titlePlacement="start" style={sectionStyle}>2. Contractor Classification & Supervisory Authority</Divider>
        <Row gutter={10}>
          <Col span={12}>
            <Form.Item name="contractor_name" label="Awarded Contractor Firm" rules={[{ required: true }]}>
              <Input placeholder="e.g. Amhara Water Works Construction Enterprise" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="contractor_grade" label="Contractor Grade / Capability Tier" rules={[{ required: true }]}>
              <Select placeholder="Select Grade" options={CONTRACTOR_GRADES.map((g) => ({ value: g, label: g }))} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={10}>
          <Col span={12}>
            <Form.Item name="consultant_supervisor" label="Resident Engineer / Supervision Consultant" rules={[{ required: true }]}>
              <Input placeholder="e.g. Tropics Consulting Engineers PLC" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="contract_sum_etb" label="Contract Award Sum (ETB)" rules={[{ required: true }]}>
              <InputNumber min={0} style={{ width: '100%' }} placeholder="ETB" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="defect_liability_months" label="Defect Liability (Months)" rules={[{ required: true }]}>
              <InputNumber min={3} max={36} style={{ width: '100%' }} suffix="Mo" />
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="start" style={sectionStyle}>3. Physical Performance Progress & Command Area</Divider>
        <Row gutter={10}>
          <Col span={8}>
            <Form.Item name="physical_progress_pct" label="Physical Progress (%)" rules={[{ required: true }]}>
              <InputNumber min={0} max={100} style={{ width: '100%' }} suffix="%" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="command_area_ha" label="Irrigable Command Area (Ha)" rules={[{ required: true }]}>
              <InputNumber min={0} style={{ width: '100%' }} suffix="Ha" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="fiscal_year" label="Fiscal Year (E.C.)" rules={[{ required: true }]}>
              <Select placeholder="Fiscal Year" options={ETHIOPIAN_FISCAL_YEARS.map((fy) => ({ value: fy, label: fy }))} />
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="start" style={sectionStyle}>4. Target Beneficiaries & Construction Timeline</Divider>
        <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 12 }}>
          <Row gutter={10} align="middle">
            <Col span={8}>
              <Form.Item name="beneficiaries_male" label="Male Farmers" rules={[{ required: true }]} style={{ marginBottom: 0 }}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="beneficiaries_female" label="Female Farmers" rules={[{ required: true }]} style={{ marginBottom: 0 }}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <ComputedTotal fields={['beneficiaries_male', 'beneficiaries_female']} label="Total Farmers" suffix="Farmers" />
            </Col>
          </Row>
        </div>
        <Row gutter={10}>
          <Col span={12}>
            <EthDateFields label="Site Commencement Date (E.C.)" prefix="eth_start_" />
          </Col>
          <Col span={12}>
            <EthDateFields label="Target Contract Completion Date (E.C.)" prefix="eth_end_" />
          </Col>
        </Row>
        <Form.Item name="site_progress_notes" label="Site Execution & Engineering Progress Remarks" style={{ marginBottom: 0 }}>
          <TextArea rows={2} placeholder="Detail headwork concrete pouring, canal excavation, sluice gate installation, or right-of-way issues..." />
        </Form.Item>
      </Form>
    </Modal>
  );
}


// --- EvaluateProgressModal ---

/**
 * Evaluate a contract's site progress (physical / financial / WBS quantities).
 * The server stores the evaluation on the contract and as a progress-log entry.
 */
export function EvaluateProgressModal({ project, onCancel, onSubmit }) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const open = Boolean(project);

  useEffect(() => {
    if (!project) return;
    form.resetFields();
    form.setFieldsValue({
      planned_progress_pct: project.planned_progress_pct ?? project.physical_progress_pct ?? 0,
      physical_progress_pct: project.physical_progress_pct ?? 0,
      financial_progress_pct: project.financial_progress_pct ?? 0,
      weir_concreting_pct: project.weir_concreting_pct ?? 0,
      canal_excavation_pct: project.canal_excavation_pct ?? 0,
      canal_lining_km: project.canal_lining_km ?? 0,
      // Targets are not known until the first evaluation; the engineer enters them.
      target_canal_lining_km: project.target_canal_lining_km ?? null,
      gates_installed_count: project.gates_installed_count ?? 0,
      target_gates_count: project.target_gates_count ?? null,
      health_status: project.health_status || 'On Track',
      resident_engineer: project.resident_engineer || project.consultant_supervisor,
      site_progress_notes: project.site_progress_notes,
      ...ethDateFields(null),
    });
  }, [project, form]);

  const handleFinish = async (values) => {
    setSubmitting(true);
    const saved = await onSubmit(project, values, form);
    setSubmitting(false);
    if (saved) onCancel();
  };

  return (
    <Modal
      title={(
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <LineChartOutlined style={{ color: '#1a5f2c', fontSize: 18 }} />
          <span style={{ fontSize: 15, fontWeight: 700, color: '#1a5f2c' }}>
            Evaluate Progress & Log Site Inspection: {project?.scheme_name}
          </span>
        </div>
      )}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText="Save Progress Evaluation"
      okButtonProps={{ style: { backgroundColor: '#1a5f2c', borderColor: '#1a5f2c' } }}
      confirmLoading={submitting}
      width={720}
      destroyOnHidden
      forceRender
    >
      <Form form={form} layout="vertical" size="middle" onFinish={handleFinish}>
        {project && (
          <div style={{ background: '#f6ffed', border: '1px solid #d1d5db', padding: '10px 14px', borderRadius: 8, marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span>Contract: <strong style={{ color: '#1a5f2c' }}>{project.contract_code}</strong> ({project.scheme_type})</span>
              <span>Command: <strong>{toNumber(project.command_area_ha).toLocaleString()} Ha</strong></span>
            </div>
            <div style={{ fontSize: 11, color: '#595959', marginTop: 4 }}>
              Contractor: <strong>{project.contractor_name}</strong> | Supervisor: {project.consultant_supervisor}
            </div>
          </div>
        )}

        <Divider titlePlacement="start" style={{ ...sectionStyle, margin: '0 0 10px' }}>
          1. Physical vs Financial Execution Percentages
        </Divider>
        <Row gutter={10}>
          <Col span={8}>
            <Form.Item name="physical_progress_pct" label="Actual Physical Progress (%)" rules={[{ required: true }]}>
              <InputNumber min={0} max={100} style={{ width: '100%' }} suffix="%" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="planned_progress_pct" label="Planned Target Schedule (%)" rules={[{ required: true }]}>
              <InputNumber min={0} max={100} style={{ width: '100%' }} suffix="%" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="financial_progress_pct" label="Financial Disbursed (%)" rules={[{ required: true }]}>
              <InputNumber min={0} max={100} style={{ width: '100%' }} suffix="%" />
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="start" style={sectionStyle}>2. Work-Breakdown Structure (WBS) Physical Delivery</Divider>
        <Row gutter={10}>
          <Col span={8}>
            <Form.Item name="weir_concreting_pct" label="Weir Concreting Progress (%)" rules={[{ required: true }]}>
              <InputNumber min={0} max={100} style={{ width: '100%' }} suffix="%" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="canal_lining_km" label="Lined Canal Completed (km)" rules={[{ required: true }]}>
              <InputNumber min={0} style={{ width: '100%' }} suffix="km" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="target_canal_lining_km" label="Total Planned Canal (km)" rules={[{ required: true }]}>
              <InputNumber min={0} style={{ width: '100%' }} suffix="km" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={10}>
          <Col span={8}>
            <Form.Item name="canal_excavation_pct" label="Canal Excavation (%)" rules={[{ required: true }]}>
              <InputNumber min={0} max={100} style={{ width: '100%' }} suffix="%" />
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

        <Divider titlePlacement="start" style={sectionStyle}>3. Schedule Health, Inspection Date & Resident Engineer</Divider>
        <Row gutter={10}>
          <Col span={8}>
            <Form.Item name="health_status" label="Progress Schedule Health" rules={[{ required: true }]}>
              <Select options={PROGRESS_HEALTH_STATUSES.map((h) => ({ value: h.value, label: h.label }))} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="resident_engineer" label="Supervising Resident Engineer" rules={[{ required: true }]}>
              <Input placeholder="Resident Engineer Name" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <EthDateFields label="Inspection Date (E.C.)" />
          </Col>
        </Row>
        <Form.Item name="site_progress_notes" label="Engineer Field Progress Observations" style={{ marginBottom: 0 }}>
          <TextArea rows={2} placeholder="Detail headwork curing, precast panel delivery, excavation dewatering, or local labor availability..." />
        </Form.Item>
      </Form>
    </Modal>
  );
}
