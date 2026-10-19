import React from 'react';
import { Table, Tag, Space, Tooltip, Button } from 'antd';
import { EnvironmentOutlined, AuditOutlined } from '@ant-design/icons';
import { EditButton, DeleteButton } from '../../../components/common/ActionButtons';
import dayjs from 'dayjs';

export default function EmpowermentTable({ data, onEdit, onDelete, onApprove }) {
  const columns = [
    { 
      title: 'Location (Kebele)', 
      key: 'kebele', 
      render: (_, r) => (
        <Tooltip title={`${r.kebele?.woreda?.zone?.name} > ${r.kebele?.woreda?.name}`}>
          <strong style={{color:'#1a5f2c'}}><EnvironmentOutlined /> {r.kebele?.name}</strong>
        </Tooltip>
      ) 
    },
    { title: 'Women in Decision Roles', dataIndex: 'women_in_decision_making_roles', key: 'women', align: 'center', render: v => <Tag color="magenta">{v}</Tag> },
    { title: 'Youth Agri Enterprises', dataIndex: 'youth_in_agri_enterprises', key: 'youth', align: 'center', render: v => <Tag color="blue">{v}</Tag> },
    { 
      title: 'Labor-Saving Tech', 
      key: 'tech',
      render: (_, r) => (
        <div style={{ fontSize: '12px', color: '#555' }}>
          <div>Stoves: <strong>{r.labor_saving_tech_usage?.fuel_efficient_stoves || 0}</strong></div>
          <div>Solar: <strong>{r.labor_saving_tech_usage?.solar_tech || 0}</strong></div>
        </div>
      )
    },
    { 
      title: 'Social Development', 
      key: 'social',
      render: (_, r) => (
        <Space direction="vertical" size="small">
          {r.social_development?.hiv_aids_budget_allocated && <Tag color="red">HIV 2% Budget</Tag>}
          {r.social_development?.childcare_centers_established > 0 && <Tag color="green">{r.social_development.childcare_centers_established} Childcare Centers</Tag>}
        </Space>
      )
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
    { title: 'Date Assessed', dataIndex: 'assessment_date', key: 'date', render: d => dayjs(d).format('DD MMM YYYY') },
    { title: 'Actions', key: 'actions', align: 'right', render: (_, r) => (
        <Space size="small">
          {/* NEW: Audit Process Trigger */}
          {onApprove && (
            <Tooltip title="Verify Empowerment Assessment">
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