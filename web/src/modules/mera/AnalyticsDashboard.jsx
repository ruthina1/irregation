import React, { useEffect, useState } from 'react';
import {
  Row, Col, Card, Typography, Skeleton, Select, Space,
  Statistic, Progress, Alert, Table, Empty, Tag, Modal, List, Tabs, Button, Tooltip
} from 'antd';
import {
  TeamOutlined, EnvironmentOutlined, FundOutlined, WarningOutlined,
  BankOutlined, FileTextOutlined, RiseOutlined, SafetyCertificateOutlined,
  GoldOutlined, SolutionOutlined, BranchesOutlined, HeartOutlined,
  RobotOutlined, ThunderboltOutlined, BulbOutlined, CheckCircleOutlined,
  AppstoreOutlined, FireOutlined, GlobalOutlined, CarOutlined,
  ExperimentOutlined, ApartmentOutlined, ReloadOutlined
} from '@ant-design/icons';
import { Bar, Line, Pie, Area } from '@ant-design/charts';

// APIs
import { meraApi } from '../../services/api/meraApi';
import api from '../../services/axios';
import { livestockApi } from '../../services/api/livestockApi';
import { extensionApi } from '../../services/api/extensionApi';
import agronomyApi from '../../services/api/agronomyApi';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 8 }, (_, i) => CURRENT_YEAR - i);

/* ---------- Refined Design Tokens ---------- */
const THEME = {
  bg: '#F8FAFC',
  surface: '#FFFFFF',
  border: '#E2E8F0',
  borderSubtle: '#F1F5F9',
  ink: '#0F172A',
  inkMuted: '#64748B',
  primary: '#0F766E',      // Modern deep emerald
  primaryLight: '#14B8A6', // Clean teal
  primaryBg: '#F0FDFA',
  amber: '#D97706',
  amberBg: '#FEF3C7',
  sky: '#0284C7',
  skyBg: '#E0F2FE',
  rose: '#E11D48',
  roseBg: '#FFE4E6',
  danger: '#DC2626',
};

const PALETTE = ['#0F766E', '#0284C7', '#D97706', '#E11D48', '#8B5CF6', '#10B981', '#64748B'];

const axisGridStyle = { line: { style: { stroke: '#F1F5F9', lineDash: [2, 2] } } };
const axisLabelStyle = { style: { fill: THEME.inkMuted, fontSize: 11, fontFamily: 'inherit' } };

/* ---------- Streamlined Chart Components ---------- */
const SimpleBar = ({ data, height = 230, color, valueSuffix = '' }) => {
  const clean = (data || []).filter(d => Number(d.value) > 0).sort((a, b) => Number(b.value) - Number(a.value));
  if (!clean.length) return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No records available" style={{ padding: '30px 0' }} />;
  return (
    <Bar
      data={clean}
      xField="value"
      yField="label"
      colorField="label"
      color={color || PALETTE}
      height={height}
      legend={false}
      barStyle={{ radius: [0, 6, 6, 0] }}
      label={{
        position: 'right',
        style: { fill: THEME.ink, fontSize: 11, fontWeight: 600 },
        formatter: (d) => `${Number(d.value).toLocaleString()}${valueSuffix}`
      }}
      xAxis={{ label: axisLabelStyle, grid: axisGridStyle }}
      yAxis={{ label: { style: { fill: THEME.ink, fontSize: 11.5, fontWeight: 500 } } }}
      tooltip={{ formatter: (d) => ({ name: d.label, value: `${Number(d.value).toLocaleString()}${valueSuffix}` }) }}
    />
  );
};

const SimplePie = ({ data, height = 230, color }) => {
  const clean = (data || []).filter(d => Number(d.value) > 0);
  if (!clean.length) return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No records available" style={{ padding: '30px 0' }} />;
  return (
    <Pie
      data={clean}
      angleField="value"
      colorField="label"
      color={color || PALETTE}
      height={height}
      radius={0.82}
      innerRadius={0.62}
      label={{ text: 'value', style: { fontSize: 11, fill: '#FFFFFF', fontWeight: 600 } }}
      legend={{ position: 'bottom', itemName: { style: { fontSize: 11.5, fill: THEME.inkMuted } } }}
      tooltip={{ formatter: (d) => ({ name: d.label, value: Number(d.value).toLocaleString() }) }}
    />
  );
};

