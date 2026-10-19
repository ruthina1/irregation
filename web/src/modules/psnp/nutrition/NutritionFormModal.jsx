import React, { useEffect, useState } from 'react';
import { Modal, Form, Select, Row, Col, InputNumber, Switch, DatePicker, Input, Divider } from 'antd';
import dayjs from 'dayjs';
import api from '../../../services/axios';

const { Option } = Select;

export default function NutritionFormModal({ open, onCancel, onSubmit, editingData }) {
  const [form] = Form.useForm();
  const [farmers, setFarmers] = useState([]);
  
  // Watch toggle for dynamic input rendering
  const isProcessing = Form.useWatch('received_small_scale_processing_tech', form);

  useEffect(() => {
    if (open) {
      api.get('/extension/farmers').then(res => setFarmers(res.data.data.data || []));

      if (editingData) {
        form.setFieldsValue({
          ...editingData,
          assessment_date: dayjs(editingData.assessment_date),
          wash_latrine: editingData.wash_hygiene?.has_latrine,
          wash_breastfeeding: editingData.wash_hygiene?.exclusive_breastfeeding,
          wash_maternal: editingData.wash_hygiene?.is_pregnant_or_lactating,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ assessment_date: dayjs(), dietary_diversity_score: 0 });
      }
    }
  }, [open, editingData, form]);

  const handleOk = async () => {
    try {
      const vals = await form.validateFields();
      
      // Structure payload for backend
      const payload = {
        farmer_id: vals.farmer_id,
        assessment_date: vals.assessment_date.format('YYYY-MM-DD'),
        dietary_diversity_score: vals.dietary_diversity_score,
        practicing_backyard_farming: vals.practicing_backyard_farming,
        nutrient_dense_crops_grown: vals.nutrient_dense_crops_grown,
        received_small_scale_processing_tech: vals.received_small_scale_processing_tech,
        processing_tech_type: vals.processing_tech_type,
        wash_hygiene: {
          has_latrine: !!vals.wash_latrine,
          exclusive_breastfeeding: !!vals.wash_breastfeeding,
          is_pregnant_or_lactating: !!vals.wash_maternal
        }
      };

      onSubmit(payload);
    } catch (e) { /* Error caught by Form */ }
  };

  return (
    <Modal title={editingData ? "Edit Nutrition Assessment" : "New Nutrition Assessment"} open={open} onCancel={onCancel} onOk={handleOk} width={750} destroyOnClose maskClosable={false}>
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={16}>
            <Form.Item name="farmer_id" label="Household / Farmer" rules={[{required:true}]}>
              <Select showSearch optionFilterProp="children" disabled={!!editingData}>
                {farmers.map(f => <Option key={f.id} value={f.id}>{f.full_name} ({f.farmer_unique_id_no})</Option>)}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="assessment_date" label="Assessment Date" rules={[{required:true}]}><DatePicker style={{width:'100%'}}/></Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">Diet & Agriculture</Divider>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="dietary_diversity_score" label="Dietary Score (0-12)" rules={[{required:true}]}><InputNumber style={{width:'100%'}} min={0} max={12}/></Form.Item>
          </Col>
          <Col span={16}>
            <Form.Item name="nutrient_dense_crops_grown" label="Nutrient-Dense Crops (RFP Pg 24)">
              <Select mode="tags" placeholder="e.g. Soybean, Pigeon Pea, Iron-rich beans">
                <Option value="Soybean">Soybean</Option><Option value="Pigeon Pea">Pigeon Pea</Option><Option value="Cowpea">Cowpea</Option>
                <Option value="Iron-rich Beans">Iron-rich Beans</Option><Option value="Orange-fleshed Sweet Potato">Sweet Potato</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}><Form.Item name="practicing_backyard_farming" label="Backyard Farming?" valuePropName="checked"><Switch/></Form.Item></Col>
          
          <Col span={8}><Form.Item name="received_small_scale_processing_tech" label="Has Processing Tech?" valuePropName="checked"><Switch/></Form.Item></Col>
          {isProcessing && (
            <Col span={8}><Form.Item name="processing_tech_type" label="Processing Tech Type"><Input placeholder="e.g. Tomato Processing" /></Form.Item></Col>
          )}
        </Row>

        <Divider orientation="left">WASH & Maternal Health</Divider>
        <Row gutter={16}>
          <Col span={8}><Form.Item name="wash_latrine" label="Has Sanitary Latrine?" valuePropName="checked"><Switch/></Form.Item></Col>
          <Col span={8}><Form.Item name="wash_maternal" label="Pregnant / Lactating Mother in HH?" valuePropName="checked"><Switch/></Form.Item></Col>
          <Col span={8}><Form.Item name="wash_breastfeeding" label="Exclusive Breastfeeding (Under 6m)?" valuePropName="checked"><Switch/></Form.Item></Col>
        </Row>
      </Form>
    </Modal>
  );
}