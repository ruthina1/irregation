import { Button, Input, Select } from 'antd';
import { DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import FilterBar from '../../shared/components/FilterBar';
import { AUDIT_VERDICTS, GOVERNANCE_GRADES } from './AssociationStrengtheningAuditManagement';

/** No "create" action: the server opens one audit per registered WUA. */
export default function AuditFilters({ searchTerm, onSearchChange, verdictFilter, onVerdictChange, gradeFilter, onGradeChange, onExport }) {
  return (
    <FilterBar
      filters={(
        <>
          <Input placeholder="Search WUA, Audit Code, Auditor..." prefix={<SearchOutlined />} value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)} style={{ width: 250 }} allowClear />
          <Select placeholder="Audit Opinion Verdict" value={verdictFilter} onChange={onVerdictChange} style={{ width: 220 }} allowClear
            options={AUDIT_VERDICTS.map((v) => ({ value: v.value, label: v.label.split('(')[0] }))} />
          <Select placeholder="Governance Grade" value={gradeFilter} onChange={onGradeChange} style={{ width: 210 }} allowClear
            options={GOVERNANCE_GRADES.map((g) => ({ value: g.value, label: g.label.split('(')[0] }))} />
        </>
      )}
      actions={<Button icon={<DownloadOutlined />} onClick={onExport}>Export Ledger</Button>}
    />
  );
}
