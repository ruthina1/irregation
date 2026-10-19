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

const PACKAGE_CATEGORIES = [
  'Seasonal Crop Package Training (የወቅቱ የሰብል ማልማት ፓኬጅ ስልጠና)',
  'Livestock Fattening & Veterinary Module (የእንስሳት ዕጦትና ጤና ሞጁል)',
  'Natural Resources & Watershed Management (የተፈጥሮ ሀብት ጥበቃ ስልጠና)',
  'Modern Irrigation & Water Management (ዘመናዊ የመსኖ አጠቃቀም ስልጠና)',
  'Agri-Entrepreneurship & Financial Literacy (የንግድ ስራና የቁጠባ ስልጠና)'
];

const MODULE_ACTIVITIES = [
  'Classroom Modular Theory & Discussion',
  'FTC Demonstration Plot Practical Drill',
  'Model Farmer Field Coaching Session',
  'Seasonal Progress Evaluation & Quiz',
  'Certificate Graduation & Recognition Ceremony'
];

const INITIAL_PACKAGE_TRAININGS = [
  {
    id: '1',
    pkg_code: 'FPT-2019-EG-01',
    pkg_title: 'Kurar Seasonal Teff & Wheat Production Package',
    pkg_category: 'Seasonal Crop Package Training (የወቅቱ የሰብል ማልማት ፓኬጅ ስልጠና)',
    core_activity: 'FTC Demonstration Plot Practical Drill',
    package_instructor: 'Ato Mulugeta Fentaw (DA)',
    instructor_phone: '+251 918 445 566',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    training_modules_count: 5,
    male_trainees: 65,
    female_trainees: 45,
    married_women_trainees: 38,
    youth_trainees: 25,
    investors_trainees: 2,
    pkg_status: 'Successfully Graduated',
    pkg_notes: 'Completed 5-module seasonal training on row planting, fertilizer timing, and weed control for 110 farmers.',
    zone: 'East Gojjam',
    woreda: 'Dejen',
    kebele: 'Kurar'
  },
  {
    id: '2',
    pkg_code: 'FPT-2019-SG-04',
    pkg_title: 'Woreta Zuria Irrigated Vegetable & Water Management Module',
    pkg_category: 'Modern Irrigation & Water Management (ዘመናዊ የመსኖ አጠቃቀም ስልጠና)',
    core_activity: 'Classroom Modular Theory & Discussion',
    package_instructor: 'Woizero Aster Melesse',
    instructor_phone: '+251 922 112 334',
    fiscal_year: '2019 E.C.',
    season: 'Bega / Irrigation (መስኖ/በጋ)',
    training_modules_count: 4,
    male_trainees: 50,
    female_trainees: 40,
    married_women_trainees: 34,
    youth_trainees: 20,
    investors_trainees: 3,
    pkg_status: 'Active Training',
    pkg_notes: 'Conducting modular training on solar water pump operations and furrow irrigation efficiency.',
    zone: 'South Gondar',
    woreda: 'Fogera',
    kebele: 'Woreta Zuria'
  },
  {
    id: '3',
    pkg_code: 'FPT-2019-WG-09',
    pkg_title: 'Alefa Livestock Fattening & Forage Production Package',
    pkg_category: 'Livestock Fattening & Veterinary Module (የእንስሳት ዕጦትና ጤና ሞጁል)',
    core_activity: 'Model Farmer Field Coaching Session',
    package_instructor: 'Ato Tadesse Worku',
    instructor_phone: '+251 911 889 001',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    training_modules_count: 6,
    male_trainees: 45,
    female_trainees: 35,
    married_women_trainees: 28,
    youth_visitors: 18,
    investors_trainees: 1,
    pkg_status: 'Active Training',
    pkg_notes: 'Trained smallholders on Napier grass cultivation and urea-treated straw feeding methods.',
    zone: 'West Gojjam',
    woreda: 'Bure',
    kebele: 'Alefa'
  }
];

