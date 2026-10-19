import React from 'react';
import { Button, Space } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';

export default function StudyDesignDashboardFilters({ onNavigateStudies }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
      <Button
        type="primary"
        icon={<ArrowRightOutlined />}
        onClick={onNavigateStudies}
        style={{ backgroundColor: '#1a5f2c', borderColor: '#1a5f2c' }}
      >
        Go to Active Studies
      </Button>
    </div>
  );
}
