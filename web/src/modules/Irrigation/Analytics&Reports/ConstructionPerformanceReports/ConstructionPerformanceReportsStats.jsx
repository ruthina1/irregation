import { Col, Row } from 'antd';
import { AreaChartOutlined, BuildOutlined, CheckCircleOutlined, DollarCircleOutlined } from '@ant-design/icons';
import StatCard from '../../shared/components/StatCard';
import { NOT_TRACKED, fmt, millions } from '../shared/reportUtils';

export default function ConstructionKpis({ stats }) {
  const adherenceTracked = stats.milestoneAdherencePct !== null && stats.milestoneAdherencePct !== undefined;
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} lg={6}>
        <StatCard title="Total Active Schemes" value={stats.totalNew + stats.totalRehab} prefix={<BuildOutlined />} color="#1a5f2c">
          <div style={{ fontSize: 11, color: '#595959', marginTop: 4 }}>
            {stats.totalNew} New Schemes • {stats.totalRehab} Existing Rehabilitation
          </div>
        </StatCard>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard title="Total Construction Budget" value={millions(stats.totalBudget)} suffix="M ETB" prefix={<DollarCircleOutlined />}
          color="#5b8a6b" footnote={`Disbursed: ${millions(stats.totalDisbursed)}M (${stats.burnRate}%)`} />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard title="Developed Command Area" value={stats.totalLand} suffix="Ha" prefix={<AreaChartOutlined />}
          color="#a16207" footnote={`Serving ${fmt(stats.totalFarmers)} Farmer Households`} />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Milestone Target Adherence"
          value={adherenceTracked ? stats.milestoneAdherencePct : NOT_TRACKED}
          suffix={adherenceTracked ? '%' : undefined}
          prefix={<CheckCircleOutlined />}
          color="#2f7d4a"
          footnote={adherenceTracked
            ? 'Share of contracts On Track or Ahead of Schedule'
            : 'No construction contracts recorded for this fiscal year'}
        />
      </Col>
    </Row>
  );
}
