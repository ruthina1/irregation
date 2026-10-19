import React from 'react';
import { Typography, Space } from 'antd';

const { Title, Text } = Typography;

export default function PageHeader({ title, subtitle, extra, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <Title level={3} style={{ margin: 0 }}>
            {title}
          </Title>
          {subtitle && <Text type="secondary">{subtitle}</Text>}
        </div>
        {extra && <Space>{extra}</Space>}
      </div>
      {children}
    </div>
  );
}
