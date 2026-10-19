import React, { useEffect } from 'react';
import { 
  Modal, Form, Input, Select, Row, Col, InputNumber, 
  Tabs, Button, Space, message, Switch, Divider 
} from 'antd';
import { 
  PlusOutlined, MinusCircleOutlined, GlobalOutlined 
} from '@ant-design/icons';

// ───── REUSABLE ENTERPRISE COMPONENTS ─────
import LocationScopeSelector from '../../../components/common/LocationScopeSelector';
import ReusableLocationPicker from '../../../components/common/ReusableLocationPicker';

const { Option } = Select;

export default function FtcFormModal({ open, onCancel, onSubmit, loading, editingFtc }) {
  const [form] = Form.useForm();

  // ───── INITIALIZATION ─────
  useEffect(() => {
    if (open) {
      if (editingFtc) {
        // Edit Mode: Populate data & transform DB location format to Component format
        form.setFieldsValue({
          ...editingFtc,
          location: editingFtc.location ? {
            lat: editingFtc.location.latitude,
            lng: editingFtc.location.longitude,
            accuracy: editingFtc.location.accuracy_meters
          } : null
        });
      } else {
        // Create Mode: Reset fields and apply default dropdown selections & official indicators
        form.resetFields();
        form.setFieldsValue({
          fiscal_year: '2019 E.C.',
          season: 'Meher (መኸር)',
          infrastructure_category: 'Solar Power & Digital Hub Installation (የሶላር ሃይልና ዲጂታል ማዕከል)',
          project_status: 'Under Construction / Upgrading',
          capacity_level: 'Basic',
          construction_status: 'Completed',
          audit_status: 'Not Audited', 
          tenure_status: 'None',      
          deficiency_found: false,
          male_beneficiaries: 50,
          female_beneficiaries: 30,
          married_women_beneficiaries: 25,
          youth_beneficiaries: 20,
          investors_beneficiaries: 2
        });
      }
    }
  }, [open, editingFtc, form]);

  // ───── SUBMISSION ─────
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const payload = { ...values };
      
      // Clean up frontend helper fields used for location cascading
      delete payload.zone_id;
      delete payload.woreda_id;

      // Transform ReusableLocationPicker format back into Database format
      if (payload.location && payload.location.lat) {
        payload.location = {
          latitude: payload.location.lat,
          longitude: payload.location.lng,
          accuracy_meters: payload.location.accuracy || null
        };
      } else {
        delete payload.location; 
      }

      onSubmit(payload);
    } catch (error) {
      message.error("Please fill all required fields correctly.");
    }
  };

  const tabsItems = [
    {
      key: '1',
      label: 'Core & Location',
      children: (
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="ftc_name" label="FTC Name" rules={[{ required: true, message: 'FTC Name is required' }]}>
              <Input placeholder="E.g. Segele Model FTC" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="fiscal_year" label="Fiscal Year (በጀት ዓመት)" rules={[{ required: true }]}>
              <Select>
                <Option value="2016 E.C.">2016 E.C.</Option>
                <Option value="2017 E.C.">2017 E.C.</Option>
                <Option value="2018 E.C.">2018 E.C.</Option>
                <Option value="2019 E.C.">2019 E.C.</Option>
                <Option value="2020 E.C.">2020 E.C.</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="season" label="Season (የምርት ወቅት)" rules={[{ required: true }]}>
              <Select>
                <Option value="Meher (መኸር)">Meher (መኸር)</Option>
                <Option value="Belg (በልግ)">Belg (በልግ)</Option>
                <Option value="Bega / Irrigation (መስኖ/በጋ)">Bega / Irrigation (መስኖ/በጋ)</Option>
              </Select>
            </Form.Item>
          </Col>
          
          {/* ───── 1. AUTO-DETECTING ROLE SCOPE LOCATION BOUNDARY ───── */}
          <Col span={24}>
            <LocationScopeSelector form={form} editingData={editingFtc} />
          </Col>

          {/* ───── 2. REUSABLE GIS MAP LOCATION PICKER ───── */}
          <Col span={24}>
            <Form.Item name="location" label={<span style={{ fontWeight: 600, fontSize: '15px' }}><GlobalOutlined /> Exact GIS Coordinates</span>}>
              <ReusableLocationPicker autoLocate={!editingFtc} />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item name="capacity_level" label="Capacity Level" rules={[{ required: true }]}>
              <Select>
                <Option value="Advanced">Advanced</Option>
                <Option value="Intermediate">Intermediate</Option>
                <Option value="Basic">Basic</Option>
                <Option value="Below Standard">Below Standard</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="construction_status" label="Construction Status" rules={[{ required: true }]}>
              <Select>
                <Option value="Completed">Completed</Option>
                <Option value="Under Construction">Under Construction</Option>
                <Option value="Not Started">Not Started</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      )
    },
    {
      key: '2',
      label: 'Land & Infrastructure',
      children: (
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="demo_land_ha" label="Demo Land (Ha)">
              <InputNumber style={{ width: '100%' }} min={0} step={0.1} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="tenure_status" label="Tenure Status" rules={[{ required: true }]}>
              <Select>
                <Option value="Green Book">Green Book</Option>
                <Option value="Cadaster">Cadaster</Option>
                <Option value="None">None</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="registration_number" label="Registration Number">
              <Input placeholder="E.g. AM-GB-2023-001" />
            </Form.Item>
          </Col>
          
          <Col span={12}>
            <Form.Item name="building_types" label="Building Types">
              <Select mode="multiple" placeholder="Select types">
                <Option value="Block">Block</Option>
                <Option value="Corrugated Iron">Corrugated Iron</Option>
                <Option value="Wood">Wood</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="utilities" label="Utilities">
              <Select mode="multiple" placeholder="Select utilities">
                <Option value="Electricity">Electricity</Option>
                <Option value="Water">Water</Option>
                <Option value="Telephone/Internet">Telephone/Internet</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      )
    },
    {
      key: '3',
      label: 'Finance & Audit',
      children: (
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="audit_status" label="Audit Status" rules={[{ required: true }]}>
              <Select>
                <Option value="Audited">Audited</Option>
                <Option value="Not Audited">Not Audited</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
             <Form.Item name="deficiency_found" label="Deficiency Found" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="savings_amount_birr" label="Savings (Birr)">
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="fixed_assets_value_birr" label="Fixed Assets Value (Birr)">
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="total_budget_birr" label="Total Budget (Birr)">
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
          </Col>
        </Row>
      )
    },
    {
      key: '4',
      label: 'Upgrades & Beneficiaries',
      children: (
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="infrastructure_category" label="FTC Infrastructure / Upgrade Category" rules={[{ required: true }]}>
              <Select>
                <Option value="New Training Hall Construction (አዲስ የስልጠና አዳራሽ ግንባታ)">New Training Hall Construction (አዲስ የስልጠና አዳራሽ ግንባታ)</Option>
                <Option value="FTC Office & Library Upgrade (የቢሮና ቤተ-መጽሐፍት እድሳት)">FTC Office & Library Upgrade (የቢሮና ቤተ-መጽሐፍት እድሳት)</Option>
                <Option value="Demonstration Shed & Fencing (የማሳ ማሳያ አጥርና መጋረጃ)">Demonstration Shed & Fencing (የማሳ ማሳያ አጥርና መጋረጃ)</Option>
                <Option value="Solar Power & Digital Hub Installation (የሶላር ሃይልና ዲጂታል ማዕከል)">Solar Power & Digital Hub Installation (የሶላር ሃይልና ዲጂታል ማዕከል)</Option>
                <Option value="Water Supply & Sanitation Facility (የንጹህ ውሃና መጸዳጃ ቤት ግንባታ)">Water Supply & Sanitation Facility (የንጹህ ውሃና መጸዳጃ ቤት ግንባታ)</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="project_status" label="Upgrading / Construction Status" rules={[{ required: true }]}>
              <Select>
                <Option value="Completed & Handed Over">Completed & Handed Over</Option>
                <Option value="Under Construction / Upgrading">Under Construction / Upgrading</Option>
                <Option value="Pending Procurement">Pending Procurement</Option>
                <Option value="Deferred">Deferred</Option>
              </Select>
            </Form.Item>
          </Col>

          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Beneficiaries Reached by Cohort (ተጠቃሚዎች በወኪል ምድብ)
          </Divider>
          <Col span={8}>
            <Form.Item name="male_beneficiaries" label="Male Beneficiaries (ወንድ)" rules={[{ required: true }]}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="female_beneficiaries" label="Female Beneficiaries (ሴት)" rules={[{ required: true }]}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="married_women_beneficiaries" label="Married Women (ባለትዳር)" rules={[{ required: true }]}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="youth_beneficiaries" label="Youth Beneficiaries (ወጣቶች)" rules={[{ required: true }]}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="investors_beneficiaries" label="Private Investors (ባለሃብቶች)" rules={[{ required: true }]}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
      )
    },
    {
      key: '5',
      label: 'Assets & Committees',
      children: (
        <Row gutter={24}>
          <Col span={12}>
            <h4 style={{ marginBottom: 16 }}>FTC Assets</h4>
            <Form.List name="assets">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                      <Form.Item {...restField} name={[name, 'asset_type']} rules={[{ required: true, message: 'Missing type' }]}>
                        <Input placeholder="Type (e.g. Tractor)" />
                      </Form.Item>
                      <Form.Item {...restField} name={[name, 'quantity']} rules={[{ required: true, message: 'Missing qty' }]}>
                        <InputNumber min={1} placeholder="Qty" />
                      </Form.Item>
                      <Form.Item {...restField} name={[name, 'condition']}>
                        <Select placeholder="Condition" style={{ width: 100 }}>
                          <Option value="Functional">Functional</Option>
                          <Option value="Broken">Broken</Option>
                        </Select>
                      </Form.Item>
                      <MinusCircleOutlined onClick={() => remove(name)} style={{ color: 'red' }} />
                    </Space>
                  ))}
                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>Add Asset</Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Col>
          <Col span={12}>
            <h4 style={{ marginBottom: 16 }}>Committee Members</h4>
            <Form.List name="committees">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline" wrap>
                      <Form.Item {...restField} name={[name, 'full_name']} rules={[{ required: true, message: 'Missing Name' }]}>
                        <Input placeholder="Full Name" />
                      </Form.Item>
                      <Form.Item {...restField} name={[name, 'role_in_committee']}>
                        <Input placeholder="Role" />
                      </Form.Item>
                      <Form.Item {...restField} name={[name, 'phone_number']}>
                        <Input placeholder="Phone" style={{ width: 120 }} />
                      </Form.Item>
                      <MinusCircleOutlined onClick={() => remove(name)} style={{ color: 'red' }} />
                    </Space>
                  ))}
                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>Add Member</Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Col>
        </Row>
      )
    }
  ];

  return (
    <Modal
      title={
        <span style={{ fontFamily: "'Times New Roman', Times, serif", fontWeight: 'bold' }}>
          {editingFtc ? "Edit FTC Profile" : "Register New FTC"}
        </span>
      }
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={loading}
      okText="Save FTC"
      width={1000} 
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Tabs defaultActiveKey="1" items={tabsItems} />
      </Form>
    </Modal>
  );
}