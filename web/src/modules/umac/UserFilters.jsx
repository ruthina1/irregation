import React from 'react';
import { Input, Select, Button, Space, Row, Col } from 'antd';
import { SearchOutlined, PlusOutlined, FilterOutlined } from '@ant-design/icons';

const { Option } = Select;

export default function UserFilters({ onSearch, onFilterStatus, onAdd }) {
  return (
    <div style={{ 
      background: '#ffffff', 
      padding: '16px 24px', 
      borderRadius: '8px', 
      boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
      marginBottom: '16px',
      border: '1px solid #E2E8F0'
    }}>
      <Row justify="space-between" align="middle" gutter={[16, 16]}>
        
        {/* Left Side: Search & Filter */}
        <Col xs={24} md={16}>
          <Space size="middle" wrap>
            <Input
              placeholder="Search by name or email..."
              allowClear
              prefix={<SearchOutlined style={{ color: '#94A3B8' }} />}
              onSearch={onSearch}
              onPressEnter={(e) => onSearch(e.target.value)}
              style={{ width: 280 }}
            />
            
            <Select 
              placeholder="Filter by Status" 
              allowClear 
              onChange={onFilterStatus}
              style={{ width: 180 }}
              suffixIcon={<FilterOutlined />}
            >
              <Option value="active">Active Users</Option>
              <Option value="inactive">Inactive Users</Option>
            </Select>
          </Space>
        </Col>

        {/* Right Side: Action Button */}
        <Col xs={24} md={8} style={{ textAlign: 'right' }}>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={onAdd}
            style={{ backgroundColor: '#039c33', borderColor: '#039c33' }}
          >
            Register New User
          </Button>
        </Col>
      </Row>
    </div>
  );
}