import React from 'react';
import { Table, Tag, Space, Tooltip, Button } from 'antd';
import { AuditOutlined } from '@ant-design/icons';
import { EditButton, DeleteButton } from '../../../components/common/ActionButtons';

export default function InterventionTable({ data, onEdit, onDelete, onApprove }) {
  const columns = [
    { 
      title: 'Target Watershed', 
      key: 'watershed', 
      render: (_, r) => (
        <div>
          <strong style={{color:'#1a5f2c'}}>{r.watershed?.watershed_name}</strong>
          <div style={{fontSize: '12px', color: '#666'}}>{r.watershed?.kebele?.name}</div>
        </div>
      ) 
    },
    { 
      title: 'Category', 
      dataIndex: 'intervention_category', 
      key: 'category',
      render: cat => <Tag color={cat === 'Physical' ? 'blue' : 'green'}>{cat}</Tag>
    },
    { title: 'Intervention Type', dataIndex: 'intervention_type', key: 'type' },
    { 
      title: 'Treated Area (Ha)', 
      dataIndex: 'treated_area_ha', 
      key: 'area', 
      align: 'right',
      render: v => <strong style={{color: '#1890ff'}}>{v} Ha</strong>
    },
    { title: 'Year (EC)', dataIndex: 'year_implemented_ec', key: 'year', align: 'center' },
    { 
      title: 'Approval Status', // NEW: Core Verification status column
      dataIndex: 'status', 
      key: 'approval_status', 
      align: 'center',
      render: (status) => {
        let color = 'orange'; // Default for Pending
        if (status === 'Approved') color = 'green';
        if (status === 'Rejected') color = 'red';
        return <Tag color={color} style={{ fontWeight: 500, margin: 0 }}>{status || 'Pending'}</Tag>;
      }
    },
    { 
      title: 'Actions', 
      key: 'actions', 
      align: 'right', 
      render: (_, r) => (
        <Space size="small">
          {/* NEW: Audit Process Trigger */}
          {onApprove && (
            <Tooltip title="Verify Intervention Record">
              <Button 
                type="text" 
                icon={<AuditOutlined style={{ color: '#fa8c16' }} />} 
                onClick={(e) => { e.stopPropagation(); onApprove(r); }} 
              />
            </Tooltip>
          )}

          <EditButton onClick={() => onEdit(r)} />
          <DeleteButton onConfirm={() => onDelete(r.id)} itemName="intervention record" />
        </Space>
      )
    }
  ];

  return <Table columns={columns} dataSource={data} rowKey="id" bordered pagination={{ pageSize: 10 }} />;
}