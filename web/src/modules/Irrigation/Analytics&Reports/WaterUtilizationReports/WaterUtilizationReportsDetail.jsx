import React from 'react';
import { Button, Card, Col, Descriptions, Modal, Progress, Row, Statistic, Tag } from 'antd';
import {
  AreaChartOutlined,
  DashboardOutlined,
  ExperimentOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { NOT_TRACKED, fmt, PROGRESS_BAR_COLORS } from '../shared/reportUtils';

export default function WaterUtilizationReportsDetail({ record, onClose }) {
  if (!record) return null;

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
              <AreaChartOutlined style={{ color: '#1a5f2c', fontSize: 20 }} />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>
                {record.zone || 'Administrative Zone'}
              </div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>
                Water Utilization & Micro-Irrigation Dossier • የውሃ አጠቃቀም ዝርዝር መረጃ
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
                title={<span style={{ fontSize: 12, color: '#64748b' }}>Effective Command</span>}
                value={fmt(record.total_effective_ha)}
                suffix="Ha"
                valueStyle={{ color: '#1a5f2c', fontWeight: 700, fontSize: 20 }}
                prefix={<AreaChartOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" style={{ borderRadius: 8, background: '#f8fafc', borderColor: '#e2e8f0' }}>
              <Statistic
                title={<span style={{ fontSize: 12, color: '#64748b' }}>Round 1 Bega</span>}
                value={fmt(record.round_1_ha)}
                suffix="Ha"
                valueStyle={{ color: '#1a5f2c', fontWeight: 700, fontSize: 20 }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" style={{ borderRadius: 8, background: '#f8fafc', borderColor: '#e2e8f0' }}>
              <Statistic
                title={<span style={{ fontSize: 12, color: '#64748b' }}>Solar & Wells</span>}
                value={(Number(record.solar_pump_sites) || 0) + (Number(record.deep_well_sites) || 0)}
                suffix="Sites"
                valueStyle={{ color: '#0284c7', fontWeight: 700, fontSize: 20 }}
                prefix={<ThunderboltOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" style={{ borderRadius: 8, background: '#f8fafc', borderColor: '#e2e8f0' }}>
              <Statistic
                title={<span style={{ fontSize: 12, color: '#64748b' }}>Field Efficiency</span>}
                value={record.avg_application_efficiency_pct ? `${record.avg_application_efficiency_pct}%` : NOT_TRACKED}
                valueStyle={{ color: '#5b8a6b', fontWeight: 700, fontSize: 20 }}
                prefix={<DashboardOutlined />}
              />
            </Card>
          </Col>
        </Row>

        <Card size="small" title="Seasonal Command Area Utilization" style={{ marginBottom: 16, borderRadius: 8 }}>
          <Descriptions size="small" bordered column={{ xs: 1, sm: 2 }}>
            <Descriptions.Item label="Administrative Zone">{record.zone}</Descriptions.Item>
            <Descriptions.Item label="Total Effective Command Area">
              <strong style={{ color: '#1a5f2c' }}>{fmt(record.total_effective_ha)} Hectares</strong>
            </Descriptions.Item>
            <Descriptions.Item label="1st Round (Bega / በጋ የመስኖ ወቅት)">
              <span>{fmt(record.round_1_ha)} Ha</span>
            </Descriptions.Item>
            <Descriptions.Item label="2nd Round (Belg / በልግ የመስኖ ወቅት)">
              <span>{fmt(record.round_2_ha)} Ha</span>
            </Descriptions.Item>
            <Descriptions.Item label="3rd Round (Kiremt Supplementary / ክረምት)" span={2}>
              <span>{fmt(record.round_3_ha)} Ha</span>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card size="small" title="Water Abstraction Technology & Micro-Irrigation" style={{ borderRadius: 8 }}>
          <Descriptions size="small" bordered column={{ xs: 1, sm: 2 }}>
            <Descriptions.Item label="Solar Hybrid Lift Pump Sites">
              <Tag color="green">{record.solar_pump_sites ?? 0} Solar Sites</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Deep Groundwater Wells">
              <Tag color="blue">{record.deep_well_sites ?? 0} Deep Wells</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Pressurized Drip & Sprinkler Area">
              {record.drip_sprinkler_ha === null || record.drip_sprinkler_ha === undefined
                ? <Tag color="default">{NOT_TRACKED}</Tag>
                : <strong>{fmt(record.drip_sprinkler_ha)} Ha</strong>}
            </Descriptions.Item>
            <Descriptions.Item label="Average Field Application Efficiency">
              {record.avg_application_efficiency_pct === null || record.avg_application_efficiency_pct === undefined
                ? <Tag color="default">{NOT_TRACKED}</Tag>
                : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <strong>{record.avg_application_efficiency_pct}%</strong>
                    <Progress
                      percent={Number(record.avg_application_efficiency_pct) || 0}
                      size="small"
                      strokeColor={PROGRESS_BAR_COLORS.green}
                      trailColor={PROGRESS_BAR_COLORS.trail}
                      style={{ width: 100 }}
                    />
                  </div>
                )}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
    </Modal>
  );
}
