import React from 'react';
import { Table, Tag, Switch, Space, Typography } from 'antd';
import { EditButton, DeleteButton } from '../../components/common/ActionButtons';

const { Text } = Typography;

export default function UserTable({ users, loading, pagination, onChange, onToggleStatus, onEdit, onDelete }) {
  
  const columns = [
    { 
      title: 'Full Name', 
      dataIndex: 'full_name', 
      key: 'full_name',
      render: (text) => <Text strong style={{ color: '#334155' }}>{text}</Text>
    },
    { 
      title: 'Email Address', 
      dataIndex: 'email', 
      key: 'email',
      render: (text) => <Text type="secondary">{text}</Text>
    },
    { 
      title: 'System Role', 
      key: 'role',
      render: (_, record) => {
        const role = record.roles?.[0]?.name;
        // Formal tag styling
        return (
          <Tag color="blue" style={{ border: 'none', background: '#E0F2FE', color: '#0369A1', fontWeight: 500 }}>
            {role || 'No Role Assigned'}
          </Tag>
        );
      }
    },
    {
      title: 'Account Status',
      key: 'status',
      align: 'center',
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <Switch 
            checked={record.is_active} 
            onChange={(checked) => onToggleStatus(record, checked)} 
            checkedChildren="Active" 
            unCheckedChildren="Locked"
          />
        </Space>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Space size="small">
          <EditButton onClick={() => onEdit(record)} />
          <DeleteButton 
            itemName={record.full_name} 
            onConfirm={() => onDelete(record.id)} 
          />
        </Space>
      )
    }
  ];

  return (
    <div style={{ 
      background: '#ffffff', 
      borderRadius: '8px', 
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
      border: '1px solid #E2E8F0',
      overflow: 'hidden'
    }}>
      <Table 
        columns={columns} 
        dataSource={users} 
        rowKey="id" 
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: false,
          showTotal: (total) => `Total ${total} users`
        }}
        onChange={onChange}
        bordered={false} // Removing default borders for a cleaner SaaS look
        size="middle"
      />
    </div>
  );
}