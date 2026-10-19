import React, { useState, useEffect, useMemo } from 'react';
import { message, Breadcrumb, Typography } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { trainingEventApi } from '../../../services/api/trainingEventApi';
import { handleApiError } from '../../../utils/errorHandler';
import BrandedLoader from '../../../components/common/BrandedLoader';

import TrainingStats from './TrainingStats';
import TrainingFilters from './TrainingFilters';
import TrainingTable from './TrainingTable';
import TrainingFormModal from './TrainingFormModal';
import CommonApprovalModal from '../../../components/common/CommonApprovalModal'; // 1. IMPORT COMMON REUSABLE MODAL

const { Title } = Typography;

export default function TrainingEventsManagement() {
  const [events, setEvents] = useState([]);
  
  const [isFetching, setIsFetching] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState(null);

  // States for standard form modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  // 2. NEW: STATES FOR THE REUSABLE APPROVAL MODAL
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [approvingEvent, setApprovingEvent] = useState(null);

  const fetchEvents = async () => {
    setIsFetching(true);
    try {
      const response = await trainingEventApi.getEvents();
      setEvents(response.data.data.data || response.data.data || []);
    } catch (error) {
      handleApiError(error, 'Failed to load Training Events');
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = event.topic?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            event.demonstrated_technology?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter ? event.event_type === typeFilter : true;
      return matchesSearch && matchesType;
    });
  }, [events, searchTerm, typeFilter]);

  const handleFormSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      if (editingEvent) {
        await trainingEventApi.updateEvent(editingEvent.id, values);
        message.success('Event Updated successfully');
      } else {
        await trainingEventApi.createEvent(values);
        message.success('Event Recorded successfully');
      }
      setIsModalOpen(false);
      await fetchEvents();
    } catch (error) {
      handleApiError(error, 'Failed to save event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setIsSubmitting(true);
    try {
      await trainingEventApi.deleteEvent(id);
      message.success('Event Deleted Successfully');
      await fetchEvents();
    } catch (error) {
      handleApiError(error, 'Failed to delete event');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. NEW: HANDLER FOR SUBMITTING VERIFICATION LOGIC
  const handleApprovalSubmit = async (entityId, values) => {
    setIsSubmitting(true);
    try {
      const response = await trainingEventApi.approveEvent(entityId, values);
      message.success(response.data.message || 'Training event verification successfully saved');
      setIsApprovalModalOpen(false);
      await fetchEvents(); // Refresh data to show updated Verification Tags
    } catch (error) {
      handleApiError(error, 'Failed to verify training event');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'relative', minHeight: '100%' }}>
      {(isFetching || isSubmitting) && (
        <BrandedLoader message={isSubmitting ? "Processing Request..." : "Loading Data..."} />
      )}

      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item><HomeOutlined /></Breadcrumb.Item>
        <Breadcrumb.Item>Extension & Experts</Breadcrumb.Item>
        <Breadcrumb.Item>Training & Events</Breadcrumb.Item>
      </Breadcrumb>

      <Title level={3} style={{ marginBottom: 24, color: '#1a5f2c', fontFamily: "'Times New Roman', Times, serif" }}>
        Training & Capacity Building
      </Title>

      <TrainingStats events={filteredEvents} />

      <TrainingFilters 
        onSearch={setSearchTerm} 
        onFilterType={setTypeFilter} 
        onAdd={() => { setEditingEvent(null); setIsModalOpen(true); }} 
        dataToExport={filteredEvents} 
      />

      <TrainingTable 
        data={filteredEvents} 
        onEdit={(record) => { setEditingEvent(record); setIsModalOpen(true); }} 
        onDelete={handleDelete} 
        // 4. Pass the Approve trigger to the table
        onApprove={(record) => { setApprovingEvent(record); setIsApprovalModalOpen(true); }}
      />

      <TrainingFormModal 
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        editingEvent={editingEvent}
      />

      {/* 5. PORTAL THE REUSABLE COMMON APPROVAL MODAL */}
      <CommonApprovalModal
        open={isApprovalModalOpen}
        onCancel={() => setIsApprovalModalOpen(false)}
        onSubmit={handleApprovalSubmit}
        isSubmitting={isSubmitting}
        title={`Verify Capacity Event: ${approvingEvent?.topic || ''}`}
        itemName={approvingEvent?.topic || ''}
        entityId={approvingEvent?.id}
        initialStatus={approvingEvent?.status}
        initialRemarks={approvingEvent?.approval?.remarks}
      />
    </div>
  );
}