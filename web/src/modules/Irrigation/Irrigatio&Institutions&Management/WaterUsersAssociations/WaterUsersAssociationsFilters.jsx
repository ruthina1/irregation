import { Button, Input, Select } from 'antd';
import { DownloadOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import FilterBar from '../../shared/components/FilterBar';
import { ASSOCIATION_TYPES, GOVERNANCE_STATUSES } from './WaterUsersAssociationsManagement';

export default function WuaFilters({
  searchTerm, onSearchChange, typeFilter, onTypeChange, statusFilter, onStatusChange, onExport, onCreate,
}) {
  return (
    <FilterBar
      filters={(
        <>
          <Input
            placeholder="Search WUA Name, Code, Scheme, Chair..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{ width: 260 }}
            allowClear
          />
          <Select
            placeholder="Establishment Category"
            value={typeFilter}
            onChange={onTypeChange}
            style={{ width: 230 }}
            allowClear
            options={ASSOCIATION_TYPES.map((t) => ({ value: t.value, label: t.label.split('(')[0] }))}
          />
          <Select
            placeholder="Governance Status"
            value={statusFilter}
            onChange={onStatusChange}
            style={{ width: 210 }}
            allowClear
            options={GOVERNANCE_STATUSES.map((s) => ({ value: s.value, label: s.label.split('(')[0] }))}
          />
        </>
      )}
      actions={(
        <>
          <Button icon={<DownloadOutlined />} onClick={onExport}>Export Registry</Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onCreate}
            style={{ backgroundColor: '#1a5f2c', borderColor: '#1a5f2c', fontWeight: 600 }}
          >
            Register Association
          </Button>
        </>
      )}
    />
  );
}
