import React, { useEffect, useState } from 'react';
import { Modal, Form, Select, Row, Col, Switch, DatePicker, Divider, message } from 'antd';
import dayjs from 'dayjs';
import api from '../../../services/axios';

const { Option } = Select;

export default function HygieneFormModal({ open, onCancel, onSubmit, editingData }) {
  const [form] = Form.useForm();
  const [farmers, setFarmers] = useState([]);

  useEffect(() => {
    if (open) {
      api.get('/extension/farmers').then(res => setFarmers(res.data.data.data || []));
      
      if (editingData) {
        form.setFieldsValue({
          ...editingData,
          assessment_date: dayjs(editingData.assessment_date),
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ 
          assessment_date: dayjs(),
          has_handwashing_facility_near_latrine: false,
          has_soap_or_ash: false,
          safe_water_storage_practice: false,
          critical_handwashing_times: [] // Default to empty array
        });
      }
    }
  }, [open, editingData, form]);

  const handleOk = async () => {
    try {
      const vals = await form.validateFields();
      
      const payload = {
        ...vals,
        assessment_date: vals.assessment_date ? vals.assessment_date.format('YYYY-MM-DD') : null,
        has_handwashing_facility_near_latrine: !!vals.has_handwashing_facility_near_latrine,
        has_soap_or_ash: !!vals.has_soap_or_ash,
        safe_water_storage_practice: !!vals.safe_water_storage_practice,
        critical_handwashing_times: vals.critical_handwashing_times || []
      };
      
      await onSubmit(payload);
    } catch (e) {
      // If it's an API error from Laravel, show the exact reason
      if (e.response && e.response.data && e.response.data.errors) {
        const errorMessages = Object.values(e.response.data.errors).flat().join(', ');
        message.error(`Validation Error: ${errorMessages}`);
      } else if (e.errorFields) {
        // Form validation error
        message.warning("Please fill in all required fields.");
      } else {
        console.error("Save Error", e);
      }
    }
  };

  return (
    <Modal 
      title={editingData ? "Edit Hygiene Profile" : "New Hygiene Assessment"} 
      open={open} 
      onCancel={onCancel} 
      onOk={handleOk} 
      width={750} 
      destroyOnClose 
      maskClosable={false}
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={16}>
            <Form.Item name="farmer_id" label="Household Head / Farmer" rules={[{ required: true, message: 'Please select a household' }]}>
              <Select showSearch optionFilterProp="children" disabled={!!editingData}>
                {farmers.map(f => <Option key={f.id} value={f.id}>{f.full_name} ({f.farmer_unique_id_no})</Option>)}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="assessment_date" label="Assessment Date" rules={[{ required: true, message: 'Date is required' }]}>
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">Handwashing Infrastructure & Safety</Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="has_handwashing_facility_near_latrine" label="Handwashing Facility near Latrine?" valuePropName="checked">
              <Switch checkedChildren="Yes" unCheckedChildren="No" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="has_soap_or_ash" label="Soap or Ash Present?" tooltip="Required for effective handwashing" valuePropName="checked">
              <Switch checkedChildren="Available" unCheckedChildren="Not Available" />
            </Form.Item>
          </Col>
        </Row>
        
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name="critical_handwashing_times" label="Reported Critical Handwashing Times">
              <Select mode="multiple" placeholder="Select critical times observed/reported" allowClear>
                <Option value="Before Eating">Before Eating</Option>
                <Option value="After using toilet">After using toilet</Option>
                <Option value="Before feeding child">Before feeding child</Option>
                <Option value="Before food preparation">Before food preparation</Option>
                <Option value="After cleaning child feces">After cleaning child feces</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">Safe Drinking Water Storage</Divider>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name="safe_water_storage_practice" label="Safe Water Storage Practice Observed?" tooltip="e.g., Jerricans/Containers covered securely and kept away from contamination" valuePropName="checked">
              <Switch checkedChildren="Safe Storage Observed" unCheckedChildren="Poor Practice" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}