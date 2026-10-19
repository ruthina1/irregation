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
  Rate
} from 'antd';
import {
  HomeOutlined,
  StarOutlined,
  StarFilled,
  WomanOutlined,
  ManOutlined,
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
  IdcardOutlined,
  PhoneOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import { farmerApi } from '../../services/api/farmerApi';
import { locationApi } from '../../services/api/locationApi';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

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

const MODEL_LEVELS = [
  'Level 1 - Aspiring Model (ጀማሪ ሞዴል)',
  'Level 2 - Growing Model (መካከለኛ ሞዴል)',
  'Level 3 - Star Master Model (ኮከብ / መሪ ሞዴል)'
];

const SPECIALIZATIONS = [
  'Crop Intensification (አዝርዕት ልማት)',
  'Commercial Horticulture (አትክልትና ፍራፍሬ)',
  'Dairy & Cattle Fattening (የወተትና ሰንጋ ከብት)',
  'Apiculture & Modern Beekeeping (ንብ ማነብ)',
  'Soil & Watershed Conservation (የተፈጥሮ ሀብት)',
  'Poultry & Small Ruminants (ዶሮና አነስተኛ እንስሳት)'
];

const INITIAL_MODEL_FARMERS = [
  {
    id: '1',
    farmer_unique_id: 'MF-EG-091',
    full_name: 'Worku Tadesse Habtewold',
    gender: 'Male',
    age: 44,
    phone_number: '+251 918 334 455',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    model_level: 'Level 3 - Star Master Model (ኮከብ / መሪ ሞዴል)',
    specialization: 'Crop Intensification (አዝርዕት ልማት)',
    follower_farmers_count: 5,
    annual_income_etb: 620000,
    technology_score: 5,
    certification_status: 'Certified',
    zone: 'East Gojjam',
    woreda: 'Dejen',
    kebele: 'Kurar'
  },
  {
    id: '2',
    farmer_unique_id: 'MF-EG-092',
    full_name: 'Almaz Zewdu Kebede',
    gender: 'Female',
    age: 38,
    phone_number: '+251 922 778 811',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    model_level: 'Level 3 - Star Master Model (ኮከብ / መሪ ሞዴል)',
    specialization: 'Commercial Horticulture (አትክልትና ፍራፍሬ)',
    follower_farmers_count: 5,
    annual_income_etb: 780000,
    technology_score: 5,
    certification_status: 'Certified',
    zone: 'East Gojjam',
    woreda: 'Dejen',
    kebele: 'Kurar'
  },
  {
    id: '3',
    farmer_unique_id: 'MF-WG-144',
    full_name: 'Mengesha Belayneh Kassa',
    gender: 'Male',
    age: 28,
    phone_number: '+251 911 556 677',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    model_level: 'Level 2 - Growing Model (መካከለኛ ሞዴል)',
    specialization: 'Dairy & Cattle Fattening (የወተትና ሰንጋ ከብት)',
    follower_farmers_count: 3,
    annual_income_etb: 410000,
    technology_score: 4,
    certification_status: 'In Evaluation',
    zone: 'West Gojjam',
    woreda: 'Bure',
    kebele: 'Alefa'
  },
  {
    id: '4',
    farmer_unique_id: 'MF-SG-205',
    full_name: 'Tirhas Girmay Hailu',
    gender: 'Female',
    age: 32,
    phone_number: '+251 930 112 233',
    fiscal_year: '2018 E.C.',
    season: 'Bega / Irrigation (መስኖ/በጋ)',
    model_level: 'Level 2 - Growing Model (መካከለኛ ሞዴል)',
    specialization: 'Commercial Horticulture (አትክልትና ፍራፍሬ)',
    follower_farmers_count: 4,
    annual_income_etb: 490000,
    technology_score: 4,
    certification_status: 'Certified',
    zone: 'South Gondar',
    woreda: 'Fogera',
    kebele: 'Woreta Zuria'
  }
];

function ModelFarmersContent() {
  const { message } = App.useApp();

  const [modelFarmers, setModelFarmers] = useState(INITIAL_MODEL_FARMERS);
  const [isFetching, setIsFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [zoneFilter, setZoneFilter] = useState(null);
  const [fiscalYearFilter, setFiscalYearFilter] = useState(null);
  const [seasonFilter, setSeasonFilter] = useState(null);
  const [levelFilter, setLevelFilter] = useState(null);
  const [genderFilter, setGenderFilter] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFarmer, setEditingFarmer] = useState(null);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
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
      if (editingFarmer) {
        const initForm = async () => {
          const zoneMatch = zones.find(
            (z) => z.name === editingFarmer.zone || z.id === editingFarmer.zone_id
          );
          if (zoneMatch) {
            try {
              const wRes = locationApi?.getWoredas ? await locationApi.getWoredas(zoneMatch.id) : null;
              const wList = wRes?.data?.data?.data || wRes?.data?.data || [];
              setWoredas(wList);

              const woredaMatch = wList.find(
                (w) => w.name === editingFarmer.woreda || w.id === editingFarmer.woreda_id
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
            farmer_unique_id: editingFarmer.farmer_unique_id,
            full_name: editingFarmer.full_name,
            gender: editingFarmer.gender || 'Male',
            age: editingFarmer.age ? Number(editingFarmer.age) : undefined,
            phone_number: editingFarmer.phone_number,
            fiscal_year: editingFarmer.fiscal_year || '2019 E.C.',
            season: editingFarmer.season || 'Meher (መኸር)',
            model_level: editingFarmer.model_level || 'Level 2 - Growing Model (መካከለኛ ሞዴል)',
            specialization: editingFarmer.specialization || 'Crop Intensification (አዝርዕት ልማት)',
            follower_farmers_count: Number(editingFarmer.follower_farmers_count) || 5,
            annual_income_etb: Number(editingFarmer.annual_income_etb) || 0,
            technology_score: Number(editingFarmer.technology_score) || 4,
            certification_status: editingFarmer.certification_status || 'Certified',
            zone_id: editingFarmer.zone_id || zoneMatch?.id || editingFarmer.zone,
            woreda_id: editingFarmer.woreda_id || editingFarmer.woreda,
            kebele_id: editingFarmer.kebele_id || editingFarmer.kebele
          });
        };
        initForm();
      } else {
        form.resetFields();
        form.setFieldsValue({
          gender: 'Male',
          fiscal_year: '2019 E.C.',
          season: 'Meher (መኸር)',
          model_level: 'Level 2 - Growing Model (መካከለኛ ሞዴል)',
          specialization: 'Crop Intensification (አዝርዕት ልማት)',
          follower_farmers_count: 5,
          technology_score: 4,
          certification_status: 'Certified'
        });
        setWoredas([]);
        setKebeles([]);
      }
    }
  }, [isModalOpen, editingFarmer, form, zones]);

  const loadData = async () => {
    setIsFetching(true);
    try {
      if (farmerApi?.getFarmers) {
        await farmerApi.getFarmers();
      }
      message.success('Model farmer registry updated');
    } catch (error) {
      message.error(error?.response?.data?.message || error.message || 'Failed to refresh data');
    } finally {
      setIsFetching(false);
    }
  };

  // Filter pipeline
  const filteredModelFarmers = useMemo(() => {
    return modelFarmers.filter((m) => {
      const name = extractName(m.full_name).toLowerCase();
      const idCode = extractName(m.farmer_unique_id).toLowerCase();
      const spec = extractName(m.specialization).toLowerCase();
      const kebele = extractName(m.kebele).toLowerCase();
      const woreda = extractName(m.woreda).toLowerCase();
      const zone = extractName(m.zone).toLowerCase();
      const q = searchTerm.toLowerCase();

      const matchesSearch =
        name.includes(q) || idCode.includes(q) || spec.includes(q) || kebele.includes(q) || woreda.includes(q) || zone.includes(q);
      const matchesZone = zoneFilter ? zone === zoneFilter.toLowerCase() : true;
      const matchesFiscalYear = fiscalYearFilter ? m.fiscal_year === fiscalYearFilter : true;
      const matchesSeason = seasonFilter ? m.season === seasonFilter : true;
      const matchesLevel = levelFilter ? m.model_level === levelFilter : true;
      const matchesGender = genderFilter ? m.gender === genderFilter : true;

      return (
        matchesSearch &&
        matchesZone &&
        matchesFiscalYear &&
        matchesSeason &&
        matchesLevel &&
        matchesGender
      );
    });
  }, [
    modelFarmers,
    searchTerm,
    zoneFilter,
    fiscalYearFilter,
    seasonFilter,
    levelFilter,
    genderFilter
  ]);

  // Statistics calculation for Indicator KPIs
  const stats = useMemo(() => {
    const total = filteredModelFarmers.length;
    const maleCount = filteredModelFarmers.filter((m) => m.gender === 'Male').length;
    const femaleCount = filteredModelFarmers.filter((m) => m.gender === 'Female').length;
    const certifiedCount = filteredModelFarmers.filter((m) => m.certification_status === 'Certified').length;
    const totalFollowers = filteredModelFarmers.reduce((acc, m) => acc + (Number(m.follower_farmers_count) || 0), 0);
    const femaleRatio = total > 0 ? ((femaleCount / total) * 100).toFixed(1) : 0;

    return { total, maleCount, femaleCount, certifiedCount, totalFollowers, femaleRatio };
  }, [filteredModelFarmers]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setZoneFilter(null);
    setFiscalYearFilter(null);
    setSeasonFilter(null);
    setLevelFilter(null);
    setGenderFilter(null);
  };

  const handleOpenModal = (record = null) => {
    setEditingFarmer(record);
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

      if (editingFarmer) {
        setModelFarmers((prev) =>
          prev.map((item) => (item.id === editingFarmer.id ? { ...item, ...payload } : item))
        );
        message.success('Model farmer profile updated successfully');
      } else {
        const newRecord = {
          ...payload,
          id: Date.now().toString(),
          farmer_unique_id: values.farmer_unique_id || `MF-${Date.now().toString().slice(-4)}`
        };
        setModelFarmers((prev) => [newRecord, ...prev]);
        message.success('New model farmer certified and enrolled successfully');
      }
      setIsModalOpen(false);
    } catch (error) {
      message.error(error?.response?.data?.message || error.message || 'Failed to save Model Farmer record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    setModelFarmers((prev) => prev.filter((item) => item.id !== id));
    message.success('Model farmer record removed');
  };

  const exportToCSV = () => {
    if (!filteredModelFarmers.length) {
      message.warning('No model farmer records available to export');
      return;
    }
    const headers = [
      'Farmer ID,Full Name,Gender,Age,Model Level,Specialization,Followers Linked,Annual Income (ETB),Tech Rating,Certification,FY,Season,Zone,Woreda,Kebele'
    ];
    const rows = filteredModelFarmers.map((m) => [
      `"${m.farmer_unique_id || ''}"`,
      `"${m.full_name || ''}"`,
      `"${m.gender || ''}"`,
      m.age || '',
      `"${m.model_level || ''}"`,
      `"${m.specialization || ''}"`,
      m.follower_farmers_count || 0,
      m.annual_income_etb || 0,
      m.technology_score || 0,
      `"${m.certification_status || ''}"`,
      `"${m.fiscal_year || ''}"`,
      `"${m.season || ''}"`,
      `"${extractName(m.zone)}"`,
      `"${extractName(m.woreda)}"`,
      `"${extractName(m.kebele)}"`
    ].join(','));

    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Indicator_Model_Farmers_Development_${Date.now()}.csv`;
    a.click();
    message.success('Report Form 2019 exported successfully');
  };

  const columns = [
    {
      title: 'Farmer ID & Profile',
      key: 'farmer_info',
      width: 240,
      render: (_, r) => (
        <div>
          <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{r.full_name}</strong>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>
            ID: <span style={{ fontFamily: 'monospace' }}>{r.farmer_unique_id}</span> | {r.age ? `${r.age} yrs` : '-'}
          </div>
        </div>
      )
    },
    {
      title: 'Gender (ጾታ)',
      dataIndex: 'gender',
      key: 'gender',
      align: 'center',
      width: 110,
      sorter: (a, b) => a.gender.localeCompare(b.gender),
      render: (g) => (
        <Tag
          color={g === 'Female' ? 'purple' : 'blue'}
          icon={g === 'Female' ? <WomanOutlined /> : <ManOutlined />}
          style={{ fontWeight: 600 }}
        >
          {g}
        </Tag>
      )
    },
    {
      title: 'Model Category / Level',
      dataIndex: 'model_level',
      key: 'model_level',
      width: 230,
      render: (level) => {
        let color = 'gold';
        if (level?.includes('Level 1')) color = 'cyan';
        if (level?.includes('Level 2')) color = 'blue';
        return (
          <Tag color={color} icon={<StarFilled style={{ color: '#faad14' }} />}>
            {level}
          </Tag>
        );
      }
    },
    {
      title: 'Enterprise Specialization',
      dataIndex: 'specialization',
      key: 'specialization',
      width: 220,
      render: (spec) => <span style={{ fontWeight: 500, color: '#262626' }}>{spec}</span>
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
      title: '1-to-5 Followers',
      dataIndex: 'follower_farmers_count',
      key: 'followers',
      align: 'center',
      width: 140,
      sorter: (a, b) => (Number(a.follower_farmers_count) || 0) - (Number(b.follower_farmers_count) || 0),
      render: (val) => (
        <Tag color="green" icon={<TeamOutlined />}>
          {val || 5} Mentored
        </Tag>
      )
    },
    {
      title: 'Timeline (FY / Season)',
      key: 'timeline',
      width: 190,
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
      title: 'Status',
      dataIndex: 'certification_status',
      key: 'certification_status',
      align: 'center',
      width: 130,
      render: (status) => {
        const isCert = status === 'Certified';
        return (
          <Tag color={isCert ? 'success' : 'processing'} icon={isCert ? <CheckCircleOutlined /> : <ClockCircleOutlined />}>
            {status || 'Certified'}
          </Tag>
        );
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'center',
      fixed: 'right',
      width: 140,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Model Profile Dossier">
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: '#1890ff' }} />}
              onClick={() => {
                setSelectedFarmer(record);
                setIsDossierOpen(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Edit Model Profile">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: '#52c41a' }} />}
              onClick={() => handleOpenModal(record)}
            />
          </Tooltip>
          <Tooltip title="Remove Model Status">
            <Popconfirm
              title="Remove model farmer certification?"
              description="Are you sure you want to remove this farmer from the model development cohort?"
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
      {/* Breadcrumb Navigation */}
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item><HomeOutlined /></Breadcrumb.Item>
        <Breadcrumb.Item>Extension Communication & Digitalization</Breadcrumb.Item>
        <Breadcrumb.Item>Model Farmers Development</Breadcrumb.Item>
      </Breadcrumb>

      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#1a5f2c', fontFamily: "'Times New Roman', Times, serif" }}>
            Model Farmers Development (የሞዴል አርሶ አደሮች ልማትና ሽግግር)
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Tracking technology adoption leaders, 1-to-5 development group networks, and graduation trajectories
          </Text>
        </div>
        <Button icon={<ReloadOutlined />} onClick={loadData} loading={isFetching}>
          Refresh
        </Button>
      </div>

      {/* KPI Stat Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #1a5f2c', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Total Model Farmers</span>}
              value={stats.total}
              prefix={<StarFilled style={{ color: '#faad14', marginRight: 8 }} />}
              valueStyle={{ color: '#1a5f2c', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Certified Master Models: <strong style={{ color: '#262626' }}>{stats.certifiedCount}</strong>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #1890ff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Male Model Farmers (ወንድ)</span>}
              value={stats.maleCount}
              prefix={<ManOutlined style={{ color: '#1890ff', marginRight: 8 }} />}
              valueStyle={{ color: '#1890ff', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Community technology champions
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #722ed1', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Female Model Farmers (ሴት)</span>}
              value={stats.femaleCount}
              prefix={<WomanOutlined style={{ color: '#722ed1', marginRight: 8 }} />}
              valueStyle={{ color: '#722ed1', fontWeight: 'bold', fontSize: 24 }}
            />
            <Progress percent={Number(stats.femaleRatio)} size="small" strokeColor="#722ed1" />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8c8c8c', marginTop: 2 }}>
              <span>Female Share: <strong style={{ color: '#722ed1' }}>{stats.femaleRatio}%</strong></span>
              <span>Regional Goal: &gt; 30%</span>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #fa8c16', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Total Followers Linked</span>}
              value={stats.totalFollowers}
              prefix={<TeamOutlined style={{ color: '#fa8c16', marginRight: 8 }} />}
              valueStyle={{ color: '#fa8c16', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              1-to-5 peer extension network capacity
            </div>
          </Card>
        </Col>
      </Row>

      {/* Filter & Action Toolbar: Export, Reset, and Primary Action Aligned Above Table */}
      <Card bordered={false} style={{ marginBottom: 16, borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }} bodyStyle={{ padding: '14px 16px' }}>
        <Row justify="space-between" align="middle" gutter={[12, 12]}>
          {/* Filters grouped on the left */}
          <Col xs={24} xxl={16} xl={15}>
            <Space wrap size={[10, 10]}>
              <Input
                placeholder="Search Name, ID, or Location..."
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: 220 }}
                allowClear
              />

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
                placeholder="Model Level / Stage"
                value={levelFilter}
                onChange={setLevelFilter}
                style={{ width: 195 }}
                allowClear
              >
                {MODEL_LEVELS.map((lvl) => (
                  <Option key={lvl} value={lvl}>{lvl}</Option>
                ))}
              </Select>

              <Select
                placeholder="Filter by Zone"
                value={zoneFilter}
                onChange={setZoneFilter}
                style={{ width: 150 }}
                allowClear
              >
                {[...new Set(modelFarmers.map((m) => extractName(m.zone)))].map((z) => (
                  <Option key={z} value={z}>{z}</Option>
                ))}
              </Select>

              <Select
                placeholder="Gender"
                value={genderFilter}
                onChange={setGenderFilter}
                style={{ width: 110 }}
                allowClear
              >
                <Option value="Male">Male (ወንድ)</Option>
                <Option value="Female">Female (ሴት)</Option>
              </Select>
            </Space>
          </Col>

          {/* Action buttons on the right: Export, Reset, and Enroll New Model Farmer */}
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
                disabled={!(searchTerm || zoneFilter || fiscalYearFilter || seasonFilter || levelFilter || genderFilter)}
              >
                Reset Filters
              </Button>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => handleOpenModal(null)}
                style={{ backgroundColor: '#1a5f2c', borderColor: '#1a5f2c', fontWeight: 600 }}
              >
                Enroll Model Farmer
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Model Farmers Table */}
      <Table
        columns={columns}
        dataSource={filteredModelFarmers}
        rowKey="id"
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} enrolled model farmers`
        }}
        scroll={{ x: 1350 }}
        bordered
        size="middle"
      />

      {/* Registration / Edit Modal with Database Location Cascading */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <StarFilled style={{ color: '#faad14', fontSize: 20 }} />
            <span style={{ color: '#1a5f2c', fontWeight: 'bold', fontFamily: "'Times New Roman', Times, serif", fontSize: 17 }}>
              {editingFarmer ? 'Edit Model Farmer Certification' : 'Enroll & Certify New Model Farmer (የሞዴል አርሶ አደር ምዝገባ)'}
            </span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText={editingFarmer ? 'Update Profile' : 'Save & Certify Model'}
        okButtonProps={{ style: { backgroundColor: '#1a5f2c', borderColor: '#1a5f2c' }, loading: isSubmitting }}
        width={780}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Personal Identification & Demographics
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="farmer_unique_id"
                label="Model Farmer ID Code"
                rules={[{ required: true, message: 'ID Code required' }]}
              >
                <Input placeholder="e.g. MF-EG-0089" />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item
                name="full_name"
                label="Full Name (with Grandfather)"
                rules={[{ required: true, message: 'Full name required' }]}
              >
                <Input placeholder="e.g. Abebech Demissie Wolde" />
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
                <InputNumber min={18} max={110} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="phone_number" label="Direct Phone Number" rules={[{ required: true }]}>
                <Input placeholder="+251 9..." />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Model Grade, Specialization & Campaign
          </Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="model_level"
                label="Model Category / Level"
                rules={[{ required: true }]}
              >
                <Select>
                  {MODEL_LEVELS.map((lvl) => (
                    <Option key={lvl} value={lvl}>{lvl}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="specialization"
                label="Enterprise Specialization"
                rules={[{ required: true }]}
              >
                <Select>
                  {SPECIALIZATIONS.map((spec) => (
                    <Option key={spec} value={spec}>{spec}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

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
                name="follower_farmers_count"
                label="1-to-5 Followers Linked"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} max={25} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="annual_income_etb" label="Estimated Gross Annual Income (ETB)">
                <InputNumber min={0} style={{ width: '100%' }} placeholder="e.g. 500000" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="technology_score" label="Technology Adoption Rating (1-5)">
                <Rate count={5} style={{ fontSize: 18 }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="certification_status" label="Certification Status" rules={[{ required: true }]}>
                <Select>
                  <Option value="Certified">Certified (የተረጋገጠለት)</Option>
                  <Option value="In Evaluation">In Evaluation (በግምገማ ላይ)</Option>
                  <Option value="Candidate">Candidate (ዕጩ)</Option>
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

      {/* Model Farmer Dossier Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                backgroundColor: '#fffbe6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#faad14',
                fontSize: 20
              }}
            >
              <StarFilled />
            </div>
            <div>
              <span style={{ fontSize: 16, fontWeight: 'bold', color: '#1a5f2c', fontFamily: "'Times New Roman', Times, serif" }}>
                {selectedFarmer?.full_name}
              </span>
              <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                ID: {selectedFarmer?.farmer_unique_id} | {selectedFarmer?.model_level}
              </div>
            </div>
          </div>
        }
        open={isDossierOpen}
        onCancel={() => setIsDossierOpen(false)}
        footer={[
          <Button
            key="edit"
            onClick={() => {
              setIsDossierOpen(false);
              handleOpenModal(selectedFarmer);
            }}
          >
            Edit Profile
          </Button>,
          <Button
            key="close"
            type="primary"
            onClick={() => setIsDossierOpen(false)}
            style={{ backgroundColor: '#1a5f2c', borderColor: '#1a5f2c' }}
          >
            Close Dossier
          </Button>
        ]}
        width={800}
        destroyOnClose
      >
        {selectedFarmer && (
          <div style={{ paddingTop: 8 }}>
            <Tabs defaultActiveKey="1" type="card">
              <TabPane
                tab={
                  <span>
                    <TrophyOutlined />
                    Model Farmer Profile
                  </span>
                }
                key="1"
              >
                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
                  <Descriptions.Item label="Official Name">
                    <strong>{selectedFarmer.full_name}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Unique ID Code">
                    <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{selectedFarmer.farmer_unique_id}</span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Gender">
                    <Tag color={selectedFarmer.gender === 'Female' ? 'purple' : 'blue'}>{selectedFarmer.gender}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Age">
                    {selectedFarmer.age ? `${selectedFarmer.age} years old` : 'Unspecified'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Model Level" span={2}>
                    <Tag color="gold" icon={<StarFilled style={{ color: '#faad14' }} />}>
                      {selectedFarmer.model_level}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Specialization" span={2}>
                    <Tag color="green">{selectedFarmer.specialization}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="1-to-5 Network Linkage">
                    <Tag color="cyan" icon={<TeamOutlined />}>
                      {selectedFarmer.follower_farmers_count || 5} Follower Farmers
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Annual Gross Income">
                    {selectedFarmer.annual_income_etb
                      ? `${Number(selectedFarmer.annual_income_etb).toLocaleString()} ETB`
                      : 'Not Disclosed'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Technology Adoption Rating">
                    <Rate disabled defaultValue={selectedFarmer.technology_score || 4} style={{ fontSize: 14 }} />
                  </Descriptions.Item>
                  <Descriptions.Item label="Certification Status">
                    <Tag color="success">{selectedFarmer.certification_status || 'Certified'}</Tag>
                  </Descriptions.Item>
                </Descriptions>
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <EnvironmentOutlined />
                    Station Location
                  </span>
                }
                key="2"
              >
                <Descriptions bordered size="small" column={{ xs: 1, sm: 3 }} style={{ marginBottom: 16 }}>
                  <Descriptions.Item label="Zone">
                    <strong>{extractName(selectedFarmer.zone)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Woreda">
                    <strong>{extractName(selectedFarmer.woreda)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Kebele Cluster">
                    <span style={{ color: '#1a5f2c', fontWeight: 'bold' }}>
                      {extractName(selectedFarmer.kebele)}
                    </span>
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
                  <Descriptions.Item label="Fiscal Year Registered">
                    <Tag color="blue">{selectedFarmer.fiscal_year || '2019 E.C.'}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Campaign Season">
                    {selectedFarmer.season || 'Meher (መኸር)'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Phone Contact" span={2}>
                    <span style={{ fontFamily: 'monospace' }}>
                      <PhoneOutlined style={{ color: '#1a5f2c', marginRight: 6 }} />
                      {selectedFarmer.phone_number || 'Unrecorded'}
                    </span>
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

export default function ModelFarmers() {
  return (
    <App>
      <ModelFarmersContent />
    </App>
  );
}