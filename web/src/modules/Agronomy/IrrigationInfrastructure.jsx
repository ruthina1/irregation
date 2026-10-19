import React, { useState } from 'react';
import { Card, Row, Col, Statistic, Button, Table, Modal, Form, Input, Select, Tag, Space, message } from 'antd';
import { PlusOutlined, DownloadOutlined, ToolOutlined, SafetyCertificateOutlined } from '@ant-design/icons';

const { Option } = Select;

const initialData = [
  { id: 'INF-001', type: 'Main Canal', location: 'Koga Dam North', condition: 'Good', lastInspected: '2026-08-10' },
  { id: 'INF-002', type: 'Water Pump (Diesel)', location: 'Tana Beles Sector 4', condition: 'Critical', lastInspected: '2026-08-12' },
  { id: 'INF-003', type: 'Sluice Gate', location: 'Ribb Diversion Point A', condition: 'Fair', lastInspected: '2026-08-15' },
];

export default function IrrigationInfrastructure() {
  const [data, setData] = useState(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleExport = () => {
    const csv = "data:text/csv;charset=utf-8," + ["ID,Asset Type,Location,Condition,Last Inspected"].concat(data.map(r => Object.values(r).join(","))).join("\n");
    const link = document.createElement("a"); link.href = encodeURI(csv); link.download = "Infrastructure_Assets.csv"; link.click();
  };

  const handleSave = (values) => {
    setData([...data, { id: `INF-00${data.length + 1}`, ...values, lastInspected: new Date().toISOString().split('T')[0] }]);
    setIsModalOpen(false); message.success("Asset added!");
  };

  const columns = [
    { title: 'Asset ID', dataIndex: 'id', key: 'id' },
    { title: 'Asset Type', dataIndex: 'type', key: 'type', render: v => <b>{v}</b> },
    { title: 'Location', dataIndex: 'location', key: 'location' },
    { title: 'Last Inspected', dataIndex: 'lastInspected', key: 'lastInspected' },
    { title: 'Condition', dataIndex: 'condition', key: 'condition', render: val => (
      <Tag color={val === 'Good' ? 'green' : val === 'Fair' ? 'blue' : 'red'}>{val}</Tag>
    )},
  ];

  return (
    <div style={{ padding: 24, background: '#F8FAFC', minHeight: '100vh' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <h2><SafetyCertificateOutlined style={{ color: '#4F46E5', marginRight: 8 }}/> Infrastructure Asset Registry</h2>
        <Space>
          <Button type="primary" style={{background:'#4F46E5'}} onClick={() => setIsModalOpen(true)} icon={<PlusOutlined />}>Add Asset</Button>
          <Button icon={<DownloadOutlined />} onClick={handleExport}>Export</Button>
        </Space>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={8}><Card><Statistic title="Total Registered Assets" value={data.length} /></Card></Col>
        <Col span={8}><Card><Statistic title="Assets in Good Condition" value={data.filter(d=>d.condition==='Good').length} valueStyle={{ color: '#059669' }} /></Card></Col>
        <Col span={8}><Card><Statistic title="Critical Assets (Needs Repair)" value={data.filter(d=>d.condition==='Critical').length} valueStyle={{ color: '#DC2626' }} /></Card></Col>
      </Row>

      <Card bordered={false}><Table columns={columns} dataSource={data} rowKey="id" /></Card>

      <Modal title="Register Infrastructure Asset" open={isModalOpen} onCancel={() => setIsModalOpen(false)} onOk={() => form.submit()} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="type" label="Asset Type" rules={[{ required: true }]}><Input placeholder="e.g., Water Pump, Canal, Gate" /></Form.Item>
          <Form.Item name="location" label="Location Details" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="condition" label="Current Condition" rules={[{ required: true }]}>
            <Select><Option value="Good">Good</Option><Option value="Fair">Fair</Option><Option value="Critical">Critical</Option></Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}