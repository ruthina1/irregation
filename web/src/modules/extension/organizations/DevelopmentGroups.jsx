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
  SafetyCertificateOutlined
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

const GROUP_CATEGORIES = [
  'Mixed Smallholder 1-to-5 Group (ቅልቅል አርሶ አደር 1 ለ 5 ቡድን)',
  'Women-Led Development Group (ሴቶች በባለቤትነት የተደራጁ ልማት ቡድን)',
  'Youth Agripreneur Group (ወጣቶች አግሮ-ኢንተርፕራይዝ ቡድን)',
  'Model Farmers Peer Group (የሞዴል አርሶ አደሮች አብሮነት ቡድን)',
  'Irrigation Water Users Group (የመስኖ ውሃ ተጠቃሚዎች ማህበር ቡድን)'
];

const GROUP_ACTIVITIES = [
  'Joint Seed Bed Preparation & Row Planting',
  'Collective Pest Scouting & Chemical Spraying',
  'Cooperative Input Pooling & Bulk Purchase',
  'Community Watershed Conservation & Terracing',
  'Rural Savings & Credit Mobilization (IYCS)'
];

const INITIAL_GROUPS = [
  {
    id: '1',
    group_code: 'GRP-2019-EG-01',
    group_name: 'Biruh Tesfa 1-to-5 Teff Producers Group',
    group_category: 'Mixed Smallholder 1-to-5 Group (ቅልቅል አርሶ አደር 1 ለ 5 ቡድን)',
    core_activity: 'Joint Seed Bed Preparation & Row Planting',
    group_leader: 'Ato Mulugeta Fentaw',
    leader_phone: '+251 918 445 566',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    male_members: 4,
    female_members: 2,
    married_women_members: 2,
    youth_members: 1,
    investors_members: 0,
    group_status: 'Active & Functioning',
    group_notes: 'Successfully completed synchronized row planting across 15 hectares of Quncho Teff.',
    zone: 'East Gojjam',
    woreda: 'Dejen',
    kebele: 'Kurar'
  },
  {
    id: '2',
    group_code: 'GRP-2019-SG-04',
    group_name: 'Enat Alem Women Vegetable Growers Group',
    group_category: 'Women-Led Development Group (ሴቶች በባለቤትነት የተደራጁ ልማት ቡድን)',
    core_activity: 'Cooperative Input Pooling & Bulk Purchase',
    group_leader: 'Woizero Aster Melesse',
    leader_phone: '+251 922 112 334',
    fiscal_year: '2019 E.C.',
    season: 'Bega / Irrigation (መስኖ/በጋ)',
    male_members: 1,
    female_members: 5,
    married_women_members: 4,
    youth_members: 2,
    investors_members: 0,
    group_status: 'Active & Functioning',
    group_notes: 'Engaged in solar pump irrigation and cooperative onion seedling production.',
    zone: 'South Gondar',
    woreda: 'Fogera',
    kebele: 'Woreta Zuria'
  },
  {
    id: '3',
    group_code: 'GRP-2019-WG-09',
    group_name: 'Tana Youth Agricultural Mechanization Unit',
    group_category: 'Youth Agripreneur Group (ወጣቶች አግሮ-ኢንተርፕራይዝ ቡድን)',
    core_activity: 'Collective Pest Scouting & Chemical Spraying',
    group_leader: 'Ato Tadesse Worku',
    leader_phone: '+251 911 889 001',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    male_members: 5,
    female_members: 1,
    married_women_members: 1,
    youth_members: 6,
    investors_members: 1,
    group_status: 'Review Due',
    group_notes: 'Operating motorized knapsack sprayers for hire across neighboring smallholder clusters.',
    zone: 'West Gojjam',
    woreda: 'Bure',
    kebele: 'Alefa'
  }
];

