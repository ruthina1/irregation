import React from 'react';
import { Table, Tag, Space, Tooltip, Button, Progress } from 'antd';
import { 
  EnvironmentOutlined, CheckCircleOutlined, ClockCircleOutlined, 
  AuditOutlined, HeartOutlined, MedicineBoxOutlined, EyeOutlined 
} from '@ant-design/icons';
import { EditButton, DeleteButton } from '../../../components/common/ActionButtons';

export default function ModelVillageTable({ data, onEdit, onDelete, onApprove, onView }) {
  const columns = [
    { 
      title: 'Location (Kebele)', 
      key: 'kebele', 
      render: (_, r) => (
        <Tooltip title={`${r.kebele?.woreda?.zone?.name} > ${r.kebele?.woreda?.name}`}>
          <strong style={{color:'#1a5f2c'}}><EnvironmentOutlined /> {r.kebele?.name}</strong>
        </Tooltip>
      ) 
    },
    { title: 'Year', dataIndex: 'certification_year_ec', key: 'year', align: 'center', render: y => <strong>{y}</strong> },
    { 
      title: 'Demographics', 
      key: 'demo',
      render: (_, r) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontSize: '12px' }}>Total HHs: <b>{r.total_households}</b></span>
          <span style={{ fontSize: '12px', color: '#1890ff' }}>Water Access: <b>{r.households_with_water_access}</b></span>
        </Space>
      )
    },
    { 
      title: 'Key Indicators', 
      key: 'indicators', 
      render: (_, r) => (
        <Space wrap>
          {r.is_odf_certified ? <Tag color="green"><MedicineBoxOutlined /> ODF</Tag> : <Tag>ODF Pending</Tag>}
          {r.free_from_htp ? <Tag color="cyan"><HeartOutlined /> No HTP</Tag> : null}
          {r.has_active_watershed_management ? <Tag color="blue">Watershed</Tag> : null}
        </Space>
      ) 
    },
    { 
      title: 'CBHI & Literacy', 
      key: 'rates', 
      width: 150,
      render: (_, r) => (
        <Space direction="vertical" style={{ width: '100%' }} size="small">
          <Tooltip title={`CBHI Coverage: ${r.cbhi_coverage_percentage}%`}>
            <Progress percent={r.cbhi_coverage_percentage} size="small" strokeColor="#52c41a" format={() => 'CBHI'} />
          </Tooltip>
          <Tooltip title={`Literacy: ${r.literacy_rate_percentage}%`}>
            <Progress percent={r.literacy_rate_percentage} size="small" />
          </Tooltip>
        </Space>
      ) 
    },
    { 
      title: 'Verification', 
      dataIndex: 'status', 
      key: 'approval_status', 
      align: 'center',
      render: (status) => {
        let color = status === 'Approved' ? 'green' : (status === 'Rejected' ? 'red' : 'orange');
        return <Tag color={color} style={{ fontWeight: 500, margin: 0 }}>{status || 'Pending'}</Tag>;
      }
    },
    { 
      title: 'Actions', key: 'actions', align: 'right', render: (_, r) => (
        <Space size="small">
          {/* NEW: View Button */}
          <Tooltip title="View Details">
            <Button 
              type="text" 
              icon={<EyeOutlined style={{ color: '#1890ff' }} />} 
              onClick={(e) => { e.stopPropagation(); onView(r); }} 
            />
          </Tooltip>
          
          {onApprove && (
            <Tooltip title="Verify Village Data">
              <Button type="text" icon={<AuditOutlined style={{ color: '#fa8c16' }} />} onClick={(e) => { e.stopPropagation(); onApprove(r); }} />
            </Tooltip>
          )}
          <EditButton onClick={() => onEdit(r)} />
          <DeleteButton onConfirm={() => onDelete(r.id)} itemName="record" />
        </Space>
      )
    }
  ];

  return <Table columns={columns} dataSource={data} rowKey="id" bordered pagination={{ pageSize: 10 }} />;
}