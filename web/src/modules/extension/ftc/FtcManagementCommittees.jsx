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
  TeamOutlined as UsersIcon,
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

const COMMITTEE_CATEGORIES = [
  'FTC Steering & Management Committee (የማዕከል አስተዳደርና መሪ ኮሚቴ)',
  'Demonstration Plot Management Subcommittee (የማሳ ማሳያ አስተባባሪ ኮሚቴ)',
  'Asset & Inventory Control Committee (የዕቃዎችና ንብረት ቁጥጥር ኮሚቴ)',
  'Community Mobilization & Peace Committee (ህብረተሰብ ማስተባበሪያ ኮሚቴ)',
  'Financial Audit & Savings Subcommittee (የፋይናንስና ቁጠባ ኦዲት ኮሚቴ)'
];

const COMMITTEE_ACTIVITIES = [
  'FTC Operational Governance & Planning Workshop',
  'Asset Stewardship & Maintenance Training',
  'Conflict Resolution & Community Mobilization Drill',
  'Financial Recordkeeping & Audit Compliance Briefing',
  'Demonstration Plot Oversight & Harvest Coordination'
];

const INITIAL_COMMITTEES = [
  {
    id: '1',
    committee_code: 'FMC-2019-EG-01',
    committee_name: 'Kurar FTC Steering & Management Committee',
    committee_category: 'FTC Steering & Management Committee (የማዕከል አስተዳደርና መሪ ኮሚቴ)',
    core_activity: 'FTC Operational Governance & Planning Workshop',
    committee_chair: 'Ato Mulugeta Fentaw (Committee Chair)',
    chair_phone: '+251 918 445 566',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    total_members_count: 5,
    member_ids: [1, 2, 3, 4, 5],
    male_members: 3,
    female_members: 2,
    married_women_members: 2,
    youth_members: 1,
    investors_members: 0,
    committee_status: 'Active & Trained',
    committee_notes: 'Completed governance and seasonal planning workshop with 100% attendance.',
    zone: 'East Gojjam',
    woreda: 'Dejen',
    kebele: 'Kurar'
  }
];

