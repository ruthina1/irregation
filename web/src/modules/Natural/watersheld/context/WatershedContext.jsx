import React, { createContext, useContext, useState, useMemo } from 'react';

// ───── SEED DATA MATCHING MoA SECTIONS 4.1 - 4.3.7 ─────
const INITIAL_WATERSHEDS = [
  {
    id: 'WS-001',
    code: 'WS-AW-01',
    name: 'Upper Awash Catchment (አዋሽ ተፋሰስ)',
    region: 'Oromia',
    zone: 'East Shewa',
    woreda: 'Adama Rural',
    kebele: '01 Wonji',
    // 4.1.2 Status: 'existing' (ነባር) or 'new' (አዲስ)
    status: 'existing',
    start_year: 2018,
    total_area_ha: 1450,
    supporting_program: 'SLMP-II',
    location: { lat: 8.54, lng: 39.27 },

    // 4.2 Labor & Tools
    labor_male: 420,
    labor_female: 380,
    trained_farmers: 45,
    development_tools: 650,
    surveying_tools: 18,

    // 4.3.1 Farmland SWC (km)
    soil_bunds_km: 18.5,
    fanya_juu_km: 12.0,
    bund_upgrades_km: 7.2,

    // 4.3.2 Flood & Runoff Excavation (m³)
    cutoff_drains_m3: 3400,
    waterways_m3: 1850,

    // 4.3.3 Area Closure & Hillside SWC
    area_closure_ha: 220,
    hillside_terraces_km: 14.8,
    trenched_terraces_km: 8.2,
    bench_terraces_km: 5.4,

    // 4.3.4 Moisture Retention Structures (Counts)
    trenches_count: 1400,
    percolation_trenches_count: 520,
    micro_basins_count: 3200,
    eyebrow_basins_count: 1100,

    // 4.3.3 (2nd) & 4.3.4 (2nd) Gully & Riverbank Rehab
    gully_identified_ha: 42,
    check_dams_m3: 890,
    gully_reshaping_m3: 1450,
    riverbank_demarcated_km: 6.5,
    riverbank_reshaping_m3: 620,

    // 4.3.5 Invasive Weeds (Ha)
    weed_water_hyacinth_ha: 12.4,
    weed_lantana_camara_ha: 8.5,
    weed_other_ha: 3.1,

    // 4.3.7 Maintenance & Repairs
    maint_soil_bunds_km: 4.8,
    maint_bench_terraces_km: 1.5,
    maint_hillside_terraces_km: 3.2,
    maint_cutoff_drains_m3: 540,
    maint_waterways_m3: 420,
    maint_check_dams_m3: 310
  },
  {
    id: 'WS-002',
    code: 'WS-TN-04',
    name: 'Lake Tana Sub-Basin (ጣና ንዑስ ተፋሰስ)',
    region: 'Amhara',
    zone: 'South Gondar',
    woreda: 'Fogera',
    kebele: 'Woreta Zuria',
    status: 'new',
    start_year: 2024,
    total_area_ha: 980,
    supporting_program: 'CALM',
    location: { lat: 11.92, lng: 37.62 },

    labor_male: 310,
    labor_female: 290,
    trained_farmers: 28,
    development_tools: 420,
    surveying_tools: 12,

    soil_bunds_km: 11.2,
    fanya_juu_km: 8.4,
    bund_upgrades_km: 3.5,

    cutoff_drains_m3: 2100,
    waterways_m3: 1300,

    area_closure_ha: 140,
    hillside_terraces_km: 9.6,
    trenched_terraces_km: 5.1,
    bench_terraces_km: 3.2,

    trenches_count: 980,
    percolation_trenches_count: 310,
    micro_basins_count: 1800,
    eyebrow_basins_count: 750,

    gully_identified_ha: 26,
    check_dams_m3: 560,
    gully_reshaping_m3: 880,
    riverbank_demarcated_km: 4.2,
    riverbank_reshaping_m3: 410,

    weed_water_hyacinth_ha: 24.6,
    weed_lantana_camara_ha: 4.2,
    weed_other_ha: 1.8,

    maint_soil_bunds_km: 2.1,
    maint_bench_terraces_km: 0.8,
    maint_hillside_terraces_km: 1.6,
    maint_cutoff_drains_m3: 320,
    maint_waterways_m3: 210,
    maint_check_dams_m3: 180
  },
  {
    id: 'WS-003',
    code: 'WS-SD-02',
    name: 'Gidabo River Catchment (ጊዳቦ ተፋሰስ)',
    region: 'Sidama',
    zone: 'Dilla Zuria',
    woreda: 'Wonsho',
    kebele: 'Bokaso',
    status: 'existing',
    start_year: 2021,
    total_area_ha: 820,
    supporting_program: 'RLLP',
    location: { lat: 6.81, lng: 38.48 },

    labor_male: 260,
    labor_female: 275,
    trained_farmers: 22,
    development_tools: 380,
    surveying_tools: 9,

    soil_bunds_km: 9.8,
    fanya_juu_km: 6.5,
    bund_upgrades_km: 2.4,

    cutoff_drains_m3: 1650,
    waterways_m3: 980,

    area_closure_ha: 95,
    hillside_terraces_km: 7.4,
    trenched_terraces_km: 4.2,
    bench_terraces_km: 2.8,

    trenches_count: 720,
    percolation_trenches_count: 240,
    micro_basins_count: 1450,
    eyebrow_basins_count: 620,

    gully_identified_ha: 18,
    check_dams_m3: 420,
    gully_reshaping_m3: 710,
    riverbank_demarcated_km: 3.8,
    riverbank_reshaping_m3: 320,

    weed_water_hyacinth_ha: 3.2,
    weed_lantana_camara_ha: 6.1,
    weed_other_ha: 2.4,

    maint_soil_bunds_km: 1.8,
    maint_bench_terraces_km: 0.6,
    maint_hillside_terraces_km: 1.2,
    maint_cutoff_drains_m3: 210,
    maint_waterways_m3: 160,
    maint_check_dams_m3: 140
  }
];

