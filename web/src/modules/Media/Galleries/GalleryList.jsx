import React, { useState } from 'react';
import { Table, Tag, Space, Button, Tooltip, Card, Image, Modal } from 'antd';
import { EditOutlined, EyeOutlined, ExpandOutlined } from '@ant-design/icons';
import { DeleteButton } from '../../../components/common/ActionButtons';

const GalleryList = ({ 
  data, 
  loading, 
  onEdit, 
  onDelete,
  onView 
}) => {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  const handlePreview = (imageUrl, title) => {
    setPreviewImage(imageUrl);
    setPreviewTitle(title);
    setPreviewVisible(true);
  };

  const columns = [
    { 
      title: 'Image', 
      key: 'image', 
      width: 100,
      render: (_, record) => (
        <div style={{ position: 'relative' }}>
          <img 
            src={record.image_url} 
            alt={record.title} 
            style={{ 
              width: 60, 
              height: 60, 
              objectFit: 'cover', 
              borderRadius: 4,
              cursor: 'pointer'
            }} 
            onClick={() => handlePreview(record.image_url, record.title)}
          />
          <Button 
            size="small" 
            icon={<ExpandOutlined />} 
            style={{ 
              position: 'absolute', 
              bottom: 0, 
              right: 0, 
              background: 'rgba(0,0,0,0.6)',
              color: '#fff',
              border: 'none',
              borderRadius: '0 0 4px 0'
            }}
            onClick={() => handlePreview(record.image_url, record.title)}
          />
        </div>
      )
    },
    { 
      title: 'Title', 
      dataIndex: 'title', 
      key: 'title', 
      width: 180,
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          {record.description && (
            <div style={{ fontSize: 12, color: '#999' }}>{record.description}</div>
          )}
        </div>
      )
    },
    { 
      title: 'Category', 
      dataIndex: 'category', 
      key: 'category', 
      width: 120,
      render: (val) => <Tag color="green">{val || 'Uncategorized'}</Tag>
    },
    { 
      title: 'Location', 
      dataIndex: 'location', 
      key: 'location', 
      width: 120,
      render: (val) => val || '-'
    },
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
        while (bytes >= 1024 && i < units.length - 1) { bytes /= 1024; i++; }
        return `${bytes.toFixed(2)} ${units[i]}`;
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
          <Tooltip title="View">
            <Button 
              size="small" 
              icon={<EyeOutlined />} 
              onClick={() => onView?.(record)} 
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button 
              size="small" 
              icon={<EditOutlined />} 
              onClick={() => onEdit?.(record)} 
            />
          </Tooltip>
          <DeleteButton 
            itemName={`Image ${record.title}`} 
            onConfirm={() => onDelete?.(record.id)} 
          />
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card bordered={false} style={{ borderRadius: 0, boxShadow: 'none', borderRight: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0' }}>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{ 
            pageSize: 10, 
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      <Modal
        open={previewVisible}
        title={previewTitle}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width={800}
        centered
      >
        <img alt={previewTitle} style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </>
  );
};

export default GalleryList;