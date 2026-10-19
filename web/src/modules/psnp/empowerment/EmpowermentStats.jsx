import React, { useMemo } from 'react';
import { Row, Col, Card, Statistic } from 'antd';

export default function EmpowermentStats({ data }) {
  const stats = useMemo(() => {
    let womenRoles = 0;
    let youthEnterprises = 0;
    let totalChildcare = 0;

    data.forEach(d => {
      womenRoles += d.women_in_decision_making_roles || 0;
      youthEnterprises += d.youth_in_agri_enterprises || 0;
      totalChildcare += d.social_development?.childcare_centers_established || 0;
    });

    return { kebeles: data.length, womenRoles, youthEnterprises, totalChildcare };
  }, [data]);

  const baseCardStyle = { borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' };

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} md={6}>
        <Card style={{ ...baseCardStyle, borderTop: '4px solid #1890ff' }}>
          <Statistic title="Kebeles Assessed" value={stats.kebeles} />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card style={{ ...baseCardStyle, borderTop: '4px solid #eb2f96' }}>
          <Statistic title="Women in Decision Roles" value={stats.womenRoles} />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card style={{ ...baseCardStyle, borderTop: '4px solid #faad14' }}>
          <Statistic title="Youth in Agri Enterprises" value={stats.youthEnterprises} />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card style={{ ...baseCardStyle, borderTop: '4px solid #52c41a' }}>
          <Statistic title="Childcare Centers Est." value={stats.totalChildcare} />
        </Card>
      </Col>
    </Row>
  );
}