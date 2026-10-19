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
  CheckSquareOutlined,
  GlobalOutlined,
  AreaChartOutlined,
  ScheduleOutlined
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

const COLLEGE_CATEGORIES = [
  'Agricultural Technical and Vocational Education and Training (ATVET) College (የአግሮ ቴክኒክና ሙያ ትምህርት ኮሌጅ)',
  'University College of Agriculture & Natural Resources (የግብርናና ተፈጥሮ ሀብት ዩኒቨርሲቲ ኮሌጅ)',
  'Regional Agricultural Research & Training Center (ክልላዊ የግብርና ምርምርና ስልጠና ማዕከል)',
  'Specialized Farmers Training Institute (ልዩ የአርሶ አደር ማሰልጠኛ ኢንስቲትዩት)'
];

const COLLEGE_ACTIVITIES = [
  'Diploma & Certificate Instructional Delivery',
  'In-Service Extension Staff Upgrading Program',
  'Applied Agricultural Research & Demonstration',
  'Model Farmer Short-Term Skill Certification',
  'Institutional Capacity & Infrastructure Audit'
];

function CollegeRegistryContent() {
  const { message } = App.useApp();

  const [colleges, setColleges] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [fiscalYearImpactFilter, setFiscalYearImpactFilter] = useState('2019 E.C.');
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [activityFilter, setActivityFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [zoneFilter, setZoneFilter] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollege, setEditingCollege] = useState(null);
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [isDossierOpen, setIsDossierOpen] = useState(false);

  const [zones, setZones] = useState([]);
  const [woredas, setWoredas] = useState([]);
  const [kebeles, setKebeles] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  const [form] = Form.useForm();

  const fetchCollegesFromApi = async () => {
    setIsFetching(true);
    try {
      const res = await axios.get('/api/colleges', {
        params: { fiscal_year: fiscalYearImpactFilter }
      });
      setColleges(res.data.data || []);
    } catch (err) {
      console.error('Failed to load colleges from backend:', err);
      message.error('Failed to load college registry from server');
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchCollegesFromApi();
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
      if (editingCollege) {
        const initForm = async () => {
          const zoneMatch = zones.find(
            (z) => z.name === editingCollege.zone || z.id === editingCollege.zone_id
          );
          if (zoneMatch) {
            try {
              const wRes = locationApi?.getWoredas ? await locationApi.getWoredas(zoneMatch.id) : null;
              const wList = wRes?.data?.data?.data || wRes?.data?.data || [];
              setWoredas(wList);

              const woredaMatch = wList.find(
                (w) => w.name === editingCollege.woreda || w.id === editingCollege.woreda_id
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
            college_code: editingCollege.college_code,
            college_name: editingCollege.college_name,
            college_category: editingCollege.college_category,
            core_activity: editingCollege.core_activity,
            formation_year: editingCollege.formation_year || '1995 E.C.',
            accreditation_ref: editingCollege.accreditation_ref || 'MOA/ATVET/ACC/012/95',
            college_dean: editingCollege.college_dean,
            dean_phone: editingCollege.dean_phone,
            fiscal_year: editingCollege.fiscal_year || '2019 E.C.',
            total_land_area_hectares: Number(editingCollege.total_land_area_hectares) || 150,
            total_staff_count: Number(editingCollege.total_staff_count) || 50,
            male_teachers: Number(editingCollege.male_teachers) || 30,
            female_teachers: Number(editingCollege.female_teachers) || 20,
            admin_male: Number(editingCollege.admin_male) || 25,
            admin_female: Number(editingCollege.admin_female) || 15,
            enrolled_students: Number(editingCollege.enrolled_students) || 300,
            admission_capacity: Number(editingCollege.admission_capacity) || 500,
            college_notes: editingCollege.college_notes,
            zone_id: editingCollege.zone_id || zoneMatch?.id || editingCollege.zone,
            woreda_id: editingCollege.woreda_id || editingCollege.woreda,
            kebele_id: editingCollege.kebele_id || editingCollege.kebele
          });
        };
        initForm();
      } else {
        form.resetFields();
        form.setFieldsValue({
          college_category: 'Agricultural Technical and Vocational Education and Training (ATVET) College (የአግሮ ቴክኒክና ሙያ ትምህርት ኮሌጅ)',
          core_activity: 'Diploma & Certificate Instructional Delivery',
          formation_year: '1998 E.C.',
          accreditation_ref: 'MOA/ATVET/ACC/045/98',
          fiscal_year: fiscalYearImpactFilter || '2019 E.C.',
          total_land_area_hectares: 200,
          total_staff_count: 80,
          male_teachers: 50,
          female_teachers: 30,
          admin_male: 35,
          admin_female: 25,
          enrolled_students: 400,
          admission_capacity: 600
        });
        setWoredas([]);
        setKebeles([]);
      }
    }
  }, [isModalOpen, editingCollege, form, zones, fiscalYearImpactFilter]);

  const handleQuickStatusChange = async (recordId, newStatus) => {
    try {
      await axios.patch(`/api/colleges/${recordId}`, { college_status: newStatus });
      setColleges((prev) =>
        prev.map((c) => (c.id === recordId ? { ...c, college_status: newStatus } : c))
      );
      message.success(`College status updated to "${newStatus}"`);
    } catch (err) {
      message.error('Failed to update status');
    }
  };

  const filteredColleges = useMemo(() => {
    return colleges.filter((c) => {
      const code = extractName(c.college_code).toLowerCase();
      const name = extractName(c.college_name).toLowerCase();
      const dean = extractName(c.college_dean).toLowerCase();
      const kebele = extractName(c.kebele).toLowerCase();
      const woreda = extractName(c.woreda).toLowerCase();
      const zone = extractName(c.zone).toLowerCase();
      const q = searchTerm.toLowerCase();

      const matchesSearch =
        code.includes(q) || name.includes(q) || dean.includes(q) || kebele.includes(q) || woreda.includes(q) || zone.includes(q);
      const matchesFY = fiscalYearImpactFilter ? c.fiscal_year === fiscalYearImpactFilter : true;
      const matchesCategory = categoryFilter ? c.college_category === categoryFilter : true;
      const matchesActivity = activityFilter ? c.core_activity === activityFilter : true;
      const matchesStatus = statusFilter ? c.college_status === statusFilter : true;
      const matchesZone = zoneFilter ? zone === zoneFilter.toLowerCase() : true;

      return matchesSearch && matchesFY && matchesCategory && matchesActivity && matchesStatus && matchesZone;
    });
  }, [colleges, searchTerm, fiscalYearImpactFilter, categoryFilter, activityFilter, statusFilter, zoneFilter]);

  const stats = useMemo(() => {
    const totalColleges = filteredColleges.length;
    const totalLandSum = filteredColleges.reduce((acc, c) => acc + (Number(c.total_land_area_hectares) || 0), 0);
    const totalStaffSum = filteredColleges.reduce((acc, c) => acc + (Number(c.total_staff_count) || 0), 0);
    const totalStudentsSum = filteredColleges.reduce((acc, c) => acc + (Number(c.enrolled_students) || 0), 0);
    const totalCapacitySum = filteredColleges.reduce((acc, c) => acc + (Number(c.admission_capacity) || 0), 0);
    const accreditedCount = filteredColleges.filter((c) => c.college_status === 'Fully Accredited').length;

    return {
      totalColleges,
      totalLandSum,
      totalStaffSum,
      totalStudentsSum,
      totalCapacitySum,
      accreditedCount
    };
  }, [filteredColleges]);

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

      if (editingCollege) {
        const res = await axios.put(`/api/colleges/${editingCollege.id}`, payload);
        setColleges((prev) =>
          prev.map((item) => (item.id === editingCollege.id ? res.data.data : item))
        );
        message.success('College record updated successfully');
      } else {
        const res = await axios.post('/api/colleges', payload);
        setColleges((prev) => [res.data.data, ...prev]);
        message.success('New agricultural college registered successfully');
      }
      setIsModalOpen(false);
      fetchCollegesFromApi();
    } catch (error) {
      message.error(error?.response?.data?.message || 'Failed to save college record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/colleges/${id}`);
      setColleges((prev) => prev.filter((item) => item.id !== id));
      message.success('College record removed');
    } catch (err) {
      message.error('Failed to delete college record');
    }
  };

  const exportToCSV = () => {
    if (!filteredColleges.length) {
      message.warning('No college records available to export');
      return;
    }
    const headers = [
      'College Code,College Name,Category,Core Activity,Formation Year,Accreditation Ref,Land Area (Ha),Teachers (M/F),Admin (M/F),Students Enrolled,Admission Capacity,Dean,Phone,FY,Zone,Woreda,Kebele,Status'
    ];
    const rows = filteredColleges.map((c) => {
      return [
        `"${c.college_code || ''}"`,
        `"${c.college_name || ''}"`,
        `"${c.college_category || ''}"`,
        `"${c.core_activity || ''}"`,
        `"${c.formation_year || ''}"`,
        `"${c.accreditation_ref || ''}"`,
        c.total_land_area_hectares || 0,
        `"${c.male_teachers || 0}/${c.female_teachers || 0}"`,
        `"${c.admin_male || 0}/${c.admin_female || 0}"`,
        c.enrolled_students || 0,
        c.admission_capacity || 0,
        `"${c.college_dean || ''}"`,
        `"${c.dean_phone || ''}"`,
        `"${c.fiscal_year || ''}"`,
        `"${extractName(c.zone)}"`,
        `"${extractName(c.woreda)}"`,
        `"${extractName(c.kebele)}"`,
        `"${c.college_status || ''}"`
      ].join(',');
    });

    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `College_Profile_Registry_${Date.now()}.csv`;
    a.click();
    message.success('College profile registry exported successfully');
  };

  const columns = [
    {
      title: 'College Code & Institutional Name',
      key: 'college_info',
      width: 280,
      render: (_, r) => (
        <div>
          <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{r.college_name}</strong>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>
            Code: <span style={{ fontFamily: 'monospace' }}>{r.college_code}</span> | Est: {r.formation_year || 'N/A'}
          </div>
        </div>
      )
    },
    {
      title: 'College Category',
      dataIndex: 'college_category',
      key: 'college_category',
      width: 210,
      render: (cat) => <Tag color="green">{cat}</Tag>
    },
    {
      title: 'Land Area (ሄ/ር)',
      dataIndex: 'total_land_area_hectares',
      key: 'total_land_area_hectares',
      width: 140,
      render: (land) => <strong style={{ color: '#1a5f2c' }}>{land || 0} ሄ/ር</strong>
    },
    {
      title: 'Human Power (Staff & Teachers)',
      key: 'staff_breakdown',
      width: 220,
      render: (_, r) => (
        <div style={{ fontSize: 11 }}>
          <div>
            መምህራን (ወ: <strong style={{ color: '#1890ff' }}>{r.male_teachers || 0}</strong>, ሴ: <strong style={{ color: '#722ed1' }}>{r.female_teachers || 0}</strong>)
          </div>
          <div style={{ color: '#595959' }}>
            አስተዳደር (ወ: {r.admin_male || 0}, ሴ: {r.admin_female || 0})
          </div>
        </div>
      )
    },
    {
      title: 'Student Capacity & Enrollment',
      key: 'breakdown',
      width: 220,
      render: (_, r) => (
        <div style={{ fontSize: 11 }}>
          <div>
            ተቀባይ አቅም: <strong style={{ color: '#fa8c16' }}>{r.admission_capacity || 0}</strong>
          </div>
          <div style={{ color: '#1a5f2c' }}>
            የተመዘገቡ ተማሪዎች: <strong>{r.enrolled_students || 0}</strong>
          </div>
        </div>
      )
    },
    {
      title: 'Administrative Location',
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
      title: 'Institutional Status',
      dataIndex: 'college_status',
      key: 'college_status',
      width: 190,
      render: (status, record) => (
        <Select
          value={status || 'Fully Accredited'}
          onChange={(newVal) => handleQuickStatusChange(record.id, newVal)}
          style={{ width: '100%' }}
          size="small"
        >
          <Option value="Fully Accredited"><Tag color="success">Accredited</Tag></Option>
          <Option value="Active Monitoring"><Tag color="processing">Monitoring</Tag></Option>
          <Option value="Audit Pending"><Tag color="warning">Audit Pending</Tag></Option>
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
          <Tooltip title="View Institutional Dossier">
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: '#1890ff' }} />}
              onClick={() => {
                setSelectedCollege(record);
                setIsDossierOpen(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Edit Profile">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: '#52c41a' }} />}
              onClick={() => {
                setEditingCollege(record);
                setIsModalOpen(true);
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Delete college record?"
            description="Are you sure you want to remove this college profile?"
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
          { title: 'የኮሌጁ አጠቃላይ መሰረታዊ መረጃ (College Registry)' }
        ]}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#1a5f2c', fontFamily: "'Times New Roman', Times, serif" }}>
            የኮሌጁ አጠቃላይ መሰረታዊ መረጃ (College Profile & Institutional Registry)
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            የኮሌጁ ምስረታ ዓመት፣ እውቅና ማረጋገጫ ቁጥር፣ የመሬት ስፋት፣ የሰው ኃይል እና የተማሪዎች መቀበል አቅም መረጃዎች
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
          <Button icon={<ReloadOutlined />} onClick={fetchCollegesFromApi} loading={isFetching}>
            Refresh
          </Button>
        </Space>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" style={{ borderRadius: 8, borderLeft: '4px solid #1a5f2c' }}>
            <Statistic title="አጠቃላይ ኮሌጆች" value={stats.totalColleges} prefix={<BankOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" style={{ borderRadius: 8, borderLeft: '4px solid #52c41a' }}>
            <Statistic title="አጠቃላይ የመሬት ስፋት (ሄ/ር)" value={stats.totalLandSum} suffix="ሄ/ር" prefix={<AreaChartOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" style={{ borderRadius: 8, borderLeft: '4px solid #1890ff' }}>
            <Statistic title="አጠቃላይ ተማሪዎች" value={stats.totalStudentsSum} prefix={<TeamOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" style={{ borderRadius: 8, borderLeft: '4px solid #fa8c16' }}>
            <Statistic title="አጠቃላይ የመቀበል አቅም" value={stats.totalCapacitySum} prefix={<CheckSquareOutlined />} />
          </Card>
        </Col>
      </Row>

      <Card variant="borderless" style={{ marginBottom: 16, borderRadius: 8 }} styles={{ body: { padding: '14px 16px' } }}>
        <Row justify="space-between" align="middle" gutter={[12, 12]}>
          <Col xs={24} xl={16}>
            <Space wrap size={[10, 10]}>
              <Input
                placeholder="Search College Name, Code, or Dean..."
                prefix={<SearchOutlined />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: 260 }}
                allowClear
              />
              <Select
                placeholder="Filter by Category"
                value={categoryFilter}
                onChange={setCategoryFilter}
                style={{ width: 220 }}
                allowClear
              >
                {COLLEGE_CATEGORIES.map((cc) => (
                  <Option key={cc} value={cc}>{cc}</Option>
                ))}
              </Select>
            </Space>
          </Col>
          <Col xs={24} xl={8} style={{ textAlign: 'right' }}>
            <Space>
              <Button icon={<DownloadOutlined />} onClick={exportToCSV}>Export Registry CSV</Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingCollege(null);
                  setIsModalOpen(true);
                }}
                style={{ backgroundColor: '#1a5f2c', borderColor: '#1a5f2c', fontWeight: 600 }}
              >
                Register College
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Table
        columns={columns}
        dataSource={filteredColleges}
        rowKey="id"
        loading={isFetching}
        scroll={{ x: 1350 }}
        bordered
        size="middle"
      />

      <Modal
        title={editingCollege ? 'የኮሌጅ መረጃ ማስተካከያ (Edit College Profile)' : 'አዲስ ኮሌጅ መዝግብ (Register College Profile)'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={isSubmitting}
        width={850}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            የኮሌጁ አጠቃላይ መሰረታዊ መረጃ (Institutional Basic Info & Formation)
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="college_code" label="College Code" rules={[{ required: true, message: 'Code required' }]}>
                <Input placeholder="e.g. COL-2019-EG-08" />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item name="college_name" label="የኮሌጁ ስም (College Name)" rules={[{ required: true, message: 'Name required' }]}>
                <Input placeholder="e.g. Bahir Dar Agricultural ATVET College" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="college_category" label="College Category" rules={[{ required: true }]}>
                <Select>
                  {COLLEGE_CATEGORIES.map((cc) => (
                    <Option key={cc} value={cc}>{cc}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="core_activity" label="Core Instructional Focus" rules={[{ required: true }]}>
                <Select>
                  {COLLEGE_ACTIVITIES.map((ca) => (
                    <Option key={ca} value={ca}>{ca}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="formation_year" label="የተመሰረተበት ዓመት (Formation / Est. Year)" rules={[{ required: true, message: 'Formation year required' }]}>
                <Input placeholder="e.g. 1995 E.C." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="accreditation_ref" label="እውቅና ማረጋገጫ / ማጣቀሻ ቁጥር (Accreditation Ref)" rules={[{ required: true, message: 'Accreditation ref required' }]}>
                <Input placeholder="e.g. MOA/ATVET/ACC/012/95" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            የኮሌጁ አጠቃላይ የመሬት ስፋት (Land Area in Hectares)
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="total_land_area_hectares" label="አጠቃላይ የመሬት ስፋት (ሄ/ር)" rules={[{ required: true }]}>
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            የኮሌጁ የሰው ኃይል - መምህራን እና አስተዳደር (Human Power: Teachers & Admin)
          </Divider>
          <Row gutter={16}>
            <Col span={12}>
              <div style={{ background: '#f6ffed', padding: '12px', borderRadius: 8, border: '1px solid #b7eb8f', marginBottom: 12 }}>
                <Text strong style={{ color: '#1a5f2c' }}>መምህራን በየትምህርት አይነት እና ደረጃ (Teachers)</Text>
                <Row gutter={12} style={{ marginTop: 8 }}>
                  <Col span={12}>
                    <Form.Item name="male_teachers" label="ወንድ (Male)" rules={[{ required: true }]}>
                      <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="female_teachers" label="ሴት (Female)" rules={[{ required: true }]}>
                      <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </Row>
              </div>
            </Col>
            <Col span={12}>
              <div style={{ background: '#f0f5ff', padding: '12px', borderRadius: 8, border: '1px solid #adc6ff', marginBottom: 12 }}>
                <Text strong style={{ color: '#1890ff' }}>አስተዳደር (Admin Staff)</Text>
                <Row gutter={12} style={{ marginTop: 8 }}>
                  <Col span={12}>
                    <Form.Item name="admin_male" label="ወንድ (Male)" rules={[{ required: true }]}>
                      <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="admin_female" label="ሴት (Female)" rules={[{ required: true }]}>
                      <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>

          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
             የተማሪዎች መቀበል አቅም (Student Admission Capacity & Enrollment)
          </Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="admission_capacity" label="የኮሌጆች ተማሪ የመቀበል አቅም (Capacity)" rules={[{ required: true }]}>
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="enrolled_students" label="አሁን የተመዘገቡ ተማሪዎች ብዛት (Enrolled)" rules={[{ required: true }]}>
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="college_dean" label="College Dean / Director" rules={[{ required: true }]}>
                <Input placeholder="Dean Name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="dean_phone" label="Dean Contact Phone" rules={[{ required: true }]}>
                <Input placeholder="+251 9..." />
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

      {/* Comprehensive Dossier Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <BankOutlined style={{ color: '#1a5f2c', fontSize: 20 }} />
            <span style={{ fontSize: 17, fontWeight: 'bold', color: '#1a5f2c' }}>
              {selectedCollege?.college_name} - Institutional Dossier
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
        {selectedCollege && (
          <div style={{ paddingTop: 8 }}>
            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="College Code" span={1}>
                <span style={{ fontFamily: 'monospace' }}>{selectedCollege.college_code}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Fiscal Year" span={1}>
                <Tag color="blue">{selectedCollege.fiscal_year}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Institutional Category" span={2}>
                <Tag color="green">{selectedCollege.college_category}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="የተመሰረተበት ዓመት (Est. Year)" span={1}>
                <strong>{selectedCollege.formation_year || 'N/A'}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="እውቅና ማረጋገጫ ቁጥር (Accreditation Ref)" span={1}>
                <Tag color="purple">{selectedCollege.accreditation_ref || 'N/A'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="አጠቃላይ የመሬት ስፋት" span={2}>
                <strong style={{ color: '#1a5f2c' }}>{selectedCollege.total_land_area_hectares || 0} ሄክታር (ሄ/ር)</strong>
              </Descriptions.Item>
              <Descriptions.Item label="መምህራን (ወንድ / ሴት)" span={1}>
                ወንድ: {selectedCollege.male_teachers || 0} | ሴት: {selectedCollege.female_teachers || 0} (ጠቅላላ: {(selectedCollege.male_teachers || 0) + (selectedCollege.female_teachers || 0)})
              </Descriptions.Item>
              <Descriptions.Item label="አስተዳደር ሰራተኞች (ወንድ / ሴት)" span={1}>
                ወንድ: {selectedCollege.admin_male || 0} | ሴት: {selectedCollege.admin_female || 0} (ጠቅላላ: {(selectedCollege.admin_male || 0) + (selectedCollege.admin_female || 0)})
              </Descriptions.Item>
              <Descriptions.Item label="ተማሪ የመቀበል አቅም" span={1}>
                {selectedCollege.admission_capacity || 0} ተማሪዎች
              </Descriptions.Item>
              <Descriptions.Item label="አሁን የተመዘገቡ ተማሪዎች" span={1}>
                {selectedCollege.enrolled_students || 0} ተማሪዎች
              </Descriptions.Item>
              <Descriptions.Item label="College Dean" span={1}>
                {selectedCollege.college_dean} ({selectedCollege.dean_phone})
              </Descriptions.Item>
              <Descriptions.Item label="Accreditation Status" span={1}>
                <Tag color="success">{selectedCollege.college_status}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Administrative Station" span={2}>
                <EnvironmentOutlined style={{ color: '#1a5f2c', marginRight: 4 }} />
                {extractName(selectedCollege.kebele)} &gt; {extractName(selectedCollege.woreda)} &gt; {extractName(selectedCollege.zone)}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default function CollegeRegistry() {
  return (
    <App>
      <CollegeRegistryContent />
    </App>
  );
}