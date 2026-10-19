import React from 'react';
import { Input, Select, Button, Row, Col, Card } from 'antd';
import { SearchOutlined, DownloadOutlined, PlusOutlined } from '@ant-design/icons';

const { Option } = Select;

const SeedVarietyFilters = ({
  searchText,
  setSearchText,
  cropTypeFilter,
  setCropTypeFilter,
  statusFilter,
  setStatusFilter,
  onExport,
  onAdd,
}) => {
  return (
    <Card bordered={false} style={{ marginBottom: 16, borderRadius: 0, boxShadow: 'none', borderRight: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0' }}>
      <Row gutter={[16, 16]} align="middle" justify="space-between">
        <Col xs={24} md={5}>
          <Input
            placeholder="Search variety name..."
            prefix={<SearchOutlined />}
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </Col>

        <Col xs={24} sm={8} md={4}>
          <Select 
            style={{ width: '100%' }} 
            value={cropTypeFilter} 
            onChange={setCropTypeFilter}
          >
            <Option value="All">All Crops</Option>
            <Option value="Wheat">Wheat</Option>
            <Option value="Maize">Maize</Option>
            <Option value="Teff">Teff</Option>
            <Option value="Barley">Barley</Option>
            <Option value="Sorghum">Sorghum</Option>
            <Option value="Millet">Millet</Option>
            <Option value="Rice">Rice</Option>
            <Option value="Soybean">Soybean</Option>
            <Option value="Faba Bean">Faba Bean</Option>
            <Option value="Chickpea">Chickpea</Option>
            <Option value="Lentil">Lentil</Option>
            <Option value="Pea">Pea</Option>
          </Select>
        </Col>

        <Col xs={24} sm={8} md={4}>
          <Select 
            style={{ width: '100%' }} 
            value={statusFilter} 
            onChange={setStatusFilter}
          >
            <Option value="All">All Status</Option>
            <Option value="active">Active</Option>
            <Option value="inactive">Inactive</Option>
            <Option value="archived">Archived</Option>
          </Select>
        </Col>

        <Col xs={24} md={8}>
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
              Add Variety
            </Button>
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default SeedVarietyFilters;