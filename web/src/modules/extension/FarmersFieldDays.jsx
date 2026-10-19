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
  WomanOutlined,
  ManOutlined,
  RiseOutlined,
  ShopOutlined,
  BankOutlined,
  CompassOutlined,
  TrophyOutlined,
  CheckSquareOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { farmerApi } from '../../services/api/farmerApi';
import { locationApi } from '../../services/api/locationApi';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

// Helper to safely extract string values from nested relation objects
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

const VENUE_TYPES = [
  'FTC Demonstration Center (የማሰልጠኛ ማዕከል ማሳ)',
  'Model Farmer Demonstration Plot (የሞዴል አርሶ አደር ማሳ)',
  'Cluster Farming Demonstration (የኩታ ገጠም ማሳ)',
  'Watershed Rehabilitation Site (የተፋሰስ ልማት ሳይት)'
];

const DEMO_COMMODITIES = [
  'Bora / Quncho Teff Row Planting',
  'Rust-Resistant Bread Wheat Technology',
  'Hybrid Maize & Fall Armyworm Management',
  'Malted Barley Production Package',
  'Irrigated Vegetables (Tomato / Onion)',
  'Grafted Avocado & Fruit Nursery',
  'Vermicompost & Bio-Fertilizer Demonstration',
  'Mechanized Harvesting & Threshing Demo'
];

const INITIAL_FIELD_DAYS = [
  {
    id: '1',
    event_code: 'FD-2019-EG-01',
    event_title: 'Bora Teff Mechanized Row-Planting Experience Sharing',
    venue_type: 'FTC Demonstration Center (የማሰልጠኛ ማዕከል ማሳ)',
    demonstrated_commodity: 'Bora / Quncho Teff Row Planting',
    event_date: '2026-08-14',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    host_name: 'Kurar Farmers Training Center Demo Site',
    male_heads_count: 340,
    female_heads_count: 85,
    married_women_count: 220,
    youth_count: 115,
    investors_count: 4,
    status: 'Completed',
    event_outcome: 'Participating smallholders agreed to adopt mechanized row planting across 4 neighboring kebeles.',
    zone: 'East Gojjam',
    woreda: 'Dejen',
    kebele: 'Kurar'
  },
  {
    id: '2',
    event_code: 'FD-2019-SG-03',
    event_title: 'High-Yielding Bread Wheat & Fungicide Field Demonstration',
    venue_type: 'Model Farmer Demonstration Plot (የሞዴል አርሶ አደር ማሳ)',
    demonstrated_commodity: 'Rust-Resistant Bread Wheat Technology',
    event_date: '2026-08-20',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    host_name: 'Ato Worku Tadesse (Model Farmer Plot)',
    male_heads_count: 420,
    female_heads_count: 110,
    married_women_count: 290,
    youth_count: 140,
    investors_count: 6,
    status: 'Completed',
    event_outcome: 'Demonstrated 48 quintals/ha yield potential with split urea and tilt application.',
    zone: 'South Gondar',
    woreda: 'Fogera',
    kebele: 'Woreta Zuria'
  },
  {
    id: '3',
    event_code: 'FD-2019-WG-05',
    event_title: 'Solar-Powered Drip Irrigation & Commercial Onion Demo',
    venue_type: 'Cluster Farming Demonstration (የኩታ ገጠም ማሳ)',
    demonstrated_commodity: 'Irrigated Vegetables (Tomato / Onion)',
    event_date: '2026-08-28',
    fiscal_year: '2019 E.C.',
    season: 'Bega / Irrigation (መስኖ/በጋ)',
    host_name: 'Bure Irrigation Smallholder Cluster',
    male_heads_count: 280,
    female_heads_count: 70,
    married_women_count: 190,
    youth_count: 95,
    investors_count: 2,
    status: 'Upcoming / Scheduled',
    event_outcome: 'Focus on water-saving solar pumps for dry season production.',
    zone: 'West Gojjam',
    woreda: 'Bure',
    kebele: 'Alefa'
  }
];

