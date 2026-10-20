import React from 'react';
import { Button, Card, Col, Descriptions, Modal, Row, Statistic, Tag } from 'antd';
import {
  AuditOutlined,
  BankOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import { fmt } from '../shared/reportUtils';

export default function InstitutionsReportsDetail({ record, onClose }) {
  if (!record) return null;

  const totalWuas = Number(record.total_wuas) || 0;
  const auditedWuas = Number(record.audited_wuas) || 0;
  const auditPct = totalWuas > 0 ? Math.round((auditedWuas / totalWuas) * 100) : 0;

  const modernKm = Number(record.modern_canal_maintained_km) || 0;
  const tradKm = Number(record.traditional_canal_maintained_km) || 0;
  const totalKm = (modernKm + tradKm).toFixed(1);

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
              <BankOutlined style={{ color: '#1a5f2c', fontSize: 20 }} />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>
                {record.zone || 'Administrative Zone'}
              </div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>
                WUA Institutions & Canal Maintenance Dossier • የማህበራትና ቦዮች ዝርዝር መረጃ
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
                title={<span style={{ fontSize: 12, color: '#64748b' }}>Total WUAs</span>}
                value={totalWuas}
                valueStyle={{ color: '#1a5f2c', fontWeight: 700, fontSize: 20 }}
                prefix={<BankOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" style={{ borderRadius: 8, background: '#f8fafc', borderColor: '#e2e8f0' }}>
              <Statistic
                title={<span style={{ fontSize: 12, color: '#64748b' }}>Audited WUAs</span>}
                value={auditedWuas}
                suffix={`(${auditPct}%)`}
                valueStyle={{ color: '#1a5f2c', fontWeight: 700, fontSize: 20 }}
                prefix={<AuditOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" style={{ borderRadius: 8, background: '#f8fafc', borderColor: '#e2e8f0' }}>
              <Statistic
                title={<span style={{ fontSize: 12, color: '#64748b' }}>Maintained Canals</span>}
                value={totalKm}
                suffix="km"
                valueStyle={{ color: '#1a5f2c', fontWeight: 700, fontSize: 20 }}
                prefix={<ToolOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" style={{ borderRadius: 8, background: '#f8fafc', borderColor: '#e2e8f0' }}>
              <Statistic
                title={<span style={{ fontSize: 12, color: '#64748b' }}>Total Members</span>}
                value={fmt(record.wua_members_total)}
                valueStyle={{ color: '#1a5f2c', fontWeight: 700, fontSize: 20 }}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>
        </Row>

        <Card size="small" title="WUA Institutional Governance" style={{ marginBottom: 16, borderRadius: 8 }}>
          <Descriptions size="small" bordered column={{ xs: 1, sm: 2 }}>
            <Descriptions.Item label="Administrative Zone">{record.zone}</Descriptions.Item>
            <Descriptions.Item label="Total Registered WUAs">
              <strong>{totalWuas} Associations</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Newly Established WUAs">
              <Tag color="green">{record.new_wuas ?? 0} New</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Strengthened Existing WUAs">
              <Tag color="blue">{record.strengthened_wuas ?? 0} Strengthened</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Statutory Audited WUAs">
              <span>{auditedWuas} Audited ({auditPct}% Coverage)</span>
            </Descriptions.Item>
            <Descriptions.Item label="Unqualified Audit Opinions">
              <Tag color="success" icon={<CheckCircleOutlined />}>
                {record.unqualified_audits ?? 0} Clean Opinions
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card size="small" title="Canal Desilting & Community Mobilization" style={{ borderRadius: 8 }}>
          <Descriptions size="small" bordered column={{ xs: 1, sm: 2 }}>
            <Descriptions.Item label="Modern Concrete Canals Maintained">
              <strong>{record.modern_canal_maintained_km ?? 0} km</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Traditional Earth Canals Maintained">
              <strong>{record.traditional_canal_maintained_km ?? 0} km</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Total Maintained Canal Length" span={2}>
              <strong style={{ color: '#1a5f2c' }}>{totalKm} km Maintained</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Mobilized Community Labor">
              <Tag color="orange">{fmt(record.community_labor_count)} Farmers Mobilized</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Total WUA Farmer Members">
              <strong style={{ color: '#1a5f2c' }}>{fmt(record.wua_members_total)} Registered Members</strong>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
    </Modal>
  );
}
