import React from 'react';
import { Table, Button, Space, Popconfirm, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

export default function LandUseTable({ data, onEdit, onDelete }) {
  const columns = [
    {
      title: 'Zone',
      dataIndex: ['woreda', 'zone', 'name'],
      key: 'zone',
      render: (_, record) => record.woreda?.zone?.name || 'N/A',
    },
    {
      title: 'Woreda',
      dataIndex: ['woreda', 'name'],
      key: 'woreda',
      render: (_, record) => record.woreda?.name || 'N/A',
    },
    {
      title: 'Year',
      dataIndex: 'year',
      key: 'year',
      sorter: (a, b) => a.year - b.year,
    },
    {
      title: 'Forest (Ha)',
      dataIndex: 'forest_ha',
      key: 'forest_ha',
      render: (v) => Number(v).toFixed(2),
    },
    {
      title: 'Grazing (Ha)',
      dataIndex: 'grazing_ha',
      key: 'grazing_ha',
      render: (v) => Number(v).toFixed(2),
    },
    {
      title: 'Wetland/Swamp (Ha)',
      dataIndex: 'wetland_swamp_ha',
      key: 'wetland_swamp_ha',
      render: (v) => Number(v).toFixed(2),
    },
    {
      title: 'Barren/Wasteland (Ha)',
      dataIndex: 'barren_wasteland_ha',
      key: 'barren_wasteland_ha',
      render: (v) => Number(v).toFixed(2),
    },
    {
      title: 'Total Combined (Ha)',
      key: 'total',
      render: (_, r) => {
        const total = Number(r.forest_ha || 0) + Number(r.grazing_ha || 0) + Number(r.wetland_swamp_ha || 0) + Number(r.barren_wasteland_ha || 0);
        return <strong>{total.toFixed(2)}</strong>;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 110,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Edit">
            <Button type="primary" icon={<EditOutlined />} onClick={() => onEdit(record)} size="small" />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Are you sure to delete this classification entry?"
              onConfirm={() => onDelete(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button type="primary" danger icon={<DeleteOutlined />} size="small" />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return <Table columns={columns} dataSource={data} rowKey="id" bordered pagination={{ pageSize: 10 }} />;
}