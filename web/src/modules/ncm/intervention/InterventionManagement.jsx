import React, { useState, useEffect } from 'react';
import { Breadcrumb, Typography, message } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { interventionApi } from '../../../services/api/interventionApi';
import { handleApiError } from '../../../utils/errorHandler';
import BrandedLoader from '../../../components/common/BrandedLoader';

import InterventionStats from './InterventionStats';
import InterventionFilters from './InterventionFilters';
import InterventionTable from './InterventionTable';
import InterventionFormModal from './InterventionFormModal';
import CommonApprovalModal from '../../../components/common/CommonApprovalModal'; // 1. IMPORT COMMON REUSABLE MODAL

const { Title } = Typography;

export default function InterventionManagement() {
  const [data, setData] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);

  // 2. NEW STATES FOR AUDIT MANAGEMENT
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [approvingIntervention, setApprovingIntervention] = useState(null);

  const fetchData = async () => {
    setIsFetching(true);
    try {
      const res = await interventionApi.getInterventions();
      setData(res.data.data || []);
    } catch (err) { 
      handleApiError(err); 
    } finally { 
      setIsFetching(false); 
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredData = data.filter(d => {
    const matchesSearch = d.watershed?.watershed_name?.toLowerCase().includes(search.toLowerCase()) || 
                          d.intervention_type?.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter ? d.intervention_category === categoryFilter : true;
    return matchesSearch && matchesCat;
  });

  const handleSave = async (values) => {
    try {
      if (editingData) await interventionApi.updateIntervention(editingData.id, values);
      else await interventionApi.createIntervention(values);
      message.success('Intervention recorded successfully!');
      setModalOpen(false); 
      fetchData();
    } catch (err) { 
      handleApiError(err); 
    }
  };

  const handleDelete = async (id) => {
    try { 
      await interventionApi.deleteIntervention(id); 
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
      const response = await interventionApi.approveIntervention(entityId, values);
      message.success(response.data.message || 'Intervention status successfully updated');
      setIsApprovalModalOpen(false);
      await fetchData(); // Refresh database grid to show updated status tags
    } catch (error) {
      handleApiError(error, 'Failed to verify intervention record');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'relative', minHeight: '100%' }}>
      {(isFetching || isSubmitting) && <BrandedLoader message={isSubmitting ? "Processing Verification..." : "Loading Interventions..."} />}
      
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item><HomeOutlined /></Breadcrumb.Item>
        <Breadcrumb.Item>NCM</Breadcrumb.Item>
        <Breadcrumb.Item>Soil & Water Interventions</Breadcrumb.Item>
      </Breadcrumb>
      
      <Title level={3} style={{ marginBottom: 24, color: '#1a5f2c', fontFamily: "'Times New Roman', Times, serif" }}>
        Watershed Interventions & Conservation
      </Title>

      <InterventionStats data={filteredData} />
      
      <InterventionFilters 
        onSearch={setSearch} 
        onFilterCategory={setCategoryFilter}
        onAdd={() => { setEditingData(null); setModalOpen(true); }} 
        dataToExport={filteredData} 
      />
      
      <InterventionTable 
        data={filteredData} 
        onEdit={(r) => { setEditingData(r); setModalOpen(true); }} 
        onDelete={handleDelete} 
        // 4. Pass the Approve handler to table
        onApprove={(r) => { setApprovingIntervention(r); setIsApprovalModalOpen(true); }}
      />
      
      <InterventionFormModal 
        open={modalOpen} 
        onCancel={() => setModalOpen(false)} 
        onSubmit={handleSave} 
        editingData={editingData} 
      />

      {/* 5. PORTAL THE REUSABLE COMMON APPROVAL MODAL */}
      <CommonApprovalModal
        open={isApprovalModalOpen}
        onCancel={() => setIsApprovalModalOpen(false)}
        onSubmit={handleApprovalSubmit}
        isSubmitting={isSubmitting}
        title={`Verify Intervention: ${approvingIntervention?.intervention_type || ''}`}
        itemName={`${approvingIntervention?.intervention_type || ''} on Watershed ${approvingIntervention?.watershed?.watershed_name || ''}`}
        entityId={approvingIntervention?.id}
        initialStatus={approvingIntervention?.status}
        initialRemarks={approvingIntervention?.approval?.remarks}
      />
    </div>
  );
}