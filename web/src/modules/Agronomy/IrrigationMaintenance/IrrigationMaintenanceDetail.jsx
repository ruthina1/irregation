import React from 'react';
import { 
  Modal, Tag, Descriptions, Divider, Tabs, Table, Empty, Space, Button,
  Typography, Card, Row, Col, Statistic, Progress
} from 'antd';
import { 
  ApartmentOutlined, GlobalOutlined, CheckCircleOutlined,
  CloseCircleOutlined, ClockCircleOutlined, UserOutlined,
  CalendarOutlined, FundOutlined, ToolOutlined,
  DollarOutlined, TeamOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text } = Typography;
const { TabPane } = Tabs;

const IrrigationMaintenanceDetail = ({
  visible,
  onCancel,
  record,
  zonesMap = {},
  woredasMap = {},
  kebelesMap = {},
  onApprove,
  onEdit,
  onVerify,
  onComplete,
}) => {
  if (!record) return null;

  const statusColors = {
    planned: 'default',
    in_progress: 'processing',
    completed: 'success',
    verified: 'green',
    cancelled: 'error'
  };

  const approvalColors = {
    pending: 'warning',
    approved: 'success',
    rejected: 'error',
    under_review: 'processing'
  };

  const priorityColors = {
    high: 'error',
    medium: 'warning',
    low: 'success'
  };

  const typeColors = {
    preventive: 'cyan',
    corrective: 'orange',
    emergency: 'red',
    routine: 'blue'
  };

  // Activity columns
  const activityColumns = [
    { title: 'Date', dataIndex: 'activity_date', key: 'activity_date', render: (val) => val ? dayjs(val).format('YYYY-MM-DD') : '-' },
    { title: 'Type', dataIndex: 'activity_type', key: 'activity_type', render: (val) => val?.replace('_', ' ') },
    { title: 'Description', dataIndex: 'activity_description', key: 'activity_description' },
    { title: 'Labor', dataIndex: 'labor_used', key: 'labor_used', render: (val) => val || '-' },
    { title: 'Cost', dataIndex: 'cost_incurred', key: 'cost_incurred', render: (val) => val ? `${val.toLocaleString()} ETB` : '-' },
    { title: 'Status', dataIndex: 'activity_status', key: 'activity_status', render: (val) => <Tag color={statusColors[val]}>{val}</Tag> },
  ];

  const totalCost = record.activities?.reduce((sum, a) => sum + Number(a.cost_incurred || 0), 0) || 0;
  const totalLabor = record.activities?.reduce((sum, a) => sum + Number(a.labor_used || 0), 0) || 0;

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <ToolOutlined style={{ color: '#1a5f2c', fontSize: 20 }} />
          <span style={{ fontSize: 18, fontWeight: 600 }}>Maintenance Details</span>
          <Tag color={priorityColors[record.priority_level] || 'default'}>
            {record.priority_level}
          </Tag>
          <Tag color={statusColors[record.maintenance_status] || 'default'}>
            {record.maintenance_status}
          </Tag>
          <Tag color={approvalColors[record.approval_status] || 'default'}>
            {record.approval_status}
          </Tag>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="close" onClick={onCancel}>Close</Button>,
        record.approval_status === 'pending' && (
          <Button 
            key="submit" 
            onClick={() => onApprove?.(record.id)}
            style={{ color: '#fa8c16' }}
          >
            Approve
          </Button>
        ),
        record.maintenance_status === 'completed' && (
          <Button 
            key="verify" 
            type="primary" 
            onClick={() => onVerify?.(record.id)}
            style={{ backgroundColor: '#1b7837', borderColor: '#1b7837' }}
            icon={<CheckCircleOutlined />}
          >
            Verify
          </Button>
        ),
        record.maintenance_status === 'in_progress' && (
          <Button 
            key="complete" 
            type="primary" 
            onClick={() => onComplete?.(record.id)}
            style={{ backgroundColor: '#1890ff', borderColor: '#1890ff' }}
            icon={<CheckCircleOutlined />}
          >
            Mark Complete
          </Button>
        ),
        (record.approval_status === 'pending' || record.approval_status === 'under_review') && (
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
        <TabPane tab="Maintenance Details" key="details">
          <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
            <Col span={6}>
              <Card size="small">
                <Statistic 
                  title="Total Cost" 
                  value={totalCost || record.cost_actual || 0} 
                  precision={2} 
                  suffix="ETB"
                  prefix={<DollarOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <Statistic 
                  title="Total Labor" 
                  value={totalLabor || record.labor_person_days || 0} 
                  suffix="Days"
                  prefix={<TeamOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <Statistic 
                  title="Activities" 
                  value={record.activities?.length || 0}
                  prefix={<ToolOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <Statistic 
                  title="Duration" 
                  value={record.completion_date && record.maintenance_date 
                    ? dayjs(record.completion_date).diff(dayjs(record.maintenance_date), 'days')
                    : 'Ongoing'}
                  suffix="Days"
                  prefix={<CalendarOutlined />}
                />
              </Card>
            </Col>
          </Row>

          <Descriptions bordered column={2} size="middle">
            <Descriptions.Item label="Project" span={2}>
              <Text strong>{record.irrigation_project?.project_name || '-'}</Text>
              <Tag color="blue" style={{ marginLeft: 8 }}>{record.irrigation_project?.technology_type || '-'}</Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Title" span={2}>
              {record.maintenance_title}
            </Descriptions.Item>

            <Descriptions.Item label="Type">
              <Tag color={typeColors[record.maintenance_type]}>{record.maintenance_type}</Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Priority">
              <Tag color={priorityColors[record.priority_level]}>{record.priority_level}</Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Maintenance Date">
              <CalendarOutlined /> {record.maintenance_date ? dayjs(record.maintenance_date).format('YYYY-MM-DD') : '-'}
            </Descriptions.Item>

            <Descriptions.Item label="Completion Date">
              {record.completion_date ? dayjs(record.completion_date).format('YYYY-MM-DD') : '-'}
            </Descriptions.Item>

            <Descriptions.Item label="Scheduled Start">
              {record.scheduled_start_date ? dayjs(record.scheduled_start_date).format('YYYY-MM-DD') : '-'}
            </Descriptions.Item>

            <Descriptions.Item label="Scheduled End">
              {record.scheduled_end_date ? dayjs(record.scheduled_end_date).format('YYYY-MM-DD') : '-'}
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

            <Descriptions.Item label="Description" span={2}>
              {record.description}
            </Descriptions.Item>

            {record.issue_detected && (
              <Descriptions.Item label="Issue Detected" span={2}>
                {record.issue_detected}
              </Descriptions.Item>
            )}

            <Descriptions.Item label="Contractor">
              {record.contractor_name || '-'}
            </Descriptions.Item>

            <Descriptions.Item label="Materials Used">
              {record.materials_used || '-'}
            </Descriptions.Item>

            <Descriptions.Item label="Estimated Cost">
              {record.cost_estimated ? `${record.cost_estimated.toLocaleString()} ETB` : '-'}
            </Descriptions.Item>

            <Descriptions.Item label="Actual Cost">
              {record.cost_actual ? `${record.cost_actual.toLocaleString()} ETB` : '-'}
            </Descriptions.Item>

            <Descriptions.Item label="Remarks" span={2}>
              {record.remarks || 'No remarks'}
            </Descriptions.Item>
          </Descriptions>
        </TabPane>

        <TabPane tab={`Activities (${record.activities?.length || 0})`} key="activities">
          {record.activities && record.activities.length > 0 ? (
            <Table
              dataSource={record.activities}
              rowKey="id"
              pagination={false}
              size="middle"
              columns={activityColumns}
            />
          ) : (
            <Empty description="No activities recorded for this maintenance" />
          )}
        </TabPane>
      </Tabs>
    </Modal>
  );
};

export default IrrigationMaintenanceDetail;