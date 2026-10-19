import React, { useState, useEffect, useMemo } from 'react';
import { Breadcrumb, Typography, message } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { psnpApi } from '../../services/api/psnpApi';
import { handleApiError } from '../../utils/errorHandler';
import BrandedLoader from '../../components/common/BrandedLoader';

// Sub-components
import PsnpStats from './PsnpStats';
import PsnpFilters from './PsnpFilters';
import PsnpTable from './PsnpTable';
import PsnpHouseholdModal from './PsnpHouseholdModal';
import PsnpTransferModal from './PsnpTransferModal';
import CommonApprovalModal from '../../components/common/CommonApprovalModal'; // 1. IMPORT COMMON REUSABLE MODAL

const { Title } = Typography;

export default function PsnpManagement() {
  const [households, setHouseholds] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Filtering States
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState(null);

  // Modal States
  const [hhModalOpen, setHhModalOpen] = useState(false);
  const [editingHh, setEditingHh] = useState(null);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [selectedHhForTransfer, setSelectedHhForTransfer] = useState(null);

  // 2. NEW STATES FOR AUDIT MANAGEMENT
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [approvingHh, setApprovingHh] = useState(null);

  const fetchHouseholds = async () => {
    setIsFetching(true);
    try {
      const res = await psnpApi.getHouseholds();
      setHouseholds(res.data.data || []);
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => { fetchHouseholds(); }, []);

  // Search & Filter Logic
  const filteredData = useMemo(() => {
    return households.filter(h => {
      const matchesSearch = h.farmer?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
                            h.farmer?.farmer_unique_id_no?.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter ? h.targeting_type === typeFilter : true;
      return matchesSearch && matchesType;
    });
  }, [households, search, typeFilter]);

  // Actions
  const handleDeleteHh = async (id) => {
    try { 
        await psnpApi.deleteHousehold(id); 
        message.success('Removed from PSNP'); 
        fetchHouseholds(); 
    } catch (e) { 
        handleApiError(e); 
    }
  };

  const handleDeleteTransfer = async (id) => {
    try { 
        await psnpApi.deleteTransfer(id); 
        message.success('Transfer deleted'); 
        fetchHouseholds(); 
    } catch (e) { 
        handleApiError(e); 
    }
  };

  const handleGraduate = async (record) => {
    try {
      await psnpApi.updateHousehold(record.id, { 
          targeting_type: record.targeting_type, 
          is_graduated: true 
      });
      message.success(`${record.farmer?.full_name} has graduated from PSNP!`);
      fetchHouseholds();
    } catch (e) { 
        handleApiError(e); 
    }
  };

  // 3. NEW HANDLER FOR SUBMITTING VERIFICATION LOGIC
  const handleApprovalSubmit = async (entityId, values) => {
    setIsSubmitting(true);
    try {
      const response = await psnpApi.approveHousehold(entityId, values);
      message.success(response.data.message || 'Household verification successfully logged');
      setIsApprovalModalOpen(false);
      await fetchHouseholds(); // Refresh database grid to show updated status tags
    } catch (error) {
      handleApiError(error, 'Failed to verify safety net profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'relative', minHeight: '100%' }}>
      {(isFetching || isSubmitting) && <BrandedLoader message={isSubmitting ? "Processing Verification..." : "Loading PSNP Data..."} />}
      
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item><HomeOutlined /></Breadcrumb.Item>
        <Breadcrumb.Item>Social Inclusion</Breadcrumb.Item>
        <Breadcrumb.Item>PSNP Targeting</Breadcrumb.Item>
      </Breadcrumb>
      
      <Title level={3} style={{ marginBottom: 24, color: '#1a5f2c', fontFamily: "'Times New Roman', Times, serif" }}>
        Productive Safety Net Program (PSNP)
      </Title>

      <PsnpStats households={filteredData} />

      <PsnpFilters 
        onSearch={setSearch} 
        onFilterType={setTypeFilter}
        onAdd={() => { setEditingHh(null); setHhModalOpen(true); }} 
        dataToExport={filteredData} 
      />

      <PsnpTable 
        data={filteredData} 
        onEdit={(record) => { setEditingHh(record); setHhModalOpen(true); }} 
        onDelete={handleDeleteHh}
        onGraduate={handleGraduate}
        onAddTransfer={(record) => { setSelectedHhForTransfer(record); setTransferModalOpen(true); }}
        onDeleteTransfer={handleDeleteTransfer}
        // 4. Pass the Approve handler to table
        onApprove={(record) => { setApprovingHh(record); setIsApprovalModalOpen(true); }}
      />

      <PsnpHouseholdModal 
        open={hhModalOpen} 
        onCancel={() => setHhModalOpen(false)} 
        editingHh={editingHh} 
        refresh={fetchHouseholds} 
      />
      
      <PsnpTransferModal 
        open={transferModalOpen} 
        onCancel={() => setTransferModalOpen(false)} 
        household={selectedHhForTransfer} 
        refresh={fetchHouseholds} 
      />

      {/* 5. PORTAL THE REUSABLE COMMON APPROVAL MODAL */}
      <CommonApprovalModal
        open={isApprovalModalOpen}
        onCancel={() => setIsApprovalModalOpen(false)}
        onSubmit={handleApprovalSubmit}
        isSubmitting={isSubmitting}
        title={`Verify PSNP Profile: ${approvingHh?.farmer?.full_name || ''}`}
        itemName={approvingHh?.farmer?.full_name || ''}
        entityId={approvingHh?.id}
        initialStatus={approvingHh?.status}
        initialRemarks={approvingHh?.approval?.remarks}
      />
    </div>
  );
}