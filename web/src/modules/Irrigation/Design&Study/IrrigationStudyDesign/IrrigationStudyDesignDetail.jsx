import { Button, Descriptions, Modal, Tag } from 'antd';
import { AuditOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { extractName, toNumber } from '../../shared/utils';
import { REVIEW_VERIFIED, isQaPassed } from './IrrigationStudyDesignManagement';

/** Read-only technical study dossier. */
export default function IrrigationStudyDesignDetail({ project, onClose }) {
  return (
    <Modal
      title={(
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <AuditOutlined style={{ color: '#1a5f2c', fontSize: 18 }} />
          <span style={{ fontSize: 16, fontWeight: 'bold', color: '#1a5f2c' }}>
            {project?.project_name} - Technical Study Dossier
          </span>
        </div>
      )}
      open={Boolean(project)}
      onCancel={onClose}
      footer={[
        <Button key="close" type="primary" onClick={onClose} style={{ backgroundColor: '#1a5f2c' }}>Close</Button>,
      ]}
      width={740}
      destroyOnHidden
    >
      {project && (
        <div style={{ paddingTop: 6 }}>
          <Descriptions bordered size="small" column={2}>
            <Descriptions.Item label="Project Code" span={1}>
              <span style={{ fontFamily: 'monospace' }}>{project.project_code}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Fiscal Year" span={1}>
              <Tag color="default">{project.fiscal_year}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Study Modality" span={1}>
              <Tag color="default">{project.study_modality}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Engineering Stage" span={1}>
              <strong>{project.study_stage}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Water Source Technology" span={2}>{project.water_source}</Descriptions.Item>
            {project.pipeline_code && (
              <Descriptions.Item label="Promoted From Pipeline" span={2}>
                <span style={{ fontFamily: 'monospace' }}>{project.pipeline_code}</span>
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Planned Command Area" span={1}>
              <strong style={{ color: '#1a5f2c' }}>{toNumber(project.command_area_hectares).toLocaleString()} Hectares</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Construction Readiness" span={1}>
              <Tag color={project.is_construction_ready ? 'success' : 'default'}>
                {project.is_construction_ready ? 'Ready for Construction' : 'Design Incomplete'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Beneficiary Farmers (M / F)" span={2}>
              Male: {toNumber(project.beneficiaries_male)} | Female: {toNumber(project.beneficiaries_female)} (Total:{' '}
              {toNumber(project.beneficiaries_male) + toNumber(project.beneficiaries_female)})
            </Descriptions.Item>
            <Descriptions.Item label="Document Review Status" span={1}>
              <Tag color={project.review_status === REVIEW_VERIFIED ? 'success' : 'processing'}>{project.review_status}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="QA Audit Status" span={1}>
              <Tag color={isQaPassed(project.qa_status) ? 'green' : 'warning'}>{project.qa_status}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Latest Design Review" span={2}>
              {project.latest_review_code ? (
                <span>
                  <span style={{ fontFamily: 'monospace' }}>{project.latest_review_code}</span>{' '}
                  <Tag color={project.review_cleared ? 'success' : 'warning'}>{project.latest_review_verdict}</Tag>
                  Score: {project.latest_review_score ?? 'Not tracked'}
                  {project.latest_review_score !== null && project.latest_review_score !== undefined ? '/100' : ''}
                </span>
              ) : 'No design document review logged yet.'}
            </Descriptions.Item>
            <Descriptions.Item label="Reviewed By / Date" span={2}>
              {project.reviewed_by
                ? `${project.reviewed_by}${project.review_ethiopian_date ? ` — ${project.review_ethiopian_date}` : ''}`
                : 'Not yet reviewed'}
            </Descriptions.Item>
            <Descriptions.Item label="Lead Consultant / Office" span={2}>
              {project.lead_consultant_or_office} (Budget:{' '}
              {project.study_cost_etb ? `${toNumber(project.study_cost_etb).toLocaleString()} ETB` : 'Internal Budget'})
            </Descriptions.Item>
            <Descriptions.Item label="Trained Staff (Male / Female)" span={2}>
              Male Experts: {toNumber(project.experts_trained_male)} | Female Experts: {toNumber(project.experts_trained_female)} (Total:{' '}
              {toNumber(project.experts_trained_male) + toNumber(project.experts_trained_female)})
            </Descriptions.Item>
            <Descriptions.Item label="Administrative Station" span={2}>
              <EnvironmentOutlined style={{ color: '#1a5f2c', marginRight: 4 }} />
              {extractName(project.kebele)} &gt; {extractName(project.woreda)} &gt; {extractName(project.zone)}
            </Descriptions.Item>
            <Descriptions.Item label="Review & QA Technical Findings" span={2}>
              <div style={{ color: '#595959', fontSize: 12, fontStyle: 'italic' }}>
                {project.review_notes || 'No review remarks recorded yet.'}
              </div>
            </Descriptions.Item>
          </Descriptions>
        </div>
      )}
    </Modal>
  );
}
