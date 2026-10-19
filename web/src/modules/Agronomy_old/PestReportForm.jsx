import React, { useState } from 'react';
import {
  Form,
  Select,
  Input,
  Button,
  message,
  Row,
  Col,
  Space,
  DatePicker,
  InputNumber
} from 'antd';
import {
  SaveOutlined,
  ClearOutlined,
  WarningOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

import agronomyApi from "../../services/api/agronomyApi";

// ───── REUSABLE ENTERPRISE LOCATION COMPONENT ─────
import LocationScopeSelector from '../../components/common/LocationScopeSelector';

const { Option } = Select;

const PestReportForm = ({ onSuccess, initialData }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSeverityChange = (value) => {
    if (value === 'Severe/Outbreak') {
      message.warning({
        content: '⚠️ Emergency alert will be triggered to Regional Coordinators upon submission!',
        duration: 5,
        icon: <WarningOutlined style={{ color: '#fa8c16' }} />
      });
    }
  };

  const handleFinish = async (values) => {
    try {
      setLoading(true);

      const payload = {
        ...values,
        detection_date: values.detection_date ? values.detection_date.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
      };

      // Clean up frontend location filtering helpers before submitting
      delete payload.zone_id;
      delete payload.woreda_id;

      const response = await agronomyApi.createPestReport(payload);

      if (response.data?.emergency_triggered) {
        message.warning({
          content: '⚠️ EMERGENCY ALERT: Regional coordinators have been notified!',
          duration: 8
        });
      } else {
        message.success('Pest & Disease report submitted successfully');
      }

      form.resetFields();

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Submission failed:", error.response);
      const errors = error.response?.data?.errors;
      if (errors) {
        Object.values(errors).forEach((err) => {
          message.error(err[0]);
        });
      } else {
        message.error(
          error.response?.data?.message || 'Failed to submit pest report'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      initialValues={{
        severity_level: 'Low',
        estimated_infestation_area_hectares: 0,
        control_method_applied: 'None',
        detection_date: dayjs()
      }}
    >
      {/* 1. REUSABLE ROLE-SCOPE AWARE LOCATION BOUNDARY SELECTOR */}
      <Row gutter={16}>
        <Col span={24}>
          <LocationScopeSelector form={form} editingData={initialData} />
        </Col>
      </Row>

      {/* 2. Incident Details */}
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name="agent_type"
            label="Incident Type"
            rules={[{ required: true, message: 'Please select incident type' }]}
          >
            <Select placeholder="Select Type">
              <Option value="Pest">Pest</Option>
              <Option value="Disease">Disease</Option>
              <Option value="Weed">Weed</Option>
            </Select>
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            name="scientific_or_common_name"
            label="Scientific / Common Name"
            rules={[{ required: true, message: 'Please enter name' }]}
          >
            <Input placeholder="e.g. Fall Armyworm, Desert Locust" />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            name="detection_date"
            label="Detection Date"
            rules={[{ required: true, message: 'Please select date' }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              format="YYYY-MM-DD"
              disabledDate={(current) => current && current > dayjs().endOf('day')}
            />
          </Form.Item>
        </Col>
      </Row>

      {/* 3. Infestation & Severity */}
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="estimated_infestation_area_hectares"
            label="Estimated Infestation Area (Ha)"
            rules={[{ required: true, message: 'Please enter infestation area' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              step={0.01}
              min={0}
              placeholder="Area in Hectares"
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            name="severity_level"
            label="Severity Level"
            rules={[{ required: true, message: 'Please select severity' }]}
          >
            <Select onChange={handleSeverityChange}>
              <Option value="Low">Low</Option>
              <Option value="Moderate">Moderate</Option>
              <Option value="Severe/Outbreak">Severe / Outbreak</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      {/* 4. Control Measures */}
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="control_method_applied"
            label="Control Method Applied"
            rules={[{ required: true, message: 'Please select control method' }]}
          >
            <Select>
              <Option value="None">None</Option>
              <Option value="Cultural">Cultural</Option>
              <Option value="Biological">Biological</Option>
              <Option value="Chemical">Chemical</Option>
              <Option value="Integrated">Integrated</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      {/* 5. Conditional Chemical Fields */}
      <Form.Item
        shouldUpdate={(prev, curr) =>
          prev.control_method_applied !== curr.control_method_applied
        }
        noStyle
      >
        {({ getFieldValue }) =>
          getFieldValue('control_method_applied') === 'Chemical' ? (
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="chemical_used_name"
                  label="Chemical Used"
                  rules={[{ required: true, message: 'Please enter chemical name' }]}
                >
                  <Input placeholder="Chemical name (e.g. Malathion)" />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  name="chemical_volume_liters_or_kg"
                  label="Chemical Amount (L/Kg)"
                  rules={[{ required: true, message: 'Please enter amount' }]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    step={0.01}
                    placeholder="Volume in L or Kg"
                  />
                </Form.Item>
              </Col>
            </Row>
          ) : null
        }
      </Form.Item>

      {/* Form Buttons */}
      <Form.Item style={{ marginTop: 16 }}>
        <Space>
          <Button
            type="primary"
            htmlType="submit"
            icon={<SaveOutlined />}
            loading={loading}
          >
            Submit Pest Report
          </Button>

          <Button
            icon={<ClearOutlined />}
            onClick={() => form.resetFields()}
          >
            Clear Form
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default PestReportForm;