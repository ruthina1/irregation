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
  VideoCameraOutlined,
  PlayCircleOutlined,
  WomanOutlined,
  ManOutlined,
  RiseOutlined,
  ShopOutlined,
  BankOutlined,
  CheckSquareOutlined,
  LaptopOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { farmerApi } from '../../services/api/farmerApi';
import { locationApi } from '../../services/api/locationApi';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

// Helper to safely extract clean string values
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

const SCREENING_MODES = [
  'Pico Projector Screening (በተንቀሳቃሽ ፕሮጀክተር)',
  'FTC Smart TV / Hall Screening (በማሰልጠኛ አዳራሽ)',
  'Tablet-Assisted DA Screening (በባለሙያ ታብሌት)',
  'Mobile Van / Mobile Cinema (በሞባይል ሲኒማ)'
];

const VIDEO_COMMODITIES = [
  'Bora Teff Row-Planting & Seeding Rate',
  'Wheat Rust Early Identification & Spraying',
  'Integrated Fall Armyworm Biological Control',
  'Vermicompost Preparation & Soil Health',
  'Solar-Powered Surface Irrigation Methods',
  'Post-Harvest Hermetic Bag Storage Technique',
  'Modern Dairy Calf Management & Forage',
  'Hass Avocado Grafting & Orchard Management'
];

const INITIAL_VIDEO_SESSIONS = [
  {
    id: '1',
    session_code: 'VID-2019-EG-01',
    video_title: 'Bora Teff Row-Planting Calibration & Weed Control',
    screening_mode: 'Pico Projector Screening (በተንቀሳቃሽ ፕሮጀክተር)',
    commodity_topic: 'Bora Teff Row-Planting & Seeding Rate',
    screening_date: '2026-08-11',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    screening_venue: 'Kurar Got 2 Community Center',
    male_heads_viewers: 290,
    female_heads_viewers: 75,
    married_women_viewers: 195,
    youth_viewers: 90,
    investors_viewers: 2,
    adoption_rate_pct: 82,
    status: 'Completed & Evaluated',
    adoption_notes: 'Smallholders appreciated the 5cm seed drop technique; 64 farmers adopted in the subsequent planting week.',
    zone: 'East Gojjam',
    woreda: 'Dejen',
    kebele: 'Kurar'
  },
  {
    id: '2',
    session_code: 'VID-2019-SG-04',
    video_title: 'Vermicompost Pit Preparation and Nutrient Recycling',
    screening_mode: 'FTC Smart TV / Hall Screening (በማሰልጠኛ አዳራሽ)',
    commodity_topic: 'Vermicompost Preparation & Soil Health',
    screening_date: '2026-08-17',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    screening_venue: 'Woreta Zuria FTC Main Hall',
    male_heads_viewers: 340,
    female_heads_viewers: 110,
    married_women_viewers: 260,
    youth_viewers: 125,
    investors_viewers: 4,
    adoption_rate_pct: 76,
    status: 'Completed & Evaluated',
    adoption_notes: 'High interest among women farmers for kitchen waste composting; starter worms distributed to 45 households.',
    zone: 'South Gondar',
    woreda: 'Fogera',
    kebele: 'Woreta Zuria'
  },
  {
    id: '3',
    session_code: 'VID-2019-WG-09',
    video_title: 'Fall Armyworm Bio-Pesticide Application Demonstration',
    screening_mode: 'Tablet-Assisted DA Screening (በባለሙያ ታብሌት)',
    commodity_topic: 'Integrated Fall Armyworm Biological Control',
    screening_date: '2026-08-26',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    screening_venue: 'Alefa Got 1 Farmers Training Shed',
    male_heads_viewers: 210,
    female_heads_viewers: 45,
    married_women_viewers: 140,
    youth_viewers: 65,
    investors_viewers: 1,
    adoption_rate_pct: 70,
    status: 'Scheduled / Screening Underway',
    adoption_notes: 'Focus on timely morning spray when larvae are active.',
    zone: 'West Gojjam',
    woreda: 'Bure',
    kebele: 'Alefa'
  }
];

