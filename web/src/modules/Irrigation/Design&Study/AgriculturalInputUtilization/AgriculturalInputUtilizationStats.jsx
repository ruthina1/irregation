import { Col, Row } from 'antd';
import { AreaChartOutlined, CheckCircleOutlined, ExperimentOutlined, TeamOutlined } from '@ant-design/icons';
import StatCard from '../../shared/components/StatCard';

export default function AgriculturalInputUtilizationStats({ stats }) {
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} lg={6}>
        <StatCard title="Total Distributed Inputs" value={stats.totalDistributed} prefix={<ExperimentOutlined />} color="#1a5f2c" />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard title="Covered Command Area" value={stats.totalLandHectares} suffix="Ha" prefix={<AreaChartOutlined />} color="#2f7d4a" />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard title="Target Beneficiaries" value={stats.totalBeneficiaries} prefix={<TeamOutlined />} color="#5b8a6b" />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard title="Execution & Delivery Rate" value={stats.completionRate} suffix="%" prefix={<CheckCircleOutlined />} color="#a16207" />
      </Col>
    </Row>
  );
}
