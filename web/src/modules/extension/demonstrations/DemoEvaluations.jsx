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
  AuditOutlined,
  LineChartOutlined,
  FileDoneOutlined,
  PhoneOutlined,
  ManOutlined,
  WomanOutlined,
  RiseOutlined,
  ShopOutlined,
  CheckSquareOutlined,
  SafetyCertificateOutlined
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

const EVALUATION_METHODS = [
  'Standard Crop-Cut Yield Sampling (የሰብል ናሙና ምርት ምዘና)',
  'Participatory Varietal Selection - PVS (አሳታፊ የምርጥ ዘር ምዘና)',
  'Economic Cost-Benefit & Gross Margin Analysis (የኢኮኖሚ ትርፋማነት ትንተና)',
  'Agronomic & Pest Resilience Scorecard (የአግሮኖሚና ተባይ መቋቋም ምዘና)',
  'Farmer Sensory & Market Preference Rating (የአርሶ አደርና የገበያ ተቀባይነት)'
];

const RECOMMENDATION_STATUSES = [
  'Recommended for Scaling (ለቀጣይ ማስፋፊያ የጸደቀ)',
  'Conditionally Approved (በቅድመ-ሁኔታ የጸደቀ)',
  'Re-trial / Needs Modification (ድጋሚ ሙከራ የሚያስፈልገው)',
  'Rejected (ተቀባይነት ያላገኘ)'
];

const INITIAL_EVALUATIONS = [
  {
    id: '1',
    eval_code: 'EVL-2019-EG-01',
    eval_title: 'Kurar Teff Row-Planting vs Broadcast Crop-Cut Evaluation',
    eval_method: 'Standard Crop-Cut Yield Sampling (የሰብል ናሙና ምርት ምዘና)',
    technology_evaluated: 'Quncho Teff Row Planting with NPSB Blended Fertilizer',
    lead_evaluator: 'Dr. Belayneh Mekonnen (Senior Agronomist)',
    evaluator_phone: '+251 911 223 344',
    eval_date: '2026-08-12',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    demo_yield_qt_ha: 38.5,
    control_yield_qt_ha: 26.0,
    yield_gain_percent: 48.1,
    male_evaluators: 42,
    female_evaluators: 24,
    married_women_evaluators: 18,
    youth_evaluators: 14,
    investors_evaluators: 4,
    recommendation_status: 'Recommended for Scaling (ለቀጣይ ማስፋፊያ የጸደቀ)',
    eval_findings: 'Crop-cut verification confirmed a 48.1% yield increase with 35% lodging reduction on vertisol soils.',
    zone: 'East Gojjam',
    woreda: 'Dejen',
    kebele: 'Kurar'
  },
  {
    id: '2',
    eval_code: 'EVL-2019-SG-04',
    eval_title: 'Fogera Lowland Rice Varietal Performance & Gross Margin Audit',
    eval_method: 'Participatory Varietal Selection - PVS (አሳታፊ የምርጥ ዘር ምዘና)',
    technology_evaluated: 'Shito Lowland Rice with Integrated Weed Control',
    lead_evaluator: 'Woizero Tigist Abebe',
    evaluator_phone: '+251 922 556 778',
    eval_date: '2026-08-18',
    fiscal_year: '2019 E.C.',
    season: 'Bega / Irrigation (መስኖ/በጋ)',
    demo_yield_qt_ha: 52.0,
    control_yield_qt_ha: 38.0,
    yield_gain_percent: 36.8,
    male_evaluators: 38,
    female_evaluators: 28,
    married_women_evaluators: 22,
    youth_evaluators: 12,
    investors_evaluators: 3,
    recommendation_status: 'Recommended for Scaling (ለቀጣይ ማስፋፊያ የጸደቀ)',
    eval_findings: 'Demonstrated superior milling recovery rates and high market demand across regional grain dealers.',
    zone: 'South Gondar',
    woreda: 'Fogera',
    kebele: 'Woreta Zuria'
  },
  {
    id: '3',
    eval_code: 'EVL-2019-WG-09',
    eval_title: 'Bure Soil Health Scorecard on Agricultural Lime Neutralization',
    eval_method: 'Agronomic & Pest Resilience Scorecard (የአግሮኖሚና ተባይ መቋቋም ምዘና)',
    technology_evaluated: 'Dolomitic Lime Application on Acidic Maize Soil',
    lead_evaluator: 'Ato Getachew Mekonnen',
    evaluator_phone: '+251 913 990 112',
    eval_date: '2026-08-25',
    fiscal_year: '2019 E.C.',
    season: 'Meher (መኸር)',
    demo_yield_qt_ha: 64.0,
    control_yield_qt_ha: 49.0,
    yield_gain_percent: 30.6,
    male_evaluators: 30,
    female_evaluators: 18,
    married_women_evaluators: 14,
    youth_evaluators: 10,
    investors_evaluators: 2,
    recommendation_status: 'Conditionally Approved (በቅድመ-ሁኔታ የጸደቀ)',
    eval_findings: 'Substantial root volume development recorded; conditional on woreda lime crusher maintenance.',
    zone: 'West Gojjam',
    woreda: 'Bure',
    kebele: 'Alefa'
  }
];

