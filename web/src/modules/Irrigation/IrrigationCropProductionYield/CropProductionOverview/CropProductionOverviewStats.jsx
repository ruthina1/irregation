import { Col, Progress, Row, Card, Empty } from 'antd';
import { AreaChartOutlined, CheckCircleOutlined, RiseOutlined, TeamOutlined } from '@ant-design/icons';
import StatCard from '../../shared/components/StatCard';
import { ROUTES } from './CropProductionOverviewManagement';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

/** Executive KPI cards (server summary for the fiscal year). */
export default function ProductionStats({ stats, onNavigate }) {
  const completionTracked = stats.harvestCompletionPct !== null && stats.harvestCompletionPct !== undefined;
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Total Expected Output (ጠቅላላ ምርት)"
          value={stats.totalYieldQuintals}
          suffix="Quintals"
          prefix={<RiseOutlined />}
          color="#a16207"
          footnote="Across 3 Cropping Cycles (1ኛ፣ 2ኛ፣ 3ኛ ዙር)"
          onClick={() => onNavigate(ROUTES.seasonal)}
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Wheat Initiative Harvest"
          value={stats.wheatHarvestQuintals}
          suffix="Quintals"
          prefix={<CheckCircleOutlined />}
          color="#1a5f2c"
          footnote={`Strategic Highland Flagship (${stats.wheatSharePct}% of Output)`}
          onClick={() => onNavigate(ROUTES.wheat)}
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard title="Cumulative Cultivated Land" value={stats.totalCultivatedHa} suffix="Ha" prefix={<AreaChartOutlined />} color="#5b8a6b">
          {completionTracked ? (
            <>
              <Progress percent={stats.harvestCompletionPct} size="small" strokeColor="#5b8a6b" style={{ marginTop: 6, marginBottom: 0 }} />
              <div style={{ fontSize: 11, color: '#5b8a6b' }}>Harvests weighed & completed</div>
            </>
          ) : (
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 4 }}>Harvest completion: Not tracked</div>
          )}
        </StatCard>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Direct Beneficiary Farmers"
          value={stats.totalFarmers}
          suffix="Households"
          prefix={<TeamOutlined />}
          color="#64748b"
          footnote={`Male: ${stats.totalMaleFarmers.toLocaleString()} • Female: ${stats.totalFemaleFarmers.toLocaleString()} (${stats.femaleSharePct}%)`}
        />
      </Col>
    </Row>
  );
}


// --- ProductionCharts ---

/** Harvest by cropping round and share by crop family. */
export function ProductionCharts({ roundData, categoryData }) {
  const hasRoundData = roundData.some((r) => r.yieldQt > 0);
  const pieData = categoryData.filter((c) => c.value > 0);

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} lg={15}>
        <Card
          title={<span style={{ fontSize: 14, fontWeight: 600 }}>Seasonal Harvest Progression by Round (Quintals / ኩንታል)</span>}
          variant="borderless"
          style={{ borderRadius: 8, height: '100%' }}
        >
          <div style={{ height: 260 }}>
            {hasRoundData ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roundData} barSize={34}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="round" tick={{ fontSize: 11, fill: '#595959' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#595959' }} unit=" Qt" />
                  <Tooltip />
                  <Bar dataKey="yieldQt" name="Harvest Output (Quintals)" fill="#a16207" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="No harvest recorded for this fiscal year" style={{ paddingTop: 70 }} />
            )}
          </div>
        </Card>
      </Col>

      <Col xs={24} lg={9}>
        <Card
          title={<span style={{ fontSize: 14, fontWeight: 600 }}>Harvest Share by Crop Family</span>}
          variant="borderless"
          style={{ borderRadius: 8, height: '100%' }}
        >
          {pieData.length ? (
            <>
              <div style={{ height: 210 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={4}>
                      {pieData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', fontSize: 11 }}>
                {categoryData.map((c) => (
                  <span key={c.name} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.color }} />
                    {c.name.split('(')[0]}: {c.value.toLocaleString()} Qt
                  </span>
                ))}
              </div>
            </>
          ) : (
            <Empty description="No harvest recorded for this fiscal year" style={{ paddingTop: 50, height: 240 }} />
          )}
        </Card>
      </Col>
    </Row>
  );
}
