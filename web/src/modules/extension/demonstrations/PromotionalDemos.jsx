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
  SoundOutlined,
  IdcardOutlined,
  PhoneOutlined,
  ManOutlined,
  WomanOutlined,
  RiseOutlined,
  ShopOutlined,
  CheckSquareOutlined,
  SafetyCertificateOutlined,
  SolutionOutlined,
  NotificationOutlined
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

const PROMO_SECTORS = [
  'Cereal & Seed Productivity Promotion (የሰብልና ምርጥ ዘር ማስተዋወቂያ)',
  'Natural Resources & Watershed Management (የተፈጥሮ ሀብትና ተፋሰስ ልማት)',
  'Small-Scale Irrigation & Water Technology (አነስተኛ መስኖና ውሃ ቴክኖሎጂ)',
  'Home Gardens & Nutrition Security (የጓሮ አትክልትና ስነ-ምግብ ዋስትና)'
];

const PROMO_ACTIVITIES = [
  'National / Regional Farmers Field Day (የአርሶ አደሮች የሜዳ ቀን)',
  'FTC Open House & Technology Exhibition (የኤክስቴንሽን ማዕከል ክፍት የቤቶች ቀን)',
  'High-Level Dignitary & Investor Visit (የከፍተኛ የስራ ሃብቶችና ባለሃብቶች ጎብኝዎች)',
  'Farmer-to-Farmer Cross-Visit & Exchange (ከአርሶ አደር ወደ አርሶ አደር የልምድ ጉዞ)',
  'Mass Media Documentation Tour (የሚዲያ ሽፋንና ዶክመንቴሽን ጉዞ)'
];

const INITIAL_PROMOS = [
  {
    id: '1',
    promo_code: 'PRM-2019-EG-01',
    promo_title: 'Kurar National Teff Field Day & Mechanization Expo',
    promo_sector: 'Cereal & Seed Productivity Promotion (የሰብልና ምርጥ ዘር ማስተዋወቂያ)',
    core_activity: 'National / Regional Farmers Field Day (የአርሶ አደሮች የሜዳ ቀን)',
    organizer_name: 'Ato Mulugeta Fentaw (Woreda Coordinator)',
    organizer_phone: '+251 918 445 566',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    attendance_days: 2,
    male_attendees: 320,
    female_attendees: 180,
    married_women_attendees: 140,
    youth_attendees: 95,
    investors_attendees: 25,
    promo_status: 'Successfully Conducted',
    promo_notes: 'Showcased Quncho Teff row-planting productivity gains to over 600 visitors including regional officials.',
    zone: 'East Gojjam',
    woreda: 'Dejen',
    kebele: 'Kurar'
  },
  {
    id: '2',
    promo_code: 'PRM-2019-SG-04',
    promo_title: 'Fogera Solar Irrigation & Vegetable Promotion Open House',
    promo_sector: 'Small-Scale Irrigation & Water Technology (አነስተኛ መስኖና ውሃ ቴክኖሎጂ)',
    core_activity: 'FTC Open House & Technology Exhibition (የኤክስቴንሽን ማዕከል ክፍት የቤቶች ቀን)',
    organizer_name: 'Woizero Aster Melesse',
    organizer_phone: '+251 922 112 334',
    fiscal_year: '2019 E.C.',
    season: 'Bega / Irrigation (መስኖ/በጋ)',
    attendance_days: 1,
    male_attendees: 210,
    female_attendees: 140,
    married_women_attendees: 115,
    youth_attendees: 70,
    investors_attendees: 18,
    promo_status: 'Successfully Conducted',
    promo_notes: 'Demonstrated solar water pumps and drip irrigation kits to neighboring pastoralist and farming groups.',
    zone: 'South Gondar',
    woreda: 'Fogera',
    kebele: 'Woreta Zuria'
  },
  {
    id: '3',
    promo_code: 'PRM-2019-WG-09',
    promo_title: 'Alefa Nutrition Garden & Family Poultry Promotion Day',
    promo_sector: 'Home Gardens & Nutrition Security (የጓሮ አትክልትና ስነ-ምግብ ዋስትና)',
    core_activity: 'Farmer-to-Farmer Cross-Visit & Exchange (ከአርሶ አደር ወደ አርሶ አደር የልምድ ጉዞ)',
    organizer_name: 'Ato Tadesse Worku',
    organizer_phone: '+251 911 889 001',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    attendance_days: 1,
    male_attendees: 150,
    female_attendees: 190,
    married_women_attendees: 160,
    youth_attendees: 60,
    investors_attendees: 10,
    promo_status: 'Scheduled',
    promo_notes: 'Cross-visit focusing on micro-gardening, bio-fortified crops, and poultry integration for maternal nutrition.',
    zone: 'West Gojjam',
    woreda: 'Bure',
    kebele: 'Alefa'
  }
];

