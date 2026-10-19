import { Button, Input, Select } from 'antd';
import { DownloadOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import FilterBar from '../../shared/components/FilterBar';
import { COMMUNITY_TRAINING_MODULES, TARGET_AUDIENCE_GROUPS, TRAINING_STATUSES } from './AssociationCapacityBuildingManagement';

export default function TrainingFilters({
  searchTerm, onSearchChange, moduleFilter, onModuleChange, targetGroupFilter, onTargetGroupChange,
  statusFilter, onStatusChange, onExport, onCreate,
}) {
  return (
    <FilterBar
      filters={(
        <>
          <Input
            placeholder="Search WUA Name, Scheme, Module..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{ width: 250 }}
            allowClear
          />
          <Select
            placeholder="Curriculum Module"
            value={moduleFilter}
            onChange={onModuleChange}
            style={{ width: 230 }}
            allowClear
            options={COMMUNITY_TRAINING_MODULES.map((m) => ({ value: m, label: m.split('(')[0] }))}
          />
          <Select
            placeholder="Target Audience Group"
            value={targetGroupFilter}
            onChange={onTargetGroupChange}
            style={{ width: 220 }}
            allowClear
            options={TARGET_AUDIENCE_GROUPS.map((g) => ({ value: g.value, label: g.label.split('(')[0] }))}
          />
          <Select
            placeholder="Delivery Status"
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
            Log Training Session
          </Button>
        </>
      )}
    />
  );
}
