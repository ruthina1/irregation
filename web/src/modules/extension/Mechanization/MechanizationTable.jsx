import React from 'react';
import { Table, Tag, Space, Button, Tooltip, Card } from 'antd';
import { EyeOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { EditButton, DeleteButton } from '../../../components/common/ActionButtons';

const MechanizationTable = ({ 
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
  
  const conditionColors = {
    excellent: 'green',
    good: 'blue',
    fair: 'warning',
    poor: 'orange',
    needs_repair: 'error'
  };

  const operationalColors = {
    operational: 'green',
    in_use: 'processing',
    under_maintenance: 'warning',
    out_of_service: 'error'
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

  const ownershipColors = {
    government: 'blue',
    private: 'green',
    cooperative: 'purple',
    rental: 'orange'
  };

  const columns = [
    { 
      title: 'Equipment', 
      key: 'equipment',
      width: 200,
      fixed: 'left',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.equipment_name}</div>
          <div style={{ fontSize: 12, color: '#999' }}>{record.model || record.equipment_type}</div>
        </div>
      )
    },
    { 
      title: 'Type', 
      dataIndex: 'equipment_type', 
      key: 'equipment_type',
      width: 120,
      render: (val) => <Tag>{val}</Tag>
    },
    { 
      title: 'Owner', 
      dataIndex: 'ownership_type', 
      key: 'ownership_type',
      width: 110,
      render: (val) => <Tag color={ownershipColors[val] || 'default'}>{val}</Tag>
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
    { title: 'Region', dataIndex: 'region', key: 'region', width: 100 },
    { title: 'Zone', dataIndex: 'zone', key: 'zone', width: 120, render: (val) => zonesMap[val] || val || '-' },
    { 
      title: 'Condition', 
      dataIndex: 'condition_status', 
      key: 'condition_status',
      width: 110,
      render: (val) => <Tag color={conditionColors[val] || 'default'}>{val}</Tag>
    },
    { 
      title: 'Operational', 
      dataIndex: 'operational_status', 
      key: 'operational_status',
      width: 130,
      render: (val) => <Tag color={operationalColors[val] || 'default'}>{val?.replace('_', ' ')}</Tag>
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
              itemName={`Equipment ${record.equipment_name}`}
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

export default MechanizationTable;