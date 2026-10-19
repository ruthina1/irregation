import { Alert, Progress, Table, Tag } from 'antd';
import { EMPTY_TEXT, fmt, millions } from '../shared/reportUtils';

const portfolioColumns = [
  { title: 'Funding Channel / Program Source', dataIndex: 'program', key: 'program', render: (p) => <strong style={{ color: '#1a5f2c' }}>{p}</strong> },
  { title: 'Active Schemes Supported', dataIndex: 'schemes', key: 'schemes', render: (s) => <Tag color="default">{s} Schemes</Tag> },
  { title: 'Allocated Capital Budget', dataIndex: 'allocated', key: 'allocated', render: (a) => `${a} Million ETB` },
  { title: 'Disbursed to Date', dataIndex: 'disbursed', key: 'disbursed', render: (d) => <strong style={{ color: '#1a5f2c' }}>{d} Million ETB</strong> },
  {
    title: 'Financial Burn Rate (%)', key: 'burn_rate',
    render: (_, r) => {
      const rate = r.allocated > 0 ? Math.round((r.disbursed / r.allocated) * 100) : 0;
      return (
        <div style={{ minWidth: 120 }}>
          <span>{rate}%</span>
          <Progress percent={rate} size="small" strokeColor={rate >= 70 ? '#1a5f2c' : '#a16207'} />
        </div>
      );
    },
  },
];

export default function ProgramPortfolioTable({ portfolio, loading }) {
  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <Alert
          title="Directorate Capital Budget Oversight"
          description="Tracks portfolio execution across Regional Treasury and Special Development Partners (World Bank PACT, FSRP, GCF, and DRDIP)."
          type="info"
          showIcon
        />
      </div>
      <Table columns={portfolioColumns} dataSource={portfolio} rowKey="program" loading={loading}
        pagination={false} bordered size="middle" locale={{ emptyText: EMPTY_TEXT }} />
    </>
  );
}


// --- ZonalSynthesisTable ---

const zonalColumns = [
  { title: 'Administrative Zone (ዞን)', dataIndex: 'zone', key: 'zone', render: (z) => <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{z}</strong> },
  {
    title: 'Study & Shelf Status', key: 'study_status',
    render: (_, r) => <span>Active: <strong>{r.active_studies}</strong> | Ready Shelf: <Tag color="success">{r.construction_ready_schemes}</Tag></span>,
  },
  {
    title: 'Active Construction & Progress', key: 'construction',
    render: (_, r) => (
      <div style={{ minWidth: 140 }}>
        <span><strong>{r.active_construction_schemes} Schemes</strong> (Avg: {r.avg_physical_progress_pct}%)</span>
        <Progress percent={Number(r.avg_physical_progress_pct) || 0} size="small" strokeColor="#1a5f2c" />
      </div>
    ),
  },
  {
    title: 'Financial Execution (ETB)', key: 'budget',
    render: (_, r) => <div style={{ fontSize: 11 }}><strong>{millions(r.disbursed_budget_etb)}M</strong> / {millions(r.allocated_construction_budget_etb)}M ETB</div>,
  },
  {
    title: 'Command Area (Planned / Irrigated)', key: 'command',
    render: (_, r) => (
      <div style={{ fontSize: 11 }}>
        <div>Command: <strong>{fmt(r.managed_command_ha)} Ha</strong></div>
        <div style={{ color: '#1a5f2c' }}>Active Irrigated: {fmt(r.irrigated_actual_ha)} Ha</div>
      </div>
    ),
  },
  {
    title: 'Total Harvest & Wheat Flagship', key: 'yield',
    render: (_, r) => (
      <div style={{ fontSize: 11 }}>
        <div>Total: <strong style={{ color: '#a16207' }}>{fmt(r.total_yield_quintals)} Qt</strong></div>
        <div style={{ color: '#1a5f2c' }}>Wheat: {fmt(r.wheat_initiative_yield_qt)} Qt</div>
      </div>
    ),
  },
  {
    title: 'WUAs & O&M Canals (km)', key: 'institutions',
    render: (_, r) => (
      <div style={{ fontSize: 11 }}>
        <div>WUAs: <strong>{r.registered_wuas}</strong> ({r.audited_wuas} Audited)</div>
        <div style={{ color: '#8c8c8c' }}>Canals: {r.modern_canal_km}km Mod / {r.traditional_canal_km}km Trad</div>
      </div>
    ),
  },
  {
    title: 'Beneficiaries (ድምር)', key: 'farmers',
    render: (_, r) => (
      <div style={{ fontSize: 11 }}>
        <strong style={{ color: '#1a5f2c' }}>{fmt(r.total_farmers)}</strong>
        <div style={{ color: '#8c8c8c' }}>M: {r.farmers_male} / F: {r.farmers_female}</div>
      </div>
    ),
  },
];

export function ZonalSynthesisTable({ rows, loading }) {
  return (
    <Table columns={zonalColumns} dataSource={rows} rowKey="key" loading={loading} pagination={false}
      scroll={{ x: 1450 }} bordered size="middle" locale={{ emptyText: EMPTY_TEXT }} />
  );
}
