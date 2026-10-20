import { Button, Card, Col, Empty, Row, Table, Tag } from 'antd';
import { CheckCircleOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { extractName, toNumber } from '../../shared/utils';


import {
  Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis,
} from 'recharts';

/** Stage progression bar chart + modality portfolio donut. */
export function DashboardCharts({ stageProgress, modalityDistribution }) {
  const hasModalityArea = modalityDistribution.some((m) => Number(m.hectares) > 0);

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} lg={15}>
        <Card
          title={<span style={{ fontSize: 14, fontWeight: 600 }}>Study Progression Through Engineering Gates</span>}
          variant="borderless"
          style={{ borderRadius: 8 }}
        >
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageProgress} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="stage" tick={{ fontSize: 11, fill: '#595959' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#595959' }} />
                <RechartsTooltip formatter={(value, name, item) => (
                  name === 'Number of Schemes'
                    ? [`${value} (${Number(item?.payload?.area || 0).toLocaleString()} Ha)`, name]
                    : [value, name]
                )}
                />
                <Bar dataKey="schemes" name="Number of Schemes" fill="#1a5f2c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </Col>

      <Col xs={24} lg={9}>
        <Card
          title={<span style={{ fontSize: 14, fontWeight: 600 }}>Modality Portfolio (By Command Area)</span>}
          variant="borderless"
          style={{ borderRadius: 8 }}
        >
          <div style={{ height: 210 }}>
            {hasModalityArea ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={modalityDistribution} dataKey="hectares" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={4}>
                    {modalityDistribution.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <RechartsTooltip formatter={(value, name, item) => [`${Number(value).toLocaleString()} Ha (${item?.payload?.count ?? 0} studies)`, name]} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No study command area recorded for this fiscal year" style={{ paddingTop: 40 }} />
            )}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', fontSize: 11 }}>
            {modalityDistribution.map((m) => (
              <span key={m.name} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: m.color }} />
                {m.name}
              </span>
            ))}
          </div>
        </Card>
      </Col>
    </Row>
  );
}






const columns = [
  {
    title: 'Project Code',
    dataIndex: 'code',
    key: 'code',
    render: (c) => <span style={{ fontFamily: 'monospace' }}>{c}</span>,
  },
  {
    title: 'Irrigation Scheme',
    dataIndex: 'name',
    key: 'name',
    render: (t) => <strong style={{ color: '#1a5f2c' }}>{t}</strong>,
  },
  {
    title: 'Study Modality',
    dataIndex: 'modality',
    key: 'modality',
    render: (m) => (m ? <Tag color="default">{m}</Tag> : '—'),
  },
  {
    title: 'Command Area',
    dataIndex: 'area',
    key: 'area',
    render: (a) => `${toNumber(a).toLocaleString()} Ha`,
  },
  {
    title: 'Administrative Zone',
    dataIndex: 'zone',
    key: 'zone',
    render: (z) => extractName(z),
  },
  {
    title: 'QA Certification',
    dataIndex: 'qa_certificate_no',
    key: 'qa',
    render: (cert, r) => (
      <div>
        <Tag color="success" icon={<SafetyCertificateOutlined />}>Passed & Certified</Tag>
        <div style={{ fontSize: 10, color: '#8c8c8c', marginTop: 2 }}>
          {cert ? `${cert} • ` : ''}{r.shelf_status}
        </div>
      </div>
    ),
  },
];

/** Latest designs placed on the construction-ready shelf. */
export function RecentCertificationsTable({ data, loading, onViewAll }) {
  return (
    <Card
      title={(
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>
            Recent Construction-Ready Design Certifications (ለግንባታ ዝግጁ የሆኑ ዲዛይኖች)
          </span>
          <Button type="link" onClick={onViewAll} style={{ color: '#1a5f2c', padding: 0 }}>
            View All Projects &rarr;
          </Button>
        </div>
      )}
      variant="borderless"
      style={{ borderRadius: 8 }}
    >
      <Table
        dataSource={data}
        rowKey="key"
        loading={loading}
        pagination={false}
        size="middle"
        columns={columns}
        locale={{ emptyText: 'No designs have been certified construction-ready in this fiscal year' }}
      />
    </Card>
  );
}


export default function StudyDesignDashboardTable({ recentCertifications = [], stageProgress = [], modalityDistribution = [], loading = false, onViewAll }) {
  return (
    <>
      <RecentCertificationsTable data={recentCertifications} loading={loading} onViewAll={onViewAll} />
      <div style={{ marginTop: 16 }}>
        <DashboardCharts stageProgress={stageProgress} modalityDistribution={modalityDistribution} />
      </div>
    </>
  );
}
