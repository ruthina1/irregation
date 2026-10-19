import React, { useState, useEffect } from 'react';
import { 
  Table, Card, Row, Col, Statistic, Button, Tag, Space, 
  Typography, Empty, Tooltip, message, Input, Select, Modal,
  Form, Switch
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, 
  ReloadOutlined, CheckCircleOutlined, CloseCircleOutlined
} from '@ant-design/icons';
import BrandedLoader from '../../../components/common/BrandedLoader';
import { DeleteButton } from '../../../components/common/ActionButtons';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Mock Data
const mockBreeds = [
  {
    id: '1',
    name: 'ቦራን',
    animal_type: 'cattle',
    origin: 'ኬንያ',
    characteristics: 'ጠንካራ፣ ከፍተኛ የወተት ምርት',
    purpose: 'ወተት እና ስጋ',
    temperament: 'ዘገምተኛ',
    color_pattern: 'ጥቁር እና ነጭ',
    average_weight_kg: 550,
    average_milk_liters: 18,
    is_improved: true,
    status: 'active'
  },
  {
    id: '2',
    name: 'አዋሲ',
    animal_type: 'sheep',
    origin: 'ኢትዮጵያ',
    characteristics: 'ለፀጉር እና ስጋ የሚሆን',
    purpose: 'ስጋ እና ፀጉር',
    temperament: 'ዘገምተኛ',
    color_pattern: 'ቡና',
    average_weight_kg: 45,
    average_milk_liters: 0,
    is_improved: false,
    status: 'active'
  },
  {
    id: '3',
    name: 'የቱቡ',
    animal_type: 'goat',
    origin: 'ጅቡቲ',
    characteristics: 'ከፍተኛ የወተት ምርት እና ጠንካራ',
    purpose: 'ወተት እና ስጋ',
    temperament: 'ንቁ',
    color_pattern: 'ነጭ',
    average_weight_kg: 70,
    average_milk_liters: 3,
    is_improved: true,
    status: 'active'
  }
];

const CARD_STYLE_GREEN = { borderRight: '1px solid #f0f0f0', borderBottom: '3px solid #52c41a', borderRadius: 0, height: '100%', boxShadow: 'none' };
const CARD_STYLE_BLUE = { borderRight: '1px solid #f0f0f0', borderBottom: '3px solid #1890ff', borderRadius: 0, height: '100%', boxShadow: 'none' };

