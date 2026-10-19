import React, { useState, useEffect } from 'react';
import { 
  Modal, Form, Input, Select, DatePicker, Row, Col, Space, Button, 
  InputNumber, message, Divider, Switch, Card, Tabs, Table, Tag,
  Empty, Steps
} from 'antd';
import { 
  PlusOutlined, DeleteOutlined, SaveOutlined, CloseOutlined,
  BugOutlined, WarningOutlined, ThunderboltOutlined, CloudOutlined,
  CheckCircleOutlined, CloseCircleOutlined, FundOutlined,
  LeftOutlined, RightOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import LocationScopeSelector from '../../../components/common/LocationScopeSelector';
import ReusableLocationPicker from '../../../components/common/ReusableLocationPicker';
import { handleApiError } from '../../../utils/errorHandler';
import agronomyApi from '../../../services/api/agronomyApi';

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Step } = Steps;

const CropForm = ({
  visible,
  onCancel,
  onSuccess,
  editingRecord,
  farmers = [],
}) => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedZoneName, setSelectedZoneName] = useState('');
  const [selectedWoredaName, setSelectedWoredaName] = useState('');
  const [selectedKebeleName, setSelectedKebeleName] = useState('');
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  
  // Step state
  const [currentStep, setCurrentStep] = useState(0);
  
  // Production and Harvest states
  const [productions, setProductions] = useState([]);
  const [harvests, setHarvests] = useState([]);
  const [productionFormVisible, setProductionFormVisible] = useState(false);
  const [harvestFormVisible, setHarvestFormVisible] = useState(false);
  const [productionForm] = Form.useForm();
  const [harvestForm] = Form.useForm();
  const [submittingChild, setSubmittingChild] = useState(false);

  const isEditing = !!editingRecord;

  // Load existing productions and harvests when editing
  useEffect(() => {
    if (editingRecord) {
      setProductions(editingRecord.productions || []);
      setHarvests(editingRecord.harvests || []);
    } else {
      setProductions([]);
      setHarvests([]);
    }
  }, [editingRecord]);

  useEffect(() => {
    if (editingRecord) {
      setSelectedZoneName(editingRecord.zone || '');
      setSelectedWoredaName(editingRecord.woreda || '');
      setSelectedKebeleName(editingRecord.kebele || '');

      const farmer = farmers.find(f => f.id === editingRecord.farmer_id);
      if (farmer) {
        setSelectedFarmer(farmer);
      }

      form.setFieldsValue({
        ...editingRecord,
        zone: editingRecord.zone,
        zone_name: editingRecord.zone,
        woreda: editingRecord.woreda,
        woreda_name: editingRecord.woreda,
        kebele: editingRecord.kebele,
        kebele_name: editingRecord.kebele,
        farmer_id: editingRecord.farmer_id || null,
        farmer_name: editingRecord.farmer_name || '',
        farmer_phone: editingRecord.farmer_phone || '',
        location: editingRecord.gps_latitude && editingRecord.gps_longitude ? {
          lat: parseFloat(editingRecord.gps_latitude),
          lng: parseFloat(editingRecord.gps_longitude),
          accuracy: null
        } : null,
        planting_date: editingRecord.planting_date ? dayjs(editingRecord.planting_date) : null,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        production_status: 'planned',
        registration_status: 'draft',
        region: 'Amhara',
        production_method: 'rainfed',
      });
      setSelectedZoneName('');
      setSelectedWoredaName('');
      setSelectedKebeleName('');
      setSelectedFarmer(null);
      setProductions([]);
      setHarvests([]);
    }
  }, [editingRecord, farmers, form]);

  // Reset step when modal opens/closes
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

    if (z) setSelectedZoneName(z);
    if (w) setSelectedWoredaName(w);
    if (k) setSelectedKebeleName(k);
  };

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

  // ==================== PRODUCTION HANDLERS ====================
  const handleAddProduction = () => {
    productionForm.resetFields();
    productionForm.setFieldsValue({
      monitoring_date: dayjs(),
      has_pest: false,
      has_disease: false,
      affected_by_drought: false,
      affected_by_flood: false,
      affected_by_hail: false,
    });
    setProductionFormVisible(true);
  };

  const handleProductionSubmit = async (values) => {
    setSubmittingChild(true);
    try {
      if (editingRecord) {
        const payload = {
          crop_registration_id: editingRecord.id,
          monitoring_date: values.monitoring_date?.format('YYYY-MM-DD'),
          growth_stage: values.growth_stage,
          plant_height_cm: values.plant_height_cm,
          plant_density_per_m2: values.plant_density_per_m2,
          estimated_yield_tons_per_ha: values.estimated_yield_tons_per_ha,
          field_observations: values.field_observations,
          has_pest: values.has_pest || false,
          pest_type: values.pest_type,
          has_disease: values.has_disease || false,
          disease_type: values.disease_type,
          control_measures: values.control_measures,
          affected_by_drought: values.affected_by_drought || false,
          affected_by_flood: values.affected_by_flood || false,
          affected_by_hail: values.affected_by_hail || false,
          weather_impact_notes: values.weather_impact_notes,
          remarks: values.remarks,
        };

        const res = await agronomyApi.createCropProduction(payload);
        setProductions([...productions, res.data]);
        message.success('Production record added successfully');
      } else {
        const newProduction = {
          id: `temp_${Date.now()}`,
          ...values,
          monitoring_date: values.monitoring_date?.format('YYYY-MM-DD'),
          is_temp: true,
        };
        setProductions([...productions, newProduction]);
        message.success('Production record added');
      }
      setProductionFormVisible(false);
      productionForm.resetFields();
    } catch (error) {
      handleApiError(error, 'Failed to add production record');
    } finally {
      setSubmittingChild(false);
    }
  };

  const handleRemoveProduction = (index) => {
    const newProductions = [...productions];
    newProductions.splice(index, 1);
    setProductions(newProductions);
    message.success('Production record removed');
  };

  // ==================== HARVEST HANDLERS ====================
  const handleAddHarvest = () => {
    harvestForm.resetFields();
    harvestForm.setFieldsValue({
      harvest_date: dayjs(),
      validation_status: 'pending',
      harvest_method: 'manual',
      crop_quality: 'good',
      production_losses_tons: 0,
    });
    setHarvestFormVisible(true);
  };

  const handleHarvestSubmit = async (values) => {
    setSubmittingChild(true);
    try {
      if (editingRecord) {
        const payload = {
          crop_registration_id: editingRecord.id,
          harvest_date: values.harvest_date?.format('YYYY-MM-DD'),
          harvest_quantity_tons: values.harvest_quantity_tons,
          actual_yield_tons_per_ha: values.actual_yield_tons_per_ha,
          crop_quality: values.crop_quality,
          production_losses_tons: values.production_losses_tons || 0,
          loss_reason: values.loss_reason,
          loss_description: values.loss_description,
          harvest_method: values.harvest_method,
          labor_person_days: values.labor_person_days,
          storage_method: values.storage_method,
          storage_location: values.storage_location,
          stored_quantity_tons: values.stored_quantity_tons,
          sold_quantity_tons: values.sold_quantity_tons,
          price_per_ton: values.price_per_ton,
          market_destination: values.market_destination,
          validation_status: values.validation_status || 'pending',
          remarks: values.remarks,
        };

        const res = await agronomyApi.createCropHarvest(payload);
        setHarvests([...harvests, res.data]);
        message.success('Harvest record added successfully');
      } else {
        const newHarvest = {
          id: `temp_${Date.now()}`,
          ...values,
          harvest_date: values.harvest_date?.format('YYYY-MM-DD'),
          is_temp: true,
        };
        setHarvests([...harvests, newHarvest]);
        message.success('Harvest record added');
      }
      setHarvestFormVisible(false);
      harvestForm.resetFields();
    } catch (error) {
      handleApiError(error, 'Failed to add harvest record');
    } finally {
      setSubmittingChild(false);
    }
  };

  const handleRemoveHarvest = (index) => {
    const newHarvests = [...harvests];
    newHarvests.splice(index, 1);
    setHarvests(newHarvests);
    message.success('Harvest record removed');
  };

  // ==================== STEP NAVIGATION ====================
  const nextStep = async () => {
    try {
      await form.validateFields([
        'crop_type', 
        'crop_variety', 
        'farm_area_hectares', 
        'planting_date', 
        'production_method'
      ]);
      setCurrentStep(1);
    } catch (error) {
      message.error('Please fill out all required fields on Step 1 correctly.');
      setTimeout(() => {
        const firstError = document.querySelector('.ant-form-item-has-error');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 200);
    }
  };

  const prevStep = () => {
    setCurrentStep(0);
  };

  // ==================== MAIN SUBMIT ====================
  const handleSubmit = async (values) => {
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
        values.zone || values.zone_name || values.zone_id ||
        allFormValues.zone || allFormValues.zone_name || allFormValues.zone_id ||
        selectedZoneName
      );

      const woreda = extractLocationName(
        values.woreda || values.woreda_name || values.woreda_id ||
        allFormValues.woreda || allFormValues.woreda_name || allFormValues.woreda_id ||
        selectedWoredaName
      );

      const kebele = extractLocationName(
        values.kebele || values.kebele_name || values.kebele_id ||
        allFormValues.kebele || allFormValues.kebele_name || allFormValues.kebele_id ||
        selectedKebeleName
      );

      let farmerName = allFormValues.farmer_name || values.farmer_name;
      let farmerPhone = allFormValues.farmer_phone || values.farmer_phone;
      let farmerId = allFormValues.farmer_id || values.farmer_id;

      if (farmerId && !editingRecord) {
        const selectedFarmerData = farmers.find(f => f.id === farmerId);
        if (selectedFarmerData) {
          farmerName = selectedFarmerData.full_name || selectedFarmerData.name || farmerName;
          farmerPhone = selectedFarmerData.phone || selectedFarmerData.phone_number || farmerPhone;
        }
      }

      let payload = {
        crop_type: allFormValues.crop_type || values.crop_type,
        crop_variety: allFormValues.crop_variety || values.crop_variety,
        scientific_name: allFormValues.scientific_name || values.scientific_name,
        farmer_id: farmerId || null,
        farmer_name: farmerName,
        farmer_phone: farmerPhone,
        region: allFormValues.region || values.region || 'Amhara',
        zone: zone,
        woreda: woreda,
        kebele: kebele,
        farm_area_hectares: allFormValues.farm_area_hectares || values.farm_area_hectares,
        planting_date: (allFormValues.planting_date || values.planting_date)?.format('YYYY-MM-DD'),
        production_method: allFormValues.production_method || values.production_method,
        irrigation_type: allFormValues.irrigation_type || values.irrigation_type,
        inputs_used: allFormValues.inputs_used || values.inputs_used,
        expected_yield_tons_per_ha: allFormValues.expected_yield_tons_per_ha || values.expected_yield_tons_per_ha,
        expected_total_production_tons: allFormValues.expected_total_production_tons || values.expected_total_production_tons,
        production_status: allFormValues.production_status || values.production_status || 'planned',
        registration_status: allFormValues.registration_status || values.registration_status || 'draft',
        remarks: allFormValues.remarks || values.remarks,
      };

      const loc = allFormValues.location || values.location;
      if (loc && loc.lat) {
        payload.gps_latitude = loc.lat;
        payload.gps_longitude = loc.lng;
      }

      let response;
      if (isEditing) {
        response = await agronomyApi.updateCropRegistration(editingRecord.id, payload);
        message.success('Crop registration updated successfully');
      } else {
        response = await agronomyApi.createCropRegistration(payload);
        message.success('Crop registered successfully');
        
        const newCropId = response.data?.id || response.data?.data?.id;

        if (newCropId) {
          for (const prod of productions) {
            if (prod.is_temp) {
              const { id, is_temp, ...prodPayload } = prod;
              await agronomyApi.createCropProduction({
                ...prodPayload,
                crop_registration_id: newCropId,
              });
            }
          }
          for (const harv of harvests) {
            if (harv.is_temp) {
              const { id, is_temp, ...harvPayload } = harv;
              await agronomyApi.createCropHarvest({
                ...harvPayload,
                crop_registration_id: newCropId,
              });
            }
          }
        }
      }

      form.resetFields();
      setSelectedZoneName('');
      setSelectedWoredaName('');
      setSelectedKebeleName('');
      setSelectedFarmer(null);
      setProductions([]);
      setHarvests([]);
      setCurrentStep(0);
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

  // Production table columns
  const productionColumns = [
    { title: 'Date', dataIndex: 'monitoring_date', key: 'monitoring_date', render: (val) => val || '-' },
    { title: 'Growth Stage', dataIndex: 'growth_stage', key: 'growth_stage', render: (val) => val?.replace('_', ' ') || '-' },
    { title: 'Height (cm)', dataIndex: 'plant_height_cm', key: 'plant_height_cm', render: (val) => val || '-' },
    { title: 'Est. Yield', dataIndex: 'estimated_yield_tons_per_ha', key: 'estimated_yield_tons_per_ha', render: (val) => val ? `${val} T/Ha` : '-' },
    { 
      title: 'Issues', 
      key: 'issues',
      render: (_, record) => (
        <Space size={4} wrap>
          {record.has_pest && <Tag color="red" icon={<BugOutlined />}>Pest</Tag>}
          {record.has_disease && <Tag color="orange" icon={<WarningOutlined />}>Disease</Tag>}
          {record.affected_by_drought && <Tag color="gold" icon={<ThunderboltOutlined />}>Drought</Tag>}
          {record.affected_by_flood && <Tag color="blue" icon={<CloudOutlined />}>Flood</Tag>}
          {!record.has_pest && !record.has_disease && 
           !record.affected_by_drought && !record.affected_by_flood && (
            <Tag color="green" icon={<CheckCircleOutlined />}>Healthy</Tag>
          )}
        </Space>
      )
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, __, index) => (
        <Button 
          type="text" 
          danger 
          icon={<DeleteOutlined />} 
          onClick={() => handleRemoveProduction(index)}
          size="small"
        />
      )
    }
  ];

  // Harvest table columns
  const harvestColumns = [
    { title: 'Date', dataIndex: 'harvest_date', key: 'harvest_date', render: (val) => val || '-' },
    { title: 'Quantity (Tons)', dataIndex: 'harvest_quantity_tons', key: 'harvest_quantity_tons', render: (val) => val || 0 },
    { title: 'Yield (T/Ha)', dataIndex: 'actual_yield_tons_per_ha', key: 'actual_yield_tons_per_ha', render: (val) => val || 0 },
    { title: 'Quality', dataIndex: 'crop_quality', key: 'crop_quality', render: (val) => <Tag>{val}</Tag> },
    { title: 'Losses', dataIndex: 'production_losses_tons', key: 'production_losses_tons', render: (val) => val || 0 },
    {
      title: 'Action',
      key: 'action',
      render: (_, __, index) => (
        <Button 
          type="text" 
          danger 
          icon={<DeleteOutlined />} 
          onClick={() => handleRemoveHarvest(index)}
          size="small"
        />
      )
    }
  ];

  return (
    <>
      <Modal
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{isEditing ? 'Edit Crop Registration' : 'Register New Crop'}</span>
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
        width={1000}
        destroyOnClose
      >
        <Steps current={currentStep} size="small" style={{ marginBottom: 24 }}>
          <Step title="Crop Information" description="Basic crop details" />
          <Step title="Records & Status" description="Production & Harvest" />
        </Steps>

        <Form 
          form={form} 
          layout="vertical" 
          onFinish={handleSubmit}
          preserve={true} 
        >
          {/* ==================== STEP 1: CROP INFORMATION ==================== */}
          <div style={{ display: currentStep === 0 ? 'block' : 'none' }}>
            <Divider orientation="left">Crop Information</Divider>
            
            <Row gutter={16}>
              <Col span={8}>
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
              <Col span={8}>
                <Form.Item 
                  name="crop_variety" 
                  label="Crop Variety" 
                  rules={[{ required: true, message: 'Please enter crop variety' }]}
                >
                  <Input placeholder="Enter variety name" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="scientific_name" label="Scientific Name">
                  <Input placeholder="Enter scientific name" />
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">Farmer Information</Divider>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="farmer_id" label="Select Farmer">
                  <Select
                    placeholder="Search and select farmer"
                    showSearch
                    optionFilterProp="children"
                    allowClear
                    onChange={handleFarmerSelect}
                    filterOption={(input, option) =>
                      (option?.children?.toString()?.toLowerCase() || '').includes(input.toLowerCase())
                    }
                  >
                    {farmers.map((farmer) => (
                      <Option key={farmer.id} value={farmer.id}>
                        {farmer.full_name || farmer.name || farmer.first_name} {farmer.last_name || ''} - {farmer.phone || farmer.phone_number || ''}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="farmer_phone" label="Farmer Phone">
                  <Input placeholder="Enter phone number" readOnly={!!selectedFarmer} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item name="farmer_name" label="Farmer Name">
                  <Input placeholder="Enter farmer name" readOnly={!!selectedFarmer} />
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">Location</Divider>
            
            <LocationScopeSelector 
              form={form} 
              editingData={editingRecord}
              onLocationChange={handleLocationChange}
            />

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item 
                  name="farm_area_hectares" 
                  label="Farm Area (Ha)" 
                  rules={[{ required: true, message: 'Please enter farm area' }]}
                >
                  <InputNumber min={0.01} step={0.01} style={{ width: '100%' }} placeholder="Area in hectares" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item 
                  name="planting_date" 
                  label="Planting Date" 
                  rules={[{ required: true, message: 'Please select planting date' }]}
                >
                  <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item 
                  name="production_method" 
                  label="Production Method" 
                  rules={[{ required: true, message: 'Please select production method' }]}
                >
                  <Select placeholder="Select method">
                    <Option value="irrigated">Irrigated</Option>
                    <Option value="rainfed">Rainfed</Option>
                    <Option value="mixed">Mixed</Option>
                    <Option value="greenhouse">Greenhouse</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="irrigation_type" label="Irrigation Type">
                  <Input placeholder="e.g., Drip, Sprinkler, Surface" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="inputs_used" label="Inputs Used">
                  <Input placeholder="Fertilizers, seeds, pesticides" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="expected_yield_tons_per_ha" label="Expected Yield (Tons/Ha)">
                  <InputNumber min={0} step={0.1} style={{ width: '100%' }} placeholder="Yield per hectare" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="expected_total_production_tons" label="Expected Total Production (Tons)">
                  <InputNumber min={0} step={0.1} style={{ width: '100%' }} placeholder="Total production" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="production_status" label="Production Status">
                  <Select>
                    <Option value="planned">Planned</Option>
                    <Option value="planted">Planted</Option>
                    <Option value="growing">Growing</Option>
                    <Option value="harvested">Harvested</Option>
                    <Option value="completed">Completed</Option>
                    <Option value="cancelled">Cancelled</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            {/* GPS Location */}
            <Form.Item 
              name="location" 
              label="GPS Coordinates"
              extra="Click on the map or use GPS to set exact location"
            >
              <ReusableLocationPicker autoLocate={!isEditing} />
            </Form.Item>

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
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button onClick={() => {
                  setCurrentStep(0);
                  onCancel();
                }}>
                  <CloseOutlined /> Cancel
                </Button>
                <Button type="primary" onClick={nextStep} style={{ backgroundColor: '#1b7837', borderColor: '#1b7837' }}>
                  Next <RightOutlined />
                </Button>
              </Space>
            </Form.Item>
          </div>

          {/* ==================== STEP 2: RECORDS & STATUS ==================== */}
          <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
            <Divider orientation="left">
              <BugOutlined /> Production Monitoring 
              <Tag style={{ marginLeft: 8 }}>{productions.length}</Tag>
            </Divider>

            <div style={{ marginBottom: 16 }}>
              <Button 
                type="dashed" 
                icon={<PlusOutlined />} 
                onClick={handleAddProduction}
                style={{ width: '100%' }}
              >
                Add Production Record
              </Button>
            </div>

            {productions.length > 0 ? (
              <Table
                dataSource={productions}
                rowKey="id"
                pagination={false}
                size="small"
                columns={productionColumns}
                scroll={{ x: 800 }}
              />
            ) : (
              <Empty description="No production records added yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}

            <Divider orientation="left">
              <FundOutlined /> Harvest Records 
              <Tag style={{ marginLeft: 8 }}>{harvests.length}</Tag>
            </Divider>

            <div style={{ marginBottom: 16 }}>
              <Button 
                type="dashed" 
                icon={<PlusOutlined />} 
                onClick={handleAddHarvest}
                style={{ width: '100%' }}
              >
                Add Harvest Record
              </Button>
            </div>

            {harvests.length > 0 ? (
              <Table
                dataSource={harvests}
                rowKey="id"
                pagination={false}
                size="small"
                columns={harvestColumns}
                scroll={{ x: 800 }}
              />
            ) : (
              <Empty description="No harvest records added yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}

            <Form.Item style={{ marginTop: 16 }}>
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Button onClick={prevStep}>
                  <LeftOutlined /> Previous
                </Button>
                <Space>
                  <Button onClick={() => {
                    setCurrentStep(0);
                    onCancel();
                  }}>
                    <CloseOutlined /> Cancel
                  </Button>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={isSubmitting} 
                    style={{ backgroundColor: '#1b7837', borderColor: '#1b7837' }}
                  >
                    <SaveOutlined /> {isEditing ? 'Update Crop' : 'Register Crop'}
                  </Button>
                </Space>
              </Space>
            </Form.Item>
          </div>
        </Form>
      </Modal>

      {/* ==================== PRODUCTION FORM MODAL ==================== */}
      <Modal
        title="Add Production Monitoring Record"
        open={productionFormVisible}
        onCancel={() => setProductionFormVisible(false)}
        footer={null}
        width={700}
        destroyOnClose
      >
        <Form
          form={productionForm}
          layout="vertical"
          onFinish={handleProductionSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="monitoring_date"
                label="Monitoring Date"
                rules={[{ required: true, message: 'Please select date' }]}
              >
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="growth_stage"
                label="Growth Stage"
                rules={[{ required: true, message: 'Please select growth stage' }]}
              >
                <Select placeholder="Select growth stage">
                  <Option value="germination">Germination</Option>
                  <Option value="vegetative">Vegetative</Option>
                  <Option value="flowering">Flowering</Option>
                  <Option value="fruiting">Fruiting</Option>
                  <Option value="maturity">Maturity</Option>
                  <Option value="senescence">Senescence</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="plant_height_cm" label="Plant Height (cm)">
                <InputNumber min={0} step={0.5} style={{ width: '100%' }} placeholder="Height" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="plant_density_per_m2" label="Plant Density (per m²)">
                <InputNumber min={0} step={1} style={{ width: '100%' }} placeholder="Density" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="estimated_yield_tons_per_ha" label="Est. Yield (T/Ha)">
                <InputNumber min={0} step={0.1} style={{ width: '100%' }} placeholder="Yield" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="field_observations" label="Field Observations">
            <TextArea rows={3} placeholder="Describe field conditions and observations" />
          </Form.Item>

          <Divider orientation="left">Pest & Disease</Divider>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="has_pest" label="Has Pest" valuePropName="checked">
                <Switch checkedChildren="Yes" unCheckedChildren="No" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="has_disease" label="Has Disease" valuePropName="checked">
                <Switch checkedChildren="Yes" unCheckedChildren="No" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="pest_type" label="Pest Type">
                <Input placeholder="e.g., Aphids, Locusts" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="disease_type" label="Disease Type">
                <Input placeholder="e.g., Rust, Blight" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="control_measures" label="Control Measures">
            <TextArea rows={2} placeholder="Describe control measures taken" />
          </Form.Item>

          <Divider orientation="left">Weather Impact</Divider>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="affected_by_drought" label="Drought" valuePropName="checked">
                <Switch checkedChildren="Yes" unCheckedChildren="No" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="affected_by_flood" label="Flood" valuePropName="checked">
                <Switch checkedChildren="Yes" unCheckedChildren="No" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="affected_by_hail" label="Hail" valuePropName="checked">
                <Switch checkedChildren="Yes" unCheckedChildren="No" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="weather_impact_notes" label="Weather Impact Notes">
            <TextArea rows={2} placeholder="Describe weather impact" />
          </Form.Item>

          <Form.Item name="remarks" label="Remarks">
            <Input placeholder="Additional notes" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={submittingChild}>
                <SaveOutlined /> Save Production Record
              </Button>
              <Button onClick={() => setProductionFormVisible(false)}>
                <CloseOutlined /> Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* ==================== HARVEST FORM MODAL ==================== */}
      <Modal
        title="Add Harvest Record"
        open={harvestFormVisible}
        onCancel={() => setHarvestFormVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        <Form
          form={harvestForm}
          layout="vertical"
          onFinish={handleHarvestSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="harvest_date"
                label="Harvest Date"
                rules={[{ required: true, message: 'Please select date' }]}
              >
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="harvest_method"
                label="Harvest Method"
                rules={[{ required: true, message: 'Please select method' }]}
              >
                <Select>
                  <Option value="manual">Manual</Option>
                  <Option value="mechanical">Mechanical</Option>
                  <Option value="combined">Combined</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="harvest_quantity_tons"
                label="Harvest Quantity (Tons)"
                rules={[{ required: true, message: 'Please enter quantity' }]}
              >
                <InputNumber min={0} step={0.1} style={{ width: '100%' }} placeholder="Quantity" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="actual_yield_tons_per_ha"
                label="Actual Yield (T/Ha)"
                rules={[{ required: true, message: 'Please enter yield' }]}
              >
                <InputNumber min={0} step={0.1} style={{ width: '100%' }} placeholder="Yield" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="crop_quality"
                label="Crop Quality"
                rules={[{ required: true, message: 'Please select quality' }]}
              >
                <Select>
                  <Option value="excellent">Excellent</Option>
                  <Option value="good">Good</Option>
                  <Option value="fair">Fair</Option>
                  <Option value="poor">Poor</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="production_losses_tons" label="Production Losses (Tons)">
                <InputNumber min={0} step={0.1} style={{ width: '100%' }} placeholder="Losses" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="loss_reason" label="Loss Reason">
                <Select placeholder="Select reason">
                  <Option value="disease">Disease</Option>
                  <Option value="pest">Pest</Option>
                  <Option value="flood">Flood</Option>
                  <Option value="drought">Drought</Option>
                  <Option value="storm">Storm</Option>
                  <Option value="animal">Animal</Option>
                  <Option value="theft">Theft</Option>
                  <Option value="other">Other</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="labor_person_days" label="Labor (Person-Days)">
                <InputNumber min={0} step={1} style={{ width: '100%' }} placeholder="Labor" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="loss_description" label="Loss Description">
            <TextArea rows={2} placeholder="Describe the losses in detail" />
          </Form.Item>

          <Divider orientation="left">Post-Harvest</Divider>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="storage_method" label="Storage Method">
                <Input placeholder="e.g., Sacks, Silo" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="storage_location" label="Storage Location">
                <Input placeholder="Storage place" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="stored_quantity_tons" label="Stored Quantity (Tons)">
                <InputNumber min={0} step={0.1} style={{ width: '100%' }} placeholder="Stored" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="sold_quantity_tons" label="Sold Quantity (Tons)">
                <InputNumber min={0} step={0.1} style={{ width: '100%' }} placeholder="Sold" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="price_per_ton" label="Price per Ton (ETB)">
                <InputNumber min={0} step={1} style={{ width: '100%' }} placeholder="Price" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="market_destination" label="Market Destination">
                <Input placeholder="Market name" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="remarks" label="Remarks">
            <Input placeholder="Additional notes" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={submittingChild}>
                <SaveOutlined /> Save Harvest Record
              </Button>
              <Button onClick={() => setHarvestFormVisible(false)}>
                <CloseOutlined /> Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default CropForm;