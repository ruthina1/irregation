import React, { useEffect, useMemo, useState } from 'react';
import {
  Breadcrumb, Button, Card, Col, DatePicker, Descriptions,
  Divider, Form, Input, InputNumber, Modal, Row, Select,
  Space, Table, Tag, Typography, message
} from 'antd';
import {
  HomeOutlined, PlusOutlined, ReloadOutlined,
  SearchOutlined, EyeOutlined, EditOutlined, DeleteOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

import horticultureApi from '../../../services/api/horticultureApi';
import { handleApiError } from '../../../utils/errorHandler';
import BrandedLoader from '../../../components/common/BrandedLoader';

const { Title, Text } = Typography;

const processes = [
  'Sorting',
  'Grading',
  'Washing',
  'Cleaning',
  'Packaging',
  'Storage',
  'Transportation',
  'Processing',
  'Other'
];

const storageTypes = [
  'Cold Storage',
  'Dry Storage',
  'Warehouse',
  'Controlled Atmosphere',
  'Open Storage',
  'Other'
];

const statuses = [
  'In Progress',
  'Completed',
  'Cancelled'
];

export default function PostHarvest() {
  const [records, setRecords] = useState([]);
  const [harvests, setHarvests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [search, setSearch] = useState('');
  const [process, setProcess] = useState('All');
  const [status, setStatus] = useState('All');

  const [form] = Form.useForm();

  const [formVisible, setFormVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const fetchData = async () => {
    setLoading(true);

    try {
      const [postRes, harvestRes] = await Promise.all([
        horticultureApi.getPostHarvests(),
        horticultureApi.getHarvests()
      ]);

      setRecords(Array.isArray(postRes.data) ? postRes.data : []);
      setHarvests(Array.isArray(harvestRes.data) ? harvestRes.data : []);
    } catch (error) {
      handleApiError(error, 'Failed to fetch post-harvest data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredRecords = useMemo(() => {
    const q = search.toLowerCase().trim();

    return records.filter(item => {
      const matchesSearch =
        !q ||
        [
          item.record_number,
          item.farm_name,
          item.crop_name,
          item.variety,
          item.storage_type,
          item.destination
        ].some(v => String(v || '').toLowerCase().includes(q));

      return (
        matchesSearch &&
        (process === 'All' || item.process_type === process) &&
        (status === 'All' || item.status === status)
      );
    });
  }, [records, search, process, status]);

  const openAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({ status: 'In Progress' });
    setFormVisible(true);
  };

  const openEdit = record => {
    setEditingRecord(record);

    form.setFieldsValue({
      ...record,
      processing_date: record.processing_date
        ? dayjs(record.processing_date)
        : null,
      storage_date: record.storage_date
        ? dayjs(record.storage_date)
        : null
    });

    setFormVisible(true);
  };

  const openDetail = async record => {
    try {
      setLoading(true);
      const res = await horticultureApi.getPostHarvest(record.id);
      setSelectedRecord(res.data || record);
    } catch {
      setSelectedRecord(record);
    } finally {
      setLoading(false);
      setDetailVisible(true);
    }
  };

  const handleSubmit = async values => {
    setSubmitting(true);

    try {
      const payload = {
        ...values,
        processing_date: values.processing_date
          ? values.processing_date.format('YYYY-MM-DD')
          : null,
        storage_date: values.storage_date
          ? values.storage_date.format('YYYY-MM-DD')
          : null
      };

      if (editingRecord) {
        await horticultureApi.updatePostHarvest(
          editingRecord.id,
          payload
        );

        message.success('Post-harvest record updated successfully');
      } else {
        await horticultureApi.createPostHarvest(payload);

        message.success('Post-harvest record created successfully');
      }

      setFormVisible(false);
      setEditingRecord(null);
      form.resetFields();
      fetchData();
    } catch (error) {
      handleApiError(error, 'Failed to save post-harvest record');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = record => {
    Modal.confirm({
      title: 'Delete Post-Harvest Record?',
      content: `Delete "${record.record_number}"?`,
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await horticultureApi.deletePostHarvest(record.id);

          message.success(
            'Post-harvest record deleted successfully'
          );

          fetchData();
        } catch (error) {
          handleApiError(
            error,
            'Failed to delete post-harvest record'
          );
        }
      }
    });
  };

  const columns = [
    {
      title: 'Record No.',
      dataIndex: 'record_number',
      render: v => <b>{v || '-'}</b>
    },
    {
      title: 'Harvest',
      dataIndex: 'harvest_number',
      render: v => v || '-'
    },
    {
      title: 'Farm',
      dataIndex: 'farm_name',
      render: v => v || '-'
    },
    {
      title: 'Produce',
      dataIndex: 'crop_name',
      render: v => v ? <Tag color="green">{v}</Tag> : '-'
    },
    {
      title: 'Process',
      dataIndex: 'process_type',
      render: v => v || '-'
    },
    {
      title: 'Received',
      dataIndex: 'quantity_received',
      render: (v, r) => v != null ? `${v} ${r.unit || 'kg'}` : '-'
    },
    {
      title: 'Processed',
      dataIndex: 'quantity_processed',
      render: (v, r) => v != null ? `${v} ${r.unit || 'kg'}` : '-'
    },
    {
      title: 'Loss',
      dataIndex: 'quantity_lost',
      render: (v, r) => v != null ? `${v} ${r.unit || 'kg'}` : '-'
    },
    {
      title: 'Storage',
      dataIndex: 'storage_type',
      render: v => v || '-'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: v => (
        <Tag color={v === 'Completed' ? 'green' : 'orange'}>
          {v || '-'}
        </Tag>
      )
    },
    {
      title: 'Actions',
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<EyeOutlined />}
            onClick={() => openDetail(record)} />
          <Button type="text" icon={<EditOutlined />}
            onClick={() => openEdit(record)} />
          <Button danger type="text" icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)} />
        </Space>
      )
    }
  ];

  return (
    <div style={{ minHeight: '100vh', padding: 24, background: '#fff' }}>
      {loading && (
        <BrandedLoader message="Loading post-harvest data..." />
      )}

      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item><HomeOutlined /></Breadcrumb.Item>
        <Breadcrumb.Item>NCM</Breadcrumb.Item>
        <Breadcrumb.Item>Horticulture</Breadcrumb.Item>
        <Breadcrumb.Item>Post-Harvest Management</Breadcrumb.Item>
      </Breadcrumb>

      <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
        <Col>
          <Title level={3} style={{ margin: 0, color: '#1a5f2c' }}>
            📦 Post-Harvest Management
          </Title>

          <Text type="secondary">
            Manage sorting, grading, packaging, storage and
            post-harvest handling.
          </Text>
        </Col>

        <Col>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={fetchData}>
              Refresh
            </Button>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openAdd}
            >
              Add Post-Harvest
            </Button>
          </Space>
        </Col>
      </Row>

      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search record, harvest, farm, produce..."
            allowClear
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: 330 }}
          />

          <Select
            value={process}
            onChange={setProcess}
            style={{ width: 190 }}
            options={[
              { value: 'All', label: 'All Processes' },
              ...processes.map(v => ({
                value: v,
                label: v
              }))
            ]}
          />

          <Select
            value={status}
            onChange={setStatus}
            style={{ width: 170 }}
            options={[
              { value: 'All', label: 'All Status' },
              ...statuses.map(v => ({
                value: v,
                label: v
              }))
            ]}
          />
        </Space>
      </Card>

      <Card>
        <Table
          rowKey="id"
          dataSource={filteredRecords}
          columns={columns}
          loading={loading}
          scroll={{ x: 1350 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: t =>
              `${t} post-harvest records`
          }}
        />
      </Card>

      {/* FORM */}
      <Modal
        title={
          editingRecord
            ? 'Edit Post-Harvest Record'
            : 'Register Post-Harvest Record'
        }
        open={formVisible}
        width={950}
        destroyOnClose
        confirmLoading={submitting}
        onCancel={() => {
          setFormVisible(false);
          setEditingRecord(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText={editingRecord ? 'Update' : 'Register'}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Divider orientation="left">
            Record Information
          </Divider>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                label="Record Number"
                name="record_number"
                rules={[
                  {
                    required: true,
                    message: 'Enter record number'
                  }
                ]}
              >
                <Input placeholder="e.g. PH-2026-001" />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                label="Harvest Record"
                name="harvest_id"
                rules={[
                  {
                    required: true,
                    message: 'Select harvest'
                  }
                ]}
              >
                <Select
                  showSearch
                  optionFilterProp="label"
                  placeholder="Select harvest"
                  options={harvests.map(h => ({
                    value: h.id,
                    label:
                      h.harvest_number ||
                      `Harvest #${h.id}`
                  }))}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                label="Process"
                name="process_type"
                rules={[
                  {
                    required: true,
                    message: 'Select process'
                  }
                ]}
              >
                <Select
                  options={processes.map(v => ({
                    value: v,
                    label: v
                  }))}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                label="Crop / Produce"
                name="crop_name"
              >
                <Input />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                label="Variety"
                name="variety"
              >
                <Input />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                label="Processing Date"
                name="processing_date"
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">
            Quantity & Quality
          </Divider>

          <Row gutter={16}>
            <Col xs={24} md={6}>
              <Form.Item
                label="Quantity Received"
                name="quantity_received"
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={6}>
              <Form.Item
                label="Quantity Processed"
                name="quantity_processed"
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={6}>
              <Form.Item
                label="Quantity Lost"
                name="quantity_lost"
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={6}>
              <Form.Item
                label="Unit"
                name="unit"
                initialValue="kg"
              >
                <Select
                  options={[
                    'kg',
                    'quintal',
                    'ton',
                    'crate',
                    'box',
                    'piece'
                  ].map(v => ({
                    value: v,
                    label: v
                  }))}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                label="Initial Grade"
                name="initial_grade"
              >
                <Select
                  options={['A', 'B', 'C', 'Rejected'].map(v => ({
                    value: v,
                    label: v
                  }))}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                label="Final Grade"
                name="final_grade"
              >
                <Select
                  options={['A', 'B', 'C', 'Rejected'].map(v => ({
                    value: v,
                    label: v
                  }))}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                label="Quality Remarks"
                name="quality_remarks"
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">
            Storage & Destination
          </Divider>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                label="Storage Type"
                name="storage_type"
              >
                <Select
                  options={storageTypes.map(v => ({
                    value: v,
                    label: v
                  }))}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                label="Storage Location"
                name="storage_location"
              >
                <Input />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                label="Storage Date"
                name="storage_date"
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                label="Expected Storage Duration"
                name="storage_duration"
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  addonAfter="days"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                label="Destination"
                name="destination"
              >
                <Select
                  options={[
                    'Local Market',
                    'Regional Market',
                    'Export',
                    'Processing',
                    'Storage',
                    'Other'
                  ].map(v => ({
                    value: v,
                    label: v
                  }))}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                label="Status"
                name="status"
              >
                <Select
                  options={statuses.map(v => ({
                    value: v,
                    label: v
                  }))}
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label="Remarks"
                name="remarks"
              >
                <Input.TextArea rows={3} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* DETAIL */}
      <Modal
        title="Post-Harvest Details"
        open={detailVisible}
        width={900}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button
            key="close"
            onClick={() => setDetailVisible(false)}
          >
            Close
          </Button>,
          <Button
            key="edit"
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setDetailVisible(false);
              openEdit(selectedRecord);
            }}
          >
            Edit
          </Button>
        ]}
      >
        {selectedRecord && (
          <Descriptions bordered column={2}>
            {[
              ['Record No.', selectedRecord.record_number],
              ['Harvest', selectedRecord.harvest_number],
              ['Farm', selectedRecord.farm_name],
              ['Crop', selectedRecord.crop_name],
              ['Variety', selectedRecord.variety],
              ['Process', selectedRecord.process_type],
              ['Processing Date', selectedRecord.processing_date],
              ['Quantity Received', selectedRecord.quantity_received],
              ['Quantity Processed', selectedRecord.quantity_processed],
              ['Quantity Lost', selectedRecord.quantity_lost],
              ['Unit', selectedRecord.unit],
              ['Initial Grade', selectedRecord.initial_grade],
              ['Final Grade', selectedRecord.final_grade],
              ['Storage', selectedRecord.storage_type],
              ['Storage Location', selectedRecord.storage_location],
              ['Destination', selectedRecord.destination],
              ['Status', selectedRecord.status],
              ['Remarks', selectedRecord.remarks]
            ].map(([label, value]) => (
              <Descriptions.Item key={label} label={label}>
                {value ?? '-'}
              </Descriptions.Item>
            ))}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}