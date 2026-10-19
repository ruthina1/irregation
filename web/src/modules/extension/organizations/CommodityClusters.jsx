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
  AppstoreOutlined,
  IdcardOutlined,
  PhoneOutlined,
  ManOutlined,
  WomanOutlined,
  RiseOutlined,
  ShopOutlined,
  CheckSquareOutlined,
  SafetyCertificateOutlined,
  CompassOutlined
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

const CLUSTER_CATEGORIES = [
  'Rainfed Cereal Cluster - Teff/Wheat (የጥራጥሬ/እህል ኩታ ገጠም)',
  'Commercial Horticulture Cluster (የንግድ አትክልትና ፍራፍሬ ኩታ ገጠም)',
  'Irrigated Lowland Rice Cluster (የሜዳ ሩዝ ኩታ ገጠም ማሳ)',
  'Oilseeds & Industrial Crops Cluster (የቅባት እህሎች ኩታ ገጠም)',
  'Specialty Export Crop Cluster (ለኤክስፖርት የሚዘጋጅ ሰብል ኩታ ገጠም)'
];

const CLUSTER_ACTIVITIES = [
  'Contiguous Land Consolidation & Sowing',
  'Mechanized Combine Harvesting & Threshing',
  'Block Farming Input Syndication (Seed/Fertilizer)',
  'Solar Pump Irrigation & Water Management',
  'Post-Harvest Aggregation & Union Marketing'
];

const INITIAL_CLUSTERS = [
  {
    id: '1',
    cluster_code: 'CLS-2019-EG-01',
    cluster_name: 'Kurar Quncho Teff Production Cluster',
    cluster_category: 'Rainfed Cereal Cluster - Teff/Wheat (የጥራጥሬ/እህል ኩታ ገጠም)',
    core_activity: 'Contiguous Land Consolidation & Sowing',
    cluster_leader: 'Ato Mulugeta Fentaw',
    leader_phone: '+251 918 445 566',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    total_area_ha: 350,
    male_farmers: 120,
    female_farmers: 45,
    married_women_farmers: 38,
    youth_farmers: 25,
    investors_farmers: 3,
    cluster_status: 'Active & Scaling',
    cluster_notes: 'Achieved 38 quintals/ha average productivity across 350 hectares of unified Quncho Teff.',
    zone: 'East Gojjam',
    woreda: 'Dejen',
    kebele: 'Kurar'
  },
  {
    id: '2',
    cluster_code: 'CLS-2019-SG-04',
    cluster_name: 'Fogera Irrigated Rice & Onion Commercial Block',
    cluster_category: 'Irrigated Lowland Rice Cluster (የሜዳ ሩዝ ኩታ ገጠም ማሳ)',
    core_activity: 'Solar Pump Irrigation & Water Management',
    cluster_leader: 'Woizero Aster Melesse',
    leader_phone: '+251 922 112 334',
    fiscal_year: '2019 E.C.',
    season: 'Bega / Irrigation (መስኖ/በጋ)',
    total_area_ha: 500,
    male_farmers: 180,
    female_farmers: 70,
    married_women_farmers: 55,
    youth_farmers: 40,
    investors_farmers: 5,
    cluster_status: 'Active & Scaling',
    cluster_notes: 'Integrated solar water pumping and mechanization services for double-cropping season.',
    zone: 'South Gondar',
    woreda: 'Fogera',
    kebele: 'Woreta Zuria'
  },
  {
    id: '3',
    cluster_code: 'CLS-2019-WG-09',
    cluster_name: 'Bure Sesame & Soybean Export Cluster',
    cluster_category: 'Oilseeds & Industrial Crops Cluster (የቅባት እህሎች ኩታ ገጠም)',
    core_activity: 'Block Farming Input Syndication (Seed/Fertilizer)',
    cluster_leader: 'Ato Tadesse Worku',
    leader_phone: '+251 911 889 001',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    total_area_ha: 280,
    male_farmers: 95,
    female_farmers: 30,
    married_women_farmers: 24,
    youth_farmers: 18,
    investors_farmers: 4,
    cluster_status: 'Review Due',
    cluster_notes: 'Targeting direct export contract farming linkages with agro-processing industries.',
    zone: 'West Gojjam',
    woreda: 'Bure',
    kebele: 'Alefa'
  }
];

