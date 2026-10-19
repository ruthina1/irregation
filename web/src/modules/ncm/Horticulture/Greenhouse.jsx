import React, { useEffect, useMemo, useState } from 'react';
import {
  Breadcrumb,
  Button,
  Card,
  Col,
  DatePicker,
  Descriptions,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message
} from 'antd';
import {
  HomeOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';

import horticultureApi from '../../../services/api/horticultureApi';
import { handleApiError } from '../../../utils/errorHandler';
import BrandedLoader from '../../../components/common/BrandedLoader';

const { Title, Text } = Typography;

const statusOptions = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
  { value: 'Maintenance', label: 'Maintenance' }
];

const greenhouseTypes = [
  'Traditional',
  'Tunnel',
  'Multi-span',
  'Net House',
  'Hydroponic',
  'Other'
];

const productionSystems = [
  'Soil Based',
  'Hydroponic',
  'Soilless',
  'Mixed',
  'Other'
];

export default function Greenhouse() {
  const [records, setRecords] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [type, setType] = useState('All');

  const [form] = Form.useForm();

  const [formVisible, setFormVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);

    try {
      const [greenhouseRes, farmRes] = await Promise.all([
        horticultureApi.getGreenhouses(),
        horticultureApi.getFarms()
      ]);

      setRecords(
        Array.isArray(greenhouseRes.data)
          ? greenhouseRes.data
          : []
      );

      setFarms(
        Array.isArray(farmRes.data)
          ? farmRes.data
          : []
      );
    } catch (error) {
      handleApiError(error, 'Failed to fetch greenhouse data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredRecords = useMemo(() => {
    const query = search.toLowerCase().trim();

    return records.filter(item => {
      const matchesSearch =
        !query ||
        [
          item.greenhouse_name,
          item.farm_name,
          item.owner_name,
          item.crop_name,
          item.variety,
          item.greenhouse_type,
          item.region,
          item.zone,
          item.woreda,
          item.kebele
        ].some(value =>
          String(value || '').toLowerCase().includes(query)
        );

      return (
        matchesSearch &&
        (status === 'All' || item.status === status) &&
        (type === 'All' || item.greenhouse_type === type)
      );
    });
  }, [records, search, status, type]);

  const openAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setFormVisible(true);
  };

  const openEdit = record => {
    setEditingRecord(record);

    form.setFieldsValue({
      ...record,
      establishment_date: record.establishment_date
        ? window.dayjs?.(record.establishment_date)
        : null
    });

    setFormVisible(true);
  };

  const openDetail = async record => {
    try {
      setLoading(true);

      const res = await horticultureApi.getGreenhouse(record.id);

      setSelectedRecord(res.data || record);
      setDetailVisible(true);
    } catch (error) {
      setSelectedRecord(record);
      setDetailVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async values => {
    setSubmitting(true);

    try {
      if (editingRecord) {
        await horticultureApi.updateGreenhouse(
          editingRecord.id,
          values
        );

        message.success('Greenhouse updated successfully');
      } else {
        await horticultureApi.createGreenhouse(values);

        message.success('Greenhouse created successfully');
      }

      setFormVisible(false);
      setEditingRecord(null);
      form.resetFields();
      fetchData();
    } catch (error) {
      handleApiError(
        error,
        editingRecord
          ? 'Failed to update greenhouse'
          : 'Failed to create greenhouse'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = record => {
    Modal.confirm({
      title: 'Delete greenhouse?',
      content: `Are you sure you want to delete "${record.greenhouse_name}"?`,
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await horticultureApi.deleteGreenhouse(record.id);

          message.success('Greenhouse deleted successfully');
          fetchData();
        } catch (error) {
          handleApiError(error, 'Failed to delete greenhouse');
        }
      }
    });
  };

  const columns = [
    {
      title: 'Greenhouse',
      dataIndex: 'greenhouse_name',
      render: value => <b>{value || '-'}</b>
    },
    {
      title: 'Farm',
      dataIndex: 'farm_name',
      render: value => value || '-'
    },
    {
      title: 'Type',
      dataIndex: 'greenhouse_type',
      render: value =>
        value ? <Tag color="green">{value}</Tag> : '-'
    },
    {
      title: 'Crop',
      dataIndex: 'crop_name',
      render: value => value || '-'
    },
    {
      title: 'Area (m²)',
      dataIndex: 'area_square_meters',
      render: value => value ?? '-'
    },
    {
      title: 'Production',
      dataIndex: 'production_system',
      render: value => value || '-'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: value => (
        <Tag color={value === 'Active' ? 'green' : 'orange'}>
          {value || '-'}
        </Tag>
      )
    },
    {
      title: 'Actions',
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => openDetail(record)}
          />

          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => openEdit(record)}
          />

          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          />
        </Space>
      )
    }
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: 24,
        background: '#fff'
      }}
    >
      {loading && (
        <BrandedLoader message="Loading greenhouse data..." />
      )}

      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item>
          <HomeOutlined />
        </Breadcrumb.Item>

        <Breadcrumb.Item>NCM</Breadcrumb.Item>

        <Breadcrumb.Item>Horticulture</Breadcrumb.Item>

        <Breadcrumb.Item>
          Greenhouse Management
        </Breadcrumb.Item>
      </Breadcrumb>

      {/* HEADER */}
      <Row
        justify="space-between"
        align="middle"
        style={{ marginBottom: 20 }}
      >
        <Col>
          <Title
            level={3}
            style={{
              margin: 0,
              color: '#1a5f2c'
            }}
          >
            🏠 Greenhouse Management
          </Title>

          <Text type="secondary">
            Manage greenhouse facilities and protected horticultural
            production.
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
              onClick={openAdd}
            >
              Add Greenhouse
            </Button>
          </Space>
        </Col>
      </Row>

      {/* FILTERS */}
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search greenhouse, farm, crop..."
            allowClear
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: 320 }}
          />

          <Select
            value={type}
            onChange={setType}
            style={{ width: 180 }}
            options={[
              { value: 'All', label: 'All Types' },
              ...greenhouseTypes.map(item => ({
                value: item,
                label: item
              }))
            ]}
          />

          <Select
            value={status}
            onChange={setStatus}
            style={{ width: 160 }}
            options={[
              { value: 'All', label: 'All Status' },
              ...statusOptions
            ]}
          />
        </Space>
      </Card>

      {/* TABLE */}
      <Card>
        <Table
          rowKey="id"
          dataSource={filteredRecords}
          columns={columns}
          loading={loading}
          scroll={{ x: 1100 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: total =>
              `${total} greenhouse records`
          }}
        />
      </Card>

      {/* FORM MODAL */}
      <Modal
        title={
          editingRecord
            ? 'Edit Greenhouse'
            : 'Register Greenhouse'
        }
        open={formVisible}
        onCancel={() => {
          setFormVisible(false);
          setEditingRecord(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        confirmLoading={submitting}
        width={850}
        destroyOnClose
        okText={editingRecord ? 'Update' : 'Register'}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Divider orientation="left">
            Basic Information
          </Divider>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Greenhouse Name"
                name="greenhouse_name"
                rules={[
                  {
                    required: true,
                    message: 'Enter greenhouse name'
                  }
                ]}
              >
                <Input placeholder="e.g. Bahir Dar Model Greenhouse" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Farm"
                name="farm_id"
                rules={[
                  {
                    required: true,
                    message: 'Select farm'
                  }
                ]}
              >
                <Select
                  showSearch
                  optionFilterProp="label"
                  placeholder="Select horticulture farm"
                  options={farms.map(farm => ({
                    value: farm.id,
                    label:
                      farm.farm_name ||
                      farm.name ||
                      `Farm #${farm.id}`
                  }))}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Owner / Operator"
                name="owner_name"
              >
                <Input placeholder="Owner or operator name" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Registration Number"
                name="registration_number"
              >
                <Input placeholder="Registration number" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">
            Greenhouse Information
          </Divider>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                label="Greenhouse Type"
                name="greenhouse_type"
                rules={[
                  {
                    required: true,
                    message: 'Select greenhouse type'
                  }
                ]}
              >
                <Select
                  placeholder="Select type"
                  options={greenhouseTypes.map(item => ({
                    value: item,
                    label: item
                  }))}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                label="Construction Type"
                name="construction_type"
              >
                <Input placeholder="e.g. Steel, Wood" />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                label="Area (m²)"
                name="area_square_meters"
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  placeholder="Area"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                label="Number of Greenhouses"
                name="number_of_greenhouses"
              >
                <InputNumber
                  min={1}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                label="Capacity"
                name="capacity"
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                label="Establishment Date"
                name="establishment_date"
              >
                <DatePicker
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">
            Production
          </Divider>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                label="Crop"
                name="crop_name"
              >
                <Input placeholder="e.g. Tomato" />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                label="Variety"
                name="variety"
              >
                <Input placeholder="Crop variety" />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                label="Production System"
                name="production_system"
              >
                <Select
                  placeholder="Select system"
                  options={productionSystems.map(item => ({
                    value: item,
                    label: item
                  }))}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                label="Irrigation System"
                name="irrigation_system"
              >
                <Input placeholder="e.g. Drip irrigation" />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                label="Climate Control"
                name="climate_control"
              >
                <Input placeholder="e.g. Ventilation" />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                label="Expected Production"
                name="expected_production"
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">
            Management
          </Divider>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Status"
                name="status"
                initialValue="Active"
                rules={[
                  {
                    required: true,
                    message: 'Select status'
                  }
                ]}
              >
                <Select options={statusOptions} />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Remarks"
                name="remarks"
              >
                <Input.TextArea
                  rows={3}
                  placeholder="Additional information..."
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* DETAIL MODAL */}
      <Modal
        title="Greenhouse Details"
        open={detailVisible}
        onCancel={() => {
          setDetailVisible(false);
          setSelectedRecord(null);
        }}
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
        width={850}
      >
        {selectedRecord && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Greenhouse">
              {selectedRecord.greenhouse_name || '-'}
            </Descriptions.Item>

            <Descriptions.Item label="Farm">
              {selectedRecord.farm_name || '-'}
            </Descriptions.Item>

            <Descriptions.Item label="Owner">
              {selectedRecord.owner_name || '-'}
            </Descriptions.Item>

            <Descriptions.Item label="Registration No.">
              {selectedRecord.registration_number || '-'}
            </Descriptions.Item>

            <Descriptions.Item label="Type">
              {selectedRecord.greenhouse_type || '-'}
            </Descriptions.Item>

            <Descriptions.Item label="Construction">
              {selectedRecord.construction_type || '-'}
            </Descriptions.Item>

            <Descriptions.Item label="Area">
              {selectedRecord.area_square_meters
                ? `${selectedRecord.area_square_meters} m²`
                : '-'}
            </Descriptions.Item>

            <Descriptions.Item label="Crop">
              {selectedRecord.crop_name || '-'}
            </Descriptions.Item>

            <Descriptions.Item label="Variety">
              {selectedRecord.variety || '-'}
            </Descriptions.Item>

            <Descriptions.Item label="Production System">
              {selectedRecord.production_system || '-'}
            </Descriptions.Item>

            <Descriptions.Item label="Irrigation">
              {selectedRecord.irrigation_system || '-'}
            </Descriptions.Item>

            <Descriptions.Item label="Climate Control">
              {selectedRecord.climate_control || '-'}
            </Descriptions.Item>

            <Descriptions.Item label="Status">
              <Tag color="green">
                {selectedRecord.status || '-'}
              </Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Remarks">
              {selectedRecord.remarks || '-'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}