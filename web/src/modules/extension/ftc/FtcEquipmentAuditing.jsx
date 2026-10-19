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
  DatePicker,
  Switch
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
  InboxOutlined,
  IdcardOutlined,
  PhoneOutlined,
  ManOutlined,
  WomanOutlined,
  RiseOutlined,
  ShopOutlined,
  CheckSquareOutlined,
  SafetyCertificateOutlined,
  FileProtectOutlined
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

const AUDIT_CATEGORIES = [
  'Equipment Inventory & Functional Verification (የዕቃዎችና ማሽነሪዎች ብቃት ምዘና)',
  'Fixed Asset Valuation & Depreciation Audit (የቋሚ ንብረቶች ዋጋና ውድቀት ኦዲት)',
  'Input Storage & Materials Stock Audit (የግብአቶችና ቁሳቁሶች ክምችት ኦዲት)',
  'Internal Financial & Deficiency Compliance Audit (የውስጥ ፋይናንስና የሕግ ተገዢነት ኦዲት)',
  'Asset Condemnation & Write-Off Inspection (ለስራ ውጭ የሆኑ ንብረቶች ማጣሪያ)'
];

const INITIAL_AUDITS = [
  {
    id: '1',
    audit_code: 'EQA-2019-EG-01',
    audit_title: 'Kurar FTC Annual Equipment & Fixed Asset Inventory Audit',
    audit_category: 'Equipment Inventory & Functional Verification (የዕቃዎችና ማሽነሪዎች ብቃት ምዘና)',
    lead_auditor: 'Ato Getachew Mekonnen (Woreda Auditor)',
    auditor_phone: '+251 913 990 112',
    audit_date: '2026-07-20',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    total_assets_value_etb: 1450000,
    functional_assets_count: 24,
    defective_assets_count: 2,
    deficiency_found: false,
    male_officials: 15,
    female_officials: 10,
    married_women_officials: 8,
    youth_officials: 5,
    investors_officials: 1,
    audit_status: 'Audited & Verified',
    audit_findings: 'Verified 24 functional assets including solar kits and motorized water pumps. 2 knapsack sprayers require minor maintenance.',
    zone: 'East Gojjam',
    woreda: 'Dejen',
    kebele: 'Kurar'
  },
  {
    id: '2',
    audit_code: 'EQA-2019-SG-04',
    audit_title: 'Woreta Zuria FTC Internal Financial & Stock Deficiency Audit',
    audit_category: 'Internal Financial & Deficiency Compliance Audit (የውስጥ ፋይናንስና የሕግ ተገዢነት ኦዲት)',
    lead_auditor: 'Woizero Tigist Abebe',
    auditor_phone: '+251 922 556 778',
    audit_date: '2026-08-02',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    total_assets_value_etb: 980000,
    functional_assets_count: 18,
    defective_assets_count: 4,
    deficiency_found: true,
    male_officials: 12,
    female_officials: 8,
    married_women_officials: 6,
    youth_officials: 4,
    investors_officials: 0,
    audit_status: 'Deficiency Noted',
    audit_findings: 'Noted inventory discrepancies in seed stock ledger. Management action plan issued for rectification.',
    zone: 'South Gondar',
    woreda: 'Fogera',
    kebele: 'Woreta Zuria'
  },
  {
    id: '3',
    audit_code: 'EQA-2019-WG-09',
    audit_title: 'Alefa FTC Materials Stock & Fertilizer Audit',
    audit_category: 'Input Storage & Materials Stock Audit (የግብአቶችና ቁሳቁሶች ክምችት ኦዲት)',
    lead_auditor: 'Ato Mulugeta Fentaw',
    auditor_phone: '+251 918 445 566',
    audit_date: '2026-08-14',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    total_assets_value_etb: 1200000,
    functional_assets_count: 20,
    defective_assets_count: 1,
    deficiency_found: false,
    male_officials: 14,
    female_officials: 9,
    married_women_officials: 7,
    youth_officials: 6,
    investors_officials: 1,
    audit_status: 'Audited & Verified',
    audit_findings: 'Blended fertilizer bags and improved seed stock verified against distribution tallies with zero loss.',
    zone: 'West Gojjam',
    woreda: 'Bure',
    kebele: 'Alefa'
  }
];

