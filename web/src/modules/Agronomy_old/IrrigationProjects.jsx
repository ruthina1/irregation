import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Select, message, Row, Col, Empty, Badge } from 'antd';
import { 
    PlusOutlined, 
    SearchOutlined, 
    DownloadOutlined, 
    GlobalOutlined,
    DeploymentUnitOutlined,
    UsergroupAddOutlined,
    PieChartOutlined,
    FolderOpenOutlined
} from '@ant-design/icons';
import agronomyApi from '../../services/api/agronomyApi';
import { EditButton, DeleteButton } from '../../components/common/ActionButtons';
import FormIrrigationProjects from './FormIrrigationProjects';

export default function IrrigationProjects() {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    // Filters
    const [searchText, setSearchText] = useState('');
    const [selectedTechnology, setSelectedTechnology] = useState(undefined);
    const [selectedPhase, setSelectedPhase] = useState(undefined);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await agronomyApi.getIrrigationProjects();
            
            // Safe extraction pattern for standard arrays, axios payloads, and Laravel resource wrappers
            let records = [];
            if (Array.isArray(res)) {
                records = res;
            } else if (res && Array.isArray(res.data)) {
                records = res.data;
            } else if (res && res.data && Array.isArray(res.data.data)) {
                records = res.data.data;
            } else if (res && res.data && Array.isArray(res.data)) {
                records = res.data;
            }

            setData(records);
            setFilteredData(records);
        } catch (error) { 
            message.error("Failed to load irrigation projects"); 
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { 
        fetchData(); 
    }, []);

    // Filter Logic
    useEffect(() => {
        let results = [...data];

        if (searchText) {
            const query = searchText.toLowerCase();
            results = results.filter(item => 
                item.project_name?.toLowerCase().includes(query) ||
                String(item.kebele_id).includes(query)
            );
        }

        if (selectedTechnology) {
            results = results.filter(item => item.technology_type === selectedTechnology);
        }

        if (selectedPhase) {
            results = results.filter(item => item.project_phase === selectedPhase);
        }

        setFilteredData(results);
    }, [searchText, selectedTechnology, selectedPhase, data]);

    // Defensive KPI computations
    const safeFilteredData = Array.isArray(filteredData) ? filteredData : [];
    
    const totalProjects = safeFilteredData.length;
    
    const totalArea = safeFilteredData.reduce((acc, current) => {
        const val = parseFloat(current?.command_area_ha);
        return acc + (isNaN(val) ? 0 : val);
    }, 0).toFixed(1);
    
    const totalBeneficiaries = safeFilteredData.reduce((acc, current) => {
        const val = parseInt(current?.number_of_beneficiaries, 10);
        return acc + (isNaN(val) ? 0 : val);
    }, 0);
    
    const completedCount = safeFilteredData.filter(item => item?.project_phase === 'Completed').length;
    const completionRate = totalProjects > 0 ? ((completedCount / totalProjects) * 100).toFixed(0) : 0;

    const handleDelete = async (id) => {
        try {
            await agronomyApi.deleteIrrigationProject(id);
            message.success('Project record deleted');
            fetchData();
        } catch (error) {
            message.error('Failed to delete project record');
        }
    };

    const runExport = () => {
        if (safeFilteredData.length === 0) {
            message.warning("No records to export");
            return;
        }
        const headers = ["Project Name", "Kebele ID", "Technology", "Phase", "Command Area (Ha)", "Beneficiaries"];
        const rows = safeFilteredData.map(item => [
            `"${item.project_name || ''}"`,
            item.kebele_id || '',
            `"${item.technology_type || ''}"`,
            `"${item.project_phase || ''}"`,
            item.command_area_ha || 0,
            item.number_of_beneficiaries || 0
        ]);

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Irrigation_Projects_${new Date().toISOString().substring(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getPhaseBadgeColor = (phase) => {
        switch (phase) {
            case 'Feasibility': return 'default';
            case 'Design': return 'cyan';
            case 'Construction': return 'processing';
            case 'Completed': return 'success';
            default: return 'default';
        }
    };

    const columns = [
        { title: 'Project Name', dataIndex: 'project_name', key: 'project_name', sorter: (a, b) => (a.project_name || '').localeCompare(b.project_name || '') },
        { 
            title: 'Location (Kebele)', 
            key: 'location',
            render: (_, record) => record.kebele?.name ? `${record.kebele.name} (ID: ${record.kebele_id})` : `Kebele ID: ${record.kebele_id}` 
        },
        { title: 'Technology', dataIndex: 'technology_type', key: 'technology_type' },
        { 
            title: 'Current Phase', 
            dataIndex: 'project_phase', 
            key: 'project_phase',
            render: (phase) => <Badge status={getPhaseBadgeColor(phase)} text={phase} />
        },
        { title: 'Area (ha)', dataIndex: 'command_area_ha', key: 'command_area_ha', render: (val) => `${parseFloat(val || 0).toLocaleString()} ha` },
        { title: 'Beneficiaries', dataIndex: 'number_of_beneficiaries', key: 'number_of_beneficiaries', render: (val) => parseInt(val || 0).toLocaleString() },
        {
            title: 'Actions',
            key: 'action',
            width: 120,
            render: (_, record) => (
                <div style={{ display: 'flex', gap: 8 }}>
                    <EditButton onClick={() => { setEditingItem(record); setIsModalOpen(true); }} />
                    <DeleteButton onConfirm={() => handleDelete(record.id)} itemName="Project" />
                </div>
            )
        }
    ];

    return (
        <div style={{ padding: '24px', background: '#fafafa', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#111827', margin: 0 }}>Irrigation Project Management</h1>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>Track seasonal irrigation infrastructure developments and beneficiary distribution</p>
            </div>

            {/* KPI Cards Row */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col xs={24} sm={12} md={6}>
                    <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderTop: '3px solid #4caf50', borderRadius: '4px', padding: '20px' }}>
                        <div style={{ color: '#6b7280', fontSize: '13px', fontWeight: '500', marginBottom: '8px' }}>Total Projects</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FolderOpenOutlined style={{ color: '#4caf50', fontSize: '20px' }} />
                            <span style={{ fontSize: '24px', fontWeight: '600', color: '#111827' }}>{totalProjects}</span>
                        </div>
                    </div>
                </Col>

                <Col xs={24} sm={12} md={6}>
                    <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderTop: '3px solid #2196f3', borderRadius: '4px', padding: '20px' }}>
                        <div style={{ color: '#6b7280', fontSize: '13px', fontWeight: '500', marginBottom: '8px' }}>Command Area</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <GlobalOutlined style={{ color: '#2196f3', fontSize: '20px' }} />
                            <span style={{ fontSize: '24px', fontWeight: '600', color: '#111827' }}>
                                {totalArea} <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#6b7280' }}>ha</span>
                            </span>
                        </div>
                    </div>
                </Col>

                <Col xs={24} sm={12} md={6}>
                    <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderTop: '3px solid #ff9800', borderRadius: '4px', padding: '20px' }}>
                        <div style={{ color: '#6b7280', fontSize: '13px', fontWeight: '500', marginBottom: '8px' }}>Total Beneficiaries</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <UsergroupAddOutlined style={{ color: '#ff9800', fontSize: '20px' }} />
                            <span style={{ fontSize: '24px', fontWeight: '600', color: '#111827' }}>
                                {totalBeneficiaries.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </Col>

                <Col xs={24} sm={12} md={6}>
                    <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderTop: '3px solid #8bc34a', borderRadius: '4px', padding: '20px' }}>
                        <div style={{ color: '#6b7280', fontSize: '13px', fontWeight: '500', marginBottom: '8px' }}>Completion Rate</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <PieChartOutlined style={{ color: '#8bc34a', fontSize: '20px' }} />
                            <span style={{ fontSize: '24px', fontWeight: '600', color: '#111827' }}>
                                {completionRate}%
                            </span>
                        </div>
                    </div>
                </Col>
            </Row>

            {/* Filters Bar */}
            <div style={{
                background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '4px', padding: '16px', marginBottom: '16px',
                display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between'
            }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', flex: 1 }}>
                    <Input
                        placeholder="Search projects..."
                        prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{ width: '220px' }}
                        allowClear
                    />
                    
                    <Select
                        placeholder="All Technologies"
                        style={{ width: '170px' }}
                        value={selectedTechnology}
                        onChange={setSelectedTechnology}
                        allowClear
                    >
                        <Select.Option value="Traditional Canal">Traditional Canal</Select.Option>
                        <Select.Option value="Modern Canal">Modern Canal</Select.Option>
                        <Select.Option value="Geo-membrane">Geo-membrane</Select.Option>
                        <Select.Option value="Pond">Pond</Select.Option>
                    </Select>

                    <Select
                        placeholder="All Phases"
                        style={{ width: '150px' }}
                        value={selectedPhase}
                        onChange={setSelectedPhase}
                        allowClear
                    >
                        <Select.Option value="Feasibility">Feasibility</Select.Option>
                        <Select.Option value="Design">Design</Select.Option>
                        <Select.Option value="Construction">Construction</Select.Option>
                        <Select.Option value="Completed">Completed</Select.Option>
                    </Select>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <Button icon={<DownloadOutlined />} onClick={runExport}>Export</Button>
                    <Button 
                        type="primary" 
                        icon={<PlusOutlined />} 
                        onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
                        style={{ backgroundColor: '#1e8e3e', borderColor: '#1e8e3e' }}
                    >
                        New Project
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '4px', padding: '8px 0' }}>
                {safeFilteredData.length === 0 && !loading ? (
                    <div style={{ padding: '60px 16px', textAlign: 'center' }}>
                        <Empty
                            image={<DeploymentUnitOutlined style={{ fontSize: '48px', color: '#d1d5db' }} />}
                            description={<span style={{ color: '#6b7280' }}>No irrigation projects found matching the configuration.</span>}
                        />
                    </div>
                ) : (
                    <Table 
                        columns={columns} 
                        dataSource={safeFilteredData} 
                        rowKey="id" 
                        loading={loading}
                        pagination={{ pageSize: 10, showSizeChanger: true }}
                        style={{ padding: '0 16px' }}
                    />
                )}
            </div>

            <FormIrrigationProjects 
                open={isModalOpen} 
                onCancel={() => setIsModalOpen(false)} 
                onSuccess={() => { setIsModalOpen(false); fetchData(); }}
                initialValues={editingItem}
            />
        </div>
    );
}