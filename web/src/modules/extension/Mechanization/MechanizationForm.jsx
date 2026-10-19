import React, { useState, useEffect } from 'react';
import { 
  Modal, Form, Input, Select, Row, Col, Space, Button, 
  InputNumber, message, Divider, Steps, Table, Tag, Empty, DatePicker
} from 'antd';
import { 
  SaveOutlined, CloseOutlined, LeftOutlined, RightOutlined,
  PlusOutlined, DeleteOutlined, ToolOutlined, FundOutlined
} from '@ant-design/icons';
import LocationScopeSelector from '../../../components/common/LocationScopeSelector';
import ReusableLocationPicker from '../../../components/common/ReusableLocationPicker';
import { handleApiError } from '../../../utils/errorHandler';
import { extensionApi } from '../../../services/api/extensionApi';
import dayjs from 'dayjs';

const { Option } = Select;
const { Step } = Steps;
const { TextArea } = Input;

const MechanizationForm = ({
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

  // Allocations and Maintenances state
  const [allocations, setAllocations] = useState([]);
  const [maintenances, setMaintenances] = useState([]);
  const [allocationFormVisible, setAllocationFormVisible] = useState(false);
  const [maintenanceFormVisible, setMaintenanceFormVisible] = useState(false);
  const [allocationForm] = Form.useForm();
  const [maintenanceForm] = Form.useForm();
  const [submittingChild, setSubmittingChild] = useState(false);

  const isEditing = !!editingRecord;

  // Fetch farmers when modal opens
  useEffect(() => {
    if (visible) {
      fetchFarmers();
    }
  }, [visible]);

  // Load existing allocations and maintenances when editing
  useEffect(() => {
    if (editingRecord) {
      setAllocations(editingRecord.allocations || []);
      setMaintenances(editingRecord.maintenances || []);
    } else {
      setAllocations([]);
      setMaintenances([]);
    }
  }, [editingRecord]);

  const fetchFarmers = async () => {
    setLoadingFarmers(true);
    try {
      const res = await extensionApi.getMechanizationFarmers();
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
        condition_status: 'good',
        operational_status: 'operational',
        registration_status: 'draft',
        ownership_type: 'government',
      });
      setSelectedZoneName('');
      setSelectedWoredaName('');
      setSelectedKebeleName('');
      setSelectedFarmer(null);
      setAllocations([]);
      setMaintenances([]);
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

  // ==================== ALLOCATION HANDLERS ====================
  const handleAddAllocation = () => {
    allocationForm.resetFields();
    allocationForm.setFieldsValue({
      allocation_date: dayjs(),
      allocation_status: 'pending',
      approval_status: 'pending',
      allocated_quantity: 1,
    });
    setAllocationFormVisible(true);
  };

  const handleAllocationSubmit = async (values) => {
    setSubmittingChild(true);
    try {
      if (editingRecord?.id) {
        const payload = {
          equipment_id: editingRecord.id,
          farmer_id: values.farmer_id || null,
          farmer_name: values.farmer_name || '',
          farmer_phone: values.farmer_phone || '',
          allocated_quantity: values.allocated_quantity || 1,
          allocation_date: values.allocation_date ? values.allocation_date.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
          return_date: values.return_date ? values.return_date.format('YYYY-MM-DD') : null,
          purpose: values.purpose,
          region: values.region || 'Amhara',
          zone: values.zone || '',
          woreda: values.woreda || '',
          kebele: values.kebele || '',
          allocation_status: values.allocation_status || 'pending',
          approval_status: values.approval_status || 'pending',
          remarks: values.remarks,
        };

        const res = await extensionApi.createMechanizationAllocation(payload);
        const createdAlloc = res.data?.data || res.data;
        setAllocations([...allocations, createdAlloc]);
        message.success('Allocation added successfully');
      } else {
        const newAllocation = {
          id: `temp_${Date.now()}`,
          ...values,
          allocation_date: values.allocation_date ? values.allocation_date.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
          return_date: values.return_date ? values.return_date.format('YYYY-MM-DD') : null,
          is_temp: true,
        };
        setAllocations([...allocations, newAllocation]);
        message.success('Allocation added');
      }
      setAllocationFormVisible(false);
      allocationForm.resetFields();
    } catch (error) {
      handleApiError(error, 'Failed to add allocation');
    } finally {
      setSubmittingChild(false);
    }
  };

  const handleRemoveAllocation = async (index, record) => {
    if (record?.id && !record.is_temp && String(record.id).indexOf('temp_') === -1) {
      try {
        await extensionApi.deleteMechanizationAllocation(record.id);
      } catch (e) {
        handleApiError(e, 'Failed to delete allocation');
        return;
      }
    }
    const newAllocations = [...allocations];
    newAllocations.splice(index, 1);
    setAllocations(newAllocations);
    message.success('Allocation removed');
  };

  // ==================== MAINTENANCE HANDLERS ====================
  const handleAddMaintenance = () => {
    maintenanceForm.resetFields();
    maintenanceForm.setFieldsValue({
      maintenance_date: dayjs(),
      maintenance_status: 'scheduled',
      approval_status: 'pending',
    });
    setMaintenanceFormVisible(true);
  };

  const handleMaintenanceSubmit = async (values) => {
    setSubmittingChild(true);
    try {
      if (editingRecord?.id) {
        const payload = {
          equipment_id: editingRecord.id,
          maintenance_type: values.maintenance_type,
          maintenance_date: values.maintenance_date ? values.maintenance_date.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
          description: values.description,
          work_done: values.work_done,
          cost: values.cost,
          parts_replaced: values.parts_replaced,
          labor_hours: values.labor_hours,
          maintenance_status: values.maintenance_status || 'scheduled',
          approval_status: values.approval_status || 'pending',
          remarks: values.remarks,
        };

        const res = await extensionApi.createMechanizationMaintenance(payload);
        const createdMaint = res.data?.data || res.data;
        setMaintenances([...maintenances, createdMaint]);
        message.success('Maintenance record added successfully');
      } else {
        const newMaintenance = {
          id: `temp_${Date.now()}`,
          ...values,
          maintenance_date: values.maintenance_date ? values.maintenance_date.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
          is_temp: true,
        };
        setMaintenances([...maintenances, newMaintenance]);
        message.success('Maintenance record added');
      }
      setMaintenanceFormVisible(false);
      maintenanceForm.resetFields();
    } catch (error) {
      handleApiError(error, 'Failed to add maintenance record');
    } finally {
      setSubmittingChild(false);
    }
  };

  const handleRemoveMaintenance = async (index, record) => {
    if (record?.id && !record.is_temp && String(record.id).indexOf('temp_') === -1) {
      try {
        await extensionApi.deleteMechanizationMaintenance(record.id);
      } catch (e) {
        handleApiError(e, 'Failed to delete maintenance');
        return;
      }
    }
    const newMaintenances = [...maintenances];
    newMaintenances.splice(index, 1);
    setMaintenances(newMaintenances);
    message.success('Maintenance record removed');
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
        'equipment_name',
        'equipment_type',
        'ownership_type',
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
        equipment_name: values.equipment_name,
        equipment_type: values.equipment_type,
        model: values.model,
        serial_number: values.serial_number,
        manufacturer: values.manufacturer,
        manufacturing_year: values.manufacturing_year,
        horsepower: values.horsepower,
        fuel_type: values.fuel_type,
        fuel_capacity_liters: values.fuel_capacity_liters,
        color: values.color,
        weight_kg: values.weight_kg,
        ownership_type: values.ownership_type,
        farmer_id: values.farmer_id || null,
        farmer_name: values.farmer_name || (selectedFarmer ? (selectedFarmer.full_name || selectedFarmer.name) : ''),
        farmer_phone: values.farmer_phone || (selectedFarmer ? (selectedFarmer.phone || selectedFarmer.phone_number) : ''),
        region: values.region || 'Amhara',
        zone: zone,
        woreda: woreda,
        kebele: kebele,
        condition_status: values.condition_status || 'good',
        operational_status: values.operational_status || 'operational',
        registration_status: values.registration_status || 'draft',
        remarks: values.remarks,
      };

      if (values.location && values.location.lat) {
        payload.gps_latitude = values.location.lat;
        payload.gps_longitude = values.location.lng;
      }

      let equipmentId;
      if (isEditing) {
        await extensionApi.createMechanizationEquipment ? 
          extensionApi.updateMechanizationEquipment(editingRecord.id, payload) :
          extensionApi.updateEquipment(editingRecord.id, payload);
        equipmentId = editingRecord.id;
        message.success('Equipment updated successfully');
      } else {
        const createFn = extensionApi.createMechanizationEquipment || extensionApi.createEquipment;
        const response = await createFn(payload);
        const resData = response.data?.data || response.data;
        equipmentId = resData?.id;
        message.success('Equipment registered successfully');
      }

      // Save allocations to backend
      if (equipmentId && allocations.length > 0) {
        const allocFn = extensionApi.createMechanizationAllocation || extensionApi.createAllocation;
        for (const allocation of allocations) {
          if (allocation.is_temp || !isEditing) {
            const { id, is_temp, ...allocationData } = allocation;
            await allocFn({
              ...allocationData,
              equipment_id: equipmentId,
            });
          }
        }
      }

      // Save maintenances to backend
      if (equipmentId && maintenances.length > 0) {
        const maintFn = extensionApi.createMechanizationMaintenance || extensionApi.createMaintenance;
        for (const maintenance of maintenances) {
          if (maintenance.is_temp || !isEditing) {
            const { id, is_temp, ...maintenanceData } = maintenance;
            await maintFn({
              ...maintenanceData,
              equipment_id: equipmentId,
            });
          }
        }
      }

      form.resetFields();
      setSelectedZoneName('');
      setSelectedWoredaName('');
      setSelectedKebeleName('');
      setSelectedFarmer(null);
      setAllocations([]);
      setMaintenances([]);
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

  // Allocation table columns
  const allocationColumns = [
    { title: 'Farmer', dataIndex: 'farmer_name', key: 'farmer_name', render: (val) => val || '-' },
    { title: 'Date', dataIndex: 'allocation_date', key: 'allocation_date', render: (val) => val || '-' },
    { title: 'Qty', dataIndex: 'allocated_quantity', key: 'allocated_quantity', render: (val) => val || 1 },
    { title: 'Return Date', dataIndex: 'return_date', key: 'return_date', render: (val) => val || '-' },
    { title: 'Status', dataIndex: 'allocation_status', key: 'allocation_status', render: (val) => <Tag>{val}</Tag> },
    {
      title: 'Action',
      key: 'action',
      render: (_, record, index) => (
        <Button 
          type="text" 
          danger 
          icon={<DeleteOutlined />} 
          onClick={() => handleRemoveAllocation(index, record)}
          size="small"
        />
      )
    }
  ];

  // Maintenance table columns
  const maintenanceColumns = [
    { title: 'Type', dataIndex: 'maintenance_type', key: 'maintenance_type' },
    { title: 'Date', dataIndex: 'maintenance_date', key: 'maintenance_date', render: (val) => val || '-' },
    { title: 'Cost', dataIndex: 'cost', key: 'cost', render: (val) => val ? `${val} ETB` : '-' },
    { title: 'Labor (Hrs)', dataIndex: 'labor_hours', key: 'labor_hours', render: (val) => val || '-' },
    { title: 'Status', dataIndex: 'maintenance_status', key: 'maintenance_status', render: (val) => <Tag>{val}</Tag> },
    {
      title: 'Action',
      key: 'action',
      render: (_, record, index) => (
        <Button 
          type="text" 
          danger 
          icon={<DeleteOutlined />} 
          onClick={() => handleRemoveMaintenance(index, record)}
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
            <span>{isEditing ? 'Edit Equipment' : 'Register Equipment'}</span>
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
          <Step title="Equipment Details" description="Basic equipment info" />
          <Step title="Allocations" description={`${allocations.length} records`} />
          <Step title="Maintenance" description={`${maintenances.length} records`} />
        </Steps>

        <Form form={form} layout="vertical" onFinish={handleSubmit} preserve={true}>
          
          {/* Hidden form fields */}
          <Form.Item name="farmer_name" hidden><Input /></Form.Item>
          <Form.Item name="farmer_phone" hidden><Input /></Form.Item>

          {/* ==================== STEP 1: EQUIPMENT DETAILS ==================== */}
          <div style={{ display: currentStep === 0 ? 'block' : 'none' }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item 
                  name="equipment_name" 
                  label="Equipment Name" 
                  rules={[{ required: true, message: 'Please enter equipment name' }]}
                >
                  <Input placeholder="e.g., John Deere Tractor" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item 
                  name="equipment_type" 
                  label="Equipment Type" 
                  rules={[{ required: true, message: 'Please select equipment type' }]}
                >
                  <Select placeholder="Select type">
                    <Option value="Tractor">Tractor</Option>
                    <Option value="Harvester">Harvester</Option>
                    <Option value="Plow">Plow</Option>
                    <Option value="Cultivator">Cultivator</Option>
                    <Option value="Seeder">Seeder</Option>
                    <Option value="Sprayer">Sprayer</Option>
                    <Option value="Irrigation Pump">Irrigation Pump</Option>
                    <Option value="Other">Other</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="model" label="Model">
                  <Input placeholder="Model number" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="serial_number" label="Serial Number">
                  <Input placeholder="Serial number" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="manufacturer" label="Manufacturer">
                  <Input placeholder="Manufacturer name" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="manufacturing_year" label="Year">
                  <InputNumber min={1900} max={new Date().getFullYear()} style={{ width: '100%' }} placeholder="Year" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="horsepower" label="Horsepower">
                  <InputNumber min={0} step={0.5} style={{ width: '100%' }} placeholder="HP" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="fuel_type" label="Fuel Type">
                  <Select placeholder="Select fuel type">
                    <Option value="Diesel">Diesel</Option>
                    <Option value="Petrol">Petrol</Option>
                    <Option value="Electric">Electric</Option>
                    <Option value="Solar">Solar</Option>
                    <Option value="Other">Other</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="fuel_capacity_liters" label="Fuel Capacity (Liters)">
                  <InputNumber min={0} step={0.5} style={{ width: '100%' }} placeholder="Liters" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="weight_kg" label="Weight (kg)">
                  <InputNumber min={0} step={0.5} style={{ width: '100%' }} placeholder="Weight" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="color" label="Color">
                  <Input placeholder="Color" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item 
                  name="ownership_type" 
                  label="Ownership Type" 
                  rules={[{ required: true, message: 'Please select ownership type' }]}
                >
                  <Select placeholder="Select ownership">
                    <Option value="government">Government</Option>
                    <Option value="private">Private</Option>
                    <Option value="cooperative">Cooperative</Option>
                    <Option value="rental">Rental</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="farmer_id" label="Select Farmer (if private)">
                  <Select
                    placeholder="Search farmer..."
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

          {/* ==================== STEP 2: ALLOCATIONS ==================== */}
          <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
            <Divider orientation="left">
              <ToolOutlined /> Allocations 
              <Tag style={{ marginLeft: 8 }}>{allocations.length}</Tag>
            </Divider>

            <div style={{ marginBottom: 16 }}>
              <Button 
                type="dashed" 
                icon={<PlusOutlined />} 
                onClick={handleAddAllocation}
                style={{ width: '100%' }}
              >
                Add Allocation
              </Button>
            </div>

            {allocations.length > 0 ? (
              <Table
                dataSource={allocations}
                rowKey={(record) => record.id || Math.random()}
                pagination={false}
                size="small"
                columns={allocationColumns}
                scroll={{ x: 700 }}
              />
            ) : (
              <Empty description="No allocations added yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
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

          {/* ==================== STEP 3: MAINTENANCE & STATUS ==================== */}
          <div style={{ display: currentStep === 2 ? 'block' : 'none' }}>
            <Divider orientation="left">
              <FundOutlined /> Maintenance Records 
              <Tag style={{ marginLeft: 8 }}>{maintenances.length}</Tag>
            </Divider>

            <div style={{ marginBottom: 16 }}>
              <Button 
                type="dashed" 
                icon={<PlusOutlined />} 
                onClick={handleAddMaintenance}
                style={{ width: '100%' }}
              >
                Add Maintenance Record
              </Button>
            </div>

            {maintenances.length > 0 ? (
              <Table
                dataSource={maintenances}
                rowKey={(record) => record.id || Math.random()}
                pagination={false}
                size="small"
                columns={maintenanceColumns}
                scroll={{ x: 700 }}
              />
            ) : (
              <Empty description="No maintenance records added yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}

            <Divider orientation="left">Equipment Status</Divider>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="condition_status" label="Condition Status">
                  <Select>
                    <Option value="excellent">Excellent</Option>
                    <Option value="good">Good</Option>
                    <Option value="fair">Fair</Option>
                    <Option value="poor">Poor</Option>
                    <Option value="needs_repair">Needs Repair</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="operational_status" label="Operational Status">
                  <Select>
                    <Option value="operational">Operational</Option>
                    <Option value="in_use">In Use</Option>
                    <Option value="under_maintenance">Under Maintenance</Option>
                    <Option value="out_of_service">Out of Service</Option>
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
                    <SaveOutlined /> {isEditing ? 'Update' : 'Register'}
                  </Button>
                </Space>
              </Space>
            </Form.Item>
          </div>

        </Form>
      </Modal>

      {/* ==================== ALLOCATION FORM MODAL ==================== */}
      <Modal
        title="Add Allocation"
        open={allocationFormVisible}
        onCancel={() => setAllocationFormVisible(false)}
        footer={null}
        width={700}
        destroyOnClose
      >
        <Form form={allocationForm} layout="vertical" onFinish={handleAllocationSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="farmer_id" label="Select Farmer">
                <Select
                  placeholder="Search farmer..."
                  showSearch
                  allowClear
                  optionLabelProp="label"
                  filterOption={(input, option) =>
                    String(option?.searchValue || option?.children || '')
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
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
            <Col span={12}>
              <Form.Item name="allocated_quantity" label="Quantity" initialValue={1}>
                <InputNumber min={1} step={1} style={{ width: '100%' }} placeholder="Quantity" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="allocation_date" 
                label="Allocation Date" 
                rules={[{ required: true, message: 'Please select date' }]}
              >
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="return_date" label="Return Date">
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="purpose" label="Purpose">
            <TextArea rows={2} placeholder="Purpose of allocation..." />
          </Form.Item>

          <Form.Item name="remarks" label="Remarks">
            <Input placeholder="Additional notes..." />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={submittingChild}>
                <SaveOutlined /> Save Allocation
              </Button>
              <Button onClick={() => setAllocationFormVisible(false)}>
                <CloseOutlined /> Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* ==================== MAINTENANCE FORM MODAL ==================== */}
      <Modal
        title="Add Maintenance Record"
        open={maintenanceFormVisible}
        onCancel={() => setMaintenanceFormVisible(false)}
        footer={null}
        width={700}
        destroyOnClose
      >
        <Form form={maintenanceForm} layout="vertical" onFinish={handleMaintenanceSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="maintenance_type" 
                label="Maintenance Type" 
                rules={[{ required: true, message: 'Please select type' }]}
              >
                <Select>
                  <Option value="routine">Routine</Option>
                  <Option value="preventive">Preventive</Option>
                  <Option value="corrective">Corrective</Option>
                  <Option value="emergency">Emergency</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="maintenance_date" 
                label="Maintenance Date" 
                rules={[{ required: true, message: 'Please select date' }]}
              >
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item 
            name="description" 
            label="Description" 
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <TextArea rows={2} placeholder="Describe the maintenance work..." />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="cost" label="Cost (ETB)">
                <InputNumber min={0} step={0.01} style={{ width: '100%' }} placeholder="Cost" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="labor_hours" label="Labor Hours">
                <InputNumber min={0} step={1} style={{ width: '100%' }} placeholder="Hours" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="parts_replaced" label="Parts Replaced">
                <Input placeholder="Parts replaced" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="work_done" label="Work Done">
            <TextArea rows={2} placeholder="Describe work done..." />
          </Form.Item>

          <Form.Item name="remarks" label="Remarks">
            <Input placeholder="Additional notes..." />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={submittingChild}>
                <SaveOutlined /> Save Maintenance
              </Button>
              <Button onClick={() => setMaintenanceFormVisible(false)}>
                <CloseOutlined /> Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default MechanizationForm;