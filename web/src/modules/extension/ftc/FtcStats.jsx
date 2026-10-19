import React from 'react';
import { Row, Col, Card, Typography } from 'antd';

const { Text, Title } = Typography;

export default function FtcStats({ ftcs }) {
  // ─── Logic ───
  const total = ftcs.length;
  const advanced = ftcs.filter(f => f.capacity_level === 'Advanced').length;
  const audited = ftcs.filter(f => f.audit_status === 'Audited').length;
  const underConstruction = ftcs.filter(f => f.construction_status === 'Under Construction').length;

  // ─── Reusable Minimalist Pro-Card ───
  const StatCard = ({ title, value, color }) => (
    <Card 
      bordered={false} 
      style={{ 
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
        border: '1px solid #E2E8F0', // Clean outer border
        borderLeft: `4px solid ${color}`, // Semantic left accent border
        borderRadius: '8px',
        height: '100%'
      }}
      bodyStyle={{ padding: '20px 24px' }}
    >
      <div>
        <Text style={{ 
          fontSize: '11px', 
          textTransform: 'uppercase', 
          letterSpacing: '1px', 
          color: '#64748B', // Slate gray for formal labels
          fontWeight: 600,
          display: 'block',
          marginBottom: '8px'
        }}>
          {title}
        </Text>
        <Title level={2} style={{ 
          margin: 0, 
          color: '#0B1120', 
          fontFamily: "'Times New Roman', Times, serif" // Formal numerical display
        }}>
          {value}
        </Title>
      </div>
    </Card>
  );

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} lg={6}>
        <StatCard 
          title="Total Registered FTCs" 
          value={total} 
          color="#039c33" // Brand Green
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard 
          title="Advanced Capacity" 
          value={advanced} 
          color="#0284C7" // Enterprise Blue
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard 
          title="Audited FTCs" 
          value={audited} 
          color="#059669" // Emerald Green (Success)
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard 
          title="Under Construction" 
          value={underConstruction} 
          color="#D97706" // Warning Amber
        />
      </Col>
    </Row>
  );
}