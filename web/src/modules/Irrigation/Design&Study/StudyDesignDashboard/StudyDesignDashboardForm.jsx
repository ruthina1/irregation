import React from 'react';
import { Form, Input, Modal } from 'antd';

export default function StudyDesignDashboardForm({ open, onCancel, onSubmit }) {
  const [form] = Form.useForm();
  return (
    <Modal title="Configure Dashboard Parameters" open={open} onCancel={onCancel} onOk={() => form.submit()}>
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <Form.Item name="notes" label="Executive Notes">
          <Input.TextArea rows={3} placeholder="Add strategic notes..." />
        </Form.Item>
      </Form>
    </Modal>
  );
}
