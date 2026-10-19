import React, { useEffect, useMemo, useState } from 'react';
import {
    Table,
    Button,
    Input,
    Select,
    Modal,
    Form,
    Row,
    Col,
    InputNumber,
    DatePicker,
    message,
    Tag,
    Space,
    Empty,
    Divider,
    Card,
    Statistic
} from 'antd';

import {
    PlusOutlined,
    SearchOutlined,
    DownloadOutlined,
    EditOutlined,
    DeleteOutlined,
    DatabaseOutlined,
    ArrowDownOutlined,
    ArrowUpOutlined,
    SwapOutlined,
    WarningOutlined,
    ClearOutlined,
    FilterOutlined,
    InboxOutlined,
    SendOutlined,
    RetweetOutlined,
    SettingOutlined
} from '@ant-design/icons';

import dayjs from 'dayjs';
import agronomyApi from '../../services/api/agronomyApi';

const { TextArea } = Input;
const { RangePicker } = DatePicker;

export default function StockManagement() {
    const [form] = Form.useForm();

    const [data, setData] = useState([]);
    const [inputs, setInputs] = useState([]);
    const [warehouses, setWarehouses] = useState([]);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);

    /* =========================
       BASIC FILTERS
    ========================= */

    const [search, setSearch] = useState('');
    const [warehouse, setWarehouse] = useState();
    const [movementType, setMovementType] = useState();

    /* =========================
       ADVANCED FILTERS
    ========================= */

    const [inputId, setInputId] = useState();
    const [inputType, setInputType] = useState();
    const [unit, setUnit] = useState();
    const [dateRange, setDateRange] = useState(null);

    const [minQuantity, setMinQuantity] = useState();
    const [maxQuantity, setMaxQuantity] = useState();

    const [showAdvancedFilters, setShowAdvancedFilters] =
        useState(false);

    /* =========================
       FETCH STOCK MOVEMENTS
    ========================= */

    const fetchData = async () => {
        setLoading(true);

        try {
            const res = await agronomyApi.getStockMovements();

            const records =
                res?.data?.data ||
                res?.data ||
                [];

            setData(
                Array.isArray(records)
                    ? records
                    : []
            );
        } catch {
            message.error(
                'Failed to load stock movements'
            );
        } finally {
            setLoading(false);
        }
    };

    /* =========================
       LOAD DEPENDENCIES
    ========================= */

    const loadDependencies = async () => {
        try {
            const [
                inputRes,
                warehouseRes
            ] = await Promise.all([
                agronomyApi.getInputRegistrations(),
                agronomyApi.getWarehouses()
            ]);

            const inputData =
                inputRes?.data?.data ||
                inputRes?.data ||
                [];

            const warehouseData =
                warehouseRes?.data?.data ||
                warehouseRes?.data ||
                [];

            setInputs(
                Array.isArray(inputData)
                    ? inputData
                    : []
            );

            setWarehouses(
                Array.isArray(warehouseData)
                    ? warehouseData
                    : []
            );
        } catch {
            message.error(
                'Failed to load stock dependencies'
            );
        }
    };

    useEffect(() => {
        fetchData();
        loadDependencies();
    }, []);

    /* =========================
       FILTER OPTIONS
    ========================= */

    const inputTypes = useMemo(() => {
        return [
            ...new Set(
                data
                    .map(x =>
                        x.input_type ||
                        x.category ||
                        x.input_category
                    )
                    .filter(Boolean)
            )
        ];
    }, [data]);

    const units = useMemo(() => {
        return [
            ...new Set(
                data
                    .map(x => x.unit)
                    .filter(Boolean)
            )
        ];
    }, [data]);

    /* =========================
       FILTERED DATA
    ========================= */

    const filtered = useMemo(() => {
        const q = search
            .trim()
            .toLowerCase();

        return data.filter(x => {
            const text = [
                x.input_name,
                x.input_type,
                x.input_category,
                x.batch_number,
                x.reference_number,
                x.source,
                x.destination,
                x.notes
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            const quantity =
                Number(x.quantity || 0);

            const movementDate =
                x.movement_date
                    ? dayjs(x.movement_date)
                    : null;

            const searchMatch =
                !q ||
                text.includes(q);

            const warehouseMatch =
                !warehouse ||
                String(x.warehouse_id) ===
                    String(warehouse);

            const movementMatch =
                !movementType ||
                x.movement_type ===
                    movementType;

            const inputMatch =
                !inputId ||
                String(x.input_id) ===
                    String(inputId);

            const recordInputType =
                x.input_type ||
                x.category ||
                x.input_category;

            const inputTypeMatch =
                !inputType ||
                recordInputType ===
                    inputType;

            const unitMatch =
                !unit ||
                x.unit === unit;

            const minQuantityMatch =
                minQuantity === undefined ||
                minQuantity === null ||
                quantity >= Number(minQuantity);

            const maxQuantityMatch =
                maxQuantity === undefined ||
                maxQuantity === null ||
                quantity <= Number(maxQuantity);

            let dateMatch = true;

            if (
                dateRange &&
                dateRange.length === 2 &&
                movementDate
            ) {
                const start =
                    dateRange[0]
                        .startOf('day');

                const end =
                    dateRange[1]
                        .endOf('day');

                dateMatch =
                    movementDate.isAfter(
                        start.subtract(1, 'millisecond')
                    ) &&
                    movementDate.isBefore(
                        end.add(1, 'millisecond')
                    );
            }

            return (
                searchMatch &&
                warehouseMatch &&
                movementMatch &&
                inputMatch &&
                inputTypeMatch &&
                unitMatch &&
                minQuantityMatch &&
                maxQuantityMatch &&
                dateMatch
            );
        });
    }, [
        data,
        search,
        warehouse,
        movementType,
        inputId,
        inputType,
        unit,
        dateRange,
        minQuantity,
        maxQuantity
    ]);

    /* =========================
       REPORT CALCULATIONS
    ========================= */

    const report = useMemo(() => {
        const quantity = type =>
            filtered
                .filter(x =>
                    type
                        ? x.movement_type === type
                        : true
                )
                .reduce(
                    (sum, x) =>
                        sum +
                        Number(
                            x.quantity || 0
                        ),
                    0
                );

        const received =
            quantity('Receipt');

        const issued =
            filtered
                .filter(x =>
                    [
                        'Issue',
                        'Distribution'
                    ].includes(
                        x.movement_type
                    )
                )
                .reduce(
                    (sum, x) =>
                        sum +
                        Number(
                            x.quantity || 0
                        ),
                    0
                );

        const distribution =
            quantity('Distribution');

        const issue =
            quantity('Issue');

        const transfer =
            quantity('Transfer');

        const adjustment =
            quantity('Adjustment');

        const net =
            received -
            issued;

        const totalValue =
            filtered.reduce(
                (sum, x) =>
                    sum +
                    Number(x.quantity || 0) *
                    Number(x.unit_cost || 0),
                0
            );

        const uniqueInputs =
            new Set(
                filtered
                    .map(x =>
                        x.input_id ||
                        x.input_name
                    )
                    .filter(Boolean)
            ).size;

        const uniqueWarehouses =
            new Set(
                filtered
                    .map(x =>
                        x.warehouse_id ||
                        x.warehouse_name
                    )
                    .filter(Boolean)
            ).size;

        const negativeAdjustments =
            filtered.filter(
                x =>
                    x.movement_type ===
                        'Adjustment' &&
                    Number(x.quantity || 0) < 0
            ).length;

        return {
            transactions: filtered.length,
            received,
            issued,
            distribution,
            issue,
            transfer,
            adjustment,
            net,
            totalValue,
            uniqueInputs,
            uniqueWarehouses,
            negativeAdjustments
        };
    }, [filtered]);

    /* =========================
       CLEAR FILTERS
    ========================= */

    const clearFilters = () => {
        setSearch('');
        setWarehouse(undefined);
        setMovementType(undefined);
        setInputId(undefined);
        setInputType(undefined);
        setUnit(undefined);
        setDateRange(null);
        setMinQuantity(undefined);
        setMaxQuantity(undefined);
    };

    /* =========================
       EXPORT REPORT
    ========================= */

    const exportToCSV = () => {
        if (!filtered.length) {
            message.info(
                'No data available to export'
            );
            return;
        }

        const headers = [
            'Date',
            'Input',
            'Input Type',
            'Batch Number',
            'Warehouse',
            'Movement Type',
            'Quantity',
            'Unit',
            'Unit Cost (ETB)',
            'Total Value (ETB)',
            'Reference Number',
            'Source',
            'Destination',
            'Notes'
        ];

        const escapeCSV = value => {
            const text =
                value === null ||
                value === undefined
                    ? ''
                    : String(value);

            return `"${text.replace(
                /"/g,
                '""'
            )}"`;
        };

        const rows =
            filtered.map(x => [
                x.movement_date
                    ? dayjs(
                        x.movement_date
                    ).format(
                        'YYYY-MM-DD'
                    )
                    : '',

                x.input_name || '',

                x.input_type ||
                    x.input_category ||
                    x.category ||
                    '',

                x.batch_number || '',

                x.warehouse_name ||
                    warehouses.find(
                        w =>
                            String(w.id) ===
                            String(
                                x.warehouse_id
                            )
                    )?.name ||
                    '',

                x.movement_type || '',

                x.quantity || 0,

                x.unit || '',

                x.unit_cost || 0,

                (
                    Number(
                        x.quantity || 0
                    ) *
                    Number(
                        x.unit_cost || 0
                    )
                ).toFixed(2),

                x.reference_number || '',

                x.source || '',

                x.destination || '',

                x.notes || ''
            ]);

        const csv = [
            headers.map(escapeCSV).join(','),
            ...rows.map(row =>
                row
                    .map(escapeCSV)
                    .join(',')
            )
        ].join('\n');

        const blob =
            new Blob(
                [csv],
                {
                    type:
                        'text/csv;charset=utf-8;'
                }
            );

        const url =
            URL.createObjectURL(blob);

        const link =
            document.createElement('a');

        link.href = url;

        link.download =
            `Stock_Report_${dayjs().format(
                'YYYY-MM-DD'
            )}.csv`;

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        URL.revokeObjectURL(url);

        message.success(
            'Stock report exported successfully'
        );
    };

    /* =========================
       CREATE TRANSACTION
       UNCHANGED
    ========================= */

    const openCreate = () => {
        setEditing(null);
        form.resetFields();

        form.setFieldsValue({
            movement_date: dayjs(),
            movement_type: 'Receipt'
        });

        setOpen(true);
    };

    /* =========================
       EDIT TRANSACTION
       UNCHANGED
    ========================= */

    const openEdit = record => {
        setEditing(record);

        form.setFieldsValue({
            ...record,
            movement_date: record.movement_date
                ? dayjs(record.movement_date)
                : null
        });

        setOpen(true);
    };

    /* =========================
       SUBMIT
       UNCHANGED
    ========================= */

    const submit = async values => {
        setSaving(true);

        const payload = {
            ...values,
            movement_date: values.movement_date
                ? values.movement_date.format(
                    'YYYY-MM-DD'
                )
                : null
        };

        try {
            if (editing) {
                await agronomyApi.updateStockMovement(
                    editing.id,
                    payload
                );

                message.success(
                    'Stock movement updated'
                );
            } else {
                await agronomyApi.createStockMovement(
                    payload
                );

                message.success(
                    'Stock movement recorded successfully'
                );
            }

            setOpen(false);
            fetchData();
        } catch (error) {
            message.error(
                error?.response?.data?.message ||
                'Failed to save stock movement'
            );
        } finally {
            setSaving(false);
        }
    };

    /* =========================
       DELETE
       UNCHANGED
    ========================= */

    const remove = id => {
        Modal.confirm({
            title: 'Delete Stock Movement?',
            content:
                'Deleting historical stock movements can affect inventory balances.',
            okType: 'danger',

            onOk: async () => {
                try {
                    await agronomyApi.deleteStockMovement(
                        id
                    );

                    message.success(
                        'Stock movement deleted'
                    );

                    fetchData();
                } catch (error) {
                    message.error(
                        error?.response?.data?.message ||
                        'Failed to delete movement'
                    );
                }
            }
        });
    };

    /* =========================
       TABLE
       ========================= */

    const columns = [
        {
            title: 'Date',
            dataIndex: 'movement_date',
            render: v =>
                v
                    ? dayjs(v).format(
                        'DD MMM YYYY'
                    )
                    : '—'
        },

        {
            title: 'Input',
            render: (_, r) => (
                <div>
                    <strong>
                        {r.input_name || '—'}
                    </strong>

                    <div
                        style={{
                            fontSize: 12,
                            color: '#6b7280'
                        }}
                    >
                        {r.batch_number ||
                            'No batch'}
                    </div>
                </div>
            )
        },

        {
            title: 'Warehouse',
            render: (_, r) => {
                const w =
                    warehouses.find(
                        x =>
                            String(x.id) ===
                            String(
                                r.warehouse_id
                            )
                    );

                return (
                    w?.name ||
                    r.warehouse_name ||
                    '—'
                );
            }
        },

        {
            title: 'Movement',
            dataIndex: 'movement_type',

            render: v => {
                const colors = {
                    Receipt: 'green',
                    Issue: 'orange',
                    Distribution: 'blue',
                    Transfer: 'purple',
                    Adjustment: 'red'
                };

                return (
                    <Tag
                        color={
                            colors[v] ||
                            'default'
                        }
                    >
                        {v || '—'}
                    </Tag>
                );
            }
        },

        {
            title: 'Quantity',

            render: (_, r) =>
                `${Number(
                    r.quantity || 0
                ).toLocaleString()} ${
                    r.unit || 'Kg'
                }`
        },

        {
            title: 'Reference',
            dataIndex:
                'reference_number',

            render: v =>
                v || '—'
        },

        {
            title: 'Actions',
            width: 110,

            render: (_, r) => (
                <Space>
                    <Button
                        size="small"
                        icon={
                            <EditOutlined />
                        }
                        onClick={() =>
                            openEdit(r)
                        }
                    />

                    <Button
                        size="small"
                        danger
                        icon={
                            <DeleteOutlined />
                        }
                        onClick={() =>
                            remove(r.id)
                        }
                    />
                </Space>
            )
        }
    ];

    /* =========================
       UI
    ========================= */

    return (
        <div
            style={{
                padding: 24,
                minHeight: '100vh',
                background: '#f8fafc'
            }}
        >
            {/* HEADER */}

            <div
                style={{
                    marginBottom: 24
                }}
            >
                <h1
                    style={{
                        margin: 0,
                        fontSize: 24,
                        fontWeight: 650,
                        color: '#111827'
                    }}
                >
                    Stock Management
                </h1>

                <p
                    style={{
                        margin:
                            '5px 0 0',
                        color: '#6b7280'
                    }}
                >
                    Monitor agricultural
                    input inventory,
                    receipts, issues,
                    distributions,
                    transfers,
                    adjustments and
                    stock movement
                    performance.
                </p>
            </div>

            {/* REPORT CARDS */}

            <Row
                gutter={[
                    16,
                    16
                ]}
                style={{
                    marginBottom: 20
                }}
            >
                <Col
                    xs={24}
                    sm={12}
                    lg={6}
                >
                    <ReportCard
                        title="Stock Transactions"
                        value={
                            report.transactions
                        }
                        icon={
                            <DatabaseOutlined />
                        }
                        footer={`${report.uniqueInputs} inputs • ${report.uniqueWarehouses} warehouses`}
                    />
                </Col>

                <Col
                    xs={24}
                    sm={12}
                    lg={6}
                >
                    <ReportCard
                        title="Total Received"
                        value={`${report.received.toLocaleString()} Kg`}
                        icon={
                            <ArrowDownOutlined />
                        }
                        footer="All receipt transactions"
                    />
                </Col>

                <Col
                    xs={24}
                    sm={12}
                    lg={6}
                >
                    <ReportCard
                        title="Total Issued"
                        value={`${report.issued.toLocaleString()} Kg`}
                        icon={
                            <ArrowUpOutlined />
                        }
                        footer={`Issue: ${report.issue.toLocaleString()} Kg • Distribution: ${report.distribution.toLocaleString()} Kg`}
                    />
                </Col>

                <Col
                    xs={24}
                    sm={12}
                    lg={6}
                >
                    <ReportCard
                        title="Net Movement"
                        value={`${report.net.toLocaleString()} Kg`}
                        icon={
                            <SwapOutlined />
                        }
                        footer={
                            report.net >= 0
                                ? 'Positive stock movement'
                                : 'Negative stock movement'
                        }
                    />
                </Col>
            </Row>

            {/* SECOND REPORT ROW */}

            <Row
                gutter={[
                    16,
                    16
                ]}
                style={{
                    marginBottom: 20
                }}
            >
                <Col
                    xs={24}
                    sm={12}
                    lg={6}
                >
                    <MiniReport
                        title="Distributions"
                        value={`${report.distribution.toLocaleString()} Kg`}
                        icon={
                            <SendOutlined />
                        }
                    />
                </Col>

                <Col
                    xs={24}
                    sm={12}
                    lg={6}
                >
                    <MiniReport
                        title="Transfers"
                        value={`${report.transfer.toLocaleString()} Kg`}
                        icon={
                            <RetweetOutlined />
                        }
                    />
                </Col>

                <Col
                    xs={24}
                    sm={12}
                    lg={6}
                >
                    <MiniReport
                        title="Adjustments"
                        value={`${report.adjustment.toLocaleString()} Kg`}
                        icon={
                            <SettingOutlined />
                        }
                    />
                </Col>

                <Col
                    xs={24}
                    sm={12}
                    lg={6}
                >
                    <MiniReport
                        title="Inventory Value"
                        value={`${report.totalValue.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        })} ETB`}
                        icon={
                            <DatabaseOutlined />
                        }
                    />
                </Col>
            </Row>

            {/* FILTER BAR */}

            <Card
                size="small"
                style={{
                    marginBottom: 16,
                    borderRadius: 8
                }}
            >
                <Row
                    gutter={[
                        12,
                        12
                    ]}
                    align="middle"
                >
                    <Col
                        xs={24}
                        md={7}
                    >
                        <Input
                            allowClear
                            prefix={
                                <SearchOutlined />
                            }
                            placeholder="Search input, batch, reference, source..."
                            value={search}
                            onChange={e =>
                                setSearch(
                                    e.target.value
                                )
                            }
                        />
                    </Col>

                    <Col
                        xs={12}
                        md={4}
                    >
                        <Select
                            allowClear
                            style={{
                                width: '100%'
                            }}
                            placeholder="Warehouse"
                            value={
                                warehouse
                            }
                            onChange={
                                setWarehouse
                            }
                            options={warehouses.map(
                                x => ({
                                    label:
                                        x.name,
                                    value:
                                        x.id
                                })
                            )}
                        />
                    </Col>

                    <Col
                        xs={12}
                        md={4}
                    >
                        <Select
                            allowClear
                            style={{
                                width: '100%'
                            }}
                            placeholder="Movement"
                            value={
                                movementType
                            }
                            onChange={
                                setMovementType
                            }
                            options={[
                                'Receipt',
                                'Issue',
                                'Distribution',
                                'Transfer',
                                'Adjustment'
                            ].map(
                                x => ({
                                    label:
                                        x,
                                    value:
                                        x
                                })
                            )}
                        />
                    </Col>

                    <Col
                        xs={12}
                        md={4}
                    >
                        <Select
                            allowClear
                            showSearch
                            optionFilterProp="label"
                            style={{
                                width: '100%'
                            }}
                            placeholder="Input"
                            value={
                                inputId
                            }
                            onChange={
                                setInputId
                            }
                            options={inputs.map(
                                x => ({
                                    value:
                                        x.id,
                                    label:
                                        `${x.input_name || 'Input'}${x.batch_number ? ` — ${x.batch_number}` : ''}`
                                })
                            )}
                        />
                    </Col>

                    <Col
                        xs={12}
                        md={5}
                    >
                        <Space>
                            <Button
                                icon={
                                    <FilterOutlined />
                                }
                                type={
                                    showAdvancedFilters
                                        ? 'primary'
                                        : 'default'
                                }
                                onClick={() =>
                                    setShowAdvancedFilters(
                                        !showAdvancedFilters
                                    )
                                }
                            >
                                Advanced Filters
                            </Button>

                            <Button
                                icon={
                                    <ClearOutlined />
                                }
                                onClick={
                                    clearFilters
                                }
                            >
                                Clear
                            </Button>
                        </Space>
                    </Col>
                </Row>

                {/* ADVANCED FILTERS */}

                {showAdvancedFilters && (
                    <>
                        <Divider
                            style={{
                                margin:
                                    '16px 0'
                            }}
                        />

                        <Row
                            gutter={[
                                12,
                                12
                            ]}
                        >
                            <Col
                                xs={24}
                                sm={12}
                                md={5}
                            >
                                <Select
                                    allowClear
                                    style={{
                                        width:
                                            '100%'
                                    }}
                                    placeholder="Input Type"
                                    value={
                                        inputType
                                    }
                                    onChange={
                                        setInputType
                                    }
                                    options={inputTypes.map(
                                        x => ({
                                            label:
                                                x,
                                            value:
                                                x
                                        })
                                    )}
                                />
                            </Col>

                            <Col
                                xs={24}
                                sm={12}
                                md={4}
                            >
                                <Select
                                    allowClear
                                    style={{
                                        width:
                                            '100%'
                                    }}
                                    placeholder="Unit"
                                    value={
                                        unit
                                    }
                                    onChange={
                                        setUnit
                                    }
                                    options={units.map(
                                        x => ({
                                            label:
                                                x,
                                            value:
                                                x
                                        })
                                    )}
                                />
                            </Col>

                            <Col
                                xs={24}
                                sm={12}
                                md={7}
                            >
                                <RangePicker
                                    style={{
                                        width:
                                            '100%'
                                    }}
                                    value={
                                        dateRange
                                    }
                                    onChange={
                                        setDateRange
                                    }
                                />
                            </Col>

                            <Col
                                xs={12}
                                sm={6}
                                md={4}
                            >
                                <InputNumber
                                    min={0}
                                    style={{
                                        width:
                                            '100%'
                                    }}
                                    placeholder="Min Quantity"
                                    value={
                                        minQuantity
                                    }
                                    onChange={
                                        setMinQuantity
                                    }
                                />
                            </Col>

                            <Col
                                xs={12}
                                sm={6}
                                md={4}
                            >
                                <InputNumber
                                    min={0}
                                    style={{
                                        width:
                                            '100%'
                                    }}
                                    placeholder="Max Quantity"
                                    value={
                                        maxQuantity
                                    }
                                    onChange={
                                        setMaxQuantity
                                    }
                                />
                            </Col>
                        </Row>
                    </>
                )}
            </Card>

            {/* REPORT SUMMARY */}

            <Card
                size="small"
                style={{
                    marginBottom: 16,
                    borderRadius: 8
                }}
            >
                <Row
                    gutter={[
                        24,
                        16
                    ]}
                >
                    <Col
                        xs={12}
                        sm={6}
                    >
                        <Statistic
                            title="Receipts"
                            value={
                                report.received
                            }
                            suffix="Kg"
                            prefix={
                                <ArrowDownOutlined />
                            }
                        />
                    </Col>

                    <Col
                        xs={12}
                        sm={6}
                    >
                        <Statistic
                            title="Issues"
                            value={
                                report.issue
                            }
                            suffix="Kg"
                            prefix={
                                <ArrowUpOutlined />
                            }
                        />
                    </Col>

                    <Col
                        xs={12}
                        sm={6}
                    >
                        <Statistic
                            title="Distributions"
                            value={
                                report.distribution
                            }
                            suffix="Kg"
                            prefix={
                                <SendOutlined />
                            }
                        />
                    </Col>

                    <Col
                        xs={12}
                        sm={6}
                    >
                        <Statistic
                            title="Records"
                            value={
                                report.transactions
                            }
                            prefix={
                                <InboxOutlined />
                            }
                        />
                    </Col>
                </Row>
            </Card>

            {/* TABLE HEADER */}

            <div
                style={{
                    display: 'flex',
                    justifyContent:
                        'space-between',
                    alignItems:
                        'center',
                    marginBottom: 10,
                    flexWrap: 'wrap',
                    gap: 10
                }}
            >
                <div>
                    <strong>
                        Stock Transactions
                    </strong>

                    <span
                        style={{
                            marginLeft: 8,
                            color: '#6b7280'
                        }}
                    >
                        {filtered.length}
                        {' '}
                        records
                    </span>
                </div>

                <Space>
                    <Button
                        icon={
                            <DownloadOutlined />
                        }
                        onClick={
                            exportToCSV
                        }
                    >
                        Export Report
                    </Button>

                    <Button
                        type="primary"
                        icon={
                            <PlusOutlined />
                        }
                        onClick={
                            openCreate
                        }
                    >
                        Record Stock Movement
                    </Button>
                </Space>
            </div>

            {/* TABLE */}

            <div
                style={{
                    background:
                        '#fff',
                    border:
                        '1px solid #e5e7eb',
                    borderRadius: 8
                }}
            >
                <Table
                    rowKey="id"
                    columns={
                        columns
                    }
                    dataSource={
                        filtered
                    }
                    loading={
                        loading
                    }
                    scroll={{
                        x: 1000
                    }}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger:
                            true,
                        showTotal:
                            total =>
                                `Total ${total} transactions`
                    }}
                    locale={{
                        emptyText: (
                            <Empty
                                description="No stock movements found"
                            />
                        )
                    }}
                />
            </div>

            {/* ==================================================
                STOCK TRANSACTION FORM
                PRESERVED WITHOUT CHANGING ITS FIELDS/LOGIC
            ================================================== */}

            <Modal
                open={open}
                width={780}
                title={
                    editing
                        ? 'Edit Stock Movement'
                        : 'Record Stock Movement'
                }
                destroyOnClose
                confirmLoading={
                    saving
                }
                onCancel={() =>
                    setOpen(false)
                }
                onOk={() =>
                    form.submit()
                }
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={
                        submit
                    }
                >
                    <Divider orientation="left">
                        <DatabaseOutlined /> Stock Transaction
                    </Divider>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                name="movement_date"
                                label="Movement Date"
                                rules={[
                                    {
                                        required:
                                            true
                                    }
                                ]}
                            >
                                <DatePicker
                                    style={{
                                        width:
                                            '100%'
                                    }}
                                />
                            </Form.Item>
                        </Col>

                        <Col span={8}>
                            <Form.Item
                                name="movement_type"
                                label="Movement Type"
                                rules={[
                                    {
                                        required:
                                            true
                                    }
                                ]}
                            >
                                <Select
                                    options={[
                                        {
                                            label: 'Receipt',
                                            value: 'Receipt'
                                        },
                                        {
                                            label: 'Issue',
                                            value: 'Issue'
                                        },
                                        {
                                            label: 'Distribution',
                                            value: 'Distribution'
                                        },
                                        {
                                            label: 'Transfer',
                                            value: 'Transfer'
                                        },
                                        {
                                            label: 'Adjustment',
                                            value: 'Adjustment'
                                        }
                                    ]}
                                />
                            </Form.Item>
                        </Col>

                        <Col span={8}>
                            <Form.Item
                                name="reference_number"
                                label="Reference Number"
                            >
                                <Input placeholder="GRN / Issue / Transfer No." />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider orientation="left">
                        Input & Warehouse
                    </Divider>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="input_id"
                                label="Input"
                                rules={[
                                    {
                                        required:
                                            true
                                    }
                                ]}
                            >
                                <Select
                                    showSearch
                                    optionFilterProp="label"
                                    options={inputs.map(
                                        x => ({
                                            value:
                                                x.id,
                                            label:
                                                `${x.input_name || 'Input'} — ${x.batch_number || 'No batch'}`
                                        })
                                    )}
                                />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item
                                name="warehouse_id"
                                label="Warehouse"
                                rules={[
                                    {
                                        required:
                                            true
                                    }
                                ]}
                            >
                                <Select
                                    showSearch
                                    optionFilterProp="label"
                                    options={warehouses.map(
                                        x => ({
                                            value:
                                                x.id,
                                            label:
                                                x.name
                                        })
                                    )}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                name="quantity"
                                label="Quantity"
                                rules={[
                                    {
                                        required:
                                            true
                                    }
                                ]}
                            >
                                <InputNumber
                                    min={0.01}
                                    style={{
                                        width:
                                            '100%'
                                    }}
                                />
                            </Form.Item>
                        </Col>

                        <Col span={8}>
                            <Form.Item
                                name="unit"
                                label="Unit"
                                initialValue="Kg"
                            >
                                <Select
                                    options={[
                                        'Kg',
                                        'Quintal',
                                        'Ton',
                                        'Liter',
                                        'Piece',
                                        'Bag'
                                    ].map(
                                        x => ({
                                            label:
                                                x,
                                            value:
                                                x
                                        })
                                    )}
                                />
                            </Form.Item>
                        </Col>

                        <Col span={8}>
                            <Form.Item
                                name="unit_cost"
                                label="Unit Cost (ETB)"
                            >
                                <InputNumber
                                    min={0}
                                    style={{
                                        width:
                                            '100%'
                                    }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider orientation="left">
                        Transaction Details
                    </Divider>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="source"
                                label="Source / From"
                            >
                                <Input placeholder="Supplier, warehouse, etc." />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item
                                name="destination"
                                label="Destination / To"
                            >
                                <Input placeholder="Warehouse, recipient, etc." />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="notes"
                        label="Notes"
                    >
                        <TextArea rows={3} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

/* =========================================================
   REPORT CARD
========================================================= */

function ReportCard({
    title,
    value,
    icon,
    footer
}) {
    return (
        <div
            style={{
                background:
                    '#fff',
                border:
                    '1px solid #e5e7eb',
                borderRadius: 8,
                padding: 18,
                height: '100%',
                boxShadow:
                    '0 1px 2px rgba(0,0,0,0.03)'
            }}
        >
            <div
                style={{
                    display: 'flex',
                    justifyContent:
                        'space-between',
                    alignItems:
                        'flex-start',
                    marginBottom: 12
                }}
            >
                <span
                    style={{
                        color:
                            '#6b7280',
                        fontSize: 13,
                        fontWeight: 500
                    }}
                >
                    {title}
                </span>

                <span
                    style={{
                        fontSize: 20,
                        color:
                            '#16a34a'
                    }}
                >
                    {icon}
                </span>
            </div>

            <div
                style={{
                    fontSize: 24,
                    fontWeight: 650,
                    color:
                        '#111827',
                    marginBottom: 8
                }}
            >
                {value}
            </div>

            <div
                style={{
                    fontSize: 12,
                    color:
                        '#6b7280',
                    lineHeight: 1.5
                }}
            >
                {footer}
            </div>
        </div>
    );
}

/* =========================================================
   MINI REPORT
========================================================= */

function MiniReport({
    title,
    value,
    icon
}) {
    return (
        <div
            style={{
                background:
                    '#fff',
                border:
                    '1px solid #e5e7eb',
                borderRadius: 8,
                padding: 16
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems:
                        'center',
                    gap: 8,
                    color:
                        '#6b7280',
                    fontSize: 13,
                    marginBottom: 8
                }}
            >
                <span
                    style={{
                        color:
                            '#16a34a'
                    }}
                >
                    {icon}
                </span>

                {title}
            </div>

            <div
                style={{
                    fontSize: 20,
                    fontWeight: 650,
                    color:
                        '#111827'
                }}
            >
                {value}
            </div>
        </div>
    );
}