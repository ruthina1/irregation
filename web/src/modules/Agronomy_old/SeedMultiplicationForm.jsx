import React, { useState, useEffect } from 'react';
import { Form, Select, Input, Button, message, Row, Col, Space, Alert, Spin } from 'antd';
import { SaveOutlined, ClearOutlined, QrcodeOutlined } from '@ant-design/icons';
import agronomyApi from "../../services/api/agronomyApi";

const { Option } = Select;

const SeedMultiplicationForm = ({ onSuccess }) => { // Added onSuccess callback
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetchingParcels, setFetchingParcels] = useState(false);
  const [parcels, setParcels] = useState([]);
  const [trackingCode, setTrackingCode] = useState(null);

  // FETCH PARCELS ON MOUNT
  useEffect(() => {
    const loadParcels = async () => {
      try {
        setFetchingParcels(true);
        const response = await agronomyApi.getLandParcels();
        // Handle Laravel pagination wrapper (data.data) or direct array
        const parcelData = response.data.data || response.data;
        setParcels(parcelData);
      } catch (error) {
        message.error("Failed to load land parcels");
      } finally {
        setFetchingParcels(false);
      }
    };
    loadParcels();
  }, []);

  const handleFinish = async (values) => {
    try {
      setLoading(true);
      const response = await agronomyApi.createSeedMultiplication(values);
      message.success('Seed multiplication record created successfully');
      setTrackingCode(response.data.tracking_code);
      form.resetFields();
      
      if (onSuccess) onSuccess(); // Notify parent to refresh list
      setTimeout(() => setTrackingCode(null), 10000);
    } catch (error) {
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        Object.keys(errors).forEach(key => {
          message.error(errors[key][0]);
        });
      } else {
        message.error('Failed to create seed multiplication record');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Spin spinning={fetchingParcels} tip="Loading Land Parcels...">
      {trackingCode && (
        <Alert
          message="Tracking Code Generated"
          description={`Your tracking code: ${trackingCode}`}
          type="success"
          showIcon
          icon={<QrcodeOutlined />}
          className="mb-4"
          closable
        />
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          inspection_status: 'Pending',
          quantity_produced_quintals: 0,
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="land_parcel_id"
              label="Land Parcel"
              rules={[{ required: true, message: 'Please select a land parcel' }]}
            >
              <Select placeholder="Select land parcel" showSearch optionFilterProp="children">
                {parcels.map(parcel => (
                  <Option key={parcel.id} value={parcel.id}>
                    {parcel.parcel_id_no} ({parcel.total_size_hectares} ha)
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="producer_type"
              label="Producer Type"
              rules={[{ required: true }]}
            >
              <Select placeholder="Select type">
                <Option value="Amhara Seed Enterprise">Amhara Seed Enterprise</Option>
                <Option value="University">University</Option>
                <Option value="Union/Cooperative">Union/Cooperative</Option>
                <Option value="Private Investor">Private Investor</Option>
                <Option value="Model Farmer">Model Farmer</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="producer_name"
              label="Producer Name"
              rules={[{ required: true }]}
            >
              <Input placeholder="Full name of producer/institution" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="crop_commodity"
              label="Crop Commodity"
              rules={[{ required: true }]}
            >
              <Input placeholder="e.g., Wheat, Maize, Teff" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="seed_generation"
              label="Seed Generation"
              rules={[{ required: true }]}
            >
              <Select placeholder="Select generation">
                <Option value="Breeder">Breeder</Option>
                <Option value="Pre-Basic">Pre-Basic</Option>
                <Option value="Basic">Basic</Option>
                <Option value="Certified 1">Certified 1</Option>
                <Option value="Certified 2">Certified 2</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="contract_number"
              label="Contract Number"
              rules={[{ required: true }]}
            >
              <Input placeholder="Unique contract number" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="allocated_area_hectares"
              label="Allocated Area (ha)"
              rules={[{ required: true }]}
            >
              <Input type="number" step="0.01" placeholder="Area in hectares" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="source_seed_origin"
              label="Source Seed Origin"
              rules={[{ required: true }]}
            >
              <Input placeholder="Origin of source seeds" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="inspection_status" label="Inspection Status">
              <Select>
                <Option value="Pending">Pending</Option>
                <Option value="Field Approved">Field Approved</Option>
                <Option value="Field Rejected">Field Rejected</Option>
                <Option value="Lab Certified">Lab Certified</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name="quantity_produced_quintals"
              label="Quantity Produced (quintals)"
            >
              <Input type="number" step="0.01" placeholder="Produced quantity" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item className="mb-0 mt-4">
          <Space>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
              Register Seed Multiplication
            </Button>
            <Button onClick={() => form.resetFields()} icon={<ClearOutlined />}>
              Clear
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Spin>
  );
};

export default SeedMultiplicationForm;