import React from 'react';
import { 
  Modal, Tag, Descriptions, Divider, Tabs, Table, Empty, Space, Button,
  Typography, Card, Row, Col, Statistic
} from 'antd';
import { 
  ApartmentOutlined, GlobalOutlined, CheckCircleOutlined,
  CloseCircleOutlined, ClockCircleOutlined, UserOutlined, PhoneOutlined,
  CalendarOutlined, FundOutlined, TeamOutlined, MailOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text } = Typography;
const { TabPane } = Tabs;

const CooperativeDetail = ({
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
    suspended: 'warning',
    dissolved: 'error'
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

  // Member columns
  const memberColumns = [
    { title: 'Name', dataIndex: 'member_name', key: 'member_name' },
    { title: 'Phone', dataIndex: 'member_phone', key: 'member_phone', render: (val) => val || '-' },
    { title: 'Type', dataIndex: 'membership_type', key: 'membership_type' },
    { title: 'Join Date', dataIndex: 'join_date', key: 'join_date', render: (val) => val ? dayjs(val).format('YYYY-MM-DD') : '-' },
    { title: 'Share Capital', dataIndex: 'share_capital', key: 'share_capital', render: (val) => val ? `${val} ETB` : '-' },
    { title: 'Board Member', dataIndex: 'is_board_member', key: 'is_board_member', render: (val) => val ? 'Yes' : 'No' },
    { title: 'Status', dataIndex: 'member_status', key: 'member_status', render: (val) => <Tag>{val}</Tag> },
    { title: 'Approval', dataIndex: 'approval_status', key: 'approval_status', render: (val) => <Tag>{val}</Tag> },
  ];

  // Activity columns
  const activityColumns = [
    { title: 'Title', dataIndex: 'activity_title', key: 'activity_title' },
    { title: 'Type', dataIndex: 'activity_type', key: 'activity_type' },
    { title: 'Date', dataIndex: 'activity_date', key: 'activity_date', render: (val) => val ? dayjs(val).format('YYYY-MM-DD') : '-' },
    { title: 'Participants', dataIndex: 'participants_count', key: 'participants_count', render: (val) => val || 0 },
    { title: 'Budget', dataIndex: 'budget_allocated', key: 'budget_allocated', render: (val) => val ? `${val} ETB` : '-' },
    { title: 'Status', dataIndex: 'activity_status', key: 'activity_status', render: (val) => <Tag>{val}</Tag> },
    { title: 'Approval', dataIndex: 'approval_status', key: 'approval_status', render: (val) => <Tag>{val}</Tag> },
  ];

  const totalMembers = record.members?.length || 0;
  const totalActivities = record.activities?.length || 0;
  const totalCapital = record.total_capital || 0;

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <ApartmentOutlined style={{ color: '#1a5f2c', fontSize: 20 }} />
          <span style={{ fontSize: 18, fontWeight: 600 }}>Cooperative Details</span>
          <Tag color={statusColors[record.cooperative_status] || 'default'}>
            {record.cooperative_status}
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
        <TabPane tab="Cooperative Details" key="details">
          <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
            <Col span={6}>
              <Card size="small">
                <Statistic 
                  title="Total Members" 
                  value={totalMembers} 
                  prefix={<TeamOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <Statistic 
                  title="Total Activities" 
                  value={totalActivities} 
                  prefix={<CalendarOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <Statistic 
                  title="Total Capital" 
                  value={totalCapital} 
                  precision={2} 
                  suffix="ETB"
                  prefix={<FundOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <Statistic 
                  title="Registration Date" 
                  value={record.registration_date ? dayjs(record.registration_date).format('YYYY-MM-DD') : '-'}
                  prefix={<CalendarOutlined />}
                />
              </Card>
            </Col>
          </Row>

          <Descriptions bordered column={2} size="middle">
            <Descriptions.Item label="Cooperative Name" span={2}>
              <Text strong>{record.cooperative_name}</Text>
            </Descriptions.Item>

            <Descriptions.Item label="Code">
              <Tag color="blue">{record.cooperative_code}</Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Type">
              <Tag>{record.cooperative_type}</Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Registration Number">
              {record.registration_number || '-'}
            </Descriptions.Item>

            <Descriptions.Item label="Phone">
              <Space>
                <PhoneOutlined />
                <Text>{record.phone || '-'}</Text>
              </Space>
            </Descriptions.Item>

            <Descriptions.Item label="Email">
              <Space>
                <MailOutlined />
                <Text>{record.email || '-'}</Text>
              </Space>
            </Descriptions.Item>

            <Descriptions.Item label="Website">
              {record.website || '-'}
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

            <Descriptions.Item label="Specific Location">
              {record.specific_location || '-'}
            </Descriptions.Item>

            <Descriptions.Item label="GPS Coordinates" span={2}>
              {record.gps_latitude && record.gps_longitude ? (
                <Tag color="magenta" icon={<GlobalOutlined />}>
                  {parseFloat(record.gps_latitude).toFixed(6)}, {parseFloat(record.gps_longitude).toFixed(6)}
                </Tag>
              ) : '-'}
            </Descriptions.Item>

            <Descriptions.Item label="Chairperson" span={2}>
              {record.chairperson_name || '-'}
            </Descriptions.Item>

            <Descriptions.Item label="Vice Chairperson">
              {record.vice_chairperson_name || '-'}
            </Descriptions.Item>

            <Descriptions.Item label="Secretary">
              {record.secretary_name || '-'}
            </Descriptions.Item>

            <Descriptions.Item label="Treasurer">
              {record.treasurer_name || '-'}
            </Descriptions.Item>

            <Descriptions.Item label="Main Activities" span={2}>
              {record.main_activities || '-'}
            </Descriptions.Item>

            <Descriptions.Item label="Objectives" span={2}>
              {record.objectives || '-'}
            </Descriptions.Item>

            <Descriptions.Item label="Remarks" span={2}>
              {record.remarks || 'No remarks'}
            </Descriptions.Item>
          </Descriptions>
        </TabPane>

        <TabPane tab={`Members (${totalMembers})`} key="members">
          {record.members && record.members.length > 0 ? (
            <Table
              dataSource={record.members}
              rowKey="id"
              pagination={false}
              size="middle"
              columns={memberColumns}
            />
          ) : (
            <Empty description="No members registered" />
          )}
        </TabPane>

        <TabPane tab={`Activities (${totalActivities})`} key="activities">
          {record.activities && record.activities.length > 0 ? (
            <Table
              dataSource={record.activities}
              rowKey="id"
              pagination={false}
              size="middle"
              columns={activityColumns}
            />
          ) : (
            <Empty description="No activities recorded" />
          )}
        </TabPane>
      </Tabs>
    </Modal>
  );
};

export default CooperativeDetail;