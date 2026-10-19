import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Select, message, Row, Col, Tag, Space, Popconfirm } from 'antd';
import { 
    PlusOutlined, 
    SearchOutlined, 
    CheckCircleOutlined,
    CloseCircleOutlined,
    ShopOutlined,
    AppstoreOutlined,
    FileTextOutlined
} from '@ant-design/icons';
import agronomyApi from '../../services/api/agronomyApi';
import { EditButton, DeleteButton } from '../../components/common/ActionButtons';
import InputRegistrationForm from './InputRegistrationForm';

export default function InputRegistrationManagement() {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    // Filters
    const [searchText, setSearchText] = useState('');
    const [selectedStatus, setSelectedStatus] = useState(undefined);
    const [selectedType, setSelectedType] = useState(undefined);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await agronomyApi.getInputRegistrations();
            setData(res.data || []);
            setFilteredData(res.data || []);
        } catch (error) { 
            message.error("Failed to fetch registered inputs"); 
        }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    // Filter Logic
    useEffect(() => {
        let updated = [...data];
        
        if (searchText) {
            const lower = searchText.toLowerCase();
            updated = updated.filter(item => 
                (item.union_cooperative && item.union_cooperative.toLowerCase().includes(lower))
            );
        }
        if (selectedStatus) {
            updated = updated.filter(item => item.approval_status === selectedStatus);
        }
        if (selectedType) {
            updated = updated.filter(item => item.input_type === selectedType);
        }
        
        setFilteredData(updated);
    }, [searchText, selectedStatus, selectedType, data]);

    const inputTypes = Array.from(new Set(data.map(item => item.input_type).filter(Boolean)));

    // KPI Calculations
    const totalRecords = filteredData.length;
    const pendingCount = filteredData.filter(i => i.approval_status === 'Pending').length;
    const approvedCount = filteredData.filter(i => i.approval_status === 'Approved').length;

    const handleDelete = async (id) => {
        try {
            await agronomyApi.deleteInputRegistration(id);
            message.success('Record deleted successfully');
            fetchData();
        } catch (error) {
            message.error('Failed to delete record');
        }
    };

    const handleStatusChange = async (id, status) => {
        try {
            await agronomyApi.updateInputRegistrationStatus(id, status);
            message.success(`Status updated to ${status}`);
            fetchData();
        } catch (error) {
            if (error.response && error.response.status === 403) {
                message.error("Access Denied: You do not have the 'input-approval' permission.");
            } else {
                message.error('Failed to update status.');
            }
        }
    };

    const columns = [
        { 
            title: 'Union/Cooperative', 
            dataIndex: 'union_cooperative', 
            key: 'union_cooperative', 
            fontWeight: '500' 
        },
        { 
            title: 'Input Type', 
            dataIndex: 'input_type', 
            key: 'input_type' 
        },
        { 
            title: 'Amount', 
            key: 'amount', 
            render: (_, record) => (
                <span style={{ fontWeight: 'bold' }}>
                    {Number(record.amount).toLocaleString()} <span style={{ color: '#6b7280', fontSize: '12px' }}>{record.unit}</span>
                </span>
            )
        },
        { 
            title: 'Status', 
            dataIndex: 'approval_status', 
            key: 'approval_status',
            render: (status) => {
                const color = status === 'Approved' ? 'green' : status === 'Rejected' ? 'red' : 'orange';
                return <Tag color={color}>{status}</Tag>;
            }
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 280,
            render: (_, record) => (
                <Space size="middle">
                    {/* Management Actions (Only available if Pending) */}
                    {record.approval_status === 'Pending' && (
                        <>
                            <EditButton onClick={() => { setEditingItem(record); setIsModalOpen(true); }} />
                            <DeleteButton onConfirm={() => handleDelete(record.id)} />
                        </>
                    )}
                    
                    {/* Approval Workflow Actions */}
                    {record.approval_status === 'Pending' && (
                        <>
                            <Popconfirm title="Approve this registration?" onConfirm={() => handleStatusChange(record.id, 'Approved')}>
                                <Button size="small" type="primary" style={{ background: '#52c41a', borderColor: '#52c41a' }} icon={<CheckCircleOutlined />}>Approve</Button>
                            </Popconfirm>
                            <Popconfirm title="Reject this registration?" onConfirm={() => handleStatusChange(record.id, 'Rejected')}>
                                <Button size="small" danger icon={<CloseCircleOutlined />}>Reject</Button>
                            </Popconfirm>
                        </>
                    )}
                </Space>
            )
        }
    ];

    return (
        <div style={{ padding: '24px', background: '#fdfdfd', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#111827', margin: 0 }}>Input Stock Registration</h1>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>Manage and approve agricultural inputs supplied by Unions and Cooperatives</p>
            </div>

            {/* Analytical Dashboard Row */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col xs={24} sm={8}>
                    <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderTop: '3px solid #2196f3', borderRadius: '4px', padding: '20px' }}>
                        <div style={{ color: '#6b7280', fontSize: '13px', fontWeight: '500', marginBottom: '8px' }}>Total Registered Items</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <AppstoreOutlined style={{ color: '#2196f3', fontSize: '20px' }} />
                            <span style={{ fontSize: '24px', fontWeight: '600' }}>{totalRecords}</span>
                        </div>
                    </div>
                </Col>
                <Col xs={24} sm={8}>
                    <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderTop: '3px solid #ff9800', borderRadius: '4px', padding: '20px' }}>
                        <div style={{ color: '#6b7280', fontSize: '13px', fontWeight: '500', marginBottom: '8px' }}>Pending Approvals</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FileTextOutlined style={{ color: '#ff9800', fontSize: '20px' }} />
                            <span style={{ fontSize: '24px', fontWeight: '600' }}>{pendingCount}</span>
                        </div>
                    </div>
                </Col>
                <Col xs={24} sm={8}>
                    <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderTop: '3px solid #4caf50', borderRadius: '4px', padding: '20px' }}>
                        <div style={{ color: '#6b7280', fontSize: '13px', fontWeight: '500', marginBottom: '8px' }}>Approved Stocks</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ShopOutlined style={{ color: '#4caf50', fontSize: '20px' }} />
                            <span style={{ fontSize: '24px', fontWeight: '600' }}>{approvedCount}</span>
                        </div>
                    </div>
                </Col>
            </Row>

            {/* Filter and Control Bar */}
            <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '4px', padding: '16px', marginBottom: '16px', display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '12px', flex: 1, flexWrap: 'wrap' }}>
                    <Input 
                        placeholder="Search Cooperative Name..." 
                        prefix={<SearchOutlined />} 
                        value={searchText} 
                        onChange={(e) => setSearchText(e.target.value)} 
                        style={{ width: '280px' }} 
                        allowClear 
                    />
                    <Select 
                        placeholder="Filter by Type" 
                        style={{ width: '180px' }} 
                        value={selectedType} 
                        onChange={setSelectedType} 
                        allowClear
                    >
                        {inputTypes.map(t => <Select.Option key={t} value={t}>{t}</Select.Option>)}
                    </Select>
                    <Select 
                        placeholder="Filter by Status" 
                        style={{ width: '150px' }} 
                        value={selectedStatus} 
                        onChange={setSelectedStatus} 
                        allowClear
                    >
                        <Select.Option value="Pending">Pending</Select.Option>
                        <Select.Option value="Approved">Approved</Select.Option>
                        <Select.Option value="Rejected">Rejected</Select.Option>
                    </Select>
                </div>
                <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    onClick={() => { setEditingItem(null); setIsModalOpen(true); }} 
                    style={{ backgroundColor: '#1e8e3e' }}
                >
                    Register Input Stock
                </Button>
            </div>

            {/* Table */}
            <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '4px' }}>
                <Table 
                    columns={columns} 
                    dataSource={filteredData} 
                    rowKey="id" 
                    loading={loading} 
                    pagination={{ pageSize: 10 }} 
                />
            </div>

            <InputRegistrationForm 
                open={isModalOpen} 
                onCancel={() => setIsModalOpen(false)} 
                onSuccess={() => { setIsModalOpen(false); fetchData(); }}
                initialValues={editingItem}
            />
        </div>
    );
}