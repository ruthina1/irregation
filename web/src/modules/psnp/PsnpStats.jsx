import React, { useMemo } from 'react';
import { Row, Col, Card, Statistic } from 'antd';

export default function PsnpStats({ households }) {
  const stats = useMemo(() => {
    let pw = 0;
    let pds = 0;
    let graduated = 0;

    households.forEach(h => {
      if (h.is_graduated) graduated++;
      else if (h.targeting_type === 'PW') pw++;
      else if (h.targeting_type === 'PDS') pds++;
    });

    return { total: households.length, pw, pds, graduated };
  }, [households]);

  const baseCardStyle = { borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' };

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} md={6}>
        <Card style={{ ...baseCardStyle, borderTop: '4px solid #1890ff' }}>
          <Statistic title="Total Target Households" value={stats.total} />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card style={{ ...baseCardStyle, borderTop: '4px solid #faad14' }}>
          <Statistic title="Active Public Work (PW)" value={stats.pw} />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card style={{ ...baseCardStyle, borderTop: '4px solid #eb2f96' }}>
          <Statistic title="Active Direct Support (PDS)" value={stats.pds} />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card style={{ ...baseCardStyle, borderTop: '4px solid #52c41a' }}>
          <Statistic title="Successfully Graduated" value={stats.graduated} valueStyle={{ color: '#52c41a' }} />
        </Card>
      </Col>
    </Row>
  );
}