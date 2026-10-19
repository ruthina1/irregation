import { useEffect, useState } from 'react';
import { Col, Form, Input, InputNumber, Modal, Row, Select } from 'antd';
import { BuildOutlined } from '@ant-design/icons';
import { toNumber } from '../../shared/utils';
import { PROCUREMENT_METHODS } from './ConstructionReadyDesignsManagement';

const { TextArea } = Input;

/** Hand a shelf design over to the Construction & Monitoring Directorate. */
export default function ConstructionReadyDesignsForm({ record, onCancel, onSubmit }) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!record) return;
    form.resetFields();
    form.setFieldsValue({
      procurement_method: 'National Competitive Bidding (NCB)',
      executing_client: 'Regional Irrigation & Water Resources Bureau',
      allocated_budget_etb: record.estimated_construction_etb,
      handover_notes: `Packaged tender dossier, priced BoQ (${(toNumber(record.estimated_construction_etb) / 1000000).toFixed(1)}M ETB), and stamped drawings ready.`,
    });
  }, [record, form]);

  const handleFinish = async (values) => {
    setSubmitting(true);
    const done = await onSubmit(record, values, form);
    setSubmitting(false);
    if (done) onCancel();
  };

  return (
    <Modal
      title={(
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <BuildOutlined style={{ color: '#1a5f2c', fontSize: 18 }} />
          <span style={{ fontSize: 15, fontWeight: 700, color: '#1a5f2c' }}>Handover Scheme to Construction & Monitoring Directorate</span>
        </div>
      )}
      open={Boolean(record)}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={submitting}
      okText="Complete Handover & Initialize Contract"
      okButtonProps={{ style: { backgroundColor: '#1a5f2c', borderColor: '#1a5f2c' } }}
      width={580}
      destroyOnHidden
      forceRender
    >
      <Form form={form} layout="vertical" size="middle" onFinish={handleFinish} style={{ marginTop: 12 }}>
        {record && (
          <div style={{ background: '#f6ffed', border: '1px solid #d1d5db', padding: '10px 14px', borderRadius: 8, marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span>Scheme: <strong style={{ color: '#1a5f2c' }}>{record.scheme_name}</strong></span>
              <span>Command: <strong>{toNumber(record.command_area_ha).toLocaleString()} Ha</strong></span>
            </div>
            <div style={{ fontSize: 11, color: '#595959', marginTop: 4 }}>
              Estimated Cost: <strong style={{ color: '#5b8a6b' }}>{(toNumber(record.estimated_construction_etb) / 1000000).toFixed(1)} M ETB</strong> | QA Cert: {record.qa_certificate_no}
            </div>
          </div>
        )}
        <Row gutter={10}>
          <Col span={12}>
            <Form.Item name="procurement_method" label="Procurement / Contracting Method" rules={[{ required: true }]}>
              <Select options={PROCUREMENT_METHODS} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="executing_client" label="Executing Client Agency" rules={[{ required: true }]}>
              <Input placeholder="Client Agency" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="allocated_budget_etb" label="Approved Construction Contract Budget (ETB)" rules={[{ required: true }]}>
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="handover_notes" label="Handover Transmittal Remarks & Directives">
          <TextArea rows={3} placeholder="Confirm completion of land acquisition, WUA consultation, tender notice release date..." />
        </Form.Item>
      </Form>
    </Modal>
  );
}
