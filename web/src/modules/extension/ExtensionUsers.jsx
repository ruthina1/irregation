import React, { useState, useEffect, useMemo } from 'react';
import {
  App,
  Breadcrumb,
  Typography,
  Row,
  Col,
  Card,
  Statistic,
  Progress,
  Input,
  Select,
  Button,
  Space,
  Table,
  Tag,
  Modal,
  Spin,
  Alert
} from 'antd';
import {
  HomeOutlined,
  TeamOutlined,
  WomanOutlined,
  RiseOutlined,
  ShopOutlined,
  SearchOutlined,
  DownloadOutlined,
  ReloadOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  DatabaseOutlined
} from '@ant-design/icons';
import { farmerApi } from '../../services/api/farmerApi';

const { Title, Text } = Typography;
const { Option } = Select;

// Safely extract string names from either primitive values or nested relation objects
const extractName = (value, defaultVal = 'Unspecified') => {
  if (!value) return defaultVal;
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    return value.name || value.title || value.kebele_name || value.woreda_name || value.zone_name || defaultVal;
  }
  return String(value);
};

/* ==========================================================================
   SUB-COMPONENT: STATS KPI DECK
   ========================================================================== */
function ExtensionUserStats({ records = [] }) {
  const totalBeneficiaries = records.reduce(
    (acc, r) =>
      acc +
      (Number(r.male_heads) || 0) +
      (Number(r.female_heads) || 0) +
      (Number(r.married_women) || 0) +
      (Number(r.youth) || 0) +
      (Number(r.commercial) || 0),
    0
  );

  const maleHeads = records.reduce((acc, r) => acc + (Number(r.male_heads) || 0), 0);
  const femaleHeads = records.reduce((acc, r) => acc + (Number(r.female_heads) || 0), 0);
  const marriedWomen = records.reduce((acc, r) => acc + (Number(r.married_women) || 0), 0);
  const totalFemale = femaleHeads + marriedWomen;
  const youth = records.reduce((acc, r) => acc + (Number(r.youth) || 0), 0);
  const commercial = records.reduce((acc, r) => acc + (Number(r.commercial) || 0), 0);

  const femaleRatio = totalBeneficiaries > 0 ? ((totalFemale / totalBeneficiaries) * 100).toFixed(1) : 0;
  const youthRatio = totalBeneficiaries > 0 ? ((youth / totalBeneficiaries) * 100).toFixed(1) : 0;

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      {/* Total Beneficiaries Card */}
      <Col xs={24} sm={12} lg={6}>
        <Card
          bordered={false}
          style={{
            borderRadius: 8,
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            borderLeft: '4px solid #1a5f2c'
          }}
        >
          <Statistic
            title={<span style={{ fontWeight: 600, color: '#595959' }}>Total Extension Users</span>}
            value={totalBeneficiaries}
            prefix={<TeamOutlined style={{ color: '#1a5f2c', marginRight: 8 }} />}
            valueStyle={{ color: '#1a5f2c', fontWeight: 'bold', fontSize: 24 }}
          />
          <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
            Male Heads: <strong style={{ color: '#262626' }}>{maleHeads.toLocaleString()}</strong>
          </div>
        </Card>
      </Col>

      {/* Female Participation Card */}
      <Col xs={24} sm={12} lg={6}>
        <Card
          bordered={false}
          style={{
            borderRadius: 8,
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            borderLeft: '4px solid #722ed1'
          }}
        >
          <Statistic
            title={<span style={{ fontWeight: 600, color: '#595959' }}>Female Participation</span>}
            value={totalFemale}
            prefix={<WomanOutlined style={{ color: '#722ed1', marginRight: 8 }} />}
            valueStyle={{ color: '#722ed1', fontWeight: 'bold', fontSize: 24 }}
          />
          <div style={{ marginTop: 4 }}>
            <Progress
              percent={Number(femaleRatio)}
              size="small"
              strokeColor="#722ed1"
              showInfo={false}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8c8c8c', marginTop: 2 }}>
              <span>Ratio: <strong>{femaleRatio}%</strong></span>
              <span>Heads: {femaleHeads.toLocaleString()} | Married: {marriedWomen.toLocaleString()}</span>
            </div>
          </div>
        </Card>
      </Col>

      {/* Youth Farmers Card */}
      <Col xs={24} sm={12} lg={6}>
        <Card
          bordered={false}
          style={{
            borderRadius: 8,
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            borderLeft: '4px solid #fa8c16'
          }}
        >
          <Statistic
            title={<span style={{ fontWeight: 600, color: '#595959' }}>Youth Beneficiaries</span>}
            value={youth}
            prefix={<RiseOutlined style={{ color: '#fa8c16', marginRight: 8 }} />}
            valueStyle={{ color: '#fa8c16', fontWeight: 'bold', fontSize: 24 }}
          />
          <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
            Share of reach: <strong style={{ color: '#262626' }}>{youthRatio}%</strong>
          </div>
        </Card>
      </Col>

      {/* Commercial Investors Card */}
      <Col xs={24} sm={12} lg={6}>
        <Card
          bordered={false}
          style={{
            borderRadius: 8,
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            borderLeft: '4px solid #1890ff'
          }}
        >
          <Statistic
            title={<span style={{ fontWeight: 600, color: '#595959' }}>Investors (ባለሃብቶች)</span>}
            value={commercial}
            prefix={<ShopOutlined style={{ color: '#1890ff', marginRight: 8 }} />}
            valueStyle={{ color: '#1890ff', fontWeight: 'bold', fontSize: 24 }}
          />
          <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
            Active Jurisdictions: <strong style={{ color: '#262626' }}>{records.length}</strong>
          </div>
        </Card>
      </Col>
    </Row>
  );
}

