import React, { useState, useEffect, useMemo } from 'react';
import { 
  Table, Card, Row, Col, Statistic, Button, Tag, Space, 
  Typography, Empty, Tooltip, message
} from 'antd';
import { 
  ToolOutlined, CheckCircleOutlined, ClockCircleOutlined,
  PlusOutlined, EyeOutlined, ReloadOutlined, 
  DollarOutlined, TeamOutlined, WarningOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

import agronomyApi from '../../../services/api/agronomyApi';
import BrandedLoader from '../../../components/common/BrandedLoader';
import { EditButton, DeleteButton } from '../../../components/common/ActionButtons';
import { handleApiError } from '../../../utils/errorHandler';

import IrrigationMaintenanceFilters from './IrrigationMaintenanceFilters';
import IrrigationMaintenanceForm from './IrrigationMaintenanceForm';
import IrrigationMaintenanceDetail from './IrrigationMaintenanceDetail';

const { Title, Text } = Typography;

const CARD_STYLE_GREEN = { borderRight: '1px solid #f0f0f0', borderBottom: '3px solid #52c41a', borderRadius: 0, height: '100%', boxShadow: 'none' };
const CARD_STYLE_BLUE = { borderRight: '1px solid #f0f0f0', borderBottom: '3px solid #1890ff', borderRadius: 0, height: '100%', boxShadow: 'none' };
const CARD_STYLE_ORANGE = { borderRight: '1px solid #f0f0f0', borderBottom: '3px solid #fa8c16', borderRadius: 0, height: '100%', boxShadow: 'none' };
const CARD_STYLE_PURPLE = { borderRight: '1px solid #f0f0f0', borderBottom: '3px solid #722ed1', borderRadius: 0, height: '100%', boxShadow: 'none' };

const IrrigationMaintenance = () => {
  const [maintenances, setMaintenances] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [formVisible, setFormVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);

  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  const [zonesMap, setZonesMap] = useState({});
  const [woredasMap, setWoredasMap] = useState({});
  const [kebelesMap, setKebelesMap] = useState({});
  const [stats, setStats] = useState({});

  const statusColors = {
    planned: 'default',
    in_progress: 'processing',
    completed: 'success',
    verified: 'green',
    cancelled: 'error'
  };

  const priorityColors = {
    high: 'error',
    medium: 'warning',
    low: 'success'
  };

  const typeColors = {
    preventive: 'cyan',
    corrective: 'orange',
    emergency: 'red',
    routine: 'blue'
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

  const fetchMaintenances = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchText) params.search = searchText;
      if (typeFilter !== 'All') params.maintenance_type = typeFilter;
      if (statusFilter !== 'All') params.maintenance_status = statusFilter;
      if (priorityFilter !== 'All') params.priority_level = priorityFilter;

      const res = await agronomyApi.getIrrigationMaintenances(params);
      setMaintenances(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      handleApiError(error, 'Failed to fetch maintenance records');
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const res = await agronomyApi.getIrrigationMaintenanceActivities();
      setActivities(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
      setActivities([]);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await agronomyApi.getIrrigationMaintenanceStats();
      setStats(res.data || {});
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    fetchMaintenances();
  }, [searchText, typeFilter, statusFilter, priorityFilter]);

  const fetchAllData = async () => {
    await Promise.all([
      fetchLocations(),
      fetchMaintenances(),
      fetchActivities(),
      fetchStats()
    ]);
  };

  const refreshData = () => { fetchAllData(); };

  const totalMaintenances = useMemo(() => maintenances.length, [maintenances]);
  const completedCount = useMemo(() => maintenances.filter(m => m.maintenance_status === 'completed' || m.maintenance_status === 'verified').length, [maintenances]);
  const inProgressCount = useMemo(() => maintenances.filter(m => m.maintenance_status === 'in_progress').length, [maintenances]);
  const totalCost = useMemo(() => maintenances.reduce((sum, m) => sum + Number(m.cost_actual || 0), 0), [maintenances]);

  const handleDelete = async (id) => {
    try {
      await agronomyApi.deleteIrrigationMaintenance(id);
      message.success('Maintenance record deleted successfully');
      refreshData();
    } catch (error) {
      handleApiError(error, 'Failed to delete maintenance record');
    }
  };

  const handleApprove = async (id) => {
    try {
      await agronomyApi.approveIrrigationMaintenance(id);
      message.success('Maintenance approved successfully');
      refreshData();
      setDetailVisible(false);
    } catch (error) {
      handleApiError(error, 'Failed to approve maintenance');
    }
  };

  const handleVerify = async (id) => {
    try {
      await agronomyApi.verifyIrrigationMaintenance(id);
      message.success('Maintenance verified successfully');
      refreshData();
      setDetailVisible(false);
    } catch (error) {
      handleApiError(error, 'Failed to verify maintenance');
    }
  };

  const handleComplete = async (id) => {
    try {
      await agronomyApi.completeIrrigationMaintenance(id);
      message.success('Maintenance marked as completed');
      refreshData();
      setDetailVisible(false);
    } catch (error) {
      handleApiError(error, 'Failed to complete maintenance');
    }
  };

  const handleSubmitForApproval = async (id) => {
    try {
      await agronomyApi.submitIrrigationMaintenance(id);
      message.success('Maintenance submitted for approval');
      fetchMaintenances();
    } catch (error) {
      handleApiError(error, 'Failed to submit maintenance');
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormVisible(true);
  };

  const handleViewDetail = async (record) => {
    try {
      setLoading(true);
      const res = await agronomyApi.getIrrigationMaintenance(record.id);
      setSelectedRecord(res.data);
      setDetailVisible(true);
    } catch (error) {
      handleApiError(error, 'Failed to fetch maintenance details');
      setSelectedRecord({ ...record, activities: [] });
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
    if (maintenances.length === 0) {
      message.warning('No data available to export.');
      return;
    }

    const headers = 'Title,Type,Priority,Project,Status,Date,Cost (ETB),Labor (Days)\n';

    const rows = maintenances
      .map((item) => {
        return `"${item.maintenance_title || ''}","${item.maintenance_type || ''}","${item.priority_level || ''}","${item.irrigation_project?.project_name || ''}","${item.maintenance_status || ''}","${item.maintenance_date || ''}",${item.cost_actual || 0},${item.labor_person_days || 0}`;
      })
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Irrigation_Maintenance_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const columns = [
    { 
      title: 'Title', 
      dataIndex: 'maintenance_title', 
      key: 'maintenance_title',
      width: 200,
      fixed: 'left',
    },
    { 
      title: 'Type', 
      dataIndex: 'maintenance_type', 
      key: 'maintenance_type',
      width: 120,
      render: (val) => <Tag color={typeColors[val]}>{val}</Tag>
    },
    { 
      title: 'Priority', 
      dataIndex: 'priority_level', 
      key: 'priority_level',
      width: 100,
      render: (val) => <Tag color={priorityColors[val]}>{val}</Tag>
    },
    { 
      title: 'Project', 
      dataIndex: 'irrigation_project', 
      key: 'irrigation_project',
      render: (val) => val?.project_name || '-'
    },
    { 
      title: 'Date', 
      dataIndex: 'maintenance_date', 
      key: 'maintenance_date',
      width: 120,
      render: (val) => val ? dayjs(val).format('YYYY-MM-DD') : '-'
    },
    { 
      title: 'Status', 
      dataIndex: 'maintenance_status', 
      key: 'maintenance_status',
      width: 120,
      render: (val) => <Tag color={statusColors[val] || 'default'}>{val}</Tag>
    },
    { 
      title: 'Cost (ETB)', 
      dataIndex: 'cost_actual', 
      key: 'cost_actual',
      width: 120,
      render: (val) => val ? Number(val).toLocaleString() : '-'
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
          
          {record.approval_status === 'pending' && (
            <Tooltip title="Submit for Approval">
              <Button 
                size="small" 
                icon={<CheckCircleOutlined />} 
                style={{ color: '#fa8c16' }} 
                onClick={() => handleSubmitForApproval(record.id)}
              />
            </Tooltip>
          )}
          
          {record.approval_status === 'under_review' && (
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
          
          {record.maintenance_status === 'in_progress' && (
            <Tooltip title="Mark Complete">
              <Button 
                size="small" 
                icon={<CheckCircleOutlined />} 
                style={{ color: '#1890ff' }} 
                onClick={() => handleComplete(record.id)}
              />
            </Tooltip>
          )}
          
          {(record.approval_status === 'pending' || record.approval_status === 'under_review') && (
            <DeleteButton
              itemName={`Maintenance ${record.maintenance_title}`}
              onConfirm={() => handleDelete(record.id)}
            />
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#fff' }}>
      {loading && <BrandedLoader message="Loading Maintenance Records..." />}

      <div style={{ background: '#fff', padding: '16px', marginBottom: 16, borderBottom: '1px solid #f0f0f0' }}>
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col>
            <Title level={3} style={{ marginBottom: 0 }}>
              🔧 Irrigation Maintenance Management
            </Title>
            <Text type="secondary">
              Track maintenance activities, costs, and status for irrigation infrastructure
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
                title="Total Maintenance" 
                value={stats.total_maintenances || 0} 
                prefix={<ToolOutlined style={{ color: '#52c41a' }} />} 
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Card bordered={false} style={CARD_STYLE_BLUE}>
              <Statistic 
                title="In Progress" 
                value={stats.in_progress || 0} 
                prefix={<ClockCircleOutlined style={{ color: '#1890ff' }} />} 
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Card bordered={false} style={CARD_STYLE_ORANGE}>
              <Statistic 
                title="Completed" 
                value={stats.completed || 0} 
                prefix={<CheckCircleOutlined style={{ color: '#fa8c16' }} />} 
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Card bordered={false} style={CARD_STYLE_PURPLE}>
              <Statistic 
                title="Pending Approval" 
                value={stats.pending_approval || 0} 
                prefix={<WarningOutlined style={{ color: '#722ed1' }} />} 
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Card bordered={false} style={CARD_STYLE_GREEN}>
              <Statistic 
                title="Total Cost" 
                value={stats.total_cost || 0} 
                precision={2} 
                prefix={<DollarOutlined style={{ color: '#52c41a' }} />} 
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Card bordered={false} style={CARD_STYLE_BLUE}>
              <Statistic 
                title="Total Labor Days" 
                value={stats.total_labor_days || 0} 
                prefix={<TeamOutlined style={{ color: '#1890ff' }} />} 
              />
            </Card>
          </Col>
        </Row>

        <IrrigationMaintenanceFilters
          searchText={searchText}
          setSearchText={setSearchText}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
          onExport={exportToCSV}
          onAdd={handleAdd}
        />

        <Card bordered={false} style={{ borderRadius: 0, boxShadow: 'none', borderRight: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0' }}>
          {maintenances.length === 0 && !loading ? (
            <Empty description="No maintenance records found." />
          ) : (
            <Table
              columns={columns}
              dataSource={maintenances}
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

      <IrrigationMaintenanceForm
        visible={formVisible}
        onCancel={handleFormCancel}
        onSuccess={handleFormSuccess}
        editingRecord={editingRecord}
      />

      <IrrigationMaintenanceDetail
        visible={detailVisible}
        onCancel={handleDetailCancel}
        record={selectedRecord}
        zonesMap={zonesMap}
        woredasMap={woredasMap}
        kebelesMap={kebelesMap}
        onApprove={handleApprove}
        onEdit={handleEdit}
        onVerify={handleVerify}
        onComplete={handleComplete}
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
          borderRadius: 0 !important;
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

export default IrrigationMaintenance;