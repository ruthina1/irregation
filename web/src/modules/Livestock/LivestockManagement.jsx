import React, { useState, useEffect, useMemo } from 'react';
import { message, Breadcrumb, Typography, Button, Row, Col } from 'antd';
import { HomeOutlined, ReloadOutlined } from '@ant-design/icons';
import { livestockApi } from '../../services/api/livestockApi';
import { handleApiError } from '../../utils/errorHandler';
import BrandedLoader from '../../components/common/BrandedLoader';

import LivestockStats from './LivestockStats';
import LivestockFilters from './LivestockFilters';
import LivestockTable from './LivestockTable';
import LivestockForm from './LivestockForm';
import LivestockDetail from './LivestockDetail';

const { Title, Text } = Typography;

export default function LivestockManagement() {
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [searchText, setSearchText] = useState('');
  const [farmTypeFilter, setFarmTypeFilter] = useState('All');
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
        livestockApi.getZones(),
        livestockApi.getWoredas(),
        livestockApi.getKebeles()
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

  const fetchFarms = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchText) params.search = searchText;
      if (farmTypeFilter !== 'All') params.farm_type = farmTypeFilter;
      if (statusFilter !== 'All') params.farm_status = statusFilter;
      if (registrationFilter !== 'All') params.registration_status = registrationFilter;

      const res = await livestockApi.getFarms(params);
      setFarms(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      handleApiError(error, 'Failed to fetch livestock farms');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await livestockApi.getStats();
      setStats(res.data || {});
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    fetchFarms();
  }, [searchText, farmTypeFilter, statusFilter, registrationFilter]);

  const fetchAllData = async () => {
    await Promise.all([
      fetchLocations(),
      fetchFarms(),
      fetchStats()
    ]);
  };

  const refreshData = () => { fetchAllData(); };

  const handleDelete = async (id) => {
    try {
      await livestockApi.deleteFarm(id);
      message.success('Livestock farm deleted successfully');
      refreshData();
    } catch (error) {
      handleApiError(error, 'Failed to delete livestock farm');
    }
  };

  const handleApprove = async (id) => {
    try {
      await livestockApi.approveFarm(id);
      message.success('Livestock farm approved successfully');
      refreshData();
      setDetailVisible(false);
    } catch (error) {
      handleApiError(error, 'Failed to approve livestock farm');
    }
  };

  const handleSubmitForApproval = async (id) => {
    try {
      await livestockApi.submitFarm(id);
      message.success('Livestock farm submitted for approval');
      fetchFarms();
    } catch (error) {
      handleApiError(error, 'Failed to submit livestock farm');
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormVisible(true);
  };

  const handleViewDetail = async (record) => {
    try {
      setLoading(true);
      const res = await livestockApi.getFarm(record.id);
      setSelectedRecord(res.data);
      setDetailVisible(true);
    } catch (error) {
      handleApiError(error, 'Failed to fetch farm details');
      setSelectedRecord({ ...record, animals: [], productions: [] });
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
    if (farms.length === 0) {
      message.warning('No data available to export.');
      return;
    }

    const headers = 'Farm Name,Farmer,Type,Region,Zone,Woreda,Kebele,Area (Ha),System,Status,Registration\n';

    const rows = farms
      .map((item) => {
        const zoneName = zonesMap[item.zone] || item.zone || '';
        const woredaName = woredasMap[item.woreda] || item.woreda || '';
        const kebeleName = kebelesMap[item.kebele] || item.kebele || '';
        return `"${item.farm_name || ''}","${item.farmer_name || ''}","${item.farm_type || ''}","${item.region || ''}","${zoneName}","${woredaName}","${kebeleName}",${item.total_area_hectares || 0},"${item.production_system || ''}","${item.farm_status || ''}","${item.registration_status || ''}"`;
      })
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Livestock_Farms_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#fff', padding: '24px' }}>
      {(loading || isSubmitting) && <BrandedLoader message={isSubmitting ? "Processing..." : "Loading Data..."} />}

      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item><HomeOutlined /></Breadcrumb.Item>
        <Breadcrumb.Item>Livestock</Breadcrumb.Item>
        <Breadcrumb.Item>Livestock Management</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ marginBottom: 20 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ marginBottom: 4, color: '#1a5f2c' }}>
              🐄 Livestock Management
            </Title>
            <Text type="secondary">
              Manage livestock farms, animals, and production records
            </Text>
          </Col>
          <Col>
            <Button icon={<ReloadOutlined />} onClick={refreshData}>
              Refresh
            </Button>
          </Col>
        </Row>
      </div>

      <LivestockStats stats={stats} />

      <LivestockFilters
        searchText={searchText}
        setSearchText={setSearchText}
        farmTypeFilter={farmTypeFilter}
        setFarmTypeFilter={setFarmTypeFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        registrationFilter={registrationFilter}
        setRegistrationFilter={setRegistrationFilter}
        onExport={exportToCSV}
        onAdd={handleAdd}
      />

      <LivestockTable
        data={farms}
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

      <LivestockForm
        visible={formVisible}
        onCancel={handleFormCancel}
        onSuccess={handleFormSuccess}
        editingRecord={editingRecord}
      />

      <LivestockDetail
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