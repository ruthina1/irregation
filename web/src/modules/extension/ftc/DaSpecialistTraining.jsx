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

const TRAINING_CATEGORIES = [
  'Wheat Cluster Agronomy & Mechanization Training (የስንዳ ማልማትና ማካናይዜሽን ስልጠና)',
  'Digital M&E Tablet Reporting & Data Sync (ዲጂታል ሪፖርት አቀራረብ ስልጠና)',
  'Climate-Smart Soil & Water Conservation (አየር ንብረት ተከላካይ ተፋሰስ ስልጠና)',
  'Post-Harvest Management & Quality Grading (ከዕርሻ በኋላ ምርት አያያዝ ስልጠና)',
  'Livestock Feed, Forage & Dairy Production (የእንስሳት መኖና እርባታ ስልጠና)'
];

const TRAINING_ACTIVITIES = [
  'Train-the-Trainer (ToT) Capacity Workshop',
  'Practical Demonstration Field Drill Session',
  'Digital System Refresher & Tablet Course',
  'Participatory Extension Methodology Workshop',
  'Competency Certification & Assessment Exam'
];

const INITIAL_TRAININGS = [
  {
    id: '1',
    training_code: 'TRN-2019-EG-01',
    training_title: 'Dejen Woreda ToT Training on Wheat Cluster Management',
    training_category: 'Wheat Cluster Agronomy & Mechanization Training (የስንዳ ማልማትና ማካናይዜሽን ስልጠና)',
    core_activity: 'Train-the-Trainer (ToT) Capacity Workshop',
    lead_trainer: 'Dr. Belayneh Mekonnen (Senior Expert)',
    trainer_phone: '+251 911 223 344',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    training_days: 5,
    male_trainees: 28,
    female_trainees: 17,
    married_women_trainees: 14,
    youth_trainees: 10,
    investors_trainees: 2,
    training_status: 'Successfully Certified',
    training_notes: 'Trained 45 Development Agents (DAs) and Subject Specialists on modern combine harvesting and row-planting agronomy.',
    zone: 'East Gojjam',
    woreda: 'Dejen',
    kebele: 'Kurar'
  },
  {
    id: '2',
    training_code: 'TRN-2019-SG-04',
    training_title: 'Fogera Digital Tablet Reporting & Data Sync Refresher',
    training_category: 'Digital M&E Tablet Reporting & Data Sync (ዲጂታል ሪፖርት አቀራረብ ስልጠና)',
    core_activity: 'Digital System Refresher & Tablet Course',
    lead_trainer: 'Woizero Tigist Abebe',
    trainer_phone: '+251 922 556 778',
    fiscal_year: '2019 E.C.',
    season: 'Bega / Irrigation (መስኖ/በጋ)',
    training_days: 3,
    male_trainees: 22,
    female_trainees: 18,
    married_women_trainees: 15,
    youth_trainees: 12,
    investors_trainees: 0,
    training_status: 'Successfully Certified',
    training_notes: 'Refreshed frontline DAs on offline data collection, GIS coordinate mapping, and automated KPI dashboard syncing.',
    zone: 'South Gondar',
    woreda: 'Fogera',
    kebele: 'Woreta Zuria'
  },
  {
    id: '3',
    training_code: 'TRN-2019-WG-09',
    training_title: 'Bure Climate-Smart Soil & Water Conservation Workshop',
    training_category: 'Climate-Smart Soil & Water Conservation (አየር ንብረት ተከላካይ ተፋሰስ ስልጠና)',
    core_activity: 'Practical Demonstration Field Drill Session',
    lead_trainer: 'Ato Getachew Mekonnen',
    trainer_phone: '+251 913 990 112',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    training_days: 4,
    male_trainees: 25,
    female_trainees: 15,
    married_women_trainees: 12,
    youth_trainees: 8,
    investors_trainees: 1,
    training_status: 'Ongoing Training',
    training_notes: 'Conducting field drills on hillside bench terracing and gully rehabilitation engineering for woredas.',
    zone: 'West Gojjam',
    woreda: 'Bure',
    kebele: 'Alefa'
  }
];

