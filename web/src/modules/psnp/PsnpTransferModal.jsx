import React, { useEffect } from 'react';
import { Modal, Form, Select, Input, InputNumber, DatePicker, message, Row, Col } from 'antd';
import { psnpApi } from '../../services/api/psnpApi';

const { Option } = Select;

export default function PsnpTransferModal({ open, onCancel, household, refresh }) {
  const [form] = Form.useForm();
  const transferType = Form.useWatch('transfer_type', form);

  useEffect(() => {
    if (open && household) {
      form.resetFields();
      form.setFieldsValue({ 
        psnp_household_id: household.id, 
        transfer_type: 'Both' 
      });
    }
  }, [open, household, form]);

  const handleSubmit = async () => {
    try {
      const vals = await form.validateFields();
      
      // Format date for the database
      vals.transfer_date = vals.transfer_date.format('YYYY-MM-DD');
      
      // Strict alignment with database: Nullify unused values based on type
      if (vals.transfer_type === 'Cash') vals.amount_metric_tons = null;
      if (vals.transfer_type === 'Grain') vals.amount_birr = null;

      await psnpApi.createTransfer(vals);
      message.success('Transfer recorded successfully');
      onCancel(); 
      refresh();
    } catch (e) {
      // Validation or API errors are usually caught here
    }
  };

  return (
    <Modal 
      title={`Record Transfer for ${household?.farmer?.full_name}`} 
      open={open} 
      onCancel={onCancel} 
      onOk={handleSubmit}
      okText="Record Transfer"
    >
      <Form form={form} layout="vertical">
        <Form.Item name="psnp_household_id" hidden><Input /></Form.Item>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="transfer_month_cycle" label="Cycle / Month (e.g. Oct 2023)" rules={[{ required: true }]}>
              <Input placeholder="e.g. Month 1 or Cycle 1" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="transfer_date" label="Transfer Date" rules={[{ required: true }]}>
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="transfer_type" label="Transfer Type" rules={[{ required: true }]}>
              <Select>
                <Option value="Cash">Cash Only</Option>
                <Option value="Grain">Grain Only</Option>
                <Option value="Both">Both Cash & Grain</Option>
              </Select>
            </Form.Item>
          </Col>

          {/* Conditionally Render and Validate Amounts */}
          {(transferType === 'Cash' || transferType === 'Both') && (
            <Col span={12}>
              <Form.Item 
                name="amount_birr" 
                label="Amount (Birr)" 
                rules={[{ required: true, message: 'Cash amount is required' }]}
              >
                <InputNumber style={{ width: '100%' }} min={0} step={0.01} />
              </Form.Item>
            </Col>
          )}

          {(transferType === 'Grain' || transferType === 'Both') && (
            <Col span={12}>
              <Form.Item 
                name="amount_metric_tons" 
                label="Grain (Metric Tons)" 
                rules={[{ required: true, message: 'Grain amount is required' }]}
              >
                <InputNumber style={{ width: '100%' }} step={0.0001} min={0} />
              </Form.Item>
            </Col>
          )}
        </Row>
      </Form>
    </Modal>
  );
}