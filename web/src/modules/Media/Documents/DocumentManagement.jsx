import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Button, Input, Select, message, Typography, Modal, Descriptions, Tag, Space } from 'antd';
import {
  FileOutlined, PlusOutlined, SearchOutlined, ReloadOutlined, TagOutlined, DownloadOutlined
} from '@ant-design/icons';
import { mediaApi } from '../../../services/api/mediaApi';
import { handleApiError } from '../../../utils/errorHandler';
import BrandedLoader from '../../../components/common/BrandedLoader';
import DocumentList from './DocumentList';
import DocumentForm from './DocumentForm';

const { Title, Text } = Typography;
const { Option } = Select;

const CARD_STYLE_GREEN = { borderRight: '1px solid #f0f0f0', borderBottom: '3px solid #52c41a', borderRadius: 0, height: '100%', boxShadow: 'none' };
const CARD_STYLE_BLUE = { borderRight: '1px solid #f0f0f0', borderBottom: '3px solid #1890ff', borderRadius: 0, height: '100%', boxShadow: 'none' };

const DocumentManagement = () => {
  const [documents, setDocuments] = useState([]);
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

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchText) params.search = searchText;
      if (categoryFilter !== 'All') params.category = categoryFilter;
      const res = await mediaApi.getDocuments(params);
      setDocuments(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      handleApiError(error, 'Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await mediaApi.getDocumentStats();
      setStats(res.data || {});
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  useEffect(() => {
    fetchDocuments();
    fetchStats();
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [searchText, categoryFilter]);

  const handleDelete = async (id) => {
    try {
      await mediaApi.deleteDocument(id);
      message.success('Document deleted successfully');
      fetchDocuments();
      fetchStats();
    } catch (error) {
      handleApiError(error, 'Failed to delete document');
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
        await mediaApi.updateDocument(editingRecord.id, formData);
        message.success('Document updated successfully');
      } else {
        await mediaApi.createDocument(formData);
        message.success('Document uploaded successfully');
      }
      setModalVisible(false);
      setEditingRecord(null);
      fetchDocuments();
      fetchStats();
    } catch (error) {
      handleApiError(error, 'Failed to save document');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownload = async (id) => {
    try {
      const response = await mediaApi.downloadDocument(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'document.pdf';
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match) filename = match[1];
      }
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      handleApiError(error, 'Failed to download document');
    }
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#fff', padding: '24px' }}>
      {loading && <BrandedLoader />}
      
      <div style={{ marginBottom: 20 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ marginBottom: 4, color: '#1a5f2c' }}>
              <FileOutlined /> Document Management
            </Title>
            <Text type="secondary">Manage documents, policies, reports and other files</Text>
          </Col>
          <Col>
            <Button icon={<ReloadOutlined />} onClick={() => { fetchDocuments(); fetchStats(); }}>
              Refresh
            </Button>
          </Col>
        </Row>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={CARD_STYLE_GREEN}>
            <Statistic title="Total Documents" value={stats.total || 0} prefix={<FileOutlined style={{ color: '#52c41a' }} />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={CARD_STYLE_BLUE}>
            <Statistic title="Categories" value={stats.by_category?.length || 0} prefix={<TagOutlined style={{ color: '#1890ff' }} />} />
          </Card>
        </Col>
      </Row>

      <Card bordered={false} style={{ marginBottom: 16, borderRadius: 0, boxShadow: 'none', borderRight: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0' }}>
        <Row gutter={[16, 16]} align="middle" justify="space-between">
          <Col xs={24} md={6}>
            <Input placeholder="Search documents..." prefix={<SearchOutlined />} allowClear onChange={(e) => setSearchText(e.target.value)} />
          </Col>
          <Col xs={24} sm={8} md={4}>
            <Select style={{ width: '100%' }} value={categoryFilter} onChange={setCategoryFilter}>
              <Option value="All">All Categories</Option>
              <Option value="Policy">Policy</Option>
              <Option value="Report">Report</Option>
              <Option value="Manual">Manual</Option>
              <Option value="Guideline">Guideline</Option>
              <Option value="Other">Other</Option>
            </Select>
          </Col>
          <Col xs={24} md={6}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} style={{ backgroundColor: '#1b7837', borderColor: '#1b7837' }}>
              Upload Document
            </Button>
          </Col>
        </Row>
      </Card>

      <DocumentList
        data={documents}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onDownload={handleDownload}
        onView={handleView}
      />

      <DocumentForm
        visible={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingRecord(null);
        }}
        onSuccess={handleFormSuccess}
        editingRecord={editingRecord}
        isSubmitting={isSubmitting}
      />

      {/* ✅ View Details Modal */}
      <Modal
        title="Document Details"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            Close
          </Button>,
          <Button 
            key="download" 
            type="primary" 
            icon={<DownloadOutlined />}
            style={{ backgroundColor: '#1b7837' }}
            onClick={() => handleDownload(viewingRecord?.id)}
          >
            Download File
          </Button>
        ]}
        width={650}
      >
        {viewingRecord && (
          <Descriptions column={2} bordered size="small" style={{ marginTop: 12 }}>
            <Descriptions.Item label="Title" span={2}><strong>{viewingRecord.title}</strong></Descriptions.Item>
            <Descriptions.Item label="Category"><Tag color="blue">{viewingRecord.category || 'Uncategorized'}</Tag></Descriptions.Item>
            <Descriptions.Item label="Author">{viewingRecord.author || '-'}</Descriptions.Item>
            <Descriptions.Item label="File Size">{viewingRecord.file_size_formatted || '-'}</Descriptions.Item>
            <Descriptions.Item label="Date">{viewingRecord.document_date ? new Date(viewingRecord.document_date).toLocaleDateString() : '-'}</Descriptions.Item>
            <Descriptions.Item label="Public Status">
              <Tag color={viewingRecord.is_public ? 'green' : 'red'}>{viewingRecord.is_public ? 'Public' : 'Private'}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="File Name">{viewingRecord.file_name || '-'}</Descriptions.Item>
            <Descriptions.Item label="Description" span={2}>{viewingRecord.description || 'No description provided.'}</Descriptions.Item>
            <Descriptions.Item label="Remarks" span={2}>{viewingRecord.remarks || '-'}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default DocumentManagement;