import React, { useState, useEffect, useCallback } from "react";
import {
  Form, Input, Button, Card, Table, Typography, Spin, Space, Collapse, Select, message, InputNumber, Row, Col, Divider, Tag, Tooltip, Popconfirm
} from "antd";
import { PlusOutlined, MinusOutlined, SearchOutlined, AuditOutlined, DeleteOutlined, EditOutlined, SaveOutlined, CloseOutlined } from "@ant-design/icons";
import { meraApi } from "../../services/api/meraApi";
import CommonApprovalModal from "../../components/common/CommonApprovalModal";
import BrandedLoader from "../../components/common/BrandedLoader";
import { handleApiError } from "../../utils/errorHandler";
import { debounce } from "lodash";

const { Title, Text } = Typography;
const { Panel } = Collapse;
const { Option } = Select;

// ─── NEW: INLINE EDITABLE METRIC TABLE COMPONENT ───
const InlineMetricTable = ({ metrics, fetchStrategicPlans }) => {
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const isEditing = (record) => record.id === editingId;

  const edit = (record) => {
    form.setFieldsValue({ ...record });
    setEditingId(record.id);
  };

  const cancel = () => {
    setEditingId(null);
    form.resetFields();
  };

  const save = async (id) => {
    setSaving(true);
    try {
      const row = await form.validateFields();
      await meraApi.updatePlanMetric(id, row);
      message.success("Achievement logged successfully!");
      setEditingId(null);
      fetchStrategicPlans(); // Refresh the global table to show updated data
    } catch (err) {
      message.error("Failed to save achievement.");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      title: "Annual Plan",
      dataIndex: "annual_plan",
      render: (val, record) => isEditing(record) ? (
        <Form.Item name="annual_plan" style={{ margin: 0 }}><InputNumber size="small" style={{ width: 80 }} /></Form.Item>
      ) : (val ?? '-'),
    },
    {
      title: "This Q Plan",
      dataIndex: "plan_this_quarter",
      render: (val, record) => isEditing(record) ? (
        <Form.Item name="plan_this_quarter" style={{ margin: 0 }}><InputNumber size="small" style={{ width: 80 }} /></Form.Item>
      ) : (val ?? '-'),
    },
    {
      title: "Up to Q Plan",
      dataIndex: "plan_up_to_this_quarter",
      render: (val, record) => isEditing(record) ? (
        <Form.Item name="plan_up_to_this_quarter" style={{ margin: 0 }}><InputNumber size="small" style={{ width: 80 }} /></Form.Item>
      ) : (val ?? '-'),
    },
    {
      title: "This Q Ach.",
      dataIndex: "achievement_this_quarter",
      render: (val, record) => isEditing(record) ? (
        <Form.Item name="achievement_this_quarter" style={{ margin: 0 }}><InputNumber size="small" style={{ width: 80, borderColor: '#1890ff' }} /></Form.Item>
      ) : <strong style={{ color: '#1890ff' }}>{val ?? '-'}</strong>,
    },
    {
      title: "Up to Q Ach.",
      dataIndex: "achievement_up_to_this_quarter",
      render: (val, record) => isEditing(record) ? (
        <Form.Item name="achievement_up_to_this_quarter" style={{ margin: 0 }}><InputNumber size="small" style={{ width: 80, borderColor: '#52c41a' }} /></Form.Item>
      ) : <strong style={{ color: '#52c41a' }}>{val ?? '-'}</strong>,
    },
    {
      title: "This Q Perf (%)",
      dataIndex: "performance_this_quarter",
      render: (val, record) => isEditing(record) ? (
        <Form.Item name="performance_this_quarter" style={{ margin: 0 }}><InputNumber size="small" max={100} style={{ width: 70 }} /></Form.Item>
      ) : (val ? <Tag color="blue">{val}%</Tag> : '-'),
    },
    {
      title: "Up to Q Perf (%)",
      dataIndex: "performance_up_to_this_quarter",
      render: (val, record) => isEditing(record) ? (
        <Form.Item name="performance_up_to_this_quarter" style={{ margin: 0 }}><InputNumber size="small" max={100} style={{ width: 70 }} /></Form.Item>
      ) : (val ? <Tag color="green">{val}%</Tag> : '-'),
    },
    {
      title: "Action",
      key: "action",
      width: 120,
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <Space size="small">
            <Button type="primary" size="small" icon={<SaveOutlined />} onClick={() => save(record.id)} loading={saving} />
            <Button size="small" icon={<CloseOutlined />} onClick={cancel} />
          </Space>
        ) : (
          <Button size="small" type="dashed" icon={<EditOutlined />} onClick={() => edit(record)}>
            Log
          </Button>
        );
      },
    },
  ];

  return (
    <Form form={form} component={false}>
      <Table
        dataSource={metrics || []}
        columns={columns}
        rowKey="id"
        pagination={false}
        size="small"
        bordered
        style={{ background: '#fff' }}
      />
    </Form>
  );
};
// ──────────────────────────────────────────────────────────

