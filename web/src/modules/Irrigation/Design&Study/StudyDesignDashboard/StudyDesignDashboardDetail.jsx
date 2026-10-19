import React from 'react';
import { Descriptions, Modal, Tag } from 'antd';

export default function StudyDesignDashboardDetail({ visible, record, onClose }) {
  return (
    <Modal title="Dashboard Indicator Detail" open={Boolean(visible && record)} onCancel={onClose} footer={null}>
      {record && (
        <Descriptions bordered size="small" column={1}>
          <Descriptions.Item label="Indicator">{record.title || record.name}</Descriptions.Item>
          <Descriptions.Item label="Value">{record.value}</Descriptions.Item>
          <Descriptions.Item label="Description">{record.description || 'Executive KPI tracking summary.'}</Descriptions.Item>
        </Descriptions>
      )}
    </Modal>
  );
}
