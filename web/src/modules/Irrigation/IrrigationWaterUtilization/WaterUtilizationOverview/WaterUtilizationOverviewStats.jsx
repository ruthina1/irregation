import { Col, Row, Card, Empty } from 'antd';
import { useNavigate } from 'react-router-dom';
import StatCard from '../../shared/components/StatCard';
import { NOT_TRACKED } from '../../Analytics&Reports/shared/reportUtils';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

/** Headline water utilization KPIs for the selected fiscal year. */
export default function OverviewKpis({ kpis }) {
  const navigate = useNavigate();
  const cards = [
    {
      title: 'Effective Irrigated Area',
      value: kpis.totalEffectiveHa,
      suffix: 'Ha',
      color: '#1a5f2c',
      footnote: `R1 ${kpis.round1Ha.toLocaleString()} · R2 ${kpis.round2Ha.toLocaleString()} · R3 ${kpis.round3Ha.toLocaleString()} Ha`,
      onClick: () => navigate('/irrigation/water-utilization/irrigated-area'),
    },
    {
      title: 'Avg. Utilization Rate',
      value: kpis.avgUtilization ?? NOT_TRACKED,
      suffix: kpis.avgUtilization === null ? null : '%',
      precision: kpis.avgUtilization === null ? undefined : 1,
      color: '#5b8a6b',
      footnote: 'Across zones with irrigated-area records',
      onClick: () => navigate('/irrigation/water-utilization/irrigation-systems'),
    },
    {
      title: 'Water Source Technologies',
      value: kpis.sourceCount,
      color: '#a16207',
      footnote: `${kpis.commandAreaHa.toLocaleString()} Ha command area served`,
      onClick: () => navigate('/irrigation/water-utilization/water-sources'),
    },
    {
      title: 'Solar Pumps / Deep Wells',
      value: `${kpis.solarSites} / ${kpis.deepWellSites}`,
      color: '#64748b',
      footnote: 'Registered abstraction sites',
      onClick: () => navigate('/irrigation/water-utilization/water-sources'),
    },
  ];

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
      {cards.map(({ title, ...card }) => (
        <Col xs={24} sm={12} lg={6} key={title}>
          <StatCard title={title} {...card} />
        </Col>
      ))}
    </Row>
  );
}


// --- WaterSourceCategoryChart ---

/** Command area served, grouped by water abstraction category. */
export function WaterSourceCategoryChart({ data }) {
  return (
    <Card
      title={<span style={{ fontSize: 14, fontWeight: 600 }}>Command Area Distribution by Water Abstraction Category (Hectares)</span>}
      variant="borderless"
      style={{ marginBottom: 20, borderRadius: 8 }}
    >
      <div style={{ height: 230 }}>
        {data.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#595959' }} />
              <YAxis tick={{ fontSize: 11, fill: '#595959' }} unit=" Ha" />
              <Tooltip />
              <Bar dataKey="value" name="Command Area (Ha)" fill="#1a5f2c" radius={[4, 4, 0, 0]}>
                {data.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <Empty description="No water source records for this fiscal year" style={{ paddingTop: 50 }} />
        )}
      </div>
    </Card>
  );
}
