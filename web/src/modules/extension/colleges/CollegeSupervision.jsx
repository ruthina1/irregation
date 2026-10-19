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
  FileSearchOutlined,
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

const AUDIT_CATEGORIES = [
  'Institutional Quality Assurance & Accreditation Audit (የተቋማዊ ጥራት ማረጋገጫና እውቅና ኦዲት)',
  'Laboratory & Practical Farm Facility Inspection (የላብራቶሪና ተግባራዊ እርሻ ቦታ ክትትል)',
  'Academic Staff Performance & Attendance Review (የመምህራን አፈፃፀምና ስራ ላይ መገኘት ግምገማ)',
  'Curriculum Implementation & Exam Security Audit (የስርዓተ-ትምህርት አተገባበርና የፈተና ደህንነት ኦዲት)',
  'Financial Governance & Resource Utilization Audit (የፋይናንስ አስተዳደርና የሃብት አጠቃቀም ኦዲት)'
];

const AUDIT_ACTIVITIES = [
  'Field Inspection & Facility Walkthrough',
  'Student & Faculty Focus Group Interview',
  'Document & Grade Logbook Verification',
  'Corrective Action Plan (CAP) Issuance',
  'Quality Compliance & Follow-up Audit'
];

const INITIAL_AUDITS = [
  {
    id: '1',
    audit_code: 'AUD-2019-EG-01',
    audit_title: 'Bahir Dar ATVET Institutional Quality Assurance & Farm Inspection',
    college_name: 'Bahir Dar Agricultural ATVET College',
    audit_category: 'Institutional Quality Assurance & Accreditation Audit (የተቋማዊ ጥራት ማረጋገጫና እውቅና ኦዲት)',
    core_activity: 'Field Inspection & Facility Walkthrough',
    audit_lead: 'Ato Getachew Mekonnen (Lead Inspector)',
    lead_phone: '+251 913 990 112',
    fiscal_year: '2019 E.C.',
    compliance_score_percent: 92,
    male_participants: 15,
    female_participants: 10,
    married_women_participants: 6,
    youth_participants: 5,
    investors_participants: 1,
    audit_status: 'Fully Compliant',
    audit_notes: 'Conducted rigorous QA audit across instructional laboratories, dairy farms, and library facilities with 92% compliance.',
    zone: 'East Gojjam',
    woreda: 'Dejen',
    kebele: 'Kurar'
  },
  {
    id: '2',
    audit_code: 'AUD-2019-SG-04',
    audit_title: 'Debre Tabor University College Lab & Practical Farm Inspection',
    college_name: 'Debre Tabor University College of Agriculture',
    audit_category: 'Laboratory & Practical Farm Facility Inspection (የላብራቶሪና ተግባራዊ እርሻ ቦታ ክትትል)',
    core_activity: 'Document & Grade Logbook Verification',
    audit_lead: 'Woizero Almaz Bekele',
    lead_phone: '+251 915 667 899',
    fiscal_year: '2019 E.C.',
    compliance_score_percent: 88,
    male_participants: 12,
    female_participants: 8,
    married_women_participants: 5,
    youth_participants: 4,
    investors_participants: 0,
    audit_status: 'Fully Compliant',
    audit_notes: 'Inspected agronomy laboratories, soil testing equipment, and student grade logbooks.',
    zone: 'South Gondar',
    woreda: 'Fogera',
    kebele: 'Woreta Zuria'
  }
];

