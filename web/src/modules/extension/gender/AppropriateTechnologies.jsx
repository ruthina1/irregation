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
  ToolOutlined,
  FilterOutlined
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

const TECH_CATEGORIES = [
  'Labor-Saving Threshing & Harvesting Tool (የጉልበት ቆጣቢ የእርሻ መሣሪያ)',
  'Solar Water Pumping & Drip Irrigation Kit (ሶላር ውሃ ማውጫና ጠብታ መስኖ)',
  'Improved Fuel-Efficient Stove Dissemination (የተሻሻለ ምድጃ ስርጭት)',
  'Grain Mill & Agro-Processing Micro-Enterprise (የእህል መፍጫና ማቀነባበሪያ ማዕከል)',
  'Water Harvesting & Household Ponds (የዝናብ ውሃ ማጠራቀሚያ ገንዳ)'
];

const TECH_ACTIVITIES = [
  'Technology Demonstration & Field Drill',
  'Maintenance & Repair Skill Training',
  'Micro-Enterprise Cooperative Handover',
  'Safety & Ergonomic Usage Workshop',
  'Impact & Labor-Reduction Audit'
];

const INITIAL_TECHNOLOGIES = [
  {
    id: '1',
    tech_code: 'LST-2019-EG-01',
    tech_title: 'Kurar Women Cooperative Solar Threshing & Water Pump Distribution',
    tech_category: 'Solar Water Pumping & Drip Irrigation Kit (ሶላር ውሃ ማውጫና ጠብታ መስኖ)',
    core_activity: 'Technology Demonstration & Field Drill',
    coordinator_name: 'Woizero Tigist Abebe (Gender Officer)',
    coordinator_phone: '+251 922 556 778',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    units_distributed: 15,
    units_functional: 15,
    male_beneficiaries: 20,
    female_beneficiaries: 180,
    married_women_beneficiaries: 145,
    youth_beneficiaries: 55,
    investors_beneficiaries: 3,
    tech_status: 'Fully Operational',
    tech_notes: 'Distributed 15 solar irrigation pumps and portable threshers, reducing daily women agricultural labor hours by 60%.',
    zone: 'East Gojjam',
    woreda: 'Dejen',
    kebele: 'Kurar'
  },
  {
    id: '2',
    tech_code: 'LST-2019-SG-04',
    tech_title: 'Fogera Fuel-Efficient Stoves & Agro-Processing Initiative',
    tech_category: 'Improved Fuel-Efficient Stove Dissemination (የተሻሻለ ምድጃ ስርጭት)',
    core_activity: 'Micro-Enterprise Cooperative Handover',
    coordinator_name: 'Woizero Almaz Bekele',
    coordinator_phone: '+251 915 667 899',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    units_distributed: 120,
    units_functional: 115,
    male_beneficiaries: 30,
    female_beneficiaries: 290,
    married_women_beneficiaries: 240,
    youth_participants: 80,
    investors_beneficiaries: 2,
    tech_status: 'Fully Operational',
    tech_notes: 'Handed over fuel-efficient cookstoves to women micro-enterprises, saving firewood collection time and forest degradation.',
    zone: 'South Gondar',
    woreda: 'Fogera',
    kebele: 'Woreta Zuria'
  },
  {
    id: '3',
    tech_code: 'LST-2018-WG-02',
    tech_title: 'Alefa Household Water Ponds & Threshing Units (2018 E.C.)',
    tech_category: 'Water Harvesting & Household Ponds (የዝናብ ውሃ ማጠራቀሚያ ገንዳ)',
    core_activity: 'Maintenance & Repair Skill Training',
    coordinator_name: 'Ato Getachew Mekonnen',
    coordinator_phone: '+251 913 990 112',
    fiscal_year: '2018 E.C.',
    season: 'Bega / Irrigation (መስኖ/በጋ)',
    units_distributed: 40,
    units_functional: 38,
    male_beneficiaries: 15,
    female_beneficiaries: 95,
    married_women_participants: 80,
    youth_participants: 30,
    investors_participants: 1,
    tech_status: 'Active Monitoring',
    tech_notes: 'Installed lined household water harvesting ponds and trained women groups in pump upkeep.',
    zone: 'West Gojjam',
    woreda: 'Bure',
    kebele: 'Alefa'
  }
];

