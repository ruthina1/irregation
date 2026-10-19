import React, { useState, useEffect } from 'react';
import { 
  Modal, Form, Input, Select, DatePicker, Row, Col, Space, Button, 
  InputNumber, message, Divider, Steps, Table, Tag, Empty
} from 'antd';
import { 
  SaveOutlined, CloseOutlined, LeftOutlined, RightOutlined,
  PlusOutlined, DeleteOutlined, TeamOutlined, CalendarOutlined
} from '@ant-design/icons';
import LocationScopeSelector from '../../../components/common/LocationScopeSelector';
import ReusableLocationPicker from '../../../components/common/ReusableLocationPicker';
import { handleApiError } from '../../../utils/errorHandler';
import { extensionApi } from '../../../services/api/extensionApi';
import dayjs from 'dayjs';

const { Option } = Select;
const { Step } = Steps;
const { TextArea } = Input;

const CooperativeForm = ({
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

  // Members state
  const [members, setMembers] = useState([]);
  const [memberFormVisible, setMemberFormVisible] = useState(false);
  const [memberForm] = Form.useForm();
  const [submittingChild, setSubmittingChild] = useState(false);

  const isEditing = !!editingRecord;

  // Fetch farmers when modal opens
  useEffect(() => {
    if (visible) {
      fetchFarmers();
    }
  }, [visible]);

  // Load existing members when editing
  useEffect(() => {
    if (editingRecord) {
      setMembers(editingRecord.members || []);
    } else {
      setMembers([]);
    }
  }, [editingRecord]);

  const fetchFarmers = async () => {
    setLoadingFarmers(true);
    try {
      const fetchFn = extensionApi.getCooperativeFarmers || extensionApi.getFarmers;
      const res = await fetchFn();
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

      form.setFieldsValue({
        ...editingRecord,
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
        registration_date: editingRecord.registration_date ? dayjs(editingRecord.registration_date) : null,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        region: 'Amhara',
        cooperative_status: 'active',
        registration_status: 'draft',
        cooperative_type: 'Agricultural',
      });
      setSelectedZoneName('');
      setSelectedWoredaName('');
      setSelectedKebeleName('');
      setSelectedFarmer(null);
      setMembers([]);
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

  // ==================== MEMBER HANDLERS ====================
  const handleAddMember = () => {
    memberForm.resetFields();
    memberForm.setFieldsValue({
      join_date: dayjs(),
      membership_type: 'regular',
      member_status: 'active',
      approval_status: 'pending',
      is_board_member: false,
    });
    setMemberFormVisible(true);
  };

  const handleMemberSubmit = async (values) => {
    setSubmittingChild(true);
    try {
      if (editingRecord?.id) {
        const payload = {
          cooperative_id: editingRecord.id,
          farmer_id: values.farmer_id || null,
          member_name: values.member_name || '',
          member_phone: values.member_phone || '',
          member_email: values.member_email || '',
          member_id_number: values.member_id_number || '',
          region: values.region || 'Amhara',
          zone: values.zone || '',
          woreda: values.woreda || '',
          kebele: values.kebele || '',
          join_date: values.join_date ? values.join_date.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
          membership_type: values.membership_type || 'regular',
          share_capital: values.share_capital,
          share_units: values.share_units,
          is_board_member: values.is_board_member || false,
          board_position: values.board_position,
          member_status: values.member_status || 'active',
          approval_status: values.approval_status || 'pending',
          remarks: values.remarks,
        };

        const createMemFn = extensionApi.createCooperativeMember || extensionApi.createMember;
        const res = await createMemFn(payload);
        const createdMember = res.data?.data || res.data;
        setMembers([...members, createdMember]);
        message.success('Member added successfully');
      } else {
        const newMember = {
          id: `temp_${Date.now()}`,
          ...values,
          join_date: values.join_date ? values.join_date.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
          is_temp: true,
        };
        setMembers([...members, newMember]);
        message.success('Member added');
      }
      setMemberFormVisible(false);
      memberForm.resetFields();
    } catch (error) {
      handleApiError(error, 'Failed to add member');
    } finally {
      setSubmittingChild(false);
    }
  };

  const handleRemoveMember = async (index, record) => {
    if (record?.id && !record.is_temp && String(record.id).indexOf('temp_') === -1) {
      try {
        const deleteMemFn = extensionApi.deleteCooperativeMember || extensionApi.deleteMember;
        await deleteMemFn(record.id);
      } catch (e) {
        handleApiError(e, 'Failed to delete member');
        return;
      }
    }
    const newMembers = [...members];
    newMembers.splice(index, 1);
    setMembers(newMembers);
    message.success('Member removed');
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
        'cooperative_name',
        'cooperative_code',
        'cooperative_type',
        'registration_date',
        'region',
        'zone',
        'woreda',
        'kebele'
      ]);

      setCurrentStep(1);
    } catch (error) {
      console.error('Validation error:', error);
      message.error('Please fill in all required fields on Step 1: Name, Code, Type, Date, and Location.');
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
        cooperative_name: values.cooperative_name,
        cooperative_code: values.cooperative_code,
        cooperative_type: values.cooperative_type,
        registration_date: values.registration_date ? values.registration_date.format('YYYY-MM-DD') : null,
        registration_number: values.registration_number,
        email: values.email,
        phone: values.phone,
        website: values.website,
        region: values.region || 'Amhara',
        zone: zone,
        woreda: woreda,
        kebele: kebele,
        specific_location: values.specific_location,
        chairperson_name: values.chairperson_name,
        vice_chairperson_name: values.vice_chairperson_name,
        secretary_name: values.secretary_name,
        treasurer_name: values.treasurer_name,
        main_activities: values.main_activities,
        objectives: values.objectives,
        total_capital: values.total_capital,
        total_members: members.length,
        cooperative_status: values.cooperative_status || 'active',
        registration_status: values.registration_status || 'draft',
        remarks: values.remarks,
      };

      if (values.location && values.location.lat) {
        payload.gps_latitude = values.location.lat;
        payload.gps_longitude = values.location.lng;
      }

      let cooperativeId;
      if (isEditing) {
        const updateCoopFn = extensionApi.updateCooperative || extensionApi.updateCooperativeDetails;
        await updateCoopFn(editingRecord.id, payload);
        cooperativeId = editingRecord.id;
        message.success('Cooperative updated successfully');
      } else {
        const createCoopFn = extensionApi.createCooperative;
        const response = await createCoopFn(payload);
        const resData = response.data?.data || response.data;
        cooperativeId = resData?.id;
        message.success('Cooperative created successfully');
      }

      // Save temporary members
      if (cooperativeId && members.length > 0) {
        const createMemFn = extensionApi.createCooperativeMember || extensionApi.createMember;
        for (const member of members) {
          if (member.is_temp || !isEditing) {
            const { id, is_temp, ...memberData } = member;
            await createMemFn({
              ...memberData,
              cooperative_id: cooperativeId,
            });
          }
        }
      }

      form.resetFields();
      setSelectedZoneName('');
      setSelectedWoredaName('');
      setSelectedKebeleName('');
      setSelectedFarmer(null);
      setMembers([]);
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

  // Member table columns
  const memberColumns = [
    { title: 'Name', dataIndex: 'member_name', key: 'member_name' },
    { title: 'Phone', dataIndex: 'member_phone', key: 'member_phone', render: (val) => val || '-' },
    { title: 'Type', dataIndex: 'membership_type', key: 'membership_type', render: (val) => <Tag>{val}</Tag> },
    { title: 'Share Capital', dataIndex: 'share_capital', key: 'share_capital', render: (val) => val ? `${val} ETB` : '-' },
    { title: 'Board Member', dataIndex: 'is_board_member', key: 'is_board_member', render: (val) => val ? 'Yes' : 'No' },
    { title: 'Status', dataIndex: 'member_status', key: 'member_status', render: (val) => <Tag>{val}</Tag> },
    {
      title: 'Action',
      key: 'action',
      render: (_, record, index) => (
        <Button 
          type="text" 
          danger 
          icon={<DeleteOutlined />} 
          onClick={() => handleRemoveMember(index, record)}
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
            <span>{isEditing ? 'Edit Cooperative' : 'New Cooperative'}</span>
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
          <Step title="Cooperative Details" description="Basic cooperative info" />
          <Step title="Members" description={`${members.length} registered`} />
        </Steps>

        <Form form={form} layout="vertical" onFinish={handleSubmit} preserve={true}>

          {/* ==================== STEP 1: COOPERATIVE DETAILS ==================== */}
          <div style={{ display: currentStep === 0 ? 'block' : 'none' }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item 
                  name="cooperative_name" 
                  label="Cooperative Name" 
                  rules={[{ required: true, message: 'Please enter cooperative name' }]}
                >
                  <Input placeholder="Enter cooperative name" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item 
                  name="cooperative_code" 
                  label="Cooperative Code" 
                  rules={[{ required: true, message: 'Please enter cooperative code' }]}
                >
                  <Input placeholder="Enter unique code" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item 
                  name="cooperative_type" 
                  label="Cooperative Type" 
                  rules={[{ required: true, message: 'Please select type' }]}
                >
                  <Select placeholder="Select type">
                    <Option value="Agricultural">Agricultural</Option>
                    <Option value="Livestock">Livestock</Option>
                    <Option value="Fishery">Fishery</Option>
                    <Option value="Horticulture">Horticulture</Option>
                    <Option value="Multi-purpose">Multi-purpose</Option>
                    <Option value="Other">Other</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item 
                  name="registration_date" 
                  label="Registration Date" 
                  rules={[{ required: true, message: 'Please select date' }]}
                >
                  <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="registration_number" label="Registration Number">
                  <Input placeholder="Registration number" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="phone" label="Phone">
                  <Input placeholder="Phone number" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="email" label="Email">
                  <Input placeholder="Email address" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="website" label="Website">
                  <Input placeholder="Website URL" />
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">Leadership</Divider>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="chairperson_name" label="Chairperson Name">
                  <Input placeholder="Chairperson name" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="vice_chairperson_name" label="Vice Chairperson Name">
                  <Input placeholder="Vice chairperson name" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="secretary_name" label="Secretary Name">
                  <Input placeholder="Secretary name" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="treasurer_name" label="Treasurer Name">
                  <Input placeholder="Treasurer name" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="total_capital" label="Total Capital (ETB)">
                  <InputNumber min={0} step={100} style={{ width: '100%' }} placeholder="Capital" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="specific_location" label="Specific Location">
                  <Input placeholder="Specific location details" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="main_activities" label="Main Activities">
              <TextArea rows={2} placeholder="Describe main activities" />
            </Form.Item>

            <Form.Item name="objectives" label="Objectives">
              <TextArea rows={2} placeholder="Describe objectives" />
            </Form.Item>

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

          {/* ==================== STEP 2: MEMBERS ==================== */}
          <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
            <Divider orientation="left">
              <TeamOutlined /> Members 
              <Tag style={{ marginLeft: 8 }}>{members.length}</Tag>
            </Divider>

            <div style={{ marginBottom: 16 }}>
              <Button 
                type="dashed" 
                icon={<PlusOutlined />} 
                onClick={handleAddMember}
                style={{ width: '100%' }}
              >
                Add Member
              </Button>
            </div>

            {members.length > 0 ? (
              <Table
                dataSource={members}
                rowKey={(record) => record.id || Math.random()}
                pagination={false}
                size="small"
                columns={memberColumns}
                scroll={{ x: 700 }}
              />
            ) : (
              <Empty description="No members added yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}

            <Divider orientation="left">Cooperative Status</Divider>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="cooperative_status" label="Cooperative Status">
                  <Select>
                    <Option value="active">Active</Option>
                    <Option value="inactive">Inactive</Option>
                    <Option value="suspended">Suspended</Option>
                    <Option value="dissolved">Dissolved</Option>
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

      {/* ==================== MEMBER FORM MODAL ==================== */}
      <Modal
        title="Add Member"
        open={memberFormVisible}
        onCancel={() => setMemberFormVisible(false)}
        footer={null}
        width={700}
        destroyOnClose
      >
        <Form form={memberForm} layout="vertical" onFinish={handleMemberSubmit}>
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
              <Form.Item 
                name="member_name" 
                label="Member Name" 
                rules={[{ required: true, message: 'Please enter member name' }]}
              >
                <Input placeholder="Enter member name" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="member_phone" label="Phone">
                <Input placeholder="Phone number" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="member_email" label="Email">
                <Input placeholder="Email address" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="member_id_number" label="ID Number">
                <Input placeholder="ID number" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="join_date" 
                label="Join Date" 
                rules={[{ required: true, message: 'Please select date' }]}
              >
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="membership_type" label="Membership Type">
                <Select>
                  <Option value="regular">Regular</Option>
                  <Option value="associate">Associate</Option>
                  <Option value="honorary">Honorary</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="share_capital" label="Share Capital (ETB)">
                <InputNumber min={0} step={0.01} style={{ width: '100%' }} placeholder="Share capital" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="share_units" label="Share Units">
                <InputNumber min={0} step={0.5} style={{ width: '100%' }} placeholder="Units" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="is_board_member" label="Board Member" valuePropName="checked">
                <Select>
                  <Option value={true}>Yes</Option>
                  <Option value={false}>No</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="board_position" label="Board Position">
                <Input placeholder="Position" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="member_status" label="Member Status">
                <Select>
                  <Option value="active">Active</Option>
                  <Option value="inactive">Inactive</Option>
                  <Option value="suspended">Suspended</Option>
                  <Option value="resigned">Resigned</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="approval_status" label="Approval Status">
                <Select>
                  <Option value="pending">Pending</Option>
                  <Option value="approved">Approved</Option>
                  <Option value="rejected">Rejected</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="remarks" label="Remarks">
            <Input placeholder="Additional notes..." />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={submittingChild}>
                <SaveOutlined /> Save Member
              </Button>
              <Button onClick={() => setMemberFormVisible(false)}>
                <CloseOutlined /> Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default CooperativeForm;