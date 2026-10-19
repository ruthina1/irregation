import { Button, Descriptions, Modal, Tag } from 'antd';
import { AreaChartOutlined, CalendarOutlined, EnvironmentOutlined, LinkOutlined } from '@ant-design/icons';
import { extractName, toNumber } from '../../shared/utils';
import { WATER_ADEQUACY_STATUSES } from './IrrigatedLandUtilizationManagement';

/** Read-only dossier of one seasonal land-utilization record. */
export default function UtilizationDossierModal({ record, onClose, onOpenScheme }) {
  const adequacyColor = WATER_ADEQUACY_STATUSES.find((s) => s.value === record?.water_adequacy_status)?.color || 'default';

  return (
    <Modal
      title={(
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <AreaChartOutlined style={{ color: '#1a5f2c', fontSize: 18 }} />
          <span style={{ fontSize: 16, fontWeight: 'bold', color: '#1a5f2c' }}>{record?.scheme_name} - Irrigated Land Utilization Dossier</span>
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
            <Descriptions.Item label="Utilization Log Code">
              <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{record.utilization_code}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Scheme Reference">
              <Button type="link" size="small" icon={<LinkOutlined />} style={{ padding: 0 }} onClick={() => onOpenScheme(record)}>
                {record.scheme_code}
              </Button>
            </Descriptions.Item>
            <Descriptions.Item label="Cropping Round"><strong>{record.cropping_round}</strong></Descriptions.Item>
            <Descriptions.Item label="Land Modality">
              <Tag color={record.land_modality?.includes('New') ? 'green' : 'default'}>{record.land_modality}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Expansion Network" span={2}><Tag color="default">{record.expansion_method}</Tag></Descriptions.Item>
            <Descriptions.Item label="Active Irrigated Land">
              <strong style={{ fontSize: 14, color: '#1a5f2c' }}>{record.actual_irrigated_ha} Hectares</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Expansion Area"><strong>+{toNumber(record.expansion_area_ha)} Hectares</strong></Descriptions.Item>
            <Descriptions.Item label="Total Effective Irrigated">
              <strong style={{ color: '#5b8a6b', fontSize: 14 }}>{record.total_effective_irrigated_ha} Hectares</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Utilization Rate">
              <strong>{record.utilization_rate_pct != null ? `${record.utilization_rate_pct}%` : 'Not tracked'}</strong> (Planned: {record.planned_command_ha} Ha)
            </Descriptions.Item>
            <Descriptions.Item label="Beneficiary Farmers" span={2}>
              Male: <span style={{ color: '#5b8a6b', fontWeight: 600 }}>{record.farmers_male}</span> |
              Female: <span style={{ color: '#64748b', fontWeight: 600 }}>{record.farmers_female}</span>
              {' '}(Total: {toNumber(record.farmers_male) + toNumber(record.farmers_female)} Households)
            </Descriptions.Item>
            <Descriptions.Item label="Water Adequacy Status"><Tag color={adequacyColor}>{record.water_adequacy_status}</Tag></Descriptions.Item>
            <Descriptions.Item label="Survey Date (E.C.)">
              <span><CalendarOutlined style={{ marginRight: 6, color: '#1a5f2c' }} />{record.reporting_ethiopian_date}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Dominant Crops" span={2}><strong>{record.dominant_crops}</strong></Descriptions.Item>
            <Descriptions.Item label="Verifying Agronomist" span={2}>{record.verifying_expert}</Descriptions.Item>
            <Descriptions.Item label="Administrative Station" span={2}>
              <EnvironmentOutlined style={{ color: '#1a5f2c', marginRight: 4 }} />
              {extractName(record.kebele)} &gt; {extractName(record.woreda)} &gt; {extractName(record.zone)}
            </Descriptions.Item>
            <Descriptions.Item label="Field Water Delivery Remarks" span={2}>
              <div style={{ color: '#595959', fontSize: 12, fontStyle: 'italic' }}>
                {record.field_observations || 'Uniform water delivery confirmed across all tertiary off-takes.'}
              </div>
            </Descriptions.Item>
          </Descriptions>
        </div>
      )}
    </Modal>
  );
}
