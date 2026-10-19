import React, { useState, useEffect } from 'react';
import { 
  Modal, Form, Input, Select, DatePicker, Row, Col, Space, Button, 
  InputNumber, message, Divider, Steps
} from 'antd';
import { 
  SaveOutlined, CloseOutlined, LeftOutlined, RightOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import LocationScopeSelector from '../../../components/common/LocationScopeSelector';
import ReusableLocationPicker from '../../../components/common/ReusableLocationPicker';
import { handleApiError } from '../../../utils/errorHandler';
import agronomyApi from '../../../services/api/agronomyApi';

const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;

const IrrigationMaintenanceForm = ({
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
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  const isEditing = !!editingRecord;

  // Fetch projects when modal opens
  useEffect(() => {
    if (visible) {
      fetchProjects();
    }
  }, [visible]);

  const fetchProjects = async () => {
    setLoadingProjects(true);
    try {
      const res = await agronomyApi.getIrrigationMaintenanceProjects();
      setProjects(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      message.error('Failed to load irrigation projects');
      setProjects([]);
    } finally {
      setLoadingProjects(false);
    }
  };

  useEffect(() => {
    if (editingRecord) {
      setSelectedZoneName(editingRecord.zone || '');
      setSelectedWoredaName(editingRecord.woreda || '');
      setSelectedKebeleName(editingRecord.kebele || '');

      form.setFieldsValue({
        ...editingRecord,
        irrigation_project_id: editingRecord.irrigation_project_id,
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
        maintenance_date: editingRecord.maintenance_date ? dayjs(editingRecord.maintenance_date) : null,
        completion_date: editingRecord.completion_date ? dayjs(editingRecord.completion_date) : null,
        scheduled_start_date: editingRecord.scheduled_start_date ? dayjs(editingRecord.scheduled_start_date) : null,
        scheduled_end_date: editingRecord.scheduled_end_date ? dayjs(editingRecord.scheduled_end_date) : null,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        region: 'Amhara',
        priority_level: 'medium',
        maintenance_status: 'planned',
        approval_status: 'pending',
        maintenance_type: 'preventive',
      });
      setSelectedZoneName('');
      setSelectedWoredaName('');
      setSelectedKebeleName('');
    }
  }, [editingRecord, form]);

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

  // ==================== VALIDATE STEP 1 ONLY ====================
  const nextStep = async () => {
    try {
      await form.validateFields([
        'irrigation_project_id', 
        'maintenance_title', 
        'maintenance_type', 
        'description', 
        'maintenance_date'
      ]);
      setCurrentStep(1);
    } catch (error) {
      console.error('Validation error:', error);
      message.error('Please fill in all required fields on Step 1: Irrigation Project, Title, Type, Description, and Date.');
    }
  };

  const prevStep = () => {
    setCurrentStep(0);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Validate all fields across both steps before submission
      const values = await form.validateFields();
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

      let payload = {
        irrigation_project_id: values.irrigation_project_id,
        maintenance_title: values.maintenance_title,
        maintenance_type: values.maintenance_type,
        priority_level: values.priority_level || 'medium',
        description: values.description,
        issue_detected: values.issue_detected,
        region: values.region || 'Amhara',
        zone: zone,
        woreda: woreda,
        kebele: kebele,
        maintenance_date: values.maintenance_date?.format('YYYY-MM-DD'),
        completion_date: values.completion_date?.format('YYYY-MM-DD'),
        scheduled_start_date: values.scheduled_start_date?.format('YYYY-MM-DD'),
        scheduled_end_date: values.scheduled_end_date?.format('YYYY-MM-DD'),
        cost_estimated: values.cost_estimated,
        cost_actual: values.cost_actual,
        labor_person_days: values.labor_person_days,
        materials_used: values.materials_used,
        contractor_name: values.contractor_name,
        maintenance_status: values.maintenance_status || 'planned',
        approval_status: values.approval_status || 'pending',
        remarks: values.remarks,
      };

      if (values.location && values.location.lat) {
        payload.gps_latitude = values.location.lat;
        payload.gps_longitude = values.location.lng;
      }

      if (isEditing) {
        await agronomyApi.updateIrrigationMaintenance(editingRecord.id, payload);
        message.success('Maintenance record updated successfully');
      } else {
        await agronomyApi.createIrrigationMaintenance(payload);
        message.success('Maintenance record created successfully');
      }

      form.resetFields();
      setSelectedZoneName('');
      setSelectedWoredaName('');
      setSelectedKebeleName('');
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
          <span>{isEditing ? 'Edit Maintenance Record' : 'New Maintenance Record'}</span>
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
        <Step title="Maintenance Info" description="Basic maintenance details" />
        <Step title="Resources & Status" description="Cost and status" />
      </Steps>

      {/* preserve={true} ensures hidden steps retain their values */}
      <Form 
        form={form} 
        layout="vertical" 
        onFinish={handleSubmit} 
        preserve={true}
        initialValues={{
          region: 'Amhara',
          priority_level: 'medium',
          maintenance_status: 'planned',
          approval_status: 'pending',
          maintenance_type: 'preventive',
        }}
      >
        {/* ==================== STEP 1: MAINTENANCE INFO ==================== */}
        <div style={{ display: currentStep === 0 ? 'block' : 'none' }}>
          <Divider orientation="left">Basic Information</Divider>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item 
                name="irrigation_project_id" 
                label="Irrigation Project" 
                rules={[{ required: true, message: 'Please select irrigation project' }]}
              >
                <Select 
                  placeholder="Select irrigation project" 
                  showSearch
                  optionFilterProp="children"
                  loading={loadingProjects}
                  notFoundContent={loadingProjects ? 'Loading...' : 'No projects found'}
                >
                  {projects.map((project) => (
                    <Option key={project.id} value={project.id}>
                      {project.project_name} - {project.technology_type || 'N/A'}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="maintenance_title" 
                label="Maintenance Title" 
                rules={[{ required: true, message: 'Please enter title' }]}
              >
                <Input placeholder="Enter maintenance title" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="maintenance_type" 
                label="Maintenance Type" 
                rules={[{ required: true, message: 'Please select type' }]}
              >
                <Select placeholder="Select type">
                  <Option value="preventive">Preventive</Option>
                  <Option value="corrective">Corrective</Option>
                  <Option value="emergency">Emergency</Option>
                  <Option value="routine">Routine</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="priority_level" 
                label="Priority Level"
              >
                <Select>
                  <Option value="high">High</Option>
                  <Option value="medium">Medium</Option>
                  <Option value="low">Low</Option>
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
            <TextArea rows={3} placeholder="Describe the maintenance work" />
          </Form.Item>

          <Form.Item name="issue_detected" label="Issue Detected">
            <TextArea rows={2} placeholder="Describe the issue detected" />
          </Form.Item>

          <Divider orientation="left">Location (Optional)</Divider>

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

        {/* ==================== STEP 2: RESOURCES & STATUS ==================== */}
        <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
          <Divider orientation="left">Schedule & Resources</Divider>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="scheduled_start_date" label="Scheduled Start Date">
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="scheduled_end_date" label="Scheduled End Date">
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="cost_estimated" label="Estimated Cost (ETB)">
                <InputNumber min={0} step={100} style={{ width: '100%' }} placeholder="Estimated cost" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="cost_actual" label="Actual Cost (ETB)">
                <InputNumber min={0} step={100} style={{ width: '100%' }} placeholder="Actual cost" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="labor_person_days" label="Labor (Person-Days)">
                <InputNumber min={0} step={1} style={{ width: '100%' }} placeholder="Labor days" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="contractor_name" label="Contractor Name">
                <Input placeholder="Enter contractor name" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="materials_used" label="Materials Used">
            <TextArea rows={2} placeholder="List materials used" />
          </Form.Item>

          <Divider orientation="left">Status</Divider>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="maintenance_status" label="Maintenance Status">
                <Select>
                  <Option value="planned">Planned</Option>
                  <Option value="in_progress">In Progress</Option>
                  <Option value="completed">Completed</Option>
                  <Option value="verified">Verified</Option>
                  <Option value="cancelled">Cancelled</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="approval_status" label="Approval Status">
                <Select>
                  <Option value="pending">Pending</Option>
                  <Option value="approved">Approved</Option>
                  <Option value="rejected">Rejected</Option>
                  <Option value="under_review">Under Review</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="remarks" label="Remarks">
            <Input placeholder="Additional notes..." />
          </Form.Item>

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

export default IrrigationMaintenanceForm;