import React, { useMemo } from 'react';
import { Row, Col, Card, Statistic } from 'antd';

export default function InterventionStats({ data }) {
  const stats = useMemo(() => {
    let physicalArea = 0;
    let biologicalArea = 0;
    let totalInterventions = data.length;

    data.forEach(d => {
      if (d.intervention_category === 'Physical') {
        physicalArea += parseFloat(d.treated_area_ha) || 0;
      } else {
        biologicalArea += parseFloat(d.treated_area_ha) || 0;
      }
    });

    const totalArea = physicalArea + biologicalArea;

    return { totalInterventions, physicalArea: physicalArea.toFixed(1), biologicalArea: biologicalArea.toFixed(1), totalArea: totalArea.toFixed(1) };
  }, [data]);

  const baseCardStyle = { borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' };

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} md={6}>
        <Card style={{ ...baseCardStyle, borderTop: '4px solid #1890ff' }}>
          <Statistic title="Total Intervention Activities" value={stats.totalInterventions} />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card style={{ ...baseCardStyle, borderTop: '4px solid #52c41a' }}>
          <Statistic title="Total Area Treated (Ha)" value={stats.totalArea} />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card style={{ ...baseCardStyle, borderTop: '4px solid #faad14' }}>
          <Statistic title="Physical Treatment (Ha)" value={stats.physicalArea} />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card style={{ ...baseCardStyle, borderTop: '4px solid #eb2f96' }}>
          <Statistic title="Biological Treatment (Ha)" value={stats.biologicalArea} />
        </Card>
      </Col>
    </Row>
  );
}