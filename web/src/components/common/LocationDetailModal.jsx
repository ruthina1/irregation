import React from 'react';
import { Modal, Row, Col, Card, Typography, Tag } from 'antd';
import {
    Eye,
    AlertTriangle,
    ShieldCheck
} from 'lucide-react';

const { Text, Title } = Typography;

const InfoCard = ({ label, value }) => (
    <Card
        size="small"
        bordered={false}
        style={{
            borderRadius: 14,
            background: '#f8fafc',
            height: '100%'
        }}
        bodyStyle={{ padding: 16 }}
    >
        <Text
            type="secondary"
            style={{
                fontSize: 12,
                textTransform: 'uppercase',
                letterSpacing: 0.5
            }}
        >
            {label}
        </Text>

        <div
            style={{
                marginTop: 8,
                fontSize: 17,
                fontWeight: 600,
                color: '#0f172a'
            }}
        >
            {value || '—'}
        </div>
    </Card>
);

const LocationDetailModal = ({ open, onCancel, item, target }) => {
    if (!item) return null;

    return (
        <Modal
            open={open}
            onCancel={onCancel}
            footer={null}
            centered
            width={700}
            title={
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12
                    }}
                >
                    <div
                        style={{
                            width: 38,
                            height: 38,
                            borderRadius: 10,
                            background: '#ecfdf5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#10b981'
                        }}
                    >
                        <Eye size={18} />
                    </div>

                    <div>
                        <Title
                            level={5}
                            style={{ margin: 0 }}
                        >
                            {target?.charAt(0).toUpperCase() +
                                target?.slice(1)} Details
                        </Title>

                        <Text type="secondary">
                            {item.name}
                        </Text>
                    </div>
                </div>
            }
        >
            <div style={{ paddingTop: 10 }}>
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                        <InfoCard
                            label="Name"
                            value={item.name}
                        />
                    </Col>

                    {target === 'woreda' && item.zone && (
                        <Col xs={24} md={12}>
                            <InfoCard
                                label="Parent Zone"
                                value={item.zone.name}
                            />
                        </Col>
                    )}

                    {target === 'kebele' && item.woreda && (
                        <Col xs={24} md={12}>
                            <InfoCard
                                label="Parent Woreda"
                                value={item.woreda.name}
                            />
                        </Col>
                    )}

                    {target === 'kebele' && (
                        <>
                            <Col xs={12} md={6}>
                                <InfoCard
                                    label="Total Area"
                                    value={
                                        item.total_area_ha
                                            ? `${item.total_area_ha} Ha`
                                            : '—'
                                    }
                                />
                            </Col>

                            <Col xs={12} md={6}>
                                <InfoCard
                                    label="Arable Land"
                                    value={
                                        item.arable_land_area_ha
                                            ? `${item.arable_land_area_ha} Ha`
                                            : '—'
                                    }
                                />
                            </Col>

                            <Col xs={12} md={6}>
                                <InfoCard
                                    label="Ecology"
                                    value={
                                        item.ecology_type ||
                                        'Not Specified'
                                    }
                                />
                            </Col>

                            <Col xs={12} md={6}>
                                <InfoCard
                                    label="Elevation"
                                    value={
                                        item.elevation_meters
                                            ? `${item.elevation_meters} m`
                                            : '—'
                                    }
                                />
                            </Col>
                        </>
                    )}
                </Row>

                {target === 'woreda' && (
                    <div style={{ marginTop: 20 }}>
                        {item.is_food_insecure ? (
                            <Tag
                                color="error"
                                icon={<AlertTriangle size={14} />}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: 8,
                                    fontWeight: 500
                                }}
                            >
                                PSNP Area — Food Insecure
                            </Tag>
                        ) : (
                            <Tag
                                color="success"
                                icon={<ShieldCheck size={14} />}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: 8,
                                    fontWeight: 500
                                }}
                            >
                                Food Secure
                            </Tag>
                        )}
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default LocationDetailModal;