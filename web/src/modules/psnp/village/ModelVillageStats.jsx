import React, { useMemo } from 'react';
import { Row, Col, Card, Statistic } from 'antd';

export default function ModelVillageStats({ data }) {
  const stats = useMemo(() => {
    let certified = 0;
    let totalWaterAccess = 0;
    let totalLiteracy = 0;

    data.forEach(d => {
      if (d.is_certified_model_village) certified++;
      totalWaterAccess += d.households_with_water_access || 0;
      totalLiteracy += parseFloat(d.literacy_rate_percentage) || 0;
    });

    const avgLiteracy = data.length ? (totalLiteracy / data.length).toFixed(1) : 0;

    return { total: data.length, certified, totalWaterAccess, avgLiteracy };
  }, [data]);

  const baseCardStyle = { borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' };

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} md={6}>
        <Card style={{ ...baseCardStyle, borderTop: '4px solid #1890ff' }}>
          <Statistic title="Total Assessed Kebeles" value={stats.total} />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card style={{ ...baseCardStyle, borderTop: '4px solid #52c41a' }}>
          <Statistic title="Certified Model Villages" value={stats.certified} valueStyle={{ color: '#52c41a' }} />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card style={{ ...baseCardStyle, borderTop: '4px solid #faad14' }}>
          <Statistic title="Avg Literacy Rate (%)" value={stats.avgLiteracy} suffix="%" />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card style={{ ...baseCardStyle, borderTop: '4px solid #eb2f96' }}>
          <Statistic title="HH with Water Access" value={stats.totalWaterAccess} />
        </Card>
      </Col>
    </Row>
  );
}