import React, { useState, useEffect, useMemo } from 'react';
import {
  Table, Card, Row, Col, Statistic, Button, Tag, Space, Input, Modal,
  Typography, Select, Tooltip, notification
} from 'antd';
import {
  PlusOutlined, SearchOutlined, DownloadOutlined, EyeOutlined,
  AreaChartOutlined, DashboardOutlined, SafetyCertificateOutlined,
  QrcodeOutlined
} from '@ant-design/icons';

import { EditButton, DeleteButton } from '../../components/common/ActionButtons';
import BrandedLoader from '../../components/common/BrandedLoader';
import agronomyApi from '../../services/api/agronomyApi';
import SeedMultiplicationForm from './SeedMultiplicationForm';

const { Title, Text } = Typography;
const { Option } = Select;

// Modernized styles using subtle borders instead of heavy bottom bars
const CARD_STYLE_BASE = { borderRadius: '6px', height: '100%', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)' };
const CARD_STYLE_BLUE = { ...CARD_STYLE_BASE, borderLeft: '4px solid #1890ff' };
const CARD_STYLE_GREEN = { ...CARD_STYLE_BASE, borderLeft: '4px solid #52c41a' };
const CARD_STYLE_ORANGE = { ...CARD_STYLE_BASE, borderLeft: '4px solid #fa8c16' };

