import React, { useState, useEffect } from 'react';
import {
  Form,
  Select,
  InputNumber,
  Button,
  message,
  Row,
  Col,
  Space,
  Alert,
  Divider,
  Spin,
  Input
} from 'antd';

import {
  SaveOutlined,
  ClearOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';

import agronomyApi from "../../services/api/agronomyApi";

const { Option } = Select;

const CropProductionForm = ({
  initialData = null,
  selectedParcelId = null,
  onSuccess,
  onCancel
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetchingParcels, setFetchingParcels] = useState(false);
  const [parcels, setParcels] = useState([]);
  const [fertilizers, setFertilizers] = useState({});

  const isEdit = !!initialData;

  // Fetch parcels
  useEffect(() => {
    const fetchParcels = async () => {
      setFetchingParcels(true);

      try {
        const response = await agronomyApi.getLandParcels();
        setParcels(response.data.data || []);
      } catch (error) {
        message.error('Failed to load land parcels');
      } finally {
        setFetchingParcels(false);
      }
    };

    fetchParcels();
  }, []);

  // Populate form
  useEffect(() => {
    if (initialData) {
      form.setFieldsValue({
        ...initialData,
        crop_year: initialData.crop_year
          ? initialData.crop_year.replace(' E.C', '')
          : '',
        land_parcel_id:
          initialData.land_parcel_id || selectedParcelId,
      });

      if (initialData.fertilizer_applied_json) {
        setFertilizers(initialData.fertilizer_applied_json);
      }
    } else if (selectedParcelId) {
      form.setFieldValue('land_parcel_id', selectedParcelId);
    }
  }, [initialData, selectedParcelId, form]);

  // Fertilizer change
  const handleFertilizerChange = (type, value) => {
    setFertilizers(prev => ({
      ...prev,
      [type]:
        value !== null && value !== undefined
          ? Number(value)
          : null
    }));
  };

  // API Error Handler
  const handleApiError = (error) => {
    console.log(error);

    if (error.response?.status === 422) {
      const errors = error.response.data.errors || {};

      // Set errors directly on form fields
      const formattedErrors = Object.keys(errors).map(field => ({
        name: field,
        errors: Array.isArray(errors[field])
          ? errors[field]
          : [errors[field]]
      }));

      form.setFields(formattedErrors);

      // Show first validation error
      const firstError = Object.values(errors)[0];

      if (Array.isArray(firstError)) {
        message.error(firstError[0]);
      } else {
        message.error(firstError);
      }
    } else if (error.response?.data?.message) {
      message.error(error.response.data.message);
    } else {
      message.error(
        isEdit
          ? 'Failed to update crop production record'
          : 'Failed to create crop production record'
      );
    }
  };

  // Submit
  const handleFinish = async (values) => {
    try {
      setLoading(true);

      const payload = {
        ...values,

        // Automatically append E.C
        crop_year: `${values.crop_year} E.C`,

        fertilizer_applied_json:
          Object.keys(fertilizers).length > 0
            ? fertilizers
            : null,
      };

      let response;

      if (isEdit) {
        response = await agronomyApi.updateSeasonalCrop(
          initialData.id,
          payload
        );

        message.success(
          'Crop production record updated successfully'
        );
      } else {
        response = await agronomyApi.createSeasonalCrop(
          payload
        );

        message.success(
          'Crop production record created successfully'
        );
      }

      form.resetFields();
      setFertilizers({});

      if (onSuccess) {
        onSuccess(response.data.data);
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Spin spinning={loading}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          season: 'Meher',
          crop_category: 'Cereals',
          status: 'Planted',
          harvested_area_hectares: 0,
          actual_yield_quintals: 0,
          post_harvest_loss_quintals: 0,
        }}
      >
        <Space style={{ marginBottom: 16 }}>
          {onCancel && (
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={onCancel}
            >
              Back
            </Button>
          )}

          <h2>
            {isEdit
              ? 'Edit Crop Production Record'
              : 'New Crop Production Record'}
          </h2>
        </Space>

        <Alert
          message="Validation Note"
          description="Harvested area cannot exceed cultivated area. All numeric fields accept decimals."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="land_parcel_id"
              label="Land Parcel"
              rules={[
                {
                  required: true,
                  message: 'Please select a land parcel'
                }
              ]}
            >
              <Select
                placeholder="Select land parcel"
                loading={fetchingParcels}
                disabled={fetchingParcels || isEdit}
              >
                {parcels.map(parcel => (
                  <Option
                    key={parcel.id}
                    value={parcel.id}
                  >
                    {parcel.parcel_id_no} -{' '}
                    {parcel.total_size_hectares} ha
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              name="season"
              label="Season"
              rules={[{ required: true }]}
            >
              <Select>
                <Option value="Meher">Meher</Option>
                <Option value="Belg">Belg</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              name="crop_year"
              label="Crop Year"
              rules={[
                {
                  required: true,
                  message: 'Crop year is required'
                },
                {
                  pattern: /^\d{4}$/,
                  message:
                    'Crop year must be 4 digits only'
                }
              ]}
            >
              <Input
                placeholder="2018"
                maxLength={4}
                onInput={(e) => {
                  e.target.value = e.target.value.replace(
                    /[^0-9]/g,
                    ''
                  );
                }}
                addonAfter="E.C"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="crop_category"
              label="Crop Category"
              rules={[{ required: true }]}
            >
              <Select>
                <Option value="Cereals">Cereals</Option>
                <Option value="Pulses">Pulses</Option>
                <Option value="Oilseeds">Oilseeds</Option>
                <Option value="Vegetables">Vegetables</Option>
                <Option value="Fruits">Fruits</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              name="commodity_name"
              label="Commodity Name"
              rules={[
                {
                  required: true,
                  message: 'Commodity name is required'
                }
              ]}
            >
              <Input placeholder="e.g., Teff, Wheat, Maize" />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              name="seed_type_used"
              label="Seed Type Used"
              rules={[
                {
                  required: true,
                  message: 'Seed type is required'
                }
              ]}
            >
              <Input placeholder="e.g., Improved, Local" />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">
          Fertilizer Application (kg)
        </Divider>

        <Row gutter={16}>
          {['NPS', 'Urea', 'DAP'].map(type => (
            <Col span={8} key={type}>
              <Form.Item label={`${type} (kg)`}>
                <InputNumber
                  style={{ width: '100%' }}
                  step="0.01"
                  min={0}
                  placeholder="0.00"
                  value={fertilizers[`${type}_kg`] || null}
                  onChange={(value) =>
                    handleFertilizerChange(
                      `${type}_kg`,
                      value
                    )
                  }
                />
              </Form.Item>
            </Col>
          ))}
        </Row>

        <Divider orientation="left">
          Production Details
        </Divider>

        <Row gutter={16}>
          <Col span={6}>
            <Form.Item
              name="cultivated_area_hectares"
              label="Cultivated Area (ha)"
              rules={[
                {
                  required: true,
                  message:
                    'Cultivated area is required'
                }
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                step="0.01"
                min={0.01}
                placeholder="e.g. 2.5"
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              name="expected_yield_quintals"
              label="Expected Yield (quintals)"
              rules={[
                {
                  required: true,
                  message:
                    'Expected yield is required'
                }
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                step="0.01"
                min={0}
                placeholder="e.g. 25"
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              name="harvested_area_hectares"
              label="Harvested Area (ha)"
            >
              <InputNumber
                style={{ width: '100%' }}
                step="0.01"
                min={0}
                placeholder="e.g. 2.0"
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              name="actual_yield_quintals"
              label="Actual Yield (quintals)"
            >
              <InputNumber
                style={{ width: '100%' }}
                step="0.01"
                min={0}
                placeholder="e.g. 20"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="post_harvest_loss_quintals"
              label="Post-Harvest Loss (quintals)"
            >
              <InputNumber
                style={{ width: '100%' }}
                step="0.01"
                min={0}
                placeholder="e.g. 1.5"
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              name="status"
              label="Status"
            >
              <Select>
                <Option value="Planted">Planted</Option>
                <Option value="Growing">Growing</Option>
                <Option value="Harvested">Harvested</Option>
                <Option value="Damaged">Damaged</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Divider />

        <Form.Item>
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={loading}
            >
              {isEdit
                ? 'Update Record'
                : 'Save Crop Production'}
            </Button>

            <Button
              onClick={() => form.resetFields()}
              icon={<ClearOutlined />}
            >
              Clear Form
            </Button>

            {onCancel && (
              <Button onClick={onCancel}>
                Cancel
              </Button>
            )}
          </Space>
        </Form.Item>
      </Form>
    </Spin>
  );
};

export default CropProductionForm;