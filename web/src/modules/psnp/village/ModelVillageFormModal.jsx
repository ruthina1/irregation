import React, { useEffect } from 'react';
import { Modal, Form, Row, Col, InputNumber, Switch, Divider, message } from 'antd';
import LocationScopeSelector from '../../../components/common/LocationScopeSelector';

export default function ModelVillageFormModal({ open, onCancel, onSubmit, editingData }) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      if (editingData) {
        form.setFieldsValue({ ...editingData });
      } else {
        form.resetFields();
        form.setFieldsValue({ 
          certification_year_ec: 2016, 
          is_certified_model_village: false,
          is_odf_certified: false,
          free_from_htp: false,
          has_active_watershed_management: false,
        });
      }
    }
  }, [open, editingData, form]);

  const handleOk = async () => {
    try {
      const vals = await form.validateFields();
      onSubmit(vals);
    } catch (e) {
      message.error("Please fill all required fields correctly.");
    }
  };

  return (
    <Modal 
      title={<span style={{ fontFamily: "'Times New Roman', Times, serif", fontWeight: 'bold' }}>{editingData ? "Edit Certification Data" : "Register Model Village Data"}</span>} 
      open={open} 
      onCancel={onCancel} 
      onOk={handleOk} 
      width={800} 
      destroyOnClose 
      maskClosable={false}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Divider orientation="left">Location & Timeline</Divider>
        <Row gutter={16}>
          <Col span={16}><LocationScopeSelector form={form} editingData={editingData} /></Col>
          <Col span={8}>
            <Form.Item name="certification_year_ec" label="Year (EC)" rules={[{ required: true }]}>
              <InputNumber style={{ width: '100%' }} min={2000} max={2100} />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">Village Demographics & Agriculture</Divider>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="total_households" label="Total Households" rules={[{ required: true }]}>
              <InputNumber style={{ width: '100%' }} min={1} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="model_farmers_count" label="Model Farmers Count" rules={[{ required: true }]}>
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="has_active_watershed_management" label="Active Watershed Mgmt?" valuePropName="checked">
              <Switch checkedChildren="Yes" unCheckedChildren="No" />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">Health & Sanitation Metrics</Divider>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="households_with_water_access" label="Water Access (HHs)" rules={[{ required: true }]}>
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="cbhi_coverage_percentage" label="CBHI Coverage (%)" rules={[{ required: true }]}>
              <InputNumber style={{ width: '100%' }} min={0} max={100} step={0.1} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="is_odf_certified" label="ODF Certified?" tooltip="Open Defecation Free" valuePropName="checked">
              <Switch checkedChildren="Yes" unCheckedChildren="No" />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">Social & Educational Inclusion</Divider>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="literacy_rate_percentage" label="Adult Literacy Rate (%)" rules={[{ required: true }]}>
              <InputNumber style={{ width: '100%' }} min={0} max={100} step={0.1} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="free_from_htp" label="Free from HTP?" tooltip="Harmful Traditional Practices (e.g., early marriage)" valuePropName="checked">
              <Switch checkedChildren="Yes" unCheckedChildren="No" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="is_certified_model_village" label="Final Regional Certification?" valuePropName="checked">
              <Switch checkedChildren="Certified" unCheckedChildren="Pending" style={{ background: form.getFieldValue('is_certified_model_village') ? '#1a5f2c' : undefined }} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}