const WatershedContext = createContext(null);

export function WatershedProvider({ children }) {
  const [records, setRecords] = useState(INITIAL_WATERSHEDS);
  const [selectedWatershed, setSelectedWatershed] = useState(INITIAL_WATERSHEDS[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  // ───── CRUD OPERATIONS ─────
  const addOrUpdateRecord = (data) => {
    if (editingRecord) {
      const updated = { ...editingRecord, ...data };
      setRecords((prev) =>
        prev.map((r) => (r.id === editingRecord.id ? updated : r))
      );
      if (selectedWatershed?.id === editingRecord.id) {
        setSelectedWatershed(updated);
      }
    } else {
      const newRec = {
        ...data,
        id: `WS-${String(records.length + 1).padStart(3, '0')}`,
        code: data.code || `WS-ET-${String(records.length + 1).padStart(2, '0')}`
      };
      setRecords((prev) => [newRec, ...prev]);
      setSelectedWatershed(newRec);
    }
    setIsModalOpen(false);
    setEditingRecord(null);
  };

  const deleteRecord = (id) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
    if (selectedWatershed?.id === id) {
      setSelectedWatershed(records[0] || null);
    }
  };

  // ───── MODAL CONTROLS ─────
  const openCreateModal = () => {
    setEditingRecord(null);
    setIsModalOpen(true);
  };

  const openEditModal = (rec) => {
    setEditingRecord(rec);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRecord(null);
  };

  // ───── MEMOIZED CONTEXT VALUE ─────
  const value = useMemo(
    () => ({
      records,
      setRecords,
      selectedWatershed,
      setSelectedWatershed,
      isModalOpen,
      setIsModalOpen,
      editingRecord,
      openCreateModal,
      openEditModal,
      closeModal,
      addOrUpdateRecord,
      deleteRecord
    }),
    [records, selectedWatershed, isModalOpen, editingRecord]
  );

  return (
    <WatershedContext.Provider value={value}>
      {children}
    </WatershedContext.Provider>
  );
}

// ───── CUSTOM HOOK ─────
export function useWatershed() {
  const context = useContext(WatershedContext);
  if (!context) {
    throw new Error('useWatershed must be used within a WatershedProvider');
  }
  return context;
}

export default WatershedContext;