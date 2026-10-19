import { Button, Input, Select } from 'antd';
import { DownloadOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import FilterBar from '../../shared/components/FilterBar';
import { QA_DOMAINS, QA_STATUSES } from './DesignQualityAssuranceManagement';

export default function DesignQualityAssuranceFilters({
  searchTerm, onSearchChange, statusFilter, onStatusChange, domainFilter, onDomainChange,
  zoneFilter, onZoneChange, zoneOptions, onExport, onCreate,
}) {
  return (
    <FilterBar
      filters={(
        <>
          <Input
            placeholder="Search Cert #, Scheme, Auditor..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{ width: 250 }}
            allowClear
          />
          <Select
            placeholder="QA Certification Status"
            value={statusFilter}
            onChange={onStatusChange}
            style={{ width: 210 }}
            allowClear
            options={QA_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
          />
          <Select
            placeholder="QA Audit Focus Domain"
            value={domainFilter}
            onChange={onDomainChange}
            style={{ width: 230 }}
            allowClear
            options={QA_DOMAINS.map((d) => ({ value: d, label: d }))}
          />
          <Select
            placeholder="Zone"
            value={zoneFilter}
            onChange={onZoneChange}
            style={{ width: 150 }}
            allowClear
            options={zoneOptions.map((z) => ({ value: z, label: z }))}
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
            Register QA Audit
          </Button>
        </>
      )}
    />
  );
}
