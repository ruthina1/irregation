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
  WomanOutlined,
  IdcardOutlined,
  PhoneOutlined,
  ManOutlined,
  RiseOutlined,
  ShopOutlined,
  CheckSquareOutlined,
  SafetyCertificateOutlined,
  SolutionOutlined,
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

const PARTICIPATION_SECTORS = [
  'Cereal & Staple Crop Production (የሰብል ማልማት ተሳትፎ)',
  'Natural Resources & Watershed Management (የተፈጥሮ ሀብትና ተፋሰስ ልማት)',
  'Horticulture & Irrigation Farming (አትክልትና መስኖ ልማት)',
  'Livestock, Forage & Dairy Enterprise (የእንስሳትና ወተት ልማት)',
  'Agri-Business & Cooperative Leadership (የንግድ ስራና ህብረት ስራ አመራር)'
];

const PARTICIPATION_ACTIVITIES = [
  'Women-Led Plot Management & Sowing',
  'Watershed Rehabilitation & Terracing Labor',
  'Irrigation Water User Association Board',
  'Input Credit & Fertilizer Revolving Fund',
  'Post-Harvest Storage & Processing Group'
];

const INITIAL_PARTICIPATION = [
  {
    id: '1',
    part_code: 'GND-2019-EG-01',
    part_title: 'Kurar Women-Led Cereal Production & Input Access Cohort',
    part_sector: 'Cereal & Staple Crop Production (የሰብል ማልማት ተሳትፎ)',
    core_activity: 'Women-Led Plot Management & Sowing',
    program_lead: 'Woizero Tigist Abebe (Gender Officer)',
    lead_phone: '+251 922 556 778',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    total_households_engaged: 340,
    male_participants: 60,
    female_participants: 280,
    married_women_participants: 220,
    youth_participants: 90,
    investors_participants: 5,
    participation_status: 'Fully Integrated',
    participation_notes: 'Empowered 280 female heads and married women with dedicated fertilizer credit lines and row-planting toolkits.',
    zone: 'East Gojjam',
    woreda: 'Dejen',
    kebele: 'Kurar'
  },
  {
    id: '2',
    part_code: 'GND-2019-SG-04',
    part_title: 'Fogera Watershed Rehabilitation & Women Labor Squad',
    part_sector: 'Natural Resources & Watershed Management (የተፈጥሮ ሀብትና ተፋሰስ ልማት)',
    core_activity: 'Watershed Rehabilitation & Terracing Labor',
    program_lead: 'Woizero Almaz Bekele',
    lead_phone: '+251 915 667 899',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    total_households_engaged: 450,
    male_participants: 120,
    female_participants: 330,
    married_women_participants: 270,
    youth_participants: 110,
    investors_participants: 2,
    participation_status: 'Fully Integrated',
    participation_notes: 'Mobilized female-led labor squads for hillside gully rehabilitation and community nursery management.',
    zone: 'South Gondar',
    woreda: 'Fogera',
    kebele: 'Woreta Zuria'
  },
  {
    id: '3',
    part_code: 'GND-2018-WG-02',
    part_title: 'Alefa Irrigated Horticulture & Women Cooperative (2018 E.C.)',
    part_sector: 'Horticulture & Irrigation Farming (አትክልትና መስኖ ልማት)',
    core_activity: 'Irrigation Water User Association Board',
    program_lead: 'Ato Getachew Mekonnen',
    lead_phone: '+251 913 990 112',
    fiscal_year: '2018 E.C.',
    season: 'Bega / Irrigation (መስኖ/በጋ)',
    total_households_engaged: 290,
    male_participants: 80,
    female_participants: 210,
    married_women_participants: 175,
    youth_participants: 75,
    investors_participants: 8,
    participation_status: 'Active Monitoring',
    participation_notes: 'Ensured 65% female representation in water user association steering committees and drip kit distribution.',
    zone: 'West Gojjam',
    woreda: 'Bure',
    kebele: 'Alefa'
  }
];

