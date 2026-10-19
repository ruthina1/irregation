import React, { useState, useEffect } from 'react';
import { message, Typography, Breadcrumb, Row, Col, Modal } from 'antd';
import { HomeOutlined, TeamOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

import { umacApi } from '../../services/api/umacApi';
import BrandedLoader from '../../components/common/BrandedLoader';
import UserFormModal from './UserFormModal';
import UserFilters from './UserFilters';
import UserTable from './UserTable';

const { Title, Text } = Typography;
const { confirm } = Modal;

export default function UserList() {
  const [users, setUsers] = useState([]);
  
  // ─── Pro-Level Loading States ───
  const [initialLoad, setInitialLoad] = useState(true); 
  const [tableLoading, setTableLoading] = useState(false); 
  const [isSubmitting, setIsSubmitting] = useState(false); 
  
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  
  // ─── Search & Filter States ───
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // ───── Fetch Users (With Filters) ─────
  const fetchUsers = async (page = 1, search = searchTerm, status = statusFilter) => {
    setTableLoading(true);
    try {
      // NOTE: Ensure your Laravel API `getUsers` accepts these parameters!
      const response = await umacApi.getUsers({ page, search, status });
      const { data, current_page, total } = response.data.data; 
      
      setUsers(data);
      setPagination(prev => ({ ...prev, current: current_page, total }));
    } catch (error) {
      message.error('Failed to load user directory.');
    } finally {
      setTableLoading(false);
      setInitialLoad(false); 
    }
  };

  // Run when component mounts, or when search/filter changes
  useEffect(() => {
    fetchUsers(1, searchTerm, statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusFilter]);

  const handleTableChange = (newPagination) => {
    fetchUsers(newPagination.current);
  };

  // ───── Handlers ─────
  const handleToggleStatus = (record, checked) => {
    confirm({
      title: `Are you sure you want to ${checked ? 'activate' : 'lock'} this user account?`,
      icon: <ExclamationCircleOutlined style={{ color: '#F59E0B' }} />,
      content: `User: ${record.full_name}`,
      okText: 'Yes, Proceed',
      okType: checked ? 'primary' : 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        setIsSubmitting(true);
        try {
          await umacApi.toggleUserStatus(record.id);
          message.success(`User account ${checked ? 'activated' : 'locked'} successfully`);
          await fetchUsers(pagination.current);
        } catch (error) {
          message.error('Failed to update account status');
        } finally {
          setIsSubmitting(false);
        }
      }
    });
  };

  const handleDelete = async (id) => {
    setIsSubmitting(true);
    try {
      await umacApi.deleteUser(id);
      message.success('User permanently deleted');
      const newPage = users.length === 1 && pagination.current > 1 ? pagination.current - 1 : pagination.current;
      await fetchUsers(newPage);
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to delete user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      if (editingUser) {
        await umacApi.updateUser(editingUser.id, values);
        message.success('User profile updated');
      } else {
        await umacApi.createUser(values);
        message.success('New user securely registered');
      }
      setIsModalOpen(false);
      await fetchUsers(pagination.current);
    } catch (error) {
      message.error(error.response?.data?.message || 'Action failed. Check inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'relative', minHeight: '100%' }}>
      
      {/* ─── Premium Branded Loader Overlay ─── */}
      {(initialLoad || isSubmitting) && (
        <BrandedLoader message={initialLoad ? "Authenticating Directory..." : "Processing Security Request..."} />
      )}

      {/* ─── Formal Header Section ─── */}
      <div style={{ marginBottom: 24 }}>
        <Breadcrumb style={{ marginBottom: 8, fontSize: '12px' }}>
          <Breadcrumb.Item><HomeOutlined /> IAIMS</Breadcrumb.Item>
          <Breadcrumb.Item>System Administration</Breadcrumb.Item>
          <Breadcrumb.Item>User Management</Breadcrumb.Item>
        </Breadcrumb>

        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ 
              margin: 0, 
              color: '#0B1120', 
              fontFamily: "'Times New Roman', Times, serif", 
              fontWeight: 'bold',
              letterSpacing: '0.5px'
            }}>
              <TeamOutlined style={{ color: '#039c33', marginRight: 12 }} />
              System User Directory
            </Title>
            <Text type="secondary" style={{ fontSize: '13px' }}>
              Manage access control, roles, and administrative privileges.
            </Text>
          </Col>
        </Row>
      </div>

      {/* ─── Modular Filters Toolbar ─── */}
      <UserFilters 
        onSearch={setSearchTerm} 
        onFilterStatus={setStatusFilter} 
        onAdd={() => { setEditingUser(null); setIsModalOpen(true); }} 
      />

      {/* ─── Modular Data Table ─── */}
      <UserTable 
        users={users}
        loading={tableLoading}
        pagination={pagination}
        onChange={handleTableChange}
        onToggleStatus={handleToggleStatus}
        onEdit={(record) => { setEditingUser(record); setIsModalOpen(true); }}
        onDelete={handleDelete}
      />

      {/* ─── Form Modal ─── */}
      <UserFormModal 
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        loading={false} // Loading handled by full-screen overlay now
        editingUser={editingUser}
      />
    </div>
  );
}