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
  PhoneOutlined,
  CustomerServiceOutlined,
  WomanOutlined,
  ManOutlined,
  RiseOutlined,
  ShopOutlined,
  BankOutlined,
  CheckSquareOutlined,
  MessageOutlined
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

const SERVICE_CHANNELS = [
  '8028 Farmers Voice IVR / Call Center (8028 አጭር የስልክ መስመር)',
  '6077 Market Linkage & Price Info (6077 የገበያ ትስስር)',
  'USSD Bulk SMS Advisory Push (በአጭር ጽሁፍ የሚላክ መልዕክት)',
  'DA Tablet Voice Feedback Query (የእጅ ስልክ የድምፅ መልዕክት)'
];

const INQUIRY_CATEGORIES = [
  'Agronomic Package & Seeding Rate (የአዝርዕት አሰራር)',
  'Fertilizer Application & Timing (የማዳበሪያ አጠቃቀም)',
  'Pest / Disease Outbreak & Control (ተባይና በሽታ መከላከል)',
  'Market Price & Commodity Linkage (የገበያ ዋጋና ትስስር)',
  'Weather Forecast & Rainfall Advisory (የአየር ሁኔታ ትንበያ)',
  'Irrigation Water Management (የመስኖ ውሃ አጠቃቀም)'
];

const INITIAL_HOTLINE_LOGS = [
  {
    id: '1',
    ticket_code: 'TKT-8028-0912',
    service_channel: '8028 Farmers Voice IVR / Call Center (8028 አጭር የስልክ መስመር)',
    inquiry_category: 'Fertilizer Application & Timing (የማዳበሪያ አጠቃቀም)',
    caller_phone: '+251 911 *** 456',
    call_date: '2026-08-15',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    caller_gender: 'Male',
    caller_category: 'Male Head (አባወራ)',
    male_callers: 1420,
    female_callers: 380,
    married_women_callers: 310,
    youth_callers: 520,
    investors_callers: 45,
    resolution_status: 'Resolved',
    advisory_summary: 'Inquiries regarding split urea top-dress timing for Quncho Teff following recent heavy rainfall events.',
    zone: 'East Gojjam',
    woreda: 'Dejen',
    kebele: 'Kurar'
  },
  {
    id: '2',
    ticket_code: 'TKT-6077-4481',
    service_channel: '6077 Market Linkage & Price Info (6077 የገበያ ትስስር)',
    inquiry_category: 'Market Price & Commodity Linkage (የገበያ ዋጋና ትስስር)',
    caller_phone: '+251 922 *** 890',
    call_date: '2026-08-21',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    caller_gender: 'Female',
    caller_category: 'Female Head (እማወራ)',
    male_callers: 980,
    female_callers: 410,
    married_women_fetchers: 350,
    youth_callers: 310,
    investors_callers: 28,
    resolution_status: 'Resolved',
    advisory_summary: 'Market price quotation requests for malted barley and white sesame across regional wholesale hubs.',
    zone: 'South Gondar',
    woreda: 'Fogera',
    kebele: 'Woreta Zuria'
  },
  {
    id: '3',
    ticket_code: 'TKT-8028-9921',
    service_channel: 'USSD Bulk SMS Advisory Push (በአጭር ጽሁፍ የሚላክ መልዕክት)',
    inquiry_category: 'Pest / Disease Outbreak & Control (ተባይና በሽታ መከላከል)',
    caller_phone: '+251 930 *** 123',
    call_date: '2026-08-27',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    caller_gender: 'Male',
    caller_category: 'Youth Smallholder (ወጣት)',
    male_callers: 1150,
    female_callers: 290,
    married_women_fetchers: 240,
    youth_callers: 680,
    investors_callers: 15,
    resolution_status: 'Pending Escalation',
    advisory_summary: 'Fall Armyworm outbreak alert broadcasted to 2,360 maize farmers with immediate control measures.',
    zone: 'West Gojjam',
    woreda: 'Bure',
    kebele: 'Alefa'
  }
];

