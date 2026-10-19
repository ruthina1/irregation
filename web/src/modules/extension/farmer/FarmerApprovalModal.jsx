import React, { useEffect } from 'react';
import { Modal, Form, Radio, Input, Alert, Typography } from 'antd';

const { Text } = Typography;

export default function FarmerApprovalModal({ open, onCancel, onSubmit, farmer, isSubmitting }) {
  const [form] = Form.useForm();
  
  // Watch the status field to conditionally require remarks
  const selectedStatus = Form.useWatch('status', form);

  useEffect(() => {
    if (open && farmer) {
      form.setFieldsValue({
        // Default to Approved if it's currently Pending
        status: farmer.status !== 'Pending' ? farmer.status : 'Approved', 
        remarks: farmer.approval?.remarks || '',
      });
    } else {
      form.resetFields();
    }
  }, [open, farmer, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(farmer.id, values);
    } catch (error) {
      // Validation failed (handled by AntD)
    }
  };

  return (
    <Modal
      title={`Process Approval: ${farmer?.full_name || ''}`}
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={isSubmitting}
      okText="Save Approval"
      okButtonProps={{ 
        danger: selectedStatus === 'Rejected',
        style: selectedStatus === 'Approved' ? { backgroundColor: '#1a5f2c' } : {}
      }}
    >
      <Alert 
        message="Approval Action" 
        description={<>Reviewing data for Farmer ID: <Text strong>{farmer?.farmer_unique_id_no}</Text></>}
        type="info" 
        showIcon 
        style={{ marginBottom: 16 }} 
      />

      <Form form={form} layout="vertical">
        <Form.Item
          name="status"
          label="Approval Status"
          rules={[{ required: true, message: 'Please select a status' }]}
        >
          <Radio.Group buttonStyle="solid">
            <Radio.Button value="Approved">Approve</Radio.Button>
            <Radio.Button value="Rejected">Reject</Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="remarks"
          label="Remarks / Reason"
          rules={[
            { 
              required: selectedStatus === 'Rejected', 
              message: 'Remarks are mandatory when rejecting a registration.' 
            }
          ]}
        >
          <Input.TextArea 
            rows={4} 
            placeholder={selectedStatus === 'Rejected' ? "Please explain why this data is rejected..." : "Optional remarks..."} 
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}