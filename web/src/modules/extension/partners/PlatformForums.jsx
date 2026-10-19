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
  SolutionOutlined,
  AuditOutlined,
  CheckSquareOutlined,
  ApartmentOutlined,
  MessageOutlined,
  ManOutlined,
  WomanOutlined,
  ShopOutlined,
  RiseOutlined
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

const FORUM_TIERS = [
  'Regional Steering Committee (ክልል ከፍተኛ መድረክ)',
  'Zonal Technical Working Group (ዞን ቴክኒክ አብሮነት)',
  'Woreda Multi-Stakeholder Forum (ወረዳ ባለድርሻ አካላት መድረክ)'
];

const FORUM_THEMES = [
  'Joint Seasonal Planning & Review (ወቅታዊ የእቅድ ግምገማ)',
  'Input Distribution & Seed Harmonization (የግብአት ስርጭት ማስተባበሪያ)',
  'Climate Resilience & Watershed Strategy (አየር ንብረት ተከላካይ ስትራቴጂ)',
  'M&E Joint Field Mission Review (የጋራ ክትትልና ግምገማ)',
  'Digital Extension & ICT Synergy (ዲጂታል ኤክስቴንሽን ትብብር)'
];

const INITIAL_FORUMS = [
  {
    id: '1',
    forum_code: 'FRM-2019-EG-01',
    forum_title: 'East Gojjam Zonal Agricultural Sector Working Group Review',
    forum_tier: 'Zonal Technical Working Group (ዞን ቴክኒክ አብሮነት)',
    discussion_theme: 'Joint Seasonal Planning & Review (ወቅታዊ የእቅድ ግምገማ)',
    forum_date: '2026-07-15',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    chairperson: 'Dr. Belayneh Mekonnen (Zonal Head)',
    male_delegates: 45,
    female_delegates: 18,
    married_women_delegates: 12,
    youth_delegates: 8,
    investors_delegates: 5,
    forum_status: 'Completed',
    action_minutes: 'Aligned fertilizer trucking schedules across 14 woredas; resolved minor logistical bottlenecks with primary unions.',
    zone: 'East Gojjam',
    woreda: 'Dejen',
    kebele: 'Kurar'
  },
  {
    id: '2',
    forum_code: 'FRM-2019-SG-04',
    forum_title: 'Fogera Woreda Multi-Stakeholder Irrigation & Input Forum',
    forum_tier: 'Woreda Multi-Stakeholder Forum (ወረዳ ባለድርሻ አካላት መድረክ)',
    discussion_theme: 'Input Distribution & Seed Harmonization (የግብአት ስርጭት ማስተባበሪያ)',
    forum_date: '2026-07-28',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    chairperson: 'Ato Mulugeta Kebede (Woreda Administrator)',
    male_delegates: 60,
    female_delegates: 22,
    married_women_delegates: 16,
    youth_delegates: 14,
    investors_delegates: 7,
    forum_status: 'Completed',
    action_minutes: 'Coordinated IFAD and AGRA project interventions with local cooperative unions for seed multiplication.',
    zone: 'South Gondar',
    woreda: 'Fogera',
    kebele: 'Woreta Zuria'
  },
  {
    id: '3',
    forum_code: 'FRM-2019-RG-09',
    forum_title: 'Amhara Regional High-Level Agricultural Development Partners Forum',
    forum_tier: 'Regional Steering Committee (ክልል ከፍተኛ መድረክ)',
    discussion_theme: 'Climate Resilience & Watershed Strategy (አየር ንብረት ተከላካይ ስትራቴጂ)',
    forum_date: '2026-08-05',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    chairperson: 'Dr. Aysha Mohammed (Regional Bureau Head)',
    male_delegates: 85,
    female_delegates: 35,
    married_women_delegates: 24,
    youth_delegates: 15,
    investors_delegates: 12,
    forum_status: 'Scheduled',
    action_minutes: 'Quarterly review of multi-partner resource allocation and climate adaptation funding.',
    zone: 'West Gojjam',
    woreda: 'Bure',
    kebele: 'Alefa'
  }
];

