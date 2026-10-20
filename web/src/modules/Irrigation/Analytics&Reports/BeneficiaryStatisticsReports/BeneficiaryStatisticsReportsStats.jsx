import { Col, Row, Card } from 'antd';
import { IdcardOutlined, TeamOutlined, UserOutlined, WomanOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import StatCard from '../../shared/components/StatCard';
import { NOT_TRACKED, fmt, LIGHT_GRAPH_COLORS } from '../shared/reportUtils';
import { useState, useMemo } from 'react';
import ZoneBarChart, { ZoneSelect } from '../shared/ZoneBarChart';

export default function BeneficiaryKpis({ stats = {} }) {
  const navigate = useNavigate();
  const safeStats = stats || {};
  const fhh = safeStats.totalFHH === null || safeStats.totalFHH === undefined
    ? `Female-Headed Households: ${NOT_TRACKED}`
    : `Includes ${fmt(safeStats.totalFHH)} Female-Headed Households`;
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Total Direct Beneficiaries (ድምር)"
          value={safeStats.grandTotalFarmers || 0}
          prefix={<TeamOutlined />}
          color="#1a5f2c"
          onClick={() => navigate('/irrigation/construction/benefits')}
        >
          <div style={{ fontSize: 11, color: '#2f7d4a', marginTop: 4 }}>
            Across {safeStats.totalSchemes || 0} Schemes ({fmt(safeStats.totalCommandHa || 0)} Ha)
          </div>
        </StatCard>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Female Farmers (ሴት ተጠቃሚዎች)"
          value={safeStats.totalFemale || 0}
          suffix={`(${safeStats.femaleSharePct || 0}%)`}
          prefix={<WomanOutlined />}
          color="#64748b"
          footnote={fhh}
          onClick={() => navigate('/irrigation/construction/benefits')}
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Male Farmers (ወንድ ተጠቃሚዎች)"
          value={safeStats.totalMale || 0}
          prefix={<UserOutlined />}
          color="#5b8a6b"
          footnote="Head of Family Household Participants"
          onClick={() => navigate('/irrigation/construction/benefits')}
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Youth Farmers (ወጣቶች)"
          value={safeStats.totalYouth || 0}
          prefix={<IdcardOutlined />}
          color="#a16207"
          footnote={`${fmt(safeStats.totalWheatFarmers || 0)} in Highland Wheat Initiative`}
          onClick={() => navigate('/irrigation/production/summer-wheat')}
        />
      </Col>
    </Row>
  );
}


// --- BeneficiaryCharts (Identical attributes to table) ---

export function BeneficiaryCharts({ rows = [], stats = {}, selectedZone = 'all' }) {
  const safeRows = Array.isArray(rows) ? rows : [];

  const formattedRows = useMemo(() => {
    return safeRows.map((r) => ({
      ...r,
      schemes_count_num: Number(r.schemes_count) || 0,
      command_area_ha_num: Number(r.command_area_ha) || 0,
      total_farmers_num: Number(r.total_farmers) || 0,
      farmers_male_num: Number(r.farmers_male) || 0,
      farmers_female_num: Number(r.farmers_female) || 0,
      female_share_pct_num: Number(r.female_share_pct) || 0,
      youth_farmers_num: Number(r.youth_farmers) || 0,
      wua_members_num: Number(r.wua_members_total) || 0,
      wheat_farmers_num: Number(r.wheat_initiative_farmers) || 0,
    }));
  }, [safeRows]);

  return (
    <div style={{ marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {selectedZone !== 'all' && (
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1a5f2c', padding: '0 4px' }}>
          Filtering Charts by Zone: <strong>{selectedZone}</strong>
        </div>
      )}

      {/* Row 1: Schemes & Command Area + Direct Beneficiary Farmers */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title="Irrigation Schemes & Command Area by Zone (Ha)"
            variant="borderless"
            style={{ borderRadius: 8 }}
          >
            <ZoneBarChart
              rows={formattedRows}
              selectedZone={selectedZone}
              bars={[
                { dataKey: 'schemes_count_num', name: 'Schemes Count (አውታሮች)', fill: LIGHT_GRAPH_COLORS.green },
                { dataKey: 'command_area_ha_num', name: 'Command Area (ሄ/ር)', fill: LIGHT_GRAPH_COLORS.yellow },
              ]}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title="Direct Beneficiary Farmers by Zone: Total, Male & Female"
            variant="borderless"
            style={{ borderRadius: 8 }}
          >
            <ZoneBarChart
              rows={formattedRows}
              selectedZone={selectedZone}
              unit=" Farmers"
              bars={[
                { dataKey: 'total_farmers_num', name: 'Total Beneficiaries (ድምር)', fill: LIGHT_GRAPH_COLORS.blue },
                { dataKey: 'farmers_male_num', name: 'Male Farmers (ወንድ)', fill: LIGHT_GRAPH_COLORS.green },
                { dataKey: 'farmers_female_num', name: 'Female Farmers (ሴት)', fill: LIGHT_GRAPH_COLORS.yellow },
              ]}
            />
          </Card>
        </Col>
      </Row>

      {/* Row 2: Inclusivity + Cross-Program Participation */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title="Inclusivity by Zone: Gender Rate (%) & Youth Participation"
            variant="borderless"
            style={{ borderRadius: 8 }}
          >
            <ZoneBarChart
              rows={formattedRows}
              selectedZone={selectedZone}
              bars={[
                { dataKey: 'youth_farmers_num', name: 'Youth Farmers (ወጣቶች)', fill: LIGHT_GRAPH_COLORS.yellow },
                { dataKey: 'female_share_pct_num', name: 'Gender Inclusivity Rate (%)', fill: LIGHT_GRAPH_COLORS.red },
              ]}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title="Cross-Program Engagement by Zone: WUA Registry vs. Wheat Initiative"
            variant="borderless"
            style={{ borderRadius: 8 }}
          >
            <ZoneBarChart
              rows={formattedRows}
              selectedZone={selectedZone}
              unit=" Farmers"
              bars={[
                { dataKey: 'wua_members_num', name: 'WUA Registry (የማህበር አባላት)', fill: LIGHT_GRAPH_COLORS.green },
                { dataKey: 'wheat_farmers_num', name: 'Wheat Initiative (የስንዴ ተጠቃሚዎች)', fill: LIGHT_GRAPH_COLORS.blue },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

