import { Button, Input, Select } from 'antd';
import { DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import FilterBar from '../../shared/components/FilterBar';
import { CROP_CATEGORIES, CROPPING_ROUNDS } from './CropProductionOverviewManagement';

export default function ProductionFilters({
  searchTerm, onSearchChange, roundFilter, onRoundChange, categoryFilter, onCategoryChange, onExport,
}) {
  return (
    <FilterBar
      filters={(
        <>
          <Input
            placeholder="Search Scheme, Code, Crop, Location..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{ width: 250 }}
            allowClear
          />
          <Select
            placeholder="Cropping Season"
            value={roundFilter}
            onChange={onRoundChange}
            style={{ width: 190 }}
            allowClear
            options={CROPPING_ROUNDS.map((r) => ({ value: r, label: r }))}
          />
          <Select
            placeholder="Crop Category"
            value={categoryFilter}
            onChange={onCategoryChange}
            style={{ width: 200 }}
            allowClear
            options={CROP_CATEGORIES.map((c) => ({ value: c, label: c.split('(')[0] }))}
          />
        </>
      )}
      actions={<Button icon={<DownloadOutlined />} onClick={onExport}>Export Overview</Button>}
    />
  );
}
