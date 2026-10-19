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
  BankOutlined,
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

const READINESS_CATEGORIES = [
  'Institutional Leadership & Administrative Governance Readiness (የተቋማዊ አስተዳደርና መሪነት ዝግጁነት ግምገማ)',
  'Financial Autonomy & Budget Execution Capacity Assessment (የፋይናንስ ነፃነትና የበጀት አፈፃፀም አቅም ምዘና)',
  'Infrastructure, ICT & Learning Facility Preparedness (የመሰረተ ልማት፣ አይሲቲና ትምህርት ማዕከል ዝግጁነት)',
  'Academic Program Expansion & Faculty Readiness Evaluation (የአካዳሚክ መርሃ ግብር መስፋፋትና የመምህራን ዝግጁነት)',
  'Community Engagement & Regional Impact Readiness Audit (የህብረተሰብ አገልግሎትና ክልላዊ ተፅዕኖ ዝግጁነት ኦዲት)'
];

const READINESS_ACTIVITIES = [
  'Governance Readiness Matrix & Data Collection',
  'Leadership & Council Focus Group Evaluation',
  'Resource Allocation & Infrastructure Walkthrough',
  'Readiness Scorecard & Action Plan Formulation',
  'Institutional Accreditation & Upgrade Review'
];

const INITIAL_READINESS = [
  {
    id: '1',
    gov_code: 'GOV-2019-EG-01',
    gov_title: 'Bahir Dar ATVET Institutional Governance & Readiness Evaluation',
    college_name: 'Bahir Dar Agricultural ATVET College',
    gov_category: 'Institutional Leadership & Administrative Governance Readiness (የተቋማዊ አስተዳደርና መሪነት ዝግጁነት ግምገማ)',
    core_activity: 'Governance Readiness Matrix & Data Collection',
    evaluation_lead: 'Dr. Belayneh Mekonnen (Lead Evaluator)',
    lead_phone: '+251 911 223 344',
    fiscal_year: '2019 E.C.',
    readiness_score_percent: 89,
    male_participants: 18,
    female_participants: 12,
    married_women_participants: 8,
    youth_participants: 6,
    investors_participants: 2,
    gov_status: 'Fully Ready & Verified',
    gov_notes: 'Evaluated leadership structure, financial autonomy, and ICT readiness, achieving an 89% institutional readiness score.',
    zone: 'East Gojjam',
    woreda: 'Dejen',
    kebele: 'Kurar'
  },
  {
    id: '2',
    gov_code: 'GOV-2019-SG-04',
    gov_title: 'Debre Tabor University College Financial & Infrastructure Readiness Assessment',
    college_name: 'Debre Tabor University College of Agriculture',
    gov_category: 'Infrastructure, ICT & Learning Facility Preparedness (የመሰረተ ልማት፣ አይሲቲና ትምህርት ማዕከል ዝግጁነት)',
    core_activity: 'Resource Allocation & Infrastructure Walkthrough',
    evaluation_lead: 'Prof. Tadesse Worku',
    lead_phone: '+251 922 112 334',
    fiscal_year: '2019 E.C.',
    readiness_score_percent: 85,
    male_participants: 14,
    female_participants: 10,
    married_women_participants: 6,
    youth_participants: 5,
    investors_participants: 1,
    gov_status: 'Fully Ready & Verified',
    gov_notes: 'Assessed smart classrooms, laboratory equipment stock, and budget execution efficiency.',
    zone: 'South Gondar',
    woreda: 'Fogera',
    kebele: 'Woreta Zuria'
  }
];

