import React from 'react';
import { Table, Tag, Space, Typography, Empty, Row, Col } from 'antd';
import { getActionColumn } from '../../../components/common/ActionButtonUI'; 

const { Text } = Typography;

export default function FtcTable({ data, loading, onEdit, onDelete, onView, onApprove }) {
  
  // ─── Columns Configuration ───
  const columns = [
    { 
      title: 'ID', 
      dataIndex: 'id', 
      key: 'id', 
      width: 70,
      render: (id) => <Text type="secondary" style={{ fontFamily: "monospace" }}>#{id}</Text>
    },
    { 
      title: 'FTC Details', 
      key: 'details',
      render: (_, record) => (
        <div style={{ lineHeight: '1.4' }}>
          <Text strong style={{ color: '#039c33', fontSize: 15 }}>{record.ftc_name}</Text>
          <br/>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Jurisdiction ID: {record.kebele_id}
          </Text>
        </div>
      )
    },
    {
      title: 'Approval Status',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (status) => {
        let color = 'orange'; // Default for Pending
        if (status === 'Approved') color = 'green';
        if (status === 'Rejected') color = 'red';
        return <Tag color={color} style={{ margin: 0, fontWeight: 500 }}>{status || 'Pending'}</Tag>;
      }
    },
    { 
      title: 'Capacity & Status', 
      key: 'capacity',
      render: (_, record) => {
        const capColors = { 
          'Advanced': '#039c33',      
          'Intermediate': '#2E75B6',  
          'Basic': '#F59E0B',         
          'Below Standard': '#DC2626' 
        };
        return (
          <Space direction="vertical" size={4}>
            <Tag color={capColors[record.capacity_level]} style={{ border: 'none', fontWeight: 500 }}>
              {record.capacity_level}
            </Tag>
            <Text type="secondary" style={{ fontSize: 12 }}>{record.construction_status}</Text>
          </Space>
        );
      }
    },
    { 
      title: 'Demo Land', 
      dataIndex: 'demo_land_ha', 
      key: 'demo_land_ha',
      align: 'center',
      render: (val) => <Text>{val ? `${val} Ha` : '-'}</Text>
    },
    { 
      title: 'Audit Status', 
      dataIndex: 'audit_status', 
      key: 'audit_status',
      align: 'center',
      render: (status) => (
        <Tag color={status === 'Audited' ? 'success' : 'default'} style={{ margin: 0 }}>
          {status}
        </Tag>
      )
    },

    // ─── Elegant One-Line Action Column ───
    getActionColumn({
      onView: (record) => onView(record),
      onEdit: (record) => onEdit(record),
      onDelete: (record) => onDelete(record.id),
      onApprove: (record) => onApprove(record),
      getItemName: (record) => record.ftc_name,
    })
  ];

  // ─── Professional Expandable Row Design ───
  const expandedRowRender = (record) => (
    <div style={{ padding: '16px 24px', backgroundColor: '#F8FAFC' }}>
      <Row gutter={24}>
        
        {/* ─── Card 1: Assets & Equipment ─── */}
        <Col span={12}>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <Text strong style={{ fontSize: 14 }}>Assets & Equipment</Text>
              <Tag style={styles.countTag}>{record.assets?.length || 0}</Tag>
            </div>
            
            <div style={styles.cardBody}>
              {(!record.assets || record.assets.length === 0) ? (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No assets registered" />
              ) : (
                record.assets.map((a, index) => (
                  <div key={a.id} style={{
                    ...styles.listItem, 
                    borderBottom: index === record.assets.length - 1 ? 'none' : '1px solid #f1f5f9'
                  }}>
                    <Text strong style={{ color: '#334155' }}>{a.asset_type}</Text>
                    <Space size="middle">
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Status: <span style={{ color: a.condition === 'Functional' ? '#039c33' : '#DC2626' }}>
                          {a.condition || 'Unknown'}
                        </span>
                      </Text>
                      <Tag color="default">Qty: {a.quantity}</Tag>
                    </Space>
                  </div>
                ))
              )}
            </div>
          </div>
        </Col>

        {/* ─── Card 2: Committee Members ─── */}
        <Col span={12}>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <Text strong style={{ fontSize: 14 }}>Committee Administration</Text>
              <Tag style={styles.countTag}>{record.committees?.length || 0}</Tag>
            </div>
            
            <div style={styles.cardBody}>
              {(!record.committees || record.committees.length === 0) ? (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No committee members assigned" />
              ) : (
                record.committees.map((c, index) => (
                  <div key={c.id} style={{
                    ...styles.listItem, 
                    borderBottom: index === record.committees.length - 1 ? 'none' : '1px solid #f1f5f9'
                  }}>
                    <div>
                      <Text strong style={{ color: '#334155', display: 'block' }}>{c.full_name}</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>{c.phone_number || 'No Phone'}</Text>
                    </div>
                    <Tag color="blue" style={{ border: 'none', background: '#E0F2FE', color: '#0369A1' }}>
                      {c.role_in_committee || 'Member'}
                    </Tag>
                  </div>
                ))
              )}
            </div>
          </div>
        </Col>

      </Row>
    </div>
  );

  return (
    <Table 
      columns={columns} 
      dataSource={data} 
      rowKey="id" 
      loading={loading}
      expandable={{ 
        expandedRowRender,
        expandRowByClick: true,
      }}
      bordered
      size="middle"
      rowClassName={() => 'custom-table-row'}
    />
  );
}

const styles = {
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    borderTop: '3px solid #039c33',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
    overflow: 'hidden',
    height: '100%',
  },
  cardHeader: {
    padding: '12px 16px',
    backgroundColor: '#F8FAFC',
    borderBottom: '1px solid #E2E8F0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardBody: {
    padding: '8px 16px',
  },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
  },
  countTag: {
    margin: 0,
    borderRadius: '12px',
    backgroundColor: '#E2E8F0',
    color: '#475569',
    border: 'none',
    fontWeight: 'bold',
  }
};