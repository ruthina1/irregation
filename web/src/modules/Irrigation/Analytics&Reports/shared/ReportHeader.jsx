import { Button } from 'antd';
import { DownloadOutlined, PrinterOutlined } from '@ant-design/icons';
import IrrigationPageHeader from '../../shared/components/IrrigationPageHeader';
import LoadErrorAlert from '../../shared/components/LoadErrorAlert';

/** Toolbar of every Irrigation report: filters (children), fiscal year, refresh, print and CSV export. */
export default function ReportHeader({
  section = 'Analytics & Reports', title, subtitle, report, printLabel = 'Print', exportLabel = 'Export CSV', onExport, children,
}) {
  return (
    <>
      <IrrigationPageHeader
        section={section}
        title={title}
        subtitle={subtitle}
        fiscalYear={report.fiscalYear}
        onFiscalYearChange={report.setFiscalYear}
        onRefresh={report.reload}
        loading={report.loading}
        extra={(
          <>
            <Button icon={<PrinterOutlined />} onClick={() => window.print()}>{printLabel}</Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={onExport}
              type="primary"
              style={{ backgroundColor: '#1a5f2c', borderColor: '#1a5f2c' }}
            >
              {exportLabel}
            </Button>
          </>
        )}
      >
        {children}
      </IrrigationPageHeader>
      <LoadErrorAlert error={report.error} onRetry={report.reload} />
    </>
  );
}
