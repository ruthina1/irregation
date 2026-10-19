import React from 'react';
import { Button, Input, Select } from 'antd';
import { DownloadOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import FilterBar from '../../shared/components/FilterBar';

export const DOCUMENT_VOLUMES = [
  'Volume I: Main Engineering & Feasibility Report',
  'Volume II: Hydrology & Water Resource Assessment',
  'Volume III: Geotechnical & Soil Investigation',
  'Volume IV: Hydraulic & Structural Design Calculations',
  'Volume V: Irrigation Agronomy & Command Area Layout',
  'Volume VI: Environmental & Social Impact Assessment (ESIA)',
  'Volume VII: Bill of Quantities (BoQ) & Tender Dossier',
];

export const REVIEW_MILESTONES = [
  'Inception Report Review Gate',
  'Mid-Term Interim Draft Review Gate',
  'Draft Final Engineering Review Gate',
  'Final Tender Dossier & BoQ Validation',
];

export const REVIEW_VERDICTS = [
  { value: 'Approved Without Comments', label: 'Approved (Clear)', color: 'success' },
  { value: 'Approved with Minor Comments', label: 'Approved (Minor Comments)', color: 'default' },
  { value: 'Major Revisions Required', label: 'Major Revisions Required', color: 'warning' },
  { value: 'Rejected / Incomplete', label: 'Rejected', color: 'error' },
  { value: 'Under Review', label: 'Under Review', color: 'processing' },
];

export const DISCIPLINE_CHECKS = [
  { field: 'check_hydrology', key: 'hydrology', label: 'Hydrology & Yield', dossierLabel: 'Hydrology & Yield' },
  { field: 'check_structural', key: 'structural', label: 'Structural Calculations', dossierLabel: 'Structural Design' },
  { field: 'check_geotechnical', key: 'geotechnical', label: 'Geotech & Foundation', dossierLabel: 'Geotechnical' },
  { field: 'check_agronomy', key: 'agronomy', label: 'Agronomy & Layout', dossierLabel: 'Agronomy Layout' },
  { field: 'check_esia', key: 'esia', label: 'ESIA Safeguards', dossierLabel: 'ESIA Safeguards' },
];

export const NEW_REVIEW_DEFAULTS = {
  document_volume: 'Volume IV: Hydraulic & Structural Design Calculations',
  review_milestone: 'Draft Final Engineering Review Gate',
  submission_version: 'Draft Final (v1.0)',
  overall_technical_score: 85,
  review_team_size: 4,
  check_hydrology: true,
  check_structural: true,
  check_geotechnical: true,
  check_agronomy: true,
  check_esia: false,
};

export const scoreColor = (score) => (score >= 80 ? '#1a5f2c' : score >= 65 ? '#a16207' : '#b42318');


export default function DesignDocumentReviewFilters({
  searchTerm, onSearchChange, verdictFilter, onVerdictChange, milestoneFilter, onMilestoneChange,
  volumeFilter, onVolumeChange, onExport, onCreate,
}) {
  return (
    <FilterBar
      filters={(
        <>
          <Input
            placeholder="Search Review, Scheme, Reviewer..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{ width: 250 }}
            allowClear
            aria-label="Search reviews"
          />
          <Select
            placeholder="Evaluation Verdict"
            value={verdictFilter}
            onChange={onVerdictChange}
            style={{ width: 190 }}
            allowClear
            aria-label="Evaluation verdict"
            options={REVIEW_VERDICTS.map((v) => ({ value: v.value, label: v.label }))}
          />
          <Select
            placeholder="Review Milestone Gate"
            value={milestoneFilter}
            onChange={onMilestoneChange}
            style={{ width: 220 }}
            allowClear
            aria-label="Review milestone gate"
            options={REVIEW_MILESTONES.map((m) => ({ value: m, label: m }))}
          />
          <Select
            placeholder="Document Volume"
            value={volumeFilter}
            onChange={onVolumeChange}
            style={{ width: 180 }}
            allowClear
            aria-label="Document volume"
            options={DOCUMENT_VOLUMES.map((v) => ({ value: v, label: v.split(':')[0] }))}
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
            Log Review Session
          </Button>
        </>
      )}
    />
  );
}
