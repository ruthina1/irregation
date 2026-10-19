import React, { useState, useEffect, useMemo } from 'react';
import { 
  Table, Button, Modal, Form, Input, Select, DatePicker, Space, Tag, 
  Card, Row, Col, message, Popconfirm, Typography, Breadcrumb, Statistic, Empty,
  InputNumber, Descriptions, Divider
} from 'antd';
import { 
  PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined, CheckOutlined, HomeOutlined,
  SearchOutlined, DownloadOutlined, DashboardOutlined, AreaChartOutlined, 
  SafetyCertificateOutlined, ClusterOutlined, EnvironmentOutlined, 
  FieldTimeOutlined, FundOutlined
} from '@ant-design/icons';
import agronomyApi from '../../services/api/agronomyApi';
import dayjs from 'dayjs';
import LocationScopeSelector from '../../components/common/LocationScopeSelector';
import ReusableLocationPicker from '../../components/common/ReusableLocationPicker';
import { handleApiError } from '../../utils/errorHandler';
import BrandedLoader from '../../components/common/BrandedLoader';

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

const NurseryManagement = () => {
  const [nurseries, setNurseries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Registration / Edit Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  // View Detail Modal State
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedNursery, setSelectedNursery] = useState(null);

  // Filters State
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [operationalFilter, setOperationalFilter] = useState('All');
  const [registrationFilter, setRegistrationFilter] = useState('All');

  // Location maps for display
  const [zonesMap, setZonesMap] = useState({});
  const [woredasMap, setWoredasMap] = useState({});
  const [kebelesMap, setKebelesMap] = useState({});

  const [selectedZoneName, setSelectedZoneName] = useState('');
  const [selectedWoredaName, setSelectedWoredaName] = useState('');
  const [selectedKebeleName, setSelectedKebeleName] = useState('');

  // Status color configurations
  const statusColors = {
    draft: 'default',
    submitted: 'processing',
    under_review: 'warning',
    approved: 'success',
    rejected: 'error',
    published: 'green',
    archived: 'default',
  };

  const operationalStatusColors = {
    active: 'green',
    inactive: 'default',
    under_maintenance: 'warning',
    closed: 'red',
  };

  // Fetch locations for display
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

  const fetchNurseries = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchText) params.search = searchText;
      if (typeFilter !== 'All') params.nursery_type = typeFilter;
      if (operationalFilter !== 'All') params.operational_status = operationalFilter;
      if (registrationFilter !== 'All') params.registration_status = registrationFilter;

      const res = await agronomyApi.getNurseries(params);
      setNurseries(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      handleApiError(error, 'Failed to fetch nurseries');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await agronomyApi.getNurseryStats();
      return res.data || {};
    } catch (error) {
      console.error('Failed to load stats:', error);
      return {};
    }
  };

  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchLocations();
    fetchNurseries();
    fetchStats().then(setStats);
  }, []);

  // Refetch when filters change
  useEffect(() => {
    fetchNurseries();
  }, [searchText, typeFilter, operationalFilter, registrationFilter]);

  // Filtered Nurseries Memo
  const filteredNurseries = useMemo(() => {
    return nurseries;
  }, [nurseries]);

  // Analytics KPI Computations
  const totalSeedlingsProduced = useMemo(() => {
    return nurseries.reduce((sum, item) => sum + Number(item.seedling_production_quantity || 0), 0);
  }, [nurseries]);

  const activeCount = useMemo(() => {
    return nurseries.filter(i => i.operational_status === 'active').length;
  }, [nurseries]);

  const avgSurvivalRate = useMemo(() => {
    const valid = nurseries.filter(i => i.survival_rate_percent !== null && i.survival_rate_percent !== undefined);
    if (!valid.length) return 0;
    const sum = valid.reduce((acc, i) => acc + Number(i.survival_rate_percent), 0);
    return sum / valid.length;
  }, [nurseries]);

  // Handle View Action
  const handleView = (record) => {
    setSelectedNursery(record);
    setViewModalVisible(true);
  };

  // Export to CSV
  const exportToCSV = () => {
    if (filteredNurseries.length === 0) {
      message.warning('No data available to export.');
      return;
    }

    const headers = 'Nursery Name,Type,Region,Zone,Woreda,Kebele,Area (Ha),Species,Variety,Seedlings Produced,Seedlings Distributed,Survival Rate (%),Operational Status,Registration Status\n';

    const rows = filteredNurseries
      .map((item) => {
        const zoneName = zonesMap[item.zone] || item.zone || '';
        const woredaName = woredasMap[item.woreda] || item.woreda || '';
        const kebeleName = kebelesMap[item.kebele] || item.kebele || '';
        return `"${item.name || ''}","${item.nursery_type || ''}","${item.region || ''}","${zoneName}","${woredaName}","${kebeleName}",${item.total_area_hectares || 0},"${item.species_name || ''}","${item.variety || ''}",${item.seedling_production_quantity || 0},${item.seedlings_distributed || 0},${item.survival_rate_percent || 0},"${item.operational_status || ''}","${item.registration_status || ''}"`;
      })
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Nursery_Records_${new Date().toISOString().slice(0, 10)}.csv`;
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
        nursery_type: values.nursery_type,
        region: values.region || form.getFieldValue('region') || 'Amhara',
        zone: zone,
        woreda: woreda,
        kebele: kebele,
        total_area_hectares: values.total_area_hectares,
        establishment_date: values.establishment_date?.format('YYYY-MM-DD'),
        responsible_organization: values.responsible_organization,
        manager_name: values.manager_name,
        contact_phone: values.contact_phone,
        contact_email: values.contact_email,
        species_name: values.species_name,
        variety: values.variety,
        seedling_production_quantity: values.seedling_production_quantity,
        production_date: values.production_date?.format('YYYY-MM-DD'),
        survival_rate_percent: values.survival_rate_percent,
        seedlings_distributed: values.seedlings_distributed,
        distribution_date: values.distribution_date?.format('YYYY-MM-DD'),
        operational_status: values.operational_status || 'active',
        registration_status: values.registration_status || 'draft',
        remarks: values.remarks,
      };

      if (values.location && values.location.lat) {
        payload.gps_latitude = values.location.lat;
        payload.gps_longitude = values.location.lng;
      }

      const requiredFields = ['name', 'nursery_type', 'zone', 'woreda', 'kebele'];
      const missingFields = requiredFields.filter(field => !payload[field]);
      if (missingFields.length > 0) {
        message.error(`Missing required fields: ${missingFields.join(', ')}`);
        setIsSubmitting(false);
        return;
      }

      if (editingId) {
        await agronomyApi.updateNursery(editingId, payload);
        message.success('Nursery updated successfully');
      } else {
        await agronomyApi.createNursery(payload);
        message.success('Nursery registered successfully');
      }
      setModalVisible(false);
      form.resetFields();
      setEditingId(null);
      setEditingRecord(null);
      setSelectedZoneName('');
      setSelectedWoredaName('');
      setSelectedKebeleName('');
      fetchNurseries();
      fetchStats().then(setStats);
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
      await agronomyApi.deleteNursery(id);
      message.success('Nursery deleted successfully');
      fetchNurseries();
      fetchStats().then(setStats);
    } catch (error) {
      handleApiError(error, 'Failed to delete nursery');
    }
  };

  const handleApprove = async (id) => {
    try {
      await agronomyApi.approveNursery(id);
      message.success('Nursery approved successfully');
      fetchNurseries();
      fetchStats().then(setStats);
    } catch (error) {
      handleApiError(error, 'Failed to approve nursery');
    }
  };

  const handleSubmitForApproval = async (id) => {
    try {
      await agronomyApi.submitNursery(id);
      message.success('Nursery submitted for approval');
      fetchNurseries();
    } catch (error) {
      handleApiError(error, 'Failed to submit nursery');
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
      production_date: record.production_date ? dayjs(record.production_date) : null,
      distribution_date: record.distribution_date ? dayjs(record.distribution_date) : null,
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
      operational_status: 'active',
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
    { title: 'Nursery Name', dataIndex: 'name', key: 'name', width: 180 },
    { 
      title: 'Type', 
      dataIndex: 'nursery_type', 
      key: 'nursery_type',
      render: (val) => <Tag color={val === 'forestry' ? 'green' : val === 'agricultural' ? 'blue' : 'orange'}>{val}</Tag>
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
      render: (val) => <Tag color="blue">{val?.toLocaleString() || 0} Ha</Tag>
    },
    { 
      title: 'Species', 
      dataIndex: 'species_name', 
      key: 'species_name',
      render: (val) => val || '-'
    },
    { 
      title: 'Produced', 
      dataIndex: 'seedling_production_quantity', 
      key: 'seedling_production_quantity',
      render: (val) => <Tag color="cyan">{val || 0}</Tag>
    },
    { 
      title: 'Survival Rate', 
      dataIndex: 'survival_rate_percent', 
      key: 'survival_rate_percent',
      sorter: (a, b) => (a.survival_rate_percent || 0) - (b.survival_rate_percent || 0),
      render: (val) => {
        const rate = val || 0;
        let color = 'green';
        if (rate < 50) color = 'red';
        else if (rate < 80) color = 'orange';
        return <Tag color={color}>{rate}%</Tag>;
      }
    },
    { 
      title: 'Operational', 
      dataIndex: 'operational_status', 
      key: 'operational_status',
      render: (val) => <Tag color={operationalStatusColors[val] || 'default'}>{val?.replace('_', ' ')}</Tag>
    },
    { 
      title: 'Registration', 
      dataIndex: 'registration_status', 
      key: 'registration_status',
      render: (val) => <Tag color={statusColors[val] || 'default'}>{val}</Tag>
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button size="small" icon={<EyeOutlined />} onClick={() => handleView(record)} />
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          
          {record.registration_status === 'draft' && (
            <Popconfirm
              title="Submit this nursery for approval?"
              onConfirm={() => handleSubmitForApproval(record.id)}
            >
              <Button size="small" icon={<CheckOutlined />} style={{ color: '#fa8c16' }} />
            </Popconfirm>
          )}
          
          {record.registration_status === 'submitted' && (
            <Popconfirm
              title="Approve this nursery?"
              onConfirm={() => handleApprove(record.id)}
            >
              <Button size="small" icon={<CheckOutlined />} type="primary" ghost />
            </Popconfirm>
          )}
          
          {(record.registration_status === 'draft' || record.registration_status === 'submitted') && (
            <Popconfirm
              title="Delete this nursery?"
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
      {(loading || isSubmitting) && <BrandedLoader message={isSubmitting ? "Processing..." : "Loading Nurseries..."} />}

      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item><HomeOutlined /></Breadcrumb.Item>
        <Breadcrumb.Item>Agronomy</Breadcrumb.Item>
        <Breadcrumb.Item>Nursery Management</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ marginBottom: 20 }}>
        <Title level={3} style={{ marginBottom: 4, color: '#1a5f2c' }}>
          🌱 Nursery Management
        </Title>
        <Text type="secondary">
          Track nursery locations, seedling production, distribution, and survival rates
        </Text>
      </div>

      {/* ===== ANALYTICAL KPI CARDS ===== */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={CARD_STYLE_GREEN}>
            <Statistic 
              title="Total Nurseries" 
              value={nurseries.length} 
              prefix={<DashboardOutlined style={{ color: '#52c41a' }} />} 
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={CARD_STYLE_BLUE}>
            <Statistic 
              title="Active Nurseries" 
              value={activeCount} 
              prefix={<EnvironmentOutlined style={{ color: '#1890ff' }} />} 
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={CARD_STYLE_ORANGE}>
            <Statistic 
              title="Seedlings Produced" 
              value={totalSeedlingsProduced} 
              prefix={<FundOutlined style={{ color: '#fa8c16' }} />} 
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={CARD_STYLE_PURPLE}>
            <Statistic 
              title="Avg. Survival Rate" 
              value={avgSurvivalRate} 
              precision={1} 
              suffix="%" 
              prefix={<SafetyCertificateOutlined style={{ color: '#722ed1' }} />} 
            />
          </Card>
        </Col>
      </Row>

      {/* ===== SEARCH & FILTER TOOLBAR ===== */}
      <Card bordered={false} style={{ marginBottom: 16, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <Row gutter={[16, 16]} align="middle" justify="space-between">
          <Col xs={24} md={6}>
            <Input
              placeholder="Search nursery name, species..."
              prefix={<SearchOutlined />}
              allowClear
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>

          <Col xs={24} sm={8} md={4}>
            <Select style={{ width: '100%' }} defaultValue="All" onChange={(val) => setTypeFilter(val)}>
              <Option value="All">All Types</Option>
              <Option value="agricultural">Agricultural</Option>
              <Option value="forestry">Forestry</Option>
              <Option value="horticulture">Horticulture</Option>
            </Select>
          </Col>

          <Col xs={24} sm={8} md={4}>
            <Select style={{ width: '100%' }} defaultValue="All" onChange={(val) => setOperationalFilter(val)}>
              <Option value="All">All Operational Status</Option>
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
              <Option value="under_maintenance">Under Maintenance</Option>
              <Option value="closed">Closed</Option>
            </Select>
          </Col>

          <Col xs={24} sm={8} md={5}>
            <Select style={{ width: '100%' }} defaultValue="All" onChange={(val) => setRegistrationFilter(val)}>
              <Option value="All">All Registrations</Option>
              <Option value="draft">Draft</Option>
              <Option value="submitted">Submitted</Option>
              <Option value="under_review">Under Review</Option>
              <Option value="approved">Approved</Option>
              <Option value="rejected">Rejected</Option>
              <Option value="published">Published</Option>
              <Option value="archived">Archived</Option>
            </Select>
          </Col>

          <Col xs={24} md={5}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <Button icon={<DownloadOutlined />} onClick={exportToCSV}>
                Export
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} style={{ backgroundColor: '#1b7837', borderColor: '#1b7837' }}>
                Register Nursery
              </Button>
            </div>
          </Col>
        </Row>
      </Card>

      {/* ===== DATA TABLE ===== */}
      <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        {nurseries.length === 0 && !loading ? (
          <Empty description="No nurseries registered yet." />
        ) : (
          <Table
            columns={columns}
            dataSource={filteredNurseries}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10, showSizeChanger: true }}
            scroll={{ x: 1400 }}
          />
        )}
      </Card>

      {/* ===== VIEW DETAIL MODAL ===== */}
      <Modal
        title={
          <Space align="center">
            <span>🌱 Nursery Details: {selectedNursery?.name}</span>
            {selectedNursery && (
              <>
                <Tag color={operationalStatusColors[selectedNursery.operational_status] || 'default'}>
                  {selectedNursery.operational_status?.replace('_', ' ')}
                </Tag>
                <Tag color={statusColors[selectedNursery.registration_status] || 'default'}>
                  {selectedNursery.registration_status}
                </Tag>
              </>
            )}
          </Space>
        }
        open={viewModalVisible}
        onCancel={() => {
          setViewModalVisible(false);
          setSelectedNursery(null);
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
              const recordToEdit = selectedNursery;
              setViewModalVisible(false);
              handleEdit(recordToEdit);
            }}
          >
            Edit Nursery
          </Button>
        ]}
        width={950}
        destroyOnClose
      >
        {selectedNursery && (
          <div style={{ paddingTop: 10 }}>
            <Descriptions 
              title="📋 General & Administrative Information" 
              bordered 
              column={2} 
              size="middle"
              labelStyle={{ width: '22%', fontWeight: 600, background: '#fafafa' }}
              contentStyle={{ width: '28%' }}
            >
              <Descriptions.Item label="Nursery Name">
                <Text strong>{selectedNursery.name}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Nursery Type">
                <Tag color={selectedNursery.nursery_type === 'forestry' ? 'green' : selectedNursery.nursery_type === 'agricultural' ? 'blue' : 'orange'}>
                  {selectedNursery.nursery_type}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Total Area">
                {selectedNursery.total_area_hectares ? `${selectedNursery.total_area_hectares} Ha` : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Establishment Date">
                {selectedNursery.establishment_date ? dayjs(selectedNursery.establishment_date).format('MMM DD, YYYY') : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Manager Name">{selectedNursery.manager_name || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Responsible Org">{selectedNursery.responsible_organization || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Contact Phone">{selectedNursery.contact_phone || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Contact Email">{selectedNursery.contact_email || 'N/A'}</Descriptions.Item>
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
              <Descriptions.Item label="Region">{selectedNursery.region || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Zone">{zonesMap[selectedNursery.zone] || selectedNursery.zone || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Woreda">{woredasMap[selectedNursery.woreda] || selectedNursery.woreda || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Kebele">{kebelesMap[selectedNursery.kebele] || selectedNursery.kebele || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="GPS Latitude">{selectedNursery.gps_latitude || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="GPS Longitude">{selectedNursery.gps_longitude || 'N/A'}</Descriptions.Item>
            </Descriptions>

            <Divider style={{ margin: '16px 0' }} />

            <Descriptions 
              title="🌿 Seedling Production & Distribution" 
              bordered 
              column={2} 
              size="middle"
              labelStyle={{ width: '22%', fontWeight: 600, background: '#fafafa' }}
              contentStyle={{ width: '28%' }}
            >
              <Descriptions.Item label="Species Name">{selectedNursery.species_name || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Variety">{selectedNursery.variety || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Seedlings Produced">
                <Tag color="cyan">{selectedNursery.seedling_production_quantity?.toLocaleString() || '0'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Production Date">
                {selectedNursery.production_date ? dayjs(selectedNursery.production_date).format('MMM DD, YYYY') : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Seedlings Distributed">
                <Tag color="blue">{selectedNursery.seedlings_distributed?.toLocaleString() || '0'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Distribution Date">
                {selectedNursery.distribution_date ? dayjs(selectedNursery.distribution_date).format('MMM DD, YYYY') : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Survival Rate" span={2}>
                <Tag color={(selectedNursery.survival_rate_percent || 0) < 50 ? 'red' : (selectedNursery.survival_rate_percent || 0) < 80 ? 'orange' : 'green'}>
                  {selectedNursery.survival_rate_percent ?? 0}%
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            {selectedNursery.remarks && (
              <>
                <Divider style={{ margin: '16px 0' }} />
                <Text strong style={{ display: 'block', marginBottom: 8 }}>📝 Remarks / Notes</Text>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <Text type="secondary">{selectedNursery.remarks}</Text>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* ===== REGISTRATION / EDIT MODAL ===== */}
      <Modal
        title={editingId ? 'Edit Nursery' : 'Register New Nursery'}
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
            <Col span={12}>
              <Form.Item name="name" label="Nursery Name" rules={[{ required: true, message: 'Nursery name is required' }]}>
                <Input placeholder="Enter nursery name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="nursery_type" label="Nursery Type" rules={[{ required: true, message: 'Nursery type is required' }]}>
                <Select placeholder="Select type">
                  <Option value="agricultural">Agricultural</Option>
                  <Option value="forestry">Forestry</Option>
                  <Option value="horticulture">Horticulture</Option>
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
                <InputNumber min={0} step={0.01} style={{ width: '100%' }} placeholder="Area in hectares" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="establishment_date" label="Establishment Date" rules={[{ required: true, message: 'Date is required' }]}>
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="manager_name" label="Manager Name">
                <Input placeholder="Enter manager name" />
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
              <Form.Item name="contact_phone" label="Contact Phone">
                <Input placeholder="Enter phone number" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="contact_email" label="Contact Email" rules={[{ type: 'email', message: 'Invalid email' }]}>
                <Input placeholder="Enter email address" />
              </Form.Item>
            </Col>
          </Row>

          {/* ===== SEEDLING PRODUCTION SECTION ===== */}
          <div style={{ background: '#f0f7f0', padding: '16px', borderRadius: 8, marginBottom: 16 }}>
            <Text strong style={{ display: 'block', marginBottom: 12 }}>🌱 Seedling Production & Distribution</Text>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="species_name" label="Species Name">
                  <Input placeholder="Enter species" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="variety" label="Variety">
                  <Input placeholder="Enter variety" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="seedling_production_quantity" label="Seedlings Produced">
                  <InputNumber min={0} step={1} style={{ width: '100%' }} placeholder="Quantity" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="production_date" label="Production Date">
                  <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="seedlings_distributed" label="Seedlings Distributed">
                  <InputNumber min={0} step={1} style={{ width: '100%' }} placeholder="Quantity" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="distribution_date" label="Distribution Date">
                  <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item 
                  name="survival_rate_percent" 
                  label="Survival Rate (%)"
                  rules={[{ min: 0, max: 100, type: 'number', message: 'Rate must be between 0-100' }]}
                >
                  <InputNumber min={0} max={100} step={0.5} style={{ width: '100%' }} placeholder="0-100" />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* ===== GPS LOCATION ===== */}
          <Form.Item 
            name="location" 
            label="GPS Coordinates"
            extra="Click on the map or use GPS to set exact location"
          >
            <ReusableLocationPicker autoLocate={!editingId} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="operational_status" label="Operational Status">
                <Select>
                  <Option value="active">Active</Option>
                  <Option value="inactive">Inactive</Option>
                  <Option value="under_maintenance">Under Maintenance</Option>
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
                  <Option value="published">Published</Option>
                  <Option value="archived">Archived</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="remarks" label="Remarks">
                <Input.TextArea rows={3} placeholder="Additional notes..." />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={isSubmitting} style={{ backgroundColor: '#1b7837', borderColor: '#1b7837' }}>
                {editingId ? 'Update Nursery' : 'Register Nursery'}
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

export default NurseryManagement;