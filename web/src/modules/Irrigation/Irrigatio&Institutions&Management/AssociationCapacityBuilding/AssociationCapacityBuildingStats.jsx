import { Col, Row } from 'antd';
import { CheckCircleOutlined, TeamOutlined, TrophyOutlined, UserSwitchOutlined } from '@ant-design/icons';
import StatCard from '../../shared/components/StatCard';

/** KPI cards (Excel Section 3 capacity-building indicators). */
export default function TrainingStats({ stats = {} }) {
  const safeStats = stats || {};
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="WUA Executive Leaders Trained (አመራር)"
          value={safeStats.totalExecLeaders || 0}
          prefix={<UserSwitchOutlined />}
          color="#1a5f2c"
          footnote={`Male: ${safeStats.totalExecMale || 0} • Female: ${safeStats.totalExecFemale || 0}`}
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Total Community Trainees (ድምር)"
          value={safeStats.grandTotalTrainees || 0}
          prefix={<TeamOutlined />}
          color="#5b8a6b"
          footnote={`Across ${safeStats.totalCourses || 0} Specialized Modules`}
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Female Farmer Participation"
          value={safeStats.totalFemaleTrainees || 0}
          suffix={`(${safeStats.femaleSharePct || 0}%)`}
          prefix={<TrophyOutlined />}
          color="#64748b"
          footnote="Gender-Inclusive Leadership Quotas"
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Completed Course Modules"
          value={safeStats.completedCoursesCount || 0}
          suffix={`/ ${safeStats.totalCourses || 0}`}
          prefix={<CheckCircleOutlined />}
          color="#a16207"
          footnote="Facilitated by Technical DAs & Promoters (በባለሙያ)"
        />
      </Col>
    </Row>
  );
}
