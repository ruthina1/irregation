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
  UsergroupAddOutlined,
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

const TEAM_CATEGORIES = [
  'Watershed Rehabilitation Squad (የተፈጥሮ ሀብት ጥበቃ ስኩአድ)',
  'Pest Management Taskforce (የተባይ መከላከያ ግብረ-ኃይል)',
  'Mechanized Harvesting Squad (የእርሻ ስብሰባ ስኩአድ)',
  'Input Distribution Taskforce (የግብአት ስርጭት ግብረ-ኃይል)'
];

const TEAM_ACTIVITIES = [
  'Mass Terracing & Gully Rehabilitation',
  'Multi-Farm Knapsack Spraying Campaign',
  'Cooperative Combine Harvesting Support',
  'Fertilizer Unloading & Union Logistics',
  'Community Nursery Seedling Plantation'
];

const INITIAL_TEAMS = [
  {
    id: '1',
    team_code: 'WKT-2019-EG-01',
    team_name: 'Kurar Watershed Rapid Response Squad',
    team_category: 'Watershed Rehabilitation Squad (የተፈጥሮ ሀብት ጥበቃ ስኩአድ)',
    core_activity: 'Mass Terracing & Gully Rehabilitation',
    team_leader: 'Ato Mulugeta Fentaw',
    leader_phone: '+251 918 445 566',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    male_members: 12,
    female_members: 8,
    married_women_members: 6,
    youth_members: 5,
    investors_members: 1,
    team_status: 'Active & Deployed',
    team_notes: 'Constructed 14 kilometers of hillside terraces and 4 check-dams in upper catchment.',
    zone: 'East Gojjam',
    woreda: 'Dejen',
    kebele: 'Kurar'
  },
  {
    id: '2',
    team_code: 'WKT-2019-SG-04',
    team_name: 'Fogera Fall Armyworm Taskforce',
    team_category: 'Pest Management Taskforce (የተባይ መከላከያ ግብረ-ኃይል)',
    core_activity: 'Multi-Farm Knapsack Spraying Campaign',
    team_leader: 'Woizero Aster Melesse',
    leader_phone: '+251 922 112 334',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    male_members: 10,
    female_members: 5,
    married_women_members: 4,
    youth_members: 4,
    investors_members: 0,
    team_status: 'Active & Deployed',
    team_notes: 'Sprayed over 120 hectares of maize fields infested by Fall Armyworm larvae.',
    zone: 'South Gondar',
    woreda: 'Fogera',
    kebele: 'Woreta Zuria'
  },
  {
    id: '3',
    team_code: 'WKT-2019-WG-09',
    team_name: 'Bure Mechanized Harvest Squad',
    team_category: 'Mechanized Harvesting Squad (የእርሻ ስብሰባ ስኩአድ)',
    core_activity: 'Cooperative Combine Harvesting Support',
    team_leader: 'Ato Tadesse Worku',
    leader_phone: '+251 911 889 001',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    male_members: 8,
    female_members: 2,
    married_women_members: 2,
    youth_members: 5,
    investors_members: 2,
    team_status: 'Standby / Ready',
    team_notes: 'Coordinating combine harvester schedules for smallholder wheat clusters.',
    zone: 'West Gojjam',
    woreda: 'Bure',
    kebele: 'Alefa'
  }
];

