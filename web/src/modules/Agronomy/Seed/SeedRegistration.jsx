import React, { useState, useEffect, useMemo } from 'react';
import { 
  Table, Card, Row, Col, Statistic, Button, Tag, Space, 
  Typography, Empty, Tooltip, message
} from 'antd';
import { 
  DashboardOutlined, FundOutlined, SafetyCertificateOutlined,
  CheckCircleOutlined, ClockCircleOutlined, PlusOutlined, 
  EyeOutlined, ReloadOutlined, DatabaseOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

import agronomyApi from '../../../services/api/agronomyApi';
import { extensionApi } from '../../../services/api/extensionApi'; // Added extensionApi import
import BrandedLoader from '../../../components/common/BrandedLoader';
import { EditButton, DeleteButton } from '../../../components/common/ActionButtons';
import { handleApiError } from '../../../utils/errorHandler';

import SeedFilters from './SeedFilters';
import SeedForm from './SeedForm';
import SeedDetail from './SeedDetail';

const { Title, Text } = Typography;

const CARD_STYLE_GREEN = { borderRight: '1px solid #f0f0f0', borderBottom: '3px solid #52c41a', borderRadius: 0, height: '100%', boxShadow: 'none' };
const CARD_STYLE_BLUE = { borderRight: '1px solid #f0f0f0', borderBottom: '3px solid #1890ff', borderRadius: 0, height: '100%', boxShadow: 'none' };
const CARD_STYLE_ORANGE = { borderRight: '1px solid #f0f0f0', borderBottom: '3px solid #fa8c16', borderRadius: 0, height: '100%', boxShadow: 'none' };
const CARD_STYLE_PURPLE = { borderRight: '1px solid #f0f0f0', borderBottom: '3px solid #722ed1', borderRadius: 0, height: '100%', boxShadow: 'none' };

const SeedRegistration = () => {
  const [registrations, setRegistrations] = useState([]);
  const [distributions, setDistributions] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [formVisible, setFormVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);

  const [searchText, setSearchText] = useState('');
  const [certificationFilter, setCertificationFilter] = useState('All');
  const [registrationFilter, setRegistrationFilter] = useState('All');
  const [cropTypeFilter, setCropTypeFilter] = useState('All');

  const [zonesMap, setZonesMap] = useState({});
  const [woredasMap, setWoredasMap] = useState({});
  const [kebelesMap, setKebelesMap] = useState({});
  const [stats, setStats] = useState({});

  const statusColors = {
    draft: 'default',
    submitted: 'processing',
    under_review: 'warning',
    approved: 'success',
    rejected: 'error',
    published: 'green',
    archived: 'default'
  };

  const certificationColors = {
    pending: 'warning',
    in_progress: 'processing',
    certified: 'success',
    rejected: 'error'
  };

  const fetchFarmers = async () => {
    try {
      // Replaced agronomyApi with extensionApi for fetching farmers
      const res = await extensionApi.getMechanizationFarmers();
      const list = Array.isArray(res.data) 
        ? res.data 
        : (res.data?.data && Array.isArray(res.data.data) ? res.data.data : []);
      setFarmers(list);
    } catch (error) {
      console.error('Failed to fetch farmers:', error);
      setFarmers([]);
    }
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
      console.error('Location fetch error:', e);
    }
  };

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchText) params.search = searchText;
      if (certificationFilter !== 'All') params.certification_status = certificationFilter;
      if (registrationFilter !== 'All') params.registration_status = registrationFilter;
      if (cropTypeFilter !== 'All') params.crop_type = cropTypeFilter;

      const res = await agronomyApi.getSeedRegistrations(params);
      setRegistrations(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      handleApiError(error, 'Failed to fetch seed registrations');
    } finally {
      setLoading(false);
    }
  };

  const fetchDistributions = async () => {
    try {
      const res = await agronomyApi.getSeedDistributions();
      setDistributions(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Failed to fetch distributions:', error);
      setDistributions([]);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await agronomyApi.getSeedStats();
      setStats(res.data || {});
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    fetchRegistrations();
  }, [searchText, certificationFilter, registrationFilter, cropTypeFilter]);

  const fetchAllData = async () => {
    await Promise.all([
      fetchLocations(),
      fetchFarmers(),
      fetchRegistrations(),
      fetchDistributions(),
      fetchStats()
    ]);
  };

  const refreshData = () => { fetchAllData(); };

  const totalQuantity = useMemo(() => {
    return registrations.reduce((sum, r) => sum + Number(r.production_quantity_tons || 0), 0);
  }, [registrations]);

  const totalCertified = useMemo(() => {
    return registrations.filter(r => r.certification_status === 'certified').length;
  }, [registrations]);

  const totalDistributed = useMemo(() => {
    return distributions.reduce((sum, d) => sum + Number(d.quantity_tons || 0), 0);
  }, [distributions]);

  const handleDelete = async (id) => {
    try {
      await agronomyApi.deleteSeedRegistration(id);
      message.success('Seed registration deleted successfully');
      refreshData();
    } catch (error) {
      handleApiError(error, 'Failed to delete seed registration');
    }
  };

  const handleApprove = async (id) => {
    try {
      await agronomyApi.approveSeedRegistration(id);
      message.success('Seed registration approved successfully');
      refreshData();
      setDetailVisible(false);
    } catch (error) {
      handleApiError(error, 'Failed to approve seed registration');
    }
  };

  const handleCertify = async (id) => {
    try {
      await agronomyApi.certifySeedRegistration(id);
      message.success('Seed certified successfully');
      refreshData();
      setDetailVisible(false);
    } catch (error) {
      handleApiError(error, 'Failed to certify seed');
    }
  };

  const handleSubmitForApproval = async (id) => {
    try {
      await agronomyApi.submitSeedRegistration(id);
      message.success('Seed registration submitted for approval');
      fetchRegistrations();
    } catch (error) {
      handleApiError(error, 'Failed to submit seed registration');
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormVisible(true);
  };

  const handleViewDetail = async (record) => {
    try {
      setLoading(true);
      const res = await agronomyApi.getSeedRegistration(record.id);
      setSelectedRecord(res.data);
      setDetailVisible(true);
    } catch (error) {
      handleApiError(error, 'Failed to fetch seed details');
      setSelectedRecord({ ...record, distributions: [] });
      setDetailVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingRecord(null);
    setFormVisible(true);
  };

  const handleFormSuccess = () => {
    setFormVisible(false);
    setEditingRecord(null);
    refreshData();
  };

  const handleFormCancel = () => {
    setFormVisible(false);
    setEditingRecord(null);
  };

  const handleDetailCancel = () => {
    setDetailVisible(false);
    setSelectedRecord(null);
  };

  const exportToCSV = () => {
    if (registrations.length === 0) {
      message.warning('No data available to export.');
      return;
    }

    const headers = 'Variety,Crop,Farmer,Region,Zone,Woreda,Kebele,Quantity (Tons),Area (Ha),Planting Date,Status,Certification\n';

    const rows = registrations
      .map((item) => {
        const zoneName = zonesMap[item.zone] || item.zone || '';
        const woredaName = woredasMap[item.woreda] || item.woreda || '';
        const kebeleName = kebelesMap[item.kebele] || item.kebele || '';
        return `"${item.variety?.name || ''}","${item.variety?.crop_type || ''}","${item.farmer_name || ''}","${item.region || ''}","${zoneName}","${woredaName}","${kebeleName}",${item.production_quantity_tons || 0},${item.area_planted_hectares || 0},"${item.planting_date || ''}","${item.registration_status || ''}","${item.certification_status || ''}"`;
      })
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Seed_Registrations_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const columns = [
    { 
      title: 'Variety', 
      key: 'variety',
      width: 180,
      fixed: 'left',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.variety?.name || '-'}</div>
          <div style={{ fontSize: 12, color: '#999' }}>{record.variety?.crop_type || '-'}</div>
        </div>
      )
    },
    { 
      title: 'Farmer', 
      dataIndex: 'farmer_name', 
      key: 'farmer_name',
      render: (val, record) => (
        <div>
          <div>{val || '-'}</div>
          {record.farmer_phone && (
            <div style={{ fontSize: 12, color: '#999' }}>{record.farmer_phone}</div>
          )}
        </div>
      )
    },
    { 
      title: 'Quantity (Tons)', 
      dataIndex: 'production_quantity_tons', 
      key: 'production_quantity_tons',
      width: 120,
      render: (val) => <Tag color="blue">{val || 0}</Tag>
    },
    { 
      title: 'Area (Ha)', 
      dataIndex: 'area_planted_hectares', 
      key: 'area_planted_hectares',
      width: 100,
      render: (val) => <Tag color="cyan">{val || 0}</Tag>
    },
    { 
      title: 'Certification', 
      dataIndex: 'certification_status', 
      key: 'certification_status',
      width: 120,
      render: (val) => <Tag color={certificationColors[val] || 'default'}>{val}</Tag>
    },
    { 
      title: 'Status', 
      dataIndex: 'registration_status', 
      key: 'registration_status',
      width: 120,
      render: (val) => <Tag color={statusColors[val] || 'default'}>{val}</Tag>
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 220,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button 
              size="small" 
              icon={<EyeOutlined />} 
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <EditButton onClick={() => handleEdit(record)} />
          </Tooltip>
          
          {record.registration_status === 'draft' && (
            <Tooltip title="Submit for Approval">
              <Button 
                size="small" 
                icon={<CheckCircleOutlined />} 
                style={{ color: '#fa8c16' }} 
                onClick={() => handleSubmitForApproval(record.id)}
              />
            </Tooltip>
          )}
          
          {record.registration_status === 'submitted' && (
            <Tooltip title="Approve">
              <Button 
                size="small" 
                icon={<CheckCircleOutlined />} 
                type="primary" 
                ghost 
                onClick={() => handleApprove(record.id)}
              />
            </Tooltip>
          )}
          
          {(record.registration_status === 'draft' || record.registration_status === 'submitted') && (
            <DeleteButton
              itemName={`Seed ${record.variety?.name || ''}`}
              onConfirm={() => handleDelete(record.id)}
            />
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#fff' }}>
      {loading && <BrandedLoader message="Loading Seed Records..." />}

      <div style={{ background: '#fff', padding: '16px', marginBottom: 16, borderBottom: '1px solid #f0f0f0' }}>
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col>
            <Title level={3} style={{ marginBottom: 0 }}>
              🌱 Seed Registration Management
            </Title>
            <Text type="secondary">
              Register and manage seed production, certification, and distribution
            </Text>
          </Col>
          <Col>
            <Button icon={<ReloadOutlined />} onClick={refreshData}>
              Refresh
            </Button>
          </Col>
        </Row>
      </div>

      <div style={{ padding: '0 16px 16px' }}>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} lg={4}>
            <Card bordered={false} style={CARD_STYLE_GREEN}>
              <Statistic 
                title="Total Registrations" 
                value={stats.total_registrations || 0} 
                prefix={<DatabaseOutlined style={{ color: '#52c41a' }} />} 
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Card bordered={false} style={CARD_STYLE_BLUE}>
              <Statistic 
                title="Total Quantity" 
                value={totalQuantity} 
                precision={2} 
                suffix="Tons"
                prefix={<FundOutlined style={{ color: '#1890ff' }} />} 
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Card bordered={false} style={CARD_STYLE_ORANGE}>
              <Statistic 
                title="Certified" 
                value={totalCertified} 
                prefix={<SafetyCertificateOutlined style={{ color: '#fa8c16' }} />} 
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Card bordered={false} style={CARD_STYLE_PURPLE}>
              <Statistic 
                title="Distributed" 
                value={totalDistributed} 
                precision={2} 
                suffix="Tons"
                prefix={<CheckCircleOutlined style={{ color: '#722ed1' }} />} 
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Card bordered={false} style={CARD_STYLE_GREEN}>
              <Statistic 
                title="Pending Approval" 
                value={stats.total_pending || 0} 
                prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />} 
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Card bordered={false} style={CARD_STYLE_BLUE}>
              <Statistic 
                title="Seed Varieties" 
                value={stats.total_varieties || 0} 
                prefix={<DatabaseOutlined style={{ color: '#1890ff' }} />} 
              />
            </Card>
          </Col>
        </Row>

        <SeedFilters
          searchText={searchText}
          setSearchText={setSearchText}
          cropTypeFilter={cropTypeFilter}
          setCropTypeFilter={setCropTypeFilter}
          certificationFilter={certificationFilter}
          setCertificationFilter={setCertificationFilter}
          registrationFilter={registrationFilter}
          setRegistrationFilter={setRegistrationFilter}
          onExport={exportToCSV}
          onAdd={handleAdd}
        />

        <Card bordered={false} style={{ borderRadius: 0, boxShadow: 'none', borderRight: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0' }}>
          {registrations.length === 0 && !loading ? (
            <Empty description="No seed registrations found." />
          ) : (
            <Table
              columns={columns}
              dataSource={registrations}
              rowKey="id"
              loading={loading}
              pagination={{ 
                pageSize: 10, 
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
              }}
              scroll={{ x: 1300 }}
            />
          )}
        </Card>
      </div>

      <SeedForm
        visible={formVisible}
        onCancel={handleFormCancel}
        onSuccess={handleFormSuccess}
        editingRecord={editingRecord}
        farmers={farmers}
      />

      <SeedDetail
        visible={detailVisible}
        onCancel={handleDetailCancel}
        record={selectedRecord}
        zonesMap={zonesMap}
        woredasMap={woredasMap}
        kebelesMap={kebelesMap}
        onApprove={handleApprove}
        onEdit={handleEdit}
        onCertify={handleCertify}
      />

      <style jsx global>{`
        .ant-table-thead > tr > th {
          background: #fafafa !important;
          font-weight: 600 !important;
        }
        .ant-card {
          border-radius: 0 !important;
          border-top: none !important;
          border-left: none !important;
        }
        .ant-card:hover {
          box-shadow: none !important;
        }
        .ant-table {
          border-radius: 0 !important;
        }
        .ant-table-container {
          border-radius: 0 !important;
        }
        .ant-modal .ant-modal-content {
          border-radius: 8px;
        }
        .ant-modal .ant-modal-header {
          border-bottom: 1px solid #f0f0f0;
          margin-bottom: 16px;
        }
      `}</style>
    </div>
  );
};

export default SeedRegistration;