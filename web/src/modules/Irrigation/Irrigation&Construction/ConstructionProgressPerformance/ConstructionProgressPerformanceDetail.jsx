import { Button, Card, Col, Descriptions, Divider, Modal, Row, Tag } from 'antd';
import { CalendarOutlined, EnvironmentOutlined, LineChartOutlined, LinkOutlined } from '@ant-design/icons';
import { extractName } from '../../shared/utils';
import { HEALTHY_STATUSES, NOT_TRACKED, orNotTracked } from './ConstructionProgressPerformanceConstants';

const WbsCard = ({ label, value, color, fontSize = 16 }) => (
  <Col span={6}>
    <Card size="small" style={{ textAlign: 'center', background: '#f8fafc' }}>
      <div style={{ fontSize: 11, color: '#8c8c8c' }}>{label}</div>
      <div style={{ fontSize, fontWeight: 700, color }}>{value}</div>
    </Card>
  </Col>
);

/** Full physical-execution dossier of one progress log. */
export default function ProgressDossierModal({ record, onClose, onOpenContract }) {
  const variance = record?.variance_pct;
  const disbursed = record?.disbursed_sum_etb;

  return (
    <Modal
      title={(
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <LineChartOutlined style={{ color: '#1a5f2c', fontSize: 18 }} />
          <span style={{ fontSize: 16, fontWeight: 'bold', color: '#1a5f2c' }}>
            {record?.scheme_name} - Physical Execution Dossier
          </span>
        </div>
      )}
      open={Boolean(record)}
      onCancel={onClose}
      footer={[
        <Button key="close" type="primary" onClick={onClose} style={{ backgroundColor: '#1a5f2c' }}>
          Close
        </Button>,
      ]}
      width={750}
      destroyOnHidden
    >
      {record && (
        <div style={{ paddingTop: 6 }}>
          <Descriptions bordered size="small" column={2}>
            <Descriptions.Item label="Progress Log Code">
              <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1a5f2c' }}>{record.progress_log_code}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Contract Reference">
              <Button
                type="link"
                size="small"
                icon={<LinkOutlined />}
                style={{ padding: 0 }}
                onClick={() => {
                  onClose();
                  onOpenContract(record.contract_code);
                }}
              >
                {record.contract_code}
              </Button>
            </Descriptions.Item>
            <Descriptions.Item label="Classification">
              <Tag color="default">{record.scheme_type}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Schedule Health">
              <Tag color={HEALTHY_STATUSES.includes(record.health_status) ? 'success' : 'error'}>{record.health_status}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Actual Physical Progress">
              <strong style={{ fontSize: 14, color: record.physical_progress_pct >= 66 ? '#1a5f2c' : '#a16207' }}>
                {record.physical_progress_pct}%
              </strong>
              <span style={{ color: '#8c8c8c', marginLeft: 6 }}>(Planned: {record.planned_progress_pct}%)</span>
            </Descriptions.Item>
            <Descriptions.Item label="Schedule Variance">
              {variance === null || variance === undefined ? NOT_TRACKED : (
                <strong style={{ color: variance >= 0 ? '#2f7d4a' : '#b42318' }}>
                  {variance >= 0 ? `+${variance}%` : `${variance}%`}
                </strong>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Financial Disbursed">
              {record.financial_progress_pct}%
              {' '}
              ({disbursed === null || disbursed === undefined ? NOT_TRACKED : `${(Number(disbursed) / 1000000).toFixed(1)} M ETB`})
            </Descriptions.Item>
            <Descriptions.Item label="Command Area">
              <strong>
                {record.command_area_ha === null || record.command_area_ha === undefined
                  ? NOT_TRACKED
                  : `${Number(record.command_area_ha).toLocaleString()} Hectares`}
              </strong>
            </Descriptions.Item>
            <Descriptions.Item label="Resident Engineer">{record.resident_engineer}</Descriptions.Item>
            <Descriptions.Item label="Inspection Date (E.C.)">
              <span><CalendarOutlined style={{ marginRight: 6, color: '#1a5f2c' }} />{record.reporting_ethiopian_date}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Administrative Station" span={2}>
              <EnvironmentOutlined style={{ color: '#1a5f2c', marginRight: 4 }} />
              {extractName(record.kebele)} &gt; {extractName(record.woreda)} &gt; {extractName(record.zone)}
            </Descriptions.Item>
            <Descriptions.Item label="Resident Engineer Site Notes" span={2}>
              <div style={{ color: '#595959', fontSize: 12, fontStyle: 'italic' }}>
                {record.site_engineering_remarks || 'No critical site remarks recorded.'}
              </div>
            </Descriptions.Item>
          </Descriptions>

          <Divider titlePlacement="start" style={{ margin: '16px 0 10px', fontSize: 13, color: '#1a5f2c' }}>
            Work-Breakdown Progress Structure (WBS)
          </Divider>
          <Row gutter={10}>
            <WbsCard label="Weir Concrete" value={orNotTracked(record.weir_concreting_pct, '%')} color="#1a5f2c" />
            <WbsCard label="Canal Excavation" value={orNotTracked(record.canal_excavation_pct, '%')} color="#5b8a6b" />
            <WbsCard
              label="Canal Lining (km)"
              value={`${orNotTracked(record.canal_lining_km)} / ${orNotTracked(record.target_canal_lining_km)}`}
              color="#a16207"
              fontSize={15}
            />
            <WbsCard
              label="Control Gates"
              value={`${orNotTracked(record.gates_installed_count)} / ${orNotTracked(record.target_gates_count)}`}
              color="#64748b"
              fontSize={15}
            />
          </Row>
        </div>
      )}
    </Modal>
  );
}