const SeedMultiplication = () => {
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState({});
  const [data, setData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({
    producer_type: 'All',
    seed_generation: 'All',
    inspection_status: 'All'
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewingRecord, setViewingRecord] = useState(null);

  // =========================
  // FETCH DATA
  // =========================
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await agronomyApi.getSeedMultiplications();
      setData(Array.isArray(response?.data?.data) ? response.data.data : response.data || []);
    } catch (error) {
      notification.error({
        message: 'Fetch Error',
        description: 'Failed to load seed multiplication records.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // =========================
  // DELETE HANDLER
  // =========================
  const handleDelete = async (id) => {
    setDeleteLoading(prev => ({ ...prev, [id]: true }));
    try {
      if (agronomyApi.deleteSeedMultiplication) {
        await agronomyApi.deleteSeedMultiplication(id);
      }
      notification.success({ message: 'Success', description: 'Record deleted successfully.' });
      fetchData();
    } catch (error) {
      notification.error({
        message: 'Delete Error',
        description: error.response?.data?.message || 'Failed to delete record.'
      });
    } finally {
      setDeleteLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  // =========================
  // ANALYTICS (useMemo)
  // =========================
  const stats = useMemo(() => {
    const totalRecords = data.length;
    const totalArea = data.reduce((sum, item) => sum + Number(item.allocated_area_hectares || 0), 0);
    const totalProduced = data.reduce((sum, item) => sum + Number(item.quantity_produced_quintals || 0), 0);
    const approvedCount = data.filter(item => item.inspection_status === 'Field Approved' || item.inspection_status === 'Lab Certified').length;

    return { totalRecords, totalArea, totalProduced, approvedCount };
  }, [data]);

  // =========================
  // FILTER LOGIC
  // =========================
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchSearch = (item.producer_name + item.contract_number + item.crop_commodity)
        .toLowerCase().includes(searchText.toLowerCase());
      const matchType = filters.producer_type === 'All' || item.producer_type === filters.producer_type;
      const matchGen = filters.seed_generation === 'All' || item.seed_generation === filters.seed_generation;
      const matchStatus = filters.inspection_status === 'All' || item.inspection_status === filters.inspection_status;
      
      return matchSearch && matchType && matchGen && matchStatus;
    });
  }, [data, searchText, filters]);

  // =========================
  // HANDLERS
  // =========================
  const handleExport = () => {
    const headers = ['Tracking Code', 'Producer', 'Type', 'Commodity', 'Generation', 'Contract', 'Area (ha)', 'Produced (qt)', 'Status'];
    const rows = filteredData.map(item => [
      item.tracking_code, item.producer_name, item.producer_type, item.crop_commodity, 
      item.seed_generation, item.contract_number, item.allocated_area_hectares, 
      item.quantity_produced_quintals, item.inspection_status
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `seed_multiplication_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = [
    {
      title: 'Tracking Code',
      dataIndex: 'tracking_code',
      key: 'tracking_code',
      render: (code) => <Tag color="blue" icon={<QrcodeOutlined />} className="font-mono">{code}</Tag>
    },
    {
      title: 'Producer',
      dataIndex: 'producer_name',
      key: 'producer',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>{record.producer_type}</Text>
        </Space>
      )
    },
    {
      title: 'Commodity',
      dataIndex: 'crop_commodity',
      key: 'commodity',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'Generation',
      dataIndex: 'seed_generation',
      key: 'gen',
      render: (gen) => <Tag color="purple">{gen}</Tag>
    },
    {
      title: 'Area (ha)',
      dataIndex: 'allocated_area_hectares',
      key: 'area',
      render: (val) => <Text>{Number(val).toFixed(2)} ha</Text>
    },
    {
      title: 'Status',
      dataIndex: 'inspection_status',
      key: 'status',
      render: (status) => {
        const colors = { 'Pending': 'warning', 'Field Approved': 'processing', 'Lab Certified': 'success', 'Field Rejected': 'error' };
        return <Tag color={colors[status]}>{status}</Tag>;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      align: 'center',
      render: (_, record) => (
        <Space size={2}>
          <Tooltip title="View Details">
            <Button 
              type="text" 
              size="small"
              icon={<EyeOutlined style={{ color: '#8c8c8c' }} />} 
              onClick={() => { setViewingRecord(record); setViewModalVisible(true); }} 
            />
          </Tooltip>
          <EditButton onClick={() => { setEditingRecord(record); setModalVisible(true); }} />
          <DeleteButton 
            itemName={`Contract ${record.contract_number || record.tracking_code}`}
            onConfirm={() => handleDelete(record.id)}
            loading={deleteLoading[record.id]}
          />
        </Space>
      )
    }
  ];

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#f8f9fa' }}>
      {loading && <BrandedLoader message="Loading Seed Multiplication Records..." />}

      {/* HEADER */}
      <div style={{ background: '#fff', padding: '20px 24px', marginBottom: 20, borderBottom: '1px solid #f0f0f0' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ marginBottom: 4, fontWeight: 600 }}>Seed Multiplication</Title>
            <Text type="secondary">Manage seed production contracts and certification workflows</Text>
          </Col>
        </Row>
      </div>

      <div style={{ padding: '0 24px 24px' }}>
        {/* KPI CARDS */}
        <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} style={CARD_STYLE_BLUE} bodyStyle={{ padding: '16px' }}>
              <Statistic title="Total Contracts" value={stats.totalRecords} prefix={<DashboardOutlined style={{ color: '#1890ff', marginRight: 6 }} />} />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} style={CARD_STYLE_GREEN} bodyStyle={{ padding: '16px' }}>
              <Statistic title="Total Area" value={stats.totalArea} suffix="ha" precision={2} prefix={<AreaChartOutlined style={{ color: '#52c41a', marginRight: 6 }} />} />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} style={CARD_STYLE_ORANGE} bodyStyle={{ padding: '16px' }}>
              <Statistic title="Produced Quantity" value={stats.totalProduced} suffix="qt" precision={1} prefix={<SafetyCertificateOutlined style={{ color: '#fa8c16', marginRight: 6 }} />} />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} style={CARD_STYLE_GREEN} bodyStyle={{ padding: '16px' }}>
              <Statistic title="Certification Rate" value={stats.totalRecords ? (stats.approvedCount/stats.totalRecords)*100 : 0} suffix="%" precision={1} />
            </Card>
          </Col>
        </Row>

        {/* FILTER & ACTIONS BAR */}
        <Card bordered={false} style={{ marginBottom: 16, borderRadius: '6px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)' }} bodyStyle={{ padding: '14px' }}>
          <Row gutter={[12, 12]} align="middle" justify="space-between">
            <Col xs={24} md={18}>
              <Space size={10} wrap style={{ width: '100%' }}>
                <Input 
                  placeholder="Search producer or contract..." 
                  prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />} 
                  allowClear 
                  value={searchText} 
                  onChange={e => setSearchText(e.target.value)}
                  style={{ width: '240px' }}
                />
                <Select 
                  style={{ width: '160px' }} 
                  value={filters.producer_type} 
                  onChange={val => setFilters({...filters, producer_type: val})}
                >
                  <Option value="All">All Producers</Option>
                  <Option value="Amhara Seed Enterprise">Amhara Seed Enterprise</Option>
                  <Option value="University">University</Option>
                  <Option value="Model Farmer">Model Farmer</Option>
                </Select>
                <Select 
                  style={{ width: '150px' }} 
                  value={filters.seed_generation} 
                  onChange={val => setFilters({...filters, seed_generation: val})}
                >
                  <Option value="All">All Generations</Option>
                  <Option value="Breeder">Breeder</Option>
                  <Option value="Pre-Basic">Pre-Basic</Option>
                  <Option value="Basic">Basic</Option>
                  <Option value="Certified 1">Certified 1</Option>
                </Select>
              </Space>
            </Col>
            
            <Col xs={24} md={6} style={{ textAlign: 'right' }}>
              <Space size={8}>
                <Button 
                  icon={<DownloadOutlined />} 
                  onClick={handleExport}
                  style={{ borderColor: '#d9d9d9', color: '#595959' }}
                >
                  Export
                </Button>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={() => { setEditingRecord(null); setModalVisible(true); }}
                >
                  New Record
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* DATA TABLE */}
        <Card bordered={false} style={{ borderRadius: '6px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)' }} bodyStyle={{ padding: '0px' }}>
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="id"
            loading={loading}
            size="middle"
            pagination={{ 
              defaultPageSize: 10,
              showSizeChanger: true, 
              pageSizeOptions: ['10', '20', '50', '100'],
              showTotal: (total, range) => `Showing ${range[0]}-${range[1]} of ${total} entries`
            }}
          />
        </Card>
      </div>

      {/* FORM MODAL */}
      <Modal
        title={editingRecord ? "Edit Seed Record" : "New Seed Multiplication"}
        open={modalVisible}
        footer={null}
        width={850}
        destroyOnClose
        onCancel={() => setModalVisible(false)}
      >
        <SeedMultiplicationForm 
          initialData={editingRecord} 
          onSuccess={() => { setModalVisible(false); fetchData(); }} 
        />
      </Modal>

      {/* VIEW MODAL */}
      <Modal
        title="Seed Multiplication Details"
        open={viewModalVisible}
        footer={null}
        onCancel={() => setViewModalVisible(false)}
        width={650}
      >
        {viewingRecord && (
          <Row gutter={[16, 20]}>
            <Col span={12}><Text type="secondary">Tracking Code</Text><br/><Tag color="blue" className="font-mono">{viewingRecord.tracking_code}</Tag></Col>
            <Col span={12}><Text type="secondary">Inspection Status</Text><br/><Tag color="orange">{viewingRecord.inspection_status}</Tag></Col>
            <Col span={12}><Text type="secondary">Producer Name</Text><br/><Text strong>{viewingRecord.producer_name}</Text></Col>
            <Col span={12}><Text type="secondary">Contract Number</Text><br/><Text strong>{viewingRecord.contract_number}</Text></Col>
            <Col span={8}><Text type="secondary">Commodity</Text><br/>{viewingRecord.crop_commodity}</Col>
            <Col span={8}><Text type="secondary">Generation</Text><br/>{viewingRecord.seed_generation}</Col>
            <Col span={8}><Text type="secondary">Allocated Area</Text><br/>{viewingRecord.allocated_area_hectares} ha</Col>
          </Row>
        )}
      </Modal>

      {/* Global CSS Overrides */}
      <style jsx global>{`
        .ant-table-thead > tr > th { background: #fafafa !important; font-weight: 600 !important; }
        .font-mono { font-family: SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace; font-size: 13px; }
        .ant-table-wrapper .ant-table { background: transparent !important; }
        .ant-table-container { border: none !important; }
        .ant-table-content table { border: none !important; }
        .ant-pagination { padding-right: 16px !important; padding-bottom: 16px !important; }
      `}</style>
    </div>
  );
};

export default SeedMultiplication;