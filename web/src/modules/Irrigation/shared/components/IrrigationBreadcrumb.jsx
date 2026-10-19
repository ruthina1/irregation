import { Breadcrumb } from 'antd';
import '../irrigation.css';

/** Breadcrumb shown at the top of every Irrigation page (the page title lives in the navbar). */
export default function IrrigationBreadcrumb({ section, title }) {
  return (
    <Breadcrumb
      className="irr-breadcrumb"
      items={[
        { title: 'Irrigation' },
        { title: section },
        { title: typeof title === 'string' ? title.split('(')[0].trim() : title },
      ]}
    />
  );
}
