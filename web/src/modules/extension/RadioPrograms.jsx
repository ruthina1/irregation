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
  AudioOutlined,
  SoundOutlined,
  WomanOutlined,
  ManOutlined,
  RiseOutlined,
  ShopOutlined,
  BankOutlined,
  CheckSquareOutlined,
  CustomerServiceOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { farmerApi } from '../../services/api/farmerApi';
import { locationApi } from '../../services/api/locationApi';

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

const BROADCAST_STATIONS = [
  'EBC National Radio (የኢትዮጵያ ብሔራዊ ሬዲዮ)',
  'Regional FM Broadcaster (ክልል ኤፍ ኤም ሬዲዮ)',
  'Community Radio Network (ህብረተሰብ ሬዲዮ)',
  'Agricultural Research Podcast / Audio Feed (የምርምር ኦዲዮ ስርጭት)'
];

const RADIO_TOPICS = [
  'Seasonal Agronomic Calendar & Land Prep (የእርሻ ዝግጅትና ወቅታዊ ስራዎች)',
  'Certified Seed & Balanced Fertilizer Guide (ምርጥ ዘርና ማዳበሪያ አጠቃቀም)',
  'Fall Armyworm & Crop Pest Early Warning (ተባይና በሽታ ቅድመ ማስጠንቀቂያ)',
  'Small-Scale Irrigation & Water Harvesting (አነስተኛ መስኖ)',
  'Livestock Feed, Forage & Dairy Health (እንስሳት መኖና ጤና)',
  'Agricultural Market Prices & Linkage (የገበያ ዋጋ መረጃ)'
];

const INITIAL_RADIO_PROGRAMS = [
  {
    id: '1',
    program_code: 'RAD-2019-EG-01',
    program_title: 'Green Footsteps: Meher Season Teff Row-Planting Campaign',
    broadcasting_station: 'Regional FM Broadcaster (ክልል ኤፍ ኤም ሬዲዮ)',
    broadcast_topic: 'Seasonal Agronomic Calendar & Land Prep (የእርሻ ዝግጅትና ወቅታዊ ስራዎች)',
    air_date: '2026-08-10',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    duration_minutes: 45,
    male_listeners: 4200,
    female_listeners: 1350,
    married_women_listeners: 1100,
    youth_listeners: 1600,
    investors_listeners: 120,
    broadcast_status: 'Broadcasted',
    program_notes: 'Reached wide rural listenership via local language broadcast; positive feedback received through call-in segment.',
    zone: 'East Gojjam',
    woreda: 'Dejen',
    kebele: 'Kurar'
  },
  {
    id: '2',
    program_code: 'RAD-2019-SG-03',
    program_title: 'Protecting Our Harvest: Wheat Rust Prevention & Control',
    broadcasting_station: 'EBC National Radio (የኢትዮጵያ ብሔራዊ ሬዲዮ)',
    broadcast_topic: 'Fall Armyworm & Crop Pest Early Warning (ተባይና በሽታ ቅድመ ማስጠንቀቂያ)',
    air_date: '2026-08-16',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    duration_minutes: 30,
    male_listeners: 5100,
    female_listeners: 1800,
    married_women_listeners: 1450,
    youth_listeners: 1900,
    investors_listeners: 150,
    broadcast_status: 'Broadcasted',
    program_notes: 'Highlighted early fungicide spraying protocols and resistant seed varieties across highland grain belts.',
    zone: 'South Gondar',
    woreda: 'Fogera',
    kebele: 'Woreta Zuria'
  },
  {
    id: '3',
    program_code: 'RAD-2019-WG-07',
    program_title: 'Market Pulse: Commodity Price Trends and Direct Linkages',
    broadcasting_station: 'Community Radio Network (ህብረተሰብ ሬዲዮ)',
    broadcast_topic: 'Agricultural Market Prices & Linkage (የገበያ ዋጋ መረጃ)',
    air_date: '2026-08-25',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    duration_minutes: 30,
    male_listeners: 2800,
    female_listeners: 920,
    married_women_listeners: 750,
    youth_listeners: 980,
    investors_listeners: 85,
    broadcast_status: 'Scheduled',
    program_notes: 'Scheduled for evening prime time to ensure maximum smallholder household participation.',
    zone: 'West Gojjam',
    woreda: 'Bure',
    kebele: 'Alefa'
  }
];

