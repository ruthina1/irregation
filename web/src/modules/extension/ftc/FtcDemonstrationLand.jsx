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
  CompassOutlined
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

const LAND_CATEGORIES = [
  'Certified Green Book Holding (በአረንጓዴ መጽሐፍ የተረጋገጠ ይዞታ)',
  'Cadastral Surveyed Plot (በካዳስተር የተመዘገበ ማሳ)',
  'Communal Allocation (የህብረተሰብ የጋራ ድልድል)',
  'Leasehold / Contractual Tract (በኪራይ/ውል የተያዘ ማሳ)',
  'Unregistered Tract (ያልተመዘገበ መሬት)'
];

const LAND_OPERATIONS = [
  'Soil Fertility Mapping & Laboratory Testing',
  'Seasonal Crop Rotation & Fallowing Plan',
  'Multi-Varietal Trial Allocation & Sowing',
  'Irrigation Canal Connection & Drip Setup',
  'Perimeter Fencing & Soil Bund Protection'
];

const INITIAL_LAND_HOLDINGS = [
  {
    id: '1',
    land_code: 'DLH-2019-EG-01',
    land_title: 'Kurar FTC Main Demonstration Farm Tract',
    land_category: 'Certified Green Book Holding (በአረንጓዴ መጽሐፍ የተረጋገጠ ይዞታ)',
    core_operation: 'Multi-Varietal Trial Allocation & Sowing',
    land_manager: 'Ato Mulugeta Fentaw (FTC Manager)',
    manager_phone: '+251 918 445 566',
    registration_no: 'AM-GB-2023-001',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    total_area_ha: 3.5,
    male_operators: 15,
    female_operators: 10,
    married_women_operators: 8,
    youth_operators: 6,
    investors_operators: 1,
    land_status: 'Active Cultivation',
    land_notes: 'Fully fenced 3.5-hectare holding utilized for Teff, Wheat, and Horticulture demonstrations under Green Book title.',
    zone: 'East Gojjam',
    woreda: 'Dejen',
    kebele: 'Kurar'
  },
  {
    id: '2',
    land_code: 'DLH-2019-SG-04',
    land_title: 'Woreta Zuria Cadastral Surveyed Irrigation Plot',
    land_category: 'Cadastral Surveyed Plot (በካዳስተር የተመዘገበ ማሳ)',
    core_operation: 'Irrigation Canal Connection & Drip Setup',
    land_manager: 'Woizero Aster Melesse',
    manager_phone: '+251 922 112 334',
    registration_no: 'AM-CAD-2024-088',
    fiscal_year: '2019 E.C.',
    season: 'Bega / Irrigation (መስኖ/በጋ)',
    total_area_ha: 2.0,
    male_operators: 12,
    female_operators: 8,
    married_women_operators: 6,
    youth_operators: 5,
    investors_operators: 0,
    land_status: 'Active Cultivation',
    land_notes: 'Mapped via high-precision GPS cadaster; integrated with solar water pumping for dry-season vegetable trials.',
    zone: 'South Gondar',
    woreda: 'Fogera',
    kebele: 'Woreta Zuria'
  },
  {
    id: '3',
    land_code: 'DLH-2019-WG-09',
    land_title: 'Alefa FTC Soil Restoration & Nursery Tract',
    land_category: 'Communal Allocation (የህብረተሰብ የጋራ ድልድል)',
    core_operation: 'Soil Fertility Mapping & Laboratory Testing',
    land_manager: 'Ato Tadesse Worku',
    manager_phone: '+251 911 889 001',
    registration_no: 'AM-COM-2022-104',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    total_area_ha: 2.5,
    male_operators: 10,
    female_operators: 7,
    married_women_operators: 5,
    youth_operators: 4,
    investors_operators: 1,
    land_status: 'Restoration Phase',
    land_notes: 'Allocated by community kebele administration for multi-purpose forestry nursery and soil acidity remediation.',
    zone: 'West Gojjam',
    woreda: 'Bure',
    kebele: 'Alefa'
  }
];

