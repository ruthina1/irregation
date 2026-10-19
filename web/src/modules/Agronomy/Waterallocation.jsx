import React, { useState } from 'react';
import { Card, Row, Col, Statistic, Button, Table, Modal, Form, Input, Select, Tag, Space, message, DatePicker } from 'antd';
import { PlusOutlined, DownloadOutlined, EditOutlined, DeleteOutlined, DashboardOutlined, FieldTimeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;

const initialData = [
  { id: 'ALLOC-101', scheme: 'Koga Irrigation Dam', wua: 'WUA-Mecha-01', volume: 450000, startDate: '2026-09-01', status: 'Allocated' },
  { id: 'ALLOC-102', scheme: 'Koga Irrigation Dam', wua: 'WUA-Mecha-02', volume: 320000, startDate: '2026-09-15', status: 'Pending' },
  { id: 'ALLOC-103', scheme: 'Beles Groundwater', wua: 'WUA-Jawi-01', volume: 85000, startDate: '2026-08-20', status: 'Consumed' },
];

export default function WaterAllocation() {
  const [data, setData] = useState(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  const handleExport = () => {
    const csv = "data:text/csv;charset=utf-8," + ["ID,Scheme,WUA,Volume (m3),Start Date,Status"].concat(data.map(r => `${r.id},${r.scheme},${r.wua},${r.volume},${r.startDate},${r.status}`)).join("\n");
    const link = document.createElement("a"); link.href = encodeURI(csv); link.download = "Water_Allocations.csv"; link.click();
  };

  const handleSave = (values) => {
    const formatted = { ...values, startDate: values.startDate.format('YYYY-MM-DD') };
    if (editingRecord) setData(data.map(item => item.id === editingRecord.id ? { ...editingRecord, ...formatted } : item));
    else setData([...data, { id: `ALLOC-${Math.floor(Math.random()*1000)}`, ...formatted }]);
    setIsModalOpen(false); message.success("Allocation saved!");
  };

  const columns = [
    { title: 'Allocation ID', dataIndex: 'id', key: 'id' },
    { title: 'Scheme', dataIndex: 'scheme', key: 'scheme' },
    { title: 'Water User Assoc.', dataIndex: 'wua', key: 'wua' },
    { title: 'Volume (m³)', dataIndex: 'volume', key: 'volume', render: v => v.toLocaleString() },
    { title: 'Release Date', dataIndex: 'startDate', key: 'startDate' },
    { title: 'Status', dataIndex: 'status', key: 'status', render: val => (
      <Tag color={val === 'Allocated' ? 'blue' : val === 'Consumed' ? 'green' : 'orange'}>{val}</Tag>
    )},
    { title: 'Action', key: 'actions', render: (_, r) => (
      <Space><Button type="link" onClick={() => { setEditingRecord(r); form.setFieldsValue({...r, startDate: dayjs(r.startDate)}); setIsModalOpen(true); }} icon={<EditOutlined/>}/></Space>
    )}
  ];

  return (
    <div style={{ padding: 24, background: '#F8FAFC', minHeight: '100vh' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <h2><DashboardOutlined style={{ color: '#2563EB', marginRight: 8 }}/> Water Allocation & Scheduling</h2>
        <Space>
          <Button type="primary" onClick={() => { setEditingRecord(null); form.resetFields(); setIsModalOpen(true); }} icon={<PlusOutlined />}>New Allocation</Button>
          <Button icon={<DownloadOutlined />} onClick={handleExport}>Export</Button>
        </Space>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={8}><Card><Statistic title="Total Allocated (m³)" value={data.reduce((a,c)=>a+Number(c.volume),0)} /></Card></Col>
        <Col span={8}><Card><Statistic title="Active Allocations" value={data.filter(d=>d.status==='Allocated').length} valueStyle={{ color: '#2563EB' }} /></Card></Col>
        <Col span={8}><Card><Statistic title="Pending Requests" value={data.filter(d=>d.status==='Pending').length} valueStyle={{ color: '#D97706' }} /></Card></Col>
      </Row>

      <Card bordered={false}><Table columns={columns} dataSource={data} rowKey="id" /></Card>
      <Modal title="Allocation Form" open={isModalOpen} onCancel={() => setIsModalOpen(false)} onOk={() => form.submit()} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="scheme" label="Irrigation Scheme" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="wua" label="Water User Association" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="volume" label="Volume (m³)" rules={[{ required: true }]}><Input type="number" /></Form.Item>
          <Form.Item name="startDate" label="Release Date" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true }]}><Select><Option value="Pending">Pending</Option><Option value="Allocated">Allocated</Option><Option value="Consumed">Consumed</Option></Select></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}