function DaSpecialistTrainingContent() {
  const { message } = App.useApp();

  const [trainings, setTrainings] = useState(INITIAL_TRAININGS);
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
  const [editingTraining, setEditingTraining] = useState(null);
  const [selectedTraining, setSelectedTraining] = useState(null);
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
      if (editingTraining) {
        const initForm = async () => {
          const zoneMatch = zones.find(
            (z) => z.name === editingTraining.zone || z.id === editingTraining.zone_id
          );
          if (zoneMatch) {
            try {
              const wRes = locationApi?.getWoredas ? await locationApi.getWoredas(zoneMatch.id) : null;
              const wList = wRes?.data?.data?.data || wRes?.data?.data || [];
              setWoredas(wList);

              const woredaMatch = wList.find(
                (w) => w.name === editingTraining.woreda || w.id === editingTraining.woreda_id
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
            training_code: editingTraining.training_code,
            training_title: editingTraining.training_title,
            training_category: editingTraining.training_category,
            core_activity: editingTraining.core_activity,
            lead_trainer: editingTraining.lead_trainer,
            trainer_phone: editingTraining.trainer_phone,
            fiscal_year: editingTraining.fiscal_year || '2019 E.C.',
            season: editingTraining.season || 'Meher (መኸር)',
            training_days: Number(editingTraining.training_days) || 3,
            male_trainees: Number(editingTraining.male_trainees) || 0,
            female_trainees: Number(editingTraining.female_trainees) || 0,
            married_women_trainees: Number(editingTraining.married_women_trainees) || 0,
            youth_trainees: Number(editingTraining.youth_trainees) || 0,
            investors_trainees: Number(editingTraining.investors_trainees) || 0,
            training_notes: editingTraining.training_notes,
            zone_id: editingTraining.zone_id || zoneMatch?.id || editingTraining.zone,
            woreda_id: editingTraining.woreda_id || editingTraining.woreda,
            kebele_id: editingTraining.kebele_id || editingTraining.kebele
          });
        };
        initForm();
      } else {
        form.resetFields();
        form.setFieldsValue({
          training_category: 'Wheat Cluster Agronomy & Mechanization Training (የስንዳ ማልማትና ማካናይዜሽን ስልጠና)',
          core_activity: 'Train-the-Trainer (ToT) Capacity Workshop',
          fiscal_year: '2019 E.C.',
          season: 'Meher (መኸር)',
          training_days: 5,
          male_trainees: 25,
          female_trainees: 15,
          married_women_trainees: 12,
          youth_trainees: 8,
          investors_trainees: 1
        });
        setWoredas([]);
        setKebeles([]);
      }
    }
  }, [isModalOpen, editingTraining, form, zones]);

  const loadData = async () => {
    setIsFetching(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      message.success('DA & Specialist training registry refreshed');
    } catch {
      message.error('Failed to refresh data');
    } finally {
      setIsFetching(false);
    }
  };

  // Direct In-Place Status Update without Opening the Form
  const handleQuickStatusChange = (recordId, newStatus) => {
    setTrainings((prev) =>
      prev.map((t) => (t.id === recordId ? { ...t, training_status: newStatus } : t))
    );
    message.success(`Training status updated to "${newStatus}"`);
  };

  // Filter pipeline
  const filteredTrainings = useMemo(() => {
    return trainings.filter((t) => {
      const code = extractName(t.training_code).toLowerCase();
      const title = extractName(t.training_title).toLowerCase();
      const trainer = extractName(t.lead_trainer).toLowerCase();
      const kebele = extractName(t.kebele).toLowerCase();
      const woreda = extractName(t.woreda).toLowerCase();
      const zone = extractName(t.zone).toLowerCase();
      const q = searchTerm.toLowerCase();

      const matchesSearch =
        code.includes(q) || title.includes(q) || trainer.includes(q) || kebele.includes(q) || woreda.includes(q) || zone.includes(q);
      const matchesCategory = categoryFilter ? t.training_category === categoryFilter : true;
      const matchesActivity = activityFilter ? t.core_activity === activityFilter : true;
      const matchesFY = fiscalYearFilter ? t.fiscal_year === fiscalYearFilter : true;
      const matchesSeason = seasonFilter ? t.season === seasonFilter : true;
      const matchesStatus = statusFilter ? t.training_status === statusFilter : true;
      const matchesZone = zoneFilter ? zone === zoneFilter.toLowerCase() : true;

      return matchesSearch && matchesCategory && matchesActivity && matchesFY && matchesSeason && matchesStatus && matchesZone;
    });
  }, [trainings, searchTerm, categoryFilter, activityFilter, fiscalYearFilter, seasonFilter, statusFilter, zoneFilter]);

  // Statistics Calculation
  const stats = useMemo(() => {
    const totalTrainings = filteredTrainings.length;
    const maleTrainees = filteredTrainings.reduce((acc, t) => acc + (Number(t.male_trainees) || 0), 0);
    const femaleTrainees = filteredTrainings.reduce((acc, t) => acc + (Number(t.female_trainees) || 0), 0);
    const marriedWomen = filteredTrainings.reduce((acc, t) => acc + (Number(t.married_women_trainees) || 0), 0);
    const youth = filteredTrainings.reduce((acc, t) => acc + (Number(t.youth_trainees) || 0), 0);
    const investors = filteredTrainings.reduce((acc, t) => acc + (Number(t.investors_trainees) || 0), 0);

    const totalTrainees = maleTrainees + femaleTrainees + marriedWomen + youth + investors;
    const totalWomenTrainees = femaleTrainees + marriedWomen;
    const womenRatio = totalTrainees > 0 ? ((totalWomenTrainees / totalTrainees) * 100).toFixed(1) : 0;
    const certifiedCount = filteredTrainings.filter((t) => t.training_status === 'Successfully Certified').length;

    return {
      totalTrainings,
      totalTrainees,
      maleTrainees,
      femaleTrainees,
      marriedWomen,
      totalWomenTrainees,
      youth,
      investors,
      womenRatio,
      certifiedCount
    };
  }, [filteredTrainings]);

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
    setEditingTraining(record);
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

      if (editingTraining) {
        setTrainings((prev) =>
          prev.map((item) =>
            item.id === editingTraining.id ? { ...item, ...payload, training_status: editingTraining.training_status } : item
          )
        );
        message.success('DA & Specialist training record updated successfully');
      } else {
        const newRecord = {
          ...payload,
          id: Date.now().toString(),
          training_code: values.training_code || `TRN-${Date.now().toString().slice(-4)}`,
          training_status: 'Successfully Certified'
        };
        setTrainings((prev) => [newRecord, ...prev]);
        message.success('New DA & Specialist training registered successfully');
      }
      setIsModalOpen(false);
    } catch (error) {
      message.error(error?.response?.data?.message || error.message || 'Failed to save training record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    setTrainings((prev) => prev.filter((item) => item.id !== id));
    message.success('DA & Specialist training record removed');
  };

  const exportToCSV = () => {
    if (!filteredTrainings.length) {
      message.warning('No training records available to export');
      return;
    }
    const headers = [
      'Training Code,Title,Category,Core Activity,Duration (Days),Trainer,Phone,FY,Season,Zone,Woreda,Kebele,Male (ወንድ),Female (ሴት),Married Women (ባለትዳር),Youth (ወጣቶች),Investors (ባለሃብቶች),Total Trainees,Status'
    ];
    const rows = filteredTrainings.map((t) => {
      const total =
        (Number(t.male_trainees) || 0) +
        (Number(t.female_trainees) || 0) +
        (Number(t.married_women_trainees) || 0) +
        (Number(t.youth_trainees) || 0) +
        (Number(t.investors_trainees) || 0);

      return [
        `"${t.training_code || ''}"`,
        `"${t.training_title || ''}"`,
        `"${t.training_category || ''}"`,
        `"${t.core_activity || ''}"`,
        t.training_days || 1,
        `"${t.lead_trainer || ''}"`,
        `"${t.trainer_phone || ''}"`,
        `"${t.fiscal_year || ''}"`,
        `"${t.season || ''}"`,
        `"${extractName(t.zone)}"`,
        `"${extractName(t.woreda)}"`,
        `"${extractName(t.kebele)}"`,
        t.male_trainees || 0,
        t.female_trainees || 0,
        t.married_women_trainees || 0,
        t.youth_trainees || 0,
        t.investors_trainees || 0,
        total,
        `"${t.training_status || ''}"`
      ].join(',');
    });

    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DA_Specialist_Training_Report_${Date.now()}.csv`;
    a.click();
    message.success('DA & Specialist training report exported successfully');
  };

  const columns = [
    {
      title: 'Training Code & Title',
      key: 'training_info',
      width: 250,
      render: (_, r) => (
        <div>
          <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{r.training_title}</strong>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>
            Code: <span style={{ fontFamily: 'monospace' }}>{r.training_code}</span> | Trainer: {r.lead_trainer}
          </div>
        </div>
      )
    },
    {
      title: 'Training Category',
      dataIndex: 'training_category',
      key: 'training_category',
      width: 210,
      render: (cat) => {
        let color = 'default';
        if (cat?.includes('Wheat')) color = 'green';
        if (cat?.includes('Digital')) color = 'blue';
        if (cat?.includes('Climate')) color = 'gold';
        if (cat?.includes('Post-Harvest')) color = 'purple';
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
          (Number(r.youth_trainees) || 0) +
          (Number(r.investors_trainees) || 0);

        return (
          <div style={{ fontSize: 11 }}>
            <div>
              Total: <strong style={{ color: '#1a5f2c' }}>{total.toLocaleString()} Trainees</strong>
            </div>
            <div style={{ color: '#8c8c8c' }}>
              <span>ወንድ: {r.male_trainees || 0}</span> | <span>ሴት: {r.female_trainees || 0}</span> | <span>ባለትዳር: {r.married_women_trainees || 0}</span>
            </div>
          </div>
        );
      }
    },
    {
      title: 'Training Status (In-Place Edit)',
      dataIndex: 'training_status',
      key: 'training_status',
      width: 190,
      render: (status, record) => (
        <Select
          value={status || 'Successfully Certified'}
          onChange={(newVal) => handleQuickStatusChange(record.id, newVal)}
          style={{ width: '100%' }}
          size="small"
        >
          <Option value="Successfully Certified">
            <Tag color="success" icon={<CheckCircleOutlined />} style={{ margin: 0 }}>
              Certified
            </Tag>
          </Option>
          <Option value="Ongoing Training">
            <Tag color="processing" icon={<ClockCircleOutlined />} style={{ margin: 0 }}>
              Ongoing
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
                setSelectedTraining(record);
                setIsDossierOpen(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Edit Training">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: '#52c41a' }} />}
              onClick={() => handleOpenModal(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Record">
            <Popconfirm
              title="Delete training record?"
              description="Are you sure you want to remove this training program?"
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
        <Breadcrumb.Item>Package Training for DAs & Subject Specialists</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#1a5f2c', fontFamily: "'Times New Roman', Times, serif" }}>
            Package Training for DAs & Subject Specialists (የልማት ሰራተኞች (DA) እና የሙያ ባለሙያዎች ስልጠና)
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Coordinating capacity building workshops, ToT packages, digital tool training, and competency certification for extension professionals
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
              Total Programs: <strong style={{ color: '#262626' }}>{stats.totalTrainings} courses</strong>
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
              Male DAs & specialists in training
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
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Successfully Certified</span>}
              value={stats.certifiedCount}
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
                placeholder="Search Title, Code, or Trainer..."
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: 220 }}
                allowClear
              />

              <Select
                placeholder="Training Category"
                value={categoryFilter}
                onChange={setCategoryFilter}
                style={{ width: 195 }}
                allowClear
              >
                {TRAINING_CATEGORIES.map((tc) => (
                  <Option key={tc} value={tc}>{tc}</Option>
                ))}
              </Select>

              <Select
                placeholder="Core Activity"
                value={activityFilter}
                onChange={setActivityFilter}
                style={{ width: 200 }}
                allowClear
              >
                {TRAINING_ACTIVITIES.map((ta) => (
                  <Option key={ta} value={ta}>{ta}</Option>
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
                {[...new Set(trainings.map((t) => extractName(t.zone)))].map((z) => (
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
                Export Training CSV
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
                Register Training
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Main Table */}
      <Table
        columns={columns}
        dataSource={filteredTrainings}
        rowKey="id"
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} training programs`
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
              {editingTraining ? 'Edit Training Program Record' : 'Register DA & Specialist Training (የባለሙያዎች ስልጠና ምዝገባ)'}
            </span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText={editingTraining ? 'Update Training' : 'Save Training Record'}
        okButtonProps={{ style: { backgroundColor: '#1a5f2c', borderColor: '#1a5f2c' }, loading: isSubmitting }}
        width={800}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Training Identification & Category
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="training_code"
                label="Training Code"
                rules={[{ required: true, message: 'Code required' }]}
              >
                <Input placeholder="e.g. TRN-2019-EG-08" />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item
                name="training_title"
                label="Training Program Title"
                rules={[{ required: true, message: 'Title required' }]}
              >
                <Input placeholder="e.g. Dejen Woreda ToT Training on Wheat Cluster" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="training_category"
                label="Training Category"
                rules={[{ required: true, message: 'Select category' }]}
              >
                <Select>
                  {TRAINING_CATEGORIES.map((tc) => (
                    <Option key={tc} value={tc}>{tc}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="core_activity"
                label="Core Training Activity"
                rules={[{ required: true, message: 'Select activity' }]}
              >
                <Select>
                  {TRAINING_ACTIVITIES.map((ta) => (
                    <Option key={ta} value={ta}>{ta}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={14}>
              <Form.Item
                name="lead_trainer"
                label="Lead Trainer / Facilitator Name"
                rules={[{ required: true, message: 'Trainer required' }]}
              >
                <Input placeholder="e.g. Dr. Belayneh Mekonnen" />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item
                name="trainer_phone"
                label="Trainer Phone Number"
                rules={[{ required: true, message: 'Phone required' }]}
              >
                <Input placeholder="+251 9..." />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Timeline & Duration (Days)
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
                name="training_days"
                label="Duration (Days)"
                rules={[{ required: true }]}
              >
                <InputNumber min={1} max={30} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Trainees Enrolled by Cohort (ሰልጣኞች በወኪል ምድብ)
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
              <Form.Item name="training_notes" label="Training Notes & Curriculum Objectives">
                <TextArea rows={3} placeholder="Summarize curriculum topics, practical drills, or certification outcomes..." />
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

      {/* Comprehensive Training Dossier Modal */}
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
                  {selectedTraining?.training_title}
                </span>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                  Code: <span style={{ fontFamily: 'monospace' }}>{selectedTraining?.training_code}</span> | Trainer:{' '}
                  {selectedTraining?.lead_trainer}
                </div>
              </div>
            </div>
            <div>
              <Tag
                color={selectedTraining?.training_status === 'Successfully Certified' ? 'success' : 'processing'}
                icon={selectedTraining?.training_status === 'Successfully Certified' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                style={{ fontSize: 12, padding: '2px 10px', borderRadius: 12 }}
              >
                {selectedTraining?.training_status || 'Certified'}
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
              handleOpenModal(selectedTraining);
            }}
          >
            Edit Training
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
        {selectedTraining && (
          <div style={{ paddingTop: 8 }}>
            {/* Top Metric Strip */}
            <Row gutter={12} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f6ffed', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Total Trainees</span>}
                    value={
                      (Number(selectedTraining.male_trainees) || 0) +
                      (Number(selectedTraining.female_trainees) || 0) +
                      (Number(selectedTraining.married_women_trainees) || 0) +
                      (Number(selectedTraining.youth_trainees) || 0) +
                      (Number(selectedTraining.investors_trainees) || 0)
                    }
                    suffix={<span style={{ fontSize: 12 }}>People</span>}
                    valueStyle={{ fontSize: 15, fontWeight: 'bold', color: '#1a5f2c' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f0f5ff', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Category</span>}
                    value={selectedTraining.training_category?.split(' ')[0] || 'Category'}
                    valueStyle={{ fontSize: 15, fontWeight: 'bold', color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f9f0ff', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Women Share</span>}
                    value={
                      (Number(selectedTraining.male_trainees) || 0) +
                      (Number(selectedTraining.female_trainees) || 0) +
                      (Number(selectedTraining.married_women_trainees) || 0) +
                      (Number(selectedTraining.youth_trainees) || 0) +
                      (Number(selectedTraining.investors_trainees) || 0) > 0
                        ? (
                            (((Number(selectedTraining.female_trainees) || 0) +
                              (Number(selectedTraining.married_women_trainees) || 0)) /
                              ((Number(selectedTraining.male_trainees) || 0) +
                                (Number(selectedTraining.female_trainees) || 0) +
                                (Number(selectedTraining.married_women_trainees) || 0) +
                                (Number(selectedTraining.youth_trainees) || 0) +
                                (Number(selectedTraining.investors_trainees) || 0))) *
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
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Duration</span>}
                    value={selectedTraining.training_days || 1}
                    suffix="Days"
                    valueStyle={{ fontSize: 14, fontWeight: 'bold', color: '#fa8c16' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* TABPANES */}
            <Tabs defaultActiveKey="1" type="card">
              {/* TAB 1: Training Profile */}
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
                  <Descriptions.Item label="Training Title" span={2}>
                    <strong style={{ color: '#1a5f2c' }}>{selectedTraining.training_title}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Training Category">
                    <Tag color="purple">{selectedTraining.training_category}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Core Activity">
                    <Tag color="green">{selectedTraining.core_activity}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Lead Trainer">
                    {selectedTraining.lead_trainer} ({selectedTraining.trainer_phone})
                  </Descriptions.Item>
                </Descriptions>

                <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: 16, background: '#fafafa' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1a5f2c', textTransform: 'uppercase', marginBottom: 12 }}>
                    Trainee Disaggregation (ሰልጣኞች በወኪል ምድብ)
                  </div>
                  <Row gutter={[16, 16]}>
                    <Col span={8}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <ManOutlined style={{ color: '#1890ff', marginRight: 4 }} />
                          Male Trainees (ወንድ)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#1890ff', marginTop: 2 }}>
                          {Number(selectedTraining.male_trainees || 0).toLocaleString()}
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
                          {Number(selectedTraining.female_trainees || 0).toLocaleString()}
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
                          {Number(selectedTraining.married_women_trainees || 0).toLocaleString()}
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
                          {Number(selectedTraining.youth_trainees || 0).toLocaleString()}
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
                          {Number(selectedTraining.investors_trainees || 0).toLocaleString()}
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
                    Curriculum & Objectives Notes
                  </span>
                }
                key="2"
              >
                <Card size="small" bordered={false} style={{ background: '#fcfdfd', border: '1px solid #e6f7ed', borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <CheckCircleOutlined style={{ color: '#1a5f2c', fontSize: 16 }} />
                    <strong style={{ color: '#1a5f2c', fontSize: 13, textTransform: 'uppercase' }}>
                      Training Curriculum & Objectives (የስልጠና ማስታወሻ)
                    </strong>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: '#262626', lineHeight: '1.6' }}>
                    {selectedTraining.training_notes || 'Active professional development training program for extension workers.'}
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
                    <strong>{extractName(selectedTraining.zone)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Woreda">
                    <strong>{extractName(selectedTraining.woreda)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Kebele Operational Base">
                    <span style={{ color: '#1a5f2c', fontWeight: 'bold' }}>
                      {extractName(selectedTraining.kebele)}
                    </span>
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
                  <Descriptions.Item label="Fiscal Year (በጀት ዓመት)">
                    <Tag color="blue" icon={<CalendarOutlined />}>
                      {selectedTraining.fiscal_year || '2019 E.C.'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Production Campaign Season">
                    <strong>{selectedTraining.season || 'Meher (መኸር)'}</strong>
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

export default function DaSpecialistTraining() {
  return (
    <App>
      <DaSpecialistTrainingContent />
    </App>
  );
}