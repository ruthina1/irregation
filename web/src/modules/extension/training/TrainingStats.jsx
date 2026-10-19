import React, { useMemo } from 'react';
import { Row, Col, Card, Statistic } from 'antd';

export default function TrainingStats({ events }) {
  const stats = useMemo(() => {
    let totalParticipants = 0;
    let totalYouth = 0;
    let typeCounts = {};

    events.forEach(event => {
      totalParticipants += (event.total_participants || 0);
      totalYouth += (event.youth_participants || 0);
      typeCounts[event.event_type] = (typeCounts[event.event_type] || 0) + 1;
    });

    const popularType = Object.keys(typeCounts).length 
      ? Object.keys(typeCounts).reduce((a, b) => typeCounts[a] > typeCounts[b] ? a : b) 
      : 'N/A';

    return { totalParticipants, totalYouth, popularType };
  }, [events]);

  const baseCardStyle = { 
    borderRadius: '8px', 
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)' 
  };

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} md={6}>
        <Card style={{ ...baseCardStyle, borderTop: '4px solid #1890ff' }}>
          <Statistic title="Total Events Conducted" value={events.length} />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card style={{ ...baseCardStyle, borderTop: '4px solid #52c41a' }}>
          <Statistic title="Total Farmers Reached" value={stats.totalParticipants} />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card style={{ ...baseCardStyle, borderTop: '4px solid #faad14' }}>
          <Statistic title="Total Youth Engaged" value={stats.totalYouth} />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card style={{ ...baseCardStyle, borderTop: '4px solid #722ed1' }}>
          <Statistic title="Most Popular Activity" value={stats.popularType} valueStyle={{ fontSize: '18px' }} />
        </Card>
      </Col>
    </Row>
  );
}