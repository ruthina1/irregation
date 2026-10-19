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
  Popconfirm
} from 'antd';
import {
  HomeOutlined,
  UserOutlined,
  WomanOutlined,
  ManOutlined,
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
  PhoneOutlined,
  MailOutlined,
  IdcardOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  SolutionOutlined
} from '@ant-design/icons';
import { extensionApi } from '../../../services/api/extensionApi';
import { handleApiError } from '../../../utils/errorHandler';
import BrandedLoader from '../../../components/common/BrandedLoader';
import LocationScopeSelector from '../../../components/common/LocationScopeSelector';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

// Helper to safely extract string values from nested relation objects
const extractName = (value, defaultVal = 'Unspecified') => {
  if (!value) return defaultVal;
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    return value.name || value.title || value.kebele_name || value.woreda_name || value.zone_name || defaultVal;
  }
  return String(value);
};

// Initial seed data for Kebele DAs roster
const INITIAL_DAS = [
  {
    id: '1',
    da_code: 'DA-EG-0811',
    full_name: 'Almaz Mengistu Assefa',
    gender: 'Female',
    qualification: 'BSc Degree',
    discipline: 'Crop Production (አዝርዕት)',
    duty_status: 'Active Duty',
    phone_number: '+251 918 234 567',
    email: 'almaz.mengistu@moa.gov.et',
    ftc_name: 'Kurar FTC Center',
    assigned_year: 2017,
    has_residential_quarter: true,
    zone: 'East Gojjam',
    woreda: 'Dejen',
    kebele: 'Kurar'
  },
  {
    id: '2',
    da_code: 'DA-EG-0812',
    full_name: 'Getachew Bekele Tadesse',
    gender: 'Male',
    qualification: 'Diploma (Level IV)',
    discipline: 'Natural Resource Management (የተፈጥሮ ሀብት)',
    duty_status: 'Active Duty',
    phone_number: '+251 921 345 678',
    email: 'getachew.b@moa.gov.et',
    ftc_name: 'Kurar FTC Center',
    assigned_year: 2015,
    has_residential_quarter: true,
    zone: 'East Gojjam',
    woreda: 'Dejen',
    kebele: 'Kurar'
  },
  {
    id: '3',
    da_code: 'DA-WG-1402',
    full_name: 'Tadesse Alemu Worku',
    gender: 'Male',
    qualification: 'BSc Degree',
    discipline: 'Animal Science (እንስሳት ሀብት)',
    duty_status: 'Active Duty',
    phone_number: '+251 911 456 789',
    email: 'tadesse.alemu@moa.gov.et',
    ftc_name: 'Bakel Demonstration Center',
    assigned_year: 2018,
    has_residential_quarter: false,
    zone: 'West Gojjam',
    woreda: 'Finote Selam',
    kebele: 'Bakel'
  },
  {
    id: '4',
    da_code: 'DA-SG-2109',
    full_name: 'Bethlehem Hailu Desta',
    gender: 'Female',
    qualification: 'MSc Degree',
    discipline: 'Irrigation & Horticulture (መስኖና አትክልት)',
    duty_status: 'On Duty',
    phone_number: '+251 930 891 234',
    email: 'bethlehem.h@moa.gov.et',
    ftc_name: 'Woreta Zuria Agro Center',
    assigned_year: 2020,
    has_residential_quarter: true,
    zone: 'South Gondar',
    woreda: 'Fogera',
    kebele: 'Woreta Zuria'
  }
];