const BreedInformationManagement = () => {
  const [breeds, setBreeds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchBreeds();
  }, []);

  useEffect(() => {
    filterBreeds();
  }, [searchText, typeFilter, breeds]);

  const fetchBreeds = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setBreeds(mockBreeds);
    } catch (error) {
      message.error('Failed to fetch breeds');
    } finally {
      setLoading(false);
    }
  };

  const filterBreeds = () => {
    let filtered = breeds;
    if (searchText) {
      filtered = filtered.filter(item =>
        item.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.origin?.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    if (typeFilter !== 'All') {
      filtered = filtered.filter(item => item.animal_type === typeFilter);
    }
    return filtered;
  };

  const handleDelete = (id) => {
    setBreeds(breeds.filter(item => item.id !== id));
    message.success('ዝርያ ተሰርዟል');
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({
      is_improved: false,
      status: 'active'
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
      const newBreed = {
        id: editingRecord ? editingRecord.id : `${Date.now()}`,
        ...values
      };

      if (editingRecord) {
        setBreeds(breeds.map(item => item.id === editingRecord.id ? newBreed : item));
        message.success('ዝርያ ተሻሽሏል');
      } else {
        setBreeds([newBreed, ...breeds]);
        message.success('ዝርያ ተመዝግቧል');
      }
      handleModalCancel();
    } catch (error) {
      message.error('Failed to save breed');
    } finally {
      setIsSubmitting(false);
    }
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

  const columns = [
    {
      title: 'የዝርያ ስም',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'የእንስሳ አይነት',
      dataIndex: 'animal_type',
      key: 'animal_type',
      width: 120,
      render: (val) => getTypeLabel(val)
    },
    {
      title: 'መነሻ',
      dataIndex: 'origin',
      key: 'origin',
      width: 120,
      render: (val) => val || '-'
    },
    {
      title: 'ዓላማ',
      dataIndex: 'purpose',
      key: 'purpose',
      width: 150
    },
    {
      title: 'አማካይ ክብደት (ኪግ)',
      dataIndex: 'average_weight_kg',
      key: 'average_weight_kg',
      width: 130,
      render: (val) => val ? `${val} ኪግ` : '-'
    },
    {
      title: 'አማካይ ወተት (ሊትር)',
      dataIndex: 'average_milk_liters',
      key: 'average_milk_liters',
      width: 130,
      render: (val) => val ? `${val} ሊትር` : '-'
    },
    {
      title: 'የተሻሻለ',
      dataIndex: 'is_improved',
      key: 'is_improved',
      width: 100,
      render: (val) => val ? 
        <Tag color="green"><CheckCircleOutlined /> አዎ</Tag> : 
        <Tag color="red"><CloseCircleOutlined /> አይ</Tag>
    },
    {
      title: 'ሁኔታ',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (val) => <Tag color={val === 'active' ? 'green' : 'red'}>{val}</Tag>
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
            itemName={`ዝርያ ${record.name}`} 
            onConfirm={() => handleDelete(record.id)} 
          />
        </Space>
      ),
    },
  ];

  const filteredData = filterBreeds();

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#fff', padding: '24px' }}>
      {loading && <BrandedLoader message="ዝርያዎችን በማውጣት ላይ..." />}

      <div style={{ marginBottom: 20 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ marginBottom: 4, color: '#1a5f2c' }}>
              🧬 የዝርያ መረጃ
            </Title>
            <Text type="secondary">የእንስሳትን ዝርያዎች ይመዝግቡ እና ያስተዳድሩ</Text>
          </Col>
          <Col>
            <Button icon={<ReloadOutlined />} onClick={fetchBreeds}>
              አድስ
            </Button>
          </Col>
        </Row>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={CARD_STYLE_GREEN}>
            <Statistic title="ጠቅላላ ዝርያዎች" value={breeds.length} prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={CARD_STYLE_BLUE}>
            <Statistic title="የተሻሻሉ" value={breeds.filter(b => b.is_improved).length} prefix={<CheckCircleOutlined style={{ color: '#1890ff' }} />} />
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
            </Select>
          </Col>
          <Col xs={24} md={6}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} style={{ backgroundColor: '#1b7837', borderColor: '#1b7837' }}>
              አዲስ ዝርያ
            </Button>
          </Col>
        </Row>
      </Card>

      <Card bordered={false} style={{ borderRadius: 0, boxShadow: 'none', borderRight: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0' }}>
        {filteredData.length === 0 && !loading ? (
          <Empty description="ምንም ዝርያ አልተገኘም" />
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
        title={editingRecord ? 'ዝርያ አርትዕ' : 'አዲስ ዝርያ'}
        open={modalVisible}
        onCancel={handleModalCancel}
        footer={null}
        width={700}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="የዝርያ ስም" rules={[{ required: true, message: 'እባክዎ ስም ያስገቡ' }]}>
                <Input placeholder="ለምሳሌ: ቦራን" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="animal_type" label="የእንስሳ አይነት" rules={[{ required: true, message: 'እባክዎ ይምረጡ' }]}>
                <Select>
                  <Option value="cattle">ከብቲ</Option>
                  <Option value="sheep">በግ</Option>
                  <Option value="goat">ፍየል</Option>
                  <Option value="poultry">ዶሮ</Option>
                  <Option value="other">ሌላ</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="origin" label="መነሻ">
                <Input placeholder="የመነሻ አገር/አካባቢ" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="purpose" label="ዓላማ">
                <Input placeholder="ለምሳሌ: ወተት, ስጋ" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="average_weight_kg" label="አማካይ ክብደት (ኪግ)">
                <InputNumber min={0} style={{ width: '100%' }} placeholder="ክብደት" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="average_milk_liters" label="አማካይ ወተት (ሊትር)">
                <InputNumber min={0} style={{ width: '100%' }} placeholder="ወተት" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="is_improved" label="የተሻሻለ" valuePropName="checked">
                <Switch checkedChildren="አዎ" unCheckedChildren="አይ" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="characteristics" label="ባህሪያት">
            <TextArea rows={2} placeholder="የዝርያውን ባህሪያት ይግለጹ" />
          </Form.Item>

          <Form.Item name="temperament" label="ባህሪ">
            <Input placeholder="ለምሳሌ: ዘገምተኛ, ንቁ" />
          </Form.Item>

          <Form.Item name="color_pattern" label="የቀለም ንድፍ">
            <Input placeholder="ለምሳሌ: ጥቁር እና ነጭ" />
          </Form.Item>

          <Form.Item name="status" label="ሁኔታ">
            <Select>
              <Option value="active">ንቁ</Option>
              <Option value="inactive">እንቅስቃሴ የለም</Option>
            </Select>
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

export default BreedInformationManagement;