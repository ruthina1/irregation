import React, { useMemo } from 'react';
import { Row, Col, Card, Statistic } from 'antd';

export default function WorkforceStats({ experts, teams }) {
  const stats = useMemo(() => {
    const activeExperts = experts.filter(e => e.employment_status === 'Active').length;
    const femaleExperts = experts.filter(e => e.gender === 'Female').length;
    
    let totalTeamMembers = 0;
    teams.forEach(t => totalTeamMembers += (t.total_members || 0));

    return { activeExperts, femaleExperts, totalTeams: teams.length, totalTeamMembers };
  }, [experts, teams]);

  const baseCardStyle = { borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' };

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} md={6}>
        <Card style={{ ...baseCardStyle, borderTop: '4px solid #1890ff' }}>
          <Statistic title="Active Experts (DAs)" value={stats.activeExperts} />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card style={{ ...baseCardStyle, borderTop: '4px solid #eb2f96' }}>
          <Statistic title="Female Experts" value={stats.femaleExperts} />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card style={{ ...baseCardStyle, borderTop: '4px solid #52c41a' }}>
          <Statistic title="Total Dev Teams" value={stats.totalTeams} />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card style={{ ...baseCardStyle, borderTop: '4px solid #faad14' }}>
          <Statistic title="Farmers in Networks" value={stats.totalTeamMembers} />
        </Card>
      </Col>
    </Row>
  );
}