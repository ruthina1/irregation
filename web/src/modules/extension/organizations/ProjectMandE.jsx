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
  AreaChartOutlined,
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

const PROJECT_CATEGORIES = [
  'Agricultural Growth Program - AGP III (የግብርና ዕድገት መርሃ ግብር)',
  'Climate Smart Agriculture Project - CSAP (አየር ንብረት ተከላካይ ግብርና)',
  'Sustainable Land Management Program - SLMP (ዘላቂ የመሬት አስተዳደር)',
  'Food Systems Resilience Program - FSRP (የምግብ ስርዓት ጽኑነት መርሃ ግብር)',
  'Livestock & Fisheries Sector Development (የእንስሳትና ዓሣ ሀብት ልማት)'
];

const SUPERVISION_ACTIVITIES = [
  'Joint Donor-Government M&E Field Mission',
  'Baseline Indicator Verification Audit',
  'Mid-Term Evaluation & Performance Review',
  'Financial Disbursement & Procurement Audit',
  'Environmental & Social Safeguard Inspection'
];

const INITIAL_PROJECTS = [
  {
    id: '1',
    project_code: 'MNE-2019-AGP-01',
    project_name: 'AGP-III Regional Productivity & Market Linkage Project',
    project_category: 'Agricultural Growth Program - AGP III (የግብርና ዕድገት መርሃ ግብር)',
    core_activity: 'Joint Donor-Government M&E Field Mission',
    project_coordinator: 'Dr. Belayneh Mekonnen',
    coordinator_phone: '+251 911 223 344',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    allocated_budget_usd: 15000000,
    disbursed_budget_usd: 11200000,
    male_beneficiaries: 4500,
    female_beneficiaries: 1800,
    married_women_beneficiaries: 1450,
    youth_beneficiaries: 1200,
    investors_beneficiaries: 45,
    project_status: 'On Track',
    project_notes: 'Supervision team verified physical progress of cooperative warehouses and milk collection centers.',
    zone: 'East Gojjam',
    woreda: 'Dejen',
    kebele: 'Kurar'
  },
  {
    id: '2',
    project_code: 'MNE-2019-CSAP-04',
    project_name: 'CSAP Watershed Rehabilitation & Climate Smart Initiative',
    project_category: 'Climate Smart Agriculture Project - CSAP (አየር ንብረት ተከላካይ ግብርና)',
    core_activity: 'Baseline Indicator Verification Audit',
    project_coordinator: 'Woizero Tigist Abebe',
    coordinator_phone: '+251 922 556 778',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    allocated_budget_usd: 22000000,
    disbursed_budget_usd: 16500000,
    male_beneficiaries: 5200,
    female_beneficiaries: 2100,
    married_women_beneficiaries: 1700,
    youth_beneficiaries: 1500,
    investors_beneficiaries: 30,
    project_status: 'On Track',
    project_notes: 'Audited hillside terracing survival rates and gully rehabilitation structures in upper catchments.',
    zone: 'South Gondar',
    woreda: 'Fogera',
    kebele: 'Woreta Zuria'
  },
  {
    id: '3',
    project_code: 'MNE-2019-FSRP-09',
    project_name: 'FSRP Food Security & Smallholder Resilience Support',
    project_category: 'Food Systems Resilience Program - FSRP (የምግብ ስርዓት ጽኑነት መርሃ ግብር)',
    core_activity: 'Mid-Term Evaluation & Performance Review',
    project_coordinator: 'Ato Getachew Mekonnen',
    coordinator_phone: '+251 913 990 112',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    allocated_budget_usd: 18000000,
    disbursed_budget_usd: 9800000,
    male_beneficiaries: 3800,
    female_beneficiaries: 1600,
    married_women_beneficiaries: 1300,
    youth_beneficiaries: 950,
    investors_beneficiaries: 25,
    project_status: 'Behind Schedule',
    project_notes: 'Mid-term review noted minor procurement delays in solar irrigation pump deliveries.',
    zone: 'West Gojjam',
    woreda: 'Bure',
    kebele: 'Alefa'
  }
];

