import React, { useState, useEffect } from 'react';
import { Breadcrumb, Typography, message } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { landUseApi } from '../../../services/api/landUseApi';
import { handleApiError } from '../../../utils/errorHandler';
import BrandedLoader from '../../../components/common/BrandedLoader';

import LandUseFilters from './LandUseFilters';
import LandUseTable from './LandUseTable';
import LandUseFormModal from './LandUseFormModal';

const { Title } = Typography;

export default function LandUseManagement() {
  const [data, setData] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);

  // Fetch all land use records using the API abstraction
  const fetchData = async () => {
    setIsFetching(true);
    try {
      const res = await landUseApi.getLandUseClassifications();
      setData(res.data.data || []);
    } catch (err) { 
      if (typeof handleApiError === 'function') {
        handleApiError(err);
      } else {
        message.error('Failed to parse land use records');
      }
    } finally { 
      setIsFetching(false); 
    }
  };

  useEffect(() => { 
    fetchData(); 
  }, []);

  // Filter records locally by reporting year
  const filteredData = data.filter(d => 
    !search || d.year?.toString().includes(search)
  );

  // Handle both Create and Update operations using the API abstraction
  const handleSave = async (values) => {
    try {
      if (editingData) {
        await landUseApi.updateLandUseClassification(editingData.id, values);
        message.success('Land use configurations updated!');
      } else {
        await landUseApi.createLandUseClassification(values);
        message.success('New land use metrics logged successfully!');
      }
      setModalOpen(false); 
      fetchData();
    } catch (err) { 
      if (typeof handleApiError === 'function') {
        handleApiError(err);
      } else {
        message.error('Could not complete database transaction');
      }
    }
  };

  // Handle Delete operations using the API abstraction
  const handleDelete = async (id) => {
    try { 
      await landUseApi.deleteLandUseClassification(id); 
      message.success('Log wiped out successfully'); 
      fetchData(); 
    } catch (err) { 
      if (typeof handleApiError === 'function') {
        handleApiError(err);
      } else {
        message.error('Deletion operation halted');
      }
    }
  };

  return (
    <div style={{ position: 'relative', minHeight: '100%' }}>
      {/* Branded loading overlay spinner */}
      {isFetching && <BrandedLoader message="Loading Land Classifications Matrix..." />}
      
      {/* System Navigation Breadcrumb */}
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item><HomeOutlined /></Breadcrumb.Item>
        <Breadcrumb.Item>Natural Resources</Breadcrumb.Item>
        <Breadcrumb.Item>Land Use Classifications</Breadcrumb.Item>
      </Breadcrumb>
      
      {/* Dynamic Header section */}
      <Title level={3} style={{ marginBottom: 24, color: '#1a5f2c', fontFamily: "'Times New Roman', Times, serif" }}>
        Land Use Classifications Metrics
      </Title>

      {/* Control Layer Filters, Search bar and Export buttons */}
      <LandUseFilters 
        onSearch={setSearch} 
        onAdd={() => { 
          setEditingData(null); 
          setModalOpen(true); 
        }} 
        dataToExport={filteredData} 
      />

      {/* Primary Data Interfacing Grid View */}
      <LandUseTable 
        data={filteredData} 
        onEdit={(record) => { 
          setEditingData(record); 
          setModalOpen(true); 
        }} 
        onDelete={handleDelete} 
      />

      {/* Creation and Modification Drawer Dialog Box Component */}
      <LandUseFormModal 
        open={modalOpen} 
        onCancel={() => setModalOpen(false)} 
        onSubmit={handleSave} 
        editingData={editingData} 
      />
    </div>
  );
}