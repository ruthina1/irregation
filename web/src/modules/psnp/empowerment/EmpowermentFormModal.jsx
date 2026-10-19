import React, { useEffect } from 'react';
import { Modal, Form, Row, Col, InputNumber, Switch, DatePicker, Divider, message } from 'antd';
import dayjs from 'dayjs';

// ───── REUSABLE ENTERPRISE LOCATION COMPONENT ─────
import LocationScopeSelector from '../../../components/common/LocationScopeSelector';

export default function EmpowermentFormModal({ open, onCancel, onSubmit, editingData }) {
  const [form] = Form.useForm();

  // ───── INITIALIZATION ─────
  useEffect(() => {
    if (open) {
      if (editingData) {
        form.setFieldsValue({
          ...editingData,
          assessment_date: editingData.assessment_date ? dayjs(editingData.assessment_date) : dayjs(),
          
          // Flatten nested JSON for form controls
          tech_stoves: editingData.labor_saving_tech_usage?.fuel_efficient_stoves,
          tech_solar: editingData.labor_saving_tech_usage?.solar_tech,
          tech_pumps: editingData.labor_saving_tech_usage?.water_pumps,
          tech_biogas: editingData.labor_saving_tech_usage?.biogas_systems,
          soc_hiv: editingData.social_development?.hiv_aids_budget_allocated,
          soc_childcare: editingData.social_development?.childcare_centers_established,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ assessment_date: dayjs() });
      }
    }
  }, [open, editingData, form]);

  // ───── SUBMISSION ─────
  const handleOk = async () => {
    try {
      const vals = await form.validateFields();
      
      const payload = {
        kebele_id: vals.kebele_id,
        assessment_date: vals.assessment_date.format('YYYY-MM-DD'),
        women_in_decision_making_roles: vals.women_in_decision_making_roles,
        youth_in_agri_enterprises: vals.youth_in_agri_enterprises,
        labor_saving_tech_usage: {
          fuel_efficient_stoves: vals.tech_stoves || 0,
          solar_tech: vals.tech_solar || 0,
          water_pumps: vals.tech_pumps || 0,
          biogas_systems: vals.tech_biogas || 0
        },
        social_development: {
          hiv_aids_budget_allocated: !!vals.soc_hiv,
          childcare_centers_established: vals.soc_childcare || 0
        }
      };

      onSubmit(payload);
    } catch (e) {
      message.error("Please fill all required fields correctly.");
    }
  };

  return (
    <Modal 
      title={
        <span style={{ fontFamily: "'Times New Roman', Times, serif", fontWeight: 'bold' }}>
          {editingData ? "Edit Kebele Assessment" : "Record Kebele Assessment"}
        </span>
      } 
      open={open} 
      onCancel={onCancel} 
      onOk={handleOk} 
      width={800} 
      destroyOnClose 
      maskClosable={false}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Divider orientation="left">Kebele Location & Date</Divider>
        <Row gutter={16}>
          {/* ───── 1. REUSABLE ROLE-SCOPE AWARE LOCATION SELECTOR ───── */}
          <Col span={24}>
            <LocationScopeSelector form={form} editingData={editingData} />
          </Col>

          <Col span={8}>
            <Form.Item name="assessment_date" label="Assessment Date" rules={[{ required: true, message: 'Date is required' }]}>
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">Core Participation Metrics</Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="women_in_decision_making_roles" label="Women in Decision-Making Roles" rules={[{ required: true, message: 'Required' }]}>
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="youth_in_agri_enterprises" label="Youth in Agri Enterprises" rules={[{ required: true, message: 'Required' }]}>
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">Labor-Saving Technologies (RFP Pg 26)</Divider>
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item name="tech_stoves" label="Fuel-Efficient Stoves">
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="tech_solar" label="Solar Technologies">
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="tech_pumps" label="Water Pumps">
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="tech_biogas" label="Biogas Systems">
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">Social Development (RFP Pg 12)</Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="soc_hiv" label="2% Budget Allocated for HIV/AIDS?" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="soc_childcare" label="Number of Childcare Centers Est.">
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}