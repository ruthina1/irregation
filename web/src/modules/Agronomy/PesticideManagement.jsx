import React, { useEffect, useMemo, useState } from 'react';
import {
    Table, Button, Input, Select, Modal, Form, Row, Col,
    InputNumber, DatePicker, message, Tag, Space, Empty, Divider
} from 'antd';
import {
    PlusOutlined, SearchOutlined, DownloadOutlined,
    EditOutlined, DeleteOutlined, BugOutlined,
    WarningOutlined, DatabaseOutlined, SafetyOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import agronomyApi from '../../services/api/agronomyApi';

const { TextArea } = Input;

export default function PesticideManagement() {
    const [form] = Form.useForm();

    const [data, setData] = useState([]);
    const [warehouses, setWarehouses] = useState([]);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);

    const [search, setSearch] = useState('');
    const [pesticideType, setPesticideType] = useState();

    const fetchData = async () => {
        setLoading(true);

        try {
            const res = await agronomyApi.getPesticides();
            const records = res?.data?.data || res?.data || [];
            setData(Array.isArray(records) ? records : []);
        } catch {
            message.error('Failed to load pesticide records');
        } finally {
            setLoading(false);
        }
    };

    const loadWarehouses = async () => {
        try {
            const res = await agronomyApi.getWarehouses();
            const records = res?.data?.data || res?.data || [];
            setWarehouses(Array.isArray(records) ? records : []);
        } catch {}
    };

    useEffect(() => {
        fetchData();
        loadWarehouses();
    }, []);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();

        return data.filter(x =>
            (!q ||
                `${x.pesticide_name || ''} ${x.brand || ''} ${x.active_ingredient || ''} ${x.batch_number || ''}`
                    .toLowerCase()
                    .includes(q)) &&
            (!pesticideType ||
                x.pesticide_type === pesticideType)
        );
    }, [data, search, pesticideType]);

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
            unit: 'Liter'
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
                await agronomyApi.updatePesticide(
                    editing.id,
                    payload
                );

                message.success('Pesticide updated successfully');
            } else {
                await agronomyApi.createPesticide(payload);

                message.success('Pesticide registered successfully');
            }

            setOpen(false);
            fetchData();
        } catch (error) {
            message.error(
                error?.response?.data?.message ||
                'Failed to save pesticide'
            );
        } finally {
            setSaving(false);
        }
    };

    const remove = id => {
        Modal.confirm({
            title: 'Delete Pesticide Record?',
            okType: 'danger',
            onOk: async () => {
                try {
                    await agronomyApi.deletePesticide(id);
                    message.success('Pesticide deleted');
                    fetchData();
                } catch {
                    message.error('Failed to delete pesticide');
                }
            }
        });
    };

    const columns = [
        {
            title: 'Pesticide',
            render: (_, r) => (
                <div>
                    <strong>{r.pesticide_name || '—'}</strong>
                    <div style={{
                        fontSize: 12,
                        color: '#6b7280'
                    }}>
                        {r.brand || 'No brand'}
                    </div>
                </div>
            )
        },
        {
            title: 'Type',
            dataIndex: 'pesticide_type',
            render: v => (
                <Tag color="orange">
                    {v || 'Other'}
                </Tag>
            )
        },
        {
            title: 'Active Ingredient',
            dataIndex: 'active_ingredient',
            render: v => v || '—'
        },
        {
            title: 'Batch',
            dataIndex: 'batch_number'
        },
        {
            title: 'Quantity',
            render: (_, r) =>
                `${Number(r.quantity || 0).toLocaleString()} ${r.unit || 'L'}`
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
                    <Tag color={
                        days < 0
                            ? 'red'
                            : days <= 30
                                ? 'orange'
                                : 'green'
                    }>
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
            minHeight: '100vh',
            background: '#f8fafc'
        }}>
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ margin: 0 }}>
                    Pesticide Management
                </h1>

                <p style={{
                    margin: '5px 0 0',
                    color: '#6b7280'
                }}>
                    Manage pesticides, active ingredients, batches,
                    quantities, expiry and safety information.
                </p>
            </div>

            <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                <Col xs={24} sm={12} lg={6}>
                    <KPI
                        label="Pesticide Records"
                        value={filtered.length}
                        icon={<BugOutlined />}
                    />
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <KPI
                        label="Total Stock"
                        value={`${totalStock.toLocaleString()} L`}
                        icon={<DatabaseOutlined />}
                    />
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <KPI
                        label="Expiry Alerts"
                        value={expiring}
                        icon={<WarningOutlined />}
                    />
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <KPI
                        label="Pesticide Types"
                        value={
                            new Set(
                                filtered
                                    .map(x => x.pesticide_type)
                                    .filter(Boolean)
                            ).size
                        }
                        icon={<SafetyOutlined />}
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
                            placeholder="Search pesticide, ingredient, batch..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </Col>

                    <Col xs={12} md={5}>
                        <Select
                            allowClear
                            style={{ width: '100%' }}
                            placeholder="Pesticide Type"
                            value={pesticideType}
                            onChange={setPesticideType}
                            options={[
                                'Herbicide',
                                'Insecticide',
                                'Fungicide',
                                'Rodenticide',
                                'Other'
                            ].map(x => ({
                                label: x,
                                value: x
                            }))}
                        />
                    </Col>

                    <Col xs={24} md={10}>
                        <Space style={{ float: 'right' }}>
                            <Button icon={<DownloadOutlined />}>
                                Export
                            </Button>

                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={openCreate}
                            >
                                Register Pesticide
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
                    scroll={{ x: 1100 }}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true
                    }}
                    locale={{
                        emptyText: (
                            <Empty description="No pesticide records found" />
                        )
                    }}
                />
            </div>

            <Modal
                open={open}
                width={820}
                title={
                    editing
                        ? 'Edit Pesticide'
                        : 'Register Pesticide'
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
                        <BugOutlined /> Product Information
                    </Divider>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="pesticide_name"
                                label="Pesticide Name"
                                rules={[{ required: true }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item
                                name="pesticide_type"
                                label="Pesticide Type"
                                rules={[{ required: true }]}
                            >
                                <Select
                                    options={[
                                        'Herbicide',
                                        'Insecticide',
                                        'Fungicide',
                                        'Rodenticide',
                                        'Other'
                                    ].map(x => ({
                                        label: x,
                                        value: x
                                    }))}
                                />
                            </Form.Item>
                        </Col>

                        <Col span={8}>
                            <Form.Item
                                name="active_ingredient"
                                label="Active Ingredient"
                                rules={[{ required: true }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>

                        <Col span={8}>
                            <Form.Item name="formulation" label="Formulation">
                                <Input placeholder="e.g. EC, SC, WP" />
                            </Form.Item>
                        </Col>

                        <Col span={8}>
                            <Form.Item name="concentration" label="Concentration">
                                <Input placeholder="e.g. 480 g/L" />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item name="target_pest" label="Target Pest / Disease">
                                <Input />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item name="brand" label="Brand">
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider orientation="left">
                        Batch & Storage
                    </Divider>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                name="batch_number"
                                label="Batch / Lot"
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
                                        'Liter',
                                        'Kg',
                                        'ml',
                                        'Bottle',
                                        'Can'
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
                        Safety & Dates
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

                    <Form.Item name="safety_information" label="Safety / Handling Information">
                        <TextArea rows={3} />
                    </Form.Item>

                    <Form.Item name="remarks" label="Remarks">
                        <TextArea rows={2} />
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
                gap: 9,
                alignItems: 'center',
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