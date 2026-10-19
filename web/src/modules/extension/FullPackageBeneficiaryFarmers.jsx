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
  Spin
} from 'antd';
import {
  HomeOutlined,
  InboxOutlined,
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
  AppstoreOutlined,
  ClearOutlined,
  CheckSquareOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { farmerApi } from '../../services/api/farmerApi';
import { locationApi } from '../../services/api/locationApi';
import { extensionApi } from '../../services/api/extensionApi';
import { handleApiError } from '../../utils/errorHandler';
import BrandedLoader from '../../components/common/BrandedLoader';
import LocationScopeSelector from '../../components/common/LocationScopeSelector';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

// Helper to safely extract clean string names from primitives or nested ORM relation objects
const extractName = (value, defaultVal = 'Unspecified') => {
  if (!value) return defaultVal;
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    return value.name || value.title || value.kebele_name || value.woreda_name || value.zone_name || defaultVal;
  }
  return String(value);
};

// Registered package commodities aligned with MoA priorities
const STANDARD_COMMODITIES = [
  'Teff (Bora / Quncho)',
  'Bread Wheat (Rust-Resistant)',
  'Hybrid Maize (BH-546)',
  'Malted Barley',
  'Sesame (Humera/Gonder-1)',
  'Irrigated Vegetables (Onion/Tomato)',
  'Avocado (Hass Grafted Seedlings)',
  'Dairy & Forage Intensification'
];

// Standard Ethiopian Fiscal Years
const FISCAL_YEARS = ['2016 E.C.', '2017 E.C.', '2018 E.C.', '2019 E.C.', '2020 E.C.'];

// Standard Ethiopian Agricultural Production Seasons
const SEASONS = ['Meher (መኸር)', 'Belg (በልግ)', 'Bega / Irrigation (መስኖ/በጋ)'];

// Initial seed data for Full Package deployments
const INITIAL_PACKAGES = [
  {
    id: '1',
    commodity: 'Teff (Bora / Quncho)',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    male_beneficiaries: 1840,
    female_beneficiaries: 620,
    components: [
      'Certified Seed (Bora)',
      'Blended NPSB Fertilizer',
      'Split Urea Application',
      'Broadleaf Herbicide',
      'Row-Planting Mechanization',
      'DA Seasonal Coaching'
    ],
    target_area_ha: 1250,
    adoption_status: 'Optimal',
    zone: 'East Gojjam',
    woreda: 'Dejen',
    kebele: 'Kurar'
  },
  {
    id: '2',
    commodity: 'Bread Wheat (Rust-Resistant)',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    male_beneficiaries: 2310,
    female_beneficiaries: 780,
    components: [
      'Certified Kingbird/Kakaba Seed',
      'NPS Blended Fertilizer',
      'Fungicide (Tilt / Rex Duo)',
      'Combined Harvester Service',
      'Cluster Supervisory Coaching'
    ],
    target_area_ha: 1800,
    adoption_status: 'Optimal',
    zone: 'North Shewa',
    woreda: 'Moretna Jiru',
    kebele: 'Goshebado'
  },
  {
    id: '3',
    commodity: 'Hybrid Maize (BH-546)',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    male_beneficiaries: 1950,
    female_beneficiaries: 430,
    components: [
      'Hybrid BH-546 Seed',
      'Soil Specific Blended Fertilizer',
      'Fall Armyworm Bio-Pesticide',
      'Post-Harvest Hermetic Bags'
    ],
    target_area_ha: 1400,
    adoption_status: 'Review Due',
    zone: 'West Gojjam',
    woreda: 'Bure',
    kebele: 'Alefa'
  },
  {
    id: '4',
    commodity: 'Bread Wheat (Rust-Resistant)',
    fiscal_year: '2018 E.C.',
    season: 'Bega / Irrigation (መስኖ/በጋ)',
    male_beneficiaries: 1120,
    female_beneficiaries: 310,
    components: [
      'Ediget Certified Seed',
      'Urea Deep Placement (UDP)',
      'Small Combine Harvester Linkage',
      'Paddy Field Water Control DA Guide'
    ],
    target_area_ha: 890,
    adoption_status: 'Optimal',
    zone: 'South Gondar',
    woreda: 'Fogera',
    kebele: 'Kuhar'
  }
];

