import { Col, Row, Card, Empty } from 'antd';
import { AreaChartOutlined, CheckCircleOutlined, RiseOutlined, TeamOutlined } from '@ant-design/icons';
import StatCard from '../../shared/components/StatCard';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, Tooltip as RechartsTooltip, ResponsiveContainer, XAxis, YAxis } from 'recharts';

/** KPI cards (Excel Section 2 command & beneficiary metrics). */
export default function BenefitStats({ stats }) {
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} lg={6}>
        <StatCard title="Total Developed Land (የለማ መሬት)" value={stats.totalDevelopedHa} suffix="Ha" prefix={<AreaChartOutlined />}
          color="#1a5f2c" footnote={`${stats.overallLandDevRate}% of ${stats.totalPlannedHa.toLocaleString()} Ha Planned`} />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard title="Active Irrigated Cultivated Land" value={stats.totalCultivatedHa} suffix="Ha" prefix={<RiseOutlined />}
          color="#5b8a6b" footnote="Highland Wheat, Pulses & Vegetables" />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard title="Direct Beneficiary Farmers (ድምር)" value={stats.totalBeneficiaryFarmers} prefix={<TeamOutlined />}
          color="#64748b"
          footnote={`Male: ${stats.totalMale.toLocaleString()} • Female: ${stats.totalFemale.toLocaleString()} (${stats.femaleSharePct}%)`} />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard title="Monitored Irrigation Schemes" value={stats.totalSchemes} prefix={<CheckCircleOutlined />}
          color="#a16207" footnote="Under Regional & Partner Financing" />
      </Col>
    </Row>
  );
}


// --- BenefitCharts ---

/** Command-area delivery per scheme and the beneficiary gender split. */
export function BenefitCharts({ chartData, genderShareData }) {
  const hasGender = genderShareData.some((g) => g.value > 0);

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} lg={16}>
        <Card
          title={<span style={{ fontSize: 14, fontWeight: 600 }}>Command Area Delivery: Planned vs. Developed vs. Cultivated (Hectares)</span>}
          variant="borderless"
          style={{ borderRadius: 8, height: '100%' }}
        >
          <div style={{ height: 230 }}>
            {chartData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barSize={26}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#595959' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#595959' }} unit=" Ha" />
                  <RechartsTooltip />
                  <Bar dataKey="planned" name="Planned Command (Ha)" fill="#d9d9d9" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="developed" name="Actual Developed (Ha)" fill="#1a5f2c" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="cultivated" name="Cultivated Seasonally (Ha)" fill="#5b8a6b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <Empty description="No verified schemes for this fiscal year" style={{ paddingTop: 50 }} />}
          </div>
        </Card>
      </Col>
      <Col xs={24} lg={8}>
        <Card
          title={<span style={{ fontSize: 14, fontWeight: 600 }}>Farmer Beneficiary Gender Split</span>}
          variant="borderless"
          style={{ borderRadius: 8, height: '100%' }}
        >
          <div style={{ height: 180 }}>
            {hasGender ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={genderShareData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={4}>
                    {genderShareData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <Empty description="No beneficiary farmers recorded" style={{ paddingTop: 30 }} />}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, fontSize: 11 }}>
            {genderShareData.map((g) => (
              <span key={g.name} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: g.color }} />
                {g.name}: {g.value.toLocaleString()}
              </span>
            ))}
          </div>
        </Card>
      </Col>
    </Row>
  );
}
