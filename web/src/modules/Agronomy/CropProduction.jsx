import React, { useState, useEffect, useMemo } from 'react';

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
  DownloadOutlined,
  EyeOutlined,
  AreaChartOutlined,
  DashboardOutlined,
  TrophyOutlined
} from '@ant-design/icons';

import {
  EditButton,
  DeleteButton
} from '../../components/common/ActionButtons';

import BrandedLoader from '../../components/common/BrandedLoader';

import agronomyApi from '../../services/api/agronomyApi';
import CropProductionForm from './CropProductionForm';

const { Title, Text } = Typography;
const { Option } = Select;

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

const CropProduction = () => {
  // =========================
  // STATE
  // =========================
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [searchText, setSearchText] = useState('');

  const [filters, setFilters] = useState({
    season: 'All',
    crop_category: 'All',
    crop_year: 'All'
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewingRecord, setViewingRecord] = useState(null);

  // =========================
  // FETCH DATA
  // =========================
  const fetchCrops = async () => {
    setLoading(true);

    try {
      const response = await agronomyApi.getSeasonalCrops({
        season:
          filters.season === 'All'
            ? ''
            : filters.season,

        crop_category:
          filters.crop_category === 'All'
            ? ''
            : filters.crop_category,

        crop_year:
          filters.crop_year === 'All'
            ? ''
            : filters.crop_year,

        search: searchText
      });

      setData(
        Array.isArray(response?.data?.data)
          ? response.data.data
          : []
      );
    } catch (error) {
      notification.error({
        message: 'Failed to Load',
        description:
          'Could not fetch crop production records.'
      });
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // EFFECTS
  // =========================
  useEffect(() => {
    fetchCrops();
  }, [filters, searchText]);

  // =========================
  // HANDLERS
  // =========================
  const handleEdit = (record) => {
    setEditingRecord(record);
    setModalVisible(true);
  };

  const handleView = (record) => {
    setViewingRecord(record);
    setViewModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await agronomyApi.deleteSeasonalCrop(id);

      message.success(
        'Crop record deleted successfully'
      );

      fetchCrops();
    } catch (error) {
      message.error('Failed to delete record');
    }
  };

  const handleAddNew = () => {
    setEditingRecord(null);
    setModalVisible(true);
  };

  // =========================
  // EXPORT CSV
  // =========================
  const handleExport = () => {
    if (!filteredData.length) {
      message.warning(
        'No data available to export'
      );
      return;
    }

    const headers = [
      'Parcel ID',
      'Season',
      'Crop Year',
      'Crop',
      'Category',
      'Cultivated Area',
      'Actual Yield',
      'Status'
    ];

    const rows = filteredData.map((item) => [
      item.land_parcel?.parcel_id_no || '',
      item.season || '',
      item.crop_year || '',
      item.commodity_name || '',
      item.crop_category || '',
      item.cultivated_area_hectares || '',
      item.actual_yield_quintals || '',
      item.status || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;'
    });

    const url = URL.createObjectURL(blob);

    const link =
      document.createElement('a');

    link.href = url;

    link.setAttribute(
      'download',
      'crop_production_records.csv'
    );

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  };

  // =========================
  // ANALYTICS
  // =========================
  const {
    totalCultivated,
    totalYield,
    totalRecords
  } = useMemo(() => {
    const cultivated = data.reduce(
      (sum, item) =>
        sum +
        Number(
          item.cultivated_area_hectares || 0
        ),
      0
    );

    const yieldTotal = data.reduce(
      (sum, item) =>
        sum +
        Number(
          item.actual_yield_quintals || 0
        ),
      0
    );

    return {
      totalRecords: data.length,
      totalCultivated: cultivated,
      totalYield: yieldTotal
    };
  }, [data]);

  // =========================
  // FILTERED DATA
  // =========================
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      return (
        item.commodity_name
          ?.toLowerCase()
          .includes(
            searchText.toLowerCase()
          ) ||
        item.land_parcel?.parcel_id_no
          ?.toLowerCase()
          .includes(
            searchText.toLowerCase()
          )
      );
    });
  }, [data, searchText]);

  // =========================
  // TABLE COLUMNS
  // =========================
  const columns = [
    {
      title: 'Parcel ID',
      dataIndex: [
        'land_parcel',
        'parcel_id_no'
      ],
      key: 'parcel',

      render: (text) => (
        <Text
          strong
          style={{ color: '#1677ff' }}
        >
          {text || 'N/A'}
        </Text>
      )
    },

    {
      title: 'Season',
      dataIndex: 'season',
      key: 'season',

      render: (text) => (
        <Tag color="purple">
          {text}
        </Tag>
      )
    },

    {
      title: 'Crop Year',
      dataIndex: 'crop_year',
      key: 'crop_year'
    },

    {
      title: 'Crop',
      dataIndex: 'commodity_name',
      key: 'commodity',

      render: (text) => (
        <Text strong>{text}</Text>
      )
    },

    {
      title: 'Category',
      dataIndex: 'crop_category',
      key: 'category',

      render: (cat) => (
        <Tag color="geekblue">
          {cat}
        </Tag>
      )
    },

    {
      title: 'Cultivated (ha)',
      dataIndex:
        'cultivated_area_hectares',

      key: 'cultivated',

      sorter: (a, b) =>
        (a.cultivated_area_hectares || 0) -
        (b.cultivated_area_hectares || 0),

      render: (val) => (
        <Tag color="blue">
          {Number(val || 0).toFixed(2)} ha
        </Tag>
      )
    },

    {
      title: 'Actual Yield (qt)',
      dataIndex:
        'actual_yield_quintals',

      key: 'yield',

      sorter: (a, b) =>
        (a.actual_yield_quintals || 0) -
        (b.actual_yield_quintals || 0),

      render: (val) => (
        <Tag color="green">
          {Number(val || 0).toFixed(1)} qt
        </Tag>
      )
    },

    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',

      render: (status) => (
        <Tag
          color={
            status === 'Harvested'
              ? 'success'
              : status === 'Damaged'
              ? 'error'
              : 'warning'
          }
        >
          {status || 'Planned'}
        </Tag>
      )
    },

    {
      title: 'Actions',
      key: 'actions',
      width: 180,

      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() =>
                handleView(record)
              }
            />
          </Tooltip>

          <Tooltip title="Edit">
            <EditButton
              onClick={() =>
                handleEdit(record)
              }
            />
          </Tooltip>

          <DeleteButton
            itemName={
              'Crop Record - ' +
              record.commodity_name
            }
            onConfirm={() =>
              handleDelete(record.id)
            }
          />
        </Space>
      )
    }
  ];

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        background: '#fff'
      }}
    >
      {loading && (
        <BrandedLoader message="Loading Crop Production Records..." />
      )}

      {/* PAGE HEADER */}
      <div
        style={{
          background: '#fff',
          padding: '16px',
          marginBottom: 16,
          borderBottom:
            '1px solid #f0f0f0'
        }}
      >
        <Row
          justify="space-between"
          align="middle"
        >
          <Col>
            <Title
              level={3}
              style={{ marginBottom: 0 }}
            >
              Crop Production Management
            </Title>

            <Text type="secondary">
              Track seasonal crops, yield
              performance and cultivated
              areas
            </Text>
          </Col>
        </Row>
      </div>

      <div
        style={{
          padding: '0 16px 16px'
        }}
      >
        {/* KPI CARDS */}
        <Row
          gutter={[16, 16]}
          style={{
            marginBottom: 16
          }}
        >
          <Col xs={24} sm={12} lg={6}>
            <Card
              bordered={false}
              style={CARD_STYLE_GREEN}
            >
              <Statistic
                title="Total Records"
                value={totalRecords}
                prefix={
                  <DashboardOutlined
                    style={{
                      color: '#52c41a'
                    }}
                  />
                }
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card
              bordered={false}
              style={CARD_STYLE_BLUE}
            >
              <Statistic
                title="Total Cultivated Area"
                value={totalCultivated.toFixed(
                  2
                )}
                suffix="ha"
                precision={2}
                prefix={
                  <AreaChartOutlined
                    style={{
                      color: '#1890ff'
                    }}
                  />
                }
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card
              bordered={false}
              style={CARD_STYLE_ORANGE}
            >
              <Statistic
                title="Total Yield"
                value={totalYield.toFixed(1)}
                suffix="quintals"
                precision={1}
                prefix={
                  <TrophyOutlined
                    style={{
                      color: '#fa8c16'
                    }}
                  />
                }
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card
              bordered={false}
              style={CARD_STYLE_GREEN}
            >
              <Statistic
                title="Avg Yield per Record"
                value={
                  totalRecords
                    ? (
                        totalYield /
                        totalRecords
                      ).toFixed(1)
                    : 0
                }
                suffix="qt"
                precision={1}
              />
            </Card>
          </Col>
        </Row>

        {/* FILTER TOOLBAR */}
        <Card
          bordered={false}
          style={{
            marginBottom: 16,
            borderRadius: 0,
            boxShadow: 'none',
            borderRight:
              '1px solid #f0f0f0',
            borderBottom:
              '1px solid #f0f0f0'
          }}
        >
          <Row
            gutter={12}
            align="middle"
            wrap={false}
          >
            {/* SEARCH */}
            <Col flex="280px">
              <Input
                placeholder="Search crop or parcel..."
                prefix={<SearchOutlined />}
                allowClear
                value={searchText}
                onChange={(e) =>
                  setSearchText(
                    e.target.value
                  )
                }
              />
            </Col>

            {/* SEASON */}
            <Col flex="170px">
              <Select
                style={{ width: '100%' }}
                value={filters.season}
                onChange={(val) =>
                  setFilters({
                    ...filters,
                    season: val
                  })
                }
              >
                <Option value="All">
                  All Seasons
                </Option>

                <Option value="Meher">
                  Meher
                </Option>

                <Option value="Belg">
                  Belg
                </Option>
              </Select>
            </Col>

            {/* CATEGORY */}
            <Col flex="180px">
              <Select
                style={{ width: '100%' }}
                value={
                  filters.crop_category
                }
                onChange={(val) =>
                  setFilters({
                    ...filters,
                    crop_category: val
                  })
                }
              >
                <Option value="All">
                  All Categories
                </Option>

                <Option value="Cereals">
                  Cereals
                </Option>

                <Option value="Pulses">
                  Pulses
                </Option>

                <Option value="Oilseeds">
                  Oilseeds
                </Option>

                <Option value="Vegetables">
                  Vegetables
                </Option>

                <Option value="Fruits">
                  Fruits
                </Option>
              </Select>
            </Col>

            {/* YEAR */}
            <Col flex="160px">
              <Select
                style={{ width: '100%' }}
                value={filters.crop_year}
                onChange={(val) =>
                  setFilters({
                    ...filters,
                    crop_year: val
                  })
                }
              >
                <Option value="All">
                  All Years
                </Option>

                <Option value="2026">
                  2026
                </Option>

                <Option value="2025">
                  2025
                </Option>

                <Option value="2024">
                  2024
                </Option>
              </Select>
            </Col>

            {/* BUTTONS */}
            <Col flex="auto">
              <div
                style={{
                  display: 'flex',
                  justifyContent:
                    'flex-end',
                  alignItems: 'center',
                  gap: 12,
                  width: '100%'
                }}
              >
                <Button
                  icon={<DownloadOutlined />}
                  onClick={handleExport}
                >
                  Export
                </Button>

                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddNew}
                >
                  New Crop Record
                </Button>
              </div>
            </Col>
          </Row>
        </Card>

        {/* TABLE */}
        <Card
          bordered={false}
          style={{
            borderRadius: 0,
            boxShadow: 'none',
            borderRight:
              '1px solid #f0f0f0',
            borderBottom:
              '1px solid #f0f0f0'
          }}
        >
          {data.length === 0 &&
          !loading ? (
            <Empty description="No crop production records found." />
          ) : (
            <Table
              columns={columns}
              dataSource={filteredData}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 12,
                showSizeChanger: true,

                showTotal: (
                  total,
                  range
                ) =>
                  `${range[0]}-${range[1]} of ${total} items`
              }}
            />
          )}
        </Card>
      </div>

      {/* FORM MODAL */}
      <Modal
        title={
          editingRecord
            ? 'Edit Crop Production Record'
            : 'New Crop Production Record'
        }
        open={modalVisible}
        footer={null}
        centered
        width={900}
        destroyOnClose
        onCancel={() => {
          setModalVisible(false);
          setEditingRecord(null);
        }}
      >
        <CropProductionForm
          initialData={editingRecord}
          onSuccess={() => {
            setModalVisible(false);
            setEditingRecord(null);
            fetchCrops();
          }}
        />
      </Modal>

      {/* VIEW MODAL */}
      <Modal
        title="Crop Production Details"
        open={viewModalVisible}
        footer={null}
        centered
        width={700}
        onCancel={() => {
          setViewModalVisible(false);
          setViewingRecord(null);
        }}
      >
        {viewingRecord && (
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Text strong>
                Parcel ID
              </Text>
              <br />

              <Tag color="blue">
                {
                  viewingRecord
                    .land_parcel
                    ?.parcel_id_no
                }
              </Tag>
            </Col>

            <Col span={12}>
              <Text strong>
                Season
              </Text>
              <br />

              <Tag color="purple">
                {viewingRecord.season}
              </Tag>
            </Col>

            <Col span={12}>
              <Text strong>
                Crop Year
              </Text>
              <br />
              {viewingRecord.crop_year}
            </Col>

            <Col span={12}>
              <Text strong>
                Crop
              </Text>
              <br />

              <Text strong>
                {
                  viewingRecord.commodity_name
                }
              </Text>
            </Col>

            <Col span={12}>
              <Text strong>
                Category
              </Text>
              <br />

              <Tag color="geekblue">
                {
                  viewingRecord.crop_category
                }
              </Tag>
            </Col>

            <Col span={12}>
              <Text strong>
                Cultivated Area
              </Text>
              <br />

              <Tag color="blue">
                {
                  viewingRecord.cultivated_area_hectares
                }{' '}
                ha
              </Tag>
            </Col>

            <Col span={12}>
              <Text strong>
                Actual Yield
              </Text>
              <br />

              <Tag color="green">
                {
                  viewingRecord.actual_yield_quintals
                }{' '}
                quintals
              </Tag>
            </Col>

            <Col span={12}>
              <Text strong>
                Status
              </Text>

              <br />

              <Tag
                color={
                  viewingRecord.status ===
                  'Harvested'
                    ? 'success'
                    : viewingRecord.status ===
                      'Damaged'
                    ? 'error'
                    : 'warning'
                }
              >
                {viewingRecord.status}
              </Tag>
            </Col>
          </Row>
        )}
      </Modal>

      {/* GLOBAL STYLES */}
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

        .ant-modal .ant-modal-content {
          border-radius: 8px;
        }

        .ant-select-selector,
        .ant-input,
        .ant-btn {
          border-radius: 6px !important;
        }
      `}</style>
    </div>
  );
};

export default CropProduction;