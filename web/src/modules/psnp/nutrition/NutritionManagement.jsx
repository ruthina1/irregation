import React, { useState, useEffect } from 'react';
import { Breadcrumb, Typography, message } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { nutritionApi } from '../../../services/api/nutritionApi';
import { handleApiError } from '../../../utils/errorHandler';
import BrandedLoader from '../../../components/common/BrandedLoader';

import NutritionStats from './NutritionStats';
import NutritionFilters from './NutritionFilters';
import NutritionTable from './NutritionTable';
import NutritionFormModal from './NutritionFormModal';
import CommonApprovalModal from '../../../components/common/CommonApprovalModal'; // 1. IMPORT COMMON REUSABLE MODAL

const { Title } = Typography;

export default function NutritionManagement() {
  const [profiles, setProfiles] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);

  // 2. NEW STATES FOR AUDIT MANAGEMENT
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [approvingProfile, setApprovingProfile] = useState(null);

  const fetchProfiles = async () => {
    setIsFetching(true);
    try {
      const res = await nutritionApi.getProfiles();
      setProfiles(res.data.data || []);
    } catch (err) { 
      handleApiError(err); 
    } finally { 
      setIsFetching(false); 
    }
  };

  useEffect(() => { fetchProfiles(); }, []);

  const filteredData = profiles.filter(p => p.farmer?.full_name?.toLowerCase().includes(search.toLowerCase()));

  const handleSave = async (values) => {
    try {
      if (editingData) await nutritionApi.updateProfile(editingData.id, values);
      else await nutritionApi.createProfile(values);
      message.success('Nutrition profile saved!');
      setModalOpen(false); 
      fetchProfiles();
    } catch (err) { 
      handleApiError(err); 
    }
  };

  const handleDelete = async (id) => {
    try { 
      await nutritionApi.deleteProfile(id); 
      message.success('Profile deleted'); 
      fetchProfiles(); 
    } catch (err) { 
      handleApiError(err); 
    }
  };

  // 3. NEW: HANDLER FOR SUBMITTING VERIFICATION LOGIC
  const handleApprovalSubmit = async (entityId, values) => {
    setIsSubmitting(true);
    try {
      const response = await nutritionApi.approveProfile(entityId, values);
      message.success(response.data.message || 'Nutrition profile verification logged');
      setIsApprovalModalOpen(false);
      await fetchProfiles(); // Refresh database grid to show updated status tags
    } catch (error) {
      handleApiError(error, 'Failed to verify nutrition profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'relative', minHeight: '100%' }}>
      {(isFetching || isSubmitting) && <BrandedLoader message={isSubmitting ? "Processing Verification..." : "Loading Nutrition Data..."} />}
      
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item><HomeOutlined /></Breadcrumb.Item>
        <Breadcrumb.Item>Social Inclusion</Breadcrumb.Item>
        <Breadcrumb.Item>Nutrition & WASH</Breadcrumb.Item>
      </Breadcrumb>
      
      <Title level={3} style={{ marginBottom: 24, color: '#1a5f2c', fontFamily: "'Times New Roman', Times, serif" }}>
        Household Nutrition & WASH Hygiene
      </Title>

      <NutritionStats profiles={filteredData} />
      
      <NutritionFilters onSearch={setSearch} onAdd={() => { setEditingData(null); setModalOpen(true); }} dataToExport={filteredData} />
      
      <NutritionTable 
        data={filteredData} 
        onEdit={(r) => { setEditingData(r); setModalOpen(true); }} 
        onDelete={handleDelete} 
        // 4. Pass the Approve handler to table
        onApprove={(r) => { setApprovingProfile(r); setIsApprovalModalOpen(true); }}
      />
      
      <NutritionFormModal open={modalOpen} onCancel={() => setModalOpen(false)} onSubmit={handleSave} editingData={editingData} />

      {/* 5. PORTAL THE REUSABLE COMMON APPROVAL MODAL */}
      <CommonApprovalModal
        open={isApprovalModalOpen}
        onCancel={() => setIsApprovalModalOpen(false)}
        onSubmit={handleApprovalSubmit}
        isSubmitting={isSubmitting}
        title={`Verify Nutrition Profile: ${approvingProfile?.farmer?.full_name || ''}`}
        itemName={approvingProfile?.farmer?.full_name || ''}
        entityId={approvingProfile?.id}
        initialStatus={approvingProfile?.status}
        initialRemarks={approvingProfile?.approval?.remarks}
      />
    </div>
  );
}