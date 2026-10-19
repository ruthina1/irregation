import { Button, Input, Select } from 'antd';
import { DownloadOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import FilterBar from '../../shared/components/FilterBar';
import { PROGRESS_HEALTH_STATUSES, SCHEME_TYPES } from './ConstructionProgressPerformanceManagement';

/** Search, classification / health filters, export and "Log Site Inspection". */
export default function ProgressFilters({
  searchTerm, onSearchChange, schemeType, onSchemeTypeChange, health, onHealthChange, onExport, onCreate,
}) {
  return (
    <FilterBar
      filters={(
        <>
          <Input
            placeholder="Search Log Code, Scheme, Contract..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{ width: 250 }}
            allowClear
          />
          <Select
            placeholder="Scheme Classification"
            value={schemeType}
            onChange={onSchemeTypeChange}
            style={{ width: 220 }}
            allowClear
            options={SCHEME_TYPES.map((t) => ({ value: t.value, label: t.label.split('(')[0].trim() }))}
          />
          <Select
            placeholder="Schedule Health"
            value={health}
            onChange={onHealthChange}
            style={{ width: 190 }}
            allowClear
            options={PROGRESS_HEALTH_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
          />
        </>
      )}
      actions={(
        <>
          <Button icon={<DownloadOutlined />} onClick={onExport}>Export Progress</Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onCreate}
            style={{ backgroundColor: '#1a5f2c', borderColor: '#1a5f2c', fontWeight: 600 }}
          >
            Log Site Inspection
          </Button>
        </>
      )}
    />
  );
}