function HotlineAdvisoryContent() {
  const { message } = App.useApp();

  const [logs, setLogs] = useState(INITIAL_HOTLINE_LOGS);
  const [isFetching, setIsFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [channelFilter, setChannelFilter] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [fiscalYearFilter, setFiscalYearFilter] = useState(null);
  const [seasonFilter, setSeasonFilter] = useState(null);
  const [zoneFilter, setZoneFilter] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);
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
      if (editingLog) {
        const initForm = async () => {
          const zoneMatch = zones.find(
            (z) => z.name === editingLog.zone || z.id === editingLog.zone_id
          );
          if (zoneMatch) {
            try {
              const wRes = locationApi?.getWoredas ? await locationApi.getWoredas(zoneMatch.id) : null;
              const wList = wRes?.data?.data?.data || wRes?.data?.data || [];
              setWoredas(wList);

              const woredaMatch = wList.find(
                (w) => w.name === editingLog.woreda || w.id === editingLog.woreda_id
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
            ticket_code: editingLog.ticket_code,
            service_channel: editingLog.service_channel,
            inquiry_category: editingLog.inquiry_category,
            caller_phone: editingLog.caller_phone,
            call_date: editingLog.call_date ? dayjs(editingLog.call_date) : dayjs(),
            fiscal_year: editingLog.fiscal_year || '2019 E.C.',
            season: editingLog.season || 'Meher (መኸር)',
            male_callers: Number(editingLog.male_callers) || 0,
            female_callers: Number(editingLog.female_callers) || 0,
            married_women_callers: Number(editingLog.married_women_callers || editingLog.married_women_fetchers) || 0,
            youth_callers: Number(editingLog.youth_callers) || 0,
            investors_callers: Number(editingLog.investors_callers) || 0,
            advisory_summary: editingLog.advisory_summary,
            zone_id: editingLog.zone_id || zoneMatch?.id || editingLog.zone,
            woreda_id: editingLog.woreda_id || editingLog.woreda,
            kebele_id: editingLog.kebele_id || editingLog.kebele
          });
        };
        initForm();
      } else {
        form.resetFields();
        form.setFieldsValue({
          service_channel: '8028 Farmers Voice IVR / Call Center (8028 አጭር የስልክ መስመር)',
          inquiry_category: 'Fertilizer Application & Timing (የማዳበሪያ አጠቃቀም)',
          call_date: dayjs(),
          fiscal_year: '2019 E.C.',
          season: 'Meher (መኸር)',
          male_callers: 0,
          female_callers: 0,
          married_women_callers: 0,
          youth_callers: 0,
          investors_callers: 0
        });
        setWoredas([]);
        setKebeles([]);
      }
    }
  }, [isModalOpen, editingLog, form, zones]);

  const loadData = async () => {
    setIsFetching(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      message.success('Helpline & Info logs refreshed');
    } catch {
      message.error('Failed to refresh data');
    } finally {
      setIsFetching(false);
    }
  };

  // Direct In-Place Status Update without Opening the Form
  const handleQuickStatusChange = (recordId, newStatus) => {
    setLogs((prev) =>
      prev.map((l) => (l.id === recordId ? { ...l, resolution_status: newStatus } : l))
    );
    message.success(`Ticket status updated to "${newStatus}"`);
  };

  // Filter pipeline
  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      const code = extractName(l.ticket_code).toLowerCase();
      const channel = extractName(l.service_channel).toLowerCase();
      const cat = extractName(l.inquiry_category).toLowerCase();
      const phone = extractName(l.caller_phone).toLowerCase();
      const kebele = extractName(l.kebele).toLowerCase();
      const woreda = extractName(l.woreda).toLowerCase();
      const zone = extractName(l.zone).toLowerCase();
      const q = searchTerm.toLowerCase();

      const matchesSearch =
        code.includes(q) || channel.includes(q) || cat.includes(q) || phone.includes(q) || kebele.includes(q) || woreda.includes(q) || zone.includes(q);
      const matchesChannel = channelFilter ? l.service_channel === channelFilter : true;
      const matchesCategory = categoryFilter ? l.inquiry_category === categoryFilter : true;
      const matchesFY = fiscalYearFilter ? l.fiscal_year === fiscalYearFilter : true;
      const matchesSeason = seasonFilter ? l.season === seasonFilter : true;
      const matchesZone = zoneFilter ? zone === zoneFilter.toLowerCase() : true;

      return matchesSearch && matchesChannel && matchesCategory && matchesFY && matchesSeason && matchesZone;
    });
  }, [logs, searchTerm, channelFilter, categoryFilter, fiscalYearFilter, seasonFilter, zoneFilter]);

  // Statistics Calculation
  const stats = useMemo(() => {
    const totalTickets = filteredLogs.length;
    const maleCallers = filteredLogs.reduce((acc, l) => acc + (Number(l.male_callers) || 0), 0);
    const femaleCallers = filteredLogs.reduce((acc, l) => acc + (Number(l.female_callers) || 0), 0);
    const marriedWomen = filteredLogs.reduce((acc, l) => acc + (Number(l.married_women_callers || l.married_women_fetchers) || 0), 0);
    const youth = filteredLogs.reduce((acc, l) => acc + (Number(l.youth_callers) || 0), 0);
    const investors = filteredLogs.reduce((acc, l) => acc + (Number(l.investors_callers) || 0), 0);

    const totalBeneficiaries = maleCallers + femaleCallers + marriedWomen + youth + investors;
    const totalWomen = femaleCallers + marriedWomen;
    const womenRatio = totalBeneficiaries > 0 ? ((totalWomen / totalBeneficiaries) * 100).toFixed(1) : 0;

    return {
      totalTickets,
      totalBeneficiaries,
      maleCallers,
      femaleCallers,
      marriedWomen,
      totalWomen,
      youth,
      investors,
      womenRatio
    };
  }, [filteredLogs]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setChannelFilter(null);
    setCategoryFilter(null);
    setFiscalYearFilter(null);
    setSeasonFilter(null);
    setZoneFilter(null);
  };

  const handleOpenModal = (record = null) => {
    setEditingLog(record);
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
        call_date: values.call_date ? values.call_date.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
        zone: selectedZone?.name || selectedZone?.zone_name || values.zone_id,
        woreda: selectedWoreda?.name || selectedWoreda?.woreda_name || values.woreda_id,
        kebele: selectedKebele?.name || selectedKebele?.kebele_name || values.kebele_id
      };

      if (editingLog) {
        setLogs((prev) =>
          prev.map((item) =>
            item.id === editingLog.id ? { ...item, ...payload, resolution_status: editingLog.resolution_status } : item
          )
        );
        message.success('Helpline advisory record updated successfully');
      } else {
        const newRecord = {
          ...payload,
          id: Date.now().toString(),
          ticket_code: values.ticket_code || `TKT-${Date.now().toString().slice(-4)}`,
          resolution_status: 'Resolved'
        };
        setLogs((prev) => [newRecord, ...prev]);
        message.success('New helpline advisory logged successfully');
      }
      setIsModalOpen(false);
    } catch (error) {
      message.error(error?.response?.data?.message || error.message || 'Failed to save advisory record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    setLogs((prev) => prev.filter((item) => item.id !== id));
    message.success('Helpline advisory record removed');
  };

  const exportToCSV = () => {
    if (!filteredLogs.length) {
      message.warning('No helpline records available to export');
      return;
    }
    const headers = [
      'Ticket Code,Service Channel,Inquiry Category,Caller Phone,Date,FY,Season,Zone,Woreda,Kebele,Male Callers (አባወራ),Female Callers (እማወራ),Married Women (ባለትዳር),Youth (ወጣቶች),Investors (ባለሃብቶች),Total Beneficiaries,Status'
    ];
    const rows = filteredLogs.map((l) => {
      const total =
        (Number(l.male_callers) || 0) +
        (Number(l.female_callers) || 0) +
        (Number(l.married_women_callers || l.married_women_fetchers) || 0) +
        (Number(l.youth_callers) || 0) +
        (Number(l.investors_callers) || 0);

      return [
        `"${l.ticket_code || ''}"`,
        `"${l.service_channel || ''}"`,
        `"${l.inquiry_category || ''}"`,
        `"${l.caller_phone || ''}"`,
        `"${l.call_date || ''}"`,
        `"${l.fiscal_year || ''}"`,
        `"${l.season || ''}"`,
        `"${extractName(l.zone)}"`,
        `"${extractName(l.woreda)}"`,
        `"${extractName(l.kebele)}"`,
        l.male_callers || 0,
        l.female_callers || 0,
        l.married_women_callers || l.married_women_fetchers || 0,
        l.youth_callers || 0,
        l.investors_callers || 0,
        total,
        `"${l.resolution_status || ''}"`
      ].join(',');
    });

    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Indicator_Hotline_Advisory_8028_6077_${Date.now()}.csv`;
    a.click();
    message.success('Report Form 2019 exported successfully');
  };

  const columns = [
    {
      title: 'Ticket Code & Channel',
      key: 'ticket_info',
      width: 240,
      render: (_, r) => (
        <div>
          <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{r.ticket_code}</strong>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>
            Phone: <span style={{ fontFamily: 'monospace' }}>{r.caller_phone}</span> | {r.call_date}
          </div>
        </div>
      )
    },
    {
      title: 'Service Channel',
      dataIndex: 'service_channel',
      key: 'service_channel',
      width: 210,
      render: (channel) => {
        let color = 'default';
        if (channel?.includes('8028')) color = 'green';
        if (channel?.includes('6077')) color = 'gold';
        if (channel?.includes('USSD')) color = 'blue';
        return <Tag color={color}>{channel}</Tag>;
      }
    },
    {
      title: 'Inquiry Category',
      dataIndex: 'inquiry_category',
      key: 'inquiry_category',
      width: 220,
      render: (cat) => <span style={{ fontWeight: 500, color: '#262626' }}>{cat}</span>
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
      title: 'Beneficiaries Reached',
      key: 'beneficiaries_breakdown',
      width: 230,
      render: (_, r) => {
        const total =
          (Number(r.male_callers) || 0) +
          (Number(r.female_callers) || 0) +
          (Number(r.married_women_callers || r.married_women_fetchers) || 0) +
          (Number(r.youth_callers) || 0) +
          (Number(r.investors_callers) || 0);

        return (
          <div style={{ fontSize: 11 }}>
            <div>
              Total: <strong style={{ color: '#1a5f2c' }}>{total.toLocaleString()} Callers</strong>
            </div>
            <div style={{ color: '#8c8c8c' }}>
              <span>አባወራ: {r.male_callers || 0}</span> | <span>እማወራ: {r.female_callers || 0}</span> | <span>ባለትዳር: {r.married_women_callers || r.married_women_fetchers || 0}</span>
            </div>
          </div>
        );
      }
    },
    {
      title: 'Ticket Status (In-Place Edit)',
      dataIndex: 'resolution_status',
      key: 'resolution_status',
      width: 190,
      render: (status, record) => (
        <Select
          value={status || 'Resolved'}
          onChange={(newVal) => handleQuickStatusChange(record.id, newVal)}
          style={{ width: '100%' }}
          size="small"
        >
          <Option value="Resolved">
            <Tag color="success" icon={<CheckCircleOutlined />} style={{ margin: 0 }}>
              Resolved
            </Tag>
          </Option>
          <Option value="Pending Escalation">
            <Tag color="warning" icon={<ClockCircleOutlined />} style={{ margin: 0 }}>
              Pending Escalation
            </Tag>
          </Option>
          <Option value="Open / Active">
            <Tag color="processing" icon={<ClockCircleOutlined />} style={{ margin: 0 }}>
              Open / Active
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
          <Tooltip title="View Advisory Dossier">
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: '#1890ff' }} />}
              onClick={() => {
                setSelectedLog(record);
                setIsDossierOpen(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Edit Advisory Log">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: '#52c41a' }} />}
              onClick={() => handleOpenModal(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Record">
            <Popconfirm
              title="Delete helpline record?"
              description="Are you sure you want to remove this helpline advisory log?"
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
        <Breadcrumb.Item>Helpline & Info Services (8028 Agro / 6077 Market)</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#1a5f2c', fontFamily: "'Times New Roman', Times, serif" }}>
            Helpline & Info Services (8028 አጭር የስልክ መስመር እና 6077 የገበያ ትስስር)
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            National agricultural IVR call center queries, market price updates, and USSD advisory broadcast logs
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
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Total Callers Reached</span>}
              value={stats.totalBeneficiaries}
              prefix={<CustomerServiceOutlined style={{ color: '#1a5f2c', marginRight: 8 }} />}
              valueStyle={{ color: '#1a5f2c', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Advisory Tickets: <strong style={{ color: '#262626' }}>{stats.totalTickets} logs</strong>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #1890ff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Male Callers (አባወራ)</span>}
              value={stats.maleCallers}
              prefix={<ManOutlined style={{ color: '#1890ff', marginRight: 8 }} />}
              valueStyle={{ color: '#1890ff', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Inbound IVR & USSD queries
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #722ed1', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Women Callers (እማወራ + ባለትዳር)</span>}
              value={stats.totalWomen}
              prefix={<WomanOutlined style={{ color: '#722ed1', marginRight: 8 }} />}
              valueStyle={{ color: '#722ed1', fontWeight: 'bold', fontSize: 24 }}
            />
            <Progress percent={Number(stats.womenRatio)} size="small" strokeColor="#722ed1" />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8c8c8c', marginTop: 2 }}>
              <span>Share: <strong style={{ color: '#722ed1' }}>{stats.womenRatio}%</strong></span>
              <span>እማወራ: {stats.femaleCallers} | ባለትዳር: {stats.marriedWomen}</span>
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
                placeholder="Search Ticket, Phone, or Topic..."
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: 220 }}
                allowClear
              />

              <Select
                placeholder="Service Channel"
                value={channelFilter}
                onChange={setChannelFilter}
                style={{ width: 195 }}
                allowClear
              >
                {SERVICE_CHANNELS.map((sc) => (
                  <Option key={sc} value={sc}>{sc}</Option>
                ))}
              </Select>

              <Select
                placeholder="Inquiry Category"
                value={categoryFilter}
                onChange={setCategoryFilter}
                style={{ width: 200 }}
                allowClear
              >
                {INQUIRY_CATEGORIES.map((ic) => (
                  <Option key={ic} value={ic}>{ic}</Option>
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
                {[...new Set(logs.map((l) => extractName(l.zone)))].map((z) => (
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
                disabled={!(searchTerm || channelFilter || categoryFilter || fiscalYearFilter || seasonFilter || zoneFilter)}
              >
                Reset Filters
              </Button>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => handleOpenModal(null)}
                style={{ backgroundColor: '#1a5f2c', borderColor: '#1a5f2c', fontWeight: 600 }}
              >
                Log Helpline Advisory
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Main Table */}
      <Table
        columns={columns}
        dataSource={filteredLogs}
        rowKey="id"
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} advisory tickets`
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
              {editingLog ? 'Edit Helpline Advisory Record' : 'Log Helpline & Info Service (8028/6077 መረጃ)'}
            </span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText={editingLog ? 'Update Ticket' : 'Save Advisory Ticket'}
        okButtonProps={{ style: { backgroundColor: '#1a5f2c', borderColor: '#1a5f2c' }, loading: isSubmitting }}
        width={800}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Call Center Metadata & Service Channel
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="ticket_code"
                label="Ticket / Batch Code"
                rules={[{ required: true, message: 'Ticket code required' }]}
              >
                <Input placeholder="e.g. TKT-8028-0955" />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item
                name="service_channel"
                label="ICT Service Channel"
                rules={[{ required: true, message: 'Select channel' }]}
              >
                <Select>
                  {SERVICE_CHANNELS.map((sc) => (
                    <Option key={sc} value={sc}>{sc}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="call_date"
                label="Call / Inquiry Date"
                rules={[{ required: true, message: 'Date required' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={14}>
              <Form.Item
                name="inquiry_category"
                label="Primary Inquiry Category"
                rules={[{ required: true, message: 'Select category' }]}
              >
                <Select>
                  {INQUIRY_CATEGORIES.map((ic) => (
                    <Option key={ic} value={ic}>{ic}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item
                name="caller_phone"
                label="Caller Phone Number (Masked / Direct)"
                rules={[{ required: true, message: 'Phone required' }]}
              >
                <Input placeholder="e.g. +251 911 *** 345" />
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
            Beneficiaries Reached by Cohort (ጥያቄ ያቀረቡ አርሶ አደሮች በጾታ)
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="male_callers"
                label="Male Callers (አባወራ)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="female_callers"
                label="Female Callers (እማወራ)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="married_women_callers"
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
                name="youth_callers"
                label="Youth Smallholders (ወጣቶች)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="investors_callers"
                label="Commercial Investors (ባለሃብቶች)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="advisory_summary" label="Advisory Response Provided & Key Inquiry Details">
                <TextArea rows={3} placeholder="Summarize agronomic advice given, market pricing provided, or escalation steps..." />
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

      {/* Comprehensive Advisory Dossier Modal */}
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
                  {selectedLog?.inquiry_category}
                </span>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                  Ticket: <span style={{ fontFamily: 'monospace' }}>{selectedLog?.ticket_code}</span> | Date:{' '}
                  {selectedLog?.call_date}
                </div>
              </div>
            </div>
            <div>
              <Tag
                color={
                  selectedLog?.resolution_status === 'Resolved'
                    ? 'success'
                    : selectedLog?.resolution_status === 'Pending Escalation'
                    ? 'warning'
                    : 'processing'
                }
                style={{ fontSize: 12, padding: '2px 10px', borderRadius: 12 }}
              >
                {selectedLog?.resolution_status || 'Resolved'}
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
              handleOpenModal(selectedLog);
            }}
          >
            Edit Ticket
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
        {selectedLog && (
          <div style={{ paddingTop: 8 }}>
            {/* Top Metric Strip */}
            <Row gutter={12} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f6ffed', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Total Beneficiaries</span>}
                    value={
                      (Number(selectedLog.male_callers) || 0) +
                      (Number(selectedLog.female_callers) || 0) +
                      (Number(selectedLog.married_women_callers || selectedLog.married_women_fetchers) || 0) +
                      (Number(selectedLog.youth_callers) || 0) +
                      (Number(selectedLog.investors_callers) || 0)
                    }
                    suffix={<span style={{ fontSize: 12 }}>Callers</span>}
                    valueStyle={{ fontSize: 15, fontWeight: 'bold', color: '#1a5f2c' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f0f5ff', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Service Channel</span>}
                    value={selectedLog.service_channel?.includes('8028') ? '8028 IVR' : '6077 Market'}
                    valueStyle={{ fontSize: 15, fontWeight: 'bold', color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f9f0ff', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Women Callers Share</span>}
                    value={
                      (Number(selectedLog.male_callers) || 0) +
                      (Number(selectedLog.female_callers) || 0) +
                      (Number(selectedLog.married_women_callers || selectedLog.married_women_fetchers) || 0) +
                      (Number(selectedLog.youth_callers) || 0) +
                      (Number(selectedLog.investors_callers) || 0) > 0
                        ? (
                            (((Number(selectedLog.female_callers) || 0) +
                              (Number(selectedLog.married_women_callers || selectedLog.married_women_fetchers) || 0)) /
                              ((Number(selectedLog.male_callers) || 0) +
                                (Number(selectedLog.female_callers) || 0) +
                                (Number(selectedLog.married_women_callers || selectedLog.married_women_fetchers) || 0) +
                                (Number(selectedLog.youth_callers) || 0) +
                                (Number(selectedLog.investors_callers) || 0))) *
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
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Inquiry Date</span>}
                    value={selectedLog.call_date}
                    valueStyle={{ fontSize: 14, fontWeight: 'bold', color: '#fa8c16' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* TABPANES */}
            <Tabs defaultActiveKey="1" type="card">
              {/* TAB 1: Caller Demographic Breakdown */}
              <TabPane
                tab={
                  <span>
                    <TeamOutlined />
                    Caller Demographics & Reach
                  </span>
                }
                key="1"
              >
                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }} style={{ marginBottom: 16 }}>
                  <Descriptions.Item label="Inquiry Category" span={2}>
                    <strong style={{ color: '#1a5f2c' }}>{selectedLog.inquiry_category}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Service Channel">
                    <Tag color="green">{selectedLog.service_channel}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Caller Phone Contact">
                    <span style={{ fontFamily: 'monospace' }}>{selectedLog.caller_phone}</span>
                  </Descriptions.Item>
                </Descriptions>

                <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: 16, background: '#fafafa' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1a5f2c', textTransform: 'uppercase', marginBottom: 12 }}>
                    Caller Disaggregation (ጥያቄ ያቀረቡ አርሶ አደሮች በጾታና በዕድሜ)
                  </div>
                  <Row gutter={[16, 16]}>
                    <Col span={8}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <ManOutlined style={{ color: '#1890ff', marginRight: 4 }} />
                          Male Household Heads (አባወራ)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#1890ff', marginTop: 2 }}>
                          {Number(selectedLog.male_callers || 0).toLocaleString()}
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
                          {Number(selectedLog.female_callers || 0).toLocaleString()}
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
                          {Number(selectedLog.married_women_callers || selectedLog.married_women_fetchers || 0).toLocaleString()}
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
                          {Number(selectedLog.youth_callers || 0).toLocaleString()}
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
                          {Number(selectedLog.investors_callers || 0).toLocaleString()}
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
              </TabPane>

              {/* TAB 2: Advisory Summary */}
              <TabPane
                tab={
                  <span>
                    <MessageOutlined />
                    Advisory Response & Summary
                  </span>
                }
                key="2"
              >
                <Card size="small" bordered={false} style={{ background: '#fcfdfd', border: '1px solid #e6f7ed', borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <CheckCircleOutlined style={{ color: '#1a5f2c', fontSize: 16 }} />
                    <strong style={{ color: '#1a5f2c', fontSize: 13, textTransform: 'uppercase' }}>
                      Advisory Content Delivered (የተሰጠ ምላሽና ማብራሪያ)
                    </strong>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: '#262626', lineHeight: '1.6' }}>
                    {selectedLog.advisory_summary || 'Standard call center agronomic advisory and market pricing guidance provided successfully.'}
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
                    <strong>{extractName(selectedLog.zone)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Woreda">
                    <strong>{extractName(selectedLog.woreda)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Kebele Operational Base">
                    <span style={{ color: '#1a5f2c', fontWeight: 'bold' }}>
                      {extractName(selectedLog.kebele)}
                    </span>
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
                  <Descriptions.Item label="Fiscal Year (በጀት ዓመት)">
                    <Tag color="blue" icon={<CalendarOutlined />}>
                      {selectedLog.fiscal_year || '2019 E.C.'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Production Campaign Season">
                    <strong>{selectedLog.season || 'Meher (መኸር)'}</strong>
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

export default function HotlineAdvisory() {
  return (
    <App>
      <HotlineAdvisoryContent />
    </App>
  );
}