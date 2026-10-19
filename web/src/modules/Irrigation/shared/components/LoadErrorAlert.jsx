import { Alert, Button } from 'antd';

/** Error state shown when a page's data could not be loaded. */
export default function LoadErrorAlert({ error, onRetry, style }) {
  if (!error) return null;

  return (
    <Alert
      type="error"
      showIcon
      style={{ marginBottom: 16, ...style }}
      message="Could not load data from the Irrigation service"
      description={error}
      action={onRetry ? <Button size="small" danger onClick={onRetry}>Retry</Button> : null}
    />
  );
}
