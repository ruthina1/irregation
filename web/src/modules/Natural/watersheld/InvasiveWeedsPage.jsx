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
  Badge,
  message
} from 'antd';
import {
  SearchOutlined,
  DownloadOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  AlertOutlined,
  ThunderboltOutlined,
  FireOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

// ───── AMHARA SECTION 4.3.5 SEED DATA (STANDALONE) ─────
const INITIAL_AMHARA_WEEDS = [
  {
    id: 'AMH-WD-01',
    code: 'WS-FOG-01',
    name: 'Ribb River Sub-Catchment (የሪብ ወንዝ ተፋሰስ)',
    zone: 'South Gondar (ደቡብ ጎንደር)',
    woreda: 'Fogera (ፎገራ)',
    kebele: 'Woreta Zuria (ወረታ ዙሪያ)',
    weed_water_hyacinth_ha: 34.5,
    weed_lantana_camara_ha: 6.2,
    weed_other_ha: 4.8
  },
  {
    id: 'AMH-WD-02',
    code: 'WS-DER-02',
    name: 'Gumara Headwaters (ጉማራ ተፋሰስ)',
    zone: 'South Gondar (ደቡብ ጎንደር)',
    woreda: 'Dera (ደራ)',
    kebele: 'Anbesame (አንበሳሜ)',
    weed_water_hyacinth_ha: 18.2,
    weed_lantana_camara_ha: 4.1,
    weed_other_ha: 2.5
  },
  {
    id: 'AMH-WD-03',
    code: 'WS-BS-01',
    name: 'Chacha River Highland Tefases (የጫጫ ወንዝ ተፋሰስ)',
    zone: 'North Shewa (ሰሜን ሸዋ)',
    woreda: 'Basona Werana (ባሶና ወራና)',
    kebele: 'Goshe Bado (ጎሼ ባዶ)',
    weed_water_hyacinth_ha: 0.0,
    weed_lantana_camara_ha: 11.8,
    weed_other_ha: 5.6
  },
  {
    id: 'AMH-WD-04',
    code: 'WS-LEG-03',
    name: 'Borkena Gorge Catchment (ቦርከና ተፋሰስ)',
    zone: 'South Wollo (ደቡብ ወሎ)',
    woreda: 'Kalu (ቃሉ)',
    kebele: 'Kombolcha Zuria (ኮምቦልቻ ዙሪያ)',
    weed_water_hyacinth_ha: 0.0,
    weed_lantana_camara_ha: 14.5,
    weed_other_ha: 8.2
  },
  {
    id: 'AMH-WD-05',
    code: 'WS-MECH-01',
    name: 'Koga Dam Buffer Watershed (ኮጋ ግድብ ተፋሰስ)',
    zone: 'West Gojjam (ምዕራብ ጎጃም)',
    woreda: 'Mecha (መቻ)',
    kebele: 'Kudmi (ቁድሚ)',
    weed_water_hyacinth_ha: 42.0,
    weed_lantana_camara_ha: 3.8,
    weed_other_ha: 6.4
  }
];

export default function InvasiveWeedsPage() {
  const [records, setRecords] = useState(INITIAL_AMHARA_WEEDS);

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

  // ───── SECTION 4.3.5 AGGREGATIONS (HECTARES) ─────
  const stats = useMemo(() => {
    let totalHyacinth = 0;
    let totalLantana = 0;
    let totalOther = 0;

    records.forEach((r) => {
      totalHyacinth += Number(r.weed_water_hyacinth_ha) || 0;
      totalLantana += Number(r.weed_lantana_camara_ha) || 0;
      totalOther += Number(r.weed_other_ha) || 0;
    });

    const grandTotalHa = totalHyacinth + totalLantana + totalOther;

    return {
      totalHyacinth,
      totalLantana,
      totalOther,
      grandTotalHa
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

  // ───── MODAL CONTROLS ─────
  const openCreateModal = () => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({
      zone: selectedZone !== 'ALL' ? selectedZone : 'South Gondar (ደቡብ ጎንደር)',
      woreda: '',
      kebele: '',
      weed_water_hyacinth_ha: 0,
      weed_lantana_camara_ha: 0,
      weed_other_ha: 0
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
        message.success(`Updated weed control targets for ${editingRecord.code}`);
      } else {
        const newRecord = {
          ...values,
          id: `AMH-WD-${Date.now()}`,
          code: values.code || `WS-AMH-${records.length + 1}`
        };
        setRecords((prev) => [newRecord, ...prev]);
        message.success('New weed eradication return logged successfully!');
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
      'Zone (ዞን)',
      'Woreda (ወረዳ)',
      'Kebele (ቀበሌ)',
      'Water Hyacinth (Ha) - እንቦጭ',
      'Lantana Camara (Ha) - የወፍ ቆሎ',
      'Other Invasives (Ha) - ሌሎች መጤ አረሞች',
      'Total Cleared (Ha) - ጠቅላላ የተወገደ'
    ];

    const rows = filteredRecords.map((r) => {
      const hy = Number(r.weed_water_hyacinth_ha) || 0;
      const lc = Number(r.weed_lantana_camara_ha) || 0;
      const ot = Number(r.weed_other_ha) || 0;
      const subTotal = hy + lc + ot;

      return [
        `"${r.code || ''}"`,
        `"${r.name || ''}"`,
        `"${r.zone || ''}"`,
        `"${r.woreda || ''}"`,
        `"${r.kebele || ''}"`,
        hy.toFixed(2),
        lc.toFixed(2),
        ot.toFixed(2),
        subTotal.toFixed(2)
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `Amhara_Section_4_3_5_Invasive_Weeds_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success('Invasive weed eradication report exported');
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
      title: 'Catchment & Location',
      key: 'name',
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
      title: 'እንቦጭ (Water Hyacinth)',
      dataIndex: 'weed_water_hyacinth_ha',
      key: 'weed_water_hyacinth_ha',
      width: 180,
      align: 'right',
      sorter: (a, b) => (a.weed_water_hyacinth_ha || 0) - (b.weed_water_hyacinth_ha || 0),
      render: (val) => (
        <span style={{ fontWeight: 600, color: val > 0 ? '#0958d9' : '#8c8c8c' }}>
          {Number(val || 0).toFixed(2)} Ha
        </span>
      )
    },
    {
      title: 'የወፍ ቆሎ (Lantana Camara)',
      dataIndex: 'weed_lantana_camara_ha',
      key: 'weed_lantana_camara_ha',
      width: 180,
      align: 'right',
      sorter: (a, b) => (a.weed_lantana_camara_ha || 0) - (b.weed_lantana_camara_ha || 0),
      render: (val) => (
        <span style={{ fontWeight: 600, color: val > 0 ? '#d46b08' : '#8c8c8c' }}>
          {Number(val || 0).toFixed(2)} Ha
        </span>
      )
    },
    {
      title: 'ሌሎች መጤ አረሞች (Other Weeds)',
      dataIndex: 'weed_other_ha',
      key: 'weed_other_ha',
      width: 180,
      align: 'right',
      sorter: (a, b) => (a.weed_other_ha || 0) - (b.weed_other_ha || 0),
      render: (val) => `${Number(val || 0).toFixed(2)} Ha`
    },
    {
      title: 'ጠቅላላ የተወገደ (Total Cleared)',
      key: 'total_cleared',
      width: 170,
      align: 'right',
      sorter: (a, b) => {
        const sumA = (a.weed_water_hyacinth_ha || 0) + (a.weed_lantana_camara_ha || 0) + (a.weed_other_ha || 0);
        const sumB = (b.weed_water_hyacinth_ha || 0) + (b.weed_lantana_camara_ha || 0) + (b.weed_other_ha || 0);
        return sumA - sumB;
      },
      render: (_, r) => {
        const total = (r.weed_water_hyacinth_ha || 0) + (r.weed_lantana_camara_ha || 0) + (r.weed_other_ha || 0);
        return (
          <Tag color="volcano" style={{ fontWeight: 700, borderRadius: '12px', padding: '2px 10px' }}>
            {total.toFixed(2)} Ha
          </Tag>
        );
      }
    },
    {
      title: 'Action',
      key: 'action',
      width: 80,
      align: 'center',
      render: (_, r) => (
        <Tooltip title="Update Weed Eradication">
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
            Invasive Weed Control (መጤ ወራሪ አረሞች ማስወገድ)
          </Title>
          <Text type="secondary" style={{ fontSize: '13px' }}>
            Amhara Bureau of Agriculture · Matrix Section 4.3.5: Eradication of Water Hyacinth, Lantana Camara, and Noxious Weeds (Ha)
          </Text>
        </div>
        <Space>
          <Button icon={<DownloadOutlined />} onClick={handleExportCSV}>
            Export Weed Report
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{ background: '#164232', borderColor: '#164232', fontWeight: 600 }}
            onClick={openCreateModal}
          >
            + Log Weed Eradication Return (የወራሪ አረም ማስወገድ መዝግብ)
          </Button>
        </Space>
      </div>

      {/* ───── AGGREGATE KPI CARDS ───── */}
      <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <Statistic
              title={<span style={{ fontSize: '12px', fontWeight: 700 }}>Total Invasives Eradicated</span>}
              value={stats.grandTotalHa.toFixed(2)}
              prefix={<FireOutlined style={{ color: '#cf1322', marginRight: '6px' }} />}
              suffix="Ha"
              valueStyle={{ fontWeight: 700, color: '#cf1322' }}
            />
            <div style={{ marginTop: '8px', fontSize: '11px', color: '#666' }}>
              ጠቅላላ የተወገደ መጤ ወራሪ አረም በሄክታር
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <Statistic
              title={<span style={{ fontSize: '12px', fontWeight: 700 }}>እንቦጭ (Water Hyacinth)</span>}
              value={stats.totalHyacinth.toFixed(2)}
              prefix={<span style={{ marginRight: '6px' }}>🌊</span>}
              suffix="Ha"
              valueStyle={{ fontWeight: 700, color: '#0958d9' }}
            />
            <div style={{ marginTop: '8px', fontSize: '11px', color: '#666' }}>
              Lake Tana & riparian aquatic cleanout
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <Statistic
              title={<span style={{ fontSize: '12px', fontWeight: 700 }}>የወፍ ቆሎ (Lantana Camara)</span>}
              value={stats.totalLantana.toFixed(2)}
              prefix={<ThunderboltOutlined style={{ color: '#fa8c16', marginRight: '6px' }} />}
              suffix="Ha"
              valueStyle={{ fontWeight: 700, color: '#d46b08' }}
            />
            <div style={{ marginTop: '8px', fontSize: '11px', color: '#666' }}>
              Pasture & rangeland mechanical uprooting
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <Statistic
              title={<span style={{ fontSize: '12px', fontWeight: 700 }}>ሌሎች መጤ አረሞች (Other Weeds)</span>}
              value={stats.totalOther.toFixed(2)}
              prefix={<AlertOutlined style={{ color: '#52c41a', marginRight: '6px' }} />}
              suffix="Ha"
              valueStyle={{ fontWeight: 700, color: '#237804' }}
            />
            <div style={{ marginTop: '8px', fontSize: '11px', color: '#666' }}>
              Parthenium (ኮንግረስ አረም) & thorny scrub
            </div>
          </Card>
        </Col>
      </Row>

      {/* ───── FILTER TOOLBAR & TABLE ───── */}
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
          pagination={{ pageSize: 8, showTotal: (t) => `Total ${t} watershed returns recorded` }}
        />
      </Card>

      {/* ───── DATA ENTRY & EDIT MODAL ───── */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FireOutlined style={{ color: '#164232' }} />
            <span style={{ fontWeight: 700, color: '#0d281e' }}>
              {editingRecord
                ? `Update Weed Control: ${editingRecord.name}`
                : 'Log Invasive Weed Eradication (የወራሪ አረም ማስወገድ መመዝገቢያ)'}
            </span>
          </div>
        }
        open={isModalOpen}
        onOk={handleModalSave}
        onCancel={() => setIsModalOpen(false)}
        width={700}
        destroyOnClose
        okText={editingRecord ? 'Save Changes' : 'Submit Weed Return'}
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
            Section 4.3.5 Invasive Plant Eradication (በሄክታር የተወገደ - Ha)
          </Text>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="weed_water_hyacinth_ha"
                label="እንቦጭ (Water Hyacinth Ha)"
                rules={[{ required: true, message: 'Required' }]}
              >
                <InputNumber style={{ width: '100%' }} step={0.1} min={0} placeholder="0.0" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="weed_lantana_camara_ha"
                label="የወፍ ቆሎ (Lantana Ha)"
                rules={[{ required: true, message: 'Required' }]}
              >
                <InputNumber style={{ width: '100%' }} step={0.1} min={0} placeholder="0.0" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="weed_other_ha"
                label="ሌሎች መጤ አረሞች (Other Ha)"
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