function FtcEquipmentAuditingContent() {
  const { message } = App.useApp();

  const [audits, setAudits] = useState(INITIAL_AUDITS);
  const [isFetching, setIsFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [fiscalYearFilter, setFiscalYearFilter] = useState(null);
  const [seasonFilter, setSeasonFilter] = useState(null);
  const [zoneFilter, setZoneFilter] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAudit, setEditingAudit] = useState(null);
  const [selectedAudit, setSelectedAudit] = useState(null);
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
      if (editingAudit) {
        const initForm = async () => {
          const zoneMatch = zones.find(
            (z) => z.name === editingAudit.zone || z.id === editingAudit.zone_id
          );
          if (zoneMatch) {
            try {
              const wRes = locationApi?.getWoredas ? await locationApi.getWoredas(zoneMatch.id) : null;
              const wList = wRes?.data?.data?.data || wRes?.data?.data || [];
              setWoredas(wList);

              const woredaMatch = wList.find(
                (w) => w.name === editingAudit.woreda || w.id === editingAudit.woreda_id
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
            audit_code: editingAudit.audit_code,
            audit_title: editingAudit.audit_title,
            audit_category: editingAudit.audit_category,
            lead_auditor: editingAudit.lead_auditor,
            auditor_phone: editingAudit.auditor_phone,
            audit_date: editingAudit.audit_date ? dayjs(editingAudit.audit_date) : dayjs(),
            fiscal_year: editingAudit.fiscal_year || '2019 E.C.',
            season: editingAudit.season || 'Meher (መኸር)',
            total_assets_value_etb: Number(editingAudit.total_assets_value_etb) || 500000,
            functional_assets_count: Number(editingAudit.functional_assets_count) || 15,
            defective_assets_count: Number(editingAudit.defective_assets_count) || 1,
            deficiency_found: Boolean(editingAudit.deficiency_found),
            male_officials: Number(editingAudit.male_officials) || 0,
            female_officials: Number(editingAudit.female_officials) || 0,
            married_women_officials: Number(editingAudit.married_women_officials) || 0,
            youth_officials: Number(editingAudit.youth_officials) || 0,
            investors_officials: Number(editingAudit.investors_officials) || 0,
            audit_findings: editingAudit.audit_findings,
            zone_id: editingAudit.zone_id || zoneMatch?.id || editingAudit.zone,
            woreda_id: editingAudit.woreda_id || editingAudit.woreda,
            kebele_id: editingAudit.kebele_id || editingAudit.kebele
          });
        };
        initForm();
      } else {
        form.resetFields();
        form.setFieldsValue({
          audit_category: 'Equipment Inventory & Functional Verification (የዕቃዎችና ማሽነሪዎች ብቃት ምዘና)',
          audit_date: dayjs(),
          fiscal_year: '2019 E.C.',
          season: 'Meher (መኸር)',
          total_assets_value_etb: 1000000,
          functional_assets_count: 20,
          defective_assets_count: 2,
          deficiency_found: false,
          male_officials: 10,
          female_officials: 5,
          married_women_officials: 4,
          youth_officials: 3,
          investors_officials: 0
        });
        setWoredas([]);
        setKebeles([]);
      }
    }
  }, [isModalOpen, editingAudit, form, zones]);

  const loadData = async () => {
    setIsFetching(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      message.success('FTC equipment audit registry refreshed');
    } catch {
      message.error('Failed to refresh data');
    } finally {
      setIsFetching(false);
    }
  };

  // Direct In-Place Status Update without Opening the Form
  const handleQuickStatusChange = (recordId, newStatus) => {
    setAudits((prev) =>
      prev.map((a) => (a.id === recordId ? { ...a, audit_status: newStatus } : a))
    );
    message.success(`Audit status updated to "${newStatus}"`);
  };

  // Filter pipeline
  const filteredAudits = useMemo(() => {
    return audits.filter((a) => {
      const code = extractName(a.audit_code).toLowerCase();
      const title = extractName(a.audit_title).toLowerCase();
      const lead = extractName(a.lead_auditor).toLowerCase();
      const kebele = extractName(a.kebele).toLowerCase();
      const woreda = extractName(a.woreda).toLowerCase();
      const zone = extractName(a.zone).toLowerCase();
      const q = searchTerm.toLowerCase();

      const matchesSearch =
        code.includes(q) || title.includes(q) || lead.includes(q) || kebele.includes(q) || woreda.includes(q) || zone.includes(q);
      const matchesCategory = categoryFilter ? a.audit_category === categoryFilter : true;
      const matchesStatus = statusFilter ? a.audit_status === statusFilter : true;
      const matchesFY = fiscalYearFilter ? a.fiscal_year === fiscalYearFilter : true;
      const matchesSeason = seasonFilter ? a.season === seasonFilter : true;
      const matchesZone = zoneFilter ? zone === zoneFilter.toLowerCase() : true;

      return matchesSearch && matchesCategory && matchesStatus && matchesFY && matchesSeason && matchesZone;
    });
  }, [audits, searchTerm, categoryFilter, statusFilter, fiscalYearFilter, seasonFilter, zoneFilter]);

  // Statistics Calculation
  const stats = useMemo(() => {
    const totalAudits = filteredAudits.length;
    const totalAssetValue = filteredAudits.reduce((acc, a) => acc + (Number(a.total_assets_value_etb) || 0), 0);
    const totalFunctional = filteredAudits.reduce((acc, a) => acc + (Number(a.functional_assets_count) || 0), 0);
    const totalDefective = filteredAudits.reduce((acc, a) => acc + (Number(a.defective_assets_count) || 0), 0);
    const maleOfficials = filteredAudits.reduce((acc, a) => acc + (Number(a.male_officials) || 0), 0);
    const femaleOfficials = filteredAudits.reduce((acc, a) => acc + (Number(a.female_officials) || 0), 0);
    const marriedWomen = filteredAudits.reduce((acc, a) => acc + (Number(a.married_women_officials) || 0), 0);
    const youth = filteredAudits.reduce((acc, a) => acc + (Number(a.youth_officials) || 0), 0);
    const investors = filteredAudits.reduce((acc, a) => acc + (Number(a.investors_officials) || 0), 0);

    const totalOfficials = maleOfficials + femaleOfficials + marriedWomen + youth + investors;
    const totalWomenOfficials = femaleOfficials + marriedWomen;
    const womenRatio = totalOfficials > 0 ? ((totalWomenOfficials / totalOfficials) * 100).toFixed(1) : 0;
    const verifiedCount = filteredAudits.filter((a) => a.audit_status === 'Audited & Verified').length;

    return {
      totalAudits,
      totalAssetValue,
      totalFunctional,
      totalDefective,
      totalOfficials,
      maleOfficials,
      femaleOfficials,
      marriedWomen,
      totalWomenOfficials,
      youth,
      investors,
      womenRatio,
      verifiedCount
    };
  }, [filteredAudits]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setCategoryFilter(null);
    setStatusFilter(null);
    setFiscalYearFilter(null);
    setSeasonFilter(null);
    setZoneFilter(null);
  };

  const handleOpenModal = (record = null) => {
    setEditingAudit(record);
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
        audit_date: values.audit_date ? values.audit_date.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
        zone: selectedZone?.name || selectedZone?.zone_name || values.zone_id,
        woreda: selectedWoreda?.name || selectedWoreda?.woreda_name || values.woreda_id,
        kebele: selectedKebele?.name || selectedKebele?.kebele_name || values.kebele_id
      };

      if (editingAudit) {
        setAudits((prev) =>
          prev.map((item) =>
            item.id === editingAudit.id ? { ...item, ...payload, audit_status: editingAudit.audit_status } : item
          )
        );
        message.success('FTC equipment audit record updated successfully');
      } else {
        const newRecord = {
          ...payload,
          id: Date.now().toString(),
          audit_code: values.audit_code || `EQA-${Date.now().toString().slice(-4)}`,
          audit_status: 'Audited & Verified'
        };
        setAudits((prev) => [newRecord, ...prev]);
        message.success('New FTC equipment audit registered successfully');
      }
      setIsModalOpen(false);
    } catch (error) {
      message.error(error?.response?.data?.message || error.message || 'Failed to save audit record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    setAudits((prev) => prev.filter((item) => item.id !== id));
    message.success('FTC equipment audit record removed');
  };

  const exportToCSV = () => {
    if (!filteredAudits.length) {
      message.warning('No audit records available to export');
      return;
    }
    const headers = [
      'Audit Code,Title,Category,Total Asset Value (ETB),Functional Assets,Defective Assets,Deficiency Found,Lead Auditor,Phone,Date,FY,Season,Zone,Woreda,Kebele,Male (ወንድ),Female (ሴት),Married Women (ባለትዳር),Youth (ወጣቶች),Investors (ባለሃብቶች),Total Officials,Status'
    ];
    const rows = filteredAudits.map((a) => {
      const total =
        (Number(a.male_officials) || 0) +
        (Number(a.female_officials) || 0) +
        (Number(a.married_women_officials) || 0) +
        (Number(a.youth_officials) || 0) +
        (Number(a.investors_officials) || 0);

      return [
        `"${a.audit_code || ''}"`,
        `"${a.audit_title || ''}"`,
        `"${a.audit_category || ''}"`,
        a.total_assets_value_etb || 0,
        a.functional_assets_count || 0,
        a.defective_assets_count || 0,
        a.deficiency_found ? 'Yes' : 'No',
        `"${a.lead_auditor || ''}"`,
        `"${a.auditor_phone || ''}"`,
        `"${a.audit_date || ''}"`,
        `"${a.fiscal_year || ''}"`,
        `"${a.season || ''}"`,
        `"${extractName(a.zone)}"`,
        `"${extractName(a.woreda)}"`,
        `"${extractName(a.kebele)}"`,
        a.male_officials || 0,
        a.female_officials || 0,
        a.married_women_officials || 0,
        a.youth_officials || 0,
        a.investors_officials || 0,
        total,
        `"${a.audit_status || ''}"`
      ].join(',');
    });

    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FTC_Equipment_Materials_Audit_${Date.now()}.csv`;
    a.click();
    message.success('FTC audit report exported successfully');
  };

  const columns = [
    {
      title: 'Audit Code & Title',
      key: 'audit_info',
      width: 250,
      render: (_, r) => (
        <div>
          <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{r.audit_title}</strong>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>
            Code: <span style={{ fontFamily: 'monospace' }}>{r.audit_code}</span> | Auditor: {r.lead_auditor}
          </div>
        </div>
      )
    },
    {
      title: 'Audit Category',
      dataIndex: 'audit_category',
      key: 'audit_category',
      width: 210,
      render: (cat) => {
        let color = 'default';
        if (cat?.includes('Equipment')) color = 'green';
        if (cat?.includes('Fixed')) color = 'blue';
        if (cat?.includes('Input')) color = 'gold';
        if (cat?.includes('Internal')) color = 'purple';
        if (cat?.includes('Condemnation')) color = 'red';
        return <Tag color={color}>{cat}</Tag>;
      }
    },
    {
      title: 'Asset Valuation (ETB)',
      dataIndex: 'total_assets_value_etb',
      key: 'total_assets_value_etb',
      align: 'right',
      width: 170,
      sorter: (a, b) => (Number(a.total_assets_value_etb) || 0) - (Number(b.total_assets_value_etb) || 0),
      render: (val) => (
        <span style={{ fontWeight: 600, color: '#1a5f2c' }}>
          {Number(val || 0).toLocaleString()} ETB
        </span>
      )
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
      title: 'Assets Condition',
      key: 'assets_condition',
      width: 160,
      render: (_, r) => (
        <div style={{ fontSize: 11 }}>
          <div>
            Functional: <strong style={{ color: '#52c41a' }}>{r.functional_assets_count}</strong>
          </div>
          <div style={{ color: '#ff4d4f' }}>
            Defective: <strong>{r.defective_assets_count}</strong>
          </div>
        </div>
      )
    },
    {
      title: 'Audit Status (In-Place Edit)',
      dataIndex: 'audit_status',
      key: 'audit_status',
      width: 190,
      render: (status, record) => (
        <Select
          value={status || 'Audited & Verified'}
          onChange={(newVal) => handleQuickStatusChange(record.id, newVal)}
          style={{ width: '100%' }}
          size="small"
        >
          <Option value="Audited & Verified">
            <Tag color="success" icon={<CheckCircleOutlined />} style={{ margin: 0 }}>
              Verified
            </Tag>
          </Option>
          <Option value="Deficiency Noted">
            <Tag color="warning" icon={<ClockCircleOutlined />} style={{ margin: 0 }}>
              Deficiency
            </Tag>
          </Option>
          <Option value="Pending Audit">
            <Tag color="processing" icon={<ClockCircleOutlined />} style={{ margin: 0 }}>
              Pending
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
          <Tooltip title="View Audit Dossier">
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: '#1890ff' }} />}
              onClick={() => {
                setSelectedAudit(record);
                setIsDossierOpen(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Edit Audit">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: '#52c41a' }} />}
              onClick={() => handleOpenModal(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Record">
            <Popconfirm
              title="Delete equipment audit record?"
              description="Are you sure you want to remove this FTC audit record?"
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
        <Breadcrumb.Item>Equipment, Materials & Internal Audit</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#1a5f2c', fontFamily: "'Times New Roman', Times, serif" }}>
            Equipment, Materials & Internal Audit (የዕቃዎች፣ ማሽነሪዎችና የውስጥ ኦዲት ቁጥጥር)
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Coordinating fixed asset inventories, equipment condition verification, stock audits, and internal compliance checks across FTC stations
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
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Total Asset Valuation (ETB)</span>}
              value={stats.totalAssetValue}
              formatter={(val) => `${Number(val).toLocaleString()} ETB`}
              prefix={<InboxOutlined style={{ color: '#1a5f2c', marginRight: 8 }} />}
              valueStyle={{ color: '#1a5f2c', fontWeight: 'bold', fontSize: 20 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Total Audits: <strong style={{ color: '#262626' }}>{stats.totalAudits} stations</strong>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #52c41a', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Functional Assets Count</span>}
              value={stats.totalFunctional}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />}
              valueStyle={{ color: '#52c41a', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Defective Units: <strong style={{ color: '#ff4d4f' }}>{stats.totalDefective} items</strong>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #722ed1', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Officials & Auditors Share</span>}
              value={stats.womenRatio}
              suffix="%"
              prefix={<WomanOutlined style={{ color: '#722ed1', marginRight: 8 }} />}
              valueStyle={{ color: '#722ed1', fontWeight: 'bold', fontSize: 24 }}
            />
            <Progress percent={Number(stats.womenRatio)} size="small" strokeColor="#722ed1" />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8c8c8c', marginTop: 2 }}>
              <span>Total Officials: {stats.totalOfficials}</span>
              <span>Regional Goal: &gt; 30%</span>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #fa8c16', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Audited & Verified</span>}
              value={stats.verifiedCount}
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
                placeholder="Search Title, Code, or Auditor..."
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: 220 }}
                allowClear
              />

              <Select
                placeholder="Audit Category"
                value={categoryFilter}
                onChange={setCategoryFilter}
                style={{ width: 195 }}
                allowClear
              >
                {AUDIT_CATEGORIES.map((ac) => (
                  <Option key={ac} value={ac}>{ac}</Option>
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
                {[...new Set(audits.map((a) => extractName(a.zone)))].map((z) => (
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
                Export Audit CSV
              </Button>

              <Button
                icon={<ClearOutlined />}
                onClick={handleResetFilters}
                disabled={!(searchTerm || categoryFilter || fiscalYearFilter || seasonFilter || statusFilter || zoneFilter)}
              >
                Reset Filters
              </Button>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => handleOpenModal(null)}
                style={{ backgroundColor: '#1a5f2c', borderColor: '#1a5f2c', fontWeight: 600 }}
              >
                Register Audit
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Main Table */}
      <Table
        columns={columns}
        dataSource={filteredAudits}
        rowKey="id"
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} equipment audits`
        }}
        scroll={{ x: 1350 }}
        bordered
        size="middle"
      />

      {/* Registration / Edit Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileProtectOutlined style={{ color: '#1a5f2c', fontSize: 20 }} />
            <span style={{ color: '#1a5f2c', fontWeight: 'bold', fontFamily: "'Times New Roman', Times, serif", fontSize: 17 }}>
              {editingAudit ? 'Edit Equipment Audit Record' : 'Register Equipment & Internal Audit (የዕቃዎችና ኦዲት ምዝገባ)'}
            </span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText={editingAudit ? 'Update Audit' : 'Save Audit Record'}
        okButtonProps={{ style: { backgroundColor: '#1a5f2c', borderColor: '#1a5f2c' }, loading: isSubmitting }}
        width={800}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Audit Identification & Category
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="audit_code"
                label="Audit Code"
                rules={[{ required: true, message: 'Code required' }]}
              >
                <Input placeholder="e.g. EQA-2019-EG-08" />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item
                name="audit_title"
                label="Audit Title / Inspection Description"
                rules={[{ required: true, message: 'Title required' }]}
              >
                <Input placeholder="e.g. Kurar FTC Annual Equipment & Asset Inventory Audit" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={14}>
              <Form.Item
                name="audit_category"
                label="Audit Category"
                rules={[{ required: true, message: 'Select category' }]}
              >
                <Select>
                  {AUDIT_CATEGORIES.map((ac) => (
                    <Option key={ac} value={ac}>{ac}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item
                name="audit_date"
                label="Audit Inspection Date"
                rules={[{ required: true, message: 'Date required' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={14}>
              <Form.Item
                name="lead_auditor"
                label="Lead Auditor / Inspector Name"
                rules={[{ required: true, message: 'Auditor required' }]}
              >
                <Input placeholder="e.g. Ato Getachew Mekonnen" />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item
                name="auditor_phone"
                label="Auditor Phone Number"
                rules={[{ required: true, message: 'Phone required' }]}
              >
                <Input placeholder="+251 9..." />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Timeline & Asset Valuation (ETB)
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
                name="total_assets_value_etb"
                label="Total Asset Value (ETB)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={(value) => value.replace(/\s?|(,*)/g, '')} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="functional_assets_count"
                label="Functional Assets Count"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="defective_assets_count"
                label="Defective / Broken Count"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="deficiency_found"
                label="Deficiency Found?"
                valuePropName="checked"
                style={{ marginTop: 4 }}
              >
                <Switch checkedChildren="Yes" unCheckedChildren="No" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Officials & Auditors Enrolled by Cohort (ባለሙያዎች በወኪል ምድብ)
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="male_officials"
                label="Male Officials (ወንድ)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="female_officials"
                label="Female Officials (ሴት)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="married_women_officials"
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
                name="youth_officials"
                label="Youth Officials (ወጣቶች)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="investors_officials"
                label="Private Investors (ባለሃብቶች)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="audit_findings" label="Audit Findings & Compliance Recommendations">
                <TextArea rows={3} placeholder="Summarize inventory verification results, ledger discrepancies, or asset maintenance needs..." />
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

      {/* Comprehensive Audit Dossier Modal */}
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
                <FileProtectOutlined />
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
                  {selectedAudit?.audit_title}
                </span>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                  Code: <span style={{ fontFamily: 'monospace' }}>{selectedAudit?.audit_code}</span> | Lead Auditor:{' '}
                  {selectedAudit?.lead_auditor}
                </div>
              </div>
            </div>
            <div>
              <Tag
                color={selectedAudit?.audit_status === 'Audited & Verified' ? 'success' : 'warning'}
                icon={selectedAudit?.audit_status === 'Audited & Verified' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                style={{ fontSize: 12, padding: '2px 10px', borderRadius: 12 }}
              >
                {selectedAudit?.audit_status || 'Verified'}
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
              handleOpenModal(selectedAudit);
            }}
          >
            Edit Audit
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
        {selectedAudit && (
          <div style={{ paddingTop: 8 }}>
            {/* Top Metric Strip */}
            <Row gutter={12} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f6ffed', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Asset Valuation</span>}
                    value={selectedAudit.total_assets_value_etb || 0}
                    formatter={(val) => `${Number(val).toLocaleString()} ETB`}
                    valueStyle={{ fontSize: 13, fontWeight: 'bold', color: '#1a5f2c' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f0f5ff', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Functional Assets</span>}
                    value={selectedAudit.functional_assets_count || 0}
                    valueStyle={{ fontSize: 15, fontWeight: 'bold', color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#fff1f0', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Defective Assets</span>}
                    value={selectedAudit.defective_assets_count || 0}
                    valueStyle={{ fontSize: 15, fontWeight: 'bold', color: '#ff4d4f' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#fff7e6', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Audit Date</span>}
                    value={selectedAudit.audit_date}
                    valueStyle={{ fontSize: 13, fontWeight: 'bold', color: '#fa8c16' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* TABPANES */}
            <Tabs defaultActiveKey="1" type="card">
              {/* TAB 1: Audit Profile */}
              <TabPane
                tab={
                  <span>
                    <TeamOutlined />
                    Official Demographics & Reach
                  </span>
                }
                key="1"
              >
                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }} style={{ marginBottom: 16 }}>
                  <Descriptions.Item label="Audit Title" span={2}>
                    <strong style={{ color: '#1a5f2c' }}>{selectedAudit.audit_title}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Audit Category">
                    <Tag color="purple">{selectedAudit.audit_category}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Deficiency Found?">
                    <Tag color={selectedAudit.deficiency_found ? 'error' : 'success'}>
                      {selectedAudit.deficiency_found ? 'Yes (Deficiency Noted)' : 'No (Clean Audit)'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Lead Auditor">
                    {selectedAudit.lead_auditor} ({selectedAudit.auditor_phone})
                  </Descriptions.Item>
                </Descriptions>

                <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: 16, background: '#fafafa' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1a5f2c', textTransform: 'uppercase', marginBottom: 12 }}>
                    Official Disaggregation (ባለሙያዎች በወኪል ምድብ)
                  </div>
                  <Row gutter={[16, 16]}>
                    <Col span={8}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <ManOutlined style={{ color: '#1890ff', marginRight: 4 }} />
                          Male Officials (ወንድ)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#1890ff', marginTop: 2 }}>
                          {Number(selectedAudit.male_officials || 0).toLocaleString()}
                        </div>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <WomanOutlined style={{ color: '#722ed1', marginRight: 4 }} />
                          Female Officials (ሴት)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#722ed1', marginTop: 2 }}>
                          {Number(selectedAudit.female_officials || 0).toLocaleString()}
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
                          {Number(selectedAudit.married_women_officials || 0).toLocaleString()}
                        </div>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <RiseOutlined style={{ color: '#fa8c16', marginRight: 4 }} />
                          Youth Officials (ወጣቶች)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#fa8c16', marginTop: 2 }}>
                          {Number(selectedAudit.youth_officials || 0).toLocaleString()}
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
                          {Number(selectedAudit.investors_officials || 0).toLocaleString()}
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
              </TabPane>

              {/* TAB 2: Findings */}
              <TabPane
                tab={
                  <span>
                    <CheckSquareOutlined />
                    Audit Findings & Compliance
                  </span>
                }
                key="2"
              >
                <Card size="small" bordered={false} style={{ background: '#fcfdfd', border: '1px solid #e6f7ed', borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <CheckCircleOutlined style={{ color: '#1a5f2c', fontSize: 16 }} />
                    <strong style={{ color: '#1a5f2c', fontSize: 13, textTransform: 'uppercase' }}>
                      Audit Inspection Findings (የኦዲት ምርመራ ግኝቶች)
                    </strong>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: '#262626', lineHeight: '1.6' }}>
                    {selectedAudit.audit_findings || 'Completed inventory audit verifying fixed assets and equipment condition.'}
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
                    <strong>{extractName(selectedAudit.zone)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Woreda">
                    <strong>{extractName(selectedAudit.woreda)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Kebele Operational Base">
                    <span style={{ color: '#1a5f2c', fontWeight: 'bold' }}>
                      {extractName(selectedAudit.kebele)}
                    </span>
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
                  <Descriptions.Item label="Fiscal Year (በጀት ዓመት)">
                    <Tag color="blue" icon={<CalendarOutlined />}>
                      {selectedAudit.fiscal_year || '2019 E.C.'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Production Campaign Season">
                    <strong>{selectedAudit.season || 'Meher (መኸር)'}</strong>
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

export default function FtcEquipmentAuditing() {
  return (
    <App>
      <FtcEquipmentAuditingContent />
    </App>
  );
}