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
  StarOutlined,
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

const KEBELE_LEVELS = [
  'Level-1 Model Kebele (አጠቃላይ የቴክኖሎጂ አጠቃቀም ሞዴል)',
  'Level-2 Commercialized Cluster Kebele (የንግድ ኩታ ገጠም ሞዴል ቀበሌ)',
  'Level-3 Mechanized & Smart Kebele (ማካናይዜሽንና ስማርት ቀበሌ)',
  'Emerging Kebele Under Development (በልማት ሂደት ላይ ያለ ቀበሌ)'
];

const DEVELOPMENT_ACTIVITIES = [
  'Full Technology Package Adoption & Row Planting',
  'Watershed Rehabilitation & Natural Resource Protection',
  'Commercial Commodity Cluster Integration',
  'Digital ID & Rural Financial Inclusion Saturation',
  'Model FTC Infrastructure & Farmers Training'
];

const INITIAL_KEBELES = [
  {
    id: '1',
    kebele_code: 'MKB-2019-EG-01',
    kebele_name: 'Kurar Model Agricultural Kebele',
    kebele_level: 'Level-1 Model Kebele (አጠቃላይ የቴክኖሎጂ አጠቃቀም ሞዴል)',
    core_activity: 'Full Technology Package Adoption & Row Planting',
    kebele_leader: 'Ato Mulugeta Fentaw (Kebele Chair)',
    leader_phone: '+251 918 445 566',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    total_households: 1250,
    male_beneficiaries: 1400,
    female_beneficiaries: 1100,
    married_women_beneficiaries: 950,
    youth_beneficiaries: 450,
    investors_beneficiaries: 25,
    kebele_status: 'Certified Model',
    kebele_notes: 'Achieved 95% row-planting adoption and complete watershed terracing across all farm holdings.',
    zone: 'East Gojjam',
    woreda: 'Dejen',
    kebele: 'Kurar'
  },
  {
    id: '2',
    kebele_code: 'MKB-2019-SG-04',
    kebele_name: 'Woreta Zuria Commercial Rice Kebele',
    kebele_level: 'Level-2 Commercialized Cluster Kebele (የንግድ ኩታ ገጠም ሞዴል ቀበሌ)',
    core_activity: 'Commercial Commodity Cluster Integration',
    kebele_leader: 'Woizero Aster Melesse',
    leader_phone: '+251 922 112 334',
    fiscal_year: '2019 E.C.',
    season: 'Bega / Irrigation (መስኖ/በጋ)',
    total_households: 1800,
    male_beneficiaries: 2100,
    female_beneficiaries: 1550,
    married_women_beneficiaries: 1300,
    youth_beneficiaries: 620,
    investors_beneficiaries: 40,
    kebele_status: 'Certified Model',
    kebele_notes: 'Integrated 500 hectares of contiguous lowland rice production with mechanized harvesting services.',
    zone: 'South Gondar',
    woreda: 'Fogera',
    kebele: 'Woreta Zuria'
  },
  {
    id: '3',
    kebele_code: 'MKB-2019-WG-09',
    kebele_name: 'Alefa Emerging Agricultural Kebele',
    kebele_level: 'Emerging Kebele Under Development (በልማት ሂደት ላይ ያለ ቀበሌ)',
    core_activity: 'Model FTC Infrastructure & Farmers Training',
    kebele_leader: 'Ato Tadesse Worku',
    leader_phone: '+251 911 889 001',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    total_households: 950,
    male_beneficiaries: 1050,
    female_beneficiaries: 820,
    married_women_beneficiaries: 680,
    youth_beneficiaries: 310,
    investors_beneficiaries: 12,
    kebele_status: 'Under Evaluation',
    kebele_notes: 'Upgrading FTC training hall and expanding soil health campaigns to reach Level-1 model status.',
    zone: 'West Gojjam',
    woreda: 'Bure',
    kebele: 'Alefa'
  }
];

