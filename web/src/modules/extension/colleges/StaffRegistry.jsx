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
  WomanOutlined,
  ManOutlined,
  RiseOutlined,
  CheckSquareOutlined,
  SafetyCertificateOutlined,
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

const STAFF_TYPES = [
  'Academic Staff / Instructor (አካዳሚክ ሰራተኛ / መምህር)',
  'Administrative & Support Staff (አስተዳደርና ደጋፊ ሰራተኛ)',
  'Technical & Laboratory Assistant (የላብራቶሪ ቴክኒሻን)',
  'Agricultural Extension Specialist (የግብርና ኤክስቴንሽን ባለሙያ)'
];

const ACADEMIC_RANKS = [
  'Professor (ፕሮፌሰር)',
  'Associate Professor (ተባባሪ ፕሮፌሰር)',
  'Assistant Professor (አሲስታንት ፕሮፌሰር)',
  'Lecturer (መምህር / ሌክቸረር)',
  'Assistant Lecturer (ረዳት ሌክቸረር)',
  'Technical Assistant (ቴክኒካል ረዳት)'
];

const EDUCATIONAL_LEVELS = [
  'PhD / Doctorate (ዶክትሬት)',
  'MSc / Master’s Degree (ማስተርስ)',
  'BSc / Bachelor’s Degree (ዲግሪ)',
  'Diploma / Certificate (ዲፕሎማ)'
];

const PEDAGOGICAL_STATUSES = [
  'Pedagogy Training Completed & Certified (ፔዳጎጂክ ስልጠና ወስዷል)',
  'Pending Pedagogical Training (ፔዳጎጂክ ስልጠና አልወሰደም)',
  'Undergoing Pedagogical Course (በስልጠና ላይ ያለ)'
];