function RadioProgramsContent() {
  const { message } = App.useApp();

  const [programs, setPrograms] = useState(INITIAL_RADIO_PROGRAMS);
  const [isFetching, setIsFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [stationFilter, setStationFilter] = useState(null);
  const [fiscalYearFilter, setFiscalYearFilter] = useState(null);
  const [seasonFilter, setSeasonFilter] = useState(null);
  const [topicFilter, setTopicFilter] = useState(null);
  const [zoneFilter, setZoneFilter] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
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
      if (editingProgram) {
        const initForm = async () => {
          const zoneMatch = zones.find(
            (z) => z.name === editingProgram.zone || z.id === editingProgram.zone_id
          );
          if (zoneMatch) {
            try {
              const wRes = locationApi?.getWoredas ? await locationApi.getWoredas(zoneMatch.id) : null;
              const wList = wRes?.data?.data?.data || wRes?.data?.data || [];
              setWoredas(wList);

              const woredaMatch = wList.find(
                (w) => w.name === editingProgram.woreda || w.id === editingProgram.woreda_id
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
            program_code: editingProgram.program_code,
            program_title: editingProgram.program_title,
            broadcasting_station: editingProgram.broadcasting_station,
            broadcast_topic: editingProgram.broadcast_topic,
            air_date: editingProgram.air_date ? dayjs(editingProgram.air_date) : dayjs(),
            fiscal_year: editingProgram.fiscal_year || '2019 E.C.',
            season: editingProgram.season || 'Meher (መኸር)',
            duration_minutes: Number(editingProgram.duration_minutes) || 30,
            male_listeners: Number(editingProgram.male_listeners) || 0,
            female_listeners: Number(editingProgram.female_listeners) || 0,
            married_women_listeners: Number(editingProgram.married_women_listeners) || 0,
            youth_listeners: Number(editingProgram.youth_listeners) || 0,
            investors_listeners: Number(editingProgram.investors_listeners) || 0,
            program_notes: editingProgram.program_notes,
            zone_id: editingProgram.zone_id || zoneMatch?.id || editingProgram.zone,
            woreda_id: editingProgram.woreda_id || editingProgram.woreda,
            kebele_id: editingProgram.kebele_id || editingProgram.kebele
          });
        };
        initForm();
      } else {
        form.resetFields();
        form.setFieldsValue({
          broadcasting_station: 'Regional FM Broadcaster (ክልል ኤፍ ኤም ሬዲዮ)',
          broadcast_topic: 'Seasonal Agronomic Calendar & Land Prep (የእርሻ ዝግጅትና ወቅታዊ ስራዎች)',
          air_date: dayjs(),
          fiscal_year: '2019 E.C.',
          season: 'Meher (መኸር)',
          duration_minutes: 30,
          male_listeners: 0,
          female_listeners: 0,
          married_women_listeners: 0,
          youth_listeners: 0,
          investors_listeners: 0
        });
        setWoredas([]);
        setKebeles([]);
      }
    }
  }, [isModalOpen, editingProgram, form, zones]);

  const loadData = async () => {
    setIsFetching(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      message.success('Radio programs registry refreshed');
    } catch {
      message.error('Failed to refresh data');
    } finally {
      setIsFetching(false);
    }
  };

  // Direct In-Place Status Update without Opening the Form
  const handleQuickStatusChange = (recordId, newStatus) => {
    setPrograms((prev) =>
      prev.map((p) => (p.id === recordId ? { ...p, broadcast_status: newStatus } : p))
    );
    message.success(`Broadcast status updated to "${newStatus}"`);
  };

  // Filter pipeline
  const filteredPrograms = useMemo(() => {
    return programs.filter((p) => {
      const code = extractName(p.program_code).toLowerCase();
      const title = extractName(p.program_title).toLowerCase();
      const station = extractName(p.broadcasting_station).toLowerCase();
      const topic = extractName(p.broadcast_topic).toLowerCase();
      const kebele = extractName(p.kebele).toLowerCase();
      const woreda = extractName(p.woreda).toLowerCase();
      const zone = extractName(p.zone).toLowerCase();
      const q = searchTerm.toLowerCase();

      const matchesSearch =
        code.includes(q) || title.includes(q) || station.includes(q) || topic.includes(q) || kebele.includes(q) || woreda.includes(q) || zone.includes(q);
      const matchesStation = stationFilter ? p.broadcasting_station === stationFilter : true;
      const matchesFY = fiscalYearFilter ? p.fiscal_year === fiscalYearFilter : true;
      const matchesSeason = seasonFilter ? p.season === seasonFilter : true;
      const matchesTopic = topicFilter ? p.broadcast_topic === topicFilter : true;
      const matchesZone = zoneFilter ? zone === zoneFilter.toLowerCase() : true;

      return matchesSearch && matchesStation && matchesFY && matchesSeason && matchesTopic && matchesZone;
    });
  }, [programs, searchTerm, stationFilter, fiscalYearFilter, seasonFilter, topicFilter, zoneFilter]);

  // Statistics Calculation
  const stats = useMemo(() => {
    const totalPrograms = filteredPrograms.length;
    const maleListeners = filteredPrograms.reduce((acc, p) => acc + (Number(p.male_listeners) || 0), 0);
    const femaleListeners = filteredPrograms.reduce((acc, p) => acc + (Number(p.female_listeners) || 0), 0);
    const marriedWomen = filteredPrograms.reduce((acc, p) => acc + (Number(p.married_women_listeners) || 0), 0);
    const youth = filteredPrograms.reduce((acc, p) => acc + (Number(p.youth_listeners) || 0), 0);
    const investors = filteredPrograms.reduce((acc, p) => acc + (Number(p.investors_listeners) || 0), 0);

    const totalAudience = maleListeners + femaleListeners + marriedWomen + youth + investors;
    const totalWomenAudience = femaleListeners + marriedWomen;
    const womenRatio = totalAudience > 0 ? ((totalWomenAudience / totalAudience) * 100).toFixed(1) : 0;

    return {
      totalPrograms,
      totalAudience,
      maleListeners,
      femaleListeners,
      marriedWomen,
      totalWomenAudience,
      youth,
      investors,
      womenRatio
    };
  }, [filteredPrograms]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setStationFilter(null);
    setFiscalYearFilter(null);
    setSeasonFilter(null);
    setTopicFilter(null);
    setZoneFilter(null);
  };

  const handleOpenModal = (record = null) => {
    setEditingProgram(record);
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
        air_date: values.air_date ? values.air_date.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
        zone: selectedZone?.name || selectedZone?.zone_name || values.zone_id,
        woreda: selectedWoreda?.name || selectedWoreda?.woreda_name || values.woreda_id,
        kebele: selectedKebele?.name || selectedKebele?.kebele_name || values.kebele_id
      };

      if (editingProgram) {
        setPrograms((prev) =>
          prev.map((item) =>
            item.id === editingProgram.id ? { ...item, ...payload, broadcast_status: editingProgram.broadcast_status } : item
          )
        );
        message.success('Radio program updated successfully');
      } else {
        const newRecord = {
          ...payload,
          id: Date.now().toString(),
          program_code: values.program_code || `RAD-${Date.now().toString().slice(-4)}`,
          broadcast_status: 'Scheduled'
        };
        setPrograms((prev) => [newRecord, ...prev]);
        message.success('New radio broadcast scheduled successfully');
      }
      setIsModalOpen(false);
    } catch (error) {
      message.error(error?.response?.data?.message || error.message || 'Failed to save radio program');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    setPrograms((prev) => prev.filter((item) => item.id !== id));
    message.success('Radio program removed');
  };

  const exportToCSV = () => {
    if (!filteredPrograms.length) {
      message.warning('No radio program records available to export');
      return;
    }
    const headers = [
      'Program Code,Program Title,Broadcasting Station,Topic,Air Date,Duration (Min),FY,Season,Zone,Woreda,Kebele,Male Listeners (አባወራ),Female Listeners (እማወራ),Married Women (ባለትዳር),Youth (ወጣቶች),Investors (ባለሃብቶች),Total Listeners,Status'
    ];
    const rows = filteredPrograms.map((p) => {
      const total =
        (Number(p.male_listeners) || 0) +
        (Number(p.female_listeners) || 0) +
        (Number(p.married_women_listeners) || 0) +
        (Number(p.youth_listeners) || 0) +
        (Number(p.investors_listeners) || 0);

      return [
        `"${p.program_code || ''}"`,
        `"${p.program_title || ''}"`,
        `"${p.broadcasting_station || ''}"`,
        `"${p.broadcast_topic || ''}"`,
        `"${p.air_date || ''}"`,
        p.duration_minutes || 30,
        `"${p.fiscal_year || ''}"`,
        `"${p.season || ''}"`,
        `"${extractName(p.zone)}"`,
        `"${extractName(p.woreda)}"`,
        `"${extractName(p.kebele)}"`,
        p.male_listeners || 0,
        p.female_listeners || 0,
        p.married_women_listeners || 0,
        p.youth_listeners || 0,
        p.investors_listeners || 0,
        total,
        `"${p.broadcast_status || ''}"`
      ].join(',');
    });

    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Indicator_Agricultural_Radio_Programs_${Date.now()}.csv`;
    a.click();
    message.success('Report Form 2019 exported successfully');
  };

  const columns = [
    {
      title: 'Program Code & Title',
      key: 'program_info',
      width: 250,
      render: (_, r) => (
        <div>
          <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{r.program_title}</strong>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>
            Code: <span style={{ fontFamily: 'monospace' }}>{r.program_code}</span> | {r.duration_minutes} Mins
          </div>
        </div>
      )
    },
    {
      title: 'Broadcasting Station',
      dataIndex: 'broadcasting_station',
      key: 'broadcasting_station',
      width: 210,
      render: (station) => {
        let color = 'default';
        if (station?.includes('EBC')) color = 'purple';
        if (station?.includes('Regional')) color = 'geekblue';
        if (station?.includes('Community')) color = 'green';
        return <Tag color={color}>{station}</Tag>;
      }
    },
    {
      title: 'Broadcast Topic',
      dataIndex: 'broadcast_topic',
      key: 'broadcast_topic',
      width: 220,
      render: (topic) => <span style={{ fontWeight: 500, color: '#262626' }}>{topic}</span>
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
      title: 'Listeners Reached',
      key: 'listeners_breakdown',
      width: 230,
      render: (_, r) => {
        const total =
          (Number(r.male_listeners) || 0) +
          (Number(r.female_listeners) || 0) +
          (Number(r.married_women_listeners) || 0) +
          (Number(r.youth_listeners) || 0) +
          (Number(r.investors_listeners) || 0);

        return (
          <div style={{ fontSize: 11 }}>
            <div>
              Total: <strong style={{ color: '#1a5f2c' }}>{total.toLocaleString()} Listeners</strong>
            </div>
            <div style={{ color: '#8c8c8c' }}>
              <span>አባወራ: {r.male_listeners || 0}</span> | <span>እማወራ: {r.female_listeners || 0}</span> | <span>ባለትዳር: {r.married_women_listeners || 0}</span>
            </div>
          </div>
        );
      }
    },
    {
      title: 'Broadcast Status (In-Place Edit)',
      dataIndex: 'broadcast_status',
      key: 'broadcast_status',
      width: 180,
      render: (status, record) => (
        <Select
          value={status || 'Scheduled'}
          onChange={(newVal) => handleQuickStatusChange(record.id, newVal)}
          style={{ width: '100%' }}
          size="small"
        >
          <Option value="Scheduled">
            <Tag color="processing" icon={<ClockCircleOutlined />} style={{ margin: 0 }}>
              Scheduled
            </Tag>
          </Option>
          <Option value="Broadcasted">
            <Tag color="success" icon={<CheckCircleOutlined />} style={{ margin: 0 }}>
              Broadcasted
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
          <Tooltip title="View Program Dossier">
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: '#1890ff' }} />}
              onClick={() => {
                setSelectedProgram(record);
                setIsDossierOpen(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Edit Program">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: '#52c41a' }} />}
              onClick={() => handleOpenModal(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Record">
            <Popconfirm
              title="Delete radio program record?"
              description="Are you sure you want to remove this agricultural radio program?"
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
        <Breadcrumb.Item>Agricultural Radio Programs</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#1a5f2c', fontFamily: "'Times New Roman', Times, serif" }}>
            Agricultural Radio Programs (የግብርና የሬዲዮ ስርጭቶች ዝግጅትና ስርጭት)
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Mass media agricultural extension broadcasting across national, regional, and community radio syndication networks
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
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Total Listeners Reached</span>}
              value={stats.totalAudience}
              prefix={<CustomerServiceOutlined style={{ color: '#1a5f2c', marginRight: 8 }} />}
              valueStyle={{ color: '#1a5f2c', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Broadcast Programs: <strong style={{ color: '#262626' }}>{stats.totalPrograms} programs</strong>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #1890ff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Male Listeners (አባወራ)</span>}
              value={stats.maleListeners}
              prefix={<ManOutlined style={{ color: '#1890ff', marginRight: 8 }} />}
              valueStyle={{ color: '#1890ff', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Rural male household listeners
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #722ed1', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Women Listeners (እማወራ + ባለትዳር)</span>}
              value={stats.totalWomenAudience}
              prefix={<WomanOutlined style={{ color: '#722ed1', marginRight: 8 }} />}
              valueStyle={{ color: '#722ed1', fontWeight: 'bold', fontSize: 24 }}
            />
            <Progress percent={Number(stats.womenRatio)} size="small" strokeColor="#722ed1" />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8c8c8c', marginTop: 2 }}>
              <span>Share: <strong style={{ color: '#722ed1' }}>{stats.womenRatio}%</strong></span>
              <span>እማወራ: {stats.femaleListeners} | ባለትዳር: {stats.marriedWomen}</span>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #fa8c16', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Youth & Investors Reached</span>}
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

      {/* Filter & Action Toolbar */}
      <Card bordered={false} style={{ marginBottom: 16, borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }} bodyStyle={{ padding: '14px 16px' }}>
        <Row justify="space-between" align="middle" gutter={[12, 12]}>
          <Col xs={24} xxl={16} xl={15}>
            <Space wrap size={[10, 10]}>
              <Input
                placeholder="Search Title, Station, or Topic..."
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: 220 }}
                allowClear
              />

              <Select
                placeholder="Broadcasting Station"
                value={stationFilter}
                onChange={setStationFilter}
                style={{ width: 195 }}
                allowClear
              >
                {BROADCAST_STATIONS.map((bs) => (
                  <Option key={bs} value={bs}>{bs}</Option>
                ))}
              </Select>

              <Select
                placeholder="Broadcast Topic"
                value={topicFilter}
                onChange={setTopicFilter}
                style={{ width: 200 }}
                allowClear
              >
                {RADIO_TOPICS.map((rt) => (
                  <Option key={rt} value={rt}>{rt}</Option>
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
                {[...new Set(programs.map((p) => extractName(p.zone)))].map((z) => (
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
                disabled={!(searchTerm || stationFilter || fiscalYearFilter || seasonFilter || topicFilter || zoneFilter)}
              >
                Reset Filters
              </Button>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => handleOpenModal(null)}
                style={{ backgroundColor: '#1a5f2c', borderColor: '#1a5f2c', fontWeight: 600 }}
              >
                Schedule Radio Program
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Main Table */}
      <Table
        columns={columns}
        dataSource={filteredPrograms}
        rowKey="id"
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} radio programs`
        }}
        scroll={{ x: 1350 }}
        bordered
        size="middle"
      />

      {/* Registration / Edit Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CustomerServiceOutlined style={{ color: '#1a5f2c', fontSize: 20 }} />
            <span style={{ color: '#1a5f2c', fontWeight: 'bold', fontFamily: "'Times New Roman', Times, serif", fontSize: 17 }}>
              {editingProgram ? 'Edit Agricultural Radio Program' : 'Schedule Agricultural Radio Program (የሬዲዮ ስርጭት ምዝገባ)'}
            </span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText={editingProgram ? 'Update Program' : 'Save Broadcast Program'}
        okButtonProps={{ style: { backgroundColor: '#1a5f2c', borderColor: '#1a5f2c' }, loading: isSubmitting }}
        width={800}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Broadcasting Metadata & Station
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="program_code"
                label="Program Batch Code"
                rules={[{ required: true, message: 'Code required' }]}
              >
                <Input placeholder="e.g. RAD-2019-EG-08" />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item
                name="program_title"
                label="Radio Program Title / Episode"
                rules={[{ required: true, message: 'Title required' }]}
              >
                <Input placeholder="e.g. Meher Season Teff Row-Planting Campaign" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="broadcasting_station"
                label="Broadcasting Station Network"
                rules={[{ required: true, message: 'Select station' }]}
              >
                <Select>
                  {BROADCAST_STATIONS.map((bs) => (
                    <Option key={bs} value={bs}>{bs}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="broadcast_topic"
                label="Agricultural Broadcast Topic"
                rules={[{ required: true, message: 'Select topic' }]}
              >
                <Select>
                  {RADIO_TOPICS.map((rt) => (
                    <Option key={rt} value={rt}>{rt}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={10}>
              <Form.Item
                name="air_date"
                label="Air Date"
                rules={[{ required: true, message: 'Date required' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="duration_minutes"
                label="Duration (Minutes)"
                rules={[{ required: true }]}
              >
                <InputNumber min={5} max={180} style={{ width: '100%' }} />
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
            Estimated Listeners Reached by Cohort (አድማጭ አርሶ አደሮች በጾታ)
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="male_listeners"
                label="Male Listeners (አባወራ)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="female_listeners"
                label="Female Listeners (እማወራ)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="married_women_listeners"
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
                name="youth_listeners"
                label="Youth Listeners (ወጣቶች)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="investors_listeners"
                label="Commercial Investors (ባለሃብቶች)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="program_notes" label="Broadcast Notes, Script Summary & Listener Feedback">
                <TextArea rows={3} placeholder="Summarize audio content, expert guests, call-in inquiries..." />
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

      {/* Comprehensive Radio Program Dossier Modal */}
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
                <CustomerServiceOutlined />
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
                  {selectedProgram?.program_title}
                </span>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                  Code: <span style={{ fontFamily: 'monospace' }}>{selectedProgram?.program_code}</span> | Date:{' '}
                  {selectedProgram?.air_date}
                </div>
              </div>
            </div>
            <div>
              <Tag
                color={selectedProgram?.broadcast_status === 'Broadcasted' ? 'success' : 'processing'}
                icon={selectedProgram?.broadcast_status === 'Broadcasted' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                style={{ fontSize: 12, padding: '2px 10px', borderRadius: 12 }}
              >
                {selectedProgram?.broadcast_status || 'Scheduled'}
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
              handleOpenModal(selectedProgram);
            }}
          >
            Edit Program
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
        {selectedProgram && (
          <div style={{ paddingTop: 8 }}>
            {/* Top Metric Strip */}
            <Row gutter={12} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f6ffed', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Total Listeners</span>}
                    value={
                      (Number(selectedProgram.male_listeners) || 0) +
                      (Number(selectedProgram.female_listeners) || 0) +
                      (Number(selectedProgram.married_women_listeners) || 0) +
                      (Number(selectedProgram.youth_listeners) || 0) +
                      (Number(selectedProgram.investors_listeners) || 0)
                    }
                    suffix={<span style={{ fontSize: 12 }}>Listeners</span>}
                    valueStyle={{ fontSize: 15, fontWeight: 'bold', color: '#1a5f2c' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f0f5ff', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Duration</span>}
                    value={selectedProgram.duration_minutes || 30}
                    suffix="Mins"
                    valueStyle={{ fontSize: 15, fontWeight: 'bold', color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f9f0ff', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Women Listeners Share</span>}
                    value={
                      (Number(selectedProgram.male_listeners) || 0) +
                      (Number(selectedProgram.female_listeners) || 0) +
                      (Number(selectedProgram.married_women_listeners) || 0) +
                      (Number(selectedProgram.youth_listeners) || 0) +
                      (Number(selectedProgram.investors_listeners) || 0) > 0
                        ? (
                            (((Number(selectedProgram.female_listeners) || 0) +
                              (Number(selectedProgram.married_women_listeners) || 0)) /
                              ((Number(selectedProgram.male_listeners) || 0) +
                                (Number(selectedProgram.female_listeners) || 0) +
                                (Number(selectedProgram.married_women_listeners) || 0) +
                                (Number(selectedProgram.youth_listeners) || 0) +
                                (Number(selectedProgram.investors_listeners) || 0))) *
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
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Air Date</span>}
                    value={selectedProgram.air_date}
                    valueStyle={{ fontSize: 14, fontWeight: 'bold', color: '#fa8c16' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* TABPANES */}
            <Tabs defaultActiveKey="1" type="card">
              {/* TAB 1: Listener Demographics */}
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
                  <Descriptions.Item label="Broadcast Topic" span={2}>
                    <strong style={{ color: '#1a5f2c' }}>{selectedProgram.broadcast_topic}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Broadcasting Station">
                    <Tag color="purple">{selectedProgram.broadcasting_station}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Air Duration">
                    {selectedProgram.duration_minutes || 30} Minutes
                  </Descriptions.Item>
                </Descriptions>

                <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: 16, background: '#fafafa' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1a5f2c', textTransform: 'uppercase', marginBottom: 12 }}>
                    Listener Disaggregation (አድማጭ አርሶ አደሮች በጾታና በዕድሜ)
                  </div>
                  <Row gutter={[16, 16]}>
                    <Col span={8}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <ManOutlined style={{ color: '#1890ff', marginRight: 4 }} />
                          Male Household Heads (አባወራ)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#1890ff', marginTop: 2 }}>
                          {Number(selectedProgram.male_listeners || 0).toLocaleString()}
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
                          {Number(selectedProgram.female_listeners || 0).toLocaleString()}
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
                          {Number(selectedProgram.married_women_listeners || 0).toLocaleString()}
                        </div>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <RiseOutlined style={{ color: '#fa8c16', marginRight: 4 }} />
                          Youth Listeners (ወጣቶች)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#fa8c16', marginTop: 2 }}>
                          {Number(selectedProgram.youth_listeners || 0).toLocaleString()}
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
                          {Number(selectedProgram.investors_listeners || 0).toLocaleString()}
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
              </TabPane>

              {/* TAB 2: Program Notes & Script Summary */}
              <TabPane
                tab={
                  <span>
                    <SoundOutlined />
                    Program Notes & Script Summary
                  </span>
                }
                key="2"
              >
                <Card size="small" bordered={false} style={{ background: '#fcfdfd', border: '1px solid #e6f7ed', borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <CheckCircleOutlined style={{ color: '#1a5f2c', fontSize: 16 }} />
                    <strong style={{ color: '#1a5f2c', fontSize: 13, textTransform: 'uppercase' }}>
                      Broadcast Summary & Listener Feedback (የስርጭቱ ይዘትና ግብረ-መልስ)
                    </strong>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: '#262626', lineHeight: '1.6' }}>
                    {selectedProgram.program_notes || 'Informational broadcast successfully delivered across targeted listening groups.'}
                  </p>
                </Card>
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
                    <strong>{extractName(selectedProgram.zone)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Woreda">
                    <strong>{extractName(selectedProgram.woreda)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Kebele Operational Base">
                    <span style={{ color: '#1a5f2c', fontWeight: 'bold' }}>
                      {extractName(selectedProgram.kebele)}
                    </span>
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
                  <Descriptions.Item label="Fiscal Year (በጀት ዓመት)">
                    <Tag color="blue" icon={<CalendarOutlined />}>
                      {selectedProgram.fiscal_year || '2019 E.C.'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Production Campaign Season">
                    <strong>{selectedProgram.season || 'Meher (መኸር)'}</strong>
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

export default function RadioPrograms() {
  return (
    <App>
      <RadioProgramsContent />
    </App>
  );
}