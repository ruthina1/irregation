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

const AWARENESS_CATEGORIES = [
  'HIV/AIDS Community Sensitization & Prevention Forum (የኤችአይቪ/ኤድስ ማህበረሰብ ግንዛቤ ማስጨበጫ መድረክ)',
  'Substance Abuse & Khat Addiction Farmer Counseling (የጫት ሱስና አደገኛ ዕፅ ተፅዕኖ ማስተማሪያ)',
  'Youth & Farmer Joint Anti-Stigma Campaign (የወጣቶችና አርሶ አደሮች የጋራ ስቲግማ ማጥፊያ ዘመቻ)',
  'FTC Extension Health & Social Welfare Briefing (የማራዘሚያ ማዕከል ጤናና ማህበራዊ ደህንነት ውይይት)',
  'Peer Educator & Religious Leader Mobilization (የእኩዮች አስተማሪዎችና የሃይማኖት አባቶች ንቅናቄ)'
];

const AWARENESS_ACTIVITIES = [
  'Community Town Hall Meeting & Dialogue',
  'Youth-Led Drama & Edutainment Session',
  'Farmer Peer Counseling & Support Circle',
  'Distribution of Educational & Protective Materials',
  'Behavior Change Communication (BCC) Audit'
];

const INITIAL_AWARENESS = [
  {
    id: '1',
    aw_code: 'CAS-2019-EG-01',
    aw_title: 'Kurar Woreda HIV/AIDS & Khat Addiction Farmer Awareness Campaign',
    aw_category: 'Substance Abuse & Khat Addiction Farmer Counseling (የጫት ሱስና አደገኛ ዕፅ ተፅዕኖ ማስተማሪያ)',
    core_activity: 'Community Town Hall Meeting & Dialogue',
    campaign_lead: 'Ato Getachew Mekonnen (Social Health Officer)',
    lead_phone: '+251 913 990 112',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    community_sessions_held: 12,
    farmers_reached: 450,
    male_participants: 200,
    female_participants: 250,
    married_women_participants: 210,
    youth_participants: 180,
    investors_participants: 4,
    aw_status: 'Successfully Conducted',
    aw_notes: 'Conducted 12 community town halls reaching 450 farmers on the economic impacts of khat addiction and HIV prevention.',
    zone: 'East Gojjam',
    woreda: 'Dejen',
    kebele: 'Kurar'
  },
  {
    id: '2',
    aw_code: 'CAS-2019-SG-04',
    aw_title: 'Fogera Youth & Farmer Joint Anti-Stigma Campaign',
    aw_category: 'Youth & Farmer Joint Anti-Stigma Campaign (የወጣቶችና አርሶ አደሮች የጋራ ስቲግማ ማጥፊያ ዘመቻ)',
    core_activity: 'Youth-Led Drama & Edutainment Session',
    campaign_lead: 'Woizero Almaz Bekele',
    lead_phone: '+251 915 667 899',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    community_sessions_held: 8,
    farmers_reached: 320,
    male_participants: 140,
    female_participants: 180,
    married_women_participants: 150,
    youth_participants: 160,
    investors_participants: 2,
    aw_status: 'Successfully Conducted',
    aw_notes: 'Engaged youth and farmers through edutainment and drama sessions to eliminate HIV stigmatization in rural kebeles.',
    zone: 'South Gondar',
    woreda: 'Fogera',
    kebele: 'Woreta Zuria'
  },
  {
    id: '3',
    aw_code: 'CAS-2018-WG-02',
    aw_title: 'Alefa FTC Health & Social Welfare Briefing (2018 E.C.)',
    aw_category: 'FTC Extension Health & Social Welfare Briefing (የማራዘሚያ ማዕከል ጤናና ማህበራዊ ደህንነት ውይይት)',
    core_activity: 'Farmer Peer Counseling & Support Circle',
    campaign_lead: 'Woizero Tigist Abebe',
    lead_phone: '+251 922 556 778',
    fiscal_year: '2018 E.C.',
    season: 'Bega / Irrigation (መስኖ/በጋ)',
    community_sessions_held: 6,
    farmers_reached: 210,
    male_participants: 90,
    female_participants: 120,
    married_women_participants: 95,
    youth_participants: 70,
    investors_participants: 1,
    aw_status: 'Active Monitoring',
    aw_notes: 'Organized FTC peer counseling circles for farmers on productive time management and substance abuse mitigation.',
    zone: 'West Gojjam',
    woreda: 'Bure',
    kebele: 'Alefa'
  }
];

