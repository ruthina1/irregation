import React, { useState } from 'react';
import { Table, Button, Space, Input, Tag, message, Tooltip } from 'antd';
import { PlusOutlined, SearchOutlined, DownloadOutlined, AuditOutlined } from '@ant-design/icons';
import { EditButton, DeleteButton } from '../../../components/common/ActionButtons';
import { workforceApi } from '../../../services/api/workforceApi';
import { handleApiError } from '../../../utils/errorHandler';
import ExpertFormModal from './ExpertFormModal';

export default function ExpertsTab({ experts, refreshData, onApprove }) {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);

  const filtered = experts.filter(e => e.full_name?.toLowerCase().includes(search.toLowerCase()));

  const handleExport = () => {
    const headers = ['Full Name', 'Gender', 'Education', 'Status', 'Approval Status', 'Kebele'];
    const csvData = filtered.map(e => [
      `"${e.full_name}"`, 
      e.gender, 
      e.education_level, 
      e.employment_status, 
      e.status || 'Pending', 
      e.kebele?.name
    ]);
    const csvContent = [headers.join(','), ...csvData.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement('a'); 
    link.href = URL.createObjectURL(blob); 
    link.download = 'Experts.csv'; 
    link.click();
  };

  const handleSave = async (values) => {
    try {
      if (editingData) await workforceApi.updateExpert(editingData.id, values);
      else await workforceApi.createExpert(values);
      message.success('Expert saved successfully');
      setIsModalOpen(false);
      refreshData();
    } catch (error) { 
      handleApiError(error); 
    }
  };

  const handleDelete = async (id) => {
    try {
      await workforceApi.deleteExpert(id);
      message.success('Expert deleted');
      refreshData();
    } catch (error) { 
      handleApiError(error); 
    }
  };

  const columns = [
    { 
      title: 'Full Name', 
      dataIndex: 'full_name', 
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
    { title: 'Gender', dataIndex: 'gender', key: 'gender' },
    { title: 'Education', dataIndex: 'education_level', key: 'edu' },
    { 
      title: 'Status', 
      dataIndex: 'employment_status', 
      key: 'status', 
      render: s => <Tag color={s==='Active'?'green':s==='Transferred'?'blue':'red'}>{s}</Tag> 
    },
    { title: 'Kebele', key: 'kebele', render: (_, r) => r.kebele?.name },
    { 
      title: 'Actions', 
      key: 'actions', 
      align: 'center',
      render: (_, r) => (
        <Space size="small">
          {/* NEW: Audit Trigger Button */}
          {onApprove && (
            <Tooltip title="Verify Expert Profile">
              <Button 
                type="text" 
                icon={<AuditOutlined style={{ color: '#fa8c16' }} />} 
                onClick={(e) => { e.stopPropagation(); onApprove(r); }} 
              />
            </Tooltip>
          )}
          <EditButton onClick={() => { setEditingData(r); setIsModalOpen(true); }} />
          <DeleteButton onConfirm={() => handleDelete(r.id)} itemName="expert" />
        </Space>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Input placeholder="Search experts..." prefix={<SearchOutlined />} onChange={e => setSearch(e.target.value)} style={{ width: 300 }} />
        <Space>
          <Button icon={<DownloadOutlined />} onClick={handleExport}>Export</Button>
          <Button type="primary" icon={<PlusOutlined />} style={{ background: '#1a5f2c' }} onClick={() => { setEditingData(null); setIsModalOpen(true); }}>Add Expert</Button>
        </Space>
      </div>
      <Table columns={columns} dataSource={filtered} rowKey="id" pagination={{ pageSize: 10 }} bordered />
      <ExpertFormModal open={isModalOpen} onCancel={() => setIsModalOpen(false)} onSubmit={handleSave} editingData={editingData} />
    </div>
  );
}