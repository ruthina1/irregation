import { Button, Card, Col, Row, Typography } from 'antd';
import { ArrowRightOutlined, ApiOutlined, CloudOutlined, EnvironmentOutlined } from '@ant-design/icons';

const { Text } = Typography;

const LINKS = [
  { path: '/irrigation/water-utilization/irrigated-area', icon: <EnvironmentOutlined />, title: 'Irrigated Land Utilization', text: 'Seasonal irrigated area by cropping round and scheme' },
  { path: '/irrigation/water-utilization/water-sources', icon: <CloudOutlined />, title: 'Water Sources & Technologies', text: 'Abstraction technologies, discharge and command area' },
  { path: '/irrigation/water-utilization/irrigation-systems', icon: <ApiOutlined />, title: 'Irrigation Systems & Methods', text: 'Systems in operation per WUA and scheme' },
];

/** Shortcuts to the three water utilization registers. */
export default function WaterPageLinks({ onNavigate }) {
  return (
    <Row gutter={[16, 16]}>
      {LINKS.map((link) => (
        <Col xs={24} md={8} key={link.path}>
          <Card variant="borderless" style={{ borderRadius: 8, height: '100%' }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#1a5f2c', marginBottom: 6 }}>{link.icon} {link.title}</div>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 12 }}>{link.text}</Text>
            <Button type="link" style={{ padding: 0 }} onClick={() => onNavigate(link.path)}>
              Open register <ArrowRightOutlined />
            </Button>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
