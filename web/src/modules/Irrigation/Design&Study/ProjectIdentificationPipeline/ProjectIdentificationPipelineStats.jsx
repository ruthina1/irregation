import { Col, Row } from 'antd';
import { AreaChartOutlined, CheckCircleOutlined, FundProjectionScreenOutlined, TeamOutlined } from '@ant-design/icons';
import StatCard from '../../shared/components/StatCard';

/** KPI cards: identified schemes, approved for study, potential area, target households. */
export default function ProjectIdentificationPipelineStats({ stats }) {
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} lg={6}>
        <StatCard title="Total Identified Pipeline" value={stats.totalIdentified} prefix={<FundProjectionScreenOutlined />} color="#1a5f2c" />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Approved for Study"
          value={stats.approvedForStudyCount}
          suffix={`/ ${stats.totalIdentified}`}
          prefix={<CheckCircleOutlined />}
          color="#2f7d4a"
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard title="Potential Command Area" value={stats.totalPotentialArea} suffix="Ha" prefix={<AreaChartOutlined />} color="#5b8a6b" />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard title="Target Households" value={stats.totalBeneficiaries} prefix={<TeamOutlined />} color="#a16207" />
      </Col>
    </Row>
  );
}
