import React, {
  useState,
  useEffect,
  useMemo
} from 'react';

import {
  Table,
  Card,
  Row,
  Col,
  Statistic,
  Button,
  Tag,
  Space,
  Input,
  Modal,
  message,
  Typography,
  Select,
  Tooltip,
  Empty,
  notification
} from 'antd';

import {
  PlusOutlined,
  SearchOutlined,
  AreaChartOutlined,
  DashboardOutlined,
  DownloadOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  GlobalOutlined,
  AuditOutlined
} from '@ant-design/icons';

// Components
import LandParcelForm from './LandParcelForm';
import CommonApprovalModal from '../../components/common/CommonApprovalModal'; // IMPORT COMMON REUSABLE MODAL

import {
  EditButton,
  DeleteButton
} from '../../components/common/ActionButtons';

import BrandedLoader from '../../components/common/BrandedLoader';

// API Service
import agronomyApi from '../../services/api/agronomyApi';

const { Title, Text } = Typography;
const { Option } = Select;

/**
 * KPI CARD STYLES
 */
const CARD_STYLE_GREEN = {
  borderRight: '1px solid #f0f0f0',
  borderBottom: '3px solid #52c41a',
  borderRadius: 0,
  height: '100%',
  boxShadow: 'none'
};

const CARD_STYLE_BLUE = {
  borderRight: '1px solid #f0f0f0',
  borderBottom: '3px solid #1890ff',
  borderRadius: 0,
  height: '100%',
  boxShadow: 'none'
};

const CARD_STYLE_ORANGE = {
  borderRight: '1px solid #f0f0f0',
  borderBottom: '3px solid #fa8c16',
  borderRadius: 0,
  height: '100%',
  boxShadow: 'none'
};

const CARD_STYLE_PURPLE = {
  borderRight: '1px solid #f0f0f0',
  borderBottom: '3px solid #722ed1',
  borderRadius: 0,
  height: '100%',
  boxShadow: 'none'
};

