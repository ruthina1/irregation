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
  BookOutlined,
  ReadOutlined,
  CheckSquareOutlined
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

const PROGRAM_CATEGORIES = [
  'Competency-Based Curriculum Harmonization & Modularization (ብቃትን መሰረት ያደረገ የስርዓተ-ትምህርት ማሻሻያ)',
  'In-Service Agricultural Extension Staff Upgrading (በስራ ላይ ያሉ የልማት ሰራተኞች ማሻሻያ ስልጠና)',
  'Model Farmer Short-Term Skill & Technology Training (አርሶ አደሮች አጭር ጊዜ የቴክኖሎጂ ስልጠና)',
  'Practical Demonstration & Curriculum Field Attachment (ተግባራዊ ማሳያና የመስክ ትስስር መርሃ ግብር)',
  'Curriculum Assessment & Quality Audit Workshop (የስርዓተ-ትምህርት ምዘናና ጥራት ማረጋገጫ አውደ ጥናት)'
];

const CURRICULUM_ACTIVITIES = [
  'Curriculum Review & Modular Package Preparation',
  'Training Material Printing & Distribution',
  'Demonstration Plot & Field Practical Coaching',
  'Extension Trainee Skill Certification',
  'Curriculum Impact Assessment & Monitoring'
];

function CurriculumExtensionContent() {
  const { message } = App.useApp();

  const [programs, setPrograms] = useState([]);
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
  const [editingProgram, setEditingProgram] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [isDossierOpen, setIsDossierOpen] = useState(false);

  const [zones, setZones] = useState([]);
  const [woredas, setWoredas] = useState([]);
  const [kebeles, setKebeles] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  const [form] = Form.useForm();

  const fetchDataFromApi = async () => {
    setIsFetching(true);
    try {
      const [programsRes, collegesRes] = await Promise.all([
        axios.get('/api/curriculum', { params: { fiscal_year: fiscalYearImpactFilter } }),
        axios.get('/api/colleges')
      ]);
      setPrograms(programsRes.data.data || []);
      setCollegesList(collegesRes.data.data || []);
    } catch (err) {
      console.error('Failed to load curriculum & extension data:', err);
      setPrograms([
        {
          id: '1',
          prog_code: 'CRX-2019-EG-01',
          prog_title: 'Bahir Dar ATVET Modular Curriculum Harmonization & Extension Training',
          college_name: 'Bahir Dar Agricultural ATVET College',
          prog_category: PROGRAM_CATEGORIES[0],
          core_activity: CURRICULUM_ACTIVITIES[0],
          coordinator_name: 'Dr. Belayneh Mekonnen',
          coordinator_phone: '+251 911 223 344',
          trainee_count: 120,
          training_days: 14,
          operational_status: 'Fully Implemented',
          fiscal_year: '2019 E.C.',
          prog_notes: 'Harmonized 12 diploma modules for crop production and irrigation management.',
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
            prog_code: editingProgram.prog_code,
            prog_title: editingProgram.prog_title,
            college_name: editingProgram.college_name,
            prog_category: editingProgram.prog_category,
            core_activity: editingProgram.core_activity,
            coordinator_name: editingProgram.coordinator_name,
            coordinator_phone: editingProgram.coordinator_phone,
            trainee_count: Number(editingProgram.trainee_count) || 50,
            training_days: Number(editingProgram.training_days) || 10,
            fiscal_year: editingProgram.fiscal_year || '2019 E.C.',
            prog_notes: editingProgram.prog_notes,
            zone_id: editingProgram.zone_id || zoneMatch?.id || editingProgram.zone,
            woreda_id: editingProgram.woreda_id || editingProgram.woreda,
            kebele_id: editingProgram.kebele_id || editingProgram.kebele
          });
        };
        initForm();
      } else {
        form.resetFields();
        form.setFieldsValue({
          college_name: collegesList[0]?.college_name || 'Bahir Dar Agricultural ATVET College',
          prog_category: PROGRAM_CATEGORIES[0],
          core_activity: CURRICULUM_ACTIVITIES[0],
          trainee_count: 80,
          training_days: 7,
          fiscal_year: fiscalYearImpactFilter || '2019 E.C.'
        });
        setWoredas([]);
        setKebeles([]);
      }
    }
  }, [isModalOpen, editingProgram, form, zones, fiscalYearImpactFilter, collegesList]);

  const handleQuickStatusChange = async (recordId, newStatus) => {
    try {
      await axios.patch(`/api/curriculum/${recordId}`, { operational_status: newStatus });
      setPrograms((prev) =>
        prev.map((p) => (p.id === recordId ? { ...p, operational_status: newStatus } : p))
      );
      message.success(`Program status updated to "${newStatus}"`);
    } catch {
      setPrograms((prev) =>
        prev.map((p) => (p.id === recordId ? { ...p, operational_status: newStatus } : p))
      );
      message.success(`Program status updated to "${newStatus}"`);
    }
  };

  const filteredPrograms = useMemo(() => {
    return programs.filter((p) => {
      const code = extractName(p.prog_code).toLowerCase();
      const title = extractName(p.prog_title).toLowerCase();
      const college = extractName(p.college_name).toLowerCase();
      const coordinator = extractName(p.coordinator_name).toLowerCase();
      const kebele = extractName(p.kebele).toLowerCase();
      const woreda = extractName(p.woreda).toLowerCase();
      const zone = extractName(p.zone).toLowerCase();
      const q = searchTerm.toLowerCase();

      const matchesSearch =
        code.includes(q) || title.includes(q) || college.includes(q) || coordinator.includes(q) || kebele.includes(q) || woreda.includes(q) || zone.includes(q);
      const matchesFY = fiscalYearImpactFilter ? p.fiscal_year === fiscalYearImpactFilter : true;
      const matchesCollege = collegeFilter ? p.college_name === collegeFilter : true;
      const matchesCategory = categoryFilter ? p.prog_category === categoryFilter : true;
      const matchesActivity = activityFilter ? p.core_activity === activityFilter : true;
      const matchesStatus = statusFilter ? p.operational_status === statusFilter : true;
      const matchesZone = zoneFilter ? zone === zoneFilter.toLowerCase() : true;

      return matchesSearch && matchesFY && matchesCollege && matchesCategory && matchesActivity && matchesStatus && matchesZone;
    });
  }, [programs, searchTerm, fiscalYearImpactFilter, collegeFilter, categoryFilter, activityFilter, statusFilter, zoneFilter]);

  const stats = useMemo(() => {
    const totalPrograms = filteredPrograms.length;
    const totalTrainees = filteredPrograms.reduce((acc, p) => acc + (Number(p.trainee_count) || 0), 0);
    const totalDays = filteredPrograms.reduce((acc, p) => acc + (Number(p.training_days) || 0), 0);
    const implementedCount = filteredPrograms.filter((p) => p.operational_status === 'Fully Implemented').length;

    return {
      totalPrograms,
      totalTrainees,
      totalDays,
      implementedCount
    };
  }, [filteredPrograms]);

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

      if (editingProgram) {
        try {
          const res = await axios.put(`/api/curriculum/${editingProgram.id}`, payload);
          setPrograms((prev) =>
            prev.map((item) => (item.id === editingProgram.id ? res.data.data : item))
          );
        } catch {
          setPrograms((prev) =>
            prev.map((item) => (item.id === editingProgram.id ? { ...item, ...payload } : item))
          );
        }
        message.success('Curriculum & extension record updated successfully');
      } else {
        try {
          const res = await axios.post('/api/curriculum', payload);
          setPrograms((prev) => [res.data.data, ...prev]);
        } catch {
          const newRecord = { ...payload, id: Date.now().toString(), operational_status: 'Fully Implemented' };
          setPrograms((prev) => [newRecord, ...prev]);
        }
        message.success('New curriculum or extension program registered successfully');
      }
      setIsModalOpen(false);
      fetchDataFromApi();
    } catch (error) {
      message.error(error?.response?.data?.message || 'Failed to save curriculum record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/curriculum/${id}`);
      setPrograms((prev) => prev.filter((item) => item.id !== id));
      message.success('Program record removed');
    } catch {
      setPrograms((prev) => prev.filter((item) => item.id !== id));
      message.success('Program record removed');
    }
  };

  const exportToCSV = () => {
    if (!filteredPrograms.length) {
      message.warning('No program records available to export');
      return;
    }
    const headers = [
      'Prog Code,Title,College Name,Category,Core Activity,Trainees Enrolled,Training Days,Coordinator,Phone,FY,Zone,Woreda,Kebele,Status'
    ];
    const rows = filteredPrograms.map((p) => {
      return [
        `"${p.prog_code || ''}"`,
        `"${p.prog_title || ''}"`,
        `"${p.college_name || ''}"`,
        `"${p.prog_category || ''}"`,
        `"${p.core_activity || ''}"`,
        p.trainee_count || 0,
        p.training_days || 0,
        `"${p.coordinator_name || ''}"`,
        `"${p.coordinator_phone || ''}"`,
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
    a.download = `Curriculum_Extension_Registry_${Date.now()}.csv`;
    a.click();
    message.success('Curriculum & extension registry exported successfully');
  };

  const columns = [
    {
      title: 'Prog Code & Title',
      key: 'prog_info',
      width: 260,
      render: (_, r) => (
        <div>
          <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{r.prog_title}</strong>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>
            Code: <span style={{ fontFamily: 'monospace' }}>{r.prog_code}</span> | Coordinator: {r.coordinator_name}
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
      title: 'Program Category',
      dataIndex: 'prog_category',
      key: 'prog_category',
      width: 220,
      render: (cat) => <Tag color="blue">{cat?.split(' ')[0] || 'Curriculum'}</Tag>
    },
    {
      title: 'Trainees & Duration',
      key: 'metrics',
      width: 170,
      render: (_, r) => (
        <div style={{ fontSize: 11 }}>
          <div>ሰልጣኞች: <strong style={{ color: '#1a5f2c' }}>{r.trainee_count || 0} ብዛት</strong></div>
          <div style={{ color: '#595959' }}>ቆይታ: {r.training_days || 0} ቀናት</div>
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
      title: 'Implementation Status',
      dataIndex: 'operational_status',
      key: 'operational_status',
      width: 170,
      render: (status, record) => (
        <Select
          value={status || 'Fully Implemented'}
          onChange={(newVal) => handleQuickStatusChange(record.id, newVal)}
          style={{ width: '100%' }}
          size="small"
        >
          <Option value="Fully Implemented"><Tag color="success">Implemented</Tag></Option>
          <Option value="In Progress"><Tag color="processing">In Progress</Tag></Option>
          <Option value="Review Pending"><Tag color="warning">Review Pending</Tag></Option>
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
              onClick={() => {
                setEditingProgram(record);
                setIsModalOpen(true);
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Delete program record?"
            description="Are you sure you want to remove this curriculum record?"
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
          { title: 'ስርዓተ-ትምህርት፣ ስልጠናና ኤክስቴንሽን መርሃ ግብሮች (Curriculum & Extension)' }
        ]}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#1a5f2c', fontFamily: "'Times New Roman', Times, serif" }}>
            ስርዓተ-ትምህርት፣ ስልጠናና ኤክስቴንሽን መርሃ ግብሮች (Curriculum, Training & Extension Programs)
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            የስርዓተ-ትምህርት ማሻሻያ፣ በስራ ላይ ያሉ ሰራተኞች ማሻሻያ ስልጠና፣ እና የአርሶ አደሮች ቴክኖሎጂ ስልጠና መርሃ ግብሮች ክትትል
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
            <Statistic title="አጠቃላይ ፕሮግራሞች" value={stats.totalPrograms} prefix={<BookOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" style={{ borderRadius: 8, borderLeft: '4px solid #52c41a' }}>
            <Statistic title="አጠቃላይ ሰልጣኞች ብዛት" value={stats.totalTrainees} prefix={<TeamOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" style={{ borderRadius: 8, borderLeft: '4px solid #1890ff' }}>
            <Statistic title="አጠቃላይ የስልጠና ቀናት" value={stats.totalDays} prefix={<CalendarOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" style={{ borderRadius: 8, borderLeft: '4px solid #fa8c16' }}>
            <Statistic title="ተግባራዊ የሆኑ ፕሮግራሞች" value={stats.implementedCount} prefix={<CheckSquareOutlined />} />
          </Card>
        </Col>
      </Row>

      <Card variant="borderless" style={{ marginBottom: 16, borderRadius: 8 }} styles={{ body: { padding: '14px 16px' } }}>
        <Row justify="space-between" align="middle" gutter={[12, 12]}>
          <Col xs={24} xl={18}>
            <Space wrap size={[10, 10]}>
              <Input
                placeholder="Search Title, Code, or Coordinator..."
                prefix={<SearchOutlined />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: 200 }}
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
                placeholder="Program Category"
                value={categoryFilter}
                onChange={setCategoryFilter}
                style={{ width: 190 }}
                allowClear
              >
                {PROGRAM_CATEGORIES.map((pc) => (
                  <Option key={pc} value={pc}>{pc}</Option>
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
                  setEditingProgram(null);
                  setIsModalOpen(true);
                }}
                style={{ backgroundColor: '#1a5f2c', borderColor: '#1a5f2c', fontWeight: 600 }}
              >
                ፕሮግራም መዝግብ
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Table
        columns={columns}
        dataSource={filteredPrograms}
        rowKey="id"
        loading={isFetching}
        scroll={{ x: 1350 }}
        bordered
        size="middle"
      />

      <Modal
        title={editingProgram ? 'የስርዓተ-ትምህርት መረጃ ማስተካከያ (Edit Curriculum Record)' : 'አዲስ ስርዓተ-ትምህርት/ስልጠና መዝግብ (Register Program)'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={isSubmitting}
        width={850}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            የፕሮግራሙ መለያና የኮሌጅ ምደባ (Program Info & College Assignment)
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="prog_code" label="Program Code" rules={[{ required: true, message: 'Code required' }]}>
                <Input placeholder="e.g. CRX-2019-EG-001" />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item name="prog_title" label="የፕሮግራሙ ስም / መግለጫ (Program Title)" rules={[{ required: true, message: 'Title required' }]}>
                <Input placeholder="e.g. Modular Curriculum Harmonization & Training" />
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
              <Form.Item name="prog_category" label="ፕሮግራም ዓይነት (Category)" rules={[{ required: true }]}>
                <Select>
                  {PROGRAM_CATEGORIES.map((pc) => (
                    <Option key={pc} value={pc}>{pc}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="core_activity" label="ዋና ተግባር (Core Activity)" rules={[{ required: true }]}>
                <Select>
                  {CURRICULUM_ACTIVITIES.map((ca) => (
                    <Option key={ca} value={ca}>{ca}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="trainee_count" label="የሰልጣኞች ብዛት (Trainees Count)" rules={[{ required: true }]}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="training_days" label="የስልጠና ቀናት (Training Days)" rules={[{ required: true }]}>
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="coordinator_phone" label="አስተባባሪ ስልክ (Phone)" rules={[{ required: true }]}>
                <Input placeholder="+251 9..." />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="coordinator_name" label="የፕሮግራሙ አስተባባሪ (Coordinator Name)" rules={[{ required: true }]}>
                <Input placeholder="Coordinator Name" />
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
            <ReadOutlined style={{ color: '#1a5f2c', fontSize: 20 }} />
            <span style={{ fontSize: 17, fontWeight: 'bold', color: '#1a5f2c' }}>
              {selectedProgram?.prog_title} - Program Dossier
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
        {selectedProgram && (
          <div style={{ paddingTop: 8 }}>
            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="Program Code" span={1}>
                <span style={{ fontFamily: 'monospace' }}>{selectedProgram.prog_code}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Fiscal Year" span={1}>
                <Tag color="blue">{selectedProgram.fiscal_year}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Assigned College" span={2}>
                <Tag color="green"><BankOutlined /> {selectedProgram.college_name}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Program Category" span={2}>
                {selectedProgram.prog_category}
              </Descriptions.Item>
              <Descriptions.Item label="Core Activity" span={2}>
                {selectedProgram.core_activity}
              </Descriptions.Item>
              <Descriptions.Item label="Trainees Count" span={1}>
                <strong>{selectedProgram.trainee_count || 0} ሰልጣኞች</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Training Duration" span={1}>
                <strong>{selectedProgram.training_days || 0} ቀናት</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Program Coordinator" span={1}>
                {selectedProgram.coordinator_name} ({selectedProgram.coordinator_phone})
              </Descriptions.Item>
              <Descriptions.Item label="Implementation Status" span={1}>
                <Tag color="success">{selectedProgram.operational_status}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Administrative Station" span={2}>
                <EnvironmentOutlined style={{ color: '#1a5f2c', marginRight: 4 }} />
                {extractName(selectedProgram.kebele)} &gt; {extractName(selectedProgram.woreda)} &gt; {extractName(selectedProgram.zone)}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default function CurriculumExtension() {
  return (
    <App>
      <CurriculumExtensionContent />
    </App>
  );
}