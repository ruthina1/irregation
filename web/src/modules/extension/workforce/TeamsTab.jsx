import React, { useState } from 'react';
import { Table, Button, Space, Input, Tag, message, Tooltip } from 'antd';
import { PlusOutlined, SearchOutlined, AuditOutlined } from '@ant-design/icons';
import { EditButton, DeleteButton } from '../../../components/common/ActionButtons';
import { workforceApi } from '../../../services/api/workforceApi';
import { handleApiError } from '../../../utils/errorHandler';
import TeamFormModal from './TeamFormModal';

export default function TeamsTab({ teams, refreshData, onApprove }) {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);

  const filtered = teams.filter(t => t.team_name?.toLowerCase().includes(search.toLowerCase()));

  const handleSave = async (values) => {
    try {
      if (editingData) await workforceApi.updateTeam(editingData.id, values);
      else await workforceApi.createTeam(values);
      message.success('Team saved successfully');
      setIsModalOpen(false); 
      refreshData();
    } catch (error) { 
      handleApiError(error); 
    }
  };

  const handleDelete = async (id) => {
    try {
      await workforceApi.deleteTeam(id);
      message.success('Team deleted'); 
      refreshData();
    } catch (error) { 
      handleApiError(error); 
    }
  };

  const columns = [
    { 
      title: 'Team Name', 
      dataIndex: 'team_name', 
      key: 'name', 
      render: t => <strong style={{color: '#1a5f2c'}}>{t}</strong> 
    },
    { 
      title: 'Approval Status', // NEW Verification Tag Column
      dataIndex: 'status', 
      key: 'approval_status', 
      align: 'center',
      render: (status) => {
        let color = 'orange'; // Pending
        if (status === 'Approved') color = 'green';
        if (status === 'Rejected') color = 'red';
        return <Tag color={color} style={{ fontWeight: 500 }}>{status || 'Pending'}</Tag>;
      }
    },
    { 
      title: 'Type', 
      dataIndex: 'team_type', 
      key: 'type', 
      render: t => <Tag color={t.includes('Sub') ? 'purple' : 'gold'}>{t}</Tag> 
    },
    { 
      title: 'Leader (Farmer)', 
      key: 'leader', 
      render: (_, r) => r.leader?.full_name || <span style={{color: '#aaa'}}>Unassigned</span> 
    },
    { title: 'Members', dataIndex: 'total_members', key: 'members' },
    { title: 'Kebele', key: 'kebele', render: (_, r) => r.kebele?.name },
    { 
      title: 'Actions', 
      key: 'actions', 
      align: 'center',
      render: (_, r) => (
        <Space size="small">
          {/* NEW: Audit Trigger Button */}
          {onApprove && (
            <Tooltip title="Verify Development Team">
              <Button 
                type="text" 
                icon={<AuditOutlined style={{ color: '#fa8c16' }} />} 
                onClick={(e) => { e.stopPropagation(); onApprove(r); }} 
              />
            </Tooltip>
          )}
          <EditButton onClick={() => { setEditingData(r); setIsModalOpen(true); }} />
          <DeleteButton onConfirm={() => handleDelete(r.id)} itemName="team" />
        </Space>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Input placeholder="Search teams..." prefix={<SearchOutlined />} onChange={e => setSearch(e.target.value)} style={{ width: 300 }} />
        <Button type="primary" icon={<PlusOutlined />} style={{ background: '#1a5f2c' }} onClick={() => { setEditingData(null); setIsModalOpen(true); }}>Add Team</Button>
      </div>
      <Table columns={columns} dataSource={filtered} rowKey="id" pagination={{ pageSize: 10 }} bordered />
      <TeamFormModal open={isModalOpen} onCancel={() => setIsModalOpen(false)} onSubmit={handleSave} editingData={editingData} />
    </div>
  );
}