import React, { useState, useEffect, useMemo } from 'react';
import { 
  Table, Button, Modal, Form, Input, Select, DatePicker, Space, Tag, 
  Card, Row, Col, message, Popconfirm, Typography, Breadcrumb, Statistic, Empty,
  Descriptions, Divider 
} from 'antd';
import { 
  PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined, CheckOutlined, HomeOutlined,
  SearchOutlined, DownloadOutlined, DashboardOutlined, AreaChartOutlined, 
  SafetyCertificateOutlined, ClusterOutlined 
} from '@ant-design/icons';
import agronomyApi from '../../../services/api/agronomyApi';
import dayjs from 'dayjs';
import LocationScopeSelector from '../../../components/common/LocationScopeSelector';
import ReusableLocationPicker from '../../../components/common/ReusableLocationPicker';
import { handleApiError } from '../../../utils/errorHandler';
import BrandedLoader from '../../../components/common/BrandedLoader';

const { Title, Text } = Typography;
const { Option } = Select;

// KPI Card styles matching dashboard UI
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

const ForestryForests = () => {
  const [forests, setForests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Registration / Edit Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  // View Detail Modal State
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedForest, setSelectedForest] = useState(null);

  // Filters State
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [protectionFilter, setProtectionFilter] = useState('All');
  const [registrationFilter, setRegistrationFilter] = useState('All');

  // Location maps for display
  const [zonesMap, setZonesMap] = useState({});
  const [woredasMap, setWoredasMap] = useState({});
  const [kebelesMap, setKebelesMap] = useState({});

  const [selectedZoneName, setSelectedZoneName] = useState('');
  const [selectedWoredaName, setSelectedWoredaName] = useState('');
  const [selectedKebeleName, setSelectedKebeleName] = useState('');

  const statusColors = {
    draft: 'default',
    submitted: 'processing',
    under_review: 'warning',
    approved: 'success',
    rejected: 'error',
    published: 'green',
    archived: 'default',
  };

  const protectionStatusColors = {
    protected: 'green',
    partially_protected: 'warning',
    unprotected: 'red',
    under_restoration: 'processing',
  };

  const fetchLocations = async () => {
    try {
      const [zRes, wRes, kRes] = await Promise.all([
        agronomyApi.getZones(),
        agronomyApi.getWoredas(),
        agronomyApi.getKebeles()
      ]);

      const zMap = {};
      (zRes.data || []).forEach(z => { zMap[z.id] = z.name; });
      setZonesMap(zMap);

      const wMap = {};
      (wRes.data || []).forEach(w => { wMap[w.id] = w.name; });
      setWoredasMap(wMap);

      const kMap = {};
      (kRes.data || []).forEach(k => { kMap[k.id] = k.name; });
      setKebelesMap(kMap);
    } catch (e) {
      // Ignore fallback errors
    }
  };

  const fetchForests = async () => {
    setLoading(true);
    try {
      const res = await agronomyApi.getForests();
      setForests(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      handleApiError(error, 'Failed to fetch forests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
    fetchForests();
  }, []);

  // Filtered Forests Memo
  const filteredForests = useMemo(() => {
    return forests.filter((item) => {
      const matchesSearch =
        !searchText ||
        item.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.responsible_authority?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.zone?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.woreda?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.kebele?.toLowerCase().includes(searchText.toLowerCase());

      const matchesType = typeFilter === 'All' || item.forest_type === typeFilter;
      const matchesProtection = protectionFilter === 'All' || item.protection_status === protectionFilter;
      const matchesRegistration = registrationFilter === 'All' || item.registration_status === registrationFilter;

      return matchesSearch && matchesType && matchesProtection && matchesRegistration;
    });
  }, [forests, searchText, typeFilter, protectionFilter, registrationFilter]);

  // Analytics KPI Computations
  const totalAreaSum = useMemo(() => {
    return forests.reduce((sum, item) => sum + Number(item.total_area_hectares || 0), 0);
  }, [forests]);

  const protectedCount = useMemo(() => {
    return forests.filter(i => i.protection_status === 'protected' || i.protection_status === 'partially_protected').length;
  }, [forests]);

  const avgForestArea = useMemo(() => {
    return forests.length ? totalAreaSum / forests.length : 0;
  }, [forests, totalAreaSum]);

  // Handle View Action
  const handleView = (record) => {
    setSelectedForest(record);
    setViewModalVisible(true);
  };

  // Export to CSV Function
  const exportToCSV = () => {
    if (filteredForests.length === 0) {
      message.warning('No data available to export.');
      return;
    }

    const headers = 'Forest Name,Type,Region,Zone,Woreda,Kebele,Area (Ha),Protection Status,Registration Status,Establishment Date,Responsible Authority\n';

    const rows = filteredForests
      .map((item) => {
        const zoneName = zonesMap[item.zone] || item.zone || '';
        const woredaName = woredasMap[item.woreda] || item.woreda || '';
        const kebeleName = kebelesMap[item.kebele] || item.kebele || '';
        return `"${item.name || ''}","${item.forest_type || ''}","${item.region || ''}","${zoneName}","${woredaName}","${kebeleName}",${item.total_area_hectares || 0},"${item.protection_status || ''}","${item.registration_status || ''}","${item.establishment_date || ''}","${item.responsible_authority || ''}"`;
      })
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Forest_Records_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

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
        name: values.name,
        forest_type: values.forest_type,
        region: values.region || form.getFieldValue('region') || 'Amhara',
        zone: zone,
        woreda: woreda,
        kebele: kebele,
        total_area_hectares: values.total_area_hectares,
        establishment_date: values.establishment_date?.format('YYYY-MM-DD'),
        responsible_authority: values.responsible_authority,
        protection_status: values.protection_status || 'unprotected',
        registration_status: values.registration_status || 'draft',
      };

      if (values.location && values.location.lat) {
        payload.gps_latitude = values.location.lat;
        payload.gps_longitude = values.location.lng;
      }

      const requiredFields = ['name', 'forest_type', 'zone', 'woreda', 'kebele', 'total_area_hectares'];
      const missingFields = requiredFields.filter(field => !payload[field]);
      if (missingFields.length > 0) {
        message.error(`Missing required fields: ${missingFields.join(', ')}`);
        setIsSubmitting(false);
        return;
      }

      if (editingId) {
        await agronomyApi.updateForest(editingId, payload);
        message.success('Forest updated successfully');
      } else {
        await agronomyApi.createForest(payload);
        message.success('Forest registered successfully');
      }
      setModalVisible(false);
      form.resetFields();
      setEditingId(null);
      setEditingRecord(null);
      setSelectedZoneName('');
      setSelectedWoredaName('');
      setSelectedKebeleName('');
      fetchForests();
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
      await agronomyApi.deleteForest(id);
      message.success('Forest deleted successfully');
      fetchForests();
    } catch (error) {
      handleApiError(error, 'Failed to delete forest');
    }
  };

  const handleApprove = async (id) => {
    try {
      await agronomyApi.approveForest(id);
      message.success('Forest approved successfully');
      fetchForests();
    } catch (error) {
      handleApiError(error, 'Failed to approve forest');
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
      establishment_date: record.establishment_date ? dayjs(record.establishment_date) : null,
    };
    
    form.setFieldsValue(formValues);
    setModalVisible(true);
  };

  const handleAdd = () => {
    setEditingId(null);
    setEditingRecord(null);
    setSelectedZoneName('');
    setSelectedWoredaName('');
    setSelectedKebeleName('');
    form.resetFields();
    form.setFieldsValue({
      registration_status: 'draft',
      protection_status: 'unprotected',
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

  const columns = [
    { title: 'Forest Name', dataIndex: 'name', key: 'name', width: 200 },
    { 
      title: 'Type', 
      dataIndex: 'forest_type', 
      key: 'forest_type',
      render: (val) => <Tag color="cyan">{val?.replace('_', ' ')}</Tag>
    },
    { title: 'Region', dataIndex: 'region', key: 'region' },
    { title: 'Zone', dataIndex: 'zone', key: 'zone', render: (val) => zonesMap[val] || val || '-' },
    { title: 'Woreda', dataIndex: 'woreda', key: 'woreda', render: (val) => woredasMap[val] || val || '-' },
    { title: 'Kebele', dataIndex: 'kebele', key: 'kebele', render: (val) => kebelesMap[val] || val || '-' },
    { 
      title: 'Area (ha)', 
      dataIndex: 'total_area_hectares', 
      key: 'total_area_hectares',
      sorter: (a, b) => (a.total_area_hectares || 0) - (b.total_area_hectares || 0),
      render: (val) => <Tag color="blue">{val?.toLocaleString()} Ha</Tag>
    },
    { 
      title: 'Protection Status', 
      dataIndex: 'protection_status', 
      key: 'protection_status',
      render: (val) => <Tag color={protectionStatusColors[val] || 'default'}>{val?.replace('_', ' ')}</Tag>
    },
    { 
      title: 'Registration Status', 
      dataIndex: 'registration_status', 
      key: 'registration_status',
      render: (val) => <Tag color={statusColors[val] || 'default'}>{val}</Tag>
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Button size="small" icon={<EyeOutlined />} onClick={() => handleView(record)} />
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          {record.registration_status !== 'approved' && (
            <Popconfirm
              title="Approve this forest?"
              onConfirm={() => handleApprove(record.id)}
            >
              <Button size="small" icon={<CheckOutlined />} type="primary" ghost />
            </Popconfirm>
          )}
          <Popconfirm
            title="Delete this forest?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button size="small" icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', background: '#f8fafc', minHeight: '100vh' }}>
      {(loading || isSubmitting) && <BrandedLoader message={isSubmitting ? "Processing..." : "Loading Forests..."} />}

      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item><HomeOutlined /></Breadcrumb.Item>
        <Breadcrumb.Item>Agronomy</Breadcrumb.Item>
        <Breadcrumb.Item>Forest Management</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ marginBottom: 20 }}>
        <Title level={3} style={{ marginBottom: 4, color: '#1a5f2c' }}>
          🌳 Forest Management
        </Title>
        <Text type="secondary">
          Track forest registrations, total coverage, conservation statuses, and regional distribution
        </Text>
      </div>

      {/* ===== ANALYTICAL KPI CARDS ===== */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={CARD_STYLE_GREEN}>
            <Statistic 
              title="Total Forests Registered" 
              value={forests.length} 
              prefix={<DashboardOutlined style={{ color: '#52c41a' }} />} 
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={CARD_STYLE_BLUE}>
            <Statistic 
              title="Total Coverage Area" 
              value={totalAreaSum} 
              precision={2} 
              suffix="Ha" 
              prefix={<AreaChartOutlined style={{ color: '#1890ff' }} />} 
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={CARD_STYLE_ORANGE}>
            <Statistic 
              title="Protected / Preserved" 
              value={protectedCount} 
              prefix={<SafetyCertificateOutlined style={{ color: '#fa8c16' }} />} 
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={CARD_STYLE_PURPLE}>
            <Statistic 
              title="Average Forest Size" 
              value={avgForestArea} 
              precision={2} 
              suffix="Ha" 
              prefix={<ClusterOutlined style={{ color: '#722ed1' }} />} 
            />
          </Card>
        </Col>
      </Row>

      {/* ===== SEARCH & FILTER TOOLBAR ===== */}
      <Card bordered={false} style={{ marginBottom: 16, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <Row gutter={[16, 16]} align="middle" justify="space-between">
          <Col xs={24} md={6}>
            <Input
              placeholder="Search forest name, location, authority..."
              prefix={<SearchOutlined />}
              allowClear
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>

          <Col xs={24} sm={8} md={4}>
            <Select style={{ width: '100%' }} defaultValue="All" onChange={(val) => setTypeFilter(val)}>
              <Option value="All">All Types</Option>
              <Option value="protected">Protected</Option>
              <Option value="productive">Productive</Option>
              <Option value="preserved">Preserved</Option>
              <Option value="community">Community</Option>
            </Select>
          </Col>

          <Col xs={24} sm={8} md={5}>
            <Select style={{ width: '100%' }} defaultValue="All" onChange={(val) => setProtectionFilter(val)}>
              <Option value="All">All Protection Statuses</Option>
              <Option value="protected">Protected</Option>
              <Option value="partially_protected">Partially Protected</Option>
              <Option value="unprotected">Unprotected</Option>
              <Option value="under_restoration">Under Restoration</Option>
            </Select>
          </Col>

          <Col xs={24} sm={8} md={4}>
            <Select style={{ width: '100%' }} defaultValue="All" onChange={(val) => setRegistrationFilter(val)}>
              <Option value="All">All Registrations</Option>
              <Option value="draft">Draft</Option>
              <Option value="submitted">Submitted</Option>
              <Option value="approved">Approved</Option>
              <Option value="rejected">Rejected</Option>
            </Select>
          </Col>

          <Col xs={24} md={5}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <Button icon={<DownloadOutlined />} onClick={exportToCSV}>
                Export
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} style={{ backgroundColor: '#1b7837', borderColor: '#1b7837' }}>
                Register Forest
              </Button>
            </div>
          </Col>
        </Row>
      </Card>

      {/* ===== DATA TABLE ===== */}
      <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        {forests.length === 0 && !loading ? (
          <Empty description="No forests registered yet." />
        ) : (
          <Table
            columns={columns}
            dataSource={filteredForests}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10, showSizeChanger: true }}
            scroll={{ x: 1300 }}
          />
        )}
      </Card>

      {/* ===== VIEW DETAIL MODAL ===== */}
      <Modal
        title={
          <Space align="center">
            <span>🌳 Forest Details: {selectedForest?.name}</span>
            {selectedForest && (
              <>
                <Tag color={protectionStatusColors[selectedForest.protection_status] || 'default'}>
                  {selectedForest.protection_status?.replace('_', ' ')}
                </Tag>
                <Tag color={statusColors[selectedForest.registration_status] || 'default'}>
                  {selectedForest.registration_status}
                </Tag>
              </>
            )}
          </Space>
        }
        open={viewModalVisible}
        onCancel={() => {
          setViewModalVisible(false);
          setSelectedForest(null);
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
              const recordToEdit = selectedForest;
              setViewModalVisible(false);
              handleEdit(recordToEdit);
            }}
          >
            Edit Forest
          </Button>
        ]}
        width={950}
        destroyOnClose
      >
        {selectedForest && (
          <div style={{ paddingTop: 10 }}>
            <Descriptions 
              title="📋 General & Administrative Information" 
              bordered 
              column={2} 
              size="middle"
              labelStyle={{ width: '22%', fontWeight: 600, background: '#fafafa' }}
              contentStyle={{ width: '28%' }}
            >
              <Descriptions.Item label="Forest Name">
                <Text strong>{selectedForest.name}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Forest Type">
                <Tag color="cyan">{selectedForest.forest_type?.replace('_', ' ')}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Total Area">
                {selectedForest.total_area_hectares ? `${Number(selectedForest.total_area_hectares).toLocaleString()} Ha` : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Establishment Date">
                {selectedForest.establishment_date ? dayjs(selectedForest.establishment_date).format('MMM DD, YYYY') : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Responsible Authority" span={2}>
                {selectedForest.responsible_authority || 'N/A'}
              </Descriptions.Item>
            </Descriptions>

            <Divider style={{ margin: '16px 0' }} />

            <Descriptions 
              title="📍 Location Details" 
              bordered 
              column={2} 
              size="middle"
              labelStyle={{ width: '22%', fontWeight: 600, background: '#fafafa' }}
              contentStyle={{ width: '28%' }}
            >
              <Descriptions.Item label="Region">{selectedForest.region || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Zone">{zonesMap[selectedForest.zone] || selectedForest.zone || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Woreda">{woredasMap[selectedForest.woreda] || selectedForest.woreda || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Kebele">{kebelesMap[selectedForest.kebele] || selectedForest.kebele || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="GPS Latitude">{selectedForest.gps_latitude || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="GPS Longitude">{selectedForest.gps_longitude || 'N/A'}</Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>

      {/* ===== REGISTRATION MODAL ===== */}
      <Modal
        title={editingId ? 'Edit Forest' : 'Register New Forest'}
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
        width={800}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="Forest Name" rules={[{ required: true, message: 'Forest name is required' }]}>
                <Input placeholder="Enter forest name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="forest_type" label="Forest Type" rules={[{ required: true, message: 'Forest type is required' }]}>
                <Select placeholder="Select type">
                  <Option value="protected">Protected</Option>
                  <Option value="productive">Productive</Option>
                  <Option value="preserved">Preserved</Option>
                  <Option value="community">Community</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* ===== LOCATION SCOPE SELECTOR ===== */}
          <LocationScopeSelector 
            form={form} 
            editingData={editingRecord}
            onLocationChange={handleLocationChange}
          />

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="total_area_hectares" 
                label="Total Area (ha)" 
                rules={[{ required: true, message: 'Area is required' }]}
              >
                <Input type="number" placeholder="Area in hectares" step="0.01" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="establishment_date" label="Establishment Date">
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="protection_status" label="Protection Status">
                <Select placeholder="Select status">
                  <Option value="protected">Protected</Option>
                  <Option value="partially_protected">Partially Protected</Option>
                  <Option value="unprotected">Unprotected</Option>
                  <Option value="under_restoration">Under Restoration</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="responsible_authority" label="Responsible Authority">
                <Input placeholder="Enter responsible authority" />
              </Form.Item>
            </Col>
          </Row>

          {/* ===== REUSABLE LOCATION PICKER (GPS) ===== */}
          <Form.Item 
            name="location" 
            label="GPS Coordinates"
            extra="Click on the map or use GPS to set exact location"
          >
            <ReusableLocationPicker autoLocate={!editingId} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={isSubmitting} style={{ backgroundColor: '#1b7837', borderColor: '#1b7837' }}>
                {editingId ? 'Update Forest' : 'Register Forest'}
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
    </div>
  );
};

export default ForestryForests;