import React from 'react';
import { Table, Tag, Space, Button, Tooltip, Card } from 'antd';
import { EyeOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { EditButton, DeleteButton } from '../../../components/common/ActionButtons';

const CooperativeTable = ({ 
  data, 
  loading, 
  zonesMap = {}, 
  woredasMap = {}, 
  kebelesMap = {},
  onView, 
  onEdit, 
  onDelete,
  onApprove,
  onSubmit
}) => {
  
  const statusColors = {
    active: 'green',
    inactive: 'default',
    suspended: 'warning',
    dissolved: 'error'
  };

  const registrationStatusColors = {
    draft: 'default',
    submitted: 'processing',
    under_review: 'warning',
    approved: 'success',
    rejected: 'error',
    published: 'green',
    archived: 'default'
  };

  const columns = [
    { 
      title: 'Cooperative', 
      key: 'cooperative',
      width: 200,
      fixed: 'left',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.cooperative_name}</div>
          <div style={{ fontSize: 12, color: '#999' }}>Code: {record.cooperative_code}</div>
        </div>
      )
    },
    { 
      title: 'Type', 
      dataIndex: 'cooperative_type', 
      key: 'cooperative_type',
      width: 120,
      render: (val) => <Tag color="blue">{val}</Tag>
    },
    { 
      title: 'Members', 
      dataIndex: 'total_members', 
      key: 'total_members',
      width: 100,
      render: (val) => <Tag color="purple">{val || 0}</Tag>
    },
    { title: 'Region', dataIndex: 'region', key: 'region', width: 100 },
    { title: 'Zone', dataIndex: 'zone', key: 'zone', width: 120, render: (val) => zonesMap[val] || val || '-' },
    { 
      title: 'Capital', 
      dataIndex: 'total_capital', 
      key: 'total_capital',
      width: 120,
      render: (val) => val ? `${Number(val).toLocaleString()} ETB` : '-'
    },
    { 
      title: 'Status', 
      dataIndex: 'cooperative_status', 
      key: 'cooperative_status',
      width: 120,
      render: (val) => <Tag color={statusColors[val] || 'default'}>{val}</Tag>
    },
    { 
      title: 'Registration', 
      dataIndex: 'registration_status', 
      key: 'registration_status',
      width: 120,
      render: (val) => <Tag color={registrationStatusColors[val] || 'default'}>{val}</Tag>
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 220,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button 
              size="small" 
              icon={<EyeOutlined />} 
              onClick={() => onView(record)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <EditButton onClick={() => onEdit(record)} />
          </Tooltip>
          
          {record.registration_status === 'draft' && (
            <Tooltip title="Submit for Approval">
              <Button 
                size="small" 
                icon={<CheckCircleOutlined />} 
                style={{ color: '#fa8c16' }} 
                onClick={() => onSubmit(record.id)}
              />
            </Tooltip>
          )}
          
          {record.registration_status === 'submitted' && (
            <Tooltip title="Approve">
              <Button 
                size="small" 
                icon={<CheckCircleOutlined />} 
                type="primary" 
                ghost 
                onClick={() => onApprove(record.id)}
              />
            </Tooltip>
          )}
          
          {(record.registration_status === 'draft' || record.registration_status === 'submitted') && (
            <DeleteButton
              itemName={`Cooperative ${record.cooperative_name}`}
              onConfirm={() => onDelete(record.id)}
            />
          )}
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
        scroll={{ x: 1500 }}
      />
    </Card>
  );
};

export default CooperativeTable;