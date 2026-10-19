import { Col, Row } from 'antd';
import { AreaChartOutlined, BuildOutlined, FileDoneOutlined, TeamOutlined } from '@ant-design/icons';
import StatCard from '../../shared/components/StatCard';

/** KPI cards of the study & design registry. */
export default function IrrigationStudyDesignStats({ stats }) {
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} lg={6}>
        <StatCard title="Active Study Schemes" value={stats.totalProjects} prefix={<FileDoneOutlined />} color="#1a5f2c" />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Construction-Ready Designs"
          value={stats.readyForConstructionCount}
          suffix={`/ ${stats.totalProjects}`}
          prefix={<BuildOutlined />}
          color="#2f7d4a"
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Planned Command Area"
          value={stats.totalCommandArea}
          suffix="Ha"
          prefix={<AreaChartOutlined />}
          color="#5b8a6b"
          footnote={`${stats.totalBeneficiaries.toLocaleString()} target beneficiary farmers`}
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard title="Trained Technical Staff" value={stats.totalTrainedExperts} suffix="Staff" prefix={<TeamOutlined />} color="#a16207" />
      </Col>
    </Row>
  );
}
