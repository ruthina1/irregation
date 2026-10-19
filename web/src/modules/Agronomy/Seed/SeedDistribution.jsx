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
  Typography,
  Empty,
  Tooltip,
  message,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Divider
} from 'antd';

import {
 SendOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  DatabaseOutlined,
  PlusOutlined,
  EyeOutlined,
  ReloadOutlined
} from '@ant-design/icons';

import dayjs from 'dayjs';

import agronomyApi from '../../../services/api/agronomyApi';
import BrandedLoader from '../../../components/common/BrandedLoader';
import {
  EditButton,
  DeleteButton
} from '../../../components/common/ActionButtons';
import { handleApiError } from '../../../utils/errorHandler';

const { Title, Text } = Typography;
const { TextArea } = Input;

const SeedDistribution = () => {
  const [records, setRecords] = useState([]);
  const [seedLots, setSeedLots] = useState([]);
  const [inventory, setInventory] = useState([]);

  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const [formVisible, setFormVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);

  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const [form] = Form.useForm();

  /* =====================================================
     FETCH DISTRIBUTIONS
  ===================================================== */

  const fetchData = async () => {
    setLoading(true);

    try {
      const res =
        await agronomyApi.getSeedDistributions();

      setRecords(
        Array.isArray(res.data)
          ? res.data
          : res.data?.data || []
      );
    } catch (error) {
      handleApiError(
        error,
        'Failed to fetch seed distributions'
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     FETCH SEED LOTS
  ===================================================== */

  const fetchSeedLots = async () => {
    try {
      const res =
        await agronomyApi.getSeedRegistrations();

      const list = Array.isArray(res.data)
        ? res.data
        : res.data?.data || [];

      setSeedLots(list);
    } catch (error) {
      console.error(
        'Failed to load seed lots:',
        error
      );
    }
  };

  /* =====================================================
     FETCH INVENTORY
  ===================================================== */

  const fetchInventory = async () => {
    try {
      const res =
        await agronomyApi.getSeedInventory();

      const list = Array.isArray(res.data)
        ? res.data
        : res.data?.data || [];

      setInventory(list);
    } catch (error) {
      console.error(
        'Failed to load seed inventory:',
        error
      );
    }
  };

  useEffect(() => {
    fetchData();
    fetchSeedLots();
    fetchInventory();
  }, []);

  /* =====================================================
     STATS
  ===================================================== */

  const stats = useMemo(() => {

    const totalQuantity =
      records.reduce(
        (sum, x) =>
          sum +
          Number(
            x.quantity_tons ??
            x.distribution_quantity ??
            0
          ),
        0
      );

    const completed =
      records.filter(
        x =>
          ['completed', 'distributed']
            .includes(
              String(
                x.status || ''
              ).toLowerCase()
            )
      ).length;

    const pending =
      records.filter(
        x =>
          ['pending', 'approved', 'processing']
            .includes(
              String(
                x.status || ''
              ).toLowerCase()
            )
      ).length;

    const cancelled =
      records.filter(
        x =>
          String(
            x.status || ''
          ).toLowerCase() ===
          'cancelled'
      ).length;

    return {
      total: records.length,
      totalQuantity,
      completed,
      pending,
      cancelled
    };

  }, [records]);

  /* =====================================================
     FORM
  ===================================================== */

  const handleAdd = () => {

    setEditingRecord(null);

    form.resetFields();

    form.setFieldsValue({
      distribution_date: dayjs(),
      status: 'pending',
      unit: 'tons'
    });

    setFormVisible(true);
  };

  const handleEdit = record => {

    setEditingRecord(record);

    form.resetFields();

    form.setFieldsValue({
      ...record,

      seed_lot_id:
        record.seed_lot_id ||
        record.seed_lot?.id,

      inventory_id:
        record.inventory_id ||
        record.inventory?.id,

      distribution_date:
        record.distribution_date
          ? dayjs(
              record.distribution_date
            )
          : dayjs()
    });

    setFormVisible(true);
  };

  const handleCancel = () => {

    form.resetFields();

    setFormVisible(false);
    setEditingRecord(null);
  };

  const handleSubmit = async values => {

    setFormLoading(true);

    try {

      const payload = {
        ...values,

        distribution_date:
          values.distribution_date
            ? values.distribution_date.format(
                'YYYY-MM-DD'
              )
            : null
      };

      if (editingRecord) {

        await agronomyApi.updateSeedDistribution(
          editingRecord.id,
          payload
        );

        message.success(
          'Seed distribution updated successfully'
        );

      } else {

        await agronomyApi.createSeedDistribution(
          payload
        );

        message.success(
          'Seed distribution created successfully'
        );
      }

      handleCancel();

      await fetchData();
      await fetchInventory();

    } catch (error) {

      handleApiError(
        error,
        editingRecord
          ? 'Failed to update seed distribution'
          : 'Failed to create seed distribution'
      );

    } finally {

      setFormLoading(false);

    }
  };

  /* =====================================================
     DELETE
  ===================================================== */

  const handleDelete = async id => {

    try {

      await agronomyApi.deleteSeedDistribution(id);

      message.success(
        'Distribution record deleted successfully'
      );

      fetchData();
      fetchInventory();

    } catch (error) {

      handleApiError(
        error,
        'Failed to delete distribution record'
      );

    }
  };

  /* =====================================================
     VIEW
  ===================================================== */

  const handleView = record => {

    setSelectedRecord(record);
    setDetailVisible(true);

  };

  /* =====================================================
     TABLE
  ===================================================== */

  const columns = [

    {
      title: 'Distribution No.',
      dataIndex: 'distribution_number',
      key: 'distribution_number',
      width: 160,
      render: v => v || '-'
    },

    {
      title: 'Seed Lot',
      key: 'seed_lot',
      width: 180,

      render: (_, r) => (

        <div>

          <div
            style={{
              fontWeight: 500
            }}
          >
            {r.seed_lot?.lot_number ||
              r.lot_number ||
              '-'}
          </div>

          <Text
            type="secondary"
            style={{
              fontSize: 12
            }}
          >
            {r.seed_lot?.variety?.name ||
              r.variety_name ||
              '-'}
          </Text>

        </div>

      )
    },

    {
      title: 'Recipient',
      dataIndex: 'recipient_name',
      key: 'recipient_name',
      render: (v, r) =>
        v ||
        r.farmer_name ||
        r.recipient?.name ||
        '-'
    },

    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      render: (v, r) =>
        v ||
        r.kebele_name ||
        r.woreda_name ||
        '-'
    },

    {
      title: 'Quantity',
      dataIndex: 'quantity_tons',
      key: 'quantity_tons',
      render: (v, r) => (

        <Tag color="blue">

          {v ??
            r.distribution_quantity ??
            0}{' '}

          {r.unit || 'tons'}

        </Tag>

      )
    },

    {
      title: 'Distribution Date',
      dataIndex: 'distribution_date',
      key: 'distribution_date',
      render: v => v || '-'
    },

    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',

      render: v => {

        const value =
          String(
            v || 'pending'
          ).toLowerCase();

        return (

          <Tag
            color={
              ['completed', 'distributed']
                .includes(value)
                ? 'success'
                : value === 'cancelled'
                  ? 'error'
                  : 'warning'
            }
          >
            {v || 'Pending'}
          </Tag>

        );

      }
    },

    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      fixed: 'right',

      render: (_, record) => (

        <Space size="small">

          <Tooltip title="View">

            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() =>
                handleView(record)
              }
            />

          </Tooltip>

          <EditButton
            onClick={() =>
              handleEdit(record)
            }
          />

          <DeleteButton
            itemName={
              `Distribution ${
                record.distribution_number ||
                ''
              }`
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
        <BrandedLoader
          message="Loading Seed Distribution..."
        />
      )}

      {/* HEADER */}

      <div
        style={{
          padding: 16,
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
              style={{ margin: 0 }}
            >
              🚚 Seed Distribution Management
            </Title>

            <Text type="secondary">
              Manage certified seed distribution,
              recipients, quantities, and delivery records
            </Text>

          </Col>

          <Col>

            <Space>

              <Button
                icon={<ReloadOutlined />}
                onClick={fetchData}
              >
                Refresh
              </Button>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
              >
                Add Distribution
              </Button>

            </Space>

          </Col>

        </Row>

      </div>

      <div
        style={{
          padding: '0 16px 16px'
        }}
      >

        {/* STATISTICS */}

        <Row
          gutter={[16, 16]}
          style={{
            marginBottom: 16
          }}
        >

          {[
            [
              'Total Distributions',
              stats.total,
              DatabaseOutlined,
              '#52c41a'
            ],
            [
              'Distributed Quantity',
              stats.totalQuantity,
              SendOutlined,
              '#1890ff'
            ],
            [
              'Completed',
              stats.completed,
              CheckCircleOutlined,
              '#fa8c16'
            ],
            [
              'Pending',
              stats.pending,
              ClockCircleOutlined,
              '#722ed1'
            ]
          ].map(
            ([title, value, Icon, color]) => (

              <Col
                xs={24}
                sm={12}
                lg={6}
                key={title}
              >

                <Card
                  bordered={false}
                  style={{
                    borderRight:
                      '1px solid #f0f0f0',
                    borderBottom:
                      `3px solid ${color}`,
                    borderRadius: 0,
                    height: '100%',
                    boxShadow: 'none'
                  }}
                >

                  <Statistic
                    title={title}
                    value={value}
                    precision={
                      typeof value ===
                      'number' &&
                      !Number.isInteger(value)
                        ? 2
                        : 0
                    }
                    prefix={
                      <Icon
                        style={{
                          color
                        }}
                      />
                    }
                  />

                </Card>

              </Col>

            )
          )}

        </Row>

        {/* TABLE */}

        <Card
          bordered={false}
          style={{
            borderRadius: 0,
            boxShadow: 'none',
            borderBottom:
              '1px solid #f0f0f0'
          }}
        >

          {records.length === 0 && !loading ? (

            <Empty
              description="No seed distribution records found."
            />

          ) : (

            <Table
              columns={columns}
              dataSource={records}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal:
                  (total, range) =>
                    `${range[0]}-${range[1]} of ${total} items`
              }}
              scroll={{
                x: 1200
              }}
            />

          )}

        </Card>

      </div>

      {/* =====================================================
          DISTRIBUTION FORM
      ===================================================== */}

      <Modal
        title={
          editingRecord
            ? 'Edit Seed Distribution'
            : 'Add Seed Distribution'
        }
        open={formVisible}
        onCancel={handleCancel}
        footer={null}
        width={900}
        destroyOnClose
      >

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >

          <Divider orientation="left">
            Distribution Information
          </Divider>

          <Row gutter={16}>

            <Col xs={24} md={12}>

              <Form.Item
                name="distribution_number"
                label="Distribution Number"
              >

                <Input
                  placeholder="e.g. DIST-2026-0001"
                />

              </Form.Item>

            </Col>

            <Col xs={24} md={12}>

              <Form.Item
                name="distribution_date"
                label="Distribution Date"
                rules={[
                  {
                    required: true,
                    message:
                      'Please select distribution date'
                  }
                ]}
              >

                <DatePicker
                  style={{
                    width: '100%'
                  }}
                  format="YYYY-MM-DD"
                />

              </Form.Item>

            </Col>

            <Col xs={24} md={12}>

              <Form.Item
                name="seed_lot_id"
                label="Seed Lot"
                rules={[
                  {
                    required: true,
                    message:
                      'Please select seed lot'
                  }
                ]}
              >

                <Select
                  showSearch
                  placeholder="Select seed lot"
                  optionFilterProp="label"
                  options={seedLots.map(
                    lot => ({
                      value: lot.id,
                      label:
                        lot.lot_number ||
                        lot.seed_lot_number ||
                        `Lot #${lot.id}`
                    })
                  )}
                />

              </Form.Item>

            </Col>

            <Col xs={24} md={12}>

              <Form.Item
                name="inventory_id"
                label="Inventory / Warehouse Stock"
              >

                <Select
                  showSearch
                  placeholder="Select inventory stock"
                  optionFilterProp="label"
                  options={inventory.map(
                    item => ({
                      value: item.id,
                      label:
                        `${
                          item.warehouse_name ||
                          item.warehouse?.name ||
                          'Warehouse'
                        } - ${
                          item.lot_number ||
                          item.seed_lot?.lot_number ||
                          `Stock #${item.id}`
                        }`
                    })
                  )}
                />

              </Form.Item>

            </Col>

          </Row>

          <Divider orientation="left">
            Recipient Information
          </Divider>

          <Row gutter={16}>

            <Col xs={24} md={12}>

              <Form.Item
                name="recipient_name"
                label="Recipient Name"
                rules={[
                  {
                    required: true,
                    message:
                      'Please enter recipient name'
                  }
                ]}
              >

                <Input
                  placeholder="Farmer / organization / institution"
                />

              </Form.Item>

            </Col>

            <Col xs={24} md={12}>

              <Form.Item
                name="recipient_phone"
                label="Recipient Phone"
              >

                <Input
                  placeholder="Phone number"
                />

              </Form.Item>

            </Col>

            <Col xs={24} md={8}>

              <Form.Item
                name="region"
                label="Region"
              >

                <Input
                  placeholder="Region"
                />

              </Form.Item>

            </Col>

            <Col xs={24} md={8}>

              <Form.Item
                name="zone"
                label="Zone"
              >

                <Input
                  placeholder="Zone"
                />

              </Form.Item>

            </Col>

            <Col xs={24} md={8}>

              <Form.Item
                name="woreda"
                label="Woreda"
              >

                <Input
                  placeholder="Woreda"
                />

              </Form.Item>

            </Col>

            <Col xs={24} md={8}>

              <Form.Item
                name="kebele"
                label="Kebele"
              >

                <Input
                  placeholder="Kebele"
                />

              </Form.Item>

            </Col>

            <Col xs={24} md={8}>

              <Form.Item
                name="location"
                label="Specific Location"
              >

                <Input
                  placeholder="Village / distribution center"
                />

              </Form.Item>

            </Col>

          </Row>

          <Divider orientation="left">
            Seed Quantity
          </Divider>

          <Row gutter={16}>

            <Col xs={24} md={8}>

              <Form.Item
                name="quantity_tons"
                label="Distribution Quantity"
                rules={[
                  {
                    required: true,
                    message:
                      'Please enter quantity'
                  }
                ]}
              >

                <InputNumber
                  min={0}
                  style={{
                    width: '100%'
                  }}
                  placeholder="Quantity"
                />

              </Form.Item>

            </Col>

            <Col xs={24} md={8}>

              <Form.Item
                name="unit"
                label="Unit"
              >

                <Select
                  options={[
                    {
                      value: 'tons',
                      label: 'Tons'
                    },
                    {
                      value: 'kg',
                      label: 'Kilograms'
                    },
                    {
                      value: 'quintals',
                      label: 'Quintals'
                    }
                  ]}
                />

              </Form.Item>

            </Col>

            <Col xs={24} md={8}>

              <Form.Item
                name="number_of_beneficiaries"
                label="Number of Beneficiaries"
              >

                <InputNumber
                  min={1}
                  style={{
                    width: '100%'
                  }}
                />

              </Form.Item>

            </Col>

          </Row>

          <Divider orientation="left">
            Distribution Status
          </Divider>

          <Row gutter={16}>

            <Col xs={24} md={12}>

              <Form.Item
                name="status"
                label="Status"
                rules={[
                  {
                    required: true,
                    message:
                      'Please select status'
                  }
                ]}
              >

                <Select
                  options={[
                    {
                      value: 'pending',
                      label: 'Pending'
                    },
                    {
                      value: 'approved',
                      label: 'Approved'
                    },
                    {
                      value: 'processing',
                      label: 'Processing'
                    },
                    {
                      value: 'completed',
                      label: 'Completed / Distributed'
                    },
                    {
                      value: 'cancelled',
                      label: 'Cancelled'
                    }
                  ]}
                />

              </Form.Item>

            </Col>

            <Col xs={24} md={12}>

              <Form.Item
                name="distribution_method"
                label="Distribution Method"
              >

                <Select
                  options={[
                    {
                      value: 'direct',
                      label: 'Direct Distribution'
                    },
                    {
                      value: 'cooperative',
                      label: 'Through Cooperative'
                    },
                    {
                      value: 'institution',
                      label: 'Through Institution'
                    },
                    {
                      value: 'distribution_center',
                      label: 'Distribution Center'
                    }
                  ]}
                />

              </Form.Item>

            </Col>

            <Col span={24}>

              <Form.Item
                name="remarks"
                label="Remarks"
              >

                <TextArea
                  rows={4}
                  placeholder="Distribution notes, observations, or remarks"
                />

              </Form.Item>

            </Col>

          </Row>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 8,
              borderTop:
                '1px solid #f0f0f0',
              paddingTop: 16
            }}
          >

            <Button
              onClick={handleCancel}
            >
              Cancel
            </Button>

            <Button
              type="primary"
              htmlType="submit"
              loading={formLoading}
            >
              {editingRecord
                ? 'Update Distribution'
                : 'Save Distribution'}
            </Button>

          </div>

        </Form>

      </Modal>

      {/* =====================================================
          DETAIL MODAL
      ===================================================== */}

      <Modal
        title="Seed Distribution Details"
        open={detailVisible}
        onCancel={() =>
          setDetailVisible(false)
        }
        footer={null}
        width={800}
      >

        {selectedRecord && (

          <Row gutter={[20, 20]}>

            <Col span={12}>
              <Text type="secondary">
                Distribution Number
              </Text>

              <div>
                {selectedRecord.distribution_number ||
                  '-'}
              </div>
            </Col>

            <Col span={12}>
              <Text type="secondary">
                Distribution Date
              </Text>

              <div>
                {selectedRecord.distribution_date ||
                  '-'}
              </div>
            </Col>

            <Col span={12}>
              <Text type="secondary">
                Seed Lot
              </Text>

              <div>
                {selectedRecord.seed_lot?.lot_number ||
                  selectedRecord.lot_number ||
                  '-'}
              </div>
            </Col>

            <Col span={12}>
              <Text type="secondary">
                Recipient
              </Text>

              <div>
                {selectedRecord.recipient_name ||
                  selectedRecord.farmer_name ||
                  '-'}
              </div>
            </Col>

            <Col span={12}>
              <Text type="secondary">
                Quantity
              </Text>

              <div>
                {selectedRecord.quantity_tons ??
                  selectedRecord.distribution_quantity ??
                  0}{' '}
                {selectedRecord.unit ||
                  'tons'}
              </div>
            </Col>

            <Col span={12}>
              <Text type="secondary">
                Status
              </Text>

              <div>

                <Tag
                  color={
                    ['completed', 'distributed']
                      .includes(
                        String(
                          selectedRecord.status ||
                          ''
                        ).toLowerCase()
                      )
                      ? 'success'
                      : selectedRecord.status ===
                        'cancelled'
                        ? 'error'
                        : 'warning'
                  }
                >
                  {selectedRecord.status ||
                    'Pending'}
                </Tag>

              </div>

            </Col>

            <Col span={24}>
              <Text type="secondary">
                Location
              </Text>

              <div>
                {selectedRecord.location ||
                  selectedRecord.kebele ||
                  '-'}
              </div>
            </Col>

            <Col span={24}>
              <Text type="secondary">
                Remarks
              </Text>

              <div>
                {selectedRecord.remarks ||
                  '-'}
              </div>
            </Col>

          </Row>

        )}

      </Modal>

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

export default SeedDistribution;