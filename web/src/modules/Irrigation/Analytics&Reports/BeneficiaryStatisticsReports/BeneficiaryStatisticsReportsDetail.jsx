import React from 'react';
import { Button, Card, Col, Descriptions, Modal, Progress, Row, Statistic, Tag } from 'antd';
import {
  CheckCircleOutlined,
  EnvironmentOutlined,
  IdcardOutlined,
  PieChartOutlined,
  RiseOutlined,
  TeamOutlined,
  UserOutlined,
  WomanOutlined,
} from '@ant-design/icons';
import { NOT_TRACKED, fmt, PROGRESS_BAR_COLORS } from '../shared/reportUtils';

export default function BeneficiaryStatisticsReportsDetail({ record, onClose }) {
  if (!record) return null;

  const total = Number(record.total_farmers) || ((Number(record.farmers_male) || 0) + (Number(record.farmers_female) || 0));
  const male = Number(record.farmers_male) || 0;
  const female = Number(record.farmers_female) || 0;
  const femaleShare = Number(record.female_share_pct) || (total > 0 ? ((female / total) * 100).toFixed(1) : 0);
  const youth = Number(record.youth_farmers) || 0;

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
              <TeamOutlined style={{ color: '#1a5f2c', fontSize: 20 }} />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>
                {record.zone || 'Administrative Zone'}
              </div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>
                Beneficiary Farmers & Inclusivity Dossier • የተጠቃሚ አርሶአደሮች ዝርዝር
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
                title={<span style={{ fontSize: 12, color: '#64748b' }}>Total Farmers</span>}
                value={fmt(total)}
                valueStyle={{ color: '#1a5f2c', fontWeight: 700, fontSize: 20 }}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" style={{ borderRadius: 8, background: '#f8fafc', borderColor: '#e2e8f0' }}>
              <Statistic
                title={<span style={{ fontSize: 12, color: '#64748b' }}>Female Farmers</span>}
                value={fmt(female)}
                suffix={`(${femaleShare}%)`}
                valueStyle={{ color: '#64748b', fontWeight: 700, fontSize: 20 }}
                prefix={<WomanOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" style={{ borderRadius: 8, background: '#f8fafc', borderColor: '#e2e8f0' }}>
              <Statistic
                title={<span style={{ fontSize: 12, color: '#64748b' }}>Youth Farmers</span>}
                value={fmt(youth)}
                valueStyle={{ color: '#d97706', fontWeight: 700, fontSize: 20 }}
                prefix={<IdcardOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" style={{ borderRadius: 8, background: '#f8fafc', borderColor: '#e2e8f0' }}>
              <Statistic
                title={<span style={{ fontSize: 12, color: '#64748b' }}>Command Area</span>}
                value={fmt(record.command_area_ha)}
                suffix="Ha"
                valueStyle={{ color: '#1a5f2c', fontWeight: 700, fontSize: 20 }}
                prefix={<RiseOutlined />}
              />
            </Card>
          </Col>
        </Row>

        <Card size="small" title="Irrigation Scheme Coverage" style={{ marginBottom: 16, borderRadius: 8 }}>
          <Descriptions size="small" bordered column={{ xs: 1, sm: 2 }}>
            <Descriptions.Item label="Administrative Zone">{record.zone}</Descriptions.Item>
            <Descriptions.Item label="Active Schemes Count">
              <strong>{record.schemes_count ?? 0} Schemes</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Covered Woredas">{record.woreda_count ?? 0} Woredas</Descriptions.Item>
            <Descriptions.Item label="Developed Command Area">
              <strong style={{ color: '#1a5f2c' }}>{fmt(record.command_area_ha)} Hectares</strong>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card size="small" title="Gender & Social Inclusivity Breakdown" style={{ marginBottom: 16, borderRadius: 8 }}>
          <Descriptions size="small" bordered column={{ xs: 1, sm: 2 }}>
            <Descriptions.Item label="Male Beneficiary Farmers">
              <span>{fmt(male)} Farmers (Head of Family)</span>
            </Descriptions.Item>
            <Descriptions.Item label="Female Beneficiary Farmers">
              <span style={{ color: '#64748b', fontWeight: 600 }}>{fmt(female)} Female Farmers</span>
            </Descriptions.Item>
            <Descriptions.Item label="Female Participation Share (%)">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 700 }}>{femaleShare}%</span>
                <Progress
                  percent={Number(femaleShare) || 0}
                  size="small"
                  strokeColor={PROGRESS_BAR_COLORS.blue}
                  trailColor={PROGRESS_BAR_COLORS.trail}
                  style={{ width: 120 }}
                />
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Female-Headed Households (FHH)">
              {record.female_headed_households === null || record.female_headed_households === undefined
                ? <Tag color="default">{NOT_TRACKED}</Tag>
                : <strong>{fmt(record.female_headed_households)} Households</strong>}
            </Descriptions.Item>
            <Descriptions.Item label="Youth Beneficiaries (ወጣቶች)" span={2}>
              <Tag color="orange" style={{ fontWeight: 600 }}>{fmt(youth)} Smallholder Youth Farmers</Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card size="small" title="Cross-Program Engagement" style={{ borderRadius: 8 }}>
          <Descriptions size="small" bordered column={{ xs: 1, sm: 2 }}>
            <Descriptions.Item label="WUA Institutional Registry">
              <strong>{fmt(record.wua_members_total)} Members</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Highland Wheat Initiative">
              <strong style={{ color: '#1a5f2c' }}>{fmt(record.wheat_initiative_farmers)} Farmers</strong>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
    </Modal>
  );
}
