import { Button, Input, Select } from 'antd';
import { DownloadOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import FilterBar from '../../shared/components/FilterBar';
import { WHEAT_ROUNDS, WHEAT_STATUSES, WHEAT_VARIETIES } from './HighlandIrrigatedWheatManagement';

export default function WheatFilters({
  searchTerm, onSearchChange, roundFilter, onRoundChange, varietyFilter, onVarietyChange,
  statusFilter, onStatusChange, onExport, onCreate,
}) {
  return (
    <FilterBar
      filters={(
        <>
          <Input
            placeholder="Search Scheme, Variety, Cluster, Woreda..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{ width: 250 }}
            allowClear
          />
          <Select
            placeholder="Cropping Round"
            value={roundFilter}
            onChange={onRoundChange}
            style={{ width: 190 }}
            allowClear
            options={WHEAT_ROUNDS.map((r) => ({ value: r.value, label: r.value }))}
          />
          <Select
            placeholder="Seed Variety"
            value={varietyFilter}
            onChange={onVarietyChange}
            style={{ width: 200 }}
            allowClear
            options={WHEAT_VARIETIES.map((v) => ({ value: v, label: v }))}
          />
          <Select
            placeholder="Harvest Status"
            value={statusFilter}
            onChange={onStatusChange}
            style={{ width: 190 }}
            allowClear
            options={WHEAT_STATUSES.map((s) => ({ value: s.value, label: s.label.split('(')[0] }))}
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
            Register Wheat Cluster
          </Button>
        </>
      )}
    />
  );
}
