import React from 'react';
import { Row, Col, Input, Button, Space } from 'antd';
import { PlusOutlined, DownloadOutlined } from '@ant-design/icons';

export default function LandUseFilters({ onSearch, onAdd, dataToExport }) {
  const handleCSVExport = () => {
    const headers = ['Zone,Woreda,Year,Forest_Ha,Grazing_Ha,Wetland_Swamp_Ha,Barren_Wasteland_Ha,Total_Ha\n'];
    const rows = dataToExport.map(r => {
      const total = Number(r.forest_ha || 0) + Number(r.grazing_ha || 0) + Number(r.wetland_swamp_ha || 0) + Number(r.barren_wasteland_ha || 0);
      return `"${r.woreda?.zone?.name || ''}","${r.woreda?.name || ''}",${r.year},${r.forest_ha},${r.grazing_ha},${r.wetland_swamp_ha},${r.barren_wasteland_ha},${total}`;
    });
    
    const blob = new Blob([headers.concat(rows.join('\n'))], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `land_use_classifications_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Row gutter={16} justify="space-between" align="middle" style={{ marginBottom: 16 }}>
      <Col span={12}>
        <Input.Search
          placeholder="Search items by year..."
          onChange={(e) => onSearch(e.target.value)}
          allowClear
          style={{ width: 280 }}
        />
      </Col>
      <Col span={12} style={{ textAlign: 'right' }}>
        <Space>
          <Button icon={<DownloadOutlined />} onClick={handleCSVExport}>Export CSV</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={onAdd} style={{ backgroundColor: '#1a5f2c', borderColor: '#1a5f2c' }}>
            Add Entry
          </Button>
        </Space>
      </Col>
    </Row>
  );
}