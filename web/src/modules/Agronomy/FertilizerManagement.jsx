import React, { useEffect, useMemo, useState } from 'react';
import {
    Table, Button, Input, Select, Modal, Form, Row, Col,
    InputNumber, DatePicker, message, Tag, Space, Empty, Divider
} from 'antd';
import {
    PlusOutlined, SearchOutlined, DownloadOutlined,
    EditOutlined, DeleteOutlined, ExperimentOutlined,
    DatabaseOutlined, WarningOutlined, InboxOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import agronomyApi from '../../services/api/agronomyApi';

const { TextArea } = Input;

export default function FertilizerManagement() {
    const [form] = Form.useForm();

    const [data, setData] = useState([]);
    const [inputs, setInputs] = useState([]);
    const [warehouses, setWarehouses] = useState([]);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);

    const [search, setSearch] = useState('');
    const [fertilizerType, setFertilizerType] = useState();

    const fetchData = async () => {
        setLoading(true);

        try {
            const res = await agronomyApi.getFertilizers();
            const records = res?.data?.data || res?.data || [];
            setData(Array.isArray(records) ? records : []);
        } catch (error) {
            message.error('Failed to load fertilizer records');
        } finally {
            setLoading(false);
        }
    };

    const loadDependencies = async () => {
        try {
            const [inputRes, warehouseRes] =
                await Promise.all([
                    agronomyApi.getInputRegistrations(),
                    agronomyApi.getWarehouses()
                ]);

            const allInputs =
                inputRes?.data?.data || inputRes?.data || [];

            const ws =
                warehouseRes?.data?.data || warehouseRes?.data || [];

            setInputs(
                Array.isArray(allInputs)
                    ? allInputs.filter(x =>
                        String(x.input_type || '').toLowerCase() ===
                        'fertilizer'
                    )
                    : []
            );

            setWarehouses(Array.isArray(ws) ? ws : []);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchData();
        loadDependencies();
    }, []);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();

        return data.filter(x =>
            (!q ||
                `${x.fertilizer_name || ''} ${x.brand || ''} ${x.batch_number || ''}`
                    .toLowerCase()
                    .includes(q)) &&
            (!fertilizerType ||
                x.fertilizer_type === fertilizerType)
        );
    }, [data, search, fertilizerType]);

    const totalStock = filtered.reduce(
        (sum, x) => sum + Number(x.quantity || 0),
        0
    );

    const expiring = filtered.filter(
        x =>
            x.expiry_date &&
            dayjs(x.expiry_date).diff(dayjs(), 'day') <= 30
    ).length;

    const openCreate = () => {
        setEditing(null);
        form.resetFields();
        form.setFieldsValue({
            unit: 'Kg'
        });
        setOpen(true);
    };

    const openEdit = record => {
        setEditing(record);

        form.setFieldsValue({
            ...record,
            manufacture_date: record.manufacture_date
                ? dayjs(record.manufacture_date)
                : null,
            expiry_date: record.expiry_date
                ? dayjs(record.expiry_date)
                : null
        });

        setOpen(true);
    };

    const submit = async values => {
        setSaving(true);

        const payload = {
            ...values,
            manufacture_date: values.manufacture_date
                ? values.manufacture_date.format('YYYY-MM-DD')
                : null,
            expiry_date: values.expiry_date
                ? values.expiry_date.format('YYYY-MM-DD')
                : null
        };

        try {
            if (editing) {
                await agronomyApi.updateFertilizer(
                    editing.id,
                    payload
                );
                message.success('Fertilizer updated successfully');
            } else {
                await agronomyApi.createFertilizer(payload);
                message.success(
                    'Fertilizer registered successfully'
                );
            }

            setOpen(false);
            fetchData();
        } catch (error) {
            message.error(
                error?.response?.data?.message ||
                'Failed to save fertilizer'
            );
        } finally {
            setSaving(false);
        }
    };

    const remove = id => {
        Modal.confirm({
            title: 'Delete Fertilizer Record?',
            okType: 'danger',
            onOk: async () => {
                try {
                    await agronomyApi.deleteFertilizer(id);
                    message.success('Fertilizer deleted');
                    fetchData();
                } catch {
                    message.error('Failed to delete fertilizer');
                }
            }
        });
    };

    const columns = [
        {
            title: 'Fertilizer',
            render: (_, r) => (
                <div>
                    <strong>{r.fertilizer_name || '—'}</strong>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>
                        {r.brand || 'No brand'}
                    </div>
                </div>
            )
        },
        {
            title: 'Type / Grade',
            render: (_, r) => (
                <div>
                    <Tag color="green">
                        {r.fertilizer_type || '—'}
                    </Tag>
                    <div style={{ fontSize: 12 }}>
                        {r.grade || ''}
                    </div>
                </div>
            )
        },
        {
            title: 'Batch',
            dataIndex: 'batch_number'
        },
        {
            title: 'Quantity',
            render: (_, r) =>
                `${Number(r.quantity || 0).toLocaleString()} ${r.unit || 'Kg'}`
        },
        {
            title: 'Warehouse',
            render: (_, r) => {
                const w = warehouses.find(
                    x => String(x.id) === String(r.warehouse_id)
                );

                return w?.name || r.warehouse_name || '—';
            }
        },
        {
            title: 'Expiry',
            dataIndex: 'expiry_date',
            render: v => {
                if (!v) return '—';

                const days = dayjs(v).diff(dayjs(), 'day');

                return (
                    <Tag color={days < 0 ? 'red' : days <= 30 ? 'orange' : 'green'}>
                        {dayjs(v).format('DD MMM YYYY')}
                    </Tag>
                );
            }
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
            background: '#f8fafc',
            minHeight: '100vh'
        }}>
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ margin: 0 }}>
                    Fertilizer Management
                </h1>

                <p style={{
                    margin: '5px 0 0',
                    color: '#6b7280'
                }}>
                    Manage fertilizer products, grades, batches,
                    quantities, storage and expiry information.
                </p>
            </div>

            <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                <Col xs={24} sm={12} lg={6}>
                    <KPI
                        label="Fertilizer Records"
                        value={filtered.length}
                        icon={<ExperimentOutlined />}
                    />
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <KPI
                        label="Total Stock"
                        value={`${totalStock.toLocaleString()} Kg`}
                        icon={<DatabaseOutlined />}
                    />
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <KPI
                        label="Expiring / Expired"
                        value={expiring}
                        icon={<WarningOutlined />}
                    />
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <KPI
                        label="Fertilizer Types"
                        value={
                            new Set(
                                filtered
                                    .map(x => x.fertilizer_type)
                                    .filter(Boolean)
                            ).size
                        }
                        icon={<InboxOutlined />}
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
                    <Col xs={24} md={9}>
                        <Input
                            allowClear
                            prefix={<SearchOutlined />}
                            placeholder="Search fertilizer, brand or batch..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </Col>

                    <Col xs={12} md={5}>
                        <Select
                            allowClear
                            style={{ width: '100%' }}
                            placeholder="Fertilizer Type"
                            value={fertilizerType}
                            onChange={setFertilizerType}
                            options={[
                                'Urea',
                                'NPS',
                                'NPSB',
                                'DAP',
                                'Organic',
                                'Other'
                            ].map(x => ({
                                label: x,
                                value: x
                            }))}
                        />
                    </Col>

                    <Col xs={24} md={10}>
                        <Space style={{ float: 'right' }}>
                            <Button
                                icon={<DownloadOutlined />}
                            >
                                Export
                            </Button>

                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={openCreate}
                            >
                                Register Fertilizer
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
                            <Empty description="No fertilizer records found" />
                        )
                    }}
                />
            </div>

            <Modal
                open={open}
                width={800}
                title={
                    editing
                        ? 'Edit Fertilizer'
                        : 'Register Fertilizer'
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
                        <ExperimentOutlined /> Fertilizer Details
                    </Divider>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="fertilizer_name"
                                label="Fertilizer Name"
                                rules={[{ required: true }]}
                            >
                                <Input placeholder="e.g. NPSB" />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item
                                name="fertilizer_type"
                                label="Fertilizer Type"
                                rules={[{ required: true }]}
                            >
                                <Select
                                    options={[
                                        'Urea',
                                        'NPS',
                                        'NPSB',
                                        'DAP',
                                        'Organic',
                                        'Other'
                                    ].map(x => ({
                                        label: x,
                                        value: x
                                    }))}
                                />
                            </Form.Item>
                        </Col>

                        <Col span={8}>
                            <Form.Item name="grade" label="Grade">
                                <Input placeholder="e.g. 18-46-0" />
                            </Form.Item>
                        </Col>

                        <Col span={8}>
                            <Form.Item name="brand" label="Brand">
                                <Input />
                            </Form.Item>
                        </Col>

                        <Col span={8}>
                            <Form.Item name="manufacturer" label="Manufacturer">
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider orientation="left">
                        Batch & Inventory
                    </Divider>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                name="batch_number"
                                label="Batch / Lot Number"
                                rules={[{ required: true }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>

                        <Col span={8}>
                            <Form.Item
                                name="quantity"
                                label="Quantity"
                                rules={[{ required: true }]}
                            >
                                <InputNumber
                                    min={0}
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        </Col>

                        <Col span={8}>
                            <Form.Item name="unit" label="Unit">
                                <Select
                                    options={[
                                        'Kg',
                                        'Quintal',
                                        'Ton',
                                        'Bag'
                                    ].map(x => ({
                                        label: x,
                                        value: x
                                    }))}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="warehouse_id" label="Warehouse">
                                <Select
                                    showSearch
                                    optionFilterProp="label"
                                    options={warehouses.map(x => ({
                                        label: x.name,
                                        value: x.id
                                    }))}
                                />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item name="supplier" label="Supplier">
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider orientation="left">
                        Dates
                    </Divider>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="manufacture_date" label="Manufacture Date">
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item name="expiry_date" label="Expiry Date">
                                <DatePicker style={{ width: '100%' }} />
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
                <span style={{ color: '#16a34a' }}>{icon}</span>
                {value}
            </div>
        </div>
    );
}