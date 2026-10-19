import React, { useState, useEffect } from 'react';
import { 
  Modal, Form, Input, Select, Row, Col, Space, Button, 
  InputNumber, message, Divider, Steps, Table, Tag, Empty, Switch, DatePicker
} from 'antd';
import { 
  SaveOutlined, CloseOutlined, LeftOutlined, RightOutlined,
  PlusOutlined, DeleteOutlined, TeamOutlined, FundOutlined
} from '@ant-design/icons';
import LocationScopeSelector from '../../components/common/LocationScopeSelector';
import ReusableLocationPicker from '../../components/common/ReusableLocationPicker';
import { handleApiError } from '../../utils/errorHandler';
import { livestockApi } from '../../services/api/livestockApi';
import dayjs from 'dayjs';

const { Option } = Select;
const { Step } = Steps;
const { TextArea } = Input;

const LivestockForm = ({
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

  // Animals and Productions state
  const [animals, setAnimals] = useState([]);
  const [productions, setProductions] = useState([]);
  const [animalFormVisible, setAnimalFormVisible] = useState(false);
  const [productionFormVisible, setProductionFormVisible] = useState(false);
  const [animalForm] = Form.useForm();
  const [productionForm] = Form.useForm();
  const [submittingChild, setSubmittingChild] = useState(false);

  const isEditing = !!editingRecord;

  // Fetch farmers when modal opens
  useEffect(() => {
    if (visible) {
      fetchFarmers();
    }
  }, [visible]);

  // Load existing animals and productions when editing
  useEffect(() => {
    if (editingRecord) {
      setAnimals(editingRecord.animals || []);
      setProductions(editingRecord.productions || []);
    } else {
      setAnimals([]);
      setProductions([]);
    }
  }, [editingRecord]);

  const fetchFarmers = async () => {
    setLoadingFarmers(true);
    try {
      const res = await livestockApi.getFarmers();
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
        production_system: 'semi_intensive',
      });
      setSelectedZoneName('');
      setSelectedWoredaName('');
      setSelectedKebeleName('');
      setSelectedFarmer(null);
      setAnimals([]);
      setProductions([]);
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

    let z = extractLocationName(arg1?.zone_name || arg1?.zone || arg1?.zone_id || arg1);
    let w = extractLocationName(arg1?.woreda_name || arg1?.woreda || arg1?.woreda_id || arg2);
    let k = extractLocationName(arg1?.kebele_name || arg1?.kebele || arg1?.kebele_id || arg3);

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

  // ==================== ANIMAL HANDLERS ====================
  const handleAddAnimal = () => {
    animalForm.resetFields();
    animalForm.setFieldsValue({
      gender: 'both',
      health_status: 'healthy',
      animal_status: 'active',
      is_pregnant: false,
      age_months: 0,
      number_of_offspring: 0,
    });
    setAnimalFormVisible(true);
  };

  const handleAnimalSubmit = async (values) => {
    setSubmittingChild(true);
    try {
      const formattedAnimal = {
        ...values,
        last_calving_date: values.last_calving_date ? values.last_calving_date.format('YYYY-MM-DD') : null,
        expected_calving_date: values.expected_calving_date ? values.expected_calving_date.format('YYYY-MM-DD') : null,
        is_pregnant: values.is_pregnant || false,
        number_of_offspring: values.number_of_offspring || 0,
        age_months: values.age_months || 0,
      };

      if (isEditing && editingRecord?.id) {
        const payload = {
          livestock_farm_id: editingRecord.id,
          ...formattedAnimal,
        };
        const res = await livestockApi.createAnimal(payload);
        const createdAnimal = res.data?.data || res.data;
        setAnimals([...animals, createdAnimal]);
        message.success('Animal added successfully');
      } else {
        const newAnimal = {
          id: `temp_${Date.now()}`,
          ...formattedAnimal,
          is_temp: true,
        };
        setAnimals([...animals, newAnimal]);
        message.success('Animal added locally');
      }

      setAnimalFormVisible(false);
      animalForm.resetFields();
    } catch (error) {
      handleApiError(error, 'Failed to add animal');
    } finally {
      setSubmittingChild(false);
    }
  };

  const handleRemoveAnimal = async (index, record) => {
    if (record?.id && !record.is_temp && String(record.id).indexOf('temp_') === -1) {
      try {
        await livestockApi.deleteAnimal(record.id);
      } catch (e) {
        handleApiError(e, 'Failed to delete animal');
        return;
      }
    }
    const newAnimals = [...animals];
    newAnimals.splice(index, 1);
    setAnimals(newAnimals);
    message.success('Animal removed');
  };

  // ==================== PRODUCTION HANDLERS ====================
  const handleAddProduction = () => {
    productionForm.resetFields();
    productionForm.setFieldsValue({
      production_date: dayjs(),
      quality_grade: 'good',
      validation_status: 'pending',
      unit: 'liters',
      quantity: 0,
    });
    setProductionFormVisible(true);
  };

  const handleProductionSubmit = async (values) => {
    setSubmittingChild(true);
    try {
      const totalValue = values.price_per_unit && values.quantity 
        ? values.price_per_unit * values.quantity 
        : null;

      const formattedProduction = {
        ...values,
        production_date: values.production_date ? values.production_date.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
        total_value: totalValue,
        unit: values.unit || 'liters',
        quality_grade: values.quality_grade || 'good',
        validation_status: values.validation_status || 'pending',
      };

      if (isEditing && editingRecord?.id) {
        const payload = {
          livestock_farm_id: editingRecord.id,
          ...formattedProduction,
        };
        const res = await livestockApi.createProduction(payload);
        const createdProd = res.data?.data || res.data;
        setProductions([...productions, createdProd]);
        message.success('Production record added successfully');
      } else {
        const newProduction = {
          id: `temp_${Date.now()}`,
          ...formattedProduction,
          is_temp: true,
        };
        setProductions([...productions, newProduction]);
        message.success('Production record added locally');
      }

      setProductionFormVisible(false);
      productionForm.resetFields();
    } catch (error) {
      handleApiError(error, 'Failed to add production record');
    } finally {
      setSubmittingChild(false);
    }
  };

  const handleRemoveProduction = async (index, record) => {
    if (record?.id && !record.is_temp && String(record.id).indexOf('temp_') === -1) {
      try {
        await livestockApi.deleteProduction(record.id);
      } catch (e) {
        handleApiError(e, 'Failed to delete production record');
        return;
      }
    }
    const newProductions = [...productions];
    newProductions.splice(index, 1);
    setProductions(newProductions);
    message.success('Production record removed');
  };

  // ==================== STEP NAVIGATION ====================
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
      message.error('Please fill in all required fields on Step 1: Farm Name, Type, Production System, Total Area, and Location.');
    }
  };

  const nextStep2 = async () => {
    setCurrentStep(2);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
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
        allFormValues.zone || allFormValues.zone_name || allFormValues.zone_id || selectedZoneName
      );

      const woreda = extractLocationName(
        allFormValues.woreda || allFormValues.woreda_name || allFormValues.woreda_id || selectedWoredaName
      );

      const kebele = extractLocationName(
        allFormValues.kebele || allFormValues.kebele_name || allFormValues.kebele_id || selectedKebeleName
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
        pasture_area_hectares: values.pasture_area_hectares || 0,
        main_breeds: values.main_breeds,
        water_source: values.water_source,
        feed_source: values.feed_source,
        number_of_workers: values.number_of_workers || 0,
        farm_status: values.farm_status || 'active',
        registration_status: values.registration_status || 'draft',
        remarks: values.remarks,
      };

      if (values.location && values.location.lat) {
        payload.gps_latitude = values.location.lat;
        payload.gps_longitude = values.location.lng;
      }

      let farmId;
      if (isEditing) {
        const response = await livestockApi.updateFarm(editingRecord.id, payload);
        farmId = editingRecord.id;
        message.success('Livestock farm updated successfully');
      } else {
        const response = await livestockApi.createFarm(payload);
        const resData = response.data?.data || response.data;
        farmId = resData?.id;
        message.success('Livestock farm created successfully');
      }

      // Save temporary animals to backend using the valid farmId
      if (farmId && animals.length > 0) {
        for (const animal of animals) {
          if (animal.is_temp || !isEditing) {
            const { id, is_temp, ...animalData } = animal;
            await livestockApi.createAnimal({
              ...animalData,
              livestock_farm_id: farmId,
            });
          }
        }
      }

      // Save temporary productions to backend using the valid farmId
      if (farmId && productions.length > 0) {
        for (const production of productions) {
          if (production.is_temp || !isEditing) {
            const { id, is_temp, ...productionData } = production;
            await livestockApi.createProduction({
              ...productionData,
              livestock_farm_id: farmId,
            });
          }
        }
      }

      form.resetFields();
      setSelectedZoneName('');
      setSelectedWoredaName('');
      setSelectedKebeleName('');
      setSelectedFarmer(null);
      setAnimals([]);
      setProductions([]);
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

  // Animal table columns
  const animalColumns = [
    { title: 'Type', dataIndex: 'animal_type', key: 'animal_type', width: 120 },
    { title: 'Breed', dataIndex: 'breed', key: 'breed', render: (val) => val || '-' },
    { title: 'Tag No.', dataIndex: 'tag_number', key: 'tag_number', render: (val) => val || '-' },
    { title: 'Gender', dataIndex: 'gender', key: 'gender', render: (val) => <Tag color={val === 'male' ? 'blue' : val === 'female' ? 'pink' : 'purple'}>{val}</Tag> },
    { title: 'Age (Months)', dataIndex: 'age_months', key: 'age_months', render: (val) => val || '-' },
    { 
      title: 'Health', 
      dataIndex: 'health_status', 
      key: 'health_status',
      render: (val) => {
        const colors = { healthy: 'green', sick: 'red', under_treatment: 'warning', quarantined: 'orange' };
        return <Tag color={colors[val] || 'default'}>{val}</Tag>;
      }
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record, index) => (
        <Button 
          type="text" 
          danger 
          icon={<DeleteOutlined />} 
          onClick={() => handleRemoveAnimal(index, record)}
          size="small"
        />
      )
    }
  ];

  // Production table columns
  const productionColumns = [
    { title: 'Type', dataIndex: 'production_type', key: 'production_type', width: 100 },
    { title: 'Date', dataIndex: 'production_date', key: 'production_date', render: (val) => val || '-' },
    { title: 'Quantity', dataIndex: 'quantity', key: 'quantity', render: (val, record) => `${val || 0} ${record.unit || 'units'}` },
    { title: 'Quality', dataIndex: 'quality_grade', key: 'quality_grade', render: (val) => <Tag>{val}</Tag> },
    { title: 'Value', dataIndex: 'total_value', key: 'total_value', render: (val) => val ? `${val} ETB` : '-' },
    {
      title: 'Action',
      key: 'action',
      render: (_, record, index) => (
        <Button 
          type="text" 
          danger 
          icon={<DeleteOutlined />} 
          onClick={() => handleRemoveProduction(index, record)}
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
            <span>{isEditing ? 'Edit Livestock Farm' : 'New Livestock Farm'}</span>
            <span style={{ fontSize: 12, color: '#999' }}>
              Step {currentStep + 1} of 3
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
          <Step title="Farm Details" description="Farm & location info" />
          <Step title="Animals" description={`${animals.length} registered`} />
          <Step title="Productions" description={`${productions.length} records`} />
        </Steps>

        <Form form={form} layout="vertical" onFinish={handleSubmit} preserve={true}>
          
          <Form.Item name="farmer_name" hidden><Input /></Form.Item>
          <Form.Item name="farmer_phone" hidden><Input /></Form.Item>

          {/* ==================== STEP 1: FARM DETAILS ==================== */}
          <div style={{ display: currentStep === 0 ? 'block' : 'none' }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item 
                  name="farm_name" 
                  label="Farm Name" 
                  rules={[{ required: true, message: 'Please enter farm name' }]}
                >
                  <Input placeholder="Enter farm name" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="farmer_id" label="Select Farmer">
                  <Select
                    placeholder="Search & select farmer..."
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
              <Col span={8}>
                <Form.Item 
                  name="farm_type" 
                  label="Farm Type" 
                  rules={[{ required: true, message: 'Please select farm type' }]}
                >
                  <Select placeholder="Select type">
                    <Option value="cattle">Cattle</Option>
                    <Option value="sheep">Sheep</Option>
                    <Option value="goat">Goat</Option>
                    <Option value="poultry">Poultry</Option>
                    <Option value="mixed">Mixed</Option>
                    <Option value="other">Other</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item 
                  name="production_system" 
                  label="Production System" 
                  rules={[{ required: true, message: 'Please select production system' }]}
                >
                  <Select placeholder="Select system">
                    <Option value="extensive">Extensive</Option>
                    <Option value="semi_intensive">Semi-Intensive</Option>
                    <Option value="intensive">Intensive</Option>
                    <Option value="pastoral">Pastoral</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item 
                  name="total_area_hectares" 
                  label="Total Area (Ha)" 
                  rules={[{ required: true, message: 'Please enter total area' }]}
                >
                  <InputNumber min={0.01} step={0.01} style={{ width: '100%' }} placeholder="Area" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="pasture_area_hectares" label="Pasture Area (Ha)">
                  <InputNumber min={0} step={0.01} style={{ width: '100%' }} placeholder="Pasture area" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="number_of_workers" label="Number of Workers">
                  <InputNumber min={0} step={1} style={{ width: '100%' }} placeholder="Workers" />
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

          {/* ==================== STEP 2: ANIMALS ==================== */}
          <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
            <Divider orientation="left">
              <TeamOutlined /> Animals 
              <Tag style={{ marginLeft: 8 }}>{animals.length}</Tag>
            </Divider>

            <div style={{ marginBottom: 16 }}>
              <Button 
                type="dashed" 
                icon={<PlusOutlined />} 
                onClick={handleAddAnimal}
                style={{ width: '100%' }}
              >
                Add Animal
              </Button>
            </div>

            {animals.length > 0 ? (
              <Table
                dataSource={animals}
                rowKey={(record) => record.id || record.tag_number || Math.random()}
                pagination={false}
                size="small"
                columns={animalColumns}
                scroll={{ x: 700 }}
              />
            ) : (
              <Empty description="No animals added yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}

            <Form.Item style={{ marginTop: 16 }}>
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Button onClick={prevStep}>
                  <LeftOutlined /> Previous
                </Button>
                <Button type="primary" onClick={nextStep2} style={{ backgroundColor: '#1b7837', borderColor: '#1b7837' }}>
                  Next <RightOutlined />
                </Button>
              </Space>
            </Form.Item>
          </div>

          {/* ==================== STEP 3: PRODUCTIONS & STATUS ==================== */}
          <div style={{ display: currentStep === 2 ? 'block' : 'none' }}>
            <Divider orientation="left">
              <FundOutlined /> Productions 
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
                rowKey={(record) => record.id || Math.random()}
                pagination={false}
                size="small"
                columns={productionColumns}
                scroll={{ x: 700 }}
              />
            ) : (
              <Empty description="No production records added yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}

            <Divider orientation="left">Farm Status</Divider>

            <Row gutter={16}>
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
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item name="remarks" label="Remarks">
                  <TextArea rows={2} placeholder="Additional notes..." />
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

      {/* ==================== ANIMAL FORM MODAL ==================== */}
      <Modal
        title="Add Animal"
        open={animalFormVisible}
        onCancel={() => setAnimalFormVisible(false)}
        footer={null}
        width={700}
        destroyOnClose
      >
        <Form form={animalForm} layout="vertical" onFinish={handleAnimalSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="animal_type" 
                label="Animal Type" 
                rules={[{ required: true, message: 'Please enter animal type' }]}
              >
                <Input placeholder="e.g., Cattle, Sheep, Goat" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="breed" label="Breed">
                <Input placeholder="e.g., Holstein, Boran" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="tag_number" label="Tag Number">
                <Input placeholder="Tag ID" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item 
                name="gender" 
                label="Gender" 
                rules={[{ required: true, message: 'Please select gender' }]}
              >
                <Select>
                  <Option value="male">Male</Option>
                  <Option value="female">Female</Option>
                  <Option value="both">Both</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="age_months" label="Age (Months)">
                <InputNumber min={0} step={1} style={{ width: '100%' }} placeholder="Age" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="weight_kg" label="Weight (kg)">
                <InputNumber min={0} step={0.5} style={{ width: '100%' }} placeholder="Weight" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="color" label="Color">
                <Input placeholder="e.g., Black, White" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="health_status" label="Health Status">
                <Select>
                  <Option value="healthy">Healthy</Option>
                  <Option value="sick">Sick</Option>
                  <Option value="under_treatment">Under Treatment</Option>
                  <Option value="quarantined">Quarantined</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="is_pregnant" label="Is Pregnant" valuePropName="checked">
                <Switch checkedChildren="Yes" unCheckedChildren="No" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="number_of_offspring" label="Number of Offspring">
                <InputNumber min={0} step={1} style={{ width: '100%' }} placeholder="Offspring" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="last_calving_date" label="Last Calving Date">
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="expected_calving_date" label="Expected Calving Date">
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="health_notes" label="Health Notes">
            <TextArea rows={2} placeholder="Health notes..." />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={submittingChild}>
                <SaveOutlined /> Save Animal
              </Button>
              <Button onClick={() => setAnimalFormVisible(false)}>
                <CloseOutlined /> Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* ==================== PRODUCTION FORM MODAL ==================== */}
      <Modal
        title="Add Production Record"
        open={productionFormVisible}
        onCancel={() => setProductionFormVisible(false)}
        footer={null}
        width={700}
        destroyOnClose
      >
        <Form form={productionForm} layout="vertical" onFinish={handleProductionSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="production_type" 
                label="Production Type" 
                rules={[{ required: true, message: 'Please select production type' }]}
              >
                <Select placeholder="Select type">
                  <Option value="milk">Milk</Option>
                  <Option value="meat">Meat</Option>
                  <Option value="egg">Egg</Option>
                  <Option value="wool">Wool</Option>
                  <Option value="leather">Leather</Option>
                  <Option value="other">Other</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="production_date" 
                label="Production Date" 
                rules={[{ required: true, message: 'Please select date' }]}
              >
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item 
                name="quantity" 
                label="Quantity" 
                rules={[{ required: true, message: 'Please enter quantity' }]}
              >
                <InputNumber min={0.01} step={0.01} style={{ width: '100%' }} placeholder="Quantity" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item 
                name="unit" 
                label="Unit"
                rules={[{ required: true, message: 'Please select unit' }]}
              >
                <Select placeholder="Select unit">
                  <Option value="liters">Liters (L)</Option>
                  <Option value="kg">Kilograms (Kg)</Option>
                  <Option value="pcs">Pieces (Pcs)</Option>
                  <Option value="quintal">Quintal</Option>
                  <Option value="tray">Tray</Option>
                  <Option value="grams">Grams (g)</Option>
                  <Option value="heads">Heads / Count</Option>
                  <Option value="other">Other</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="quality_grade" label="Quality Grade">
                <Select placeholder="Select grade">
                  <Option value="excellent">Excellent</Option>
                  <Option value="good">Good</Option>
                  <Option value="fair">Fair</Option>
                  <Option value="poor">Poor</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="price_per_unit" label="Price per Unit (ETB)">
                <InputNumber min={0} step={0.01} style={{ width: '100%' }} placeholder="Price" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="market_destination" label="Market Destination">
                <Input placeholder="Market name" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="quality_notes" label="Quality Notes">
            <TextArea rows={2} placeholder="Quality notes..." />
          </Form.Item>

          <Form.Item name="remarks" label="Remarks">
            <Input placeholder="Additional notes..." />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={submittingChild}>
                <SaveOutlined /> Save Production
              </Button>
              <Button onClick={() => setProductionFormVisible(false)}>
                <CloseOutlined /> Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default LivestockForm;