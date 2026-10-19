import React, { useState, useEffect, useMemo } from 'react';
import { 
  Table, Card, Row, Col, Statistic, Button, Tag, Space, 
  Typography, Empty, Tooltip, message, Modal
} from 'antd';
import { 
  DatabaseOutlined, CheckCircleOutlined, CloseCircleOutlined,
  PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined, 
  ReloadOutlined, SyncOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

import agronomyApi from '../../../services/api/agronomyApi';
import BrandedLoader from '../../../components/common/BrandedLoader';
import { EditButton, DeleteButton } from '../../../components/common/ActionButtons';
import { handleApiError } from '../../../utils/errorHandler';

import SeedVarietyFilters from './SeedVarietyFilters';
import SeedVarietyForm from './SeedVarietyForm';

const { Title, Text } = Typography;

const CARD_STYLE_GREEN = { borderRight: '1px solid #f0f0f0', borderBottom: '3px solid #52c41a', borderRadius: 0, height: '100%', boxShadow: 'none' };
const CARD_STYLE_BLUE = { borderRight: '1px solid #f0f0f0', borderBottom: '3px solid #1890ff', borderRadius: 0, height: '100%', boxShadow: 'none' };
const CARD_STYLE_ORANGE = { borderRight: '1px solid #f0f0f0', borderBottom: '3px solid #fa8c16', borderRadius: 0, height: '100%', boxShadow: 'none' };
const CARD_STYLE_PURPLE = { borderRight: '1px solid #f0f0f0', borderBottom: '3px solid #722ed1', borderRadius: 0, height: '100%', boxShadow: 'none' };

const SeedVarietyManagement = () => {
  const [varieties, setVarieties] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [formVisible, setFormVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const [searchText, setSearchText] = useState('');
  const [cropTypeFilter, setCropTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const [stats, setStats] = useState({});

  const fetchVarieties = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchText) params.search = searchText;
      if (cropTypeFilter !== 'All') params.crop_type = cropTypeFilter;
      if (statusFilter !== 'All') params.status = statusFilter;

      const res = await agronomyApi.getSeedVarieties(params);
      setVarieties(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      handleApiError(error, 'Failed to fetch seed varieties');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await agronomyApi.getSeedStats();
      setStats(res.data || {});
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  useEffect(() => {
    fetchVarieties();
    fetchStats();
  }, []);

  useEffect(() => {
    fetchVarieties();
  }, [searchText, cropTypeFilter, statusFilter]);

  const refreshData = () => {
    fetchVarieties();
    fetchStats();
  };

  const handleDelete = async (id) => {
    try {
      await agronomyApi.deleteSeedVariety(id);
      message.success('Seed variety deleted successfully');
      refreshData();
    } catch (error) {
      handleApiError(error, 'Failed to delete seed variety');
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormVisible(true);
  };

  const handleAdd = () => {
    setEditingRecord(null);
    setFormVisible(true);
  };

  const handleFormSuccess = () => {
    setFormVisible(false);
    setEditingRecord(null);
    refreshData();
  };

  const handleFormCancel = () => {
    setFormVisible(false);
    setEditingRecord(null);
  };

  const exportToCSV = () => {
    if (varieties.length === 0) {
      message.warning('No data available to export.');
      return;
    }

    const headers = 'Name,Crop Type,Scientific Name,Seed Class,Germination Rate (%),Purity (%),Moisture (%),Certified,Status\n';

    const rows = varieties
      .map((item) => {
        return `"${item.name || ''}","${item.crop_type || ''}","${item.scientific_name || ''}","${item.seed_class || ''}",${item.germination_rate || 0},${item.purity_percentage || 0},${item.moisture_content || 0},"${item.is_certified ? 'Yes' : 'No'}","${item.status || ''}"`;
      })
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Seed_Varieties_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const columns = [
    { 
      title: 'Variety Name', 
      dataIndex: 'name', 
      key: 'name',
      width: 200,
      fixed: 'left',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          {record.scientific_name && (
            <div style={{ fontSize: 12, color: '#999' }}>{record.scientific_name}</div>
          )}
        </div>
      )
    },
    { 
      title: 'Crop Type', 
      dataIndex: 'crop_type', 
      key: 'crop_type',
      width: 120,
      render: (val) => <Tag color="blue">{val}</Tag>
    },
    { 
      title: 'Seed Class', 
      dataIndex: 'seed_class', 
      key: 'seed_class',
      width: 140,
      render: (val) => val || <Text type="secondary">-</Text>
    },
    { 
      title: 'Germination', 
      dataIndex: 'germination_rate', 
      key: 'germination_rate',
      width: 110,
      render: (val) => val ? <Tag color="green">{val}%</Tag> : <Text type="secondary">-</Text>
    },
    { 
      title: 'Purity', 
      dataIndex: 'purity_percentage', 
      key: 'purity_percentage',
      width: 100,
      render: (val) => val ? <Tag color="cyan">{val}%</Tag> : <Text type="secondary">-</Text>
    },
    { 
      title: 'Certified', 
      dataIndex: 'is_certified', 
      key: 'is_certified',
      width: 110,
      render: (val) => val ? 
        <Tag color="success" icon={<CheckCircleOutlined />}>Certified</Tag> : 
        <Tag color="default">Uncertified</Tag>
    },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status',
      width: 110,
      render: (val) => {
        const colors = { active: 'success', inactive: 'default', archived: 'default' };
        return <Tag color={colors[val] || 'default'}>{val}</Tag>;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 160,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit">
            <EditButton onClick={() => handleEdit(record)} />
          </Tooltip>
          <DeleteButton
            itemName={`Variety ${record.name}`}
            onConfirm={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#fff' }}>
      {loading && <BrandedLoader message="Loading Seed Varieties..." />}

      <div style={{ background: '#fff', padding: '16px', marginBottom: 16, borderBottom: '1px solid #f0f0f0' }}>
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col>
            <Title level={3} style={{ marginBottom: 0 }}>
              🌾 Seed Variety Management
            </Title>
            <Text type="secondary">
              Manage seed varieties, quality metrics, and certification status
            </Text>
          </Col>
          <Col>
            <Button icon={<ReloadOutlined />} onClick={refreshData}>
              Refresh
            </Button>
          </Col>
        </Row>
      </div>

      <div style={{ padding: '0 16px 16px' }}>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} style={CARD_STYLE_GREEN}>
              <Statistic 
                title="Total Varieties" 
                value={stats.total_varieties || varieties.length} 
                prefix={<DatabaseOutlined style={{ color: '#52c41a' }} />} 
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} style={CARD_STYLE_BLUE}>
              <Statistic 
                title="Active Varieties" 
                value={varieties.filter(v => v.status === 'active').length} 
                prefix={<CheckCircleOutlined style={{ color: '#1890ff' }} />} 
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} style={CARD_STYLE_ORANGE}>
              <Statistic 
                title="Certified" 
                value={varieties.filter(v => v.is_certified).length} 
                prefix={<SyncOutlined style={{ color: '#fa8c16' }} />} 
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} style={CARD_STYLE_PURPLE}>
              <Statistic 
                title="Crop Types" 
                value={[...new Set(varieties.map(v => v.crop_type))].length} 
                prefix={<DatabaseOutlined style={{ color: '#722ed1' }} />} 
              />
            </Card>
          </Col>
        </Row>

        <SeedVarietyFilters
          searchText={searchText}
          setSearchText={setSearchText}
          cropTypeFilter={cropTypeFilter}
          setCropTypeFilter={setCropTypeFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          onExport={exportToCSV}
          onAdd={handleAdd}
        />

        <Card bordered={false} style={{ borderRadius: 0, boxShadow: 'none', borderRight: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0' }}>
          {varieties.length === 0 && !loading ? (
            <Empty description="No seed varieties found. Click 'Add Variety' to create one." />
          ) : (
            <Table
              columns={columns}
              dataSource={varieties}
              rowKey="id"
              loading={loading}
              pagination={{ 
                pageSize: 10, 
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
              }}
              scroll={{ x: 1100 }}
            />
          )}
        </Card>
      </div>

      <SeedVarietyForm
        visible={formVisible}
        onCancel={handleFormCancel}
        onSuccess={handleFormSuccess}
        editingRecord={editingRecord}
      />

      <style jsx global>{`
        .ant-table-thead > tr > th {
          background: #fafafa !important;
          font-weight: 600 !important;
        }
        .ant-card {
          border-radius: 0 !important;
          border-top: none !important;
          border-left: none !important;
        }
        .ant-card:hover {
          box-shadow: none !important;
        }
        .ant-table {
          border-radius: 0 !important;
        }
        .ant-table-container {
          border-radius: 0 !important;
        }
        .ant-modal .ant-modal-content {
          border-radius: 8px;
        }
        .ant-modal .ant-modal-header {
          border-bottom: 1px solid #f0f0f0;
          margin-bottom: 16px;
        }
      `}</style>
    </div>
  );
};

export default SeedVarietyManagement;