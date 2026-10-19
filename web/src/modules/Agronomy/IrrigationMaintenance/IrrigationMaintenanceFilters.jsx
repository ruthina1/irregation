import React from 'react';
import { Input, Select, Button, Row, Col, Card } from 'antd';
import { SearchOutlined, DownloadOutlined, PlusOutlined } from '@ant-design/icons';

const { Option } = Select;

const IrrigationMaintenanceFilters = ({
  searchText,
  setSearchText,
  typeFilter,
  setTypeFilter,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  onExport,
  onAdd,
}) => {
  return (
    <Card bordered={false} style={{ marginBottom: 16, borderRadius: 0, boxShadow: 'none', borderRight: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0' }}>
      <Row gutter={[16, 16]} align="middle" justify="space-between">
        <Col xs={24} md={5}>
          <Input
            placeholder="Search maintenance..."
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
            <Option value="preventive">Preventive</Option>
            <Option value="corrective">Corrective</Option>
            <Option value="emergency">Emergency</Option>
            <Option value="routine">Routine</Option>
          </Select>
        </Col>

        <Col xs={24} sm={8} md={3}>
          <Select 
            style={{ width: '100%' }} 
            value={statusFilter} 
            onChange={setStatusFilter}
          >
            <Option value="All">All Status</Option>
            <Option value="planned">Planned</Option>
            <Option value="in_progress">In Progress</Option>
            <Option value="completed">Completed</Option>
            <Option value="verified">Verified</Option>
            <Option value="cancelled">Cancelled</Option>
          </Select>
        </Col>

        <Col xs={24} sm={8} md={3}>
          <Select 
            style={{ width: '100%' }} 
            value={priorityFilter} 
            onChange={setPriorityFilter}
          >
            <Option value="All">All Priority</Option>
            <Option value="high">High</Option>
            <Option value="medium">Medium</Option>
            <Option value="low">Low</Option>
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
              New Maintenance
            </Button>
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default IrrigationMaintenanceFilters;