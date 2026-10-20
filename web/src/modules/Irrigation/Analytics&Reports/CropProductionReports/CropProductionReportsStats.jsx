import { Col, Row, Card } from 'antd';
import { AreaChartOutlined, CheckCircleOutlined, RiseOutlined, TeamOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import StatCard from '../../shared/components/StatCard';
import { fmt, LIGHT_GRAPH_COLORS } from '../shared/reportUtils';
import { useState, useMemo } from 'react';
import ZoneBarChart, { ZoneSelect } from '../shared/ZoneBarChart';

export default function CropProductionKpis({ stats = {} }) {
  const navigate = useNavigate();
  const safeStats = stats || {};
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Total Regional Output (ጠቅላላ ምርት)"
          value={safeStats.totalYield ?? 0}
          suffix="Quintals"
          prefix={<RiseOutlined />}
          color="#a16207"
          footnote="Across 3 Cropping Rounds (1ኛ፣ 2ኛ፣ 3ኛ ዙር)"
          onClick={() => navigate('/irrigation/production/seasonal-production')}
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Highland Wheat Harvest (የደጋ ስንዴ)"
          value={safeStats.totalWheatYield ?? 0}
          suffix="Quintals"
          prefix={<CheckCircleOutlined />}
          color="#1a5f2c"
          footnote={`Produced over ${fmt(safeStats.totalWheatArea ?? 0)} Hectares`}
          onClick={() => navigate('/irrigation/production/summer-wheat')}
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Cultivated Command Area"
          value={safeStats.totalArea ?? 0}
          suffix="Ha"
          prefix={<AreaChartOutlined />}
          color="#5b8a6b"
          footnote="Cereals, Pulses, Vegetables & Spices"
          onClick={() => navigate('/irrigation/production/overview')}
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Direct Beneficiary Farmers"
          value={safeStats.totalFarmers ?? 0}
          prefix={<TeamOutlined />}
          color="#64748b"
          footnote={`Female Farmers: ${safeStats.femaleSharePct ?? '0.0'}% Participation`}
          onClick={() => navigate('/irrigation/reports/beneficiaries')}
        />
      </Col>
    </Row>
  );
}

// --- CropProductionCharts (Identical attributes to table) ---

export function CropProductionCharts({ rows = [], stats = {}, selectedZone = 'all' }) {
  const safeRows = Array.isArray(rows) ? rows : [];

  const formattedRows = useMemo(() => {
    return safeRows.map((r) => ({
      ...r,
      cultivated_ha_num: Number(r.cultivated_ha) || 0,
      wheat_ha_num: Number(r.wheat_ha) || 0,
      total_yield_qt_num: Number(r.total_yield_qt) || 0,
      wheat_yield_qt_num: Number(r.wheat_yield_qt) || 0,
      fertilizer_qt_num: Number(r.fertilizer_qt) || 0,
      seed_qt_num: Number(r.seed_qt) || 0,
      farmers_male_num: Number(r.farmers_male) || 0,
      farmers_female_num: Number(r.farmers_female) || 0,
      total_farmers_num: (Number(r.farmers_male) || 0) + (Number(r.farmers_female) || 0),
    }));
  }, [safeRows]);

  return (
    <div style={{ marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {selectedZone !== 'all' && (
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1a5f2c', padding: '0 4px' }}>
          Filtering Charts by Zone: <strong>{selectedZone}</strong>
        </div>
      )}

      {/* Row 1: Cultivated Land & Wheat Command + Harvest Yield Output */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title="Cultivated Land & Highland Wheat Flagship Command by Zone (Ha)"
            variant="borderless"
            style={{ borderRadius: 8 }}
          >
            <ZoneBarChart
              rows={formattedRows}
              selectedZone={selectedZone}
              unit=" Ha"
              bars={[
                { dataKey: 'cultivated_ha_num', name: 'Cultivated Land (የለማ መሬት)', fill: LIGHT_GRAPH_COLORS.green },
                { dataKey: 'wheat_ha_num', name: 'Highland Wheat Flagship (የስንዴ ተፋሰስ)', fill: LIGHT_GRAPH_COLORS.yellow },
              ]}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title="Crop Harvest Output by Zone: Total Harvest vs. Highland Wheat Flagship (Quintals)"
            variant="borderless"
            style={{ borderRadius: 8 }}
          >
            <ZoneBarChart
              rows={formattedRows}
              selectedZone={selectedZone}
              unit=" Qt"
              bars={[
                { dataKey: 'total_yield_qt_num', name: 'Total Harvest (ጠቅላላ ምርት)', fill: LIGHT_GRAPH_COLORS.yellow },
                { dataKey: 'wheat_yield_qt_num', name: 'Highland Wheat Flagship (የደጋ ስንዴ)', fill: LIGHT_GRAPH_COLORS.green },
              ]}
            />
          </Card>
        </Col>
      </Row>

      {/* Row 2: Agricultural Inputs + Beneficiary Farmers */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title="Agricultural Input Utilization by Zone: Fertilizer vs. Improved Seed (Quintals)"
            variant="borderless"
            style={{ borderRadius: 8 }}
          >
            <ZoneBarChart
              rows={formattedRows}
              selectedZone={selectedZone}
              unit=" Qt"
              bars={[
                { dataKey: 'fertilizer_qt_num', name: 'Fertilizer (ማዳበሪያ)', fill: LIGHT_GRAPH_COLORS.green },
                { dataKey: 'seed_qt_num', name: 'Improved Seed (ምርጥ ዘር)', fill: LIGHT_GRAPH_COLORS.blue },
              ]}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title="Beneficiary Farmers by Zone: Total, Male & Female"
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
    </div>
  );
}

