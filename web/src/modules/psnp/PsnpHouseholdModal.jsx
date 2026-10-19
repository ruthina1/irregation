import React, { useEffect, useState, useCallback } from 'react';
import { Modal, Form, Select, Switch, message, Row, Col } from 'antd';
import { psnpApi } from '../../services/api/psnpApi';

// ───── REUSABLE ENTERPRISE LOCATION COMPONENT ─────
import LocationScopeSelector from '../../components/common/LocationScopeSelector';

const { Option } = Select;

export default function PsnpHouseholdModal({ open, onCancel, editingHh, refresh }) {
  const [form] = Form.useForm();
  const [farmers, setFarmers] = useState([]);
  const [loadingFarmers, setLoadingFarmers] = useState(false);

  // Watch kebele_id set by LocationScopeSelector
  const selectedKebeleId = Form.useWatch('kebele_id', form);

  // Fetch eligible farmers (filtered by Kebele if selected)
  const fetchEligibleFarmers = useCallback(async (kebeleId) => {
    setLoadingFarmers(true);
    try {
      // Pass kebele_id parameter to filter eligible farmers for this location
      const params = kebeleId ? { kebele_id: kebeleId } : {};
      const res = await psnpApi.getEligibleFarmers(params);
      setFarmers(res.data.data || res.data || []);
    } catch (error) {
      message.error('Failed to load eligible farmers');
    } finally {
      setLoadingFarmers(false);
    }
  }, []);

  // Automatically refresh eligible farmers list when Location Selection changes
  useEffect(() => {
    if (selectedKebeleId) {
      fetchEligibleFarmers(selectedKebeleId);
    } else {
      fetchEligibleFarmers(null);
    }
  }, [selectedKebeleId, fetchEligibleFarmers]);

  // ───── INITIALIZATION ─────
  useEffect(() => {
    if (open) {
      if (editingHh) {
        form.setFieldsValue({ 
          ...editingHh,
          is_graduated: Boolean(editingHh.is_graduated)
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ targeting_type: 'PW', is_graduated: false });
      }
    }
  }, [open, editingHh, form]);

  // ───── SUBMISSION ─────
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = { ...values };

      // Clean up frontend location filtering helpers before sending payload
      delete payload.zone_id;
      delete payload.woreda_id;
      delete payload.kebele_id;

      if (editingHh) {
        await psnpApi.updateHousehold(editingHh.id, payload);
      } else {
        await psnpApi.createHousehold(payload);
      }
      
      message.success(editingHh ? 'Household updated' : 'Household targeted successfully');
      onCancel(); 
      refresh();
    } catch (error) { 
      // Handle API Validation Errors (e.g. 422 HTTP responses)
      if (error.response && error.response.status === 422) {
        const errors = error.response.data.errors || error.response.data.data;
        const firstErrorMessage = Object.values(errors).flat()[0];
        message.error(firstErrorMessage || 'Validation Error. Please check your inputs.');
      }
    }
  };

  return (
    <Modal 
      title={
        <span style={{ fontFamily: "'Times New Roman', Times, serif", fontWeight: 'bold' }}>
          {editingHh ? "Edit PSNP Profile" : "Target New Household"}
        </span>
      } 
      open={open} 
      onCancel={onCancel} 
      onOk={handleSubmit}
      okText="Save Profile"
      width={700}
      destroyOnClose
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Row gutter={16}>
          {/* ───── 1. REUSABLE ROLE-SCOPE AWARE LOCATION SELECTOR ───── */}
          <Col span={24}>
            <LocationScopeSelector form={form} editingData={editingHh?.farmer || editingHh} />
          </Col>

          {/* ───── 2. FARMER SELECTION & TARGETING ───── */}
          <Col span={24}>
            <Form.Item 
              name="farmer_id" 
              label="Select Farmer (Food Insecure Areas Only)" 
              rules={[{ required: true, message: 'Please select an eligible farmer' }]}
            >
              <Select 
                showSearch 
                loading={loadingFarmers}
                optionFilterProp="children" 
                disabled={!!editingHh} 
                placeholder={selectedKebeleId ? "Search for an eligible farmer in this Kebele..." : "Select Kebele first..."}
              >
                {/* Keep current farmer when editing */}
                {editingHh && (
                  <Option key={editingHh.farmer_id} value={editingHh.farmer_id}>
                    {editingHh.farmer?.full_name || 'Selected Farmer'}
                  </Option>
                )}
                {farmers.map(f => (
                  <Option key={f.id} value={f.id}>
                    {f.full_name} ({f.farmer_unique_id_no || f.id})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item name="targeting_type" label="Targeting Type" rules={[{ required: true }]}>
              <Select>
                <Option value="PW">Public Work (PW)</Option>
                <Option value="PDS">Permanent Direct Support (PDS)</Option>
              </Select>
            </Form.Item>
          </Col>

          {editingHh && (
            <Col span={12}>
              <Form.Item name="is_graduated" label="Has Graduated from PSNP?" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          )}
        </Row>
      </Form>
    </Modal>
  );
}