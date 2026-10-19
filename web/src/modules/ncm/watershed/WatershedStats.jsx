import React, { useMemo } from 'react';
import { Row, Col, Card, Statistic } from 'antd';

export default function WatershedStats({ data }) {
  const stats = useMemo(() => {
    let totalArea = 0;
    let totalPhysicalScore = 0;
    let matureCount = 0;

    data.forEach(d => {
      totalArea += parseFloat(d.total_area_ha) || 0;
      totalPhysicalScore += parseFloat(d.physical_score_percentage) || 0;
      if (d.development_stage === 'Maturity') matureCount++;
    });

    const avgPhysical = data.length ? (totalPhysicalScore / data.length).toFixed(1) : 0;

    return { total: data.length, totalArea: totalArea.toFixed(1), avgPhysical, matureCount };
  }, [data]);

  const baseCardStyle = { borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' };

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} md={6}>
        <Card style={{ ...baseCardStyle, borderTop: '4px solid #1890ff' }}>
          <Statistic title="Total Registered Watersheds" value={stats.total} />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card style={{ ...baseCardStyle, borderTop: '4px solid #52c41a' }}>
          <Statistic title="Total Area Managed (Ha)" value={stats.totalArea} />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card style={{ ...baseCardStyle, borderTop: '4px solid #faad14' }}>
          <Statistic title="Avg Physical Completion (%)" value={stats.avgPhysical} suffix="%" />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card style={{ ...baseCardStyle, borderTop: '4px solid #eb2f96' }}>
          <Statistic title="Watersheds Reaching 'Maturity'" value={stats.matureCount} valueStyle={{ color: '#eb2f96' }} />
        </Card>
      </Col>
    </Row>
  );
}