import { Button, Input, Select } from 'antd';
import { DownloadOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import FilterBar from '../../shared/components/FilterBar';
import { CROP_CATEGORIES, CROPPING_ROUNDS, HARVEST_STATUSES } from './SeasonalCropProductionYieldManagement';

export default function SeasonalFilters({
  searchTerm, onSearchChange, roundFilter, onRoundChange, categoryFilter, onCategoryChange,
  statusFilter, onStatusChange, onExport, onCreate,
}) {
  return (
    <FilterBar
      filters={(
        <>
          <Input
            placeholder="Search Scheme, Crop, Category, Location..."
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
            options={CROPPING_ROUNDS.map((r) => ({ value: r.value, label: r.value }))}
          />
          <Select
            placeholder="Crop Category"
            value={categoryFilter}
            onChange={onCategoryChange}
            style={{ width: 220 }}
            allowClear
            options={CROP_CATEGORIES.map((c) => ({ value: c.value, label: c.label.split('(')[0] }))}
          />
          <Select
            placeholder="Harvest Status"
            value={statusFilter}
            onChange={onStatusChange}
            style={{ width: 180 }}
            allowClear
            options={HARVEST_STATUSES.map((s) => ({ value: s.value, label: s.label.split('(')[0] }))}
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
            Log Crop Harvest
          </Button>
        </>
      )}
    />
  );
}
