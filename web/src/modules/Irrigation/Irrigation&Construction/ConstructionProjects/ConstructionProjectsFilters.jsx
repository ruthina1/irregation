import { Button, Input, Select } from 'antd';
import { DownloadOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import FilterBar from '../../shared/components/FilterBar';
import { CONSTRUCTION_STATUSES, FUNDING_PROGRAMS, SCHEME_TYPES } from './ConstructionProjectsManagement';

export default function ProjectFilters({
  searchTerm, onSearchChange, schemeTypeFilter, onSchemeTypeChange, fundingFilter, onFundingChange,
  statusFilter, onStatusChange, onExport, onCreate,
}) {
  return (
    <FilterBar
      filters={(
        <>
          <Input
            placeholder="Search Contract, Scheme, Contractor..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{ width: 250 }}
            allowClear
          />
          <Select
            placeholder="Scheme Classification"
            value={schemeTypeFilter}
            onChange={onSchemeTypeChange}
            style={{ width: 220 }}
            allowClear
            options={SCHEME_TYPES.map((t) => ({ value: t.value, label: t.label.split('(')[0] }))}
          />
          <Select
            placeholder="Funding Program"
            value={fundingFilter}
            onChange={onFundingChange}
            style={{ width: 220 }}
            allowClear
            options={FUNDING_PROGRAMS.map((f) => ({ value: f, label: f.split('(')[0] }))}
          />
          <Select
            placeholder="Construction Status"
            value={statusFilter}
            onChange={onStatusChange}
            style={{ width: 170 }}
            allowClear
            options={CONSTRUCTION_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
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
            Register Contract
          </Button>
        </>
      )}
    />
  );
}
