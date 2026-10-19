import { Button, Descriptions, Modal, Tag } from 'antd';
import { BookOutlined, CalendarOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { extractName, toNumber } from '../../shared/utils';
import { TRAINING_STATUSES } from './ProfessionalCapacityBuildingManagement';

/** Read-only course dossier. */
export default function ProfessionalCapacityBuildingDetail({ training, onClose }) {
  const status = TRAINING_STATUSES.find((s) => s.value === training?.training_status);

  return (
    <Modal
      title={(
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <BookOutlined style={{ color: '#1a5f2c', fontSize: 18 }} />
          <span style={{ fontSize: 16, fontWeight: 'bold', color: '#1a5f2c' }}>{training?.course_title} - Course Dossier</span>
        </div>
      )}
      open={Boolean(training)}
      onCancel={onClose}
      footer={[<Button key="close" type="primary" onClick={onClose} style={{ backgroundColor: '#1a5f2c' }}>Close</Button>]}
      width={720}
      destroyOnHidden
    >
      {training && (
        <div style={{ paddingTop: 6 }}>
          <Descriptions bordered size="small" column={2}>
            <Descriptions.Item label="Course Code">
              <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{training.training_code}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Fiscal Year"><Tag color="default">{training.fiscal_year}</Tag></Descriptions.Item>
            <Descriptions.Item label="Discipline" span={2}><Tag color="default">{training.discipline}</Tag></Descriptions.Item>
            <Descriptions.Item label="Target Institution Level" span={2}><strong>{training.target_tier}</strong></Descriptions.Item>
            <Descriptions.Item label="Sponsoring Program"><Tag color="default">{training.sponsoring_program}</Tag></Descriptions.Item>
            <Descriptions.Item label="Duration"><strong>{training.training_duration_days} Days</strong></Descriptions.Item>
            <Descriptions.Item label="Total Trainees (M / F)" span={2}>
              Male: <span style={{ color: '#5b8a6b', fontWeight: 600 }}>{training.male_participants}</span> |
              Female: <span style={{ color: '#64748b', fontWeight: 600 }}>{training.female_participants}</span>{' '}
              (Total: {toNumber(training.male_participants) + toNumber(training.female_participants)} Experts)
            </Descriptions.Item>
            <Descriptions.Item label="Lead Trainer">{training.lead_trainer}</Descriptions.Item>
            <Descriptions.Item label="Venue">{training.training_venue}</Descriptions.Item>
            <Descriptions.Item label="Course Status">
              <Tag color={status?.color || 'default'}>{training.training_status}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Course Date (E.C.)">
              <span><CalendarOutlined style={{ marginRight: 6, color: '#1a5f2c' }} />{training.ethiopian_date}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Administrative Location" span={2}>
              <EnvironmentOutlined style={{ color: '#1a5f2c', marginRight: 4 }} />
              {extractName(training.woreda)} &gt; {extractName(training.zone)}
            </Descriptions.Item>
            <Descriptions.Item label="Course Learning Objectives" span={2}>
              <div style={{ color: '#595959', fontSize: 12, fontStyle: 'italic' }}>
                {training.course_objectives || 'No specific course syllabus description recorded.'}
              </div>
            </Descriptions.Item>
          </Descriptions>
        </div>
      )}
    </Modal>
  );
}
