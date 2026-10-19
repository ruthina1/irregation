import React from 'react';
import { Table, Tag, Space, Button, Tooltip, Card } from 'antd';
import { DownloadOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import { DeleteButton } from '../../../components/common/ActionButtons';

const DocumentList = ({ 
  data, 
  loading, 
  onEdit, 
  onDelete, 
  onDownload,
  onView 
}) => {
  
  const columns = [
    { 
      title: 'Title', 
      dataIndex: 'title', 
      key: 'title', 
      width: 200,
      fixed: 'left',
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
      render: (val) => <Tag color="blue">{val || 'Uncategorized'}</Tag>
    },
    { 
      title: 'Author', 
      dataIndex: 'author', 
      key: 'author', 
      width: 120,
      render: (val) => val || '-'
    },
    { 
      title: 'Size', 
      dataIndex: 'file_size', 
      key: 'file_size', 
      width: 100,
      render: (val) => {
        if (!val) return '-';
        let bytes = parseInt(val, 10); // ✅ Changed `const` to `let`
        if (isNaN(bytes)) return '-';
        const units = ['B', 'KB', 'MB', 'GB'];
        let i = 0;
        while (bytes >= 1024 && i < units.length - 1) { 
          bytes /= 1024; 
          i++; 
        }
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
      title: 'Date', 
      dataIndex: 'document_date', 
      key: 'document_date', 
      width: 110,
      render: (val) => val ? new Date(val).toLocaleDateString() : '-'
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View">
            <Button 
              size="small" 
              icon={<EyeOutlined />} 
              onClick={() => onView?.(record)} 
            />
          </Tooltip>
          <Tooltip title="Download">
            <Button 
              size="small" 
              icon={<DownloadOutlined />} 
              onClick={() => onDownload?.(record.id)} 
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
            itemName={`Document ${record.title}`} 
            onConfirm={() => onDelete?.(record.id)} 
          />
        </Space>
      ),
    },
  ];

  return (
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
  );
};

export default DocumentList;