import React, { useState, useEffect, useMemo } from 'react';
import {
  App,
  Breadcrumb,
  Typography,
  Row,
  Col,
  Card,
  Statistic,
  Progress,
  Input,
  Select,
  Button,
  Space,
  Table,
  Tag,
  Tooltip,
  Modal,
  Form,
  InputNumber,
  Divider,
  Descriptions,
  Tabs,
  Popconfirm,
  Spin,
  DatePicker
} from 'antd';
import {
  HomeOutlined,
  SearchOutlined,
  PlusOutlined,
  DownloadOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  ClearOutlined,
  CalendarOutlined,
  FileSearchOutlined,
  SolutionOutlined,
  AuditOutlined,
  CheckSquareOutlined,
  FlagOutlined,
  WarningOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { farmerApi } from '../../../services/api/farmerApi';
import { locationApi } from '../../../services/api/locationApi';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

// Helper to safely extract clean string names
const extractName = (value, defaultVal = 'Unspecified') => {
  if (!value) return defaultVal;
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    return value.name || value.title || value.kebele_name || value.woreda_name || value.zone_name || defaultVal;
  }
  return String(value);
};

const FISCAL_YEARS = ['2016 E.C.', '2017 E.C.', '2018 E.C.', '2019 E.C.', '2020 E.C.'];
const SEASONS = ['Meher (መኸር)', 'Belg (በልግ)', 'Bega / Irrigation (መስኖ/በጋ)'];

const GAP_CATEGORIES = [
  'Input Supply & Seed Quality Deficit (የምርጥ ዘርና ግብአት እጥረት)',
  'Irrigation Water Scarcity & Infrastructure (የመስኖ ውሃ እጥረት)',
  'Soil Degradation & Acidity / Salinity (የአፈር መራቆትና አሲድነት)',
  'Pest & Crop Disease Vulnerability (የተባይና በሽታ ተጋላጭነት)',
  'Post-Harvest Loss & Storage Deficit (የምርት ማከማቻ እጥረት)',
  'Market Linkage & Price Volatility (የገበያ ትስስር እጥረት)'
];

const ASSESSMENT_METHODS = [
  'Participatory Rural Appraisal - PRA (አሳታፊ የገጠር ምመና)',
  'Kebele Focus Group Discussion - FGD (የቀበሌ የትኩረት ቡድን ውይይት)',
  'DA & FTC Field Audit Report (የኤክስቴንሽን ባለሙያ ግምገማ)',
  'Household Baseline Survey (የቤተሰብ መሰረታዊ ዳሰሳ)'
];

const INITIAL_NEEDS = [
  {
    id: '1',
    assessment_code: 'NA-2019-EG-01',
    assessment_title: 'Highland Teff Acidic Soils & Seed System Gap Assessment',
    gap_category: 'Soil Degradation & Acidity / Salinity (የአፈር መራቆትና አሲድነት)',
    assessment_method: 'Participatory Rural Appraisal - PRA (አሳታፊ የገጠር ምመና)',
    assessment_date: '2026-07-12',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    lead_assessor: 'Ato Mulate Alemu (Woreda Expert)',
    priority_severity: 'Critical / High',
    affected_households: 1850,
    intervention_status: 'Resource Allocated / Funded',
    proposed_solution: 'Agricultural lime application campaign and establishment of community soil testing kiosks.',
    partner_alignment: 'AGRA / Regional Bureau of Agriculture',
    zone: 'East Gojjam',
    woreda: 'Dejen',
    kebele: 'Kurar'
  },
  {
    id: '2',
    assessment_code: 'NA-2019-SG-04',
    assessment_title: 'Small-Scale Pump Irrigation and Water Diversion Needs',
    gap_category: 'Irrigation Water Scarcity & Infrastructure (የመስኖ ውሃ እጥረት)',
    assessment_method: 'Kebele Focus Group Discussion - FGD (የቀበሌ የትኩረት ቡድን ውይይት)',
    assessment_date: '2026-07-20',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    lead_assessor: 'Woizero Tigist Abebe (Zonal Irrigation Lead)',
    priority_severity: 'Critical / High',
    affected_households: 2310,
    intervention_status: 'In-Design',
    proposed_solution: 'Construction of river diversion weir and solar-powered motorized water pumping stations.',
    partner_alignment: 'IFAD (PSIDP Programme)',
    zone: 'South Gondar',
    woreda: 'Fogera',
    kebele: 'Woreta Zuria'
  },
  {
    id: '3',
    assessment_code: 'NA-2019-WG-07',
    assessment_title: 'Post-Harvest Hermetic Storage Bag Shortage Analysis',
    gap_category: 'Post-Harvest Loss & Storage Deficit (የምርት ማከማቻ እጥረት)',
    assessment_method: 'DA & FTC Field Audit Report (የኤክስቴንሽን ባለሙያ ግምገማ)',
    assessment_date: '2026-08-02',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    lead_assessor: 'Ato Getachew Mekonnen (FTC Coordinator)',
    priority_severity: 'Moderate',
    affected_households: 1200,
    intervention_status: 'Pending Partner Match',
    proposed_solution: 'Subsidized distribution of 50kg hermetic storage bags through primary cooperatives.',
    partner_alignment: 'Sasakawa Africa Association (SAA)',
    zone: 'West Gojjam',
    woreda: 'Bure',
    kebele: 'Alefa'
  }
];

