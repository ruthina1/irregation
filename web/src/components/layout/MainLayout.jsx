import React, { useState, useMemo, useEffect } from 'react';
import {
  Layout, Menu, Dropdown, Avatar, Typography, theme, Button, Space,
  ConfigProvider, Drawer, Tag, Modal, Tabs, Form, Input, Row, Col, Divider, message, Descriptions
} from 'antd';

import {
  MenuFoldOutlined, MenuUnfoldOutlined, LogoutOutlined, UserOutlined,
  MenuOutlined, EnvironmentOutlined, DownOutlined, LockOutlined,
  IdcardOutlined, CheckCircleFilled, CloseCircleFilled,
  MailOutlined, PhoneOutlined, SafetyCertificateOutlined,
  GlobalOutlined
} from '@ant-design/icons';

import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../services/api/authApi';
import { usePermissions } from '../../hooks/usePermissions';
import { navigationMenu } from '../../config/navigation';
import { getIrrigationPageTitle } from '../../modules/Irrigation/shared/irrigationNavigation';
import FeedbackDrawer from '../common/FedbackDrawer';

const { Header, Sider, Content } = Layout;
const { Text, Title } = Typography;

// ─────────────────────────────────────────────
// Enterprise Brand Colors & Tokens
// ─────────────────────────────────────────────
const COLORS = {
  primary: '#047857',       // Emerald 600 - Main Brand
  primaryHover: '#059669',  // Emerald 500
  sidebarBg: '#076b63',     // Emerald 900 - Deep Premium Green
  sidebarDark: '#073d31',   // Emerald 950 - Submenu depth
  primaryLight: '#D1FAE5',  // Soft background for tags
  border: '#E2E8F0',        // Slate 200
  text: '#0F172A',          // Slate 900
  textMuted: '#64748B',     // Slate 500
  danger: '#DC2626',
  success: '#10B981',
  background: '#F8FAFC',    // Slate 50
};

