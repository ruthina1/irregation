import React, { useEffect, useState } from 'react';
import {
  Row, Col, Card, Typography, Skeleton, Select, Button,
  Table, Tooltip, Divider, message, Tabs, Space, DatePicker, Badge
} from 'antd';
import {
  DownloadOutlined, EnvironmentOutlined, DatabaseOutlined,
  FundOutlined, CarOutlined, TeamOutlined, ExperimentOutlined,
  AppstoreOutlined, ApartmentOutlined, BranchesOutlined, GlobalOutlined, FireOutlined, WarningOutlined
} from '@ant-design/icons';
import { meraApi } from '../../services/api/meraApi';
import api from '../../services/axios'; 

// Cross-sector APIs
import { livestockApi } from '../../services/api/livestockApi';
import { extensionApi } from '../../services/api/extensionApi';
import agronomyApi from '../../services/api/agronomyApi';

const { Text, Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 8 }, (_, i) => CURRENT_YEAR - i);

export default function StaffDashboard() {
  const authUser = JSON.parse(localStorage.getItem('user')) || {};

  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingTable, setLoadingTable] = useState(false);
  const [stats, setStats] = useState({});

  // Cross-Sector KPI States
  const [crossSectorStats, setCrossSectorStats] = useState({
    livestock: 0,
    mechanization: 0,
    cooperatives: 0,
    nurseries: 0,
    seed: { total: 0, quantityTons: 0, certified: 0 },
    rehabProjects: 0,
    forests: { total: 0, area: 0 },
    plantations: { activities: 0, treesPlanted: 0 },
    protections: { patrolRecords: 0, incidents: 0, patrolsAndFire: 0 }
  });

  // Dynamic states for locations instead of hardcoded
  const [zones, setZones] = useState([]);
  const [woredas, setWoredas] = useState([]);
  const [kebeles, setKebeles] = useState([]);

  const initialFilters = {
    zone_id: authUser.zone_id || null, woreda_id: authUser.woreda_id || null, kebele_id: authUser.kebele_id || null,
    year: null, 
    gender: null, farmer_type: null, household_head_type: null, is_cooperative_member: null, literacy_status: null,
    construction_status: null, capacity_level: null, audit_status: null,
    event_type: null, start_date: null, end_date: null,
    is_certified_model_village: null,
    land_use_type: null, slope_category: null,
    season: null, crop_category: null, crop_status: null,
    agent_type: null, severity_level: null,
    development_stage: null,
  };

  const [filters, setFilters] = useState(initialFilters);
  const [activeTab, setActiveTab] = useState('farmers');
  const [tableData, setTableData] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  // 1. Fetch functions for locations
  const fetchZones = async () => {
    try {
      const { data } = await api.get('/zones');
      setZones(data.data || data);
    } catch (e) {
      console.error("Failed to load zones", e);
    }
  };

  const fetchWoredas = async (zoneId) => {
    try {
      const { data } = await api.get(`/woredas?zone_id=${zoneId}`);
      setWoredas(data.data || data);
    } catch (e) {
      console.error("Failed to load woredas", e);
    }
  };

  const fetchKebeles = async (woredaId) => {
    try {
      const { data } = await api.get(`/kebeles?woreda_id=${woredaId}`);
      setKebeles(data.data || data);
    } catch (e) {
      console.error("Failed to load kebeles", e);
    }
  };

  // 2. Fetch Cross-Sector KPIs across Livestock, Extension, and Agronomy APIs
  const fetchCrossSectorKPIs = async () => {
    try {
      const [
        lsRes, mechRes, coopRes, nursRes, seedRes, rehabRes,
        forestsRes, plantRes, protRes
      ] = await Promise.all([
        livestockApi.getFarms(filters).catch(() => ({ data: [] })),
        extensionApi.getMechanizationEquipments(filters).catch(() => ({ data: [] })),
        extensionApi.getCooperatives(filters).catch(() => ({ data: [] })),
        agronomyApi.getNurseries(filters).catch(() => ({ data: [] })),
        agronomyApi.getSeedVarieties(filters).catch(() => ({ data: [] })),
        agronomyApi.getRehabilitationProjects(filters).catch(() => ({ data: [] })),
        agronomyApi.getForests(filters).catch(() => ({ data: [] })),
        agronomyApi.getPlantations(filters).catch(() => ({ data: [] })),
        agronomyApi.getForestProtections(filters).catch(() => ({ data: [] }))
      ]);

      const ls = Array.isArray(lsRes.data) ? lsRes.data : [];
      const mechs = Array.isArray(mechRes.data) ? mechRes.data : [];
      const coops = Array.isArray(coopRes.data) ? coopRes.data : [];
      const nurseries = Array.isArray(nursRes.data) ? nursRes.data : [];
      const seeds = Array.isArray(seedRes.data) ? seedRes.data : [];
      const rehabs = Array.isArray(rehabRes.data) ? rehabRes.data : [];
      const forests = Array.isArray(forestsRes.data) ? forestsRes.data : [];
      const plantations = Array.isArray(plantRes.data) ? plantRes.data : [];
      const protections = Array.isArray(protRes.data) ? protRes.data : [];

      setCrossSectorStats({
        livestock: ls.length,
        mechanization: mechs.length,
        cooperatives: coops.length,
        nurseries: nurseries.length,
        seed: {
          total: seeds.length,
          quantityTons: seeds.reduce((sum, s) => sum + Number(s.quantity_tons || s.production_quantity || 0), 0),
          certified: seeds.filter(s => s.is_certified === true || s.is_certified === 1 || String(s.is_certified).toLowerCase() === 'yes').length
        },
        rehabProjects: rehabs.length,
        forests: {
          total: forests.length,
          area: forests.reduce((sum, f) => sum + Number(f.total_area_hectares || f.area_hectares || 0), 0)
        },
        plantations: {
          activities: plantations.length,
          treesPlanted: plantations.reduce((sum, p) => sum + Number(p.number_of_trees_planted || 0), 0)
        },
        protections: {
          patrolRecords: protections.length,
          incidents: protections.filter(p => p.incidents_detected && p.incidents_detected.trim().length > 0).length,
          patrolsAndFire: protections.filter(p => p.activity_type === 'patrol' || p.activity_type === 'fire_prevention').length
        }
      });
    } catch (error) {
      console.error("Failed to load cross-sector stats", error);
    }
  };

  useEffect(() => {
    fetchZones();
    if (authUser.zone_id) fetchWoredas(authUser.zone_id);
    if (authUser.woreda_id) fetchKebeles(authUser.woreda_id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await meraApi.getSummary(filters);
      setStats(res.data?.data || res.data || {});
      await fetchCrossSectorKPIs();
    } catch (error) {
      message.error("Failed to load dashboard statistics.");
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchTableData = async (page = 1) => {
    setLoadingTable(true);
    try {
      const res = await meraApi.getTableData(activeTab, filters, page);
      const payload = res.data?.data || res.data;
      setTableData(payload.data || []);
      setPagination({ ...pagination, current: payload.current_page, total: payload.total });
    } catch (error) {
      message.error("Failed to load table records.");
    } finally {
      setLoadingTable(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchTableData(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, activeTab]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev, [key]: value,
      ...(key === 'zone_id' ? { woreda_id: null, kebele_id: null } : {}),
      ...(key === 'woreda_id' ? { kebele_id: null } : {}),
    }));

    if (key === 'zone_id') {
      setWoredas([]); 
      setKebeles([]);
      if (value) fetchWoredas(value);
    } else if (key === 'woreda_id') {
      setKebeles([]);
      if (value) fetchKebeles(value);
    }
  };

  const handleDateChange = (dates, dateStrings) => {
    setFilters(prev => ({ ...prev, start_date: dateStrings[0] || null, end_date: dateStrings[1] || null }));
  };

  const clearAdvancedFilters = () => {
    setFilters(prev => ({
      ...initialFilters,
      zone_id: prev.zone_id,
      woreda_id: prev.woreda_id,
      kebele_id: prev.kebele_id,
      year: prev.year,
    }));
  };

  const handleExport = async (exportKey, title) => {
    message.loading({ content: `Exporting ${title}...`, key: 'export' });
    try {
      const response = await meraApi.exportDataToExcel(exportKey, filters);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a'); link.href = url;
      link.setAttribute('download', `${exportKey}_data_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link); link.click(); link.parentNode.removeChild(link);
      message.success({ content: `${title} exported successfully!`, key: 'export', duration: 3 });
    } catch (error) {
      message.error({ content: `Failed to export ${title}`, key: 'export', duration: 3 });
    }
  };

  const StatCard = ({ title, value, color, exportKey }) => (
    <Card
      bordered={false}
      style={{
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
        borderRadius: '12px',
        border: '1px solid #E2E8F0',
        borderLeft: `6px solid ${color}`,
        height: '100%',
        backgroundColor: '#ffffff',
        transition: 'all 0.3s ease',
        cursor: 'default',
        position: 'relative'
      }}
      bodyStyle={{ padding: '24px 20px' }}
      className="enterprise-stat-card"
    >
      <Tooltip title={`Export ${title} to CSV`}>
        <Button
          type="text"
          className="stat-export-btn"
          icon={<DownloadOutlined />}
          style={{ position: 'absolute', top: 12, right: 12, color: '#94A3B8' }}
          onClick={() => handleExport(exportKey, title)}
        />
      </Tooltip>
      <Skeleton loading={loadingStats} active paragraph={{ rows: 1 }} title={false}>
        <div style={{ paddingRight: '24px' }}>
          <Text style={{
            fontSize: '13px', color: '#475569', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.5px', display: 'block', marginBottom: '12px', lineHeight: '1.4'
          }}>
            {title}
          </Text>
          <Title level={2} style={{ margin: '0', color: '#0F172A', fontWeight: 800, fontSize: '34px' }}>
            {value?.toLocaleString() || 0}
          </Title>
        </div>
      </Skeleton>
    </Card>
  );

  const dynamicColumns = tableData.length > 0 ? Object.keys(tableData[0]).slice(0, 8).map(key => ({
    title: key.replace(/_/g, ' ').toUpperCase(),
    dataIndex: key,
    key: key,
    ellipsis: true
  })) : [];

  return (
    <div style={{ padding: '24px', backgroundColor: '#F1F5F9', minHeight: '100vh', fontFamily: 'Inter, -apple-system, sans-serif' }}>

      <Card bodyStyle={{ padding: '16px 24px' }} style={{ marginBottom: 24, borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
        <Row align="middle" justify="space-between" gutter={[16, 16]}>
          <Col>
            <Title level={4} style={{ margin: 0, color: '#0F172A', fontWeight: 700 }}>
              <EnvironmentOutlined style={{ color: '#28805c', marginRight: 8 }} />
              M&E Reporting Center
            </Title>
          </Col>
          <Col>
            <Space wrap size="middle">
              <Select placeholder="Select Zone" style={{ width: 180 }} value={filters.zone_id} disabled={!!authUser.zone_id} allowClear onChange={val => handleFilterChange('zone_id', val)} showSearch optionFilterProp="children">
                {zones.map(z => <Option key={z.id} value={z.id}>{z.name}</Option>)}
              </Select>
              
              <Select placeholder="Select Woreda" style={{ width: 180 }} value={filters.woreda_id} disabled={!filters.zone_id || !!authUser.woreda_id} allowClear onChange={val => handleFilterChange('woreda_id', val)} showSearch optionFilterProp="children">
                {woredas.map(w => <Option key={w.id} value={w.id}>{w.name}</Option>)}
              </Select>

              <Select placeholder="Select Kebele" style={{ width: 180 }} value={filters.kebele_id} disabled={!filters.woreda_id || !!authUser.kebele_id} allowClear onChange={val => handleFilterChange('kebele_id', val)} showSearch optionFilterProp="children">
                {kebeles.map(k => <Option key={k.id} value={k.id}>{k.name}</Option>)}
              </Select>
              
              <Select placeholder="All Years" style={{ width: 130 }} value={filters.year} allowClear onChange={val => handleFilterChange('year', val)}>
                {YEAR_OPTIONS.map(y => <Option key={y} value={y}>{y}</Option>)}
              </Select>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* =================================================================== */}

      <Divider orientation="left" style={{ borderColor: '#CBD5E1', color: '#475569', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>
        Agricultural Extension Services
      </Divider>
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12} lg={6}><StatCard title="Registered Farmers" exportKey="farmers" value={stats.total_farmers} color="#059669" /></Col>
        <Col xs={24} sm={12} lg={6}><StatCard title="Agri. Experts (DAs)" exportKey="experts" value={stats.total_experts} color="#0284C7" /></Col>
        <Col xs={24} sm={12} lg={6}><StatCard title="Active FTCs" exportKey="ftcs" value={stats.total_ftcs} color="#7C3AED" /></Col>
        <Col xs={24} sm={12} lg={6}><StatCard title="Training & Events" exportKey="events" value={stats.total_events} color="#EA580C" /></Col>
      </Row>

      <Divider orientation="left" style={{ borderColor: '#CBD5E1', color: '#475569', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>
        Agronomy, Land & Production
      </Divider>
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12} lg={6}><StatCard title="Land Parcels" exportKey="land_parcels" value={stats.total_land_parcels} color="#65A30D" /></Col>
        <Col xs={24} sm={12} lg={6}><StatCard title="Seasonal Crops" exportKey="seasonal_crops" value={stats.total_seasonal_crops} color="#D97706" /></Col>
        <Col xs={24} sm={12} lg={6}><StatCard title="Seed Multiplication" exportKey="seed_mults" value={stats.total_seed_mults} color="#2563EB" /></Col>
        <Col xs={24} sm={12} lg={6}><StatCard title="Pest Alerts" exportKey="pest_reports" value={stats.total_pest_reports} color="#DC2626" /></Col>
      </Row>

      <Divider orientation="left" style={{ borderColor: '#CBD5E1', color: '#475569', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>
        Ecology, Community & Safety Nets
      </Divider>
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12} lg={4}><StatCard title="Watersheds" exportKey="watersheds" value={stats.total_watersheds} color="#0891B2" /></Col>
        <Col xs={24} sm={12} lg={5}><StatCard title="NCM Interventions" exportKey="ncm_interventions" value={stats.total_ncm_interventions} color="#0D9488" /></Col>
        <Col xs={24} sm={12} lg={5}><StatCard title="Model Villages" exportKey="model_villages" value={stats.total_model_villages} color="#4F46E5" /></Col>
        <Col xs={24} sm={12} lg={5}><StatCard title="Women & Youth" exportKey="women_youth" value={stats.total_women_youth} color="#DB2777" /></Col>
        <Col xs={24} sm={12} lg={5}><StatCard title="PSNP Households" exportKey="psnp_hhs" value={stats.total_psnp_hhs} color="#E11D48" /></Col>
      </Row>

      <Divider orientation="left" style={{ borderColor: '#CBD5E1', color: '#475569', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>
        Livestock, Machinery & Cooperatives
      </Divider>
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12} lg={8}><StatCard title="Total Livestock Animals" value={crossSectorStats.livestock} color="#DB2777" exportKey="livestock_farms" /></Col>
        <Col xs={24} sm={12} lg={8}><StatCard title="Total Mechanization Units" value={crossSectorStats.mechanization} color="#0284C7" exportKey="mechanization" /></Col>
        <Col xs={24} sm={12} lg={8}><StatCard title="Total Cooperatives" value={crossSectorStats.cooperatives} color="#7C3AED" exportKey="cooperatives" /></Col>
      </Row>

      <Divider orientation="left" style={{ borderColor: '#CBD5E1', color: '#475569', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>
        Agronomy Inputs & Seed Systems
      </Divider>
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12} lg={6}><StatCard title="Total Nurseries" value={crossSectorStats.nurseries} color="#059669" exportKey="nurseries" /></Col>
        <Col xs={24} sm={12} lg={6}><StatCard title="Seed Registrations" value={crossSectorStats.seed.total} color="#D97706" exportKey="seed_registrations" /></Col>
        <Col xs={24} sm={12} lg={6}><StatCard title="Seed Quantity (Tons)" value={crossSectorStats.seed.quantityTons} color="#2563EB" exportKey="seed_quantity" /></Col>
        <Col xs={24} sm={12} lg={6}><StatCard title="Certified Varieties" value={crossSectorStats.seed.certified} color="#16A34A" exportKey="certified_seeds" /></Col>
      </Row>

      <Divider orientation="left" style={{ borderColor: '#CBD5E1', color: '#475569', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>
        Land Rehabilitation & Forestry
      </Divider>
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12} lg={6}><StatCard title="Land Rehab Projects" value={crossSectorStats.rehabProjects} color="#65A30D" exportKey="rehab_projects" /></Col>
        <Col xs={24} sm={12} lg={6}><StatCard title="Registered Forests" value={crossSectorStats.forests.total} color="#0D9488" exportKey="forests" /></Col>
        <Col xs={24} sm={12} lg={6}><StatCard title="Plantation Activities" value={crossSectorStats.plantations.activities} color="#4F46E5" exportKey="plantations" /></Col>
        <Col xs={24} sm={12} lg={6}><StatCard title="Trees Planted" value={crossSectorStats.plantations.treesPlanted} color="#10B981" exportKey="trees_planted" /></Col>
      </Row>

      <Divider orientation="left" style={{ borderColor: '#CBD5E1', color: '#475569', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>
        Forest Protection & Security
      </Divider>
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12} lg={8}><StatCard title="Total Patrol Records" value={crossSectorStats.protections.patrolRecords} color="#2563EB" exportKey="patrol_records" /></Col>
        <Col xs={24} sm={12} lg={8}><StatCard title="Patrols & Fire Prevention" value={crossSectorStats.protections.patrolsAndFire} color="#EA580C" exportKey="fire_prevention" /></Col>
        <Col xs={24} sm={12} lg={8}><StatCard title="Incidents Reported" value={crossSectorStats.protections.incidents} color="#DC2626" exportKey="incidents_reported" /></Col>
      </Row>
      
      <Card
        bordered={false}
        style={{ borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <DatabaseOutlined style={{ color: '#28805c', marginRight: 12, fontSize: '20px' }} />
            <span style={{ fontSize: '18px', fontWeight: 600 }}>Enterprise Data Explorer</span>
          </div>
        }
        extra={
          <Button type="primary" icon={<DownloadOutlined />} style={{ backgroundColor: '#0F172A' }} onClick={() => handleExport(activeTab, activeTab)}>
            Export Current View
          </Button>
        }
      >
        <Tabs
          activeKey={activeTab}
          onChange={(key) => { setActiveTab(key); clearAdvancedFilters(); }}
          tabBarStyle={{ marginBottom: '24px', fontWeight: 500 }}
        >
          <Tabs.TabPane tab="Farmers" key="farmers" />
          <Tabs.TabPane tab="FTCs" key="ftcs" />
          <Tabs.TabPane tab="Experts" key="experts" />
          <Tabs.TabPane tab="Events" key="events" />
          <Tabs.TabPane tab="Land Parcels" key="land_parcels" />
          <Tabs.TabPane tab="Seasonal Crops" key="seasonal_crops" />
          <Tabs.TabPane tab="Seed Mult." key="seed_mults" />
          <Tabs.TabPane tab="Pest Reports" key="pest_reports" />
          <Tabs.TabPane tab="Watersheds" key="watersheds" />
          <Tabs.TabPane tab="NCM" key="ncm_interventions" />
          <Tabs.TabPane tab="Model Villages" key="model_villages" />
          <Tabs.TabPane tab="Women/Youth" key="women_youth" />
          <Tabs.TabPane tab="PSNP HHs" key="psnp_hhs" />
        </Tabs>

        <div style={{
          backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px',
          padding: '16px 20px', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center'
        }}>
          <Badge status="processing" text={<span style={{ fontWeight: 600, color: '#334155' }}>Filters for {activeTab.replace(/_/g, ' ').toUpperCase()}:</span>} />

          {['farmers', 'psnp_hhs'].includes(activeTab) && (
            <>
              <Select placeholder="Gender" style={{ width: 130 }} value={filters.gender} allowClear onChange={val => handleFilterChange('gender', val)}>
                <Option value="Male">Male</Option><Option value="Female">Female</Option>
              </Select>
              <Select placeholder="Farmer Type" style={{ width: 160 }} value={filters.farmer_type} allowClear onChange={val => handleFilterChange('farmer_type', val)}>
                <Option value="Regular">Regular</Option><Option value="Model">Model</Option><Option value="Private Investor">Private Investor</Option>
              </Select>
              <Select placeholder="Coop Member" style={{ width: 150 }} value={filters.is_cooperative_member} allowClear onChange={val => handleFilterChange('is_cooperative_member', val)}>
                <Option value={1}>Yes</Option><Option value={0}>No</Option>
              </Select>
            </>
          )}

          {activeTab === 'ftcs' && (
            <>
              <Select placeholder="Construction Phase" style={{ width: 180 }} value={filters.construction_status} allowClear onChange={val => handleFilterChange('construction_status', val)}>
                <Option value="Completed">Completed</Option><Option value="Under Construction">Under Construction</Option><Option value="Not Started">Not Started</Option>
              </Select>
              <Select placeholder="Capacity Level" style={{ width: 160 }} value={filters.capacity_level} allowClear onChange={val => handleFilterChange('capacity_level', val)}>
                <Option value="Advanced">Advanced</Option><Option value="Intermediate">Intermediate</Option><Option value="Basic">Basic</Option>
              </Select>
              <Select placeholder="Audit Status" style={{ width: 150 }} value={filters.audit_status} allowClear onChange={val => handleFilterChange('audit_status', val)}>
                <Option value="Audited">Audited</Option><Option value="Not Audited">Not Audited</Option>
              </Select>
            </>
          )}

          {activeTab === 'events' && (
            <>
              <Select placeholder="Event Type" style={{ width: 180 }} value={filters.event_type} allowClear onChange={val => handleFilterChange('event_type', val)}>
                <Option value="Training">Training</Option><Option value="Field Day">Field Day</Option><Option value="Video Dissemination">Video Dissemination</Option><Option value="Workshop">Workshop</Option>
              </Select>
              <RangePicker onChange={handleDateChange} style={{ width: 260 }} placeholder={["Start Date", "End Date"]} />
            </>
          )}

          {activeTab === 'model_villages' && (
            <Select placeholder="Certification Status" style={{ width: 180 }} value={filters.is_certified_model_village} allowClear onChange={val => handleFilterChange('is_certified_model_village', val)}>
              <Option value={1}>Certified</Option><Option value={0}>Not Certified</Option>
            </Select>
          )}

          {activeTab === 'seasonal_crops' && (
            <>
              <Select placeholder="Season" style={{ width: 130 }} value={filters.season} allowClear onChange={val => handleFilterChange('season', val)}>
                <Option value="Meher">Meher</Option><Option value="Belg">Belg</Option>
              </Select>
              <Select placeholder="Crop Category" style={{ width: 160 }} value={filters.crop_category} allowClear onChange={val => handleFilterChange('crop_category', val)}>
                <Option value="Cereals">Cereals</Option><Option value="Pulses">Pulses</Option><Option value="Vegetables">Vegetables</Option>
              </Select>
              <Select placeholder="Status" style={{ width: 140 }} value={filters.crop_status} allowClear onChange={val => handleFilterChange('crop_status', val)}>
                <Option value="Planted">Planted</Option><Option value="Growing">Growing</Option><Option value="Harvested">Harvested</Option>
              </Select>
            </>
          )}

          <Button type="link" danger onClick={clearAdvancedFilters} style={{ marginLeft: 'auto' }}>
            Reset Filters
          </Button>
        </div>

        <Table
          dataSource={tableData}
          columns={dynamicColumns}
          rowKey="id"
          loading={loadingTable}
          pagination={{
            current: pagination.current,
            total: pagination.total,
            pageSize: 10,
            onChange: fetchTableData,
            showSizeChanger: false
          }}
          scroll={{ x: 'max-content' }}
          size="middle"
        />
      </Card>

      <style>{`
        .enterprise-stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.22) !important;
          border-color: #CBD5E1 !important;
        }
        .stat-export-btn:hover {
          background-color: #F1F5F9 !important;
          color: #0F172A !important;
        }
        .ant-table-wrapper {
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          overflow: hidden;
        }
        .ant-table-thead > tr > th {
          background-color: #F8FAFC !important;
          color: #475569;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 12px;
          letter-spacing: 0.5px;
        }
      `}</style>
    </div>
  );
}