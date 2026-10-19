import React from 'react';
import { Space, Tooltip, Button } from 'antd';
import { EyeOutlined, AuditOutlined } from '@ant-design/icons';
import { EditButton, DeleteButton } from './ActionButtons'; 

// ─── 1. EXPORTABLE REUSABLE STYLES ───
export const ACTION_HEADER_STYLE = {
  backgroundColor: '#1d4227', // Dark Forest Green Header
  color: '#ffffff',
  borderBottom: 'none',
  textAlign: 'center',
};

export const ACTION_CELL_STYLE = {
  backgroundColor: '#a0cfad', 
  borderLeft: '1px solid rgba(226, 250, 13, 0.15)',
};

// ─── 2. EXPORTABLE COLUMN GENERATOR (Makes Tables Clean!) ───
export const getActionColumn = ({ onView, onEdit, onDelete, onApprove, getItemName, width = 200 }) => ({
  title: 'Actions',
  key: 'actions',
  align: 'center',
  width: onApprove ? width : 160, // Automatically adjusts column size if approve is used
  onHeaderCell: () => ({ style: ACTION_HEADER_STYLE }),
  onCell: () => ({ style: ACTION_CELL_STYLE }),
  render: (_, record) => (
    <ActionButtonUI 
      onView={onView ? () => onView(record) : null}
      onEdit={onEdit ? () => onEdit(record) : null}
      onDelete={onDelete ? () => onDelete(record.id) : null}
      onApprove={onApprove ? () => onApprove(record) : null}
      itemName={getItemName ? getItemName(record) : "this item"}
    />
  )
});

// ─── 3. THE UI BUTTONS COMPONENT ───
export default function ActionButtonUI({ onView, onEdit, onDelete, onApprove, itemName = "item" }) {
  
  const stopEvent = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
  };

  return (
    <div className="action-ui-wrapper" onClick={stopEvent}>
      <Space size="small">
        
        {/* VIEW BUTTON */}
        {onView && (
          <Tooltip title="View Full Details" color="#1677ff">
            <Button 
              className="view-ui-btn"
              icon={<EyeOutlined style={{ color: '#1677ff' }} />} 
              onClick={onView}
            />
          </Tooltip>
        )}

        {/* VERIFY / APPROVE BUTTON */}
        {onApprove && (
          <Tooltip title="Verify / Approve Status" color="#fa8c16">
            <Button 
              className="approve-ui-btn"
              icon={<AuditOutlined style={{ color: '#fa8c16' }} />} 
              onClick={onApprove}
            />
          </Tooltip>
        )}

        {/* EXISTING EDIT BUTTON */}
        {onEdit && <EditButton onClick={onEdit} />}
        
        {/* EXISTING DELETE BUTTON */}
        {onDelete && <DeleteButton onConfirm={onDelete} itemName={itemName} />}
        
      </Space>

      <style>{`
        .action-ui-wrapper {
          display: flex;
          justify-content: center;
          width: 100%;
        }
        
        .action-ui-wrapper .ant-btn {
          background-color: #ffffff !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 6px !important;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15) !important;
          width: 32px !important;
          height: 32px !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          transition: all 0.2s ease-in-out !important;
        }

        .action-ui-wrapper .ant-btn:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.25) !important;
        }

        .view-ui-btn:hover {
          border-color: #1677ff !important;
        }

        .approve-ui-btn:hover {
          border-color: #fa8c16 !important;
        }
      `}</style>
    </div>
  );
}