function CollegeSupervisionContent() {
  const { message } = App.useApp();

  const [audits, setAudits] = useState(INITIAL_AUDITS);
  const [collegesList, setCollegesList] = useState([
    { id: '1', college_name: 'Bahir Dar Agricultural ATVET College' },
    { id: '2', college_name: 'Debre Tabor University College of Agriculture' }
  ]);

  const [isFetching, setIsFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search & Filter states (Dedicated Fiscal Year Impact Focus)
  const [searchTerm, setSearchTerm] = useState('');
  const [fiscalYearImpactFilter, setFiscalYearImpactFilter] = useState('2019 E.C.');
  const [collegeFilter, setCollegeFilter] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [activityFilter, setActivityFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [zoneFilter, setZoneFilter] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAudit, setEditingAudit] = useState(null);
  const [selectedAudit, setSelectedAudit] = useState(null);
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
      if (editingAudit) {
        const initForm = async () => {
          const zoneMatch = zones.find(
            (z) => z.name === editingAudit.zone || z.id === editingAudit.zone_id
          );
          if (zoneMatch) {
            try {
              const wRes = locationApi?.getWoredas ? await locationApi.getWoredas(zoneMatch.id) : null;
              const wList = wRes?.data?.data?.data || wRes?.data?.data || [];
              setWoredas(wList);

              const woredaMatch = wList.find(
                (w) => w.name === editingAudit.woreda || w.id === editingAudit.woreda_id
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
            audit_code: editingAudit.audit_code,
            audit_title: editingAudit.audit_title,
            college_name: editingAudit.college_name,
            audit_category: editingAudit.audit_category,
            core_activity: editingAudit.core_activity,
            audit_lead: editingAudit.audit_lead,
            lead_phone: editingAudit.lead_phone,
            fiscal_year: editingAudit.fiscal_year || '2019 E.C.',
            compliance_score_percent: Number(editingAudit.compliance_score_percent) || 85,
            male_participants: Number(editingAudit.male_participants) || 0,
            female_participants: Number(editingAudit.female_participants) || 0,
            married_women_participants: Number(editingAudit.married_women_participants) || 0,
            youth_participants: Number(editingAudit.youth_participants) || 0,
            investors_participants: Number(editingAudit.investors_participants) || 0,
            audit_notes: editingAudit.audit_notes,
            zone_id: editingAudit.zone_id || zoneMatch?.id || editingAudit.zone,
            woreda_id: editingAudit.woreda_id || editingAudit.woreda,
            kebele_id: editingAudit.kebele_id || editingAudit.kebele
          });
        };
        initForm();
      } else {
        form.resetFields();
        form.setFieldsValue({
          college_name: collegesList[0]?.college_name || 'Bahir Dar Agricultural ATVET College',
          audit_category: 'Institutional Quality Assurance & Accreditation Audit (የተቋማዊ ጥራት ማረጋገጫና እውቅና ኦዲት)',
          core_activity: 'Field Inspection & Facility Walkthrough',
          fiscal_year: fiscalYearImpactFilter || '2019 E.C.',
          compliance_score_percent: 90,
          male_participants: 10,
          female_participants: 10,
          married_women_participants: 6,
          youth_participants: 5,
          investors_participants: 1
        });
        setWoredas([]);
        setKebeles([]);
      }
    }
  }, [isModalOpen, editingAudit, form, zones, fiscalYearImpactFilter, collegesList]);

  const loadData = async () => {
    setIsFetching(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      message.success('College supervision audits registry refreshed');
    } catch {
      message.error('Failed to refresh data');
    } finally {
      setIsFetching(false);
    }
  };

  // Direct In-Place Status Update without Opening the Form
  const handleQuickStatusChange = (recordId, newStatus) => {
    setAudits((prev) =>
      prev.map((a) => (a.id === recordId ? { ...a, audit_status: newStatus } : a))
    );
    message.success(`Audit status updated to "${newStatus}"`);
  };

  // Filter pipeline (includes explicit fiscal year impact selection)
  const filteredAudits = useMemo(() => {
    return audits.filter((a) => {
      const code = extractName(a.audit_code).toLowerCase();
      const title = extractName(a.audit_title).toLowerCase();
      const college = extractName(a.college_name).toLowerCase();
      const lead = extractName(a.audit_lead).toLowerCase();
      const kebele = extractName(a.kebele).toLowerCase();
      const woreda = extractName(a.woreda).toLowerCase();
      const zone = extractName(a.zone).toLowerCase();
      const q = searchTerm.toLowerCase();

      const matchesSearch =
        code.includes(q) || title.includes(q) || college.includes(q) || lead.includes(q) || kebele.includes(q) || woreda.includes(q) || zone.includes(q);
      const matchesFY = fiscalYearImpactFilter ? a.fiscal_year === fiscalYearImpactFilter : true;
      const matchesCollege = collegeFilter ? a.college_name === collegeFilter : true;
      const matchesCategory = categoryFilter ? a.audit_category === categoryFilter : true;
      const matchesActivity = activityFilter ? a.core_activity === activityFilter : true;
      const matchesStatus = statusFilter ? a.audit_status === statusFilter : true;
      const matchesZone = zoneFilter ? zone === zoneFilter.toLowerCase() : true;

      return matchesSearch && matchesFY && matchesCollege && matchesCategory && matchesActivity && matchesStatus && matchesZone;
    });
  }, [audits, searchTerm, fiscalYearImpactFilter, collegeFilter, categoryFilter, activityFilter, statusFilter, zoneFilter]);

  // Statistics Calculation for Selected Fiscal Year Impact
  const stats = useMemo(() => {
    const totalAudits = filteredAudits.length;
    const avgScore = totalAudits > 0 ? (filteredAudits.reduce((acc, a) => acc + (Number(a.compliance_score_percent) || 0), 0) / totalAudits).toFixed(1) : 0;
    const maleParticipants = filteredAudits.reduce((acc, a) => acc + (Number(a.male_participants) || 0), 0);
    const femaleParticipants = filteredAudits.reduce((acc, a) => acc + (Number(a.female_participants) || 0), 0);
    const marriedWomen = filteredAudits.reduce((acc, a) => acc + (Number(a.married_women_participants) || 0), 0);
    const youth = filteredAudits.reduce((acc, a) => acc + (Number(a.youth_participants) || 0), 0);
    const investors = filteredAudits.reduce((acc, a) => acc + (Number(a.investors_participants) || 0), 0);

    const totalParticipants = maleParticipants + femaleParticipants + marriedWomen + youth + investors;
    const totalWomenParticipants = femaleParticipants + marriedWomen;
    const womenRatio = totalParticipants > 0 ? ((totalWomenParticipants / totalParticipants) * 100).toFixed(1) : 0;
    const compliantCount = filteredAudits.filter((a) => a.audit_status === 'Fully Compliant').length;

    return {
      totalAudits,
      avgScore,
      totalParticipants,
      maleParticipants,
      femaleParticipants,
      marriedWomen,
      totalWomenParticipants,
      youth,
      investors,
      womenRatio,
      compliantCount
    };
  }, [filteredAudits]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setCollegeFilter(null);
    setCategoryFilter(null);
    setActivityFilter(null);
    setStatusFilter(null);
    setZoneFilter(null);
  };

  const handleOpenModal = (record = null) => {
    setEditingAudit(record);
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

      if (editingAudit) {
        setAudits((prev) =>
          prev.map((item) =>
            item.id === editingAudit.id ? { ...item, ...payload, audit_status: editingAudit.audit_status } : item
          )
        );
        message.success('College supervision audit record updated successfully');
      } else {
        const newRecord = {
          ...payload,
          id: Date.now().toString(),
          audit_code: values.audit_code || `AUD-${Date.now().toString().slice(-4)}`,
          audit_status: 'Fully Compliant'
        };
        setAudits((prev) => [newRecord, ...prev]);
        message.success('New college supervision audit registered successfully');
      }
      setIsModalOpen(false);
    } catch (error) {
      message.error(error?.response?.data?.message || error.message || 'Failed to save audit record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    setAudits((prev) => prev.filter((item) => item.id !== id));
    message.success('College supervision audit record removed');
  };

  const exportToCSV = () => {
    if (!filteredAudits.length) {
      message.warning('No audit records available to export');
      return;
    }
    const headers = [
      'Audit Code,Title,College Name,Category,Core Activity,Compliance Score (%),Lead,Phone,FY,Zone,Woreda,Kebele,Male (ወንድ),Female (ሴት),Married Women (ባለትዳር),Youth (ወጣቶች),Investors (ባለሃብቶች),Total Participants,Status'
    ];
    const rows = filteredAudits.map((a) => {
      const total =
        (Number(a.male_participants) || 0) +
        (Number(a.female_participants) || 0) +
        (Number(a.married_women_participants) || 0) +
        (Number(a.youth_participants) || 0) +
        (Number(a.investors_participants) || 0);

      return [
        `"${a.audit_code || ''}"`,
        `"${a.audit_title || ''}"`,
        `"${a.college_name || ''}"`,
        `"${a.audit_category || ''}"`,
        `"${a.core_activity || ''}"`,
        a.compliance_score_percent || 0,
        `"${a.audit_lead || ''}"`,
        `"${a.lead_phone || ''}"`,
        `"${a.fiscal_year || ''}"`,
        `"${extractName(a.zone)}"`,
        `"${extractName(a.woreda)}"`,
        `"${extractName(a.kebele)}"`,
        a.male_participants || 0,
        a.female_participants || 0,
        a.married_women_participants || 0,
        a.youth_participants || 0,
        a.investors_participants || 0,
        total,
        `"${a.audit_status || ''}"`
      ].join(',');
    });

    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `College_Supervision_Audits_FY_${fiscalYearImpactFilter.replace(/\s+/g, '_')}_${Date.now()}.csv`;
    a.click();
    message.success(`College supervision report for ${fiscalYearImpactFilter} exported successfully`);
  };

  const columns = [
    {
      title: 'Audit Code & Title',
      key: 'audit_info',
      width: 250,
      render: (_, r) => (
        <div>
          <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{r.audit_title}</strong>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>
            Code: <span style={{ fontFamily: 'monospace' }}>{r.audit_code}</span> | Score: <strong style={{ color: '#1a5f2c' }}>{r.compliance_score_percent}%</strong>
          </div>
        </div>
      )
    },
    {
      title: 'Audited College',
      dataIndex: 'college_name',
      key: 'college_name',
      width: 220,
      render: (colName) => (
        <Tag color="green" icon={<BankOutlined />}>
          {colName || 'Unspecified College'}
        </Tag>
      )
    },
    {
      title: 'Audit Category',
      dataIndex: 'audit_category',
      key: 'audit_category',
      width: 210,
      render: (cat) => {
        let color = 'default';
        if (cat?.includes('Institutional')) color = 'green';
        if (cat?.includes('Laboratory')) color = 'blue';
        if (cat?.includes('Academic')) color = 'gold';
        if (cat?.includes('Curriculum')) color = 'purple';
        if (cat?.includes('Financial')) color = 'cyan';
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
      title: 'Audit Status (In-Place Edit)',
      dataIndex: 'audit_status',
      key: 'audit_status',
      width: 190,
      render: (status, record) => (
        <Select
          value={status || 'Fully Compliant'}
          onChange={(newVal) => handleQuickStatusChange(record.id, newVal)}
          style={{ width: '100%' }}
          size="small"
        >
          <Option value="Fully Compliant">
            <Tag color="success" icon={<CheckCircleOutlined />} style={{ margin: 0 }}>
              Compliant
            </Tag>
          </Option>
          <Option value="Active Monitoring">
            <Tag color="processing" icon={<ClockCircleOutlined />} style={{ margin: 0 }}>
              Monitoring
            </Tag>
          </Option>
          <Option value="CAP Required">
            <Tag color="warning" icon={<ClockCircleOutlined />} style={{ margin: 0 }}>
              CAP Required
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
          <Tooltip title="View Audit Dossier">
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: '#1890ff' }} />}
              onClick={() => {
                setSelectedAudit(record);
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
              title="Delete audit record?"
              description="Are you sure you want to remove this supervision audit record?"
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
        <Breadcrumb.Item>College Quality Assurance & Field Supervision</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#1a5f2c', fontFamily: "'Times New Roman', Times, serif" }}>
            College Quality Assurance & Field Supervision (የኮሌጆች ጥራት ማረጋገጫና የመስክ ክትትል ኦዲት)
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Coordinating institutional quality audits, practical farm & laboratory inspections, academic performance reviews, and corrective action plans (CAP)
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
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Total Audits ({fiscalYearImpactFilter})</span>}
              value={stats.totalAudits}
              prefix={<FileSearchOutlined style={{ color: '#1a5f2c', marginRight: 8 }} />}
              valueStyle={{ color: '#1a5f2c', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Avg Compliance: <strong style={{ color: '#262626' }}>{stats.avgScore}%</strong>
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
              <span>Goal: &gt; 40%</span>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #fa8c16', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Fully Compliant</span>}
              value={stats.compliantCount}
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
                placeholder="Filter by College"
                value={collegeFilter}
                onChange={setCollegeFilter}
                style={{ width: 195 }}
                allowClear
              >
                {collegesList.map((col) => (
                  <Option key={col.id} value={col.college_name}>{col.college_name}</Option>
                ))}
              </Select>

              <Select
                placeholder="Audit Category"
                value={categoryFilter}
                onChange={setCategoryFilter}
                style={{ width: 195 }}
                allowClear
              >
                {AUDIT_CATEGORIES.map((ac) => (
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
                {AUDIT_ACTIVITIES.map((aa) => (
                  <Option key={aa} value={aa}>{aa}</Option>
                ))}
              </Select>

              <Select
                placeholder="Filter by Zone"
                value={zoneFilter}
                onChange={setZoneFilter}
                style={{ width: 150 }}
                allowClear
              >
                {[...new Set(audits.map((a) => extractName(a.zone)))].map((z) => (
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
                disabled={!(searchTerm || collegeFilter || categoryFilter || activityFilter || statusFilter || zoneFilter)}
              >
                Reset Filters
              </Button>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => handleOpenModal(null)}
                style={{ backgroundColor: '#1a5f2c', borderColor: '#1a5f2c', fontWeight: 600 }}
              >
                Register Audit
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Main Table */}
      <Table
        columns={columns}
        dataSource={filteredAudits}
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
            <FileSearchOutlined style={{ color: '#1a5f2c', fontSize: 20 }} />
            <span style={{ color: '#1a5f2c', fontWeight: 'bold', fontFamily: "'Times New Roman', Times, serif", fontSize: 17 }}>
              {editingAudit ? 'Edit Supervision Audit Record' : `Register Supervision Audit (${fiscalYearImpactFilter})`}
            </span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText={editingAudit ? 'Update Record' : 'Save Audit Record'}
        okButtonProps={{ style: { backgroundColor: '#1a5f2c', borderColor: '#1a5f2c' }, loading: isSubmitting }}
        width={800}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Audit Identification & College Selection
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="audit_code"
                label="Audit Code"
                rules={[{ required: true, message: 'Code required' }]}
              >
                <Input placeholder="e.g. AUD-2019-EG-08" />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item
                name="audit_title"
                label="Audit Title / Inspection Description"
                rules={[{ required: true, message: 'Title required' }]}
              >
                <Input placeholder="e.g. Bahir Dar ATVET Quality Assurance & Farm Inspection" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="college_name"
                label="Select College to Audit (የሚመረመረው ኮሌጅ)"
                rules={[{ required: true, message: 'Please select a registered college' }]}
              >
                <Select placeholder="Select from registered colleges...">
                  {collegesList.map((col) => (
                    <Option key={col.id} value={col.college_name}>
                      <BankOutlined style={{ marginRight: 6, color: '#1a5f2c' }} />
                      {col.college_name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="audit_category"
                label="Audit Category"
                rules={[{ required: true, message: 'Select category' }]}
              >
                <Select>
                  {AUDIT_CATEGORIES.map((ac) => (
                    <Option key={ac} value={ac}>{ac}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="core_activity"
                label="Core Inspection Activity"
                rules={[{ required: true, message: 'Select activity' }]}
              >
                <Select>
                  {AUDIT_ACTIVITIES.map((aa) => (
                    <Option key={aa} value={aa}>{aa}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={10}>
              <Form.Item
                name="audit_lead"
                label="Lead Inspector / QA Officer"
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
            <Col span={6}>
              <Form.Item
                name="compliance_score_percent"
                label="Compliance Score (%)"
                rules={[{ required: true, message: 'Score required' }]}
              >
                <InputNumber min={0} max={100} style={{ width: '100%' }} />
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
              <Form.Item name="audit_notes" label="Audit Notes & Corrective Action Milestones">
                <TextArea rows={3} placeholder="Summarize quality assurance findings, laboratory inspection notes, or CAP requirements..." />
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

      {/* Comprehensive Audit Dossier Modal */}
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
                <FileSearchOutlined />
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
                  {selectedAudit?.audit_title}
                </span>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                  Code: <span style={{ fontFamily: 'monospace' }}>{selectedAudit?.audit_code}</span> | Lead:{' '}
                  {selectedAudit?.audit_lead}
                </div>
              </div>
            </div>
            <div>
              <Tag
                color={selectedAudit?.audit_status === 'Fully Compliant' ? 'success' : 'processing'}
                icon={selectedAudit?.audit_status === 'Fully Compliant' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                style={{ fontSize: 12, padding: '2px 10px', borderRadius: 12 }}
              >
                {selectedAudit?.audit_status || 'Compliant'}
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
              handleOpenModal(selectedAudit);
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
        {selectedAudit && (
          <div style={{ paddingTop: 8 }}>
            {/* Top Metric Strip */}
            <Row gutter={12} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f6ffed', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Compliance Score</span>}
                    value={selectedAudit.compliance_score_percent || 0}
                    suffix="%"
                    valueStyle={{ fontSize: 15, fontWeight: 'bold', color: '#1a5f2c' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f0f5ff', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Category</span>}
                    value={selectedAudit.audit_category?.split(' ')[0] || 'Category'}
                    valueStyle={{ fontSize: 15, fontWeight: 'bold', color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f9f0ff', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Women Share</span>}
                    value={
                      (Number(selectedAudit.male_participants) || 0) +
                      (Number(selectedAudit.female_participants) || 0) +
                      (Number(selectedAudit.married_women_participants) || 0) +
                      (Number(selectedAudit.youth_participants) || 0) +
                      (Number(selectedAudit.investors_participants) || 0) > 0
                        ? (
                            (((Number(selectedAudit.female_participants) || 0) +
                              (Number(selectedAudit.married_women_participants) || 0)) /
                              ((Number(selectedAudit.male_participants) || 0) +
                                (Number(selectedAudit.female_participants) || 0) +
                                (Number(selectedAudit.married_women_participants) || 0) +
                                (Number(selectedAudit.youth_participants) || 0) +
                                (Number(selectedAudit.investors_participants) || 0))) *
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
                    value={selectedAudit.fiscal_year}
                    valueStyle={{ fontSize: 13, fontWeight: 'bold', color: '#fa8c16' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* TABPANES */}
            <Tabs defaultActiveKey="1" type="card">
              {/* TAB 1: Audit Profile */}
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
                  <Descriptions.Item label="Audit Title" span={2}>
                    <strong style={{ color: '#1a5f2c' }}>{selectedAudit.audit_title}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Audited College">
                    <Tag color="green"><BankOutlined /> {selectedAudit.college_name}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Audit Category">
                    <Tag color="purple">{selectedAudit.audit_category}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Core Activity" span={2}>
                    <Tag color="blue">{selectedAudit.core_activity}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Lead Inspector" span={2}>
                    {selectedAudit.audit_lead} ({selectedAudit.lead_phone})
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
                          {Number(selectedAudit.male_participants || 0).toLocaleString()}
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
                          {Number(selectedAudit.female_participants || 0).toLocaleString()}
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
                          {Number(selectedAudit.married_women_participants || 0).toLocaleString()}
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
                          {Number(selectedAudit.youth_participants || 0).toLocaleString()}
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
                          {Number(selectedAudit.investors_participants || 0).toLocaleString()}
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
                    Audit Notes & Milestones
                  </span>
                }
                key="2"
              >
                <Card size="small" bordered={false} style={{ background: '#fcfdfd', border: '1px solid #e6f7ed', borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <CheckCircleOutlined style={{ color: '#1a5f2c', fontSize: 16 }} />
                    <strong style={{ color: '#1a5f2c', fontSize: 13, textTransform: 'uppercase' }}>
                      Supervision & Quality Assurance Notes (የጥራት ማረጋገጫ ኦዲት ማስታወሻ)
                    </strong>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: '#262626', lineHeight: '1.6' }}>
                    {selectedAudit.audit_notes || 'Active college quality assurance and field supervision audit record.'}
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
                    <strong>{extractName(selectedAudit.zone)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Woreda">
                    <strong>{extractName(selectedAudit.woreda)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Kebele Operational Base">
                    <span style={{ color: '#1a5f2c', fontWeight: 'bold' }}>
                      {extractName(selectedAudit.kebele)}
                    </span>
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
                  <Descriptions.Item label="Fiscal Year (በጀት ዓመት)">
                    <Tag color="blue" icon={<CalendarOutlined />}>
                      {selectedAudit.fiscal_year || '2019 E.C.'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Compliance Score">
                    <strong>{selectedAudit.compliance_score_percent}% Compliance</strong>
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

export default function CollegeSupervision() {
  return (
    <App>
      <CollegeSupervisionContent />
    </App>
  );
}