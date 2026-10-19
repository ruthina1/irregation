import React from 'react';
import { Card, Col, Row, Statistic } from 'antd';
import { 
  ToolOutlined, CheckCircleOutlined, ClockCircleOutlined,
  WarningOutlined, FundOutlined, TeamOutlined 
} from '@ant-design/icons';

const CARD_STYLE_GREEN = { borderRight: '1px solid #f0f0f0', borderBottom: '3px solid #52c41a', borderRadius: 0, height: '100%', boxShadow: 'none' };
const CARD_STYLE_BLUE = { borderRight: '1px solid #f0f0f0', borderBottom: '3px solid #1890ff', borderRadius: 0, height: '100%', boxShadow: 'none' };
const CARD_STYLE_ORANGE = { borderRight: '1px solid #f0f0f0', borderBottom: '3px solid #fa8c16', borderRadius: 0, height: '100%', boxShadow: 'none' };
const CARD_STYLE_PURPLE = { borderRight: '1px solid #f0f0f0', borderBottom: '3px solid #722ed1', borderRadius: 0, height: '100%', boxShadow: 'none' };

const MechanizationStats = ({ stats = {} }) => {
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
      <Col xs={24} sm={12} lg={4}>
        <Card bordered={false} style={CARD_STYLE_GREEN}>
          <Statistic 
            title="Total Equipment" 
            value={stats.total_equipments || 0} 
            prefix={<ToolOutlined style={{ color: '#52c41a' }} />} 
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={4}>
        <Card bordered={false} style={CARD_STYLE_BLUE}>
          <Statistic 
            title="Operational" 
            value={stats.operational_equipments || 0} 
            prefix={<CheckCircleOutlined style={{ color: '#1890ff' }} />} 
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={4}>
        <Card bordered={false} style={CARD_STYLE_ORANGE}>
          <Statistic 
            title="In Use" 
            value={stats.in_use_equipments || 0} 
            prefix={<ClockCircleOutlined style={{ color: '#fa8c16' }} />} 
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={4}>
        <Card bordered={false} style={CARD_STYLE_PURPLE}>
          <Statistic 
            title="Under Maintenance" 
            value={stats.under_maintenance || 0} 
            prefix={<WarningOutlined style={{ color: '#722ed1' }} />} 
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={4}>
        <Card bordered={false} style={CARD_STYLE_GREEN}>
          <Statistic 
            title="Total Allocations" 
            value={stats.total_allocations || 0} 
            prefix={<TeamOutlined style={{ color: '#52c41a' }} />} 
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={4}>
        <Card bordered={false} style={CARD_STYLE_BLUE}>
          <Statistic 
            title="Active Allocations" 
            value={stats.active_allocations || 0} 
            prefix={<FundOutlined style={{ color: '#1890ff' }} />} 
          />
        </Card>
      </Col>
    </Row>
  );
};

export default MechanizationStats;