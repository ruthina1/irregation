import { Button, Descriptions, Modal, Tag } from 'antd';
import { BookOutlined, CalendarOutlined, EnvironmentOutlined, LinkOutlined } from '@ant-design/icons';
import { extractName, toNumber } from '../../shared/utils';

/** Read-only course & attendance dossier of one training session. */
export default function TrainingDossierModal({ training, onClose, onOpenWua }) {
  return (
    <Modal
      title={(
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <BookOutlined style={{ color: '#1a5f2c', fontSize: 18 }} />
          <span style={{ fontSize: 16, fontWeight: 'bold', color: '#1a5f2c' }}>{training?.wua_name} - Capacity Building Dossier</span>
        </div>
      )}
      open={Boolean(training)}
      onCancel={onClose}
      footer={[
        <Button key="close" type="primary" onClick={onClose} style={{ backgroundColor: '#1a5f2c' }}>Close</Button>,
      ]}
      width={740}
      destroyOnHidden
    >
      {training && (
        <div style={{ paddingTop: 6 }}>
          <Descriptions bordered size="small" column={2}>
            <Descriptions.Item label="Course Code">
              <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{training.training_code}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Target WUA Reference">
              <Button type="link" size="small" icon={<LinkOutlined />} style={{ padding: 0 }} onClick={() => onOpenWua(training)}>
                {training.wua_reg_code}
              </Button>
            </Descriptions.Item>
            <Descriptions.Item label="Irrigation Scheme"><strong style={{ color: '#1a5f2c' }}>{training.scheme_name}</strong></Descriptions.Item>
            <Descriptions.Item label="Target Group"><Tag color="default">{training.target_group}</Tag></Descriptions.Item>
            <Descriptions.Item label="Curriculum Module" span={2}><strong>{training.training_module}</strong></Descriptions.Item>
            <Descriptions.Item label="Leadership Trainees (በማህበሩ አመራር)">
              Male: <strong style={{ color: '#5b8a6b' }}>{training.exec_leaders_male}</strong> |
              Female: <strong style={{ color: '#64748b' }}>{training.exec_leaders_female}</strong>
              {' '}(Total: {toNumber(training.exec_leaders_male) + toNumber(training.exec_leaders_female)} Leaders)
            </Descriptions.Item>
            <Descriptions.Item label="Farmer Members Trainees (አባላት)">
              Male: {training.members_male} | Female: {training.members_female}
              {' '}(Total: {toNumber(training.members_male) + toNumber(training.members_female)} Farmers)
            </Descriptions.Item>
            <Descriptions.Item label="Grand Total Trainees">
              <strong style={{ fontSize: 14, color: '#1a5f2c' }}>{toNumber(training.total_trainees)} Farmers</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Training Duration">
              {training.training_duration_days} Days ({training.training_venue})
            </Descriptions.Item>
            <Descriptions.Item label="Lead Facilitator (በባለሙያ)">{training.lead_facilitator}</Descriptions.Item>
            <Descriptions.Item label="Course Status">
              <Tag color={training.training_status === 'Completed' ? 'success' : 'processing'}>{training.training_status}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Training Session Date">
              <span><CalendarOutlined style={{ marginRight: 6, color: '#1a5f2c' }} />{training.ethiopian_date}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Fiscal Year"><Tag color="default">{training.fiscal_year}</Tag></Descriptions.Item>
            <Descriptions.Item label="Administrative Station" span={2}>
              <EnvironmentOutlined style={{ color: '#1a5f2c', marginRight: 4 }} />
              {extractName(training.kebele)} &gt; {extractName(training.woreda)} &gt; {extractName(training.zone)}
            </Descriptions.Item>
            <Descriptions.Item label="Learning Outcomes & Action Agreements" span={2}>
              <div style={{ color: '#595959', fontSize: 12, fontStyle: 'italic' }}>
                {training.course_learning_outcomes || 'No specific training resolution logged.'}
              </div>
            </Descriptions.Item>
          </Descriptions>
        </div>
      )}
    </Modal>
  );
}
