import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Form, Input, Select, InputNumber, message, Row, Col, Divider } from 'antd';
import { EnvironmentOutlined, AppstoreAddOutlined } from '@ant-design/icons';
import agronomyApi from '../../services/api/agronomyApi';
import api from '../../services/axios';

// ───── REUSABLE ENTERPRISE LOCATION COMPONENT ─────
import LocationScopeSelector from '../../components/common/LocationScopeSelector';

const { Option } = Select;

export default function FormInputDistributions({ open, onCancel, onSuccess, initialValues }) {
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);
    const [farmers, setFarmers] = useState([]);
    const [fetchingFarmers, setFetchingFarmers] = useState(false);

    // Form Watcher: Automatically tracks kebele_id set by LocationScopeSelector
    const selectedKebeleId = Form.useWatch('kebele_id', form);

    // Fetch Farmers belonging to the selected Kebele
    const fetchFarmers = useCallback(async (kebeleId) => {
        if (!kebeleId) {
            setFarmers([]);
            return;
        }
        setFetchingFarmers(true);
        try {
            const res = await api.get(`/extension/farmers?kebele_id=${kebeleId}`);
            setFarmers(res.data.data?.data || res.data.data || res.data || []);
        } catch (err) {
            console.error("Failed to load farmers:", err);
            message.error("Failed to load farmers");
        } finally {
            setFetchingFarmers(false);
        }
    }, []);

    // Automatically refresh Farmer list when Kebele Selection changes
    useEffect(() => {
        if (selectedKebeleId) {
            fetchFarmers(selectedKebeleId);
        } else {
            setFarmers([]);
        }
    }, [selectedKebeleId, fetchFarmers]);

    // ───── INITIALIZATION ─────
    useEffect(() => {
        if (open) {
            if (initialValues) {
                form.setFieldsValue(initialValues);
            } else {
                form.resetFields();
                setFarmers([]);
            }
        }
    }, [open, initialValues, form]);

    // ───── SUBMISSION ─────
    const onFinish = async (values) => {
        setSubmitting(true);
        try {
            const payload = { ...values };

            // Clean up frontend location filtering helpers
            delete payload.zone_id;
            delete payload.woreda_id;

            if (initialValues) {
                await agronomyApi.updateInputDistribution(initialValues.id, payload);
            } else {
                await agronomyApi.createInputDistribution(payload);
            }
            message.success('Data saved successfully');
            onSuccess(); // Closes modal and refreshes table
            form.resetFields();
        } catch (error) { 
            message.error('Failed to save input distribution data'); 
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal 
            title={initialValues ? "Edit Distribution" : "New Input Distribution"} 
            open={open} 
            onOk={form.submit} 
            onCancel={onCancel}
            confirmLoading={submitting}
            width={700} 
            destroyOnClose
        >
            <Form form={form} layout="vertical" onFinish={onFinish}>
                
                {/* 1. GEOGRAPHY & FARMER SELECTION */}
                <Divider orientation="left" style={{ marginTop: 0 }}>
                    <EnvironmentOutlined /> Select Location & Farmer
                </Divider>

                <Row gutter={16}>
                    {/* ───── 1. REUSABLE ROLE-SCOPE AWARE LOCATION SELECTOR ───── */}
                    <Col span={24}>
                        <LocationScopeSelector form={form} editingData={initialValues} />
                    </Col>

                    <Col span={24}>
                        <Form.Item 
                            name="farmer_id" 
                            label="Assign to Farmer" 
                            rules={[{ required: true, message: 'Please select a farmer' }]}
                        >
                            <Select 
                                placeholder={selectedKebeleId ? "Search & Select Farmer in this Kebele" : "Select Kebele first..."} 
                                allowClear 
                                showSearch 
                                optionFilterProp="children" 
                                disabled={!selectedKebeleId}
                                loading={fetchingFarmers}
                            >
                                {farmers.map(f => (
                                    <Option key={f.id} value={f.id}>
                                        {f.full_name || `${f.first_name || ''} ${f.last_name || ''}`} ({f.farmer_unique_id_no || f.id})
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                {/* 2. DISTRIBUTION DETAILS */}
                <Divider orientation="left">
                    <AppstoreAddOutlined /> Distribution Details
                </Divider>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="distribution_season" label="Season" rules={[{ required: true, message: 'Select season' }]}>
                            <Select placeholder="Select Season">
                                <Option value="Meher">Meher</Option>
                                <Option value="Belg">Belg</Option>
                                <Option value="Irrigation">Irrigation</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="distribution_year_ec" label="Year (EC)" rules={[{ required: true, message: 'Enter year' }]}>
                            <InputNumber placeholder="e.g. 2016" style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item name="input_category" label="Category" rules={[{ required: true, message: 'Select category' }]}>
                            <Select placeholder="Select Category">
                                <Option value="Fertilizer">Fertilizer</Option>
                                <Option value="Seed">Seed</Option>
                                <Option value="Agro-Chemicals">Agro-Chemicals</Option>
                                <Option value="Farm Implements">Farm Implements</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="specific_input" label="Specific Input" rules={[{ required: true, message: 'Enter specific input' }]}>
                            <Input placeholder="e.g. Urea, Teff" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="quantity_kg" label="Quantity (Kg)" rules={[{ required: true, message: 'Enter quantity' }]}>
                            <InputNumber min={0.1} step={0.1} placeholder="e.g. 50" style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
}