function FtcManagementCommitteesContent() {
  const { message } = App.useApp();

  const [committees, setCommittees] = useState(INITIAL_COMMITTEES);
  const [farmersList, setFarmersList] = useState([]);
  const [loadingFarmers, setLoadingFarmers] = useState(false);

  const [isFetching, setIsFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [activityFilter, setActivityFilter] = useState(null);
  const [fiscalYearFilter, setFiscalYearFilter] = useState(null);
  const [seasonFilter, setSeasonFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [zoneFilter, setZoneFilter] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingComm, setEditingComm] = useState(null);
  const [selectedComm, setSelectedComm] = useState(null);
  const [isDossierOpen, setIsDossierOpen] = useState(false);

  // Cascading Location States (Database Fetched)
  const [zones, setZones] = useState([]);
  const [woredas, setWoredas] = useState([]);
  const [kebeles, setKebeles] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  const [form] = Form.useForm();

  // 1. Fetch Zones & Farmers List on Mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const zRes = locationApi?.getZones 
          ? await locationApi.getZones() 
          : (farmerApi?.getZones ? await farmerApi.getZones() : null);
        const zList = zRes?.data?.data?.data || zRes?.data?.data || zRes?.data || [];
        if (Array.isArray(zList) && zList.length) setZones(zList);

        setLoadingFarmers(true);
        const fRes = farmerApi?.getFarmers ? await farmerApi.getFarmers() : null;
        const fList = fRes?.data?.data?.data || fRes?.data?.data || fRes?.data || [];
        if (Array.isArray(fList)) {
          setFarmersList(fList);
        } else {
          // Fallback mock farmers list if API is missing
          setFarmersList([
            { id: 1, full_name: 'Ato Mulugeta Fentaw', phone: '+251 918 445 566', gender: 'Male' },
            { id: 2, full_name: 'Woizero Aster Melesse', phone: '+251 922 112 334', gender: 'Female' },
            { id: 3, full_name: 'Ato Tadesse Worku', phone: '+251 911 889 001', gender: 'Male' },
            { id: 4, full_name: 'Woizero Tigist Abebe', phone: '+251 913 221 133', gender: 'Female' },
            { id: 5, full_name: 'Ato Getachew Mekonnen', phone: '+251 914 556 788', gender: 'Male' },
            { id: 6, full_name: 'Woizero Almaz Bekele', phone: '+251 915 667 899', gender: 'Female' },
            { id: 7, full_name: 'Ato Dawit Kebede', phone: '+251 916 778 900', gender: 'Male' }
          ]);
        }
      } catch (err) {
        console.error('Failed to load initialization data:', err);
        setFarmersList([
          { id: 1, full_name: 'Ato Mulugeta Fentaw', phone: '+251 918 445 566', gender: 'Male' },
          { id: 2, full_name: 'Woizero Aster Melesse', phone: '+251 922 112 334', gender: 'Female' },
          { id: 3, full_name: 'Ato Tadesse Worku', phone: '+251 911 889 001', gender: 'Male' },
          { id: 4, full_name: 'Woizero Tigist Abebe', phone: '+251 913 221 133', gender: 'Female' },
          { id: 5, full_name: 'Ato Getachew Mekonnen', phone: '+251 914 556 788', gender: 'Male' }
        ]);
      } finally {
        setLoadingFarmers(false);
      }
    };
    fetchInitialData();
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
      if (editingComm) {
        const initForm = async () => {
          const zoneMatch = zones.find(
            (z) => z.name === editingComm.zone || z.id === editingComm.zone_id
          );
          if (zoneMatch) {
            try {
              const wRes = locationApi?.getWoredas ? await locationApi.getWoredas(zoneMatch.id) : null;
              const wList = wRes?.data?.data?.data || wRes?.data?.data || [];
              setWoredas(wList);

              const woredaMatch = wList.find(
                (w) => w.name === editingComm.woreda || w.id === editingComm.woreda_id
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
            committee_code: editingComm.committee_code,
            committee_name: editingComm.committee_name,
            committee_category: editingComm.committee_category,
            core_activity: editingComm.core_activity,
            committee_chair: editingComm.committee_chair,
            chair_phone: editingComm.chair_phone,
            fiscal_year: editingComm.fiscal_year || '2019 E.C.',
            season: editingComm.season || 'Meher (መኸር)',
            member_ids: editingComm.member_ids || [],
            total_members_count: Number(editingComm.total_members_count) || 5,
            male_members: Number(editingComm.male_members) || 0,
            female_members: Number(editingComm.female_members) || 0,
            married_women_members: Number(editingComm.married_women_members) || 0,
            youth_members: Number(editingComm.youth_members) || 0,
            investors_members: Number(editingComm.investors_members) || 0,
            committee_notes: editingComm.committee_notes,
            zone_id: editingComm.zone_id || zoneMatch?.id || editingComm.zone,
            woreda_id: editingComm.woreda_id || editingComm.woreda,
            kebele_id: editingComm.kebele_id || editingComm.kebele
          });
        };
        initForm();
      } else {
        form.resetFields();
        form.setFieldsValue({
          committee_category: 'FTC Steering & Management Committee (የማዕከል አስተዳደርና መሪ ኮሚቴ)',
          core_activity: 'FTC Operational Governance & Planning Workshop',
          fiscal_year: '2019 E.C.',
          season: 'Meher (መኸር)',
          member_ids: [],
          total_members_count: 5,
          male_members: 3,
          female_members: 2,
          married_women_members: 2,
          youth_members: 1,
          investors_members: 0
        });
        setWoredas([]);
        setKebeles([]);
      }
    }
  }, [isModalOpen, editingComm, form, zones]);

  // Auto-calculate total members count and breakdown when farmer selection changes
  const handleFarmerSelectionChange = (selectedIds) => {
    if (!Array.isArray(selectedIds)) return;
    const count = selectedIds.length;
    form.setFieldsValue({ total_members_count: count });
  };

  const loadData = async () => {
    setIsFetching(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      message.success('FTC management committees registry refreshed');
    } catch {
      message.error('Failed to refresh data');
    } finally {
      setIsFetching(false);
    }
  };

  // Direct In-Place Status Update without Opening the Form
  const handleQuickStatusChange = (recordId, newStatus) => {
    setCommittees((prev) =>
      prev.map((c) => (c.id === recordId ? { ...c, committee_status: newStatus } : c))
    );
    message.success(`Committee status updated to "${newStatus}"`);
  };

  // Filter pipeline
  const filteredCommittees = useMemo(() => {
    return committees.filter((c) => {
      const code = extractName(c.committee_code).toLowerCase();
      const name = extractName(c.committee_name).toLowerCase();
      const chair = extractName(c.committee_chair).toLowerCase();
      const kebele = extractName(c.kebele).toLowerCase();
      const woreda = extractName(c.woreda).toLowerCase();
      const zone = extractName(c.zone).toLowerCase();
      const q = searchTerm.toLowerCase();

      const matchesSearch =
        code.includes(q) || name.includes(q) || chair.includes(q) || kebele.includes(q) || woreda.includes(q) || zone.includes(q);
      const matchesCategory = categoryFilter ? c.committee_category === categoryFilter : true;
      const matchesActivity = activityFilter ? c.core_activity === activityFilter : true;
      const matchesFY = fiscalYearFilter ? c.fiscal_year === fiscalYearFilter : true;
      const matchesSeason = seasonFilter ? c.season === seasonFilter : true;
      const matchesStatus = statusFilter ? c.committee_status === statusFilter : true;
      const matchesZone = zoneFilter ? zone === zoneFilter.toLowerCase() : true;

      return matchesSearch && matchesCategory && matchesActivity && matchesFY && matchesSeason && matchesStatus && matchesZone;
    });
  }, [committees, searchTerm, categoryFilter, activityFilter, fiscalYearFilter, seasonFilter, statusFilter, zoneFilter]);

  // Statistics Calculation
  const stats = useMemo(() => {
    const totalCommittees = filteredCommittees.length;
    const maleMembers = filteredCommittees.reduce((acc, c) => acc + (Number(c.male_members) || 0), 0);
    const femaleMembers = filteredCommittees.reduce((acc, c) => acc + (Number(c.female_members) || 0), 0);
    const marriedWomen = filteredCommittees.reduce((acc, c) => acc + (Number(c.married_women_members) || 0), 0);
    const youth = filteredCommittees.reduce((acc, c) => acc + (Number(c.youth_members) || 0), 0);
    const investors = filteredCommittees.reduce((acc, c) => acc + (Number(c.investors_members) || 0), 0);

    const totalMembers = maleMembers + femaleMembers + marriedWomen + youth + investors;
    const totalWomenMembers = femaleMembers + marriedWomen;
    const womenRatio = totalMembers > 0 ? ((totalWomenMembers / totalMembers) * 100).toFixed(1) : 0;
    const activeCount = filteredCommittees.filter((c) => c.committee_status === 'Active & Trained').length;

    return {
      totalCommittees,
      totalMembers,
      maleMembers,
      femaleMembers,
      marriedWomen,
      totalWomenMembers,
      youth,
      investors,
      womenRatio,
      activeCount
    };
  }, [filteredCommittees]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setCategoryFilter(null);
    setActivityFilter(null);
    setFiscalYearFilter(null);
    setSeasonFilter(null);
    setStatusFilter(null);
    setZoneFilter(null);
  };

  const handleOpenModal = (record = null) => {
    setEditingComm(record);
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

      if (editingComm) {
        setCommittees((prev) =>
          prev.map((item) =>
            item.id === editingComm.id ? { ...item, ...payload, committee_status: editingComm.committee_status } : item
          )
        );
        message.success('FTC management committee record updated successfully');
      } else {
        const newRecord = {
          ...payload,
          id: Date.now().toString(),
          committee_code: values.committee_code || `FMC-${Date.now().toString().slice(-4)}`,
          committee_status: 'Active & Trained'
        };
        setCommittees((prev) => [newRecord, ...prev]);
        message.success('New FTC management committee registered successfully');
      }
      setIsModalOpen(false);
    } catch (error) {
      message.error(error?.response?.data?.message || error.message || 'Failed to save committee record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    setCommittees((prev) => prev.filter((item) => item.id !== id));
    message.success('FTC management committee removed');
  };

  const exportToCSV = () => {
    if (!filteredCommittees.length) {
      message.warning('No committee records available to export');
      return;
    }
    const headers = [
      'Committee Code,Committee Name,Category,Core Activity,Chair,Phone,FY,Season,Zone,Woreda,Kebele,Male (ወንድ),Female (ሴት),Married Women (ባለትዳር),Youth (ወጣቶች),Investors (ባለሃብቶች),Total Members,Status'
    ];
    const rows = filteredCommittees.map((c) => {
      const total =
        (Number(c.male_members) || 0) +
        (Number(c.female_members) || 0) +
        (Number(c.married_women_members) || 0) +
        (Number(c.youth_members) || 0) +
        (Number(c.investors_members) || 0);

      return [
        `"${c.committee_code || ''}"`,
        `"${c.committee_name || ''}"`,
        `"${c.committee_category || ''}"`,
        `"${c.core_activity || ''}"`,
        `"${c.committee_chair || ''}"`,
        `"${c.chair_phone || ''}"`,
        `"${c.fiscal_year || ''}"`,
        `"${c.season || ''}"`,
        `"${extractName(c.zone)}"`,
        `"${extractName(c.woreda)}"`,
        `"${extractName(c.kebele)}"`,
        c.male_members || 0,
        c.female_members || 0,
        c.married_women_members || 0,
        c.youth_members || 0,
        c.investors_members || 0,
        total,
        `"${c.committee_status || ''}"`
      ].join(',');
    });

    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FTC_Management_Committees_${Date.now()}.csv`;
    a.click();
    message.success('FTC management committees report exported successfully');
  };

  const columns = [
    {
      title: 'Committee Code & Name',
      key: 'committee_info',
      width: 250,
      render: (_, r) => (
        <div>
          <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{r.committee_name}</strong>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>
            Code: <span style={{ fontFamily: 'monospace' }}>{r.committee_code}</span> | Chair: {r.committee_chair}
          </div>
        </div>
      )
    },
    {
      title: 'Committee Category',
      dataIndex: 'committee_category',
      key: 'committee_category',
      width: 210,
      render: (cat) => {
        let color = 'default';
        if (cat?.includes('Steering')) color = 'green';
        if (cat?.includes('Demonstration')) color = 'blue';
        if (cat?.includes('Asset')) color = 'gold';
        if (cat?.includes('Community')) color = 'purple';
        if (cat?.includes('Financial')) color = 'cyan';
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
      title: 'Members Enrolled',
      key: 'members_breakdown',
      width: 230,
      render: (_, r) => {
        const total =
          (Number(r.male_members) || 0) +
          (Number(r.female_members) || 0) +
          (Number(r.married_women_members) || 0) +
          (Number(r.youth_members) || 0) +
          (Number(r.investors_members) || 0);

        return (
          <div style={{ fontSize: 11 }}>
            <div>
              Total: <strong style={{ color: '#1a5f2c' }}>{total.toLocaleString()} Members</strong>
            </div>
            <div style={{ color: '#8c8c8c' }}>
              <span>ወንድ: {r.male_members || 0}</span> | <span>ሴት: {r.female_members || 0}</span> | <span>ባለትዳር: {r.married_women_members || 0}</span>
            </div>
          </div>
        );
      }
    },
    {
      title: 'Committee Status (In-Place Edit)',
      dataIndex: 'committee_status',
      key: 'committee_status',
      width: 190,
      render: (status, record) => (
        <Select
          value={status || 'Active & Trained'}
          onChange={(newVal) => handleQuickStatusChange(record.id, newVal)}
          style={{ width: '100%' }}
          size="small"
        >
          <Option value="Active & Trained">
            <Tag color="success" icon={<CheckCircleOutlined />} style={{ margin: 0 }}>
              Active
            </Tag>
          </Option>
          <Option value="Refresher Due">
            <Tag color="warning" icon={<ClockCircleOutlined />} style={{ margin: 0 }}>
              Refresher Due
            </Tag>
          </Option>
          <Option value="Inactive">
            <Tag color="default" icon={<ClockCircleOutlined />} style={{ margin: 0 }}>
              Inactive
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
          <Tooltip title="View Committee Dossier">
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: '#1890ff' }} />}
              onClick={() => {
                setSelectedComm(record);
                setIsDossierOpen(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Edit Committee">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: '#52c41a' }} />}
              onClick={() => handleOpenModal(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Record">
            <Popconfirm
              title="Delete management committee record?"
              description="Are you sure you want to remove this FTC committee?"
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
        <Breadcrumb.Item>FTC Management Committees Training</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#1a5f2c', fontFamily: "'Times New Roman', Times, serif" }}>
            FTC Management Committees Training (የአርሶ አደር ማሰልጠኛ ማዕከላት አስተዳደር ኮሚቴዎች ስልጠና)
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Coordinating governance training, operational planning workshops, and capacity building for FTC steering and management committees
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
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Total Committee Members</span>}
              value={stats.totalMembers}
              prefix={<UsersIcon style={{ color: '#1a5f2c', marginRight: 8 }} />}
              valueStyle={{ color: '#1a5f2c', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Total Committees: <strong style={{ color: '#262626' }}>{stats.totalCommittees} committees</strong>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #1890ff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Male Members (ወንድ)</span>}
              value={stats.maleMembers}
              prefix={<ManOutlined style={{ color: '#1890ff', marginRight: 8 }} />}
              valueStyle={{ color: '#1890ff', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Male participants in FTC committees
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #722ed1', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Women Members (ሴት + ባለትዳር)</span>}
              value={stats.totalWomenMembers}
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
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Active & Trained</span>}
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
                placeholder="Search Name, Code, or Chair..."
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: 220 }}
                allowClear
              />

              <Select
                placeholder="Committee Category"
                value={categoryFilter}
                onChange={setCategoryFilter}
                style={{ width: 195 }}
                allowClear
              >
                {COMMITTEE_CATEGORIES.map((cc) => (
                  <Option key={cc} value={cc}>{cc}</Option>
                ))}
              </Select>

              <Select
                placeholder="Core Activity"
                value={activityFilter}
                onChange={setActivityFilter}
                style={{ width: 200 }}
                allowClear
              >
                {COMMITTEE_ACTIVITIES.map((ca) => (
                  <Option key={ca} value={ca}>{ca}</Option>
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
                {[...new Set(committees.map((c) => extractName(c.zone)))].map((z) => (
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
                Export Committee CSV
              </Button>

              <Button
                icon={<ClearOutlined />}
                onClick={handleResetFilters}
                disabled={!(searchTerm || categoryFilter || activityFilter || fiscalYearFilter || seasonFilter || statusFilter || zoneFilter)}
              >
                Reset Filters
              </Button>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => handleOpenModal(null)}
                style={{ backgroundColor: '#1a5f2c', borderColor: '#1a5f2c', fontWeight: 600 }}
              >
                Register Committee
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Main Table */}
      <Table
        columns={columns}
        dataSource={filteredCommittees}
        rowKey="id"
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} FTC management committees`
        }}
        scroll={{ x: 1350 }}
        bordered
        size="middle"
      />

      {/* Registration / Edit Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <UsersIcon style={{ color: '#1a5f2c', fontSize: 20 }} />
            <span style={{ color: '#1a5f2c', fontWeight: 'bold', fontFamily: "'Times New Roman', Times, serif", fontSize: 17 }}>
              {editingComm ? 'Edit FTC Committee Record' : 'Register FTC Management Committee (ማዕከል አስተዳደር ኮሚቴ ምዝገባ)'}
            </span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText={editingComm ? 'Update Committee' : 'Save Committee Record'}
        okButtonProps={{ style: { backgroundColor: '#1a5f2c', borderColor: '#1a5f2c' }, loading: isSubmitting }}
        width={850}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Committee Identification & Category
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="committee_code"
                label="Committee Code"
                rules={[{ required: true, message: 'Code required' }]}
              >
                <Input placeholder="e.g. FMC-2019-EG-08" />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item
                name="committee_name"
                label="Committee Name / Designation"
                rules={[{ required: true, message: 'Name required' }]}
              >
                <Input placeholder="e.g. Kurar FTC Steering & Management Committee" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="committee_category"
                label="Committee Category"
                rules={[{ required: true, message: 'Select category' }]}
              >
                <Select>
                  {COMMITTEE_CATEGORIES.map((cc) => (
                    <Option key={cc} value={cc}>{cc}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="core_activity"
                label="Core Training / Governance Activity"
                rules={[{ required: true, message: 'Select activity' }]}
              >
                <Select>
                  {COMMITTEE_ACTIVITIES.map((ca) => (
                    <Option key={ca} value={ca}>{ca}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* ───── SELECT MEMBERS FROM FARMERS LIST ───── */}
          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Select Committee Members from Registered Farmers List (ከአርሶ አደሮች ዝርዝር አባላትን ይምረጡ)
          </Divider>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="member_ids"
                label="Select Farmers (e.g. Select 5 Members)"
                rules={[{ required: true, message: 'Please select at least one member' }]}
              >
                <Select
                  mode="multiple"
                  placeholder={loadingFarmers ? "Loading registered farmers..." : "Search and select farmers for committee..."}
                  loading={loadingFarmers}
                  optionFilterProp="children"
                  onChange={handleFarmerSelectionChange}
                  style={{ width: '100%' }}
                >
                  {farmersList.map((f) => (
                    <Option key={f.id} value={f.id}>
                      {f.full_name} ({f.phone || 'No Phone'} - {f.gender || 'Farmer'})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={10}>
              <Form.Item
                name="committee_chair"
                label="Committee Chair / Coordinator"
                rules={[{ required: true, message: 'Chair required' }]}
              >
                <Input placeholder="e.g. Ato Mulugeta Fentaw" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="chair_phone"
                label="Chair Phone Number"
                rules={[{ required: true, message: 'Phone required' }]}
              >
                <Input placeholder="+251 9..." />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="total_members_count"
                label="Total Members Count"
                rules={[{ required: true, message: 'Count required' }]}
              >
                <InputNumber min={1} max={50} style={{ width: '100%' }} />
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
            Members Enrolled by Cohort (አባላት በወኪል ምድብ)
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="male_members"
                label="Male Members (ወንድ)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="female_members"
                label="Female Members (ሴት)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="married_women_members"
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
                name="youth_members"
                label="Youth Members (ወጣቶች)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="investors_members"
                label="Private Investors (ባለሃብቶች)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="committee_notes" label="Committee Training Notes & Governance Goals">
                <TextArea rows={3} placeholder="Summarize governance workshops, management decisions, or seasonal coordination objectives..." />
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

      {/* Comprehensive Committee Dossier Modal */}
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
                <UsersIcon />
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
                  {selectedComm?.committee_name}
                </span>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                  Code: <span style={{ fontFamily: 'monospace' }}>{selectedComm?.committee_code}</span> | Chair:{' '}
                  {selectedComm?.committee_chair}
                </div>
              </div>
            </div>
            <div>
              <Tag
                color={selectedComm?.committee_status === 'Active & Trained' ? 'success' : 'warning'}
                icon={selectedComm?.committee_status === 'Active & Trained' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                style={{ fontSize: 12, padding: '2px 10px', borderRadius: 12 }}
              >
                {selectedComm?.committee_status || 'Active'}
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
              handleOpenModal(selectedComm);
            }}
          >
            Edit Committee
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
        {selectedComm && (
          <div style={{ paddingTop: 8 }}>
            {/* Top Metric Strip */}
            <Row gutter={12} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f6ffed', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Total Members</span>}
                    value={
                      (Number(selectedComm.male_members) || 0) +
                      (Number(selectedComm.female_members) || 0) +
                      (Number(selectedComm.married_women_members) || 0) +
                      (Number(selectedComm.youth_members) || 0) +
                      (Number(selectedComm.investors_members) || 0)
                    }
                    suffix={<span style={{ fontSize: 12 }}>People</span>}
                    valueStyle={{ fontSize: 15, fontWeight: 'bold', color: '#1a5f2c' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f0f5ff', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Category</span>}
                    value={selectedComm.committee_category?.split(' ')[0] || 'Category'}
                    valueStyle={{ fontSize: 15, fontWeight: 'bold', color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f9f0ff', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Women Share</span>}
                    value={
                      (Number(selectedComm.male_members) || 0) +
                      (Number(selectedComm.female_members) || 0) +
                      (Number(selectedComm.married_women_members) || 0) +
                      (Number(selectedComm.youth_members) || 0) +
                      (Number(selectedComm.investors_members) || 0) > 0
                        ? (
                            (((Number(selectedComm.female_members) || 0) +
                              (Number(selectedComm.married_women_members) || 0)) /
                              ((Number(selectedComm.male_members) || 0) +
                                (Number(selectedComm.female_members) || 0) +
                                (Number(selectedComm.married_women_members) || 0) +
                                (Number(selectedComm.youth_members) || 0) +
                                (Number(selectedComm.investors_members) || 0))) *
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
                    value={selectedComm.fiscal_year}
                    valueStyle={{ fontSize: 13, fontWeight: 'bold', color: '#fa8c16' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* TABPANES */}
            <Tabs defaultActiveKey="1" type="card">
              {/* TAB 1: Committee Profile */}
              <TabPane
                tab={
                  <span>
                    <TeamOutlined />
                    Member Demographics & Reach
                  </span>
                }
                key="1"
              >
                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }} style={{ marginBottom: 16 }}>
                  <Descriptions.Item label="Committee Name" span={2}>
                    <strong style={{ color: '#1a5f2c' }}>{selectedComm.committee_name}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Committee Category">
                    <Tag color="purple">{selectedComm.committee_category}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Core Activity">
                    <Tag color="green">{selectedComm.core_activity}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Committee Chair">
                    {selectedComm.committee_chair} ({selectedComm.chair_phone})
                  </Descriptions.Item>
                  {selectedComm.member_ids && selectedComm.member_ids.length > 0 && (
                    <Descriptions.Item label="Selected Farmer Members" span={2}>
                      <Space wrap>
                        {selectedComm.member_ids.map((mId) => {
                          const fObj = farmersList.find((f) => f.id === mId);
                          return (
                            <Tag key={mId} color="cyan">
                              {fObj ? `${fObj.full_name} (${fObj.phone || 'No Phone'})` : `Farmer ID: ${mId}`}
                            </Tag>
                          );
                        })}
                      </Space>
                    </Descriptions.Item>
                  )}
                </Descriptions>

                <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: 16, background: '#fafafa' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1a5f2c', textTransform: 'uppercase', marginBottom: 12 }}>
                    Member Disaggregation (አባላት በወኪል ምድብ)
                  </div>
                  <Row gutter={[16, 16]}>
                    <Col span={8}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <ManOutlined style={{ color: '#1890ff', marginRight: 4 }} />
                          Male Members (ወንድ)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#1890ff', marginTop: 2 }}>
                          {Number(selectedComm.male_members || 0).toLocaleString()}
                        </div>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <WomanOutlined style={{ color: '#722ed1', marginRight: 4 }} />
                          Female Members (ሴት)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#722ed1', marginTop: 2 }}>
                          {Number(selectedComm.female_members || 0).toLocaleString()}
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
                          {Number(selectedComm.married_women_members || 0).toLocaleString()}
                        </div>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <RiseOutlined style={{ color: '#fa8c16', marginRight: 4 }} />
                          Youth Members (ወጣቶች)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#fa8c16', marginTop: 2 }}>
                          {Number(selectedComm.youth_members || 0).toLocaleString()}
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
                          {Number(selectedComm.investors_members || 0).toLocaleString()}
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
                    Governance Notes & Goals
                  </span>
                }
                key="2"
              >
                <Card size="small" bordered={false} style={{ background: '#fcfdfd', border: '1px solid #e6f7ed', borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <CheckCircleOutlined style={{ color: '#1a5f2c', fontSize: 16 }} />
                    <strong style={{ color: '#1a5f2c', fontSize: 13, textTransform: 'uppercase' }}>
                      Committee Governance & Goals (የኮሚቴው አስተዳደር ማስታወሻ)
                    </strong>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: '#262626', lineHeight: '1.6' }}>
                    {selectedComm.committee_notes || 'Active FTC management committee participating in operational governance and planning.'}
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
                    <strong>{extractName(selectedComm.zone)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Woreda">
                    <strong>{extractName(selectedComm.woreda)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Kebele Operational Base">
                    <span style={{ color: '#1a5f2c', fontWeight: 'bold' }}>
                      {extractName(selectedComm.kebele)}
                    </span>
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
                  <Descriptions.Item label="Fiscal Year (በጀት ዓመት)">
                    <Tag color="blue" icon={<CalendarOutlined />}>
                      {selectedComm.fiscal_year || '2019 E.C.'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Production Campaign Season">
                    <strong>{selectedComm.season || 'Meher (መኸር)'}</strong>
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

export default function FtcManagementCommittees() {
  return (
    <App>
      <FtcManagementCommitteesContent />
    </App>
  );
}