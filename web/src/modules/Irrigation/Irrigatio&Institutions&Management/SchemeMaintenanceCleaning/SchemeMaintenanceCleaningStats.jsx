import { Col, Row, Card, Empty } from 'antd';
import { AreaChartOutlined, BuildOutlined, TeamOutlined, ToolOutlined } from '@ant-design/icons';
import StatCard from '../../shared/components/StatCard';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from 'recharts';

/** KPI cards (Excel Section 3 O&M indicators). */
export default function MaintenanceStats({ stats = {} }) {
  const safeStats = stats || {};
  const totalMale = Number(safeStats.totalMale) || 0;
  const totalFemale = Number(safeStats.totalFemale) || 0;

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Modern Canals Maintained / Cleaned (በዘመናዊ)"
          value={safeStats.modernCanalKm || 0}
          precision={1}
          suffix="km"
          prefix={<BuildOutlined />}
          color="#1a5f2c"
          footnote="Concrete & Precast Masonry Flumes"
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Traditional Canals Maintained (በባህላዊ)"
          value={safeStats.traditionalCanalKm || 0}
          precision={1}
          suffix="km"
          prefix={<ToolOutlined />}
          color="#a16207"
          footnote="Earthen Furrows & Riprap Diversions"
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Mobilized Community Labor (ሰው ኃይል)"
          value={safeStats.totalMobilizedLabor || 0}
          prefix={<TeamOutlined />}
          color="#5b8a6b"
          footnote={`Male: ${totalMale.toLocaleString()} • Female: ${totalFemale.toLocaleString()} (${safeStats.femaleSharePct || 0}%)`}
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Protected Command Area"
          value={safeStats.totalProtectedHa || 0}
          suffix="Ha"
          prefix={<AreaChartOutlined />}
          color="#64748b"
          footnote="Safeguarded from Silt & Water Seepage"
        />
      </Col>
    </Row>
  );
}


// --- MaintenanceCanalChart ---

/** Delivered canal distance per scheme, modern vs traditional (km). */
export function MaintenanceCanalChart({ data = [] }) {
  const safeData = Array.isArray(data) ? data : [];
  return (
    <Card
      title={<span style={{ fontSize: 14, fontWeight: 600 }}>Delivered Canal Distance by Scheme: Modern vs. Traditional (Kilometers)</span>}
      variant="borderless"
      style={{ marginBottom: 20, borderRadius: 8 }}
    >
      <div style={{ height: 230 }}>
        {safeData.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={safeData} barSize={26}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#595959' }} />
              <YAxis tick={{ fontSize: 11, fill: '#595959' }} unit=" km" />
              <RechartsTooltip />
              <Bar dataKey="modernKm" name="Modern Canal (km)" fill="#1a5f2c" radius={[4, 4, 0, 0]} />
              <Bar dataKey="traditionalKm" name="Traditional Canal (km)" fill="#a16207" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <Empty description="No maintenance interventions logged for this selection" style={{ paddingTop: 50 }} />
        )}
      </div>
    </Card>
  );
}
