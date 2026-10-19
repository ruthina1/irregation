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
  BookOutlined,
  ReadOutlined,
  WomanOutlined,
  ManOutlined,
  RiseOutlined,
  ShopOutlined,
  BankOutlined,
  CheckSquareOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { farmerApi } from '../../services/api/farmerApi';
import { locationApi } from '../../services/api/locationApi';

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

const MATERIAL_TYPES = [
  'Technical Production Manual (የምርት ማኑዋል)',
  'Extension Leaflet / Flyer (በራሪ ወረቀት)',
  'Agro-Ecological Poster (የግንዛቤ ፖስተር)',
  'Seasonal Farming Calendar (የወቅታዊ ስራዎች ቀን መቁጠሪያ)',
  'Farmer Training Booklet (የስልጠና ቡክሌት)'
];

const MATERIAL_TOPICS = [
  'Cereal Intensification & Row-Planting Guide',
  'Blended Fertilizer Application & Soil Health',
  'Fall Armyworm & Wheat Rust Management',
  'Small-Scale Irrigation & Water Harvesting',
  'Vermicompost & Organic Farming Practices',
  'Dairy, Forage & Animal Health Handbook',
  'Post-Harvest Storage & Hermetic Bag Manual',
  'Horticulture Grafting & Nursery Management'
];

const INITIAL_MATERIALS = [
  {
    id: '1',
    material_code: 'MAT-2019-EG-01',
    material_title: 'Meher Season Teff Row-Planting & Seeding Rate Leaflet',
    material_type: 'Extension Leaflet / Flyer (በራሪ ወረቀት)',
    topic: 'Cereal Intensification & Row-Planting Guide',
    distribution_date: '2026-08-08',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    print_quantity: 5000,
    male_recipients: 3100,
    female_recipients: 950,
    married_women_recipients: 820,
    youth_recipients: 1150,
    investors_recipients: 80,
    distribution_status: 'Fully Distributed',
    distribution_notes: 'Distributed across FTC resource centers and DA field packets prior to planting campaign.',
    zone: 'East Gojjam',
    woreda: 'Dejen',
    kebele: 'Kurar'
  },
  {
    id: '2',
    material_code: 'MAT-2019-SG-04',
    material_title: 'Wheat Rust Early Identification & Fungicide Manual',
    material_type: 'Technical Production Manual (የምርት ማኑዋል)',
    topic: 'Fall Armyworm & Wheat Rust Management',
    distribution_date: '2026-08-14',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    print_quantity: 2500,
    male_recipients: 1800,
    female_recipients: 600,
    married_women_recipients: 520,
    youth_recipients: 710,
    investors_recipients: 95,
    distribution_status: 'Fully Distributed',
    distribution_notes: 'Handed over to Woreda plant health clinics and FTC extension agents.',
    zone: 'South Gondar',
    woreda: 'Fogera',
    kebele: 'Woreta Zuria'
  },
  {
    id: '3',
    material_code: 'MAT-2019-WG-09',
    material_title: 'Vermicompost Pit Construction & Soil Health Poster',
    material_type: 'Agro-Ecological Poster (የግንዛቤ ፖስተር)',
    topic: 'Vermicompost & Organic Farming Practices',
    distribution_date: '2026-08-22',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    print_quantity: 1500,
    male_recipients: 950,
    female_recipients: 410,
    married_women_recipients: 360,
    youth_recipients: 420,
    investors_recipients: 30,
    distribution_status: 'In Progress',
    distribution_notes: 'Poster boards mounted on FTC training shelter walls across kebele clusters.',
    zone: 'West Gojjam',
    woreda: 'Bure',
    kebele: 'Alefa'
  }
];