function NeedsAssessmentContent() {
  const { message } = App.useApp();

  const [assessments, setAssessments] = useState(INITIAL_NEEDS);
  const [isFetching, setIsFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [severityFilter, setSeverityFilter] = useState(null);
  const [fiscalYearFilter, setFiscalYearFilter] = useState(null);
  const [seasonFilter, setSeasonFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [zoneFilter, setZoneFilter] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState(null);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [isDossierOpen, setIsDossierOpen] = useState(false);

  // Cascading Location States (Database Fetched)
  const [zones, setZones] = useState([]);
  const [woredas, setWoredas] = useState([]);
  const [kebeles, setKebeles] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  const [form] = Form.useForm();

  // 1. Fetch Zones on Mount
  useEffect(() => {
    const fetchZones = async () => {
      try {
        const res = locationApi?.getZones 
          ? await locationApi.getZones() 
          : (farmerApi?.getZones ? await farmerApi.getZones() : null);
        const list = res?.data?.data?.data || res?.data?.data || res?.data || [];
        if (Array.isArray(list) && list.length) {
          setZones(list);
        } else {
          setZones([
            { id: 1, name: 'East Gojjam' },
            { id: 2, name: 'West Gojjam' },
            { id: 3, name: 'North Shewa' },
            { id: 4, name: 'South Gondar' }
          ]);
        }
      } catch (err) {
        console.error('Failed to load zones:', err);
      }
    };
    fetchZones();
  }, []);

  // 2. Cascade Woredas when Zone changes
  const handleZoneChange = async (zoneId) => {
    form.setFieldsValue({ woreda_id: undefined, kebele_id: undefined });
    setWoredas([]);
    setKebeles([]);
    if (!zoneId) return;

    setLoadingLocations(true);
    try {
      const res = locationApi?.getWoredas 
        ? await locationApi.getWoredas(zoneId) 
        : (farmerApi?.getWoredas ? await farmerApi.getWoredas(zoneId) : null);
      const list = res?.data?.data?.data || res?.data?.data || res?.data || [];
      setWoredas(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to load woredas:', err);
    } finally {
      setLoadingLocations(false);
    }
  };

  // 3. Cascade Kebeles when Woreda changes
  const handleWoredaChange = async (woredaId) => {
    form.setFieldsValue({ kebele_id: undefined });
    setKebeles([]);
    if (!woredaId) return;

    setLoadingLocations(true);
    try {
      const res = locationApi?.getKebeles 
        ? await locationApi.getKebeles(woredaId) 
        : (farmerApi?.getKebeles ? await farmerApi.getKebeles(woredaId) : null);
      const list = res?.data?.data?.data || res?.data?.data || res?.data || [];
      setKebeles(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to load kebeles:', err);
    } finally {
      setLoadingLocations(false);
    }
  };

  // Synchronize modal form fields cleanly when opened
  useEffect(() => {
    if (isModalOpen) {
      if (editingAssessment) {
        const initForm = async () => {
          const zoneMatch = zones.find(
            (z) => z.name === editingAssessment.zone || z.id === editingAssessment.zone_id
          );
          if (zoneMatch) {
            try {
              const wRes = locationApi?.getWoredas ? await locationApi.getWoredas(zoneMatch.id) : null;
              const wList = wRes?.data?.data?.data || wRes?.data?.data || [];
              setWoredas(wList);

              const woredaMatch = wList.find(
                (w) => w.name === editingAssessment.woreda || w.id === editingAssessment.woreda_id
              );
              if (woredaMatch) {
                const kRes = locationApi?.getKebeles ? await locationApi.getKebeles(woredaMatch.id) : null;
                setKebeles(kRes?.data?.data?.data || kRes?.data?.data || []);
              }
            } catch (e) {
              console.error('Location prefill error:', e);
            }
          }

          form.setFieldsValue({
            assessment_code: editingAssessment.assessment_code,
            assessment_title: editingAssessment.assessment_title,
            gap_category: editingAssessment.gap_category,
            assessment_method: editingAssessment.assessment_method,
            assessment_date: editingAssessment.assessment_date ? dayjs(editingAssessment.assessment_date) : dayjs(),
            fiscal_year: editingAssessment.fiscal_year || '2019 E.C.',
            season: editingAssessment.season || 'Meher (መኸር)',
            lead_assessor: editingAssessment.lead_assessor,
            priority_severity: editingAssessment.priority_severity || 'Critical / High',
            affected_households: Number(editingAssessment.affected_households) || 100,
            proposed_solution: editingAssessment.proposed_solution,
            partner_alignment: editingAssessment.partner_alignment,
            zone_id: editingAssessment.zone_id || zoneMatch?.id || editingAssessment.zone,
            woreda_id: editingAssessment.woreda_id || editingAssessment.woreda,
            kebele_id: editingAssessment.kebele_id || editingAssessment.kebele
          });
        };
        initForm();
      } else {
        form.resetFields();
        form.setFieldsValue({
          gap_category: 'Soil Degradation & Acidity / Salinity (የአፈር መራቆትና አሲድነት)',
          assessment_method: 'Participatory Rural Appraisal - PRA (አሳታፊ የገጠር ምመና)',
          assessment_date: dayjs(),
          fiscal_year: '2019 E.C.',
          season: 'Meher (መኸር)',
          priority_severity: 'Critical / High',
          affected_households: 500
        });
        setWoredas([]);
        setKebeles([]);
      }
    }
  }, [isModalOpen, editingAssessment, form, zones]);

  const loadData = async () => {
    setIsFetching(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      message.success('Needs assessment registry refreshed');
    } catch {
      message.error('Failed to refresh data');
    } finally {
      setIsFetching(false);
    }
  };

  // Direct In-Place Status Update without Opening the Form
  const handleQuickStatusChange = (recordId, newStatus) => {
    setAssessments((prev) =>
      prev.map((a) => (a.id === recordId ? { ...a, intervention_status: newStatus } : a))
    );
    message.success(`Intervention status updated to "${newStatus}"`);
  };

  // Filter pipeline
  const filteredAssessments = useMemo(() => {
    return assessments.filter((a) => {
      const code = extractName(a.assessment_code).toLowerCase();
      const title = extractName(a.assessment_title).toLowerCase();
      const assessor = extractName(a.lead_assessor).toLowerCase();
      const kebele = extractName(a.kebele).toLowerCase();
      const woreda = extractName(a.woreda).toLowerCase();
      const zone = extractName(a.zone).toLowerCase();
      const q = searchTerm.toLowerCase();

      const matchesSearch =
        code.includes(q) || title.includes(q) || assessor.includes(q) || kebele.includes(q) || woreda.includes(q) || zone.includes(q);
      const matchesCategory = categoryFilter ? a.gap_category === categoryFilter : true;
      const matchesSeverity = severityFilter ? a.priority_severity === severityFilter : true;
      const matchesFY = fiscalYearFilter ? a.fiscal_year === fiscalYearFilter : true;
      const matchesSeason = seasonFilter ? a.season === seasonFilter : true;
      const matchesStatus = statusFilter ? a.intervention_status === statusFilter : true;
      const matchesZone = zoneFilter ? zone === zoneFilter.toLowerCase() : true;

      return matchesSearch && matchesCategory && matchesSeverity && matchesFY && matchesSeason && matchesStatus && matchesZone;
    });
  }, [assessments, searchTerm, categoryFilter, severityFilter, fiscalYearFilter, seasonFilter, statusFilter, zoneFilter]);

  // Statistics Calculation
  const stats = useMemo(() => {
    const totalAssessments = filteredAssessments.length;
    const totalAffectedHouseholds = filteredAssessments.reduce((acc, a) => acc + (Number(a.affected_households) || 0), 0);
    const criticalCount = filteredAssessments.filter((a) => a.priority_severity?.includes('Critical')).length;
    const fundedCount = filteredAssessments.filter((a) => a.intervention_status === 'Resource Allocated / Funded').length;
    const fundingRate = totalAssessments > 0 ? ((fundedCount / totalAssessments) * 100).toFixed(1) : 0;

    return {
      totalAssessments,
      totalAffectedHouseholds,
      criticalCount,
      fundedCount,
      fundingRate
    };
  }, [filteredAssessments]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setCategoryFilter(null);
    setSeverityFilter(null);
    setFiscalYearFilter(null);
    setSeasonFilter(null);
    setStatusFilter(null);
    setZoneFilter(null);
  };

  const handleOpenModal = (record = null) => {
    setEditingAssessment(record);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const selectedZone = zones.find((z) => (z.id || z._id) === values.zone_id);
      const selectedWoreda = woredas.find((w) => (w.id || w._id) === values.woreda_id);
      const selectedKebele = kebeles.find((k) => (k.id || k._id) === values.kebele_id);

      const payload = {
        ...values,
        assessment_date: values.assessment_date ? values.assessment_date.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
        zone: selectedZone?.name || selectedZone?.zone_name || values.zone_id,
        woreda: selectedWoreda?.name || selectedWoreda?.woreda_name || values.woreda_id,
        kebele: selectedKebele?.name || selectedKebele?.kebele_name || values.kebele_id
      };

      if (editingAssessment) {
        setAssessments((prev) =>
          prev.map((item) =>
            item.id === editingAssessment.id ? { ...item, ...payload, intervention_status: editingAssessment.intervention_status } : item
          )
        );
        message.success('Needs assessment record updated successfully');
      } else {
        const newRecord = {
          ...payload,
          id: Date.now().toString(),
          assessment_code: values.assessment_code || `NA-${Date.now().toString().slice(-4)}`,
          intervention_status: 'Pending Partner Match'
        };
        setAssessments((prev) => [newRecord, ...prev]);
        message.success('New community needs assessment registered successfully');
      }
      setIsModalOpen(false);
    } catch (error) {
      message.error(error?.response?.data?.message || error.message || 'Failed to save needs assessment record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    setAssessments((prev) => prev.filter((item) => item.id !== id));
    message.success('Needs assessment record removed');
  };

  const exportToCSV = () => {
    if (!filteredAssessments.length) {
      message.warning('No needs assessment records available to export');
      return;
    }
    const headers = [
      'Assessment Code,Title,Gap Category,Assessment Method,Date,FY,Season,Zone,Woreda,Kebele,Lead Assessor,Severity,Affected Households,Proposed Solution,Partner Alignment,Status'
    ];
    const rows = filteredAssessments.map((a) => [
      `"${a.assessment_code || ''}"`,
      `"${a.assessment_title || ''}"`,
      `"${a.gap_category || ''}"`,
      `"${a.assessment_method || ''}"`,
      `"${a.assessment_date || ''}"`,
      `"${a.fiscal_year || ''}"`,
      `"${a.season || ''}"`,
      `"${extractName(a.zone)}"`,
      `"${extractName(a.woreda)}"`,
      `"${extractName(a.kebele)}"`,
      `"${a.lead_assessor || ''}"`,
      `"${a.priority_severity || ''}"`,
      a.affected_households || 0,
      `"${a.proposed_solution || ''}"`,
      `"${a.partner_alignment || ''}"`,
      `"${a.intervention_status || ''}"`
    ].join(','));

    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Community_Needs_Gap_Assessment_${Date.now()}.csv`;
    a.click();
    message.success('Needs assessment report exported successfully');
  };

  const columns = [
    {
      title: 'Assessment Code & Title',
      key: 'assessment_info',
      width: 250,
      render: (_, r) => (
        <div>
          <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{r.assessment_title}</strong>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>
            Code: <span style={{ fontFamily: 'monospace' }}>{r.assessment_code}</span> | {r.assessment_date}
          </div>
        </div>
      )
    },
    {
      title: 'Gap Category',
      dataIndex: 'gap_category',
      key: 'gap_category',
      width: 210,
      render: (cat) => <span style={{ fontWeight: 500, color: '#262626' }}>{cat}</span>
    },
    {
      title: 'Severity & Affected',
      key: 'severity_info',
      width: 170,
      render: (_, r) => {
        let color = 'green';
        if (r.priority_severity?.includes('Critical')) color = 'red';
        else if (r.priority_severity?.includes('High')) color = 'orange';

        return (
          <div>
            <Tag color={color}>{r.priority_severity}</Tag>
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 3 }}>
              {Number(r.affected_households || 0).toLocaleString()} HHs Affected
            </div>
          </div>
        );
      }
    },
    {
      title: 'Station (Location)',
      key: 'station',
      width: 200,
      render: (_, r) => (
        <div style={{ fontSize: 12 }}>
          <Tooltip title={`${extractName(r.zone)} > ${extractName(r.woreda)}`}>
            <span>
              <EnvironmentOutlined style={{ color: '#1a5f2c', marginRight: 4 }} />
              <strong>{extractName(r.kebele)}</strong>
            </span>
          </Tooltip>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>
            {extractName(r.zone)} &gt; {extractName(r.woreda)}
          </div>
        </div>
      )
    },
    {
      title: 'Timeline (FY / Season)',
      key: 'timeline',
      width: 180,
      render: (_, r) => (
        <div style={{ fontSize: 12 }}>
          <Tag color="blue" icon={<CalendarOutlined />}>
            {r.fiscal_year || '2019 E.C.'}
          </Tag>
          <div style={{ color: '#595959', marginTop: 2 }}>{r.season || 'Meher (መኸር)'}</div>
        </div>
      )
    },
    {
      title: 'Partner Alignment',
      dataIndex: 'partner_alignment',
      key: 'partner_alignment',
      width: 190,
      render: (partner) => <Tag color="purple">{partner || 'Unassigned'}</Tag>
    },
    {
      title: 'Intervention Status',
      dataIndex: 'intervention_status',
      key: 'intervention_status',
      width: 200,
      render: (status, record) => (
        <Select
          value={status || 'Pending Partner Match'}
          onChange={(newVal) => handleQuickStatusChange(record.id, newVal)}
          style={{ width: '100%' }}
          size="small"
        >
          <Option value="Pending Partner Match">
            <Tag color="warning" icon={<ClockCircleOutlined />} style={{ margin: 0 }}>
              Pending Match
            </Tag>
          </Option>
          <Option value="In-Design">
            <Tag color="processing" icon={<ClockCircleOutlined />} style={{ margin: 0 }}>
              In-Design
            </Tag>
          </Option>
          <Option value="Resource Allocated / Funded">
            <Tag color="success" icon={<CheckCircleOutlined />} style={{ margin: 0 }}>
              Funded / Allocated
            </Tag>
          </Option>
        </Select>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'center',
      fixed: 'right',
      width: 130,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Assessment Dossier">
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: '#1890ff' }} />}
              onClick={() => {
                setSelectedAssessment(record);
                setIsDossierOpen(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Edit Assessment">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: '#52c41a' }} />}
              onClick={() => handleOpenModal(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Record">
            <Popconfirm
              title="Delete needs assessment?"
              description="Are you sure you want to remove this community gap assessment?"
              okText="Yes"
              cancelText="No"
              onConfirm={() => handleDelete(record.id)}
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <div style={{ position: 'relative', minHeight: '100%', padding: 24, background: '#f8fafc' }}>
      {/* Navigation Header */}
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item><HomeOutlined /></Breadcrumb.Item>
        <Breadcrumb.Item>2. Research, Colleges & Development Partners</Breadcrumb.Item>
        <Breadcrumb.Item>Community Needs & Gap Assessment</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#1a5f2c', fontFamily: "'Times New Roman', Times, serif" }}>
            Community Needs & Gap Assessment (የማህበረሰብ ፍላጎቶችና ክፍተቶች ጥናት)
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Participatory diagnostic assessments linking grassroots agricultural bottlenecks with development partner funding interventions
          </Text>
        </div>
        <Button icon={<ReloadOutlined />} onClick={loadData} loading={isFetching}>
          Refresh
        </Button>
      </div>

      {/* KPI Dashboard */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #1a5f2c', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Total Assessments Logged</span>}
              value={stats.totalAssessments}
              prefix={<FileSearchOutlined style={{ color: '#1a5f2c', marginRight: 8 }} />}
              valueStyle={{ color: '#1a5f2c', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Affected Households: <strong style={{ color: '#262626' }}>{stats.totalAffectedHouseholds.toLocaleString()} HHs</strong>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #ff4d4f', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Critical Severity Gaps</span>}
              value={stats.criticalCount}
              prefix={<WarningOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />}
              valueStyle={{ color: '#ff4d4f', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Requiring urgent partner intervention
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #722ed1', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Funding & Match Rate</span>}
              value={stats.fundingRate}
              suffix="%"
              prefix={<CheckSquareOutlined style={{ color: '#722ed1', marginRight: 8 }} />}
              valueStyle={{ color: '#722ed1', fontWeight: 'bold', fontSize: 24 }}
            />
            <Progress percent={Number(stats.fundingRate)} size="small" strokeColor="#722ed1" />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8c8c8c', marginTop: 2 }}>
              <span>Funded Gaps: <strong style={{ color: '#722ed1' }}>{stats.fundedCount}</strong></span>
              <span>Target: &gt; 80%</span>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #fa8c16', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Diagnostic Categories</span>}
              value={GAP_CATEGORIES.length}
              prefix={<FlagOutlined style={{ color: '#fa8c16', marginRight: 8 }} />}
              valueStyle={{ color: '#fa8c16', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Standard grassroots bottleneck pillars
            </div>
          </Card>
        </Col>
      </Row>

      {/* Filter & Action Toolbar */}
      <Card bordered={false} style={{ marginBottom: 16, borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }} bodyStyle={{ padding: '14px 16px' }}>
        <Row justify="space-between" align="middle" gutter={[12, 12]}>
          <Col xs={24} xxl={16} xl={15}>
            <Space wrap size={[10, 10]}>
              <Input
                placeholder="Search Title, Code, or Assessor..."
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: 220 }}
                allowClear
              />

              <Select
                placeholder="Gap Category"
                value={categoryFilter}
                onChange={setCategoryFilter}
                style={{ width: 210 }}
                allowClear
              >
                {GAP_CATEGORIES.map((gc) => (
                  <Option key={gc} value={gc}>{gc}</Option>
                ))}
              </Select>

              <Select
                placeholder="Priority Severity"
                value={severityFilter}
                onChange={setSeverityFilter}
                style={{ width: 160 }}
                allowClear
              >
                <Option value="Critical / High">Critical / High</Option>
                <Option value="Moderate">Moderate</Option>
                <Option value="Low / Minor">Low / Minor</Option>
              </Select>

              <Select
                placeholder="Fiscal Year (በጀት ዓመት)"
                value={fiscalYearFilter}
                onChange={setFiscalYearFilter}
                style={{ width: 155 }}
                allowClear
              >
                {FISCAL_YEARS.map((fy) => (
                  <Option key={fy} value={fy}>{fy}</Option>
                ))}
              </Select>

              <Select
                placeholder="Season (የምርት ወቅት)"
                value={seasonFilter}
                onChange={setSeasonFilter}
                style={{ width: 175 }}
                allowClear
              >
                {SEASONS.map((s) => (
                  <Option key={s} value={s}>{s}</Option>
                ))}
              </Select>

              <Select
                placeholder="Filter by Zone"
                value={zoneFilter}
                onChange={setZoneFilter}
                style={{ width: 150 }}
                allowClear
              >
                {[...new Set(assessments.map((a) => extractName(a.zone)))].map((z) => (
                  <Option key={z} value={z}>{z}</Option>
                ))}
              </Select>
            </Space>
          </Col>

          <Col xs={24} xxl={8} xl={9} style={{ textAlign: 'right' }}>
            <Space size="small" wrap>
              <Button
                icon={<DownloadOutlined />}
                onClick={exportToCSV}
                style={{ fontWeight: 500 }}
              >
                Export Assessment CSV
              </Button>

              <Button
                icon={<ClearOutlined />}
                onClick={handleResetFilters}
                disabled={!(searchTerm || categoryFilter || severityFilter || fiscalYearFilter || seasonFilter || statusFilter || zoneFilter)}
              >
                Reset Filters
              </Button>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => handleOpenModal(null)}
                style={{ backgroundColor: '#1a5f2c', borderColor: '#1a5f2c', fontWeight: 600 }}
              >
                Log Needs Assessment
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Main Table */}
      <Table
        columns={columns}
        dataSource={filteredAssessments}
        rowKey="id"
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} needs assessments`
        }}
        scroll={{ x: 1350 }}
        bordered
        size="middle"
      />

      {/* Registration / Edit Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileSearchOutlined style={{ color: '#1a5f2c', fontSize: 20 }} />
            <span style={{ color: '#1a5f2c', fontWeight: 'bold', fontFamily: "'Times New Roman', Times, serif", fontSize: 17 }}>
              {editingAssessment ? 'Edit Needs Assessment Record' : 'Register Community Needs & Gap Assessment (የፍላጎትና ክፍተት ጥናት)'}
            </span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText={editingAssessment ? 'Update Assessment' : 'Save Assessment'}
        okButtonProps={{ style: { backgroundColor: '#1a5f2c', borderColor: '#1a5f2c' }, loading: isSubmitting }}
        width={800}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Assessment Identification & Methodology
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="assessment_code"
                label="Assessment Code"
                rules={[{ required: true, message: 'Code required' }]}
              >
                <Input placeholder="e.g. NA-2019-EG-08" />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item
                name="assessment_title"
                label="Assessment Title / Diagnostic Focus"
                rules={[{ required: true, message: 'Title required' }]}
              >
                <Input placeholder="e.g. Highland Teff Acidic Soils & Seed System Gap Assessment" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="gap_category"
                label="Primary Gap Category"
                rules={[{ required: true, message: 'Select category' }]}
              >
                <Select>
                  {GAP_CATEGORIES.map((gc) => (
                    <Option key={gc} value={gc}>{gc}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="assessment_method"
                label="Participatory Methodology Used"
                rules={[{ required: true, message: 'Select method' }]}
              >
                <Select>
                  {ASSESSMENT_METHODS.map((am) => (
                    <Option key={am} value={am}>{am}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={10}>
              <Form.Item
                name="lead_assessor"
                label="Lead Assessor / Expert"
                rules={[{ required: true, message: 'Assessor required' }]}
              >
                <Input placeholder="e.g. Ato Mulate Alemu (Woreda Expert)" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="priority_severity"
                label="Priority Severity"
                rules={[{ required: true }]}
              >
                <Select>
                  <Option value="Critical / High">Critical / High</Option>
                  <Option value="Moderate">Moderate</Option>
                  <Option value="Low / Minor">Low / Minor</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="assessment_date"
                label="Assessment Date"
                rules={[{ required: true, message: 'Date required' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Timeline & Affected Impact Quotas
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="fiscal_year"
                label="Fiscal Year (በጀት ዓመት)"
                rules={[{ required: true }]}
              >
                <Select>
                  {FISCAL_YEARS.map((fy) => (
                    <Option key={fy} value={fy}>{fy}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="season"
                label="Season (የምርት ወቅት)"
                rules={[{ required: true }]}
              >
                <Select>
                  {SEASONS.map((s) => (
                    <Option key={s} value={s}>{s}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="affected_households"
                label="Affected Households (HHs)"
                rules={[{ required: true }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="proposed_solution" label="Proposed Technical Solution & Intervention">
                <TextArea rows={3} placeholder="Summarize recommended agronomic or infrastructural solutions..." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="partner_alignment" label="Target Development Partner Alignment">
                <Input placeholder="e.g. AGRA / IFAD / World Bank" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Administrative Station (Fetched from Database)
          </Divider>
          <Spin spinning={loadingLocations}>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="zone_id"
                  label="Zone"
                  rules={[{ required: true, message: 'Zone is required' }]}
                >
                  <Select
                    placeholder="Select Zone"
                    onChange={handleZoneChange}
                    showSearch
                    optionFilterProp="children"
                    allowClear
                  >
                    {zones.map((z) => (
                      <Option key={z.id || z._id} value={z.id || z._id}>
                        {z.name || z.zone_name || z.title}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                  name="woreda_id"
                  label="Woreda"
                  rules={[{ required: true, message: 'Woreda is required' }]}
                >
                  <Select
                    placeholder={woredas.length ? 'Select Woreda' : 'Select Zone first'}
                    onChange={handleWoredaChange}
                    disabled={!woredas.length}
                    showSearch
                    optionFilterProp="children"
                    allowClear
                  >
                    {woredas.map((w) => (
                      <Option key={w.id || w._id} value={w.id || w._id}>
                        {w.name || w.woreda_name || w.title}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                  name="kebele_id"
                  label="Kebele"
                  rules={[{ required: true, message: 'Kebele is required' }]}
                >
                  <Select
                    placeholder={kebeles.length ? 'Select Kebele' : 'Select Woreda first'}
                    disabled={!kebeles.length}
                    showSearch
                    optionFilterProp="children"
                    allowClear
                  >
                    {kebeles.map((k) => (
                      <Option key={k.id || k._id} value={k.id || k._id}>
                        {k.name || k.kebele_name || k.title}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Spin>
        </Form>
      </Modal>

      {/* Comprehensive Assessment Dossier Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 8,
                  backgroundColor: '#e6f7ed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#1a5f2c',
                  fontSize: 20
                }}
              >
                <FileSearchOutlined />
              </div>
              <div>
                <span
                  style={{
                    fontSize: 17,
                    fontWeight: 'bold',
                    color: '#1a5f2c',
                    fontFamily: "'Times New Roman', Times, serif"
                  }}
                >
                  {selectedAssessment?.assessment_title}
                </span>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                  Code: <span style={{ fontFamily: 'monospace' }}>{selectedAssessment?.assessment_code}</span> | Date:{' '}
                  {selectedAssessment?.assessment_date}
                </div>
              </div>
            </div>
            <div>
              <Tag
                color={
                  selectedAssessment?.intervention_status === 'Resource Allocated / Funded'
                    ? 'success'
                    : selectedAssessment?.intervention_status === 'In-Design'
                    ? 'processing'
                    : 'warning'
                }
                style={{ fontSize: 12, padding: '2px 10px', borderRadius: 12 }}
              >
                {selectedAssessment?.intervention_status || 'Pending'}
              </Tag>
            </div>
          </div>
        }
        open={isDossierOpen}
        onCancel={() => setIsDossierOpen(false)}
        footer={[
          <Button
            key="edit"
            icon={<EditOutlined />}
            onClick={() => {
              setIsDossierOpen(false);
              handleOpenModal(selectedAssessment);
            }}
          >
            Edit Assessment
          </Button>,
          <Button
            key="close"
            type="primary"
            onClick={() => setIsDossierOpen(false)}
            style={{ backgroundColor: '#1a5f2c', borderColor: '#1a5f2c', fontWeight: 600 }}
          >
            Done
          </Button>
        ]}
        width={850}
        destroyOnClose
      >
        {selectedAssessment && (
          <div style={{ paddingTop: 8 }}>
            {/* Top Metric Strip */}
            <Row gutter={12} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f6ffed', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Affected Households</span>}
                    value={selectedAssessment.affected_households || 0}
                    suffix={<span style={{ fontSize: 12 }}>HHs</span>}
                    valueStyle={{ fontSize: 15, fontWeight: 'bold', color: '#1a5f2c' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#fff1f0', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Priority Severity</span>}
                    value={selectedAssessment.priority_severity || 'High'}
                    valueStyle={{ fontSize: 14, fontWeight: 'bold', color: '#ff4d4f' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f9f0ff', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Partner Alignment</span>}
                    value={selectedAssessment.partner_alignment?.split(' ')[0] || 'Partner'}
                    valueStyle={{ fontSize: 15, fontWeight: 'bold', color: '#722ed1' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#fff7e6', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Assessment Date</span>}
                    value={selectedAssessment.assessment_date}
                    valueStyle={{ fontSize: 13, fontWeight: 'bold', color: '#fa8c16' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* TABPANES */}
            <Tabs defaultActiveKey="1" type="card">
              {/* TAB 1: Assessment Profile */}
              <TabPane
                tab={
                  <span>
                    <FileSearchOutlined />
                    Diagnostic Profile & Solutions
                  </span>
                }
                key="1"
              >
                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }} style={{ marginBottom: 16 }}>
                  <Descriptions.Item label="Assessment Title" span={2}>
                    <strong style={{ color: '#1a5f2c' }}>{selectedAssessment.assessment_title}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Gap Category">
                    <Tag color="purple">{selectedAssessment.gap_category}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Methodology">
                    <Tag color="cyan">{selectedAssessment.assessment_method}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Lead Assessor">
                    {selectedAssessment.lead_assessor}
                  </Descriptions.Item>
                  <Descriptions.Item label="Partner Alignment">
                    <Tag color="green">{selectedAssessment.partner_alignment}</Tag>
                  </Descriptions.Item>
                </Descriptions>

                <Card size="small" bordered={false} style={{ background: '#fcfdfd', border: '1px solid #e6f7ed', borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <SolutionOutlined style={{ color: '#1a5f2c', fontSize: 16 }} />
                    <strong style={{ color: '#1a5f2c', fontSize: 13, textTransform: 'uppercase' }}>
                      Proposed Technical Solution & Intervention (የመፍትሄ ሃሳብ)
                    </strong>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: '#262626', lineHeight: '1.6' }}>
                    {selectedAssessment.proposed_solution || 'Targeted technical intervention designed to mitigate grassroots agricultural bottleneck.'}
                  </p>
                </Card>
              </TabPane>

              {/* TAB 2: Station Location */}
              <TabPane
                tab={
                  <span>
                    <EnvironmentOutlined />
                    Station Location & Campaign
                  </span>
                }
                key="2"
              >
                <Descriptions bordered size="small" column={{ xs: 1, sm: 3 }} style={{ marginBottom: 16 }}>
                  <Descriptions.Item label="Administrative Zone">
                    <strong>{extractName(selectedAssessment.zone)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Woreda">
                    <strong>{extractName(selectedAssessment.woreda)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Kebele Operational Base">
                    <span style={{ color: '#1a5f2c', fontWeight: 'bold' }}>
                      {extractName(selectedAssessment.kebele)}
                    </span>
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
                  <Descriptions.Item label="Fiscal Year (በጀት ዓመት)">
                    <Tag color="blue" icon={<CalendarOutlined />}>
                      {selectedAssessment.fiscal_year || '2019 E.C.'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Production Campaign Season">
                    <strong>{selectedAssessment.season || 'Meher (መኸር)'}</strong>
                  </Descriptions.Item>
                </Descriptions>
              </TabPane>
            </Tabs>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default function NeedsAssessment() {
  return (
    <App>
      <NeedsAssessmentContent />
    </App>
  );
}