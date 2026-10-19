import { Col, Row, Card, Empty } from 'antd';
import { BankOutlined, BuildOutlined, FileProtectOutlined, RiseOutlined } from '@ant-design/icons';
import StatCard from '../../shared/components/StatCard';
import { millions } from '../shared/reportUtils';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

/** Executive scorecard: the four directorate pillars. */
export default function DirectorateKpis({ stats }) {
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} lg={6}>
        <StatCard title="1. Study & Construction-Ready Bank" value={stats.totalStudies}
          suffix={`Active (${stats.totalReadyOnShelf} Ready)`} prefix={<FileProtectOutlined />}
          color="#1a5f2c" footnote="Pillar 1: Certified Engineering Pipeline" />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard title="2. Active Construction Schemes" value={stats.totalActiveConstruction}
          suffix={`(${millions(stats.totalDisbursedBudget)}M ETB)`} prefix={<BuildOutlined />}
          color="#5b8a6b" footnote={`Pillar 2: ${stats.overallBurnRate}% Capital Budget Disbursed`} />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard title="3. WUA Institutions & O&M Canals" value={stats.totalWuas}
          suffix={`WUAs (${stats.totalAuditedWuas} Audited)`} prefix={<BankOutlined />}
          color="#a16207" footnote={`Pillar 3: ${stats.totalCanalKm} km Canals Maintained`} />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard title="4. Agronomic Harvest & Farmers" value={(stats.totalHarvestQt / 1000).toFixed(0)}
          suffix="K Quintals" prefix={<RiseOutlined />} color="#64748b"
          footnote={`Pillar 4: Serving ${stats.grandTotalFarmers.toLocaleString()} Farmers (${stats.femaleSharePct}% Women)`} />
      </Col>
    </Row>
  );
}


// --- DirectorateCharts ---

const ZoneBarChart = ({ rows, unit, bars }) => (
  <div style={{ height: 260 }}>
    {rows.length ? (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} barSize={28}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis dataKey="zone" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} unit={unit} />
          <Tooltip />
          {bars.map((b) => <Bar key={b.dataKey} dataKey={b.dataKey} name={b.name} fill={b.fill} radius={[4, 4, 0, 0]} />)}
        </BarChart>
      </ResponsiveContainer>
    ) : <Empty description="No data for this fiscal year" />}
  </div>
);

export function DirectorateCharts({ rows }) {
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={12}>
        <Card title="Zonal Irrigation Command Area: Managed vs. Actual Irrigated (Ha)" variant="borderless">
          <ZoneBarChart rows={rows} unit=" Ha" bars={[
            { dataKey: 'managed_command_ha', name: 'Managed Command (Ha)', fill: '#d9d9d9' },
            { dataKey: 'irrigated_actual_ha', name: 'Actual Irrigated (Ha)', fill: '#1a5f2c' },
          ]} />
        </Card>
      </Col>
      <Col xs={24} lg={12}>
        <Card title="Agricultural Output: Total Harvest vs. Highland Wheat Flagship (Quintals)" variant="borderless">
          <ZoneBarChart rows={rows} unit=" Qt" bars={[
            { dataKey: 'total_yield_quintals', name: 'Total Harvest (Qt)', fill: '#a16207' },
            { dataKey: 'wheat_initiative_yield_qt', name: 'Wheat Flagship (Qt)', fill: '#1a5f2c' },
          ]} />
        </Card>
      </Col>
    </Row>
  );
}
