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
  BankOutlined,
  GlobalOutlined,
  DollarOutlined,
  FileProtectOutlined,
  SolutionOutlined,
  ApartmentOutlined
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

const PARTNER_TYPES = [
  'Bilateral Donor (ሁለትዮሽ ለጋሽ)',
  'Multilateral Agency (ባለብዙ ወገን ድርጅት - UN/WB)',
  'International NGO - INGO (ዓለም አቀፍ ኤንጂኦ)',
  'Local CSO / NGO (ሀገር አቀፍ ሲቪክ ድርጅት)',
  'Academic / Research Institution (ዩኒቨርሲቲ/ምርምር ተቋም)',
  'Private Sector Consortium (የግል ባለሀብት ማህበር)'
];

const SUPPORT_DOMAINS = [
  'Climate-Smart Agriculture & Watershed (አየር ንብረት ተከላካይ ግብርና)',
  'Irrigation Infrastructure & Water Mgmt (መስኖ ልማት)',
  'Digital Extension & ICT Advisory (ዲጂታል ኤክስቴንሽን)',
  'Seed System Strengthening (የምርጥ ዘር ስርዓት)',
  'Livestock, Forage & Nutrition (እንስሳት ሀብትና ስነ-ምግብ)',
  'Institutional Capacity Building (የአቅም ግንባታ)'
];

const INITIAL_PARTNERS = [
  {
    id: '1',
    partner_code: 'DP-2019-AGRA-01',
    partner_name: 'Alliance for a Green Revolution in Africa (AGRA)',
    partner_type: 'International NGO - INGO (ዓለም አቀፍ ኤንጂኦ)',
    support_domain: 'Climate-Smart Agriculture & Watershed (አየር ንብረት ተከላካይ ግብርና)',
    country_rep: 'Dr. Kebebew Assefa',
    email_contact: 'contact@agra.org',
    phone_contact: '+251 116 123 456',
    mou_signing_date: '2024-01-15',
    mou_expiry_date: '2028-01-15',
    committed_budget_usd: 12500000,
    disbursed_budget_usd: 8200000,
    partnership_status: 'Active Partnership',
    project_summary: 'Supporting smallholder resilience, input systems, and last-mile seed distribution across highland clusters.',
    zone: 'East Gojjam',
    woreda: 'Dejen',
    kebele: 'Kurar'
  },
  {
    id: '2',
    partner_code: 'DP-2019-IFAD-04',
    partner_name: 'International Fund for Agricultural Development (IFAD)',
    partner_type: 'Multilateral Agency (ባለብዙ ወገን ድርጅት - UN/WB)',
    support_domain: 'Irrigation Infrastructure & Water Mgmt (መስኖ ልማት)',
    country_rep: 'Mr. Anthony Omwansa',
    email_contact: 'ifad-ethiopia@ifad.org',
    phone_contact: '+251 115 789 012',
    mou_signing_date: '2023-06-10',
    mou_expiry_date: '2027-06-10',
    committed_budget_usd: 35000000,
    disbursed_budget_usd: 21000000,
    partnership_status: 'Active Partnership',
    project_summary: 'Participatory Small-scale Irrigation Development Programme (PSIDP) supporting community water management.',
    zone: 'South Gondar',
    woreda: 'Fogera',
    kebele: 'Woreta Zuria'
  },
  {
    id: '3',
    partner_code: 'DP-2019-SG-09',
    partner_name: 'Sasakawa Africa Association (SAA)',
    partner_type: 'International NGO - INGO (ዓለም አቀፍ ኤንጂኦ)',
    support_domain: 'Digital Extension & ICT Advisory (ዲጂታል ኤክስቴንሽን)',
    country_rep: 'Dr. Rosinah Mbadlanyana',
    email_contact: 'saa-ethiopia@saa-safe.org',
    phone_contact: '+251 114 333 222',
    mou_signing_date: '2022-09-01',
    mou_expiry_date: '2026-09-01',
    committed_budget_usd: 6800000,
    disbursed_budget_usd: 5100000,
    partnership_status: 'Active Partnership',
    project_summary: 'Regenerative agriculture promotion, farmers training center (FTC) upgrading, and digital extension tool piloting.',
    zone: 'West Gojjam',
    woreda: 'Bure',
    kebele: 'Alefa'
  }
];

