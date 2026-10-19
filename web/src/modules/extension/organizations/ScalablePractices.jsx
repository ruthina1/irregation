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
  BulbOutlined,
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

const PRACTICE_CATEGORIES = [
  'Climate-Smart Agronomy & Drought Tolerance (አየር ንብረት ተከላካይ አሰራር)',
  'Precision Water Harvesting & Solar Pump (ትክክለኛ የውሃ ማሰባሰብ)',
  'Organic Soil Restoration & Vermicompost (ኦርጋኒክ አፈር ማደሻ)',
  'Pest Bio-Control & Botanical Spray (ተባይ መቆጣጠሪያ ባዮ-ዘዴ)',
  'Mechanized Post-Harvest & Hermetic Storage (ሜካናይዝድ ምርት ማከማቻ)'
];

const INNOVATION_TYPES = [
  'Farmer-Led Innovation (በአርሶ አደር የተፈጠረ ፈጠራ)',
  'Research-Validated Package (በምርምር ተቋም የጸደቀ)',
  'Extension-Adapted Practice (በኤክስቴንሽን የተሻሻለ አሰራር)',
  'Partner-Supported Technology (በልማት አጋር የቀረበ ቴክኖሎጂ)'
];

const INITIAL_PRACTICES = [
  {
    id: '1',
    practice_code: 'SCP-2019-EG-01',
    practice_name: 'Narrow-Row Teff Planting with Integrated Urea Deep Placement',
    practice_category: 'Climate-Smart Agronomy & Drought Tolerance (አየር ንብረት ተከላካይ አሰራር)',
    innovation_type: 'Research-Validated Package (በምርምር ተቋም የጸደቀ)',
    innovator_name: 'Ato Mulugeta Fentaw (Model Farmer)',
    innovator_phone: '+251 918 445 566',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    male_adopters: 140,
    female_adopters: 55,
    married_women_adopters: 42,
    youth_adopters: 30,
    investors_adopters: 4,
    scaling_status: 'Regional Scaling',
    practice_notes: 'Demonstrated 45% fertilizer saving and 32% yield increase across highland vertisols.',
    zone: 'East Gojjam',
    woreda: 'Dejen',
    kebele: 'Kurar'
  },
  {
    id: '2',
    practice_code: 'SCP-2019-SG-04',
    practice_name: 'Solar-Powered Drip Irrigation for Smallholder Onion Nurseries',
    practice_category: 'Precision Water Harvesting & Solar Pump (ትክክለኛ የውሃ ማሰባሰብ)',
    innovation_type: 'Partner-Supported Technology (በልማት አጋር የቀረበ ቴክኖሎጂ)',
    innovator_name: 'Woizero Aster Melesse',
    manager_phone: '+251 922 112 334',
    fiscal_year: '2019 E.C.',
    season: 'Bega / Irrigation (መስኖ/በጋ)',
    male_adopters: 95,
    female_adopters: 60,
    married_women_adopters: 50,
    youth_adopters: 35,
    investors_adopters: 6,
    scaling_status: 'Regional Scaling',
    practice_notes: 'Eliminated diesel fuel dependency and boosted dry-season vegetable survival rates by 85%.',
    zone: 'South Gondar',
    woreda: 'Fogera',
    kebele: 'Woreta Zuria'
  },
  {
    id: '3',
    practice_code: 'SCP-2019-WG-09',
    practice_name: 'Hermetic Purdue Improved Cowpea Storage (PICS) Bags',
    practice_category: 'Mechanized Post-Harvest & Hermetic Storage (ሜካናይዝድ ምርት ማከማቻ)',
    innovation_type: 'Extension-Adapted Practice (በኤክስቴንሽን የተሻሻለ አሰራር)',
    innovator_name: 'Ato Tadesse Worku',
    manager_phone: '+251 911 889 001',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    male_adopters: 110,
    female_adopters: 40,
    married_women_adopters: 32,
    youth_adopters: 25,
    investors_adopters: 3,
    scaling_status: 'Kebele Piloted',
    practice_notes: 'Completely prevented post-harvest bruchid insect damage without chemical fumigation.',
    zone: 'West Gojjam',
    woreda: 'Bure',
    kebele: 'Alefa'
  }
];