function FtcDemonstrationLandContent() {
  const { message } = App.useApp();

  const [holdings, setHoldings] = useState(INITIAL_LAND_HOLDINGS);
  const [isFetching, setIsFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [operationFilter, setOperationFilter] = useState(null);
  const [fiscalYearFilter, setFiscalYearFilter] = useState(null);
  const [seasonFilter, setSeasonFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [zoneFilter, setZoneFilter] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLand, setEditingLand] = useState(null);
  const [selectedLand, setSelectedLand] = useState(null);
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
      if (editingLand) {
        const initForm = async () => {
          const zoneMatch = zones.find(
            (z) => z.name === editingLand.zone || z.id === editingLand.zone_id
          );
          if (zoneMatch) {
            try {
              const wRes = locationApi?.getWoredas ? await locationApi.getWoredas(zoneMatch.id) : null;
              const wList = wRes?.data?.data?.data || wRes?.data?.data || [];
              setWoredas(wList);

              const woredaMatch = wList.find(
                (w) => w.name === editingLand.woreda || w.id === editingLand.woreda_id
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
            land_code: editingLand.land_code,
            land_title: editingLand.land_title,
            land_category: editingLand.land_category,
            core_operation: editingLand.core_operation,
            land_manager: editingLand.land_manager,
            manager_phone: editingLand.manager_phone,
            registration_no: editingLand.registration_no,
            fiscal_year: editingLand.fiscal_year || '2019 E.C.',
            season: editingLand.season || 'Meher (መኸር)',
            total_area_ha: Number(editingLand.total_area_ha) || 2.0,
            male_operators: Number(editingLand.male_operators) || 0,
            female_operators: Number(editingLand.female_operators) || 0,
            married_women_operators: Number(editingLand.married_women_operators) || 0,
            youth_operators: Number(editingLand.youth_operators) || 0,
            investors_operators: Number(editingLand.investors_operators) || 0,
            land_notes: editingLand.land_notes,
            zone_id: editingLand.zone_id || zoneMatch?.id || editingLand.zone,
            woreda_id: editingLand.woreda_id || editingLand.woreda,
            kebele_id: editingLand.kebele_id || editingLand.kebele
          });
        };
        initForm();
      } else {
        form.resetFields();
        form.setFieldsValue({
          land_category: 'Certified Green Book Holding (በአረንጓዴ መጽሐፍ የተረጋገጠ ይዞታ)',
          core_operation: 'Multi-Varietal Trial Allocation & Sowing',
          fiscal_year: '2019 E.C.',
          season: 'Meher (መኸር)',
          total_area_ha: 2.5,
          male_operators: 10,
          female_operators: 6,
          married_women_operators: 5,
          youth_operators: 4,
          investors_operators: 1
        });
        setWoredas([]);
        setKebeles([]);
      }
    }
  }, [isModalOpen, editingLand, form, zones]);

  const loadData = async () => {
    setIsFetching(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      message.success('FTC demonstration land holdings registry refreshed');
    } catch {
      message.error('Failed to refresh data');
    } finally {
      setIsFetching(false);
    }
  };

  // Direct In-Place Status Update without Opening the Form
  const handleQuickStatusChange = (recordId, newStatus) => {
    setHoldings((prev) =>
      prev.map((h) => (h.id === recordId ? { ...h, land_status: newStatus } : h))
    );
    message.success(`Land status updated to "${newStatus}"`);
  };

  // Filter pipeline
  const filteredHoldings = useMemo(() => {
    return holdings.filter((h) => {
      const code = extractName(h.land_code).toLowerCase();
      const title = extractName(h.land_title).toLowerCase();
      const manager = extractName(h.land_manager).toLowerCase();
      const kebele = extractName(h.kebele).toLowerCase();
      const woreda = extractName(h.woreda).toLowerCase();
      const zone = extractName(h.zone).toLowerCase();
      const q = searchTerm.toLowerCase();

      const matchesSearch =
        code.includes(q) || title.includes(q) || manager.includes(q) || kebele.includes(q) || woreda.includes(q) || zone.includes(q);
      const matchesCategory = categoryFilter ? h.land_category === categoryFilter : true;
      const matchesOperation = operationFilter ? h.core_operation === operationFilter : true;
      const matchesFY = fiscalYearFilter ? h.fiscal_year === fiscalYearFilter : true;
      const matchesSeason = seasonFilter ? h.season === seasonFilter : true;
      const matchesStatus = statusFilter ? h.land_status === statusFilter : true;
      const matchesZone = zoneFilter ? zone === zoneFilter.toLowerCase() : true;

      return matchesSearch && matchesCategory && matchesOperation && matchesFY && matchesSeason && matchesStatus && matchesZone;
    });
  }, [holdings, searchTerm, categoryFilter, operationFilter, fiscalYearFilter, seasonFilter, statusFilter, zoneFilter]);

  // Statistics Calculation
  const stats = useMemo(() => {
    const totalHoldings = filteredHoldings.length;
    const totalArea = filteredHoldings.reduce((acc, h) => acc + (Number(h.total_area_ha) || 0), 0);
    const maleOperators = filteredHoldings.reduce((acc, h) => acc + (Number(h.male_operators) || 0), 0);
    const femaleOperators = filteredHoldings.reduce((acc, h) => acc + (Number(h.female_operators) || 0), 0);
    const marriedWomen = filteredHoldings.reduce((acc, h) => acc + (Number(h.married_women_operators) || 0), 0);
    const youth = filteredHoldings.reduce((acc, h) => acc + (Number(h.youth_operators) || 0), 0);
    const investors = filteredHoldings.reduce((acc, h) => acc + (Number(h.investors_operators) || 0), 0);

    const totalOperators = maleOperators + femaleOperators + marriedWomen + youth + investors;
    const totalWomenOperators = femaleOperators + marriedWomen;
    const womenRatio = totalOperators > 0 ? ((totalWomenOperators / totalOperators) * 100).toFixed(1) : 0;
    const activeCount = filteredHoldings.filter((h) => h.land_status === 'Active Cultivation').length;

    return {
      totalHoldings,
      totalArea,
      totalOperators,
      maleOperators,
      femaleOperators,
      marriedWomen,
      totalWomenOperators,
      youth,
      investors,
      womenRatio,
      activeCount
    };
  }, [filteredHoldings]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setCategoryFilter(null);
    setOperationFilter(null);
    setFiscalYearFilter(null);
    setSeasonFilter(null);
    setStatusFilter(null);
    setZoneFilter(null);
  };

  const handleOpenModal = (record = null) => {
    setEditingLand(record);
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

      if (editingLand) {
        setHoldings((prev) =>
          prev.map((item) =>
            item.id === editingLand.id ? { ...item, ...payload, land_status: editingLand.land_status } : item
          )
        );
        message.success('FTC land holding record updated successfully');
      } else {
        const newRecord = {
          ...payload,
          id: Date.now().toString(),
          land_code: values.land_code || `DLH-${Date.now().toString().slice(-4)}`,
          land_status: 'Active Cultivation'
        };
        setHoldings((prev) => [newRecord, ...prev]);
        message.success('New FTC demonstration land registered successfully');
      }
      setIsModalOpen(false);
    } catch (error) {
      message.error(error?.response?.data?.message || error.message || 'Failed to save FTC land record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    setHoldings((prev) => prev.filter((item) => item.id !== id));
    message.success('FTC demonstration land record removed');
  };

  const exportToCSV = () => {
    if (!filteredHoldings.length) {
      message.warning('No land holding records available to export');
      return;
    }
    const headers = [
      'Land Code,Title,Tenure Category,Core Operation,Total Area (Ha),Registration No,Manager,Phone,FY,Season,Zone,Woreda,Kebele,Male (ወንድ),Female (ሴት),Married Women (ባለትዳር),Youth (ወጣቶች),Investors (ባለሃብቶች),Total Operators,Status'
    ];
    const rows = filteredHoldings.map((h) => {
      const total =
        (Number(h.male_operators) || 0) +
        (Number(h.female_operators) || 0) +
        (Number(h.married_women_operators) || 0) +
        (Number(h.youth_operators) || 0) +
        (Number(h.investors_operators) || 0);

      return [
        `"${h.land_code || ''}"`,
        `"${h.land_title || ''}"`,
        `"${h.land_category || ''}"`,
        `"${h.core_operation || ''}"`,
        h.total_area_ha || 0,
        `"${h.registration_no || ''}"`,
        `"${h.land_manager || ''}"`,
        `"${h.manager_phone || ''}"`,
        `"${h.fiscal_year || ''}"`,
        `"${h.season || ''}"`,
        `"${extractName(h.zone)}"`,
        `"${extractName(h.woreda)}"`,
        `"${extractName(h.kebele)}"`,
        h.male_operators || 0,
        h.female_operators || 0,
        h.married_women_operators || 0,
        h.youth_operators || 0,
        h.investors_operators || 0,
        total,
        `"${h.land_status || ''}"`
      ].join(',');
    });

    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FTC_Demonstration_Land_Holdings_${Date.now()}.csv`;
    a.click();
    message.success('FTC land holdings report exported successfully');
  };

  const columns = [
    {
      title: 'Land Code & Title',
      key: 'land_info',
      width: 250,
      render: (_, r) => (
        <div>
          <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{r.land_title}</strong>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>
            Code: <span style={{ fontFamily: 'monospace' }}>{r.land_code}</span> | Size: {r.total_area_ha} Ha
          </div>
        </div>
      )
    },
    {
      title: 'Tenure Category',
      dataIndex: 'land_category',
      key: 'land_category',
      width: 210,
      render: (cat) => {
        let color = 'default';
        if (cat?.includes('Green Book')) color = 'green';
        if (cat?.includes('Cadastral')) color = 'blue';
        if (cat?.includes('Communal')) color = 'gold';
        if (cat?.includes('Leasehold')) color = 'purple';
        return <Tag color={color}>{cat}</Tag>;
      }
    },
    {
      title: 'Core Operation',
      dataIndex: 'core_operation',
      key: 'core_operation',
      width: 210,
      render: (op) => <span style={{ fontWeight: 500, color: '#262626' }}>{op}</span>
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
      title: 'Operators Enrolled',
      key: 'operators_breakdown',
      width: 230,
      render: (_, r) => {
        const total =
          (Number(r.male_operators) || 0) +
          (Number(r.female_operators) || 0) +
          (Number(r.married_women_operators) || 0) +
          (Number(r.youth_operators) || 0) +
          (Number(r.investors_operators) || 0);

        return (
          <div style={{ fontSize: 11 }}>
            <div>
              Total: <strong style={{ color: '#1a5f2c' }}>{total.toLocaleString()} Operators</strong>
            </div>
            <div style={{ color: '#8c8c8c' }}>
              <span>ወንድ: {r.male_operators || 0}</span> | <span>ሴት: {r.female_operators || 0}</span> | <span>ባለትዳር: {r.married_women_operators || 0}</span>
            </div>
          </div>
        );
      }
    },
    {
      title: 'Land Status (In-Place Edit)',
      dataIndex: 'land_status',
      key: 'land_status',
      width: 190,
      render: (status, record) => (
        <Select
          value={status || 'Active Cultivation'}
          onChange={(newVal) => handleQuickStatusChange(record.id, newVal)}
          style={{ width: '100%' }}
          size="small"
        >
          <Option value="Active Cultivation">
            <Tag color="success" icon={<CheckCircleOutlined />} style={{ margin: 0 }}>
              Active
            </Tag>
          </Option>
          <Option value="Restoration Phase">
            <Tag color="processing" icon={<ClockCircleOutlined />} style={{ margin: 0 }}>
              Restoring
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
          <Tooltip title="View Land Dossier">
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: '#1890ff' }} />}
              onClick={() => {
                setSelectedLand(record);
                setIsDossierOpen(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Edit Land Record">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: '#52c41a' }} />}
              onClick={() => handleOpenModal(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Record">
            <Popconfirm
              title="Delete demonstration land record?"
              description="Are you sure you want to remove this FTC land holding?"
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
        <Breadcrumb.Item>5. Farmers Training Centers (FTC)</Breadcrumb.Item>
        <Breadcrumb.Item>FTC Demonstration Land Holdings</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#1a5f2c', fontFamily: "'Times New Roman', Times, serif" }}>
            FTC Demonstration Land Holdings (የአርሶ አደር ማሰልጠኛ ማዕከላት ማሳ ይዞታዎች)
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Coordinating plot acreage, legal land tenure certification (Green Book/Cadaster), and seasonal cultivation across FTC stations
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
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Total Demo Land (Ha)</span>}
              value={stats.totalArea}
              suffix="Ha"
              prefix={<EnvironmentFilled style={{ color: '#1a5f2c', marginRight: 8 }} />}
              valueStyle={{ color: '#1a5f2c', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Total Holdings: <strong style={{ color: '#262626' }}>{stats.totalHoldings} plots</strong>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #1890ff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Male Operators (ወንድ)</span>}
              value={stats.maleOperators}
              prefix={<ManOutlined style={{ color: '#1890ff', marginRight: 8 }} />}
              valueStyle={{ color: '#1890ff', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Male land stewards and operators
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #722ed1', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Women Operators (ሴት + ባለትዳር)</span>}
              value={stats.totalWomenOperators}
              prefix={<WomanOutlined style={{ color: '#722ed1', marginRight: 8 }} />}
              valueStyle={{ color: '#722ed1', fontWeight: 'bold', fontSize: 24 }}
            />
            <Progress percent={Number(stats.womenRatio)} size="small" strokeColor="#722ed1" />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8c8c8c', marginTop: 2 }}>
              <span>Share: <strong style={{ color: '#722ed1' }}>{stats.womenRatio}%</strong></span>
              <span>Regional Goal: &gt; 30%</span>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #fa8c16', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Active Cultivation</span>}
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
                placeholder="Search Title, Code, or Manager..."
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: 220 }}
                allowClear
              />

              <Select
                placeholder="Tenure Category"
                value={categoryFilter}
                onChange={setCategoryFilter}
                style={{ width: 195 }}
                allowClear
              >
                {LAND_CATEGORIES.map((lc) => (
                  <Option key={lc} value={lc}>{lc}</Option>
                ))}
              </Select>

              <Select
                placeholder="Core Operation"
                value={operationFilter}
                onChange={setOperationFilter}
                style={{ width: 200 }}
                allowClear
              >
                {LAND_OPERATIONS.map((lo) => (
                  <Option key={lo} value={lo}>{lo}</Option>
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
                {[...new Set(holdings.map((h) => extractName(h.zone)))].map((z) => (
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
                Export Land CSV
              </Button>

              <Button
                icon={<ClearOutlined />}
                onClick={handleResetFilters}
                disabled={!(searchTerm || categoryFilter || operationFilter || fiscalYearFilter || seasonFilter || statusFilter || zoneFilter)}
              >
                Reset Filters
              </Button>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => handleOpenModal(null)}
                style={{ backgroundColor: '#1a5f2c', borderColor: '#1a5f2c', fontWeight: 600 }}
              >
                Register Land Holding
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Main Table */}
      <Table
        columns={columns}
        dataSource={filteredHoldings}
        rowKey="id"
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} FTC land holdings`
        }}
        scroll={{ x: 1350 }}
        bordered
        size="middle"
      />

      {/* Registration / Edit Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CompassOutlined style={{ color: '#1a5f2c', fontSize: 20 }} />
            <span style={{ color: '#1a5f2c', fontWeight: 'bold', fontFamily: "'Times New Roman', Times, serif", fontSize: 17 }}>
              {editingLand ? 'Edit FTC Land Holding Record' : 'Register FTC Demonstration Land (ማሳ ይዞታ ምዝገባ)'}
            </span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText={editingLand ? 'Update Land Record' : 'Save Land Record'}
        okButtonProps={{ style: { backgroundColor: '#1a5f2c', borderColor: '#1a5f2c' }, loading: isSubmitting }}
        width={800}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Land Identification & Tenure Category
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="land_code"
                label="Land Code"
                rules={[{ required: true, message: 'Code required' }]}
              >
                <Input placeholder="e.g. DLH-2019-EG-08" />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item
                name="land_title"
                label="Demonstration Land / Farm Title"
                rules={[{ required: true, message: 'Title required' }]}
              >
                <Input placeholder="e.g. Kurar FTC Main Demonstration Farm Tract" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="land_category"
                label="Tenure & Certification Category"
                rules={[{ required: true, message: 'Select category' }]}
              >
                <Select>
                  {LAND_CATEGORIES.map((lc) => (
                    <Option key={lc} value={lc}>{lc}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="core_operation"
                label="Core Land Operation"
                rules={[{ required: true, message: 'Select operation' }]}
              >
                <Select>
                  {LAND_OPERATIONS.map((lo) => (
                    <Option key={lo} value={lo}>{lo}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={10}>
              <Form.Item
                name="land_manager"
                label="Land Manager / Supervisor"
                rules={[{ required: true, message: 'Manager required' }]}
              >
                <Input placeholder="e.g. Ato Mulugeta Fentaw" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="manager_phone"
                label="Manager Phone Number"
                rules={[{ required: true, message: 'Phone required' }]}
              >
                <Input placeholder="+251 9..." />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="registration_no"
                label="Registration / Book No."
                rules={[{ required: true, message: 'Reg no required' }]}
              >
                <Input placeholder="e.g. AM-GB-2023-001" />
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
                name="total_area_ha"
                label="Total Plot Area (Hectares)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0.1} max={100} step={0.1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Operators Enrolled by Cohort (አስተባባሪዎች በወኪል ምድብ)
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="male_operators"
                label="Male Operators (ወንድ)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="female_operators"
                label="Female Operators (ሴት)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="married_women_operators"
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
                name="youth_operators"
                label="Youth Operators (ወጣቶች)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="investors_operators"
                label="Private Investors (ባለሃብቶች)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="land_notes" label="Land Management & Cultivation Notes">
                <TextArea rows={3} placeholder="Summarize soil fencing, crop rotation status, or irrigation readiness..." />
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

      {/* Comprehensive Land Holding Dossier Modal */}
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
                  {selectedLand?.land_title}
                </span>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                  Code: <span style={{ fontFamily: 'monospace' }}>{selectedLand?.land_code}</span> | Manager:{' '}
                  {selectedLand?.land_manager}
                </div>
              </div>
            </div>
            <div>
              <Tag
                color={selectedLand?.land_status === 'Active Cultivation' ? 'success' : 'processing'}
                icon={selectedLand?.land_status === 'Active Cultivation' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                style={{ fontSize: 12, padding: '2px 10px', borderRadius: 12 }}
              >
                {selectedLand?.land_status || 'Active'}
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
              handleOpenModal(selectedLand);
            }}
          >
            Edit Land Record
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
        {selectedLand && (
          <div style={{ paddingTop: 8 }}>
            {/* Top Metric Strip */}
            <Row gutter={12} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f6ffed', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Total Plot Area</span>}
                    value={selectedLand.total_area_ha || 0}
                    suffix={<span style={{ fontSize: 12 }}>Ha</span>}
                    valueStyle={{ fontSize: 15, fontWeight: 'bold', color: '#1a5f2c' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f0f5ff', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Tenure Category</span>}
                    value={selectedLand.land_category?.split(' ')[0] || 'Tenure'}
                    valueStyle={{ fontSize: 15, fontWeight: 'bold', color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f9f0ff', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Women Share</span>}
                    value={
                      (Number(selectedLand.male_operators) || 0) +
                      (Number(selectedLand.female_operators) || 0) +
                      (Number(selectedLand.married_women_operators) || 0) +
                      (Number(selectedLand.youth_operators) || 0) +
                      (Number(selectedLand.investors_operators) || 0) > 0
                        ? (
                            (((Number(selectedLand.female_operators) || 0) +
                              (Number(selectedLand.married_women_operators) || 0)) /
                              ((Number(selectedLand.male_operators) || 0) +
                                (Number(selectedLand.female_operators) || 0) +
                                (Number(selectedLand.married_women_operators) || 0) +
                                (Number(selectedLand.youth_operators) || 0) +
                                (Number(selectedLand.investors_operators) || 0))) *
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
                    value={selectedLand.fiscal_year}
                    valueStyle={{ fontSize: 13, fontWeight: 'bold', color: '#fa8c16' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* TABPANES */}
            <Tabs defaultActiveKey="1" type="card">
              {/* TAB 1: Land Profile */}
              <TabPane
                tab={
                  <span>
                    <TeamOutlined />
                    Operator Demographics & Reach
                  </span>
                }
                key="1"
              >
                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }} style={{ marginBottom: 16 }}>
                  <Descriptions.Item label="Land Title" span={2}>
                    <strong style={{ color: '#1a5f2c' }}>{selectedLand.land_title}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Tenure Category">
                    <Tag color="purple">{selectedLand.land_category}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Registration / Book No.">
                    <span style={{ fontFamily: 'monospace' }}>{selectedLand.registration_no}</span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Core Operation">
                    <Tag color="green">{selectedLand.core_operation}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Land Manager">
                    {selectedLand.land_manager} ({selectedLand.manager_phone})
                  </Descriptions.Item>
                </Descriptions>

                <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: 16, background: '#fafafa' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1a5f2c', textTransform: 'uppercase', marginBottom: 12 }}>
                    Operator Disaggregation (አስተባባሪዎች በወኪል ምድብ)
                  </div>
                  <Row gutter={[16, 16]}>
                    <Col span={8}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <ManOutlined style={{ color: '#1890ff', marginRight: 4 }} />
                          Male Operators (ወንድ)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#1890ff', marginTop: 2 }}>
                          {Number(selectedLand.male_operators || 0).toLocaleString()}
                        </div>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <WomanOutlined style={{ color: '#722ed1', marginRight: 4 }} />
                          Female Operators (ሴት)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#722ed1', marginTop: 2 }}>
                          {Number(selectedLand.female_operators || 0).toLocaleString()}
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
                          {Number(selectedLand.married_women_operators || 0).toLocaleString()}
                        </div>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <RiseOutlined style={{ color: '#fa8c16', marginRight: 4 }} />
                          Youth Operators (ወጣቶች)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#fa8c16', marginTop: 2 }}>
                          {Number(selectedLand.youth_operators || 0).toLocaleString()}
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
                          {Number(selectedLand.investors_operators || 0).toLocaleString()}
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
                    Land Management Notes & Status
                  </span>
                }
                key="2"
              >
                <Card size="small" bordered={false} style={{ background: '#fcfdfd', border: '1px solid #e6f7ed', borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <CheckCircleOutlined style={{ color: '#1a5f2c', fontSize: 16 }} />
                    <strong style={{ color: '#1a5f2c', fontSize: 13, textTransform: 'uppercase' }}>
                      Land Cultivation & Management Notes (የማሳ ይዞታ ማስታወሻ)
                    </strong>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: '#262626', lineHeight: '1.6' }}>
                    {selectedLand.land_notes || 'Active FTC demonstration land holding under active cultivation and trials.'}
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
                    <strong>{extractName(selectedLand.zone)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Woreda">
                    <strong>{extractName(selectedLand.woreda)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Kebele Operational Base">
                    <span style={{ color: '#1a5f2c', fontWeight: 'bold' }}>
                      {extractName(selectedLand.kebele)}
                    </span>
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
                  <Descriptions.Item label="Fiscal Year (በጀት ዓመት)">
                    <Tag color="blue" icon={<CalendarOutlined />}>
                      {selectedLand.fiscal_year || '2019 E.C.'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Production Campaign Season">
                    <strong>{selectedLand.season || 'Meher (መኸር)'}</strong>
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

export default function FtcDemonstrationLand() {
  return (
    <App>
      <FtcDemonstrationLandContent />
    </App>
  );
}