function PartnerRegistryContent() {
  const { message } = App.useApp();

  const [partners, setPartners] = useState(INITIAL_PARTNERS);
  const [isFetching, setIsFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState(null);
  const [domainFilter, setDomainFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [zoneFilter, setZoneFilter] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [selectedPartner, setSelectedPartner] = useState(null);
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
      if (editingPartner) {
        const initForm = async () => {
          const zoneMatch = zones.find(
            (z) => z.name === editingPartner.zone || z.id === editingPartner.zone_id
          );
          if (zoneMatch) {
            try {
              const wRes = locationApi?.getWoredas ? await locationApi.getWoredas(zoneMatch.id) : null;
              const wList = wRes?.data?.data?.data || wRes?.data?.data || [];
              setWoredas(wList);

              const woredaMatch = wList.find(
                (w) => w.name === editingPartner.woreda || w.id === editingPartner.woreda_id
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
            partner_code: editingPartner.partner_code,
            partner_name: editingPartner.partner_name,
            partner_type: editingPartner.partner_type,
            support_domain: editingPartner.support_domain,
            country_rep: editingPartner.country_rep,
            email_contact: editingPartner.email_contact,
            phone_contact: editingPartner.phone_contact,
            mou_signing_date: editingPartner.mou_signing_date ? dayjs(editingPartner.mou_signing_date) : dayjs(),
            mou_expiry_date: editingPartner.mou_expiry_date ? dayjs(editingPartner.mou_expiry_date) : dayjs().add(3, 'year'),
            committed_budget_usd: Number(editingPartner.committed_budget_usd) || 0,
            disbursed_budget_usd: Number(editingPartner.disbursed_budget_usd) || 0,
            partnership_status: editingPartner.partnership_status || 'Active Partnership',
            project_summary: editingPartner.project_summary,
            zone_id: editingPartner.zone_id || zoneMatch?.id || editingPartner.zone,
            woreda_id: editingPartner.woreda_id || editingPartner.woreda,
            kebele_id: editingPartner.kebele_id || editingPartner.kebele
          });
        };
        initForm();
      } else {
        form.resetFields();
        form.setFieldsValue({
          partner_type: 'International NGO - INGO (ዓለም አቀፍ ኤንጂኦ)',
          support_domain: 'Climate-Smart Agriculture & Watershed (አየር ንብረት ተከላካይ ግብርና)',
          mou_signing_date: dayjs(),
          mou_expiry_date: dayjs().add(3, 'year'),
          committed_budget_usd: 1000000,
          disbursed_budget_usd: 500000,
          partnership_status: 'Active Partnership'
        });
        setWoredas([]);
        setKebeles([]);
      }
    }
  }, [isModalOpen, editingPartner, form, zones]);

  const loadData = async () => {
    setIsFetching(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      message.success('Partner & stakeholder registry refreshed');
    } catch {
      message.error('Failed to refresh data');
    } finally {
      setIsFetching(false);
    }
  };

  // Direct In-Place Status Update without Opening the Form
  const handleQuickStatusChange = (recordId, newStatus) => {
    setPartners((prev) =>
      prev.map((p) => (p.id === recordId ? { ...p, partnership_status: newStatus } : p))
    );
    message.success(`Partnership status updated to "${newStatus}"`);
  };

  // Filter pipeline
  const filteredPartners = useMemo(() => {
    return partners.filter((p) => {
      const code = extractName(p.partner_code).toLowerCase();
      const name = extractName(p.partner_name).toLowerCase();
      const rep = extractName(p.country_rep).toLowerCase();
      const kebele = extractName(p.kebele).toLowerCase();
      const woreda = extractName(p.woreda).toLowerCase();
      const zone = extractName(p.zone).toLowerCase();
      const q = searchTerm.toLowerCase();

      const matchesSearch =
        code.includes(q) || name.includes(q) || rep.includes(q) || kebele.includes(q) || woreda.includes(q) || zone.includes(q);
      const matchesType = typeFilter ? p.partner_type === typeFilter : true;
      const matchesDomain = domainFilter ? p.support_domain === domainFilter : true;
      const matchesStatus = statusFilter ? p.partnership_status === statusFilter : true;
      const matchesZone = zoneFilter ? zone === zoneFilter.toLowerCase() : true;

      return matchesSearch && matchesType && matchesDomain && matchesStatus && matchesZone;
    });
  }, [partners, searchTerm, typeFilter, domainFilter, statusFilter, zoneFilter]);

  // Statistics Calculation
  const stats = useMemo(() => {
    const totalPartners = filteredPartners.length;
    const activePartners = filteredPartners.filter((p) => p.partnership_status === 'Active Partnership').length;
    const totalCommitted = filteredPartners.reduce((acc, p) => acc + (Number(p.committed_budget_usd) || 0), 0);
    const totalDisbursed = filteredPartners.reduce((acc, p) => acc + (Number(p.disbursed_budget_usd) || 0), 0);
    const disbursementRate = totalCommitted > 0 ? ((totalDisbursed / totalCommitted) * 100).toFixed(1) : 0;

    return {
      totalPartners,
      activePartners,
      totalCommitted,
      totalDisbursed,
      disbursementRate
    };
  }, [filteredPartners]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setTypeFilter(null);
    setDomainFilter(null);
    setStatusFilter(null);
    setZoneFilter(null);
  };

  const handleOpenModal = (record = null) => {
    setEditingPartner(record);
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
        mou_signing_date: values.mou_signing_date ? values.mou_signing_date.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
        mou_expiry_date: values.mou_expiry_date ? values.mou_expiry_date.format('YYYY-MM-DD') : dayjs().add(3, 'year').format('YYYY-MM-DD'),
        zone: selectedZone?.name || selectedZone?.zone_name || values.zone_id,
        woreda: selectedWoreda?.name || selectedWoreda?.woreda_name || values.woreda_id,
        kebele: selectedKebele?.name || selectedKebele?.kebele_name || values.kebele_id
      };

      if (editingPartner) {
        setPartners((prev) =>
          prev.map((item) =>
            item.id === editingPartner.id ? { ...item, ...payload, partnership_status: editingPartner.partnership_status } : item
          )
        );
        message.success('Partner organization record updated successfully');
      } else {
        const newRecord = {
          ...payload,
          id: Date.now().toString(),
          partner_code: values.partner_code || `DP-${Date.now().toString().slice(-4)}`,
          partnership_status: 'Active Partnership'
        };
        setPartners((prev) => [newRecord, ...prev]);
        message.success('New development partner registered successfully');
      }
      setIsModalOpen(false);
    } catch (error) {
      message.error(error?.response?.data?.message || error.message || 'Failed to save partner record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    setPartners((prev) => prev.filter((item) => item.id !== id));
    message.success('Partner organization record removed');
  };

  const exportToCSV = () => {
    if (!filteredPartners.length) {
      message.warning('No partner records available to export');
      return;
    }
    const headers = [
      'Partner Code,Partner Name,Partner Type,Support Domain,Country Representative,Email,Phone,MoU Start Date,MoU Expiry Date,Committed Budget (USD),Disbursed Budget (USD),Zone,Woreda,Kebele,Status'
    ];
    const rows = filteredPartners.map((p) => [
      `"${p.partner_code || ''}"`,
      `"${p.partner_name || ''}"`,
      `"${p.partner_type || ''}"`,
      `"${p.support_domain || ''}"`,
      `"${p.country_rep || ''}"`,
      `"${p.email_contact || ''}"`,
      `"${p.phone_contact || ''}"`,
      `"${p.mou_signing_date || ''}"`,
      `"${p.mou_expiry_date || ''}"`,
      p.committed_budget_usd || 0,
      p.disbursed_budget_usd || 0,
      `"${extractName(p.zone)}"`,
      `"${extractName(p.woreda)}"`,
      `"${extractName(p.kebele)}"`,
      `"${p.partnership_status || ''}"`
    ].join(','));

    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Partner_Stakeholder_Registry_${Date.now()}.csv`;
    a.click();
    message.success('Partner registry report exported successfully');
  };

  const columns = [
    {
      title: 'Partner Code & Organization Name',
      key: 'partner_info',
      width: 270,
      render: (_, r) => (
        <div>
          <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{r.partner_name}</strong>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>
            Code: <span style={{ fontFamily: 'monospace' }}>{r.partner_code}</span> | Rep: {r.country_rep}
          </div>
        </div>
      )
    },
    {
      title: 'Partner Category',
      dataIndex: 'partner_type',
      key: 'partner_type',
      width: 200,
      render: (type) => {
        let color = 'default';
        if (type?.includes('Bilateral')) color = 'purple';
        if (type?.includes('Multilateral')) color = 'geekblue';
        if (type?.includes('INGO')) color = 'green';
        if (type?.includes('Academic')) color = 'cyan';
        return <Tag color={color}>{type}</Tag>;
      }
    },
    {
      title: 'Support Domain',
      dataIndex: 'support_domain',
      key: 'support_domain',
      width: 220,
      render: (dom) => <span style={{ fontWeight: 500, color: '#262626' }}>{dom}</span>
    },
    {
      title: 'Station (Coverage Scope)',
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
      title: 'Committed Budget (USD)',
      dataIndex: 'committed_budget_usd',
      key: 'committed_budget_usd',
      align: 'right',
      width: 170,
      sorter: (a, b) => (Number(a.committed_budget_usd) || 0) - (Number(b.committed_budget_usd) || 0),
      render: (val) => (
        <span style={{ fontWeight: 600, color: '#1a5f2c' }}>
          ${Number(val || 0).toLocaleString()}
        </span>
      )
    },
    {
      title: 'Partnership Status (In-Place Edit)',
      dataIndex: 'partnership_status',
      key: 'partnership_status',
      width: 190,
      render: (status, record) => (
        <Select
          value={status || 'Active Partnership'}
          onChange={(newVal) => handleQuickStatusChange(record.id, newVal)}
          style={{ width: '100%' }}
          size="small"
        >
          <Option value="Active Partnership">
            <Tag color="success" icon={<CheckCircleOutlined />} style={{ margin: 0 }}>
              Active
            </Tag>
          </Option>
          <Option value="MoU Renewal Pending">
            <Tag color="warning" icon={<ClockCircleOutlined />} style={{ margin: 0 }}>
              MoU Renewal
            </Tag>
          </Option>
          <Option value="Completed / Closed">
            <Tag color="default" icon={<ClockCircleOutlined />} style={{ margin: 0 }}>
              Closed
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
          <Tooltip title="View Partner Dossier">
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: '#1890ff' }} />}
              onClick={() => {
                setSelectedPartner(record);
                setIsDossierOpen(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Edit Partner Record">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: '#52c41a' }} />}
              onClick={() => handleOpenModal(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Record">
            <Popconfirm
              title="Delete partner record?"
              description="Are you sure you want to remove this partner organization?"
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
        <Breadcrumb.Item>2. Research, Colleges & Development Partners</Breadcrumb.Item>
        <Breadcrumb.Item>Partner & Stakeholder Registry</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#1a5f2c', fontFamily: "'Times New Roman', Times, serif" }}>
            Partner & Stakeholder Registry (የልማት አጋሮችና ባለድርሻ አካላት ማህደር)
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Coordinating bilateral donors, international NGOs, multilateral institutions, and research partners across national agricultural projects
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
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Total Registered Partners</span>}
              value={stats.totalPartners}
              prefix={<BankOutlined style={{ color: '#1a5f2c', marginRight: 8 }} />}
              valueStyle={{ color: '#1a5f2c', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Active Partnerships: <strong style={{ color: '#262626' }}>{stats.activePartners} active</strong>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #1890ff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Total Committed Budget (USD)</span>}
              value={stats.totalCommitted}
              prefix={<DollarOutlined style={{ color: '#1890ff', marginRight: 8 }} />}
              formatter={(val) => `$${Number(val).toLocaleString()}`}
              valueStyle={{ color: '#1890ff', fontWeight: 'bold', fontSize: 22 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Multi-year project resource allocation
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #722ed1', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Total Disbursed Budget (USD)</span>}
              value={stats.totalDisbursed}
              prefix={<GlobalOutlined style={{ color: '#722ed1', marginRight: 8 }} />}
              formatter={(val) => `$${Number(val).toLocaleString()}`}
              valueStyle={{ color: '#722ed1', fontWeight: 'bold', fontSize: 22 }}
            />
            <Progress percent={Number(stats.disbursementRate)} size="small" strokeColor="#722ed1" />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8c8c8c', marginTop: 2 }}>
              <span>Disbursement Rate: <strong style={{ color: '#722ed1' }}>{stats.disbursementRate}%</strong></span>
              <span>Target: &gt; 75%</span>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #fa8c16', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Strategic Support Domains</span>}
              value={SUPPORT_DOMAINS.length}
              prefix={<ApartmentOutlined style={{ color: '#fa8c16', marginRight: 8 }} />}
              valueStyle={{ color: '#fa8c16', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Key sectoral cooperation pillars
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
                placeholder="Search Partner Name, Code, or Rep..."
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: 220 }}
                allowClear
              />

              <Select
                placeholder="Partner Category"
                value={typeFilter}
                onChange={setTypeFilter}
                style={{ width: 195 }}
                allowClear
              >
                {PARTNER_TYPES.map((pt) => (
                  <Option key={pt} value={pt}>{pt}</Option>
                ))}
              </Select>

              <Select
                placeholder="Support Domain"
                value={domainFilter}
                onChange={setDomainFilter}
                style={{ width: 210 }}
                allowClear
              >
                {SUPPORT_DOMAINS.map((sd) => (
                  <Option key={sd} value={sd}>{sd}</Option>
                ))}
              </Select>

              <Select
                placeholder="Partnership Status"
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: 165 }}
                allowClear
              >
                <Option value="Active Partnership">Active</Option>
                <Option value="MoU Renewal Pending">MoU Renewal</Option>
                <Option value="Completed / Closed">Closed</Option>
              </Select>

              <Select
                placeholder="Filter by Zone"
                value={zoneFilter}
                onChange={setZoneFilter}
                style={{ width: 150 }}
                allowClear
              >
                {[...new Set(partners.map((p) => extractName(p.zone)))].map((z) => (
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
                Export Registry CSV
              </Button>

              <Button
                icon={<ClearOutlined />}
                onClick={handleResetFilters}
                disabled={!(searchTerm || typeFilter || domainFilter || statusFilter || zoneFilter)}
              >
                Reset Filters
              </Button>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => handleOpenModal(null)}
                style={{ backgroundColor: '#1a5f2c', borderColor: '#1a5f2c', fontWeight: 600 }}
              >
                Register Partner
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Main Table */}
      <Table
        columns={columns}
        dataSource={filteredPartners}
        rowKey="id"
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} partner organizations`
        }}
        scroll={{ x: 1350 }}
        bordered
        size="middle"
      />

      {/* Registration / Edit Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BankOutlined style={{ color: '#1a5f2c', fontSize: 20 }} />
            <span style={{ color: '#1a5f2c', fontWeight: 'bold', fontFamily: "'Times New Roman', Times, serif", fontSize: 17 }}>
              {editingPartner ? 'Edit Development Partner Record' : 'Register Development Partner / Stakeholder (የልማት አጋር ምዝገባ)'}
            </span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText={editingPartner ? 'Update Partner' : 'Save Partner Record'}
        okButtonProps={{ style: { backgroundColor: '#1a5f2c', borderColor: '#1a5f2c' }, loading: isSubmitting }}
        width={800}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Organization Identification & Category
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="partner_code"
                label="Partner Code"
                rules={[{ required: true, message: 'Code required' }]}
              >
                <Input placeholder="e.g. DP-2019-AGRA-08" />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item
                name="partner_name"
                label="Partner Organization Name"
                rules={[{ required: true, message: 'Organization name required' }]}
              >
                <Input placeholder="e.g. Alliance for a Green Revolution in Africa" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="partner_type"
                label="Partner Category"
                rules={[{ required: true, message: 'Select partner type' }]}
              >
                <Select>
                  {PARTNER_TYPES.map((pt) => (
                    <Option key={pt} value={pt}>{pt}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="support_domain"
                label="Strategic Support Domain"
                rules={[{ required: true, message: 'Select domain' }]}
              >
                <Select>
                  {SUPPORT_DOMAINS.map((sd) => (
                    <Option key={sd} value={sd}>{sd}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Representative & Contact Details
          </Divider>
          <Row gutter={16}>
            <Col span={10}>
              <Form.Item
                name="country_rep"
                label="Country Director / Representative"
                rules={[{ required: true, message: 'Representative required' }]}
              >
                <Input placeholder="e.g. Dr. Kebebew Assefa" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="email_contact"
                label="Official Email Address"
                rules={[{ required: true, message: 'Email required' }]}
              >
                <Input placeholder="contact@organization.org" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="phone_contact"
                label="Office Telephone"
                rules={[{ required: true, message: 'Phone required' }]}
              >
                <Input placeholder="+251 11..." />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            MoU Schedule & Financial Commitments (USD)
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="mou_signing_date"
                label="MoU Signing Date"
                rules={[{ required: true, message: 'Start date required' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="mou_expiry_date"
                label="MoU Expiry Date"
                rules={[{ required: true, message: 'Expiry date required' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="partnership_status"
                label="Partnership Status"
                rules={[{ required: true }]}
              >
                <Select>
                  <Option value="Active Partnership">Active Partnership</Option>
                  <Option value="MoU Renewal Pending">MoU Renewal Pending</Option>
                  <Option value="Completed / Closed">Completed / Closed</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="committed_budget_usd"
                label="Total Committed Budget (USD)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={(value) => value.replace(/\$\s?|(,*)/g, '')} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="disbursed_budget_usd"
                label="Total Disbursed Budget (USD)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={(value) => value.replace(/\$\s?|(,*)/g, '')} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="project_summary" label="Project Overview & Strategic Objectives">
                <TextArea rows={3} placeholder="Summarize partnership scope, project deliverables, and geographical focus..." />
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

      {/* Comprehensive Partner Dossier Modal */}
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
                <BankOutlined />
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
                  {selectedPartner?.partner_name}
                </span>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                  Code: <span style={{ fontFamily: 'monospace' }}>{selectedPartner?.partner_code}</span> | Rep:{' '}
                  {selectedPartner?.country_rep}
                </div>
              </div>
            </div>
            <div>
              <Tag
                color={selectedPartner?.partnership_status === 'Active Partnership' ? 'success' : 'warning'}
                icon={selectedPartner?.partnership_status === 'Active Partnership' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                style={{ fontSize: 12, padding: '2px 10px', borderRadius: 12 }}
              >
                {selectedPartner?.partnership_status || 'Active'}
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
              handleOpenModal(selectedPartner);
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
        {selectedPartner && (
          <div style={{ paddingTop: 8 }}>
            {/* Top Metric Strip */}
            <Row gutter={12} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f6ffed', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Committed Budget</span>}
                    value={selectedPartner.committed_budget_usd || 0}
                    prefix="$"
                    formatter={(val) => Number(val).toLocaleString()}
                    valueStyle={{ fontSize: 14, fontWeight: 'bold', color: '#1a5f2c' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f0f5ff', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Disbursed Budget</span>}
                    value={selectedPartner.disbursed_budget_usd || 0}
                    prefix="$"
                    formatter={(val) => Number(val).toLocaleString()}
                    valueStyle={{ fontSize: 14, fontWeight: 'bold', color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f9f0ff', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Disbursement Rate</span>}
                    value={
                      Number(selectedPartner.committed_budget_usd) > 0
                        ? ((Number(selectedPartner.disbursed_budget_usd) / Number(selectedPartner.committed_budget_usd)) * 100).toFixed(1)
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
                    title={<span style={{ fontSize: 11, color: '#595959' }}>MoU Expiry</span>}
                    value={selectedPartner.mou_expiry_date}
                    valueStyle={{ fontSize: 13, fontWeight: 'bold', color: '#fa8c16' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* TABPANES */}
            <Tabs defaultActiveKey="1" type="card">
              {/* TAB 1: Partner Profile */}
              <TabPane
                tab={
                  <span>
                    <FileProtectOutlined />
                    Partnership Profile & Budget
                  </span>
                }
                key="1"
              >
                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }} style={{ marginBottom: 16 }}>
                  <Descriptions.Item label="Partner Name" span={2}>
                    <strong style={{ color: '#1a5f2c' }}>{selectedPartner.partner_name}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Partner Category">
                    <Tag color="purple">{selectedPartner.partner_type}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Support Domain">
                    <Tag color="green">{selectedPartner.support_domain}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Country Director / Rep">
                    {selectedPartner.country_rep}
                  </Descriptions.Item>
                  <Descriptions.Item label="Direct Contact">
                    <span style={{ fontFamily: 'monospace' }}>{selectedPartner.phone_contact} | {selectedPartner.email_contact}</span>
                  </Descriptions.Item>
                  <Descriptions.Item label="MoU Validity Period">
                    {selectedPartner.mou_signing_date} to {selectedPartner.mou_expiry_date}
                  </Descriptions.Item>
                </Descriptions>

                <Card size="small" bordered={false} style={{ background: '#fcfdfd', border: '1px solid #e6f7ed', borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <SolutionOutlined style={{ color: '#1a5f2c', fontSize: 16 }} />
                    <strong style={{ color: '#1a5f2c', fontSize: 13, textTransform: 'uppercase' }}>
                      Project Deliverables & Summary (የፕሮጀክቱ ዓላማ)
                    </strong>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: '#262626', lineHeight: '1.6' }}>
                    {selectedPartner.project_summary || 'Institutional partnership dedicated to agricultural transformation and resilience.'}
                  </p>
                </Card>
              </TabPane>

              {/* TAB 2: Station Location */}
              <TabPane
                tab={
                  <span>
                    <EnvironmentOutlined />
                    Geographic Deployment Scope
                  </span>
                }
                key="2"
              >
                <Descriptions bordered size="small" column={{ xs: 1, sm: 3 }}>
                  <Descriptions.Item label="Administrative Zone">
                    <strong>{extractName(selectedPartner.zone)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Woreda">
                    <strong>{extractName(selectedPartner.woreda)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Kebele Operational Base">
                    <span style={{ color: '#1a5f2c', fontWeight: 'bold' }}>
                      {extractName(selectedPartner.kebele)}
                    </span>
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

export default function PartnerRegistry() {
  return (
    <App>
      <PartnerRegistryContent />
    </App>
  );
}