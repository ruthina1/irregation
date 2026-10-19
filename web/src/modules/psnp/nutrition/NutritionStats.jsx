import React, { useMemo } from 'react';
import { Row, Col, Card, Statistic } from 'antd';

export default function NutritionStats({ profiles }) {
  const stats = useMemo(() => {
    let backyard = 0;
    let highDietScore = 0; // RFP implies 4+ food groups is good
    let latrineAccess = 0;

    profiles.forEach(p => {
      if (p.practicing_backyard_farming) backyard++;
      if (p.dietary_diversity_score >= 4) highDietScore++;
      if (p.wash_hygiene?.has_latrine) latrineAccess++;
    });

    return { total: profiles.length, backyard, highDietScore, latrineAccess };
  }, [profiles]);

  const baseCardStyle = { borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' };

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} md={6}>
        <Card style={{ ...baseCardStyle, borderTop: '4px solid #1890ff' }}>
          <Statistic title="Total Assessments Done" value={stats.total} />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card style={{ ...baseCardStyle, borderTop: '4px solid #52c41a' }}>
          <Statistic title="Practicing Backyard Farming" value={stats.backyard} />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card style={{ ...baseCardStyle, borderTop: '4px solid #faad14' }}>
          <Statistic title="Adequate Dietary Diversity (≥4)" value={stats.highDietScore} />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card style={{ ...baseCardStyle, borderTop: '4px solid #eb2f96' }}>
          <Statistic title="Households with Latrine Access" value={stats.latrineAccess} />
        </Card>
      </Col>
    </Row>
  );
}