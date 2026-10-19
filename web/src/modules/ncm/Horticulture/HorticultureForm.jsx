import React, { useState, useEffect } from 'react';
import { 
  Modal, Form, Input, Select, Row, Col, Space, Button, 
  InputNumber, message, Divider, Steps 
} from 'antd';
import { SaveOutlined, CloseOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import LocationScopeSelector from '../../../components/common/LocationScopeSelector';
import ReusableLocationPicker from '../../../components/common/ReusableLocationPicker';
import { handleApiError } from '../../../utils/errorHandler';
import horticultureApi from '../../../services/api/horticultureApi';

const { Option } = Select;
const { Step } = Steps;

const HorticultureForm = ({
  visible,
  onCancel,
  onSuccess,
  editingRecord,
}) => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedZoneName, setSelectedZoneName] = useState('');
  const [selectedWoredaName, setSelectedWoredaName] = useState('');
  const [selectedKebeleName, setSelectedKebeleName] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [farmers, setFarmers] = useState([]);
  const [loadingFarmers, setLoadingFarmers] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState(null);

  const isEditing = !!editingRecord;

  // Fetch farmers directly from backend table when modal opens
  useEffect(() => {
    if (visible) {
      fetchFarmers();
    }
  }, [visible]);

  const fetchFarmers = async () => {
    setLoadingFarmers(true);
    try {
      const res = await horticultureApi.getFarmers();
      const list = Array.isArray(res.data) 
        ? res.data 
        : (res.data?.data && Array.isArray(res.data.data) ? res.data.data : []);
      setFarmers(list);
    } catch (error) {
      console.error('Failed to fetch farmers:', error);
      setFarmers([]);
    } finally {
      setLoadingFarmers(false);
    }
  };

  useEffect(() => {
    if (editingRecord) {
      setSelectedZoneName(editingRecord.zone || '');
      setSelectedWoredaName(editingRecord.woreda || '');
      setSelectedKebeleName(editingRecord.kebele || '');

      const farmer = farmers.find(f => String(f.id) === String(editingRecord.farmer_id));
      if (farmer) {
        setSelectedFarmer(farmer);
      }

      form.setFieldsValue({
        ...editingRecord,
        farmer_id: editingRecord.farmer_id ? Number(editingRecord.farmer_id) : null,
        farmer_name: editingRecord.farmer_name || farmer?.full_name || farmer?.name || '',
        farmer_phone: editingRecord.farmer_phone || farmer?.phone || farmer?.phone_number || '',
        zone: editingRecord.zone,
        zone_name: editingRecord.zone,
        woreda: editingRecord.woreda,
        woreda_name: editingRecord.woreda,
        kebele: editingRecord.kebele,
        kebele_name: editingRecord.kebele,
        location: editingRecord.gps_latitude && editingRecord.gps_longitude ? {
          lat: parseFloat(editingRecord.gps_latitude),
          lng: parseFloat(editingRecord.gps_longitude),
          accuracy: null
        } : null,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        region: 'Amhara',
        farm_status: 'active',
        registration_status: 'draft',
        production_system: 'open_field',
      });
      setSelectedZoneName('');
      setSelectedWoredaName('');
      setSelectedKebeleName('');
      setSelectedFarmer(null);
    }
  }, [editingRecord, farmers, form]);

  useEffect(() => {
    if (!visible) {
      setCurrentStep(0);
    }
  }, [visible]);

  const handleLocationChange = (arg1, arg2, arg3) => {
    const extractLocationName = (val) => {
      if (!val && val !== 0) return '';
      if (typeof val === 'string') return val;
      if (typeof val === 'number') return String(val);
      if (typeof val === 'object') {
        return val.label || val.name || val.zone_name || val.woreda_name || val.kebele_name || val.value || val.title || '';
      }
      return '';
    };

    let z = '';
    let w = '';
    let k = '';

    if (arg1 && typeof arg1 === 'object' && !arg1.label && !arg1.name) {
      z = extractLocationName(arg1.zone_name || arg1.zone || arg1.zone_id);
      w = extractLocationName(arg1.woreda_name || arg1.woreda || arg1.woreda_id);
      k = extractLocationName(arg1.kebele_name || arg1.kebele || arg1.kebele_id);
    } else {
      z = extractLocationName(arg1);
      w = extractLocationName(arg2);
      k = extractLocationName(arg3);
    }

    if (z) {
      setSelectedZoneName(z);
      form.setFieldsValue({ zone: z, zone_name: z });
    }
    if (w) {
      setSelectedWoredaName(w);
      form.setFieldsValue({ woreda: w, woreda_name: w });
    }
    if (k) {
      setSelectedKebeleName(k);
      form.setFieldsValue({ kebele: k, kebele_name: k });
    }
  };

  const handleFarmerSelect = (farmerId) => {
    if (!farmerId) {
      setSelectedFarmer(null);
      form.setFieldsValue({
        farmer_id: null,
        farmer_name: '',
        farmer_phone: '',
      });
      return;
    }

    const farmer = farmers.find(f => String(f.id) === String(farmerId));
    if (farmer) {
      setSelectedFarmer(farmer);
      const name = farmer.full_name || farmer.name || farmer.first_name || '';
      const phone = farmer.phone || farmer.phone_number || farmer.mobile || '';
      form.setFieldsValue({
        farmer_id: farmer.id,
        farmer_name: name,
        farmer_phone: phone,
      });
    } else {
      setSelectedFarmer(null);
      form.setFieldsValue({
        farmer_name: '',
        farmer_phone: '',
      });
    }
  };

  const nextStep = async () => {
    try {
      form.setFieldsValue({
        zone: form.getFieldValue('zone') || selectedZoneName,
        woreda: form.getFieldValue('woreda') || selectedWoredaName,
        kebele: form.getFieldValue('kebele') || selectedKebeleName,
        region: form.getFieldValue('region') || 'Amhara'
      });

      await form.validateFields([
        'farm_name', 
        'farm_type', 
        'production_system', 
        'total_area_hectares',
        'region',
        'zone',
        'woreda',
        'kebele'
      ]);

      setCurrentStep(1);
    } catch (error) {
      console.error('Validation error:', error);
      message.error('Please fill in all required fields: Farm Name, Farm Type, Production System, Total Area, Zone, Woreda, and Kebele.');
    }
  };

  const prevStep = () => {
    setCurrentStep(0);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const allFormValues = form.getFieldsValue(true);

      const extractLocationName = (val) => {
        if (!val && val !== 0) return '';
        if (typeof val === 'string') return val;
        if (typeof val === 'number') return String(val);
        if (typeof val === 'object') {
          return val.label || val.name || val.zone_name || val.woreda_name || val.kebele_name || val.value || val.title || '';
        }
        return '';
      };

      const zone = extractLocationName(
        allFormValues.zone || allFormValues.zone_name || allFormValues.zone_id ||
        selectedZoneName
      );

      const woreda = extractLocationName(
        allFormValues.woreda || allFormValues.woreda_name || allFormValues.woreda_id ||
        selectedWoredaName
      );

      const kebele = extractLocationName(
        allFormValues.kebele || allFormValues.kebele_name || allFormValues.kebele_id ||
        selectedKebeleName
      );

      const values = await form.validateFields();

      let payload = {
        farmer_id: values.farmer_id || null,
        farmer_name: values.farmer_name || (selectedFarmer ? (selectedFarmer.full_name || selectedFarmer.name) : ''),
        farmer_phone: values.farmer_phone || (selectedFarmer ? (selectedFarmer.phone || selectedFarmer.phone_number) : ''),
        farm_name: values.farm_name,
        farm_type: values.farm_type,
        production_system: values.production_system,
        region: values.region || 'Amhara',
        zone: zone,
        woreda: woreda,
        kebele: kebele,
        total_area_hectares: values.total_area_hectares,
        cultivated_area_hectares: values.cultivated_area_hectares,
        main_crops: values.main_crops,
        irrigation_source: values.irrigation_source,
        soil_type: values.soil_type,
        number_of_workers: values.number_of_workers,
        farm_status: values.farm_status || 'active',
        registration_status: values.registration_status || 'draft',
        remarks: values.remarks,
      };

      if (values.location && values.location.lat) {
        payload.gps_latitude = values.location.lat;
        payload.gps_longitude = values.location.lng;
      }

      if (isEditing) {
        await horticultureApi.updateFarm(editingRecord.id, payload);
        message.success('Horticulture farm updated successfully');
      } else {
        await horticultureApi.createFarm(payload);
        message.success('Horticulture farm created successfully');
      }

      form.resetFields();
      setSelectedZoneName('');
      setSelectedWoredaName('');
      setSelectedKebeleName('');
      setSelectedFarmer(null);
      setCurrentStep(0);
      onSuccess();
    } catch (error) {
      console.error('Submission error:', error);
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
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{isEditing ? 'Edit Horticulture Farm' : 'New Horticulture Farm'}</span>
          <span style={{ fontSize: 12, color: '#999' }}>
            Step {currentStep + 1} of 2
          </span>
        </div>
      }
      open={visible}
      onCancel={() => {
        setCurrentStep(0);
        onCancel();
      }}
      footer={null}
      width={900}
      destroyOnClose
    >
      <Steps current={currentStep} size="small" style={{ marginBottom: 24 }}>
        <Step title="Farm Details" description="Farm & location info" />
        <Step title="Additional Info" description="Crops & status" />
      </Steps>

      <Form form={form} layout="vertical" onFinish={handleSubmit} preserve={true}>
        
        {/* Hidden form fields to maintain farmer name and phone state for submission */}
        <Form.Item name="farmer_name" hidden><Input /></Form.Item>
        <Form.Item name="farmer_phone" hidden><Input /></Form.Item>

        {/* ==================== STEP 1 ==================== */}
        <div style={{ display: currentStep === 0 ? 'block' : 'none' }}>
          
          {/* TOP ROW: FARM NAME & FARMER NAME */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="farm_name" 
                label="Farm Name" 
                rules={[{ required: true, message: 'Please enter farm name' }]}
              >
                <Input placeholder="Enter farm name (e.g., Green Valley Plot)" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="farmer_id" label="Farmer Name">
                <Select
                  placeholder="Search & select farmer from database..."
                  showSearch
                  allowClear
                  loading={loadingFarmers}
                  onChange={handleFarmerSelect}
                  optionLabelProp="label"
                  filterOption={(input, option) =>
                    String(option?.searchValue || option?.children || '')
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  notFoundContent={loadingFarmers ? 'Loading farmers...' : 'No farmers found'}
                >
                  {farmers.map((farmer) => {
                    const fullName = farmer.full_name || farmer.name || 'Unknown Farmer';
                    const idNo = farmer.farmer_unique_id_no ? ` (${farmer.farmer_unique_id_no})` : '';
                    const phone = (farmer.phone || farmer.phone_number) ? ` - ${farmer.phone || farmer.phone_number}` : '';
                    const fullSearchText = `${fullName}${idNo}${phone}`;

                    return (
                      <Option 
                        key={farmer.id} 
                        value={farmer.id} 
                        label={fullName}
                        searchValue={fullSearchText}
                      >
                        {fullSearchText}
                      </Option>
                    );
                  })}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="farm_type" 
                label="Farm Type" 
                rules={[{ required: true, message: 'Please select farm type' }]}
              >
                <Select placeholder="Select type">
                  <Option value="vegetable">Vegetable</Option>
                  <Option value="fruit">Fruit</Option>
                  <Option value="spice">Spice</Option>
                  <Option value="flower">Flower</Option>
                  <Option value="herb">Herb</Option>
                  <Option value="mixed">Mixed</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="production_system" 
                label="Production System" 
                rules={[{ required: true, message: 'Please select production system' }]}
              >
                <Select placeholder="Select system">
                  <Option value="open_field">Open Field</Option>
                  <Option value="greenhouse">Greenhouse</Option>
                  <Option value="shade_net">Shade Net</Option>
                  <Option value="hydroponic">Hydroponic</Option>
                  <Option value="mixed">Mixed</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="total_area_hectares" 
                label="Total Area (Ha)" 
                rules={[{ required: true, message: 'Please enter total area' }]}
              >
                <InputNumber min={0.01} step={0.01} style={{ width: '100%' }} placeholder="Area in hectares" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="cultivated_area_hectares" label="Cultivated Area (Ha)">
                <InputNumber min={0} step={0.01} style={{ width: '100%' }} placeholder="Cultivated area" />
              </Form.Item>
            </Col>
          </Row>

          {/* LOCATION DETAILS */}
          <Divider orientation="left">Location</Divider>

          <LocationScopeSelector 
            form={form} 
            editingData={editingRecord}
            onLocationChange={handleLocationChange}
          />

          <Form.Item 
            name="location" 
            label="GPS Coordinates"
            extra="Click on the map or use GPS to set exact location"
          >
            <ReusableLocationPicker autoLocate={!isEditing} />
          </Form.Item>

          <Form.Item style={{ marginTop: 16 }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => { setCurrentStep(0); onCancel(); }}>
                <CloseOutlined /> Cancel
              </Button>
              <Button type="primary" onClick={nextStep} style={{ backgroundColor: '#1b7837', borderColor: '#1b7837' }}>
                Next <RightOutlined />
              </Button>
            </Space>
          </Form.Item>
        </div>

        {/* ==================== STEP 2 ==================== */}
        <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
          <Divider orientation="left">Crops & Operations</Divider>

          <Form.Item name="main_crops" label="Main Crops">
            <Input placeholder="e.g., Tomato, Onion, Cabbage" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="irrigation_source" label="Irrigation Source">
                <Input placeholder="e.g., River, Well, Drip" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="soil_type" label="Soil Type">
                <Select placeholder="Select soil type">
                  <Option value="clay">Clay</Option>
                  <Option value="loam">Loam</Option>
                  <Option value="sandy">Sandy</Option>
                  <Option value="silt">Silt</Option>
                  <Option value="mixed">Mixed</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="number_of_workers" label="Number of Workers">
                <InputNumber min={0} step={1} style={{ width: '100%' }} placeholder="Workers" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="farm_status" label="Farm Status">
                <Select>
                  <Option value="active">Active</Option>
                  <Option value="inactive">Inactive</Option>
                  <Option value="under_development">Under Development</Option>
                  <Option value="closed">Closed</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="registration_status" label="Registration Status">
                <Select>
                  <Option value="draft">Draft</Option>
                  <Option value="submitted">Submitted</Option>
                  <Option value="under_review">Under Review</Option>
                  <Option value="approved">Approved</Option>
                  <Option value="rejected">Rejected</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="remarks" label="Remarks">
                <Input placeholder="Additional notes..." />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginTop: 16 }}>
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <Button onClick={prevStep}>
                <LeftOutlined /> Previous
              </Button>
              <Space>
                <Button onClick={() => { setCurrentStep(0); onCancel(); }}>
                  <CloseOutlined /> Cancel
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={isSubmitting} 
                  style={{ backgroundColor: '#1b7837', borderColor: '#1b7837' }}
                >
                  <SaveOutlined /> {isEditing ? 'Update' : 'Create'}
                </Button>
              </Space>
            </Space>
          </Form.Item>
        </div>

      </Form>
    </Modal>
  );
};

export default HorticultureForm;