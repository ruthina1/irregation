import React, { useState, useEffect, useMemo } from "react";
import { 
  Row, Col, Card, Typography, Select, Space, Statistic, Progress, Alert, Table, Tag, Modal, List 
} from "antd";
import { 
  FundOutlined, DashboardOutlined, TrophyOutlined, AimOutlined, CheckCircleOutlined,
  RobotOutlined, SafetyCertificateOutlined, FileTextOutlined, ThunderboltOutlined,
  WarningOutlined, BulbOutlined, RiseOutlined, BranchesOutlined, PieChartOutlined
} from "@ant-design/icons";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area 
} from "recharts";
import dayjs from "dayjs";
import { meraApi } from "../../services/api/meraApi";
import { handleApiError } from "../../utils/errorHandler";
import BrandedLoader from "../../components/common/BrandedLoader";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

/* ---------- Design Tokens (From your elegant UI) ---------- */
const COLORS = {
  bg: '#F5F3EC',
  surface: '#FFFFFF',
  border: '#E5E1D3',
  ink: '#1D241F',
  inkMuted: '#66705F',
  primary: '#1F6D4C',
  primaryDark: '#0F3D2C',
  primaryLight: '#3E9E72',
  gold: '#C68A1F',
  goldLight: '#E8B84B',
  terracotta: '#B4562B',
  sky: '#2C6E8E',
  rose: '#A6436B',
  danger: '#B3261E',
};

const STATUS_COLORS = { Approved: COLORS.primaryLight, Pending: COLORS.gold, Rejected: COLORS.danger };
const SECTOR_COLORS = [COLORS.primary, COLORS.sky, COLORS.gold, COLORS.terracotta, COLORS.rose, '#588157', '#3D5A80'];

const FONT_DISPLAY = "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'Times New Roman', serif";
const FONT_BODY = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

/* ---------- Reusable UI Primitives ---------- */
const ChartCard = ({ title, subtitle, icon, span = 8, children, height = 400 }) => (
  <Col xs={24} md={12} lg={span}>
    <Card
      className="mera-card"
      bordered={false}
      style={{ borderRadius: 14, border: `1px solid ${COLORS.border}`, boxShadow: '0 2px 10px rgba(15,61,46,0.05)', height: '100%' }}
      bodyStyle={{ padding: '20px 24px', height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: COLORS.ink, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {icon} {title}
        </div>
        {subtitle && <div style={{ fontSize: 11.5, color: COLORS.inkMuted, marginTop: 4 }}>{subtitle}</div>}
      </div>
      <div style={{ flex: 1, minHeight: height - 100 }}>
        {children}
      </div>
    </Card>
  </Col>
);

const SectionHeader = ({ icon, title, description }) => (
  <div style={{ margin: '36px 0 24px', display: 'flex', alignItems: 'center', gap: 14 }}>
    <div
      style={{
        flex: '0 0 auto', width: 44, height: 44, borderRadius: 12,
        background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryLight})`,
        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20, boxShadow: '0 6px 14px rgba(31,109,76,0.28)',
      }}
    >
      {icon}
    </div>
    <div>
      <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.ink, fontFamily: FONT_DISPLAY, letterSpacing: '0.2px' }}>{title}</div>
      {description && <div style={{ fontSize: 13, color: COLORS.inkMuted, marginTop: 2 }}>{description}</div>}
    </div>
    <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${COLORS.border}, transparent)`, marginLeft: 16 }} />
  </div>
);

