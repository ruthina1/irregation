import React, { useEffect, useState } from 'react';
import { 
  Modal, Form, Input, Select, Row, Col, Divider, message, 
  Alert, Tooltip, Space, Typography 
} from 'antd';
import { 
  UserOutlined, MailOutlined, PhoneOutlined, SafetyCertificateOutlined,
  GlobalOutlined, EnvironmentOutlined, BankOutlined, CheckCircleFilled,
  CloseCircleFilled, LockOutlined, EditOutlined, UserAddOutlined
} from '@ant-design/icons';
import { umacApi } from '../../services/api/umacApi';
import api from '../../services/axios';

const { Text } = Typography;

// Brand Colors (matching your dashboard)
const COLORS = {
  primary: '#1F6D4C',
  primaryLight: '#E9F2EC',
  border: '#E5E1D3',
  text: '#1D241F',
  textMuted: '#66705F',
  danger: '#B3261E',
  success: '#2E7D32'
};

export default function UserFormModal({ open, onCancel, onSubmit, loading, editingUser }) {
  const [form] = Form.useForm();
  
  // Real-time password watcher for the policy checklist
  const passwordValue = Form.useWatch('password', form) || '';

  // ───── Dynamic Roles State ─────────────────────────────────────
  const [dynamicRoles, setDynamicRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);

  // ───── Location State ─────────────────────────────────────────
  const [zones, setZones] = useState([]);
  const [woredas, setWoredas] = useState([]);
  const [kebeles, setKebeles] = useState([]);

  const [loadingZones, setLoadingZones] = useState(false);
  const [loadingWoredas, setLoadingWoredas] = useState(false);
  const [loadingKebeles, setLoadingKebeles] = useState(false);

  // ───── API Fetching Logic ─────────────────────────────────────
  const fetchDynamicRoles = async () => {
    setLoadingRoles(true);
    try {
      const response = await umacApi.getRoles();
      setDynamicRoles(response.data?.data || []);
    } catch (error) {
      message.error("Failed to load user system roles");
    } finally {
      setLoadingRoles(false);
    }
  };

  const fetchZones = async () => {
    setLoadingZones(true);
    try {
      const response = await api.get('/zones');
      setZones(response.data.data || response.data); 
    } catch (error) {
      message.error("Failed to load Zones");
    } finally {
      setLoadingZones(false);
    }
  };

  const fetchWoredas = async (zoneId) => {
    setLoadingWoredas(true);
    try {
      const response = await api.get(`/woredas?zone_id=${zoneId}`);
      setWoredas(response.data.data || response.data);
    } catch (error) {
      message.error("Failed to load Woredas");
    } finally {
      setLoadingWoredas(false);
    }
  };

  const fetchKebeles = async (woredaId) => {
    setLoadingKebeles(true);
    try {
      const response = await api.get(`/kebeles?woreda_id=${woredaId}`);
      setKebeles(response.data.data || response.data);
    } catch (error) {
      message.error("Failed to load Kebeles");
    } finally {
      setLoadingKebeles(false);
    }
  };

  // ───── Modal Initialization ───────────────────────────────────
  useEffect(() => {
    if (open) {
      fetchDynamicRoles();
      fetchZones();

      if (editingUser) {
        const roleName = editingUser.roles?.[0]?.name || editingUser.role || '';
        form.setFieldsValue({ ...editingUser, role: roleName });

        if (editingUser.zone_id) fetchWoredas(editingUser.zone_id);
        if (editingUser.woreda_id) fetchKebeles(editingUser.woreda_id);
      } else {
        form.resetFields();
        setWoredas([]);
        setKebeles([]);
      }
    }
  }, [open, editingUser, form]);

  // ───── Cascading Handlers ─────────────────────────────────────
  const handleZoneChange = (zoneId) => {
    form.setFieldsValue({ woreda_id: undefined, kebele_id: undefined });
    setKebeles([]); 
    
    if (zoneId) fetchWoredas(zoneId);
    else setWoredas([]);
  };

  const handleWoredaChange = (woredaId) => {
    form.setFieldsValue({ kebele_id: undefined });
    
    if (woredaId) fetchKebeles(woredaId);
    else setKebeles([]);
  };

  // ───── Submission ─────────────────────────────────────────────
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
    } catch (error) {
      console.error("Form validation failed", error);
    }
  };

  // ───── Password Policy Checks ─────────────────────────────────
  const pwdReqs = {
    length: passwordValue.length >= 8,
    upper: /[A-Z]/.test(passwordValue),
    lower: /[a-z]/.test(passwordValue),
    number: /[0-9]/.test(passwordValue),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(passwordValue)
  };

  const isPasswordValid = Object.values(pwdReqs).every(Boolean);

  const PasswordRequirement = ({ met, text }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, fontSize: 12.5, color: met ? COLORS.success : COLORS.textMuted }}>
      {met ? <CheckCircleFilled /> : <CloseCircleFilled style={{ color: passwordValue.length > 0 ? COLORS.danger : '#D9D9D9' }} />}
      <span style={{ textDecoration: met ? 'line-through' : 'none', opacity: met ? 0.7 : 1 }}>{text}</span>
    </div>
  );

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 10, borderBottom: `1px solid ${COLORS.border}` }}>
          <div style={{
            background: COLORS.primaryLight, color: COLORS.primary, padding: '8px', 
            borderRadius: '8px', display: 'flex', fontSize: 18
          }}>
            {editingUser ? <EditOutlined /> : <UserAddOutlined />}
          </div>
          <div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 700, color: COLORS.text }}>
              {editingUser ? "Modify User Account" : "Register New User"}
            </div>
            <div style={{ fontSize: 12, color: COLORS.textMuted, fontWeight: 400 }}>
              {editingUser ? "Update system access and details" : "Create a new identity within the IAIMS system"}
            </div>
          </div>
        </div>
      }
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={loading}
      okText={editingUser ? "Save Changes" : "Register Account"}
      cancelText="Cancel"
      width={800} 
      destroyOnClose
      maskClosable={false} // Prevents accidental data loss
      styles={{ body: { paddingTop: 16 } }}
      okButtonProps={{ 
        style: { backgroundColor: COLORS.primary, borderRadius: 6, fontWeight: 600, height: 38, padding: '0 24px' } 
      }}
      cancelButtonProps={{ style: { borderRadius: 6, height: 38 } }}
    >
      <Form form={form} layout="vertical" requiredMark="optional">
        
        {editingUser && (
          <Alert 
            message="You are currently modifying an existing user record. Changes will take effect immediately upon saving." 
            type="info" showIcon style={{ marginBottom: 20, borderRadius: 8, backgroundColor: '#EBF4F8', border: '1px solid #BAE0F3' }} 
          />
        )}

        {/* ─── BASIC INFO ─── */}
        <Row gutter={20}>
          <Col span={12}>
            <Form.Item 
              name="full_name" 
              label={<span style={{ fontWeight: 600, color: COLORS.text }}>Full Name</span>} 
              rules={[{ required: true, message: 'Full name is required' }]}
            >
              <Input prefix={<UserOutlined style={{ color: '#BFBFBF' }}/>} placeholder="E.g. Abebe Kebede" size="large" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item 
              name="email" 
              label={<span style={{ fontWeight: 600, color: COLORS.text }}>Email Address</span>} 
              rules={[
                { required: true, message: 'Email is required' },
                { type: 'email', message: 'Please enter a valid email format' }
              ]}
            >
              <Input prefix={<MailOutlined style={{ color: '#BFBFBF' }}/>} placeholder="user@iaims.gov.et" size="large" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={20}>
          <Col span={12}>
            <Form.Item 
              name="phone" 
              label={<span style={{ fontWeight: 600, color: COLORS.text }}>Phone Number</span>}
            >
              <Input prefix={<PhoneOutlined style={{ color: '#BFBFBF' }}/>} placeholder="+251 911 000 000" size="large" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item 
              name="role" 
              label={<span style={{ fontWeight: 600, color: COLORS.text }}>System Role</span>} 
              rules={[{ required: true, message: 'System role is required' }]}
            >
              <Select 
                placeholder="Assign a role"
                loading={loadingRoles}
                showSearch
                size="large"
                optionFilterProp="children"
                suffixIcon={<SafetyCertificateOutlined style={{ color: COLORS.primary }} />}
              >
                {dynamicRoles.map(role => (
                  <Select.Option key={role.id || role.name} value={role.name}>
                    <Space>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS.primary }}></div>
                      {role.name}
                    </Space>
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* ─── LOCATION ASSIGNMENT ─── */}
        <Divider orientation="left" style={{ margin: '16px 0', borderColor: COLORS.border }}>
          <Space size={8} style={{ color: COLORS.textMuted, fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            <GlobalOutlined /> Jurisdiction Assignment
          </Space>
        </Divider>

        <Row gutter={20}>
          <Col span={8}>
            <Form.Item name="zone_id" label={<span style={{ fontWeight: 500, color: COLORS.text }}>Zone</span>}>
              <Select 
                placeholder="Select Zone" 
                loading={loadingZones}
                onChange={handleZoneChange}
                allowClear showSearch size="large"
                optionFilterProp="children"
                suffixIcon={<EnvironmentOutlined />}
              >
                {zones.map(zone => (
                  <Select.Option key={zone.id} value={zone.id}>{zone.name}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Tooltip title={!form.getFieldValue('zone_id') ? "Please select a Zone first" : ""}>
              <Form.Item name="woreda_id" label={<span style={{ fontWeight: 500, color: COLORS.text }}>Woreda</span>}>
                <Select 
                  placeholder="Select Woreda" 
                  loading={loadingWoredas}
                  onChange={handleWoredaChange}
                  disabled={!form.getFieldValue('zone_id')} 
                  allowClear showSearch size="large"
                  optionFilterProp="children"
                  suffixIcon={<BankOutlined />}
                >
                  {woredas.map(woreda => (
                    <Select.Option key={woreda.id} value={woreda.id}>{woreda.name}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Tooltip>
          </Col>
          <Col span={8}>
            <Tooltip title={!form.getFieldValue('woreda_id') ? "Please select a Woreda first" : ""}>
              <Form.Item name="kebele_id" label={<span style={{ fontWeight: 500, color: COLORS.text }}>Kebele</span>}>
                <Select 
                  placeholder="Select Kebele" 
                  loading={loadingKebeles}
                  disabled={!form.getFieldValue('woreda_id')} 
                  allowClear showSearch size="large"
                  optionFilterProp="children"
                >
                  {kebeles.map(kebele => (
                    <Select.Option key={kebele.id} value={kebele.id}>{kebele.name}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Tooltip>
          </Col>
        </Row>

        {/* ─── SECURITY SECTION (CREATION ONLY) ─── */}
        {!editingUser && (
          <>
            <Divider orientation="left" style={{ margin: '16px 0', borderColor: COLORS.border }}>
              <Space size={8} style={{ color: COLORS.textMuted, fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                <LockOutlined /> Security Credentials
              </Space>
            </Divider>

            <Row gutter={20}>
              <Col span={12}>
                <Form.Item 
                  name="password" 
                  label={<span style={{ fontWeight: 600, color: COLORS.text }}>Secure Password</span>} 
                  rules={[
                    { required: true, message: 'Password is required' },
                    () => ({
                      validator() {
                        if (isPasswordValid || passwordValue.length === 0) return Promise.resolve();
                        return Promise.reject(new Error('Password does not meet all security requirements'));
                      },
                    }),
                  ]}
                >
                  <Input.Password prefix={<LockOutlined style={{ color: '#BFBFBF' }}/>} placeholder="Create password" size="large" />
                </Form.Item>
                
                {/* Live Password Policy Checklist */}
                <div style={{ background: '#FAFAFA', padding: '12px', borderRadius: 8, border: `1px solid ${COLORS.border}`, marginTop: -12, marginBottom: 24 }}>
                  <Row>
                    <Col span={12}>
                      <PasswordRequirement met={pwdReqs.length} text="At least 8 characters" />
                      <PasswordRequirement met={pwdReqs.upper} text="One uppercase letter (A-Z)" />
                      <PasswordRequirement met={pwdReqs.lower} text="One lowercase letter (a-z)" />
                    </Col>
                    <Col span={12}>
                      <PasswordRequirement met={pwdReqs.number} text="One number (0-9)" />
                      <PasswordRequirement met={pwdReqs.special} text="One special character (@!#...)" />
                    </Col>
                  </Row>
                </div>
              </Col>
              
              <Col span={12}>
                <Form.Item 
                  name="password_confirmation" 
                  label={<span style={{ fontWeight: 600, color: COLORS.text }}>Confirm Password</span>} 
                  dependencies={['password']}
                  rules={[
                    { required: true, message: 'Please confirm the password' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Passwords do not match!'));
                      },
                    }),
                  ]}
                >
                  <Input.Password prefix={<LockOutlined style={{ color: '#BFBFBF' }}/>} placeholder="Verify password" size="large" />
                </Form.Item>
              </Col>
            </Row>
          </>
        )}
      </Form>
    </Modal>
  );
}