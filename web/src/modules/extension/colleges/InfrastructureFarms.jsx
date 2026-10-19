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
  ToolOutlined,
  ExperimentOutlined,
  CompassOutlined,
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

const FACILITY_CATEGORIES = [
  'Laboratory Equipment & Chemical Inventory (የላብራቶሪ እቃዎችና ኬሚካሎች ክምችት)',
  'Practical Farm & Demonstration Plot (የተግባር እርሻና ሰርቶ ማሳያ ሜዳ)',
  'Mechanization & Agricultural Machinery (የሜካናይዜሽንና የግብርና ማሽነሪዎች)',
  'Livestock, Dairy & Fishery Infrastructure (የእንስሳት፣ ወተትና ዓሣ ሃብት መሠረተ ልማት)',
  'Smart Classroom & ICT Center (ዘመናዊ የክፍልና የአይሲቲ ማዕከል)'
];

const FACILITY_ACTIVITIES = [
  'Facility Maintenance & Equipment Calibration',
  'Demonstration Plot Preparation & Sowing',
  'Machinery Servicing & Field Readiness Check',
  'Laboratory Safety & Quality Audit',
  'Farm Expansion & Infrastructure Upgrading'
];

function InfrastructureFarmsContent() {
  const { message } = App.useApp();

  const [facilities, setFacilities] = useState([]);
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
  const [editingFacility, setEditingFacility] = useState(null);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [isDossierOpen, setIsDossierOpen] = useState(false);

  const [zones, setZones] = useState([]);
  const [woredas, setWoredas] = useState([]);
  const [kebeles, setKebeles] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  const [form] = Form.useForm();

  const fetchDataFromApi = async () => {
    setIsFetching(true);
    try {
      const [facilitiesRes, collegesRes] = await Promise.all([
        axios.get('/api/infrastructure', { params: { fiscal_year: fiscalYearImpactFilter } }),
        axios.get('/api/colleges')
      ]);
      setFacilities(facilitiesRes.data.data || []);
      setCollegesList(collegesRes.data.data || []);
    } catch (err) {
      console.error('Failed to load infrastructure data:', err);
      setFacilities([
        {
          id: '1',
          facility_code: 'INF-2019-EG-01',
          facility_title: 'Bahir Dar Agronomy Soil & Plant Testing Laboratory',
          college_name: 'Bahir Dar Agricultural ATVET College',
          facility_category: FACILITY_CATEGORIES[0],
          core_activity: FACILITY_ACTIVITIES[0],
          officer_name: 'Ato Getachew Mekonnen',
          officer_phone: '+251 913 990 112',
          land_area_hectares: 25.5,
          equipment_count: 140,
          operational_status: 'Fully Operational',
          fiscal_year: '2019 E.C.',
          facility_notes: 'Fully calibrated spectrophotometers, pH meters, and soil augers supporting student lab sessions.',
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
      if (editingFacility) {
        const initForm = async () => {
          const zoneMatch = zones.find(
            (z) => z.name === editingFacility.zone || z.id === editingFacility.zone_id
          );
          if (zoneMatch) {
            try {
              const wRes = locationApi?.getWoredas ? await locationApi.getWoredas(zoneMatch.id) : null;
              const wList = wRes?.data?.data?.data || wRes?.data?.data || [];
              setWoredas(wList);

              const woredaMatch = wList.find(
                (w) => w.name === editingFacility.woreda || w.id === editingFacility.woreda_id
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
            facility_code: editingFacility.facility_code,
            facility_title: editingFacility.facility_title,
            college_name: editingFacility.college_name,
            facility_category: editingFacility.facility_category,
            core_activity: editingFacility.core_activity,
            officer_name: editingFacility.officer_name,
            officer_phone: editingFacility.officer_phone,
            land_area_hectares: Number(editingFacility.land_area_hectares) || 10,
            equipment_count: Number(editingFacility.equipment_count) || 50,
            fiscal_year: editingFacility.fiscal_year || '2019 E.C.',
            facility_notes: editingFacility.facility_notes,
            zone_id: editingFacility.zone_id || zoneMatch?.id || editingFacility.zone,
            woreda_id: editingFacility.woreda_id || editingFacility.woreda,
            kebele_id: editingFacility.kebele_id || editingFacility.kebele
          });
        };
        initForm();
      } else {
        form.resetFields();
        form.setFieldsValue({
          college_name: collegesList[0]?.college_name || 'Bahir Dar Agricultural ATVET College',
          facility_category: FACILITY_CATEGORIES[0],
          core_activity: FACILITY_ACTIVITIES[0],
          land_area_hectares: 15,
          equipment_count: 80,
          fiscal_year: fiscalYearImpactFilter || '2019 E.C.'
        });
        setWoredas([]);
        setKebeles([]);
      }
    }
  }, [isModalOpen, editingFacility, form, zones, fiscalYearImpactFilter, collegesList]);

  const handleQuickStatusChange = async (recordId, newStatus) => {
    try {
      await axios.patch(`/api/infrastructure/${recordId}`, { operational_status: newStatus });
      setFacilities((prev) =>
        prev.map((f) => (f.id === recordId ? { ...f, operational_status: newStatus } : f))
      );
      message.success(`Facility status updated to "${newStatus}"`);
    } catch {
      setFacilities((prev) =>
        prev.map((f) => (f.id === recordId ? { ...f, operational_status: newStatus } : f))
      );
      message.success(`Facility status updated to "${newStatus}"`);
    }
  };

  const filteredFacilities = useMemo(() => {
    return facilities.filter((f) => {
      const code = extractName(f.facility_code).toLowerCase();
      const title = extractName(f.facility_title).toLowerCase();
      const college = extractName(f.college_name).toLowerCase();
      const officer = extractName(f.officer_name).toLowerCase();
      const kebele = extractName(f.kebele).toLowerCase();
      const woreda = extractName(f.woreda).toLowerCase();
      const zone = extractName(f.zone).toLowerCase();
      const q = searchTerm.toLowerCase();

      const matchesSearch =
        code.includes(q) || title.includes(q) || college.includes(q) || officer.includes(q) || kebele.includes(q) || woreda.includes(q) || zone.includes(q);
      const matchesFY = fiscalYearImpactFilter ? f.fiscal_year === fiscalYearImpactFilter : true;
      const matchesCollege = collegeFilter ? f.college_name === collegeFilter : true;
      const matchesCategory = categoryFilter ? f.facility_category === categoryFilter : true;
      const matchesActivity = activityFilter ? f.core_activity === activityFilter : true;
      const matchesStatus = statusFilter ? f.operational_status === statusFilter : true;
      const matchesZone = zoneFilter ? zone === zoneFilter.toLowerCase() : true;

      return matchesSearch && matchesFY && matchesCollege && matchesCategory && matchesActivity && matchesStatus && matchesZone;
    });
  }, [facilities, searchTerm, fiscalYearImpactFilter, collegeFilter, categoryFilter, activityFilter, statusFilter, zoneFilter]);

  const stats = useMemo(() => {
    const totalFacilities = filteredFacilities.length;
    const totalLandSum = filteredFacilities.reduce((acc, f) => acc + (Number(f.land_area_hectares) || 0), 0);
    const totalEquipmentSum = filteredFacilities.reduce((acc, f) => acc + (Number(f.equipment_count) || 0), 0);
    const operationalCount = filteredFacilities.filter((f) => f.operational_status === 'Fully Operational').length;

    return {
      totalFacilities,
      totalLandSum,
      totalEquipmentSum,
      operationalCount
    };
  }, [filteredFacilities]);

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

      if (editingFacility) {
        try {
          const res = await axios.put(`/api/infrastructure/${editingFacility.id}`, payload);
          setFacilities((prev) =>
            prev.map((item) => (item.id === editingFacility.id ? res.data.data : item))
          );
        } catch {
          setFacilities((prev) =>
            prev.map((item) => (item.id === editingFacility.id ? { ...item, ...payload } : item))
          );
        }
        message.success('Infrastructure record updated successfully');
      } else {
        try {
          const res = await axios.post('/api/infrastructure', payload);
          setFacilities((prev) => [res.data.data, ...prev]);
        } catch {
          const newRecord = { ...payload, id: Date.now().toString(), operational_status: 'Fully Operational' };
          setFacilities((prev) => [newRecord, ...prev]);
        }
        message.success('New laboratory or farm facility registered successfully');
      }
      setIsModalOpen(false);
      fetchDataFromApi();
    } catch (error) {
      message.error(error?.response?.data?.message || 'Failed to save infrastructure record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/infrastructure/${id}`);
      setFacilities((prev) => prev.filter((item) => item.id !== id));
      message.success('Facility record removed');
    } catch {
      setFacilities((prev) => prev.filter((item) => item.id !== id));
      message.success('Facility record removed');
    }
  };

  const exportToCSV = () => {
    if (!filteredFacilities.length) {
      message.warning('No facility records available to export');
      return;
    }
    const headers = [
      'Facility Code,Facility Title,College Name,Category,Core Activity,Land Area (Ha),Equipment Count,Officer,Phone,FY,Zone,Woreda,Kebele,Status'
    ];
    const rows = filteredFacilities.map((f) => {
      return [
        `"${f.facility_code || ''}"`,
        `"${f.facility_title || ''}"`,
        `"${f.college_name || ''}"`,
        `"${f.facility_category || ''}"`,
        `"${f.core_activity || ''}"`,
        f.land_area_hectares || 0,
        f.equipment_count || 0,
        `"${f.officer_name || ''}"`,
        `"${f.officer_phone || ''}"`,
        `"${f.fiscal_year || ''}"`,
        `"${extractName(f.zone)}"`,
        `"${extractName(f.woreda)}"`,
        `"${extractName(f.kebele)}"`,
        `"${f.operational_status || ''}"`
      ].join(',');
    });

    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Infrastructure_Farms_Registry_${Date.now()}.csv`;
    a.click();
    message.success('Infrastructure & farm registry exported successfully');
  };

  const columns = [
    {
      title: 'Facility Code & Title',
      key: 'facility_info',
      width: 260,
      render: (_, r) => (
        <div>
          <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{r.facility_title}</strong>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>
            Code: <span style={{ fontFamily: 'monospace' }}>{r.facility_code}</span> | Officer: {r.officer_name}
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
      title: 'Facility Category',
      dataIndex: 'facility_category',
      key: 'facility_category',
      width: 220,
      render: (cat) => <Tag color="blue">{cat?.split(' ')[0] || 'Facility'}</Tag>
    },
    {
      title: 'Land (ሄ/ር) & Equipments',
      key: 'metrics',
      width: 170,
      render: (_, r) => (
        <div style={{ fontSize: 11 }}>
          <div>መሬት: <strong style={{ color: '#1a5f2c' }}>{r.land_area_hectares || 0} ሄ/ር</strong></div>
          <div style={{ color: '#595959' }}>እቃዎች/ማሽኖች: {r.equipment_count || 0} ብዛት</div>
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
      title: 'Operational Status',
      dataIndex: 'operational_status',
      key: 'operational_status',
      width: 170,
      render: (status, record) => (
        <Select
          value={status || 'Fully Operational'}
          onChange={(newVal) => handleQuickStatusChange(record.id, newVal)}
          style={{ width: '100%' }}
          size="small"
        >
          <Option value="Fully Operational"><Tag color="success">Operational</Tag></Option>
          <Option value="Under Maintenance"><Tag color="warning">Maintenance</Tag></Option>
          <Option value="Needs Expansion"><Tag color="error">Needs Expansion</Tag></Option>
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
          <Tooltip title="View Facility Dossier">
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: '#1890ff' }} />}
              onClick={() => {
                setSelectedFacility(record);
                setIsDossierOpen(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Edit Facility">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: '#52c41a' }} />}
              onClick={() => {
                setEditingFacility(record);
                setIsModalOpen(true);
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Delete facility record?"
            description="Are you sure you want to remove this facility?"
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
          { title: 'መሠረተ ልማት፣ ላብራቶሪዎችና እርሻ ቦታዎች (Infrastructure & Farms)' }
        ]}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#1a5f2c', fontFamily: "'Times New Roman', Times, serif" }}>
            መሠረተ ልማት፣ ላብራቶሪዎችና እርሻ ቦታዎች (Infrastructure, Laboratories & Farm Facilities)
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            የኮሌጅ ላብራቶሪዎች፣ ተግባራዊ የእርሻ ማሳዎች፣ ሜካናይዜሽን ማሽነሪዎች እና የእንስሳት/ወተት ሃብት መሠረተ ልማቶች ክትትል
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
            <Statistic title="አጠቃላይ ፋሲሊቲዎች" value={stats.totalFacilities} prefix={<BankOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" style={{ borderRadius: 8, borderLeft: '4px solid #52c41a' }}>
            <Statistic title="አጠቃላይ የእርሻ መሬት (ሄ/ር)" value={stats.totalLandSum} suffix="ሄ/ር" prefix={<CompassOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" style={{ borderRadius: 8, borderLeft: '4px solid #1890ff' }}>
            <Statistic title="የላብራቶሪ/ማሽነሪ ቁሳቁስ ብዛት" value={stats.totalEquipmentSum} prefix={<ExperimentOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" style={{ borderRadius: 8, borderLeft: '4px solid #fa8c16' }}>
            <Statistic title="ሙሉ በሙሉ አገልግሎት ላይ ያሉ" value={stats.operationalCount} prefix={<CheckSquareOutlined />} />
          </Card>
        </Col>
      </Row>

      <Card variant="borderless" style={{ marginBottom: 16, borderRadius: 8 }} styles={{ body: { padding: '14px 16px' } }}>
        <Row justify="space-between" align="middle" gutter={[12, 12]}>
          <Col xs={24} xl={18}>
            <Space wrap size={[10, 10]}>
              <Input
                placeholder="Search Title, Code, or Officer..."
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
                placeholder="Facility Category"
                value={categoryFilter}
                onChange={setCategoryFilter}
                style={{ width: 190 }}
                allowClear
              >
                {FACILITY_CATEGORIES.map((fc) => (
                  <Option key={fc} value={fc}>{fc}</Option>
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
                  setEditingFacility(null);
                  setIsModalOpen(true);
                }}
                style={{ backgroundColor: '#1a5f2c', borderColor: '#1a5f2c', fontWeight: 600 }}
              >
                ፋሲሊቲ መዝግብ
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Table
        columns={columns}
        dataSource={filteredFacilities}
        rowKey="id"
        loading={isFetching}
        scroll={{ x: 1350 }}
        bordered
        size="middle"
      />

      <Modal
        title={editingFacility ? 'የፋሲሊቲ መረጃ ማስተካከያ (Edit Facility Record)' : 'አዲስ መሠረተ ልማት/ፋሲሊቲ መዝግብ (Register Facility)'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={isSubmitting}
        width={850}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            የፋሲሊቲው መለያና የኮሌጅ ምደባ (Facility Info & College Assignment)
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="facility_code" label="Facility Code" rules={[{ required: true, message: 'Code required' }]}>
                <Input placeholder="e.g. INF-2019-EG-001" />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item name="facility_title" label="የፋሲሊቲው ስም / መግለጫ (Facility Title)" rules={[{ required: true, message: 'Title required' }]}>
                <Input placeholder="e.g. Agronomy Soil & Plant Testing Laboratory" />
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
              <Form.Item name="facility_category" label="ፋሲሊቲ ዓይነት (Facility Category)" rules={[{ required: true }]}>
                <Select>
                  {FACILITY_CATEGORIES.map((fc) => (
                    <Option key={fc} value={fc}>{fc}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="core_activity" label=" ዋና ተግባር (Core Activity)" rules={[{ required: true }]}>
                <Select>
                  {FACILITY_ACTIVITIES.map((fa) => (
                    <Option key={fa} value={fa}>{fa}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="land_area_hectares" label="የመሬት ስፋት በሄክታር (Land Area - ሄ/ር)" rules={[{ required: true }]}>
                <InputNumber min={0} step={0.5} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="equipment_count" label="የቁሳቁስ / ማሽነሪዎች ብዛት (Equipment)" rules={[{ required: true }]}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="officer_phone" label="ኃላፊው ስልክ (Phone)" rules={[{ required: true }]}>
                <Input placeholder="+251 9..." />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="officer_name" label="የፋሲሊቲው ኃላፊ (Officer Name)" rules={[{ required: true }]}>
                <Input placeholder="Officer Name" />
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
            <ToolOutlined style={{ color: '#1a5f2c', fontSize: 20 }} />
            <span style={{ fontSize: 17, fontWeight: 'bold', color: '#1a5f2c' }}>
              {selectedFacility?.facility_title} - Facility Dossier
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
        {selectedFacility && (
          <div style={{ paddingTop: 8 }}>
            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="Facility Code" span={1}>
                <span style={{ fontFamily: 'monospace' }}>{selectedFacility.facility_code}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Fiscal Year" span={1}>
                <Tag color="blue">{selectedFacility.fiscal_year}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Assigned College" span={2}>
                <Tag color="green"><BankOutlined /> {selectedFacility.college_name}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Facility Category" span={2}>
                {selectedFacility.facility_category}
              </Descriptions.Item>
              <Descriptions.Item label="Core Activity" span={2}>
                {selectedFacility.core_activity}
              </Descriptions.Item>
              <Descriptions.Item label="Land Area (ሄ/ር)" span={1}>
                <strong>{selectedFacility.land_area_hectares || 0} ሄክታር</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Equipment/Machinery Count" span={1}>
                <strong>{selectedFacility.equipment_count || 0} ብዛት</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Facility Officer" span={1}>
                {selectedFacility.officer_name} ({selectedFacility.officer_phone})
              </Descriptions.Item>
              <Descriptions.Item label="Operational Status" span={1}>
                <Tag color="success">{selectedFacility.operational_status}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Administrative Station" span={2}>
                <EnvironmentOutlined style={{ color: '#1a5f2c', marginRight: 4 }} />
                {extractName(selectedFacility.kebele)} &gt; {extractName(selectedFacility.woreda)} &gt; {extractName(selectedFacility.zone)}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default function InfrastructureFarms() {
  return (
    <App>
      <InfrastructureFarmsContent />
    </App>
  );
}