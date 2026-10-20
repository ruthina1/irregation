import React from 'react';
import { Button, Card, Col, Descriptions, Modal, Progress, Row, Statistic, Tag } from 'antd';
import {
  AreaChartOutlined,
  BuildOutlined,
  DollarCircleOutlined,
  ProjectOutlined,
  RiseOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { fmt, millions, PROGRESS_BAR_COLORS } from '../shared/reportUtils';

export default function ConstructionPerformanceReportsDetail({ record, onClose }) {
  if (!record) return null;

  const allocated = Number(record.allocated_budget_etb) || 0;
  const disbursed = Number(record.disbursed_etb) || 0;
  const burnRate = allocated > 0 ? Math.round((disbursed / allocated) * 100) : 0;

  const totalSchemes = (Number(record.new_schemes_count) || 0) + (Number(record.existing_rehab_count) || 0);

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
              <ProjectOutlined style={{ color: '#1a5f2c', fontSize: 20 }} />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>
                {record.program || 'Financing Channel'}
              </div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>
                Construction Monitoring Dossier • የግንባታ ክትትል ዝርዝር መረጃ
              </div>
            </div>
          </div>
          <Tag color="success" style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6 }}>
            {record.fiscal_year || 'Fiscal Year'}
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
      width={780}
      destroyOnHidden
      styles={{ body: { maxHeight: '75vh', overflowY: 'auto', paddingRight: 8 } }}
    >
      <div style={{ marginTop: 16 }}>
        <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
          <Col xs={12} sm={6}>
            <Card size="small" style={{ borderRadius: 8, background: '#f8fafc', borderColor: '#e2e8f0' }}>
              <Statistic
                title={<span style={{ fontSize: 12, color: '#64748b' }}>Total Schemes</span>}
                value={totalSchemes}
                valueStyle={{ color: '#1a5f2c', fontWeight: 700, fontSize: 20 }}
                prefix={<BuildOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" style={{ borderRadius: 8, background: '#f8fafc', borderColor: '#e2e8f0' }}>
              <Statistic
                title={<span style={{ fontSize: 12, color: '#64748b' }}>Disbursed Budget</span>}
                value={millions(record.disbursed_etb)}
                suffix="M ETB"
                valueStyle={{ color: '#1a5f2c', fontWeight: 700, fontSize: 20 }}
                prefix={<DollarCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" style={{ borderRadius: 8, background: '#f8fafc', borderColor: '#e2e8f0' }}>
              <Statistic
                title={<span style={{ fontSize: 12, color: '#64748b' }}>Developed Land</span>}
                value={fmt(record.developed_land_ha)}
                suffix="Ha"
                valueStyle={{ color: '#1a5f2c', fontWeight: 700, fontSize: 20 }}
                prefix={<AreaChartOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" style={{ borderRadius: 8, background: '#f8fafc', borderColor: '#e2e8f0' }}>
              <Statistic
                title={<span style={{ fontSize: 12, color: '#64748b' }}>Beneficiaries</span>}
                value={fmt(record.beneficiaries_total)}
                valueStyle={{ color: '#1a5f2c', fontWeight: 700, fontSize: 20 }}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>
        </Row>

        <Card size="small" title="Construction Scheme Portfolio" style={{ marginBottom: 16, borderRadius: 8 }}>
          <Descriptions size="small" bordered column={{ xs: 1, sm: 2 }}>
            <Descriptions.Item label="Financing Channel / Program">{record.program}</Descriptions.Item>
            <Descriptions.Item label="Total Schemes Supported">
              <strong>{totalSchemes} Schemes</strong>
            </Descriptions.Item>
            <Descriptions.Item label="New Construction Schemes">
              <Tag color="default">{record.new_schemes_count ?? 0} New Schemes</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Existing Scheme Rehabilitation">
              <Tag color="gold">{record.existing_rehab_count ?? 0} Rehabilitation</Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card size="small" title="Physical Progress Benchmark & Milestones" style={{ marginBottom: 16, borderRadius: 8 }}>
          <Descriptions size="small" bordered column={{ xs: 1, sm: 2 }}>
            <Descriptions.Item label="New Scheme Progress (66% target)">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                <span style={{ fontWeight: 700, color: '#1a5f2c' }}>{record.avg_new_physical_pct ?? 0}%</span>
                <Progress
                  percent={Number(record.avg_new_physical_pct) || 0}
                  size="small"
                  strokeColor={PROGRESS_BAR_COLORS.green}
                  trailColor={PROGRESS_BAR_COLORS.trail}
                  style={{ flex: 1 }}
                />
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Rehabilitation Progress (30.3% benchmark)">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                <span style={{ fontWeight: 700, color: '#5b8a6b' }}>{record.avg_rehab_physical_pct ?? 0}%</span>
                <Progress
                  percent={Number(record.avg_rehab_physical_pct) || 0}
                  size="small"
                  strokeColor={PROGRESS_BAR_COLORS.blue}
                  trailColor={PROGRESS_BAR_COLORS.trail}
                  style={{ flex: 1 }}
                />
              </div>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card size="small" title="Financial Execution & Land Benefits" style={{ borderRadius: 8 }}>
          <Descriptions size="small" bordered column={{ xs: 1, sm: 2 }}>
            <Descriptions.Item label="Allocated Capital Budget">
              <span>{fmt(record.allocated_budget_etb)} ETB (<strong>{millions(record.allocated_budget_etb)}M ETB</strong>)</span>
            </Descriptions.Item>
            <Descriptions.Item label="Disbursed to Date">
              <strong style={{ color: '#1a5f2c' }}>{fmt(record.disbursed_etb)} ETB ({millions(record.disbursed_etb)}M ETB)</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Capital Burn Rate (%)">
              <Tag color={burnRate >= 70 ? 'success' : 'default'} style={{ fontWeight: 700 }}>{burnRate}%</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Developed Command Area">
              <strong style={{ color: '#1a5f2c' }}>{fmt(record.developed_land_ha)} Hectares</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Total Beneficiary Farmers" span={2}>
              <strong>{fmt(record.beneficiaries_total)} Farmers</strong>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
    </Modal>
  );
}
