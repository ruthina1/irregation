import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Row, Col, InputNumber, message } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import agronomyApi from '../../services/api/agronomyApi';

// ───── REUSABLE ENTERPRISE COMPONENTS ─────
import LocationScopeSelector from '../../components/common/LocationScopeSelector';
import ReusableLocationPicker from '../../components/common/ReusableLocationPicker'; 

const { Option } = Select;

export default function FormIrrigationProjects({ open, onCancel, onSuccess, initialValues }) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // ───── INITIALIZATION ─────
  useEffect(() => {
    if (open) {
      if (initialValues) {
        form.setFieldsValue({
          ...initialValues,
          command_area_ha: initialValues.command_area_ha ? parseFloat(initialValues.command_area_ha) : undefined,
          number_of_beneficiaries: initialValues.number_of_beneficiaries ? parseInt(initialValues.number_of_beneficiaries, 10) : undefined,
          
          // Convert DB location format to Component format for ReusableLocationPicker
          location: initialValues.location ? {
            lat: initialValues.location.latitude,
            lng: initialValues.location.longitude,
            accuracy: initialValues.location.accuracy_meters
          } : null
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, initialValues, form]);

  // ───── SUBMISSION ─────
  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      const payload = { ...values };

      // Clean up frontend location filtering helpers
      delete payload.zone_id; 
      delete payload.woreda_id; 

      // Transform ReusableLocationPicker format back to DB format
      if (payload.location && payload.location.lat) {
        payload.location = {
          latitude: payload.location.lat,
          longitude: payload.location.lng,
          accuracy_meters: payload.location.accuracy || null
        };
      } else {
        delete payload.location; // Do not send empty location data
      }

      if (initialValues && initialValues.id) {
        await agronomyApi.updateIrrigationProject(initialValues.id, payload);
        message.success('Project details updated successfully');
      } else {
        await agronomyApi.createIrrigationProject(payload);
        message.success('New irrigation project recorded successfully');
      }
      onSuccess();
      form.resetFields();
    } catch (error) {
      message.error('Failed to save irrigation project data');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal 
      title={
        <span style={{ fontFamily: "'Times New Roman', Times, serif", fontWeight: 'bold' }}>
          {initialValues ? "Modify Project Parameters" : "Register Irrigation Project"}
        </span>
      } 
      open={open} 
      onOk={form.submit} 
      onCancel={onCancel}
      confirmLoading={submitting}
      width={850}
      destroyOnClose
      maskClosable={false}
    >
      <Form form={form} layout="vertical" onFinish={onFinish} style={{ marginTop: 16 }}>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item 
              name="project_name" 
              label="Project Name" 
              rules={[{ required: true, message: 'Please input project name' }]}
            >
              <Input placeholder="E.g., Shola Community Modernization" />
            </Form.Item>
          </Col>

          {/* ───── 1. REUSABLE ROLE-SCOPE AWARE LOCATION BOUNDARY SELECTOR ───── */}
          <Col span={24}>
            <LocationScopeSelector form={form} editingData={initialValues} />
          </Col>

          {/* ───── 2. REUSABLE GIS MAP LOCATION PICKER ───── */}
          <Col span={24}>
            <Form.Item 
              name="location" 
              label={<span style={{ fontWeight: 600, fontSize: '15px' }}><GlobalOutlined /> Project GIS Coordinates</span>}
            >
              <ReusableLocationPicker autoLocate={!initialValues} />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item 
              name="technology_type" 
              label="Technology Type" 
              rules={[{ required: true, message: 'Select technology classification' }]}
            >
              <Select placeholder="Choose technology model">
                <Option value="Traditional Canal">Traditional Canal</Option>
                <Option value="Modern Canal">Modern Canal</Option>
                <Option value="Geo-membrane">Geo-membrane</Option>
                <Option value="Pond">Pond</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item 
              name="project_phase" 
              label="Project Phase" 
              rules={[{ required: true, message: 'Select current progress phase' }]}
            >
              <Select placeholder="Choose execution phase">
                <Option value="Feasibility">Feasibility</Option>
                <Option value="Design">Design</Option>
                <Option value="Construction">Construction</Option>
                <Option value="Completed">Completed</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item 
              name="command_area_ha" 
              label="Command Area (Hectares)" 
              rules={[{ required: true, message: 'Input command area size' }]}
            >
              <InputNumber min={0.01} step={0.1} style={{ width: '100%' }} placeholder="0.00" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item 
              name="number_of_beneficiaries" 
              label="Targeted Beneficiaries" 
              rules={[{ required: true, message: 'Specify population reached' }]}
            >
              <InputNumber min={1} precision={0} style={{ width: '100%' }} placeholder="0" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}