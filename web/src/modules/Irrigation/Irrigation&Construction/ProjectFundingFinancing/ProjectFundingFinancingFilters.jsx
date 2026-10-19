import { Button, Input, Select } from 'antd';
import { DownloadOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import FilterBar from '../../shared/components/FilterBar';
import { ALLOCATION_STATUSES, FINANCING_PROGRAMS } from './ProjectFundingFinancingManagement';

export default function FundingFilters({
  searchTerm, onSearchChange, programFilter, onProgramChange, statusFilter, onStatusChange, onExport, onCreate,
}) {
  return (
    <FilterBar
      filters={(
        <>
          <Input placeholder="Search Fund Code, Scheme, Contract..." prefix={<SearchOutlined />} value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)} style={{ width: 250 }} allowClear />
          <Select placeholder="Funding Program" value={programFilter} onChange={onProgramChange} style={{ width: 230 }} allowClear
            options={FINANCING_PROGRAMS.map((p) => ({ value: p.value, label: p.label.split('(')[0] }))} />
          <Select placeholder="Disbursement Status" value={statusFilter} onChange={onStatusChange} style={{ width: 200 }} allowClear
            options={ALLOCATION_STATUSES.map((s) => ({ value: s.value, label: s.label }))} />
        </>
      )}
      actions={(
        <>
          <Button icon={<DownloadOutlined />} onClick={onExport}>Export Ledger</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={onCreate}
            style={{ backgroundColor: '#1a5f2c', borderColor: '#1a5f2c', fontWeight: 600 }}>
            Register Allocation
          </Button>
        </>
      )}
    />
  );
}
