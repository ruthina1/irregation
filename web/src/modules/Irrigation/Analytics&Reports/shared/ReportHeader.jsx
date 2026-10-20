import { Button, Dropdown, Input, Segmented, Space } from 'antd';
import {
  BarChartOutlined,
  DownOutlined,
  DownloadOutlined,
  PrinterOutlined,
  SearchOutlined,
  TableOutlined,
} from '@ant-design/icons';
import IrrigationPageHeader from '../../shared/components/IrrigationPageHeader';
import LoadErrorAlert from '../../shared/components/LoadErrorAlert';
import { ZoneSelect } from './ZoneBarChart';

/** Toolbar of every Irrigation report: search & filters (left), fiscal year, export dropdown, and view toggle (right). */
export default function ReportHeader({
  section = 'Analytics & Reports',
  title,
  subtitle,
  report,
  printLabel = 'Print',
  exportLabel = 'Export CSV',
  onExport,
  viewMode,
  onViewModeChange,
  zones: propZones,
  selectedZone: propSelectedZone,
  onZoneChange: propOnZoneChange,
  zonePlaceholder = 'Filter All Charts by Zone',
  allZoneLabel = 'All Zones (ሁሉንም ዞኖች)',
  children,
}) {
  const rawMode = viewMode ?? report?.viewMode ?? 'charts';
  const currentViewMode = rawMode === 'table' ? 'table' : 'charts';
  const handleViewModeChange = onViewModeChange ?? report?.setViewMode;

  const showTableActions = currentViewMode === 'table';

  const zones = propZones ?? report?.zones ?? [];
  const selectedZone = propSelectedZone ?? report?.selectedZone ?? 'all';
  const onZoneChange = propOnZoneChange ?? report?.setSelectedZone;

  const exportMenuItems = [
    {
      key: 'print',
      icon: <PrinterOutlined />,
      label: printLabel || 'Print',
      onClick: () => window.print(),
    },
    {
      key: 'csv',
      icon: <DownloadOutlined />,
      label: exportLabel || 'Export CSV',
      onClick: onExport,
    },
  ];

  return (
    <>
      <IrrigationPageHeader
        section={section}
        title={title}
        subtitle={subtitle}
        fiscalYear={report?.fiscalYear}
        onFiscalYearChange={report?.setFiscalYear}
        onRefresh={report?.reload}
        loading={report?.loading}
        extra={(
          <Space wrap size="middle">
            {showTableActions && (
              <Dropdown
                menu={{ items: exportMenuItems }}
                trigger={['click']}
                placement="bottomRight"
              >
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  style={{
                    backgroundColor: '#1a5f2c',
                    borderColor: '#1a5f2c',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span>Export</span>
                  <DownOutlined style={{ fontSize: 11 }} />
                </Button>
              </Dropdown>
            )}
            {handleViewModeChange && (
              <Segmented
                value={currentViewMode}
                onChange={handleViewModeChange}
                options={[
                  { label: 'Graph', value: 'charts', icon: <BarChartOutlined /> },
                  { label: 'Table', value: 'table', icon: <TableOutlined /> },
                ]}
              />
            )}
          </Space>
        )}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: '1 1 auto', minWidth: 0 }}>
          <Input
            placeholder="Search report..."
            prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
            value={report?.searchTerm ?? ''}
            onChange={(e) => report?.setSearchTerm?.(e.target.value)}
            allowClear
            style={{ flex: '1 1 auto', width: '100%', minWidth: 160, borderRadius: 8 }}
            className="irr-toolbar-search"
          />
          {currentViewMode === 'charts' && Array.isArray(zones) && zones.length > 0 && onZoneChange && (
            <ZoneSelect
              zones={zones}
              value={selectedZone}
              onChange={onZoneChange}
              placeholder={zonePlaceholder}
              allLabel={allZoneLabel}
              style={{ width: 230, minWidth: 190, flexShrink: 0 }}
            />
          )}
          {children}
        </div>
      </IrrigationPageHeader>
      <LoadErrorAlert error={report?.error} onRetry={report?.reload} />
    </>
  );
}

