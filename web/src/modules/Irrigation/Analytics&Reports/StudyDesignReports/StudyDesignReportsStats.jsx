import { Col, Row, Card, Empty } from 'antd';
import { AreaChartOutlined, BuildOutlined, FileDoneOutlined, TeamOutlined } from '@ant-design/icons';
import StatCard from '../../shared/components/StatCard';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function StudyDesignKpis({ stats }) {
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} lg={6}>
        <StatCard title="Total Active Studies (በጥናት ላይ)" value={stats.totalPipeline} prefix={<FileDoneOutlined />} color="#1a5f2c">
          <div style={{ fontSize: 11, color: '#595959', marginTop: 4 }}>
            {stats.totalConsultant} Consultant • {stats.totalInhouse} In-House (ክልል/ዞን/ወረዳ)
          </div>
        </StatCard>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard title="Construction-Ready Shelf (ለግንባታ ዝግጁ)" value={stats.totalReady} prefix={<BuildOutlined />} color="#2f7d4a"
          footnote="Certified Shelf Inventory" />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard title="Total Projected Command (ሄ/ር)" value={stats.totalArea} suffix="Ha" prefix={<AreaChartOutlined />} color="#5b8a6b"
          footnote={`Benefiting ${stats.totalFarmers.toLocaleString()} Households`} />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard title="Trained Technical Staff (በባለሙያ)" value={stats.totalTrained} prefix={<TeamOutlined />} color="#a16207"
          footnote="Institutional Capacity Building (ወንድ/ሴት/ድምር)" />
      </Col>
    </Row>
  );
}


// --- StudyDesignChart ---

export function StudyDesignChart({ rows }) {
  return (
    <Card title="Zonal Study Progression & Readiness Comparison" variant="borderless" style={{ marginBottom: 20, borderRadius: 8 }}>
      <div style={{ height: 240 }}>
        {rows.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} barSize={26}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="zone" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="total_pipeline" name="Total Studies Underway" fill="#5b8a6b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="construction_ready_count" name="Construction Ready" fill="#1a5f2c" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : <Empty description="No studies for this fiscal year" />}
      </div>
    </Card>
  );
}
