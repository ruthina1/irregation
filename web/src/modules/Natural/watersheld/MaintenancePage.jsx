import React, { useState, useMemo } from 'react';
import {
  Card,
  Table,
  Row,
  Col,
  Input,
  Select,
  Button,
  Tag,
  Space,
  Typography,
  Statistic,
  Tooltip,
  Modal,
  Form,
  InputNumber,
  Progress,
  Badge,
  Segmented,
  message
} from 'antd';
import {
  SearchOutlined,
  DownloadOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  ToolOutlined,
  BuildOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  AimOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

// ───── AMHARA SECTION 4.3.7 SEED DATA: PLAN, ACHIEVEMENT & PARTICIPATION ─────
const INITIAL_AMHARA_MAINTENANCE = [
  {
    id: 'AMH-MN-01',
    code: 'WS-FOG-01',
    name: 'Ribb River Sub-Catchment (የሪብ ወንዝ ተፋሰስ)',
    zone: 'South Gondar (ደቡብ ጎንደር)',
    woreda: 'Fogera (ፎገራ)',
    kebele: 'Woreta Zuria (ወረታ ዙሪያ)',
    quarter: 'Q2',
    year: 2026,
    // Participants (ተሳታፊዎች)
    participants_male: 320,
    participants_female: 290,
    // Linear Terraces Maintenance (km)
    plan_linear_km: 15.0,
    maint_soil_bunds_km: 6.5,
    maint_bench_terraces_km: 2.1,
    maint_hillside_terraces_km: 4.8,
    // Volumetric Structures Repair (m³)
    plan_volumetric_m3: 1800,
    maint_cutoff_drains_m3: 680,
    maint_waterways_m3: 520,
    maint_check_dams_m3: 420
  },
  {
    id: 'AMH-MN-02',
    code: 'WS-DER-02',
    name: 'Gumara Headwaters (ጉማራ ተፋሰስ)',
    zone: 'South Gondar (ደቡብ ጎንደር)',
    woreda: 'Dera (ደራ)',
    kebele: 'Anbesame (አንበሳሜ)',
    quarter: 'Q2',
    year: 2026,
    participants_male: 210,
    participants_female: 195,
    plan_linear_km: 9.0,
    maint_soil_bunds_km: 3.2,
    maint_bench_terraces_km: 1.2,
    maint_hillside_terraces_km: 2.8,
    plan_volumetric_m3: 1100,
    maint_cutoff_drains_m3: 410,
    maint_waterways_m3: 310,
    maint_check_dams_m3: 210
  },
  {
    id: 'AMH-MN-03',
    code: 'WS-BS-01',
    name: 'Chacha River Highland Tefases (የጫጫ ወንዝ ተፋሰስ)',
    zone: 'North Shewa (ሰሜን ሸዋ)',
    woreda: 'Basona Werana (ባሶና ወራና)',
    kebele: 'Goshe Bado (ጎሼ ባዶ)',
    quarter: 'Q1',
    year: 2026,
    participants_male: 450,
    participants_female: 410,
    plan_linear_km: 20.0,
    maint_soil_bunds_km: 8.5,
    maint_bench_terraces_km: 3.4,
    maint_hillside_terraces_km: 6.8,
    plan_volumetric_m3: 2200,
    maint_cutoff_drains_m3: 890,
    maint_waterways_m3: 640,
    maint_check_dams_m3: 540
  },
  {
    id: 'AMH-MN-04',
    code: 'WS-LEG-03',
    name: 'Borkena Gorge Catchment (ቦርከና ተፋሰስ)',
    zone: 'South Wollo (ደቡብ ወሎ)',
    woreda: 'Kalu (ቃሉ)',
    kebele: 'Kombolcha Zuria (ኮምቦልቻ ዙሪያ)',
    quarter: 'Q3',
    year: 2026,
    participants_male: 180,
    participants_female: 160,
    plan_linear_km: 8.0,
    maint_soil_bunds_km: 2.8,
    maint_bench_terraces_km: 1.0,
    maint_hillside_terraces_km: 3.1,
    plan_volumetric_m3: 950,
    maint_cutoff_drains_m3: 380,
    maint_waterways_m3: 290,
    maint_check_dams_m3: 190
  },
  {
    id: 'AMH-MN-05',
    code: 'WS-MECH-01',
    name: 'Koga Dam Buffer Watershed (ኮጋ ግድብ ተፋሰስ)',
    zone: 'West Gojjam (ምዕራብ ጎጃም)',
    woreda: 'Mecha (መቻ)',
    kebele: 'Kudmi (ቁድሚ)',
    quarter: 'Q2',
    year: 2026,
    participants_male: 410,
    participants_female: 380,
    plan_linear_km: 18.0,
    maint_soil_bunds_km: 9.2,
    maint_bench_terraces_km: 2.8,
    maint_hillside_terraces_km: 5.4,
    plan_volumetric_m3: 2400,
    maint_cutoff_drains_m3: 920,
    maint_waterways_m3: 710,
    maint_check_dams_m3: 610
  }
];

export default function MaintenancePage() {
  const [records, setRecords] = useState(INITIAL_AMHARA_MAINTENANCE);

  // Administrative & Quarterly Filters
  const [selectedZone, setSelectedZone] = useState('ALL');
  const [selectedWoreda, setSelectedWoreda] = useState('ALL');
  const [selectedQuarter, setSelectedQuarter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Form & Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  // Distinct Filter Lists
  const zones = useMemo(() => {
    return Array.from(new Set(records.map((r) => r.zone).filter(Boolean)));
  }, [records]);

  const woredas = useMemo(() => {
    const list = selectedZone === 'ALL' ? records : records.filter((r) => r.zone === selectedZone);
    return Array.from(new Set(list.map((r) => r.woreda).filter(Boolean)));
  }, [records, selectedZone]);

  const handleZoneChange = (zone) => {
    setSelectedZone(zone);
    setSelectedWoreda('ALL');
  };

  // ───── AGGREGATE SUMMARY: PLAN, ACHIEVEMENT & PARTICIPATION ─────
  const stats = useMemo(() => {
    const currentList = records.filter((r) => {
      const matchZone = selectedZone === 'ALL' || r.zone === selectedZone;
      const matchWoreda = selectedWoreda === 'ALL' || r.woreda === selectedWoreda;
      const matchQuarter = selectedQuarter === 'ALL' || r.quarter === selectedQuarter;
      return matchZone && matchWoreda && matchQuarter;
    });

    let totalMale = 0;
    let totalFemale = 0;
    let totalPlanLinearKm = 0;
    let totalAchLinearKm = 0;
    let totalPlanVolumetricM3 = 0;
    let totalAchVolumetricM3 = 0;

    currentList.forEach((r) => {
      totalMale += Number(r.participants_male) || 0;
      totalFemale += Number(r.participants_female) || 0;

      const pLin = Number(r.plan_linear_km) || 0;
      const aLin = (Number(r.maint_soil_bunds_km) || 0) +
                   (Number(r.maint_bench_terraces_km) || 0) +
                   (Number(r.maint_hillside_terraces_km) || 0);

      const pVol = Number(r.plan_volumetric_m3) || 0;
      const aVol = (Number(r.maint_cutoff_drains_m3) || 0) +
                   (Number(r.maint_waterways_m3) || 0) +
                   (Number(r.maint_check_dams_m3) || 0);

      totalPlanLinearKm += pLin;
      totalAchLinearKm += aLin;
      totalPlanVolumetricM3 += pVol;
      totalAchVolumetricM3 += aVol;
    });

    const totalParticipants = totalMale + totalFemale;
    const femaleShare = totalParticipants > 0 ? Math.round((totalFemale / totalParticipants) * 100) : 0;
    const linearExecutionRate = totalPlanLinearKm > 0 ? Math.round((totalAchLinearKm / totalPlanLinearKm) * 100) : 0;
    const volumetricExecutionRate = totalPlanVolumetricM3 > 0 ? Math.round((totalAchVolumetricM3 / totalPlanVolumetricM3) * 100) : 0;

    return {
      totalMale,
      totalFemale,
      totalParticipants,
      femaleShare,
      totalPlanLinearKm,
      totalAchLinearKm,
      linearExecutionRate,
      totalPlanVolumetricM3,
      totalAchVolumetricM3,
      volumetricExecutionRate
    };
  }, [records, selectedZone, selectedWoreda, selectedQuarter]);

  // ───── FILTERED TABLE DATA ─────
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchSearch =
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.kebele.toLowerCase().includes(searchQuery.toLowerCase());

      const matchZone = selectedZone === 'ALL' || r.zone === selectedZone;
      const matchWoreda = selectedWoreda === 'ALL' || r.woreda === selectedWoreda;
      const matchQuarter = selectedQuarter === 'ALL' || r.quarter === selectedQuarter;

      return matchSearch && matchZone && matchWoreda && matchQuarter;
    });
  }, [records, searchQuery, selectedZone, selectedWoreda, selectedQuarter]);

  // ───── MODAL CONTROLS ─────
  const openCreateModal = () => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({
      zone: selectedZone !== 'ALL' ? selectedZone : 'South Gondar (ደቡብ ጎንደር)',
      woreda: '',
      kebele: '',
      quarter: selectedQuarter !== 'ALL' ? selectedQuarter : 'Q2',
      year: 2026,
      participants_male: 0,
      participants_female: 0,
      plan_linear_km: 0,
      maint_soil_bunds_km: 0,
      maint_bench_terraces_km: 0,
      maint_hillside_terraces_km: 0,
      plan_volumetric_m3: 0,
      maint_cutoff_drains_m3: 0,
      maint_waterways_m3: 0,
      maint_check_dams_m3: 0
    });
    setIsModalOpen(true);
  };

  const openEditModal = (rec) => {
    setEditingRecord(rec);
    form.setFieldsValue(rec);
    setIsModalOpen(true);
  };

  const handleModalSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingRecord) {
        setRecords((prev) =>
          prev.map((r) => (r.id === editingRecord.id ? { ...editingRecord, ...values } : r))
        );
        message.success(`Updated maintenance return for ${editingRecord.code}`);
      } else {
        const newRecord = {
          ...values,
          id: `AMH-MN-${Date.now()}`,
          code: values.code || `WS-AMH-${records.length + 1}`
        };
        setRecords((prev) => [newRecord, ...prev]);
        message.success('New maintenance return logged successfully!');
      }
      setIsModalOpen(false);
    } catch {
      message.error('Please verify the highlighted form fields.');
    }
  };

  // ───── CSV EXPORT ─────
  const handleExportCSV = () => {
    if (!filteredRecords.length) {
      message.warning('No records to export');
      return;
    }

    const headers = [
      'Tefases Code',
      'Watershed Name',
      'Zone',
      'Woreda',
      'Kebele',
      'Quarter',
      'Male Participants',
      'Female Participants',
      'Total Participants',
      'Linear Plan (km)',
      'Linear Achieved (km)',
      'Volumetric Plan (m³)',
      'Volumetric Achieved (m³)'
    ];

    const rows = filteredRecords.map((r) => {
      const male = Number(r.participants_male) || 0;
      const female = Number(r.participants_female) || 0;
      const linAch = (Number(r.maint_soil_bunds_km) || 0) +
                     (Number(r.maint_bench_terraces_km) || 0) +
                     (Number(r.maint_hillside_terraces_km) || 0);
      const volAch = (Number(r.maint_cutoff_drains_m3) || 0) +
                     (Number(r.maint_waterways_m3) || 0) +
                     (Number(r.maint_check_dams_m3) || 0);

      return [
        `"${r.code || ''}"`,
        `"${r.name || ''}"`,
        `"${r.zone || ''}"`,
        `"${r.woreda || ''}"`,
        `"${r.kebele || ''}"`,
        r.quarter,
        male,
        female,
        male + female,
        Number(r.plan_linear_km || 0).toFixed(2),
        linAch.toFixed(2),
        Number(r.plan_volumetric_m3 || 0),
        volAch
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `Amhara_SWC_Maintenance_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success('SWC maintenance dataset exported successfully');
  };

  // ───── TABLE COLUMNS ─────
  const columns = [
    {
      title: 'Tefases Code',
      dataIndex: 'code',
      key: 'code',
      width: 110,
      render: (t) => <Text strong style={{ color: '#164232' }}>{t}</Text>
    },
    {
      title: 'Catchment & Scope',
      key: 'name',
      render: (_, r) => (
        <div>
          <Space orientation="horizontal" size={6}>
            <Text strong style={{ fontSize: '13px', color: '#0d281e' }}>{r.name}</Text>
            <Tag color="geekblue" style={{ fontSize: '10px', padding: '0 6px', fontWeight: 600 }}>
              {r.quarter}
            </Tag>
          </Space>
          <Text type="secondary" style={{ fontSize: '11px', display: 'block' }}>
            <EnvironmentOutlined /> {r.zone} › {r.woreda} › {r.kebele}
          </Text>
        </div>
      )
    },
    {
      title: 'ተሳታፊ አርሶ አደር (Participants)',
      key: 'participants',
      width: 170,
      sorter: (a, b) =>
        ((a.participants_male || 0) + (a.participants_female || 0)) -
        ((b.participants_male || 0) + (b.participants_female || 0)),
      render: (_, r) => {
        const m = Number(r.participants_male) || 0;
        const f = Number(r.participants_female) || 0;
        const total = m + f;
        const fPct = total > 0 ? Math.round((f / total) * 100) : 0;

        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <Text strong>{total.toLocaleString()}</Text>
              <Text type="secondary" style={{ fontSize: '11px' }}>{fPct}% ♀</Text>
            </div>
            <Progress
              percent={fPct}
              showInfo={false}
              size="small"
              strokeColor="#13c2c2"
              trailColor="#bae0ff"
            />
          </div>
        );
      }
    },
    {
      title: 'Linear Maintenance (ኪ/ሜ)',
      children: [
        {
          title: 'ዕቅድ (Plan)',
          dataIndex: 'plan_linear_km',
          key: 'plan_linear_km',
          width: 90,
          align: 'right',
          render: (val) => <span style={{ color: '#595959' }}>{Number(val || 0).toFixed(1)} km</span>
        },
        {
          title: 'ክንውን (Ach)',
          key: 'linear_ach',
          width: 100,
          align: 'right',
          render: (_, r) => {
            const ach = (Number(r.maint_soil_bunds_km) || 0) +
                        (Number(r.maint_bench_terraces_km) || 0) +
                        (Number(r.maint_hillside_terraces_km) || 0);
            return <span style={{ fontWeight: 600, color: '#186e41' }}>{ach.toFixed(1)} km</span>;
          }
        }
      ]
    },
    {
      title: 'Volumetric Repairs (ሜ/ኪ)',
      children: [
        {
          title: 'ዕቅድ (Plan)',
          dataIndex: 'plan_volumetric_m3',
          key: 'plan_volumetric_m3',
          width: 95,
          align: 'right',
          render: (val) => <span style={{ color: '#595959' }}>{Number(val || 0).toLocaleString()}</span>
        },
        {
          title: 'ክንውን (Ach)',
          key: 'volumetric_ach',
          width: 105,
          align: 'right',
          render: (_, r) => {
            const ach = (Number(r.maint_cutoff_drains_m3) || 0) +
                        (Number(r.maint_waterways_m3) || 0) +
                        (Number(r.maint_check_dams_m3) || 0);
            return <span style={{ fontWeight: 600, color: '#0958d9' }}>{ach.toLocaleString()} m³</span>;
          }
        }
      ]
    },
    {
      title: 'የዕቅድ አፈፃፀም (Rate)',
      key: 'completion_rate',
      width: 140,
      render: (_, r) => {
        const pLin = Number(r.plan_linear_km) || 0;
        const aLin = (Number(r.maint_soil_bunds_km) || 0) +
                     (Number(r.maint_bench_terraces_km) || 0) +
                     (Number(r.maint_hillside_terraces_km) || 0);
        const rate = pLin > 0 ? Math.round((aLin / pLin) * 100) : 0;
        const isCompleted = rate >= 100;

        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '2px' }}>
              <span>Linear Target</span>
              <strong style={{ color: isCompleted ? '#389e0d' : '#cf1322' }}>{rate}%</strong>
            </div>
            <Progress
              percent={rate}
              size="small"
              showInfo={false}
              strokeColor={isCompleted ? '#52c41a' : '#fa8c16'}
              trailColor="#f0f0f0"
            />
          </div>
        );
      }
    },
    {
      title: 'Action',
      key: 'action',
      width: 70,
      align: 'center',
      render: (_, r) => (
        <Tooltip title="Update Maintenance Data">
          <Button
            size="small"
            type="text"
            icon={<EditOutlined style={{ color: '#186e41' }} />}
            onClick={() => openEditModal(r)}
          />
        </Tooltip>
      )
    }
  ];

  return (
    <div style={{ paddingBottom: '24px' }}>
      {/* ───── TITLE BAR ───── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#0d281e', fontWeight: 700 }}>
            SWC Structure Maintenance & Repair (የጥገና ሥራዎች)
          </Title>
          <Text type="secondary" style={{ fontSize: '13px' }}>
            Amhara Bureau of Agriculture · Matrix Section 4.3.7: Quarterly Target vs. Achievement & Community Participation
          </Text>
        </div>
        <Space>
          <Button icon={<DownloadOutlined />} onClick={handleExportCSV}>
            Export Maintenance CSV
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{ background: '#164232', borderColor: '#164232', fontWeight: 600 }}
            onClick={openCreateModal}
          >
            + Log Maintenance Return (የጥገና ሥራ መዝግብ)
          </Button>
        </Space>
      </div>

      {/* ───── AGGREGATE KPI CARDS ───── */}
      <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <Statistic
              title={<span style={{ fontSize: '12px', fontWeight: 700 }}>ተሳታፊ አርሶ አደር (Participants)</span>}
              value={stats.totalParticipants}
              prefix={<TeamOutlined style={{ color: '#186e41', marginRight: '6px' }} />}
              suffix="farmers"
              valueStyle={{ fontWeight: 700, color: '#0d281e' }}
            />
            <div style={{ marginTop: '8px', fontSize: '11px', color: '#666' }}>
              ♂ {stats.totalMale.toLocaleString()} | ♀ {stats.totalFemale.toLocaleString()} ({stats.femaleShare}% Female)
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <Statistic
              title={<span style={{ fontSize: '12px', fontWeight: 700 }}>የእርከን ጥገና ክንውን (Linear Achieved)</span>}
              value={stats.totalAchLinearKm.toFixed(1)}
              prefix={<ToolOutlined style={{ color: '#0958d9', marginRight: '6px' }} />}
              suffix={`/ ${stats.totalPlanLinearKm.toFixed(1)} km`}
              valueStyle={{ fontWeight: 700, color: '#0958d9' }}
            />
            <div style={{ marginTop: '8px', fontSize: '11px', color: '#666' }}>
              Execution Rate: <strong>{stats.linearExecutionRate}%</strong> of quarterly plan
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <Statistic
              title={<span style={{ fontSize: '12px', fontWeight: 700 }}>የቦይና ክትር ክንውን (Volumetric Ach)</span>}
              value={stats.totalAchVolumetricM3.toLocaleString()}
              prefix={<BuildOutlined style={{ color: '#186e41', marginRight: '6px' }} />}
              suffix={`/ ${stats.totalPlanVolumetricM3.toLocaleString()} m³`}
              valueStyle={{ fontWeight: 700, color: '#1b633f' }}
            />
            <div style={{ marginTop: '8px', fontSize: '11px', color: '#666' }}>
              Excavation & Masonry Rate: <strong>{stats.volumetricExecutionRate}%</strong>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <Statistic
              title={<span style={{ fontSize: '12px', fontWeight: 700 }}>አጠቃላይ አፈፃፀም (Overall Status)</span>}
              value={stats.linearExecutionRate >= 100 ? 'Target Met' : 'In Progress'}
              prefix={<CheckCircleOutlined style={{ color: stats.linearExecutionRate >= 100 ? '#52c41a' : '#fa8c16', marginRight: '6px' }} />}
              valueStyle={{ fontWeight: 700, color: stats.linearExecutionRate >= 100 ? '#186e41' : '#d46b08' }}
            />
            <div style={{ marginTop: '8px', fontSize: '11px', color: '#666' }}>
              Section 4.3.7 quarterly rehabilitation metrics
            </div>
          </Card>
        </Col>
      </Row>

      {/* ───── FILTER TOOLBAR & MAIN TABLE ───── */}
      <Card bordered={false} style={{ borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <Row gutter={[12, 12]} style={{ marginBottom: '16px' }} align="middle">
          <Col xs={24} sm={10} md={6}>
            <Input
              prefix={<SearchOutlined style={{ color: '#8aa396' }} />}
              placeholder="Search code, name, or kebele..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} sm={7} md={4}>
            <Select style={{ width: '100%' }} value={selectedZone} onChange={handleZoneChange}>
              <Option value="ALL">All Zones (ሁሉም ዞኖች)</Option>
              {zones.map((z) => (
                <Option key={z} value={z}>{z}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} sm={7} md={4}>
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
          <Col xs={24} sm={12} md={7}>
            <Segmented
              value={selectedQuarter}
              onChange={setSelectedQuarter}
              options={[
                { label: 'All Quarters', value: 'ALL' },
                { label: 'Q1 (1ኛ)', value: 'Q1' },
                { label: 'Q2 (2ኛ)', value: 'Q2' },
                { label: 'Q3 (3ኛ)', value: 'Q3' },
                { label: 'Q4 (4ኛ)', value: 'Q4' }
              ]}
              style={{ background: '#eef5f1', fontWeight: 600 }}
            />
          </Col>
          <Col xs={24} sm={12} md={3} style={{ textAlign: 'right' }}>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                setSearchQuery('');
                setSelectedZone('ALL');
                setSelectedWoreda('ALL');
                setSelectedQuarter('ALL');
              }}
            >
              Reset
            </Button>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredRecords}
          rowKey="id"
          bordered
          pagination={{ pageSize: 8, showTotal: (t) => `Total ${t} watershed returns recorded` }}
        />
      </Card>

      {/* ───── DATA ENTRY & EDIT MODAL ───── */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ToolOutlined style={{ color: '#164232' }} />
            <span style={{ fontWeight: 700, color: '#0d281e' }}>
              {editingRecord
                ? `Update Maintenance Return: ${editingRecord.name}`
                : 'Log SWC Maintenance & Repair (የጥገና ሥራ መዝግብ)'}
            </span>
          </div>
        }
        open={isModalOpen}
        onOk={handleModalSave}
        onCancel={() => setIsModalOpen(false)}
        width={740}
        destroyOnClose
        okText={editingRecord ? 'Save Changes' : 'Submit Maintenance Return'}
        okButtonProps={{ style: { background: '#164232', borderColor: '#164232' } }}
      >
        <Form form={form} layout="vertical" style={{ marginTop: '16px' }}>
          {/* Spatial Scope */}
          <Row gutter={16}>
            <Col span={14}>
              <Form.Item
                name="name"
                label="Watershed Name (የተፋሰስ ስም)"
                rules={[{ required: true, message: 'Please enter catchment name' }]}
              >
                <Input placeholder="e.g. Ribb River Sub-Catchment" />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item
                name="code"
                label="Tefases Code (መለያ)"
                rules={[{ required: true, message: 'Please enter code' }]}
              >
                <Input placeholder="e.g. WS-FOG-01" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="zone" label="Zone (ዞን)" rules={[{ required: true }]}>
                <Select>
                  <Option value="South Gondar (ደቡብ ጎንደር)">South Gondar (ደቡብ ጎንደር)</Option>
                  <Option value="North Shewa (ሰሜን ሸዋ)">North Shewa (ሰሜን ሸዋ)</Option>
                  <Option value="South Wollo (ደቡብ ወሎ)">South Wollo (ደቡብ ወሎ)</Option>
                  <Option value="West Gojjam (ምዕራብ ጎጃም)">West Gojjam (ምዕራብ ጎጃም)</Option>
                  <Option value="Central Gondar (ማዕከላዊ ጎንደር)">Central Gondar (ማዕከላዊ ጎንደር)</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="woreda"
                label="Woreda (ወረዳ)"
                rules={[{ required: true, message: 'Please enter woreda' }]}
              >
                <Input placeholder="e.g. Fogera (ፎገራ)" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="kebele"
                label="Kebele (ቀበሌ)"
                rules={[{ required: true, message: 'Please enter kebele' }]}
              >
                <Input placeholder="e.g. Woreta Zuria" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="quarter" label="Reporting Quarter (ሩብ ዓመት)" rules={[{ required: true }]}>
                <Select>
                  <Option value="Q1">1ኛ ሩብ ዓመት (Q1)</Option>
                  <Option value="Q2">2ኛ ሩብ ዓመት (Q2)</Option>
                  <Option value="Q3">3ኛ ሩብ ዓመት (Q3)</Option>
                  <Option value="Q4">4ኛ ሩብ ዓመት (Q4)</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="year" label="Fiscal Year (የበጀት ዓመት)" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={2020} max={2030} />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ height: '1px', background: '#f0f0f0', margin: '12px 0 16px' }} />
          <Text strong style={{ display: 'block', marginBottom: '12px', color: '#164232' }}>
            Community Labor Participation (ተሳታፊ አርሶ አደሮች)
          </Text>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="participants_male"
                label="ወንድ ተሳታፊ (Male Participants)"
                rules={[{ required: true, message: 'Required' }]}
              >
                <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="participants_female"
                label="ሴት ተሳታፊ (Female Participants)"
                rules={[{ required: true, message: 'Required' }]}
              >
                <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ height: '1px', background: '#f0f0f0', margin: '12px 0 16px' }} />
          <Text strong style={{ display: 'block', marginBottom: '12px', color: '#164232' }}>
            Linear Terrace Maintenance: Plan vs. Achievement (ኪ/ሜ)
          </Text>

          <Row gutter={16}>
            <Col span={6}>
              <Form.Item
                name="plan_linear_km"
                label="የእርከን ዕቅድ (Plan km)"
                rules={[{ required: true, message: 'Required' }]}
              >
                <InputNumber style={{ width: '100%' }} step={0.1} min={0} placeholder="0.0" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="maint_soil_bunds_km" label="የማሳ እርከን (Farmland km)">
                <InputNumber style={{ width: '100%' }} step={0.1} min={0} placeholder="0.0" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="maint_bench_terraces_km" label="የቤንች እርከን (Bench km)">
                <InputNumber style={{ width: '100%' }} step={0.1} min={0} placeholder="0.0" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="maint_hillside_terraces_km" label="የተራራ እርከን (Hillside km)">
                <InputNumber style={{ width: '100%' }} step={0.1} min={0} placeholder="0.0" />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ height: '1px', background: '#f0f0f0', margin: '12px 0 16px' }} />
          <Text strong style={{ display: 'block', marginBottom: '12px', color: '#164232' }}>
            Volumetric Civil Repair: Plan vs. Achievement (ሜ/ኪ)
          </Text>

          <Row gutter={16}>
            <Col span={6}>
              <Form.Item
                name="plan_volumetric_m3"
                label="የቦይ/ክትር ዕቅድ (Plan m³)"
                rules={[{ required: true, message: 'Required' }]}
              >
                <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="maint_cutoff_drains_m3" label="የጎርፍ ቦይ (Cutoff m³)">
                <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="maint_waterways_m3" label="የውሃ ማፍሰሻ (Waterways m³)">
                <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="maint_check_dams_m3" label="የክትር ጥገና (Check Dams m³)">
                <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}