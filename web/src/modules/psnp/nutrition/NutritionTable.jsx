import React from 'react';
import { Table, Tag, Space, Tooltip, Button } from 'antd';
import { AuditOutlined } from '@ant-design/icons';
import { EditButton, DeleteButton } from '../../../components/common/ActionButtons';
import dayjs from 'dayjs';

export default function NutritionTable({ data, onEdit, onDelete, onApprove }) {
  const columns = [
    { title: 'Farmer Name', key: 'farmer', render: (_, r) => <strong style={{color:'#1a5f2c'}}>{r.farmer?.full_name}</strong> },
    { 
      title: 'Dietary Score', 
      dataIndex: 'dietary_diversity_score', 
      key: 'dds',
      align: 'center',
      render: s => <Tag color={s >= 4 ? 'success' : 'error'}>{s} Groups</Tag> 
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
      title: 'Backyard / Nutrient Crops', 
      key: 'crops',
      render: (_, r) => (
        <div>
          {r.practicing_backyard_farming ? <Tag color="blue">Backyard Farming</Tag> : null}
          <div style={{ fontSize: '12px', marginTop: 4 }}>
            {r.nutrient_dense_crops_grown?.join(', ')}
          </div>
        </div>
      )
    },
    { 
      title: 'WASH & Maternal Hygiene', 
      key: 'wash',
      render: (_, r) => (
        <Space direction="vertical" size="small">
          {r.wash_hygiene?.is_pregnant_or_lactating && <Tag color="magenta">Maternal Support</Tag>}
          {r.wash_hygiene?.has_latrine && <Tag color="cyan">Has Latrine</Tag>}
          {r.wash_hygiene?.exclusive_breastfeeding && <Tag color="purple">Exclusive Breastfeeding</Tag>}
        </Space>
      )
    },
    { title: 'Date Assessed', dataIndex: 'assessment_date', key: 'date', render: d => dayjs(d).format('DD MMM YYYY') },
    { title: 'Actions', key: 'actions', align: 'right', render: (_, r) => (
        <Space size="small">
          {/* NEW: Audit Process Trigger */}
          {onApprove && (
            <Tooltip title="Verify Nutrition Profile">
              <Button 
                type="text" 
                icon={<AuditOutlined style={{ color: '#fa8c16' }} />} 
                onClick={(e) => { e.stopPropagation(); onApprove(r); }} 
              />
            </Tooltip>
          )}

          <EditButton onClick={() => onEdit(r)} />
          <DeleteButton onConfirm={() => onDelete(r.id)} itemName="assessment" />
        </Space>
      )
    }
  ];

  return <Table columns={columns} dataSource={data} rowKey="id" bordered pagination={{ pageSize: 10 }} />;
}