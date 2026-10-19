import React, { useState, useEffect, useMemo } from 'react';

import {
  Tabs,
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Button,
  Form,
  Input,
  Select,
  Switch,
  Space,
  Tag,
  message,
  Modal,
  Tooltip,
  Typography,
  Empty,
  notification
} from 'antd';

import {
  PlusOutlined,
  SearchOutlined,
  EnvironmentOutlined,
  ApartmentOutlined,
  AppstoreOutlined,
  EyeOutlined,
  EditOutlined,
  AlertOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons';

import {
  MapPin,
  Landmark,
  Layers
} from 'lucide-react';

import { locationApi } from '../../services/api/locationApi';

import {
  EditButton,
  DeleteButton
} from './ActionButtons';

import BrandedLoader from './BrandedLoader';

import LocationDetailModal from './LocationDetailModal';

const { Title, Text } = Typography;
const { Option } = Select;

const CARD_STYLE_GREEN = {
  borderRight: '1px solid #f0f0f0',
  borderBottom: '3px solid #52c41a',
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

export default function LocationManagement() {

  // =========================
  // STATE
  // =========================
  const [activeTab, setActiveTab] =
    useState('1');

  const [zones, setZones] = useState([]);
  const [woredas, setWoredas] =
    useState([]);

  const [kebeles, setKebeles] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [searchText, setSearchText] =
    useState('');

  const [selectedZoneFilter,
    setSelectedZoneFilter] =
    useState(null);

  const [selectedWoredaFilter,
    setSelectedWoredaFilter] =
    useState(null);

  const [isModalVisible,
    setIsModalVisible] =
    useState(false);

  const [isDetailVisible,
    setIsDetailVisible] =
    useState(false);

  const [modalTarget,
    setModalTarget] =
    useState('');

  const [editingItem,
    setEditingItem] =
    useState(null);

  const [detailItem,
    setDetailItem] =
    useState(null);

  const [detailTarget,
    setDetailTarget] =
    useState('');

  const [drafts, setDrafts] =
    useState({
      zone: {},
      woreda: {},
      kebele: {}
    });

  const [form] = Form.useForm();

  // =========================
  // INITIAL LOAD
  // =========================
  useEffect(() => {
    const init = async () => {
      setLoading(true);

      try {
        const [z, w, k] =
          await Promise.all([
            locationApi.getZones(),
            locationApi.getWoredas(),
            locationApi.getKebeles()
          ]);

        setZones(z.data || []);
        setWoredas(w.data || []);
        setKebeles(k.data || []);
      } catch (err) {
        notification.error({
          message: 'Failed to Load',
          description:
            'Unable to load administrative data.'
        });
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  // =========================
  // REFRESH DATA
  // =========================
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      try {

        if (activeTab === '1') {
          const res =
            await locationApi.getZones();

          setZones(res.data || []);
        }

        if (activeTab === '2') {
          const res =
            await locationApi.getWoredas(
              selectedZoneFilter
            );

          setWoredas(res.data || []);
        }

        if (activeTab === '3') {
          const res =
            await locationApi.getKebeles(
              selectedWoredaFilter
            );

          setKebeles(res.data || []);
        }

      } catch (err) {
        message.error(
          'Failed to refresh data'
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();

  }, [
    activeTab,
    selectedZoneFilter,
    selectedWoredaFilter
  ]);

  // =========================
  // FILTERED DATA
  // =========================
  const filteredZones = useMemo(() => {
    return zones.filter((item) =>
      item.name
        ?.toLowerCase()
        .includes(
          searchText.toLowerCase()
        )
    );
  }, [zones, searchText]);

  const filteredWoredas = useMemo(() => {
    return woredas.filter((item) =>
      item.name
        ?.toLowerCase()
        .includes(
          searchText.toLowerCase()
        )
    );
  }, [woredas, searchText]);

  const filteredKebeles = useMemo(() => {
    return kebeles.filter((item) =>
      item.name
        ?.toLowerCase()
        .includes(
          searchText.toLowerCase()
        )
    );
  }, [kebeles, searchText]);

  // =========================
  // ACTIONS
  // =========================
  const showModal = (
    target,
    item = null
  ) => {

    setModalTarget(target);
    setEditingItem(item);

    setIsModalVisible(true);

    if (item) {
      form.setFieldsValue(item);
    } else {
      form.setFieldsValue(
        drafts[target] || {}
      );
    }
  };

  const handleModalCancel = () => {

    if (
      modalTarget &&
      !editingItem
    ) {
      setDrafts((prev) => ({
        ...prev,
        [modalTarget]:
          form.getFieldsValue()
      }));
    }

    setIsModalVisible(false);

    setEditingItem(null);

    form.resetFields();
  };

  const handleFormSubmit =
    async () => {

      try {

        const values =
          await form.validateFields();

        setSubmitting(true);

        let res;

        if (modalTarget === 'zone') {

          res = editingItem
            ? await locationApi.updateZone(
                editingItem.id,
                values
              )
            : await locationApi.createZone(
                values
              );
        }

        if (
          modalTarget === 'woreda'
        ) {

          res = editingItem
            ? await locationApi.updateWoreda(
                editingItem.id,
                values
              )
            : await locationApi.createWoreda(
                values
              );
        }

        if (
          modalTarget === 'kebele'
        ) {

          res = editingItem
            ? await locationApi.updateKebele(
                editingItem.id,
                values
              )
            : await locationApi.createKebele(
                values
              );
        }

        message.success(
          res?.data?.message ||
            'Operation successful'
        );

        handleModalCancel();

      } catch (err) {
        message.error(
          'Submission failed'
        );
      } finally {
        setSubmitting(false);
      }
    };

  const handleDelete =
    async (target, id) => {

      try {

        if (target === 'zone') {
          await locationApi.deleteZone(
            id
          );
        }

        if (target === 'woreda') {
          await locationApi.deleteWoreda(
            id
          );
        }

        if (target === 'kebele') {
          await locationApi.deleteKebele(
            id
          );
        }

        message.success(
          'Record deleted successfully'
        );

        window.location.reload();

      } catch (err) {
        message.error(
          'Failed to delete record'
        );
      }
    };

  const showDetail = (
    item,
    target
  ) => {

    setDetailItem(item);

    setDetailTarget(target);

    setIsDetailVisible(true);
  };

  // =========================
  // ACTION BUTTONS
  // =========================
  const renderActions = (
    record,
    target
  ) => (
    <Space size="small">

      <Tooltip title="View Details">
        <Button
          size="small"
          icon={<EyeOutlined />}
          onClick={() =>
            showDetail(
              record,
              target
            )
          }
        />
      </Tooltip>

      <Tooltip title="Edit">
        <EditButton
          onClick={() =>
            showModal(
              target,
              record
            )
          }
        />
      </Tooltip>

      <DeleteButton
        itemName={record.name}
        onConfirm={() =>
          handleDelete(
            target,
            record.id
          )
        }
      />
    </Space>
  );

  // =========================
  // TABLE COLUMNS
  // =========================
  const zoneColumns = [
    {
      title: 'Zone Name',
      dataIndex: 'name',
      key: 'name',

      render: (text) => (
        <Text strong>
          {text}
        </Text>
      )
    },

    {
      title: 'Woredas',
      dataIndex: 'woredas_count',

      render: (count) => (
        <Tag color="blue">
          {count || 0}
        </Tag>
      )
    },

    {
      title: 'Actions',
      key: 'actions',
      width: 160,

      render: (_, record) =>
        renderActions(
          record,
          'zone'
        )
    }
  ];

  const woredaColumns = [
    {
      title: 'Woreda Name',
      dataIndex: 'name',

      render: (text) => (
        <Text strong>
          {text}
        </Text>
      )
    },

    {
      title: 'Parent Zone',
      dataIndex: ['zone', 'name']
    },

    {
      title: 'Food Security',
      dataIndex:
        'is_food_insecure',

      render: (value) =>
        value ? (
          <Tag
            icon={<AlertOutlined />}
            color="red"
          >
            PSNP
          </Tag>
        ) : (
          <Tag
            icon={
              <SafetyCertificateOutlined />
            }
            color="green"
          >
            Secure
          </Tag>
        )
    },

    {
      title: 'Actions',
      key: 'actions',
      width: 160,

      render: (_, record) =>
        renderActions(
          record,
          'woreda'
        )
    }
  ];

  const kebeleColumns = [
    {
      title: 'Kebele Name',
      dataIndex: 'name',

      render: (text) => (
        <Text strong>
          {text}
        </Text>
      )
    },

    {
      title: 'Woreda',
      dataIndex: ['woreda', 'name']
    },

    {
      title: 'Arable Land',

      dataIndex:
        'arable_land_area_ha',

      render: (value) => (
        <Tag color="green">
          {value
            ? Number(
                value
              ).toLocaleString()
            : 0}{' '}
          ha
        </Tag>
      )
    },

    {
      title: 'Ecology',

      render: (_, record) => (
        <div>
          <Text strong>
            {record.ecology_type ||
              'N/A'}
          </Text>

          <br />

          <Text type="secondary">
            {record.elevation_meters
              ? `${record.elevation_meters}m`
              : ''}
          </Text>
        </div>
      )
    },

    {
      title: 'Actions',
      key: 'actions',
      width: 160,

      render: (_, record) =>
        renderActions(
          record,
          'kebele'
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
        <BrandedLoader message="Loading Administrative Locations..." />
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
              style={{
                marginBottom: 0
              }}
            >
              Administrative Hierarchy Management
            </Title>

            <Text type="secondary">
              Manage zones, woredas and
              kebeles with agro-ecological
              information
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
          <Col xs={24} sm={12} lg={8}>
            <Card
              bordered={false}
              style={CARD_STYLE_GREEN}
            >
              <Statistic
                title="Registered Zones"
                value={zones.length}
                prefix={
                  <EnvironmentOutlined
                    style={{
                      color: '#52c41a'
                    }}
                  />
                }
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <Card
              bordered={false}
              style={CARD_STYLE_BLUE}
            >
              <Statistic
                title="Active Woredas"
                value={woredas.length}
                prefix={
                  <ApartmentOutlined
                    style={{
                      color: '#1890ff'
                    }}
                  />
                }
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <Card
              bordered={false}
              style={CARD_STYLE_ORANGE}
            >
              <Statistic
                title="Mapped Kebeles"
                value={kebeles.length}
                prefix={
                  <AppstoreOutlined
                    style={{
                      color: '#fa8c16'
                    }}
                  />
                }
              />
            </Card>
          </Col>
        </Row>

        {/* MAIN CARD */}
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

          {/* TOOLBAR */}
          <Row
            gutter={12}
            align="middle"
            style={{
              marginBottom: 16
            }}
          >
            <Col flex="280px">
              <Input
                placeholder="Search administrative area..."
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

            {activeTab === '2' && (
              <Col flex="220px">
                <Select
                  allowClear
                  style={{
                    width: '100%'
                  }}
                  placeholder="Filter by Zone"
                  value={
                    selectedZoneFilter
                  }
                  onChange={
                    setSelectedZoneFilter
                  }
                >
                  {zones.map((z) => (
                    <Option
                      key={z.id}
                      value={z.id}
                    >
                      {z.name}
                    </Option>
                  ))}
                </Select>
              </Col>
            )}

            {activeTab === '3' && (
              <>
                <Col flex="220px">
                  <Select
                    allowClear
                    style={{
                      width: '100%'
                    }}
                    placeholder="Filter by Zone"
                    onChange={(id) => {
                      setSelectedWoredaFilter(
                        null
                      );
                    }}
                  >
                    {zones.map((z) => (
                      <Option
                        key={z.id}
                        value={z.id}
                      >
                        {z.name}
                      </Option>
                    ))}
                  </Select>
                </Col>

                <Col flex="220px">
                  <Select
                    allowClear
                    style={{
                      width: '100%'
                    }}
                    placeholder="Filter by Woreda"
                    value={
                      selectedWoredaFilter
                    }
                    onChange={
                      setSelectedWoredaFilter
                    }
                  >
                    {woredas.map((w) => (
                      <Option
                        key={w.id}
                        value={w.id}
                      >
                        {w.name}
                      </Option>
                    ))}
                  </Select>
                </Col>
              </>
            )}

            <Col flex="auto">
              <div
                style={{
                  display: 'flex',
                  justifyContent:
                    'flex-end'
                }}
              >
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() =>
                    showModal(
                      activeTab === '1'
                        ? 'zone'
                        : activeTab === '2'
                        ? 'woreda'
                        : 'kebele'
                    )
                  }
                >
                  Add New
                </Button>
              </div>
            </Col>
          </Row>

          {/* TABS */}
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
          >

            {/* ZONES */}
            <Tabs.TabPane
              tab="Zones"
              key="1"
            >
              {filteredZones.length ===
                0 && !loading ? (
                <Empty description="No zones found." />
              ) : (
                <Table
                  dataSource={
                    filteredZones
                  }
                  columns={zoneColumns}
                  rowKey="id"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true
                  }}
                />
              )}
            </Tabs.TabPane>

            {/* WOREDAS */}
            <Tabs.TabPane
              tab="Woredas"
              key="2"
            >
              {filteredWoredas.length ===
                0 && !loading ? (
                <Empty description="No woredas found." />
              ) : (
                <Table
                  dataSource={
                    filteredWoredas
                  }
                  columns={woredaColumns}
                  rowKey="id"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true
                  }}
                />
              )}
            </Tabs.TabPane>

            {/* KEBELES */}
            <Tabs.TabPane
              tab="Kebeles"
              key="3"
            >
              {filteredKebeles.length ===
                0 && !loading ? (
                <Empty description="No kebeles found." />
              ) : (
                <Table
                  dataSource={
                    filteredKebeles
                  }
                  columns={kebeleColumns}
                  rowKey="id"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true
                  }}
                  scroll={{ x: 1200 }}
                />
              )}
            </Tabs.TabPane>

          </Tabs>
        </Card>
      </div>

      {/* DETAIL MODAL */}
      <LocationDetailModal
        open={isDetailVisible}
        onCancel={() =>
          setIsDetailVisible(false)
        }
        item={detailItem}
        target={detailTarget}
      />

      {/* FORM MODAL */}
      <Modal
        title={
          editingItem
            ? `Edit ${
                modalTarget
                  ?.charAt(0)
                  .toUpperCase() +
                modalTarget?.slice(1)
              }`
            : `Create ${
                modalTarget
                  ?.charAt(0)
                  .toUpperCase() +
                modalTarget?.slice(1)
              }`
        }
        open={isModalVisible}
        onOk={handleFormSubmit}
        onCancel={handleModalCancel}
        confirmLoading={submitting}
        okText={
          editingItem
            ? 'Save Changes'
            : 'Create Record'
        }
        centered
        width={
          modalTarget === 'kebele'
            ? 700
            : 500
        }
      >

        <Form
          form={form}
          layout="vertical"
          style={{
            marginTop: 16
          }}
        >

          {modalTarget ===
            'woreda' && (
            <Form.Item
              name="zone_id"
              label="Parent Zone"
              rules={[
                {
                  required: true
                }
              ]}
            >
              <Select placeholder="Select Zone">
                {zones.map((z) => (
                  <Option
                    key={z.id}
                    value={z.id}
                  >
                    {z.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

          {modalTarget ===
            'kebele' && (
            <Form.Item
              name="woreda_id"
              label="Parent Woreda"
              rules={[
                {
                  required: true
                }
              ]}
            >
              <Select
                placeholder="Select Woreda"
                showSearch
              >
                {woredas.map((w) => (
                  <Option
                    key={w.id}
                    value={w.id}
                  >
                    {w.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <Form.Item
            name="name"
            label="Location Name"
            rules={[
              {
                required: true
              }
            ]}
          >
            <Input placeholder="Enter location name" />
          </Form.Item>

          {modalTarget ===
            'kebele' && (
            <Row gutter={16}>

              <Col span={12}>
                <Form.Item
                  name="total_area_ha"
                  label="Total Area (Ha)"
                >
                  <Input
                    type="number"
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  name="arable_land_area_ha"
                  label="Arable Land (Ha)"
                >
                  <Input
                    type="number"
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  name="ecology_type"
                  label="Ecology Type"
                >
                  <Select placeholder="Select Ecology">
                    <Option value="Dega">
                      Dega
                    </Option>

                    <Option value="Weina Dega">
                      Weina Dega
                    </Option>

                    <Option value="Kolla">
                      Kolla
                    </Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  name="elevation_meters"
                  label="Elevation (m)"
                >
                  <Input
                    type="number"
                  />
                </Form.Item>
              </Col>

            </Row>
          )}

          {modalTarget ===
            'woreda' && (
            <Form.Item
              name="is_food_insecure"
              valuePropName="checked"
              label="Food Security Status"
            >
              <Switch
                checkedChildren="PSNP"
                unCheckedChildren="Secure"
              />
            </Form.Item>
          )}

        </Form>
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

        .ant-tabs-tab.ant-tabs-tab-active
          .ant-tabs-tab-btn {
          color: #1677ff !important;
          font-weight: 600;
        }

        .ant-tabs-ink-bar {
          background: #1677ff !important;
        }
      `}</style>
    </div>
  );
}