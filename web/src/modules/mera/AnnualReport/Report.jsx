import React, { useEffect, useState } from 'react';
import { 
  Typography, Card, Row, Col, Select, Space, Button, 
  Divider, Statistic, Alert, Drawer, Form, Progress, Collapse, Tag, Table
} from 'antd';
import { 
  FilePdfOutlined, SafetyCertificateOutlined, TeamOutlined, 
  GoldOutlined, BugOutlined, ExperimentOutlined, HeartOutlined, 
  CarOutlined, GlobalOutlined, BankOutlined, CrownOutlined, 
  RiseOutlined, WomanOutlined, FilterOutlined, EnvironmentOutlined, 
  CheckCircleOutlined, ToolOutlined, PlusCircleOutlined,
   BookOutlined, DesktopOutlined, HomeOutlined, LockOutlined, WarningOutlined, DollarOutlined, FlagOutlined
} from '@ant-design/icons';
import { Column, Pie, Bar } from '@ant-design/charts';

// ----- LEAFLET MAP IMPORTS -----
import { MapContainer, TileLayer, Marker, Popup, LayersControl, LayerGroup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Fix for default Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetinaUrl,
  iconUrl: iconUrl,
  shadowUrl: shadowUrl,
});

import { meraApi } from '../../../services/api/meraApi'; 
import api from '../../../services/axios'; 
import { useAuthStore } from '../../../store/authStore'; 
import BrandedLoader from '../../../components/common/BrandedLoader';

const { Title, Text } = Typography;
const { Option } = Select;
const { Panel } = Collapse;
const { BaseLayer } = LayersControl;

// High-Contrast Official Colors
const COLORS = { 
  green: '#1b5e20',  yellow: '#f57f17', red: '#b71c1c',    
  blue: '#0d47a1',   cyan: '#006064',   purple: '#4a148c', 
  teal: '#004d40',   orange: '#e65100', pink: '#880e4f',   
  brown: '#4e342e'
};

// Dynamic Years 2017 to 2030
const ethYears = Array.from({ length: 2030 - 2017 + 1 }, (_, i) => 2017 + i);

// Custom Helper for Government-Style Cards
const getGovCardProps = (color) => ({
  className: "gov-card",
  style: { 
    border: `2px solid ${color}40`, borderTop: `6px solid ${color}`, 
    borderRadius: '8px', height: '100%', backgroundColor: `${color}05`, 
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
  },
  headStyle: { borderBottom: `2px solid ${color}40`, fontWeight: 'bold', color: color, fontSize: '16px' }
});

const SectionHeading = ({ number, amharic, english, color }) => (
  <div style={{ marginTop: 45, marginBottom: 20, borderBottom: `3px solid ${color}`, paddingBottom: 8, display: 'flex', alignItems: 'center' }}>
    <div style={{ backgroundColor: color, color: '#fff', padding: '6px 16px', borderRadius: '4px', fontSize: 22, fontWeight: '900', marginRight: 15 }}>
      {number}
    </div>
    <div>
      <Title level={3} style={{ color: color, margin: 0, fontFamily: "'Nyala', 'Times New Roman', serif" }}>{amharic}</Title>
      <Text type="secondary" style={{ fontSize: 13, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 'bold' }}>{english}</Text>
    </div>
  </div>
);

