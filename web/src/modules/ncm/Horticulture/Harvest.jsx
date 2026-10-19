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

const productionTypes = [
  { value: 'vegetable', label: 'Vegetables' },
  { value: 'fruit', label: 'Fruits' },
  { value: 'spice_herb', label: 'Spices & Herbs' },
  { value: 'orchard', label: 'Orchards' }
];

const statuses = ['Planned', 'In Progress', 'Completed', 'Cancelled'];

export default function Harvest() {
  const [records, setRecords] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [search, setSearch] = useState('');
  const [productionType, setProductionType] = useState('All');
  const [status, setStatus] = useState('All');

  const [form] = Form.useForm();

  const [formVisible, setFormVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const fetchData = async () => {
    setLoading(true);

    try {
      const [harvestRes, farmRes] = await Promise.all([
        horticultureApi.getHarvests(),
        horticultureApi.getFarms()
      ]);

      setRecords(Array.isArray(harvestRes.data) ? harvestRes.data : []);
      setFarms(Array.isArray(farmRes.data) ? farmRes.data : []);
    } catch (error) {
      handleApiError(error, 'Failed to fetch harvest data');
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
          item.harvest_number,
          item.farm_name,
          item.farmer_name,
          item.crop_name,
          item.variety,
          item.destination
        ].some(v => String(v || '').toLowerCase().includes(q));

      return (
        matchesSearch &&
        (productionType === 'All' ||
          item.production_type === productionType) &&
        (status === 'All' || item.status === status)
      );
    });
  }, [records, search, productionType, status]);

  const openAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({ status: 'Planned' });
    setFormVisible(true);
  };

  const openEdit = record => {
    setEditingRecord(record);

    form.setFieldsValue({
      ...record,
      harvest_date: record.harvest_date
        ? dayjs(record.harvest_date)
        : null
    });

    setFormVisible(true);
  };

  const openDetail = async record => {
    try {
      setLoading(true);
      const res = await horticultureApi.getHarvest(record.id);
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
        harvest_date: values.harvest_date
          ? values.harvest_date.format('YYYY-MM-DD')
          : null
      };

      if (editingRecord) {
        await horticultureApi.updateHarvest(editingRecord.id, payload);
        message.success('Harvest record updated successfully');
      } else {
        await horticultureApi.createHarvest(payload);
        message.success('Harvest record created successfully');
      }

      setFormVisible(false);
      setEditingRecord(null);
      form.resetFields();
      fetchData();
    } catch (error) {
      handleApiError(error, 'Failed to save harvest record');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = record => {
    Modal.confirm({
      title: 'Delete Harvest Record?',
      content: `Delete harvest record "${record.harvest_number}"?`,
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await horticultureApi.deleteHarvest(record.id);
          message.success('Harvest record deleted successfully');
          fetchData();
        } catch (error) {
          handleApiError(error, 'Failed to delete harvest record');
        }
      }
    });
  };

  const columns = [
    {
      title: 'Harvest No.',
      dataIndex: 'harvest_number',
      render: v => <b>{v || '-'}</b>
    },
    {
      title: 'Farm',
      dataIndex: 'farm_name',
      render: v => v || '-'
    },
    {
      title: 'Crop',
      dataIndex: 'crop_name',
      render: v => v ? <Tag color="green">{v}</Tag> : '-'
    },
    {
      title: 'Type',
      dataIndex: 'production_type',
      render: v => {
        const item = productionTypes.find(x => x.value === v);
        return item?.label || v || '-';
      }
    },
    {
      title: 'Harvest Date',
      dataIndex: 'harvest_date',
      render: v => v || '-'
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity_harvested',
      render: (v, r) => v != null ? `${v} ${r.unit || 'kg'}` : '-'
    },
    {
      title: 'Grade',
      dataIndex: 'quality_grade',
      render: v => v || '-'
    },
    {
      title: 'Destination',
      dataIndex: 'destination',
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
      {loading && <BrandedLoader message="Loading harvest data..." />}

      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item><HomeOutlined /></Breadcrumb.Item>
        <Breadcrumb.Item>NCM</Breadcrumb.Item>
        <Breadcrumb.Item>Horticulture</Breadcrumb.Item>
        <Breadcrumb.Item>Harvest Management</Breadcrumb.Item>
      </Breadcrumb>

      <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
        <Col>
          <Title level={3} style={{ margin: 0, color: '#1a5f2c' }}>
            🧺 Harvest Management
          </Title>
          <Text type="secondary">
            Record and manage horticultural harvesting activities.
          </Text>
        </Col>

        <Col>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={fetchData}>
              Refresh
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>
              Add Harvest
            </Button>
          </Space>
        </Col>
      </Row>

      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search harvest, farm, crop..."
            allowClear
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: 320 }}
          />

          <Select
            value={productionType}
            onChange={setProductionType}
            style={{ width: 190 }}
            options={[
              { value: 'All', label: 'All Production Types' },
              ...productionTypes
            ]}
          />

          <Select
            value={status}
            onChange={setStatus}
            style={{ width: 170 }}
            options={[
              { value: 'All', label: 'All Status' },
              ...statuses.map(v => ({ value: v, label: v }))
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
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: t => `${t} harvest records`
          }}
        />
      </Card>

      <Modal
        title={editingRecord ? 'Edit Harvest Record' : 'Register Harvest'}
        open={formVisible}
        width={900}
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
        <Form form={form} layout="vertical" onFinish={handleSubmit}>

          <Divider orientation="left">Harvest Information</Divider>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                label="Harvest Number"
                name="harvest_number"
                rules={[{ required: true, message: 'Enter harvest number' }]}
              >
                <Input placeholder="e.g. HAR-2026-001" />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item label="Farm" name="farm_id"
                rules={[{ required: true, message: 'Select farm' }]}>
                <Select
                  showSearch
                  optionFilterProp="label"
                  options={farms.map(f => ({
                    value: f.id,
                    label: f.farm_name || f.name || `Farm #${f.id}`
                  }))}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item label="Production Type" name="production_type"
                rules={[{ required: true, message: 'Select production type' }]}>
                <Select options={productionTypes} />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item label="Crop" name="crop_name"
                rules={[{ required: true, message: 'Enter crop' }]}>
                <Input />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item label="Variety" name="variety">
                <Input />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item label="Harvest Date" name="harvest_date"
                rules={[{ required: true, message: 'Select harvest date' }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Quantity & Quality</Divider>

          <Row gutter={16}>
            <Col xs={24} md={6}>
              <Form.Item label="Area Harvested (Ha)" name="area_harvested">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>

            <Col xs={24} md={6}>
              <Form.Item label="Quantity Harvested" name="quantity_harvested">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>

            <Col xs={24} md={6}>
              <Form.Item label="Unit" name="unit" initialValue="kg">
                <Select options={[
                  'kg', 'quintal', 'ton', 'crate', 'box', 'piece'
                ].map(v => ({ value: v, label: v }))} />
              </Form.Item>
            </Col>

            <Col xs={24} md={6}>
              <Form.Item label="Quality Grade" name="quality_grade">
                <Select options={['A', 'B', 'C', 'Rejected'].map(v => ({
                  value: v, label: v
                }))} />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item label="Grade A Quantity" name="grade_a_quantity">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item label="Grade B Quantity" name="grade_b_quantity">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item label="Rejected Quantity" name="rejected_quantity">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Destination & Management</Divider>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item label="Harvest Method" name="harvest_method">
                <Input placeholder="Manual / Mechanical" />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item label="Destination" name="destination">
                <Select options={[
                  'Local Market',
                  'Regional Market',
                  'Storage',
                  'Processing',
                  'Export',
                  'Other'
                ].map(v => ({ value: v, label: v }))} />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item label="Status" name="status">
                <Select options={statuses.map(v => ({
                  value: v, label: v
                }))} />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item label="Remarks" name="remarks">
                <Input.TextArea rows={3} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      <Modal
        title="Harvest Details"
        open={detailVisible}
        width={850}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
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
              ['Harvest No.', selectedRecord.harvest_number],
              ['Farm', selectedRecord.farm_name],
              ['Production Type', selectedRecord.production_type],
              ['Crop', selectedRecord.crop_name],
              ['Variety', selectedRecord.variety],
              ['Harvest Date', selectedRecord.harvest_date],
              ['Area Harvested', selectedRecord.area_harvested],
              ['Quantity', selectedRecord.quantity_harvested],
              ['Unit', selectedRecord.unit],
              ['Quality Grade', selectedRecord.quality_grade],
              ['Destination', selectedRecord.destination],
              ['Harvest Method', selectedRecord.harvest_method],
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