function GenderParticipationContent() {
  const { message } = App.useApp();

  const [participationRecords, setParticipationRecords] = useState(INITIAL_PARTICIPATION);
  const [isFetching, setIsFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search & Filter states (Dedicated Fiscal Year Impact Focus)
  const [searchTerm, setSearchTerm] = useState('');
  const [fiscalYearImpactFilter, setFiscalYearImpactFilter] = useState('2019 E.C.'); // Default explicit FY impact selection
  const [sectorFilter, setSectorFilter] = useState(null);
  const [activityFilter, setActivityFilter] = useState(null);
  const [seasonFilter, setSeasonFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [zoneFilter, setZoneFilter] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState(null);
  const [selectedPart, setSelectedPart] = useState(null);
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
      if (editingPart) {
        const initForm = async () => {
          const zoneMatch = zones.find(
            (z) => z.name === editingPart.zone || z.id === editingPart.zone_id
          );
          if (zoneMatch) {
            try {
              const wRes = locationApi?.getWoredas ? await locationApi.getWoredas(zoneMatch.id) : null;
              const wList = wRes?.data?.data?.data || wRes?.data?.data || [];
              setWoredas(wList);

              const woredaMatch = wList.find(
                (w) => w.name === editingPart.woreda || w.id === editingPart.woreda_id
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
            part_code: editingPart.part_code,
            part_title: editingPart.part_title,
            part_sector: editingPart.part_sector,
            core_activity: editingPart.core_activity,
            program_lead: editingPart.program_lead,
            lead_phone: editingPart.lead_phone,
            fiscal_year: editingPart.fiscal_year || '2019 E.C.',
            season: editingPart.season || 'Meher (መኸር)',
            total_households_engaged: Number(editingPart.total_households_engaged) || 200,
            male_participants: Number(editingPart.male_participants) || 0,
            female_participants: Number(editingPart.female_participants) || 0,
            married_women_participants: Number(editingPart.married_women_participants) || 0,
            youth_participants: Number(editingPart.youth_participants) || 0,
            investors_participants: Number(editingPart.investors_participants) || 0,
            part_notes: editingPart.part_notes,
            zone_id: editingPart.zone_id || zoneMatch?.id || editingPart.zone,
            woreda_id: editingPart.woreda_id || editingPart.woreda,
            kebele_id: editingPart.kebele_id || editingPart.kebele
          });
        };
        initForm();
      } else {
        form.resetFields();
        form.setFieldsValue({
          part_sector: 'Cereal & Staple Crop Production (የሰብል ማልማት ተሳትፎ)',
          core_activity: 'Women-Led Plot Management & Sowing',
          fiscal_year: fiscalYearImpactFilter || '2019 E.C.',
          season: 'Meher (መኸር)',
          total_households_engaged: 200,
          male_participants: 40,
          female_participants: 120,
          married_women_participants: 95,
          youth_participants: 45,
          investors_participants: 3
        });
        setWoredas([]);
        setKebeles([]);
      }
    }
  }, [isModalOpen, editingPart, form, zones, fiscalYearImpactFilter]);

  const loadData = async () => {
    setIsFetching(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      message.success('Gender participation registry refreshed');
    } catch {
      message.error('Failed to refresh data');
    } finally {
      setIsFetching(false);
    }
  };

  // Direct In-Place Status Update without Opening the Form
  const handleQuickStatusChange = (recordId, newStatus) => {
    setParticipationRecords((prev) =>
      prev.map((p) => (p.id === recordId ? { ...p, participation_status: newStatus } : p))
    );
    message.success(`Participation status updated to "${newStatus}"`);
  };

  // Filter pipeline (includes explicit fiscal year impact selection)
  const filteredParticipationRecords = useMemo(() => {
    return participationRecords.filter((p) => {
      const code = extractName(p.part_code).toLowerCase();
      const title = extractName(p.part_title).toLowerCase();
      const lead = extractName(p.program_lead).toLowerCase();
      const kebele = extractName(p.kebele).toLowerCase();
      const woreda = extractName(p.woreda).toLowerCase();
      const zone = extractName(p.zone).toLowerCase();
      const q = searchTerm.toLowerCase();

      const matchesSearch =
        code.includes(q) || title.includes(q) || lead.includes(q) || kebele.includes(q) || woreda.includes(q) || zone.includes(q);
      const matchesFY = fiscalYearImpactFilter ? p.fiscal_year === fiscalYearImpactFilter : true;
      const matchesSector = sectorFilter ? p.part_sector === sectorFilter : true;
      const matchesActivity = activityFilter ? p.core_activity === activityFilter : true;
      const matchesSeason = seasonFilter ? p.season === seasonFilter : true;
      const matchesStatus = statusFilter ? p.participation_status === statusFilter : true;
      const matchesZone = zoneFilter ? zone === zoneFilter.toLowerCase() : true;

      return matchesSearch && matchesFY && matchesSector && matchesActivity && matchesSeason && matchesStatus && matchesZone;
    });
  }, [participationRecords, searchTerm, fiscalYearImpactFilter, sectorFilter, activityFilter, seasonFilter, statusFilter, zoneFilter]);

  // Statistics Calculation for Selected Fiscal Year Impact
  const stats = useMemo(() => {
    const totalPrograms = filteredParticipationRecords.length;
    const totalHouseholds = filteredParticipationRecords.reduce((acc, p) => acc + (Number(p.total_households_engaged) || 0), 0);
    const maleParticipants = filteredParticipationRecords.reduce((acc, p) => acc + (Number(p.male_participants) || 0), 0);
    const femaleParticipants = filteredParticipationRecords.reduce((acc, p) => acc + (Number(p.female_participants) || 0), 0);
    const marriedWomen = filteredParticipationRecords.reduce((acc, p) => acc + (Number(p.married_women_participants) || 0), 0);
    const youth = filteredParticipationRecords.reduce((acc, p) => acc + (Number(p.youth_participants) || 0), 0);
    const investors = filteredParticipationRecords.reduce((acc, p) => acc + (Number(p.investors_participants) || 0), 0);

    const totalParticipants = maleParticipants + femaleParticipants + marriedWomen + youth + investors;
    const totalWomenParticipants = femaleParticipants + marriedWomen;
    const womenRatio = totalParticipants > 0 ? ((totalWomenParticipants / totalParticipants) * 100).toFixed(1) : 0;
    const integratedCount = filteredParticipationRecords.filter((p) => p.participation_status === 'Fully Integrated').length;

    return {
      totalPrograms,
      totalHouseholds,
      totalParticipants,
      maleParticipants,
      femaleParticipants,
      marriedWomen,
      totalWomenParticipants,
      youth,
      investors,
      womenRatio,
      integratedCount
    };
  }, [filteredParticipationRecords]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSectorFilter(null);
    setActivityFilter(null);
    setSeasonFilter(null);
    setStatusFilter(null);
    setZoneFilter(null);
  };

  const handleOpenModal = (record = null) => {
    setEditingPart(record);
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

      if (editingPart) {
        setParticipationRecords((prev) =>
          prev.map((item) =>
            item.id === editingPart.id ? { ...item, ...payload, participation_status: editingPart.participation_status } : item
          )
        );
        message.success('Gender participation record updated successfully');
      } else {
        const newRecord = {
          ...payload,
          id: Date.now().toString(),
          part_code: values.part_code || `GND-${Date.now().toString().slice(-4)}`,
          participation_status: 'Fully Integrated'
        };
        setParticipationRecords((prev) => [newRecord, ...prev]);
        message.success('New gender participation record registered successfully');
      }
      setIsModalOpen(false);
    } catch (error) {
      message.error(error?.response?.data?.message || error.message || 'Failed to save participation record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    setParticipationRecords((prev) => prev.filter((item) => item.id !== id));
    message.success('Gender participation record removed');
  };

  const exportToCSV = () => {
    if (!filteredParticipationRecords.length) {
      message.warning('No gender participation records available to export');
      return;
    }
    const headers = [
      'Part Code,Title,Sector,Core Activity,Households Engaged,Program Lead,Phone,FY,Season,Zone,Woreda,Kebele,Male (ወንድ),Female (ሴት),Married Women (ባለትዳር),Youth (ወጣቶች),Investors (ባለሃብቶች),Total Participants,Status'
    ];
    const rows = filteredParticipationRecords.map((p) => {
      const total =
        (Number(p.male_participants) || 0) +
        (Number(p.female_participants) || 0) +
        (Number(p.married_women_participants) || 0) +
        (Number(p.youth_participants) || 0) +
        (Number(p.investors_participants) || 0);

      return [
        `"${p.part_code || ''}"`,
        `"${p.part_title || ''}"`,
        `"${p.part_sector || ''}"`,
        `"${p.core_activity || ''}"`,
        p.total_households_engaged || 0,
        `"${p.program_lead || ''}"`,
        `"${p.lead_phone || ''}"`,
        `"${p.fiscal_year || ''}"`,
        `"${p.season || ''}"`,
        `"${extractName(p.zone)}"`,
        `"${extractName(p.woreda)}"`,
        `"${extractName(p.kebele)}"`,
        p.male_participants || 0,
        p.female_participants || 0,
        p.married_women_participants || 0,
        p.youth_participants || 0,
        p.investors_participants || 0,
        total,
        `"${p.participation_status || ''}"`
      ].join(',');
    });

    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Gender_Participation_FY_${fiscalYearImpactFilter.replace(/\s+/g, '_')}_${Date.now()}.csv`;
    a.click();
    message.success(`Gender impact report for ${fiscalYearImpactFilter} exported successfully`);
  };

  const columns = [
    {
      title: 'Part Code & Title',
      key: 'part_info',
      width: 250,
      render: (_, r) => (
        <div>
          <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{r.part_title}</strong>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>
            Code: <span style={{ fontFamily: 'monospace' }}>{r.part_code}</span> | HHs: {Number(r.total_households_engaged || 0).toLocaleString()}
          </div>
        </div>
      )
    },
    {
      title: 'Participation Sector',
      dataIndex: 'part_sector',
      key: 'part_sector',
      width: 210,
      render: (sec) => {
        let color = 'default';
        if (sec?.includes('Cereal')) color = 'green';
        if (sec?.includes('Natural')) color = 'gold';
        if (sec?.includes('Horticulture')) color = 'blue';
        if (sec?.includes('Livestock')) color = 'purple';
        if (sec?.includes('Agri-Business')) color = 'cyan';
        return <Tag color={color}>{sec}</Tag>;
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
      title: 'Participants Enrolled',
      key: 'participants_breakdown',
      width: 230,
      render: (_, r) => {
        const total =
          (Number(r.male_participants) || 0) +
          (Number(r.female_participants) || 0) +
          (Number(r.married_women_participants) || 0) +
          (Number(r.youth_participants) || 0) +
          (Number(r.investors_participants) || 0);

        return (
          <div style={{ fontSize: 11 }}>
            <div>
              Total: <strong style={{ color: '#1a5f2c' }}>{total.toLocaleString()} People</strong>
            </div>
            <div style={{ color: '#8c8c8c' }}>
              <span>ወንድ: {r.male_participants || 0}</span> | <span>ሴት: {r.female_participants || 0}</span> | <span>ባለትዳር: {r.married_women_participants || 0}</span>
            </div>
          </div>
        );
      }
    },
    {
      title: 'Participation Status (In-Place Edit)',
      dataIndex: 'participation_status',
      key: 'participation_status',
      width: 190,
      render: (status, record) => (
        <Select
          value={status || 'Fully Integrated'}
          onChange={(newVal) => handleQuickStatusChange(record.id, newVal)}
          style={{ width: '100%' }}
          size="small"
        >
          <Option value="Fully Integrated">
            <Tag color="success" icon={<CheckCircleOutlined />} style={{ margin: 0 }}>
              Integrated
            </Tag>
          </Option>
          <Option value="Active Monitoring">
            <Tag color="processing" icon={<ClockCircleOutlined />} style={{ margin: 0 }}>
              Monitoring
            </Tag>
          </Option>
          <Option value="Needs Support">
            <Tag color="warning" icon={<ClockCircleOutlined />} style={{ margin: 0 }}>
              Support Needed
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
          <Tooltip title="View Participation Dossier">
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: '#1890ff' }} />}
              onClick={() => {
                setSelectedPart(record);
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
              title="Delete gender participation record?"
              description="Are you sure you want to remove this participation record?"
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
        <Breadcrumb.Item>Participation across Crop, NRM & Horticulture</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#1a5f2c', fontFamily: "'Times New Roman', Times, serif" }}>
            Participation across Crop, NRM & Horticulture (በሰብል፣ ተፈጥሮ ሀብትና አትክልት ልማት የሴቶች ተሳትፎ)
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Tracking female-headed household engagement, married women leadership in water user associations, and gender-disaggregated agricultural labor
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
              Total Households: <strong style={{ color: '#262626' }}>{stats.totalHouseholds.toLocaleString()} HHs</strong>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #1890ff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Youth Participants ({fiscalYearImpactFilter})</span>}
              value={stats.youth}
              prefix={<RiseOutlined style={{ color: '#1890ff', marginRight: 8 }} />}
              valueStyle={{ color: '#1890ff', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Male: <strong>{stats.maleParticipants}</strong> | Investors: <strong>{stats.investors}</strong>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #722ed1', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Total Participants ({fiscalYearImpactFilter})</span>}
              value={stats.totalParticipants}
              prefix={<TeamOutlined style={{ color: '#722ed1', marginRight: 8 }} />}
              valueStyle={{ color: '#722ed1', fontWeight: 'bold', fontSize: 24 }}
            />
            <Progress percent={Number(stats.womenRatio)} size="small" strokeColor="#722ed1" />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8c8c8c', marginTop: 2 }}>
              <span>Women Share: <strong style={{ color: '#722ed1' }}>{stats.womenRatio}%</strong></span>
              <span>Goal: &gt; 40%</span>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #fa8c16', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Fully Integrated</span>}
              value={stats.integratedCount}
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
                placeholder="Search Title, Code, or Lead..."
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: 220 }}
                allowClear
              />

              <Select
                placeholder="Participation Sector"
                value={sectorFilter}
                onChange={setSectorFilter}
                style={{ width: 195 }}
                allowClear
              >
                {PARTICIPATION_SECTORS.map((ps) => (
                  <Option key={ps} value={ps}>{ps}</Option>
                ))}
              </Select>

              <Select
                placeholder="Core Activity"
                value={activityFilter}
                onChange={setActivityFilter}
                style={{ width: 200 }}
                allowClear
              >
                {PARTICIPATION_ACTIVITIES.map((pa) => (
                  <Option key={pa} value={pa}>{pa}</Option>
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
                {[...new Set(participationRecords.map((p) => extractName(p.zone)))].map((z) => (
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
                disabled={!(searchTerm || sectorFilter || activityFilter || seasonFilter || statusFilter || zoneFilter)}
              >
                Reset Filters
              </Button>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => handleOpenModal(null)}
                style={{ backgroundColor: '#1a5f2c', borderColor: '#1a5f2c', fontWeight: 600 }}
              >
                Register Participation
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Main Table */}
      <Table
        columns={columns}
        dataSource={filteredParticipationRecords}
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
            <WomanOutlined style={{ color: '#1a5f2c', fontSize: 20 }} />
            <span style={{ color: '#1a5f2c', fontWeight: 'bold', fontFamily: "'Times New Roman', Times, serif", fontSize: 17 }}>
              {editingPart ? 'Edit Gender Participation Record' : `Register Gender Participation (${fiscalYearImpactFilter})`}
            </span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText={editingPart ? 'Update Record' : 'Save Participation Record'}
        okButtonProps={{ style: { backgroundColor: '#1a5f2c', borderColor: '#1a5f2c' }, loading: isSubmitting }}
        width={800}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Participation Identification & Sector
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="part_code"
                label="Participation Code"
                rules={[{ required: true, message: 'Code required' }]}
              >
                <Input placeholder="e.g. GND-2019-EG-08" />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item
                name="part_title"
                label="Program Title / Cohort Description"
                rules={[{ required: true, message: 'Title required' }]}
              >
                <Input placeholder="e.g. Kurar Women-Led Cereal Production & Input Access" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="part_sector"
                label="Participation Sector"
                rules={[{ required: true, message: 'Select sector' }]}
              >
                <Select>
                  {PARTICIPATION_SECTORS.map((ps) => (
                    <Option key={ps} value={ps}>{ps}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="core_activity"
                label="Core Participation Activity"
                rules={[{ required: true, message: 'Select activity' }]}
              >
                <Select>
                  {PARTICIPATION_ACTIVITIES.map((pa) => (
                    <Option key={pa} value={pa}>{pa}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={10}>
              <Form.Item
                name="program_lead"
                label="Program Lead / Gender Officer"
                rules={[{ required: true, message: 'Lead required' }]}
              >
                <Input placeholder="e.g. Woizero Tigist Abebe" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="lead_phone"
                label="Lead Phone Number"
                rules={[{ required: true, message: 'Phone required' }]}
              >
                <Input placeholder="+251 9..." />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="total_households_engaged"
                label="Households Engaged (HHs)"
                rules={[{ required: true, message: 'HHs required' }]}
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
            Participants Enrolled by Cohort (ተሳታፊዎች በወኪል ምድብ)
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="male_participants"
                label="Male Participants (ወንድ)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="female_participants"
                label="Female Participants (ሴት)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="married_women_participants"
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
                name="youth_participants"
                label="Youth Participants (ወጣቶች)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="investors_participants"
                label="Private Investors (ባለሃብቶች)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="part_notes" label="Participation Notes & Empowerment Milestones">
                <TextArea rows={3} placeholder="Summarize female land ownership access, credit integration, or leadership representation..." />
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

      {/* Comprehensive Participation Dossier Modal */}
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
                <WomanOutlined />
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
                  {selectedPart?.part_title}
                </span>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                  Code: <span style={{ fontFamily: 'monospace' }}>{selectedPart?.part_code}</span> | Lead:{' '}
                  {selectedPart?.program_lead}
                </div>
              </div>
            </div>
            <div>
              <Tag
                color={selectedPart?.participation_status === 'Fully Integrated' ? 'success' : 'processing'}
                icon={selectedPart?.participation_status === 'Fully Integrated' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                style={{ fontSize: 12, padding: '2px 10px', borderRadius: 12 }}
              >
                {selectedPart?.participation_status || 'Integrated'}
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
              handleOpenModal(selectedPart);
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
        {selectedPart && (
          <div style={{ paddingTop: 8 }}>
            {/* Top Metric Strip */}
            <Row gutter={12} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f6ffed', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Households Engaged</span>}
                    value={selectedPart.total_households_engaged || 0}
                    suffix={<span style={{ fontSize: 12 }}>HHs</span>}
                    valueStyle={{ fontSize: 15, fontWeight: 'bold', color: '#1a5f2c' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f0f5ff', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Participation Sector</span>}
                    value={selectedPart.part_sector?.split(' ')[0] || 'Sector'}
                    valueStyle={{ fontSize: 15, fontWeight: 'bold', color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f9f0ff', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Women Share</span>}
                    value={
                      (Number(selectedPart.male_participants) || 0) +
                      (Number(selectedPart.female_participants) || 0) +
                      (Number(selectedPart.married_women_participants) || 0) +
                      (Number(selectedPart.youth_participants) || 0) +
                      (Number(selectedPart.investors_participants) || 0) > 0
                        ? (
                            (((Number(selectedPart.female_participants) || 0) +
                              (Number(selectedPart.married_women_participants) || 0)) /
                              ((Number(selectedPart.male_participants) || 0) +
                                (Number(selectedPart.female_participants) || 0) +
                                (Number(selectedPart.married_women_participants) || 0) +
                                (Number(selectedPart.youth_participants) || 0) +
                                (Number(selectedPart.investors_participants) || 0))) *
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
                    value={selectedPart.fiscal_year}
                    valueStyle={{ fontSize: 13, fontWeight: 'bold', color: '#fa8c16' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* TABPANES */}
            <Tabs defaultActiveKey="1" type="card">
              {/* TAB 1: Participation Profile */}
              <TabPane
                tab={
                  <span>
                    <TeamOutlined />
                    Participant Demographics & Reach
                  </span>
                }
                key="1"
              >
                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }} style={{ marginBottom: 16 }}>
                  <Descriptions.Item label="Program Title" span={2}>
                    <strong style={{ color: '#1a5f2c' }}>{selectedPart.part_title}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Participation Sector">
                    <Tag color="purple">{selectedPart.part_sector}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Core Activity">
                    <Tag color="green">{selectedPart.core_activity}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Program Lead">
                    {selectedPart.program_lead} ({selectedPart.lead_phone})
                  </Descriptions.Item>
                </Descriptions>

                <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: 16, background: '#fafafa' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1a5f2c', textTransform: 'uppercase', marginBottom: 12 }}>
                    Participant Disaggregation (ተሳታፊዎች በወኪል ምድብ)
                  </div>
                  <Row gutter={[16, 16]}>
                    <Col span={8}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <ManOutlined style={{ color: '#1890ff', marginRight: 4 }} />
                          Male Participants (ወንድ)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#1890ff', marginTop: 2 }}>
                          {Number(selectedPart.male_participants || 0).toLocaleString()}
                        </div>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <WomanOutlined style={{ color: '#722ed1', marginRight: 4 }} />
                          Female Participants (ሴት)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#722ed1', marginTop: 2 }}>
                          {Number(selectedPart.female_participants || 0).toLocaleString()}
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
                          {Number(selectedPart.married_women_participants || 0).toLocaleString()}
                        </div>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <RiseOutlined style={{ color: '#fa8c16', marginRight: 4 }} />
                          Youth Participants (ወጣቶች)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#fa8c16', marginTop: 2 }}>
                          {Number(selectedPart.youth_participants || 0).toLocaleString()}
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
                          {Number(selectedPart.investors_participants || 0).toLocaleString()}
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
                    Empowerment Notes & Milestones
                  </span>
                }
                key="2"
              >
                <Card size="small" bordered={false} style={{ background: '#fcfdfd', border: '1px solid #e6f7ed', borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <CheckCircleOutlined style={{ color: '#1a5f2c', fontSize: 16 }} />
                    <strong style={{ color: '#1a5f2c', fontSize: 13, textTransform: 'uppercase' }}>
                      Gender Participation & Empowerment Notes (የሴቶች ተሳትፎ ማስታወሻ)
                    </strong>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: '#262626', lineHeight: '1.6' }}>
                    {selectedPart.part_notes || 'Active gender participation program empowering women across agricultural sectors.'}
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
                    <strong>{extractName(selectedPart.zone)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Woreda">
                    <strong>{extractName(selectedPart.woreda)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Kebele Operational Base">
                    <span style={{ color: '#1a5f2c', fontWeight: 'bold' }}>
                      {extractName(selectedPart.kebele)}
                    </span>
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
                  <Descriptions.Item label="Fiscal Year (በጀት ዓመት)">
                    <Tag color="blue" icon={<CalendarOutlined />}>
                      {selectedPart.fiscal_year || '2019 E.C.'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Production Campaign Season">
                    <strong>{selectedPart.season || 'Meher (መኸር)'}</strong>
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

export default function GenderParticipation() {
  return (
    <App>
      <GenderParticipationContent />
    </App>
  );
}