import { Button, Input, Select } from 'antd';
import { DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import FilterBar from '../../shared/components/FilterBar';
import { FINANCING_CHANNELS, SHELF_STATUSES } from './ConstructionReadyDesignsManagement';

export default function ConstructionReadyDesignsFilters({ searchTerm, onSearchChange, statusFilter, onStatusChange, fundingFilter, onFundingChange, onExport }) {
  return (
    <FilterBar
      filters={(
        <>
          <Input placeholder="Search Shelf Code, Scheme Name, Zone..." prefix={<SearchOutlined />} value={searchTerm} onChange={(e) => onSearchChange(e.target.value)} style={{ width: 250 }} allowClear />
          <Select placeholder="Procurement Readiness" value={statusFilter} onChange={onStatusChange} style={{ width: 210 }} allowClear options={SHELF_STATUSES.map((s) => ({ value: s.value, label: s.label }))} />
          <Select placeholder="Funding Program" value={fundingFilter} onChange={onFundingChange} style={{ width: 230 }} allowClear options={FINANCING_CHANNELS.map((f) => ({ value: f, label: f.split('(')[0] }))} />
        </>
      )}
      actions={<Button icon={<DownloadOutlined />} onClick={onExport}>Export Project Bank</Button>}
    />
  );
}
