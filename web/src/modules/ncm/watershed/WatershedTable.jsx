import React from 'react';
import { Table, Tag, Space, Tooltip, Progress, Button } from 'antd';
import { EnvironmentOutlined, AuditOutlined } from '@ant-design/icons';
import { EditButton, DeleteButton } from '../../../components/common/ActionButtons';

export default function WatershedTable({ data, onEdit, onDelete, onApprove }) {
  
  const stageColors = {
    'Start-up': 'default',
    'Intermediate': 'processing',
    'Progressive': 'cyan',
    'Transformation': 'blue',
    'Maturity': 'success'
  };

  const columns = [
    { 
      title: 'Watershed', 
      key: 'watershed', 
      render: (_, r) => (
        <div>
          <strong style={{color:'#1a5f2c'}}>{r.watershed_name}</strong>
          <div style={{fontSize: '12px', color: '#666'}}>{r.watershed_code}</div>
        </div>
      ) 
    },
    { 
      title: 'Location', 
      key: 'kebele', 
      render: (_, r) => (
        <Tooltip title={`${r.kebele?.woreda?.zone?.name} > ${r.kebele?.woreda?.name}`}>
          <span><EnvironmentOutlined /> {r.kebele?.name}</span>
        </Tooltip>
      ) 
    },
    { title: 'Area (Ha)', dataIndex: 'total_area_ha', key: 'area', align: 'center' },
    { 
      title: 'Physical Achieved', 
      dataIndex: 'physical_score_percentage', 
      key: 'physical',
      render: val => <Progress percent={parseFloat(val)} size="small" />
    },
    { 
      title: 'Biological Achieved', 
      dataIndex: 'biological_score_percentage', 
      key: 'biological',
      render: val => <Progress percent={parseFloat(val)} size="small" strokeColor="#52c41a" />
    },
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
      title: 'System Stage', 
      dataIndex: 'development_stage', 
      key: 'stage',
      align: 'center',
      render: stage => <Tag color={stageColors[stage]}>{stage}</Tag> 
    },
    { title: 'Actions', key: 'actions', align: 'right', render: (_, r) => (
        <Space size="small">
          {/* NEW: Audit Process Trigger */}
          {onApprove && (
            <Tooltip title="Verify Watershed Profile">
              <Button 
                type="text" 
                icon={<AuditOutlined style={{ color: '#fa8c16' }} />} 
                onClick={(e) => { e.stopPropagation(); onApprove(r); }} 
              />
            </Tooltip>
          )}

          <EditButton onClick={() => onEdit(r)} />
          <DeleteButton onConfirm={() => onDelete(r.id)} itemName="watershed" />
        </Space>
      )
    }
  ];

  return <Table columns={columns} dataSource={data} rowKey="id" bordered pagination={{ pageSize: 10 }} />;
}