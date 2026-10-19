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
  RetweetOutlined,
  IdcardOutlined,
  PhoneOutlined,
  ManOutlined,
  WomanOutlined,
  RiseOutlined,
  ShopOutlined,
  CheckSquareOutlined,
  SafetyCertificateOutlined,
  SwapOutlined
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

const EXCHANGE_CATEGORIES = [
  'Inter-Woreda Farmer Field Day (የወረዳዎች መካከል አርሶ አደሮች የሜዳ ቀን)',
  'Cross-Learning Exchange Visit (የልምድ ልውውጥ ጉብኝት)',
  'Model FTC Benchmarking Tour (የምርጥ ማዕከላት የቤንችማርኪንግ ጉዞ)',
  'Regional Innovation Exposition (የክልላዊ ፈጠራ ማስተዋወቂያ መድረክ)',
  'Agricultural Cooperative Joint Review (የህብረት ስራ ማህበራት የጋራ ግምገማ)'
];

const EXCHANGE_ACTIVITIES = [
  'Contiguous Cluster Farm Inspection Tour',
  'Technology Adoption Success Story Briefing',
  'Farmer-to-Farmer Dialogue & Q&A Session',
  'Mechanization & Irrigation Site Demonstration',
  'Joint Action Plan & Scaling Commitment Signing'
];

const INITIAL_EXCHANGES = [
  {
    id: '1',
    exchange_code: 'EXC-2019-EG-01',
    exchange_title: 'Dejen & Bure Inter-Woreda Wheat Cluster Field Day',
    exchange_category: 'Inter-Woreda Farmer Field Day (የወረዳዎች መካከል አርሶ አደሮች የሜዳ ቀን)',
    core_activity: 'Contiguous Cluster Farm Inspection Tour',
    exchange_leader: 'Ato Mulugeta Fentaw (Exchange Coordinator)',
    leader_phone: '+251 918 445 566',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    duration_days: 2,
    male_participants: 85,
    female_participants: 45,
    married_women_participants: 38,
    youth_participants: 25,
    investors_participants: 6,
    exchange_status: 'Successfully Conducted',
    exchange_notes: 'Facilitated cross-learning visit for 130 model farmers and DA leaders across Dejen and Bure wheat corridors.',
    zone: 'East Gojjam',
    woreda: 'Dejen',
    kebele: 'Kurar'
  },
  {
    id: '2',
    exchange_code: 'EXC-2019-SG-04',
    exchange_title: 'Fogera & South Gondar Model FTC Benchmarking Tour',
    exchange_category: 'Model FTC Benchmarking Tour (የምርጥ ማዕከላት የቤንችማርኪንግ ጉዞ)',
    core_activity: 'Technology Adoption Success Story Briefing',
    exchange_leader: 'Woizero Aster Melesse',
    leader_phone: '+251 922 112 334',
    fiscal_year: '2019 E.C.',
    season: 'Bega / Irrigation (መስኖ/በጋ)',
    duration_days: 1,
    male_participants: 60,
    female_participants: 40,
    married_women_participants: 34,
    youth_participants: 20,
    investors_participants: 4,
    exchange_status: 'Successfully Conducted',
    exchange_notes: 'Exchanged best practices on solar-powered irrigation and cooperative vegetable marketing.',
    zone: 'South Gondar',
    woreda: 'Fogera',
    kebele: 'Woreta Zuria'
  },
  {
    id: '3',
    exchange_code: 'EXC-2019-WG-09',
    exchange_title: 'Alefa & West Gojjam Regional Innovation Exchange',
    exchange_category: 'Regional Innovation Exposition (የክልላዊ ፈጠራ ማስተዋወቂያ መድረክ)',
    core_activity: 'Mechanized & Irrigation Site Demonstration',
    exchange_leader: 'Ato Tadesse Worku',
    leader_phone: '+251 911 889 001',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    duration_days: 3,
    male_participants: 50,
    female_participants: 30,
    married_women_participants: 25,
    youth_participants: 18,
    investors_participants: 5,
    exchange_status: 'Scheduled',
    exchange_notes: 'Upcoming inter-woreda exposition focusing on mechanized combine harvesting and post-harvest storage.',
    zone: 'West Gojjam',
    woreda: 'Bure',
    kebele: 'Alefa'
  }
];

