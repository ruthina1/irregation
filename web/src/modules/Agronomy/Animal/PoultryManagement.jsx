import React, { useState, useEffect } from 'react';
import { 
  Table, Card, Row, Col, Statistic, Button, Tag, Space, 
  Typography, Empty, Tooltip, message, Input, Select, Modal,
  Form, DatePicker, InputNumber
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, 
  ReloadOutlined, CheckCircleOutlined, CloseCircleOutlined,
  EggOutlined, TeamOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import BrandedLoader from '../../../components/common/BrandedLoader';
import { DeleteButton } from '../../../components/common/ActionButtons';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Mock Data
const mockPoultry = [
  {
    id: '1',
    flock_name: 'የብራይለር መንጋ 1',
    bird_type: 'የብራይለር ዶሮ',
    total_birds: 500,
    breed: 'ኮብ 500',
    age_weeks: 8,
    average_weight_kg: 2.5,
    feed_consumption_kg: 750,
    mortality_count: 5,
    egg_production_daily: 0,
    health_status: 'good',
    housing_type: 'ቤት ውስጥ',
    farm_name: 'ቢራ እርሻ',
    owner_name: 'ሰላም አለሙ'
  },
  {
    id: '2',
    flock_name: 'የእንቁላል መንጋ 1',
    bird_type: 'የእንቁላል ዶሮ',
    total_birds: 300,
    breed: 'ሎህማን ብራውን',
    age_weeks: 52,
    average_weight_kg: 1.8,
    feed_consumption_kg: 450,
    mortality_count: 8,
    egg_production_daily: 250,
    health_status: 'good',
    housing_type: 'ቤት ውስጥ',
    farm_name: 'ግሪን ቫሊ',
    owner_name: 'አበበ በቀለ'
  }
];

const CARD_STYLE_GREEN = { borderRight: '1px solid #f0f0f0', borderBottom: '3px solid #52c41a', borderRadius: 0, height: '100%', boxShadow: 'none' };
const CARD_STYLE_BLUE = { borderRight: '1px solid #f0f0f0', borderBottom: '3px solid #1890ff', borderRadius: 0, height: '100%', boxShadow: 'none' };
const CARD_STYLE_ORANGE = { borderRight: '1px solid #f0f0f0', borderBottom: '3px solid #fa8c16', borderRadius: 0, height: '100%', boxShadow: 'none' };

const PoultryManagement = () => {
  const [poultry, setPoultry] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchPoultry();
  }, []);

  useEffect(() => {
    filterPoultry();
  }, [searchText, typeFilter, poultry]);

  const fetchPoultry = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setPoultry(mockPoultry);
    } catch (error) {
      message.error('Failed to fetch poultry records');
    } finally {
      setLoading(false);
    }
  };

  const filterPoultry = () => {
    let filtered = poultry;
    if (searchText) {
      filtered = filtered.filter(item =>
        item.flock_name?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.owner_name?.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    if (typeFilter !== 'All') {
      filtered = filtered.filter(item => item.bird_type === typeFilter);
    }
    return filtered;
  };

  const handleDelete = (id) => {
    setPoultry(poultry.filter(item => item.id !== id));
    message.success('የዶሮ መረጃ ተሰርዟል');
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue({
      flock_name: record.flock_name,
      bird_type: record.bird_type,
      total_birds: record.total_birds,
      breed: record.breed,
      age_weeks: record.age_weeks,
      average_weight_kg: record.average_weight_kg,
      feed_consumption_kg: record.feed_consumption_kg,
      mortality_count: record.mortality_count,
      egg_production_daily: record.egg_production_daily,
      health_status: record.health_status,
      housing_type: record.housing_type,
      farm_name: record.farm_name,
      owner_name: record.owner_name
    });
    setModalVisible(true);
  };

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({
      health_status: 'good',
      mortality_count: 0,
      egg_production_daily: 0,
      bird_type: 'የብራይለር ዶሮ'
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
      const newRecord = {
        id: editingRecord ? editingRecord.id : `${Date.now()}`,
        ...values
      };

      if (editingRecord) {
        setPoultry(poultry.map(item => item.id === editingRecord.id ? newRecord : item));
        message.success('የዶሮ መረጃ ተሻሽሏል');
      } else {
        setPoultry([newRecord, ...poultry]);
        message.success('የዶሮ መረጃ ተመዝግቧል');
      }
      handleModalCancel();
    } catch (error) {
      message.error('Failed to save poultry record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      good: 'green',
      fair: 'orange',
      poor: 'red'
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      good: 'ጥሩ',
      fair: 'መካከለኛ',
      poor: 'ደካማ'
    };
    return labels[status] || status;
  };

  const columns = [
    {
      title: 'የመንጋ ስም',
      dataIndex: 'flock_name',
      key: 'flock_name',
      width: 150,
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'አይነት',
      dataIndex: 'bird_type',
      key: 'bird_type',
      width: 130
    },
    {
      title: 'ቁጥር',
      dataIndex: 'total_birds',
      key: 'total_birds',
      width: 100,
      render: (val) => <Tag color="blue">{val}</Tag>
    },
    {
      title: 'ዝርያ',
      dataIndex: 'breed',
      key: 'breed',
      width: 120
    },
    {
      title: 'ዕድሜ (ሳምንት)',
      dataIndex: 'age_weeks',
      key: 'age_weeks',
      width: 100,
      render: (val) => val || '-'
    },
    {
      title: 'ክብደት (ኪግ)',
      dataIndex: 'average_weight_kg',
      key: 'average_weight_kg',
      width: 100,
      render: (val) => val ? `${val} ኪግ` : '-'
    },
    {
      title: 'እንቁላል/ቀን',
      dataIndex: 'egg_production_daily',
      key: 'egg_production_daily',
      width: 110,
      render: (val) => <Tag color="orange">{val}</Tag>
    },
    {
      title: 'ሞት',
      dataIndex: 'mortality_count',
      key: 'mortality_count',
      width: 80,
      render: (val) => <Tag color="red">{val}</Tag>
    },
    {
      title: 'ጤና',
      dataIndex: 'health_status',
      key: 'health_status',
      width: 100,
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
            itemName={`መንጋ ${record.flock_name}`} 
            onConfirm={() => handleDelete(record.id)} 
          />
        </Space>
      ),
    },
  ];

  const filteredData = filterPoultry();
  const totalBirds = poultry.reduce((sum, item) => sum + (item.total_birds || 0), 0);
  const totalEggs = poultry.reduce((sum, item) => sum + (item.egg_production_daily || 0), 0);

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#fff', padding: '24px' }}>
      {loading && <BrandedLoader message="የዶሮ መረጃ በማውጣት ላይ..." />}

      <div style={{ marginBottom: 20 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ marginBottom: 4, color: '#1a5f2c' }}>
              🐔 የዶሮ እርባታ አስተዳደር
            </Title>
            <Text type="secondary">የዶሮ እርባታን ይመዝግቡ እና ይከታተሉ</Text>
          </Col>
          <Col>
            <Button icon={<ReloadOutlined />} onClick={fetchPoultry}>
              አድስ
            </Button>
          </Col>
        </Row>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={CARD_STYLE_GREEN}>
            <Statistic title="ጠቅላላ ወፎች" value={totalBirds} prefix={<TeamOutlined style={{ color: '#52c41a' }} />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={CARD_STYLE_BLUE}>
            <Statistic title="እንቁላል/ቀን" value={totalEggs} prefix={<EggOutlined style={{ color: '#1890ff' }} />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={CARD_STYLE_ORANGE}>
            <Statistic title="መንጋዎች" value={poultry.length} prefix={<CheckCircleOutlined style={{ color: '#fa8c16' }} />} />
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
              <Option value="የብራይለር ዶሮ">የብራይለር</Option>
              <Option value="የእንቁላል ዶሮ">የእንቁላል</Option>
            </Select>
          </Col>
          <Col xs={24} md={6}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} style={{ backgroundColor: '#1b7837', borderColor: '#1b7837' }}>
              አዲስ መንጋ
            </Button>
          </Col>
        </Row>
      </Card>

      <Card bordered={false} style={{ borderRadius: 0, boxShadow: 'none', borderRight: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0' }}>
        {filteredData.length === 0 && !loading ? (
          <Empty description="ምንም የዶሮ መረጃ አልተገኘም" />
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
        title={editingRecord ? 'መንጋ አርትዕ' : 'አዲስ መንጋ'}
        open={modalVisible}
        onCancel={handleModalCancel}
        footer={null}
        width={700}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="flock_name" label="የመንጋ ስም" rules={[{ required: true, message: 'እባክዎ ያስገቡ' }]}>
                <Input placeholder="ለምሳሌ: መንጋ 1" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="bird_type" label="አይነት" rules={[{ required: true, message: 'እባክዎ ይምረጡ' }]}>
                <Select>
                  <Option value="የብራይለር ዶሮ">የብራይለር ዶሮ</Option>
                  <Option value="የእንቁላል ዶሮ">የእንቁላል ዶሮ</Option>
                  <Option value="ድብልቅ">ድብልቅ</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="total_birds" label="ጠቅላላ ቁጥር" rules={[{ required: true, message: 'እባክዎ ያስገቡ' }]}>
                <InputNumber min={0} style={{ width: '100%' }} placeholder="ቁጥር" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="breed" label="ዝርያ">
                <Input placeholder="ለምሳሌ: ኮብ 500" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="age_weeks" label="ዕድሜ (ሳምንት)">
                <InputNumber min={0} style={{ width: '100%' }} placeholder="ዕድሜ" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="average_weight_kg" label="አማካይ ክብደት (ኪግ)">
                <InputNumber min={0} step={0.1} style={{ width: '100%' }} placeholder="ክብደት" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="feed_consumption_kg" label="መኖ (ኪግ)">
                <InputNumber min={0} style={{ width: '100%' }} placeholder="መኖ" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="egg_production_daily" label="እንቁላል/ቀን">
                <InputNumber min={0} style={{ width: '100%' }} placeholder="ቁጥር" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="mortality_count" label="የሞት ቁጥር">
                <InputNumber min={0} style={{ width: '100%' }} placeholder="ቁጥር" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="health_status" label="የጤና ሁኔታ">
                <Select>
                  <Option value="good">ጥሩ</Option>
                  <Option value="fair">መካከለኛ</Option>
                  <Option value="poor">ደካማ</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="housing_type" label="የመኖሪያ አይነት">
                <Input placeholder="ለምሳሌ: ቤት ውስጥ" />
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
              <Form.Item name="farm_name" label="የእርሻ ስም">
                <Input placeholder="ስም" />
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

export default PoultryManagement;