function ExtensionMaterialsContent() {
  const { message } = App.useApp();

  const [materials, setMaterials] = useState(INITIAL_MATERIALS);
  const [isFetching, setIsFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState(null);
  const [fiscalYearFilter, setFiscalYearFilter] = useState(null);
  const [seasonFilter, setSeasonFilter] = useState(null);
  const [topicFilter, setTopicFilter] = useState(null);
  const [zoneFilter, setZoneFilter] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
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
      if (editingMaterial) {
        const initForm = async () => {
          const zoneMatch = zones.find(
            (z) => z.name === editingMaterial.zone || z.id === editingMaterial.zone_id
          );
          if (zoneMatch) {
            try {
              const wRes = locationApi?.getWoredas ? await locationApi.getWoredas(zoneMatch.id) : null;
              const wList = wRes?.data?.data?.data || wRes?.data?.data || [];
              setWoredas(wList);

              const woredaMatch = wList.find(
                (w) => w.name === editingMaterial.woreda || w.id === editingMaterial.woreda_id
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
            material_code: editingMaterial.material_code,
            material_title: editingMaterial.material_title,
            material_type: editingMaterial.material_type,
            topic: editingMaterial.topic,
            distribution_date: editingMaterial.distribution_date ? dayjs(editingMaterial.distribution_date) : dayjs(),
            fiscal_year: editingMaterial.fiscal_year || '2019 E.C.',
            season: editingMaterial.season || 'Meher (መኸር)',
            print_quantity: Number(editingMaterial.print_quantity) || 1000,
            male_recipients: Number(editingMaterial.male_recipients) || 0,
            female_recipients: Number(editingMaterial.female_recipients) || 0,
            married_women_recipients: Number(editingMaterial.married_women_recipients) || 0,
            youth_recipients: Number(editingMaterial.youth_recipients) || 0,
            investors_recipients: Number(editingMaterial.investors_recipients) || 0,
            distribution_notes: editingMaterial.distribution_notes,
            zone_id: editingMaterial.zone_id || zoneMatch?.id || editingMaterial.zone,
            woreda_id: editingMaterial.woreda_id || editingMaterial.woreda,
            kebele_id: editingMaterial.kebele_id || editingMaterial.kebele
          });
        };
        initForm();
      } else {
        form.resetFields();
        form.setFieldsValue({
          material_type: 'Extension Leaflet / Flyer (በራሪ ወረቀት)',
          topic: 'Cereal Intensification & Row-Planting Guide',
          distribution_date: dayjs(),
          fiscal_year: '2019 E.C.',
          season: 'Meher (መኸር)',
          print_quantity: 1000,
          male_recipients: 0,
          female_recipients: 0,
          married_women_recipients: 0,
          youth_recipients: 0,
          investors_recipients: 0
        });
        setWoredas([]);
        setKebeles([]);
      }
    }
  }, [isModalOpen, editingMaterial, form, zones]);

  const loadData = async () => {
    setIsFetching(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      message.success('Extension print media records refreshed');
    } catch {
      message.error('Failed to refresh data');
    } finally {
      setIsFetching(false);
    }
  };

  // Direct In-Place Status Update without Opening the Form
  const handleQuickStatusChange = (recordId, newStatus) => {
    setMaterials((prev) =>
      prev.map((m) => (m.id === recordId ? { ...m, distribution_status: newStatus } : m))
    );
    message.success(`Distribution status updated to "${newStatus}"`);
  };

  // Filter pipeline
  const filteredMaterials = useMemo(() => {
    return materials.filter((m) => {
      const code = extractName(m.material_code).toLowerCase();
      const title = extractName(m.material_title).toLowerCase();
      const top = extractName(m.topic).toLowerCase();
      const kebele = extractName(m.kebele).toLowerCase();
      const woreda = extractName(m.woreda).toLowerCase();
      const zone = extractName(m.zone).toLowerCase();
      const q = searchTerm.toLowerCase();

      const matchesSearch =
        code.includes(q) || title.includes(q) || top.includes(q) || kebele.includes(q) || woreda.includes(q) || zone.includes(q);
      const matchesType = typeFilter ? m.material_type === typeFilter : true;
      const matchesFY = fiscalYearFilter ? m.fiscal_year === fiscalYearFilter : true;
      const matchesSeason = seasonFilter ? m.season === seasonFilter : true;
      const matchesTopic = topicFilter ? m.topic === topicFilter : true;
      const matchesZone = zoneFilter ? zone === zoneFilter.toLowerCase() : true;

      return matchesSearch && matchesType && matchesFY && matchesSeason && matchesTopic && matchesZone;
    });
  }, [materials, searchTerm, typeFilter, fiscalYearFilter, seasonFilter, topicFilter, zoneFilter]);

  // Statistics Calculation
  const stats = useMemo(() => {
    const totalMaterials = filteredMaterials.length;
    const totalPrinted = filteredMaterials.reduce((acc, m) => acc + (Number(m.print_quantity) || 0), 0);
    const maleRecipients = filteredMaterials.reduce((acc, m) => acc + (Number(m.male_recipients) || 0), 0);
    const femaleRecipients = filteredMaterials.reduce((acc, m) => acc + (Number(m.female_recipients) || 0), 0);
    const marriedWomen = filteredMaterials.reduce((acc, m) => acc + (Number(m.married_women_recipients) || 0), 0);
    const youth = filteredMaterials.reduce((acc, m) => acc + (Number(m.youth_recipients) || 0), 0);
    const investors = filteredMaterials.reduce((acc, m) => acc + (Number(m.investors_recipients) || 0), 0);

    const totalRecipients = maleRecipients + femaleRecipients + marriedWomen + youth + investors;
    const totalWomenRecipients = femaleRecipients + marriedWomen;
    const womenRatio = totalRecipients > 0 ? ((totalWomenRecipients / totalRecipients) * 100).toFixed(1) : 0;

    return {
      totalMaterials,
      totalPrinted,
      totalRecipients,
      maleRecipients,
      femaleRecipients,
      marriedWomen,
      totalWomenRecipients,
      youth,
      investors,
      womenRatio
    };
  }, [filteredMaterials]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setTypeFilter(null);
    setFiscalYearFilter(null);
    setSeasonFilter(null);
    setTopicFilter(null);
    setZoneFilter(null);
  };

  const handleOpenModal = (record = null) => {
    setEditingMaterial(record);
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
        distribution_date: values.distribution_date ? values.distribution_date.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
        zone: selectedZone?.name || selectedZone?.zone_name || values.zone_id,
        woreda: selectedWoreda?.name || selectedWoreda?.woreda_name || values.woreda_id,
        kebele: selectedKebele?.name || selectedKebele?.kebele_name || values.kebele_id
      };

      if (editingMaterial) {
        setMaterials((prev) =>
          prev.map((item) =>
            item.id === editingMaterial.id ? { ...item, ...payload, distribution_status: editingMaterial.distribution_status } : item
          )
        );
        message.success('Extension print media record updated successfully');
      } else {
        const newRecord = {
          ...payload,
          id: Date.now().toString(),
          material_code: values.material_code || `MAT-${Date.now().toString().slice(-4)}`,
          distribution_status: 'In Progress'
        };
        setMaterials((prev) => [newRecord, ...prev]);
        message.success('New extension print material registered successfully');
      }
      setIsModalOpen(false);
    } catch (error) {
      message.error(error?.response?.data?.message || error.message || 'Failed to save print material record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    setMaterials((prev) => prev.filter((item) => item.id !== id));
    message.success('Extension material record removed');
  };

  const exportToCSV = () => {
    if (!filteredMaterials.length) {
      message.warning('No print material records available to export');
      return;
    }
    const headers = [
      'Material Code,Title,Material Type,Topic,Date,Print Qty,FY,Season,Zone,Woreda,Kebele,Male (አባወራ),Female (እማወራ),Married Women (ባለትዳር),Youth (ወጣቶች),Investors (ባለሃብቶች),Total Distributed,Status'
    ];
    const rows = filteredMaterials.map((m) => {
      const total =
        (Number(m.male_recipients) || 0) +
        (Number(m.female_recipients) || 0) +
        (Number(m.married_women_recipients) || 0) +
        (Number(m.youth_recipients) || 0) +
        (Number(m.investors_recipients) || 0);

      return [
        `"${m.material_code || ''}"`,
        `"${m.material_title || ''}"`,
        `"${m.material_type || ''}"`,
        `"${m.topic || ''}"`,
        `"${m.distribution_date || ''}"`,
        m.print_quantity || 1000,
        `"${m.fiscal_year || ''}"`,
        `"${m.season || ''}"`,
        `"${extractName(m.zone)}"`,
        `"${extractName(m.woreda)}"`,
        `"${extractName(m.kebele)}"`,
        m.male_recipients || 0,
        m.female_recipients || 0,
        m.married_women_recipients || 0,
        m.youth_recipients || 0,
        m.investors_recipients || 0,
        total,
        `"${m.distribution_status || ''}"`
      ].join(',');
    });

    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Indicator_Leaflets_Extension_Print_Media_${Date.now()}.csv`;
    a.click();
    message.success('Report Form 2019 exported successfully');
  };

  const columns = [
    {
      title: 'Material Code & Title',
      key: 'material_info',
      width: 250,
      render: (_, r) => (
        <div>
          <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{r.material_title}</strong>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>
            Code: <span style={{ fontFamily: 'monospace' }}>{r.material_code}</span> | Print: {Number(r.print_quantity || 0).toLocaleString()} Qty
          </div>
        </div>
      )
    },
    {
      title: 'Material Category',
      dataIndex: 'material_type',
      key: 'material_type',
      width: 210,
      render: (type) => {
        let color = 'default';
        if (type?.includes('Manual')) color = 'purple';
        if (type?.includes('Leaflet')) color = 'green';
        if (type?.includes('Poster')) color = 'gold';
        return <Tag color={color}>{type}</Tag>;
      }
    },
    {
      title: 'Technical Topic',
      dataIndex: 'topic',
      key: 'topic',
      width: 220,
      render: (top) => <span style={{ fontWeight: 500, color: '#262626' }}>{top}</span>
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
      title: 'Recipients Reached',
      key: 'recipients_breakdown',
      width: 230,
      render: (_, r) => {
        const total =
          (Number(r.male_recipients) || 0) +
          (Number(r.female_recipients) || 0) +
          (Number(r.married_women_recipients) || 0) +
          (Number(r.youth_recipients) || 0) +
          (Number(r.investors_recipients) || 0);

        return (
          <div style={{ fontSize: 11 }}>
            <div>
              Total: <strong style={{ color: '#1a5f2c' }}>{total.toLocaleString()} Recipients</strong>
            </div>
            <div style={{ color: '#8c8c8c' }}>
              <span>አባወራ: {r.male_recipients || 0}</span> | <span>እማወራ: {r.female_recipients || 0}</span> | <span>ባለትዳር: {r.married_women_recipients || 0}</span>
            </div>
          </div>
        );
      }
    },
    {
      title: 'Distribution Status (In-Place Edit)',
      dataIndex: 'distribution_status',
      key: 'distribution_status',
      width: 190,
      render: (status, record) => (
        <Select
          value={status || 'In Progress'}
          onChange={(newVal) => handleQuickStatusChange(record.id, newVal)}
          style={{ width: '100%' }}
          size="small"
        >
          <Option value="In Progress">
            <Tag color="processing" icon={<ClockCircleOutlined />} style={{ margin: 0 }}>
              In Progress
            </Tag>
          </Option>
          <Option value="Fully Distributed">
            <Tag color="success" icon={<CheckCircleOutlined />} style={{ margin: 0 }}>
              Distributed
            </Tag>
          </Option>
          <Option value="Stock Depleted">
            <Tag color="warning" icon={<ClockCircleOutlined />} style={{ margin: 0 }}>
              Depleted
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
          <Tooltip title="View Material Dossier">
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: '#1890ff' }} />}
              onClick={() => {
                setSelectedMaterial(record);
                setIsDossierOpen(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Edit Material">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: '#52c41a' }} />}
              onClick={() => handleOpenModal(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Record">
            <Popconfirm
              title="Delete print material record?"
              description="Are you sure you want to remove this extension publication?"
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
        <Breadcrumb.Item>Extension Communication & Digitalization</Breadcrumb.Item>
        <Breadcrumb.Item>Leaflets & Extension Print Media</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#1a5f2c', fontFamily: "'Times New Roman', Times, serif" }}>
            Leaflets & Extension Print Media (የኤክስቴንሽን ማኑዋሎች፣ በራሪ ወረቀቶችና የህትመት ውጤቶች)
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Tracking printing, translation, and distribution of technical leaflets, production manuals, and agro-ecological posters
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
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Total Publications Printed</span>}
              value={stats.totalPrinted}
              suffix="Copies"
              prefix={<BookOutlined style={{ color: '#1a5f2c', marginRight: 8 }} />}
              valueStyle={{ color: '#1a5f2c', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Catalog Titles: <strong style={{ color: '#262626' }}>{stats.totalMaterials} materials</strong>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #1890ff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Male Recipients (አባወራ)</span>}
              value={stats.maleRecipients}
              prefix={<ManOutlined style={{ color: '#1890ff', marginRight: 8 }} />}
              valueStyle={{ color: '#1890ff', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Household heads supplied with print media
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #722ed1', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Women Recipients (እማወራ + ባለትዳር)</span>}
              value={stats.totalWomenRecipients}
              prefix={<WomanOutlined style={{ color: '#722ed1', marginRight: 8 }} />}
              valueStyle={{ color: '#722ed1', fontWeight: 'bold', fontSize: 24 }}
            />
            <Progress percent={Number(stats.womenRatio)} size="small" strokeColor="#722ed1" />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8c8c8c', marginTop: 2 }}>
              <span>Share: <strong style={{ color: '#722ed1' }}>{stats.womenRatio}%</strong></span>
              <span>እማወራ: {stats.femaleRecipients} | ባለትዳር: {stats.marriedWomen}</span>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #fa8c16', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Youth & Investors Reached</span>}
              value={stats.youth + stats.investors}
              prefix={<RiseOutlined style={{ color: '#fa8c16', marginRight: 8 }} />}
              valueStyle={{ color: '#fa8c16', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Youth (ወጣቶች): <strong>{stats.youth}</strong> | Investors (ባለሃብቶች): <strong>{stats.investors}</strong>
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
                placeholder="Search Title, Code, or Topic..."
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: 220 }}
                allowClear
              />

              <Select
                placeholder="Material Category"
                value={typeFilter}
                onChange={setTypeFilter}
                style={{ width: 195 }}
                allowClear
              >
                {MATERIAL_TYPES.map((mt) => (
                  <Option key={mt} value={mt}>{mt}</Option>
                ))}
              </Select>

              <Select
                placeholder="Technical Topic"
                value={topicFilter}
                onChange={setTopicFilter}
                style={{ width: 200 }}
                allowClear
              >
                {MATERIAL_TOPICS.map((top) => (
                  <Option key={top} value={top}>{top}</Option>
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
                {[...new Set(materials.map((m) => extractName(m.zone)))].map((z) => (
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
                Export Form 2019
              </Button>

              <Button
                icon={<ClearOutlined />}
                onClick={handleResetFilters}
                disabled={!(searchTerm || typeFilter || fiscalYearFilter || seasonFilter || topicFilter || zoneFilter)}
              >
                Reset Filters
              </Button>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => handleOpenModal(null)}
                style={{ backgroundColor: '#1a5f2c', borderColor: '#1a5f2c', fontWeight: 600 }}
              >
                Register Print Material
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Main Table */}
      <Table
        columns={columns}
        dataSource={filteredMaterials}
        rowKey="id"
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} print publications`
        }}
        scroll={{ x: 1350 }}
        bordered
        size="middle"
      />

      {/* Registration / Edit Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileTextOutlined style={{ color: '#1a5f2c', fontSize: 20 }} />
            <span style={{ color: '#1a5f2c', fontWeight: 'bold', fontFamily: "'Times New Roman', Times, serif", fontSize: 17 }}>
              {editingMaterial ? 'Edit Extension Publication Record' : 'Register Leaflet & Print Media (የህትመት ውጤቶች ምዝገባ)'}
            </span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText={editingMaterial ? 'Update Publication' : 'Save Publication'}
        okButtonProps={{ style: { backgroundColor: '#1a5f2c', borderColor: '#1a5f2c' }, loading: isSubmitting }}
        width={800}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Publication Metadata & Category
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="material_code"
                label="Publication Code"
                rules={[{ required: true, message: 'Code required' }]}
              >
                <Input placeholder="e.g. MAT-2019-EG-08" />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item
                name="material_title"
                label="Publication Title / Manual Name"
                rules={[{ required: true, message: 'Title required' }]}
              >
                <Input placeholder="e.g. Meher Season Teff Row-Planting Leaflet" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="material_type"
                label="Material Category"
                rules={[{ required: true, message: 'Select category' }]}
              >
                <Select>
                  {MATERIAL_TYPES.map((mt) => (
                    <Option key={mt} value={mt}>{mt}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="topic"
                label="Technical Topic"
                rules={[{ required: true, message: 'Select topic' }]}
              >
                <Select>
                  {MATERIAL_TOPICS.map((top) => (
                    <Option key={top} value={top}>{top}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={14}>
              <Form.Item
                name="print_quantity"
                label="Total Print Copies Produced"
                rules={[{ required: true, message: 'Quantity required' }]}
              >
                <InputNumber min={1} max={100000} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item
                name="distribution_date"
                label="Distribution Date"
                rules={[{ required: true, message: 'Date required' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Timeline & Planning Period
          </Divider>
          <Row gutter={16}>
            <Col span={12}>
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
            <Col span={12}>
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
          </Row>

          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Recipients Reached by Cohort (የህትመት ውጤቶች ተጠቃሚዎች በጾታ)
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="male_recipients"
                label="Male Recipients (አባወራ)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="female_recipients"
                label="Female Recipients (እማወራ)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="married_women_recipients"
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
                name="youth_recipients"
                label="Youth Smallholders (ወጣቶች)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="investors_recipients"
                label="Commercial Investors (ባለሃብቶች)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="distribution_notes" label="Distribution & Utilization Logistics Notes">
                <TextArea rows={3} placeholder="Summarize distribution bottlenecks, FTC resource center stock levels, or feedback..." />
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

      {/* Comprehensive Publication Dossier Modal */}
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
                <BookOutlined />
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
                  {selectedMaterial?.material_title}
                </span>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                  Code: <span style={{ fontFamily: 'monospace' }}>{selectedMaterial?.material_code}</span> | Date:{' '}
                  {selectedMaterial?.distribution_date}
                </div>
              </div>
            </div>
            <div>
              <Tag
                color={selectedMaterial?.distribution_status === 'Fully Distributed' ? 'success' : 'processing'}
                icon={selectedMaterial?.distribution_status === 'Fully Distributed' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                style={{ fontSize: 12, padding: '2px 10px', borderRadius: 12 }}
              >
                {selectedMaterial?.distribution_status || 'In Progress'}
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
              handleOpenModal(selectedMaterial);
            }}
          >
            Edit Publication
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
        {selectedMaterial && (
          <div style={{ paddingTop: 8 }}>
            {/* Top Metric Strip */}
            <Row gutter={12} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f6ffed', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Total Recipients</span>}
                    value={
                      (Number(selectedMaterial.male_recipients) || 0) +
                      (Number(selectedMaterial.female_recipients) || 0) +
                      (Number(selectedMaterial.married_women_recipients) || 0) +
                      (Number(selectedMaterial.youth_recipients) || 0) +
                      (Number(selectedMaterial.investors_recipients) || 0)
                    }
                    suffix={<span style={{ fontSize: 12 }}>Readers</span>}
                    valueStyle={{ fontSize: 15, fontWeight: 'bold', color: '#1a5f2c' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f0f5ff', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Print Quantity</span>}
                    value={selectedMaterial.print_quantity || 1000}
                    suffix="Copies"
                    valueStyle={{ fontSize: 15, fontWeight: 'bold', color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f9f0ff', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Women Recipients Share</span>}
                    value={
                      (Number(selectedMaterial.male_recipients) || 0) +
                      (Number(selectedMaterial.female_recipients) || 0) +
                      (Number(selectedMaterial.married_women_recipients) || 0) +
                      (Number(selectedMaterial.youth_recipients) || 0) +
                      (Number(selectedMaterial.investors_recipients) || 0) > 0
                        ? (
                            (((Number(selectedMaterial.female_recipients) || 0) +
                              (Number(selectedMaterial.married_women_recipients) || 0)) /
                              ((Number(selectedMaterial.male_recipients) || 0) +
                                (Number(selectedMaterial.female_recipients) || 0) +
                                (Number(selectedMaterial.married_women_recipients) || 0) +
                                (Number(selectedMaterial.youth_recipients) || 0) +
                                (Number(selectedMaterial.investors_recipients) || 0))) *
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
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Distribution Date</span>}
                    value={selectedMaterial.distribution_date}
                    valueStyle={{ fontSize: 14, fontWeight: 'bold', color: '#fa8c16' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* TABPANES */}
            <Tabs defaultActiveKey="1" type="card">
              {/* TAB 1: Recipient Demographics */}
              <TabPane
                tab={
                  <span>
                    <TeamOutlined />
                    Recipient Demographics & Reach
                  </span>
                }
                key="1"
              >
                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }} style={{ marginBottom: 16 }}>
                  <Descriptions.Item label="Technical Topic" span={2}>
                    <strong style={{ color: '#1a5f2c' }}>{selectedMaterial.topic}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Material Category">
                    <Tag color="purple">{selectedMaterial.material_type}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Print Copies">
                    {Number(selectedMaterial.print_quantity || 1000).toLocaleString()} Copies
                  </Descriptions.Item>
                </Descriptions>

                <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: 16, background: '#fafafa' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1a5f2c', textTransform: 'uppercase', marginBottom: 12 }}>
                    Recipient Disaggregation (ተጠቃሚዎች በጾታና በዕድሜ)
                  </div>
                  <Row gutter={[16, 16]}>
                    <Col span={8}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <ManOutlined style={{ color: '#1890ff', marginRight: 4 }} />
                          Male Household Heads (አባወራ)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#1890ff', marginTop: 2 }}>
                          {Number(selectedMaterial.male_recipients || 0).toLocaleString()}
                        </div>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <WomanOutlined style={{ color: '#722ed1', marginRight: 4 }} />
                          Female Household Heads (እማወራ)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#722ed1', marginTop: 2 }}>
                          {Number(selectedMaterial.female_recipients || 0).toLocaleString()}
                        </div>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <WomanOutlined style={{ color: '#eb2f96', marginRight: 4 }} />
                          Married Women (ባለትዳር ሴቶች)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#eb2f96', marginTop: 2 }}>
                          {Number(selectedMaterial.married_women_recipients || 0).toLocaleString()}
                        </div>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <RiseOutlined style={{ color: '#fa8c16', marginRight: 4 }} />
                          Youth Smallholders (ወጣቶች)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#fa8c16', marginTop: 2 }}>
                          {Number(selectedMaterial.youth_recipients || 0).toLocaleString()}
                        </div>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <ShopOutlined style={{ color: '#13c2c2', marginRight: 4 }} />
                          Commercial Investors (ባለሃብቶች)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#13c2c2', marginTop: 2 }}>
                          {Number(selectedMaterial.investors_recipients || 0).toLocaleString()}
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
              </TabPane>

              {/* TAB 2: Logistics & Notes */}
              <TabPane
                tab={
                  <span>
                    <ReadOutlined />
                    Logistics & Utilization Notes
                  </span>
                }
                key="2"
              >
                <Card size="small" bordered={false} style={{ background: '#fcfdfd', border: '1px solid #e6f7ed', borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <CheckCircleOutlined style={{ color: '#1a5f2c', fontSize: 16 }} />
                    <strong style={{ color: '#1a5f2c', fontSize: 13, textTransform: 'uppercase' }}>
                      Distribution & Utilization Report (የስርጭት ማስታወሻ)
                    </strong>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: '#262626', lineHeight: '1.6' }}>
                    {selectedMaterial.distribution_notes || 'Publications delivered successfully to targeted farmers and FTC resource shelves.'}
                  </p>
                </Card>
              </TabPane>

              {/* TAB 3: Location & Campaign */}
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
                    <strong>{extractName(selectedMaterial.zone)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Woreda">
                    <strong>{extractName(selectedMaterial.woreda)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Kebele Operational Base">
                    <span style={{ color: '#1a5f2c', fontWeight: 'bold' }}>
                      {extractName(selectedMaterial.kebele)}
                    </span>
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
                  <Descriptions.Item label="Fiscal Year (በጀት ዓመት)">
                    <Tag color="blue" icon={<CalendarOutlined />}>
                      {selectedMaterial.fiscal_year || '2019 E.C.'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Production Campaign Season">
                    <strong>{selectedMaterial.season || 'Meher (መኸር)'}</strong>
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



export default function ExtensionMaterials() {
  return (
    <App>
      <ExtensionMaterialsContent />
    </App>
  );
}