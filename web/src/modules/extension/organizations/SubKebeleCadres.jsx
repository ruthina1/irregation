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
  PushpinOutlined,
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

const CADRE_ROLES = [
  'Sub-Kebele Got Coordinator (የጎጥ ተጠሪ)',
  '1-to-5 Network Leader (የ1 ለ 5 አደረጃጀት መሪ)',
  'Model Farmers Association Head (የሞዴል አርሶ አደሮች ማህበር ሰብሳቢ)',
  'Youth Agro-Entrepreneur Lead (የወጣት አግሮ-ኢንተርፕራይዝ መሪ)'
];

const EXTENSION_DOMAINS = [
  'Input Collection & Distribution (የግብአት ስርጭት ማስተባበሪያ)',
  'Watershed & Soil Conservation Mobilization (የተፈጥሮ ሀብት ጥበቃ)',
  'Crop Protection & Pest Scouting (የተባይ ቅኝትና ክትትል)',
  'Harvesting & Post-Harvest Handling (የእርሻ ስብሰባና ማከማቻ)',
  'Livestock Vaccination & Feed Mobilization (የእንስሳት መኖና ጤና)'
];

const INITIAL_CADRES = [
  {
    id: '1',
    cadre_code: 'CAD-2019-EG-01',
    full_name: 'Ato Mulugeta Fentaw Belete',
    gender: 'Male',
    age: 41,
    phone_number: '+251 918 445 566',
    cadre_role: 'Sub-Kebele Got Coordinator (የጎጥ ተጠሪ)',
    extension_domain: 'Input Collection & Distribution (የግብአት ስርጭት ማስተባበሪያ)',
    assigned_got: 'Kurar Got 1 (Lower Valley)',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    active_followers_managed: 25,
    training_status: 'Certified Cadre',
    cadre_performance: 'Optimal',
    zone: 'East Gojjam',
    woreda: 'Dejen',
    kebele: 'Kurar'
  },
  {
    id: '2',
    cadre_code: 'CAD-2019-SG-04',
    full_name: 'Woizero Aster Melesse Kebede',
    gender: 'Female',
    age: 36,
    phone_number: '+251 922 112 334',
    cadre_role: '1-to-5 Network Leader (የ1 ለ 5 አደረጃጀት መሪ)',
    extension_domain: 'Watershed & Soil Conservation Mobilization (የተፈጥሮ ሀብት ጥበቃ)',
    assigned_got: 'Woreta Zuria Got 3',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    active_followers_managed: 30,
    training_status: 'Certified Cadre',
    cadre_performance: 'Optimal',
    zone: 'South Gondar',
    woreda: 'Fogera',
    kebele: 'Woreta Zuria'
  },
  {
    id: '3',
    cadre_code: 'CAD-2019-WG-09',
    full_name: 'Ato Tadesse Worku Alemu',
    gender: 'Male',
    age: 29,
    phone_number: '+251 911 889 001',
    cadre_role: 'Youth Agro-Entrepreneur Lead (የወጣት አግሮ-ኢንተርፕራይዝ መሪ)',
    extension_domain: 'Crop Protection & Pest Scouting (የተባይ ቅኝትና ክትትል)',
    assigned_got: 'Alefa Got 2',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    active_followers_managed: 20,
    training_status: 'Refresher Training Due',
    cadre_performance: 'Needs Coaching',
    zone: 'West Gojjam',
    woreda: 'Bure',
    kebele: 'Alefa'
  }
];