function DemoEvaluationsContent() {
  const { message } = App.useApp();

  const [evaluations, setEvaluations] = useState(INITIAL_EVALUATIONS);
  const [isFetching, setIsFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [fiscalYearFilter, setFiscalYearFilter] = useState(null);
  const [seasonFilter, setSeasonFilter] = useState(null);
  const [zoneFilter, setZoneFilter] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEval, setEditingEval] = useState(null);
  const [selectedEval, setSelectedEval] = useState(null);
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
      if (editingEval) {
        const initForm = async () => {
          const zoneMatch = zones.find(
            (z) => z.name === editingEval.zone || z.id === editingEval.zone_id
          );
          if (zoneMatch) {
            try {
              const wRes = locationApi?.getWoredas ? await locationApi.getWoredas(zoneMatch.id) : null;
              const wList = wRes?.data?.data?.data || wRes?.data?.data || [];
              setWoredas(wList);

              const woredaMatch = wList.find(
                (w) => w.name === editingEval.woreda || w.id === editingEval.woreda_id
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
            eval_code: editingEval.eval_code,
            eval_title: editingEval.eval_title,
            eval_method: editingEval.eval_method,
            technology_evaluated: editingEval.technology_evaluated,
            lead_evaluator: editingEval.lead_evaluator,
            evaluator_phone: editingEval.evaluator_phone,
            eval_date: editingEval.eval_date ? dayjs(editingEval.eval_date) : dayjs(),
            fiscal_year: editingEval.fiscal_year || '2019 E.C.',
            season: editingEval.season || 'Meher (መኸር)',
            demo_yield_qt_ha: Number(editingEval.demo_yield_qt_ha) || 0,
            control_yield_qt_ha: Number(editingEval.control_yield_qt_ha) || 0,
            yield_gain_percent: Number(editingEval.yield_gain_percent) || 0,
            male_evaluators: Number(editingEval.male_evaluators) || 0,
            female_evaluators: Number(editingEval.female_evaluators) || 0,
            married_women_evaluators: Number(editingEval.married_women_evaluators) || 0,
            youth_evaluators: Number(editingEval.youth_evaluators) || 0,
            investors_evaluators: Number(editingEval.investors_evaluators) || 0,
            recommendation_status: editingEval.recommendation_status || 'Recommended for Scaling (ለቀጣይ ማስፋፊያ የጸደቀ)',
            eval_findings: editingEval.eval_findings,
            zone_id: editingEval.zone_id || zoneMatch?.id || editingEval.zone,
            woreda_id: editingEval.woreda_id || editingEval.woreda,
            kebele_id: editingEval.kebele_id || editingEval.kebele
          });
        };
        initForm();
      } else {
        form.resetFields();
        form.setFieldsValue({
          eval_method: 'Standard Crop-Cut Yield Sampling (የሰብል ናሙና ምርት ምዘና)',
          recommendation_status: 'Recommended for Scaling (ለቀጣይ ማስፋፊያ የጸደቀ)',
          eval_date: dayjs(),
          fiscal_year: '2019 E.C.',
          season: 'Meher (መኸር)',
          demo_yield_qt_ha: 35.0,
          control_yield_qt_ha: 25.0,
          yield_gain_percent: 40.0,
          male_evaluators: 30,
          female_evaluators: 15,
          married_women_evaluators: 12,
          youth_evaluators: 8,
          investors_evaluators: 1
        });
        setWoredas([]);
        setKebeles([]);
      }
    }
  }, [isModalOpen, editingEval, form, zones]);

  const loadData = async () => {
    setIsFetching(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      message.success('Demonstration evaluations registry refreshed');
    } catch {
      message.error('Failed to refresh data');
    } finally {
      setIsFetching(false);
    }
  };

  // Direct In-Place Status Update without Opening the Form
  const handleQuickStatusChange = (recordId, newStatus) => {
    setEvaluations((prev) =>
      prev.map((e) => (e.id === recordId ? { ...e, recommendation_status: newStatus } : e))
    );
    message.success(`Validation verdict updated to "${newStatus}"`);
  };

  // Filter pipeline
  const filteredEvaluations = useMemo(() => {
    return evaluations.filter((e) => {
      const code = extractName(e.eval_code).toLowerCase();
      const title = extractName(e.eval_title).toLowerCase();
      const lead = extractName(e.lead_evaluator).toLowerCase();
      const tech = extractName(e.technology_evaluated).toLowerCase();
      const kebele = extractName(e.kebele).toLowerCase();
      const woreda = extractName(e.woreda).toLowerCase();
      const zone = extractName(e.zone).toLowerCase();
      const q = searchTerm.toLowerCase();

      const matchesSearch =
        code.includes(q) || title.includes(q) || lead.includes(q) || tech.includes(q) || kebele.includes(q) || woreda.includes(q) || zone.includes(q);
      const matchesMethod = methodFilter ? e.eval_method === methodFilter : true;
      const matchesStatus = statusFilter ? e.recommendation_status === statusFilter : true;
      const matchesFY = fiscalYearFilter ? e.fiscal_year === fiscalYearFilter : true;
      const matchesSeason = seasonFilter ? e.season === seasonFilter : true;
      const matchesZone = zoneFilter ? zone === zoneFilter.toLowerCase() : true;

      return matchesSearch && matchesMethod && matchesStatus && matchesFY && matchesSeason && matchesZone;
    });
  }, [evaluations, searchTerm, methodFilter, statusFilter, fiscalYearFilter, seasonFilter, zoneFilter]);

  // Statistics Calculation
  const stats = useMemo(() => {
    const totalEvaluations = filteredEvaluations.length;
    const maleEvaluators = filteredEvaluations.reduce((acc, e) => acc + (Number(e.male_evaluators) || 0), 0);
    const femaleEvaluators = filteredEvaluations.reduce((acc, e) => acc + (Number(e.female_evaluators) || 0), 0);
    const marriedWomen = filteredEvaluations.reduce((acc, e) => acc + (Number(e.married_women_evaluators) || 0), 0);
    const youth = filteredEvaluations.reduce((acc, e) => acc + (Number(e.youth_evaluators) || 0), 0);
    const investors = filteredEvaluations.reduce((acc, e) => acc + (Number(e.investors_evaluators) || 0), 0);

    const totalEvaluators = maleEvaluators + femaleEvaluators + marriedWomen + youth + investors;
    const totalWomenEvaluators = femaleEvaluators + marriedWomen;
    const womenRatio = totalEvaluators > 0 ? ((totalWomenEvaluators / totalEvaluators) * 100).toFixed(1) : 0;

    const recommendedCount = filteredEvaluations.filter((e) => e.recommendation_status?.includes('Recommended')).length;
    const recommendedRate = totalEvaluations > 0 ? ((recommendedCount / totalEvaluations) * 100).toFixed(1) : 0;

    const avgYieldGain =
      totalEvaluations > 0
        ? (
            filteredEvaluations.reduce((acc, e) => acc + (Number(e.yield_gain_percent) || 0), 0) /
            totalEvaluations
          ).toFixed(1)
        : 0;

    return {
      totalEvaluations,
      totalEvaluators,
      maleEvaluators,
      femaleEvaluators,
      marriedWomen,
      totalWomenEvaluators,
      youth,
      investors,
      womenRatio,
      recommendedCount,
      recommendedRate,
      avgYieldGain
    };
  }, [filteredEvaluations]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setMethodFilter(null);
    setStatusFilter(null);
    setFiscalYearFilter(null);
    setSeasonFilter(null);
    setZoneFilter(null);
  };

  const handleOpenModal = (record = null) => {
    setEditingEval(record);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const selectedZone = zones.find((z) => (z.id || z._id) === values.zone_id);
      const selectedWoreda = woredas.find((w) => (w.id || w._id) === values.woreda_id);
      const selectedKebele = kebeles.find((k) => (k.id || k._id) === values.kebele_id);

      // Auto-compute yield gain % if not manually typed
      let computedGain = values.yield_gain_percent;
      if (values.demo_yield_qt_ha && values.control_yield_qt_ha && values.control_yield_qt_ha > 0) {
        computedGain = Number((((values.demo_yield_qt_ha - values.control_yield_qt_ha) / values.control_yield_qt_ha) * 100).toFixed(1));
      }

      const payload = {
        ...values,
        yield_gain_percent: computedGain,
        eval_date: values.eval_date ? values.eval_date.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
        zone: selectedZone?.name || selectedZone?.zone_name || values.zone_id,
        woreda: selectedWoreda?.name || selectedWoreda?.woreda_name || values.woreda_id,
        kebele: selectedKebele?.name || selectedKebele?.kebele_name || values.kebele_id
      };

      if (editingEval) {
        setEvaluations((prev) =>
          prev.map((item) =>
            item.id === editingEval.id ? { ...item, ...payload, recommendation_status: editingEval.recommendation_status } : item
          )
        );
        message.success('Demonstration evaluation record updated successfully');
      } else {
        const newRecord = {
          ...payload,
          id: Date.now().toString(),
          eval_code: values.eval_code || `EVL-${Date.now().toString().slice(-4)}`,
          recommendation_status: values.recommendation_status || 'Recommended for Scaling (ለቀጣይ ማስፋፊያ የጸደቀ)'
        };
        setEvaluations((prev) => [newRecord, ...prev]);
        message.success('New demonstration evaluation verified successfully');
      }
      setIsModalOpen(false);
    } catch (error) {
      message.error(error?.response?.data?.message || error.message || 'Failed to save evaluation record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    setEvaluations((prev) => prev.filter((item) => item.id !== id));
    message.success('Evaluation record removed');
  };

  const exportToCSV = () => {
    if (!filteredEvaluations.length) {
      message.warning('No evaluation records available to export');
      return;
    }
    const headers = [
      'Eval Code,Evaluation Title,Methodology,Technology Evaluated,Demo Yield (Qt/Ha),Control Yield (Qt/Ha),Yield Gain (%),Lead Evaluator,Phone,Date,FY,Season,Zone,Woreda,Kebele,Male,Female,Married Women,Youth,Investors,Total Evaluators,Verdict'
    ];
    const rows = filteredEvaluations.map((e) => {
      const total =
        (Number(e.male_evaluators) || 0) +
        (Number(e.female_evaluators) || 0) +
        (Number(e.married_women_evaluators) || 0) +
        (Number(e.youth_evaluators) || 0) +
        (Number(e.investors_evaluators) || 0);

      return [
        `"${e.eval_code || ''}"`,
        `"${e.eval_title || ''}"`,
        `"${e.eval_method || ''}"`,
        `"${e.technology_evaluated || ''}"`,
        e.demo_yield_qt_ha || 0,
        e.control_yield_qt_ha || 0,
        e.yield_gain_percent || 0,
        `"${e.lead_evaluator || ''}"`,
        `"${e.evaluator_phone || ''}"`,
        `"${e.eval_date || ''}"`,
        `"${e.fiscal_year || ''}"`,
        `"${e.season || ''}"`,
        `"${extractName(e.zone)}"`,
        `"${extractName(e.woreda)}"`,
        `"${extractName(e.kebele)}"`,
        e.male_evaluators || 0,
        e.female_evaluators || 0,
        e.married_women_evaluators || 0,
        e.youth_evaluators || 0,
        e.investors_evaluators || 0,
        total,
        `"${e.recommendation_status || ''}"`
      ].join(',');
    });

    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Demonstration_Results_Evaluation_${Date.now()}.csv`;
    a.click();
    message.success('Evaluation report exported successfully');
  };

  const columns = [
    {
      title: 'Eval Code & Title',
      key: 'eval_info',
      width: 260,
      render: (_, r) => (
        <div>
          <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{r.eval_title}</strong>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>
            Code: <span style={{ fontFamily: 'monospace' }}>{r.eval_code}</span> | Lead: {r.lead_evaluator}
          </div>
        </div>
      )
    },
    {
      title: 'Evaluation Methodology',
      dataIndex: 'eval_method',
      key: 'eval_method',
      width: 220,
      render: (method) => {
        let color = 'default';
        if (method?.includes('Crop-Cut')) color = 'green';
        if (method?.includes('PVS')) color = 'purple';
        if (method?.includes('Economic')) color = 'blue';
        if (method?.includes('Scorecard')) color = 'gold';
        return <Tag color={color}>{method}</Tag>;
      }
    },
    {
      title: 'Yield Margin (Q/Ha)',
      key: 'yield_metrics',
      width: 190,
      render: (_, r) => (
        <div style={{ fontSize: 12 }}>
          <div>
            Demo: <strong style={{ color: '#1a5f2c' }}>{r.demo_yield_qt_ha} Q/Ha</strong> vs Control:{' '}
            <span>{r.control_yield_qt_ha} Q/Ha</span>
          </div>
          <div style={{ marginTop: 2 }}>
            <Tag color="cyan">+{r.yield_gain_percent}% Margin</Tag>
          </div>
        </div>
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
      title: 'Evaluators Disaggregation',
      key: 'evaluators_breakdown',
      width: 220,
      render: (_, r) => {
        const total =
          (Number(r.male_evaluators) || 0) +
          (Number(r.female_evaluators) || 0) +
          (Number(r.married_women_evaluators) || 0) +
          (Number(r.youth_evaluators) || 0) +
          (Number(r.investors_evaluators) || 0);

        return (
          <div style={{ fontSize: 11 }}>
            <div>
              Total: <strong style={{ color: '#1a5f2c' }}>{total.toLocaleString()} Evaluators</strong>
            </div>
            <div style={{ color: '#8c8c8c' }}>
              <span>ወንድ: {r.male_evaluators || 0}</span> | <span>ሴት: {r.female_evaluators || 0}</span> | <span>ባለትዳር: {r.married_women_evaluators || 0}</span>
            </div>
          </div>
        );
      }
    },
    {
      title: 'Validation Verdict (In-Place Edit)',
      dataIndex: 'recommendation_status',
      key: 'recommendation_status',
      width: 210,
      render: (status, record) => (
        <Select
          value={status || 'Recommended for Scaling (ለቀጣይ ማስፋፊያ የጸደቀ)'}
          onChange={(newVal) => handleQuickStatusChange(record.id, newVal)}
          style={{ width: '100%' }}
          size="small"
        >
          <Option value="Recommended for Scaling (ለቀጣይ ማስፋፊያ የጸደቀ)">
            <Tag color="success" icon={<CheckCircleOutlined />} style={{ margin: 0 }}>
              Recommended
            </Tag>
          </Option>
          <Option value="Conditionally Approved (በቅድመ-ሁኔታ የጸደቀ)">
            <Tag color="processing" icon={<ClockCircleOutlined />} style={{ margin: 0 }}>
              Conditional
            </Tag>
          </Option>
          <Option value="Re-trial / Needs Modification (ድጋሚ ሙከራ የሚያስፈልገው)">
            <Tag color="warning" icon={<ClockCircleOutlined />} style={{ margin: 0 }}>
              Re-trial
            </Tag>
          </Option>
          <Option value="Rejected (ተቀባይነት ያላገኘ)">
            <Tag color="error" icon={<ClockCircleOutlined />} style={{ margin: 0 }}>
              Rejected
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
          <Tooltip title="View Evaluation Dossier">
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: '#1890ff' }} />}
              onClick={() => {
                setSelectedEval(record);
                setIsDossierOpen(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Edit Evaluation">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: '#52c41a' }} />}
              onClick={() => handleOpenModal(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Record">
            <Popconfirm
              title="Delete demonstration evaluation record?"
              description="Are you sure you want to remove this verified result evaluation?"
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
        <Breadcrumb.Item>Demonstration Results Evaluation & Verification</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#1a5f2c', fontFamily: "'Times New Roman', Times, serif" }}>
            Demonstration Results Evaluation & Verification (የማሳ ማሳያዎች ውጤት ምዘናና ማረጋገጫ)
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Empirical crop-cut yield verifications, participatory variety selections, economic margin reviews, and technology scaling verdicts
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
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Total Demos Verified</span>}
              value={stats.totalEvaluations}
              prefix={<AuditOutlined style={{ color: '#1a5f2c', marginRight: 8 }} />}
              valueStyle={{ color: '#1a5f2c', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Total Evaluators: <strong style={{ color: '#262626' }}>{stats.totalEvaluators} participants</strong>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #1890ff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Avg Yield Gain Margin</span>}
              value={stats.avgYieldGain}
              suffix="%"
              prefix={<LineChartOutlined style={{ color: '#1890ff', marginRight: 8 }} />}
              valueStyle={{ color: '#1890ff', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Over traditional farmer practice control
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #722ed1', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Women Evaluators Share</span>}
              value={stats.womenRatio}
              suffix="%"
              prefix={<WomanOutlined style={{ color: '#722ed1', marginRight: 8 }} />}
              valueStyle={{ color: '#722ed1', fontWeight: 'bold', fontSize: 24 }}
            />
            <Progress percent={Number(stats.womenRatio)} size="small" strokeColor="#722ed1" />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8c8c8c', marginTop: 2 }}>
              <span>Evaluator Count: {stats.totalWomenEvaluators}</span>
              <span>Regional Goal: &gt; 35%</span>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #fa8c16', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Recommended for Scaling</span>}
              value={stats.recommendedCount}
              prefix={<CheckSquareOutlined style={{ color: '#fa8c16', marginRight: 8 }} />}
              valueStyle={{ color: '#fa8c16', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Scaling Approval Rate: <strong>{stats.recommendedRate}%</strong>
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
                placeholder="Search Title, Tech, or Lead..."
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: 220 }}
                allowClear
              />

              <Select
                placeholder="Evaluation Method"
                value={methodFilter}
                onChange={setMethodFilter}
                style={{ width: 195 }}
                allowClear
              >
                {EVALUATION_METHODS.map((em) => (
                  <Option key={em} value={em}>{em}</Option>
                ))}
              </Select>

              <Select
                placeholder="Validation Verdict"
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: 190 }}
                allowClear
              >
                {RECOMMENDATION_STATUSES.map((rs) => (
                  <Option key={rs} value={rs}>{rs}</Option>
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
                {[...new Set(evaluations.map((e) => extractName(e.zone)))].map((z) => (
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
                Export Evaluation CSV
              </Button>

              <Button
                icon={<ClearOutlined />}
                onClick={handleResetFilters}
                disabled={!(searchTerm || methodFilter || statusFilter || fiscalYearFilter || seasonFilter || zoneFilter)}
              >
                Reset Filters
              </Button>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => handleOpenModal(null)}
                style={{ backgroundColor: '#1a5f2c', borderColor: '#1a5f2c', fontWeight: 600 }}
              >
                Log Demo Evaluation
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Main Table */}
      <Table
        columns={columns}
        dataSource={filteredEvaluations}
        rowKey="id"
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} verified demo evaluations`
        }}
        scroll={{ x: 1350 }}
        bordered
        size="middle"
      />

      {/* Registration / Edit Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AuditOutlined style={{ color: '#1a5f2c', fontSize: 20 }} />
            <span style={{ color: '#1a5f2c', fontWeight: 'bold', fontFamily: "'Times New Roman', Times, serif", fontSize: 17 }}>
              {editingEval ? 'Edit Demonstration Evaluation' : 'Log Demonstration Result Evaluation (የማሳ ማሳያ ውጤት ምዘና)'}
            </span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText={editingEval ? 'Update Evaluation' : 'Save Evaluation Record'}
        okButtonProps={{ style: { backgroundColor: '#1a5f2c', borderColor: '#1a5f2c' }, loading: isSubmitting }}
        width={800}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Evaluation Identification & Technology
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="eval_code"
                label="Evaluation Code"
                rules={[{ required: true, message: 'Code required' }]}
              >
                <Input placeholder="e.g. EVL-2019-EG-08" />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item
                name="eval_title"
                label="Evaluation Title / Campaign Description"
                rules={[{ required: true, message: 'Title required' }]}
              >
                <Input placeholder="e.g. Kurar Teff Row-Planting vs Broadcast Evaluation" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="eval_method"
                label="Evaluation Methodology"
                rules={[{ required: true, message: 'Select methodology' }]}
              >
                <Select>
                  {EVALUATION_METHODS.map((em) => (
                    <Option key={em} value={em}>{em}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="technology_evaluated"
                label="Technology / Variety Evaluated"
                rules={[{ required: true, message: 'Technology required' }]}
              >
                <Input placeholder="e.g. Quncho Teff Row Planting with NPSB" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={14}>
              <Form.Item
                name="lead_evaluator"
                label="Lead Evaluator / Senior Expert"
                rules={[{ required: true, message: 'Evaluator required' }]}
              >
                <Input placeholder="e.g. Dr. Belayneh Mekonnen" />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item
                name="evaluator_phone"
                label="Lead Phone Number"
                rules={[{ required: true, message: 'Phone required' }]}
              >
                <Input placeholder="+251 9..." />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Empirical Yield Metrics & Productivity Margin
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="demo_yield_qt_ha"
                label="Demonstration Yield (Qt/Ha)"
                rules={[{ required: true, message: 'Yield required' }]}
              >
                <InputNumber min={0.1} max={250} step={0.1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="control_yield_qt_ha"
                label="Farmer Practice Control (Qt/Ha)"
                rules={[{ required: true, message: 'Control yield required' }]}
              >
                <InputNumber min={0.1} max={250} step={0.1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="yield_gain_percent"
                label="Yield Gain Margin (%)"
                tooltip="Calculated margin over traditional control practice"
              >
                <InputNumber min={-100} max={500} step={0.1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="recommendation_status"
                label="Validation Verdict / Recommendation"
                rules={[{ required: true }]}
              >
                <Select>
                  {RECOMMENDATION_STATUSES.map((rs) => (
                    <Option key={rs} value={rs}>{rs}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="eval_date"
                label="Verification Date"
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
            Evaluators & Participating Farmers (ምዘናውን ያካሄዱ አርሶ አደሮች በጾታ)
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="male_evaluators"
                label="Male Evaluators (ወንድ)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="female_evaluators"
                label="Female Evaluators (ሴት)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="married_women_evaluators"
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
                name="youth_evaluators"
                label="Youth Evaluators (ወጣቶች)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="investors_evaluators"
                label="Private Investors (ባለሃብቶች)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="eval_findings" label="Empirical Findings & Scaling Directives">
                <TextArea rows={3} placeholder="Detail crop-cut sampling statistics, gross margin calculations, or constraints identified..." />
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

      {/* Comprehensive Evaluation Dossier Modal */}
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
                <AuditOutlined />
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
                  {selectedEval?.eval_title}
                </span>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                  Code: <span style={{ fontFamily: 'monospace' }}>{selectedEval?.eval_code}</span> | Verified by:{' '}
                  {selectedEval?.lead_evaluator}
                </div>
              </div>
            </div>
            <div>
              <Tag
                color={
                  selectedEval?.recommendation_status?.includes('Recommended')
                    ? 'success'
                    : selectedEval?.recommendation_status?.includes('Conditional')
                    ? 'processing'
                    : 'warning'
                }
                icon={selectedEval?.recommendation_status?.includes('Recommended') ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                style={{ fontSize: 12, padding: '2px 10px', borderRadius: 12 }}
              >
                {selectedEval?.recommendation_status?.split(' ')[0] || 'Verified'}
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
              handleOpenModal(selectedEval);
            }}
          >
            Edit Evaluation
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
        {selectedEval && (
          <div style={{ paddingTop: 8 }}>
            {/* Top Metric Strip */}
            <Row gutter={12} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f6ffed', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Demo Yield</span>}
                    value={selectedEval.demo_yield_qt_ha || 0}
                    suffix={<span style={{ fontSize: 12 }}>Q/Ha</span>}
                    valueStyle={{ fontSize: 15, fontWeight: 'bold', color: '#1a5f2c' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f0f5ff', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Control Yield</span>}
                    value={selectedEval.control_yield_qt_ha || 0}
                    suffix={<span style={{ fontSize: 12 }}>Q/Ha</span>}
                    valueStyle={{ fontSize: 15, fontWeight: 'bold', color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f9f0ff', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Yield Gain Margin</span>}
                    value={selectedEval.yield_gain_percent || 0}
                    suffix="%"
                    valueStyle={{ fontSize: 15, fontWeight: 'bold', color: '#722ed1' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#fff7e6', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Verification Date</span>}
                    value={selectedEval.eval_date}
                    valueStyle={{ fontSize: 13, fontWeight: 'bold', color: '#fa8c16' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* TABPANES */}
            <Tabs defaultActiveKey="1" type="card">
              {/* TAB 1: Evaluation Profile */}
              <TabPane
                tab={
                  <span>
                    <TeamOutlined />
                    Evaluator Demographics & Reach
                  </span>
                }
                key="1"
              >
                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }} style={{ marginBottom: 16 }}>
                  <Descriptions.Item label="Evaluation Title" span={2}>
                    <strong style={{ color: '#1a5f2c' }}>{selectedEval.eval_title}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Evaluation Methodology">
                    <Tag color="purple">{selectedEval.eval_method}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Technology Evaluated">
                    <Tag color="green">{selectedEval.technology_evaluated}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Lead Specialist">
                    {selectedEval.lead_evaluator} ({selectedEval.evaluator_phone})
                  </Descriptions.Item>
                  <Descriptions.Item label="Verdict">
                    <strong style={{ color: '#1a5f2c' }}>{selectedEval.recommendation_status}</strong>
                  </Descriptions.Item>
                </Descriptions>

                <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: 16, background: '#fafafa' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1a5f2c', textTransform: 'uppercase', marginBottom: 12 }}>
                    Evaluator Disaggregation (ምዘናውን ያካሄዱ አርሶ አደሮች በጾታና በዕድሜ)
                  </div>
                  <Row gutter={[16, 16]}>
                    <Col span={8}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <ManOutlined style={{ color: '#1890ff', marginRight: 4 }} />
                          Male Evaluators (ወንድ)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#1890ff', marginTop: 2 }}>
                          {Number(selectedEval.male_evaluators || 0).toLocaleString()}
                        </div>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <WomanOutlined style={{ color: '#722ed1', marginRight: 4 }} />
                          Female Evaluators (ሴት)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#722ed1', marginTop: 2 }}>
                          {Number(selectedEval.female_evaluators || 0).toLocaleString()}
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
                          {Number(selectedEval.married_women_evaluators || 0).toLocaleString()}
                        </div>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          <RiseOutlined style={{ color: '#fa8c16', marginRight: 4 }} />
                          Youth Evaluators (ወጣቶች)
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#fa8c16', marginTop: 2 }}>
                          {Number(selectedEval.youth_evaluators || 0).toLocaleString()}
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
                          {Number(selectedEval.investors_evaluators || 0).toLocaleString()}
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
              </TabPane>

              {/* TAB 2: Findings & Plan */}
              <TabPane
                tab={
                  <span>
                    <CheckSquareOutlined />
                    Findings & Recommendations
                  </span>
                }
                key="2"
              >
                <Card size="small" bordered={false} style={{ background: '#fcfdfd', border: '1px solid #e6f7ed', borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <CheckCircleOutlined style={{ color: '#1a5f2c', fontSize: 16 }} />
                    <strong style={{ color: '#1a5f2c', fontSize: 13, textTransform: 'uppercase' }}>
                      Verification Findings & Scaling Directive (የምዘና ውጤት ማጠቃለያ)
                    </strong>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: '#262626', lineHeight: '1.6' }}>
                    {selectedEval.eval_findings || 'Formal evaluation verified significant yield gains and high farmer adoption intent.'}
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
                    <strong>{extractName(selectedEval.zone)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Woreda">
                    <strong>{extractName(selectedEval.woreda)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Kebele Operational Base">
                    <span style={{ color: '#1a5f2c', fontWeight: 'bold' }}>
                      {extractName(selectedEval.kebele)}
                    </span>
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
                  <Descriptions.Item label="Fiscal Year (በጀት ዓመት)">
                    <Tag color="blue" icon={<CalendarOutlined />}>
                      {selectedEval.fiscal_year || '2019 E.C.'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Production Campaign Season">
                    <strong>{selectedEval.season || 'Meher (መኸር)'}</strong>
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

export default function DemoEvaluations() {
  return (
    <App>
      <DemoEvaluationsContent />
    </App>
  );
}