import { Button, Descriptions, Modal, Tag } from 'antd';
import { BuildOutlined, CalendarOutlined, EnvironmentOutlined, LinkOutlined } from '@ant-design/icons';
import { extractName, toNumber } from '../../shared/utils';

const millions = (value) => `${(toNumber(value) / 1000000).toFixed(2)} Million ETB`;

/** Read-only construction site dossier for one contract. */
export default function ProjectDossierModal({ project, onClose }) {
  const p = project || {};
  const male = toNumber(p.beneficiaries_male);
  const female = toNumber(p.beneficiaries_female);
  const physical = toNumber(p.physical_progress_pct);

  return (
    <Modal
      title={(
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <BuildOutlined style={{ color: '#1a5f2c', fontSize: 18 }} />
          <span style={{ fontSize: 16, fontWeight: 'bold', color: '#1a5f2c' }}>
            {p.scheme_name} - Construction Site Dossier
          </span>
        </div>
      )}
      open={Boolean(project)}
      onCancel={onClose}
      footer={[
        <Button key="close" type="primary" onClick={onClose} style={{ backgroundColor: '#1a5f2c' }}>Close</Button>,
      ]}
      width={750}
      destroyOnHidden
    >
      {project && (
        <div style={{ paddingTop: 6 }}>
          <Descriptions bordered size="small" column={2}>
            <Descriptions.Item label="Contract Code">
              <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1a5f2c' }}>{p.contract_code}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Original Design Ref">
              <Tag color="green"><LinkOutlined style={{ marginRight: 4 }} />{p.project_code}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Classification">
              <Tag color="default">{p.scheme_type}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Funding Program">
              <Tag color="default">{p.funding_source}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Awarded Contractor"><strong>{p.contractor_name}</strong></Descriptions.Item>
            <Descriptions.Item label="Contractor Classification">
              <span style={{ color: '#5b8a6b', fontSize: 12 }}>{p.contractor_grade}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Supervision Consultant">{p.consultant_supervisor}</Descriptions.Item>
            <Descriptions.Item label="Defect Liability Warranty">{p.defect_liability_months || 12} Months</Descriptions.Item>
            <Descriptions.Item label="Contract Value">
              <strong style={{ fontSize: 14, color: '#5b8a6b' }}>{millions(p.contract_sum_etb)}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Disbursed Sum">
              <strong style={{ fontSize: 14, color: '#1a5f2c' }}>{millions(p.disbursed_sum_etb)}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Physical Progress">
              <strong style={{ fontSize: 14, color: physical >= 66 ? '#1a5f2c' : '#a16207' }}>{physical}%</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Current Status">
              <Tag color="default">{p.construction_status}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Developed Land (Ha)">
              <strong style={{ color: '#1a5f2c' }}>{toNumber(p.command_area_ha).toLocaleString()} Hectares</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Farmer Beneficiaries">
              Male: {male} | Female: {female} (Total: {male + female})
            </Descriptions.Item>
            <Descriptions.Item label="Commencement Date">
              <span><CalendarOutlined style={{ marginRight: 6, color: '#1a5f2c' }} />{p.contract_signing_eth_date}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Target Completion Date">
              <span><CalendarOutlined style={{ marginRight: 6, color: '#1a5f2c' }} />{p.planned_completion_eth_date}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Schedule Health">
              <Tag>{p.health_status || 'Not tracked'}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Last Inspection">
              {p.reporting_ethiopian_date || 'Not evaluated yet'}
              {p.resident_engineer ? ` — ${p.resident_engineer}` : ''}
            </Descriptions.Item>
            <Descriptions.Item label="Registered WUA" span={2}>
              {p.wua_name || 'No Water Users Association registered for this scheme yet'}
            </Descriptions.Item>
            <Descriptions.Item label="Administrative Station" span={2}>
              <EnvironmentOutlined style={{ color: '#1a5f2c', marginRight: 4 }} />
              {extractName(p.kebele)} &gt; {extractName(p.woreda)} &gt; {extractName(p.zone)}
            </Descriptions.Item>
            <Descriptions.Item label="Site Execution Status & Resident Engineer Remarks" span={2}>
              <div style={{ color: '#595959', fontSize: 12, fontStyle: 'italic' }}>
                {p.site_progress_notes || 'No critical site remarks recorded.'}
              </div>
            </Descriptions.Item>
          </Descriptions>
        </div>
      )}
    </Modal>
  );
}
