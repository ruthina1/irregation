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
  RiseOutlined,
  CommentOutlined
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

const PLATFORM_SCOPES = [
  'National Policy Dialogue (ብሔራዊ የፖሊሲ ውይይት)',
  'Regional Public-Private Roundtable (የክልል የመንግስትና የግል አጋርነት መድረክ)',
  'Sectoral Technical Advisory Group (የዘርፍ ቴክኒክ አማካሪ ቡድን)',
  'Cooperative Union Consultative Meet (የህብረት ስራ ማህበራት አማካሪ ጉባኤ)'
];

const CONSULTATION_THEMES = [
  'Agricultural Sector Reform & Proclamations (የግብርና ዘርፍ ማሻሻያ ህጎች)',
  'Input Financing & Credit Access (የግብአት ፋይናንስና ብድር አቅርቦት)',
  'Commercial Farming & Investment Security (ንግድ ግብርናና ኢንቨስትመንት ዋስትና)',
  'Climate Adaptation Policy Frameworks (የአየር ንብረት መላመድ ፖሊሲ)',
  'Export Quality Standards & Certification (የምርት ጥራትና ኤክስፖርት ደረጃ)'
];

const INITIAL_FORUMS = [
  {
    id: '1',
    forum_code: 'CSF-2019-NAT-01',
    forum_title: 'National Public-Private Dialogue on Fertilizer Import Financing & Forex',
    platform_scope: 'National Policy Dialogue (ብሔራዊ የፖሊሲ ውይይት)',
    consultation_theme: 'Input Financing & Credit Access (የግብአት ፋይናንስና ብድር አቅርቦት)',
    forum_date: '2026-07-10',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    convener: 'State Minister of Agriculture & Commercial Bank Executives',
    male_delegates: 55,
    female_delegates: 20,
    married_women_delegates: 14,
    youth_delegates: 10,
    investors_delegates: 25,
    forum_status: 'Completed',
    consensus_notes: 'Commercial banks agreed to establish dedicated revolving credit lines for primary cooperative unions importing blended fertilizers.',
    zone: 'East Gojjam',
    woreda: 'Dejen',
    kebele: 'Kurar'
  },
  {
    id: '2',
    forum_code: 'CSF-2019-REG-03',
    forum_title: 'Amhara Regional Consultative Roundtable on Agricultural Investment Security',
    platform_scope: 'Regional Public-Private Roundtable (የክልል የመንግስትና የግል አጋርነት መድረክ)',
    consultation_theme: 'Commercial Farming & Investment Security (ንግድ ግብርናና ኢንቨስትመንት ዋስትና)',
    forum_date: '2026-07-22',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    convener: 'Regional Bureau Head & Investor Association Chair',
    male_delegates: 48,
    female_delegates: 16,
    married_women_delegates: 11,
    youth_delegates: 12,
    investors_delegates: 30,
    forum_status: 'Completed',
    consensus_notes: 'Addressed lease agreement renewals and security protocols for mechanized commercial farms in lowland corridors.',
    zone: 'South Gondar',
    woreda: 'Fogera',
    kebele: 'Woreta Zuria'
  },
  {
    id: '3',
    forum_code: 'CSF-2019-SEC-08',
    forum_title: 'Technical Advisory Group on Seed System Proclamation Amendments',
    platform_scope: 'Sectoral Technical Advisory Group (የዘርፍ ቴክኒክ አማካሪ ቡድን)',
    consultation_theme: 'Agricultural Sector Reform & Proclamations (የግብርና ዘርፍ ማሻሻያ ህጎች)',
    forum_date: '2026-08-04',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    convener: 'Director General, Agricultural Authority',
    male_delegates: 35,
    female_delegates: 15,
    married_women_delegates: 10,
    youth_delegates: 6,
    investors_delegates: 8,
    forum_status: 'Scheduled',
    consensus_notes: 'Reviewing intellectual property rights and Plant Variety Protection (PVP) regulations for private seed multipliers.',
    zone: 'West Gojjam',
    woreda: 'Bure',
    kebele: 'Alefa'
  }
];

