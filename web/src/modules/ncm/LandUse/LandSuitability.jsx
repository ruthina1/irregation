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
  'Agriculture', 'Irrigation', 'Livestock', 'Industry',
  'Residential', 'Commercial', 'Tourism', 'Infrastructure',
  'Forestry', 'Conservation'
];

const quality = ['Excellent', 'Good', 'Moderate', 'Poor'];
const availability = ['Excellent', 'Good', 'Moderate', 'Limited', 'None'];

export default function LandSuitabilityForm({
  initialValues = null,
  onSubmit
}) {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    form.setFieldsValue(
      initialValues || {
        assessment_year: new Date().getFullYear()
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
          Back to Land Suitability
        </Button>

        <Title level={3} style={{ margin: 0, color: '#1a5f2c' }}>
          {initialValues
            ? 'Edit Land Suitability Assessment'
            : 'New Land Suitability Assessment'}
        </Title>

        <Text type="secondary">
          Evaluate the suitability of a land parcel for a proposed use.
        </Text>
      </Space>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
      >
        <Card title="📍 Parcel & Assessment Information" bordered={false}>
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
                name="assessment_year"
                label="Assessment Year"
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
                name="proposed_land_use"
                label="Proposed Land Use"
                rules={[{ required: true, message: 'Select proposed use' }]}
              >
                <Select
                  placeholder="Select proposed land use"
                  options={options(landUses)}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="suitability_class"
                label="Suitability Class"
                rules={[{ required: true }]}
              >
                <Select
                  placeholder="Select suitability class"
                  options={options([
                    'Highly Suitable',
                    'Moderately Suitable',
                    'Marginally Suitable',
                    'Not Suitable'
                  ])}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card
          title="🌱 Physical & Environmental Assessment"
          bordered={false}
          style={{ marginTop: 16 }}
        >
          <Row gutter={20}>
            <Col xs={24} md={8}>
              <Form.Item name="soil_quality" label="Soil Quality">
                <Select options={options(quality)} />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item name="slope" label="Slope (%)">
                <InputNumber
                  min={0}
                  max={100}
                  style={{ width: '100%' }}
                  placeholder="e.g. 12"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item name="elevation" label="Elevation (m)">
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  placeholder="e.g. 1800"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                name="water_availability"
                label="Water Availability"
              >
                <Select options={options(availability)} />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                name="climate_suitability"
                label="Climate Suitability"
              >
                <Select options={options(quality)} />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item name="accessibility" label="Accessibility">
                <Select options={options(quality)} />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card
          title="🏗️ Infrastructure & Suitability Score"
          bordered={false}
          style={{ marginTop: 16 }}
        >
          <Row gutter={20}>
            <Col xs={24} md={12}>
              <Form.Item
                name="infrastructure_availability"
                label="Infrastructure Availability"
              >
                <Select
                  options={options([
                    'Available',
                    'Partially Available',
                    'Not Available'
                  ])}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="suitability_score"
                label="Suitability Score (%)"
              >
                <InputNumber
                  min={0}
                  max={100}
                  style={{ width: '100%' }}
                  placeholder="0 - 100"
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Row gutter={20}>
            <Col span={24}>
              <Form.Item
                name="environmental_constraints"
                label="Environmental Constraints"
              >
                <TextArea
                  rows={3}
                  placeholder="Describe environmental limitations or risks..."
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                name="recommendation"
                label="Assessment Recommendation"
              >
                <TextArea
                  rows={4}
                  placeholder="Enter the final assessment and recommendation..."
                />
              </Form.Item>
            </Col>
          </Row>
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
              {initialValues ? 'Update Assessment' : 'Save Assessment'}
            </Button>
          </Space>
        </div>
      </Form>
    </div>
  );
}