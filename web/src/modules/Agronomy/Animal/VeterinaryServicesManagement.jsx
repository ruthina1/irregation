import React, { useState, useEffect } from 'react';
import { 
  Table, Card, Row, Col, Statistic, Button, Tag, Space, 
  Typography, Empty, Tooltip, message, Input, Select, Modal,
  Form, DatePicker
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, 
  ReloadOutlined, MedicineBoxOutlined, CheckCircleOutlined,
  ClockCircleOutlined, CloseCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import BrandedLoader from '../../../components/common/BrandedLoader';
import { DeleteButton } from '../../../components/common/ActionButtons';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Mock Data
const mockServices = [
  {
    id: '1',
    animal_id: 'AN-001',
    service_type: 'examination',
    date: '2024-06-15',
    veterinarian: 'ዶ/ር በኀይሉ አደማሱ',
    diagnosis: 'የመተንፈሻ አካላት በሽታ',
    treatment: 'አንቲባዮቲክ',
    cost: 500,
    follow_up_date: '2024-06-22',
    status: 'completed',
    animal_type: 'ከብቲ',
    owner_name: 'አበበ በቀለ'
  },
  {
    id: '2',
    animal_id: 'AN-003',
    service_type: 'vaccination',
    date: '2024-07-20',
    veterinarian: 'ዶ/ር ሀና ተስፋዬ',
    diagnosis: 'የማይል በሽታ መከላከያ',
    treatment: 'ክትባት',
    cost: 200,
    follow_up_date: '2024-08-20',
    status: 'scheduled',
    animal_type: 'በግ',
    owner_name: 'ሰላም አለሙ'
  }
];

const CARD_STYLE_GREEN = { borderRight: '1px solid #f0f0f0', borderBottom: '3px solid #52c41a', borderRadius: 0, height: '100%', boxShadow: 'none' };
const CARD_STYLE_BLUE = { borderRight: '1px solid #f0f0f0', borderBottom: '3px solid #1890ff', borderRadius: 0, height: '100%', boxShadow: 'none' };
const CARD_STYLE_ORANGE = { borderRight: '1px solid #f0f0f0', borderBottom: '3px solid #fa8c16', borderRadius: 0, height: '100%', boxShadow: 'none' };

const VeterinaryServicesManagement = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    filterServices();
  }, [searchText, typeFilter, statusFilter, services]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setServices(mockServices);
    } catch (error) {
      message.error('Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  const filterServices = () => {
    let filtered = services;
    if (searchText) {
      filtered = filtered.filter(item =>
        item.animal_id?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.owner_name?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.veterinarian?.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    if (typeFilter !== 'All') {
      filtered = filtered.filter(item => item.service_type === typeFilter);
    }
    if (statusFilter !== 'All') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }
    return filtered;
  };

  const handleDelete = (id) => {
    setServices(services.filter(item => item.id !== id));
    message.success('የህክምና አገልግሎት ተሰርዟል');
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue({
      animal_id: record.animal_id,
      service_type: record.service_type,
      date: record.date ? dayjs(record.date) : null,
      veterinarian: record.veterinarian,
      diagnosis: record.diagnosis,
      treatment: record.treatment,
      cost: record.cost,
      follow_up_date: record.follow_up_date ? dayjs(record.follow_up_date) : null,
      status: record.status
    });
    setModalVisible(true);
  };

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({
      status: 'scheduled'
    });
    setModalVisible(true);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setEditingRecord(null);
    form.resetFields();
  };

  const handleFormSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const newService = {
        id: editingRecord ? editingRecord.id : `${Date.now()}`,
        ...values,
        date: values.date?.format('YYYY-MM-DD'),
        follow_up_date: values.follow_up_date?.format('YYYY-MM-DD')
      };

      if (editingRecord) {
        setServices(services.map(item => item.id === editingRecord.id ? newService : item));
        message.success('አገልግሎት ተሻሽሏል');
      } else {
        setServices([newService, ...services]);
        message.success('አገልግሎት ተመዝግቧል');
      }
      handleModalCancel();
    } catch (error) {
      message.error('Failed to save service');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: 'orange',
      completed: 'green',
      cancelled: 'red',
      in_progress: 'blue'
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      scheduled: 'የታቀደ',
      completed: 'ተጠናቋል',
      cancelled: 'ተሰርዟል',
      in_progress: 'በሂደት ላይ'
    };
    return labels[status] || status;
  };

  const getServiceTypeLabel = (type) => {
    const labels = {
      examination: 'ምርመራ',
      vaccination: 'ክትባት',
      surgery: 'ቀዶ ጥገና',
      treatment: 'ህክምና'
    };
    return labels[type] || type;
  };

  const columns = [
    {
      title: 'የእንስሳ መለያ',
      dataIndex: 'animal_id',
      key: 'animal_id',
      width: 120,
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    {
      title: 'የአገልግሎት አይነት',
      dataIndex: 'service_type',
      key: 'service_type',
      width: 130,
      render: (val) => getServiceTypeLabel(val)
    },
    {
      title: 'የህክምና ቀን',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      render: (val) => val || '-'
    },
    {
      title: 'የእንስሳ ሐኪም',
      dataIndex: 'veterinarian',
      key: 'veterinarian',
      width: 150
    },
    {
      title: 'ምርመራ',
      dataIndex: 'diagnosis',
      key: 'diagnosis',
      width: 150
    },
    {
      title: 'ህክምና',
      dataIndex: 'treatment',
      key: 'treatment',
      width: 150
    },
    {
      title: 'ወጪ (ብር)',
      dataIndex: 'cost',
      key: 'cost',
      width: 100,
      render: (val) => val || '-'
    },
    {
      title: 'ሁኔታ',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (val) => <Tag color={getStatusColor(val)}>{getStatusLabel(val)}</Tag>
    },
    {
      title: 'ድርጊቶች',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="አርትዕ">
            <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          </Tooltip>
          <DeleteButton 
            itemName={`አገልግሎት`} 
            onConfirm={() => handleDelete(record.id)} 
          />
        </Space>
      ),
    },
  ];

  const filteredData = filterServices();

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#fff', padding: '24px' }}>
      {loading && <BrandedLoader message="አገልግሎቶችን በማውጣት ላይ..." />}

      <div style={{ marginBottom: 20 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ marginBottom: 4, color: '#1a5f2c' }}>
              🏥 የእንስሳት ህክምና አገልግሎቶች
            </Title>
            <Text type="secondary">የእንስሳትን ህክምና አገልግሎቶች ይመዝግቡ</Text>
          </Col>
          <Col>
            <Button icon={<ReloadOutlined />} onClick={fetchServices}>
              አድስ
            </Button>
          </Col>
        </Row>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={CARD_STYLE_GREEN}>
            <Statistic title="ጠቅላላ አገልግሎቶች" value={services.length} prefix={<MedicineBoxOutlined style={{ color: '#52c41a' }} />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={CARD_STYLE_BLUE}>
            <Statistic title="ተጠናቀቁ" value={services.filter(s => s.status === 'completed').length} prefix={<CheckCircleOutlined style={{ color: '#1890ff' }} />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={CARD_STYLE_ORANGE}>
            <Statistic title="የታቀዱ" value={services.filter(s => s.status === 'scheduled').length} prefix={<ClockCircleOutlined style={{ color: '#fa8c16' }} />} />
          </Card>
        </Col>
      </Row>

      <Card bordered={false} style={{ marginBottom: 16, borderRadius: 0, boxShadow: 'none', borderRight: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0' }}>
        <Row gutter={[16, 16]} align="middle" justify="space-between">
          <Col xs={24} md={6}>
            <Input
              placeholder="ፈልግ..."
              prefix={<SearchOutlined />}
              allowClear
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col xs={24} sm={8} md={4}>
            <Select style={{ width: '100%' }} defaultValue="All" onChange={setTypeFilter}>
              <Option value="All">ሁሉም አይነት</Option>
              <Option value="examination">ምርመራ</Option>
              <Option value="vaccination">ክትባት</Option>
              <Option value="treatment">ህክምና</Option>
              <Option value="surgery">ቀዶ ጥገና</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8} md={4}>
            <Select style={{ width: '100%' }} defaultValue="All" onChange={setStatusFilter}>
              <Option value="All">ሁሉም ሁኔታ</Option>
              <Option value="scheduled">የታቀደ</Option>
              <Option value="in_progress">በሂደት ላይ</Option>
              <Option value="completed">ተጠናቋል</Option>
              <Option value="cancelled">ተሰርዟል</Option>
            </Select>
          </Col>
          <Col xs={24} md={6}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} style={{ backgroundColor: '#1b7837', borderColor: '#1b7837' }}>
              አዲስ አገልግሎት
            </Button>
          </Col>
        </Row>
      </Card>

      <Card bordered={false} style={{ borderRadius: 0, boxShadow: 'none', borderRight: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0' }}>
        {filteredData.length === 0 && !loading ? (
          <Empty description="ምንም አገልግሎት አልተገኘም" />
        ) : (
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10, showSizeChanger: true }}
            scroll={{ x: 1300 }}
          />
        )}
      </Card>

      <Modal
        title={editingRecord ? 'አገልግሎት አርትዕ' : 'አዲስ አገልግሎት'}
        open={modalVisible}
        onCancel={handleModalCancel}
        footer={null}
        width={700}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="animal_id" label="የእንስሳ መለያ" rules={[{ required: true, message: 'እባክዎ ያስገቡ' }]}>
                <Input placeholder="ለምሳሌ: AN-001" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="service_type" label="የአገልግሎት አይነት" rules={[{ required: true, message: 'እባክዎ ይምረጡ' }]}>
                <Select>
                  <Option value="examination">ምርመራ</Option>
                  <Option value="vaccination">ክትባት</Option>
                  <Option value="treatment">ህክምና</Option>
                  <Option value="surgery">ቀዶ ጥገና</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="date" label="የህክምና ቀን" rules={[{ required: true, message: 'እባክዎ ይምረጡ' }]}>
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="veterinarian" label="የእንስሳ ሐኪም">
                <Input placeholder="ስም" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="diagnosis" label="ምርመራ">
            <TextArea rows={2} placeholder="ምርመራ ይግለጹ" />
          </Form.Item>

          <Form.Item name="treatment" label="ህክምና">
            <TextArea rows={2} placeholder="ህክምና ይግለጹ" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="cost" label="ወጪ (ብር)">
                <InputNumber min={0} style={{ width: '100%' }} placeholder="ወጪ" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="ሁኔታ">
                <Select>
                  <Option value="scheduled">የታቀደ</Option>
                  <Option value="in_progress">በሂደት ላይ</Option>
                  <Option value="completed">ተጠናቋል</Option>
                  <Option value="cancelled">ተሰርዟል</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="follow_up_date" label="የመከታተያ ቀን">
            <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={isSubmitting} style={{ backgroundColor: '#1b7837' }}>
                {editingRecord ? 'አርትዕ' : 'መዝግብ'}
              </Button>
              <Button onClick={handleModalCancel}>ሰርዝ</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default VeterinaryServicesManagement;