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
  SafetyCertificateOutlined,
  IdcardOutlined,
  PhoneOutlined,
  ManOutlined,
  WomanOutlined,
  RiseOutlined,
  ShopOutlined,
  CheckSquareOutlined,
  FilterOutlined,
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

const SAFEGUARD_CATEGORIES = [
  'Gender & Social Inclusion (GESI) Mainstreaming Workshop (የስርዓተ-ፆታና ማህበራዊ አካተት ስልጠና)',
  'GBV Prevention & Safe Grievance Redress Training (የጥቃት መከላከልና ቅሬታ አፈታት ስልጠና)',
  'Land Rights & Women Asset Ownership Advocacy (የሴቶች የመሬት ባለቤትነት መብት ስልጠና)',
  'Vulnerable Household Social Protection Briefing (ለችግር ተጋላጭ አባወራዎች ማህበራዊ ጥበቃ)',
  'Participatory Safeguard Compliance & Audit (አካባቢያዊና ማህበራዊ ጥበቃ ተገዢነት ግምገማ)'
];

const SAFEGUARD_ACTIVITIES = [
  'Community-Level Sensitization & Dialogue',
  'Kebele GESI Committee Capacity Building',
  'Grievance Redress Mechanism (GRM) Briefing',
  'Legal Rights & Land Certification Workshop',
  'Safeguard Compliance Monitoring & Review'
];

const INITIAL_SAFEGUARDS = [
  {
    id: '1',
    safe_code: 'GST-2019-EG-01',
    safe_title: 'Kurar GESI Mainstreaming & Women Land Rights Workshop',
    safe_category: 'Land Rights & Women Asset Ownership Advocacy (የሴቶች የመሬት ባለቤትነት መብት ስልጠና)',
    core_activity: 'Community-Level Sensitization & Dialogue',
    safeguard_lead: 'Woizero Tigist Abebe (GESI Officer)',
    lead_phone: '+251 922 556 778',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    training_days: 3,
    male_participants: 40,
    female_participants: 110,
    married_women_participants: 90,
    youth_participants: 35,
    investors_participants: 2,
    safe_status: 'Successfully Certified',
    safe_notes: 'Trained 150 community members on joint land titling (Green Book) and women property ownership rights.',
    zone: 'East Gojjam',
    woreda: 'Dejen',
    kebele: 'Kurar'
  },
  {
    id: '2',
    safe_code: 'GST-2019-SG-04',
    safe_title: 'Fogera GBV Prevention & Safe Grievance Redress Briefing',
    safe_category: 'GBV Prevention & Safe Grievance Redress Training (የጥቃት መከላከልና ቅሬታ አፈታት ስልጠና)',
    core_activity: 'Grievance Redress Mechanism (GRM) Briefing',
    safeguard_lead: 'Woizero Almaz Bekele',
    lead_phone: '+251 915 667 899',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    training_days: 2,
    male_participants: 30,
    female_participants: 90,
    married_women_participants: 75,
    youth_participants: 40,
    investors_participants: 1,
    safe_status: 'Successfully Certified',
    safe_notes: 'Established kebele-level Grievance Redress Committees (GRC) with mandatory female representation for safe reporting.',
    zone: 'South Gondar',
    woreda: 'Fogera',
    kebele: 'Woreta Zuria'
  },
  {
    id: '3',
    safe_code: 'GST-2018-WG-02',
    safe_title: 'Alefa Vulnerable Social Protection & GESI Audit (2018 E.C.)',
    safe_category: 'Vulnerable Household Social Protection Briefing (ለችግር ተጋላጭ አባወራዎች ማህበራዊ ጥበቃ)',
    core_activity: 'Safeguard Compliance Monitoring & Review',
    safeguard_lead: 'Ato Getachew Mekonnen',
    lead_phone: '+251 913 990 112',
    fiscal_year: '2018 E.C.',
    season: 'Bega / Irrigation (መስኖ/በጋ)',
    training_days: 4,
    male_participants: 25,
    female_participants: 75,
    married_women_participants: 60,
    youth_participants: 20,
    investors_participants: 0,
    safe_status: 'Active Monitoring',
    safe_notes: 'Conducted social safeguard audit ensuring safety net benefits and fertilizer subsidies reach female-headed households.',
    zone: 'West Gojjam',
    woreda: 'Bure',
    kebele: 'Alefa'
  }
];

