import React from 'react';
import { Button, Descriptions, Divider, Modal, Tag } from 'antd';
import { CalendarOutlined, EnvironmentOutlined, FileSearchOutlined, LinkOutlined } from '@ant-design/icons';
import { extractName, toNumber } from '../../shared/utils';

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


/** Read-only evaluation dossier of one review session. */
export default function DesignDocumentReviewDetail({ review, onClose, visible, onCancel }) {
  const currentReview = review;
  const handleClose = onClose || onCancel;
  const isOpen = Boolean(visible !== undefined ? visible : review);

  return (
    <Modal
      title={(
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <FileSearchOutlined style={{ color: '#1a5f2c', fontSize: 18 }} />
          <span style={{ fontSize: 16, fontWeight: 'bold', color: '#1a5f2c' }}>
            {currentReview?.scheme_name} - Review Evaluation Dossier
          </span>
        </div>
      )}
      open={isOpen}
      onCancel={handleClose}
      footer={[
        <Button key="close" type="primary" onClick={handleClose} style={{ backgroundColor: '#1a5f2c' }}>
          Close
        </Button>,
      ]}
      width={740}
      destroyOnHidden
    >
      {currentReview && (
        <div style={{ paddingTop: 6 }}>
          <Descriptions bordered size="small" column={2}>
            <Descriptions.Item label="Review Code" span={1}>
              <span style={{ fontFamily: 'monospace' }}>{currentReview.review_code}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Linked Project Ref" span={1}>
              <Tag color="green"><LinkOutlined style={{ marginRight: 4 }} />{currentReview.project_code}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Document Source" span={1}>
              <Tag color="default">{currentReview.document_source?.split('(')[0]}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Submitting Entity" span={1}>
              <strong>{currentReview.submitting_entity}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Review Milestone Gate" span={2}>
              <strong>{currentReview.review_milestone}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Report Volume" span={2}>{currentReview.document_volume}</Descriptions.Item>
            <Descriptions.Item label="Submission Version" span={1}>
              <Tag color="default">{currentReview.submission_version}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Command Area" span={1}>
              <strong style={{ color: '#1a5f2c' }}>{toNumber(currentReview.command_area_ha).toLocaleString()} Ha</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Technical Score" span={1}>
              <strong style={{ fontSize: 14, color: currentReview.overall_technical_score >= 80 ? '#1a5f2c' : '#a16207' }}>
                {currentReview.overall_technical_score}%
              </strong>
            </Descriptions.Item>
            <Descriptions.Item label="Current Verdict" span={1}>
              <Tag color={currentReview.review_verdict?.includes('Approved') ? 'success' : 'error'}>{currentReview.review_verdict}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Review Ethiopian Date" span={1}>
              <CalendarOutlined style={{ marginRight: 6, color: '#1a5f2c' }} />
              {currentReview.review_ethiopian_date || '—'}
            </Descriptions.Item>
            <Descriptions.Item label="Fiscal Year" span={1}>{currentReview.fiscal_year}</Descriptions.Item>
            <Descriptions.Item label="Lead Reviewer" span={1}>{currentReview.lead_reviewer}</Descriptions.Item>
            <Descriptions.Item label="Review Team Size" span={1}>{currentReview.review_team_size} Experts</Descriptions.Item>
            <Descriptions.Item label="Administrative Location" span={2}>
              <EnvironmentOutlined style={{ marginRight: 6, color: '#1a5f2c' }} />
              {[extractName(currentReview.zone), extractName(currentReview.woreda), extractName(currentReview.kebele)].filter(Boolean).join(' > ') || '—'}
            </Descriptions.Item>
          </Descriptions>

          <Divider orientation="left" style={{ margin: '14px 0 10px', fontSize: 13, color: '#1a5f2c' }}>
            Multi-Disciplinary Verification Checklist
          </Divider>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 8 }}>
            {DISCIPLINE_CHECKS.map((c) => {
              const checked = Boolean(currentReview.disciplinary_checklist?.[c.key]);
              return (
                <div key={c.key} style={{ padding: '6px 10px', border: '1px solid #f0f0f0', borderRadius: 4, background: checked ? '#f6ffed' : '#fff1f0', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12 }}>{c.dossierLabel}</span>
                  <Tag color={checked ? 'success' : 'error'}>{checked ? 'Verified' : 'Pending'}</Tag>
                </div>
              );
            })}
          </div>

          {currentReview.technical_remarks && (
            <>
              <Divider orientation="left" style={{ margin: '14px 0 10px', fontSize: 13, color: '#1a5f2c' }}>
                Technical Findings & Verdict Comments
              </Divider>
              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 13, whiteSpace: 'pre-wrap' }}>
                {currentReview.technical_remarks}
              </div>
            </>
          )}
        </div>
      )}
    </Modal>
  );
}
