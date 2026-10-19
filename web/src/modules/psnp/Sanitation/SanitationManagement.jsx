import React, { useState, useEffect } from 'react';
import { Breadcrumb, Typography, message, Table, Tag, Space, Button, Input } from 'antd';
import { HomeOutlined, PlusOutlined, EditOutlined, DeleteOutlined, AuditOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { washApi } from '../../../services/api/washApi';
import BrandedLoader from '../../../components/common/BrandedLoader';
import CommonApprovalModal from '../../../components/common/CommonApprovalModal';
import SanitationFormModal from './SanitationFormModal';

const { Title } = Typography;

export default function SanitationManagement() {
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
      const res = await washApi.getSanitation();
      setData(res.data.data || []);
    } catch (e) { 
      message.error("Failed to load sanitation data"); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredData = data.filter(d => d.farmer?.full_name?.toLowerCase().includes(search.toLowerCase()));

  const handleSave = async (vals) => {
    try {
      if (editingData) await washApi.updateSanitation(editingData.id, vals);
      else await washApi.createSanitation(vals);
      message.success('Sanitation profile saved!');
      setModalOpen(false); 
      fetchData();
    } catch (e) { 
      message.error("Save failed. Check required fields."); 
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure you want to delete this profile?")) return;
    try { 
      await washApi.deleteSanitation(id); 
      message.success('Profile deleted successfully'); 
      fetchData(); 
    } catch (e) { 
      message.error("Deletion failed"); 
    }
  };

  const handleApprove = async (id, vals) => {
    try {
      // Notice we specifically pass 'sanitation' as the type parameter to the unified approval endpoint
      await washApi.approveWashProfile('sanitation', id, vals);
      message.success('Sanitation verification logged successfully');
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
      title: 'Latrine Type', 
      dataIndex: 'latrine_type', 
      render: s => {
        let color = 'blue';
        if(s === 'None (Open Defecation)') color = 'red';
        if(s === 'Flush/VIP' || s === 'Improved Pit Latrine with Slab') color = 'green';
        return <Tag color={color}>{s}</Tag>;
      }
    },
    { 
      title: 'ODF Status', 
      dataIndex: 'is_odf_compliant', 
      render: v => v ? <Tag icon={<CheckCircleOutlined />} color="success">ODF Certified</Tag> : <Tag icon={<CloseCircleOutlined />} color="error">Risk</Tag> 
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
        <Breadcrumb.Item>Sanitation (ODF)</Breadcrumb.Item>
      </Breadcrumb>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0, color: '#1a5f2c', fontFamily: "'Times New Roman', Times, serif" }}>
          Household Sanitation & ODF Tracking
        </Title>
        <Space>
          <Input.Search placeholder="Search household..." onChange={e => setSearch(e.target.value)} allowClear />
          <Button type="primary" icon={<PlusOutlined/>} style={{ background: '#1a5f2c' }} onClick={() => { setEditingData(null); setModalOpen(true); }}>
            Add Assessment
          </Button>
        </Space>
      </div>

      <Table columns={columns} dataSource={filteredData} rowKey="id" bordered pagination={{ pageSize: 10 }} />

      <SanitationFormModal open={modalOpen} onCancel={() => setModalOpen(false)} onSubmit={handleSave} editingData={editingData} />
      
      <CommonApprovalModal
        open={approvalModalOpen} 
        onCancel={() => setApprovalModalOpen(false)} 
        onSubmit={handleApprove}
        title="Verify Sanitation Profile" 
        entityId={approvingItem?.id} 
        initialStatus={approvingItem?.status}
        initialRemarks={approvingItem?.washApproval?.remarks} // Make sure it reads the morph relation correctly
      />
    </div>
  );
}