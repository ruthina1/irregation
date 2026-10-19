import React from 'react';
import { Button, Popconfirm, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined, QuestionCircleOutlined } from '@ant-design/icons';

export const EditButton = ({ onClick, tooltip = "Edit" }) => (
  <Tooltip title={tooltip}>
    <Button 
      type="text" 
      icon={<EditOutlined style={{ color: '#2E75B6' }} />} 
      onClick={onClick} 
    />
  </Tooltip>
);

export const DeleteButton = ({ onConfirm, itemName = "this item", loading = false }) => (
  <Popconfirm
    title={`Delete ${itemName}`}
    description={`Are you sure you want to delete ${itemName}? This action cannot be undone.`}
    icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
    onConfirm={onConfirm}
    okText="Yes, Delete"
    cancelText="Cancel"
    okButtonProps={{ danger: true, loading }}
  >
    <Tooltip title={`Delete ${itemName}`}>
      <Button 
        type="text" 
        danger 
        icon={<DeleteOutlined />} 
      />
    </Tooltip>
  </Popconfirm>
);