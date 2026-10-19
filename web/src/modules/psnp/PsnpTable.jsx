import React from 'react';
import { Table, Tag, Space, Button, Tooltip } from 'antd';
import { AuditOutlined } from '@ant-design/icons';
import { EditButton, DeleteButton } from '../../components/common/ActionButtons';
import dayjs from 'dayjs';

export default function PsnpTable({ 
  data, 
  onEdit, 
  onDelete, 
  onGraduate, 
  onAddTransfer, 
  onDeleteTransfer,
  onApprove 
}) {
  
  // Main Table Columns
  const columns = [
    { 
      title: 'Farmer Info', 
      key: 'name', 
      render: (_, r) => (
        <div>
          <strong style={{ color: '#1a5f2c' }}>{r.farmer?.full_name}</strong>
          <div style={{ fontSize: '12px', color: '#666' }}>ID: {r.farmer?.farmer_unique_id_no}</div>
        </div>
      ) 
    },
    { 
      title: 'Targeting Type', 
      dataIndex: 'targeting_type', 
      key: 'type', 
      render: t => <Tag color={t === 'PW' ? 'blue' : 'magenta'}>{t === 'PW' ? 'Public Work (PW)' : 'Direct Support (PDS)'}</Tag> 
    },
    { 
      title: 'Approval Status', // NEW: Verification Tag Column
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
      title: 'Transfers Logged', 
      key: 'transfers', 
      align: 'center', 
      render: (_, r) => <Tag color="cyan">{r.transfers?.length || 0}</Tag> 
    },
    { 
      title: 'Program Status', 
      dataIndex: 'is_graduated', 
      key: 'status', 
      render: grad => grad ? <Tag color="success">Graduated</Tag> : <Tag color="warning">Active</Tag> 
    },
    { 
      title: 'Actions', 
      key: 'actions', 
      align: 'right',
      render: (_, r) => (
        <Space size="small">
          {/* NEW: Audit Process Trigger */}
          {onApprove && (
            <Tooltip title="Verify PSNP Profile">
              <Button 
                type="text" 
                icon={<AuditOutlined style={{ color: '#fa8c16' }} />} 
                onClick={(e) => { e.stopPropagation(); onApprove(r); }} 
              />
            </Tooltip>
          )}

          <Button size="small" type="dashed" onClick={() => onAddTransfer(r)}>Add Transfer</Button>
          {!r.is_graduated && (
            <Button size="small" onClick={() => onGraduate(r)} style={{ color: 'green', borderColor: 'green' }}>Graduate</Button>
          )}
          <EditButton onClick={() => onEdit(r)} tooltip="Edit Targeting Type" />
          <DeleteButton onConfirm={() => onDelete(r.id)} itemName="household" />
        </Space>
      )
    }
  ];

  // Nested Expanded Table for Transfers
  const expandedRowRender = (record) => {
    const transferCols = [
      { title: 'Cycle/Month', dataIndex: 'transfer_month_cycle', key: 'cycle' },
      { title: 'Type', dataIndex: 'transfer_type', key: 'type', render: t => <Tag>{t}</Tag> },
      { title: 'Cash Transferred', dataIndex: 'amount_birr', key: 'birr', render: v => v ? <strong style={{color:'#1890ff'}}>{v} ETB</strong> : '-' },
      { title: 'Grain Transferred', dataIndex: 'amount_metric_tons', key: 'grain', render: v => v ? <strong style={{color:'#d48806'}}>{v} MT</strong> : '-' },
      { title: 'Transfer Date', dataIndex: 'transfer_date', key: 'date', render: d => dayjs(d).format('DD MMM YYYY') },
      { title: 'Action', key: 'act', render: (_, tr) => <Button type="link" danger onClick={() => onDeleteTransfer(tr.id)}>Delete</Button> }
    ];
    return (
      <div style={{ margin: '10px 20px', background: '#fafafa', padding: '10px', borderRadius: '8px' }}>
        <h4 style={{ marginBottom: '10px' }}>Transfer History</h4>
        <Table columns={transferCols} dataSource={record.transfers} rowKey="id" pagination={false} size="small" />
      </div>
    );
  };

  return (
    <Table 
      columns={columns} 
      dataSource={data} 
      rowKey="id" 
      expandable={{ expandedRowRender, rowExpandable: r => r.transfers?.length > 0 }} 
      bordered 
      pagination={{ pageSize: 10 }}
    />
  );
}