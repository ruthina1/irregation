import React, { useState, useEffect, useCallback } from 'react';
import { 
  Row, Col, Card, Typography, Progress, Table, Button, Space, 
  message, Modal, Tabs, Form, Input, InputNumber, Switch, Badge, Select, Pagination, Divider, Alert, Tag
} from 'antd';
import { 
  DatabaseOutlined, SyncOutlined, ClearOutlined, LockOutlined, 
  UnlockOutlined, ExclamationCircleOutlined, SettingOutlined, 
  SafetyCertificateOutlined, ReloadOutlined, DownloadOutlined, DeleteOutlined,
  MailOutlined, MessageOutlined, MobileOutlined, IdcardOutlined, GlobalOutlined, WarningOutlined
} from '@ant-design/icons';
import { meraApi } from '../../services/api/meraApi';

const { Title, Text, Paragraph } = Typography;
const { confirm } = Modal;
const { TabPane } = Tabs;

// Helper to extract the actual API response payload
const getPayload = (res) => {
  if (!res) return null;
  if (res.data !== undefined && res.success === undefined) {
    return res.data;
  }
  return res;
};

// Security helper to mask sensitive data in the confirmation prompt
const maskSensitive = (key, value) => {
  if (!value) return '(Empty)';
  const sensitiveKeys = ['PASSWORD', 'KEY', 'SECRET', 'TOKEN'];
  const isSensitive = sensitiveKeys.some(k => key.toUpperCase().includes(k));
  return isSensitive ? '••••••••••••' : value;
};