function ConsultativeForumsContent() {
  const { message } = App.useApp();

  const [forums, setForums] = useState(INITIAL_FORUMS);
  const [isFetching, setIsFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [scopeFilter, setScopeFilter] = useState(null);
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
            platform_scope: editingForum.platform_scope,
            consultation_theme: editingForum.consultation_theme,
            forum_date: editingForum.forum_date ? dayjs(editingForum.forum_date) : dayjs(),
            fiscal_year: editingForum.fiscal_year || '2019 E.C.',
            season: editingForum.season || 'Meher (መኸር)',
            convener: editingForum.convener,
            male_delegates: Number(editingForum.male_delegates) || 0,
            female_delegates: Number(editingForum.female_delegates) || 0,
            married_women_delegates: Number(editingForum.married_women_delegates) || 0,
            youth_delegates: Number(editingForum.youth_delegates) || 0,
            investors_delegates: Number(editingForum.investors_delegates) || 0,
            consensus_notes: editingForum.consensus_notes,
            zone_id: editingForum.zone_id || zoneMatch?.id || editingForum.zone,
            woreda_id: editingForum.woreda_id || editingForum.woreda,
            kebele_id: editingForum.kebele_id || editingForum.kebele
          });
        };
        initForm();
      } else {
        form.resetFields();
        form.setFieldsValue({
          platform_scope: 'National Policy Dialogue (ብሔራዊ የፖሊሲ ውይይት)',
          consultation_theme: 'Agricultural Sector Reform & Proclamations (የግብርና ዘርፍ ማሻሻያ ህጎች)',
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
      message.success('Consultative platforms registry refreshed');
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
    message.success(`Platform status updated to "${newStatus}"`);
  };

  // Filter pipeline
  const filteredForums = useMemo(() => {
    return forums.filter((f) => {
      const code = extractName(f.forum_code).toLowerCase();
      const title = extractName(f.forum_title).toLowerCase();
      const conv = extractName(f.convener).toLowerCase();
      const kebele = extractName(f.kebele).toLowerCase();
      const woreda = extractName(f.woreda).toLowerCase();
      const zone = extractName(f.zone).toLowerCase();
      const q = searchTerm.toLowerCase();

      const matchesSearch =
        code.includes(q) || title.includes(q) || conv.includes(q) || kebele.includes(q) || woreda.includes(q) || zone.includes(q);
      const matchesScope = scopeFilter ? f.platform_scope === scopeFilter : true;
      const matchesTheme = themeFilter ? f.consultation_theme === themeFilter : true;
      const matchesFY = fiscalYearFilter ? f.fiscal_year === fiscalYearFilter : true;
      const matchesSeason = seasonFilter ? f.season === seasonFilter : true;
      const matchesZone = zoneFilter ? zone === zoneFilter.toLowerCase() : true;

      return matchesSearch && matchesScope && matchesTheme && matchesFY && matchesSeason && matchesZone;
    });
  }, [forums, searchTerm, scopeFilter, themeFilter, fiscalYearFilter, seasonFilter, zoneFilter]);

  // Statistics Calculation
  const stats = useMemo(() => {
    const totalPlatforms = filteredForums.length;
    const maleDelegates = filteredForums.reduce((acc, f) => acc + (Number(f.male_delegates) || 0), 0);
    const femaleDelegates = filteredForums.reduce((acc, f) => acc + (Number(f.female_delegates) || 0), 0);
    const marriedWomen = filteredForums.reduce((acc, f) => acc + (Number(f.married_women_delegates) || 0), 0);
    const youth = filteredForums.reduce((acc, f) => acc + (Number(f.youth_delegates) || 0), 0);
    const investors = filteredForums.reduce((acc, f) => acc + (Number(f.investors_delegates) || 0), 0);

    const totalParticipants = maleDelegates + femaleDelegates + marriedWomen + youth + investors;
    const totalWomenParticipants = femaleDelegates + marriedWomen;
    const womenRatio = totalParticipants > 0 ? ((totalWomenParticipants / totalParticipants) * 100).toFixed(1) : 0;

    return {
      totalPlatforms,
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
    setScopeFilter(null);
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
        message.success('Consultative platform record updated successfully');
      } else {
        const newRecord = {
          ...payload,
          id: Date.now().toString(),
          forum_code: values.forum_code || `CSF-${Date.now().toString().slice(-4)}`,
          forum_status: 'Completed'
        };
        setForums((prev) => [newRecord, ...prev]);
        message.success('New consultative platform registered successfully');
      }
      setIsModalOpen(false);
    } catch (error) {
      message.error(error?.response?.data?.message || error.message || 'Failed to save consultative platform record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    setForums((prev) => prev.filter((item) => item.id !== id));
    message.success('Consultative platform record removed');
  };

  const exportToCSV = () => {
    if (!filteredForums.length) {
      message.warning('No platform records available to export');
      return;
    }
    const headers = [
      'Forum Code,Title,Platform Scope,Consultation Theme,Date,FY,Season,Zone,Woreda,Kebele,Convener,Male Delegates,Female Delegates,Married Women,Youth,Investors,Total Participants,Status'
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
        `"${f.platform_scope || ''}"`,
        `"${f.consultation_theme || ''}"`,
        `"${f.forum_date || ''}"`,
        `"${f.fiscal_year || ''}"`,
        `"${f.season || ''}"`,
        `"${extractName(f.zone)}"`,
        `"${extractName(f.woreda)}"`,
        `"${extractName(f.kebele)}"`,
        `"${f.convener || ''}"`,
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
    a.download = `Consultative_MultiStakeholder_Platforms_${Date.now()}.csv`;
    a.click();
    message.success('Consultative platforms report exported successfully');
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
            Code: <span style={{ fontFamily: 'monospace' }}>{r.forum_code}</span> | Convener: {r.convener}
          </div>
        </div>
      )
    },
    {
      title: 'Platform Scope',
      dataIndex: 'platform_scope',
      key: 'platform_scope',
      width: 210,
      render: (scope) => {
        let color = 'default';
        if (scope?.includes('National')) color = 'purple';
        if (scope?.includes('Regional')) color = 'geekblue';
        if (scope?.includes('Sectoral')) color = 'cyan';
        if (scope?.includes('Cooperative')) color = 'green';
        return <Tag color={color}>{scope}</Tag>;
      }
    },
    {
      title: 'Consultation Theme',
      dataIndex: 'consultation_theme',
      key: 'consultation_theme',
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
      title: 'Platform Status (In-Place Edit)',
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
          <Tooltip title="View Platform Dossier">
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: '#1890ff' }} />}
              onClick={() => {
                setSelectedForum(record);
                setIsDossierOpen(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Edit Platform">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: '#52c41a' }} />}
              onClick={() => handleOpenModal(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Record">
            <Popconfirm
              title="Delete consultative platform record?"
              description="Are you sure you want to remove this dialogue platform?"
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
        <Breadcrumb.Item>Consultative & Multi-Stakeholder Platforms</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#1a5f2c', fontFamily: "'Times New Roman', Times, serif" }}>
            Consultative & Multi-Stakeholder Platforms (አማካሪና ባለብዙ ባለድርሻ አካላት መድረኮች)
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            High-level public-private dialogues, agricultural policy harmonization roundtables, and cooperative sector advisory meets
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
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Total Platform Delegates</span>}
              value={stats.totalParticipants}
              prefix={<CommentOutlined  style={{ color: '#1a5f2c', marginRight: 8 }} />}
              valueStyle={{ color: '#1a5f2c', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Total Dialogues Held: <strong style={{ color: '#262626' }}>{stats.totalPlatforms} platforms</strong>
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
              Public & private sector leaders
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
                placeholder="Search Title, Code, or Convener..."
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: 220 }}
                allowClear
              />

              <Select
                placeholder="Platform Scope"
                value={scopeFilter}
                onChange={setScopeFilter}
                style={{ width: 195 }}
                allowClear
              >
                {PLATFORM_SCOPES.map((ps) => (
                  <Option key={ps} value={ps}>{ps}</Option>
                ))}
              </Select>

              <Select
                placeholder="Consultation Theme"
                value={themeFilter}
                onChange={setThemeFilter}
                style={{ width: 200 }}
                allowClear
              >
                {CONSULTATION_THEMES.map((ct) => (
                  <Option key={ct} value={ct}>{ct}</Option>
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
                Export Platforms CSV
              </Button>

              <Button
                icon={<ClearOutlined />}
                onClick={handleResetFilters}
                disabled={!(searchTerm || scopeFilter || themeFilter || fiscalYearFilter || seasonFilter || zoneFilter)}
              >
                Reset Filters
              </Button>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => handleOpenModal(null)}
                style={{ backgroundColor: '#1a5f2c', borderColor: '#1a5f2c', fontWeight: 600 }}
              >
                Organize Platform
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
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} consultative platforms`
        }}
        scroll={{ x: 1350 }}
        bordered
        size="middle"
      />

      {/* Registration / Edit Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CommentOutlined  style={{ color: '#1a5f2c', fontSize: 20 }} />
            <span style={{ color: '#1a5f2c', fontWeight: 'bold', fontFamily: "'Times New Roman', Times, serif", fontSize: 17 }}>
              {editingForum ? 'Edit Consultative Platform Record' : 'Organize Consultative Platform (አማካሪ መድረክ ምዝገባ)'}
            </span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText={editingForum ? 'Update Platform' : 'Save Platform Record'}
        okButtonProps={{ style: { backgroundColor: '#1a5f2c', borderColor: '#1a5f2c' }, loading: isSubmitting }}
        width={800}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Platform Metadata & Scope Tier
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="forum_code"
                label="Platform Code"
                rules={[{ required: true, message: 'Code required' }]}
              >
                <Input placeholder="e.g. CSF-2019-NAT-08" />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item
                name="forum_title"
                label="Dialogue Title / Agenda"
                rules={[{ required: true, message: 'Title required' }]}
              >
                <Input placeholder="e.g. National Public-Private Dialogue on Fertilizer Import" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="platform_scope"
                label="Platform Scope"
                rules={[{ required: true, message: 'Select scope' }]}
              >
                <Select>
                  {PLATFORM_SCOPES.map((ps) => (
                    <Option key={ps} value={ps}>{ps}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="consultation_theme"
                label="Consultation Theme"
                rules={[{ required: true, message: 'Select theme' }]}
              >
                <Select>
                  {CONSULTATION_THEMES.map((ct) => (
                    <Option key={ct} value={ct}>{ct}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={14}>
              <Form.Item
                name="convener"
                label="Convener / Dialogue Chair"
                rules={[{ required: true, message: 'Convener required' }]}
              >
                <Input placeholder="e.g. State Minister of Agriculture" />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item
                name="forum_date"
                label="Dialogue Date"
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
                label="Youth Agripreneurs (ወጣቶች)"
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
              <Form.Item name="consensus_notes" label="Consensus Notes, Policy Agreements & Recommendations">
                <TextArea rows={3} placeholder="Summarize key dialogue outcomes, policy alignments, and agreed action points..." />
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

      {/* Comprehensive Platform Dossier Modal */}
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
                <CommentOutlined  />
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
            Edit Platform
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
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Platform Scope</span>}
                    value={selectedForum.platform_scope?.split(' ')[0] || 'Scope'}
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
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Dialogue Date</span>}
                    value={selectedForum.forum_date}
                    valueStyle={{ fontSize: 13, fontWeight: 'bold', color: '#fa8c16' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* TABPANES */}
            <Tabs defaultActiveKey="1" type="card">
              {/* TAB 1: Platform Profile */}
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
                  <Descriptions.Item label="Consultation Theme" span={2}>
                    <strong style={{ color: '#1a5f2c' }}>{selectedForum.consultation_theme}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Platform Scope">
                    <Tag color="purple">{selectedForum.platform_scope}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Convener / Chair">
                    {selectedForum.convener}
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
                          <RiseOutlined style={{ color: '#fa8c16', marginRight: 4 }} />
                          Youth Agripreneurs (ወጣቶች)
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

              {/* TAB 2: Consensus Notes */}
              <TabPane
                tab={
                  <span>
                    <MessageOutlined />
                    Consensus & Agreements
                  </span>
                }
                key="2"
              >
                <Card size="small" bordered={false} style={{ background: '#fcfdfd', border: '1px solid #e6f7ed', borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <CheckCircleOutlined style={{ color: '#1a5f2c', fontSize: 16 }} />
                    <strong style={{ color: '#1a5f2c', fontSize: 13, textTransform: 'uppercase' }}>
                      Key Policy Agreements & Recommendations (የውይይት ስምምነቶች)
                    </strong>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: '#262626', lineHeight: '1.6' }}>
                    {selectedForum.consensus_notes || 'Constructive policy recommendations formulated between public and private sector stakeholders.'}
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

export default function ConsultativeForums() {
  return (
    <App>
      <ConsultativeForumsContent />
    </App>
  );
}