function GenderSafeguardTrainingContent() {
  const { message } = App.useApp();

  const [safeguardRecords, setSafeguardRecords] = useState(INITIAL_SAFEGUARDS);
  const [isFetching, setIsFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search & Filter states (Dedicated Fiscal Year Impact Focus)
  const [searchTerm, setSearchTerm] = useState('');
  const [fiscalYearImpactFilter, setFiscalYearImpactFilter] = useState('2019 E.C.');
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [activityFilter, setActivityFilter] = useState(null);
  const [seasonFilter, setSeasonFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [zoneFilter, setZoneFilter] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSafe, setEditingSafe] = useState(null);
  const [selectedSafe, setSelectedSafe] = useState(null);
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
      if (editingSafe) {
        const initForm = async () => {
          const zoneMatch = zones.find(
            (z) => z.name === editingSafe.zone || z.id === editingSafe.zone_id
          );
          if (zoneMatch) {
            try {
              const wRes = locationApi?.getWoredas ? await locationApi.getWoredas(zoneMatch.id) : null;
              const wList = wRes?.data?.data?.data || wRes?.data?.data || [];
              setWoredas(wList);

              const woredaMatch = wList.find(
                (w) => w.name === editingSafe.woreda || w.id === editingSafe.woreda_id
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
            safe_code: editingSafe.safe_code,
            safe_title: editingSafe.safe_title,
            safe_category: editingSafe.safe_category,
            core_activity: editingSafe.core_activity,
            safeguard_lead: editingSafe.safeguard_lead,
            lead_phone: editingSafe.lead_phone,
            fiscal_year: editingSafe.fiscal_year || '2019 E.C.',
            season: editingSafe.season || 'Meher (መኸር)',
            training_days: Number(editingSafe.training_days) || 3,
            male_participants: Number(editingSafe.male_participants) || 0,
            female_participants: Number(editingSafe.female_participants) || 0,
            married_women_participants: Number(editingSafe.married_women_participants) || 0,
            youth_participants: Number(editingSafe.youth_participants) || 0,
            investors_participants: Number(editingSafe.investors_participants) || 0,
            safe_notes: editingSafe.safe_notes,
            zone_id: editingSafe.zone_id || zoneMatch?.id || editingSafe.zone,
            woreda_id: editingSafe.woreda_id || editingSafe.woreda,
            kebele_id: editingSafe.kebele_id || editingSafe.kebele
          });
        };
        initForm();
      } else {
        form.resetFields();
        form.setFieldsValue({
          safe_category: 'Gender & Social Inclusion (GESI) Mainstreaming Workshop (የስርዓተ-ፆታና ማህበራዊ አካተት ስልጠና)',
          core_activity: 'Community-Level Sensitization & Dialogue',
          fiscal_year: fiscalYearImpactFilter || '2019 E.C.',
          season: 'Meher (መኸር)',
          training_days: 3,
          male_participants: 25,
          female_participants: 75,
          married_women_participants: 60,
          youth_participants: 20,
          investors_participants: 1
        });
        setWoredas([]);
        setKebeles([]);
      }
    }
  }, [isModalOpen, editingSafe, form, zones, fiscalYearImpactFilter]);

  const loadData = async () => {
    setIsFetching(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      message.success('Gender and safeguard training registry refreshed');
    } catch {
      message.error('Failed to refresh data');
    } finally {
      setIsFetching(false);
    }
  };

  // Direct In-Place Status Update without Opening the Form
  const handleQuickStatusChange = (recordId, newStatus) => {
    setSafeguardRecords((prev) =>
      prev.map((s) => (s.id === recordId ? { ...s, safe_status: newStatus } : s))
    );
    message.success(`Safeguard training status updated to "${newStatus}"`);
  };

  // Filter pipeline (includes explicit fiscal year impact selection)
  const filteredSafeguardRecords = useMemo(() => {
    return safeguardRecords.filter((s) => {
      const code = extractName(s.safe_code).toLowerCase();
      const title = extractName(s.safe_title).toLowerCase();
      const lead = extractName(s.safeguard_lead).toLowerCase();
      const kebele = extractName(s.kebele).toLowerCase();
      const woreda = extractName(s.woreda).toLowerCase();
      const zone = extractName(s.zone).toLowerCase();
      const q = searchTerm.toLowerCase();

      const matchesSearch =
        code.includes(q) || title.includes(q) || lead.includes(q) || kebele.includes(q) || woreda.includes(q) || zone.includes(q);
      const matchesFY = fiscalYearImpactFilter ? s.fiscal_year === fiscalYearImpactFilter : true;
      const matchesCategory = categoryFilter ? s.safe_category === categoryFilter : true;
      const matchesActivity = activityFilter ? s.core_activity === activityFilter : true;
      const matchesSeason = seasonFilter ? s.season === seasonFilter : true;
      const matchesStatus = statusFilter ? s.safe_status === statusFilter : true;
      const matchesZone = zoneFilter ? zone === zoneFilter.toLowerCase() : true;

      return matchesSearch && matchesFY && matchesCategory && matchesActivity && matchesSeason && matchesStatus && matchesZone;
    });
  }, [safeguardRecords, searchTerm, fiscalYearImpactFilter, categoryFilter, activityFilter, seasonFilter, statusFilter, zoneFilter]);

  // Statistics Calculation for Selected Fiscal Year Impact
  const stats = useMemo(() => {
    const totalPrograms = filteredSafeguardRecords.length;
    const maleParticipants = filteredSafeguardRecords.reduce((acc, s) => acc + (Number(s.male_participants) || 0), 0);
    const femaleParticipants = filteredSafeguardRecords.reduce((acc, s) => acc + (Number(s.female_participants) || 0), 0);
    const marriedWomen = filteredSafeguardRecords.reduce((acc, s) => acc + (Number(s.married_women_participants) || 0), 0);
    const youth = filteredSafeguardRecords.reduce((acc, s) => acc + (Number(s.youth_participants) || 0), 0);
    const investors = filteredSafeguardRecords.reduce((acc, s) => acc + (Number(s.investors_participants) || 0), 0);

    const totalParticipants = maleParticipants + femaleParticipants + marriedWomen + youth + investors;
    const totalWomenParticipants = femaleParticipants + marriedWomen;
    const womenRatio = totalParticipants > 0 ? ((totalWomenParticipants / totalParticipants) * 100).toFixed(1) : 0;
    const certifiedCount = filteredSafeguardRecords.filter((s) => s.safe_status === 'Successfully Certified').length;

    return {
      totalPrograms,
      totalParticipants,
      maleParticipants,
      femaleParticipants,
      marriedWomen,
      totalWomenParticipants,
      youth,
      investors,
      womenRatio,
      certifiedCount
    };
  }, [filteredSafeguardRecords]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setCategoryFilter(null);
    setActivityFilter(null);
    setSeasonFilter(null);
    setStatusFilter(null);
    setZoneFilter(null);
  };

  const handleOpenModal = (record = null) => {
    setEditingSafe(record);
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
        fiscal_year: values.fiscal_year || fiscalYearImpactFilter || '2019 E.C.',
        zone: selectedZone?.name || selectedZone?.zone_name || values.zone_id,
        woreda: selectedWoreda?.name || selectedWoreda?.woreda_name || values.woreda_id,
        kebele: selectedKebele?.name || selectedKebele?.kebele_name || values.kebele_id
      };

      if (editingSafe) {
        setSafeguardRecords((prev) =>
          prev.map((item) =>
            item.id === editingSafe.id ? { ...item, ...payload, safe_status: editingSafe.safe_status } : item
          )
        );
        message.success('Gender and safeguard training record updated successfully');
      } else {
        const newRecord = {
          ...payload,
          id: Date.now().toString(),
          safe_code: values.safe_code || `GST-${Date.now().toString().slice(-4)}`,
          safe_status: 'Successfully Certified'
        };
        setSafeguardRecords((prev) => [newRecord, ...prev]);
        message.success('New gender and safeguard training registered successfully');
      }
      setIsModalOpen(false);
    } catch (error) {
      message.error(error?.response?.data?.message || error.message || 'Failed to save safeguard training record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    setSafeguardRecords((prev) => prev.filter((item) => item.id !== id));
    message.success('Gender and safeguard training record removed');
  };

  const exportToCSV = () => {
    if (!filteredSafeguardRecords.length) {
      message.warning('No safeguard records available to export');
      return;
    }
    const headers = [
      'Safe Code,Title,Category,Core Activity,Duration (Days),Lead,Phone,FY,Season,Zone,Woreda,Kebele,Male (ወንድ),Female (ሴት),Married Women (ባለትዳር),Youth (ወጣቶች),Investors (ባለሃብቶች),Total Participants,Status'
    ];
    const rows = filteredSafeguardRecords.map((s) => {
      const total =
        (Number(s.male_participants) || 0) +
        (Number(s.female_participants) || 0) +
        (Number(s.married_women_participants) || 0) +
        (Number(s.youth_participants) || 0) +
        (Number(s.investors_participants) || 0);

      return [
        `"${s.safe_code || ''}"`,
        `"${s.safe_title || ''}"`,
        `"${s.safe_category || ''}"`,
        `"${s.core_activity || ''}"`,
        s.training_days || 1,
        `"${s.safeguard_lead || ''}"`,
        `"${s.lead_phone || ''}"`,
        `"${s.fiscal_year || ''}"`,
        `"${s.season || ''}"`,
        `"${extractName(s.zone)}"`,
        `"${extractName(s.woreda)}"`,
        `"${extractName(s.kebele)}"`,
        s.male_participants || 0,
        s.female_participants || 0,
        s.married_women_participants || 0,
        s.youth_participants || 0,
        s.investors_participants || 0,
        total,
        `"${s.safe_status || ''}"`
      ].join(',');
    });

    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Gender_Safeguard_Training_FY_${fiscalYearImpactFilter.replace(/\s+/g, '_')}_${Date.now()}.csv`;
    a.click();
    message.success(`Gender safeguard report for ${fiscalYearImpactFilter} exported successfully`);
  };

  const columns = [
    {
      title: 'Safe Code & Title',
      key: 'safe_info',
      width: 250,
      render: (_, r) => (
        <div>
          <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{r.safe_title}</strong>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>
            Code: <span style={{ fontFamily: 'monospace' }}>{r.safe_code}</span> | Lead: {r.safeguard_lead}
          </div>
        </div>
      )
    },
    {
      title: 'Safeguard Category',
      dataIndex: 'safe_category',
      key: 'safe_category',
      width: 210,
      render: (cat) => {
        let color = 'default';
        if (cat?.includes('GESI')) color = 'green';
        if (cat?.includes('GBV')) color = 'red';
        if (cat?.includes('Land Rights')) color = 'blue';
        if (cat?.includes('Vulnerable')) color = 'gold';
        if (cat?.includes('Compliance')) color = 'purple';
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
      title: 'Participants Enrolled',
      key: 'participants_breakdown',
      width: 230,
      render: (_, r) => {
        const total =
          (Number(r.male_participants) || 0) +
          (Number(r.female_participants) || 0) +
          (Number(r.married_women_participants) || 0) +
          (Number(r.youth_participants) || 0) +
          (Number(r.investors_participants) || 0);

        return (
          <div style={{ fontSize: 11 }}>
            <div>
              Total: <strong style={{ color: '#1a5f2c' }}>{total.toLocaleString()} Trainees</strong>
            </div>
            <div style={{ color: '#8c8c8c' }}>
              <span>ወንድ: {r.male_participants || 0}</span> | <span>ሴት: {r.female_participants || 0}</span> | <span>ባለትዳር: {r.married_women_participants || 0}</span>
            </div>
          </div>
        );
      }
    },
    {
      title: 'Training Status (In-Place Edit)',
      dataIndex: 'safe_status',
      key: 'safe_status',
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
          <Option value="Active Monitoring">
            <Tag color="processing" icon={<ClockCircleOutlined />} style={{ margin: 0 }}>
              Monitoring
            </Tag>
          </Option>
          <Option value="Refresher Due">
            <Tag color="warning" icon={<ClockCircleOutlined />} style={{ margin: 0 }}>
              Refresher Due
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
          <Tooltip title="View Safeguard Dossier">
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: '#1890ff' }} />}
              onClick={() => {
                setSelectedSafe(record);
                setIsDossierOpen(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Edit Record">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: '#52c41a' }} />}
              onClick={() => handleOpenModal(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Record">
            <Popconfirm
              title="Delete safeguard training record?"
              description="Are you sure you want to remove this safeguard record?"
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
        <Breadcrumb.Item>Gender & HIV</Breadcrumb.Item>
        <Breadcrumb.Item>Gender & Social Inclusion / Safeguard Training</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#1a5f2c', fontFamily: "'Times New Roman', Times, serif" }}>
            Gender & Social Inclusion / Safeguard Training (የስርዓተ-ፆታና ማህበራዊ አካተት / የጥበቃ ስልጠና)
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Coordinating GESI mainstreaming, GBV prevention, grievance redress mechanisms (GRM), and women's land tenure advocacy workshops
          </Text>
        </div>
        <Space>
          {/* ───── FISCAL YEAR IMPACT SELECTOR ───── */}
          <div style={{ background: '#e6f7ed', padding: '4px 12px', borderRadius: 6, border: '1px solid #b7eb8f', display: 'flex', alignItems: 'center', gap: 8 }}>
            <CalendarOutlined style={{ color: '#1a5f2c' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#1a5f2c' }}>Fiscal Year Impact:</span>
            <Select
              value={fiscalYearImpactFilter}
              onChange={setFiscalYearImpactFilter}
              style={{ width: 130 }}
              size="small"
              bordered={false}
            >
              {FISCAL_YEARS.map((fy) => (
                <Option key={fy} value={fy}>{fy}</Option>
              ))}
            </Select>
          </div>
          <Button icon={<ReloadOutlined />} onClick={loadData} loading={isFetching}>
            Refresh
          </Button>
        </Space>
      </div>

      {/* KPI Dashboard for Selected Fiscal Year Impact */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #1a5f2c', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Total Programs ({fiscalYearImpactFilter})</span>}
              value={stats.totalPrograms}
              prefix={<FilterOutlined style={{ color: '#1a5f2c', marginRight: 8 }} />}
              valueStyle={{ color: '#1a5f2c', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Certified Training Sessions
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #1890ff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Youth Trainees ({fiscalYearImpactFilter})</span>}
              value={stats.youth}
              prefix={<RiseOutlined style={{ color: '#1890ff', marginRight: 8 }} />}
              valueStyle={{ color: '#1890ff', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Male: <strong>{stats.maleParticipants}</strong> | Investors: <strong>{stats.investors}</strong>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #722ed1', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Total Participants ({fiscalYearImpactFilter})</span>}
              value={stats.totalParticipants}
              prefix={<TeamOutlined style={{ color: '#722ed1', marginRight: 8 }} />}
              valueStyle={{ color: '#722ed1', fontWeight: 'bold', fontSize: 24 }}
            />
            <Progress percent={Number(stats.womenRatio)} size="small" strokeColor="#722ed1" />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8c8c8c', marginTop: 2 }}>
              <span>Women Share: <strong style={{ color: '#722ed1' }}>{stats.womenRatio}%</strong></span>
              <span>Goal: &gt; 50%</span>
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
              Target Year Impact: <strong>{fiscalYearImpactFilter}</strong>
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
                placeholder="Search Title, Code, or Lead..."
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: 220 }}
                allowClear
              />

              <Select
                placeholder="Safeguard Category"
                value={categoryFilter}
                onChange={setCategoryFilter}
                style={{ width: 195 }}
                allowClear
              >
                {SAFEGUARD_CATEGORIES.map((sc) => (
                  <Option key={sc} value={sc}>{sc}</Option>
                ))}
              </Select>

              <Select
                placeholder="Core Activity"
                value={activityFilter}
                onChange={setActivityFilter}
                style={{ width: 200 }}
                allowClear
              >
                {SAFEGUARD_ACTIVITIES.map((sa) => (
                  <Option key={sa} value={sa}>{sa}</Option>
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
                {[...new Set(safeguardRecords.map((s) => extractName(s.zone)))].map((z) => (
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
                Export FY Impact CSV
              </Button>

              <Button
                icon={<ClearOutlined />}
                onClick={handleResetFilters}
                disabled={!(searchTerm || categoryFilter || activityFilter || seasonFilter || statusFilter || zoneFilter)}
              >
                Reset Filters
              </Button>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => handleOpenModal(null)}
                style={{ backgroundColor: '#1a5f2c', borderColor: '#1a5f2c', fontWeight: 600 }}
              >
                Register Safeguard Training
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Main Table */}
      <Table
        columns={columns}
        dataSource={filteredSafeguardRecords}
        rowKey="id"
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} records for ${fiscalYearImpactFilter}`
        }}
        scroll={{ x: 1350 }}
        bordered
        size="middle"
      />

      {/* Registration / Edit Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SafetyCertificateOutlined style={{ color: '#1a5f2c', fontSize: 20 }} />
            <span style={{ color: '#1a5f2c', fontWeight: 'bold', fontFamily: "'Times New Roman', Times, serif", fontSize: 17 }}>
              {editingSafe ? 'Edit Safeguard Training Record' : `Register Safeguard Training (${fiscalYearImpactFilter})`}
            </span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText={editingSafe ? 'Update Record' : 'Save Safeguard Record'}
        okButtonProps={{ style: { backgroundColor: '#1a5f2c', borderColor: '#1a5f2c' }, loading: isSubmitting }}
        width={800}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Safeguard Identification & Category
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="safe_code"
                label="Safeguard Code"
                rules={[{ required: true, message: 'Code required' }]}
              >
                <Input placeholder="e.g. GST-2019-EG-08" />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item
                name="safe_title"
                label="Training Title / Workshop Description"
                rules={[{ required: true, message: 'Title required' }]}
              >
                <Input placeholder="e.g. Kurar GESI Mainstreaming & Women Land Rights Workshop" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="safe_category"
                label="Safeguard Category"
                rules={[{ required: true, message: 'Select category' }]}
              >
                <Select>
                  {SAFEGUARD_CATEGORIES.map((sc) => (
                    <Option key={sc} value={sc}>{sc}</Option>
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
                  {SAFEGUARD_ACTIVITIES.map((sa) => (
                    <Option key={sa} value={sa}>{sa}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={10}>
              <Form.Item
                name="safeguard_lead"
                label="Lead Facilitator / GESI Officer"
                rules={[{ required: true, message: 'Lead required' }]}
              >
                <Input placeholder="e.g. Woizero Tigist Abebe" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="lead_phone"
                label="Lead Phone Number"
                rules={[{ required: true, message: 'Phone required' }]}
              >
                <Input placeholder="+251 9..." />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="training_days"
                label="Duration (Days)"
                rules={[{ required: true, message: 'Days required' }]}
              >
                <InputNumber min={1} max={30} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Timeline & Fiscal Year Selection
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
            Participants Enrolled by Cohort (ሰልጣኞች በወኪል ምድብ)
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="male_participants"
                label="Male Participants (ወንድ)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="female_participants"
                label="Female Participants (ሴት)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="married_women_participants"
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
                name="youth_participants"
                label="Youth Participants (ወጣቶች)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="investors_participants"
                label="Private Investors (ባለሃብቶች)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="safe_notes" label="Safeguard Training Notes & Action Points">
                <TextArea rows={3} placeholder="Summarize GESI mainstreaming takeaways, GBV reporting channels, or land rights resolutions..." />
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

      {/* Comprehensive Safeguard Dossier Modal */}
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
                <SafetyCertificateOutlined />
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
                  {selectedSafe?.safe_title}
                </span>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                  Code: <span style={{ fontFamily: 'monospace' }}>{selectedSafe?.safe_code}</span> | Lead:{' '}
                  {selectedSafe?.safeguard_lead}
                </div>
              </div>
            </div>
            <div>
              <Tag
                color={selectedSafe?.safe_status === 'Successfully Certified' ? 'success' : 'processing'}
                icon={selectedSafe?.safe_status === 'Successfully Certified' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                style={{ fontSize: 12, padding: '2px 10px', borderRadius: 12 }}
              >
                {selectedSafe?.safe_status || 'Certified'}
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
              handleOpenModal(selectedSafe);
            }}
          >
            Edit Record
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
        {selectedSafe && (
          <div style={{ paddingTop: 8 }}>
            {/* Top Metric Strip */}
            <Row gutter={12} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f6ffed', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Total Trainees</span>}
                    value={
                      (Number(selectedSafe.male_participants) || 0) +
                      (Number(selectedSafe.female_participants) || 0) +
                      (Number(selectedSafe.married_women_participants) || 0) +
                      (Number(selectedSafe.youth_participants) || 0) +
                      (Number(selectedSafe.investors_participants) || 0)
                    }
                    suffix={<span style={{ fontSize: 12 }}>People</span>}
                    valueStyle={{ fontSize: 15, fontWeight: 'bold', color: '#1a5f2c' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f0f5ff', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Safeguard Category</span>}
                    value={selectedSafe.safe_category?.split(' ')[0] || 'Category'}
                    valueStyle={{ fontSize: 15, fontWeight: 'bold', color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f9f0ff', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Women Share</span>}
                    value={
                      (Number(selectedSafe.male_participants) || 0) +
                      (Number(selectedSafe.female_participants) || 0) +
                      (Number(selectedSafe.married_women_participants) || 0) +
                      (Number(selectedSafe.youth_participants) || 0) +
                      (Number(selectedSafe.investors_participants) || 0) > 0
                        ? (
                            (((Number(selectedSafe.female_participants) || 0) +
                              (Number(selectedSafe.married_women_participants) || 0)) /
                              ((Number(selectedSafe.male_participants) || 0) +
                                (Number(selectedSafe.female_participants) || 0) +
                                (Number(selectedSafe.married_women_participants) || 0) +
                                (Number(selectedSafe.youth_participants) || 0) +
                                (Number(selectedSafe.investors_participants) || 0))) *
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
                    value={selectedSafe.fiscal_year}
                    valueStyle={{ fontSize: 13, fontWeight: 'bold', color: '#fa8c16' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* TABPANES */}
            <Tabs defaultActiveKey="1" type="card">
              {/* TAB 1: Safeguard Profile */}
              <TabPane
                tab={
                  <span>
                    <TeamOutlined />
                    Participant Demographics & Reach
                  </span>
                }
                key="1"
              >
                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }} style={{ marginBottom: 16 }}>
                  <Descriptions.Item label="Workshop Title" span={2}>
                    <strong style={{ color: '#1a5f2c' }}>{selectedSafe.safe_title}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Safeguard Category">
                    <Tag color="purple">{selectedSafe.safe_category}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Core Activity">
                    <Tag color="green">{selectedSafe.core_activity}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Lead Facilitator">
                    {selectedSafe.safeguard_lead} ({selectedSafe.lead_phone})
                  </Descriptions.Item>
                </Descriptions>

                <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: 16, background: '#fafafa' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1a5f2c', textTransform: 'uppercase', marginBottom: 12 }}>
                    Participant Disaggregation (ተሳታፊዎች በወኪል ምድብ)
                  </div>
                  <Row gutter={[16, 16]}>
                    <Col span={8}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <ManOutlined style={{ color: '#1890ff', marginRight: 4 }} />
                          Male Participants (ወንድ)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#1890ff', marginTop: 2 }}>
                          {Number(selectedSafe.male_participants || 0).toLocaleString()}
                        </div>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <WomanOutlined style={{ color: '#722ed1', marginRight: 4 }} />
                          Female Participants (ሴት)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#722ed1', marginTop: 2 }}>
                          {Number(selectedSafe.female_participants || 0).toLocaleString()}
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
                          {Number(selectedSafe.married_women_participants || 0).toLocaleString()}
                        </div>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <RiseOutlined style={{ color: '#fa8c16', marginRight: 4 }} />
                          Youth Participants (ወጣቶች)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#fa8c16', marginTop: 2 }}>
                          {Number(selectedSafe.youth_participants || 0).toLocaleString()}
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
                          {Number(selectedSafe.investors_participants || 0).toLocaleString()}
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
                    Safeguard Notes & Action Points
                  </span>
                }
                key="2"
              >
                <Card size="small" bordered={false} style={{ background: '#fcfdfd', border: '1px solid #e6f7ed', borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <CheckCircleOutlined style={{ color: '#1a5f2c', fontSize: 16 }} />
                    <strong style={{ color: '#1a5f2c', fontSize: 13, textTransform: 'uppercase' }}>
                      Safeguard Training Notes & Milestones (የጥበቃ ስልጠና ማስታወሻ)
                    </strong>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: '#262626', lineHeight: '1.6' }}>
                    {selectedSafe.safe_notes || 'Active gender and social inclusion safeguard training workshop.'}
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
                    <strong>{extractName(selectedSafe.zone)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Woreda">
                    <strong>{extractName(selectedSafe.woreda)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Kebele Operational Base">
                    <span style={{ color: '#1a5f2c', fontWeight: 'bold' }}>
                      {extractName(selectedSafe.kebele)}
                    </span>
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
                  <Descriptions.Item label="Fiscal Year (በጀት ዓመት)">
                    <Tag color="blue" icon={<CalendarOutlined />}>
                      {selectedSafe.fiscal_year || '2019 E.C.'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Production Campaign Season">
                    <strong>{selectedSafe.season || 'Meher (መኸር)'}</strong>
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

export default function GenderSafeguardTraining() {
  return (
    <App>
      <GenderSafeguardTrainingContent />
    </App>
  );
}