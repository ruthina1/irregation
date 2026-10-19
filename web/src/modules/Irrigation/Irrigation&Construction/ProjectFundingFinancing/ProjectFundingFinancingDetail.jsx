import { Button, Descriptions, Divider, Modal, Table, Tag } from 'antd';
import { BankOutlined, CalendarOutlined, EnvironmentOutlined, LinkOutlined } from '@ant-design/icons';
import { extractName, toNumber } from '../../shared/utils';
import { ALLOCATION_STATUSES, FINANCING_PROGRAMS, toMillions } from './ProjectFundingFinancingManagement';

const LEDGER_COLUMNS = [
  { title: 'Payment Certificate / Milestone', dataIndex: 'ipc_no', key: 'ipc_no', render: (t) => <strong style={{ color: '#1a5f2c' }}>{t}</strong> },
  { title: 'Disbursed Amount (ETB)', dataIndex: 'amount', key: 'amount', render: (a) => <span style={{ fontWeight: 600 }}>{toMillions(a, 2)} M ETB</span> },
  {
    title: 'Ethiopian Date',
    dataIndex: 'eth_date',
    key: 'eth_date',
    render: (d) => <span><CalendarOutlined style={{ marginRight: 4, color: '#1a5f2c' }} />{d}</span>,
  },
  { title: 'Payee Entity', dataIndex: 'recipient', key: 'recipient' },
  { title: 'Voucher Ref', dataIndex: 'voucher_ref', key: 'voucher_ref', render: (v) => <span style={{ fontFamily: 'monospace', fontSize: 11 }}>{v || '-'}</span> },
];

/** Full funding & disbursement dossier, including the itemised IPC ledger. */
export default function FundingDossierModal({ record, onClose, onOpenContract }) {
  const program = FINANCING_PROGRAMS.find((p) => p.value === record?.funding_program);
  const status = ALLOCATION_STATUSES.find((s) => s.value === record?.allocation_status);
  const ledger = Array.isArray(record?.disbursement_ledger) ? record.disbursement_ledger : [];

  return (
    <Modal
      title={(
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <BankOutlined style={{ color: '#1a5f2c', fontSize: 18 }} />
          <span style={{ fontSize: 16, fontWeight: 'bold', color: '#1a5f2c' }}>
            {record?.scheme_name} - Financial & Disbursement Dossier
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
            <Descriptions.Item label="Funding Ledger Code" span={1}>
              <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1a5f2c' }}>{record.funding_code}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Contract Reference" span={1}>
              <Button type="link" size="small" icon={<LinkOutlined />} style={{ padding: 0 }} onClick={() => onOpenContract(record.contract_code)}>
                {record.contract_code}
              </Button>
            </Descriptions.Item>
            <Descriptions.Item label="Financing Program" span={1}>
              <Tag color={program ? program.color : 'default'}>{record.funding_program}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Donor / Special Account" span={1}>
              <span style={{ fontFamily: 'monospace' }}>{record.donor_account_ref}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Total Allocated Capital Budget" span={1}>
              <strong style={{ fontSize: 14, color: '#5b8a6b' }}>{toMillions(record.total_allocated_budget_etb, 2)} Million ETB</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Cumulative Disbursed" span={1}>
              <strong style={{ fontSize: 14, color: '#1a5f2c' }}>{toMillions(record.cumulative_disbursed_etb, 2)} Million ETB</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Remaining Balance" span={1}>
              <strong style={{ color: '#a16207' }}>{toMillions(record.remaining_balance_etb, 2)} Million ETB</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Financial Burn Rate" span={1}>
              <strong>{toNumber(record.financial_burn_rate_pct)}%</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Allocation Status" span={1}>
              <Tag color={status ? status.color : 'processing'}>{record.allocation_status}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Fiscal Year" span={1}>
              <Tag color="default">{record.fiscal_year}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Administrative Station" span={2}>
              <EnvironmentOutlined style={{ color: '#1a5f2c', marginRight: 4 }} />
              {extractName(record.kebele)} &gt; {extractName(record.woreda)} &gt; {extractName(record.zone)}
            </Descriptions.Item>
            <Descriptions.Item label="Financial Notes & Directives" span={2}>
              <div style={{ color: '#595959', fontSize: 12, fontStyle: 'italic' }}>
                {record.financial_notes || 'No financial notes recorded.'}
              </div>
            </Descriptions.Item>
          </Descriptions>

          <Divider titlePlacement="start" style={{ margin: '16px 0 10px', fontSize: 13, color: '#1a5f2c' }}>
            Itemized Interim Payment Certificates (IPC) Disbursed
          </Divider>

          {ledger.length > 0 ? (
            <Table dataSource={ledger} rowKey={(tx) => tx.id || `${tx.ipc_no}-${tx.eth_date}-${tx.amount}`} pagination={false} size="small" bordered columns={LEDGER_COLUMNS} />
          ) : (
            <div style={{ textAlign: 'center', padding: '16px', color: '#8c8c8c', background: '#fafafa', borderRadius: 6 }}>
              No interim payments recorded yet.
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
