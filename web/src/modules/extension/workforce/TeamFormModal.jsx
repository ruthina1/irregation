import React, { useEffect, useState, useCallback } from 'react';
import { Modal, Form, Input, Select, Row, Col, InputNumber, message } from 'antd';
import api from '../../../services/axios';

// ───── REUSABLE ENTERPRISE LOCATION COMPONENT ─────
import LocationScopeSelector from '../../../components/common/LocationScopeSelector';

const { Option } = Select;

export default function TeamFormModal({ open, onCancel, onSubmit, editingData }) {
  const [form] = Form.useForm();
  const [farmers, setFarmers] = useState([]);
  const [loadingFarmers, setLoadingFarmers] = useState(false);

  // Form Watcher: Automatically tracks kebele_id when set by LocationScopeSelector
  const selectedKebeleId = Form.useWatch('kebele_id', form);

  // Fetch Farmers belonging to the selected Kebele
  const fetchFarmers = useCallback(async (kebeleId) => {
    if (!kebeleId) {
      setFarmers([]);
      return;
    }
    setLoadingFarmers(true);
    try {
      const res = await api.get(`/extension/farmers?kebele_id=${kebeleId}`);
      setFarmers(res.data.data.data || res.data.data || []);
    } catch (error) {
      console.error("Failed to load farmers:", error);
    } finally {
      setLoadingFarmers(false);
    }
  }, []);

  // Automatically load Farmers whenever the Kebele selection changes
  useEffect(() => {
    if (selectedKebeleId) {
      fetchFarmers(selectedKebeleId);
    } else {
      setFarmers([]);
    }
  }, [selectedKebeleId, fetchFarmers]);

  // ───── INITIALIZATION ─────
  useEffect(() => {
    if (open) {
      if (editingData) {
        form.setFieldsValue({
          ...editingData,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          team_type: 'Development Team',
          total_members: 5
        });
      }
    }
  }, [open, editingData, form]);

  // ───── SUBMISSION ─────
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const payload = { ...values };

      // Clean up frontend filtering helpers before submitting to backend
      delete payload.zone_id;
      delete payload.woreda_id;

      onSubmit(payload);
    } catch (error) {
      message.error("Please fill all required fields correctly.");
    }
  };

  return (
    <Modal
      title={
        <span style={{ fontFamily: "'Times New Roman', Times, serif", fontWeight: 'bold' }}>
          {editingData ? "Edit Development Team" : "Register Development Team"}
        </span>
      }
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      destroyOnClose
      width={750}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Row gutter={16}>
          {/* ───── 1. REUSABLE ROLE-SCOPE AWARE LOCATION SELECTOR ───── */}
          <Col span={24}>
            <LocationScopeSelector form={form} editingData={editingData} />
          </Col>

          {/* ───── 2. TEAM DETAILS ───── */}
          <Col span={12}>
            <Form.Item name="team_name" label="Team Name" rules={[{ required: true, message: 'Team name is required' }]}>
              <Input placeholder="E.g. Gudina Development Team" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="team_type" label="Team Type" rules={[{ required: true }]}>
              <Select>
                <Option value="Development Team">Development Team</Option>
                <Option value="Sub-Development (Work) Team">Sub-Development (Work) Team</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col span={16}>
            <Form.Item name="team_leader_farmer_id" label="Assign Team Leader (Farmer)">
              <Select
                placeholder={selectedKebeleId ? "Select a Farmer" : "Select a Kebele first"}
                allowClear
                showSearch
                optionFilterProp="children"
                loading={loadingFarmers}
                disabled={!selectedKebeleId}
              >
                {farmers.map(f => (
                  <Option key={f.id} value={f.id}>
                    {f.full_name || `${f.first_name || ''} ${f.last_name || ''}`} ({f.farmer_unique_id_no || f.id})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="total_members" label="Total Members" rules={[{ required: true, message: 'Total members is required' }]}>
              <InputNumber style={{ width: '100%' }} min={1} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}