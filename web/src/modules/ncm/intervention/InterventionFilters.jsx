import React from 'react';
import { Row, Col, Input, Select, Button, Space } from 'antd';
import { SearchOutlined, PlusOutlined, DownloadOutlined } from '@ant-design/icons';

const { Option } = Select;

export default function InterventionFilters({ onSearch, onFilterCategory, onAdd, dataToExport }) {
  const handleExport = () => {
    if (!dataToExport || dataToExport.length === 0) return;
    
    const headers = ['Watershed', 'Kebele', 'Category', 'Intervention Type', 'Treated Area (Ha)', 'Year (EC)'];
    const csvData = dataToExport.map(r => [
      `"${r.watershed?.watershed_name || ''}"`,
      r.watershed?.kebele?.name || '',
      r.intervention_category,
      `"${r.intervention_type}"`,
      r.treated_area_ha,
      r.year_implemented_ec
    ]);

    const csvContent = [headers.join(','), ...csvData.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `NCM_Interventions_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  return (
    <div style={{ padding: '16px', background: '#fff', borderRadius: '8px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <Row justify="space-between" align="middle">
        <Col xs={24} md={14}>
          <Space size="middle" style={{ width: '100%' }}>
            <Input placeholder="Search Watershed or Type..." allowClear prefix={<SearchOutlined />} onChange={(e) => onSearch(e.target.value)} style={{ minWidth: 280 }} />
            <Select placeholder="Filter Category" allowClear onChange={onFilterCategory} style={{ minWidth: 150 }}>
              <Option value="Physical">Physical</Option>
              <Option value="Biological">Biological</Option>
            </Select>
          </Space>
        </Col>
        <Col xs={24} md={10} style={{ textAlign: 'right' }}>
          <Space>
            <Button onClick={handleExport} icon={<DownloadOutlined />}>Export Data</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={onAdd} style={{ background: '#1a5f2c', borderColor: '#1a5f2c' }}>Add Intervention</Button>
          </Space>
        </Col>
      </Row>
    </div>
  );
}