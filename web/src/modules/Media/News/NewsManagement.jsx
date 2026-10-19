import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Statistic, Button, Tag, Space, Typography, Select, message, Input, Modal, Descriptions, Image
} from 'antd';
import { 
  ReadOutlined, PlusOutlined, SearchOutlined, ReloadOutlined
} from '@ant-design/icons';
import { mediaApi } from '../../../services/api/mediaApi';
import { handleApiError } from '../../../utils/errorHandler';
import BrandedLoader from '../../../components/common/BrandedLoader';
import NewsList from './NewsList';
import NewsForm from './NewsForm';

const { Title, Text } = Typography;
const { Option } = Select;

const CARD_STYLE_GREEN = { borderRight: '1px solid #f0f0f0', borderBottom: '3px solid #52c41a', borderRadius: 0, height: '100%', boxShadow: 'none' };
const CARD_STYLE_BLUE = { borderRight: '1px solid #f0f0f0', borderBottom: '3px solid #1890ff', borderRadius: 0, height: '100%', boxShadow: 'none' };

const NewsManagement = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stats, setStats] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  // View Detail Modal State
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewingRecord, setViewingRecord] = useState(null);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchText) params.search = searchText;
      if (categoryFilter !== 'All') params.category = categoryFilter;
      const res = await mediaApi.getNews(params);
      setNews(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      handleApiError(error, 'Failed to fetch news');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await mediaApi.getNewsStats();
      setStats(res.data || {});
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  useEffect(() => {
    fetchNews();
    fetchStats();
  }, []);

  useEffect(() => {
    fetchNews();
  }, [searchText, categoryFilter]);

  const handleDelete = async (id) => {
    try {
      await mediaApi.deleteNews(id);
      message.success('News deleted successfully');
      fetchNews();
      fetchStats();
    } catch (error) {
      handleApiError(error, 'Failed to delete news');
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
        await mediaApi.updateNews(editingRecord.id, formData);
        message.success('News updated successfully');
      } else {
        await mediaApi.createNews(formData);
        message.success('News created successfully');
      }
      setModalVisible(false);
      setEditingRecord(null);
      fetchNews();
      fetchStats();
    } catch (error) {
      handleApiError(error, 'Failed to save news');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#fff', padding: '24px' }}>
      {loading && <BrandedLoader message="Loading News..." />}

      <div style={{ marginBottom: 20 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ marginBottom: 4, color: '#1a5f2c' }}>
              <ReadOutlined /> News Management
            </Title>
            <Text type="secondary">Manage news, announcements and updates</Text>
          </Col>
          <Col>
            <Button icon={<ReloadOutlined />} onClick={() => { fetchNews(); fetchStats(); }}>
              Refresh
            </Button>
          </Col>
        </Row>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={CARD_STYLE_GREEN}>
            <Statistic title="Total News" value={stats.total || 0} prefix={<ReadOutlined style={{ color: '#52c41a' }} />} />
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
            <Input placeholder="Search news..." prefix={<SearchOutlined />} allowClear onChange={(e) => setSearchText(e.target.value)} />
          </Col>
          <Col xs={24} sm={8} md={4}>
            <Select style={{ width: '100%' }} value={categoryFilter} onChange={setCategoryFilter}>
              <Option value="All">All Categories</Option>
              <Option value="Announcement">Announcement</Option>
              <Option value="Success Story">Success Story</Option>
              <Option value="Event">Event</Option>
              <Option value="Policy">Policy</Option>
              <Option value="Other">Other</Option>
            </Select>
          </Col>
          <Col xs={24} md={6}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} style={{ backgroundColor: '#1b7837', borderColor: '#1b7837' }}>
              Add News
            </Button>
          </Col>
        </Row>
      </Card>

      {/* ✅ Uses NewsList with onView passed */}
      <NewsList
        data={news}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
      />

      <NewsForm
        visible={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingRecord(null);
        }}
        onSuccess={handleFormSuccess}
        editingRecord={editingRecord}
        isSubmitting={isSubmitting}
      />

      {/* ✅ View News Details Modal */}
      <Modal
        title="News Details"
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
            {/* Display actual uploaded image */}
            {viewingRecord.image_url && (
              <div style={{ marginBottom: 20, textAlign: 'center' }}>
                <Image 
                  src={viewingRecord.image_url} 
                  alt={viewingRecord.title} 
                  style={{ maxWidth: '100%', maxHeight: 350, objectFit: 'cover', borderRadius: 8 }} 
                />
              </div>
            )}

            <Title level={4}>{viewingRecord.title}</Title>

            <Space style={{ marginBottom: 16 }}>
              <Tag color="orange">{viewingRecord.category || 'Uncategorized'}</Tag>
              {viewingRecord.tags && viewingRecord.tags.map(tag => (
                <Tag key={tag} color="blue">{tag}</Tag>
              ))}
              <Tag color={viewingRecord.is_public ? 'green' : 'red'}>
                {viewingRecord.is_public ? 'Public' : 'Private'}
              </Tag>
            </Space>

            <div style={{ 
              background: '#fafafa', 
              padding: 16, 
              borderRadius: 6, 
              marginBottom: 16, 
              whiteSpace: 'pre-wrap', 
              lineHeight: 1.8 
            }}>
              {viewingRecord.content}
            </div>

            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="Author">{viewingRecord.author || 'Unknown'}</Descriptions.Item>
              <Descriptions.Item label="News Date">
                {viewingRecord.news_date ? new Date(viewingRecord.news_date).toLocaleDateString() : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Source" span={2}>{viewingRecord.source || '-'}</Descriptions.Item>
              <Descriptions.Item label="Remarks" span={2}>{viewingRecord.remarks || '-'}</Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default NewsManagement;