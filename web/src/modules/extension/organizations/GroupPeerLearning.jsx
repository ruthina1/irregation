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
  ReadOutlined,
  IdcardOutlined,
  PhoneOutlined,
  ManOutlined,
  WomanOutlined,
  RiseOutlined,
  ShopOutlined,
  CheckSquareOutlined,
  SafetyCertificateOutlined,
  SolutionOutlined
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

const LEARNING_THEMES = [
  'Best Agronomic Practices Share (ምርጥ የግብርና ልምዶች ማካፈል)',
  'Yield Success Stories & Challenges (የምርት ውጤታማነትና ተግዳሮቶች)',
  'Composting & Soil Health Techniques (ኮምፖስትና አፈር ጤንነት አጠባበቅ)',
  'Seed Selection & Storage Methods (የምርጥ ዘር ምርጫና ማከማቻ ዘዴዎች)',
  'Financial Literacy & Rural Saving (የገንዘብ ቁጠባና የብድር አጠቃቀም)'
];

const LEARNING_ACTIVITIES = [
  'Farmer Testimony & Success Story Sharing',
  'On-Farm Troubleshooting Clinic & Diagnosis',
  'Horizontal Learning Visit Between Kebeles',
  'Monthly Progress Self-Evaluation & Scoring',
  'Interactive Q&A Session with Woreda Experts'
];

const INITIAL_PEER_SESSIONS = [
  {
    id: '1',
    session_code: 'GPL-2019-EG-01',
    session_title: 'Kurar Monthly Peer Review on Teff Row-Planting Yields',
    learning_theme: 'Best Agronomic Practices Share (ምርጥ የግብርና ልምዶች ማካፈል)',
    core_activity: 'Horizontal Learning Visit Between Kebeles',
    session_leader: 'Ato Mulugeta Fentaw (Got Chair)',
    leader_phone: '+251 918 445 566',
    session_date: '2026-08-02',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    male_attendees: 18,
    female_attendees: 12,
    married_women_attendees: 10,
    youth_attendees: 7,
    investors_attendees: 0,
    session_status: 'Concluded',
    session_notes: 'Model farmers demonstrated 5cm x 20cm seed spacing techniques to neighboring development groups.',
    zone: 'East Gojjam',
    woreda: 'Dejen',
    kebele: 'Kurar'
  },
  {
    id: '2',
    session_code: 'GPL-2019-SG-04',
    session_title: 'Woreta Zuria Soil Health & Composting Experience Exchange',
    learning_theme: 'Composting & Soil Health Techniques (ኮምፖስትና አፈር ጤንነት አጠባበቅ)',
    core_activity: 'Farmer Testimony & Success Story Sharing',
    session_leader: 'Woizero Aster Melesse',
    leader_phone: '+251 922 112 334',
    session_date: '2026-08-10',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    male_attendees: 15,
    female_attendees: 15,
    married_women_attendees: 12,
    youth_attendees: 6,
    investors_attendees: 1,
    session_status: 'Concluded',
    session_notes: 'Shared practical steps for organic vermicompost pit preparation and kitchen waste recycling.',
    zone: 'South Gondar',
    woreda: 'Fogera',
    kebele: 'Woreta Zuria'
  },
  {
    id: '3',
    session_code: 'GPL-2019-WG-09',
    session_title: 'Alefa Rural Savings & Input Financing Peer Dialogue',
    learning_theme: 'Financial Literacy & Rural Saving (የገንዘብ ቁጠባና የብድር አጠቃቀም)',
    core_activity: 'Monthly Progress Self-Evaluation & Scoring',
    session_leader: 'Ato Tadesse Worku',
    leader_phone: '+251 911 889 001',
    session_date: '2026-08-18',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    male_attendees: 12,
    female_attendees: 10,
    married_women_attendees: 8,
    youth_attendees: 9,
    investors_attendees: 0,
    session_status: 'Scheduled',
    session_notes: 'Reviewing group cooperative savings mobilization and timely fertilizer loan repayment schedules.',
    zone: 'West Gojjam',
    woreda: 'Bure',
    kebele: 'Alefa'
  }
];

