import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';
import { umacApi } from '../../services/api/umacApi';

const { Option } = Select;

export default function RoleFormModal({ open, onCancel, onSubmit, loading, editingRole }) {
  const [form] = Form.useForm();
  const [permissions, setPermissions] = useState([]);
  const [fetchingPerms, setFetchingPerms] = useState(false);

  // Fetch all available system permissions for the dropdown
  useEffect(() => {
    if (open) {
      const loadPermissions = async () => {
        setFetchingPerms(true);
        try {
          const res = await umacApi.getPermissions();
          setPermissions(res.data.data); 
        } catch (error) {
          message.error("Failed to load permissions list");
        } finally {
          setFetchingPerms(false);
        }
      };
      loadPermissions();
    }
  }, [open]);

  // Populate form fields on edit
  useEffect(() => {
    if (open) {
      if (editingRole) {
        const permNames = editingRole.permissions?.map(p => p.name) || [];
        form.setFieldsValue({ 
          name: editingRole.name, 
          scope_type: editingRole.scope_type || 'GLOBAL',
          permissions: permNames 
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ scope_type: 'GLOBAL' }); // Set default for new roles
      }
    }
  }, [open, editingRole, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
    } catch (error) {
      // Handled natively by form validation
    }
  };

  return (
    <Modal
      title={editingRole ? "Edit Role & Permissions" : "Create New Role"}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={loading}
      okText={editingRole ? "Save Changes" : "Create Role"}
      destroyOnClose
      width={500}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 12 }}>
        <Form.Item 
          name="name" 
          label="Role Name" 
          rules={[{ required: true, message: 'Role name is required' }]}
        >
          <Input 
            placeholder="E.g. KebeleManager" 
            disabled={editingRole?.name === 'SuperAdmin'} 
          />
        </Form.Item>

        <Form.Item
          name="scope_type"
          label="Geographic Data Scope (Tenant Boundary)"
          rules={[{ required: true, message: 'Geographic data scope is required' }]}
        >
          <Select 
            placeholder="Select operational boundaries"
            disabled={editingRole?.name === 'SuperAdmin'}
          >
            <Option value="GLOBAL">GLOBAL — Full Visibility (Regional HQ)</Option>
            <Option value="ZONE">ZONE — Constrain visibility to Assigned Zone</Option>
            <Option value="WOREDA">WOREDA — Constrain visibility to Assigned Woreda</Option>
            <Option value="KEBELE">KEBELE — Constrain visibility to Assigned Kebele</Option>
          </Select>
        </Form.Item>

        <Form.Item 
          name="permissions" 
          label="Assigned Permissions"
          extra="Select the actions this role is allowed to perform."
        >
          <Select
            mode="multiple"
            allowClear
            placeholder="Select permissions"
            loading={fetchingPerms}
            options={permissions.map(p => ({
              label: p.name,
              value: p.name
            }))}
            disabled={editingRole?.name === 'SuperAdmin'}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}