import React from 'react';
import { 
  Modal, Tag, Descriptions, Divider, Tabs, Table, Empty, Space, Button,
  Typography, Card, Row, Col, Statistic
} from 'antd';
import { 
  ApartmentOutlined, GlobalOutlined, CheckCircleOutlined,
  CloseCircleOutlined, ClockCircleOutlined, UserOutlined, PhoneOutlined,
  CalendarOutlined, FundOutlined, LineChartOutlined,
  SafetyCertificateOutlined, DatabaseOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text } = Typography;
const { TabPane } = Tabs;

const SeedDetail = ({
  visible,
  onCancel,
  record,
  zonesMap = {},
  woredasMap = {},
  kebelesMap = {},
  onApprove,
  onEdit,
  onCertify,
}) => {
  if (!record) return null;

  const statusColors = {
    draft: 'default',
    submitted: 'processing',
    under_review: 'warning',
    approved: 'success',
    rejected: 'error',
    published: 'green',
    archived: 'default'
  };

  const certificationColors = {
    pending: 'warning',
    in_progress: 'processing',
    certified: 'success',
    rejected: 'error'
  };

  const distributionStatusColors = {
    planned: 'default',
    in_progress: 'processing',
    completed: 'success',
    verified: 'green',
    cancelled: 'error'
  };

  // Distribution columns
  const distributionColumns = [
    { title: 'Date', dataIndex: 'distribution_date', key: 'distribution_date', render: (val) => val ? dayjs(val).format('YYYY-MM-DD') : '-' },
    { title: 'Farmer', dataIndex: 'farmer_name', key: 'farmer_name', render: (val) => val || '-' },
    { title: 'Quantity (Tons)', dataIndex: 'quantity_tons', key: 'quantity_tons', render: (val) => <Tag color="blue">{val || 0} Tons</Tag> },
    { title: 'Type', dataIndex: 'distribution_type', key: 'distribution_type', render: (val) => val || '-' },
    { title: 'Status', dataIndex: 'distribution_status', key: 'distribution_status', render: (val) => <Tag color={distributionStatusColors[val]}>{val}</Tag> },
  ];

  const totalDistributed = record.distributions?.reduce((sum, d) => sum + Number(d.quantity_tons || 0), 0) || 0;

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <ApartmentOutlined style={{ color: '#1a5f2c', fontSize: 20 }} />
          <span style={{ fontSize: 18, fontWeight: 600 }}>Seed Registration Details</span>
          <Tag color={statusColors[record.registration_status] || 'default'}>
            {record.registration_status}
          </Tag>
          <Tag color={certificationColors[record.certification_status] || 'default'}>
            {record.certification_status}
          </Tag>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="close" onClick={onCancel}>Close</Button>,
        record.registration_status === 'submitted' && (
          <Button 
            key="approve" 
            type="primary" 
            onClick={() => onApprove?.(record.id)}
            style={{ backgroundColor: '#1b7837', borderColor: '#1b7837' }}
            icon={<CheckCircleOutlined />}
          >
            Approve
          </Button>
        ),
        record.certification_status === 'pending' && (
          <Button 
            key="certify" 
            type="primary" 
            onClick={() => onCertify?.(record.id)}
            style={{ backgroundColor: '#fa8c16', borderColor: '#fa8c16' }}
            icon={<SafetyCertificateOutlined />}
          >
            Certify
          </Button>
        ),
        (record.registration_status === 'draft' || record.registration_status === 'submitted') && (
          <Button 
            key="edit" 
            onClick={() => { onCancel(); onEdit?.(record); }}
          >
            Edit
          </Button>
        )
      ]}
      width={1000}
      destroyOnClose
    >
      <Tabs defaultActiveKey="details" size="large">
        <TabPane tab="Seed Details" key="details">
          <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
            <Col span={6}>
              <Card size="small">
                <Statistic 
                  title="Production Quantity" 
                  value={record.production_quantity_tons || 0} 
                  precision={2} 
                  suffix="Tons"
                  prefix={<FundOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <Statistic 
                  title="Area Planted" 
                  value={record.area_planted_hectares || 0} 
                  precision={2} 
                  suffix="Ha"
                  prefix={<LineChartOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <Statistic 
                  title="Stored Quantity" 
                  value={record.stored_quantity_tons || 0} 
                  precision={2} 
                  suffix="Tons"
                  prefix={<DatabaseOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <Statistic 
                  title="Distributed" 
                  value={totalDistributed} 
                  precision={2} 
                  suffix="Tons"
                  prefix={<CheckCircleOutlined />}
                />
              </Card>
            </Col>
          </Row>

          <Descriptions bordered column={2} size="middle">
            <Descriptions.Item label="Variety" span={2}>
              <Text strong>{record.variety?.name || '-'}</Text>
              <Tag color="blue" style={{ marginLeft: 8 }}>{record.variety?.crop_type || '-'}</Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Seed Class">
              {record.variety?.seed_class || '-'}
            </Descriptions.Item>

            <Descriptions.Item label="Certificate Number">
              {record.certificate_number || '-'}
            </Descriptions.Item>

            <Descriptions.Item label="Farmer">
              <Space>
                <UserOutlined />
                <Text>{record.farmer_name || '-'}</Text>
              </Space>
            </Descriptions.Item>

            <Descriptions.Item label="Phone">
              {record.farmer_phone ? (
                <Space>
                  <PhoneOutlined />
                  <Text>{record.farmer_phone}</Text>
                </Space>
              ) : '-'}
            </Descriptions.Item>

            <Descriptions.Item label="Region">
              <Tag color="geekblue">{record.region || '-'}</Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Zone">
              <Tag color="cyan">{zonesMap[record.zone] || record.zone || '-'}</Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Woreda">
              <Tag color="purple">{woredasMap[record.woreda] || record.woreda || '-'}</Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Kebele">
              <Tag color="orange">{kebelesMap[record.kebele] || record.kebele || '-'}</Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Planting Date">
              <CalendarOutlined /> {record.planting_date ? dayjs(record.planting_date).format('YYYY-MM-DD') : '-'}
            </Descriptions.Item>

            <Descriptions.Item label="Harvest Date">
              {record.harvest_date ? dayjs(record.harvest_date).format('YYYY-MM-DD') : '-'}
            </Descriptions.Item>

            <Descriptions.Item label="Expiry Date">
              {record.expiry_date ? dayjs(record.expiry_date).format('YYYY-MM-DD') : '-'}
            </Descriptions.Item>

            <Descriptions.Item label="GPS Coordinates">
              {record.gps_latitude && record.gps_longitude ? (
                <Tag color="magenta" icon={<GlobalOutlined />}>
                  {parseFloat(record.gps_latitude).toFixed(6)}, {parseFloat(record.gps_longitude).toFixed(6)}
                </Tag>
              ) : '-'}
            </Descriptions.Item>

            <Descriptions.Item label="Storage Location">
              {record.storage_location || '-'}
            </Descriptions.Item>

            <Descriptions.Item label="Storage Condition">
              {record.storage_condition || '-'}
            </Descriptions.Item>

            <Descriptions.Item label="Remarks" span={2}>
              {record.remarks || 'No remarks'}
            </Descriptions.Item>
          </Descriptions>

          <Divider orientation="left">Quality Metrics</Divider>

          <Row gutter={[16, 16]} style={{ marginTop: 8 }}>
            <Col span={6}>
              <Card size="small" style={{ background: '#f6ffed' }}>
                <Statistic title="Germination Rate" value={record.germination_rate || 0} suffix="%" />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small" style={{ background: '#e6f7ff' }}>
                <Statistic title="Purity" value={record.purity_percentage || 0} suffix="%" />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small" style={{ background: '#fff7e6' }}>
                <Statistic title="Moisture Content" value={record.moisture_content || 0} suffix="%" />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small" style={{ background: '#f9f0ff' }}>
                <Statistic title="Physical Purity" value={record.physical_purity || 0} suffix="%" />
              </Card>
            </Col>
          </Row>

          {record.health_status && (
            <>
              <Divider orientation="left">Health Status</Divider>
              <Text>{record.health_status}</Text>
            </>
          )}
        </TabPane>

        <TabPane 
          tab={`Distributions (${record.distributions?.length || 0})`} 
          key="distributions"
        >
          {record.distributions && record.distributions.length > 0 ? (
            <Table
              dataSource={record.distributions}
              rowKey="id"
              pagination={false}
              size="middle"
              columns={distributionColumns}
            />
          ) : (
            <Empty description="No distributions recorded" />
          )}
        </TabPane>
      </Tabs>
    </Modal>
  );
};

export default SeedDetail;