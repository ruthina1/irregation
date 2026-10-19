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
  UserAddOutlined,
  BankOutlined,
  WomanOutlined,
  RiseOutlined,
  CheckSquareOutlined,
  IdcardOutlined,
  BookOutlined
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

const ENROLLMENT_CATEGORIES = [
  'New Admission First-Year Diploma Program (አዲስ ገቢ የመጀመሪያ ዓመት ዲፕሎማ መርሃ ግብር)',
  'Continuing Second-Year Extension Cohort (ቀጣይ ሁለተኛ ዓመት የኤክስተንሽን መርሃ ግብር)',
  'In-Service BSc Upgrading Fellowship (በስራ ላይ ያሉ ሰራተኞች የዲግሪ ማሻሻያ መርሃ ግብር)',
  'Short-Term Certificate & Skills Trainee (አጭር ጊዜ የሰርተፍኬትና ክህሎት ሰልጣኝ)'
];

const PROGRAM_LEVELS = [
  'Certificate (ሰርተፍኬት)',
  'Diploma (ዲፕሎማ)',
  'BSc Degree (ዲግሪ)'
];

const PROGRAM_MAJORS = [
  'General Agriculture & Crop Production (አጠቃላይ ግብርናና ሰብል ማልማት)',
  'Horticulture & Irrigation Management (አትክልትና መስኖ አስተዳደር)',
  'Animal Science & Forage Development (የእንስሳት ሳይንስና መኖ ልማት)',
  'Natural Resources & Watershed Management (ተፈጥሮ ሀብትና ተፋሰስ ልማት)',
  'Agricultural Economics & Cooperatives (የግብርና ኢኮኖሚክስና ህብረት ስራ)'
];

const SPONSORSHIP_TYPES = [
  'Government Budget Sponsored ( በመንግስት በጀት)',
  'Self-Sponsored (በግል)',
  'Organization / Woreda Sponsored (በድርጅት / በወረዳ የተደገፈ)',
  'NGO / Project Scholarship (በፕሮጀክት/በዕድ አብራሪ የተደገፈ)'
];

