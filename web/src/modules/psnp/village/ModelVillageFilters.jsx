import React from 'react';
import { Row, Col, Input, Button, Space } from 'antd';
import { SearchOutlined, PlusOutlined, DownloadOutlined } from '@ant-design/icons';

export default function ModelVillageFilters({ onSearch, onAdd, dataToExport }) {
  const handleExport = () => {
    if (!dataToExport || dataToExport.length === 0) return;
    
    const headers = ['Kebele', 'Year (EC)', 'Literacy Rate (%)', 'HH with Water Access', 'Certification Status'];
    
    const csvData = dataToExport.map(r => [
      r.kebele?.name || '',
      r.certification_year_ec,
      r.literacy_rate_percentage,
      r.households_with_water_access,
      r.is_certified_model_village ? 'Certified' : 'Pending/Failed'
    ]);

    const csvContent = [headers.join(','), ...csvData.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `Model_Village_Data_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  return (
    <div style={{ padding: '16px', background: '#fff', borderRadius: '8px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <Row justify="space-between" align="middle">
        <Col xs={24} md={12}>
          <Input placeholder="Search by Kebele Name..." allowClear prefix={<SearchOutlined />} onChange={(e) => onSearch(e.target.value)} style={{ maxWidth: 350 }} />
        </Col>
        <Col xs={24} md={12} style={{ textAlign: 'right' }}>
          <Space>
            <Button onClick={handleExport} icon={<DownloadOutlined />}>Export Data</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={onAdd} style={{ background: '#1a5f2c', borderColor: '#1a5f2c' }}>Add Certification</Button>
          </Space>
        </Col>
      </Row>
    </div>
  );
}