const LandParcels = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [searchText, setSearchText] = useState('');

  // VIEW MODAL
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewRecord, setViewRecord] = useState(null);

  // NEW APPROVAL MODAL STATES
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [approvingParcel, setApprovingParcel] = useState(null);

  const [filters, setFilters] = useState({
    land_use: 'All',
    erosion: 'All'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await agronomyApi.getLandParcels();
      setData(
        Array.isArray(response?.data?.data)
          ? response.data.data
          : []
      );
    } catch (error) {
      notification.error({
        message: 'Sync Error',
        description: 'Failed to synchronize land parcel records from the server.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await agronomyApi.deleteLandParcel(id);
      message.success('Parcel deleted successfully');
      fetchData();
    } catch (error) {
      message.error(
        error?.response?.data?.message || 'Failed to delete parcel'
      );
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setIsModalVisible(true);
  };

  const handleView = (record) => {
    setViewRecord(record);
    setViewModalVisible(true);
  };

  const handleAddNew = () => {
    setEditingRecord(null);
    setIsModalVisible(true);
  };

  // TRIGGER THE REUSABLE AUDIT MODAL
  const handleApproveClick = (record) => {
    setApprovingParcel(record);
    setIsApprovalModalOpen(true);
  };

  // UNIFIED REUSABLE AUDIT SUBMISSION LOGIC
  const handleApprovalSubmit = async (entityId, values) => {
    setLoading(true);
    try {
      const response = await agronomyApi.approveLandParcel(entityId, values);
      message.success(response.data.message || 'Land parcel verification logged');
      setIsApprovalModalOpen(false);
      await fetchData(); // Refresh database grid
    } catch (error) {
      message.error('Failed to save land parcel verification status');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (filteredData.length === 0) {
      message.warning('No data available to export.');
      return;
    }

    const headers = 'Parcel ID,Farmer ID,Size (Ha),Land Use,Soil Type,Erosion Status,Approval Status,Latitude,Longitude\n';

    const rows = filteredData
      .map(
        (item) =>
          `${item.parcel_id_no || 'N/A'},${
            item.farmer_id || 'N/A'
          },${item.total_size_hectares || 0},${
            item.land_use_type || 'N/A'
          },${item.soil_type || 'N/A'},${
            item.erosion_status || 'N/A'
          },${item.status || 'Pending'},${item.location?.latitude || ''},${item.location?.longitude || ''}`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LandParcels_Export_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch =
        item.parcel_id_no
          ?.toLowerCase()
          .includes(searchText.toLowerCase()) ||
        String(item.farmer_id)
          ?.toLowerCase()
          .includes(searchText.toLowerCase());

      const matchesLandUse =
        filters.land_use === 'All' ||
        item.land_use_type === filters.land_use;

      const matchesErosion =
        filters.erosion === 'All' ||
        item.erosion_status === filters.erosion;

      return matchesSearch && matchesLandUse && matchesErosion;
    });
  }, [data, searchText, filters]);

  const totalHectares = useMemo(() => {
    return data.reduce(
      (sum, item) => sum + Number(item.total_size_hectares || 0),
      0
    );
  }, [data]);

  const erosionRiskCount = useMemo(() => {
    return data.filter((i) => i.erosion_status !== 'None').length;
  }, [data]);

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    {
      title: 'Parcel ID',
      dataIndex: 'parcel_id_no',
      key: 'parcel_id_no',
      sorter: (a, b) => a.parcel_id_no.localeCompare(b.parcel_id_no),
      render: (text) => (
        <Text strong style={{ color: '#1677ff' }}>
          {text}
        </Text>
      )
    },
    {
      title: 'Farmer ID',
      dataIndex: 'farmer_id',
      key: 'farmer_id'
    },
    {
      title: 'Size (Ha)',
      dataIndex: 'total_size_hectares',
      key: 'total_size_hectares',
      sorter: (a, b) => a.total_size_hectares - b.total_size_hectares,
      render: (val) => <Tag color="blue">{val} Ha</Tag>
    },
    {
      title: 'Land Use',
      dataIndex: 'land_use_type',
      key: 'land_use_type',
      render: (type) => (
        <Tag color={type?.includes('Irrigated') ? 'cyan' : 'orange'}>
          {type}
        </Tag>
      )
    },
    {
      title: 'Erosion Status',
      dataIndex: 'erosion_status',
      key: 'erosion_status',
      render: (status) => (
        <Tag color={status === 'None' ? 'green' : 'volcano'}>
          {status}
        </Tag>
      )
    },
    {
      title: 'Approval Status', // NEW: Core Verification Tag Column
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (status) => {
        let color = 'orange'; // Default for Pending
        if (status === 'Approved') color = 'green';
        if (status === 'Rejected') color = 'red';
        return <Tag color={color} style={{ fontWeight: 500, margin: 0 }}>{status || 'Pending'}</Tag>;
      }
    },
    {
      title: 'GIS Coordinates',
      key: 'gis',
      render: (_, record) => record.location ? (
        <Tag icon={<GlobalOutlined />} color="purple">
          {Number(record.location.latitude).toFixed(4)}, {Number(record.location.longitude).toFixed(4)}
        </Tag>
      ) : (
        <Text type="secondary" style={{ fontSize: '12px' }}>Not Mapped</Text>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 230,
      render: (_, record) => (
        <Space size="small">
          {/* NEW: Audit Process Trigger */}
          <Tooltip title="Verify Land Parcel Info">
            <Button
              size="small"
              icon={<AuditOutlined style={{ color: '#fa8c16' }} />}
              onClick={(e) => { e.stopPropagation(); handleApproveClick(record); }}
            />
          </Tooltip>
          <Tooltip title="View Details">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
            />
          </Tooltip>
          <Tooltip title="Edit Parcel">
            <EditButton onClick={() => handleEdit(record)} />
          </Tooltip>
          <DeleteButton
            itemName={`Parcel ${record.parcel_id_no}`}
            onConfirm={() => handleDelete(record.id)}
          />
        </Space>
      )
    }
  ];

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#fff' }}>
      {loading && <BrandedLoader message="Syncing Land Records..." />}

      <div style={{ background: '#fff', padding: '16px', marginBottom: 16, borderBottom: '1px solid #f0f0f0' }}>
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col>
            <Title level={3} style={{ marginBottom: 0 }}>
              Land Parcel & Soil Profiling
            </Title>
            <Text type="secondary">
              Manage and monitor land usage, soil profile, GIS coordinates and erosion risks
            </Text>
          </Col>
        </Row>
      </div>

      <div style={{ padding: '0 16px 16px' }}>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} style={CARD_STYLE_GREEN}>
              <Statistic title="Total Parcels" value={data.length} prefix={<DashboardOutlined style={{ color: '#52c41a' }} />} />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} style={CARD_STYLE_BLUE}>
              <Statistic title="Total Area" value={totalHectares} precision={2} suffix="Ha" prefix={<AreaChartOutlined style={{ color: '#1890ff' }} />} />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} style={CARD_STYLE_ORANGE}>
              <Statistic title="Erosion Risk" value={erosionRiskCount} prefix={<ExclamationCircleOutlined style={{ color: '#fa8c16' }} />} />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} style={CARD_STYLE_PURPLE}>
              <Statistic title="Avg Size" value={data.length ? totalHectares / data.length : 0} precision={2} suffix="Ha" />
            </Card>
          </Col>
        </Row>

        <Card bordered={false} style={{ marginBottom: 16, borderRadius: 0, boxShadow: 'none', borderRight: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0' }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={6}>
              <Input
                placeholder="Search Parcel or Farmer ID..."
                prefix={<SearchOutlined />}
                allowClear
                onChange={(e) => setSearchText(e.target.value)}
              />
            </Col>

            <Col xs={24} md={5}>
              <Select style={{ width: '100%' }} defaultValue="All" onChange={(val) => setFilters({ ...filters, land_use: val })}>
                <Option value="All">All Land Use Types</Option>
                <Option value="Rainfed Crop">Rainfed Crop</Option>
                <Option value="Irrigated Land">Irrigated Land</Option>
                <Option value="Forest/Woodlot">Forest/Woodlot</Option>
                <Option value="Grazing Land">Grazing Land</Option>
              </Select>
            </Col>

            <Col xs={24} md={5}>
              <Select style={{ width: '100%' }} defaultValue="All" onChange={(val) => setFilters({ ...filters, erosion: val })}>
                <Option value="All">All Erosion Status</Option>
                <Option value="None">None</Option>
                <Option value="Rill Erosion">Rill Erosion</Option>
                <Option value="Gully Erosion">Gully Erosion</Option>
                <Option value="Sheet Erosion">Sheet Erosion</Option>
              </Select>
            </Col>

            <Col xs={24} md={8}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
                <Button icon={<DownloadOutlined />} onClick={exportToCSV}>Export</Button>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNew}>Register New</Button>
              </div>
            </Col>
          </Row>
        </Card>

        <Card bordered={false} style={{ borderRadius: 0, boxShadow: 'none', borderRight: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0' }}>
          {data.length === 0 && !loading ? (
            <Empty description="No land parcels found." />
          ) : (
            <Table
              columns={columns}
              dataSource={filteredData}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
              }}
            />
          )}
        </Card>
      </div>

      {/* FORM MODAL - EXPANDED WIDTH TO 850 TO ACCOMMODATE THE GIS MAP PERFECTLY */}
      <Modal
        title={editingRecord ? 'Edit Existing Land Parcel' : 'Register New Land Parcel'}
        open={isModalVisible}
        footer={null}
        centered
        width={850} 
        destroyOnClose
        bodyStyle={{ padding: '16px' }}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingRecord(null);
        }}
      >
        <LandParcelForm
          initialData={editingRecord}
          onSuccess={() => {
            setIsModalVisible(false);
            setEditingRecord(null);
            fetchData();
          }}
        />
      </Modal>

      {/* VIEW DETAILS MODAL */}
      <Modal
        title="Land Parcel Details"
        open={viewModalVisible}
        footer={null}
        centered
        width={600}
        onCancel={() => {
          setViewModalVisible(false);
          setViewRecord(null);
        }}
      >
        {viewRecord && (
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Text strong>Parcel ID</Text><br />
              <Tag color="blue">{viewRecord.parcel_id_no}</Tag>
            </Col>

            <Col span={12}>
              <Text strong>Farmer ID</Text><br />
              <Text>{viewRecord.farmer_id}</Text>
            </Col>

            <Col span={12}>
              <Text strong>Land Size</Text><br />
              <Tag color="green">{viewRecord.total_size_hectares} Ha</Tag>
            </Col>

            <Col span={12}>
              <Text strong>Land Use</Text><br />
              <Tag color="orange">{viewRecord.land_use_type}</Tag>
            </Col>

            <Col span={12}>
              <Text strong>Soil Type</Text><br />
              <Text>{viewRecord.soil_type || 'N/A'}</Text>
            </Col>

            <Col span={12}>
              <Text strong>Erosion Status</Text><br />
              <Tag color={viewRecord.erosion_status === 'None' ? 'green' : 'volcano'}>
                {viewRecord.erosion_status}
              </Tag>
            </Col>

            {/* SHOW GIS LOCATION IN DETAILS VIEW IF AVAILABLE */}
            {viewRecord.location && (
              <Col span={24} style={{ marginTop: 8, background: '#f8fafc', padding: 12, borderRadius: 6 }}>
                <Text strong><GlobalOutlined style={{ color: '#16a34a' }} /> GIS Map Location:</Text><br />
                <Text type="secondary">
                  Latitude: {viewRecord.location.latitude}, Longitude: {viewRecord.location.longitude}
                  {viewRecord.location.accuracy_meters && ` (Accuracy: ±${Math.round(viewRecord.location.accuracy_meters)}m)`}
                </Text>
              </Col>
            )}
          </Row>
        )}
      </Modal>

      {/* PORTAL THE REUSABLE COMMON APPROVAL MODAL */}
      <CommonApprovalModal
        open={isApprovalModalOpen}
        onCancel={() => setIsApprovalModalOpen(false)}
        onSubmit={handleApprovalSubmit}
        isSubmitting={loading}
        title={`Verify Land Parcel: ${approvingParcel?.parcel_id_no || ''}`}
        itemName={`Parcel ${approvingParcel?.parcel_id_no || ''}`}
        entityId={approvingParcel?.id}
        initialStatus={approvingParcel?.status}
        initialRemarks={approvingParcel?.approval?.remarks}
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

export default LandParcels;