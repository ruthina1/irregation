import React, { useState, useEffect, useMemo } from 'react';

import {
  Table,
  Tag,
  Space,
  Button,
  Modal,
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Input,
  Select,
  Alert,
  Tooltip,
  Empty,
  Badge,
  notification
} from 'antd';

import {
  EyeOutlined,
  AlertOutlined,
  CheckCircleOutlined,
  AreaChartOutlined,
  PlusOutlined,
  SearchOutlined,
  DashboardOutlined,
  BugOutlined,
  SafetyOutlined,
  WarningOutlined
} from '@ant-design/icons';

import moment from 'moment';

import BrandedLoader from '../../components/common/BrandedLoader';

import agronomyApi from "../../services/api/agronomyApi";
import PestReportForm from './PestReportForm';

const { Title, Text } = Typography;
const { Option } = Select;

const CARD_STYLE_RED = {
  borderRight: '1px solid #f0f0f0',
  borderBottom: '3px solid #ff4d4f',
  borderRadius: 0,
  height: '100%',
  boxShadow: 'none'
};

const CARD_STYLE_BLUE = {
  borderRight: '1px solid #f0f0f0',
  borderBottom: '3px solid #1890ff',
  borderRadius: 0,
  height: '100%',
  boxShadow: 'none'
};

const CARD_STYLE_ORANGE = {
  borderRight: '1px solid #f0f0f0',
  borderBottom: '3px solid #fa8c16',
  borderRadius: 0,
  height: '100%',
  boxShadow: 'none'
};

const CARD_STYLE_GREEN = {
  borderRight: '1px solid #f0f0f0',
  borderBottom: '3px solid #52c41a',
  borderRadius: 0,
  height: '100%',
  boxShadow: 'none'
};