const StrategicPlan = () => {
  const [form] = Form.useForm();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filters, setFilters] = useState({ title: "" });
  
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [approvingPlan, setApprovingPlan] = useState(null);

  const years = Array.from({ length: 10 }, (_, i) => 2020 + i);

  const fetchStrategicPlans = useCallback(async (currentFilters = filters) => {
    setLoading(true);
    try {
      const params = { ...(currentFilters.title && { title: currentFilters.title }) };
      const { data } = await meraApi.getStrategicPlans(params);
      setPlans(data.data.data || []);
    } catch (err) {
      handleApiError(err, "Failed to load plans");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const debouncedFetch = useCallback(debounce((f) => fetchStrategicPlans(f), 500), [fetchStrategicPlans]);

  useEffect(() => {
    fetchStrategicPlans();
    return () => debouncedFetch.cancel();
  }, []);

  const handleFilter = (key, val) => {
    setFilters((prev) => ({ ...prev, [key]: val || "" }));
    debouncedFetch({ ...filters, [key]: val || "" });
  };

  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      const payload = {
        title: values.title,
        sector: values.sector,
        year: values.year,
        tasks: (values.tasks || []).map((t) => ({
          title: t.title,
          sub_tasks: (t.sub_tasks || []).map((st) => ({
            detail: st.detail,
            indicators: (st.indicators || []).map((ind) => ({
              name: ind.name,
              unit: ind.unit,
              indicator_metrics: ind.indicator_metrics || [{}]
            })),
          })),
        })),
      };

      await meraApi.createStrategicPlan(payload);
      message.success("Strategic Plan created successfully");
      form.resetFields();
      fetchStrategicPlans();
    } catch (err) {
      handleApiError(err, "Failed to save plan");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await meraApi.deleteStrategicPlan(id);
      message.success("Plan deleted successfully");
      fetchStrategicPlans();
    } catch (err) {
      handleApiError(err);
    }
  };

  const handleApprovalSubmit = async (id, values) => {
    setSubmitting(true);
    try {
      await meraApi.approveStrategicPlan(id, values);
      message.success("Plan verification saved");
      setIsApprovalModalOpen(false);
      fetchStrategicPlans();
    } catch (err) {
      handleApiError(err);
    } finally {
      setSubmitting(false);
    }
  };

  // EXPANDED ROW FOR NESTED DATA
  const expandedRowRender = (plan) => (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
      <Collapse accordion className="bg-white rounded-lg">
        {(plan.tasks || []).map((task, idx) => (
          <Panel header={<strong className="text-blue-600">{idx + 1}. {task.title}</strong>} key={task.id}>
            <Collapse accordion>
              {(task.sub_tasks || []).map((sub) => (
                <Panel header={<span className="text-green-600">{sub.detail}</span>} key={sub.id}>
                  <Table
                    dataSource={sub.indicators || []}
                    pagination={false}
                    rowKey="id"
                    size="small"
                    columns={[
                      { title: "Indicator", dataIndex: "name", width: 200 },
                      { title: "Unit", dataIndex: "unit", width: 100 },
                    ]}
                    expandable={{
                      // RENDER THE NEW INLINE EDITABLE TABLE HERE
                      expandedRowRender: (ind) => (
                        <div style={{ background: '#fafafa', padding: '10px 16px', borderRadius: 6 }}>
                          <Text strong style={{ color: '#fa8c16', display: 'block', marginBottom: 8 }}>Log Achievements for {ind.name}</Text>
                          <InlineMetricTable metrics={ind.metrics} fetchStrategicPlans={fetchStrategicPlans} />
                        </div>
                      ),
                      rowExpandable: () => true,
                      defaultExpandAllRows: true, // Auto open metrics for easy logging
                    }}
                  />
                </Panel>
              ))}
            </Collapse>
          </Panel>
        ))}
      </Collapse>
    </div>
  );

  const columns = [
    { title: "Goal Title", dataIndex: "title", key: "title", width: 250 },
    { title: "Directorate", dataIndex: "sector", key: "sector" },
    { title: "Year", dataIndex: "year", key: "year" },
    {
      title: 'Approval Status', 
      dataIndex: 'status', 
      key: 'status',
      align: 'center',
      render: (status) => {
        let color = 'orange'; 
        if (status === 'Approved') color = 'green';
        if (status === 'Rejected') color = 'red';
        return <Tag color={color}>{status || 'Pending'}</Tag>;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Verify Strategic Plan">
            <Button 
              type="text" 
              icon={<AuditOutlined style={{ color: '#fa8c16' }} />} 
              onClick={() => { setApprovingPlan(record); setIsApprovalModalOpen(true); }} 
            />
          </Tooltip>
          <Popconfirm title="Delete this plan?" onConfirm={() => handleDelete(record.id)}>
            <Button danger type="text" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: "24px", minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
      {(loading || submitting) && <BrandedLoader message="Processing..." />}

      <Title level={3} style={{ marginBottom: 24, color: '#1a5f2c', fontFamily: "'Times New Roman', Times, serif" }}>
        MERA: Strategic Planning & Monitoring
      </Title>

      {/* CREATE FORM */}
      <Card style={{ marginBottom: 24, borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Title level={4} style={{ color: "#1E9173", margin: 0 }}>Register New Strategic Plan</Title>
        </div>
        
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="title" label="Goal Title" rules={[{ required: true }]}>
                <Input placeholder="Enter Goal Title" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="sector" label="Directorate" rules={[{ required: true }]}>
                <Select placeholder="Select Directorate">
                  <Option value="NaturalResource">Natural Resource</Option>
                  <Option value="Horticulture">Horticulture</Option>
                  <Option value="Input">Input</Option>
                  <Option value="Crop">Crop</Option>
                  <Option value="Extension">Extension</Option>
                  <Option value="Nutrition">Nutrition</Option>
                  <Option value="Plan">Plan</Option>
                  <Option value="InfrastructureMonitoring">Infrastructure and Monitoring</Option>
                  <Option value="Food">Education</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="year" label="Year" rules={[{ required: true }]}>
                <Select placeholder="Select Year">
                  {years.map((y) => <Option key={y} value={y}>{y}</Option>)}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* DYNAMIC TASKS BUILDER */}
          <Form.List name="tasks">
            {(taskFields, { add: addTask, remove: removeTask }) => (
              <div>
                {taskFields.map(({ key: tk, name: tn, ...tr }) => (
                  <Card key={tk} style={{ marginBottom: 16, background: '#fafafa', border: '1px solid #d9d9d9' }} size="small">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Form.Item {...tr} name={[tn, "title"]} label={<span style={{fontWeight:'bold'}}>Main Task Title</span>} rules={[{ required: true }]} style={{ width: '80%' }}>
                        <Input placeholder="E.g. Increase Crop Yield" />
                      </Form.Item>
                      <Button danger type="dashed" icon={<MinusOutlined />} onClick={() => removeTask(tn)}>Remove Task</Button>
                    </div>

                    <Form.List name={[tn, "sub_tasks"]}>
                      {(subFields, { add: addSub, remove: removeSub }) => (
                        <div style={{ paddingLeft: 24 }}>
                          {subFields.map(({ key: sk, name: sn, ...sr }) => (
                            <Card key={sk} style={{ marginBottom: 16, border: '1px solid #e8e8e8' }} size="small">
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Form.Item {...sr} name={[sn, "detail"]} label={<span style={{color:'#52c41a'}}>Sub Task Detail</span>} rules={[{ required: true }]} style={{ width: '80%' }}>
                                  <Input placeholder="E.g. Distribute fertilizer to 500 farmers" />
                                </Form.Item>
                                <Button danger type="text" icon={<MinusOutlined />} onClick={() => removeSub(sn)}>Remove Sub Task</Button>
                              </div>

                              <Form.List name={[sn, "indicators"]}>
                                {(indFields, { add: addInd, remove: removeInd }) => (
                                  <div style={{ paddingLeft: 24 }}>
                                    {indFields.map(({ key: ik, name: iname, ...ir }) => (
                                      <div key={ik} style={{ background: '#fff', padding: '16px', borderRadius: '8px', border: '1px dashed #d9d9d9', marginBottom: '16px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                          <Space size="large" style={{ width: '90%' }}>
                                            <Form.Item {...ir} name={[iname, "name"]} label="Indicator Name" rules={[{ required: true }]} style={{ width: 300 }}>
                                              <Input placeholder="E.g. Farmers Reached" />
                                            </Form.Item>
                                            <Form.Item {...ir} name={[iname, "unit"]} label="Unit" rules={[{ required: true }]} style={{ width: 150 }}>
                                              <Input placeholder="E.g. Number, Ha, %" />
                                            </Form.Item>
                                          </Space>
                                          <Button danger type="text" icon={<MinusOutlined />} onClick={() => removeInd(iname)} />
                                        </div>

                                        {/* Initial Targets (Achievements logged later in table) */}
                                        <div style={{ background: '#f5f8fa', padding: '12px 16px', borderRadius: '6px', border: '1px solid #e6f4ff' }}>
                                          <Text strong style={{ fontSize: '12px', color: '#1677ff', display: 'block', marginBottom: 12 }}>
                                            SET INITIAL TARGETS
                                          </Text>
                                          <Row gutter={16}>
                                            <Col span={8}>
                                              <Form.Item name={[iname, "indicator_metrics", 0, "annual_plan"]} label="Annual Plan">
                                                <InputNumber style={{width:'100%'}} placeholder="Total year target" />
                                              </Form.Item>
                                            </Col>
                                            <Col span={8}>
                                              <Form.Item name={[iname, "indicator_metrics", 0, "plan_this_quarter"]} label="This Q Plan">
                                                <InputNumber style={{width:'100%'}} placeholder="Current quarter target" />
                                              </Form.Item>
                                            </Col>
                                            <Col span={8}>
                                              <Form.Item name={[iname, "indicator_metrics", 0, "plan_up_to_this_quarter"]} label="Up to Q Plan">
                                                <InputNumber style={{width:'100%'}} placeholder="Cumulative target" />
                                              </Form.Item>
                                            </Col>
                                          </Row>
                                        </div>
                                      </div>
                                    ))}
                                    <Button type="dashed" onClick={() => addInd({ indicator_metrics: [{}] })} block>+ Add Indicator & Targets</Button>
                                  </div>
                                )}
                              </Form.List>
                            </Card>
                          ))}
                          <Button type="dashed" onClick={() => addSub()} block>+ Add Sub Task</Button>
                        </div>
                      )}
                    </Form.List>
                  </Card>
                ))}
                <Button type="primary" ghost icon={<PlusOutlined />} onClick={() => addTask()} block>Add Main Task</Button>
              </div>
            )}
          </Form.List>

          <Button type="primary" htmlType="submit" size="large" icon={<SaveOutlined />} style={{ marginTop: 24, width: '100%', background: '#1E9173' }}>
            Submit New Strategic Plan
          </Button>
        </Form>
      </Card>

      {/* TABLE VIEW */}
      <Card style={{ borderRadius: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Title level={4}>Submitted Plans & Monitoring</Title>
          <Input placeholder="Search by title..." value={filters.title} onChange={e => handleFilter('title', e.target.value)} style={{ width: 250 }} prefix={<SearchOutlined />} />
        </div>
        <Table
          columns={columns}
          dataSource={plans}
          rowKey="id"
          expandable={{ expandedRowRender }}
          pagination={{ pageSize: 10 }}
          bordered
        />
      </Card>

      {/* APPROVAL MODAL */}
      <CommonApprovalModal
        open={isApprovalModalOpen}
        onCancel={() => setIsApprovalModalOpen(false)}
        onSubmit={handleApprovalSubmit}
        isSubmitting={submitting}
        title={`Verify Strategic Plan: ${approvingPlan?.title || ''}`}
        itemName={approvingPlan?.title}
        entityId={approvingPlan?.id}
        initialStatus={approvingPlan?.status}
        initialRemarks={approvingPlan?.approval?.remarks}
      />
    </div>
  );
};

export default StrategicPlan;