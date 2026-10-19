import { Button, Descriptions, Divider, Modal, Tag } from 'antd';
import { BuildOutlined, CalendarOutlined, EnvironmentOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { extractName, toNumber } from '../../shared/utils';
import { SHELF_STATUSES } from './ConstructionReadyDesignsManagement';

const DOSSIER_ITEMS = [
  ['engineering_drawings', 'Stamped Engineering Drawings', 'Complete'],
  ['priced_boq', 'Priced Bill of Quantities (BoQ)', 'Validated'],
  ['technical_specifications', 'Technical Specifications', 'Complete'],
  ['esia_clearance', 'Environmental (ESIA) Certificate', 'Cleared'],
  ['wua_land_agreement', 'WUA Community Land Agreement', 'Signed'],
];

export default function ConstructionReadyDesignsDetail({ record, onClose }) {
  return (
    <Modal
      title={(
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <BuildOutlined style={{ color: '#1a5f2c', fontSize: 18 }} />
          <span style={{ fontSize: 16, fontWeight: 'bold', color: '#1a5f2c' }}>{record?.scheme_name} - Construction-Ready Project Bank Dossier</span>
        </div>
      )}
      open={Boolean(record)}
      onCancel={onClose}
      footer={[<Button key="close" type="primary" onClick={onClose} style={{ backgroundColor: '#1a5f2c' }}>Close</Button>]}
      width={750}
      destroyOnHidden
    >
      {record && (
        <div style={{ paddingTop: 6 }}>
          <Descriptions bordered size="small" column={2}>
            <Descriptions.Item label="Shelf Project Code"><span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1a5f2c' }}>{record.shelf_code}</span></Descriptions.Item>
            <Descriptions.Item label="Original Study Code"><Tag color="green">{record.project_code}</Tag></Descriptions.Item>
            <Descriptions.Item label="Design Modality" span={2}><Tag color="default">{record.study_modality}</Tag></Descriptions.Item>
            <Descriptions.Item label="Water Technology"><strong>{record.water_source}</strong></Descriptions.Item>
            <Descriptions.Item label="Target Funding Program"><Tag color="default">{record.preferred_funding_channel}</Tag></Descriptions.Item>
            <Descriptions.Item label="Approved Command Area"><strong style={{ color: '#1a5f2c' }}>{toNumber(record.command_area_ha).toLocaleString()} Hectares</strong></Descriptions.Item>
            <Descriptions.Item label="Priced BoQ Construction Cost">
              <strong style={{ fontSize: 14, color: '#5b8a6b' }}>{(toNumber(record.estimated_construction_etb) / 1000000).toFixed(2)} Million ETB</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Target Beneficiaries (M / F)" span={2}>
              Male: {record.beneficiaries_male} | Female: {record.beneficiaries_female} (Total: {toNumber(record.beneficiaries_male) + toNumber(record.beneficiaries_female)} Households)
            </Descriptions.Item>
            <Descriptions.Item label="QA Certificate Reference">
              <Tag color="success"><SafetyCertificateOutlined style={{ marginRight: 4 }} />{record.qa_certificate_no || '—'}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Shelf Entry Date (E.C.)">
              <span><CalendarOutlined style={{ marginRight: 6, color: '#1a5f2c' }} />{record.shelf_entry_ethiopian_date}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Current Shelf Status" span={2}>
              <Tag color={SHELF_STATUSES.find((s) => s.value === record.shelf_status)?.color || 'default'}>{record.shelf_status}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Administrative Station" span={2}>
              <EnvironmentOutlined style={{ color: '#1a5f2c', marginRight: 4 }} />
              {extractName(record.kebele)} &gt; {extractName(record.woreda)} &gt; {extractName(record.zone)}
            </Descriptions.Item>
            <Descriptions.Item label="Procurement Packaging Notes" span={2}>
              <div style={{ color: '#595959', fontSize: 12, fontStyle: 'italic' }}>{record.procurement_remarks || 'Dossier ready for contractor tender.'}</div>
            </Descriptions.Item>
          </Descriptions>
          {record.handover_details && (
            <>
              <Divider titlePlacement="start" style={{ margin: '16px 0 10px', fontSize: 13, color: '#1a5f2c' }}>
                Handover to Construction & Monitoring Directorate
              </Divider>
              <Descriptions bordered size="small" column={2}>
                <Descriptions.Item label="Handover Date (E.C.)">{record.handover_details.handover_date || '—'}</Descriptions.Item>
                <Descriptions.Item label="Handed Over By">{record.handover_details.handed_over_by || '—'}</Descriptions.Item>
                <Descriptions.Item label="Procurement Method" span={2}>{record.handover_details.procurement_method}</Descriptions.Item>
                <Descriptions.Item label="Executing Client">{record.handover_details.executing_client}</Descriptions.Item>
                <Descriptions.Item label="Allocated Budget">
                  <strong style={{ color: '#5b8a6b' }}>{(toNumber(record.handover_details.allocated_budget_etb) / 1000000).toFixed(2)} Million ETB</strong>
                </Descriptions.Item>
                <Descriptions.Item label="Transmittal Remarks" span={2}>
                  <div style={{ color: '#595959', fontSize: 12, fontStyle: 'italic' }}>{record.handover_details.handover_notes || '—'}</div>
                </Descriptions.Item>
              </Descriptions>
            </>
          )}
          <Divider titlePlacement="start" style={{ margin: '16px 0 10px', fontSize: 13, color: '#1a5f2c' }}>
            Tender Dossier & Construction Clearance Packaging
          </Divider>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {DOSSIER_ITEMS.map(([key, label, done]) => (
              <Tag key={key} color={record.tender_dossier?.[key] ? 'success' : 'default'}>
                {label}: {record.tender_dossier?.[key] ? done : 'Pending'}
              </Tag>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
}