const PestSurveillanceGrid = ({
  refreshTrigger,
  zones = [],
  woredas = [],
  kebeles = [],
  parcels = []
}) => {

  // =========================
  // STATE
  // =========================
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedReport, setSelectedReport] = useState(null);

  const [modalVisible, setModalVisible] = useState(false);

  const [formModalVisible, setFormModalVisible] =
    useState(false);

  const [emergencyCount, setEmergencyCount] =
    useState(0);

  const [analytics, setAnalytics] = useState({});

  const [searchText, setSearchText] = useState('');

  const [filters, setFilters] = useState({
    type: 'All',
    severity: 'All'
  });

  // =========================
  // FETCH DATA
  // =========================
  useEffect(() => {
    fetchReports();
    fetchEmergencyCount();
    fetchAnalytics();
  }, [refreshTrigger]);

  const fetchReports = async () => {
    try {
      setLoading(true);

      const response =
        await agronomyApi.getPestReports();

      setReports(
        response.data.data || response.data || []
      );
    } catch (error) {
      notification.error({
        message: 'Failed to Load',
        description:
          'Unable to fetch pest surveillance reports.'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEmergencyCount = async () => {
    try {
      const response =
        await agronomyApi.getEmergencyReports();

      setEmergencyCount(
        response.data.count || 0
      );
    } catch (error) {
      console.error(
        'Failed to fetch emergency reports:',
        error
      );
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response =
        await agronomyApi.getPestAnalytics();

      setAnalytics(response.data || {});
    } catch (error) {
      console.error(
        'Failed to fetch analytics:',
        error
      );
    }
  };

  // =========================
  // FORM SUCCESS
  // =========================
  const handleReportCreated = () => {
    setFormModalVisible(false);

    fetchReports();
    fetchEmergencyCount();
    fetchAnalytics();
  };

  // =========================
  // SEVERITY CONFIG
  // =========================
  const getSeverityConfig = (severity) => {
    switch (severity) {
      case 'Low':
        return {
          color: 'success',
          tag: 'green'
        };

      case 'Medium':
        return {
          color: 'warning',
          tag: 'orange'
        };

      case 'High':
        return {
          color: 'error',
          tag: 'red'
        };

      case 'Critical':
        return {
          color: 'error',
          tag: 'volcano'
        };

      default:
        return {
          color: 'default',
          tag: 'default'
        };
    }
  };

  // =========================
  // FILTERED DATA
  // =========================
  const filteredReports = useMemo(() => {
    return reports.filter((item) => {

      const matchesSearch =
        item.scientific_or_common_name
          ?.toLowerCase()
          .includes(searchText.toLowerCase()) ||

        item.kebele?.name
          ?.toLowerCase()
          .includes(searchText.toLowerCase()) ||

        item.woreda?.name
          ?.toLowerCase()
          .includes(searchText.toLowerCase());

      const matchesType =
        filters.type === 'All'
          ? true
          : item.agent_type === filters.type;

      const matchesSeverity =
        filters.severity === 'All'
          ? true
          : item.severity_level ===
            filters.severity;

      return (
        matchesSearch &&
        matchesType &&
        matchesSeverity
      );
    });
  }, [reports, searchText, filters]);

  // =========================
  // TABLE COLUMNS
  // =========================
  const columns = [
    {
      title: 'Date',
      dataIndex: 'detection_date',
      key: 'detection_date',

      render: (date) => (
        <Text strong>
          {moment(date).format('YYYY-MM-DD')}
        </Text>
      ),

      sorter: (a, b) =>
        moment(a.detection_date).unix() -
        moment(b.detection_date).unix(),

      defaultSortOrder: 'descend'
    },

    {
      title: 'Location',
      key: 'location',

      render: (_, record) => (
        <div>
          <Text strong>
            {record.kebele?.name || 'N/A'}
          </Text>

          <br />

          <Text type="secondary">
            {record.woreda?.name},{' '}
            {record.zone?.name}
          </Text>
        </div>
      )
    },

    {
      title: 'Type',
      dataIndex: 'agent_type',
      key: 'agent_type',

      render: (type) => (
        <Tag color="blue">
          {type}
        </Tag>
      )
    },

    {
      title: 'Pest / Disease Name',
      dataIndex:
        'scientific_or_common_name',

      key: 'name',

      ellipsis: true,

      render: (text) => (
        <Text strong>
          {text}
        </Text>
      )
    },

    {
      title: 'Infested Area',
      key: 'area',

      render: (_, record) => (
        <Tag color="orange">
          {Number(
            record.infested_area_hectares || 0
          ).toFixed(1)}{' '}
          ha
        </Tag>
      )
    },

    {
      title: 'Treated Area',
      key: 'treated',

      render: (_, record) => (
        <Tag color="green">
          {Number(
            record.treated_area_hectares || 0
          ).toFixed(1)}{' '}
          ha
        </Tag>
      )
    },

    {
      title: 'Severity',
      dataIndex: 'severity_level',
      key: 'severity',

      render: (severity) => {
        const config =
          getSeverityConfig(severity);

        return (
          <Tag color={config.tag}>
            {severity}
          </Tag>
        );
      }
    },

    {
      title: 'Emergency',
      dataIndex:
        'is_emergency_alert_triggered',

      key: 'emergency',

      render: (triggered) =>
        triggered ? (
          <Badge
            status="error"
            text={
              <Tag color="red">
                EMERGENCY
              </Tag>
            }
          />
        ) : (
          <Badge
            status="success"
            text={
              <Tag color="green">
                Normal
              </Tag>
            }
          />
        )
    },

    {
      title: 'Actions',
      key: 'actions',
      width: 120,

      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedReport(record);
                setModalVisible(true);
              }}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        background: '#fff'
      }}
    >
      {loading && (
        <BrandedLoader message="Loading Pest Surveillance Reports..." />
      )}

      {/* PAGE HEADER */}
      <div
        style={{
          background: '#fff',
          padding: '16px',
          marginBottom: 16,
          borderBottom:
            '1px solid #f0f0f0'
        }}
      >
        <Row
          justify="space-between"
          align="middle"
        >
          <Col>
            <Title
              level={3}
              style={{ marginBottom: 0 }}
            >
              Pest, Disease & Weed Surveillance
            </Title>

            <Text type="secondary">
              Monitor outbreaks, infestation
              severity and emergency alerts
            </Text>
          </Col>
        </Row>
      </div>

      <div
        style={{
          padding: '0 16px 16px'
        }}
      >

        {/* KPI CARDS */}
        <Row
          gutter={[16, 16]}
          style={{
            marginBottom: 16
          }}
        >
          <Col xs={24} sm={12} lg={6}>
            <Card
              bordered={false}
              style={CARD_STYLE_BLUE}
            >
              <Statistic
                title="Total Incidents"
                value={
                  analytics.total_incidents ||
                  reports.length
                }
                prefix={
                  <DashboardOutlined
                    style={{
                      color: '#1890ff'
                    }}
                  />
                }
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card
              bordered={false}
              style={CARD_STYLE_RED}
            >
              <Statistic
                title="Emergency Alerts"
                value={emergencyCount}
                prefix={
                  <AlertOutlined
                    style={{
                      color: '#ff4d4f'
                    }}
                  />
                }
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card
              bordered={false}
              style={CARD_STYLE_ORANGE}
            >
              <Statistic
                title="Infested Area"
                value={
                  analytics.total_infested_area ||
                  0
                }
                precision={1}
                suffix="ha"
                prefix={
                  <AreaChartOutlined
                    style={{
                      color: '#fa8c16'
                    }}
                  />
                }
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card
              bordered={false}
              style={CARD_STYLE_GREEN}
            >
              <Statistic
                title="High Risk Kebeles"
                value={
                  analytics.high_risk_kebeles ||
                  0
                }
                prefix={
                  <SafetyOutlined
                    style={{
                      color: '#52c41a'
                    }}
                  />
                }
              />
            </Card>
          </Col>
        </Row>

        {/* EMERGENCY ALERT */}
        {emergencyCount > 0 && (
          <Alert
            style={{
              marginBottom: 16,
              borderRadius: 0
            }}
            message={`${emergencyCount} Active Emergency Alert${
              emergencyCount > 1 ? 's' : ''
            }`}
            description="Critical outbreaks detected. Immediate intervention required."
            type="error"
            showIcon
            icon={<WarningOutlined />}
            closable
          />
        )}

        {/* FILTER TOOLBAR */}
        <Card
          bordered={false}
          style={{
            marginBottom: 16,
            borderRadius: 0,
            boxShadow: 'none',
            borderRight:
              '1px solid #f0f0f0',
            borderBottom:
              '1px solid #f0f0f0'
          }}
        >
          <Row
            gutter={12}
            align="middle"
            wrap={false}
          >
            {/* SEARCH */}
            <Col flex="280px">
              <Input
                placeholder="Search pest, disease or location..."
                prefix={<SearchOutlined />}
                allowClear
                value={searchText}
                onChange={(e) =>
                  setSearchText(
                    e.target.value
                  )
                }
              />
            </Col>

            {/* TYPE FILTER */}
            <Col flex="180px">
              <Select
                style={{ width: '100%' }}
                value={filters.type}
                onChange={(val) =>
                  setFilters({
                    ...filters,
                    type: val
                  })
                }
              >
                <Option value="All">
                  All Types
                </Option>

                <Option value="Pest">
                  Pest
                </Option>

                <Option value="Disease">
                  Disease
                </Option>

                <Option value="Invasive Weed">
                  Invasive Weed
                </Option>
              </Select>
            </Col>

            {/* SEVERITY */}
            <Col flex="180px">
              <Select
                style={{ width: '100%' }}
                value={filters.severity}
                onChange={(val) =>
                  setFilters({
                    ...filters,
                    severity: val
                  })
                }
              >
                <Option value="All">
                  All Severity
                </Option>

                <Option value="Low">
                  Low
                </Option>

                <Option value="Medium">
                  Medium
                </Option>

                <Option value="High">
                  High
                </Option>

                <Option value="Critical">
                  Critical
                </Option>
              </Select>
            </Col>

            {/* BUTTON */}
            <Col flex="auto">
              <div
                style={{
                  display: 'flex',
                  justifyContent:
                    'flex-end',
                  alignItems: 'center',
                  width: '100%'
                }}
              >
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() =>
                    setFormModalVisible(true)
                  }
                >
                  New Pest Report
                </Button>
              </div>
            </Col>
          </Row>
        </Card>

        {/* TABLE */}
        <Card
          bordered={false}
          style={{
            borderRadius: 0,
            boxShadow: 'none',
            borderRight:
              '1px solid #f0f0f0',
            borderBottom:
              '1px solid #f0f0f0'
          }}
        >
          {filteredReports.length === 0 &&
          !loading ? (
            <Empty description="No surveillance reports found." />
          ) : (
            <Table
              columns={columns}
              dataSource={filteredReports}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 12,
                showSizeChanger: true,

                showTotal: (
                  total,
                  range
                ) =>
                  `${range[0]}-${range[1]} of ${total} reports`
              }}
              scroll={{ x: 1200 }}
            />
          )}
        </Card>
      </div>

      {/* VIEW MODAL */}
      <Modal
        title="Incident Report Details"
        open={modalVisible}
        footer={null}
        centered
        width={850}
        onCancel={() => {
          setModalVisible(false);
          setSelectedReport(null);
        }}
      >
        {selectedReport && (
          <Row gutter={[16, 16]}>

            <Col span={12}>
              <Text strong>
                Incident Type
              </Text>

              <br />

              <Tag color="blue">
                {selectedReport.agent_type}
              </Tag>
            </Col>

            <Col span={12}>
              <Text strong>
                Severity
              </Text>

              <br />

              <Tag
                color={
                  getSeverityConfig(
                    selectedReport.severity_level
                  ).tag
                }
              >
                {
                  selectedReport.severity_level
                }
              </Tag>
            </Col>

            <Col span={24}>
              <Text strong>
                Suspected Name
              </Text>

              <br />

              <Text strong>
                {
                  selectedReport.scientific_or_common_name
                }
              </Text>
            </Col>

            <Col span={24}>
              <Text strong>
                Location
              </Text>

              <br />

              <Tag color="purple">
                {selectedReport.zone?.name}
              </Tag>

              <Tag color="geekblue">
                {selectedReport.woreda?.name}
              </Tag>

              <Tag color="cyan">
                {selectedReport.kebele?.name}
              </Tag>
            </Col>

            <Col span={12}>
              <Text strong>
                Detection Date
              </Text>

              <br />

              {moment(
                selectedReport.detection_date
              ).format('YYYY-MM-DD')}
            </Col>

            <Col span={12}>
              <Text strong>
                Reporter
              </Text>

              <br />

              {selectedReport.reporter_name}
            </Col>

            <Col span={12}>
              <Text strong>
                Infested Area
              </Text>

              <br />

              <Tag color="orange">
                {
                  selectedReport.infested_area_hectares
                }{' '}
                ha
              </Tag>
            </Col>

            <Col span={12}>
              <Text strong>
                Treated Area
              </Text>

              <br />

              <Tag color="green">
                {
                  selectedReport.treated_area_hectares ||
                  0
                }{' '}
                ha
              </Tag>
            </Col>

            <Col span={24}>
              <Text strong>
                Management Methods
              </Text>

              <br />

              {selectedReport.management_methods
                ?.length
                ? selectedReport.management_methods.join(
                    ', '
                  )
                : 'N/A'}
            </Col>

            <Col span={12}>
              <Text strong>
                Chemical Used
              </Text>

              <br />

              {selectedReport.chemical_used_name ||
                'N/A'}
            </Col>

            <Col span={12}>
              <Text strong>
                Emergency Alert
              </Text>

              <br />

              {selectedReport.is_emergency_alert_triggered ? (
                <Tag
                  icon={<AlertOutlined />}
                  color="red"
                >
                  Triggered
                </Tag>
              ) : (
                <Tag
                  icon={
                    <CheckCircleOutlined />
                  }
                  color="green"
                >
                  Normal
                </Tag>
              )}
            </Col>

            <Col span={24}>
              <Text strong>
                Remarks
              </Text>

              <br />

              {selectedReport.remarks ||
                'No remarks'}
            </Col>
          </Row>
        )}
      </Modal>

      {/* CREATE FORM MODAL */}
      <Modal
        title="Create New Pest / Disease / Weed Report"
        open={formModalVisible}
        footer={null}
        centered
        width={950}
        destroyOnClose
        onCancel={() =>
          setFormModalVisible(false)
        }
      >
        <PestReportForm
          zones={zones}
          woredas={woredas}
          kebeles={kebeles}
          parcels={parcels}
          onSuccess={handleReportCreated}
        />
      </Modal>

      {/* GLOBAL STYLES */}
      <style jsx global>{`
        .ant-table-thead > tr > th {
          background: #fafafa !important;
          font-weight: 600 !important;
        }

        .ant-card {
          border-radius: 0 !important;
          border-top: none !important;
          border-left: none !important;
        }

        .ant-modal .ant-modal-content {
          border-radius: 8px;
        }

        .ant-select-selector,
        .ant-input,
        .ant-btn {
          border-radius: 6px !important;
        }
      `}</style>
    </div>
  );
};

export default PestSurveillanceGrid;