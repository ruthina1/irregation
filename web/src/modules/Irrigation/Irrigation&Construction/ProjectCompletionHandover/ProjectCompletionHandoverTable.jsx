import { Button, Popconfirm, Select, Space, Table, Tag, Tooltip } from 'antd';
import { DeleteOutlined, EditOutlined, EnvironmentOutlined, EyeOutlined, LinkOutlined, TeamOutlined } from '@ant-design/icons';
import { extractName, toNumber } from '../../shared/utils';
import { HANDOVER_STATUSES, statusColor } from './ProjectCompletionHandoverManagement';

/** Register of completion & WUA handover certificates. */
export default function HandoverTable({ data, loading, onView, onEdit, onDelete, onStatusChange, onOpenContract }) {
  const columns = [
    {
      title: 'Handover Certificate & Scheme Name',
      key: 'cert_info',
      width: 280,
      render: (_, r) => (
        <div>
          <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{r.scheme_name}</strong>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>
            Cert: <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{r.handover_certificate_no}</span> | Contract:
            <Tooltip title="View Master Construction Contract">
              <Tag color="default" style={{ fontSize: 10, cursor: 'pointer', marginLeft: 4 }} onClick={() => onOpenContract(r.contract_code)}>
                <LinkOutlined style={{ marginRight: 2 }} />{r.contract_code}
              </Tag>
            </Tooltip>
          </div>
        </div>
      ),
    },
    {
      title: 'Recipient Water Users Association (WUA)',
      dataIndex: 'recipient_wua',
      key: 'recipient_wua',
      width: 240,
      render: (wua) => (
        <span style={{ fontWeight: 600, color: '#1a5f2c' }}><TeamOutlined style={{ marginRight: 6 }} />{wua}</span>
      ),
    },
    {
      title: 'Operational Command Area',
      dataIndex: 'command_area_ha',
      key: 'command_area_ha',
      width: 150,
      render: (ha, r) => (
        <div>
          <strong style={{ color: '#1a5f2c' }}>{toNumber(ha).toLocaleString()} Ha</strong>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>
            {(toNumber(r.beneficiaries_male) + toNumber(r.beneficiaries_female)).toLocaleString()} Farmers
          </div>
        </div>
      ),
    },
    {
      title: 'DLP Warranty & Retention (5%)',
      key: 'dlp_retention',
      width: 180,
      render: (_, r) => (
        <div style={{ fontSize: 11 }}>
          <div>Warranty: <strong>{r.defect_liability_months} Months</strong></div>
          {r.dlp_expiry_eth_date && <div style={{ color: '#8c8c8c' }}>Expires: {r.dlp_expiry_eth_date}</div>}
          <div style={{ color: '#5b8a6b' }}>Retention: {(toNumber(r.retention_money_etb) / 1000000).toFixed(2)} M ETB</div>
        </div>
      ),
    },
    {
      title: 'Handover Protocol Status',
      dataIndex: 'handover_status',
      key: 'handover_status',
      width: 230,
      render: (st, r) => (
        <Space orientation="vertical" size={4}>
          <Tag color={statusColor(st)}>{st}</Tag>
          <Select
            size="small"
            value={st}
            style={{ width: 200 }}
            onChange={(value) => onStatusChange(r, value)}
            options={HANDOVER_STATUSES.map((s) => ({ value: s.value, label: s.value }))}
            aria-label="Change handover protocol status"
          />
        </Space>
      ),
    },
    {
      title: 'Location',
      key: 'station',
      width: 160,
      render: (_, r) => (
        <div style={{ fontSize: 12 }}>
          <Tooltip title={`${extractName(r.zone)} > ${extractName(r.woreda)}`}>
            <span>
              <EnvironmentOutlined style={{ color: '#1a5f2c', marginRight: 4 }} />
              <strong>{extractName(r.kebele)}</strong>
            </span>
          </Tooltip>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>{extractName(r.zone)} &gt; {extractName(r.woreda)}</div>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'center',
      fixed: 'right',
      width: 130,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Complete Handover Dossier">
            <Button type="text" size="small" aria-label="View dossier" icon={<EyeOutlined style={{ color: '#5b8a6b' }} />} onClick={() => onView(record)} />
          </Tooltip>
          <Tooltip title="Edit Handover Protocol">
            <Button type="text" size="small" aria-label="Edit handover" icon={<EditOutlined style={{ color: '#2f7d4a' }} />} onClick={() => onEdit(record)} />
          </Tooltip>
          <Popconfirm
            title="Delete handover certificate?"
            description="Are you sure you want to remove this record?"
            onConfirm={() => onDelete(record)}
          >
            <Button type="text" size="small" danger aria-label="Delete handover" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table columns={columns} dataSource={data} rowKey="id" loading={loading} scroll={{ x: 1350 }} bordered size="middle" />
  );
}
