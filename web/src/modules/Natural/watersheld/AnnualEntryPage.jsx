import React, { useState, useMemo } from 'react';
import {
  Card,
  Table,
  Row,
  Col,
  Button,
  Tag,
  Space,
  Typography,
  Select,
  Input,
  Statistic,
  Progress,
  Tooltip,
  Modal,
  Descriptions,
  Form,
  InputNumber,
  Steps,
  message
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  SearchOutlined,
  FileDoneOutlined,
  DownloadOutlined,
  ReloadOutlined,
  RightOutlined,
  LeftOutlined,
  CheckOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

// ───── AMHARA CAMPAIGN RETURNS SEED DATA ─────
const INITIAL_AMHARA_CAMPAIGNS = [
  {
    id: 'AMH-CMP-01',
    code: 'WS-FOG-01',
    name: 'Ribb River Sub-Catchment (የሪብ ወንዝ ተፋሰስ)',
    region: 'Amhara',
    zone: 'South Gondar (ደቡብ ጎንደር)',
    woreda: 'Fogera (ፎገራ)',
    kebele: 'Woreta Zuria (ወረታ ዙሪያ)',
    status: 'existing',
    start_year: 2024,
    total_area_ha: 1680,
    supporting_program: 'CALM / MoA',
    labor_male: 540,
    labor_female: 490,
    trained_farmers: 38,
    soil_bunds_km: 24.5,
    fanya_juu_km: 16.2,
    bund_upgrades_km: 8.5,
    hillside_terraces_km: 18.0,
    bench_terraces_km: 7.5,
    cutoff_drains_m3: 4200,
    waterways_m3: 2600,
    check_dams_m3: 1150,
    area_closure_ha: 310,
    trenches_count: 1200,
    micro_basins_count: 2400,
    weed_water_hyacinth_ha: 34.5,
    weed_lantana_camara_ha: 6.2
  },
  {
    id: 'AMH-CMP-02',
    code: 'WS-DER-02',
    name: 'Gumara Headwaters (ጉማራ ተፋሰስ)',
    region: 'Amhara',
    zone: 'South Gondar (ደቡብ ጎንደር)',
    woreda: 'Dera (ደራ)',
    kebele: 'Anbesame (አንበሳሜ)',
    status: 'new',
    start_year: 2025,
    total_area_ha: 1240,
    supporting_program: 'RLLP',
    labor_male: 410,
    labor_female: 385,
    trained_farmers: 29,
    soil_bunds_km: 14.8,
    fanya_juu_km: 9.4,
    bund_upgrades_km: 4.2,
    hillside_terraces_km: 12.6,
    bench_terraces_km: 4.8,
    cutoff_drains_m3: 3100,
    waterways_m3: 1750,
    check_dams_m3: 820,
    area_closure_ha: 215,
    trenches_count: 850,
    micro_basins_count: 1700,
    weed_water_hyacinth_ha: 18.2,
    weed_lantana_camara_ha: 4.1
  },
  {
    id: 'AMH-CMP-03',
    code: 'WS-BS-01',
    name: 'Chacha River Highland Tefases (የጫጫ ወንዝ ተፋሰስ)',
    region: 'Amhara',
    zone: 'North Shewa (ሰሜን ሸዋ)',
    woreda: 'Basona Werana (ባሶና ወራና)',
    kebele: 'Goshe Bado (ጎሼ ባዶ)',
    status: 'existing',
    start_year: 2024,
    total_area_ha: 1950,
    supporting_program: 'SLMP-II',
    labor_male: 620,
    labor_female: 560,
    trained_farmers: 52,
    soil_bunds_km: 31.0,
    fanya_juu_km: 18.5,
    bund_upgrades_km: 11.0,
    hillside_terraces_km: 26.4,
    bench_terraces_km: 11.2,
    cutoff_drains_m3: 5600,
    waterways_m3: 3400,
    check_dams_m3: 1640,
    area_closure_ha: 420,
    trenches_count: 1900,
    micro_basins_count: 3600,
    weed_water_hyacinth_ha: 0.0,
    weed_lantana_camara_ha: 11.8
  },
  {
    id: 'AMH-CMP-04',
    code: 'WS-LEG-03',
    name: 'Borkena Gorge Catchment (ቦርከና ተፋሰስ)',
    region: 'Amhara',
    zone: 'South Wollo (ደቡብ ወሎ)',
    woreda: 'Kalu (ቃሉ)',
    kebele: 'Kombolcha Zuria (ኮምቦልቻ ዙሪያ)',
    status: 'new',
    start_year: 2025,
    total_area_ha: 1100,
    supporting_program: 'Regular Budget',
    labor_male: 380,
    labor_female: 340,
    trained_farmers: 24,
    soil_bunds_km: 16.2,
    fanya_juu_km: 11.0,
    bund_upgrades_km: 5.5,
    hillside_terraces_km: 15.1,
    bench_terraces_km: 6.4,
    cutoff_drains_m3: 2900,
    waterways_m3: 1500,
    check_dams_m3: 940,
    area_closure_ha: 185,
    trenches_count: 750,
    micro_basins_count: 1400,
    weed_water_hyacinth_ha: 0.0,
    weed_lantana_camara_ha: 14.5
  },
  {
    id: 'AMH-CMP-05',
    code: 'WS-MECH-01',
    name: 'Koga Dam Buffer Watershed (ኮጋ ግድብ ተፋሰስ)',
    region: 'Amhara',
    zone: 'West Gojjam (ምዕራብ ጎጃም)',
    woreda: 'Mecha (መቻ)',
    kebele: 'Kudmi (ቁድሚ)',
    status: 'existing',
    start_year: 2026,
    total_area_ha: 2150,
    supporting_program: 'CALM',
    labor_male: 680,
    labor_female: 610,
    trained_farmers: 46,
    soil_bunds_km: 36.4,
    fanya_juu_km: 22.1,
    bund_upgrades_km: 12.4,
    hillside_terraces_km: 19.8,
    bench_terraces_km: 8.9,
    cutoff_drains_m3: 6100,
    waterways_m3: 3900,
    check_dams_m3: 1380,
    area_closure_ha: 490,
    trenches_count: 2200,
    micro_basins_count: 4100,
    weed_water_hyacinth_ha: 42.0,
    weed_lantana_camara_ha: 3.8
  }
];

export default function AnnualEntryPage() {
  const [records, setRecords] = useState(INITIAL_AMHARA_CAMPAIGNS);

  // Filter states
  const [selectedZone, setSelectedZone] = useState('ALL');
  const [selectedWoreda, setSelectedWoreda] = useState('ALL');
  const [selectedYear, setSelectedYear] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [inspectRecord, setInspectRecord] = useState(null);
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();

  // Dynamic dropdown options
  const zones = useMemo(() => {
    return Array.from(new Set(records.map((r) => r.zone).filter(Boolean)));
  }, [records]);

  const woredas = useMemo(() => {
    const list = selectedZone === 'ALL' ? records : records.filter((r) => r.zone === selectedZone);
    return Array.from(new Set(list.map((r) => r.woreda).filter(Boolean)));
  }, [records, selectedZone]);

  const years = useMemo(() => {
    return Array.from(new Set(records.map((r) => r.start_year).filter(Boolean))).sort((a, b) => b - a);
  }, [records]);

  const handleZoneChange = (zone) => {
    setSelectedZone(zone);
    setSelectedWoreda('ALL');
  };

  // Aggregate stats
  const campaignStats = useMemo(() => {
    const totalEntries = records.length;
    const totalTerracingKm = records.reduce(
      (acc, r) => acc + (r.soil_bunds_km || 0) + (r.fanya_juu_km || 0) + (r.hillside_terraces_km || 0),
      0
    );
    const totalEarthworkM3 = records.reduce(
      (acc, r) => acc + (r.cutoff_drains_m3 || 0) + (r.waterways_m3 || 0) + (r.check_dams_m3 || 0),
      0
    );
    const totalLabor = records.reduce(
      (acc, r) => acc + (r.labor_male || 0) + (r.labor_female || 0),
      0
    );

    return { totalEntries, totalTerracingKm, totalEarthworkM3, totalLabor };
  }, [records]);

  // Filtered data
  const filteredData = useMemo(() => {
    return records.filter((rec) => {
      const matchSearch =
        rec.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.kebele.toLowerCase().includes(searchQuery.toLowerCase());
      const matchZone = selectedZone === 'ALL' || rec.zone === selectedZone;
      const matchWoreda = selectedWoreda === 'ALL' || rec.woreda === selectedWoreda;
      const matchYear = selectedYear === 'ALL' || String(rec.start_year) === String(selectedYear);

      return matchSearch && matchZone && matchWoreda && matchYear;
    });
  }, [records, searchQuery, selectedZone, selectedWoreda, selectedYear]);

  // Step field lists for validation
  const stepFields = [
    ['name', 'code', 'zone', 'woreda', 'kebele', 'status', 'total_area_ha', 'start_year'],
    ['labor_male', 'labor_female', 'trained_farmers'],
    ['soil_bunds_km', 'fanya_juu_km', 'bund_upgrades_km', 'cutoff_drains_m3', 'waterways_m3', 'check_dams_m3', 'area_closure_ha', 'weed_water_hyacinth_ha', 'weed_lantana_camara_ha']
  ];

  const handleNextStep = async () => {
    try {
      await form.validateFields(stepFields[currentStep]);
      setCurrentStep((prev) => prev + 1);
    } catch {
      message.warning('Please complete the required fields in this step before proceeding.');
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  // Modal controls
  const openCreateModal = () => {
    setEditingRecord(null);
    setCurrentStep(0);
    form.resetFields();
    form.setFieldsValue({
      zone: selectedZone !== 'ALL' ? selectedZone : 'South Gondar (ደቡብ ጎንደር)',
      region: 'Amhara',
      status: 'existing',
      start_year: 2026,
      total_area_ha: 500,
      labor_male: 150,
      labor_female: 140,
      trained_farmers: 12,
      soil_bunds_km: 4.5,
      fanya_juu_km: 2.5,
      bund_upgrades_km: 1.0,
      cutoff_drains_m3: 900,
      waterways_m3: 500,
      check_dams_m3: 250,
      area_closure_ha: 60,
      trenches_count: 200,
      micro_basins_count: 450,
      weed_water_hyacinth_ha: 0.0,
      weed_lantana_camara_ha: 1.5
    });
    setIsEntryModalOpen(true);
  };

  const openEditModal = (rec) => {
    setEditingRecord(rec);
    setCurrentStep(0);
    form.setFieldsValue(rec);
    setIsEntryModalOpen(true);
  };

  const handleSaveCampaign = async () => {
    try {
      const values = await form.validateFields();
      if (editingRecord) {
        setRecords((prev) =>
          prev.map((r) => (r.id === editingRecord.id ? { ...editingRecord, ...values } : r))
        );
        message.success('Campaign entry updated successfully');
      } else {
        const newRecord = {
          ...values,
          id: `AMH-CMP-${Date.now()}`,
          code: values.code || `WS-AMH-${records.length + 1}`
        };
        setRecords((prev) => [newRecord, ...prev]);
        message.success('New campaign return submitted');
      }
      setIsEntryModalOpen(false);
    } catch {
      message.error('Please verify the highlighted form fields');
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    if (!filteredData.length) {
      message.warning('No campaign returns to export');
      return;
    }

    const headers = [
      'Campaign Code',
      'Tefases Name',
      'Zone (ዞን)',
      'Woreda (ወረዳ)',
      'Kebele (ቀበሌ)',
      'Year',
      'Status (4.1.2)',
      'Male Labor',
      'Female Labor',
      'Soil Bunds (km)',
      'Fanya-Juu (km)',
      'Excavation (m³)',
      'Exclosure (Ha)'
    ];

    const rows = filteredData.map((r) => [
      `"${r.code || ''}"`,
      `"${r.name || ''}"`,
      `"${r.zone || ''}"`,
      `"${r.woreda || ''}"`,
      `"${r.kebele || ''}"`,
      r.start_year || '',
      r.status === 'existing' ? 'ነባር' : 'አዲስ',
      r.labor_male || 0,
      r.labor_female || 0,
      r.soil_bunds_km || 0,
      r.fanya_juu_km || 0,
      (r.cutoff_drains_m3 || 0) + (r.waterways_m3 || 0),
      r.area_closure_ha || 0
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `Amhara_SWC_Campaign_Returns_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success('Campaign returns exported to CSV');
  };

  // Table columns
  const columns = [
    {
      title: 'Campaign Code',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (code) => <Text strong style={{ color: '#164232' }}>{code}</Text>
    },
    {
      title: 'Watershed & Administrative Scope',
      key: 'scope',
      render: (_, r) => (
        <div>
          <Text strong style={{ fontSize: '14px', display: 'block', color: '#0d281e' }}>{r.name}</Text>
          <Text type="secondary" style={{ fontSize: '11px' }}>
            {r.zone} › {r.woreda} › {r.kebele} | Prog: <strong>{r.supporting_program || 'Regular'}</strong>
          </Text>
        </div>
      )
    },
    {
      title: 'Status (4.1.2)',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status) => (
        <Tag color={status === 'existing' ? 'green' : 'gold'} style={{ borderRadius: '10px', fontWeight: 600 }}>
          {status === 'existing' ? 'ነባር (Existing)' : 'አዲስ (New)'}
        </Tag>
      )
    },
    {
      title: 'Labor Force (4.2)',
      key: 'labor',
      width: 170,
      render: (_, r) => {
        const total = (r.labor_male || 0) + (r.labor_female || 0);
        const femaleRatio = total > 0 ? Math.round(((r.labor_female || 0) / total) * 100) : 0;
        return (
          <div>
            <Text strong>{total.toLocaleString()} </Text>
            <Text type="secondary" style={{ fontSize: '11px' }}>pers-days</Text>
            <Tooltip title={`Female ratio: ${femaleRatio}% (${r.labor_female || 0} females)`}>
              <Progress
                percent={femaleRatio}
                size="small"
                strokeColor="#13c2c2"
                trailColor="#ffa39e"
                format={() => `${femaleRatio}% ♀`}
              />
            </Tooltip>
          </div>
        );
      }
    },
    {
      title: 'Physical Bunds (4.3.1)',
      key: 'bunds',
      width: 160,
      render: (_, r) => {
        const bunds = ((r.soil_bunds_km || 0) + (r.fanya_juu_km || 0)).toFixed(1);
        return (
          <div>
            <Text strong style={{ color: '#186e41' }}>{bunds} km</Text>
            <div style={{ fontSize: '11px', color: '#777' }}>
              Soil: {r.soil_bunds_km || 0}k | Fanya: {r.fanya_juu_km || 0}k
            </div>
          </div>
        );
      }
    },
    {
      title: 'Excavation (4.3.2)',
      key: 'earthwork',
      width: 150,
      render: (_, r) => {
        const m3 = (r.cutoff_drains_m3 || 0) + (r.waterways_m3 || 0);
        return (
          <div>
            <Text strong>{m3.toLocaleString()} m³</Text>
            <div style={{ fontSize: '11px', color: '#777' }}>Drains & Waterways</div>
          </div>
        );
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 130,
      align: 'right',
      render: (_, r) => (
        <Space size="small">
          <Tooltip title="View Verification Breakdown">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => setInspectRecord(r)}
            />
          </Tooltip>
          <Tooltip title="Edit Campaign Form">
            <Button
              size="small"
              type="primary"
              ghost
              icon={<EditOutlined />}
              onClick={() => openEditModal(r)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <div style={{ paddingBottom: '24px' }}>
      {/* ───── PAGE TITLE BAR ───── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#0d281e', fontWeight: 700 }}>
            SWC Campaign Form (የተፋሰስ ልማት ቅጽ)
          </Title>
          <Text type="secondary" style={{ fontSize: '13px' }}>
            Seasonal Soil & Water Conservation Campaign Returns · Amhara Bureau of Agriculture (Sections 4.1 – 4.3.7)
          </Text>
        </div>
        <Space>
          <Button icon={<DownloadOutlined />} onClick={handleExportCSV}>
            Export CSV
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{ background: '#164232', borderColor: '#164232', height: '38px', borderRadius: '6px', fontWeight: 600 }}
            onClick={openCreateModal}
          >
            New Campaign Entry
          </Button>
        </Space>
      </div>

      {/* ───── TOP METRIC COUNTERS ───── */}
      <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <Statistic
              title={<span style={{ fontSize: '12px', fontWeight: 600 }}>Active Submissions</span>}
              value={campaignStats.totalEntries}
              prefix={<FileDoneOutlined style={{ color: '#164232' }} />}
              suffix="sites"
              valueStyle={{ fontWeight: 700, color: '#0d281e' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <Statistic
              title={<span style={{ fontSize: '12px', fontWeight: 600 }}>Total Terracing Done (km)</span>}
              value={campaignStats.totalTerracingKm.toFixed(1)}
              prefix={<span style={{ marginRight: '6px' }}>⛰️</span>}
              suffix="km"
              valueStyle={{ fontWeight: 700, color: '#186e41' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <Statistic
              title={<span style={{ fontSize: '12px', fontWeight: 600 }}>Total Earthworks (m³)</span>}
              value={campaignStats.totalEarthworkM3}
              prefix={<span style={{ marginRight: '6px' }}>💧</span>}
              suffix="m³"
              valueStyle={{ fontWeight: 700, color: '#0958d9' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <Statistic
              title={<span style={{ fontSize: '12px', fontWeight: 600 }}>Community Mobilized</span>}
              value={campaignStats.totalLabor}
              prefix={<span style={{ marginRight: '6px' }}>👥</span>}
              suffix="farmers"
              valueStyle={{ fontWeight: 700, color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* ───── FILTER TOOLBAR & TABLE ───── */}
      <Card bordered={false} style={{ borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <Row gutter={[12, 12]} style={{ marginBottom: '16px' }} align="middle">
          <Col xs={24} sm={12} md={7}>
            <Input
              prefix={<SearchOutlined style={{ color: '#999' }} />}
              placeholder="Search code, name, or kebele..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} sm={6} md={5}>
            <Select
              style={{ width: '100%' }}
              value={selectedZone}
              onChange={handleZoneChange}
            >
              <Option value="ALL">All Zones (ሁሉም ዞኖች)</Option>
              {zones.map((z) => (
                <Option key={z} value={z}>{z}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              style={{ width: '100%' }}
              value={selectedWoreda}
              onChange={setSelectedWoreda}
              disabled={selectedZone === 'ALL' && woredas.length === 0}
            >
              <Option value="ALL">All Woredas (ሁሉም ወረዳ)</Option>
              {woredas.map((w) => (
                <Option key={w} value={w}>{w}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              style={{ width: '100%' }}
              value={selectedYear}
              onChange={setSelectedYear}
            >
              <Option value="ALL">All Years (ሁሉንም ዓመታት)</Option>
              {years.map((y) => (
                <Option key={y} value={y}>{y} Campaign</Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4} style={{ textAlign: 'right' }}>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                setSearchQuery('');
                setSelectedZone('ALL');
                setSelectedWoreda('ALL');
                setSelectedYear('ALL');
              }}
            >
              Reset
            </Button>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          pagination={{ pageSize: 8, showTotal: (t) => `Total ${t} campaign returns logged` }}
        />
      </Card>

      {/* ───── AUDIT / DETAIL INSPECTOR MODAL ───── */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileDoneOutlined style={{ color: '#164232' }} />
            <span style={{ fontWeight: 700, color: '#0d281e' }}>Campaign Verification Sheet: {inspectRecord?.name}</span>
          </div>
        }
        open={!!inspectRecord}
        onCancel={() => setInspectRecord(null)}
        width={760}
        footer={[
          <Button key="close" onClick={() => setInspectRecord(null)}>Close</Button>,
          <Button
            key="edit"
            type="primary"
            style={{ background: '#164232', borderColor: '#164232' }}
            onClick={() => {
              const rec = inspectRecord;
              setInspectRecord(null);
              openEditModal(rec);
            }}
          >
            Edit Values in Form
          </Button>
        ]}
      >
        {inspectRecord && (
          <div style={{ marginTop: '12px' }}>
            <Descriptions bordered size="small" column={{ xs: 1, sm: 2, md: 3 }}>
              <Descriptions.Item label="Code">{inspectRecord.code}</Descriptions.Item>
              <Descriptions.Item label="Classification">
                <Tag color={inspectRecord.status === 'existing' ? 'green' : 'orange'}>
                  {inspectRecord.status === 'existing' ? 'ነባር (Existing)' : 'አዲስ (New)'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Total Area">{inspectRecord.total_area_ha} Ha</Descriptions.Item>

              <Descriptions.Item label="Location Hierarchy" span={2}>
                {inspectRecord.zone} › {inspectRecord.woreda} › {inspectRecord.kebele}
              </Descriptions.Item>
              <Descriptions.Item label="Program">{inspectRecord.supporting_program || 'MoA Regular'}</Descriptions.Item>

              <Descriptions.Item label="4.2 Male Labor">{inspectRecord.labor_male || 0}</Descriptions.Item>
              <Descriptions.Item label="4.2 Female Labor">{inspectRecord.labor_female || 0}</Descriptions.Item>
              <Descriptions.Item label="4.2 Surveyors">{inspectRecord.trained_farmers || 0}</Descriptions.Item>

              <Descriptions.Item label="4.3.1 Soil Bunds">{inspectRecord.soil_bunds_km || 0} km</Descriptions.Item>
              <Descriptions.Item label="4.3.1 Fanya-Juu">{inspectRecord.fanya_juu_km || 0} km</Descriptions.Item>
              <Descriptions.Item label="4.3.1 Bund Upgrades">{inspectRecord.bund_upgrades_km || 0} km</Descriptions.Item>

              <Descriptions.Item label="4.3.2 Cutoff Drains">{inspectRecord.cutoff_drains_m3 || 0} m³</Descriptions.Item>
              <Descriptions.Item label="4.3.2 Waterways">{inspectRecord.waterways_m3 || 0} m³</Descriptions.Item>
              <Descriptions.Item label="4.3.3 Area Closure">{inspectRecord.area_closure_ha || 0} Ha</Descriptions.Item>

              <Descriptions.Item label="4.3.4 Trenches">{inspectRecord.trenches_count || 0}</Descriptions.Item>
              <Descriptions.Item label="4.3.4 Micro Basins">{inspectRecord.micro_basins_count || 0}</Descriptions.Item>
              <Descriptions.Item label="4.3.5 Check Dams">{inspectRecord.check_dams_m3 || 0} m³</Descriptions.Item>

              <Descriptions.Item label="4.3.7 Invasives Eradicated" span={3}>
                Water Hyacinth: {inspectRecord.weed_water_hyacinth_ha || 0} Ha | Lantana: {inspectRecord.weed_lantana_camara_ha || 0} Ha
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>

      {/* ───── MULTI-STEP MODAL WITH "NEXT" NAVIGATION ───── */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>📝</span>
            <div>
              <div style={{ fontWeight: 700, color: '#0d281e', fontSize: '16px', lineHeight: 1.2 }}>
                {editingRecord ? `Edit Campaign Return: ${editingRecord.name}` : 'New SWC Campaign Return (የተፋሰስ ልማት ቅጽ)'}
              </div>
              <Text type="secondary" style={{ fontSize: '11px', fontWeight: 400 }}>
                Ministry Matrix Sections 4.1 – 4.3.7 Seasonal Reporting Workflow
              </Text>
            </div>
          </div>
        }
        open={isEntryModalOpen}
        onCancel={() => setIsEntryModalOpen(false)}
        width={780}
        destroyOnClose
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              {currentStep > 0 && (
                <Button icon={<LeftOutlined />} onClick={handlePrevStep}>
                  Previous (ወደ ኋላ)
                </Button>
              )}
            </div>

            <Space>
              <Button onClick={() => setIsEntryModalOpen(false)}>Cancel</Button>

              {currentStep < 2 ? (
                <Button
                  type="primary"
                  style={{ background: '#164232', borderColor: '#164232' }}
                  onClick={handleNextStep}
                >
                  Next (ቀጣይ) <RightOutlined />
                </Button>
              ) : (
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  style={{ background: '#2db872', borderColor: '#2db872' }}
                  onClick={handleSaveCampaign}
                >
                  {editingRecord ? 'Save Changes' : 'Submit Campaign Return (መዝግብ)'}
                </Button>
              )}
            </Space>
          </div>
        }
      >
        <div style={{ padding: '8px 4px 16px' }}>
          <Steps
            current={currentStep}
            size="small"
            items={[
              { title: '4.1 Administrative Scope' },
              { title: '4.2 Labor Force' },
              { title: '4.3 Conservation Works' }
            ]}
          />
        </div>

        <Form form={form} layout="vertical" style={{ marginTop: '8px' }}>
          {/* STEP 0: 4.1 Administrative Scope */}
          {currentStep === 0 && (
            <div>
              <div style={{ background: '#f6f9f7', padding: '10px 14px', borderRadius: '6px', marginBottom: '14px', border: '1px solid #e2ede5' }}>
                <Text strong style={{ color: '#164232' }}>Step 1: Administrative Scope & Catchment Identification</Text>
                <div style={{ fontSize: '11px', color: '#666' }}>Designate administrative hierarchy, campaign year, status, and baseline area</div>
              </div>

              <Row gutter={16}>
                <Col span={14}>
                  <Form.Item name="name" label="Tefases Name (የተፋሰሱ ስም)" rules={[{ required: true, message: 'Catchment name is required' }]}>
                    <Input placeholder="e.g. Ribb River Sub-Catchment" />
                  </Form.Item>
                </Col>
                <Col span={10}>
                  <Form.Item name="code" label="Campaign Code (መለያ)" rules={[{ required: true, message: 'Campaign code is required' }]}>
                    <Input placeholder="e.g. WS-FOG-01" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item name="zone" label="Zone (ዞን)" rules={[{ required: true, message: 'Select zone' }]}>
                    <Select placeholder="Select zone">
                      <Option value="South Gondar (ደቡብ ጎንደር)">South Gondar (ደቡብ ጎንደር)</Option>
                      <Option value="North Shewa (ሰሜን ሸዋ)">North Shewa (ሰሜን ሸዋ)</Option>
                      <Option value="South Wollo (ደቡብ ወሎ)">South Wollo (ደቡብ ወሎ)</Option>
                      <Option value="West Gojjam (ምዕራብ ጎጃም)">West Gojjam (ምዕራብ ጎጃም)</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="woreda" label="Woreda (ወረዳ)" rules={[{ required: true, message: 'Enter woreda' }]}>
                    <Input placeholder="e.g. Fogera (ፎገራ)" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="kebele" label="Kebele (ቀበሌ)" rules={[{ required: true, message: 'Enter kebele' }]}>
                    <Input placeholder="e.g. Woreta Zuria" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item name="status" label="Status (4.1.2)" rules={[{ required: true }]}>
                    <Select>
                      <Option value="existing">ነባር (Existing)</Option>
                      <Option value="new">አዲስ (New)</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="total_area_ha" label="Catchment Area (Ha)" rules={[{ required: true, message: 'Enter area' }]}>
                    <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="start_year" label="Campaign Year" rules={[{ required: true, message: 'Enter year' }]}>
                    <InputNumber style={{ width: '100%' }} min={2020} max={2035} placeholder="2026" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item name="supporting_program" label="Supporting Program / Fund">
                    <Input placeholder="e.g. CALM, RLLP, SLMP-II, Regular Budget" />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          )}

          {/* STEP 1: 4.2 Labor Force */}
          {currentStep === 1 && (
            <div>
              <div style={{ background: '#f6f9f7', padding: '10px 14px', borderRadius: '6px', marginBottom: '14px', border: '1px solid #e2ede5' }}>
                <Text strong style={{ color: '#164232' }}>Step 2: Community Labor Force Mobilization</Text>
                <div style={{ fontSize: '11px', color: '#666' }}>Record gender-segregated participation in person-days and trained delineators</div>
              </div>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item name="labor_male" label="Male Labor (ወንድ - pers-days)" rules={[{ required: true, message: 'Enter male labor' }]}>
                    <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="labor_female" label="Female Labor (ሴት - pers-days)" rules={[{ required: true, message: 'Enter female labor' }]}>
                    <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="trained_farmers" label="ቀያሽ አርሶ አደር (Surveyors)" rules={[{ required: true, message: 'Enter surveyors count' }]}>
                    <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          )}

          {/* STEP 2: 4.3 Conservation Works */}
          {currentStep === 2 && (
            <div>
              <div style={{ background: '#f6f9f7', padding: '10px 14px', borderRadius: '6px', marginBottom: '14px', border: '1px solid #e2ede5' }}>
                <Text strong style={{ color: '#164232' }}>Step 3: Section 4.3 Conservation Works Execution</Text>
                <div style={{ fontSize: '11px', color: '#666' }}>Record physical terracing (km), drainage/earthworks (m³), exclosures, and weed clearance</div>
              </div>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item name="soil_bunds_km" label="የማሳ እርከን (Soil Bunds km)">
                    <InputNumber style={{ width: '100%' }} step={0.1} min={0} placeholder="0.0" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="fanya_juu_km" label="የፋንያ ጁ (Fanya-Juu km)">
                    <InputNumber style={{ width: '100%' }} step={0.1} min={0} placeholder="0.0" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="bund_upgrades_km" label="ደረጃ ማሳደግ (Upgrades km)">
                    <InputNumber style={{ width: '100%' }} step={0.1} min={0} placeholder="0.0" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item name="cutoff_drains_m3" label="የጎርፍ መቀልበሻ (Cutoff m³)">
                    <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="waterways_m3" label="የውሃ ማፍሰሻ (Waterways m³)">
                    <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="check_dams_m3" label="ክትር ስራ (Check Dams m³)">
                    <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item name="area_closure_ha" label="ከንክኪ መከላከል (Exclosure Ha)">
                    <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="weed_water_hyacinth_ha" label="እንቦጭ (Hyacinth Cleared Ha)">
                    <InputNumber style={{ width: '100%' }} step={0.1} min={0} placeholder="0.0" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="weed_lantana_camara_ha" label="የወፍ ቆሎ (Lantana Cleared Ha)">
                    <InputNumber style={{ width: '100%' }} step={0.1} min={0} placeholder="0.0" />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          )}
        </Form>
      </Modal>
    </div>
  );
}