/* ==========================================================================
   MAIN COMPONENT LOGIC
   ========================================================================== */
function ExtensionUsersContent() {
  const { message } = App.useApp();
  const [rawFarmers, setRawFarmers] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [zoneFilter, setZoneFilter] = useState(null);

  const [selectedKebeleRecord, setSelectedKebeleRecord] = useState(null);
  const [isInspectModalOpen, setIsInspectModalOpen] = useState(false);

  const loadFarmerDatabase = async () => {
    setIsFetching(true);
    try {
      const response = await farmerApi.getFarmers();
      const farmerList = response?.data?.data?.data || response?.data?.data || response?.data || [];
      setRawFarmers(Array.isArray(farmerList) ? farmerList : []);
      message.success(`Synchronized ${farmerList.length} profiles from Farmer Registry`);
    } catch (error) {
      message.error(error.message || 'Failed to fetch Farmer Database');
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    loadFarmerDatabase();
  }, []);

  // Aggregation Engine mapping farmer profiles into Indicator 1.2
  const aggregatedRecords = useMemo(() => {
    const registryMap = {};

    rawFarmers.forEach((farmer) => {
      const kebele = extractName(farmer.kebele, 'Unspecified Kebele');
      const woreda = extractName(farmer.woreda || farmer.kebele?.woreda, 'Unspecified Woreda');
      const zone = extractName(farmer.zone || farmer.woreda?.zone || farmer.kebele?.woreda?.zone, 'Unspecified Zone');

      const key = `${zone}___${woreda}___${kebele}`;

      if (!registryMap[key]) {
        registryMap[key] = {
          id: key,
          zone,
          woreda,
          kebele,
          male_heads: 0,
          female_heads: 0,
          married_women: 0,
          youth: 0,
          commercial: 0,
          rawList: []
        };
      }

      registryMap[key].rawList.push(farmer);

      const farmerTypeStr = extractName(farmer.farmer_type, '').toLowerCase();
      // Classify as investor when farmer_type is 'investor' or 'commercial'
      const isInvestor =
        farmerTypeStr === 'investor' ||
        farmerTypeStr.includes('investor') ||
        farmerTypeStr.includes('commercial') ||
        Boolean(farmer.is_investor);

      const gender = (farmer.gender || '').toLowerCase();
      const maritalStatus = (farmer.marital_status || '').toLowerCase();
      const isHead = Boolean(farmer.head_of_household);
      const isYouth =
        Boolean(farmer.is_youth) ||
        (Number(farmer.age) > 0 && Number(farmer.age) <= 29);

      if (isInvestor) {
        registryMap[key].commercial += 1;
      } else if (gender === 'male' || gender === 'm') {
        registryMap[key].male_heads += 1;
      } else if (gender === 'female' || gender === 'f') {
        if (maritalStatus === 'married' && !isHead) {
          registryMap[key].married_women += 1;
        } else {
          registryMap[key].female_heads += 1;
        }
      }

      if (isYouth) {
        registryMap[key].youth += 1;
      }
    });

    return Object.values(registryMap);
  }, [rawFarmers]);

  const filteredRecords = useMemo(() => {
    return aggregatedRecords.filter((record) => {
      const matchesSearch =
        record.woreda.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.kebele.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.zone.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesZone = zoneFilter ? record.zone === zoneFilter : true;
      return matchesSearch && matchesZone;
    });
  }, [aggregatedRecords, searchTerm, zoneFilter]);

  const exportToCSV = () => {
    if (!filteredRecords.length) {
      message.warning('No records available to export');
      return;
    }
    const headers = [
      'Zone',
      'Woreda',
      'Kebele',
      'Male Heads (አባወራ)',
      'Female Heads (እማወራ)',
      'Married Women (ባለትዳር ሴቶች)',
      'Youth (ወጣቶች)',
      'Investors (ባለሃብቶች)',
      'Subtotal'
    ];
    const rows = filteredRecords.map((r) => {
      const sub = r.male_heads + r.female_heads + r.married_women + r.youth + r.commercial;
      return [
        `"${r.zone}"`,
        `"${r.woreda}"`,
        `"${r.kebele}"`,
        r.male_heads,
        r.female_heads,
        r.married_women,
        r.youth,
        r.commercial,
        sub
      ].join(',');
    });
    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Indicator_1_2_Extension_Beneficiaries_${Date.now()}.csv`;
    link.click();
    message.success('Report exported successfully');
  };

  const columns = [
    {
      title: 'Jurisdiction Level',
      key: 'admin_level',
      width: 220,
      render: (_, r) => (
        <div>
          <span style={{ fontWeight: 600, color: '#1a5f2c' }}>{String(r.kebele)}</span>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>
            {String(r.zone)} &gt; {String(r.woreda)}
          </div>
        </div>
      )
    },
    {
      title: 'Male Heads (አባወራ)',
      dataIndex: 'male_heads',
      key: 'male_heads',
      align: 'right',
      sorter: (a, b) => a.male_heads - b.male_heads,
      render: (val) => Number(val || 0).toLocaleString()
    },
    {
      title: 'Female Heads (እማወራ)',
      dataIndex: 'female_heads',
      key: 'female_heads',
      align: 'right',
      sorter: (a, b) => a.female_heads - b.female_heads,
      render: (val) => (
        <span style={{ color: '#722ed1', fontWeight: 500 }}>
          {Number(val || 0).toLocaleString()}
        </span>
      )
    },
    {
      title: 'Married Women (ባለትዳር)',
      dataIndex: 'married_women',
      key: 'married_women',
      align: 'right',
      sorter: (a, b) => a.married_women - b.married_women,
      render: (val) => (
        <span style={{ color: '#722ed1', fontWeight: 500 }}>
          {Number(val || 0).toLocaleString()}
        </span>
      )
    },
    {
      title: 'Youth (ወጣቶች)',
      dataIndex: 'youth',
      key: 'youth',
      align: 'right',
      sorter: (a, b) => a.youth - b.youth,
      render: (val) => (
        <span style={{ color: '#fa8c16', fontWeight: 500 }}>
          {Number(val || 0).toLocaleString()}
        </span>
      )
    },
    {
      title: 'Investors (ባለሃብቶች)',
      dataIndex: 'commercial',
      key: 'commercial',
      align: 'right',
      sorter: (a, b) => a.commercial - b.commercial,
      render: (val) => (
        <span style={{ color: '#1890ff', fontWeight: 500 }}>
          {Number(val || 0).toLocaleString()}
        </span>
      )
    },
    {
      title: 'Subtotal Reached',
      key: 'subtotal',
      align: 'right',
      render: (_, r) => {
        const sub = r.male_heads + r.female_heads + r.married_women + r.youth + r.commercial;
        return (
          <Tag color="green" style={{ fontWeight: 'bold' }}>
            {sub.toLocaleString()}
          </Tag>
        );
      }
    },
    {
      title: 'Registry Drilldown',
      key: 'actions',
      align: 'center',
      width: 130,
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => {
            setSelectedKebeleRecord(record);
            setIsInspectModalOpen(true);
          }}
        >
          View ({record.rawList.length})
        </Button>
      )
    }
  ];

  return (
    <div style={{ position: 'relative', minHeight: '100%', padding: 24, background: '#f8fafc' }}>
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item><HomeOutlined /></Breadcrumb.Item>
        <Breadcrumb.Item>Extension Communication & Digitalization</Breadcrumb.Item>
        <Breadcrumb.Item>Extension Beneficiaries & Users</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#1a5f2c', fontFamily: "'Times New Roman', Times, serif" }}>
            Extension Beneficiaries & Users (Indicator 1.2)
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Aggregated coverage metrics including registered smallholders and private agricultural investors
          </Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={loadFarmerDatabase} loading={isFetching}>
            Sync Database
          </Button>
          <Button icon={<DownloadOutlined />} onClick={exportToCSV}>
            Export Form 2019
          </Button>
        </Space>
      </div>

      <Alert
        message="Relational Database Pipeline Active"
        description="All extension metrics are calculated dynamically from the Farmer Registry. Smallholders and private investors (farmer_type === 'investor') are automatically classified according to MoA Indicator 1.2 specifications."
        type="info"
        showIcon
        icon={<DatabaseOutlined />}
        style={{ marginBottom: 20, borderRadius: 8 }}
      />

      <Spin spinning={isFetching} tip="Synchronizing database records...">
        <ExtensionUserStats records={filteredRecords} />

        <Card bordered={false} style={{ marginBottom: 16, borderRadius: 8 }} bodyStyle={{ padding: '12px 16px' }}>
          <Space wrap>
            <Input
              placeholder="Search Woreda or Kebele..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: 240 }}
              allowClear
            />
            <Select
              placeholder="Filter by Zone"
              value={zoneFilter}
              onChange={setZoneFilter}
              style={{ width: 200 }}
              allowClear
            >
              {[...new Set(aggregatedRecords.map((r) => r.zone))].map((zone) => (
                <Option key={zone} value={zone}>
                  {zone}
                </Option>
              ))}
            </Select>
          </Space>
        </Card>

        <Table
          columns={columns}
          dataSource={filteredRecords}
          rowKey="id"
          pagination={{ defaultPageSize: 10, showSizeChanger: true }}
          bordered
          size="middle"
        />
      </Spin>

      {/* Drill-down Inspection Modal */}
      <Modal
        title={
          <span>
            <DatabaseOutlined style={{ marginRight: 8, color: '#1a5f2c' }} />
            Underlying Farmers: {selectedKebeleRecord ? String(selectedKebeleRecord.kebele) : ''} (
            {selectedKebeleRecord ? String(selectedKebeleRecord.woreda) : ''})
          </span>
        }
        open={isInspectModalOpen}
        onCancel={() => setIsInspectModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsInspectModalOpen(false)}>
            Close
          </Button>
        ]}
        width={850}
      >
        <Table
          dataSource={selectedKebeleRecord?.rawList || []}
          rowKey={(r) => r.id || r.farmer_unique_id_no || Math.random()}
          size="small"
          pagination={{ pageSize: 5 }}
          columns={[
            {
              title: 'ID No.',
              dataIndex: 'farmer_unique_id_no',
              key: 'uid',
              render: (val) => String(val || 'N/A')
            },
            {
              title: 'Full Name',
              dataIndex: 'full_name',
              key: 'name',
              render: (val, r) => <strong>{String(val || `${r.first_name || ''} ${r.last_name || ''}`)}</strong>
            },
            {
              title: 'Gender',
              dataIndex: 'gender',
              key: 'gender',
              render: (val) => String(val || '-')
            },
            {
              title: 'Marital Status',
              dataIndex: 'marital_status',
              key: 'marital',
              render: (val) => String(val || '-')
            },
            {
              title: 'Head of Household',
              dataIndex: 'head_of_household',
              key: 'head',
              render: (v) => (v ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> : 'No')
            },
            {
              title: 'Type',
              dataIndex: 'farmer_type',
              key: 'type',
              render: (v) => {
                const typeName = extractName(v, 'Smallholder');
                const isInv = typeName.toLowerCase().includes('investor') || typeName.toLowerCase().includes('commercial');
                return <Tag color={isInv ? 'blue' : 'default'}>{typeName}</Tag>;
              }
            }
          ]}
        />
      </Modal>
    </div>
  );
}

export default function ExtensionUsers() {
  return (
    <App>
      <ExtensionUsersContent />
    </App>
  );
}