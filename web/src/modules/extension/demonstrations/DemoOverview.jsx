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
  Spin,
  DatePicker
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
  EnvironmentFilled,
  IdcardOutlined,
  PhoneOutlined,
  ManOutlined,
  WomanOutlined,
  RiseOutlined,
  ShopOutlined,
  CheckSquareOutlined,
  SafetyCertificateOutlined,
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
const SEASONS = ['Meher (መኸር)', 'Belg (በልግ)', 'Bega / Irrigation (መስኖ/በጋ)'];

const DEMO_CATEGORIES = [
  'FTC Main Demonstration Site (የኤክስቴንሽን ማሰልጠኛ ማዕከል ማሳ)',
  'Model Farmer Outreach Plot (የሞዴል አርሶ አደር ማሳ ማሳያ)',
  'Digital Soil Testing FTC Plot (ዲጂታል አፈር ምርመራ ማሳ)',
  'Seed Variety Trial Plot (የምርጥ ዘር ሙከራ ማሳ)',
  'Mechanized Agronomy Demonstration (በማሽነሪ የሚለማ ማሳ)'
];

const TECHNOLOGY_FOCUS = [
  'Hybrid Seed Varieties & Seeding Rate',
  'Blended Fertilizer Application & NPSB',
  'Row Planting vs. Traditional Broadcasting',
  'Fall Armyworm & Integrated Pest Control',
  'Small-Scale Irrigation & Water Efficiency'
];

const INITIAL_DEMOS = [
  {
    id: '1',
    demo_code: 'DEM-2019-EG-01',
    demo_title: 'Kurar FTC Quncho Teff Row-Planting & NPSB Plot',
    demo_category: 'FTC Main Demonstration Site (የኤክስቴንሽን ማሰልጠኛ ማዕከል ማሳ)',
    technology_focus: 'Hybrid Seed Varieties & Seeding Rate',
    site_supervisor: 'Ato Mulugeta Fentaw (DA)',
    supervisor_phone: '+251 918 445 566',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    plot_size_ha: 2.5,
    male_visitors: 110,
    female_visitors: 45,
    married_women_visitors: 38,
    youth_visitors: 25,
    investors_visitors: 4,
    demo_status: 'Active Display',
    demo_notes: 'Demonstrating 38 quintals/ha yield comparison between row planting and broadcast sowing.',
    zone: 'East Gojjam',
    woreda: 'Dejen',
    kebele: 'Kurar'
  },
  {
    id: '2',
    demo_code: 'DEM-2019-SG-04',
    demo_title: 'Woreta Zuria Model Farmer Hybrid Maize Outreach Plot',
    demo_category: 'Model Farmer Outreach Plot (የሞዴል አርሶ አደር ማሳ ማሳያ)',
    technology_focus: 'Row Planting vs. Traditional Broadcasting',
    site_supervisor: 'Woizero Aster Melesse (DA)',
    supervisor_phone: '+251 922 112 334',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    plot_size_ha: 1.8,
    male_visitors: 85,
    female_visitors: 40,
    married_women_visitors: 32,
    youth_visitors: 20,
    investors_visitors: 2,
    demo_status: 'Active Display',
    demo_notes: 'Showcasing BH-546 hybrid maize resilience against mid-season dry spells.',
    zone: 'South Gondar',
    woreda: 'Fogera',
    kebele: 'Woreta Zuria'
  },
  {
    id: '3',
    demo_code: 'DEM-2019-WG-09',
    demo_title: 'Alefa Digital Soil Testing & Fertilizer Blending FTC Plot',
    demo_category: 'Digital Soil Testing FTC Plot (ዲጂታል አፈር ምርመራ ማሳ)',
    technology_focus: 'Blended Fertilizer Application & NPSB',
    site_supervisor: 'Ato Tadesse Worku (DA)',
    supervisor_phone: '+251 911 889 001',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    plot_size_ha: 2.0,
    male_visitors: 90,
    female_visitors: 35,
    married_women_visitors: 28,
    youth_visitors: 22,
    investors_visitors: 3,
    demo_status: 'Harvest Completed',
    demo_notes: 'Mapped soil acidity profiles and demonstrated agricultural lime neutralization.',
    zone: 'West Gojjam',
    woreda: 'Bure',
    kebele: 'Alefa'
  }
];

