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
  Steps,
  Progress,
  Divider,
  message
} from 'antd';
import {
  SearchOutlined,
  DownloadOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  LeftOutlined,
  RightOutlined,
  CheckOutlined,
  ToolOutlined,
  EnvironmentOutlined,
  CompassOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const AMHARA_ZONES = [
  'ምስራቅ ጎጃም', 'ምዕራብ ጎጃም', 'ደቡብ ጎንደር', 'ሰሜን ጎንደር',
  'ማዕከላዊ ጎንደር', 'ምዕራብ ጎንደር', 'ሰሜን ሸዋ', 'ደቡብ ወሎ',
  'ሰሜን ወሎ', 'አዊ', 'ዋግ ኽምራ', 'ኦሮሚያ ልዩ ዞን'
];

export default function CampaignReportingPage() {
  const [records, setRecords] = useState([]);
  const [selectedZone, setSelectedZone] = useState('ALL');
  const [selectedYear, setSelectedYear] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Multi-step modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();

  // Dynamic filter values
  const availableYears = useMemo(() => {
    const currentYear = dayjs().year();
    const yrs = Array.from(new Set(records.map((r) => r.year).filter(Boolean)));
    if (!yrs.includes(currentYear)) yrs.push(currentYear);
    return yrs.sort((a, b) => b - a);
  }, [records]);

  // Derived Telemetry & Filtered View
  const processedData = useMemo(() => {
    return records.map((r) => {
      const male = Number(r.labor_male) || 0;
      const female = Number(r.labor_female) || 0;
      const totalLabor = male + female;
      const femaleRate = totalLabor > 0 ? Math.round((female / totalLabor) * 100) : 0;

      const bundsKm = (Number(r.soil_bunds_km) || 0) + (Number(r.fanya_juu_km) || 0) + (Number(r.bund_upgrades_km) || 0);
      const earthworkM3 = (Number(r.cutoff_drains_m3) || 0) + (Number(r.waterways_m3) || 0);

      // Logistics Tool Totals
      const surveyTools = (Number(r.line_level_count) || 0) + (Number(r.water_level_count) || 0) + (Number(r.measuring_tape_count) || 0) + (Number(r.a_frame_count) || 0);
      const earthTools = (Number(r.pickaxe_count) || 0) + (Number(r.shovel_count) || 0) + (Number(r.sledgehammer_count) || 0) + (Number(r.wheelbarrow_count) || 0);

      return {
        ...r,
        totalLabor,
        femaleRate,
        bundsKm,
        earthworkM3,
        surveyTools,
        earthTools,
        totalTools: surveyTools + earthTools
      };
    });
  }, [records]);

  const filteredData = useMemo(() => {
    return processedData.filter((r) => {
      const matchSearch =
        (r.name && r.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (r.code && r.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (r.woreda && r.woreda.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchZone = selectedZone === 'ALL' || r.zone === selectedZone;
      const matchYear = selectedYear === 'ALL' || Number(r.year) === Number(selectedYear);

      return matchSearch && matchZone && matchYear;
    });
  }, [processedData, searchQuery, selectedZone, selectedYear]);

  // Summary Metrics
  const stats = useMemo(() => {
    let totalMobilized = 0;
    let totalFemale = 0;
    let totalBunds = 0;
    let totalToolsDeployed = 0;

    filteredData.forEach((r) => {
      totalMobilized += r.totalLabor;
      totalFemale += Number(r.labor_female) || 0;
      totalBunds += r.bundsKm;
      totalToolsDeployed += r.totalTools;
    });

    const femaleShare = totalMobilized > 0 ? Math.round((totalFemale / totalMobilized) * 100) : 0;

    return { totalMobilized, femaleShare, totalBunds, totalToolsDeployed };
  }, [filteredData]);

  // Wizard Steps Field Scheme
  const stepFields = [
    ['name', 'code', 'zone', 'woreda', 'kebele', 'status', 'year', 'total_area_ha'],
    ['labor_male', 'labor_female', 'trained_farmers'],
    ['soil_bunds_km', 'fanya_juu_km', 'bund_upgrades_km', 'cutoff_drains_m3', 'waterways_m3', 'area_closure_ha'],
    ['line_level_count', 'water_level_count', 'measuring_tape_count', 'a_frame_count', 'pickaxe_count', 'shovel_count', 'sledgehammer_count', 'wheelbarrow_count']
  ];

  const handleNextStep = async () => {
    try {
      await form.validateFields(stepFields[currentStep]);
      setCurrentStep((prev) => prev + 1);
    } catch {
      message.warning('እባክዎ የተጠየቁትን መረጃዎች በትክክል ይሙሉ');
    }
  };

  const handlePrevStep = () => setCurrentStep((prev) => prev - 1);

  const openCreateModal = () => {
    setEditingRecord(null);
    setCurrentStep(0);
    form.resetFields();
    form.setFieldsValue({
      zone: selectedZone !== 'ALL' ? selectedZone : undefined,
      year: selectedYear !== 'ALL' ? Number(selectedYear) : dayjs().year(),
      status: 'existing',
      total_area_ha: 0,
      labor_male: 0,
      labor_female: 0,
      trained_farmers: 0,
      soil_bunds_km: 0,
      fanya_juu_km: 0,
      bund_upgrades_km: 0,
      cutoff_drains_m3: 0,
      waterways_m3: 0,
      area_closure_ha: 0,
      line_level_count: 0,
      water_level_count: 0,
      measuring_tape_count: 0,
      a_frame_count: 0,
      pickaxe_count: 0,
      shovel_count: 0,
      sledgehammer_count: 0,
      wheelbarrow_count: 0
    });
    setIsModalOpen(true);
  };

  const openEditModal = (rec) => {
    setEditingRecord(rec);
    setCurrentStep(0);
    form.setFieldsValue(rec);
    setIsModalOpen(true);
  };

  const handleSaveRecord = async () => {
    try {
      const values = await form.validateFields();
      if (editingRecord) {
        setRecords((prev) =>
          prev.map((r) => (r.id === editingRecord.id ? { ...editingRecord, ...values } : r))
        );
        message.success(`የተፋሰስ ${values.code} መረጃ ተሻሽሏል`);
      } else {
        const newRow = {
          ...values,
          id: `CMP-${Date.now()}`
        };
        setRecords((prev) => [newRow, ...prev]);
        message.success('አዲስ የተፋሰስ ዘመቻና የመሳሪያ ሪፖርት ተመዝግቧል');
      }
      setIsModalOpen(false);
    } catch {
      message.error('እባክዎ የተሳሳቱ መረጃዎችን ያስተካክሉ');
    }
  };

  // CSV Export with Section 4.4 Logistics
  const handleExportCSV = () => {
    if (!filteredData.length) {
      message.warning('የሚወጣ መረጃ የለም');
      return;
    }

    const headers = [
      'ተፋሰስ መለያ', 'የተፋሰስ ስም', 'ዞን', 'ወረዳ', 'ቀበሌ', 'ዓመት', 'ይዞታ',
      'ወንድ ተሳታፊ', 'ሴት ተሳታፊ', 'ቀያሽ አርሶ አደር', 'የማሳ እርከን (km)',
      'የፋንያ ጁ (km)', 'ደረጃ ማሳደግ (km)', 'ቦይ ቁፋሮ (m³)', 'ከንክኪ የተከለለ (Ha)',
      'ክልስ ደረጃ (Line Level)', 'ውሃ ልክ (Water Level)', 'ሜትር (Tape)', 'A-ፍሬም',
      'ዶማ (Pickaxe)', 'አካፋ (Shovel)', 'መዶሻ (Hammer)', 'ጋሪ (Wheelbarrow)'
    ];

    const rows = filteredData.map((r) => [
      `"${r.code || ''}"`,
      `"${r.name || ''}"`,
      `"${r.zone || ''}"`,
      `"${r.woreda || ''}"`,
      `"${r.kebele || ''}"`,
      r.year,
      r.status === 'existing' ? 'ነባር' : 'አዲስ',
      r.labor_male || 0,
      r.labor_female || 0,
      r.trained_farmers || 0,
      r.soil_bunds_km || 0,
      r.fanya_juu_km || 0,
      r.bund_upgrades_km || 0,
      r.earthworkM3,
      r.area_closure_ha || 0,
      r.line_level_count || 0,
      r.water_level_count || 0,
      r.measuring_tape_count || 0,
      r.a_frame_count || 0,
      r.pickaxe_count || 0,
      r.shovel_count || 0,
      r.sledgehammer_count || 0,
      r.wheelbarrow_count || 0
    ]);

    const metadata = [
      '# የአማራ ብሔራዊ ክልላዊ መንግሥት ግብርና ቢሮ · የተፈጥሮ ሀብት ልማት ዳይሬክቶሬት',
      '# የተቀናጀ የሰው ኃይል ንቅናቄ፣ ፊዚካል ሥራዎች እና የልማት መሳሪያዎች ሪፖርት',
      `# ቀን: ${dayjs().format('YYYY-MM-DD HH:mm:ss')}`,
      ''
    ].join('\n');

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + metadata + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `Amhara_SWC_Campaign_Logistics_${dayjs().format('YYYY-MM-DD')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = [
    {
      title: 'መለያ',
      dataIndex: 'code',
      key: 'code',
      width: 105,
      render: (t) => <Text strong style={{ color: '#133324', fontFamily: 'monospace' }}>{t}</Text>
    },
    {
      title: 'ተፋሰስና አስተዳደራዊ ወሰን',
      key: 'name',
      render: (_, r) => (
        <div>
          <Text strong style={{ color: '#133324', display: 'block' }}>{r.name}</Text>
          <Text type="secondary" style={{ fontSize: '11px' }}>
            <EnvironmentOutlined /> {r.zone} › {r.woreda} › {r.kebele}
          </Text>
        </div>
      )
    },
    {
      title: 'ዓመት',
      dataIndex: 'year',
      key: 'year',
      width: 85,
      align: 'center',
      render: (val) => <span style={{ fontWeight: 600 }}>{val} ዓ.ም</span>
    },
    {
      title: '4.2 የሰው ኃይል (Labor)',
      children: [
        {
          title: 'ድምር ጉልበት',
          dataIndex: 'totalLabor',
          key: 'totalLabor',
          width: 105,
          align: 'right',
          render: (val) => <span style={{ fontWeight: 600 }}>{val.toLocaleString()}</span>
        },
        {
          title: 'የሴቶች ተሳትፎ',
          key: 'femaleRatio',
          width: 120,
          render: (_, r) => (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                <span>{r.labor_female || 0} ♀</span>
                <strong>{r.femaleRate}%</strong>
              </div>
              <Progress percent={r.femaleRate} size="small" showInfo={false} strokeColor="#13c2c2" />
            </div>
          )
        }
      ]
    },
    {
      title: '4.3 ፊዚካል ሥራዎች (Conservation)',
      children: [
        {
          title: 'እርከን (km)',
          dataIndex: 'bundsKm',
          key: 'bundsKm',
          width: 105,
          align: 'right',
          render: (val) => <span style={{ fontWeight: 600, color: '#186e41' }}>{val.toFixed(1)} km</span>
        },
        {
          title: 'ቁፋሮ (m³)',
          dataIndex: 'earthworkM3',
          key: 'earthworkM3',
          width: 105,
          align: 'right',
          render: (val) => `${val.toLocaleString()} m³`
        }
      ]
    },
    {
      title: '4.4 የመሳሪያ አቅርቦት (Tool Logistics)',
      children: [
        {
          title: 'የቅየሳ እቃዎች',
          dataIndex: 'surveyTools',
          key: 'surveyTools',
          width: 100,
          align: 'right',
          render: (val) => (
            <Tooltip title="ክልስ ደረጃ፣ ውሃ ልክ፣ ሜትርና A-ፍሬም">
              <Tag color="cyan">{val} pcs</Tag>
            </Tooltip>
          )
        },
        {
          title: 'የቁፋሮ እቃዎች',
          dataIndex: 'earthTools',
          key: 'earthTools',
          width: 100,
          align: 'right',
          render: (val) => (
            <Tooltip title="ዶማ፣ አካፋ፣ መዶሻና ጋሪ">
              <Tag color="geekblue">{val} pcs</Tag>
            </Tooltip>
          )
        }
      ]
    },
    {
      title: 'ተግባር',
      key: 'action',
      width: 75,
      align: 'center',
      fixed: 'right',
      render: (_, r) => (
        <Tooltip title="መረጃውን አሻሽል">
          <Button
            size="small"
            type="text"
            icon={<EditOutlined style={{ color: '#133324' }} />}
            onClick={() => openEditModal(r)}
          />
        </Tooltip>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px', background: '#f4f7f5' }}>

      {/* Header */}
      <Card
        bordered={false}
        style={{
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #0c2117 0%, #133324 60%, #1a4732 100%)',
          color: '#ffffff'
        }}
        bodyStyle={{ padding: '20px 24px' }}
      >
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} md={16}>
            <Title level={3} style={{ color: '#ffffff', margin: 0, fontWeight: 700 }}>
              የተፋሰስ ዘመቻ፣ ጉልበትና መሳሪያዎች ሪፖርት (Campaign & Logistics)
            </Title>
            <Text style={{ color: '#badbc9', fontSize: '12px' }}>
              የሰው ኃይል ንቅናቄ (4.2)፣ ፊዚካል ሥራዎች (4.3) እና የልማትና ቅየሳ መሳሪያዎች ስርጭት (4.4)
            </Text>
          </Col>
          <Col xs={24} md={8} style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button icon={<DownloadOutlined />} onClick={handleExportCSV} style={{ background: 'transparent', color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}>
              Export CSV
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal} style={{ background: '#225940', borderColor: '#2f7555', fontWeight: 600 }}>
              + አዲስ ዘመቻ መዝግብ
            </Button>
          </Col>
        </Row>
      </Card>

      {/* KPI HUD */}
      <Row gutter={[12, 12]}>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: '6px', border: '1px solid #e1e8e3' }} bodyStyle={{ padding: '14px 16px' }}>
            <Text type="secondary" style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700 }}>ድምር የተንቀሳቀሰ ጉልበት</Text>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#133324', marginTop: '2px' }}>
              {stats.totalMobilized.toLocaleString()} <span style={{ fontSize: '11px', fontWeight: 400, color: '#737b77' }}>pers-days</span>
            </div>
            <div style={{ fontSize: '11px', color: '#55665d', marginTop: '2px' }}>የሴቶች ድርሻ: <strong>{stats.femaleShare}%</strong></div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: '6px', border: '1px solid #e1e8e3' }} bodyStyle={{ padding: '14px 16px' }}>
            <Text type="secondary" style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700 }}>የተገነባ እርከን</Text>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#186e41', marginTop: '2px' }}>
              {stats.totalBunds.toFixed(1)} <span style={{ fontSize: '11px', fontWeight: 400, color: '#737b77' }}>km</span>
            </div>
            <div style={{ fontSize: '11px', color: '#55665d', marginTop: '2px' }}>ማሳ፣ ፋንያ ጁና ማሳደግ</div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: '6px', border: '1px solid #e1e8e3' }} bodyStyle={{ padding: '14px 16px' }}>
            <Text type="secondary" style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700 }}>የተሰራጩ መሳሪያዎች</Text>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#0958d9', marginTop: '2px' }}>
              {stats.totalToolsDeployed.toLocaleString()} <span style={{ fontSize: '11px', fontWeight: 400, color: '#737b77' }}>እቃዎች</span>
            </div>
            <div style={{ fontSize: '11px', color: '#55665d', marginTop: '2px' }}>የቅየሳና ቁፋሮ መሳሪያዎች</div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: '6px', border: '1px solid #e1e8e3' }} bodyStyle={{ padding: '14px 16px' }}>
            <Text type="secondary" style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700 }}>የተዘገቡ ተፋሰሶች</Text>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#133324', marginTop: '2px' }}>
              {filteredData.length} <span style={{ fontSize: '11px', fontWeight: 400, color: '#737b77' }}>ሳይቶች</span>
            </div>
            <div style={{ fontSize: '11px', color: '#55665d', marginTop: '2px' }}>በአማራ ክልል ዘመቻ የተካተቱ</div>
          </Card>
        </Col>
      </Row>

      {/* Filter Toolbar */}
      <Card bordered={false} style={{ borderRadius: '6px', border: '1px solid #e1e8e3' }} bodyStyle={{ padding: '12px 16px' }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={8} md={6}>
            <Input
              prefix={<SearchOutlined style={{ color: '#88928c' }} />}
              placeholder="ተፋሰስ፣ ኮድ ወይም ወረዳ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} sm={6} md={5}>
            <Select style={{ width: '100%' }} value={selectedZone} onChange={setSelectedZone}>
              <Option value="ALL">ሁሉም ዞኖች</Option>
              {AMHARA_ZONES.map((z) => <Option key={z} value={z}>{z}</Option>)}
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select style={{ width: '100%' }} value={selectedYear} onChange={setSelectedYear}>
              <Option value="ALL">ሁሉም ዓመታት</Option>
              {availableYears.map((yr) => <Option key={yr} value={yr}>{yr} ዓ.ም</Option>)}
            </Select>
          </Col>
          <Col xs={24} sm={4} md={9} style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                setSearchQuery('');
                setSelectedZone('ALL');
                setSelectedYear('ALL');
              }}
            >
              አድስ
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Grid Table */}
      <Card bordered={false} style={{ borderRadius: '6px', border: '1px solid #e1e8e3' }} bodyStyle={{ padding: '8px' }}>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          bordered
          scroll={{ x: 1200 }}
          pagination={{ pageSize: 8, showTotal: (t) => `ድምር ${t} ዘመቻዎች` }}
        />
      </Card>

      {/* Multi-Step Modal */}
      <Modal
        title={
          <div>
            <div style={{ fontWeight: 700, color: '#133324', fontSize: '15px' }}>
              {editingRecord ? `የ${editingRecord.name} ዘመቻና የመሳሪያ ማሻሻያ` : 'የአፈርና ውሃ ጥበቃ የተቀናጀ ዘመቻና የመሳሪያ መመዝገቢያ'}
            </div>
            <Text type="secondary" style={{ fontSize: '11px' }}>Sections 4.1, 4.2, 4.3 & 4.4 Unified Campaign Workflow</Text>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        width={760}
        destroyOnClose
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              {currentStep > 0 && (
                <Button icon={<LeftOutlined />} onClick={handlePrevStep}>
                  ወደ ኋላ
                </Button>
              )}
            </div>
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>ሰርዝ</Button>
              {currentStep < 3 ? (
                <Button type="primary" style={{ background: '#133324', borderColor: '#133324' }} onClick={handleNextStep}>
                  ቀጣይ <RightOutlined />
                </Button>
              ) : (
                <Button type="primary" icon={<CheckOutlined />} style={{ background: '#133324', borderColor: '#133324' }} onClick={handleSaveRecord}>
                  {editingRecord ? 'አሻሽል' : 'መዝግብ'}
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
              { title: '4.1 ተፋሰስና ወሰን' },
              { title: '4.2 የሰው ኃይል' },
              { title: '4.3 ፊዚካል ሥራዎች' },
              { title: '4.4 የመሳሪያ አቅርቦት' }
            ]}
          />
        </div>

        <Form form={form} layout="vertical">
          {/* STEP 0: 4.1 Scope */}
          {currentStep === 0 && (
            <Row gutter={16}>
              <Col span={14}>
                <Form.Item name="name" label="የተፋሰስ ስም" rules={[{ required: true, message: 'ስም ያስገቡ' }]}>
                  <Input placeholder="e.g. የሪብ ወንዝ ተፋሰስ" />
                </Form.Item>
              </Col>
              <Col span={10}>
                <Form.Item name="code" label="መለያ ኮድ" rules={[{ required: true, message: 'ኮድ ያስገቡ' }]}>
                  <Input placeholder="e.g. WS-FOG-01" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="zone" label="ዞን" rules={[{ required: true, message: 'ዞን ይምረጡ' }]}>
                  <Select placeholder="ዞን ይምረጡ">
                    {AMHARA_ZONES.map((z) => <Option key={z} value={z}>{z}</Option>)}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="woreda" label="ወረዳ" rules={[{ required: true, message: 'ወረዳ ያስገቡ' }]}>
                  <Input placeholder="ወረዳ" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="kebele" label="ቀበሌ" rules={[{ required: true, message: 'ቀበሌ ያስገቡ' }]}>
                  <Input placeholder="ቀበሌ" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="status" label="ይዞታ" rules={[{ required: true }]}>
                  <Select>
                    <Option value="existing">ነባር (Existing)</Option>
                    <Option value="new">አዲስ (New)</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="year" label="የበጀት ዓመት" rules={[{ required: true }]}>
                  <InputNumber style={{ width: '100%' }} min={2010} max={2035} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="total_area_ha" label="ስፋት (Ha)" rules={[{ required: true }]}>
                  <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
              </Col>
            </Row>
          )}

          {/* STEP 1: 4.2 Labor Force */}
          {currentStep === 1 && (
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="labor_male" label="ወንድ ተሳታፊ (pers-days)" rules={[{ required: true }]}>
                  <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="labor_female" label="ሴት ተሳታፊ (pers-days)" rules={[{ required: true }]}>
                  <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="trained_farmers" label="ቀያሽ አርሶ አደር (Surveyors)" rules={[{ required: true }]}>
                  <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
              </Col>
            </Row>
          )}

          {/* STEP 2: 4.3 Physical Works */}
          {currentStep === 2 && (
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="soil_bunds_km" label="የማሳ እርከን (km)">
                  <InputNumber style={{ width: '100%' }} step={0.1} min={0} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="fanya_juu_km" label="የፋንያ ጁ (km)">
                  <InputNumber style={{ width: '100%' }} step={0.1} min={0} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="bund_upgrades_km" label="ደረጃ ማሳደግ (km)">
                  <InputNumber style={{ width: '100%' }} step={0.1} min={0} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="cutoff_drains_m3" label="የጎርፍ መቀልበሻ (m³)">
                  <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="waterways_m3" label="የውሃ ማፍሰሻ (m³)">
                  <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="area_closure_ha" label="ከንክኪ የተከለለ (Ha)">
                  <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
              </Col>
            </Row>
          )}

          {/* STEP 3: 4.4 Tool & Equipment Logistics */}
          {currentStep === 3 && (
            <div>
              <Divider orientation="left" style={{ margin: '4px 0 12px', fontSize: '13px', color: '#133324' }}>
                <CompassOutlined /> የቅየሳና ዲዛይን መሳሪያዎች (Survey & Layout Equipment)
              </Divider>
              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item name="line_level_count" label="ክልስ ደረጃ (Line Level)">
                    <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name="water_level_count" label="ውሃ ልክ (Water Level)">
                    <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name="measuring_tape_count" label="ሜትር (Tape - 50m)">
                    <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name="a_frame_count" label="A-ፍሬም (A-Frame)">
                    <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
                  </Form.Item>
                </Col>
              </Row>

              <Divider orientation="left" style={{ margin: '8px 0 12px', fontSize: '13px', color: '#133324' }}>
                <ToolOutlined /> የቁፋሮና ግንባታ እቃዎች (Earthmoving & Civil Tools)
              </Divider>
              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item name="pickaxe_count" label="ዶማ (Pickaxe)">
                    <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name="shovel_count" label="አካፋ (Shovel)">
                    <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name="sledgehammer_count" label="መዶሻና ሜንጦ (Hammer)">
                    <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name="wheelbarrow_count" label="ጋሪ (Wheelbarrow)">
                    <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
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