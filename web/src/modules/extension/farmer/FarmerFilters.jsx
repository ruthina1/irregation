import React from 'react';
import { Row, Col, Input, Select, Button, Space } from 'antd';
import { SearchOutlined, PlusOutlined, DownloadOutlined } from '@ant-design/icons';

const { Option } = Select;

export default function FarmerFilters({ onSearch, onFilterType, onAdd, dataToExport }) {
  
  const handleExport = () => {
    if (!dataToExport || dataToExport.length === 0) return;
    
    const headers = [
      'Unique ID', 'Full Name', 'Gender', 'Age', 'Head Type', 'Farmer Type', 
      'Mobile Access', 'Crops', 'Cattle', 'Shoats', 'Equines', 'Poultry'
    ];

    const csvData = dataToExport.map(row => [
      row.farmer_unique_id_no,
      `"${row.full_name}"`,
      row.gender,
      row.age,
      row.household_head_type,
      row.farmer_type,
      row.access_to_mobile_phone ? 'Yes' : 'No',
      `"${(row.primary_crops || []).join(' ')}"`,
      row.livestock?.cattle_total || 0,
      row.livestock?.shoats_total || 0,
      row.livestock?.equines_total || 0,
      row.livestock?.poultry_total || 0,
    ]);

    const csvContent = [headers.join(','), ...csvData.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `Farmers_Export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ padding: '16px', background: '#fff', borderRadius: '8px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <Row gutter={[16, 16]} justify="space-between" align="middle">
        <Col xs={24} md={12}>
          <Space size="middle" style={{ width: '100%' }}>
            <Input placeholder="Search name or ID..." allowClear prefix={<SearchOutlined />} onChange={(e) => onSearch(e.target.value)} style={{ minWidth: '250px' }} />
            <Select placeholder="Filter by Type" allowClear onChange={onFilterType} style={{ minWidth: '180px' }}>
              <Option value="Regular">Regular</Option>
              <Option value="Model">Model</Option>
              <Option value="Private Investor">Private Investor</Option>
            </Select>
          </Space>
        </Col>
        <Col xs={24} md={12} style={{ textAlign: 'right' }}>
          <Space>
            <Button onClick={handleExport} icon={<DownloadOutlined />}>Export Data</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={onAdd} style={{ background: '#1a5f2c' }}>Register Farmer</Button>
          </Space>
        </Col>
      </Row>
    </div>
  );
}