function DemoOverviewContent() {
  const { message } = App.useApp();

  const [demos, setDemos] = useState(INITIAL_DEMOS);
  const [isFetching, setIsFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [technologyFilter, setTechnologyFilter] = useState(null);
  const [fiscalYearFilter, setFiscalYearFilter] = useState(null);
  const [seasonFilter, setSeasonFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [zoneFilter, setZoneFilter] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDemo, setEditingDemo] = useState(null);
  const [selectedDemo, setSelectedDemo] = useState(null);
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
      if (editingDemo) {
        const initForm = async () => {
          const zoneMatch = zones.find(
            (z) => z.name === editingDemo.zone || z.id === editingDemo.zone_id
          );
          if (zoneMatch) {
            try {
              const wRes = locationApi?.getWoredas ? await locationApi.getWoredas(zoneMatch.id) : null;
              const wList = wRes?.data?.data?.data || wRes?.data?.data || [];
              setWoredas(wList);

              const woredaMatch = wList.find(
                (w) => w.name === editingDemo.woreda || w.id === editingDemo.woreda_id
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
            demo_code: editingDemo.demo_code,
            demo_title: editingDemo.demo_title,
            demo_category: editingDemo.demo_category,
            technology_focus: editingDemo.technology_focus,
            site_supervisor: editingDemo.site_supervisor,
            supervisor_phone: editingDemo.supervisor_phone,
            fiscal_year: editingDemo.fiscal_year || '2019 E.C.',
            season: editingDemo.season || 'Meher (መኸር)',
            plot_size_ha: Number(editingDemo.plot_size_ha) || 1.0,
            male_visitors: Number(editingDemo.male_visitors) || 0,
            female_visitors: Number(editingDemo.female_visitors) || 0,
            married_women_visitors: Number(editingDemo.married_women_visitors) || 0,
            youth_visitors: Number(editingDemo.youth_visitors) || 0,
            investors_visitors: Number(editingDemo.investors_visitors) || 0,
            demo_notes: editingDemo.demo_notes,
            zone_id: editingDemo.zone_id || zoneMatch?.id || editingDemo.zone,
            woreda_id: editingDemo.woreda_id || editingDemo.woreda,
            kebele_id: editingDemo.kebele_id || editingDemo.kebele
          });
        };
        initForm();
      } else {
        form.resetFields();
        form.setFieldsValue({
          demo_category: 'FTC Main Demonstration Site (የኤክስቴንሽን ማሰልጠኛ ማዕከል ማሳ)',
          technology_focus: 'Hybrid Seed Varieties & Seeding Rate',
          fiscal_year: '2019 E.C.',
          season: 'Meher (መኸር)',
          plot_size_ha: 1.5,
          male_visitors: 40,
          female_visitors: 20,
          married_women_visitors: 15,
          youth_visitors: 10,
          investors_visitors: 1
        });
        setWoredas([]);
        setKebeles([]);
      }
    }
  }, [isModalOpen, editingDemo, form, zones]);

  const loadData = async () => {
    setIsFetching(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      message.success('Demonstration plots registry refreshed');
    } catch {
      message.error('Failed to refresh data');
    } finally {
      setIsFetching(false);
    }
  };

  // Direct In-Place Status Update without Opening the Form
  const handleQuickStatusChange = (recordId, newStatus) => {
    setDemos((prev) =>
      prev.map((d) => (d.id === recordId ? { ...d, demo_status: newStatus } : d))
    );
    message.success(`Demonstration status updated to "${newStatus}"`);
  };

  // Filter pipeline
  const filteredDemos = useMemo(() => {
    return demos.filter((d) => {
      const code = extractName(d.demo_code).toLowerCase();
      const title = extractName(d.demo_title).toLowerCase();
      const sup = extractName(d.site_supervisor).toLowerCase();
      const kebele = extractName(d.kebele).toLowerCase();
      const woreda = extractName(d.woreda).toLowerCase();
      const zone = extractName(d.zone).toLowerCase();
      const q = searchTerm.toLowerCase();

      const matchesSearch =
        code.includes(q) || title.includes(q) || sup.includes(q) || kebele.includes(q) || woreda.includes(q) || zone.includes(q);
      const matchesCategory = categoryFilter ? d.demo_category === categoryFilter : true;
      const matchesTech = technologyFilter ? d.technology_focus === technologyFilter : true;
      const matchesFY = fiscalYearFilter ? d.fiscal_year === fiscalYearFilter : true;
      const matchesSeason = seasonFilter ? d.season === seasonFilter : true;
      const matchesStatus = statusFilter ? d.demo_status === statusFilter : true;
      const matchesZone = zoneFilter ? zone === zoneFilter.toLowerCase() : true;

      return matchesSearch && matchesCategory && matchesTech && matchesFY && matchesSeason && matchesStatus && matchesZone;
    });
  }, [demos, searchTerm, categoryFilter, technologyFilter, fiscalYearFilter, seasonFilter, statusFilter, zoneFilter]);

  // Statistics Calculation
  const stats = useMemo(() => {
    const totalDemos = filteredDemos.length;
    const totalArea = filteredDemos.reduce((acc, d) => acc + (Number(d.plot_size_ha) || 0), 0);
    const maleVisitors = filteredDemos.reduce((acc, d) => acc + (Number(d.male_visitors) || 0), 0);
    const femaleVisitors = filteredDemos.reduce((acc, d) => acc + (Number(d.female_visitors) || 0), 0);
    const marriedWomen = filteredDemos.reduce((acc, d) => acc + (Number(d.married_women_visitors) || 0), 0);
    const youth = filteredDemos.reduce((acc, d) => acc + (Number(d.youth_visitors) || 0), 0);
    const investors = filteredDemos.reduce((acc, d) => acc + (Number(d.investors_visitors) || 0), 0);

    const totalVisitors = maleVisitors + femaleVisitors + marriedWomen + youth + investors;
    const totalWomenVisitors = femaleVisitors + marriedWomen;
    const womenRatio = totalVisitors > 0 ? ((totalWomenVisitors / totalVisitors) * 100).toFixed(1) : 0;
    const activeCount = filteredDemos.filter((d) => d.demo_status === 'Active Display').length;

    return {
      totalDemos,
      totalArea,
      totalVisitors,
      maleVisitors,
      femaleVisitors,
      marriedWomen,
      totalWomenVisitors,
      youth,
      investors,
      womenRatio,
      activeCount
    };
  }, [filteredDemos]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setCategoryFilter(null);
    setTechnologyFilter(null);
    setFiscalYearFilter(null);
    setSeasonFilter(null);
    setStatusFilter(null);
    setZoneFilter(null);
  };

  const handleOpenModal = (record = null) => {
    setEditingDemo(record);
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
        zone: selectedZone?.name || selectedZone?.zone_name || values.zone_id,
        woreda: selectedWoreda?.name || selectedWoreda?.woreda_name || values.woreda_id,
        kebele: selectedKebele?.name || selectedKebele?.kebele_name || values.kebele_id
      };

      if (editingDemo) {
        setDemos((prev) =>
          prev.map((item) =>
            item.id === editingDemo.id ? { ...item, ...payload, demo_status: editingDemo.demo_status } : item
          )
        );
        message.success('Demonstration plot record updated successfully');
      } else {
        const newRecord = {
          ...payload,
          id: Date.now().toString(),
          demo_code: values.demo_code || `DEM-${Date.now().toString().slice(-4)}`,
          demo_status: 'Active Display'
        };
        setDemos((prev) => [newRecord, ...prev]);
        message.success('New demonstration plot registered successfully');
      }
      setIsModalOpen(false);
    } catch (error) {
      message.error(error?.response?.data?.message || error.message || 'Failed to save demonstration record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    setDemos((prev) => prev.filter((item) => item.id !== id));
    message.success('Demonstration plot record removed');
  };

  const exportToCSV = () => {
    if (!filteredDemos.length) {
      message.warning('No demonstration records available to export');
      return;
    }
    const headers = [
      'Demo Code,Title,Category,Technology Focus,Plot Size (Ha),Supervisor,Phone,FY,Season,Zone,Woreda,Kebele,Male (ወንድ),Female (ሴት),Married Women (ባለትዳር),Youth (ወጣቶች),Investors (ባለሃብቶች),Total Visitors,Status'
    ];
    const rows = filteredDemos.map((d) => {
      const total =
        (Number(d.male_visitors) || 0) +
        (Number(d.female_visitors) || 0) +
        (Number(d.married_women_visitors) || 0) +
        (Number(d.youth_visitors) || 0) +
        (Number(d.investors_visitors) || 0);

      return [
        `"${d.demo_code || ''}"`,
        `"${d.demo_title || ''}"`,
        `"${d.demo_category || ''}"`,
        `"${d.technology_focus || ''}"`,
        d.plot_size_ha || 0,
        `"${d.site_supervisor || ''}"`,
        `"${d.supervisor_phone || ''}"`,
        `"${d.fiscal_year || ''}"`,
        `"${d.season || ''}"`,
        `"${extractName(d.zone)}"`,
        `"${extractName(d.woreda)}"`,
        `"${extractName(d.kebele)}"`,
        d.male_visitors || 0,
        d.female_visitors || 0,
        d.married_women_visitors || 0,
        d.youth_visitors || 0,
        d.investors_visitors || 0,
        total,
        `"${d.demo_status || ''}"`
      ].join(',');
    });

    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Demonstration_Overview_Report_${Date.now()}.csv`;
    a.click();
    message.success('Demonstration overview report exported successfully');
  };

  const columns = [
    {
      title: 'Demo Code & Title',
      key: 'demo_info',
      width: 250,
      render: (_, r) => (
        <div>
          <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{r.demo_title}</strong>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>
            Code: <span style={{ fontFamily: 'monospace' }}>{r.demo_code}</span> | Size: {r.plot_size_ha} Ha
          </div>
        </div>
      )
    },
    {
      title: 'Demo Category',
      dataIndex: 'demo_category',
      key: 'demo_category',
      width: 210,
      render: (cat) => {
        let color = 'default';
        if (cat?.includes('FTC')) color = 'green';
        if (cat?.includes('Model')) color = 'gold';
        if (cat?.includes('Digital')) color = 'blue';
        if (cat?.includes('Seed')) color = 'purple';
        return <Tag color={color}>{cat}</Tag>;
      }
    },
    {
      title: 'Technology Focus',
      dataIndex: 'technology_focus',
      key: 'technology_focus',
      width: 210,
      render: (tech) => <span style={{ fontWeight: 500, color: '#262626' }}>{tech}</span>
    },
    {
      title: 'Station (Location)',
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
      title: 'Timeline (FY / Season)',
      key: 'timeline',
      width: 180,
      render: (_, r) => (
        <div style={{ fontSize: 12 }}>
          <Tag color="blue" icon={<CalendarOutlined />}>
            {r.fiscal_year || '2019 E.C.'}
          </Tag>
          <div style={{ color: '#595959', marginTop: 2 }}>{r.season || 'Meher (መኸር)'}</div>
        </div>
      )
    },
    {
      title: 'Visitors Enrolled',
      key: 'visitors_breakdown',
      width: 230,
      render: (_, r) => {
        const total =
          (Number(r.male_visitors) || 0) +
          (Number(r.female_visitors) || 0) +
          (Number(r.married_women_visitors) || 0) +
          (Number(r.youth_visitors) || 0) +
          (Number(r.investors_visitors) || 0);

        return (
          <div style={{ fontSize: 11 }}>
            <div>
              Total: <strong style={{ color: '#1a5f2c' }}>{total.toLocaleString()} Visitors</strong>
            </div>
            <div style={{ color: '#8c8c8c' }}>
              <span>ወንድ: {r.male_visitors || 0}</span> | <span>ሴት: {r.female_visitors || 0}</span> | <span>ባለትዳር: {r.married_women_visitors || 0}</span>
            </div>
          </div>
        );
      }
    },
    {
      title: 'Demo Status (In-Place Edit)',
      dataIndex: 'demo_status',
      key: 'demo_status',
      width: 190,
      render: (status, record) => (
        <Select
          value={status || 'Active Display'}
          onChange={(newVal) => handleQuickStatusChange(record.id, newVal)}
          style={{ width: '100%' }}
          size="small"
        >
          <Option value="Active Display">
            <Tag color="success" icon={<CheckCircleOutlined />} style={{ margin: 0 }}>
              Active
            </Tag>
          </Option>
          <Option value="Harvest Completed">
            <Tag color="processing" icon={<ClockCircleOutlined />} style={{ margin: 0 }}>
              Harvested
            </Tag>
          </Option>
          <Option value="Dormant">
            <Tag color="default" icon={<ClockCircleOutlined />} style={{ margin: 0 }}>
              Dormant
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
          <Tooltip title="View Demo Dossier">
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: '#1890ff' }} />}
              onClick={() => {
                setSelectedDemo(record);
                setIsDossierOpen(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Edit Demo Plot">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: '#52c41a' }} />}
              onClick={() => handleOpenModal(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Record">
            <Popconfirm
              title="Delete demonstration plot record?"
              description="Are you sure you want to remove this demonstration plot?"
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
        <Breadcrumb.Item>Demonstrations</Breadcrumb.Item>
        <Breadcrumb.Item>Demonstration Overview (FTC & Farmer Plots)</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#1a5f2c', fontFamily: "'Times New Roman', Times, serif" }}>
            Demonstration Overview (FTC & Farmer Plots) (የማሳ ማሳያዎች አጠቃላይ እይታ - ኤፍቲሲና አርሶ አደር ማሳዎች)
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Coordinating technology demonstration plots established across Farmers Training Centers (FTCs) and model farmer fields
          </Text>
        </div>
        <Button icon={<ReloadOutlined />} onClick={loadData} loading={isFetching}>
          Refresh
        </Button>
      </div>

      {/* KPI Dashboard */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #1a5f2c', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Total Demonstration Area (Ha)</span>}
              value={stats.totalArea}
              suffix="Ha"
              prefix={<EnvironmentFilled style={{ color: '#1a5f2c', marginRight: 8 }} />}
              valueStyle={{ color: '#1a5f2c', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Total Plots: <strong style={{ color: '#262626' }}>{stats.totalDemos} plots</strong>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #1890ff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Male Visitors (ወንድ)</span>}
              value={stats.maleVisitors}
              prefix={<ManOutlined style={{ color: '#1890ff', marginRight: 8 }} />}
              valueStyle={{ color: '#1890ff', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Male farmers visiting demo plots
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #722ed1', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Women Visitors (ሴት + ባለትዳር)</span>}
              value={stats.totalWomenVisitors}
              prefix={<WomanOutlined style={{ color: '#722ed1', marginRight: 8 }} />}
              valueStyle={{ color: '#722ed1', fontWeight: 'bold', fontSize: 24 }}
            />
            <Progress percent={Number(stats.womenRatio)} size="small" strokeColor="#722ed1" />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8c8c8c', marginTop: 2 }}>
              <span>Share: <strong style={{ color: '#722ed1' }}>{stats.womenRatio}%</strong></span>
              <span>Regional Goal: &gt; 35%</span>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #fa8c16', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Active Display Plots</span>}
              value={stats.activeCount}
              prefix={<CheckSquareOutlined style={{ color: '#fa8c16', marginRight: 8 }} />}
              valueStyle={{ color: '#fa8c16', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Youth: <strong>{stats.youth}</strong> | Investors: <strong>{stats.investors}</strong>
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
                placeholder="Search Title, Code, or Supervisor..."
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: 220 }}
                allowClear
              />

              <Select
                placeholder="Demo Category"
                value={categoryFilter}
                onChange={setCategoryFilter}
                style={{ width: 195 }}
                allowClear
              >
                {DEMO_CATEGORIES.map((dc) => (
                  <Option key={dc} value={dc}>{dc}</Option>
                ))}
              </Select>

              <Select
                placeholder="Technology Focus"
                value={technologyFilter}
                onChange={setTechnologyFilter}
                style={{ width: 200 }}
                allowClear
              >
                {TECHNOLOGY_FOCUS.map((tf) => (
                  <Option key={tf} value={tf}>{tf}</Option>
                ))}
              </Select>

              <Select
                placeholder="Fiscal Year (በጀት ዓመት)"
                value={fiscalYearFilter}
                onChange={setFiscalYearFilter}
                style={{ width: 155 }}
                allowClear
              >
                {FISCAL_YEARS.map((fy) => (
                  <Option key={fy} value={fy}>{fy}</Option>
                ))}
              </Select>

              <Select
                placeholder="Season (የምርት ወቅት)"
                value={seasonFilter}
                onChange={setSeasonFilter}
                style={{ width: 175 }}
                allowClear
              >
                {SEASONS.map((s) => (
                  <Option key={s} value={s}>{s}</Option>
                ))}
              </Select>

              <Select
                placeholder="Filter by Zone"
                value={zoneFilter}
                onChange={setZoneFilter}
                style={{ width: 150 }}
                allowClear
              >
                {[...new Set(demos.map((d) => extractName(d.zone)))].map((z) => (
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
                Export Demo CSV
              </Button>

              <Button
                icon={<ClearOutlined />}
                onClick={handleResetFilters}
                disabled={!(searchTerm || categoryFilter || technologyFilter || fiscalYearFilter || seasonFilter || statusFilter || zoneFilter)}
              >
                Reset Filters
              </Button>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => handleOpenModal(null)}
                style={{ backgroundColor: '#1a5f2c', borderColor: '#1a5f2c', fontWeight: 600 }}
              >
                Register Demo Plot
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Main Table */}
      <Table
        columns={columns}
        dataSource={filteredDemos}
        rowKey="id"
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} demonstration plots`
        }}
        scroll={{ x: 1350 }}
        bordered
        size="middle"
      />

      {/* Registration / Edit Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <EnvironmentFilled style={{ color: '#1a5f2c', fontSize: 20 }} />
            <span style={{ color: '#1a5f2c', fontWeight: 'bold', fontFamily: "'Times New Roman', Times, serif", fontSize: 17 }}>
              {editingDemo ? 'Edit Demonstration Plot Record' : 'Register Demonstration Plot (የማሳ ማሳያ ምዝገባ)'}
            </span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText={editingDemo ? 'Update Demo Plot' : 'Save Demo Record'}
        okButtonProps={{ style: { backgroundColor: '#1a5f2c', borderColor: '#1a5f2c' }, loading: isSubmitting }}
        width={800}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Plot Identification & Category
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="demo_code"
                label="Demo Code"
                rules={[{ required: true, message: 'Code required' }]}
              >
                <Input placeholder="e.g. DEM-2019-EG-08" />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item
                name="demo_title"
                label="Demonstration Title / Plot Name"
                rules={[{ required: true, message: 'Title required' }]}
              >
                <Input placeholder="e.g. Kurar FTC Teff Row-Planting Plot" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="demo_category"
                label="Demonstration Category"
                rules={[{ required: true, message: 'Select category' }]}
              >
                <Select>
                  {DEMO_CATEGORIES.map((dc) => (
                    <Option key={dc} value={dc}>{dc}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="technology_focus"
                label="Core Technology Focus"
                rules={[{ required: true, message: 'Select technology' }]}
              >
                <Select>
                  {TECHNOLOGY_FOCUS.map((tf) => (
                    <Option key={tf} value={tf}>{tf}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={14}>
              <Form.Item
                name="site_supervisor"
                label="Site Supervisor / DA Name"
                rules={[{ required: true, message: 'Supervisor required' }]}
              >
                <Input placeholder="e.g. Ato Mulugeta Fentaw (DA)" />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item
                name="supervisor_phone"
                label="Supervisor Phone Number"
                rules={[{ required: true, message: 'Phone required' }]}
              >
                <Input placeholder="+251 9..." />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Timeline & Plot Size (Hectares)
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
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
            <Col span={8}>
              <Form.Item
                name="season"
                label="Season (የምርት ወቅት)"
                rules={[{ required: true }]}
              >
                <Select>
                  {SEASONS.map((s) => (
                    <Option key={s} value={s}>{s}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="plot_size_ha"
                label="Plot Size (Hectares)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0.1} max={50} step={0.1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Visitors Enrolled by Cohort (ጎብኚዎች በወኪል ምድብ)
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="male_visitors"
                label="Male Visitors (ወንድ)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="female_visitors"
                label="Female Visitors (ሴት)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="married_women_visitors"
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
                name="youth_visitors"
                label="Youth Visitors (ወጣቶች)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="investors_visitors"
                label="Private Investors (ባለሃብቶች)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="demo_notes" label="Demonstration Notes & Yield Results">
                <TextArea rows={3} placeholder="Summarize demonstration findings, yield comparisons, or farmer feedback..." />
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

      {/* Comprehensive Demo Dossier Modal */}
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
                <EnvironmentFilled />
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
                  {selectedDemo?.demo_title}
                </span>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                  Code: <span style={{ fontFamily: 'monospace' }}>{selectedDemo?.demo_code}</span> | Supervisor:{' '}
                  {selectedDemo?.site_supervisor}
                </div>
              </div>
            </div>
            <div>
              <Tag
                color={selectedDemo?.demo_status === 'Active Display' ? 'success' : 'processing'}
                icon={selectedDemo?.demo_status === 'Active Display' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                style={{ fontSize: 12, padding: '2px 10px', borderRadius: 12 }}
              >
                {selectedDemo?.demo_status || 'Active'}
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
              handleOpenModal(selectedDemo);
            }}
          >
            Edit Demo
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
        {selectedDemo && (
          <div style={{ paddingTop: 8 }}>
            {/* Top Metric Strip */}
            <Row gutter={12} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f6ffed', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Plot Size</span>}
                    value={selectedDemo.plot_size_ha || 1.0}
                    suffix={<span style={{ fontSize: 12 }}>Ha</span>}
                    valueStyle={{ fontSize: 15, fontWeight: 'bold', color: '#1a5f2c' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f0f5ff', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Demo Category</span>}
                    value={selectedDemo.demo_category?.split(' ')[0] || 'Category'}
                    valueStyle={{ fontSize: 15, fontWeight: 'bold', color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f9f0ff', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Women Share</span>}
                    value={
                      (Number(selectedDemo.male_visitors) || 0) +
                      (Number(selectedDemo.female_visitors) || 0) +
                      (Number(selectedDemo.married_women_visitors) || 0) +
                      (Number(selectedDemo.youth_visitors) || 0) +
                      (Number(selectedDemo.investors_visitors) || 0) > 0
                        ? (
                            (((Number(selectedDemo.female_visitors) || 0) +
                              (Number(selectedDemo.married_women_visitors) || 0)) /
                              ((Number(selectedDemo.male_visitors) || 0) +
                                (Number(selectedDemo.female_visitors) || 0) +
                                (Number(selectedDemo.married_women_visitors) || 0) +
                                (Number(selectedDemo.youth_visitors) || 0) +
                                (Number(selectedDemo.investors_visitors) || 0))) *
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
                    value={selectedDemo.fiscal_year}
                    valueStyle={{ fontSize: 13, fontWeight: 'bold', color: '#fa8c16' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* TABPANES */}
            <Tabs defaultActiveKey="1" type="card">
              {/* TAB 1: Demo Profile */}
              <TabPane
                tab={
                  <span>
                    <TeamOutlined />
                    Visitor Demographics & Reach
                  </span>
                }
                key="1"
              >
                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }} style={{ marginBottom: 16 }}>
                  <Descriptions.Item label="Demonstration Title" span={2}>
                    <strong style={{ color: '#1a5f2c' }}>{selectedDemo.demo_title}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Demo Category">
                    <Tag color="purple">{selectedDemo.demo_category}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Technology Focus">
                    <Tag color="green">{selectedDemo.technology_focus}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Site Supervisor">
                    {selectedDemo.site_supervisor} ({selectedDemo.supervisor_phone})
                  </Descriptions.Item>
                </Descriptions>

                <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: 16, background: '#fafafa' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1a5f2c', textTransform: 'uppercase', marginBottom: 12 }}>
                    Visitor Disaggregation (ጎብኚዎች በወኪል ምድብ)
                  </div>
                  <Row gutter={[16, 16]}>
                    <Col span={8}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <ManOutlined style={{ color: '#1890ff', marginRight: 4 }} />
                          Male Visitors (ወንድ)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#1890ff', marginTop: 2 }}>
                          {Number(selectedDemo.male_visitors || 0).toLocaleString()}
                        </div>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <WomanOutlined style={{ color: '#722ed1', marginRight: 4 }} />
                          Female Visitors (ሴት)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#722ed1', marginTop: 2 }}>
                          {Number(selectedDemo.female_visitors || 0).toLocaleString()}
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
                          {Number(selectedDemo.married_women_visitors || 0).toLocaleString()}
                        </div>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <RiseOutlined style={{ color: '#fa8c16', marginRight: 4 }} />
                          Youth Visitors (ወጣቶች)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#fa8c16', marginTop: 2 }}>
                          {Number(selectedDemo.youth_visitors || 0).toLocaleString()}
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
                          {Number(selectedDemo.investors_visitors || 0).toLocaleString()}
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
                    Demo Notes & Yield Results
                  </span>
                }
                key="2"
              >
                <Card size="small" bordered={false} style={{ background: '#fcfdfd', border: '1px solid #e6f7ed', borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <CheckCircleOutlined style={{ color: '#1a5f2c', fontSize: 16 }} />
                    <strong style={{ color: '#1a5f2c', fontSize: 13, textTransform: 'uppercase' }}>
                      Demonstration Yield Results & Findings (የማሳ ማሳያ ውጤቶች)
                    </strong>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: '#262626', lineHeight: '1.6' }}>
                    {selectedDemo.demo_notes || 'Active demonstration plot showcasing agricultural technology results.'}
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
                    <strong>{extractName(selectedDemo.zone)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Woreda">
                    <strong>{extractName(selectedDemo.woreda)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Kebele Operational Base">
                    <span style={{ color: '#1a5f2c', fontWeight: 'bold' }}>
                      {extractName(selectedDemo.kebele)}
                    </span>
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
                  <Descriptions.Item label="Fiscal Year (በጀት ዓመት)">
                    <Tag color="blue" icon={<CalendarOutlined />}>
                      {selectedDemo.fiscal_year || '2019 E.C.'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Production Campaign Season">
                    <strong>{selectedDemo.season || 'Meher (መኸር)'}</strong>
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

export default function DemoOverview() {
  return (
    <App>
      <DemoOverviewContent />
    </App>
  );
}