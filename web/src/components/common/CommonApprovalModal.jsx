import React, { useEffect } from 'react';
import { Modal, Form, Radio, Input, Alert, Typography } from 'antd';

const { Text } = Typography;

export default function CommonApprovalModal({ 
  open, 
  onCancel, 
  onSubmit, 
  isSubmitting, 
  title = "Process Approval",
  itemName = "this item",
  entityId = null,
  initialStatus = 'Pending',
  initialRemarks = ''
}) {
  const [form] = Form.useForm();
  const selectedStatus = Form.useWatch('status', form);

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        status: initialStatus !== 'Pending' ? initialStatus : 'Approved', 
        remarks: initialRemarks || '',
      });
    } else {
      form.resetFields();
    }
  }, [open, initialStatus, initialRemarks, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(entityId, values);
    } catch (error) {
      // Validation failed (handled visually by AntD)
    }
  };

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={isSubmitting}
      okText="Save Approval"
      destroyOnClose
      okButtonProps={{ 
        danger: selectedStatus === 'Rejected',
        style: selectedStatus === 'Approved' ? { backgroundColor: '#1a5f2c' } : {}
      }}
    >
      <Alert 
        message="Approval Action" 
        description={<>Reviewing data for: <Text strong>{itemName}</Text></>}
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
              message: 'Remarks are mandatory when rejecting.' 
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