export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState('1');
  const [loading, setLoading] = useState(false);
  const [sysStats, setSysStats] = useState({
    uptime: '0%', dbStorage: '0 MB', failedLogins: 0, lastBackup: 'Never',
  });
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);

  const [metrics, setMetrics] = useState({
    cpu: 0, ramUsed: 0, ramTotal: 1, storageUsed: 0, storageTotal: 1,
  });

  const [settings, setSettings] = useState([]);
  const [settingsForm] = Form.useForm();
  
  const [backups, setBackups] = useState([]);
  const [logs, setLogs] = useState([]);
  const [logTotal, setLogTotal] = useState(0);
  const [logPage, setLogPage] = useState(1);
  const [logSeverity, setLogSeverity] = useState('');

  // Core Fetch Handler
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const rawRes = await meraApi.getAdminSummary();
      const res = getPayload(rawRes);
      
      if (res && res.success) {
        setSysStats(res.stats);
        setIsMaintenanceMode(res.maintenanceMode);
      } else {
        message.warning(res?.message || 'Could not parse system metrics.');
      }
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to load system state summary.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch Active Module Data
  const loadActiveModuleData = useCallback(async () => {
    try {
      if (activeTab === '1') {
        const rawRes = await meraApi.getLiveMetrics();
        const met = getPayload(rawRes);
        if (met && met.success) setMetrics(met);
      } else if (activeTab === '2') {
        const rawRes = await meraApi.getSettings();
        const set = getPayload(rawRes);
        if (set && set.success) setSettings(set.data || []);
      } else if (activeTab === '3') {
        const rawRes = await meraApi.getBackups();
        const back = getPayload(rawRes);
        if (back && back.success) setBackups(back.data || []);
        else if (back && Array.isArray(back.data)) setBackups(back.data);
        else if (Array.isArray(back)) setBackups(back);
      } else if (activeTab === '4') {
        const rawRes = await meraApi.getLogs(logPage, logSeverity);
        const res = getPayload(rawRes);
        if (res && res.success && res.data) {
          setLogs(res.data.data || []);
          setLogTotal(res.data.total || 0);
        } else if (res && res.data && Array.isArray(res.data)) {
          setLogs(res.data);
          setLogTotal(res.total || 0);
        } else {
          const rawLogs = Array.isArray(res) ? res : [];
          setLogs(rawLogs);
          setLogTotal(rawLogs.length);
        }
      }
    } catch (err) {
      message.error(err.response?.data?.message || 'Error fetching system records.');
    }
  }, [activeTab, logPage, logSeverity]);

  // Sync settings form
  useEffect(() => {
    if (settings && settings.length > 0) {
      const formValues = {};
      settings.forEach(item => {
        formValues[item.key] = item.type === 'boolean' ? (item.value === 'true' || item.value === true) : item.value;
      });
      settingsForm.setFieldsValue(formValues);
    }
  }, [settings, settingsForm]);

  useEffect(() => { loadDashboardData(); }, [loadDashboardData]);
  useEffect(() => { loadActiveModuleData(); }, [loadActiveModuleData, activeTab]);

  // CPU/RAM Polling
  useEffect(() => {
    if (activeTab !== '1') return;
    const interval = setInterval(async () => {
      try {
        const rawRes = await meraApi.getLiveMetrics();
        const met = getPayload(rawRes);
        if (met && met.success) setMetrics(prev => ({ ...prev, cpu: met.cpu, ramUsed: met.ramUsed }));
      } catch (err) {}
    }, 5000);
    return () => clearInterval(interval);
  }, [activeTab]);

  // Administrative Actions with Formal Prompts
  const executeAdminAction = (actionKey, label, warningText) => {
    confirm({
      title: `Authorize Action: ${label}`,
      icon: <ExclamationCircleOutlined style={{ color: '#DC2626' }} />,
      content: (
        <div>
          <Text strong type="danger">SECURITY WARNING:</Text>
          <p style={{ marginTop: '8px' }}>{warningText}</p>
          <p style={{ fontSize: '12px', color: '#64748B' }}>This action is irreversible and will be permanently recorded in the central audit ledger with your IP and timestamp.</p>
        </div>
      ),
      okText: 'Acknowledge & Execute',
      okType: 'danger',
      cancelText: 'Abort Operation',
      width: 500,
      onOk: async () => {
        try {
          setLoading(true);
          let rawRes;
          if (actionKey === 'clearCache') rawRes = await meraApi.clearSystemCache();
          else if (actionKey === 'restartQueue') rawRes = await meraApi.restartQueueWorkers();
          else if (actionKey === 'backup') rawRes = await meraApi.triggerBackup();
          else if (actionKey === 'toggleMaintenance') rawRes = await meraApi.toggleMaintenanceMode(!isMaintenanceMode);

          const res = getPayload(rawRes);
          if (res && res.success) {
            message.success({ content: `Operation [${label}] executed successfully.`, duration: 4 });
            loadDashboardData();
            loadActiveModuleData();
          }
        } catch (err) {
          message.error('Execution failed. Server rejected the administrative command.');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // Pre-Save Difference Checker & Formal Confirmation
  const handlePreSaveSettings = (values) => {
    const changes = [];
    Object.keys(values).forEach(key => {
      const originalItem = settings.find(s => s.key === key);
      const oldVal = originalItem ? String(originalItem.value) : '';
      
      const rawNewVal = values[key];
      const newVal = typeof rawNewVal === 'boolean' ? (rawNewVal ? 'true' : 'false') : String(rawNewVal || '');

      if (oldVal !== newVal) {
        changes.push({ key, oldVal, newVal });
      }
    });

    if (changes.length === 0) {
      message.info('No configuration changes detected. Deployment aborted.');
      return;
    }

    // Render diff table
    confirm({
      title: 'CRITICAL SYSTEM MODIFICATION PROTOCOL',
      icon: <GlobalOutlined style={{ color: '#DC2626' }} />,
      width: 650,
      content: (
        <div style={{ marginTop: 16 }}>
          <Alert 
            message="Global Architecture Impact Warning" 
            description="You are about to modify core environment variables. These changes take immediate effect across all production endpoints, mobile APIs, and background workers. Incorrect parameters will cause cascading system failures." 
            type="error" 
            showIcon 
            style={{ marginBottom: 16, border: '1px solid #FECACA', backgroundColor: '#FEF2F2' }} 
          />
          <Text strong>Review the exact payload prior to authorization:</Text>
          <div style={{ maxHeight: '300px', overflowY: 'auto', marginTop: '12px', border: '1px solid #E2E8F0', borderRadius: '6px' }}>
            <Table 
              dataSource={changes} 
              rowKey="key" 
              pagination={false} 
              size="small"
              columns={[
                { title: 'Environment Key', dataIndex: 'key', render: k => <Text code>{k}</Text> },
                { title: 'Previous Value', dataIndex: 'oldVal', render: (v, r) => <Text delete type="secondary">{maskSensitive(r.key, v)}</Text> },
                { title: 'New Value', dataIndex: 'newVal', render: (v, r) => <Text strong type="success">{maskSensitive(r.key, v)}</Text> }
              ]} 
            />
          </div>
          <Paragraph style={{ marginTop: '16px', fontSize: '12px', color: '#64748B' }}>
            By clicking "Authorize Deployment", you take full administrative responsibility for the stability of the application. Your signature will be logged.
          </Paragraph>
        </div>
      ),
      okText: 'Authorize Deployment',
      okType: 'danger',
      cancelText: 'Cancel & Discard',
      onOk: () => submitFinalSettings(changes, values)
    });
  };

  const submitFinalSettings = async (changes, allValues) => {
    try {
      setLoading(true);
      const settingsPayload = Object.keys(allValues).map(key => ({
        key: String(key),
        value: typeof allValues[key] === 'boolean' ? (allValues[key] ? 'true' : 'false') : String(allValues[key] || '')
      }));

      const rawRes = await meraApi.updateSettings(settingsPayload);
      const res = getPayload(rawRes);

      if (res && res.success) {
        message.success({ content: 'Environment configurations deployed and cache flushed successfully.', duration: 5 });
        loadDashboardData();
        const rawSettingsRes = await meraApi.getSettings();
        const set = getPayload(rawSettingsRes);
        if (set && set.success) setSettings(set.data || []);
      }
    } catch (err) {
      message.error(err.response?.data?.message || 'Deployment rejected. Failed to write to .env file.');
    } finally {
      setLoading(false);
    }
  };

  // Backup & Restore Prompts
  const handleBackupRestore = (id, filename) => {
    confirm({
      title: `Emergency Protocol: Restore Database [${filename}]`,
      icon: <WarningOutlined style={{ color: '#DC2626' }} />,
      content: (
        <div>
          <Alert message="Destructive Action Initiated" description="Restoring an archive will entirely drop the current database schema and overwrite all existing data. Active users will be forcefully disconnected." type="error" showIcon style={{ marginBottom: 16 }} />
          <Text strong>Are you absolutely certain you wish to overwrite production data?</Text>
        </div>
      ),
      okText: 'I understand, Restore Database',
      okType: 'danger',
      cancelText: 'Abort',
      onOk: async () => {
        try {
          setLoading(true);
          const rawRes = await meraApi.restoreBackup(id);
          const res = getPayload(rawRes);
          if (res && res.success) message.success('Database restoration protocol executed successfully.');
        } catch (err) {
          message.error('Catastrophic failure during restoration sequence.');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleBackupDelete = async (id) => {
    confirm({
      title: 'Authorize Deletion of System Archive',
      content: 'This backup file will be permanently scrubbed from the storage disk. This cannot be undone.',
      okText: 'Permanently Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          setLoading(true);
          const rawRes = await meraApi.deleteBackup(id);
          const res = getPayload(rawRes);
          if (res && res.success) {
            message.success('Archive scrubbed from disk.');
            loadActiveModuleData();
          }
        } catch (err) {
          message.error('Failed to scrub archive.');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // Clear Logs
  const handleClearLogs = () => {
    confirm({
      title: 'Purge Security Audit Ledger?',
      icon: <SafetyCertificateOutlined style={{ color: '#DC2626' }} />,
      content: 'You are attempting to clear the system\'s historical audit trail. This is a highly restricted action and is generally against compliance policies unless performing scheduled maintenance.',
      okText: 'Acknowledge & Purge Ledger',
      okType: 'danger',
      cancelText: 'Abort',
      onOk: async () => {
        try {
          setLoading(true);
          const rawRes = await meraApi.clearAllLogs();
          const res = getPayload(rawRes);
          if (res && res.success) {
            message.success('Audit ledger has been wiped.');
            setLogPage(1);
            loadActiveModuleData();
          }
        } catch (err) {
          message.error('Failed to wipe ledger.');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const AdminStatCard = ({ title, value, color }) => (
    <Card 
      bordered={false} 
      style={{ border: '1px solid #E2E8F0', borderLeft: `4px solid ${color}`, borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
      bodyStyle={{ padding: '20px 24px' }}
    >
      <Text style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#64748B', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
        {title}
      </Text>
      <Title level={2} style={{ margin: 0, color: '#0F172A', fontFamily: 'Inter, sans-serif', fontWeight: 800 }}>
        {value}
      </Title>
    </Card>
  );

  // Dynamic Input Renderer 
  const renderSettingInput = (key, label, type = 'text', placeholder = '', isPassword = false, options = []) => (
    <Col xs={24} md={12} lg={12} key={key}>
      <Form.Item name={key} label={<span style={{ fontWeight: 600, color: '#334155' }}>{label}</span>} valuePropName={type === 'boolean' ? 'checked' : 'value'}>
        {type === 'boolean' ? <Switch /> : 
         type === 'number' ? <InputNumber style={{ width: '100%' }} placeholder={placeholder} size="large" /> : 
         type === 'select' ? (
           <Select size="large" placeholder={placeholder}>
             {options.map(opt => <Select.Option key={opt.value} value={opt.value}>{opt.label}</Select.Option>)}
           </Select>
         ) :
         isPassword ? <Input.Password placeholder={placeholder} size="large" /> : <Input placeholder={placeholder} size="large" />}
      </Form.Item>
    </Col>
  );

  return (
    <div style={{ padding: '10px 24px', backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingBottom: '16px', borderBottom: '1px solid #E2E8F0' }}>
        <div>
          <Title level={2} style={{ color: '#0F172A', margin: 0, fontWeight: 800, letterSpacing: '-0.5px' }}>
            <GlobalOutlined style={{ marginRight: '12px', color: '#2563EB' }} />
            System Control Center
          </Title>
          <Text type="secondary" style={{ fontSize: '14px', fontWeight: 500 }}>Level 5 Master Administration, Core Integrations & Diagnostic Console</Text>
        </div>
        <Space size="large">
          {isMaintenanceMode && <Tag color="error" style={{ padding: '6px 12px', fontSize: '14px', fontWeight: 700 }}>SYSTEM OFFLINE (MAINTENANCE)</Tag>}
          <Button type="primary" icon={<ReloadOutlined />} onClick={() => { loadDashboardData(); loadActiveModuleData(); }} loading={loading} size="large" style={{ fontWeight: 600, backgroundColor: '#0F172A' }}>
            Sync Telemetry
          </Button>
        </Space>
      </div>

      {/* Stats Cards Section */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}><AdminStatCard title="Server Uptime Target" value={sysStats?.uptime || 'N/A'} color="#10B981" /></Col>
        <Col xs={24} sm={12} lg={6}><AdminStatCard title="Volume Allocation" value={sysStats?.dbStorage || '0 MB'} color="#2563EB" /></Col>
        <Col xs={24} sm={12} lg={6}><AdminStatCard title="Security Alerts" value={sysStats?.failedLogins || 0} color="#DC2626" /></Col>
        <Col xs={24} sm={12} lg={6}><AdminStatCard title="Last Secured Archive" value={sysStats?.lastBackup || 'Never'} color="#8B5CF6" /></Col>
      </Row>

      <Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key)} type="card" size="large" style={{ fontWeight: 500 }}>
        
        {/* Tab 1: Overview & Actions */}
        <TabPane tab={<span><ReloadOutlined />Diagnostics & Commands</span>} key="1">
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={12}>
              <Card title={<span style={{ fontWeight: 700 }}><GlobalOutlined /> Live Server Telemetry</span>} bordered={false} style={{ border: '1px solid #E2E8F0', borderRadius: '10px' }}>
                <div style={{ marginBottom: 28 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text strong>Processor Core Load (CPU)</Text>
                    <Text type={metrics.cpu > 80 ? "danger" : "secondary"} style={{ fontWeight: 700 }}>{metrics.cpu}%</Text>
                  </div>
                  <Progress percent={metrics.cpu} strokeColor={metrics.cpu > 80 ? "#DC2626" : "#10B981"} showInfo={false} strokeWidth={10} />
                </div>
                <div style={{ marginBottom: 28 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text strong>Allocated Memory (RAM)</Text>
                    <Text type="secondary" style={{ fontWeight: 700 }}>{metrics.ramUsed}GB / {metrics.ramTotal}GB</Text>
                  </div>
                  <Progress percent={Math.round((metrics.ramUsed / metrics.ramTotal) * 100)} strokeColor="#F59E0B" showInfo={false} strokeWidth={10} />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text strong>Physical Volume Storage (NVMe)</Text>
                    <Text type="secondary" style={{ fontWeight: 700 }}>{metrics.storageUsed} GB / {metrics.storageTotal} GB</Text>
                  </div>
                  <Progress percent={Math.round((metrics.storageUsed / (metrics.storageTotal || 1)) * 100)} strokeColor="#2563EB" showInfo={false} strokeWidth={10} />
                </div>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title={<span style={{ fontWeight: 700 }}><SettingOutlined /> Master Administrative Directives</span>} bordered={false} style={{ border: '1px solid #E2E8F0', borderRadius: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <Space wrap size="middle">
                    <Button type="primary" icon={<DatabaseOutlined />} size="large" onClick={() => executeAdminAction("backup", "Generate Database Backup", "This will command the server to halt minor read/write ops momentarily to compile a full SQL archive of the application database.")} loading={loading} style={{ backgroundColor: '#2563EB', borderColor: '#2563EB', fontWeight: 600 }}>
                      Force Database Backup
                    </Button>
                    <Button size="large" icon={<ClearOutlined />} onClick={() => executeAdminAction("clearCache", "Purge Server Cache", "This will flush the Laravel cache, routing tables, and compiled views. The application may run slightly slower for the next 60 seconds while rebuilding cache.")} loading={loading} style={{ fontWeight: 600 }}>
                      Purge Cache
                    </Button>
                    <Button size="large" icon={<SyncOutlined />} onClick={() => executeAdminAction("restartQueue", "Restart Worker Daemons", "This will safely kill current background queue workers after their active job finishes and spawn fresh instances. Used to apply code changes to background tasks.")} loading={loading} style={{ fontWeight: 600 }}>
                      Restart Workers
                    </Button>
                    <Button 
                      size="large" danger={!isMaintenanceMode} type={isMaintenanceMode ? "primary" : "default"}
                      icon={isMaintenanceMode ? <UnlockOutlined /> : <LockOutlined />} 
                      onClick={() => executeAdminAction("toggleMaintenance", isMaintenanceMode ? "Deactivate Maintenance Status" : "Activate Maintenance Protocol", isMaintenanceMode ? "This will open the system back up to public traffic." : "This will immediately drop all active user sessions and present a 503 Service Unavailable screen to all non-admin traffic.")}
                      loading={loading} style={isMaintenanceMode ? { backgroundColor: '#10B981', borderColor: '#10B981', fontWeight: 600 } : { fontWeight: 600 }}
                    >
                      {isMaintenanceMode ? "Restore Public Access" : "Initiate Maintenance Protocol"}
                    </Button>
                  </Space>
                  <Alert message="Auditing Active" description="Execution of these directives will affect real-time performance. Actions are mathematically signed and permanently registered in the system ledger." type="info" showIcon style={{ marginTop: '16px' }} />
                </div>
              </Card>
            </Col>
          </Row>
        </TabPane>

        {/* Tab 2: System Settings Management */}
        <TabPane tab={<span><SettingOutlined />Environment Integrations</span>} key="2">
          <Card bordered={false} style={{ border: '1px solid #E2E8F0', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }} bodyStyle={{ padding: 0 }}>
            
            <div style={{ padding: '24px 32px', backgroundColor: '#FEF2F2', borderBottom: '1px solid #FECACA' }}>
              <Space align="start">
                <WarningOutlined style={{ color: '#DC2626', fontSize: '24px', marginTop: '4px' }} />
                <div>
                  <Title level={4} style={{ color: '#991B1B', margin: 0, fontWeight: 800 }}>RESTRICTED ZONE: Global Architecture Variables</Title>
                  <Text style={{ color: '#7F1D1D', fontSize: '14px', display: 'block', marginTop: '4px' }}>
                    WARNING: Modifications to these environment variables will immediately propagate across the production infrastructure. Incorrect configurations (such as invalid API keys or broken URLs) may result in catastrophic service disruption and communication failures. Proceed with extreme caution.
                  </Text>
                </div>
              </Space>
            </div>

            <Form form={settingsForm} layout="vertical" onFinish={handlePreSaveSettings}>
              <Tabs tabPosition="left" style={{ minHeight: '600px', backgroundColor: '#FAFAFA' }} size="large" className="custom-settings-tabs">
                
                <TabPane tab={<span style={{ fontWeight: 600 }}><GlobalOutlined /> Core Infrastructure</span>} key="gen">
                  <div style={{ padding: '32px', backgroundColor: '#fff', minHeight: '600px' }}>
                    <Title level={4} style={{ color: '#0F172A', fontWeight: 700 }}>Core Routing & Environment</Title>
                    <Divider style={{ margin: '16px 0 24px 0' }} />
                    <Row gutter={[32, 16]}>
                      {renderSettingInput('APP_NAME', 'System Designation (Name)', 'text', 'Integrated Agriculture')}
                      {renderSettingInput('APP_URL', 'Root System URL', 'text', 'http://localhost')}
                      {renderSettingInput('APP_ENV', 'Deployment Environment', 'select', 'Select Environment', false, [
                        { label: 'Local Sandbox', value: 'local' },
                        { label: 'Production Live', value: 'production' }
                      ])}
                      {renderSettingInput('APP_DEBUG', 'Verbose Debugging (Disable in Prod)', 'boolean')}
                    </Row>
                  </div>
                </TabPane>

                <TabPane tab={<span style={{ fontWeight: 600 }}><MessageOutlined /> SMS Routing</span>} key="sms">
                  <div style={{ padding: '32px', backgroundColor: '#fff', minHeight: '600px' }}>
                    <Title level={4} style={{ color: '#0F172A', fontWeight: 700 }}>Afromessage Telemetry API</Title>
                    <Divider style={{ margin: '16px 0 24px 0' }} />
                    <Row gutter={[32, 16]}>
                      {renderSettingInput('AFROMESSAGE_API_KEY', 'Cryptographic API Key (JWT)', 'text', 'eyJhb...', true)}
                      {renderSettingInput('AFROMESSAGE_IDENTIFIER_ID', 'System Identifier Token', 'text', 'e80ad9...')}
                      {renderSettingInput('AFROMESSAGE_SENDER_NAME', 'Masked Sender Signature', 'text', 'Alyah Plc')}
                      {renderSettingInput('SMS_NOTIFICATIONS_ENABLED', 'Authorize Global Outbound SMS', 'boolean')}
                    </Row>
                  </div>
                </TabPane>

                <TabPane tab={<span style={{ fontWeight: 600 }}><MobileOutlined /> Mobile Controllers</span>} key="mobile">
                  <div style={{ padding: '32px', backgroundColor: '#fff', minHeight: '600px' }}>
                    <Title level={4} style={{ color: '#0F172A', fontWeight: 700 }}>Flutter Endpoint Management</Title>
                    <Divider style={{ margin: '16px 0 24px 0' }} />
                    <Row gutter={[32, 16]}>
                      {renderSettingInput('MOBILE_API_BASE_URL', 'Production Fallback URI', 'text', 'http://192.168.x.x:8000/api')}
                      {renderSettingInput('MOBILE_MAINTENANCE_MODE', 'Halt Mobile App Access', 'boolean')}
                      {renderSettingInput('MOBILE_MIN_VERSION', 'Strict Version Requirement', 'text', '1.0.5')}
                      {renderSettingInput('MOBILE_LATEST_VERSION', 'Broadcasted Latest Version', 'text', '1.1.0')}
                      {renderSettingInput('MOBILE_APK_URL', 'Over-The-Air Update Payload Link', 'text', 'https://domain.com/app.apk')}
                    </Row>
                  </div>
                </TabPane>

                <TabPane tab={<span style={{ fontWeight: 600 }}><MailOutlined /> SMTP Relay</span>} key="email">
                  <div style={{ padding: '32px', backgroundColor: '#fff', minHeight: '600px' }}>
                    <Title level={4} style={{ color: '#0F172A', fontWeight: 700 }}>SMTP Mail Relay Specifications</Title>
                    <Divider style={{ margin: '16px 0 24px 0' }} />
                    <Row gutter={[32, 16]}>
                      {renderSettingInput('MAIL_HOST', 'Relay Hostname', 'text', 'smtp.mailtrap.io')}
                      {renderSettingInput('MAIL_PORT', 'Transmission Port', 'number', '2525')}
                      {renderSettingInput('MAIL_USERNAME', 'Authentication Identity', 'text')}
                      {renderSettingInput('MAIL_PASSWORD', 'Authentication Cipher', 'text', '', true)}
                      {renderSettingInput('MAIL_FROM_ADDRESS', 'Originating Email Address', 'text', 'hello@example.com')}
                      {renderSettingInput('MAIL_FROM_NAME', 'Originating Display Name', 'text', 'Integrated Agriculture System')}
                    </Row>
                  </div>
                </TabPane>

                <TabPane tab={<span style={{ fontWeight: 600 }}><IdcardOutlined /> Identity Registry</span>} key="nid">
                  <div style={{ padding: '32px', backgroundColor: '#fff', minHeight: '600px' }}>
                    <Title level={4} style={{ color: '#0F172A', fontWeight: 700 }}>National Identity API Bus</Title>
                    <Divider style={{ margin: '16px 0 24px 0' }} />
                    <Row gutter={[32, 16]}>
                      {renderSettingInput('NID_API_URL', 'Government Endpoint Bus URL', 'text', 'https://api.national-id.gov')}
                      {renderSettingInput('NID_API_KEY', 'Gov Access Credential', 'text', '', true)}
                      {renderSettingInput('NID_BYPASS_DEV', 'Bypass Registry (Development Only)', 'boolean')}
                    </Row>
                  </div>
                </TabPane>

                <TabPane tab={<span style={{ fontWeight: 600 }}><GlobalOutlined /> Access Security</span>} key="mfa">
                  <div style={{ padding: '32px', backgroundColor: '#fff', minHeight: '600px' }}>
                    <Title level={4} style={{ color: '#0F172A', fontWeight: 700 }}>Multi-Factor Authentication (MFA)</Title>
                    <Divider style={{ margin: '16px 0 24px 0' }} />
                    <Row gutter={[32, 16]}>
                      {renderSettingInput('MFA_ENABLED', 'Enforce MFA Policies Globally', 'boolean')}
                      {renderSettingInput('MFA_PROVIDER', 'Authorized Delivery Vector', 'select', 'Select Provider', false, [
                        { label: 'Afromessage SMS Protocol', value: 'SMS' },
                        { label: 'SMTP Email Protocol', value: 'Email' }
                      ])}
                      {renderSettingInput('MFA_TOKEN_EXPIRY', 'Token Time-To-Live (Minutes)', 'number', '10')}
                    </Row>
                  </div>
                </TabPane>

              </Tabs>
              <div style={{ padding: '24px 32px', borderTop: '1px solid #E2E8F0', textAlign: 'right', background: '#F8FAFC' }}>
                <Button type="primary" htmlType="submit" size="large" loading={loading} icon={<SafetyCertificateOutlined />} style={{ padding: '0 40px', fontWeight: 700, backgroundColor: '#0F172A', borderColor: '#0F172A', height: '50px', fontSize: '16px' }}>
                  Analyze & Deploy Configuration
                </Button>
              </div>
            </Form>
          </Card>
        </TabPane>

        {/* Tab 3: Backups Manager */}
        <TabPane tab={<span><DatabaseOutlined />Vault Archives</span>} key="3">
          <Card title={<span style={{ fontWeight: 700 }}>Cryptographic Database Archives</span>} extra={<Button type="primary" style={{ backgroundColor: '#2563EB', fontWeight: 600 }} icon={<DatabaseOutlined />} onClick={() => executeAdminAction("backup", "Generate Database Backup", "This will compile a full SQL archive of the application database.")} loading={loading}>Compile Archive</Button>} bordered={false} style={{ border: '1px solid #E2E8F0', borderRadius: '10px' }}>
            <Table dataSource={backups} rowKey="id" pagination={{ pageSize: 8 }} columns={[
              { title: 'Signature Block', dataIndex: 'filename', key: 'filename', render: text => <Text code>{text}</Text> },
              { title: 'Storage Vector', dataIndex: 'disk', key: 'disk' },
              { title: 'Volume Mass', dataIndex: 'size_bytes', key: 'size_bytes', render: (bytes) => `${(bytes / 1024).toFixed(2)} KB` },
              { title: 'Timestamp', dataIndex: 'created_at', key: 'created_at' },
              { title: 'Directives', key: 'actions', render: (_, record) => (
                  <Space size="middle">
                    <Button type="link" icon={<DownloadOutlined />} onClick={() => meraApi.downloadBackupFile(record.id)} style={{ fontWeight: 600 }}>Extract</Button>
                    <Button type="link" onClick={() => handleBackupRestore(record.id, record.filename)} style={{ fontWeight: 600, color: '#F59E0B' }}>Restore State</Button>
                    <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleBackupDelete(record.id)} style={{ fontWeight: 600 }}>Scrub</Button>
                  </Space>
                )
              }
            ]} />
          </Card>
        </TabPane>

        {/* Tab 4: Security Logs */}
        <TabPane tab={<span><SafetyCertificateOutlined />Audit Ledger</span>} key="4">
          <Card title={<span style={{ fontWeight: 700 }}>Immutable System Audit Ledger</span>} bordered={false} style={{ border: '1px solid #E2E8F0', borderRadius: '10px' }} extra={
              <Space>
                <Select placeholder="Severity Index" value={logSeverity || undefined} onChange={(val) => { setLogSeverity(val || ''); setLogPage(1); }} style={{ width: 160, fontWeight: 500 }} allowClear>
                  <Select.Option value="Info">Low (Info)</Select.Option><Select.Option value="Medium">Elevated (Medium)</Select.Option><Select.Option value="High">Critical (High)</Select.Option>
                </Select>
                <Button danger type="primary" icon={<DeleteOutlined />} onClick={handleClearLogs} style={{ fontWeight: 600 }}>Purge Ledger</Button>
              </Space>
            }>
            <Table dataSource={logs} rowKey="id" pagination={false} columns={[
              { title: 'Timestamp', dataIndex: 'created_at', key: 'created_at', width: '18%', render: t => <Text type="secondary">{t}</Text> },
              { title: 'Directive Execution', dataIndex: 'event', key: 'event', width: '37%', render: t => <Text strong>{t}</Text> },
              { title: 'Authorized Principal', dataIndex: 'user', key: 'user', width: '20%', render: (user, record) => {
                  if (user) {
                    const displayName = user.name || user.username || [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email || `User #${user.id}`;
                    return <div><span style={{ fontWeight: 600, display: 'block', color: '#0F172A' }}>{displayName}</span>{user.email && displayName !== user.email && <Text type="secondary" style={{ fontSize: '11px' }}>{user.email}</Text>}</div>;
                  }
                  return record.user_id ? `Identity: ${record.user_id}` : <Tag color="default">SYSTEM DAEMON</Tag>;
                }
              },
              { title: 'Network Origin', dataIndex: 'ip_address', key: 'ip_address', width: '13%', render: (ip) => <Tag color="blue">{ip || 'INTERNAL'}</Tag> },
              { title: 'Threat Level', dataIndex: 'severity', key: 'severity', width: '12%', render: (sev) => {
                  const colors = { High: 'error', Medium: 'warning', Info: 'processing' };
                  return <Tag color={colors[sev] || 'default'} style={{ fontWeight: 700 }}>{sev ? sev.toUpperCase() : 'UNKNOWN'}</Tag>;
                }
              },
            ]} />
            <div style={{ marginTop: 24, textAlign: 'right' }}>
              <Pagination current={logPage} total={logTotal} pageSize={15} onChange={(p) => setLogPage(p)} showSizeChanger={false} />
            </div>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
}