function StudentEnrollmentContent() {
  const { message } = App.useApp();

  const [enrollments, setEnrollments] = useState([]);
  const [collegesList, setCollegesList] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [fiscalYearImpactFilter, setFiscalYearImpactFilter] = useState('2019 E.C.');
  const [collegeFilter, setCollegeFilter] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [levelFilter, setLevelFilter] = useState(null);
  const [majorFilter, setMajorFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [zoneFilter, setZoneFilter] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isDossierOpen, setIsDossierOpen] = useState(false);

  const [zones, setZones] = useState([]);
  const [woredas, setWoredas] = useState([]);
  const [kebeles, setKebeles] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  const [form] = Form.useForm();

  const fetchDataFromApi = async () => {
    setIsFetching(true);
    try {
      const [studentsRes, collegesRes] = await Promise.all([
        axios.get('/api/students', { params: { fiscal_year: fiscalYearImpactFilter } }),
        axios.get('/api/colleges')
      ]);
      setEnrollments(studentsRes.data.data || []);
      setCollegesList(collegesRes.data.data || []);
    } catch (err) {
      console.error('Failed to load student data:', err);
      message.error('Failed to load student registry from server');
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
      if (editingStudent) {
        const initForm = async () => {
          const zoneMatch = zones.find(
            (z) => z.name === editingStudent.zone || z.id === editingStudent.zone_id
          );
          if (zoneMatch) {
            try {
              const wRes = locationApi?.getWoredas ? await locationApi.getWoredas(zoneMatch.id) : null;
              const wList = wRes?.data?.data?.data || wRes?.data?.data || [];
              setWoredas(wList);

              const woredaMatch = wList.find(
                (w) => w.name === editingStudent.woreda || w.id === editingStudent.woreda_id
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
            student_code: editingStudent.student_code,
            full_name: editingStudent.full_name,
            gender: editingStudent.gender || 'Male',
            age: Number(editingStudent.age) || 21,
            phone: editingStudent.phone,
            college_name: editingStudent.college_name,
            enrollment_category: editingStudent.enrollment_category,
            program_level: editingStudent.program_level || 'Diploma (ዲፕሎማ)',
            program_major: editingStudent.program_major,
            academic_year: editingStudent.academic_year || '1st Year',
            sponsorship_type: editingStudent.sponsorship_type || SPONSORSHIP_TYPES[0],
            admission_gpa: Number(editingStudent.admission_gpa) || 3.2,
            fiscal_year: editingStudent.fiscal_year || '2019 E.C.',
            student_notes: editingStudent.student_notes,
            zone_id: editingStudent.zone_id || zoneMatch?.id || editingStudent.zone,
            woreda_id: editingStudent.woreda_id || editingStudent.woreda,
            kebele_id: editingStudent.kebele_id || editingStudent.kebele
          });
        };
        initForm();
      } else {
        form.resetFields();
        form.setFieldsValue({
          gender: 'Male',
          age: 21,
          college_name: collegesList[0]?.college_name || 'Bahir Dar Agricultural ATVET College',
          enrollment_category: ENROLLMENT_CATEGORIES[0],
          program_level: 'Diploma (ዲፕሎማ)',
          program_major: PROGRAM_MAJORS[0],
          academic_year: '1st Year',
          sponsorship_type: SPONSORSHIP_TYPES[0],
          admission_gpa: 3.2,
          fiscal_year: fiscalYearImpactFilter || '2019 E.C.'
        });
        setWoredas([]);
        setKebeles([]);
      }
    }
  }, [isModalOpen, editingStudent, form, zones, fiscalYearImpactFilter, collegesList]);

  const handleQuickStatusChange = async (recordId, newStatus) => {
    try {
      await axios.patch(`/api/students/${recordId}`, { academic_status: newStatus });
      setEnrollments((prev) =>
        prev.map((s) => (s.id === recordId ? { ...s, academic_status: newStatus } : s))
      );
      message.success(`Student academic status updated to "${newStatus}"`);
    } catch (err) {
      message.error('Failed to update status');
    }
  };

  const filteredEnrollments = useMemo(() => {
    return enrollments.filter((s) => {
      const code = extractName(s.student_code).toLowerCase();
      const name = extractName(s.full_name).toLowerCase();
      const college = extractName(s.college_name).toLowerCase();
      const phone = extractName(s.phone).toLowerCase();
      const kebele = extractName(s.kebele).toLowerCase();
      const woreda = extractName(s.woreda).toLowerCase();
      const zone = extractName(s.zone).toLowerCase();
      const q = searchTerm.toLowerCase();

      const matchesSearch =
        code.includes(q) || name.includes(q) || college.includes(q) || phone.includes(q) || kebele.includes(q) || woreda.includes(q) || zone.includes(q);
      const matchesFY = fiscalYearImpactFilter ? s.fiscal_year === fiscalYearImpactFilter : true;
      const matchesCollege = collegeFilter ? s.college_name === collegeFilter : true;
      const matchesCategory = categoryFilter ? s.enrollment_category === categoryFilter : true;
      const matchesLevel = levelFilter ? s.program_level === levelFilter : true;
      const matchesMajor = majorFilter ? s.program_major === majorFilter : true;
      const matchesStatus = statusFilter ? s.academic_status === statusFilter : true;
      const matchesZone = zoneFilter ? zone === zoneFilter.toLowerCase() : true;

      return matchesSearch && matchesFY && matchesCollege && matchesCategory && matchesLevel && matchesMajor && matchesStatus && matchesZone;
    });
  }, [enrollments, searchTerm, fiscalYearImpactFilter, collegeFilter, categoryFilter, levelFilter, majorFilter, statusFilter, zoneFilter]);

  const stats = useMemo(() => {
    const totalStudents = filteredEnrollments.length;
    const maleStudents = filteredEnrollments.filter((s) => s.gender === 'Male').length;
    const femaleStudents = filteredEnrollments.filter((s) => s.gender === 'Female').length;
    const youthStudents = filteredEnrollments.filter((s) => Number(s.age) <= 30).length;
    const activeCount = filteredEnrollments.filter((s) => s.academic_status === 'Enrolled & Active').length;
    const womenRatio = totalStudents > 0 ? ((femaleStudents / totalStudents) * 100).toFixed(1) : 0;

    return {
      totalStudents,
      maleStudents,
      femaleStudents,
      youthStudents,
      activeCount,
      womenRatio
    };
  }, [filteredEnrollments]);

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

      if (editingStudent) {
        const res = await axios.put(`/api/students/${editingStudent.id}`, payload);
        setEnrollments((prev) =>
          prev.map((item) => (item.id === editingStudent.id ? res.data.data : item))
        );
        message.success('Student record updated successfully');
      } else {
        const res = await axios.post('/api/students', payload);
        setEnrollments((prev) => [res.data.data, ...prev]);
        message.success('New student registered successfully');
      }
      setIsModalOpen(false);
      fetchDataFromApi();
    } catch (error) {
      message.error(error?.response?.data?.message || 'Failed to save student record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/students/${id}`);
      setEnrollments((prev) => prev.filter((item) => item.id !== id));
      message.success('Student record removed');
    } catch (err) {
      message.error('Failed to delete student record');
    }
  };

  const exportToCSV = () => {
    if (!filteredEnrollments.length) {
      message.warning('No student records available to export');
      return;
    }
    const headers = [
      'Student Code,Full Name,Gender,Age,Phone,Assigned College,Category,Program Level,Major,Academic Year,Sponsorship,Admission GPA,FY,Zone,Woreda,Kebele,Status'
    ];
    const rows = filteredEnrollments.map((s) => {
      return [
        `"${s.student_code || ''}"`,
        `"${s.full_name || ''}"`,
        `"${s.gender || ''}"`,
        s.age || 0,
        `"${s.phone || ''}"`,
        `"${s.college_name || ''}"`,
        `"${s.enrollment_category || ''}"`,
        `"${s.program_level || ''}"`,
        `"${s.program_major || ''}"`,
        `"${s.academic_year || ''}"`,
        `"${s.sponsorship_type || ''}"`,
        s.admission_gpa || 0,
        `"${s.fiscal_year || ''}"`,
        `"${extractName(s.zone)}"`,
        `"${extractName(s.woreda)}"`,
        `"${extractName(s.kebele)}"`,
        `"${s.academic_status || ''}"`
      ].join(',');
    });

    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Student_Enrollment_Registry_${Date.now()}.csv`;
    a.click();
    message.success('Student registry exported successfully');
  };

  const columns = [
    {
      title: 'Student ID & Full Name',
      key: 'student_info',
      width: 250,
      render: (_, r) => (
        <div>
          <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{r.full_name}</strong>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>
            ID: <span style={{ fontFamily: 'monospace' }}>{r.student_code}</span> | GPA: {r.admission_gpa || 'N/A'}
          </div>
        </div>
      )
    },
    {
      title: 'Assigned College',
      dataIndex: 'college_name',
      key: 'college_name',
      width: 210,
      render: (colName) => (
        <Tag color="green" icon={<BankOutlined />}>
          {colName || 'Unassigned College'}
        </Tag>
      )
    },
    {
      title: 'Program Level & Major',
      key: 'program_info',
      width: 220,
      render: (_, r) => (
        <div style={{ fontSize: 11 }}>
          <Tag color="blue">{r.program_level || 'Diploma'}</Tag>
          <div style={{ fontWeight: 500, color: '#262626', marginTop: 2 }}>{r.program_major}</div>
        </div>
      )
    },
    {
      title: 'Year & Sponsorship',
      key: 'year_sponsor',
      width: 170,
      render: (_, r) => (
        <div style={{ fontSize: 11 }}>
          <div><strong>{r.academic_year || '1st Year'}</strong></div>
          <div style={{ color: '#8c8c8c' }}>{r.sponsorship_type?.split(' ')[0]}</div>
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
      title: 'Gender & Age',
      key: 'gender_age',
      width: 120,
      render: (_, r) => (
        <div style={{ fontSize: 11 }}>
          <div><strong>{r.gender || 'Male'}</strong> ({r.age || 21} yrs)</div>
        </div>
      )
    },
    {
      title: 'Academic Status',
      dataIndex: 'academic_status',
      key: 'academic_status',
      width: 190,
      render: (status, record) => (
        <Select
          value={status || 'Enrolled & Active'}
          onChange={(newVal) => handleQuickStatusChange(record.id, newVal)}
          style={{ width: '100%' }}
          size="small"
        >
          <Option value="Enrolled & Active"><Tag color="success">Active</Tag></Option>
          <Option value="Graduated"><Tag color="purple">Graduated</Tag></Option>
          <Option value="Suspended / Withdrawn"><Tag color="error">Withdrawn</Tag></Option>
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
          <Tooltip title="View Student Dossier">
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: '#1890ff' }} />}
              onClick={() => {
                setSelectedStudent(record);
                setIsDossierOpen(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Edit Student">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: '#52c41a' }} />}
              onClick={() => {
                setEditingStudent(record);
                setIsModalOpen(true);
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Delete student record?"
            description="Are you sure you want to remove this student?"
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
          { title: 'የተማሪዎች ምዝገባና ክትትል (Student Enrollment & Tracking)' }
        ]}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#1a5f2c', fontFamily: "'Times New Roman', Times, serif" }}>
            የተማሪዎች ምዝገባና ክትትል (Student Enrollment & Academic Tracking)
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            አዲስ ገቢዎችና ቀጣይ ተማሪዎች ምዝገባ፣ የትምህርት ደረጃ (ሰርተፍኬት/ዲፕሎማ/ዲግሪ)፣ ስፖንሰርሺፕ እና የአካዳሚክ ክትትል መረጃዎች
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
            <Statistic title="አጠቃላይ የተመዘገቡ ተማሪዎች" value={stats.totalStudents} prefix={<UserAddOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" style={{ borderRadius: 8, borderLeft: '4px solid #1890ff' }}>
            <Statistic title="ወጣት ተማሪዎች (<=30 ዓመት)" value={stats.youthStudents} prefix={<RiseOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" style={{ borderRadius: 8, borderLeft: '4px solid #722ed1' }}>
            <Statistic title="የሴቶች ድርሻ (%)" value={stats.femaleStudents} suffix={`(${stats.womenRatio}%)`} prefix={<WomanOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" style={{ borderRadius: 8, borderLeft: '4px solid #fa8c16' }}>
            <Statistic title="ንቁ (Active) ተማሪዎች" value={stats.activeCount} prefix={<CheckSquareOutlined />} />
          </Card>
        </Col>
      </Row>

      <Card variant="borderless" style={{ marginBottom: 16, borderRadius: 8 }} styles={{ body: { padding: '14px 16px' } }}>
        <Row justify="space-between" align="middle" gutter={[12, 12]}>
          <Col xs={24} xl={18}>
            <Space wrap size={[10, 10]}>
              <Input
                placeholder="Search Name, ID, or Phone..."
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
                placeholder="Program Level"
                value={levelFilter}
                onChange={setLevelFilter}
                style={{ width: 150 }}
                allowClear
              >
                {PROGRAM_LEVELS.map((pl) => (
                  <Option key={pl} value={pl}>{pl}</Option>
                ))}
              </Select>
              <Select
                placeholder="Program Major"
                value={majorFilter}
                onChange={setMajorFilter}
                style={{ width: 170 }}
                allowClear
              >
                {PROGRAM_MAJORS.map((pm) => (
                  <Option key={pm} value={pm}>{pm}</Option>
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
                  setEditingStudent(null);
                  setIsModalOpen(true);
                }}
                style={{ backgroundColor: '#1a5f2c', borderColor: '#1a5f2c', fontWeight: 600 }}
              >
                ተማሪ መዝግብ
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Table
        columns={columns}
        dataSource={filteredEnrollments}
        rowKey="id"
        loading={isFetching}
        scroll={{ x: 1350 }}
        bordered
        size="middle"
      />

      <Modal
        title={editingStudent ? 'የተማሪ መረጃ ማስተካከያ (Edit Student Profile)' : 'አዲስ ተማሪ መዝግብ (Register Student Full Profile)'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={isSubmitting}
        width={850}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            የተማሪው የግል መረጃና መለያ (Personal Info & ID)
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="student_code" label="Student ID Code" rules={[{ required: true, message: 'ID required' }]}>
                <Input placeholder="e.g. STD-2019-EG-001" />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item name="full_name" label="ሙሉ ስም (Full Name)" rules={[{ required: true, message: 'Name required' }]}>
                <Input placeholder="e.g. Abebe Kebede Tadesse" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="gender" label="ፆታ (Gender)" rules={[{ required: true }]}>
                <Select>
                  <Option value="Male">Male (ወንድ)</Option>
                  <Option value="Female">Female (ሴት)</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="age" label="እድሜ (Age)" rules={[{ required: true }]}>
                <InputNumber min={17} max={70} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="phone" label="ስልክ ቁጥር (Phone)" rules={[{ required: true }]}>
                <Input placeholder="+251 9..." />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            የኮሌጅ ምደባና የትምህርት ፕሮግራም (College Assignment & Program Level)
          </Divider>
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
            <Col span={8}>
              <Form.Item name="program_level" label="የትምህርት ደረጃ (Program Level)" rules={[{ required: true }]}>
                <Select>
                  {PROGRAM_LEVELS.map((pl) => (
                    <Option key={pl} value={pl}>{pl}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="enrollment_category" label="Enrollment Category" rules={[{ required: true }]}>
                <Select>
                  {ENROLLMENT_CATEGORIES.map((ec) => (
                    <Option key={ec} value={ec}>{ec}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="academic_year" label="የትምህርት ዓመት (Academic Year)" rules={[{ required: true }]}>
                <Select>
                  <Option value="1st Year">1st Year (አንደኛ ዓመት)</Option>
                  <Option value="2nd Year">2nd Year (ሁለተኛ ዓመት)</Option>
                  <Option value="3rd Year">3rd Year (ሶስተኛ ዓመት)</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="program_major" label="የትምህርት መስክ / Major" rules={[{ required: true }]}>
                <Select>
                  {PROGRAM_MAJORS.map((pm) => (
                    <Option key={pm} value={pm}>{pm}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="sponsorship_type" label="ስፖንሰርሺፕ / የገንዘብ ድጋፍ አይነት" rules={[{ required: true }]}>
                <Select>
                  {SPONSORSHIP_TYPES.map((st) => (
                    <Option key={st} value={st}>{st}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="admission_gpa" label="የመግቢያ ውጤት / GPA" rules={[{ required: true }]}>
                <InputNumber min={1.0} max={4.0} step={0.01} style={{ width: '100%' }} />
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
            <UserAddOutlined style={{ color: '#1a5f2c', fontSize: 20 }} />
            <span style={{ fontSize: 17, fontWeight: 'bold', color: '#1a5f2c' }}>
              {selectedStudent?.full_name} - Student Full Academic Dossier
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
        {selectedStudent && (
          <div style={{ paddingTop: 8 }}>
            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="Student ID Code" span={1}>
                <span style={{ fontFamily: 'monospace' }}>{selectedStudent.student_code}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Fiscal Year" span={1}>
                <Tag color="blue">{selectedStudent.fiscal_year}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Assigned College" span={2}>
                <Tag color="green"><BankOutlined /> {selectedStudent.college_name}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="የትምህርት ደረጃ (Program Level)" span={1}>
                <Tag color="purple">{selectedStudent.program_level || 'Diploma'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="የትምህርት ዓመት (Academic Year)" span={1}>
                <strong>{selectedStudent.academic_year || '1st Year'}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Program Major" span={2}>
                {selectedStudent.program_major}
              </Descriptions.Item>
              <Descriptions.Item label="ስፖንሰርሺፕ (Sponsorship)" span={1}>
                {selectedStudent.sponsorship_type}
              </Descriptions.Item>
              <Descriptions.Item label="የመግቢያ ውጤት (GPA)" span={1}>
                <strong>{selectedStudent.admission_gpa || 'N/A'}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Gender & Age" span={1}>
                {selectedStudent.gender} ({selectedStudent.age} Years)
              </Descriptions.Item>
              <Descriptions.Item label="Phone" span={1}>
                {selectedStudent.phone}
              </Descriptions.Item>
              <Descriptions.Item label="Academic Status" span={1}>
                <Tag color="success">{selectedStudent.academic_status}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Administrative Station" span={2}>
                <EnvironmentOutlined style={{ color: '#1a5f2c', marginRight: 4 }} />
                {extractName(selectedStudent.kebele)} &gt; {extractName(selectedStudent.woreda)} &gt; {extractName(selectedStudent.zone)}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default function StudentEnrollment() {
  return (
    <App>
      <StudentEnrollmentContent />
    </App>
  );
}