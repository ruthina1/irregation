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

const ADAPTATION_CATEGORIES = [
  'Drought-Tolerant Cereal Adaptation (ድርቅን የሚቋቋሙ እህሎች ሙከራ)',
  'Heat-Resistant Lowland Horticulture (ሙቀትን የሚቋቋሙ ትክልቶች)',
  'Acid-Soil Tolerant Highland Crops (አሲዳማ አፈር ተስማሚ ሰብሎች)',
  'Salinity-Resistant Irrigation Crops (ጨዋማ ውሃ/አፈር ተስማሚ ሰብሎች)',
  'Frost-Resistant High-Altitude Variety Trial (ቅዝቃዜ ተከላካይ ሰብሎች)'
];

const ADAPTATION_ACTIVITIES = [
  'Phenotypic Performance & Growth Observation',
  'Pest & Disease Resistance Scoring Trial',
  'Biomass & Harvest Yield Sampling',
  'Micro-Climate Stress Resilience Evaluation',
  'Farmer Sensory & Agronomic Preference Ranking'
];

const INITIAL_ADAPTATIONS = [
  {
    id: '1',
    adapt_code: 'ADP-2019-EG-01',
    adapt_title: 'Kurar Drought-Resistant Sorghum & Maize Variety Trial',
    adapt_category: 'Drought-Tolerant Cereal Adaptation (ድርቅን የሚቋቋሙ እህሎች ሙከራ)',
    core_activity: 'Phenotypic Performance & Growth Observation',
    trial_lead: 'Dr. Mulate Alemu (Research Associate)',
    lead_phone: '+251 911 332 211',
    fiscal_year: '2019 E.C.',
    season: 'Belg (በልግ)',
    plot_size_ha: 1.5,
    male_participants: 45,
    female_participants: 25,
    married_women_participants: 20,
    youth_participants: 15,
    investors_participants: 2,
    adapt_status: 'Trial Ongoing',
    adapt_notes: 'Evaluating moisture stress tolerance across 5 newly bred drought-resistant cereal lines.',
    zone: 'East Gojjam',
    woreda: 'Dejen',
    kebele: 'Kurar'
  },
  {
    id: '2',
    adapt_code: 'ADP-2019-SG-04',
    adapt_title: 'Fogera Acid-Soil Tolerant Faba Bean & Wheat Adaptation',
    adapt_category: 'Acid-Soil Tolerant Highland Crops (አሲዳማ አፈር ተስማሚ ሰብሎች)',
    core_activity: 'Biomass & Harvest Yield Sampling',
    trial_lead: 'Woizero Tigist Abebe (Agronomist)',
    lead_phone: '+251 922 445 667',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    plot_size_ha: 2.0,
    male_participants: 60,
    female_participants: 30,
    married_women_participants: 24,
    youth_participants: 18,
    investors_participants: 3,
    adapt_status: 'Trial Ongoing',
    adapt_notes: 'Testing aluminum toxicity tolerance and lime response curves on acidic highland soils.',
    zone: 'South Gondar',
    woreda: 'Fogera',
    kebele: 'Woreta Zuria'
  },
  {
    id: '3',
    adapt_code: 'ADP-2019-WG-09',
    adapt_title: 'Bure Heat-Resistant Lowland Tomato & Pepper Trial',
    adapt_category: 'Heat-Resistant Lowland Horticulture (ሙቀትን የሚቋቋሙ ትክልቶች)',
    core_activity: 'Farmer Sensory & Agronomic Preference Ranking',
    trial_lead: 'Ato Getachew Mekonnen',
    lead_phone: '+251 913 778 990',
    fiscal_year: '2019 E.C.',
    season: 'Bega / Irrigation (መስኖ/በጋ)',
    plot_size_ha: 1.2,
    male_participants: 40,
    female_participants: 22,
    married_women_participants: 18,
    youth_participants: 12,
    investors_participants: 4,
    adapt_status: 'Completed & Evaluated',
    adapt_notes: 'Identified high-yielding heat-tolerant tomato lines suited for irrigated lowland corridors.',
    zone: 'West Gojjam',
    woreda: 'Bure',
    kebele: 'Alefa'
  }
];