function VideoBasedExtensionContent() {
  const { message } = App.useApp();

  const [sessions, setSessions] = useState(INITIAL_VIDEO_SESSIONS);
  const [isFetching, setIsFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [modeFilter, setModeFilter] = useState(null);
  const [fiscalYearFilter, setFiscalYearFilter] = useState(null);
  const [seasonFilter, setSeasonFilter] = useState(null);
  const [commodityFilter, setCommodityFilter] = useState(null);
  const [zoneFilter, setZoneFilter] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
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
      if (editingSession) {
        const initForm = async () => {
          const zoneMatch = zones.find(
            (z) => z.name === editingSession.zone || z.id === editingSession.zone_id
          );
          if (zoneMatch) {
            try {
              const wRes = locationApi?.getWoredas ? await locationApi.getWoredas(zoneMatch.id) : null;
              const wList = wRes?.data?.data?.data || wRes?.data?.data || [];
              setWoredas(wList);

              const woredaMatch = wList.find(
                (w) => w.name === editingSession.woreda || w.id === editingSession.woreda_id
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
            session_code: editingSession.session_code,
            video_title: editingSession.video_title,
            screening_mode: editingSession.screening_mode,
            commodity_topic: editingSession.commodity_topic,
            screening_date: editingSession.screening_date ? dayjs(editingSession.screening_date) : dayjs(),
            fiscal_year: editingSession.fiscal_year || '2019 E.C.',
            season: editingSession.season || 'Meher (መኸር)',
            screening_venue: editingSession.screening_venue,
            male_heads_viewers: Number(editingSession.male_heads_viewers) || 0,
            female_heads_viewers: Number(editingSession.female_heads_viewers) || 0,
            married_women_viewers: Number(editingSession.married_women_viewers) || 0,
            youth_viewers: Number(editingSession.youth_viewers) || 0,
            investors_viewers: Number(editingSession.investors_viewers) || 0,
            adoption_rate_pct: Number(editingSession.adoption_rate_pct) || 75,
            adoption_notes: editingSession.adoption_notes,
            zone_id: editingSession.zone_id || zoneMatch?.id || editingSession.zone,
            woreda_id: editingSession.woreda_id || editingSession.woreda,
            kebele_id: editingSession.kebele_id || editingSession.kebele
          });
        };
        initForm();
      } else {
        form.resetFields();
        form.setFieldsValue({
          screening_mode: 'Pico Projector Screening (በተንቀሳቃሽ ፕሮጀክተር)',
          commodity_topic: 'Bora Teff Row-Planting & Seeding Rate',
          screening_date: dayjs(),
          fiscal_year: '2019 E.C.',
          season: 'Meher (መኸር)',
          male_heads_viewers: 0,
          female_heads_viewers: 0,
          married_women_viewers: 0,
          youth_viewers: 0,
          investors_viewers: 0,
          adoption_rate_pct: 75
        });
        setWoredas([]);
        setKebeles([]);
      }
    }
  }, [isModalOpen, editingSession, form, zones]);

  const loadData = async () => {
    setIsFetching(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      message.success('Video-based extension sessions refreshed');
    } catch {
      message.error('Failed to refresh data');
    } finally {
      setIsFetching(false);
    }
  };

  // Direct In-Place Status Update without Opening the Form
  const handleQuickStatusChange = (recordId, newStatus) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === recordId ? { ...s, status: newStatus } : s))
    );
    message.success(`Session status updated to "${newStatus}"`);
  };

  // Filter pipeline
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const code = extractName(s.session_code).toLowerCase();
      const title = extractName(s.video_title).toLowerCase();
      const venue = extractName(s.screening_venue).toLowerCase();
      const topic = extractName(s.commodity_topic).toLowerCase();
      const kebele = extractName(s.kebele).toLowerCase();
      const woreda = extractName(s.woreda).toLowerCase();
      const zone = extractName(s.zone).toLowerCase();
      const q = searchTerm.toLowerCase();

      const matchesSearch =
        code.includes(q) || title.includes(q) || venue.includes(q) || topic.includes(q) || kebele.includes(q) || woreda.includes(q) || zone.includes(q);
      const matchesMode = modeFilter ? s.screening_mode === modeFilter : true;
      const matchesFY = fiscalYearFilter ? s.fiscal_year === fiscalYearFilter : true;
      const matchesSeason = seasonFilter ? s.season === seasonFilter : true;
      const matchesCommodity = commodityFilter ? s.commodity_topic === commodityFilter : true;
      const matchesZone = zoneFilter ? zone === zoneFilter.toLowerCase() : true;

      return matchesSearch && matchesMode && matchesFY && matchesSeason && matchesCommodity && matchesZone;
    });
  }, [sessions, searchTerm, modeFilter, fiscalYearFilter, seasonFilter, commodityFilter, zoneFilter]);

  // Statistics Calculation
  const stats = useMemo(() => {
    const totalSessions = filteredSessions.length;
    const maleHeads = filteredSessions.reduce((acc, s) => acc + (Number(s.male_heads_viewers) || 0), 0);
    const femaleHeads = filteredSessions.reduce((acc, s) => acc + (Number(s.female_heads_viewers) || 0), 0);
    const marriedWomen = filteredSessions.reduce((acc, s) => acc + (Number(s.married_women_viewers) || 0), 0);
    const youth = filteredSessions.reduce((acc, s) => acc + (Number(s.youth_viewers) || 0), 0);
    const investors = filteredSessions.reduce((acc, s) => acc + (Number(s.investors_viewers) || 0), 0);

    const totalViewers = maleHeads + femaleHeads + marriedWomen + youth + investors;
    const totalWomenViewers = femaleHeads + marriedWomen;
    const womenRatio = totalViewers > 0 ? ((totalWomenViewers / totalViewers) * 100).toFixed(1) : 0;
    const avgAdoption =
      totalSessions > 0
        ? (filteredSessions.reduce((acc, s) => acc + (Number(s.adoption_rate_pct) || 0), 0) / totalSessions).toFixed(1)
        : 0;

    return {
      totalSessions,
      totalViewers,
      maleHeads,
      femaleHeads,
      marriedWomen,
      totalWomenViewers,
      youth,
      investors,
      womenRatio,
      avgAdoption
    };
  }, [filteredSessions]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setModeFilter(null);
    setFiscalYearFilter(null);
    setSeasonFilter(null);
    setCommodityFilter(null);
    setZoneFilter(null);
  };

  const handleOpenModal = (record = null) => {
    setEditingSession(record);
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
        screening_date: values.screening_date ? values.screening_date.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
        zone: selectedZone?.name || selectedZone?.zone_name || values.zone_id,
        woreda: selectedWoreda?.name || selectedWoreda?.woreda_name || values.woreda_id,
        kebele: selectedKebele?.name || selectedKebele?.kebele_name || values.kebele_id
      };

      if (editingSession) {
        setSessions((prev) =>
          prev.map((item) =>
            item.id === editingSession.id ? { ...item, ...payload, status: editingSession.status } : item
          )
        );
        message.success('Video screening session updated successfully');
      } else {
        const newRecord = {
          ...payload,
          id: Date.now().toString(),
          session_code: values.session_code || `VID-${Date.now().toString().slice(-4)}`,
          status: 'Scheduled / Screening Underway'
        };
        setSessions((prev) => [newRecord, ...prev]);
        message.success('New video extension session registered successfully');
      }
      setIsModalOpen(false);
    } catch (error) {
      message.error(error?.response?.data?.message || error.message || 'Failed to save video session');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    setSessions((prev) => prev.filter((item) => item.id !== id));
    message.success('Video extension session record removed');
  };

  const exportToCSV = () => {
    if (!filteredSessions.length) {
      message.warning('No video session records available to export');
      return;
    }
    const headers = [
      'Session Code,Video Title,Screening Mode,Commodity/Topic,Date,FY,Season,Zone,Woreda,Kebele,Venue,Male Heads (አባወራ),Female Heads (እማወራ),Married Women (ባለትዳር),Youth (ወጣቶች),Investors (ባለሃብቶች),Total Viewers,Adoption Rate (%),Status'
    ];
    const rows = filteredSessions.map((s) => {
      const total =
        (Number(s.male_heads_viewers) || 0) +
        (Number(s.female_heads_viewers) || 0) +
        (Number(s.married_women_viewers) || 0) +
        (Number(s.youth_viewers) || 0) +
        (Number(s.investors_viewers) || 0);

      return [
        `"${s.session_code || ''}"`,
        `"${s.video_title || ''}"`,
        `"${s.screening_mode || ''}"`,
        `"${s.commodity_topic || ''}"`,
        `"${s.screening_date || ''}"`,
        `"${s.fiscal_year || ''}"`,
        `"${s.season || ''}"`,
        `"${extractName(s.zone)}"`,
        `"${extractName(s.woreda)}"`,
        `"${extractName(s.kebele)}"`,
        `"${s.screening_venue || ''}"`,
        s.male_heads_viewers || 0,
        s.female_heads_viewers || 0,
        s.married_women_viewers || 0,
        s.youth_viewers || 0,
        s.investors_viewers || 0,
        total,
        s.adoption_rate_pct || 0,
        `"${s.status || ''}"`
      ].join(',');
    });

    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Indicator_Video_Based_Extension_${Date.now()}.csv`;
    a.click();
    message.success('Report Form 2019 exported successfully');
  };

  const columns = [
    {
      title: 'Session Code & Video Title',
      key: 'session_info',
      width: 250,
      render: (_, r) => (
        <div>
          <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{r.video_title}</strong>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>
            Code: <span style={{ fontFamily: 'monospace' }}>{r.session_code}</span> | {r.screening_date}
          </div>
        </div>
      )
    },
    {
      title: 'Screening Technology',
      dataIndex: 'screening_mode',
      key: 'screening_mode',
      width: 210,
      render: (mode) => {
        let color = 'default';
        if (mode?.includes('Pico')) color = 'purple';
        if (mode?.includes('Smart TV')) color = 'blue';
        if (mode?.includes('Tablet')) color = 'cyan';
        return <Tag color={color}>{mode}</Tag>;
      }
    },
    {
      title: 'Commodity Topic',
      dataIndex: 'commodity_topic',
      key: 'commodity_topic',
      width: 220,
      render: (topic) => <span style={{ fontWeight: 500, color: '#262626' }}>{topic}</span>
    },
    {
      title: 'Station & Screening Venue',
      key: 'station',
      width: 210,
      render: (_, r) => (
        <div style={{ fontSize: 12 }}>
          <strong style={{ color: '#1a5f2c' }}>{r.screening_venue || 'Designated Community Center'}</strong>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>
            <EnvironmentOutlined style={{ marginRight: 4 }} />
            {extractName(r.zone)} &gt; {extractName(r.woreda)} &gt; {extractName(r.kebele)}
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
      title: 'Viewers Reached',
      key: 'viewers_breakdown',
      width: 230,
      render: (_, r) => {
        const total =
          (Number(r.male_heads_viewers) || 0) +
          (Number(r.female_heads_viewers) || 0) +
          (Number(r.married_women_viewers) || 0) +
          (Number(r.youth_viewers) || 0) +
          (Number(r.investors_viewers) || 0);

        return (
          <div style={{ fontSize: 11 }}>
            <div>
              Total: <strong style={{ color: '#1a5f2c' }}>{total.toLocaleString()} Viewers</strong>
            </div>
            <div style={{ color: '#8c8c8c' }}>
              <span>አባወራ: {r.male_heads_viewers || 0}</span> | <span>እማወራ: {r.female_heads_viewers || 0}</span> | <span>ባለትዳር: {r.married_women_viewers || 0}</span>
            </div>
          </div>
        );
      }
    },
    {
      title: 'Adoption Rate',
      dataIndex: 'adoption_rate_pct',
      key: 'adoption_rate_pct',
      align: 'right',
      width: 130,
      render: (rate) => (
        <Tag color={Number(rate) >= 75 ? 'green' : 'orange'} style={{ fontWeight: 600 }}>
          {rate || 0}% Adopted
        </Tag>
      )
    },
    {
      title: 'Session Status (In-Place Edit)',
      dataIndex: 'status',
      key: 'status',
      width: 200,
      render: (status, record) => (
        <Select
          value={status || 'Scheduled / Screening Underway'}
          onChange={(newVal) => handleQuickStatusChange(record.id, newVal)}
          style={{ width: '100%' }}
          size="small"
        >
          <Option value="Scheduled / Screening Underway">
            <Tag color="processing" icon={<ClockCircleOutlined />} style={{ margin: 0 }}>
              Underway
            </Tag>
          </Option>
          <Option value="Completed & Evaluated">
            <Tag color="success" icon={<CheckCircleOutlined />} style={{ margin: 0 }}>
              Evaluated
            </Tag>
          </Option>
          <Option value="Follow-up Pending">
            <Tag color="warning" icon={<ClockCircleOutlined />} style={{ margin: 0 }}>
              Follow-up
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
          <Tooltip title="View Session Dossier">
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: '#1890ff' }} />}
              onClick={() => {
                setSelectedSession(record);
                setIsDossierOpen(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Edit Session Details">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: '#52c41a' }} />}
              onClick={() => handleOpenModal(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Session">
            <Popconfirm
              title="Delete video extension record?"
              description="Are you sure you want to remove this video screening record?"
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
        <Breadcrumb.Item>Video-Based Extension (Prep, Show & Adoption)</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#1a5f2c', fontFamily: "'Times New Roman', Times, serif" }}>
            Video-Based Extension (በቪዲዮ የተደገፈ የኤክስቴንሽን አገልግሎት ዝግጅት፣ እይታና ጉዲፈቻ)
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Multimedia-enabled agricultural knowledge transfer using Pico-projectors, smart FTC screens, and verified practice adoption metrics
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
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Total Viewers Mobilized</span>}
              value={stats.totalViewers}
              prefix={<PlayCircleOutlined style={{ color: '#1a5f2c', marginRight: 8 }} />}
              valueStyle={{ color: '#1a5f2c', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Screening Sessions: <strong style={{ color: '#262626' }}>{stats.totalSessions} shows</strong>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #1890ff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Male Heads (አባወራ)</span>}
              value={stats.maleHeads}
              prefix={<ManOutlined style={{ color: '#1890ff', marginRight: 8 }} />}
              valueStyle={{ color: '#1890ff', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Direct agricultural video audience
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #722ed1', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Women Participating (እማወራ + ባለትዳር)</span>}
              value={stats.totalWomenViewers}
              prefix={<WomanOutlined style={{ color: '#722ed1', marginRight: 8 }} />}
              valueStyle={{ color: '#722ed1', fontWeight: 'bold', fontSize: 24 }}
            />
            <Progress percent={Number(stats.womenRatio)} size="small" strokeColor="#722ed1" />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8c8c8c', marginTop: 2 }}>
              <span>Share: <strong style={{ color: '#722ed1' }}>{stats.womenRatio}%</strong></span>
              <span>እማወራ: {stats.femaleHeads} | ባለትዳር: {stats.marriedWomen}</span>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #fa8c16', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Average Verified Adoption Rate</span>}
              value={stats.avgAdoption}
              suffix="%"
              prefix={<CheckSquareOutlined style={{ color: '#fa8c16', marginRight: 8 }} />}
              valueStyle={{ color: '#fa8c16', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Youth Viewers: <strong>{stats.youth}</strong> | Investors: <strong>{stats.investors}</strong>
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
                placeholder="Search Title, Topic, or Venue..."
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: 220 }}
                allowClear
              />

              <Select
                placeholder="Screening Mode"
                value={modeFilter}
                onChange={setModeFilter}
                style={{ width: 195 }}
                allowClear
              >
                {SCREENING_MODES.map((m) => (
                  <Option key={m} value={m}>{m}</Option>
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
                placeholder="Commodity / Topic"
                value={commodityFilter}
                onChange={setCommodityFilter}
                style={{ width: 200 }}
                allowClear
              >
                {VIDEO_COMMODITIES.map((c) => (
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
                {[...new Set(sessions.map((s) => extractName(s.zone)))].map((z) => (
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
                Export Form 2019
              </Button>

              <Button
                icon={<ClearOutlined />}
                onClick={handleResetFilters}
                disabled={!(searchTerm || modeFilter || fiscalYearFilter || seasonFilter || commodityFilter || zoneFilter)}
              >
                Reset Filters
              </Button>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => handleOpenModal(null)}
                style={{ backgroundColor: '#1a5f2c', borderColor: '#1a5f2c', fontWeight: 600 }}
              >
                Log Video Screening
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Main Table */}
      <Table
        columns={columns}
        dataSource={filteredSessions}
        rowKey="id"
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} video screening shows`
        }}
        scroll={{ x: 1350 }}
        bordered
        size="middle"
      />

      {/* Registration / Edit Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <VideoCameraOutlined style={{ color: '#1a5f2c', fontSize: 20 }} />
            <span style={{ color: '#1a5f2c', fontWeight: 'bold', fontFamily: "'Times New Roman', Times, serif", fontSize: 17 }}>
              {editingSession ? 'Edit Video-Based Extension Session' : 'Register Video Screening & Adoption Session (የቪዲዮ ኤክስቴንሽን ምዝገባ)'}
            </span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText={editingSession ? 'Update Session' : 'Save Session'}
        okButtonProps={{ style: { backgroundColor: '#1a5f2c', borderColor: '#1a5f2c' }, loading: isSubmitting }}
        width={800}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Video Production & Screening Metadata
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="session_code"
                label="Session Batch Code"
                rules={[{ required: true, message: 'Code required' }]}
              >
                <Input placeholder="e.g. VID-2019-EG-08" />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item
                name="video_title"
                label="Educational Video Title"
                rules={[{ required: true, message: 'Video title required' }]}
              >
                <Input placeholder="e.g. Bora Teff Row-Planting Calibration & Weed Control" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="screening_mode"
                label="Screening Technology Used"
                rules={[{ required: true, message: 'Select technology mode' }]}
              >
                <Select>
                  {SCREENING_MODES.map((m) => (
                    <Option key={m} value={m}>{m}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="commodity_topic"
                label="Demonstrated Agricultural Commodity / Practice"
                rules={[{ required: true, message: 'Select commodity' }]}
              >
                <Select>
                  {VIDEO_COMMODITIES.map((c) => (
                    <Option key={c} value={c}>{c}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={14}>
              <Form.Item
                name="screening_venue"
                label="Screening Venue / Community Shed / Got"
                rules={[{ required: true, message: 'Screening venue required' }]}
              >
                <Input placeholder="e.g. Kurar Got 2 Community Center" />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item
                name="screening_date"
                label="Screening Date"
                rules={[{ required: true, message: 'Date required' }]}
              >
                <DatePicker style={{ width: '100%' }} />
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
            Viewers Reached by Cohort (የተመልካች አርሶ አደሮች ተሳትፎ)
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="male_heads_viewers"
                label="Male Heads (አባወራ)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="female_heads_viewers"
                label="Female Heads (እማወራ)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="married_women_viewers"
                label="Married Women (ባለትዳር)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="youth_viewers"
                label="Youth Smallholders (ወጣቶች)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="investors_viewers"
                label="Commercial Investors (ባለሃብቶች)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="adoption_rate_pct"
                label="Verified Adoption Rate (%)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="adoption_notes" label="Practice Adoption Observations & Follow-up Verification">
                <TextArea rows={3} placeholder="Document confirmed post-screening adoption, field replication by smallholders, or farmer feedback..." />
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

      {/* Comprehensive Video Extension Dossier Modal */}
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
                <VideoCameraOutlined />
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
                  {selectedSession?.video_title}
                </span>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                  Code: <span style={{ fontFamily: 'monospace' }}>{selectedSession?.session_code}</span> | Date:{' '}
                  {selectedSession?.screening_date}
                </div>
              </div>
            </div>
            <div>
              <Tag
                color={selectedSession?.status?.includes('Evaluated') ? 'success' : 'processing'}
                icon={selectedSession?.status?.includes('Evaluated') ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                style={{ fontSize: 12, padding: '2px 10px', borderRadius: 12 }}
              >
                {selectedSession?.status || 'Active'}
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
              handleOpenModal(selectedSession);
            }}
          >
            Edit Session
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
        {selectedSession && (
          <div style={{ paddingTop: 8 }}>
            {/* Top Metric Strip */}
            <Row gutter={12} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f6ffed', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Total Viewers</span>}
                    value={
                      (Number(selectedSession.male_heads_viewers) || 0) +
                      (Number(selectedSession.female_heads_viewers) || 0) +
                      (Number(selectedSession.married_women_viewers) || 0) +
                      (Number(selectedSession.youth_viewers) || 0) +
                      (Number(selectedSession.investors_viewers) || 0)
                    }
                    suffix={<span style={{ fontSize: 12 }}>Viewers</span>}
                    valueStyle={{ fontSize: 15, fontWeight: 'bold', color: '#1a5f2c' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f0f5ff', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Screening Tool</span>}
                    value={selectedSession.screening_mode?.split(' ')[0] || 'Projector'}
                    valueStyle={{ fontSize: 15, fontWeight: 'bold', color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f9f0ff', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Women Audience</span>}
                    value={
                      (Number(selectedSession.male_heads_viewers) || 0) +
                      (Number(selectedSession.female_heads_viewers) || 0) +
                      (Number(selectedSession.married_women_viewers) || 0) +
                      (Number(selectedSession.youth_viewers) || 0) +
                      (Number(selectedSession.investors_viewers) || 0) > 0
                        ? (
                            (((Number(selectedSession.female_heads_viewers) || 0) +
                              (Number(selectedSession.married_women_viewers) || 0)) /
                              ((Number(selectedSession.male_heads_viewers) || 0) +
                                (Number(selectedSession.female_heads_viewers) || 0) +
                                (Number(selectedSession.married_women_viewers) || 0) +
                                (Number(selectedSession.youth_viewers) || 0) +
                                (Number(selectedSession.investors_viewers) || 0))) *
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
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Practice Adoption</span>}
                    value={selectedSession.adoption_rate_pct || 0}
                    suffix="%"
                    valueStyle={{ fontSize: 15, fontWeight: 'bold', color: '#fa8c16' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* TABPANES */}
            <Tabs defaultActiveKey="1" type="card">
              {/* TAB 1: Viewers Demographic Breakdown */}
              <TabPane
                tab={
                  <span>
                    <TeamOutlined />
                    Audience Demographics & Reach
                  </span>
                }
                key="1"
              >
                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }} style={{ marginBottom: 16 }}>
                  <Descriptions.Item label="Demonstrated Topic" span={2}>
                    <strong style={{ color: '#1a5f2c' }}>{selectedSession.commodity_topic}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Screening Technology">
                    <Tag color="purple">{selectedSession.screening_mode}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Screening Venue">
                    <BankOutlined style={{ marginRight: 6, color: '#1a5f2c' }} />
                    {selectedSession.screening_venue}
                  </Descriptions.Item>
                </Descriptions>

                <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: 16, background: '#fafafa' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1a5f2c', textTransform: 'uppercase', marginBottom: 12 }}>
                    Viewer Disaggregation (የተመልካቾች ዝርዝር)
                  </div>
                  <Row gutter={[16, 16]}>
                    <Col span={8}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <ManOutlined style={{ color: '#1890ff', marginRight: 4 }} />
                          Male Household Heads (አባወራ)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#1890ff', marginTop: 2 }}>
                          {Number(selectedSession.male_heads_viewers || 0).toLocaleString()}
                        </div>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <WomanOutlined style={{ color: '#722ed1', marginRight: 4 }} />
                          Female Household Heads (እማወራ)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#722ed1', marginTop: 2 }}>
                          {Number(selectedSession.female_heads_viewers || 0).toLocaleString()}
                        </div>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <WomanOutlined style={{ color: '#eb2f96', marginRight: 4 }} />
                          Married Women (ባለትዳር ሴቶች)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#eb2f96', marginTop: 2 }}>
                          {Number(selectedSession.married_women_viewers || 0).toLocaleString()}
                        </div>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <RiseOutlined style={{ color: '#fa8c16', marginRight: 4 }} />
                          Youth Smallholders (ወጣቶች)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#fa8c16', marginTop: 2 }}>
                          {Number(selectedSession.youth_viewers || 0).toLocaleString()}
                        </div>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <ShopOutlined style={{ color: '#13c2c2', marginRight: 4 }} />
                          Commercial Investors (ባለሃብቶች)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#13c2c2', marginTop: 2 }}>
                          {Number(selectedSession.investors_viewers || 0).toLocaleString()}
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
              </TabPane>

              {/* TAB 2: Adoption Verification & Feedback */}
              <TabPane
                tab={
                  <span>
                    <CheckSquareOutlined />
                    Adoption & Field Verification
                  </span>
                }
                key="2"
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <Card size="small" bordered={false} style={{ background: '#fcfdfd', border: '1px solid #e6f7ed', borderRadius: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <CheckCircleOutlined style={{ color: '#1a5f2c', fontSize: 16 }} />
                      <strong style={{ color: '#1a5f2c', fontSize: 13, textTransform: 'uppercase' }}>
                        Verified Practice Adoption Notes (የተግባራዊነት ግብረ-መልስ)
                      </strong>
                    </div>
                    <p style={{ margin: 0, fontSize: 13, color: '#262626', lineHeight: '1.6' }}>
                      {selectedSession.adoption_notes || 'Smallholders confirmed intention to implement the shown methodology during current agricultural operations.'}
                    </p>
                  </Card>
                </div>
              </TabPane>

              {/* TAB 3: Location & Campaign */}
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
                    <strong>{extractName(selectedSession.zone)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Woreda">
                    <strong>{extractName(selectedSession.woreda)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Kebele Operational Base">
                    <span style={{ color: '#1a5f2c', fontWeight: 'bold' }}>
                      {extractName(selectedSession.kebele)}
                    </span>
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
                  <Descriptions.Item label="Fiscal Year (በጀት ዓመት)">
                    <Tag color="blue" icon={<CalendarOutlined />}>
                      {selectedSession.fiscal_year || '2019 E.C.'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Production Campaign Season">
                    <strong>{selectedSession.season || 'Meher (መኸር)'}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Screening Venue Location" span={2}>
                    <BankOutlined style={{ marginRight: 6, color: '#1a5f2c' }} />
                    {selectedSession.screening_venue}
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

export default function VideoBasedExtension() {
  return (
    <App>
      <VideoBasedExtensionContent />
    </App>
  );
}