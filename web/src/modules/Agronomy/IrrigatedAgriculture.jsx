import React, { useState } from 'react';
import { Card, Row, Col, Statistic, Button, Table, Modal, Form, Input, Select, Tag, Space, message } from 'antd';
import { PlusOutlined, DownloadOutlined, EditOutlined, GoldOutlined, BugOutlined } from '@ant-design/icons';

const { Option } = Select;

const initialData = [
  { id: 'FARM-801', cluster: 'Mecha Block A', crop: 'Wheat', area: 150, expectedYield: 6000, status: 'Growing' },
  { id: 'FARM-802', cluster: 'Mecha Block B', crop: 'Onion', area: 45, expectedYield: 1200, status: 'Harvesting' },
  { id: 'FARM-803', cluster: 'Fogera Block C', crop: 'Rice', area: 300, expectedYield: 15000, status: 'Planted' },
];

export default function IrrigatedAgriculture() {
  const [data, setData] = useState(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleExport = () => {
    const csv = "data:text/csv;charset=utf-8," + ["ID,Cluster,Crop,Area (ha),Expected Yield (Qtl),Status"].concat(data.map(r => Object.values(r).join(","))).join("\n");
    const link = document.createElement("a"); link.href = encodeURI(csv); link.download = "Irrigated_Crops.csv"; link.click();
  };

  const handleSave = (values) => {
    setData([...data, { id: `FARM-${Math.floor(Math.random()*1000)}`, ...values }]);
    setIsModalOpen(false); message.success("Crop record added!");
  };

  const columns = [
    { title: 'Block/Cluster', dataIndex: 'cluster', key: 'cluster' },
    { title: 'Crop Type', dataIndex: 'crop', key: 'crop', render: v => <b>{v}</b> },
    { title: 'Area (ha)', dataIndex: 'area', key: 'area' },
    { title: 'Expected Yield (Qtl)', dataIndex: 'expectedYield', key: 'expectedYield' },
    { title: 'Status', dataIndex: 'status', key: 'status', render: val => <Tag color="green">{val}</Tag> },
  ];

  return (
    <div style={{ padding: 24, background: '#F8FAFC', minHeight: '100vh' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <h2><GoldOutlined style={{ color: '#D97706', marginRight: 8 }}/> Irrigated Agriculture & Production</h2>
        <Space>
          <Button type="primary" style={{background:'#D97706'}} onClick={() => setIsModalOpen(true)} icon={<PlusOutlined />}>Log Production</Button>
          <Button icon={<DownloadOutlined />} onClick={handleExport}>Export Data</Button>
        </Space>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={8}><Card><Statistic title="Total Irrigated Area (ha)" value={data.reduce((a,c)=>a+Number(c.area),0)} /></Card></Col>
        <Col span={8}><Card><Statistic title="Total Expected Yield (Qtl)" value={data.reduce((a,c)=>a+Number(c.expectedYield),0)} /></Card></Col>
        <Col span={8}><Card><Statistic title="Active Crop Clusters" value={data.length} /></Card></Col>
      </Row>

      <Card bordered={false}><Table columns={columns} dataSource={data} rowKey="id" /></Card>

      <Modal title="Log Production Area" open={isModalOpen} onCancel={() => setIsModalOpen(false)} onOk={() => form.submit()} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="cluster" label="Farm Cluster/Block" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="crop" label="Crop Type" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="area" label="Planted Area (ha)" rules={[{ required: true }]}><Input type="number" /></Form.Item>
          <Form.Item name="expectedYield" label="Expected Yield (Quintals)" rules={[{ required: true }]}><Input type="number" /></Form.Item>
          <Form.Item name="status" label="Growth Stage" rules={[{ required: true }]}><Select><Option value="Planted">Planted</Option><Option value="Growing">Growing</Option><Option value="Harvesting">Harvesting</Option></Select></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}