function KebeleDAsContent() {
  const { message } = App.useApp();

  const [das, setDas] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [zoneFilter, setZoneFilter] = useState(null);
  const [disciplineFilter, setDisciplineFilter] = useState(null);
  const [genderFilter, setGenderFilter] = useState(null);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDA, setEditingDA] = useState(null);
  const [selectedDA, setSelectedDA] = useState(null);
  const [isDossierOpen, setIsDossierOpen] = useState(false);

  const [form] = Form.useForm();

  const fetchDAs = async () => {
    setIsFetching(true);
    try {
      if (extensionApi?.getDAs) {
        const response = await extensionApi.getDAs();
        const list = response?.data?.data?.data || response?.data?.data || response?.data || [];
        setDas(Array.isArray(list) && list.length ? list : INITIAL_DAS);
      } else {
        setDas(INITIAL_DAS);
      }
    } catch (error) {
      handleApiError(error, 'Failed to load Kebele DAs roster');
      setDas(INITIAL_DAS);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchDAs();
  }, []);

  // Filter pipeline
  const filteredDAs = useMemo(() => {
    return das.filter((d) => {
      const name = extractName(d.full_name).toLowerCase();
      const code = extractName(d.da_code).toLowerCase();
      const kebele = extractName(d.kebele).toLowerCase();
      const woreda = extractName(d.woreda).toLowerCase();
      const zone = extractName(d.zone).toLowerCase();
      const q = searchTerm.toLowerCase();

      const matchesSearch = name.includes(q) || code.includes(q) || kebele.includes(q) || woreda.includes(q);
      const matchesZone = zoneFilter ? zone === zoneFilter.toLowerCase() : true;
      const matchesDiscipline = disciplineFilter ? d.discipline === disciplineFilter : true;
      const matchesGender = genderFilter ? d.gender === genderFilter : true;

      return matchesSearch && matchesZone && matchesDiscipline && matchesGender;
    });
  }, [das, searchTerm, zoneFilter, disciplineFilter, genderFilter]);

  // Statistics calculation for Indicator 1.1
  const stats = useMemo(() => {
    const total = filteredDAs.length;
    const maleCount = filteredDAs.filter((d) => d.gender === 'Male').length;
    const femaleCount = filteredDAs.filter((d) => d.gender === 'Female').length;
    const activeCount = filteredDAs.filter((d) => (d.duty_status || '').toLowerCase().includes('duty') || d.duty_status === 'Active').length;
    const femaleRatio = total > 0 ? ((femaleCount / total) * 100).toFixed(1) : 0;

    return { total, maleCount, femaleCount, activeCount, femaleRatio };
  }, [filteredDAs]);

  // Open Modal handler
  const handleOpenModal = (record = null) => {
    setEditingDA(record);
    if (record) {
      form.setFieldsValue({
        da_code: record.da_code,
        full_name: record.full_name,
        gender: record.gender || 'Male',
        qualification: record.qualification || 'BSc Degree',
        discipline: record.discipline || 'Crop Production (አዝርዕት)',
        duty_status: record.duty_status || 'Active Duty',
        phone_number: record.phone_number,
        email: record.email,
        ftc_name: record.ftc_name,
        assigned_year: record.assigned_year ? Number(record.assigned_year) : 2018,
        has_residential_quarter: Boolean(record.has_residential_quarter),
        zone_id: record.zone_id,
        woreda_id: record.woreda_id,
        kebele_id: record.kebele_id
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        gender: 'Male',
        qualification: 'BSc Degree',
        discipline: 'Crop Production (አዝርዕት)',
        duty_status: 'Active Duty',
        assigned_year: 2019,
        has_residential_quarter: false
      });
    }
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      if (editingDA) {
        if (extensionApi?.updateDA) {
          await extensionApi.updateDA(editingDA.id, values);
        } else {
          setDas((prev) => prev.map((item) => (item.id === editingDA.id ? { ...item, ...values } : item)));
        }
        message.success('Development Agent record updated successfully');
      } else {
        const newRecord = { ...values, id: Date.now().toString() };
        if (extensionApi?.createDA) {
          await extensionApi.createDA(values);
        } else {
          setDas((prev) => [newRecord, ...prev]);
        }
        message.success('Development Agent deployed and assigned successfully');
      }
      setIsModalOpen(false);
      if (extensionApi?.getDAs) await fetchDAs();
    } catch (error) {
      handleApiError(error, 'Failed to save DA Record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setIsSubmitting(true);
    try {
      if (extensionApi?.deleteDA) {
        await extensionApi.deleteDA(id);
      } else {
        setDas((prev) => prev.filter((item) => item.id !== id));
      }
      message.success('DA reassignment/removal recorded');
      if (extensionApi?.getDAs) await fetchDAs();
    } catch (error) {
      handleApiError(error, 'Failed to remove DA');
    } finally {
      setIsSubmitting(false);
    }
  };

  // CSV Exporter for Indicator 1.1
  const exportToCSV = () => {
    if (!filteredDAs.length) {
      message.warning('No DA records available to export');
      return;
    }
    const headers = ['DA Code,Full Name,Gender,Qualification,Discipline,Duty Status,Phone,Zone,Woreda,Kebele,FTC Station'];
    const rows = filteredDAs.map((d) => [
      `"${d.da_code || ''}"`,
      `"${d.full_name || ''}"`,
      `"${d.gender || ''}"`,
      `"${d.qualification || ''}"`,
      `"${d.discipline || ''}"`,
      `"${d.duty_status || ''}"`,
      `"${d.phone_number || ''}"`,
      `"${extractName(d.zone)}"`,
      `"${extractName(d.woreda)}"`,
      `"${extractName(d.kebele)}"`,
      `"${d.ftc_name || ''}"`
    ].join(','));

    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Indicator_1_1_Kebele_DAs_Roster_${Date.now()}.csv`;
    a.click();
    message.success('Report 2019 exported successfully');
  };

  const columns = [
    {
      title: 'DA Code & Specialist Name',
      key: 'da_info',
      width: 240,
      render: (_, r) => (
        <div>
          <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{r.full_name}</strong>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>
            ID: <span style={{ fontFamily: 'monospace' }}>{r.da_code || 'DA-PENDING'}</span>
          </div>
        </div>
      )
    },
    {
      title: 'Gender (ጾታ)',
      dataIndex: 'gender',
      key: 'gender',
      align: 'center',
      width: 110,
      sorter: (a, b) => a.gender.localeCompare(b.gender),
      render: (g) => (
        <Tag
          color={g === 'Female' ? 'purple' : 'blue'}
          icon={g === 'Female' ? <WomanOutlined /> : <ManOutlined />}
          style={{ fontWeight: 600 }}
        >
          {g}
        </Tag>
      )
    },
    {
      title: 'Discipline / Specialization',
      dataIndex: 'discipline',
      key: 'discipline',
      width: 210,
      render: (text) => <span style={{ fontWeight: 500, color: '#262626' }}>{text}</span>
    },
    {
      title: 'Station (Zone / Woreda / Kebele)',
      key: 'station',
      width: 220,
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
      title: 'Duty Status',
      dataIndex: 'duty_status',
      key: 'duty_status',
      align: 'center',
      width: 130,
      render: (status) => {
        const isDuty = (status || '').toLowerCase().includes('duty') || status === 'Active';
        return (
          <Tag color={isDuty ? 'success' : 'warning'} icon={isDuty ? <CheckCircleOutlined /> : <ClockCircleOutlined />}>
            {status || 'Active Duty'}
          </Tag>
        );
      }
    },
    {
      title: 'Contact',
      dataIndex: 'phone_number',
      key: 'contact',
      width: 150,
      render: (phone) => (
        <span style={{ fontSize: 12, fontFamily: 'monospace' }}>
          <PhoneOutlined style={{ color: '#1a5f2c', marginRight: 4 }} />
          {phone || '-'}
        </span>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'center',
      fixed: 'right',
      width: 140,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View DA Dossier">
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: '#1890ff' }} />}
              onClick={() => {
                setSelectedDA(record);
                setIsDossierOpen(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Edit Deployment">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: '#52c41a' }} />}
              onClick={() => handleOpenModal(record)}
            />
          </Tooltip>
          <Tooltip title="Remove DA">
            <Popconfirm
              title="Remove DA assignment?"
              description="Are you sure you want to deactivate or reassign this DA?"
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
      {(isFetching || isSubmitting) && (
        <BrandedLoader message={isSubmitting ? 'Saving Deployment...' : 'Loading DA Roster...'} />
      )}

      {/* Navigation Header */}
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item><HomeOutlined /></Breadcrumb.Item>
        <Breadcrumb.Item>Extension Communication & Digitalization</Breadcrumb.Item>
        <Breadcrumb.Item>Kebele DAs (On-Duty)</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#1a5f2c', fontFamily: "'Times New Roman', Times, serif" }}>
            Kebele Development Agents Roster (በስራ ላይ ያሉ የቀበሌ ግብርና ባለሙያዎች - Indicator 1.1)
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Monitoring full on-duty staffing quotas disaggregated by discipline and gender
          </Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchDAs} loading={isFetching}>
            Refresh
          </Button>
          <Button icon={<DownloadOutlined />} onClick={exportToCSV}>
            Export Form 2019
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleOpenModal(null)}
            style={{ backgroundColor: '#1a5f2c', borderColor: '#1a5f2c', fontWeight: 600 }}
          >
            Deploy New DA
          </Button>
        </Space>
      </div>

      {/* Indicator 1.1 KPI Dashboard */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #1a5f2c' }}>
            <Statistic
              title={<span style={{ fontWeight: 600 }}>Total DAs Deployed</span>}
              value={stats.total}
              prefix={<SolutionOutlined style={{ color: '#1a5f2c', marginRight: 8 }} />}
              valueStyle={{ color: '#1a5f2c', fontWeight: 'bold' }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 4 }}>
              Active on Duty: <strong>{stats.activeCount}</strong>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #1890ff' }}>
            <Statistic
              title={<span style={{ fontWeight: 600 }}>Male Specialists (ወንድ)</span>}
              value={stats.maleCount}
              prefix={<ManOutlined style={{ color: '#1890ff', marginRight: 8 }} />}
              valueStyle={{ color: '#1890ff', fontWeight: 'bold' }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 4 }}>
              Regional target allocation: 11,416
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #722ed1' }}>
            <Statistic
              title={<span style={{ fontWeight: 600 }}>Female Specialists (ሴት)</span>}
              value={stats.femaleCount}
              prefix={<WomanOutlined style={{ color: '#722ed1', marginRight: 8 }} />}
              valueStyle={{ color: '#722ed1', fontWeight: 'bold' }}
            />
            <Progress percent={Number(stats.femaleRatio)} size="small" strokeColor="#722ed1" />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 2 }}>
              Female Staff Share: <strong>{stats.femaleRatio}%</strong> (Goal &gt; 35%)
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #fa8c16' }}>
            <Statistic
              title={<span style={{ fontWeight: 600 }}>Covered FTC Centers</span>}
              value={[...new Set(filteredDAs.map((d) => d.ftc_name).filter(Boolean))].length}
              prefix={<SafetyCertificateOutlined style={{ color: '#fa8c16', marginRight: 8 }} />}
              valueStyle={{ color: '#fa8c16', fontWeight: 'bold' }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 4 }}>
              FTC Stationed Centers with active teams
            </div>
          </Card>
        </Col>
      </Row>

      {/* Filter Toolbar */}
      <Card bordered={false} style={{ marginBottom: 16, borderRadius: 8 }} bodyStyle={{ padding: '12px 16px' }}>
        <Space wrap>
          <Input
            placeholder="Search DA Name, Code, or Kebele..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 260 }}
            allowClear
          />
          <Select
            placeholder="Filter by Zone"
            value={zoneFilter}
            onChange={setZoneFilter}
            style={{ width: 180 }}
            allowClear
          >
            {[...new Set(das.map((d) => extractName(d.zone)))].map((z) => (
              <Option key={z} value={z}>{z}</Option>
            ))}
          </Select>
          <Select
            placeholder="Filter by Discipline"
            value={disciplineFilter}
            onChange={setDisciplineFilter}
            style={{ width: 220 }}
            allowClear
          >
            <Option value="Crop Production (አዝርዕት)">Crop Production (አዝርዕት)</Option>
            <Option value="Animal Science (እንስሳት ሀብት)">Animal Science (እንስሳት ሀብት)</Option>
            <Option value="Natural Resource Management (የተፈጥሮ ሀብት)">Natural Resources (የተፈጥሮ ሀብት)</Option>
            <Option value="Irrigation & Horticulture (መስኖና አትክልት)">Irrigation & Horticulture (መስኖና አትክልት)</Option>
          </Select>
          <Select
            placeholder="Filter by Gender"
            value={genderFilter}
            onChange={setGenderFilter}
            style={{ width: 140 }}
            allowClear
          >
            <Option value="Male">Male (ወንድ)</Option>
            <Option value="Female">Female (ሴት)</Option>
          </Select>
        </Space>
      </Card>

      {/* Roster Table */}
      <Table
        columns={columns}
        dataSource={filteredDAs}
        rowKey="id"
        pagination={{ defaultPageSize: 10, showSizeChanger: true }}
        scroll={{ x: 1150 }}
        bordered
        size="middle"
      />

      {/* Deployment & Assignment Form Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SolutionOutlined style={{ color: '#1a5f2c', fontSize: 18 }} />
            <span style={{ color: '#1a5f2c', fontWeight: 'bold' }}>
              {editingDA ? 'Edit Development Agent Deployment' : 'Deploy New Kebele Development Agent'}
            </span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText={editingDA ? 'Update Deployment' : 'Deploy Specialist'}
        okButtonProps={{ style: { backgroundColor: '#1a5f2c', borderColor: '#1a5f2c' }, loading: isSubmitting }}
        width={760}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Officer Identity & Academic Credentials
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="da_code"
                label="Official DA Code"
                rules={[{ required: true, message: 'Code required' }]}
              >
                <Input placeholder="e.g. DA-EG-0819" />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item
                name="full_name"
                label="Full Name (with Grandfather)"
                rules={[{ required: true, message: 'Full name required' }]}
              >
                <Input placeholder="e.g. Martha Tesfaye Alemayehu" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="gender" label="Gender (ጾታ)" rules={[{ required: true }]}>
                <Select>
                  <Option value="Male">Male (ወንድ)</Option>
                  <Option value="Female">Female (ሴት)</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="qualification" label="Academic Level" rules={[{ required: true }]}>
                <Select>
                  <Option value="Certificate (Level III)">Certificate (Level III)</Option>
                  <Option value="Diploma (Level IV)">Diploma (Level IV)</Option>
                  <Option value="BSc Degree">BSc Degree</Option>
                  <Option value="MSc Degree">MSc Degree</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="assigned_year" label="Year Assigned (E.C.)" rules={[{ required: true }]}>
                <InputNumber min={2000} max={2030} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="discipline" label="Specialized Discipline" rules={[{ required: true }]}>
                <Select>
                  <Option value="Crop Production (አዝርዕት)">Crop Production (አዝርዕት)</Option>
                  <Option value="Animal Science (እንስሳት ሀብት)">Animal Science (እንስሳት ሀብት)</Option>
                  <Option value="Natural Resource Management (የተፈጥሮ ሀብት)">Natural Resources (የተፈጥሮ ሀብት)</Option>
                  <Option value="Irrigation & Horticulture (መስኖና አትክልት)">Irrigation & Horticulture (መስኖና አትክልት)</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="duty_status" label="Active Duty Status" rules={[{ required: true }]}>
                <Select>
                  <Option value="Active Duty">Active Duty (በስራ ላይ ያለ)</Option>
                  <Option value="On Training">On Package Training (ስልጠና ላይ)</Option>
                  <Option value="Academic Upgrade">Academic Study Leave (ትምህርት ላይ)</Option>
                  <Option value="Annual Leave">Annual Leave (እረፍት ላይ)</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="phone_number" label="Mobile Phone Number" rules={[{ required: true }]}>
                <Input placeholder="+251 9..." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="email" label="Official Email Address">
                <Input placeholder="name@moa.gov.et" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Station, FTC Center & Quarters
          </Divider>

          <Row gutter={16}>
            <Col span={14}>
              <Form.Item name="ftc_name" label="Primary FTC Station Center" rules={[{ required: true }]}>
                <Input placeholder="e.g. Kurar Farmers Training Center" />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item name="has_residential_quarter" label="DA Residential Quarters" rules={[{ required: true }]}>
                <Select>
                  <Option value={true}>Available (መኖሪያ ቤት አለው)</Option>
                  <Option value={false}>Unavailable (መኖሪያ ቤት የለውም)</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <div style={{ marginTop: 8 }}>
            <LocationScopeSelector form={form} editingData={editingDA} />
          </div>
        </Form>
      </Modal>

      {/* COMPREHENSIVE DA DOSSIER MODAL */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                backgroundColor: '#e6f7ed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1a5f2c',
                fontSize: 18
              }}
            >
              <IdcardOutlined />
            </div>
            <div>
              <span style={{ fontSize: 16, fontWeight: 'bold', color: '#1a5f2c' }}>
                {selectedDA?.full_name}
              </span>
              <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                Code: {selectedDA?.da_code} | {selectedDA?.discipline}
              </div>
            </div>
          </div>
        }
        open={isDossierOpen}
        onCancel={() => setIsDossierOpen(false)}
        footer={[
          <Button
            key="edit"
            onClick={() => {
              setIsDossierOpen(false);
              handleOpenModal(selectedDA);
            }}
          >
            Edit Deployment
          </Button>,
          <Button
            key="close"
            type="primary"
            onClick={() => setIsDossierOpen(false)}
            style={{ backgroundColor: '#1a5f2c', borderColor: '#1a5f2c' }}
          >
            Close Dossier
          </Button>
        ]}
        width={780}
        destroyOnClose
      >
        {selectedDA && (
          <div style={{ paddingTop: 8 }}>
            <Tabs defaultActiveKey="1" type="card">
              {/* Tab 1: Profile & Credentials */}
              <TabPane
                tab={
                  <span>
                    <UserOutlined />
                    Officer Profile
                  </span>
                }
                key="1"
              >
                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
                  <Descriptions.Item label="Official Name">
                    <strong>{selectedDA.full_name}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="DA Staff Code">
                    <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{selectedDA.da_code}</span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Gender">
                    <Tag color={selectedDA.gender === 'Female' ? 'purple' : 'blue'}>{selectedDA.gender}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Academic Qualification">
                    {selectedDA.qualification}
                  </Descriptions.Item>
                  <Descriptions.Item label="Assigned Discipline" span={2}>
                    <Tag color="green">{selectedDA.discipline}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Duty Status">
                    <Tag color="success">{selectedDA.duty_status}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Deployment Year">
                    {selectedDA.assigned_year} E.C.
                  </Descriptions.Item>
                </Descriptions>
              </TabPane>

              {/* Tab 2: Station, FTC & Residence */}
              <TabPane
                tab={
                  <span>
                    <EnvironmentOutlined />
                    Station & FTC Base
                  </span>
                }
                key="2"
              >
                <Descriptions bordered size="small" column={{ xs: 1, sm: 3 }} style={{ marginBottom: 16 }}>
                  <Descriptions.Item label="Zone">
                    <strong>{extractName(selectedDA.zone)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Woreda">
                    <strong>{extractName(selectedDA.woreda)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Kebele Base">
                    <span style={{ color: '#1a5f2c', fontWeight: 'bold' }}>{extractName(selectedDA.kebele)}</span>
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
                  <Descriptions.Item label="Assigned FTC Center" span={2}>
                    <strong>{selectedDA.ftc_name}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Residential Quarters">
                    {selectedDA.has_residential_quarter ? (
                      <Tag color="green" icon={<CheckCircleOutlined />}>Housing Provided (አለው)</Tag>
                    ) : (
                      <Tag color="orange">No Housing (የለውም)</Tag>
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Direct Phone Contact">
                    <span style={{ fontFamily: 'monospace' }}>{selectedDA.phone_number}</span>
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

export default function KebeleDAs() {
  return (
    <App>
      <KebeleDAsContent />
    </App>
  );
}