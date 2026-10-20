import { Col, Row, Card } from 'antd';
import { AreaChartOutlined, BuildOutlined, CheckCircleOutlined, DollarCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import StatCard from '../../shared/components/StatCard';
import { NOT_TRACKED, fmt, millions, LIGHT_GRAPH_COLORS } from '../shared/reportUtils';
import { useState, useMemo } from 'react';
import ZoneBarChart, { ZoneSelect } from '../shared/ZoneBarChart';

export default function ConstructionKpis({ stats = {} }) {
  const navigate = useNavigate();
  const safeStats = stats || {};
  const adherenceTracked = safeStats.milestoneAdherencePct !== null && safeStats.milestoneAdherencePct !== undefined;
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Total Active Schemes"
          value={(safeStats.totalNew || 0) + (safeStats.totalRehab || 0)}
          prefix={<BuildOutlined />}
          color="#1a5f2c"
          onClick={() => navigate('/irrigation/construction/projects')}
        >
          <div style={{ fontSize: 11, color: '#595959', marginTop: 4 }}>
            {safeStats.totalNew || 0} New Schemes • {safeStats.totalRehab || 0} Existing Rehabilitation
          </div>
        </StatCard>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Total Construction Budget"
          value={millions(safeStats.totalBudget)}
          suffix="M ETB"
          prefix={<DollarCircleOutlined />}
          color="#5b8a6b"
          footnote={`Disbursed: ${millions(safeStats.totalDisbursed)}M (${safeStats.burnRate || 0}%)`}
          onClick={() => navigate('/irrigation/construction/funding')}
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Developed Command Area"
          value={safeStats.totalLand || 0}
          suffix="Ha"
          prefix={<AreaChartOutlined />}
          color="#a16207"
          footnote={`Serving ${fmt(safeStats.totalFarmers || 0)} Farmer Households`}
          onClick={() => navigate('/irrigation/construction/benefits')}
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Milestone Target Adherence"
          value={adherenceTracked ? safeStats.milestoneAdherencePct : NOT_TRACKED}
          suffix={adherenceTracked ? '%' : undefined}
          prefix={<CheckCircleOutlined />}
          color="#2f7d4a"
          footnote={adherenceTracked
            ? 'Share of contracts On Track or Ahead of Schedule'
            : 'No construction contracts recorded for this fiscal year'}
          onClick={() => navigate('/irrigation/construction/progress')}
        />
      </Col>
    </Row>
  );
}

// --- ConstructionCharts (Identical attributes to table) ---

export function ConstructionCharts({ rows = [], stats = {}, selectedProgram = 'all' }) {
  const safeRows = Array.isArray(rows) ? rows : [];

  const formattedRows = useMemo(() => {
    return safeRows.map((r) => ({
      ...r,
      allocated_m: Number(((Number(r.allocated_budget_etb) || 0) / 1e6).toFixed(2)),
      disbursed_m: Number(((Number(r.disbursed_etb) || 0) / 1e6).toFixed(2)),
      avg_new_pct: Number(r.avg_new_physical_pct) || 0,
      avg_rehab_pct: Number(r.avg_rehab_physical_pct) || 0,
      developed_land_ha_num: Number(r.developed_land_ha) || 0,
      beneficiaries_total_num: Number(r.beneficiaries_total) || 0,
    }));
  }, [safeRows]);

  return (
    <div style={{ marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {selectedProgram !== 'all' && (
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1a5f2c', padding: '0 4px' }}>
          Filtering Charts by Channel: <strong>{selectedProgram}</strong>
        </div>
      )}

      {/* Row 1: Schemes Count (New vs Rehab) + Physical Progress % */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title="Active Schemes by Financing Program: New Construction vs. Existing Rehabilitation"
            variant="borderless"
            style={{ borderRadius: 8 }}
          >
            <ZoneBarChart
              rows={formattedRows}
              selectedZone={selectedProgram}
              zoneKey="program"
              unit=" Schemes"
              bars={[
                { dataKey: 'new_schemes_count', name: 'New Construction (አዲስ ግንባታ)', fill: LIGHT_GRAPH_COLORS.green },
                { dataKey: 'existing_rehab_count', name: 'Existing Rehabilitation (ነባር እድሳት)', fill: LIGHT_GRAPH_COLORS.yellow },
              ]}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title="Average Physical Progress by Financing Program (%)"
            variant="borderless"
            style={{ borderRadius: 8 }}
          >
            <ZoneBarChart
              rows={formattedRows}
              selectedZone={selectedProgram}
              zoneKey="program"
              unit="%"
              bars={[
                { dataKey: 'avg_new_pct', name: 'New Scheme Progress (አማካይ %)', fill: LIGHT_GRAPH_COLORS.green },
                { dataKey: 'avg_rehab_pct', name: 'Rehab Scheme Progress (አማካይ %)', fill: LIGHT_GRAPH_COLORS.blue },
              ]}
            />
          </Card>
        </Col>
      </Row>

      {/* Row 2: Capital Budget Execution + Command Area */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title="Capital Budget Execution by Financing Program (Million ETB)"
            variant="borderless"
            style={{ borderRadius: 8 }}
          >
            <ZoneBarChart
              rows={formattedRows}
              selectedZone={selectedProgram}
              zoneKey="program"
              unit="M ETB"
              bars={[
                { dataKey: 'allocated_m', name: 'Allocated Budget (የተመደበ በጀት)', fill: LIGHT_GRAPH_COLORS.gray },
                { dataKey: 'disbursed_m', name: 'Disbursed Budget (ወጪ የተደረገ)', fill: LIGHT_GRAPH_COLORS.green },
              ]}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title="Developed Irrigation Command Area by Financing Program (Ha)"
            variant="borderless"
            style={{ borderRadius: 8 }}
          >
            <ZoneBarChart
              rows={formattedRows}
              selectedZone={selectedProgram}
              zoneKey="program"
              unit=" Ha"
              bars={[
                { dataKey: 'developed_land_ha_num', name: 'Developed Command Area (የለማ መሬት)', fill: LIGHT_GRAPH_COLORS.blue },
              ]}
            />
          </Card>
        </Col>
      </Row>

      {/* Row 3: Beneficiary Farmers */}
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card
            title="Beneficiary Farmers Served by Financing Program"
            variant="borderless"
            style={{ borderRadius: 8 }}
          >
            <ZoneBarChart
              rows={formattedRows}
              selectedZone={selectedProgram}
              zoneKey="program"
              unit=" Farmers"
              bars={[
                { dataKey: 'beneficiaries_total_num', name: 'Beneficiary Farmers (ተጠቃሚዎች)', fill: LIGHT_GRAPH_COLORS.green },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
