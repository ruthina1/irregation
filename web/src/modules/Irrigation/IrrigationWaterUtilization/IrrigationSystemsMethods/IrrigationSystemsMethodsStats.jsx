import { Col, Row, Card, Empty } from 'antd';
import { AreaChartOutlined, BuildOutlined, CheckCircleOutlined, ThunderboltOutlined } from '@ant-design/icons';
import StatCard from '../../shared/components/StatCard';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

/** KPI cards (Excel Section 4 water sources & lift technology indicators). */
export default function WaterSourceStats({ stats }) {
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} lg={6}>
        <StatCard title="Total Yield Capacity" value={stats.totalDischargeCapacity} suffix="L/s" prefix={<ThunderboltOutlined />} color="#1a5f2c" footnote="Combined Abstraction Flow Rate" />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard title="Solar-Powered Pump Sites (የፀሐይ)" value={stats.solarPumpCount} prefix={<CheckCircleOutlined />} color="#64748b" footnote="Zero-Carbon Photovoltaic Lift Systems" />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard title="Deep Boreholes & Wells (ጥልቅ ዌል)" value={stats.deepWellCount} prefix={<BuildOutlined />} color="#64748b" footnote="Deep & Shallow Groundwater Schemes" />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard title="Command Area Served" value={stats.totalCommandHa} suffix="Ha" prefix={<AreaChartOutlined />} color="#a16207" footnote={`Supporting ${stats.totalFarmers.toLocaleString()} Households`} />
      </Col>
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
