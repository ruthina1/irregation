import { useCallback, useEffect, useState } from 'react';
import irrigationApi from '../../../../services/api/irrigationApi';
import { CURRENT_FISCAL_YEAR } from '../../shared/constants';
import { getApiErrorMessage } from '../../shared/utils';

/**
 * Loads one Analytics & Reports aggregate (GET /irrigation/reports/{name})
 * for the selected fiscal year. `loading` is derived from whether the latest
 * request has completed; responses for a superseded year are ignored.
 */
export default function useIrrigationReport(name) {
  const [fiscalYear, setFiscalYear] = useState(CURRENT_FISCAL_YEAR);
  const [version, setVersion] = useState(0);
  const [result, setResult] = useState({ key: null, payload: null, error: null });
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

  return {
    fiscalYear,
    setFiscalYear,
    rows: Array.isArray(payload.data) ? payload.data : [],
    payload,
    meta: payload.meta && typeof payload.meta === 'object' ? payload.meta : {},
    loading: result.key !== requestKey,
    error: result.error,
    reload,
  };
}
