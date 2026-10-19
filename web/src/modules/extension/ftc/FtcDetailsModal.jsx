import React from 'react';
import { Modal, Descriptions, Tabs, Tag, Typography, Row, Col } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { MapContainer, TileLayer, Marker, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet Icons
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

const { Title, Text } = Typography;
const { BaseLayer } = LayersControl;

export default function FtcDetailsModal({ open, onClose, ftc }) {
  if (!ftc) return null;

  const hasLocation = ftc.location && ftc.location.latitude && ftc.location.longitude;
  const mapCenter = hasLocation ? [ftc.location.latitude, ftc.location.longitude] : null;

  const tabItems = [
    {
      key: '1',
      label: 'Core Information & GIS',
      children: (
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="FTC Name"><b>{ftc.ftc_name}</b></Descriptions.Item>
              <Descriptions.Item label="Kebele ID">{ftc.kebele_id}</Descriptions.Item>
              <Descriptions.Item label="Distance to Woreda">
                {ftc.distance_to_woreda_km ? `${ftc.distance_to_woreda_km} km` : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Registration Number">{ftc.registration_number || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Capacity Level"><Tag color="blue">{ftc.capacity_level}</Tag></Descriptions.Item>
              <Descriptions.Item label="Status"><Tag color="green">{ftc.construction_status}</Tag></Descriptions.Item>
            </Descriptions>
          </Col>

          <Col span={24}>
            <Title level={5}><GlobalOutlined /> Exact GIS Location</Title>
            {hasLocation ? (
              <div style={{ height: '250px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #d9d9d9' }}>
                <MapContainer center={mapCenter} zoom={16} style={{ height: '100%', width: '100%' }}>
                  <LayersControl position="topright">
                    <BaseLayer checked name="Satellite">
                      <TileLayer url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" maxZoom={20} />
                    </BaseLayer>
                    <BaseLayer name="Street Map">
                      <TileLayer url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}" maxZoom={20} />
                    </BaseLayer>
                  </LayersControl>
                  <Marker position={mapCenter} />
                </MapContainer>
              </div>
            ) : (
              <div style={{ padding: '30px', background: '#f5f5f5', textAlign: 'center', borderRadius: '8px', color: '#999' }}>
                No precise GIS coordinates registered for this FTC.
              </div>
            )}
          </Col>
        </Row>
      )
    },
    {
      key: '2',
      label: 'Infrastructure & Finance',
      children: (
        <Descriptions bordered size="small" column={1}>
          <Descriptions.Item label="Demo Land Size">{ftc.demo_land_ha ? `${ftc.demo_land_ha} Hectares` : 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Tenure Status">{ftc.tenure_status || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Building Types">
            {ftc.building_types?.map(b => <Tag key={b}>{b}</Tag>) || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Utilities Available">
            {ftc.utilities?.map(u => <Tag color="cyan" key={u}>{u}</Tag>) || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Audit Status">
            <Tag color={ftc.audit_status === 'Audited' ? 'success' : 'error'}>{ftc.audit_status}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Deficiency Found?">
            {ftc.deficiency_found ? <Text type="danger">Yes</Text> : <Text type="success">No</Text>}
          </Descriptions.Item>
          <Descriptions.Item label="Total Budget">{Number(ftc.total_budget_birr || 0).toLocaleString()} Birr</Descriptions.Item>
          <Descriptions.Item label="Savings Amount">{Number(ftc.savings_amount_birr || 0).toLocaleString()} Birr</Descriptions.Item>
          <Descriptions.Item label="Fixed Assets Value">{Number(ftc.fixed_assets_value_birr || 0).toLocaleString()} Birr</Descriptions.Item>
        </Descriptions>
      )
    }
  ];

  return (
    <Modal
      title={<span style={{ fontSize: '18px', fontWeight: 'bold' }}>{ftc.ftc_name} - Full Profile</span>}
      open={open}
      onCancel={onClose}
      footer={null} // No save/cancel buttons needed
      width={750}
      destroyOnClose
    >
      <Tabs defaultActiveKey="1" items={tabItems} style={{ marginTop: '10px' }} />
    </Modal>
  );
}