function ProjectMandEContent() {
  const { message } = App.useApp();

  const [projects, setProjects] = useState(INITIAL_PROJECTS);
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
  const [editingProject, setEditingProject] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
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
      if (editingProject) {
        const initForm = async () => {
          const zoneMatch = zones.find(
            (z) => z.name === editingProject.zone || z.id === editingProject.zone_id
          );
          if (zoneMatch) {
            try {
              const wRes = locationApi?.getWoredas ? await locationApi.getWoredas(zoneMatch.id) : null;
              const wList = wRes?.data?.data?.data || wRes?.data?.data || [];
              setWoredas(wList);

              const woredaMatch = wList.find(
                (w) => w.name === editingProject.woreda || w.id === editingProject.woreda_id
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
            project_code: editingProject.project_code,
            project_name: editingProject.project_name,
            project_category: editingProject.project_category,
            core_activity: editingProject.core_activity,
            project_coordinator: editingProject.project_coordinator,
            coordinator_phone: editingProject.coordinator_phone,
            fiscal_year: editingProject.fiscal_year || '2019 E.C.',
            season: editingProject.season || 'Meher (መኸር)',
            allocated_budget_usd: Number(editingProject.allocated_budget_usd) || 1000000,
            disbursed_budget_usd: Number(editingProject.disbursed_budget_usd) || 500000,
            male_beneficiaries: Number(editingProject.male_beneficiaries) || 0,
            female_beneficiaries: Number(editingProject.female_beneficiaries) || 0,
            married_women_beneficiaries: Number(editingProject.married_women_beneficiaries) || 0,
            youth_beneficiaries: Number(editingProject.youth_beneficiaries) || 0,
            investors_beneficiaries: Number(editingProject.investors_beneficiaries) || 0,
            project_notes: editingProject.project_notes,
            zone_id: editingProject.zone_id || zoneMatch?.id || editingProject.zone,
            woreda_id: editingProject.woreda_id || editingProject.woreda,
            kebele_id: editingProject.kebele_id || editingProject.kebele
          });
        };
        initForm();
      } else {
        form.resetFields();
        form.setFieldsValue({
          project_category: 'Agricultural Growth Program - AGP III (የግብርና ዕድገት መርሃ ግብር)',
          core_activity: 'Joint Donor-Government M&E Field Mission',
          fiscal_year: '2019 E.C.',
          season: 'Meher (መኸር)',
          allocated_budget_usd: 1000000,
          disbursed_budget_usd: 500000,
          male_beneficiaries: 100,
          female_beneficiaries: 40,
          married_women_beneficiaries: 30,
          youth_beneficiaries: 25,
          investors_beneficiaries: 2
        });
        setWoredas([]);
        setKebeles([]);
      }
    }
  }, [isModalOpen, editingProject, form, zones]);

  const loadData = async () => {
    setIsFetching(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      message.success('Project M&E registry refreshed');
    } catch {
      message.error('Failed to refresh data');
    } finally {
      setIsFetching(false);
    }
  };

  // Direct In-Place Status Update without Opening the Form
  const handleQuickStatusChange = (recordId, newStatus) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === recordId ? { ...p, project_status: newStatus } : p))
    );
    message.success(`Project status updated to "${newStatus}"`);
  };

  // Filter pipeline
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const code = extractName(p.project_code).toLowerCase();
      const name = extractName(p.project_name).toLowerCase();
      const coord = extractName(p.project_coordinator).toLowerCase();
      const kebele = extractName(p.kebele).toLowerCase();
      const woreda = extractName(p.woreda).toLowerCase();
      const zone = extractName(p.zone).toLowerCase();
      const q = searchTerm.toLowerCase();

      const matchesSearch =
        code.includes(q) || name.includes(q) || coord.includes(q) || kebele.includes(q) || woreda.includes(q) || zone.includes(q);
      const matchesCategory = categoryFilter ? p.project_category === categoryFilter : true;
      const matchesActivity = activityFilter ? p.core_activity === activityFilter : true;
      const matchesFY = fiscalYearFilter ? p.fiscal_year === fiscalYearFilter : true;
      const matchesSeason = seasonFilter ? p.season === seasonFilter : true;
      const matchesStatus = statusFilter ? p.project_status === statusFilter : true;
      const matchesZone = zoneFilter ? zone === zoneFilter.toLowerCase() : true;

      return matchesSearch && matchesCategory && matchesActivity && matchesFY && matchesSeason && matchesStatus && matchesZone;
    });
  }, [projects, searchTerm, categoryFilter, activityFilter, fiscalYearFilter, seasonFilter, statusFilter, zoneFilter]);

  // Statistics Calculation
  const stats = useMemo(() => {
    const totalProjects = filteredProjects.length;
    const totalAllocated = filteredProjects.reduce((acc, p) => acc + (Number(p.allocated_budget_usd) || 0), 0);
    const totalDisbursed = filteredProjects.reduce((acc, p) => acc + (Number(p.disbursed_budget_usd) || 0), 0);
    const disbursementRate = totalAllocated > 0 ? ((totalDisbursed / totalAllocated) * 100).toFixed(1) : 0;
    const maleBeneficiaries = filteredProjects.reduce((acc, p) => acc + (Number(p.male_beneficiaries) || 0), 0);
    const femaleBeneficiaries = filteredProjects.reduce((acc, p) => acc + (Number(p.female_beneficiaries) || 0), 0);
    const marriedWomen = filteredProjects.reduce((acc, p) => acc + (Number(p.married_women_beneficiaries) || 0), 0);
    const youth = filteredProjects.reduce((acc, p) => acc + (Number(p.youth_beneficiaries) || 0), 0);
    const investors = filteredProjects.reduce((acc, p) => acc + (Number(p.investors_beneficiaries) || 0), 0);

    const totalBeneficiaries = maleBeneficiaries + femaleBeneficiaries + marriedWomen + youth + investors;
    const totalWomenBeneficiaries = femaleBeneficiaries + marriedWomen;
    const womenRatio = totalBeneficiaries > 0 ? ((totalWomenBeneficiaries / totalBeneficiaries) * 100).toFixed(1) : 0;
    const onTrackCount = filteredProjects.filter((p) => p.project_status === 'On Track').length;

    return {
      totalProjects,
      totalAllocated,
      totalDisbursed,
      disbursementRate,
      totalBeneficiaries,
      maleBeneficiaries,
      femaleBeneficiaries,
      marriedWomen,
      totalWomenBeneficiaries,
      youth,
      investors,
      womenRatio,
      onTrackCount
    };
  }, [filteredProjects]);

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
    setEditingProject(record);
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

      if (editingProject) {
        setProjects((prev) =>
          prev.map((item) =>
            item.id === editingProject.id ? { ...item, ...payload, project_status: editingProject.project_status } : item
          )
        );
        message.success('Project M&E record updated successfully');
      } else {
        const newRecord = {
          ...payload,
          id: Date.now().toString(),
          project_code: values.project_code || `MNE-${Date.now().toString().slice(-4)}`,
          project_status: 'On Track'
        };
        setProjects((prev) => [newRecord, ...prev]);
        message.success('New agricultural project profile registered successfully');
      }
      setIsModalOpen(false);
    } catch (error) {
      message.error(error?.response?.data?.message || error.message || 'Failed to save project M&E record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    setProjects((prev) => prev.filter((item) => item.id !== id));
    message.success('Project M&E record removed');
  };

  const exportToCSV = () => {
    if (!filteredProjects.length) {
      message.warning('No project records available to export');
      return;
    }
    const headers = [
      'Project Code,Project Name,Category,Core Activity,Allocated Budget (USD),Disbursed Budget (USD),Coordinator,Phone,FY,Season,Zone,Woreda,Kebele,Male (ወንድ),Female (ሴት),Married Women (ባለትዳር),Youth (ወጣቶች),Investors (ባለሃብቶች),Total Beneficiaries,Status'
    ];
    const rows = filteredProjects.map((p) => {
      const total =
        (Number(p.male_beneficiaries) || 0) +
        (Number(p.female_beneficiaries) || 0) +
        (Number(p.married_women_beneficiaries) || 0) +
        (Number(p.youth_beneficiaries) || 0) +
        (Number(p.investors_beneficiaries) || 0);

      return [
        `"${p.project_code || ''}"`,
        `"${p.project_name || ''}"`,
        `"${p.project_category || ''}"`,
        `"${p.core_activity || ''}"`,
        p.allocated_budget_usd || 0,
        p.disbursed_budget_usd || 0,
        `"${p.project_coordinator || ''}"`,
        `"${p.coordinator_phone || ''}"`,
        `"${p.fiscal_year || ''}"`,
        `"${p.season || ''}"`,
        `"${extractName(p.zone)}"`,
        `"${extractName(p.woreda)}"`,
        `"${extractName(p.kebele)}"`,
        p.male_beneficiaries || 0,
        p.female_beneficiaries || 0,
        p.married_women_beneficiaries || 0,
        p.youth_beneficiaries || 0,
        p.investors_beneficiaries || 0,
        total,
        `"${p.project_status || ''}"`
      ].join(',');
    });

    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Project_MandE_Supervision_Report_${Date.now()}.csv`;
    a.click();
    message.success('Project M&E report exported successfully');
  };

  const columns = [
    {
      title: 'Project Code & Name',
      key: 'project_info',
      width: 250,
      render: (_, r) => (
        <div>
          <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{r.project_name}</strong>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>
            Code: <span style={{ fontFamily: 'monospace' }}>{r.project_code}</span> | Coordinator: {r.project_coordinator}
          </div>
        </div>
      )
    },
    {
      title: 'Project Category',
      dataIndex: 'project_category',
      key: 'project_category',
      width: 210,
      render: (cat) => {
        let color = 'default';
        if (cat?.includes('AGP')) color = 'green';
        if (cat?.includes('CSAP')) color = 'blue';
        if (cat?.includes('SLMP')) color = 'gold';
        if (cat?.includes('FSRP')) color = 'purple';
        return <Tag color={color}>{cat}</Tag>;
      }
    },
    {
      title: 'Core Supervision Activity',
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
      title: 'Allocated Budget (USD)',
      dataIndex: 'allocated_budget_usd',
      key: 'allocated_budget_usd',
      align: 'right',
      width: 170,
      sorter: (a, b) => (Number(a.allocated_budget_usd) || 0) - (Number(b.allocated_budget_usd) || 0),
      render: (val) => (
        <span style={{ fontWeight: 600, color: '#1a5f2c' }}>
          ${Number(val || 0).toLocaleString()}
        </span>
      )
    },
    {
      title: 'Project Status (In-Place Edit)',
      dataIndex: 'project_status',
      key: 'project_status',
      width: 190,
      render: (status, record) => (
        <Select
          value={status || 'On Track'}
          onChange={(newVal) => handleQuickStatusChange(record.id, newVal)}
          style={{ width: '100%' }}
          size="small"
        >
          <Option value="On Track">
            <Tag color="success" icon={<CheckCircleOutlined />} style={{ margin: 0 }}>
              On Track
            </Tag>
          </Option>
          <Option value="Behind Schedule">
            <Tag color="warning" icon={<ClockCircleOutlined />} style={{ margin: 0 }}>
              Delayed
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
          <Tooltip title="View Project Dossier">
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: '#1890ff' }} />}
              onClick={() => {
                setSelectedProject(record);
                setIsDossierOpen(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Edit Project">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: '#52c41a' }} />}
              onClick={() => handleOpenModal(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Record">
            <Popconfirm
              title="Delete project M&E record?"
              description="Are you sure you want to remove this project profile?"
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
        <Breadcrumb.Item>Project & Program M&E (Profiles & Supervision)</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#1a5f2c', fontFamily: "'Times New Roman', Times, serif" }}>
            Project & Program M&E (Profiles & Supervision) (የፕሮጀክቶችና መርሃ-ግብሮች ክትትልና ግምገማ)
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Tracking multi-year agricultural project profiles, field supervision missions, milestone verifications, and financial disbursement audits
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
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Total Allocated Budget (USD)</span>}
              value={stats.totalAllocated}
              prefix="$"
              formatter={(val) => Number(val).toLocaleString()}
              valueStyle={{ color: '#1a5f2c', fontWeight: 'bold', fontSize: 22 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Total Projects: <strong style={{ color: '#262626' }}>{stats.totalProjects} programs</strong>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #1890ff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Total Disbursed Budget (USD)</span>}
              value={stats.totalDisbursed}
              prefix="$"
              formatter={(val) => Number(val).toLocaleString()}
              valueStyle={{ color: '#1890ff', fontWeight: 'bold', fontSize: 22 }}
            />
            <Progress percent={Number(stats.disbursementRate)} size="small" strokeColor="#1890ff" />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Disbursement Rate: <strong style={{ color: '#1890ff' }}>{stats.disbursementRate}%</strong>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #722ed1', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Total Beneficiaries</span>}
              value={stats.totalBeneficiaries}
              prefix={<TeamOutlined style={{ color: '#722ed1', marginRight: 8 }} />}
              valueStyle={{ color: '#722ed1', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Women Share: <strong style={{ color: '#722ed1' }}>{stats.womenRatio}%</strong>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #fa8c16', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Projects On Track</span>}
              value={stats.onTrackCount}
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
                placeholder="Search Name, Code, or Coordinator..."
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: 220 }}
                allowClear
              />

              <Select
                placeholder="Project Category"
                value={categoryFilter}
                onChange={setCategoryFilter}
                style={{ width: 195 }}
                allowClear
              >
                {PROJECT_CATEGORIES.map((pc) => (
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
                {SUPERVISION_ACTIVITIES.map((sa) => (
                  <Option key={sa} value={sa}>{sa}</Option>
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
                {[...new Set(projects.map((p) => extractName(p.zone)))].map((z) => (
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
                Export M&E CSV
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
                Register Project M&E
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Main Table */}
      <Table
        columns={columns}
        dataSource={filteredProjects}
        rowKey="id"
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} agricultural projects`
        }}
        scroll={{ x: 1350 }}
        bordered
        size="middle"
      />

      {/* Registration / Edit Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AreaChartOutlined style={{ color: '#1a5f2c', fontSize: 20 }} />
            <span style={{ color: '#1a5f2c', fontWeight: 'bold', fontFamily: "'Times New Roman', Times, serif", fontSize: 17 }}>
              {editingProject ? 'Edit Project M&E Profile' : 'Register Agricultural Project M&E (የፕሮጀክት ክትትልና ግምገማ ምዝገባ)'}
            </span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText={editingProject ? 'Update Project' : 'Save Project Record'}
        okButtonProps={{ style: { backgroundColor: '#1a5f2c', borderColor: '#1a5f2c' }, loading: isSubmitting }}
        width={800}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Project Identification & Category
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="project_code"
                label="Project Code"
                rules={[{ required: true, message: 'Code required' }]}
              >
                <Input placeholder="e.g. MNE-2019-AGP-08" />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item
                name="project_name"
                label="Project / Program Title"
                rules={[{ required: true, message: 'Project name required' }]}
              >
                <Input placeholder="e.g. AGP-III Regional Productivity & Market Linkage" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="project_category"
                label="Project Category"
                rules={[{ required: true, message: 'Select category' }]}
              >
                <Select>
                  {PROJECT_CATEGORIES.map((pc) => (
                    <Option key={pc} value={pc}>{pc}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="core_activity"
                label="Core Supervision Activity"
                rules={[{ required: true, message: 'Select activity' }]}
              >
                <Select>
                  {SUPERVISION_ACTIVITIES.map((sa) => (
                    <Option key={sa} value={sa}>{sa}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={14}>
              <Form.Item
                name="project_coordinator"
                label="Project Coordinator / Director"
                rules={[{ required: true, message: 'Coordinator required' }]}
              >
                <Input placeholder="e.g. Dr. Belayneh Mekonnen" />
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
            Timeline & Budget Allocation (USD)
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
                name="allocated_budget_usd"
                label="Allocated Budget (USD)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={(value) => value.replace(/\$\s?|(,*)/g, '')} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="disbursed_budget_usd"
                label="Disbursed Budget (USD)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={(value) => value.replace(/\$\s?|(,*)/g, '')} />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Beneficiaries Enrolled by Cohort (ተጠቃሚዎች በወኪል ምድብ)
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="male_beneficiaries"
                label="Male Beneficiaries (ወንድ)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="female_beneficiaries"
                label="Female Beneficiaries (ሴት)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="married_women_beneficiaries"
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
                name="youth_beneficiaries"
                label="Youth Beneficiaries (ወጣቶች)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="investors_beneficiaries"
                label="Private Investors (ባለሃብቶች)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="project_notes" label="Supervision Findings & Progress Notes">
                <TextArea rows={3} placeholder="Summarize physical milestone achievements, audit findings, or operational bottlenecks..." />
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

      {/* Comprehensive Project Dossier Modal */}
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
                <AreaChartOutlined />
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
                  {selectedProject?.project_name}
                </span>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                  Code: <span style={{ fontFamily: 'monospace' }}>{selectedProject?.project_code}</span> | Coordinator:{' '}
                  {selectedProject?.project_coordinator}
                </div>
              </div>
            </div>
            <div>
              <Tag
                color={selectedProject?.project_status === 'On Track' ? 'success' : 'processing'}
                icon={selectedProject?.project_status === 'On Track' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                style={{ fontSize: 12, padding: '2px 10px', borderRadius: 12 }}
              >
                {selectedProject?.project_status || 'On Track'}
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
              handleOpenModal(selectedProject);
            }}
          >
            Edit Project
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
        {selectedProject && (
          <div style={{ paddingTop: 8 }}>
            {/* Top Metric Strip */}
            <Row gutter={12} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f6ffed', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Allocated Budget</span>}
                    value={selectedProject.allocated_budget_usd || 0}
                    prefix="$"
                    formatter={(val) => Number(val).toLocaleString()}
                    valueStyle={{ fontSize: 14, fontWeight: 'bold', color: '#1a5f2c' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f0f5ff', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Disbursed Budget</span>}
                    value={selectedProject.disbursed_budget_usd || 0}
                    prefix="$"
                    formatter={(val) => Number(val).toLocaleString()}
                    valueStyle={{ fontSize: 14, fontWeight: 'bold', color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f9f0ff', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Disbursement Rate</span>}
                    value={
                      Number(selectedProject.allocated_budget_usd) > 0
                        ? ((Number(selectedProject.disbursed_budget_usd) / Number(selectedProject.allocated_budget_usd)) * 100).toFixed(1)
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
                    value={selectedProject.fiscal_year}
                    valueStyle={{ fontSize: 13, fontWeight: 'bold', color: '#fa8c16' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* TABPANES */}
            <Tabs defaultActiveKey="1" type="card">
              {/* TAB 1: Project Profile */}
              <TabPane
                tab={
                  <span>
                    <TeamOutlined />
                    Beneficiary Demographics & Reach
                  </span>
                }
                key="1"
              >
                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }} style={{ marginBottom: 16 }}>
                  <Descriptions.Item label="Project Name" span={2}>
                    <strong style={{ color: '#1a5f2c' }}>{selectedProject.project_name}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Project Category">
                    <Tag color="purple">{selectedProject.project_category}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Supervision Activity">
                    <Tag color="green">{selectedProject.core_activity}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Coordinator">
                    {selectedProject.project_coordinator} ({selectedProject.coordinator_phone})
                  </Descriptions.Item>
                </Descriptions>

                <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: 16, background: '#fafafa' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1a5f2c', textTransform: 'uppercase', marginBottom: 12 }}>
                    Beneficiary Disaggregation (ተጠቃሚዎች በወኪል ምድብ)
                  </div>
                  <Row gutter={[16, 16]}>
                    <Col span={8}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <ManOutlined style={{ color: '#1890ff', marginRight: 4 }} />
                          Male Beneficiaries (ወንድ)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#1890ff', marginTop: 2 }}>
                          {Number(selectedProject.male_beneficiaries || 0).toLocaleString()}
                        </div>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <WomanOutlined style={{ color: '#722ed1', marginRight: 4 }} />
                          Female Beneficiaries (ሴት)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#722ed1', marginTop: 2 }}>
                          {Number(selectedProject.female_beneficiaries || 0).toLocaleString()}
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
                          {Number(selectedProject.married_women_beneficiaries || 0).toLocaleString()}
                        </div>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <RiseOutlined style={{ color: '#fa8c16', marginRight: 4 }} />
                          Youth Beneficiaries (ወጣቶች)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#fa8c16', marginTop: 2 }}>
                          {Number(selectedProject.youth_beneficiaries || 0).toLocaleString()}
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
                          {Number(selectedProject.investors_beneficiaries || 0).toLocaleString()}
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
                    Supervision Notes & Findings
                  </span>
                }
                key="2"
              >
                <Card size="small" bordered={false} style={{ background: '#fcfdfd', border: '1px solid #e6f7ed', borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <CheckCircleOutlined style={{ color: '#1a5f2c', fontSize: 16 }} />
                    <strong style={{ color: '#1a5f2c', fontSize: 13, textTransform: 'uppercase' }}>
                      Supervision Findings & Progress (የፕሮጀክት ክትትልና ግምገማ ማስታወሻ)
                    </strong>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: '#262626', lineHeight: '1.6' }}>
                    {selectedProject.project_notes || 'Active project program undergoing regular supervision and milestone verification.'}
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
                    <strong>{extractName(selectedProject.zone)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Woreda">
                    <strong>{extractName(selectedProject.woreda)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Kebele Operational Base">
                    <span style={{ color: '#1a5f2c', fontWeight: 'bold' }}>
                      {extractName(selectedProject.kebele)}
                    </span>
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
                  <Descriptions.Item label="Fiscal Year (በጀት ዓመት)">
                    <Tag color="blue" icon={<CalendarOutlined />}>
                      {selectedProject.fiscal_year || '2019 E.C.'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Production Campaign Season">
                    <strong>{selectedProject.season || 'Meher (መኸር)'}</strong>
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

export default function ProjectMandE() {
  return (
    <App>
      <ProjectMandEContent />
    </App>
  );
}