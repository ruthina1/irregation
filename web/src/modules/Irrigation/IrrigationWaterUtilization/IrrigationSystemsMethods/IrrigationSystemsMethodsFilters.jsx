import { Button, Input, Select } from 'antd';
import { DownloadOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import FilterBar from '../../shared/components/FilterBar';
import { TECHNOLOGY_STATUSES } from './IrrigationSystemsMethodsManagement';

export default function WaterSourceFilters({ searchTerm, onSearchChange, statusFilter, onStatusChange, onExport, onCreate }) {
  return (
    <FilterBar
      filters={(
        <>
          <Input
            placeholder="Search Scheme, WUA, Technology, Location..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{ width: 260 }}
            allowClear
          />
          <Select
            placeholder="Operational Status"
            value={statusFilter}
            onChange={onStatusChange}
            style={{ width: 220 }}
            allowClear
            options={TECHNOLOGY_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
          />
        </>
      )}
      actions={(
        <>
          <Button icon={<DownloadOutlined />} onClick={onExport}>Export Ledger</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={onCreate} style={{ backgroundColor: '#1a5f2c', borderColor: '#1a5f2c', fontWeight: 600 }}>
            Log Water Source / Tech
          </Button>
        </>
      )}
    />
  );
}
