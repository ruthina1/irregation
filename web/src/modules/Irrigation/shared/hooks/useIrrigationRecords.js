import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiErrorMessage } from '../utils';

/**
 * Loads and mutates the records of one Irrigation sub-resource.
 *
 * `service` is an entry of irrigationApi (list/create/update/patch/remove).
 * Mutations resolve with the record returned by the server and REJECT on
 * failure, so callers can show the real error — nothing is updated locally
 * unless the server accepted the change.
 *
 * `loading` is derived from whether the latest request has completed, and
 * responses for a superseded request (e.g. a previous fiscal year) are ignored.
 */
export default function useIrrigationRecords(service, { fiscalYear, params, enabled = true } = {}) {
  const [version, setVersion] = useState(0);
  const [result, setResult] = useState({ key: null, records: [], error: null });

  const paramsKey = JSON.stringify(params || {});
  const query = useMemo(
    () => ({ ...(fiscalYear ? { fiscal_year: fiscalYear } : {}), ...JSON.parse(paramsKey) }),
    [fiscalYear, paramsKey]
  );
  const requestKey = `${JSON.stringify(query)}#${version}`;

  useEffect(() => {
    if (!enabled) return undefined;
    let current = true;

    service.list(query).then(
      (res) => {
        if (current) setResult({ key: requestKey, records: Array.isArray(res.data?.data) ? res.data.data : [], error: null });
      },
      (err) => {
        if (current) setResult({ key: requestKey, records: [], error: getApiErrorMessage(err, 'Failed to load records.') });
      }
    );

    return () => {
      current = false;
    };
  }, [service, query, requestKey, enabled]);

  const loading = enabled && result.key !== requestKey;
  const records = result.records;

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  const setRecords = useCallback((updater) => {
    setResult((prev) => ({ ...prev, records: typeof updater === 'function' ? updater(prev.records) : updater }));
  }, []);

  const replace = useCallback((record) => {
    setRecords((prev) => prev.map((r) => (r.id === record.id ? record : r)));
    return record;
  }, [setRecords]);

  const belongsToView = useCallback(
    (record) => !fiscalYear || record.fiscal_year === fiscalYear,
    [fiscalYear]
  );

  const create = useCallback(async (payload) => {
    const res = await service.create(payload);
    const record = res.data.data;
    if (belongsToView(record)) setRecords((prev) => [record, ...prev]);
    return record;
  }, [service, belongsToView, setRecords]);

  const update = useCallback(async (id, payload) => {
    const res = await service.update(id, payload);
    const record = res.data.data;
    if (belongsToView(record)) replace(record);
    else setRecords((prev) => prev.filter((r) => r.id !== id));
    return record;
  }, [service, replace, belongsToView, setRecords]);

  const patch = useCallback(async (id, payload) => {
    const res = await service.patch(id, payload);
    return replace(res.data.data);
  }, [service, replace]);

  const remove = useCallback(async (id) => {
    await service.remove(id);
    setRecords((prev) => prev.filter((r) => r.id !== id));
  }, [service, setRecords]);

  /** Run a workflow action (e.g. () => service.dispatch(id, data)) and merge the returned record. */
  const runAction = useCallback(async (request) => {
    const res = await request();
    return replace(res.data.data);
  }, [replace]);

  return {
    records, setRecords, loading, error: enabled ? result.error : null, reload, create, update, patch, remove, runAction, replace,
  };
}
