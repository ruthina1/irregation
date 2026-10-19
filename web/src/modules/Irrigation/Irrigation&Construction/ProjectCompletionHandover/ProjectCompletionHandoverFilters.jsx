import { Button, Input, Select } from 'antd';
import { DownloadOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import FilterBar from '../../shared/components/FilterBar';
import { STATUS_FILTER_OPTIONS } from './ProjectCompletionHandoverManagement';

export default function HandoverFilters({ searchTerm, onSearchChange, statusFilter, onStatusChange, onExport, onCreate }) {
  return (
    <FilterBar
      filters={(
        <>
          <Input
            placeholder="Search Certificate #, Scheme, WUA..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{ width: 240 }}
            allowClear
          />
          <Select
            placeholder="Protocol Status Filter"
            value={statusFilter}
            onChange={onStatusChange}
            style={{ width: 250 }}
            options={STATUS_FILTER_OPTIONS}
            aria-label="Protocol status filter"
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
            Log WUA Handover
          </Button>
        </>
      )}
    />
  );
}
