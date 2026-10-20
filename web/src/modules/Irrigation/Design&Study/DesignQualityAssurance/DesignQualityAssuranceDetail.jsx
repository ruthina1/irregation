import React from 'react';
import { Button, Descriptions, Divider, Modal, Spin, Tag } from 'antd';
import { CalendarOutlined, EnvironmentOutlined, FileSearchOutlined, LinkOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { extractName, toNumber } from '../../shared/utils';
import { QA_CERTIFIED, QA_CHECKS, REVIEW_CHECKS } from './DesignQualityAssuranceManagement';

/** Prerequisite design document review, fetched by code from the document-review resource. */
export function LinkedReviewModal({ state = {}, onClose }) {
  const { open = false, loading = false, review = null, code = null } = state || {};

  return (
    <Modal
      title={(
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <FileSearchOutlined style={{ color: '#5b8a6b', fontSize: 18 }} />
          <span style={{ fontSize: 16, fontWeight: 'bold', color: '#5b8a6b' }}>
            Prerequisite Document Review: {review?.scheme_name || code}
          </span>
        </div>
      )}
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="close" type="primary" onClick={onClose} style={{ backgroundColor: '#5b8a6b' }}>Done</Button>,
      ]}
      width={750}
      destroyOnHidden
    >
      {loading && <div style={{ textAlign: 'center', padding: 32 }}><Spin /></div>}
      {review && (
        <div style={{ paddingTop: 6 }}>
          <Descriptions bordered size="small" column={2}>
            <Descriptions.Item label="Review Code" span={1}>
              <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{review.review_code}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Parent Project Code" span={1}>
              <Tag color="green">{review.project_code}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Document Source Entity" span={1}>
              <Tag color="default">{review.document_source?.split('(')[0]}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Submitting Entity" span={1}>
              <strong>{review.submitting_entity}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Review Milestone Gate" span={2}>
              <strong>{review.review_milestone}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Report Volume" span={2}>{review.document_volume}</Descriptions.Item>
            <Descriptions.Item label="Submission Version" span={1}>
              <Tag color="default">{review.submission_version}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Command Area" span={1}>
              <strong>{toNumber(review.command_area_ha).toLocaleString()} Hectares</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Overall Evaluation Score" span={1}>
              <strong style={{ fontSize: 14, color: review.overall_technical_score >= 80 ? '#1a5f2c' : '#a16207' }}>
                {toNumber(review.overall_technical_score)}%
              </strong>
            </Descriptions.Item>
            <Descriptions.Item label="Review Committee Verdict" span={1}>
              <Tag color={review.review_verdict?.includes('Approved') ? 'success' : 'error'}>{review.review_verdict}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Lead Reviewer" span={1}>
              {review.lead_reviewer}
              {review.review_team_size ? ` (Committee: ${review.review_team_size} Engineers)` : ''}
            </Descriptions.Item>
            <Descriptions.Item label="Review Session Date" span={1}>
              <span><CalendarOutlined style={{ marginRight: 6, color: '#5b8a6b' }} />{review.review_ethiopian_date}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Administrative Station" span={2}>
              <EnvironmentOutlined style={{ color: '#5b8a6b', marginRight: 4 }} />
              {extractName(review.kebele)} &gt; {extractName(review.woreda)} &gt; {extractName(review.zone)}
            </Descriptions.Item>
            <Descriptions.Item label="Technical Review Findings & Comments" span={2}>
              <div style={{ color: '#595959', fontSize: 12, fontStyle: 'italic' }}>
                {review.technical_remarks || 'No technical remarks recorded.'}
              </div>
            </Descriptions.Item>
          </Descriptions>

          <Divider titlePlacement="start" style={{ margin: '16px 0 10px', fontSize: 13, color: '#5b8a6b' }}>
            Disciplinary Verification Checklist Sign-Off
          </Divider>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {REVIEW_CHECKS.map((c) => {
              const verified = Boolean(review.disciplinary_checklist?.[c.key]);
              return (
                <Tag key={c.key} color={verified ? 'success' : 'default'}>
                  {c.label}: {verified ? 'Verified' : 'Pending'}
                </Tag>
              );
            })}
          </div>
        </div>
      )}
    </Modal>
  );
}


