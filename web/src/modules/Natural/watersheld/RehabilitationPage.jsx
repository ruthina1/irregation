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
  Progress,
  Descriptions,
  Badge,
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
  BuildOutlined,
  NodeIndexOutlined,
  BranchesOutlined,
  EyeOutlined,
  CalendarOutlined,
  FilterOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const AMHARA_ZONES = [
  'ምስራቅ ጎጃም', 'ምዕራብ ጎጃም', 'ደቡብ ጎንደር', 'ሰሜን ጎንደር',
  'ማዕከላዊ ጎንደር', 'ምዕራብ ጎንደር', 'ሰሜን ሸዋ', 'ደቡብ ወሎ',
  'ሰሜን ወሎ', 'አዊ', 'ዋግ ኽምራ', 'ኦሮሚያ ልዩ ዞን'
];

// Production dataset populated with multi-year and quarterly historical records
const INITIAL_REHAB_DATA = [
  {
    id: 'REHAB-01',
    code: 'WS-FOG-01',
    name: 'የሪብ ወንዝ ተፋሰስ ሸለቆ (Ribb Gully Network)',
    zone: 'ደቡብ ጎንደር',
    woreda: 'ፎገራ',
    kebele: 'ወረታ ዙሪያ',
    year: 2018,
    quarter: 'Annual (ዓመታዊ)',
    sandbag_m3: 350,
    wooden_m3: 210,
    stone_m3: 1450,
    gabion_m3: 680,
    arch_weir_m3: 420,
    arc_masonry_m3: 290,
    gully_reshaping_m3: 5200,
    brushwood_barriers_km: 8.4,
    gully_revegetation_ha: 14.5,
    riverbank_tree_km: 12.0,
    live_staking_km: 6.5,
    riparian_closure_ha: 28.0
  },
  {
    id: 'REHAB-01-Q1',
    code: 'WS-FOG-01',
    name: 'የሪብ ወንዝ ተፋሰስ ሸለቆ (Ribb Gully Network)',
    zone: 'ደቡብ ጎንደር',
    woreda: 'ፎገራ',
    kebele: 'ወረታ ዙሪያ',
    year: 2018,
    quarter: 'Q1 (1ኛ)',
    sandbag_m3: 100,
    wooden_m3: 60,
    stone_m3: 420,
    gabion_m3: 200,
    arch_weir_m3: 120,
    arc_masonry_m3: 80,
    gully_reshaping_m3: 1500,
    brushwood_barriers_km: 2.5,
    gully_revegetation_ha: 4.0,
    riverbank_tree_km: 3.5,
    live_staking_km: 2.0,
    riparian_closure_ha: 8.0
  },
  {
    id: 'REHAB-01-2017',
    code: 'WS-FOG-01',
    name: 'የሪብ ወንዝ ተፋሰስ ሸለቆ (Ribb Gully Network)',
    zone: 'ደቡብ ጎንደር',
    woreda: 'ፎገራ',
    kebele: 'ወረታ ዙሪያ',
    year: 2017,
    quarter: 'Annual (ዓመታዊ)',
    sandbag_m3: 280,
    wooden_m3: 190,
    stone_m3: 1100,
    gabion_m3: 450,
    arch_weir_m3: 310,
    arc_masonry_m3: 200,
    gully_reshaping_m3: 3800,
    brushwood_barriers_km: 6.2,
    gully_revegetation_ha: 10.5,
    riverbank_tree_km: 9.0,
    live_staking_km: 4.8,
    riparian_closure_ha: 20.0
  },
  {
    id: 'REHAB-02',
    code: 'WS-DER-02',
    name: 'ጉማራ ሸለቆ ማገገሚያ (Gumara Ravine Core)',
    zone: 'ደቡብ ጎንደር',
    woreda: 'ደራ',
    kebele: 'አንበሳሜ',
    year: 2018,
    quarter: 'Annual (ዓመታዊ)',
    sandbag_m3: 180,
    wooden_m3: 140,
    stone_m3: 920,
    gabion_m3: 350,
    arch_weir_m3: 190,
    arc_masonry_m3: 120,
    gully_reshaping_m3: 3100,
    brushwood_barriers_km: 5.2,
    gully_revegetation_ha: 9.0,
    riverbank_tree_km: 8.5,
    live_staking_km: 4.0,
    riparian_closure_ha: 18.5
  },
  {
    id: 'REHAB-03',
    code: 'WS-BS-01',
    name: 'የጫጫ ወንዝ ቦረቦር መከላከያ (Chacha Gully System)',
    zone: 'ሰሜን ሸዋ',
    woreda: 'ባሶና ወራና',
    kebele: 'ጎሼ ባዶ',
    year: 2018,
    quarter: 'Annual (ዓመታዊ)',
    sandbag_m3: 420,
    wooden_m3: 380,
    stone_m3: 2100,
    gabion_m3: 1150,
    arch_weir_m3: 640,
    arc_masonry_m3: 480,
    gully_reshaping_m3: 8400,
    brushwood_barriers_km: 14.2,
    gully_revegetation_ha: 22.0,
    riverbank_tree_km: 16.4,
    live_staking_km: 9.8,
    riparian_closure_ha: 42.0
  },
  {
    id: 'REHAB-04',
    code: 'WS-LEG-03',
    name: 'ቦርከና ገደል ማገገሚያ (Borkena Gorge Catchment)',
    zone: 'ደቡብ ወሎ',
    woreda: 'ቃሉ',
    kebele: 'ኮምቦልቻ ዙሪያ',
    year: 2018,
    quarter: 'Annual (ዓመታዊ)',
    sandbag_m3: 260,
    wooden_m3: 180,
    stone_m3: 1250,
    gabion_m3: 490,
    arch_weir_m3: 310,
    arc_masonry_m3: 210,
    gully_reshaping_m3: 4600,
    brushwood_barriers_km: 7.1,
    gully_revegetation_ha: 11.8,
    riverbank_tree_km: 10.2,
    live_staking_km: 5.4,
    riparian_closure_ha: 24.0
  }
];

