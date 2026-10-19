import React, { useState, useEffect } from 'react';
import { Breadcrumb, Typography, message } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { modelVillageApi } from '../../../services/api/modelVillageApi';
import { handleApiError } from '../../../utils/errorHandler';
import BrandedLoader from '../../../components/common/BrandedLoader';

import ModelVillageStats from './ModelVillageStats';
import ModelVillageFilters from './ModelVillageFilters';
import ModelVillageTable from './ModelVillageTable';
import ModelVillageFormModal from './ModelVillageFormModal';
import CommonApprovalModal from '../../../components/common/CommonApprovalModal'; 
import ModelVillageDetailModal from './ModelVillageDetailModal'; // 1. IMPORT NEW COMPONENT

const { Title } = Typography;

export default function ModelVillageManagement() {
  const [data, setData] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  // Form Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);

  // Approval Modal States
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [approvingCertification, setApprovingCertification] = useState(null);

  // 2. NEW: Detail View States
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [viewingData, setViewingData] = useState(null);

  const fetchData = async () => {
    setIsFetching(true);
    try {
      const res = await modelVillageApi.getCertifications();
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
      if (editingData) await modelVillageApi.updateCertification(editingData.id, values);
      else await modelVillageApi.createCertification(values);
      message.success('Model Village record saved!');
      setModalOpen(false); 
      fetchData();
    } catch (err) { 
      handleApiError(err); 
    }
  };

  const handleDelete = async (id) => {
    try { 
      await modelVillageApi.deleteCertification(id); 
      message.success('Record deleted'); 
      fetchData(); 
    } catch (err) { 
      handleApiError(err); 
    }
  };

  const handleApprovalSubmit = async (entityId, values) => {
    setIsSubmitting(true);
    try {
      const response = await modelVillageApi.approveCertification(entityId, values);
      message.success(response.data.message || 'Model Village verification successfully saved');
      setIsApprovalModalOpen(false);
      await fetchData(); 
    } catch (error) {
      handleApiError(error, 'Failed to verify village certification');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'relative', minHeight: '100%' }}>
      {(isFetching || isSubmitting) && <BrandedLoader message={isSubmitting ? "Processing Verification..." : "Loading Certification Data..."} />}
      
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item><HomeOutlined /></Breadcrumb.Item>
        <Breadcrumb.Item>Social Inclusion</Breadcrumb.Item>
        <Breadcrumb.Item>Model Village Certifications</Breadcrumb.Item>
      </Breadcrumb>
      
      <Title level={3} style={{ marginBottom: 24, color: '#1a5f2c', fontFamily: "'Times New Roman', Times, serif" }}>
        Model Village Certifications
      </Title>

      <ModelVillageStats data={filteredData} />
      
      <ModelVillageFilters onSearch={setSearch} onAdd={() => { setEditingData(null); setModalOpen(true); }} dataToExport={filteredData} />
      
      <ModelVillageTable 
        data={filteredData} 
        onEdit={(r) => { setEditingData(r); setModalOpen(true); }} 
        onDelete={handleDelete} 
        onApprove={(r) => { setApprovingCertification(r); setIsApprovalModalOpen(true); }}
        // 3. NEW: Pass View handler
        onView={(r) => { setViewingData(r); setIsDetailModalOpen(true); }}
      />
      
      <ModelVillageFormModal open={modalOpen} onCancel={() => setModalOpen(false)} onSubmit={handleSave} editingData={editingData} />

      {/* 4. NEW: Include Detail Modal */}
      <ModelVillageDetailModal 
        open={isDetailModalOpen} 
        onCancel={() => setIsDetailModalOpen(false)} 
        data={viewingData} 
      />

      <CommonApprovalModal
        open={isApprovalModalOpen}
        onCancel={() => setIsApprovalModalOpen(false)}
        onSubmit={handleApprovalSubmit}
        isSubmitting={isSubmitting}
        title={`Verify Certification: Kebele ${approvingCertification?.kebele?.name || ''}`}
        itemName={`Kebele ${approvingCertification?.kebele?.name || ''}`}
        entityId={approvingCertification?.id}
        initialStatus={approvingCertification?.status}
        initialRemarks={approvingCertification?.approval?.remarks}
      />
    </div>
  );
}