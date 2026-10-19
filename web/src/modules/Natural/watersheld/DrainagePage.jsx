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
  BranchesOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

const AMHARA_ZONES = [
  'ምስራቅ ጎጃም', 'ምዕራብ ጎጃም', 'ደቡብ ጎንደር', 'ሰሜን ጎንደር',
  'ማዕከላዊ ጎንደር', 'ምዕራብ ጎንደር', 'ሰሜን ሸዋ', 'ደቡብ ወሎ',
  'ሰሜን ወሎ', 'አዊ', 'ዋግ ኽምራ', 'ኦሮሚያ ልዩ ዞን'
];

export default function DrainagePage() {
  const currentFiscalYear = 2018;
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

  // Derived Calculations
  const processedData = useMemo(() => {
    return records.map((r) => {
      const cutoffKm = Number(r.cutoff_drain_km) || 0;
      const waterwayKm = Number(r.waterway_km) || 0;
      const totalDrainageKm = cutoffKm + waterwayKm;

      const cutoffM3 = Number(r.cutoff_drain_m3) || 0;
      const waterwayM3 = Number(r.waterway_m3) || 0;
      const totalExcavationM3 = cutoffM3 + waterwayM3;

      const pavingKm = Number(r.paved_chute_km) || 0;
      const maintenanceKm = Number(r.drain_maintenance_km) || 0;

      return {
        ...r,
        totalDrainageKm,
        totalExcavationM3,
        pavingKm,
        maintenanceKm
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
    let grandCutoffKm = 0;
    let grandWaterwayKm = 0;
    let grandExcavationM3 = 0;
    let grandPavingKm = 0;

    filteredData.forEach((r) => {
      grandCutoffKm += Number(r.cutoff_drain_km) || 0;
      grandWaterwayKm += Number(r.waterway_km) || 0;
      grandExcavationM3 += r.totalExcavationM3;
      grandPavingKm += Number(r.paved_chute_km) || 0;
    });

    return {
      totalSites: filteredData.length,
      grandCutoffKm,
      grandWaterwayKm,
      grandTotalLinearKm: grandCutoffKm + grandWaterwayKm,
      grandExcavationM3,
      grandPavingKm
    };
  }, [filteredData]);

  // In-Modal Detail Record Resolver
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
      cutoff_drain_km: 0,
      cutoff_drain_m3: 0,
      waterway_km: 0,
      waterway_m3: 0,
      paved_chute_km: 0,
      drain_maintenance_km: 0,
      totalDrainageKm: 0,
      totalExcavationM3: 0,
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
    ['cutoff_drain_km', 'cutoff_drain_m3', 'waterway_km', 'waterway_m3'],
    ['paved_chute_km', 'drain_maintenance_km']
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
      cutoff_drain_km: 0,
      cutoff_drain_m3: 0,
      waterway_km: 0,
      waterway_m3: 0,
      paved_chute_km: 0,
      drain_maintenance_km: 0
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
        message.success(`የተፋሰስ ${values.code} የቦይ መረጃ ተሻሽሏል`);
      } else {
        const newRow = {
          ...values,
          id: `DRN-${Date.now()}`
        };
        setRecords((prev) => [newRow, ...prev]);
        message.success('አዲስ የጎርፍ መቀልበሻና ማስተንፈሻ ቦይ ሪፖርት ተመዝግቧል');
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
      'የጎርፍ መቀልበሻ ቦይ (km)', 'የመቀልበሻ ቁፋሮ (m³)',
      'የውሃ ማስተንፈሻ ቦይ (km)', 'የማስተንፈሻ ቁፋሮ (m³)',
      'የድንጋይ ንጣፍ/ማጠናከሪያ (km)', 'የቦይ ጥገናና ማጽዳት (km)', 'ድምር ቦይ ርዝመት (km)', 'ጠቅላላ ቁፋሮ (m³)'
    ];

    const rows = filteredData.map((r) => [
      `"${r.code || ''}"`,
      `"${r.name || ''}"`,
      `"${r.zone || ''}"`,
      `"${r.woreda || ''}"`,
      `"${r.kebele || ''}"`,
      r.year,
      `"${r.quarter}"`,
      r.cutoff_drain_km || 0,
      r.cutoff_drain_m3 || 0,
      r.waterway_km || 0,
      r.waterway_m3 || 0,
      r.paved_chute_km || 0,
      r.drain_maintenance_km || 0,
      r.totalDrainageKm.toFixed(2),
      r.totalExcavationM3
    ]);

    const metadata = [
      '# የአማራ ብሔራዊ ክልላዊ መንግሥት ግብርና ቢሮ · የተፈጥሮ ሀብት ልማት ዳይሬክቶሬት',
      '# የጎርፍ መውረጃና ማስተንፈሻ ቦዮች መከታተያ ሪፖርት (Section 4.3.2 Matrix)',
      `# ቀን: ${dayjs().format('YYYY-MM-DD HH:mm:ss')}`,
      ''
    ].join('\n');

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + metadata + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `Amhara_Runoff_Drainage_Report_${dayjs().format('YYYY-MM-DD')}.csv`;
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
      title: 'የጎርፍ መቀልበሻ ቦይ (Cutoff Drain)',
      children: [
        {
          title: 'ርዝመት (km)',
          dataIndex: 'cutoff_drain_km',
          key: 'cutoff_drain_km',
          width: 95,
          align: 'right',
          render: (v) => <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{Number(v || 0).toFixed(1)}</span>
        },
        {
          title: 'ቁፋሮ (m³)',
          dataIndex: 'cutoff_drain_m3',
          key: 'cutoff_drain_m3',
          width: 95,
          align: 'right',
          render: (v) => <span style={{ fontVariantNumeric: 'tabular-nums' }}>{Number(v || 0).toLocaleString()}</span>
        }
      ]
    },
    {
      title: 'የውሃ ማስተንፈሻ ቦይ (Waterway)',
      children: [
        {
          title: 'ርዝመት (km)',
          dataIndex: 'waterway_km',
          key: 'waterway_km',
          width: 95,
          align: 'right',
          render: (v) => <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{Number(v || 0).toFixed(1)}</span>
        },
        {
          title: 'ቁፋሮ (m³)',
          dataIndex: 'waterway_m3',
          key: 'waterway_m3',
          width: 95,
          align: 'right',
          render: (v) => <span style={{ fontVariantNumeric: 'tabular-nums' }}>{Number(v || 0).toLocaleString()}</span>
        }
      ]
    },
    {
      title: 'ማጠናከሪያና ጥገና',
      children: [
        {
          title: 'ንጣፍ (km)',
          dataIndex: 'paved_chute_km',
          key: 'paved_chute_km',
          width: 90,
          align: 'right',
          render: (v) => <span style={{ fontVariantNumeric: 'tabular-nums', color: '#0958d9' }}>{Number(v || 0).toFixed(1)}</span>
        },
        {
          title: 'ጥገና (km)',
          dataIndex: 'drain_maintenance_km',
          key: 'drain_maintenance_km',
          width: 90,
          align: 'right',
          render: (v) => <span style={{ fontVariantNumeric: 'tabular-nums' }}>{Number(v || 0).toFixed(1)}</span>
        }
      ]
    },
    {
      title: 'ድምር ቦይ (km)',
      dataIndex: 'totalDrainageKm',
      key: 'totalDrainageKm',
      width: 105,
      align: 'right',
      render: (val) => (
        <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700, color: '#186e41' }}>
          {Number(val || 0).toFixed(1)} km
        </span>
      )
    },
    {
      title: 'ድምር ቁፋሮ (m³)',
      dataIndex: 'totalExcavationM3',
      key: 'totalExcavationM3',
      width: 110,
      align: 'right',
      render: (val) => (
        <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700, color: '#133324' }}>
          {Number(val || 0).toLocaleString()} m³
        </span>
      )
    },
    {
      title: 'ተግባር',
      key: 'action',
      width: 85,
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
                  ክፍል 4.3.2
                </Tag>
              </div>

              <Title level={3} style={{ color: '#ffffff', margin: 0, fontWeight: 700, letterSpacing: '-0.3px' }}>
                የጎርፍ መውረጃና ማስተንፈሻ ቦዮች መከታተያ ማዕከል
              </Title>
              <Text style={{ color: '#c4e2d3', fontSize: '13px' }}>
                Cutoff Drains · Natural & Artificial Waterways · Paved Chutes & Drainage Network Rehabilitation
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
              + አዲስ ቦይ መዝግብ
            </Button>
          </Col>
        </Row>
      </Card>

      {/* ───── 2. SUMMARY KPI HUD ───── */}
      <Row gutter={[12, 12]}>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: '8px', border: '1px solid #e1e8e3', background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }} bodyStyle={{ padding: '16px 18px' }}>
            <Text type="secondary" style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.4px' }}>
              ድምር የተቆፈረ ቦይ
            </Text>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#133324', marginTop: '2px', fontVariantNumeric: 'tabular-nums' }}>
              {stats.grandTotalLinearKm.toFixed(1)} <span style={{ fontSize: '12px', fontWeight: 500, color: '#737b77' }}>km</span>
            </div>
            <div style={{ marginTop: '4px', fontSize: '11px', color: '#55665d' }}>
              መቀልበሻ: <strong>{stats.grandCutoffKm.toFixed(1)} km</strong> | ማስተንፈሻ: <strong>{stats.grandWaterwayKm.toFixed(1)} km</strong>
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: '8px', border: '1px solid #e1e8e3', background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }} bodyStyle={{ padding: '16px 18px' }}>
            <Text type="secondary" style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.4px' }}>
              ጠቅላላ የቦይ ቁፋሮ
            </Text>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#186e41', marginTop: '2px', fontVariantNumeric: 'tabular-nums' }}>
              {stats.grandExcavationM3.toLocaleString()} <span style={{ fontSize: '12px', fontWeight: 500, color: '#737b77' }}>m³</span>
            </div>
            <div style={{ marginTop: '4px', fontSize: '11px', color: '#55665d' }}>
              የአፈርና አለት ማውጣት መጠን
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: '8px', border: '1px solid #e1e8e3', background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }} bodyStyle={{ padding: '16px 18px' }}>
            <Text type="secondary" style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.4px' }}>
              የቦይ ድንጋይ ንጣፍ
            </Text>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#0958d9', marginTop: '2px', fontVariantNumeric: 'tabular-nums' }}>
              {stats.grandPavingKm.toFixed(1)} <span style={{ fontSize: '12px', fontWeight: 500, color: '#737b77' }}>km</span>
            </div>
            <div style={{ marginTop: '4px', fontSize: '11px', color: '#55665d' }}>
              ፍጥነት መቀነሻና ንጣፍ (Paved Chute)
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: '8px', border: '1px solid #e1e8e3', background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }} bodyStyle={{ padding: '16px 18px' }}>
            <Text type="secondary" style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.4px' }}>
              የተዘገቡ ተፋሰሶች
            </Text>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#133324', marginTop: '2px', fontVariantNumeric: 'tabular-nums' }}>
              {stats.totalSites} <span style={{ fontSize: '12px', fontWeight: 500, color: '#737b77' }}>ሳይቶች</span>
            </div>
            <div style={{ marginTop: '4px', fontSize: '11px', color: '#55665d' }}>
              በአማራ ክልል ዘመቻ የተካተቱ
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
          scroll={{ x: 1250 }}
          locale={{
            emptyText: <Empty description="ምንም የጎርፍ ማስተንፈሻ ቦይ መረጃ አልተገኘም (No Drainage Data Available)" />
          }}
          pagination={{ pageSize: 8, showTotal: (t) => `ድምር ${t} የቦይ ሳይቶች` }}
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
                  {currentModalRecord?.name || 'የቦይ ዝርዝር መረጃ'}
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
                ለተመረጠው <strong>{modalFilterYear} ዓ.ም - {modalFilterQuarter}</strong> ወቅት ምንም የተመዘገበ የቦይ ስራ ሪፖርት የለም።
              </div>
            )}

            {/* Domain 1: Cutoff Drain & Waterway Telemetry */}
            <Card
              size="small"
              bordered={false}
              style={{ background: '#ffffff', border: '1px solid #e4eae6', borderRadius: '8px' }}
              title={
                <Space>
                  <BranchesOutlined style={{ color: '#186e41' }} />
                  <span style={{ fontWeight: 700, fontSize: '13px' }}>1. የቦይ ርዝመትና ቁፋሮ (Drainage Linear Length & Excavation)</span>
                </Space>
              }
              extra={
                <Tag color="green" style={{ fontWeight: 700 }}>
                  ድምር: {Number(currentModalRecord.totalDrainageKm || 0).toFixed(1)} km
                </Tag>
              }
            >
              <Row gutter={[12, 12]}>
                <Col span={12}>
                  <div style={{ background: '#f9fbf9', padding: '12px', borderRadius: '6px', border: '1px solid #edf2ee' }}>
                    <Text type="secondary" style={{ fontSize: '11px' }}>የጎርፍ መቀልበሻ ቦይ (Cutoff Drain)</Text>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#133324', fontVariantNumeric: 'tabular-nums' }}>
                      {Number(currentModalRecord.cutoff_drain_km || 0).toFixed(1)} <span style={{ fontSize: '11px', fontWeight: 400 }}>km</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#737b77', marginTop: '2px' }}>
                      የተቆፈረ መጠን: <strong>{Number(currentModalRecord.cutoff_drain_m3 || 0).toLocaleString()} m³</strong>
                    </div>
                  </div>
                </Col>

                <Col span={12}>
                  <div style={{ background: '#f9fbf9', padding: '12px', borderRadius: '6px', border: '1px solid #edf2ee' }}>
                    <Text type="secondary" style={{ fontSize: '11px' }}>የውሃ ማስተንፈሻ ቦይ (Waterway)</Text>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#186e41', fontVariantNumeric: 'tabular-nums' }}>
                      {Number(currentModalRecord.waterway_km || 0).toFixed(1)} <span style={{ fontSize: '11px', fontWeight: 400 }}>km</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#737b77', marginTop: '2px' }}>
                      የተቆፈረ መጠን: <strong>{Number(currentModalRecord.waterway_m3 || 0).toLocaleString()} m³</strong>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>

            {/* Domain 2: Protection & Rehabilitation */}
            <Card
              size="small"
              bordered={false}
              style={{ background: '#ffffff', border: '1px solid #e4eae6', borderRadius: '8px' }}
              title={
                <Space>
                  <SafetyCertificateOutlined style={{ color: '#0958d9' }} />
                  <span style={{ fontWeight: 700, fontSize: '13px' }}>2. የቦይ ማጠናከሪያና ጥገና (Paving & Maintenance)</span>
                </Space>
              }
            >
              <Descriptions size="small" column={2} bordered>
                <Descriptions.Item label="የድንጋይ ንጣፍ (Paved Chute)">
                  <strong style={{ color: '#0958d9' }}>{Number(currentModalRecord.paved_chute_km || 0).toFixed(1)} km</strong>
                </Descriptions.Item>
                <Descriptions.Item label="የቦይ ማጽዳትና ጥገና">
                  <strong>{Number(currentModalRecord.drain_maintenance_km || 0).toFixed(1)} km</strong>
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
              {editingRecord ? `የ${editingRecord.name} ቦይ ስራ ማሻሻያ` : 'አዲስ የጎርፍ መውረጃና ማስተንፈሻ ቦይ መመዝገቢያ'}
            </div>
            <Text type="secondary" style={{ fontSize: '11px' }}>
              Section 4.3.2: Cutoff Drains, Waterways & Drainage Network Maintenance
            </Text>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        width={740}
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
              { title: '2. መቀልበሻና ማስተንፈሻ' },
              { title: '3. ንጣፍና ጥገና' }
            ]}
          />
        </div>

        <Form form={form} layout="vertical">
          {/* STEP 0: Location */}
          {currentStep === 0 && (
            <Row gutter={16}>
              <Col span={14}>
                <Form.Item name="name" label="የተፋሰስ ስም" rules={[{ required: true, message: 'ስም ያስገቡ' }]}>
                  <Input placeholder="e.g. የሪብ ወንዝ ተፋሰስ የቦይ ስራ" />
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

          {/* STEP 1: Cutoff & Waterway */}
          {currentStep === 1 && (
            <div>
              <Divider orientation="left" style={{ margin: '4px 0 14px', fontSize: '13px', color: '#133324' }}>
                <BranchesOutlined /> የመቀልበሻና ማስተንፈሻ ቦይ ልኬቶች
              </Divider>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="cutoff_drain_km" label="የጎርፍ መቀልበሻ ቦይ ርዝመት (km)" rules={[{ required: true }]}>
                    <InputNumber style={{ width: '100%' }} step={0.1} min={0} placeholder="0.0" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="cutoff_drain_m3" label="የመቀልበሻ ቦይ ቁፋሮ (m³)" rules={[{ required: true }]}>
                    <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="waterway_km" label="የውሃ ማስተንፈሻ ቦይ ርዝመት (km)" rules={[{ required: true }]}>
                    <InputNumber style={{ width: '100%' }} step={0.1} min={0} placeholder="0.0" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="waterway_m3" label="የማስተንፈሻ ቦይ ቁፋሮ (m³)" rules={[{ required: true }]}>
                    <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          )}

          {/* STEP 2: Paving & Maintenance */}
          {currentStep === 2 && (
            <div>
              <Divider orientation="left" style={{ margin: '4px 0 14px', fontSize: '13px', color: '#133324' }}>
                <SafetyCertificateOutlined /> የቦይ ማጠናከሪያና ጥገና
              </Divider>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="paved_chute_km" label="የድንጋይ ንጣፍ/ማጠናከሪያ (km)" rules={[{ required: true }]}>
                    <InputNumber style={{ width: '100%' }} step={0.1} min={0} placeholder="0.0" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="drain_maintenance_km" label="የቦይ ማጽዳትና ጥገና (km)" rules={[{ required: true }]}>
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