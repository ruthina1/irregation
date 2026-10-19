import { Button, Descriptions, Divider, Modal, Tag } from 'antd';
import { CalendarOutlined, EnvironmentOutlined, FileProtectOutlined, LinkOutlined, TeamOutlined } from '@ant-design/icons';
import { extractName, toNumber } from '../../shared/utils';
import { PROTOCOL_GATES, statusColor } from './ProjectCompletionHandoverManagement';

const millions = (value) => (toNumber(value) / 1000000).toFixed(2);

/** Full completion & WUA handover dossier of one certificate. */
export default function HandoverDossierModal({ record, onClose, onOpenContract }) {
  const checklist = record?.protocol_checklist || {};

  return (
    <Modal
      title={(
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <FileProtectOutlined style={{ color: '#1a5f2c', fontSize: 18 }} />
          <span style={{ fontSize: 16, fontWeight: 'bold', color: '#1a5f2c' }}>
            {record?.scheme_name} - Completion & WUA Handover Dossier
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
            <Descriptions.Item label="Handover Certificate No" span={1}>
              <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1a5f2c' }}>{record.handover_certificate_no}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Contract Reference" span={1}>
              <Button type="link" size="small" icon={<LinkOutlined />} style={{ padding: 0 }} onClick={() => onOpenContract(record.contract_code)}>
                {record.contract_code}
              </Button>
            </Descriptions.Item>
            <Descriptions.Item label="Recipient WUA" span={2}>
              <strong style={{ color: '#1a5f2c' }}><TeamOutlined style={{ marginRight: 6 }} />{record.recipient_wua}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Awarded Contractor" span={1}>{record.contractor_name || '—'}</Descriptions.Item>
            <Descriptions.Item label="Supervising Consultant" span={1}>{record.consultant_supervisor || '—'}</Descriptions.Item>
            <Descriptions.Item label="Handed Over Command Area" span={1}>
              <strong style={{ color: '#1a5f2c' }}>{toNumber(record.command_area_ha).toLocaleString()} Hectares</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Farmer Beneficiaries" span={1}>
              Male: {toNumber(record.beneficiaries_male)} | Female: {toNumber(record.beneficiaries_female)} (Total:{' '}
              {toNumber(record.beneficiaries_male) + toNumber(record.beneficiaries_female)} Households)
            </Descriptions.Item>
            <Descriptions.Item label="Final Contract Sum" span={1}>{millions(record.contract_sum_etb)} Million ETB</Descriptions.Item>
            <Descriptions.Item label="5% Retention Money" span={1}>
              <strong style={{ color: '#5b8a6b' }}>{millions(record.retention_money_etb)} Million ETB</strong>
            </Descriptions.Item>
            <Descriptions.Item label="DLP Warranty Period" span={1}>
              {record.defect_liability_months} Months (Expires: {record.dlp_expiry_eth_date || 'N/A'})
            </Descriptions.Item>
            <Descriptions.Item label="Handover Protocol Status" span={1}>
              <Tag color={statusColor(record.handover_status)}>{record.handover_status}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Provisional Handover Date" span={1}>
              <span><CalendarOutlined style={{ marginRight: 6, color: '#1a5f2c' }} />{record.provisional_handover_eth_date}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Commission Lead" span={1}>{record.handover_committee_lead}</Descriptions.Item>
            <Descriptions.Item label="Administrative Location" span={2}>
              <EnvironmentOutlined style={{ color: '#1a5f2c', marginRight: 4 }} />
              {extractName(record.kebele)} &gt; {extractName(record.woreda)} &gt; {extractName(record.zone)}
            </Descriptions.Item>
            <Descriptions.Item label="Commission Minutes & Directives" span={2}>
              <div style={{ color: '#595959', fontSize: 12, fontStyle: 'italic' }}>
                {record.handover_remarks || 'No commission minutes recorded.'}
              </div>
            </Descriptions.Item>
          </Descriptions>

          <Divider titlePlacement="start" style={{ margin: '16px 0 10px', fontSize: 13, color: '#1a5f2c' }}>
            Statutory Commissioning & Handover Protocol Gates
          </Divider>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {PROTOCOL_GATES.map((g) => {
              const passed = Boolean(checklist[g.key]);
              const noText = g.no ?? `${toNumber(record.snag_items_count)} Remaining`;
              return (
                <Tag key={g.key} color={passed ? 'success' : g.noColor}>
                  {g.dossierLabel}: {passed ? g.yes : noText}
                </Tag>
              );
            })}
          </div>
        </div>
      )}
    </Modal>
  );
}
