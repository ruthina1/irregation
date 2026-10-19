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
  message
} from 'antd';
import {
  SearchOutlined,
  DownloadOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  ColumnWidthOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

// ───── AMHARA SECTIONS 4.3.1 & 4.3.3 SEED DATA (STANDALONE) ─────
const INITIAL_AMHARA_SWC = [
  {
    id: 'AMH-01',
    code: 'WS-FOG-01',
    name: 'Ribb River Sub-Catchment (የሪብ ወንዝ ተፋሰስ)',
    zone: 'South Gondar (ደቡብ ጎንደር)',
    woreda: 'Fogera (ፎገራ)',
    kebele: 'Woreta Zuria (ወረታ ዙሪያ)',
    soil_bunds_km: 24.5,
    fanya_juu_km: 16.2,
    bund_upgrades_km: 8.5,
    hillside_terraces_km: 18.0,
    trenched_terraces_km: 9.4,
    bench_terraces_km: 7.5
  },
  {
    id: 'AMH-02',
    code: 'WS-DER-02',
    name: 'Gumara Headwaters (ጉማራ ተፋሰስ)',
    zone: 'South Gondar (ደቡብ ጎንደር)',
    woreda: 'Dera (ደራ)',
    kebele: 'Anbesame (አንበሳሜ)',
    soil_bunds_km: 14.8,
    fanya_juu_km: 9.4,
    bund_upgrades_km: 4.2,
    hillside_terraces_km: 12.6,
    trenched_terraces_km: 6.2,
    bench_terraces_km: 4.8
  },
  {
    id: 'AMH-03',
    code: 'WS-BS-01',
    name: 'Chacha River Highland Tefases (የጫጫ ወንዝ ተፋሰስ)',
    zone: 'North Shewa (ሰሜን ሸዋ)',
    woreda: 'Basona Werana (ባሶና ወራና)',
    kebele: 'Goshe Bado (ጎሼ ባዶ)',
    soil_bunds_km: 31.0,
    fanya_juu_km: 18.5,
    bund_upgrades_km: 11.0,
    hillside_terraces_km: 26.4,
    trenched_terraces_km: 14.8,
    bench_terraces_km: 11.2
  },
  {
    id: 'AMH-04',
    code: 'WS-LEG-03',
    name: 'Borkena Gorge Catchment (ቦርከና ተፋሰስ)',
    zone: 'South Wollo (ደቡብ ወሎ)',
    woreda: 'Kalu (ቃሉ)',
    kebele: 'Kombolcha Zuria (ኮምቦልቻ ዙሪያ)',
    soil_bunds_km: 16.2,
    fanya_juu_km: 11.0,
    bund_upgrades_km: 5.5,
    hillside_terraces_km: 15.1,
    trenched_terraces_km: 7.8,
    bench_terraces_km: 6.4
  },
  {
    id: 'AMH-05',
    code: 'WS-MECH-01',
    name: 'Koga Dam Buffer Watershed (ኮጋ ግድብ ተፋሰስ)',
    zone: 'West Gojjam (ምዕራብ ጎጃም)',
    woreda: 'Mecha (መቻ)',
    kebele: 'Kudmi (ቁድሚ)',
    soil_bunds_km: 36.4,
    fanya_juu_km: 22.1,
    bund_upgrades_km: 12.4,
    hillside_terraces_km: 19.8,
    trenched_terraces_km: 10.5,
    bench_terraces_km: 8.9
  }
];

export default function SoilWaterConservationPage() {
  const [records, setRecords] = useState(INITIAL_AMHARA_SWC);

  // Administrative Filters
  const [selectedZone, setSelectedZone] = useState('ALL');
  const [selectedWoreda, setSelectedWoreda] = useState('ALL');
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

  // ───── SECTION 4.3.1 & 4.3.3 LINEAR AGGREGATIONS (KM) ─────
  const stats = useMemo(() => {
    let totalSoilBunds = 0;
    let totalFanyaJuu = 0;
    let totalBundUpgrades = 0;
    let totalHillside = 0;
    let totalTrenchedHillside = 0;
    let totalBenchTerraces = 0;

    records.forEach((r) => {
      totalSoilBunds += Number(r.soil_bunds_km) || 0;
      totalFanyaJuu += Number(r.fanya_juu_km) || 0;
      totalBundUpgrades += Number(r.bund_upgrades_km) || 0;
      totalHillside += Number(r.hillside_terraces_km) || 0;
      totalTrenchedHillside += Number(r.trenched_terraces_km) || 0;
      totalBenchTerraces += Number(r.bench_terraces_km) || 0;
    });

    const farmlandTotal = totalSoilBunds + totalFanyaJuu + totalBundUpgrades;
    const hillsideTotal = totalHillside + totalTrenchedHillside + totalBenchTerraces;
    const grandLinearKm = farmlandTotal + hillsideTotal;

    return {
      totalSoilBunds,
      totalFanyaJuu,
      totalBundUpgrades,
      totalHillside,
      totalTrenchedHillside,
      totalBenchTerraces,
      farmlandTotal,
      hillsideTotal,
      grandLinearKm
    };
  }, [records]);

  // ───── FILTER LOGIC ─────
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchSearch =
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.kebele.toLowerCase().includes(searchQuery.toLowerCase());

      const matchZone = selectedZone === 'ALL' || r.zone === selectedZone;
      const matchWoreda = selectedWoreda === 'ALL' || r.woreda === selectedWoreda;

      return matchSearch && matchZone && matchWoreda;
    });
  }, [records, searchQuery, selectedZone, selectedWoreda]);

  // ───── SUBMISSION & EDIT MODAL HANDLERS ─────
  const openCreateModal = () => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({
      zone: selectedZone !== 'ALL' ? selectedZone : 'South Gondar (ደቡብ ጎንደር)',
      woreda: '',
      kebele: '',
      soil_bunds_km: 0,
      fanya_juu_km: 0,
      bund_upgrades_km: 0,
      hillside_terraces_km: 0,
      trenched_terraces_km: 0,
      bench_terraces_km: 0
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
        message.success(`Updated terracing targets for ${editingRecord.code}`);
      } else {
        const newRecord = {
          ...values,
          id: `AMH-SWC-${Date.now()}`,
          code: values.code || `WS-AMH-${records.length + 1}`
        };
        setRecords((prev) => [newRecord, ...prev]);
        message.success('New SWC terracing return logged successfully!');
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
      'Code',
      'Watershed Name',
      'Zone',
      'Woreda',
      'Kebele',
      'Soil Bunds (km)',
      'Fanya-Juu (km)',
      'Bund Upgrades (km)',
      'Farmland Subtotal (km)',
      'Hillside Terraces (km)',
      'Trenched Terraces (km)',
      'Bench Terraces (km)',
      'Hillside Subtotal (km)',
      'Cumulative Terraces (km)'
    ];

    const rows = filteredRecords.map((r) => {
      const sb = Number(r.soil_bunds_km) || 0;
      const fj = Number(r.fanya_juu_km) || 0;
      const bu = Number(r.bund_upgrades_km) || 0;
      const farmSub = sb + fj + bu;

      const ht = Number(r.hillside_terraces_km) || 0;
      const tt = Number(r.trenched_terraces_km) || 0;
      const bt = Number(r.bench_terraces_km) || 0;
      const hillSub = ht + tt + bt;

      return [
        `"${r.code || ''}"`,
        `"${r.name || ''}"`,
        `"${r.zone || ''}"`,
        `"${r.woreda || ''}"`,
        `"${r.kebele || ''}"`,
        sb.toFixed(2),
        fj.toFixed(2),
        bu.toFixed(2),
        farmSub.toFixed(2),
        ht.toFixed(2),
        tt.toFixed(2),
        bt.toFixed(2),
        hillSub.toFixed(2),
        (farmSub + hillSub).toFixed(2)
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `Amhara_SWC_Terraces_Matrix_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success('SWC Terracing data exported');
  };

  // ───── COLUMNS ─────
  const columns = [
    {
      title: 'Tefases Code',
      dataIndex: 'code',
      key: 'code',
      width: 110,
      render: (t) => <Text strong style={{ color: '#164232' }}>{t}</Text>
    },
    {
      title: 'Catchment & Location',
      key: 'name',
      width: 220,
      render: (_, r) => (
        <div>
          <Text strong style={{ fontSize: '13px', display: 'block', color: '#0d281e' }}>{r.name}</Text>
          <Text type="secondary" style={{ fontSize: '11px' }}>
            <EnvironmentOutlined /> {r.zone} › {r.woreda} › {r.kebele}
          </Text>
        </div>
      )
    },
    {
      title: '4.3.1 Farmland Terracing (በእርሻ መሬት ላይ - km)',
      children: [
        {
          title: 'የማሳ እርከን (Soil Bunds)',
          dataIndex: 'soil_bunds_km',
          key: 'soil_bunds_km',
          width: 120,
          align: 'right',
          sorter: (a, b) => (a.soil_bunds_km || 0) - (b.soil_bunds_km || 0),
          render: (val) => `${Number(val || 0).toFixed(1)} km`
        },
        {
          title: 'የፋንያ ጁ (Fanya-Juu)',
          dataIndex: 'fanya_juu_km',
          key: 'fanya_juu_km',
          width: 120,
          align: 'right',
          sorter: (a, b) => (a.fanya_juu_km || 0) - (b.fanya_juu_km || 0),
          render: (val) => `${Number(val || 0).toFixed(1)} km`
        },
        {
          title: 'ደረጃ ማሳደግ (Upgrades)',
          dataIndex: 'bund_upgrades_km',
          key: 'bund_upgrades_km',
          width: 120,
          align: 'right',
          render: (val) => `${Number(val || 0).toFixed(1)} km`
        }
      ]
    },
    {
      title: '4.3.3 Hillside & Communal Slope Works (በጋራ ተራራ ላይ - km)',
      children: [
        {
          title: 'የጋራ እርከን (Hillside)',
          dataIndex: 'hillside_terraces_km',
          key: 'hillside_terraces_km',
          width: 120,
          align: 'right',
          render: (val) => `${Number(val || 0).toFixed(1)} km`
        },
        {
          title: 'ጥልቅ ትሬንች (Trenched)',
          dataIndex: 'trenched_terraces_km',
          key: 'trenched_terraces_km',
          width: 120,
          align: 'right',
          render: (val) => `${Number(val || 0).toFixed(1)} km`
        },
        {
          title: 'የቤንች እርከን (Bench)',
          dataIndex: 'bench_terraces_km',
          key: 'bench_terraces_km',
          width: 120,
          align: 'right',
          render: (val) => `${Number(val || 0).toFixed(1)} km`
        }
      ]
    },
    {
      title: 'Total Linear km',
      key: 'cumulative',
      width: 130,
      align: 'right',
      sorter: (a, b) => {
        const sumA =
          (a.soil_bunds_km || 0) +
          (a.fanya_juu_km || 0) +
          (a.bund_upgrades_km || 0) +
          (a.hillside_terraces_km || 0) +
          (a.trenched_terraces_km || 0) +
          (a.bench_terraces_km || 0);
        const sumB =
          (b.soil_bunds_km || 0) +
          (b.fanya_juu_km || 0) +
          (b.bund_upgrades_km || 0) +
          (b.hillside_terraces_km || 0) +
          (b.trenched_terraces_km || 0) +
          (b.bench_terraces_km || 0);
        return sumA - sumB;
      },
      render: (_, r) => {
        const total =
          (r.soil_bunds_km || 0) +
          (r.fanya_juu_km || 0) +
          (r.bund_upgrades_km || 0) +
          (r.hillside_terraces_km || 0) +
          (r.trenched_terraces_km || 0) +
          (r.bench_terraces_km || 0);
        return (
          <Tag color="green" style={{ fontWeight: 700, padding: '2px 8px' }}>
            {total.toFixed(1)} km
          </Tag>
        );
      }
    },
    {
      title: 'Action',
      key: 'action',
      width: 70,
      align: 'center',
      render: (_, r) => (
        <Tooltip title="Edit Terracing Data">
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
            Farmland & Hillside SWC (የእርከን ሥራዎች)
          </Title>
          <Text type="secondary" style={{ fontSize: '13px' }}>
            Amhara Bureau of Agriculture · Sections 4.3.1 & 4.3.3: Soil Bunds, Fanya-Juu, Hillside & Bench Terracing in Kilometers (km)
          </Text>
        </div>
        <Space>
          <Button icon={<DownloadOutlined />} onClick={handleExportCSV}>
            Export Terracing CSV
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{ background: '#164232', borderColor: '#164232', fontWeight: 600 }}
            onClick={openCreateModal}
          >
            + Log Terracing Return (የእርከን ሥራ መዝግብ)
          </Button>
        </Space>
      </div>

      {/* ───── AGGREGATE STAT CARDS ───── */}
      <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <Statistic
              title={<span style={{ fontSize: '12px', fontWeight: 700 }}>Cumulative Terraces Built</span>}
              value={stats.grandLinearKm.toFixed(1)}
              prefix={<ColumnWidthOutlined style={{ color: '#186e41', marginRight: '6px' }} />}
              suffix="km"
              valueStyle={{ fontWeight: 700, color: '#0d281e' }}
            />
            <div style={{ marginTop: '8px', fontSize: '11px', color: '#666' }}>
              Farmland: {stats.farmlandTotal.toFixed(1)} km | Hillside: {stats.hillsideTotal.toFixed(1)} km
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <Statistic
              title={<span style={{ fontSize: '12px', fontWeight: 700 }}>የማሳ ላይ እርከን (Soil Bunds)</span>}
              value={stats.totalSoilBunds.toFixed(1)}
              prefix={<span style={{ marginRight: '6px' }}>🧱</span>}
              suffix="km"
              valueStyle={{ fontWeight: 700, color: '#1b633f' }}
            />
            <div style={{ marginTop: '8px', fontSize: '11px', color: '#666' }}>
              Level & graded soil bunds
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <Statistic
              title={<span style={{ fontSize: '12px', fontWeight: 700 }}>የፋንያ ጁ እርከን (Fanya-Juu)</span>}
              value={stats.totalFanyaJuu.toFixed(1)}
              prefix={<span style={{ marginRight: '6px' }}>⛰️</span>}
              suffix="km"
              valueStyle={{ fontWeight: 700, color: '#0958d9' }}
            />
            <div style={{ marginTop: '8px', fontSize: '11px', color: '#666' }}>
              Up-slope thrown soil embankment
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <Statistic
              title={<span style={{ fontSize: '12px', fontWeight: 700 }}>የጋራና ቤንች እርከን (Hillside & Bench)</span>}
              value={(stats.totalHillside + stats.totalBenchTerraces).toFixed(1)}
              prefix={<span style={{ marginRight: '6px' }}>🪜</span>}
              suffix="km"
              valueStyle={{ fontWeight: 700, color: '#722ed1' }}
            />
            <div style={{ marginTop: '8px', fontSize: '11px', color: '#666' }}>
              Steep slope and communal conservation
            </div>
          </Card>
        </Col>
      </Row>

      {/* ───── FILTER TOOLBAR & MULTI-HEADER TABLE ───── */}
      <Card bordered={false} style={{ borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <Row gutter={[12, 12]} style={{ marginBottom: '16px' }} align="middle">
          <Col xs={24} sm={10} md={7}>
            <Input
              prefix={<SearchOutlined style={{ color: '#8aa396' }} />}
              placeholder="Search code, name, or kebele..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} sm={7} md={5}>
            <Select style={{ width: '100%' }} value={selectedZone} onChange={handleZoneChange}>
              <Option value="ALL">All Zones (ሁሉም ዞኖች)</Option>
              {zones.map((z) => (
                <Option key={z} value={z}>{z}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} sm={7} md={5}>
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
          <Col xs={24} sm={24} md={5} style={{ textAlign: 'right' }}>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                setSearchQuery('');
                setSelectedZone('ALL');
                setSelectedWoreda('ALL');
              }}
            >
              Reset Filters
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

      {/* ───── SECTION 4.3.1 & 4.3.3 DATA ENTRY & EDIT MODAL ───── */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ColumnWidthOutlined style={{ color: '#164232' }} />
            <span style={{ fontWeight: 700, color: '#0d281e' }}>
              {editingRecord
                ? `Update SWC Terracing: ${editingRecord.name}`
                : 'Log New Terracing Works (የእርከን ሥራ መመዝገቢያ ቅጽ)'}
            </span>
          </div>
        }
        open={isModalOpen}
        onOk={handleModalSave}
        onCancel={() => setIsModalOpen(false)}
        width={720}
        destroyOnClose
        okText={editingRecord ? 'Save Changes' : 'Submit Terracing Return'}
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

          <div style={{ height: '1px', background: '#f0f0f0', margin: '12px 0 16px' }} />
          <Text strong style={{ display: 'block', marginBottom: '12px', color: '#164232' }}>
            Section 4.3.1 Farmland Terracing Work (በእርሻ መሬት ላይ የተከናወነ - km)
          </Text>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="soil_bunds_km"
                label="የማሳ እርከን (Soil Bunds km)"
                rules={[{ required: true, message: 'Required' }]}
              >
                <InputNumber style={{ width: '100%' }} step={0.1} min={0} placeholder="0.0" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="fanya_juu_km"
                label="የፋንያ ጁ (Fanya-Juu km)"
                rules={[{ required: true, message: 'Required' }]}
              >
                <InputNumber style={{ width: '100%' }} step={0.1} min={0} placeholder="0.0" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="bund_upgrades_km"
                label="ደረጃ ማሳደግ (Bund Upgrades km)"
                rules={[{ required: true, message: 'Required' }]}
              >
                <InputNumber style={{ width: '100%' }} step={0.1} min={0} placeholder="0.0" />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ height: '1px', background: '#f0f0f0', margin: '12px 0 16px' }} />
          <Text strong style={{ display: 'block', marginBottom: '12px', color: '#164232' }}>
            Section 4.3.3 Communal Slope & Hillside Terracing (በጋራ ተራራ ላይ የተከናወነ - km)
          </Text>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="hillside_terraces_km"
                label="የጋራ እርከን (Hillside km)"
                rules={[{ required: true, message: 'Required' }]}
              >
                <InputNumber style={{ width: '100%' }} step={0.1} min={0} placeholder="0.0" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="trenched_terraces_km"
                label="ጥልቅ ትሬንች (Trenched km)"
                rules={[{ required: true, message: 'Required' }]}
              >
                <InputNumber style={{ width: '100%' }} step={0.1} min={0} placeholder="0.0" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="bench_terraces_km"
                label="የቤንች እርከን (Bench km)"
                rules={[{ required: true, message: 'Required' }]}
              >
                <InputNumber style={{ width: '100%' }} step={0.1} min={0} placeholder="0.0" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}