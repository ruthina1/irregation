import React from 'react';
import { 
  Modal, Tag, Descriptions, Divider, Tabs, Table, Empty, Space, Button,
  Typography, Card, Row, Col, Statistic
} from 'antd';
import { 
  ApartmentOutlined, GlobalOutlined, CheckCircleOutlined,
  CloseCircleOutlined, ClockCircleOutlined, UserOutlined, PhoneOutlined,
  CalendarOutlined, FundOutlined, ToolOutlined, TeamOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text } = Typography;
const { TabPane } = Tabs;

const MechanizationDetail = ({
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

  const conditionColors = {
    excellent: 'green',
    good: 'blue',
    fair: 'warning',
    poor: 'orange',
    needs_repair: 'error'
  };

  const operationalColors = {
    operational: 'green',
    in_use: 'processing',
    under_maintenance: 'warning',
    out_of_service: 'error'
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

  const ownershipColors = {
    government: 'blue',
    private: 'green',
    cooperative: 'purple',
    rental: 'orange'
  };

  // Allocation columns
  const allocationColumns = [
    { title: 'Farmer', dataIndex: 'farmer_name', key: 'farmer_name', render: (val) => val || '-' },
    { title: 'Date', dataIndex: 'allocation_date', key: 'allocation_date', render: (val) => val ? dayjs(val).format('YYYY-MM-DD') : '-' },
    { title: 'Quantity', dataIndex: 'allocated_quantity', key: 'allocated_quantity', render: (val) => val || 1 },
    { title: 'Return Date', dataIndex: 'return_date', key: 'return_date', render: (val) => val ? dayjs(val).format('YYYY-MM-DD') : '-' },
    { title: 'Status', dataIndex: 'allocation_status', key: 'allocation_status', render: (val) => <Tag>{val}</Tag> },
    { title: 'Approval', dataIndex: 'approval_status', key: 'approval_status', render: (val) => <Tag>{val}</Tag> },
  ];

  // Maintenance columns
  const maintenanceColumns = [
    { title: 'Type', dataIndex: 'maintenance_type', key: 'maintenance_type' },
    { title: 'Date', dataIndex: 'maintenance_date', key: 'maintenance_date', render: (val) => val ? dayjs(val).format('YYYY-MM-DD') : '-' },
    { title: 'Cost', dataIndex: 'cost', key: 'cost', render: (val) => val ? `${val} ETB` : '-' },
    { title: 'Labor (Hrs)', dataIndex: 'labor_hours', key: 'labor_hours', render: (val) => val || '-' },
    { title: 'Status', dataIndex: 'maintenance_status', key: 'maintenance_status', render: (val) => <Tag>{val}</Tag> },
  ];

  const totalAllocations = record.allocations?.length || 0;
  const totalMaintenances = record.maintenances?.length || 0;
  const totalMaintenanceCost = record.maintenances?.reduce((sum, m) => sum + Number(m.cost || 0), 0) || 0;

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <ToolOutlined style={{ color: '#1a5f2c', fontSize: 20 }} />
          <span style={{ fontSize: 18, fontWeight: 600 }}>Equipment Details</span>
          <Tag color={operationalColors[record.operational_status] || 'default'}>
            {record.operational_status}
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
        <TabPane tab="Equipment Details" key="details">
          <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
            <Col span={6}>
              <Card size="small">
                <Statistic 
                  title="Total Allocations" 
                  value={totalAllocations} 
                  prefix={<TeamOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <Statistic 
                  title="Total Maintenances" 
                  value={totalMaintenances} 
                  prefix={<ToolOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <Statistic 
                  title="Maintenance Cost" 
                  value={totalMaintenanceCost} 
                  precision={2} 
                  suffix="ETB"
                  prefix={<FundOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <Statistic 
                  title="Horsepower" 
                  value={record.horsepower || 0} 
                  suffix="HP"
                />
              </Card>
            </Col>
          </Row>

          <Descriptions bordered column={2} size="middle">
            <Descriptions.Item label="Equipment Name" span={2}>
              <Text strong>{record.equipment_name}</Text>
            </Descriptions.Item>

            <Descriptions.Item label="Type">
              <Tag>{record.equipment_type}</Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Model">
              {record.model || '-'}
            </Descriptions.Item>

            <Descriptions.Item label="Serial Number">
              {record.serial_number || '-'}
            </Descriptions.Item>

            <Descriptions.Item label="Manufacturer">
              {record.manufacturer || '-'}
            </Descriptions.Item>

            <Descriptions.Item label="Year">
              {record.manufacturing_year || '-'}
            </Descriptions.Item>

            <Descriptions.Item label="Horsepower">
              {record.horsepower ? `${record.horsepower} HP` : '-'}
            </Descriptions.Item>

            <Descriptions.Item label="Fuel Type">
              {record.fuel_type || '-'}
            </Descriptions.Item>

            <Descriptions.Item label="Fuel Capacity">
              {record.fuel_capacity_liters ? `${record.fuel_capacity_liters} Liters` : '-'}
            </Descriptions.Item>

            <Descriptions.Item label="Weight">
              {record.weight_kg ? `${record.weight_kg} kg` : '-'}
            </Descriptions.Item>

            <Descriptions.Item label="Color">
              {record.color || '-'}
            </Descriptions.Item>

            <Descriptions.Item label="Ownership">
              <Tag color={ownershipColors[record.ownership_type] || 'default'}>
                {record.ownership_type}
              </Tag>
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

            <Descriptions.Item label="Condition">
              <Tag color={conditionColors[record.condition_status] || 'default'}>
                {record.condition_status}
              </Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Operational Status">
              <Tag color={operationalColors[record.operational_status] || 'default'}>
                {record.operational_status}
              </Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Remarks" span={2}>
              {record.remarks || 'No remarks'}
            </Descriptions.Item>
          </Descriptions>
        </TabPane>

        <TabPane tab={`Allocations (${totalAllocations})`} key="allocations">
          {record.allocations && record.allocations.length > 0 ? (
            <Table
              dataSource={record.allocations}
              rowKey="id"
              pagination={false}
              size="middle"
              columns={allocationColumns}
            />
          ) : (
            <Empty description="No allocations for this equipment" />
          )}
        </TabPane>

        <TabPane tab={`Maintenances (${totalMaintenances})`} key="maintenances">
          {record.maintenances && record.maintenances.length > 0 ? (
            <>
              <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col span={8}>
                  <Card size="small" style={{ background: '#f6ffed' }}>
                    <Statistic 
                      title="Total Records" 
                      value={totalMaintenances} 
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card size="small" style={{ background: '#e6f7ff' }}>
                    <Statistic 
                      title="Total Cost" 
                      value={totalMaintenanceCost} 
                      precision={2} 
                      suffix="ETB"
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card size="small" style={{ background: '#fff7e6' }}>
                    <Statistic 
                      title="Completed" 
                      value={record.maintenances.filter(m => m.maintenance_status === 'completed').length} 
                    />
                  </Card>
                </Col>
              </Row>
              <Table
                dataSource={record.maintenances}
                rowKey="id"
                pagination={false}
                size="middle"
                columns={maintenanceColumns}
              />
            </>
          ) : (
            <Empty description="No maintenance records for this equipment" />
          )}
        </TabPane>
      </Tabs>
    </Modal>
  );
};

export default MechanizationDetail;