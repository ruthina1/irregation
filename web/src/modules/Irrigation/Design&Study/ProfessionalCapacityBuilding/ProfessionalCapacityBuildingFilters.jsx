import { Button, Input, Select } from 'antd';
import { DownloadOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import FilterBar from '../../shared/components/FilterBar';
import { TARGET_AUDIENCE_TIERS, TRAINING_DISCIPLINES, TRAINING_STATUSES } from './ProfessionalCapacityBuildingManagement';

export default function ProfessionalCapacityBuildingFilters({
  searchTerm, onSearchChange, disciplineFilter, onDisciplineChange, tierFilter, onTierChange,
  statusFilter, onStatusChange, onExport, onCreate,
}) {
  return (
    <FilterBar
      filters={(
        <>
          <Input
            placeholder="Search Title, Code, Trainer, Venue..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{ width: 250 }}
            allowClear
          />
          <Select
            placeholder="Filter Discipline"
            value={disciplineFilter}
            onChange={onDisciplineChange}
            style={{ width: 220 }}
            allowClear
            options={TRAINING_DISCIPLINES.map((d) => ({ value: d, label: d }))}
          />
          <Select
            placeholder="Filter Target Tier"
            value={tierFilter}
            onChange={onTierChange}
            style={{ width: 200 }}
            allowClear
            options={TARGET_AUDIENCE_TIERS.map((t) => ({ value: t, label: t }))}
          />
          <Select
            placeholder="Course Status"
            value={statusFilter}
            onChange={onStatusChange}
            style={{ width: 160 }}
            allowClear
            options={TRAINING_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
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
            Register Course
          </Button>
        </>
      )}
    />
  );
}
