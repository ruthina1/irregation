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
  ExperimentOutlined,
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

const FFS_CATEGORIES = [
  'Integrated Pest Management - IPM FFS (የተቀናጀ ተባይ መከላከያ የሜዳ ትምህርት ቤት)',
  'Climate-Resilient Agricultural FFS (አየር ንብረት ተከላካይ የሜዳ ትምህርት ቤት)',
  'Soil Health & Composting FFS (የአፈር ጤንነትና ኮምፖስት ማዘጋጃ)',
  'Livestock & Forage Management FFS (የእንስሳት መኖና እንክብካቤ የሜዳ ትምህርት ቤት)',
  'Agro-Forestry & Watershed FFS (የደንና ተፋሰስ ልማት የሜዳ ትምህርት ቤት)'
];

const FFS_ACTIVITIES = [
  'Agro-Ecosystem Analysis (AESA) Field Study',
  'Comparative Plot Experimentation (FFS vs. Farmer Practice)',
  'Organic Pesticide Brewing & Botanical Workshop',
  'Seed Selection & Germination Testing Drill',
  'Soil Acidity & Lime Application Demonstration'
];

const INITIAL_FFS_SCHOOLS = [
  {
    id: '1',
    ffs_code: 'FFS-2019-EG-01',
    ffs_name: 'Kurar Teff IPM Farmer Field School',
    ffs_category: 'Integrated Pest Management - IPM FFS (የተቀናጀ ተባይ መከላከያ የሜዳ ትምህርት ቤት)',
    core_activity: 'Agro-Ecosystem Analysis (AESA) Field Study',
    facilitator_name: 'Ato Mulugeta Fentaw (DA)',
    facilitator_phone: '+251 918 445 566',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    male_graduates: 14,
    female_graduates: 11,
    married_women_graduates: 9,
    youth_graduates: 5,
    investors_graduates: 0,
    ffs_status: 'Active Cohort',
    ffs_notes: 'Conducted weekly AESA sessions observing beneficial insects and weed dynamics on Quncho Teff plots.',
    zone: 'East Gojjam',
    woreda: 'Dejen',
    kebele: 'Kurar'
  },
  {
    id: '2',
    ffs_code: 'FFS-2019-SG-04',
    ffs_name: 'Woreta Soil Health & Composting FFS',
    ffs_category: 'Soil Health & Composting FFS (የአፈር ጤንነትና ኮምፖስት ማዘጋጃ)',
    core_activity: 'Soil Acidity & Lime Application Demonstration',
    facilitator_name: 'Woizero Aster Melesse (DA)',
    facilitator_phone: '+251 922 112 334',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    male_graduates: 12,
    female_graduates: 13,
    married_women_graduates: 11,
    youth_graduates: 4,
    investors_graduates: 1,
    ffs_status: 'Active Cohort',
    ffs_notes: 'Trained smallholders on agricultural lime calculation and pit vermicompost preparation.',
    zone: 'South Gondar',
    woreda: 'Fogera',
    kebele: 'Woreta Zuria'
  },
  {
    id: '3',
    ffs_code: 'FFS-2019-WG-09',
    ffs_name: 'Alefa Climate-Resilient Maize FFS',
    ffs_category: 'Climate-Resilient Agricultural FFS (አየር ንብረት ተከላካይ የሜዳ ትምህርት ቤት)',
    core_activity: 'Comparative Plot Experimentation (FFS vs. Farmer Practice)',
    facilitator_name: 'Ato Tadesse Worku (DA)',
    facilitator_phone: '+251 911 889 001',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    male_graduates: 15,
    female_graduates: 10,
    married_women_graduates: 8,
    youth_graduates: 6,
    investors_graduates: 0,
    ffs_status: 'Graduation Due',
    ffs_notes: 'Compared drought-tolerant BH-546 hybrid maize with local varieties under moisture stress.',
    zone: 'West Gojjam',
    woreda: 'Bure',
    kebele: 'Alefa'
  }
];

