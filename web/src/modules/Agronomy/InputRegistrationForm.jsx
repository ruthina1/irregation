import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, InputNumber, message, Row, Col, Divider } from 'antd';
import { AppstoreAddOutlined, TeamOutlined } from '@ant-design/icons';
import agronomyApi from '../../services/api/agronomyApi';
import api from '../../services/axios'; // Ensure this points to your standard axios instance

const { Option } = Select;
const { TextArea } = Input;

export default function InputRegistrationForm({ open, onCancel, onSuccess, initialValues }) {
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);
    
    // State for dynamic cooperatives
    const [cooperatives, setCooperatives] = useState([]);
    const [fetchingCoops, setFetchingCoops] = useState(false);

    // Fetch Cooperatives from the API
    const fetchCooperatives = async () => {
        setFetchingCoops(true);
        try {
            const res = await api.get('/extension/cooperative/cooperatives');
            // Handle both paginated and non-paginated API responses
            const coopData = res.data?.data?.data || res.data?.data || res.data || [];
            setCooperatives(coopData);
        } catch (error) {
            console.error("Failed to load cooperatives:", error);
            message.error('Failed to load Cooperatives list');
        } finally {
            setFetchingCoops(false);
        }
    };

    useEffect(() => {
        if (open) {
            fetchCooperatives(); // Load the cooperatives every time the modal opens
            
            if (initialValues) {
                form.setFieldsValue(initialValues);
            } else {
                form.resetFields();
            }
        }
    }, [open, initialValues, form]);

    const onFinish = async (values) => {
        setSubmitting(true);
        try {
            if (initialValues) {
                await agronomyApi.updateInputRegistration(initialValues.id, values);
                message.success('Registration updated successfully');
            } else {
                await agronomyApi.createInputRegistration(values);
                message.success('Input registered successfully. Awaiting approval.');
            }
            onSuccess();
            form.resetFields();
        } catch (error) {
            message.error(error.response?.data?.message || 'Failed to save registration');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal 
            title={initialValues ? "Edit Input Registration" : "Register New Input Stock"} 
            open={open} 
            onOk={form.submit} 
            onCancel={onCancel}
            confirmLoading={submitting}
            width={600} 
            destroyOnClose
        >
            <Form form={form} layout="vertical" onFinish={onFinish}>
                
                <Divider orientation="left" style={{ marginTop: 0 }}><TeamOutlined /> Provider Details</Divider>
                
                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item 
                            name="union_cooperative" 
                            label="Union / Cooperative Name (Owner)" 
                            rules={[{ required: true, message: 'Please select the union or cooperative' }]}
                        >
                            <Select 
                                showSearch
                                placeholder="Search & Select Cooperative" 
                                size="large"
                                loading={fetchingCoops}
                                optionFilterProp="children" // Allows searching by the text inside the option
                            >
                                {cooperatives.map(coop => {
                                    // Extract the name. Adjust 'name' if your API uses 'cooperative_name', 'title', etc.
                                    const coopName = coop.name || coop.cooperative_name || `Cooperative #${coop.id}`;
                                    return (
                                        // We pass the Name (string) as the value to satisfy the backend validation
                                        <Option key={coop.id} value={coopName}>
                                            {coopName}
                                        </Option>
                                    );
                                })}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Divider orientation="left"><AppstoreAddOutlined /> Input Specifications</Divider>

                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item 
                            name="input_type" 
                            label="Input Type" 
                            rules={[{ required: true, message: 'Please select input type' }]}
                        >
                            <Select placeholder="Select Type" size="large" allowClear>
                                <Option value="Fertilizer">Fertilizer</Option>
                                <Option value="Improved Seed">Improved Seed</Option>
                                <Option value="Agro-Chemical">Agro-Chemical</Option>
                                <Option value="Farm Machinery">Farm Machinery</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={14}>
                        <Form.Item 
                            name="amount" 
                            label="Amount" 
                            rules={[{ required: true, message: 'Please enter the amount' }]}
                        >
                            <InputNumber 
                                min={0.01} 
                                step={1} 
                                placeholder="e.g. 500" 
                                style={{ width: '100%' }} 
                                size="large" 
                            />
                        </Form.Item>
                    </Col>
                    <Col span={10}>
                        <Form.Item 
                            name="unit" 
                            label="Unit of Measurement" 
                            rules={[{ required: true, message: 'Select unit' }]}
                        >
                            <Select placeholder="Select Unit" size="large">
                                <Option value="Kg">Kilograms (Kg)</Option>
                                <Option value="Quintal">Quintals (Qt)</Option>
                                <Option value="Liter">Liters (L)</Option>
                                <Option value="Pieces">Pieces / Units</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item name="remarks" label="Additional Remarks (Optional)">
                            <TextArea rows={3} placeholder="Add any details regarding brand, quality, or batch number..." />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
}