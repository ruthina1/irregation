import React from 'react';
import { Card, Col, Row, Statistic } from 'antd';
import { 
  ApartmentOutlined, CheckCircleOutlined, FundOutlined, 
  LineChartOutlined, TeamOutlined, ToolOutlined 
} from '@ant-design/icons';

const CARD_STYLE_GREEN = { borderRight: '1px solid #f0f0f0', borderBottom: '3px solid #52c41a', borderRadius: 0, height: '100%', boxShadow: 'none' };
const CARD_STYLE_BLUE = { borderRight: '1px solid #f0f0f0', borderBottom: '3px solid #1890ff', borderRadius: 0, height: '100%', boxShadow: 'none' };
const CARD_STYLE_ORANGE = { borderRight: '1px solid #f0f0f0', borderBottom: '3px solid #fa8c16', borderRadius: 0, height: '100%', boxShadow: 'none' };
const CARD_STYLE_PURPLE = { borderRight: '1px solid #f0f0f0', borderBottom: '3px solid #722ed1', borderRadius: 0, height: '100%', boxShadow: 'none' };

const LivestockStats = ({ stats = {} }) => {
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
      <Col xs={24} sm={12} lg={4}>
        <Card bordered={false} style={CARD_STYLE_GREEN}>
          <Statistic 
            title="Total Farms" 
            value={stats.total_farms || 0} 
            prefix={<ApartmentOutlined style={{ color: '#52c41a' }} />} 
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={4}>
        <Card bordered={false} style={CARD_STYLE_BLUE}>
          <Statistic 
            title="Active Farms" 
            value={stats.active_farms || 0} 
            prefix={<CheckCircleOutlined style={{ color: '#1890ff' }} />} 
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={4}>
        <Card bordered={false} style={CARD_STYLE_ORANGE}>
          <Statistic 
            title="Total Animals" 
            value={stats.total_animals || 0} 
            prefix={<TeamOutlined style={{ color: '#fa8c16' }} />} 
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={4}>
        <Card bordered={false} style={CARD_STYLE_PURPLE}>
          <Statistic 
            title="Total Productions" 
            value={stats.total_productions || 0} 
            prefix={<LineChartOutlined style={{ color: '#722ed1' }} />} 
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={4}>
        <Card bordered={false} style={CARD_STYLE_GREEN}>
          <Statistic 
            title="Production Quantity" 
            value={stats.total_production_quantity || 0} 
            precision={2} 
            suffix="Units"
            prefix={<FundOutlined style={{ color: '#52c41a' }} />} 
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={4}>
        <Card bordered={false} style={CARD_STYLE_BLUE}>
          <Statistic 
            title="Farm Types" 
            value={stats.by_farm_type?.length || 0} 
            prefix={<ToolOutlined style={{ color: '#1890ff' }} />} 
          />
        </Card>
      </Col>
    </Row>
  );
};

export default LivestockStats;