import React, { useEffect } from 'react';
import { Modal, Form, Row, Col, InputNumber, message } from 'antd';

// ───── REUSABLE ENTERPRISE COMPONENTS ─────
import LocationScopeSelector from '../../../components/common/LocationScopeSelector';

export default function LandUseClassificationFormModal({ open, onCancel, onSubmit, editingData }) {
  const [form] = Form.useForm();

  // ───── INITIALIZATION ─────
  useEffect(() => {
    if (open) {
      if (editingData) {
        form.setFieldsValue({
          ...editingData,
          year: editingData.year ? Number(editingData.year) : null,
          forest_ha: editingData.forest_ha ? Number(editingData.forest_ha) : 0,
          grazing_ha: editingData.grazing_ha ? Number(editingData.grazing_ha) : 0,
          wetland_swamp_ha: editingData.wetland_swamp_ha ? Number(editingData.wetland_swamp_ha) : 0,
          barren_wasteland_ha: editingData.barren_wasteland_ha ? Number(editingData.barren_wasteland_ha) : 0,
        });
      } else {
        form.resetFields();
        // Set default year to current year for convenience
        form.setFieldsValue({ year: new Date().getFullYear() });
      }
    }
  }, [open, editingData, form]);

  // ───── SUBMISSION ─────
  const handleOk = async () => {
    try {
      // Validates that all fields have been filled correctly
      const vals = await form.validateFields();

      // Ensure woreda_id is present (LocationScopeSelector handles the UI part of this)
      if (!vals.woreda_id) {
        message.error("Please select a Woreda.");
        return;
      }

      // Prepare exact payload for Laravel backend
      const payload = {
        woreda_id: vals.woreda_id,
        year: Number(vals.year),
        forest_ha: Number(vals.forest_ha),
        grazing_ha: Number(vals.grazing_ha),
        wetland_swamp_ha: Number(vals.wetland_swamp_ha),
        barren_wasteland_ha: Number(vals.barren_wasteland_ha),
      };

      onSubmit(payload);
    } catch (e) {
      console.error("Validation failed:", e);
      message.error("Please fill all required fields correctly.");
    }
  };

  return (
    <Modal 
      title={
        <span style={{ fontFamily: "'Times New Roman', Times, serif", fontWeight: 'bold' }}>
          {editingData ? "Edit Land Use Classification" : "Record Land Use Classification"}
        </span>
      } 
      open={open} 
      onCancel={onCancel} 
      onOk={handleOk} 
      width={700} 
      destroyOnClose 
      maskClosable={false}
    >
      <Form form={form} layout="vertical">
        <Row gutter={16} style={{ paddingTop: 16 }}>
          
          {/* ───── LOCATION SELECTOR ───── */}
          <Col span={24}>
            <LocationScopeSelector form={form} editingData={editingData} />
            {/* Hidden field to ensure Woreda ID is caught by form.validateFields */}
            <Form.Item name="woreda_id" hidden rules={[{ required: true, message: 'Woreda is required' }]}>
              <InputNumber />
            </Form.Item>
          </Col>

          {/* ───── YEAR ───── */}
          <Col span={24}>
            <Form.Item 
              name="year" 
              label="Year" 
              rules={[{ required: true, message: 'Year is required' }]}
            >
              <InputNumber 
                style={{ width: '100%' }} 
                min={1900} 
                max={2100} 
                placeholder="e.g. 2024" 
              />
            </Form.Item>
          </Col>

          {/* ───── HECTARE MEASUREMENTS ───── */}
          <Col span={12}>
            <Form.Item 
              name="forest_ha" 
              label="Forest Area (Hectares)" 
              rules={[{ required: true, message: 'Forest area is required' }]}
            >
              <InputNumber style={{ width: '100%' }} min={0} step={0.1} placeholder="0.00" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item 
              name="grazing_ha" 
              label="Grazing Area (Hectares)" 
              rules={[{ required: true, message: 'Grazing area is required' }]}
            >
              <InputNumber style={{ width: '100%' }} min={0} step={0.1} placeholder="0.00" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item 
              name="wetland_swamp_ha" 
              label="Wetland/Swamp Area (Hectares)" 
              rules={[{ required: true, message: 'Wetland area is required' }]}
            >
              <InputNumber style={{ width: '100%' }} min={0} step={0.1} placeholder="0.00" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item 
              name="barren_wasteland_ha" 
              label="Barren/Wasteland Area (Hectares)" 
              rules={[{ required: true, message: 'Wasteland area is required' }]}
            >
              <InputNumber style={{ width: '100%' }} min={0} step={0.1} placeholder="0.00" />
            </Form.Item>
          </Col>

        </Row>
      </Form>
    </Modal>
  );
}