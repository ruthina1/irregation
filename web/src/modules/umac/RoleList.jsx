import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Space, Typography, message, Tooltip } from 'antd';
import { PlusOutlined, SafetyOutlined } from '@ant-design/icons';
import { umacApi } from '../../services/api/umacApi';
import RoleFormModal from './RoleFormModal';
import { EditButton, DeleteButton } from '../../components/common/ActionButtons';
import BrandedLoader from '../../components/common/BrandedLoader';

const { Title } = Typography;

export default function RoleList() {
  const [roles, setRoles] = useState([]);
  const [initialLoad, setInitialLoad] = useState(true);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await umacApi.getRoles();
      setRoles(response.data.data); 
    } catch (error) {
      message.error('Failed to load roles');
    } finally {
      setLoading(false);
      setInitialLoad(false); 
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleDelete = async (id) => {
    try {
      await umacApi.deleteRole(id);
      message.success('Role deleted successfully');
      fetchRoles();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to delete role';
      message.error(errorMsg);
    }
  };

  const handleFormSubmit = async (values) => {
    setSubmitLoading(true);
    try {
      if (editingRole) {
        await umacApi.updateRole(editingRole.id, values);
        message.success('Role updated successfully');
      } else {
        await umacApi.createRole(values);
        message.success('Role created successfully');
      }
      setIsModalOpen(false);
      fetchRoles();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Action failed';
      message.error(errorMsg);
    } finally {
      setSubmitLoading(false);
    }
  };

  const openForm = (record = null) => {
    setEditingRole(record);
    setIsModalOpen(true);
  };

  const columns = [
    { 
      title: 'Role Name', 
      dataIndex: 'name', 
      key: 'name',
      render: (text) => (
        <span style={{ fontWeight: 500 }}>
          {text === 'SuperAdmin' && <SafetyOutlined style={{ color: '#D32F2F', marginRight: 8 }} />}
          {text}
        </span>
      )
    },
    {
      title: 'Geographic Scope',
      dataIndex: 'scope_type',
      key: 'scope_type',
      render: (scope) => {
        let color = 'blue';
        if (scope === 'GLOBAL') color = 'gold';
        if (scope === 'ZONE') color = 'purple';
        if (scope === 'WOREDA') color = 'orange';
        if (scope === 'KEBELE') color = 'green';
        
        return (
          <Tag color={color} style={{ fontWeight: 600 }}>
            {scope || 'GLOBAL'}
          </Tag>
        );
      }
    },
    { 
      title: 'System Permissions', 
      key: 'permissions',
      width: '40%',
      render: (_, record) => {
        const perms = record.permissions || [];
        if (record.name === 'SuperAdmin') {
          return <Tag color="red">Bypass All Permissions</Tag>;
        }
        if (perms.length === 0) {
          return <Tag>No Permissions</Tag>;
        }
        
        const displayed = perms.slice(0, 3);
        const hidden = perms.slice(3);
        
        return (
          <Space wrap size={[0, 4]}>
            {displayed.map(p => <Tag color="blue" key={p.id}>{p.name}</Tag>)}
            {hidden.length > 0 && (
              <Tooltip title={hidden.map(p => p.name).join(', ')}>
                <Tag color="cyan">+{hidden.length} more</Tag>
              </Tooltip>
            )}
          </Space>
        );
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, record) => {
        if (record.name === 'SuperAdmin') {
          return <Tag color="default">Locked</Tag>;
        }

        return (
          <Space size="small">
            <EditButton onClick={() => openForm(record)} tooltip="Edit Role & Permissions" />
            <DeleteButton 
              itemName={`Role: ${record.name}`} 
              onConfirm={() => handleDelete(record.id)} 
            />
          </Space>
        );
      }
    }
  ];

  if (initialLoad) {
    return <BrandedLoader message="Fetching Security Roles & Permissions..." />;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Roles & Permissions</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openForm()}>
          Create New Role
        </Button>
      </div>

      <Table 
        columns={columns} 
        dataSource={roles} 
        rowKey="id" 
        loading={loading} 
        pagination={false}
        bordered
      />

      <RoleFormModal 
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        loading={submitLoading}
        editingRole={editingRole}
      />
    </div>
  );
}