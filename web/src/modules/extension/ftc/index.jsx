import React, { useState, useEffect, useMemo } from 'react';
import { message, Typography, Breadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { extensionApi } from '../../../services/api/extensionApi';
import { handleApiError } from '../../../utils/errorHandler';
import BrandedLoader from '../../../components/common/BrandedLoader';

import FtcStats from './FtcStats';
import FtcFilters from './FtcFilters';
import FtcTable from './FtcTable';
import FtcFormModal from './FtcFormModal';
import FtcDetailsModal from './FtcDetailsModal'; 
import CommonApprovalModal from '../../../components/common/CommonApprovalModal'; // 1. IMPORT COMMON MODAL

const { Title } = Typography;

export default function FtcManagement() {
  const [ftcs, setFtcs] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [capacityFilter, setCapacityFilter] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFtc, setEditingFtc] = useState(null);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewFtc, setViewFtc] = useState(null);

  // 2. NEW STATES FOR APPROVAL
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [approvingFtc, setApprovingFtc] = useState(null);

  const fetchFtcs = async () => {
    setIsFetching(true);
    try {
      const response = await extensionApi.getFtcs();
      setFtcs(response.data.data.data || response.data.data || []); 
    } catch (error) {
      handleApiError(error, 'Failed to load FTCs');
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => { fetchFtcs(); }, []);

  const filteredFtcs = useMemo(() => {
    return ftcs.filter(ftc => {
      const matchesSearch = ftc.ftc_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLevel = capacityFilter ? ftc.capacity_level === capacityFilter : true;
      return matchesSearch && matchesLevel;
    });
  }, [ftcs, searchTerm, capacityFilter]);

  const handleFormSubmit = async (values) => {
    setIsSubmitting(true); 
    try {
      if (editingFtc) {
        await extensionApi.updateFtc(editingFtc.id, values);
        message.success('FTC Updated successfully');
      } else {
        await extensionApi.createFtc(values);
        message.success('FTC Registered successfully');
      }
      setIsModalOpen(false);
      await fetchFtcs(); 
    } catch (error) {
      handleApiError(error, 'Failed to save FTC');
    } finally {
      setIsSubmitting(false); 
    }
  };

  const handleDelete = async (id) => {
    setIsSubmitting(true);
    try {
      await extensionApi.deleteFtc(id);
      message.success('FTC Deleted');
      await fetchFtcs();
    } catch (error) {
      handleApiError(error, 'Failed to delete FTC');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. NEW APPROVAL SUBMIT HANDLER
  const handleApprovalSubmit = async (entityId, values) => {
    setIsSubmitting(true);
    try {
      const response = await extensionApi.approveFtc(entityId, values);
      message.success(response.data.message || 'FTC approval processed successfully');
      setIsApprovalModalOpen(false);
      await fetchFtcs(); 
    } catch (error) {
      handleApiError(error, 'Failed to process approval');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'relative', minHeight: '100%' }}>
      {(isFetching || isSubmitting) && <BrandedLoader message={isSubmitting ? "Processing..." : "Loading Data..."} />}

      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item><HomeOutlined /></Breadcrumb.Item>
        <Breadcrumb.Item>Extension & Experts</Breadcrumb.Item>
        <Breadcrumb.Item>FTC Management</Breadcrumb.Item>
      </Breadcrumb>

      <Title level={3} style={{ marginBottom: 24, color: '#1a5f2c', fontFamily: "'Times New Roman', Times, serif" }}>
        Farmer Training Centers (FTCs)
      </Title>

      <FtcStats ftcs={filteredFtcs} />

      <FtcFilters 
        onSearch={setSearchTerm} 
        onFilterLevel={setCapacityFilter} 
        onAdd={() => { setEditingFtc(null); setIsModalOpen(true); }} 
        rawData={filteredFtcs} 
      />

      <FtcTable 
        data={filteredFtcs} 
        onEdit={(record) => { setEditingFtc(record); setIsModalOpen(true); }} 
        onDelete={handleDelete}
        onView={(record) => { setViewFtc(record); setIsViewModalOpen(true); }}
        // 4. Pass the Approve handler to the table
        onApprove={(record) => { setApprovingFtc(record); setIsApprovalModalOpen(true); }}
      />

      <FtcFormModal 
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        loading={false} 
        editingFtc={editingFtc}
      />

      <FtcDetailsModal 
        open={isViewModalOpen}
        onClose={() => { setIsViewModalOpen(false); setViewFtc(null); }}
        ftc={viewFtc}
      />

      {/* 5. ADD THE COMMON APPROVAL MODAL */}
      <CommonApprovalModal
        open={isApprovalModalOpen}
        onCancel={() => setIsApprovalModalOpen(false)}
        onSubmit={handleApprovalSubmit}
        isSubmitting={isSubmitting}
        title={`Approve FTC: ${approvingFtc?.ftc_name || ''}`}
        itemName={approvingFtc?.ftc_name || ''}
        entityId={approvingFtc?.id}
        initialStatus={approvingFtc?.status}
        initialRemarks={approvingFtc?.approval?.remarks}
      />
    </div>
  );
}