function GovernanceReadinessContent() {
  const { message } = App.useApp();

  const [readinessRecords, setReadinessRecords] = useState(INITIAL_READINESS);
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
  const [editingGov, setEditingGov] = useState(null);
  const [selectedGov, setSelectedGov] = useState(null);
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
      if (editingGov) {
        const initForm = async () => {
          const zoneMatch = zones.find(
            (z) => z.name === editingGov.zone || z.id === editingGov.zone_id
          );
          if (zoneMatch) {
            try {
              const wRes = locationApi?.getWoredas ? await locationApi.getWoredas(zoneMatch.id) : null;
              const wList = wRes?.data?.data?.data || wRes?.data?.data || [];
              setWoredas(wList);

              const woredaMatch = wList.find(
                (w) => w.name === editingGov.woreda || w.id === editingGov.woreda_id
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
            gov_code: editingGov.gov_code,
            gov_title: editingGov.gov_title,
            college_name: editingGov.college_name,
            gov_category: editingGov.gov_category,
            core_activity: editingGov.core_activity,
            evaluation_lead: editingGov.evaluation_lead,
            lead_phone: editingGov.lead_phone,
            fiscal_year: editingGov.fiscal_year || '2019 E.C.',
            readiness_score_percent: Number(editingGov.readiness_score_percent) || 80,
            male_participants: Number(editingGov.male_participants) || 0,
            female_participants: Number(editingGov.female_participants) || 0,
            married_women_participants: Number(editingGov.married_women_participants) || 0,
            youth_participants: Number(editingGov.youth_participants) || 0,
            investors_participants: Number(editingGov.investors_participants) || 0,
            gov_notes: editingGov.gov_notes,
            zone_id: editingGov.zone_id || zoneMatch?.id || editingGov.zone,
            woreda_id: editingGov.woreda_id || editingGov.woreda,
            kebele_id: editingGov.kebele_id || editingGov.kebele
          });
        };
        initForm();
      } else {
        form.resetFields();
        form.setFieldsValue({
          college_name: collegesList[0]?.college_name || 'Bahir Dar Agricultural ATVET College',
          gov_category: 'Institutional Leadership & Administrative Governance Readiness (የተቋማዊ አስተዳደርና መሪነት ዝግጁነት ግምገማ)',
          core_activity: 'Governance Readiness Matrix & Data Collection',
          fiscal_year: fiscalYearImpactFilter || '2019 E.C.',
          readiness_score_percent: 85,
          male_participants: 12,
          female_participants: 10,
          married_women_participants: 6,
          youth_participants: 5,
          investors_participants: 1
        });
        setWoredas([]);
        setKebeles([]);
      }
    }
  }, [isModalOpen, editingGov, form, zones, fiscalYearImpactFilter, collegesList]);

  const loadData = async () => {
    setIsFetching(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      message.success('Governance readiness registry refreshed');
    } catch {
      message.error('Failed to refresh data');
    } finally {
      setIsFetching(false);
    }
  };

  // Direct In-Place Status Update without Opening the Form
  const handleQuickStatusChange = (recordId, newStatus) => {
    setReadinessRecords((prev) =>
      prev.map((g) => (g.id === recordId ? { ...g, gov_status: newStatus } : g))
    );
    message.success(`Governance status updated to "${newStatus}"`);
  };

  // Filter pipeline (includes explicit fiscal year impact selection)
  const filteredReadinessRecords = useMemo(() => {
    return readinessRecords.filter((g) => {
      const code = extractName(g.gov_code).toLowerCase();
      const title = extractName(g.gov_title).toLowerCase();
      const college = extractName(g.college_name).toLowerCase();
      const lead = extractName(g.evaluation_lead).toLowerCase();
      const kebele = extractName(g.kebele).toLowerCase();
      const woreda = extractName(g.woreda).toLowerCase();
      const zone = extractName(g.zone).toLowerCase();
      const q = searchTerm.toLowerCase();

      const matchesSearch =
        code.includes(q) || title.includes(q) || college.includes(q) || lead.includes(q) || kebele.includes(q) || woreda.includes(q) || zone.includes(q);
      const matchesFY = fiscalYearImpactFilter ? g.fiscal_year === fiscalYearImpactFilter : true;
      const matchesCollege = collegeFilter ? g.college_name === collegeFilter : true;
      const matchesCategory = categoryFilter ? g.gov_category === categoryFilter : true;
      const matchesActivity = activityFilter ? g.core_activity === activityFilter : true;
      const matchesStatus = statusFilter ? g.gov_status === statusFilter : true;
      const matchesZone = zoneFilter ? zone === zoneFilter.toLowerCase() : true;

      return matchesSearch && matchesFY && matchesCollege && matchesCategory && matchesActivity && matchesStatus && matchesZone;
    });
  }, [readinessRecords, searchTerm, fiscalYearImpactFilter, collegeFilter, categoryFilter, activityFilter, statusFilter, zoneFilter]);

  // Statistics Calculation for Selected Fiscal Year Impact
  const stats = useMemo(() => {
    const totalPrograms = filteredReadinessRecords.length;
    const avgScore = totalPrograms > 0 ? (filteredReadinessRecords.reduce((acc, g) => acc + (Number(g.readiness_score_percent) || 0), 0) / totalPrograms).toFixed(1) : 0;
    const maleParticipants = filteredReadinessRecords.reduce((acc, g) => acc + (Number(g.male_participants) || 0), 0);
    const femaleParticipants = filteredReadinessRecords.reduce((acc, g) => acc + (Number(g.female_participants) || 0), 0);
    const marriedWomen = filteredReadinessRecords.reduce((acc, g) => acc + (Number(g.married_women_participants) || 0), 0);
    const youth = filteredReadinessRecords.reduce((acc, g) => acc + (Number(g.youth_participants) || 0), 0);
    const investors = filteredReadinessRecords.reduce((acc, g) => acc + (Number(g.investors_participants) || 0), 0);

    const totalParticipants = maleParticipants + femaleParticipants + marriedWomen + youth + investors;
    const totalWomenParticipants = femaleParticipants + marriedWomen;
    const womenRatio = totalParticipants > 0 ? ((totalWomenParticipants / totalParticipants) * 100).toFixed(1) : 0;
    const readyCount = filteredReadinessRecords.filter((g) => g.gov_status === 'Fully Ready & Verified').length;

    return {
      totalPrograms,
      avgScore,
      totalParticipants,
      maleParticipants,
      femaleParticipants,
      marriedWomen,
      totalWomenParticipants,
      youth,
      investors,
      womenRatio,
      readyCount
    };
  }, [filteredReadinessRecords]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setCollegeFilter(null);
    setCategoryFilter(null);
    setActivityFilter(null);
    setStatusFilter(null);
    setZoneFilter(null);
  };

  const handleOpenModal = (record = null) => {
    setEditingGov(record);
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

      if (editingGov) {
        setReadinessRecords((prev) =>
          prev.map((item) =>
            item.id === editingGov.id ? { ...item, ...payload, gov_status: editingGov.gov_status } : item
          )
        );
        message.success('Governance readiness record updated successfully');
      } else {
        const newRecord = {
          ...payload,
          id: Date.now().toString(),
          gov_code: values.gov_code || `GOV-${Date.now().toString().slice(-4)}`,
          gov_status: 'Fully Ready & Verified'
        };
        setReadinessRecords((prev) => [newRecord, ...prev]);
        message.success('New governance readiness evaluation registered successfully');
      }
      setIsModalOpen(false);
    } catch (error) {
      message.error(error?.response?.data?.message || error.message || 'Failed to save governance record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    setReadinessRecords((prev) => prev.filter((item) => item.id !== id));
    message.success('Governance readiness record removed');
  };

  const exportToCSV = () => {
    if (!filteredReadinessRecords.length) {
      message.warning('No readiness records available to export');
      return;
    }
    const headers = [
      'Gov Code,Title,College Name,Category,Core Activity,Readiness Score (%),Lead,Phone,FY,Zone,Woreda,Kebele,Male (ወንድ),Female (ሴት),Married Women (ባለትዳር),Youth (ወጣቶች),Investors (ባለሃብቶች),Total Participants,Status'
    ];
    const rows = filteredReadinessRecords.map((g) => {
      const total =
        (Number(g.male_participants) || 0) +
        (Number(g.female_participants) || 0) +
        (Number(g.married_women_participants) || 0) +
        (Number(g.youth_participants) || 0) +
        (Number(g.investors_participants) || 0);

      return [
        `"${g.gov_code || ''}"`,
        `"${g.gov_title || ''}"`,
        `"${g.college_name || ''}"`,
        `"${g.gov_category || ''}"`,
        `"${g.core_activity || ''}"`,
        g.readiness_score_percent || 0,
        `"${g.evaluation_lead || ''}"`,
        `"${g.lead_phone || ''}"`,
        `"${g.fiscal_year || ''}"`,
        `"${extractName(g.zone)}"`,
        `"${extractName(g.woreda)}"`,
        `"${extractName(g.kebele)}"`,
        g.male_participants || 0,
        g.female_participants || 0,
        g.married_women_participants || 0,
        g.youth_participants || 0,
        g.investors_participants || 0,
        total,
        `"${g.gov_status || ''}"`
      ].join(',');
    });

    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Governance_Readiness_FY_${fiscalYearImpactFilter.replace(/\s+/g, '_')}_${Date.now()}.csv`;
    a.click();
    message.success(`Governance readiness report for ${fiscalYearImpactFilter} exported successfully`);
  };

  const columns = [
    {
      title: 'Gov Code & Title',
      key: 'gov_info',
      width: 250,
      render: (_, r) => (
        <div>
          <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{r.gov_title}</strong>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>
            Code: <span style={{ fontFamily: 'monospace' }}>{r.gov_code}</span> | Score: <strong style={{ color: '#1a5f2c' }}>{r.readiness_score_percent}%</strong>
          </div>
        </div>
      )
    },
    {
      title: 'Evaluated College',
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
      title: 'Readiness Category',
      dataIndex: 'gov_category',
      key: 'gov_category',
      width: 210,
      render: (cat) => {
        let color = 'default';
        if (cat?.includes('Institutional Leadership')) color = 'green';
        if (cat?.includes('Financial Autonomy')) color = 'blue';
        if (cat?.includes('Infrastructure')) color = 'gold';
        if (cat?.includes('Academic Program')) color = 'purple';
        if (cat?.includes('Community Engagement')) color = 'cyan';
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
      title: 'Readiness Status (In-Place Edit)',
      dataIndex: 'gov_status',
      key: 'gov_status',
      width: 190,
      render: (status, record) => (
        <Select
          value={status || 'Fully Ready & Verified'}
          onChange={(newVal) => handleQuickStatusChange(record.id, newVal)}
          style={{ width: '100%' }}
          size="small"
        >
          <Option value="Fully Ready & Verified">
            <Tag color="success" icon={<CheckCircleOutlined />} style={{ margin: 0 }}>
              Ready & Verified
            </Tag>
          </Option>
          <Option value="Active Monitoring">
            <Tag color="processing" icon={<ClockCircleOutlined />} style={{ margin: 0 }}>
              Monitoring
            </Tag>
          </Option>
          <Option value="Capacity Building Needed">
            <Tag color="warning" icon={<ClockCircleOutlined />} style={{ margin: 0 }}>
              Needs Support
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
          <Tooltip title="View Readiness Dossier">
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: '#1890ff' }} />}
              onClick={() => {
                setSelectedGov(record);
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
              title="Delete readiness record?"
              description="Are you sure you want to remove this governance readiness record?"
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
        <Breadcrumb.Item>Institutional Governance & Readiness Evaluations</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#1a5f2c', fontFamily: "'Times New Roman', Times, serif" }}>
            Institutional Governance & Readiness Evaluations (የተቋማዊ አስተዳደርና ዝግጁነት ግምገማዎች)
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Coordinating leadership governance readiness, financial autonomy assessments, ICT facility preparedness, and accreditation evaluations
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
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Total Evaluations ({fiscalYearImpactFilter})</span>}
              value={stats.totalPrograms}
              prefix={<BankOutlined style={{ color: '#1a5f2c', marginRight: 8 }} />}
              valueStyle={{ color: '#1a5f2c', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Avg Readiness Score: <strong style={{ color: '#262626' }}>{stats.avgScore}%</strong>
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
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Fully Ready & Verified</span>}
              value={stats.readyCount}
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
                placeholder="Readiness Category"
                value={categoryFilter}
                onChange={setCategoryFilter}
                style={{ width: 195 }}
                allowClear
              >
                {READINESS_CATEGORIES.map((rc) => (
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
                {READINESS_ACTIVITIES.map((ra) => (
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
                {[...new Set(readinessRecords.map((g) => extractName(g.zone)))].map((z) => (
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
                Register Evaluation
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Main Table */}
      <Table
        columns={columns}
        dataSource={filteredReadinessRecords}
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
            <BankOutlined style={{ color: '#1a5f2c', fontSize: 20 }} />
            <span style={{ color: '#1a5f2c', fontWeight: 'bold', fontFamily: "'Times New Roman', Times, serif", fontSize: 17 }}>
              {editingGov ? 'Edit Governance Readiness Record' : `Register Governance Readiness (${fiscalYearImpactFilter})`}
            </span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText={editingGov ? 'Update Record' : 'Save Readiness Record'}
        okButtonProps={{ style: { backgroundColor: '#1a5f2c', borderColor: '#1a5f2c' }, loading: isSubmitting }}
        width={800}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Readiness Identification & College Selection
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="gov_code"
                label="Evaluation Code"
                rules={[{ required: true, message: 'Code required' }]}
              >
                <Input placeholder="e.g. GOV-2019-EG-08" />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item
                name="gov_title"
                label="Evaluation Title / Description"
                rules={[{ required: true, message: 'Title required' }]}
              >
                <Input placeholder="e.g. Bahir Dar ATVET Governance Readiness Evaluation" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="college_name"
                label="Select College (የተገመገመው ኮሌጅ)"
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
                name="gov_category"
                label="Readiness Category"
                rules={[{ required: true, message: 'Select category' }]}
              >
                <Select>
                  {READINESS_CATEGORIES.map((rc) => (
                    <Option key={rc} value={rc}>{rc}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="core_activity"
                label="Core Evaluation Activity"
                rules={[{ required: true, message: 'Select activity' }]}
              >
                <Select>
                  {READINESS_ACTIVITIES.map((ra) => (
                    <Option key={ra} value={ra}>{ra}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={10}>
              <Form.Item
                name="evaluation_lead"
                label="Evaluation Lead / Officer"
                rules={[{ required: true, message: 'Lead required' }]}
              >
                <Input placeholder="e.g. Dr. Belayneh Mekonnen" />
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
                name="readiness_score_percent"
                label="Readiness Score (%)"
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
              <Form.Item name="gov_notes" label="Evaluation Notes & Readiness Milestones">
                <TextArea rows={3} placeholder="Summarize administrative governance findings, financial autonomy, or ICT preparedness..." />
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

      {/* Comprehensive Evaluation Dossier Modal */}
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
                  {selectedGov?.gov_title}
                </span>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                  Code: <span style={{ fontFamily: 'monospace' }}>{selectedGov?.gov_code}</span> | Lead:{' '}
                  {selectedGov?.evaluation_lead}
                </div>
              </div>
            </div>
            <div>
              <Tag
                color={selectedGov?.gov_status === 'Fully Ready & Verified' ? 'success' : 'processing'}
                icon={selectedGov?.gov_status === 'Fully Ready & Verified' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                style={{ fontSize: 12, padding: '2px 10px', borderRadius: 12 }}
              >
                {selectedGov?.gov_status || 'Ready & Verified'}
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
              handleOpenModal(selectedGov);
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
        {selectedGov && (
          <div style={{ paddingTop: 8 }}>
            {/* Top Metric Strip */}
            <Row gutter={12} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f6ffed', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Readiness Score</span>}
                    value={selectedGov.readiness_score_percent || 0}
                    suffix="%"
                    valueStyle={{ fontSize: 15, fontWeight: 'bold', color: '#1a5f2c' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f0f5ff', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Category</span>}
                    value={selectedGov.gov_category?.split(' ')[0] || 'Category'}
                    valueStyle={{ fontSize: 15, fontWeight: 'bold', color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f9f0ff', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Women Share</span>}
                    value={
                      (Number(selectedGov.male_participants) || 0) +
                      (Number(selectedGov.female_participants) || 0) +
                      (Number(selectedGov.married_women_participants) || 0) +
                      (Number(selectedGov.youth_participants) || 0) +
                      (Number(selectedGov.investors_participants) || 0) > 0
                        ? (
                            (((Number(selectedGov.female_participants) || 0) +
                              (Number(selectedGov.married_women_participants) || 0)) /
                              ((Number(selectedGov.male_participants) || 0) +
                                (Number(selectedGov.female_participants) || 0) +
                                (Number(selectedGov.married_women_participants) || 0) +
                                (Number(selectedGov.youth_participants) || 0) +
                                (Number(selectedGov.investors_participants) || 0))) *
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
                    value={selectedGov.fiscal_year}
                    valueStyle={{ fontSize: 13, fontWeight: 'bold', color: '#fa8c16' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* TABPANES */}
            <Tabs defaultActiveKey="1" type="card">
              {/* TAB 1: Evaluation Profile */}
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
                  <Descriptions.Item label="Evaluation Title" span={2}>
                    <strong style={{ color: '#1a5f2c' }}>{selectedGov.gov_title}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Evaluated College">
                    <Tag color="green"><BankOutlined /> {selectedGov.college_name}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Readiness Category">
                    <Tag color="purple">{selectedGov.gov_category}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Core Activity" span={2}>
                    <Tag color="blue">{selectedGov.core_activity}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Evaluation Lead" span={2}>
                    {selectedGov.evaluation_lead} ({selectedGov.lead_phone})
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
                          {Number(selectedGov.male_participants || 0).toLocaleString()}
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
                          {Number(selectedGov.female_participants || 0).toLocaleString()}
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
                          {Number(selectedGov.married_women_participants || 0).toLocaleString()}
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
                          {Number(selectedGov.youth_participants || 0).toLocaleString()}
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
                          {Number(selectedGov.investors_participants || 0).toLocaleString()}
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
                    Evaluation Notes & Milestones
                  </span>
                }
                key="2"
              >
                <Card size="small" bordered={false} style={{ background: '#fcfdfd', border: '1px solid #e6f7ed', borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <CheckCircleOutlined style={{ color: '#1a5f2c', fontSize: 16 }} />
                    <strong style={{ color: '#1a5f2c', fontSize: 13, textTransform: 'uppercase' }}>
                      Governance Readiness Notes (የተቋማዊ ዝግጁነት ግምገማ ማስታወሻ)
                    </strong>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: '#262626', lineHeight: '1.6' }}>
                    {selectedGov.gov_notes || 'Active institutional governance and readiness evaluation record.'}
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
                    <strong>{extractName(selectedGov.zone)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Woreda">
                    <strong>{extractName(selectedGov.woreda)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Kebele Operational Base">
                    <span style={{ color: '#1a5f2c', fontWeight: 'bold' }}>
                      {extractName(selectedGov.kebele)}
                    </span>
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
                  <Descriptions.Item label="Fiscal Year (በጀት ዓመት)">
                    <Tag color="blue" icon={<CalendarOutlined />}>
                      {selectedGov.fiscal_year || '2019 E.C.'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Readiness Score">
                    <strong>{selectedGov.readiness_score_percent}% Readiness</strong>
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

export default function GovernanceReadiness() {
  return (
    <App>
      <GovernanceReadinessContent />
    </App>
  );
}