import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Radio, Row, Col, Divider, message, Alert } from 'antd';
import { MessageOutlined, EnvironmentOutlined, UserOutlined, GlobalOutlined } from '@ant-design/icons';
import { APP_ROLES } from '../../constants/roles'; 
import api from  '../../services/axios'; 

// IMPORT FROM THE NEW SEPARATE API FILE
import { communicationApi } from '../../services/api/communicationApi'; 

const { TextArea } = Input;

export default function SmsModal({ open, onCancel, onSuccess }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [targetType, setTargetType] = useState('all');

  // Location States
  const [zones, setZones] = useState([]);
  const [woredas, setWoredas] = useState([]);
  const [kebeles, setKebeles] = useState([]);

  useEffect(() => {
    if (open) {
      form.resetFields();
      setTargetType('all');
      fetchZones();
    }
  }, [open, form]);

  const fetchZones = async () => {
    try { const res = await api.get('/zones'); setZones(res.data); } 
    catch (e) { message.error("Failed to load Zones"); }
  };

  const fetchWoredas = async (zoneId) => {
    try { const res = await api.get(`/woredas?zone_id=${zoneId}`); setWoredas(res.data); } 
    catch (e) { message.error("Failed to load Woredas"); }
  };

  const fetchKebeles = async (woredaId) => {
    try { const res = await api.get(`/kebeles?woreda_id=${woredaId}`); setKebeles(res.data); } 
    catch (e) { message.error("Failed to load Kebeles"); }
  };

  const handleTargetChange = (e) => {
    setTargetType(e.target.value);
    form.setFieldsValue({ target_type: e.target.value });
  };

  const handleSend = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      // USE THE NEW COMMUNICATION API HERE
      const response = await communicationApi.sendBulkSms(values);
      
      message.success(response.data.message);
      onSuccess(); // Refresh the table in the dashboard
      onCancel();  // Close modal
    } catch (error) {
      if (error.response?.status === 404) {
        message.warning(error.response.data.message);
      } else {
        message.error("SMS Failed: " + (error.response?.data?.message || "Check network/API balance."));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    // ... Exactly the same Modal UI from the previous step ...
    <Modal
      title={
        <span style={{ fontFamily: "'Times New Roman', Times, serif", fontWeight: 'bold' }}>
          <MessageOutlined style={{ color: '#039c33', marginRight: 8 }} />
          Live Broadcast SMS Alert
        </span>
      }
      open={open}
      onOk={handleSend}
      onCancel={onCancel}
      confirmLoading={loading}
      okText="Send Live SMS"
      okButtonProps={{ style: { backgroundColor: '#039c33' } }}
      width={650}
      destroyOnClose
    >
      <Alert 
        message="Notice: This will send real SMS messages via AfroMessage." 
        type="warning" 
        showIcon 
        style={{ marginBottom: 16 }} 
      />

      <Form form={form} layout="vertical" initialValues={{ target_type: 'all' }}>
        <Form.Item name="target_type" label="Select Target Audience">
          <Radio.Group onChange={handleTargetChange} optionType="button" buttonStyle="solid">
            <Radio value="all"><GlobalOutlined /> All Users</Radio>
            <Radio value="role"><UserOutlined /> By Role</Radio>
            <Radio value="location"><EnvironmentOutlined /> By Location</Radio>
          </Radio.Group>
        </Form.Item>

        {targetType === 'role' && (
          <Form.Item name="role_name" label="Select Role" rules={[{ required: true, message: 'Please select a role' }]}>
            <Select placeholder="E.g., Development Agent">
              {Object.values(APP_ROLES).map(role => (
                <Select.Option key={role} value={role}>{role}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        )}

        {targetType === 'location' && (
          <div style={{ background: '#f8f9fa', padding: 12, borderRadius: 8, marginBottom: 16 }}>
            <Row gutter={12}>
              <Col span={8}>
                <Form.Item label="Zone" name="zone_id">
                  <Select placeholder="Zone" onChange={(val) => { fetchWoredas(val); form.setFieldsValue({ woreda_id: null, kebele_id: null }); setKebeles([]); }}>
                    {zones.map(z => <Select.Option key={z.id} value={z.id}>{z.name}</Select.Option>)}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Woreda" name="woreda_id">
                  <Select placeholder="Woreda" disabled={!form.getFieldValue('zone_id')} onChange={(val) => { fetchKebeles(val); form.setFieldsValue({ kebele_id: null }); }}>
                    {woredas.map(w => <Select.Option key={w.id} value={w.id}>{w.name}</Select.Option>)}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Kebele" name="kebele_id" rules={[{ required: true, message: 'Select Kebele' }]}>
                  <Select placeholder="Kebele" disabled={!form.getFieldValue('woreda_id')}>
                    {kebeles.map(k => <Select.Option key={k.id} value={k.id}>{k.name}</Select.Option>)}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </div>
        )}

        <Divider style={{ margin: '12px 0' }} />

        <Form.Item 
          name="message" 
          label="SMS Message Content" 
          rules={[{ required: true, message: 'Message is required' }, { max: 160, message: 'Max 160 characters allowed for standard SMS' }]}
        >
          <TextArea rows={4} showCount maxLength={160} placeholder="Type your official announcement here..." />
        </Form.Item>
      </Form>
    </Modal>
  );
}