function CommunityAwarenessContent() {
  const { message } = App.useApp();

  const [awarenessRecords, setAwarenessRecords] = useState(INITIAL_AWARENESS);
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
  const [editingAw, setEditingAw] = useState(null);
  const [selectedAw, setSelectedAw] = useState(null);
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
      if (editingAw) {
        const initForm = async () => {
          const zoneMatch = zones.find(
            (z) => z.name === editingAw.zone || z.id === editingAw.zone_id
          );
          if (zoneMatch) {
            try {
              const wRes = locationApi?.getWoredas ? await locationApi.getWoredas(zoneMatch.id) : null;
              const wList = wRes?.data?.data?.data || wRes?.data?.data || [];
              setWoredas(wList);

              const woredaMatch = wList.find(
                (w) => w.name === editingAw.woreda || w.id === editingAw.woreda_id
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
            aw_code: editingAw.aw_code,
            aw_title: editingAw.aw_title,
            aw_category: editingAw.aw_category,
            core_activity: editingAw.core_activity,
            campaign_lead: editingAw.campaign_lead,
            lead_phone: editingAw.lead_phone,
            fiscal_year: editingAw.fiscal_year || '2019 E.C.',
            season: editingAw.season || 'Meher (መኸር)',
            community_sessions_held: Number(editingAw.community_sessions_held) || 5,
            farmers_reached: Number(editingAw.farmers_reached) || 100,
            male_participants: Number(editingAw.male_participants) || 0,
            female_participants: Number(editingAw.female_participants) || 0,
            married_women_participants: Number(editingAw.married_women_participants) || 0,
            youth_participants: Number(editingAw.youth_participants) || 0,
            investors_participants: Number(editingAw.investors_participants) || 0,
            aw_notes: editingAw.aw_notes,
            zone_id: editingAw.zone_id || zoneMatch?.id || editingAw.zone,
            woreda_id: editingAw.woreda_id || editingAw.woreda,
            kebele_id: editingAw.kebele_id || editingAw.kebele
          });
        };
        initForm();
      } else {
        form.resetFields();
        form.setFieldsValue({
          aw_category: 'Substance Abuse & Khat Addiction Farmer Counseling (የጫት ሱስና አደገኛ ዕፅ ተፅዕኖ ማስተማሪያ)',
          core_activity: 'Community Town Hall Meeting & Dialogue',
          fiscal_year: fiscalYearImpactFilter || '2019 E.C.',
          season: 'Meher (መኸር)',
          community_sessions_held: 5,
          farmers_reached: 150,
          male_participants: 60,
          female_participants: 90,
          married_women_participants: 75,
          youth_participants: 50,
          investors_participants: 2
        });
        setWoredas([]);
        setKebeles([]);
      }
    }
  }, [isModalOpen, editingAw, form, zones, fiscalYearImpactFilter]);

  const loadData = async () => {
    setIsFetching(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      message.success('Farmer community awareness registry refreshed');
    } catch {
      message.error('Failed to refresh data');
    } finally {
      setIsFetching(false);
    }
  };

  // Direct In-Place Status Update without Opening the Form
  const handleQuickStatusChange = (recordId, newStatus) => {
    setAwarenessRecords((prev) =>
      prev.map((a) => (a.id === recordId ? { ...a, aw_status: newStatus } : a))
    );
    message.success(`Awareness status updated to "${newStatus}"`);
  };

  // Filter pipeline (includes explicit fiscal year impact selection)
  const filteredAwarenessRecords = useMemo(() => {
    return awarenessRecords.filter((a) => {
      const code = extractName(a.aw_code).toLowerCase();
      const title = extractName(a.aw_title).toLowerCase();
      const lead = extractName(a.campaign_lead).toLowerCase();
      const kebele = extractName(a.kebele).toLowerCase();
      const woreda = extractName(a.woreda).toLowerCase();
      const zone = extractName(a.zone).toLowerCase();
      const q = searchTerm.toLowerCase();

      const matchesSearch =
        code.includes(q) || title.includes(q) || lead.includes(q) || kebele.includes(q) || woreda.includes(q) || zone.includes(q);
      const matchesFY = fiscalYearImpactFilter ? a.fiscal_year === fiscalYearImpactFilter : true;
      const matchesCategory = categoryFilter ? a.aw_category === categoryFilter : true;
      const matchesActivity = activityFilter ? a.core_activity === activityFilter : true;
      const matchesSeason = seasonFilter ? a.season === seasonFilter : true;
      const matchesStatus = statusFilter ? a.aw_status === statusFilter : true;
      const matchesZone = zoneFilter ? zone === zoneFilter.toLowerCase() : true;

      return matchesSearch && matchesFY && matchesCategory && matchesActivity && matchesSeason && matchesStatus && matchesZone;
    });
  }, [awarenessRecords, searchTerm, fiscalYearImpactFilter, categoryFilter, activityFilter, seasonFilter, statusFilter, zoneFilter]);

  // Statistics Calculation for Selected Fiscal Year Impact
  const stats = useMemo(() => {
    const totalPrograms = filteredAwarenessRecords.length;
    const totalSessions = filteredAwarenessRecords.reduce((acc, a) => acc + (Number(a.community_sessions_held) || 0), 0);
    const totalFarmersReached = filteredAwarenessRecords.reduce((acc, a) => acc + (Number(a.farmers_reached) || 0), 0);
    const maleParticipants = filteredAwarenessRecords.reduce((acc, a) => acc + (Number(a.male_participants) || 0), 0);
    const femaleParticipants = filteredAwarenessRecords.reduce((acc, a) => acc + (Number(a.female_participants) || 0), 0);
    const marriedWomen = filteredAwarenessRecords.reduce((acc, a) => acc + (Number(a.married_women_participants) || 0), 0);
    const youth = filteredAwarenessRecords.reduce((acc, a) => acc + (Number(a.youth_participants) || 0), 0);
    const investors = filteredAwarenessRecords.reduce((acc, a) => acc + (Number(a.investors_participants) || 0), 0);

    const totalParticipants = maleParticipants + femaleParticipants + marriedWomen + youth + investors;
    const totalWomenParticipants = femaleParticipants + marriedWomen;
    const womenRatio = totalParticipants > 0 ? ((totalWomenParticipants / totalParticipants) * 100).toFixed(1) : 0;
    const conductedCount = filteredAwarenessRecords.filter((a) => a.aw_status === 'Successfully Conducted').length;

    return {
      totalPrograms,
      totalSessions,
      totalFarmersReached,
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
  }, [filteredAwarenessRecords]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setCategoryFilter(null);
    setActivityFilter(null);
    setSeasonFilter(null);
    setStatusFilter(null);
    setZoneFilter(null);
  };

  const handleOpenModal = (record = null) => {
    setEditingAw(record);
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

      if (editingAw) {
        setAwarenessRecords((prev) =>
          prev.map((item) =>
            item.id === editingAw.id ? { ...item, ...payload, aw_status: editingAw.aw_status } : item
          )
        );
        message.success('Community awareness record updated successfully');
      } else {
        const newRecord = {
          ...payload,
          id: Date.now().toString(),
          aw_code: values.aw_code || `CAS-${Date.now().toString().slice(-4)}`,
          aw_status: 'Successfully Conducted'
        };
        setAwarenessRecords((prev) => [newRecord, ...prev]);
        message.success('New community awareness campaign registered successfully');
      }
      setIsModalOpen(false);
    } catch (error) {
      message.error(error?.response?.data?.message || error.message || 'Failed to save awareness record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    setAwarenessRecords((prev) => prev.filter((item) => item.id !== id));
    message.success('Community awareness record removed');
  };

  const exportToCSV = () => {
    if (!filteredAwarenessRecords.length) {
      message.warning('No awareness records available to export');
      return;
    }
    const headers = [
      'Awareness Code,Title,Category,Core Activity,Sessions Held,Farmers Reached,Campaign Lead,Phone,FY,Season,Zone,Woreda,Kebele,Male (ወንድ),Female (ሴት),Married Women (ባለትዳር),Youth (ወጣቶች),Investors (ባለሃብቶች),Total Participants,Status'
    ];
    const rows = filteredAwarenessRecords.map((a) => {
      const total =
        (Number(a.male_participants) || 0) +
        (Number(a.female_participants) || 0) +
        (Number(a.married_women_participants) || 0) +
        (Number(a.youth_participants) || 0) +
        (Number(a.investors_participants) || 0);

      return [
        `"${a.aw_code || ''}"`,
        `"${a.aw_title || ''}"`,
        `"${a.aw_category || ''}"`,
        `"${a.core_activity || ''}"`,
        a.community_sessions_held || 0,
        a.farmers_reached || 0,
        `"${a.campaign_lead || ''}"`,
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
        `"${a.aw_status || ''}"`
      ].join(',');
    });

    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Community_Awareness_FY_${fiscalYearImpactFilter.replace(/\s+/g, '_')}_${Date.now()}.csv`;
    a.click();
    message.success(`Community awareness report for ${fiscalYearImpactFilter} exported successfully`);
  };

  const columns = [
    {
      title: 'Awareness Code & Title',
      key: 'aw_info',
      width: 250,
      render: (_, r) => (
        <div>
          <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{r.aw_title}</strong>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>
            Code: <span style={{ fontFamily: 'monospace' }}>{r.aw_code}</span> | Reached: {Number(r.farmers_reached || 0).toLocaleString()} Farmers
          </div>
        </div>
      )
    },
    {
      title: 'Awareness Category',
      dataIndex: 'aw_category',
      key: 'aw_category',
      width: 210,
      render: (cat) => {
        let color = 'default';
        if (cat?.includes('HIV/AIDS')) color = 'red';
        if (cat?.includes('Substance')) color = 'gold';
        if (cat?.includes('Youth')) color = 'blue';
        if (cat?.includes('FTC')) color = 'green';
        if (cat?.includes('Peer Educator')) color = 'purple';
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
              Total: <strong style={{ color: '#1a5f2c' }}>{total.toLocaleString()} People</strong>
            </div>
            <div style={{ color: '#8c8c8c' }}>
              <span>ወንድ: {r.male_participants || 0}</span> | <span>ሴት: {r.female_participants || 0}</span> | <span>ባለትዳር: {r.married_women_participants || 0}</span>
            </div>
          </div>
        );
      }
    },
    {
      title: 'Campaign Status (In-Place Edit)',
      dataIndex: 'aw_status',
      key: 'aw_status',
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
          <Option value="Active Monitoring">
            <Tag color="processing" icon={<ClockCircleOutlined />} style={{ margin: 0 }}>
              Monitoring
            </Tag>
          </Option>
          <Option value="Follow-up Due">
            <Tag color="warning" icon={<ClockCircleOutlined />} style={{ margin: 0 }}>
              Follow-up Due
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
          <Tooltip title="View Awareness Dossier">
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: '#1890ff' }} />}
              onClick={() => {
                setSelectedAw(record);
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
              title="Delete community awareness record?"
              description="Are you sure you want to remove this awareness campaign record?"
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
        <Breadcrumb.Item>HIV/AIDS & Substance Abuse (Khat) Farmer Awareness</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#1a5f2c', fontFamily: "'Times New Roman', Times, serif" }}>
            HIV/AIDS & Substance Abuse (Khat) Farmer Awareness (የኤችአይቪ/ኤድስና የጫት ሱስ ግንዛቤ ማስጨበጫ)
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Coordinating community town halls, khat addiction farmer counseling, youth-led edutainment campaigns, and FTC health welfare briefings
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
              Farmers Reached: <strong style={{ color: '#262626' }}>{stats.totalFarmersReached.toLocaleString()} farmers</strong>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #1890ff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Youth Participants ({fiscalYearImpactFilter})</span>}
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
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Successfully Conducted</span>}
              value={stats.conductedCount}
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
                placeholder="Awareness Category"
                value={categoryFilter}
                onChange={setCategoryFilter}
                style={{ width: 195 }}
                allowClear
              >
                {AWARENESS_CATEGORIES.map((ac) => (
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
                {AWARENESS_ACTIVITIES.map((aa) => (
                  <Option key={aa} value={aa}>{aa}</Option>
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
                {[...new Set(awarenessRecords.map((a) => extractName(a.zone)))].map((z) => (
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
                Register Campaign
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Main Table */}
      <Table
        columns={columns}
        dataSource={filteredAwarenessRecords}
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
            <SoundOutlined style={{ color: '#1a5f2c', fontSize: 20 }} />
            <span style={{ color: '#1a5f2c', fontWeight: 'bold', fontFamily: "'Times New Roman', Times, serif", fontSize: 17 }}>
              {editingAw ? 'Edit Awareness Campaign Record' : `Register Awareness Campaign (${fiscalYearImpactFilter})`}
            </span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText={editingAw ? 'Update Record' : 'Save Campaign Record'}
        okButtonProps={{ style: { backgroundColor: '#1a5f2c', borderColor: '#1a5f2c' }, loading: isSubmitting }}
        width={800}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Campaign Identification & Category
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="aw_code"
                label="Awareness Code"
                rules={[{ required: true, message: 'Code required' }]}
              >
                <Input placeholder="e.g. CAS-2019-EG-08" />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item
                name="aw_title"
                label="Campaign Title / Forum Description"
                rules={[{ required: true, message: 'Title required' }]}
              >
                <Input placeholder="e.g. Kurar Woreda HIV/AIDS & Khat Addiction Awareness" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="aw_category"
                label="Awareness Category"
                rules={[{ required: true, message: 'Select category' }]}
              >
                <Select>
                  {AWARENESS_CATEGORIES.map((ac) => (
                    <Option key={ac} value={ac}>{ac}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="core_activity"
                label="Core Campaign Activity"
                rules={[{ required: true, message: 'Select activity' }]}
              >
                <Select>
                  {AWARENESS_ACTIVITIES.map((aa) => (
                    <Option key={aa} value={aa}>{aa}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="campaign_lead"
                label="Campaign Lead / Health Officer"
                rules={[{ required: true, message: 'Lead required' }]}
              >
                <Input placeholder="e.g. Ato Getachew Mekonnen" />
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
            <Col span={4}>
              <Form.Item
                name="community_sessions_held"
                label="Sessions Held"
                rules={[{ required: true, message: 'Sessions required' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item
                name="farmers_reached"
                label="Farmers Reached"
                rules={[{ required: true, message: 'Farmers reached required' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
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
              <Form.Item name="aw_notes" label="Campaign Notes & Community Impact Milestones">
                <TextArea rows={3} placeholder="Summarize town hall discussions, khat addiction counseling results, or anti-stigma takeaways..." />
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

      {/* Comprehensive Awareness Dossier Modal */}
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
                <SoundOutlined />
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
                  {selectedAw?.aw_title}
                </span>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                  Code: <span style={{ fontFamily: 'monospace' }}>{selectedAw?.aw_code}</span> | Lead:{' '}
                  {selectedAw?.campaign_lead}
                </div>
              </div>
            </div>
            <div>
              <Tag
                color={selectedAw?.aw_status === 'Successfully Conducted' ? 'success' : 'processing'}
                icon={selectedAw?.aw_status === 'Successfully Conducted' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                style={{ fontSize: 12, padding: '2px 10px', borderRadius: 12 }}
              >
                {selectedAw?.aw_status || 'Conducted'}
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
              handleOpenModal(selectedAw);
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
        {selectedAw && (
          <div style={{ paddingTop: 8 }}>
            {/* Top Metric Strip */}
            <Row gutter={12} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f6ffed', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Farmers Reached</span>}
                    value={selectedAw.farmers_reached || 0}
                    suffix={<span style={{ fontSize: 12 }}>Farmers</span>}
                    valueStyle={{ fontSize: 15, fontWeight: 'bold', color: '#1a5f2c' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f0f5ff', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Sessions Held</span>}
                    value={selectedAw.community_sessions_held || 0}
                    suffix={<span style={{ fontSize: 12 }}>Sessions</span>}
                    valueStyle={{ fontSize: 15, fontWeight: 'bold', color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f9f0ff', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Women Share</span>}
                    value={
                      (Number(selectedAw.male_participants) || 0) +
                      (Number(selectedAw.female_participants) || 0) +
                      (Number(selectedAw.married_women_participants) || 0) +
                      (Number(selectedAw.youth_participants) || 0) +
                      (Number(selectedAw.investors_participants) || 0) > 0
                        ? (
                            (((Number(selectedAw.female_participants) || 0) +
                              (Number(selectedAw.married_women_participants) || 0)) /
                              ((Number(selectedAw.male_participants) || 0) +
                                (Number(selectedAw.female_participants) || 0) +
                                (Number(selectedAw.married_women_participants) || 0) +
                                (Number(selectedAw.youth_participants) || 0) +
                                (Number(selectedAw.investors_participants) || 0))) *
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
                    value={selectedAw.fiscal_year}
                    valueStyle={{ fontSize: 13, fontWeight: 'bold', color: '#fa8c16' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* TABPANES */}
            <Tabs defaultActiveKey="1" type="card">
              {/* TAB 1: Awareness Profile */}
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
                  <Descriptions.Item label="Campaign Title" span={2}>
                    <strong style={{ color: '#1a5f2c' }}>{selectedAw.aw_title}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Awareness Category">
                    <Tag color="purple">{selectedAw.aw_category}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Core Activity">
                    <Tag color="green">{selectedAw.core_activity}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Campaign Lead">
                    {selectedAw.campaign_lead} ({selectedAw.lead_phone})
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
                          {Number(selectedAw.male_participants || 0).toLocaleString()}
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
                          {Number(selectedAw.female_participants || 0).toLocaleString()}
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
                          {Number(selectedAw.married_women_participants || 0).toLocaleString()}
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
                          {Number(selectedAw.youth_participants || 0).toLocaleString()}
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
                          {Number(selectedAw.investors_participants || 0).toLocaleString()}
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
                    Campaign Notes & Milestones
                  </span>
                }
                key="2"
              >
                <Card size="small" bordered={false} style={{ background: '#fcfdfd', border: '1px solid #e6f7ed', borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <CheckCircleOutlined style={{ color: '#1a5f2c', fontSize: 16 }} />
                    <strong style={{ color: '#1a5f2c', fontSize: 13, textTransform: 'uppercase' }}>
                      Community Awareness Campaign Notes (የግንዛቤ ማስጨበጫ ዘመቻ ማስታወሻ)
                    </strong>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: '#262626', lineHeight: '1.6' }}>
                    {selectedAw.aw_notes || 'Active community awareness campaign on HIV/AIDS and substance abuse mitigation.'}
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
                    <strong>{extractName(selectedAw.zone)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Woreda">
                    <strong>{extractName(selectedAw.woreda)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Kebele Operational Base">
                    <span style={{ color: '#1a5f2c', fontWeight: 'bold' }}>
                      {extractName(selectedAw.kebele)}
                    </span>
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
                  <Descriptions.Item label="Fiscal Year (በጀት ዓመት)">
                    <Tag color="blue" icon={<CalendarOutlined />}>
                      {selectedAw.fiscal_year || '2019 E.C.'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Production Campaign Season">
                    <strong>{selectedAw.season || 'Meher (መኸር)'}</strong>
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

export default function CommunityAwareness() {
  return (
    <App>
      <CommunityAwarenessContent />
    </App>
  );
}