import { Button, Input, Select } from 'antd';
import { DownloadOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import FilterBar from '../../shared/components/FilterBar';
import { CROPPING_ROUNDS, SCHEME_LAND_MODALITIES, WATER_ADEQUACY_STATUSES } from './IrrigatedLandUtilizationManagement';

export default function UtilizationFilters({
  searchTerm, onSearchChange, roundFilter, onRoundChange, modalityFilter, onModalityChange,
  adequacyFilter, onAdequacyChange, onExport, onCreate,
}) {
  return (
    <FilterBar
      filters={(
        <>
          <Input
            placeholder="Search Scheme, Code, Crops, Woreda..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{ width: 250 }}
            allowClear
          />
          <Select
            placeholder="Cropping Round"
            value={roundFilter}
            onChange={onRoundChange}
            style={{ width: 180 }}
            allowClear
            options={CROPPING_ROUNDS.map((r) => ({ value: r.value, label: r.value }))}
          />
          <Select
            placeholder="Land Modality"
            value={modalityFilter}
            onChange={onModalityChange}
            style={{ width: 210 }}
            allowClear
            options={SCHEME_LAND_MODALITIES.map((m) => ({ value: m.value, label: m.label.split('(')[0] }))}
          />
          <Select
            placeholder="Water Adequacy Status"
            value={adequacyFilter}
            onChange={onAdequacyChange}
            style={{ width: 200 }}
            allowClear
            options={WATER_ADEQUACY_STATUSES.map((s) => ({ value: s.value, label: s.label.split('(')[0] }))}
          />
        </>
      )}
      actions={(
        <>
          <Button icon={<DownloadOutlined />} onClick={onExport}>Export Ledger</Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onCreate}
            style={{ backgroundColor: '#1a5f2c', borderColor: '#1a5f2c', fontWeight: 600 }}
          >
            Log Land Utilization
          </Button>
        </>
      )}
    />
  );
}
