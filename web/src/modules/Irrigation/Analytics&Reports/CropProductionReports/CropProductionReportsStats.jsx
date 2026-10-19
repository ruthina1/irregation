import { Col, Row } from 'antd';
import { AreaChartOutlined, CheckCircleOutlined, RiseOutlined, TeamOutlined } from '@ant-design/icons';
import StatCard from '../../shared/components/StatCard';
import { fmt } from '../shared/reportUtils';

export default function CropProductionKpis({ stats }) {
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} lg={6}>
        <StatCard title="Total Regional Output (ጠቅላላ ምርት)" value={stats.totalYield} suffix="Quintals" prefix={<RiseOutlined />}
          color="#a16207" footnote="Across 3 Cropping Rounds (1ኛ፣ 2ኛ፣ 3ኛ ዙር)" />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard title="Highland Wheat Harvest (የደጋ ስንዴ)" value={stats.totalWheatYield} suffix="Quintals" prefix={<CheckCircleOutlined />}
          color="#1a5f2c" footnote={`Produced over ${fmt(stats.totalWheatArea)} Hectares`} />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard title="Cultivated Command Area" value={stats.totalArea} suffix="Ha" prefix={<AreaChartOutlined />}
          color="#5b8a6b" footnote="Cereals, Pulses, Vegetables & Spices" />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard title="Direct Beneficiary Farmers" value={stats.totalFarmers} prefix={<TeamOutlined />}
          color="#64748b" footnote={`Female Farmers: ${stats.femaleSharePct}% Participation`} />
      </Col>
    </Row>
  );
}