// ─────────────────────────────────────────────
// User Profile & Settings Modal Component
// ─────────────────────────────────────────────
const ProfileSettingsModal = ({ open, onClose, user, primaryRole }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const newPasswordValue = Form.useWatch('new_password', form) || '';

  // Password Policy Checks
  const pwdReqs = {
    length: newPasswordValue.length >= 8,
    upper: /[A-Z]/.test(newPasswordValue),
    lower: /[a-z]/.test(newPasswordValue),
    number: /[0-9]/.test(newPasswordValue),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(newPasswordValue)
  };

  const isPasswordValid = Object.values(pwdReqs).every(Boolean);

  const PasswordRequirement = ({ met, text }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 13, color: met ? COLORS.success : COLORS.textMuted, fontWeight: 500 }}>
      {met ? <CheckCircleFilled /> : <CloseCircleFilled style={{ color: newPasswordValue.length > 0 ? COLORS.danger : '#CBD5E1' }} />}
      <span style={{ textDecoration: met ? 'line-through' : 'none', opacity: met ? 0.7 : 1 }}>{text}</span>
    </div>
  );

  const handleUpdatePassword = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      await authApi.changePassword({
        current_password: values.current_password,
        new_password: values.new_password,
        new_password_confirmation: values.new_password_confirmation,
      });

      message.success('Password updated successfully! Please use your new password next time you log in.');
      form.resetFields();
      onClose();
    } catch (error) {
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else if (!error.errorFields) {
        message.error('Failed to update password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingBottom: 16, borderBottom: `1px solid ${COLORS.border}` }}>
          <Avatar size={56} style={{ backgroundColor: COLORS.primary, fontSize: 24 }} icon={<UserOutlined />} />
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.text, lineHeight: 1.2 }}>
              {user?.full_name}
            </div>
            <div style={{ fontSize: 14, color: COLORS.textMuted, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <SafetyCertificateOutlined style={{ color: COLORS.primary }} /> {primaryRole}
            </div>
          </div>
        </div>
      }
      open={open}
      onCancel={() => { form.resetFields(); onClose(); }}
      footer={null}
      width={720}
      destroyOnClose
      maskClosable={false}
      styles={{ body: { paddingTop: 16 } }}
    >
      <Tabs defaultActiveKey="1" tabBarStyle={{ marginBottom: 24, fontWeight: 600 }}>
        
        {/* TAB 1: OVERVIEW */}
        <Tabs.TabPane tab={<span><IdcardOutlined /> Account Overview</span>} key="1">
          <Descriptions column={1} bordered size="middle" labelStyle={{ width: '220px', backgroundColor: '#F8FAFC', fontWeight: 600, color: COLORS.textMuted }}>
            <Descriptions.Item label={<Space><MailOutlined /> Email Address</Space>}>
              <Text strong>{user?.email}</Text>
            </Descriptions.Item>
            <Descriptions.Item label={<Space><PhoneOutlined /> Phone Number</Space>}>
              {user?.phone ? <Text strong>{user.phone}</Text> : <Text type="secondary" italic>Not Provided</Text>}
            </Descriptions.Item>
            <Descriptions.Item label={<Space><EnvironmentOutlined /> Assigned Jurisdiction</Space>}>
              <Text strong>
                {user?.kebele?.name ? `Kebele: ${user.kebele.name}` : 
                 user?.woreda?.name ? `Woreda: ${user.woreda.name}` : 
                 user?.zone?.name ? `Zone: ${user.zone.name}` : 
                 'Regional Headquarter'}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label={<Space><GlobalOutlined /> Account Status</Space>}>
              <Tag color={user?.is_active !== false ? 'success' : 'error'} style={{ borderRadius: 4, fontWeight: 600, padding: '2px 8px' }}>
                {user?.is_active !== false ? 'ACTIVE' : 'INACTIVE'}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        </Tabs.TabPane>

        {/* TAB 2: SECURITY */}
        <Tabs.TabPane tab={<span><LockOutlined /> Security & Password</span>} key="2">
          <Form form={form} layout="vertical" requiredMark="optional">
            <Form.Item 
              name="current_password" 
              label={<span style={{ fontWeight: 600, color: COLORS.text }}>Current Password</span>} 
              rules={[{ required: true, message: 'Please enter your current password' }]}
            >
              <Input.Password prefix={<LockOutlined style={{ color: '#94A3B8' }}/>} placeholder="Enter current password" size="large" />
            </Form.Item>

            <Divider style={{ margin: '20px 0', borderColor: COLORS.border }} />

            <Row gutter={24}>
              <Col span={12}>
                <Form.Item 
                  name="new_password" 
                  label={<span style={{ fontWeight: 600, color: COLORS.text }}>New Password</span>} 
                  rules={[
                    { required: true, message: 'New password is required' },
                    () => ({
                      validator() {
                        if (isPasswordValid || newPasswordValue.length === 0) return Promise.resolve();
                        return Promise.reject(new Error('Password does not meet all security requirements'));
                      },
                    }),
                  ]}
                >
                  <Input.Password prefix={<LockOutlined style={{ color: '#94A3B8' }}/>} placeholder="Create new password" size="large" />
                </Form.Item>

                {/* Password Policy Tracker */}
                <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: 8, border: `1px solid ${COLORS.border}`, marginTop: -8, marginBottom: 24 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text, marginBottom: 12 }}>Password Requirements:</div>
                  <PasswordRequirement met={pwdReqs.length} text="At least 8 characters long" />
                  <PasswordRequirement met={pwdReqs.upper} text="One uppercase letter (A-Z)" />
                  <PasswordRequirement met={pwdReqs.lower} text="One lowercase letter (a-z)" />
                  <PasswordRequirement met={pwdReqs.number} text="One number (0-9)" />
                  <PasswordRequirement met={pwdReqs.special} text="One special character (@!#...)" />
                </div>
              </Col>

              <Col span={12}>
                <Form.Item 
                  name="new_password_confirmation" 
                  label={<span style={{ fontWeight: 600, color: COLORS.text }}>Confirm New Password</span>} 
                  dependencies={['new_password']}
                  rules={[
                    { required: true, message: 'Please confirm the new password' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('new_password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Passwords do not match!'));
                      },
                    }),
                  ]}
                >
                  <Input.Password prefix={<LockOutlined style={{ color: '#94A3B8' }}/>} placeholder="Verify new password" size="large" />
                </Form.Item>
              </Col>
            </Row>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
              <Button onClick={() => { form.resetFields(); onClose(); }} size="large">
                Cancel
              </Button>
              <Button type="primary" onClick={handleUpdatePassword} loading={loading} size="large" style={{ padding: '0 32px' }}>
                Update Secure Password
              </Button>
            </div>
          </Form>
        </Tabs.TabPane>
      </Tabs>
    </Modal>
  );
};

