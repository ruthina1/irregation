import { Button, Descriptions, Modal, Tag } from 'antd';
import { CalendarOutlined, EnvironmentOutlined, LinkOutlined, RiseOutlined } from '@ant-design/icons';
import { extractName, toNumber } from '../../shared/utils';
import { WHEAT_STATUSES } from './HighlandIrrigatedWheatManagement';

const statusColor = (value) => WHEAT_STATUSES.find((s) => s.value === value)?.color || 'default';

/** Read-only highland wheat cluster dossier. */
export default function WheatDossierModal({ record, onClose, onOpenScheme }) {
  const male = toNumber(record?.farmers_male);
  const female = toNumber(record?.farmers_female);

  return (
    <Modal
      title={(
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <RiseOutlined style={{ color: '#1a5f2c', fontSize: 18 }} />
          <span style={{ fontSize: 16, fontWeight: 'bold', color: '#1a5f2c' }}>
            {record?.scheme_name} - Highland Wheat Cluster Dossier
          </span>
        </div>
      )}
      open={Boolean(record)}
      onCancel={onClose}
      footer={[
        <Button key="close" type="primary" onClick={onClose} style={{ backgroundColor: '#1a5f2c' }}>Close</Button>,
      ]}
      width={750}
      destroyOnHidden
    >
      {record && (
        <div style={{ paddingTop: 6 }}>
          <Descriptions bordered size="small" column={2}>
            <Descriptions.Item label="Initiative Code" span={1}>
              <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{record.initiative_code}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Scheme Reference" span={1}>
              {record.scheme_code ? (
                <Button type="link" size="small" icon={<LinkOutlined />} style={{ padding: 0 }} onClick={() => onOpenScheme(record.scheme_code)}>
                  {record.scheme_code}
                </Button>
              ) : <span style={{ color: '#8c8c8c' }}>Not linked to a registered scheme</span>}
            </Descriptions.Item>
            <Descriptions.Item label="Commercial Cluster" span={1}>
              <strong style={{ color: '#a16207' }}>{record.cluster_block_code}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Cropping Season" span={1}><strong>{record.cropping_round}</strong></Descriptions.Item>
            <Descriptions.Item label="Certified Seed Variety" span={1}>
              <Tag color="gold" style={{ fontSize: 12, fontWeight: 600 }}>{record.wheat_variety}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Mechanized Harvesting" span={1}>
              <Tag color={record.mechanized_harvesting ? 'success' : 'default'}>
                {record.mechanized_harvesting ? 'Combine Harvester' : 'Manual Sickle'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Dedicated Wheat Area" span={1}>
              <strong style={{ fontSize: 14, color: '#1a5f2c' }}>{toNumber(record.wheat_command_ha).toLocaleString()} Hectares</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Total Wheat Output" span={1}>
              <strong style={{ fontSize: 14, color: '#a16207' }}>{toNumber(record.expected_yield_qt).toLocaleString()} Quintals</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Productivity Rate" span={1}>
              <Tag color="success" style={{ fontWeight: 700, fontSize: 12 }}>{toNumber(record.productivity_qt_ha)} Quintals / Hectare</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Verification Status" span={1}>
              <Tag color={statusColor(record.verification_status)}>{record.verification_status}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Beneficiary Farmers" span={2}>
              Male: <span style={{ color: '#5b8a6b', fontWeight: 600 }}>{male.toLocaleString()}</span> |{' '}
              Female: <span style={{ color: '#64748b', fontWeight: 600 }}>{female.toLocaleString()}</span>{' '}
              (Total: {(male + female).toLocaleString()} Households)
            </Descriptions.Item>
            <Descriptions.Item label="Survey / Weighing Date" span={1}>
              <span><CalendarOutlined style={{ marginRight: 6, color: '#1a5f2c' }} />{record.field_survey_eth_date}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Lead Agronomist" span={1}>{record.lead_agronomist}</Descriptions.Item>
            <Descriptions.Item label="Operating WUA" span={2}>{record.wua_name || 'Not recorded'}</Descriptions.Item>
            <Descriptions.Item label="Administrative Station" span={2}>
              <EnvironmentOutlined style={{ color: '#1a5f2c', marginRight: 4 }} />
              {extractName(record.kebele)} &gt; {extractName(record.woreda)} &gt; {extractName(record.zone)}
            </Descriptions.Item>
            <Descriptions.Item label="Cluster Observations & Market Output" span={2}>
              <div style={{ color: '#595959', fontSize: 12, fontStyle: 'italic' }}>
                {record.initiative_notes || 'No cluster observations recorded.'}
              </div>
            </Descriptions.Item>
          </Descriptions>
        </div>
      )}
    </Modal>
  );
}
