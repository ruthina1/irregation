import React from 'react';
import { 
  Modal, Tag, Descriptions, Divider, Tabs, Table, Empty, Space, Button,
  Typography, Card, Row, Col, Statistic, Progress
} from 'antd';
import { 
  ApartmentOutlined, GlobalOutlined, BugOutlined, 
  ThunderboltOutlined, CloudOutlined, CheckCircleOutlined,
  CloseCircleOutlined, WarningOutlined, ClockCircleOutlined,
  EnvironmentOutlined, UserOutlined, PhoneOutlined,
  CalendarOutlined, FieldTimeOutlined, FundOutlined,
  AreaChartOutlined, LineChartOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text, Title } = Typography;
const { TabPane } = Tabs;

const CropDetail = ({
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

  // Status color maps
  const statusColors = {
    planned: 'default',
    planted: 'processing',
    growing: 'warning',
    harvested: 'success',
    completed: 'green',
    cancelled: 'error'
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

  const growthStageLabels = {
    germination: '🌱 Germination',
    vegetative: '🌿 Vegetative',
    flowering: '🌸 Flowering',
    fruiting: '🍎 Fruiting',
    maturity: '🌾 Maturity',
    senescence: '🍂 Senescence'
  };

  // Production columns (READ-ONLY)
  const productionColumns = [
    { 
      title: 'Date', 
      dataIndex: 'monitoring_date', 
      key: 'monitoring_date',
      width: 120,
      render: (val) => val ? dayjs(val).format('YYYY-MM-DD') : '-' 
    },
    { 
      title: 'Growth Stage', 
      dataIndex: 'growth_stage', 
      key: 'growth_stage',
      width: 140,
      render: (val) => growthStageLabels[val] || val?.replace('_', ' ') || '-' 
    },
    { 
      title: 'Height (cm)', 
      dataIndex: 'plant_height_cm', 
      key: 'plant_height_cm',
      width: 110,
      render: (val) => val ? `${val} cm` : '-' 
    },
    { 
      title: 'Density (per m²)', 
      dataIndex: 'plant_density_per_m2', 
      key: 'plant_density_per_m2',
      width: 120,
      render: (val) => val || '-' 
    },
    { 
      title: 'Est. Yield', 
      dataIndex: 'estimated_yield_tons_per_ha', 
      key: 'estimated_yield_tons_per_ha',
      width: 110,
      render: (val) => val ? `${val} T/Ha` : '-' 
    },
    { 
      title: 'Issues', 
      key: 'issues',
      width: 200,
      render: (_, record) => (
        <Space size={4} wrap>
          {record.has_pest && <Tag color="red" icon={<BugOutlined />}>Pest</Tag>}
          {record.has_disease && <Tag color="orange" icon={<WarningOutlined />}>Disease</Tag>}
          {record.affected_by_drought && <Tag color="gold" icon={<ThunderboltOutlined />}>Drought</Tag>}
          {record.affected_by_flood && <Tag color="blue" icon={<CloudOutlined />}>Flood</Tag>}
          {record.affected_by_hail && <Tag color="purple" icon={<CloseCircleOutlined />}>Hail</Tag>}
          {!record.has_pest && !record.has_disease && 
           !record.affected_by_drought && !record.affected_by_flood && 
           !record.affected_by_hail && (
            <Tag color="green" icon={<CheckCircleOutlined />}>Healthy</Tag>
          )}
        </Space>
      )
    },
    { 
      title: 'Observations', 
      dataIndex: 'field_observations', 
      key: 'field_observations',
      ellipsis: true,
      render: (val) => val || '-' 
    },
  ];

  // Harvest columns (READ-ONLY)
  const harvestColumns = [
    { 
      title: 'Harvest Date', 
      dataIndex: 'harvest_date', 
      key: 'harvest_date',
      width: 130,
      render: (val) => val ? dayjs(val).format('YYYY-MM-DD') : '-' 
    },
    { 
      title: 'Quantity (Tons)', 
      dataIndex: 'harvest_quantity_tons', 
      key: 'harvest_quantity_tons',
      width: 130,
      render: (val) => <Tag color="blue">{val || 0} Tons</Tag>
    },
    { 
      title: 'Yield (T/Ha)', 
      dataIndex: 'actual_yield_tons_per_ha', 
      key: 'actual_yield_tons_per_ha',
      width: 120,
      render: (val) => <Tag color="cyan">{val || 0} T/Ha</Tag>
    },
    { 
      title: 'Quality', 
      dataIndex: 'crop_quality', 
      key: 'crop_quality',
      width: 130,
      render: (val) => (
        <Tag color={qualityColors[val] || 'default'}>
          {qualityLabels[val] || val}
        </Tag>
      )
    },
    { 
      title: 'Losses (Tons)', 
      dataIndex: 'production_losses_tons', 
      key: 'production_losses_tons',
      width: 120,
      render: (val) => val ? <Tag color="red">{val} Tons</Tag> : <Tag color="green">0</Tag>
    },
    { 
      title: 'Loss Reason', 
      dataIndex: 'loss_reason', 
      key: 'loss_reason',
      width: 130,
      render: (val) => val ? <Tag color="red">{val?.replace('_', ' ')}</Tag> : '-' 
    },
    { 
      title: 'Method', 
      dataIndex: 'harvest_method', 
      key: 'harvest_method',
      width: 120,
      render: (val) => val ? <Tag>{val}</Tag> : '-' 
    },
    { 
      title: 'Labor (Days)', 
      dataIndex: 'labor_person_days', 
      key: 'labor_person_days',
      width: 110,
      render: (val) => val || '-' 
    },
    { 
      title: 'Validation', 
      dataIndex: 'validation_status', 
      key: 'validation_status',
      width: 120,
      render: (val) => (
        <Tag color={val === 'verified' ? 'green' : val === 'rejected' ? 'red' : 'orange'}>
          {val === 'verified' && <CheckCircleOutlined />}
          {val === 'rejected' && <CloseCircleOutlined />}
          {val === 'pending' && <ClockCircleOutlined />}
          {val || 'pending'}
        </Tag>
      )
    },
  ];

  // Calculate harvest summary
  const totalHarvested = record.harvests?.reduce((sum, h) => sum + Number(h.harvest_quantity_tons || 0), 0) || 0;
  const totalLosses = record.harvests?.reduce((sum, h) => sum + Number(h.production_losses_tons || 0), 0) || 0;
  const averageYield = record.harvests?.length > 0 
    ? record.harvests.reduce((sum, h) => sum + Number(h.actual_yield_tons_per_ha || 0), 0) / record.harvests.length 
    : 0;
  const verifiedHarvests = record.harvests?.filter(h => h.validation_status === 'verified').length || 0;

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <ApartmentOutlined style={{ color: '#1a5f2c', fontSize: 20 }} />
          <span style={{ fontSize: 18, fontWeight: 600 }}>Crop Registration Details</span>
          <Tag color={statusColors[record.production_status] || 'default'} style={{ fontSize: 14, padding: '4px 12px' }}>
            {record.production_status?.toUpperCase()}
          </Tag>
          <Tag color={registrationStatusColors[record.registration_status] || 'default'} style={{ fontSize: 14, padding: '4px 12px' }}>
            {record.registration_status?.toUpperCase()}
          </Tag>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="close" onClick={onCancel}>
          Close
        </Button>,
        record.registration_status === 'submitted' && (
          <Button 
            key="approve" 
            type="primary" 
            onClick={() => {
              onApprove?.(record.id);
            }}
            style={{ backgroundColor: '#1b7837', borderColor: '#1b7837' }}
            icon={<CheckCircleOutlined />}
          >
            Approve Registration
          </Button>
        ),
        (record.registration_status === 'draft' || record.registration_status === 'submitted') && (
          <Button 
            key="edit" 
            onClick={() => {
              onCancel();
              onEdit?.(record);
            }}
            icon={<ApartmentOutlined />}
          >
            Edit
          </Button>
        )
      ]}
      width={1000}
      destroyOnClose
      bodyStyle={{ padding: '16px 24px' }}
    >
      <Tabs defaultActiveKey="details" size="large">
        {/* ==================== DETAILS TAB ==================== */}
        <TabPane 
          tab={<span><ApartmentOutlined /> Crop Details</span>} 
          key="details"
        >
          {/* Summary Cards */}
          <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
            <Col span={6}>
              <Card size="small">
                <Statistic 
                  title="Total Harvested" 
                  value={totalHarvested} 
                  precision={2} 
                  suffix="Tons"
                  valueStyle={{ color: '#1890ff' }}
                  prefix={<FundOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <Statistic 
                  title="Total Losses" 
                  value={totalLosses} 
                  precision={2} 
                  suffix="Tons"
                  valueStyle={{ color: totalLosses > 0 ? '#ff4d4f' : '#52c41a' }}
                  prefix={totalLosses > 0 ? <CloseCircleOutlined /> : <CheckCircleOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <Statistic 
                  title="Average Yield" 
                  value={averageYield} 
                  precision={2} 
                  suffix="T/Ha"
                  valueStyle={{ color: '#722ed1' }}
                  prefix={<LineChartOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <Statistic 
                  title="Verified Harvests" 
                  value={`${verifiedHarvests}/${record.harvests?.length || 0}`}
                  valueStyle={{ color: '#52c41a' }}
                  prefix={<CheckCircleOutlined />}
                />
              </Card>
            </Col>
          </Row>

          <Descriptions bordered column={2} size="middle">
            <Descriptions.Item label="Crop Type" span={2}>
              <Text strong style={{ fontSize: 16 }}>{record.crop_type}</Text>
            </Descriptions.Item>
            
            <Descriptions.Item label="Variety">
              <Tag color="blue">{record.crop_variety}</Tag>
            </Descriptions.Item>
            
            <Descriptions.Item label="Scientific Name">
              {record.scientific_name || '-'}
            </Descriptions.Item>

            <Descriptions.Item label="Farmer">
              <Space>
                <UserOutlined />
                <Text strong>{record.farmer_name || '-'}</Text>
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

            <Descriptions.Item label="Region" span={2}>
              <Tag color="geekblue">{record.region || '-'}</Tag>
            </Descriptions.Item>
            
            <Descriptions.Item label="Zone">
              <Tag color="cyan">{zonesMap[record.zone] || record.zone || '-'}</Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Woreda">
              <Tag color="purple">{woredasMap[record.woreda] || record.woreda || '-'}</Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Kebele" span={2}>
              <Tag color="orange">{kebelesMap[record.kebele] || record.kebele || '-'}</Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Farm Area">
              <Tag color="green">{record.farm_area_hectares || 0} Ha</Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Planting Date">
              <CalendarOutlined /> {record.planting_date ? dayjs(record.planting_date).format('YYYY-MM-DD') : '-'}
            </Descriptions.Item>

            <Descriptions.Item label="Production Method">
              <Tag color="gold">{record.production_method}</Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Irrigation Type">
              {record.irrigation_type ? <Tag color="cyan">{record.irrigation_type}</Tag> : '-'}
            </Descriptions.Item>

            <Descriptions.Item label="Inputs Used" span={2}>
              {record.inputs_used || '-'}
            </Descriptions.Item>

            <Descriptions.Item label="Expected Yield">
              {record.expected_yield_tons_per_ha ? (
                <Tag color="blue">{record.expected_yield_tons_per_ha} Tons/Ha</Tag>
              ) : '-'}
            </Descriptions.Item>

            <Descriptions.Item label="Expected Total Production">
              {record.expected_total_production_tons ? (
                <Tag color="purple">{record.expected_total_production_tons} Tons</Tag>
              ) : '-'}
            </Descriptions.Item>

            <Descriptions.Item label="GPS Coordinates" span={2}>
              {record.gps_latitude && record.gps_longitude ? (
                <Tag color="magenta" icon={<GlobalOutlined />}>
                  {parseFloat(record.gps_latitude).toFixed(6)}, {parseFloat(record.gps_longitude).toFixed(6)}
                </Tag>
              ) : (
                <Text type="secondary">No GPS coordinates recorded</Text>
              )}
            </Descriptions.Item>

            <Descriptions.Item label="Remarks" span={2}>
              {record.remarks || 'No remarks'}
            </Descriptions.Item>
          </Descriptions>
        </TabPane>

        {/* ==================== PRODUCTIONS TAB (READ-ONLY) ==================== */}
        <TabPane 
          tab={
            <span>
              <BugOutlined /> Production Monitoring 
              <Tag style={{ marginLeft: 8 }}>{record.productions?.length || 0}</Tag>
            </span>
          } 
          key="productions"
        >
          {record.productions && record.productions.length > 0 ? (
            <Table
              dataSource={record.productions}
              rowKey="id"
              pagination={false}
              size="middle"
              columns={productionColumns}
              scroll={{ x: 900 }}
            />
          ) : (
            <Empty 
              description="No production monitoring records found."
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </TabPane>

        {/* ==================== HARVESTS TAB (READ-ONLY) ==================== */}
        <TabPane 
          tab={
            <span>
              <FundOutlined /> Harvest Records 
              <Tag style={{ marginLeft: 8 }}>{record.harvests?.length || 0}</Tag>
            </span>
          } 
          key="harvests"
        >
          {record.harvests && record.harvests.length > 0 ? (
            <>
              {/* Harvest Summary */}
              <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col span={6}>
                  <Card size="small" style={{ background: '#f6ffed' }}>
                    <Statistic 
                      title="Total Harvest" 
                      value={totalHarvested} 
                      precision={2} 
                      suffix="Tons"
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card size="small" style={{ background: '#fff7e6' }}>
                    <Statistic 
                      title="Total Losses" 
                      value={totalLosses} 
                      precision={2} 
                      suffix="Tons"
                      valueStyle={{ color: '#fa8c16' }}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card size="small" style={{ background: '#e6f7ff' }}>
                    <Statistic 
                      title="Average Yield" 
                      value={averageYield} 
                      precision={2} 
                      suffix="T/Ha"
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card size="small" style={{ background: '#f9f0ff' }}>
                    <Statistic 
                      title="Harvest Count" 
                      value={record.harvests?.length || 0}
                      valueStyle={{ color: '#722ed1' }}
                    />
                  </Card>
                </Col>
              </Row>

              <Table
                dataSource={record.harvests}
                rowKey="id"
                pagination={false}
                size="middle"
                columns={harvestColumns}
                scroll={{ x: 1100 }}
              />
            </>
          ) : (
            <Empty 
              description="No harvest records found."
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </TabPane>

        {/* ==================== PERFORMANCE TAB ==================== */}
        <TabPane 
          tab={
            <span>
              <LineChartOutlined /> Performance
            </span>
          } 
          key="performance"
        >
          {record.harvests && record.harvests.length > 0 ? (
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card title="Yield Comparison" size="small">
                  <div style={{ padding: '16px 0' }}>
                    <div style={{ marginBottom: 12 }}>
                      <Text type="secondary">Expected Yield: </Text>
                      <Text strong>{record.expected_yield_tons_per_ha || 0} T/Ha</Text>
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <Text type="secondary">Actual Yield: </Text>
                      <Text strong style={{ color: '#1890ff' }}>{averageYield.toFixed(2)} T/Ha</Text>
                    </div>
                    <Divider style={{ margin: '8px 0' }} />
                    <div>
                      <Text type="secondary">Performance: </Text>
                      <Progress 
                        percent={record.expected_yield_tons_per_ha > 0 
                          ? Math.min((averageYield / record.expected_yield_tons_per_ha) * 100, 100) 
                          : 0
                        }
                        status={
                          averageYield >= record.expected_yield_tons_per_ha 
                            ? 'success' 
                            : averageYield >= record.expected_yield_tons_per_ha * 0.7 
                              ? 'active' 
                              : 'exception'
                        }
                        format={(percent) => `${percent?.toFixed(1)}%`}
                      />
                    </div>
                  </div>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="Harvest Summary" size="small">
                  <div style={{ padding: '16px 0' }}>
                    <div style={{ marginBottom: 12 }}>
                      <Text type="secondary">Total Harvested: </Text>
                      <Text strong style={{ color: '#52c41a' }}>{totalHarvested.toFixed(2)} Tons</Text>
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <Text type="secondary">Total Losses: </Text>
                      <Text strong style={{ color: totalLosses > 0 ? '#ff4d4f' : '#52c41a' }}>
                        {totalLosses.toFixed(2)} Tons
                      </Text>
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <Text type="secondary">Loss Rate: </Text>
                      <Tag color={totalLosses > 0 ? 'red' : 'green'}>
                        {totalHarvested + totalLosses > 0 
                          ? ((totalLosses / (totalHarvested + totalLosses)) * 100).toFixed(1) 
                          : 0}%
                      </Tag>
                    </div>
                    <div>
                      <Text type="secondary">Quality Distribution: </Text>
                      <Space wrap>
                        {record.harvests?.reduce((acc, h) => {
                          acc[h.crop_quality] = (acc[h.crop_quality] || 0) + 1;
                          return acc;
                        }, {}) && Object.entries(
                          record.harvests.reduce((acc, h) => {
                            acc[h.crop_quality] = (acc[h.crop_quality] || 0) + 1;
                            return acc;
                          }, {})
                        ).map(([quality, count]) => (
                          <Tag key={quality} color={qualityColors[quality] || 'default'}>
                            {quality}: {count}
                          </Tag>
                        ))}
                      </Space>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
          ) : (
            <Empty 
              description="No harvest data available for performance analysis."
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </TabPane>
      </Tabs>
    </Modal>
  );
};

export default CropDetail;