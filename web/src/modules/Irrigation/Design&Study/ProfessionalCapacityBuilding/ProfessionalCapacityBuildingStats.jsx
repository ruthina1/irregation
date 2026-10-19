import { Col, Row } from 'antd';
import { CheckCircleOutlined, IdcardOutlined, TeamOutlined, TrophyOutlined } from '@ant-design/icons';
import StatCard from '../../shared/components/StatCard';

/** KPI row mapped to the sheet: total trainees, male, female, completed courses. */
export default function ProfessionalCapacityBuildingStats({ stats }) {
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} lg={6}>
        <StatCard title="Total Technical Experts Trained" value={stats.totalExperts} prefix={<TeamOutlined />} color="#1a5f2c" />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard title="Male Trainees" value={stats.totalMale} prefix={<IdcardOutlined />} color="#5b8a6b" />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard title="Female Trainees" value={stats.totalFemale} suffix={`(${stats.femaleSharePct}%)`} prefix={<TrophyOutlined />} color="#64748b" />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Completed Course Modules"
          value={stats.completedCoursesCount}
          suffix={`/ ${stats.totalTrainings}`}
          prefix={<CheckCircleOutlined />}
          color="#a16207"
        />
      </Col>
    </Row>
  );
}
