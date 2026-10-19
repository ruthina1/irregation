import React from 'react';
import { 
  Modal, Tag, Descriptions, Divider, Tabs, Table, Empty, Space, Button,
  Typography, Card, Row, Col, Statistic
} from 'antd';
import { 
  ApartmentOutlined, GlobalOutlined, CheckCircleOutlined,
  CloseCircleOutlined, ClockCircleOutlined, UserOutlined, PhoneOutlined,
  CalendarOutlined, FundOutlined, LineChartOutlined,
  EnvironmentOutlined, ToolOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text } = Typography;
const { TabPane } = Tabs;

const HorticultureDetail = ({
  visible,
  onCancel,
  record,
  zonesMap = {},
  woredasMap = {},
  kebelesMap = {},
  onApprove,
  onEdit,
  onVerify,
}) => {
  if (!record) return null;

  const statusColors = {
    active: 'green',
    inactive: 'default',
    under_development: 'warning',
    closed: 'red'
  };

  const registrationStatusColors = {
    draft: 'default',
    submitted: 'processing',
    under_review: 'warning',
    approved: 'success',
    rejected: 'error',
    published: 'green',
    archived: 'default'
  };

  const qualityColors = {
    excellent: 'success',
    good: 'processing',
    fair: 'warning',
    poor: 'error'
  };

  const qualityLabels = {
    excellent: '🌟 Excellent',
    good: '✅ Good',
    fair: '⚠️ Fair',
    poor: '❌ Poor'
  };

  // Production columns
  const productionColumns = [
    { title: 'Crop', dataIndex: 'crop_name', key: 'crop_name' },
    { title: 'Variety', dataIndex: 'variety', key: 'variety', render: (val) => val || '-' },
    { title: 'Category', dataIndex: 'crop_category', key: 'crop_category' },
    { title: 'Area (Ha)', dataIndex: 'area_planted_hectares', key: 'area_planted_hectares' },
    { title: 'Planting Date', dataIndex: 'planting_date', key: 'planting_date', render: (val) => val ? dayjs(val).format('YYYY-MM-DD') : '-' },
    { title: 'Status', dataIndex: 'production_status', key: 'production_status', render: (val) => <Tag>{val}</Tag> },
  ];

  // Harvest columns
  const harvestColumns = [
    { title: 'Date', dataIndex: 'harvest_date', key: 'harvest_date', render: (val) => val ? dayjs(val).format('YYYY-MM-DD') : '-' },
    { title: 'Quantity (Tons)', dataIndex: 'harvest_quantity_tons', key: 'harvest_quantity_tons' },
    { title: 'Yield (T/Ha)', dataIndex: 'actual_yield_tons_per_ha', key: 'actual_yield_tons_per_ha' },
    { title: 'Quality', dataIndex: 'quality_grade', key: 'quality_grade', render: (val) => <Tag color={qualityColors[val]}>{qualityLabels[val]}</Tag> },
    { title: 'Loss (Tons)', dataIndex: 'post_harvest_loss_tons', key: 'post_harvest_loss_tons', render: (val) => val || 0 },
    { title: 'Validation', dataIndex: 'validation_status', key: 'validation_status', render: (val) => <Tag>{val}</Tag> },
  ];

  const totalHarvested = record.productions?.reduce((sum, p) => {
    return sum + (p.harvests?.reduce((s, h) => s + Number(h.harvest_quantity_tons || 0), 0) || 0);
  }, 0) || 0;

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <ApartmentOutlined style={{ color: '#1a5f2c', fontSize: 20 }} />
          <span style={{ fontSize: 18, fontWeight: 600 }}>Horticulture Farm Details</span>
          <Tag color={statusColors[record.farm_status] || 'default'}>
            {record.farm_status}
          </Tag>
          <Tag color={registrationStatusColors[record.registration_status] || 'default'}>
            {record.registration_status}
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
        <TabPane tab="Farm Details" key="details">
          <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
            <Col span={6}>
              <Card size="small">
                <Statistic 
                  title="Total Area" 
                  value={record.total_area_hectares || 0} 
                  precision={2} 
                  suffix="Ha"
                  prefix={<EnvironmentOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <Statistic 
                  title="Cultivated Area" 
                  value={record.cultivated_area_hectares || 0} 
                  precision={2} 
                  suffix="Ha"
                  prefix={<LineChartOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <Statistic 
                  title="Total Harvested" 
                  value={totalHarvested} 
                  precision={2} 
                  suffix="Tons"
                  prefix={<FundOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <Statistic 
                  title="Workers" 
                  value={record.number_of_workers || 0} 
                  prefix={<UserOutlined />}
                />
              </Card>
            </Col>
          </Row>

          <Descriptions bordered column={2} size="middle">
            <Descriptions.Item label="Farm Name" span={2}>
              <Text strong>{record.farm_name}</Text>
            </Descriptions.Item>

            <Descriptions.Item label="Farm Type">
              <Tag>{record.farm_type}</Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Production System">
              <Tag>{record.production_system?.replace('_', ' ')}</Tag>
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

            <Descriptions.Item label="GPS Coordinates" span={2}>
              {record.gps_latitude && record.gps_longitude ? (
                <Tag color="magenta" icon={<GlobalOutlined />}>
                  {parseFloat(record.gps_latitude).toFixed(6)}, {parseFloat(record.gps_longitude).toFixed(6)}
                </Tag>
              ) : '-'}
            </Descriptions.Item>

            <Descriptions.Item label="Main Crops">
              {record.main_crops || '-'}
            </Descriptions.Item>

            <Descriptions.Item label="Irrigation Source">
              {record.irrigation_source || '-'}
            </Descriptions.Item>

            <Descriptions.Item label="Soil Type">
              {record.soil_type || '-'}
            </Descriptions.Item>

            <Descriptions.Item label="Remarks" span={2}>
              {record.remarks || 'No remarks'}
            </Descriptions.Item>
          </Descriptions>
        </TabPane>

        <TabPane tab={`Productions (${record.productions?.length || 0})`} key="productions">
          {record.productions && record.productions.length > 0 ? (
            <Table
              dataSource={record.productions}
              rowKey="id"
              pagination={false}
              size="middle"
              columns={productionColumns}
            />
          ) : (
            <Empty description="No production records for this farm" />
          )}
        </TabPane>

        <TabPane tab={`Harvests (${record.productions?.reduce((sum, p) => sum + (p.harvests?.length || 0), 0) || 0})`} key="harvests">
          {record.productions?.some(p => p.harvests?.length > 0) ? (
            <Table
              dataSource={record.productions.flatMap(p => p.harvests || [])}
              rowKey="id"
              pagination={false}
              size="middle"
              columns={harvestColumns}
            />
          ) : (
            <Empty description="No harvest records for this farm" />
          )}
        </TabPane>
      </Tabs>
    </Modal>
  );
};

export default HorticultureDetail;