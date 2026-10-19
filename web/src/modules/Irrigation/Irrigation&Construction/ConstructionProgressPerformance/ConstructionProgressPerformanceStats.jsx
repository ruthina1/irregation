import { Col, Row, Card, Empty } from 'antd';
import { AreaChartOutlined, BuildOutlined, ClockCircleOutlined, RiseOutlined } from '@ant-design/icons';
import StatCard from '../../shared/components/StatCard';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

/** KPI cards (Excel Section 2 execution indicators). */
export default function ProgressStats({ stats }) {
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Monitored Site Schemes"
          value={stats.totalTracked}
          prefix={<BuildOutlined />}
          color="#1a5f2c"
          footnote={`${stats.onTrackCount} / ${stats.totalTracked} Sites on or Ahead of Schedule`}
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="New Construction Avg. Physical"
          value={stats.avgNewProgress}
          suffix="%"
          prefix={<RiseOutlined />}
          color="#5b8a6b"
          footnote="Excel Milestone: 66% Execution"
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Existing Rehab Avg. Physical"
          value={stats.avgExistingProgress}
          suffix="%"
          prefix={<ClockCircleOutlined />}
          color="#a16207"
          footnote="Excel Benchmark: 30.3% Execution"
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Total Completed Canal Lining"
          value={stats.totalLinedCanalsKm}
          suffix="km"
          prefix={<AreaChartOutlined />}
          color="#64748b"
          footnote="Trapezoidal & Pre-Cast Masonry Sections"
        />
      </Col>
    </Row>
  );
}


// --- ProgressChart ---

/** Planned vs physical vs financial progress per scheme (%). */
export function ProgressChart({ data }) {
  return (
    <Card
      title={<span style={{ fontSize: 14, fontWeight: 600 }}>Planned vs. Physical vs. Financial Progress Comparison (%)</span>}
      variant="borderless"
      style={{ marginBottom: 20, borderRadius: 8 }}
    >
      <div style={{ height: 230 }}>
        {data.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barSize={26}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#595959' }} />
              <YAxis tick={{ fontSize: 11, fill: '#595959' }} unit="%" />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="planned" name="Planned Schedule %" fill="#d9d9d9" radius={[4, 4, 0, 0]} />
              <Bar dataKey="physical" name="Actual Physical %" fill="#1a5f2c" radius={[4, 4, 0, 0]} />
              <Bar dataKey="financial" name="Financial Disbursed %" fill="#5b8a6b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No progress logs for this view" style={{ paddingTop: 50 }} />
        )}
      </div>
    </Card>
  );
}
