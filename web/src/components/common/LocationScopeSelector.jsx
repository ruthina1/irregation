import React, { useEffect, useState } from 'react';
import { Form, Select, Row, Col, Tag, Tooltip, Spin } from 'antd';
import { LockOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/axios';

const { Option } = Select;

/**
 * Production-Grade Location Scope Selector
 * Reads logged-in user profile from useAuthStore and auto-detects / locks fields.
 */
export default function LocationScopeSelector({ form, editingData, layout = 'row' }) {
  const { user } = useAuthStore(); // Reads current user from your auth store
  const [loading, setLoading] = useState(true);

  const [zones, setZones] = useState([]);
  const [woredas, setWoredas] = useState([]);
  const [kebeles, setKebeles] = useState([]);

  const [loadingWoredas, setLoadingWoredas] = useState(false);
  const [loadingKebeles, setLoadingKebeles] = useState(false);

  // 1. Detect User Assigned Jurisdiction Level
  const userKebeleId = user?.kebele_id || user?.kebele?.id;
  const userWoredaId = user?.woreda_id || user?.woreda?.id || user?.kebele?.woreda_id;
  const userZoneId = user?.zone_id || user?.zone?.id || user?.woreda?.zone_id || user?.kebele?.woreda?.zone_id;

  const isKebeleUser = Boolean(userKebeleId);
  const isWoredaUser = Boolean(userWoredaId) && !isKebeleUser;
  const isZoneUser = Boolean(userZoneId) && !isWoredaUser && !isKebeleUser;
  const isRegionalUser = !isKebeleUser && !isWoredaUser && !isZoneUser;

  // 2. Fetch API Helpers
  const fetchZones = async () => {
    try {
      const res = await api.get('/zones');
      setZones(res.data.data || res.data);
    } catch (e) { console.error("Error fetching zones", e); }
  };

  const fetchWoredas = async (zId) => {
    if (!zId) { setWoredas([]); return; }
    setLoadingWoredas(true);
    try {
      const res = await api.get(`/woredas?zone_id=${zId}`);
      setWoredas(res.data.data || res.data);
    } catch (e) { console.error("Error fetching woredas", e); }
    finally { setLoadingWoredas(false); }
  };

  const fetchKebeles = async (wId) => {
    if (!wId) { setKebeles([]); return; }
    setLoadingKebeles(true);
    try {
      const res = await api.get(`/kebeles?woreda_id=${wId}`);
      setKebeles(res.data.data || res.data);
    } catch (e) { console.error("Error fetching kebeles", e); }
    finally { setLoadingKebeles(false); }
  };

  // 3. Auto-Detect & Fill Location Logic
  useEffect(() => {
    let isMounted = true;

    const initLocation = async () => {
      setLoading(true);
      await fetchZones();

      if (editingData) {
        // EDIT MODE: Populate from record being edited
        const eZoneId = editingData.zone_id || editingData.kebele?.woreda?.zone_id;
        const eWoredaId = editingData.woreda_id || editingData.kebele?.woreda_id;
        const eKebeleId = editingData.kebele_id;

        if (eZoneId) await fetchWoredas(eZoneId);
        if (eWoredaId) await fetchKebeles(eWoredaId);

        if (isMounted) {
          form.setFieldsValue({
            zone_id: eZoneId,
            woreda_id: eWoredaId,
            kebele_id: eKebeleId,
          });
        }
      } else {
        // CREATE MODE: Auto-detect from logged-in user profile
        if (isKebeleUser) {
          if (userZoneId) await fetchWoredas(userZoneId);
          if (userWoredaId) await fetchKebeles(userWoredaId);

          if (isMounted) {
            form.setFieldsValue({
              zone_id: userZoneId,
              woreda_id: userWoredaId,
              kebele_id: userKebeleId,
            });
          }
        } else if (isWoredaUser) {
          if (userZoneId) await fetchWoredas(userZoneId);
          if (userWoredaId) await fetchKebeles(userWoredaId);

          if (isMounted) {
            form.setFieldsValue({
              zone_id: userZoneId,
              woreda_id: userWoredaId,
              kebele_id: undefined, // User selects kebele
            });
          }
        } else if (isZoneUser) {
          if (userZoneId) await fetchWoredas(userZoneId);

          if (isMounted) {
            form.setFieldsValue({
              zone_id: userZoneId,
              woreda_id: undefined, // User selects woreda & kebele
              kebele_id: undefined,
            });
          }
        }
      }

      if (isMounted) setLoading(false);
    };

    initLocation();

    return () => { isMounted = false; };
  }, [editingData, form, isKebeleUser, isWoredaUser, isZoneUser, userZoneId, userWoredaId, userKebeleId]);

  // 4. Manual Dropdown Selection Handlers
  const handleZoneChange = (zId) => {
    form.setFieldsValue({ woreda_id: undefined, kebele_id: undefined });
    setKebeles([]);
    if (zId) fetchWoredas(zId);
    else setWoredas([]);
  };

  const handleWoredaChange = (wId) => {
    form.setFieldsValue({ kebele_id: undefined });
    if (wId) fetchKebeles(wId);
    else setKebeles([]);
  };

  // 5. Determine Lock Status (Disabled State for Creation Mode)
  const lockZone = !editingData && !isRegionalUser;
  const lockWoreda = !editingData && (isWoredaUser || isKebeleUser);
  const lockKebele = !editingData && isKebeleUser;

  if (loading) {
    return (
      <div style={{ padding: '12px 0', textAlign: 'center' }}>
        <Spin message="Auto-detecting assigned jurisdiction..." />
      </div>
    );
  }

  return (
    <div>
      {/* Scope Tag Indicator */}
      {!editingData && !isRegionalUser && (
        <div style={{ marginBottom: 12 }}>
          <Tag icon={<EnvironmentOutlined />} color="green" style={{ padding: '4px 8px', fontSize: '12px' }}>
            Auto-Detected User Scope:{' '}
            <strong>
              {isKebeleUser ? 'KEBELE LEVEL' : isWoredaUser ? 'WOREDA LEVEL' : 'ZONE LEVEL'}
            </strong>
          </Tag>
        </div>
      )}

      <Row gutter={16}>
        {/* ZONE DROPDOWN */}
        <Col span={layout === 'row' ? 8 : 24}>
          <Form.Item
            name="zone_id"
            label={
              <span>
                Zone {lockZone && <Tooltip title="Locked to your assigned Zone"><LockOutlined style={{ color: '#fa8c16', marginLeft: 4 }} /></Tooltip>}
              </span>
            }
            rules={[{ required: true, message: 'Zone is required' }]}
          >
            <Select
              placeholder="Select Zone"
              onChange={handleZoneChange}
              disabled={lockZone}
              showSearch
              optionFilterProp="children"
            >
              {zones.map(z => <Option key={z.id} value={z.id}>{z.name}</Option>)}
            </Select>
          </Form.Item>
        </Col>

        {/* WOREDA DROPDOWN */}
        <Col span={layout === 'row' ? 8 : 24}>
          <Form.Item
            name="woreda_id"
            label={
              <span>
                Woreda {lockWoreda && <Tooltip title="Locked to your assigned Woreda"><LockOutlined style={{ color: '#fa8c16', marginLeft: 4 }} /></Tooltip>}
              </span>
            }
            rules={[{ required: true, message: 'Woreda is required' }]}
          >
            <Select
              placeholder="Select Woreda"
              onChange={handleWoredaChange}
              loading={loadingWoredas}
              disabled={lockWoreda || !form.getFieldValue('zone_id')}
              showSearch
              optionFilterProp="children"
            >
              {woredas.map(w => <Option key={w.id} value={w.id}>{w.name}</Option>)}
            </Select>
          </Form.Item>
        </Col>

        {/* KEBELE DROPDOWN */}
        <Col span={layout === 'row' ? 8 : 24}>
          <Form.Item
            name="kebele_id"
            label={
              <span>
                Kebele (Required) {lockKebele && <Tooltip title="Locked to your assigned Kebele"><LockOutlined style={{ color: '#fa8c16', marginLeft: 4 }} /></Tooltip>}
              </span>
            }
            rules={[{ required: true, message: 'Please select a Kebele' }]}
          >
            <Select
              placeholder="Select Kebele"
              loading={loadingKebeles}
              disabled={lockKebele || !form.getFieldValue('woreda_id')}
              showSearch
              optionFilterProp="children"
            >
              {kebeles.map(k => <Option key={k.id} value={k.id}>{k.name}</Option>)}
            </Select>
          </Form.Item>
        </Col>
      </Row>
    </div>
  );
}