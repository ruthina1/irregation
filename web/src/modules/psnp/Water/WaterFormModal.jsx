import React, { useEffect, useState } from 'react';
import { Modal, Form, Select, Row, Col, InputNumber, Switch, DatePicker, Divider, message } from 'antd';
import dayjs from 'dayjs';
import api from '../../../services/axios';

const { Option } = Select;

export default function WaterFormModal({ open, onCancel, onSubmit, editingData }) {
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
          is_water_available_year_round: false 
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
        is_water_available_year_round: !!vals.is_water_available_year_round,
      };
      
      // IF THE PARENT COMPONENT CATCHES THE ERROR, THIS WONT TRIGGER THE CATCH BLOCK BELOW
      // We log the payload so you can see exactly what React is sending
      console.log("SENDING PAYLOAD TO LARAVEL:", payload);
      
      await onSubmit(payload);
      
    } catch (e) {
      // IF YOU REACH HERE, IT MEANS FORM VALIDATION FAILED IN REACT
      if (e.errorFields) {
        message.warning("Please fill in all required fields.");
      }
    }
  };

  return (
    <Modal 
      title={editingData ? "Edit Safe Water Profile" : "New Safe Water Assessment"} 
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

        <Divider orientation="left">Water Source Detail & Accessibility</Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="primary_source" label="Primary Drinking Source" rules={[{ required: true, message: 'Primary source is required' }]}>
              <Select placeholder="Select source">
                <Option value="Piped">Piped Water (Bono)</Option>
                <Option value="Protected Spring">Protected Spring</Option>
                <Option value="Protected Well">Protected Well</Option>
                <Option value="Unprotected Spring">Unprotected Spring (Risk)</Option>
                <Option value="River/Pond">River / Pond (Risk)</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="distance_minutes" label="Round-trip Distance (Minutes)" rules={[{ required: true, message: 'Distance is required' }]}>
              <InputNumber style={{ width: '100%' }} min={0} placeholder="e.g. 30" />
            </Form.Item>
          </Col>
        </Row>
        
        <Divider orientation="left">Water Treatment & Reliability</Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="treatment_method" label="Household Treatment Method" rules={[{ required: true, message: 'Treatment method is required' }]}>
              <Select placeholder="Select method">
                <Option value="None">None</Option>
                <Option value="Boiling">Boiling</Option>
                <Option value="Chlorine/Wuha Agar">Chlorine / Wuha Agar</Option>
                <Option value="Filtering">Filtering</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="is_water_available_year_round" label="Available Year-Round?" valuePropName="checked">
              <Switch checkedChildren="Yes" unCheckedChildren="No" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}