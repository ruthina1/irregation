import { Col, Row, Card } from 'antd';
import { AreaChartOutlined, BuildOutlined, FileDoneOutlined, TeamOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import StatCard from '../../shared/components/StatCard';
import { useState, useMemo } from 'react';
import ZoneBarChart, { ZoneSelect } from '../shared/ZoneBarChart';
import { fmt, LIGHT_GRAPH_COLORS } from '../shared/reportUtils';

export default function StudyDesignKpis({ stats = {} }) {
  const navigate = useNavigate();
  const safeStats = stats || {};
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Total Active Studies (በጥናት ላይ)"
          value={safeStats.totalPipeline ?? 0}
          prefix={<FileDoneOutlined />}
          color="#1a5f2c"
          onClick={() => navigate('/irrigation/study-design/projects')}
        >
          <div style={{ fontSize: 11, color: '#595959', marginTop: 4 }}>
            {safeStats.totalConsultant ?? 0} Consultant • {safeStats.totalInhouse ?? 0} In-House (ክልል/ዞን/ወረዳ)
          </div>
        </StatCard>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Construction-Ready Shelf (ለግንባታ ዝግጁ)"
          value={safeStats.totalReady ?? 0}
          prefix={<BuildOutlined />}
          color="#2f7d4a"
          footnote="Certified Shelf Inventory"
          onClick={() => navigate('/irrigation/study-design/construction-ready')}
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Total Projected Command (ሄ/ር)"
          value={safeStats.totalArea ?? 0}
          suffix="Ha"
          prefix={<AreaChartOutlined />}
          color="#5b8a6b"
          footnote={`Benefiting ${(safeStats.totalFarmers ?? 0).toLocaleString()} Households`}
          onClick={() => navigate('/irrigation/study-design/project-identification')}
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Trained Technical Staff (በባለሙያ)"
          value={safeStats.totalTrained ?? 0}
          prefix={<TeamOutlined />}
          color="#a16207"
          footnote="Institutional Capacity Building (ወንድ/ሴት/ድምር)"
          onClick={() => navigate('/irrigation/study-design/capacity-building')}
        />
      </Col>
    </Row>
  );
}

// --- StudyDesignCharts (Identical attributes to table) ---

export function StudyDesignCharts({ rows = [], stats = {}, selectedZone = 'all' }) {
  const safeRows = Array.isArray(rows) ? rows : [];

  const formattedRows = useMemo(() => {
    return safeRows.map((r) => ({
      ...r,
      beneficiaries_total: (Number(r.beneficiaries_male) || 0) + (Number(r.beneficiaries_female) || 0),
      trained_total: (Number(r.experts_trained_male) || 0) + (Number(r.experts_trained_female) || 0),
    }));
  }, [safeRows]);

  return (
    <div style={{ marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {selectedZone !== 'all' && (
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1a5f2c', padding: '0 4px' }}>
          Filtering Charts by Zone: <strong>{selectedZone}</strong>
        </div>
      )}

      {/* Row 1: Studies Underway + Quality Assurance & Readiness */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title="Studies Underway by Zone: Total Pipeline, Consultant & In-House"
            variant="borderless"
            style={{ borderRadius: 8 }}
          >
            <ZoneBarChart
              rows={formattedRows}
              selectedZone={selectedZone}
              unit=" Studies"
              bars={[
                { dataKey: 'total_pipeline', name: 'Total Studies (ጠቅላላ)', fill: LIGHT_GRAPH_COLORS.blue },
                { dataKey: 'consultant_studies', name: 'Consultant (አማካሪ)', fill: LIGHT_GRAPH_COLORS.yellow },
                { dataKey: 'inhouse_studies', name: 'In-House (በራስ አቅም)', fill: LIGHT_GRAPH_COLORS.green },
              ]}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title="Quality Assurance & Construction Readiness by Zone (Schemes)"
            variant="borderless"
            style={{ borderRadius: 8 }}
          >
            <ZoneBarChart
              rows={formattedRows}
              selectedZone={selectedZone}
              unit=" Schemes"
              bars={[
                { dataKey: 'qa_passed_count', name: 'QA Passed (ጥራት የተረጋገጠ)', fill: LIGHT_GRAPH_COLORS.yellow },
                { dataKey: 'construction_ready_count', name: 'Ready Shelf (ለግንባታ ዝግጁ)', fill: LIGHT_GRAPH_COLORS.green },
              ]}
            />
          </Card>
        </Col>
      </Row>

      {/* Row 2: Command Area + Target Beneficiaries */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title="Planned Irrigation Command Area by Zone (Ha)"
            variant="borderless"
            style={{ borderRadius: 8 }}
          >
            <ZoneBarChart
              rows={formattedRows}
              selectedZone={selectedZone}
              unit=" Ha"
              bars={[
                { dataKey: 'command_area_ha', name: 'Planned Command Area (የታቀደ ሄ/ር)', fill: LIGHT_GRAPH_COLORS.green },
              ]}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title="Target Beneficiary Farmers by Zone: Total, Male & Female"
            variant="borderless"
            style={{ borderRadius: 8 }}
          >
            <ZoneBarChart
              rows={formattedRows}
              selectedZone={selectedZone}
              unit=" Farmers"
              bars={[
                { dataKey: 'beneficiaries_total', name: 'Total Beneficiaries (ድምር)', fill: LIGHT_GRAPH_COLORS.blue },
                { dataKey: 'beneficiaries_male', name: 'Male Farmers (ወንድ)', fill: LIGHT_GRAPH_COLORS.green },
                { dataKey: 'beneficiaries_female', name: 'Female Farmers (ሴት)', fill: LIGHT_GRAPH_COLORS.yellow },
              ]}
            />
          </Card>
        </Col>
      </Row>

      {/* Row 3: Trained Technical Staff */}
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card
            title="Trained Technical Staff by Zone: Total, Male & Female (ባለሙያዎች)"
            variant="borderless"
            style={{ borderRadius: 8 }}
          >
            <ZoneBarChart
              rows={formattedRows}
              selectedZone={selectedZone}
              unit=" Staff"
              bars={[
                { dataKey: 'trained_total', name: 'Total Trained (ጠቅላላ ባለሙያ)', fill: LIGHT_GRAPH_COLORS.blue },
                { dataKey: 'experts_trained_male', name: 'Male Staff (ወንድ)', fill: LIGHT_GRAPH_COLORS.green },
                { dataKey: 'experts_trained_female', name: 'Female Staff (ሴት)', fill: LIGHT_GRAPH_COLORS.yellow },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export { StudyDesignCharts as StudyDesignChart };
