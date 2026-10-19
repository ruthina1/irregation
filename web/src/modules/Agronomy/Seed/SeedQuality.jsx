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
  ExperimentOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  EyeOutlined,
  ReloadOutlined,
  DatabaseOutlined,
  EditOutlined
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

const SeedQuality = () => {
  const [records, setRecords] = useState([]);
  const [seedLots, setSeedLots] = useState([]);

  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const [formVisible, setFormVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);

  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const [form] = Form.useForm();

  /* =========================================================
     FETCH DATA
  ========================================================= */

  const fetchData = async () => {
    setLoading(true);

    try {
      const res = await agronomyApi.getSeedQuality();

      setRecords(
        Array.isArray(res.data)
          ? res.data
          : res.data?.data || []
      );
    } catch (error) {
      handleApiError(
        error,
        'Failed to fetch seed quality records'
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchSeedLots = async () => {
    try {
      const res = await agronomyApi.getSeedRegistrations();

      const list = Array.isArray(res.data)
        ? res.data
        : res.data?.data || [];

      setSeedLots(list);
    } catch (error) {
      console.error('Failed to load seed lots:', error);
      setSeedLots([]);
    }
  };

  useEffect(() => {
    fetchData();
    fetchSeedLots();
  }, []);

  /* =========================================================
     STATISTICS
  ========================================================= */

  const stats = useMemo(() => ({
    total: records.length,

    pending: records.filter(
      x =>
        ['pending', 'under_test', 'under_testing']
          .includes(x.status)
    ).length,

    passed: records.filter(
      x =>
        ['passed', 'pass'].includes(
          String(x.result || '').toLowerCase()
        )
    ).length,

    failed: records.filter(
      x =>
        ['failed', 'fail'].includes(
          String(x.result || '').toLowerCase()
        )
    ).length
  }), [records]);

  /* =========================================================
     FORM
  ========================================================= */

  const handleAdd = () => {
    setEditingRecord(null);

    form.resetFields();

    form.setFieldsValue({
      test_date: dayjs(),
      result: 'pending',
      status: 'pending'
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

      test_date: record.test_date
        ? dayjs(record.test_date)
        : dayjs()
    });

    setFormVisible(true);
  };

  const handleFormCancel = () => {
    form.resetFields();
    setFormVisible(false);
    setEditingRecord(null);
  };

  const handleFormSubmit = async values => {
    setFormLoading(true);

    try {
      const payload = {
        ...values,

        test_date: values.test_date
          ? values.test_date.format('YYYY-MM-DD')
          : null
      };

      if (editingRecord) {
        await agronomyApi.updateSeedQuality(
          editingRecord.id,
          payload
        );

        message.success(
          'Seed quality test updated successfully'
        );
      } else {
        await agronomyApi.createSeedQuality(payload);

        message.success(
          'Seed quality test created successfully'
        );
      }

      handleFormCancel();
      fetchData();
    } catch (error) {
      handleApiError(
        error,
        editingRecord
          ? 'Failed to update seed quality test'
          : 'Failed to create seed quality test'
      );
    } finally {
      setFormLoading(false);
    }
  };

  /* =========================================================
     DELETE
  ========================================================= */

  const handleDelete = async id => {
    try {
      await agronomyApi.deleteSeedQuality(id);

      message.success(
        'Quality record deleted successfully'
      );

      fetchData();
    } catch (error) {
      handleApiError(
        error,
        'Failed to delete quality record'
      );
    }
  };

  /* =========================================================
     VIEW
  ========================================================= */

  const handleView = record => {
    setSelectedRecord(record);
    setDetailVisible(true);
  };

  /* =========================================================
     TABLE
  ========================================================= */

  const columns = [
    {
      title: 'Test No.',
      dataIndex: 'test_number',
      key: 'test_number',
      width: 130,
      render: v => v || '-'
    },

    {
      title: 'Seed Lot',
      dataIndex: 'seed_lot',
      key: 'seed_lot',
      render: (v, r) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            {v?.lot_number ||
              r.lot_number ||
              r.seed_lot_number ||
              '-'}
          </div>

          <Text
            type="secondary"
            style={{ fontSize: 12 }}
          >
            {v?.variety?.name ||
              r.variety_name ||
              '-'}
          </Text>
        </div>
      )
    },

    {
      title: 'Crop',
      dataIndex: 'crop_type',
      key: 'crop_type',
      render: v =>
        <Tag color="blue">
          {v || '-'}
        </Tag>
    },

    {
      title: 'Germination',
      dataIndex: 'germination_rate',
      key: 'germination_rate',
      render: v =>
        v != null
          ? <Tag color="green">{v}%</Tag>
          : '-'
    },

    {
      title: 'Purity',
      dataIndex: 'purity_percentage',
      key: 'purity_percentage',
      render: v =>
        v != null
          ? <Tag color="cyan">{v}%</Tag>
          : '-'
    },

    {
      title: 'Moisture',
      dataIndex: 'moisture_content',
      key: 'moisture_content',
      render: v =>
        v != null
          ? <Tag>{v}%</Tag>
          : '-'
    },

    {
      title: 'Result',
      dataIndex: 'result',
      key: 'result',
      render: v => {
        const value =
          String(v || 'pending').toLowerCase();

        return (
          <Tag
            color={
              ['passed', 'pass'].includes(value)
                ? 'success'
                : ['failed', 'fail'].includes(value)
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
      title: 'Test Date',
      dataIndex: 'test_date',
      key: 'test_date',
      render: v => v || '-'
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
              onClick={() => handleView(record)}
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
              `Quality Test ${
                record.test_number || ''
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
          message="Loading Seed Quality..."
        />
      )}

      {/* HEADER */}

      <div
        style={{
          padding: 16,
          marginBottom: 16,
          borderBottom: '1px solid #f0f0f0'
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
              🔬 Seed Quality Management
            </Title>

            <Text type="secondary">
              Manage seed laboratory tests,
              quality parameters, and test results
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
                Add Quality Test
              </Button>

            </Space>
          </Col>
        </Row>
      </div>

      <div style={{ padding: '0 16px 16px' }}>

        {/* STATISTICS */}

        <Row
          gutter={[16, 16]}
          style={{ marginBottom: 16 }}
        >

          {[
            [
              'Total Tests',
              stats.total,
              DatabaseOutlined,
              '#52c41a'
            ],
            [
              'Pending Tests',
              stats.pending,
              ClockCircleOutlined,
              '#1890ff'
            ],
            [
              'Passed',
              stats.passed,
              CheckCircleOutlined,
              '#fa8c16'
            ],
            [
              'Failed',
              stats.failed,
              CloseCircleOutlined,
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
              description={
                <span>
                  No seed quality tests found.
                </span>
              }
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
              scroll={{ x: 1100 }}
            />
          )}

        </Card>

      </div>

      {/* =====================================================
          ADD / EDIT QUALITY FORM
      ===================================================== */}

      <Modal
        title={
          editingRecord
            ? 'Edit Seed Quality Test'
            : 'Add Seed Quality Test'
        }
        open={formVisible}
        onCancel={handleFormCancel}
        footer={null}
        width={850}
        destroyOnClose
      >

        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
        >

          <Divider orientation="left">
            Test Information
          </Divider>

          <Row gutter={16}>

            <Col xs={24} md={12}>
              <Form.Item
                name="test_number"
                label="Test Number"
                rules={[
                  {
                    required: true,
                    message:
                      'Please enter test number'
                  }
                ]}
              >
                <Input
                  placeholder="e.g. QT-2026-0001"
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
                      value:
                        lot.id,
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
                name="test_date"
                label="Test Date"
                rules={[
                  {
                    required: true,
                    message:
                      'Please select test date'
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
                name="laboratory"
                label="Laboratory"
              >
                <Input
                  placeholder="Laboratory name"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="analyst"
                label="Analyst"
              >
                <Input
                  placeholder="Analyst name"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="sample_size"
                label="Sample Size"
              >
                <InputNumber
                  min={0}
                  style={{
                    width: '100%'
                  }}
                  placeholder="Sample size"
                />
              </Form.Item>
            </Col>

          </Row>

          <Divider orientation="left">
            Quality Parameters
          </Divider>

          <Row gutter={16}>

            <Col xs={24} md={8}>
              <Form.Item
                name="germination_rate"
                label="Germination Rate (%)"
              >
                <InputNumber
                  min={0}
                  max={100}
                  style={{
                    width: '100%'
                  }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                name="purity_percentage"
                label="Physical Purity (%)"
              >
                <InputNumber
                  min={0}
                  max={100}
                  style={{
                    width: '100%'
                  }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                name="moisture_content"
                label="Moisture Content (%)"
              >
                <InputNumber
                  min={0}
                  max={100}
                  style={{
                    width: '100%'
                  }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="seed_health"
                label="Seed Health"
              >
                <Select
                  placeholder="Select seed health"
                  options={[
                    {
                      value: 'healthy',
                      label: 'Healthy'
                    },
                    {
                      value: 'acceptable',
                      label: 'Acceptable'
                    },
                    {
                      value: 'poor',
                      label: 'Poor'
                    }
                  ]}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="other_quality_parameters"
                label="Other Quality Parameters"
              >
                <Input placeholder="Additional quality parameters" />
              </Form.Item>
            </Col>

          </Row>

          <Divider orientation="left">
            Result
          </Divider>

          <Row gutter={16}>

            <Col xs={24} md={12}>
              <Form.Item
                name="result"
                label="Test Result"
                rules={[
                  {
                    required: true,
                    message:
                      'Please select test result'
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
                      value: 'passed',
                      label: 'Passed'
                    },
                    {
                      value: 'failed',
                      label: 'Failed'
                    }
                  ]}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="status"
                label="Status"
              >
                <Select
                  options={[
                    {
                      value: 'pending',
                      label: 'Pending'
                    },
                    {
                      value: 'under_test',
                      label: 'Under Test'
                    },
                    {
                      value: 'completed',
                      label: 'Completed'
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
                  placeholder="Additional observations or remarks"
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
              onClick={handleFormCancel}
            >
              Cancel
            </Button>

            <Button
              type="primary"
              htmlType="submit"
              loading={formLoading}
            >
              {editingRecord
                ? 'Update Quality Test'
                : 'Save Quality Test'}
            </Button>

          </div>

        </Form>

      </Modal>

      {/* DETAIL MODAL */}

      <Modal
        title="Seed Quality Test Details"
        open={detailVisible}
        onCancel={() =>
          setDetailVisible(false)
        }
        footer={null}
        width={700}
      >

        {selectedRecord && (
          <Row gutter={[16, 16]}>

            <Col span={12}>
              <Text type="secondary">
                Test Number
              </Text>
              <div>
                {selectedRecord.test_number || '-'}
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
                Germination
              </Text>
              <div>
                {selectedRecord.germination_rate != null
                  ? `${selectedRecord.germination_rate}%`
                  : '-'}
              </div>
            </Col>

            <Col span={12}>
              <Text type="secondary">
                Purity
              </Text>
              <div>
                {selectedRecord.purity_percentage != null
                  ? `${selectedRecord.purity_percentage}%`
                  : '-'}
              </div>
            </Col>

            <Col span={12}>
              <Text type="secondary">
                Moisture
              </Text>
              <div>
                {selectedRecord.moisture_content != null
                  ? `${selectedRecord.moisture_content}%`
                  : '-'}
              </div>
            </Col>

            <Col span={12}>
              <Text type="secondary">
                Result
              </Text>
              <div>
                <Tag
                  color={
                    selectedRecord.result === 'passed'
                      ? 'success'
                      : selectedRecord.result === 'failed'
                        ? 'error'
                        : 'warning'
                  }
                >
                  {selectedRecord.result || 'Pending'}
                </Tag>
              </div>
            </Col>

            <Col span={24}>
              <Text type="secondary">
                Remarks
              </Text>
              <div>
                {selectedRecord.remarks || '-'}
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
      `}</style>

    </div>
  );
};

export default SeedQuality;