function DevelopmentWorkTeamsContent() {
  const { message } = App.useApp();

  const [teams, setTeams] = useState(INITIAL_TEAMS);
  const [isFetching, setIsFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [activityFilter, setActivityFilter] = useState(null);
  const [fiscalYearFilter, setFiscalYearFilter] = useState(null);
  const [seasonFilter, setSeasonFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [zoneFilter, setZoneFilter] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
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
      if (editingTeam) {
        const initForm = async () => {
          const zoneMatch = zones.find(
            (z) => z.name === editingTeam.zone || z.id === editingTeam.zone_id
          );
          if (zoneMatch) {
            try {
              const wRes = locationApi?.getWoredas ? await locationApi.getWoredas(zoneMatch.id) : null;
              const wList = wRes?.data?.data?.data || wRes?.data?.data || [];
              setWoredas(wList);

              const woredaMatch = wList.find(
                (w) => w.name === editingTeam.woreda || w.id === editingTeam.woreda_id
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
            team_code: editingTeam.team_code,
            team_name: editingTeam.team_name,
            team_category: editingTeam.team_category,
            core_activity: editingTeam.core_activity,
            team_leader: editingTeam.team_leader,
            leader_phone: editingTeam.leader_phone,
            fiscal_year: editingTeam.fiscal_year || '2019 E.C.',
            season: editingTeam.season || 'Meher (መኸር)',
            male_members: Number(editingTeam.male_members) || 0,
            female_members: Number(editingTeam.female_members) || 0,
            married_women_members: Number(editingTeam.married_women_members) || 0,
            youth_members: Number(editingTeam.youth_members) || 0,
            investors_members: Number(editingTeam.investors_members) || 0,
            team_notes: editingTeam.team_notes,
            zone_id: editingTeam.zone_id || zoneMatch?.id || editingTeam.zone,
            woreda_id: editingTeam.woreda_id || editingTeam.woreda,
            kebele_id: editingTeam.kebele_id || editingTeam.kebele
          });
        };
        initForm();
      } else {
        form.resetFields();
        form.setFieldsValue({
          team_category: 'Watershed Rehabilitation Squad (የተፈጥሮ ሀብት ጥበቃ ስኩአድ)',
          core_activity: 'Mass Terracing & Gully Rehabilitation',
          fiscal_year: '2019 E.C.',
          season: 'Meher (መኸር)',
          male_members: 10,
          female_members: 5,
          married_women_members: 4,
          youth_members: 4,
          investors_members: 0
        });
        setWoredas([]);
        setKebeles([]);
      }
    }
  }, [isModalOpen, editingTeam, form, zones]);

  const loadData = async () => {
    setIsFetching(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      message.success('Development work teams registry refreshed');
    } catch {
      message.error('Failed to refresh data');
    } finally {
      setIsFetching(false);
    }
  };

  // Direct In-Place Status Update without Opening the Form
  const handleQuickStatusChange = (recordId, newStatus) => {
    setTeams((prev) =>
      prev.map((t) => (t.id === recordId ? { ...t, team_status: newStatus } : t))
    );
    message.success(`Team status updated to "${newStatus}"`);
  };

  // Filter pipeline
  const filteredTeams = useMemo(() => {
    return teams.filter((t) => {
      const code = extractName(t.team_code).toLowerCase();
      const name = extractName(t.team_name).toLowerCase();
      const leader = extractName(t.team_leader).toLowerCase();
      const kebele = extractName(t.kebele).toLowerCase();
      const woreda = extractName(t.woreda).toLowerCase();
      const zone = extractName(t.zone).toLowerCase();
      const q = searchTerm.toLowerCase();

      const matchesSearch =
        code.includes(q) || name.includes(q) || leader.includes(q) || kebele.includes(q) || woreda.includes(q) || zone.includes(q);
      const matchesCategory = categoryFilter ? t.team_category === categoryFilter : true;
      const matchesActivity = activityFilter ? t.core_activity === activityFilter : true;
      const matchesFY = fiscalYearFilter ? t.fiscal_year === fiscalYearFilter : true;
      const matchesSeason = seasonFilter ? t.season === seasonFilter : true;
      const matchesStatus = statusFilter ? t.team_status === statusFilter : true;
      const matchesZone = zoneFilter ? zone === zoneFilter.toLowerCase() : true;

      return matchesSearch && matchesCategory && matchesActivity && matchesFY && matchesSeason && matchesStatus && matchesZone;
    });
  }, [teams, searchTerm, categoryFilter, activityFilter, fiscalYearFilter, seasonFilter, statusFilter, zoneFilter]);

  // Statistics Calculation
  const stats = useMemo(() => {
    const totalTeams = filteredTeams.length;
    const maleMembers = filteredTeams.reduce((acc, t) => acc + (Number(t.male_members) || 0), 0);
    const femaleMembers = filteredTeams.reduce((acc, t) => acc + (Number(t.female_members) || 0), 0);
    const marriedWomen = filteredTeams.reduce((acc, t) => acc + (Number(t.married_women_members) || 0), 0);
    const youth = filteredTeams.reduce((acc, t) => acc + (Number(t.youth_members) || 0), 0);
    const investors = filteredTeams.reduce((acc, t) => acc + (Number(t.investors_members) || 0), 0);

    const totalMembers = maleMembers + femaleMembers + marriedWomen + youth + investors;
    const totalWomenMembers = femaleMembers + marriedWomen;
    const womenRatio = totalMembers > 0 ? ((totalWomenMembers / totalMembers) * 100).toFixed(1) : 0;
    const activeCount = filteredTeams.filter((t) => t.team_status === 'Active & Deployed').length;

    return {
      totalTeams,
      totalMembers,
      maleMembers,
      femaleMembers,
      marriedWomen,
      totalWomenMembers,
      youth,
      investors,
      womenRatio,
      activeCount
    };
  }, [filteredTeams]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setCategoryFilter(null);
    setActivityFilter(null);
    setFiscalYearFilter(null);
    setSeasonFilter(null);
    setStatusFilter(null);
    setZoneFilter(null);
  };

  const handleOpenModal = (record = null) => {
    setEditingTeam(record);
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
        zone: selectedZone?.name || selectedZone?.zone_name || values.zone_id,
        woreda: selectedWoreda?.name || selectedWoreda?.woreda_name || values.woreda_id,
        kebele: selectedKebele?.name || selectedKebele?.kebele_name || values.kebele_id
      };

      if (editingTeam) {
        setTeams((prev) =>
          prev.map((item) =>
            item.id === editingTeam.id ? { ...item, ...payload, team_status: editingTeam.team_status } : item
          )
        );
        message.success('Development work team record updated successfully');
      } else {
        const newRecord = {
          ...payload,
          id: Date.now().toString(),
          team_code: values.team_code || `WKT-${Date.now().toString().slice(-4)}`,
          team_status: 'Active & Deployed'
        };
        setTeams((prev) => [newRecord, ...prev]);
        message.success('New development work team registered successfully');
      }
      setIsModalOpen(false);
    } catch (error) {
      message.error(error?.response?.data?.message || error.message || 'Failed to save work team record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    setTeams((prev) => prev.filter((item) => item.id !== id));
    message.success('Development work team record removed');
  };

  const exportToCSV = () => {
    if (!filteredTeams.length) {
      message.warning('No team records available to export');
      return;
    }
    const headers = [
      'Team Code,Team Name,Category,Core Activity,Leader,Phone,FY,Season,Zone,Woreda,Kebele,Male (ወንድ),Female (ሴት),Married Women (ባለትዳር),Youth (ወጣቶች),Investors (ባለሃብቶች),Total Members,Status'
    ];
    const rows = filteredTeams.map((t) => {
      const total =
        (Number(t.male_members) || 0) +
        (Number(t.female_members) || 0) +
        (Number(t.married_women_members) || 0) +
        (Number(t.youth_members) || 0) +
        (Number(t.investors_members) || 0);

      return [
        `"${t.team_code || ''}"`,
        `"${t.team_name || ''}"`,
        `"${t.team_category || ''}"`,
        `"${t.core_activity || ''}"`,
        `"${t.team_leader || ''}"`,
        `"${t.leader_phone || ''}"`,
        `"${t.fiscal_year || ''}"`,
        `"${t.season || ''}"`,
        `"${extractName(t.zone)}"`,
        `"${extractName(t.woreda)}"`,
        `"${extractName(t.kebele)}"`,
        t.male_members || 0,
        t.female_members || 0,
        t.married_women_members || 0,
        t.youth_members || 0,
        t.investors_members || 0,
        total,
        `"${t.team_status || ''}"`
      ].join(',');
    });

    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Development_Work_Teams_${Date.now()}.csv`;
    a.click();
    message.success('Development work teams report exported successfully');
  };

  const columns = [
    {
      title: 'Team Code & Name',
      key: 'team_info',
      width: 250,
      render: (_, r) => (
        <div>
          <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{r.team_name}</strong>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>
            Code: <span style={{ fontFamily: 'monospace' }}>{r.team_code}</span> | Leader: {r.team_leader}
          </div>
        </div>
      )
    },
    {
      title: 'Team Category',
      dataIndex: 'team_category',
      key: 'team_category',
      width: 210,
      render: (cat) => {
        let color = 'default';
        if (cat?.includes('Watershed')) color = 'green';
        if (cat?.includes('Pest')) color = 'red';
        if (cat?.includes('Mechanized')) color = 'blue';
        if (cat?.includes('Input')) color = 'gold';
        return <Tag color={color}>{cat}</Tag>;
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
      title: 'Members Enrolled',
      key: 'members_breakdown',
      width: 230,
      render: (_, r) => {
        const total =
          (Number(r.male_members) || 0) +
          (Number(r.female_members) || 0) +
          (Number(r.married_women_members) || 0) +
          (Number(r.youth_members) || 0) +
          (Number(r.investors_members) || 0);

        return (
          <div style={{ fontSize: 11 }}>
            <div>
              Total: <strong style={{ color: '#1a5f2c' }}>{total.toLocaleString()} Members</strong>
            </div>
            <div style={{ color: '#8c8c8c' }}>
              <span>ወንድ: {r.male_members || 0}</span> | <span>ሴት: {r.female_members || 0}</span> | <span>ባለትዳር: {r.married_women_members || 0}</span>
            </div>
          </div>
        );
      }
    },
    {
      title: 'Team Status (In-Place Edit)',
      dataIndex: 'team_status',
      key: 'team_status',
      width: 190,
      render: (status, record) => (
        <Select
          value={status || 'Active & Deployed'}
          onChange={(newVal) => handleQuickStatusChange(record.id, newVal)}
          style={{ width: '100%' }}
          size="small"
        >
          <Option value="Active & Deployed">
            <Tag color="success" icon={<CheckCircleOutlined />} style={{ margin: 0 }}>
              Deployed
            </Tag>
          </Option>
          <Option value="Standby / Ready">
            <Tag color="processing" icon={<ClockCircleOutlined />} style={{ margin: 0 }}>
              Standby
            </Tag>
          </Option>
          <Option value="Deactivated">
            <Tag color="default" icon={<ClockCircleOutlined />} style={{ margin: 0 }}>
              Deactivated
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
          <Tooltip title="View Team Dossier">
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: '#1890ff' }} />}
              onClick={() => {
                setSelectedTeam(record);
                setIsDossierOpen(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Edit Team">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: '#52c41a' }} />}
              onClick={() => handleOpenModal(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Record">
            <Popconfirm
              title="Delete work team record?"
              description="Are you sure you want to remove this development work team?"
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
        <Breadcrumb.Item>Development Work Teams & Squads</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#1a5f2c', fontFamily: "'Times New Roman', Times, serif" }}>
            Development Work Teams & Squads (የልማት ስራ ቡድኖችና ስኩአዶች)
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Coordinating specialized community work squads for watershed mobilization, mass pest control, and seasonal harvesting campaigns
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
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Total Enrolled Members</span>}
              value={stats.totalMembers}
              prefix={<UsergroupAddOutlined style={{ color: '#1a5f2c', marginRight: 8 }} />}
              valueStyle={{ color: '#1a5f2c', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Total Teams: <strong style={{ color: '#262626' }}>{stats.totalTeams} teams</strong>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #1890ff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Male Members (ወንድ)</span>}
              value={stats.maleMembers}
              prefix={<ManOutlined style={{ color: '#1890ff', marginRight: 8 }} />}
              valueStyle={{ color: '#1890ff', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Male participants in work squads
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #722ed1', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Women Members (ሴት + ባለትዳር)</span>}
              value={stats.totalWomenMembers}
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
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Active & Deployed</span>}
              value={stats.activeCount}
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
                placeholder="Search Name, Code, or Leader..."
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: 220 }}
                allowClear
              />

              <Select
                placeholder="Team Category"
                value={categoryFilter}
                onChange={setCategoryFilter}
                style={{ width: 195 }}
                allowClear
              >
                {TEAM_CATEGORIES.map((tc) => (
                  <Option key={tc} value={tc}>{tc}</Option>
                ))}
              </Select>

              <Select
                placeholder="Core Activity"
                value={activityFilter}
                onChange={setActivityFilter}
                style={{ width: 200 }}
                allowClear
              >
                {TEAM_ACTIVITIES.map((ta) => (
                  <Option key={ta} value={ta}>{ta}</Option>
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
                {[...new Set(teams.map((t) => extractName(t.zone)))].map((z) => (
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
                Export Teams CSV
              </Button>

              <Button
                icon={<ClearOutlined />}
                onClick={handleResetFilters}
                disabled={!(searchTerm || categoryFilter || activityFilter || fiscalYearFilter || seasonFilter || statusFilter || zoneFilter)}
              >
                Reset Filters
              </Button>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => handleOpenModal(null)}
                style={{ backgroundColor: '#1a5f2c', borderColor: '#1a5f2c', fontWeight: 600 }}
              >
                Register Work Team
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Main Table */}
      <Table
        columns={columns}
        dataSource={filteredTeams}
        rowKey="id"
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} development work teams`
        }}
        scroll={{ x: 1350 }}
        bordered
        size="middle"
      />

      {/* Registration / Edit Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SolutionOutlined style={{ color: '#1a5f2c', fontSize: 20 }} />
            <span style={{ color: '#1a5f2c', fontWeight: 'bold', fontFamily: "'Times New Roman', Times, serif", fontSize: 17 }}>
              {editingTeam ? 'Edit Development Work Team Record' : 'Register Development Work Team (የልማት ስራ ቡድን ምዝገባ)'}
            </span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText={editingTeam ? 'Update Team' : 'Save Team Record'}
        okButtonProps={{ style: { backgroundColor: '#1a5f2c', borderColor: '#1a5f2c' }, loading: isSubmitting }}
        width={800}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Team Identification & Category
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="team_code"
                label="Team Code"
                rules={[{ required: true, message: 'Code required' }]}
              >
                <Input placeholder="e.g. WKT-2019-EG-08" />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item
                name="team_name"
                label="Development Work Team Name"
                rules={[{ required: true, message: 'Team name required' }]}
              >
                <Input placeholder="e.g. Kurar Watershed Rapid Response Squad" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="team_category"
                label="Team Category"
                rules={[{ required: true, message: 'Select category' }]}
              >
                <Select>
                  {TEAM_CATEGORIES.map((tc) => (
                    <Option key={tc} value={tc}>{tc}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="core_activity"
                label="Core Campaign Activity"
                rules={[{ required: true, message: 'Select activity' }]}
              >
                <Select>
                  {TEAM_ACTIVITIES.map((ta) => (
                    <Option key={ta} value={ta}>{ta}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={14}>
              <Form.Item
                name="team_leader"
                label="Team Leader / Chair Name"
                rules={[{ required: true, message: 'Leader required' }]}
              >
                <Input placeholder="e.g. Ato Mulugeta Fentaw" />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item
                name="leader_phone"
                label="Leader Phone Number"
                rules={[{ required: true, message: 'Phone required' }]}
              >
                <Input placeholder="+251 9..." />
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
            Enrolled Members by Cohort (አባላት በወኪል ምድብ)
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="male_members"
                label="Male Members (ወንድ)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="female_members"
                label="Female Members (ሴት)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="married_women_members"
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
                name="youth_members"
                label="Youth Members (ወጣቶች)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="investors_members"
                label="Private Investors (ባለሃብቶች)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="team_notes" label="Team Campaign Notes & Accomplishments">
                <TextArea rows={3} placeholder="Summarize campaign milestones, area covered, or operational achievements..." />
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

      {/* Comprehensive Team Dossier Modal */}
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
                <SolutionOutlined />
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
                  {selectedTeam?.team_name}
                </span>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                  Code: <span style={{ fontFamily: 'monospace' }}>{selectedTeam?.team_code}</span> | Leader:{' '}
                  {selectedTeam?.team_leader}
                </div>
              </div>
            </div>
            <div>
              <Tag
                color={selectedTeam?.team_status === 'Active & Deployed' ? 'success' : 'processing'}
                icon={selectedTeam?.team_status === 'Active & Deployed' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                style={{ fontSize: 12, padding: '2px 10px', borderRadius: 12 }}
              >
                {selectedTeam?.team_status || 'Deployed'}
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
              handleOpenModal(selectedTeam);
            }}
          >
            Edit Team
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
        {selectedTeam && (
          <div style={{ paddingTop: 8 }}>
            {/* Top Metric Strip */}
            <Row gutter={12} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f6ffed', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Total Members</span>}
                    value={
                      (Number(selectedTeam.male_members) || 0) +
                      (Number(selectedTeam.female_members) || 0) +
                      (Number(selectedTeam.married_women_members) || 0) +
                      (Number(selectedTeam.youth_members) || 0) +
                      (Number(selectedTeam.investors_members) || 0)
                    }
                    suffix={<span style={{ fontSize: 12 }}>People</span>}
                    valueStyle={{ fontSize: 15, fontWeight: 'bold', color: '#1a5f2c' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f0f5ff', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Team Category</span>}
                    value={selectedTeam.team_category?.split(' ')[0] || 'Category'}
                    valueStyle={{ fontSize: 15, fontWeight: 'bold', color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f9f0ff', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Women Share</span>}
                    value={
                      (Number(selectedTeam.male_members) || 0) +
                      (Number(selectedTeam.female_members) || 0) +
                      (Number(selectedTeam.married_women_members) || 0) +
                      (Number(selectedTeam.youth_members) || 0) +
                      (Number(selectedTeam.investors_members) || 0) > 0
                        ? (
                            (((Number(selectedTeam.female_members) || 0) +
                              (Number(selectedTeam.married_women_members) || 0)) /
                              ((Number(selectedTeam.male_members) || 0) +
                                (Number(selectedTeam.female_members) || 0) +
                                (Number(selectedTeam.married_women_members) || 0) +
                                (Number(selectedTeam.youth_members) || 0) +
                                (Number(selectedTeam.investors_members) || 0))) *
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
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Fiscal Year</span>}
                    value={selectedTeam.fiscal_year}
                    valueStyle={{ fontSize: 13, fontWeight: 'bold', color: '#fa8c16' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* TABPANES */}
            <Tabs defaultActiveKey="1" type="card">
              {/* TAB 1: Team Profile */}
              <TabPane
                tab={
                  <span>
                    <TeamOutlined />
                    Member Demographics & Reach
                  </span>
                }
                key="1"
              >
                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }} style={{ marginBottom: 16 }}>
                  <Descriptions.Item label="Team Name" span={2}>
                    <strong style={{ color: '#1a5f2c' }}>{selectedTeam.team_name}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Team Category">
                    <Tag color="purple">{selectedTeam.team_category}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Core Activity">
                    <Tag color="green">{selectedTeam.core_activity}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Team Leader">
                    {selectedTeam.team_leader} ({selectedTeam.leader_phone})
                  </Descriptions.Item>
                </Descriptions>

                <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: 16, background: '#fafafa' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1a5f2c', textTransform: 'uppercase', marginBottom: 12 }}>
                    Member Disaggregation (አባላት በወኪል ምድብ)
                  </div>
                  <Row gutter={[16, 16]}>
                    <Col span={8}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <ManOutlined style={{ color: '#1890ff', marginRight: 4 }} />
                          Male Members (ወንድ)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#1890ff', marginTop: 2 }}>
                          {Number(selectedTeam.male_members || 0).toLocaleString()}
                        </div>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <WomanOutlined style={{ color: '#722ed1', marginRight: 4 }} />
                          Female Members (ሴት)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#722ed1', marginTop: 2 }}>
                          {Number(selectedTeam.female_members || 0).toLocaleString()}
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
                          {Number(selectedTeam.married_women_members || 0).toLocaleString()}
                        </div>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <RiseOutlined style={{ color: '#fa8c16', marginRight: 4 }} />
                          Youth Members (ወጣቶች)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#fa8c16', marginTop: 2 }}>
                          {Number(selectedTeam.youth_members || 0).toLocaleString()}
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
                          {Number(selectedTeam.investors_members || 0).toLocaleString()}
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
              </TabPane>

              {/* TAB 2: Campaign Notes */}
              <TabPane
                tab={
                  <span>
                    <CheckSquareOutlined />
                    Campaign Notes & Milestones
                  </span>
                }
                key="2"
              >
                <Card size="small" bordered={false} style={{ background: '#fcfdfd', border: '1px solid #e6f7ed', borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <CheckCircleOutlined style={{ color: '#1a5f2c', fontSize: 16 }} />
                    <strong style={{ color: '#1a5f2c', fontSize: 13, textTransform: 'uppercase' }}>
                      Campaign Accomplishments (የስራ ቡድኑ አፈፃፀም ማስታወሻ)
                    </strong>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: '#262626', lineHeight: '1.6' }}>
                    {selectedTeam.team_notes || 'Active work team deployed on agricultural campaign objectives.'}
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
                    <strong>{extractName(selectedTeam.zone)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Woreda">
                    <strong>{extractName(selectedTeam.woreda)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Kebele Operational Base">
                    <span style={{ color: '#1a5f2c', fontWeight: 'bold' }}>
                      {extractName(selectedTeam.kebele)}
                    </span>
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
                  <Descriptions.Item label="Fiscal Year (በጀት ዓመት)">
                    <Tag color="blue" icon={<CalendarOutlined />}>
                      {selectedTeam.fiscal_year || '2019 E.C.'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Production Campaign Season">
                    <strong>{selectedTeam.season || 'Meher (መኸር)'}</strong>
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

export default function DevelopmentWorkTeams() {
  return (
    <App>
      <DevelopmentWorkTeamsContent />
    </App>
  );
}