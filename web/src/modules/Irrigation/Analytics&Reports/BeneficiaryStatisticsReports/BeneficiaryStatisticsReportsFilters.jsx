import { Button, Input, Select } from 'antd';
import { DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import FilterBar from '../../shared/components/FilterBar';

export default function BeneficiaryFilterBar({
  searchTerm, onSearchChange, zoneFilter, onZoneChange, zoneOptions, onExport,
}) {
  return (
    <FilterBar
      filters={(
        <>
          <Input
            placeholder="Search Administrative Zone..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{ width: 250 }}
            allowClear
          />
          <Select
            placeholder="Zone Filter"
            value={zoneFilter}
            onChange={(v) => onZoneChange(v ?? null)}
            style={{ width: 180 }}
            allowClear
            options={zoneOptions}
          />
        </>
      )}
      actions={<Button icon={<DownloadOutlined />} onClick={onExport}>Export Demographics</Button>}
    />
  );
}