export default function StrategicPlanAnalysis() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trendFilter, setTrendFilter] = useState('Monthly'); // Monthly, Quarterly, Yearly
  const [isSummaryModalVisible, setIsSummaryModalVisible] = useState(false);

  useEffect(() => {
    const fetchAllPlans = async () => {
      setLoading(true);
      try {
        const { data } = await meraApi.getStrategicPlans({ per_page: 1000 });
        setPlans(data.data?.data || []);
      } catch (err) {
        handleApiError(err, "Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    };
    fetchAllPlans();
  }, []);

  // --- DATA AGGREGATION LOGIC ---
  const analyticsData = useMemo(() => {
    let totalPlans = plans.length;
    let statusCounts = { Approved: 0, Pending: 0, Rejected: 0 };
    let sectorMap = {};
    let indicatorList = [];
    let trendMap = {};
    let overallTarget = 0;
    let overallAchievement = 0;

    plans.forEach(plan => {
      const status = plan.status || 'Pending';
      if (statusCounts[status] !== undefined) statusCounts[status]++;

      if (!sectorMap[plan.sector]) {
        sectorMap[plan.sector] = { sector: plan.sector || 'Unassigned', planned: 0, achieved: 0 };
      }

      plan.tasks?.forEach(task => {
        task.sub_tasks?.forEach(sub => {
          sub.indicators?.forEach(ind => {
            ind.metrics?.forEach(m => {
              const target = Number(m.annual_plan) || 0;
              const achieved = Number(m.achievement_up_to_this_quarter) || 0;
              const qAchieved = Number(m.achievement_this_quarter) || 0;
              let perf = Number(m.performance_up_to_this_quarter);
              
              if (!perf && target > 0) perf = (achieved / target) * 100;
              if (!perf) perf = 0;

              overallTarget += target;
              overallAchievement += achieved;
              sectorMap[plan.sector].planned += target;
              sectorMap[plan.sector].achieved += achieved;

              // Timeline Trend Aggregation
              const dateObj = dayjs(m.updated_at || plan.created_at);
              let timeKey = dateObj.format('MMM YYYY');
              if (trendFilter === 'Quarterly') timeKey = `Q${Math.floor(dateObj.month() / 3) + 1} ${dateObj.year()}`;
              if (trendFilter === 'Yearly') timeKey = dateObj.format('YYYY');

              if (!trendMap[timeKey]) trendMap[timeKey] = { time: timeKey, timestamp: dateObj.valueOf(), achieved: 0 };
              trendMap[timeKey].achieved += qAchieved;

              indicatorList.push({
                key: m.id || Math.random(),
                goalTitle: plan.title,
                sector: plan.sector,
                indicatorName: ind.name,
                unit: ind.unit,
                target, achieved,
                performance: perf > 100 ? 100 : perf.toFixed(1)
              });
            });
          });
        });
      });
    });

    const sectorChartData = Object.values(sectorMap).map(s => ({
      ...s, performance: s.planned > 0 ? ((s.achieved / s.planned) * 100).toFixed(1) : 0
    }));

    const statusChartData = Object.keys(statusCounts).map(key => ({ name: key, value: statusCounts[key] }));
    const trendData = Object.values(trendMap).sort((a, b) => a.timestamp - b.timestamp);
    const overallPerformance = overallTarget > 0 ? ((overallAchievement / overallTarget) * 100).toFixed(1) : 0;
    const topIndicators = indicatorList.sort((a, b) => b.performance - a.performance);

    // Dynamic AI Insights Generator
    let insights = [];
    if (overallPerformance < 50) insights.push(`System-wide performance is underperforming at ${overallPerformance}%. Immediate strategic interventions are required to accelerate milestone achievements.`);
    else insights.push(`System-wide performance is solid at ${overallPerformance}%. Continual monitoring will secure annual targets.`);
    
    if (sectorChartData.length > 0) {
      const topSector = [...sectorChartData].sort((a,b) => b.performance - a.performance)[0];
      insights.push(`The ${topSector.sector} sector is currently leading with an execution rate of ${topSector.performance}%.`);
    }

    let recommendations = [];
    if (statusCounts.Pending > 0) recommendations.push({ type: 'warning', text: `There are ${statusCounts.Pending} strategic plans awaiting verification. Expedite the approval pipeline.` });
    if (overallPerformance < 75) recommendations.push({ type: 'danger', text: `Target deficit detected. Recommend mobilizing supplementary resources to underperforming indicators immediately.` });
    if (recommendations.length === 0) recommendations.push({ type: 'success', text: `Operational velocity is optimal. Maintain current reporting cycles.`});

    return {
      totalPlans, approvedPlans: statusCounts.Approved, overallPerformance,
      totalIndicators: indicatorList.length, sectorChartData, statusChartData, trendData, topIndicators,
      narrative: { insights }, recommendations
    };
  }, [plans, trendFilter]);

  const columns = [
    { title: 'Sector', dataIndex: 'sector', key: 'sector', width: 120, render: t => <Tag color="blue" style={{borderRadius: 12}}>{t}</Tag> },
    { title: 'Strategic Goal', dataIndex: 'goalTitle', key: 'goal', ellipsis: true },
    { title: 'Metric / Indicator', dataIndex: 'indicatorName', key: 'ind' },
    { title: 'Annual Target', dataIndex: 'target', key: 'target', align: 'right', render: v => v?.toLocaleString() },
    { title: 'Achieved (YTD)', dataIndex: 'achieved', key: 'achieved', align: 'right', render: v => <strong style={{color: COLORS.primary}}>{v?.toLocaleString()}</strong> },
    { 
      title: 'Execution Rate', dataIndex: 'performance', key: 'perf', width: 220,
      render: (val) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Progress percent={Number(val)} size="small" style={{ flex: 1 }} strokeColor={val >= 90 ? COLORS.primaryLight : val < 50 ? COLORS.danger : COLORS.sky} showInfo={false} />
          <span style={{ fontSize: 12, fontWeight: 600, minWidth: 40, textAlign: 'right' }}>{val}%</span>
        </div>
      )
    }
  ];

  return (
    <div style={{ padding: '24px', backgroundColor: COLORS.bg, minHeight: '100vh', fontFamily: FONT_BODY }}>
      <style>{`
        .mera-card { transition: transform .22s ease, box-shadow .22s ease; }
        .mera-card:hover { transform: translateY(-3px); box-shadow: 0 14px 30px rgba(15,61,46,0.12); }
        .mera-fade { animation: meraFade .6s ease both; }
        @keyframes meraFade { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        @keyframes aiPulse {
          0% { box-shadow: 0 0 0 0 rgba(198, 138, 31, 0.4); }
          70% { box-shadow: 0 0 0 12px rgba(198, 138, 31, 0); }
          100% { box-shadow: 0 0 0 0 rgba(198, 138, 31, 0); }
        }
        .ai-innovative-btn {
          background: linear-gradient(135deg, ${COLORS.primaryDark}, ${COLORS.gold}); border: none; color: white;
          padding: 0 32px; height: 56px; border-radius: 28px; font-size: 16px; font-weight: 700;
          font-family: ${FONT_BODY}; cursor: pointer; display: flex; align-items: center; gap: 12px; margin: 0 auto 36px;
          box-shadow: 0 8px 24px rgba(31,109,76,0.3); transition: all 0.3s ease; animation: aiPulse 2.5s infinite;
        }
        .ai-innovative-btn:hover {
          transform: translateY(-2px) scale(1.02); box-shadow: 0 12px 30px rgba(198, 138, 31, 0.4);
          background: linear-gradient(135deg, ${COLORS.primary}, ${COLORS.goldLight});
        }
        
        .ai-modal .ant-modal-content { border-radius: 20px; overflow: hidden; padding: 0 !important; box-shadow: 0 25px 60px rgba(198, 138, 31, 0.25) !important; }
        .ai-modal .ant-modal-close { color: white; top: 20px; right: 24px; }
      `}</style>

      {loading && <BrandedLoader message="Aggregating MERA Analytics..." />}

      {/* ─── HEADER ─── */}
      <Card
        bodyStyle={{ padding: '20px 28px' }}
        style={{ marginBottom: 28, borderRadius: 16, border: `1px solid ${COLORS.border}`, boxShadow: '0 8px 24px rgba(15,61,46,0.06)', position: 'sticky', top: 12, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(10px)' }}
      >
        <Row align="middle" justify="space-between">
          <Col>
            <Title level={4} style={{ margin: 0, color: COLORS.ink, fontWeight: 700, fontFamily: FONT_DISPLAY }}>
              <FundOutlined style={{ color: COLORS.primary, marginRight: 10 }} />
              Strategic Execution & Analytics Dashboard
            </Title>
            <Text style={{ color: COLORS.inkMuted, fontSize: 13 }}>Live performance monitoring across all directorates and strategic goals.</Text>
          </Col>
        </Row>
      </Card>

      <div className="mera-fade">
        {/* ─── AI TRIGGER ─── */}
        <button className="ai-innovative-btn" onClick={() => setIsSummaryModalVisible(true)}>
          <RobotOutlined style={{ fontSize: 24 }} /> Generative Insights & Recommendations <BulbOutlined style={{ color: '#FFF8E7' }} />
        </button>

        {/* ─── AI MODAL ─── */}
        <Modal
          open={isSummaryModalVisible}
          onCancel={() => setIsSummaryModalVisible(false)}
          footer={null} width={850} centered className="ai-modal"
          styles={{ body: { padding: 0 } }}
        >
          <div style={{ background: `linear-gradient(145deg, ${COLORS.primaryDark}, ${COLORS.primary}, #1B5940)`, padding: '34px 40px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 220, height: 220, borderRadius: '50%', background: `radial-gradient(circle, ${COLORS.goldLight}44 0%, transparent 70%)`, pointerEvents: 'none' }} />
            <Space align="center" size={12}>
              <RobotOutlined style={{ fontSize: 32, color: COLORS.goldLight }} />
              <Title level={3} style={{ margin: 0, color: '#fff', fontFamily: FONT_DISPLAY, fontWeight: 700 }}>Executive Narrative & Actions</Title>
            </Space>
          </div>
          <div style={{ padding: '36px 40px', background: COLORS.surface }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.primary, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12 }}>
                <FileTextOutlined style={{ marginRight: 6 }} /> System Narrative Insights
              </div>
              <Paragraph style={{ fontSize: 16.5, lineHeight: 1.85, color: COLORS.ink, fontFamily: FONT_DISPLAY }}>
                {analyticsData.narrative.insights.join(' ')}
              </Paragraph>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.terracotta, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 16 }}>
                <ThunderboltOutlined style={{ marginRight: 6 }} /> Recommended Interventions
              </div>
              <List
                itemLayout="horizontal"
                dataSource={analyticsData.recommendations}
                renderItem={item => (
                  <List.Item style={{ border: 'none', padding: '0 0 16px 0' }}>
                    <div style={{ display: 'flex', width: '100%', padding: '18px 24px', borderRadius: 14, background: item.type === 'danger' ? '#FDECEA' : item.type === 'warning' ? '#FDF3E9' : '#E9F2EC', borderLeft: `4px solid ${item.type === 'danger' ? COLORS.danger : item.type === 'warning' ? COLORS.terracotta : COLORS.primary}` }}>
                      <div style={{ fontSize: 22, color: item.type === 'danger' ? COLORS.danger : COLORS.terracotta, marginRight: 18, marginTop: 2 }}>
                        {item.type === 'danger' ? <WarningOutlined /> : <BulbOutlined />}
                      </div>
                      <div style={{ fontSize: 15, color: COLORS.ink, lineHeight: 1.6 }}>{item.text}</div>
                    </div>
                  </List.Item>
                )}
              />
            </div>
          </div>
        </Modal>

        {/* ─── GLOBAL SYSTEM KPIs ─── */}
        <SectionHeader icon={<TrophyOutlined />} title="Global System KPIs" description="High-level view of system-wide plan execution." />
        <Row gutter={[16, 16]}>
          <Col xs={24} md={6}>
            <Card className="mera-card" bordered={false} style={{ borderRadius: 14, background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`, color: '#fff' }}>
              <div style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8, marginBottom: 8 }}>Overall Performance</div>
              <div style={{ fontSize: 36, fontWeight: 800 }}>{analyticsData.overallPerformance}%</div>
            </Card>
          </Col>
          <Col xs={24} md={6}>
            <Card className="mera-card" bordered={false} style={{ borderRadius: 14, border: `1px solid ${COLORS.border}` }}>
              <Statistic title="Total Strategic Plans" value={analyticsData.totalPlans} prefix={<DashboardOutlined style={{color: COLORS.sky}} />} valueStyle={{ fontWeight: 700, color: COLORS.ink }} />
            </Card>
          </Col>
          <Col xs={24} md={6}>
            <Card className="mera-card" bordered={false} style={{ borderRadius: 14, border: `1px solid ${COLORS.border}` }}>
              <Statistic title="Approved / Active Plans" value={analyticsData.approvedPlans} prefix={<CheckCircleOutlined style={{color: COLORS.primaryLight}} />} valueStyle={{ fontWeight: 700, color: COLORS.ink }} />
            </Card>
          </Col>
          <Col xs={24} md={6}>
            <Card className="mera-card" bordered={false} style={{ borderRadius: 14, border: `1px solid ${COLORS.border}` }}>
              <Statistic title="M&E Indicators Tracked" value={analyticsData.totalIndicators} prefix={<AimOutlined style={{color: COLORS.terracotta}} />} valueStyle={{ fontWeight: 700, color: COLORS.ink }} />
            </Card>
          </Col>
        </Row>

        {/* ─── CHARTS ─── */}
        <SectionHeader icon={<RiseOutlined />} title="Execution Trajectories" description="Graphical breakdown of planned versus actual achievements." />
        <Row gutter={[16, 16]}>
          {/* Timeline Trend Area Chart */}
          <ChartCard 
            span={14} 
            title="System Trajectory & Momentum" 
            subtitle={
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                Aggregate Achievements over time. Group by: 
                <Select size="small" value={trendFilter} onChange={setTrendFilter} style={{ width: 100 }}>
                  <Option value="Monthly">Monthly</Option>
                  <Option value="Quarterly">Quarterly</Option>
                  <Option value="Yearly">Yearly</Option>
                </Select>
              </div>
            }
            icon={<RiseOutlined style={{color: COLORS.primary}}/>}
          >
            {analyticsData.trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analyticsData.trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAchieved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.4}/>
                      <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.border} />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: COLORS.inkMuted }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: COLORS.inkMuted }} />
                  <RechartsTooltip contentStyle={{ borderRadius: 8, border: `1px solid ${COLORS.border}`, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                  <Area type="monotone" dataKey="achieved" name="Achievements" stroke={COLORS.primary} strokeWidth={3} fillOpacity={1} fill="url(#colorAchieved)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : <Alert message="Not enough trend data to visualize." type="info" />}
          </ChartCard>

          {/* Approval Pie Chart */}
          <ChartCard span={10} title="Plan Approval Verification" subtitle="Distribution of plan verification statuses." icon={<PieChartOutlined style={{color: COLORS.gold}}/>}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={analyticsData.statusChartData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={4} dataKey="value">
                  {analyticsData.statusChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || SECTOR_COLORS[index]} />)}
                </Pie>
                <RechartsTooltip contentStyle={{ borderRadius: 8, border: `1px solid ${COLORS.border}` }} />
                <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 12, color: COLORS.inkMuted }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Sector Bar Chart */}
          <ChartCard span={24} title="Sector-wise Planned vs Achieved" subtitle="Execution rates grouped by directorates." icon={<BranchesOutlined style={{color: COLORS.sky}}/>}>
            {analyticsData.sectorChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.sectorChartData} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.border} />
                  <XAxis dataKey="sector" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: COLORS.inkMuted }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: COLORS.inkMuted }} />
                  <RechartsTooltip cursor={{fill: 'rgba(0,0,0,0.02)'}} contentStyle={{ borderRadius: 8, border: `1px solid ${COLORS.border}` }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                  <Bar dataKey="planned" name="Annual Target" fill={COLORS.sky} radius={[4, 4, 0, 0]} maxBarSize={60} />
                  <Bar dataKey="achieved" name="Actual Achieved" fill={COLORS.primary} radius={[4, 4, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            ) : <Alert message="No sector data available." type="info" />}
          </ChartCard>
        </Row>

        {/* ─── DATA TABLE ─── */}
        <SectionHeader icon={<FileTextOutlined />} title="Indicator Performance Log" description="Detailed execution breakdown for all tracked metrics." />
        <Card className="mera-card" bordered={false} style={{ borderRadius: 14, border: `1px solid ${COLORS.border}` }} bodyStyle={{ padding: 0 }}>
          <Table 
            columns={columns} 
            dataSource={analyticsData.topIndicators} 
            rowKey="key"
            pagination={{ pageSize: 12, showSizeChanger: true }}
            scroll={{ x: 900 }}
          />
        </Card>

        <div style={{ textAlign: 'center', marginTop: 40, paddingTop: 20, borderTop: `1px solid ${COLORS.border}`, color: COLORS.inkMuted, fontSize: 12, letterSpacing: '0.4px' }}>
          MERA · Strategic Planning & Monitoring Division
        </div>
      </div>
    </div>
  );
}