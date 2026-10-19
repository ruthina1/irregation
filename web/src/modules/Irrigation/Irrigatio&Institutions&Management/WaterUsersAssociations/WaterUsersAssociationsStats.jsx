import { Col, Row } from 'antd';
import { AreaChartOutlined, BankOutlined, SafetyCertificateOutlined, TeamOutlined } from '@ant-design/icons';
import StatCard from '../../shared/components/StatCard';

/** KPI cards (Excel Section 3 indicators). */
export default function WuaStats({ stats }) {
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Total Registered WUAs (የማህበራት ብዛት)"
          value={stats.totalWuas}
          prefix={<BankOutlined />}
          color="#1a5f2c"
          footnote={`${stats.newEstablishedCount} Newly Formed • ${stats.strengthenedCount} Strengthened`}
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Managed Command Area (Ha)"
          value={stats.totalManagedCommandHa}
          suffix="Ha"
          prefix={<AreaChartOutlined />}
          color="#5b8a6b"
          footnote="Under Active WUA Water Allocation"
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="WUA Farmer Members (ድምር)"
          value={stats.totalMembers}
          prefix={<TeamOutlined />}
          color="#64748b"
          footnote={`Male: ${stats.totalMale.toLocaleString()} • Female: ${stats.totalFemale.toLocaleString()} (${stats.femaleSharePct}%)`}
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Executive Committee Leaders (አመራር)"
          value={stats.totalExecMale + stats.totalExecFemale}
          prefix={<SafetyCertificateOutlined />}
          color="#a16207"
          footnote={`Male: ${stats.totalExecMale} • Female: ${stats.totalExecFemale}`}
        />
      </Col>
    </Row>
  );
}
