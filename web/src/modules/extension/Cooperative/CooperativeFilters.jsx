import React from 'react';
import { Input, Select, Button, Row, Col, Card } from 'antd';
import { SearchOutlined, DownloadOutlined, PlusOutlined } from '@ant-design/icons';

const { Option } = Select;

const CooperativeFilters = ({
  searchText,
  setSearchText,
  typeFilter,
  setTypeFilter,
  statusFilter,
  setStatusFilter,
  registrationFilter,
  setRegistrationFilter,
  onExport,
  onAdd,
}) => {
  return (
    <Card bordered={false} style={{ marginBottom: 16, borderRadius: 0, boxShadow: 'none', borderRight: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0' }}>
      <Row gutter={[16, 16]} align="middle" justify="space-between">
        <Col xs={24} md={5}>
          <Input
            placeholder="Search cooperative..."
            prefix={<SearchOutlined />}
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </Col>

        <Col xs={24} sm={8} md={3}>
          <Select 
            style={{ width: '100%' }} 
            value={typeFilter} 
            onChange={setTypeFilter}
          >
            <Option value="All">All Types</Option>
            <Option value="Agricultural">Agricultural</Option>
            <Option value="Livestock">Livestock</Option>
            <Option value="Fishery">Fishery</Option>
            <Option value="Horticulture">Horticulture</Option>
            <Option value="Multi-purpose">Multi-purpose</Option>
            <Option value="Other">Other</Option>
          </Select>
        </Col>

        <Col xs={24} sm={8} md={3}>
          <Select 
            style={{ width: '100%' }} 
            value={statusFilter} 
            onChange={setStatusFilter}
          >
            <Option value="All">All Status</Option>
            <Option value="active">Active</Option>
            <Option value="inactive">Inactive</Option>
            <Option value="suspended">Suspended</Option>
            <Option value="dissolved">Dissolved</Option>
          </Select>
        </Col>

        <Col xs={24} sm={8} md={3}>
          <Select 
            style={{ width: '100%' }} 
            value={registrationFilter} 
            onChange={setRegistrationFilter}
          >
            <Option value="All">All Registration</Option>
            <Option value="draft">Draft</Option>
            <Option value="submitted">Submitted</Option>
            <Option value="approved">Approved</Option>
            <Option value="rejected">Rejected</Option>
          </Select>
        </Col>

        <Col xs={24} md={7}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
            <Button icon={<DownloadOutlined />} onClick={onExport}>
              Export
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={onAdd} 
              style={{ backgroundColor: '#1b7837', borderColor: '#1b7837' }}
            >
              New Cooperative
            </Button>
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default CooperativeFilters;