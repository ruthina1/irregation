import React, { useState, useEffect } from 'react';
import { Breadcrumb, Typography, message } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { empowermentApi } from '../../../services/api/empowermentApi';
import { handleApiError } from '../../../utils/errorHandler';
import BrandedLoader from '../../../components/common/BrandedLoader';

import EmpowermentStats from './EmpowermentStats';
import EmpowermentFilters from './EmpowermentFilters';
import EmpowermentTable from './EmpowermentTable';
import EmpowermentFormModal from './EmpowermentFormModal';
import CommonApprovalModal from '../../../components/common/CommonApprovalModal'; // 1. IMPORT COMMON REUSABLE MODAL

const { Title } = Typography;

export default function EmpowermentManagement() {
  const [data, setData] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);

  // 2. NEW STATES FOR AUDIT MANAGEMENT
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [approvingProfile, setApprovingProfile] = useState(null);

  const fetchData = async () => {
    setIsFetching(true);
    try {
      const res = await empowermentApi.getProfiles();
      setData(res.data.data || []);
    } catch (err) { 
      handleApiError(err); 
    } finally { 
      setIsFetching(false); 
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredData = data.filter(d => d.kebele?.name?.toLowerCase().includes(search.toLowerCase()));

  const handleSave = async (values) => {
    try {
      if (editingData) await empowermentApi.updateProfile(editingData.id, values);
      else await empowermentApi.createProfile(values);
      message.success('Empowerment data saved!');
      setModalOpen(false); 
      fetchData();
    } catch (err) { 
      handleApiError(err); 
    }
  };

  const handleDelete = async (id) => {
    try { 
      await empowermentApi.deleteProfile(id); 
      message.success('Record deleted'); 
      fetchData(); 
    } catch (err) { 
      handleApiError(err); 
    }
  };

  // 3. NEW: HANDLER FOR SUBMITTING VERIFICATION LOGIC
  const handleApprovalSubmit = async (entityId, values) => {
    setIsSubmitting(true);
    try {
      const response = await empowermentApi.approveProfile(entityId, values);
      message.success(response.data.message || 'Empowerment assessment verified successfully');
      setIsApprovalModalOpen(false);
      await fetchData(); // Refresh database grid to show updated status tags
    } catch (error) {
      handleApiError(error, 'Failed to verify empowerment profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'relative', minHeight: '100%' }}>
      {(isFetching || isSubmitting) && <BrandedLoader message={isSubmitting ? "Processing Verification..." : "Loading Empowerment Data..."} />}
      
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item><HomeOutlined /></Breadcrumb.Item>
        <Breadcrumb.Item>Social Inclusion</Breadcrumb.Item>
        <Breadcrumb.Item>Women & Youth Empowerment</Breadcrumb.Item>
      </Breadcrumb>
      
      <Title level={3} style={{ marginBottom: 24, color: '#1a5f2c', fontFamily: "'Times New Roman', Times, serif" }}>
        Women & Youth Empowerment Monitoring
      </Title>

      <EmpowermentStats data={filteredData} />
      
      <EmpowermentFilters onSearch={setSearch} onAdd={() => { setEditingData(null); setModalOpen(true); }} dataToExport={filteredData} />
      
      <EmpowermentTable 
        data={filteredData} 
        onEdit={(r) => { setEditingData(r); setModalOpen(true); }} 
        onDelete={handleDelete} 
        // 4. Pass the Approve handler to table
        onApprove={(r) => { setApprovingProfile(r); setIsApprovalModalOpen(true); }}
      />
      
      <EmpowermentFormModal open={modalOpen} onCancel={() => setModalOpen(false)} onSubmit={handleSave} editingData={editingData} />

      {/* 5. PORTAL THE REUSABLE COMMON APPROVAL MODAL */}
      <CommonApprovalModal
        open={isApprovalModalOpen}
        onCancel={() => setIsApprovalModalOpen(false)}
        onSubmit={handleApprovalSubmit}
        isSubmitting={isSubmitting}
        title={`Verify Empowerment Assessment: Kebele ${approvingProfile?.kebele?.name || ''}`}
        itemName={`Kebele ${approvingProfile?.kebele?.name || ''}`}
        entityId={approvingProfile?.id}
        initialStatus={approvingProfile?.status}
        initialRemarks={approvingProfile?.approval?.remarks}
      />
    </div>
  );
}