function AdaptationDemosContent() {
  const { message } = App.useApp();

  const [adaptations, setAdaptations] = useState(INITIAL_ADAPTATIONS);
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
  const [editingAdapt, setEditingAdapt] = useState(null);
  const [selectedAdapt, setSelectedAdapt] = useState(null);
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
      if (editingAdapt) {
        const initForm = async () => {
          const zoneMatch = zones.find(
            (z) => z.name === editingAdapt.zone || z.id === editingAdapt.zone_id
          );
          if (zoneMatch) {
            try {
              const wRes = locationApi?.getWoredas ? await locationApi.getWoredas(zoneMatch.id) : null;
              const wList = wRes?.data?.data?.data || wRes?.data?.data || [];
              setWoredas(wList);

              const woredaMatch = wList.find(
                (w) => w.name === editingAdapt.woreda || w.id === editingAdapt.woreda_id
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
            adapt_code: editingAdapt.adapt_code,
            adapt_title: editingAdapt.adapt_title,
            adapt_category: editingAdapt.adapt_category,
            core_activity: editingAdapt.core_activity,
            trial_lead: editingAdapt.trial_lead,
            lead_phone: editingAdapt.lead_phone,
            fiscal_year: editingAdapt.fiscal_year || '2019 E.C.',
            season: editingAdapt.season || 'Meher (መኸር)',
            plot_size_ha: Number(editingAdapt.plot_size_ha) || 1.0,
            male_participants: Number(editingAdapt.male_participants) || 0,
            female_participants: Number(editingAdapt.female_participants) || 0,
            married_women_participants: Number(editingAdapt.married_women_participants) || 0,
            youth_participants: Number(editingAdapt.youth_participants) || 0,
            investors_participants: Number(editingAdapt.investors_participants) || 0,
            adapt_notes: editingAdapt.adapt_notes,
            zone_id: editingAdapt.zone_id || zoneMatch?.id || editingAdapt.zone,
            woreda_id: editingAdapt.woreda_id || editingAdapt.woreda,
            kebele_id: editingAdapt.kebele_id || editingAdapt.kebele
          });
        };
        initForm();
      } else {
        form.resetFields();
        form.setFieldsValue({
          adapt_category: 'Drought-Tolerant Cereal Adaptation (ድርቅን የሚቋቋሙ እህሎች ሙከራ)',
          core_activity: 'Phenotypic Performance & Growth Observation',
          fiscal_year: '2019 E.C.',
          season: 'Meher (መኸር)',
          plot_size_ha: 1.5,
          male_participants: 30,
          female_participants: 15,
          married_women_participants: 12,
          youth_participants: 10,
          investors_participants: 1
        });
        setWoredas([]);
        setKebeles([]);
      }
    }
  }, [isModalOpen, editingAdapt, form, zones]);

  const loadData = async () => {
    setIsFetching(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      message.success('Adaptation demonstrations registry refreshed');
    } catch {
      message.error('Failed to refresh data');
    } finally {
      setIsFetching(false);
    }
  };

  // Direct In-Place Status Update without Opening the Form
  const handleQuickStatusChange = (recordId, newStatus) => {
    setAdaptations((prev) =>
      prev.map((a) => (a.id === recordId ? { ...a, adapt_status: newStatus } : a))
    );
    message.success(`Trial status updated to "${newStatus}"`);
  };

  // Filter pipeline
  const filteredAdaptations = useMemo(() => {
    return adaptations.filter((a) => {
      const code = extractName(a.adapt_code).toLowerCase();
      const title = extractName(a.adapt_title).toLowerCase();
      const lead = extractName(a.trial_lead).toLowerCase();
      const kebele = extractName(a.kebele).toLowerCase();
      const woreda = extractName(a.woreda).toLowerCase();
      const zone = extractName(a.zone).toLowerCase();
      const q = searchTerm.toLowerCase();

      const matchesSearch =
        code.includes(q) || title.includes(q) || lead.includes(q) || kebele.includes(q) || woreda.includes(q) || zone.includes(q);
      const matchesCategory = categoryFilter ? a.adapt_category === categoryFilter : true;
      const matchesActivity = activityFilter ? a.core_activity === activityFilter : true;
      const matchesFY = fiscalYearFilter ? a.fiscal_year === fiscalYearFilter : true;
      const matchesSeason = seasonFilter ? a.season === seasonFilter : true;
      const matchesStatus = statusFilter ? a.adapt_status === statusFilter : true;
      const matchesZone = zoneFilter ? zone === zoneFilter.toLowerCase() : true;

      return matchesSearch && matchesCategory && matchesActivity && matchesFY && matchesSeason && matchesStatus && matchesZone;
    });
  }, [adaptations, searchTerm, categoryFilter, activityFilter, fiscalYearFilter, seasonFilter, statusFilter, zoneFilter]);

  // Statistics Calculation
  const stats = useMemo(() => {
    const totalAdapt = filteredAdaptations.length;
    const totalArea = filteredAdaptations.reduce((acc, a) => acc + (Number(a.plot_size_ha) || 0), 0);
    const maleParticipants = filteredAdaptations.reduce((acc, a) => acc + (Number(a.male_participants) || 0), 0);
    const femaleParticipants = filteredAdaptations.reduce((acc, a) => acc + (Number(a.female_participants) || 0), 0);
    const marriedWomen = filteredAdaptations.reduce((acc, a) => acc + (Number(a.married_women_participants) || 0), 0);
    const youth = filteredAdaptations.reduce((acc, a) => acc + (Number(a.youth_participants) || 0), 0);
    const investors = filteredAdaptations.reduce((acc, a) => acc + (Number(a.investors_participants) || 0), 0);

    const totalParticipants = maleParticipants + femaleParticipants + marriedWomen + youth + investors;
    const totalWomenParticipants = femaleParticipants + marriedWomen;
    const womenRatio = totalParticipants > 0 ? ((totalWomenParticipants / totalParticipants) * 100).toFixed(1) : 0;
    const ongoingCount = filteredAdaptations.filter((a) => a.adapt_status === 'Trial Ongoing').length;

    return {
      totalAdapt,
      totalArea,
      totalParticipants,
      maleParticipants,
      femaleParticipants,
      marriedWomen,
      totalWomenParticipants,
      youth,
      investors,
      womenRatio,
      ongoingCount
    };
  }, [filteredAdaptations]);

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
    setEditingAdapt(record);
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

      if (editingAdapt) {
        setAdaptations((prev) =>
          prev.map((item) =>
            item.id === editingAdapt.id ? { ...item, ...payload, adapt_status: editingAdapt.adapt_status } : item
          )
        );
        message.success('Adaptation trial record updated successfully');
      } else {
        const newRecord = {
          ...payload,
          id: Date.now().toString(),
          adapt_code: values.adapt_code || `ADP-${Date.now().toString().slice(-4)}`,
          adapt_status: 'Trial Ongoing'
        };
        setAdaptations((prev) => [newRecord, ...prev]);
        message.success('New adaptation trial registered successfully');
      }
      setIsModalOpen(false);
    } catch (error) {
      message.error(error?.response?.data?.message || error.message || 'Failed to save adaptation trial record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    setAdaptations((prev) => prev.filter((item) => item.id !== id));
    message.success('Adaptation trial record removed');
  };

  const exportToCSV = () => {
    if (!filteredAdaptations.length) {
      message.warning('No adaptation records available to export');
      return;
    }
    const headers = [
      'Adapt Code,Title,Category,Core Activity,Plot Size (Ha),Trial Lead,Phone,FY,Season,Zone,Woreda,Kebele,Male (ወንድ),Female (ሴት),Married Women (ባለትዳር),Youth (ወጣቶች),Investors (ባለሃብቶች),Total Participants,Status'
    ];
    const rows = filteredAdaptations.map((a) => {
      const total =
        (Number(a.male_participants) || 0) +
        (Number(a.female_participants) || 0) +
        (Number(a.married_women_participants) || 0) +
        (Number(a.youth_participants) || 0) +
        (Number(a.investors_participants) || 0);

      return [
        `"${a.adapt_code || ''}"`,
        `"${a.adapt_title || ''}"`,
        `"${a.adapt_category || ''}"`,
        `"${a.core_activity || ''}"`,
        a.plot_size_ha || 0,
        `"${a.trial_lead || ''}"`,
        `"${a.lead_phone || ''}"`,
        `"${a.fiscal_year || ''}"`,
        `"${a.season || ''}"`,
        `"${extractName(a.zone)}"`,
        `"${extractName(a.woreda)}"`,
        `"${extractName(a.kebele)}"`,
        a.male_participants || 0,
        a.female_participants || 0,
        a.married_women_participants || 0,
        a.youth_participants || 0,
        a.investors_participants || 0,
        total,
        `"${a.adapt_status || ''}"`
      ].join(',');
    });

    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Adaptation_Demonstrations_Report_${Date.now()}.csv`;
    a.click();
    message.success('Adaptation demonstrations report exported successfully');
  };

  const columns = [
    {
      title: 'Adapt Code & Title',
      key: 'adapt_info',
      width: 250,
      render: (_, r) => (
        <div>
          <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{r.adapt_title}</strong>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>
            Code: <span style={{ fontFamily: 'monospace' }}>{r.adapt_code}</span> | Size: {r.plot_size_ha} Ha
          </div>
        </div>
      )
    },
    {
      title: 'Adaptation Category',
      dataIndex: 'adapt_category',
      key: 'adapt_category',
      width: 210,
      render: (cat) => {
        let color = 'default';
        if (cat?.includes('Drought')) color = 'gold';
        if (cat?.includes('Heat')) color = 'orange';
        if (cat?.includes('Acid')) color = 'purple';
        if (cat?.includes('Salinity')) color = 'cyan';
        return <Tag color={color}>{cat}</Tag>;
      }
    },
    {
      title: 'Core Trial Activity',
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
              Total: <strong style={{ color: '#1a5f2c' }}>{total.toLocaleString()} Participants</strong>
            </div>
            <div style={{ color: '#8c8c8c' }}>
              <span>ወንድ: {r.male_participants || 0}</span> | <span>ሴት: {r.female_participants || 0}</span> | <span>ባለትዳር: {r.married_women_participants || 0}</span>
            </div>
          </div>
        );
      }
    },
    {
      title: 'Trial Status (In-Place Edit)',
      dataIndex: 'adapt_status',
      key: 'adapt_status',
      width: 190,
      render: (status, record) => (
        <Select
          value={status || 'Trial Ongoing'}
          onChange={(newVal) => handleQuickStatusChange(record.id, newVal)}
          style={{ width: '100%' }}
          size="small"
        >
          <Option value="Trial Ongoing">
            <Tag color="success" icon={<CheckCircleOutlined />} style={{ margin: 0 }}>
              Ongoing
            </Tag>
          </Option>
          <Option value="Completed & Evaluated">
            <Tag color="processing" icon={<ClockCircleOutlined />} style={{ margin: 0 }}>
              Completed
            </Tag>
          </Option>
          <Option value="Discontinued">
            <Tag color="default" icon={<ClockCircleOutlined />} style={{ margin: 0 }}>
              Discontinued
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
          <Tooltip title="View Trial Dossier">
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: '#1890ff' }} />}
              onClick={() => {
                setSelectedAdapt(record);
                setIsDossierOpen(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Edit Trial">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: '#52c41a' }} />}
              onClick={() => handleOpenModal(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Record">
            <Popconfirm
              title="Delete adaptation trial record?"
              description="Are you sure you want to remove this adaptation trial?"
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
        <Breadcrumb.Item>Demonstrations</Breadcrumb.Item>
        <Breadcrumb.Item>Adaptation Demonstrations (Crop & Horticulture)</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#1a5f2c', fontFamily: "'Times New Roman', Times, serif" }}>
            Adaptation Demonstrations (Crop & Horticulture) (የአየር ንብረትና አካባቢ ተስማሚ ሰብሎችና አትክልቶች ሙከራ)
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Tracking varietal adaptation trials, drought-resilient crop introductions, and multi-location horticultural testing plots
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
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Total Adaptation Area (Ha)</span>}
              value={stats.totalArea}
              suffix="Ha"
              prefix={<ExperimentOutlined style={{ color: '#1a5f2c', marginRight: 8 }} />}
              valueStyle={{ color: '#1a5f2c', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Total Trials: <strong style={{ color: '#262626' }}>{stats.totalAdapt} trials</strong>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #1890ff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Male Participants (ወንድ)</span>}
              value={stats.maleParticipants}
              prefix={<ManOutlined style={{ color: '#1890ff', marginRight: 8 }} />}
              valueStyle={{ color: '#1890ff', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Male participants in adaptation trials
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #722ed1', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Women Participants (ሴት + ባለትዳር)</span>}
              value={stats.totalWomenParticipants}
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
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Ongoing Trials</span>}
              value={stats.ongoingCount}
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
                placeholder="Search Title, Code, or Trial Lead..."
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: 220 }}
                allowClear
              />

              <Select
                placeholder="Adaptation Category"
                value={categoryFilter}
                onChange={setCategoryFilter}
                style={{ width: 195 }}
                allowClear
              >
                {ADAPTATION_CATEGORIES.map((ac) => (
                  <Option key={ac} value={ac}>{ac}</Option>
                ))}
              </Select>

              <Select
                placeholder="Core Activity"
                value={activityFilter}
                onChange={setActivityFilter}
                style={{ width: 200 }}
                allowClear
              >
                {ADAPTATION_ACTIVITIES.map((aa) => (
                  <Option key={aa} value={aa}>{aa}</Option>
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
                {[...new Set(adaptations.map((a) => extractName(a.zone)))].map((z) => (
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
                Export Adaptation CSV
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
                Register Trial
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Main Table */}
      <Table
        columns={columns}
        dataSource={filteredAdaptations}
        rowKey="id"
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} adaptation trials`
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
              {editingAdapt ? 'Edit Adaptation Trial Record' : 'Register Adaptation Trial (ተስማሚ ሰብሎች ሙከራ ምዝገባ)'}
            </span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText={editingAdapt ? 'Update Trial' : 'Save Trial Record'}
        okButtonProps={{ style: { backgroundColor: '#1a5f2c', borderColor: '#1a5f2c' }, loading: isSubmitting }}
        width={800}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Trial Identification & Category
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="adapt_code"
                label="Trial Code"
                rules={[{ required: true, message: 'Code required' }]}
              >
                <Input placeholder="e.g. ADP-2019-EG-08" />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item
                name="adapt_title"
                label="Adaptation Trial Title / Variety Name"
                rules={[{ required: true, message: 'Title required' }]}
              >
                <Input placeholder="e.g. Drought-Resistant Sorghum & Maize Variety Trial" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="adapt_category"
                label="Adaptation Category"
                rules={[{ required: true, message: 'Select category' }]}
              >
                <Select>
                  {ADAPTATION_CATEGORIES.map((ac) => (
                    <Option key={ac} value={ac}>{ac}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="core_activity"
                label="Core Trial Activity"
                rules={[{ required: true, message: 'Select activity' }]}
              >
                <Select>
                  {ADAPTATION_ACTIVITIES.map((aa) => (
                    <Option key={aa} value={aa}>{aa}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={14}>
              <Form.Item
                name="trial_lead"
                label="Trial Lead / Researcher Name"
                rules={[{ required: true, message: 'Trial lead required' }]}
              >
                <Input placeholder="e.g. Dr. Mulate Alemu" />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item
                name="lead_phone"
                label="Lead Phone Number"
                rules={[{ required: true, message: 'Phone required' }]}
              >
                <Input placeholder="+251 9..." />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Timeline & Plot Size (Hectares)
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
                name="plot_size_ha"
                label="Plot Size (Hectares)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0.1} max={50} step={0.1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Participants Enrolled by Cohort (ተሳታፊዎች በወኪል ምድብ)
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
                label="Youth Researchers (ወጣቶች)"
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
              <Form.Item name="adapt_notes" label="Trial Observations & Performance Notes">
                <TextArea rows={3} placeholder="Summarize phenotypic observations, stress resistance scores, or yield sampling data..." />
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

      {/* Comprehensive Adaptation Trial Dossier Modal */}
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
                  {selectedAdapt?.adapt_title}
                </span>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                  Code: <span style={{ fontFamily: 'monospace' }}>{selectedAdapt?.adapt_code}</span> | Trial Lead:{' '}
                  {selectedAdapt?.trial_lead}
                </div>
              </div>
            </div>
            <div>
              <Tag
                color={selectedAdapt?.adapt_status === 'Trial Ongoing' ? 'success' : 'processing'}
                icon={selectedAdapt?.adapt_status === 'Trial Ongoing' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                style={{ fontSize: 12, padding: '2px 10px', borderRadius: 12 }}
              >
                {selectedAdapt?.adapt_status || 'Ongoing'}
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
              handleOpenModal(selectedAdapt);
            }}
          >
            Edit Trial
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
        {selectedAdapt && (
          <div style={{ paddingTop: 8 }}>
            {/* Top Metric Strip */}
            <Row gutter={12} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f6ffed', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Trial Plot Size</span>}
                    value={selectedAdapt.plot_size_ha || 1.0}
                    suffix={<span style={{ fontSize: 12 }}>Ha</span>}
                    valueStyle={{ fontSize: 15, fontWeight: 'bold', color: '#1a5f2c' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f0f5ff', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Adaptation Category</span>}
                    value={selectedAdapt.adapt_category?.split(' ')[0] || 'Category'}
                    valueStyle={{ fontSize: 15, fontWeight: 'bold', color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f9f0ff', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Women Share</span>}
                    value={
                      (Number(selectedAdapt.male_participants) || 0) +
                      (Number(selectedAdapt.female_participants) || 0) +
                      (Number(selectedAdapt.married_women_participants) || 0) +
                      (Number(selectedAdapt.youth_participants) || 0) +
                      (Number(selectedAdapt.investors_participants) || 0) > 0
                        ? (
                            (((Number(selectedAdapt.female_participants) || 0) +
                              (Number(selectedAdapt.married_women_participants) || 0)) /
                              ((Number(selectedAdapt.male_participants) || 0) +
                                (Number(selectedAdapt.female_participants) || 0) +
                                (Number(selectedAdapt.married_women_participants) || 0) +
                                (Number(selectedAdapt.youth_participants) || 0) +
                                (Number(selectedAdapt.investors_participants) || 0))) *
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
                    value={selectedAdapt.fiscal_year}
                    valueStyle={{ fontSize: 13, fontWeight: 'bold', color: '#fa8c16' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* TABPANES */}
            <Tabs defaultActiveKey="1" type="card">
              {/* TAB 1: Trial Profile */}
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
                  <Descriptions.Item label="Trial Title" span={2}>
                    <strong style={{ color: '#1a5f2c' }}>{selectedAdapt.adapt_title}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Adaptation Category">
                    <Tag color="purple">{selectedAdapt.adapt_category}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Core Activity">
                    <Tag color="green">{selectedAdapt.core_activity}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Trial Lead">
                    {selectedAdapt.trial_lead} ({selectedAdapt.lead_phone})
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
                          {Number(selectedAdapt.male_participants || 0).toLocaleString()}
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
                          {Number(selectedAdapt.female_participants || 0).toLocaleString()}
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
                          {Number(selectedAdapt.married_women_participants || 0).toLocaleString()}
                        </div>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <RiseOutlined style={{ color: '#fa8c16', marginRight: 4 }} />
                          Youth Researchers (ወጣቶች)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#fa8c16', marginTop: 2 }}>
                          {Number(selectedAdapt.youth_participants || 0).toLocaleString()}
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
                          {Number(selectedAdapt.investors_participants || 0).toLocaleString()}
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
                    Trial Observations & Notes
                  </span>
                }
                key="2"
              >
                <Card size="small" bordered={false} style={{ background: '#fcfdfd', border: '1px solid #e6f7ed', borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <CheckCircleOutlined style={{ color: '#1a5f2c', fontSize: 16 }} />
                    <strong style={{ color: '#1a5f2c', fontSize: 13, textTransform: 'uppercase' }}>
                      Trial Performance Notes (የሙከራ ማሳ ማስታወሻ)
                    </strong>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: '#262626', lineHeight: '1.6' }}>
                    {selectedAdapt.adapt_notes || 'Active adaptation trial evaluating varietal resilience and performance.'}
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
                    <strong>{extractName(selectedAdapt.zone)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Woreda">
                    <strong>{extractName(selectedAdapt.woreda)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Kebele Operational Base">
                    <span style={{ color: '#1a5f2c', fontWeight: 'bold' }}>
                      {extractName(selectedAdapt.kebele)}
                    </span>
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
                  <Descriptions.Item label="Fiscal Year (በጀት ዓመት)">
                    <Tag color="blue" icon={<CalendarOutlined />}>
                      {selectedAdapt.fiscal_year || '2019 E.C.'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Production Campaign Season">
                    <strong>{selectedAdapt.season || 'Meher (መኸር)'}</strong>
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

export default function AdaptationDemos() {
  return (
    <App>
      <AdaptationDemosContent />
    </App>
  );
}