import React, { useState, useEffect } from 'react';
import { 
  Table, Card, Row, Col, Statistic, Button, Tag, Space, 
  Typography, Empty, Tooltip, message, Input, Select, Modal,
  Form, DatePicker, InputNumber
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, 
  ReloadOutlined, CheckCircleOutlined, CloseCircleOutlined,
  DollarOutlined, LineChartOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import BrandedLoader from '../../../components/common/BrandedLoader';
import { DeleteButton } from '../../../components/common/ActionButtons';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Mock Data
const mockDairy = [
  {
    id: '1',
    animal_id: 'AN-001',
    date: '2024-07-10',
    milk_liters: 25,
    fat_percentage: 4.2,
    protein_percentage: 3.5,
    price_per_liter: 45,
    total_value: 1125,
    shift: 'morning',
    quality_grade: 'A',
    animal_type: 'ከብቲ',
    owner_name: 'አበበ በቀለ'
  },
  {
    id: '2',
    animal_id: 'AN-001',
    date: '2024-07-10',
    milk_liters: 20,
    fat_percentage: 3.8,
    protein_percentage: 3.2,
    price_per_liter: 45,
    total_value: 900,
    shift: 'evening',
    quality_grade: 'B',
    animal_type: 'ከብቲ',
    owner_name: 'አበበ በቀለ'
  }
];

const CARD_STYLE_GREEN = { borderRight: '1px solid #f0f0f0', borderBottom: '3px solid #52c41a', borderRadius: 0, height: '100%', boxShadow: 'none' };
const CARD_STYLE_BLUE = { borderRight: '1px solid #f0f0f0', borderBottom: '3px solid #1890ff', borderRadius: 0, height: '100%', boxShadow: 'none' };
const CARD_STYLE_ORANGE = { borderRight: '1px solid #f0f0f0', borderBottom: '3px solid #fa8c16', borderRadius: 0, height: '100%', boxShadow: 'none' };

const DairyProductionManagement = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [shiftFilter, setShiftFilter] = useState('All');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchRecords();
  }, []);

  useEffect(() => {
    filterRecords();
  }, [searchText, shiftFilter, records]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setRecords(mockDairy);
    } catch (error) {
      message.error('Failed to fetch dairy records');
    } finally {
      setLoading(false);
    }
  };

  const filterRecords = () => {
    let filtered = records;
    if (searchText) {
      filtered = filtered.filter(item =>
        item.animal_id?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.owner_name?.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    if (shiftFilter !== 'All') {
      filtered = filtered.filter(item => item.shift === shiftFilter);
    }
    return filtered;
  };

  const handleDelete = (id) => {
    setRecords(records.filter(item => item.id !== id));
    message.success('የወተት መረጃ ተሰርዟል');
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue({
      animal_id: record.animal_id,
      date: record.date ? dayjs(record.date) : null,
      milk_liters: record.milk_liters,
      fat_percentage: record.fat_percentage,
      protein_percentage: record.protein_percentage,
      price_per_liter: record.price_per_liter,
      shift: record.shift,
      quality_grade: record.quality_grade
    });
    setModalVisible(true);
  };

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({
      shift: 'morning',
      quality_grade: 'A',
      price_per_liter: 45
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
      const totalValue = values.milk_liters * values.price_per_liter;
      const newRecord = {
        id: editingRecord ? editingRecord.id : `${Date.now()}`,
        ...values,
        total_value: totalValue,
        date: values.date?.format('YYYY-MM-DD')
      };

      if (editingRecord) {
        setRecords(records.map(item => item.id === editingRecord.id ? newRecord : item));
        message.success('ወተት ተሻሽሏል');
      } else {
        setRecords([newRecord, ...records]);
        message.success('ወተት ተመዝግቧል');
      }
      handleModalCancel();
    } catch (error) {
      message.error('Failed to save dairy record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getShiftLabel = (shift) => {
    return shift === 'morning' ? 'ጠዋት' : 'ማታ';
  };

  const getGradeColor = (grade) => {
    const colors = {
      A: 'green',
      B: 'blue',
      C: 'orange',
      D: 'red'
    };
    return colors[grade] || 'default';
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
      title: 'ቀን',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      render: (val) => val || '-'
    },
    {
      title: 'ወተት (ሊትር)',
      dataIndex: 'milk_liters',
      key: 'milk_liters',
      width: 120,
      render: (val) => <Tag color="blue">{val} ሊትር</Tag>
    },
    {
      title: 'ስብ (%)',
      dataIndex: 'fat_percentage',
      key: 'fat_percentage',
      width: 100,
      render: (val) => val || '-'
    },
    {
      title: 'ፕሮቲን (%)',
      dataIndex: 'protein_percentage',
      key: 'protein_percentage',
      width: 100,
      render: (val) => val || '-'
    },
    {
      title: 'ተራ',
      dataIndex: 'shift',
      key: 'shift',
      width: 100,
      render: (val) => getShiftLabel(val)
    },
    {
      title: 'ጥራት',
      dataIndex: 'quality_grade',
      key: 'quality_grade',
      width: 80,
      render: (val) => <Tag color={getGradeColor(val)}>{val}</Tag>
    },
    {
      title: 'ዋጋ (ብር)',
      dataIndex: 'total_value',
      key: 'total_value',
      width: 120,
      render: (val) => <Tag color="purple">{val} ብር</Tag>
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
            itemName={`ወተት`} 
            onConfirm={() => handleDelete(record.id)} 
          />
        </Space>
      ),
    },
  ];

  const filteredData = filterRecords();
  const totalMilk = records.reduce((sum, item) => sum + (item.milk_liters || 0), 0);
  const totalValue = records.reduce((sum, item) => sum + (item.total_value || 0), 0);

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#fff', padding: '24px' }}>
      {loading && <BrandedLoader message="የወተት መረጃ በማውጣት ላይ..." />}

      <div style={{ marginBottom: 20 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ marginBottom: 4, color: '#1a5f2c' }}>
              🥛 የወተት ምርት አስተዳደር
            </Title>
            <Text type="secondary">የወተት ምርትን ይመዝግቡ እና ይከታተሉ</Text>
          </Col>
          <Col>
            <Button icon={<ReloadOutlined />} onClick={fetchRecords}>
              አድስ
            </Button>
          </Col>
        </Row>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={CARD_STYLE_GREEN}>
            <Statistic title="ጠቅላላ ወተት" value={totalMilk} suffix="ሊትር" prefix={<LineChartOutlined style={{ color: '#52c41a' }} />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={CARD_STYLE_BLUE}>
            <Statistic title="አጠቃላይ ዋጋ" value={totalValue} suffix="ብር" prefix={<DollarOutlined style={{ color: '#1890ff' }} />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={CARD_STYLE_ORANGE}>
            <Statistic title="የምዝገባ ብዛት" value={records.length} prefix={<CheckCircleOutlined style={{ color: '#fa8c16' }} />} />
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
            <Select style={{ width: '100%' }} defaultValue="All" onChange={setShiftFilter}>
              <Option value="All">ሁሉም ተራ</Option>
              <Option value="morning">ጠዋት</Option>
              <Option value="evening">ማታ</Option>
            </Select>
          </Col>
          <Col xs={24} md={6}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} style={{ backgroundColor: '#1b7837', borderColor: '#1b7837' }}>
              አዲስ መዝገብ
            </Button>
          </Col>
        </Row>
      </Card>

      <Card bordered={false} style={{ borderRadius: 0, boxShadow: 'none', borderRight: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0' }}>
        {filteredData.length === 0 && !loading ? (
          <Empty description="ምንም የወተት መረጃ አልተገኘም" />
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
        title={editingRecord ? 'ወተት አርትዕ' : 'አዲስ ወተት'}
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
              <Form.Item name="date" label="ቀን" rules={[{ required: true, message: 'እባክዎ ይምረጡ' }]}>
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="milk_liters" label="ወተት (ሊትር)" rules={[{ required: true, message: 'እባክዎ ያስገቡ' }]}>
                <InputNumber min={0} style={{ width: '100%' }} placeholder="መጠን" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="fat_percentage" label="ስብ (%)">
                <InputNumber min={0} step={0.1} style={{ width: '100%' }} placeholder="ስብ" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="protein_percentage" label="ፕሮቲን (%)">
                <InputNumber min={0} step={0.1} style={{ width: '100%' }} placeholder="ፕሮቲን" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="price_per_liter" label="ዋጋ/ሊትር (ብር)" rules={[{ required: true, message: 'እባክዎ ያስገቡ' }]}>
                <InputNumber min={0} style={{ width: '100%' }} placeholder="ዋጋ" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="quality_grade" label="ጥራት">
                <Select>
                  <Option value="A">A (እጅግ ጥሩ)</Option>
                  <Option value="B">B (ጥሩ)</Option>
                  <Option value="C">C (መካከለኛ)</Option>
                  <Option value="D">D (ደካማ)</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="shift" label="ተራ">
            <Select>
              <Option value="morning">ጠዋት</Option>
              <Option value="evening">ማታ</Option>
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

export default DairyProductionManagement;