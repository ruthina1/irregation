import { Col, Row, Card, Empty } from 'antd';
import { DollarCircleOutlined, FileSearchOutlined, RiseOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import StatCard from '../../shared/components/StatCard';
import { Bar, BarChart, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, XAxis, YAxis } from 'recharts';

/** KPI cards (Excel Section 3: audited & strengthened associations). Pending audits are excluded. */
export default function AuditStats({ stats }) {
  const pendingNote = stats.pendingCount ? ` • ${stats.pendingCount} Pending` : '';
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} lg={6}>
        <StatCard title="Audited & Inspected WUAs (ኦዲት የተደረጉ)" value={stats.totalAuditedWuas} prefix={<FileSearchOutlined />}
          color="#1a5f2c" footnote={`${stats.cleanAuditCount} Issued Clean Unqualified Opinions${pendingNote}`} />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard title="Strengthened Associations (የተጠናከሩ)" value={stats.strengthenedCount} suffix={`/ ${stats.totalAuditedWuas}`}
          prefix={<RiseOutlined />} color="#5b8a6b" footnote="Meeting Grade A & B Functionality" />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard title="Total Audited Water Revenue" value={(stats.totalAuditedRevenue / 1000).toFixed(0)} suffix="K ETB"
          prefix={<DollarCircleOutlined />} color="#a16207" footnote={`Across ${stats.totalAuditedWuas} Audited WUAs`} />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Average Institutional Score"
          value={stats.avgHealthScore ?? 'Not tracked'}
          suffix={stats.avgHealthScore === null ? undefined : '%'}
          prefix={<SafetyCertificateOutlined />}
          color="#64748b"
          footnote="Governance, Financial & O&M Compliance"
        />
      </Col>
    </Row>
  );
}


// --- AuditChart ---

/** Audited revenue vs. O&M expenses per association (thousand ETB). */
export function AuditChart({ data }) {
  return (
    <Card
      title={<span style={{ fontSize: 14, fontWeight: 600 }}>Audited Association Financial Performance: Revenue vs. Operational Expenses (Thousand ETB)</span>}
      variant="borderless"
      style={{ marginBottom: 20, borderRadius: 8 }}
    >
      <div style={{ height: 230 }}>
        {data.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barSize={26}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#595959' }} />
              <YAxis tick={{ fontSize: 11, fill: '#595959' }} unit="k" />
              <RechartsTooltip />
              <Bar dataKey="revenue" name="Audited Water Fee Revenue (k ETB)" fill="#1a5f2c" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" name="Audited O&M Expenses (k ETB)" fill="#5b8a6b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : <Empty description="No certified audits for this fiscal year" style={{ paddingTop: 50 }} />}
      </div>
    </Card>
  );
}
