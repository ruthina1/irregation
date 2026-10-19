import React, { useState, useEffect, useMemo } from 'react';
import { 
  Table, Button, Modal, Form, Input, Select, DatePicker, Space, Tag, 
  Card, Row, Col, message, Popconfirm, Typography, Breadcrumb, Statistic, Empty,
  InputNumber, Descriptions, Divider, Tabs, Progress
} from 'antd';
import { 
  PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined, CheckOutlined, HomeOutlined,
  SearchOutlined, DownloadOutlined, DashboardOutlined, AreaChartOutlined, 
  SafetyCertificateOutlined, ClusterOutlined, EnvironmentOutlined, 
  FundOutlined, FieldTimeOutlined, ApartmentOutlined, UserOutlined,
  CalendarOutlined, GlobalOutlined, LineChartOutlined, 
  PieChartOutlined, TeamOutlined, ToolOutlined
} from '@ant-design/icons';
import agronomyApi from '../../services/api/agronomyApi';
import dayjs from 'dayjs';
import LocationScopeSelector from '../../components/common/LocationScopeSelector';
import ReusableLocationPicker from '../../components/common/ReusableLocationPicker';
import { handleApiError } from '../../utils/errorHandler';
import BrandedLoader from '../../components/common/BrandedLoader';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

// KPI Card styles
const CARD_STYLE_GREEN = {
  borderTop: '3px solid #52c41a',
  borderRadius: 6,
  height: '100%',
  boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
};

const CARD_STYLE_BLUE = {
  borderTop: '3px solid #1890ff',
  borderRadius: 6,
  height: '100%',
  boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
};

const CARD_STYLE_ORANGE = {
  borderTop: '3px solid #fa8c16',
  borderRadius: 6,
  height: '100%',
  boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
};

const CARD_STYLE_PURPLE = {
  borderTop: '3px solid #722ed1',
  borderRadius: 6,
  height: '100%',
  boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
};

const CARD_STYLE_RED = {
  borderTop: '3px solid #ff4d4f',
  borderRadius: 6,
  height: '100%',
  boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
};

// Helper to safely extract location string
const extractLocationName = (val) => {
  if (!val && val !== 0) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return String(val);
  if (typeof val === 'object') {
    return val.label || val.name || val.zone_name || val.woreda_name || val.kebele_name || val.value || val.title || '';
  }
  return '';
};

