import { Col, Row } from 'antd';
import { AreaChartOutlined, CheckCircleOutlined, DollarCircleOutlined, TeamOutlined } from '@ant-design/icons';
import StatCard from '../../shared/components/StatCard';

/** KPI cards for the handover register. */
export default function HandoverStats({ stats }) {
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Handed Over to Users"
          value={stats.totalHandedOverProjects}
          prefix={<CheckCircleOutlined />}
          color="#1a5f2c"
          footnote="Active Irrigation by Water Users"
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Operational Land Handed Over"
          value={stats.totalHandedOverHectares}
          suffix="Ha"
          prefix={<AreaChartOutlined />}
          color="#2f7d4a"
          footnote={`Delivering Water to ${stats.totalBeneficiaryFarmers.toLocaleString()} Households`}
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Secured 5% Warranty Retention"
          value={(stats.totalRetentionSecured / 1000000).toFixed(2)}
          suffix="M ETB"
          prefix={<DollarCircleOutlined />}
          color="#5b8a6b"
          footnote="Protected under Defect Liability Periods"
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Active WUAs in Management"
          value={stats.totalHandedOverProjects}
          prefix={<TeamOutlined />}
          color="#64748b"
          footnote="O&M Manuals & Sluice Keys Transferred"
        />
      </Col>
    </Row>
  );
}
