import React, { useState, useEffect, useMemo } from 'react';
import { 
  Table, Card, Row, Col, Statistic, Button, Tag, Space, 
  Typography, Empty, Tooltip, message
} from 'antd';
import { 
  DashboardOutlined, AreaChartOutlined, FieldTimeOutlined,
  SafetyCertificateOutlined, FundOutlined, LineChartOutlined,
  PlusOutlined, EyeOutlined, CheckOutlined, ReloadOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

import agronomyApi from '../../../services/api/agronomyApi';
import { extensionApi } from '../../../services/api/extensionApi'; // Added extensionApi import
import BrandedLoader from '../../../components/common/BrandedLoader';
import { EditButton, DeleteButton } from '../../../components/common/ActionButtons';
import { handleApiError } from '../../../utils/errorHandler';

// Child Components
import CropFilters from './CropFilters';
import CropForm from './CropForm';
import CropDetail from './CropDetail';

const { Title, Text } = Typography;

// KPI Card styles
const CARD_STYLE_GREEN = { borderRight: '1px solid #f0f0f0', borderBottom: '3px solid #52c41a', borderRadius: 0, height: '100%', boxShadow: 'none' };
const CARD_STYLE_BLUE = { borderRight: '1px solid #f0f0f0', borderBottom: '3px solid #1890ff', borderRadius: 0, height: '100%', boxShadow: 'none' };
const CARD_STYLE_ORANGE = { borderRight: '1px solid #f0f0f0', borderBottom: '3px solid #fa8c16', borderRadius: 0, height: '100%', boxShadow: 'none' };
const CARD_STYLE_PURPLE = { borderRight: '1px solid #f0f0f0', borderBottom: '3px solid #722ed1', borderRadius: 0, height: '100%', boxShadow: 'none' };

const CropRegistration = () => {
  // ==================== STATE ====================
  const [registrations, setRegistrations] = useState([]);
  const [productions, setProductions] = useState([]);
  const [harvests, setHarvests] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Modal states
  const [formVisible, setFormVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);

  // Filters State
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [registrationFilter, setRegistrationFilter] = useState('All');
  const [cropTypeFilter, setCropTypeFilter] = useState('All');

  // Location maps
  const [zonesMap, setZonesMap] = useState({});
  const [woredasMap, setWoredasMap] = useState({});
  const [kebelesMap, setKebelesMap] = useState({});
  const [stats, setStats] = useState({});

  // Status colors
  const statusColors = {
    planned: 'default',
    planted: 'processing',
    growing: 'warning',
    harvested: 'success',
    completed: 'green',
    cancelled: 'error'
  };

  const registrationStatusColors = {
    draft: 'default',
    submitted: 'processing',
    under_review: 'warning',
    approved: 'success',
    rejected: 'error',
    published: 'green',
    archived: 'default'
  };

  // ==================== FETCH FUNCTIONS ====================
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
        agronomyApi.getZones().catch(() => ({ data: [] })),
        agronomyApi.getWoredas().catch(() => ({ data: [] })),
        agronomyApi.getKebeles().catch(() => ({ data: [] }))
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
      if (statusFilter !== 'All') params.production_status = statusFilter;
      if (registrationFilter !== 'All') params.registration_status = registrationFilter;
      if (cropTypeFilter !== 'All') params.crop_type = cropTypeFilter;

      const res = await agronomyApi.getCropRegistrations(params);
      setRegistrations(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      handleApiError(error, 'Failed to fetch crop registrations');
    } finally {
      setLoading(false);
    }
  };

  const fetchProductions = async () => {
    try {
      const res = await agronomyApi.getCropProductions();
      setProductions(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Failed to fetch productions:', error);
      setProductions([]);
    }
  };

  const fetchHarvests = async () => {
    try {
      const res = await agronomyApi.getCropHarvests();
      setHarvests(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Failed to fetch harvests:', error);
      setHarvests([]);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await agronomyApi.getCropStats();
      setStats(res.data || {});
    } catch (error) {
      // Non-blocking warning instead of error throw
      console.warn('Stats loading skipped or timed out:', error?.message);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchAllData();
  }, []);

  // Refetch when filters change
  useEffect(() => {
    fetchRegistrations();
  }, [searchText, statusFilter, registrationFilter, cropTypeFilter]);

  const fetchAllData = async () => {
    // Isolated core requests from potentially slow stats endpoint
    await Promise.all([
      fetchLocations(),
      fetchFarmers(),
      fetchRegistrations(),
      fetchProductions(),
      fetchHarvests()
    ]);
    // Fetch stats separately so it doesn't block core records
    fetchStats();
  };

  const refreshData = () => {
    fetchAllData();
  };

  // ==================== COMPUTED VALUES ====================
  const totalArea = useMemo(() => {
    return registrations.reduce((sum, r) => sum + Number(r.farm_area_hectares || 0), 0);
  }, [registrations]);

  const totalHarvested = useMemo(() => {
    return harvests.reduce((sum, h) => sum + Number(h.harvest_quantity_tons || 0), 0);
  }, [harvests]);

  const avgYield = useMemo(() => {
    const valid = harvests.filter(h => h.actual_yield_tons_per_ha);
    if (!valid.length) return 0;
    const sum = valid.reduce((acc, h) => acc + Number(h.actual_yield_tons_per_ha), 0);
    return sum / valid.length;
  }, [harvests]);

  // ==================== HANDLERS ====================
  const handleDelete = async (id) => {
    try {
      await agronomyApi.deleteCropRegistration(id);
      message.success('Crop registration deleted successfully');
      fetchRegistrations();
      fetchStats();
    } catch (error) {
      handleApiError(error, 'Failed to delete crop registration');
    }
  };

  const handleApprove = async (id) => {
    try {
      await agronomyApi.approveCropRegistration(id);
      message.success('Crop registration approved successfully');
      refreshData();
      setDetailVisible(false);
    } catch (error) {
      handleApiError(error, 'Failed to approve crop registration');
    }
  };

  const handleSubmitForApproval = async (id) => {
    try {
      await agronomyApi.submitCropRegistration(id);
      message.success('Crop registration submitted for approval');
      fetchRegistrations();
    } catch (error) {
      handleApiError(error, 'Failed to submit crop registration');
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormVisible(true);
  };

  const handleViewDetail = async (record) => {
    try {
      setLoading(true);
      const productionsRes = await agronomyApi.getCropProductions({ 
        crop_registration_id: record.id 
      }).catch(() => ({ data: [] }));
      
      const harvestsRes = await agronomyApi.getCropHarvests({ 
        crop_registration_id: record.id 
      }).catch(() => ({ data: [] }));
      
      const fullRecord = {
        ...record,
        productions: Array.isArray(productionsRes.data) ? productionsRes.data : [],
        harvests: Array.isArray(harvestsRes.data) ? harvestsRes.data : []
      };
      
      setSelectedRecord(fullRecord);
      setDetailVisible(true);
    } catch (error) {
      console.error('Failed to fetch details:', error);
      setSelectedRecord({
        ...record,
        productions: [],
        harvests: []
      });
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

  // ==================== EXPORT ====================
  const exportToCSV = () => {
    if (registrations.length === 0) {
      message.warning('No data available to export.');
      return;
    }

    const headers = 'Crop Type,Variety,Farmer,Region,Zone,Woreda,Kebele,Area (Ha),Planting Date,Production Method,Status,Registration Status\n';

    const rows = registrations
      .map((item) => {
        const zoneName = zonesMap[item.zone] || item.zone || '';
        const woredaName = woredasMap[item.woreda] || item.woreda || '';
        const kebeleName = kebelesMap[item.kebele] || item.kebele || '';
        return `"${item.crop_type || ''}","${item.crop_variety || ''}","${item.farmer_name || ''}","${item.region || ''}","${zoneName}","${woredaName}","${kebeleName}",${item.farm_area_hectares || 0},"${item.planting_date || ''}","${item.production_method || ''}","${item.production_status || ''}","${item.registration_status || ''}"`;
      })
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Crop_Registrations_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // ==================== TABLE COLUMNS ====================
  const columns = [
    { 
      title: 'Crop', 
      key: 'crop',
      width: 180,
      fixed: 'left',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.crop_type}</div>
          <div style={{ fontSize: 12, color: '#999' }}>{record.crop_variety}</div>
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
    { title: 'Region', dataIndex: 'region', key: 'region', width: 100 },
    { title: 'Zone', dataIndex: 'zone', key: 'zone', width: 120, render: (val) => zonesMap[val] || val || '-' },
    { 
      title: 'Area (Ha)', 
      dataIndex: 'farm_area_hectares', 
      key: 'farm_area_hectares',
      width: 100,
      render: (val) => <Tag color="blue">{val || 0}</Tag>
    },
    { 
      title: 'Planting Date', 
      dataIndex: 'planting_date', 
      key: 'planting_date',
      width: 120,
      render: (val) => val ? dayjs(val).format('YYYY-MM-DD') : '-'
    },
    { 
      title: 'Method', 
      dataIndex: 'production_method', 
      key: 'production_method',
      width: 100,
      render: (val) => <Tag>{val}</Tag>
    },
    { 
      title: 'Status', 
      dataIndex: 'production_status', 
      key: 'production_status',
      width: 120,
      render: (val) => <Tag color={statusColors[val] || 'default'}>{val}</Tag>
    },
    { 
      title: 'Registration', 
      dataIndex: 'registration_status', 
      key: 'registration_status',
      width: 120,
      render: (val) => <Tag color={registrationStatusColors[val] || 'default'}>{val}</Tag>
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
                icon={<CheckOutlined />} 
                style={{ color: '#fa8c16' }} 
                onClick={() => handleSubmitForApproval(record.id)}
              />
            </Tooltip>
          )}
          
          {record.registration_status === 'submitted' && (
            <Tooltip title="Approve">
              <Button 
                size="small" 
                icon={<CheckOutlined />} 
                type="primary" 
                ghost 
                onClick={() => handleApprove(record.id)}
              />
            </Tooltip>
          )}
          
          {(record.registration_status === 'draft' || record.registration_status === 'submitted') && (
            <DeleteButton
              itemName={`Crop ${record.crop_type}`}
              onConfirm={() => handleDelete(record.id)}
            />
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#fff' }}>
      {(loading || isSubmitting) && <BrandedLoader message={isSubmitting ? "Processing..." : "Loading Crops..."} />}

      <div style={{ background: '#fff', padding: '16px', marginBottom: 16, borderBottom: '1px solid #f0f0f0' }}>
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col>
            <Title level={3} style={{ marginBottom: 0 }}>
              🌾 Crop Registration
            </Title>
            <Text type="secondary">
              Register and manage crop production, monitor growth stages, and track harvest yields
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
        {/* ===== KPI CARDS ===== */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} lg={4}>
            <Card bordered={false} style={CARD_STYLE_GREEN}>
              <Statistic 
                title="Total Crops" 
                value={stats.total_registrations || registrations.length || 0} 
                prefix={<DashboardOutlined style={{ color: '#52c41a' }} />} 
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={4}>
            <Card bordered={false} style={CARD_STYLE_BLUE}>
              <Statistic 
                title="Planted/Growing" 
                value={(stats.total_planted || 0) + (stats.total_growing || 0) || registrations.filter(r => ['planted', 'growing'].includes(r.production_status)).length} 
                prefix={<FieldTimeOutlined style={{ color: '#1890ff' }} />} 
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={4}>
            <Card bordered={false} style={CARD_STYLE_ORANGE}>
              <Statistic 
                title="Harvested" 
                value={stats.total_harvested || registrations.filter(r => r.production_status === 'harvested').length} 
                prefix={<SafetyCertificateOutlined style={{ color: '#fa8c16' }} />} 
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={4}>
            <Card bordered={false} style={CARD_STYLE_PURPLE}>
              <Statistic 
                title="Total Area" 
                value={totalArea} 
                precision={2} 
                suffix="Ha" 
                prefix={<AreaChartOutlined style={{ color: '#722ed1' }} />} 
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={4}>
            <Card bordered={false} style={CARD_STYLE_GREEN}>
              <Statistic 
                title="Total Harvest" 
                value={totalHarvested} 
                precision={2} 
                suffix="Tons" 
                prefix={<FundOutlined style={{ color: '#52c41a' }} />} 
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={4}>
            <Card bordered={false} style={CARD_STYLE_BLUE}>
              <Statistic 
                title="Avg Yield" 
                value={avgYield} 
                precision={2} 
                suffix="Tons/Ha" 
                prefix={<LineChartOutlined style={{ color: '#1890ff' }} />} 
              />
            </Card>
          </Col>
        </Row>

        {/* ===== FILTERS ===== */}
        <CropFilters
          searchText={searchText}
          setSearchText={setSearchText}
          cropTypeFilter={cropTypeFilter}
          setCropTypeFilter={setCropTypeFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          registrationFilter={registrationFilter}
          setRegistrationFilter={setRegistrationFilter}
          onExport={exportToCSV}
          onAdd={handleAdd}
        />

        {/* ===== DATA TABLE ===== */}
        <Card bordered={false} style={{ borderRadius: 0, boxShadow: 'none', borderRight: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0' }}>
          {registrations.length === 0 && !loading ? (
            <Empty description="No crop registrations found." />
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
              scroll={{ x: 1500 }}
            />
          )}
        </Card>
      </div>

      {/* ===== FORM MODAL ===== */}
      <CropForm
        visible={formVisible}
        onCancel={handleFormCancel}
        onSuccess={handleFormSuccess}
        editingRecord={editingRecord}
        farmers={farmers}
      />

      {/* ===== DETAIL MODAL ===== */}
      <CropDetail
        visible={detailVisible}
        onCancel={handleDetailCancel}
        record={selectedRecord}
        zonesMap={zonesMap}
        woredasMap={woredasMap}
        kebelesMap={kebelesMap}
        onApprove={handleApprove}
        onEdit={handleEdit}
        onRefresh={refreshData}
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

export default CropRegistration;