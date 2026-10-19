import { Col, Row } from 'antd';
import {
  AreaChartOutlined, CheckCircleOutlined, FileProtectOutlined, SafetyCertificateOutlined,
} from '@ant-design/icons';
import StatCard from '../../shared/components/StatCard';

/** QA KPI cards. */
export default function DesignQualityAssuranceStats({ stats }) {
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} lg={6}>
        <StatCard title="Total Schemes QA Audited" value={stats.totalAudited} prefix={<FileProtectOutlined />} color="#1a5f2c" />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Certified QA Passed"
          value={stats.certifiedPassedCount}
          suffix={`/ ${stats.totalAudited}`}
          prefix={<SafetyCertificateOutlined />}
          color="#2f7d4a"
          footnote={`${stats.pendingRectificationCount} awaiting rectification`}
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard title="Cleared Command Area" value={stats.totalCertifiedArea} suffix="Ha" prefix={<AreaChartOutlined />} color="#5b8a6b" />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard title="Average Compliance Score" value={stats.avgComplianceScore} suffix="%" prefix={<CheckCircleOutlined />} color="#a16207" />
      </Col>
    </Row>
  );
}
