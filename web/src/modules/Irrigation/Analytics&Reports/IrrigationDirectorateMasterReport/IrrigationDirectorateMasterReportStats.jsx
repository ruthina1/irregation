import { Col, Row, Card, Empty } from 'antd';
import { BankOutlined, BuildOutlined, FileProtectOutlined, RiseOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import StatCard from '../../shared/components/StatCard';
import { millions, fmt, LIGHT_GRAPH_COLORS } from '../shared/reportUtils';
import { useState, useMemo } from 'react';
import ZoneBarChart, { ZoneSelect } from '../shared/ZoneBarChart';

/** Executive scorecard: the four directorate pillars. */
export default function DirectorateKpis({ stats = {} }) {
  const navigate = useNavigate();
  const safeStats = stats || {};
  const totalFarmers = Number(safeStats.grandTotalFarmers) || 0;
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Study & Construction-Ready Bank"
          value={safeStats.totalStudies ?? 0}
          suffix={`Active (${safeStats.totalReadyOnShelf ?? 0} Ready)`}
          prefix={<FileProtectOutlined />}
          color="#1a5f2c"
          footnote="Pillar 1: Certified Engineering Pipeline"
          onClick={() => navigate('/irrigation/reports/study-design')}
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Active Construction Schemes"
          value={safeStats.totalActiveConstruction ?? 0}
          suffix={`(${millions(safeStats.totalDisbursedBudget)}M ETB)`}
          prefix={<BuildOutlined />}
          color="#5b8a6b"
          footnote={`Pillar 2: ${safeStats.overallBurnRate ?? '0.0'}% Capital Budget Disbursed`}
          onClick={() => navigate('/irrigation/reports/construction')}
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="WUA Institutions & O&M Canals"
          value={safeStats.totalWuas ?? 0}
          suffix={`WUAs (${safeStats.totalAuditedWuas ?? 0} Audited)`}
          prefix={<BankOutlined />}
          color="#a16207"
          footnote={`Pillar 3: ${safeStats.totalCanalKm ?? '0.0'} km Canals Maintained`}
          onClick={() => navigate('/irrigation/reports/institutions')}
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Agronomic Harvest & Farmers"
          value={((safeStats.totalHarvestQt || 0) / 1000).toFixed(0)}
          suffix="K Quintals"
          prefix={<RiseOutlined />}
          color="#64748b"
          footnote={`Pillar 4: Serving ${totalFarmers.toLocaleString()} Farmers (${safeStats.femaleSharePct ?? '0.0'}% Women)`}
          onClick={() => navigate('/irrigation/reports/production')}
        />
      </Col>
    </Row>
  );
}

