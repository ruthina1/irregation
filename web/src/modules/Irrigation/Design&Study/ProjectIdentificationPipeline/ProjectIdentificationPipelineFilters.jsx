import { Button, Input, Select } from 'antd';
import { DownloadOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import FilterBar from '../../shared/components/FilterBar';
import { PIPELINE_STATUSES, PRIORITY_LEVELS, WATER_SOURCES } from './ProjectIdentificationPipelineManagement';

const toOptions = (values) => values.map((v) => ({ value: v, label: v }));

/** Search, status / priority / water-source filters, export and "Identify New Scheme". */
export default function ProjectIdentificationPipelineFilters({
  searchTerm, onSearchChange, statusFilter, onStatusChange, priorityFilter, onPriorityChange,
  waterSourceFilter, onWaterSourceChange, onExport, onCreate,
}) {
  return (
    <FilterBar
      filters={(
        <>
          <Input
            placeholder="Search Scheme Name, Code, Location..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{ width: 250 }}
            allowClear
            aria-label="Search pipeline"
          />
          <Select
            placeholder="Pipeline Status"
            value={statusFilter}
            onChange={onStatusChange}
            style={{ width: 220 }}
            allowClear
            aria-label="Pipeline status filter"
            options={toOptions(PIPELINE_STATUSES)}
          />
          <Select
            placeholder="Priority"
            value={priorityFilter}
            onChange={onPriorityChange}
            style={{ width: 140 }}
            allowClear
            aria-label="Priority filter"
            options={toOptions(PRIORITY_LEVELS)}
          />
          <Select
            placeholder="Water Source"
            value={waterSourceFilter}
            onChange={onWaterSourceChange}
            style={{ width: 200 }}
            allowClear
            aria-label="Water source filter"
            options={toOptions(WATER_SOURCES)}
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
            Identify New Scheme
          </Button>
        </>
      )}
    />
  );
}
