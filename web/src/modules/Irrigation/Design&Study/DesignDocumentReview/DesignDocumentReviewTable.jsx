import React from 'react';
import { Button, Popconfirm, Select, Space, Table, Tag, Tooltip } from 'antd';
import { DeleteOutlined, EditOutlined, EnvironmentOutlined, EyeOutlined } from '@ant-design/icons';
import { extractName, toNumber } from '../../shared/utils';

export const DOCUMENT_VOLUMES = [
  'Volume I: Main Engineering & Feasibility Report',
  'Volume II: Hydrology & Water Resource Assessment',
  'Volume III: Geotechnical & Soil Investigation',
  'Volume IV: Hydraulic & Structural Design Calculations',
  'Volume V: Irrigation Agronomy & Command Area Layout',
  'Volume VI: Environmental & Social Impact Assessment (ESIA)',
  'Volume VII: Bill of Quantities (BoQ) & Tender Dossier',
];

export const REVIEW_MILESTONES = [
  'Inception Report Review Gate',
  'Mid-Term Interim Draft Review Gate',
  'Draft Final Engineering Review Gate',
  'Final Tender Dossier & BoQ Validation',
];

export const REVIEW_VERDICTS = [
  { value: 'Approved Without Comments', label: 'Approved (Clear)', color: 'success' },
  { value: 'Approved with Minor Comments', label: 'Approved (Minor Comments)', color: 'default' },
  { value: 'Major Revisions Required', label: 'Major Revisions Required', color: 'warning' },
  { value: 'Rejected / Incomplete', label: 'Rejected', color: 'error' },
  { value: 'Under Review', label: 'Under Review', color: 'processing' },
];

export const DISCIPLINE_CHECKS = [
  { field: 'check_hydrology', key: 'hydrology', label: 'Hydrology & Yield', dossierLabel: 'Hydrology & Yield' },
  { field: 'check_structural', key: 'structural', label: 'Structural Calculations', dossierLabel: 'Structural Design' },
  { field: 'check_geotechnical', key: 'geotechnical', label: 'Geotech & Foundation', dossierLabel: 'Geotechnical' },
  { field: 'check_agronomy', key: 'agronomy', label: 'Agronomy & Layout', dossierLabel: 'Agronomy Layout' },
  { field: 'check_esia', key: 'esia', label: 'ESIA Safeguards', dossierLabel: 'ESIA Safeguards' },
];

export const NEW_REVIEW_DEFAULTS = {
  document_volume: 'Volume IV: Hydraulic & Structural Design Calculations',
  review_milestone: 'Draft Final Engineering Review Gate',
  submission_version: 'Draft Final (v1.0)',
  overall_technical_score: 85,
  review_team_size: 4,
  check_hydrology: true,
  check_structural: true,
  check_geotechnical: true,
  check_agronomy: true,
  check_esia: false,
};

export const scoreColor = (score) => (score >= 80 ? '#1a5f2c' : score >= 65 ? '#a16207' : '#b42318');


const buildColumns = ({ onView, onEdit, onDelete, onVerdictChange }) => [
  {
    title: 'Review Code & Scheme Name',
    key: 'review_info',
    width: 270,
    render: (_, r) => (
      <div>
        <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{r.scheme_name}</strong>
        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
          Rev: <span style={{ fontFamily: 'monospace' }}>{r.review_code}</span> | Ref: <Tag color="green" style={{ fontSize: 10 }}>{r.project_code}</Tag>
        </div>
      </div>
    ),
  },
  {
    title: 'Review Milestone Gate',
    dataIndex: 'review_milestone',
    key: 'review_milestone',
    width: 210,
    render: (m) => <span style={{ fontSize: 12, fontWeight: 500 }}>{m}</span>,
  },
  {
    title: 'Volume & Version',
    key: 'volume_info',
    width: 220,
    render: (_, r) => (
      <div>
        <span style={{ fontSize: 12, color: '#1a5f2c', fontWeight: 600 }}>{r.document_volume?.split(':')[0]}</span>
        <div style={{ fontSize: 11, color: '#595959' }}>{r.submission_version}</div>
      </div>
    ),
  },
  {
    title: 'Command Area',
    dataIndex: 'command_area_ha',
    key: 'command_area_ha',
    width: 130,
    render: (ha) => <strong style={{ color: '#1a5f2c' }}>{toNumber(ha).toLocaleString()} Ha</strong>,
  },
  {
    title: 'Score',
    dataIndex: 'overall_technical_score',
    key: 'overall_technical_score',
    width: 85,
    align: 'center',
    render: (score) => <span style={{ fontWeight: 700, color: scoreColor(score) }}>{score}%</span>,
  },
  {
    title: 'Lead Reviewer',
    dataIndex: 'lead_reviewer',
    key: 'lead_reviewer',
    width: 170,
    render: (rev) => <span style={{ fontSize: 12 }}>{rev}</span>,
  },
  {
    title: 'Location',
    key: 'location',
    width: 170,
    render: (_, r) => (
      <Tooltip title={[extractName(r.zone), extractName(r.woreda), extractName(r.kebele)].filter(Boolean).join(' > ')}>
        <span style={{ fontSize: 12 }}>
          <EnvironmentOutlined style={{ marginRight: 4, color: '#1a5f2c' }} />
          {[extractName(r.woreda), extractName(r.zone)].filter(Boolean).join(', ') || '—'}
        </span>
      </Tooltip>
    ),
  },
  {
    title: 'Evaluation Verdict',
    dataIndex: 'review_verdict',
    key: 'review_verdict',
    width: 200,
    render: (verdict, r) => (
      <Select
        value={verdict}
        onChange={(v) => onVerdictChange(r, v)}
        size="small"
        style={{ width: '100%' }}
        options={REVIEW_VERDICTS.map((v) => ({ value: v.value, label: v.label }))}
      />
    ),
  },
  {
    title: 'Action',
    key: 'action',
    fixed: 'right',
    width: 110,
    render: (_, r) => (
      <Space size={4}>
        <Tooltip title="View review dossier">
          <Button icon={<EyeOutlined />} size="small" type="text" onClick={() => onView(r)} />
        </Tooltip>
        <Tooltip title="Edit review session">
          <Button icon={<EditOutlined />} size="small" type="text" onClick={() => onEdit(r)} />
        </Tooltip>
        <Popconfirm title="Delete this review evaluation record?" onConfirm={() => onDelete(r)} okText="Delete" okType="danger">
          <Button icon={<DeleteOutlined />} size="small" type="text" danger />
        </Popconfirm>
      </Space>
    ),
  },
];

export default function DesignDocumentReviewTable({ data = [], loading = false, onView, onEdit, onDelete, onVerdictChange }) {
  return (
    <Table
      columns={buildColumns({ onView, onEdit, onDelete, onVerdictChange })}
      dataSource={data}
      rowKey="id"
      loading={loading}
      pagination={{ pageSize: 10, showSizeChanger: true }}
      scroll={{ x: 1400 }}
      size="middle"
      bordered
    />
  );
}