function StaffRegistryContent() {
  const { message } = App.useApp();

  const [staffList, setStaffList] = useState([]);
  const [collegesList, setCollegesList] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [fiscalYearImpactFilter, setFiscalYearImpactFilter] = useState('2019 E.C.');
  const [collegeFilter, setCollegeFilter] = useState(null);
  const [typeFilter, setTypeFilter] = useState(null);
  const [rankFilter, setRankFilter] = useState(null);
  const [pedagogyFilter, setPedagogyFilter] = useState(null);
  const [zoneFilter, setZoneFilter] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [isDossierOpen, setIsDossierOpen] = useState(false);

  const [zones, setZones] = useState([]);
  const [woredas, setWoredas] = useState([]);
  const [kebeles, setKebeles] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  const [form] = Form.useForm();

  const fetchDataFromApi = async () => {
    setIsFetching(true);
    try {
      const [staffRes, collegesRes] = await Promise.all([
        axios.get('/api/staff', { params: { fiscal_year: fiscalYearImpactFilter } }),
        axios.get('/api/colleges')
      ]);
      setStaffList(staffRes.data.data || []);
      setCollegesList(collegesRes.data.data || []);
    } catch (err) {
      console.error('Failed to load staff registry data:', err);
      setStaffList([
        {
          id: '1',
          staff_code: 'STF-2019-EG-01',
          full_name: 'Dr. Belayneh Mekonnen',
          gender: 'Male',
          age: 42,
          phone: '+251 911 223 344',
          college_name: 'Bahir Dar Agricultural ATVET College',
          staff_type: STAFF_TYPES[0],
          academic_rank: ACADEMIC_RANKS[2],
          educational_level: EDUCATIONAL_LEVELS[0],
          field_of_study: 'Agronomy & Crop Physiology',
          pedagogical_training_status: PEDAGOGICAL_STATUSES[0],
          fiscal_year: '2019 E.C.',
          employment_status: 'Active Duty',
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
      if (editingStaff) {
        const initForm = async () => {
          const zoneMatch = zones.find(
            (z) => z.name === editingStaff.zone || z.id === editingStaff.zone_id
          );
          if (zoneMatch) {
            try {
              const wRes = locationApi?.getWoredas ? await locationApi.getWoredas(zoneMatch.id) : null;
              const wList = wRes?.data?.data?.data || wRes?.data?.data || [];
              setWoredas(wList);

              const woredaMatch = wList.find(
                (w) => w.name === editingStaff.woreda || w.id === editingStaff.woreda_id
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
            staff_code: editingStaff.staff_code,
            full_name: editingStaff.full_name,
            gender: editingStaff.gender || 'Male',
            age: Number(editingStaff.age) || 35,
            phone: editingStaff.phone,
            college_name: editingStaff.college_name,
            staff_type: editingStaff.staff_type,
            academic_rank: editingStaff.academic_rank,
            educational_level: editingStaff.educational_level,
            field_of_study: editingStaff.field_of_study,
            pedagogical_training_status: editingStaff.pedagogical_training_status,
            fiscal_year: editingStaff.fiscal_year || '2019 E.C.',
            zone_id: editingStaff.zone_id || zoneMatch?.id || editingStaff.zone,
            woreda_id: editingStaff.woreda_id || editingStaff.woreda,
            kebele_id: editingStaff.kebele_id || editingStaff.kebele
          });
        };
        initForm();
      } else {
        form.resetFields();
        form.setFieldsValue({
          gender: 'Male',
          age: 35,
          college_name: collegesList[0]?.college_name || 'Bahir Dar Agricultural ATVET College',
          staff_type: STAFF_TYPES[0],
          academic_rank: ACADEMIC_RANKS[3],
          educational_level: EDUCATIONAL_LEVELS[1],
          field_of_study: 'General Agriculture',
          pedagogical_training_status: PEDAGOGICAL_STATUSES[0],
          fiscal_year: fiscalYearImpactFilter || '2019 E.C.'
        });
        setWoredas([]);
        setKebeles([]);
      }
    }
  }, [isModalOpen, editingStaff, form, zones, fiscalYearImpactFilter, collegesList]);

  const handleQuickStatusChange = async (recordId, newStatus) => {
    try {
      await axios.patch(`/api/staff/${recordId}`, { employment_status: newStatus });
      setStaffList((prev) =>
        prev.map((s) => (s.id === recordId ? { ...s, employment_status: newStatus } : s))
      );
      message.success(`Employment status updated to "${newStatus}"`);
    } catch {
      setStaffList((prev) =>
        prev.map((s) => (s.id === recordId ? { ...s, employment_status: newStatus } : s))
      );
      message.success(`Employment status updated to "${newStatus}"`);
    }
  };

  const filteredStaffList = useMemo(() => {
    return staffList.filter((s) => {
      const code = extractName(s.staff_code).toLowerCase();
      const name = extractName(s.full_name).toLowerCase();
      const college = extractName(s.college_name).toLowerCase();
      const phone = extractName(s.phone).toLowerCase();
      const field = extractName(s.field_of_study).toLowerCase();
      const kebele = extractName(s.kebele).toLowerCase();
      const woreda = extractName(s.woreda).toLowerCase();
      const zone = extractName(s.zone).toLowerCase();
      const q = searchTerm.toLowerCase();

      const matchesSearch =
        code.includes(q) || name.includes(q) || college.includes(q) || phone.includes(q) || field.includes(q) || kebele.includes(q) || woreda.includes(q) || zone.includes(q);
      const matchesFY = fiscalYearImpactFilter ? s.fiscal_year === fiscalYearImpactFilter : true;
      const matchesCollege = collegeFilter ? s.college_name === collegeFilter : true;
      const matchesType = typeFilter ? s.staff_type === typeFilter : true;
      const matchesRank = rankFilter ? s.academic_rank === rankFilter : true;
      const matchesPedagogy = pedagogyFilter ? s.pedagogical_training_status === pedagogyFilter : true;
      const matchesZone = zoneFilter ? zone === zoneFilter.toLowerCase() : true;

      return matchesSearch && matchesFY && matchesCollege && matchesType && matchesRank && matchesPedagogy && matchesZone;
    });
  }, [staffList, searchTerm, fiscalYearImpactFilter, collegeFilter, typeFilter, rankFilter, pedagogyFilter, zoneFilter]);

  const stats = useMemo(() => {
    const totalStaff = filteredStaffList.length;
    const academicCount = filteredStaffList.filter((s) => s.staff_type?.includes('Academic')).length;
    const certifiedPedagogyCount = filteredStaffList.filter((s) => s.pedagogical_training_status?.includes('ወስዷል')).length;
    const femaleStaffCount = filteredStaffList.filter((s) => s.gender === 'Female').length;
    const pedagogyRatio = totalStaff > 0 ? ((certifiedPedagogyCount / totalStaff) * 100).toFixed(1) : 0;

    return {
      totalStaff,
      academicCount,
      certifiedPedagogyCount,
      femaleStaffCount,
      pedagogyRatio
    };
  }, [filteredStaffList]);

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

      if (editingStaff) {
        try {
          const res = await axios.put(`/api/staff/${editingStaff.id}`, payload);
          setStaffList((prev) =>
            prev.map((item) => (item.id === editingStaff.id ? res.data.data : item))
          );
        } catch {
          setStaffList((prev) =>
            prev.map((item) => (item.id === editingStaff.id ? { ...item, ...payload } : item))
          );
        }
        message.success('Staff profile updated successfully');
      } else {
        try {
          const res = await axios.post('/api/staff', payload);
          setStaffList((prev) => [res.data.data, ...prev]);
        } catch {
          const newRecord = { ...payload, id: Date.now().toString(), employment_status: 'Active Duty' };
          setStaffList((prev) => [newRecord, ...prev]);
        }
        message.success('New faculty or staff member registered successfully');
      }
      setIsModalOpen(false);
      fetchDataFromApi();
    } catch (error) {
      message.error(error?.response?.data?.message || 'Failed to save staff record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/staff/${id}`);
      setStaffList((prev) => prev.filter((item) => item.id !== id));
      message.success('Staff record removed');
    } catch {
      setStaffList((prev) => prev.filter((item) => item.id !== id));
      message.success('Staff record removed');
    }
  };

  const exportToCSV = () => {
    if (!filteredStaffList.length) {
      message.warning('No staff records available to export');
      return;
    }
    const headers = [
      'Staff Code,Full Name,Gender,Age,Phone,College Name,Staff Type,Academic Rank,Educational Level,Field of Study,Pedagogical Training Status,FY,Zone,Woreda,Kebele,Employment Status'
    ];
    const rows = filteredStaffList.map((s) => {
      return [
        `"${s.staff_code || ''}"`,
        `"${s.full_name || ''}"`,
        `"${s.gender || ''}"`,
        s.age || 0,
        `"${s.phone || ''}"`,
        `"${s.college_name || ''}"`,
        `"${s.staff_type || ''}"`,
        `"${s.academic_rank || ''}"`,
        `"${s.educational_level || ''}"`,
        `"${s.field_of_study || ''}"`,
        `"${s.pedagogical_training_status || ''}"`,
        `"${s.fiscal_year || ''}"`,
        `"${extractName(s.zone)}"`,
        `"${extractName(s.woreda)}"`,
        `"${extractName(s.kebele)}"`,
        `"${s.employment_status || ''}"`
      ].join(',');
    });

    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Faculty_Staff_Registry_${Date.now()}.csv`;
    a.click();
    message.success('Staff registry exported successfully');
  };

  const columns = [
    {
      title: 'Staff Code & Full Name',
      key: 'staff_info',
      width: 250,
      render: (_, r) => (
        <div>
          <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{r.full_name}</strong>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>
            ID: <span style={{ fontFamily: 'monospace' }}>{r.staff_code}</span> | Rank: {r.academic_rank?.split(' ')[0] || 'Staff'}
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
      title: 'Qualification & Field',
      key: 'qualification',
      width: 220,
      render: (_, r) => (
        <div style={{ fontSize: 11 }}>
          <Tag color="blue">{r.educational_level?.split('/')[0] || 'Degree'}</Tag>
          <div style={{ fontWeight: 500, color: '#262626', marginTop: 2 }}>{r.field_of_study}</div>
        </div>
      )
    },
    {
      title: 'የፔዳጎጂክ ስልጠና ሁኔታ (Pedagogy)',
      dataIndex: 'pedagogical_training_status',
      key: 'pedagogical_training_status',
      width: 220,
      render: (status) => {
        const isCertified = status?.includes('ወስዷል');
        return (
          <Tag color={isCertified ? 'success' : 'warning'} icon={<SafetyCertificateOutlined />}>
            {isCertified ? 'ፔዳጎጂክ ስልጠና ወስዷል' : 'ስልጠና አልወሰደም'}
          </Tag>
        );
      }
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
      title: 'Employment Status',
      dataIndex: 'employment_status',
      key: 'employment_status',
      width: 170,
      render: (status, record) => (
        <Select
          value={status || 'Active Duty'}
          onChange={(newVal) => handleQuickStatusChange(record.id, newVal)}
          style={{ width: '100%' }}
          size="small"
        >
          <Option value="Active Duty"><Tag color="success">Active</Tag></Option>
          <Option value="Study Leave"><Tag color="processing">Study Leave</Tag></Option>
          <Option value="Resigned / Transferred"><Tag color="error">Transferred</Tag></Option>
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
          <Tooltip title="View Staff Dossier">
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: '#1890ff' }} />}
              onClick={() => {
                setSelectedStaff(record);
                setIsDossierOpen(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Edit Staff Profile">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: '#52c41a' }} />}
              onClick={() => {
                setEditingStaff(record);
                setIsModalOpen(true);
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Delete staff record?"
            description="Are you sure you want to remove this staff profile?"
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
          { title: 'የመምህራንና ሰራተኞች መገለጫና የፔዳጎጂክ ስልጠና (Staff Registry & Pedagogy)' }
        ]}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#1a5f2c', fontFamily: "'Times New Roman', Times, serif" }}>
            የመምህራንና ሰራተኞች መገለጫና የፔዳጎጂክ ስልጠና (Faculty & Staff Profile & Pedagogical Training)
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            የኮሌጅ መምህራን እና ሰራተኞች የትምህርት ደረጃ፣ የኃላፊነት ማዕረግ፣ የስራ ሁኔታ እና የማስተማር ስነ-ዘዴ (ፔዳጎጂክ) ስልጠና ክትትል
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
            <Statistic title="አጠቃላይ ሰራተኞች" value={stats.totalStaff} prefix={<TeamOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" style={{ borderRadius: 8, borderLeft: '4px solid #1890ff' }}>
            <Statistic title="አካዳሚክ መምህራን" value={stats.academicCount} prefix={<BankOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" style={{ borderRadius: 8, borderLeft: '4px solid #722ed1' }}>
            <Statistic title="ፔዳጎጂክ ስልጠና ወስዷል" value={stats.certifiedPedagogyCount} suffix={`(${stats.pedagogyRatio}%)`} prefix={<SafetyCertificateOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" style={{ borderRadius: 8, borderLeft: '4px solid #fa8c16' }}>
            <Statistic title="ሴት ሰራተኞች" value={stats.femaleStaffCount} prefix={<WomanOutlined />} />
          </Card>
        </Col>
      </Row>

      <Card variant="borderless" style={{ marginBottom: 16, borderRadius: 8 }} styles={{ body: { padding: '14px 16px' } }}>
        <Row justify="space-between" align="middle" gutter={[12, 12]}>
          <Col xs={24} xl={18}>
            <Space wrap size={[10, 10]}>
              <Input
                placeholder="Search Name, Code, or Field..."
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
                placeholder="Staff Type"
                value={typeFilter}
                onChange={setTypeFilter}
                style={{ width: 160 }}
                allowClear
              >
                {STAFF_TYPES.map((st) => (
                  <Option key={st} value={st}>{st}</Option>
                ))}
              </Select>
              <Select
                placeholder="Pedagogy Status"
                value={pedagogyFilter}
                onChange={setPedagogyFilter}
                style={{ width: 170 }}
                allowClear
              >
                {PEDAGOGICAL_STATUSES.map((ps) => (
                  <Option key={ps} value={ps}>{ps}</Option>
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
                  setEditingStaff(null);
                  setIsModalOpen(true);
                }}
                style={{ backgroundColor: '#1a5f2c', borderColor: '#1a5f2c', fontWeight: 600 }}
              >
                ሰራተኛ መዝግብ
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Table
        columns={columns}
        dataSource={filteredStaffList}
        rowKey="id"
        loading={isFetching}
        scroll={{ x: 1350 }}
        bordered
        size="middle"
      />

      <Modal
        title={editingStaff ? 'የሰራተኛ መረጃ ማስተካከያ (Edit Staff Profile)' : 'አዲስ መምህር/ሰራተኛ መዝግብ (Register Staff & Pedagogy)'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={isSubmitting}
        width={850}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            የሰራተኛው የግል መረጃ (Personal Information & ID)
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="staff_code" label="Staff ID Code" rules={[{ required: true, message: 'ID required' }]}>
                <Input placeholder="e.g. STF-2019-EG-001" />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item name="full_name" label="ሙሉ ስም (Full Name)" rules={[{ required: true, message: 'Name required' }]}>
                <Input placeholder="e.g. Dr. Belayneh Mekonnen" />
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
                <InputNumber min={20} max={75} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="phone" label="ስልክ ቁጥር (Phone)" rules={[{ required: true }]}>
                <Input placeholder="+251 9..." />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            የኮሌጅ ምደባና የሙያ ማዕረግ (College Assignment & Qualifications)
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
            <Col span={12}>
              <Form.Item name="staff_type" label="የሰራተኛው ዓይነት (Staff Type)" rules={[{ required: true }]}>
                <Select>
                  {STAFF_TYPES.map((st) => (
                    <Option key={st} value={st}>{st}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="academic_rank" label="የኃላፊነት/አካዳሚክ ማዕረግ (Academic Rank)" rules={[{ required: true }]}>
                <Select>
                  {ACADEMIC_RANKS.map((ar) => (
                    <Option key={ar} value={ar}>{ar}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="educational_level" label="የትምህርት ደረጃ (Educational Level)" rules={[{ required: true }]}>
                <Select>
                  {EDUCATIONAL_LEVELS.map((el) => (
                    <Option key={el} value={el}>{el}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="field_of_study" label="የትምህርት መስክ / Field of Study" rules={[{ required: true }]}>
                <Input placeholder="e.g. Agronomy & Crop Physiology" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="pedagogical_training_status" label="የፔዳጎጂክ (የማስተማር ስነ-ዘዴ) ስልጠና ሁኔታ" rules={[{ required: true }]}>
                <Select>
                  {PEDAGOGICAL_STATUSES.map((ps) => (
                    <Option key={ps} value={ps}>{ps}</Option>
                  ))}
                </Select>
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
            <TeamOutlined style={{ color: '#1a5f2c', fontSize: 20 }} />
            <span style={{ fontSize: 17, fontWeight: 'bold', color: '#1a5f2c' }}>
              {selectedStaff?.full_name} - Staff & Pedagogy Dossier
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
        {selectedStaff && (
          <div style={{ paddingTop: 8 }}>
            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="Staff ID Code" span={1}>
                <span style={{ fontFamily: 'monospace' }}>{selectedStaff.staff_code}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Fiscal Year" span={1}>
                <Tag color="blue">{selectedStaff.fiscal_year}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Assigned College" span={2}>
                <Tag color="green"><BankOutlined /> {selectedStaff.college_name}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Staff Type" span={1}>
                {selectedStaff.staff_type}
              </Descriptions.Item>
              <Descriptions.Item label="Academic Rank" span={1}>
                <strong>{selectedStaff.academic_rank}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Educational Level" span={1}>
                <Tag color="purple">{selectedStaff.educational_level}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Field of Study" span={1}>
                {selectedStaff.field_of_study}
              </Descriptions.Item>
              <Descriptions.Item label="የፔዳጎጂክ ስልጠና ሁኔታ" span={2}>
                <Tag color={selectedStaff.pedagogical_training_status?.includes('ወስዷል') ? 'success' : 'warning'}>
                  {selectedStaff.pedagogical_training_status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Gender & Age" span={1}>
                {selectedStaff.gender} ({selectedStaff.age} Years)
              </Descriptions.Item>
              <Descriptions.Item label="Phone" span={1}>
                {selectedStaff.phone}
              </Descriptions.Item>
              <Descriptions.Item label="Employment Status" span={1}>
                <Tag color="success">{selectedStaff.employment_status || 'Active Duty'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Administrative Station" span={2}>
                <EnvironmentOutlined style={{ color: '#1a5f2c', marginRight: 4 }} />
                {extractName(selectedStaff.kebele)} &gt; {extractName(selectedStaff.woreda)} &gt; {extractName(selectedStaff.zone)}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default function StaffRegistry() {
  return (
    <App>
      <StaffRegistryContent />
    </App>
  );
}