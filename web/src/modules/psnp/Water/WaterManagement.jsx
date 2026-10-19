import React, { useState, useEffect } from 'react';
import { Breadcrumb, Typography, message, Table, Tag, Space, Button, Input } from 'antd';
import { HomeOutlined, PlusOutlined, EditOutlined, DeleteOutlined, AuditOutlined } from '@ant-design/icons';
import { washApi } from '../../../services/api/washApi';
import BrandedLoader from '../../../components/common/BrandedLoader';
import CommonApprovalModal from '../../../components/common/CommonApprovalModal';
import WaterFormModal from './WaterFormModal';

const { Title } = Typography;

export default function WaterManagement() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [approvingItem, setApprovingItem] = useState(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await washApi.getWaterProfiles();
      setData(res.data.data || []);
    } catch (e) { message.error("Failed to load data"); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const filtered = data.filter(d => d.farmer?.full_name?.toLowerCase().includes(search.toLowerCase()));

  const handleSave = async (vals) => {
    try {
      if (editingData) await washApi.updateWaterProfile(editingData.id, vals);
      else await washApi.createWaterProfile(vals);
      message.success('Water profile saved!');
      setModalOpen(false); fetch();
    } catch (e) { message.error("Save failed"); }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure?")) return;
    try { await washApi.deleteWaterProfile(id); message.success('Deleted'); fetch(); } 
    catch (e) { message.error("Delete failed"); }
  };

  const handleApprove = async (id, vals) => {
    try {
      await washApi.approveProfile('water', id, vals);
      message.success('Verification saved');
      setApprovalModalOpen(false); fetch();
    } catch (e) { message.error("Verification failed"); }
  };

  const columns = [
    { title: 'Farmer Name', key: 'name', render: (_, r) => <strong>{r.farmer?.full_name}</strong> },
    { title: 'Date', dataIndex: 'assessment_date' },
    { title: 'Source', dataIndex: 'primary_source', render: s => <Tag color="blue">{s}</Tag> },
    { title: 'Distance', dataIndex: 'distance_minutes', render: d => `${d} mins` },
    { title: 'Treatment', dataIndex: 'treatment_method', render: t => <Tag color={t==='None'?'red':'green'}>{t}</Tag> },
    { title: 'Status', dataIndex: 'status', render: s => <Tag color={s==='Approved'?'green':(s==='Rejected'?'red':'orange')}>{s}</Tag> },
    { title: 'Actions', render: (_, r) => (
      <Space>
        <Button icon={<AuditOutlined/>} onClick={() => { setApprovingItem(r); setApprovalModalOpen(true); }} />
        <Button icon={<EditOutlined/>} onClick={() => { setEditingData(r); setModalOpen(true); }} />
        <Button danger icon={<DeleteOutlined/>} onClick={() => handleDelete(r.id)} />
      </Space>
    )}
  ];

  return (
    <div>
      {loading && <BrandedLoader />}
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item><HomeOutlined /></Breadcrumb.Item>
        <Breadcrumb.Item>PSNP WASH</Breadcrumb.Item><Breadcrumb.Item>Safe Water</Breadcrumb.Item>
      </Breadcrumb>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0, color: '#1a5f2c' }}>Household Safe Water</Title>
        <Space>
          <Input.Search placeholder="Search farmer..." onChange={e => setSearch(e.target.value)} allowClear />
          <Button type="primary" icon={<PlusOutlined/>} style={{ background: '#1a5f2c' }} onClick={() => { setEditingData(null); setModalOpen(true); }}>Add Assessment</Button>
        </Space>
      </div>

      <Table columns={columns} dataSource={filtered} rowKey="id" bordered />

      <WaterFormModal open={modalOpen} onCancel={() => setModalOpen(false)} onSubmit={handleSave} editingData={editingData} />
      
      <CommonApprovalModal
        open={approvalModalOpen} onCancel={() => setApprovalModalOpen(false)} onSubmit={handleApprove}
        title="Verify Water Assessment" entityId={approvingItem?.id} initialStatus={approvingItem?.status}
      />
    </div>
  );
}