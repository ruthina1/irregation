import React, { useState, useEffect } from 'react';
import { Breadcrumb, Typography, message } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { watershedApi } from '../../../services/api/watershedApi';
import { handleApiError } from '../../../utils/errorHandler';
import BrandedLoader from '../../../components/common/BrandedLoader';

import WatershedStats from './WatershedStats';
import WatershedFilters from './WatershedFilters';
import WatershedTable from './WatershedTable';
import WatershedFormModal from './WatershedFormModal';
import CommonApprovalModal from '../../../components/common/CommonApprovalModal'; // 1. IMPORT COMMON REUSABLE MODAL

const { Title } = Typography;

export default function WatershedManagement() {
  const [data, setData] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);

  // 2. NEW STATES FOR AUDIT MANAGEMENT
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [approvingWatershed, setApprovingWatershed] = useState(null);

  const fetchData = async () => {
    setIsFetching(true);
    try {
      const res = await watershedApi.getWatersheds();
      setData(res.data.data || []);
    } catch (err) { 
      handleApiError(err); 
    } finally { 
      setIsFetching(false); 
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredData = data.filter(d => 
    d.watershed_name?.toLowerCase().includes(search.toLowerCase()) || 
    d.watershed_code?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (values) => {
    try {
      if (editingData) await watershedApi.updateWatershed(editingData.id, values);
      else await watershedApi.createWatershed(values);
      message.success('Watershed data saved successfully!');
      setModalOpen(false); 
      fetchData();
    } catch (err) { 
      handleApiError(err); 
    }
  };

  const handleDelete = async (id) => {
    try { 
      await watershedApi.deleteWatershed(id); 
      message.success('Watershed deleted'); 
      fetchData(); 
    } catch (err) { 
      handleApiError(err); 
    }
  };

  // 3. NEW: HANDLER FOR SUBMITTING VERIFICATION LOGIC
  const handleApprovalSubmit = async (entityId, values) => {
    setIsSubmitting(true);
    try {
      const response = await watershedApi.approveWatershed(entityId, values);
      message.success(response.data.message || 'Watershed verification successfully saved');
      setIsApprovalModalOpen(false);
      await fetchData(); // Refresh database grid to show updated status tags
    } catch (error) {
      handleApiError(error, 'Failed to verify watershed registration');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'relative', minHeight: '100%' }}>
      {(isFetching || isSubmitting) && <BrandedLoader message={isSubmitting ? "Processing Verification..." : "Loading Watersheds..."} />}
      
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item><HomeOutlined /></Breadcrumb.Item>
        <Breadcrumb.Item>Natural Resources</Breadcrumb.Item>
        <Breadcrumb.Item>Watershed Registration</Breadcrumb.Item>
      </Breadcrumb>
      
      <Title level={3} style={{ marginBottom: 24, color: '#1a5f2c', fontFamily: "'Times New Roman', Times, serif" }}>
        Watershed Registration & Staging
      </Title>

      <WatershedStats data={filteredData} />
      
      <WatershedFilters onSearch={setSearch} onAdd={() => { setEditingData(null); setModalOpen(true); }} dataToExport={filteredData} />
      
      <WatershedTable 
        data={filteredData} 
        onEdit={(r) => { setEditingData(r); setModalOpen(true); }} 
        onDelete={handleDelete} 
        // 4. Pass the Approve handler to table
        onApprove={(r) => { setApprovingWatershed(r); setIsApprovalModalOpen(true); }}
      />
      
      <WatershedFormModal open={modalOpen} onCancel={() => setModalOpen(false)} onSubmit={handleSave} editingData={editingData} />

      {/* 5. PORTAL THE REUSABLE COMMON APPROVAL MODAL */}
      <CommonApprovalModal
        open={isApprovalModalOpen}
        onCancel={() => setIsApprovalModalOpen(false)}
        onSubmit={handleApprovalSubmit}
        isSubmitting={isSubmitting}
        title={`Verify Watershed: ${approvingWatershed?.watershed_name || ''}`}
        itemName={`${approvingWatershed?.watershed_name || ''} (${approvingWatershed?.watershed_code || ''})`}
        entityId={approvingWatershed?.id}
        initialStatus={approvingWatershed?.status}
        initialRemarks={approvingWatershed?.approval?.remarks}
      />
    </div>
  );
}