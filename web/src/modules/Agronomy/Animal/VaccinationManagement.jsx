import React, { useState, useEffect } from 'react';
import { 
  Table, Card, Row, Col, Statistic, Button, Tag, Space, 
  Typography, Empty, Tooltip, message, Input, Select, Modal,
  Form, DatePicker
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, 
  ReloadOutlined, CheckCircleOutlined, ClockCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import BrandedLoader from '../../../components/common/BrandedLoader';
import { DeleteButton } from '../../../components/common/ActionButtons';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Mock Data
const mockVaccinations = [
  {
    id: '1',
    animal_id: 'AN-001',
    vaccine_name: 'ኤምዲኤም',
    disease_prevented: 'የማይል በሽታ',
    date_given: '2024-06-10',
    next_due_date: '2024-12-10',
    veterinarian: 'ዶ/ር በኀይሉ',
    batch_number: 'B2024-001',
    dosage_ml: 5,
    status: 'completed',
    animal_type: 'ከብቲ',
    owner_name: 'አበበ በቀለ'
  },
  {
    id: '2',
    animal_id: 'AN-002',
    vaccine_name: 'ኦርቲን',
    disease_prevented: 'የአፍ እና እግር በሽታ',
    date_given: '2024-07-15',
    next_due_date: '2024-10-15',
    veterinarian: 'ዶ/ር ሀና',
    batch_number: 'B2024-002',
    dosage_ml: 3,
    status: 'scheduled',
    animal_type: 'ፍየል',
    owner_name: 'አዳም መሀመድ'
  }
];

const CARD_STYLE_GREEN = { borderRight: '1px solid #f0f0f0', borderBottom: '3px solid #52c41a', borderRadius: 0, height: '100%', boxShadow: 'none' };
const CARD_STYLE_BLUE = { borderRight: '1px solid #f0f0f0', borderBottom: '3px solid #1890ff', borderRadius: 0, height: '100%', boxShadow: 'none' };
const CARD_STYLE_ORANGE = { borderRight: '1px solid #f0f0f0', borderBottom: '3px solid #fa8c16', borderRadius: 0, height: '100%', boxShadow: 'none' };

const VaccinationManagement = () => {
  const [vaccinations, setVaccinations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchVaccinations();
  }, []);

  useEffect(() => {
    filterVaccinations();
  }, [searchText, statusFilter, vaccinations]);

  const fetchVaccinations = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setVaccinations(mockVaccinations);
    } catch (error) {
      message.error('Failed to fetch vaccinations');
    } finally {
      setLoading(false);
    }
  };

  const filterVaccinations = () => {
    let filtered = vaccinations;
    if (searchText) {
      filtered = filtered.filter(item =>
        item.animal_id?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.vaccine_name?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.owner_name?.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    if (statusFilter !== 'All') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }
    return filtered;
  };

  const handleDelete = (id) => {
    setVaccinations(vaccinations.filter(item => item.id !== id));
    message.success('ክትባት ተሰርዟል');
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue({
      animal_id: record.animal_id,
      vaccine_name: record.vaccine_name,
      disease_prevented: record.disease_prevented,
      date_given: record.date_given ? dayjs(record.date_given) : null,
      next_due_date: record.next_due_date ? dayjs(record.next_due_date) : null,
      veterinarian: record.veterinarian,
      batch_number: record.batch_number,
      dosage_ml: record.dosage_ml,
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
      const newVaccination = {
        id: editingRecord ? editingRecord.id : `${Date.now()}`,
        ...values,
        date_given: values.date_given?.format('YYYY-MM-DD'),
        next_due_date: values.next_due_date?.format('YYYY-MM-DD')
      };

      if (editingRecord) {
        setVaccinations(vaccinations.map(item => item.id === editingRecord.id ? newVaccination : item));
        message.success('ክትባት ተሻሽሏል');
      } else {
        setVaccinations([newVaccination, ...vaccinations]);
        message.success('ክትባት ተመዝግቧል');
      }
      handleModalCancel();
    } catch (error) {
      message.error('Failed to save vaccination');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: 'orange',
      completed: 'green',
      cancelled: 'red'
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      scheduled: 'የታቀደ',
      completed: 'ተጠናቋል',
      cancelled: 'ተሰርዟል'
    };
    return labels[status] || status;
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
      title: 'የክትባት ስም',
      dataIndex: 'vaccine_name',
      key: 'vaccine_name',
      width: 150
    },
    {
      title: 'የሚከላከለው በሽታ',
      dataIndex: 'disease_prevented',
      key: 'disease_prevented',
      width: 150
    },
    {
      title: 'ቀን',
      dataIndex: 'date_given',
      key: 'date_given',
      width: 120,
      render: (val) => val || '-'
    },
    {
      title: 'ቀጣይ ቀን',
      dataIndex: 'next_due_date',
      key: 'next_due_date',
      width: 120,
      render: (val) => val || '-'
    },
    {
      title: 'የሐኪም ስም',
      dataIndex: 'veterinarian',
      key: 'veterinarian',
      width: 150
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
            itemName={`ክትባት`} 
            onConfirm={() => handleDelete(record.id)} 
          />
        </Space>
      ),
    },
  ];

  const filteredData = filterVaccinations();

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#fff', padding: '24px' }}>
      {loading && <BrandedLoader message="ክትባቶችን በማውጣት ላይ..." />}

      <div style={{ marginBottom: 20 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ marginBottom: 4, color: '#1a5f2c' }}>
              💉 የክትባት አገልግሎት
            </Title>
            <Text type="secondary">የእንስሳትን ክትባት ይመዝግቡ እና ይከታተሉ</Text>
          </Col>
          <Col>
            <Button icon={<ReloadOutlined />} onClick={fetchVaccinations}>
              አድስ
            </Button>
          </Col>
        </Row>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={CARD_STYLE_GREEN}>
            <Statistic title="ጠቅላላ ክትባቶች" value={vaccinations.length} prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={CARD_STYLE_BLUE}>
            <Statistic title="ተጠናቀቁ" value={vaccinations.filter(v => v.status === 'completed').length} prefix={<CheckCircleOutlined style={{ color: '#1890ff' }} />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={CARD_STYLE_ORANGE}>
            <Statistic title="የታቀዱ" value={vaccinations.filter(v => v.status === 'scheduled').length} prefix={<ClockCircleOutlined style={{ color: '#fa8c16' }} />} />
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
            <Select style={{ width: '100%' }} defaultValue="All" onChange={setStatusFilter}>
              <Option value="All">ሁሉም ሁኔታ</Option>
              <Option value="scheduled">የታቀደ</Option>
              <Option value="completed">ተጠናቋል</Option>
              <Option value="cancelled">ተሰርዟል</Option>
            </Select>
          </Col>
          <Col xs={24} md={6}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} style={{ backgroundColor: '#1b7837', borderColor: '#1b7837' }}>
              አዲስ ክትባት
            </Button>
          </Col>
        </Row>
      </Card>

      <Card bordered={false} style={{ borderRadius: 0, boxShadow: 'none', borderRight: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0' }}>
        {filteredData.length === 0 && !loading ? (
          <Empty description="ምንም ክትባት አልተገኘም" />
        ) : (
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10, showSizeChanger: true }}
            scroll={{ x: 1200 }}
          />
        )}
      </Card>

      <Modal
        title={editingRecord ? 'ክትባት አርትዕ' : 'አዲስ ክትባት'}
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
              <Form.Item name="vaccine_name" label="የክትባት ስም" rules={[{ required: true, message: 'እባክዎ ያስገቡ' }]}>
                <Input placeholder="ለምሳሌ: ኤምዲኤም" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="disease_prevented" label="የሚከላከለው በሽታ">
            <Input placeholder="በሽታ" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="date_given" label="የክትባት ቀን" rules={[{ required: true, message: 'እባክዎ ይምረጡ' }]}>
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="next_due_date" label="ቀጣይ ቀን">
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="veterinarian" label="የሐኪም ስም">
                <Input placeholder="ስም" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="batch_number" label="የባች ቁጥር">
                <Input placeholder="ለምሳሌ: B2024-001" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="dosage_ml" label="መጠን (ሚሊሊትር)">
                <InputNumber min={0} style={{ width: '100%' }} placeholder="መጠን" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="ሁኔታ">
                <Select>
                  <Option value="scheduled">የታቀደ</Option>
                  <Option value="completed">ተጠናቋል</Option>
                  <Option value="cancelled">ተሰርዟል</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

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

export default VaccinationManagement;