import { Button, Descriptions, Modal, Tag } from 'antd';
import { CalendarOutlined, EnvironmentOutlined, LinkOutlined, RiseOutlined } from '@ant-design/icons';
import { extractName, toNumber } from '../../shared/utils';
import { HARVEST_STATUSES } from './SeasonalCropProductionYieldManagement';

const statusColor = (value) => HARVEST_STATUSES.find((s) => s.value === value)?.color || 'default';

/** Read-only crop harvest & yield dossier. */
export default function SeasonalDossierModal({ record, onClose, onOpenScheme }) {
  const male = toNumber(record?.farmers_male);
  const female = toNumber(record?.farmers_female);

  return (
    <Modal
      title={(
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <RiseOutlined style={{ color: '#1a5f2c', fontSize: 18 }} />
          <span style={{ fontSize: 16, fontWeight: 'bold', color: '#1a5f2c' }}>
            {record?.scheme_name} - Crop Harvest & Yield Dossier
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
            <Descriptions.Item label="Production Log Code" span={1}>
              <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{record.production_code}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Scheme Reference" span={1}>
              {record.scheme_code ? (
                <Button type="link" size="small" icon={<LinkOutlined />} style={{ padding: 0 }} onClick={() => onOpenScheme(record.scheme_code)}>
                  {record.scheme_code}
                </Button>
              ) : <span style={{ color: '#8c8c8c' }}>Not linked to a registered scheme</span>}
            </Descriptions.Item>
            <Descriptions.Item label="Cropping Season" span={1}><strong>{record.cropping_round}</strong></Descriptions.Item>
            <Descriptions.Item label="Crop Category" span={1}><Tag color="default">{record.crop_category}</Tag></Descriptions.Item>
            <Descriptions.Item label="Specific Cultivar" span={2}>
              <strong style={{ fontSize: 14, color: '#1a5f2c' }}>{record.specific_crop}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Cultivated Area" span={1}>
              <strong style={{ fontSize: 14 }}>{toNumber(record.cultivated_area_ha).toLocaleString()} Hectares</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Total Harvest Yield" span={1}>
              <strong style={{ fontSize: 14, color: '#a16207' }}>{toNumber(record.production_yield_quintals).toLocaleString()} Quintals</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Productivity Rate" span={1}>
              <Tag color="success" style={{ fontWeight: 700, fontSize: 12 }}>{toNumber(record.productivity_qt_per_ha)} Quintals / Hectare</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Harvest Status" span={1}>
              <Tag color={statusColor(record.harvest_status)}>{record.harvest_status}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Beneficiary Farmers" span={2}>
              Male: <span style={{ color: '#5b8a6b', fontWeight: 600 }}>{male.toLocaleString()}</span> |{' '}
              Female: <span style={{ color: '#64748b', fontWeight: 600 }}>{female.toLocaleString()}</span>{' '}
              (Total: {(male + female).toLocaleString()} Households)
            </Descriptions.Item>
            <Descriptions.Item label="Survey / Weighing Date" span={1}>
              <span><CalendarOutlined style={{ marginRight: 6, color: '#1a5f2c' }} />{record.survey_ethiopian_date}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Operating WUA" span={1}>{record.wua_name || 'Not recorded'}</Descriptions.Item>
            <Descriptions.Item label="Verifying Agronomist" span={2}>{record.verifying_agronomist}</Descriptions.Item>
            <Descriptions.Item label="Administrative Station" span={2}>
              <EnvironmentOutlined style={{ color: '#1a5f2c', marginRight: 4 }} />
              {extractName(record.kebele)} &gt; {extractName(record.woreda)} &gt; {extractName(record.zone)}
            </Descriptions.Item>
            <Descriptions.Item label="Agronomic & Market Remarks" span={2}>
              <div style={{ color: '#595959', fontSize: 12, fontStyle: 'italic' }}>
                {record.agronomic_remarks || 'No agronomic remarks recorded.'}
              </div>
            </Descriptions.Item>
          </Descriptions>
        </div>
      )}
    </Modal>
  );
}
