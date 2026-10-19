import { Col, Row, Card, Empty } from 'antd';
import { AreaChartOutlined, DashboardOutlined, RiseOutlined, TeamOutlined } from '@ant-design/icons';
import StatCard from '../../shared/components/StatCard';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from 'recharts';

/** KPI cards (Excel Section 5 production & beneficiary indicators). */
export default function SeasonalStats({ stats }) {
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Total Expected Harvest (የሚገኝ ምርት)"
          value={stats.totalProductionQuintals}
          suffix="Quintals"
          prefix={<RiseOutlined />}
          color="#a16207"
          footnote="Cereals, Pulses, Vegetables & Spices"
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Total Cultivated Land (የለማ መሬት)"
          value={stats.totalCultivatedHa}
          suffix="Ha"
          prefix={<AreaChartOutlined />}
          color="#1a5f2c"
          footnote="Across 1st, 2nd & 3rd Cropping Cycles"
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Average Crop Productivity"
          value={stats.avgProductivityQtHa}
          suffix="Qt / Ha"
          prefix={<DashboardOutlined />}
          color="#5b8a6b"
          footnote="Productivity per Unit Land Area"
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Direct Beneficiary Farmers (ድምር)"
          value={stats.totalFarmers}
          prefix={<TeamOutlined />}
          color="#64748b"
          footnote={`Male: ${stats.totalMale.toLocaleString()} • Female: ${stats.totalFemale.toLocaleString()} (${stats.femaleSharePct}%)`}
        />
      </Col>
    </Row>
  );
}


// --- SeasonalCharts ---

const cardTitle = (text) => <span style={{ fontSize: 14, fontWeight: 600 }}>{text}</span>;

/** Yield by primary crop (bar) and cultivated land by crop category (donut). */
export function SeasonalCharts({ cropData, categoryData }) {
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} lg={16}>
        <Card title={cardTitle('Production Harvest Yield by Primary Crop (Quintals / ኩንታል)')} variant="borderless" style={{ borderRadius: 8 }}>
          <div style={{ height: 230 }}>
            {cropData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cropData} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#595959' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#595959' }} unit=" Qt" />
                  <RechartsTooltip />
                  <Bar dataKey="yieldQt" name="Production Yield (Quintals)" fill="#a16207" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No harvest records for this view" />}
          </div>
        </Card>
      </Col>
      <Col xs={24} lg={8}>
        <Card title={cardTitle('Cultivated Land by Category (Ha)')} variant="borderless" style={{ borderRadius: 8 }}>
          <div style={{ height: 180 }}>
            {categoryData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={4}>
                    {categoryData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No cultivated land recorded" />}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10, fontSize: 11 }}>
            {categoryData.map((c) => (
              <span key={c.name} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.color }} />
                {c.name}: {c.value.toLocaleString()} Ha
              </span>
            ))}
          </div>
        </Card>
      </Col>
    </Row>
  );
}
