import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, Row, Col, InputNumber, DatePicker, message, Divider } from 'antd';
import dayjs from 'dayjs';

// ───── REUSABLE ENTERPRISE LOCATION COMPONENT ─────
import LocationScopeSelector from '../../../components/common/LocationScopeSelector';

const { Option } = Select;
const { TextArea } = Input;

export default function TrainingFormModal({ open, onCancel, onSubmit, editingEvent }) {
  const [form] = Form.useForm();

  // ───── INITIALIZATION ─────
  useEffect(() => {
    if (open) {
      if (editingEvent) {
        // Edit Mode: Populate data and convert date string to dayjs instance
        form.setFieldsValue({
          ...editingEvent,
          date_conducted: editingEvent.date_conducted ? dayjs(editingEvent.date_conducted) : dayjs(),
        });
      } else {
        // Create Mode: Reset fields and set sensible defaults
        form.resetFields();
        form.setFieldsValue({
          event_type: 'Training',
          male_participants: 0,
          female_participants: 0,
          youth_participants: 0,
          date_conducted: dayjs()
        });
      }
    }
  }, [open, editingEvent, form]);

  // ───── SUBMISSION ─────
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      
      const payload = { 
        ...values,
        date_conducted: values.date_conducted.format('YYYY-MM-DD')
      };
      
      // Clean up frontend filtering helpers
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
          {editingEvent ? "Edit Event Record" : "Record New Extension Event"}
        </span>
      }
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      okText={editingEvent ? "Update Event" : "Save Event"}
      width={750}
      destroyOnClose
      maskClosable={false}
    >
      <Form form={form} layout="vertical">
        <Divider orientation="left">Event Location</Divider>
        
        {/* ───── REUSABLE ROLE-SCOPE AWARE LOCATION SELECTOR ───── */}
        <Row gutter={16}>
          <Col span={24}>
            <LocationScopeSelector form={form} editingData={editingEvent} />
          </Col>
        </Row>

        <Divider orientation="left">Event Details</Divider>
        <Row gutter={16}>
          <Col span={16}>
            <Form.Item name="topic" label="Topic / Agenda" rules={[{ required: true, message: 'Topic is required' }]}>
              <Input placeholder="E.g. Row planting techniques for Teff" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="event_type" label="Event Type" rules={[{ required: true, message: 'Event type is required' }]}>
              <Select>
                <Option value="Training">Training</Option>
                <Option value="Field Day">Field Day</Option>
                <Option value="Video Dissemination">Video Dissemination</Option>
                <Option value="Workshop">Workshop</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col span={16}>
            <Form.Item name="demonstrated_technology" label="Demonstrated Technology (Optional)">
              <TextArea rows={2} placeholder="E.g. BBM, Improved Seeds, Fertilizer Deep Placement" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="date_conducted" label="Date Conducted" rules={[{ required: true, message: 'Date is required' }]}>
              <DatePicker style={{ width: '100%' }} disabledDate={(current) => current && current > dayjs().endOf('day')} />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">Participant Demographics</Divider>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="male_participants" label="Male (Adults)" rules={[{ required: true, message: 'Required' }]}>
              <InputNumber style={{ width: '100%' }} min={0} size="large" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="female_participants" label="Female (Adults)" rules={[{ required: true, message: 'Required' }]}>
              <InputNumber style={{ width: '100%' }} min={0} size="large" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="youth_participants" label="Youth (M/F Combined)" rules={[{ required: true, message: 'Required' }]}>
              <InputNumber style={{ width: '100%' }} min={0} size="large" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}