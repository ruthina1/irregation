import { useCallback, useEffect, useMemo, useState } from 'react';
import irrigationApi from '../../../../services/api/irrigationApi';
import { CURRENT_FISCAL_YEAR } from '../../shared/constants';
import { getApiErrorMessage } from '../../shared/utils';

/**
 * Loads one Analytics & Reports aggregate (GET /irrigation/reports/{name})
 * for the selected fiscal year. `loading` is derived from whether the latest
 * request has completed; responses for a superseded year are ignored.
 */
export default function useIrrigationReport(name, initialViewMode = 'charts') {
  const [fiscalYear, setFiscalYear] = useState(CURRENT_FISCAL_YEAR);
  const [viewMode, setViewMode] = useState(initialViewMode === 'both' ? 'charts' : initialViewMode);
  const [version, setVersion] = useState(0);
  const [result, setResult] = useState({ key: null, payload: null, error: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState('all');
  const requestKey = `${name}|${fiscalYear}#${version}`;

  useEffect(() => {
    let current = true;
    irrigationApi.report(name, { fiscal_year: fiscalYear }).then(
      (res) => { if (current) setResult({ key: requestKey, payload: res.data || {}, error: null }); },
      (err) => { if (current) setResult({ key: requestKey, payload: null, error: getApiErrorMessage(err, 'Failed to load report.') }); }
    );
    return () => { current = false; };
  }, [name, fiscalYear, requestKey]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);
  const payload = result.payload || {};
  const rawRows = Array.isArray(payload.data) ? payload.data : [];

  const zones = useMemo(() => {
    return Array.from(new Set(rawRows.map((r) => r.zone || r.program).filter(Boolean)));
  }, [rawRows]);

  const rows = useMemo(() => {
    if (!searchTerm.trim()) return rawRows;
    const q = searchTerm.toLowerCase().trim();
    return rawRows.filter((r) => {
      return Object.values(r).some((val) => {
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(q);
      });
    });
  }, [rawRows, searchTerm]);

  return {
    fiscalYear,
    setFiscalYear,
    viewMode,
    setViewMode,
    rows,
    rawRows,
    searchTerm,
    setSearchTerm,
    selectedZone,
    setSelectedZone,
    zones,
    payload,
    meta: payload.meta && typeof payload.meta === 'object' ? payload.meta : {},
    loading: result.key !== requestKey,
    error: result.error,
    reload,
  };
}

