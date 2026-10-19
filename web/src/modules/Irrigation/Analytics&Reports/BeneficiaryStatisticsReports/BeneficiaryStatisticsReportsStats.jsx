import { Col, Row, Card, Empty } from 'antd';
import { IdcardOutlined, TeamOutlined, UserOutlined, WomanOutlined } from '@ant-design/icons';
import StatCard from '../../shared/components/StatCard';
import { NOT_TRACKED, fmt } from '../shared/reportUtils';
import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function BeneficiaryKpis({ stats }) {
  const fhh = stats.totalFHH === null || stats.totalFHH === undefined
    ? `Female-Headed Households: ${NOT_TRACKED}`
    : `Includes ${fmt(stats.totalFHH)} Female-Headed Households`;
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} lg={6}>
        <StatCard title="Total Direct Beneficiaries (ድምር)" value={stats.grandTotalFarmers} prefix={<TeamOutlined />} color="#1a5f2c">
          <div style={{ fontSize: 11, color: '#2f7d4a', marginTop: 4 }}>
            Across {stats.totalSchemes} Schemes ({fmt(stats.totalCommandHa)} Ha)
          </div>
        </StatCard>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard title="Female Farmers (ሴት ተጠቃሚዎች)" value={stats.totalFemale} suffix={`(${stats.femaleSharePct}%)`}
          prefix={<WomanOutlined />} color="#64748b" footnote={fhh} />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard title="Male Farmers (ወንድ ተጠቃሚዎች)" value={stats.totalMale} prefix={<UserOutlined />}
          color="#5b8a6b" footnote="Head of Family Household Participants" />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard title="Youth Farmers (ወጣቶች)" value={stats.totalYouth} prefix={<IdcardOutlined />}
          color="#a16207" footnote={`${fmt(stats.totalWheatFarmers)} in Highland Wheat Initiative`} />
      </Col>
    </Row>
  );
}


// --- BeneficiaryCharts ---

const cardTitle = (text) => <span style={{ fontSize: 14, fontWeight: 600 }}>{text}</span>;

export function BeneficiaryCharts({ rows, stats }) {
  const genderByZone = useMemo(
    () => rows.map((r) => ({ zone: r.zone, male: Number(r.farmers_male) || 0, female: Number(r.farmers_female) || 0 })),
    [rows]
  );
  const pieData = useMemo(() => [
    { name: 'Male Farmers (ወንድ)', value: stats.totalMale, color: '#5b8a6b' },
    { name: 'Female Farmers (ሴት)', value: stats.totalFemale, color: '#64748b' },
  ], [stats.totalMale, stats.totalFemale]);
  const hasFarmers = stats.totalMale + stats.totalFemale > 0;

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} lg={16}>
        <Card title={cardTitle('Farmer Beneficiary Counts by Zone: Male vs. Female')} variant="borderless" style={{ borderRadius: 8 }}>
          <div style={{ height: 240 }}>
            {genderByZone.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={genderByZone} barSize={26}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="zone" tick={{ fontSize: 11, fill: '#595959' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#595959' }} />
                  <Tooltip />
                  <Bar dataKey="male" name="Male Farmers (ወንድ)" fill="#5b8a6b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="female" name="Female Farmers (ሴት)" fill="#64748b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <Empty description="No beneficiary data for this selection" />}
          </div>
        </Card>
      </Col>
      <Col xs={24} lg={8}>
        <Card title={cardTitle('Overall Regional Gender Split')} variant="borderless" style={{ borderRadius: 8 }}>
          <div style={{ height: 190 }}>
            {hasFarmers ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={4}>
                    {pieData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <Empty description="No farmers recorded" />}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, fontSize: 11 }}>
            {pieData.map((g) => (
              <span key={g.name} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: g.color }} />
                {g.name}: {fmt(g.value)}
              </span>
            ))}
          </div>
        </Card>
      </Col>
    </Row>
  );
}
