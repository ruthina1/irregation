import { Col, Row } from 'antd';
import { AreaChartOutlined, BuildOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import StatCard from '../../shared/components/StatCard';

export default function ProjectStats({ stats }) {
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Active Construction Schemes"
          value={stats.totalProjects}
          prefix={<BuildOutlined />}
          color="#1a5f2c"
          footnote={`${stats.newConstructionCount} New Schemes • ${stats.existingRehabCount} Rehabilitation`}
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="New Construction Avg. Progress"
          value={stats.avgNewProgress}
          suffix="%"
          prefix={<CheckCircleOutlined />}
          color="#5b8a6b"
          footnote="Excel Milestone: 66% Execution Target"
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Existing Rehab Avg. Progress"
          value={stats.avgExistingProgress}
          suffix="%"
          prefix={<ClockCircleOutlined />}
          color="#a16207"
          footnote="Excel Benchmark: 30.3% Execution Average"
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Command Area Under Construction"
          value={stats.totalCommandHectares}
          suffix="Ha"
          prefix={<AreaChartOutlined />}
          color="#2f7d4a"
          footnote={`Targeting ${stats.totalBeneficiaries.toLocaleString()} Farmer Households`}
        />
      </Col>
    </Row>
  );
}
