import React, { useState, useEffect } from 'react';
import { Breadcrumb, Typography, Table, Tag, Card, Button, Input, message, Popconfirm, Space, Tooltip } from 'antd';
import { HomeOutlined, SearchOutlined, DeleteOutlined, AuditOutlined } from '@ant-design/icons';
import { psnpApi } from '../../services/api/psnpApi';
import BrandedLoader from '../../components/common/BrandedLoader';
import CommonApprovalModal from '../../components/common/CommonApprovalModal'; // IMPORT COMMON REUSABLE MODAL

const { Title } = Typography;

export default function TransferList() {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchText, setSearchText] = useState('');

  // NEW STATES FOR AUDIT MANAGEMENT
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [approvingTransfer, setApprovingTransfer] = useState(null);

  const fetchTransfers = async () => {
    setLoading(true);
    try {
      const res = await psnpApi.getAllTransfers();
      setTransfers(res.data.data || []);
    } catch (error) {
      message.error('Failed to load transfers data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfers();
  }, []);

  const handleDelete = async (id) => {
    try {
      await psnpApi.deleteTransfer(id);
      message.success('Transfer record deleted successfully');
      fetchTransfers();
    } catch (error) {
      message.error('Failed to delete transfer.');
    }
  };

  // NEW: TRIGGER THE REUSABLE AUDIT MODAL
  const handleApproveClick = (record) => {
    setApprovingTransfer(record);
    setIsApprovalModalOpen(true);
  };

  // NEW: UNIFIED REUSABLE AUDIT SUBMISSION LOGIC
  const handleApprovalSubmit = async (entityId, values) => {
    setIsSubmitting(true);
    try {
      const response = await psnpApi.approveTransfer(entityId, values);
      message.success(response.data.message || 'Transfer verification updated successfully');
      setIsApprovalModalOpen(false);
      await fetchTransfers(); // Refresh database grid
    } catch (error) {
      message.error('Failed to save transfer log verification status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      title: 'Transfer Date',
      dataIndex: 'transfer_date',
      key: 'transfer_date',
      sorter: (a, b) => new Date(a.transfer_date) - new Date(b.transfer_date),
    },
    {
      title: 'Farmer Name',
      key: 'farmer_name',
      render: (_, record) => record.household?.farmer?.full_name || 'N/A'
    },
    {
      title: 'Woreda',
      key: 'woreda',
      render: (_, record) => record.household?.farmer?.kebele?.woreda?.name || 'N/A'
    },
    {
      title: 'Month / Cycle',
      dataIndex: 'transfer_month_cycle',
      key: 'transfer_month_cycle',
    },
    {
      title: 'Type',
      dataIndex: 'transfer_type',
      key: 'transfer_type',
      render: (type) => {
        let color = type === 'Cash' ? 'green' : type === 'Grain' ? 'orange' : 'blue';
        return <Tag color={color}>{type}</Tag>;
      }
    },
    {
      title: 'Amount (Birr)',
      dataIndex: 'amount_birr',
      key: 'amount_birr',
      render: (val) => val ? `${Number(val).toLocaleString()} ETB` : '-'
    },
    {
      title: 'Grain (MT)',
      dataIndex: 'amount_metric_tons',
      key: 'amount_metric_tons',
      render: (val) => val ? `${val} MT` : '-'
    },
    {
      title: 'Approval Status', // NEW: Core Verification Tag Column
      dataIndex: 'status',
      key: 'approval_status',
      align: 'center',
      render: (status) => {
        let color = 'orange'; // Default for Pending
        if (status === 'Approved') color = 'green';
        if (status === 'Rejected') color = 'red';
        return <Tag color={color} style={{ fontWeight: 500, margin: 0 }}>{status || 'Pending'}</Tag>;
      }
    },
    {
      title: 'Action',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          {/* NEW: Audit Process Trigger */}
          <Tooltip title="Verify Transfer Log">
            <Button 
              type="text" 
              icon={<AuditOutlined style={{ color: '#fa8c16' }} />} 
              onClick={(e) => { e.stopPropagation(); handleApproveClick(record); }} 
            />
          </Tooltip>

          <Popconfirm
            title="Delete this transfer?"
            description="Are you sure to delete this record?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger type="text" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Filter Data
  const filteredData = transfers.filter(t => 
    t.household?.farmer?.full_name?.toLowerCase().includes(searchText.toLowerCase()) ||
    t.transfer_month_cycle?.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div style={{ position: 'relative', minHeight: '100%' }}>
      {(loading || isSubmitting) && <BrandedLoader message={isSubmitting ? "Processing Verification..." : "Loading Transfer Data..."} />}
      
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item><HomeOutlined /></Breadcrumb.Item>
        <Breadcrumb.Item>Social Inclusion</Breadcrumb.Item>
        <Breadcrumb.Item>Transfer Reconciliation</Breadcrumb.Item>
      </Breadcrumb>
      
      <Title level={3} style={{ marginBottom: 24, color: '#1a5f2c', fontFamily: "'Times New Roman', Times, serif" }}>
        PSNP Transfer Reconciliation
      </Title>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Input 
            placeholder="Search by Farmer Name or Cycle..." 
            prefix={<SearchOutlined />} 
            style={{ width: 300 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        <Table 
          columns={columns} 
          dataSource={filteredData} 
          rowKey="id" 
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* PORTAL THE REUSABLE COMMON APPROVAL MODAL */}
      <CommonApprovalModal
        open={isApprovalModalOpen}
        onCancel={() => setIsApprovalModalOpen(false)}
        onSubmit={handleApprovalSubmit}
        isSubmitting={isSubmitting}
        title={`Verify Transfer Log: ${approvingTransfer?.household?.farmer?.full_name || ''}`}
        itemName={`${approvingTransfer?.transfer_month_cycle || ''} Cycle for ${approvingTransfer?.household?.farmer?.full_name || ''}`}
        entityId={approvingTransfer?.id}
        initialStatus={approvingTransfer?.status}
        initialRemarks={approvingTransfer?.approval?.remarks}
      />
    </div>
  );
}