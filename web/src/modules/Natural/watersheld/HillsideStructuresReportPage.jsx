import React, { useState, useMemo } from 'react';
import {
  Card,
  Table,
  Row,
  Col,
  Input,
  Select,
  Button,
  Tag,
  Space,
  Typography,
  Tooltip,
  Modal,
  Form,
  InputNumber,
  Steps,
  Segmented,
  message
} from 'antd';
import {
  SearchOutlined,
  DownloadOutlined,
  EditOutlined,
  ReloadOutlined,
  LeftOutlined,
  RightOutlined,
  CheckOutlined,
  PlusOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

// Helper to construct quarterly structure objects
const makeQuarterData = (hP = 0, hA = 0, tP = 0, tA = 0, bP = 0, bA = 0, uP = 0, uA = 0) => ({
  hillside_plan: hP,
  hillside_ach: hA,
  trenched_plan: tP,
  trenched_ach: tA,
  bench_plan: bP,
  bench_ach: bA,
  upgrade_plan: uP,
  upgrade_ach: uA
});

// Seed data with quarterly breakdown summing exactly to regional annual numbers
const INITIAL_RECORDS = [
  // ───── RURAL ZONES (የገጠር ዞኖች) ─────
 
 
 


  // ───── CITY ADMINISTRATIONS (ከተማ አስተዳደር) ─────
  {
    id: 'c1', no: 1, type: 'city', zone: 'ባህርዳር', year: 2018,
    quarters: {
      Q1: makeQuarterData(45.0, 50, 5, 6, 0, 1, 60, 80),
      Q2: makeQuarterData(90.0, 95, 10, 12, 0, 1, 120, 160),
      Q3: makeQuarterData(50.0, 55, 6, 6, 0, 1, 65, 88),
      Q4: makeQuarterData(15.55, 18, 2, 2, 0, 0, 23, 30)
    }
  },
  {
    id: 'c2', no: 2, type: 'city', zone: 'ጐንደር ከተማ', year: 2018,
    quarters: {
      Q1: makeQuarterData(9, 9, 3, 3, 0, 0, 13, 15),
      Q2: makeQuarterData(18, 18, 6, 6, 0, 0, 27, 30),
      Q3: makeQuarterData(10, 10, 3, 4, 0, 0, 15, 17),
      Q4: makeQuarterData(2.7, 3, 1, 1, 0, 0, 5, 6)
    }
  },
  {
    id: 'c3', no: 3, type: 'city', zone: 'ደሴ ከተማ', year: 2018,
    quarters: {
      Q1: makeQuarterData(1.1, 1, 3, 2, 0, 0, 95, 40),
      Q2: makeQuarterData(2.2, 1, 6, 5, 1, 0, 190, 80),
      Q3: makeQuarterData(1.2, 1, 3, 2, 1, 0, 105, 45),
      Q4: makeQuarterData(0.41, 0, 1, 1, 0, 0, 31, 15)
    }
  },
 
  {
    id: 'c6', no: 6, type: 'city', zone: 'ኮምቦልቻ ከተማ', year: 2018,
    quarters: {
      Q1: makeQuarterData(3.5, 2, 3, 2, 0, 0, 1, 1),
      Q2: makeQuarterData(7.0, 4, 6, 5, 0, 0, 1, 1),
      Q3: makeQuarterData(4.0, 2, 3, 2, 0, 0, 1, 1),
      Q4: makeQuarterData(1.0, 0, 1, 1, 0, 0, 0, 0)
    }
  },
  
  {
    id: 'c8', no: 8, type: 'city', zone: 'ደብረ ታቦር', year: 2018,
    quarters: {
      Q1: makeQuarterData(2.2, 0, 0, 0, 0, 0, 2, 1),
      Q2: makeQuarterData(4.4, 0, 1, 0, 0, 0, 3, 3),
      Q3: makeQuarterData(2.4, 0, 0, 0, 0, 0, 2, 2),
      Q4: makeQuarterData(0.75, 0, 0, 0, 0, 0, 0, 0)
    }
  }
];

export default function HillsideStructuresReportPage() {
  const [records, setRecords] = useState(INITIAL_RECORDS);

  // Filters
  const [selectedType, setSelectedType] = useState('ALL'); // 'ALL' | 'zone' | 'city'
  const [selectedYear, setSelectedYear] = useState(2018);
  const [selectedQuarter, setSelectedQuarter] = useState('ALL'); // 'ALL' (Annual sum) | 'Q1' | 'Q2' | 'Q3' | 'Q4'
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlanRecord, setEditingPlanRecord] = useState(null);
  const [planStep, setPlanStep] = useState(0);
  const [planForm] = Form.useForm();

  const [isAchModalOpen, setIsAchModalOpen] = useState(false);
  const [editingAchRecord, setEditingAchRecord] = useState(null);
  const [achStep, setAchStep] = useState(0);
  const [achForm] = Form.useForm();

  const availableYears = useMemo(() => {
    const yrs = Array.from(new Set(records.map((r) => r.year).filter(Boolean)));
    if (!yrs.includes(2018)) yrs.push(2018);
    return yrs.sort((a, b) => b - a);
  }, [records]);

  // ───── DYNAMIC MATHEMATICAL SUMMATION ─────
  // Aggregates Q1+Q2+Q3+Q4 if 'ALL' (Annual), or isolates the chosen Quarter
  const processedRecords = useMemo(() => {
    return records
      .filter((r) => selectedYear === 'ALL' || Number(r.year) === Number(selectedYear))
      .map((r) => {
        const qKeys = selectedQuarter === 'ALL' ? ['Q1', 'Q2', 'Q3', 'Q4'] : [selectedQuarter];

        let hPlan = 0, hAch = 0, tPlan = 0, tAch = 0, bPlan = 0, bAch = 0, uPlan = 0, uAch = 0;

        qKeys.forEach((qk) => {
          const qData = r.quarters?.[qk] || {};
          hPlan += Number(qData.hillside_plan) || 0;
          hAch += Number(qData.hillside_ach) || 0;
          tPlan += Number(qData.trenched_plan) || 0;
          tAch += Number(qData.trenched_ach) || 0;
          bPlan += Number(qData.bench_plan) || 0;
          bAch += Number(qData.bench_ach) || 0;
          uPlan += Number(qData.upgrade_plan) || 0;
          uAch += Number(qData.upgrade_ach) || 0;
        });

        const totalPlan = hPlan + tPlan + bPlan + uPlan;
        const totalAch = hAch + tAch + bAch + uAch;
        const rate = totalPlan > 0 ? Number(((totalAch / totalPlan) * 100).toFixed(1)) : 0;

        return {
          ...r,
          hillside_plan: hPlan,
          hillside_ach: hAch,
          trenched_plan: tPlan,
          trenched_ach: tAch,
          bench_plan: bPlan,
          bench_ach: bAch,
          upgrade_plan: uPlan,
          upgrade_ach: uAch,
          total_plan: Math.round(totalPlan),
          total_ach: Math.round(totalAch),
          performance_rate: rate
        };
      });
  }, [records, selectedYear, selectedQuarter]);

  // Filtered dataset
  const filteredRecords = useMemo(() => {
    return processedRecords.filter((r) => {
      const matchSearch = r.zone.toLowerCase().includes(searchQuery.toLowerCase());
      const matchType = selectedType === 'ALL' || r.type === selectedType;
      return matchSearch && matchType;
    });
  }, [processedRecords, searchQuery, selectedType]);

  // ───── SUB-TOTAL & GRAND TOTAL CALCULATIONS ─────
  const calculations = useMemo(() => {
    const calcSubtotal = (items) => {
      let hPlan = 0, hAch = 0, tPlan = 0, tAch = 0, bPlan = 0, bAch = 0, uPlan = 0, uAch = 0;
      items.forEach((r) => {
        hPlan += Number(r.hillside_plan) || 0;
        hAch += Number(r.hillside_ach) || 0;
        tPlan += Number(r.trenched_plan) || 0;
        tAch += Number(r.trenched_ach) || 0;
        bPlan += Number(r.bench_plan) || 0;
        bAch += Number(r.bench_ach) || 0;
        uPlan += Number(r.upgrade_plan) || 0;
        uAch += Number(r.upgrade_ach) || 0;
      });
      const totPlan = hPlan + tPlan + bPlan + uPlan;
      const totAch = hAch + tAch + bAch + uAch;
      const rate = totPlan > 0 ? Number(((totAch / totPlan) * 100).toFixed(1)) : 0;

      return {
        hPlan, hAch, tPlan, tAch, bPlan, bAch, uPlan, uAch,
        totPlan: Math.round(totPlan),
        totAch: Math.round(totAch),
        rate
      };
    };

    const zoneItems = filteredRecords.filter((r) => r.type === 'zone');
    const cityItems = filteredRecords.filter((r) => r.type === 'city');

    const zoneSub = calcSubtotal(zoneItems);
    const citySub = calcSubtotal(cityItems);

    const grandHPlan = zoneSub.hPlan + citySub.hPlan;
    const grandHAch = zoneSub.hAch + citySub.hAch;
    const grandTPlan = zoneSub.tPlan + citySub.tPlan;
    const grandTAch = zoneSub.tAch + citySub.tAch;
    const grandBPlan = zoneSub.bPlan + citySub.bPlan;
    const grandBAch = zoneSub.bAch + citySub.bAch;
    const grandUPlan = zoneSub.uPlan + citySub.uPlan;
    const grandUAch = zoneSub.uAch + citySub.uAch;

    const grandTotPlan = grandHPlan + grandTPlan + grandBPlan + grandUPlan;
    const grandTotAch = grandHAch + grandTAch + grandBAch + grandUAch;
    const grandRate = grandTotPlan > 0 ? Number(((grandTotAch / grandTotPlan) * 100).toFixed(1)) : 0;

    return {
      zoneSub,
      citySub,
      grand: {
        hPlan: Math.round(grandHPlan),
        hAch: Math.round(grandHAch),
        tPlan: Math.round(grandTPlan),
        tAch: Math.round(grandTAch),
        bPlan: Math.round(grandBPlan),
        bAch: Math.round(grandBAch),
        uPlan: Math.round(grandUPlan),
        uAch: Math.round(grandUAch),
        totPlan: Math.round(grandTotPlan),
        totAch: Math.round(grandTotAch),
        rate: grandRate
      }
    };
  }, [filteredRecords]);

  // ───── 1. PLAN MODAL CONTROLS & WIZARD ─────
  const openCreatePlanModal = () => {
    setEditingPlanRecord(null);
    setPlanStep(0);
    planForm.resetFields();
    planForm.setFieldsValue({
      type: 'zone',
      zone: '',
      year: selectedYear !== 'ALL' ? Number(selectedYear) : 2018,
      quarter: selectedQuarter !== 'ALL' ? selectedQuarter : 'Q1',
      hillside_plan: 0,
      trenched_plan: 0,
      bench_plan: 0,
      upgrade_plan: 0
    });
    setIsPlanModalOpen(true);
  };

  const openEditPlanModal = (rec) => {
    setEditingPlanRecord(rec);
    setPlanStep(0);
    const activeQ = selectedQuarter !== 'ALL' ? selectedQuarter : 'Q1';
    const qData = rec.quarters?.[activeQ] || {};

    planForm.setFieldsValue({
      zone: rec.zone,
      type: rec.type,
      year: rec.year,
      quarter: activeQ,
      hillside_plan: qData.hillside_plan || 0,
      trenched_plan: qData.trenched_plan || 0,
      bench_plan: qData.bench_plan || 0,
      upgrade_plan: qData.upgrade_plan || 0
    });
    setIsPlanModalOpen(true);
  };

  const handleNextPlanStep = async () => {
    try {
      const stepFields = [
        ['zone', 'type', 'year', 'quarter'],
        ['hillside_plan', 'trenched_plan'],
        ['bench_plan', 'upgrade_plan']
      ];
      await planForm.validateFields(stepFields[planStep]);
      setPlanStep((prev) => prev + 1);
    } catch {
      message.warning('እባክዎ መረጃዎችን በትክክል ያረጋግጡ');
    }
  };

  const handleSavePlan = async () => {
    try {
      const values = await planForm.validateFields();
      const targetQuarter = values.quarter;

      setRecords((prev) => {
        const index = prev.findIndex((r) => r.zone === values.zone && Number(r.year) === Number(values.year));

        if (index > -1) {
          const updated = [...prev];
          const curr = updated[index];
          const currQuarters = curr.quarters || {};
          const currentQData = currQuarters[targetQuarter] || {};

          updated[index] = {
            ...curr,
            quarters: {
              ...currQuarters,
              [targetQuarter]: {
                ...currentQData,
                hillside_plan: values.hillside_plan,
                trenched_plan: values.trenched_plan,
                bench_plan: values.bench_plan,
                upgrade_plan: values.upgrade_plan
              }
            }
          };
          return updated;
        } else {
          const newRow = {
            id: `NEW-${Date.now()}`,
            no: prev.filter((r) => r.type === values.type).length + 1,
            zone: values.zone,
            type: values.type,
            year: values.year,
            quarters: {
              Q1: makeQuarterData(),
              Q2: makeQuarterData(),
              Q3: makeQuarterData(),
              Q4: makeQuarterData(),
              [targetQuarter]: {
                ...makeQuarterData(),
                hillside_plan: values.hillside_plan,
                trenched_plan: values.trenched_plan,
                bench_plan: values.bench_plan,
                upgrade_plan: values.upgrade_plan
              }
            }
          };
          return [...prev, newRow];
        }
      });

      message.success(`የ${values.zone} የ${values.year} ${targetQuarter} ዕቅድ ተመዝግቧል`);
      setIsPlanModalOpen(false);
    } catch {
      message.error('እባክዎ የተሳሳቱ መረጃዎችን ያስተካክሉ');
    }
  };

  // ───── 2. ACHIEVEMENT MODAL CONTROLS & WIZARD ─────
  const openLogAchModal = (rec) => {
    setEditingAchRecord(rec || null);
    setAchStep(0);
    achForm.resetFields();

    const activeQ = selectedQuarter !== 'ALL' ? selectedQuarter : 'Q1';

    if (rec) {
      const qData = rec.quarters?.[activeQ] || {};
      achForm.setFieldsValue({
        zone: rec.zone,
        type: rec.type,
        year: rec.year,
        quarter: activeQ,
        hillside_ach: qData.hillside_ach || 0,
        trenched_ach: qData.trenched_ach || 0,
        bench_ach: qData.bench_ach || 0,
        upgrade_ach: qData.upgrade_ach || 0
      });
    } else {
      achForm.setFieldsValue({
        type: 'zone',
        zone: '',
        year: selectedYear !== 'ALL' ? Number(selectedYear) : 2018,
        quarter: activeQ,
        hillside_ach: 0,
        trenched_ach: 0,
        bench_ach: 0,
        upgrade_ach: 0
      });
    }
    setIsAchModalOpen(true);
  };

  const handleNextAchStep = async () => {
    try {
      const stepFields = [
        ['zone', 'year', 'quarter'],
        ['hillside_ach', 'trenched_ach'],
        ['bench_ach', 'upgrade_ach']
      ];
      await achForm.validateFields(stepFields[achStep]);
      setAchStep((prev) => prev + 1);
    } catch {
      message.warning('እባክዎ መረጃዎችን በትክክል ያረጋግጡ');
    }
  };

  const handleSaveAchievement = async () => {
    try {
      const values = await achForm.validateFields();
      const targetQuarter = values.quarter;

      setRecords((prev) => {
        const index = prev.findIndex((r) => r.zone === values.zone && Number(r.year) === Number(values.year));

        if (index > -1) {
          const updated = [...prev];
          const curr = updated[index];
          const currQuarters = curr.quarters || {};
          const currentQData = currQuarters[targetQuarter] || {};

          updated[index] = {
            ...curr,
            quarters: {
              ...currQuarters,
              [targetQuarter]: {
                ...currentQData,
                hillside_ach: values.hillside_ach,
                trenched_ach: values.trenched_ach,
                bench_ach: values.bench_ach,
                upgrade_ach: values.upgrade_ach
              }
            }
          };
          return updated;
        } else {
          const newRow = {
            id: `NEW-${Date.now()}`,
            no: prev.filter((r) => r.type === values.type).length + 1,
            zone: values.zone,
            type: values.type,
            year: values.year,
            quarters: {
              Q1: makeQuarterData(),
              Q2: makeQuarterData(),
              Q3: makeQuarterData(),
              Q4: makeQuarterData(),
              [targetQuarter]: {
                ...makeQuarterData(),
                hillside_ach: values.hillside_ach,
                trenched_ach: values.trenched_ach,
                bench_ach: values.bench_ach,
                upgrade_ach: values.upgrade_ach
              }
            }
          };
          return [...prev, newRow];
        }
      });

      message.success(`የ${values.zone} የ${values.year} ${targetQuarter} ክንውን ተመዝግቧል`);
      setIsAchModalOpen(false);
    } catch {
      message.error('እባክዎ የተሳሳቱ መረጃዎችን ያስተካክሉ');
    }
  };

  // ───── CSV EXPORT (MATCHES OFFICIAL FORMAT EXACTLY) ─────
  const handleExportCSV = () => {
    const zoneRows = filteredRecords.filter((r) => r.type === 'zone');
    const cityRows = filteredRecords.filter((r) => r.type === 'city');
    const formatRate = (rate) => (rate ? Number(rate).toFixed(1) : '');

    const lines = [];

    const periodLabel = selectedQuarter === 'ALL' ? 'ዓመታዊ ድምር (Q1+Q2+Q3+Q4)' : `${selectedQuarter} ሩብ ዓመት`;
    lines.push(`በተራራ ላይ የሚሰሩ ፊዚካል እስትራክቸሮች (${selectedYear} ዓ.ም - ${periodLabel}),,,,,,,,,,,,`);
    lines.push('');

    lines.push(',,የጋራ ላይ እርከን/ሄ/ር,,የጋራ ላይ እርከን ፕላስ ትሬንች /ሄ/ር,,ጠረዼዛ ላይ እርከን/ሄ/ር,,የጋራ ላይ እርከን ደረጃ ማሳደግ/ሄ/ር,,ድምር,,');
    lines.push('ተ.ቁ,ዞን,እቅድ,ክንውን,እቅድ,ክንውን,እቅድ,ክንውን,እቅድ,ክንውን,እቅድ,ክንውን,%');

    // Section 1: Rural Zones
    zoneRows.forEach((r, idx) => {
      lines.push([
        idx + 1,
        `"${r.zone}"`,
        r.hillside_plan,
        r.hillside_ach,
        r.trenched_plan,
        r.trenched_ach,
        r.bench_plan,
        r.bench_ach,
        r.upgrade_plan,
        r.upgrade_ach,
        r.total_plan,
        r.total_ach,
        formatRate(r.performance_rate)
      ].join(','));
    });

    // Zone Subtotal
    const zs = calculations.zoneSub;
    lines.push([
      '',
      'ን/ድምር',
      zs.hPlan.toFixed(2),
      zs.hAch,
      zs.tPlan,
      zs.tAch,
      zs.bPlan,
      zs.bAch,
      zs.uPlan,
      zs.uAch,
      zs.totPlan,
      zs.totAch,
      formatRate(zs.rate)
    ].join(','));

    // Section 2: City Administrations Header
    lines.push(',ከተማአስተዳደር,,,,,,,,,,,');

    cityRows.forEach((r, idx) => {
      lines.push([
        idx + 1,
        `"${r.zone}"`,
        r.hillside_plan,
        r.hillside_ach,
        r.trenched_plan,
        r.trenched_ach,
        r.bench_plan,
        r.bench_ach,
        r.upgrade_plan,
        r.upgrade_ach,
        r.total_plan,
        r.total_ach,
        r.total_plan > 0 ? formatRate(r.performance_rate) : ''
      ].join(','));
    });

    // City Subtotal
    const cs = calculations.citySub;
    lines.push([
      '',
      'ን/ድምር',
      cs.hPlan.toFixed(2),
      cs.hAch,
      cs.tPlan,
      cs.tAch,
      cs.bPlan,
      cs.bAch,
      cs.uPlan,
      cs.uAch,
      cs.totPlan,
      cs.totAch,
      formatRate(cs.rate)
    ].join(','));

    // Section 3: Grand Total
    const g = calculations.grand;
    lines.push([
      '',
      'ጠ/ድምር',
      g.hPlan,
      g.hAch,
      g.tPlan,
      g.tAch,
      g.bPlan,
      g.bAch,
      g.uPlan,
      g.uAch,
      g.totPlan,
      g.totAch,
      formatRate(g.rate)
    ].join(','));

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + lines.join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `በተራራ_ላይ_የሚሰሩ_ፊዚካል_እስትራክቸሮች_${selectedYear}_${selectedQuarter}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success('የተሟላ የኤክሴል/CSV ሪፖርት ወርዷል');
  };

  // Table Columns Layout
  const columns = [
    {
      title: 'ተ.ቁ',
      dataIndex: 'no',
      key: 'no',
      width: 55,
      align: 'center',
      render: (val) => <span style={{ fontVariantNumeric: 'tabular-nums', color: '#88928c' }}>{val}</span>
    },
    {
      title: 'ዞን',
      dataIndex: 'zone',
      key: 'zone',
      fixed: 'left',
      width: 140,
      render: (text) => <Text strong style={{ color: '#153327' }}>{text}</Text>
    },
    {
      title: 'የጋራ ላይ እርከን/ሄ/ር',
      children: [
        {
          title: 'እቅድ',
          dataIndex: 'hillside_plan',
          key: 'hillside_plan',
          width: 95,
          align: 'right',
          render: (val) => (
            <span style={{ fontVariantNumeric: 'tabular-nums', color: '#555e59' }}>
              {val === 0 ? '0' : Number(val).toLocaleString(undefined, { maximumFractionDigits: 3 })}
            </span>
          )
        },
        {
          title: 'ክንውን',
          dataIndex: 'hillside_ach',
          key: 'hillside_ach',
          width: 95,
          align: 'right',
          render: (val) => (
            <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: '#153327' }}>
              {Number(val || 0).toLocaleString()}
            </span>
          )
        }
      ]
    },
    {
      title: 'የጋራ ላይ እርከን ፕላስ ትሬንች /ሄ/ር',
      children: [
        {
          title: 'እቅድ',
          dataIndex: 'trenched_plan',
          key: 'trenched_plan',
          width: 95,
          align: 'right',
          render: (val) => (
            <span style={{ fontVariantNumeric: 'tabular-nums', color: '#555e59' }}>
              {Number(val || 0).toLocaleString()}
            </span>
          )
        },
        {
          title: 'ክንውን',
          dataIndex: 'trenched_ach',
          key: 'trenched_ach',
          width: 95,
          align: 'right',
          render: (val) => (
            <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: '#153327' }}>
              {Number(val || 0).toLocaleString()}
            </span>
          )
        }
      ]
    },
    {
      title: 'ጠረዼዛ ላይ እርከን/ሄ/ር',
      children: [
        {
          title: 'እቅድ',
          dataIndex: 'bench_plan',
          key: 'bench_plan',
          width: 90,
          align: 'right',
          render: (val) => (
            <span style={{ fontVariantNumeric: 'tabular-nums', color: '#555e59' }}>
              {Number(val || 0).toLocaleString()}
            </span>
          )
        },
        {
          title: 'ክንውን',
          dataIndex: 'bench_ach',
          key: 'bench_ach',
          width: 90,
          align: 'right',
          render: (val) => (
            <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: '#153327' }}>
              {Number(val || 0).toLocaleString()}
            </span>
          )
        }
      ]
    },
    {
      title: 'የጋራ ላይ እርከን ደረጃ ማሳደግ/ሄ/ር',
      children: [
        {
          title: 'እቅድ',
          dataIndex: 'upgrade_plan',
          key: 'upgrade_plan',
          width: 95,
          align: 'right',
          render: (val) => (
            <span style={{ fontVariantNumeric: 'tabular-nums', color: '#555e59' }}>
              {Number(val || 0).toLocaleString()}
            </span>
          )
        },
        {
          title: 'ክንውን',
          dataIndex: 'upgrade_ach',
          key: 'upgrade_ach',
          width: 95,
          align: 'right',
          render: (val) => (
            <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: '#153327' }}>
              {Number(val || 0).toLocaleString()}
            </span>
          )
        }
      ]
    },
    {
      title: 'ድምር',
      children: [
        {
          title: 'እቅድ',
          dataIndex: 'total_plan',
          key: 'total_plan',
          width: 95,
          align: 'right',
          render: (val) => (
            <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: '#4a534e' }}>
              {Number(val || 0).toLocaleString()}
            </span>
          )
        },
        {
          title: 'ክንውን',
          dataIndex: 'total_ach',
          key: 'total_ach',
          width: 95,
          align: 'right',
          render: (val) => (
            <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700, color: '#153327' }}>
              {Number(val || 0).toLocaleString()}
            </span>
          )
        },
        {
          title: '%',
          dataIndex: 'performance_rate',
          key: 'performance_rate',
          width: 85,
          align: 'center',
          render: (val, r) => {
            if (r.total_plan === 0) return '—';
            const isExceeded = val >= 100;
            return (
              <span style={{
                fontVariantNumeric: 'tabular-nums',
                fontWeight: 700,
                color: isExceeded ? '#1e5e3a' : '#8a5b14',
                padding: '2px 6px',
                borderRadius: '4px',
                background: isExceeded ? '#edf7f1' : '#fdf6e9'
              }}>
                {val}%
              </span>
            );
          }
        }
      ]
    },
    {
      title: 'ተግባራት',
      key: 'action',
      width: 140,
      align: 'center',
      fixed: 'right',
      render: (_, r) => (
        <Space size={4}>
          <Button
            size="small"
            style={{ fontSize: '11px', borderColor: '#b6c4bc', color: '#153327' }}
            onClick={() => openLogAchModal(r)}
          >
            ክንውን
          </Button>
          <Tooltip title="ዕቅድ አሻሽል">
            <Button
              size="small"
              type="text"
              icon={<EditOutlined style={{ color: '#555e59' }} />}
              onClick={() => openEditPlanModal(r)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* ───── 1. INSTITUTIONAL HEADER ───── */}
      <Card
        bordered={false}
        style={{
          borderRadius: '8px',
          background: '#153327',
          color: '#ffffff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
        }}
        bodyStyle={{ padding: '20px 24px' }}
      >
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} md={15}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#97deb8', fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 600 }}>
                  የአማራ ብሔራዊ ክልላዊ መንግሥት ግብርና ቢሮ · የተፋሰስ ልማትና ጥበቃ ዳይሬክቶሬት
                </span>
                <Tag style={{ background: 'rgba(255,255,255,0.1)', color: '#d8f3e5', border: '1px solid rgba(255,255,255,0.2)', fontSize: '10px' }}>
                  ክፍል 4.3.3
                </Tag>
              </div>

              <Title level={3} style={{ color: '#ffffff', margin: 0, fontWeight: 700, letterSpacing: '-0.2px' }}>
                በተራራ ላይ የሚሰሩ ፊዚካል እስትራክቸሮች
              </Title>
              <Text style={{ color: '#badbc9', fontSize: '12px' }}>
                የዞኖችና የከተማ አስተዳደሮች የጋራ ተራራ ላይ እርከን፣ ትሬንችና ደረጃ ማሳደግ የዕቅድና ክንውን ማጠቃለያ
              </Text>
            </div>
          </Col>

          <Col xs={24} md={9} style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Space wrap size="small">
              <Button
                icon={<CalendarOutlined />}
                onClick={openCreatePlanModal}
                style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', borderColor: 'rgba(255,255,255,0.35)', fontWeight: 500 }}
              >
                + ዕቅድ መዝግብ
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => openLogAchModal(null)}
                style={{ background: '#225940', borderColor: '#2f7555', fontWeight: 600 }}
              >
                + ክንውን መዝግብ
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* ───── 2. SUMMARY METRIC STRIP ───── */}
      <Row gutter={[12, 12]}>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: '6px', border: '1px solid #e1e7e3', background: '#ffffff' }} bodyStyle={{ padding: '14px 16px' }}>
            <Text type="secondary" style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 600 }}>
              {selectedQuarter === 'ALL' ? 'ዓመታዊ ድምር ዕቅድ' : `${selectedQuarter} ዕቅድ`}
            </Text>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#153327', marginTop: '2px', fontVariantNumeric: 'tabular-nums' }}>
              {calculations.grand.totPlan.toLocaleString()} <span style={{ fontSize: '11px', fontWeight: 400, color: '#737b77' }}>Ha</span>
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: '6px', border: '1px solid #e1e7e3', background: '#ffffff' }} bodyStyle={{ padding: '14px 16px' }}>
            <Text type="secondary" style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 600 }}>
              {selectedQuarter === 'ALL' ? 'ዓመታዊ ድምር ክንውን' : `${selectedQuarter} ክንውን`}
            </Text>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#153327', marginTop: '2px', fontVariantNumeric: 'tabular-nums' }}>
              {calculations.grand.totAch.toLocaleString()} <span style={{ fontSize: '11px', fontWeight: 400, color: '#737b77' }}>Ha</span>
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: '6px', border: '1px solid #e1e7e3', background: '#ffffff' }} bodyStyle={{ padding: '14px 16px' }}>
            <Text type="secondary" style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 600 }}>አማካይ አፈፃፀም</Text>
            <div style={{ fontSize: '20px', fontWeight: 700, color: calculations.grand.rate >= 100 ? '#1e5e3a' : '#8a5b14', marginTop: '2px', fontVariantNumeric: 'tabular-nums' }}>
              {calculations.grand.rate}%
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: '6px', border: '1px solid #e1e7e3', background: '#ffffff' }} bodyStyle={{ padding: '14px 16px' }}>
            <Text type="secondary" style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 600 }}>የጋራ እርከን ክንውን</Text>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#153327', marginTop: '2px', fontVariantNumeric: 'tabular-nums' }}>
              {calculations.grand.hAch.toLocaleString()} <span style={{ fontSize: '11px', fontWeight: 400, color: '#737b77' }}>Ha</span>
            </div>
          </Card>
        </Col>
      </Row>

      {/* ───── 3. TEMPORAL & ADMINISTRATIVE FILTER TOOLBAR ───── */}
      <Card bordered={false} style={{ borderRadius: '6px', border: '1px solid #e1e7e3', background: '#ffffff' }} bodyStyle={{ padding: '12px 16px' }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={6} md={5}>
            <Input
              prefix={<SearchOutlined style={{ color: '#88928c' }} />}
              placeholder="ዞን ወይም ከተማ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              allowClear
            />
          </Col>

          <Col xs={12} sm={6} md={4}>
            <Select style={{ width: '100%' }} value={selectedType} onChange={setSelectedType}>
              <Option value="ALL">ሁሉንም አሳይ (All)</Option>
              <Option value="zone">ዞኖች ብቻ (Zones)</Option>
              <Option value="city">ከተሞች ብቻ (Cities)</Option>
            </Select>
          </Col>

          {/* FISCAL YEAR FILTER */}
          <Col xs={12} sm={6} md={3}>
            <Select style={{ width: '100%' }} value={selectedYear} onChange={setSelectedYear}>
              <Option value="ALL">ሁሉም ዓመታት</Option>
              {availableYears.map((yr) => (
                <Option key={yr} value={yr}>{yr} ዓ.ም</Option>
              ))}
            </Select>
          </Col>

          {/* DYNAMIC QUARTER FILTER */}
          <Col xs={24} sm={6} md={7}>
            <Segmented
              value={selectedQuarter}
              onChange={setSelectedQuarter}
              options={[
                { label: 'ዓመታዊ (ድምር)', value: 'ALL' },
                { label: '1ኛ ሩብ (Q1)', value: 'Q1' },
                { label: '2ኛ ሩብ (Q2)', value: 'Q2' },
                { label: '3ኛ ሩብ (Q3)', value: 'Q3' },
                { label: '4ኛ ሩብ (Q4)', value: 'Q4' }
              ]}
              style={{ background: '#f0f3f1', fontWeight: 500 }}
            />
          </Col>

          <Col xs={24} sm={24} md={5} style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                setSearchQuery('');
                setSelectedType('ALL');
                setSelectedYear(2018);
                setSelectedQuarter('ALL');
              }}
            >
              አድስ
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleExportCSV}
              style={{ borderColor: '#b6c4bc', color: '#153327', fontWeight: 600 }}
            >
              Export CSV
            </Button>
          </Col>
        </Row>
      </Card>

      {/* ───── 4. THE MATRIX TABLE ───── */}
      <Card bordered={false} style={{ borderRadius: '6px', border: '1px solid #e1e7e3', background: '#ffffff' }} bodyStyle={{ padding: '8px' }}>
        <Table
          columns={columns}
          dataSource={filteredRecords}
          rowKey="id"
          bordered
          scroll={{ x: 1250 }}
          pagination={false}
          summary={() => {
            const zs = calculations.zoneSub;
            const cs = calculations.citySub;
            const g = calculations.grand;

            return (
              <Table.Summary fixed="bottom">
                {/* Zone Subtotal */}
                {(selectedType === 'ALL' || selectedType === 'zone') && (
                  <Table.Summary.Row style={{ background: '#fafbfa', fontWeight: 600 }}>
                    <Table.Summary.Cell index={0} align="center"></Table.Summary.Cell>
                    <Table.Summary.Cell index={1}><Text strong style={{ color: '#153327' }}>ን/ድምር (ዞኖች)</Text></Table.Summary.Cell>
                    <Table.Summary.Cell index={2} align="right">{zs.hPlan.toFixed(2)}</Table.Summary.Cell>
                    <Table.Summary.Cell index={3} align="right" style={{ color: '#153327' }}>{zs.hAch}</Table.Summary.Cell>
                    <Table.Summary.Cell index={4} align="right">{zs.tPlan}</Table.Summary.Cell>
                    <Table.Summary.Cell index={5} align="right" style={{ color: '#153327' }}>{zs.tAch}</Table.Summary.Cell>
                    <Table.Summary.Cell index={6} align="right">{zs.bPlan}</Table.Summary.Cell>
                    <Table.Summary.Cell index={7} align="right" style={{ color: '#153327' }}>{zs.bAch}</Table.Summary.Cell>
                    <Table.Summary.Cell index={8} align="right">{zs.uPlan}</Table.Summary.Cell>
                    <Table.Summary.Cell index={9} align="right" style={{ color: '#153327' }}>{zs.uAch}</Table.Summary.Cell>
                    <Table.Summary.Cell index={10} align="right">{zs.totPlan}</Table.Summary.Cell>
                    <Table.Summary.Cell index={11} align="right" style={{ color: '#153327' }}>{zs.totAch}</Table.Summary.Cell>
                    <Table.Summary.Cell index={12} align="center">
                      <span style={{ fontWeight: 700, color: zs.rate >= 100 ? '#1e5e3a' : '#8a5b14' }}>{zs.rate}%</span>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={13} align="center">—</Table.Summary.Cell>
                  </Table.Summary.Row>
                )}

                {/* City Subtotal */}
                {(selectedType === 'ALL' || selectedType === 'city') && (
                  <Table.Summary.Row style={{ background: '#fafbfa', fontWeight: 600 }}>
                    <Table.Summary.Cell index={0} align="center"></Table.Summary.Cell>
                    <Table.Summary.Cell index={1}><Text strong style={{ color: '#153327' }}>ን/ድምር (ከተሞች)</Text></Table.Summary.Cell>
                    <Table.Summary.Cell index={2} align="right">{cs.hPlan.toFixed(2)}</Table.Summary.Cell>
                    <Table.Summary.Cell index={3} align="right" style={{ color: '#153327' }}>{cs.hAch}</Table.Summary.Cell>
                    <Table.Summary.Cell index={4} align="right">{cs.tPlan}</Table.Summary.Cell>
                    <Table.Summary.Cell index={5} align="right" style={{ color: '#153327' }}>{cs.tAch}</Table.Summary.Cell>
                    <Table.Summary.Cell index={6} align="right">{cs.bPlan}</Table.Summary.Cell>
                    <Table.Summary.Cell index={7} align="right" style={{ color: '#153327' }}>{cs.bAch}</Table.Summary.Cell>
                    <Table.Summary.Cell index={8} align="right">{cs.uPlan}</Table.Summary.Cell>
                    <Table.Summary.Cell index={9} align="right" style={{ color: '#153327' }}>{cs.uAch}</Table.Summary.Cell>
                    <Table.Summary.Cell index={10} align="right">{cs.totPlan}</Table.Summary.Cell>
                    <Table.Summary.Cell index={11} align="right" style={{ color: '#153327' }}>{cs.totAch}</Table.Summary.Cell>
                    <Table.Summary.Cell index={12} align="center">
                      <span style={{ fontWeight: 700, color: cs.rate >= 100 ? '#1e5e3a' : '#8a5b14' }}>{cs.rate}%</span>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={13} align="center">—</Table.Summary.Cell>
                  </Table.Summary.Row>
                )}

                {/* Grand Total */}
                <Table.Summary.Row style={{ background: '#edf3ef', fontWeight: 700 }}>
                  <Table.Summary.Cell index={0} align="center"></Table.Summary.Cell>
                  <Table.Summary.Cell index={1}><Text strong style={{ color: '#153327' }}>ጠ/ድምር</Text></Table.Summary.Cell>
                  <Table.Summary.Cell index={2} align="right">{g.hPlan}</Table.Summary.Cell>
                  <Table.Summary.Cell index={3} align="right" style={{ color: '#153327' }}>{g.hAch}</Table.Summary.Cell>
                  <Table.Summary.Cell index={4} align="right">{g.tPlan}</Table.Summary.Cell>
                  <Table.Summary.Cell index={5} align="right" style={{ color: '#153327' }}>{g.tAch}</Table.Summary.Cell>
                  <Table.Summary.Cell index={6} align="right">{g.bPlan}</Table.Summary.Cell>
                  <Table.Summary.Cell index={7} align="right" style={{ color: '#153327' }}>{g.bAch}</Table.Summary.Cell>
                  <Table.Summary.Cell index={8} align="right">{g.uPlan}</Table.Summary.Cell>
                  <Table.Summary.Cell index={9} align="right" style={{ color: '#153327' }}>{g.uAch}</Table.Summary.Cell>
                  <Table.Summary.Cell index={10} align="right">{g.totPlan}</Table.Summary.Cell>
                  <Table.Summary.Cell index={11} align="right" style={{ color: '#153327' }}>{g.totAch}</Table.Summary.Cell>
                  <Table.Summary.Cell index={12} align="center">
                    <span style={{
                      fontWeight: 800,
                      color: g.rate >= 100 ? '#1e5e3a' : '#8a5b14',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: '#ffffff'
                    }}>
                      {g.rate}%
                    </span>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={13} align="center">—</Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            );
          }}
        />
      </Card>

      {/* ───── 5. SEPARATE MODAL: PLAN WIZARD WITH QUARTER SELECTION ───── */}
      <Modal
        title={
          <div>
            <div style={{ fontWeight: 700, color: '#153327', fontSize: '15px' }}>
              {editingPlanRecord ? `የ${editingPlanRecord.zone} የሩብ ዓመት ዕቅድ ማሻሻያ` : 'የሩብ ዓመት የተራራ ላይ ፊዚካል እስትራክቸሮች ዕቅድ መመዝገቢያ'}
            </div>
            <Text type="secondary" style={{ fontSize: '11px' }}>
              Quarterly Target Planning (በሄክታር - Ha) · ዓመታዊ ድምር ከሩብ ዓመታት ድምር በራሱ ይሰላል
            </Text>
          </div>
        }
        open={isPlanModalOpen}
        onCancel={() => setIsPlanModalOpen(false)}
        width={680}
        destroyOnClose
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              {planStep > 0 && (
                <Button icon={<LeftOutlined />} onClick={() => setPlanStep((prev) => prev - 1)}>
                  ወደ ኋላ
                </Button>
              )}
            </div>

            <Space>
              <Button onClick={() => setIsPlanModalOpen(false)}>ሰርዝ</Button>
              {planStep < 2 ? (
                <Button type="primary" style={{ background: '#153327', borderColor: '#153327' }} onClick={handleNextPlanStep}>
                  ቀጣይ <RightOutlined />
                </Button>
              ) : (
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  style={{ background: '#153327', borderColor: '#153327' }}
                  onClick={handleSavePlan}
                >
                  ዕቅድ መዝግብ
                </Button>
              )}
            </Space>
          </div>
        }
      >
        <div style={{ padding: '8px 4px 16px' }}>
          <Steps
            current={planStep}
            size="small"
            items={[
              { title: 'ዞንና ሩብ ዓመት' },
              { title: 'የጋራ እርከንና ትሬንች' },
              { title: 'ጠረዼዛና ማሳደግ' }
            ]}
          />
        </div>

        <Form form={planForm} layout="vertical">
          {planStep === 0 && (
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="type" label="አስተዳደራዊ አይነት" rules={[{ required: true }]}>
                  <Select>
                    <Option value="zone">ዞን (Zone)</Option>
                    <Option value="city">ከተማ አስተዳደር (City Administration)</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="zone" label="የዞን/ከተማ ስም" rules={[{ required: true, message: 'ስም ያስገቡ' }]}>
                  <Input placeholder="e.g. ምስራቅ ጎጃም ወይም ባህርዳር" />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item name="year" label="የበጀት ዓመት" rules={[{ required: true }]}>
                  <InputNumber style={{ width: '100%' }} min={2010} max={2035} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="quarter" label="የዕቅድ ሩብ ዓመት (Quarter)" rules={[{ required: true, message: 'ሩብ ዓመት ይምረጡ' }]}>
                  <Select>
                    <Option value="Q1">1ኛ ሩብ ዓመት (Q1)</Option>
                    <Option value="Q2">2ኛ ሩብ ዓመት (Q2)</Option>
                    <Option value="Q3">3ኛ ሩብ ዓመት (Q3)</Option>
                    <Option value="Q4">4ኛ ሩብ ዓመት (Q4)</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          )}

          {planStep === 1 && (
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="hillside_plan" label="የጋራ ላይ እርከን ዕቅድ (ሄ/ር)" rules={[{ required: true }]}>
                  <InputNumber style={{ width: '100%' }} step={0.1} min={0} placeholder="0.0" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="trenched_plan" label="የጋራ ላይ እርከን ፕላስ ትሬንች ዕቅድ (ሄ/ር)" rules={[{ required: true }]}>
                  <InputNumber style={{ width: '100%' }} step={0.1} min={0} placeholder="0.0" />
                </Form.Item>
              </Col>
            </Row>
          )}

          {planStep === 2 && (
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="bench_plan" label="ጠረዼዛ ላይ እርከን ዕቅድ (ሄ/ር)" rules={[{ required: true }]}>
                  <InputNumber style={{ width: '100%' }} step={0.1} min={0} placeholder="0.0" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="upgrade_plan" label="እርከን ደረጃ ማሳደግ ዕቅድ (ሄ/ር)" rules={[{ required: true }]}>
                  <InputNumber style={{ width: '100%' }} step={0.1} min={0} placeholder="0.0" />
                </Form.Item>
              </Col>
            </Row>
          )}
        </Form>
      </Modal>

      {/* ───── 6. SEPARATE MODAL: ACHIEVEMENT WIZARD WITH QUARTER SELECTION ───── */}
      <Modal
        title={
          <div>
            <div style={{ fontWeight: 700, color: '#153327', fontSize: '15px' }}>
              {editingAchRecord ? `የ${editingAchRecord.zone} የሩብ ዓመት ክንውን መመዝገቢያ` : 'የሩብ ዓመት የተራራ ላይ ፊዚካል እስትራክቸሮች ክንውን መመዝገቢያ'}
            </div>
            <Text type="secondary" style={{ fontSize: '11px' }}>
              Quarterly Actual Measurements Reporting (በሄክታር - Ha) · ዓመታዊ ክንውን በራሱ ይደመራል
            </Text>
          </div>
        }
        open={isAchModalOpen}
        onCancel={() => setIsAchModalOpen(false)}
        width={680}
        destroyOnClose
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              {achStep > 0 && (
                <Button icon={<LeftOutlined />} onClick={() => setAchStep((prev) => prev - 1)}>
                  ወደ ኋላ
                </Button>
              )}
            </div>

            <Space>
              <Button onClick={() => setIsAchModalOpen(false)}>ሰርዝ</Button>
              {achStep < 2 ? (
                <Button type="primary" style={{ background: '#153327', borderColor: '#153327' }} onClick={handleNextAchStep}>
                  ቀጣይ <RightOutlined />
                </Button>
              ) : (
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  style={{ background: '#153327', borderColor: '#153327' }}
                  onClick={handleSaveAchievement}
                >
                  ክንውን መዝግብ
                </Button>
              )}
            </Space>
          </div>
        }
      >
        <div style={{ padding: '8px 4px 16px' }}>
          <Steps
            current={achStep}
            size="small"
            items={[
              { title: 'ዞንና ሩብ ዓመት' },
              { title: 'የጋራ እርከንና ትሬንች' },
              { title: 'ጠረዼዛና ማሳደግ' }
            ]}
          />
        </div>

        <Form form={achForm} layout="vertical">
          {achStep === 0 && (
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="type" label="አስተዳደራዊ አይነት" rules={[{ required: true }]}>
                  <Select disabled={!!editingAchRecord}>
                    <Option value="zone">ዞን (Zone)</Option>
                    <Option value="city">ከተማ አስተዳደር (City Administration)</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="zone" label="የዞን/ከተማ ስም" rules={[{ required: true, message: 'ስም ያስገቡ' }]}>
                  <Input placeholder="e.g. ምስራቅ ጎጃም ወይም ባህርዳር" disabled={!!editingAchRecord} />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item name="year" label="የበጀት ዓመት" rules={[{ required: true }]}>
                  <InputNumber style={{ width: '100%' }} min={2010} max={2035} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="quarter" label="የክንውን ሩብ ዓመት (Quarter)" rules={[{ required: true, message: 'ሩብ ዓመት ይምረጡ' }]}>
                  <Select>
                    <Option value="Q1">1ኛ ሩብ ዓመት (Q1)</Option>
                    <Option value="Q2">2ኛ ሩብ ዓመት (Q2)</Option>
                    <Option value="Q3">3ኛ ሩብ ዓመት (Q3)</Option>
                    <Option value="Q4">4ኛ ሩብ ዓመት (Q4)</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          )}

          {achStep === 1 && (
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="hillside_ach" label="የጋራ ላይ እርከን ክንውን (ሄ/ር)" rules={[{ required: true }]}>
                  <InputNumber style={{ width: '100%' }} step={0.1} min={0} placeholder="0.0" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="trenched_ach" label="የጋራ ላይ እርከን ፕላስ ትሬንች ክንውን (ሄ/ር)" rules={[{ required: true }]}>
                  <InputNumber style={{ width: '100%' }} step={0.1} min={0} placeholder="0.0" />
                </Form.Item>
              </Col>
            </Row>
          )}

          {achStep === 2 && (
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="bench_ach" label="ጠረዼዛ ላይ እርከን ክንውን (ሄ/ር)" rules={[{ required: true }]}>
                  <InputNumber style={{ width: '100%' }} step={0.1} min={0} placeholder="0.0" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="upgrade_ach" label="እርከን ደረጃ ማሳደግ ክንውን (ሄ/ር)" rules={[{ required: true }]}>
                  <InputNumber style={{ width: '100%' }} step={0.1} min={0} placeholder="0.0" />
                </Form.Item>
              </Col>
            </Row>
          )}
        </Form>
      </Modal>

    </div>
  );
}