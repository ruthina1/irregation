import React, { useState, useEffect } from 'react';
import { Breadcrumb, Typography, message, Table, Tag, Space, Button, Input } from 'antd';
import { HomeOutlined, PlusOutlined, EditOutlined, DeleteOutlined, AuditOutlined } from '@ant-design/icons';
import { washApi } from '../../../services/api/washApi';
import BrandedLoader from '../../../components/common/BrandedLoader';
import CommonApprovalModal from '../../../components/common/CommonApprovalModal';
import HygieneFormModal from './HygieneFormModal';

const { Title } = Typography;

export default function HygieneManagement() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);
  
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [approvingItem, setApprovingItem] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await washApi.getHygiene();
      setData(res.data.data || []);
    } catch (e) { 
      message.error("Failed to load hygiene data"); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredData = data.filter(d => d.farmer?.full_name?.toLowerCase().includes(search.toLowerCase()));

  const handleSave = async (vals) => {
    try {
      if (editingData) await washApi.updateHygiene(editingData.id, vals);
      else await washApi.createHygiene(vals);
      message.success('Hygiene profile saved!');
      setModalOpen(false); 
      fetchData();
    } catch (e) { 
      message.error("Save failed. Check required fields."); 
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure you want to delete this profile?")) return;
    try { 
      await washApi.deleteHygiene(id); 
      message.success('Profile deleted successfully'); 
      fetchData(); 
    } catch (e) { 
      message.error("Deletion failed"); 
    }
  };

  const handleApprove = async (id, vals) => {
    try {
      // Notice we specifically pass 'hygiene' as the type parameter to the unified approval endpoint
      await washApi.approveWashProfile('hygiene', id, vals);
      message.success('Hygiene verification logged successfully');
      setApprovalModalOpen(false); 
      fetchData();
    } catch (e) { 
      message.error("Verification failed"); 
    }
  };

  const columns = [
    { title: 'Household Head', key: 'name', render: (_, r) => <strong>{r.farmer?.full_name}</strong> },
    { title: 'Date', dataIndex: 'assessment_date' },
    { 
      title: 'Facility Present', 
      dataIndex: 'has_handwashing_facility_near_latrine', 
      render: v => v ? <Tag color="green">Yes</Tag> : <Tag color="red">No</Tag> 
    },
    { 
      title: 'Soap/Ash Available', 
      dataIndex: 'has_soap_or_ash', 
      render: v => v ? <Tag color="green">Yes</Tag> : <Tag color="red">No</Tag> 
    },
    { 
      title: 'Safe Storage', 
      dataIndex: 'safe_water_storage_practice', 
      render: v => v ? <Tag color="blue">Observed</Tag> : <Tag color="orange">Poor Practice</Tag> 
    },
    { 
      title: 'Verification', 
      dataIndex: 'status', 
      render: s => <Tag color={s==='Approved'?'green':(s==='Rejected'?'red':'orange')}>{s}</Tag> 
    },
    { 
      title: 'Actions', 
      render: (_, r) => (
        <Space>
          <Button type="text" icon={<AuditOutlined style={{ color: '#fa8c16' }}/>} onClick={() => { setApprovingItem(r); setApprovalModalOpen(true); }} />
          <Button type="text" icon={<EditOutlined style={{ color: '#1890ff' }}/>} onClick={() => { setEditingData(r); setModalOpen(true); }} />
          <Button type="text" danger icon={<DeleteOutlined/>} onClick={() => handleDelete(r.id)} />
        </Space>
      )
    }
  ];

  return (
    <div>
      {loading && <BrandedLoader />}
      
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item><HomeOutlined /></Breadcrumb.Item>
        <Breadcrumb.Item>PSNP WASH</Breadcrumb.Item>
        <Breadcrumb.Item>Hygiene (Handwashing)</Breadcrumb.Item>
      </Breadcrumb>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0, color: '#1a5f2c', fontFamily: "'Times New Roman', Times, serif" }}>
          Household Hygiene & Handwashing Practice
        </Title>
        <Space>
          <Input.Search placeholder="Search household..." onChange={e => setSearch(e.target.value)} allowClear />
          <Button type="primary" icon={<PlusOutlined/>} style={{ background: '#1a5f2c' }} onClick={() => { setEditingData(null); setModalOpen(true); }}>
            Add Assessment
          </Button>
        </Space>
      </div>

      <Table columns={columns} dataSource={filteredData} rowKey="id" bordered pagination={{ pageSize: 10 }} />

      <HygieneFormModal open={modalOpen} onCancel={() => setModalOpen(false)} onSubmit={handleSave} editingData={editingData} />
      
      <CommonApprovalModal
        open={approvalModalOpen} 
        onCancel={() => setApprovalModalOpen(false)} 
        onSubmit={handleApprove}
        title="Verify Hygiene Profile" 
        entityId={approvingItem?.id} 
        initialStatus={approvingItem?.status}
        initialRemarks={approvingItem?.washApproval?.remarks} 
      />
    </div>
  );
}