import React, { useState } from 'react';
import { Table, Tag, Space, Button, Tooltip, Card, Modal } from 'antd';
import { EditOutlined, EyeOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { DeleteButton } from '../../../components/common/ActionButtons';

const VideoList = ({ 
  data, 
  loading, 
  onEdit, 
  onDelete,
  onView 
}) => {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewVideo, setPreviewVideo] = useState('');

  const handlePreview = (videoUrl) => {
    setPreviewVideo(videoUrl);
    setPreviewVisible(true);
  };

  const columns = [
    { 
      title: 'Thumbnail', 
      key: 'thumbnail', 
      width: 100,
      render: (_, record) => (
        <div 
          style={{ 
            position: 'relative', 
            cursor: 'pointer',
            width: 60,
            height: 60
          }}
          onClick={() => handlePreview(record.video_url)}
        >
          {record.thumbnail_url ? (
            <img 
              src={record.thumbnail_url} 
              alt={record.title} 
              style={{ 
                width: 60, 
                height: 60, 
                objectFit: 'cover', 
                borderRadius: 4 
              }} 
            />
          ) : (
            <div style={{ 
              width: 60, 
              height: 60, 
              background: '#f0f0f0', 
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <PlayCircleOutlined style={{ fontSize: 30, color: '#1890ff' }} />
            </div>
          )}
          <PlayCircleOutlined 
            style={{ 
              position: 'absolute', 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -50%)',
              fontSize: 24,
              color: 'rgba(255,255,255,0.8)',
              textShadow: '0 0 10px rgba(0,0,0,0.5)'
            }} 
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
      render: (val) => <Tag color="purple">{val || 'Uncategorized'}</Tag>
    },
    { 
      title: 'Duration', 
      dataIndex: 'duration', 
      key: 'duration', 
      width: 100,
      render: (val) => val || '-'
    },
    { 
      title: 'Size', 
      dataIndex: 'video_size', 
      key: 'video_size', 
      width: 100,
      render: (val) => {
        if (!val) return '-';
        let bytes = parseInt(val, 10); // ✅ Changed `const` to `let`
        if (isNaN(bytes)) return '-';
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
            itemName={`Video ${record.title}`} 
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
        title="Video Preview"
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width={800}
        centered
        destroyOnClose
      >
        <video 
          controls 
          style={{ width: '100%', maxHeight: '70vh' }}
          src={previewVideo}
        >
          Your browser does not support the video tag.
        </video>
      </Modal>
    </>
  );
};

export default VideoList;