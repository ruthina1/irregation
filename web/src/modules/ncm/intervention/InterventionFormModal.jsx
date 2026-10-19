import React, { useEffect, useState } from 'react';
import { Modal, Form, Select, Row, Col, InputNumber, Divider } from 'antd';
import api from '../../../services/axios';

const { Option } = Select;

export default function InterventionFormModal({ open, onCancel, onSubmit, editingData }) {
  const [form] = Form.useForm();
  const [watersheds, setWatersheds] = useState([]);
  
  // Watch category to change dropdown options dynamically
  const category = Form.useWatch('intervention_category', form);

  useEffect(() => {
    if (open) {
      // Fetch available watersheds from NCM module
      api.get('/ncm/watersheds').then(res => setWatersheds(res.data.data || res.data));

      if (editingData) {
        form.setFieldsValue({ ...editingData });
      } else {
        form.resetFields();
        form.setFieldsValue({ 
          intervention_category: 'Physical', 
          year_implemented_ec: 2016 
        });
      }
    }
  }, [open, editingData, form]);

  const physicalTypes = ['Bench Terraces', 'Trench-Integrated Terraces', 'Communal Terraces', 'Check-dams', 'Flood Diversion Canals', 'Percolation Pits'];
  const biologicalTypes = ['Afforestation', 'Area Enclosure', 'Forage Development', 'Grass Terraces'];

  const typeOptions = category === 'Biological' ? biologicalTypes : physicalTypes;

  const handleOk = async () => {
    try {
      const vals = await form.validateFields();
      onSubmit(vals);
    } catch (e) { /* Form handles validation UI */ }
  };

  return (
    <Modal title={editingData ? "Edit Intervention" : "Record NCM Intervention"} open={open} onCancel={onCancel} onOk={handleOk} width={650} destroyOnClose maskClosable={false}>
      <Form form={form} layout="vertical">
        <Divider orientation="left">Target Area</Divider>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name="watershed_id" label="Select Watershed" rules={[{required:true}]}>
              <Select showSearch optionFilterProp="children" disabled={!!editingData} placeholder="Search by name or code">
                {watersheds.map(ws => <Option key={ws.id} value={ws.id}>{ws.watershed_name} ({ws.watershed_code}) - {ws.kebele?.name}</Option>)}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">Intervention Details</Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="intervention_category" label="Category" rules={[{required:true}]}>
              <Select onChange={() => form.setFieldsValue({ intervention_type: undefined })}>
                <Option value="Physical">Physical Structure</Option>
                <Option value="Biological">Biological Treatment</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="intervention_type" label="Specific Type" rules={[{required:true}]}>
              <Select showSearch placeholder="Select activity type">
                {typeOptions.map(t => <Option key={t} value={t}>{t}</Option>)}
              </Select>
            </Form.Item>
          </Col>
          
          <Col span={12}>
            <Form.Item name="treated_area_ha" label="Treated Area (Ha)" rules={[{required:true}]}>
              <InputNumber style={{width:'100%'}} min={0.01} step={0.1} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="year_implemented_ec" label="Year Implemented (EC)" rules={[{required:true}]}>
              <InputNumber style={{width:'100%'}} min={2000} max={2100} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}