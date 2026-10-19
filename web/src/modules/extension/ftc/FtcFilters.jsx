import React from 'react';
import { Input, Select, Button, Space } from 'antd';
import { SearchOutlined, DownloadOutlined, PlusOutlined } from '@ant-design/icons';
import { exportToCSV } from '../../../utils/exportUtils';

const { Option } = Select;

export default function FtcFilters({ onSearch, onFilterLevel, onAdd, rawData }) {
  
  const handleExport = () => {
    // Flatten data for a cleaner Excel export
    const exportData = rawData.map(ftc => ({
      ID: ftc.id,
      FTC_Name: ftc.ftc_name,
      Kebele_ID: ftc.kebele_id,
      Capacity: ftc.capacity_level,
      Status: ftc.construction_status,
      Demo_Land_Ha: ftc.demo_land_ha,
      Audit_Status: ftc.audit_status,
      Assets_Count: ftc.assets?.length || 0,
      Committee_Count: ftc.committees?.length || 0
    }));
    exportToCSV(exportData, 'FTC_Registry_Export.csv');
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 16 }}>
      <Space>
        <Input 
          placeholder="Search by FTC Name..." 
          prefix={<SearchOutlined />} 
          onChange={(e) => onSearch(e.target.value)}
          style={{ width: 250 }}
          allowClear
        />
        <Select 
          placeholder="Filter by Capacity" 
          onChange={onFilterLevel} 
          style={{ width: 180 }} 
          allowClear
        >
          <Option value="Advanced">Advanced</Option>
          <Option value="Intermediate">Intermediate</Option>
          <Option value="Basic">Basic</Option>
          <Option value="Below Standard">Below Standard</Option>
        </Select>
      </Space>

      <Space>
        <Button icon={<DownloadOutlined />} onClick={handleExport}>
          Export Excel
        </Button>
        <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
          Register FTC
        </Button>
      </Space>
    </div>
  );
}