// Map Legend Item Component
const LegendItem = ({ color, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: '#f8fafc', borderRadius: '20px', border: '1px solid #cbd5e1', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
    <div className="legend-blip" style={{ width: '14px', height: '14px', backgroundColor: color, borderRadius: '50%', border: '2px solid white', boxShadow: `0 0 8px ${color}` }} />
    <Text strong style={{ fontSize: '13px', color: '#334155' }}>{label}</Text>
  </div>
);

// Custom Vibrant Blinking Map Icon Generator
const createBlinkingIcon = (color) => {
  return L.divIcon({
    className: 'custom-blinking-icon',
    html: `<div class="map-pulse-marker" style="background-color: ${color}; box-shadow: 0 0 10px ${color}, 0 0 20px ${color};"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -10]
  });
};

// Robust parser to avoid NaN map errors
const safeNum = (val) => {
  if (val === null || val === undefined || val === '') return null;
  const parsed = parseFloat(val);
  return isNaN(parsed) ? null : parsed;
};

export default function AmharaAnnualReport() {
  const { user } = useAuthStore(); 
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);

  // --- LOCATION STATES ---
  const [zones, setZones] = useState([]);
  const [woredas, setWoredas] = useState([]);
  const [kebeles, setKebeles] = useState([]);

  // --- JURISDICTION LOCKS ---
  const userKebeleId = user?.kebele_id || user?.kebele?.id;
  const userWoredaId = user?.woreda_id || user?.woreda?.id || user?.kebele?.woreda_id;
  const userZoneId = user?.zone_id || user?.zone?.id || user?.woreda?.zone_id || user?.kebele?.woreda?.zone_id;

  const isKebeleUser = Boolean(userKebeleId);
  const isWoredaUser = Boolean(userWoredaId) && !isKebeleUser;
  const isRegionalUser = !isKebeleUser && !isWoredaUser && !Boolean(userZoneId);

  const [globalFilters, setGlobalFilters] = useState({
    year: 2018, approval_status: 'Approved',
    zone_id: userZoneId || null, woreda_id: userWoredaId || null, kebele_id: userKebeleId || null,
  });

  const [filters, setFilters] = useState({
    extension: { gender: null, farmer_type: null, household_head_type: null, literacy_status: null, is_cooperative_member: null, has_disability: null },
    crop: { season: null, crop_category: null, status: null, soil_type: null, slope_category: null },
    horticulture: { farm_type: null, production_system: null, farm_status: null },
    nrm: { development_stage: null, start_year_of_development: null, supporting_program: null },
    irrigation: { technology_type: null, project_phase: null },
    psnp: { targeting_type: null, is_graduated: null },
    livestock: { farm_type: null, production_system: null }
  });

  const updateFilter = (section, key, value) => {
    setFilters(prev => ({ ...prev, [section]: { ...prev[section], [key]: value } }));
  };

  useEffect(() => {
    fetchZones();
    if (userZoneId) fetchWoredas(userZoneId);
    if (userWoredaId) fetchKebeles(userWoredaId);
    fetchReport(); 
    // eslint-disable-next-line
  }, []);

  const fetchZones = async () => { try { const res = await api.get('/zones'); setZones(res.data?.data || []); } catch(e){} };
  const fetchWoredas = async (zId) => { try { const res = await api.get(`/woredas?zone_id=${zId}`); setWoredas(res.data?.data || []); } catch(e){} };
  const fetchKebeles = async (wId) => { try { const res = await api.get(`/kebeles?woreda_id=${wId}`); setKebeles(res.data?.data || []); } catch(e){} };

  const fetchReport = async () => {
    setLoading(true);
    try {
      const payload = { global: globalFilters, ...filters };
      const res = await meraApi.getAnnualReport(payload); 
      setData(res.data?.data || {}); 
      setDrawerVisible(false);
    } catch (error) { console.error(error); setData({}); } 
    finally { setLoading(false); }
  };

  const ext = data?.sec_1_1_extension || {};
  const crop = data?.sec_1_2_crop || {};
  const hort = data?.sec_1_3_horticulture || {};
  const live = data?.sec_1_4_livestock || {};
  const land = data?.sec_1_5_land || {};
  const nut = data?.sec_1_6_nutrition || {};
  const inp = data?.sec_1_7_inputs || {};
  const nrm = data?.sec_1_8_nrm || {};
  const irr = data?.sec_1_9_irrigation || {};
  const psnp = data?.sec_1_10_psnp || {};
  
  const pt2 = data?.part_2 || {};
  const inc = pt2.inclusion || {};
  const wash = pt2.wash || {};
  const mod = pt2.model_villages || {};
  const exp = pt2.experts || {};
  const dig = pt2.digital || {};

  const mapData = data?.spatial_distribution || {};

  const renderMapDebug = () => {
    if (!mapData || Object.keys(mapData).length === 0) return null;
    return (
      <Card size="small" title={<span><ToolOutlined /> Coordinate Raw Output)</span>} style={{ marginBottom: 20, background: '#fffbe6', border: '1px solid #ffe58f' }}>
        <Row gutter={16}>
        {Object.keys(mapData).map(k => (
          <Col span={8} key={k} style={{ marginBottom: 10 }}>
            <strong>{k.toUpperCase()} ({mapData[k]?.length || 0} pts):</strong>
            <div style={{ height: 100, overflowY: 'auto', background: '#333', color: '#0f0', padding: 8, fontFamily: 'monospace', fontSize: 11, borderRadius: 4, marginTop: 4 }}>
              {mapData[k]?.length > 0 ? mapData[k].map((pt, idx) => (<div key={idx}>[{pt.name || 'N/A'}] {pt.lat}, {pt.lng}</div>)) : '[] No Data'}
            </div>
          </Col>
        ))}
        </Row>
      </Card>
    );
  };

  return (
    <div style={{ backgroundColor: '#eef2f5', minHeight: '100vh', padding: '30px 0' }}>
      {loading && <BrandedLoader message="Executing Deep Filters & Generating Executive Report..." />}

      <style>{`
        /* Blinking Map Marker Animation */
        .map-pulse-marker {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 2px solid white;
          animation: mapPing 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        @keyframes mapPing {
          0% { transform: scale(0.8); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.8; }
          100% { transform: scale(0.8); opacity: 1; }
        }
        
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          .gov-card { break-inside: avoid; margin-bottom: 20px; box-shadow: none !important; }
          .report-container { max-width: 100% !important; padding: 0 !important; box-shadow: none !important; }
        }
        .report-container { max-width: 1350px; margin: 0 auto; background: white; padding: 60px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); border-radius: 8px; }
        .ant-statistic-title { font-weight: 600; color: #444; font-size: 14px; }
        .ant-statistic-content-value { font-weight: 900; }
        .leaflet-container { z-index: 1; border-radius: 8px 8px 0 0; }
      `}</style>

      {/* TOP CONTROL BAR */}
      <div className="no-print" style={{ maxWidth: 1350, margin: '0 auto 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={3} style={{ color: COLORS.blue, margin: 0 }}>Executive Reporting Console</Title>
        <Space>
          <Button type="default" size="large" icon={<FilterOutlined />} onClick={() => setDrawerVisible(true)} style={{ borderColor: COLORS.blue, color: COLORS.blue, fontWeight: 'bold' }}>
            Advanced Data Filters
          </Button>
          <Button type="primary" size="large" icon={<FilePdfOutlined />} style={{ background: COLORS.blue }} onClick={() => window.print()}>
            Print Official Report
          </Button>
        </Space>
      </div>

      {/* ADVANCED FILTER DRAWER */}
      <Drawer title={<><FilterOutlined /> Advanced Reporting Engine</>} placement="right" onClose={() => setDrawerVisible(false)} open={drawerVisible} width={450}>
        <Form layout="vertical">
          <Collapse defaultActiveKey={['global']} accordion>
            <Panel header={<Text strong>1. Global Geography & Status</Text>} key="global">
              {!isRegionalUser && <Tag icon={<EnvironmentOutlined />} color="blue" style={{ marginBottom: 15, display: 'block', textAlign: 'center', padding: '5px' }}>Auto-Locked System Boundary</Tag>}
              <Row gutter={8}>
                <Col span={12}><Form.Item label="Year (EC)"><Select value={globalFilters.year} onChange={(v) => setGlobalFilters({...globalFilters, year: v})}>{ethYears.map(y => <Option key={y} value={y}>{y} E.C</Option>)}</Select></Form.Item></Col>
                <Col span={12}><Form.Item label="Status"><Select value={globalFilters.approval_status} onChange={(v) => setGlobalFilters({...globalFilters, approval_status: v})}><Option value="All">All Data</Option><Option value="Approved">Approved Only</Option></Select></Form.Item></Col>
                <Col span={24}><Form.Item label={<span>Zone {!isRegionalUser && <LockOutlined style={{color: '#fa8c16'}}/>}</span>}><Select value={globalFilters.zone_id} disabled={!isRegionalUser} onChange={(v) => {setGlobalFilters({...globalFilters, zone_id: v}); fetchWoredas(v);}} allowClear>{zones.map(z => <Option key={z.id} value={z.id}>{z.name}</Option>)}</Select></Form.Item></Col>
                <Col span={24}><Form.Item label={<span>Woreda {(isWoredaUser || isKebeleUser) && <LockOutlined style={{color: '#fa8c16'}}/>}</span>}><Select value={globalFilters.woreda_id} disabled={isWoredaUser || isKebeleUser} onChange={(v) => {setGlobalFilters({...globalFilters, woreda_id: v}); fetchKebeles(v);}} allowClear>{woredas.map(w => <Option key={w.id} value={w.id}>{w.name}</Option>)}</Select></Form.Item></Col>
                <Col span={24}><Form.Item label={<span>Kebele {isKebeleUser && <LockOutlined style={{color: '#fa8c16'}}/>}</span>}><Select value={globalFilters.kebele_id} disabled={isKebeleUser} onChange={(v) => setGlobalFilters({...globalFilters, kebele_id: v})} allowClear>{kebeles.map(k => <Option key={k.id} value={k.id}>{k.name}</Option>)}</Select></Form.Item></Col>
              </Row>
            </Panel>
            <Panel header={<Text strong>2. Extension & Farmers</Text>} key="ext">
              <Row gutter={[8,8]}>
                <Col span={12}><Select placeholder="Gender" style={{width:'100%'}} onChange={(v) => updateFilter('extension', 'gender', v)} allowClear><Option value="Male">Male</Option><Option value="Female">Female</Option></Select></Col>
                <Col span={12}><Select placeholder="Farmer Type" style={{width:'100%'}} onChange={(v) => updateFilter('extension', 'farmer_type', v)} allowClear><Option value="Model">Model</Option><Option value="Regular">Regular</Option></Select></Col>
                <Col span={12}><Select placeholder="HH Head" style={{width:'100%'}} onChange={(v) => updateFilter('extension', 'household_head_type', v)} allowClear><Option value="Abawora">Abawora</Option><Option value="Emawora">Emawora</Option></Select></Col>
                <Col span={12}><Select placeholder="Disability?" style={{width:'100%'}} onChange={(v) => updateFilter('extension', 'has_disability', v)} allowClear><Option value={1}>Yes</Option><Option value={0}>No</Option></Select></Col>
              </Row>
            </Panel>
            <Panel header={<Text strong>3. Crop Production</Text>} key="crop">
              <Row gutter={[8,8]}>
                <Col span={12}><Select placeholder="Season" style={{width:'100%'}} onChange={(v) => updateFilter('crop', 'season', v)} allowClear><Option value="Meher">Meher</Option><Option value="Belg">Belg</Option></Select></Col>
                <Col span={12}><Select placeholder="Category" style={{width:'100%'}} onChange={(v) => updateFilter('crop', 'crop_category', v)} allowClear><Option value="Cereals">Cereals</Option><Option value="Pulses">Pulses</Option></Select></Col>
                <Col span={12}><Select placeholder="Soil Type" style={{width:'100%'}} onChange={(v) => updateFilter('crop', 'soil_type', v)} allowClear><Option value="Vertisol (Black)">Vertisol</Option><Option value="Nitosol (Red)">Nitosol</Option></Select></Col>
                <Col span={12}><Select placeholder="Slope" style={{width:'100%'}} onChange={(v) => updateFilter('crop', 'slope_category', v)} allowClear><Option value="Flat (0-3%)">Flat</Option><Option value="Steep (>30%)">Steep</Option></Select></Col>
              </Row>
            </Panel>
            <Panel header={<Text strong>4. Horticulture & Livestock</Text>} key="hort_ls">
               <Row gutter={[8,8]}>
                <Col span={12}><Select placeholder="Hort Farm" style={{width:'100%'}} onChange={(v) => updateFilter('horticulture', 'farm_type', v)} allowClear><Option value="vegetable">Vegetable</Option><Option value="fruit">Fruit</Option></Select></Col>
                <Col span={12}><Select placeholder="Live Type" style={{width:'100%'}} onChange={(v) => updateFilter('livestock', 'farm_type', v)} allowClear><Option value="cattle">Cattle</Option><Option value="poultry">Poultry</Option></Select></Col>
                <Col span={12}><Select placeholder="Live Sys" style={{width:'100%'}} onChange={(v) => updateFilter('livestock', 'production_system', v)} allowClear><Option value="intensive">Intensive</Option><Option value="extensive">Extensive</Option></Select></Col>
               </Row>
            </Panel>
            <Panel header={<Text strong>5. NRM & Irrigation</Text>} key="nrm">
               <Row gutter={[8,8]}>
                <Col span={12}><Select placeholder="Dev Stage" style={{width:'100%'}} onChange={(v) => updateFilter('nrm', 'development_stage', v)} allowClear><Option value="Start-up">Start-up</Option><Option value="Maturity">Maturity</Option></Select></Col>
                <Col span={12}><Select placeholder="Program" style={{width:'100%'}} onChange={(v) => updateFilter('nrm', 'supporting_program', v)} allowClear><Option value="PSNP">PSNP</Option><Option value="SLMP">SLMP</Option></Select></Col>
                <Col span={12}><Select placeholder="Irrig Tech" style={{width:'100%'}} onChange={(v) => updateFilter('irrigation', 'technology_type', v)} allowClear><Option value="Modern Canal">Modern Canal</Option><Option value="Pond">Pond</Option></Select></Col>
                <Col span={12}><Select placeholder="Irrig Phase" style={{width:'100%'}} onChange={(v) => updateFilter('irrigation', 'project_phase', v)} allowClear><Option value="Construction">Construction</Option><Option value="Completed">Completed</Option></Select></Col>
               </Row>
            </Panel>
            <Panel header={<Text strong>6. PSNP Targeting</Text>} key="psnp">
               <Row gutter={[8,8]}><Col span={12}><Select placeholder="Targeting" style={{width:'100%'}} onChange={(v) => updateFilter('psnp', 'targeting_type', v)} allowClear><Option value="PW">PW</Option><Option value="PDS">PDS</Option></Select></Col></Row>
            </Panel>
          </Collapse>
          <Button type="primary" block size="large" onClick={fetchReport} style={{ marginTop: 30, background: COLORS.blue }}>Execute Advanced Query</Button>
        </Form>
      </Drawer>

      {!loading && (
        <div className="report-container">
          
          {/* COVER PAGE */}
          <div style={{ textAlign: 'center', marginBottom: 50 }}>
            <img src="/amhara-logo.png" alt="Amhara Logo" style={{ width: 120, marginBottom: 20 }} onError={(e)=> e.target.style.display='none'} />
            <Title level={1} style={{ color: '#000', margin: 0, fontFamily: "'Nyala', 'Times New Roman', serif", fontSize: 46 }}>
              የአማራ ብሔራዊ ክልላዊ መንግስት ግብርና ቢሮ
            </Title>
            <Title level={2} style={{ color: COLORS.blue, marginTop: 10, fontFamily: "'Nyala', 'Times New Roman', serif" }}>
              የ{globalFilters.year} በጀት ዓመት አመታዊ የአፈፃፀም ሪፖርት ማጠቃለያ
            </Title>
            <Text type="secondary" style={{ display: 'block', marginTop: 15, fontSize: 16 }}>
              Official High-Level Performance Report | Status: <b>{globalFilters.approval_status}</b>
            </Text>
            <Divider style={{ borderWidth: 4, borderColor: COLORS.blue }} />
          </div>

          <Alert 
            message={<span style={{ fontWeight: 'bold', fontSize: 18, fontFamily: "'Nyala', 'Times New Roman', serif" }}><RiseOutlined/> ማጠቃለያ (Executive Summary)</span>}
            description={`በ${globalFilters.year} በጀት ዓመት የግብርናው ዘርፍ ለበርካታ ዜጎች የኑሮ መሠረት ከመሆኑ በላይ በክልሉ የኢኮኖሚ ዕድገት ጉልህ አስተዋጽዖ አድርጓል። Based on the verified data applying your filters, exactly ${Number(ext.total_farmers || 0).toLocaleString()} farmers were successfully targeted. Crop yield outputs reached ${Number(crop.total_yield_qt || 0).toLocaleString()} Quintals across ${Number((crop.cultivated_meher_ha + crop.cultivated_belg_ha) || 0).toLocaleString()} hectares.`}
            type="info" showIcon
            style={{ backgroundColor: `${COLORS.blue}10`, border: `2px solid ${COLORS.blue}`, marginBottom: 50, padding: 20 }}
          />

          <Title level={2} style={{ fontFamily: "'Nyala', 'Times New Roman', serif", borderBottom: '2px solid #aaa', paddingBottom: 10 }}>ክፍል አንድ፡ ዋና ዋና የግብርና ዘርፍ ተግባራት (Part One: Core Agriculture)</Title>

          <SectionHeading number="1.1" amharic="የግብርና ኤክስቴንሽን ኮሙዩኒኬሽን" english="Agricultural Extension & Communication" color={COLORS.blue} />
          <Row gutter={[24, 24]}>
            <Col span={6}><Card {...getGovCardProps(COLORS.blue)}><Statistic title="ጠቅላላ አርሶ አደር (Total Farmers)" value={ext.total_farmers || 0} prefix={<TeamOutlined/>} /></Card></Col>
            <Col span={6}><Card {...getGovCardProps(COLORS.blue)}><Statistic title="ሞዴል አርሶ አደር (Model Farmers)" value={ext.model_farmers || 0} prefix={<CheckCircleOutlined/>}/></Card></Col>
            <Col span={6}><Card {...getGovCardProps(COLORS.blue)}><Statistic title="የልማት ቡድን (Dev Teams)" value={ext.dev_teams || 0} prefix={<GlobalOutlined/>}/></Card></Col>
            <Col span={6}><Card {...getGovCardProps(COLORS.blue)}><Statistic title="ህብረት ስራ ማህበር (Active Coops)" value={ext.cooperatives_active || 0} prefix={<BankOutlined/>}/></Card></Col>
            
            <Col span={12}>
              <Card {...getGovCardProps(COLORS.teal)} title="የአ/አደር ማሰልጠኛ ተቋም (FTC Status)">
                 <Row gutter={16}>
                    <Col span={12}>
                       <Statistic title="Completed" value={ext.ftc_completed || 0} valueStyle={{color: COLORS.teal, fontSize: 30}} />
                       <Statistic title="Under Construction" value={ext.ftc_under_const || 0} style={{marginTop: 10}} />
                    </Col>
                    <Col span={12}>
                       {ext.ftc_status?.length > 0 && <Pie data={ext.ftc_status} angleField="count" colorField="status" height={150} innerRadius={0.6}/>}
                    </Col>
                 </Row>
              </Card>
            </Col>
            <Col span={12}>
               <Card {...getGovCardProps(COLORS.teal)} title="የፋይናንስ እንቅስቃሴ (Financial Output - ETB)">
                  <Row gutter={16}>
                     <Col span={12}><Statistic title="Cooperative Capital" value={ext.coop_capital || 0} precision={2} prefix={<DollarOutlined/>} valueStyle={{color: COLORS.teal}} /></Col>
                     <Col span={12}><Statistic title="FTC Savings" value={ext.ftc_savings || 0} precision={2} prefix={<DollarOutlined/>} /></Col>
                  </Row>
               </Card>
            </Col>
          </Row>

          <SectionHeading number="1.2" amharic="የሰብል ልማትና ጥበቃ" english="Crop Production & Protection" color={COLORS.yellow} />
          <Row gutter={[24, 24]}>
            <Col span={16}>
              <Card {...getGovCardProps(COLORS.yellow)} title="የሰብል ምርት (Crop Yield by Category - Quintals & Ha)">
                {crop.crop_by_category?.length > 0 ? (
                   <Column data={crop.crop_by_category.flatMap(c => [{ cat: c.category, metric: 'Area (Ha)', val: Number(c.total_area)}, { cat: c.category, metric: 'Yield (Qt)', val: Number(c.yield)}])} isGroup={true} xField="cat" yField="val" seriesField="metric" height={260} color={[COLORS.yellow, COLORS.blue]} />
                ) : <Text type="secondary">No Yield Data matching filters</Text>}
              </Card>
            </Col>
            <Col span={8}>
              <Row gutter={[0, 24]}>
                  <Col span={24}><Card {...getGovCardProps(COLORS.red)}><Statistic title="የምርት ብክነት (Post Harvest Loss - Qt)" value={crop.post_harvest_loss_qt || 0} precision={2} prefix={<WarningOutlined/>} valueStyle={{ color: COLORS.red }} /></Card></Col>
                  <Col span={24}><Card {...getGovCardProps(COLORS.orange)}><Statistic title="የተባይ መከላከል (Treated Pest Area - Ha)" value={crop.pest_treated_ha || 0} precision={2} prefix={<BugOutlined/>} valueStyle={{ color: COLORS.orange }} /></Card></Col>
              </Row>
            </Col>
          </Row>

          <SectionHeading number="1.3" amharic="የሆርቲካልቸር ልማት" english="Horticulture Development" color={COLORS.green} />
          <Row gutter={[24, 24]}>
             <Col span={8}><Card {...getGovCardProps(COLORS.green)}><Statistic title="ጠቅላላ ማሳ (Total Area - Ha)" value={hort.total_area_ha || 0} precision={2} /><Divider/><Statistic title="የችግኝ ጣቢያዎች (Nurseries)" value={hort.total_nurseries || 0} /></Card></Col>
             <Col span={8}><Card {...getGovCardProps(COLORS.green)} title="Farm Categories">{hort.farm_types?.length > 0 ? <Pie data={hort.farm_types} angleField="area" colorField="type" height={150} /> : <Text>No Data</Text>}</Card></Col>
             <Col span={8}><Card {...getGovCardProps(COLORS.green)}><Statistic title="የተዘጋጀ ችግኝ (Seedlings Produced)" value={hort.seedlings_produced || 0} valueStyle={{ color: COLORS.green }}/></Card></Col>
          </Row>

          <SectionHeading number="1.4" amharic="የእንስሳት ሃብት ልማት" english="Livestock Development" color={COLORS.teal} />
          <Row gutter={[24, 24]}>
             <Col span={6}><Card {...getGovCardProps(COLORS.teal)}><Statistic title="ዘመናዊ እርባታ (Modern Farms)" value={live.total_modern_farms || 0} prefix={<BankOutlined/>} /></Card></Col>
             <Col span={6}><Card {...getGovCardProps(COLORS.teal)}><Statistic title="የቀንድ ከብት (Cattle)" value={live.total_cattle || 0} /></Card></Col>
             <Col span={6}><Card {...getGovCardProps(COLORS.teal)}><Statistic title="በግ እና ፍየል (Shoats)" value={live.total_shoats || 0} /></Card></Col>
             <Col span={6}><Card {...getGovCardProps(COLORS.teal)}><Statistic title="የዶሮ ሀብት (Poultry)" value={live.total_poultry || 0} /></Card></Col>
          </Row>

          <SectionHeading number="1.5" amharic="የመሬት አስተዳደርና አጠቃቀም" english="Land Parcels & Administration" color={COLORS.brown} />
          <Row gutter={[24, 24]}>
             <Col span={8}>
               <Card {...getGovCardProps(COLORS.brown)}>
                 <Statistic title="ጠቅላላ ማሳ (Total Registered Parcels)" value={land.total_parcels || 0} prefix={<FlagOutlined />} valueStyle={{ color: COLORS.brown, fontSize: 32 }} />
                 <Divider />
                 <Statistic title="የመሬት ስፋት (Total Area - Ha)" value={land.total_parcel_area || 0} precision={2} />
               </Card>
             </Col>
             <Col span={8}><Card {...getGovCardProps(COLORS.brown)} title="Land Use Categories">{land.land_uses?.length > 0 ? <Pie data={land.land_uses} angleField="count" colorField="type" height={160} innerRadius={0.5}/> : <Text>No Data</Text>}</Card></Col>
             <Col span={8}><Card {...getGovCardProps(COLORS.brown)} title="Soil Types">{land.soil_types?.length > 0 ? <Pie data={land.soil_types} angleField="count" colorField="type" height={160} innerRadius={0.5}/> : <Text>No Data</Text>}</Card></Col>
          </Row>

          <SectionHeading number="1.6" amharic="የምግብና ሥርዓተ - ምግብ" english="Nutrition & Food Systems" color={COLORS.orange} />
          <Row gutter={[24, 24]}>
            <Col span={12}><Card {...getGovCardProps(COLORS.orange)}><Statistic title="የጓሮ አትክልት አልሚዎች (Backyard Farming)" value={nut.backyard_farming || 0} prefix={<HeartOutlined />} valueStyle={{ fontSize: 32, color: COLORS.orange }} /></Card></Col>
            <Col span={12}>
                <Card {...getGovCardProps(COLORS.orange)} title="የተመጣጠነ ምግብ አቅርቦት (Dietary Adequacy - DDS ≥ 4)">
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Progress type="circle" percent={nut.total_assessed > 0 ? Math.round((nut.high_dds / nut.total_assessed) * 100) : 0} strokeColor={COLORS.orange} />
                        <div style={{ marginLeft: 30 }}><Statistic title="Secure Diet Households" value={nut.high_dds || 0} valueStyle={{ fontWeight: 'bold' }} /></div>
                    </div>
                </Card>
            </Col>
          </Row>

          <SectionHeading number="1.7" amharic="የግብርና ግብዓት አቅርቦትና ሜካናይዜሽን" english="Inputs & Mechanization" color={COLORS.cyan} />
          <Row gutter={[24, 24]}>
            <Col span={12}>
               <Card {...getGovCardProps(COLORS.cyan)} title="ግብዓት (Agricultural Inputs)">
                  <Row><Col span={12}><Statistic title="ማዳበሪያ (Fertilizer - Kg)" value={inp.fertilizer_kg || 0} precision={2} valueStyle={{color: COLORS.cyan}} /></Col>
                       <Col span={12}><Statistic title="ምርጥ ዘር (Seeds - Kg)" value={inp.seeds_kg || 0} precision={2} valueStyle={{color: COLORS.cyan}} /></Col></Row>
               </Card>
            </Col>
            <Col span={12}>
               <Card {...getGovCardProps(COLORS.cyan)} title="ሜካናይዜሽን (Mechanization)">
                  <Row><Col span={12}><Statistic title="ትራክተር (Tractors)" value={inp.tractors || 0} prefix={<CarOutlined />} /></Col>
                       <Col span={12}><Statistic title="ሞተር (Pumps)" value={inp.water_pumps || 0} prefix={<ToolOutlined />} /></Col></Row>
               </Card>
            </Col>
          </Row>

          <SectionHeading number="1.8" amharic="የተፈጥሮ ሃብት ልማት ጥበቃና አጠቃቀም" english="Natural Resource Management & Forestry" color={COLORS.green} />
          <Row gutter={[24, 24]}>
             <Col span={8}><Card {...getGovCardProps(COLORS.green)}><Statistic title="ተፋሰሶች (Watersheds)" value={nrm.total_watersheds || 0} prefix={<EnvironmentOutlined/>}/></Card></Col>
             <Col span={8}><Card {...getGovCardProps(COLORS.green)}><Statistic title="ከእንስሳት ንክኪ ነፃ (Free Grazing - Ha)" value={nrm.free_grazing_ha || 0} precision={2} valueStyle={{color: COLORS.green}} /></Card></Col>
             <Col span={8}><Card {...getGovCardProps(COLORS.green)}><Statistic title="ፊዚካል ስራ (Physical Works - Ha)" value={nrm.physical_treated_ha || 0} precision={2} /></Card></Col>
          </Row>

          <SectionHeading number="1.9" amharic="የመስኖ ልማት አፈጻጸም" english="Irrigation & Drainage Performance" color={COLORS.blue} />
          <Row gutter={[24, 24]}>
             <Col span={8}><Card {...getGovCardProps(COLORS.blue)}><Statistic title="ጠቅላላ ፕሮጀክቶች (Total Projects)" value={irr.total_projects || 0} valueStyle={{ fontSize: 36, color: COLORS.blue }} /></Card></Col>
             <Col span={8}><Card {...getGovCardProps(COLORS.blue)}><Statistic title="የሚለማ መሬት (Command Area - Ha)" value={irr.command_area_ha || 0} precision={2} /></Card></Col>
             <Col span={8}><Card {...getGovCardProps(COLORS.blue)}><Statistic title="ተጠቃሚዎች (Beneficiaries)" value={irr.beneficiaries || 0} /></Card></Col>
          </Row>

          <SectionHeading number="1.10" amharic="ምግብ ዋስትና ፕሮግራም (PSNP)" english="Productive Safety Net Programme" color={COLORS.yellow} />
          <Row gutter={[24, 24]}>
            <Col span={12}><Card {...getGovCardProps(COLORS.yellow)}><Statistic title="ተጠቃሚ ቤተሰብ (Enrolled Households)" value={psnp.total_households || 0} prefix={<TeamOutlined/>} /></Card></Col>
            <Col span={12}><Card {...getGovCardProps(COLORS.yellow)}><Statistic title="የተመረቁ (Graduated)" value={psnp.graduated || 0} prefix={<CrownOutlined/>} valueStyle={{ color: COLORS.yellow }}/></Card></Col>
          </Row>

          <Title level={2} style={{ fontFamily: "'Nyala', 'Times New Roman', serif", borderBottom: '2px solid #aaa', paddingBottom: 10, marginTop: 70 }}>ክፍል ሁለት፡ ሌሎች ተግባራት (Part Two)</Title>
          
          <SectionHeading number="2.1" amharic="የሴቶች፣ ወጣቶችና አካል ጉዳተኞች ማካተት" english="Women, Youth & Disability Inclusion" color={COLORS.purple} />
          <Row gutter={[24, 24]}>
             <Col span={8}><Card {...getGovCardProps(COLORS.purple)}><Statistic title="ሴቶች በአመራር (Women in Leadership)" value={inc.women_in_leadership || 0} prefix={<WomanOutlined />} valueStyle={{color: COLORS.purple}}/></Card></Col>
             <Col span={8}><Card {...getGovCardProps(COLORS.purple)}><Statistic title="ወጣት አርሶ አደሮች (Youth Farmers ≤35)" value={inc.youth_farmers || 0} prefix={<PlusCircleOutlined />} /></Card></Col>
             <Col span={8}><Card {...getGovCardProps(COLORS.purple)}><Statistic title="አካል ጉዳተኛ አርሶ አደሮች (Disabled Farmers)" value={inc.disabled_farmers || 0} prefix={<SafetyCertificateOutlined />} /></Card></Col>
          </Row>

          <SectionHeading number="2.2" amharic="የውሃ፣ ንፅህና እና ጤና አጠባበቅ (WASH)" english="Water, Sanitation & Hygiene Profiles" color={COLORS.cyan} />
          <Row gutter={[24, 24]}>
             <Col span={8}><Card {...getGovCardProps(COLORS.cyan)}><Statistic title="ንፁህ ውሃ አቅርቦት (Safe Water Access)" value={wash.year_round_water || 0} prefix={<CheckCircleOutlined />} valueStyle={{color: COLORS.cyan}}/></Card></Col>
             <Col span={8}><Card {...getGovCardProps(COLORS.cyan)}><Statistic title="ከግልጽ ውዳጅ ነፃ (ODF Compliant Latrines)" value={wash.odf_certified_latrines || 0} prefix={<EnvironmentOutlined />} /></Card></Col>
             <Col span={8}><Card {...getGovCardProps(COLORS.cyan)}><Statistic title="የእጅ መታጠቢያ (Handwashing Facilities)" value={wash.handwashing_facilities || 0} prefix={<HeartOutlined />} /></Card></Col>
          </Row>

          <SectionHeading number="2.3" amharic="የሞዴል መንደሮችና ማህበረሰብ ግንባታ" english="Model Villages & Community Development" color={COLORS.pink} />
          <Row gutter={[24, 24]}>
             <Col span={8}><Card {...getGovCardProps(COLORS.pink)}><Statistic title="የተረጋገጡ ሞዴል መንደሮች (Certified Villages)" value={mod.total_model_villages || 0} prefix={<HomeOutlined />} valueStyle={{color: COLORS.pink}}/></Card></Col>
             <Col span={8}><Card {...getGovCardProps(COLORS.pink)}><Statistic title="መንደር ተጠቃሚ (Households in Models)" value={mod.total_households_in_models || 0} prefix={<TeamOutlined />} /></Card></Col>
             <Col span={8}><Card {...getGovCardProps(COLORS.pink)}><Statistic title="የጤና መድህን ሽፋን (CBHI Coverage %)" value={mod.cbhi_coverage_avg || 0} precision={2} suffix="%" prefix={<HeartOutlined />} /></Card></Col>
          </Row>

          <SectionHeading number="2.4" amharic="የግብርና ባለሙያዎችና ስልጠና" english="Agricultural Experts & Field Trainings" color={COLORS.blue} />
          <Row gutter={[24, 24]}>
             <Col span={6}><Card {...getGovCardProps(COLORS.blue)}><Statistic title="ጠቅላላ ባለሙያዎች (Total Experts)" value={exp.total_experts || 0} prefix={<TeamOutlined />} valueStyle={{color: COLORS.blue}}/></Card></Col>
             <Col span={6}><Card {...getGovCardProps(COLORS.blue)}><Statistic title="ዲግሪና ከዚያ በላይ (Degree Holders)" value={exp.degree_holders || 0} prefix={<BookOutlined />} /></Card></Col>
             <Col span={6}><Card {...getGovCardProps(COLORS.blue)}><Statistic title="የስልጠና መድረኮች (Training Events)" value={exp.total_training_events || 0} prefix={<CheckCircleOutlined />} /></Card></Col>
             <Col span={6}><Card {...getGovCardProps(COLORS.blue)}><Statistic title="ሰልጣኞች (Total Participants)" value={exp.total_participants || 0} prefix={<TeamOutlined />} /></Card></Col>
          </Row>

          <SectionHeading number="2.5" amharic="የዲጂታል ግብርና ስርዓትና መረጃ (IAIMS)" english="Digital Agriculture & System Usage" color={COLORS.teal} />
          <Row gutter={[24, 24]}>
             <Col span={8}><Card {...getGovCardProps(COLORS.teal)}><Statistic title="ንቁ የስርዓት ተጠቃሚ (Active System Users)" value={dig.active_system_users || 0} prefix={<DesktopOutlined />} valueStyle={{color: COLORS.teal}}/></Card></Col>
             <Col span={8}><Card {...getGovCardProps(COLORS.teal)}><Statistic title="ሲስተም ኦዲት (Total Audit Logs)" value={dig.total_audit_logs || 0} prefix={<SafetyCertificateOutlined />} /></Card></Col>
             <Col span={8}><Card {...getGovCardProps(COLORS.teal)}><Statistic title="ምላሽ ያገኘ ግብረመልስ (Resolved Feedback)" value={dig.feedbacks_resolved || 0} prefix={<CheckCircleOutlined />} /></Card></Col>
          </Row>

          {/* 3.0 SPATIAL MAP */}
          <SectionHeading number="3.0" amharic="የጂኦስፓሻል ስርጭት ማፕ" english="Geospatial Distribution Map" color={COLORS.teal} />
          
          <div className="no-print">{renderMapDebug()}</div>

          <Card {...getGovCardProps(COLORS.teal)} style={{...getGovCardProps(COLORS.teal).style, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column'}}>
             <div style={{ height: '550px', width: '100%', position: 'relative' }}>
                <MapContainer center={[11.587, 37.39]} zoom={7} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                   
                   <LayersControl position="topright">
                      <BaseLayer checked name="Google Satellite">
                        <TileLayer url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" maxZoom={20} />
                      </BaseLayer>
                      <BaseLayer name="Google Street Map">
                        <TileLayer url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}" maxZoom={20} />
                      </BaseLayer>

                      <LayersControl.Overlay checked name="Farmer Training Centers (FTC)">
                         <LayerGroup>
                           {mapData.ftcs?.map((pt, i) => {
                               const lat = safeNum(pt.lat); const lng = safeNum(pt.lng);
                               if (lat === null || lng === null) return null;
                               return (<Marker key={`ftc-${i}`} position={[lat, lng]} icon={createBlinkingIcon(COLORS.blue)}><Popup><b>FTC:</b> {pt.name}</Popup></Marker>);
                           })}
                         </LayerGroup>
                      </LayersControl.Overlay>
                      
                      <LayersControl.Overlay checked name="Land Parcels">
                         <LayerGroup>
                           {mapData.land_parcels?.map((pt, i) => {
                               const lat = safeNum(pt.lat); const lng = safeNum(pt.lng);
                               if (lat === null || lng === null) return null;
                               return (<Marker key={`land-${i}`} position={[lat, lng]} icon={createBlinkingIcon(COLORS.brown)}><Popup><b>Parcel ID:</b> {pt.name}<br/><b>Type:</b> {pt.type}</Popup></Marker>);
                           })}
                         </LayerGroup>
                      </LayersControl.Overlay>

                      <LayersControl.Overlay checked name="Irrigation Projects">
                         <LayerGroup>
                           {mapData.irrigation?.map((pt, i) => {
                               const lat = safeNum(pt.lat); const lng = safeNum(pt.lng);
                               if (lat === null || lng === null) return null;
                               return (<Marker key={`irr-${i}`} position={[lat, lng]} icon={createBlinkingIcon(COLORS.cyan)}><Popup><b>Irrigation:</b> {pt.name}</Popup></Marker>);
                           })}
                         </LayerGroup>
                      </LayersControl.Overlay>

                      <LayersControl.Overlay checked name="Crop Registrations">
                         <LayerGroup>
                           {mapData.crops?.map((pt, i) => {
                               const lat = safeNum(pt.lat); const lng = safeNum(pt.lng);
                               if (lat === null || lng === null) return null;
                               return (<Marker key={`crop-${i}`} position={[lat, lng]} icon={createBlinkingIcon(COLORS.yellow)}><Popup><b>Crop:</b> {pt.name}<br/><b>Variety:</b> {pt.type}</Popup></Marker>);
                           })}
                         </LayerGroup>
                      </LayersControl.Overlay>

                      <LayersControl.Overlay checked name="Horticulture Farms">
                         <LayerGroup>
                           {mapData.horticulture?.map((pt, i) => {
                               const lat = safeNum(pt.lat); const lng = safeNum(pt.lng);
                               if (lat === null || lng === null) return null;
                               return (<Marker key={`hort-${i}`} position={[lat, lng]} icon={createBlinkingIcon(COLORS.orange)}><Popup><b>Horticulture:</b> {pt.name}<br/><b>Type:</b> {pt.type}</Popup></Marker>);
                           })}
                         </LayerGroup>
                      </LayersControl.Overlay>

                      <LayersControl.Overlay checked name="Livestock Farms">
                         <LayerGroup>
                           {mapData.livestock?.map((pt, i) => {
                               const lat = safeNum(pt.lat); const lng = safeNum(pt.lng);
                               if (lat === null || lng === null) return null;
                               return (<Marker key={`live-${i}`} position={[lat, lng]} icon={createBlinkingIcon(COLORS.red)}><Popup><b>Livestock:</b> {pt.name}<br/><b>Type:</b> {pt.type}</Popup></Marker>);
                           })}
                         </LayerGroup>
                      </LayersControl.Overlay>

                      <LayersControl.Overlay checked name="Watershed Developments">
                         <LayerGroup>
                           {mapData.watersheds?.map((pt, i) => {
                               const lat = safeNum(pt.lat); const lng = safeNum(pt.lng);
                               if (lat === null || lng === null) return null;
                               return (<Marker key={`water-${i}`} position={[lat, lng]} icon={createBlinkingIcon(COLORS.green)}><Popup><b>Watershed:</b> {pt.name}</Popup></Marker>);
                           })}
                         </LayerGroup>
                      </LayersControl.Overlay>
                   </LayersControl>
                </MapContainer>
             </div>
             
             {/* MAP LEGEND (FOOTER OF CARD) */}
             <div style={{ padding: '16px 24px', background: '#ffffff', borderTop: '2px solid #e2e8f0', display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center' }}>
                <LegendItem color={COLORS.blue} label="Farmer Training Centers (FTC)" />
                <LegendItem color={COLORS.brown} label="Land Parcels" />
                <LegendItem color={COLORS.cyan} label="Irrigation Projects" />
                <LegendItem color={COLORS.yellow} label="Crop Registrations" />
                <LegendItem color={COLORS.orange} label="Horticulture Farms" />
                <LegendItem color={COLORS.red} label="Livestock Farms" />
                <LegendItem color={COLORS.green} label="Watershed Developments" />
             </div>
          </Card>

          <div style={{ textAlign: 'center', marginTop: 80, paddingTop: 30, borderTop: `3px double #ccc` }}>
            <Text type="secondary" style={{ fontSize: 14, fontFamily: "'Nyala', 'Times New Roman', serif" }}>
              ሪፖርቱ የተመነጨው በኤሌክትሮኒክ የግብርና መረጃ አስተዳደር ስርዓት (IAIMS) ነው | Data Captured: {new Date().toLocaleDateString()} <br/>
              <b>የአማራ ብሔራዊ ክልላዊ መንግስት ግብርና ቢሮ - ባህርዳር (Amhara Regional Bureau of Agriculture - Bahir Dar)</b>
            </Text>
          </div>

        </div>
      )}
    </div>
  );
}