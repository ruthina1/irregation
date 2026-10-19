import React, { useState, useMemo } from 'react';
import {
  Table,
  Card,
  Row,
  Col,
  Input,
  Select,
  Button,
  Tag,
  Space,
  Typography,
  Statistic,
  Tooltip,
  Popconfirm,
  Badge,
  Modal,
  Form,
  InputNumber,
  Empty,
  Divider,
  message
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  GlobalOutlined,
  DownloadOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  CompassOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

// Standard administrative Zones across Amhara Regional State
const AMHARA_ZONES = [
  'South Gondar (ደቡብ ጎንደር)',
  'North Gondar (ሰሜን ጎንደር)',
  'Central Gondar (ማዕከላዊ ጎንደር)',
  'West Gondar (ምዕራብ ጎንደር)',
  'North Shewa (ሰሜን ሸዋ)',
  'South Wollo (ደቡብ ወሎ)',
  'North Wollo (ሰሜን ወሎ)',
  'West Gojjam (ምዕራብ ጎጃም)',
  'East Gojjam (ምሥራቅ ጎጃም)',
  'Awi (አዊ)',
  'Wag Hemra (ዋግ ኽምራ)',
  'Oromia Special (ኦሮሚያ ልዩ ዞን)'
];

export default function WatershedRegistry() {
  // Production state: starts empty
  const [records, setRecords] = useState([]);

  // Filter states
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedZone, setSelectedZone] = useState('ALL');
  const [selectedWoreda, setSelectedWoreda] = useState('ALL');
  const [selectedYear, setSelectedYear] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  // ───── DYNAMIC FILTER OPTIONS ─────
  const availableYears = useMemo(() => {
    const currentYear = dayjs().year();
    const yrs = Array.from(new Set(records.map((r) => r.start_year).filter(Boolean)));
    if (!yrs.includes(currentYear)) yrs.push(currentYear);
    return yrs.sort((a, b) => b - a);
  }, [records]);

  const woredaOptions = useMemo(() => {
    const scoped = selectedZone === 'ALL' ? records : records.filter((r) => r.zone === selectedZone);
    return Array.from(new Set(scoped.map((r) => r.woreda).filter(Boolean)));
  }, [records, selectedZone]);

  const handleZoneChange = (zone) => {
    setSelectedZone(zone);
    setSelectedWoreda('ALL');
  };

  // ───── AGGREGATE KPIS ─────
  const stats = useMemo(() => {
    const total = records.length;
    const existing = records.filter((r) => r.status === 'existing').length;
    const newlyAdded = records.filter((r) => r.status === 'new').length;
    const totalArea = records.reduce((acc, curr) => acc + (Number(curr.total_area_ha) || 0), 0);

    return { total, existing, newlyAdded, totalArea };
  }, [records]);

  // ───── FILTER LOGIC ─────
  const filteredRecords = useMemo(() => {
    return records.filter((item) => {
      const matchesSearch =
        (item.name && item.name.toLowerCase().includes(searchText.toLowerCase())) ||
        (item.code && item.code.toLowerCase().includes(searchText.toLowerCase())) ||
        (item.kebele && item.kebele.toLowerCase().includes(searchText.toLowerCase()));

      const matchesStatus = selectedStatus === 'ALL' || item.status === selectedStatus;
      const matchesZone = selectedZone === 'ALL' || item.zone === selectedZone;
      const matchesWoreda = selectedWoreda === 'ALL' || item.woreda === selectedWoreda;
      const matchesYear = selectedYear === 'ALL' || Number(item.start_year) === Number(selectedYear);

      return matchesSearch && matchesStatus && matchesZone && matchesWoreda && matchesYear;
    });
  }, [records, searchText, selectedStatus, selectedZone, selectedWoreda, selectedYear]);

  // ───── MODAL CRUD OPERATIONS ─────
  const openCreateModal = () => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({
      region: 'Amhara',
      zone: selectedZone !== 'ALL' ? selectedZone : undefined,
      woreda: selectedWoreda !== 'ALL' ? selectedWoreda : undefined,
      status: 'existing',
      start_year: selectedYear !== 'ALL' ? Number(selectedYear) : dayjs().year(),
      total_area_ha: 0,
      supporting_program: 'Regular Budget',
      latitude: undefined,
      longitude: undefined
    });
    setIsModalOpen(true);
  };

  const openEditModal = (record) => {
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
      latitude: record.location?.lat,
      longitude: record.location?.lng
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
    message.success('Watershed record removed from registry');
  };

  const handleModalSave = async () => {
    try {
      const values = await form.validateFields();
      const location = (values.latitude != null && values.longitude != null)
        ? { lat: Number(values.latitude), lng: Number(values.longitude) }
        : null;

      const recordPayload = {
        name: values.name,
        code: values.code,
        region: values.region || 'Amhara',
        zone: values.zone,
        woreda: values.woreda,
        kebele: values.kebele,
        status: values.status,
        total_area_ha: values.total_area_ha,
        start_year: values.start_year,
        supporting_program: values.supporting_program,
        location
      };

      if (editingRecord) {
        setRecords((prev) =>
          prev.map((r) => (r.id === editingRecord.id ? { ...editingRecord, ...recordPayload } : r))
        );
        message.success('Watershed registry updated successfully');
      } else {
        const newRecord = {
          ...recordPayload,
          id: `AMH-WS-${Date.now()}`
        };
        setRecords((prev) => [newRecord, ...prev]);
        message.success('New watershed successfully registered');
      }
      setIsModalOpen(false);
    } catch {
      message.error('Please verify the highlighted form fields');
    }
  };

  // ───── CSV EXPORT (WITH YEAR & GIS COORDINATES) ─────
  const handleExportCSV = () => {
    if (!filteredRecords.length) {
      message.warning('No records available to export');
      return;
    }

    const headers = [
      'Tefases Code',
      'Watershed Name',
      'Operational Status (4.1.2)',
      'Region',
      'Zone (ዞን)',
      'Woreda (ወረዳ)',
      'Kebele (ቀበሌ)',
      'Start Year (የጀመረበት ዓመት)',
      'Total Area (Ha)',
      'GIS Latitude (ሰሜን)',
      'GIS Longitude (ምሥራቅ)',
      'Supporting Program'
    ];

    const rows = filteredRecords.map((r) => [
      `"${r.code || ''}"`,
      `"${r.name || ''}"`,
      r.status === 'existing' ? 'ነባር (Existing)' : 'አዲስ (New)',
      `"${r.region || 'Amhara'}"`,
      `"${r.zone || ''}"`,
      `"${r.woreda || ''}"`,
      `"${r.kebele || ''}"`,
      r.start_year || '',
      r.total_area_ha || 0,
      r.location?.lat != null ? r.location.lat : '',
      r.location?.lng != null ? r.location.lng : '',
      `"${r.supporting_program || ''}"`
    ]);

    const metadata = [
      `# FDRE Ministry of Agriculture · Amhara Regional State`,
      `# Watershed Registry & Operational Units (Section 4.1 & 4.1.2)`,
      `# Export Timestamp: ${dayjs().format('YYYY-MM-DD HH:mm:ss')} EAT`,
      `# Filter Criteria: Year=${selectedYear}, Zone=${selectedZone}, Woreda=${selectedWoreda}, Status=${selectedStatus}`,
      ''
    ].join('\n');

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      metadata +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Amhara_Watershed_Registry_${selectedYear}_${dayjs().format('YYYY-MM-DD')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success('Watershed registry exported successfully');
  };

  // ───── TABLE COLUMNS ─────
  const columns = [
    {
      title: 'Code (መለያ)',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (text) => <Text strong style={{ color: '#164232' }}>{text}</Text>
    },
    {
      title: 'Tefases Name (የተፋሰስ ስም)',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <Text strong style={{ fontSize: '14px', display: 'block', color: '#0d281e' }}>{text}</Text>
          <Text type="secondary" style={{ fontSize: '11px' }}>
            <EnvironmentOutlined /> {record.zone} › {record.woreda} › {record.kebele}
          </Text>
        </div>
      )
    },
    {
      title: 'Status (4.1.2)',
      dataIndex: 'status',
      key: 'status',
      width: 145,
      render: (status) => {
        const isExisting = status === 'existing';
        return (
          <Tag
            icon={isExisting ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
            color={isExisting ? 'green' : 'gold'}
            style={{ borderRadius: '12px', padding: '2px 10px', fontWeight: 600 }}
          >
            {isExisting ? 'ነባር (Existing)' : 'አዲስ (New)'}
          </Tag>
        );
      }
    },
    {
      title: 'Year (ዓመት)',
      dataIndex: 'start_year',
      key: 'start_year',
      width: 110,
      align: 'center',
      sorter: (a, b) => (a.start_year || 0) - (b.start_year || 0),
      render: (val) => (
        <Tag color="#113324" style={{ color: '#88e0b0', border: '1px solid #256b46', fontWeight: 700 }}>
          {val ? `${val} E.C.` : '—'}
        </Tag>
      )
    },
    {
      title: 'Total Area (ስፋት)',
      dataIndex: 'total_area_ha',
      key: 'total_area_ha',
      width: 130,
      sorter: (a, b) => (a.total_area_ha || 0) - (b.total_area_ha || 0),
      render: (val) => (
        <span style={{ fontWeight: 600 }}>
          {Number(val || 0).toLocaleString()} <Text type="secondary">Ha</Text>
        </span>
      )
    },
    {
      title: 'Supporting Program',
      dataIndex: 'supporting_program',
      key: 'supporting_program',
      width: 160,
      render: (prog) =>
        prog ? <Tag color="blue">{prog}</Tag> : <Text type="secondary">Regular MoA</Text>
    },
    {
      title: 'GIS Coordinates',
      key: 'gis',
      width: 130,
      align: 'center',
      render: (_, record) => {
        if (record.location?.lat != null && record.location?.lng != null) {
          return (
            <Tooltip title={`Latitude: ${record.location.lat}, Longitude: ${record.location.lng}`}>
              <Tag icon={<GlobalOutlined />} color="cyan" style={{ cursor: 'pointer', fontWeight: 600 }}>
                Mapped
              </Tag>
            </Tooltip>
          );
        }
        return <Text type="secondary" style={{ fontSize: '11px' }}>Unpinned</Text>;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 110,
      align: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit Tefases Details & GIS">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: '#186e41' }} />}
              onClick={() => openEditModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to remove this catchment?"
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete(record.id)}
          >
            <Tooltip title="Delete">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{ paddingBottom: '24px' }}>
      {/* ───── PAGE TITLE BAR ───── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div>
          <Title level={3} style={{ margin: 0, color: '#0d281e', fontWeight: 700 }}>
            Amhara Region Watershed Registry (የተፋሰስ መዝገብ)
          </Title>
          <Text type="secondary" style={{ fontSize: '13px' }}>
            Section 4.1 & 4.1.2: Master Registry of Active Catchments & Soil-Water Conservation Units
          </Text>
        </div>
        <Space>
          <Button icon={<DownloadOutlined />} onClick={handleExportCSV}>
            Export Registry CSV
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{ background: '#164232', borderColor: '#164232' }}
            onClick={openCreateModal}
          >
            Register Tefases (ተፋሰስ መዝግብ)
          </Button>
        </Space>
      </div>

      {/* ───── KPI STATISTIC CARDS ───── */}
      <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)', borderRadius: '10px' }}>
            <Statistic
              title={<span style={{ fontSize: '12px', fontWeight: 600 }}>Total Catchments (ጠቅላላ ተፋሰሶች)</span>}
              value={stats.total}
              prefix={<span style={{ marginRight: '6px' }}>🏞️</span>}
              valueStyle={{ color: '#0d281e', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)', borderRadius: '10px' }}>
            <Statistic
              title={<span style={{ fontSize: '12px', fontWeight: 600 }}>Operational Area (ስፋት በሄክታር)</span>}
              value={stats.totalArea}
              suffix="Ha"
              valueStyle={{ color: '#164232', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)', borderRadius: '10px' }}>
            <Statistic
              title={<span style={{ fontSize: '12px', fontWeight: 600 }}>Existing Catchments (ነባር)</span>}
              value={stats.existing}
              valueStyle={{ color: '#186e41', fontWeight: 700 }}
              prefix={<Badge status="success" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)', borderRadius: '10px' }}>
            <Statistic
              title={<span style={{ fontSize: '12px', fontWeight: 600 }}>Newly Launched (አዲስ)</span>}
              value={stats.newlyAdded}
              valueStyle={{ color: '#d48806', fontWeight: 700 }}
              prefix={<Badge status="warning" />}
            />
          </Card>
        </Col>
      </Row>

      {/* ───── FILTER TOOLBAR & TABLE ───── */}
      <Card
        bordered={false}
        style={{
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          borderRadius: '10px'
        }}
      >
        <Row gutter={[12, 12]} style={{ marginBottom: '16px' }} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="Search by name, code, or kebele..."
              prefix={<SearchOutlined style={{ color: '#8aa396' }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>

          <Col xs={12} sm={6} md={4}>
            <Select
              value={selectedYear}
              onChange={setSelectedYear}
              style={{ width: '100%' }}
            >
              <Option value="ALL">All Years (ሁሉም ዓመታት)</Option>
              {availableYears.map((yr) => (
                <Option key={yr} value={yr}>{yr} E.C.</Option>
              ))}
            </Select>
          </Col>

          <Col xs={12} sm={6} md={4}>
            <Select
              value={selectedZone}
              onChange={handleZoneChange}
              style={{ width: '100%' }}
            >
              <Option value="ALL">All Zones (ሁሉም ዞኖች)</Option>
              {AMHARA_ZONES.map((z) => (
                <Option key={z} value={z}>{z}</Option>
              ))}
            </Select>
          </Col>

          <Col xs={12} sm={6} md={4}>
            <Select
              value={selectedWoreda}
              onChange={setSelectedWoreda}
              style={{ width: '100%' }}
              disabled={selectedZone === 'ALL' && woredaOptions.length === 0}
            >
              <Option value="ALL">All Woredas (ሁሉም ወረዳ)</Option>
              {woredaOptions.map((w) => (
                <Option key={w} value={w}>{w}</Option>
              ))}
            </Select>
          </Col>

          <Col xs={12} sm={6} md={3}>
            <Select
              value={selectedStatus}
              onChange={setSelectedStatus}
              style={{ width: '100%' }}
            >
              <Option value="ALL">All Statuses</Option>
              <Option value="existing">ነባር (Existing)</Option>
              <Option value="new">አዲስ (New)</Option>
            </Select>
          </Col>

          <Col xs={24} sm={12} md={3} style={{ textAlign: 'right' }}>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                setSearchText('');
                setSelectedStatus('ALL');
                setSelectedZone('ALL');
                setSelectedWoreda('ALL');
                setSelectedYear('ALL');
              }}
            >
              Reset
            </Button>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredRecords}
          rowKey="id"
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span>
                    No watersheds currently registered. Click <strong>"Register Tefases"</strong> to create the first record.
                  </span>
                }
              >
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={openCreateModal}
                  style={{ background: '#164232', borderColor: '#164232' }}
                >
                  Register First Watershed
                </Button>
              </Empty>
            )
          }}
          pagination={{
            pageSize: 8,
            showSizeChanger: true,
            pageSizeOptions: ['8', '16', '32'],
            showTotal: (total) => `Total ${total} watersheds registered`
          }}
        />
      </Card>

      {/* ───── ENTRY & EDIT MODAL (WITH GIS COORDINATES & YEAR) ───── */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>📋</span>
            <span style={{ fontWeight: 700, color: '#0d281e' }}>
              {editingRecord ? `Edit Tefases: ${editingRecord.name}` : 'Register New Tefases (አዲስ ተፋሰስ መዝግብ)'}
            </span>
          </div>
        }
        open={isModalOpen}
        onOk={handleModalSave}
        onCancel={() => setIsModalOpen(false)}
        width={720}
        destroyOnClose
        okText="Save to Registry"
        okButtonProps={{ style: { background: '#164232', borderColor: '#164232' } }}
      >
        <Form form={form} layout="vertical" style={{ marginTop: '16px' }}>
          {/* Catchment Identity */}
          <Row gutter={16}>
            <Col span={14}>
              <Form.Item
                name="name"
                label="Watershed / Tefases Name (የተፋሰሱ ስም)"
                rules={[{ required: true, message: 'Please provide catchment name' }]}
              >
                <Input placeholder="e.g. Ribb River Sub-Catchment" />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item
                name="code"
                label="Tefases Code (መለያ ቁጥር)"
                rules={[{ required: true, message: 'Please provide catchment code' }]}
              >
                <Input placeholder="e.g. WS-FOG-01" />
              </Form.Item>
            </Col>
          </Row>

          {/* Location Hierarchy */}
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="zone" label="Zone (ዞን)" rules={[{ required: true, message: 'Please select zone' }]}>
                <Select placeholder="Select zone">
                  {AMHARA_ZONES.map((z) => (
                    <Option key={z} value={z}>{z}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="woreda" label="Woreda (ወረዳ)" rules={[{ required: true, message: 'Please enter woreda' }]}>
                <Input placeholder="e.g. Fogera (ፎገራ)" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="kebele" label="Kebele (ቀበሌ)" rules={[{ required: true, message: 'Please enter kebele' }]}>
                <Input placeholder="e.g. Woreta Zuria" />
              </Form.Item>
            </Col>
          </Row>

          {/* Classification & Area */}
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="status" label="Status (4.1.2 ወደ ተግባር የገቡ)">
                <Select>
                  <Option value="existing">ነባር (Existing)</Option>
                  <Option value="new">አዲስ (New)</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="total_area_ha" label="Total Area (Ha)">
                <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="start_year" label="Start Year (የጀመረበት ዓመት)" rules={[{ required: true, message: 'Select year' }]}>
                <InputNumber style={{ width: '100%' }} min={1990} max={2040} placeholder="2026" />
              </Form.Item>
            </Col>
          </Row>

          {/* GIS Coordinates */}
          <Divider orientation="left" style={{ margin: '12px 0 16px', color: '#164232' }}>
            <CompassOutlined /> GIS Spatial Coordinates (የተፋሰስ መገኛ መጋጠሚያ)
          </Divider>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="latitude"
                label="Latitude / ሰሜን (Decimal Degrees)"
                tooltip="GPS coordinate (e.g., 11.9214 for Amhara region)"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  step={0.0001}
                  placeholder="e.g. 11.9214"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="longitude"
                label="Longitude / ምሥራቅ (Decimal Degrees)"
                tooltip="GPS coordinate (e.g., 37.6231 for Amhara region)"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  step={0.0001}
                  placeholder="e.g. 37.6231"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Funding Program */}
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="supporting_program" label="Supporting Program / Fund">
                <Input placeholder="e.g. CALM, RLLP, SLMP-II, Regular Budget" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}