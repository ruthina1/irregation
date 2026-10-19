import React, { useEffect } from 'react';
import {
  Form, Input, InputNumber, Select, Row, Col,
  Card, Button, Space, Typography, Divider
} from 'antd';
import {
  SaveOutlined, ArrowLeftOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { TextArea } = Input;

const options = (items) => items.map(x => ({ value: x, label: x }));

const landUses = [
  'Agriculture',
  'Irrigation',
  'Livestock',
  'Industry',
  'Residential',
  'Commercial',
  'Tourism',
  'Infrastructure',
  'Forestry',
  'Conservation',
  'Mixed Use',
  'Unused'
];

export default function LandUseManagementForm({
  initialValues = null,
  onSubmit
}) {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    form.setFieldsValue(
      initialValues || {
        reporting_year: new Date().getFullYear()
      }
    );
  }, [initialValues, form]);

  const handleFinish = async (values) => {
    if (onSubmit) await onSubmit(values);
  };

  return (
    <div>
      <Space direction="vertical" size={4} style={{ marginBottom: 24 }}>
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          style={{ padding: 0 }}
        >
          Back to Land Use Management
        </Button>

        <Title level={3} style={{ margin: 0, color: '#1a5f2c' }}>
          {initialValues
            ? 'Edit Land Use Management'
            : 'New Land Use Management Record'}
        </Title>

        <Text type="secondary">
          Record, monitor and manage the current and planned use of land.
        </Text>
      </Space>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
      >
        <Card title="📍 Parcel & Land Use" bordered={false}>
          <Row gutter={20}>
            <Col xs={24} md={12}>
              <Form.Item
                name="parcel_id"
                label="Land Parcel"
                rules={[{ required: true, message: 'Please select a parcel' }]}
              >
                <Select
                  showSearch
                  placeholder="Select land parcel"
                  options={[
                    { value: 1, label: 'Parcel #BD-001' },
                    { value: 2, label: 'Parcel #BD-002' },
                    { value: 3, label: 'Parcel #BD-003' }
                  ]}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="reporting_year"
                label="Reporting Year"
                rules={[{ required: true }]}
              >
                <InputNumber
                  min={2000}
                  max={2100}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="current_land_use"
                label="Current Land Use"
                rules={[{ required: true }]}
              >
                <Select
                  placeholder="Select current land use"
                  options={options(landUses)}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="planned_land_use"
                label="Planned Land Use"
              >
                <Select
                  placeholder="Select planned land use"
                  options={options(landUses)}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card
          title="🏷️ Classification & Development"
          bordered={false}
          style={{ marginTop: 16 }}
        >
          <Row gutter={20}>
            <Col xs={24} md={12}>
              <Form.Item
                name="land_use_category"
                label="Land Use Category"
                rules={[{ required: true }]}
              >
                <Select
                  placeholder="Select category"
                  options={options([
                    'Productive',
                    'Residential',
                    'Commercial',
                    'Industrial',
                    'Conservation',
                    'Infrastructure',
                    'Recreational',
                    'Mixed Use'
                  ])}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="development_status"
                label="Development Status"
              >
                <Select
                  options={options([
                    'Undeveloped',
                    'Partially Developed',
                    'Developed',
                    'Under Development',
                    'Abandoned'
                  ])}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="land_allocation_status"
                label="Land Allocation Status"
              >
                <Select
                  options={options([
                    'Available',
                    'Allocated',
                    'Leased',
                    'Occupied',
                    'Reserved',
                    'Disputed'
                  ])}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="zoning_zone"
                label="Zoning / Planning Zone"
              >
                <Input placeholder="e.g. Industrial Zone A" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card
          title="📐 Area & Infrastructure"
          bordered={false}
          style={{ marginTop: 16 }}
        >
          <Row gutter={20}>
            <Col xs={24} md={8}>
              <Form.Item
                name="area_under_use"
                label="Area Under Use (ha)"
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  placeholder="Hectares"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                name="available_area"
                label="Available Area (ha)"
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  placeholder="Hectares"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                name="infrastructure_status"
                label="Infrastructure Status"
              >
                <Select
                  options={options([
                    'Fully Available',
                    'Partially Available',
                    'Not Available'
                  ])}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card
          title="⚖️ Compliance & Restrictions"
          bordered={false}
          style={{ marginTop: 16 }}
        >
          <Row gutter={20}>
            <Col xs={24} md={12}>
              <Form.Item
                name="compliance_status"
                label="Compliance Status"
              >
                <Select
                  options={options([
                    'Compliant',
                    'Partially Compliant',
                    'Non-Compliant',
                    'Under Review'
                  ])}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="responsible_authority"
                label="Responsible Authority"
              >
                <Input placeholder="Responsible office / institution" />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                name="development_restrictions"
                label="Development Restrictions"
              >
                <TextArea
                  rows={3}
                  placeholder="Specify zoning, development or planning restrictions..."
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                name="environmental_restrictions"
                label="Environmental Restrictions"
              >
                <TextArea
                  rows={3}
                  placeholder="Specify environmental restrictions..."
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card
          title="📝 Management Action"
          bordered={false}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="management_action"
            label="Required Management Action"
          >
            <TextArea
              rows={4}
              placeholder="Describe the required management, monitoring or corrective action..."
            />
          </Form.Item>

          <Form.Item name="remarks" label="Remarks">
            <TextArea
              rows={3}
              placeholder="Additional remarks..."
            />
          </Form.Item>
        </Card>

        <div style={{ marginTop: 20, textAlign: 'right' }}>
          <Space>
            <Button onClick={() => navigate(-1)}>
              Cancel
            </Button>

            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
            >
              {initialValues
                ? 'Update Land Use'
                : 'Save Land Use Record'}
            </Button>
          </Space>
        </div>
      </Form>
    </div>
  );
}