function DevelopmentGroupsContent() {
  const { message } = App.useApp();

  const [groups, setGroups] = useState(INITIAL_GROUPS);
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
  const [editingGroup, setEditingGroup] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
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
      if (editingGroup) {
        const initForm = async () => {
          const zoneMatch = zones.find(
            (z) => z.name === editingGroup.zone || z.id === editingGroup.zone_id
          );
          if (zoneMatch) {
            try {
              const wRes = locationApi?.getWoredas ? await locationApi.getWoredas(zoneMatch.id) : null;
              const wList = wRes?.data?.data?.data || wRes?.data?.data || [];
              setWoredas(wList);

              const woredaMatch = wList.find(
                (w) => w.name === editingGroup.woreda || w.id === editingGroup.woreda_id
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
            group_code: editingGroup.group_code,
            group_name: editingGroup.group_name,
            group_category: editingGroup.group_category,
            core_activity: editingGroup.core_activity,
            group_leader: editingGroup.group_leader,
            leader_phone: editingGroup.leader_phone,
            fiscal_year: editingGroup.fiscal_year || '2019 E.C.',
            season: editingGroup.season || 'Meher (መኸር)',
            male_members: Number(editingGroup.male_members) || 0,
            female_members: Number(editingGroup.female_members) || 0,
            married_women_members: Number(editingGroup.married_women_members) || 0,
            youth_members: Number(editingGroup.youth_members) || 0,
            investors_members: Number(editingGroup.investors_members) || 0,
            group_notes: editingGroup.group_notes,
            zone_id: editingGroup.zone_id || zoneMatch?.id || editingGroup.zone,
            woreda_id: editingGroup.woreda_id || editingGroup.woreda,
            kebele_id: editingGroup.kebele_id || editingGroup.kebele
          });
        };
        initForm();
      } else {
        form.resetFields();
        form.setFieldsValue({
          group_category: 'Mixed Smallholder 1-to-5 Group (ቅልቅል አርሶ አደር 1 ለ 5 ቡድን)',
          core_activity: 'Joint Seed Bed Preparation & Row Planting',
          fiscal_year: '2019 E.C.',
          season: 'Meher (መኸር)',
          male_members: 4,
          female_members: 2,
          married_women_members: 2,
          youth_members: 1,
          investors_members: 0
        });
        setWoredas([]);
        setKebeles([]);
      }
    }
  }, [isModalOpen, editingGroup, form, zones]);

  const loadData = async () => {
    setIsFetching(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      message.success('Agricultural development groups registry refreshed');
    } catch {
      message.error('Failed to refresh data');
    } finally {
      setIsFetching(false);
    }
  };

  // Direct In-Place Status Update without Opening the Form
  const handleQuickStatusChange = (recordId, newStatus) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === recordId ? { ...g, group_status: newStatus } : g))
    );
    message.success(`Group status updated to "${newStatus}"`);
  };

  // Filter pipeline
  const filteredGroups = useMemo(() => {
    return groups.filter((g) => {
      const code = extractName(g.group_code).toLowerCase();
      const name = extractName(g.group_name).toLowerCase();
      const leader = extractName(g.group_leader).toLowerCase();
      const kebele = extractName(g.kebele).toLowerCase();
      const woreda = extractName(g.woreda).toLowerCase();
      const zone = extractName(g.zone).toLowerCase();
      const q = searchTerm.toLowerCase();

      const matchesSearch =
        code.includes(q) || name.includes(q) || leader.includes(q) || kebele.includes(q) || woreda.includes(q) || zone.includes(q);
      const matchesCategory = categoryFilter ? g.group_category === categoryFilter : true;
      const matchesActivity = activityFilter ? g.core_activity === activityFilter : true;
      const matchesFY = fiscalYearFilter ? g.fiscal_year === fiscalYearFilter : true;
      const matchesSeason = seasonFilter ? g.season === seasonFilter : true;
      const matchesStatus = statusFilter ? g.group_status === statusFilter : true;
      const matchesZone = zoneFilter ? zone === zoneFilter.toLowerCase() : true;

      return matchesSearch && matchesCategory && matchesActivity && matchesFY && matchesSeason && matchesStatus && matchesZone;
    });
  }, [groups, searchTerm, categoryFilter, activityFilter, fiscalYearFilter, seasonFilter, statusFilter, zoneFilter]);

  // Statistics Calculation
  const stats = useMemo(() => {
    const totalGroups = filteredGroups.length;
    const maleMembers = filteredGroups.reduce((acc, g) => acc + (Number(g.male_members) || 0), 0);
    const femaleMembers = filteredGroups.reduce((acc, g) => acc + (Number(g.female_members) || 0), 0);
    const marriedWomen = filteredGroups.reduce((acc, g) => acc + (Number(g.married_women_members) || 0), 0);
    const youth = filteredGroups.reduce((acc, g) => acc + (Number(g.youth_members) || 0), 0);
    const investors = filteredGroups.reduce((acc, g) => acc + (Number(g.investors_members) || 0), 0);

    const totalMembers = maleMembers + femaleMembers + marriedWomen + youth + investors;
    const totalWomenMembers = femaleMembers + marriedWomen;
    const womenRatio = totalMembers > 0 ? ((totalWomenMembers / totalMembers) * 100).toFixed(1) : 0;
    const activeCount = filteredGroups.filter((g) => g.group_status === 'Active & Functioning').length;

    return {
      totalGroups,
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
  }, [filteredGroups]);

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
    setEditingGroup(record);
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

      if (editingGroup) {
        setGroups((prev) =>
          prev.map((item) =>
            item.id === editingGroup.id ? { ...item, ...payload, group_status: editingGroup.group_status } : item
          )
        );
        message.success('Agricultural development group updated successfully');
      } else {
        const newRecord = {
          ...payload,
          id: Date.now().toString(),
          group_code: values.group_code || `GRP-${Date.now().toString().slice(-4)}`,
          group_status: 'Active & Functioning'
        };
        setGroups((prev) => [newRecord, ...prev]);
        message.success('New agricultural development group registered successfully');
      }
      setIsModalOpen(false);
    } catch (error) {
      message.error(error?.response?.data?.message || error.message || 'Failed to save development group record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    setGroups((prev) => prev.filter((item) => item.id !== id));
    message.success('Development group record removed');
  };

  const exportToCSV = () => {
    if (!filteredGroups.length) {
      message.warning('No group records available to export');
      return;
    }
    const headers = [
      'Group Code,Group Name,Category,Core Activity,Leader,Phone,FY,Season,Zone,Woreda,Kebele,Male (ወንድ),Female (ሴት),Married Women (ባለትዳር),Youth (ወጣቶች),Investors (ባለሃብቶች),Total Members,Status'
    ];
    const rows = filteredGroups.map((g) => {
      const total =
        (Number(g.male_members) || 0) +
        (Number(g.female_members) || 0) +
        (Number(g.married_women_members) || 0) +
        (Number(g.youth_members) || 0) +
        (Number(g.investors_members) || 0);

      return [
        `"${g.group_code || ''}"`,
        `"${g.group_name || ''}"`,
        `"${g.group_category || ''}"`,
        `"${g.core_activity || ''}"`,
        `"${g.group_leader || ''}"`,
        `"${g.leader_phone || ''}"`,
        `"${g.fiscal_year || ''}"`,
        `"${g.season || ''}"`,
        `"${extractName(g.zone)}"`,
        `"${extractName(g.woreda)}"`,
        `"${extractName(g.kebele)}"`,
        g.male_members || 0,
        g.female_members || 0,
        g.married_women_members || 0,
        g.youth_members || 0,
        g.investors_members || 0,
        total,
        `"${g.group_status || ''}"`
      ].join(',');
    });

    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Agricultural_Development_Groups_${Date.now()}.csv`;
    a.click();
    message.success('Agricultural development groups report exported successfully');
  };

  const columns = [
    {
      title: 'Group Code & Name',
      key: 'group_info',
      width: 250,
      render: (_, r) => (
        <div>
          <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{r.group_name}</strong>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>
            Code: <span style={{ fontFamily: 'monospace' }}>{r.group_code}</span> | Leader: {r.group_leader}
          </div>
        </div>
      )
    },
    {
      title: 'Group Category',
      dataIndex: 'group_category',
      key: 'group_category',
      width: 210,
      render: (cat) => {
        let color = 'default';
        if (cat?.includes('Mixed')) color = 'green';
        if (cat?.includes('Women')) color = 'purple';
        if (cat?.includes('Youth')) color = 'blue';
        if (cat?.includes('Model')) color = 'gold';
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
      title: 'Group Status (In-Place Edit)',
      dataIndex: 'group_status',
      key: 'group_status',
      width: 190,
      render: (status, record) => (
        <Select
          value={status || 'Active & Functioning'}
          onChange={(newVal) => handleQuickStatusChange(record.id, newVal)}
          style={{ width: '100%' }}
          size="small"
        >
          <Option value="Active & Functioning">
            <Tag color="success" icon={<CheckCircleOutlined />} style={{ margin: 0 }}>
              Active
            </Tag>
          </Option>
          <Option value="Review Due">
            <Tag color="warning" icon={<ClockCircleOutlined />} style={{ margin: 0 }}>
              Review Due
            </Tag>
          </Option>
          <Option value="Inactive">
            <Tag color="default" icon={<ClockCircleOutlined />} style={{ margin: 0 }}>
              Inactive
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
          <Tooltip title="View Group Dossier">
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: '#1890ff' }} />}
              onClick={() => {
                setSelectedGroup(record);
                setIsDossierOpen(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Edit Group">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: '#52c41a' }} />}
              onClick={() => handleOpenModal(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Record">
            <Popconfirm
              title="Delete development group record?"
              description="Are you sure you want to remove this agricultural development group?"
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
        <Breadcrumb.Item>3. Extension Organizations</Breadcrumb.Item>
        <Breadcrumb.Item>Agricultural Development Groups</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#1a5f2c', fontFamily: "'Times New Roman', Times, serif" }}>
            Agricultural Development Groups (የግብርና ልማት ቡድኖች / 1 ለ 5 አደረጃጀት)
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Coordinating peer-to-peer farmer learning units, 1-to-5 cluster teams, and collective technology adoption groups
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
              Total Groups: <strong style={{ color: '#262626' }}>{stats.totalGroups} groups</strong>
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
              Male participants in 1-to-5 groups
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
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Active & Functioning</span>}
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
                placeholder="Group Category"
                value={categoryFilter}
                onChange={setCategoryFilter}
                style={{ width: 195 }}
                allowClear
              >
                {GROUP_CATEGORIES.map((gc) => (
                  <Option key={gc} value={gc}>{gc}</Option>
                ))}
              </Select>

              <Select
                placeholder="Core Activity"
                value={activityFilter}
                onChange={setActivityFilter}
                style={{ width: 200 }}
                allowClear
              >
                {GROUP_ACTIVITIES.map((ga) => (
                  <Option key={ga} value={ga}>{ga}</Option>
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
                {[...new Set(groups.map((g) => extractName(g.zone)))].map((z) => (
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
                Export Groups CSV
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
                Register Group
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Main Table */}
      <Table
        columns={columns}
        dataSource={filteredGroups}
        rowKey="id"
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} development groups`
        }}
        scroll={{ x: 1350 }}
        bordered
        size="middle"
      />

      {/* Registration / Edit Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <UsergroupAddOutlined style={{ color: '#1a5f2c', fontSize: 20 }} />
            <span style={{ color: '#1a5f2c', fontWeight: 'bold', fontFamily: "'Times New Roman', Times, serif", fontSize: 17 }}>
              {editingGroup ? 'Edit Development Group Record' : 'Register Agricultural Development Group (ልማት ቡድን ምዝገባ)'}
            </span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText={editingGroup ? 'Update Group' : 'Save Group Record'}
        okButtonProps={{ style: { backgroundColor: '#1a5f2c', borderColor: '#1a5f2c' }, loading: isSubmitting }}
        width={800}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Group Identification & Category
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="group_code"
                label="Group Code"
                rules={[{ required: true, message: 'Code required' }]}
              >
                <Input placeholder="e.g. GRP-2019-EG-08" />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item
                name="group_name"
                label="Development Group Name"
                rules={[{ required: true, message: 'Group name required' }]}
              >
                <Input placeholder="e.g. Biruh Tesfa 1-to-5 Teff Producers Group" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="group_category"
                label="Group Category"
                rules={[{ required: true, message: 'Select category' }]}
              >
                <Select>
                  {GROUP_CATEGORIES.map((gc) => (
                    <Option key={gc} value={gc}>{gc}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="core_activity"
                label="Core Cooperative Activity"
                rules={[{ required: true, message: 'Select activity' }]}
              >
                <Select>
                  {GROUP_ACTIVITIES.map((ga) => (
                    <Option key={ga} value={ga}>{ga}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={14}>
              <Form.Item
                name="group_leader"
                label="Group Leader / Chair Name"
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
              <Form.Item name="group_notes" label="Group Performance Notes & Achievements">
                <TextArea rows={3} placeholder="Summarize collective achievements, joint activities, or meeting frequency..." />
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

      {/* Comprehensive Group Dossier Modal */}
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
                <UsergroupAddOutlined />
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
                  {selectedGroup?.group_name}
                </span>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                  Code: <span style={{ fontFamily: 'monospace' }}>{selectedGroup?.group_code}</span> | Leader:{' '}
                  {selectedGroup?.group_leader}
                </div>
              </div>
            </div>
            <div>
              <Tag
                color={selectedGroup?.group_status === 'Active & Functioning' ? 'success' : 'warning'}
                icon={selectedGroup?.group_status === 'Active & Functioning' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                style={{ fontSize: 12, padding: '2px 10px', borderRadius: 12 }}
              >
                {selectedGroup?.group_status || 'Active'}
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
              handleOpenModal(selectedGroup);
            }}
          >
            Edit Group
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
        {selectedGroup && (
          <div style={{ paddingTop: 8 }}>
            {/* Top Metric Strip */}
            <Row gutter={12} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f6ffed', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Total Members</span>}
                    value={
                      (Number(selectedGroup.male_members) || 0) +
                      (Number(selectedGroup.female_members) || 0) +
                      (Number(selectedGroup.married_women_members) || 0) +
                      (Number(selectedGroup.youth_members) || 0) +
                      (Number(selectedGroup.investors_members) || 0)
                    }
                    suffix={<span style={{ fontSize: 12 }}>People</span>}
                    valueStyle={{ fontSize: 15, fontWeight: 'bold', color: '#1a5f2c' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f0f5ff', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Group Category</span>}
                    value={selectedGroup.group_category?.split(' ')[0] || 'Category'}
                    valueStyle={{ fontSize: 15, fontWeight: 'bold', color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f9f0ff', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Women Share</span>}
                    value={
                      (Number(selectedGroup.male_members) || 0) +
                      (Number(selectedGroup.female_members) || 0) +
                      (Number(selectedGroup.married_women_members) || 0) +
                      (Number(selectedGroup.youth_members) || 0) +
                      (Number(selectedGroup.investors_members) || 0) > 0
                        ? (
                            (((Number(selectedGroup.female_members) || 0) +
                              (Number(selectedGroup.married_women_members) || 0)) /
                              ((Number(selectedGroup.male_members) || 0) +
                                (Number(selectedGroup.female_members) || 0) +
                                (Number(selectedGroup.married_women_members) || 0) +
                                (Number(selectedGroup.youth_members) || 0) +
                                (Number(selectedGroup.investors_members) || 0))) *
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
                    value={selectedGroup.fiscal_year}
                    valueStyle={{ fontSize: 13, fontWeight: 'bold', color: '#fa8c16' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* TABPANES */}
            <Tabs defaultActiveKey="1" type="card">
              {/* TAB 1: Group Profile */}
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
                  <Descriptions.Item label="Group Name" span={2}>
                    <strong style={{ color: '#1a5f2c' }}>{selectedGroup.group_name}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Group Category">
                    <Tag color="purple">{selectedGroup.group_category}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Core Activity">
                    <Tag color="green">{selectedGroup.core_activity}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Group Leader">
                    {selectedGroup.group_leader} ({selectedGroup.leader_phone})
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
                          {Number(selectedGroup.male_members || 0).toLocaleString()}
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
                          {Number(selectedGroup.female_members || 0).toLocaleString()}
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
                          {Number(selectedGroup.married_women_members || 0).toLocaleString()}
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
                          {Number(selectedGroup.youth_members || 0).toLocaleString()}
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
                          {Number(selectedGroup.investors_members || 0).toLocaleString()}
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
              </TabPane>

              {/* TAB 2: Performance Notes */}
              <TabPane
                tab={
                  <span>
                    <CheckSquareOutlined />
                    Performance & Achievements
                  </span>
                }
                key="2"
              >
                <Card size="small" bordered={false} style={{ background: '#fcfdfd', border: '1px solid #e6f7ed', borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <CheckCircleOutlined style={{ color: '#1a5f2c', fontSize: 16 }} />
                    <strong style={{ color: '#1a5f2c', fontSize: 13, textTransform: 'uppercase' }}>
                      Group Performance & Accomplishments (የቡድኑ አፈፃፀም ማስታወሻ)
                    </strong>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: '#262626', lineHeight: '1.6' }}>
                    {selectedGroup.group_notes || 'Active development group meeting regularly and conducting joint agricultural practices.'}
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
                    <strong>{extractName(selectedGroup.zone)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Woreda">
                    <strong>{extractName(selectedGroup.woreda)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Kebele Operational Base">
                    <span style={{ color: '#1a5f2c', fontWeight: 'bold' }}>
                      {extractName(selectedGroup.kebele)}
                    </span>
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
                  <Descriptions.Item label="Fiscal Year (በጀት ዓመት)">
                    <Tag color="blue" icon={<CalendarOutlined />}>
                      {selectedGroup.fiscal_year || '2019 E.C.'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Production Campaign Season">
                    <strong>{selectedGroup.season || 'Meher (መኸር)'}</strong>
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

export default function DevelopmentGroups() {
  return (
    <App>
      <DevelopmentGroupsContent />
    </App>
  );
}