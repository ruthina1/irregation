import React, { useState, useEffect, useMemo } from 'react';
import {
  Table, Card, Row, Col, Statistic, Button, Tag, Space,
  Typography, Empty, Tooltip, message
} from 'antd';
import {
  InboxOutlined, DatabaseOutlined, WarningOutlined,
  SendOutlined, PlusOutlined, EyeOutlined, ReloadOutlined
} from '@ant-design/icons';

import agronomyApi from '../../../services/api/agronomyApi';
import BrandedLoader from '../../../components/common/BrandedLoader';
import { EditButton, DeleteButton } from '../../../components/common/ActionButtons';
import { handleApiError } from '../../../utils/errorHandler';

const { Title, Text } = Typography;

const SeedInventory = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await agronomyApi.getSeedInventory();
      setRecords(Array.isArray(res.data) ? res.data : res.data?.data || []);
    } catch (error) {
      handleApiError(error, 'Failed to fetch seed inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const stats = useMemo(() => {
    const available = records.reduce(
      (sum, x) => sum + Number(x.available_quantity || x.balance || 0), 0
    );

    const distributed = records.reduce(
      (sum, x) => sum + Number(x.distributed_quantity || 0), 0
    );

    const lowStock = records.filter(
      x => Number(x.available_quantity || x.balance || 0) <= Number(x.minimum_stock || 0)
    ).length;

    return {
      items: records.length,
      available,
      distributed,
      lowStock
    };
  }, [records]);

  const handleDelete = async id => {
    try {
      await agronomyApi.deleteSeedInventory(id);
      message.success('Inventory record deleted successfully');
      fetchData();
    } catch (error) {
      handleApiError(error, 'Failed to delete inventory record');
    }
  };

  const handleEdit = record => {
    setEditingRecord(record);
    setFormVisible(true);
  };

  const handleAdd = () => {
    setEditingRecord(null);
    setFormVisible(true);
  };

  const columns = [
    {
      title: 'Warehouse',
      dataIndex: 'warehouse_name',
      key: 'warehouse_name',
      render: (v, r) => v || r.warehouse?.name || '-'
    },
    {
      title: 'Seed Lot',
      dataIndex: 'lot_number',
      key: 'lot_number',
      render: (v, r) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            {v || r.seed_lot?.lot_number || '-'}
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {r.variety?.name || r.variety_name || '-'}
          </Text>
        </div>
      )
    },
    {
      title: 'Crop',
      dataIndex: 'crop_type',
      key: 'crop_type',
      render: v => <Tag color="blue">{v || '-'}</Tag>
    },
    {
      title: 'Seed Class',
      dataIndex: 'seed_class',
      key: 'seed_class',
      render: v => v || '-'
    },
    {
      title: 'Opening',
      dataIndex: 'opening_quantity',
      key: 'opening_quantity',
      render: v => `${Number(v || 0).toLocaleString()} kg`
    },
    {
      title: 'Available',
      dataIndex: 'available_quantity',
      key: 'available_quantity',
      render: (v, r) => {
        const value = Number(v ?? r.balance ?? 0);
        const minimum = Number(r.minimum_stock || 0);

        return (
          <Tag color={minimum && value <= minimum ? 'warning' : 'success'}>
            {value.toLocaleString()} kg
          </Tag>
        );
      }
    },
    {
      title: 'Certification',
      dataIndex: 'certification_status',
      key: 'certification_status',
      render: v => (
        <Tag color={v === 'certified' ? 'success' : 'default'}>
          {v || 'Not Certified'}
        </Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: v => <Tag>{v || 'Available'}</Tag>
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View">
            <Button size="small" icon={<EyeOutlined />} />
          </Tooltip>
          <Tooltip title="Edit">
            <EditButton onClick={() => handleEdit(record)} />
          </Tooltip>
          <DeleteButton
            itemName={`Inventory ${record.lot_number || ''}`}
            onConfirm={() => handleDelete(record.id)}
          />
        </Space>
      )
    }
  ];

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#fff' }}>
      {loading && <BrandedLoader message="Loading Seed Inventory..." />}

      <div style={{ padding: 16, marginBottom: 16, borderBottom: '1px solid #f0f0f0' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              📦 Seed Inventory Management
            </Title>
            <Text type="secondary">
              Manage seed stock, warehouses, lots, balances, and inventory movements
            </Text>
          </Col>
          <Col>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={fetchData}>
                Refresh
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                Add Inventory
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      <div style={{ padding: '0 16px 16px' }}>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          {[
            ['Stock Items', stats.items, DatabaseOutlined],
            ['Available Stock', stats.available, InboxOutlined],
            ['Distributed', stats.distributed, SendOutlined],
            ['Low Stock', stats.lowStock, WarningOutlined]
          ].map(([title, value, Icon], i) => (
            <Col xs={24} sm={12} lg={6} key={title}>
              <Card bordered={false} style={{
                borderRight: '1px solid #f0f0f0',
                borderBottom: `3px solid ${['#52c41a','#1890ff','#fa8c16','#722ed1'][i]}`,
                borderRadius: 0,
                height: '100%',
                boxShadow: 'none'
              }}>
                <Statistic title={title} value={value}
                  prefix={<Icon style={{ color: ['#52c41a','#1890ff','#fa8c16','#722ed1'][i] }} />}
                  suffix={i === 1 || i === 2 ? 'kg' : ''}
                />
              </Card>
            </Col>
          ))}
        </Row>

        <Card bordered={false} style={{
          borderRadius: 0,
          boxShadow: 'none',
          borderBottom: '1px solid #f0f0f0'
        }}>
          {records.length === 0 && !loading ? (
            <Empty description="No seed inventory records found." />
          ) : (
            <Table
              columns={columns}
              dataSource={records}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10, showSizeChanger: true }}
              scroll={{ x: 1200 }}
            />
          )}
        </Card>
      </div>

      {/* Connect your SeedInventoryForm here */}
    </div>
  );
};

export default SeedInventory;