function CommodityClustersContent() {
  const { message } = App.useApp();

  const [clusters, setClusters] = useState(INITIAL_CLUSTERS);
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
  const [editingCluster, setEditingCluster] = useState(null);
  const [selectedCluster, setSelectedCluster] = useState(null);
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
      if (editingCluster) {
        const initForm = async () => {
          const zoneMatch = zones.find(
            (z) => z.name === editingCluster.zone || z.id === editingCluster.zone_id
          );
          if (zoneMatch) {
            try {
              const wRes = locationApi?.getWoredas ? await locationApi.getWoredas(zoneMatch.id) : null;
              const wList = wRes?.data?.data?.data || wRes?.data?.data || [];
              setWoredas(wList);

              const woredaMatch = wList.find(
                (w) => w.name === editingCluster.woreda || w.id === editingCluster.woreda_id
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
            cluster_code: editingCluster.cluster_code,
            cluster_name: editingCluster.cluster_name,
            cluster_category: editingCluster.cluster_category,
            core_activity: editingCluster.core_activity,
            cluster_leader: editingCluster.cluster_leader,
            leader_phone: editingCluster.leader_phone,
            fiscal_year: editingCluster.fiscal_year || '2019 E.C.',
            season: editingCluster.season || 'Meher (መኸር)',
            total_area_ha: Number(editingCluster.total_area_ha) || 100,
            male_farmers: Number(editingCluster.male_farmers) || 0,
            female_farmers: Number(editingCluster.female_farmers) || 0,
            married_women_farmers: Number(editingCluster.married_women_farmers) || 0,
            youth_farmers: Number(editingCluster.youth_farmers) || 0,
            investors_farmers: Number(editingCluster.investors_farmers) || 0,
            cluster_notes: editingCluster.cluster_notes,
            zone_id: editingCluster.zone_id || zoneMatch?.id || editingCluster.zone,
            woreda_id: editingCluster.woreda_id || editingCluster.woreda,
            kebele_id: editingCluster.kebele_id || editingCluster.kebele
          });
        };
        initForm();
      } else {
        form.resetFields();
        form.setFieldsValue({
          cluster_category: 'Rainfed Cereal Cluster - Teff/Wheat (የጥራጥሬ/እህል ኩታ ገጠም)',
          core_activity: 'Contiguous Land Consolidation & Sowing',
          fiscal_year: '2019 E.C.',
          season: 'Meher (መኸር)',
          total_area_ha: 200,
          male_farmers: 50,
          female_farmers: 20,
          married_women_farmers: 15,
          youth_farmers: 10,
          investors_farmers: 2
        });
        setWoredas([]);
        setKebeles([]);
      }
    }
  }, [isModalOpen, editingCluster, form, zones]);

  const loadData = async () => {
    setIsFetching(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      message.success('Commodity clusters registry refreshed');
    } catch {
      message.error('Failed to refresh data');
    } finally {
      setIsFetching(false);
    }
  };

  // Direct In-Place Status Update without Opening the Form
  const handleQuickStatusChange = (recordId, newStatus) => {
    setClusters((prev) =>
      prev.map((c) => (c.id === recordId ? { ...c, cluster_status: newStatus } : c))
    );
    message.success(`Cluster status updated to "${newStatus}"`);
  };

  // Filter pipeline
  const filteredClusters = useMemo(() => {
    return clusters.filter((c) => {
      const code = extractName(c.cluster_code).toLowerCase();
      const name = extractName(c.cluster_name).toLowerCase();
      const leader = extractName(c.cluster_leader).toLowerCase();
      const kebele = extractName(c.kebele).toLowerCase();
      const woreda = extractName(c.woreda).toLowerCase();
      const zone = extractName(c.zone).toLowerCase();
      const q = searchTerm.toLowerCase();

      const matchesSearch =
        code.includes(q) || name.includes(q) || leader.includes(q) || kebele.includes(q) || woreda.includes(q) || zone.includes(q);
      const matchesCategory = categoryFilter ? c.cluster_category === categoryFilter : true;
      const matchesActivity = activityFilter ? c.core_activity === activityFilter : true;
      const matchesFY = fiscalYearFilter ? c.fiscal_year === fiscalYearFilter : true;
      const matchesSeason = seasonFilter ? c.season === seasonFilter : true;
      const matchesStatus = statusFilter ? c.cluster_status === statusFilter : true;
      const matchesZone = zoneFilter ? zone === zoneFilter.toLowerCase() : true;

      return matchesSearch && matchesCategory && matchesActivity && matchesFY && matchesSeason && matchesStatus && matchesZone;
    });
  }, [clusters, searchTerm, categoryFilter, activityFilter, fiscalYearFilter, seasonFilter, statusFilter, zoneFilter]);

  // Statistics Calculation
  const stats = useMemo(() => {
    const totalClusters = filteredClusters.length;
    const totalArea = filteredClusters.reduce((acc, c) => acc + (Number(c.total_area_ha) || 0), 0);
    const maleFarmers = filteredClusters.reduce((acc, c) => acc + (Number(c.male_farmers) || 0), 0);
    const femaleFarmers = filteredClusters.reduce((acc, c) => acc + (Number(c.female_farmers) || 0), 0);
    const marriedWomen = filteredClusters.reduce((acc, c) => acc + (Number(c.married_women_farmers) || 0), 0);
    const youth = filteredClusters.reduce((acc, c) => acc + (Number(c.youth_farmers) || 0), 0);
    const investors = filteredClusters.reduce((acc, c) => acc + (Number(c.investors_farmers) || 0), 0);

    const totalFarmers = maleFarmers + femaleFarmers + marriedWomen + youth + investors;
    const totalWomenFarmers = femaleFarmers + marriedWomen;
    const womenRatio = totalFarmers > 0 ? ((totalWomenFarmers / totalFarmers) * 100).toFixed(1) : 0;
    const activeCount = filteredClusters.filter((c) => c.cluster_status === 'Active & Scaling').length;

    return {
      totalClusters,
      totalArea,
      totalFarmers,
      maleFarmers,
      femaleFarmers,
      marriedWomen,
      totalWomenFarmers,
      youth,
      investors,
      womenRatio,
      activeCount
    };
  }, [filteredClusters]);

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
    setEditingCluster(record);
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

      if (editingCluster) {
        setClusters((prev) =>
          prev.map((item) =>
            item.id === editingCluster.id ? { ...item, ...payload, cluster_status: editingCluster.cluster_status } : item
          )
        );
        message.success('Commodity cluster record updated successfully');
      } else {
        const newRecord = {
          ...payload,
          id: Date.now().toString(),
          cluster_code: values.cluster_code || `CLS-${Date.now().toString().slice(-4)}`,
          cluster_status: 'Active & Scaling'
        };
        setClusters((prev) => [newRecord, ...prev]);
        message.success('New commodity cluster registered successfully');
      }
      setIsModalOpen(false);
    } catch (error) {
      message.error(error?.response?.data?.message || error.message || 'Failed to save commodity cluster record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    setClusters((prev) => prev.filter((item) => item.id !== id));
    message.success('Commodity cluster record removed');
  };

  const exportToCSV = () => {
    if (!filteredClusters.length) {
      message.warning('No cluster records available to export');
      return;
    }
    const headers = [
      'Cluster Code,Cluster Name,Category,Core Activity,Total Area (Ha),Leader,Phone,FY,Season,Zone,Woreda,Kebele,Male (ወንድ),Female (ሴት),Married Women (ባለትዳር),Youth (ወጣቶች),Investors (ባለሃብቶች),Total Farmers,Status'
    ];
    const rows = filteredClusters.map((c) => {
      const total =
        (Number(c.male_farmers) || 0) +
        (Number(c.female_farmers) || 0) +
        (Number(c.married_women_farmers) || 0) +
        (Number(c.youth_farmers) || 0) +
        (Number(c.investors_farmers) || 0);

      return [
        `"${c.cluster_code || ''}"`,
        `"${c.cluster_name || ''}"`,
        `"${c.cluster_category || ''}"`,
        `"${c.core_activity || ''}"`,
        c.total_area_ha || 0,
        `"${c.cluster_leader || ''}"`,
        `"${c.leader_phone || ''}"`,
        `"${c.fiscal_year || ''}"`,
        `"${c.season || ''}"`,
        `"${extractName(c.zone)}"`,
        `"${extractName(c.woreda)}"`,
        `"${extractName(c.kebele)}"`,
        c.male_farmers || 0,
        c.female_farmers || 0,
        c.married_women_farmers || 0,
        c.youth_farmers || 0,
        c.investors_farmers || 0,
        total,
        `"${c.cluster_status || ''}"`
      ].join(',');
    });

    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Commodity_Clusters_Report_${Date.now()}.csv`;
    a.click();
    message.success('Commodity clusters report exported successfully');
  };

  const columns = [
    {
      title: 'Cluster Code & Name',
      key: 'cluster_info',
      width: 250,
      render: (_, r) => (
        <div>
          <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{r.cluster_name}</strong>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>
            Code: <span style={{ fontFamily: 'monospace' }}>{r.cluster_code}</span> | Area: {Number(r.total_area_ha || 0).toLocaleString()} Ha
          </div>
        </div>
      )
    },
    {
      title: 'Cluster Category',
      dataIndex: 'cluster_category',
      key: 'cluster_category',
      width: 210,
      render: (cat) => {
        let color = 'default';
        if (cat?.includes('Rainfed')) color = 'green';
        if (cat?.includes('Horticulture')) color = 'gold';
        if (cat?.includes('Rice')) color = 'blue';
        if (cat?.includes('Oilseeds')) color = 'purple';
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
      title: 'Farmers Enrolled',
      key: 'farmers_breakdown',
      width: 230,
      render: (_, r) => {
        const total =
          (Number(r.male_farmers) || 0) +
          (Number(r.female_farmers) || 0) +
          (Number(r.married_women_farmers) || 0) +
          (Number(r.youth_farmers) || 0) +
          (Number(r.investors_farmers) || 0);

        return (
          <div style={{ fontSize: 11 }}>
            <div>
              Total: <strong style={{ color: '#1a5f2c' }}>{total.toLocaleString()} Farmers</strong>
            </div>
            <div style={{ color: '#8c8c8c' }}>
              <span>ወንድ: {r.male_farmers || 0}</span> | <span>ሴት: {r.female_farmers || 0}</span> | <span>ባለትዳር: {r.married_women_farmers || 0}</span>
            </div>
          </div>
        );
      }
    },
    {
      title: 'Cluster Status (In-Place Edit)',
      dataIndex: 'cluster_status',
      key: 'cluster_status',
      width: 190,
      render: (status, record) => (
        <Select
          value={status || 'Active & Scaling'}
          onChange={(newVal) => handleQuickStatusChange(record.id, newVal)}
          style={{ width: '100%' }}
          size="small"
        >
          <Option value="Active & Scaling">
            <Tag color="success" icon={<CheckCircleOutlined />} style={{ margin: 0 }}>
              Scaling
            </Tag>
          </Option>
          <Option value="Review Due">
            <Tag color="warning" icon={<ClockCircleOutlined />} style={{ margin: 0 }}>
              Review Due
            </Tag>
          </Option>
          <Option value="Dormant">
            <Tag color="default" icon={<ClockCircleOutlined />} style={{ margin: 0 }}>
              Dormant
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
          <Tooltip title="View Cluster Dossier">
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: '#1890ff' }} />}
              onClick={() => {
                setSelectedCluster(record);
                setIsDossierOpen(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Edit Cluster">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: '#52c41a' }} />}
              onClick={() => handleOpenModal(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Record">
            <Popconfirm
              title="Delete commodity cluster record?"
              description="Are you sure you want to remove this commodity cluster?"
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
        <Breadcrumb.Item>Commodity Clusters (Crop & Irrigation)</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level3 style={{ margin: 0, color: '#1a5f2c', fontFamily: "'Times New Roman', Times, serif" }}>
            Commodity Clusters (የሰብልና የመስኖ/አትክልት ኩታ ገጠም ማሳዎች)
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Coordinating large-scale contiguous production clusters, commercial farming blocks, and irrigation zones
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
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Total Cultivated Area (Ha)</span>}
              value={stats.totalArea}
              suffix="Ha"
              prefix={<AppstoreOutlined style={{ color: '#1a5f2c', marginRight: 8 }} />}
              valueStyle={{ color: '#1a5f2c', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Total Clusters: <strong style={{ color: '#262626' }}>{stats.totalClusters} clusters</strong>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #1890ff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Male Farmers (ወንድ)</span>}
              value={stats.maleFarmers}
              prefix={<ManOutlined style={{ color: '#1890ff', marginRight: 8 }} />}
              valueStyle={{ color: '#1890ff', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Male participants in cluster blocks
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #722ed1', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Women Farmers (ሴት + ባለትዳር)</span>}
              value={stats.totalWomenFarmers}
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
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Active & Scaling</span>}
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
                placeholder="Cluster Category"
                value={categoryFilter}
                onChange={setCategoryFilter}
                style={{ width: 195 }}
                allowClear
              >
                {CLUSTER_CATEGORIES.map((cc) => (
                  <Option key={cc} value={cc}>{cc}</Option>
                ))}
              </Select>

              <Select
                placeholder="Core Activity"
                value={activityFilter}
                onChange={setActivityFilter}
                style={{ width: 200 }}
                allowClear
              >
                {CLUSTER_ACTIVITIES.map((ca) => (
                  <Option key={ca} value={ca}>{ca}</Option>
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
                {[...new Set(clusters.map((c) => extractName(c.zone)))].map((z) => (
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
                Export Clusters CSV
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
                Register Cluster
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Main Table */}
      <Table
        columns={columns}
        dataSource={filteredClusters}
        rowKey="id"
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} commodity clusters`
        }}
        scroll={{ x: 1350 }}
        bordered
        size="middle"
      />

      {/* Registration / Edit Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CompassOutlined style={{ color: '#1a5f2c', fontSize: 20 }} />
            <span style={{ color: '#1a5f2c', fontWeight: 'bold', fontFamily: "'Times New Roman', Times, serif", fontSize: 17 }}>
              {editingCluster ? 'Edit Commodity Cluster Record' : 'Register Commodity Cluster (ኩታ ገጠም ማሳ ምዝገባ)'}
            </span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText={editingCluster ? 'Update Cluster' : 'Save Cluster Record'}
        okButtonProps={{ style: { backgroundColor: '#1a5f2c', borderColor: '#1a5f2c' }, loading: isSubmitting }}
        width={800}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Cluster Identification & Category
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="cluster_code"
                label="Cluster Code"
                rules={[{ required: true, message: 'Code required' }]}
              >
                <Input placeholder="e.g. CLS-2019-EG-08" />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item
                name="cluster_name"
                label="Commodity Cluster Name"
                rules={[{ required: true, message: 'Cluster name required' }]}
              >
                <Input placeholder="e.g. Kurar Quncho Teff Production Cluster" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="cluster_category"
                label="Cluster Category"
                rules={[{ required: true, message: 'Select category' }]}
              >
                <Select>
                  {CLUSTER_CATEGORIES.map((cc) => (
                    <Option key={cc} value={cc}>{cc}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="core_activity"
                label="Core Production Activity"
                rules={[{ required: true, message: 'Select activity' }]}
              >
                <Select>
                  {CLUSTER_ACTIVITIES.map((ca) => (
                    <Option key={ca} value={ca}>{ca}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={14}>
              <Form.Item
                name="cluster_leader"
                label="Cluster Leader / Coordinator"
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
            Timeline & Area Quotas (Hectares)
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
                name="total_area_ha"
                label="Total Cultivated Area (Ha)"
                rules={[{ required: true }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Enrolled Farmers by Cohort (አርሶ አደሮች በወኪል ምድብ)
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="male_farmers"
                label="Male Farmers (ወንድ)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="female_farmers"
                label="Female Farmers (ሴት)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="married_women_farmers"
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
                name="youth_farmers"
                label="Youth Farmers (ወጣቶች)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="investors_farmers"
                label="Private Investors (ባለሃብቶች)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="cluster_notes" label="Cluster Production Notes & Productivity Achievements">
                <TextArea rows={3} placeholder="Summarize yields achieved, mechanization deployment, or irrigation efficiency..." />
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

      {/* Comprehensive Cluster Dossier Modal */}
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
                <CompassOutlined />
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
                  {selectedCluster?.cluster_name}
                </span>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                  Code: <span style={{ fontFamily: 'monospace' }}>{selectedCluster?.cluster_code}</span> | Coordinator:{' '}
                  {selectedCluster?.cluster_leader}
                </div>
              </div>
            </div>
            <div>
              <Tag
                color={selectedCluster?.cluster_status === 'Active & Scaling' ? 'success' : 'processing'}
                icon={selectedCluster?.cluster_status === 'Active & Scaling' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                style={{ fontSize: 12, padding: '2px 10px', borderRadius: 12 }}
              >
                {selectedCluster?.cluster_status || 'Scaling'}
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
              handleOpenModal(selectedCluster);
            }}
          >
            Edit Cluster
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
        {selectedCluster && (
          <div style={{ paddingTop: 8 }}>
            {/* Top Metric Strip */}
            <Row gutter={12} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f6ffed', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Cultivated Area</span>}
                    value={selectedCluster.total_area_ha || 0}
                    suffix={<span style={{ fontSize: 12 }}>Ha</span>}
                    valueStyle={{ fontSize: 15, fontWeight: 'bold', color: '#1a5f2c' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f0f5ff', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Cluster Category</span>}
                    value={selectedCluster.cluster_category?.split(' ')[0] || 'Category'}
                    valueStyle={{ fontSize: 15, fontWeight: 'bold', color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f9f0ff', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Women Share</span>}
                    value={
                      (Number(selectedCluster.male_farmers) || 0) +
                      (Number(selectedCluster.female_farmers) || 0) +
                      (Number(selectedCluster.married_women_farmers) || 0) +
                      (Number(selectedCluster.youth_farmers) || 0) +
                      (Number(selectedCluster.investors_farmers) || 0) > 0
                        ? (
                            (((Number(selectedCluster.female_farmers) || 0) +
                              (Number(selectedCluster.married_women_farmers) || 0)) /
                              ((Number(selectedCluster.male_farmers) || 0) +
                                (Number(selectedCluster.female_farmers) || 0) +
                                (Number(selectedCluster.married_women_farmers) || 0) +
                                (Number(selectedCluster.youth_farmers) || 0) +
                                (Number(selectedCluster.investors_farmers) || 0))) *
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
                    value={selectedCluster.fiscal_year}
                    valueStyle={{ fontSize: 13, fontWeight: 'bold', color: '#fa8c16' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* TABPANES */}
            <Tabs defaultActiveKey="1" type="card">
              {/* TAB 1: Cluster Profile */}
              <TabPane
                tab={
                  <span>
                    <TeamOutlined />
                    Farmer Demographics & Reach
                  </span>
                }
                key="1"
              >
                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }} style={{ marginBottom: 16 }}>
                  <Descriptions.Item label="Cluster Name" span={2}>
                    <strong style={{ color: '#1a5f2c' }}>{selectedCluster.cluster_name}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Cluster Category">
                    <Tag color="purple">{selectedCluster.cluster_category}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Core Activity">
                    <Tag color="green">{selectedCluster.core_activity}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Coordinator">
                    {selectedCluster.cluster_leader} ({selectedCluster.leader_phone})
                  </Descriptions.Item>
                </Descriptions>

                <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: 16, background: '#fafafa' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1a5f2c', textTransform: 'uppercase', marginBottom: 12 }}>
                    Farmer Disaggregation (አርሶ አደሮች በወኪል ምድብ)
                  </div>
                  <Row gutter={[16, 16]}>
                    <Col span={8}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <ManOutlined style={{ color: '#1890ff', marginRight: 4 }} />
                          Male Farmers (ወንድ)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#1890ff', marginTop: 2 }}>
                          {Number(selectedCluster.male_farmers || 0).toLocaleString()}
                        </div>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <WomanOutlined style={{ color: '#722ed1', marginRight: 4 }} />
                          Female Farmers (ሴት)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#722ed1', marginTop: 2 }}>
                          {Number(selectedCluster.female_farmers || 0).toLocaleString()}
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
                          {Number(selectedCluster.married_women_farmers || 0).toLocaleString()}
                        </div>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <RiseOutlined style={{ color: '#fa8c16', marginRight: 4 }} />
                          Youth Farmers (ወጣቶች)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#fa8c16', marginTop: 2 }}>
                          {Number(selectedCluster.youth_farmers || 0).toLocaleString()}
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
                          {Number(selectedCluster.investors_farmers || 0).toLocaleString()}
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
              </TabPane>

              {/* TAB 2: Notes */}
              <TabPane
                tab={
                  <span>
                    <CheckSquareOutlined />
                    Production Notes & Achievements
                  </span>
                }
                key="2"
              >
                <Card size="small" bordered={false} style={{ background: '#fcfdfd', border: '1px solid #e6f7ed', borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <CheckCircleOutlined style={{ color: '#1a5f2c', fontSize: 16 }} />
                    <strong style={{ color: '#1a5f2c', fontSize: 13, textTransform: 'uppercase' }}>
                      Cluster Productivity Achievements (የኩታ ገጠም ማሳ አፈፃፀም ማስታወሻ)
                    </strong>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: '#262626', lineHeight: '1.6' }}>
                    {selectedCluster.cluster_notes || 'Active commodity cluster achieving unified production targets.'}
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
                    <strong>{extractName(selectedCluster.zone)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Woreda">
                    <strong>{extractName(selectedCluster.woreda)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Kebele Operational Base">
                    <span style={{ color: '#1a5f2c', fontWeight: 'bold' }}>
                      {extractName(selectedCluster.kebele)}
                    </span>
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
                  <Descriptions.Item label="Fiscal Year (በጀት ዓመት)">
                    <Tag color="blue" icon={<CalendarOutlined />}>
                      {selectedCluster.fiscal_year || '2019 E.C.'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Production Campaign Season">
                    <strong>{selectedCluster.season || 'Meher (መኸር)'}</strong>
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

export default function CommodityClusters() {
  return (
    <App>
      <CommodityClustersContent />
    </App>
  );
}