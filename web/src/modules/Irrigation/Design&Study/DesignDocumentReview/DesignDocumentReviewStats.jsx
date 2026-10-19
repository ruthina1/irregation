import React from 'react';
import { Col, Row } from 'antd';
import { AreaChartOutlined, AuditOutlined, CheckCircleOutlined, FileSearchOutlined } from '@ant-design/icons';
import StatCard from '../../shared/components/StatCard';

export default function DesignDocumentReviewStats({ stats = {} }) {
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} lg={6}>
        <StatCard title="Evaluated Review Dossiers" value={stats.totalReviews || 0} prefix={<FileSearchOutlined />} color="#1a5f2c" />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Approved Design Reports"
          value={stats.approvedCount || 0}
          suffix={`/ ${stats.totalReviews || 0}`}
          prefix={<CheckCircleOutlined />}
          color="#2f7d4a"
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard title="Major Revisions Flagged" value={stats.majorRevisionCount || 0} prefix={<AuditOutlined />} color="#a16207" />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard title="Average Technical Score" value={stats.avgScore || 0} suffix="%" prefix={<AreaChartOutlined />} color="#5b8a6b" />
      </Col>
    </Row>
  );
}
