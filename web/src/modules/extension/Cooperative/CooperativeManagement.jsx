import React, { useState, useEffect, useMemo } from 'react';
import { message, Breadcrumb, Typography, Button, Row, Col } from 'antd';
import { HomeOutlined, ReloadOutlined } from '@ant-design/icons';
import { extensionApi } from '../../../services/api/extensionApi';
import { handleApiError } from '../../../utils/errorHandler';
import BrandedLoader from '../../../components/common/BrandedLoader';

import CooperativeStats from './CooperativeStats';
import CooperativeFilters from './CooperativeFilters';
import CooperativeTable from './CooperativeTable';
import CooperativeForm from './CooperativeForm';
import CooperativeDetail from './CooperativeDetail';

const { Title, Text } = Typography;

export default function CooperativeManagement() {
  const [cooperatives, setCooperatives] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [registrationFilter, setRegistrationFilter] = useState('All');

  const [zonesMap, setZonesMap] = useState({});
  const [woredasMap, setWoredasMap] = useState({});
  const [kebelesMap, setKebelesMap] = useState({});
  const [stats, setStats] = useState({});

  const [formVisible, setFormVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);

  const fetchLocations = async () => {
    try {
      const [zRes, wRes, kRes] = await Promise.all([
        extensionApi.getCooperativeZones(),
        extensionApi.getCooperativeWoredas(),
        extensionApi.getCooperativeKebeles()
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

  const fetchCooperatives = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchText) params.search = searchText;
      if (typeFilter !== 'All') params.cooperative_type = typeFilter;
      if (statusFilter !== 'All') params.cooperative_status = statusFilter;
      if (registrationFilter !== 'All') params.registration_status = registrationFilter;

      const res = await extensionApi.getCooperatives(params);
      setCooperatives(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      handleApiError(error, 'Failed to fetch cooperatives');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await extensionApi.getCooperativeStats();
      setStats(res.data || {});
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    fetchCooperatives();
  }, [searchText, typeFilter, statusFilter, registrationFilter]);

  const fetchAllData = async () => {
    await Promise.all([
      fetchLocations(),
      fetchCooperatives(),
      fetchStats()
    ]);
  };

  const refreshData = () => { fetchAllData(); };

  const handleDelete = async (id) => {
    try {
      await extensionApi.deleteCooperative(id);
      message.success('Cooperative deleted successfully');
      refreshData();
    } catch (error) {
      handleApiError(error, 'Failed to delete cooperative');
    }
  };

  const handleApprove = async (id) => {
    try {
      await extensionApi.approveCooperative(id);
      message.success('Cooperative approved successfully');
      refreshData();
      setDetailVisible(false);
    } catch (error) {
      handleApiError(error, 'Failed to approve cooperative');
    }
  };

  const handleSubmitForApproval = async (id) => {
    try {
      await extensionApi.submitCooperative(id);
      message.success('Cooperative submitted for approval');
      fetchCooperatives();
    } catch (error) {
      handleApiError(error, 'Failed to submit cooperative');
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormVisible(true);
  };

  const handleViewDetail = async (record) => {
    try {
      setLoading(true);
      const res = await extensionApi.getCooperative(record.id);
      setSelectedRecord(res.data);
      setDetailVisible(true);
    } catch (error) {
      handleApiError(error, 'Failed to fetch cooperative details');
      setSelectedRecord({ ...record, members: [], activities: [] });
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
    if (cooperatives.length === 0) {
      message.warning('No data available to export.');
      return;
    }

    const headers = 'Cooperative Name,Code,Type,Region,Zone,Woreda,Kebele,Members,Capital,Status,Registration\n';

    const rows = cooperatives
      .map((item) => {
        const zoneName = zonesMap[item.zone] || item.zone || '';
        const woredaName = woredasMap[item.woreda] || item.woreda || '';
        const kebeleName = kebelesMap[item.kebele] || item.kebele || '';
        return `"${item.cooperative_name || ''}","${item.cooperative_code || ''}","${item.cooperative_type || ''}","${item.region || ''}","${zoneName}","${woredaName}","${kebeleName}",${item.total_members || 0},${item.total_capital || 0},"${item.cooperative_status || ''}","${item.registration_status || ''}"`;
      })
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Cooperatives_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#fff', padding: '24px' }}>
      {(loading || isSubmitting) && <BrandedLoader message={isSubmitting ? "Processing..." : "Loading Data..."} />}

      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item><HomeOutlined /></Breadcrumb.Item>
        <Breadcrumb.Item>Extension</Breadcrumb.Item>
        <Breadcrumb.Item>Cooperative Management</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ marginBottom: 20 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ marginBottom: 4, color: '#1a5f2c' }}>
              🤝 Cooperative & Membership Management
            </Title>
            <Text type="secondary">
              Manage cooperatives, memberships, and cooperative activities
            </Text>
          </Col>
          <Col>
            <Button icon={<ReloadOutlined />} onClick={refreshData}>
              Refresh
            </Button>
          </Col>
        </Row>
      </div>

      <CooperativeStats stats={stats} />

      <CooperativeFilters
        searchText={searchText}
        setSearchText={setSearchText}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        registrationFilter={registrationFilter}
        setRegistrationFilter={setRegistrationFilter}
        onExport={exportToCSV}
        onAdd={handleAdd}
      />

      <CooperativeTable
        data={cooperatives}
        loading={loading}
        zonesMap={zonesMap}
        woredasMap={woredasMap}
        kebelesMap={kebelesMap}
        onView={handleViewDetail}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onApprove={handleApprove}
        onSubmit={handleSubmitForApproval}
      />

      <CooperativeForm
        visible={formVisible}
        onCancel={handleFormCancel}
        onSuccess={handleFormSuccess}
        editingRecord={editingRecord}
      />

      <CooperativeDetail
        visible={detailVisible}
        onCancel={handleDetailCancel}
        record={selectedRecord}
        zonesMap={zonesMap}
        woredasMap={woredasMap}
        kebelesMap={kebelesMap}
        onApprove={handleApprove}
        onEdit={handleEdit}
      />
    </div>
  );
}