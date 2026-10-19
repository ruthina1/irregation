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

const nurseryTypes = [
  'Vegetable Nursery',
  'Fruit Nursery',
  'Forest Nursery',
  'Ornamental Nursery',
  'Commercial Nursery',
  'Community Nursery',
  'Other'
];

const propagationMethods = [
  'Seed',
  'Cutting',
  'Grafting',
  'Layering',
  'Tissue Culture',
  'Other'
];

const statuses = ['Active', 'Inactive', 'Maintenance'];

export default function Nursery() {
  const [records, setRecords] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [search, setSearch] = useState('');
  const [type, setType] = useState('All');
  const [status, setStatus] = useState('All');

  const [form] = Form.useForm();

  const [formVisible, setFormVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const fetchData = async () => {
    setLoading(true);

    try {
      const [nurseryRes, farmRes] = await Promise.all([
        horticultureApi.getNurseries(),
        horticultureApi.getFarms()
      ]);

      setRecords(Array.isArray(nurseryRes.data) ? nurseryRes.data : []);
      setFarms(Array.isArray(farmRes.data) ? farmRes.data : []);
    } catch (error) {
      handleApiError(error, 'Failed to fetch nursery data');
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
          item.nursery_name,
          item.owner_name,
          item.nursery_type,
          item.plant_type,
          item.crop_name,
          item.variety,
          item.region,
          item.zone,
          item.woreda,
          item.kebele
        ].some(v => String(v || '').toLowerCase().includes(q));

      return (
        matchesSearch &&
        (type === 'All' || item.nursery_type === type) &&
        (status === 'All' || item.status === status)
      );
    });
  }, [records, search, type, status]);

  const openAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({ status: 'Active' });
    setFormVisible(true);
  };

  const openEdit = record => {
    setEditingRecord(record);

    form.setFieldsValue({
      ...record,
      establishment_date: record.establishment_date
        ? dayjs(record.establishment_date)
        : null
    });

    setFormVisible(true);
  };

  const openDetail = async record => {
    try {
      setLoading(true);
      const res = await horticultureApi.getNursery(record.id);
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
        establishment_date: values.establishment_date
          ? values.establishment_date.format('YYYY-MM-DD')
          : null
      };

      if (editingRecord) {
        await horticultureApi.updateNursery(editingRecord.id, payload);
        message.success('Nursery updated successfully');
      } else {
        await horticultureApi.createNursery(payload);
        message.success('Nursery registered successfully');
      }

      setFormVisible(false);
      setEditingRecord(null);
      form.resetFields();
      fetchData();
    } catch (error) {
      handleApiError(
        error,
        editingRecord
          ? 'Failed to update nursery'
          : 'Failed to register nursery'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = record => {
    Modal.confirm({
      title: 'Delete Nursery?',
      content: `Delete "${record.nursery_name}"?`,
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await horticultureApi.deleteNursery(record.id);
          message.success('Nursery deleted successfully');
          fetchData();
        } catch (error) {
          handleApiError(error, 'Failed to delete nursery');
        }
      }
    });
  };

  const columns = [
    {
      title: 'Nursery',
      dataIndex: 'nursery_name',
      render: v => <b>{v || '-'}</b>
    },
    {
      title: 'Owner / Operator',
      dataIndex: 'owner_name',
      render: v => v || '-'
    },
    {
      title: 'Type',
      dataIndex: 'nursery_type',
      render: v => v ? <Tag color="green">{v}</Tag> : '-'
    },
    {
      title: 'Plant / Crop',
      dataIndex: 'plant_type',
      render: v => v || '-'
    },
    {
      title: 'Variety',
      dataIndex: 'variety',
      render: v => v || '-'
    },
    {
      title: 'Capacity',
      dataIndex: 'production_capacity',
      render: v => v ?? '-'
    },
    {
      title: 'Available Seedlings',
      dataIndex: 'available_seedlings',
      render: v => v ?? '-'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: v => (
        <Tag color={v === 'Active' ? 'green' : 'orange'}>
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
      {loading && <BrandedLoader message="Loading nursery data..." />}

      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item><HomeOutlined /></Breadcrumb.Item>
        <Breadcrumb.Item>NCM</Breadcrumb.Item>
        <Breadcrumb.Item>Horticulture</Breadcrumb.Item>
        <Breadcrumb.Item>Nursery Management</Breadcrumb.Item>
      </Breadcrumb>

      <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
        <Col>
          <Title level={3} style={{ margin: 0, color: '#1a5f2c' }}>
            🌱 Nursery Management
          </Title>
          <Text type="secondary">
            Manage horticultural nurseries and planting materials.
          </Text>
        </Col>

        <Col>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={fetchData}>
              Refresh
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>
              Add Nursery
            </Button>
          </Space>
        </Col>
      </Row>

      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search nursery, crop, variety..."
            allowClear
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: 320 }}
          />

          <Select
            value={type}
            onChange={setType}
            style={{ width: 200 }}
            options={[
              { value: 'All', label: 'All Nursery Types' },
              ...nurseryTypes.map(v => ({ value: v, label: v }))
            ]}
          />

          <Select
            value={status}
            onChange={setStatus}
            style={{ width: 160 }}
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
          scroll={{ x: 1150 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: t => `${t} nursery records`
          }}
        />
      </Card>

      <Modal
        title={editingRecord ? 'Edit Nursery' : 'Register Nursery'}
        open={formVisible}
        width={850}
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

          <Divider orientation="left">Basic Information</Divider>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Nursery Name"
                name="nursery_name"
                rules={[{ required: true, message: 'Enter nursery name' }]}
              >
                <Input placeholder="Nursery name" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label="Farm" name="farm_id">
                <Select
                  showSearch
                  optionFilterProp="label"
                  placeholder="Select farm"
                  options={farms.map(f => ({
                    value: f.id,
                    label: f.farm_name || f.name || `Farm #${f.id}`
                  }))}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label="Owner / Operator" name="owner_name">
                <Input />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label="Registration Number" name="registration_number">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Location</Divider>

          <Row gutter={16}>
            {['region', 'zone', 'woreda', 'kebele'].map(field => (
              <Col xs={24} md={6} key={field}>
                <Form.Item
                  label={field.charAt(0).toUpperCase() + field.slice(1)}
                  name={field}
                >
                  <Input />
                </Form.Item>
              </Col>
            ))}
          </Row>

          <Divider orientation="left">Production</Divider>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item label="Nursery Type" name="nursery_type"
                rules={[{ required: true, message: 'Select nursery type' }]}>
                <Select options={nurseryTypes.map(v => ({ value: v, label: v }))} />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item label="Plant Type" name="plant_type">
                <Input placeholder="e.g. Vegetable, Fruit Seedling" />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item label="Crop" name="crop_name">
                <Input placeholder="e.g. Tomato" />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item label="Variety" name="variety">
                <Input />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item label="Propagation Method" name="propagation_method">
                <Select options={propagationMethods.map(v => ({
                  value: v, label: v
                }))} />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item label="Production Capacity" name="production_capacity">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item label="Current Seedlings" name="current_seedlings">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item label="Available Seedlings" name="available_seedlings">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item label="Establishment Date" name="establishment_date">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Certification & Management</Divider>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item label="Certified Nursery?" name="is_certified">
                <Select options={[
                  { value: true, label: 'Yes' },
                  { value: false, label: 'No' }
                ]} />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item label="Certification Number" name="certification_number">
                <Input />
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
        title="Nursery Details"
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
              ['Nursery', selectedRecord.nursery_name],
              ['Owner / Operator', selectedRecord.owner_name],
              ['Type', selectedRecord.nursery_type],
              ['Plant Type', selectedRecord.plant_type],
              ['Crop', selectedRecord.crop_name],
              ['Variety', selectedRecord.variety],
              ['Propagation', selectedRecord.propagation_method],
              ['Capacity', selectedRecord.production_capacity],
              ['Current Seedlings', selectedRecord.current_seedlings],
              ['Available Seedlings', selectedRecord.available_seedlings],
              ['Certification', selectedRecord.certification_number],
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