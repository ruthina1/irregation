import React, { useEffect, useState } from 'react';
import { AutoComplete, Button, Col, Divider, Form, Input, InputNumber, Modal, Row, Select, Space, Tag } from 'antd';
import { ExperimentOutlined, PlusCircleOutlined, SendOutlined } from '@ant-design/icons';
import ComputedTotal from '../../shared/components/ComputedTotal';
import EthDateFields from '../../shared/components/EthDateFields';
import { ETHIOPIAN_FISCAL_YEARS } from '../../shared/constants';
import { ethDateFields, extractName, toNumber } from '../../shared/utils';
import {
  CROPPING_ROUNDS, FUNDING_PROGRAMS, findInputOption, INPUT_NAME_OPTIONS, INPUT_UNITS, IRRIGATION_SEASONS,
  NEW_ALLOCATION_DEFAULTS, deliveryPercent,
} from './AgriculturalInputUtilizationManagement';

const sectionStyle = { margin: '6px 0 10px', fontSize: 12, color: '#1a5f2c', fontWeight: 600 };
const toOptions = (list) => list.map((v) => ({ value: v, label: v }));
const matchOption = (input, option) => (option?.value || '').toLowerCase().includes(input.toLowerCase());

/** Register / edit an input allocation plan (dispatch totals stay server-owned). */
function AllocationFormModal({ open, editingRecord, fiscalYear, nextCode, locations, onCancel, onSubmit }) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const zone = Form.useWatch('zone', form);
  const woreda = Form.useWatch('woreda', form);
  const inputName = Form.useWatch('input_name', form);

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    if (editingRecord) {
      form.setFieldsValue({
        ...editingRecord,
        zone: extractName(editingRecord.zone, undefined),
        woreda: extractName(editingRecord.woreda, undefined),
        kebele: extractName(editingRecord.kebele, undefined),
      });
    } else {
      form.setFieldsValue({ ...NEW_ALLOCATION_DEFAULTS, fiscal_year: fiscalYear, input_code: nextCode });
    }
  }, [open, editingRecord, form, fiscalYear, nextCode]);

  const handleInputNameSelect = (value) => {
    const matched = findInputOption(value);
    form.setFieldsValue({ unit: matched.defaultUnit, specification: matched.subTypes[0] });
  };

  const handleFinish = async (values) => {
    setSubmitting(true);
    const saved = await onSubmit(values, form);
    setSubmitting(false);
    if (saved) onCancel();
  };

  const woredas = locations[zone] || {};
  const kebeles = woredas[woreda] || [];

  return (
    <Modal
      title={(
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ExperimentOutlined style={{ color: '#1a5f2c', fontSize: 18 }} />
          <span style={{ fontSize: 15, fontWeight: 700, color: '#1a5f2c' }}>
            {editingRecord ? 'Edit Input Allocation Record' : 'Register Input Allocation Plan'}
          </span>
        </div>
      )}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={submitting}
      width={680}
      style={{ top: 24 }}
      styles={{ body: { padding: '16px 20px', maxHeight: '80vh', overflowY: 'auto' } }}
      destroyOnHidden
      forceRender
    >
      <Form form={form} layout="vertical" size="middle" onFinish={handleFinish}>
        <Divider titlePlacement="start" style={{ ...sectionStyle, margin: '0 0 10px' }}>
          1. Administrative Station & Campaign Scope
        </Divider>
        <Row gutter={10}>
          <Col span={8}>
            <Form.Item name="zone" label="Zone" rules={[{ required: true, message: 'Zone is required' }]}>
              <AutoComplete
                placeholder="Select or type zone"
                allowClear
                options={toOptions(Object.keys(locations))}
                filterOption={matchOption}
                onChange={() => form.setFieldsValue({ woreda: undefined, kebele: undefined })}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="woreda" label="Woreda" rules={[{ required: true, message: 'Woreda is required' }]}>
              <AutoComplete
                placeholder="Select or type woreda"
                allowClear
                options={toOptions(Object.keys(woredas))}
                filterOption={matchOption}
                onChange={() => form.setFieldsValue({ kebele: undefined })}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="kebele" label="Kebele" rules={[{ required: true, message: 'Kebele is required' }]}>
              <AutoComplete placeholder="Select or type kebele" allowClear options={toOptions(kebeles)} filterOption={matchOption} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={10}>
          <Col span={8}>
            <Form.Item name="fiscal_year" label="Fiscal Year (E.C.)" rules={[{ required: true }]}>
              <Select placeholder="Select Fiscal Year" options={toOptions(ETHIOPIAN_FISCAL_YEARS)} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="irrigation_season" label="Irrigation Season" rules={[{ required: true }]}>
              <Select placeholder="Select Season" options={IRRIGATION_SEASONS} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="cropping_round" label="Cropping Round" rules={[{ required: true }]}>
              <Select placeholder="Select Round" options={toOptions(CROPPING_ROUNDS)} />
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="start" style={sectionStyle}>2. Input Identification & Target Allocation</Divider>
        <Row gutter={10}>
          <Col span={6}>
            <Form.Item name="input_code" label="Tracking Code" rules={[{ required: true, message: 'Code required' }]}>
              <Input placeholder="e.g. INP-01" style={{ fontFamily: 'monospace' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="input_name" label="Input Name" rules={[{ required: true, message: 'Input name required' }]}>
              <Select
                onChange={handleInputNameSelect}
                placeholder="Select Input Name"
                options={INPUT_NAME_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="specification" label="Specification / Variety" rules={[{ required: true }]}>
              <AutoComplete
                placeholder="Select or type specification"
                options={toOptions(findInputOption(inputName).subTypes)}
                filterOption={matchOption}
              />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item name="unit" label="Unit" rules={[{ required: true }]}>
              <Select options={INPUT_UNITS} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={10}>
          <Col span={8}>
            <Form.Item name="planned_target_qty" label="Planned Target Quantity" rules={[{ required: true }]}>
              <InputNumber min={0} style={{ width: '100%' }} placeholder="0.00" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="covered_hectares" label="Covered Land (Ha)" rules={[{ required: true }]}>
              <InputNumber min={0} style={{ width: '100%' }} suffix="Ha" placeholder="0.00" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="funding_program" label="Funding Source" rules={[{ required: true }]}>
              <Select placeholder="Select Program" options={toOptions(FUNDING_PROGRAMS)} />
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="start" style={sectionStyle}>3. Target Beneficiaries (Gender Disaggregated)</Divider>
        <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
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
              <ComputedTotal fields={['beneficiaries_male', 'beneficiaries_female']} label="Total Beneficiaries" suffix="Farmers" />
            </Col>
          </Row>
        </div>
      </Form>
    </Modal>
  );
}









/** Log a dispatched / applied quantity against an allocation. */
function DispatchModal({ record, onCancel, onSubmit }) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!record) return;
    form.resetFields();
    form.setFieldsValue(ethDateFields(null));
  }, [record, form]);

  const handleFinish = async (values) => {
    setSubmitting(true);
    const done = await onSubmit(record, values, form);
    setSubmitting(false);
    if (done) onCancel();
  };

  const remaining = record ? Math.max(0, toNumber(record.planned_target_qty) - toNumber(record.distributed_qty)) : 0;

  return (
    <Modal
      title={(
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SendOutlined style={{ color: '#1a5f2c', fontSize: 18 }} />
          <span style={{ fontSize: 15, fontWeight: 700, color: '#1a5f2c' }}>Log Dispatched / Applied Quantity</span>
        </div>
      )}
      open={Boolean(record)}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={submitting}
      width={520}
      destroyOnHidden
      forceRender
    >
      <Form form={form} layout="vertical" onFinish={handleFinish} style={{ marginTop: 12 }}>
        {record && (
          <div style={{ background: '#f6ffed', border: '1px solid #d1d5db', padding: '10px 14px', borderRadius: 8, marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span>Item: <strong style={{ color: '#1a5f2c' }}>{record.item_name}</strong></span>
              <span>Planned Target: <strong>{toNumber(record.planned_target_qty).toLocaleString()} {record.unit}</strong></span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#595959', marginTop: 4 }}>
              <span>
                Currently Dispatched: <strong style={{ color: '#a16207' }}>{toNumber(record.distributed_qty).toLocaleString()}</strong> {record.unit} ({deliveryPercent(record)}%)
              </span>
              <span>
                Remaining: <strong style={{ color: remaining > 0 ? '#5b8a6b' : '#2f7d4a' }}>{remaining.toLocaleString()} {record.unit}</strong>
              </span>
            </div>
          </div>
        )}

        <Form.Item
          name="dispatch_qty"
          label={`Dispatched Quantity to Add (${record?.unit || ''})`}
          rules={[
            { required: true, message: 'Please enter dispatched quantity' },
            {
              validator: (_, value) => (value !== undefined && value !== null && Number(value) <= 0
                ? Promise.reject(new Error('Quantity must be greater than 0'))
                : Promise.resolve()),
            },
          ]}
        >
          <InputNumber min={0} style={{ width: '100%' }} placeholder={`Enter quantity in ${record?.unit || 'units'}`} />
        </Form.Item>

        <EthDateFields label="Dispatched Date (Ethiopian Calendar)" />

        <Form.Item
          name="recipient"
          label="Recipient Entity / Cooperative"
          rules={[{ required: true, message: 'Please enter recipient organization or WUA' }]}
        >
          <Input placeholder="e.g. Merawi Water Users Association / Woreda Primary Store" />
        </Form.Item>
        <Form.Item name="notes" label="Dispatch Notes / Voucher Reference">
          <Input placeholder="e.g. Store Issue Voucher #4412 / Transport Delivery Note" />
        </Form.Item>
      </Form>
    </Modal>
  );
}


export { DispatchModal };

export default function AgriculturalInputUtilizationForm({
  open, editingRecord, fiscalYear, nextCode, locations, onCancel, onSubmit,
  dispatchRecord, onCancelDispatch, onSubmitDispatch,
}) {
  return (
    <>
      <AllocationFormModal
        open={open}
        editingRecord={editingRecord}
        fiscalYear={fiscalYear}
        nextCode={nextCode}
        locations={locations}
        onCancel={onCancel}
        onSubmit={onSubmit}
      />
      {dispatchRecord && (
        <DispatchModal
          record={dispatchRecord}
          onCancel={onCancelDispatch}
          onSubmit={onSubmitDispatch}
        />
      )}
    </>
  );
}
