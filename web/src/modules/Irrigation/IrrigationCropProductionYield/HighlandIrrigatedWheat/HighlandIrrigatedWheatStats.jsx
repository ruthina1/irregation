import { Col, Row, Card, Empty } from 'antd';
import { AreaChartOutlined, DashboardOutlined, RiseOutlined, TeamOutlined } from '@ant-design/icons';
import StatCard from '../../shared/components/StatCard';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from 'recharts';

/** KPI cards (Excel Section 5 highland wheat initiative indicators). */
export default function WheatStats({ stats = {} }) {
  const safeStats = stats || {};
  const totalMale = Number(safeStats.totalMale) || 0;
  const totalFemale = Number(safeStats.totalFemale) || 0;

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Wheat Harvest Output (የሚገኝ ምርት)"
          value={safeStats.totalHarvestQuintals || 0}
          suffix="Quintals"
          prefix={<RiseOutlined />}
          color="#a16207"
          footnote="Total Realized Wheat Output (ኩንታል)"
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Dedicated Command Area (የሚለማ መሬት)"
          value={safeStats.totalWheatCommandHa || 0}
          suffix="Ha"
          prefix={<AreaChartOutlined />}
          color="#1a5f2c"
          footnote={`Highland Commercial Wheat Clusters • ${safeStats.mechanizedClusters || 0} of ${safeStats.totalClusters || 0} combine harvested`}
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Average Wheat Productivity"
          value={safeStats.avgProductivity || 0}
          suffix="Qt / Ha"
          prefix={<DashboardOutlined />}
          color="#5b8a6b"
          footnote="Productivity per Hectare"
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Wheat Farmer Households (ድምር)"
          value={safeStats.totalFarmers || 0}
          prefix={<TeamOutlined />}
          color="#64748b"
          footnote={`Male: ${totalMale.toLocaleString()} • Female: ${totalFemale.toLocaleString()} (${safeStats.femaleSharePct || 0}%)`}
        />
      </Col>
    </Row>
  );
}


// --- WheatCharts ---

const cardTitle = (text) => <span style={{ fontSize: 14, fontWeight: 600 }}>{text}</span>;

/** Harvest output by cluster (bar) and command area by seed variety (donut). */
export function WheatCharts({ clusterData = [], varietyData = [], data }) {
  const safeClusterData = Array.isArray(clusterData) && clusterData.length > 0 ? clusterData : (Array.isArray(data) ? data : []);
  const safeVarietyData = Array.isArray(varietyData) ? varietyData : [];

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} lg={16}>
        <Card title={cardTitle('Wheat Production Harvest Yield by Cluster (Quintals / ኩንታል)')} variant="borderless" style={{ borderRadius: 8 }}>
          <div style={{ height: 230 }}>
            {safeClusterData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={safeClusterData} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#595959' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#595959' }} unit=" Qt" />
                  <RechartsTooltip />
                  <Bar dataKey="yieldQt" name="Harvest Output (Quintals)" fill="#a16207" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No wheat clusters for this view" />}
          </div>
        </Card>
      </Col>
      <Col xs={24} lg={8}>
        <Card title={cardTitle('Command Area by Seed Variety (Ha)')} variant="borderless" style={{ borderRadius: 8 }}>
          <div style={{ height: 180 }}>
            {safeVarietyData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={safeVarietyData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={4}>
                    {safeVarietyData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No command area recorded" />}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10, fontSize: 11 }}>
            {safeVarietyData.map((v) => (
              <span key={v.name} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: v.color }} />
                {v.name}: {Number(v.value || 0).toLocaleString()} Ha
              </span>
            ))}
          </div>
        </Card>
      </Col>
    </Row>
  );
}