function AppropriateTechnologiesContent() {
  const { message } = App.useApp();

  const [techRecords, setTechRecords] = useState(INITIAL_TECHNOLOGIES);
  const [isFetching, setIsFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search & Filter states (Dedicated Fiscal Year Impact Focus)
  const [searchTerm, setSearchTerm] = useState('');
  const [fiscalYearImpactFilter, setFiscalYearImpactFilter] = useState('2019 E.C.');
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [activityFilter, setActivityFilter] = useState(null);
  const [seasonFilter, setSeasonFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [zoneFilter, setZoneFilter] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTech, setEditingTech] = useState(null);
  const [selectedTech, setSelectedTech] = useState(null);
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
      if (editingTech) {
        const initForm = async () => {
          const zoneMatch = zones.find(
            (z) => z.name === editingTech.zone || z.id === editingTech.zone_id
          );
          if (zoneMatch) {
            try {
              const wRes = locationApi?.getWoredas ? await locationApi.getWoredas(zoneMatch.id) : null;
              const wList = wRes?.data?.data?.data || wRes?.data?.data || [];
              setWoredas(wList);

              const woredaMatch = wList.find(
                (w) => w.name === editingTech.woreda || w.id === editingTech.woreda_id
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
            tech_code: editingTech.tech_code,
            tech_title: editingTech.tech_title,
            tech_category: editingTech.tech_category,
            core_activity: editingTech.core_activity,
            coordinator_name: editingTech.coordinator_name,
            coordinator_phone: editingTech.coordinator_phone,
            fiscal_year: editingTech.fiscal_year || '2019 E.C.',
            season: editingTech.season || 'Meher (መኸር)',
            units_distributed: Number(editingTech.units_distributed) || 10,
            units_functional: Number(editingTech.units_functional) || 10,
            male_beneficiaries: Number(editingTech.male_beneficiaries) || 0,
            female_beneficiaries: Number(editingTech.female_beneficiaries) || 0,
            married_women_beneficiaries: Number(editingTech.married_women_beneficiaries) || 0,
            youth_beneficiaries: Number(editingTech.youth_beneficiaries || editingTech.youth_participants) || 0,
            investors_beneficiaries: Number(editingTech.investors_beneficiaries) || 0,
            tech_notes: editingTech.tech_notes,
            zone_id: editingTech.zone_id || zoneMatch?.id || editingTech.zone,
            woreda_id: editingTech.woreda_id || editingTech.woreda,
            kebele_id: editingTech.kebele_id || editingTech.kebele
          });
        };
        initForm();
      } else {
        form.resetFields();
        form.setFieldsValue({
          tech_category: 'Solar Water Pumping & Drip Irrigation Kit (ሶላር ውሃ ማውጫና ጠብታ መስኖ)',
          core_activity: 'Technology Demonstration & Field Drill',
          fiscal_year: fiscalYearImpactFilter || '2019 E.C.',
          season: 'Meher (መኸር)',
          units_distributed: 15,
          units_functional: 15,
          male_beneficiaries: 15,
          female_beneficiaries: 85,
          married_women_beneficiaries: 70,
          youth_beneficiaries: 25,
          investors_beneficiaries: 2
        });
        setWoredas([]);
        setKebeles([]);
      }
    }
  }, [isModalOpen, editingTech, form, zones, fiscalYearImpactFilter]);

  const loadData = async () => {
    setIsFetching(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      message.success('Appropriate technologies registry refreshed');
    } catch {
      message.error('Failed to refresh data');
    } finally {
      setIsFetching(false);
    }
  };

  // Direct In-Place Status Update without Opening the Form
  const handleQuickStatusChange = (recordId, newStatus) => {
    setTechRecords((prev) =>
      prev.map((t) => (t.id === recordId ? { ...t, tech_status: newStatus } : t))
    );
    message.success(`Technology status updated to "${newStatus}"`);
  };

  // Filter pipeline (includes explicit fiscal year impact selection)
  const filteredTechRecords = useMemo(() => {
    return techRecords.filter((t) => {
      const code = extractName(t.tech_code).toLowerCase();
      const title = extractName(t.tech_title).toLowerCase();
      const coord = extractName(t.coordinator_name).toLowerCase();
      const kebele = extractName(t.kebele).toLowerCase();
      const woreda = extractName(t.woreda).toLowerCase();
      const zone = extractName(t.zone).toLowerCase();
      const q = searchTerm.toLowerCase();

      const matchesSearch =
        code.includes(q) || title.includes(q) || coord.includes(q) || kebele.includes(q) || woreda.includes(q) || zone.includes(q);
      const matchesFY = fiscalYearImpactFilter ? t.fiscal_year === fiscalYearImpactFilter : true;
      const matchesCategory = categoryFilter ? t.tech_category === categoryFilter : true;
      const matchesActivity = activityFilter ? t.core_activity === activityFilter : true;
      const matchesSeason = seasonFilter ? t.season === seasonFilter : true;
      const matchesStatus = statusFilter ? t.tech_status === statusFilter : true;
      const matchesZone = zoneFilter ? zone === zoneFilter.toLowerCase() : true;

      return matchesSearch && matchesFY && matchesCategory && matchesActivity && matchesSeason && matchesStatus && matchesZone;
    });
  }, [techRecords, searchTerm, fiscalYearImpactFilter, categoryFilter, activityFilter, seasonFilter, statusFilter, zoneFilter]);

  // Statistics Calculation for Selected Fiscal Year Impact
  const stats = useMemo(() => {
    const totalPrograms = filteredTechRecords.length;
    const totalUnits = filteredTechRecords.reduce((acc, t) => acc + (Number(t.units_distributed) || 0), 0);
    const totalFunctional = filteredTechRecords.reduce((acc, t) => acc + (Number(t.units_functional) || 0), 0);
    const maleBeneficiaries = filteredTechRecords.reduce((acc, t) => acc + (Number(t.male_beneficiaries) || 0), 0);
    const femaleBeneficiaries = filteredTechRecords.reduce((acc, t) => acc + (Number(t.female_beneficiaries) || 0), 0);
    const marriedWomen = filteredTechRecords.reduce((acc, t) => acc + (Number(t.married_women_beneficiaries) || 0), 0);
    const youth = filteredTechRecords.reduce((acc, t) => acc + (Number(t.youth_beneficiaries || t.youth_participants) || 0), 0);
    const investors = filteredTechRecords.reduce((acc, t) => acc + (Number(t.investors_beneficiaries) || 0), 0);

    const totalParticipants = maleBeneficiaries + femaleBeneficiaries + marriedWomen + youth + investors;
    const totalWomenBeneficiaries = femaleBeneficiaries + marriedWomen;
    const womenRatio = totalParticipants > 0 ? ((totalWomenBeneficiaries / totalParticipants) * 100).toFixed(1) : 0;
    const operationalCount = filteredTechRecords.filter((t) => t.tech_status === 'Fully Operational').length;

    return {
      totalPrograms,
      totalUnits,
      totalFunctional,
      totalParticipants,
      maleBeneficiaries,
      femaleBeneficiaries,
      marriedWomen,
      totalWomenBeneficiaries,
      youth,
      investors,
      womenRatio,
      operationalCount
    };
  }, [filteredTechRecords]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setCategoryFilter(null);
    setActivityFilter(null);
    setSeasonFilter(null);
    setStatusFilter(null);
    setZoneFilter(null);
  };

  const handleOpenModal = (record = null) => {
    setEditingTech(record);
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
        fiscal_year: values.fiscal_year || fiscalYearImpactFilter || '2019 E.C.',
        zone: selectedZone?.name || selectedZone?.zone_name || values.zone_id,
        woreda: selectedWoreda?.name || selectedWoreda?.woreda_name || values.woreda_id,
        kebele: selectedKebele?.name || selectedKebele?.kebele_name || values.kebele_id
      };

      if (editingTech) {
        setTechRecords((prev) =>
          prev.map((item) =>
            item.id === editingTech.id ? { ...item, ...payload, tech_status: editingTech.tech_status } : item
          )
        );
        message.success('Appropriate technology record updated successfully');
      } else {
        const newRecord = {
          ...payload,
          id: Date.now().toString(),
          tech_code: values.tech_code || `LST-${Date.now().toString().slice(-4)}`,
          tech_status: 'Fully Operational'
        };
        setTechRecords((prev) => [newRecord, ...prev]);
        message.success('New appropriate technology record registered successfully');
      }
      setIsModalOpen(false);
    } catch (error) {
      message.error(error?.response?.data?.message || error.message || 'Failed to save technology record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    setTechRecords((prev) => prev.filter((item) => item.id !== id));
    message.success('Appropriate technology record removed');
  };

  const exportToCSV = () => {
    if (!filteredTechRecords.length) {
      message.warning('No technology records available to export');
      return;
    }
    const headers = [
      'Tech Code,Title,Category,Core Activity,Units Distributed,Units Functional,Coordinator,Phone,FY,Season,Zone,Woreda,Kebele,Male (ወንድ),Female (ሴት),Married Women (ባለትዳር),Youth (ወጣቶች),Investors (ባለሃብቶች),Total Beneficiaries,Status'
    ];
    const rows = filteredTechRecords.map((t) => {
      const total =
        (Number(t.male_beneficiaries) || 0) +
        (Number(t.female_beneficiaries) || 0) +
        (Number(t.married_women_beneficiaries) || 0) +
        (Number(t.youth_beneficiaries || t.youth_participants) || 0) +
        (Number(t.investors_beneficiaries) || 0);

      return [
        `"${t.tech_code || ''}"`,
        `"${t.tech_title || ''}"`,
        `"${t.tech_category || ''}"`,
        `"${t.core_activity || ''}"`,
        t.units_distributed || 0,
        t.units_functional || 0,
        `"${t.coordinator_name || ''}"`,
        `"${t.coordinator_phone || ''}"`,
        `"${t.fiscal_year || ''}"`,
        `"${t.season || ''}"`,
        `"${extractName(t.zone)}"`,
        `"${extractName(t.woreda)}"`,
        `"${extractName(t.kebele)}"`,
        t.male_beneficiaries || 0,
        t.female_beneficiaries || 0,
        t.married_women_beneficiaries || 0,
        t.youth_beneficiaries || t.youth_participants || 0,
        t.investors_beneficiaries || 0,
        total,
        `"${t.tech_status || ''}"`
      ].join(',');
    });

    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Appropriate_Technologies_FY_${fiscalYearImpactFilter.replace(/\s+/g, '_')}_${Date.now()}.csv`;
    a.click();
    message.success(`Appropriate technology report for ${fiscalYearImpactFilter} exported successfully`);
  };

  const columns = [
    {
      title: 'Tech Code & Title',
      key: 'tech_info',
      width: 250,
      render: (_, r) => (
        <div>
          <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{r.tech_title}</strong>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>
            Code: <span style={{ fontFamily: 'monospace' }}>{r.tech_code}</span> | Units: {r.units_distributed}
          </div>
        </div>
      )
    },
    {
      title: 'Technology Category',
      dataIndex: 'tech_category',
      key: 'tech_category',
      width: 210,
      render: (cat) => {
        let color = 'default';
        if (cat?.includes('Solar')) color = 'gold';
        if (cat?.includes('Stove')) color = 'green';
        if (cat?.includes('Grain Mill')) color = 'blue';
        if (cat?.includes('Water Harvesting')) color = 'cyan';
        return <Tag color={color}>{cat}</Tag>;
      }
    },
    {
      title: 'Core Activity',
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
          <Tooltip title={`${extractName(r.zone)} &gt; ${extractName(r.woreda)}`}>
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
      title: 'Beneficiaries Enrolled',
      key: 'beneficiaries_breakdown',
      width: 230,
      render: (_, r) => {
        const total =
          (Number(r.male_beneficiaries) || 0) +
          (Number(r.female_beneficiaries) || 0) +
          (Number(r.married_women_beneficiaries) || 0) +
          (Number(r.youth_beneficiaries || r.youth_participants) || 0) +
          (Number(r.investors_beneficiaries) || 0);

        return (
          <div style={{ fontSize: 11 }}>
            <div>
              Total: <strong style={{ color: '#1a5f2c' }}>{total.toLocaleString()} Beneficiaries</strong>
            </div>
            <div style={{ color: '#8c8c8c' }}>
              <span>ወንድ: {r.male_beneficiaries || 0}</span> | <span>ሴት: {r.female_beneficiaries || 0}</span> | <span>ባለትዳር: {r.married_women_beneficiaries || 0}</span>
            </div>
          </div>
        );
      }
    },
    {
      title: 'Technology Status (In-Place Edit)',
      dataIndex: 'tech_status',
      key: 'tech_status',
      width: 190,
      render: (status, record) => (
        <Select
          value={status || 'Fully Operational'}
          onChange={(newVal) => handleQuickStatusChange(record.id, newVal)}
          style={{ width: '100%' }}
          size="small"
        >
          <Option value="Fully Operational">
            <Tag color="success" icon={<CheckCircleOutlined />} style={{ margin: 0 }}>
              Operational
            </Tag>
          </Option>
          <Option value="Active Monitoring">
            <Tag color="processing" icon={<ClockCircleOutlined />} style={{ margin: 0 }}>
              Monitoring
            </Tag>
          </Option>
          <Option value="Maintenance Required">
            <Tag color="warning" icon={<ClockCircleOutlined />} style={{ margin: 0 }}>
              Maintenance
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
          <Tooltip title="View Technology Dossier">
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: '#1890ff' }} />}
              onClick={() => {
                setSelectedTech(record);
                setIsDossierOpen(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Edit Record">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: '#52c41a' }} />}
              onClick={() => handleOpenModal(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Record">
            <Popconfirm
              title="Delete appropriate technology record?"
              description="Are you sure you want to remove this labor-saving technology record?"
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
        <Breadcrumb.Item>Gender & HIV</Breadcrumb.Item>
        <Breadcrumb.Item>Labor-Saving & Appropriate Technologies for Women</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#1a5f2c', fontFamily: "'Times New Roman', Times, serif" }}>
            Labor-Saving & Appropriate Technologies for Women (ለሴቶች የጉልበት ቆጣቢና ተስማሚ ቴክኖሎጂዎች)
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Coordinating solar water pumps, fuel-efficient cookstoves, portable threshing tools, and household water harvesting ponds for women cooperatives
          </Text>
        </div>
        <Space>
          {/* ───── FISCAL YEAR IMPACT SELECTOR ───── */}
          <div style={{ background: '#e6f7ed', padding: '4px 12px', borderRadius: 6, border: '1px solid #b7eb8f', display: 'flex', alignItems: 'center', gap: 8 }}>
            <CalendarOutlined style={{ color: '#1a5f2c' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#1a5f2c' }}>Fiscal Year Impact:</span>
            <Select
              value={fiscalYearImpactFilter}
              onChange={setFiscalYearImpactFilter}
              style={{ width: 130 }}
              size="small"
              bordered={false}
            >
              {FISCAL_YEARS.map((fy) => (
                <Option key={fy} value={fy}>{fy}</Option>
              ))}
            </Select>
          </div>
          <Button icon={<ReloadOutlined />} onClick={loadData} loading={isFetching}>
            Refresh
          </Button>
        </Space>
      </div>

      {/* KPI Dashboard for Selected Fiscal Year Impact */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #1a5f2c', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Total Programs ({fiscalYearImpactFilter})</span>}
              value={stats.totalPrograms}
              prefix={<FilterOutlined style={{ color: '#1a5f2c', marginRight: 8 }} />}
              valueStyle={{ color: '#1a5f2c', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Distributed Units: <strong style={{ color: '#262626' }}>{stats.totalUnits} items</strong>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #1890ff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Youth Beneficiaries ({fiscalYearImpactFilter})</span>}
              value={stats.youth}
              prefix={<RiseOutlined style={{ color: '#1890ff', marginRight: 8 }} />}
              valueStyle={{ color: '#1890ff', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }} >
              Male: <strong>{stats.maleBeneficiaries}</strong> | Investors: <strong>{stats.investors}</strong>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #722ed1', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Total Beneficiaries ({fiscalYearImpactFilter})</span>}
              value={stats.totalParticipants}
              prefix={<TeamOutlined style={{ color: '#722ed1', marginRight: 8 }} />}
              valueStyle={{ color: '#722ed1', fontWeight: 'bold', fontSize: 24 }}
            />
            <Progress percent={Number(stats.womenRatio)} size="small" strokeColor="#722ed1" />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8c8c8c', marginTop: 2 }}>
              <span>Women Share: <strong style={{ color: '#722ed1' }}>{stats.womenRatio}%</strong></span>
              <span>Goal: &gt; 50%</span>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #fa8c16', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Fully Operational</span>}
              value={stats.operationalCount}
              prefix={<CheckSquareOutlined style={{ color: '#fa8c16', marginRight: 8 }} />}
              valueStyle={{ color: '#fa8c16', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Target Year Impact: <strong>{fiscalYearImpactFilter}</strong>
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
                placeholder="Search Title, Code, or Coordinator..."
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: 220 }}
                allowClear
              />

              <Select
                placeholder="Technology Category"
                value={categoryFilter}
                onChange={setCategoryFilter}
                style={{ width: 195 }}
                allowClear
              >
                {TECH_CATEGORIES.map((tc) => (
                  <Option key={tc} value={tc}>{tc}</Option>
                ))}
              </Select>

              <Select
                placeholder="Core Activity"
                value={activityFilter}
                onChange={setActivityFilter}
                style={{ width: 200 }}
                allowClear
              >
                {TECH_ACTIVITIES.map((ta) => (
                  <Option key={ta} value={ta}>{ta}</Option>
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
                {[...new Set(techRecords.map((t) => extractName(t.zone)))].map((z) => (
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
                Export FY Impact CSV
              </Button>

              <Button
                icon={<ClearOutlined />}
                onClick={handleResetFilters}
                disabled={!(searchTerm || categoryFilter || activityFilter || seasonFilter || statusFilter || zoneFilter)}
              >
                Reset Filters
              </Button>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => handleOpenModal(null)}
                style={{ backgroundColor: '#1a5f2c', borderColor: '#1a5f2c', fontWeight: 600 }}
              >
                Register Technology
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Main Table */}
      <Table
        columns={columns}
        dataSource={filteredTechRecords}
        rowKey="id"
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} records for ${fiscalYearImpactFilter}`
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
              {editingTech ? 'Edit Appropriate Technology Record' : `Register Appropriate Technology (${fiscalYearImpactFilter})`}
            </span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText={editingTech ? 'Update Record' : 'Save Technology Record'}
        okButtonProps={{ style: { backgroundColor: '#1a5f2c', borderColor: '#1a5f2c' }, loading: isSubmitting }}
        width={800}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Technology Identification & Category
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="tech_code"
                label="Technology Code"
                rules={[{ required: true, message: 'Code required' }]}
              >
                <Input placeholder="e.g. LST-2019-EG-08" />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item
                name="tech_title"
                label="Technology Title / Initiative Description"
                rules={[{ required: true, message: 'Title required' }]}
              >
                <Input placeholder="e.g. Kurar Women Cooperative Solar Threshing & Water Pump" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="tech_category"
                label="Technology Category"
                rules={[{ required: true, message: 'Select category' }]}
              >
                <Select>
                  {TECH_CATEGORIES.map((tc) => (
                    <Option key={tc} value={tc}>{tc}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="core_activity"
                label="Core Initiative Activity"
                rules={[{ required: true, message: 'Select activity' }]}
              >
                <Select>
                  {TECH_ACTIVITIES.map((ta) => (
                    <Option key={ta} value={ta}>{ta}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={10}>
              <Form.Item
                name="coordinator_name"
                label="Coordinator / Gender Officer"
                rules={[{ required: true, message: 'Coordinator required' }]}
              >
                <Input placeholder="e.g. Woizero Tigist Abebe" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="coordinator_phone"
                label="Coordinator Phone Number"
                rules={[{ required: true, message: 'Phone required' }]}
              >
                <Input placeholder="+251 9..." />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="units_distributed"
                label="Units Distributed"
                rules={[{ required: true, message: 'Units required' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Timeline & Fiscal Year Selection
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
              <Form.Item name="tech_notes" label="Technology Notes & Labor Reduction Impact">
                <TextArea rows={3} placeholder="Summarize time savings, cooperative management, or equipment maintenance..." />
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

      {/* Comprehensive Technology Dossier Modal */}
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
                  {selectedTech?.tech_title}
                </span>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                  Code: <span style={{ fontFamily: 'monospace' }}>{selectedTech?.tech_code}</span> | Coordinator:{' '}
                  {selectedTech?.coordinator_name}
                </div>
              </div>
            </div>
            <div>
              <Tag
                color={selectedTech?.tech_status === 'Fully Operational' ? 'success' : 'processing'}
                icon={selectedTech?.tech_status === 'Fully Operational' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                style={{ fontSize: 12, padding: '2px 10px', borderRadius: 12 }}
              >
                {selectedTech?.tech_status || 'Operational'}
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
              handleOpenModal(selectedTech);
            }}
          >
            Edit Record
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
        {selectedTech && (
          <div style={{ paddingTop: 8 }}>
            {/* Top Metric Strip */}
            <Row gutter={12} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f6ffed', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Units Distributed</span>}
                    value={selectedTech.units_distributed || 0}
                    suffix={<span style={{ fontSize: 12 }}>Units</span>}
                    valueStyle={{ fontSize: 15, fontWeight: 'bold', color: '#1a5f2c' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f0f5ff', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Category</span>}
                    value={selectedTech.tech_category?.split(' ')[0] || 'Category'}
                    valueStyle={{ fontSize: 15, fontWeight: 'bold', color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f9f0ff', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Women Share</span>}
                    value={
                      (Number(selectedTech.male_beneficiaries) || 0) +
                      (Number(selectedTech.female_beneficiaries) || 0) +
                      (Number(selectedTech.married_women_beneficiaries) || 0) +
                      (Number(selectedTech.youth_beneficiaries || selectedTech.youth_participants) || 0) +
                      (Number(selectedTech.investors_beneficiaries) || 0) > 0
                        ? (
                            (((Number(selectedTech.female_beneficiaries) || 0) +
                              (Number(selectedTech.married_women_beneficiaries) || 0)) /
                              ((Number(selectedTech.male_beneficiaries) || 0) +
                                (Number(selectedTech.female_beneficiaries) || 0) +
                                (Number(selectedTech.married_women_beneficiaries) || 0) +
                                (Number(selectedTech.youth_beneficiaries || selectedTech.youth_participants) || 0) +
                                (Number(selectedTech.investors_beneficiaries) || 0))) *
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
                    value={selectedTech.fiscal_year}
                    valueStyle={{ fontSize: 13, fontWeight: 'bold', color: '#fa8c16' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* TABPANES */}
            <Tabs defaultActiveKey="1" type="card">
              {/* TAB 1: Technology Profile */}
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
                  <Descriptions.Item label="Technology Title" span={2}>
                    <strong style={{ color: '#1a5f2c' }}>{selectedTech.tech_title}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Technology Category">
                    <Tag color="purple">{selectedTech.tech_category}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Core Activity">
                    <Tag color="green">{selectedTech.core_activity}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Coordinator">
                    {selectedTech.coordinator_name} ({selectedTech.coordinator_phone})
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
                          {Number(selectedTech.male_beneficiaries || 0).toLocaleString()}
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
                          {Number(selectedTech.female_beneficiaries || 0).toLocaleString()}
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
                          {Number(selectedTech.married_women_beneficiaries || 0).toLocaleString()}
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
                          {Number(selectedTech.youth_beneficiaries || selectedTech.youth_participants || 0).toLocaleString()}
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
                          {Number(selectedTech.investors_beneficiaries || 0).toLocaleString()}
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
                    Technology Notes & Impact
                  </span>
                }
                key="2"
              >
                <Card size="small" bordered={false} style={{ background: '#fcfdfd', border: '1px solid #e6f7ed', borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <CheckCircleOutlined style={{ color: '#1a5f2c', fontSize: 16 }} />
                    <strong style={{ color: '#1a5f2c', fontSize: 13, textTransform: 'uppercase' }}>
                      Technology Impact & Labor Reduction (የቴክኖሎጂ ተፅዕኖ ማስታወሻ)
                    </strong>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: '#262626', lineHeight: '1.6' }}>
                    {selectedTech.tech_notes || 'Active labor-saving technology dissemination program empowering women farmers.'}
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
                    <strong>{extractName(selectedTech.zone)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Woreda">
                    <strong>{extractName(selectedTech.woreda)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Kebele Operational Base">
                    <span style={{ color: '#1a5f2c', fontWeight: 'bold' }}>
                      {extractName(selectedTech.kebele)}
                    </span>
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
                  <Descriptions.Item label="Fiscal Year (በጀት ዓመት)">
                    <Tag color="blue" icon={<CalendarOutlined />}>
                      {selectedTech.fiscal_year || '2019 E.C.'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Production Campaign Season">
                    <strong>{selectedTech.season || 'Meher (መኸር)'}</strong>
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

export default function AppropriateTechnologies() {
  return (
    <App>
      <AppropriateTechnologiesContent />
    </App>
  );
}