export default function RehabilitationPage() {
  const [records, setRecords] = useState(INITIAL_REHAB_DATA);

  // Main Page Filters
  const [selectedZone, setSelectedZone] = useState('ALL');
  const [selectedYear, setSelectedYear] = useState('ALL');
  const [selectedQuarter, setSelectedQuarter] = useState('Annual (ዓመታዊ)');
  const [searchQuery, setSearchQuery] = useState('');

  // ───── MODAL STATES ─────
  // 1. Entry / Edit Wizard Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();

  // 2. Modern View Details Modal with In-Modal Filter States
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [viewingCatchmentCode, setViewingCatchmentCode] = useState(null);
  const [modalFilterYear, setModalFilterYear] = useState(2018);
  const [modalFilterQuarter, setModalFilterQuarter] = useState('Annual (ዓመታዊ)');

  const availableYears = useMemo(() => {
    const yrs = Array.from(new Set(records.map((r) => r.year).filter(Boolean)));
    if (!yrs.includes(2018)) yrs.push(2018);
    return yrs.sort((a, b) => b - a);
  }, [records]);

  // Aggregated data per row
  const processedData = useMemo(() => {
    return records.map((r) => {
      const sb = Number(r.sandbag_m3) || 0;
      const wd = Number(r.wooden_m3) || 0;
      const st = Number(r.stone_m3) || 0;
      const gb = Number(r.gabion_m3) || 0;
      const aw = Number(r.arch_weir_m3) || 0;
      const am = Number(r.arc_masonry_m3) || 0;

      const totalCheckDamM3 = sb + wd + st + gb + aw + am;
      const totalRiverbankLinearKm = (Number(r.riverbank_tree_km) || 0) + (Number(r.live_staking_km) || 0);

      return {
        ...r,
        totalCheckDamM3,
        totalRiverbankLinearKm
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
    let grandCheckDamM3 = 0;
    let grandGullyReshapingM3 = 0;
    let grandRevegetationHa = 0;
    let grandRiverbankLinearKm = 0;
    let grandGabionM3 = 0;
    let grandStoneM3 = 0;

    filteredData.forEach((r) => {
      grandCheckDamM3 += r.totalCheckDamM3;
      grandGullyReshapingM3 += Number(r.gully_reshaping_m3) || 0;
      grandRevegetationHa += Number(r.gully_revegetation_ha) || 0;
      grandRiverbankLinearKm += r.totalRiverbankLinearKm;
      grandGabionM3 += Number(r.gabion_m3) || 0;
      grandStoneM3 += Number(r.stone_m3) || 0;
    });

    return {
      totalSites: filteredData.length,
      grandCheckDamM3,
      grandGullyReshapingM3,
      grandRevegetationHa,
      grandRiverbankLinearKm,
      grandGabionM3,
      grandStoneM3
    };
  }, [filteredData]);

  // ───── IN-MODAL DYNAMIC RECORD RESOLUTION ─────
  const currentModalRecord = useMemo(() => {
    if (!viewingCatchmentCode) return null;

    // First try exact match with Year & Quarter
    const exactMatch = processedData.find(
      (r) => r.code === viewingCatchmentCode && Number(r.year) === Number(modalFilterYear) && r.quarter === modalFilterQuarter
    );

    if (exactMatch) return exactMatch;

    // Fallback: match by Year only
    const yearMatch = processedData.find(
      (r) => r.code === viewingCatchmentCode && Number(r.year) === Number(modalFilterYear)
    );

    if (yearMatch) return yearMatch;

    // General fallback: return baseline profile for this catchment with zeroes
    const base = processedData.find((r) => r.code === viewingCatchmentCode);
    if (!base) return null;

    return {
      ...base,
      year: modalFilterYear,
      quarter: modalFilterQuarter,
      sandbag_m3: 0,
      wooden_m3: 0,
      stone_m3: 0,
      gabion_m3: 0,
      arch_weir_m3: 0,
      arc_masonry_m3: 0,
      totalCheckDamM3: 0,
      gully_reshaping_m3: 0,
      brushwood_barriers_km: 0,
      gully_revegetation_ha: 0,
      riverbank_tree_km: 0,
      live_staking_km: 0,
      riparian_closure_ha: 0,
      isNoData: true
    };
  }, [processedData, viewingCatchmentCode, modalFilterYear, modalFilterQuarter]);

  // Open Details Modal with default period context
  const openDetailsModal = (record) => {
    setViewingCatchmentCode(record.code);
    setModalFilterYear(record.year || 2018);
    setModalFilterQuarter(record.quarter || 'Annual (ዓመታዊ)');
    setIsDetailsModalOpen(true);
  };

  // ───── ENTRY WIZARD CONTROLS ─────
  const stepFields = [
    ['name', 'code', 'zone', 'woreda', 'kebele', 'year', 'quarter'],
    ['sandbag_m3', 'wooden_m3', 'stone_m3', 'gabion_m3', 'arch_weir_m3', 'arc_masonry_m3'],
    ['gully_reshaping_m3', 'brushwood_barriers_km', 'gully_revegetation_ha'],
    ['riverbank_tree_km', 'live_staking_km', 'riparian_closure_ha']
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
      year: selectedYear !== 'ALL' ? Number(selectedYear) : 2018,
      quarter: selectedQuarter !== 'ALL' ? selectedQuarter : 'Annual (ዓመታዊ)',
      sandbag_m3: 0,
      wooden_m3: 0,
      stone_m3: 0,
      gabion_m3: 0,
      arch_weir_m3: 0,
      arc_masonry_m3: 0,
      gully_reshaping_m3: 0,
      brushwood_barriers_km: 0,
      gully_revegetation_ha: 0,
      riverbank_tree_km: 0,
      live_staking_km: 0,
      riparian_closure_ha: 0
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
        message.success(`የተፋሰስ ${values.code} የማገገሚያ መረጃ ተሻሽሏል`);
      } else {
        const newRow = {
          ...values,
          id: `REHAB-${Date.now()}`
        };
        setRecords((prev) => [newRow, ...prev]);
        message.success('አዲስ የተሟላ የሸለቆና የወንዝ ዳርቻ ማገገሚያ ተመዝግቧል');
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
      'የአሸዋ ጆንያ (m³)', 'የእንጨት (m³)', 'የድንጋይ (m³)', 'የጋቢዮን (m³)', 'አርች ዌር (m³)', 'የቀስት (m³)', 'ድምር ክትር (m³)',
      'የቦረቦር ማስተካከል/ቅርጽ (m³)', 'የእፅዋት/እንጨት አጥር (km)', 'የሸለቆ ባዮሎጂካል ተከላ (Ha)',
      'የወንዝ ዳርቻ ዛፍ/ቀርከሃ (km)', 'የቀጥታ ስቴክ ማጠናከሪያ (km)', 'የወንዝ ዳርቻ ክልክል ቦታ (Ha)'
    ];

    const rows = filteredData.map((r) => [
      `"${r.code || ''}"`,
      `"${r.name || ''}"`,
      `"${r.zone || ''}"`,
      `"${r.woreda || ''}"`,
      `"${r.kebele || ''}"`,
      r.year,
      `"${r.quarter}"`,
      r.sandbag_m3 || 0,
      r.wooden_m3 || 0,
      r.stone_m3 || 0,
      r.gabion_m3 || 0,
      r.arch_weir_m3 || 0,
      r.arc_masonry_m3 || 0,
      r.totalCheckDamM3,
      r.gully_reshaping_m3 || 0,
      r.brushwood_barriers_km || 0,
      r.gully_revegetation_ha || 0,
      r.riverbank_tree_km || 0,
      r.live_staking_km || 0,
      r.riparian_closure_ha || 0
    ]);

    const metadata = [
      '# የአማራ ብሔራዊ ክልላዊ መንግሥት ግብርና ቢሮ · የተፈጥሮ ሀብት ልማት ዳይሬክቶሬት',
      '# የሸለቆ ማከም፣ የክትር ስራዎች እና የወንዝ ዳርቻ ማገገሚያ የተጠቃለለ ሪፖርት',
      `# ቀን: ${dayjs().format('YYYY-MM-DD HH:mm:ss')}`,
      ''
    ].join('\n');

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + metadata + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `Amhara_Gully_Riverbank_Restoration_${dayjs().format('YYYY-MM-DD')}.csv`;
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
      title: 'የክትር ዓይነቶች ስራ (Check Dams - m³)',
      children: [
        {
          title: 'አሸዋ ጆንያ',
          dataIndex: 'sandbag_m3',
          key: 'sandbag_m3',
          width: 80,
          align: 'right',
          render: (v) => <span style={{ fontVariantNumeric: 'tabular-nums' }}>{Number(v || 0).toLocaleString()}</span>
        },
        {
          title: 'እንጨት',
          dataIndex: 'wooden_m3',
          key: 'wooden_m3',
          width: 75,
          align: 'right',
          render: (v) => <span style={{ fontVariantNumeric: 'tabular-nums' }}>{Number(v || 0).toLocaleString()}</span>
        },
        {
          title: 'ድንጋይ',
          dataIndex: 'stone_m3',
          key: 'stone_m3',
          width: 85,
          align: 'right',
          render: (v) => <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: '#133324' }}>{Number(v || 0).toLocaleString()}</span>
        },
        {
          title: 'ጋቢዮን',
          dataIndex: 'gabion_m3',
          key: 'gabion_m3',
          width: 80,
          align: 'right',
          render: (v) => <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: '#0958d9' }}>{Number(v || 0).toLocaleString()}</span>
        },
        {
          title: 'አርች ዌር',
          dataIndex: 'arch_weir_m3',
          key: 'arch_weir_m3',
          width: 80,
          align: 'right',
          render: (v) => <span style={{ fontVariantNumeric: 'tabular-nums' }}>{Number(v || 0).toLocaleString()}</span>
        },
        {
          title: 'የቀስት',
          dataIndex: 'arc_masonry_m3',
          key: 'arc_masonry_m3',
          width: 75,
          align: 'right',
          render: (v) => <span style={{ fontVariantNumeric: 'tabular-nums' }}>{Number(v || 0).toLocaleString()}</span>
        },
        {
          title: 'ድምር (m³)',
          dataIndex: 'totalCheckDamM3',
          key: 'totalCheckDamM3',
          width: 95,
          align: 'right',
          render: (val) => (
            <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700, color: '#186e41' }}>
              {Number(val || 0).toLocaleString()}
            </span>
          )
        }
      ]
    },
    {
      title: 'የቦረቦረ መሬት ማከም (Gully Control)',
      children: [
        {
          title: 'ቅርጽ ማስተካከል (m³)',
          dataIndex: 'gully_reshaping_m3',
          key: 'gully_reshaping_m3',
          width: 110,
          align: 'right',
          render: (v) => `${Number(v || 0).toLocaleString()}`
        },
        {
          title: 'እንጨት አጥር (km)',
          dataIndex: 'brushwood_barriers_km',
          key: 'brushwood_barriers_km',
          width: 100,
          align: 'right',
          render: (v) => `${Number(v || 0).toFixed(1)}`
        },
        {
          title: 'እፅዋት ተከላ (Ha)',
          dataIndex: 'gully_revegetation_ha',
          key: 'gully_revegetation_ha',
          width: 105,
          align: 'right',
          render: (v) => `${Number(v || 0).toFixed(1)}`
        }
      ]
    },
    {
      title: 'የወንዝ ዳርቻ ማገገሚያ (Riverbank Buffer)',
      children: [
        {
          title: 'ዛፍ/ቀርከሃ (km)',
          dataIndex: 'riverbank_tree_km',
          key: 'riverbank_tree_km',
          width: 100,
          align: 'right',
          render: (v) => `${Number(v || 0).toFixed(1)}`
        },
        {
          title: 'ክልክል ቦታ (Ha)',
          dataIndex: 'riparian_closure_ha',
          key: 'riparian_closure_ha',
          width: 100,
          align: 'right',
          render: (v) => `${Number(v || 0).toFixed(1)}`
        }
      ]
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
                  ክፍል 4.3.5 & 4.3.6
                </Tag>
              </div>

              <Title level={3} style={{ color: '#ffffff', margin: 0, fontWeight: 700, letterSpacing: '-0.3px' }}>
                የሸለቆ ማከም፣ የክትር ስራዎች እና የወንዝ ዳርቻ ማገገሚያ ማዕከል
              </Title>
              <Text style={{ color: '#c4e2d3', fontSize: '13px' }}>
                Check Dam Infrastructure · Gully Reshaping & Revegetation · Riparian Bio-Engineering Buffer
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
              + አዲስ ማገገሚያ መዝግብ
            </Button>
          </Col>
        </Row>
      </Card>

      {/* ───── 2. SUMMARY KPI HUD ───── */}
      <Row gutter={[12, 12]}>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: '8px', border: '1px solid #e1e8e3', background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }} bodyStyle={{ padding: '16px 18px' }}>
            <Text type="secondary" style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.4px' }}>
              ድምር የተገነቡ ክትሮች
            </Text>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#133324', marginTop: '2px', fontVariantNumeric: 'tabular-nums' }}>
              {stats.grandCheckDamM3.toLocaleString()} <span style={{ fontSize: '12px', fontWeight: 500, color: '#737b77' }}>m³</span>
            </div>
            <div style={{ marginTop: '4px', fontSize: '11px', color: '#55665d' }}>
              ድንጋይ: <strong>{stats.grandStoneM3.toLocaleString()} m³</strong> | ጋቢዮን: <strong>{stats.grandGabionM3.toLocaleString()} m³</strong>
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: '8px', border: '1px solid #e1e8e3', background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }} bodyStyle={{ padding: '16px 18px' }}>
            <Text type="secondary" style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.4px' }}>
              የቦረቦር ቅርጽ ማስተካከል
            </Text>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#133324', marginTop: '2px', fontVariantNumeric: 'tabular-nums' }}>
              {stats.grandGullyReshapingM3.toLocaleString()} <span style={{ fontSize: '12px', fontWeight: 500, color: '#737b77' }}>m³</span>
            </div>
            <div style={{ marginTop: '4px', fontSize: '11px', color: '#55665d' }}>
              የሸለቆ አጥርና ቦረቦር መቀነስ
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: '8px', border: '1px solid #e1e8e3', background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }} bodyStyle={{ padding: '16px 18px' }}>
            <Text type="secondary" style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.4px' }}>
              የሸለቆ ባዮሎጂካል ሽፋን
            </Text>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#186e41', marginTop: '2px', fontVariantNumeric: 'tabular-nums' }}>
              {stats.grandRevegetationHa.toFixed(1)} <span style={{ fontSize: '12px', fontWeight: 500, color: '#737b77' }}>Ha</span>
            </div>
            <div style={{ marginTop: '4px', fontSize: '11px', color: '#55665d' }}>
              የተዘጉና ያገገሙ ሸለቆዎች
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: '8px', border: '1px solid #e1e8e3', background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }} bodyStyle={{ padding: '16px 18px' }}>
            <Text type="secondary" style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.4px' }}>
              የወንዝ ዳርቻ ማጠናከሪያ
            </Text>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#0958d9', marginTop: '2px', fontVariantNumeric: 'tabular-nums' }}>
              {stats.grandRiverbankLinearKm.toFixed(1)} <span style={{ fontSize: '12px', fontWeight: 500, color: '#737b77' }}>km</span>
            </div>
            <div style={{ marginTop: '4px', fontSize: '11px', color: '#55665d' }}>
              የቀርከሃ፣ ዛፍ ተከላ እና ስቴክ
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
          scroll={{ x: 1350 }}
          pagination={{ pageSize: 8, showTotal: (t) => `ድምር ${t} የተፋሰስ ማገገሚያ ሳይቶች` }}
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
                  {currentModalRecord?.name}
                </div>
                <Text type="secondary" style={{ fontSize: '11px' }}>
                  Catchment Code: <strong style={{ color: '#0958d9' }}>{currentModalRecord?.code}</strong>
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
        {currentModalRecord && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>

            {/* In-Modal Interactive Period Filter Toolbar */}
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
                <Descriptions.Item label="ዞን"><strong>{currentModalRecord.zone}</strong></Descriptions.Item>
                <Descriptions.Item label="ወረዳ"><strong>{currentModalRecord.woreda}</strong></Descriptions.Item>
                <Descriptions.Item label="ቀበሌ"><strong>{currentModalRecord.kebele}</strong></Descriptions.Item>
              </Descriptions>
            </Card>

            {currentModalRecord.isNoData && (
              <div style={{ background: '#fffbe6', border: '1px solid #ffe58f', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', color: '#ad6800' }}>
                ለተመረጠው <strong>{modalFilterYear} ዓ.ም - {modalFilterQuarter}</strong> ወቅት ምንም የተመዘገበ የክትር ስራ ሪፖርት የለም።
              </div>
            )}

            {/* Domain 1: Check Dam Breakdown */}
            <Card
              size="small"
              bordered={false}
              style={{ background: '#ffffff', border: '1px solid #e4eae6', borderRadius: '8px' }}
              title={
                <Space>
                  <BuildOutlined style={{ color: '#186e41' }} />
                  <span style={{ fontWeight: 700, fontSize: '13px' }}>1. የክትር ዓይነቶች ግንባታ (Check Dam Infrastructure)</span>
                </Space>
              }
              extra={
                <Tag color="green" style={{ fontWeight: 700 }}>
                  ድምር: {currentModalRecord.totalCheckDamM3.toLocaleString()} m³
                </Tag>
              }
            >
              <Row gutter={[12, 12]}>
                <Col span={8}>
                  <div style={{ background: '#f9fbf9', padding: '10px', borderRadius: '6px', border: '1px solid #edf2ee' }}>
                    <Text type="secondary" style={{ fontSize: '11px' }}>የአሸዋ ጆንያ ክትር</Text>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#133324', fontVariantNumeric: 'tabular-nums' }}>
                      {Number(currentModalRecord.sandbag_m3).toLocaleString()} <span style={{ fontSize: '10px', fontWeight: 400 }}>m³</span>
                    </div>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ background: '#f9fbf9', padding: '10px', borderRadius: '6px', border: '1px solid #edf2ee' }}>
                    <Text type="secondary" style={{ fontSize: '11px' }}>የእንጨት / ምሰሶ ክትር</Text>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#133324', fontVariantNumeric: 'tabular-nums' }}>
                      {Number(currentModalRecord.wooden_m3).toLocaleString()} <span style={{ fontSize: '10px', fontWeight: 400 }}>m³</span>
                    </div>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ background: '#f9fbf9', padding: '10px', borderRadius: '6px', border: '1px solid #edf2ee' }}>
                    <Text type="secondary" style={{ fontSize: '11px' }}>የድንጋይ ክትር (Stone)</Text>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#186e41', fontVariantNumeric: 'tabular-nums' }}>
                      {Number(currentModalRecord.stone_m3).toLocaleString()} <span style={{ fontSize: '10px', fontWeight: 400 }}>m³</span>
                    </div>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ background: '#f9fbf9', padding: '10px', borderRadius: '6px', border: '1px solid #edf2ee' }}>
                    <Text type="secondary" style={{ fontSize: '11px' }}>የጋቢዮን ክትር (Gabion)</Text>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#0958d9', fontVariantNumeric: 'tabular-nums' }}>
                      {Number(currentModalRecord.gabion_m3).toLocaleString()} <span style={{ fontSize: '10px', fontWeight: 400 }}>m³</span>
                    </div>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ background: '#f9fbf9', padding: '10px', borderRadius: '6px', border: '1px solid #edf2ee' }}>
                    <Text type="secondary" style={{ fontSize: '11px' }}>የአርች ዌር ክትር (Arch Weir)</Text>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#133324', fontVariantNumeric: 'tabular-nums' }}>
                      {Number(currentModalRecord.arch_weir_m3).toLocaleString()} <span style={{ fontSize: '10px', fontWeight: 400 }}>m³</span>
                    </div>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ background: '#f9fbf9', padding: '10px', borderRadius: '6px', border: '1px solid #edf2ee' }}>
                    <Text type="secondary" style={{ fontSize: '11px' }}>የቀስት ክትር (Arc Masonry)</Text>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#133324', fontVariantNumeric: 'tabular-nums' }}>
                      {Number(currentModalRecord.arc_masonry_m3).toLocaleString()} <span style={{ fontSize: '10px', fontWeight: 400 }}>m³</span>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>

            {/* Domain 2: Gully Control Works */}
            <Card
              size="small"
              bordered={false}
              style={{ background: '#ffffff', border: '1px solid #e4eae6', borderRadius: '8px' }}
              title={
                <Space>
                  <NodeIndexOutlined style={{ color: '#0958d9' }} />
                  <span style={{ fontWeight: 700, fontSize: '13px' }}>2. የቦረቦረ መሬት ማከም (Gully Control Interventions)</span>
                </Space>
              }
            >
              <Descriptions size="small" column={3} bordered>
                <Descriptions.Item label="የቅርጽ ማስተካከል (Reshaping)">
                  <strong>{Number(currentModalRecord.gully_reshaping_m3).toLocaleString()} m³</strong>
                </Descriptions.Item>
                <Descriptions.Item label="የእፅዋት አጥር (Barriers)">
                  <strong>{Number(currentModalRecord.brushwood_barriers_km).toFixed(1)} km</strong>
                </Descriptions.Item>
                <Descriptions.Item label="የሸለቆ ባዮሎጂካል ሽፋን">
                  <strong style={{ color: '#186e41' }}>{Number(currentModalRecord.gully_revegetation_ha).toFixed(1)} Ha</strong>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Domain 3: Riverbank Buffer & Stabilization */}
            <Card
              size="small"
              bordered={false}
              style={{ background: '#ffffff', border: '1px solid #e4eae6', borderRadius: '8px' }}
              title={
                <Space>
                  <BranchesOutlined style={{ color: '#133324' }} />
                  <span style={{ fontWeight: 700, fontSize: '13px' }}>3. የወንዝ ዳርቻ ማገገሚያ (Riverbank Stabilization & Buffer)</span>
                </Space>
              }
            >
              <Descriptions size="small" column={3} bordered>
                <Descriptions.Item label="የዛፍና ቀርከሃ ተከላ">
                  <strong>{Number(currentModalRecord.riverbank_tree_km).toFixed(1)} km</strong>
                </Descriptions.Item>
                <Descriptions.Item label="የቀጥታ ስቴክ (Live Staking)">
                  <strong>{Number(currentModalRecord.live_staking_km).toFixed(1)} km</strong>
                </Descriptions.Item>
                <Descriptions.Item label="የዳርቻ ክልክል ቦታ (Buffer Area)">
                  <strong style={{ color: '#0958d9' }}>{Number(currentModalRecord.riparian_closure_ha).toFixed(1)} Ha</strong>
                </Descriptions.Item>
              </Descriptions>
            </Card>

          </div>
        )}
      </Modal>

      {/* ───── 6. MULTI-STEP WIZARD MODAL ───── */}
      <Modal
        title={
          <div>
            <div style={{ fontWeight: 700, color: '#133324', fontSize: '16px' }}>
              {editingRecord ? `የ${editingRecord.name} ማገገሚያ ማሻሻያ` : 'አዲስ የሸለቆና የወንዝ ዳርቻ ማገገሚያ መመዝገቢያ'}
            </div>
            <Text type="secondary" style={{ fontSize: '11px' }}>
              Sections 4.3.5 & 4.3.6: Check Dams, Gully Control & Riverbank Buffer Bio-Engineering
            </Text>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        width={780}
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
              { title: '1. ተፋሰስና ወሰን' },
              { title: '2. የክትር ስራዎች' },
              { title: '3. የቦረቦር ማከም' },
              { title: '4. የወንዝ ዳርቻ' }
            ]}
          />
        </div>

        <Form form={form} layout="vertical">
          {/* STEP 0: Catchment Identity */}
          {currentStep === 0 && (
            <Row gutter={16}>
              <Col span={14}>
                <Form.Item name="name" label="የተፋሰስ/ሸለቆ ስም" rules={[{ required: true, message: 'ስም ያስገቡ' }]}>
                  <Input placeholder="e.g. የሪብ ወንዝ ተፋሰስ ሸለቆ" />
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

          {/* STEP 1: Check Dam Types Disaggregation (m³) */}
          {currentStep === 1 && (
            <div>
              <Divider orientation="left" style={{ margin: '4px 0 14px', fontSize: '13px', color: '#133324' }}>
                <BuildOutlined /> የተከናወኑ የክትር ዓይነቶች በግንባታ መጠን (Check Dams in m³)
              </Divider>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item name="sandbag_m3" label="1. የአሸዋ ጆንያ ክትር (m³)" rules={[{ required: true }]}>
                    <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="wooden_m3" label="2. የእንጨት / ምሰሶ ክትር (m³)" rules={[{ required: true }]}>
                    <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="stone_m3" label="3. የድንጋይ ክትር (m³)" rules={[{ required: true }]}>
                    <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="gabion_m3" label="4. የጋቢዮን ክትር (m³)" rules={[{ required: true }]}>
                    <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="arch_weir_m3" label="5. የአርች ዌር ክትር (m³)" rules={[{ required: true }]}>
                    <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="arc_masonry_m3" label="6. የቀስት ክትር (m³)" rules={[{ required: true }]}>
                    <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          )}

          {/* STEP 2: Gully Control Works */}
          {currentStep === 2 && (
            <div>
              <Divider orientation="left" style={{ margin: '4px 0 14px', fontSize: '13px', color: '#133324' }}>
                <NodeIndexOutlined /> የቦረቦረ መሬት ማከም ሥራዎች (Gully Control Interventions)
              </Divider>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item name="gully_reshaping_m3" label="የቦረቦር ቅርጽ ማስተካከል (m³)" rules={[{ required: true }]}>
                    <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="brushwood_barriers_km" label="የእፅዋት/እንጨት አጥር (km)" rules={[{ required: true }]}>
                    <InputNumber style={{ width: '100%' }} step={0.1} min={0} placeholder="0.0" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="gully_revegetation_ha" label="የሸለቆ ባዮሎጂካል ሽፋን (Ha)" rules={[{ required: true }]}>
                    <InputNumber style={{ width: '100%' }} step={0.1} min={0} placeholder="0.0" />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          )}

          {/* STEP 3: Riverbank Buffer & Stabilization */}
          {currentStep === 3 && (
            <div>
              <Divider orientation="left" style={{ margin: '4px 0 14px', fontSize: '13px', color: '#133324' }}>
                <BranchesOutlined /> የወንዝ ዳርቻ ማገገሚያና ማጠናከሪያ (Riverbank Buffer & Stabilization)
              </Divider>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item name="riverbank_tree_km" label="የዛፍና ቀርከሃ ተከላ (km)" rules={[{ required: true }]}>
                    <InputNumber style={{ width: '100%' }} step={0.1} min={0} placeholder="0.0" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="live_staking_km" label="የቀጥታ ስቴክ ማጠናከሪያ (km)" rules={[{ required: true }]}>
                    <InputNumber style={{ width: '100%' }} step={0.1} min={0} placeholder="0.0" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="riparian_closure_ha" label="የዳርቻ ክልክል ቦታ (Ha)" rules={[{ required: true }]}>
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