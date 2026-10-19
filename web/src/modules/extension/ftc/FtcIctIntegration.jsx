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
  LaptopOutlined,
  IdcardOutlined,
  PhoneOutlined,
  ManOutlined,
  WomanOutlined,
  RiseOutlined,
  ShopOutlined,
  CheckSquareOutlined,
  SafetyCertificateOutlined,
  WifiOutlined
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

const ICT_CATEGORIES = [
  'Digital Tablet & Extension App Deployment (የታብሌትና የሞባይል መተግበሪያ)',
  'Broadband / 4G Internet Connectivity Hub (የኢንተርኔትና ብሮድባንድ ግንኙነት)',
  'Solar Charging & Power Station (የሶላር ኃይል መሙያ ጣቢያ)',
  'Farmer Digital ID & Registry Terminal (የአርሶ አደር ዲጂታል መታወቂያ ተርሚናል)',
  'Audio-Visual Training Unit (የድምጽና ምስል ማሰልጠኛ መሣሪያ)'
];

const ICT_ACTIVITIES = [
  'DA Digital Tablet Data Sync & Reporting',
  'Farmer Digital Advisory SMS / IVR Broadcast',
  'Electronic Weather & Market Price Display',
  'Online Extension Module & Video Training',
  'Biometric Farmer Registration & Profiling'
];

const INITIAL_ICT_RECORDS = [
  {
    id: '1',
    ict_code: 'ICT-2019-EG-01',
    ict_title: 'Kurar FTC Digital Hub & DA Tablet Sync Station',
    ict_category: 'Digital Tablet & Extension App Deployment (የታብሌትና የሞባይል መተግበሪያ)',
    core_activity: 'DA Digital Tablet Data Sync & Reporting',
    ict_coordinator: 'Ato Mulugeta Fentaw (Digital DA)',
    coordinator_phone: '+251 918 445 566',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    tablets_allocated: 5,
    tablets_functional: 5,
    internet_bandwidth_mbps: 20,
    male_users: 85,
    female_users: 55,
    married_women_users: 45,
    youth_users: 40,
    investors_users: 4,
    ict_status: 'Fully Operational',
    ict_notes: 'Equipped with 5 operational tablets syncing real-time crop monitoring reports to woreda server via 4G.',
    zone: 'East Gojjam',
    woreda: 'Dejen',
    kebele: 'Kurar'
  },
  {
    id: '2',
    ict_code: 'ICT-2019-SG-04',
    ict_title: 'Woreta Zuria Broadband & Weather Kiosk',
    ict_category: 'Broadband / 4G Internet Connectivity Hub (የኢንተርኔትና ብሮድባንድ ግንኙነት)',
    core_activity: 'Electronic Weather & Market Price Display',
    ict_coordinator: 'Woizero Aster Melesse',
    coordinator_phone: '+251 922 112 334',
    fiscal_year: '2019 E.C.',
    season: 'Bega / Irrigation (መስኖ/በጋ)',
    tablets_allocated: 4,
    tablets_functional: 3,
    internet_bandwidth_mbps: 50,
    male_users: 110,
    female_users: 70,
    married_women_users: 58,
    youth_users: 50,
    investors_users: 6,
    ict_status: 'Fully Operational',
    ict_notes: 'Broadband internet active; broadcasting daily commodity market prices and weather forecasts on display screen.',
    zone: 'South Gondar',
    woreda: 'Fogera',
    kebele: 'Woreta Zuria'
  },
  {
    id: '3',
    ict_code: 'ICT-2019-WG-09',
    ict_title: 'Alefa FTC Biometric ID & Farmer Registry Terminal',
    ict_category: 'Farmer Digital ID & Registry Terminal (የአርሶ አደር ዲጂታል መታወቂያ ተርሚናል)',
    core_activity: 'Biometric Farmer Registration & Profiling',
    ict_coordinator: 'Ato Tadesse Worku',
    coordinator_phone: '+251 911 889 001',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    tablets_allocated: 3,
    tablets_functional: 2,
    internet_bandwidth_mbps: 10,
    male_users: 65,
    female_users: 40,
    married_women_users: 32,
    youth_users: 25,
    investors_users: 2,
    ict_status: 'Maintenance Required',
    ict_notes: 'Biometric fingerprint scanner requires firmware update; connectivity temporarily degraded.',
    zone: 'West Gojjam',
    woreda: 'Bure',
    kebele: 'Alefa'
  }
];

