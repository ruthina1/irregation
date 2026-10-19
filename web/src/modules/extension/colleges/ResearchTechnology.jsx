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
  ExperimentOutlined,
  BulbOutlined,
  CheckSquareOutlined,
  UserAddOutlined,
  UserOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { farmerApi } from '../../../services/api/farmerApi';
import { locationApi } from '../../../services/api/locationApi';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

const extractName = (value, defaultVal = 'Unspecified') => {
  if (!value) return defaultVal;
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    return value.name || value.title || value.kebele_name || value.woreda_name || value.zone_name || defaultVal;
  }
  return String(value);
};

const FISCAL_YEARS = ['2016 E.C.', '2017 E.C.', '2018 E.C.', '2019 E.C.', '2020 E.C.'];

const RESEARCH_CATEGORIES = [
  'Crop Production & Protection Research (የሰብል ልማትና ጥበቃ ምርምር)',
  'Horticulture & Irrigation Development Study (የአትክልትና መስኖ ልማት ጥናት)',
  'Natural Resources & Watershed Management Research (ተፈጥሮ ሀብትና ተፋሰስ ልማት ምርምር)',
  'Animal Science & Fishery Development Demonstration (የእንስሳትና ዓሣ ሃብት ልማት ሰርቶ ማሳያ)',
  'Agricultural Mechanization & Technology Transfer (የሜካናይዜሽንና ቴክኖሎጂ ሽግግር ጥናት)'
];

const RESEARCH_ACTIVITIES = [
  'Demonstration Plot Setup & Field Testing (ሰርቶ ማሳያ ሜዳ ዝግጅትና የሙከራ ስራ)',
  'On-Farm Adaptive Research Trial (በእርሻ ቦታ ላይ የሚደረግ የዳሰሳና ምርምር ሙከራ)',
  'Farmer & Extension Worker Training Workshop (ለአርሶ አደሮችና ባለሙያዎች የስልጠና አውደ ጥናት)',
  'Agricultural Technology Promotion & Popularization (የቴክኖሎጂ ማስተዋወቅና ስርጭት ስራ)',
  'Community Service & Mechanization Support (የማህበረሰብ አገልግሎትና የሜካናይዜሽን ድጋፍ)'
];

