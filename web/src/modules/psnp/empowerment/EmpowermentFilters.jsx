import React from 'react';
import { Row, Col, Input, Button, Space } from 'antd';
import { SearchOutlined, PlusOutlined, DownloadOutlined } from '@ant-design/icons';

export default function EmpowermentFilters({ onSearch, onAdd, dataToExport }) {
  const handleExport = () => {
    if (!dataToExport || dataToExport.length === 0) return;
    
    const headers = ['Kebele', 'Assessment Date', 'Women in Decision Roles', 'Youth in Agri Enterprises', 'Fuel Stoves', 'Solar Tech', 'Biogas', 'HIV Budget Alloc.', 'Childcare Centers'];
    
    const csvData = dataToExport.map(r => [
      r.kebele?.name || '',
      r.assessment_date,
      r.women_in_decision_making_roles,
      r.youth_in_agri_enterprises,
      r.labor_saving_tech_usage?.fuel_efficient_stoves || 0,
      r.labor_saving_tech_usage?.solar_tech || 0,
      r.labor_saving_tech_usage?.biogas_systems || 0,
      r.social_development?.hiv_aids_budget_allocated ? 'Yes' : 'No',
      r.social_development?.childcare_centers_established || 0
    ]);

    const csvContent = [headers.join(','), ...csvData.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `Empowerment_Data_${new Date().toISOString().slice(0,10)}.csv`);
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
            <Button type="primary" icon={<PlusOutlined />} onClick={onAdd} style={{ background: '#1a5f2c', borderColor: '#1a5f2c' }}>Record Assessment</Button>
          </Space>
        </Col>
      </Row>
    </div>
  );
}