import React, { useEffect, useMemo, useState } from 'react';
import { Card, Input, Select, Space, Table, Tag, Typography, Button } from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  EditOutlined
} from '@ant-design/icons';

import horticultureApi from '../../../services/api/horticultureApi';
import { handleApiError } from '../../../utils/errorHandler';
import BrandedLoader from '../../../components/common/BrandedLoader';

const { Title, Text } = Typography;

export default function SpiceHerb() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [registration, setRegistration] = useState('All');

  const fetchSpiceHerbs = async () => {
    setLoading(true);

    try {
      const res = await horticultureApi.getFarms();

      setRecords(
        (Array.isArray(res.data) ? res.data : []).filter(
          item =>
            String(item.production_type || '').toLowerCase() ===
            'spice_herb'
        )
      );
    } catch (error) {
      handleApiError(
        error,
        'Failed to fetch spice and herb production records'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpiceHerbs();
  }, []);

  const filteredRecords = useMemo(() => {
    const query = search.toLowerCase().trim();

    return records.filter(item => {
      const matchesSearch =
        !query ||
        [
          item.farm_name,
          item.farmer_name,
          item.crop_name,
          item.variety,
          item.region,
          item.zone,
          item.woreda,
          item.kebele
        ].some(value =>
          String(value || '').toLowerCase().includes(query)
        );

      return (
        matchesSearch &&
        (status === 'All' || item.farm_status === status) &&
        (registration === 'All' ||
          item.registration_status === registration)
      );
    });
  }, [records, search, status, registration]);

  const columns = [
    {
      title: 'Farm',
      dataIndex: 'farm_name',
      render: value => <b>{value || '-'}</b>
    },
    {
      title: 'Farmer',
      dataIndex: 'farmer_name',
      render: value => value || '-'
    },
    {
      title: 'Spice / Herb',
      dataIndex: 'crop_name',
      render: value =>
        value ? <Tag color="purple">{value}</Tag> : '-'
    },
    {
      title: 'Variety',
      dataIndex: 'variety',
      render: value => value || '-'
    },
    {
      title: 'Area (Ha)',
      dataIndex: 'total_area_hectares',
      render: value => value ?? '-'
    },
    {
      title: 'Production System',
      dataIndex: 'production_system',
      render: value => value || '-'
    },
    {
      title: 'Status',
      dataIndex: 'farm_status',
      render: value => <Tag>{value || '-'}</Tag>
    },
    {
      title: 'Registration',
      dataIndex: 'registration_status',
      render: value => (
        <Tag color={value === 'Approved' ? 'green' : 'orange'}>
          {value || '-'}
        </Tag>
      )
    },
    {
      title: 'Actions',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => console.log('View', record)}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => console.log('Edit', record)}
          />
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      {loading && (
        <BrandedLoader message="Loading spices & herbs..." />
      )}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20
        }}
      >
        <div>
          <Title level={3} style={{ margin: 0, color: '#1a5f2c' }}>
            🌶️ Spice & Herb Production
          </Title>

          <Text type="secondary">
            View and manage horticulture records registered as
            spice and herb production.
          </Text>
        </div>

        <Button icon={<ReloadOutlined />} onClick={fetchSpiceHerbs}>
          Refresh
        </Button>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search spices, herbs, farms..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            allowClear
            style={{ width: 300 }}
          />

          <Select
            value={status}
            onChange={setStatus}
            style={{ width: 160 }}
            options={[
              { value: 'All', label: 'All Farm Status' },
              { value: 'Active', label: 'Active' },
              { value: 'Inactive', label: 'Inactive' }
            ]}
          />

          <Select
            value={registration}
            onChange={setRegistration}
            style={{ width: 180 }}
            options={[
              { value: 'All', label: 'All Registration' },
              { value: 'Pending', label: 'Pending' },
              { value: 'Approved', label: 'Approved' },
              { value: 'Rejected', label: 'Rejected' }
            ]}
          />
        </Space>
      </Card>

      <Card>
        <Table
          rowKey="id"
          loading={loading}
          dataSource={filteredRecords}
          columns={columns}
          scroll={{ x: 1000 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: total => `${total} spice/herb records`
          }}
        />
      </Card>
    </div>
  );
}