function SubKebeleCadresContent() {
  const { message } = App.useApp();

  const [cadres, setCadres] = useState(INITIAL_CADRES);
  const [isFetching, setIsFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState(null);
  const [domainFilter, setDomainFilter] = useState(null);
  const [fiscalYearFilter, setFiscalYearFilter] = useState(null);
  const [seasonFilter, setSeasonFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [zoneFilter, setZoneFilter] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCadre, setEditingCadre] = useState(null);
  const [selectedCadre, setSelectedCadre] = useState(null);
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
      if (editingCadre) {
        const initForm = async () => {
          const zoneMatch = zones.find(
            (z) => z.name === editingCadre.zone || z.id === editingCadre.zone_id
          );
          if (zoneMatch) {
            try {
              const wRes = locationApi?.getWoredas ? await locationApi.getWoredas(zoneMatch.id) : null;
              const wList = wRes?.data?.data?.data || wRes?.data?.data || [];
              setWoredas(wList);

              const woredaMatch = wList.find(
                (w) => w.name === editingCadre.woreda || w.id === editingCadre.woreda_id
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
            cadre_code: editingCadre.cadre_code,
            full_name: editingCadre.full_name,
            gender: editingCadre.gender || 'Male',
            age: Number(editingCadre.age) || 35,
            phone_number: editingCadre.phone_number,
            cadre_role: editingCadre.cadre_role,
            extension_domain: editingCadre.extension_domain,
            assigned_got: editingCadre.assigned_got,
            fiscal_year: editingCadre.fiscal_year || '2019 E.C.',
            season: editingCadre.season || 'Meher (መኸር)',
            active_followers_managed: Number(editingCadre.active_followers_managed) || 20,
            training_status: editingCadre.training_status || 'Certified Cadre',
            zone_id: editingCadre.zone_id || zoneMatch?.id || editingCadre.zone,
            woreda_id: editingCadre.woreda_id || editingCadre.woreda,
            kebele_id: editingCadre.kebele_id || editingCadre.kebele
          });
        };
        initForm();
      } else {
        form.resetFields();
        form.setFieldsValue({
          gender: 'Male',
          age: 35,
          cadre_role: 'Sub-Kebele Got Coordinator (የጎጥ ተጠሪ)',
          extension_domain: 'Input Collection & Distribution (የግብአት ስርጭት ማስተባበሪያ)',
          fiscal_year: '2019 E.C.',
          season: 'Meher (መኸር)',
          active_followers_managed: 20,
          training_status: 'Certified Cadre'
        });
        setWoredas([]);
        setKebeles([]);
      }
    }
  }, [isModalOpen, editingCadre, form, zones]);

  const loadData = async () => {
    setIsFetching(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      message.success('Sub-kebele cadres registry refreshed');
    } catch {
      message.error('Failed to refresh data');
    } finally {
      setIsFetching(false);
    }
  };

  // Direct In-Place Status Update without Opening the Form
  const handleQuickStatusChange = (recordId, newStatus) => {
    setCadres((prev) =>
      prev.map((c) => (c.id === recordId ? { ...c, cadre_performance: newStatus } : c))
    );
    message.success(`Cadre performance updated to "${newStatus}"`);
  };

  // Filter pipeline
  const filteredCadres = useMemo(() => {
    return cadres.filter((c) => {
      const code = extractName(c.cadre_code).toLowerCase();
      const name = extractName(c.full_name).toLowerCase();
      const got = extractName(c.assigned_got).toLowerCase();
      const kebele = extractName(c.kebele).toLowerCase();
      const woreda = extractName(c.woreda).toLowerCase();
      const zone = extractName(c.zone).toLowerCase();
      const q = searchTerm.toLowerCase();

      const matchesSearch =
        code.includes(q) || name.includes(q) || got.includes(q) || kebele.includes(q) || woreda.includes(q) || zone.includes(q);
      const matchesRole = roleFilter ? c.cadre_role === roleFilter : true;
      const matchesDomain = domainFilter ? c.extension_domain === domainFilter : true;
      const matchesFY = fiscalYearFilter ? c.fiscal_year === fiscalYearFilter : true;
      const matchesSeason = seasonFilter ? c.season === seasonFilter : true;
      const matchesStatus = statusFilter ? c.cadre_performance === statusFilter : true;
      const matchesZone = zoneFilter ? zone === zoneFilter.toLowerCase() : true;

      return matchesSearch && matchesRole && matchesDomain && matchesFY && matchesSeason && matchesStatus && matchesZone;
    });
  }, [cadres, searchTerm, roleFilter, domainFilter, fiscalYearFilter, seasonFilter, statusFilter, zoneFilter]);

  // Statistics Calculation
  const stats = useMemo(() => {
    const totalCadres = filteredCadres.length;
    const maleCadres = filteredCadres.filter((c) => c.gender === 'Male').length;
    const femaleCadres = filteredCadres.filter((c) => c.gender === 'Female').length;
    const totalFollowers = filteredCadres.reduce((acc, c) => acc + (Number(c.active_followers_managed) || 0), 0);
    const femaleRatio = totalCadres > 0 ? ((femaleCadres / totalCadres) * 100).toFixed(1) : 0;
    const optimalCount = filteredCadres.filter((c) => c.cadre_performance === 'Optimal').length;

    return {
      totalCadres,
      maleCadres,
      femaleCadres,
      totalFollowers,
      femaleRatio,
      optimalCount
    };
  }, [filteredCadres]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setRoleFilter(null);
    setDomainFilter(null);
    setFiscalYearFilter(null);
    setSeasonFilter(null);
    setStatusFilter(null);
    setZoneFilter(null);
  };

  const handleOpenModal = (record = null) => {
    setEditingCadre(record);
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

      if (editingCadre) {
        setCadres((prev) =>
          prev.map((item) =>
            item.id === editingCadre.id ? { ...item, ...payload, cadre_performance: editingCadre.cadre_performance } : item
          )
        );
        message.success('Sub-kebele cadre record updated successfully');
      } else {
        const newRecord = {
          ...payload,
          id: Date.now().toString(),
          cadre_code: values.cadre_code || `CAD-${Date.now().toString().slice(-4)}`,
          cadre_performance: 'Optimal'
        };
        setCadres((prev) => [newRecord, ...prev]);
        message.success('New sub-kebele agricultural cadre registered successfully');
      }
      setIsModalOpen(false);
    } catch (error) {
      message.error(error?.response?.data?.message || error.message || 'Failed to save cadre record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    setCadres((prev) => prev.filter((item) => item.id !== id));
    message.success('Sub-kebele cadre record removed');
  };

  const exportToCSV = () => {
    if (!filteredCadres.length) {
      message.warning('No cadre records available to export');
      return;
    }
    const headers = [
      'Cadre Code,Full Name,Gender,Age,Phone,Cadre Role,Extension Domain,Assigned Got,FY,Season,Zone,Woreda,Kebele,Followers Managed,Training Status,Performance'
    ];
    const rows = filteredCadres.map((c) => [
      `"${c.cadre_code || ''}"`,
      `"${c.full_name || ''}"`,
      `"${c.gender || ''}"`,
      c.age || '',
      `"${c.phone_number || ''}"`,
      `"${c.cadre_role || ''}"`,
      `"${c.extension_domain || ''}"`,
      `"${c.assigned_got || ''}"`,
      `"${c.fiscal_year || ''}"`,
      `"${c.season || ''}"`,
      `"${extractName(c.zone)}"`,
      `"${extractName(c.woreda)}"`,
      `"${extractName(c.kebele)}"`,
      c.active_followers_managed || 0,
      `"${c.training_status || ''}"`,
      `"${c.cadre_performance || ''}"`
    ].join(','));

    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Sub_Kebele_Agricultural_Cadres_${Date.now()}.csv`;
    a.click();
    message.success('Sub-kebele cadres report exported successfully');
  };

  const columns = [
    {
      title: 'Cadre Code & Full Name',
      key: 'cadre_info',
      width: 250,
      render: (_, r) => (
        <div>
          <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{r.full_name}</strong>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>
            Code: <span style={{ fontFamily: 'monospace' }}>{r.cadre_code}</span> | {r.gender}, {r.age} yrs
          </div>
        </div>
      )
    },
    {
      title: 'Cadre Role / Tier',
      dataIndex: 'cadre_role',
      key: 'cadre_role',
      width: 210,
      render: (role) => {
        let color = 'default';
        if (role?.includes('Got')) color = 'green';
        if (role?.includes('1 for 5')) color = 'blue';
        if (role?.includes('Model')) color = 'gold';
        if (role?.includes('Youth')) color = 'purple';
        return <Tag color={color}>{role}</Tag>;
      }
    },
    {
      title: 'Assigned Got / Cluster',
      dataIndex: 'assigned_got',
      key: 'assigned_got',
      width: 190,
      render: (got) => <span style={{ fontWeight: 500, color: '#262626' }}>{got}</span>
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
      title: 'Followers Managed',
      dataIndex: 'active_followers_managed',
      key: 'active_followers_managed',
      align: 'right',
      width: 150,
      sorter: (a, b) => (Number(a.active_followers_managed) || 0) - (Number(b.active_followers_managed) || 0),
      render: (val) => (
        <Tag color="green" icon={<TeamOutlined />}>
          {val || 20} Farmers
        </Tag>
      )
    },
    {
      title: 'Performance (In-Place Edit)',
      dataIndex: 'cadre_performance',
      key: 'cadre_performance',
      width: 190,
      render: (status, record) => (
        <Select
          value={status || 'Optimal'}
          onChange={(newVal) => handleQuickStatusChange(record.id, newVal)}
          style={{ width: '100%' }}
          size="small"
        >
          <Option value="Optimal">
            <Tag color="success" icon={<CheckCircleOutlined />} style={{ margin: 0 }}>
              Optimal
            </Tag>
          </Option>
          <Option value="Needs Coaching">
            <Tag color="warning" icon={<ClockCircleOutlined />} style={{ margin: 0 }}>
              Needs Coaching
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
          <Tooltip title="View Cadre Dossier">
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: '#1890ff' }} />}
              onClick={() => {
                setSelectedCadre(record);
                setIsDossierOpen(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Edit Cadre">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: '#52c41a' }} />}
              onClick={() => handleOpenModal(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Record">
            <Popconfirm
              title="Delete cadre record?"
              description="Are you sure you want to remove this sub-kebele agricultural cadre?"
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
        <Breadcrumb.Item>Sub-Kebele Agricultural Cadres</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#1a5f2c', fontFamily: "'Times New Roman', Times, serif" }}>
            Sub-Kebele Agricultural Cadres (የቀጠና (ጎጥ) ተጠሪዎችና የልማት ቡድን መሪዎች)
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Grassroots change agents, Got-level coordinators, and 1-to-5 network leaders bridging Kebele DAs with smallholder households
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
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Total Cadres Mobilized</span>}
              value={stats.totalCadres}
              prefix={<PushpinOutlined style={{ color: '#1a5f2c', marginRight: 8 }} />}
              valueStyle={{ color: '#1a5f2c', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Optimal Performers: <strong style={{ color: '#262626' }}>{stats.optimalCount} cadres</strong>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #1890ff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Male Cadres (ወንድ)</span>}
              value={stats.maleCadres}
              prefix={<ManOutlined style={{ color: '#1890ff', marginRight: 8 }} />}
              valueStyle={{ color: '#1890ff', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Got coordinators and network leaders
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #722ed1', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Female Cadres (ሴት)</span>}
              value={stats.femaleCadres}
              prefix={<WomanOutlined style={{ color: '#722ed1', marginRight: 8 }} />}
              valueStyle={{ color: '#722ed1', fontWeight: 'bold', fontSize: 24 }}
            />
            <Progress percent={Number(stats.femaleRatio)} size="small" strokeColor="#722ed1" />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8c8c8c', marginTop: 2 }}>
              <span>Share: <strong style={{ color: '#722ed1' }}>{stats.femaleRatio}%</strong></span>
              <span>Regional Goal: &gt; 30%</span>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #fa8c16', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Total Followers Managed</span>}
              value={stats.totalFollowers}
              prefix={<TeamOutlined style={{ color: '#fa8c16', marginRight: 8 }} />}
              valueStyle={{ color: '#fa8c16', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Smallholder households under supervision
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
                placeholder="Search Name, Code, or Got..."
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: 220 }}
                allowClear
              />

              <Select
                placeholder="Cadre Role"
                value={roleFilter}
                onChange={setRoleFilter}
                style={{ width: 195 }}
                allowClear
              >
                {CADRE_ROLES.map((cr) => (
                  <Option key={cr} value={cr}>{cr}</Option>
                ))}
              </Select>

              <Select
                placeholder="Extension Domain"
                value={domainFilter}
                onChange={setDomainFilter}
                style={{ width: 200 }}
                allowClear
              >
                {EXTENSION_DOMAINS.map((ed) => (
                  <Option key={ed} value={ed}>{ed}</Option>
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
                {[...new Set(cadres.map((c) => extractName(c.zone)))].map((z) => (
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
                Export Cadres CSV
              </Button>

              <Button
                icon={<ClearOutlined />}
                onClick={handleResetFilters}
                disabled={!(searchTerm || roleFilter || domainFilter || fiscalYearFilter || seasonFilter || statusFilter || zoneFilter)}
              >
                Reset Filters
              </Button>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => handleOpenModal(null)}
                style={{ backgroundColor: '#1a5f2c', borderColor: '#1a5f2c', fontWeight: 600 }}
              >
                Register Cadre
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Main Table */}
      <Table
        columns={columns}
        dataSource={filteredCadres}
        rowKey="id"
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} sub-kebele cadres`
        }}
        scroll={{ x: 1350 }}
        bordered
        size="middle"
      />

      {/* Registration / Edit Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <PushpinOutlined style={{ color: '#1a5f2c', fontSize: 20 }} />
            <span style={{ color: '#1a5f2c', fontWeight: 'bold', fontFamily: "'Times New Roman', Times, serif", fontSize: 17 }}>
              {editingCadre ? 'Edit Sub-Kebele Cadre Record' : 'Register Sub-Kebele Agricultural Cadre (የጎጥ ተጠሪ ምዝገባ)'}
            </span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText={editingCadre ? 'Update Cadre' : 'Save Cadre Record'}
        okButtonProps={{ style: { backgroundColor: '#1a5f2c', borderColor: '#1a5f2c' }, loading: isSubmitting }}
        width={800}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Cadre Personal Identification & Role
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="cadre_code"
                label="Cadre Code"
                rules={[{ required: true, message: 'Code required' }]}
              >
                <Input placeholder="e.g. CAD-2019-EG-08" />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item
                name="full_name"
                label="Full Name (with Grandfather)"
                rules={[{ required: true, message: 'Full name required' }]}
              >
                <Input placeholder="e.g. Ato Mulugeta Fentaw Belete" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="gender" label="Gender (ጾታ)" rules={[{ required: true }]}>
                <Select>
                  <Option value="Male">Male (ወንድ)</Option>
                  <Option value="Female">Female (ሴት)</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="age" label="Age (Years)" rules={[{ required: true, message: 'Age required' }]}>
                <InputNumber min={18} max={90} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="phone_number" label="Mobile Phone" rules={[{ required: true }]}>
                <Input placeholder="+251 9..." />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="cadre_role"
                label="Cadre Role / Responsibility Tier"
                rules={[{ required: true, message: 'Select role' }]}
              >
                <Select>
                  {CADRE_ROLES.map((cr) => (
                    <Option key={cr} value={cr}>{cr}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="extension_domain"
                label="Primary Extension Support Domain"
                rules={[{ required: true, message: 'Select domain' }]}
              >
                <Select>
                  {EXTENSION_DOMAINS.map((ed) => (
                    <Option key={ed} value={ed}>{ed}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Timeline & Cluster Deployment
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
                name="active_followers_managed"
                label="Active Followers Managed"
                rules={[{ required: true }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="assigned_got"
                label="Assigned Got / Sub-Kebele Cluster"
                rules={[{ required: true, message: 'Got required' }]}
              >
                <Input placeholder="e.g. Kurar Got 1 (Lower Valley)" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="training_status" label="Cadre Training Status" rules={[{ required: true }]}>
                <Select>
                  <Option value="Certified Cadre">Certified Cadre (የሰለጠነ)</Option>
                  <Option value="Refresher Training Due">Refresher Training Due (ዕድሳት የሚያስፈልገው)</Option>
                  <Option value="Trainee">Trainee (ሰልጣኝ)</Option>
                </Select>
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

      {/* Comprehensive Cadre Dossier Modal */}
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
                <PushpinOutlined />
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
                  {selectedCadre?.full_name}
                </span>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                  Code: <span style={{ fontFamily: 'monospace' }}>{selectedCadre?.cadre_code}</span> | Role:{' '}
                  {selectedCadre?.cadre_role}
                </div>
              </div>
            </div>
            <div>
              <Tag
                color={selectedCadre?.cadre_performance === 'Optimal' ? 'success' : 'warning'}
                icon={selectedCadre?.cadre_performance === 'Optimal' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                style={{ fontSize: 12, padding: '2px 10px', borderRadius: 12 }}
              >
                {selectedCadre?.cadre_performance || 'Optimal'}
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
              handleOpenModal(selectedCadre);
            }}
          >
            Edit Cadre
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
        {selectedCadre && (
          <div style={{ paddingTop: 8 }}>
            {/* Top Metric Strip */}
            <Row gutter={12} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f6ffed', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Followers Managed</span>}
                    value={selectedCadre.active_followers_managed || 20}
                    suffix={<span style={{ fontSize: 12 }}>Farmers</span>}
                    valueStyle={{ fontSize: 15, fontWeight: 'bold', color: '#1a5f2c' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f0f5ff', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Cadre Gender</span>}
                    value={selectedCadre.gender}
                    valueStyle={{ fontSize: 15, fontWeight: 'bold', color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f9f0ff', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Training Status</span>}
                    value={selectedCadre.training_status?.includes('Certified') ? 'Certified' : 'Pending'}
                    valueStyle={{ fontSize: 15, fontWeight: 'bold', color: '#722ed1' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#fff7e6', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Cadre Age</span>}
                    value={selectedCadre.age || 35}
                    suffix="Yrs"
                    valueStyle={{ fontSize: 14, fontWeight: 'bold', color: '#fa8c16' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* TABPANES */}
            <Tabs defaultActiveKey="1" type="card">
              {/* TAB 1: Cadre Profile */}
              <TabPane
                tab={
                  <span>
                    <IdcardOutlined />
                    Cadre Profile & Scope
                  </span>
                }
                key="1"
              >
                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }} style={{ marginBottom: 16 }}>
                  <Descriptions.Item label="Full Name" span={2}>
                    <strong style={{ color: '#1a5f2c' }}>{selectedCadre.full_name}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Cadre Role">
                    <Tag color="purple">{selectedCadre.cadre_role}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Extension Support Domain">
                    <Tag color="green">{selectedCadre.extension_domain}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Assigned Got">
                    {selectedCadre.assigned_got}
                  </Descriptions.Item>
                  <Descriptions.Item label="Phone Contact">
                    <span style={{ fontFamily: 'monospace' }}>{selectedCadre.phone_number}</span>
                  </Descriptions.Item>
                </Descriptions>
              </TabPane>

              {/* TAB 2: Location */}
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
                    <strong>{extractName(selectedCadre.zone)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Woreda">
                    <strong>{extractName(selectedCadre.woreda)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Kebele Operational Base">
                    <span style={{ color: '#1a5f2c', fontWeight: 'bold' }}>
                      {extractName(selectedCadre.kebele)}
                    </span>
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
                  <Descriptions.Item label="Fiscal Year (በጀት ዓመት)">
                    <Tag color="blue" icon={<CalendarOutlined />}>
                      {selectedCadre.fiscal_year || '2019 E.C.'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Production Campaign Season">
                    <strong>{selectedCadre.season || 'Meher (መኸር)'}</strong>
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

export default function SubKebeleCadres() {
  return (
    <App>
      <SubKebeleCadresContent />
    </App>
  );
}