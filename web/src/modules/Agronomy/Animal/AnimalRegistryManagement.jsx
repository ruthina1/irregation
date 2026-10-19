import React, { useState, useEffect } from 'react';
import { 
  Table, Card, Row, Col, Statistic, Button, Tag, Space, 
  Typography, Empty, Tooltip, message, Input, Select, Modal,
  Form, DatePicker, Switch, message
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, 
  ReloadOutlined, TeamOutlined, CheckCircleOutlined, 
  CloseCircleOutlined, SyncOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import BrandedLoader from '../../../components/common/BrandedLoader';
import { DeleteButton } from '../../../components/common/ActionButtons';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Mock Data
const mockAnimals = [
  {
    id: '1',
    animal_type: 'ከብቲ',
    breed: 'ቦራን',
    tag_number: 'AN-001',
    gender: 'male',
    age_months: 36,
    weight_kg: 450,
    color: 'ጥቁር',
    health_status: 'healthy',
    is_pregnant: false,
    number_of_offspring: 2,
    farm_name: 'ግሪን ቫሊ እርሻ',
    owner_name: 'አበበ በቀለ',
    owner_phone: '0912345678',
    created_at: '2024-01-15',
    animal_status: 'active'
  },
  {
    id: '2',
    animal_type: 'ፍየል',
    breed: 'የቱቡ',
    tag_number: 'AN-002',
    gender: 'female',
    age_months: 24,
    weight_kg: 65,
    color: 'ነጭ',
    health_status: 'healthy',
    is_pregnant: true,
    expected_calving_date: '2024-12-15',
    number_of_offspring: 0,
    farm_name: 'አዳም እርሻ',
    owner_name: 'አዳም መሀመድ',
    owner_phone: '0923456789',
    created_at: '2024-03-20',
    animal_status: 'active'
  },
  {
    id: '3',
    animal_type: 'በግ',
    breed: 'አዋሲ',
    tag_number: 'AN-003',
    gender: 'male',
    age_months: 18,
    weight_kg: 55,
    color: 'ቡና',
    health_status: 'under_treatment',
    is_pregnant: false,
    number_of_offspring: 0,
    farm_name: 'ቢራ እርሻ',
    owner_name: 'ሰላም አለሙ',
    owner_phone: '0934567890',
    created_at: '2024-05-10',
    animal_status: 'active'
  }
];

const CARD_STYLE_GREEN = { borderRight: '1px solid #f0f0f0', borderBottom: '3px solid #52c41a', borderRadius: 0, height: '100%', boxShadow: 'none' };
const CARD_STYLE_BLUE = { borderRight: '1px solid #f0f0f0', borderBottom: '3px solid #1890ff', borderRadius: 0, height: '100%', boxShadow: 'none' };
const CARD_STYLE_ORANGE = { borderRight: '1px solid #f0f0f0', borderBottom: '3px solid #fa8c16', borderRadius: 0, height: '100%', boxShadow: 'none' };
const CARD_STYLE_PURPLE = { borderRight: '1px solid #f0f0f0', borderBottom: '3px solid #722ed1', borderRadius: 0, height: '100%', boxShadow: 'none' };

const AnimalRegistryManagement = () => {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchAnimals();
  }, []);

  useEffect(() => {
    filterAnimals();
  }, [searchText, typeFilter, statusFilter, animals]);

  const fetchAnimals = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setAnimals(mockAnimals);
    } catch (error) {
      message.error('Failed to fetch animals');
    } finally {
      setLoading(false);
    }
  };

  const filterAnimals = () => {
    let filtered = animals;
    if (searchText) {
      filtered = filtered.filter(item =>
        item.tag_number?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.animal_type?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.owner_name?.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    if (typeFilter !== 'All') {
      filtered = filtered.filter(item => item.animal_type === typeFilter);
    }
    if (statusFilter !== 'All') {
      filtered = filtered.filter(item => item.animal_status === statusFilter);
    }
    return filtered;
  };

  const handleDelete = (id) => {
    setAnimals(animals.filter(item => item.id !== id));
    message.success('እንስሳ ተሰርዟል');
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue({
      animal_type: record.animal_type,
      breed: record.breed,
      tag_number: record.tag_number,
      gender: record.gender,
      age_months: record.age_months,
      weight_kg: record.weight_kg,
      color: record.color,
      health_status: record.health_status,
      is_pregnant: record.is_pregnant,
      expected_calving_date: record.expected_calving_date ? dayjs(record.expected_calving_date) : null,
      number_of_offspring: record.number_of_offspring,
      farm_name: record.farm_name,
      owner_name: record.owner_name,
      owner_phone: record.owner_phone,
      animal_status: record.animal_status
    });
    setModalVisible(true);
  };

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({
      gender: 'male',
      health_status: 'healthy',
      animal_status: 'active',
      is_pregnant: false,
      number_of_offspring: 0
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
      const newAnimal = {
        id: editingRecord ? editingRecord.id : `${Date.now()}`,
        ...values,
        expected_calving_date: values.expected_calving_date?.format('YYYY-MM-DD'),
        created_at: editingRecord ? editingRecord.created_at : dayjs().format('YYYY-MM-DD')
      };

      if (editingRecord) {
        setAnimals(animals.map(item => item.id === editingRecord.id ? newAnimal : item));
        message.success('እንስሳ ተሻሽሏል');
      } else {
        setAnimals([newAnimal, ...animals]);
        message.success('እንስሳ ተመዝግቧል');
      }
      handleModalCancel();
    } catch (error) {
      message.error('Failed to save animal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      healthy: 'green',
      sick: 'red',
      under_treatment: 'orange',
      quarantined: 'purple'
    };
    return colors[status] || 'default';
  };

  const getAnimalStatusColor = (status) => {
    const colors = {
      active: 'green',
      sold: 'red',
      deceased: 'red',
      transferred: 'orange'
    };
    return colors[status] || 'default';
  };

  const getTypeLabel = (type) => {
    const labels = {
      cattle: 'ከብቲ',
      sheep: 'በግ',
      goat: 'ፍየል',
      poultry: 'ዶሮ',
      other: 'ሌላ'
    };
    return labels[type] || type;
  };

  const getGenderLabel = (gender) => {
    return gender === 'male' ? 'ተባዕት' : 'እንስት';
  };

  const getHealthStatusLabel = (status) => {
    const labels = {
      healthy: 'ጤናማ',
      sick: 'የታመመ',
      under_treatment: 'በህክምና ላይ',
      quarantined: 'በቁጥጥር ስር'
    };
    return labels[status] || status;
  };

  const columns = [
    {
      title: 'መለያ ቁጥር',
      dataIndex: 'tag_number',
      key: 'tag_number',
      width: 120,
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    {
      title: 'የእንስሳ አይነት',
      dataIndex: 'animal_type',
      key: 'animal_type',
      width: 120,
      render: (val) => getTypeLabel(val)
    },
    {
      title: 'ዝርያ',
      dataIndex: 'breed',
      key: 'breed',
      width: 120,
      render: (val) => val || '-'
    },
    {
      title: 'ጾታ',
      dataIndex: 'gender',
      key: 'gender',
      width: 80,
      render: (val) => getGenderLabel(val)
    },
    {
      title: 'ዕድሜ (ወር)',
      dataIndex: 'age_months',
      key: 'age_months',
      width: 100,
      render: (val) => val || '-'
    },
    {
      title: 'ክብደት (ኪግ)',
      dataIndex: 'weight_kg',
      key: 'weight_kg',
      width: 100,
      render: (val) => val ? `${val} ኪግ` : '-'
    },
    {
      title: 'የጤና ሁኔታ',
      dataIndex: 'health_status',
      key: 'health_status',
      width: 130,
      render: (val) => <Tag color={getStatusColor(val)}>{getHealthStatusLabel(val)}</Tag>
    },
    {
      title: 'ሁኔታ',
      dataIndex: 'animal_status',
      key: 'animal_status',
      width: 100,
      render: (val) => <Tag color={getAnimalStatusColor(val)}>{val}</Tag>
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
            itemName={`እንስሳ ${record.tag_number}`} 
            onConfirm={() => handleDelete(record.id)} 
          />
        </Space>
      ),
    },
  ];

  const filteredData = filterAnimals();

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#fff', padding: '24px' }}>
      {loading && <BrandedLoader message="እንስሳትን በማውጣት ላይ..." />}

      <div style={{ marginBottom: 20 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ marginBottom: 4, color: '#1a5f2c' }}>
              🐄 የእንስሳት ምዝገባ
            </Title>
            <Text type="secondary">የእንስሳትን መረጃ ይመዝግቡ እና ይከታተሉ</Text>
          </Col>
          <Col>
            <Button icon={<ReloadOutlined />} onClick={fetchAnimals}>
              አድስ
            </Button>
          </Col>
        </Row>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={CARD_STYLE_GREEN}>
            <Statistic 
              title="ጠቅላላ እንስሳት" 
              value={animals.length} 
              prefix={<TeamOutlined style={{ color: '#52c41a' }} />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={CARD_STYLE_BLUE}>
            <Statistic 
              title="ጤናማ" 
              value={animals.filter(a => a.health_status === 'healthy').length} 
              prefix={<CheckCircleOutlined style={{ color: '#1890ff' }} />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={CARD_STYLE_ORANGE}>
            <Statistic 
              title="በህክምና ላይ" 
              value={animals.filter(a => a.health_status === 'under_treatment').length} 
              prefix={<SyncOutlined style={{ color: '#fa8c16' }} />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={CARD_STYLE_PURPLE}>
            <Statistic 
              title="ንቁ" 
              value={animals.filter(a => a.animal_status === 'active').length} 
              prefix={<CheckCircleOutlined style={{ color: '#722ed1' }} />} 
            />
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
              <Option value="cattle">ከብቲ</Option>
              <Option value="sheep">በግ</Option>
              <Option value="goat">ፍየል</Option>
              <Option value="poultry">ዶሮ</Option>
              <Option value="other">ሌላ</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8} md={4}>
            <Select style={{ width: '100%' }} defaultValue="All" onChange={setStatusFilter}>
              <Option value="All">ሁሉም ሁኔታ</Option>
              <Option value="active">ንቁ</Option>
              <Option value="sold">ተሽጧል</Option>
              <Option value="deceased">ሞቷል</Option>
              <Option value="transferred">ተላልፏል</Option>
            </Select>
          </Col>
          <Col xs={24} md={6}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} style={{ backgroundColor: '#1b7837', borderColor: '#1b7837' }}>
              አዲስ እንስሳ
            </Button>
          </Col>
        </Row>
      </Card>

      <Card bordered={false} style={{ borderRadius: 0, boxShadow: 'none', borderRight: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0' }}>
        {filteredData.length === 0 && !loading ? (
          <Empty description="ምንም እንስሳ አልተገኘም" />
        ) : (
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="id"
            loading={loading}
            pagination={{ 
              pageSize: 10, 
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} ከ ${total} እንስሳት`
            }}
            scroll={{ x: 1200 }}
          />
        )}
      </Card>

      <Modal
        title={editingRecord ? 'እንስሳ አርትዕ' : 'አዲስ እንስሳ'}
        open={modalVisible}
        onCancel={handleModalCancel}
        footer={null}
        width={800}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="animal_type" label="የእንስሳ አይነት" rules={[{ required: true, message: 'እባክዎ የእንስሳ አይነት ይምረጡ' }]}>
                <Select placeholder="ይምረጡ">
                  <Option value="cattle">ከብቲ</Option>
                  <Option value="sheep">በግ</Option>
                  <Option value="goat">ፍየል</Option>
                  <Option value="poultry">ዶሮ</Option>
                  <Option value="other">ሌላ</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="breed" label="ዝርያ">
                <Input placeholder="ዝርያ ያስገቡ" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="tag_number" label="መለያ ቁጥር" rules={[{ required: true, message: 'እባክዎ መለያ ቁጥር ያስገቡ' }]}>
                <Input placeholder="ለምሳሌ: AN-001" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="gender" label="ጾታ" rules={[{ required: true, message: 'እባክዎ ጾታ ይምረጡ' }]}>
                <Select>
                  <Option value="male">ተባዕት</Option>
                  <Option value="female">እንስት</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="age_months" label="ዕድሜ (በወር)">
                <InputNumber min={0} style={{ width: '100%' }} placeholder="ዕድሜ" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="weight_kg" label="ክብደት (ኪግ)">
                <InputNumber min={0} style={{ width: '100%' }} placeholder="ክብደት" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="color" label="ቀለም">
                <Input placeholder="ቀለም" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="health_status" label="የጤና ሁኔታ">
                <Select>
                  <Option value="healthy">ጤናማ</Option>
                  <Option value="sick">የታመመ</Option>
                  <Option value="under_treatment">በህክምና ላይ</Option>
                  <Option value="quarantined">በቁጥጥር ስር</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="is_pregnant" label="እርጉዝ ነው?" valuePropName="checked">
                <Switch checkedChildren="አዎ" unCheckedChildren="አይ" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="expected_calving_date" label="የሚጠበቀው የወሊድ ቀን">
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="number_of_offspring" label="የወሊድ ብዛት">
                <InputNumber min={0} style={{ width: '100%' }} placeholder="ቁጥር" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="animal_status" label="ሁኔታ">
                <Select>
                  <Option value="active">ንቁ</Option>
                  <Option value="sold">ተሽጧል</Option>
                  <Option value="deceased">ሞቷል</Option>
                  <Option value="transferred">ተላልፏል</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="owner_name" label="የባለቤት ስም">
                <Input placeholder="ስም" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="owner_phone" label="የባለቤት ስልክ">
                <Input placeholder="ስልክ ቁጥር" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="farm_name" label="የእርሻ ስም">
            <Input placeholder="የእርሻ ስም" />
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

export default AnimalRegistryManagement;