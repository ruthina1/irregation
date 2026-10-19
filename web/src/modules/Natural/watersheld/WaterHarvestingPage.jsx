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
  Tooltip,
  Modal,
  Form,
  InputNumber,
  Steps,
  Segmented,
  Divider,
  Descriptions,
  Empty,
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
  EnvironmentOutlined,
  EyeOutlined,
  FilterOutlined,
  CloudDownloadOutlined,
  DatabaseOutlined,
  ExperimentOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const AMHARA_ZONES = [
  'ምስራቅ ጎጃም', 'ምዕራብ ጎጃም', 'ደቡብ ጎንደር', 'ሰሜን ጎንደር',
  'ማዕከላዊ ጎንደር', 'ምዕራብ ጎንደር', 'ሰሜን ሸዋ', 'ደቡብ ወሎ',
  'ሰሜን ወሎ', 'አዊ', 'ዋግ ኽምራ', 'ኦሮሚያ ልዩ ዞን'
];

export default function WaterHarvestingPage() {
  const currentFiscalYear = 2018; // Default current Ethiopian fiscal year reference
  const [records, setRecords] = useState([]);

  // Filters
  const [selectedZone, setSelectedZone] = useState('ALL');
  const [selectedYear, setSelectedYear] = useState('ALL');
  const [selectedQuarter, setSelectedQuarter] = useState('Annual (ዓመታዊ)');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [viewingCatchmentCode, setViewingCatchmentCode] = useState(null);
  const [modalFilterYear, setModalFilterYear] = useState(currentFiscalYear);
  const [modalFilterQuarter, setModalFilterQuarter] = useState('Annual (ዓመታዊ)');

  const availableYears = useMemo(() => {
    const yrs = Array.from(new Set(records.map((r) => r.year).filter(Boolean)));
    if (!yrs.includes(currentFiscalYear)) yrs.push(currentFiscalYear);
    return yrs.sort((a, b) => b - a);
  }, [records, currentFiscalYear]);

  // Derived calculations
  const processedData = useMemo(() => {
    return records.map((r) => {
      const dtM3 = Number(r.deep_trench_m3) || 0;
      const pitM3 = Number(r.percolation_pit_m3) || 0;
      const pondM3 = Number(r.farm_pond_m3) || 0;
      const totalCapacityM3 = dtM3 + pitM3 + pondM3;

      const dtCount = Number(r.deep_trench_count) || 0;
      const mbCount = Number(r.micro_basin_count) || 0;
      const ebCount = Number(r.eyebrow_basin_count) || 0;
      const totalStructuresCount = dtCount + mbCount + ebCount;

      return {
        ...r,
        totalCapacityM3,
        totalStructuresCount
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
      const matchQuarter = selectedQuarter === 'ALL' || r.quarter === selectedQuarter;

      return matchSearch && matchZone && matchYear && matchQuarter;
    });
  }, [processedData, searchQuery, selectedZone, selectedYear, selectedQuarter]);

  // Summary Metrics
  const stats = useMemo(() => {
    let grandDeepTrenchCount = 0;
    let grandDeepTrenchM3 = 0;
    let grandPondM3 = 0;
    let grandCapacityM3 = 0;

    filteredData.forEach((r) => {
      grandDeepTrenchCount += Number(r.deep_trench_count) || 0;
      grandDeepTrenchM3 += Number(r.deep_trench_m3) || 0;
      grandPondM3 += Number(r.farm_pond_m3) || 0;
      grandCapacityM3 += r.totalCapacityM3;
    });

    return {
      totalSites: filteredData.length,
      grandDeepTrenchCount,
      grandDeepTrenchM3,
      grandPondM3,
      grandCapacityM3
    };
  }, [filteredData]);

  // Details Modal Record Resolver
  const currentModalRecord = useMemo(() => {
    if (!viewingCatchmentCode) return null;

    const exactMatch = processedData.find(
      (r) => r.code === viewingCatchmentCode && Number(r.year) === Number(modalFilterYear) && r.quarter === modalFilterQuarter
    );
    if (exactMatch) return exactMatch;

    const yearMatch = processedData.find(
      (r) => r.code === viewingCatchmentCode && Number(r.year) === Number(modalFilterYear)
    );
    if (yearMatch) return yearMatch;

    const base = processedData.find((r) => r.code === viewingCatchmentCode);
    if (!base) return null;

    return {
      ...base,
      year: modalFilterYear,
      quarter: modalFilterQuarter,
      deep_trench_count: 0,
      deep_trench_m3: 0,
      micro_basin_count: 0,
      eyebrow_basin_count: 0,
      percolation_pit_m3: 0,
      farm_pond_m3: 0,
      shallow_well_count: 0,
      totalCapacityM3: 0,
      totalStructuresCount: 0,
      isNoData: true
    };
  }, [processedData, viewingCatchmentCode, modalFilterYear, modalFilterQuarter]);

  const openDetailsModal = (record) => {
    setViewingCatchmentCode(record.code);
    setModalFilterYear(record.year || currentFiscalYear);
    setModalFilterQuarter(record.quarter || 'Annual (ዓመታዊ)');
    setIsDetailsModalOpen(true);
  };

  // Wizard Step Fields
  const stepFields = [
    ['name', 'code', 'zone', 'woreda', 'kebele', 'year', 'quarter'],
    ['deep_trench_count', 'deep_trench_m3', 'micro_basin_count', 'eyebrow_basin_count'],
    ['percolation_pit_m3', 'farm_pond_m3', 'shallow_well_count']
  ];

  const handleNextStep = async () => {
    try {
      await form.validateFields(stepFields[currentStep]);
      setCurrentStep((prev) => prev + 1);
    } catch {
      message.warning('እባክዎ የተጠየቁትን መረጃዎች በትክክል ይሙሉ!');
    }
  };

  const handlePrevStep = () => setCurrentStep((prev) => prev - 1);

  const openCreateModal = () => {
    setEditingRecord(null);
    setCurrentStep(0);
    form.resetFields();
    form.setFieldsValue({
      zone: selectedZone !== 'ALL' ? selectedZone : undefined,
      year: selectedYear !== 'ALL' ? Number(selectedYear) : currentFiscalYear,
      quarter: selectedQuarter !== 'ALL' ? selectedQuarter : 'Annual (ዓመታዊ)',
      deep_trench_count: 0,
      deep_trench_m3: 0,
      micro_basin_count: 0,
      eyebrow_basin_count: 0,
      percolation_pit_m3: 0,
      farm_pond_m3: 0,
      shallow_well_count: 0
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
        message.success(`የተፋሰስ ${values.code} የውሃ ማሰባሰብ መረጃ ተሻሽሏል`);
      } else {
        const newRow = {
          ...values,
          id: `WH-${Date.now()}`
        };
        setRecords((prev) => [newRow, ...prev]);
        message.success('አዲስ የውሃ ማሰባሰብና የጥልቅ ትሬንች ሪፖርት ተመዝግቧል');
      }
      setIsModalOpen(false);
    } catch {
      message.error('እባክዎ የተሳሳቱ መረጃዎችን ያስተካክሉ');
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    if (!filteredData.length) {
      message.warning('የሚወጣ መረጃ የለም');
      return;
    }

    const headers = [
      'ተፋሰስ መለያ', 'የተፋሰስ ስም', 'ዞን', 'ወረዳ', 'ቀበሌ', 'ዓመት', 'ወቅት',
      'ጥልቅ ትሬንች ብዛት', 'ጥልቅ ትሬንች መጠን (m³)',
      'ሳባ ቋት/ማይክሮ ቤዚን (ብዛት)', 'የዐይን ቆብ እርከን (ብዛት)',
      'የማሰርጊያ ጉድጓድ (m³)', 'የዝናብ ውሃ ኩሬ (m³)', 'በእጅ የተቆፈረ ጉድጓድ (ብዛት)', 'ጠቅላላ የመያዝ አቅም (m³)'
    ];

    const rows = filteredData.map((r) => [
      `"${r.code || ''}"`,
      `"${r.name || ''}"`,
      `"${r.zone || ''}"`,
      `"${r.woreda || ''}"`,
      `"${r.kebele || ''}"`,
      r.year,
      `"${r.quarter}"`,
      r.deep_trench_count || 0,
      r.deep_trench_m3 || 0,
      r.micro_basin_count || 0,
      r.eyebrow_basin_count || 0,
      r.percolation_pit_m3 || 0,
      r.farm_pond_m3 || 0,
      r.shallow_well_count || 0,
      r.totalCapacityM3
    ]);

    const metadata = [
      '# የአማራ ብሔራዊ ክልላዊ መንግሥት ግብርና ቢሮ · የተፈጥሮ ሀብት ልማት ዳይሬክቶሬት',
      '# የዝናብና የጎርፍ ውሃ ማሰባሰብና ጥልቅ ትሬንች መከታተያ ሪፖርት (Section 4.3.4 Matrix)',
      `# ቀን: ${dayjs().format('YYYY-MM-DD HH:mm:ss')}`,
      ''
    ].join('\n');

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + metadata + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `Amhara_Water_Harvesting_Deep_Trench_${dayjs().format('YYYY-MM-DD')}.csv`;
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
      title: 'ተፋሰስና መገኛ',
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
      title: 'ጥልቅ ትሬንች (Deep Trench)',
      children: [
        {
          title: 'ብዛት (Pcs)',
          dataIndex: 'deep_trench_count',
          key: 'deep_trench_count',
          width: 95,
          align: 'right',
          render: (v) => <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: '#133324' }}>{Number(v || 0).toLocaleString()}</span>
        },
        {
          title: 'መጠን (m³)',
          dataIndex: 'deep_trench_m3',
          key: 'deep_trench_m3',
          width: 100,
          align: 'right',
          render: (v) => <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700, color: '#186e41' }}>{Number(v || 0).toLocaleString()}</span>
        }
      ]
    },
    {
      title: 'የእርጥበት ማቆሪያዎች (ብዛት)',
      children: [
        {
          title: 'ሳባ ቋት (Micro-basin)',
          dataIndex: 'micro_basin_count',
          key: 'micro_basin_count',
          width: 110,
          align: 'right',
          render: (v) => <span style={{ fontVariantNumeric: 'tabular-nums' }}>{Number(v || 0).toLocaleString()}</span>
        },
        {
          title: 'የዐይን ቆብ (Eyebrow)',
          dataIndex: 'eyebrow_basin_count',
          key: 'eyebrow_basin_count',
          width: 110,
          align: 'right',
          render: (v) => <span style={{ fontVariantNumeric: 'tabular-nums' }}>{Number(v || 0).toLocaleString()}</span>
        }
      ]
    },
    {
      title: 'የውሃ ማቆሪያና ከርሰ-ምድር (Storage)',
      children: [
        {
          title: 'ማሰርጊያ (m³)',
          dataIndex: 'percolation_pit_m3',
          key: 'percolation_pit_m3',
          width: 100,
          align: 'right',
          render: (v) => <span style={{ fontVariantNumeric: 'tabular-nums' }}>{Number(v || 0).toLocaleString()}</span>
        },
        {
          title: 'ኩሬ (m³)',
          dataIndex: 'farm_pond_m3',
          key: 'farm_pond_m3',
          width: 100,
          align: 'right',
          render: (v) => <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: '#0958d9' }}>{Number(v || 0).toLocaleString()}</span>
        },
        {
          title: 'ጉድጓድ (Pcs)',
          dataIndex: 'shallow_well_count',
          key: 'shallow_well_count',
          width: 90,
          align: 'right',
          render: (v) => <span style={{ fontVariantNumeric: 'tabular-nums' }}>{Number(v || 0).toLocaleString()}</span>
        }
      ]
    },
    {
      title: 'ድምር አቅም (m³)',
      dataIndex: 'totalCapacityM3',
      key: 'totalCapacityM3',
      width: 115,
      align: 'right',
      render: (val) => (
        <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 800, color: '#133324' }}>
          {Number(val || 0).toLocaleString()} m³
        </span>
      )
    },
    {
      title: 'ተግባር',
      key: 'action',
      width: 90,
      align: 'center',
      fixed: 'right',
      render: (_, r) => (
        <Space size={2}>
          <Tooltip title="ዝርዝር መረጃ ተመልከት">
            <Button
              size="small"
              type="text"
              icon={<EyeOutlined style={{ color: '#0958d9' }} />}
              onClick={() => openDetailsModal(r)}
            />
          </Tooltip>
          <Tooltip title="መረጃውን አሻሽል">
            <Button
              size="small"
              type="text"
              icon={<EditOutlined style={{ color: '#133324' }} />}
              onClick={() => openEditModal(r)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px', background: '#f4f7f5', minHeight: '100vh' }}>

      {/* ───── 1. INSTITUTIONAL EXECUTIVE HEADER ───── */}
      <Card
        bordered={false}
        style={{
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #0c2117 0%, #133324 55%, #1b4531 100%)',
          color: '#ffffff',
          boxShadow: '0 4px 16px rgba(12, 33, 23, 0.18)'
        }}
        bodyStyle={{ padding: '22px 28px' }}
      >
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} md={16}>
            <Space direction="vertical" size={4}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#8de3b5', fontSize: '11px', letterSpacing: '1.2px', textTransform: 'uppercase', fontWeight: 700 }}>
                  የአማራ ብሔራዊ ክልላዊ መንግሥት ግብርና ቢሮ · የተፈጥሮ ሀብት ልማት ዳይሬክቶሬት
                </span>
                <Tag style={{ background: 'rgba(255,255,255,0.12)', color: '#d8f3e5', border: '1px solid rgba(255,255,255,0.2)', fontSize: '10px', fontWeight: 600 }}>
                  ክፍል 4.3.4
                </Tag>
              </div>

              <Title level={3} style={{ color: '#ffffff', margin: 0, fontWeight: 700, letterSpacing: '-0.3px' }}>
                የዝናብና የጎርፍ ውሃ ማሰባሰብ እና ጥልቅ ትሬንች መከታተያ ማዕከል
              </Title>
              <Text style={{ color: '#c4e2d3', fontSize: '13px' }}>
                Deep Trench Construction · Micro-basins · Eyebrow Basins · Percolation Pits & Groundwater Recharge
              </Text>
            </Space>
          </Col>

          <Col xs={24} md={8} style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleExportCSV}
              style={{
                background: 'rgba(255,255,255,0.12)',
                borderColor: 'rgba(255,255,255,0.3)',
                color: '#fff',
                fontWeight: 600
              }}
            >
              Export CSV
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openCreateModal}
              style={{
                background: '#225940',
                borderColor: '#2f7555',
                fontWeight: 600,
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
              }}
            >
              + አዲስ የውሃ ማሰባሰብ መዝግብ
            </Button>
          </Col>
        </Row>
      </Card>

      {/* ───── 2. SUMMARY KPI HUD ───── */}
      <Row gutter={[12, 12]}>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: '8px', border: '1px solid #e1e8e3', background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }} bodyStyle={{ padding: '16px 18px' }}>
            <Text type="secondary" style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.4px' }}>
              የጥልቅ ትሬንች ብዛት
            </Text>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#133324', marginTop: '2px', fontVariantNumeric: 'tabular-nums' }}>
              {stats.grandDeepTrenchCount.toLocaleString()} <span style={{ fontSize: '12px', fontWeight: 500, color: '#737b77' }}>ትሬንች</span>
            </div>
            <div style={{ marginTop: '4px', fontSize: '11px', color: '#55665d' }}>
              የውሃ መያዝ አቅም: <strong>{stats.grandDeepTrenchM3.toLocaleString()} m³</strong>
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: '8px', border: '1px solid #e1e8e3', background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }} bodyStyle={{ padding: '16px 18px' }}>
            <Text type="secondary" style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.4px' }}>
              ጥልቅ ትሬንች ቁፋሮ (m³)
            </Text>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#186e41', marginTop: '2px', fontVariantNumeric: 'tabular-nums' }}>
              {stats.grandDeepTrenchM3.toLocaleString()} <span style={{ fontSize: '12px', fontWeight: 500, color: '#737b77' }}>m³</span>
            </div>
            <div style={{ marginTop: '4px', fontSize: '11px', color: '#55665d' }}>
              ለተራራማ አካባቢ እርጥበት ማቆር
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: '8px', border: '1px solid #e1e8e3', background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }} bodyStyle={{ padding: '16px 18px' }}>
            <Text type="secondary" style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.4px' }}>
              የኩሬዎች የውሃ ማቆር
            </Text>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#0958d9', marginTop: '2px', fontVariantNumeric: 'tabular-nums' }}>
              {stats.grandPondM3.toLocaleString()} <span style={{ fontSize: '12px', fontWeight: 500, color: '#737b77' }}>m³</span>
            </div>
            <div style={{ marginTop: '4px', fontSize: '11px', color: '#55665d' }}>
              የአርሶ አደር ማሳ ኩሬዎች
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: '8px', border: '1px solid #e1e8e3', background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }} bodyStyle={{ padding: '16px 18px' }}>
            <Text type="secondary" style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.4px' }}>
              ጠቅላላ የውሃ ማሰባሰብ አቅም
            </Text>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#133324', marginTop: '2px', fontVariantNumeric: 'tabular-nums' }}>
              {stats.grandCapacityM3.toLocaleString()} <span style={{ fontSize: '12px', fontWeight: 500, color: '#737b77' }}>m³</span>
            </div>
            <div style={{ marginTop: '4px', fontSize: '11px', color: '#55665d' }}>
              ትሬንች፣ ኩሬና ማሰርጊያ ጉድጓዶች
            </div>
          </Card>
        </Col>
      </Row>

      {/* ───── 3. FILTER TOOLBAR ───── */}
      <Card bordered={false} style={{ borderRadius: '8px', border: '1px solid #e1e8e3', background: '#ffffff' }} bodyStyle={{ padding: '14px 18px' }}>
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
              {AMHARA_ZONES.map((z) => (
                <Option key={z} value={z}>{z}</Option>
              ))}
            </Select>
          </Col>

          <Col xs={12} sm={6} md={4}>
            <Select style={{ width: '100%' }} value={selectedYear} onChange={setSelectedYear}>
              <Option value="ALL">ሁሉም ዓመታት</Option>
              {availableYears.map((yr) => (
                <Option key={yr} value={yr}>{yr} ዓ.ም</Option>
              ))}
            </Select>
          </Col>

          <Col xs={24} sm={8} md={6}>
            <Segmented
              value={selectedQuarter}
              onChange={setSelectedQuarter}
              options={[
                { label: 'ዓመታዊ', value: 'Annual (ዓመታዊ)' },
                { label: '1ኛ ሩብ', value: 'Q1 (1ኛ)' },
                { label: '2ኛ ሩብ', value: 'Q2 (2ኛ)' },
                { label: '3ኛ ሩብ', value: 'Q3 (3ኛ)' },
                { label: '4ኛ ሩብ', value: 'Q4 (4ኛ)' }
              ]}
              style={{ background: '#f0f3f1', fontWeight: 600 }}
            />
          </Col>

          <Col xs={24} sm={4} md={3} style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                setSearchQuery('');
                setSelectedZone('ALL');
                setSelectedYear('ALL');
                setSelectedQuarter('Annual (ዓመታዊ)');
              }}
            >
              አድስ
            </Button>
          </Col>
        </Row>
      </Card>

      {/* ───── 4. PRIMARY DATA MATRIX ───── */}
      <Card bordered={false} style={{ borderRadius: '8px', border: '1px solid #e1e8e3', background: '#ffffff', padding: '4px' }}>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          bordered
          scroll={{ x: 1300 }}
          locale={{
            emptyText: <Empty description="ምንም የውሃ ማሰባሰብ መረጃ አልተገኘም (No Data Available)" />
          }}
          pagination={{ pageSize: 8, showTotal: (t) => `ድምር ${t} የውሃ ማሰባሰብ ሳይቶች` }}
        />
      </Card>

      {/* ───── 5. VIEW DETAILS MODAL WITH IN-MODAL DATE/YEAR FILTER ───── */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: '28px' }}>
            <Space>
              <div style={{ background: '#eaf4ee', padding: '6px 10px', borderRadius: '8px', color: '#133324' }}>
                <EyeOutlined style={{ fontSize: '18px' }} />
              </div>
              <div>
                <div style={{ fontWeight: 800, color: '#133324', fontSize: '16px' }}>
                  {currentModalRecord?.name || 'የተፋሰስ መረጃ'}
                </div>
                <Text type="secondary" style={{ fontSize: '11px' }}>
                  Catchment Code: <strong style={{ color: '#0958d9' }}>{currentModalRecord?.code || '—'}</strong>
                </Text>
              </div>
            </Space>

            <Tag color="cyan" style={{ fontWeight: 700, borderRadius: '4px' }}>
              {modalFilterYear} ዓ.ም · {modalFilterQuarter}
            </Tag>
          </div>
        }
        open={isDetailsModalOpen}
        onCancel={() => setIsDetailsModalOpen(false)}
        width={780}
        destroyOnClose
        footer={[
          <Button key="close" type="primary" style={{ background: '#133324', borderColor: '#133324' }} onClick={() => setIsDetailsModalOpen(false)}>
            እሺ / ዝጋ (Close)
          </Button>
        ]}
      >
        {currentModalRecord ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>

            {/* In-Modal Filter Bar */}
            <Card
              size="small"
              style={{
                background: '#f1f6f3',
                border: '1px solid #d4dfd9',
                borderRadius: '8px'
              }}
              bodyStyle={{ padding: '10px 14px' }}
            >
              <Row gutter={[12, 12]} align="middle">
                <Col xs={24} sm={8}>
                  <Space size={6} style={{ color: '#133324', fontWeight: 600, fontSize: '12px' }}>
                    <FilterOutlined style={{ color: '#186e41' }} />
                    <span>የጊዜ ማጣሪያ (Filter Period):</span>
                  </Space>
                </Col>

                <Col xs={12} sm={6}>
                  <Select
                    size="small"
                    style={{ width: '100%' }}
                    value={modalFilterYear}
                    onChange={setModalFilterYear}
                  >
                    {availableYears.map((yr) => (
                      <Option key={yr} value={yr}>{yr} ዓ.ም</Option>
                    ))}
                  </Select>
                </Col>

                <Col xs={12} sm={10}>
                  <Select
                    size="small"
                    style={{ width: '100%' }}
                    value={modalFilterQuarter}
                    onChange={setModalFilterQuarter}
                  >
                    <Option value="Annual (ዓመታዊ)">Annual (ዓመታዊ)</Option>
                    <Option value="Q1 (1ኛ)">1ኛ ሩብ ዓመት (Q1)</Option>
                    <Option value="Q2 (2ኛ)">2ኛ ሩብ ዓመት (Q2)</Option>
                    <Option value="Q3 (3ኛ)">3ኛ ሩብ ዓመት (Q3)</Option>
                    <Option value="Q4 (4ኛ)">4ኛ ሩብ ዓመት (Q4)</Option>
                  </Select>
                </Col>
              </Row>
            </Card>

            {/* Location Banner */}
            <Card size="small" style={{ background: '#f8faf9', border: '1px solid #e1e8e3', borderRadius: '6px' }}>
              <Descriptions size="small" column={3}>
                <Descriptions.Item label="ዞን"><strong>{currentModalRecord.zone || '—'}</strong></Descriptions.Item>
                <Descriptions.Item label="ወረዳ"><strong>{currentModalRecord.woreda || '—'}</strong></Descriptions.Item>
                <Descriptions.Item label="ቀበሌ"><strong>{currentModalRecord.kebele || '—'}</strong></Descriptions.Item>
              </Descriptions>
            </Card>

            {currentModalRecord.isNoData && (
              <div style={{ background: '#fffbe6', border: '1px solid #ffe58f', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', color: '#ad6800' }}>
                ለተመረጠው <strong>{modalFilterYear} ዓ.ም - {modalFilterQuarter}</strong> ወቅት ምንም የተመዘገበ የውሃ ማሰባሰብ ስራ ሪፖርት የለም።
              </div>
            )}

            {/* Domain 1: Deep Trench Telemetry */}
            <Card
              size="small"
              bordered={false}
              style={{ background: '#ffffff', border: '1px solid #e4eae6', borderRadius: '8px' }}
              title={
                <Space>
                  <DatabaseOutlined style={{ color: '#186e41' }} />
                  <span style={{ fontWeight: 700, fontSize: '13px' }}>1. የጥልቅ ትሬንች ስራዎች (Deep Trench Interventions)</span>
                </Space>
              }
              extra={
                <Tag color="green" style={{ fontWeight: 700 }}>
                  መጠን: {Number(currentModalRecord.deep_trench_m3 || 0).toLocaleString()} m³
                </Tag>
              }
            >
              <Row gutter={[12, 12]}>
                <Col span={12}>
                  <div style={{ background: '#f9fbf9', padding: '12px', borderRadius: '6px', border: '1px solid #edf2ee' }}>
                    <Text type="secondary" style={{ fontSize: '11px' }}>የጥልቅ ትሬንች ጠቅላላ ብዛት</Text>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#133324', fontVariantNumeric: 'tabular-nums' }}>
                      {Number(currentModalRecord.deep_trench_count || 0).toLocaleString()} <span style={{ fontSize: '11px', fontWeight: 400 }}>Pcs</span>
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ background: '#f9fbf9', padding: '12px', borderRadius: '6px', border: '1px solid #edf2ee' }}>
                    <Text type="secondary" style={{ fontSize: '11px' }}>የቁፋሮና ውሃ መያዝ መጠን</Text>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#186e41', fontVariantNumeric: 'tabular-nums' }}>
                      {Number(currentModalRecord.deep_trench_m3 || 0).toLocaleString()} <span style={{ fontSize: '11px', fontWeight: 400 }}>m³</span>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>

            {/* Domain 2: Micro-Basins & Eyebrow Basins */}
            <Card
              size="small"
              bordered={false}
              style={{ background: '#ffffff', border: '1px solid #e4eae6', borderRadius: '8px' }}
              title={
                <Space>
                  <ExperimentOutlined style={{ color: '#0958d9' }} />
                  <span style={{ fontWeight: 700, fontSize: '13px' }}>2. የእርጥበት ማቆሪያ ቅርጾች (Micro & Eyebrow Basins)</span>
                </Space>
              }
            >
              <Descriptions size="small" column={2} bordered>
                <Descriptions.Item label="ሳባ ቋት (Micro-basin)">
                  <strong>{Number(currentModalRecord.micro_basin_count || 0).toLocaleString()} Pcs</strong>
                </Descriptions.Item>
                <Descriptions.Item label="የዐይን ቆብ እርከን (Eyebrow)">
                  <strong>{Number(currentModalRecord.eyebrow_basin_count || 0).toLocaleString()} Pcs</strong>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Domain 3: Ponds, Infiltration & Wells */}
            <Card
              size="small"
              bordered={false}
              style={{ background: '#ffffff', border: '1px solid #e4eae6', borderRadius: '8px' }}
              title={
                <Space>
                  <CloudDownloadOutlined style={{ color: '#133324' }} />
                  <span style={{ fontWeight: 700, fontSize: '13px' }}>3. የኩሬ፣ ማሰርጊያና በእጅ የተቆፈሩ ጉድጓዶች (Storage & Recharge)</span>
                </Space>
              }
            >
              <Descriptions size="small" column={3} bordered>
                <Descriptions.Item label="የማሰርጊያ ጉድጓድ">
                  <strong>{Number(currentModalRecord.percolation_pit_m3 || 0).toLocaleString()} m³</strong>
                </Descriptions.Item>
                <Descriptions.Item label="የዝናብ ውሃ ኩሬ">
                  <strong style={{ color: '#0958d9' }}>{Number(currentModalRecord.farm_pond_m3 || 0).toLocaleString()} m³</strong>
                </Descriptions.Item>
                <Descriptions.Item label="የእጅ ጉድጓድ (Wells)">
                  <strong>{Number(currentModalRecord.shallow_well_count || 0).toLocaleString()} Pcs</strong>
                </Descriptions.Item>
              </Descriptions>
            </Card>

          </div>
        ) : (
          <Empty style={{ margin: '32px 0' }} description="ምንም ዝርዝር መረጃ አልተገኘም" />
        )}
      </Modal>

      {/* ───── 6. ENTRY WIZARD MODAL ───── */}
      <Modal
        title={
          <div>
            <div style={{ fontWeight: 700, color: '#133324', fontSize: '16px' }}>
              {editingRecord ? `የ${editingRecord.name} የውሃ ማሰባሰብ ማሻሻያ` : 'አዲስ የዝናብና ጎርፍ ውሃ ማሰባሰብና ጥልቅ ትሬንች መመዝገቢያ'}
            </div>
            <Text type="secondary" style={{ fontSize: '11px' }}>
              Section 4.3.4: Deep Trench, Micro-basins, Eyebrow Basins & Water Storage Ponds
            </Text>
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
              {currentStep < 2 ? (
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
              { title: '1. ተፋሰስና ወሰን' },
              { title: '2. ጥልቅ ትሬንችና ቤዚኖች' },
              { title: '3. ኩሬና ከርሰ-ምድር' }
            ]}
          />
        </div>

        <Form form={form} layout="vertical">
          {/* STEP 0: Location */}
          {currentStep === 0 && (
            <Row gutter={16}>
              <Col span={14}>
                <Form.Item name="name" label="የተፋሰስ ስም" rules={[{ required: true, message: 'ስም ያስገቡ' }]}>
                  <Input placeholder="e.g. የሪብ ወንዝ ተፋሰስ የውሃ ማሰባሰብ" />
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
                    {AMHARA_ZONES.map((z) => (
                      <Option key={z} value={z}>{z}</Option>
                    ))}
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
              <Col span={12}>
                <Form.Item name="year" label="የበጀት ዓመት" rules={[{ required: true }]}>
                  <InputNumber style={{ width: '100%' }} min={2010} max={2035} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="quarter" label="የሪፖርት ወቅት" rules={[{ required: true }]}>
                  <Select>
                    <Option value="Annual (ዓመታዊ)">Annual (ዓመታዊ)</Option>
                    <Option value="Q1 (1ኛ)">1ኛ ሩብ ዓመት</Option>
                    <Option value="Q2 (2ኛ)">2ኛ ሩብ ዓመት</Option>
                    <Option value="Q3 (3ኛ)">3ኛ ሩብ ዓመት</Option>
                    <Option value="Q4 (4ኛ)">4ኛ ሩብ ዓመት</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          )}

          {/* STEP 1: Deep Trench & Basins */}
          {currentStep === 1 && (
            <div>
              <Divider orientation="left" style={{ margin: '4px 0 14px', fontSize: '13px', color: '#133324' }}>
                <DatabaseOutlined /> የጥልቅ ትሬንችና ማይክሮ-ቤዚን ስራዎች
              </Divider>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="deep_trench_count" label="ጥልቅ ትሬንች ብዛት (Pcs)" rules={[{ required: true }]}>
                    <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="deep_trench_m3" label="ጥልቅ ትሬንች ቁፋሮ/መጠን (m³)" rules={[{ required: true }]}>
                    <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="micro_basin_count" label="ሳባ ቋት / ማይክሮ ቤዚን (ብዛት)" rules={[{ required: true }]}>
                    <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="eyebrow_basin_count" label="የዐይን ቆብ ቅርጽ እርከን (ብዛት)" rules={[{ required: true }]}>
                    <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          )}

          {/* STEP 2: Infiltration, Ponds & Wells */}
          {currentStep === 2 && (
            <div>
              <Divider orientation="left" style={{ margin: '4px 0 14px', fontSize: '13px', color: '#133324' }}>
                <CloudDownloadOutlined /> የውሃ ማሰርጊያና ማቆሪያ ኩሬዎች
              </Divider>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item name="percolation_pit_m3" label="የማሰርጊያ ጉድጓድ (m³)" rules={[{ required: true }]}>
                    <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="farm_pond_m3" label="የዝናብ ውሃ ኩሬ (m³)" rules={[{ required: true }]}>
                    <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="shallow_well_count" label="የእጅ ጉድጓድ ብዛት (Pcs)" rules={[{ required: true }]}>
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