function ScalablePracticesContent() {
  const { message } = App.useApp();

  const [practices, setPractices] = useState(INITIAL_PRACTICES);
  const [isFetching, setIsFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [typeFilter, setTypeFilter] = useState(null);
  const [fiscalYearFilter, setFiscalYearFilter] = useState(null);
  const [seasonFilter, setSeasonFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [zoneFilter, setZoneFilter] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPractice, setEditingPractice] = useState(null);
  const [selectedPractice, setSelectedPractice] = useState(null);
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
      if (editingPractice) {
        const initForm = async () => {
          const zoneMatch = zones.find(
            (z) => z.name === editingPractice.zone || z.id === editingPractice.zone_id
          );
          if (zoneMatch) {
            try {
              const wRes = locationApi?.getWoredas ? await locationApi.getWoredas(zoneMatch.id) : null;
              const wList = wRes?.data?.data?.data || wRes?.data?.data || [];
              setWoredas(wList);

              const woredaMatch = wList.find(
                (w) => w.name === editingPractice.woreda || w.id === editingPractice.woreda_id
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
            practice_code: editingPractice.practice_code,
            practice_name: editingPractice.practice_name,
            practice_category: editingPractice.practice_category,
            innovation_type: editingPractice.innovation_type,
            innovator_name: editingPractice.innovator_name,
            innovator_phone: editingPractice.innovator_phone,
            fiscal_year: editingPractice.fiscal_year || '2019 E.C.',
            season: editingPractice.season || 'Meher (መኸር)',
            male_adopters: Number(editingPractice.male_adopters) || 0,
            female_adopters: Number(editingPractice.female_adopters) || 0,
            married_women_adopters: Number(editingPractice.married_women_adopters) || 0,
            youth_adopters: Number(editingPractice.youth_adopters) || 0,
            investors_adopters: Number(editingPractice.investors_adopters) || 0,
            practice_notes: editingPractice.practice_notes,
            zone_id: editingPractice.zone_id || zoneMatch?.id || editingPractice.zone,
            woreda_id: editingPractice.woreda_id || editingPractice.woreda,
            kebele_id: editingPractice.kebele_id || editingPractice.kebele
          });
        };
        initForm();
      } else {
        form.resetFields();
        form.setFieldsValue({
          practice_category: 'Climate-Smart Agronomy & Drought Tolerance (አየር ንብረት ተከላካይ አሰራር)',
          innovation_type: 'Research-Validated Package (በምርምር ተቋም የጸደቀ)',
          fiscal_year: '2019 E.C.',
          season: 'Meher (መኸር)',
          male_adopters: 50,
          female_adopters: 20,
          married_women_adopters: 15,
          youth_adopters: 10,
          investors_adopters: 2
        });
        setWoredas([]);
        setKebeles([]);
      }
    }
  }, [isModalOpen, editingPractice, form, zones]);

  const loadData = async () => {
    setIsFetching(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      message.success('Scalable practices registry refreshed');
    } catch {
      message.error('Failed to refresh data');
    } finally {
      setIsFetching(false);
    }
  };

  // Direct In-Place Status Update without Opening the Form
  const handleQuickStatusChange = (recordId, newStatus) => {
    setPractices((prev) =>
      prev.map((p) => (p.id === recordId ? { ...p, scaling_status: newStatus } : p))
    );
    message.success(`Scaling status updated to "${newStatus}"`);
  };

  // Filter pipeline
  const filteredPractices = useMemo(() => {
    return practices.filter((p) => {
      const code = extractName(p.practice_code).toLowerCase();
      const name = extractName(p.practice_name).toLowerCase();
      const innovator = extractName(p.innovator_name).toLowerCase();
      const kebele = extractName(p.kebele).toLowerCase();
      const woreda = extractName(p.woreda).toLowerCase();
      const zone = extractName(p.zone).toLowerCase();
      const q = searchTerm.toLowerCase();

      const matchesSearch =
        code.includes(q) || name.includes(q) || innovator.includes(q) || kebele.includes(q) || woreda.includes(q) || zone.includes(q);
      const matchesCategory = categoryFilter ? p.practice_category === categoryFilter : true;
      const matchesType = typeFilter ? p.innovation_type === typeFilter : true;
      const matchesFY = fiscalYearFilter ? p.fiscal_year === fiscalYearFilter : true;
      const matchesSeason = seasonFilter ? p.season === seasonFilter : true;
      const matchesStatus = statusFilter ? p.scaling_status === statusFilter : true;
      const matchesZone = zoneFilter ? zone === zoneFilter.toLowerCase() : true;

      return matchesSearch && matchesCategory && matchesType && matchesFY && matchesSeason && matchesStatus && matchesZone;
    });
  }, [practices, searchTerm, categoryFilter, typeFilter, fiscalYearFilter, seasonFilter, statusFilter, zoneFilter]);

  // Statistics Calculation
  const stats = useMemo(() => {
    const totalPractices = filteredPractices.length;
    const maleAdopters = filteredPractices.reduce((acc, p) => acc + (Number(p.male_adopters) || 0), 0);
    const femaleAdopters = filteredPractices.reduce((acc, p) => acc + (Number(p.female_adopters) || 0), 0);
    const marriedWomen = filteredPractices.reduce((acc, p) => acc + (Number(p.married_women_adopters) || 0), 0);
    const youth = filteredPractices.reduce((acc, p) => acc + (Number(p.youth_adopters) || 0), 0);
    const investors = filteredPractices.reduce((acc, p) => acc + (Number(p.investors_adopters) || 0), 0);

    const totalAdopters = maleAdopters + femaleAdopters + marriedWomen + youth + investors;
    const totalWomenAdopters = femaleAdopters + marriedWomen;
    const womenRatio = totalAdopters > 0 ? ((totalWomenAdopters / totalAdopters) * 100).toFixed(1) : 0;
    const scalingCount = filteredPractices.filter((p) => p.scaling_status === 'Regional Scaling').length;

    return {
      totalPractices,
      totalAdopters,
      maleAdopters,
      femaleAdopters,
      marriedWomen,
      totalWomenAdopters,
      youth,
      investors,
      womenRatio,
      scalingCount
    };
  }, [filteredPractices]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setCategoryFilter(null);
    setTypeFilter(null);
    setFiscalYearFilter(null);
    setSeasonFilter(null);
    setStatusFilter(null);
    setZoneFilter(null);
  };

  const handleOpenModal = (record = null) => {
    setEditingPractice(record);
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

      if (editingPractice) {
        setPractices((prev) =>
          prev.map((item) =>
            item.id === editingPractice.id ? { ...item, ...payload, scaling_status: editingPractice.scaling_status } : item
          )
        );
        message.success('Scalable practice record updated successfully');
      } else {
        const newRecord = {
          ...payload,
          id: Date.now().toString(),
          practice_code: values.practice_code || `SCP-${Date.now().toString().slice(-4)}`,
          scaling_status: 'Kebele Piloted'
        };
        setPractices((prev) => [newRecord, ...prev]);
        message.success('New scalable best practice registered successfully');
      }
      setIsModalOpen(false);
    } catch (error) {
      message.error(error?.response?.data?.message || error.message || 'Failed to save scalable practice record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    setPractices((prev) => prev.filter((item) => item.id !== id));
    message.success('Scalable practice record removed');
  };

  const exportToCSV = () => {
    if (!filteredPractices.length) {
      message.warning('No practice records available to export');
      return;
    }
    const headers = [
      'Practice Code,Practice Name,Category,Innovation Type,Innovator,Phone,FY,Season,Zone,Woreda,Kebele,Male (ወንድ),Female (ሴት),Married Women (ባለትዳር),Youth (ወጣቶች),Investors (ባለሃብቶች),Total Adopters,Status'
    ];
    const rows = filteredPractices.map((p) => {
      const total =
        (Number(p.male_adopters) || 0) +
        (Number(p.female_adopters) || 0) +
        (Number(p.married_women_adopters) || 0) +
        (Number(p.youth_adopters) || 0) +
        (Number(p.investors_adopters) || 0);

      return [
        `"${p.practice_code || ''}"`,
        `"${p.practice_name || ''}"`,
        `"${p.practice_category || ''}"`,
        `"${p.innovation_type || ''}"`,
        `"${p.innovator_name || ''}"`,
        `"${p.innovator_phone || ''}"`,
        `"${p.fiscal_year || ''}"`,
        `"${p.season || ''}"`,
        `"${extractName(p.zone)}"`,
        `"${extractName(p.woreda)}"`,
        `"${extractName(p.kebele)}"`,
        p.male_adopters || 0,
        p.female_adopters || 0,
        p.married_women_adopters || 0,
        p.youth_adopters || 0,
        p.investors_adopters || 0,
        total,
        `"${p.scaling_status || ''}"`
      ].join(',');
    });

    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Scalable_Best_Practices_Report_${Date.now()}.csv`;
    a.click();
    message.success('Scalable practices report exported successfully');
  };

  const columns = [
    {
      title: 'Practice Code & Name',
      key: 'practice_info',
      width: 250,
      render: (_, r) => (
        <div>
          <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{r.practice_name}</strong>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>
            Code: <span style={{ fontFamily: 'monospace' }}>{r.practice_code}</span> | Innovator: {r.innovator_name}
          </div>
        </div>
      )
    },
    {
      title: 'Practice Category',
      dataIndex: 'practice_category',
      key: 'practice_category',
      width: 210,
      render: (cat) => {
        let color = 'default';
        if (cat?.includes('Climate')) color = 'blue';
        if (cat?.includes('Precision')) color = 'green';
        if (cat?.includes('Organic')) color = 'gold';
        if (cat?.includes('Mechanized')) color = 'purple';
        return <Tag color={color}>{cat}</Tag>;
      }
    },
    {
      title: 'Innovation Type',
      dataIndex: 'innovation_type',
      key: 'innovation_type',
      width: 210,
      render: (type) => <span style={{ fontWeight: 500, color: '#262626' }}>{type}</span>
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
      title: 'Adopters Enrolled',
      key: 'adopters_breakdown',
      width: 230,
      render: (_, r) => {
        const total =
          (Number(r.male_adopters) || 0) +
          (Number(r.female_adopters) || 0) +
          (Number(r.married_women_adopters) || 0) +
          (Number(r.youth_adopters) || 0) +
          (Number(r.investors_adopters) || 0);

        return (
          <div style={{ fontSize: 11 }}>
            <div>
              Total: <strong style={{ color: '#1a5f2c' }}>{total.toLocaleString()} Adopters</strong>
            </div>
            <div style={{ color: '#8c8c8c' }}>
              <span>ወንድ: {r.male_adopters || 0}</span> | <span>ሴት: {r.female_adopters || 0}</span> | <span>ባለትዳር: {r.married_women_adopters || 0}</span>
            </div>
          </div>
        );
      }
    },
    {
      title: 'Scaling Status (In-Place Edit)',
      dataIndex: 'scaling_status',
      key: 'scaling_status',
      width: 190,
      render: (status, record) => (
        <Select
          value={status || 'Regional Scaling'}
          onChange={(newVal) => handleQuickStatusChange(record.id, newVal)}
          style={{ width: '100%' }}
          size="small"
        >
          <Option value="Regional Scaling">
            <Tag color="success" icon={<CheckCircleOutlined />} style={{ margin: 0 }}>
              Scaling
            </Tag>
          </Option>
          <Option value="Kebele Piloted">
            <Tag color="processing" icon={<ClockCircleOutlined />} style={{ margin: 0 }}>
              Piloted
            </Tag>
          </Option>
          <Option value="Nationally Institutionalized">
            <Tag color="purple" icon={<CheckCircleOutlined />} style={{ margin: 0 }}>
              Institutionalized
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
          <Tooltip title="View Practice Dossier">
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: '#1890ff' }} />}
              onClick={() => {
                setSelectedPractice(record);
                setIsDossierOpen(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Edit Practice">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: '#52c41a' }} />}
              onClick={() => handleOpenModal(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Record">
            <Popconfirm
              title="Delete scalable practice record?"
              description="Are you sure you want to remove this scalable best practice?"
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
        <Breadcrumb.Item>Organizations</Breadcrumb.Item>
        <Breadcrumb.Item>Scalable Best Practices Identification</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#1a5f2c', fontFamily: "'Times New Roman', Times, serif" }}>
            Scalable Best Practices Identification (የተሻሉ የግብርና ልምዶችና አሰራሮች ማፈላለግ)
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Identifying proven agricultural technologies, indigenous innovations, and successful productivity packages targeted for regional scaling
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
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Total Adopters Enrolled</span>}
              value={stats.totalAdopters}
              prefix={<BulbOutlined style={{ color: '#1a5f2c', marginRight: 8 }} />}
              valueStyle={{ color: '#1a5f2c', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Total Practices: <strong style={{ color: '#262626' }}>{stats.totalPractices} practices</strong>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #1890ff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Male Adopters (ወንድ)</span>}
              value={stats.maleAdopters}
              prefix={<ManOutlined style={{ color: '#1890ff', marginRight: 8 }} />}
              valueStyle={{ color: '#1890ff', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Male farmers adopting scalable packages
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #722ed1', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Women Adopters (ሴት + ባለትዳር)</span>}
              value={stats.totalWomenAdopters}
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
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Regional Scaling</span>}
              value={stats.scalingCount}
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
                placeholder="Search Name, Code, or Innovator..."
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: 220 }}
                allowClear
              />

              <Select
                placeholder="Practice Category"
                value={categoryFilter}
                onChange={setCategoryFilter}
                style={{ width: 195 }}
                allowClear
              >
                {PRACTICE_CATEGORIES.map((pc) => (
                  <Option key={pc} value={pc}>{pc}</Option>
                ))}
              </Select>

              <Select
                placeholder="Innovation Type"
                value={typeFilter}
                onChange={setTypeFilter}
                style={{ width: 200 }}
                allowClear
              >
                {INNOVATION_TYPES.map((it) => (
                  <Option key={it} value={it}>{it}</Option>
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
                {[...new Set(practices.map((p) => extractName(p.zone)))].map((z) => (
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
                Export Practices CSV
              </Button>

              <Button
                icon={<ClearOutlined />}
                onClick={handleResetFilters}
                disabled={!(searchTerm || categoryFilter || typeFilter || fiscalYearFilter || seasonFilter || statusFilter || zoneFilter)}
              >
                Reset Filters
              </Button>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => handleOpenModal(null)}
                style={{ backgroundColor: '#1a5f2c', borderColor: '#1a5f2c', fontWeight: 600 }}
              >
                Register Practice
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Main Table */}
      <Table
        columns={columns}
        dataSource={filteredPractices}
        rowKey="id"
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} scalable best practices`
        }}
        scroll={{ x: 1350 }}
        bordered
        size="middle"
      />

      {/* Registration / Edit Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BulbOutlined style={{ color: '#1a5f2c', fontSize: 20 }} />
            <span style={{ color: '#1a5f2c', fontWeight: 'bold', fontFamily: "'Times New Roman', Times, serif", fontSize: 17 }}>
              {editingPractice ? 'Edit Scalable Practice Record' : 'Register Scalable Best Practice (የተሻለ ልምድ ምዝገባ)'}
            </span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText={editingPractice ? 'Update Practice' : 'Save Practice Record'}
        okButtonProps={{ style: { backgroundColor: '#1a5f2c', borderColor: '#1a5f2c' }, loading: isSubmitting }}
        width={800}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Practice Identification & Category
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="practice_code"
                label="Practice Code"
                rules={[{ required: true, message: 'Code required' }]}
              >
                <Input placeholder="e.g. SCP-2019-EG-08" />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item
                name="practice_name"
                label="Scalable Practice Title / Technology"
                rules={[{ required: true, message: 'Practice name required' }]}
              >
                <Input placeholder="e.g. Narrow-Row Teff Planting with Urea Deep Placement" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="practice_category"
                label="Practice Category"
                rules={[{ required: true, message: 'Select category' }]}
              >
                <Select>
                  {PRACTICE_CATEGORIES.map((pc) => (
                    <Option key={pc} value={pc}>{pc}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="innovation_type"
                label="Innovation Source Type"
                rules={[{ required: true, message: 'Select type' }]}
              >
                <Select>
                  {INNOVATION_TYPES.map((it) => (
                    <Option key={it} value={it}>{it}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={14}>
              <Form.Item
                name="innovator_name"
                label="Lead Innovator / Model Farmer / Author"
                rules={[{ required: true, message: 'Innovator required' }]}
              >
                <Input placeholder="e.g. Ato Mulugeta Fentaw" />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item
                name="innovator_phone"
                label="Innovator Phone Number"
                rules={[{ required: true, message: 'Phone required' }]}
              >
                <Input placeholder="+251 9..." />
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
            Adopters Enrolled by Cohort (ተጠቃሚዎች በወኪል ምድብ)
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="male_adopters"
                label="Male Adopters (ወንድ)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="female_adopters"
                label="Female Adopters (ሴት)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="married_women_adopters"
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
                name="youth_adopters"
                label="Youth Adopters (ወጣቶች)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="investors_adopters"
                label="Private Investors (ባለሃብቶች)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="practice_notes" label="Practice Validation Notes & Scaling Impact">
                <TextArea rows={3} placeholder="Summarize productivity gains, cost efficiency, or regional adaptation potential..." />
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

      {/* Comprehensive Practice Dossier Modal */}
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
                <BulbOutlined />
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
                  {selectedPractice?.practice_name}
                </span>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                  Code: <span style={{ fontFamily: 'monospace' }}>{selectedPractice?.practice_code}</span> | Innovator:{' '}
                  {selectedPractice?.innovator_name}
                </div>
              </div>
            </div>
            <div>
              <Tag
                color={selectedPractice?.scaling_status === 'Regional Scaling' ? 'success' : 'processing'}
                icon={selectedPractice?.scaling_status === 'Regional Scaling' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                style={{ fontSize: 12, padding: '2px 10px', borderRadius: 12 }}
              >
                {selectedPractice?.scaling_status || 'Scaling'}
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
              handleOpenModal(selectedPractice);
            }}
          >
            Edit Practice
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
        {selectedPractice && (
          <div style={{ paddingTop: 8 }}>
            {/* Top Metric Strip */}
            <Row gutter={12} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f6ffed', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Total Adopters</span>}
                    value={
                      (Number(selectedPractice.male_adopters) || 0) +
                      (Number(selectedPractice.female_adopters) || 0) +
                      (Number(selectedPractice.married_women_adopters) || 0) +
                      (Number(selectedPractice.youth_adopters) || 0) +
                      (Number(selectedPractice.investors_adopters) || 0)
                    }
                    suffix={<span style={{ fontSize: 12 }}>People</span>}
                    valueStyle={{ fontSize: 15, fontWeight: 'bold', color: '#1a5f2c' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f0f5ff', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Practice Category</span>}
                    value={selectedPractice.practice_category?.split(' ')[0] || 'Category'}
                    valueStyle={{ fontSize: 15, fontWeight: 'bold', color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f9f0ff', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Women Share</span>}
                    value={
                      (Number(selectedPractice.male_adopters) || 0) +
                      (Number(selectedPractice.female_adopters) || 0) +
                      (Number(selectedPractice.married_women_adopters) || 0) +
                      (Number(selectedPractice.youth_adopters) || 0) +
                      (Number(selectedPractice.investors_adopters) || 0) > 0
                        ? (
                            (((Number(selectedPractice.female_adopters) || 0) +
                              (Number(selectedPractice.married_women_adopters) || 0)) /
                              ((Number(selectedPractice.male_adopters) || 0) +
                                (Number(selectedPractice.female_adopters) || 0) +
                                (Number(selectedPractice.married_women_adopters) || 0) +
                                (Number(selectedPractice.youth_adopters) || 0) +
                                (Number(selectedPractice.investors_adopters) || 0))) *
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
                    value={selectedPractice.fiscal_year}
                    valueStyle={{ fontSize: 13, fontWeight: 'bold', color: '#fa8c16' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* TABPANES */}
            <Tabs defaultActiveKey="1" type="card">
              {/* TAB 1: Practice Profile */}
              <TabPane
                tab={
                  <span>
                    <TeamOutlined />
                    Adopter Demographics & Reach
                  </span>
                }
                key="1"
              >
                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }} style={{ marginBottom: 16 }}>
                  <Descriptions.Item label="Practice Name" span={2}>
                    <strong style={{ color: '#1a5f2c' }}>{selectedPractice.practice_name}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Practice Category">
                    <Tag color="purple">{selectedPractice.practice_category}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Innovation Type">
                    <Tag color="green">{selectedPractice.innovation_type}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Lead Innovator">
                    {selectedPractice.innovator_name} ({selectedPractice.innovator_phone})
                  </Descriptions.Item>
                </Descriptions>

                <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: 16, background: '#fafafa' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1a5f2c', textTransform: 'uppercase', marginBottom: 12 }}>
                    Adopter Disaggregation (ተጠቃሚዎች በወኪል ምድብ)
                  </div>
                  <Row gutter={[16, 16]}>
                    <Col span={8}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <ManOutlined style={{ color: '#1890ff', marginRight: 4 }} />
                          Male Adopters (ወንድ)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#1890ff', marginTop: 2 }}>
                          {Number(selectedPractice.male_adopters || 0).toLocaleString()}
                        </div>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <WomanOutlined style={{ color: '#722ed1', marginRight: 4 }} />
                          Female Adopters (ሴት)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#722ed1', marginTop: 2 }}>
                          {Number(selectedPractice.female_adopters || 0).toLocaleString()}
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
                          {Number(selectedPractice.married_women_adopters || 0).toLocaleString()}
                        </div>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <RiseOutlined style={{ color: '#fa8c16', marginRight: 4 }} />
                          Youth Adopters (ወጣቶች)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#fa8c16', marginTop: 2 }}>
                          {Number(selectedPractice.youth_adopters || 0).toLocaleString()}
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
                          {Number(selectedPractice.investors_adopters || 0).toLocaleString()}
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
                    Validation Notes & Impact
                  </span>
                }
                key="2"
              >
                <Card size="small" bordered={false} style={{ background: '#fcfdfd', border: '1px solid #e6f7ed', borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <CheckCircleOutlined style={{ color: '#1a5f2c', fontSize: 16 }} />
                    <strong style={{ color: '#1a5f2c', fontSize: 13, textTransform: 'uppercase' }}>
                      Practice Validation & Impact (የተሻለ ልምድ ማስታወሻ)
                    </strong>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: '#262626', lineHeight: '1.6' }}>
                    {selectedPractice.practice_notes || 'Proven scalable best practice validated for regional agricultural dissemination.'}
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
                    <strong>{extractName(selectedPractice.zone)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Woreda">
                    <strong>{extractName(selectedPractice.woreda)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Kebele Operational Base">
                    <span style={{ color: '#1a5f2c', fontWeight: 'bold' }}>
                      {extractName(selectedPractice.kebele)}
                    </span>
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
                  <Descriptions.Item label="Fiscal Year (በጀት ዓመት)">
                    <Tag color="blue" icon={<CalendarOutlined />}>
                      {selectedPractice.fiscal_year || '2019 E.C.'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Production Campaign Season">
                    <strong>{selectedPractice.season || 'Meher (መኸር)'}</strong>
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

export default function ScalablePractices() {
  return (
    <App>
      <ScalablePracticesContent />
    </App>
  );
}