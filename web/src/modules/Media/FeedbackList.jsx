// web/src/modules/Media/FeedbackList.jsx

import React, { useState, useEffect } from 'react';
import { Table, Tag, Select, Button, Card, Typography, Modal, Space, Popconfirm, message, Tooltip } from 'antd';
import { EyeOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { mediaApi } from "../../services/api/mediaApi";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const STATUS_CONFIG = {
  new: { label: 'New', color: 'blue' },
  in_progress: { label: 'In Progress', color: 'orange' },
  solved: { label: 'Solved', color: 'green' },
  postponed: { label: 'Postponed', color: 'purple' },
  rejected: { label: 'Rejected', color: 'red' },
};

export default function FeedbackList() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const params = selectedStatus !== 'all' ? { status: selectedStatus } : {};
      const response = await mediaApi.getFeedbacks(params);
      
      // Safety check to handle array response properly
      const data = response.data?.data || response.data || [];
      setFeedbacks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      message.error('Failed to load feedback entries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [selectedStatus]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await mediaApi.updateFeedbackStatus(id, newStatus);
      message.success('Status updated successfully');
      setFeedbacks((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );
      if (selectedFeedback && selectedFeedback.id === id) {
        setSelectedFeedback((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      console.error('Error updating status:', error);
      message.error('Failed to update status.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await mediaApi.deleteFeedback(id);
      message.success('Feedback deleted successfully');
      setFeedbacks((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error('Error deleting feedback:', error);
      message.error('Failed to delete feedback.');
    }
  };

  const columns = [
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
      width: 180,
      render: (text) => <strong style={{ color: '#2C9647' }}>{text}</strong>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: 280,
      render: (text) => {
        if (!text) return <Text type="secondary">N/A</Text>;
        // Truncate description to ~50 characters
        const truncated = text.length > 50 ? `${text.substring(0, 50)}...` : text;
        return (
          <Tooltip title={text} placement="topLeft">
            <Text type="secondary" style={{ cursor: 'pointer' }}>
              {truncated}
            </Text>
          </Tooltip>
        );
      },
    },
    {
      title: 'Email',
      dataIndex: 'user_email',
      key: 'user_email',
      width: 180,
      render: (email) => email || <Text type="secondary">N/A</Text>,
    },
    {
      title: 'Submitted At',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status, record) => (
        <Select
          value={status}
          onChange={(newStatus) => handleStatusChange(record.id, newStatus)}
          style={{ width: 130 }}
        >
          {Object.entries(STATUS_CONFIG).map(([key, config]) => (
            <Option key={key} value={key}>
              <Tag color={config.color} style={{ marginRight: 0 }}>
                {config.label}
              </Tag>
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 110,
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedFeedback(record);
                setDetailModalVisible(true);
              }}
            />
          </Tooltip>

          <Popconfirm
            title="Delete Feedback"
            description="Are you sure you want to delete this feedback?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Delete">
              <Button danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 24 }}>🌾</span>
            <Title level={4} style={{ margin: 0 }}>
              User Feedback Management
            </Title>
          </div>
        }
        extra={
          <Space>
            <span>Filter Status:</span>
            <Select
              defaultValue="all"
              style={{ width: 150 }}
              onChange={(value) => setSelectedStatus(value)}
            >
              <Option value="all">All Statuses</Option>
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <Option key={key} value={key}>
                  {config.label}
                </Option>
              ))}
            </Select>
            <Button icon={<ReloadOutlined />} onClick={fetchFeedbacks}>
              Refresh
            </Button>
          </Space>
        }
      >
        <Table
          dataSource={feedbacks}
          columns={columns}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1000 }}
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['5', '10', '20', '50'],
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} feedbacks`,
          }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title="Feedback Details"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>,
        ]}
      >
        {selectedFeedback && (
          <div>
            <p><strong>Subject:</strong> {selectedFeedback.subject}</p>
            <p><strong>Submitted By:</strong> {selectedFeedback.user_email || 'Anonymous'}</p>
            <p><strong>Date:</strong> {new Date(selectedFeedback.created_at).toLocaleString()}</p>
            <p>
              <strong>Status:</strong>{' '}
              <Tag color={STATUS_CONFIG[selectedFeedback.status]?.color}>
                {STATUS_CONFIG[selectedFeedback.status]?.label}
              </Tag>
            </p>
            <div style={{ marginTop: 16 }}>
              <strong>Full Description:</strong>
              <Card type="inner" style={{ marginTop: 8, backgroundColor: '#f9f9f9' }}>
                <Paragraph>{selectedFeedback.description}</Paragraph>
              </Card>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}