import React, { useState, useEffect, useMemo } from 'react';
import { 
  Table, Button, Modal, Form, Input, Select, DatePicker, Space, Tag, 
  Card, Row, Col, message, Popconfirm, Typography, Breadcrumb, Statistic, Empty,
  Descriptions, Divider
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, CheckOutlined, EyeOutlined, HomeOutlined,
  SearchOutlined, DownloadOutlined, DashboardOutlined, AreaChartOutlined, 
  CheckCircleOutlined, ClusterOutlined 
} from '@ant-design/icons';
import agronomyApi from '../../../services/api/agronomyApi';
import dayjs from 'dayjs';
import LocationScopeSelector from '../../../components/common/LocationScopeSelector';
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

const extractLocationName = (val) => {
  if (!val && val !== 0) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return String(val);
  if (typeof val === 'object') {
    return val.label || val.name || val.zone_name || val.woreda_name || val.kebele_name || val.value || val.title || '';
  }
  return '';
};

const ForestryNurseries = () => {
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

  // Location maps for direct rendering
  const [zonesMap, setZonesMap] = useState({});
  const [woredasMap, setWoredasMap] = useState({});
  const [kebelesMap, setKebelesMap] = useState({});

  // Filter States
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [operationalFilter, setOperationalFilter] = useState('All');
  const [registrationFilter, setRegistrationFilter] = useState('All');

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

  const operationalStatusColors = {
    active: 'success',
    inactive: 'default',
    under_maintenance: 'warning',
    closed: 'error',
  };

  const nurseryTypeColors = {
    agricultural: 'green',
    forestry: 'processing',
    horticulture: 'orange',
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
      // Ignore fallback error
    }
  };

  const fetchNurseries = async () => {
    setLoading(true);
    try {
      const res = await agronomyApi.getNurseries();
      setNurseries(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      handleApiError(error, 'Failed to fetch nurseries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
    fetchNurseries();
  }, []);

  // Filtered Nurseries Computation
  const filteredNurseries = useMemo(() => {
    return nurseries.filter((item) => {
      const nurseryName = item.name || item.nursery_name || '';
      const matchesSearch =
        !searchText ||
        nurseryName.toLowerCase().includes(searchText.toLowerCase()) ||
        item.manager_name?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.responsible_organization?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.zone?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.woreda?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.kebele?.toLowerCase().includes(searchText.toLowerCase());

      const matchesType = typeFilter === 'All' || item.nursery_type === typeFilter;
      const matchesOperational = operationalFilter === 'All' || item.operational_status === operationalFilter;
      const matchesRegistration = registrationFilter === 'All' || item.registration_status === registrationFilter;

      return matchesSearch && matchesType && matchesOperational && matchesRegistration;
    });
  }, [nurseries, searchText, typeFilter, operationalFilter, registrationFilter]);

  // Analytics Computations
  const totalAreaSum = useMemo(() => {
    return nurseries.reduce((sum, item) => sum + Number(item.total_area_hectares || 0), 0);
  }, [nurseries]);

  const activeNurseriesCount = useMemo(() => {
    return nurseries.filter(i => i.operational_status === 'active').length;
  }, [nurseries]);

  const avgNurseryArea = useMemo(() => {
    return nurseries.length ? totalAreaSum / nurseries.length : 0;
  }, [nurseries, totalAreaSum]);

  // Handle View Action
  const handleView = (record) => {
    setSelectedNursery(record);
    setViewModalVisible(true);
  };

  // CSV Export
  const exportToCSV = () => {
    if (filteredNurseries.length === 0) {
      message.warning('No data available to export.');
      return;
    }

    const headers = 'Nursery Name,Type,Region,Zone,Woreda,Kebele,Area (Ha),Operational Status,Registration Status,Manager,Organization,Phone\n';

    const rows = filteredNurseries
      .map((item) => {
        const zoneName = zonesMap[item.zone] || item.zone || '';
        const woredaName = woredasMap[item.woreda] || item.woreda || '';
        const kebeleName = kebelesMap[item.kebele] || item.kebele || '';
        const name = item.name || item.nursery_name || '';
        return `"${name}","${item.nursery_type || ''}","${item.region || ''}","${zoneName}","${woredaName}","${kebeleName}",${item.total_area_hectares || 0},"${item.operational_status || ''}","${item.registration_status || ''}","${item.manager_name || ''}","${item.responsible_organization || ''}","${item.contact_phone || ''}"`;
      })
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Tree_Nurseries_${new Date().toISOString().slice(0, 10)}.csv`;
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

      const data = {
        ...values,
        name: values.name || values.nursery_name,
        nursery_name: values.name || values.nursery_name,
        region: values.region || form.getFieldValue('region') || 'Amhara',
        zone: zone,
        woreda: woreda,
        kebele: kebele,
        total_area_hectares: Number(values.total_area_hectares),
        establishment_date: values.establishment_date?.format('YYYY-MM-DD'),
        operational_status: values.operational_status || 'active',
        registration_status: values.registration_status || 'draft',
      };
      
      if (editingId) {
        await agronomyApi.updateNursery(editingId, data);
        message.success('Tree nursery updated successfully');
      } else {
        await agronomyApi.createNursery(data);
        message.success('Tree nursery registered successfully');
      }
      setModalVisible(false);
      form.resetFields();
      setEditingId(null);
      setEditingRecord(null);
      setSelectedZoneName('');
      setSelectedWoredaName('');
      setSelectedKebeleName('');
      fetchNurseries();
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
    } catch (error) {
      handleApiError(error, 'Failed to delete nursery');
    }
  };

  const handleApprove = async (id) => {
    try {
      await agronomyApi.approveNursery(id);
      message.success('Nursery approved successfully');
      fetchNurseries();
    } catch (error) {
      handleApiError(error, 'Failed to approve nursery');
    }
  };

  const handleEdit = (record) => {
    setEditingId(record.id);
    setEditingRecord(record);

    setSelectedZoneName(record.zone || '');
    setSelectedWoredaName(record.woreda || '');
    setSelectedKebeleName(record.kebele || '');

    form.setFieldsValue({
      ...record,
      name: record.name || record.nursery_name,
      establishment_date: record.establishment_date ? dayjs(record.establishment_date) : null,
    });
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
      operational_status: 'active',
      registration_status: 'draft',
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
    { 
      title: 'Name', 
      dataIndex: 'name', 
      key: 'name', 
      width: 180,
      render: (val, record) => val || record.nursery_name || '-'
    },
    { 
      title: 'Type', 
      dataIndex: 'nursery_type', 
      key: 'nursery_type',
      render: (val) => <Tag color={nurseryTypeColors[val] || 'default'}>{val?.replace('_', ' ')}</Tag>
    },
    { title: 'Region', dataIndex: 'region', key: 'region' },
    { title: 'Zone', dataIndex: 'zone', key: 'zone', render: (val) => zonesMap[val] || val || '-' },
    { title: 'Woreda', dataIndex: 'woreda', key: 'woreda', render: (val) => woredasMap[val] || val || '-' },
    { title: 'Kebele', dataIndex: 'kebele', key: 'kebele', render: (val) => kebelesMap[val] || val || '-' },
    { 
      title: 'Area (ha)', 
      dataIndex: 'total_area_hectares', 
      key: 'total_area_hectares',
      render: (val) => <Tag color="blue">{val} Ha</Tag>
    },
    { 
      title: 'Operational Status', 
      dataIndex: 'operational_status', 
      key: 'operational_status',
      render: (val) => <Tag color={operationalStatusColors[val] || 'default'}>{val?.replace('_', ' ')}</Tag>
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
            <Popconfirm title="Approve this nursery?" onConfirm={() => handleApprove(record.id)}>
              <Button size="small" icon={<CheckOutlined />} type="primary" ghost />
            </Popconfirm>
          )}
          <Popconfirm title="Delete this nursery?" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', background: '#f8fafc', minHeight: '100vh' }}>
      {(loading || isSubmitting) && <BrandedLoader message={isSubmitting ? "Saving..." : "Loading Nurseries..."} />}

      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item><HomeOutlined /></Breadcrumb.Item>
        <Breadcrumb.Item>Agronomy</Breadcrumb.Item>
        <Breadcrumb.Item>Tree Nurseries</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ marginBottom: 20 }}>
        <Title level={3} style={{ marginBottom: 4, color: '#1a5f2c' }}>
          🌿 Tree Nurseries Management
        </Title>
        <Text type="secondary">
          Register, track operational capacity, and monitor tree nursery facilities across regions
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
              title="Total Area" 
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
              title="Active Facilities" 
              value={activeNurseriesCount} 
              prefix={<CheckCircleOutlined style={{ color: '#fa8c16' }} />} 
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={CARD_STYLE_PURPLE}>
            <Statistic 
              title="Average Area" 
              value={avgNurseryArea} 
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
              placeholder="Search nursery, manager, location..."
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

          <Col xs={24} sm={8} md={5}>
            <Select style={{ width: '100%' }} defaultValue="All" onChange={(val) => setOperationalFilter(val)}>
              <Option value="All">All Operations</Option>
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
              <Option value="under_maintenance">Under Maintenance</Option>
              <Option value="closed">Closed</Option>
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
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={handleAdd}
                style={{ backgroundColor: '#1b7837', borderColor: '#1b7837' }}
              >
                Register Nursery
              </Button>
            </div>
          </Col>
        </Row>
      </Card>

      {/* ===== DATA TABLE ===== */}
      <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        {nurseries.length === 0 && !loading ? (
          <Empty description="No tree nurseries registered yet." />
        ) : (
          <Table 
            columns={columns} 
            dataSource={filteredNurseries} 
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
            <span>🌿 Tree Nursery Details: {selectedNursery?.name || selectedNursery?.nursery_name}</span>
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
                <Text strong>{selectedNursery.name || selectedNursery.nursery_name || 'N/A'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Nursery Type">
                <Tag color={nurseryTypeColors[selectedNursery.nursery_type] || 'default'}>
                  {selectedNursery.nursery_type?.replace('_', ' ') || 'N/A'}
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

      {/* ===== REGISTRATION MODAL ===== */}
      <Modal
        title={editingId ? 'Edit Tree Nursery' : 'Register New Tree Nursery'}
        open={modalVisible}
        onCancel={() => { 
          setModalVisible(false); 
          form.resetFields(); 
          setEditingId(null); 
          setEditingRecord(null);
        }}
        footer={null}
        width={750}
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
              <Form.Item name="total_area_hectares" label="Total Area (ha)" rules={[{ required: true, message: 'Total area is required' }]}>
                <Input type="number" placeholder="Area in hectares" step="0.01" min={0} />
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
              <Form.Item name="contact_email" label="Contact Email">
                <Input placeholder="Enter email address" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="operational_status" label="Operational Status">
            <Select placeholder="Select status">
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
              <Option value="under_maintenance">Under Maintenance</Option>
              <Option value="closed">Closed</Option>
            </Select>
          </Form.Item>

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

export default ForestryNurseries;