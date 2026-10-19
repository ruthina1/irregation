import React from 'react';
import { Table, Tag, Space, Button, Tooltip, Card, Image, Typography } from 'antd';
import { EditOutlined, EyeOutlined, ReadOutlined } from '@ant-design/icons';
import { DeleteButton } from '../../../components/common/ActionButtons';

const { Text } = Typography;

const NewsList = ({ 
  data, 
  loading, 
  onEdit, 
  onDelete,
  onView 
}) => {

  const columns = [
    { 
      title: 'Image', 
      key: 'image', 
      width: 90,
      render: (_, record) => (
        record.image_url ? (
          <Image 
            src={record.image_url} 
            alt={record.title} 
            width={55} 
            height={55} 
            style={{ objectFit: 'cover', borderRadius: 4 }} 
          />
        ) : (
          <div style={{ 
            width: 55, 
            height: 55, 
            background: '#f0f0f0', 
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ReadOutlined style={{ fontSize: 24, color: '#ccc' }} />
          </div>
        )
      )
    },
    { 
      title: 'Title', 
      dataIndex: 'title', 
      key: 'title', 
      width: 200,
      fixed: 'left',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          {record.tags && record.tags.length > 0 && (
            <div style={{ marginTop: 4 }}>
              {record.tags.map(tag => (
                <Tag key={tag} color="blue">{tag}</Tag>
              ))}
            </div>
          )}
        </div>
      )
    },
    { 
      title: 'Content', 
      dataIndex: 'content', 
      key: 'content', 
      ellipsis: true,
      render: (val) => {
        const maxLength = 100;
        return val?.length > maxLength ? val.substring(0, maxLength) + '...' : val;
      }
    },
    { 
      title: 'Category', 
      dataIndex: 'category', 
      key: 'category', 
      width: 120,
      render: (val) => <Tag color="orange">{val || 'Uncategorized'}</Tag>
    },
    { 
      title: 'Author', 
      dataIndex: 'author', 
      key: 'author', 
      width: 120,
      render: (val) => val || '-'
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
      dataIndex: 'news_date', 
      key: 'news_date', 
      width: 110,
      render: (val) => val ? new Date(val).toLocaleDateString() : '-'
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Details">
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
            itemName={`News ${record.title}`} 
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
        scroll={{ x: 1300 }}
      />
    </Card>
  );
};

export default NewsList;