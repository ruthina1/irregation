import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Checkbox, Alert, Typography, Divider } from 'antd';
import { 
  MailOutlined, 
  LockOutlined, 
  EyeInvisibleOutlined, 
  EyeTwoTone,
  SafetyCertificateOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import AuthLayout from './AuthLayout';
import { authApi } from '../../services/api/authApi';
import { useAuthStore } from '../../store/authStore';

const { Title, Text } = Typography;

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const onFinish = async (values) => {
    setError(null);
    setLoading(true);
    try {
      const { data } = await authApi.login({
        email: values.email,
        password: values.password,
      });
      login(data.data.user, data.data.token);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Unable to sign in. Please verify your official credentials and try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      {/* ─── Header Section ─── */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          width: 48, 
          height: 48, 
          borderRadius: 12, 
          background: '#E9F2EC', 
          color: '#1F6D4C', 
          marginBottom: 16 
        }}>
          <SafetyCertificateOutlined style={{ fontSize: 24 }} />
        </div>
        
        <Title level={2} style={{ margin: 0, fontFamily: 'Georgia, "Times New Roman", serif', color: '#1D241F', fontWeight: 700 }}>
          System Access
        </Title>
        <Text style={{ fontSize: 14, color: '#66705F', marginTop: 8, display: 'block' }}>
          Integrated Agriculture Information Management System (IAIMS)
        </Text>
      </div>

      {/* ─── Error Handling ─── */}
      {error && (
        <Alert
          type="error"
          message={<span style={{ fontWeight: 600 }}>Authentication Failed</span>}
          description={error}
          showIcon
          closable
          onClose={() => setError(null)}
          style={{ marginBottom: 24, borderRadius: 8, border: '1px solid #ffccc7' }}
        />
      )}

      {/* ─── Login Form ─── */}
      <Form
        layout="vertical"
        size="large"
        onFinish={onFinish}
        requiredMark={false}
      >
        <Form.Item
          name="email"
          label={<span style={{ fontWeight: 600, color: '#1D241F' }}>Official Email Address</span>}
          rules={[
            { required: true, message: 'Please enter your assigned email' },
            { type: 'email', message: 'Enter a valid email address' },
          ]}
        >
          <Input 
            prefix={<MailOutlined style={{ color: '#BFBFBF' }} />} 
            placeholder="user@iaims.gov.et" 
            autoComplete="email" 
            style={{ borderRadius: 6 }}
          />
        </Form.Item>

        <Form.Item
          name="password"
          label={<span style={{ fontWeight: 600, color: '#1D241F' }}>Secure Password</span>}
          rules={[{ required: true, message: 'Please enter your password' }]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: '#BFBFBF' }} />}
            placeholder="••••••••"
            autoComplete="current-password"
            iconRender={(v) => (v ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            style={{ borderRadius: 6 }}
          />
        </Form.Item>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox style={{ color: '#66705F' }}>Remember my device</Checkbox>
          </Form.Item>
          <Link to="/forgot-password" style={{ color: '#1F6D4C', fontWeight: 600 }}>
            Forgot password?
          </Link>
        </div>

        <Form.Item style={{ marginBottom: 0 }}>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading} 
            block
            style={{ 
              height: 44, 
              borderRadius: 6, 
              backgroundColor: '#1F6D4C', 
              fontSize: 16, 
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(31, 109, 76, 0.2)'
            }}
          >
            Authenticate & Sign In
          </Button>
        </Form.Item>
      </Form>

      <Divider style={{ borderColor: '#E5E1D3', margin: '32px 0 24px 0' }} />

      {/* ─── Restricted Access Notice (Replaces Self-Registration) ─── */}
      <div style={{ 
        backgroundColor: '#F8FAFC', 
        border: '1px solid #E2E8F0', 
        borderRadius: 8, 
        padding: '16px', 
        display: 'flex', 
        alignItems: 'flex-start',
        gap: 12
      }}>
        <InfoCircleOutlined style={{ color: '#2C6E8E', fontSize: 20, marginTop: 2 }} />
        <div>
          <Text strong style={{ color: '#0F172A', display: 'block', marginBottom: 4, fontSize: 13 }}>
            Restricted Government System
          </Text>
          <Text style={{ color: '#475569', fontSize: 12, lineHeight: 1.5, display: 'block' }}>
            Access to the IAIMS portal is strictly limited to authorized personnel. 
            Self-registration is disabled. If you require system access or role modifications, 
            please contact your Regional System Administrator or IT Support Desk.
          </Text>
        </div>
      </div>
    </AuthLayout>
  );
}