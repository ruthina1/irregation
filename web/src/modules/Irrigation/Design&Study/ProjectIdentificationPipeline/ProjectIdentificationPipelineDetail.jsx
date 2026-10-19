import { Button, Descriptions, Modal, Tag } from 'antd';
import { AuditOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { extractName, toNumber } from '../../shared/utils';
import { PRIORITY_COLORS } from './ProjectIdentificationPipelineManagement';

/** Read-only pipeline dossier. */
export default function ProjectIdentificationPipelineDetail({ project, onClose }) {
  return (
    <Modal
      title={(
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <AuditOutlined style={{ color: '#1a5f2c', fontSize: 18 }} />
          <span style={{ fontSize: 16, fontWeight: 'bold', color: '#1a5f2c' }}>{project?.scheme_name} - Pipeline Dossier</span>
        </div>
      )}
      open={Boolean(project)}
      onCancel={onClose}
      footer={[
        <Button key="close" type="primary" onClick={onClose} style={{ backgroundColor: '#1a5f2c' }}>Close</Button>,
      ]}
      width={720}
      destroyOnHidden
    >
      {project && (
        <div style={{ paddingTop: 6 }}>
          <Descriptions bordered size="small" column={2}>
            <Descriptions.Item label="Pipeline Code" span={1}>
              <span style={{ fontFamily: 'monospace' }}>{project.pipeline_code}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Fiscal Year" span={1}>
              <Tag color="default">{project.fiscal_year}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Origin of Proposal" span={2}>
              <Tag color="default">{project.initiative_source}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Water Technology" span={1}>
              <strong>{project.water_source}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Priority Level" span={1}>
              <Tag color={PRIORITY_COLORS[project.priority_level] || 'default'}>{project.priority_level}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Potential Command Area" span={1}>
              <strong style={{ color: '#1a5f2c' }}>{toNumber(project.potential_area_ha).toLocaleString()} Hectares</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Estimated Budget" span={1}>
              {project.estimated_budget_etb ? `${toNumber(project.estimated_budget_etb).toLocaleString()} ETB` : 'Pending Study Estimation'}
            </Descriptions.Item>
            <Descriptions.Item label="Target Beneficiaries (M / F)" span={2}>
              Male: {toNumber(project.estimated_beneficiaries_male)} | Female: {toNumber(project.estimated_beneficiaries_female)} (Total:{' '}
              {toNumber(project.estimated_beneficiaries_male) + toNumber(project.estimated_beneficiaries_female)} Households)
            </Descriptions.Item>
            <Descriptions.Item label="Screening Status" span={1}>
              <Tag color="green">{project.pipeline_status}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Study Progression" span={1}>
              <Tag color={project.promoted_to_study ? 'success' : 'default'}>
                {project.promoted_to_study ? 'Promoted to Study & Design' : 'Queued in Pipeline'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Reconnaissance Surveyor" span={2}>
              {project.reconnaissance_expert} ({project.reconnaissance_ethiopian_date})
            </Descriptions.Item>
            <Descriptions.Item label="Administrative Station" span={2}>
              <EnvironmentOutlined style={{ color: '#1a5f2c', marginRight: 4 }} />
              {extractName(project.kebele)} &gt; {extractName(project.woreda)} &gt; {extractName(project.zone)}
            </Descriptions.Item>
            <Descriptions.Item label="Reconnaissance Observations" span={2}>
              <div style={{ color: '#595959', fontSize: 12, fontStyle: 'italic' }}>
                {project.site_notes || 'No preliminary notes recorded.'}
              </div>
            </Descriptions.Item>
          </Descriptions>
        </div>
      )}
    </Modal>
  );
}
