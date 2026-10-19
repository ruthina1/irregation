import React, { useState, useMemo } from 'react';
import {
  Card,
  Row,
  Col,
  Table,
  Tag,
  Select,
  Button,
  Typography,
  Space,
  Input,
  Descriptions,
  Badge,
  Tooltip,
  Progress,
  Segmented
} from 'antd';
import {
  SearchOutlined,
  DownloadOutlined,
  ReloadOutlined,
  EnvironmentOutlined,
  CompassOutlined,
  EyeOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

// Production Hydrological & GIS Spatial Dataset
const ENRICHED_WATERSHED_METRICS = [
  {
    id: 'WS-FOG-01',
    code: 'WS-FOG-01',
    name: 'የሪብ ወንዝ ተፋሰስ (Ribb River Catchment)',
    basin: 'አባይ ተፋሰስ (Abbay / Blue Nile)',
    sub_basin: 'ጣና ንዑስ ተፋሰስ (Lake Tana Basin)',
    zone: 'ደቡብ ጎንደር',
    woreda: 'ፎገራ',
    kebele: 'ወረታ ዙሪያ',
    year: 2018,
    total_area_ha: 1680,
    status: 'existing',
    physical_planned_km: 42.0,
    physical_actual_km: 45.2,
    runoff_excavation_m3: 6800,
    closure_area_ha: 310,
    farmer_participants: 1030,
    maturity_stage: 'Scaling-up (በመስፋፋት ላይ)',
    stream_order: 4,
    drainage_density_km_km2: 2.45,
    mean_slope_pct: 18.5,
    elevation_range_m: { min: 1790, max: 2420, mean: 1980 },
    sediment_yield_reduction_pct: 42.8,
    gis_centroid: { lat: 11.9214, lng: 37.6231, accuracy_m: 4.2 }
  },
  {
    id: 'WS-DER-02',
    code: 'WS-DER-02',
    name: 'ጉማራ ተፋሰስ (Gumara Headwaters)',
    basin: 'አባይ ተፋሰስ (Abbay / Blue Nile)',
    sub_basin: 'ጣና ንዑስ ተፋሰስ (Lake Tana Basin)',
    zone: 'ደቡብ ጎንደር',
    woreda: 'ደራ',
    kebele: 'አንበሳሜ',
    year: 2018,
    total_area_ha: 1240,
    status: 'new',
    physical_planned_km: 28.5,
    physical_actual_km: 26.8,
    runoff_excavation_m3: 4850,
    closure_area_ha: 215,
    farmer_participants: 795,
    maturity_stage: 'Treatment (በልማት ላይ)',
    stream_order: 3,
    drainage_density_km_km2: 2.18,
    mean_slope_pct: 24.2,
    elevation_range_m: { min: 1810, max: 2680, mean: 2210 },
    sediment_yield_reduction_pct: 35.4,
    gis_centroid: { lat: 11.7342, lng: 37.5819, accuracy_m: 5.1 }
  },
  {
    id: 'WS-BS-01',
    code: 'WS-BS-01',
    name: 'የጫጫ ወንዝ ተፋሰስ (Chacha Catchment)',
    basin: 'አባይ ተፋሰስ (Abbay / Blue Nile)',
    sub_basin: 'ጀማ ንዑስ ተፋሰስ (Jemma Sub-Basin)',
    zone: 'ሰሜን ሸዋ',
    woreda: 'ባሶና ወራና',
    kebele: 'ጎሼ ባዶ',
    year: 2018,
    total_area_ha: 1950,
    status: 'existing',
    physical_planned_km: 55.0,
    physical_actual_km: 60.5,
    runoff_excavation_m3: 9000,
    closure_area_ha: 420,
    farmer_participants: 1180,
    maturity_stage: 'Consolidation (በማጠናከር ላይ)',
    stream_order: 5,
    drainage_density_km_km2: 3.12,
    mean_slope_pct: 22.0,
    elevation_range_m: { min: 2620, max: 3340, mean: 2950 },
    sediment_yield_reduction_pct: 54.0,
    gis_centroid: { lat: 9.6841, lng: 39.5312, accuracy_m: 3.8 }
  },
  {
    id: 'WS-LEG-03',
    code: 'WS-LEG-03',
    name: 'ቦርከና ተፋሰስ (Borkena Gorge Catchment)',
    basin: 'አዋሽ ተፋሰስ (Awash River Basin)',
    sub_basin: 'የላይኛው አዋሽ (Upper Awash Catchment)',
    zone: 'ደቡብ ወሎ',
    woreda: 'ቃሉ',
    kebele: 'ኮምቦልቻ ዙሪያ',
    year: 2018,
    total_area_ha: 1100,
    status: 'new',
    physical_planned_km: 30.0,
    physical_actual_km: 27.2,
    runoff_excavation_m3: 4400,
    closure_area_ha: 185,
    farmer_participants: 720,
    maturity_stage: 'Treatment (በልማት ላይ)',
    stream_order: 3,
    drainage_density_km_km2: 2.85,
    mean_slope_pct: 31.4,
    elevation_range_m: { min: 1450, max: 2180, mean: 1780 },
    sediment_yield_reduction_pct: 31.8,
    gis_centroid: { lat: 11.0821, lng: 39.7412, accuracy_m: 6.0 }
  },
  {
    id: 'WS-MECH-01',
    code: 'WS-MECH-01',
    name: 'ኮጋ ግድብ ተፋሰስ (Koga Dam Catchment)',
    basin: 'አባይ ተፋሰስ (Abbay / Blue Nile)',
    sub_basin: 'ጣና ንዑስ ተፋሰስ (Lake Tana Basin)',
    zone: 'ምዕራብ ጎጃም',
    woreda: 'መቻ',
    kebele: 'ቁድሚ',
    year: 2018,
    total_area_ha: 2150,
    status: 'existing',
    physical_planned_km: 62.0,
    physical_actual_km: 67.4,
    runoff_excavation_m3: 10000,
    closure_area_ha: 490,
    farmer_participants: 1290,
    maturity_stage: 'Consolidation (በማጠናከር ላይ)',
    stream_order: 4,
    drainage_density_km_km2: 2.76,
    mean_slope_pct: 14.8,
    elevation_range_m: { min: 1870, max: 2360, mean: 2050 },
    sediment_yield_reduction_pct: 58.2,
    gis_centroid: { lat: 11.4128, lng: 37.1542, accuracy_m: 3.5 }
  },
  {
    id: 'WS-TEK-01',
    code: 'WS-TEK-01',
    name: 'ተከዜ ማስተር ተፋሰስ (Tekeze Headwaters)',
    basin: 'ተከዜ ተፋሰስ (Tekeze River Basin)',
    sub_basin: 'ስሜን ወሎ ተከዜ (North Wollo Gorge)',
    zone: 'ሰሜን ወሎ',
    woreda: 'ላሊበላ ዙሪያ',
    kebele: 'አሸተን',
    year: 2018,
    total_area_ha: 1420,
    status: 'existing',
    physical_planned_km: 38.0,
    physical_actual_km: 39.4,
    runoff_excavation_m3: 5600,
    closure_area_ha: 260,
    farmer_participants: 840,
    maturity_stage: 'Scaling-up (በመስፋፋት ላይ)',
    stream_order: 4,
    drainage_density_km_km2: 3.40,
    mean_slope_pct: 38.6,
    elevation_range_m: { min: 2100, max: 3450, mean: 2750 },
    sediment_yield_reduction_pct: 46.5,
    gis_centroid: { lat: 12.0345, lng: 39.0418, accuracy_m: 4.8 }
  }
];

// Spatial Extents (Amhara Region Bounding Box for SVG projection)
const GEO_BOUNDS = {
  minLat: 9.3,
  maxLat: 13.0,
  minLng: 36.5,
  maxLng: 40.2
};

export default function WatershedDashboard() {
  const [records] = useState(ENRICHED_WATERSHED_METRICS);

  // Filters
  const [selectedYear, setSelectedYear] = useState(2018);
  const [selectedBasin, setSelectedBasin] = useState('ALL');
  const [selectedZone, setSelectedZone] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Cartography Layer Display State
  const [mapTheme, setMapTheme] = useState('terrain');
  const [showContours, setShowContours] = useState(true);
  const [showStreams, setShowStreams] = useState(true);
  const [inspectorTab, setInspectorTab] = useState('hydrology');

  // Currently Focused Catchment
  const [activeCatchment, setActiveCatchment] = useState(ENRICHED_WATERSHED_METRICS[0]);

  // Clean JavaScript projection function (no type annotations)
  const projectGeoToSvg = (lat, lng) => {
    const width = 800;
    const height = 480;
    const x = ((lng - GEO_BOUNDS.minLng) / (GEO_BOUNDS.maxLng - GEO_BOUNDS.minLng)) * width;
    const y = ((GEO_BOUNDS.maxLat - lat) / (GEO_BOUNDS.maxLat - GEO_BOUNDS.minLat)) * height;
    return {
      x: Math.max(20, Math.min(width - 20, x)),
      y: Math.max(20, Math.min(height - 20, y))
    };
  };

  const availableYears = useMemo(() => {
    return Array.from(new Set(records.map((r) => r.year).filter(Boolean))).sort((a, b) => b - a);
  }, [records]);

  const basins = useMemo(() => Array.from(new Set(records.map((r) => r.basin).filter(Boolean))), [records]);
  const zones = useMemo(() => Array.from(new Set(records.map((r) => r.zone).filter(Boolean))), [records]);

  const filteredData = useMemo(() => {
    return records.filter((r) => {
      const matchSearch =
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.sub_basin.toLowerCase().includes(searchQuery.toLowerCase());

      const matchYear = selectedYear === 'ALL' || Number(r.year) === Number(selectedYear);
      const matchBasin = selectedBasin === 'ALL' || r.basin === selectedBasin;
      const matchZone = selectedZone === 'ALL' || r.zone === selectedZone;

      return matchSearch && matchYear && matchBasin && matchZone;
    });
  }, [records, searchQuery, selectedYear, selectedBasin, selectedZone]);

  useMemo(() => {
    if (filteredData.length > 0 && !filteredData.find((r) => r.id === activeCatchment.id)) {
      setActiveCatchment(filteredData[0]);
    }
  }, [filteredData, activeCatchment]);

  // Aggregate Metrics
  const stats = useMemo(() => {
    const totalWatersheds = filteredData.length;
    let totalAreaHa = 0;
    let totalPlanKm = 0;
    let totalAchKm = 0;
    let sumDrainageDensity = 0;
    let sumSlope = 0;

    filteredData.forEach((r) => {
      totalAreaHa += Number(r.total_area_ha) || 0;
      totalPlanKm += Number(r.physical_planned_km) || 0;
      totalAchKm += Number(r.physical_actual_km) || 0;
      sumDrainageDensity += Number(r.drainage_density_km_km2) || 0;
      sumSlope += Number(r.mean_slope_pct) || 0;
    });

    return {
      totalWatersheds,
      totalAreaHa,
      executionRate: totalPlanKm > 0 ? Math.round((totalAchKm / totalPlanKm) * 100) : 0,
      totalPlanKm,
      totalAchKm,
      avgDrainageDensity: totalWatersheds > 0 ? (sumDrainageDensity / totalWatersheds).toFixed(2) : '0.00',
      avgSlope: totalWatersheds > 0 ? (sumSlope / totalWatersheds).toFixed(1) : '0.0'
    };
  }, [filteredData]);

  const handleExportCSV = () => {
    if (!filteredData.length) return;
    const headers = [
      'Code', 'Watershed_Name', 'Basin', 'Sub_Basin', 'Zone', 'Woreda', 'Kebele',
      'Area_Ha', 'Physical_Plan_KM', 'Physical_Actual_KM', 'Stream_Order',
      'Drainage_Density', 'Slope_Pct', 'Lat', 'Lng'
    ];
    const rows = filteredData.map((r) => [
      `"${r.code}"`, `"${r.name}"`, `"${r.basin}"`, `"${r.sub_basin}"`,
      `"${r.zone}"`, `"${r.woreda}"`, `"${r.kebele}"`, r.total_area_ha,
      r.physical_planned_km, r.physical_actual_km, r.stream_order,
      r.drainage_density_km_km2, r.mean_slope_pct, r.gis_centroid.lat, r.gis_centroid.lng
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `GIS_Watershed_Registry_${dayjs().format('YYYY-MM-DD')}.csv`;
    link.click();
  };

  const columns = [
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      width: 110,
      render: (t) => <Text style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0F2D1F' }}>{t}</Text>
    },
    {
      title: 'የተፋሰስ ስም እና አስተዳደራዊ ወረዳ (Catchment & Hierarchy)',
      key: 'name',
      render: (_, r) => (
        <div>
          <Text strong style={{ fontSize: '13px', color: '#14211A', display: 'block' }}>{r.name}</Text>
          <div style={{ fontSize: '11px', color: '#566B60', marginTop: '1px' }}>
            <span style={{ fontWeight: 600, color: '#1B6A45' }}>{r.basin}</span> › {r.sub_basin}
          </div>
          <div style={{ fontSize: '10px', color: '#8A9991' }}>
            {r.zone} › {r.woreda} › {r.kebele}
          </div>
        </div>
      )
    },
    {
      title: 'ስፋት (Ha)',
      dataIndex: 'total_area_ha',
      key: 'total_area_ha',
      width: 105,
      align: 'right',
      render: (val) => <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{Number(val).toLocaleString()}</span>
    },
    {
      title: 'Strahler Order',
      dataIndex: 'stream_order',
      key: 'stream_order',
      width: 115,
      align: 'center',
      render: (order) => (
        <Tag style={{ background: '#E6F4EA', color: '#137333', border: '1px solid #CEEAD6', fontWeight: 700, borderRadius: '4px' }}>
          Order {order}
        </Tag>
      )
    },
    {
      title: 'GIS Centroid Coordinates',
      key: 'gis',
      width: 180,
      render: (_, r) => (
        <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#44534B' }}>
          {r.gis_centroid.lat.toFixed(4)}°N, {r.gis_centroid.lng.toFixed(4)}°E
        </span>
      )
    },
    {
      title: 'የእርከን አፈፃፀም',
      key: 'progress',
      width: 160,
      render: (_, r) => {
        const rate = r.physical_planned_km > 0 ? Math.round((r.physical_actual_km / r.physical_planned_km) * 100) : 0;
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '2px' }}>
              <span>{r.physical_actual_km}/{r.physical_planned_km} km</span>
              <strong>{rate}%</strong>
            </div>
            <Progress
              percent={rate}
              size="small"
              showInfo={false}
              strokeColor={rate >= 100 ? '#1B6A45' : '#D9822B'}
              trailColor="#E5ECE7"
            />
          </div>
        );
      }
    },
    {
      title: 'መርምር',
      key: 'action',
      width: 80,
      align: 'center',
      render: (_, r) => (
        <Button
          size="small"
          type={activeCatchment.id === r.id ? 'primary' : 'default'}
          icon={<EyeOutlined />}
          style={{
            background: activeCatchment.id === r.id ? '#0F2D1F' : 'transparent',
            borderColor: activeCatchment.id === r.id ? '#0F2D1F' : '#D1DDD6'
          }}
          onClick={() => setActiveCatchment(r)}
        />
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: '#F4F7F5', minHeight: '100vh', padding: '16px' }}>

      {/* Top Header Card */}
      <Card
        bordered={false}
        style={{
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #091D14 0%, #0F2D1F 50%, #153F2B 100%)',
          color: '#ffffff',
          boxShadow: '0 4px 20px rgba(9, 29, 20, 0.15)'
        }}
        bodyStyle={{ padding: '20px 24px' }}
      >
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} md={16}>
            <Space direction="vertical" size={2}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#7BE4A8', fontSize: '11px', letterSpacing: '1.2px', textTransform: 'uppercase', fontWeight: 700 }}>
                  የአማራ ብሔራዊ ክልላዊ መንግሥት ግብርና ቢሮ · የሃይድሮሎጂ እና ጂ.አይ.ኤስ ክፍል
                </span>
                <Tag style={{ background: 'rgba(255,255,255,0.12)', color: '#D4F5E2', border: 'none', fontSize: '10px' }}>
                  WGS84 EPSG:4326
                </Tag>
              </div>
              <Title level={3} style={{ color: '#ffffff', margin: 0, fontWeight: 700 }}>
                የተፋሰስ መረጃ እና ጂኦ-ስፓሻል ካርታ (Catchment Spatial Topology)
              </Title>
              <Text style={{ color: '#B7D5C5', fontSize: '13px' }}>
                Hydrological catchments across Abbay, Tekeze, and Awash Basins with real GPS centroid tracking.
              </Text>
            </Space>
          </Col>
          <Col xs={24} md={8} style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleExportCSV}
              style={{
                background: 'rgba(255,255,255,0.15)',
                borderColor: 'rgba(255,255,255,0.25)',
                color: '#fff',
                fontWeight: 600
              }}
            >
              Export GIS Dataset
            </Button>
          </Col>
        </Row>
      </Card>

      {/* KPI Stats Strip */}
      <Row gutter={[12, 12]}>
        {[
          { label: 'የተመዘገቡ ተፋሰሶች', val: stats.totalWatersheds, unit: 'ተፋሰሶች', sub: `ጠቅላላ ስፋት: ${stats.totalAreaHa.toLocaleString()} Ha` },
          { label: 'አማካይ የፍሳሽ ጥግግት', val: stats.avgDrainageDensity, unit: 'km/km²', sub: 'Drainage Density Metric' },
          { label: 'አማካይ የመሬት አቀበት', val: `${stats.avgSlope}%`, unit: 'Slope', sub: 'Regional Terrestrial Relief' },
          { label: 'አጠቃላይ የእርከን ክንውን', val: `${stats.executionRate}%`, unit: '', sub: `${stats.totalAchKm.toFixed(1)} / ${stats.totalPlanKm.toFixed(1)} km ተጠናቋል` }
        ].map((item, idx) => (
          <Col key={idx} xs={12} sm={6}>
            <Card bordered={false} style={{ borderRadius: '10px', border: '1px solid #E1E9E4', background: '#ffffff' }} bodyStyle={{ padding: '16px' }}>
              <Text type="secondary" style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.4px' }}>
                {item.label}
              </Text>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F2D1F', marginTop: '2px', fontVariantNumeric: 'tabular-nums' }}>
                {item.val} <span style={{ fontSize: '12px', fontWeight: 500, color: '#73837A' }}>{item.unit}</span>
              </div>
              <div style={{ marginTop: '4px', fontSize: '11px', color: '#566B60' }}>
                {item.sub}
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Filter Ribbon */}
      <Card bordered={false} style={{ borderRadius: '10px', border: '1px solid #E1E9E4', background: '#ffffff' }} bodyStyle={{ padding: '12px 16px' }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={8} md={6}>
            <Input
              prefix={<SearchOutlined style={{ color: '#8A9991' }} />}
              placeholder="በተፋሰስ፣ ኮድ ወይም ንዑስ ተፋሰስ ፈልግ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} sm={5} md={5}>
            <Select style={{ width: '100%' }} value={selectedBasin} onChange={setSelectedBasin}>
              <Option value="ALL">ሁሉም ዋና ተፋሰሶች (All Basins)</Option>
              {basins.map((b) => <Option key={b} value={b}>{b}</Option>)}
            </Select>
          </Col>
          <Col xs={12} sm={5} md={4}>
            <Select style={{ width: '100%' }} value={selectedZone} onChange={setSelectedZone}>
              <Option value="ALL">ሁሉም ዞኖች (All Zones)</Option>
              {zones.map((z) => <Option key={z} value={z}>{z}</Option>)}
            </Select>
          </Col>
          <Col xs={12} sm={4} md={4}>
            <Select style={{ width: '100%' }} value={selectedYear} onChange={setSelectedYear}>
              <Option value="ALL">ሁሉም ዓመታት</Option>
              {availableYears.map((yr) => <Option key={yr} value={yr}>{yr} ዓ.ም</Option>)}
            </Select>
          </Col>
          <Col xs={12} sm={2} md={5} style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                setSearchQuery('');
                setSelectedYear(2018);
                setSelectedBasin('ALL');
                setSelectedZone('ALL');
              }}
            >
              አድስ
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Cartographic GIS Map & Detailed Inspector */}
      <Row gutter={[16, 16]}>
        
        {/* Left: GIS Map Viewport */}
        <Col xs={24} lg={15}>
          <Card
            bordered={false}
            style={{ borderRadius: '12px', border: '1px solid #E1E9E4', background: '#ffffff', overflow: 'hidden' }}
            title={
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 0' }}>
                <Space>
                  <EnvironmentOutlined style={{ color: '#1B6A45' }} />
                  <span style={{ fontWeight: 700, color: '#0F2D1F', fontSize: '14px' }}>
                    Regional Watershed Cartography (Amhara Highlands)
                  </span>
                </Space>
                <Space size="small">
                  <Segmented
                    size="small"
                    value={mapTheme}
                    onChange={(val) => setMapTheme(val)}
                    options={[
                      { label: 'Relief Terrain', value: 'terrain' },
                      { label: 'Base Vector', value: 'vector' }
                    ]}
                  />
                  <Button
                    size="small"
                    type={showStreams ? 'primary' : 'default'}
                    onClick={() => setShowStreams(!showStreams)}
                    style={{ fontSize: '11px', background: showStreams ? '#0F2D1F' : 'transparent' }}
                  >
                    Streams
                  </Button>
                  <Button
                    size="small"
                    type={showContours ? 'primary' : 'default'}
                    onClick={() => setShowContours(!showContours)}
                    style={{ fontSize: '11px', background: showContours ? '#0F2D1F' : 'transparent' }}
                  >
                    Contours
                  </Button>
                </Space>
              </div>
            }
          >
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '460px',
                borderRadius: '8px',
                overflow: 'hidden',
                background: mapTheme === 'terrain' ? '#EDF4EE' : '#FAFCFA',
                border: '1px solid #D6E3DB'
              }}
            >
              <svg width="100%" height="100%" viewBox="0 0 800 480" preserveAspectRatio="none" style={{ position: 'absolute', top: 0, left: 0 }}>
                <defs>
                  <pattern id="gisGrid" width="80" height="80" patternUnits="userSpaceOnUse">
                    <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#D1DDD6" strokeWidth="0.6" strokeDasharray="2 4" />
                  </pattern>

                  <radialGradient id="tanaWater" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#8AC6F0" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#4A90E2" stopOpacity="0.9" />
                  </radialGradient>

                  <linearGradient id="plateauShade" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#C9DEC9" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#9EBE9E" stopOpacity="0.5" />
                  </linearGradient>
                </defs>

                <rect width="800" height="480" fill="url(#gisGrid)" />

                {mapTheme === 'terrain' && (
                  <path
                    d="M 120 480 C 180 320, 260 210, 480 180 C 650 160, 750 80, 800 50 L 800 480 Z"
                    fill="url(#plateauShade)"
                  />
                )}

                {/* Lake Tana GIS Geometry */}
                <path
                  d="M 160 210 C 150 150, 220 120, 270 140 C 330 160, 310 240, 260 270 C 200 290, 170 260, 160 210 Z"
                  fill="url(#tanaWater)"
                  stroke="#357ABD"
                  strokeWidth="1.5"
                />
                <text x="200" y="205" fill="#1C538A" fontSize="12" fontWeight="700" letterSpacing="0.5">ጣና ሐይቅ (Lake Tana)</text>
                <text x="210" y="222" fill="#2E6B9E" fontSize="9">1,788 m a.s.l</text>

                {/* Drainage Channels */}
                {showStreams && (
                  <g stroke="#2C7BE5" strokeLinecap="round" opacity="0.85">
                    <path d="M 235 285 Q 245 350 280 480" fill="none" strokeWidth="3" />
                    <text x="288" y="420" fill="#1C538A" fontSize="11" fontWeight="700">Abbay (Blue Nile) ↓</text>

                    <path d="M 390 170 Q 300 175 275 180" fill="none" strokeWidth="1.6" strokeDasharray="4 2" />
                    <text x="340" y="165" fill="#2C7BE5" fontSize="10" fontWeight="600">Ribb River</text>

                    <path d="M 370 240 Q 300 235 270 230" fill="none" strokeWidth="1.6" strokeDasharray="4 2" />
                    <text x="330" y="252" fill="#2C7BE5" fontSize="10" fontWeight="600">Gumara River</text>

                    <path d="M 680 70 Q 560 90 480 60" fill="none" strokeWidth="1.8" />
                    <text x="560" y="75" fill="#2C7BE5" fontSize="10" fontWeight="600">Tekeze Basin →</text>
                  </g>
                )}

                {/* Contours */}
                {showContours && (
                  <g stroke="#26734D" strokeWidth="1" strokeDasharray="3 3" opacity="0.5">
                    <path d="M 320 80 Q 500 50 780 70" fill="none" />
                    <text x="700" y="65" fill="#26734D" fontSize="9">3,000 m</text>
                    <path d="M 350 290 Q 520 270 760 320" fill="none" />
                    <text x="680" y="315" fill="#26734D" fontSize="9">2,400 m</text>
                  </g>
                )}

                <text x="20" y="24" fill="#8A9991" fontSize="10" fontFamily="monospace">13°00'N</text>
                <text x="20" y="465" fill="#8A9991" fontSize="10" fontFamily="monospace">09°30'N</text>
                <text x="740" y="465" fill="#8A9991" fontSize="10" fontFamily="monospace">40°00'E</text>
                <text x="60" y="465" fill="#8A9991" fontSize="10" fontFamily="monospace">36°30'E</text>
              </svg>

              {/* Centroid Coordinate Pins */}
              {filteredData.map((ws) => {
                const pos = projectGeoToSvg(ws.gis_centroid.lat, ws.gis_centroid.lng);
                const isSelected = activeCatchment.id === ws.id;

                return (
                  <div
                    key={ws.id}
                    onClick={() => setActiveCatchment(ws)}
                    style={{
                      position: 'absolute',
                      left: `${pos.x}px`,
                      top: `${pos.y}px`,
                      transform: 'translate(-50%, -100%)',
                      cursor: 'pointer',
                      zIndex: isSelected ? 20 : 5,
                      transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                    }}
                  >
                    <Tooltip
                      title={
                        <div style={{ fontSize: '11px', lineHeight: 1.4 }}>
                          <strong style={{ display: 'block' }}>{ws.name}</strong>
                          <span>{ws.code} · Order {ws.stream_order}</span>
                          <div style={{ color: '#A0D8B3', fontFamily: 'monospace', marginTop: '2px' }}>
                            {ws.gis_centroid.lat.toFixed(4)}°N, {ws.gis_centroid.lng.toFixed(4)}°E
                          </div>
                        </div>
                      }
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div
                          style={{
                            background: isSelected ? '#0F2D1F' : (ws.status === 'existing' ? '#1B6A45' : '#C47214'),
                            color: '#ffffff',
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontSize: '10px',
                            fontWeight: 700,
                            letterSpacing: '0.3px',
                            boxShadow: isSelected ? '0 0 0 4px rgba(27, 106, 69, 0.35)' : '0 2px 6px rgba(0,0,0,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          <EnvironmentOutlined style={{ fontSize: '10px' }} />
                          <span>{ws.code}</span>
                        </div>
                        <div
                          style={{
                            width: 0,
                            height: 0,
                            borderLeft: '5px solid transparent',
                            borderRight: '5px solid transparent',
                            borderTop: `6px solid ${isSelected ? '#0F2D1F' : (ws.status === 'existing' ? '#1B6A45' : '#C47214')}`
                          }}
                        />
                      </div>
                    </Tooltip>
                  </div>
                );
              })}

              {/* Compass Rose */}
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'rgba(255,255,255,0.92)',
                  backdropFilter: 'blur(4px)',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #D6E3DB',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <CompassOutlined style={{ fontSize: '20px', color: '#0F2D1F' }} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '11px', color: '#0F2D1F', lineHeight: 1 }}>N ↑</div>
                  <div style={{ fontSize: '9px', color: '#6A7D74', marginTop: '2px' }}>EPSG:4326</div>
                </div>
              </div>

              {/* Map Legend Bar */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '12px',
                  background: 'rgba(255,255,255,0.92)',
                  backdropFilter: 'blur(4px)',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: '1px solid #D6E3DB',
                  fontSize: '11px',
                  display: 'flex',
                  gap: '14px',
                  alignItems: 'center',
                  fontWeight: 600
                }}
              >
                <span><Badge color="#1B6A45" /> ነባር (Existing)</span>
                <span><Badge color="#C47214" /> አዲስ (New)</span>
                <span style={{ color: '#2C7BE5' }}>≋ Hydrography</span>
              </div>
            </div>
          </Card>
        </Col>

        {/* Right: Detailed Watershed Inspector */}
        <Col xs={24} lg={9}>
          <Card
            bordered={false}
            style={{ borderRadius: '12px', border: '1px solid #E1E9E4', height: '100%', background: '#ffffff' }}
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: '#0F2D1F', fontSize: '14px' }}>የተፋሰስ ዝርዝር መረጃ (Catchment Inspector)</span>
                <Tag color={activeCatchment.status === 'existing' ? 'green' : 'orange'} style={{ borderRadius: '4px', fontWeight: 600 }}>
                  {activeCatchment.status === 'existing' ? 'ነባር ተፋሰስ' : 'አዲስ ተፋሰስ'}
                </Tag>
              </div>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <Text strong style={{ fontSize: '15px', color: '#14211A', display: 'block' }}>
                  {activeCatchment.name}
                </Text>
                <Text type="secondary" style={{ fontSize: '11px' }}>
                  መለያ ኮድ: <strong style={{ color: '#0F2D1F' }}>{activeCatchment.code}</strong> | {activeCatchment.year} ዓ.ም በጀት
                </Text>
              </div>

              {/* Inspector Mode Selector */}
              <Segmented
                block
                value={inspectorTab}
                onChange={setInspectorTab}
                options={[
                  { label: 'Hydrology', value: 'hydrology' },
                  { label: 'Spatial GIS', value: 'gis' },
                  { label: 'SWC Status', value: 'swc' }
                ]}
                style={{ background: '#EEF3F0', fontWeight: 600 }}
              />

              {inspectorTab === 'hydrology' && (
                <Descriptions size="small" column={1} bordered>
                  <Descriptions.Item label="ዋና ተፋሰስ (Basin)">
                    <strong style={{ color: '#1B6A45' }}>{activeCatchment.basin}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="ንዑስ ተፋሰስ (Sub-Basin)">
                    {activeCatchment.sub_basin}
                  </Descriptions.Item>
                  <Descriptions.Item label="የወንዝ ደረጃ (Strahler)">
                    <Tag color="green">Stream Order {activeCatchment.stream_order}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="የፍሳሽ ጥግግት">
                    {activeCatchment.drainage_density_km_km2} km/km²
                  </Descriptions.Item>
                  <Descriptions.Item label="የመሸርሸር ቅነሳ">
                    <span style={{ color: '#1B6A45', fontWeight: 700 }}>
                      {activeCatchment.sediment_yield_reduction_pct}% Sediment Yield Reduction
                    </span>
                  </Descriptions.Item>
                </Descriptions>
              )}

              {inspectorTab === 'gis' && (
                <Descriptions size="small" column={1} bordered>
                  <Descriptions.Item label="Centroid Latitude">
                    <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{activeCatchment.gis_centroid.lat.toFixed(5)}° N</span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Centroid Longitude">
                    <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{activeCatchment.gis_centroid.lng.toFixed(5)}° E</span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Elevation Profile">
                    {activeCatchment.elevation_range_m.min}m – {activeCatchment.elevation_range_m.max}m (Mean: {activeCatchment.elevation_range_m.mean}m)
                  </Descriptions.Item>
                  <Descriptions.Item label="አማካይ አቀበት (Mean Slope)">
                    {activeCatchment.mean_slope_pct}%
                  </Descriptions.Item>
                  <Descriptions.Item label="GPS Position Precision">
                    ±{activeCatchment.gis_centroid.accuracy_m} meters accuracy
                  </Descriptions.Item>
                </Descriptions>
              )}

              {inspectorTab === 'swc' && (
                <Descriptions size="small" column={1} bordered>
                  <Descriptions.Item label="የእርከን ዕቅድ / ክንውን">
                    {activeCatchment.physical_actual_km} km / {activeCatchment.physical_planned_km} km
                  </Descriptions.Item>
                  <Descriptions.Item label="የቦይ ቁፋሮ (Runoff Excavation)">
                    {activeCatchment.runoff_excavation_m3.toLocaleString()} m³
                  </Descriptions.Item>
                  <Descriptions.Item label="ከንክኪ የተከለለ ስፋት">
                    {activeCatchment.closure_area_ha} ሄክታር (Ha)
                  </Descriptions.Item>
                  <Descriptions.Item label="ተሳታፊ አርሶ አደሮች">
                    {activeCatchment.farmer_participants.toLocaleString()} አርሶ አደሮች
                  </Descriptions.Item>
                  <Descriptions.Item label="የተፋሰስ የእድገት ደረጃ">
                    {activeCatchment.maturity_stage}
                  </Descriptions.Item>
                </Descriptions>
              )}

              {/* Progress Summary */}
              <div style={{ marginTop: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                  <Text type="secondary">የፊዚካል ስራዎች አፈፃፀም ምጣኔ:</Text>
                  <strong style={{ color: '#1B6A45' }}>
                    {Math.round((activeCatchment.physical_actual_km / activeCatchment.physical_planned_km) * 100)}%
                  </strong>
                </div>
                <Progress
                  percent={Math.round((activeCatchment.physical_actual_km / activeCatchment.physical_planned_km) * 100)}
                  strokeColor="#1B6A45"
                  trailColor="#E5ECE7"
                />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Primary Data Registry Table */}
      <Card bordered={false} style={{ borderRadius: '12px', border: '1px solid #E1E9E4', background: '#ffffff' }}>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          size="middle"
          scroll={{ x: 1050 }}
          pagination={{
            pageSize: 6,
            showSizeChanger: true,
            pageSizeOptions: ['6', '12', '24'],
            showTotal: (total) => `ጠቅላላ ${total} ተፋሰሶች ተመዝግበዋል`
          }}
        />
      </Card>

    </div>
  );
}