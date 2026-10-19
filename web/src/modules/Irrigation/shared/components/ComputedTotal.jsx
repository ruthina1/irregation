import { Form } from 'antd';

/**
 * Read-only box showing the live sum of several numeric form fields
 * (e.g. male + female members).
 */
export default function ComputedTotal({ fields, label, suffix = '', style }) {
  return (
    <Form.Item
      label={label}
      style={{ marginBottom: 0, ...style }}
      shouldUpdate={(prev, cur) => fields.some((f) => prev[f] !== cur[f])}
    >
      {({ getFieldValue }) => {
        const total = fields.reduce((acc, f) => acc + (Number(getFieldValue(f)) || 0), 0);
        return (
          <div
            style={{
              height: 32,
              background: '#fff',
              border: '1px dashed #d1d5db',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              padding: '0 8px',
              fontWeight: 700,
              fontSize: 12,
              color: '#1a5f2c',
            }}
          >
            {total.toLocaleString()} {suffix}
          </div>
        );
      }}
    </Form.Item>
  );
}