function FarmerFieldSchoolsContent() {
  const { message } = App.useApp();

  const [schools, setSchools] = useState(INITIAL_FFS_SCHOOLS);
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
  const [editingSchool, setEditingSchool] = useState(null);
  const [selectedSchool, setSelectedSchool] = useState(null);
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
      if (editingSchool) {
        const initForm = async () => {
          const zoneMatch = zones.find(
            (z) => z.name === editingSchool.zone || z.id === editingSchool.zone_id
          );
          if (zoneMatch) {
            try {
              const wRes = locationApi?.getWoredas ? await locationApi.getWoredas(zoneMatch.id) : null;
              const wList = wRes?.data?.data?.data || wRes?.data?.data || [];
              setWoredas(wList);

              const woredaMatch = wList.find(
                (w) => w.name === editingSchool.woreda || w.id === editingSchool.woreda_id
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
            ffs_code: editingSchool.ffs_code,
            ffs_name: editingSchool.ffs_name,
            ffs_category: editingSchool.ffs_category,
            core_activity: editingSchool.core_activity,
            facilitator_name: editingSchool.facilitator_name,
            facilitator_phone: editingSchool.facilitator_phone,
            fiscal_year: editingSchool.fiscal_year || '2019 E.C.',
            season: editingSchool.season || 'Meher (መኸር)',
            male_graduates: Number(editingSchool.male_graduates) || 0,
            female_graduates: Number(editingSchool.female_graduates) || 0,
            married_women_graduates: Number(editingSchool.married_women_graduates) || 0,
            youth_graduates: Number(editingSchool.youth_graduates) || 0,
            investors_graduates: Number(editingSchool.investors_graduates) || 0,
            ffs_notes: editingSchool.ffs_notes,
            zone_id: editingSchool.zone_id || zoneMatch?.id || editingSchool.zone,
            woreda_id: editingSchool.woreda_id || editingSchool.woreda,
            kebele_id: editingSchool.kebele_id || editingSchool.kebele
          });
        };
        initForm();
      } else {
        form.resetFields();
        form.setFieldsValue({
          ffs_category: 'Integrated Pest Management - IPM FFS (የተቀናጀ ተባይ መከላከያ የሜዳ ትምህርት ቤት)',
          core_activity: 'Agro-Ecosystem Analysis (AESA) Field Study',
          fiscal_year: '2019 E.C.',
          season: 'Meher (መኸር)',
          male_graduates: 15,
          female_graduates: 10,
          married_women_graduates: 8,
          youth_graduates: 5,
          investors_graduates: 0
        });
        setWoredas([]);
        setKebeles([]);
      }
    }
  }, [isModalOpen, editingSchool, form, zones]);

  const loadData = async () => {
    setIsFetching(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      message.success('Farmer field schools registry refreshed');
    } catch {
      message.error('Failed to refresh data');
    } finally {
      setIsFetching(false);
    }
  };

  // Direct In-Place Status Update without Opening the Form
  const handleQuickStatusChange = (recordId, newStatus) => {
    setSchools((prev) =>
      prev.map((s) => (s.id === recordId ? { ...s, ffs_status: newStatus } : s))
    );
    message.success(`FFS status updated to "${newStatus}"`);
  };

  // Filter pipeline
  const filteredSchools = useMemo(() => {
    return schools.filter((s) => {
      const code = extractName(s.ffs_code).toLowerCase();
      const name = extractName(s.ffs_name).toLowerCase();
      const facilitator = extractName(s.facilitator_name).toLowerCase();
      const kebele = extractName(s.kebele).toLowerCase();
      const woreda = extractName(s.woreda).toLowerCase();
      const zone = extractName(s.zone).toLowerCase();
      const q = searchTerm.toLowerCase();

      const matchesSearch =
        code.includes(q) || name.includes(q) || facilitator.includes(q) || kebele.includes(q) || woreda.includes(q) || zone.includes(q);
      const matchesCategory = categoryFilter ? s.ffs_category === categoryFilter : true;
      const matchesActivity = activityFilter ? s.core_activity === activityFilter : true;
      const matchesFY = fiscalYearFilter ? s.fiscal_year === fiscalYearFilter : true;
      const matchesSeason = seasonFilter ? s.season === seasonFilter : true;
      const matchesStatus = statusFilter ? s.ffs_status === statusFilter : true;
      const matchesZone = zoneFilter ? zone === zoneFilter.toLowerCase() : true;

      return matchesSearch && matchesCategory && matchesActivity && matchesFY && matchesSeason && matchesStatus && matchesZone;
    });
  }, [schools, searchTerm, categoryFilter, activityFilter, fiscalYearFilter, seasonFilter, statusFilter, zoneFilter]);

  // Statistics Calculation
  const stats = useMemo(() => {
    const totalSchools = filteredSchools.length;
    const maleGraduates = filteredSchools.reduce((acc, s) => acc + (Number(s.male_graduates) || 0), 0);
    const femaleGraduates = filteredSchools.reduce((acc, s) => acc + (Number(s.female_graduates) || 0), 0);
    const marriedWomen = filteredSchools.reduce((acc, s) => acc + (Number(s.married_women_graduates) || 0), 0);
    const youth = filteredSchools.reduce((acc, s) => acc + (Number(s.youth_graduates) || 0), 0);
    const investors = filteredSchools.reduce((acc, s) => acc + (Number(s.investors_graduates) || 0), 0);

    const totalGraduates = maleGraduates + femaleGraduates + marriedWomen + youth + investors;
    const totalWomenGraduates = femaleGraduates + marriedWomen;
    const womenRatio = totalGraduates > 0 ? ((totalWomenGraduates / totalGraduates) * 100).toFixed(1) : 0;
    const activeCount = filteredSchools.filter((s) => s.ffs_status === 'Active Cohort').length;

    return {
      totalSchools,
      totalGraduates,
      maleGraduates,
      femaleGraduates,
      marriedWomen,
      totalWomenGraduates,
      youth,
      investors,
      womenRatio,
      activeCount
    };
  }, [filteredSchools]);

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
    setEditingSchool(record);
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

      if (editingSchool) {
        setSchools((prev) =>
          prev.map((item) =>
            item.id === editingSchool.id ? { ...item, ...payload, ffs_status: editingSchool.ffs_status } : item
          )
        );
        message.success('Farmer field school record updated successfully');
      } else {
        const newRecord = {
          ...payload,
          id: Date.now().toString(),
          ffs_code: values.ffs_code || `FFS-${Date.now().toString().slice(-4)}`,
          ffs_status: 'Active Cohort'
        };
        setSchools((prev) => [newRecord, ...prev]);
        message.success('New farmer field school registered successfully');
      }
      setIsModalOpen(false);
    } catch (error) {
      message.error(error?.response?.data?.message || error.message || 'Failed to save field school record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    setSchools((prev) => prev.filter((item) => item.id !== id));
    message.success('Farmer field school record removed');
  };

  const exportToCSV = () => {
    if (!filteredSchools.length) {
      message.warning('No school records available to export');
      return;
    }
    const headers = [
      'FFS Code,FFS Name,Category,Core Activity,Facilitator,Phone,FY,Season,Zone,Woreda,Kebele,Male (ወንድ),Female (ሴት),Married Women (ባለትዳር),Youth (ወጣቶች),Investors (ባለሃብቶች),Total Graduates,Status'
    ];
    const rows = filteredSchools.map((s) => {
      const total =
        (Number(s.male_graduates) || 0) +
        (Number(s.female_graduates) || 0) +
        (Number(s.married_women_graduates) || 0) +
        (Number(s.youth_graduates) || 0) +
        (Number(s.investors_graduates) || 0);

      return [
        `"${s.ffs_code || ''}"`,
        `"${s.ffs_name || ''}"`,
        `"${s.ffs_category || ''}"`,
        `"${s.core_activity || ''}"`,
        `"${s.facilitator_name || ''}"`,
        `"${s.facilitator_phone || ''}"`,
        `"${s.fiscal_year || ''}"`,
        `"${s.season || ''}"`,
        `"${extractName(s.zone)}"`,
        `"${extractName(s.woreda)}"`,
        `"${extractName(s.kebele)}"`,
        s.male_graduates || 0,
        s.female_graduates || 0,
        s.married_women_graduates || 0,
        s.youth_graduates || 0,
        s.investors_graduates || 0,
        total,
        `"${s.ffs_status || ''}"`
      ].join(',');
    });

    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Farmer_Field_Schools_Report_${Date.now()}.csv`;
    a.click();
    message.success('Farmer field schools report exported successfully');
  };

  const columns = [
    {
      title: 'FFS Code & Name',
      key: 'school_info',
      width: 250,
      render: (_, r) => (
        <div>
          <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{r.ffs_name}</strong>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>
            Code: <span style={{ fontFamily: 'monospace' }}>{r.ffs_code}</span> | Facilitator: {r.facilitator_name}
          </div>
        </div>
      )
    },
    {
      title: 'FFS Category',
      dataIndex: 'ffs_category',
      key: 'ffs_category',
      width: 210,
      render: (cat) => {
        let color = 'default';
        if (cat?.includes('IPM')) color = 'green';
        if (cat?.includes('Climate')) color = 'blue';
        if (cat?.includes('Soil')) color = 'gold';
        if (cat?.includes('Livestock')) color = 'purple';
        return <Tag color={color}>{cat}</Tag>;
      }
    },
    {
      title: 'Core Activity / Study',
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
      title: 'Graduates Enrolled',
      key: 'graduates_breakdown',
      width: 230,
      render: (_, r) => {
        const total =
          (Number(r.male_graduates) || 0) +
          (Number(r.female_graduates) || 0) +
          (Number(r.married_women_graduates) || 0) +
          (Number(r.youth_graduates) || 0) +
          (Number(r.investors_graduates) || 0);

        return (
          <div style={{ fontSize: 11 }}>
            <div>
              Total: <strong style={{ color: '#1a5f2c' }}>{total.toLocaleString()} Graduates</strong>
            </div>
            <div style={{ color: '#8c8c8c' }}>
              <span>ወንድ: {r.male_graduates || 0}</span> | <span>ሴት: {r.female_graduates || 0}</span> | <span>ባለትዳር: {r.married_women_graduates || 0}</span>
            </div>
          </div>
        );
      }
    },
    {
      title: 'FFS Status (In-Place Edit)',
      dataIndex: 'ffs_status',
      key: 'ffs_status',
      width: 190,
      render: (status, record) => (
        <Select
          value={status || 'Active Cohort'}
          onChange={(newVal) => handleQuickStatusChange(record.id, newVal)}
          style={{ width: '100%' }}
          size="small"
        >
          <Option value="Active Cohort">
            <Tag color="success" icon={<CheckCircleOutlined />} style={{ margin: 0 }}>
              Active
            </Tag>
          </Option>
          <Option value="Graduation Due">
            <Tag color="warning" icon={<ClockCircleOutlined />} style={{ margin: 0 }}>
              Graduation Due
            </Tag>
          </Option>
          <Option value="Completed">
            <Tag color="default" icon={<CheckCircleOutlined />} style={{ margin: 0 }}>
              Completed
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
          <Tooltip title="View FFS Dossier">
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: '#1890ff' }} />}
              onClick={() => {
                setSelectedSchool(record);
                setIsDossierOpen(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Edit FFS">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: '#52c41a' }} />}
              onClick={() => handleOpenModal(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Record">
            <Popconfirm
              title="Delete field school record?"
              description="Are you sure you want to remove this farmer field school?"
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
        <Breadcrumb.Item>Farmer Field Schools (FFS Groups & Practice)</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#1a5f2c', fontFamily: "'Times New Roman', Times, serif" }}>
            Farmer Field Schools (የአርሶ አደር የሜዳ ትምህርት ቤቶች - FFS)
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Coordinating experiential discovery-based learning cohorts, season-long AESA studies, and comparative plot experiments
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
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Total Enrolled Graduates</span>}
              value={stats.totalGraduates}
              prefix={<ExperimentOutlined style={{ color: '#1a5f2c', marginRight: 8 }} />}
              valueStyle={{ color: '#1a5f2c', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Total FFS Schools: <strong style={{ color: '#262626' }}>{stats.totalSchools} schools</strong>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #1890ff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Male Graduates (ወንድ)</span>}
              value={stats.maleGraduates}
              prefix={<ManOutlined style={{ color: '#1890ff', marginRight: 8 }} />}
              valueStyle={{ color: '#1890ff', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Male participants in field schools
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #722ed1', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Women Graduates (ሴት + ባለትዳር)</span>}
              value={stats.totalWomenGraduates}
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
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Active Cohorts</span>}
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
                placeholder="Search Name, Code, or Facilitator..."
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: 220 }}
                allowClear
              />

              <Select
                placeholder="FFS Category"
                value={categoryFilter}
                onChange={setCategoryFilter}
                style={{ width: 195 }}
                allowClear
              >
                {FFS_CATEGORIES.map((fc) => (
                  <Option key={fc} value={fc}>{fc}</Option>
                ))}
              </Select>

              <Select
                placeholder="Core Activity"
                value={activityFilter}
                onChange={setActivityFilter}
                style={{ width: 200 }}
                allowClear
              >
                {FFS_ACTIVITIES.map((fa) => (
                  <Option key={fa} value={fa}>{fa}</Option>
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
                {[...new Set(schools.map((s) => extractName(s.zone)))].map((z) => (
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
                Export FFS CSV
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
                Register FFS School
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Main Table */}
      <Table
        columns={columns}
        dataSource={filteredSchools}
        rowKey="id"
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} farmer field schools`
        }}
        scroll={{ x: 1350 }}
        bordered
        size="middle"
      />

      {/* Registration / Edit Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ExperimentOutlined style={{ color: '#1a5f2c', fontSize: 20 }} />
            <span style={{ color: '#1a5f2c', fontWeight: 'bold', fontFamily: "'Times New Roman', Times, serif", fontSize: 17 }}>
              {editingSchool ? 'Edit Farmer Field School Record' : 'Register Farmer Field School (የሜዳ ትምህርት ቤት ምዝገባ)'}
            </span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText={editingSchool ? 'Update School' : 'Save School Record'}
        okButtonProps={{ style: { backgroundColor: '#1a5f2c', borderColor: '#1a5f2c' }, loading: isSubmitting }}
        width={800}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            School Identification & Category
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="ffs_code"
                label="FFS Code"
                rules={[{ required: true, message: 'Code required' }]}
              >
                <Input placeholder="e.g. FFS-2019-EG-08" />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item
                name="ffs_name"
                label="Farmer Field School Name"
                rules={[{ required: true, message: 'School name required' }]}
              >
                <Input placeholder="e.g. Kurar Teff IPM Farmer Field School" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="ffs_category"
                label="FFS Category"
                rules={[{ required: true, message: 'Select category' }]}
              >
                <Select>
                  {FFS_CATEGORIES.map((fc) => (
                    <Option key={fc} value={fc}>{fc}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="core_activity"
                label="Core FFS Study Activity"
                rules={[{ required: true, message: 'Select activity' }]}
              >
                <Select>
                  {FFS_ACTIVITIES.map((fa) => (
                    <Option key={fa} value={fa}>{fa}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={14}>
              <Form.Item
                name="facilitator_name"
                label="Facilitator / DA Name"
                rules={[{ required: true, message: 'Facilitator required' }]}
              >
                <Input placeholder="e.g. Ato Mulugeta Fentaw (DA)" />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item
                name="facilitator_phone"
                label="Facilitator Phone Number"
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
            Graduates Enrolled by Cohort (ተመራቂዎች በወኪል ምድብ)
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="male_graduates"
                label="Male Graduates (ወንድ)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="female_graduates"
                label="Female Graduates (ሴት)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="married_women_graduates"
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
                name="youth_graduates"
                label="Youth Graduates (ወጣቶች)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="investors_graduates"
                label="Private Investors (ባለሃብቶች)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="ffs_notes" label="FFS Learning Notes & Observations">
                <TextArea rows={3} placeholder="Summarize agro-ecosystem findings, comparative plot yields, or discovery learning outcomes..." />
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

      {/* Comprehensive FFS Dossier Modal */}
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
                <ExperimentOutlined />
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
                  {selectedSchool?.ffs_name}
                </span>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                  Code: <span style={{ fontFamily: 'monospace' }}>{selectedSchool?.ffs_code}</span> | Facilitator:{' '}
                  {selectedSchool?.facilitator_name}
                </div>
              </div>
            </div>
            <div>
              <Tag
                color={selectedSchool?.ffs_status === 'Active Cohort' ? 'success' : 'processing'}
                icon={selectedSchool?.ffs_status === 'Active Cohort' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                style={{ fontSize: 12, padding: '2px 10px', borderRadius: 12 }}
              >
                {selectedSchool?.ffs_status || 'Active'}
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
              handleOpenModal(selectedSchool);
            }}
          >
            Edit School
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
        {selectedSchool && (
          <div style={{ paddingTop: 8 }}>
            {/* Top Metric Strip */}
            <Row gutter={12} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f6ffed', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Total Graduates</span>}
                    value={
                      (Number(selectedSchool.male_graduates) || 0) +
                      (Number(selectedSchool.female_graduates) || 0) +
                      (Number(selectedSchool.married_women_graduates) || 0) +
                      (Number(selectedSchool.youth_graduates) || 0) +
                      (Number(selectedSchool.investors_graduates) || 0)
                    }
                    suffix={<span style={{ fontSize: 12 }}>People</span>}
                    valueStyle={{ fontSize: 15, fontWeight: 'bold', color: '#1a5f2c' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f0f5ff', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>FFS Category</span>}
                    value={selectedSchool.ffs_category?.split(' ')[0] || 'Category'}
                    valueStyle={{ fontSize: 15, fontWeight: 'bold', color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f9f0ff', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Women Share</span>}
                    value={
                      (Number(selectedSchool.male_graduates) || 0) +
                      (Number(selectedSchool.female_graduates) || 0) +
                      (Number(selectedSchool.married_women_graduates) || 0) +
                      (Number(selectedSchool.youth_graduates) || 0) +
                      (Number(selectedSchool.investors_graduates) || 0) > 0
                        ? (
                            (((Number(selectedSchool.female_graduates) || 0) +
                              (Number(selectedSchool.married_women_graduates) || 0)) /
                              ((Number(selectedSchool.male_graduates) || 0) +
                                (Number(selectedSchool.female_graduates) || 0) +
                                (Number(selectedSchool.married_women_graduates) || 0) +
                                (Number(selectedSchool.youth_graduates) || 0) +
                                (Number(selectedSchool.investors_graduates) || 0))) *
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
                    value={selectedSchool.fiscal_year}
                    valueStyle={{ fontSize: 13, fontWeight: 'bold', color: '#fa8c16' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* TABPANES */}
            <Tabs defaultActiveKey="1" type="card">
              {/* TAB 1: School Profile */}
              <TabPane
                tab={
                  <span>
                    <TeamOutlined />
                    Graduate Demographics & Reach
                  </span>
                }
                key="1"
              >
                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }} style={{ marginBottom: 16 }}>
                  <Descriptions.Item label="FFS Name" span={2}>
                    <strong style={{ color: '#1a5f2c' }}>{selectedSchool.ffs_name}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="FFS Category">
                    <Tag color="purple">{selectedSchool.ffs_category}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Core Activity">
                    <Tag color="green">{selectedSchool.core_activity}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Facilitator">
                    {selectedSchool.facilitator_name} ({selectedSchool.facilitator_phone})
                  </Descriptions.Item>
                </Descriptions>

                <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: 16, background: '#fafafa' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1a5f2c', textTransform: 'uppercase', marginBottom: 12 }}>
                    Graduate Disaggregation (ተመራቂዎች በወኪል ምድብ)
                  </div>
                  <Row gutter={[16, 16]}>
                    <Col span={8}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <ManOutlined style={{ color: '#1890ff', marginRight: 4 }} />
                          Male Graduates (ወንድ)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#1890ff', marginTop: 2 }}>
                          {Number(selectedSchool.male_graduates || 0).toLocaleString()}
                        </div>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <WomanOutlined style={{ color: '#722ed1', marginRight: 4 }} />
                          Female Graduates (ሴት)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#722ed1', marginTop: 2 }}>
                          {Number(selectedSchool.female_graduates || 0).toLocaleString()}
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
                          {Number(selectedSchool.married_women_graduates || 0).toLocaleString()}
                        </div>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <RiseOutlined style={{ color: '#fa8c16', marginRight: 4 }} />
                          Youth Graduates (ወጣቶች)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#fa8c16', marginTop: 2 }}>
                          {Number(selectedSchool.youth_graduates || 0).toLocaleString()}
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
                          {Number(selectedSchool.investors_graduates || 0).toLocaleString()}
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
              </TabPane>

              {/* TAB 2: Learning Notes */}
              <TabPane
                tab={
                  <span>
                    <CheckSquareOutlined />
                    Learning Notes & Outcomes
                  </span>
                }
                key="2"
              >
                <Card size="small" bordered={false} style={{ background: '#fcfdfd', border: '1px solid #e6f7ed', borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <CheckCircleOutlined style={{ color: '#1a5f2c', fontSize: 16 }} />
                    <strong style={{ color: '#1a5f2c', fontSize: 13, textTransform: 'uppercase' }}>
                      FFS Learning Outcomes & Observations (የሜዳ ትምህርት ቤት ግኝቶች)
                    </strong>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: '#262626', lineHeight: '1.6' }}>
                    {selectedSchool.ffs_notes || 'Active farmer field school conducting discovery-based agronomic experiments.'}
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
                    <strong>{extractName(selectedSchool.zone)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Woreda">
                    <strong>{extractName(selectedSchool.woreda)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Kebele Operational Base">
                    <span style={{ color: '#1a5f2c', fontWeight: 'bold' }}>
                      {extractName(selectedSchool.kebele)}
                    </span>
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
                  <Descriptions.Item label="Fiscal Year (በጀት ዓመት)">
                    <Tag color="blue" icon={<CalendarOutlined />}>
                      {selectedSchool.fiscal_year || '2019 E.C.'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Production Campaign Season">
                    <strong>{selectedSchool.season || 'Meher (መኸር)'}</strong>
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

export default function FarmerFieldSchools() {
  return (
    <App>
      <FarmerFieldSchoolsContent />
    </App>
  );
}