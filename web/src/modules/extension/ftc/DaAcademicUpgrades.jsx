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
  BookOutlined,
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

const UPGRADE_LEVELS = [
  'Certificate to Diploma Upgrade (ከሰርተፍኬት ወደ ዲፕሎማ)',
  'Diploma to BSc Degree Upgrade (ከዲፕሎማ ወደ የመጀመሪያ ዲግሪ - BSc)',
  'BSc to MSc Postgraduate Specialization (ከዲግሪ ወደ ማስተርስ - MSc)',
  'Doctorate / PhD Specialization Fellowship (የዶክትሬት/PhD መርሃ ግብር)'
];

const UPGRADE_ACTIVITIES = [
  'Enrolment & Institutional Placement',
  'Semester Modular Exam & Practical Evaluation',
  'Thesis Research & Field Data Collection',
  'Graduation & Credential Re-Classification',
  'In-Service Scholarship Grant Disbursement'
];

const INITIAL_UPGRADES = [
  {
    id: '1',
    upgrade_code: 'DAU-2019-EG-01',
    upgrade_title: 'Dejen Woreda DA Diploma-to-BSc Agricultural Extension Cohort',
    upgrade_level: 'Diploma to BSc Degree Upgrade (ከዲፕሎማ ወደ የመጀመሪያ ዲግሪ - BSc)',
    core_activity: 'Enrolment & Institutional Placement',
    program_coordinator: 'Dr. Belayneh Mekonnen (Dean of Studies)',
    coordinator_phone: '+251 911 223 344',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    study_duration_years: 2,
    male_candidates: 18,
    female_candidates: 12,
    married_women_candidates: 10,
    youth_candidates: 8,
    investors_candidates: 0,
    upgrade_status: 'Enrolled & Active',
    upgrade_notes: 'Sponsored 30 frontline Development Agents for in-service BSc upgrading at Bahir Dar University college of agriculture.',
    zone: 'East Gojjam',
    woreda: 'Dejen',
    kebele: 'Kurar'
  },
  {
    id: '2',
    upgrade_code: 'DAU-2019-SG-04',
    upgrade_title: 'Fogera Certificate-to-Diploma Agronomy Upgrading Program',
    upgrade_level: 'Certificate to Diploma Upgrade (ከሰርተፍኬት ወደ ዲፕሎማ)',
    core_activity: 'Semester Modular Exam & Practical Evaluation',
    program_coordinator: 'Woizero Tigist Abebe',
    coordinator_phone: '+251 922 556 778',
    fiscal_year: '2019 E.C.',
    season: 'Bega / Irrigation (መስኖ/በጋ)',
    study_duration_years: 1.5,
    male_candidates: 14,
    female_candidates: 16,
    married_women_candidates: 14,
    youth_candidates: 10,
    investors_candidates: 0,
    upgrade_status: 'Graduated & Promoted',
    upgrade_notes: 'Successfully graduated 30 junior DAs from certificate level to full agricultural diploma status.',
    zone: 'South Gondar',
    woreda: 'Fogera',
    kebele: 'Woreta Zuria'
  },
  {
    id: '3',
    upgrade_code: 'DAU-2019-WG-09',
    upgrade_title: 'Bure Woreda Specialist BSc-to-MSc Watershed Fellowship',
    upgrade_level: 'BSc to MSc Postgraduate Specialization (ከዲግሪ ወደ ማስተርስ - MSc)',
    core_activity: 'Thesis Research & Field Data Collection',
    program_coordinator: 'Ato Getachew Mekonnen',
    coordinator_phone: '+251 913 990 112',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    study_duration_years: 2,
    male_candidates: 8,
    female_candidates: 4,
    married_women_candidates: 3,
    youth_candidates: 4,
    investors_candidates: 0,
    upgrade_status: 'Enrolled & Active',
    upgrade_notes: 'Supporting 12 woreda subject specialists undertaking postgraduate research in climate-smart watershed management.',
    zone: 'West Gojjam',
    woreda: 'Bure',
    kebele: 'Alefa'
  }
];

