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
  Spin
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
  FileTextOutlined,
  PhoneOutlined,
  ManOutlined,
  WomanOutlined,
  RiseOutlined,
  ShopOutlined,
  CheckSquareOutlined,
  BankOutlined,
  FilterOutlined,
  SafetyCertificateOutlined
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

const REGULATION_CATEGORIES = [
  'College Academic Senate Statute & Bylaws (የኮሌጅ አካዳሚክ ሴኔት መተዳደሪያ ደንብ)',
  'Curriculum Review & Standard Operating Procedure (የስርዓተ-ትምህርት ግምገማና መመሪያ)',
  'Student Code of Conduct & Disciplinary Guideline (የተማሪዎች የባህርይ መግቢያና የዲሲፕሊን መመሪያ)',
  'Staff Promotion, Tenure & Professional Ethics Policy (የሰራተኞች የሙያ ዕድገትና ስነ-ም ስነ-ምግባር ፖሊሲ)',
  'Quality Assurance & Institutional Accreditation Standard (የጥራት ማረጋገጫና የተቋማዊ እውቅና መስፈርት)'
];

const REGULATION_ACTIVITIES = [
  'Statute Drafting & Stakeholder Consultation',
  'Senate Review & Legal Endorsement Session',
  'College-Wide Policy Dissemination & Training',
  'Compliance Auditing & Implementation Review',
  'Annual Bylaw Amendment & Revision Forum'
];

const INITIAL_REGULATIONS = [
  {
    id: '1',
    reg_code: 'REG-2019-EG-01',
    reg_title: 'Agricultural ATVET College Academic Senate Statute & Bylaws',
    reg_category: 'College Academic Senate Statute & Bylaws (የኮሌጅ አካዳሚክ ሴኔት መተዳደሪያ ደንብ)',
    core_activity: 'Senate Review & Legal Endorsement Session',
    policy_officer: 'Dr. Belayneh Mekonnen (Academic Vice Dean)',
    officer_phone: '+251 911 223 344',
    fiscal_year: '2019 E.C.',
    compliance_level: 'Fully Enforced',
    male_participants: 25,
    female_participants: 15,
    married_women_participants: 10,
    youth_participants: 8,
    investors_participants: 2,
    reg_status: 'Active & Endorsed',
    reg_notes: 'Comprehensive governance statute governing senate voting, grading systems, and instructional standards.',
    zone: 'East Gojjam',
    woreda: 'Dejen',
    kebele: 'Kurar'
  },
  {
    id: '2',
    reg_code: 'REG-2019-SG-04',
    reg_title: 'Debre Tabor University College Curriculum Review SOP',
    reg_category: 'Curriculum Review & Standard Operating Procedure (የስርዓተ-ትምህርት ግምገማና መመሪያ)',
    core_activity: 'College-Wide Policy Dissemination & Training',
    policy_officer: 'Prof. Tadesse Worku',
    officer_phone: '+251 922 112 334',
    fiscal_year: '2019 E.C.',
    compliance_level: 'Partially Enforced',
    male_participants: 18,
    female_participants: 12,
    married_women_participants: 8,
    youth_participants: 5,
    investors_participants: 1,
    reg_status: 'Under Review',
    reg_notes: 'Standard operating procedure for competency-based agricultural curriculum modularization and practical lab hours.',
    zone: 'South Gondar',
    woreda: 'Fogera',
    kebele: 'Woreta Zuria'
  }
];