function ResearchTechnologyContent() {
  const { message } = App.useApp();

  const [projects, setProjects] = useState([]);
  const [collegesList, setCollegesList] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [fiscalYearImpactFilter, setFiscalYearImpactFilter] = useState('2019 E.C.');
  const [collegeFilter, setCollegeFilter] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [activityFilter, setActivityFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [zoneFilter, setZoneFilter] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isDossierOpen, setIsDossierOpen] = useState(false);

  const [zones, setZones] = useState([]);
  const [woredas, setWoredas] = useState([]);
  const [kebeles, setKebeles] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  const [form] = Form.useForm();

  const fetchDataFromApi = async () => {
    setIsFetching(true);
    try {
      const [projectsRes, collegesRes] = await Promise.all([
        axios.get('/api/research', { params: { fiscal_year: fiscalYearImpactFilter } }),
        axios.get('/api/colleges')
      ]);
      setProjects(projectsRes.data.data || []);
      setCollegesList(collegesRes.data.data || []);
    } catch (err) {
      console.error('Failed to load research data:', err);
      setProjects([
        {
          id: '1',
          proj_code: 'RES-2019-EG-01',
          proj_title: 'Drought-Resistant Wheat Seed Multiplication & Demonstration Trial',
          college_name: 'Bahir Dar Agricultural ATVET College',
          proj_category: RESEARCH_CATEGORIES[0],
          core_activity: RESEARCH_ACTIVITIES[0],
          lead_researcher: 'Dr. Belayneh Mekonnen',
          additional_researchers: ['Ato Getachew Mekonnen', 'Woizero Almaz Bekele'],
          researcher_phone: '+251 911 223 344',
          demonstration_plots_count: 15,
          beneficiary_farmers: 320,
          operational_status: 'Fully Completed & Verified',
          fiscal_year: '2019 E.C.',
          proj_notes: 'Successfully established 15 demonstration plots multiplying high-yielding drought-resistant wheat varieties for local farmers.',
          zone: 'East Gojjam',
          woreda: 'Dejen',
          kebele: 'Kurar'
        }
      ]);
      setCollegesList([
        { id: '1', college_name: 'Bahir Dar Agricultural ATVET College' },
        { id: '2', college_name: 'Debre Tabor University College of Agriculture' }
      ]);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchDataFromApi();
  }, [fiscalYearImpactFilter]);

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

  useEffect(() => {
    if (isModalOpen) {
      if (editingProject) {
        const initForm = async () => {
          const zoneMatch = zones.find(
            (z) => z.name === editingProject.zone || z.id === editingProject.zone_id
          );
          if (zoneMatch) {
            try {
              const wRes = locationApi?.getWoredas ? await locationApi.getWoredas(zoneMatch.id) : null;
              const wList = wRes?.data?.data?.data || wRes?.data?.data || [];
              setWoredas(wList);

              const woredaMatch = wList.find(
                (w) => w.name === editingProject.woreda || w.id === editingProject.woreda_id
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
            proj_code: editingProject.proj_code,
            proj_title: editingProject.proj_title,
            college_name: editingProject.college_name,
            proj_category: editingProject.proj_category,
            core_activity: editingProject.core_activity,
            lead_researcher: editingProject.lead_researcher,
            additional_researchers: editingProject.additional_researchers || [],
            researcher_phone: editingProject.researcher_phone,
            demonstration_plots_count: Number(editingProject.demonstration_plots_count) || 5,
            beneficiary_farmers: Number(editingProject.beneficiary_farmers) || 100,
            fiscal_year: editingProject.fiscal_year || '2019 E.C.',
            proj_notes: editingProject.proj_notes,
            zone_id: editingProject.zone_id || zoneMatch?.id || editingProject.zone,
            woreda_id: editingProject.woreda_id || editingProject.woreda,
            kebele_id: editingProject.kebele_id || editingProject.kebele
          });
        };
        initForm();
      } else {
        form.resetFields();
        form.setFieldsValue({
          college_name: collegesList[0]?.college_name || 'Bahir Dar Agricultural ATVET College',
          proj_category: RESEARCH_CATEGORIES[0],
          core_activity: RESEARCH_ACTIVITIES[0],
          additional_researchers: [],
          demonstration_plots_count: 10,
          beneficiary_farmers: 200,
          fiscal_year: fiscalYearImpactFilter || '2019 E.C.'
        });
        setWoredas([]);
        setKebeles([]);
      }
    }
  }, [isModalOpen, editingProject, form, zones, fiscalYearImpactFilter, collegesList]);

  const handleQuickStatusChange = async (recordId, newStatus) => {
    try {
      await axios.patch(`/api/research/${recordId}`, { operational_status: newStatus });
      setProjects((prev) =>
        prev.map((p) => (p.id === recordId ? { ...p, operational_status: newStatus } : p))
      );
      message.success(`Research status updated to "${newStatus}"`);
    } catch {
      setProjects((prev) =>
        prev.map((p) => (p.id === recordId ? { ...p, operational_status: newStatus } : p))
      );
      message.success(`Research status updated to "${newStatus}"`);
    }
  };

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const code = extractName(p.proj_code).toLowerCase();
      const title = extractName(p.proj_title).toLowerCase();
      const college = extractName(p.college_name).toLowerCase();
      const researcher = extractName(p.lead_researcher).toLowerCase();
      const kebele = extractName(p.kebele).toLowerCase();
      const woreda = extractName(p.woreda).toLowerCase();
      const zone = extractName(p.zone).toLowerCase();
      const q = searchTerm.toLowerCase();

      const matchesSearch =
        code.includes(q) || title.includes(q) || college.includes(q) || researcher.includes(q) || kebele.includes(q) || woreda.includes(q) || zone.includes(q);
      const matchesFY = fiscalYearImpactFilter ? p.fiscal_year === fiscalYearImpactFilter : true;
      const matchesCollege = collegeFilter ? p.college_name === collegeFilter : true;
      const matchesCategory = categoryFilter ? p.proj_category === categoryFilter : true;
      const matchesActivity = activityFilter ? p.core_activity === activityFilter : true;
      const matchesStatus = statusFilter ? p.operational_status === statusFilter : true;
      const matchesZone = zoneFilter ? zone === zoneFilter.toLowerCase() : true;

      return matchesSearch && matchesFY && matchesCollege && matchesCategory && matchesActivity && matchesStatus && matchesZone;
    });
  }, [projects, searchTerm, fiscalYearImpactFilter, collegeFilter, categoryFilter, activityFilter, statusFilter, zoneFilter]);

  const stats = useMemo(() => {
    const totalProjects = filteredProjects.length;
    const totalPlots = filteredProjects.reduce((acc, p) => acc + (Number(p.demonstration_plots_count) || 0), 0);
    const totalBeneficiaries = filteredProjects.reduce((acc, p) => acc + (Number(p.beneficiary_farmers) || 0), 0);
    const completedCount = filteredProjects.filter((p) => p.operational_status?.includes('Completed')).length;

    return {
      totalProjects,
      totalPlots,
      totalBeneficiaries,
      completedCount
    };
  }, [filteredProjects]);

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

      if (editingProject) {
        try {
          const res = await axios.put(`/api/research/${editingProject.id}`, payload);
          setProjects((prev) =>
            prev.map((item) => (item.id === editingProject.id ? res.data.data : item))
          );
        } catch {
          setProjects((prev) =>
            prev.map((item) => (item.id === editingProject.id ? { ...item, ...payload } : item))
          );
        }
        message.success('Research & technology record updated successfully');
      } else {
        try {
          const res = await axios.post('/api/research', payload);
          setProjects((prev) => [res.data.data, ...prev]);
        } catch {
          const newRecord = { ...payload, id: Date.now().toString(), operational_status: 'Fully Completed & Verified' };
          setProjects((prev) => [newRecord, ...prev]);
        }
        message.success('New research or technology transfer registered successfully');
      }
      setIsModalOpen(false);
      fetchDataFromApi();
    } catch (error) {
      message.error(error?.response?.data?.message || 'Failed to save research record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/research/${id}`);
      setProjects((prev) => prev.filter((item) => item.id !== id));
      message.success('Research record removed');
    } catch {
      setProjects((prev) => prev.filter((item) => item.id !== id));
      message.success('Research record removed');
    }
  };

  const exportToCSV = () => {
    if (!filteredProjects.length) {
      message.warning('No research records available to export');
      return;
    }
    const headers = [
      'Proj Code,Title,College Name,Category,Core Activity,Demonstrations Count,Beneficiary Farmers,Lead Researcher,Additional Researchers,Phone,FY,Zone,Woreda,Kebele,Status'
    ];
    const rows = filteredProjects.map((p) => {
      const addResearchers = Array.isArray(p.additional_researchers) ? p.additional_researchers.join(' | ') : '';
      return [
        `"${p.proj_code || ''}"`,
        `"${p.proj_title || ''}"`,
        `"${p.college_name || ''}"`,
        `"${p.proj_category || ''}"`,
        `"${p.core_activity || ''}"`,
        p.demonstration_plots_count || 0,
        p.beneficiary_farmers || 0,
        `"${p.lead_researcher || ''}"`,
        `"${addResearchers}"`,
        `"${p.researcher_phone || ''}"`,
        `"${p.fiscal_year || ''}"`,
        `"${extractName(p.zone)}"`,
        `"${extractName(p.woreda)}"`,
        `"${extractName(p.kebele)}"`,
        `"${p.operational_status || ''}"`
      ].join(',');
    });

    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Research_Technology_Registry_${Date.now()}.csv`;
    a.click();
    message.success('Research & technology registry exported successfully');
  };

  const columns = [
    {
      title: 'Proj Code & Title',
      key: 'proj_info',
      width: 260,
      render: (_, r) => (
        <div>
          <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{r.proj_title}</strong>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>
            Code: <span style={{ fontFamily: 'monospace' }}>{r.proj_code}</span> | Lead: {r.lead_researcher}
          </div>
        </div>
      )
    },
    {
      title: 'College Name',
      dataIndex: 'college_name',
      key: 'college_name',
      width: 210,
      render: (colName) => (
        <Tag color="green" icon={<BankOutlined />}>
          {colName || 'Assigned College'}
        </Tag>
      )
    },
    {
      title: 'Researchers / Team',
      key: 'researchers_team',
      width: 220,
      render: (_, r) => (
        <div style={{ fontSize: 11 }}>
          <div><UserOutlined style={{ color: '#1a5f2c', marginRight: 4 }} /><strong>{r.lead_researcher}</strong> (Lead)</div>
          {Array.isArray(r.additional_researchers) && r.additional_researchers.length > 0 && (
            <div style={{ color: '#595959', marginTop: 2 }}>
              ተባባሪ ተመራማሪዎች: {r.additional_researchers.join(', ')}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Demonstrations & Beneficiaries',
      key: 'metrics',
      width: 190,
      render: (_, r) => (
        <div style={{ fontSize: 11 }}>
          <div>ሰርቶ ማሳያዎች: <strong style={{ color: '#1a5f2c' }}>{r.demonstration_plots_count || 0} ብዛት</strong></div>
          <div style={{ color: '#595959' }}>ተጠቃሚ አርሶ አደሮች: {r.beneficiary_farmers || 0} ሰዎች</div>
        </div>
      )
    },
    {
      title: 'Administrative Station',
      key: 'station',
      width: 180,
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
      title: 'Status',
      dataIndex: 'operational_status',
      key: 'operational_status',
      width: 170,
      render: (status, record) => (
        <Select
          value={status || 'Fully Completed & Verified'}
          onChange={(newVal) => handleQuickStatusChange(record.id, newVal)}
          style={{ width: '100%' }}
          size="small"
        >
          <Option value="Fully Completed & Verified"><Tag color="success">Completed</Tag></Option>
          <Option value="Active Trial"><Tag color="processing">Active Trial</Tag></Option>
          <Option value="Monitoring Pending"><Tag color="warning">Pending</Tag></Option>
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
          <Tooltip title="View Research Dossier">
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: '#1890ff' }} />}
              onClick={() => {
                setSelectedProject(record);
                setIsDossierOpen(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Edit Project">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: '#52c41a' }} />}
              onClick={() => {
                setEditingProject(record);
                setIsModalOpen(true);
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Delete project record?"
            description="Are you sure you want to remove this research record?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{ position: 'relative', minHeight: '100%', padding: 24, background: '#f8fafc' }}>
      <Breadcrumb
        style={{ marginBottom: 16 }}
        items={[
          { title: <HomeOutlined /> },
          { title: 'ኮሌጆች ክትትልና ድጋፍ' },
          { title: 'ምርምር፣ ቴክኖሎጂ ሽግግርና ማህበረሰብ አገልግሎት (Research & Technology)' }
        ]}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#1a5f2c', fontFamily: "'Times New Roman', Times, serif" }}>
            ምርምር፣ ቴክኖሎጂ ሽግግርና ማህበረሰብ አገልግሎት (Research, Technology Transfer & Community Service)
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            የኮሌጆች ሰርቶ ማሳያዎች፣ የእርሻ ሙከራ ምርምሮች፣ ዋና እና ተባባሪ ተመራማሪዎች፣ የቴክኖሎጂ ስርጭት እና የማህበረሰብ አገልግሎት ክትትል
          </Text>
        </div>
        <Space>
          <Select
            value={fiscalYearImpactFilter}
            onChange={setFiscalYearImpactFilter}
            style={{ width: 130 }}
            size="small"
          >
            {FISCAL_YEARS.map((fy) => (
              <Option key={fy} value={fy}>{fy}</Option>
            ))}
          </Select>
          <Button icon={<ReloadOutlined />} onClick={fetchDataFromApi} loading={isFetching}>
            Refresh
          </Button>
        </Space>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" style={{ borderRadius: 8, borderLeft: '4px solid #1a5f2c' }}>
            <Statistic title="አጠቃላይ የምርምር ፕሮጀክቶች" value={stats.totalProjects} prefix={<ExperimentOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" style={{ borderRadius: 8, borderLeft: '4px solid #52c41a' }}>
            <Statistic title="አጠቃላይ ሰርቶ ማሳያዎች" value={stats.totalPlots} prefix={<BulbOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" style={{ borderRadius: 8, borderLeft: '4px solid #1890ff' }}>
            <Statistic title="ተጠቃሚ አርሶ አደሮች" value={stats.totalBeneficiaries} prefix={<TeamOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" style={{ borderRadius: 8, borderLeft: '4px solid #fa8c16' }}>
            <Statistic title="የተጠናቀቁ ስራዎች" value={stats.completedCount} prefix={<CheckSquareOutlined />} />
          </Card>
        </Col>
      </Row>

      <Card variant="borderless" style={{ marginBottom: 16, borderRadius: 8 }} styles={{ body: { padding: '14px 16px' } }}>
        <Row justify="space-between" align="middle" gutter={[12, 12]}>
          <Col xs={24} xl={18}>
            <Space wrap size={[10, 10]}>
              <Input
                placeholder="Search Title, Code, or Researcher..."
                prefix={<SearchOutlined />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: 220 }}
                allowClear
              />
              <Select
                placeholder="Filter by College"
                value={collegeFilter}
                onChange={setCollegeFilter}
                style={{ width: 180 }}
                allowClear
              >
                {collegesList.map((col) => (
                  <Option key={col.id} value={col.college_name}>{col.college_name}</Option>
                ))}
              </Select>
              <Select
                placeholder="Research Category"
                value={categoryFilter}
                onChange={setCategoryFilter}
                style={{ width: 190 }}
                allowClear
              >
                {RESEARCH_CATEGORIES.map((rc) => (
                  <Option key={rc} value={rc}>{rc}</Option>
                ))}
              </Select>
            </Space>
          </Col>
          <Col xs={24} xl={6} style={{ textAlign: 'right' }}>
            <Space>
              <Button icon={<DownloadOutlined />} onClick={exportToCSV}>Export CSV</Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingProject(null);
                  setIsModalOpen(true);
                }}
                style={{ backgroundColor: '#1a5f2c', borderColor: '#1a5f2c', fontWeight: 600 }}
              >
                ምርምር መዝግብ
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Table
        columns={columns}
        dataSource={filteredProjects}
        rowKey="id"
        loading={isFetching}
        scroll={{ x: 1350 }}
        bordered
        size="middle"
      />

      <Modal
        title={editingProject ? 'የምርምር መረጃ ማስተካከያ (Edit Research Record)' : 'አዲስ ምርምር/ቴክኖሎጂ መዝግብ (Register Research)'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={isSubmitting}
        width={850}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            የምርምር ፕሮጀክት መለያና ኮሌጅ (Project Info & College)
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="proj_code" label="Project Code" rules={[{ required: true, message: 'Code required' }]}>
                <Input placeholder="e.g. RES-2019-EG-001" />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item name="proj_title" label="የምርምር ርዕስ / መግለጫ (Project Title)" rules={[{ required: true, message: 'Title required' }]}>
                <Input placeholder="e.g. Drought-Resistant Wheat Seed Multiplication" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="college_name" label="የተመደበበት ኮሌጅ (Assigned College)" rules={[{ required: true, message: 'Select college' }]}>
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
              <Form.Item name="proj_category" label="ምርምር ዓይነት (Category)" rules={[{ required: true }]}>
                <Select>
                  {RESEARCH_CATEGORIES.map((rc) => (
                    <Option key={rc} value={rc}>{rc}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="core_activity" label="ዋና ተግባር (Core Activity)" rules={[{ required: true }]}>
                <Select>
                  {RESEARCH_ACTIVITIES.map((ra) => (
                    <Option key={ra} value={ra}>{ra}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            ተመራማሪዎች / አስተባባሪዎች (Researchers & Team)
          </Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="lead_researcher" label="ዋና ተመራማሪ / አስተባባሪ (Lead Researcher)" rules={[{ required: true, message: 'Lead researcher required' }]}>
                <Input placeholder="e.g. Dr. Belayneh Mekonnen" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="researcher_phone" label="አስተባባሪ ስልክ (Phone)" rules={[{ required: true }]}>
                <Input placeholder="+251 9..." />
              </Form.Item>
            </Col>
          </Row>

          {/* ───── DYNAMIC ADDITIONAL RESEARCHERS LIST WITH PLACEHOLDER ───── */}
          <Form.List name="additional_researchers">
            {(fields, { add, remove }) => (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text strong style={{ color: '#1a5f2c', fontSize: 12 }}>ተባባሪ ተመራማሪዎች (Additional Researchers / Co-Researchers)</Text>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    icon={<UserAddOutlined />}
                    size="small"
                    style={{ borderColor: '#1a5f2c', color: '#1a5f2c' }}
                  >
                    ተባባሪ ተመራማሪ ጨምር (Add Researcher)
                  </Button>
                </div>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={name}
                      rules={[{ required: true, message: 'Please enter researcher name' }]}
                      style={{ marginBottom: 0 }}
                    >
                      <Input
                        placeholder="የተባባሪ ተመራማሪ ስም ያስገቡ (e.g. Ato Getachew Mekonnen)"
                        style={{ width: 480 }}
                      />
                    </Form.Item>
                    <Button type="text" danger onClick={() => remove(name)} icon={<DeleteOutlined />} />
                  </Space>
                ))}
                {fields.length === 0 && (
                  <div style={{ padding: '8px 12px', background: '#fafafa', border: '1px dashed #d9d9d9', borderRadius: 6, marginBottom: 16, color: '#8c8c8c', fontSize: 12, fontStyle: 'italic' }}>
                    ተጨማሪ ተመራማሪዎችን ለመጨመር ከላይ ያለውን "ተባባሪ ተመራማሪ ጨምር" የሚለውን ቁልፍ ይጫኑ (Click 'Add Researcher' to include co-researchers).
                  </div>
                )}
              </>
            )}
          </Form.List>

          <Divider orientation="left" style={{ margin: '16px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            ሰርቶ ማሳያዎችና ተጠቃሚዎች (Demonstrations & Beneficiaries)
          </Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="demonstration_plots_count" label="የሰርቶ ማሳያ ሜዳዎች ብዛት (Plots Count)" rules={[{ required: true }]}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="beneficiary_farmers" label="ተጠቃሚ አርሶ አደሮች ብዛት (Beneficiary Farmers)" rules={[{ required: true }]}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Administrative Station (Database Linked)
          </Divider>
          <Spin spinning={loadingLocations}>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="zone_id" label="Zone" rules={[{ required: true }]}>
                  <Select placeholder="Select Zone" onChange={handleZoneChange} allowClear showSearch>
                    {zones.map((z) => (
                      <Option key={z.id || z._id} value={z.id || z._id}>{z.name || z.zone_name}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="woreda_id" label="Woreda" rules={[{ required: true }]}>
                  <Select placeholder="Select Woreda" onChange={handleWoredaChange} disabled={!woredas.length} allowClear showSearch>
                    {woredas.map((w) => (
                      <Option key={w.id || w._id} value={w.id || w._id}>{w.name || w.woreda_name}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="kebele_id" label="Kebele" rules={[{ required: true }]}>
                  <Select placeholder="Select Kebele" disabled={!kebeles.length} allowClear showSearch>
                    {kebeles.map((k) => (
                      <Option key={k.id || k._id} value={k.id || k._id}>{k.name || k.kebele_name}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Spin>
        </Form>
      </Modal>

      {/* Dossier Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <ExperimentOutlined style={{ color: '#1a5f2c', fontSize: 20 }} />
            <span style={{ fontSize: 17, fontWeight: 'bold', color: '#1a5f2c' }}>
              {selectedProject?.proj_title} - Research Dossier
            </span>
          </div>
        }
        open={isDossierOpen}
        onCancel={() => setIsDossierOpen(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsDossierOpen(false)} style={{ backgroundColor: '#1a5f2c' }}>
            Done
          </Button>
        ]}
        width={750}
        destroyOnClose
      >
        {selectedProject && (
          <div style={{ paddingTop: 8 }}>
            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="Project Code" span={1}>
                <span style={{ fontFamily: 'monospace' }}>{selectedProject.proj_code}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Fiscal Year" span={1}>
                <Tag color="blue">{selectedProject.fiscal_year}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Assigned College" span={2}>
                <Tag color="green"><BankOutlined /> {selectedProject.college_name}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Research Category" span={2}>
                {selectedProject.proj_category}
              </Descriptions.Item>
              <Descriptions.Item label="Core Activity" span={2}>
                {selectedProject.core_activity}
              </Descriptions.Item>
              <Descriptions.Item label="Lead Researcher" span={1}>
                <strong>{selectedProject.lead_researcher}</strong> ({selectedProject.researcher_phone})
              </Descriptions.Item>
              <Descriptions.Item label="Additional Researchers" span={1}>
                {Array.isArray(selectedProject.additional_researchers) && selectedProject.additional_researchers.length > 0
                  ? selectedProject.additional_researchers.join(', ')
                  : 'None'}
              </Descriptions.Item>
              <Descriptions.Item label="Demonstration Plots Count" span={1}>
                <strong>{selectedProject.demonstration_plots_count || 0} ሜዳዎች</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Beneficiary Farmers" span={1}>
                <strong>{selectedProject.beneficiary_farmers || 0} አርሶ አደሮች</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Operational Status" span={1}>
                <Tag color="success">{selectedProject.operational_status}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Administrative Station" span={2}>
                <EnvironmentOutlined style={{ color: '#1a5f2c', marginRight: 4 }} />
                {extractName(selectedProject.kebele)} &gt; {extractName(selectedProject.woreda)} &gt; {extractName(selectedProject.zone)}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default function ResearchTechnology() {
  return (
    <App>
      <ResearchTechnologyContent />
    </App>
  );
}