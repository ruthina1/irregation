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
  Select,
  DatePicker,
  InputNumber,
  Divider
} from 'antd';

import {
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  EyeOutlined,
  ReloadOutlined,
  DatabaseOutlined
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

const SeedCertification = () => {
  const [records, setRecords] = useState([]);
  const [seedLots, setSeedLots] = useState([]);

  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const [formVisible, setFormVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);

  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);

    try {
      const res =
        await agronomyApi.getSeedCertifications();

      setRecords(
        Array.isArray(res.data)
          ? res.data
          : res.data?.data || []
      );
    } catch (error) {
      handleApiError(
        error,
        'Failed to fetch seed certifications'
      );
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    fetchData();
    fetchSeedLots();
  }, []);

  const stats = useMemo(() => ({
    total: records.length,

    pending: records.filter(
      x =>
        ['pending', 'submitted', 'under_review']
          .includes(x.status)
    ).length,

    certified: records.filter(
      x =>
        ['certified', 'approved']
          .includes(
            String(x.status || '').toLowerCase()
          )
    ).length,

    rejected: records.filter(
      x =>
        String(x.status || '').toLowerCase() ===
        'rejected'
    ).length
  }), [records]);

  const handleAdd = () => {
    setEditingRecord(null);

    form.resetFields();

    form.setFieldsValue({
      application_date: dayjs(),
      status: 'pending',
      certification_type: 'standard'
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

      application_date:
        record.application_date
          ? dayjs(record.application_date)
          : dayjs(),

      inspection_date:
        record.inspection_date
          ? dayjs(record.inspection_date)
          : null,

      certification_date:
        record.certification_date
          ? dayjs(record.certification_date)
          : null
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

        application_date:
          values.application_date
            ? values.application_date.format(
                'YYYY-MM-DD'
              )
            : null,

        inspection_date:
          values.inspection_date
            ? values.inspection_date.format(
                'YYYY-MM-DD'
              )
            : null,

        certification_date:
          values.certification_date
            ? values.certification_date.format(
                'YYYY-MM-DD'
              )
            : null
      };

      if (editingRecord) {
        await agronomyApi.updateSeedCertification(
          editingRecord.id,
          payload
        );

        message.success(
          'Seed certification updated successfully'
        );
      } else {
        await agronomyApi.createSeedCertification(
          payload
        );

        message.success(
          'Seed certification created successfully'
        );
      }

      handleCancel();
      fetchData();
    } catch (error) {
      handleApiError(
        error,
        editingRecord
          ? 'Failed to update certification'
          : 'Failed to create certification'
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async id => {
    try {
      await agronomyApi.deleteSeedCertification(id);

      message.success(
        'Certification record deleted successfully'
      );

      fetchData();
    } catch (error) {
      handleApiError(
        error,
        'Failed to delete certification'
      );
    }
  };

  const handleView = record => {
    setSelectedRecord(record);
    setDetailVisible(true);
  };

  const statusColor = {
    pending: 'warning',
    submitted: 'processing',
    under_review: 'processing',
    certified: 'success',
    approved: 'success',
    rejected: 'error',
    expired: 'default'
  };

  const columns = [
    {
      title: 'Certificate No.',
      dataIndex: 'certificate_number',
      key: 'certificate_number',
      width: 160,
      render: v => v || '-'
    },

    {
      title: 'Seed Lot',
      key: 'seed_lot',
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            {r.seed_lot?.lot_number ||
              r.lot_number ||
              r.seed_lot_number ||
              '-'}
          </div>

          <Text
            type="secondary"
            style={{ fontSize: 12 }}
          >
            {r.seed_lot?.variety?.name ||
              r.variety_name ||
              '-'}
          </Text>
        </div>
      )
    },

    {
      title: 'Certification Type',
      dataIndex: 'certification_type',
      key: 'certification_type',
      render: v =>
        <Tag color="blue">
          {v || '-'}
        </Tag>
    },

    {
      title: 'Inspector',
      dataIndex: 'inspector_name',
      key: 'inspector_name',
      render: v => v || '-'
    },

    {
      title: 'Inspection Date',
      dataIndex: 'inspection_date',
      key: 'inspection_date',
      render: v => v || '-'
    },

    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: v => (
        <Tag
          color={
            statusColor[
              String(v || '').toLowerCase()
            ] || 'default'
          }
        >
          {v || 'Pending'}
        </Tag>
      )
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
              `Certification ${
                record.certificate_number || ''
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
          message="Loading Seed Certifications..."
        />
      )}

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
              🏅 Seed Certification Management
            </Title>

            <Text type="secondary">
              Manage seed inspections,
              certification applications,
              certificates, and certification status
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
                Add Certification
              </Button>

            </Space>
          </Col>

        </Row>
      </div>

      <div style={{ padding: '0 16px 16px' }}>

        <Row
          gutter={[16, 16]}
          style={{ marginBottom: 16 }}
        >

          {[
            [
              'Total Applications',
              stats.total,
              DatabaseOutlined,
              '#52c41a'
            ],
            [
              'Pending',
              stats.pending,
              ClockCircleOutlined,
              '#1890ff'
            ],
            [
              'Certified',
              stats.certified,
              CheckCircleOutlined,
              '#fa8c16'
            ],
            [
              'Rejected',
              stats.rejected,
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
              description="No seed certification records found."
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
              scroll={{ x: 1200 }}
            />
          )}

        </Card>

      </div>

      {/* =====================================================
          CERTIFICATION FORM
      ===================================================== */}

      <Modal
        title={
          editingRecord
            ? 'Edit Seed Certification'
            : 'Add Seed Certification'
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
            Certification Application
          </Divider>

          <Row gutter={16}>

            <Col xs={24} md={12}>
              <Form.Item
                name="certificate_number"
                label="Certificate Number"
              >
                <Input
                  placeholder="e.g. CERT-2026-0001"
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
                name="certification_type"
                label="Certification Type"
                rules={[
                  {
                    required: true,
                    message:
                      'Please select certification type'
                  }
                ]}
              >
                <Select
                  options={[
                    {
                      value: 'standard',
                      label: 'Standard Certification'
                    },
                    {
                      value: 'basic',
                      label: 'Basic Certification'
                    },
                    {
                      value: 'quality_declared',
                      label: 'Quality Declared'
                    },
                    {
                      value: 'organic',
                      label: 'Organic'
                    }
                  ]}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="application_date"
                label="Application Date"
              >
                <DatePicker
                  style={{
                    width: '100%'
                  }}
                  format="YYYY-MM-DD"
                />
              </Form.Item>
            </Col>

          </Row>

          <Divider orientation="left">
            Inspection
          </Divider>

          <Row gutter={16}>

            <Col xs={24} md={12}>
              <Form.Item
                name="inspector_name"
                label="Inspector Name"
                rules={[
                  {
                    required: true,
                    message:
                      'Please enter inspector name'
                  }
                ]}
              >
                <Input
                  placeholder="Inspector name"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="inspection_date"
                label="Inspection Date"
              >
                <DatePicker
                  style={{
                    width: '100%'
                  }}
                  format="YYYY-MM-DD"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                name="field_inspection_result"
                label="Field Inspection"
              >
                <Select
                  options={[
                    {
                      value: 'passed',
                      label: 'Passed'
                    },
                    {
                      value: 'failed',
                      label: 'Failed'
                    },
                    {
                      value: 'conditional',
                      label: 'Conditional'
                    }
                  ]}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                name="quality_result"
                label="Quality Result"
              >
                <Select
                  options={[
                    {
                      value: 'passed',
                      label: 'Passed'
                    },
                    {
                      value: 'failed',
                      label: 'Failed'
                    },
                    {
                      value: 'pending',
                      label: 'Pending'
                    }
                  ]}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                name="sample_quantity"
                label="Sample Quantity"
              >
                <InputNumber
                  min={0}
                  style={{
                    width: '100%'
                  }}
                />
              </Form.Item>
            </Col>

          </Row>

          <Divider orientation="left">
            Certification Decision
          </Divider>

          <Row gutter={16}>

            <Col xs={24} md={12}>
              <Form.Item
                name="status"
                label="Certification Status"
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
                      value: 'submitted',
                      label: 'Submitted'
                    },
                    {
                      value: 'under_review',
                      label: 'Under Review'
                    },
                    {
                      value: 'certified',
                      label: 'Certified'
                    },
                    {
                      value: 'rejected',
                      label: 'Rejected'
                    },
                    {
                      value: 'expired',
                      label: 'Expired'
                    }
                  ]}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="certification_date"
                label="Certification Date"
              >
                <DatePicker
                  style={{
                    width: '100%'
                  }}
                  format="YYYY-MM-DD"
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
                  placeholder="Inspection findings, decision and remarks"
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

            <Button onClick={handleCancel}>
              Cancel
            </Button>

            <Button
              type="primary"
              htmlType="submit"
              loading={formLoading}
            >
              {editingRecord
                ? 'Update Certification'
                : 'Save Certification'}
            </Button>

          </div>

        </Form>

      </Modal>

      {/* DETAIL */}

      <Modal
        title="Seed Certification Details"
        open={detailVisible}
        onCancel={() =>
          setDetailVisible(false)
        }
        footer={null}
        width={750}
      >

        {selectedRecord && (
          <Row gutter={[20, 20]}>

            <Col span={12}>
              <Text type="secondary">
                Certificate Number
              </Text>
              <div>
                {selectedRecord.certificate_number ||
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
                Inspector
              </Text>
              <div>
                {selectedRecord.inspector_name ||
                  '-'}
              </div>
            </Col>

            <Col span={12}>
              <Text type="secondary">
                Inspection Date
              </Text>
              <div>
                {selectedRecord.inspection_date ||
                  '-'}
              </div>
            </Col>

            <Col span={12}>
              <Text type="secondary">
                Status
              </Text>
              <div>
                <Tag
                  color={
                    statusColor[
                      String(
                        selectedRecord.status ||
                        ''
                      ).toLowerCase()
                    ] || 'default'
                  }
                >
                  {selectedRecord.status ||
                    'Pending'}
                </Tag>
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
      `}</style>

    </div>
  );
};

export default SeedCertification;