function FtcIctIntegrationContent() {
  const { message } = App.useApp();

  const [ictRecords, setIctRecords] = useState(INITIAL_ICT_RECORDS);
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
  const [editingIct, setEditingIct] = useState(null);
  const [selectedIct, setSelectedIct] = useState(null);
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
      if (editingIct) {
        const initForm = async () => {
          const zoneMatch = zones.find(
            (z) => z.name === editingIct.zone || z.id === editingIct.zone_id
          );
          if (zoneMatch) {
            try {
              const wRes = locationApi?.getWoredas ? await locationApi.getWoredas(zoneMatch.id) : null;
              const wList = wRes?.data?.data?.data || wRes?.data?.data || [];
              setWoredas(wList);

              const woredaMatch = wList.find(
                (w) => w.name === editingIct.woreda || w.id === editingIct.woreda_id
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
            ict_code: editingIct.ict_code,
            ict_title: editingIct.ict_title,
            ict_category: editingIct.ict_category,
            core_activity: editingIct.core_activity,
            ict_coordinator: editingIct.ict_coordinator,
            coordinator_phone: editingIct.coordinator_phone,
            fiscal_year: editingIct.fiscal_year || '2019 E.C.',
            season: editingIct.season || 'Meher (መኸር)',
            tablets_allocated: Number(editingIct.tablets_allocated) || 4,
            tablets_functional: Number(editingIct.tablets_functional) || 4,
            internet_bandwidth_mbps: Number(editingIct.internet_bandwidth_mbps) || 20,
            male_users: Number(editingIct.male_users) || 0,
            female_users: Number(editingIct.female_users) || 0,
            married_women_users: Number(editingIct.married_women_users) || 0,
            youth_users: Number(editingIct.youth_users) || 0,
            investors_users: Number(editingIct.investors_users) || 0,
            ict_notes: editingIct.ict_notes,
            zone_id: editingIct.zone_id || zoneMatch?.id || editingIct.zone,
            woreda_id: editingIct.woreda_id || editingIct.woreda,
            kebele_id: editingIct.kebele_id || editingIct.kebele
          });
        };
        initForm();
      } else {
        form.resetFields();
        form.setFieldsValue({
          ict_category: 'Digital Tablet & Extension App Deployment (የታብሌትና የሞባይል መተግበሪያ)',
          core_activity: 'DA Digital Tablet Data Sync & Reporting',
          fiscal_year: '2019 E.C.',
          season: 'Meher (መኸር)',
          tablets_allocated: 4,
          tablets_functional: 4,
          internet_bandwidth_mbps: 20,
          male_users: 50,
          female_users: 30,
          married_women_users: 25,
          youth_users: 20,
          investors_users: 2
        });
        setWoredas([]);
        setKebeles([]);
      }
    }
  }, [isModalOpen, editingIct, form, zones]);

  const loadData = async () => {
    setIsFetching(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      message.success('FTC ICT utilization registry refreshed');
    } catch {
      message.error('Failed to refresh data');
    } finally {
      setIsFetching(false);
    }
  };

  // Direct In-Place Status Update without Opening the Form
  const handleQuickStatusChange = (recordId, newStatus) => {
    setIctRecords((prev) =>
      prev.map((i) => (i.id === recordId ? { ...i, ict_status: newStatus } : i))
    );
    message.success(`ICT status updated to "${newStatus}"`);
  };

  // Filter pipeline
  const filteredIctRecords = useMemo(() => {
    return ictRecords.filter((i) => {
      const code = extractName(i.ict_code).toLowerCase();
      const title = extractName(i.ict_title).toLowerCase();
      const coord = extractName(i.ict_coordinator).toLowerCase();
      const kebele = extractName(i.kebele).toLowerCase();
      const woreda = extractName(i.woreda).toLowerCase();
      const zone = extractName(i.zone).toLowerCase();
      const q = searchTerm.toLowerCase();

      const matchesSearch =
        code.includes(q) || title.includes(q) || coord.includes(q) || kebele.includes(q) || woreda.includes(q) || zone.includes(q);
      const matchesCategory = categoryFilter ? i.ict_category === categoryFilter : true;
      const matchesActivity = activityFilter ? i.core_activity === activityFilter : true;
      const matchesFY = fiscalYearFilter ? i.fiscal_year === fiscalYearFilter : true;
      const matchesSeason = seasonFilter ? i.season === seasonFilter : true;
      const matchesStatus = statusFilter ? i.ict_status === statusFilter : true;
      const matchesZone = zoneFilter ? zone === zoneFilter.toLowerCase() : true;

      return matchesSearch && matchesCategory && matchesActivity && matchesFY && matchesSeason && matchesStatus && matchesZone;
    });
  }, [ictRecords, searchTerm, categoryFilter, activityFilter, fiscalYearFilter, seasonFilter, statusFilter, zoneFilter]);

  // Statistics Calculation
  const stats = useMemo(() => {
    const totalRecords = filteredIctRecords.length;
    const totalTablets = filteredIctRecords.reduce((acc, i) => acc + (Number(i.tablets_allocated) || 0), 0);
    const totalFunctional = filteredIctRecords.reduce((acc, i) => acc + (Number(i.tablets_functional) || 0), 0);
    const maleUsers = filteredIctRecords.reduce((acc, i) => acc + (Number(i.male_users) || 0), 0);
    const femaleUsers = filteredIctRecords.reduce((acc, i) => acc + (Number(i.female_users) || 0), 0);
    const marriedWomen = filteredIctRecords.reduce((acc, i) => acc + (Number(i.married_women_users) || 0), 0);
    const youth = filteredIctRecords.reduce((acc, i) => acc + (Number(i.youth_users) || 0), 0);
    const investors = filteredIctRecords.reduce((acc, i) => acc + (Number(i.investors_users) || 0), 0);

    const totalUsers = maleUsers + femaleUsers + marriedWomen + youth + investors;
    const totalWomenUsers = femaleUsers + marriedWomen;
    const womenRatio = totalUsers > 0 ? ((totalWomenUsers / totalUsers) * 100).toFixed(1) : 0;
    const operationalCount = filteredIctRecords.filter((i) => i.ict_status === 'Fully Operational').length;

    return {
      totalRecords,
      totalTablets,
      totalFunctional,
      totalUsers,
      maleUsers,
      femaleUsers,
      marriedWomen,
      totalWomenUsers,
      youth,
      investors,
      womenRatio,
      operationalCount
    };
  }, [filteredIctRecords]);

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
    setEditingIct(record);
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

      if (editingIct) {
        setIctRecords((prev) =>
          prev.map((item) =>
            item.id === editingIct.id ? { ...item, ...payload, ict_status: editingIct.ict_status } : item
          )
        );
        message.success('FTC ICT utilization record updated successfully');
      } else {
        const newRecord = {
          ...payload,
          id: Date.now().toString(),
          ict_code: values.ict_code || `ICT-${Date.now().toString().slice(-4)}`,
          ict_status: 'Fully Operational'
        };
        setIctRecords((prev) => [newRecord, ...prev]);
        message.success('New FTC ICT station registered successfully');
      }
      setIsModalOpen(false);
    } catch (error) {
      message.error(error?.response?.data?.message || error.message || 'Failed to save ICT record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    setIctRecords((prev) => prev.filter((item) => item.id !== id));
    message.success('FTC ICT record removed');
  };

  const exportToCSV = () => {
    if (!filteredIctRecords.length) {
      message.warning('No ICT records available to export');
      return;
    }
    const headers = [
      'ICT Code,Title,Category,Core Activity,Tablets Allocated,Tablets Functional,Internet Mbps,Coordinator,Phone,FY,Season,Zone,Woreda,Kebele,Male (ወንድ),Female (ሴት),Married Women (ባለትዳር),Youth (ወጣቶች),Investors (ባለሃብቶች),Total Users,Status'
    ];
    const rows = filteredIctRecords.map((i) => {
      const total =
        (Number(i.male_users) || 0) +
        (Number(i.female_users) || 0) +
        (Number(i.married_women_users) || 0) +
        (Number(i.youth_users) || 0) +
        (Number(i.investors_users) || 0);

      return [
        `"${i.ict_code || ''}"`,
        `"${i.ict_title || ''}"`,
        `"${i.ict_category || ''}"`,
        `"${i.core_activity || ''}"`,
        i.tablets_allocated || 0,
        i.tablets_functional || 0,
        i.internet_bandwidth_mbps || 0,
        `"${i.ict_coordinator || ''}"`,
        `"${i.coordinator_phone || ''}"`,
        `"${i.fiscal_year || ''}"`,
        `"${i.season || ''}"`,
        `"${extractName(i.zone)}"`,
        `"${extractName(i.woreda)}"`,
        `"${extractName(i.kebele)}"`,
        i.male_users || 0,
        i.female_users || 0,
        i.married_women_users || 0,
        i.youth_users || 0,
        i.investors_users || 0,
        total,
        `"${i.ict_status || ''}"`
      ].join(',');
    });

    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FTC_ICT_Utilization_Report_${Date.now()}.csv`;
    a.click();
    message.success('FTC ICT report exported successfully');
  };

  const columns = [
    {
      title: 'ICT Code & Title',
      key: 'ict_info',
      width: 250,
      render: (_, r) => (
        <div>
          <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{r.ict_title}</strong>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>
            Code: <span style={{ fontFamily: 'monospace' }}>{r.ict_code}</span> | Coordinator: {r.ict_coordinator}
          </div>
        </div>
      )
    },
    {
      title: 'ICT Category',
      dataIndex: 'ict_category',
      key: 'ict_category',
      width: 210,
      render: (cat) => {
        let color = 'default';
        if (cat?.includes('Tablet')) color = 'blue';
        if (cat?.includes('Broadband')) color = 'green';
        if (cat?.includes('Solar')) color = 'gold';
        if (cat?.includes('Farmer Digital ID')) color = 'purple';
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
      title: 'Users Enrolled',
      key: 'users_breakdown',
      width: 230,
      render: (_, r) => {
        const total =
          (Number(r.male_users) || 0) +
          (Number(r.female_users) || 0) +
          (Number(r.married_women_users) || 0) +
          (Number(r.youth_users) || 0) +
          (Number(r.investors_users) || 0);

        return (
          <div style={{ fontSize: 11 }}>
            <div>
              Total: <strong style={{ color: '#1a5f2c' }}>{total.toLocaleString()} Users</strong>
            </div>
            <div style={{ color: '#8c8c8c' }}>
              <span>ወንድ: {r.male_users || 0}</span> | <span>ሴት: {r.female_users || 0}</span> | <span>ባለትዳር: {r.married_women_users || 0}</span>
            </div>
          </div>
        );
      }
    },
    {
      title: 'ICT Status (In-Place Edit)',
      dataIndex: 'ict_status',
      key: 'ict_status',
      width: 190,
      render: (status, record) => (
        <Select
          value={status || 'Fully Operational'}
          onChange={(newVal) => handleQuickStatusChange(record.id, newVal)}
          style={{ width: '100%' }}
          size="small"
        >
          <Option value="Fully Operational">
            <Tag color="success" icon={<CheckCircleOutlined />} style={{ margin: 0 }}>
              Operational
            </Tag>
          </Option>
          <Option value="Maintenance Required">
            <Tag color="warning" icon={<ClockCircleOutlined />} style={{ margin: 0 }}>
              Maintenance
            </Tag>
          </Option>
          <Option value="Offline">
            <Tag color="default" icon={<ClockCircleOutlined />} style={{ margin: 0 }}>
              Offline
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
          <Tooltip title="View ICT Dossier">
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: '#1890ff' }} />}
              onClick={() => {
                setSelectedIct(record);
                setIsDossierOpen(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Edit ICT Record">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: '#52c41a' }} />}
              onClick={() => handleOpenModal(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Record">
            <Popconfirm
              title="Delete FTC ICT record?"
              description="Are you sure you want to remove this FTC ICT station?"
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
        <Breadcrumb.Item>5. Farmers Training Centers (FTC)</Breadcrumb.Item>
        <Breadcrumb.Item>FTC ICT Utilization & Digital Connectivity</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#1a5f2c', fontFamily: "'Times New Roman', Times, serif" }}>
            FTC ICT Utilization & Digital Connectivity (የኤክስቴንሽን ማዕከላት ዲጂታል ቴክኖሎጂና የኢንተርኔት ትስስር)
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Coordinating DA digital tablet deployments, broadband internet hubs, solar power stations, and biometric registry terminals across FTCs
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
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Total Tablets Deployed</span>}
              value={stats.totalTablets}
              prefix={<LaptopOutlined style={{ color: '#1a5f2c', marginRight: 8 }} />}
              valueStyle={{ color: '#1a5f2c', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Functional Tablets: <strong style={{ color: '#52c41a' }}>{stats.totalFunctional} units</strong>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #1890ff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Male Users (ወንድ)</span>}
              value={stats.maleUsers}
              prefix={<ManOutlined style={{ color: '#1890ff', marginRight: 8 }} />}
              valueStyle={{ color: '#1890ff', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Male users accessing digital FTC tools
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #722ed1', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Women Users (ሴት + ባለትዳር)</span>}
              value={stats.totalWomenUsers}
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
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Fully Operational</span>}
              value={stats.operationalCount}
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
                placeholder="Search Title, Code, or Coordinator..."
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: 220 }}
                allowClear
              />

              <Select
                placeholder="ICT Category"
                value={categoryFilter}
                onChange={setCategoryFilter}
                style={{ width: 195 }}
                allowClear
              >
                {ICT_CATEGORIES.map((ic) => (
                  <Option key={ic} value={ic}>{ic}</Option>
                ))}
              </Select>

              <Select
                placeholder="Core Activity"
                value={activityFilter}
                onChange={setActivityFilter}
                style={{ width: 200 }}
                allowClear
              >
                {ICT_ACTIVITIES.map((ia) => (
                  <Option key={ia} value={ia}>{ia}</Option>
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
                {[...new Set(ictRecords.map((i) => extractName(i.zone)))].map((z) => (
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
                Export ICT CSV
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
                Register ICT Station
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Main Table */}
      <Table
        columns={columns}
        dataSource={filteredIctRecords}
        rowKey="id"
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} FTC ICT stations`
        }}
        scroll={{ x: 1350 }}
        bordered
        size="middle"
      />

      {/* Registration / Edit Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <LaptopOutlined style={{ color: '#1a5f2c', fontSize: 20 }} />
            <span style={{ color: '#1a5f2c', fontWeight: 'bold', fontFamily: "'Times New Roman', Times, serif", fontSize: 17 }}>
              {editingIct ? 'Edit FTC ICT Station Record' : 'Register FTC ICT & Digital Hub (ዲጂታል ማዕከል ምዝገባ)'}
            </span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText={editingIct ? 'Update ICT Station' : 'Save ICT Record'}
        okButtonProps={{ style: { backgroundColor: '#1a5f2c', borderColor: '#1a5f2c' }, loading: isSubmitting }}
        width={800}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Station Identification & ICT Category
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="ict_code"
                label="ICT Code"
                rules={[{ required: true, message: 'Code required' }]}
              >
                <Input placeholder="e.g. ICT-2019-EG-08" />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item
                name="ict_title"
                label="ICT Station / Hub Title"
                rules={[{ required: true, message: 'Title required' }]}
              >
                <Input placeholder="e.g. Kurar FTC Digital Hub & DA Tablet Sync Station" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="ict_category"
                label="ICT Category"
                rules={[{ required: true, message: 'Select category' }]}
              >
                <Select>
                  {ICT_CATEGORIES.map((ic) => (
                    <Option key={ic} value={ic}>{ic}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="core_activity"
                label="Core Digital Activity"
                rules={[{ required: true, message: 'Select activity' }]}
              >
                <Select>
                  {ICT_ACTIVITIES.map((ia) => (
                    <Option key={ia} value={ia}>{ia}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={14}>
              <Form.Item
                name="ict_coordinator"
                label="Coordinator / Digital DA Name"
                rules={[{ required: true, message: 'Coordinator required' }]}
              >
                <Input placeholder="e.g. Ato Mulugeta Fentaw" />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item
                name="coordinator_phone"
                label="Coordinator Phone Number"
                rules={[{ required: true, message: 'Phone required' }]}
              >
                <Input placeholder="+251 9..." />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Timeline & Equipment Quotas
          </Divider>
          <Row gutter={16}>
            <Col span={6}>
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
            <Col span={6}>
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
            <Col span={4}>
              <Form.Item
                name="tablets_allocated"
                label="Tablets Allocated"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item
                name="tablets_functional"
                label="Tablets Working"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item
                name="internet_bandwidth_mbps"
                label="Bandwidth (Mbps)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Users Enrolled by Cohort (ተጠቃሚዎች በወኪል ምድብ)
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="male_users"
                label="Male Users (ወንድ)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="female_users"
                label="Female Users (ሴት)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="married_women_users"
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
                name="youth_users"
                label="Youth Users (ወጣቶች)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="investors_users"
                label="Private Investors (ባለሃብቶች)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="ict_notes" label="Digital Connectivity Notes & Equipment Status">
                <TextArea rows={3} placeholder="Summarize internet connectivity stability, tablet battery status, or app usage feedback..." />
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

      {/* Comprehensive ICT Dossier Modal */}
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
                <LaptopOutlined />
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
                  {selectedIct?.ict_title}
                </span>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                  Code: <span style={{ fontFamily: 'monospace' }}>{selectedIct?.ict_code}</span> | Coordinator:{' '}
                  {selectedIct?.ict_coordinator}
                </div>
              </div>
            </div>
            <div>
              <Tag
                color={selectedIct?.ict_status === 'Fully Operational' ? 'success' : 'warning'}
                icon={selectedIct?.ict_status === 'Fully Operational' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                style={{ fontSize: 12, padding: '2px 10px', borderRadius: 12 }}
              >
                {selectedIct?.ict_status || 'Operational'}
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
              handleOpenModal(selectedIct);
            }}
          >
            Edit ICT Record
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
        {selectedIct && (
          <div style={{ paddingTop: 8 }}>
            {/* Top Metric Strip */}
            <Row gutter={12} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f6ffed', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Tablets Allocated</span>}
                    value={selectedIct.tablets_allocated || 0}
                    valueStyle={{ fontSize: 15, fontWeight: 'bold', color: '#1a5f2c' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f0f5ff', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Functional Tablets</span>}
                    value={selectedIct.tablets_functional || 0}
                    valueStyle={{ fontSize: 15, fontWeight: 'bold', color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f9f0ff', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Bandwidth</span>}
                    value={selectedIct.internet_bandwidth_mbps || 0}
                    suffix="Mbps"
                    valueStyle={{ fontSize: 15, fontWeight: 'bold', color: '#722ed1' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#fff7e6', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Fiscal Year</span>}
                    value={selectedIct.fiscal_year}
                    valueStyle={{ fontSize: 13, fontWeight: 'bold', color: '#fa8c16' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* TABPANES */}
            <Tabs defaultActiveKey="1" type="card">
              {/* TAB 1: ICT Profile */}
              <TabPane
                tab={
                  <span>
                    <TeamOutlined />
                    User Demographics & Reach
                  </span>
                }
                key="1"
              >
                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }} style={{ marginBottom: 16 }}>
                  <Descriptions.Item label="ICT Station Title" span={2}>
                    <strong style={{ color: '#1a5f2c' }}>{selectedIct.ict_title}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="ICT Category">
                    <Tag color="purple">{selectedIct.ict_category}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Core Activity">
                    <Tag color="green">{selectedIct.core_activity}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Coordinator">
                    {selectedIct.ict_coordinator} ({selectedIct.coordinator_phone})
                  </Descriptions.Item>
                </Descriptions>

                <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: 16, background: '#fafafa' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1a5f2c', textTransform: 'uppercase', marginBottom: 12 }}>
                    User Disaggregation (ተጠቃሚዎች በወኪል ምድብ)
                  </div>
                  <Row gutter={[16, 16]}>
                    <Col span={8}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <ManOutlined style={{ color: '#1890ff', marginRight: 4 }} />
                          Male Users (ወንድ)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#1890ff', marginTop: 2 }}>
                          {Number(selectedIct.male_users || 0).toLocaleString()}
                        </div>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <WomanOutlined style={{ color: '#722ed1', marginRight: 4 }} />
                          Female Users (ሴት)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#722ed1', marginTop: 2 }}>
                          {Number(selectedIct.female_users || 0).toLocaleString()}
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
                          {Number(selectedIct.married_women_users || 0).toLocaleString()}
                        </div>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <RiseOutlined style={{ color: '#fa8c16', marginRight: 4 }} />
                          Youth Users (ወጣቶች)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#fa8c16', marginTop: 2 }}>
                          {Number(selectedIct.youth_users || 0).toLocaleString()}
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
                          {Number(selectedIct.investors_users || 0).toLocaleString()}
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
                    Connectivity Notes & Equipment
                  </span>
                }
                key="2"
              >
                <Card size="small" bordered={false} style={{ background: '#fcfdfd', border: '1px solid #e6f7ed', borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <CheckCircleOutlined style={{ color: '#1a5f2c', fontSize: 16 }} />
                    <strong style={{ color: '#1a5f2c', fontSize: 13, textTransform: 'uppercase' }}>
                      ICT Station Notes & Status (የዲጂታል ማዕከል ማስታወሻ)
                    </strong>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: '#262626', lineHeight: '1.6' }}>
                    {selectedIct.ict_notes || 'Active FTC digital connectivity hub utilizing tablets and internet bandwidth.'}
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
                    <strong>{extractName(selectedIct.zone)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Woreda">
                    <strong>{extractName(selectedIct.woreda)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Kebele Operational Base">
                    <span style={{ color: '#1a5f2c', fontWeight: 'bold' }}>
                      {extractName(selectedIct.kebele)}
                    </span>
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
                  <Descriptions.Item label="Fiscal Year (በጀት ዓመት)">
                    <Tag color="blue" icon={<CalendarOutlined />}>
                      {selectedIct.fiscal_year || '2019 E.C.'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Production Campaign Season">
                    <strong>{selectedIct.season || 'Meher (መኸር)'}</strong>
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

export default function FtcIctIntegration() {
  return (
    <App>
      <FtcIctIntegrationContent />
    </App>
  );
}