import { Col, Row } from 'antd';
import { CheckCircleOutlined, TeamOutlined, TrophyOutlined, UserSwitchOutlined } from '@ant-design/icons';
import StatCard from '../../shared/components/StatCard';

/** KPI cards (Excel Section 3 capacity-building indicators). */
export default function TrainingStats({ stats }) {
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="WUA Executive Leaders Trained (አመራር)"
          value={stats.totalExecLeaders}
          prefix={<UserSwitchOutlined />}
          color="#1a5f2c"
          footnote={`Male: ${stats.totalExecMale} • Female: ${stats.totalExecFemale}`}
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Total Community Trainees (ድምር)"
          value={stats.grandTotalTrainees}
          prefix={<TeamOutlined />}
          color="#5b8a6b"
          footnote={`Across ${stats.totalCourses} Specialized Modules`}
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Female Farmer Participation"
          value={stats.totalFemaleTrainees}
          suffix={`(${stats.femaleSharePct}%)`}
          prefix={<TrophyOutlined />}
          color="#64748b"
          footnote="Gender-Inclusive Leadership Quotas"
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Completed Course Modules"
          value={stats.completedCoursesCount}
          suffix={`/ ${stats.totalCourses}`}
          prefix={<CheckCircleOutlined />}
          color="#a16207"
          footnote="Facilitated by Technical DAs & Promoters (በባለሙያ)"
        />
      </Col>
    </Row>
  );
}
