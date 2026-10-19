import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Statistic, Button, Tag, Space, Typography, Select, message, Input, Modal, Descriptions
} from 'antd';
import { 
  VideoCameraOutlined, PlusOutlined, SearchOutlined, ReloadOutlined
} from '@ant-design/icons';
import { mediaApi } from '../../../services/api/mediaApi';
import { handleApiError } from '../../../utils/errorHandler';
import BrandedLoader from '../../../components/common/BrandedLoader';
import VideoList from './VideoList';
import VideoForm from './VideoForm';

const { Title, Text } = Typography;
const { Option } = Select;

const CARD_STYLE_GREEN = { borderRight: '1px solid #f0f0f0', borderBottom: '3px solid #52c41a', borderRadius: 0, height: '100%', boxShadow: 'none' };
const CARD_STYLE_BLUE = { borderRight: '1px solid #f0f0f0', borderBottom: '3px solid #1890ff', borderRadius: 0, height: '100%', boxShadow: 'none' };

const VideoManagement = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stats, setStats] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  // View Modal State
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewingRecord, setViewingRecord] = useState(null);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchText) params.search = searchText;
      if (categoryFilter !== 'All') params.category = categoryFilter;
      const res = await mediaApi.getVideos(params);
      setVideos(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      handleApiError(error, 'Failed to fetch videos');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await mediaApi.getVideoStats();
      setStats(res.data || {});
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  useEffect(() => {
    fetchVideos();
    fetchStats();
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [searchText, categoryFilter]);

  const handleDelete = async (id) => {
    try {
      await mediaApi.deleteVideo(id);
      message.success('Video deleted successfully');
      fetchVideos();
      fetchStats();
    } catch (error) {
      handleApiError(error, 'Failed to delete video');
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setModalVisible(true);
  };

  const handleView = (record) => {
    setViewingRecord(record);
    setViewModalVisible(true);
  };

  const handleAdd = () => {
    setEditingRecord(null);
    setModalVisible(true);
  };

  const handleFormSuccess = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingRecord) {
        await mediaApi.updateVideo(editingRecord.id, formData);
        message.success('Video updated successfully');
      } else {
        await mediaApi.createVideo(formData);
        message.success('Video uploaded successfully');
      }
      setModalVisible(false);
      setEditingRecord(null);
      fetchVideos();
      fetchStats();
    } catch (error) {
      handleApiError(error, 'Failed to save video');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#fff', padding: '24px' }}>
      {loading && <BrandedLoader message="Loading Videos..." />}

      <div style={{ marginBottom: 20 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ marginBottom: 4, color: '#1a5f2c' }}>
              <VideoCameraOutlined /> Video Management
            </Title>
            <Text type="secondary">Manage videos and multimedia content</Text>
          </Col>
          <Col>
            <Button icon={<ReloadOutlined />} onClick={() => { fetchVideos(); fetchStats(); }}>
              Refresh
            </Button>
          </Col>
        </Row>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={CARD_STYLE_GREEN}>
            <Statistic title="Total Videos" value={stats.total || 0} prefix={<VideoCameraOutlined style={{ color: '#52c41a' }} />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={CARD_STYLE_BLUE}>
            <Statistic title="Categories" value={stats.by_category?.length || 0} prefix={<Tag style={{ color: '#1890ff' }} />} />
          </Card>
        </Col>
      </Row>

      <Card bordered={false} style={{ marginBottom: 16, borderRadius: 0, boxShadow: 'none', borderRight: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0' }}>
        <Row gutter={[16, 16]} align="middle" justify="space-between">
          <Col xs={24} md={6}>
            <Input placeholder="Search videos..." prefix={<SearchOutlined />} allowClear onChange={(e) => setSearchText(e.target.value)} />
          </Col>
          <Col xs={24} sm={8} md={4}>
            <Select style={{ width: '100%' }} value={categoryFilter} onChange={setCategoryFilter}>
              <Option value="All">All Categories</Option>
              <Option value="Training">Training</Option>
              <Option value="Demonstration">Demonstration</Option>
              <Option value="Event">Event</Option>
              <Option value="Documentary">Documentary</Option>
              <Option value="Other">Other</Option>
            </Select>
          </Col>
          <Col xs={24} md={6}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} style={{ backgroundColor: '#1b7837', borderColor: '#1b7837' }}>
              Upload Video
            </Button>
          </Col>
        </Row>
      </Card>

      {/* ✅ Use VideoList component which renders Duration column */}
      <VideoList
        data={videos}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
      />

      <VideoForm
        visible={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingRecord(null);
        }}
        onSuccess={handleFormSuccess}
        editingRecord={editingRecord}
        isSubmitting={isSubmitting}
      />

      {/* ✅ View & Play Video Modal */}
      <Modal
        title={viewingRecord?.title || 'Video Details'}
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            Close
          </Button>
        ]}
        width={750}
        destroyOnClose
      >
        {viewingRecord && (
          <div>
            <video 
              controls 
              style={{ width: '100%', maxHeight: '400px', backgroundColor: '#000', borderRadius: 6, marginBottom: 16 }}
              src={viewingRecord.video_url}
              poster={viewingRecord.thumbnail_url}
            >
              Your browser does not support playing this video.
            </video>

            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="Title" span={2}><strong>{viewingRecord.title}</strong></Descriptions.Item>
              <Descriptions.Item label="Category"><Tag color="purple">{viewingRecord.category || 'Uncategorized'}</Tag></Descriptions.Item>
              <Descriptions.Item label="Duration">{viewingRecord.duration || '-'}</Descriptions.Item>
              <Descriptions.Item label="Location">{viewingRecord.location || '-'}</Descriptions.Item>
              <Descriptions.Item label="Size">{viewingRecord.video_size_formatted || '-'}</Descriptions.Item>
              <Descriptions.Item label="Recorded Date">{viewingRecord.recorded_date ? new Date(viewingRecord.recorded_date).toLocaleDateString() : '-'}</Descriptions.Item>
              <Descriptions.Item label="Public Status">
                <Tag color={viewingRecord.is_public ? 'green' : 'red'}>{viewingRecord.is_public ? 'Public' : 'Private'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Description" span={2}>{viewingRecord.description || 'No description provided.'}</Descriptions.Item>
              <Descriptions.Item label="Remarks" span={2}>{viewingRecord.remarks || '-'}</Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default VideoManagement;