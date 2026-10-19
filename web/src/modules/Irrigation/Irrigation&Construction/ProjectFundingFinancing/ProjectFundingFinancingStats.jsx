import { Col, Row, Card, Empty } from 'antd';
import { BankOutlined, DollarCircleOutlined, FundProjectionScreenOutlined, TransactionOutlined } from '@ant-design/icons';
import StatCard from '../../shared/components/StatCard';
import { FINANCING_PROGRAMS, toMillions } from './ProjectFundingFinancingManagement';
import { Bar, BarChart, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, XAxis, YAxis } from 'recharts';

/** KPI cards (Excel Section 2 financial indicators). */
export default function FundingStats({ stats }) {
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} lg={6}>
        <StatCard title="Total Allocated Capital Budget" value={toMillions(stats.totalAllocated)} suffix="M ETB" prefix={<BankOutlined />}
          color="#1a5f2c" footnote={`Across ${stats.totalSchemes} Construction Schemes`} />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard title="Cumulative Disbursed" value={toMillions(stats.totalDisbursed)} suffix="M ETB" prefix={<DollarCircleOutlined />}
          color="#5b8a6b" footnote={`Average Burn Rate: ${stats.avgBurnRate}%`} />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard title="Remaining Uncommitted Balance" value={toMillions(stats.totalRemaining)} suffix="M ETB" prefix={<TransactionOutlined />}
          color="#a16207" footnote="Available for Milestones & Retentions" />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard title="Active Partner Funding Channels" value={FINANCING_PROGRAMS.length} prefix={<FundProjectionScreenOutlined />}
          color="#64748b" footnote="PACT, FSRP, GCF, DRDIP, CREW, CRIPS" />
      </Col>
    </Row>
  );
}


// --- FundingChart ---

/** Allocated vs. disbursed vs. remaining balance per scheme (million ETB). */
export function FundingChart({ data }) {
  return (
    <Card
      title={<span style={{ fontSize: 14, fontWeight: 600 }}>Capital Budget Breakdown: Allocated vs. Disbursed vs. Balance (Million ETB)</span>}
      variant="borderless"
      style={{ marginBottom: 20, borderRadius: 8 }}
    >
      <div style={{ height: 230 }}>
        {data.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barSize={26}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#595959' }} />
              <YAxis tick={{ fontSize: 11, fill: '#595959' }} unit="M" />
              <RechartsTooltip />
              <Bar dataKey="allocated" name="Total Allocated (M ETB)" fill="#5b8a6b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="disbursed" name="Disbursed (M ETB)" fill="#1a5f2c" radius={[4, 4, 0, 0]} />
              <Bar dataKey="balance" name="Remaining Balance (M ETB)" fill="#a16207" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : <Empty description="No funding allocations for this fiscal year" style={{ paddingTop: 50 }} />}
      </div>
    </Card>
  );
}