function PromotionalDemosContent() {
  const { message } = App.useApp();

  const [promos, setPromos] = useState(INITIAL_PROMOS);
  const [isFetching, setIsFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState(null);
  const [activityFilter, setActivityFilter] = useState(null);
  const [fiscalYearFilter, setFiscalYearFilter] = useState(null);
  const [seasonFilter, setSeasonFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [zoneFilter, setZoneFilter] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [selectedPromo, setSelectedPromo] = useState(null);
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
      if (editingPromo) {
        const initForm = async () => {
          const zoneMatch = zones.find(
            (z) => z.name === editingPromo.zone || z.id === editingPromo.zone_id
          );
          if (zoneMatch) {
            try {
              const wRes = locationApi?.getWoredas ? await locationApi.getWoredas(zoneMatch.id) : null;
              const wList = wRes?.data?.data?.data || wRes?.data?.data || [];
              setWoredas(wList);

              const woredaMatch = wList.find(
                (w) => w.name === editingPromo.woreda || w.id === editingPromo.woreda_id
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
            promo_code: editingPromo.promo_code,
            promo_title: editingPromo.promo_title,
            promo_sector: editingPromo.promo_sector,
            core_activity: editingPromo.core_activity,
            organizer_name: editingPromo.organizer_name,
            organizer_phone: editingPromo.organizer_phone,
            fiscal_year: editingPromo.fiscal_year || '2019 E.C.',
            season: editingPromo.season || 'Meher (መኸር)',
            attendance_days: Number(editingPromo.attendance_days) || 1,
            male_attendees: Number(editingPromo.male_attendees) || 0,
            female_attendees: Number(editingPromo.female_attendees) || 0,
            married_women_attendees: Number(editingPromo.married_women_attendees) || 0,
            youth_attendees: Number(editingPromo.youth_attendees) || 0,
            investors_attendees: Number(editingPromo.investors_attendees) || 0,
            promo_notes: editingPromo.promo_notes,
            zone_id: editingPromo.zone_id || zoneMatch?.id || editingPromo.zone,
            woreda_id: editingPromo.woreda_id || editingPromo.woreda,
            kebele_id: editingPromo.kebele_id || editingPromo.kebele
          });
        };
        initForm();
      } else {
        form.resetFields();
        form.setFieldsValue({
          promo_sector: 'Cereal & Seed Productivity Promotion (የሰብልና ምርጥ ዘር ማስተዋወቂያ)',
          core_activity: 'National / Regional Farmers Field Day (የአርሶ አደሮች የሜዳ ቀን)',
          fiscal_year: '2019 E.C.',
          season: 'Meher (መኸር)',
          attendance_days: 1,
          male_attendees: 100,
          female_attendees: 80,
          married_women_attendees: 60,
          youth_visitors: 30,
          investors_attendees: 5
        });
        setWoredas([]);
        setKebeles([]);
      }
    }
  }, [isModalOpen, editingPromo, form, zones]);

  const loadData = async () => {
    setIsFetching(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      message.success('Promotional demonstrations registry refreshed');
    } catch {
      message.error('Failed to refresh data');
    } finally {
      setIsFetching(false);
    }
  };

  // Direct In-Place Status Update without Opening the Form
  const handleQuickStatusChange = (recordId, newStatus) => {
    setPromos((prev) =>
      prev.map((p) => (p.id === recordId ? { ...p, promo_status: newStatus } : p))
    );
    message.success(`Campaign status updated to "${newStatus}"`);
  };

  // Filter pipeline
  const filteredPromos = useMemo(() => {
    return promos.filter((p) => {
      const code = extractName(p.promo_code).toLowerCase();
      const title = extractName(p.promo_title).toLowerCase();
      const org = extractName(p.organizer_name).toLowerCase();
      const kebele = extractName(p.kebele).toLowerCase();
      const woreda = extractName(p.woreda).toLowerCase();
      const zone = extractName(p.zone).toLowerCase();
      const q = searchTerm.toLowerCase();

      const matchesSearch =
        code.includes(q) || title.includes(q) || org.includes(q) || kebele.includes(q) || woreda.includes(q) || zone.includes(q);
      const matchesSector = sectorFilter ? p.promo_sector === sectorFilter : true;
      const matchesActivity = activityFilter ? p.core_activity === activityFilter : true;
      const matchesFY = fiscalYearFilter ? p.fiscal_year === fiscalYearFilter : true;
      const matchesSeason = seasonFilter ? p.season === seasonFilter : true;
      const matchesStatus = statusFilter ? p.promo_status === statusFilter : true;
      const matchesZone = zoneFilter ? zone === zoneFilter.toLowerCase() : true;

      return matchesSearch && matchesSector && matchesActivity && matchesFY && matchesSeason && matchesStatus && matchesZone;
    });
  }, [promos, searchTerm, sectorFilter, activityFilter, fiscalYearFilter, seasonFilter, statusFilter, zoneFilter]);

  // Statistics Calculation
  const stats = useMemo(() => {
    const totalPromos = filteredPromos.length;
    const maleAttendees = filteredPromos.reduce((acc, p) => acc + (Number(p.male_attendees) || 0), 0);
    const femaleAttendees = filteredPromos.reduce((acc, p) => acc + (Number(p.female_attendees) || 0), 0);
    const marriedWomen = filteredPromos.reduce((acc, p) => acc + (Number(p.married_women_attendees) || 0), 0);
    const youth = filteredPromos.reduce((acc, p) => acc + (Number(p.youth_attendees) || 0), 0);
    const investors = filteredPromos.reduce((acc, p) => acc + (Number(p.investors_attendees) || 0), 0);

    const totalAttendees = maleAttendees + femaleAttendees + marriedWomen + youth + investors;
    const totalWomenAttendees = femaleAttendees + marriedWomen;
    const womenRatio = totalAttendees > 0 ? ((totalWomenAttendees / totalAttendees) * 100).toFixed(1) : 0;
    const conductedCount = filteredPromos.filter((p) => p.promo_status === 'Successfully Conducted').length;

    return {
      totalPromos,
      totalAttendees,
      maleAttendees,
      femaleAttendees,
      marriedWomen,
      totalWomenAttendees,
      youth,
      investors,
      womenRatio,
      conductedCount
    };
  }, [filteredPromos]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSectorFilter(null);
    setActivityFilter(null);
    setFiscalYearFilter(null);
    setSeasonFilter(null);
    setStatusFilter(null);
    setZoneFilter(null);
  };

  const handleOpenModal = (record = null) => {
    setEditingPromo(record);
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

      if (editingPromo) {
        setPromos((prev) =>
          prev.map((item) =>
            item.id === editingPromo.id ? { ...item, ...payload, promo_status: editingPromo.promo_status } : item
          )
        );
        message.success('Promotional demonstration record updated successfully');
      } else {
        const newRecord = {
          ...payload,
          id: Date.now().toString(),
          promo_code: values.promo_code || `PRM-${Date.now().toString().slice(-4)}`,
          promo_status: 'Successfully Conducted'
        };
        setPromos((prev) => [newRecord, ...prev]);
        message.success('New promotional demonstration registered successfully');
      }
      setIsModalOpen(false);
    } catch (error) {
      message.error(error?.response?.data?.message || error.message || 'Failed to save promotional demonstration record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    setPromos((prev) => prev.filter((item) => item.id !== id));
    message.success('Promotional demonstration record removed');
  };

  const exportToCSV = () => {
    if (!filteredPromos.length) {
      message.warning('No promotional records available to export');
      return;
    }
    const headers = [
      'Promo Code,Title,Sector,Core Activity,Duration (Days),Organizer,Phone,FY,Season,Zone,Woreda,Kebele,Male (ወንድ),Female (ሴት),Married Women (ባለትዳር),Youth (ወጣቶች),Investors (ባለሃብቶች),Total Attendees,Status'
    ];
    const rows = filteredPromos.map((p) => {
      const total =
        (Number(p.male_attendees) || 0) +
        (Number(p.female_attendees) || 0) +
        (Number(p.married_women_attendees) || 0) +
        (Number(p.youth_attendees) || 0) +
        (Number(p.investors_attendees) || 0);

      return [
        `"${p.promo_code || ''}"`,
        `"${p.promo_title || ''}"`,
        `"${p.promo_sector || ''}"`,
        `"${p.core_activity || ''}"`,
        p.attendance_days || 1,
        `"${p.organizer_name || ''}"`,
        `"${p.organizer_phone || ''}"`,
        `"${p.fiscal_year || ''}"`,
        `"${p.season || ''}"`,
        `"${extractName(p.zone)}"`,
        `"${extractName(p.woreda)}"`,
        `"${extractName(p.kebele)}"`,
        p.male_attendees || 0,
        p.female_attendees || 0,
        p.married_women_attendees || 0,
        p.youth_attendees || 0,
        p.investors_attendees || 0,
        total,
        `"${p.promo_status || ''}"`
      ].join(',');
    });

    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Promotional_Demonstrations_Report_${Date.now()}.csv`;
    a.click();
    message.success('Promotional demonstrations report exported successfully');
  };

  const columns = [
    {
      title: 'Promo Code & Title',
      key: 'promo_info',
      width: 250,
      render: (_, r) => (
        <div>
          <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{r.promo_title}</strong>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>
            Code: <span style={{ fontFamily: 'monospace' }}>{r.promo_code}</span> | Organizer: {r.organizer_name}
          </div>
        </div>
      )
    },
    {
      title: 'Promotional Sector',
      dataIndex: 'promo_sector',
      key: 'promo_sector',
      width: 210,
      render: (sec) => {
        let color = 'default';
        if (sec?.includes('Cereal')) color = 'green';
        if (sec?.includes('Natural')) color = 'gold';
        if (sec?.includes('Irrigation')) color = 'blue';
        if (sec?.includes('Home')) color = 'purple';
        return <Tag color={color}>{sec}</Tag>;
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
      title: 'Attendees Enrolled',
      key: 'attendees_breakdown',
      width: 230,
      render: (_, r) => {
        const total =
          (Number(r.male_attendees) || 0) +
          (Number(r.female_attendees) || 0) +
          (Number(r.married_women_attendees) || 0) +
          (Number(r.youth_attendees) || 0) +
          (Number(r.investors_attendees) || 0);

        return (
          <div style={{ fontSize: 11 }}>
            <div>
              Total: <strong style={{ color: '#1a5f2c' }}>{total.toLocaleString()} Attendees</strong>
            </div>
            <div style={{ color: '#8c8c8c' }}>
              <span>ወንድ: {r.male_attendees || 0}</span> | <span>ሴት: {r.female_attendees || 0}</span> | <span>ባለትዳር: {r.married_women_attendees || 0}</span>
            </div>
          </div>
        );
      }
    },
    {
      title: 'Campaign Status (In-Place Edit)',
      dataIndex: 'promo_status',
      key: 'promo_status',
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
          <Tooltip title="View Campaign Dossier">
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: '#1890ff' }} />}
              onClick={() => {
                setSelectedPromo(record);
                setIsDossierOpen(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Edit Campaign">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: '#52c41a' }} />}
              onClick={() => handleOpenModal(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Record">
            <Popconfirm
              title="Delete promotional demonstration?"
              description="Are you sure you want to remove this promotional campaign?"
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
        <Breadcrumb.Item>Promotional Demonstrations (Crops, NRM, Irrig, Nutrition)</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#1a5f2c', fontFamily: "'Times New Roman', Times, serif" }}>
            Promotional Demonstrations (Crops, NRM, Irrig, Nutrition) (የቴክኖሎጂ ማስተዋወቂያ ማሳዎች - ሰብል፣ ተፈጥሮ ሀብት፣ መስኖ፣ ስነ-ምግብ)
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Coordinating large-scale promotional field days, FTC open houses, and multi-sectoral technology exposition campaigns
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
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Total Campaign Attendees</span>}
              value={stats.totalAttendees}
              prefix={<NotificationOutlined style={{ color: '#1a5f2c', marginRight: 8 }} />}
              valueStyle={{ color: '#1a5f2c', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Total Campaigns: <strong style={{ color: '#262626' }}>{stats.totalPromos} events</strong>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #1890ff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Male Attendees (ወንድ)</span>}
              value={stats.maleAttendees}
              prefix={<ManOutlined style={{ color: '#1890ff', marginRight: 8 }} />}
              valueStyle={{ color: '#1890ff', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Male participants in promotional events
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #722ed1', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Women Attendees (ሴት + ባለትዳር)</span>}
              value={stats.totalWomenAttendees}
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
                placeholder="Search Title, Code, or Organizer..."
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: 220 }}
                allowClear
              />

              <Select
                placeholder="Promotional Sector"
                value={sectorFilter}
                onChange={setSectorFilter}
                style={{ width: 195 }}
                allowClear
              >
                {PROMO_SECTORS.map((ps) => (
                  <Option key={ps} value={ps}>{ps}</Option>
                ))}
              </Select>

              <Select
                placeholder="Core Activity"
                value={activityFilter}
                onChange={setActivityFilter}
                style={{ width: 200 }}
                allowClear
              >
                {PROMO_ACTIVITIES.map((pa) => (
                  <Option key={pa} value={pa}>{pa}</Option>
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
                {[...new Set(promos.map((p) => extractName(p.zone)))].map((z) => (
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
                Export Promo CSV
              </Button>

              <Button
                icon={<ClearOutlined />}
                onClick={handleResetFilters}
                disabled={!(searchTerm || sectorFilter || activityFilter || fiscalYearFilter || seasonFilter || statusFilter || zoneFilter)}
              >
                Reset Filters
              </Button>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => handleOpenModal(null)}
                style={{ backgroundColor: '#1a5f2c', borderColor: '#1a5f2c', fontWeight: 600 }}
              >
                Organize Campaign
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Main Table */}
      <Table
        columns={columns}
        dataSource={filteredPromos}
        rowKey="id"
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} promotional campaigns`
        }}
        scroll={{ x: 1350 }}
        bordered
        size="middle"
      />

      {/* Registration / Edit Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <NotificationOutlined style={{ color: '#1a5f2c', fontSize: 20 }} />
            <span style={{ color: '#1a5f2c', fontWeight: 'bold', fontFamily: "'Times New Roman', Times, serif", fontSize: 17 }}>
              {editingPromo ? 'Edit Promotional Campaign Record' : 'Organize Promotional Campaign (የቴክኖሎጂ ማስተዋወቂያ ምዝገባ)'}
            </span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText={editingPromo ? 'Update Campaign' : 'Save Campaign Record'}
        okButtonProps={{ style: { backgroundColor: '#1a5f2c', borderColor: '#1a5f2c' }, loading: isSubmitting }}
        width={800}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Campaign Identification & Sector
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="promo_code"
                label="Campaign Code"
                rules={[{ required: true, message: 'Code required' }]}
              >
                <Input placeholder="e.g. PRM-2019-EG-08" />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item
                name="promo_title"
                label="Promotional Campaign Title / Event"
                rules={[{ required: true, message: 'Title required' }]}
              >
                <Input placeholder="e.g. Kurar National Teff Field Day & Expo" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="promo_sector"
                label="Promotional Sector"
                rules={[{ required: true, message: 'Select sector' }]}
              >
                <Select>
                  {PROMO_SECTORS.map((ps) => (
                    <Option key={ps} value={ps}>{ps}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="core_activity"
                label="Core Promotional Activity"
                rules={[{ required: true, message: 'Select activity' }]}
              >
                <Select>
                  {PROMO_ACTIVITIES.map((pa) => (
                    <Option key={pa} value={pa}>{pa}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={14}>
              <Form.Item
                name="organizer_name"
                label="Organizer / Coordinator Name"
                rules={[{ required: true, message: 'Organizer required' }]}
              >
                <Input placeholder="e.g. Ato Mulugeta Fentaw (Coordinator)" />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item
                name="organizer_phone"
                label="Organizer Phone Number"
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
                name="attendance_days"
                label="Event Duration (Days)"
                rules={[{ required: true }]}
              >
                <InputNumber min={1} max={14} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Attendees Enrolled by Cohort (ተሳታፊዎች በወኪል ምድብ)
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="male_attendees"
                label="Male Attendees (ወንድ)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="female_attendees"
                label="Female Attendees (ሴት)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="married_women_attendees"
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
                name="youth_attendees"
                label="Youth Attendees (ወጣቶች)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="investors_attendees"
                label="Private Investors (ባለሃብቶች)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="promo_notes" label="Campaign Proceedings & Visitor Feedback">
                <TextArea rows={3} placeholder="Summarize event highlights, dignitary feedback, or technology adoption commitments..." />
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

      {/* Comprehensive Campaign Dossier Modal */}
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
                <NotificationOutlined />
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
                  {selectedPromo?.promo_title}
                </span>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                  Code: <span style={{ fontFamily: 'monospace' }}>{selectedPromo?.promo_code}</span> | Organizer:{' '}
                  {selectedPromo?.organizer_name}
                </div>
              </div>
            </div>
            <div>
              <Tag
                color={selectedPromo?.promo_status === 'Successfully Conducted' ? 'success' : 'processing'}
                icon={selectedPromo?.promo_status === 'Successfully Conducted' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                style={{ fontSize: 12, padding: '2px 10px', borderRadius: 12 }}
              >
                {selectedPromo?.promo_status || 'Conducted'}
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
              handleOpenModal(selectedPromo);
            }}
          >
            Edit Campaign
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
        {selectedPromo && (
          <div style={{ paddingTop: 8 }}>
            {/* Top Metric Strip */}
            <Row gutter={12} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f6ffed', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Total Attendees</span>}
                    value={
                      (Number(selectedPromo.male_attendees) || 0) +
                      (Number(selectedPromo.female_attendees) || 0) +
                      (Number(selectedPromo.married_women_attendees) || 0) +
                      (Number(selectedPromo.youth_attendees) || 0) +
                      (Number(selectedPromo.investors_attendees) || 0)
                    }
                    suffix={<span style={{ fontSize: 12 }}>People</span>}
                    valueStyle={{ fontSize: 15, fontWeight: 'bold', color: '#1a5f2c' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f0f5ff', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Promo Sector</span>}
                    value={selectedPromo.promo_sector?.split(' ')[0] || 'Sector'}
                    valueStyle={{ fontSize: 15, fontWeight: 'bold', color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f9f0ff', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Women Share</span>}
                    value={
                      (Number(selectedPromo.male_attendees) || 0) +
                      (Number(selectedPromo.female_attendees) || 0) +
                      (Number(selectedPromo.married_women_attendees) || 0) +
                      (Number(selectedPromo.youth_attendees) || 0) +
                      (Number(selectedPromo.investors_attendees) || 0) > 0
                        ? (
                            (((Number(selectedPromo.female_attendees) || 0) +
                              (Number(selectedPromo.married_women_attendees) || 0)) /
                              ((Number(selectedPromo.male_attendees) || 0) +
                                (Number(selectedPromo.female_attendees) || 0) +
                                (Number(selectedPromo.married_women_attendees) || 0) +
                                (Number(selectedPromo.youth_attendees) || 0) +
                                (Number(selectedPromo.investors_attendees) || 0))) *
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
                    value={selectedPromo.attendance_days || 1}
                    suffix="Days"
                    valueStyle={{ fontSize: 14, fontWeight: 'bold', color: '#fa8c16' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* TABPANES */}
            <Tabs defaultActiveKey="1" type="card">
              {/* TAB 1: Campaign Profile */}
              <TabPane
                tab={
                  <span>
                    <TeamOutlined />
                    Attendee Demographics & Reach
                  </span>
                }
                key="1"
              >
                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }} style={{ marginBottom: 16 }}>
                  <Descriptions.Item label="Campaign Title" span={2}>
                    <strong style={{ color: '#1a5f2c' }}>{selectedPromo.promo_title}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Promotional Sector">
                    <Tag color="purple">{selectedPromo.promo_sector}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Core Activity">
                    <Tag color="green">{selectedPromo.core_activity}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Organizer">
                    {selectedPromo.organizer_name} ({selectedPromo.organizer_phone})
                  </Descriptions.Item>
                </Descriptions>

                <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: 16, background: '#fafafa' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1a5f2c', textTransform: 'uppercase', marginBottom: 12 }}>
                    Attendee Disaggregation (ተሳታፊዎች በወኪል ምድብ)
                  </div>
                  <Row gutter={[16, 16]}>
                    <Col span={8}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <ManOutlined style={{ color: '#1890ff', marginRight: 4 }} />
                          Male Attendees (ወንድ)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#1890ff', marginTop: 2 }}>
                          {Number(selectedPromo.male_attendees || 0).toLocaleString()}
                        </div>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <WomanOutlined style={{ color: '#722ed1', marginRight: 4 }} />
                          Female Attendees (ሴት)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#722ed1', marginTop: 2 }}>
                          {Number(selectedPromo.female_attendees || 0).toLocaleString()}
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
                          {Number(selectedPromo.married_women_attendees || 0).toLocaleString()}
                        </div>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <RiseOutlined style={{ color: '#fa8c16', marginRight: 4 }} />
                          Youth Attendees (ወጣቶች)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#fa8c16', marginTop: 2 }}>
                          {Number(selectedPromo.youth_attendees || 0).toLocaleString()}
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
                          {Number(selectedPromo.investors_attendees || 0).toLocaleString()}
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
                    Campaign Notes & Feedback
                  </span>
                }
                key="2"
              >
                <Card size="small" bordered={false} style={{ background: '#fcfdfd', border: '1px solid #e6f7ed', borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <CheckCircleOutlined style={{ color: '#1a5f2c', fontSize: 16 }} />
                    <strong style={{ color: '#1a5f2c', fontSize: 13, textTransform: 'uppercase' }}>
                      Campaign Proceedings & Feedback (የማስተዋወቂያ ዘመቻ ማስታወሻ)
                    </strong>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: '#262626', lineHeight: '1.6' }}>
                    {selectedPromo.promo_notes || 'Active promotional campaign showcasing agricultural innovation and technology.'}
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
                    <strong>{extractName(selectedPromo.zone)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Woreda">
                    <strong>{extractName(selectedPromo.woreda)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Kebele Operational Base">
                    <span style={{ color: '#1a5f2c', fontWeight: 'bold' }}>
                      {extractName(selectedPromo.kebele)}
                    </span>
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
                  <Descriptions.Item label="Fiscal Year (በጀት ዓመት)">
                    <Tag color="blue" icon={<CalendarOutlined />}>
                      {selectedPromo.fiscal_year || '2019 E.C.'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Production Campaign Season">
                    <strong>{selectedPromo.season || 'Meher (መኸር)'}</strong>
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

export default function PromotionalDemos() {
  return (
    <App>
      <PromotionalDemosContent />
    </App>
  );
}