// ─────────────────────────────────────────────
// Core Layout Component 
// ─────────────────────────────────────────────
const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);

  const { user, logout } = useAuthStore();
  const { primaryRole, hasPermission } = usePermissions();

  const navigate = useNavigate();
  const location = useLocation();
  const isIrrigationPage = location.pathname.startsWith('/irrigation');

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 992);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const sidebarWidth = isMobile ? 0 : (collapsed ? 80 : 270);
    document.documentElement.style.setProperty('--app-sidebar-width', `${sidebarWidth}px`);
  }, [collapsed, isMobile]);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      console.warn('Logout API failed.');
    } finally {
      logout();
      navigate('/');
    }
  };

  const filteredMenuItems = useMemo(() => {
    const filterMenu = (items) => {
      return items
        .filter((item) => {
          if (item.type === 'divider') return true;
          return !item.permissions || hasPermission(item.permissions);
        })
        .map((item) => {
          if (item.children) {
            const children = filterMenu(item.children);
            if (children.length === 0) return null;
            return { ...item, children };
          }
          return item;
        })
        .filter(Boolean);
    };
    return filterMenu(navigationMenu);
  }, [hasPermission]);

  const userMenu = useMemo(() => {
    const items = [];
    if (user) {
      items.push(
        {
          key: 'user-profile-header',
          label: (
            <div style={{ padding: '8px 4px', minWidth: 200 }}>
              <Text strong style={{ display: 'block', fontSize: 15, color: COLORS.text }}>
                {user.full_name}
              </Text>
              <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <SafetyCertificateOutlined style={{ color: COLORS.primary }} />
                  <Text style={{ fontSize: 12, color: COLORS.textMuted, fontWeight: 500 }}>{primaryRole}</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <EnvironmentOutlined style={{ color: COLORS.primary }} />
                  <Text style={{ fontSize: 12, color: COLORS.textMuted, fontWeight: 500 }}>
                    {user.woreda_id ? 'Woreda Admin' : 'Regional HQ'}
                  </Text>
                </div>
              </div>
            </div>
          ),
          disabled: true,
        },
        { type: 'divider' }
      );
    }

    items.push(
      {
        key: 'profile',
        icon: <UserOutlined style={{ fontSize: 15, color: COLORS.textMuted }} />,
        label: <span style={{ fontSize: 14, fontWeight: 500 }}>My Account</span>,
        onClick: () => setProfileModalVisible(true),
      },
      { type: 'divider' },
      {
        key: 'logout',
        icon: <LogoutOutlined style={{ fontSize: 15 }} />,
        label: <span style={{ fontSize: 14, fontWeight: 600 }}>Sign Out</span>,
        danger: true,
        onClick: handleLogout,
      }
    );

    return { items };
  }, [user, primaryRole]);

  const renderSidebarContent = (isCollapsedState, showTitleText) => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 1. High-End Sidebar Header (Logo & Title) */}
      <div style={{ height: 80, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px', borderBottom: `1px solid rgba(255, 255, 255, 0.08)` }}>
        <div style={{ 
          width: '100%', 
          height: '48px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: isCollapsedState ? 'center' : 'flex-start', 
          transition: 'all 0.2s ease-in-out' 
        }}>
          <div style={{
            width: 36, height: 36, minWidth: 36,
            backgroundColor: '#FFFFFF',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginRight: isCollapsedState ? 0 : 12,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <img src="/logo.png" alt="IAIMS" style={{ width: 24, height: 24, objectFit: 'contain' }} />
          </div>
          {showTitleText && (
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2, overflow: 'hidden', whiteSpace: 'nowrap' }}>
              <Title level={4} style={{ margin: 0, color: '#FFFFFF', fontWeight: 700, fontSize: 18, letterSpacing: '-0.3px' }}>
                IAIMS
              </Title>
              <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 10, letterSpacing: '0.5px', textTransform: 'uppercase', fontWeight: 600 }}>
                Agriculture Bureau
              </Text>
            </div>
          )}
        </div>
      </div>

      {/* 2. Scrollable Sidebar Navigation */}
      <div className="sidebar-scroll-container" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingBottom: '24px' }}>
        <ConfigProvider
          theme={{
            components: {
              Menu: {
                darkItemBg: 'transparent',
                darkSubMenuItemBg: COLORS.sidebarDark,
                darkItemSelectedBg: COLORS.primary,
                darkItemHoverBg: 'rgba(255,255,255,0.08)',
                darkItemColor: 'rgba(255,255,255,0.75)',
                darkItemSelectedColor: '#FFFFFF',
                darkItemHoverColor: '#FFFFFF',
                itemBorderRadius: 8,
                itemMarginInline: 12, // Floating Pill effect
              },
            },
          }}
        >
          <Menu
            mode="inline"
            theme="dark"
            selectedKeys={[location.pathname]}
            items={filteredMenuItems}
            onClick={({ key }) => {
              navigate(key);
              if (isMobile) setDrawerVisible(false);
            }}
            style={{ marginTop: 16, borderRight: 0, background: 'transparent', fontSize: 14, fontWeight: 500 }}
          />
        </ConfigProvider>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        body { margin: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background-color: ${COLORS.background}; }

        /* Enterprise Header Profile Box Styling */
        .profile-trigger-box { display: flex; align-items: center; gap: 12px; padding: 6px 12px; border-radius: 8px; cursor: pointer; transition: all 0.2s ease-in-out; border: 1px solid transparent; }
        .profile-trigger-box:hover { background-color: #F1F5F9; border-color: #E2E8F0; }
        
        .enterprise-avatar-wrapper { border: 2px solid #E2E8F0; padding: 2px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease; }
        .profile-trigger-box:hover .enterprise-avatar-wrapper { border-color: ${COLORS.primary}; }
        
        /* Modern Invisible-style Scrollbar for dark Sidebar */
        .sidebar-scroll-container::-webkit-scrollbar { width: 5px; }
        .sidebar-scroll-container::-webkit-scrollbar-track { background: transparent; }
        .sidebar-scroll-container::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.15); border-radius: 10px; }
        .sidebar-scroll-container::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.3); }

        /* General Refinements */
        .ant-tabs-nav::before { border-bottom: 1px solid ${COLORS.border} !important; }

        /* Workspace Centered Modals (centers relative to the workspace content area, taking the sidebar into account) */
        .irr-workspace-modal {
          padding-left: var(--app-sidebar-width, 270px) !important;
          transition: padding-left 0.2s ease-in-out;
        }
        @media (max-width: 991px) {
          .irr-workspace-modal {
            padding-left: 0 !important;
          }
        }
      `}</style>
 <FeedbackDrawer />
      {/* Profile/Settings Modal */}
      <ProfileSettingsModal 
        open={profileModalVisible} 
        onClose={() => setProfileModalVisible(false)} 
        user={user} 
        primaryRole={primaryRole} 
      />

      <Layout style={{ minHeight: '100vh', background: COLORS.background }}>
        {isMobile ? (
          <Drawer 
            placement="left" 
            onClose={() => setDrawerVisible(false)} 
            open={drawerVisible} 
            width={280} 
            closable={false} 
            styles={{ body: { background: COLORS.sidebarBg, padding: 0 } }}
          >
            {renderSidebarContent(false, true)}
          </Drawer>
        ) : (
          <Sider 
            trigger={null} 
            collapsible 
            collapsed={collapsed} 
            width={270} 
            theme="dark" 
            style={{ background: COLORS.sidebarBg, position: 'fixed', left: 0, top: 0, bottom: 0, borderRight: '1px solid rgba(0,0,0,0.05)', zIndex: 100, boxShadow: '2px 0 8px 0 rgba(0,0,0,0.04)' }}
          >
            {renderSidebarContent(collapsed, !collapsed)}
          </Sider>
        )}

        <Layout style={{ marginLeft: isMobile ? 0 : (collapsed ? 80 : 270), transition: 'all 0.2s ease-in-out', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          
          <Header style={{ height: 72, padding: '0 24px', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${COLORS.border}`, lineHeight: 'normal', position: 'sticky', top: 0, zIndex: 99, boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.02)' }}>
            <Button type="text" icon={isMobile ? <MenuOutlined style={{ fontSize: 18 }} /> : collapsed ? <MenuUnfoldOutlined style={{ fontSize: 18 }} /> : <MenuFoldOutlined style={{ fontSize: 18 }} />} onClick={() => { isMobile ? setDrawerVisible(!drawerVisible) : setCollapsed(!collapsed); }} style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.textMuted, zIndex: 2 }} />

            {getIrrigationPageTitle(location.pathname) ? (
              <div style={{ flex: 1, minWidth: 0, marginLeft: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                <Text strong style={{ fontSize: isMobile ? 15 : 18, color: COLORS.text, fontWeight: 600 }}>
                  {getIrrigationPageTitle(location.pathname)}
                </Text>
              </div>
            ) : (
              <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 1 }}>
                <Text strong style={{ fontSize: isMobile ? 12 : 13, color: COLORS.textMuted, letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700 }}>
                  Official Workspace
                </Text>
              </div>
            )}

            <Space size="middle" style={{ display: 'flex', alignItems: 'center', zIndex: 2 }}>
              <Dropdown menu={userMenu} placement="bottomRight" trigger={['click']}>
                <div className="profile-trigger-box">
                  {!isMobile && user && (
                    <div style={{ textAlign: 'right', lineHeight: 1.2 }}>
                      <Text strong style={{ display: 'block', fontSize: 14, color: COLORS.text }}>{user.full_name}</Text>
                      <Space size={4} style={{ marginTop: 4 }}>
                        <Tag style={{ fontSize: '10px', fontWeight: 700, margin: 0, padding: '0 6px', borderRadius: '4px', border: 'none', background: COLORS.primaryLight, color: COLORS.primary }}>
                          {primaryRole}
                        </Tag>
                      </Space>
                    </div>
                  )}
                  <div className="enterprise-avatar-wrapper">
                    <Avatar size={38} icon={<UserOutlined />} style={{ background: COLORS.primaryHover, cursor: 'pointer' }} />
                  </div>
                  {!isMobile && <DownOutlined style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 'bold' }} />}
                </div>
              </Dropdown>
            </Space>
          </Header>

          <Content style={{ padding: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
            {isIrrigationPage ? (
              <Outlet />
            ) : (
              <div style={{ flex: 1, background: '#FFFFFF', borderRadius: 12, border: `1px solid ${COLORS.border}`, padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' }}>
                <Outlet />
              </div>
            )}
            {!isIrrigationPage && (
              <div style={{ textAlign: 'center', padding: '24px 0 8px', color: COLORS.textMuted, fontSize: 12, fontWeight: 500 }}>
                 © {new Date().getFullYear()} Amhara Regional State Bureau of Agriculture · Integrated Agriculture Information Management System (IAIMS)
              </div>
            )}
          </Content>
        </Layout>
      </Layout>
    </>
  );
};

// ─────────────────────────────────────────────
// App Layout Wrapper (Global Theme Injection)
// ─────────────────────────────────────────────
export default function AppLayout() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: COLORS.primary,
          colorInfo: COLORS.primary,
          borderRadius: 8,
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          colorTextBase: COLORS.text,
          colorBgBase: '#FFFFFF',
        },
        components: {
          Button: {
            borderRadius: 8,
            fontWeight: 500,
          },
          Input: {
            borderRadius: 8,
          },
          Layout: {
            bodyBg: COLORS.background,
            headerBg: '#FFFFFF',
          },
        }
      }}
    >
      <MainLayout />
    </ConfigProvider>
  );
}