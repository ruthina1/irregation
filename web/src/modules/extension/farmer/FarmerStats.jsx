import React, { useMemo } from 'react';
import { Row, Col, Card, Statistic } from 'antd';

export default function FarmerStats({ farmers }) {
  const stats = useMemo(() => {
    const total = farmers.length;
    const femaleHeaded = farmers.filter(f => f.household_head_type === 'Emawora').length;
    const modelFarmers = farmers.filter(f => f.farmer_type === 'Model').length;
    
    let totalCattle = 0;
    farmers.forEach(f => {
      if (f.livestock) totalCattle += (f.livestock.cattle_total || 0);
    });

    return { total, femaleHeaded, modelFarmers, totalCattle };
  }, [farmers]);

  const baseCardStyle = { borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' };

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} md={6}>
        <Card style={{ ...baseCardStyle, borderTop: '4px solid #1890ff' }}>
          <Statistic title="Total Registered Farmers" value={stats.total} />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card style={{ ...baseCardStyle, borderTop: '4px solid #eb2f96' }}>
          <Statistic title="Female-Headed (Emawora)" value={stats.femaleHeaded} />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card style={{ ...baseCardStyle, borderTop: '4px solid #52c41a' }}>
          <Statistic title="Model Farmers" value={stats.modelFarmers} />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card style={{ ...baseCardStyle, borderTop: '4px solid #faad14' }}>
          <Statistic title="Total Cattle Owned" value={stats.totalCattle} />
        </Card>
      </Col>
    </Row>
  );
}