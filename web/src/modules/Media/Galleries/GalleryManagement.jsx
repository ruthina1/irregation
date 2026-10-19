import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Statistic, Button, Tag, Space, Typography, Empty, Tooltip, 
  message, Input, Select, Modal, Form, DatePicker, Switch, Upload, Image, Table
} from 'antd';
import { 
  PictureOutlined, PlusOutlined, EditOutlined, 
  SearchOutlined, ReloadOutlined, UploadOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { mediaApi } from '../../../services/api/mediaApi';
import { handleApiError } from '../../../utils/errorHandler';
import BrandedLoader from '../../../components/common/BrandedLoader';
import { DeleteButton } from '../../../components/common/ActionButtons';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const CARD_STYLE_GREEN = { borderRight: '1px solid #f0f0f0', borderBottom: '3px solid #52c41a', borderRadius: 0, height: '100%', boxShadow: 'none' };
const CARD_STYLE_BLUE = { borderRight: '1px solid #f0f0f0', borderBottom: '3px solid #1890ff', borderRadius: 0, height: '100%', boxShadow: 'none' };

const GalleryManagement = () => {
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stats, setStats] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);

  const fetchGalleries = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchText) params.search = searchText;
      if (categoryFilter !== 'All') params.category = categoryFilter;
      const res = await mediaApi.getGalleries(params);
      setGalleries(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      handleApiError(error, 'Failed to fetch images');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await mediaApi.getGalleryStats();
      setStats(res.data || {});
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  useEffect(() => {
    fetchGalleries();
    fetchStats();
  }, []);

  useEffect(() => {
    fetchGalleries();
  }, [searchText, categoryFilter]);

  const handleDelete = async (id) => {
    try {
      await mediaApi.deleteGallery(id);
      message.success('Image deleted successfully');
      fetchGalleries();
      fetchStats();
    } catch (error) {
      handleApiError(error, 'Failed to delete image');
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue({
      title: record.title,
      description: record.description,
      category: record.category,
      location: record.location,
      captured_date: record.captured_date ? dayjs(record.captured_date) : null,
      is_public: record.is_public !== undefined ? Boolean(record.is_public) : true,
      remarks: record.remarks,
    });
    setFileList(record.image_url ? [{ uid: '-1', url: record.image_url, name: record.image_name || 'image.jpg', status: 'done' }] : []);
    setModalVisible(true);
  };

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({ is_public: true });
    setFileList([]);
    setModalVisible(true);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setEditingRecord(null);
    form.resetFields();
    setFileList([]);
  };

  const handleFormSubmit = async (values) => {
    // Correctly pull the file from React state
    const selectedFile = fileList[0]?.originFileObj;

    if (!editingRecord && !selectedFile) {
      message.error('Please select an image file to upload');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: values.title,
        description: values.description || '',
        category: values.category || '',
        location: values.location || '',
        captured_date: values.captured_date ? values.captured_date.format('YYYY-MM-DD') : '',
        is_public: values.is_public ? 1 : 0,
        remarks: values.remarks || '',
      };

      // Only attach image if a new File was picked
      if (selectedFile) {
        payload.image = selectedFile;
      }

      if (editingRecord) {
        await mediaApi.updateGallery(editingRecord.id, payload);
        message.success('Image updated successfully');
      } else {
        await mediaApi.createGallery(payload);
        message.success('Image uploaded successfully');
      }

      handleModalCancel();
      fetchGalleries();
      fetchStats();
    } catch (error) {
      handleApiError(error, 'Failed to save image');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    { 
      title: 'Image', 
      key: 'image', 
      width: 100,
      render: (_, record) => (
        <Image src={record.image_url} alt={record.title} width={60} height={60} style={{ objectFit: 'cover', borderRadius: 4 }} />
      )
    },
    { title: 'Title', dataIndex: 'title', key: 'title', width: 180 },
    { title: 'Description', dataIndex: 'description', key: 'description', ellipsis: true },
    { title: 'Category', dataIndex: 'category', key: 'category', width: 120, render: (val) => <Tag>{val || 'Uncategorized'}</Tag> },
    { title: 'Location', dataIndex: 'location', key: 'location', width: 120 },
    { 
      title: 'Size', 
      dataIndex: 'image_size', 
      key: 'image_size', 
      width: 100,
      render: (val) => {
        if (!val) return '-';
        const bytes = parseInt(val);
        const units = ['B', 'KB', 'MB', 'GB'];
        let i = 0;
        let b = bytes;
        while (b >= 1024 && i < units.length - 1) { b /= 1024; i++; }
        return `${b.toFixed(2)} ${units[i]}`;
      }
    },
    { 
      title: 'Public', 
      dataIndex: 'is_public', 
      key: 'is_public', 
      width: 80,
      render: (val) => <Tag color={val ? 'green' : 'red'}>{val ? 'Yes' : 'No'}</Tag>
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit">
            <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          </Tooltip>
          <DeleteButton itemName={`Image ${record.title}`} onConfirm={() => handleDelete(record.id)} />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#fff', padding: '24px' }}>
      {loading && <BrandedLoader message="Loading Images..." />}

      <div style={{ marginBottom: 20 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ marginBottom: 4, color: '#1a5f2c' }}>
              <PictureOutlined /> Gallery Management
            </Title>
            <Text type="secondary">Manage images and photos</Text>
          </Col>
          <Col>
            <Button icon={<ReloadOutlined />} onClick={() => { fetchGalleries(); fetchStats(); }}>
              Refresh
            </Button>
          </Col>
        </Row>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={CARD_STYLE_GREEN}>
            <Statistic title="Total Images" value={stats.total || 0} prefix={<PictureOutlined style={{ color: '#52c41a' }} />} />
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
            <Input placeholder="Search images..." prefix={<SearchOutlined />} allowClear onChange={(e) => setSearchText(e.target.value)} />
          </Col>
          <Col xs={24} sm={8} md={4}>
            <Select style={{ width: '100%' }} value={categoryFilter} onChange={setCategoryFilter}>
              <Option value="All">All Categories</Option>
              <Option value="Farm">Farm</Option>
              <Option value="Crop">Crop</Option>
              <Option value="Livestock">Livestock</Option>
              <Option value="Event">Event</Option>
              <Option value="Other">Other</Option>
            </Select>
          </Col>
          <Col xs={24} md={6}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} style={{ backgroundColor: '#1b7837', borderColor: '#1b7837' }}>
              Upload Image
            </Button>
          </Col>
        </Row>
      </Card>

      <Card bordered={false} style={{ borderRadius: 0, boxShadow: 'none', borderRight: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0' }}>
        {galleries.length === 0 && !loading ? (
          <Empty description="No images found" />
        ) : (
          <Table columns={columns} dataSource={galleries} rowKey="id" loading={loading} pagination={{ pageSize: 10, showSizeChanger: true }} scroll={{ x: 1200 }} />
        )}
      </Card>

      <Modal
        title={editingRecord ? 'Edit Image' : 'Upload Image'}
        open={modalVisible}
        onCancel={handleModalCancel}
        footer={null}
        width={700}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Please enter title' }]}>
            <Input placeholder="Enter image title" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <TextArea rows={3} placeholder="Enter description" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="category" label="Category">
                <Select placeholder="Select category" allowClear>
                  <Option value="Farm">Farm</Option>
                  <Option value="Crop">Crop</Option>
                  <Option value="Livestock">Livestock</Option>
                  <Option value="Event">Event</Option>
                  <Option value="Other">Other</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="location" label="Location">
                <Input placeholder="Enter location" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="captured_date" label="Captured Date">
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="is_public" label="Public" valuePropName="checked">
                <Switch checkedChildren="Yes" unCheckedChildren="No" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Image File" required={!editingRecord} extra={editingRecord ? 'Leave empty to keep existing image' : 'Max size: 5MB'}>
            <Upload
              beforeUpload={() => false}
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
              accept="image/*"
              maxCount={1}
              listType="picture-card"
            >
              {fileList.length < 1 && (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Select Image</div>
                </div>
              )}
            </Upload>
          </Form.Item>
          <Form.Item name="remarks" label="Remarks">
            <Input placeholder="Additional notes..." />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={isSubmitting} style={{ backgroundColor: '#1b7837' }}>
                {editingRecord ? 'Update' : 'Upload'}
              </Button>
              <Button onClick={handleModalCancel}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default GalleryManagement;