import React, { useState, useEffect } from 'react';
import { 
  Table, Card, Row, Col, Statistic, Button, Tag, Space, 
  Typography, Empty, Tooltip, message, Input, Select, Modal,
  Form, DatePicker, InputNumber
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, 
  ReloadOutlined, CheckCircleOutlined, CloseCircleOutlined,
  ApiOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import BrandedLoader from '../../../components/common/BrandedLoader';
import { DeleteButton } from '../../../components/common/ActionButtons';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Mock Data
const mockBeehives = [
  {
    id: '1',
    apiary_name: 'ግሪን ቫሊ መንበር',
    hive_type: 'ሞደርን',
    total_hives: 50,
    bee_breed: 'የኢትዮጵያ ንብ',
    honey_production_kg: 150,
    wax_production_kg: 10,
    harvest_date: '2024-07-01',
    health_status: 'good',
    location: 'አዳማ',
    owner_name: 'አበበ በቀለ',
    owner_phone: '0912345678'
  },
  {
    id: '2',
    apiary_name: 'ቢራ መንበር',
    hive_type: 'ባህላዊ',
    total_hives: 30,
    bee_breed: 'የኢትዮጵያ ንብ',
    honey_production_kg: 60,
    wax_production_kg: 5,
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

const BeekeepingManagement = () => {
  const [beehives, setBeehives] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchBeehives();
  }, []);

  useEffect(() => {
    filterBeehives();
  }, [searchText, typeFilter, beehives]);

  const fetchBeehives = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setBeehives(mockBeehives);
    } catch (error) {
      message.error('Failed to fetch beehives');
    } finally {
      setLoading(false);
    }
  };

  const filterBeehives = () => {
    let filtered = beehives;
    if (searchText) {
      filtered = filtered.filter(item =>
        item.apiary_name?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.owner_name?.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    if (typeFilter !== 'All') {
      filtered = filtered.filter(item => item.hive_type === typeFilter);
    }
    return filtered;
  };

  const handleDelete = (id) => {
    setBeehives(beehives.filter(item => item.id !== id));
    message.success('የንብ መንበር ተሰርዟል');
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue({
      apiary_name: record.apiary_name,
      hive_type: record.hive_type,
      total_hives: record.total_hives,
      bee_breed: record.bee_breed,
      honey_production_kg: record.honey_production_kg,
      wax_production_kg: record.wax_production_kg,
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
      hive_type: 'ሞደርን',
      total_hives: 0,
      honey_production_kg: 0,
      wax_production_kg: 0
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
        setBeehives(beehives.map(item => item.id === editingRecord.id ? newRecord : item));
        message.success('የንብ መንበር ተሻሽሏል');
      } else {
        setBeehives([newRecord, ...beehives]);
        message.success('የንብ መንበር ተመዝግቧል');
      }
      handleModalCancel();
    } catch (error) {
      message.error('Failed to save beehive');
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
      title: 'የመንበር ስም',
      dataIndex: 'apiary_name',
      key: 'apiary_name',
      width: 150,
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'የመንበር አይነት',
      dataIndex: 'hive_type',
      key: 'hive_type',
      width: 120
    },
    {
      title: 'የንብ ብዛት',
      dataIndex: 'total_hives',
      key: 'total_hives',
      width: 110,
      render: (val) => <Tag color="blue">{val}</Tag>
    },
    {
      title: 'የንብ ዝርያ',
      dataIndex: 'bee_breed',
      key: 'bee_breed',
      width: 130
    },
    {
      title: 'ማር (ኪግ)',
      dataIndex: 'honey_production_kg',
      key: 'honey_production_kg',
      width: 100,
      render: (val) => <Tag color="orange">{val} ኪግ</Tag>
    },
    {
      title: 'ሰም (ኪግ)',
      dataIndex: 'wax_production_kg',
      key: 'wax_production_kg',
      width: 100,
      render: (val) => <Tag color="gold">{val} ኪግ</Tag>
    },
    {
      title: 'ጤና',
      dataIndex: 'health_status',
      key: 'health_status',
      width: 100,
      render: (val) => <Tag color={getStatusColor(val)}>{getStatusLabel(val)}</Tag>
    },
    {
      title: 'ቦታ',
      dataIndex: 'location',
      key: 'location',
      width: 120
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
            itemName={`መንበር ${record.apiary_name}`} 
            onConfirm={() => handleDelete(record.id)} 
          />
        </Space>
      ),
    },
  ];

  const filteredData = filterBeehives();
  const totalHives = beehives.reduce((sum, item) => sum + (item.total_hives || 0), 0);
  const totalHoney = beehives.reduce((sum, item) => sum + (item.honey_production_kg || 0), 0);

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#fff', padding: '24px' }}>
      {loading && <BrandedLoader message="የንብ መንበር በማውጣት ላይ..." />}

      <div style={{ marginBottom: 20 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ marginBottom: 4, color: '#1a5f2c' }}>
              🐝 የንብ እርባታ አስተዳደር
            </Title>
            <Text type="secondary">የንብ መንበርን ይመዝግቡ እና ይከታተሉ</Text>
          </Col>
          <Col>
            <Button icon={<ReloadOutlined />} onClick={fetchBeehives}>
              አድስ
            </Button>
          </Col>
        </Row>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={CARD_STYLE_GREEN}>
            <Statistic title="ጠቅላላ መንበር" value={beehives.length} prefix={<ApiOutlined style={{ color: '#52c41a' }} />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={CARD_STYLE_BLUE}>
            <Statistic title="ጠቅላላ ንብ" value={totalHives} prefix={<CheckCircleOutlined style={{ color: '#1890ff' }} />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={CARD_STYLE_ORANGE}>
            <Statistic title="አጠቃላይ ማር (ኪግ)" value={totalHoney} prefix={<CheckCircleOutlined style={{ color: '#fa8c16' }} />} />
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
              <Option value="ሞደርን">ሞደርን</Option>
              <Option value="ባህላዊ">ባህላዊ</Option>
            </Select>
          </Col>
          <Col xs={24} md={6}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} style={{ backgroundColor: '#1b7837', borderColor: '#1b7837' }}>
              አዲስ መንበር
            </Button>
          </Col>
        </Row>
      </Card>

      <Card bordered={false} style={{ borderRadius: 0, boxShadow: 'none', borderRight: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0' }}>
        {filteredData.length === 0 && !loading ? (
          <Empty description="ምንም መንበር አልተገኘም" />
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
        title={editingRecord ? 'መንበር አርትዕ' : 'አዲስ መንበር'}
        open={modalVisible}
        onCancel={handleModalCancel}
        footer={null}
        width={700}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="apiary_name" label="የመንበር ስም" rules={[{ required: true, message: 'እባክዎ ያስገቡ' }]}>
                <Input placeholder="ለምሳሌ: መንበር 1" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="hive_type" label="የመንበር አይነት" rules={[{ required: true, message: 'እባክዎ ይምረጡ' }]}>
                <Select>
                  <Option value="ሞደርን">ሞደርን</Option>
                  <Option value="ባህላዊ">ባህላዊ</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="total_hives" label="የንብ ብዛት" rules={[{ required: true, message: 'እባክዎ ያስገቡ' }]}>
                <InputNumber min={0} style={{ width: '100%' }} placeholder="ብዛት" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="bee_breed" label="የንብ ዝርያ">
                <Input placeholder="ዝርያ" />
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
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="honey_production_kg" label="ማር (ኪግ)">
                <InputNumber min={0} style={{ width: '100%' }} placeholder="ማር" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="wax_production_kg" label="ሰም (ኪግ)">
                <InputNumber min={0} style={{ width: '100%' }} placeholder="ሰም" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="harvest_date" label="የመሰብሰቢያ ቀን">
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
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

export default BeekeepingManagement;