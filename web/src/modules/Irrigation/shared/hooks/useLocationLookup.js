import { useCallback, useEffect, useState } from 'react';
import { locationApi } from '../../../../services/api/locationApi';
import { extractName } from '../utils';

const toList = (res) => {
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  if (Array.isArray(res)) return res;
  return [];
};

export default function useLocationLookup() {
  const [zones, setZones] = useState([]);
  const [woredas, setWoredas] = useState([]);
  const [kebeles, setKebeles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let current = true;
    locationApi.getZones().then(
      (res) => {
        if (!current) return;
        setZones(toList(res));
        setLoading(false);
      },
      (err) => {
        if (!current) return;
        setError(err?.message || 'Failed to load zones');
        setLoading(false);
      }
    );
    return () => { current = false; };
  }, []);

  const loadWoredas = useCallback(async (zoneIdentifier) => {
    if (!zoneIdentifier) {
      setWoredas([]);
      return [];
    }
    // Find zone id if zoneIdentifier is name
    const match = zones.find(
      (z) => z.id === zoneIdentifier || extractName(z).toLowerCase() === String(zoneIdentifier).toLowerCase()
    );
    const zoneId = match?.id || zoneIdentifier;
    try {
      const res = await locationApi.getWoredas(zoneId);
      const list = toList(res);
      setWoredas(list);
      return list;
    } catch {
      setWoredas([]);
      return [];
    }
  }, [zones]);

  const loadKebeles = useCallback(async (woredaIdentifier, woredaList = null) => {
    if (!woredaIdentifier) {
      setKebeles([]);
      return [];
    }
    const pool = woredaList || woredas;
    const match = pool.find(
      (w) => w.id === woredaIdentifier || extractName(w).toLowerCase() === String(woredaIdentifier).toLowerCase()
    );
    const woredaId = match?.id || woredaIdentifier;
    try {
      const res = await locationApi.getKebeles(woredaId);
      const list = toList(res);
      setKebeles(list);
      return list;
    } catch {
      setKebeles([]);
      return [];
    }
  }, [woredas]);

  return { zones, woredas, kebeles, loading, error, loadWoredas, loadKebeles };
}
