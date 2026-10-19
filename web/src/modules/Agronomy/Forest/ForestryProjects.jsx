import React, { useState, useEffect, useMemo } from 'react';
import { 
  Table, Button, Modal, Form, Input, Select, DatePicker, Space, Tag, 
  Card, Row, Col, message, Popconfirm, Typography, Breadcrumb, Statistic, Empty,
  Descriptions, Divider
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, CheckOutlined, EyeOutlined, HomeOutlined,
  SearchOutlined, DownloadOutlined, DashboardOutlined, DollarOutlined, 
  ClusterOutlined, CheckCircleOutlined 
} from '@ant-design/icons';
import agronomyApi from '../../../services/api/agronomyApi';
import dayjs from 'dayjs';
import { handleApiError } from '../../../utils/errorHandler';
import BrandedLoader from '../../../components/common/BrandedLoader';

const { Title, Text } = Typography;
const { Option } = Select;

// KPI Card Styles
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

const ForestryProjects = () => {
  const [projects, setProjects] = useState([]);
  const [forests, setForests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Registration / Edit Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  // View Detail Modal State
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  // Filter States
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [forestFilter, setForestFilter] = useState('All');

  const statusColors = {
    proposed: 'default',
    approved: 'processing',
    ongoing: 'warning',
    completed: 'success',
    closed: 'default',
    cancelled: 'error',
  };

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await agronomyApi.getReforestationProjects();
      setProjects(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      handleApiError(error, 'Failed to fetch reforestation projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchForests = async () => {
    try {
      const res = await agronomyApi.getForests();
      setForests(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Failed to fetch forests', error);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchForests();
  }, []);

  // Filtered Projects Computation
  const filteredProjects = useMemo(() => {
    return projects.filter((item) => {
      const forestName = item.forest?.name || '';
      const matchesSearch =
        !searchText ||
        item.project_name?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.responsible_organization?.toLowerCase().includes(searchText.toLowerCase()) ||
        forestName.toLowerCase().includes(searchText.toLowerCase());

      const matchesStatus = statusFilter === 'All' || item.project_status === statusFilter;
      const matchesForest = forestFilter === 'All' || item.forest_id === forestFilter;

      return matchesSearch && matchesStatus && matchesForest;
    });
  }, [projects, searchText, statusFilter, forestFilter]);

  // Analytics Computations
  const totalBudgetAllocated = useMemo(() => {
    return projects.reduce((sum, item) => sum + Number(item.budget_allocated || 0), 0);
  }, [projects]);

  const totalTreesPlanted = useMemo(() => {
    return projects.reduce((sum, item) => sum + Number(item.trees_planted || 0), 0);
  }, [projects]);

  const avgSurvivalRate = useMemo(() => {
    const validProjects = projects.filter(p => p.survival_rate_percent !== null && p.survival_rate_percent !== undefined);
    if (!validProjects.length) return 0;
    const sum = validProjects.reduce((acc, p) => acc + Number(p.survival_rate_percent || 0), 0);
    return sum / validProjects.length;
  }, [projects]);

  // Handle View Action
  const handleView = (record) => {
    setSelectedProject(record);
    setViewModalVisible(true);
  };

  // CSV Export
  const exportToCSV = () => {
    if (filteredProjects.length === 0) {
      message.warning('No data available to export.');
      return;
    }

    const headers = 'Project Name,Forest,Start Date,End Date,Budget (ETB),Trees Planted,Survival Rate (%),Status,Organization\n';

    const rows = filteredProjects
      .map((item) => {
        const forestName = item.forest?.name || '';
        return `"${item.project_name || ''}","${forestName}","${item.start_date || ''}","${item.end_date || ''}",${item.budget_allocated || 0},${item.trees_planted || 0},${item.survival_rate_percent || 0},"${item.project_status || ''}","${item.responsible_organization || ''}"`;
      })
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Reforestation_Projects_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const data = {
        ...values,
        budget_allocated: values.budget_allocated ? Number(values.budget_allocated) : null,
        trees_planted: values.trees_planted ? Number(values.trees_planted) : null,
        survival_rate_percent: values.survival_rate_percent ? Number(values.survival_rate_percent) : null,
        start_date: values.start_date?.format('YYYY-MM-DD'),
        end_date: values.end_date?.format('YYYY-MM-DD'),
        project_status: values.project_status || 'proposed',
      };
      
      if (editingId) {
        await agronomyApi.updateReforestationProject(editingId, data);
        message.success('Project updated successfully');
      } else {
        await agronomyApi.createReforestationProject(data);
        message.success('Reforestation project created successfully');
      }
      setModalVisible(false);
      form.resetFields();
      setEditingId(null);
      fetchProjects();
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
      await agronomyApi.deleteReforestationProject(id);
      message.success('Project deleted successfully');
      fetchProjects();
    } catch (error) {
      handleApiError(error, 'Failed to delete project');
    }
  };

  const handleApprove = async (id) => {
    try {
      await agronomyApi.approveReforestationProject(id);
      message.success('Project approved successfully');
      fetchProjects();
    } catch (error) {
      handleApiError(error, 'Failed to approve project');
    }
  };

  const handleEdit = (record) => {
    setEditingId(record.id);
    form.setFieldsValue({
      ...record,
      start_date: record.start_date ? dayjs(record.start_date) : null,
      end_date: record.end_date ? dayjs(record.end_date) : null,
    });
    setModalVisible(true);
  };

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({ project_status: 'proposed' });
    setModalVisible(true);
  };

  const columns = [
    { title: 'Project Name', dataIndex: 'project_name', key: 'project_name', width: 200 },
    { 
      title: 'Forest', 
      dataIndex: ['forest', 'name'], 
      key: 'forest_name',
      render: (text, record) => text || record.forest?.name || '-'
    },
    { title: 'Start Date', dataIndex: 'start_date', key: 'start_date' },
    { title: 'End Date', dataIndex: 'end_date', key: 'end_date' },
    { 
      title: 'Budget', 
      dataIndex: 'budget_allocated', 
      key: 'budget_allocated', 
      sorter: (a, b) => (a.budget_allocated || 0) - (b.budget_allocated || 0),
      render: (val) => val ? `ETB ${val.toLocaleString()}` : '-' 
    },
    { 
      title: 'Trees Planted', 
      dataIndex: 'trees_planted', 
      key: 'trees_planted', 
      render: (val) => val ? val.toLocaleString() : '-' 
    },
    { 
      title: 'Survival Rate', 
      dataIndex: 'survival_rate_percent', 
      key: 'survival_rate_percent', 
      render: (val) => val ? <Tag color={val >= 75 ? 'green' : 'orange'}>{val}%</Tag> : '-' 
    },
    { 
      title: 'Status', 
      dataIndex: 'project_status', 
      key: 'project_status',
      render: (val) => <Tag color={statusColors[val] || 'default'}>{val?.toUpperCase()}</Tag>
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Button size="small" icon={<EyeOutlined />} onClick={() => handleView(record)} />
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          {record.project_status !== 'approved' && record.project_status !== 'completed' && (
            <Popconfirm title="Approve this project?" onConfirm={() => handleApprove(record.id)}>
              <Button size="small" icon={<CheckOutlined />} type="primary" ghost />
            </Popconfirm>
          )}
          <Popconfirm title="Delete this project?" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', background: '#f8fafc', minHeight: '100vh' }}>
      {(loading || isSubmitting) && <BrandedLoader message={isSubmitting ? "Saving..." : "Loading Projects..."} />}

      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item><HomeOutlined /></Breadcrumb.Item>
        <Breadcrumb.Item>Agronomy</Breadcrumb.Item>
        <Breadcrumb.Item>Reforestation Projects</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ marginBottom: 20 }}>
        <Title level={3} style={{ marginBottom: 4, color: '#1a5f2c' }}>
          🌲 Reforestation Projects Management
        </Title>
        <Text type="secondary">
          Track reforestation campaigns, budget allocations, tree planting metrics, and survival rates
        </Text>
      </div>

      {/* ===== ANALYTICAL KPI CARDS ===== */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={CARD_STYLE_GREEN}>
            <Statistic 
              title="Total Projects" 
              value={projects.length} 
              prefix={<DashboardOutlined style={{ color: '#52c41a' }} />} 
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={CARD_STYLE_BLUE}>
            <Statistic 
              title="Total Allocated Budget" 
              value={totalBudgetAllocated} 
              prefix={<DollarOutlined style={{ color: '#1890ff' }} />} 
              formatter={(val) => `ETB ${Number(val).toLocaleString()}`}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={CARD_STYLE_ORANGE}>
            <Statistic 
              title="Trees Planted" 
              value={totalTreesPlanted} 
              prefix={<ClusterOutlined style={{ color: '#fa8c16' }} />} 
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={CARD_STYLE_PURPLE}>
            <Statistic 
              title="Avg Survival Rate" 
              value={avgSurvivalRate} 
              precision={1} 
              suffix="%" 
              prefix={<CheckCircleOutlined style={{ color: '#722ed1' }} />} 
            />
          </Card>
        </Col>
      </Row>

      {/* ===== SEARCH & FILTER TOOLBAR ===== */}
      <Card bordered={false} style={{ marginBottom: 16, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <Row gutter={[16, 16]} align="middle" justify="space-between">
          <Col xs={24} md={8}>
            <Input
              placeholder="Search project name, organization, forest..."
              prefix={<SearchOutlined />}
              allowClear
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>

          <Col xs={24} sm={10} md={5}>
            <Select style={{ width: '100%' }} defaultValue="All" onChange={(val) => setStatusFilter(val)}>
              <Option value="All">All Statuses</Option>
              <Option value="proposed">Proposed</Option>
              <Option value="approved">Approved</Option>
              <Option value="ongoing">Ongoing</Option>
              <Option value="completed">Completed</Option>
              <Option value="closed">Closed</Option>
              <Option value="cancelled">Cancelled</Option>
            </Select>
          </Col>

          <Col xs={24} sm={10} md={5}>
            <Select style={{ width: '100%' }} defaultValue="All" onChange={(val) => setForestFilter(val)}>
              <Option value="All">All Forests</Option>
              {forests.map(f => <Option key={f.id} value={f.id}>{f.name}</Option>)}
            </Select>
          </Col>

          <Col xs={24} md={5}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <Button icon={<DownloadOutlined />} onClick={exportToCSV}>
                Export
              </Button>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={handleAdd}
                style={{ backgroundColor: '#1b7837', borderColor: '#1b7837' }}
              >
                Create Project
              </Button>
            </div>
          </Col>
        </Row>
      </Card>

      {/* ===== DATA TABLE ===== */}
      <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        {projects.length === 0 && !loading ? (
          <Empty description="No reforestation projects created yet." />
        ) : (
          <Table 
            columns={columns} 
            dataSource={filteredProjects} 
            rowKey="id" 
            loading={loading} 
            pagination={{ pageSize: 10, showSizeChanger: true }} 
            scroll={{ x: 1200 }}
          />
        )}
      </Card>

      {/* ===== VIEW DETAIL MODAL ===== */}
      <Modal
        title={
          <Space align="center">
            <span>🌲 Reforestation Project Details: {selectedProject?.project_name}</span>
            {selectedProject && (
              <Tag color={statusColors[selectedProject.project_status] || 'default'}>
                {selectedProject.project_status?.toUpperCase()}
              </Tag>
            )}
          </Space>
        }
        open={viewModalVisible}
        onCancel={() => {
          setViewModalVisible(false);
          setSelectedProject(null);
        }}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            Close
          </Button>,
          <Button
            key="edit"
            type="primary"
            icon={<EditOutlined />}
            style={{ backgroundColor: '#1b7837', borderColor: '#1b7837' }}
            onClick={() => {
              const recordToEdit = selectedProject;
              setViewModalVisible(false);
              handleEdit(recordToEdit);
            }}
          >
            Edit Project
          </Button>
        ]}
        width={950}
        destroyOnClose
      >
        {selectedProject && (
          <div style={{ paddingTop: 10 }}>
            <Descriptions 
              title="📋 General Project Information" 
              bordered 
              column={2} 
              size="middle"
              labelStyle={{ width: '22%', fontWeight: 600, background: '#fafafa' }}
              contentStyle={{ width: '28%' }}
            >
              <Descriptions.Item label="Project Name">
                <Text strong>{selectedProject.project_name}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Associated Forest">
                {selectedProject.forest?.name || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Start Date">
                {selectedProject.start_date ? dayjs(selectedProject.start_date).format('MMM DD, YYYY') : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="End Date">
                {selectedProject.end_date ? dayjs(selectedProject.end_date).format('MMM DD, YYYY') : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Responsible Org" span={2}>
                {selectedProject.responsible_organization || 'N/A'}
              </Descriptions.Item>
            </Descriptions>

            <Divider style={{ margin: '16px 0' }} />

            <Descriptions 
              title="📊 Budget & Performance Metrics" 
              bordered 
              column={2} 
              size="middle"
              labelStyle={{ width: '22%', fontWeight: 600, background: '#fafafa' }}
              contentStyle={{ width: '28%' }}
            >
              <Descriptions.Item label="Budget Allocated">
                <Tag color="blue">{selectedProject.budget_allocated ? `ETB ${Number(selectedProject.budget_allocated).toLocaleString()}` : 'N/A'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Trees Planted">
                <Tag color="cyan">{selectedProject.trees_planted ? selectedProject.trees_planted.toLocaleString() : '0'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Survival Rate">
                {selectedProject.survival_rate_percent !== null && selectedProject.survival_rate_percent !== undefined ? (
                  <Tag color={selectedProject.survival_rate_percent >= 75 ? 'green' : 'orange'}>
                    {selectedProject.survival_rate_percent}%
                  </Tag>
                ) : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Project Status">
                <Tag color={statusColors[selectedProject.project_status] || 'default'}>
                  {selectedProject.project_status?.toUpperCase()}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            {selectedProject.remarks && (
              <>
                <Divider style={{ margin: '16px 0' }} />
                <Text strong style={{ display: 'block', marginBottom: 8 }}>📝 Remarks / Notes</Text>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <Text type="secondary">{selectedProject.remarks}</Text>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* ===== REGISTRATION MODAL ===== */}
      <Modal
        title={editingId ? 'Edit Reforestation Project' : 'Create New Reforestation Project'}
        open={modalVisible}
        onCancel={() => { setModalVisible(false); form.resetFields(); setEditingId(null); }}
        footer={null}
        width={650}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="project_name" label="Project Name" rules={[{ required: true, message: 'Project name is required' }]}>
            <Input placeholder="Enter project name" />
          </Form.Item>

          <Form.Item name="forest_id" label="Associated Forest">
            <Select placeholder="Select forest (optional)" allowClear>
              {forests.map(f => <Option key={f.id} value={f.id}>{f.name}</Option>)}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="start_date" label="Start Date" rules={[{ required: true, message: 'Start date is required' }]}>
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="end_date" label="End Date">
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="budget_allocated" label="Budget Allocated (ETB)">
                <Input type="number" placeholder="Enter budget" min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="responsible_organization" label="Responsible Organization">
                <Input placeholder="Enter organization name" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="trees_planted" label="Trees Planted">
                <Input type="number" placeholder="Number of trees" min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="survival_rate_percent" label="Survival Rate (%)">
                <Input type="number" placeholder="0 - 100" min={0} max={100} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="project_status" label="Project Status">
            <Select placeholder="Select status">
              <Option value="proposed">Proposed</Option>
              <Option value="approved">Approved</Option>
              <Option value="ongoing">Ongoing</Option>
              <Option value="completed">Completed</Option>
              <Option value="closed">Closed</Option>
              <Option value="cancelled">Cancelled</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={isSubmitting} style={{ backgroundColor: '#1b7837', borderColor: '#1b7837' }}>
                {editingId ? 'Update Project' : 'Create Project'}
              </Button>
              <Button onClick={() => { setModalVisible(false); form.resetFields(); setEditingId(null); }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ForestryProjects;