const LandRehabilitation = () => {
  // ==================== STATE ====================
  const [projects, setProjects] = useState([]);
  const [activities, setActivities] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('projects');

  // Filters State
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [approvalFilter, setApprovalFilter] = useState('All');

  // Location maps for display
  const [zonesMap, setZonesMap] = useState({});
  const [woredasMap, setWoredasMap] = useState({});
  const [kebelesMap, setKebelesMap] = useState({});

  const [selectedZoneName, setSelectedZoneName] = useState('');
  const [selectedWoredaName, setSelectedWoredaName] = useState('');
  const [selectedKebeleName, setSelectedKebeleName] = useState('');
  const [stats, setStats] = useState({});

  // Status color configurations
  const statusColors = {
    proposed: 'default',
    approved: 'processing',
    under_implementation: 'warning',
    completed: 'success',
    closed: 'default',
    verified: 'green',
    cancelled: 'error'
  };

  const approvalStatusColors = {
    pending: 'warning',
    woreda_verified: 'processing',
    zone_approved: 'success',
    regional_approved: 'blue',
    rejected: 'error'
  };

  const conditionColors = {
    severe: 'red',
    moderate: 'orange',
    mild: 'yellow',
    good: 'green',
    excellent: 'blue'
  };

 // ==================== FETCH FUNCTIONS ====================
  const fetchLocations = async () => {
    try {
      const zRes = await agronomyApi.getZones();
      const zMap = {};
      (zRes.data || []).forEach(z => { zMap[z.id] = z.name; });
      setZonesMap(zMap);
    } catch (e) {
      // Ignore fallback errors
    }
  };

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchText) params.search = searchText;
      if (statusFilter !== 'All') params.project_status = statusFilter;
      if (approvalFilter !== 'All') params.approval_status = approvalFilter;

      const res = await agronomyApi.getRehabilitationProjects(params);
      setProjects(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      handleApiError(error, 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const res = await agronomyApi.getRehabilitationActivities();
      setActivities(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    }
  };

  const fetchAssessments = async () => {
    try {
      const res = await agronomyApi.getRehabilitationAssessments();
      setAssessments(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Failed to fetch assessments:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await agronomyApi.getRehabStats();
      setStats(res.data || {});
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  useEffect(() => {
    const init = async () => {
      fetchLocations();
      await fetchProjects();
      fetchStats();
      fetchActivities();
      fetchAssessments();
    };
    init();
  }, []);

  // Refetch when filters change
  useEffect(() => {
    fetchProjects();
  }, [searchText, statusFilter, approvalFilter]);

  // ==================== COMPUTED VALUES ====================
  const totalAreaRehabilitated = useMemo(() => {
    return projects.reduce((sum, p) => {
      const projectActivities = activities.filter(a => a.project_id === p.id);
      return sum + projectActivities.reduce((s, a) => s + Number(a.area_covered_hectares || 0), 0);
    }, 0);
  }, [projects, activities]);

  const totalCommunityParticipation = useMemo(() => {
    return activities.reduce((sum, a) => sum + Number(a.community_participation || 0), 0);
  }, [activities]);

  const completionRate = useMemo(() => {
    if (!projects.length) return 0;
    const completed = projects.filter(p => p.project_status === 'completed').length;
    return Math.round((completed / projects.length) * 100);
  }, [projects]);

  // ==================== HANDLERS ====================
  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const allFormValues = form.getFieldsValue(true);

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
        project_name: values.project_name,
        watershed_name: values.watershed_name,
        region: values.region || form.getFieldValue('region') || 'Amhara',
        zone: zone,
        woreda: woreda,
        kebele: kebele,
        start_date: values.start_date?.format('YYYY-MM-DD'),
        end_date: values.end_date?.format('YYYY-MM-DD'),
        budget_allocated: values.budget_allocated,
        beneficiary_households: values.beneficiary_households,
        responsible_organization: values.responsible_organization,
        project_status: values.project_status || 'proposed',
        approval_status: values.approval_status || 'pending',
        remarks: values.remarks,
      };

      if (values.location && values.location.lat) {
        payload.gps_latitude = values.location.lat;
        payload.gps_longitude = values.location.lng;
      }

      if (editingId) {
        await agronomyApi.updateRehabilitationProject(editingId, payload);
        message.success('Project updated successfully');
      } else {
        await agronomyApi.createRehabilitationProject(payload);
        message.success('Project created successfully');
      }
      
      setModalVisible(false);
      form.resetFields();
      setEditingId(null);
      setEditingRecord(null);
      setSelectedZoneName('');
      setSelectedWoredaName('');
      setSelectedKebeleName('');
      fetchProjects();
      fetchActivities();
      fetchAssessments();
      fetchStats();
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

  const handleDelete = async (id) => {
    try {
      await agronomyApi.deleteRehabilitationProject(id);
      message.success('Project deleted successfully');
      fetchProjects();
      fetchStats();
    } catch (error) {
      handleApiError(error, 'Failed to delete project');
    }
  };

  const handleApprove = async (id) => {
    try {
      await agronomyApi.approveRehabilitationProject(id);
      message.success('Project verified successfully');
      fetchProjects();
      fetchStats();
    } catch (error) {
      handleApiError(error, 'Failed to verify project');
    }
  };

  const handleSubmitForApproval = async (id) => {
    try {
      await agronomyApi.submitRehabilitationProject(id);
      message.success('Project submitted for verification');
      fetchProjects();
    } catch (error) {
      handleApiError(error, 'Failed to submit project');
    }
  };

  const handleEdit = (record) => {
    setEditingId(record.id);
    setEditingRecord(record);
    
    setSelectedZoneName(record.zone || '');
    setSelectedWoredaName(record.woreda || '');
    setSelectedKebeleName(record.kebele || '');

    const formValues = {
      ...record,
      zone: record.zone,
      zone_name: record.zone,
      woreda: record.woreda,
      woreda_name: record.woreda,
      kebele: record.kebele,
      kebele_name: record.kebele,
      location: record.gps_latitude && record.gps_longitude ? {
        lat: parseFloat(record.gps_latitude),
        lng: parseFloat(record.gps_longitude),
        accuracy: null
      } : null,
      start_date: record.start_date ? dayjs(record.start_date) : null,
      end_date: record.end_date ? dayjs(record.end_date) : null,
    };
    
    form.setFieldsValue(formValues);
    setModalVisible(true);
  };

  const handleViewDetail = (record) => {
    // Fetch complete project with activities and assessments
    const fullProject = {
      ...record,
      activities: activities.filter(a => a.project_id === record.id),
      assessments: assessments.filter(a => a.project_id === record.id)
    };
    setSelectedRecord(fullProject);
    setDetailVisible(true);
  };

  const handleAdd = () => {
    setEditingId(null);
    setEditingRecord(null);
    setSelectedZoneName('');
    setSelectedWoredaName('');
    setSelectedKebeleName('');
    form.resetFields();
    form.setFieldsValue({
      project_status: 'proposed',
      approval_status: 'pending',
      region: 'Amhara',
    });
    setModalVisible(true);
  };

  const handleLocationChange = (arg1, arg2, arg3) => {
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

  // ==================== EXPORT ====================
  const exportToCSV = () => {
    if (projects.length === 0) {
      message.warning('No data available to export.');
      return;
    }

    const headers = 'Project Name,Watershed,Region,Zone,Woreda,Kebele,Start Date,End Date,Budget (ETB),Beneficiaries,Status,Approval Status\n';

    const rows = projects
      .map((item) => {
        const zoneName = zonesMap[item.zone] || item.zone || '';
        const woredaName = woredasMap[item.woreda] || item.woreda || '';
        const kebeleName = kebelesMap[item.kebele] || item.kebele || '';
        return `"${item.project_name || ''}","${item.watershed_name || ''}","${item.region || ''}","${zoneName}","${woredaName}","${kebeleName}","${item.start_date || ''}","${item.end_date || ''}","${item.budget_allocated || 0}","${item.beneficiary_households || 0}","${item.project_status || ''}","${item.approval_status || ''}"`;
      })
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Rehabilitation_Projects_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // ==================== TABLE COLUMNS ====================
  const columns = [
    { 
      title: 'Project Name', 
      dataIndex: 'project_name', 
      key: 'project_name', 
      width: 200,
      fixed: 'left',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          {record.watershed_name && (
            <div style={{ fontSize: 12, color: '#999' }}>
              <EnvironmentOutlined /> {record.watershed_name}
            </div>
          )}
        </div>
      )
    },
    { title: 'Region', dataIndex: 'region', key: 'region', width: 100 },
    { title: 'Zone', dataIndex: 'zone', key: 'zone', width: 120, render: (val) => zonesMap[val] || val || '-' },
    { title: 'Woreda', dataIndex: 'woreda', key: 'woreda', width: 120, render: (val) => woredasMap[val] || val || '-' },
    { 
      title: 'Start Date', 
      dataIndex: 'start_date', 
      key: 'start_date', 
      width: 110,
      render: (val) => val ? dayjs(val).format('YYYY-MM-DD') : '-'
    },
    { 
      title: 'End Date', 
      dataIndex: 'end_date', 
      key: 'end_date', 
      width: 110,
      render: (val) => val ? dayjs(val).format('YYYY-MM-DD') : 'Ongoing'
    },
    { 
      title: 'Beneficiaries', 
      dataIndex: 'beneficiary_households', 
      key: 'beneficiary_households', 
      width: 120,
      render: (val) => <Tag color="purple">{val || 0}</Tag>
    },
    { 
      title: 'Status', 
      dataIndex: 'project_status', 
      key: 'project_status', 
      width: 150,
      render: (val) => <Tag color={statusColors[val] || 'default'}>{val?.replace('_', ' ')}</Tag>
    },
    { 
      title: 'Approval', 
      dataIndex: 'approval_status', 
      key: 'approval_status', 
      width: 150,
      render: (val) => <Tag color={approvalStatusColors[val] || 'default'}>{val?.replace('_', ' ')}</Tag>
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 220,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button 
            size="small" 
            icon={<EyeOutlined />} 
            onClick={() => handleViewDetail(record)}
          />
          <Button 
            size="small" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)} 
          />
          
          {record.approval_status === 'pending' && (
            <Popconfirm
              title="Submit this project for verification?"
              onConfirm={() => handleSubmitForApproval(record.id)}
            >
              <Button size="small" icon={<CheckOutlined />} style={{ color: '#fa8c16' }} />
            </Popconfirm>
          )}
          
          {record.approval_status === 'woreda_verified' && (
            <Popconfirm
              title="Verify this project?"
              onConfirm={() => handleApprove(record.id)}
            >
              <Button size="small" icon={<CheckOutlined />} type="primary" ghost />
            </Popconfirm>
          )}
          
          {(record.approval_status === 'pending' || record.approval_status === 'woreda_verified') && (
            <Popconfirm
              title="Delete this project?"
              onConfirm={() => handleDelete(record.id)}
            >
              <Button size="small" icon={<DeleteOutlined />} danger />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', background: '#f8fafc', minHeight: '100vh' }}>
      {(loading || isSubmitting) && <BrandedLoader message={isSubmitting ? "Processing..." : "Loading Projects..."} />}

      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item><HomeOutlined /></Breadcrumb.Item>
        <Breadcrumb.Item>Agronomy</Breadcrumb.Item>
        <Breadcrumb.Item>Land Rehabilitation</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ marginBottom: 20 }}>
        <Title level={3} style={{ marginBottom: 4, color: '#1a5f2c' }}>
          🌍 Land Rehabilitation Management
        </Title>
        <Text type="secondary">
          Monitor degraded land restoration through rehabilitation projects, activities, and impact assessments
        </Text>
      </div>

      {/* ===== KPI CARDS ===== */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} lg={4}>
          <Card bordered={false} style={CARD_STYLE_GREEN}>
            <Statistic 
              title="Total Projects" 
              value={stats.total_projects || 0} 
              prefix={<DashboardOutlined style={{ color: '#52c41a' }} />} 
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={4}>
          <Card bordered={false} style={CARD_STYLE_BLUE}>
            <Statistic 
              title="Completed" 
              value={stats.completed_projects || 0} 
              prefix={<CheckOutlined style={{ color: '#1890ff' }} />} 
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={4}>
          <Card bordered={false} style={CARD_STYLE_ORANGE}>
            <Statistic 
              title="Area Rehabilitated" 
              value={totalAreaRehabilitated} 
              precision={2} 
              suffix="Ha" 
              prefix={<AreaChartOutlined style={{ color: '#fa8c16' }} />} 
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={4}>
          <Card bordered={false} style={CARD_STYLE_PURPLE}>
            <Statistic 
              title="Community Participants" 
              value={totalCommunityParticipation} 
              prefix={<TeamOutlined style={{ color: '#722ed1' }} />} 
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={4}>
          <Card bordered={false} style={CARD_STYLE_GREEN}>
            <Statistic 
              title="Completion Rate" 
              value={completionRate} 
              suffix="%" 
              prefix={<PieChartOutlined style={{ color: '#52c41a' }} />} 
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={4}>
          <Card bordered={false} style={CARD_STYLE_BLUE}>
            <Statistic 
              title="Avg Veg. Improvement" 
              value={stats.avg_vegetation_improvement || 0} 
              precision={1} 
              suffix="%" 
              prefix={<LineChartOutlined style={{ color: '#1890ff' }} />} 
            />
          </Card>
        </Col>
      </Row>

      {/* ===== SEARCH & FILTER TOOLBAR ===== */}
      <Card bordered={false} style={{ marginBottom: 16, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <Row gutter={[16, 16]} align="middle" justify="space-between">
          <Col xs={24} md={6}>
            <Input
              placeholder="Search projects..."
              prefix={<SearchOutlined />}
              allowClear
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>

          <Col xs={24} sm={8} md={4}>
            <Select style={{ width: '100%' }} defaultValue="All" onChange={(val) => setStatusFilter(val)}>
              <Option value="All">All Status</Option>
              <Option value="proposed">Proposed</Option>
              <Option value="approved">Approved</Option>
              <Option value="under_implementation">Under Implementation</Option>
              <Option value="completed">Completed</Option>
              <Option value="closed">Closed</Option>
              <Option value="cancelled">Cancelled</Option>
            </Select>
          </Col>

          <Col xs={24} sm={8} md={4}>
            <Select style={{ width: '100%' }} defaultValue="All" onChange={(val) => setApprovalFilter(val)}>
              <Option value="All">All Approval</Option>
              <Option value="pending">Pending</Option>
              <Option value="woreda_verified">Woreda Verified</Option>
              <Option value="zone_approved">Zone Approved</Option>
              <Option value="regional_approved">Regional Approved</Option>
              <Option value="rejected">Rejected</Option>
            </Select>
          </Col>

          <Col xs={24} md={10}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
              <Button icon={<DownloadOutlined />} onClick={exportToCSV}>
                Export
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} style={{ backgroundColor: '#1b7837', borderColor: '#1b7837' }}>
                New Project
              </Button>
            </div>
          </Col>
        </Row>
      </Card>

      {/* ===== DATA TABLE ===== */}
      <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        {projects.length === 0 && !loading ? (
          <Empty description="No rehabilitation projects registered yet." />
        ) : (
          <Table
            columns={columns}
            dataSource={projects}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10, showSizeChanger: true }}
            scroll={{ x: 1500 }}
          />
        )}
      </Card>

      {/* ===== CREATE/EDIT MODAL ===== */}
      <Modal
        title={editingId ? 'Edit Project' : 'New Rehabilitation Project'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingId(null);
          setEditingRecord(null);
          setSelectedZoneName('');
          setSelectedWoredaName('');
          setSelectedKebeleName('');
        }}
        footer={null}
        width={900}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="project_name" label="Project Name" rules={[{ required: true, message: 'Project name is required' }]}>
                <Input placeholder="Enter project name" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="watershed_name" label="Watershed Name">
                <Input placeholder="Enter watershed name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="responsible_organization" label="Responsible Organization">
                <Input placeholder="Enter organization name" />
              </Form.Item>
            </Col>
          </Row>

          {/* Location */}
          <LocationScopeSelector 
            form={form} 
            editingData={editingRecord}
            onLocationChange={handleLocationChange}
          />

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="start_date" label="Start Date" rules={[{ required: true, message: 'Start date is required' }]}>
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="end_date" label="End Date">
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="budget_allocated" label="Budget Allocated (ETB)">
                <InputNumber min={0} step={1000} style={{ width: '100%' }} placeholder="Amount" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="beneficiary_households" label="Beneficiary Households">
                <InputNumber min={0} step={1} style={{ width: '100%' }} placeholder="Number" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="project_status" label="Project Status">
                <Select>
                  <Option value="proposed">Proposed</Option>
                  <Option value="approved">Approved</Option>
                  <Option value="under_implementation">Under Implementation</Option>
                  <Option value="completed">Completed</Option>
                  <Option value="closed">Closed</Option>
                  <Option value="cancelled">Cancelled</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="approval_status" label="Approval Status">
                <Select>
                  <Option value="pending">Pending</Option>
                  <Option value="woreda_verified">Woreda Verified</Option>
                  <Option value="zone_approved">Zone Approved</Option>
                  <Option value="regional_approved">Regional Approved</Option>
                  <Option value="rejected">Rejected</Option>
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
            <ReusableLocationPicker autoLocate={!editingId} />
          </Form.Item>

          <Form.Item name="remarks" label="Remarks">
            <TextArea rows={3} placeholder="Additional notes..." />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={isSubmitting} style={{ backgroundColor: '#1b7837', borderColor: '#1b7837' }}>
                {editingId ? 'Update Project' : 'Create Project'}
              </Button>
              <Button onClick={() => {
                setModalVisible(false);
                form.resetFields();
                setEditingId(null);
                setEditingRecord(null);
                setSelectedZoneName('');
                setSelectedWoredaName('');
                setSelectedKebeleName('');
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* ===== DETAIL VIEW MODAL ===== */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ApartmentOutlined style={{ color: '#1a5f2c' }} />
            <span>Project Details</span>
            <Tag color={statusColors[selectedRecord?.project_status] || 'default'}>
              {selectedRecord?.project_status?.replace('_', ' ')}
            </Tag>
          </div>
        }
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            Close
          </Button>,
          selectedRecord?.approval_status === 'pending' && (
            <Button 
              key="submit" 
              onClick={() => {
                handleSubmitForApproval(selectedRecord.id);
                setDetailVisible(false);
              }}
              style={{ color: '#fa8c16' }}
            >
              Submit for Verification
            </Button>
          ),
          selectedRecord?.approval_status === 'woreda_verified' && (
            <Button 
              key="approve" 
              type="primary" 
              onClick={() => {
                handleApprove(selectedRecord.id);
                setDetailVisible(false);
              }}
              style={{ backgroundColor: '#1b7837', borderColor: '#1b7837' }}
            >
              Verify Project
            </Button>
          ),
          (selectedRecord?.approval_status === 'pending' || selectedRecord?.approval_status === 'woreda_verified') && (
            <Button 
              key="edit" 
              onClick={() => {
                setDetailVisible(false);
                handleEdit(selectedRecord);
              }}
            >
              Edit
            </Button>
          )
        ]}
        width={900}
        destroyOnClose
      >
        {selectedRecord && (
          <Tabs defaultActiveKey="details">
            {/* Details Tab */}
            <TabPane tab="Project Details" key="details">
              <Descriptions bordered column={2} size="middle">
                <Descriptions.Item label="Project Name" span={2}>
                  <Text strong>{selectedRecord.project_name}</Text>
                </Descriptions.Item>
                
                <Descriptions.Item label="Watershed">
                  {selectedRecord.watershed_name || '-'}
                </Descriptions.Item>
                
                <Descriptions.Item label="Responsible Organization">
                  {selectedRecord.responsible_organization || '-'}
                </Descriptions.Item>

                <Descriptions.Item label="Region">
                  {selectedRecord.region || '-'}
                </Descriptions.Item>
                
                <Descriptions.Item label="Zone">
                  {zonesMap[selectedRecord.zone] || selectedRecord.zone || '-'}
                </Descriptions.Item>

                <Descriptions.Item label="Woreda">
                  {woredasMap[selectedRecord.woreda] || selectedRecord.woreda || '-'}
                </Descriptions.Item>
                
                <Descriptions.Item label="Kebele">
                  {kebelesMap[selectedRecord.kebele] || selectedRecord.kebele || '-'}
                </Descriptions.Item>

                <Descriptions.Item label="Start Date">
                  {selectedRecord.start_date ? dayjs(selectedRecord.start_date).format('YYYY-MM-DD') : '-'}
                </Descriptions.Item>

                <Descriptions.Item label="End Date">
                  {selectedRecord.end_date ? dayjs(selectedRecord.end_date).format('YYYY-MM-DD') : 'Ongoing'}
                </Descriptions.Item>

                <Descriptions.Item label="Budget">
                  {selectedRecord.budget_allocated ? `${Number(selectedRecord.budget_allocated).toLocaleString()} ETB` : '-'}
                </Descriptions.Item>

                <Descriptions.Item label="Beneficiary Households">
                  {selectedRecord.beneficiary_households || 0}
                </Descriptions.Item>

                <Descriptions.Item label="GPS Coordinates" span={2}>
                  {selectedRecord.gps_latitude && selectedRecord.gps_longitude ? (
                    <Tag color="purple">
                      <GlobalOutlined /> {selectedRecord.gps_latitude}, {selectedRecord.gps_longitude}
                    </Tag>
                  ) : '-'}
                </Descriptions.Item>

                <Descriptions.Item label="Status">
                  <Tag color={statusColors[selectedRecord.project_status] || 'default'}>
                    {selectedRecord.project_status?.replace('_', ' ')}
                  </Tag>
                </Descriptions.Item>

                <Descriptions.Item label="Approval Status">
                  <Tag color={approvalStatusColors[selectedRecord.approval_status] || 'default'}>
                    {selectedRecord.approval_status?.replace('_', ' ')}
                  </Tag>
                </Descriptions.Item>

                <Descriptions.Item label="Remarks" span={2}>
                  {selectedRecord.remarks || 'No remarks'}
                </Descriptions.Item>
              </Descriptions>
            </TabPane>

            {/* Activities Tab */}
            <TabPane tab={`Activities (${selectedRecord.activities?.length || 0})`} key="activities">
              {selectedRecord.activities?.length > 0 ? (
                <Table
                  dataSource={selectedRecord.activities}
                  rowKey="id"
                  pagination={false}
                  size="small"
                  columns={[
                    { title: 'Type', dataIndex: 'activity_type', key: 'activity_type', render: (val) => val?.replace('_', ' ') },
                    { title: 'Date', dataIndex: 'activity_date', key: 'activity_date', render: (val) => dayjs(val).format('YYYY-MM-DD') },
                    { title: 'Area (Ha)', dataIndex: 'area_covered_hectares', key: 'area_covered_hectares' },
                    { title: 'Structures', dataIndex: 'number_of_structures_built', key: 'number_of_structures_built' },
                    { title: 'Community', dataIndex: 'community_participation', key: 'community_participation' },
                    { title: 'Status', dataIndex: 'activity_status', key: 'activity_status', render: (val) => <Tag>{val}</Tag> },
                  ]}
                />
              ) : (
                <Empty description="No activities recorded for this project" />
              )}
            </TabPane>

            {/* Assessments Tab */}
            <TabPane tab={`Assessments (${selectedRecord.assessments?.length || 0})`} key="assessments">
              {selectedRecord.assessments?.length > 0 ? (
                <Table
                  dataSource={selectedRecord.assessments}
                  rowKey="id"
                  pagination={false}
                  size="small"
                  columns={[
                    { title: 'Type', dataIndex: 'assessment_type', key: 'assessment_type', render: (val) => val?.replace('_', ' ') },
                    { title: 'Date', dataIndex: 'assessment_date', key: 'assessment_date', render: (val) => dayjs(val).format('YYYY-MM-DD') },
                    { 
                      title: 'Vegetation', 
                      key: 'vegetation',
                      render: (_, record) => (
                        <span>
                          <Tag color={conditionColors[record.before_condition_vegetation]}>Before: {record.before_condition_vegetation}</Tag>
                          <Tag color={conditionColors[record.after_condition_vegetation]}>After: {record.after_condition_vegetation}</Tag>
                        </span>
                      )
                    },
                    { 
                      title: 'Improvement', 
                      dataIndex: 'soil_fertility_improvement', 
                      key: 'soil_fertility_improvement',
                      render: (val) => <Tag color={val === 'significant' ? 'green' : val === 'moderate' ? 'blue' : 'orange'}>{val || '-'}</Tag>
                    },
                    { title: 'Veg. Increase', dataIndex: 'vegetation_cover_increase_percent', key: 'vegetation_cover_increase_percent', render: (val) => val ? `${val}%` : '-' },
                    { title: 'Status', dataIndex: 'assessment_status', key: 'assessment_status', render: (val) => <Tag>{val}</Tag> },
                  ]}
                />
              ) : (
                <Empty description="No assessments recorded for this project" />
              )}
            </TabPane>

            {/* Impact Tab */}
            <TabPane tab="Impact Measurement" key="impact">
              {selectedRecord.assessments?.length > 0 ? (
                <div>
                  {selectedRecord.assessments.map((assessment, index) => (
                    <Card key={index} size="small" style={{ marginBottom: 12 }}>
                      <Row gutter={16}>
                        <Col span={12}>
                          <Text strong>Assessment Type:</Text> {assessment.assessment_type?.replace('_', ' ')}
                        </Col>
                        <Col span={12}>
                          <Text strong>Date:</Text> {assessment.assessment_date ? dayjs(assessment.assessment_date).format('YYYY-MM-DD') : '-'}
                        </Col>
                      </Row>
                      <Row gutter={16} style={{ marginTop: 8 }}>
                        <Col span={6}>
                          <Text strong>Vegetation:</Text>
                          <br />
                          <Tag color={conditionColors[assessment.before_condition_vegetation]}>
                            Before: {assessment.before_condition_vegetation || '-'}
                          </Tag>
                          <Tag color={conditionColors[assessment.after_condition_vegetation]}>
                            After: {assessment.after_condition_vegetation || '-'}
                          </Tag>
                        </Col>
                        <Col span={6}>
                          <Text strong>Erosion:</Text>
                          <br />
                          <Tag color={conditionColors[assessment.before_condition_erosion]}>
                            Before: {assessment.before_condition_erosion || '-'}
                          </Tag>
                          <Tag color={conditionColors[assessment.after_condition_erosion]}>
                            After: {assessment.after_condition_erosion || '-'}
                          </Tag>
                        </Col>
                        <Col span={6}>
                          <Text strong>Soil Fertility:</Text>
                          <br />
                          <Tag color={assessment.soil_fertility_improvement === 'significant' ? 'green' : 'blue'}>
                            {assessment.soil_fertility_improvement || '-'}
                          </Tag>
                        </Col>
                        <Col span={6}>
                          <Text strong>Vegetation Increase:</Text>
                          <br />
                          <Progress 
                            percent={assessment.vegetation_cover_increase_percent || 0} 
                            size="small" 
                            status={assessment.vegetation_cover_increase_percent > 50 ? 'success' : 'active'}
                          />
                        </Col>
                      </Row>
                      {assessment.impact_measurement && (
                        <Row style={{ marginTop: 8 }}>
                          <Col span={24}>
                            <Text strong>Impact Measurement:</Text>
                            <br />
                            <Text>{assessment.impact_measurement}</Text>
                          </Col>
                        </Row>
                      )}
                    </Card>
                  ))}
                </div>
              ) : (
                <Empty description="No impact measurements available" />
              )}
            </TabPane>
          </Tabs>
        )}
      </Modal>
    </div>
  );
};

export default LandRehabilitation;