function ExperienceSharingContent() {
  const { message } = App.useApp();

  const [exchanges, setExchanges] = useState(INITIAL_EXCHANGES);
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
  const [editingExc, setEditingExc] = useState(null);
  const [selectedExc, setSelectedExc] = useState(null);
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
      if (editingExc) {
        const initForm = async () => {
          const zoneMatch = zones.find(
            (z) => z.name === editingExc.zone || z.id === editingExc.zone_id
          );
          if (zoneMatch) {
            try {
              const wRes = locationApi?.getWoredas ? await locationApi.getWoredas(zoneMatch.id) : null;
              const wList = wRes?.data?.data?.data || wRes?.data?.data || [];
              setWoredas(wList);

              const woredaMatch = wList.find(
                (w) => w.name === editingExc.woreda || w.id === editingExc.woreda_id
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
            exchange_code: editingExc.exchange_code,
            exchange_title: editingExc.exchange_title,
            exchange_category: editingExc.exchange_category,
            core_activity: editingExc.core_activity,
            exchange_leader: editingExc.exchange_leader,
            leader_phone: editingExc.leader_phone,
            fiscal_year: editingExc.fiscal_year || '2019 E.C.',
            season: editingExc.season || 'Meher (መኸር)',
            duration_days: Number(editingExc.duration_days) || 1,
            male_participants: Number(editingExc.male_participants) || 0,
            female_participants: Number(editingExc.female_participants) || 0,
            married_women_participants: Number(editingExc.married_women_participants) || 0,
            youth_participants: Number(editingExc.youth_participants) || 0,
            investors_participants: Number(editingExc.investors_participants) || 0,
            exchange_notes: editingExc.exchange_notes,
            zone_id: editingExc.zone_id || zoneMatch?.id || editingExc.zone,
            woreda_id: editingExc.woreda_id || editingExc.woreda,
            kebele_id: editingExc.kebele_id || editingExc.kebele
          });
        };
        initForm();
      } else {
        form.resetFields();
        form.setFieldsValue({
          exchange_category: 'Inter-Woreda Farmer Field Day (የወረዳዎች መካከል አርሶ አደሮች የሜዳ ቀን)',
          core_activity: 'Contiguous Cluster Farm Inspection Tour',
          fiscal_year: '2019 E.C.',
          season: 'Meher (መኸር)',
          duration_days: 2,
          male_participants: 40,
          female_participants: 25,
          married_women_participants: 20,
          youth_participants: 15,
          investors_participants: 2
        });
        setWoredas([]);
        setKebeles([]);
      }
    }
  }, [isModalOpen, editingExc, form, zones]);

  const loadData = async () => {
    setIsFetching(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      message.success('Inter-woreda experience sharing registry refreshed');
    } catch {
      message.error('Failed to refresh data');
    } finally {
      setIsFetching(false);
    }
  };

  // Direct In-Place Status Update without Opening the Form
  const handleQuickStatusChange = (recordId, newStatus) => {
    setExchanges((prev) =>
      prev.map((e) => (e.id === recordId ? { ...e, exchange_status: newStatus } : e))
    );
    message.success(`Exchange status updated to "${newStatus}"`);
  };

  // Filter pipeline
  const filteredExchanges = useMemo(() => {
    return exchanges.filter((e) => {
      const code = extractName(e.exchange_code).toLowerCase();
      const title = extractName(e.exchange_title).toLowerCase();
      const leader = extractName(e.exchange_leader).toLowerCase();
      const kebele = extractName(e.kebele).toLowerCase();
      const woreda = extractName(e.woreda).toLowerCase();
      const zone = extractName(e.zone).toLowerCase();
      const q = searchTerm.toLowerCase();

      const matchesSearch =
        code.includes(q) || title.includes(q) || leader.includes(q) || kebele.includes(q) || woreda.includes(q) || zone.includes(q);
      const matchesCategory = categoryFilter ? e.exchange_category === categoryFilter : true;
      const matchesActivity = activityFilter ? e.core_activity === activityFilter : true;
      const matchesFY = fiscalYearFilter ? e.fiscal_year === fiscalYearFilter : true;
      const matchesSeason = seasonFilter ? e.season === seasonFilter : true;
      const matchesStatus = statusFilter ? e.exchange_status === statusFilter : true;
      const matchesZone = zoneFilter ? zone === zoneFilter.toLowerCase() : true;

      return matchesSearch && matchesCategory && matchesActivity && matchesFY && matchesSeason && matchesStatus && matchesZone;
    });
  }, [exchanges, searchTerm, categoryFilter, activityFilter, fiscalYearFilter, seasonFilter, statusFilter, zoneFilter]);

  // Statistics Calculation
  const stats = useMemo(() => {
    const totalExchanges = filteredExchanges.length;
    const maleParticipants = filteredExchanges.reduce((acc, e) => acc + (Number(e.male_participants) || 0), 0);
    const femaleParticipants = filteredExchanges.reduce((acc, e) => acc + (Number(e.female_participants) || 0), 0);
    const marriedWomen = filteredExchanges.reduce((acc, e) => acc + (Number(e.married_women_participants) || 0), 0);
    const youth = filteredExchanges.reduce((acc, e) => acc + (Number(e.youth_participants) || 0), 0);
    const investors = filteredExchanges.reduce((acc, e) => acc + (Number(e.investors_participants) || 0), 0);

    const totalParticipants = maleParticipants + femaleParticipants + marriedWomen + youth + investors;
    const totalWomenParticipants = femaleParticipants + marriedWomen;
    const womenRatio = totalParticipants > 0 ? ((totalWomenParticipants / totalParticipants) * 100).toFixed(1) : 0;
    const conductedCount = filteredExchanges.filter((e) => e.exchange_status === 'Successfully Conducted').length;

    return {
      totalExchanges,
      totalParticipants,
      maleParticipants,
      femaleParticipants,
      marriedWomen,
      totalWomenParticipants,
      youth,
      investors,
      womenRatio,
      conductedCount
    };
  }, [filteredExchanges]);

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
    setEditingExc(record);
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

      if (editingExc) {
        setExchanges((prev) =>
          prev.map((item) =>
            item.id === editingExc.id ? { ...item, ...payload, exchange_status: editingExc.exchange_status } : item
          )
        );
        message.success('Experience sharing record updated successfully');
      } else {
        const newRecord = {
          ...payload,
          id: Date.now().toString(),
          exchange_code: values.exchange_code || `EXC-${Date.now().toString().slice(-4)}`,
          exchange_status: 'Successfully Conducted'
        };
        setExchanges((prev) => [newRecord, ...prev]);
        message.success('New experience sharing tour registered successfully');
      }
      setIsModalOpen(false);
    } catch (error) {
      message.error(error?.response?.data?.message || error.message || 'Failed to save experience sharing record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    setExchanges((prev) => prev.filter((item) => item.id !== id));
    message.success('Experience sharing record removed');
  };

  const exportToCSV = () => {
    if (!filteredExchanges.length) {
      message.warning('No experience sharing records available to export');
      return;
    }
    const headers = [
      'Exchange Code,Title,Category,Core Activity,Duration (Days),Leader,Phone,FY,Season,Zone,Woreda,Kebele,Male (ወንድ),Female (ሴት),Married Women (ባለትዳር),Youth (ወጣቶች),Investors (ባለሃብቶች),Total Participants,Status'
    ];
    const rows = filteredExchanges.map((e) => {
      const total =
        (Number(e.male_participants) || 0) +
        (Number(e.female_participants) || 0) +
        (Number(e.married_women_participants) || 0) +
        (Number(e.youth_participants) || 0) +
        (Number(e.investors_participants) || 0);

      return [
        `"${e.exchange_code || ''}"`,
        `"${e.exchange_title || ''}"`,
        `"${e.exchange_category || ''}"`,
        `"${e.core_activity || ''}"`,
        e.duration_days || 1,
        `"${e.exchange_leader || ''}"`,
        `"${e.leader_phone || ''}"`,
        `"${e.fiscal_year || ''}"`,
        `"${e.season || ''}"`,
        `"${extractName(e.zone)}"`,
        `"${extractName(e.woreda)}"`,
        `"${extractName(e.kebele)}"`,
        e.male_participants || 0,
        e.female_participants || 0,
        e.married_women_participants || 0,
        e.youth_participants || 0,
        e.investors_participants || 0,
        total,
        `"${e.exchange_status || ''}"`
      ].join(',');
    });

    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Inter_Woreda_Experience_Sharing_${Date.now()}.csv`;
    a.click();
    message.success('Experience sharing report exported successfully');
  };

  const columns = [
    {
      title: 'Exchange Code & Title',
      key: 'exchange_info',
      width: 250,
      render: (_, r) => (
        <div>
          <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{r.exchange_title}</strong>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>
            Code: <span style={{ fontFamily: 'monospace' }}>{r.exchange_code}</span> | Leader: {r.exchange_leader}
          </div>
        </div>
      )
    },
    {
      title: 'Exchange Category',
      dataIndex: 'exchange_category',
      key: 'exchange_category',
      width: 210,
      render: (cat) => {
        let color = 'default';
        if (cat?.includes('Inter-Woreda')) color = 'green';
        if (cat?.includes('Cross-Learning')) color = 'blue';
        if (cat?.includes('Benchmarking')) color = 'gold';
        if (cat?.includes('Innovation')) color = 'purple';
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
      title: 'Exchange Status (In-Place Edit)',
      dataIndex: 'exchange_status',
      key: 'exchange_status',
      width: 190,
      render: (status, record) => (
        <Select
          value={status || 'Successfully Conducted'}
          onChange={(newVal) => handleQuickStatusChange(record.id, newVal)}
          style={{ width: '100%' }}
          size="small"
        >
          <Option value="Successfully Conducted">
            <Tag color="success" icon={<CheckCircleOutlined />} style={{ margin: 0 }}>
              Conducted
            </Tag>
          </Option>
          <Option value="Scheduled">
            <Tag color="processing" icon={<ClockCircleOutlined />} style={{ margin: 0 }}>
              Scheduled
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
          <Tooltip title="View Exchange Dossier">
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: '#1890ff' }} />}
              onClick={() => {
                setSelectedExc(record);
                setIsDossierOpen(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Edit Exchange">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: '#52c41a' }} />}
              onClick={() => handleOpenModal(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Record">
            <Popconfirm
              title="Delete experience sharing record?"
              description="Are you sure you want to remove this inter-woreda exchange?"
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
        <Breadcrumb.Item>Field Days & Inter-Woreda Experience Sharing</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#1a5f2c', fontFamily: "'Times New Roman', Times, serif" }}>
            Field Days & Inter-Woreda Experience Sharing (የሜዳ ቀናትና የወረዳዎች መካከል ልምድ ልውውጥ)
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Coordinating inter-woreda agricultural tours, cross-learning exchange visits, model FTC benchmarking, and farmer dialogue sessions
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
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Total Tour Participants</span>}
              value={stats.totalParticipants}
              prefix={<SwapOutlined style={{ color: '#1a5f2c', marginRight: 8 }} />}
              valueStyle={{ color: '#1a5f2c', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Total Exchanges: <strong style={{ color: '#262626' }}>{stats.totalExchanges} tours</strong>
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
              Male participants in exchange tours
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
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Successfully Conducted</span>}
              value={stats.conductedCount}
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
                placeholder="Search Title, Code, or Leader..."
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: 220 }}
                allowClear
              />

              <Select
                placeholder="Exchange Category"
                value={categoryFilter}
                onChange={setCategoryFilter}
                style={{ width: 195 }}
                allowClear
              >
                {EXCHANGE_CATEGORIES.map((ec) => (
                  <Option key={ec} value={ec}>{ec}</Option>
                ))}
              </Select>

              <Select
                placeholder="Core Activity"
                value={activityFilter}
                onChange={setActivityFilter}
                style={{ width: 200 }}
                allowClear
              >
                {EXCHANGE_ACTIVITIES.map((ea) => (
                  <Option key={ea} value={ea}>{ea}</Option>
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
                {[...new Set(exchanges.map((e) => extractName(e.zone)))].map((z) => (
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
                Export Exchange CSV
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
                Organize Exchange
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Main Table */}
      <Table
        columns={columns}
        dataSource={filteredExchanges}
        rowKey="id"
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} inter-woreda exchanges`
        }}
        scroll={{ x: 1350 }}
        bordered
        size="middle"
      />

      {/* Registration / Edit Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SwapOutlined style={{ color: '#1a5f2c', fontSize: 20 }} />
            <span style={{ color: '#1a5f2c', fontWeight: 'bold', fontFamily: "'Times New Roman', Times, serif", fontSize: 17 }}>
              {editingExc ? 'Edit Experience Sharing Record' : 'Organize Inter-Woreda Exchange (የወረዳዎች ልምድ ልውውጥ ምዝገባ)'}
            </span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText={editingExc ? 'Update Exchange' : 'Save Exchange Record'}
        okButtonProps={{ style: { backgroundColor: '#1a5f2c', borderColor: '#1a5f2c' }, loading: isSubmitting }}
        width={800}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Exchange Identification & Category
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="exchange_code"
                label="Exchange Code"
                rules={[{ required: true, message: 'Code required' }]}
              >
                <Input placeholder="e.g. EXC-2019-EG-08" />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item
                name="exchange_title"
                label="Exchange Tour Title / Description"
                rules={[{ required: true, message: 'Title required' }]}
              >
                <Input placeholder="e.g. Dejen & Bure Inter-Woreda Wheat Cluster Field Day" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="exchange_category"
                label="Exchange Category"
                rules={[{ required: true, message: 'Select category' }]}
              >
                <Select>
                  {EXCHANGE_CATEGORIES.map((ec) => (
                    <Option key={ec} value={ec}>{ec}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="core_activity"
                label="Core Exchange Activity"
                rules={[{ required: true, message: 'Select activity' }]}
              >
                <Select>
                  {EXCHANGE_ACTIVITIES.map((ea) => (
                    <Option key={ea} value={ea}>{ea}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={14}>
              <Form.Item
                name="exchange_leader"
                label="Exchange Leader / Coordinator"
                rules={[{ required: true, message: 'Leader required' }]}
              >
                <Input placeholder="e.g. Ato Mulugeta Fentaw" />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item
                name="leader_phone"
                label="Leader Phone Number"
                rules={[{ required: true, message: 'Phone required' }]}
              >
                <Input placeholder="+251 9..." />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Timeline & Tour Duration (Days)
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
                name="duration_days"
                label="Tour Duration (Days)"
                rules={[{ required: true }]}
              >
                <InputNumber min={1} max={14} style={{ width: '100%' }} />
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
              <Form.Item name="exchange_notes" label="Exchange Notes & Lessons Learned">
                <TextArea rows={3} placeholder="Summarize cross-learning outcomes, cluster inspection findings, or scaling commitments..." />
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

      {/* Comprehensive Exchange Dossier Modal */}
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
                <SwapOutlined />
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
                  {selectedExc?.exchange_title}
                </span>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                  Code: <span style={{ fontFamily: 'monospace' }}>{selectedExc?.exchange_code}</span> | Leader:{' '}
                  {selectedExc?.exchange_leader}
                </div>
              </div>
            </div>
            <div>
              <Tag
                color={selectedExc?.exchange_status === 'Successfully Conducted' ? 'success' : 'processing'}
                icon={selectedExc?.exchange_status === 'Successfully Conducted' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                style={{ fontSize: 12, padding: '2px 10px', borderRadius: 12 }}
              >
                {selectedExc?.exchange_status || 'Conducted'}
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
              handleOpenModal(selectedExc);
            }}
          >
            Edit Exchange
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
        {selectedExc && (
          <div style={{ paddingTop: 8 }}>
            {/* Top Metric Strip */}
            <Row gutter={12} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f6ffed', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Total Participants</span>}
                    value={
                      (Number(selectedExc.male_participants) || 0) +
                      (Number(selectedExc.female_participants) || 0) +
                      (Number(selectedExc.married_women_participants) || 0) +
                      (Number(selectedExc.youth_participants) || 0) +
                      (Number(selectedExc.investors_participants) || 0)
                    }
                    suffix={<span style={{ fontSize: 12 }}>People</span>}
                    valueStyle={{ fontSize: 15, fontWeight: 'bold', color: '#1a5f2c' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f0f5ff', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Exchange Category</span>}
                    value={selectedExc.exchange_category?.split(' ')[0] || 'Category'}
                    valueStyle={{ fontSize: 15, fontWeight: 'bold', color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f9f0ff', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Women Share</span>}
                    value={
                      (Number(selectedExc.male_participants) || 0) +
                      (Number(selectedExc.female_participants) || 0) +
                      (Number(selectedExc.married_women_participants) || 0) +
                      (Number(selectedExc.youth_participants) || 0) +
                      (Number(selectedExc.investors_participants) || 0) > 0
                        ? (
                            (((Number(selectedExc.female_participants) || 0) +
                              (Number(selectedExc.married_women_participants) || 0)) /
                              ((Number(selectedExc.male_participants) || 0) +
                                (Number(selectedExc.female_participants) || 0) +
                                (Number(selectedExc.married_women_participants) || 0) +
                                (Number(selectedExc.youth_participants) || 0) +
                                (Number(selectedExc.investors_participants) || 0))) *
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
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Tour Duration</span>}
                    value={selectedExc.duration_days || 1}
                    suffix="Days"
                    valueStyle={{ fontSize: 14, fontWeight: 'bold', color: '#fa8c16' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* TABPANES */}
            <Tabs defaultActiveKey="1" type="card">
              {/* TAB 1: Exchange Profile */}
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
                  <Descriptions.Item label="Exchange Title" span={2}>
                    <strong style={{ color: '#1a5f2c' }}>{selectedExc.exchange_title}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Exchange Category">
                    <Tag color="purple">{selectedExc.exchange_category}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Core Activity">
                    <Tag color="green">{selectedExc.core_activity}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Exchange Leader">
                    {selectedExc.exchange_leader} ({selectedExc.leader_phone})
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
                          {Number(selectedExc.male_participants || 0).toLocaleString()}
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
                          {Number(selectedExc.female_participants || 0).toLocaleString()}
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
                          {Number(selectedExc.married_women_participants || 0).toLocaleString()}
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
                          {Number(selectedExc.youth_participants || 0).toLocaleString()}
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
                          {Number(selectedExc.investors_participants || 0).toLocaleString()}
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
                    Exchange Notes & Outcomes
                  </span>
                }
                key="2"
              >
                <Card size="small" bordered={false} style={{ background: '#fcfdfd', border: '1px solid #e6f7ed', borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <CheckCircleOutlined style={{ color: '#1a5f2c', fontSize: 16 }} />
                    <strong style={{ color: '#1a5f2c', fontSize: 13, textTransform: 'uppercase' }}>
                      Exchange Tour Summary & Lessons (የልምድ ልውውጥ ጉዞ ማስታወሻ)
                    </strong>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: '#262626', lineHeight: '1.6' }}>
                    {selectedExc.exchange_notes || 'Active inter-woreda agricultural exchange tour and cross-learning session.'}
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
                    <strong>{extractName(selectedExc.zone)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Woreda">
                    <strong>{extractName(selectedExc.woreda)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Kebele Operational Base">
                    <span style={{ color: '#1a5f2c', fontWeight: 'bold' }}>
                      {extractName(selectedExc.kebele)}
                    </span>
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
                  <Descriptions.Item label="Fiscal Year (በጀት ዓመት)">
                    <Tag color="blue" icon={<CalendarOutlined />}>
                      {selectedExc.fiscal_year || '2019 E.C.'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Production Campaign Season">
                    <strong>{selectedExc.season || 'Meher (መኸር)'}</strong>
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

export default function ExperienceSharing() {
  return (
    <App>
      <ExperienceSharingContent />
    </App>
  );
}