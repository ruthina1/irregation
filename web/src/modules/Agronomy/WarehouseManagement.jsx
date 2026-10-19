import React, { useEffect, useMemo, useState } from 'react';
import {
    Table, Button, Input, Select, Modal, Form, Row, Col,
    InputNumber, message, Tag, Space, Empty, Divider
} from 'antd';
import {
    PlusOutlined, SearchOutlined, DownloadOutlined,
    EditOutlined, DeleteOutlined, HomeOutlined,
    DatabaseOutlined, EnvironmentOutlined, InboxOutlined
} from '@ant-design/icons';
import agronomyApi from '../../services/api/agronomyApi';

const { TextArea } = Input;

export default function WarehouseManagement() {
    const [form] = Form.useForm();

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);

    const [search, setSearch] = useState('');
    const [status, setStatus] = useState();

    const fetchData = async () => {
        setLoading(true);

        try {
            const res = await agronomyApi.getWarehouses();
            const records = res?.data?.data || res?.data || [];
            setData(Array.isArray(records) ? records : []);
        } catch {
            message.error('Failed to load warehouses');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();

        return data.filter(x =>
            (!q ||
                `${x.name || ''} ${x.code || ''} ${x.location || ''} ${x.woreda || ''}`
                    .toLowerCase()
                    .includes(q)) &&
            (!status || x.status === status)
        );
    }, [data, search, status]);

    const totalCapacity = filtered.reduce(
        (sum, x) => sum + Number(x.capacity || 0),
        0
    );

    const activeWarehouses = filtered.filter(
        x => !x.status || x.status === 'Active'
    ).length;

    const openCreate = () => {
        setEditing(null);
        form.resetFields();

        form.setFieldsValue({
            status: 'Active'
        });

        setOpen(true);
    };

    const openEdit = record => {
        setEditing(record);
        form.setFieldsValue(record);
        setOpen(true);
    };

    const submit = async values => {
        setSaving(true);

        try {
            if (editing) {
                await agronomyApi.updateWarehouse(
                    editing.id,
                    values
                );

                message.success('Warehouse updated successfully');
            } else {
                await agronomyApi.createWarehouse(values);
                message.success('Warehouse registered successfully');
            }

            setOpen(false);
            fetchData();
        } catch (error) {
            message.error(
                error?.response?.data?.message ||
                'Failed to save warehouse'
            );
        } finally {
            setSaving(false);
        }
    };

    const remove = id => {
        Modal.confirm({
            title: 'Delete Warehouse?',
            content:
                'Deleting a warehouse with stock may be blocked by the server.',
            okType: 'danger',
            onOk: async () => {
                try {
                    await agronomyApi.deleteWarehouse(id);
                    message.success('Warehouse deleted');
                    fetchData();
                } catch (error) {
                    message.error(
                        error?.response?.data?.message ||
                        'Failed to delete warehouse'
                    );
                }
            }
        });
    };

    const columns = [
        {
            title: 'Warehouse',
            render: (_, r) => (
                <div>
                    <strong>{r.name || '—'}</strong>
                    <div style={{
                        fontSize: 12,
                        color: '#6b7280'
                    }}>
                        {r.code || 'No code'}
                    </div>
                </div>
            )
        },
        {
            title: 'Location',
            render: (_, r) => (
                <div>
                    {r.location || '—'}
                    {r.woreda && (
                        <div style={{
                            fontSize: 12,
                            color: '#6b7280'
                        }}>
                            {r.woreda}
                        </div>
                    )}
                </div>
            )
        },
        {
            title: 'Capacity',
            render: (_, r) =>
                `${Number(r.capacity || 0).toLocaleString()} ${r.capacity_unit || 'Kg'}`
        },
        {
            title: 'Storage Type',
            dataIndex: 'storage_type',
            render: v => (
                <Tag>{v || 'General'}</Tag>
            )
        },
        {
            title: 'Manager',
            dataIndex: 'manager_name',
            render: v => v || '—'
        },
        {
            title: 'Status',
            dataIndex: 'status',
            render: v => (
                <Tag color={
                    v === 'Inactive'
                        ? 'red'
                        : 'green'
                }>
                    {v || 'Active'}
                </Tag>
            )
        },
        {
            title: 'Actions',
            width: 110,
            render: (_, r) => (
                <Space>
                    <Button
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => openEdit(r)}
                    />

                    <Button
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => remove(r.id)}
                    />
                </Space>
            )
        }
    ];

    return (
        <div style={{
            padding: 24,
            minHeight: '100vh',
            background: '#f8fafc'
        }}>
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ margin: 0 }}>
                    Warehouse Management
                </h1>

                <p style={{
                    margin: '5px 0 0',
                    color: '#6b7280'
                }}>
                    Manage agricultural input storage facilities,
                    capacity, locations and responsible personnel.
                </p>
            </div>

            <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                <Col xs={24} sm={12} lg={6}>
                    <KPI
                        label="Total Warehouses"
                        value={filtered.length}
                        icon={<HomeOutlined />}
                    />
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <KPI
                        label="Active Warehouses"
                        value={activeWarehouses}
                        icon={<InboxOutlined />}
                    />
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <KPI
                        label="Total Capacity"
                        value={`${totalCapacity.toLocaleString()} Kg`}
                        icon={<DatabaseOutlined />}
                    />
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <KPI
                        label="Storage Locations"
                        value={
                            new Set(
                                filtered
                                    .map(x => x.location)
                                    .filter(Boolean)
                            ).size
                        }
                        icon={<EnvironmentOutlined />}
                    />
                </Col>
            </Row>

            <div style={{
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                padding: 14,
                marginBottom: 16
            }}>
                <Row gutter={[12, 12]}>
                    <Col xs={24} md={8}>
                        <Input
                            allowClear
                            prefix={<SearchOutlined />}
                            placeholder="Search warehouse, code or location..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </Col>

                    <Col xs={12} md={4}>
                        <Select
                            allowClear
                            style={{ width: '100%' }}
                            placeholder="Status"
                            value={status}
                            onChange={setStatus}
                            options={[
                                {
                                    label: 'Active',
                                    value: 'Active'
                                },
                                {
                                    label: 'Inactive',
                                    value: 'Inactive'
                                }
                            ]}
                        />
                    </Col>

                    <Col xs={24} md={12}>
                        <Space style={{ float: 'right' }}>
                            <Button icon={<DownloadOutlined />}>
                                Export
                            </Button>

                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={openCreate}
                            >
                                Register Warehouse
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </div>

            <div style={{
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: 8
            }}>
                <Table
                    rowKey="id"
                    columns={columns}
                    dataSource={filtered}
                    loading={loading}
                    scroll={{ x: 1000 }}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true
                    }}
                    locale={{
                        emptyText: (
                            <Empty description="No warehouses registered" />
                        )
                    }}
                />
            </div>

            <Modal
                open={open}
                width={760}
                title={
                    editing
                        ? 'Edit Warehouse'
                        : 'Register Warehouse'
                }
                destroyOnClose
                confirmLoading={saving}
                onCancel={() => setOpen(false)}
                onOk={() => form.submit()}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={submit}
                >
                    <Divider orientation="left">
                        <HomeOutlined /> Warehouse Information
                    </Divider>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="name"
                                label="Warehouse Name"
                                rules={[{ required: true }]}
                            >
                                <Input placeholder="e.g. Bahir Dar Central Input Warehouse" />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item
                                name="code"
                                label="Warehouse Code"
                                rules={[{ required: true }]}
                            >
                                <Input placeholder="WH-BD-001" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="region" label="Region">
                                <Input />
                            </Form.Item>
                        </Col>

                        <Col span={8}>
                            <Form.Item name="zone" label="Zone">
                                <Input />
                            </Form.Item>
                        </Col>

                        <Col span={8}>
                            <Form.Item name="woreda" label="Woreda">
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="location" label="Specific Location">
                        <Input />
                    </Form.Item>

                    <Divider orientation="left">
                        Storage Capacity
                    </Divider>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                name="capacity"
                                label="Capacity"
                                rules={[{ required: true }]}
                            >
                                <InputNumber
                                    min={0}
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        </Col>

                        <Col span={8}>
                            <Form.Item
                                name="capacity_unit"
                                label="Capacity Unit"
                                initialValue="Kg"
                            >
                                <Select
                                    options={[
                                        'Kg',
                                        'Ton',
                                        'Quintal',
                                        'Liter',
                                        'Piece'
                                    ].map(x => ({
                                        label: x,
                                        value: x
                                    }))}
                                />
                            </Form.Item>
                        </Col>

                        <Col span={8}>
                            <Form.Item
                                name="storage_type"
                                label="Storage Type"
                                initialValue="General"
                            >
                                <Select
                                    options={[
                                        'General',
                                        'Fertilizer',
                                        'Pesticide',
                                        'Cold Storage',
                                        'Chemical Storage',
                                        'Seed Storage',
                                        'Mixed'
                                    ].map(x => ({
                                        label: x,
                                        value: x
                                    }))}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider orientation="left">
                        Management
                    </Divider>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="manager_name" label="Warehouse Manager">
                                <Input />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item
                                name="status"
                                label="Status"
                                initialValue="Active"
                            >
                                <Select
                                    options={[
                                        'Active',
                                        'Inactive'
                                    ].map(x => ({
                                        label: x,
                                        value: x
                                    }))}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="remarks" label="Remarks">
                        <TextArea rows={3} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

function KPI({ label, value, icon }) {
    return (
        <div style={{
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            padding: 18
        }}>
            <div style={{
                color: '#6b7280',
                fontSize: 13,
                marginBottom: 8
            }}>
                {label}
            </div>

            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                fontSize: 22,
                fontWeight: 650
            }}>
                <span style={{ color: '#16a34a' }}>
                    {icon}
                </span>
                {value}
            </div>
        </div>
    );
}