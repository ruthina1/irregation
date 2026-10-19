import React, { useState, useEffect } from 'react';
import { 
  Modal, Form, Input, Select, DatePicker, Row, Col, Space, Button, 
  InputNumber, message, Divider, Steps
} from 'antd';
import { 
  SaveOutlined, CloseOutlined, LeftOutlined, RightOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import ReusableLocationPicker from '../../../components/common/ReusableLocationPicker';
import { handleApiError } from '../../../utils/errorHandler';
import agronomyApi from '../../../services/api/agronomyApi';

const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;

const SeedForm = ({
  visible,
  onCancel,
  onSuccess,
  editingRecord,
  farmers = [],
}) => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [varieties, setVarieties] = useState([]);

  // Location dropdown data states
  const [zones, setZones] = useState([]);
  const [woredas, setWoredas] = useState([]);
  const [kebeles, setKebeles] = useState([]);

  const isEditing = !!editingRecord;

  useEffect(() => {
    if (visible) {
      fetchVarieties();
      fetchZones();
    }
  }, [visible]);

  const fetchVarieties = async () => {
    try {
      const res = await agronomyApi.getSeedVarieties({ status: 'active' });
      const varietyList = Array.isArray(res.data) ? res.data : (res.data?.data || res.data?.varieties || []);
      setVarieties(varietyList);
    } catch (error) {
      console.error('Failed to fetch varieties:', error);
      setVarieties([]);
    }
  };

  const fetchZones = async () => {
    try {
      const res = await agronomyApi.getZones();
      setZones(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Failed to fetch zones:', error);
    }
  };

  const handleZoneChange = async (zoneId) => {
    form.setFieldsValue({ woreda: undefined, kebele: undefined });
    setWoredas([]);
    setKebeles([]);
    if (!zoneId) return;

    try {
      const res = await agronomyApi.getWoredas(zoneId);
      setWoredas(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Failed to fetch woredas:', error);
    }
  };

  const handleWoredaChange = async (woredaId) => {
    form.setFieldsValue({ kebele: undefined });
    setKebeles([]);
    if (!woredaId) return;

    try {
      const res = await agronomyApi.getKebeles(woredaId);
      setKebeles(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Failed to fetch kebeles:', error);
    }
  };

  useEffect(() => {
    if (editingRecord) {
      const farmer = farmers.find(f => f.id === editingRecord.farmer_id);
      if (farmer) setSelectedFarmer(farmer);

      // Pre-load Woredas/Kebeles if editing an existing record
      if (editingRecord.zone) {
        agronomyApi.getWoredas(editingRecord.zone).then(res => setWoredas(res.data || []));
      }
      if (editingRecord.woreda) {
        agronomyApi.getKebeles(editingRecord.woreda).then(res => setKebeles(res.data || []));
      }

      form.setFieldsValue({
        ...editingRecord,
        variety_id: editingRecord.variety_id || editingRecord.variety?.id,
        region: editingRecord.region || 'Amhara',
        zone: editingRecord.zone,
        woreda: editingRecord.woreda,
        kebele: editingRecord.kebele,
        farmer_id: editingRecord.farmer_id || null,
        farmer_name: editingRecord.farmer_name || '',
        farmer_phone: editingRecord.farmer_phone || '',
        location: editingRecord.gps_latitude && editingRecord.gps_longitude ? {
          lat: parseFloat(editingRecord.gps_latitude),
          lng: parseFloat(editingRecord.gps_longitude),
          accuracy: null
        } : null,
        planting_date: editingRecord.planting_date ? dayjs(editingRecord.planting_date) : null,
        harvest_date: editingRecord.harvest_date ? dayjs(editingRecord.harvest_date) : null,
        expiry_date: editingRecord.expiry_date ? dayjs(editingRecord.expiry_date) : null,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        registration_status: 'draft',
        certification_status: 'pending',
        region: 'Amhara',
      });
      setWoredas([]);
      setKebeles([]);
      setSelectedFarmer(null);
    }
  }, [editingRecord, farmers, form]);

  useEffect(() => {
    if (!visible) {
      setCurrentStep(0);
    }
  }, [visible]);

  const handleFarmerSelect = (farmerId) => {
    const farmer = farmers.find(f => f.id === farmerId);
    if (farmer) {
      setSelectedFarmer(farmer);
      form.setFieldsValue({
        farmer_name: farmer.full_name || farmer.name || farmer.first_name || '',
        farmer_phone: farmer.phone || farmer.phone_number || '',
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
      await form.validateFields([
        'variety_id', 
        'production_quantity_tons', 
        'area_planted_hectares', 
        'planting_date',
        'region',
        'zone',
        'woreda',
        'kebele'
      ]);
      
      setCurrentStep(1);
    } catch (error) {
      console.error('Validation error:', error);
      message.error('Please fill in all required fields on Step 1.');
    }
  };

  const prevStep = () => {
    setCurrentStep(0);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const values = await form.validateFields();

      let payload = {
        variety_id: values.variety_id,
        farmer_id: values.farmer_id || null,
        farmer_name: values.farmer_name || '',
        farmer_phone: values.farmer_phone || '',
        region: values.region || 'Amhara',
        zone: values.zone,
        woreda: values.woreda,
        kebele: values.kebele,
        production_quantity_tons: values.production_quantity_tons,
        area_planted_hectares: values.area_planted_hectares,
        planting_date: values.planting_date ? values.planting_date.format('YYYY-MM-DD') : null,
        harvest_date: values.harvest_date ? values.harvest_date.format('YYYY-MM-DD') : null,
        germination_rate: values.germination_rate,
        purity_percentage: values.purity_percentage,
        moisture_content: values.moisture_content,
        physical_purity: values.physical_purity,
        health_status: values.health_status,
        certification_status: values.certification_status || 'pending',
        expiry_date: values.expiry_date ? values.expiry_date.format('YYYY-MM-DD') : null,
        storage_location: values.storage_location,
        storage_condition: values.storage_condition,
        stored_quantity_tons: values.stored_quantity_tons,
        registration_status: values.registration_status || 'draft',
        remarks: values.remarks,
      };

      if (values.location && values.location.lat) {
        payload.gps_latitude = values.location.lat;
        payload.gps_longitude = values.location.lng;
      }

      if (isEditing) {
        await agronomyApi.updateSeedRegistration(editingRecord.id, payload);
        message.success('Seed registration updated successfully');
      } else {
        await agronomyApi.createSeedRegistration(payload);
        message.success('Seed registered successfully');
      }

      form.resetFields();
      setSelectedFarmer(null);
      setCurrentStep(0);
      onSuccess();
    } catch (error) {
      console.error('Submission Error:', error);
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const errorMessages = Object.entries(errors)
          .map(([field, msgs]) => `${field}: ${msgs.join(', ')}`)
          .join(' | ');
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
          <span>{isEditing ? 'Edit Seed Registration' : 'Register New Seed'}</span>
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
        <Step title="Seed Information" description="Variety & Production" />
        <Step title="Quality & Status" description="Certification & Details" />
      </Steps>

      <Form form={form} layout="vertical" onFinish={handleSubmit} preserve={true}>
        
        {/* STEP 0: Variety & Production */}
        <div style={{ display: currentStep === 0 ? 'block' : 'none' }}>
          <Divider orientation="left">Seed Variety & Production</Divider>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item 
                name="variety_id" 
                label="Seed Variety" 
                rules={[{ required: true, message: 'Please select seed variety' }]}
              >
                <Select placeholder="Select seed variety" showSearch optionFilterProp="children">
                  {varieties.map((variety) => (
                    <Option key={variety.id} value={variety.id}>
                      {variety.name} ({variety.crop_type}) 
                      {variety.seed_class ? ` - ${variety.seed_class}` : ''}
                      {variety.is_certified ? ' ✅' : ''}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item 
                name="production_quantity_tons" 
                label="Production Quantity (Tons)" 
                rules={[{ required: true, message: 'Please enter quantity' }]}
              >
                <InputNumber min={0.01} step={0.01} style={{ width: '100%' }} placeholder="Quantity" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item 
                name="area_planted_hectares" 
                label="Area Planted (Ha)" 
                rules={[{ required: true, message: 'Please enter area' }]}
              >
                <InputNumber min={0.01} step={0.01} style={{ width: '100%' }} placeholder="Area" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item 
                name="planting_date" 
                label="Planting Date" 
                rules={[{ required: true, message: 'Please select date' }]}
              >
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="harvest_date" label="Harvest Date">
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="farmer_id" label="Select Farmer">
                <Select
                  placeholder="Search and select farmer"
                  showSearch
                  optionFilterProp="children"
                  allowClear
                  onChange={handleFarmerSelect}
                >
                  {farmers.map((farmer) => (
                    <Option key={farmer.id} value={farmer.id}>
                      {farmer.full_name || farmer.name || farmer.first_name} - {farmer.phone || farmer.phone_number || ''}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="farmer_name" label="Farmer Name">
                <Input placeholder="Enter farmer name" readOnly={!!selectedFarmer} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="farmer_phone" label="Farmer Phone">
                <Input placeholder="Enter phone number" readOnly={!!selectedFarmer} />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Location Details</Divider>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="region" label="Region" rules={[{ required: true, message: 'Region is required' }]}>
                <Input readOnly defaultValue="Amhara" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="zone" label="Zone" rules={[{ required: true, message: 'Please select zone' }]}>
                <Select placeholder="Select Zone" showSearch optionFilterProp="children" onChange={handleZoneChange} allowClear>
                  {zones.map(z => <Option key={z.id} value={z.id}>{z.name}</Option>)}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="woreda" label="Woreda" rules={[{ required: true, message: 'Please select woreda' }]}>
                <Select placeholder="Select Woreda" showSearch optionFilterProp="children" onChange={handleWoredaChange} allowClear>
                  {woredas.map(w => <Option key={w.id} value={w.id}>{w.name}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="kebele" label="Kebele" rules={[{ required: true, message: 'Please select kebele' }]}>
                <Select placeholder="Select Kebele" showSearch optionFilterProp="children" allowClear>
                  {kebeles.map(k => <Option key={k.id} value={k.id}>{k.name}</Option>)}
                </Select>
              </Form.Item>
            </Col>
          </Row>

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

        {/* STEP 1: Quality & Certification */}
        <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
          <Divider orientation="left">Quality & Certification</Divider>

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
              <Form.Item name="physical_purity" label="Physical Purity (%)">
                <InputNumber min={0} max={100} step={0.5} style={{ width: '100%' }} placeholder="Physical Purity" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="expiry_date" label="Expiry Date">
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="health_status" label="Health Status">
            <TextArea rows={2} placeholder="Describe seed health status" />
          </Form.Item>

          <Divider orientation="left">Storage</Divider>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="storage_location" label="Storage Location">
                <Input placeholder="Storage location" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="storage_condition" label="Storage Condition">
                <Input placeholder="e.g., Cool, Dry, Ventilated" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="stored_quantity_tons" label="Stored Quantity (Tons)">
                <InputNumber min={0} step={0.01} style={{ width: '100%' }} placeholder="Stored quantity" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="certification_status" label="Certification Status">
                <Select>
                  <Option value="pending">Pending</Option>
                  <Option value="in_progress">In Progress</Option>
                  <Option value="certified">Certified</Option>
                  <Option value="rejected">Rejected</Option>
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
                  onClick={handleSubmit} 
                  loading={isSubmitting} 
                  style={{ backgroundColor: '#1b7837', borderColor: '#1b7837' }}
                >
                  <SaveOutlined /> {isEditing ? 'Update Seed' : 'Register Seed'}
                </Button>
              </Space>
            </Space>
          </Form.Item>
        </div>

      </Form>
    </Modal>
  );
};

export default SeedForm;