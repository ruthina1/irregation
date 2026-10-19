import { Button, Input, Select } from 'antd';
import { DownloadOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import FilterBar from '../../shared/components/FilterBar';
import { BENEFIT_STATUSES, FUNDING_PROGRAMS, SCHEME_TYPES } from './DevelopedLandBeneficiariesManagement';

export default function BenefitFilters({
  searchTerm, onSearchChange, schemeTypeFilter, onSchemeTypeChange, statusFilter, onStatusChange,
  fundingFilter, onFundingChange, onExport, onCreate,
}) {
  return (
    <FilterBar
      filters={(
        <>
          <Input placeholder="Search Scheme, Code, Crops, Woreda..." prefix={<SearchOutlined />} value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)} style={{ width: 250 }} allowClear />
          <Select placeholder="Scheme Classification" value={schemeTypeFilter} onChange={onSchemeTypeChange} style={{ width: 220 }} allowClear
            options={SCHEME_TYPES.map((t) => ({ value: t.value, label: t.label.split('(')[0] }))} />
          <Select placeholder="Operational Status" value={statusFilter} onChange={onStatusChange} style={{ width: 210 }} allowClear
            options={BENEFIT_STATUSES.map((s) => ({ value: s.value, label: s.label }))} />
          <Select placeholder="Funding Program" value={fundingFilter} onChange={onFundingChange} style={{ width: 220 }} allowClear
            options={FUNDING_PROGRAMS.map((f) => ({ value: f, label: f.split('(')[0] }))} />
        </>
      )}
      actions={(
        <>
          <Button icon={<DownloadOutlined />} onClick={onExport}>Export Ledger</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={onCreate}
            style={{ backgroundColor: '#1a5f2c', borderColor: '#1a5f2c', fontWeight: 600 }}>
            Verify Field Benefits
          </Button>
        </>
      )}
    />
  );
}
