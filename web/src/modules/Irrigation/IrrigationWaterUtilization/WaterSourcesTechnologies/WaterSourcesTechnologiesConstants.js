/**
 * Shared constants and helpers for Water Sources & Technologies module.
 * Extracted to avoid circular dependencies with component files.
 */

/* --- Water Sources & Abstraction Technologies (100% Excel Aligned) --- */
export const TECHNOLOGY_CATALOG_GROUPS = [
  {
    category: 'Surface Water & Gravity Diversion (የወንዝ ጠለፋና ምንጭ)',
    options: [
      'Modern River Diversion Weir (ዘመናዊ የወንዝ ጠለፋ)',
      'Traditional Brushwood Diversion (ባህላዊ የወንዝ ጠለፋ)',
      'Spring Development & Collection Chamber (ምንጭ ማጎልበት)',
    ],
  },
  {
    category: 'Pumping & Lift Technologies (የውሃ መሳቢያ ፓምፖች)',
    options: [
      'Solar-Powered Pump (የፀሐይ ፓምፕ)',
      'Motorized Fuel Pump (ሞተር ፓምፕ)',
      'Centrifugal / CT Pump (CT ፓምፕ)',
      'Electric Grid Connected Pump',
    ],
  },
  {
    category: 'Groundwater Wells (የከርሰ-ምድር ጉድጓዶች)',
    options: [
      'Deep Borehole Well (ጥልቅ ዌል)',
      'Shallow Tube Well (ጥልቀት የሌለው ጉድጓድ)',
      'Hand-Dug Well (የእጅ ውሃ ጉድጓድ)',
    ],
  },
  {
    category: 'Storage Ponds & Linings (የውሃ ማጠራቀሚያ ኩሬዎች)',
    options: [
      'Geomembrane-Lined Pond (ጀኦሜምብራን ሻሸ)',
      'Concrete-Lined Pond (ኮንክሪት ሻሸ)',
      'Community Earth Reservoir (የማህበረሰብ ኩሬ)',
    ],
  },
];

/* --- Technology Operational Status --- */
export const TECHNOLOGY_STATUSES = [
  { value: 'Functional & Operating', label: 'Functional & Operating', color: 'success' },
  { value: 'Operating at Low Discharge', label: 'Operating at Low Discharge (Dry Season)', color: 'warning' },
  { value: 'Requires Maintenance / Spare Parts', label: 'Under Breakdown / Needs Spares', color: 'error' },
  { value: 'Under Installation', label: 'Under Installation / Drilling', color: 'processing' },
];

export const SOURCE_COLORS = ['#1a5f2c', '#5b8a6b', '#a16207', '#64748b'];

export const NEW_SOURCE_DEFAULTS = {
  technology_type: 'Solar-Powered Pump (የፀሐይ ፓምፕ)',
  equipment_units_count: 1,
  discharge_capacity_liters_sec: 45,
  command_area_served_ha: 100,
  energy_source: 'Solar Photovoltaic (PV)',
  farmers_male: 80,
  farmers_female: 25,
};

export const isSolar = (tech = '') => tech.includes('Solar') || tech.includes('ፀሐይ');
export const isDeepWell = (tech = '') => tech.includes('Deep') || tech.includes('ጥልቅ');

export const technologyColor = (tech = '') => {
  if (isSolar(tech)) return 'default';
  if (isDeepWell(tech)) return 'default';
  if (tech.includes('Pond') || tech.includes('ሻሸ')) return 'default';
  if (tech.includes('Motor') || tech.includes('ሞተር')) return 'orange';
  return 'default';
};
