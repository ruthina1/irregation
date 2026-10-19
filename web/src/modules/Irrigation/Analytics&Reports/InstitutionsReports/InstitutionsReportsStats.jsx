import { Col, Row } from 'antd';
import { AuditOutlined, BankOutlined, TeamOutlined, ToolOutlined } from '@ant-design/icons';
import StatCard from '../../shared/components/StatCard';
import { fmt } from '../shared/reportUtils';

export default function InstitutionsKpis({ stats }) {
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} lg={6}>
        <StatCard title="Total Registered WUAs" value={stats.totalWuas} prefix={<BankOutlined />} color="#1a5f2c">
          <div style={{ fontSize: 11, color: '#595959', marginTop: 4 }}>
            {stats.newWuas} Newly Formed • {stats.strengthenedWuas} Strengthened
          </div>
        </StatCard>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard title="Audited Associations (ኦዲት)" value={stats.auditedWuas} suffix={`/ ${stats.totalWuas}`} prefix={<AuditOutlined />}
          color="#5b8a6b" footnote="Statutory Financial & Legal Compliance" />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard title="Maintained Canals" value={stats.totalCanalKm} suffix="km" prefix={<ToolOutlined />}
          color="#a16207" footnote={`Modern: ${stats.modernKm} km • Traditional: ${stats.traditionalKm} km`} />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard title="Mobilized Community Labor" value={stats.totalLabor} prefix={<TeamOutlined />}
          color="#64748b" footnote={`Across ${fmt(stats.totalMembers)} WUA Farmer Members`} />
      </Col>
    </Row>
  );
}
