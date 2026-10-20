import { Col, Progress, Row } from 'antd';
import { AreaChartOutlined, BuildOutlined, CompassOutlined, FileDoneOutlined } from '@ant-design/icons';
import StatCard from '../../shared/components/StatCard';
import { toNumber } from '../../shared/utils';
import { ROUTES } from './StudyDesignDashboardManagement';

/** Executive KPI row; null metrics show "Not tracked". */
export default function StudyDesignDashboardStats({ kpis, onNavigate }) {
  const k = kpis || {};
  const tracked = (value) => (value === null || value === undefined ? 'Not tracked' : value);

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Pipeline Scouting Schemes"
          value={tracked(k.pipeline_schemes)}
          prefix={<CompassOutlined />}
          color="#5b8a6b"
          onClick={() => onNavigate(ROUTES.pipeline)}
        >
          <div style={{ marginTop: 8, fontSize: 12, color: '#5b8a6b', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>Review pipeline queue</span> &rarr;
          </div>
        </StatCard>
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Active Engineering Studies"
          value={tracked(k.active_studies)}
          prefix={<FileDoneOutlined />}
          color="#64748b"
          onClick={() => onNavigate(ROUTES.studies)}
        >
          <div style={{ marginTop: 8, fontSize: 12, color: '#64748b' }}>
            {toNumber(k.in_house_studies)} In-House • {toNumber(k.consultant_studies)} Consultant • {toNumber(k.program_studies)} Program
          </div>
        </StatCard>
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Construction-Ready Designs"
          value={tracked(k.construction_ready)}
          suffix={k.active_studies !== null && k.active_studies !== undefined ? `/ ${k.active_studies}` : undefined}
          prefix={<BuildOutlined />}
          color="#2f7d4a"
          onClick={() => onNavigate && onNavigate(ROUTES.shelf)}
        >
          <Progress percent={toNumber(k.construction_ready_pct)} size="small" strokeColor="#2f7d4a" style={{ marginTop: 6 }} />
        </StatCard>
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Total Irrigable Potential"
          value={tracked(k.total_irrigable_ha)}
          suffix={k.total_irrigable_ha === null || k.total_irrigable_ha === undefined ? undefined : 'Ha'}
          prefix={<AreaChartOutlined />}
          color="#a16207"
          onClick={() => onNavigate && onNavigate(ROUTES.reports)}
        >
          <div style={{ marginTop: 8, fontSize: 12, color: '#595959' }}>
            {k.total_households === null || k.total_households === undefined
              ? 'Beneficiary households: Not tracked'
              : `Benefiting ~${toNumber(k.total_households).toLocaleString()} farmer households`}
          </div>
        </StatCard>
      </Col>
    </Row>
  );
}
