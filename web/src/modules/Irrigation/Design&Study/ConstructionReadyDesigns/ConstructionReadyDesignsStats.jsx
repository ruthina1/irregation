import { Col, Row } from 'antd';
import { AreaChartOutlined, BuildOutlined, DollarCircleOutlined, FileDoneOutlined } from '@ant-design/icons';
import StatCard from '../../shared/components/StatCard';

export default function ConstructionReadyDesignsStats({ stats }) {
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} lg={6}>
        <StatCard title="Shelf Project Bank Total" value={stats.totalReadySchemes} prefix={<BuildOutlined />} color="#1a5f2c" />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard title="Packaged for Tender" value={stats.readyForProcurement} suffix={`/ ${stats.totalReadySchemes}`} prefix={<FileDoneOutlined />} color="#5b8a6b" />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard title="Total Command Area on Shelf" value={stats.totalReadyHectares} suffix="Ha" prefix={<AreaChartOutlined />} color="#2f7d4a" />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard title="Total Construction Investment" value={(stats.totalEstimatedCapital / 1000000).toFixed(1)} suffix="M ETB" prefix={<DollarCircleOutlined />} color="#a16207" />
      </Col>
    </Row>
  );
}
