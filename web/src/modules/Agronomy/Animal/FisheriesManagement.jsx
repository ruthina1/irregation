import React, { useState, useEffect } from 'react';
import { 
  Table, Card, Row, Col, Statistic, Button, Tag, Space, 
  Typography, Empty, Tooltip, message, Input, Select, Modal,
  Form, DatePicker, InputNumber
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, 
  ReloadOutlined, CheckCircleOutlined, CloseCircleOutlined,
  FishtankOutlined, WaterOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import BrandedLoader from '../../../components/common/BrandedLoader';
import { DeleteButton } from '../../../components/common/ActionButtons';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Mock Data
const mockFisheries = [
  {
    id: '1',
    farm_name: 'ግሪን ፊሽ',
    fish_type: 'ቲላፒያ',
    total_fish: 5000,
    pond_size_m2: 200,
    water_type: 'ንፁህ',
    feeding_method: 'የተዘጋጀ መኖ',
    average_weight_g: 250,
    harvest_kg: 1250,
    harvest_date: '2024-07-01',
    health_status: 'good',
    location: 'ባህር ዳር',
    owner_name: 'አበበ በቀለ',
    owner_phone: '0912345678'
  },
  {
    id: '2',
    farm_name: 'ቢራ ፊሽ',
    fish_type: 'ካርፕ',
    total_fish: 3000,
    pond_size_m2: 150,
    water_type: 'ጥሩ',
    feeding_method: 'ባህላዊ',
    average_weight_g: 180,
    harvest_kg: 540,
    harvest_date: '2024-06-15',
    health_status: 'fair',
    location: 'ሆሳና',
    owner_name: 'ሰላም አለሙ',
    owner_phone: '0934567890'
  }
];

const CARD_STYLE_GREEN = { borderRight: '1px solid #f0f0f0', borderBottom: '3px solid #52c41a', borderRadius: 0, height: '100%', boxShadow: 'none' };
const CARD_STYLE_BLUE = { borderRight: '1px solid #f0f0f0', borderBottom: '3px solid #1890ff', borderRadius: 0, height: '100%', boxShadow: 'none' };
const CARD_STYLE_ORANGE = { borderRight: '1px solid #f0f0f0', borderBottom: '3px solid #fa8c16', borderRadius: 0, height: '100%', boxShadow: 'none' };

const FisheriesManagement = () => {
  const [fisheries, setFisheries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchFisheries();
  }, []);

  useEffect(() => {
    filterFisheries();
  }, [searchText, typeFilter, fisheries]);

  const fetchFisheries = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setFisheries(mockFisheries);
    } catch (error) {
      message.error('Failed to fetch fisheries');
    } finally {
      setLoading(false);
    }
  };

  const filterFisheries = () => {
    let filtered = fisheries;
    if (searchText) {
      filtered = filtered.filter(item =>
        item.farm_name?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.owner_name?.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    if (typeFilter !== 'All') {
      filtered = filtered.filter(item => item.fish_type === typeFilter);
    }
    return filtered;
  };

  const handleDelete = (id) => {
    setFisheries(fisheries.filter(item => item.id !== id));
    message.success('የዓሳ እርሻ ተሰርዟል');
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue({
      farm_name: record.farm_name,
      fish_type: record.fish_type,
      total_fish: record.total_fish,
      pond_size_m2: record.pond_size_m2,
      water_type: record.water_type,
      feeding_method: record.feeding_method,
      average_weight_g: record.average_weight_g,
      harvest_kg: record.harvest_kg,
      harvest_date: record.harvest_date ? dayjs(record.harvest_date) : null,
      health_status: record.health_status,
      location: record.location,
      owner_name: record.owner_name,
      owner_phone: record.owner_phone
    });
    setModalVisible(true);
  };

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({
      health_status: 'good',
      fish_type: 'ቲላፒያ',
      water_type: 'ንፁህ',
      total_fish: 0,
      pond_size_m2: 0,
      average_weight_g: 0,
      harvest_kg: 0
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
        ...values,
        harvest_date: values.harvest_date?.format('YYYY-MM-DD')
      };

      if (editingRecord) {
        setFisheries(fisheries.map(item => item.id === editingRecord.id ? newRecord : item));
        message.success('የዓሳ እርሻ ተሻሽሏል');
      } else {
        setFisheries([newRecord, ...fisheries]);
        message.success('የዓሳ እርሻ ተመዝግቧል');
      }
      handleModalCancel();
    } catch (error) {
      message.error('Failed to save fisheries record');
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
      title: 'የእርሻ ስም',
      dataIndex: 'farm_name',
      key: 'farm_name',
      width: 150,
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'የዓሳ አይነት',
      dataIndex: 'fish_type',
      key: 'fish_type',
      width: 120
    },
    {
      title: 'ብዛት',
      dataIndex: 'total_fish',
      key: 'total_fish',
      width: 100,
      render: (val) => <Tag color="blue">{val}</Tag>
    },
    {
      title: 'ኩሬ (ሜ²)',
      dataIndex: 'pond_size_m2',
      key: 'pond_size_m2',
      width: 100,
      render: (val) => `${val} ሜ²`
    },
    {
      title: 'ውሃ',
      dataIndex: 'water_type',
      key: 'water_type',
      width: 100
    },
    {
      title: 'ክብደት (ግ)',
      dataIndex: 'average_weight_g',
      key: 'average_weight_g',
      width: 110,
      render: (val) => `${val} ግ`
    },
    {
      title: 'ምርት (ኪግ)',
      dataIndex: 'harvest_kg',
      key: 'harvest_kg',
      width: 100,
      render: (val) => <Tag color="orange">{val} ኪግ</Tag>
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
            itemName={`እርሻ ${record.farm_name}`} 
            onConfirm={() => handleDelete(record.id)} 
          />
        </Space>
      ),
    },
  ];

  const filteredData = filterFisheries();
  const totalFish = fisheries.reduce((sum, item) => sum + (item.total_fish || 0), 0);
  const totalHarvest = fisheries.reduce((sum, item) => sum + (item.harvest_kg || 0), 0);

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#fff', padding: '24px' }}>
      {loading && <BrandedLoader message="የዓሳ እርሻ በማውጣት ላይ..." />}

      <div style={{ marginBottom: 20 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ marginBottom: 4, color: '#1a5f2c' }}>
              🐟 የዓሳ እርባታ አስተዳደር
            </Title>
            <Text type="secondary">የዓሳ እርሻን ይመዝግቡ እና ይከታተሉ</Text>
          </Col>
          <Col>
            <Button icon={<ReloadOutlined />} onClick={fetchFisheries}>
              አድስ
            </Button>
          </Col>
        </Row>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={CARD_STYLE_GREEN}>
            <Statistic title="ጠቅላላ እርሻ" value={fisheries.length} prefix={<FishtankOutlined style={{ color: '#52c41a' }} />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={CARD_STYLE_BLUE}>
            <Statistic title="ጠቅላላ ዓሳ" value={totalFish} prefix={<CheckCircleOutlined style={{ color: '#1890ff' }} />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={CARD_STYLE_ORANGE}>
            <Statistic title="አጠቃላይ ምርት (ኪግ)" value={totalHarvest} prefix={<WaterOutlined style={{ color: '#fa8c16' }} />} />
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
              <Option value="ቲላፒያ">ቲላፒያ</Option>
              <Option value="ካርፕ">ካርፕ</Option>
              <Option value="ሌላ">ሌላ</Option>
            </Select>
          </Col>
          <Col xs={24} md={6}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} style={{ backgroundColor: '#1b7837', borderColor: '#1b7837' }}>
              አዲስ እርሻ
            </Button>
          </Col>
        </Row>
      </Card>

      <Card bordered={false} style={{ borderRadius: 0, boxShadow: 'none', borderRight: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0' }}>
        {filteredData.length === 0 && !loading ? (
          <Empty description="ምንም የዓሳ እርሻ አልተገኘም" />
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
        title={editingRecord ? 'እርሻ አርትዕ' : 'አዲስ እርሻ'}
        open={modalVisible}
        onCancel={handleModalCancel}
        footer={null}
        width={700}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="farm_name" label="የእርሻ ስም" rules={[{ required: true, message: 'እባክዎ ያስገቡ' }]}>
                <Input placeholder="ለምሳሌ: ፊሽ 1" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="fish_type" label="የዓሳ አይነት" rules={[{ required: true, message: 'እባክዎ ይምረጡ' }]}>
                <Select>
                  <Option value="ቲላፒያ">ቲላፒያ</Option>
                  <Option value="ካርፕ">ካርፕ</Option>
                  <Option value="ሌላ">ሌላ</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="total_fish" label="ጠቅላላ ዓሳ" rules={[{ required: true, message: 'እባክዎ ያስገቡ' }]}>
                <InputNumber min={0} style={{ width: '100%' }} placeholder="ቁጥር" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="pond_size_m2" label="ኩሬ (ሜ²)" rules={[{ required: true, message: 'እባክዎ ያስገቡ' }]}>
                <InputNumber min={0} style={{ width: '100%' }} placeholder="መጠን" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="water_type" label="የውሃ አይነት">
                <Select>
                  <Option value="ንፁህ">ንፁህ</Option>
                  <Option value="ጥሩ">ጥሩ</Option>
                  <Option value="መካከለኛ">መካከለኛ</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="feeding_method" label="የመመገቢያ ዘዴ">
                <Input placeholder="ለምሳሌ: የተዘጋጀ" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="average_weight_g" label="አማካይ ክብደት (ግ)">
                <InputNumber min={0} style={{ width: '100%' }} placeholder="ክብደት" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="harvest_kg" label="ምርት (ኪግ)">
                <InputNumber min={0} style={{ width: '100%' }} placeholder="ምርት" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="harvest_date" label="የመሰብሰቢያ ቀን">
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="health_status" label="የጤና ሁኔታ">
                <Select>
                  <Option value="good">ጥሩ</Option>
                  <Option value="fair">መካከለኛ</Option>
                  <Option value="poor">ደካማ</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="location" label="ቦታ">
                <Input placeholder="ቦታ" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="owner_name" label="የባለቤት ስም">
                <Input placeholder="ስም" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="owner_phone" label="የባለቤት ስልክ">
            <Input placeholder="ስልክ ቁጥር" />
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

export default FisheriesManagement;