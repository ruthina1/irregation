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
  AuditOutlined,
  SolutionOutlined,
  WomanOutlined,
  ManOutlined,
  RiseOutlined,
  ShopOutlined,
  AlertOutlined,
  BankOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { farmerApi } from '../../services/api/farmerApi';
import { locationApi } from '../../services/api/locationApi';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

// Helper to safely extract clean string values
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

const SUPERVISION_LEVELS = [
  'Federal SMS (ፌዴራል)',
  'Regional SMS (ክልል)',
  'Zonal SMS (ዞን)',
  'Woreda SMS (ወረዳ)'
];

const SUPERVISION_FOCUS_AREAS = [
  'Full Package Technology Adoption (ሙሉ ፓኬጅ)',
  'FTC Functionality & Training (የማሰልጠኛ ማዕከላት)',
  'Crop Protection & Pest Monitoring (ፀረ-ተባይ/ወረርሽኝ)',
  'Irrigation & Water Management (መስኖ ልማት)',
  'Livestock & Forage Improvement (እንስሳት ሀብት)',
  'Soil & Watershed Conservation (የተፈጥሮ ሀብት)'
];

const INITIAL_SUPERVISION_RECORDS = [
  {
    id: '1',
    mission_code: 'SMS-2019-EG-01',
    supervision_level: 'Zonal SMS (ዞን)',
    lead_supervisor: 'Dr. Solomon Belayneh (Agronomist)',
    supervisor_team_count: 3,
    mission_date: '2026-08-12',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    focus_area: 'Full Package Technology Adoption (ሙሉ ፓኬጅ)',
    target_ftc: 'Kurar Farmers Training Center',
    male_heads_reached: 320,
    female_heads_reached: 95,
    married_women_reached: 280,
    youth_reached: 110,
    investors_reached: 3,
    status: 'Completed',
    findings_summary: 'Bora Teff row-planting well adopted; blended fertilizer applied on schedule; minor localized weed pressure identified.',
    action_items: 'Woreda SMS to deliver targeted broadleaf herbicide guidance within 7 days.',
    zone: 'East Gojjam',
    woreda: 'Dejen',
    kebele: 'Kurar'
  },
  {
    id: '2',
    mission_code: 'SMS-2019-RG-04',
    supervision_level: 'Regional SMS (ክልል)',
    lead_supervisor: 'Woizero Aynalem Tadesse (Horticulture Specialist)',
    supervisor_team_count: 4,
    mission_date: '2026-08-18',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    focus_area: 'FTC Functionality & Training (የማሰልጠኛ ማዕከላት)',
    target_ftc: 'Woreta Zuria Agro Center',
    male_heads_reached: 410,
    female_heads_reached: 130,
    married_women_reached: 340,
    youth_reached: 145,
    investors_reached: 6,
    status: 'Completed',
    findings_summary: 'All 3 DAs stationed on-duty; demonstration plot fully cultivated with certified vegetable and rice seed varieties.',
    action_items: 'Equip the demonstration training hall with modern audiovisual extension materials.',
    zone: 'South Gondar',
    woreda: 'Fogera',
    kebele: 'Woreta Zuria'
  },
  {
    id: '3',
    mission_code: 'SMS-2019-WR-09',
    supervision_level: 'Woreda SMS (ወረዳ)',
    lead_supervisor: 'Ato Kassahun Mengistu (Natural Resources)',
    supervisor_team_count: 2,
    mission_date: '2026-08-25',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    focus_area: 'Soil & Watershed Conservation (የተፈጥሮ ሀብት)',
    target_ftc: 'Alefa Integrated Training Center',
    male_heads_reached: 215,
    female_heads_reached: 60,
    married_women_reached: 185,
    youth_reached: 75,
    investors_reached: 1,
    status: 'Action Required',
    findings_summary: 'Terracing stone bund maintenance in progress; gully rehabilitation requires biological vegetative stabilization.',
    action_items: 'Distribute Vetiver and Napier grass slips from community nursery beds immediately.',
    zone: 'West Gojjam',
    woreda: 'Bure',
    kebele: 'Alefa'
  }
];

