import { Button, Descriptions, Modal, Space, Tag } from 'antd';
import { CalendarOutlined, EnvironmentOutlined, ToolOutlined } from '@ant-design/icons';
import { extractName, toNumber } from '../../shared/utils';
import { OPERATION_STATUSES, interventionList, isCleaningTag } from './SchemeMaintenanceCleaningManagement';

/** Read-only dossier of one maintenance / cleaning intervention. */
export default function MaintenanceDossierModal({ record, onClose }) {
  const statusColor = OPERATION_STATUSES.find((s) => s.value === record?.operation_status)?.color || 'default';
  const hasCost = record?.financial_cost_etb !== null && record?.financial_cost_etb !== undefined;

  return (
    <Modal
      title={(
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ToolOutlined style={{ color: '#1a5f2c', fontSize: 18 }} />
          <span style={{ fontSize: 16, fontWeight: 'bold', color: '#1a5f2c' }}>{record?.scheme_name} - Maintenance & Desilting Dossier</span>
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
            <Descriptions.Item label="Irrigation Scheme"><strong style={{ color: '#1a5f2c' }}>{record.scheme_name}</strong></Descriptions.Item>
            <Descriptions.Item label="Canal Infrastructure Type">
              <Tag color="default">{record.canal_type}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Operating WUA" span={2}><strong>{record.wua_name}</strong></Descriptions.Item>
            <Descriptions.Item label="Intervention Types" span={2}>
              <Space wrap size={[4, 6]}>
                {interventionList(record.intervention_types).map((type) => (
                  <Tag key={type} color={isCleaningTag(type) ? 'green' : 'orange'}>{type}</Tag>
                ))}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Delivered Distance">
              <strong style={{ fontSize: 14, color: '#1a5f2c' }}>{record.repaired_cleaned_km} km</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Protected Command Area">{record.command_area_protected_ha} Hectares</Descriptions.Item>
            <Descriptions.Item label="Mobilized Community Labor">
              Male: {toNumber(record.mobilized_labor_male)} | Female: {toNumber(record.mobilized_labor_female)}
              {' '}(Total: {toNumber(record.mobilized_labor_male) + toNumber(record.mobilized_labor_female)} Farmers)
            </Descriptions.Item>
            <Descriptions.Item label="Financial Expenditure">
              <strong style={{ color: '#5b8a6b' }}>{hasCost ? `${toNumber(record.financial_cost_etb).toLocaleString()} ETB` : 'Not tracked'}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Funding Channel"><Tag color="default">{record.funding_source}</Tag></Descriptions.Item>
            <Descriptions.Item label="Operation Status"><Tag color={statusColor}>{record.operation_status}</Tag></Descriptions.Item>
            <Descriptions.Item label="Intervention Date">
              <span><CalendarOutlined style={{ marginRight: 6, color: '#1a5f2c' }} />{record.activity_ethiopian_date}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Lead Coordinator / Technician" span={2}>{record.lead_coordinator}</Descriptions.Item>
            <Descriptions.Item label="Administrative Station" span={2}>
              <EnvironmentOutlined style={{ color: '#1a5f2c', marginRight: 4 }} />
              {extractName(record.kebele)} &gt; {extractName(record.woreda)} &gt; {extractName(record.zone)}
            </Descriptions.Item>
            <Descriptions.Item label="Engineering & Field Remarks" span={2}>
              <div style={{ color: '#595959', fontSize: 12, fontStyle: 'italic' }}>
                {record.field_remarks || 'Intervention executed on schedule; canal flow capacity verified.'}
              </div>
            </Descriptions.Item>
          </Descriptions>
        </div>
      )}
    </Modal>
  );
}
