import React, { useState, useEffect } from 'react';
import { 
  Modal, Form, Input, Select, DatePicker, Row, Col, Space, Button, 
  InputNumber, message, Divider, Switch
} from 'antd';
import { SaveOutlined, CloseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { handleApiError } from '../../../utils/errorHandler';
import agronomyApi from '../../../services/api/agronomyApi';

const { Option } = Select;
const { TextArea } = Input;

const SeedVarietyForm = ({
  visible,
  onCancel,
  onSuccess,
  editingRecord,
}) => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!editingRecord;

  useEffect(() => {
    if (editingRecord) {
      form.setFieldsValue({
        ...editingRecord,
        expiry_date: editingRecord.expiry_date ? dayjs(editingRecord.expiry_date) : null,
        certified_date: editingRecord.certified_date ? dayjs(editingRecord.certified_date) : null,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        status: 'active',
        is_certified: false,
      });
    }
  }, [editingRecord, form]);

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const payload = {
        name: values.name,
        crop_type: values.crop_type,
        scientific_name: values.scientific_name,
        seed_class: values.seed_class,
        germination_rate: values.germination_rate,
        purity_percentage: values.purity_percentage,
        moisture_content: values.moisture_content,
        characteristics: values.characteristics,
        recommendations: values.recommendations,
        is_certified: values.is_certified || false,
        expiry_date: values.expiry_date?.format('YYYY-MM-DD'),
        status: values.status || 'active',
      };

      if (isEditing) {
        await agronomyApi.updateSeedVariety(editingRecord.id, payload);
        message.success('Seed variety updated successfully');
      } else {
        await agronomyApi.createSeedVariety(payload);
        message.success('Seed variety created successfully');
      }

      form.resetFields();
      onSuccess();
    } catch (error) {
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat().join(', ');
        message.error(`Validation failed: ${errorMessages}`);
      } else {
        handleApiError(error, 'Operation failed');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      title={isEditing ? 'Edit Seed Variety' : 'Add New Seed Variety'}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={700}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item 
              name="name" 
              label="Variety Name" 
              rules={[{ required: true, message: 'Please enter variety name' }]}
            >
              <Input placeholder="Enter variety name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item 
              name="crop_type" 
              label="Crop Type" 
              rules={[{ required: true, message: 'Please select crop type' }]}
            >
              <Select placeholder="Select crop type" showSearch>
                <Option value="Wheat">Wheat</Option>
                <Option value="Maize">Maize</Option>
                <Option value="Teff">Teff</Option>
                <Option value="Barley">Barley</Option>
                <Option value="Sorghum">Sorghum</Option>
                <Option value="Millet">Millet</Option>
                <Option value="Rice">Rice</Option>
                <Option value="Soybean">Soybean</Option>
                <Option value="Faba Bean">Faba Bean</Option>
                <Option value="Chickpea">Chickpea</Option>
                <Option value="Lentil">Lentil</Option>
                <Option value="Pea">Pea</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="scientific_name" label="Scientific Name">
              <Input placeholder="Enter scientific name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="seed_class" label="Seed Class">
              <Select placeholder="Select seed class">
                <Option value="Breeder">Breeder</Option>
                <Option value="Foundation">Foundation</Option>
                <Option value="Registered">Registered</Option>
                <Option value="Certified">Certified</Option>
                <Option value="Quality Declared">Quality Declared</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">Quality Metrics</Divider>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="germination_rate" label="Germination Rate (%)">
              <InputNumber min={0} max={100} step={0.5} style={{ width: '100%' }} placeholder="Rate" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="purity_percentage" label="Purity (%)">
              <InputNumber min={0} max={100} step={0.5} style={{ width: '100%' }} placeholder="Purity" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="moisture_content" label="Moisture Content (%)">
              <InputNumber min={0} max={100} step={0.5} style={{ width: '100%' }} placeholder="Moisture" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="expiry_date" label="Expiry Date">
              <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="status" label="Status">
              <Select>
                <Option value="active">Active</Option>
                <Option value="inactive">Inactive</Option>
                <Option value="archived">Archived</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name="is_certified" label="Certified" valuePropName="checked">
              <Switch checkedChildren="Yes" unCheckedChildren="No" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="characteristics" label="Characteristics">
          <TextArea rows={3} placeholder="Describe variety characteristics" />
        </Form.Item>

        <Form.Item name="recommendations" label="Recommendations">
          <TextArea rows={2} placeholder="Growing recommendations" />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={isSubmitting} style={{ backgroundColor: '#1b7837', borderColor: '#1b7837' }}>
              <SaveOutlined /> {isEditing ? 'Update Variety' : 'Add Variety'}
            </Button>
            <Button onClick={onCancel}>
              <CloseOutlined /> Cancel
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SeedVarietyForm;