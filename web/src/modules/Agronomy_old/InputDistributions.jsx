import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Select, message, Row, Col, Empty } from 'antd';
import { 
    PlusOutlined, 
    SearchOutlined, 
    DownloadOutlined, 
    InboxOutlined,
    ContainerOutlined,
    InboxOutlined as StockIcon,
    TeamOutlined,
    CalculatorOutlined
} from '@ant-design/icons';
import agronomyApi from '../../services/api/agronomyApi';
import { EditButton, DeleteButton } from '../../components/common/ActionButtons';
import FormInputDistributions from './FormInputDistributions';

export default function InputDistributions() {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    // Filter states
    const [searchText, setSearchText] = useState('');
    const [selectedSeason, setSelectedSeason] = useState(undefined);
    const [selectedCategory, setSelectedCategory] = useState(undefined);
    const [selectedYear, setSelectedYear] = useState(undefined);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await agronomyApi.getInputDistributions();
            const records = res.data || [];
            setData(records);
            setFilteredData(records);
        } catch (error) { 
            message.error("Failed to fetch data"); 
        }
        setLoading(false);
    };

    useEffect(() => { 
        fetchData(); 
    }, []);

    // Filter Logic
    useEffect(() => {
        let updated = [...data];

        if (searchText) {
            const searchLower = searchText.toLowerCase();
            updated = updated.filter(item => 
                (item.farmer_id && item.farmer_id.toLowerCase().includes(searchLower)) ||
                (item.specific_input && item.specific_input.toLowerCase().includes(searchLower))
            );
        }

        if (selectedSeason) {
            updated = updated.filter(item => item.distribution_season === selectedSeason);
        }

        if (selectedCategory) {
            updated = updated.filter(item => item.input_category === selectedCategory);
        }

        if (selectedYear) {
            updated = updated.filter(item => String(item.distribution_year_ec) === String(selectedYear));
        }

        setFilteredData(updated);
    }, [searchText, selectedSeason, selectedCategory, selectedYear, data]);

    // Unique filter options gathered from current data
    const seasons = Array.from(new Set(data.map(item => item.distribution_season).filter(Boolean)));
    const categories = Array.from(new Set(data.map(item => item.input_category).filter(Boolean)));
    const years = Array.from(new Set(data.map(item => item.distribution_year_ec).filter(Boolean)));

    // KPI Calculations
    const totalRecords = filteredData.length;
    const totalQuantity = filteredData.reduce((acc, item) => acc + (Number(item.quantity_kg) || 0), 0);
    const uniqueFarmers = Array.from(new Set(filteredData.map(item => item.farmer_id))).length;
    const avgQuantity = totalRecords > 0 ? (totalQuantity / totalRecords).toFixed(1) : '0.0';

    const handleDelete = async (id) => {
        try {
            await agronomyApi.deleteInputDistribution(id);
            message.success('Record deleted successfully');
            fetchData();
        } catch (error) {
            message.error('Failed to delete record');
        }
    };

    // Simple CSV export function
    const exportToCSV = () => {
        if (filteredData.length === 0) {
            message.info("No data available to export");
            return;
        }
        const headers = ["Farmer ID", "Season", "Year (EC)", "Category", "Specific Input", "Quantity (Kg)"];
        const rows = filteredData.map(item => [
            item.farmer_id,
            item.distribution_season,
            item.distribution_year_ec,
            item.input_category,
            item.specific_input,
            item.quantity_kg
        ]);

        const csvContent = "data:text/csv;charset=utf-8," 
            + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Input_Distributions_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const columns = [
        { title: 'Farmer ID', dataIndex: 'farmer_id', key: 'farmer_id' },
        { title: 'Season', dataIndex: 'distribution_season', key: 'distribution_season' },
        { title: 'Year (EC)', dataIndex: 'distribution_year_ec', key: 'distribution_year_ec' },
        { title: 'Category', dataIndex: 'input_category', key: 'input_category' },
        { title: 'Specific Input', dataIndex: 'specific_input', key: 'specific_input' },
        { title: 'Qty (Kg)', dataIndex: 'quantity_kg', key: 'quantity_kg', render: (val) => `${val?.toLocaleString() || 0} Kg` },
        {
            title: 'Actions',
            key: 'actions',
            width: 120,
            render: (_, record) => (
                <div style={{ display: 'flex', gap: 8 }}>
                    <EditButton onClick={() => { setEditingItem(record); setIsModalOpen(true); }} />
                    <DeleteButton onConfirm={() => handleDelete(record.id)} itemName="Distribution" />
                </div>
            )
        }
    ];

    return (
        <div style={{ padding: '24px', background: '#fdfdfd', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
            
            {/* Header section matching style */}
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#111827', margin: 0 }}>Input Distribution Management</h1>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>Track seasonal input provisions, specific categories, and distribution performance across farmers</p>
            </div>

            {/* Analytical Dashboard Row */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col xs={24} sm={12} md={6}>
                    <div style={{
                        background: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderTop: '3px solid #4caf50',
                        borderRadius: '4px',
                        padding: '20px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}>
                        <div style={{ color: '#6b7280', fontSize: '13px', fontWeight: '500', marginBottom: '8px' }}>Total Records</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ContainerOutlined style={{ color: '#4caf50', fontSize: '20px' }} />
                            <span style={{ fontSize: '24px', fontWeight: '600', color: '#111827' }}>{totalRecords}</span>
                        </div>
                    </div>
                </Col>

                <Col xs={24} sm={12} md={6}>
                    <div style={{
                        background: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderTop: '3px solid #2196f3',
                        borderRadius: '4px',
                        padding: '20px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}>
                        <div style={{ color: '#6b7280', fontSize: '13px', fontWeight: '500', marginBottom: '8px' }}>Total Quantity Distributed</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <StockIcon style={{ color: '#2196f3', fontSize: '20px' }} />
                            <span style={{ fontSize: '24px', fontWeight: '600', color: '#111827' }}>
                                {totalQuantity.toLocaleString()} <span style={{ fontSize: '16px', fontWeight: 'normal', color: '#4b5563' }}>Kg</span>
                            </span>
                        </div>
                    </div>
                </Col>

                <Col xs={24} sm={12} md={6}>
                    <div style={{
                        background: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderTop: '3px solid #ff9800',
                        borderRadius: '4px',
                        padding: '20px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}>
                        <div style={{ color: '#6b7280', fontSize: '13px', fontWeight: '500', marginBottom: '8px' }}>Unique Farmers Assisted</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <TeamOutlined style={{ color: '#ff9800', fontSize: '20px' }} />
                            <span style={{ fontSize: '24px', fontWeight: '600', color: '#111827' }}>{uniqueFarmers}</span>
                        </div>
                    </div>
                </Col>

                <Col xs={24} sm={12} md={6}>
                    <div style={{
                        background: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderTop: '3px solid #8bc34a',
                        borderRadius: '4px',
                        padding: '20px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}>
                        <div style={{ color: '#6b7280', fontSize: '13px', fontWeight: '500', marginBottom: '8px' }}>Avg Qty per Record</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <CalculatorOutlined style={{ color: '#8bc34a', fontSize: '20px' }} />
                            <span style={{ fontSize: '24px', fontWeight: '600', color: '#111827' }}>
                                {avgQuantity} <span style={{ fontSize: '16px', fontWeight: 'normal', color: '#4b5563' }}>Kg</span>
                            </span>
                        </div>
                    </div>
                </Col>
            </Row>

            {/* Filter and Control Bar */}
            <div style={{
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
                padding: '16px',
                marginBottom: '16px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                {/* Search & Select Controls */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', flex: 1, minWidth: '280px' }}>
                    <Input
                        placeholder="Search farmer or specific input..."
                        prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{ width: '240px' }}
                        allowClear
                    />
                    
                    <Select
                        placeholder="All Seasons"
                        style={{ width: '150px' }}
                        value={selectedSeason}
                        onChange={setSelectedSeason}
                        allowClear
                    >
                        {seasons.map(s => <Select.Option key={s} value={s}>{s}</Select.Option>)}
                    </Select>

                    <Select
                        placeholder="All Categories"
                        style={{ width: '150px' }}
                        value={selectedCategory}
                        onChange={setSelectedCategory}
                        allowClear
                    >
                        {categories.map(c => <Select.Option key={c} value={c}>{c}</Select.Option>)}
                    </Select>

                    <Select
                        placeholder="All Years"
                        style={{ width: '130px' }}
                        value={selectedYear}
                        onChange={setSelectedYear}
                        allowClear
                    >
                        {years.map(y => <Select.Option key={y} value={String(y)}>{y}</Select.Option>)}
                    </Select>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '12px' }}>
                    <Button 
                        icon={<DownloadOutlined />} 
                        onClick={exportToCSV}
                        style={{ display: 'inline-flex', alignItems: 'center' }}
                    >
                        Export
                    </Button>
                    <Button 
                        type="primary" 
                        icon={<PlusOutlined />} 
                        onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
                        style={{ 
                            backgroundColor: '#1e8e3e', 
                            borderColor: '#1e8e3e',
                            display: 'inline-flex',
                            alignItems: 'center'
                        }}
                    >
                        Record Distribution
                    </Button>
                </div>
            </div>

            {/* Data Display Table or Empty State */}
            <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '4px', padding: '8px 0' }}>
                {filteredData.length === 0 && !loading ? (
                    <div style={{ padding: '60px 16px', textAlign: 'center' }}>
                        <Empty
                            image={<InboxOutlined style={{ fontSize: '48px', color: '#d1d5db' }} />}
                            description={
                                <span style={{ color: '#6b7280', fontSize: '14px' }}>
                                    No distribution records found.
                                </span>
                            }
                        />
                    </div>
                ) : (
                    <Table 
                        columns={columns} 
                        dataSource={filteredData} 
                        rowKey="id" 
                        loading={loading}
                        pagination={{ pageSize: 10, showSizeChanger: true }}
                        style={{ padding: '0 16px' }}
                    />
                )}
            </div>

            <FormInputDistributions 
                open={isModalOpen} 
                onCancel={() => setIsModalOpen(false)} 
                onSuccess={() => { setIsModalOpen(false); fetchData(); }}
                initialValues={editingItem}
            />
        </div>
    );
}