function ModelKebelesContent() {
  const { message } = App.useApp();

  const [kebeles, setKebeles] = useState(INITIAL_KEBELES);
  const [isFetching, setIsFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState(null);
  const [activityFilter, setActivityFilter] = useState(null);
  const [fiscalYearFilter, setFiscalYearFilter] = useState(null);
  const [seasonFilter, setSeasonFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [zoneFilter, setZoneFilter] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKebele, setEditingKebele] = useState(null);
  const [selectedKebele, setSelectedKebele] = useState(null);
  const [isDossierOpen, setIsDossierOpen] = useState(false);

  // Cascading Location States (Database Fetched)
  const [zones, setZones] = useState([]);
  const [woredas, setWoredas] = useState([]);
  const [dbKebeles, setDbKebeles] = useState([]);
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
    setDbKebeles([]);
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
    setDbKebeles([]);
    if (!woredaId) return;

    setLoadingLocations(true);
    try {
      const res = locationApi?.getKebeles 
        ? await locationApi.getKebeles(woredaId) 
        : (farmerApi?.getKebeles ? await farmerApi.getKebeles(woredaId) : null);
      const list = res?.data?.data?.data || res?.data?.data || res?.data || [];
      setDbKebeles(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to load kebeles:', err);
    } finally {
      setLoadingLocations(false);
    }
  };

  // Synchronize modal form fields cleanly when opened
  useEffect(() => {
    if (isModalOpen) {
      if (editingKebele) {
        const initForm = async () => {
          const zoneMatch = zones.find(
            (z) => z.name === editingKebele.zone || z.id === editingKebele.zone_id
          );
          if (zoneMatch) {
            try {
              const wRes = locationApi?.getWoredas ? await locationApi.getWoredas(zoneMatch.id) : null;
              const wList = wRes?.data?.data?.data || wRes?.data?.data || [];
              setWoredas(wList);

              const woredaMatch = wList.find(
                (w) => w.name === editingKebele.woreda || w.id === editingKebele.woreda_id
              );
              if (woredaMatch) {
                const kRes = locationApi?.getKebeles ? await locationApi.getKebeles(woredaMatch.id) : null;
                setDbKebeles(kRes?.data?.data?.data || kRes?.data?.data || []);
              }
            } catch (e) {
              console.error('Location prefill error:', e);
            }
          }

          form.setFieldsValue({
            kebele_code: editingKebele.kebele_code,
            kebele_name: editingKebele.kebele_name,
            kebele_level: editingKebele.kebele_level,
            core_activity: editingKebele.core_activity,
            kebele_leader: editingKebele.kebele_leader,
            leader_phone: editingKebele.leader_phone,
            fiscal_year: editingKebele.fiscal_year || '2019 E.C.',
            season: editingKebele.season || 'Meher (መኸር)',
            total_households: Number(editingKebele.total_households) || 1000,
            male_beneficiaries: Number(editingKebele.male_beneficiaries) || 0,
            female_beneficiaries: Number(editingKebele.female_beneficiaries) || 0,
            married_women_beneficiaries: Number(editingKebele.married_women_beneficiaries) || 0,
            youth_beneficiaries: Number(editingKebele.youth_beneficiaries) || 0,
            investors_beneficiaries: Number(editingKebele.investors_beneficiaries) || 0,
            kebele_notes: editingKebele.kebele_notes,
            zone_id: editingKebele.zone_id || zoneMatch?.id || editingKebele.zone,
            woreda_id: editingKebele.woreda_id || editingKebele.woreda,
            kebele_id: editingKebele.kebele_id || editingKebele.kebele
          });
        };
        initForm();
      } else {
        form.resetFields();
        form.setFieldsValue({
          kebele_level: 'Level-1 Model Kebele (አጠቃላይ የቴክኖሎጂ አጠቃቀም ሞዴል)',
          core_activity: 'Full Technology Package Adoption & Row Planting',
          fiscal_year: '2019 E.C.',
          season: 'Meher (መኸር)',
          total_households: 1000,
          male_beneficiaries: 100,
          female_beneficiaries: 70,
          married_women_beneficiaries: 55,
          youth_beneficiaries: 30,
          investors_beneficiaries: 5
        });
        setWoredas([]);
        setDbKebeles([]);
      }
    }
  }, [isModalOpen, editingKebele, form, zones]);

  const loadData = async () => {
    setIsFetching(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      message.success('Model kebeles registry refreshed');
    } catch {
      message.error('Failed to refresh data');
    } finally {
      setIsFetching(false);
    }
  };

  // Direct In-Place Status Update without Opening the Form
  const handleQuickStatusChange = (recordId, newStatus) => {
    setKebeles((prev) =>
      prev.map((k) => (k.id === recordId ? { ...k, kebele_status: newStatus } : k))
    );
    message.success(`Kebele status updated to "${newStatus}"`);
  };

  // Filter pipeline
  const filteredKebeles = useMemo(() => {
    return kebeles.filter((k) => {
      const code = extractName(k.kebele_code).toLowerCase();
      const name = extractName(k.kebele_name).toLowerCase();
      const leader = extractName(k.kebele_leader).toLowerCase();
      const kebeleStr = extractName(k.kebele).toLowerCase();
      const woreda = extractName(k.woreda).toLowerCase();
      const zone = extractName(k.zone).toLowerCase();
      const q = searchTerm.toLowerCase();

      const matchesSearch =
        code.includes(q) || name.includes(q) || leader.includes(q) || kebeleStr.includes(q) || woreda.includes(q) || zone.includes(q);
      const matchesLevel = levelFilter ? k.kebele_level === levelFilter : true;
      const matchesActivity = activityFilter ? k.core_activity === activityFilter : true;
      const matchesFY = fiscalYearFilter ? k.fiscal_year === fiscalYearFilter : true;
      const matchesSeason = seasonFilter ? k.season === seasonFilter : true;
      const matchesStatus = statusFilter ? k.kebele_status === statusFilter : true;
      const matchesZone = zoneFilter ? zone === zoneFilter.toLowerCase() : true;

      return matchesSearch && matchesLevel && matchesActivity && matchesFY && matchesSeason && matchesStatus && matchesZone;
    });
  }, [kebeles, searchTerm, levelFilter, activityFilter, fiscalYearFilter, seasonFilter, statusFilter, zoneFilter]);

  // Statistics Calculation
  const stats = useMemo(() => {
    const totalKebeles = filteredKebeles.length;
    const totalHouseholds = filteredKebeles.reduce((acc, k) => acc + (Number(k.total_households) || 0), 0);
    const maleBeneficiaries = filteredKebeles.reduce((acc, k) => acc + (Number(k.male_beneficiaries) || 0), 0);
    const femaleBeneficiaries = filteredKebeles.reduce((acc, k) => acc + (Number(k.female_beneficiaries) || 0), 0);
    const marriedWomen = filteredKebeles.reduce((acc, k) => acc + (Number(k.married_women_beneficiaries) || 0), 0);
    const youth = filteredKebeles.reduce((acc, k) => acc + (Number(k.youth_beneficiaries) || 0), 0);
    const investors = filteredKebeles.reduce((acc, k) => acc + (Number(k.investors_beneficiaries) || 0), 0);

    const totalBeneficiaries = maleBeneficiaries + femaleBeneficiaries + marriedWomen + youth + investors;
    const totalWomenBeneficiaries = femaleBeneficiaries + marriedWomen;
    const womenRatio = totalBeneficiaries > 0 ? ((totalWomenBeneficiaries / totalBeneficiaries) * 100).toFixed(1) : 0;
    const certifiedCount = filteredKebeles.filter((k) => k.kebele_status === 'Certified Model').length;

    return {
      totalKebeles,
      totalHouseholds,
      totalBeneficiaries,
      maleBeneficiaries,
      femaleBeneficiaries,
      marriedWomen,
      totalWomenBeneficiaries,
      youth,
      investors,
      womenRatio,
      certifiedCount
    };
  }, [filteredKebeles]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setLevelFilter(null);
    setActivityFilter(null);
    setFiscalYearFilter(null);
    setSeasonFilter(null);
    setStatusFilter(null);
    setZoneFilter(null);
  };

  const handleOpenModal = (record = null) => {
    setEditingKebele(record);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const selectedZone = zones.find((z) => (z.id || z._id) === values.zone_id);
      const selectedWoreda = woredas.find((w) => (w.id || w._id) === values.woreda_id);
      const selectedKebele = dbKebeles.find((k) => (k.id || k._id) === values.kebele_id);

      const payload = {
        ...values,
        zone: selectedZone?.name || selectedZone?.zone_name || values.zone_id,
        woreda: selectedWoreda?.name || selectedWoreda?.woreda_name || values.woreda_id,
        kebele: selectedKebele?.name || selectedKebele?.kebele_name || values.kebele_id
      };

      if (editingKebele) {
        setKebeles((prev) =>
          prev.map((item) =>
            item.id === editingKebele.id ? { ...item, ...payload, kebele_status: editingKebele.kebele_status } : item
          )
        );
        message.success('Model kebele record updated successfully');
      } else {
        const newRecord = {
          ...payload,
          id: Date.now().toString(),
          kebele_code: values.kebele_code || `MKB-${Date.now().toString().slice(-4)}`,
          kebele_status: 'Certified Model'
        };
        setKebeles((prev) => [newRecord, ...prev]);
        message.success('New model kebele registered successfully');
      }
      setIsModalOpen(false);
    } catch (error) {
      message.error(error?.response?.data?.message || error.message || 'Failed to save model kebele record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    setKebeles((prev) => prev.filter((item) => item.id !== id));
    message.success('Model kebele record removed');
  };

  const exportToCSV = () => {
    if (!filteredKebeles.length) {
      message.warning('No model kebele records available to export');
      return;
    }
    const headers = [
      'Kebele Code,Kebele Name,Classification Level,Core Activity,Households,Leader,Phone,FY,Season,Zone,Woreda,Kebele,Male (ወንድ),Female (ሴት),Married Women (ባለትዳር),Youth (ወጣቶች),Investors (ባለሃብቶች),Total Beneficiaries,Status'
    ];
    const rows = filteredKebeles.map((k) => {
      const total =
        (Number(k.male_beneficiaries) || 0) +
        (Number(k.female_beneficiaries) || 0) +
        (Number(k.married_women_beneficiaries) || 0) +
        (Number(k.youth_beneficiaries) || 0) +
        (Number(k.investors_beneficiaries) || 0);

      return [
        `"${k.kebele_code || ''}"`,
        `"${k.kebele_name || ''}"`,
        `"${k.kebele_level || ''}"`,
        `"${k.core_activity || ''}"`,
        k.total_households || 0,
        `"${k.kebele_leader || ''}"`,
        `"${k.leader_phone || ''}"`,
        `"${k.fiscal_year || ''}"`,
        `"${k.season || ''}"`,
        `"${extractName(k.zone)}"`,
        `"${extractName(k.woreda)}"`,
        `"${extractName(k.kebele)}"`,
        k.male_beneficiaries || 0,
        k.female_beneficiaries || 0,
        k.married_women_beneficiaries || 0,
        k.youth_beneficiaries || 0,
        k.investors_beneficiaries || 0,
        total,
        `"${k.kebele_status || ''}"`
      ].join(',');
    });

    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Model_Kebeles_Report_${Date.now()}.csv`;
    a.click();
    message.success('Model kebeles report exported successfully');
  };

  const columns = [
    {
      title: 'Kebele Code & Name',
      key: 'kebele_info',
      width: 250,
      render: (_, r) => (
        <div>
          <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{r.kebele_name}</strong>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>
            Code: <span style={{ fontFamily: 'monospace' }}>{r.kebele_code}</span> | HHs: {Number(r.total_households || 0).toLocaleString()}
          </div>
        </div>
      )
    },
    {
      title: 'Classification Level',
      dataIndex: 'kebele_level',
      key: 'kebele_level',
      width: 210,
      render: (level) => {
        let color = 'default';
        if (level?.includes('Level-1')) color = 'green';
        if (level?.includes('Level-2')) color = 'blue';
        if (level?.includes('Level-3')) color = 'purple';
        if (level?.includes('Emerging')) color = 'gold';
        return <Tag color={color}>{level}</Tag>;
      }
    },
    {
      title: 'Core Development Activity',
      dataIndex: 'core_activity',
      key: 'core_activity',
      width: 210,
      render: (act) => <span style={{ fontWeight: 500, color: '#262626' }}>{act}</span>
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
      title: 'Beneficiaries Reached',
      key: 'beneficiaries_breakdown',
      width: 230,
      render: (_, r) => {
        const total =
          (Number(r.male_beneficiaries) || 0) +
          (Number(r.female_beneficiaries) || 0) +
          (Number(r.married_women_beneficiaries) || 0) +
          (Number(r.youth_beneficiaries) || 0) +
          (Number(r.investors_beneficiaries) || 0);

        return (
          <div style={{ fontSize: 11 }}>
            <div>
              Total: <strong style={{ color: '#1a5f2c' }}>{total.toLocaleString()} People</strong>
            </div>
            <div style={{ color: '#8c8c8c' }}>
              <span>ወንድ: {r.male_beneficiaries || 0}</span> | <span>ሴት: {r.female_beneficiaries || 0}</span> | <span>ባለትዳር: {r.married_women_beneficiaries || 0}</span>
            </div>
          </div>
        );
      }
    },
    {
      title: 'Kebele Status (In-Place Edit)',
      dataIndex: 'kebele_status',
      key: 'kebele_status',
      width: 190,
      render: (status, record) => (
        <Select
          value={status || 'Certified Model'}
          onChange={(newVal) => handleQuickStatusChange(record.id, newVal)}
          style={{ width: '100%' }}
          size="small"
        >
          <Option value="Certified Model">
            <Tag color="success" icon={<CheckCircleOutlined />} style={{ margin: 0 }}>
              Certified
            </Tag>
          </Option>
          <Option value="Under Evaluation">
            <Tag color="warning" icon={<ClockCircleOutlined />} style={{ margin: 0 }}>
              Evaluating
            </Tag>
          </Option>
          <Option value="Developing">
            <Tag color="default" icon={<ClockCircleOutlined />} style={{ margin: 0 }}>
              Developing
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
          <Tooltip title="View Kebele Dossier">
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: '#1890ff' }} />}
              onClick={() => {
                setSelectedKebele(record);
                setIsDossierOpen(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Edit Kebele">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: '#52c41a' }} />}
              onClick={() => handleOpenModal(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Record">
            <Popconfirm
              title="Delete model kebele record?"
              description="Are you sure you want to remove this model kebele profile?"
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
        <Breadcrumb.Item>Model Kebele Development & Classification</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#1a5f2c', fontFamily: "'Times New Roman', Times, serif" }}>
            Model Kebele Development & Classification (ሞዴል ቀበሌዎች ልማትና ምደባ)
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Coordinating kebele-level model classifications, technology adoption benchmarks, and community transformation metrics
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
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Total Households Covered</span>}
              value={stats.totalHouseholds}
              prefix={<StarOutlined style={{ color: '#1a5f2c', marginRight: 8 }} />}
              valueStyle={{ color: '#1a5f2c', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Total Kebeles: <strong style={{ color: '#262626' }}>{stats.totalKebeles} kebeles</strong>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #1890ff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Male Beneficiaries (ወንድ)</span>}
              value={stats.maleBeneficiaries}
              prefix={<ManOutlined style={{ color: '#1890ff', marginRight: 8 }} />}
              valueStyle={{ color: '#1890ff', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Male participants in model kebeles
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #722ed1', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Women Beneficiaries (ሴት + ባለትዳር)</span>}
              value={stats.totalWomenBeneficiaries}
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
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Certified Model Kebeles</span>}
              value={stats.certifiedCount}
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
                placeholder="Search Name, Code, or Leader..."
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: 220 }}
                allowClear
              />

              <Select
                placeholder="Classification Level"
                value={levelFilter}
                onChange={setLevelFilter}
                style={{ width: 195 }}
                allowClear
              >
                {KEBELE_LEVELS.map((kl) => (
                  <Option key={kl} value={kl}>{kl}</Option>
                ))}
              </Select>

              <Select
                placeholder="Core Activity"
                value={activityFilter}
                onChange={setActivityFilter}
                style={{ width: 200 }}
                allowClear
              >
                {DEVELOPMENT_ACTIVITIES.map((da) => (
                  <Option key={da} value={da}>{da}</Option>
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
                {[...new Set(kebeles.map((k) => extractName(k.zone)))].map((z) => (
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
                Export Kebele CSV
              </Button>

              <Button
                icon={<ClearOutlined />}
                onClick={handleResetFilters}
                disabled={!(searchTerm || levelFilter || activityFilter || fiscalYearFilter || seasonFilter || statusFilter || zoneFilter)}
              >
                Reset Filters
              </Button>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => handleOpenModal(null)}
                style={{ backgroundColor: '#1a5f2c', borderColor: '#1a5f2c', fontWeight: 600 }}
              >
                Register Model Kebele
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Main Table */}
      <Table
        columns={columns}
        dataSource={filteredKebeles}
        rowKey="id"
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} model kebeles`
        }}
        scroll={{ x: 1350 }}
        bordered
        size="middle"
      />

      {/* Registration / Edit Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <StarOutlined style={{ color: '#1a5f2c', fontSize: 20 }} />
            <span style={{ color: '#1a5f2c', fontWeight: 'bold', fontFamily: "'Times New Roman', Times, serif", fontSize: 17 }}>
              {editingKebele ? 'Edit Model Kebele Record' : 'Register Model Kebele (ሞዴል ቀበሌ ምዝገባ)'}
            </span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText={editingKebele ? 'Update Kebele' : 'Save Kebele Record'}
        okButtonProps={{ style: { backgroundColor: '#1a5f2c', borderColor: '#1a5f2c' }, loading: isSubmitting }}
        width={800}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Kebele Identification & Classification Level
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="kebele_code"
                label="Kebele Code"
                rules={[{ required: true, message: 'Code required' }]}
              >
                <Input placeholder="e.g. MKB-2019-EG-08" />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item
                name="kebele_name"
                label="Model Kebele Name"
                rules={[{ required: true, message: 'Kebele name required' }]}
              >
                <Input placeholder="e.g. Kurar Model Agricultural Kebele" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="kebele_level"
                label="Classification Level"
                rules={[{ required: true, message: 'Select level' }]}
              >
                <Select>
                  {KEBELE_LEVELS.map((kl) => (
                    <Option key={kl} value={kl}>{kl}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="core_activity"
                label="Core Development Activity"
                rules={[{ required: true, message: 'Select activity' }]}
              >
                <Select>
                  {DEVELOPMENT_ACTIVITIES.map((da) => (
                    <Option key={da} value={da}>{da}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={10}>
              <Form.Item
                name="kebele_leader"
                label="Kebele Leader / Chair"
                rules={[{ required: true, message: 'Leader required' }]}
              >
                <Input placeholder="e.g. Ato Mulugeta Fentaw" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="leader_phone"
                label="Leader Phone Number"
                rules={[{ required: true, message: 'Phone required' }]}
              >
                <Input placeholder="+251 9..." />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="total_households"
                label="Total Households (HHs)"
                rules={[{ required: true, message: 'HHs required' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
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
            Beneficiaries Enrolled by Cohort (ተጠቃሚዎች በወኪል ምድብ)
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="male_beneficiaries"
                label="Male Beneficiaries (ወንድ)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="female_beneficiaries"
                label="Female Beneficiaries (ሴት)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="married_women_beneficiaries"
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
                name="youth_beneficiaries"
                label="Youth Beneficiaries (ወጣቶች)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="investors_beneficiaries"
                label="Private Investors (ባለሃብቶች)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="kebele_notes" label="Kebele Transformation Notes & Milestones">
                <TextArea rows={3} placeholder="Summarize technology adoption achievements, model status certification, or watershed coverage..." />
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
                    placeholder={dbKebeles.length ? 'Select Kebele' : 'Select Woreda first'}
                    disabled={!dbKebeles.length}
                    showSearch
                    optionFilterProp="children"
                    allowClear
                  >
                    {dbKebeles.map((k) => (
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

      {/* Comprehensive Kebele Dossier Modal */}
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
                <StarOutlined />
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
                  {selectedKebele?.kebele_name}
                </span>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                  Code: <span style={{ fontFamily: 'monospace' }}>{selectedKebele?.kebele_code}</span> | Leader:{' '}
                  {selectedKebele?.kebele_leader}
                </div>
              </div>
            </div>
            <div>
              <Tag
                color={selectedKebele?.kebele_status === 'Certified Model' ? 'success' : 'warning'}
                icon={selectedKebele?.kebele_status === 'Certified Model' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                style={{ fontSize: 12, padding: '2px 10px', borderRadius: 12 }}
              >
                {selectedKebele?.kebele_status || 'Certified'}
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
              handleOpenModal(selectedKebele);
            }}
          >
            Edit Kebele
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
        {selectedKebele && (
          <div style={{ paddingTop: 8 }}>
            {/* Top Metric Strip */}
            <Row gutter={12} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f6ffed', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Households</span>}
                    value={selectedKebele.total_households || 0}
                    suffix={<span style={{ fontSize: 12 }}>HHs</span>}
                    valueStyle={{ fontSize: 15, fontWeight: 'bold', color: '#1a5f2c' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f0f5ff', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Classification Level</span>}
                    value={selectedKebele.kebele_level?.split(' ')[0] || 'Level'}
                    valueStyle={{ fontSize: 15, fontWeight: 'bold', color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f9f0ff', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Women Share</span>}
                    value={
                      (Number(selectedKebele.male_beneficiaries) || 0) +
                      (Number(selectedKebele.female_beneficiaries) || 0) +
                      (Number(selectedKebele.married_women_beneficiaries) || 0) +
                      (Number(selectedKebele.youth_beneficiaries) || 0) +
                      (Number(selectedKebele.investors_beneficiaries) || 0) > 0
                        ? (
                            (((Number(selectedKebele.female_beneficiaries) || 0) +
                              (Number(selectedKebele.married_women_beneficiaries) || 0)) /
                              ((Number(selectedKebele.male_beneficiaries) || 0) +
                                (Number(selectedKebele.female_beneficiaries) || 0) +
                                (Number(selectedKebele.married_women_beneficiaries) || 0) +
                                (Number(selectedKebele.youth_beneficiaries) || 0) +
                                (Number(selectedKebele.investors_beneficiaries) || 0))) *
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
                    value={selectedKebele.fiscal_year}
                    valueStyle={{ fontSize: 13, fontWeight: 'bold', color: '#fa8c16' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* TABPANES */}
            <Tabs defaultActiveKey="1" type="card">
              {/* TAB 1: Kebele Profile */}
              <TabPane
                tab={
                  <span>
                    <TeamOutlined />
                    Beneficiary Demographics & Reach
                  </span>
                }
                key="1"
              >
                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }} style={{ marginBottom: 16 }}>
                  <Descriptions.Item label="Model Kebele Name" span={2}>
                    <strong style={{ color: '#1a5f2c' }}>{selectedKebele.kebele_name}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Classification Level">
                    <Tag color="purple">{selectedKebele.kebele_level}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Core Activity">
                    <Tag color="green">{selectedKebele.core_activity}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Kebele Leader">
                    {selectedKebele.kebele_leader} ({selectedKebele.leader_phone})
                  </Descriptions.Item>
                </Descriptions>

                <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: 16, background: '#fafafa' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1a5f2c', textTransform: 'uppercase', marginBottom: 12 }}>
                    Beneficiary Disaggregation (ተጠቃሚዎች በወኪል ምድብ)
                  </div>
                  <Row gutter={[16, 16]}>
                    <Col span={8}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <ManOutlined style={{ color: '#1890ff', marginRight: 4 }} />
                          Male Beneficiaries (ወንድ)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#1890ff', marginTop: 2 }}>
                          {Number(selectedKebele.male_beneficiaries || 0).toLocaleString()}
                        </div>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <WomanOutlined style={{ color: '#722ed1', marginRight: 4 }} />
                          Female Beneficiaries (ሴት)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#722ed1', marginTop: 2 }}>
                          {Number(selectedKebele.female_beneficiaries || 0).toLocaleString()}
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
                          {Number(selectedKebele.married_women_beneficiaries || 0).toLocaleString()}
                        </div>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <RiseOutlined style={{ color: '#fa8c16', marginRight: 4 }} />
                          Youth Beneficiaries (ወጣቶች)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#fa8c16', marginTop: 2 }}>
                          {Number(selectedKebele.youth_beneficiaries || 0).toLocaleString()}
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
                          {Number(selectedKebele.investors_beneficiaries || 0).toLocaleString()}
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
                    Transformation Notes & Milestones
                  </span>
                }
                key="2"
              >
                <Card size="small" bordered={false} style={{ background: '#fcfdfd', border: '1px solid #e6f7ed', borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <CheckCircleOutlined style={{ color: '#1a5f2c', fontSize: 16 }} />
                    <strong style={{ color: '#1a5f2c', fontSize: 13, textTransform: 'uppercase' }}>
                      Kebele Development Milestone (የቀበሌው ልማት ማስታወሻ)
                    </strong>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: '#262626', lineHeight: '1.6' }}>
                    {selectedKebele.kebele_notes || 'Model kebele achieving high technology adoption and community development targets.'}
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
                    <strong>{extractName(selectedKebele.zone)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Woreda">
                    <strong>{extractName(selectedKebele.woreda)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Kebele Operational Base">
                    <span style={{ color: '#1a5f2c', fontWeight: 'bold' }}>
                      {extractName(selectedKebele.kebele)}
                    </span>
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
                  <Descriptions.Item label="Fiscal Year (በጀት ዓመት)">
                    <Tag color="blue" icon={<CalendarOutlined />}>
                      {selectedKebele.fiscal_year || '2019 E.C.'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Production Campaign Season">
                    <strong>{selectedKebele.season || 'Meher (መኸር)'}</strong>
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

export default function ModelKebeles() {
  return (
    <App>
      <ModelKebelesContent />
    </App>
  );
}