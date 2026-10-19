import React, { useState, useEffect, useMemo } from 'react';
import { 
  Table, Button, Modal, Form, Input, Select, DatePicker, Space, Tag, 
  Card, Row, Col, message, Popconfirm, Typography, Breadcrumb, Statistic, Empty,
  Descriptions, Divider
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, HomeOutlined,
  SearchOutlined, DownloadOutlined, DashboardOutlined, AlertOutlined, 
  SafetyCertificateOutlined, CheckCircleOutlined 
} from '@ant-design/icons';
import agronomyApi from '../../../services/api/agronomyApi';
import dayjs from 'dayjs';
import { handleApiError } from '../../../utils/errorHandler';
import BrandedLoader from '../../../components/common/BrandedLoader';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// KPI Card Styles
const CARD_STYLE_GREEN = {
  borderTop: '3px solid #52c41a',
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

const CARD_STYLE_BLUE = {
  borderTop: '3px solid #1890ff',
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

const ForestryProtections = () => {
  const [protections, setProtections] = useState([]);
  const [forests, setForests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Registration / Edit Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  // View Detail Modal State
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedProtection, setSelectedProtection] = useState(null);

  // Filter States
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [forestFilter, setForestFilter] = useState('All');

  const statusColors = {
    active: 'processing',
    inactive: 'default',
    completed: 'success',
    pending: 'warning',
  };

  const activityTypeColors = {
    patrol: 'processing',
    fire_prevention: 'error',
    community_awareness: 'orange',
    enforcement: 'purple',
  };

  const fetchProtections = async () => {
    setLoading(true);
    try {
      const res = await agronomyApi.getForestProtections();
      setProtections(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      handleApiError(error, 'Failed to fetch forest protections');
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
    fetchProtections();
    fetchForests();
  }, []);

  // Filtered Computations
  const filteredProtections = useMemo(() => {
    return protections.filter((item) => {
      const forestName = item.forest?.name || '';
      const matchesSearch =
        !searchText ||
        forestName.toLowerCase().includes(searchText.toLowerCase()) ||
        item.incidents_detected?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.action_taken?.toLowerCase().includes(searchText.toLowerCase());

      const matchesType = typeFilter === 'All' || item.activity_type === typeFilter;
      const matchesStatus = statusFilter === 'All' || item.protection_status === statusFilter;
      const matchesForest = forestFilter === 'All' || item.forest_id === forestFilter;

      return matchesSearch && matchesType && matchesStatus && matchesForest;
    });
  }, [protections, searchText, typeFilter, statusFilter, forestFilter]);

  // Analytics Computations
  const incidentsCount = useMemo(() => {
    return protections.filter(p => p.incidents_detected && p.incidents_detected.trim().length > 0).length;
  }, [protections]);

  const patrolsCount = useMemo(() => {
    return protections.filter(p => p.activity_type === 'patrol' || p.activity_type === 'fire_prevention').length;
  }, [protections]);

  const activeCount = useMemo(() => {
    return protections.filter(p => p.protection_status === 'active' || p.protection_status === 'completed').length;
  }, [protections]);

  // Handle View Action
  const handleView = (record) => {
    setSelectedProtection(record);
    setViewModalVisible(true);
  };

  // CSV Export
  const exportToCSV = () => {
    if (filteredProtections.length === 0) {
      message.warning('No data available to export.');
      return;
    }

    const headers = 'Forest,Activity Type,Activity Date,Incidents Detected,Action Taken,Status\n';

    const rows = filteredProtections
      .map((item) => {
        const forestName = item.forest?.name || '';
        const incidents = (item.incidents_detected || '').replace(/"/g, '""');
        const actions = (item.action_taken || '').replace(/"/g, '""');
        return `"${forestName}","${item.activity_type || ''}","${item.activity_date || ''}","${incidents}","${actions}","${item.protection_status || ''}"`;
      })
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Forest_Protections_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const data = {
        ...values,
        activity_date: values.activity_date?.format('YYYY-MM-DD'),
        protection_status: values.protection_status || 'active',
      };
      
      if (editingId) {
        await agronomyApi.updateForestProtection(editingId, data);
        message.success('Protection activity updated successfully');
      } else {
        await agronomyApi.createForestProtection(data);
        message.success('Forest protection activity recorded successfully');
      }
      setModalVisible(false);
      form.resetFields();
      setEditingId(null);
      fetchProtections();
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
      await agronomyApi.deleteForestProtection(id);
      message.success('Protection activity deleted successfully');
      fetchProtections();
    } catch (error) {
      handleApiError(error, 'Failed to delete activity');
    }
  };

  const handleEdit = (record) => {
    setEditingId(record.id);
    form.setFieldsValue({
      ...record,
      activity_date: record.activity_date ? dayjs(record.activity_date) : null,
    });
    setModalVisible(true);
  };

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({ protection_status: 'active', activity_type: 'patrol' });
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
      render: (val) => <Tag color={activityTypeColors[val] || 'default'}>{val?.replace('_', ' ')}</Tag>
    },
    { title: 'Activity Date', dataIndex: 'activity_date', key: 'activity_date' },
    { 
      title: 'Incidents Detected', 
      dataIndex: 'incidents_detected', 
      key: 'incidents_detected',
      ellipsis: true,
      render: (val) => val || '-' 
    },
    { 
      title: 'Action Taken', 
      dataIndex: 'action_taken', 
      key: 'action_taken',
      ellipsis: true,
      render: (val) => val || '-' 
    },
    { 
      title: 'Status', 
      dataIndex: 'protection_status', 
      key: 'protection_status',
      render: (val) => <Tag color={statusColors[val] || 'default'}>{val?.toUpperCase()}</Tag>
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
      {(loading || isSubmitting) && <BrandedLoader message={isSubmitting ? "Saving..." : "Loading Protections..."} />}

      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item><HomeOutlined /></Breadcrumb.Item>
        <Breadcrumb.Item>Agronomy</Breadcrumb.Item>
        <Breadcrumb.Item>Forest Protections</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ marginBottom: 20 }}>
        <Title level={3} style={{ marginBottom: 4, color: '#1a5f2c' }}>
          🛡️ Forest Protection Activities
        </Title>
        <Text type="secondary">
          Monitor forest patrols, fire prevention measures, incident detection, and community enforcement
        </Text>
      </div>

      {/* ===== ANALYTICAL KPI CARDS ===== */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={CARD_STYLE_GREEN}>
            <Statistic 
              title="Total Patrol Records" 
              value={protections.length} 
              prefix={<DashboardOutlined style={{ color: '#52c41a' }} />} 
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={CARD_STYLE_RED}>
            <Statistic 
              title="Incidents Reported" 
              value={incidentsCount} 
              prefix={<AlertOutlined style={{ color: '#ff4d4f' }} />} 
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={CARD_STYLE_BLUE}>
            <Statistic 
              title="Patrols & Fire Prevention" 
              value={patrolsCount} 
              prefix={<SafetyCertificateOutlined style={{ color: '#1890ff' }} />} 
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={CARD_STYLE_PURPLE}>
            <Statistic 
              title="Active / Completed" 
              value={activeCount} 
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
              placeholder="Search incidents, actions, forest..."
              prefix={<SearchOutlined />}
              allowClear
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>

          <Col xs={24} sm={10} md={5}>
            <Select style={{ width: '100%' }} defaultValue="All" onChange={(val) => setTypeFilter(val)}>
              <Option value="All">All Activity Types</Option>
              <Option value="patrol">Patrol</Option>
              <Option value="fire_prevention">Fire Prevention</Option>
              <Option value="community_awareness">Community Awareness</Option>
              <Option value="enforcement">Enforcement</Option>
            </Select>
          </Col>

          <Col xs={24} sm={10} md={4}>
            <Select style={{ width: '100%' }} defaultValue="All" onChange={(val) => setStatusFilter(val)}>
              <Option value="All">All Statuses</Option>
              <Option value="active">Active</Option>
              <Option value="pending">Pending</Option>
              <Option value="completed">Completed</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </Col>

          <Col xs={24} sm={10} md={4}>
            <Select style={{ width: '100%' }} defaultValue="All" onChange={(val) => setForestFilter(val)}>
              <Option value="All">All Forests</Option>
              {forests.map(f => <Option key={f.id} value={f.id}>{f.name}</Option>)}
            </Select>
          </Col>

          <Col xs={24} md={3}>
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
                Record
              </Button>
            </div>
          </Col>
        </Row>
      </Card>

      {/* ===== DATA TABLE ===== */}
      <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        {protections.length === 0 && !loading ? (
          <Empty description="No protection activities recorded yet." />
        ) : (
          <Table 
            columns={columns} 
            dataSource={filteredProtections} 
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
            <span>🛡️ Protection Activity Details</span>
            {selectedProtection && (
              <Tag color={statusColors[selectedProtection.protection_status] || 'default'}>
                {selectedProtection.protection_status?.toUpperCase()}
              </Tag>
            )}
          </Space>
        }
        open={viewModalVisible}
        onCancel={() => {
          setViewModalVisible(false);
          setSelectedProtection(null);
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
              const recordToEdit = selectedProtection;
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
        {selectedProtection && (
          <div style={{ paddingTop: 10 }}>
            <Descriptions 
              title="📋 General Protection Details" 
              bordered 
              column={2} 
              size="middle"
              labelStyle={{ width: '22%', fontWeight: 600, background: '#fafafa' }}
              contentStyle={{ width: '28%' }}
            >
              <Descriptions.Item label="Forest">
                <Text strong>{selectedProtection.forest?.name || '-'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Activity Type">
                <Tag color={activityTypeColors[selectedProtection.activity_type] || 'default'}>
                  {selectedProtection.activity_type?.replace('_', ' ') || 'N/A'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Activity Date">
                {selectedProtection.activity_date ? dayjs(selectedProtection.activity_date).format('MMM DD, YYYY') : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Protection Status">
                <Tag color={statusColors[selectedProtection.protection_status] || 'default'}>
                  {selectedProtection.protection_status?.toUpperCase()}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <Divider style={{ margin: '16px 0' }} />

            <Descriptions 
              title="🚨 Incident & Enforcement Logs" 
              bordered 
              column={1} 
              size="middle"
              labelStyle={{ width: '22%', fontWeight: 600, background: '#fafafa' }}
              contentStyle={{ width: '78%' }}
            >
              <Descriptions.Item label="Incidents Detected">
                {selectedProtection.incidents_detected || 'No incidents reported.'}
              </Descriptions.Item>
              <Descriptions.Item label="Action Taken">
                {selectedProtection.action_taken || 'No action recorded.'}
              </Descriptions.Item>
            </Descriptions>

            {selectedProtection.remarks && (
              <>
                <Divider style={{ margin: '16px 0' }} />
                <Text strong style={{ display: 'block', marginBottom: 8 }}>📝 Remarks / Notes</Text>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <Text type="secondary">{selectedProtection.remarks}</Text>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* ===== REGISTRATION MODAL ===== */}
      <Modal
        title={editingId ? 'Edit Protection Activity' : 'Record New Protection Activity'}
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
              <Option value="patrol">Patrol</Option>
              <Option value="fire_prevention">Fire Prevention</Option>
              <Option value="community_awareness">Community Awareness</Option>
              <Option value="enforcement">Enforcement</Option>
            </Select>
          </Form.Item>

          <Form.Item name="activity_date" label="Activity Date" rules={[{ required: true, message: 'Activity date is required' }]}>
            <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
          </Form.Item>

          <Form.Item name="incidents_detected" label="Incidents Detected">
            <TextArea rows={3} placeholder="Describe any illegal logging, fires, or encroachment detected" />
          </Form.Item>

          <Form.Item name="action_taken" label="Action Taken">
            <TextArea rows={3} placeholder="Describe legal actions, community interventions, or enforcement taken" />
          </Form.Item>

          <Form.Item name="protection_status" label="Status">
            <Select placeholder="Select status">
              <Option value="active">Active</Option>
              <Option value="pending">Pending</Option>
              <Option value="completed">Completed</Option>
              <Option value="inactive">Inactive</Option>
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

export default ForestryProtections;