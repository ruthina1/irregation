import React from 'react';
import { Row, Col, Input, Select, Button, Space } from 'antd';
import { SearchOutlined, PlusOutlined, DownloadOutlined } from '@ant-design/icons';

const { Option } = Select;

export default function TrainingFilters({ onSearch, onFilterType, onAdd, dataToExport }) {
  
  const handleExport = () => {
    if (!dataToExport || dataToExport.length === 0) return;
    
    const headers = [
      'Event Topic', 'Event Type', 'Kebele', 'Woreda', 'Zone', 
      'Date Conducted', 'Demonstrated Tech', 
      'Male Participants', 'Female Participants', 'Youth Participants', 'Total Participants'
    ];

    const csvData = dataToExport.map(row => [
      `"${row.topic || ''}"`,
      row.event_type || '',
      row.kebele?.name || '',
      row.kebele?.woreda?.name || '',
      row.kebele?.woreda?.zone?.name || '',
      row.date_conducted || '',
      `"${row.demonstrated_technology || ''}"`,
      row.male_participants || 0,
      row.female_participants || 0,
      row.youth_participants || 0,
      row.total_participants || 0
    ]);

    const csvContent = [headers.join(','), ...csvData.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `Training_Events_Export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ padding: '16px', background: '#fff', borderRadius: '8px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <Row gutter={[16, 16]} justify="space-between" align="middle">
        <Col xs={24} md={12}>
          <Space size="middle" style={{ width: '100%' }}>
            <Input 
              placeholder="Search by topic or tech..." 
              allowClear 
              prefix={<SearchOutlined />} 
              onChange={(e) => onSearch(e.target.value)}
              style={{ minWidth: '250px' }}
            />
            <Select placeholder="Filter by Type" allowClear onChange={onFilterType} style={{ minWidth: '180px' }}>
              <Option value="Training">Training</Option>
              <Option value="Field Day">Field Day</Option>
              <Option value="Video Dissemination">Video Dissemination</Option>
              <Option value="Workshop">Workshop</Option>
            </Select>
          </Space>
        </Col>
        
        <Col xs={24} md={12} style={{ textAlign: 'right' }}>
          <Space>
            <Button onClick={handleExport} icon={<DownloadOutlined />}>
              Export Data
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={onAdd} style={{ background: '#1a5f2c', borderColor: '#1a5f2c' }}>
              Record Event
            </Button>
          </Space>
        </Col>
      </Row>
    </div>
  );
}