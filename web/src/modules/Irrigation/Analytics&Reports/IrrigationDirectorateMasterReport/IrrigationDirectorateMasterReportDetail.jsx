import React from 'react';
import { Button, Card, Col, Descriptions, Divider, Modal, Progress, Row, Statistic, Tag } from 'antd';
import {
  BankOutlined,
  BuildOutlined,
  CheckCircleOutlined,
  DollarCircleOutlined,
  EnvironmentOutlined,
  EyeOutlined,
  FileProtectOutlined,
  RiseOutlined,
  TeamOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import { fmt, millions, pct, PROGRESS_BAR_COLORS } from '../shared/reportUtils';

/** Comprehensive Zonal Executive Dossier: details all 4 directorate pillars. */
export default function IrrigationDirectorateMasterReportDetail({ record, onClose, fiscalYear = '2019 E.C.' }) {
  if (!record) return null;

  const allocated = Number(record.allocated_construction_budget_etb) || 0;
  const disbursed = Number(record.disbursed_budget_etb) || 0;
  const burnRate = allocated > 0 ? Math.round((disbursed / allocated) * 100) : 0;

  const totalFarmers = Number(record.total_farmers) || ((Number(record.farmers_male) || 0) + (Number(record.farmers_female) || 0));
  const femaleFarmers = Number(record.farmers_female) || 0;
  const maleFarmers = Number(record.farmers_male) || 0;
  const femalePct = totalFarmers > 0 ? ((femaleFarmers / totalFarmers) * 100).toFixed(1) : '0.0';

  const plannedCommand = Number(record.managed_command_ha) || 0;
  const irrigatedActual = Number(record.irrigated_actual_ha) || 0;
  const commandRate = plannedCommand > 0 ? Math.round((irrigatedActual / plannedCommand) * 100) : 0;

  const modernCanal = Number(record.modern_canal_km) || 0;
  const traditionalCanal = Number(record.traditional_canal_km) || 0;
  const totalCanalKm = (modernCanal + traditionalCanal).toFixed(1);

  const totalYield = Number(record.total_yield_quintals) || 0;
  const wheatYield = Number(record.wheat_initiative_yield_qt) || 0;
  const wheatShare = totalYield > 0 ? Math.round((wheatYield / totalYield) * 100) : 0;

  return (
    <Modal
      title={(
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              backgroundColor: '#e8f5e9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <EnvironmentOutlined style={{ color: '#1a5f2c', fontSize: 20 }} />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>
                {record.zone || 'Administrative Zone'}
              </div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>
                Comprehensive Zonal Performance Dossier • የመስኖ ዳይሬክቶሬት ዝርዝር መረጃ
              </div>
            </div>
          </div>
          <Tag color="success" style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6 }}>
            {record.fiscal_year || fiscalYear}
          </Tag>
        </div>
      )}
      open={Boolean(record)}
      onCancel={onClose}
      centered
      wrapClassName="irr-workspace-modal"
      footer={[
        <Button key="close" type="primary" onClick={onClose} style={{ backgroundColor: '#1a5f2c', borderColor: '#1a5f2c' }}>
          Close Dossier
        </Button>,
      ]}
      width={840}
      destroyOnHidden
      styles={{ body: { maxHeight: '75vh', overflowY: 'auto', paddingRight: 8 } }}
    >
      <div style={{ marginTop: 16 }}>
        {/* Top Summary Metrics */}
        <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
          <Col xs={12} sm={6}>
            <Card size="small" style={{ borderRadius: 8, background: '#f8fafc', borderColor: '#e2e8f0' }}>
              <Statistic
                title={<span style={{ fontSize: 12, color: '#64748b' }}>Active Schemes</span>}
                value={record.active_construction_schemes ?? 0}
                valueStyle={{ color: '#1a5f2c', fontWeight: 700, fontSize: 20 }}
                prefix={<BuildOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" style={{ borderRadius: 8, background: '#f8fafc', borderColor: '#e2e8f0' }}>
              <Statistic
                title={<span style={{ fontSize: 12, color: '#64748b' }}>Budget Disbursed</span>}
                value={millions(record.disbursed_budget_etb)}
                suffix="M ETB"
                valueStyle={{ color: '#1a5f2c', fontWeight: 700, fontSize: 20 }}
                prefix={<DollarCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" style={{ borderRadius: 8, background: '#f8fafc', borderColor: '#e2e8f0' }}>
              <Statistic
                title={<span style={{ fontSize: 12, color: '#64748b' }}>Irrigated Command</span>}
                value={fmt(record.irrigated_actual_ha)}
                suffix="Ha"
                valueStyle={{ color: '#1a5f2c', fontWeight: 700, fontSize: 20 }}
                prefix={<RiseOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" style={{ borderRadius: 8, background: '#f8fafc', borderColor: '#e2e8f0' }}>
              <Statistic
                title={<span style={{ fontSize: 12, color: '#64748b' }}>Beneficiaries</span>}
                value={fmt(totalFarmers)}
                valueStyle={{ color: '#1a5f2c', fontWeight: 700, fontSize: 20 }}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* Pillar 1: Study & Engineering Pipeline */}
        <Card
          size="small"
          title={(
            <span style={{ fontSize: 13, fontWeight: 600, color: '#1f2937', display: 'flex', alignItems: 'center', gap: 6 }}>
              <FileProtectOutlined style={{ color: '#1a5f2c' }} />
              Pillar 1: Study & Certified Engineering Pipeline (የጥናትና ዲዛይን ዝግጁነት)
            </span>
          )}
          style={{ marginBottom: 16, borderRadius: 8 }}
        >
          <Descriptions size="small" bordered column={{ xs: 1, sm: 2 }}>
            <Descriptions.Item label="Active Studies Underway (በጥናት ላይ ያሉ)">
              <strong>{record.active_studies ?? 0} Schemes</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Construction-Ready Shelf (ለግንባታ ዝግጁ)">
              <Tag color="success" style={{ fontWeight: 600 }}>{record.construction_ready_schemes ?? 0} Schemes Ready</Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Pillar 2: Active Construction Schemes & Capital Financing */}
        <Card
          size="small"
          title={(
            <span style={{ fontSize: 13, fontWeight: 600, color: '#1f2937', display: 'flex', alignItems: 'center', gap: 6 }}>
              <BuildOutlined style={{ color: '#5b8a6b' }} />
              Pillar 2: Construction Schemes & Capital Financial Execution (የግንባታ አፈፃፀምና በጀት)
            </span>
          )}
          style={{ marginBottom: 16, borderRadius: 8 }}
        >
          <Descriptions size="small" bordered column={{ xs: 1, sm: 2 }}>
            <Descriptions.Item label="Active Construction Schemes">
              <strong>{record.active_construction_schemes ?? 0} Schemes</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Avg Physical Progress (%)">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                <span style={{ fontWeight: 700, color: '#1a5f2c' }}>{record.avg_physical_progress_pct ?? 0}%</span>
                <Progress
                  percent={Number(record.avg_physical_progress_pct) || 0}
                  size="small"
                  strokeColor={PROGRESS_BAR_COLORS.green}
                  trailColor={PROGRESS_BAR_COLORS.trail}
                  style={{ flex: 1 }}
                />
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Allocated Construction Budget">
              <span>{fmt(record.allocated_construction_budget_etb)} ETB (<strong>{millions(record.allocated_construction_budget_etb)} Million ETB</strong>)</span>
            </Descriptions.Item>
            <Descriptions.Item label="Disbursed Budget to Date">
              <span style={{ color: '#1a5f2c', fontWeight: 600 }}>
                {fmt(record.disbursed_budget_etb)} ETB ({millions(record.disbursed_budget_etb)} Million ETB)
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Financial Burn Rate (%)" span={2}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Tag color={burnRate >= 70 ? 'success' : burnRate >= 40 ? 'warning' : 'default'} style={{ fontWeight: 700 }}>
                  {burnRate}% Disbursed
                </Tag>
                <Progress
                  percent={burnRate}
                  size="small"
                  strokeColor={burnRate >= 70 ? PROGRESS_BAR_COLORS.green : PROGRESS_BAR_COLORS.yellow}
                  trailColor={PROGRESS_BAR_COLORS.trail}
                  style={{ width: 180 }}
                />
              </div>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Pillar 3: Irrigation Command Area & Agricultural Harvest Output */}
        <Card
          size="small"
          title={(
            <span style={{ fontSize: 13, fontWeight: 600, color: '#1f2937', display: 'flex', alignItems: 'center', gap: 6 }}>
              <RiseOutlined style={{ color: '#a16207' }} />
              Pillar 3: Command Area & Agronomic Production Output (የለማ መሬትና ምርት)
            </span>
          )}
          style={{ marginBottom: 16, borderRadius: 8 }}
        >
          <Descriptions size="small" bordered column={{ xs: 1, sm: 2 }}>
            <Descriptions.Item label="Planned Command Area (የታቀደ ሄክታር)">
              <strong>{fmt(record.managed_command_ha)} Hectares</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Actual Irrigated Command (የለማ መሬት)">
              <strong style={{ color: '#1a5f2c' }}>{fmt(record.irrigated_actual_ha)} Hectares</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Command Utilization Rate">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Tag color={commandRate >= 75 ? 'success' : 'default'}>{commandRate}%</Tag>
                <Progress
                  percent={commandRate}
                  size="small"
                  strokeColor={PROGRESS_BAR_COLORS.green}
                  trailColor={PROGRESS_BAR_COLORS.trail}
                  style={{ width: 120 }}
                />
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Total Crop Harvest (ጠቅላላ ምርት)">
              <strong style={{ color: '#a16207', fontSize: 13 }}>{fmt(record.total_yield_quintals)} Quintals</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Highland Wheat Flagship Yield" span={2}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#1a5f2c', fontWeight: 600 }}>{fmt(record.wheat_initiative_yield_qt)} Quintals</span>
                <span style={{ fontSize: 11, color: '#6b7280' }}>({wheatShare}% of regional zonal harvest)</span>
              </div>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Pillar 4: WUA Institutions, Canals & Beneficiaries */}
        <Card
          size="small"
          title={(
            <span style={{ fontSize: 13, fontWeight: 600, color: '#1f2937', display: 'flex', alignItems: 'center', gap: 6 }}>
              <BankOutlined style={{ color: '#0284c7' }} />
              Pillar 4: WUA Institutions, Canals & Beneficiary Communities (ማህበራት፣ ቦዮችና ተጠቃሚዎች)
            </span>
          )}
          style={{ borderRadius: 8 }}
        >
          <Descriptions size="small" bordered column={{ xs: 1, sm: 2 }}>
            <Descriptions.Item label="Registered WUAs (የተቋቋሙ ማህበራት)">
              <strong>{record.registered_wuas ?? 0} Associations</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Statutory Audited WUAs (ኦዲት የተደረጉ)">
              <Tag color="processing">{record.audited_wuas ?? 0} Audited</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Modern Concrete Canals Maintained">
              <strong>{record.modern_canal_km ?? 0} km</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Traditional Earth Canals Maintained">
              <strong>{record.traditional_canal_km ?? 0} km</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Total Maintained Canal Network" span={2}>
              <Tag color="default" icon={<ToolOutlined />} style={{ fontWeight: 600 }}>
                Total: {totalCanalKm} km Network Cleaned & Maintained
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Direct Beneficiary Farmers (ድምር ተጠቃሚ)">
              <strong style={{ color: '#1a5f2c', fontSize: 14 }}>{fmt(totalFarmers)} Farmers</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Gender Inclusivity Breakdown">
              <div style={{ fontSize: 12 }}>
                <span>Male: <strong>{fmt(maleFarmers)}</strong> | Female: <strong>{fmt(femaleFarmers)}</strong></span>
                <div style={{ marginTop: 2 }}>
                  <Tag color="cyan">{femalePct}% Women Participation</Tag>
                </div>
              </div>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
    </Modal>
  );
}
