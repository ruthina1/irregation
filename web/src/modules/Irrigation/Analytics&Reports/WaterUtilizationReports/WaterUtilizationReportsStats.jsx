import { Col, Row } from 'antd';
import { AreaChartOutlined, DashboardOutlined, ExperimentOutlined, ThunderboltOutlined } from '@ant-design/icons';
import StatCard from '../../shared/components/StatCard';
import { NOT_TRACKED } from '../shared/reportUtils';

const isNull = (v) => v === null || v === undefined;

export default function WaterUtilizationKpis({ stats }) {
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} lg={6}>
        <StatCard title="Total Effective Command Area" value={stats.totalEffective} suffix="Ha" prefix={<AreaChartOutlined />} color="#1a5f2c">
          <div style={{ fontSize: 11, color: '#595959', marginTop: 4 }}>
            R1: {stats.totalR1} • R2: {stats.totalR2} • R3: {stats.totalR3} Ha
          </div>
        </StatCard>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard title="Pressurized Drip & Sprinkler Area"
          value={isNull(stats.totalMicro) ? NOT_TRACKED : stats.totalMicro}
          suffix={isNull(stats.totalMicro) ? undefined : 'Ha'}
          prefix={<ExperimentOutlined />} color="#64748b"
          footnote={isNull(stats.totalMicro) ? 'Application methods are not recorded yet' : 'Water Saving Micro-Irrigation Methods'} />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard title="Average Application Efficiency"
          value={isNull(stats.avgEfficiency) ? NOT_TRACKED : stats.avgEfficiency}
          suffix={isNull(stats.avgEfficiency) ? undefined : '%'}
          prefix={<DashboardOutlined />} color="#5b8a6b"
          footnote={isNull(stats.avgEfficiency) ? 'Field application efficiency is not recorded yet' : 'Conveyance & Plot Water Duty'} />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard title="Solar & Deep Well Sites" value={stats.totalSolar + stats.totalDeepWells} prefix={<ThunderboltOutlined />}
          color="#64748b" footnote={`${stats.totalSolar} Solar Lift Pumps • ${stats.totalDeepWells} Deep Boreholes`} />
      </Col>
    </Row>
  );
}
