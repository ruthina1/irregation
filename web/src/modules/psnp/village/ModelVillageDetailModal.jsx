import React from 'react';
import { Modal, Descriptions, Tag, Row, Col, Progress, Card, Statistic, Divider } from 'antd';
import { 
  EnvironmentOutlined, TrophyOutlined, TeamOutlined, 
  HeartOutlined, MedicineBoxOutlined, BookOutlined, 
} from '@ant-design/icons';

export default function ModelVillageDetailModal({ open, onCancel, data }) {
  if (!data) return null;

  // Smart calculations for UI presentation
  const waterAccessPercent = data.total_households > 0 
    ? Math.round((data.households_with_water_access / data.total_households) * 100) 
    : 0;
    
  const modelFarmersPercent = data.total_households > 0 
    ? Math.round((data.model_farmers_count / data.total_households) * 100) 
    : 0;

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontFamily: "'Times New Roman', Times, serif" }}>
          <TrophyOutlined style={{ color: '#faad14', fontSize: '24px' }} />
          <span style={{ fontSize: '20px', color: '#1a5f2c' }}>Kebele Village Profile</span>
        </div>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={900}
      destroyOnClose
    >
      <div style={{ padding: '10px 0' }}>
        {/* Header Section: Location & Status */}
        <Row gutter={[16, 16]} align="middle" style={{ marginBottom: 24 }}>
          <Col span={16}>
            <h2 style={{ margin: 0, color: '#333' }}>
              <EnvironmentOutlined style={{ color: '#1890ff', marginRight: 8 }} />
              {data.kebele?.name}
            </h2>
            <p style={{ margin: '4px 0 0 32px', color: '#666' }}>
              {data.kebele?.woreda?.zone?.name} Zone ➔ {data.kebele?.woreda?.name} Woreda
            </p>
          </Col>
          <Col span={8} style={{ textAlign: 'right' }}>
            <div style={{ marginBottom: '8px' }}>
              <strong>Year (EC):</strong> <Tag color="blue" style={{ fontSize: '14px', padding: '2px 10px' }}>{data.certification_year_ec}</Tag>
            </div>
            <div>
              <strong>Regional Cert:</strong> {data.is_certified_model_village 
                ? <Tag color="success" style={{ fontSize: '14px' }}>Certified</Tag> 
                : <Tag color="default" style={{ fontSize: '14px' }}>Pending</Tag>}
            </div>
          </Col>
        </Row>

        {/* Highlight Stats Row */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={8}>
            <Card bordered={false} style={{ background: '#f6ffed' }}>
              <Statistic title="Total Households" value={data.total_households} prefix={<TeamOutlined />} valueStyle={{ color: '#389e0d' }} />
            </Card>
          </Col>
          <Col span={8}>
            <Card bordered={false} style={{ background: '#e6f7ff' }}>
              <Statistic title="Water Access HHs" value={data.households_with_water_access} prefix={<BookOutlined />} valueStyle={{ color: '#096dd9' }} />
            </Card>
          </Col>
          <Col span={8}>
            <Card bordered={false} style={{ background: '#fffbe6' }}>
              <Statistic title="Model Farmers" value={data.model_farmers_count} prefix={<TrophyOutlined />} valueStyle={{ color: '#d48806' }} />
            </Card>
          </Col>
        </Row>

        <Divider orientation="left" style={{ color: '#1a5f2c' }}>Performance Metrics</Divider>

        {/* Visual Progress Rings Row */}
        <Row gutter={[16, 16]} justify="space-around" style={{ textAlign: 'center', marginBottom: 24 }}>
          <Col span={6}>
            <Progress type="dashboard" percent={waterAccessPercent} strokeColor="#1890ff" />
            <div style={{ marginTop: 8, fontWeight: 'bold' }}>Water Coverage</div>
          </Col>
          <Col span={6}>
            <Progress type="dashboard" percent={modelFarmersPercent} strokeColor="#faad14" />
            <div style={{ marginTop: 8, fontWeight: 'bold' }}>Model Farmers Share</div>
          </Col>
          <Col span={6}>
            <Progress type="dashboard" percent={data.cbhi_coverage_percentage} strokeColor="#52c41a" />
            <div style={{ marginTop: 8, fontWeight: 'bold' }}>CBHI Coverage</div>
          </Col>
          <Col span={6}>
            <Progress type="dashboard" percent={data.literacy_rate_percentage} strokeColor="#722ed1" />
            <div style={{ marginTop: 8, fontWeight: 'bold' }}>Adult Literacy</div>
          </Col>
        </Row>

        <Divider orientation="left" style={{ color: '#1a5f2c' }}>Social & Environmental Checks</Divider>

        {/* Tags / Boolean Checks */}
        <Descriptions bordered column={2} size="small">
          <Descriptions.Item label={<><MedicineBoxOutlined style={{color:'green'}}/> ODF Certified (Health)</>}>
            {data.is_odf_certified ? <Tag color="green">Yes - Open Defecation Free</Tag> : <Tag color="red">No</Tag>}
          </Descriptions.Item>
          <Descriptions.Item label={<><HeartOutlined style={{color:'cyan'}}/> Free from HTP (Social)</>}>
            {data.free_from_htp ? <Tag color="cyan">Yes - Zero HTP</Tag> : <Tag color="orange">No</Tag>}
          </Descriptions.Item>
          <Descriptions.Item label={<><EnvironmentOutlined style={{color:'blue'}}/> Active Watershed Mgmt</>}>
            {data.has_active_watershed_management ? <Tag color="blue">Yes - Active</Tag> : <Tag color="default">No</Tag>}
          </Descriptions.Item>
          <Descriptions.Item label={<><BookOutlined style={{color:'purple'}}/> Verification Status</>}>
            <Tag color={data.status === 'Approved' ? 'green' : (data.status === 'Rejected' ? 'red' : 'orange')}>
              {data.status}
            </Tag>
          </Descriptions.Item>
        </Descriptions>
      </div>
    </Modal>
  );
}