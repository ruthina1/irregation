import React from 'react';
import { Row, Col, Input, Select, Button, Space } from 'antd';
import { SearchOutlined, PlusOutlined, DownloadOutlined } from '@ant-design/icons';

const { Option } = Select;

export default function PsnpFilters({ onSearch, onFilterType, onAdd, dataToExport }) {
  
  const handleExport = () => {
    if (!dataToExport || dataToExport.length === 0) return;
    
    const headers = ['Unique ID', 'Farmer Name', 'Kebele', 'Targeting Type', 'Status', 'Total Transfers Logged'];

    const csvData = dataToExport.map(row => [
      row.farmer?.farmer_unique_id_no || '',
      `"${row.farmer?.full_name || ''}"`,
      row.farmer?.kebele?.name || '',
      row.targeting_type,
      row.is_graduated ? 'Graduated' : 'Active',
      row.transfers?.length || 0
    ]);

    const csvContent = [headers.join(','), ...csvData.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `PSNP_Households_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ padding: '16px', background: '#fff', borderRadius: '8px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <Row gutter={[16, 16]} justify="space-between" align="middle">
        <Col xs={24} md={14}>
          <Space size="middle" style={{ width: '100%' }}>
            <Input 
              placeholder="Search by Farmer Name or ID..." 
              allowClear 
              prefix={<SearchOutlined />} 
              onChange={(e) => onSearch(e.target.value)}
              style={{ minWidth: '300px' }}
            />
            <Select placeholder="Filter by Type" allowClear onChange={onFilterType} style={{ minWidth: '200px' }}>
              <Option value="PW">Public Work (PW)</Option>
              <Option value="PDS">Direct Support (PDS)</Option>
            </Select>
          </Space>
        </Col>
        
        <Col xs={24} md={10} style={{ textAlign: 'right' }}>
          <Space>
            <Button onClick={handleExport} icon={<DownloadOutlined />}>Export Data</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={onAdd} style={{ background: '#1a5f2c', borderColor: '#1a5f2c' }}>
              Target Household
            </Button>
          </Space>
        </Col>
      </Row>
    </div>
  );
}