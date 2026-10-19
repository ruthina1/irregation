import React, { useState, useEffect } from 'react';
import { Typography, Breadcrumb, Row, Col, Card, Statistic, Button, Table, Tag, Input, Space } from 'antd';
import { 
  MessageOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  SearchOutlined, 
  SendOutlined, 
  UserOutlined,
  CalendarOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import BrandedLoader from '../../components/common/BrandedLoader';
import SmsModal from './SmsModal'; 
import { communicationApi } from '../../services/api/communicationApi';

const { Title, Text } = Typography;

export default function SmsDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  
  // Real Data States
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ total_sent_recipients: 0, total_failed_recipients: 0, broadcasts_this_month: 0 });
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, [searchTerm]);

  const fetchDashboardData = async (page = 1) => {
    setTableLoading(true);
    try {
      // Fetch Stats and Logs at the same time
      const [statsRes, logsRes] = await Promise.all([
        communicationApi.getSmsStats(),
        communicationApi.getSmsLogs(page, searchTerm)
      ]);

      setStats(statsRes.data);
      
      const { data, current_page, total } = logsRes.data;
      setLogs(data);
      setPagination({ current: current_page, pageSize: 10, total: total });

    } catch (error) {
      console.error("Failed to load SMS data", error);
    } finally {
      setInitialLoad(false);
      setTableLoading(false);
    }
  };

  const handleTableChange = (newPagination) => {
    fetchDashboardData(newPagination.current);
  };

  const onSearch = (value) => {
    setSearchTerm(value);
  };

  const columns = [
    { 
      title: 'Timestamp', 
      dataIndex: 'created_at', 
      key: 'created_at', 
      width: '18%',
      render: (text) => (
        <Space size={8}>
          <CalendarOutlined style={{ color: '#64748b' }} />
          <Text style={{ fontSize: 13, color: '#334155' }}>
            {new Date(text).toLocaleString()}
          </Text>
        </Space>
      )
    },
    { 
      title: 'Audience / Target Group', 
      dataIndex: 'target_value', 
      key: 'target_value', 
      width: '20%', 
      render: (text) => (
        <Text strong style={{ fontSize: 13, color: '#0f172a' }}>
          {text}
        </Text>
      )
    },
    { 
      title: 'Message Parameters', 
      dataIndex: 'message', 
      key: 'message', 
      width: '32%', 
      render: (text) => (
        <Text type="secondary" ellipsis style={{ maxWidth: 280, fontSize: 13 }}>
          {text}
        </Text>
      )
    },
    { 
      title: 'Sender', 
      dataIndex: ['admin', 'full_name'], 
      key: 'sender', 
      width: '15%',
      render: (text) => (
        <Space size={4}>
          <UserOutlined style={{ color: '#64748b', fontSize: 12 }} />
          <Text style={{ fontSize: 13, color: '#334155' }}>
            {text || 'System Event'}
          </Text>
        </Space>
      )
    },
    { 
      title: 'Recipients', 
      dataIndex: 'recipients_count', 
      key: 'recipients_count', 
      align: 'center', 
      width: '8%',
      render: (count) => (
        <Text strong style={{ fontSize: 13, color: '#334155' }}>
          {count}
        </Text>
      )
    },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status', 
      width: '10%',
      render: (status) => (
        <Tag 
          color={status === 'Sent' ? 'success' : 'error'} 
          icon={status === 'Sent' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
          style={{ fontWeight: 600, borderRadius: '2px', padding: '1px 8px' }}
        >
          {status}
        </Tag>
      )
    },
  ];

  return (
    <div style={{ position: 'relative', minHeight: '100%', fontFamily: 'Georgia, serif' }}>
      {initialLoad && <BrandedLoader message="Loading Communication Dashboard..." />}

      {/* ─── Breadcrumbs & Heading Header Block ─── */}
      <div style={{ marginBottom: 32, paddingBottom: 16, borderBottom: '1px solid #E2E8F0' }}>
        <Breadcrumb style={{ marginBottom: 12, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          <Breadcrumb.Item>IAIMS</Breadcrumb.Item>
          <Breadcrumb.Item>System Administration</Breadcrumb.Item>
          <Breadcrumb.Item>Communication Center</Breadcrumb.Item>
        </Breadcrumb>

        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} md={16}>
            <Title level={2} style={{ margin: 0, color: '#0F172A', fontFamily: 'Georgia, serif', fontWeight: 700, display: 'flex', alignItems: 'center' }}>
              <MessageOutlined style={{ color: '#28805c', marginRight: 14, fontSize: 28 }} />
              SMS Broadcast Center
            </Title>
            <Text type="secondary" style={{ fontSize: '13px', display: 'block', marginTop: 4, fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
              Send verified administrative alerts, dispatch instructions to woreda staff, and audit transaction records.
            </Text>
          </Col>
          <Col xs={24} md={8} style={{ textAlign: 'right' }}>
            <Button 
              type="primary" 
              icon={<SendOutlined />} 
              onClick={() => setIsModalOpen(true)}
              style={{ 
                backgroundColor: '#28805c', 
                borderColor: '#28805c', 
                height: '42px', 
                borderRadius: '4px', 
                fontWeight: 600,
                fontSize: 14,
                boxShadow: '0 2px 4px rgba(40,128,92,0.15)',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
              }}
            >
              New Broadcast Dispatch
            </Button>
          </Col>
        </Row>
      </div>

      {/* ─── Polished Statistics Section ─── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        <Col xs={24} md={8}>
          <Card 
            bordered={true} 
            style={{ 
              borderLeft: '4px solid #1890ff', 
              borderRadius: '4px', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)' 
            }}
          >
            <Statistic 
              title={<span style={{ color: '#64748b', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Broadcasts (Month)</span>} 
              value={stats.broadcasts_this_month} 
              prefix={<MessageOutlined style={{ color: '#1890ff', marginRight: 8 }} />} 
              valueStyle={{ fontWeight: 700, color: '#0f172a' }}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card 
            bordered={true} 
            style={{ 
              borderLeft: '4px solid #28805c', 
              borderRadius: '4px', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)' 
            }}
          >
            <Statistic 
              title={<span style={{ color: '#64748b', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Recipients Reached</span>} 
              value={stats.total_sent_recipients} 
              valueStyle={{ color: '#28805c', fontWeight: 700 }} 
              prefix={<CheckCircleOutlined style={{ marginRight: 8 }} />} 
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card 
            bordered={true} 
            style={{ 
              borderLeft: '4px solid #ef4444', 
              borderRadius: '4px', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)' 
            }}
          >
            <Statistic 
              title={<span style={{ color: '#64748b', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Delivery Failures</span>} 
              value={stats.total_failed_recipients} 
              valueStyle={{ color: '#cf1322', fontWeight: 700 }} 
              prefix={<CloseCircleOutlined style={{ marginRight: 8 }} />} 
            />
          </Card>
        </Col>
      </Row>

      {/* ─── Real Data Audit Logs Table ─── */}
      <Card 
        bordered={true} 
        style={{ 
          borderRadius: '4px', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          borderColor: '#e2e8f0'
        }}
      >
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <Space size={8}>
            <InfoCircleOutlined style={{ color: '#28805c' }} />
            <Text strong style={{ fontSize: '15px', color: '#0f172a', fontFamily: 'Georgia, serif' }}>
              Historical Broadcast Logs
            </Text>
          </Space>
          
          <Input 
            placeholder="Search logs by message or target..." 
            onChange={(e) => onSearch(e.target.value)} 
            allowClear
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            style={{ 
              width: 320, 
              borderRadius: '4px',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
            }} 
          />
        </div>
        
        <Table 
          columns={columns} 
          dataSource={logs} 
          rowKey="id" 
          loading={tableLoading}
          pagination={pagination}
          onChange={handleTableChange}
          size="middle"
          bordered
          style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
        />
      </Card>

      {/* ─── The SMS Form Modal ─── */}
      <SmsModal 
        open={isModalOpen} 
        onCancel={() => setIsModalOpen(false)} 
        onSuccess={() => fetchDashboardData(1)} 
      />
    </div>
  );
}