import { Button, Descriptions, Modal, Tag } from 'antd';
import { EnvironmentOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { extractName, toNumber } from '../../shared/utils';
import { TECHNOLOGY_STATUSES } from './WaterSourcesTechnologiesManagement';

export default function WaterSourceDossierModal({ record, onClose, emphasizeWua = false }) {
  const status = TECHNOLOGY_STATUSES.find((s) => s.value === record?.operational_status);
  return (
    <Modal
      title={(
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ThunderboltOutlined style={{ color: '#1a5f2c', fontSize: 18 }} />
          <span style={{ fontSize: 16, fontWeight: 'bold', color: '#1a5f2c' }}>{record?.scheme_name} - Water Source & Technology Dossier</span>
        </div>
      )}
      open={Boolean(record)}
      onCancel={onClose}
      footer={[<Button key="close" type="primary" onClick={onClose} style={{ backgroundColor: '#1a5f2c' }}>Close</Button>]}
      width={740}
      destroyOnHidden
    >
      {record && (
        <Descriptions bordered size="small" column={2} style={{ paddingTop: 6 }}>
          <Descriptions.Item label="Irrigation Scheme"><strong style={{ color: '#1a5f2c' }}>{record.scheme_name}</strong></Descriptions.Item>
          <Descriptions.Item label="Operating WUA">{emphasizeWua ? <strong>{record.wua_name}</strong> : record.wua_name}</Descriptions.Item>
          <Descriptions.Item label="Technology Type"><Tag color="default">{record.technology_type}</Tag></Descriptions.Item>
          <Descriptions.Item label="Infrastructure Domain"><strong>{record.source_category}</strong></Descriptions.Item>
          <Descriptions.Item label="Discharge Capacity">
            <strong style={{ fontSize: 14, color: '#1a5f2c' }}>{toNumber(record.discharge_capacity_liters_sec).toLocaleString()} L/s</strong>
          </Descriptions.Item>
          <Descriptions.Item label="Installed Units">{record.equipment_units_count} Units</Descriptions.Item>
          <Descriptions.Item label="Command Area Served">
            <strong style={{ color: '#5b8a6b' }}>{toNumber(record.command_area_served_ha).toLocaleString()} Hectares</strong>
          </Descriptions.Item>
          <Descriptions.Item label="Energy / Drive Source">{record.energy_source}</Descriptions.Item>
          <Descriptions.Item label="Farmer Beneficiaries" span={2}>
            Male: {record.farmers_male} | Female: {record.farmers_female} (Total: {toNumber(record.farmers_male) + toNumber(record.farmers_female)} Households)
          </Descriptions.Item>
          <Descriptions.Item label="Operational Status"><Tag color={status?.color || 'default'}>{record.operational_status}</Tag></Descriptions.Item>
          <Descriptions.Item label="Installation Year">{record.installation_eth_year}</Descriptions.Item>
          <Descriptions.Item label="Administrative Station" span={2}>
            <EnvironmentOutlined style={{ color: '#1a5f2c', marginRight: 4 }} />
            {extractName(record.kebele)} &gt; {extractName(record.woreda)} &gt; {extractName(record.zone)}
          </Descriptions.Item>
          <Descriptions.Item label="Technical Specifications" span={2}>
            <div style={{ color: '#595959', fontSize: 12, fontStyle: 'italic' }}>{record.technical_specs || 'No technical specifications recorded.'}</div>
          </Descriptions.Item>
        </Descriptions>
      )}
    </Modal>
  );
}
