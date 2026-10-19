import { Col, Form, InputNumber, Row, Select } from 'antd';
import { ETHIOPIAN_FISCAL_YEARS, ETHIOPIAN_MONTHS } from '../constants';

const MONTH_OPTIONS = ETHIOPIAN_MONTHS.map((m) => ({ value: m, label: m }));
const YEAR_OPTIONS = ETHIOPIAN_FISCAL_YEARS.map((y) => ({ value: y, label: y }));

/**
 * Ethiopian-calendar date input: month / day / year fields named
 * `${prefix}month`, `${prefix}day`, `${prefix}year` (default prefix "eth_").
 */
export default function EthDateFields({ label = 'Date (E.C.)', prefix = 'eth_', required = true, style }) {
  const rules = required ? [{ required: true, message: 'Required' }] : [];

  return (
    <Form.Item label={label} required={required} style={{ marginBottom: 12, ...style }}>
      <Row gutter={4}>
        <Col span={10}>
          <Form.Item name={`${prefix}month`} rules={rules} noStyle>
            <Select placeholder="Month" options={MONTH_OPTIONS} aria-label={`${label} month`} />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name={`${prefix}day`} rules={rules} noStyle>
            <InputNumber min={1} max={30} style={{ width: '100%' }} placeholder="Day" aria-label={`${label} day`} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name={`${prefix}year`} rules={rules} noStyle>
            <Select placeholder="Year" options={YEAR_OPTIONS} aria-label={`${label} year`} />
          </Form.Item>
        </Col>
      </Row>
    </Form.Item>
  );
}
