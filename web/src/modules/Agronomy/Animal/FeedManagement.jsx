import React, { useState, useEffect } from 'react';
import { 
  Table, Card, Row, Col, Statistic, Button, Tag, Space, 
  Typography, Empty, Tooltip, message, Input, Select, Modal,
  Form, DatePicker, InputNumber
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, 
  ReloadOutlined, CheckCircleOutlined, ClockCircleOutlined,
  ShoppingCartOutlined, WarningOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import BrandedLoader from '../../../components/common/BrandedLoader';
import { DeleteButton } from '../../../components/common/ActionButtons';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Mock Data
const mockFeeds = [
  {
    id: '1',
    feed_type: 'የተዘጋጀ',
    feed_name: 'አልፋልፋ ገለባ',
    quantity_kg: 500,
    unit_price: 15,
    total_cost: 7500,
    supplier: 'ኢትዮጵያ ፊድ',
    purchase_date: '2024-07-01',
    expiry_date: '2024-12-31',
    status: 'in_stock',
    category: 'ሳር'
  },
  {
    id: '2',
    feed_type: 'የተጨመረ',
    feed_name: 'የበቆሎ ሊጥ',
    quantity_kg: 300,
    unit_price: 25,
    total_cost: 7500,
    supplier: 'ቢራ እርሻ',
    purchase_date: '2024-07-15',
    expiry_date: '2024-11-15',
    status: 'low_stock',
    category: 'እህል'
  }
];

const CARD_STYLE_GREEN = { borderRight: '1px solid #f0f0f0', borderBottom: '3px solid #52c41a', borderRadius: 0, height: '100%', boxShadow: 'none' };
const CARD_STYLE_BLUE = { borderRight: '1px solid #f0f0f0', borderBottom: '3px solid #1890ff', borderRadius: 0, height: '100%', boxShadow: 'none' };
const CARD_STYLE_ORANGE = { borderRight: '1px solid #f0f0f0', borderBottom: '3px solid #fa8c16', borderRadius: 0, height: '100%', boxShadow: 'none' };
const CARD_STYLE_PURPLE = { borderRight: '1px solid #f0f0f0', borderBottom: '3px solid #722ed1', borderRadius: 0, height: '100%', boxShadow: 'none' };

const FeedManagement = () => {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchFeeds();
  }, []);

  useEffect(() => {
    filterFeeds();
  }, [searchText, typeFilter, statusFilter, feeds]);

  const fetchFeeds = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setFeeds(mockFeeds);
    } catch (error) {
      message.error('Failed to fetch feeds');
    } finally {
      setLoading(false);
    }
  };

  const filterFeeds = () => {
    let filtered = feeds;
    if (searchText) {
      filtered = filtered.filter(item =>
        item.feed_name?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.supplier?.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    if (typeFilter !== 'All') {
      filtered = filtered.filter(item => item.feed_type === typeFilter);
    }
    if (statusFilter !== 'All') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }
    return filtered;
  };

  const handleDelete = (id) => {
    setFeeds(feeds.filter(item => item.id !== id));
    message.success('መኖ ተሰርዟል');
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue({
      feed_type: record.feed_type,
      feed_name: record.feed_name,
      quantity_kg: record.quantity_kg,
      unit_price: record.unit_price,
      supplier: record.supplier,
      purchase_date: record.purchase_date ? dayjs(record.purchase_date) : null,
      expiry_date: record.expiry_date ? dayjs(record.expiry_date) : null,
      status: record.status,
      category: record.category
    });
    setModalVisible(true);
  };

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({
      status: 'in_stock',
      feed_type: 'የተዘጋጀ'
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
      const totalCost = values.quantity_kg * values.unit_price;
      const newFeed = {
        id: editingRecord ? editingRecord.id : `${Date.now()}`,
        ...values,
        total_cost: totalCost,
        purchase_date: values.purchase_date?.format('YYYY-MM-DD'),
        expiry_date: values.expiry_date?.format('YYYY-MM-DD')
      };

      if (editingRecord) {
        setFeeds(feeds.map(item => item.id === editingRecord.id ? newFeed : item));
        message.success('መኖ ተሻሽሏል');
      } else {
        setFeeds([newFeed, ...feeds]);
        message.success('መኖ ተመዝግቧል');
      }
      handleModalCancel();
    } catch (error) {
      message.error('Failed to save feed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      in_stock: 'green',
      low_stock: 'orange',
      out_of_stock: 'red',
      expired: 'red'
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      in_stock: 'በመጋዘን',
      low_stock: 'እየቀነሰ',
      out_of_stock: 'አልተገኘም',
      expired: 'ተበላሽቷል'
    };
    return labels[status] || status;
  };

  const getTypeLabel = (type) => {
    const labels = {
      'የተዘጋጀ': 'የተዘጋጀ',
      'የተጨመረ': 'የተጨመረ',
      'ሳር': 'ሳር',
      'እህል': 'እህል'
    };
    return labels[type] || type;
  };

  const columns = [
    {
      title: 'የመኖ ስም',
      dataIndex: 'feed_name',
      key: 'feed_name',
      width: 180,
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'አይነት',
      dataIndex: 'feed_type',
      key: 'feed_type',
      width: 120,
      render: (val) => getTypeLabel(val)
    },
    {
      title: 'መጠን (ኪግ)',
      dataIndex: 'quantity_kg',
      key: 'quantity_kg',
      width: 100,
      render: (val) => <Tag color="blue">{val} ኪግ</Tag>
    },
    {
      title: 'ዋጋ/ኪግ',
      dataIndex: 'unit_price',
      key: 'unit_price',
      width: 100,
      render: (val) => `${val} ብር`
    },
    {
      title: 'አጠቃላይ ወጪ',
      dataIndex: 'total_cost',
      key: 'total_cost',
      width: 120,
      render: (val) => <Tag color="purple">{val} ብር</Tag>
    },
    {
      title: 'አቅራቢ',
      dataIndex: 'supplier',
      key: 'supplier',
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
      title: 'ቀን',
      dataIndex: 'purchase_date',
      key: 'purchase_date',
      width: 110,
      render: (val) => val || '-'
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
            itemName={`መኖ ${record.feed_name}`} 
            onConfirm={() => handleDelete(record.id)} 
          />
        </Space>
      ),
    },
  ];

  const filteredData = filterFeeds();
  const totalQuantity = feeds.reduce((sum, item) => sum + (item.quantity_kg || 0), 0);
  const totalCost = feeds.reduce((sum, item) => sum + (item.total_cost || 0), 0);
  const lowStock = feeds.filter(item => item.status === 'low_stock').length;

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#fff', padding: '24px' }}>
      {loading && <BrandedLoader message="መኖዎችን በማውጣት ላይ..." />}

      <div style={{ marginBottom: 20 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ marginBottom: 4, color: '#1a5f2c' }}>
              🌾 የመኖ አስተዳደር
            </Title>
            <Text type="secondary">የእንስሳትን መኖ ይመዝግቡ እና ይከታተሉ</Text>
          </Col>
          <Col>
            <Button icon={<ReloadOutlined />} onClick={fetchFeeds}>
              አድስ
            </Button>
          </Col>
        </Row>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={CARD_STYLE_GREEN}>
            <Statistic title="ጠቅላላ መኖ" value={feeds.length} prefix={<ShoppingCartOutlined style={{ color: '#52c41a' }} />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={CARD_STYLE_BLUE}>
            <Statistic title="ጠቅላላ መጠን (ኪግ)" value={totalQuantity} prefix={<CheckCircleOutlined style={{ color: '#1890ff' }} />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={CARD_STYLE_ORANGE}>
            <Statistic title="ዝቅተኛ ክምችት" value={lowStock} prefix={<WarningOutlined style={{ color: '#fa8c16' }} />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={CARD_STYLE_PURPLE}>
            <Statistic title="አጠቃላይ ወጪ" value={totalCost} prefix={<CheckCircleOutlined style={{ color: '#722ed1' }} />} suffix="ብር" />
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
              <Option value="የተዘጋጀ">የተዘጋጀ</Option>
              <Option value="የተጨመረ">የተጨመረ</Option>
              <Option value="ሳር">ሳር</Option>
              <Option value="እህል">እህል</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8} md={4}>
            <Select style={{ width: '100%' }} defaultValue="All" onChange={setStatusFilter}>
              <Option value="All">ሁሉም ሁኔታ</Option>
              <Option value="in_stock">በመጋዘን</Option>
              <Option value="low_stock">እየቀነሰ</Option>
              <Option value="out_of_stock">አልተገኘም</Option>
              <Option value="expired">ተበላሽቷል</Option>
            </Select>
          </Col>
          <Col xs={24} md={6}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} style={{ backgroundColor: '#1b7837', borderColor: '#1b7837' }}>
              አዲስ መኖ
            </Button>
          </Col>
        </Row>
      </Card>

      <Card bordered={false} style={{ borderRadius: 0, boxShadow: 'none', borderRight: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0' }}>
        {filteredData.length === 0 && !loading ? (
          <Empty description="ምንም መኖ አልተገኘም" />
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
        title={editingRecord ? 'መኖ አርትዕ' : 'አዲስ መኖ'}
        open={modalVisible}
        onCancel={handleModalCancel}
        footer={null}
        width={700}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="feed_name" label="የመኖ ስም" rules={[{ required: true, message: 'እባክዎ ያስገቡ' }]}>
                <Input placeholder="ለምሳሌ: አልፋልፋ ገለባ" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="feed_type" label="አይነት" rules={[{ required: true, message: 'እባክዎ ይምረጡ' }]}>
                <Select>
                  <Option value="የተዘጋጀ">የተዘጋጀ</Option>
                  <Option value="የተጨመረ">የተጨመረ</Option>
                  <Option value="ሳር">ሳር</Option>
                  <Option value="እህል">እህል</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="quantity_kg" label="መጠን (ኪግ)" rules={[{ required: true, message: 'እባክዎ ያስገቡ' }]}>
                <InputNumber min={0} style={{ width: '100%' }} placeholder="መጠን" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="unit_price" label="ዋጋ/ኪግ (ብር)" rules={[{ required: true, message: 'እባክዎ ያስገቡ' }]}>
                <InputNumber min={0} style={{ width: '100%' }} placeholder="ዋጋ" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="supplier" label="አቅራቢ">
                <Input placeholder="ስም" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="purchase_date" label="የግዢ ቀን">
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="expiry_date" label="የሚያልቅበት ቀን">
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="category" label="ምድብ">
                <Input placeholder="ለምሳሌ: ሳር, እህል" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="ሁኔታ">
                <Select>
                  <Option value="in_stock">በመጋዘን</Option>
                  <Option value="low_stock">እየቀነሰ</Option>
                  <Option value="out_of_stock">አልተገኘም</Option>
                  <Option value="expired">ተበላሽቷል</Option>
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

export default FeedManagement;