import React from 'react';
import { Result, Button } from 'antd';
import { RocketOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

export default function ComingSoon({ moduleName = "This module" }) {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <Result
        icon={<RocketOutlined style={{ color: '#2E75B6' }} />}
        title={`${moduleName} is Under Construction`}
        subTitle="Our engineering team is currently building this feature. It will be available in an upcoming sprint."
        extra={
          <Button type="primary" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        }
      />
    </div>
  );
}