const TrendLine = ({ data, height = 240, color = THEME.primary, xField = 'month', yField = 'total' }) => {
  const clean = data || [];
  if (!clean.length) return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No trend records available" style={{ padding: '30px 0' }} />;
  return (
    <Line
      data={clean}
      xField={xField}
      yField={yField}
      height={height}
      smooth
      color={color}
      lineStyle={{ lineWidth: 2.5 }}
      point={{ size: 3.5, shape: 'circle', style: { fill: '#fff', stroke: color, lineWidth: 2 } }}
      xAxis={{ label: axisLabelStyle }}
      yAxis={{ grid: axisGridStyle, label: axisLabelStyle }}
      tooltip={{ showMarkers: true }}
    />
  );
};

/* ---------- Polished Modular Dashboard Card ---------- */
const DashboardCard = ({ title, subtitle, extra, children, minHeight = 'auto' }) => (
  <Card
    bordered={false}
    style={{
      borderRadius: 12,
      border: `1px solid ${THEME.border}`,
      boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
      height: '100%',
      minHeight,
      background: THEME.surface,
    }}
    bodyStyle={{ padding: '20px' }}
  >
    {(title || subtitle || extra) && (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <Text strong style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.4px', color: THEME.ink }}>
            {title}
          </Text>
          {subtitle && <div style={{ fontSize: 12, color: THEME.inkMuted, marginTop: 2 }}>{subtitle}</div>}
        </div>
        {extra && <div>{extra}</div>}
      </div>
    )}
    {children}
  </Card>
);

/* ---------- Stat Tile Indicator ---------- */
const StatPill = ({ label, value, icon, color = THEME.primary, bg = THEME.primaryBg, note }) => (
  <div style={{
    background: THEME.surface,
    border: `1px solid ${THEME.border}`,
    borderRadius: 12,
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
  }}>
    <div style={{
      width: 44,
      height: 44,
      borderRadius: 10,
      background: bg,
      color: color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 20
    }}>
      {icon}
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 12, color: THEME.inkMuted, fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: THEME.ink, lineHeight: 1.2, marginTop: 2 }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      {note && <div style={{ fontSize: 11, color: THEME.inkMuted, marginTop: 2 }}>{note}</div>}
    </div>
  </div>
);