function MultilevelSMSSupervisionContent() {
  const { message } = App.useApp();

  const [records, setRecords] = useState(INITIAL_SUPERVISION_RECORDS);
  const [isFetching, setIsFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState(null);
  const [fiscalYearFilter, setFiscalYearFilter] = useState(null);
  const [seasonFilter, setSeasonFilter] = useState(null);
  const [focusAreaFilter, setFocusAreaFilter] = useState(null);
  const [zoneFilter, setZoneFilter] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
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

  // Synchronize modal fields cleanly when opened
  useEffect(() => {
    if (isModalOpen) {
      if (editingRecord) {
        const initForm = async () => {
          const zoneMatch = zones.find(
            (z) => z.name === editingRecord.zone || z.id === editingRecord.zone_id
          );
          if (zoneMatch) {
            try {
              const wRes = locationApi?.getWoredas ? await locationApi.getWoredas(zoneMatch.id) : null;
              const wList = wRes?.data?.data?.data || wRes?.data?.data || [];
              setWoredas(wList);

              const woredaMatch = wList.find(
                (w) => w.name === editingRecord.woreda || w.id === editingRecord.woreda_id
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
            mission_code: editingRecord.mission_code,
            supervision_level: editingRecord.supervision_level,
            lead_supervisor: editingRecord.lead_supervisor,
            supervisor_team_count: Number(editingRecord.supervisor_team_count) || 3,
            mission_date: editingRecord.mission_date ? dayjs(editingRecord.mission_date) : dayjs(),
            fiscal_year: editingRecord.fiscal_year || '2019 E.C.',
            season: editingRecord.season || 'Meher (መኸር)',
            focus_area: editingRecord.focus_area,
            target_ftc: editingRecord.target_ftc,
            male_heads_reached: Number(editingRecord.male_heads_reached) || 0,
            female_heads_reached: Number(editingRecord.female_heads_reached) || 0,
            married_women_reached: Number(editingRecord.married_women_reached) || 0,
            youth_reached: Number(editingRecord.youth_reached) || 0,
            investors_reached: Number(editingRecord.investors_reached) || 0,
            findings_summary: editingRecord.findings_summary,
            action_items: editingRecord.action_items,
            zone_id: editingRecord.zone_id || zoneMatch?.id || editingRecord.zone,
            woreda_id: editingRecord.woreda_id || editingRecord.woreda,
            kebele_id: editingRecord.kebele_id || editingRecord.kebele
          });
        };
        initForm();
      } else {
        form.resetFields();
        form.setFieldsValue({
          supervision_level: 'Zonal SMS (ዞን)',
          supervisor_team_count: 3,
          mission_date: dayjs(),
          fiscal_year: '2019 E.C.',
          season: 'Meher (መኸር)',
          focus_area: 'Full Package Technology Adoption (ሙሉ ፓኬጅ)',
          male_heads_reached: 0,
          female_heads_reached: 0,
          married_women_reached: 0,
          youth_reached: 0,
          investors_reached: 0
        });
        setWoredas([]);
        setKebeles([]);
      }
    }
  }, [isModalOpen, editingRecord, form, zones]);

  const loadData = async () => {
    setIsFetching(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      message.success('Supervision records refreshed');
    } catch {
      message.error('Failed to refresh data');
    } finally {
      setIsFetching(false);
    }
  };

  // Direct In-Place Status Update without Opening the Form
  const handleQuickStatusChange = (recordId, newStatus) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === recordId ? { ...r, status: newStatus } : r))
    );
    message.success(`Supervision status updated to "${newStatus}"`);
  };

  // Filter pipeline
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const code = extractName(r.mission_code).toLowerCase();
      const supervisor = extractName(r.lead_supervisor).toLowerCase();
      const ftc = extractName(r.target_ftc).toLowerCase();
      const kebele = extractName(r.kebele).toLowerCase();
      const woreda = extractName(r.woreda).toLowerCase();
      const zone = extractName(r.zone).toLowerCase();
      const q = searchTerm.toLowerCase();

      const matchesSearch =
        code.includes(q) || supervisor.includes(q) || ftc.includes(q) || kebele.includes(q) || woreda.includes(q) || zone.includes(q);
      const matchesLevel = levelFilter ? r.supervision_level === levelFilter : true;
      const matchesFY = fiscalYearFilter ? r.fiscal_year === fiscalYearFilter : true;
      const matchesSeason = seasonFilter ? r.season === seasonFilter : true;
      const matchesFocus = focusAreaFilter ? r.focus_area === focusAreaFilter : true;
      const matchesZone = zoneFilter ? zone === zoneFilter.toLowerCase() : true;

      return matchesSearch && matchesLevel && matchesFY && matchesSeason && matchesFocus && matchesZone;
    });
  }, [records, searchTerm, levelFilter, fiscalYearFilter, seasonFilter, focusAreaFilter, zoneFilter]);

  // Statistics Aggregation
  const stats = useMemo(() => {
    const totalMissions = filteredRecords.length;
    const maleHeads = filteredRecords.reduce((acc, r) => acc + (Number(r.male_heads_reached) || 0), 0);
    const femaleHeads = filteredRecords.reduce((acc, r) => acc + (Number(r.female_heads_reached) || 0), 0);
    const marriedWomen = filteredRecords.reduce((acc, r) => acc + (Number(r.married_women_reached) || 0), 0);
    const youth = filteredRecords.reduce((acc, r) => acc + (Number(r.youth_reached) || 0), 0);
    const investors = filteredRecords.reduce((acc, r) => acc + (Number(r.investors_reached) || 0), 0);

    const totalFarmersSupported = maleHeads + femaleHeads + marriedWomen + youth + investors;
    const totalWomenSupported = femaleHeads + marriedWomen;
    const womenRatio = totalFarmersSupported > 0 ? ((totalWomenSupported / totalFarmersSupported) * 100).toFixed(1) : 0;

    return {
      totalMissions,
      totalFarmersSupported,
      maleHeads,
      femaleHeads,
      marriedWomen,
      totalWomenSupported,
      youth,
      investors,
      womenRatio
    };
  }, [filteredRecords]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setLevelFilter(null);
    setFiscalYearFilter(null);
    setSeasonFilter(null);
    setFocusAreaFilter(null);
    setZoneFilter(null);
  };

  const handleOpenModal = (record = null) => {
    setEditingRecord(record);
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
        mission_date: values.mission_date ? values.mission_date.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
        zone: selectedZone?.name || selectedZone?.zone_name || values.zone_id,
        woreda: selectedWoreda?.name || selectedWoreda?.woreda_name || values.woreda_id,
        kebele: selectedKebele?.name || selectedKebele?.kebele_name || values.kebele_id
      };

      if (editingRecord) {
        // Keep existing status when updating general mission details
        setRecords((prev) =>
          prev.map((item) =>
            item.id === editingRecord.id ? { ...item, ...payload, status: editingRecord.status } : item
          )
        );
        message.success('Supervision mission record updated successfully');
      } else {
        // Automatically default new registrations to 'In Progress'
        const newRecord = {
          ...payload,
          id: Date.now().toString(),
          mission_code: values.mission_code || `SMS-${Date.now().toString().slice(-4)}`,
          status: 'In Progress'
        };
        setRecords((prev) => [newRecord, ...prev]);
        message.success('New supervision mission logged successfully (Defaulted: In Progress)');
      }
      setIsModalOpen(false);
    } catch (error) {
      message.error(error?.response?.data?.message || error.message || 'Failed to save mission record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    setRecords((prev) => prev.filter((item) => item.id !== id));
    message.success('Supervision record deleted');
  };

  const exportToCSV = () => {
    if (!filteredRecords.length) {
      message.warning('No supervision records available to export');
      return;
    }
    const headers = [
      'Mission Code,Level,Lead Supervisor,Team Size,Date,FY,Season,Zone,Woreda,Kebele,Target FTC,Focus Area,Male Heads (አባወራ),Female Heads (እማወራ),Married Women (ባለትዳር),Youth (ወጣቶች),Investors (ባለሃብቶች),Total Supported,Supervision Status'
    ];
    const rows = filteredRecords.map((r) => {
      const total =
        (Number(r.male_heads_reached) || 0) +
        (Number(r.female_heads_reached) || 0) +
        (Number(r.married_women_reached) || 0) +
        (Number(r.youth_reached) || 0) +
        (Number(r.investors_reached) || 0);

      return [
        `"${r.mission_code || ''}"`,
        `"${r.supervision_level || ''}"`,
        `"${r.lead_supervisor || ''}"`,
        r.supervisor_team_count || 1,
        `"${r.mission_date || ''}"`,
        `"${r.fiscal_year || ''}"`,
        `"${r.season || ''}"`,
        `"${extractName(r.zone)}"`,
        `"${extractName(r.woreda)}"`,
        `"${extractName(r.kebele)}"`,
        `"${r.target_ftc || ''}"`,
        `"${r.focus_area || ''}"`,
        r.male_heads_reached || 0,
        r.female_heads_reached || 0,
        r.married_women_reached || 0,
        r.youth_reached || 0,
        r.investors_reached || 0,
        total,
        `"${r.status || ''}"`
      ].join(',');
    });

    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Indicator_SMS_Supervision_Support_${Date.now()}.csv`;
    a.click();
    message.success('Report Form 2019 exported successfully');
  };

  const columns = [
    {
      title: 'Mission & Supervisor',
      key: 'mission_info',
      width: 240,
      render: (_, r) => (
        <div>
          <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{r.lead_supervisor}</strong>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>
            Code: <span style={{ fontFamily: 'monospace' }}>{r.mission_code}</span> | Team: {r.supervisor_team_count} Experts
          </div>
        </div>
      )
    },
    {
      title: 'Supervision Level',
      dataIndex: 'supervision_level',
      key: 'supervision_level',
      width: 160,
      render: (level) => {
        let color = 'default';
        if (level?.includes('Federal')) color = 'purple';
        if (level?.includes('Regional')) color = 'geekblue';
        if (level?.includes('Zonal')) color = 'blue';
        if (level?.includes('Woreda')) color = 'green';
        return <Tag color={color}>{level}</Tag>;
      }
    },
    {
      title: 'Station & Target FTC',
      key: 'station',
      width: 210,
      render: (_, r) => (
        <div style={{ fontSize: 12 }}>
          <strong style={{ color: '#1a5f2c' }}>{r.target_ftc || 'Cluster FTC'}</strong>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>
            <EnvironmentOutlined style={{ marginRight: 4 }} />
            {extractName(r.zone)} &gt; {extractName(r.woreda)} &gt; {extractName(r.kebele)}
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
      title: 'Farmers Supported Breakdown',
      key: 'beneficiary_breakdown',
      width: 230,
      render: (_, r) => {
        const total =
          (Number(r.male_heads_reached) || 0) +
          (Number(r.female_heads_reached) || 0) +
          (Number(r.married_women_reached) || 0) +
          (Number(r.youth_reached) || 0) +
          (Number(r.investors_reached) || 0);

        return (
          <div style={{ fontSize: 11 }}>
            <div>
              Total: <strong style={{ color: '#1a5f2c' }}>{total.toLocaleString()} Farmers</strong>
            </div>
            <div style={{ color: '#8c8c8c' }}>
              <span>አባወራ: {r.male_heads_reached || 0}</span> | <span>እማወራ: {r.female_heads_reached || 0}</span> | <span>ባለትዳር: {r.married_women_reached || 0}</span>
            </div>
          </div>
        );
      }
    },
    {
      title: 'Supervision Status',
      dataIndex: 'status',
      key: 'status',
      width: 180,
      render: (status, record) => (
        <Select
          value={status || 'In Progress'}
          onChange={(newVal) => handleQuickStatusChange(record.id, newVal)}
          style={{ width: '100%' }}
          size="small"
        >
          <Option value="In Progress">
            <Tag color="processing" icon={<ClockCircleOutlined />} style={{ margin: 0 }}>
              In Progress
            </Tag>
          </Option>
          <Option value="Action Required">
            <Tag color="warning" icon={<AlertOutlined />} style={{ margin: 0 }}>
              Action Required
            </Tag>
          </Option>
          <Option value="Completed">
            <Tag color="success" icon={<CheckCircleOutlined />} style={{ margin: 0 }}>
              Completed
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
          <Tooltip title="View Supervision Dossier">
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: '#1890ff' }} />}
              onClick={() => {
                setSelectedRecord(record);
                setIsDossierOpen(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Edit Mission">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: '#52c41a' }} />}
              onClick={() => handleOpenModal(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Record">
            <Popconfirm
              title="Delete supervision mission?"
              description="Are you sure you want to remove this monitoring log?"
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
        <Breadcrumb.Item>Extension Communication & Digitalization</Breadcrumb.Item>
        <Breadcrumb.Item>Multilevel SMS Supervision & Support</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#1a5f2c', fontFamily: "'Times New Roman', Times, serif" }}>
            Multilevel SMS Supervision & Support (ድጋፍና ክትትል የሚደረግላቸዉ አርሶ አደሮች በድግግሞሽ)
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Subject Matter Specialist (SMS) supportive supervision tracking across Federal, Regional, Zonal, and Woreda tiers
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
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Total Supervised Farmers</span>}
              value={stats.totalFarmersSupported}
              prefix={<TeamOutlined style={{ color: '#1a5f2c', marginRight: 8 }} />}
              valueStyle={{ color: '#1a5f2c', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Missions Logged: <strong style={{ color: '#262626' }}>{stats.totalMissions} missions</strong>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #1890ff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Male Heads (አባወራ)</span>}
              value={stats.maleHeads}
              prefix={<ManOutlined style={{ color: '#1890ff', marginRight: 8 }} />}
              valueStyle={{ color: '#1890ff', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Household heads receiving coaching
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #722ed1', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Women Supported (እማወራ + ባለትዳር)</span>}
              value={stats.totalWomenSupported}
              prefix={<WomanOutlined style={{ color: '#722ed1', marginRight: 8 }} />}
              valueStyle={{ color: '#722ed1', fontWeight: 'bold', fontSize: 24 }}
            />
            <Progress percent={Number(stats.womenRatio)} size="small" strokeColor="#722ed1" />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8c8c8c', marginTop: 2 }}>
              <span>Share: <strong style={{ color: '#722ed1' }}>{stats.womenRatio}%</strong></span>
              <span>እማወራ: {stats.femaleHeads} | ባለትዳር: {stats.marriedWomen}</span>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #fa8c16', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Youth & Investors Reached</span>}
              value={stats.youth + stats.investors}
              prefix={<RiseOutlined style={{ color: '#fa8c16', marginRight: 8 }} />}
              valueStyle={{ color: '#fa8c16', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Youth (ወጣቶች): <strong>{stats.youth}</strong> | Investors (ባለሃብቶች): <strong>{stats.investors}</strong>
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
                placeholder="Search Mission, Supervisor, or FTC..."
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: 220 }}
                allowClear
              />

              <Select
                placeholder="Supervision Level"
                value={levelFilter}
                onChange={setLevelFilter}
                style={{ width: 175 }}
                allowClear
              >
                {SUPERVISION_LEVELS.map((lvl) => (
                  <Option key={lvl} value={lvl}>{lvl}</Option>
                ))}
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
                placeholder="Technical Focus Area"
                value={focusAreaFilter}
                onChange={setFocusAreaFilter}
                style={{ width: 210 }}
                allowClear
              >
                {SUPERVISION_FOCUS_AREAS.map((fa) => (
                  <Option key={fa} value={fa}>{fa}</Option>
                ))}
              </Select>

              <Select
                placeholder="Filter by Zone"
                value={zoneFilter}
                onChange={setZoneFilter}
                style={{ width: 150 }}
                allowClear
              >
                {[...new Set(records.map((r) => extractName(r.zone)))].map((z) => (
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
                Export Form 2019
              </Button>

              <Button
                icon={<ClearOutlined />}
                onClick={handleResetFilters}
                disabled={!(searchTerm || levelFilter || fiscalYearFilter || seasonFilter || focusAreaFilter || zoneFilter)}
              >
                Reset Filters
              </Button>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => handleOpenModal(null)}
                style={{ backgroundColor: '#1a5f2c', borderColor: '#1a5f2c', fontWeight: 600 }}
              >
                Log Supervision Mission
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Main Table */}
      <Table
        columns={columns}
        dataSource={filteredRecords}
        rowKey="id"
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} supervision missions`
        }}
        scroll={{ x: 1350 }}
        bordered
        size="middle"
      />

      {/* Registration / Edit Mission Modal (Status excluded from registration) */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileSearchOutlined style={{ color: '#1a5f2c', fontSize: 20 }} />
            <span style={{ color: '#1a5f2c', fontWeight: 'bold', fontFamily: "'Times New Roman', Times, serif", fontSize: 17 }}>
              {editingRecord ? 'Edit Supervision Mission Record' : 'Log Multilevel SMS Supervision Mission (የክትትልና ድጋፍ መረጃ)'}
            </span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText={editingRecord ? 'Update Mission' : 'Save Supervision Mission'}
        okButtonProps={{ style: { backgroundColor: '#1a5f2c', borderColor: '#1a5f2c' }, loading: isSubmitting }}
        width={800}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Mission Leadership & Administrative Tier
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="mission_code"
                label="Mission Batch Code"
                rules={[{ required: true, message: 'Code required' }]}
              >
                <Input placeholder="e.g. SMS-2019-EG-08" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="supervision_level"
                label="SMS Supervision Level"
                rules={[{ required: true, message: 'Select tier' }]}
              >
                <Select>
                  {SUPERVISION_LEVELS.map((lvl) => (
                    <Option key={lvl} value={lvl}>{lvl}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="mission_date"
                label="Supervision Date"
                rules={[{ required: true, message: 'Date required' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name="lead_supervisor"
                label="Lead SMS Expert / Team Leader"
                rules={[{ required: true, message: 'Lead supervisor name required' }]}
              >
                <Input placeholder="e.g. Dr. Solomon Belayneh (Agronomist)" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="supervisor_team_count"
                label="Total SMS Team Size"
                rules={[{ required: true }]}
              >
                <InputNumber min={1} max={15} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Technical Scope & Planning Timeline
          </Divider>
          <Row gutter={16}>
            <Col span={14}>
              <Form.Item
                name="focus_area"
                label="Primary Technical Focus Area"
                rules={[{ required: true, message: 'Select focus area' }]}
              >
                <Select>
                  {SUPERVISION_FOCUS_AREAS.map((fa) => (
                    <Option key={fa} value={fa}>{fa}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item
                name="target_ftc"
                label="Stationed FTC Center"
                rules={[{ required: true, message: 'FTC required' }]}
              >
                <Input placeholder="e.g. Kurar Farmers Training Center" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
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
            <Col span={12}>
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
          </Row>

          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Farmers Supported by Cohort (አርሶ አደሮች በድግግሞሽ የተደገፉ)
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="male_heads_reached"
                label="Male Heads (አባወራ)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="female_heads_reached"
                label="Female Heads (እማወራ)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="married_women_reached"
                label="Married Women (ባለትዳር)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="youth_reached"
                label="Youth Farmers (ወጣቶች)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="investors_reached"
                label="Commercial Investors (ባለሃብቶች)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="findings_summary" label="Key Field Findings & Observed Gaps">
                <TextArea rows={3} placeholder="Summarize field observations, DA performance, input delivery status..." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="action_items" label="Recommendations & Action Directives">
                <TextArea rows={3} placeholder="Directives given to Kebele DAs and Woreda specialists..." />
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

      {/* Multi-Tab Supervision Dossier Modal */}
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
                <AuditOutlined />
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
                  {selectedRecord?.lead_supervisor}
                </span>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                  Mission Code: <span style={{ fontFamily: 'monospace' }}>{selectedRecord?.mission_code}</span> | Tier:{' '}
                  {selectedRecord?.supervision_level}
                </div>
              </div>
            </div>
            <div>
              <Tag
                color={
                  selectedRecord?.status === 'Completed'
                    ? 'success'
                    : selectedRecord?.status === 'Action Required'
                    ? 'warning'
                    : 'processing'
                }
                style={{ fontSize: 12, padding: '2px 10px', borderRadius: 12 }}
              >
                {selectedRecord?.status || 'In Progress'}
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
              handleOpenModal(selectedRecord);
            }}
          >
            Edit Mission
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
        {selectedRecord && (
          <div style={{ paddingTop: 8 }}>
            <Row gutter={12} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f6ffed', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Total Reach</span>}
                    value={
                      (Number(selectedRecord.male_heads_reached) || 0) +
                      (Number(selectedRecord.female_heads_reached) || 0) +
                      (Number(selectedRecord.married_women_reached) || 0) +
                      (Number(selectedRecord.youth_reached) || 0) +
                      (Number(selectedRecord.investors_reached) || 0)
                    }
                    suffix={<span style={{ fontSize: 12 }}>Farmers</span>}
                    valueStyle={{ fontSize: 15, fontWeight: 'bold', color: '#1a5f2c' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f0f5ff', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Supervision Tier</span>}
                    value={selectedRecord.supervision_level?.split(' ')[0] || 'SMS'}
                    valueStyle={{ fontSize: 15, fontWeight: 'bold', color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f9f0ff', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Female Reach Ratio</span>}
                    value={
                      (Number(selectedRecord.male_heads_reached) || 0) +
                      (Number(selectedRecord.female_heads_reached) || 0) +
                      (Number(selectedRecord.married_women_reached) || 0) +
                      (Number(selectedRecord.youth_reached) || 0) +
                      (Number(selectedRecord.investors_reached) || 0) > 0
                        ? (
                            (((Number(selectedRecord.female_heads_reached) || 0) +
                              (Number(selectedRecord.married_women_reached) || 0)) /
                              ((Number(selectedRecord.male_heads_reached) || 0) +
                                (Number(selectedRecord.female_heads_reached) || 0) +
                                (Number(selectedRecord.married_women_reached) || 0) +
                                (Number(selectedRecord.youth_reached) || 0) +
                                (Number(selectedRecord.investors_reached) || 0))) *
                            100
                          ).toFixed(1)
                        : 0
                    }
                    suffix="%"
                    valueStyle={{ fontSize: 15, fontWeight: 'bold', color: '#722ed1' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#fff7e6', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Mission Date</span>}
                    value={selectedRecord.mission_date}
                    valueStyle={{ fontSize: 14, fontWeight: 'bold', color: '#fa8c16' }}
                  />
                </Card>
              </Col>
            </Row>

            <Tabs defaultActiveKey="1" type="card">
              <TabPane
                tab={
                  <span>
                    <TeamOutlined />
                    Beneficiary Cohort Breakdown
                  </span>
                }
                key="1"
              >
                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }} style={{ marginBottom: 16 }}>
                  <Descriptions.Item label="Supervision Level">
                    <Tag color="blue">{selectedRecord.supervision_level}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="SMS Team Size">
                    <strong>{selectedRecord.supervisor_team_count || 3} Experts</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Technical Focus Area" span={2}>
                    <strong style={{ color: '#1a5f2c' }}>{selectedRecord.focus_area}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Targeted FTC Center" span={2}>
                    <BankOutlined style={{ marginRight: 6, color: '#1a5f2c' }} />
                    {selectedRecord.target_ftc || 'Cluster FTC'}
                  </Descriptions.Item>
                </Descriptions>

                <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: 16, background: '#fafafa' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1a5f2c', textTransform: 'uppercase', marginBottom: 12 }}>
                    Demographic Distribution of Supported Farmers (በጾታና በዕድሜ ክፍፍል)
                  </div>
                  <Row gutter={[16, 16]}>
                    <Col span={8}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <ManOutlined style={{ color: '#1890ff', marginRight: 4 }} />
                          Male Heads (አባወራ)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#1890ff', marginTop: 2 }}>
                          {Number(selectedRecord.male_heads_reached || 0).toLocaleString()}
                        </div>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <WomanOutlined style={{ color: '#722ed1', marginRight: 4 }} />
                          Female Heads (እማወራ)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#722ed1', marginTop: 2 }}>
                          {Number(selectedRecord.female_heads_reached || 0).toLocaleString()}
                        </div>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <WomanOutlined style={{ color: '#eb2f96', marginRight: 4 }} />
                          Married Women (ባለትዳር)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#eb2f96', marginTop: 2 }}>
                          {Number(selectedRecord.married_women_reached || 0).toLocaleString()}
                        </div>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <RiseOutlined style={{ color: '#fa8c16', marginRight: 4 }} />
                          Youth Smallholders (ወጣቶች)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#fa8c16', marginTop: 2 }}>
                          {Number(selectedRecord.youth_reached || 0).toLocaleString()}
                        </div>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <ShopOutlined style={{ color: '#13c2c2', marginRight: 4 }} />
                          Commercial Investors (ባለሃብቶች)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#13c2c2', marginTop: 2 }}>
                          {Number(selectedRecord.investors_reached || 0).toLocaleString()}
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <AlertOutlined />
                    Technical Assessment & Directives
                  </span>
                }
                key="2"
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <Card size="small" bordered={false} style={{ background: '#fcfdfd', border: '1px solid #e6f7ed', borderRadius: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <CheckCircleOutlined style={{ color: '#1a5f2c', fontSize: 16 }} />
                      <strong style={{ color: '#1a5f2c', fontSize: 13, textTransform: 'uppercase' }}>
                        Observed Field Findings & Bottlenecks (የክትትል ግኝቶች)
                      </strong>
                    </div>
                    <p style={{ margin: 0, fontSize: 13, color: '#262626', lineHeight: '1.6' }}>
                      {selectedRecord.findings_summary || 'All technical benchmarks verified under standard operational criteria. No critical bottlenecks noted.'}
                    </p>
                  </Card>

                  <Card size="small" bordered={false} style={{ background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <ClockCircleOutlined style={{ color: '#fa8c16', fontSize: 16 }} />
                      <strong style={{ color: '#d46b08', fontSize: 13, textTransform: 'uppercase' }}>
                        Action Items & Follow-up Directives (የተሰጡ አቅጣጫዎች)
                      </strong>
                    </div>
                    <p style={{ margin: 0, fontSize: 13, color: '#262626', lineHeight: '1.6' }}>
                      {selectedRecord.action_items || 'Routine supportive supervision scheduled for next production cycle checkpoint.'}
                    </p>
                  </Card>
                </div>
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <EnvironmentOutlined />
                    Station & Planning Period
                  </span>
                }
                key="3"
              >
                <Descriptions bordered size="small" column={{ xs: 1, sm: 3 }}>
                  <Descriptions.Item label="Administrative Zone">
                    <strong>{extractName(selectedRecord.zone)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Woreda">
                    <strong>{extractName(selectedRecord.woreda)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Kebele Operational Base">
                    <span style={{ color: '#1a5f2c', fontWeight: 'bold' }}>
                      {extractName(selectedRecord.kebele)}
                    </span>
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }} style={{ marginTop: 16 }}>
                  <Descriptions.Item label="Fiscal Year (በጀት ዓመት)">
                    <Tag color="blue" icon={<CalendarOutlined />}>
                      {selectedRecord.fiscal_year || '2019 E.C.'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Production Campaign Season">
                    <strong>{selectedRecord.season || 'Meher (መኸር)'}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Targeted FTC Demonstration Unit" span={2}>
                    <BankOutlined style={{ marginRight: 6, color: '#1a5f2c' }} />
                    {selectedRecord.target_ftc || 'Local Farmers Training Center'}
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

export default function MultilevelSMSSupervision() {
  return (
    <App>
      <MultilevelSMSSupervisionContent />
    </App>
  );
}