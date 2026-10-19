import { Button, Input, Select } from 'antd';
import { DownloadOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import FilterBar from '../../shared/components/FilterBar';
import { CROPPING_ROUNDS, INPUT_NAME_OPTIONS, IRRIGATION_SEASONS } from './AgriculturalInputUtilizationManagement';

export default function AgriculturalInputUtilizationFilters({
  searchTerm, onSearchChange, nameFilter, onNameChange, seasonFilter, onSeasonChange,
  roundFilter, onRoundChange, onExport, onCreate,
}) {
  return (
    <FilterBar
      filters={(
        <>
          <Input
            placeholder="Search Item, Code, Specification, Kebele..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{ width: 240 }}
            allowClear
          />
          <Select
            placeholder="Filter Input"
            value={nameFilter}
            onChange={onNameChange}
            style={{ width: 170 }}
            allowClear
            options={INPUT_NAME_OPTIONS.map((c) => ({ value: c.value, label: c.label }))}
          />
          <Select
            placeholder="Irrigation Season"
            value={seasonFilter}
            onChange={onSeasonChange}
            style={{ width: 190 }}
            allowClear
            options={IRRIGATION_SEASONS}
          />
          <Select
            placeholder="Cropping Round"
            value={roundFilter}
            onChange={onRoundChange}
            style={{ width: 160 }}
            allowClear
            options={CROPPING_ROUNDS.map((r) => ({ value: r, label: r }))}
          />
        </>
      )}
      actions={(
        <>
          <Button icon={<DownloadOutlined />} onClick={onExport}>Export CSV</Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onCreate}
            style={{ backgroundColor: '#1a5f2c', borderColor: '#1a5f2c', fontWeight: 600 }}
          >
            New Allocation
          </Button>
        </>
      )}
    />
  );
}