/** Full QA certification dossier of one audit. */
export default function DesignQualityAssuranceDetail({ audit, onClose, onOpenReview }) {
  return (
    <Modal
      title={(
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <SafetyCertificateOutlined style={{ color: '#1a5f2c', fontSize: 18 }} />
          <span style={{ fontSize: 16, fontWeight: 'bold', color: '#1a5f2c' }}>
            {audit?.scheme_name} - Quality Assurance Certification Dossier
          </span>
        </div>
      )}
      open={Boolean(audit)}
      onCancel={onClose}
      footer={[
        <Button key="close" type="primary" onClick={onClose} style={{ backgroundColor: '#1a5f2c' }}>Close</Button>,
      ]}
      width={740}
      destroyOnHidden
    >
      {audit && (
        <div style={{ paddingTop: 6 }}>
          <Descriptions bordered size="small" column={2}>
            <Descriptions.Item label="QA Certificate No" span={1}>
              <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1a5f2c' }}>{audit.qa_certificate_no}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Linked Project Code" span={1}>
              <Tag color="green"><LinkOutlined style={{ marginRight: 4 }} />{audit.project_code}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Linked Document Review" span={1}>
              <Tag color={audit.review_cleared ? 'success' : 'warning'}>
                {audit.review_verdict_snapshot} ({toNumber(audit.review_score_snapshot)}%)
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Review Reference" span={1}>
              <Button
                type="link"
                size="small"
                icon={<FileSearchOutlined />}
                style={{ padding: 0 }}
                onClick={() => onOpenReview(audit.linked_review_code)}
              >
                View Review Details ({audit.linked_review_code})
              </Button>
            </Descriptions.Item>
            <Descriptions.Item label="Study Modality" span={2}>
              <Tag color="default">{audit.study_modality}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="QA Audit Scope" span={2}>
              <strong>{audit.qa_domain}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Approved Command Area" span={1}>
              <strong style={{ color: '#1a5f2c' }}>{toNumber(audit.command_area_ha).toLocaleString()} Hectares</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Compliance Score" span={1}>
              <strong style={{ fontSize: 14, color: audit.compliance_score >= 85 ? '#1a5f2c' : '#a16207' }}>
                {toNumber(audit.compliance_score)}%
              </strong>
            </Descriptions.Item>
            <Descriptions.Item label="Certification Status" span={1}>
              <Tag color={audit.qa_status === QA_CERTIFIED ? 'success' : 'warning'}>{audit.qa_status}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Audit Date (E.C.)" span={1}>
              <span><CalendarOutlined style={{ marginRight: 6, color: '#1a5f2c' }} />{audit.qa_ethiopian_date}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Lead Auditor" span={1}>{audit.lead_qa_auditor}</Descriptions.Item>
            <Descriptions.Item label="Regulatory Directorate" span={1}>{audit.qa_institution}</Descriptions.Item>
            <Descriptions.Item label="Administrative Station" span={2}>
              <EnvironmentOutlined style={{ color: '#1a5f2c', marginRight: 4 }} />
              {extractName(audit.kebele)} &gt; {extractName(audit.woreda)} &gt; {extractName(audit.zone)}
            </Descriptions.Item>
            <Descriptions.Item label="Auditor Findings & Directives" span={2}>
              <div style={{ color: '#595959', fontSize: 12, fontStyle: 'italic' }}>
                {audit.qa_audit_findings || 'No specific findings logged.'}
              </div>
            </Descriptions.Item>
          </Descriptions>

          <Divider titlePlacement="start" style={{ margin: '16px 0 10px', fontSize: 13, color: '#1a5f2c' }}>
            Statutory Engineering Safety Factor Checks
          </Divider>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {QA_CHECKS.map((c) => {
              const passed = Boolean(audit.verification_checklist?.[c.key]);
              const failColor = c.softFail ? 'warning' : 'error';
              const passText = c.softFail ? 'Cleared' : 'Passed';
              const failText = c.softFail ? 'Pending' : 'Failed';
              return (
                <Tag key={c.key} color={passed ? 'success' : failColor}>
                  {c.dossier}: {passed ? passText : failText}
                </Tag>
              );
            })}
          </div>
        </div>
      )}
    </Modal>
  );
}

