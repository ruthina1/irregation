import { Col, Row, Card } from 'antd';
import { AreaChartOutlined, DashboardOutlined, ExperimentOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import StatCard from '../../shared/components/StatCard';
import { NOT_TRACKED, fmt, LIGHT_GRAPH_COLORS } from '../shared/reportUtils';
import { useState, useMemo } from 'react';
import ZoneBarChart, { ZoneSelect } from '../shared/ZoneBarChart';

const isNull = (v) => v === null || v === undefined;

export default function WaterUtilizationKpis({ stats = {} }) {
  const navigate = useNavigate();
  const safeStats = stats || {};
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Total Effective Command Area"
          value={safeStats.totalEffective ?? 0}
          suffix="Ha"
          prefix={<AreaChartOutlined />}
          color="#1a5f2c"
          onClick={() => navigate('/irrigation/water-utilization/irrigated-area')}
        >
          <div style={{ fontSize: 11, color: '#595959', marginTop: 4 }}>
            R1: {safeStats.totalR1 ?? 0} • R2: {safeStats.totalR2 ?? 0} • R3: {safeStats.totalR3 ?? 0} Ha
          </div>
        </StatCard>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Pressurized Drip & Sprinkler Area"
          value={isNull(safeStats.totalMicro) ? NOT_TRACKED : safeStats.totalMicro}
          suffix={isNull(safeStats.totalMicro) ? undefined : 'Ha'}
          prefix={<ExperimentOutlined />}
          color="#64748b"
          footnote={isNull(safeStats.totalMicro) ? 'Application methods are not recorded yet' : 'Water Saving Micro-Irrigation Methods'}
          onClick={() => navigate('/irrigation/water-utilization/irrigation-systems')}
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Average Application Efficiency"
          value={isNull(safeStats.avgEfficiency) ? NOT_TRACKED : safeStats.avgEfficiency}
          suffix={isNull(safeStats.avgEfficiency) ? undefined : '%'}
          prefix={<DashboardOutlined />}
          color="#5b8a6b"
          footnote={isNull(safeStats.avgEfficiency) ? 'Field application efficiency is not recorded yet' : 'Conveyance & Plot Water Duty'}
          onClick={() => navigate('/irrigation/water-utilization/overview')}
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Solar & Deep Well Sites"
          value={(safeStats.totalSolar || 0) + (safeStats.totalDeepWells || 0)}
          prefix={<ThunderboltOutlined />}
          color="#64748b"
          footnote={`${safeStats.totalSolar || 0} Solar Lift Pumps • ${safeStats.totalDeepWells || 0} Deep Boreholes`}
          onClick={() => navigate('/irrigation/water-utilization/water-sources')}
        />
      </Col>
    </Row>
  );
}

// --- WaterUtilizationCharts (Identical attributes to table) ---

export function WaterUtilizationCharts({ rows = [], stats = {}, selectedZone = 'all' }) {
  const safeRows = Array.isArray(rows) ? rows : [];

  const formattedRows = useMemo(() => {
    return safeRows.map((r) => ({
      ...r,
      r1: Number(r.round_1_ha) || 0,
      r2: Number(r.round_2_ha) || 0,
      r3: Number(r.round_3_ha) || 0,
      total_ha: Number(r.total_effective_ha) || 0,
      solar_sites: Number(r.solar_pump_sites) || 0,
      well_sites: Number(r.deep_well_sites) || 0,
      drip_sprinkler_ha_num: Number(r.drip_sprinkler_ha) || 0,
      avg_efficiency_num: Number(r.avg_application_efficiency_pct) || 0,
    }));
  }, [safeRows]);

  return (
    <div style={{ marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {selectedZone !== 'all' && (
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1a5f2c', padding: '0 4px' }}>
          Filtering Charts by Zone: <strong>{selectedZone}</strong>
        </div>
      )}

      {/* Row 1: Seasonal Cropping Command + Total Effective Command */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card
            title="Seasonal Irrigated Land by Zone: Round 1, Round 2 & Round 3 (Ha)"
            variant="borderless"
            style={{ borderRadius: 8 }}
          >
            <ZoneBarChart
              rows={formattedRows}
              selectedZone={selectedZone}
              unit=" Ha"
              bars={[
                { dataKey: 'r1', name: '1st Round Bega (1ኛ ዙር)', fill: LIGHT_GRAPH_COLORS.green },
                { dataKey: 'r2', name: '2nd Round Belg (2ኛ ዙር)', fill: LIGHT_GRAPH_COLORS.blue },
                { dataKey: 'r3', name: '3rd Round Kiremt (3ኛ ዙር)', fill: LIGHT_GRAPH_COLORS.yellow },
              ]}
            />
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card
            title="Total Effective Command Area by Zone (Ha)"
            variant="borderless"
            style={{ borderRadius: 8 }}
          >
            <ZoneBarChart
              rows={formattedRows}
              selectedZone={selectedZone}
              unit=" Ha"
              bars={[
                { dataKey: 'total_ha', name: 'Effective Command Area (የለማ መሬት)', fill: LIGHT_GRAPH_COLORS.green },
              ]}
            />
          </Card>
        </Col>
      </Row>

      {/* Row 2: Water Abstraction Technology Sites + Micro-Irrigation & Efficiency */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title="Water Abstraction Technology Sites by Zone: Solar Pumps & Deep Wells"
            variant="borderless"
            style={{ borderRadius: 8 }}
          >
            <ZoneBarChart
              rows={formattedRows}
              selectedZone={selectedZone}
              unit=" Sites"
              bars={[
                { dataKey: 'solar_sites', name: 'Solar Hybrid Pumps (የፀሐይ ኃይል)', fill: LIGHT_GRAPH_COLORS.yellow },
                { dataKey: 'well_sites', name: 'Deep Groundwater Wells (ጥልቅ ጉድጓድ)', fill: LIGHT_GRAPH_COLORS.blue },
              ]}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title="Pressurized Micro-Irrigation (Ha) & Application Efficiency (%) by Zone"
            variant="borderless"
            style={{ borderRadius: 8 }}
          >
            <ZoneBarChart
              rows={formattedRows}
              selectedZone={selectedZone}
              bars={[
                { dataKey: 'drip_sprinkler_ha_num', name: 'Drip & Sprinkler (ጠብታ/ዘነባ ሄ/ር)', fill: LIGHT_GRAPH_COLORS.blue },
                { dataKey: 'avg_efficiency_num', name: 'Application Efficiency (%)', fill: LIGHT_GRAPH_COLORS.green },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