function FarmerPackageTrainingContent() {
  const { message } = App.useApp();

  const [packageTrainings, setPackageTrainings] = useState(INITIAL_PACKAGE_TRAININGS);
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
  const [editingPkg, setEditingPkg] = useState(null);
  const [selectedPkg, setSelectedPkg] = useState(null);
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
      if (editingPkg) {
        const initForm = async () => {
          const zoneMatch = zones.find(
            (z) => z.name === editingPkg.zone || z.id === editingPkg.zone_id
          );
          if (zoneMatch) {
            try {
              const wRes = locationApi?.getWoredas ? await locationApi.getWoredas(zoneMatch.id) : null;
              const wList = wRes?.data?.data?.data || wRes?.data?.data || [];
              setWoredas(wList);

              const woredaMatch = wList.find(
                (w) => w.name === editingPkg.woreda || w.id === editingPkg.woreda_id
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
            pkg_code: editingPkg.pkg_code,
            pkg_title: editingPkg.pkg_title,
            pkg_category: editingPkg.pkg_category,
            core_activity: editingPkg.core_activity,
            package_instructor: editingPkg.package_instructor,
            instructor_phone: editingPkg.instructor_phone,
            fiscal_year: editingPkg.fiscal_year || '2019 E.C.',
            season: editingPkg.season || 'Meher (መኸር)',
            training_modules_count: Number(editingPkg.training_modules_count) || 4,
            male_trainees: Number(editingPkg.male_trainees) || 0,
            female_trainees: Number(editingPkg.female_trainees) || 0,
            married_women_trainees: Number(editingPkg.married_women_trainees) || 0,
            youth_trainees: Number(editingPkg.youth_trainees || editingPkg.youth_visitors) || 0,
            investors_trainees: Number(editingPkg.investors_trainees) || 0,
            pkg_notes: editingPkg.pkg_notes,
            zone_id: editingPkg.zone_id || zoneMatch?.id || editingPkg.zone,
            woreda_id: editingPkg.woreda_id || editingPkg.woreda,
            kebele_id: editingPkg.kebele_id || editingPkg.kebele
          });
        };
        initForm();
      } else {
        form.resetFields();
        form.setFieldsValue({
          pkg_category: 'Seasonal Crop Package Training (የወቅቱ የሰብል ማልማት ፓኬጅ ስልጠና)',
          core_activity: 'FTC Demonstration Plot Practical Drill',
          fiscal_year: '2019 E.C.',
          season: 'Meher (መኸር)',
          training_modules_count: 5,
          male_trainees: 40,
          female_trainees: 30,
          married_women_trainees: 25,
          youth_trainees: 15,
          investors_trainees: 1
        });
        setWoredas([]);
        setKebeles([]);
      }
    }
  }, [isModalOpen, editingPkg, form, zones]);

  const loadData = async () => {
    setIsFetching(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      message.success('Farmer seasonal package training registry refreshed');
    } catch {
      message.error('Failed to refresh data');
    } finally {
      setIsFetching(false);
    }
  };

  // Direct In-Place Status Update without Opening the Form
  const handleQuickStatusChange = (recordId, newStatus) => {
    setPackageTrainings((prev) =>
      prev.map((p) => (p.id === recordId ? { ...p, pkg_status: newStatus } : p))
    );
    message.success(`Training status updated to "${newStatus}"`);
  };

  // Filter pipeline
  const filteredPackageTrainings = useMemo(() => {
    return packageTrainings.filter((p) => {
      const code = extractName(p.pkg_code).toLowerCase();
      const title = extractName(p.pkg_title).toLowerCase();
      const inst = extractName(p.package_instructor).toLowerCase();
      const kebele = extractName(p.kebele).toLowerCase();
      const woreda = extractName(p.woreda).toLowerCase();
      const zone = extractName(p.zone).toLowerCase();
      const q = searchTerm.toLowerCase();

      const matchesSearch =
        code.includes(q) || title.includes(q) || inst.includes(q) || kebele.includes(q) || woreda.includes(q) || zone.includes(q);
      const matchesCategory = categoryFilter ? p.pkg_category === categoryFilter : true;
      const matchesActivity = activityFilter ? p.core_activity === activityFilter : true;
      const matchesFY = fiscalYearFilter ? p.fiscal_year === fiscalYearFilter : true;
      const matchesSeason = seasonFilter ? p.season === seasonFilter : true;
      const matchesStatus = statusFilter ? p.pkg_status === statusFilter : true;
      const matchesZone = zoneFilter ? zone === zoneFilter.toLowerCase() : true;

      return matchesSearch && matchesCategory && matchesActivity && matchesFY && matchesSeason && matchesStatus && matchesZone;
    });
  }, [packageTrainings, searchTerm, categoryFilter, activityFilter, fiscalYearFilter, seasonFilter, statusFilter, zoneFilter]);

  // Statistics Calculation
  const stats = useMemo(() => {
    const totalPackages = filteredPackageTrainings.length;
    const maleTrainees = filteredPackageTrainings.reduce((acc, p) => acc + (Number(p.male_trainees) || 0), 0);
    const femaleTrainees = filteredPackageTrainings.reduce((acc, p) => acc + (Number(p.female_trainees) || 0), 0);
    const marriedWomen = filteredPackageTrainings.reduce((acc, p) => acc + (Number(p.married_women_trainees) || 0), 0);
    const youth = filteredPackageTrainings.reduce((acc, p) => acc + (Number(p.youth_trainees || p.youth_visitors) || 0), 0);
    const investors = filteredPackageTrainings.reduce((acc, p) => acc + (Number(p.investors_trainees) || 0), 0);

    const totalTrainees = maleTrainees + femaleTrainees + marriedWomen + youth + investors;
    const totalWomenTrainees = femaleTrainees + marriedWomen;
    const womenRatio = totalTrainees > 0 ? ((totalWomenTrainees / totalTrainees) * 100).toFixed(1) : 0;
    const graduatedCount = filteredPackageTrainings.filter((p) => p.pkg_status === 'Successfully Graduated').length;

    return {
      totalPackages,
      totalTrainees,
      maleTrainees,
      femaleTrainees,
      marriedWomen,
      totalWomenTrainees,
      youth,
      investors,
      womenRatio,
      graduatedCount
    };
  }, [filteredPackageTrainings]);

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
    setEditingPkg(record);
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

      if (editingPkg) {
        setPackageTrainings((prev) =>
          prev.map((item) =>
            item.id === editingPkg.id ? { ...item, ...payload, pkg_status: editingPkg.pkg_status } : item
          )
        );
        message.success('Farmer package training record updated successfully');
      } else {
        const newRecord = {
          ...payload,
          id: Date.now().toString(),
          pkg_code: values.pkg_code || `FPT-${Date.now().toString().slice(-4)}`,
          pkg_status: 'Successfully Graduated'
        };
        setPackageTrainings((prev) => [newRecord, ...prev]);
        message.success('New farmer seasonal package training registered successfully');
      }
      setIsModalOpen(false);
    } catch (error) {
      message.error(error?.response?.data?.message || error.message || 'Failed to save package training record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    setPackageTrainings((prev) => prev.filter((item) => item.id !== id));
    message.success('Farmer package training record removed');
  };

  const exportToCSV = () => {
    if (!filteredPackageTrainings.length) {
      message.warning('No package training records available to export');
      return;
    }
    const headers = [
      'Pkg Code,Title,Category,Core Activity,Modules Count,Instructor,Phone,FY,Season,Zone,Woreda,Kebele,Male (ወንድ),Female (ሴት),Married Women (ባለትዳር),Youth (ወጣቶች),Investors (ባለሃብቶች),Total Trainees,Status'
    ];
    const rows = filteredPackageTrainings.map((p) => {
      const total =
        (Number(p.male_trainees) || 0) +
        (Number(p.female_trainees) || 0) +
        (Number(p.married_women_trainees) || 0) +
        (Number(p.youth_trainees || p.youth_visitors) || 0) +
        (Number(p.investors_trainees) || 0);

      return [
        `"${p.pkg_code || ''}"`,
        `"${p.pkg_title || ''}"`,
        `"${p.pkg_category || ''}"`,
        `"${p.core_activity || ''}"`,
        p.training_modules_count || 1,
        `"${p.package_instructor || ''}"`,
        `"${p.instructor_phone || ''}"`,
        `"${p.fiscal_year || ''}"`,
        `"${p.season || ''}"`,
        `"${extractName(p.zone)}"`,
        `"${extractName(p.woreda)}"`,
        `"${extractName(p.kebele)}"`,
        p.male_trainees || 0,
        p.female_trainees || 0,
        p.married_women_trainees || 0,
        p.youth_trainees || p.youth_visitors || 0,
        p.investors_trainees || 0,
        total,
        `"${p.pkg_status || ''}"`
      ].join(',');
    });

    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Farmer_Seasonal_Package_Training_${Date.now()}.csv`;
    a.click();
    message.success('Farmer package training report exported successfully');
  };

  const columns = [
    {
      title: 'Pkg Code & Title',
      key: 'pkg_info',
      width: 250,
      render: (_, r) => (
        <div>
          <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{r.pkg_title}</strong>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>
            Code: <span style={{ fontFamily: 'monospace' }}>{r.pkg_code}</span> | Instructor: {r.package_instructor}
          </div>
        </div>
      )
    },
    {
      title: 'Package Category',
      dataIndex: 'pkg_category',
      key: 'pkg_category',
      width: 210,
      render: (cat) => {
        let color = 'default';
        if (cat?.includes('Seasonal')) color = 'green';
        if (cat?.includes('Livestock')) color = 'blue';
        if (cat?.includes('Natural')) color = 'gold';
        if (cat?.includes('Irrigation')) color = 'purple';
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
      title: 'Trainees Enrolled',
      key: 'trainees_breakdown',
      width: 230,
      render: (_, r) => {
        const total =
          (Number(r.male_trainees) || 0) +
          (Number(r.female_trainees) || 0) +
          (Number(r.married_women_trainees) || 0) +
          (Number(r.youth_trainees || r.youth_visitors) || 0) +
          (Number(r.investors_trainees) || 0);

        return (
          <div style={{ fontSize: 11 }}>
            <div>
              Total: <strong style={{ color: '#1a5f2c' }}>{total.toLocaleString()} Farmers</strong>
            </div>
            <div style={{ color: '#8c8c8c' }}>
              <span>ወንድ: {r.male_trainees || 0}</span> | <span>ሴት: {r.female_trainees || 0}</span> | <span>ባለትዳር: {r.married_women_trainees || 0}</span>
            </div>
          </div>
        );
      }
    },
    {
      title: 'Package Status (In-Place Edit)',
      dataIndex: 'pkg_status',
      key: 'pkg_status',
      width: 190,
      render: (status, record) => (
        <Select
          value={status || 'Successfully Graduated'}
          onChange={(newVal) => handleQuickStatusChange(record.id, newVal)}
          style={{ width: '100%' }}
          size="small"
        >
          <Option value="Successfully Graduated">
            <Tag color="success" icon={<CheckCircleOutlined />} style={{ margin: 0 }}>
              Graduated
            </Tag>
          </Option>
          <Option value="Active Training">
            <Tag color="processing" icon={<ClockCircleOutlined />} style={{ margin: 0 }}>
              Training
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
          <Tooltip title="View Training Dossier">
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: '#1890ff' }} />}
              onClick={() => {
                setSelectedPkg(record);
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
          <Tooltip title="Delete Record">
            <Popconfirm
              title="Delete package training record?"
              description="Are you sure you want to remove this farmer package training?"
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
        <Breadcrumb.Item>Farmer Seasonal Modular & Package Training</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#1a5f2c', fontFamily: "'Times New Roman', Times, serif" }}>
            Farmer Seasonal Modular & Package Training (የአርሶ አደሮች ወቅታዊ ሞጁልና ፓኬጅ ስልጠና)
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Coordinating seasonal modular courses, FTC practical drills, model farmer coaching, and certificate graduations for smallholders
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
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Total Trainees Enrolled</span>}
              value={stats.totalTrainees}
              prefix={<ReadOutlined style={{ color: '#1a5f2c', marginRight: 8 }} />}
              valueStyle={{ color: '#1a5f2c', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Total Packages: <strong style={{ color: '#262626' }}>{stats.totalPackages} courses</strong>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #1890ff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Male Trainees (ወንድ)</span>}
              value={stats.maleTrainees}
              prefix={<ManOutlined style={{ color: '#1890ff', marginRight: 8 }} />}
              valueStyle={{ color: '#1890ff', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Male farmers in seasonal training
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #722ed1', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Women Trainees (ሴት + ባለትዳር)</span>}
              value={stats.totalWomenTrainees}
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
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Successfully Graduated</span>}
              value={stats.graduatedCount}
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
                placeholder="Search Title, Code, or Instructor..."
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: 220 }}
                allowClear
              />

              <Select
                placeholder="Package Category"
                value={categoryFilter}
                onChange={setCategoryFilter}
                style={{ width: 195 }}
                allowClear
              >
                {PACKAGE_CATEGORIES.map((pc) => (
                  <Option key={pc} value={pc}>{pc}</Option>
                ))}
              </Select>

              <Select
                placeholder="Core Activity"
                value={activityFilter}
                onChange={setActivityFilter}
                style={{ width: 200 }}
                allowClear
              >
                {MODULE_ACTIVITIES.map((ma) => (
                  <Option key={ma} value={ma}>{ma}</Option>
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
                {[...new Set(packageTrainings.map((p) => extractName(p.zone)))].map((z) => (
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
                Export Package CSV
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
                Register Package Training
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Main Table */}
      <Table
        columns={columns}
        dataSource={filteredPackageTrainings}
        rowKey="id"
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} farmer package trainings`
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
              {editingPkg ? 'Edit Farmer Package Training' : 'Register Farmer Seasonal Package Training (የአርሶ አደር ፓኬጅ ስልጠና ምዝገባ)'}
            </span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText={editingPkg ? 'Update Package' : 'Save Package Record'}
        okButtonProps={{ style: { backgroundColor: '#1a5f2c', borderColor: '#1a5f2c' }, loading: isSubmitting }}
        width={800}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Package Identification & Category
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="pkg_code"
                label="Package Code"
                rules={[{ required: true, message: 'Code required' }]}
              >
                <Input placeholder="e.g. FPT-2019-EG-08" />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item
                name="pkg_title"
                label="Seasonal Package Title"
                rules={[{ required: true, message: 'Title required' }]}
              >
                <Input placeholder="e.g. Kurar Seasonal Teff & Wheat Production Package" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="pkg_category"
                label="Package Category"
                rules={[{ required: true, message: 'Select category' }]}
              >
                <Select>
                  {PACKAGE_CATEGORIES.map((pc) => (
                    <Option key={pc} value={pc}>{pc}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="core_activity"
                label="Core Module Activity"
                rules={[{ required: true, message: 'Select activity' }]}
              >
                <Select>
                  {MODULE_ACTIVITIES.map((ma) => (
                    <Option key={ma} value={ma}>{ma}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={14}>
              <Form.Item
                name="package_instructor"
                label="Instructor / DA Name"
                rules={[{ required: true, message: 'Instructor required' }]}
              >
                <Input placeholder="e.g. Ato Mulugeta Fentaw (DA)" />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item
                name="instructor_phone"
                label="Instructor Phone Number"
                rules={[{ required: true, message: 'Phone required' }]}
              >
                <Input placeholder="+251 9..." />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Timeline & Module Quotas
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
                name="training_modules_count"
                label="Training Modules Count"
                rules={[{ required: true }]}
              >
                <InputNumber min={1} max={12} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Trainees Enrolled by Cohort (ሰልጣኞች አርሶ አደሮች በወኪል ምድብ)
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="male_trainees"
                label="Male Trainees (ወንድ)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="female_trainees"
                label="Female Trainees (ሴት)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="married_women_trainees"
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
                name="youth_trainees"
                label="Youth Trainees (ወጣቶች)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="investors_trainees"
                label="Private Investors (ባለሃብቶች)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="pkg_notes" label="Package Training Notes & Graduation Results">
                <TextArea rows={3} placeholder="Summarize modular topics completed, practical field drill outcomes, or graduation certification stats..." />
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

      {/* Comprehensive Package Dossier Modal */}
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
                  {selectedPkg?.pkg_title}
                </span>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                  Code: <span style={{ fontFamily: 'monospace' }}>{selectedPkg?.pkg_code}</span> | Instructor:{' '}
                  {selectedPkg?.package_instructor}
                </div>
              </div>
            </div>
            <div>
              <Tag
                color={selectedPkg?.pkg_status === 'Successfully Graduated' ? 'success' : 'processing'}
                icon={selectedPkg?.pkg_status === 'Successfully Graduated' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                style={{ fontSize: 12, padding: '2px 10px', borderRadius: 12 }}
              >
                {selectedPkg?.pkg_status || 'Graduated'}
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
              handleOpenModal(selectedPkg);
            }}
          >
            Edit Package
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
        {selectedPkg && (
          <div style={{ paddingTop: 8 }}>
            {/* Top Metric Strip */}
            <Row gutter={12} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f6ffed', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Total Trainees</span>}
                    value={
                      (Number(selectedPkg.male_trainees) || 0) +
                      (Number(selectedPkg.female_trainees) || 0) +
                      (Number(selectedPkg.married_women_trainees) || 0) +
                      (Number(selectedPkg.youth_trainees || selectedPkg.youth_visitors) || 0) +
                      (Number(selectedPkg.investors_trainees) || 0)
                    }
                    suffix={<span style={{ fontSize: 12 }}>Farmers</span>}
                    valueStyle={{ fontSize: 15, fontWeight: 'bold', color: '#1a5f2c' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f0f5ff', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Package Category</span>}
                    value={selectedPkg.pkg_category?.split(' ')[0] || 'Category'}
                    valueStyle={{ fontSize: 15, fontWeight: 'bold', color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f9f0ff', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Women Share</span>}
                    value={
                      (Number(selectedPkg.male_trainees) || 0) +
                      (Number(selectedPkg.female_trainees) || 0) +
                      (Number(selectedPkg.married_women_trainees) || 0) +
                      (Number(selectedPkg.youth_trainees || selectedPkg.youth_visitors) || 0) +
                      (Number(selectedPkg.investors_trainees) || 0) > 0
                        ? (
                            (((Number(selectedPkg.female_trainees) || 0) +
                              (Number(selectedPkg.married_women_trainees) || 0)) /
                              ((Number(selectedPkg.male_trainees) || 0) +
                                (Number(selectedPkg.female_trainees) || 0) +
                                (Number(selectedPkg.married_women_trainees) || 0) +
                                (Number(selectedPkg.youth_trainees || selectedPkg.youth_visitors) || 0) +
                                (Number(selectedPkg.investors_trainees) || 0))) *
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
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Modules Count</span>}
                    value={selectedPkg.training_modules_count || 1}
                    suffix="Modules"
                    valueStyle={{ fontSize: 14, fontWeight: 'bold', color: '#fa8c16' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* TABPANES */}
            <Tabs defaultActiveKey="1" type="card">
              {/* TAB 1: Package Profile */}
              <TabPane
                tab={
                  <span>
                    <TeamOutlined />
                    Trainee Demographics & Reach
                  </span>
                }
                key="1"
              >
                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }} style={{ marginBottom: 16 }}>
                  <Descriptions.Item label="Package Title" span={2}>
                    <strong style={{ color: '#1a5f2c' }}>{selectedPkg.pkg_title}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Package Category">
                    <Tag color="purple">{selectedPkg.pkg_category}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Core Activity">
                    <Tag color="green">{selectedPkg.core_activity}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Instructor">
                    {selectedPkg.package_instructor} ({selectedPkg.instructor_phone})
                  </Descriptions.Item>
                </Descriptions>

                <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: 16, background: '#fafafa' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1a5f2c', textTransform: 'uppercase', marginBottom: 12 }}>
                    Trainee Disaggregation (ሰልጣኞች አርሶ አደሮች በወኪል ምድብ)
                  </div>
                  <Row gutter={[16, 16]}>
                    <Col span={8}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <ManOutlined style={{ color: '#1890ff', marginRight: 4 }} />
                          Male Trainees (ወንድ)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#1890ff', marginTop: 2 }}>
                          {Number(selectedPkg.male_trainees || 0).toLocaleString()}
                        </div>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <WomanOutlined style={{ color: '#722ed1', marginRight: 4 }} />
                          Female Trainees (ሴት)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#722ed1', marginTop: 2 }}>
                          {Number(selectedPkg.female_trainees || 0).toLocaleString()}
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
                          {Number(selectedPkg.married_women_trainees || 0).toLocaleString()}
                        </div>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <RiseOutlined style={{ color: '#fa8c16', marginRight: 4 }} />
                          Youth Trainees (ወጣቶች)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#fa8c16', marginTop: 2 }}>
                          {Number(selectedPkg.youth_trainees || selectedPkg.youth_visitors || 0).toLocaleString()}
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
                          {Number(selectedPkg.investors_trainees || 0).toLocaleString()}
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
                    Package Notes & Graduation
                  </span>
                }
                key="2"
              >
                <Card size="small" bordered={false} style={{ background: '#fcfdfd', border: '1px solid #e6f7ed', borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <CheckCircleOutlined style={{ color: '#1a5f2c', fontSize: 16 }} />
                    <strong style={{ color: '#1a5f2c', fontSize: 13, textTransform: 'uppercase' }}>
                      Package Training & Graduation Notes (የፓኬጅ ስልጠና ማስታወሻ)
                    </strong>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: '#262626', lineHeight: '1.6' }}>
                    {selectedPkg.pkg_notes || 'Active farmer seasonal modular training program and practical skill drills.'}
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
                    <strong>{extractName(selectedPkg.zone)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Woreda">
                    <strong>{extractName(selectedPkg.woreda)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Kebele Operational Base">
                    <span style={{ color: '#1a5f2c', fontWeight: 'bold' }}>
                      {extractName(selectedPkg.kebele)}
                    </span>
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
                  <Descriptions.Item label="Fiscal Year (በጀት ዓመት)">
                    <Tag color="blue" icon={<CalendarOutlined />}>
                      {selectedPkg.fiscal_year || '2019 E.C.'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Production Campaign Season">
                    <strong>{selectedPkg.season || 'Meher (መኸር)'}</strong>
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

export default function FarmerPackageTraining() {
  return (
    <App>
      <FarmerPackageTrainingContent />
    </App>
  );
}