export function DirectorateCharts({ rows = [], stats = {}, selectedZone = 'all' }) {
  const safeRows = Array.isArray(rows) ? rows : [];

  const formattedRows = useMemo(() => {
    return safeRows.map((r) => ({
      ...r,
      allocated_budget_m: Number(((Number(r.allocated_construction_budget_etb) || 0) / 1e6).toFixed(2)),
      disbursed_budget_m: Number(((Number(r.disbursed_budget_etb) || 0) / 1e6).toFixed(2)),
      total_farmers_calc: Number(r.total_farmers) || (Number(r.farmers_male) || 0) + (Number(r.farmers_female) || 0),
    }));
  }, [safeRows]);

  return (
    <div style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {selectedZone !== 'all' && (
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1a5f2c', padding: '0 4px' }}>
          Filtering Charts by Zone: <strong>{selectedZone}</strong>
        </div>
      )}

      {/* Row 1: Study & Shelf Status + Active Construction Schemes */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title="Study & Shelf Status by Zone (ጥናትና ዝግጁ መደርደሪያ)"
            variant="borderless"
            style={{ borderRadius: 8 }}
          >
            <ZoneBarChart
              rows={formattedRows}
              selectedZone={selectedZone}
              unit=" Schemes"
              bars={[
                { dataKey: 'active_studies', name: 'Active Studies (በጥናት ላይ ያሉ)', fill: LIGHT_GRAPH_COLORS.yellow },
                { dataKey: 'construction_ready_schemes', name: 'Ready Shelf (ለግንባታ ዝግጁ)', fill: LIGHT_GRAPH_COLORS.green },
              ]}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title="Active Construction & Physical Progress by Zone (ግንባታና አፈፃፀም)"
            variant="borderless"
            style={{ borderRadius: 8 }}
          >
            <ZoneBarChart
              rows={formattedRows}
              selectedZone={selectedZone}
              bars={[
                { dataKey: 'active_construction_schemes', name: 'Active Schemes (ግንባታ ላይ ያሉ)', fill: LIGHT_GRAPH_COLORS.blue },
                { dataKey: 'avg_physical_progress_pct', name: 'Avg Progress % (አማካይ አፈፃፀም)', fill: LIGHT_GRAPH_COLORS.green },
              ]}
            />
          </Card>
        </Col>
      </Row>

      {/* Row 2: Capital Financial Execution + Command Area */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title="Capital Financial Execution by Zone (Million ETB / በጀትና ወጪ)"
            variant="borderless"
            style={{ borderRadius: 8 }}
          >
            <ZoneBarChart
              rows={formattedRows}
              selectedZone={selectedZone}
              unit="M ETB"
              bars={[
                { dataKey: 'allocated_budget_m', name: 'Allocated Budget (የተመደበ በጀት)', fill: LIGHT_GRAPH_COLORS.gray },
                { dataKey: 'disbursed_budget_m', name: 'Disbursed Budget (ወጪ የተደረገ)', fill: LIGHT_GRAPH_COLORS.green },
              ]}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title="Irrigation Command Area by Zone: Managed vs. Actual Irrigated (Ha)"
            variant="borderless"
            style={{ borderRadius: 8 }}
          >
            <ZoneBarChart
              rows={formattedRows}
              selectedZone={selectedZone}
              unit=" Ha"
              bars={[
                { dataKey: 'managed_command_ha', name: 'Managed Command (የታቀደ)', fill: LIGHT_GRAPH_COLORS.gray },
                { dataKey: 'irrigated_actual_ha', name: 'Actual Irrigated (የለማ መሬት)', fill: LIGHT_GRAPH_COLORS.blue },
              ]}
            />
          </Card>
        </Col>
      </Row>

      {/* Row 3: Total Harvest & Wheat Flagship + WUAs & Canals */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title="Crop Harvest Output by Zone: Total Harvest vs. Highland Wheat (Quintals)"
            variant="borderless"
            style={{ borderRadius: 8 }}
          >
            <ZoneBarChart
              rows={formattedRows}
              selectedZone={selectedZone}
              unit=" Qt"
              bars={[
                { dataKey: 'total_yield_quintals', name: 'Total Harvest (ጠቅላላ ምርት)', fill: LIGHT_GRAPH_COLORS.yellow },
                { dataKey: 'wheat_initiative_yield_qt', name: 'Wheat Flagship (የደጋ ስንዴ)', fill: LIGHT_GRAPH_COLORS.green },
              ]}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title="WUA Institutions & O&M Canal Maintenance by Zone"
            variant="borderless"
            style={{ borderRadius: 8 }}
          >
            <ZoneBarChart
              rows={formattedRows}
              selectedZone={selectedZone}
              bars={[
                { dataKey: 'registered_wuas', name: 'Total WUAs (ማህበራት)', fill: LIGHT_GRAPH_COLORS.green },
                { dataKey: 'audited_wuas', name: 'Audited WUAs (ኦዲት)', fill: LIGHT_GRAPH_COLORS.blue },
                { dataKey: 'modern_canal_km', name: 'Modern Canals (km)', fill: LIGHT_GRAPH_COLORS.yellow },
                { dataKey: 'traditional_canal_km', name: 'Traditional Canals (km)', fill: LIGHT_GRAPH_COLORS.red },
              ]}
            />
          </Card>
        </Col>
      </Row>

      {/* Row 4: Beneficiaries by Zone */}
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card
            title="Beneficiary Farmers by Zone: Total, Male & Female (ተጠቃሚዎች)"
            variant="borderless"
            style={{ borderRadius: 8 }}
          >
            <ZoneBarChart
              rows={formattedRows}
              selectedZone={selectedZone}
              unit=" Farmers"
              bars={[
                { dataKey: 'total_farmers_calc', name: 'Total Farmers (ጠቅላላ)', fill: LIGHT_GRAPH_COLORS.blue },
                { dataKey: 'farmers_male', name: 'Male Farmers (ወንድ)', fill: LIGHT_GRAPH_COLORS.green },
                { dataKey: 'farmers_female', name: 'Female Farmers (ሴት)', fill: LIGHT_GRAPH_COLORS.yellow },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

