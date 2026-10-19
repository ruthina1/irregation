import React, { useState, useEffect, useCallback } from 'react';
import {
  Form,
  Input,
  Select,
  Button,
  Row,
  Col,
  Divider,
  Space,
  InputNumber,
  message
} from 'antd';
import {
  SaveOutlined,
  EnvironmentOutlined,
  UserOutlined,
  ProfileOutlined,
  GlobalOutlined
} from '@ant-design/icons';

import agronomyApi from "../../services/api/agronomyApi";
import api from "../../services/axios"; 

// ───── REUSABLE ENTERPRISE COMPONENTS ─────
import LocationScopeSelector from '../../components/common/LocationScopeSelector';
import ReusableLocationPicker from '../../components/common/ReusableLocationPicker';

const { Option } = Select;

const LandParcelForm = ({
  onSuccess,
  initialData
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [farmers, setFarmers] = useState([]); 
  const [fetchingFarmers, setFetchingFarmers] = useState(false); 

  // Watch kebele_id automatically set by LocationScopeSelector
  const selectedKebeleId = Form.useWatch('kebele_id', form);

  // Fetch Farmers for the selected Kebele
  const fetchFarmers = useCallback(async (kebeleId) => {
    if (!kebeleId) {
      setFarmers([]);
      return;
    }
    setFetchingFarmers(true);
    try {
      const res = await api.get(`/extension/farmers?kebele_id=${kebeleId}`);
      setFarmers(res.data.data?.data || res.data.data || res.data || []);
    } catch (err) {
      console.error("Failed to load farmers:", err);
    } finally {
      setFetchingFarmers(false);
    }
  }, []);

  // Automatically refresh Farmer list when Kebele Selection changes
  useEffect(() => {
    if (selectedKebeleId) {
      fetchFarmers(selectedKebeleId);
    } else {
      setFarmers([]);
    }
  }, [selectedKebeleId, fetchFarmers]);

  // ───── INITIALIZATION ─────
  useEffect(() => {
    if (initialData) {
      loadEditData();
    } else {
      form.resetFields();
      form.setFieldsValue({
        erosion_status: 'None'
      });
      setFarmers([]);
    }
  }, [initialData]);

  const loadEditData = () => {
    try {
      form.setFieldsValue({
        parcel_id_no: initialData.parcel_id_no,
        holding_certificate_no: initialData.holding_certificate_no,
        farmer_id: initialData.farmer_id,
        kebele_id: initialData.kebele_id,
        total_size_hectares: initialData.total_size_hectares,
        land_use_type: initialData.land_use_type,
        slope_category: initialData.slope_category,
        soil_type: initialData.soil_type,
        erosion_status: initialData.erosion_status,
        existing_swc_interventions: initialData.existing_swc_interventions || [],
        
        // ───── MAP DATA BINDING (DB -> Component) ─────
        location: initialData.location ? {
          lat: initialData.location.latitude,
          lng: initialData.location.longitude,
          accuracy: initialData.location.accuracy_meters
        } : null
      });
    } catch (err) {
      message.error('Failed to load edit data');
    }
  };

  // ───── SUBMISSION ─────
  const onFinish = async (values) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        parcel_id_no: values.parcel_id_no?.trim()
      };

      // ✅ REMOVED the delete statements so zone_id and woreda_id are sent to the API

      // ───── MAP DATA TRANSFORM (Component -> DB Payload) ─────
      if (payload.location && payload.location.lat) {
        payload.location = {
          latitude: payload.location.lat,
          longitude: payload.location.lng,
          accuracy_meters: payload.location.accuracy || null
        };
      } else {
        delete payload.location;
      }

      if (initialData) {
        await agronomyApi.updateLandParcel(initialData.id, payload);
        message.success('Land parcel updated successfully');
      } else {
        await agronomyApi.createLandParcel(payload);
        message.success('Land parcel registered successfully');
      }

      form.resetFields();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.log(error.response);
      const errors = error.response?.data?.errors;
      if (errors) {
        Object.values(errors).forEach((err) => {
          message.error(err[0]);
        });
      } else {
        message.error(error.response?.data?.message || 'Submission failed');
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={{ erosion_status: 'None' }}
    >
      {/* 1. Geographic Location */}
      <Divider orientation="left" style={{ marginTop: 0 }}>
        <EnvironmentOutlined /> Geographic Location
      </Divider>

      <Row gutter={16}>
        {/* ───── 1. REUSABLE ROLE-SCOPE AWARE LOCATION BOUNDARY SELECTOR ───── */}
        <Col span={24}>
          <LocationScopeSelector form={form} editingData={initialData} />
        </Col>

        {/* ───── 2. REUSABLE GIS MAP LOCATION PICKER FIELD ───── */}
        <Col span={24}>
          <Form.Item
            name="location"
            label={<span style={{ fontWeight: 600, fontSize: '14px' }}><GlobalOutlined /> Parcel Center GIS Coordinates</span>}
          >
            <ReusableLocationPicker autoLocate={!initialData} />
          </Form.Item>
        </Col>
      </Row>

      {/* 2. Parcel and Owner Information */}
      <Divider orientation="left">
        <UserOutlined /> Parcel & Owner Information
      </Divider>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name="parcel_id_no"
            label="Parcel ID Number"
            rules={[{ required: true, message: 'Please enter parcel ID number' }]}
          >
            <Input placeholder="e.g. LP-10023" />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            name="holding_certificate_no"
            label="Holding Certificate No"
          >
            <Input placeholder="Optional certificate number" />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            name="farmer_id"
            label="Owner (Select Farmer)"
            rules={[{ required: true, message: 'Please select a farmer' }]}
          >
            <Select
              placeholder={selectedKebeleId ? "Select a Farmer in this Kebele" : "Select Kebele first..."}
              allowClear
              showSearch
              optionFilterProp="children"
              disabled={!selectedKebeleId} 
              loading={fetchingFarmers}
            >
              {farmers.map(f => (
                <Option key={f.id} value={f.id}>
                  {f.full_name || `${f.first_name || ''} ${f.last_name || ''}`} ({f.farmer_unique_id_no || f.id})
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      {/* 3. Soil & Land Profile */}
      <Divider orientation="left">
        <ProfileOutlined /> Soil & Land Profile
      </Divider>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name="total_size_hectares"
            label="Size (Hectares)"
            rules={[{ required: true, message: 'Please enter parcel size' }]}
          >
            <InputNumber step={0.1} min={0.01} style={{ width: '100%' }} />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            name="land_use_type"
            label="Land Use"
            rules={[{ required: true, message: 'Please select land use' }]}
          >
            <Select>
              <Option value="Rainfed Crop">Rainfed Crop</Option>
              <Option value="Irrigated Land">Irrigated Land</Option>
              <Option value="Forest/Woodlot">Forest/Woodlot</Option>
              <Option value="Grazing Land">Grazing Land</Option>
            </Select>
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            name="soil_type"
            label="Soil Type"
            rules={[{ required: true, message: 'Please select soil type' }]}
          >
            <Select>
              <Option value="Vertisol (Black)">Vertisol (Black)</Option>
              <Option value="Nitosol (Red)">Nitosol (Red)</Option>
              <Option value="Cambisol">Cambisol</Option>
              <Option value="Fluvisol">Fluvisol</Option>
              <Option value="Other">Other</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="slope_category"
            label="Slope Category"
            rules={[{ required: true, message: 'Please select slope category' }]}
          >
            <Select>
              <Option value="Flat (0-3%)">Flat (0-3%)</Option>
              <Option value="Gentle (3-8%)">Gentle (3-8%)</Option>
              <Option value="Medium (8-30%)">Medium (8-30%)</Option>
              <Option value="Steep (>30%)">Steep (&gt;30%)</Option>
            </Select>
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            name="erosion_status"
            label="Erosion Status"
          >
            <Select>
              <Option value="None">None</Option>
              <Option value="Rill Erosion">Rill Erosion</Option>
              <Option value="Gully Erosion">Gully Erosion</Option>
              <Option value="Sheet Erosion">Sheet Erosion</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="existing_swc_interventions"
        label="SWC Interventions"
      >
        <Select mode="multiple" placeholder="Select interventions">
          <Option value="Stone Bunds">Stone Bunds</Option>
          <Option value="Soil Bunds">Soil Bunds</Option>
          <Option value="Check-dams">Check-dams</Option>
          <Option value="Terracing">Terracing</Option>
          <Option value="Grass Strips">Grass Strips</Option>
        </Select>
      </Form.Item>

      <div style={{ textAlign: 'right', marginTop: 24 }}>
        <Space>
          <Button onClick={() => form.resetFields()}>
            Reset
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            icon={<SaveOutlined />}
            loading={loading}
          >
            {initialData ? 'Update Parcel' : 'Register Parcel'}
          </Button>
        </Space>
      </div>
    </Form>
  );
};

export default LandParcelForm;