function GroupPeerLearningContent() {
  const { message } = App.useApp();

  const [sessions, setSessions] = useState(INITIAL_PEER_SESSIONS);
  const [isFetching, setIsFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [themeFilter, setThemeFilter] = useState(null);
  const [activityFilter, setActivityFilter] = useState(null);
  const [fiscalYearFilter, setFiscalYearFilter] = useState(null);
  const [seasonFilter, setSeasonFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [zoneFilter, setZoneFilter] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
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
      if (editingSession) {
        const initForm = async () => {
          const zoneMatch = zones.find(
            (z) => z.name === editingSession.zone || z.id === editingSession.zone_id
          );
          if (zoneMatch) {
            try {
              const wRes = locationApi?.getWoredas ? await locationApi.getWoredas(zoneMatch.id) : null;
              const wList = wRes?.data?.data?.data || wRes?.data?.data || [];
              setWoredas(wList);

              const woredaMatch = wList.find(
                (w) => w.name === editingSession.woreda || w.id === editingSession.woreda_id
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
            session_code: editingSession.session_code,
            session_title: editingSession.session_title,
            learning_theme: editingSession.learning_theme,
            core_activity: editingSession.core_activity,
            session_leader: editingSession.session_leader,
            leader_phone: editingSession.leader_phone,
            session_date: editingSession.session_date ? dayjs(editingSession.session_date) : dayjs(),
            fiscal_year: editingSession.fiscal_year || '2019 E.C.',
            season: editingSession.season || 'Meher (መኸር)',
            male_attendees: Number(editingSession.male_attendees) || 0,
            female_attendees: Number(editingSession.female_attendees) || 0,
            married_women_attendees: Number(editingSession.married_women_attendees) || 0,
            youth_attendees: Number(editingSession.youth_attendees) || 0,
            investors_attendees: Number(editingSession.investors_attendees) || 0,
            session_notes: editingSession.session_notes,
            zone_id: editingSession.zone_id || zoneMatch?.id || editingSession.zone,
            woreda_id: editingSession.woreda_id || editingSession.woreda,
            kebele_id: editingSession.kebele_id || editingSession.kebele
          });
        };
        initForm();
      } else {
        form.resetFields();
        form.setFieldsValue({
          learning_theme: 'Best Agronomic Practices Share (ምርጥ የግብርና ልምዶች ማካፈል)',
          core_activity: 'Horizontal Learning Visit Between Kebeles',
          session_date: dayjs(),
          fiscal_year: '2019 E.C.',
          season: 'Meher (መኸር)',
          male_attendees: 15,
          female_attendees: 10,
          married_women_attendees: 8,
          youth_attendees: 5,
          investors_attendees: 0
        });
        setWoredas([]);
        setKebeles([]);
      }
    }
  }, [isModalOpen, editingSession, form, zones]);

  const loadData = async () => {
    setIsFetching(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      message.success('Peer learning sessions registry refreshed');
    } catch {
      message.error('Failed to refresh data');
    } finally {
      setIsFetching(false);
    }
  };

  // Direct In-Place Status Update without Opening the Form
  const handleQuickStatusChange = (recordId, newStatus) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === recordId ? { ...s, session_status: newStatus } : s))
    );
    message.success(`Session status updated to "${newStatus}"`);
  };

  // Filter pipeline
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const code = extractName(s.session_code).toLowerCase();
      const title = extractName(s.session_title).toLowerCase();
      const leader = extractName(s.session_leader).toLowerCase();
      const kebele = extractName(s.kebele).toLowerCase();
      const woreda = extractName(s.woreda).toLowerCase();
      const zone = extractName(s.zone).toLowerCase();
      const q = searchTerm.toLowerCase();

      const matchesSearch =
        code.includes(q) || title.includes(q) || leader.includes(q) || kebele.includes(q) || woreda.includes(q) || zone.includes(q);
      const matchesTheme = themeFilter ? s.learning_theme === themeFilter : true;
      const matchesActivity = activityFilter ? s.core_activity === activityFilter : true;
      const matchesFY = fiscalYearFilter ? s.fiscal_year === fiscalYearFilter : true;
      const matchesSeason = seasonFilter ? s.season === seasonFilter : true;
      const matchesStatus = statusFilter ? s.session_status === statusFilter : true;
      const matchesZone = zoneFilter ? zone === zoneFilter.toLowerCase() : true;

      return matchesSearch && matchesTheme && matchesActivity && matchesFY && matchesSeason && matchesStatus && matchesZone;
    });
  }, [sessions, searchTerm, themeFilter, activityFilter, fiscalYearFilter, seasonFilter, statusFilter, zoneFilter]);

  // Statistics Calculation
  const stats = useMemo(() => {
    const totalSessions = filteredSessions.length;
    const maleAttendees = filteredSessions.reduce((acc, s) => acc + (Number(s.male_attendees) || 0), 0);
    const femaleAttendees = filteredSessions.reduce((acc, s) => acc + (Number(s.female_attendees) || 0), 0);
    const marriedWomen = filteredSessions.reduce((acc, s) => acc + (Number(s.married_women_attendees) || 0), 0);
    const youth = filteredSessions.reduce((acc, s) => acc + (Number(s.youth_attendees) || 0), 0);
    const investors = filteredSessions.reduce((acc, s) => acc + (Number(s.investors_attendees) || 0), 0);

    const totalAttendees = maleAttendees + femaleAttendees + marriedWomen + youth + investors;
    const totalWomenAttendees = femaleAttendees + marriedWomen;
    const womenRatio = totalAttendees > 0 ? ((totalWomenAttendees / totalAttendees) * 100).toFixed(1) : 0;
    const concludedCount = filteredSessions.filter((s) => s.session_status === 'Concluded').length;

    return {
      totalSessions,
      totalAttendees,
      maleAttendees,
      femaleAttendees,
      marriedWomen,
      totalWomenAttendees,
      youth,
      investors,
      womenRatio,
      concludedCount
    };
  }, [filteredSessions]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setThemeFilter(null);
    setActivityFilter(null);
    setFiscalYearFilter(null);
    setSeasonFilter(null);
    setStatusFilter(null);
    setZoneFilter(null);
  };

  const handleOpenModal = (record = null) => {
    setEditingSession(record);
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
        session_date: values.session_date ? values.session_date.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
        zone: selectedZone?.name || selectedZone?.zone_name || values.zone_id,
        woreda: selectedWoreda?.name || selectedWoreda?.woreda_name || values.woreda_id,
        kebele: selectedKebele?.name || selectedKebele?.kebele_name || values.kebele_id
      };

      if (editingSession) {
        setSessions((prev) =>
          prev.map((item) =>
            item.id === editingSession.id ? { ...item, ...payload, session_status: editingSession.session_status } : item
          )
        );
        message.success('Peer learning session record updated successfully');
      } else {
        const newRecord = {
          ...payload,
          id: Date.now().toString(),
          session_code: values.session_code || `GPL-${Date.now().toString().slice(-4)}`,
          session_status: 'Concluded'
        };
        setSessions((prev) => [newRecord, ...prev]);
        message.success('New peer learning session registered successfully');
      }
      setIsModalOpen(false);
    } catch (error) {
      message.error(error?.response?.data?.message || error.message || 'Failed to save peer learning record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    setSessions((prev) => prev.filter((item) => item.id !== id));
    message.success('Peer learning session record removed');
  };

  const exportToCSV = () => {
    if (!filteredSessions.length) {
      message.warning('No peer learning records available to export');
      return;
    }
    const headers = [
      'Session Code,Title,Theme,Core Activity,Date,FY,Season,Zone,Woreda,Kebele,Leader,Male (ወንድ),Female (ሴት),Married Women (ባለትዳር),Youth (ወጣቶች),Investors (ባለሃብቶች),Total Attendees,Status'
    ];
    const rows = filteredSessions.map((s) => {
      const total =
        (Number(s.male_attendees) || 0) +
        (Number(s.female_attendees) || 0) +
        (Number(s.married_women_attendees) || 0) +
        (Number(s.youth_attendees) || 0) +
        (Number(s.investors_attendees) || 0);

      return [
        `"${s.session_code || ''}"`,
        `"${s.session_title || ''}"`,
        `"${s.learning_theme || ''}"`,
        `"${s.core_activity || ''}"`,
        `"${s.session_date || ''}"`,
        `"${s.fiscal_year || ''}"`,
        `"${s.season || ''}"`,
        `"${extractName(s.zone)}"`,
        `"${extractName(s.woreda)}"`,
        `"${extractName(s.kebele)}"`,
        `"${s.session_leader || ''}"`,
        s.male_attendees || 0,
        s.female_attendees || 0,
        s.married_women_attendees || 0,
        s.youth_attendees || 0,
        s.investors_attendees || 0,
        total,
        `"${s.session_status || ''}"`
      ].join(',');
    });

    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Development_Group_Peer_Learning_${Date.now()}.csv`;
    a.click();
    message.success('Peer learning report exported successfully');
  };

  const columns = [
    {
      title: 'Session Code & Title',
      key: 'session_info',
      width: 250,
      render: (_, r) => (
        <div>
          <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{r.session_title}</strong>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>
            Code: <span style={{ fontFamily: 'monospace' }}>{r.session_code}</span> | Leader: {r.session_leader}
          </div>
        </div>
      )
    },
    {
      title: 'Learning Theme',
      dataIndex: 'learning_theme',
      key: 'learning_theme',
      width: 210,
      render: (theme) => {
        let color = 'default';
        if (theme?.includes('Agronomic')) color = 'green';
        if (theme?.includes('Composting')) color = 'gold';
        if (theme?.includes('Financial')) color = 'blue';
        if (theme?.includes('Seed')) color = 'purple';
        return <Tag color={color}>{theme}</Tag>;
      }
    },
    {
      title: 'Core Activity',
      dataIndex: 'core_activity',
      key: 'core_activity',
      width: 210,
      render: (act) => <span style={{ fontWeight: 500, color: '#262626' }}>{act}</span>
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
      title: 'Attendees Enrolled',
      key: 'attendees_breakdown',
      width: 230,
      render: (_, r) => {
        const total =
          (Number(r.male_attendees) || 0) +
          (Number(r.female_attendees) || 0) +
          (Number(r.married_women_attendees) || 0) +
          (Number(r.youth_attendees) || 0) +
          (Number(r.investors_attendees) || 0);

        return (
          <div style={{ fontSize: 11 }}>
            <div>
              Total: <strong style={{ color: '#1a5f2c' }}>{total.toLocaleString()} Attendees</strong>
            </div>
            <div style={{ color: '#8c8c8c' }}>
              <span>ወንድ: {r.male_attendees || 0}</span> | <span>ሴት: {r.female_attendees || 0}</span> | <span>ባለትዳር: {r.married_women_attendees || 0}</span>
            </div>
          </div>
        );
      }
    },
    {
      title: 'Session Status (In-Place Edit)',
      dataIndex: 'session_status',
      key: 'session_status',
      width: 190,
      render: (status, record) => (
        <Select
          value={status || 'Concluded'}
          onChange={(newVal) => handleQuickStatusChange(record.id, newVal)}
          style={{ width: '100%' }}
          size="small"
        >
          <Option value="Concluded">
            <Tag color="success" icon={<CheckCircleOutlined />} style={{ margin: 0 }}>
              Concluded
            </Tag>
          </Option>
          <Option value="Scheduled">
            <Tag color="processing" icon={<ClockCircleOutlined />} style={{ margin: 0 }}>
              Scheduled
            </Tag>
          </Option>
          <Option value="Postponed">
            <Tag color="warning" icon={<ClockCircleOutlined />} style={{ margin: 0 }}>
              Postponed
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
          <Tooltip title="View Session Dossier">
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: '#1890ff' }} />}
              onClick={() => {
                setSelectedSession(record);
                setIsDossierOpen(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Edit Session">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: '#52c41a' }} />}
              onClick={() => handleOpenModal(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Record">
            <Popconfirm
              title="Delete peer learning record?"
              description="Are you sure you want to remove this peer learning session?"
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
        <Breadcrumb.Item>Organizations</Breadcrumb.Item>
        <Breadcrumb.Item>Monthly Development Group Peer Learning</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#1a5f2c', fontFamily: "'Times New Roman', Times, serif" }}>
            Monthly Development Group Peer Learning (ወርሃዊ የልምድ ልውውጥና ትምህርት መድረኮች)
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Coordinating monthly review meetings, cross-learning exchanges between 1-to-5 clusters, and farmer-to-farmer knowledge sharing
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
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Total Attendees Enrolled</span>}
              value={stats.totalAttendees}
              prefix={<ReadOutlined style={{ color: '#1a5f2c', marginRight: 8 }} />}
              valueStyle={{ color: '#1a5f2c', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Total Sessions: <strong style={{ color: '#262626' }}>{stats.totalSessions} sessions</strong>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #1890ff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Male Attendees (ወንድ)</span>}
              value={stats.maleAttendees}
              prefix={<ManOutlined style={{ color: '#1890ff', marginRight: 8 }} />}
              valueStyle={{ color: '#1890ff', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Male participants in peer learning
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #722ed1', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Women Attendees (ሴት + ባለትዳር)</span>}
              value={stats.totalWomenAttendees}
              prefix={<WomanOutlined style={{ color: '#722ed1', marginRight: 8 }} />}
              valueStyle={{ color: '#722ed1', fontWeight: 'bold', fontSize: 24 }}
            />
            <Progress percent={Number(stats.womenRatio)} size="small" strokeColor="#722ed1" />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8c8c8c', marginTop: 2 }}>
              <span>Share: <strong style={{ color: '#722ed1' }}>{stats.womenRatio}%</strong></span>
              <span>Regional Goal: &gt; 35%</span>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #fa8c16', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Concluded & Reviewed</span>}
              value={stats.concludedCount}
              prefix={<CheckSquareOutlined style={{ color: '#fa8c16', marginRight: 8 }} />}
              valueStyle={{ color: '#fa8c16', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Youth: <strong>{stats.youth}</strong> | Investors: <strong>{stats.investors}</strong>
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
                placeholder="Search Title, Code, or Leader..."
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: 220 }}
                allowClear
              />

              <Select
                placeholder="Learning Theme"
                value={themeFilter}
                onChange={setThemeFilter}
                style={{ width: 195 }}
                allowClear
              >
                {LEARNING_THEMES.map((lt) => (
                  <Option key={lt} value={lt}>{lt}</Option>
                ))}
              </Select>

              <Select
                placeholder="Core Activity"
                value={activityFilter}
                onChange={setActivityFilter}
                style={{ width: 200 }}
                allowClear
              >
                {LEARNING_ACTIVITIES.map((la) => (
                  <Option key={la} value={la}>{la}</Option>
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
                placeholder="Filter by Zone"
                value={zoneFilter}
                onChange={setZoneFilter}
                style={{ width: 150 }}
                allowClear
              >
                {[...new Set(sessions.map((s) => extractName(s.zone)))].map((z) => (
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
                Export Peer CSV
              </Button>

              <Button
                icon={<ClearOutlined />}
                onClick={handleResetFilters}
                disabled={!(searchTerm || themeFilter || activityFilter || fiscalYearFilter || seasonFilter || statusFilter || zoneFilter)}
              >
                Reset Filters
              </Button>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => handleOpenModal(null)}
                style={{ backgroundColor: '#1a5f2c', borderColor: '#1a5f2c', fontWeight: 600 }}
              >
                Organize Session
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Main Table */}
      <Table
        columns={columns}
        dataSource={filteredSessions}
        rowKey="id"
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} peer learning sessions`
        }}
        scroll={{ x: 1350 }}
        bordered
        size="middle"
      />

      {/* Registration / Edit Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ReadOutlined style={{ color: '#1a5f2c', fontSize: 20 }} />
            <span style={{ color: '#1a5f2c', fontWeight: 'bold', fontFamily: "'Times New Roman', Times, serif", fontSize: 17 }}>
              {editingSession ? 'Edit Peer Learning Session Record' : 'Register Peer Learning Session (ወርሃዊ የልምድ ልውውጥ ምዝገባ)'}
            </span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText={editingSession ? 'Update Session' : 'Save Session Record'}
        okButtonProps={{ style: { backgroundColor: '#1a5f2c', borderColor: '#1a5f2c' }, loading: isSubmitting }}
        width={800}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Session Identification & Learning Theme
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="session_code"
                label="Session Code"
                rules={[{ required: true, message: 'Code required' }]}
              >
                <Input placeholder="e.g. GPL-2019-EG-08" />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item
                name="session_title"
                label="Peer Learning Session Title / Agenda"
                rules={[{ required: true, message: 'Title required' }]}
              >
                <Input placeholder="e.g. Kurar Monthly Peer Review on Teff Yields" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="learning_theme"
                label="Learning Theme"
                rules={[{ required: true, message: 'Select theme' }]}
              >
                <Select>
                  {LEARNING_THEMES.map((lt) => (
                    <Option key={lt} value={lt}>{lt}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="core_activity"
                label="Core Learning Activity"
                rules={[{ required: true, message: 'Select activity' }]}
              >
                <Select>
                  {LEARNING_ACTIVITIES.map((la) => (
                    <Option key={la} value={la}>{la}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={10}>
              <Form.Item
                name="session_leader"
                label="Session Leader / Facilitator"
                rules={[{ required: true, message: 'Leader required' }]}
              >
                <Input placeholder="e.g. Ato Mulugeta Fentaw" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="leader_phone"
                label="Leader Phone Number"
                rules={[{ required: true, message: 'Phone required' }]}
              >
                <Input placeholder="+251 9..." />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="session_date"
                label="Session Date"
                rules={[{ required: true, message: 'Date required' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Timeline & Planning Period
          </Divider>
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
            Attendees Enrolled by Cohort (ተሳታፊዎች በወኪል ምድብ)
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="male_attendees"
                label="Male Attendees (ወንድ)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="female_attendees"
                label="Female Attendees (ሴት)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="married_women_attendees"
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
                name="youth_attendees"
                label="Youth Attendees (ወጣቶች)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="investors_attendees"
                label="Private Investors (ባለሃብቶች)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="session_notes" label="Peer Learning Notes & Key Takeaways">
                <TextArea rows={3} placeholder="Summarize shared lessons, troubleshooting clinics, or farmer testimonials..." />
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

      {/* Comprehensive Session Dossier Modal */}
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
                <ReadOutlined />
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
                  {selectedSession?.session_title}
                </span>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                  Code: <span style={{ fontFamily: 'monospace' }}>{selectedSession?.session_code}</span> | Date:{' '}
                  {selectedSession?.session_date}
                </div>
              </div>
            </div>
            <div>
              <Tag
                color={selectedSession?.session_status === 'Concluded' ? 'success' : 'processing'}
                icon={selectedSession?.session_status === 'Concluded' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                style={{ fontSize: 12, padding: '2px 10px', borderRadius: 12 }}
              >
                {selectedSession?.session_status || 'Concluded'}
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
              handleOpenModal(selectedSession);
            }}
          >
            Edit Session
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
        {selectedSession && (
          <div style={{ paddingTop: 8 }}>
            {/* Top Metric Strip */}
            <Row gutter={12} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f6ffed', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Total Attendees</span>}
                    value={
                      (Number(selectedSession.male_attendees) || 0) +
                      (Number(selectedSession.female_attendees) || 0) +
                      (Number(selectedSession.married_women_attendees) || 0) +
                      (Number(selectedSession.youth_attendees) || 0) +
                      (Number(selectedSession.investors_attendees) || 0)
                    }
                    suffix={<span style={{ fontSize: 12 }}>People</span>}
                    valueStyle={{ fontSize: 15, fontWeight: 'bold', color: '#1a5f2c' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f0f5ff', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Learning Theme</span>}
                    value={selectedSession.learning_theme?.split(' ')[0] || 'Theme'}
                    valueStyle={{ fontSize: 15, fontWeight: 'bold', color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f9f0ff', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Women Share</span>}
                    value={
                      (Number(selectedSession.male_attendees) || 0) +
                      (Number(selectedSession.female_attendees) || 0) +
                      (Number(selectedSession.married_women_attendees) || 0) +
                      (Number(selectedSession.youth_attendees) || 0) +
                      (Number(selectedSession.investors_attendees) || 0) > 0
                        ? (
                            (((Number(selectedSession.female_attendees) || 0) +
                              (Number(selectedSession.married_women_attendees) || 0)) /
                              ((Number(selectedSession.male_attendees) || 0) +
                                (Number(selectedSession.female_attendees) || 0) +
                                (Number(selectedSession.married_women_attendees) || 0) +
                                (Number(selectedSession.youth_attendees) || 0) +
                                (Number(selectedSession.investors_attendees) || 0))) *
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
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Session Date</span>}
                    value={selectedSession.session_date}
                    valueStyle={{ fontSize: 13, fontWeight: 'bold', color: '#fa8c16' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* TABPANES */}
            <Tabs defaultActiveKey="1" type="card">
              {/* TAB 1: Session Profile */}
              <TabPane
                tab={
                  <span>
                    <TeamOutlined />
                    Attendee Demographics & Reach
                  </span>
                }
                key="1"
              >
                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }} style={{ marginBottom: 16 }}>
                  <Descriptions.Item label="Session Title" span={2}>
                    <strong style={{ color: '#1a5f2c' }}>{selectedSession.session_title}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Learning Theme">
                    <Tag color="purple">{selectedSession.learning_theme}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Core Activity">
                    <Tag color="green">{selectedSession.core_activity}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Session Leader">
                    {selectedSession.session_leader} ({selectedSession.leader_phone})
                  </Descriptions.Item>
                </Descriptions>

                <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: 16, background: '#fafafa' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1a5f2c', textTransform: 'uppercase', marginBottom: 12 }}>
                    Attendee Disaggregation (ተሳታፊዎች በወኪል ምድብ)
                  </div>
                  <Row gutter={[16, 16]}>
                    <Col span={8}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <ManOutlined style={{ color: '#1890ff', marginRight: 4 }} />
                          Male Attendees (ወንድ)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#1890ff', marginTop: 2 }}>
                          {Number(selectedSession.male_attendees || 0).toLocaleString()}
                        </div>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <WomanOutlined style={{ color: '#722ed1', marginRight: 4 }} />
                          Female Attendees (ሴት)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#722ed1', marginTop: 2 }}>
                          {Number(selectedSession.female_attendees || 0).toLocaleString()}
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
                          {Number(selectedSession.married_women_attendees || 0).toLocaleString()}
                        </div>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <RiseOutlined style={{ color: '#fa8c16', marginRight: 4 }} />
                          Youth Attendees (ወጣቶች)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#fa8c16', marginTop: 2 }}>
                          {Number(selectedSession.youth_attendees || 0).toLocaleString()}
                        </div>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <ShopOutlined style={{ color: '#13c2c2', marginRight: 4 }} />
                          Private Investors (ባለሃብቶች)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#13c2c2', marginTop: 2 }}>
                          {Number(selectedSession.investors_attendees || 0).toLocaleString()}
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
              </TabPane>

              {/* TAB 2: Learning Notes */}
              <TabPane
                tab={
                  <span>
                    <CheckSquareOutlined />
                    Learning Notes & Key Takeaways
                  </span>
                }
                key="2"
              >
                <Card size="small" bordered={false} style={{ background: '#fcfdfd', border: '1px solid #e6f7ed', borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <CheckCircleOutlined style={{ color: '#1a5f2c', fontSize: 16 }} />
                    <strong style={{ color: '#1a5f2c', fontSize: 13, textTransform: 'uppercase' }}>
                      Session Outcomes & Peer Lessons (የልምድ ልውውጥ ማስታወሻ)
                    </strong>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: '#262626', lineHeight: '1.6' }}>
                    {selectedSession.session_notes || 'Active peer learning session conducting knowledge exchange and troubleshooting.'}
                  </p>
                </Card>
              </TabPane>

              {/* TAB 3: Location */}
              <TabPane
                tab={
                  <span>
                    <EnvironmentOutlined />
                    Station Location & Campaign
                  </span>
                }
                key="3"
              >
                <Descriptions bordered size="small" column={{ xs: 1, sm: 3 }} style={{ marginBottom: 16 }}>
                  <Descriptions.Item label="Administrative Zone">
                    <strong>{extractName(selectedSession.zone)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Woreda">
                    <strong>{extractName(selectedSession.woreda)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Kebele Operational Base">
                    <span style={{ color: '#1a5f2c', fontWeight: 'bold' }}>
                      {extractName(selectedSession.kebele)}
                    </span>
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
                  <Descriptions.Item label="Fiscal Year (በጀት ዓመት)">
                    <Tag color="blue" icon={<CalendarOutlined />}>
                      {selectedSession.fiscal_year || '2019 E.C.'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Production Campaign Season">
                    <strong>{selectedSession.season || 'Meher (መኸር)'}</strong>
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

export default function GroupPeerLearning() {
  return (
    <App>
      <GroupPeerLearningContent />
    </App>
  );
}