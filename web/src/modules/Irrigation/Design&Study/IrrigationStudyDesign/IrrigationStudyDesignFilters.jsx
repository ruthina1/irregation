import { Button, Input, Select } from 'antd';
import { DownloadOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import FilterBar from '../../shared/components/FilterBar';
import { QA_STATUSES, STUDY_MODALITIES, STUDY_STAGES } from './IrrigationStudyDesignManagement';

/** Search, modality / stage / QA filters, export and register actions. */
export default function IrrigationStudyDesignFilters({
  searchTerm, onSearchChange, modalityFilter, onModalityChange, stageFilter, onStageChange,
  qaStatusFilter, onQaStatusChange, onExport, onCreate,
}) {
  return (
    <FilterBar
      filters={(
        <>
          <Input
            placeholder="Search Project Code, Scheme, Lead..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{ width: 250 }}
            allowClear
            aria-label="Search study projects"
          />
          <Select
            placeholder="Study Modality"
            value={modalityFilter}
            onChange={onModalityChange}
            style={{ width: 220 }}
            allowClear
            aria-label="Study modality filter"
            options={STUDY_MODALITIES}
          />
          <Select
            placeholder="Study Stage"
            value={stageFilter}
            onChange={onStageChange}
            style={{ width: 200 }}
            allowClear
            aria-label="Study stage filter"
            options={STUDY_STAGES.map((s) => ({ value: s, label: s }))}
          />
          <Select
            placeholder="QA Status"
            value={qaStatusFilter}
            onChange={onQaStatusChange}
            style={{ width: 170 }}
            allowClear
            popupMatchSelectWidth={false}
            aria-label="QA status filter"
            options={QA_STATUSES.map((q) => ({ value: q, label: q }))}
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
            Register Study Project
          </Button>
        </>
      )}
    />
  );
}