export default function AnalyticsDashboard() {
  const authUser = JSON.parse(localStorage.getItem('user')) || {};

  const [zones, setZones] = useState([]);
  const [woredas, setWoredas] = useState([]);
  const [kebeles, setKebeles] = useState([]);
  const [filters, setFilters] = useState({
    zone_id: authUser.zone_id || null,
    woreda_id: authUser.woreda_id || null,
    kebele_id: authUser.kebele_id || null,
    year: null,
  });

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [isSummaryModalVisible, setIsSummaryModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const [kpis, setKpis] = useState({
    livestock: 0, mechanization: 0, cooperatives: 0, nurseries: 0,
    seed: { total: 0, quantityTons: 0, certified: 0 },
    rehabProjects: 0, forests: { total: 0, area: 0 },
    plantations: { activities: 0, treesPlanted: 0 },
    protections: { patrolRecords: 0, incidents: 0, patrolsAndFire: 0 }
  });

  const fetchLocations = async () => {
    try {
      const { data } = await api.get('/zones');
      setZones(data.data || data);
      if (authUser.zone_id) {
        const wRes = await api.get(`/woredas?zone_id=${authUser.zone_id}`);
        setWoredas(wRes.data.data || wRes.data);
      }
      if (authUser.woreda_id) {
        const kRes = await api.get(`/kebeles?woreda_id=${authUser.woreda_id}`);
        setKebeles(kRes.data.data || kRes.data);
      }
    } catch (e) {}
  };

  const fetchAllCrossSectorKPIs = async () => {
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

      setKpis({
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
      console.error('Failed to aggregate KPIs', error);
    }
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await meraApi.getAnalyticsOverview(filters);
      setData(res.data?.data || res.data || null);
      await fetchAllCrossSectorKPIs();
    } catch (error) {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleFilterChange = async (key, value) => {
    setFilters(prev => ({
      ...prev, [key]: value,
      ...(key === 'zone_id' ? { woreda_id: null, kebele_id: null } : {}),
      ...(key === 'woreda_id' ? { kebele_id: null } : {}),
    }));

    if (key === 'zone_id') {
      setWoredas([]); setKebeles([]);
      if (value) {
        const { data } = await api.get(`/woredas?zone_id=${value}`);
        setWoredas(data.data || data);
      }
    } else if (key === 'woreda_id') {
      setKebeles([]);
      if (value) {
        const { data } = await api.get(`/kebeles?woreda_id=${value}`);
        setKebeles(data.data || data);
      }
    }
  };

  const demo = data?.farmer_demographics || {};
  const geo = data?.geographic || {};
  const trend = data?.registration_trend || [];
  const agronomy = data?.agronomy || {};
  const extension = data?.extension_services || {};
  const infra = data?.infrastructure || {};
  const pest = data?.pest_disease || {};
  const nrm = data?.nrm || {};
  const social = data?.social_safety_nets || {};
  const narrative = data?.narrative_summary || { insights: [] };

  const yieldExpected = Number(agronomy.yield_comparison?.expected || 0);
  const yieldActual = Number(agronomy.yield_comparison?.actual || 0);
  const yieldRate = yieldExpected > 0 ? Math.round((yieldActual / yieldExpected) * 100) : 0;

  const scopeParts = [
    kebeles.find(k => k.id === filters.kebele_id)?.name,
    woredas.find(w => w.id === filters.woreda_id)?.name,
    zones.find(z => z.id === filters.zone_id)?.name,
  ].filter(Boolean);
  const scopeLabel = scopeParts.length ? scopeParts.join(' / ') : 'Entire Region';

  const aiRecommendations = [];
  if (yieldRate > 0 && yieldRate < 90) aiRecommendations.push({ type: 'warning', text: `Yield deficit detected (${yieldActual.toLocaleString()} vs ${yieldExpected.toLocaleString()} qtl target). Intensify field extension inputs.` });
  if (pest.emergency_alerts > 0) aiRecommendations.push({ type: 'danger', text: `Critical situation: ${pest.emergency_alerts} active emergency pest alerts requiring instant field containment.` });
  if (kpis.protections.incidents > 3) aiRecommendations.push({ type: 'danger', text: `Elevated forest threat: ${kpis.protections.incidents} incidents flagged recently. Escalate patrols and surveillance.` });
  if (aiRecommendations.length === 0) aiRecommendations.push({ type: 'success', text: 'Operational indicators remain well within standard ranges across all surveyed woredas.' });

  const woredaColumns = [
    { title: 'Woreda', dataIndex: 'woreda', key: 'woreda', render: v => <Text strong style={{ color: THEME.ink }}>{v}</Text> },
    { title: 'Registered Farmers', dataIndex: 'farmers', key: 'farmers', sorter: (a, b) => a.farmers - b.farmers, render: v => (typeof v === 'number' ? v.toLocaleString() : v) },
    { title: 'Cooperative Rate', dataIndex: 'cooperative_rate', key: 'cooperative_rate', render: v => <Progress percent={v} size="small" strokeColor={THEME.primary} /> },
    { title: 'FTC Completion', dataIndex: 'ftc_completion_rate', key: 'ftc_completion_rate', render: v => <Progress percent={v} size="small" strokeColor={THEME.sky} /> },
  ];

  return (
    <div style={{ backgroundColor: THEME.bg, minHeight: '100vh', padding: '24px 32px' }}>
      
      {/* ─── MODERN HEADER & FILTER BAR ─── */}
      <div style={{
        background: THEME.surface,
        border: `1px solid ${THEME.border}`,
        borderRadius: 14,
        padding: '16px 24px',
        marginBottom: 24,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 16,
        boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: THEME.primaryBg, color: THEME.primary, width: 34, height: 34, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FundOutlined style={{ fontSize: 18 }} />
            </div>
            <Title level={4} style={{ margin: 0, color: THEME.ink, fontWeight: 700 }}>
              IAIMS Analytics & Intelligence
            </Title>
            <Tag color="cyan" style={{ marginLeft: 6, borderRadius: 12 }}>Scope: {scopeLabel}</Tag>
          </div>
          <Text style={{ color: THEME.inkMuted, fontSize: 13, marginTop: 4, display: 'block' }}>
            Multi-sector insights across Agronomy, Forestry, Livestock & Extension services
          </Text>
        </div>

        <Space wrap size="middle">
          <Select
            placeholder="Zone"
            style={{ width: 150 }}
            value={filters.zone_id}
            disabled={!!authUser.zone_id}
            allowClear
            onChange={val => handleFilterChange('zone_id', val)}
            showSearch
          >
            {zones.map(z => <Option key={z.id} value={z.id}>{z.name}</Option>)}
          </Select>

          <Select
            placeholder="Woreda"
            style={{ width: 150 }}
            value={filters.woreda_id}
            disabled={!filters.zone_id || !!authUser.woreda_id}
            allowClear
            onChange={val => handleFilterChange('woreda_id', val)}
            showSearch
          >
            {woredas.map(w => <Option key={w.id} value={w.id}>{w.name}</Option>)}
          </Select>

          <Select
            placeholder="Kebele"
            style={{ width: 150 }}
            value={filters.kebele_id}
            disabled={!filters.woreda_id || !!authUser.kebele_id}
            allowClear
            onChange={val => handleFilterChange('kebele_id', val)}
            showSearch
          >
            {kebeles.map(k => <Option key={k.id} value={k.id}>{k.name}</Option>)}
          </Select>

          <Select
            placeholder="Year"
            style={{ width: 100 }}
            value={filters.year}
            allowClear
            onChange={val => handleFilterChange('year', val)}
          >
            {YEAR_OPTIONS.map(y => <Option key={y} value={y}>{y}</Option>)}
          </Select>

          <Button
            type="primary"
            icon={<RobotOutlined />}
            onClick={() => setIsSummaryModalVisible(true)}
            style={{ background: THEME.primary, borderColor: THEME.primary, borderRadius: 8, fontWeight: 600 }}
          >
            Executive Summary
          </Button>
        </Space>
      </div>

      <Skeleton loading={loading} active paragraph={{ rows: 10 }}>
        {!data ? (
          <Card style={{ borderRadius: 14, border: `1px dashed ${THEME.border}`, textAlign: 'center', padding: '40px 0' }}>
            <Empty description="No analytics data available for selected criteria" />
            <Button icon={<ReloadOutlined />} onClick={fetchAnalytics} style={{ marginTop: 16 }}>Refresh Records</Button>
          </Card>
        ) : (
          <>
            {/* ─── TOP KPI STRIP ─── */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col xs={24} sm={12} lg={6}>
                <StatPill
                  label="Livestock Farms"
                  value={kpis.livestock}
                  icon={<FundOutlined />}
                  color={THEME.rose}
                  bg={THEME.roseBg}
                  note={`${kpis.mechanization} mechanization units`}
                />
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <StatPill
                  label="Agronomy Inputs"
                  value={kpis.nurseries}
                  icon={<ExperimentOutlined />}
                  color={THEME.sky}
                  bg={THEME.skyBg}
                  note={`${kpis.seed.certified} certified varieties`}
                />
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <StatPill
                  label="Forestry Coverage"
                  value={`${kpis.forests.area.toLocaleString()} ha`}
                  icon={<BranchesOutlined />}
                  color={THEME.primary}
                  bg={THEME.primaryBg}
                  note={`${kpis.forests.total} registered forests`}
                />
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <StatPill
                  label="Active Security Patrols"
                  value={kpis.protections.patrolRecords}
                  icon={<FireOutlined />}
                  color={kpis.protections.incidents > 0 ? THEME.danger : THEME.amber}
                  bg={kpis.protections.incidents > 0 ? '#FEE2E2' : THEME.amberBg}
                  note={`${kpis.protections.incidents} incidents recorded`}
                />
              </Col>
            </Row>

            {/* ─── TABBED DETAILED VIEWS ─── */}
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              type="card"
              style={{ marginBottom: 24 }}
              items={[
                {
                  key: 'overview',
                  label: <span><AppstoreOutlined /> Overview & Demographics</span>,
                  children: (
                    <Space direction="vertical" size={20} style={{ width: '100%' }}>
                      <Row gutter={[16, 16]}>
                        <Col xs={24} lg={8}>
                          <DashboardCard title="Gender Distribution">
                            <SimplePie data={demo.gender} height={210} color={[THEME.primary, THEME.amber]} />
                          </DashboardCard>
                        </Col>
                        <Col xs={24} lg={8}>
                          <DashboardCard title="Farmer Classification">
                            <SimpleBar data={demo.farmer_type} height={210} />
                          </DashboardCard>
                        </Col>
                        <Col xs={24} lg={8}>
                          <DashboardCard title="Household Status">
                            <SimpleBar data={demo.household_head_type} height={210} />
                          </DashboardCard>
                        </Col>
                      </Row>

                      <Row gutter={[16, 16]}>
                        <Col xs={24} lg={10}>
                          <DashboardCard title="Farmers by Zone">
                            <SimpleBar data={(geo.by_zone || []).map(z => ({ label: z.zone, value: z.farmers }))} height={280} />
                          </DashboardCard>
                        </Col>
                        <Col xs={24} lg={14}>
                          <DashboardCard title="Woreda Operational Comparison">
                            <Table
                              dataSource={geo.woreda_performance || []}
                              columns={woredaColumns}
                              rowKey="woreda"
                              pagination={{ pageSize: 5 }}
                              size="small"
                            />
                          </DashboardCard>
                        </Col>
                      </Row>
                    </Space>
                  )
                },
                {
                  key: 'agronomy',
                  label: <span><GoldOutlined /> Agronomy & Crops</span>,
                  children: (
                    <Space direction="vertical" size={20} style={{ width: '100%' }}>
                      <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12} lg={6}>
                          <DashboardCard title="Yield Achievement">
                            <div style={{ textAlign: 'center', padding: '16px 0' }}>
                              <Progress
                                type="dashboard"
                                percent={Math.min(yieldRate, 100)}
                                format={() => `${yieldRate}%`}
                                strokeColor={yieldRate >= 90 ? THEME.primary : THEME.amber}
                              />
                              <div style={{ marginTop: 12, fontSize: 12, color: THEME.inkMuted }}>
                                <div>Expected: <b>{yieldExpected.toLocaleString()} qtl</b></div>
                                <div>Harvested: <b>{yieldActual.toLocaleString()} qtl</b></div>
                              </div>
                            </div>
                          </DashboardCard>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                          <DashboardCard title="Crop Categories">
                            <SimpleBar data={agronomy.crop_category} height={210} />
                          </DashboardCard>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                          <DashboardCard title="Crop Status">
                            <SimpleBar data={agronomy.crop_status} height={210} />
                          </DashboardCard>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                          <DashboardCard title="Land Utilization">
                            <SimplePie data={agronomy.land_use_type} height={210} />
                          </DashboardCard>
                        </Col>
                      </Row>

                      {pest.emergency_alerts > 0 && (
                        <Alert
                          type="error"
                          showIcon
                          message={`${pest.emergency_alerts} Emergency Pest Alert(s) Active`}
                          description="Targeted pest outbreak management protocol is active for impacted sectors."
                          style={{ borderRadius: 10 }}
                        />
                      )}

                      <Row gutter={[16, 16]}>
                        <Col xs={24} md={8}>
                          <DashboardCard title="Surveillance: Pest Agent Type">
                            <SimpleBar data={pest.agent_type} />
                          </DashboardCard>
                        </Col>
                        <Col xs={24} md={8}>
                          <DashboardCard title="Severity Levels">
                            <SimpleBar data={pest.severity_level} color={[THEME.amber, THEME.rose, THEME.danger]} />
                          </DashboardCard>
                        </Col>
                        <Col xs={24} md={8}>
                          <DashboardCard title="Applied Control Methods">
                            <SimpleBar data={pest.control_method} />
                          </DashboardCard>
                        </Col>
                      </Row>
                    </Space>
                  )
                },
                {
                  key: 'nrm',
                  label: <span><BranchesOutlined /> Natural Resources & Forestry</span>,
                  children: (
                    <Space direction="vertical" size={20} style={{ width: '100%' }}>
                      <Row gutter={[16, 16]}>
                        <Col xs={24} md={12}>
                          <DashboardCard title="Watershed Development Stages">
                            <SimpleBar data={nrm.development_stage} />
                          </DashboardCard>
                        </Col>
                        <Col xs={24} md={12}>
                          <DashboardCard title="Treated Intervention Area (ha)">
                            <SimpleBar data={nrm.intervention_area} valueSuffix=" ha" />
                          </DashboardCard>
                        </Col>
                      </Row>

                      <Row gutter={[16, 16]}>
                        <Col xs={24} md={12}>
                          <DashboardCard title="Forestry Security Incidents">
                            <div style={{ display: 'flex', gap: 20, alignItems: 'center', padding: '16px 0' }}>
                              <Statistic title="Patrol Runs" value={kpis.protections.patrolRecords} />
                              <Statistic title="Incidents Detected" value={kpis.protections.incidents} valueStyle={{ color: THEME.danger }} />
                              <Statistic title="Trees Planted" value={kpis.plantations.treesPlanted} precision={0} />
                            </div>
                          </DashboardCard>
                        </Col>
                        <Col xs={24} md={12}>
                          <DashboardCard title="Watershed Score Index">
                            <Row justify="space-around" style={{ paddingTop: 10 }}>
                              <Col style={{ textAlign: 'center' }}>
                                <Progress type="circle" percent={Math.round(nrm.scores?.avg_physical_score || 0)} width={80} strokeColor={THEME.primary} />
                                <div style={{ fontSize: 12, marginTop: 8, color: THEME.inkMuted }}>Physical Score</div>
                              </Col>
                              <Col style={{ textAlign: 'center' }}>
                                <Progress type="circle" percent={Math.round(nrm.scores?.avg_biological_score || 0)} width={80} strokeColor={THEME.sky} />
                                <div style={{ fontSize: 12, marginTop: 8, color: THEME.inkMuted }}>Biological Score</div>
                              </Col>
                            </Row>
                          </DashboardCard>
                        </Col>
                      </Row>
                    </Space>
                  )
                },
                {
                  key: 'extension',
                  label: <span><SolutionOutlined /> Extension & Infrastructure</span>,
                  children: (
                    <Space direction="vertical" size={20} style={{ width: '100%' }}>
                      <Row gutter={[16, 16]}>
                        <Col xs={24} md={8}>
                          <DashboardCard title="Extension Advisory Event Types">
                            <SimpleBar data={extension.event_type} />
                          </DashboardCard>
                        </Col>
                        <Col xs={24} md={8}>
                          <DashboardCard title="Participant Breakdown">
                            <SimpleBar data={[
                              { label: 'Male', value: Number(extension.participation?.male || 0) },
                              { label: 'Female', value: Number(extension.participation?.female || 0) },
                              { label: 'Youth', value: Number(extension.participation?.youth || 0) }
                            ]} />
                          </DashboardCard>
                        </Col>
                        <Col xs={24} md={8}>
                          <DashboardCard title="Extension Events Frequency">
                            <TrendLine data={extension.trend} height={230} color={THEME.primary} />
                          </DashboardCard>
                        </Col>
                      </Row>

                      <Row gutter={[16, 16]}>
                        <Col xs={24} md={8}>
                          <DashboardCard title="FTC Construction Status">
                            <SimpleBar data={infra.construction_status} />
                          </DashboardCard>
                        </Col>
                        <Col xs={24} md={8}>
                          <DashboardCard title="FTC Capacity Levels">
                            <SimpleBar data={infra.capacity_level} />
                          </DashboardCard>
                        </Col>
                        <Col xs={24} md={8}>
                          <DashboardCard title="Financial Position (ETB)">
                            <Space direction="vertical" style={{ width: '100%', paddingTop: 12 }} size={16}>
                              <Statistic title="Savings" value={Number(infra.financials?.savings || 0)} valueStyle={{ color: THEME.primary, fontWeight: 700 }} />
                              <Statistic title="Total Budget Allocated" value={Number(infra.financials?.budget || 0)} />
                            </Space>
                          </DashboardCard>
                        </Col>
                      </Row>
                    </Space>
                  )
                },
                {
                  key: 'social',
                  label: <span><HeartOutlined /> Social Safety Nets</span>,
                  children: (
                    <Row gutter={[16, 16]}>
                      <Col xs={24} md={8}>
                        <DashboardCard title="PSNP Targeting Classification">
                          <SimpleBar data={social.targeting_type} />
                        </DashboardCard>
                      </Col>
                      <Col xs={24} md={8}>
                        <DashboardCard title="Graduation Status">
                          <SimpleBar data={social.graduation} />
                        </DashboardCard>
                      </Col>
                      <Col xs={24} md={8}>
                        <DashboardCard title="Women & Youth Representation">
                          <Space direction="vertical" style={{ width: '100%', paddingTop: 16 }} size={16}>
                            <Statistic title="Women in Leadership" value={Number(social.women_youth?.women_leaders || 0)} valueStyle={{ color: THEME.rose }} />
                            <Statistic title="Youth Agri-Enterprises" value={Number(social.women_youth?.youth_enterprises || 0)} valueStyle={{ color: THEME.amber }} />
                          </Space>
                        </DashboardCard>
                      </Col>
                    </Row>
                  )
                }
              ]}
            />

            {/* ─── MODAL: EXECUTIVE AI SUMMARY ─── */}
            <Modal
              open={isSummaryModalVisible}
              onCancel={() => setIsSummaryModalVisible(false)}
              footer={null}
              width={760}
              centered
              title={
                <Space>
                  <RobotOutlined style={{ color: THEME.primary }} />
                  <span>Executive System Analysis & Insights</span>
                </Space>
              }
            >
              <div style={{ padding: '8px 0' }}>
                <div style={{ marginBottom: 20 }}>
                  <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.4px', fontWeight: 600 }}>
                    System Narrative Insights
                  </Text>
                  {narrative.insights && narrative.insights.length > 0 ? (
                    <Paragraph style={{ marginTop: 8, fontSize: 14.5, lineHeight: 1.75, color: THEME.ink }}>
                      {narrative.insights.join(' ')}
                    </Paragraph>
                  ) : (
                    <Paragraph type="secondary">No specific narrative insights recorded for this filter scope.</Paragraph>
                  )}
                </div>

                {trend && trend.length > 0 && (
                  <div style={{ marginBottom: 24 }}>
                    <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.4px', fontWeight: 600, display: 'block', marginBottom: 12 }}>
                      System Trajectory
                    </Text>
                    <Area
                      data={(trend || []).map(d => ({ month: d.month, total: Number(d.total || 0) }))}
                      xField="month"
                      yField="total"
                      smooth
                      height={180}
                      color={THEME.primary}
                      areaStyle={() => ({ fill: `l(270) 0:${THEME.primaryLight} 1:rgba(255,255,255,0.05)` })}
                    />
                  </div>
                )}

                <div>
                  <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.4px', fontWeight: 600, display: 'block', marginBottom: 12 }}>
                    Action Items & Recommendations
                  </Text>
                  <List
                    dataSource={aiRecommendations}
                    renderItem={item => {
                      const isDanger = item.type === 'danger';
                      const isWarn = item.type === 'warning';
                      const borderCol = isDanger ? THEME.danger : isWarn ? THEME.amber : THEME.primary;
                      const bgCol = isDanger ? '#FEF2F2' : isWarn ? '#FFFBEB' : '#F0FDF4';

                      return (
                        <div style={{
                          padding: '12px 16px',
                          borderRadius: 8,
                          background: bgCol,
                          borderLeft: `3px solid ${borderCol}`,
                          marginBottom: 10,
                          fontSize: 13.5,
                          color: THEME.ink
                        }}>
                          {item.text}
                        </div>
                      );
                    }}
                  />
                </div>
              </div>
            </Modal>

            <div style={{ textAlign: 'center', padding: '24px 0 12px', color: THEME.inkMuted, fontSize: 12 }}>
              IAIMS Analytics System &bull; Integrated Agricultural Information Platform
            </div>
          </>
        )}
      </Skeleton>
    </div>
  );
}