function FarmersFieldDaysContent() {
  const { message } = App.useApp();

  const [events, setEvents] = useState(INITIAL_FIELD_DAYS);
  const [isFetching, setIsFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [venueFilter, setVenueFilter] = useState(null);
  const [fiscalYearFilter, setFiscalYearFilter] = useState(null);
  const [seasonFilter, setSeasonFilter] = useState(null);
  const [commodityFilter, setCommodityFilter] = useState(null);
  const [zoneFilter, setZoneFilter] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
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
      if (editingEvent) {
        const initForm = async () => {
          const zoneMatch = zones.find(
            (z) => z.name === editingEvent.zone || z.id === editingEvent.zone_id
          );
          if (zoneMatch) {
            try {
              const wRes = locationApi?.getWoredas ? await locationApi.getWoredas(zoneMatch.id) : null;
              const wList = wRes?.data?.data?.data || wRes?.data?.data || [];
              setWoredas(wList);

              const woredaMatch = wList.find(
                (w) => w.name === editingEvent.woreda || w.id === editingEvent.woreda_id
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
            event_code: editingEvent.event_code,
            event_title: editingEvent.event_title,
            venue_type: editingEvent.venue_type,
            demonstrated_commodity: editingEvent.demonstrated_commodity,
            event_date: editingEvent.event_date ? dayjs(editingEvent.event_date) : dayjs(),
            fiscal_year: editingEvent.fiscal_year || '2019 E.C.',
            season: editingEvent.season || 'Meher (መኸር)',
            host_name: editingEvent.host_name,
            male_heads_count: Number(editingEvent.male_heads_count) || 0,
            female_heads_count: Number(editingEvent.female_heads_count) || 0,
            married_women_count: Number(editingEvent.married_women_count) || 0,
            youth_count: Number(editingEvent.youth_count) || 0,
            investors_count: Number(editingEvent.investors_count) || 0,
            event_outcome: editingEvent.event_outcome,
            zone_id: editingEvent.zone_id || zoneMatch?.id || editingEvent.zone,
            woreda_id: editingEvent.woreda_id || editingEvent.woreda,
            kebele_id: editingEvent.kebele_id || editingEvent.kebele
          });
        };
        initForm();
      } else {
        form.resetFields();
        form.setFieldsValue({
          venue_type: 'FTC Demonstration Center (የማሰልጠኛ ማዕከል ማሳ)',
          demonstrated_commodity: 'Bora / Quncho Teff Row Planting',
          event_date: dayjs(),
          fiscal_year: '2019 E.C.',
          season: 'Meher (መኸር)',
          male_heads_count: 0,
          female_heads_count: 0,
          married_women_count: 0,
          youth_count: 0,
          investors_count: 0
        });
        setWoredas([]);
        setKebeles([]);
      }
    }
  }, [isModalOpen, editingEvent, form, zones]);

  const loadData = async () => {
    setIsFetching(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      message.success('Farmers Field Days registry refreshed');
    } catch {
      message.error('Failed to refresh data');
    } finally {
      setIsFetching(false);
    }
  };

  // Direct In-Place Status Update without Opening the Form
  const handleQuickStatusChange = (recordId, newStatus) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === recordId ? { ...e, status: newStatus } : e))
    );
    message.success(`Field Day status updated to "${newStatus}"`);
  };

  // Filter pipeline
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const code = extractName(e.event_code).toLowerCase();
      const title = extractName(e.event_title).toLowerCase();
      const host = extractName(e.host_name).toLowerCase();
      const commodity = extractName(e.demonstrated_commodity).toLowerCase();
      const kebele = extractName(e.kebele).toLowerCase();
      const woreda = extractName(e.woreda).toLowerCase();
      const zone = extractName(e.zone).toLowerCase();
      const q = searchTerm.toLowerCase();

      const matchesSearch =
        code.includes(q) || title.includes(q) || host.includes(q) || commodity.includes(q) || kebele.includes(q) || woreda.includes(q) || zone.includes(q);
      const matchesVenue = venueFilter ? e.venue_type === venueFilter : true;
      const matchesFY = fiscalYearFilter ? e.fiscal_year === fiscalYearFilter : true;
      const matchesSeason = seasonFilter ? e.season === seasonFilter : true;
      const matchesCommodity = commodityFilter ? e.demonstrated_commodity === commodityFilter : true;
      const matchesZone = zoneFilter ? zone === zoneFilter.toLowerCase() : true;

      return matchesSearch && matchesVenue && matchesFY && matchesSeason && matchesCommodity && matchesZone;
    });
  }, [events, searchTerm, venueFilter, fiscalYearFilter, seasonFilter, commodityFilter, zoneFilter]);

  // Statistics Calculation for Indicator 1.6 / 1.7
  const stats = useMemo(() => {
    const totalEvents = filteredEvents.length;
    const maleHeads = filteredEvents.reduce((acc, e) => acc + (Number(e.male_heads_count) || 0), 0);
    const femaleHeads = filteredEvents.reduce((acc, e) => acc + (Number(e.female_heads_count) || 0), 0);
    const marriedWomen = filteredEvents.reduce((acc, e) => acc + (Number(e.married_women_count) || 0), 0);
    const youth = filteredEvents.reduce((acc, e) => acc + (Number(e.youth_count) || 0), 0);
    const investors = filteredEvents.reduce((acc, e) => acc + (Number(e.investors_count) || 0), 0);

    const totalParticipants = maleHeads + femaleHeads + marriedWomen + youth + investors;
    const totalWomenParticipants = femaleHeads + marriedWomen;
    const womenRatio = totalParticipants > 0 ? ((totalWomenParticipants / totalParticipants) * 100).toFixed(1) : 0;

    return {
      totalEvents,
      totalParticipants,
      maleHeads,
      femaleHeads,
      marriedWomen,
      totalWomenParticipants,
      youth,
      investors,
      womenRatio
    };
  }, [filteredEvents]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setVenueFilter(null);
    setFiscalYearFilter(null);
    setSeasonFilter(null);
    setCommodityFilter(null);
    setZoneFilter(null);
  };

  const handleOpenModal = (record = null) => {
    setEditingEvent(record);
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
        event_date: values.event_date ? values.event_date.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
        zone: selectedZone?.name || selectedZone?.zone_name || values.zone_id,
        woreda: selectedWoreda?.name || selectedWoreda?.woreda_name || values.woreda_id,
        kebele: selectedKebele?.name || selectedKebele?.kebele_name || values.kebele_id
      };

      if (editingEvent) {
        setEvents((prev) =>
          prev.map((item) =>
            item.id === editingEvent.id ? { ...item, ...payload, status: editingEvent.status } : item
          )
        );
        message.success('Farmers Field Day event updated successfully');
      } else {
        const newRecord = {
          ...payload,
          id: Date.now().toString(),
          event_code: values.event_code || `FD-${Date.now().toString().slice(-4)}`,
          status: 'Upcoming / Scheduled'
        };
        setEvents((prev) => [newRecord, ...prev]);
        message.success('New Farmers Field Day registered successfully');
      }
      setIsModalOpen(false);
    } catch (error) {
      message.error(error?.response?.data?.message || error.message || 'Failed to save Field Day record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    setEvents((prev) => prev.filter((item) => item.id !== id));
    message.success('Field Day record removed');
  };

  const exportToCSV = () => {
    if (!filteredEvents.length) {
      message.warning('No event records available to export');
      return;
    }
    const headers = [
      'Event Code,Event Title,Venue Type,Demonstrated Commodity,Date,FY,Season,Zone,Woreda,Kebele,Host Venue,Male Heads (አባወራ),Female Heads (እማወራ),Married Women (ባለትዳር),Youth (ወጣቶች),Investors (ባለሃብቶች),Total Participants,Status'
    ];
    const rows = filteredEvents.map((e) => {
      const total =
        (Number(e.male_heads_count) || 0) +
        (Number(e.female_heads_count) || 0) +
        (Number(e.married_women_count) || 0) +
        (Number(e.youth_count) || 0) +
        (Number(e.investors_count) || 0);

      return [
        `"${e.event_code || ''}"`,
        `"${e.event_title || ''}"`,
        `"${e.venue_type || ''}"`,
        `"${e.demonstrated_commodity || ''}"`,
        `"${e.event_date || ''}"`,
        `"${e.fiscal_year || ''}"`,
        `"${e.season || ''}"`,
        `"${extractName(e.zone)}"`,
        `"${extractName(e.woreda)}"`,
        `"${extractName(e.kebele)}"`,
        `"${e.host_name || ''}"`,
        e.male_heads_count || 0,
        e.female_heads_count || 0,
        e.married_women_count || 0,
        e.youth_count || 0,
        e.investors_count || 0,
        total,
        `"${e.status || ''}"`
      ].join(',');
    });

    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Indicator_1_6_Farmers_Field_Days_${Date.now()}.csv`;
    a.click();
    message.success('Report Form 2019 exported successfully');
  };

  const columns = [
    {
      title: 'Event Code & Title',
      key: 'event_info',
      width: 250,
      render: (_, r) => (
        <div>
          <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{r.event_title}</strong>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>
            Code: <span style={{ fontFamily: 'monospace' }}>{r.event_code}</span> | {r.event_date}
          </div>
        </div>
      )
    },
    {
      title: 'Venue Category',
      dataIndex: 'venue_type',
      key: 'venue_type',
      width: 200,
      render: (venue) => {
        let color = 'default';
        if (venue?.includes('FTC')) color = 'green';
        if (venue?.includes('Model')) color = 'gold';
        if (venue?.includes('Cluster')) color = 'blue';
        return <Tag color={color}>{venue}</Tag>;
      }
    },
    {
      title: 'Demonstrated Technology / Crop',
      dataIndex: 'demonstrated_commodity',
      key: 'demonstrated_commodity',
      width: 220,
      render: (tech) => <span style={{ fontWeight: 500, color: '#262626' }}>{tech}</span>
    },
    {
      title: 'Station & Host Venue',
      key: 'station',
      width: 210,
      render: (_, r) => (
        <div style={{ fontSize: 12 }}>
          <strong style={{ color: '#1a5f2c' }}>{r.host_name || 'Designated Demo Site'}</strong>
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
      title: 'Participants Reached',
      key: 'participants_breakdown',
      width: 230,
      render: (_, r) => {
        const total =
          (Number(r.male_heads_count) || 0) +
          (Number(r.female_heads_count) || 0) +
          (Number(r.married_women_count) || 0) +
          (Number(r.youth_count) || 0) +
          (Number(r.investors_count) || 0);

        return (
          <div style={{ fontSize: 11 }}>
            <div>
              Total: <strong style={{ color: '#1a5f2c' }}>{total.toLocaleString()} Smallholders</strong>
            </div>
            <div style={{ color: '#8c8c8c' }}>
              <span>አባወራ: {r.male_heads_count || 0}</span> | <span>እማወራ: {r.female_heads_count || 0}</span> | <span>ባለትዳር: {r.married_women_count || 0}</span>
            </div>
          </div>
        );
      }
    },
    {
      title: 'Event Status (In-Place Edit)',
      dataIndex: 'status',
      key: 'status',
      width: 180,
      render: (status, record) => (
        <Select
          value={status || 'Upcoming / Scheduled'}
          onChange={(newVal) => handleQuickStatusChange(record.id, newVal)}
          style={{ width: '100%' }}
          size="small"
        >
          <Option value="Upcoming / Scheduled">
            <Tag color="processing" icon={<ClockCircleOutlined />} style={{ margin: 0 }}>
              Upcoming
            </Tag>
          </Option>
          <Option value="Completed">
            <Tag color="success" icon={<CheckCircleOutlined />} style={{ margin: 0 }}>
              Completed
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
          <Tooltip title="View Field Day Dossier">
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: '#1890ff' }} />}
              onClick={() => {
                setSelectedEvent(record);
                setIsDossierOpen(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Edit Event Details">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: '#52c41a' }} />}
              onClick={() => handleOpenModal(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Record">
            <Popconfirm
              title="Delete field day record?"
              description="Are you sure you want to remove this Farmers Field Day?"
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
        <Breadcrumb.Item>Farmers Field Days (FTC & Farm Plots)</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#1a5f2c', fontFamily: "'Times New Roman', Times, serif" }}>
            Farmers Field Days (የአርሶ አደር የመስክ ቀን ዝግጅትና ተሳትፎ - Indicator 1.6/1.7)
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Demonstrating proven agricultural packages across Farmers Training Center (FTC) stations and model farmer demonstration clusters
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
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Total Field Day Participants</span>}
              value={stats.totalParticipants}
              prefix={<TeamOutlined style={{ color: '#1a5f2c', marginRight: 8 }} />}
              valueStyle={{ color: '#1a5f2c', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Organized Field Days: <strong style={{ color: '#262626' }}>{stats.totalEvents} events</strong>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #1890ff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Male Smallholders (ወንድ)</span>}
              value={stats.maleHeads}
              prefix={<ManOutlined style={{ color: '#1890ff', marginRight: 8 }} />}
              valueStyle={{ color: '#1890ff', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Household heads engaged in plot tours
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #722ed1', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Women Participating (እማወራ + ባለትዳር)</span>}
              value={stats.totalWomenParticipants}
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
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Youth & Investors Engaged</span>}
              value={stats.youth + stats.investors}
              prefix={<RiseOutlined style={{ color: '#fa8c16', marginRight: 8 }} />}
              valueStyle={{ color: '#fa8c16', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Youth (ወጣቶች): <strong>{stats.youth}</strong> | Investors (ባለሃብቶች): <strong>{stats.investors}</strong>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Filter & Action Toolbar: Export, Reset, and Organize Field Day Aligned Above Table */}
      <Card bordered={false} style={{ marginBottom: 16, borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }} bodyStyle={{ padding: '14px 16px' }}>
        <Row justify="space-between" align="middle" gutter={[12, 12]}>
          <Col xs={24} xxl={16} xl={15}>
            <Space wrap size={[10, 10]}>
              <Input
                placeholder="Search Title, Code, or Host..."
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: 220 }}
                allowClear
              />

              <Select
                placeholder="Venue Category"
                value={venueFilter}
                onChange={setVenueFilter}
                style={{ width: 195 }}
                allowClear
              >
                {VENUE_TYPES.map((vt) => (
                  <Option key={vt} value={vt}>{vt}</Option>
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
                placeholder="Demonstrated Commodity"
                value={commodityFilter}
                onChange={setCommodityFilter}
                style={{ width: 200 }}
                allowClear
              >
                {DEMO_COMMODITIES.map((c) => (
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
                {[...new Set(events.map((e) => extractName(e.zone)))].map((z) => (
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
                disabled={!(searchTerm || venueFilter || fiscalYearFilter || seasonFilter || commodityFilter || zoneFilter)}
              >
                Reset Filters
              </Button>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => handleOpenModal(null)}
                style={{ backgroundColor: '#1a5f2c', borderColor: '#1a5f2c', fontWeight: 600 }}
              >
                Organize Field Day
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Main Events Table */}
      <Table
        columns={columns}
        dataSource={filteredEvents}
        rowKey="id"
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} field days organized`
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
              {editingEvent ? 'Edit Farmers Field Day Event' : 'Organize New Farmers Field Day (የአርሶ አደር የመስክ ቀን ዝግጅት)'}
            </span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText={editingEvent ? 'Update Event' : 'Register Field Day'}
        okButtonProps={{ style: { backgroundColor: '#1a5f2c', borderColor: '#1a5f2c' }, loading: isSubmitting }}
        width={800}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Field Day Theme & Demonstration Focus
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="event_code"
                label="Event Batch Code"
                rules={[{ required: true, message: 'Code required' }]}
              >
                <Input placeholder="e.g. FD-2019-EG-08" />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item
                name="event_title"
                label="Field Day Title / Demonstration Topic"
                rules={[{ required: true, message: 'Event title required' }]}
              >
                <Input placeholder="e.g. Bora Teff Mechanized Row-Planting Experience Sharing" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="venue_type"
                label="Demonstration Venue Category"
                rules={[{ required: true, message: 'Select venue type' }]}
              >
                <Select>
                  {VENUE_TYPES.map((vt) => (
                    <Option key={vt} value={vt}>{vt}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="demonstrated_commodity"
                label="Demonstrated Crop / Technology"
                rules={[{ required: true, message: 'Select demonstrated technology' }]}
              >
                <Select>
                  {DEMO_COMMODITIES.map((c) => (
                    <Option key={c} value={c}>{c}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={14}>
              <Form.Item
                name="host_name"
                label="Host Demonstration Farm / FTC Unit"
                rules={[{ required: true, message: 'Host name required' }]}
              >
                <Input placeholder="e.g. Kurar FTC Farm Site / Ato Worku Tadesse Farm" />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item
                name="event_date"
                label="Field Day Date"
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
            Participants Mobilized by Cohort (የአርሶ አደር ተሳትፎ በጾታና በዕድሜ)
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="male_heads_count"
                label="Male Heads (አባወራ)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="female_heads_count"
                label="Female Heads (እማወራ)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="married_women_count"
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
                name="youth_count"
                label="Youth Farmers (ወጣቶች)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="investors_count"
                label="Commercial Investors (ባለሃብቶች)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="event_outcome" label="Key Field Day Outcomes, Feedbacks & Adoption Commitments">
                <TextArea rows={3} placeholder="Summarize participant reactions, commitments to adopt the technology, feedback from model farmers..." />
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

      {/* Comprehensive Field Day Dossier Modal */}
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
                  {selectedEvent?.event_title}
                </span>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                  Code: <span style={{ fontFamily: 'monospace' }}>{selectedEvent?.event_code}</span> | Date:{' '}
                  {selectedEvent?.event_date}
                </div>
              </div>
            </div>
            <div>
              <Tag
                color={selectedEvent?.status === 'Completed' ? 'success' : 'processing'}
                icon={selectedEvent?.status === 'Completed' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                style={{ fontSize: 12, padding: '2px 10px', borderRadius: 12 }}
              >
                {selectedEvent?.status || 'Upcoming'}
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
              handleOpenModal(selectedEvent);
            }}
          >
            Edit Event
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
        {selectedEvent && (
          <div style={{ paddingTop: 8 }}>
            {/* Top Metric Strip */}
            <Row gutter={12} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f6ffed', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Total Attendance</span>}
                    value={
                      (Number(selectedEvent.male_heads_count) || 0) +
                      (Number(selectedEvent.female_heads_count) || 0) +
                      (Number(selectedEvent.married_women_count) || 0) +
                      (Number(selectedEvent.youth_count) || 0) +
                      (Number(selectedEvent.investors_count) || 0)
                    }
                    suffix={<span style={{ fontSize: 12 }}>Farmers</span>}
                    valueStyle={{ fontSize: 15, fontWeight: 'bold', color: '#1a5f2c' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f0f5ff', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Venue Type</span>}
                    value={selectedEvent.venue_type?.includes('FTC') ? 'FTC Station' : 'Model Plot'}
                    valueStyle={{ fontSize: 15, fontWeight: 'bold', color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f9f0ff', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Women Share</span>}
                    value={
                      (Number(selectedEvent.male_heads_count) || 0) +
                      (Number(selectedEvent.female_heads_count) || 0) +
                      (Number(selectedEvent.married_women_count) || 0) +
                      (Number(selectedEvent.youth_count) || 0) +
                      (Number(selectedEvent.investors_count) || 0) > 0
                        ? (
                            (((Number(selectedEvent.female_heads_count) || 0) +
                              (Number(selectedEvent.married_women_count) || 0)) /
                              ((Number(selectedEvent.male_heads_count) || 0) +
                                (Number(selectedEvent.female_heads_count) || 0) +
                                (Number(selectedEvent.married_women_count) || 0) +
                                (Number(selectedEvent.youth_count) || 0) +
                                (Number(selectedEvent.investors_count) || 0))) *
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
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Event Date</span>}
                    value={selectedEvent.event_date}
                    valueStyle={{ fontSize: 14, fontWeight: 'bold', color: '#fa8c16' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* TABPANES */}
            <Tabs defaultActiveKey="1" type="card">
              {/* TAB 1: Attendance Breakdown */}
              <TabPane
                tab={
                  <span>
                    <TeamOutlined />
                    Attendance & Cohort Reach
                  </span>
                }
                key="1"
              >
                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }} style={{ marginBottom: 16 }}>
                  <Descriptions.Item label="Demonstrated Technology" span={2}>
                    <strong style={{ color: '#1a5f2c' }}>{selectedEvent.demonstrated_commodity}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Venue Category">
                    <Tag color="blue">{selectedEvent.venue_type}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Host Farm / Demo Unit">
                    <BankOutlined style={{ marginRight: 6, color: '#1a5f2c' }} />
                    {selectedEvent.host_name}
                  </Descriptions.Item>
                </Descriptions>

                <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: 16, background: '#fafafa' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1a5f2c', textTransform: 'uppercase', marginBottom: 12 }}>
                    Participant Disaggregation (የተሳታፊዎች ዝርዝር)
                  </div>
                  <Row gutter={[16, 16]}>
                    <Col span={8}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <ManOutlined style={{ color: '#1890ff', marginRight: 4 }} />
                          Male Household Heads (አባወራ)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#1890ff', marginTop: 2 }}>
                          {Number(selectedEvent.male_heads_count || 0).toLocaleString()}
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
                          {Number(selectedEvent.female_heads_count || 0).toLocaleString()}
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
                          {Number(selectedEvent.married_women_count || 0).toLocaleString()}
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
                          {Number(selectedEvent.youth_count || 0).toLocaleString()}
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
                          {Number(selectedEvent.investors_count || 0).toLocaleString()}
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
              </TabPane>

              {/* TAB 2: Outcomes & Feedback */}
              <TabPane
                tab={
                  <span>
                    <TrophyOutlined />
                    Demonstration Outcomes
                  </span>
                }
                key="2"
              >
                <Card
                  size="small"
                  bordered={false}
                  style={{ background: '#fcfdfd', border: '1px solid #e6f7ed', borderRadius: 8 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <CheckCircleOutlined style={{ color: '#1a5f2c', fontSize: 16 }} />
                    <strong style={{ color: '#1a5f2c', fontSize: 13, textTransform: 'uppercase' }}>
                      Key Outcomes & Adoption Commitments (የተገኙ ውጤቶችና ግብረ-መልስ)
                    </strong>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: '#262626', lineHeight: '1.6' }}>
                    {selectedEvent.event_outcome || 'Participating smallholders expressed high interest in replicating demonstrated farming packages.'}
                  </p>
                </Card>
              </TabPane>

              {/* TAB 3: Location & Period */}
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
                    <strong>{extractName(selectedEvent.zone)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Woreda">
                    <strong>{extractName(selectedEvent.woreda)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Kebele Operational Base">
                    <span style={{ color: '#1a5f2c', fontWeight: 'bold' }}>
                      {extractName(selectedEvent.kebele)}
                    </span>
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
                  <Descriptions.Item label="Fiscal Year (በጀት ዓመት)">
                    <Tag color="blue" icon={<CalendarOutlined />}>
                      {selectedEvent.fiscal_year || '2019 E.C.'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Production Campaign Season">
                    <strong>{selectedEvent.season || 'Meher (መኸር)'}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Host Farm Site" span={2}>
                    <BankOutlined style={{ marginRight: 6, color: '#1a5f2c' }} />
                    {selectedEvent.host_name}
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

export default function FarmersFieldDays() {
  return (
    <App>
      <FarmersFieldDaysContent />
    </App>
  );
}