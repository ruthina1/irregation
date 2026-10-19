import { Button, Descriptions, Divider, Modal, Space, Tag } from 'antd';
import { AuditOutlined, BankOutlined, CalendarOutlined, EnvironmentOutlined, ReadOutlined } from '@ant-design/icons';
import { extractName, toNumber } from '../../shared/utils';

/** Read-only institutional dossier of one association. */
export default function WuaDossierModal({ wua, onClose, onNavigate }) {
  return (
    <Modal
      title={(
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <BankOutlined style={{ color: '#1a5f2c', fontSize: 18 }} />
          <span style={{ fontSize: 16, fontWeight: 'bold', color: '#1a5f2c' }}>{wua?.wua_name} - Institutional Registry Dossier</span>
        </div>
      )}
      open={Boolean(wua)}
      onCancel={onClose}
      footer={[
        <Button key="close" type="primary" onClick={onClose} style={{ backgroundColor: '#1a5f2c' }}>Close</Button>,
      ]}
      width={750}
      destroyOnHidden
    >
      {wua && (
        <div style={{ paddingTop: 6 }}>
          <Descriptions bordered size="small" column={2}>
            <Descriptions.Item label="WUA Registration Code">
              <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1a5f2c' }}>{wua.wua_reg_code}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Scheme Reference"><Tag color="green">{wua.scheme_name}</Tag></Descriptions.Item>
            <Descriptions.Item label="Establishment Category"><Tag color="default">{wua.establishment_type}</Tag></Descriptions.Item>
            <Descriptions.Item label="Governance Health Status">
              <Tag color={wua.governance_status?.includes('Active') ? 'success' : 'warning'}>{wua.governance_status}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Managed Command Area">
              <strong style={{ color: '#1a5f2c' }}>{toNumber(wua.command_area_ha).toLocaleString()} Hectares</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Distribution Regime">
              <span style={{ fontSize: 11, fontWeight: 600 }}>{wua.distribution_regime}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Total Farmer Members">
              Male: <span style={{ color: '#5b8a6b', fontWeight: 600 }}>{wua.members_male}</span> |
              Female: <span style={{ color: '#64748b', fontWeight: 600 }}>{wua.members_female}</span>
              {' '}(Total: {toNumber(wua.members_male) + toNumber(wua.members_female)} Members)
            </Descriptions.Item>
            <Descriptions.Item label="Executive Leadership (አመራር)">
              Male: <strong style={{ color: '#5b8a6b' }}>{wua.committee_male || 0}</strong> |
              Female: <strong style={{ color: '#64748b' }}>{wua.committee_female || 0}</strong>
              {' '}(Total: {toNumber(wua.committee_male) + toNumber(wua.committee_female)})
            </Descriptions.Item>
            <Descriptions.Item label="Chairperson"><strong>{wua.chairperson_name}</strong></Descriptions.Item>
            <Descriptions.Item label="Water Master (ውሃ ዳኛ)"><strong style={{ color: '#1a5f2c' }}>{wua.water_master_name}</strong></Descriptions.Item>
            <Descriptions.Item label="Water Fee Tariff">
              {wua.annual_water_fee_etb_ha} ETB / Hectare (Collection: {wua.fee_collection_rate_pct}%)
            </Descriptions.Item>
            <Descriptions.Item label="Bank Account Balance">
              <strong style={{ color: '#5b8a6b' }}>{toNumber(wua.bank_account_balance_etb).toLocaleString()} ETB</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Sub-Ketenas / WUGs"><strong>{wua.sub_ketenas_count} Distribution Groups</strong></Descriptions.Item>
            <Descriptions.Item label="Registration Date (E.C.)">
              <span><CalendarOutlined style={{ marginRight: 6, color: '#1a5f2c' }} />{wua.establishment_eth_date}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Administrative Station" span={2}>
              <EnvironmentOutlined style={{ color: '#1a5f2c', marginRight: 4 }} />
              {extractName(wua.kebele)} &gt; {extractName(wua.woreda)} &gt; {extractName(wua.zone)}
            </Descriptions.Item>
            <Descriptions.Item label="Governance & Operation Notes" span={2}>
              <div style={{ color: '#595959', fontSize: 12, fontStyle: 'italic' }}>
                {wua.governance_remarks || 'Association functions under ratified regional irrigation bylaws.'}
              </div>
            </Descriptions.Item>
          </Descriptions>

          <Divider titlePlacement="start" style={{ margin: '16px 0 10px', fontSize: 13, color: '#1a5f2c' }}>
            Institutional Progression & Auditing Actions
          </Divider>
          <Space wrap size={[12, 12]}>
            <Button type="dashed" icon={<AuditOutlined style={{ color: '#a16207' }} />} onClick={() => onNavigate('/irrigation/institutions/assessment-audit', wua)}>
              Perform Governance & Legal Audit Inspection
            </Button>
            <Button type="dashed" icon={<ReadOutlined style={{ color: '#64748b' }} />} onClick={() => onNavigate('/irrigation/institutions/capacity-building', wua)}>
              Log Leadership & Member Training
            </Button>
          </Space>
        </div>
      )}
    </Modal>
  );
}
