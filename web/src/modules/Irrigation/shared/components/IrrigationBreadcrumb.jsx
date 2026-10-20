import { Breadcrumb } from 'antd';
import '../irrigation.css';

/** Breadcrumb shown at the top of every Irrigation page with right-aligned extra actions container. */
export default function IrrigationBreadcrumb({ section, title, extra }) {
  return (
    <div className="irr-breadcrumb-row">
      <Breadcrumb
        className="irr-breadcrumb"
        items={[
          { title: 'Irrigation' },
          { title: section },
          { title: typeof title === 'string' ? title.split('(')[0].trim() : title },
        ]}
      />
      <div id="irr-breadcrumb-extra" className="irr-breadcrumb-extra">
        {extra}
      </div>
    </div>
  );
}