function FullPackageBeneficiaryFarmersContent() {
  const { message } = App.useApp();

  const [packages, setPackages] = useState(INITIAL_PACKAGES);
  const [isFetching, setIsFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [zoneFilter, setZoneFilter] = useState(null);
  const [commodityFilter, setCommodityFilter] = useState(null);
  const [fiscalYearFilter, setFiscalYearFilter] = useState(null);
  const [seasonFilter, setSeasonFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
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
      if (editingPackage) {
        const initForm = async () => {
          const zoneMatch = zones.find(
            (z) => z.name === editingPackage.zone || z.id === editingPackage.zone_id
          );
          if (zoneMatch) {
            try {
              const wRes = locationApi?.getWoredas ? await locationApi.getWoredas(zoneMatch.id) : null;
              const wList = wRes?.data?.data?.data || wRes?.data?.data || [];
              setWoredas(wList);

              const woredaMatch = wList.find(
                (w) => w.name === editingPackage.woreda || w.id === editingPackage.woreda_id
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
            commodity: editingPackage.commodity,
            fiscal_year: editingPackage.fiscal_year || '2019 E.C.',
            season: editingPackage.season || 'Meher (መኸር)',
            male_beneficiaries: Number(editingPackage.male_beneficiaries) || 0,
            female_beneficiaries: Number(editingPackage.female_beneficiaries) || 0,
            target_area_ha: Number(editingPackage.target_area_ha) || 0,
            components: editingPackage.components || [],
            adoption_status: editingPackage.adoption_status || 'Optimal',
            zone_id: editingPackage.zone_id || zoneMatch?.id || editingPackage.zone,
            woreda_id: editingPackage.woreda_id || editingPackage.woreda,
            kebele_id: editingPackage.kebele_id || editingPackage.kebele
          });
        };
        initForm();
      } else {
        form.resetFields();
        form.setFieldsValue({
          fiscal_year: '2019 E.C.',
          season: 'Meher (መኸር)',
          male_beneficiaries: 0,
          female_beneficiaries: 0,
          target_area_ha: 0,
          adoption_status: 'Optimal',
          components: [
            'Certified Improved Seed',
            'Blended Soil-Targeted Fertilizer (NPSB)',
            'Top-Dress Urea Application',
            'DA Extension Coaching & Supervision'
          ]
        });
        setWoredas([]);
        setKebeles([]);
      }
    }
  }, [isModalOpen, editingPackage, form, zones]);

  // Load registered smallholders to sync data
  const loadData = async () => {
    setIsFetching(true);
    try {
      if (farmerApi?.getFarmers) {
        await farmerApi.getFarmers();
      }
      message.success('Full package cohorts refreshed');
    } catch (error) {
      message.error(error?.response?.data?.message || error.message || 'Failed to refresh package data');
    } finally {
      setIsFetching(false);
    }
  };

  // Filter pipeline with independent Fiscal Year and Season controls
  const filteredPackages = useMemo(() => {
    return packages.filter((p) => {
      const commodity = extractName(p.commodity).toLowerCase();
      const kebele = extractName(p.kebele).toLowerCase();
      const woreda = extractName(p.woreda).toLowerCase();
      const zone = extractName(p.zone).toLowerCase();
      const q = searchTerm.toLowerCase();

      const matchesSearch =
        commodity.includes(q) || kebele.includes(q) || woreda.includes(q) || zone.includes(q);
      const matchesZone = zoneFilter ? zone === zoneFilter.toLowerCase() : true;
      const matchesCommodity = commodityFilter ? p.commodity === commodityFilter : true;
      const matchesFiscalYear = fiscalYearFilter ? p.fiscal_year === fiscalYearFilter : true;
      const matchesSeason = seasonFilter ? p.season === seasonFilter : true;
      const matchesStatus = statusFilter ? p.adoption_status === statusFilter : true;

      return (
        matchesSearch &&
        matchesZone &&
        matchesCommodity &&
        matchesFiscalYear &&
        matchesSeason &&
        matchesStatus
      );
    });
  }, [
    packages,
    searchTerm,
    zoneFilter,
    commodityFilter,
    fiscalYearFilter,
    seasonFilter,
    statusFilter
  ]);

  // Statistics calculation for Indicator 1.3
  const stats = useMemo(() => {
    const totalMale = filteredPackages.reduce((acc, p) => acc + (Number(p.male_beneficiaries) || 0), 0);
    const totalFemale = filteredPackages.reduce((acc, p) => acc + (Number(p.female_beneficiaries) || 0), 0);
    const totalBeneficiaries = totalMale + totalFemale;
    const totalArea = filteredPackages.reduce((acc, p) => acc + (Number(p.target_area_ha) || 0), 0);
    const femaleRatio = totalBeneficiaries > 0 ? ((totalFemale / totalBeneficiaries) * 100).toFixed(1) : 0;

    return { totalMale, totalFemale, totalBeneficiaries, totalArea, femaleRatio };
  }, [filteredPackages]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setZoneFilter(null);
    setCommodityFilter(null);
    setFiscalYearFilter(null);
    setSeasonFilter(null);
    setStatusFilter(null);
  };

  const handleOpenModal = (record = null) => {
    setEditingPackage(record);
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

      if (editingPackage) {
        setPackages((prev) =>
          prev.map((item) => (item.id === editingPackage.id ? { ...item, ...payload } : item))
        );
        message.success('Full package deployment updated successfully');
      } else {
        const newRecord = { ...payload, id: Date.now().toString() };
        setPackages((prev) => [newRecord, ...prev]);
        message.success('Full package cohort registered successfully');
      }
      setIsModalOpen(false);
    } catch (error) {
      message.error(error?.response?.data?.message || error.message || 'Failed to save Full Package record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    setPackages((prev) => prev.filter((item) => item.id !== id));
    message.success('Full package cohort removed');
  };

  // CSV Exporter for Indicator 1.3
  const exportToCSV = () => {
    if (!filteredPackages.length) {
      message.warning('No package deployments available to export');
      return;
    }
    const headers = [
      'Target Commodity,Fiscal Year,Season,Zone,Woreda,Kebele,Male Beneficiaries,Female Beneficiaries,Total Reached,Target Area (Ha),Status'
    ];
    const rows = filteredPackages.map((p) => {
      const total = (Number(p.male_beneficiaries) || 0) + (Number(p.female_beneficiaries) || 0);
      return [
        `"${p.commodity || ''}"`,
        `"${p.fiscal_year || ''}"`,
        `"${p.season || ''}"`,
        `"${extractName(p.zone)}"`,
        `"${extractName(p.woreda)}"`,
        `"${extractName(p.kebele)}"`,
        p.male_beneficiaries || 0,
        p.female_beneficiaries || 0,
        total,
        p.target_area_ha || 0,
        `"${p.adoption_status || ''}"`
      ].join(',');
    });

    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Indicator_1_3_Full_Package_Farmers_${Date.now()}.csv`;
    a.click();
    message.success('Full package report exported successfully');
  };

  const columns = [
    {
      title: 'Target Commodity',
      dataIndex: 'commodity',
      key: 'commodity',
      width: 220,
      render: (val) => <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{val}</strong>
    },
    {
      title: 'Fiscal Year & Season',
      key: 'timeline',
      width: 210,
      render: (_, r) => (
        <div>
          <Tag color="blue" icon={<CalendarOutlined />}>
            {r.fiscal_year || '2019 E.C.'}
          </Tag>
          <div style={{ fontSize: 12, color: '#595959', marginTop: 4 }}>
            {r.season || 'Meher (መኸር)'}
          </div>
        </div>
      )
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
      title: 'Male (ወንድ)',
      dataIndex: 'male_beneficiaries',
      key: 'male_beneficiaries',
      align: 'right',
      width: 130,
      sorter: (a, b) => (Number(a.male_beneficiaries) || 0) - (Number(b.male_beneficiaries) || 0),
      render: (val) => (
        <span style={{ fontWeight: 600, color: '#1890ff' }}>
          {Number(val || 0).toLocaleString()}
        </span>
      )
    },
    {
      title: 'Female (ሴት)',
      dataIndex: 'female_beneficiaries',
      key: 'female_beneficiaries',
      align: 'right',
      width: 130,
      sorter: (a, b) => (Number(a.female_beneficiaries) || 0) - (Number(b.female_beneficiaries) || 0),
      render: (val) => (
        <span style={{ fontWeight: 600, color: '#722ed1' }}>
          {Number(val || 0).toLocaleString()}
        </span>
      )
    },
    {
      title: 'Total Reached',
      key: 'total_users',
      align: 'right',
      width: 160,
      sorter: (a, b) => {
        const subA = (Number(a.male_beneficiaries) || 0) + (Number(a.female_beneficiaries) || 0);
        const subB = (Number(b.male_beneficiaries) || 0) + (Number(b.female_beneficiaries) || 0);
        return subA - subB;
      },
      render: (_, r) => {
        const total = (Number(r.male_beneficiaries) || 0) + (Number(r.female_beneficiaries) || 0);
        return (
          <Tag color="green" style={{ fontWeight: 'bold', fontSize: 12 }}>
            {total.toLocaleString()} Farmers
          </Tag>
        );
      }
    },
    {
      title: 'Target Area',
      dataIndex: 'target_area_ha',
      key: 'target_area_ha',
      align: 'right',
      width: 120,
      render: (val) => `${Number(val || 0).toLocaleString()} Ha`
    },
    {
      title: 'Status',
      dataIndex: 'adoption_status',
      key: 'adoption_status',
      align: 'center',
      width: 130,
      render: (status) => {
        const isOpt = status === 'Optimal';
        return (
          <Tag color={isOpt ? 'success' : 'warning'} icon={isOpt ? <CheckCircleOutlined /> : <ClockCircleOutlined />}>
            {status || 'Optimal'}
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
          <Tooltip title="View Components Dossier">
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: '#1890ff' }} />}
              onClick={() => {
                setSelectedPackage(record);
                setIsDossierOpen(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Edit Package">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: '#52c41a' }} />}
              onClick={() => handleOpenModal(record)}
            />
          </Tooltip>
          <Tooltip title="Remove Record">
            <Popconfirm
              title="Remove package record?"
              description="Are you sure you want to remove this full package cohort?"
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
        <Breadcrumb.Item>Full Package Beneficiary Farmers</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#1a5f2c', fontFamily: "'Times New Roman', Times, serif" }}>
            Full Package Extension Beneficiaries (አ/አደሮችን ሙሉ ፓኬጅ ተጠቃሚ ማድረግ - Indicator 1.3)
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Tracking integrated technology adoption (certified seed, balanced fertilizers, crop protection, mechanization)
          </Text>
        </div>
        <Button icon={<ReloadOutlined />} onClick={loadData} loading={isFetching}>
          Refresh
        </Button>
      </div>

      {/* Indicator 1.3 KPI Dashboard */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #1a5f2c', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Total Full-Package Farmers</span>}
              value={stats.totalBeneficiaries}
              prefix={<InboxOutlined style={{ color: '#1a5f2c', marginRight: 8 }} />}
              valueStyle={{ color: '#1a5f2c', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Active Package Deployments: <strong style={{ color: '#262626' }}>{filteredPackages.length}</strong>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #1890ff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Male Beneficiaries (ወንድ)</span>}
              value={stats.totalMale}
              prefix={<ManOutlined style={{ color: '#1890ff', marginRight: 8 }} />}
              valueStyle={{ color: '#1890ff', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Smallholder crop intensified
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #722ed1', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Female Beneficiaries (ሴት)</span>}
              value={stats.totalFemale}
              prefix={<WomanOutlined style={{ color: '#722ed1', marginRight: 8 }} />}
              valueStyle={{ color: '#722ed1', fontWeight: 'bold', fontSize: 24 }}
            />
            <Progress percent={Number(stats.femaleRatio)} size="small" strokeColor="#722ed1" />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8c8c8c', marginTop: 2 }}>
              <span>Female Share: <strong style={{ color: '#722ed1' }}>{stats.femaleRatio}%</strong></span>
              <span>Regional Goal: &gt; 25%</span>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #fa8c16', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Total Cultivated Area (Ha)</span>}
              value={stats.totalArea}
              prefix={<AppstoreOutlined style={{ color: '#fa8c16', marginRight: 8 }} />}
              valueStyle={{ color: '#fa8c16', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Hectares under full technological bundle
            </div>
          </Card>
        </Col>
      </Row>

      {/* Filter & Action Toolbar immediately above the table */}
      <Card bordered={false} style={{ marginBottom: 16, borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }} bodyStyle={{ padding: '14px 16px' }}>
        <Row justify="space-between" align="middle" gutter={[12, 12]}>
          {/* Filters grouped on the left */}
          <Col xs={24} xxl={16} xl={15}>
            <Space wrap size={[10, 10]}>
              <Input
                placeholder="Search Commodity or Station..."
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
                placeholder="Filter by Commodity"
                value={commodityFilter}
                onChange={setCommodityFilter}
                style={{ width: 190 }}
                allowClear
              >
                {STANDARD_COMMODITIES.map((c) => (
                  <Option key={c} value={c}>{c}</Option>
                ))}
              </Select>

              <Select
                placeholder="Filter by Zone"
                value={zoneFilter}
                onChange={setZoneFilter}
                style={{ width: 150 }}
                allowClear
              >
                {[...new Set(packages.map((p) => extractName(p.zone)))].map((z) => (
                  <Option key={z} value={z}>{z}</Option>
                ))}
              </Select>

              <Select
                placeholder="Adoption Status"
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: 145 }}
                allowClear
              >
                <Option value="Optimal">Optimal</Option>
                <Option value="Review Due">Review Due</Option>
                <Option value="Partial Adoption">Partial</Option>
              </Select>
            </Space>
          </Col>

          {/* Action buttons: Export, Reset, and Deploy New Package aligned right directly above table */}
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
                disabled={!(searchTerm || zoneFilter || commodityFilter || fiscalYearFilter || seasonFilter || statusFilter)}
              >
                Reset Filters
              </Button>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => handleOpenModal(null)}
                style={{ backgroundColor: '#1a5f2c', borderColor: '#1a5f2c', fontWeight: 600 }}
              >
                Deploy New Package
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Deployments Table */}
      <Table
        columns={columns}
        dataSource={filteredPackages}
        rowKey="id"
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} full package cohorts`
        }}
        scroll={{ x: 1250 }}
        bordered
        size="middle"
      />

      {/* Standalone Create / Edit Package Modal with Dynamic Database Locations */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <InboxOutlined style={{ color: '#1a5f2c', fontSize: 18 }} />
            <span style={{ color: '#1a5f2c', fontWeight: 'bold', fontFamily: "'Times New Roman', Times, serif", fontSize: 17 }}>
              {editingPackage ? 'Edit Full Package Deployment' : 'Deploy Full Extension Package (ሙሉ ፓኬጅ)'}
            </span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText={editingPackage ? 'Update Deployment' : 'Save & Deploy Package'}
        okButtonProps={{ style: { backgroundColor: '#1a5f2c', borderColor: '#1a5f2c' }, loading: isSubmitting }}
        width={780}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Target Commodity & Campaign Schedule
          </Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="commodity"
                label="Target Commodity (የሰብል/ምርት አይነት)"
                rules={[{ required: true, message: 'Commodity required' }]}
              >
                <Select placeholder="Select commodity">
                  {STANDARD_COMMODITIES.map((c) => (
                    <Option key={c} value={c}>{c}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="fiscal_year"
                label="Fiscal Year (በጀት ዓመት)"
                rules={[{ required: true, message: 'FY required' }]}
              >
                <Select placeholder="Select Year">
                  {FISCAL_YEARS.map((fy) => (
                    <Option key={fy} value={fy}>{fy}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="season"
                label="Season (የምርት ወቅት)"
                rules={[{ required: true, message: 'Season required' }]}
              >
                <Select placeholder="Select Season">
                  {SEASONS.map((s) => (
                    <Option key={s} value={s}>{s}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Beneficiary Smallholders (Indicator 1.3 Quotas)
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="male_beneficiaries"
                label="Male Beneficiaries (ወንድ)"
                rules={[{ required: true, message: 'Value required' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="female_beneficiaries"
                label="Female Beneficiaries (ሴት)"
                rules={[{ required: true, message: 'Value required' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="target_area_ha"
                label="Cultivated Area (Hectares)"
                rules={[{ required: true, message: 'Area required' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Full Technology Package Bundle Elements
          </Divider>
          <Form.Item
            name="components"
            label="Package Components Provided"
            rules={[{ required: true, message: 'Please select components in bundle' }]}
          >
            <Select mode="tags" style={{ width: '100%' }} placeholder="Select or type inputs in bundle">
              <Option value="Certified Improved Seed">Certified Improved Seed (ምርጥ ዘር)</Option>
              <Option value="Blended Soil-Targeted Fertilizer (NPSB)">Blended Soil Fertilizer (NPSB)</Option>
              <Option value="Top-Dress Urea Application">Top-Dress Urea (ዩሪያ)</Option>
              <Option value="Fungicide / Crop Protection Chemicals">Crop Protection (ፀረ-ተባይ/ፈንገስ)</Option>
              <Option value="Row-Planting / Tractor Mechanization">Mechanization (ማሽነሪ አገልግሎት)</Option>
              <Option value="DA Extension Coaching & Supervision">DA Supervisory Coaching (የባለሙያ ድጋፍ)</Option>
              <Option value="Post-Harvest Storage Materials">Post-Harvest Storage Bags (ኸርሜቲክ ጆንያ)</Option>
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="adoption_status" label="Field Adoption Status" rules={[{ required: true }]}>
                <Select>
                  <Option value="Optimal">Optimal Full Adoption (ሙሉ ተጠቃሚ)</Option>
                  <Option value="Review Due">Review Due (ማረጋገጫ የሚያስፈልገው)</Option>
                  <Option value="Partial Adoption">Partial Adoption (በከፊል)</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Administrative Station (Fetched from Database)
          </Divider>
          <Spin spinning={loadingLocations}>
            <Row gutter={16}>
              {/* Zone Select */}
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

              {/* Woreda Select */}
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

              {/* Kebele Select */}
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

      {/* Dossier Inspection Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                backgroundColor: '#e6f7ed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1a5f2c',
                fontSize: 18
              }}
            >
              <InboxOutlined />
            </div>
            <div>
              <span style={{ fontSize: 16, fontWeight: 'bold', color: '#1a5f2c', fontFamily: "'Times New Roman', Times, serif" }}>
                {selectedPackage?.commodity}
              </span>
              <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                FY: {selectedPackage?.fiscal_year} | Season: {selectedPackage?.season}
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
              handleOpenModal(selectedPackage);
            }}
          >
            Edit Deployment
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
        {selectedPackage && (
          <div style={{ paddingTop: 8 }}>
            <Tabs defaultActiveKey="1" type="card">
              <TabPane
                tab={
                  <span>
                    <CheckSquareOutlined />
                    Package Targets & Elements
                  </span>
                }
                key="1"
              >
                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
                  <Descriptions.Item label="Target Commodity">
                    <strong>{selectedPackage.commodity}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Fiscal Year (በጀት ዓመት)">
                    <Tag color="blue">{selectedPackage.fiscal_year}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Production Season">
                    {selectedPackage.season}
                  </Descriptions.Item>
                  <Descriptions.Item label="Adoption Status">
                    <Tag color={selectedPackage.adoption_status === 'Optimal' ? 'success' : 'warning'}>
                      {selectedPackage.adoption_status}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Cultivated Area Under Package">
                    {Number(selectedPackage.target_area_ha || 0).toLocaleString()} Hectares
                  </Descriptions.Item>
                  <Descriptions.Item label="Male Beneficiaries (ወንድ)">
                    <span style={{ color: '#1890ff', fontWeight: 'bold' }}>
                      {Number(selectedPackage.male_beneficiaries || 0).toLocaleString()}
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Female Beneficiaries (ሴት)">
                    <span style={{ color: '#722ed1', fontWeight: 'bold' }}>
                      {Number(selectedPackage.female_beneficiaries || 0).toLocaleString()}
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Total Full Package Farmers">
                    <Tag color="green" style={{ fontSize: 13, fontWeight: 'bold' }}>
                      {(
                        Number(selectedPackage.male_beneficiaries || 0) +
                        Number(selectedPackage.female_beneficiaries || 0)
                      ).toLocaleString()}{' '}
                      Farmers Reached
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>

                <div style={{ marginTop: 16 }}>
                  <strong style={{ fontSize: 13, color: '#1a5f2c' }}>
                    Standard Technology Bundle Components:
                  </strong>
                  <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {(selectedPackage.components || []).map((comp, idx) => (
                      <Tag color="blue" key={idx} style={{ padding: '4px 8px', fontSize: 12 }}>
                        ✓ {comp}
                      </Tag>
                    ))}
                  </div>
                </div>
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
                <Descriptions bordered size="small" column={{ xs: 1, sm: 3 }}>
                  <Descriptions.Item label="Zone">
                    <strong>{extractName(selectedPackage.zone)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Woreda">
                    <strong>{extractName(selectedPackage.woreda)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Kebele Cluster">
                    <span style={{ color: '#1a5f2c', fontWeight: 'bold' }}>
                      {extractName(selectedPackage.kebele)}
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

export default function FullPackageBeneficiaryFarmers() {
  return (
    <App>
      <FullPackageBeneficiaryFarmersContent />
    </App>
  );
}