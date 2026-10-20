import React from 'react';
import { Button, Card, Col, Descriptions, Modal, Row, Statistic, Tag } from 'antd';
import {
  CheckCircleOutlined,
  ExperimentOutlined,
  FieldTimeOutlined,
  RiseOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { fmt } from '../shared/reportUtils';

export default function CropProductionReportsDetail({ record, onClose }) {
  if (!record) return null;

  const totalYield = Number(record.total_yield_qt) || 0;
  const wheatYield = Number(record.wheat_yield_qt) || 0;
  const wheatShare = totalYield > 0 ? Math.round((wheatYield / totalYield) * 100) : 0;
  const totalFarmers = (Number(record.farmers_male) || 0) + (Number(record.farmers_female) || 0);

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
              <RiseOutlined style={{ color: '#1a5f2c', fontSize: 20 }} />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>
                {record.zone || 'Administrative Zone'}
              </div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>
                Crop Production & Input Utilization Dossier • የሰብል ምርትና ግብዓት ዝርዝር መረጃ
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
                title={<span style={{ fontSize: 12, color: '#64748b' }}>Total Harvest</span>}
                value={fmt(totalYield)}
                suffix="Qt"
                valueStyle={{ color: '#a16207', fontWeight: 700, fontSize: 20 }}
                prefix={<RiseOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" style={{ borderRadius: 8, background: '#f8fafc', borderColor: '#e2e8f0' }}>
              <Statistic
                title={<span style={{ fontSize: 12, color: '#64748b' }}>Wheat Flagship</span>}
                value={fmt(wheatYield)}
                suffix="Qt"
                valueStyle={{ color: '#1a5f2c', fontWeight: 700, fontSize: 20 }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" style={{ borderRadius: 8, background: '#f8fafc', borderColor: '#e2e8f0' }}>
              <Statistic
                title={<span style={{ fontSize: 12, color: '#64748b' }}>Cultivated Area</span>}
                value={fmt(record.cultivated_ha)}
                suffix="Ha"
                valueStyle={{ color: '#5b8a6b', fontWeight: 700, fontSize: 20 }}
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

        <Card size="small" title="Cultivated Command & Production Output" style={{ marginBottom: 16, borderRadius: 8 }}>
          <Descriptions size="small" bordered column={{ xs: 1, sm: 2 }}>
            <Descriptions.Item label="Administrative Zone">{record.zone}</Descriptions.Item>
            <Descriptions.Item label="Cultivated Land Area">
              <strong>{fmt(record.cultivated_ha)} Hectares</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Total Crop Harvest">
              <strong style={{ color: '#a16207', fontSize: 14 }}>{fmt(totalYield)} Quintals</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Highland Wheat Production">
              <span style={{ color: '#1a5f2c', fontWeight: 600 }}>{fmt(wheatYield)} Quintals ({wheatShare}% share)</span>
            </Descriptions.Item>
            <Descriptions.Item label="Highland Wheat Clustered Land" span={2}>
              <strong>{fmt(record.wheat_ha)} Hectares Clustered</strong>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card size="small" title="Agricultural Inputs & Smallholder Beneficiaries" style={{ borderRadius: 8 }}>
          <Descriptions size="small" bordered column={{ xs: 1, sm: 2 }}>
            <Descriptions.Item label="Chemical Fertilizer Distributed">
              <Tag color="green">{fmt(record.fertilizer_qt)} Quintals</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Improved Certified Seed Distributed">
              <Tag color="blue">{fmt(record.seed_qt)} Quintals</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Direct Beneficiary Farmers" span={2}>
              <strong>{fmt(totalFarmers)} Farmers</strong> (Male: {fmt(record.farmers_male)} / Female: {fmt(record.farmers_female)})
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
    </Modal>
  );
}
