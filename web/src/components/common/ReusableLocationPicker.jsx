import React, { useEffect, useState, useCallback } from 'react';
import { Input, Button, Alert, Tooltip, message } from 'antd';
import { EnvironmentOutlined, AimOutlined, GlobalOutlined } from '@ant-design/icons';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// ───── FIX FOR LEAFLET ICONS ─────
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetinaUrl,
  iconUrl: iconUrl,
  shadowUrl: shadowUrl,
});

const { BaseLayer } = LayersControl;
const defaultCenter = [9.0054, 38.7636]; 

// Map Sub-Components
const MapClickHandler = ({ onLocationSelect }) => {
  useMapEvents({ click(e) { onLocationSelect(e.latlng); } });
  return null;
};

const RecenterMap = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, 18, { animate: true, duration: 1.5 });
  }, [position, map]);
  return null;
};

// ───── MAIN REUSABLE COMPONENT ─────
export default function ReusableLocationPicker({ value, onChange, autoLocate = true }) {
  const [mapPosition, setMapPosition] = useState(null);
  const [localInput, setLocalInput] = useState('');
  const [gpsAccuracy, setGpsAccuracy] = useState(null);

  // Sync external Form value with internal map state
  useEffect(() => {
    if (value && value.lat && value.lng) {
      setMapPosition({ lat: parseFloat(value.lat), lng: parseFloat(value.lng) });
      setLocalInput(`${value.lat}, ${value.lng}`);
      setGpsAccuracy(value.accuracy || null);
    } else {
      setMapPosition(null);
      setLocalInput('');
      setGpsAccuracy(null);
    }
  }, [value]);

  // Trigger change back to Ant Design Form
  const triggerChange = (lat, lng, accuracy) => {
    if (onChange) {
      onChange({ lat, lng, accuracy }); // Passes object to Form.Item
    }
  };

  // 1. Hardware GPS Logic
  const getExactLocation = useCallback((isSilent = false) => {
    if (!navigator.geolocation) {
      if (!isSilent) message.error("Geolocation is not supported.");
      return;
    }
    if (!isSilent) message.loading({ content: 'Locking onto GPS Satellites...', key: 'gps', duration: 0 });
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        triggerChange(latitude, longitude, accuracy);
        if (!isSilent) message.success({ content: `Location locked! (~${Math.round(accuracy)}m)`, key: 'gps', duration: 3 });
      },
      (error) => {
        if (!isSilent) message.error({ content: "Failed to get GPS location.", key: 'gps', duration: 3 });
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
    );
  }, [onChange]);

  // Auto-detect on first mount if empty
  useEffect(() => {
    if (autoLocate && !value) getExactLocation(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Map Click Logic
  const handleMapSelect = (latlng) => {
    triggerChange(latlng.lat, latlng.lng, null);
  };

  // 3. Manual Text Input Logic
  const handleManualInput = (e) => {
    const val = e.target.value;
    setLocalInput(val); 
    const coords = val.split(',');
    if (coords.length === 2) {
      const lat = parseFloat(coords[0].trim());
      const lng = parseFloat(coords[1].trim());
      if (!isNaN(lat) && !isNaN(lng)) {
        triggerChange(lat, lng, null);
      }
    }
  };

  return (
    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <Input 
          style={{ flex: 1, marginRight: '16px' }}
          placeholder="E.g. 9.005401, 38.763611" 
          prefix={<EnvironmentOutlined style={{ color: '#16a34a' }}/>} 
          value={localInput}
          onChange={handleManualInput}
          size="large"
        />
        <Tooltip title="Forces hardware to ping satellites for exact real-time location.">
          <Button type="primary" size="large" icon={<AimOutlined />} onClick={() => getExactLocation(false)} style={{ backgroundColor: '#15803d', borderColor: '#15803d' }}>
            Force GPS Sync
          </Button>
        </Tooltip>
      </div>

      {gpsAccuracy && (
        <Alert message={`Location acquired via Hardware GPS. Accuracy: ±${Math.round(gpsAccuracy)} meters.`} type="success" showIcon style={{ marginBottom: '12px', padding: '6px 12px' }} />
      )}
      
      <div style={{ height: '380px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '2px solid #94a3b8', position: 'relative' }}>
        <MapContainer center={mapPosition || defaultCenter} zoom={mapPosition ? 18 : 6} style={{ height: '100%', width: '100%' }}>
          <LayersControl position="topright">
            <BaseLayer checked name="Google Satellite">
              <TileLayer url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" maxZoom={20} />
            </BaseLayer>
            <BaseLayer name="Google Street Map">
              <TileLayer url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}" maxZoom={20} />
            </BaseLayer>
          </LayersControl>
          <MapClickHandler onLocationSelect={handleMapSelect} />
          <RecenterMap position={mapPosition} />
          {mapPosition && <Marker position={mapPosition} />}
        </MapContainer>
      </div>
    </div>
  );
}