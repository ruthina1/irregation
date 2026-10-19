import React from 'react';
import { Table, Tag, Space, Tooltip, Button } from 'antd';
import { EnvironmentOutlined, AuditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { EditButton, DeleteButton } from '../../../components/common/ActionButtons';

export default function TrainingTable({ data, onEdit, onDelete, onApprove }) {
  
  const columns = [
    {
      title: 'Topic / Agenda',
      dataIndex: 'topic',
      key: 'topic',
      render: (text, record) => (
        <div>
          <strong style={{ color: '#1a5f2c' }}>{text}</strong>
          {record.demonstrated_technology && (
            <div style={{ fontSize: '12px', color: '#666' }}>Tech: {record.demonstrated_technology}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Approval Status', // NEW: Core Verification Column
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (status) => {
        let color = 'orange'; // Default for Pending
        if (status === 'Approved') color = 'green';
        if (status === 'Rejected') color = 'red';
        return <Tag color={color} style={{ margin: 0, fontWeight: 500 }}>{status || 'Pending'}</Tag>;
      }
    },
    {
      title: 'Type',
      dataIndex: 'event_type',
      key: 'event_type',
      render: (type) => {
        const colorMap = { 'Training': 'blue', 'Field Day': 'green', 'Video Dissemination': 'orange', 'Workshop': 'purple' };
        return <Tag color={colorMap[type] || 'default'}>{type}</Tag>;
      }
    },
    {
      title: 'Location (Kebele)',
      key: 'location',
      render: (_, record) => (
        <Tooltip title={`${record.kebele?.woreda?.zone?.name} > ${record.kebele?.woreda?.name}`}>
          <span><EnvironmentOutlined style={{ color: '#aaa', marginRight: 4 }}/> {record.kebele?.name || 'N/A'}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Participants (M/F/Y)',
      key: 'demographics',
      render: (_, r) => (
        <span style={{ color: '#555' }}>
          {r.male_participants} / {r.female_participants} / <strong>{r.youth_participants}</strong>
        </span>
      ),
    },
    {
      title: 'Total',
      dataIndex: 'total_participants',
      key: 'total_participants',
      render: (total) => <Tag color="success" style={{ fontWeight: 'bold' }}>{total}</Tag>,
    },
    {
      title: 'Date Conducted',
      dataIndex: 'date_conducted',
      key: 'date_conducted',
      render: (date) => dayjs(date).format('MMM DD, YYYY'),
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          {/* NEW: Audit Process Button */}
          {onApprove && (
            <Tooltip title="Verify & Process Event Approval">
              <Button 
                type="text" 
                icon={<AuditOutlined style={{ color: '#fa8c16' }} />} 
                onClick={(e) => { e.stopPropagation(); onApprove(record); }} 
              />
            </Tooltip>
          )}
          
          <EditButton onClick={() => onEdit(record)} tooltip="Edit Event" />
          <DeleteButton onConfirm={() => onDelete(record.id)} itemName="this event" />
        </Space>
      ),
    }
  ];

  return (
    <Table 
      columns={columns} 
      dataSource={data} 
      rowKey="id" 
      pagination={{ pageSize: 12, showSizeChanger: true }} 
      scroll={{ x: 1000 }} 
      size="middle"
      bordered
    />
  );
}