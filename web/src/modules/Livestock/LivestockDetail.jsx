import React from 'react';
import { 
  Modal, Tag, Descriptions, Divider, Tabs, Table, Empty, Space, Button,
  Typography, Card, Row, Col, Statistic
} from 'antd';
import { 
  ApartmentOutlined, GlobalOutlined, CheckCircleOutlined,
  CloseCircleOutlined, ClockCircleOutlined, UserOutlined, PhoneOutlined,
  CalendarOutlined, FundOutlined, LineChartOutlined,
  EnvironmentOutlined, ToolOutlined, TeamOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text } = Typography;
const { TabPane } = Tabs;

const LivestockDetail = ({
  visible,
  onCancel,
  record,
  zonesMap = {},
  woredasMap = {},
  kebelesMap = {},
  onApprove,
  onEdit,
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

  const healthStatusColors = {
    healthy: 'green',
    sick: 'red',
    under_treatment: 'warning',
    quarantined: 'orange'
  };

  const genderColors = {
    male: 'blue',
    female: 'pink'
  };

  // Animal columns
  const animalColumns = [
    { title: 'Type', dataIndex: 'animal_type', key: 'animal_type' },
    { title: 'Breed', dataIndex: 'breed', key: 'breed', render: (val) => val || '-' },
    { title: 'Tag No.', dataIndex: 'tag_number', key: 'tag_number', render: (val) => val || '-' },
    { title: 'Gender', dataIndex: 'gender', key: 'gender', render: (val) => <Tag color={genderColors[val]}>{val}</Tag> },
    { title: 'Age (Months)', dataIndex: 'age_months', key: 'age_months', render: (val) => val || '-' },
    { title: 'Weight (kg)', dataIndex: 'weight_kg', key: 'weight_kg', render: (val) => val || '-' },
    { title: 'Health', dataIndex: 'health_status', key: 'health_status', render: (val) => <Tag color={healthStatusColors[val]}>{val}</Tag> },
    { title: 'Status', dataIndex: 'animal_status', key: 'animal_status', render: (val) => <Tag>{val}</Tag> },
  ];

  // Production columns
  const productionColumns = [
    { title: 'Type', dataIndex: 'production_type', key: 'production_type' },
    { title: 'Date', dataIndex: 'production_date', key: 'production_date', render: (val) => val ? dayjs(val).format('YYYY-MM-DD') : '-' },
    { title: 'Quantity', dataIndex: 'quantity', key: 'quantity', render: (val) => `${val} ${record.unit || 'units'}` },
    { title: 'Quality', dataIndex: 'quality_grade', key: 'quality_grade', render: (val) => <Tag>{val}</Tag> },
    { title: 'Price/Unit', dataIndex: 'price_per_unit', key: 'price_per_unit', render: (val) => val ? `${val} ETB` : '-' },
    { title: 'Total Value', dataIndex: 'total_value', key: 'total_value', render: (val) => val ? `${val} ETB` : '-' },
    { title: 'Validation', dataIndex: 'validation_status', key: 'validation_status', render: (val) => <Tag>{val}</Tag> },
  ];

  const totalAnimals = record.animals?.length || 0;
  const totalProductions = record.productions?.length || 0;
  const totalProductionQuantity = record.productions?.reduce((sum, p) => sum + Number(p.quantity || 0), 0) || 0;

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <ApartmentOutlined style={{ color: '#1a5f2c', fontSize: 20 }} />
          <span style={{ fontSize: 18, fontWeight: 600 }}>Livestock Farm Details</span>
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
                  title="Pasture Area" 
                  value={record.pasture_area_hectares || 0} 
                  precision={2} 
                  suffix="Ha"
                  prefix={<LineChartOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <Statistic 
                  title="Total Animals" 
                  value={totalAnimals} 
                  prefix={<TeamOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <Statistic 
                  title="Total Productions" 
                  value={totalProductions} 
                  prefix={<FundOutlined />}
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

            <Descriptions.Item label="Main Breeds">
              {record.main_breeds || '-'}
            </Descriptions.Item>

            <Descriptions.Item label="Water Source">
              {record.water_source || '-'}
            </Descriptions.Item>

            <Descriptions.Item label="Feed Source">
              {record.feed_source || '-'}
            </Descriptions.Item>

            <Descriptions.Item label="Workers">
              {record.number_of_workers || 0}
            </Descriptions.Item>

            <Descriptions.Item label="Remarks" span={2}>
              {record.remarks || 'No remarks'}
            </Descriptions.Item>
          </Descriptions>
        </TabPane>

        <TabPane tab={`Animals (${totalAnimals})`} key="animals">
          {record.animals && record.animals.length > 0 ? (
            <Table
              dataSource={record.animals}
              rowKey="id"
              pagination={false}
              size="middle"
              columns={animalColumns}
            />
          ) : (
            <Empty description="No animals registered for this farm" />
          )}
        </TabPane>

        <TabPane tab={`Productions (${totalProductions})`} key="productions">
          {record.productions && record.productions.length > 0 ? (
            <>
              <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col span={8}>
                  <Card size="small" style={{ background: '#f6ffed' }}>
                    <Statistic 
                      title="Total Production" 
                      value={totalProductionQuantity} 
                      precision={2} 
                      suffix="Units"
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card size="small" style={{ background: '#e6f7ff' }}>
                    <Statistic 
                      title="Total Records" 
                      value={totalProductions} 
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card size="small" style={{ background: '#fff7e6' }}>
                    <Statistic 
                      title="Verified" 
                      value={record.productions.filter(p => p.validation_status === 'verified').length} 
                    />
                  </Card>
                </Col>
              </Row>
              <Table
                dataSource={record.productions}
                rowKey="id"
                pagination={false}
                size="middle"
                columns={productionColumns}
              />
            </>
          ) : (
            <Empty description="No production records for this farm" />
          )}
        </TabPane>
      </Tabs>
    </Modal>
  );
};

export default LivestockDetail;