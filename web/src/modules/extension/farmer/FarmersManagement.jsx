import React, { useState, useEffect, useMemo } from 'react';
import { message, Breadcrumb, Typography } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { farmerApi } from '../../../services/api/farmerApi';
import { handleApiError } from '../../../utils/errorHandler';
import BrandedLoader from '../../../components/common/BrandedLoader';

import FarmerStats from './FarmerStats';
import FarmerFilters from './FarmerFilters';
import FarmerTable from './FarmerTable';
import FarmerMultiStepModal from './FarmerMultiStepModal';
import FarmerApprovalModal from './FarmerApprovalModal';

const { Title } = Typography;

export default function FarmersManagement() {
  const [farmers, setFarmers] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState(null);

  // States for Edit/Create Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFarmer, setEditingFarmer] = useState(null);

  // States for Approval Modal
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [approvingFarmer, setApprovingFarmer] = useState(null);

  const fetchFarmers = async () => {
    setIsFetching(true);
    try {
      const response = await farmerApi.getFarmers();
      setFarmers(response.data.data.data || response.data.data || []);
    } catch (error) {
      handleApiError(error, 'Failed to load Farmers');
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => { 
    fetchFarmers(); 
  }, []);

  const filteredFarmers = useMemo(() => {
    return farmers.filter((f) => {
      const matchesSearch =
        f.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        f.farmer_unique_id_no?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter ? f.farmer_type === typeFilter : true;
      return matchesSearch && matchesType;
    });
  }, [farmers, searchTerm, typeFilter]);

  const handleFormSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      if (editingFarmer) {
        await farmerApi.updateFarmer(editingFarmer.id, values);
        message.success('Farmer Updated successfully');
      } else {
        await farmerApi.createFarmer(values);
        message.success('Farmer Registered successfully');
      }
      setIsModalOpen(false);
      await fetchFarmers();
    } catch (error) {
      handleApiError(error, 'Failed to save Farmer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setIsSubmitting(true);
    try {
      await farmerApi.deleteFarmer(id);
      message.success('Farmer Deleted');
      await fetchFarmers();
    } catch (error) {
      handleApiError(error, 'Failed to delete Farmer');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Approval Submit
  const handleApprovalSubmit = async (farmerId, values) => {
    setIsSubmitting(true);
    try {
      const response = await farmerApi.approveFarmer(farmerId, values);
      message.success(response.data.message || 'Farmer approval processed successfully');
      setIsApprovalModalOpen(false);
      await fetchFarmers(); 
    } catch (error) {
      handleApiError(error, 'Failed to process approval');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'relative', minHeight: '100%' }}>
      {(isFetching || isSubmitting) && (
        <BrandedLoader message={isSubmitting ? "Processing..." : "Loading Data..."} />
      )}

      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item><HomeOutlined /></Breadcrumb.Item>
        <Breadcrumb.Item>Extension & Experts</Breadcrumb.Item>
        <Breadcrumb.Item>Farmer Registry</Breadcrumb.Item>
      </Breadcrumb>

      <Title level={3} style={{ marginBottom: 24, color: '#1a5f2c', fontFamily: "'Times New Roman', Times, serif" }}>
        Farmer & Household Registry
      </Title>

      <FarmerStats farmers={filteredFarmers} />

      <FarmerFilters 
        onSearch={setSearchTerm} 
        onFilterType={setTypeFilter} 
        onAdd={() => { setEditingFarmer(null); setIsModalOpen(true); }} 
        dataToExport={filteredFarmers} 
      />

      <FarmerTable 
        data={filteredFarmers} 
        onEdit={(record) => { setEditingFarmer(record); setIsModalOpen(true); }} 
        onDelete={handleDelete}
        onApprove={(record) => { setApprovingFarmer(record); setIsApprovalModalOpen(true); }} 
      />

      {/* Registration/Edit Modal with conditional mobile, cooperative & disability logic */}
      <FarmerMultiStepModal 
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        editingFarmer={editingFarmer}
      />

      {/* Approval Modal */}
      <FarmerApprovalModal
        open={isApprovalModalOpen}
        onCancel={() => setIsApprovalModalOpen(false)}
        onSubmit={handleApprovalSubmit}
        farmer={approvingFarmer}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}