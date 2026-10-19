import React, { useState, useEffect, useMemo } from 'react';
import { 
  Table, Button, Modal, Form, Input, Select, DatePicker, Space, Tag, 
  Card, Row, Col, message, Popconfirm, Typography, Breadcrumb, Statistic, Empty,
  Descriptions, Divider 
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, HomeOutlined,
  SearchOutlined, DownloadOutlined, DashboardOutlined, AreaChartOutlined, 
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

const ForestryPlantations = () => {
  const [activities, setActivities] = useState([]);
  const [forests, setForests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Registration / Edit Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  // View Detail Modal State
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);

  // Filter States
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [forestFilter, setForestFilter] = useState('All');

  const statusColors = {
    planned: 'default',
    in_progress: 'processing',
    completed: 'success',
    postponed: 'warning',
    cancelled: 'error',
  };

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await agronomyApi.getPlantations();
      setActivities(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      handleApiError(error, 'Failed to fetch plantation activities');
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
    fetchActivities();
    fetchForests();
  }, []);

  // Filtered Data Computation
  const filteredActivities = useMemo(() => {
    return activities.filter((item) => {
      const forestName = item.forest?.name || '';
      const matchesSearch =
        !searchText ||
        item.species_planted?.toLowerCase().includes(searchText.toLowerCase()) ||
        forestName.toLowerCase().includes(searchText.toLowerCase()) ||
        item.activity_type?.toLowerCase().includes(searchText.toLowerCase());

      const matchesType = typeFilter === 'All' || item.activity_type === typeFilter;
      const matchesStatus = statusFilter === 'All' || item.activity_status === statusFilter;
      const matchesForest = forestFilter === 'All' || item.forest_id === forestFilter;

      return matchesSearch && matchesType && matchesStatus && matchesForest;
    });
  }, [activities, searchText, typeFilter, statusFilter, forestFilter]);

  // Analytics Computations
  const totalTreesPlanted = useMemo(() => {
    return activities.reduce((sum, item) => sum + Number(item.number_of_trees_planted || 0), 0);
  }, [activities]);

  const totalAreaPlanted = useMemo(() => {
    return activities.reduce((sum, item) => sum + Number(item.area_planted_hectares || 0), 0);
  }, [activities]);

  const completedCount = useMemo(() => {
    return activities.filter(i => i.activity_status === 'completed').length;
  }, [activities]);

  // Handle View Action
  const handleView = (record) => {
    setSelectedActivity(record);
    setViewModalVisible(true);
  };

  // CSV Export
  const exportToCSV = () => {
    if (filteredActivities.length === 0) {
      message.warning('No data available to export.');
      return;
    }

    const headers = 'Forest,Activity Type,Species Planted,Trees Planted,Area (Ha),Density (trees/ha),Planting Date,Status\n';

    const rows = filteredActivities
      .map((item) => {
        const forestName = item.forest?.name || '';
        return `"${forestName}","${item.activity_type || ''}","${item.species_planted || ''}",${item.number_of_trees_planted || 0},${item.area_planted_hectares || 0},${item.planting_density || ''},"${item.planting_date || ''}","${item.activity_status || ''}"`;
      })
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Plantation_Activities_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const data = {
        ...values,
        number_of_trees_planted: Number(values.number_of_trees_planted),
        area_planted_hectares: Number(values.area_planted_hectares),
        planting_density: values.planting_density ? Number(values.planting_density) : null,
        planting_date: values.planting_date?.format('YYYY-MM-DD'),
        activity_status: values.activity_status || 'planned',
      };
      
      if (editingId) {
        await agronomyApi.updatePlantation(editingId, data);
        message.success('Plantation activity updated successfully');
      } else {
        await agronomyApi.createPlantation(data);
        message.success('Plantation activity recorded successfully');
      }
      setModalVisible(false);
      form.resetFields();
      setEditingId(null);
      fetchActivities();
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
      await agronomyApi.deletePlantation(id);
      message.success('Plantation activity deleted successfully');
      fetchActivities();
    } catch (error) {
      handleApiError(error, 'Failed to delete activity');
    }
  };

  const handleEdit = (record) => {
    setEditingId(record.id);
    form.setFieldsValue({
      ...record,
      planting_date: record.planting_date ? dayjs(record.planting_date) : null,
    });
    setModalVisible(true);
  };

  const columns = [
    { 
      title: 'Forest', 
      dataIndex: ['forest', 'name'], 
      key: 'forest_name',
      render: (text, record) => text || record.forest?.name || '-'
    },
    { 
      title: 'Activity Type', 
      dataIndex: 'activity_type', 
      key: 'activity_type', 
      render: (val) => <Tag color="blue">{val?.replace('_', ' ')}</Tag> 
    },
    { title: 'Species Planted', dataIndex: 'species_planted', key: 'species_planted' },
    { 
      title: 'Trees Planted', 
      dataIndex: 'number_of_trees_planted', 
      key: 'number_of_trees_planted', 
      sorter: (a, b) => (a.number_of_trees_planted || 0) - (b.number_of_trees_planted || 0),
      render: (val) => val?.toLocaleString() 
    },
    { 
      title: 'Area (ha)', 
      dataIndex: 'area_planted_hectares', 
      key: 'area_planted_hectares',
      render: (val) => <Tag color="cyan">{val} Ha</Tag>
    },
    { title: 'Planting Date', dataIndex: 'planting_date', key: 'planting_date' },
    { 
      title: 'Status', 
      dataIndex: 'activity_status', 
      key: 'activity_status',
      render: (val) => <Tag color={statusColors[val] || 'default'}>{val?.replace('_', ' ')}</Tag>
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button size="small" icon={<EyeOutlined />} onClick={() => handleView(record)} />
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm title="Delete this activity?" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', background: '#f8fafc', minHeight: '100vh' }}>
      {(loading || isSubmitting) && <BrandedLoader message={isSubmitting ? "Saving..." : "Loading Activities..."} />}

      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item><HomeOutlined /></Breadcrumb.Item>
        <Breadcrumb.Item>Agronomy</Breadcrumb.Item>
        <Breadcrumb.Item>Plantation Activities</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ marginBottom: 20 }}>
        <Title level={3} style={{ marginBottom: 4, color: '#1a5f2c' }}>
          🌱 Plantation Activities
        </Title>
        <Text type="secondary">
          Track tree planting programs, species distributions, and afforestation milestones
        </Text>
      </div>

      {/* ===== ANALYTICAL KPI CARDS ===== */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={CARD_STYLE_GREEN}>
            <Statistic 
              title="Total Activities" 
              value={activities.length} 
              prefix={<DashboardOutlined style={{ color: '#52c41a' }} />} 
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={CARD_STYLE_BLUE}>
            <Statistic 
              title="Total Trees Planted" 
              value={totalTreesPlanted} 
              prefix={<AreaChartOutlined style={{ color: '#1890ff' }} />} 
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={CARD_STYLE_ORANGE}>
            <Statistic 
              title="Total Area Planted" 
              value={totalAreaPlanted} 
              precision={2} 
              suffix="Ha" 
              prefix={<ClusterOutlined style={{ color: '#fa8c16' }} />} 
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={CARD_STYLE_PURPLE}>
            <Statistic 
              title="Completed Projects" 
              value={completedCount} 
              prefix={<CheckCircleOutlined style={{ color: '#722ed1' }} />} 
            />
          </Card>
        </Col>
      </Row>

      {/* ===== SEARCH & FILTER TOOLBAR ===== */}
      <Card bordered={false} style={{ marginBottom: 16, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <Row gutter={[16, 16]} align="middle" justify="space-between">
          <Col xs={24} md={6}>
            <Input
              placeholder="Search species, forest, type..."
              prefix={<SearchOutlined />}
              allowClear
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>

          <Col xs={24} sm={8} md={4}>
            <Select style={{ width: '100%' }} defaultValue="All" onChange={(val) => setTypeFilter(val)}>
              <Option value="All">All Types</Option>
              <Option value="reforestation">Reforestation</Option>
              <Option value="afforestation">Afforestation</Option>
              <Option value="enrichment">Enrichment</Option>
              <Option value="plantation">Plantation</Option>
            </Select>
          </Col>

          <Col xs={24} sm={8} md={4}>
            <Select style={{ width: '100%' }} defaultValue="All" onChange={(val) => setStatusFilter(val)}>
              <Option value="All">All Statuses</Option>
              <Option value="planned">Planned</Option>
              <Option value="in_progress">In Progress</Option>
              <Option value="completed">Completed</Option>
              <Option value="postponed">Postponed</Option>
              <Option value="cancelled">Cancelled</Option>
            </Select>
          </Col>

          <Col xs={24} sm={8} md={5}>
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
                onClick={() => { setEditingId(null); form.resetFields(); setModalVisible(true); }}
                style={{ backgroundColor: '#1b7837', borderColor: '#1b7837' }}
              >
                Record Plantation
              </Button>
            </div>
          </Col>
        </Row>
      </Card>

      {/* ===== DATA TABLE ===== */}
      <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        {activities.length === 0 && !loading ? (
          <Empty description="No plantation activities recorded yet." />
        ) : (
          <Table 
            columns={columns} 
            dataSource={filteredActivities} 
            rowKey="id" 
            loading={loading} 
            pagination={{ pageSize: 10, showSizeChanger: true }} 
          />
        )}
      </Card>

      {/* ===== VIEW DETAIL MODAL ===== */}
      <Modal
        title={
          <Space align="center">
            <span>🌱 Plantation Activity Details</span>
            {selectedActivity && (
              <Tag color={statusColors[selectedActivity.activity_status] || 'default'}>
                {selectedActivity.activity_status?.replace('_', ' ')}
              </Tag>
            )}
          </Space>
        }
        open={viewModalVisible}
        onCancel={() => {
          setViewModalVisible(false);
          setSelectedActivity(null);
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
              const recordToEdit = selectedActivity;
              setViewModalVisible(false);
              handleEdit(recordToEdit);
            }}
          >
            Edit Activity
          </Button>
        ]}
        width={950}
        destroyOnClose
      >
        {selectedActivity && (
          <div style={{ paddingTop: 10 }}>
            <Descriptions 
              title="📋 General Activity Details" 
              bordered 
              column={2} 
              size="middle"
              labelStyle={{ width: '22%', fontWeight: 600, background: '#fafafa' }}
              contentStyle={{ width: '28%' }}
            >
              <Descriptions.Item label="Forest">
                <Text strong>{selectedActivity.forest?.name || '-'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Activity Type">
                <Tag color="blue">{selectedActivity.activity_type?.replace('_', ' ') || 'N/A'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Species Planted">{selectedActivity.species_planted || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Planting Date">
                {selectedActivity.planting_date ? dayjs(selectedActivity.planting_date).format('MMM DD, YYYY') : 'N/A'}
              </Descriptions.Item>
            </Descriptions>

            <Divider style={{ margin: '16px 0' }} />

            <Descriptions 
              title="📊 Quantities & Metrics" 
              bordered 
              column={2} 
              size="middle"
              labelStyle={{ width: '22%', fontWeight: 600, background: '#fafafa' }}
              contentStyle={{ width: '28%' }}
            >
              <Descriptions.Item label="Trees Planted">
                <Tag color="green">{selectedActivity.number_of_trees_planted?.toLocaleString() || '0'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Area Planted">
                <Tag color="cyan">{selectedActivity.area_planted_hectares ? `${selectedActivity.area_planted_hectares} Ha` : 'N/A'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Planting Density">
                {selectedActivity.planting_density ? `${selectedActivity.planting_density} trees/ha` : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={statusColors[selectedActivity.activity_status] || 'default'}>
                  {selectedActivity.activity_status?.replace('_', ' ')}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            {selectedActivity.remarks && (
              <>
                <Divider style={{ margin: '16px 0' }} />
                <Text strong style={{ display: 'block', marginBottom: 8 }}>📝 Remarks / Notes</Text>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <Text type="secondary">{selectedActivity.remarks}</Text>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* ===== REGISTRATION MODAL ===== */}
      <Modal
        title={editingId ? 'Edit Plantation Activity' : 'Record New Plantation Activity'}
        open={modalVisible}
        onCancel={() => { setModalVisible(false); form.resetFields(); setEditingId(null); }}
        footer={null}
        width={650}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="forest_id" label="Forest" rules={[{ required: true, message: 'Please select a forest' }]}>
            <Select placeholder="Select forest">
              {forests.map(f => <Option key={f.id} value={f.id}>{f.name}</Option>)}
            </Select>
          </Form.Item>

          <Form.Item name="activity_type" label="Activity Type" rules={[{ required: true, message: 'Please select activity type' }]}>
            <Select placeholder="Select type">
              <Option value="reforestation">Reforestation</Option>
              <Option value="afforestation">Afforestation</Option>
              <Option value="enrichment">Enrichment</Option>
              <Option value="plantation">Plantation</Option>
            </Select>
          </Form.Item>

          <Form.Item name="species_planted" label="Species Planted" rules={[{ required: true, message: 'Species name is required' }]}>
            <Input placeholder="e.g. Eucalyptus, Acacia, Bamboo" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="number_of_trees_planted" label="Number of Trees" rules={[{ required: true, message: 'Tree count is required' }]}>
                <Input type="number" placeholder="e.g. 1500" min={1} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="area_planted_hectares" label="Area (ha)" rules={[{ required: true, message: 'Area is required' }]}>
                <Input type="number" placeholder="e.g. 2.5" step="0.01" min={0} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="planting_density" label="Planting Density (trees/ha)">
                <Input type="number" placeholder="e.g. 600" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="planting_date" label="Planting Date" rules={[{ required: true, message: 'Planting date is required' }]}>
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="activity_status" label="Status">
            <Select placeholder="Select status">
              <Option value="planned">Planned</Option>
              <Option value="in_progress">In Progress</Option>
              <Option value="completed">Completed</Option>
              <Option value="postponed">Postponed</Option>
              <Option value="cancelled">Cancelled</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={isSubmitting} style={{ backgroundColor: '#1b7837', borderColor: '#1b7837' }}>
                {editingId ? 'Update Activity' : 'Record Activity'}
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

export default ForestryPlantations;