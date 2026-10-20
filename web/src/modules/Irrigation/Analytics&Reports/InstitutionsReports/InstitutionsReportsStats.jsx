import { Col, Row, Card } from 'antd';
import { AuditOutlined, BankOutlined, TeamOutlined, ToolOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import StatCard from '../../shared/components/StatCard';
import { fmt, LIGHT_GRAPH_COLORS } from '../shared/reportUtils';
import { useState, useMemo } from 'react';
import ZoneBarChart, { ZoneSelect } from '../shared/ZoneBarChart';

export default function InstitutionsKpis({ stats = {} }) {
  const navigate = useNavigate();
  const safeStats = stats || {};
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Total Registered WUAs"
          value={safeStats.totalWuas ?? 0}
          prefix={<BankOutlined />}
          color="#1a5f2c"
          onClick={() => navigate('/irrigation/institutions/water-users-associations')}
        >
          <div style={{ fontSize: 11, color: '#595959', marginTop: 4 }}>
            {safeStats.newWuas ?? 0} Newly Formed • {safeStats.strengthenedWuas ?? 0} Strengthened
          </div>
        </StatCard>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Audited Associations (ኦዲት)"
          value={safeStats.auditedWuas ?? 0}
          suffix={`/ ${safeStats.totalWuas ?? 0}`}
          prefix={<AuditOutlined />}
          color="#5b8a6b"
          footnote="Statutory Financial & Legal Compliance"
          onClick={() => navigate('/irrigation/institutions/assessment-audit')}
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Maintained Canals"
          value={safeStats.totalCanalKm ?? 0}
          suffix="km"
          prefix={<ToolOutlined />}
          color="#a16207"
          footnote={`Modern: ${safeStats.modernKm ?? 0} km • Traditional: ${safeStats.traditionalKm ?? 0} km`}
          onClick={() => navigate('/irrigation/institutions/infrastructure-maintenance')}
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Mobilized Community Labor"
          value={safeStats.totalLabor ?? 0}
          prefix={<TeamOutlined />}
          color="#64748b"
          footnote={`Across ${fmt(safeStats.totalMembers ?? 0)} WUA Farmer Members`}
          onClick={() => navigate('/irrigation/institutions/capacity-building')}
        />
      </Col>
    </Row>
  );
}

// --- InstitutionsCharts (Identical attributes to table) ---

export function InstitutionsCharts({ rows = [], stats = {}, selectedZone = 'all' }) {
  const safeRows = Array.isArray(rows) ? rows : [];

  const formattedRows = useMemo(() => {
    return safeRows.map((r) => ({
      ...r,
      total_wuas_num: Number(r.total_wuas) || 0,
      new_wuas_num: Number(r.new_wuas) || 0,
      strengthened_wuas_num: Number(r.strengthened_wuas) || 0,
      audited_wuas_num: Number(r.audited_wuas) || 0,
      unqualified_audits_num: Number(r.unqualified_audits) || 0,
      modern_km_num: Number(r.modern_canal_maintained_km) || 0,
      traditional_km_num: Number(r.traditional_canal_maintained_km) || 0,
      community_labor_num: Number(r.community_labor_count) || 0,
      wua_members_num: Number(r.wua_members_total) || 0,
    }));
  }, [safeRows]);

  return (
    <div style={{ marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {selectedZone !== 'all' && (
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1a5f2c', padding: '0 4px' }}>
          Filtering Charts by Zone: <strong>{selectedZone}</strong>
        </div>
      )}

      {/* Row 1: WUA Establishment + WUA Audits */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title="WUA Institutional Establishment by Zone: Total, New & Strengthened"
            variant="borderless"
            style={{ borderRadius: 8 }}
          >
            <ZoneBarChart
              rows={formattedRows}
              selectedZone={selectedZone}
              unit=" WUAs"
              bars={[
                { dataKey: 'total_wuas_num', name: 'Total WUAs (ጠቅላላ ማህበራት)', fill: LIGHT_GRAPH_COLORS.green },
                { dataKey: 'new_wuas_num', name: 'Newly Formed (አዲስ የተቋቋሙ)', fill: LIGHT_GRAPH_COLORS.blue },
                { dataKey: 'strengthened_wuas_num', name: 'Strengthened (የተጠናከሩ)', fill: LIGHT_GRAPH_COLORS.yellow },
              ]}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title="WUA Financial Governance Audits by Zone: Total Audited vs. Clean Opinions"
            variant="borderless"
            style={{ borderRadius: 8 }}
          >
            <ZoneBarChart
              rows={formattedRows}
              selectedZone={selectedZone}
              unit=" Audits"
              bars={[
                { dataKey: 'audited_wuas_num', name: 'Audited WUAs (ኦዲት የተደረጉ)', fill: LIGHT_GRAPH_COLORS.blue },
                { dataKey: 'unqualified_audits_num', name: 'Clean / Unqualified (ንፁህ አስተያየት)', fill: LIGHT_GRAPH_COLORS.green },
              ]}
            />
          </Card>
        </Col>
      </Row>

      {/* Row 2: Canal Maintenance + Labor & Membership */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title="Canal Desilting & Maintenance by Zone: Modern vs. Traditional (km)"
            variant="borderless"
            style={{ borderRadius: 8 }}
          >
            <ZoneBarChart
              rows={formattedRows}
              selectedZone={selectedZone}
              unit=" km"
              bars={[
                { dataKey: 'modern_km_num', name: 'Modern Canal (ዘመናዊ ቦይ)', fill: LIGHT_GRAPH_COLORS.yellow },
                { dataKey: 'traditional_km_num', name: 'Traditional Canal (ባህላዊ ቦይ)', fill: LIGHT_GRAPH_COLORS.red },
              ]}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title="Community Labor Mobilization & Total WUA Members by Zone"
            variant="borderless"
            style={{ borderRadius: 8 }}
          >
            <ZoneBarChart
              rows={formattedRows}
              selectedZone={selectedZone}
              bars={[
                { dataKey: 'wua_members_num', name: 'WUA Members (አባላት)', fill: LIGHT_GRAPH_COLORS.green },
                { dataKey: 'community_labor_num', name: 'Mobilized Labor (የህዝብ ጉልበት)', fill: LIGHT_GRAPH_COLORS.blue },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