function DaAcademicUpgradesContent() {
  const { message } = App.useApp();

  const [upgrades, setUpgrades] = useState(INITIAL_UPGRADES);
  const [isFetching, setIsFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState(null);
  const [activityFilter, setActivityFilter] = useState(null);
  const [fiscalYearFilter, setFiscalYearFilter] = useState(null);
  const [seasonFilter, setSeasonFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [zoneFilter, setZoneFilter] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUpgrade, setEditingUpgrade] = useState(null);
  const [selectedUpgrade, setSelectedUpgrade] = useState(null);
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
      if (editingUpgrade) {
        const initForm = async () => {
          const zoneMatch = zones.find(
            (z) => z.name === editingUpgrade.zone || z.id === editingUpgrade.zone_id
          );
          if (zoneMatch) {
            try {
              const wRes = locationApi?.getWoredas ? await locationApi.getWoredas(zoneMatch.id) : null;
              const wList = wRes?.data?.data?.data || wRes?.data?.data || [];
              setWoredas(wList);

              const woredaMatch = wList.find(
                (w) => w.name === editingUpgrade.woreda || w.id === editingUpgrade.woreda_id
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
            upgrade_code: editingUpgrade.upgrade_code,
            upgrade_title: editingUpgrade.upgrade_title,
            upgrade_level: editingUpgrade.upgrade_level,
            core_activity: editingUpgrade.core_activity,
            program_coordinator: editingUpgrade.program_coordinator,
            coordinator_phone: editingUpgrade.coordinator_phone,
            fiscal_year: editingUpgrade.fiscal_year || '2019 E.C.',
            season: editingUpgrade.season || 'Meher (መኸር)',
            study_duration_years: Number(editingUpgrade.study_duration_years) || 2,
            male_candidates: Number(editingUpgrade.male_candidates) || 0,
            female_candidates: Number(editingUpgrade.female_candidates) || 0,
            married_women_candidates: Number(editingUpgrade.married_women_candidates) || 0,
            youth_candidates: Number(editingUpgrade.youth_candidates) || 0,
            investors_candidates: Number(editingUpgrade.investors_candidates) || 0,
            upgrade_notes: editingUpgrade.upgrade_notes,
            zone_id: editingUpgrade.zone_id || zoneMatch?.id || editingUpgrade.zone,
            woreda_id: editingUpgrade.woreda_id || editingUpgrade.woreda,
            kebele_id: editingUpgrade.kebele_id || editingUpgrade.kebele
          });
        };
        initForm();
      } else {
        form.resetFields();
        form.setFieldsValue({
          upgrade_level: 'Diploma to BSc Degree Upgrade (ከዲፕሎማ ወደ የመጀመሪያ ዲግሪ - BSc)',
          core_activity: 'Enrolment & Institutional Placement',
          fiscal_year: '2019 E.C.',
          season: 'Meher (መኸር)',
          study_duration_years: 2,
          male_candidates: 15,
          female_candidates: 10,
          married_women_candidates: 8,
          youth_candidates: 6,
          investors_candidates: 0
        });
        setWoredas([]);
        setKebeles([]);
      }
    }
  }, [isModalOpen, editingUpgrade, form, zones]);

  const loadData = async () => {
    setIsFetching(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      message.success('DA academic upgrades registry refreshed');
    } catch {
      message.error('Failed to refresh data');
    } finally {
      setIsFetching(false);
    }
  };

  // Direct In-Place Status Update without Opening the Form
  const handleQuickStatusChange = (recordId, newStatus) => {
    setUpgrades((prev) =>
      prev.map((u) => (u.id === recordId ? { ...u, upgrade_status: newStatus } : u))
    );
    message.success(`Upgrade status updated to "${newStatus}"`);
  };

  // Filter pipeline
  const filteredUpgrades = useMemo(() => {
    return upgrades.filter((u) => {
      const code = extractName(u.upgrade_code).toLowerCase();
      const title = extractName(u.upgrade_title).toLowerCase();
      const coord = extractName(u.program_coordinator).toLowerCase();
      const kebele = extractName(u.kebele).toLowerCase();
      const woreda = extractName(u.woreda).toLowerCase();
      const zone = extractName(u.zone).toLowerCase();
      const q = searchTerm.toLowerCase();

      const matchesSearch =
        code.includes(q) || title.includes(q) || coord.includes(q) || kebele.includes(q) || woreda.includes(q) || zone.includes(q);
      const matchesLevel = levelFilter ? u.upgrade_level === levelFilter : true;
      const matchesActivity = activityFilter ? u.core_activity === activityFilter : true;
      const matchesFY = fiscalYearFilter ? u.fiscal_year === fiscalYearFilter : true;
      const matchesSeason = seasonFilter ? u.season === seasonFilter : true;
      const matchesStatus = statusFilter ? u.upgrade_status === statusFilter : true;
      const matchesZone = zoneFilter ? zone === zoneFilter.toLowerCase() : true;

      return matchesSearch && matchesLevel && matchesActivity && matchesFY && matchesSeason && matchesStatus && matchesZone;
    });
  }, [upgrades, searchTerm, levelFilter, activityFilter, fiscalYearFilter, seasonFilter, statusFilter, zoneFilter]);

  // Statistics Calculation
  const stats = useMemo(() => {
    const totalUpgrades = filteredUpgrades.length;
    const maleCandidates = filteredUpgrades.reduce((acc, u) => acc + (Number(u.male_candidates) || 0), 0);
    const femaleCandidates = filteredUpgrades.reduce((acc, u) => acc + (Number(u.female_candidates) || 0), 0);
    const marriedWomen = filteredUpgrades.reduce((acc, u) => acc + (Number(u.married_women_candidates) || 0), 0);
    const youth = filteredUpgrades.reduce((acc, u) => acc + (Number(u.youth_candidates) || 0), 0);
    const investors = filteredUpgrades.reduce((acc, u) => acc + (Number(u.investors_candidates) || 0), 0);

    const totalCandidates = maleCandidates + femaleCandidates + marriedWomen + youth + investors;
    const totalWomenCandidates = femaleCandidates + marriedWomen;
    const womenRatio = totalCandidates > 0 ? ((totalWomenCandidates / totalCandidates) * 100).toFixed(1) : 0;
    const activeCount = filteredUpgrades.filter((u) => u.upgrade_status === 'Enrolled & Active').length;

    return {
      totalUpgrades,
      totalCandidates,
      maleCandidates,
      femaleCandidates,
      marriedWomen,
      totalWomenCandidates,
      youth,
      investors,
      womenRatio,
      activeCount
    };
  }, [filteredUpgrades]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setLevelFilter(null);
    setActivityFilter(null);
    setFiscalYearFilter(null);
    setSeasonFilter(null);
    setStatusFilter(null);
    setZoneFilter(null);
  };

  const handleOpenModal = (record = null) => {
    setEditingUpgrade(record);
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

      if (editingUpgrade) {
        setUpgrades((prev) =>
          prev.map((item) =>
            item.id === editingUpgrade.id ? { ...item, ...payload, upgrade_status: editingUpgrade.upgrade_status } : item
          )
        );
        message.success('DA career upgrade record updated successfully');
      } else {
        const newRecord = {
          ...payload,
          id: Date.now().toString(),
          upgrade_code: values.upgrade_code || `DAU-${Date.now().toString().slice(-4)}`,
          upgrade_status: 'Enrolled & Active'
        };
        setUpgrades((prev) => [newRecord, ...prev]);
        message.success('New DA career upgrade cohort registered successfully');
      }
      setIsModalOpen(false);
    } catch (error) {
      message.error(error?.response?.data?.message || error.message || 'Failed to save academic upgrade record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    setUpgrades((prev) => prev.filter((item) => item.id !== id));
    message.success('DA career upgrade record removed');
  };

  const exportToCSV = () => {
    if (!filteredUpgrades.length) {
      message.warning('No academic upgrade records available to export');
      return;
    }
    const headers = [
      'Upgrade Code,Title,Category,Core Activity,Duration (Years),Coordinator,Phone,FY,Season,Zone,Woreda,Kebele,Male (ወንድ),Female (ሴት),Married Women (ባለትዳር),Youth (ወጣቶች),Investors (ባለሃብቶች),Total Candidates,Status'
    ];
    const rows = filteredUpgrades.map((u) => {
      const total =
        (Number(u.male_candidates) || 0) +
        (Number(u.female_candidates) || 0) +
        (Number(u.married_women_candidates) || 0) +
        (Number(u.youth_candidates) || 0) +
        (Number(u.investors_candidates) || 0);

      return [
        `"${u.upgrade_code || ''}"`,
        `"${u.upgrade_title || ''}"`,
        `"${u.upgrade_level || ''}"`,
        `"${u.core_activity || ''}"`,
        u.study_duration_years || 1,
        `"${u.program_coordinator || ''}"`,
        `"${u.coordinator_phone || ''}"`,
        `"${u.fiscal_year || ''}"`,
        `"${u.season || ''}"`,
        `"${extractName(u.zone)}"`,
        `"${extractName(u.woreda)}"`,
        `"${extractName(u.kebele)}"`,
        u.male_candidates || 0,
        u.female_candidates || 0,
        u.married_women_candidates || 0,
        u.youth_candidates || 0,
        u.investors_candidates || 0,
        total,
        `"${u.upgrade_status || ''}"`
      ].join(',');
    });

    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DA_Academic_Career_Upgrades_${Date.now()}.csv`;
    a.click();
    message.success('DA academic upgrades report exported successfully');
  };

  const columns = [
    {
      title: 'Upgrade Code & Title',
      key: 'upgrade_info',
      width: 250,
      render: (_, r) => (
        <div>
          <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{r.upgrade_title}</strong>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>
            Code: <span style={{ fontFamily: 'monospace' }}>{r.upgrade_code}</span> | Coordinator: {r.program_coordinator}
          </div>
        </div>
      )
    },
    {
      title: 'Upgrade Level',
      dataIndex: 'upgrade_level',
      key: 'upgrade_level',
      width: 210,
      render: (level) => {
        let color = 'default';
        if (level?.includes('Certificate')) color = 'blue';
        if (level?.includes('Diploma to BSc')) color = 'green';
        if (level?.includes('BSc to MSc')) color = 'purple';
        if (level?.includes('Doctorate')) color = 'gold';
        return <Tag color={color}>{level}</Tag>;
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
          <Tooltip title={`${extractName(r.zone)} &gt; ${extractName(r.woreda)}`}>
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
      title: 'Candidates Enrolled',
      key: 'candidates_breakdown',
      width: 230,
      render: (_, r) => {
        const total =
          (Number(r.male_candidates) || 0) +
          (Number(r.female_candidates) || 0) +
          (Number(r.married_women_candidates) || 0) +
          (Number(r.youth_candidates) || 0) +
          (Number(r.investors_candidates) || 0);

        return (
          <div style={{ fontSize: 11 }}>
            <div>
              Total: <strong style={{ color: '#1a5f2c' }}>{total.toLocaleString()} Candidates</strong>
            </div>
            <div style={{ color: '#8c8c8c' }}>
              <span>ወንድ: {r.male_candidates || 0}</span> | <span>ሴት: {r.female_candidates || 0}</span> | <span>ባለትዳር: {r.married_women_candidates || 0}</span>
            </div>
          </div>
        );
      }
    },
    {
      title: 'Upgrade Status (In-Place Edit)',
      dataIndex: 'upgrade_status',
      key: 'upgrade_status',
      width: 190,
      render: (status, record) => (
        <Select
          value={status || 'Enrolled & Active'}
          onChange={(newVal) => handleQuickStatusChange(record.id, newVal)}
          style={{ width: '100%' }}
          size="small"
        >
          <Option value="Enrolled & Active">
            <Tag color="success" icon={<CheckCircleOutlined />} style={{ margin: 0 }}>
              Active
            </Tag>
          </Option>
          <Option value="Graduated & Promoted">
            <Tag color="purple" icon={<CheckCircleOutlined />} style={{ margin: 0 }}>
              Graduated
            </Tag>
          </Option>
          <Option value="Deferred">
            <Tag color="warning" icon={<ClockCircleOutlined />} style={{ margin: 0 }}>
              Deferred
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
          <Tooltip title="View Upgrade Dossier">
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: '#1890ff' }} />}
              onClick={() => {
                setSelectedUpgrade(record);
                setIsDossierOpen(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Edit Upgrade">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: '#52c41a' }} />}
              onClick={() => handleOpenModal(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Record">
            <Popconfirm
              title="Delete academic upgrade record?"
              description="Are you sure you want to remove this DA career upgrade cohort?"
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
        <Breadcrumb.Item>DA Career Upgrades (Certificate to Diploma to Degree to MSc)</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#1a5f2c', fontFamily: "'Times New Roman', Times, serif" }}>
            DA Career Upgrades (Certificate to Diploma to Degree to MSc) (የልማት ሰራተኞች የትምህርት እድገትና ማሻሻያ)
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Coordinating in-service scholarship grants, academic upgrading cohorts, and professional credential re-classifications for extension staff
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
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Total Candidates Enrolled</span>}
              value={stats.totalCandidates}
              prefix={<BookOutlined style={{ color: '#1a5f2c', marginRight: 8 }} />}
              valueStyle={{ color: '#1a5f2c', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Total Cohorts: <strong style={{ color: '#262626' }}>{stats.totalUpgrades} programs</strong>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #1890ff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Male Candidates (ወንድ)</span>}
              value={stats.maleCandidates}
              prefix={<ManOutlined style={{ color: '#1890ff', marginRight: 8 }} />}
              valueStyle={{ color: '#1890ff', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Male DAs in academic upgrading
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #722ed1', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Women Candidates (ሴት + ባለትዳር)</span>}
              value={stats.totalWomenCandidates}
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
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Enrolled & Active</span>}
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
                placeholder="Search Title, Code, or Coordinator..."
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: 220 }}
                allowClear
              />

              <Select
                placeholder="Upgrade Level"
                value={levelFilter}
                onChange={setLevelFilter}
                style={{ width: 195 }}
                allowClear
              >
                {UPGRADE_LEVELS.map((ul) => (
                  <Option key={ul} value={ul}>{ul}</Option>
                ))}
              </Select>

              <Select
                placeholder="Core Activity"
                value={activityFilter}
                onChange={setActivityFilter}
                style={{ width: 200 }}
                allowClear
              >
                {UPGRADE_ACTIVITIES.map((ua) => (
                  <Option key={ua} value={ua}>{ua}</Option>
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
                {[...new Set(upgrades.map((u) => extractName(u.zone)))].map((z) => (
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
                Export Upgrade CSV
              </Button>

              <Button
                icon={<ClearOutlined />}
                onClick={handleResetFilters}
                disabled={!(searchTerm || levelFilter || activityFilter || fiscalYearFilter || seasonFilter || statusFilter || zoneFilter)}
              >
                Reset Filters
              </Button>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => handleOpenModal(null)}
                style={{ backgroundColor: '#1a5f2c', borderColor: '#1a5f2c', fontWeight: 600 }}
              >
                Register Upgrade Cohort
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Main Table */}
      <Table
        columns={columns}
        dataSource={filteredUpgrades}
        rowKey="id"
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} DA academic upgrade cohorts`
        }}
        scroll={{ x: 1350 }}
        bordered
        size="middle"
      />

      {/* Registration / Edit Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BookOutlined style={{ color: '#1a5f2c', fontSize: 20 }} />
            <span style={{ color: '#1a5f2c', fontWeight: 'bold', fontFamily: "'Times New Roman', Times, serif", fontSize: 17 }}>
              {editingUpgrade ? 'Edit DA Upgrade Record' : 'Register DA Career Upgrade Cohort (የልማት ሰራተኞች የትምህርት እድገት ምዝገባ)'}
            </span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText={editingUpgrade ? 'Update Upgrade Cohort' : 'Save Upgrade Record'}
        okButtonProps={{ style: { backgroundColor: '#1a5f2c', borderColor: '#1a5f2c' }, loading: isSubmitting }}
        width={800}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Upgrade Identification & Academic Level
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="upgrade_code"
                label="Upgrade Code"
                rules={[{ required: true, message: 'Code required' }]}
              >
                <Input placeholder="e.g. DAU-2019-EG-08" />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item
                name="upgrade_title"
                label="Upgrade Cohort Title / Description"
                rules={[{ required: true, message: 'Title required' }]}
              >
                <Input placeholder="e.g. Dejen Woreda DA Diploma-to-BSc Extension Cohort" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="upgrade_level"
                label="Academic Upgrade Level"
                rules={[{ required: true, message: 'Select level' }]}
              >
                <Select>
                  {UPGRADE_LEVELS.map((ul) => (
                    <Option key={ul} value={ul}>{ul}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="core_activity"
                label="Core Program Activity"
                rules={[{ required: true, message: 'Select activity' }]}
              >
                <Select>
                  {UPGRADE_ACTIVITIES.map((ua) => (
                    <Option key={ua} value={ua}>{ua}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={14}>
              <Form.Item
                name="program_coordinator"
                label="Program Coordinator / Dean Name"
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
            Timeline & Study Duration (Years)
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
                name="study_duration_years"
                label="Study Duration (Years)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0.5} max={5} step={0.5} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Candidates Enrolled by Cohort (ሰልጣኝ ባለሙያዎች በወኪል ምድብ)
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="male_candidates"
                label="Male Candidates (ወንድ)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="female_candidates"
                label="Female Candidates (ሴት)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="married_women_candidates"
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
                name="youth_candidates"
                label="Youth Candidates (ወጣቶች)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="investors_candidates"
                label="Private Investors (ባለሃብቶች)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="upgrade_notes" label="Academic Progress & Scholarship Notes">
                <TextArea rows={3} placeholder="Summarize university placements, semester exam results, or thesis research milestones..." />
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

      {/* Comprehensive Upgrade Dossier Modal */}
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
                <BookOutlined />
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
                  {selectedUpgrade?.upgrade_title}
                </span>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                  Code: <span style={{ fontFamily: 'monospace' }}>{selectedUpgrade?.upgrade_code}</span> | Coordinator:{' '}
                  {selectedUpgrade?.program_coordinator}
                </div>
              </div>
            </div>
            <div>
              <Tag
                color={selectedUpgrade?.upgrade_status === 'Enrolled & Active' ? 'success' : 'purple'}
                icon={selectedUpgrade?.upgrade_status === 'Enrolled & Active' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                style={{ fontSize: 12, padding: '2px 10px', borderRadius: 12 }}
              >
                {selectedUpgrade?.upgrade_status || 'Active'}
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
              handleOpenModal(selectedUpgrade);
            }}
          >
            Edit Upgrade
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
        {selectedUpgrade && (
          <div style={{ paddingTop: 8 }}>
            {/* Top Metric Strip */}
            <Row gutter={12} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f6ffed', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Total Candidates</span>}
                    value={
                      (Number(selectedUpgrade.male_candidates) || 0) +
                      (Number(selectedUpgrade.female_candidates) || 0) +
                      (Number(selectedUpgrade.married_women_candidates) || 0) +
                      (Number(selectedUpgrade.youth_candidates) || 0) +
                      (Number(selectedUpgrade.investors_candidates) || 0)
                    }
                    suffix={<span style={{ fontSize: 12 }}>Staff</span>}
                    valueStyle={{ fontSize: 15, fontWeight: 'bold', color: '#1a5f2c' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f0f5ff', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Upgrade Level</span>}
                    value={selectedUpgrade.upgrade_level?.split(' ')[0] || 'Level'}
                    valueStyle={{ fontSize: 15, fontWeight: 'bold', color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f9f0ff', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Women Share</span>}
                    value={
                      (Number(selectedUpgrade.male_candidates) || 0) +
                      (Number(selectedUpgrade.female_candidates) || 0) +
                      (Number(selectedUpgrade.married_women_candidates) || 0) +
                      (Number(selectedUpgrade.youth_candidates) || 0) +
                      (Number(selectedUpgrade.investors_candidates) || 0) > 0
                        ? (
                            (((Number(selectedUpgrade.female_candidates) || 0) +
                              (Number(selectedUpgrade.married_women_candidates) || 0)) /
                              ((Number(selectedUpgrade.male_candidates) || 0) +
                                (Number(selectedUpgrade.female_candidates) || 0) +
                                (Number(selectedUpgrade.married_women_candidates) || 0) +
                                (Number(selectedUpgrade.youth_candidates) || 0) +
                                (Number(selectedUpgrade.investors_candidates) || 0))) *
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
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Study Duration</span>}
                    value={selectedUpgrade.study_duration_years || 1}
                    suffix="Years"
                    valueStyle={{ fontSize: 14, fontWeight: 'bold', color: '#fa8c16' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* TABPANES */}
            <Tabs defaultActiveKey="1" type="card">
              {/* TAB 1: Upgrade Profile */}
              <TabPane
                tab={
                  <span>
                    <TeamOutlined />
                    Candidate Demographics & Reach
                  </span>
                }
                key="1"
              >
                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }} style={{ marginBottom: 16 }}>
                  <Descriptions.Item label="Upgrade Cohort Title" span={2}>
                    <strong style={{ color: '#1a5f2c' }}>{selectedUpgrade.upgrade_title}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Upgrade Level">
                    <Tag color="purple">{selectedUpgrade.upgrade_level}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Core Activity">
                    <Tag color="green">{selectedUpgrade.core_activity}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Program Coordinator">
                    {selectedUpgrade.program_coordinator} ({selectedUpgrade.coordinator_phone})
                  </Descriptions.Item>
                </Descriptions>

                <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: 16, background: '#fafafa' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1a5f2c', textTransform: 'uppercase', marginBottom: 12 }}>
                    Candidate Disaggregation (ሰልጣኝ ባለሙያዎች በወኪል ምድብ)
                  </div>
                  <Row gutter={[16, 16]}>
                    <Col span={8}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <ManOutlined style={{ color: '#1890ff', marginRight: 4 }} />
                          Male Candidates (ወንድ)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#1890ff', marginTop: 2 }}>
                          {Number(selectedUpgrade.male_candidates || 0).toLocaleString()}
                        </div>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <WomanOutlined style={{ color: '#722ed1', marginRight: 4 }} />
                          Female Candidates (ሴት)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#722ed1', marginTop: 2 }}>
                          {Number(selectedUpgrade.female_candidates || 0).toLocaleString()}
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
                          {Number(selectedUpgrade.married_women_candidates || 0).toLocaleString()}
                        </div>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <RiseOutlined style={{ color: '#fa8c16', marginRight: 4 }} />
                          Youth Candidates (ወጣቶች)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#fa8c16', marginTop: 2 }}>
                          {Number(selectedUpgrade.youth_candidates || 0).toLocaleString()}
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
                          {Number(selectedUpgrade.investors_candidates || 0).toLocaleString()}
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
                    Academic Notes & Progress
                  </span>
                }
                key="2"
              >
                <Card size="small" bordered={false} style={{ background: '#fcfdfd', border: '1px solid #e6f7ed', borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <CheckCircleOutlined style={{ color: '#1a5f2c', fontSize: 16 }} />
                    <strong style={{ color: '#1a5f2c', fontSize: 13, textTransform: 'uppercase' }}>
                      Academic Upgrade Progress Notes (የትምህርት እድገት ማስታወሻ)
                    </strong>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: '#262626', lineHeight: '1.6' }}>
                    {selectedUpgrade.upgrade_notes || 'Active DA academic career upgrading and professional certification cohort.'}
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
                    <strong>{extractName(selectedUpgrade.zone)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Woreda">
                    <strong>{extractName(selectedUpgrade.woreda)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Kebele Operational Base">
                    <span style={{ color: '#1a5f2c', fontWeight: 'bold' }}>
                      {extractName(selectedUpgrade.kebele)}
                    </span>
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
                  <Descriptions.Item label="Fiscal Year (በጀት ዓመት)">
                    <Tag color="blue" icon={<CalendarOutlined />}>
                      {selectedUpgrade.fiscal_year || '2019 E.C.'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Production Campaign Season">
                    <strong>{selectedUpgrade.season || 'Meher (መኸር)'}</strong>
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

export default function DaAcademicUpgrades() {
  return (
    <App>
      <DaAcademicUpgradesContent />
    </App>
  );
}