function PlatformForumsContent() {
  const { message } = App.useApp();

  const [forums, setForums] = useState(INITIAL_FORUMS);
  const [isFetching, setIsFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState(null);
  const [themeFilter, setThemeFilter] = useState(null);
  const [fiscalYearFilter, setFiscalYearFilter] = useState(null);
  const [seasonFilter, setSeasonFilter] = useState(null);
  const [zoneFilter, setZoneFilter] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingForum, setEditingForum] = useState(null);
  const [selectedForum, setSelectedForum] = useState(null);
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
      if (editingForum) {
        const initForm = async () => {
          const zoneMatch = zones.find(
            (z) => z.name === editingForum.zone || z.id === editingForum.zone_id
          );
          if (zoneMatch) {
            try {
              const wRes = locationApi?.getWoredas ? await locationApi.getWoredas(zoneMatch.id) : null;
              const wList = wRes?.data?.data?.data || wRes?.data?.data || [];
              setWoredas(wList);

              const woredaMatch = wList.find(
                (w) => w.name === editingForum.woreda || w.id === editingForum.woreda_id
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
            forum_code: editingForum.forum_code,
            forum_title: editingForum.forum_title,
            forum_tier: editingForum.forum_tier,
            discussion_theme: editingForum.discussion_theme,
            forum_date: editingForum.forum_date ? dayjs(editingForum.forum_date) : dayjs(),
            fiscal_year: editingForum.fiscal_year || '2019 E.C.',
            season: editingForum.season || 'Meher (መኸር)',
            chairperson: editingForum.chairperson,
            male_delegates: Number(editingForum.male_delegates) || 0,
            female_delegates: Number(editingForum.female_delegates) || 0,
            married_women_delegates: Number(editingForum.married_women_delegates) || 0,
            youth_delegates: Number(editingForum.youth_delegates) || 0,
            investors_delegates: Number(editingForum.investors_delegates) || 0,
            action_minutes: editingForum.action_minutes,
            zone_id: editingForum.zone_id || zoneMatch?.id || editingForum.zone,
            woreda_id: editingForum.woreda_id || editingForum.woreda,
            kebele_id: editingForum.kebele_id || editingForum.kebele
          });
        };
        initForm();
      } else {
        form.resetFields();
        form.setFieldsValue({
          forum_tier: 'Woreda Multi-Stakeholder Forum (ወረዳ ባለድርሻ አካላት መድረክ)',
          discussion_theme: 'Joint Seasonal Planning & Review (ወቅታዊ የእቅድ ግምገማ)',
          forum_date: dayjs(),
          fiscal_year: '2019 E.C.',
          season: 'Meher (መኸር)',
          male_delegates: 0,
          female_delegates: 0,
          married_women_delegates: 0,
          youth_delegates: 0,
          investors_delegates: 0
        });
        setWoredas([]);
        setKebeles([]);
      }
    }
  }, [isModalOpen, editingForum, form, zones]);

  const loadData = async () => {
    setIsFetching(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      message.success('Partner forums registry refreshed');
    } catch {
      message.error('Failed to refresh data');
    } finally {
      setIsFetching(false);
    }
  };

  // Direct In-Place Status Update without Opening the Form
  const handleQuickStatusChange = (recordId, newStatus) => {
    setForums((prev) =>
      prev.map((f) => (f.id === recordId ? { ...f, forum_status: newStatus } : f))
    );
    message.success(`Forum status updated to "${newStatus}"`);
  };

  // Filter pipeline
  const filteredForums = useMemo(() => {
    return forums.filter((f) => {
      const code = extractName(f.forum_code).toLowerCase();
      const title = extractName(f.forum_title).toLowerCase();
      const chair = extractName(f.chairperson).toLowerCase();
      const kebele = extractName(f.kebele).toLowerCase();
      const woreda = extractName(f.woreda).toLowerCase();
      const zone = extractName(f.zone).toLowerCase();
      const q = searchTerm.toLowerCase();

      const matchesSearch =
        code.includes(q) || title.includes(q) || chair.includes(q) || kebele.includes(q) || woreda.includes(q) || zone.includes(q);
      const matchesTier = tierFilter ? f.forum_tier === tierFilter : true;
      const matchesTheme = themeFilter ? f.discussion_theme === themeFilter : true;
      const matchesFY = fiscalYearFilter ? f.fiscal_year === fiscalYearFilter : true;
      const matchesSeason = seasonFilter ? f.season === seasonFilter : true;
      const matchesZone = zoneFilter ? zone === zoneFilter.toLowerCase() : true;

      return matchesSearch && matchesTier && matchesTheme && matchesFY && matchesSeason && matchesZone;
    });
  }, [forums, searchTerm, tierFilter, themeFilter, fiscalYearFilter, seasonFilter, zoneFilter]);

  // Statistics Calculation
  const stats = useMemo(() => {
    const totalForums = filteredForums.length;
    const maleDelegates = filteredForums.reduce((acc, f) => acc + (Number(f.male_delegates) || 0), 0);
    const femaleDelegates = filteredForums.reduce((acc, f) => acc + (Number(f.female_delegates) || 0), 0);
    const marriedWomen = filteredForums.reduce((acc, f) => acc + (Number(f.married_women_delegates) || 0), 0);
    const youth = filteredForums.reduce((acc, f) => acc + (Number(f.youth_delegates) || 0), 0);
    const investors = filteredForums.reduce((acc, f) => acc + (Number(f.investors_delegates) || 0), 0);

    const totalParticipants = maleDelegates + femaleDelegates + marriedWomen + youth + investors;
    const totalWomenParticipants = femaleDelegates + marriedWomen;
    const womenRatio = totalParticipants > 0 ? ((totalWomenParticipants / totalParticipants) * 100).toFixed(1) : 0;

    return {
      totalForums,
      totalParticipants,
      maleDelegates,
      femaleDelegates,
      marriedWomen,
      totalWomenParticipants,
      youth,
      investors,
      womenRatio
    };
  }, [filteredForums]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setTierFilter(null);
    setThemeFilter(null);
    setFiscalYearFilter(null);
    setSeasonFilter(null);
    setZoneFilter(null);
  };

  const handleOpenModal = (record = null) => {
    setEditingForum(record);
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
        forum_date: values.forum_date ? values.forum_date.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
        zone: selectedZone?.name || selectedZone?.zone_name || values.zone_id,
        woreda: selectedWoreda?.name || selectedWoreda?.woreda_name || values.woreda_id,
        kebele: selectedKebele?.name || selectedKebele?.kebele_name || values.kebele_id
      };

      if (editingForum) {
        setForums((prev) =>
          prev.map((item) =>
            item.id === editingForum.id ? { ...item, ...payload, forum_status: editingForum.forum_status } : item
          )
        );
        message.success('Partner forum record updated successfully');
      } else {
        const newRecord = {
          ...payload,
          id: Date.now().toString(),
          forum_code: values.forum_code || `FRM-${Date.now().toString().slice(-4)}`,
          forum_status: 'Completed'
        };
        setForums((prev) => [newRecord, ...prev]);
        message.success('New development partner forum registered successfully');
      }
      setIsModalOpen(false);
    } catch (error) {
      message.error(error?.response?.data?.message || error.message || 'Failed to save partner forum record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    setForums((prev) => prev.filter((item) => item.id !== id));
    message.success('Partner forum record removed');
  };

  const exportToCSV = () => {
    if (!filteredForums.length) {
      message.warning('No forum records available to export');
      return;
    }
    const headers = [
      'Forum Code,Title,Tier,Theme,Date,FY,Season,Zone,Woreda,Kebele,Chairperson,Male Delegates,Female Delegates,Married Women,Youth,Investors,Total Participants,Status'
    ];
    const rows = filteredForums.map((f) => {
      const total =
        (Number(f.male_delegates) || 0) +
        (Number(f.female_delegates) || 0) +
        (Number(f.married_women_delegates) || 0) +
        (Number(f.youth_delegates) || 0) +
        (Number(f.investors_delegates) || 0);

      return [
        `"${f.forum_code || ''}"`,
        `"${f.forum_title || ''}"`,
        `"${f.forum_tier || ''}"`,
        `"${f.discussion_theme || ''}"`,
        `"${f.forum_date || ''}"`,
        `"${f.fiscal_year || ''}"`,
        `"${f.season || ''}"`,
        `"${extractName(f.zone)}"`,
        `"${extractName(f.woreda)}"`,
        `"${extractName(f.kebele)}"`,
        `"${f.chairperson || ''}"`,
        f.male_delegates || 0,
        f.female_delegates || 0,
        f.married_women_delegates || 0,
        f.youth_delegates || 0,
        f.investors_delegates || 0,
        total,
        `"${f.forum_status || ''}"`
      ].join(',');
    });

    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Regional_Zone_Woreda_Partner_Forums_${Date.now()}.csv`;
    a.click();
    message.success('Partner forums report exported successfully');
  };

  const columns = [
    {
      title: 'Forum Code & Title',
      key: 'forum_info',
      width: 250,
      render: (_, r) => (
        <div>
          <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{r.forum_title}</strong>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>
            Code: <span style={{ fontFamily: 'monospace' }}>{r.forum_code}</span> | Chair: {r.chairperson}
          </div>
        </div>
      )
    },
    {
      title: 'Forum Tier',
      dataIndex: 'forum_tier',
      key: 'forum_tier',
      width: 210,
      render: (tier) => {
        let color = 'default';
        if (tier?.includes('Regional')) color = 'purple';
        if (tier?.includes('Zonal')) color = 'geekblue';
        if (tier?.includes('Woreda')) color = 'green';
        return <Tag color={color}>{tier}</Tag>;
      }
    },
    {
      title: 'Discussion Theme',
      dataIndex: 'discussion_theme',
      key: 'discussion_theme',
      width: 220,
      render: (theme) => <span style={{ fontWeight: 500, color: '#262626' }}>{theme}</span>
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
      title: 'Participants Reached',
      key: 'participants_breakdown',
      width: 230,
      render: (_, r) => {
        const total =
          (Number(r.male_delegates) || 0) +
          (Number(r.female_delegates) || 0) +
          (Number(r.married_women_delegates) || 0) +
          (Number(r.youth_delegates) || 0) +
          (Number(r.investors_delegates) || 0);

        return (
          <div style={{ fontSize: 11 }}>
            <div>
              Total: <strong style={{ color: '#1a5f2c' }}>{total.toLocaleString()} Delegates</strong>
            </div>
            <div style={{ color: '#8c8c8c' }}>
              <span>ወንድ: {r.male_delegates || 0}</span> | <span>ሴት: {r.female_delegates || 0}</span> | <span>ባለትዳር: {r.married_women_delegates || 0}</span>
            </div>
          </div>
        );
      }
    },
    {
      title: 'Forum Status (In-Place Edit)',
      dataIndex: 'forum_status',
      key: 'forum_status',
      width: 180,
      render: (status, record) => (
        <Select
          value={status || 'Completed'}
          onChange={(newVal) => handleQuickStatusChange(record.id, newVal)}
          style={{ width: '100%' }}
          size="small"
        >
          <Option value="Completed">
            <Tag color="success" icon={<CheckCircleOutlined />} style={{ margin: 0 }}>
              Completed
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
          <Tooltip title="View Forum Dossier">
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: '#1890ff' }} />}
              onClick={() => {
                setSelectedForum(record);
                setIsDossierOpen(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Edit Forum">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: '#52c41a' }} />}
              onClick={() => handleOpenModal(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Record">
            <Popconfirm
              title="Delete partner forum record?"
              description="Are you sure you want to remove this stakeholder forum?"
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
        <Breadcrumb.Item>Regional, Zone & Woreda Partner Forums</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#1a5f2c', fontFamily: "'Times New Roman', Times, serif" }}>
            Regional, Zone & Woreda Partner Forums (የክልል፣ ዞንና ወረዳ የልማት አጋሮች መድረኮች)
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Coordinating multi-stakeholder agricultural working groups, joint planning sessions, and resource alignment forums across tiers
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
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Total Forum Participants</span>}
              value={stats.totalParticipants}
              prefix={<TeamOutlined style={{ color: '#1a5f2c', marginRight: 8 }} />}
              valueStyle={{ color: '#1a5f2c', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Total Forums Held: <strong style={{ color: '#262626' }}>{stats.totalForums} forums</strong>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #1890ff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Male Delegates (ወንድ)</span>}
              value={stats.maleDelegates}
              prefix={<ManOutlined style={{ color: '#1890ff', marginRight: 8 }} />}
              valueStyle={{ color: '#1890ff', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Stakeholder representatives in attendance
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #722ed1', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Women Delegates (ሴት + ባለትዳር)</span>}
              value={stats.totalWomenParticipants}
              prefix={<WomanOutlined style={{ color: '#722ed1', marginRight: 8 }} />}
              valueStyle={{ color: '#722ed1', fontWeight: 'bold', fontSize: 24 }}
            />
            <Progress percent={Number(stats.womenRatio)} size="small" strokeColor="#722ed1" />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8c8c8c', marginTop: 2 }}>
              <span>Share: <strong style={{ color: '#722ed1' }}>{stats.womenRatio}%</strong></span>
              <span>Regional Goal: &gt; 30%</span>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #fa8c16', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Youth & Investors Engaged</span>}
              value={stats.youth + stats.investors}
              prefix={<ApartmentOutlined style={{ color: '#fa8c16', marginRight: 8 }} />}
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
                placeholder="Search Title, Code, or Chairperson..."
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: 220 }}
                allowClear
              />

              <Select
                placeholder="Forum Tier"
                value={tierFilter}
                onChange={setTierFilter}
                style={{ width: 195 }}
                allowClear
              >
                {FORUM_TIERS.map((ft) => (
                  <Option key={ft} value={ft}>{ft}</Option>
                ))}
              </Select>

              <Select
                placeholder="Discussion Theme"
                value={themeFilter}
                onChange={setThemeFilter}
                style={{ width: 200 }}
                allowClear
              >
                {FORUM_THEMES.map((dt) => (
                  <Option key={dt} value={dt}>{dt}</Option>
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
                {[...new Set(forums.map((f) => extractName(f.zone)))].map((z) => (
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
                Export Forums CSV
              </Button>

              <Button
                icon={<ClearOutlined />}
                onClick={handleResetFilters}
                disabled={!(searchTerm || tierFilter || themeFilter || fiscalYearFilter || seasonFilter || zoneFilter)}
              >
                Reset Filters
              </Button>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => handleOpenModal(null)}
                style={{ backgroundColor: '#1a5f2c', borderColor: '#1a5f2c', fontWeight: 600 }}
              >
                Organize Forum
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Main Table */}
      <Table
        columns={columns}
        dataSource={filteredForums}
        rowKey="id"
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} partner forums`
        }}
        scroll={{ x: 1350 }}
        bordered
        size="middle"
      />

      {/* Registration / Edit Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <TeamOutlined style={{ color: '#1a5f2c', fontSize: 20 }} />
            <span style={{ color: '#1a5f2c', fontWeight: 'bold', fontFamily: "'Times New Roman', Times, serif", fontSize: 17 }}>
              {editingForum ? 'Edit Partner Forum Record' : 'Organize Partner Forum (የልማት አጋሮች መድረክ ምዝገባ)'}
            </span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText={editingForum ? 'Update Forum' : 'Save Forum Record'}
        okButtonProps={{ style: { backgroundColor: '#1a5f2c', borderColor: '#1a5f2c' }, loading: isSubmitting }}
        width={800}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Forum Metadata & Administrative Tier
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="forum_code"
                label="Forum Code"
                rules={[{ required: true, message: 'Code required' }]}
              >
                <Input placeholder="e.g. FRM-2019-EG-08" />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item
                name="forum_title"
                label="Forum Title / Meeting Agenda"
                rules={[{ required: true, message: 'Title required' }]}
              >
                <Input placeholder="e.g. Zonal Agricultural Sector Working Group Review" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="forum_tier"
                label="Forum Administrative Tier"
                rules={[{ required: true, message: 'Select tier' }]}
              >
                <Select>
                  {FORUM_TIERS.map((ft) => (
                    <Option key={ft} value={ft}>{ft}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="discussion_theme"
                label="Primary Discussion Theme"
                rules={[{ required: true, message: 'Select theme' }]}
              >
                <Select>
                  {FORUM_THEMES.map((dt) => (
                    <Option key={dt} value={dt}>{dt}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={14}>
              <Form.Item
                name="chairperson"
                label="Chairperson / Meeting Convener"
                rules={[{ required: true, message: 'Chairperson required' }]}
              >
                <Input placeholder="e.g. Dr. Belayneh Mekonnen (Zonal Head)" />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item
                name="forum_date"
                label="Forum Date"
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
            Participants by Cohort (ተሳታፊዎች በወኪል ምድብ)
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="male_delegates"
                label="Male Delegates (ወንድ)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="female_delegates"
                label="Female Delegates (ሴት)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="married_women_delegates"
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
                name="youth_delegates"
                label="Youth Representatives (ወጣቶች)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="investors_delegates"
                label="Private Sector Investors (ባለሃብቶች)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="action_minutes" label="Action Minutes, Key Resolutions & Agreements">
                <TextArea rows={3} placeholder="Summarize decisions made, assigned responsibilities, and next steps..." />
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

      {/* Comprehensive Forum Dossier Modal */}
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
                <TeamOutlined />
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
                  {selectedForum?.forum_title}
                </span>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                  Code: <span style={{ fontFamily: 'monospace' }}>{selectedForum?.forum_code}</span> | Date:{' '}
                  {selectedForum?.forum_date}
                </div>
              </div>
            </div>
            <div>
              <Tag
                color={selectedForum?.forum_status === 'Completed' ? 'success' : 'processing'}
                icon={selectedForum?.forum_status === 'Completed' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                style={{ fontSize: 12, padding: '2px 10px', borderRadius: 12 }}
              >
                {selectedForum?.forum_status || 'Completed'}
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
              handleOpenModal(selectedForum);
            }}
          >
            Edit Forum
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
        {selectedForum && (
          <div style={{ paddingTop: 8 }}>
            {/* Top Metric Strip */}
            <Row gutter={12} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f6ffed', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Total Delegates</span>}
                    value={
                      (Number(selectedForum.male_delegates) || 0) +
                      (Number(selectedForum.female_delegates) || 0) +
                      (Number(selectedForum.married_women_delegates) || 0) +
                      (Number(selectedForum.youth_delegates) || 0) +
                      (Number(selectedForum.investors_delegates) || 0)
                    }
                    suffix={<span style={{ fontSize: 12 }}>People</span>}
                    valueStyle={{ fontSize: 15, fontWeight: 'bold', color: '#1a5f2c' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f0f5ff', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Forum Tier</span>}
                    value={selectedForum.forum_tier?.split(' ')[0] || 'Tier'}
                    valueStyle={{ fontSize: 15, fontWeight: 'bold', color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f9f0ff', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Women Share</span>}
                    value={
                      (Number(selectedForum.male_delegates) || 0) +
                      (Number(selectedForum.female_delegates) || 0) +
                      (Number(selectedForum.married_women_delegates) || 0) +
                      (Number(selectedForum.youth_delegates) || 0) +
                      (Number(selectedForum.investors_delegates) || 0) > 0
                        ? (
                            (((Number(selectedForum.female_delegates) || 0) +
                              (Number(selectedForum.married_women_delegates) || 0)) /
                              ((Number(selectedForum.male_delegates) || 0) +
                                (Number(selectedForum.female_delegates) || 0) +
                                (Number(selectedForum.married_women_delegates) || 0) +
                                (Number(selectedForum.youth_delegates) || 0) +
                                (Number(selectedForum.investors_delegates) || 0))) *
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
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Forum Date</span>}
                    value={selectedForum.forum_date}
                    valueStyle={{ fontSize: 13, fontWeight: 'bold', color: '#fa8c16' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* TABPANES */}
            <Tabs defaultActiveKey="1" type="card">
              {/* TAB 1: Forum Profile */}
              <TabPane
                tab={
                  <span>
                    <TeamOutlined />
                    Delegate Demographics & Reach
                  </span>
                }
                key="1"
              >
                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }} style={{ marginBottom: 16 }}>
                  <Descriptions.Item label="Discussion Theme" span={2}>
                    <strong style={{ color: '#1a5f2c' }}>{selectedForum.discussion_theme}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Forum Tier">
                    <Tag color="purple">{selectedForum.forum_tier}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Chairperson">
                    {selectedForum.chairperson}
                  </Descriptions.Item>
                </Descriptions>

                <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: 16, background: '#fafafa' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1a5f2c', textTransform: 'uppercase', marginBottom: 12 }}>
                    Delegate Disaggregation (ተሳታፊዎች በወኪል ምድብ)
                  </div>
                  <Row gutter={[16, 16]}>
                    <Col span={8}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <ManOutlined style={{ color: '#1890ff', marginRight: 4 }} />
                          Male Delegates (ወንድ)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#1890ff', marginTop: 2 }}>
                          {Number(selectedForum.male_delegates || 0).toLocaleString()}
                        </div>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <WomanOutlined style={{ color: '#722ed1', marginRight: 4 }} />
                          Female Delegates (ሴት)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#722ed1', marginTop: 2 }}>
                          {Number(selectedForum.female_delegates || 0).toLocaleString()}
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
                          {Number(selectedForum.married_women_delegates || 0).toLocaleString()}
                        </div>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <ApartmentOutlined style={{ color: '#fa8c16', marginRight: 4 }} />
                          Youth Representatives (ወጣቶች)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#fa8c16', marginTop: 2 }}>
                          {Number(selectedForum.youth_delegates || 0).toLocaleString()}
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
                          {Number(selectedForum.investors_delegates || 0).toLocaleString()}
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
              </TabPane>

              {/* TAB 2: Action Minutes */}
              <TabPane
                tab={
                  <span>
                    <MessageOutlined />
                    Action Minutes & Resolutions
                  </span>
                }
                key="2"
              >
                <Card size="small" bordered={false} style={{ background: '#fcfdfd', border: '1px solid #e6f7ed', borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <CheckCircleOutlined style={{ color: '#1a5f2c', fontSize: 16 }} />
                    <strong style={{ color: '#1a5f2c', fontSize: 13, textTransform: 'uppercase' }}>
                      Key Resolutions & Agreements (የውይይት ድምዳሜዎች)
                    </strong>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: '#262626', lineHeight: '1.6' }}>
                    {selectedForum.action_minutes || 'Collaborative decisions made to enhance stakeholder alignment and resource distribution.'}
                  </p>
                </Card>
              </TabPane>

              {/* TAB 3: Location Location */}
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
                    <strong>{extractName(selectedForum.zone)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Woreda">
                    <strong>{extractName(selectedForum.woreda)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Kebele Operational Base">
                    <span style={{ color: '#1a5f2c', fontWeight: 'bold' }}>
                      {extractName(selectedForum.kebele)}
                    </span>
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
                  <Descriptions.Item label="Fiscal Year (በጀት ዓመት)">
                    <Tag color="blue" icon={<CalendarOutlined />}>
                      {selectedForum.fiscal_year || '2019 E.C.'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Production Campaign Season">
                    <strong>{selectedForum.season || 'Meher (መኸር)'}</strong>
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

export default function PlatformForums() {
  return (
    <App>
      <PlatformForumsContent />
    </App>
  );
}