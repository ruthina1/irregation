import React from 'react';
import { Table, Tag, Space, Button, Tooltip, Card } from 'antd';
import { EyeOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { EditButton, DeleteButton } from '../../components/common/ActionButtons';

const LivestockTable = ({ 
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
    under_development: 'warning',
    closed: 'red'
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

  const farmTypeColors = {
    cattle: 'cyan',
    sheep: 'orange',
    goat: 'gold',
    poultry: 'pink',
    mixed: 'purple',
    other: 'default'
  };

  const columns = [
    { 
      title: 'Farm Name', 
      dataIndex: 'farm_name', 
      key: 'farm_name',
      width: 180,
      fixed: 'left',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          {record.farmer_name && (
            <div style={{ fontSize: 12, color: '#999' }}>{record.farmer_name}</div>
          )}
        </div>
      )
    },
    { 
      title: 'Farmer', 
      dataIndex: 'farmer_name', 
      key: 'farmer_name',
      render: (val, record) => (
        <div>
          <div>{val || '-'}</div>
          {record.farmer_phone && (
            <div style={{ fontSize: 12, color: '#999' }}>{record.farmer_phone}</div>
          )}
        </div>
      )
    },
    { 
      title: 'Type', 
      dataIndex: 'farm_type', 
      key: 'farm_type',
      width: 100,
      render: (val) => <Tag color={farmTypeColors[val] || 'default'}>{val}</Tag>
    },
    { title: 'Region', dataIndex: 'region', key: 'region', width: 100 },
    { title: 'Zone', dataIndex: 'zone', key: 'zone', width: 120, render: (val) => zonesMap[val] || val || '-' },
    { 
      title: 'Area (Ha)', 
      dataIndex: 'total_area_hectares', 
      key: 'total_area_hectares',
      width: 100,
      render: (val) => <Tag color="blue">{val || 0}</Tag>
    },
    { 
      title: 'System', 
      dataIndex: 'production_system', 
      key: 'production_system',
      width: 110,
      render: (val) => <Tag>{val?.replace('_', ' ')}</Tag>
    },
    { 
      title: 'Status', 
      dataIndex: 'farm_status', 
      key: 'farm_status',
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
              itemName={`Farm ${record.farm_name}`}
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

export default LivestockTable;