import React from 'react';
import { Button, Card, Col, Descriptions, Modal, Row, Statistic, Tag } from 'antd';
import {
  AreaChartOutlined,
  BuildOutlined,
  CheckCircleOutlined,
  FileDoneOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { fmt } from '../shared/reportUtils';

export default function StudyDesignReportsDetail({ record, onClose }) {
  if (!record) return null;

  const totalStudies = Number(record.total_pipeline) || 0;
  const consultantStudies = Number(record.consultant_studies) || 0;
  const inhouseStudies = Number(record.inhouse_studies) || 0;

  const totalFarmers = (Number(record.beneficiaries_male) || 0) + (Number(record.beneficiaries_female) || 0);
  const totalTrained = (Number(record.experts_trained_male) || 0) + (Number(record.experts_trained_female) || 0);

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
              <FileDoneOutlined style={{ color: '#1a5f2c', fontSize: 20 }} />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>
                {record.zone || 'Administrative Zone'}
              </div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>
                Study & Design Engineering Pipeline Dossier • የጥናትና ዲዛይን ዝርዝር መረጃ
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
                title={<span style={{ fontSize: 12, color: '#64748b' }}>Active Studies</span>}
                value={totalStudies}
                valueStyle={{ color: '#1a5f2c', fontWeight: 700, fontSize: 20 }}
                prefix={<FileDoneOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" style={{ borderRadius: 8, background: '#f8fafc', borderColor: '#e2e8f0' }}>
              <Statistic
                title={<span style={{ fontSize: 12, color: '#64748b' }}>Ready Shelf</span>}
                value={record.construction_ready_count ?? 0}
                valueStyle={{ color: '#1a5f2c', fontWeight: 700, fontSize: 20 }}
                prefix={<BuildOutlined />}
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
                prefix={<AreaChartOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" style={{ borderRadius: 8, background: '#f8fafc', borderColor: '#e2e8f0' }}>
              <Statistic
                title={<span style={{ fontSize: 12, color: '#64748b' }}>Target Farmers</span>}
                value={fmt(totalFarmers)}
                valueStyle={{ color: '#1a5f2c', fontWeight: 700, fontSize: 20 }}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>
        </Row>

        <Card size="small" title="Engineering Study Modality" style={{ marginBottom: 16, borderRadius: 8 }}>
          <Descriptions size="small" bordered column={{ xs: 1, sm: 2 }}>
            <Descriptions.Item label="Administrative Zone">{record.zone}</Descriptions.Item>
            <Descriptions.Item label="Total Pipeline Studies">
              <strong>{totalStudies} Schemes</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Consultant Led Studies">
              <Tag color="blue">{consultantStudies} Consultant</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="In-House Technical Studies">
              <Tag color="cyan">{inhouseStudies} In-House (ክልል/ዞን/ወረዳ)</Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card size="small" title="Quality Assurance & Construction Readiness" style={{ marginBottom: 16, borderRadius: 8 }}>
          <Descriptions size="small" bordered column={{ xs: 1, sm: 2 }}>
            <Descriptions.Item label="Design QA Passed">
              <Tag color="green" icon={<CheckCircleOutlined />}>
                {record.qa_passed_count ?? 0} Schemes Certified
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Construction-Ready Shelf Inventory">
              <Tag color="success" icon={<BuildOutlined />} style={{ fontWeight: 600 }}>
                {record.construction_ready_count ?? 0} Ready for Tender / Civil Works
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Projected Command Area" span={2}>
              <strong style={{ color: '#1a5f2c' }}>{fmt(record.command_area_ha)} Hectares</strong>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card size="small" title="Target Beneficiaries & Staff Training" style={{ borderRadius: 8 }}>
          <Descriptions size="small" bordered column={{ xs: 1, sm: 2 }}>
            <Descriptions.Item label="Direct Beneficiary Households">
              <strong>{fmt(totalFarmers)} Farmers</strong> (M: {record.beneficiaries_male} / F: {record.beneficiaries_female})
            </Descriptions.Item>
            <Descriptions.Item label="Institutional Trained Technical Staff">
              <strong>{totalTrained} Staff</strong> (Male: {record.experts_trained_male} / Female: {record.experts_trained_female})
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
    </Modal>
  );
}
