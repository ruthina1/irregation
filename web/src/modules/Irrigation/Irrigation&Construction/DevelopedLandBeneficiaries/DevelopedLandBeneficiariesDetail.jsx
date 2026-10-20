import { Button, Descriptions, Modal, Space, Tag } from 'antd';
import { AreaChartOutlined, CalendarOutlined, EnvironmentOutlined, LinkOutlined } from '@ant-design/icons';
import { extractName, toNumber } from '../../shared/utils';
import { BENEFIT_STATUSES, cropList } from './DevelopedLandBeneficiariesConstants';

/** Developed land & socio-economic impact dossier. */
export default function BenefitDossierModal({ record, onClose, onOpenContract }) {
  const status = BENEFIT_STATUSES.find((s) => s.value === record?.benefit_status);
  const rate = toNumber(record?.land_development_rate_pct);

  return (
    <Modal
      title={(
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <AreaChartOutlined style={{ color: '#1a5f2c', fontSize: 18 }} />
          <span style={{ fontSize: 16, fontWeight: 'bold', color: '#1a5f2c' }}>
            {record?.scheme_name} - Developed Land & Socio-Economic Impact Dossier
          </span>
        </div>
      )}
      open={Boolean(record)}
      onCancel={onClose}
      footer={[<Button key="close" type="primary" onClick={onClose} style={{ backgroundColor: '#1a5f2c' }}>Close</Button>]}
      width={750}
      destroyOnHidden
    >
      {record && (
        <div style={{ paddingTop: 6 }}>
          <Descriptions bordered size="small" column={2}>
            <Descriptions.Item label="Benefit Survey Code" span={1}>
              <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1a5f2c' }}>{record.benefit_code}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Contract Reference" span={1}>
              <Button type="link" size="small" icon={<LinkOutlined />} style={{ padding: 0 }} onClick={() => onOpenContract(record.contract_code)}>
                {record.contract_code}
              </Button>
            </Descriptions.Item>
            <Descriptions.Item label="Classification" span={1}>
              <Tag color="default">{record.scheme_type}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Funding Program" span={1}>
              <Tag color="default">{record.funding_source}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Planned Command Area" span={1}>
              <strong>{toNumber(record.planned_command_ha).toLocaleString()} Hectares</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Actual Developed Land" span={1}>
              <strong style={{ color: '#1a5f2c', fontSize: 14 }}>{toNumber(record.actual_developed_ha).toLocaleString()} Hectares</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Active Cultivated Land" span={1}>
              <strong style={{ color: '#5b8a6b' }}>{toNumber(record.operational_cultivated_ha).toLocaleString()} Hectares</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Land Development Rate" span={1}>
              <strong style={{ color: rate >= 66 ? '#1a5f2c' : '#a16207' }}>{rate}%</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Beneficiary Farmers (M / F)" span={2}>
              Male: <span style={{ color: '#5b8a6b', fontWeight: 600 }}>{record.beneficiaries_male}</span> |{' '}
              Female: <span style={{ color: '#64748b', fontWeight: 600 }}>{record.beneficiaries_female}</span>{' '}
              (Total: {toNumber(record.beneficiaries_male) + toNumber(record.beneficiaries_female)} Households)
              {toNumber(record.youth_beneficiaries_count) > 0 && (
                <span style={{ marginLeft: 8, color: '#a16207' }}>[Youth Farmers: {record.youth_beneficiaries_count}]</span>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Cropping Intensity" span={1}>
              <strong>{record.cropping_intensity_ratio}x Annual Cycles</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Operational Status" span={1}>
              <Tag color={status ? status.color : 'default'}>{record.benefit_status}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Primary Crops Cultivated" span={2}>
              <Space wrap size={[4, 6]}>
                {cropList(record.primary_crops_cultivated).map((crop) => <Tag key={crop} color="green">{crop}</Tag>)}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Surveying Agronomist" span={1}>{record.verifying_agronomist}</Descriptions.Item>
            <Descriptions.Item label="Verification Date (E.C.)" span={1}>
              <span><CalendarOutlined style={{ marginRight: 6, color: '#1a5f2c' }} />{record.verification_ethiopian_date}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Administrative Station" span={2}>
              <EnvironmentOutlined style={{ color: '#1a5f2c', marginRight: 4 }} />
              {extractName(record.kebele)} &gt; {extractName(record.woreda)} &gt; {extractName(record.zone)}
            </Descriptions.Item>
            <Descriptions.Item label="Agronomic Field Survey Notes" span={2}>
              <div style={{ color: '#595959', fontSize: 12, fontStyle: 'italic' }}>
                {record.field_survey_remarks || 'No field survey notes recorded.'}
              </div>
            </Descriptions.Item>
          </Descriptions>
        </div>
      )}
    </Modal>
  );
}
