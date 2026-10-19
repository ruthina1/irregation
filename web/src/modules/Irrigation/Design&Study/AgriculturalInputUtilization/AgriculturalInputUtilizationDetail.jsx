import { Button, Descriptions, Divider, Modal, Table, Tag } from 'antd';
import { CalendarOutlined, EnvironmentOutlined, ExperimentOutlined } from '@ant-design/icons';
import { extractName, toNumber } from '../../shared/utils';
import { INPUT_STATUS_COLORS } from './AgriculturalInputUtilizationManagement';

/** Allocation dossier with the server-kept dispatch ledger. */
export default function AgriculturalInputUtilizationDetail({ record, onClose }) {
  const history = Array.isArray(record?.dispatch_history) ? record.dispatch_history : [];

  return (
    <Modal
      title={(
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ExperimentOutlined style={{ color: '#1a5f2c', fontSize: 18 }} />
          <span style={{ fontSize: 16, fontWeight: 'bold', color: '#1a5f2c' }}>
            {record?.item_name ? `${record.item_name} - Institutional Dossier` : 'Input Institutional Dossier'}
          </span>
        </div>
      )}
      open={Boolean(record)}
      onCancel={onClose}
      footer={[<Button key="close" type="primary" onClick={onClose} style={{ backgroundColor: '#1a5f2c' }}>Close</Button>]}
      width={720}
      destroyOnHidden
    >
      {record && (
        <div style={{ paddingTop: 6 }}>
          <Descriptions bordered size="small" column={2}>
            <Descriptions.Item label="Input Code"><span style={{ fontFamily: 'monospace' }}>{record.input_code}</span></Descriptions.Item>
            <Descriptions.Item label="Fiscal Year (E.C.)"><Tag color="default">{record.fiscal_year}</Tag></Descriptions.Item>
            <Descriptions.Item label="Irrigation Season">
              <Tag color={record.irrigation_season === 'Bega Irrigation' ? 'gold' : 'default'}>{record.irrigation_season}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Cropping Round"><strong>{record.cropping_round}</strong></Descriptions.Item>
            <Descriptions.Item label="Specification / Variety" span={2}>{record.specification || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Planned Allocation">{toNumber(record.planned_target_qty).toLocaleString()} {record.unit}</Descriptions.Item>
            <Descriptions.Item label="Total Dispatched">
              <strong style={{ color: '#1a5f2c' }}>{toNumber(record.distributed_qty).toLocaleString()} {record.unit}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Covered Area"><strong>{record.covered_hectares} Hectares (Ha)</strong></Descriptions.Item>
            <Descriptions.Item label="Delivery Status">
              <Tag color={INPUT_STATUS_COLORS[record.status] || 'default'}>{record.status || 'Pending'}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Beneficiaries (M / F)" span={2}>
              Male: {record.beneficiaries_male} | Female: {record.beneficiaries_female} (Total: {toNumber(record.beneficiaries_male) + toNumber(record.beneficiaries_female)})
            </Descriptions.Item>
            <Descriptions.Item label="Funding Program" span={2}><Tag color="default">{record.funding_program}</Tag></Descriptions.Item>
            <Descriptions.Item label="Administrative Station" span={2}>
              <EnvironmentOutlined style={{ color: '#1a5f2c', marginRight: 4 }} />
              {extractName(record.kebele)} &gt; {extractName(record.woreda)} &gt; {extractName(record.zone)}
            </Descriptions.Item>
          </Descriptions>

          <Divider titlePlacement="start" style={{ margin: '16px 0 10px', fontSize: 13, color: '#1a5f2c' }}>
            Dispatched Delivery Ledger
          </Divider>

          {history.length > 0 ? (
            <Table
              dataSource={history}
              rowKey={(row, i) => row.id || i}
              pagination={false}
              size="small"
              bordered
              columns={[
                {
                  title: 'Ethiopian Date',
                  dataIndex: 'ethiopian_date',
                  key: 'ethiopian_date',
                  render: (d) => <span><CalendarOutlined style={{ marginRight: 6, color: '#1a5f2c' }} />{d}</span>,
                },
                {
                  title: 'Dispatched Quantity',
                  dataIndex: 'qty',
                  key: 'qty',
                  render: (q) => <strong>{toNumber(q).toLocaleString()} {record.unit}</strong>,
                },
                { title: 'Recipient Entity / WUA', dataIndex: 'recipient', key: 'recipient' },
                {
                  title: 'Notes',
                  dataIndex: 'notes',
                  key: 'notes',
                  render: (n, row) => (
                    <span style={{ color: '#8c8c8c' }}>
                      {n || '-'}
                      {row.recorded_by && <div style={{ fontSize: 10 }}>Recorded by {row.recorded_by}</div>}
                    </span>
                  ),
                },
              ]}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '16px', color: '#8c8c8c', background: '#fafafa', borderRadius: 6 }}>
              No distribution dispatches recorded yet.
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
