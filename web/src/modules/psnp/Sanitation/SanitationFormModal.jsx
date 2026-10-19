import React, { useEffect, useState } from 'react';
import { Modal, Form, Select, Row, Col, Switch, DatePicker, Divider } from 'antd';
import dayjs from 'dayjs';
import api from '../../../services/axios';

const { Option } = Select;

export default function SanitationFormModal({ open, onCancel, onSubmit, editingData }) {
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
        form.setFieldsValue({ assessment_date: dayjs() });
      }
    }
  }, [open, editingData, form]);

  return (
    <Modal 
      title={editingData ? "Edit Sanitation Profile" : "New Sanitation Assessment"} 
      open={open} 
      onCancel={onCancel} 
      onOk={() => form.validateFields().then(onSubmit)} 
      width={750} 
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={16}>
            <Form.Item name="farmer_id" label="Household Head / Farmer" rules={[{required:true, message:'Select household'}]}>
              <Select showSearch optionFilterProp="children" disabled={!!editingData}>
                {farmers.map(f => <Option key={f.id} value={f.id}>{f.full_name}</Option>)}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="assessment_date" label="Assessment Date" rules={[{required:true}]}>
              <DatePicker style={{width:'100%'}} />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">Household Latrine Infrastructure</Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="latrine_type" label="Primary Latrine Type" rules={[{required:true}]}>
              <Select>
                <Option value="Improved Pit Latrine with Slab">Improved Pit Latrine with Slab</Option>
                <Option value="Traditional Pit Latrine">Traditional Pit Latrine</Option>
                <Option value="Flush/VIP">Flush / VIP Latrine</Option>
                <Option value="None (Open Defecation)">None (Open Defecation)</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="is_shared_with_others" label="Shared Latrine?" valuePropName="checked">
              <Switch checkedChildren="Shared" unCheckedChildren="Private" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="is_odf_compliant" label="ODF Certified?" tooltip="Household is Open Defecation Free" valuePropName="checked">
              <Switch 
                checkedChildren="Yes" 
                unCheckedChildren="No" 
                style={{ background: form.getFieldValue('is_odf_compliant') ? '#52c41a' : undefined }} 
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}