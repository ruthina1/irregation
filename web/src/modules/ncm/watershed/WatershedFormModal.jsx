import React, { useEffect } from 'react';
import { Modal, Form, Select, Row, Col, InputNumber, Input, Tabs, message } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';

// ───── REUSABLE ENTERPRISE COMPONENTS ─────
import LocationScopeSelector from '../../../components/common/LocationScopeSelector';
import ReusableLocationPicker from '../../../components/common/ReusableLocationPicker'; 

const { Option } = Select;

export default function WatershedFormModal({ open, onCancel, onSubmit, editingData }) {
  const [form] = Form.useForm();

  // ───── INITIALIZATION ─────
  useEffect(() => {
    if (open) {
      if (editingData) {
        form.setFieldsValue({
          ...editingData,
          // Convert DB location format to Component format for ReusableLocationPicker
          location: editingData.location ? {
            lat: editingData.location.latitude,
            lng: editingData.location.longitude,
            accuracy: editingData.location.accuracy_meters
          } : null
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ 
          start_year_of_development: new Date().getFullYear(),
          physical_planned_ha: 0, physical_actual_ha: 0,
          biological_planned_ha: 0, biological_actual_ha: 0
        });
      }
    }
  }, [open, editingData, form]);

  // ───── SUBMISSION ─────
  const handleOk = async () => {
    try {
      const vals = await form.validateFields();
      
      // Clean up frontend filtering helpers
      delete vals.zone_id; 
      delete vals.woreda_id;

      // Transform ReusableLocationPicker format back to DB format
      if (vals.location && vals.location.lat) {
        vals.location = {
          latitude: vals.location.lat,
          longitude: vals.location.lng,
          accuracy_meters: vals.location.accuracy || null
        };
      } else {
        delete vals.location;
      }

      onSubmit(vals);
    } catch (e) {
      message.error("Please fill all required fields correctly.");
    }
  };

  const tabItems = [
    {
      key: '1',
      label: 'Core & Location',
      children: (
        <Row gutter={16} style={{ paddingTop: 16 }}>
          {/* ───── 1. REUSABLE ROLE-SCOPE AWARE LOCATION SELECTOR ───── */}
          <Col span={24}>
            <LocationScopeSelector form={form} editingData={editingData} />
          </Col>
          
          <Col span={12}>
            <Form.Item name="watershed_name" label="Watershed Name" rules={[{ required: true, message: 'Watershed name is required' }]}>
              <Input placeholder="E.g. Upper Awash Watershed" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="watershed_code" label="Watershed Code" rules={[{ required: true, message: 'Watershed code is required' }]}>
              <Input placeholder="e.g. WS-001" />
            </Form.Item>
          </Col>
          
          <Col span={8}>
            <Form.Item name="total_area_ha" label="Total Area (Ha)" rules={[{ required: true, message: 'Area is required' }]}>
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="start_year_of_development" label="Start Year" rules={[{ required: true, message: 'Start year is required' }]}>
              <InputNumber style={{ width: '100%' }} min={1900} max={2100} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="supporting_program" label="Supporting Program">
              <Input placeholder="e.g. SLMP II" />
            </Form.Item>
          </Col>

          {/* ───── 2. REUSABLE GIS MAP LOCATION PICKER ───── */}
          <Col span={24}>
            <Form.Item 
              name="location" 
              label={<span style={{ fontWeight: 600, fontSize: '15px' }}><GlobalOutlined /> GIS Center Point of Watershed</span>}
            >
              <ReusableLocationPicker autoLocate={!editingData} />
            </Form.Item>
          </Col>
        </Row>
      )
    },
    {
      key: '2',
      label: 'Development Planning',
      children: (
        <Row gutter={16} style={{ paddingTop: 16 }}>
          <Col span={24} style={{ marginBottom: 16, color: '#666' }}>
            <em>Note: The system will automatically calculate the completion percentage and assign the Watershed Stage (Start-up to Maturity) based on the Planned vs Actual inputs below.</em>
          </Col>
          <Col span={12}>
            <Form.Item name="physical_planned_ha" label="Physical Structures PLANNED (Ha)" rules={[{ required: true }]}>
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="physical_actual_ha" label="Physical Structures ACTUAL (Ha)" rules={[{ required: true }]}>
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="biological_planned_ha" label="Biological Structures PLANNED (Ha)" rules={[{ required: true }]}>
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="biological_actual_ha" label="Biological Structures ACTUAL (Ha)" rules={[{ required: true }]}>
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
          </Col>
        </Row>
      )
    },
    {
      key: '3',
      label: 'Agri & Resources',
      children: (
        <Row gutter={16} style={{ paddingTop: 16 }}>
          <Col span={12}>
            <Form.Item name="area_free_from_open_grazing_ha" label="Area free from open grazing (Ha)">
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="area_developed_with_forage_ha" label="Area developed w/ forage (Ha)">
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="number_of_improved_dairy_cows" label="Improved Dairy Cows (Count)">
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="neighboring_watersheds_scaled_up" label="Neighboring Watersheds Scaled Up">
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="water_sources" label="Available Water Sources">
              <Select mode="multiple" placeholder="Select sources">
                <Option value="River">River</Option>
                <Option value="Spring">Spring</Option>
                <Option value="Pond">Pond</Option>
                <Option value="Well">Well</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      )
    }
  ];

  return (
    <Modal 
      title={
        <span style={{ fontFamily: "'Times New Roman', Times, serif", fontWeight: 'bold' }}>
          {editingData ? "Edit Watershed Data" : "Register Watershed"}
        </span>
      } 
      open={open} 
      onCancel={onCancel} 
      onOk={handleOk} 
      width={900} 
      destroyOnClose 
      maskClosable={false}
    >
      <Form form={form} layout="vertical">
        <Tabs defaultActiveKey="1" items={tabItems} />
      </Form>
    </Modal>
  );
}