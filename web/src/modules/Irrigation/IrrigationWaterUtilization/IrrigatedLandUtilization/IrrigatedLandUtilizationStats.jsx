import { Col, Row, Card, Empty } from 'antd';
import { AreaChartOutlined, BuildOutlined, RiseOutlined, TeamOutlined } from '@ant-design/icons';
import StatCard from '../../shared/components/StatCard';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from 'recharts';

/** KPI cards (Excel Section 4 indicators: existing vs new land, expansion). */
export default function UtilizationStats({ stats = {} }) {
  const safeStats = stats || {};
  const totalMale = Number(safeStats.totalMale) || 0;
  const totalFemale = Number(safeStats.totalFemale) || 0;

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Total Effective Irrigated Land"
          value={safeStats.grandEffectiveHa || 0}
          suffix="Ha"
          prefix={<AreaChartOutlined />}
          color="#1a5f2c"
          footnote="Active Command + Expansion Area"
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Existing Scheme Land (በነባር)"
          value={safeStats.existingLandHa || 0}
          suffix="Ha"
          prefix={<BuildOutlined />}
          color="#5b8a6b"
          footnote="Rehabilitated Command Areas"
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="New Scheme Land (በአዲስ)"
          value={safeStats.newLandHa || 0}
          suffix="Ha"
          prefix={<RiseOutlined />}
          color="#2f7d4a"
          footnote="Newly Developed Command Areas"
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Beneficiary Farmers Served"
          value={safeStats.totalFarmers || 0}
          prefix={<TeamOutlined />}
          color="#64748b"
          footnote={`Male: ${totalMale.toLocaleString()} • Female: ${totalFemale.toLocaleString()} (${safeStats.femaleSharePct || 0}%)`}
        />
      </Col>
    </Row>
  );
}


// --- UtilizationChart ---

/** Active irrigated land vs expansion network area per scheme (Ha). */
export function UtilizationChart({ data = [] }) {
  const safeData = Array.isArray(data) ? data : [];

  return (
    <Card
      title={<span style={{ fontSize: 14, fontWeight: 600 }}>Active Irrigated Land vs. Conveyance Network Expansion Area (Hectares)</span>}
      variant="borderless"
      style={{ marginBottom: 20, borderRadius: 8 }}
    >
      <div style={{ height: 230 }}>
        {safeData.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={safeData} barSize={26}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#595959' }} />
              <YAxis tick={{ fontSize: 11, fill: '#595959' }} unit=" Ha" />
              <RechartsTooltip />
              <Bar dataKey="irrigatedHa" name="Active Irrigated Land (Ha)" fill="#1a5f2c" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expansionHa" name="Expansion Network Area (Ha)" fill="#5b8a6b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <Empty description="No land utilization records for this selection" style={{ paddingTop: 50 }} />
        )}
      </div>
    </Card>
  );
}
