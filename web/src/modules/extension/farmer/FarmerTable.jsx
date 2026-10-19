import React, { useState } from 'react';
import {
  Table,
  Tag,
  Space,
  Tooltip,
  Button,
  Modal,
  Descriptions,
  Tabs,
  Card,
  Row,
  Col,
  Statistic
} from 'antd';
import {
  EnvironmentOutlined,
  MobileOutlined,
  AuditOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  TeamOutlined,
  IdcardOutlined,
  PhoneOutlined
} from '@ant-design/icons';
import { EditButton, DeleteButton } from '../../../components/common/ActionButtons';

const { TabPane } = Tabs;

// Helper to safely extract clean string names from primitives or nested ORM relation objects
const extractName = (value, defaultVal = 'N/A') => {
  if (!value) return defaultVal;
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    return value.name || value.title || value.kebele_name || value.woreda_name || value.zone_name || defaultVal;
  }
  return String(value);
};

export default function FarmerTable({ data, onEdit, onDelete, onApprove }) {
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const handleViewDetails = (record) => {
    setSelectedFarmer(record);
    setIsDetailModalOpen(true);
  };

  // Helper for approval status badge styling
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return <Tag color="success" icon={<CheckCircleOutlined />}>Approved</Tag>;
      case 'Rejected':
        return <Tag color="error" icon={<CloseCircleOutlined />}>Rejected</Tag>;
      default:
        return <Tag color="warning" icon={<ClockCircleOutlined />}>Pending</Tag>;
    }
  };

  const columns = [
    {
      title: 'Farmer Info',
      key: 'info',
      width: 220,
      render: (_, r) => (
        <div>
          <strong style={{ color: '#1a5f2c', fontSize: 13 }}>
            {extractName(r.full_name, `${r.first_name || ''} ${r.last_name || ''}`)}
          </strong>
          <div style={{ fontSize: 12, color: '#666' }}>
            ID: <span style={{ fontFamily: 'monospace' }}>{extractName(r.farmer_unique_id_no, 'N/A')}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Demographics & Role',
      key: 'demographics',
      width: 210,
      render: (_, r) => {
        const gender = extractName(r.gender, '-');
        const age = r.age ? `${r.age} yrs` : '';
        const marital = extractName(r.marital_status, '');
        const isHead = Boolean(r.head_of_household);
        const isYouth = Boolean(r.is_youth) || (Number(r.age) > 0 && Number(r.age) <= 29);

        return (
          <div style={{ fontSize: 12 }}>
            <div>
              <strong>{gender}</strong>{age ? `, ${age}` : ''} {marital ? `(${marital})` : ''}
            </div>
            <div style={{ fontSize: 11, color: isHead ? '#1a5f2c' : '#722ed1', fontWeight: 500 }}>
              {isHead ? 'Head of Household (አባወራ/እማወራ)' : 'Spouse / Married (ባለትዳር)'}
            </div>
            {isYouth && <Tag color="orange" style={{ marginTop: 2, fontSize: 10 }}>Youth Smallholder</Tag>}
          </div>
        );
      },
    },
    {
      title: 'Type',
      dataIndex: 'farmer_type',
      key: 'farmer_type',
      width: 140,
      render: (type) => {
        const typeStr = extractName(type, 'Smallholder');
        const isInvestor = typeStr.toLowerCase().includes('investor') || typeStr.toLowerCase().includes('commercial');
        const isModel = typeStr.toLowerCase().includes('model');
        return (
          <Tag color={isInvestor ? 'blue' : isModel ? 'gold' : 'green'}>
            {typeStr}
          </Tag>
        );
      },
    },
    {
      title: 'Kebele',
      key: 'location',
      width: 180,
      render: (_, r) => {
        const kebele = extractName(r.kebele);
        const woreda = extractName(r.woreda || r.kebele?.woreda);
        const zone = extractName(r.zone || r.woreda?.zone || r.kebele?.woreda?.zone);

        return (
          <Tooltip title={`${zone} > ${woreda}`}>
            <span>
              <EnvironmentOutlined style={{ color: '#8c8c8c', marginRight: 4 }} />
              {kebele}
            </span>
          </Tooltip>
        );
      },
    },
    {
      title: 'Contact',
      key: 'contact',
      width: 140,
      render: (_, r) => {
        const phone = r.phone_number || (r.has_mobile_phone ? 'Yes' : null);
        return phone ? (
          <span style={{ fontSize: 12, fontFamily: 'monospace' }}>
            <MobileOutlined style={{ color: '#1a5f2c', marginRight: 4 }} />
            {r.phone_number || 'Mobile Registered'}
          </span>
        ) : (
          <span style={{ color: '#bfbfbf', fontSize: 11 }}>No Mobile</span>
        );
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      width: 120,
      render: (status, record) => (
        <Tooltip title="Click to process approval">
          <span onClick={() => onApprove(record)} style={{ cursor: 'pointer' }}>
            {getStatusBadge(status)}
          </span>
        </Tooltip>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'center',
      fixed: 'right',
      width: 160,
      render: (_, record) => (
        <Space size="small" align="center">
          {/* Quick Details View */}
          <Tooltip title="View Comprehensive Dossier">
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: '#1890ff' }} />}
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>

          {/* Process Approval Button */}
          <Tooltip title="Process Approval">
            <Button 
              type="text" 
              icon={<AuditOutlined style={{ color: '#fa8c16' }} />} 
              onClick={() => onApprove(record)} 
            />
          </Tooltip>

          <EditButton onClick={() => onEdit(record)} tooltip="Edit Farmer Profile" />
          <DeleteButton onConfirm={() => onDelete(record.id)} itemName="this farmer record" />
        </Space>
      ),
    }
  ];

  return (
    <>
      <Table
        columns={columns}
        dataSource={data}
        rowKey={(r) => r.id || r.farmer_unique_id_no || Math.random()}
        pagination={{ pageSize: 10, showSizeChanger: true }}
        scroll={{ x: 1100 }}
        size="middle"
        bordered
      />

      {/* PROFESSIONAL MULTI-TAB VIEW DETAILS MODAL */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  backgroundColor: '#e6f7ed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#1a5f2c',
                  fontSize: 18
                }}
              >
                <IdcardOutlined />
              </div>
              <div>
                <span style={{ fontSize: 16, fontWeight: 'bold', color: '#1a5f2c' }}>
                  {extractName(selectedFarmer?.full_name)}
                </span>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                  Unique ID: {extractName(selectedFarmer?.farmer_unique_id_no)}
                </div>
              </div>
            </div>
            <div>{getStatusBadge(selectedFarmer?.status)}</div>
          </div>
        }
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={[
          <Button
            key="approve"
            icon={<AuditOutlined />}
            style={{ borderColor: '#fa8c16', color: '#fa8c16' }}
            onClick={() => {
              setIsDetailModalOpen(false);
              onApprove(selectedFarmer);
            }}
          >
            Process Approval
          </Button>,
          <Button
            key="edit"
            type="default"
            onClick={() => {
              setIsDetailModalOpen(false);
              onEdit(selectedFarmer);
            }}
          >
            Edit Record
          </Button>,
          <Button
            key="close"
            type="primary"
            onClick={() => setIsDetailModalOpen(false)}
            style={{ backgroundColor: '#1a5f2c', borderColor: '#1a5f2c' }}
          >
            Done
          </Button>
        ]}
        width={820}
        destroyOnClose
      >
        {selectedFarmer && (
          <div style={{ paddingTop: 8 }}>
            {/* Quick KPI Overview Bar */}
            <Row gutter={12} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f6ffed', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Household Role</span>}
                    value={selectedFarmer.head_of_household ? 'Head (አባወራ)' : 'Spouse (ባለትዳር)'}
                    valueStyle={{ fontSize: 14, fontWeight: 'bold', color: '#1a5f2c' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f0f5ff', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Classification</span>}
                    value={extractName(selectedFarmer.farmer_type, 'Smallholder')}
                    valueStyle={{ fontSize: 14, fontWeight: 'bold', color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#fff7e6', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Age Cohort</span>}
                    value={
                      selectedFarmer.is_youth || (Number(selectedFarmer.age) > 0 && Number(selectedFarmer.age) <= 29)
                        ? 'Youth (<30)'
                        : 'Senior (>29)'
                    }
                    valueStyle={{ fontSize: 14, fontWeight: 'bold', color: '#fa8c16' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ background: '#f9f0ff', borderRadius: 6 }}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#595959' }}>Disability Need</span>}
                    value={selectedFarmer.has_disability || selectedFarmer.disability_type ? 'Special Support' : 'None'}
                    valueStyle={{ fontSize: 14, fontWeight: 'bold', color: '#722ed1' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* TABPANE CONTAINER */}
            <Tabs defaultActiveKey="1" type="card">
              {/* TAB 1: Profile & Demographics */}
              <TabPane
                tab={
                  <span>
                    <UserOutlined />
                    Profile & Demographics
                  </span>
                }
                key="1"
              >
                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
                  <Descriptions.Item label="Full Legal Name">
                    <strong>{extractName(selectedFarmer.full_name)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Unique ID No.">
                    <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                      {extractName(selectedFarmer.farmer_unique_id_no)}
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Gender">
                    {extractName(selectedFarmer.gender)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Age">
                    {selectedFarmer.age ? `${selectedFarmer.age} years` : 'Unrecorded'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Marital Status">
                    {extractName(selectedFarmer.marital_status)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Head of Household">
                    {selectedFarmer.head_of_household ? (
                      <Tag color="success" icon={<CheckCircleOutlined />}>
                        Yes (Legally Registered Head)
                      </Tag>
                    ) : (
                      <Tag color="purple">Spouse / Dependent (ባለትዳር ሴት)</Tag>
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Youth Smallholder">
                    {selectedFarmer.is_youth || (Number(selectedFarmer.age) > 0 && Number(selectedFarmer.age) <= 29) ? (
                      <Tag color="orange">Yes (Youth Program Target)</Tag>
                    ) : (
                      'Standard Category'
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Primary Farm Activity">
                    <Tag color="cyan">{extractName(selectedFarmer.farmer_type, 'Smallholder')}</Tag>
                  </Descriptions.Item>
                </Descriptions>
              </TabPane>

              {/* TAB 2: Communication, Cooperative & Inclusion */}
              <TabPane
                tab={
                  <span>
                    <PhoneOutlined />
                    Connectivity & Inclusion
                  </span>
                }
                key="2"
              >
                <Descriptions bordered size="small" column={1}>
                  <Descriptions.Item label="Mobile Phone Connectivity">
                    {selectedFarmer.phone_number || selectedFarmer.has_mobile_phone ? (
                      <Space orientation="horizontal">
                        <Tag color="green" icon={<MobileOutlined />}>Active Mobile Holder</Tag>
                        <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#1a5f2c' }}>
                          {selectedFarmer.phone_number || 'Mobile active (Number omitted)'}
                        </span>
                      </Space>
                    ) : (
                      <Tag color="default">No Mobile Phone Registered</Tag>
                    )}
                  </Descriptions.Item>

                  <Descriptions.Item label="Agricultural Cooperative Membership">
                    {selectedFarmer.cooperative || selectedFarmer.is_cooperative_member ? (
                      <div>
                        <Tag color="blue" icon={<TeamOutlined />}>Member</Tag>
                        <strong style={{ color: '#262626', marginLeft: 6 }}>
                          {extractName(selectedFarmer.cooperative, 'Primary Co-op / Union Registered')}
                        </strong>
                      </div>
                    ) : (
                      <span style={{ color: '#8c8c8c' }}>Not enrolled in a cooperative society</span>
                    )}
                  </Descriptions.Item>

                  <Descriptions.Item label="Disability & Special Accessibility Needs">
                    {selectedFarmer.has_disability || selectedFarmer.disability_type ? (
                      <div>
                        <Tag color="magenta">Assisted Support Required</Tag>
                        <span style={{ fontWeight: 600, marginLeft: 6 }}>
                          {extractName(selectedFarmer.disability_type, 'General Accessibility Need')}
                        </span>
                      </div>
                    ) : (
                      <span style={{ color: '#8c8c8c' }}>None reported / No special accommodations needed</span>
                    )}
                  </Descriptions.Item>
                </Descriptions>
              </TabPane>

              {/* TAB 3: Geographic Station & System Audit */}
              <TabPane
                tab={
                  <span>
                    <EnvironmentOutlined />
                    Station & Audit
                  </span>
                }
                key="3"
              >
                <Descriptions bordered size="small" column={{ xs: 1, sm: 3 }} style={{ marginBottom: 16 }}>
                  <Descriptions.Item label="Zone">
                    <strong>
                      {extractName(selectedFarmer.zone || selectedFarmer.woreda?.zone || selectedFarmer.kebele?.woreda?.zone)}
                    </strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Woreda">
                    <strong>
                      {extractName(selectedFarmer.woreda || selectedFarmer.kebele?.woreda)}
                    </strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Kebele">
                    <span style={{ color: '#1a5f2c', fontWeight: 'bold' }}>
                      {extractName(selectedFarmer.kebele)}
                    </span>
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
                  <Descriptions.Item label="Registry Record ID">
                    <span style={{ fontFamily: 'monospace' }}>{selectedFarmer.id || 'SYS-AUTO'}</span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Approval Status">
                    {getStatusBadge(selectedFarmer.status)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Created At">
                    {selectedFarmer.created_at ? new Date(selectedFarmer.created_at).toLocaleString() : 'System Default'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Last Updated">
                    {selectedFarmer.updated_at ? new Date(selectedFarmer.updated_at).toLocaleString() : 'Live Synced'}
                  </Descriptions.Item>
                </Descriptions>
              </TabPane>
            </Tabs>
          </div>
        )}
      </Modal>
    </>
  );
}