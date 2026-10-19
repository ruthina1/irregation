import React, { useState, useEffect, useMemo } from 'react';
import { message, Breadcrumb, Typography, Button, Row, Col } from 'antd';
import { HomeOutlined, ReloadOutlined } from '@ant-design/icons';
import { extensionApi } from '../../../services/api/extensionApi';
import { handleApiError } from '../../../utils/errorHandler';
import BrandedLoader from '../../../components/common/BrandedLoader';

import MechanizationStats from './MechanizationStats';
import MechanizationFilters from './MechanizationFilters';
import MechanizationTable from './MechanizationTable';
import MechanizationForm from './MechanizationForm';
import MechanizationDetail from './MechanizationDetail';

const { Title, Text } = Typography;

export default function MechanizationManagement() {
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [searchText, setSearchText] = useState('');
  const [equipmentTypeFilter, setEquipmentTypeFilter] = useState('All');
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
        extensionApi.getZones(),
        extensionApi.getWoredas(),
        extensionApi.getKebeles()
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

  const fetchEquipments = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchText) params.search = searchText;
      if (equipmentTypeFilter !== 'All') params.equipment_type = equipmentTypeFilter;
      if (statusFilter !== 'All') params.operational_status = statusFilter;
      if (registrationFilter !== 'All') params.registration_status = registrationFilter;

      const res = await extensionApi.getMechanizationEquipments(params);
      setEquipments(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      handleApiError(error, 'Failed to fetch equipment');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await extensionApi.getMechanizationStats();
      setStats(res.data || {});
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    fetchEquipments();
  }, [searchText, equipmentTypeFilter, statusFilter, registrationFilter]);

  const fetchAllData = async () => {
    await Promise.all([
      fetchLocations(),
      fetchEquipments(),
      fetchStats()
    ]);
  };

  const refreshData = () => { fetchAllData(); };

  const handleDelete = async (id) => {
    try {
      await extensionApi.deleteEquipment(id);
      message.success('Equipment deleted successfully');
      refreshData();
    } catch (error) {
      handleApiError(error, 'Failed to delete equipment');
    }
  };

  const handleApprove = async (id) => {
    try {
      await extensionApi.approveEquipment(id);
      message.success('Equipment approved successfully');
      refreshData();
      setDetailVisible(false);
    } catch (error) {
      handleApiError(error, 'Failed to approve equipment');
    }
  };

  const handleSubmitForApproval = async (id) => {
    try {
      await extensionApi.submitEquipment(id);
      message.success('Equipment submitted for approval');
      fetchEquipments();
    } catch (error) {
      handleApiError(error, 'Failed to submit equipment');
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormVisible(true);
  };

  const handleViewDetail = async (record) => {
    try {
      setLoading(true);
      const res = await extensionApi.getMechanizationEquipment(record.id);
      setSelectedRecord(res.data);
      setDetailVisible(true);
    } catch (error) {
      handleApiError(error, 'Failed to fetch equipment details');
      setSelectedRecord({ ...record, allocations: [], maintenances: [] });
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
    if (equipments.length === 0) {
      message.warning('No data available to export.');
      return;
    }

    const headers = 'Equipment Name,Type,Model,Serial Number,Manufacturer,Year,HP,Fuel Type,Ownership,Farmer,Region,Zone,Woreda,Kebele,Condition,Operational Status,Registration\n';

    const rows = equipments
      .map((item) => {
        const zoneName = zonesMap[item.zone] || item.zone || '';
        const woredaName = woredasMap[item.woreda] || item.woreda || '';
        const kebeleName = kebelesMap[item.kebele] || item.kebele || '';
        return `"${item.equipment_name || ''}","${item.equipment_type || ''}","${item.model || ''}","${item.serial_number || ''}","${item.manufacturer || ''}","${item.manufacturing_year || ''}","${item.horsepower || 0}","${item.fuel_type || ''}","${item.ownership_type || ''}","${item.farmer_name || ''}","${item.region || ''}","${zoneName}","${woredaName}","${kebeleName}","${item.condition_status || ''}","${item.operational_status || ''}","${item.registration_status || ''}"`;
      })
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Mechanization_Equipment_${new Date().toISOString().slice(0, 10)}.csv`;
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
        <Breadcrumb.Item>Mechanization Management</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ marginBottom: 20 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ marginBottom: 4, color: '#1a5f2c' }}>
              🚜 Mechanization Management
            </Title>
            <Text type="secondary">
              Manage agricultural equipment, allocations, and maintenance records
            </Text>
          </Col>
          <Col>
            <Button icon={<ReloadOutlined />} onClick={refreshData}>
              Refresh
            </Button>
          </Col>
        </Row>
      </div>

      <MechanizationStats stats={stats} />

      <MechanizationFilters
        searchText={searchText}
        setSearchText={setSearchText}
        equipmentTypeFilter={equipmentTypeFilter}
        setEquipmentTypeFilter={setEquipmentTypeFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        registrationFilter={registrationFilter}
        setRegistrationFilter={setRegistrationFilter}
        onExport={exportToCSV}
        onAdd={handleAdd}
      />

      <MechanizationTable
        data={equipments}
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

      <MechanizationForm
        visible={formVisible}
        onCancel={handleFormCancel}
        onSuccess={handleFormSuccess}
        editingRecord={editingRecord}
      />

      <MechanizationDetail
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