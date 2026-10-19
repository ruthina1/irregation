import { Button, Input, Select } from 'antd';
import { DownloadOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import FilterBar from '../../shared/components/FilterBar';
import { CANAL_NETWORK_TYPES, OPERATION_STATUSES } from './SchemeMaintenanceCleaningManagement';

export default function MaintenanceFilters({
  searchTerm, onSearchChange, canalTypeFilter, onCanalTypeChange, statusFilter, onStatusChange, onExport, onCreate,
}) {
  return (
    <FilterBar
      filters={(
        <>
          <Input
            placeholder="Search Scheme, WUA, Intervention..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{ width: 250 }}
            allowClear
          />
          <Select
            placeholder="Canal Classification"
            value={canalTypeFilter}
            onChange={onCanalTypeChange}
            style={{ width: 230 }}
            allowClear
            options={CANAL_NETWORK_TYPES.map((c) => ({ value: c.value, label: c.label.split('(')[0] }))}
          />
          <Select
            placeholder="Activity Status"
            value={statusFilter}
            onChange={onStatusChange}
            style={{ width: 180 }}
            allowClear
            options={OPERATION_STATUSES.map((s) => ({ value: s.value, label: s.label.split('(')[0] }))}
          />
        </>
      )}
      actions={(
        <>
          <Button icon={<DownloadOutlined />} onClick={onExport}>Export Ledger</Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onCreate}
            style={{ backgroundColor: '#1a5f2c', borderColor: '#1a5f2c', fontWeight: 600 }}
          >
            Log Maintenance / Cleaning
          </Button>
        </>
      )}
    />
  );
}