function CollegeRegulationsContent() {
  const { message } = App.useApp();

  const [regulations, setRegulations] = useState(INITIAL_REGULATIONS);
  const [isFetching, setIsFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search & Filter states (Dedicated Fiscal Year Impact Focus)
  const [searchTerm, setSearchTerm] = useState('');
  const [fiscalYearImpactFilter, setFiscalYearImpactFilter] = useState('2019 E.C.');
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [activityFilter, setActivityFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [zoneFilter, setZoneFilter] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReg, setEditingReg] = useState(null);
  const [selectedReg, setSelectedReg] = useState(null);
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
      if (editingReg) {
        const initForm = async () => {
          const zoneMatch = zones.find(
            (z) => z.name === editingReg.zone || z.id === editingReg.zone_id
          );
          if (zoneMatch) {
            try {
              const wRes = locationApi?.getWoredas ? await locationApi.getWoredas(zoneMatch.id) : null;
              const wList = wRes?.data?.data?.data || wRes?.data?.data || [];
              setWoredas(wList);

              const woredaMatch = wList.find(
                (w) => w.name === editingReg.woreda || w.id === editingReg.woreda_id
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
            reg_code: editingReg.reg_code,
            reg_title: editingReg.reg_title,
            reg_category: editingReg.reg_category,
            core_activity: editingReg.core_activity,
            policy_officer: editingReg.policy_officer,
            officer_phone: editingReg.officer_phone,
            fiscal_year: editingReg.fiscal_year || '2019 E.C.',
            compliance_level: editingReg.compliance_level || 'Fully Enforced',
            male_participants: Number(editingReg.male_participants) || 0,
            female_participants: Number(editingReg.female_participants) || 0,
            married_women_participants: Number(editingReg.married_women_participants) || 0,
            youth_participants: Number(editingReg.youth_participants) || 0,
            investors_participants: Number(editingReg.investors_participants) || 0,
            reg_notes: editingReg.reg_notes,
            zone_id: editingReg.zone_id || zoneMatch?.id || editingReg.zone,
            woreda_id: editingReg.woreda_id || editingReg.woreda,
            kebele_id: editingReg.kebele_id || editingReg.kebele
          });
        };
        initForm();
      } else {
        form.resetFields();
        form.setFieldsValue({
          reg_category: 'College Academic Senate Statute & Bylaws (የኮሌጅ አካዳሚክ ሴኔት መተዳደሪያ ደንብ)',
          core_activity: 'Senate Review & Legal Endorsement Session',
          fiscal_year: fiscalYearImpactFilter || '2019 E.C.',
          compliance_level: 'Fully Enforced',
          male_participants: 15,
          female_participants: 10,
          married_women_participants: 6,
          youth_participants: 5,
          investors_participants: 1
        });
        setWoredas([]);
        setKebeles([]);
      }
    }
  }, [isModalOpen, editingReg, form, zones, fiscalYearImpactFilter]);

  const loadData = async () => {
    setIsFetching(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      message.success('College regulations registry refreshed');
    } catch {
      message.error('Failed to refresh data');
    } finally {
      setIsFetching(false);
    }
  };

  // Direct In-Place Status Update without Opening the Form
  const handleQuickStatusChange = (recordId, newStatus) => {
    setRegulations((prev) =>
      prev.map((r) => (r.id === recordId ? { ...r, reg_status: newStatus } : r))
    );
    message.success(`Regulation status updated to "${newStatus}"`);
  };

  // Filter pipeline (includes explicit fiscal year impact selection)
  const filteredRegulations = useMemo(() => {
    return regulations.filter((r) => {
      const code = extractName(r.reg_code).toLowerCase();
      const title = extractName(r.reg_title).toLowerCase();
      const off = extractName(r.policy_officer).toLowerCase();
      const kebele = extractName(r.kebele).toLowerCase();
      const woreda = extractName(r.woreda).toLowerCase();
      const zone = extractName(r.zone).toLowerCase();
      const q = searchTerm.toLowerCase();

      const matchesSearch =
        code.includes(q) || title.includes(q) || off.includes(q) || kebele.includes(q) || woreda.includes(q) || zone.includes(q);
      const matchesFY = fiscalYearImpactFilter ? r.fiscal_year === fiscalYearImpactFilter : true;
      const matchesCategory = categoryFilter ? r.reg_category === categoryFilter : true;
      const matchesActivity = activityFilter ? r.core_activity === activityFilter : true;
      const matchesStatus = statusFilter ? r.reg_status === statusFilter : true;
      const matchesZone = zoneFilter ? zone === zoneFilter.toLowerCase() : true;

      return matchesSearch && matchesFY && matchesCategory && matchesActivity && matchesStatus && matchesZone;
    });
  }, [regulations, searchTerm, fiscalYearImpactFilter, categoryFilter, activityFilter, statusFilter, zoneFilter]);

  // Statistics Calculation for Selected Fiscal Year Impact
  const stats = useMemo(() => {
    const totalRegulations = filteredRegulations.length;
    const maleParticipants = filteredRegulations.reduce((acc, r) => acc + (Number(r.male_participants) || 0), 0);
    const femaleParticipants = filteredRegulations.reduce((acc, r) => acc + (Number(r.female_participants) || 0), 0);
    const marriedWomen = filteredRegulations.reduce((acc, r) => acc + (Number(r.married_women_participants) || 0), 0);
    const youth = filteredRegulations.reduce((acc, r) => acc + (Number(r.youth_participants) || 0), 0);
    const investors = filteredRegulations.reduce((acc, r) => acc + (Number(r.investors_participants) || 0), 0);

    const totalParticipants = maleParticipants + femaleParticipants + marriedWomen + youth + investors;
    const totalWomenParticipants = femaleParticipants + marriedWomen;
    const womenRatio = totalParticipants > 0 ? ((totalWomenParticipants / totalParticipants) * 100).toFixed(1) : 0;
    const activeCount = filteredRegulations.filter((r) => r.reg_status === 'Active & Endorsed').length;

    return {
      totalRegulations,
      totalParticipants,
      maleParticipants,
      femaleParticipants,
      marriedWomen,
      totalWomenParticipants,
      youth,
      investors,
      womenRatio,
      activeCount
    };
  }, [filteredRegulations]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setCategoryFilter(null);
    setActivityFilter(null);
    setStatusFilter(null);
    setZoneFilter(null);
  };

  const handleOpenModal = (record = null) => {
    setEditingReg(record);
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

      if (editingReg) {
        setRegulations((prev) =>
          prev.map((item) =>
            item.id === editingReg.id ? { ...item, ...payload, reg_status: editingReg.reg_status } : item
          )
        );
        message.success('College regulation record updated successfully');
      } else {
        const newRecord = {
          ...payload,
          id: Date.now().toString(),
          reg_code: values.reg_code || `REG-${Date.now().toString().slice(-4)}`,
          reg_status: 'Active & Endorsed'
        };
        setRegulations((prev) => [newRecord, ...prev]);
        message.success('New college regulation registered successfully');
      }
      setIsModalOpen(false);
    } catch (error) {
      message.error(error?.response?.data?.message || error.message || 'Failed to save regulation record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    setRegulations((prev) => prev.filter((item) => item.id !== id));
    message.success('College regulation record removed');
  };

  const exportToCSV = () => {
    if (!filteredRegulations.length) {
      message.warning('No regulation records available to export');
      return;
    }
    const headers = [
      'Reg Code,Title,Category,Core Activity,Compliance Level,Officer,Phone,FY,Zone,Woreda,Kebele,Male (ወንድ),Female (ሴት),Married Women (ባለትዳር),Youth (ወጣቶች),Investors (ባለሃብቶች),Total Participants,Status'
    ];
    const rows = filteredRegulations.map((r) => {
      const total =
        (Number(r.male_participants) || 0) +
        (Number(r.female_participants) || 0) +
        (Number(r.married_women_participants) || 0) +
        (Number(r.youth_participants) || 0) +
        (Number(r.investors_participants) || 0);

      return [
        `"${r.reg_code || ''}"`,
        `"${r.reg_title || ''}"`,
        `"${r.reg_category || ''}"`,
        `"${r.core_activity || ''}"`,
        `"${r.compliance_level || ''}"`,
        `"${r.policy_officer || ''}"`,
        `"${r.officer_phone || ''}"`,
        `"${r.fiscal_year || ''}"`,
        `"${extractName(r.zone)}"`,
        `"${extractName(r.woreda)}"`,
        `"${extractName(r.kebele)}"`,
        r.male_participants || 0,
        r.female_participants || 0,
        r.married_women_participants || 0,
        r.youth_participants || 0,
        r.investors_participants || 0,
        total,
        `"${r.reg_status || ''}"`
      ].join(',');
    });

    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `College_Regulations_FY_${fiscalYearImpactFilter.replace(/\s+/g, '_')}_${Date.now()}.csv`;
    a.click();
    message.success(`College regulations report for ${fiscalYearImpactFilter} exported successfully`);
  };

  const columns = [
    {
      title: 'Reg Code & Title',
      key: 'reg_info',
      width: 250,
      render: (_, r) => (
        <div>
          <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{r.reg_title}</strong>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>
            Code: <span style={{ fontFamily: 'monospace' }}>{r.reg_code}</span> | Officer: {r.policy_officer}
          </div>
        </div>
      )
    },
    {
      title: 'Regulation Category',
      dataIndex: 'reg_category',
      key: 'reg_category',
      width: 210,
      render: (cat) => {
        let color = 'default';
        if (cat?.includes('Senate')) color = 'green';
        if (cat?.includes('Curriculum')) color = 'blue';
        if (cat?.includes('Conduct')) color = 'gold';
        if (cat?.includes('Promotion')) color = 'purple';
        if (cat?.includes('Quality')) color = 'cyan';
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
      title: 'Timeline (Fiscal Year)',
      key: 'timeline',
      width: 150,
      render: (_, r) => (
        <div style={{ fontSize: 12 }}>
          <Tag color="blue" icon={<CalendarOutlined />}>
            {r.fiscal_year || '2019 E.C.'}
          </Tag>
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
      title: 'Regulation Status (In-Place Edit)',
      dataIndex: 'reg_status',
      key: 'reg_status',
      width: 190,
      render: (status, record) => (
        <Select
          value={status || 'Active & Endorsed'}
          onChange={(newVal) => handleQuickStatusChange(record.id, newVal)}
          style={{ width: '100%' }}
          size="small"
        >
          <Option value="Active & Endorsed">
            <Tag color="success" icon={<CheckCircleOutlined />} style={{ margin: 0 }}>
              Endorsed
            </Tag>
          </Option>
          <Option value="Under Review">
            <Tag color="processing" icon={<ClockCircleOutlined />} style={{ margin: 0 }}>
              Under Review
            </Tag>
          </Option>
          <Option value="Revision Due">
            <Tag color="warning" icon={<ClockCircleOutlined />} style={{ margin: 0 }}>
              Revision Due
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
          <Tooltip title="View Regulation Dossier">
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: '#1890ff' }} />}
              onClick={() => {
                setSelectedReg(record);
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
              title="Delete regulation record?"
              description="Are you sure you want to remove this regulation record?"
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
        <Breadcrumb.Item>Colleges & Institutes</Breadcrumb.Item>
        <Breadcrumb.Item>College Statutes, Policies & Standard Guidelines</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#1a5f2c', fontFamily: "'Times New Roman', Times, serif" }}>
            College Statutes, Policies & Standard Guidelines (የኮሌጆች መተዳደሪያ ደንቦች፣ ፖሊሲዎችና መመሪያዎች)
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Coordinating academic senate statutes, curriculum review standard operating procedures, student conduct rules, and institutional accreditation policies
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
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Total Regulations ({fiscalYearImpactFilter})</span>}
              value={stats.totalRegulations}
              prefix={<FileTextOutlined style={{ color: '#1a5f2c', marginRight: 8 }} />}
              valueStyle={{ color: '#1a5f2c', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Statutes & Standard Guidelines
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
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Active & Endorsed</span>}
              value={stats.activeCount}
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
                placeholder="Search Title, Code, or Officer..."
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: 220 }}
                allowClear
              />

              <Select
                placeholder="Regulation Category"
                value={categoryFilter}
                onChange={setCategoryFilter}
                style={{ width: 195 }}
                allowClear
              >
                {REGULATION_CATEGORIES.map((rc) => (
                  <Option key={rc} value={rc}>{rc}</Option>
                ))}
              </Select>

              <Select
                placeholder="Core Activity"
                value={activityFilter}
                onChange={setActivityFilter}
                style={{ width: 200 }}
                allowClear
              >
                {REGULATION_ACTIVITIES.map((ra) => (
                  <Option key={ra} value={ra}>{ra}</Option>
                ))}
              </Select>

              <Select
                placeholder="Filter by Zone"
                value={zoneFilter}
                onChange={setZoneFilter}
                style={{ width: 150 }}
                allowClear
              >
                {[...new Set(regulations.map((r) => extractName(r.zone)))].map((z) => (
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
                disabled={!(searchTerm || categoryFilter || activityFilter || statusFilter || zoneFilter)}
              >
                Reset Filters
              </Button>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => handleOpenModal(null)}
                style={{ backgroundColor: '#1a5f2c', borderColor: '#1a5f2c', fontWeight: 600 }}
              >
                Register Regulation
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Main Table */}
      <Table
        columns={columns}
        dataSource={filteredRegulations}
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
            <FileTextOutlined style={{ color: '#1a5f2c', fontSize: 20 }} />
            <span style={{ color: '#1a5f2c', fontWeight: 'bold', fontFamily: "'Times New Roman', Times, serif", fontSize: 17 }}>
              {editingReg ? 'Edit College Regulation Record' : `Register College Regulation (${fiscalYearImpactFilter})`}
            </span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText={editingReg ? 'Update Record' : 'Save Regulation Record'}
        okButtonProps={{ style: { backgroundColor: '#1a5f2c', borderColor: '#1a5f2c' }, loading: isSubmitting }}
        width={800}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Regulation Identification & Category
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="reg_code"
                label="Regulation Code"
                rules={[{ required: true, message: 'Code required' }]}
              >
                <Input placeholder="e.g. REG-2019-EG-08" />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item
                name="reg_title"
                label="Statute / Policy Title"
                rules={[{ required: true, message: 'Title required' }]}
              >
                <Input placeholder="e.g. Agricultural ATVET College Academic Senate Statute" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="reg_category"
                label="Regulation Category"
                rules={[{ required: true, message: 'Select category' }]}
              >
                <Select>
                  {REGULATION_CATEGORIES.map((rc) => (
                    <Option key={rc} value={rc}>{rc}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="core_activity"
                label="Core Activity"
                rules={[{ required: true, message: 'Select activity' }]}
              >
                <Select>
                  {REGULATION_ACTIVITIES.map((ra) => (
                    <Option key={ra} value={ra}>{ra}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={10}>
              <Form.Item
                name="policy_officer"
                label="Policy Officer / Senate Lead"
                rules={[{ required: true, message: 'Officer required' }]}
              >
                <Input placeholder="e.g. Dr. Belayneh Mekonnen" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="officer_phone"
                label="Officer Phone Number"
                rules={[{ required: true, message: 'Phone required' }]}
              >
                <Input placeholder="+251 9..." />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="compliance_level"
                label="Compliance Level"
                rules={[{ required: true }]}
              >
                <Select>
                  <Option value="Fully Enforced">Fully Enforced</Option>
                  <Option value="Partially Enforced">Partially Enforced</Option>
                  <Option value="Drafting Stage">Drafting Stage</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Timeline & Fiscal Year Selection
          </Divider>
          <Row gutter={16}>
            <Col span={24}>
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
              <Form.Item name="reg_notes" label="Statute Notes & Endorsement Milestones">
                <TextArea rows={3} placeholder="Summarize senate approval, policy dissemination, or compliance audit findings..." />
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

      {/* Comprehensive Regulation Dossier Modal */}
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
                <FileTextOutlined />
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
                  {selectedReg?.reg_title}
                </span>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                  Code: <span style={{ fontFamily: 'monospace' }}>{selectedReg?.reg_code}</span> | Officer:{' '}
                  {selectedReg?.policy_officer}
                </div>
              </div>
            </div>
            <div>
              <Tag
                color={selectedReg?.reg_status === 'Active & Endorsed' ? 'success' : 'processing'}
                icon={selectedReg?.reg_status === 'Active & Endorsed' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                style={{ fontSize: 12, padding: '2px 10px', borderRadius: 12 }}
              >
                {selectedReg?.reg_status || 'Endorsed'}
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
              handleOpenModal(selectedReg);
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
        {selectedReg && (
          <div style={{ paddingTop: 8 }}>
            {/* Top Metric Strip */}
            <Row gutter={12} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f6ffed', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Compliance Level</span>}
                    value={selectedReg.compliance_level || 'Enforced'}
                    valueStyle={{ fontSize: 14, fontWeight: 'bold', color: '#1a5f2c' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f0f5ff', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Category</span>}
                    value={selectedReg.reg_category?.split(' ')[0] || 'Category'}
                    valueStyle={{ fontSize: 15, fontWeight: 'bold', color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f9f0ff', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Women Share</span>}
                    value={
                      (Number(selectedReg.male_participants) || 0) +
                      (Number(selectedReg.female_participants) || 0) +
                      (Number(selectedReg.married_women_participants) || 0) +
                      (Number(selectedReg.youth_participants) || 0) +
                      (Number(selectedReg.investors_participants) || 0) > 0
                        ? (
                            (((Number(selectedReg.female_participants) || 0) +
                              (Number(selectedReg.married_women_participants) || 0)) /
                              ((Number(selectedReg.male_participants) || 0) +
                                (Number(selectedReg.female_participants) || 0) +
                                (Number(selectedReg.married_women_participants) || 0) +
                                (Number(selectedReg.youth_participants) || 0) +
                                (Number(selectedReg.investors_participants) || 0))) *
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
                    value={selectedReg.fiscal_year}
                    valueStyle={{ fontSize: 13, fontWeight: 'bold', color: '#fa8c16' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* TABPANES */}
            <Tabs defaultActiveKey="1" type="card">
              {/* TAB 1: Regulation Profile */}
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
                  <Descriptions.Item label="Regulation Title" span={2}>
                    <strong style={{ color: '#1a5f2c' }}>{selectedReg.reg_title}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Regulation Category">
                    <Tag color="purple">{selectedReg.reg_category}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Core Activity">
                    <Tag color="green">{selectedReg.core_activity}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Policy Officer">
                    {selectedReg.policy_officer} ({selectedReg.officer_phone})
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
                          {Number(selectedReg.male_participants || 0).toLocaleString()}
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
                          {Number(selectedReg.female_participants || 0).toLocaleString()}
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
                          {Number(selectedReg.married_women_participants || 0).toLocaleString()}
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
                          {Number(selectedReg.youth_participants || 0).toLocaleString()}
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
                          {Number(selectedReg.investors_participants || 0).toLocaleString()}
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
                    Statute Notes & Milestones
                  </span>
                }
                key="2"
              >
                <Card size="small" bordered={false} style={{ background: '#fcfdfd', border: '1px solid #e6f7ed', borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <CheckCircleOutlined style={{ color: '#1a5f2c', fontSize: 16 }} />
                    <strong style={{ color: '#1a5f2c', fontSize: 13, textTransform: 'uppercase' }}>
                      Statute & Policy Notes (የደንብና ፖሊሲ ማስታወሻ)
                    </strong>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: '#262626', lineHeight: '1.6' }}>
                    {selectedReg.reg_notes || 'Active college statute, policy, and standard guideline document.'}
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
                    <strong>{extractName(selectedReg.zone)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Woreda">
                    <strong>{extractName(selectedReg.woreda)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Kebele Operational Base">
                    <span style={{ color: '#1a5f2c', fontWeight: 'bold' }}>
                      {extractName(selectedReg.kebele)}
                    </span>
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
                  <Descriptions.Item label="Fiscal Year (በጀት ዓመት)">
                    <Tag color="blue" icon={<CalendarOutlined />}>
                      {selectedReg.fiscal_year || '2019 E.C.'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Compliance Level">
                    <strong>{selectedReg.compliance_level || 'Enforced'}</strong>
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

export default function CollegeRegulations() {
  return (
    <App>
      <CollegeRegulationsContent />
    </App>
  );
}