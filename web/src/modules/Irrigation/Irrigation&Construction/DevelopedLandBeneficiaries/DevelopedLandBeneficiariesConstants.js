/**
 * Shared constants and helpers for Developed Land & Beneficiaries module.
 * Extracted to avoid circular dependencies with component files.
 */

/* --- Scheme Type (Excel Aligned) --- */
export const SCHEME_TYPES = [
  { value: 'Existing Rehabilitation', label: 'Existing Scheme Rehabilitation (የነባር መስኖ ግንባታ)' },
  { value: 'New Construction', label: 'New Scheme Construction (የአዲስ መስኖ ግንባታ)' },
];

/* --- Specific Financing & Program Sources (Excel Aligned) --- */
export const FUNDING_PROGRAMS = [
  'Regional Government Capital Budget (በክልል መንግስት በጀት)',
  'Federal Government Budget (በፌደራል መንግስት በጀት)',
  'PACT Program (በPACT በጀት)',
  'FSRP Program (በFSRP በጀት)',
  'Lease / Direct Support Financing (በኪራይ/ግልጽ ድጋፍ)',
  'Green Climate Fund (GCF) (በGCF በጀት)',
  'DRDIP Project (በDRDIP በጀት)',
  'CREW Project (በCREW በጀት)',
  'CRIPS Project (በCRIPS በጀት)',
];

/* --- Land Operational Status --- */
export const BENEFIT_STATUSES = [
  { value: 'Fully Operational', label: 'Fully Operational (100% Irrigated)', color: 'success' },
  { value: 'Partially Irrigated', label: 'Partially Irrigated (Phase 1 Ready)', color: 'processing' },
  { value: 'Command Developed (Pre-Watering)', label: 'Command Developed (Pre-Watering)', color: 'default' },
  { value: 'Under Land Levelling', label: 'Under Secondary Canal & Plot Levelling', color: 'warning' },
];

/* --- Standardized Crop Catalog Grouped by Domain (Excel Aligned) --- */
export const CROP_CATALOG_GROUPS = [
  {
    category: 'Cereals (አዝርዕት)',
    crops: [
      'Highland Irrigated Wheat (የደጋ ስንዴ)',
      'Lowland / Summer Wheat (የቆላ ስንዴ)',
      'Hybrid Maize (በቆሎ)',
      'Irrigated Teff (ጤፍ)',
      'Barley (ገብስ)',
      'Rice (ሩዝ)',
    ],
  },
  {
    category: 'Pulses & Oilseeds (ጥራጥሬና የቅባት እህሎች)',
    crops: ['Chickpea (ሽንብራ)', 'Lentils (ምስር)', 'Faba Bean (ባቄላ)', 'Haricot Bean (ቦሎቄ)', 'Soybean (አኩሪ አተር)', 'Sesame (ሰሊጥ)'],
  },
  {
    category: 'Vegetables & Spices (አትክልትና ቅመማ ቅመም)',
    crops: [
      'Red Onion (ቀይ ሽንኩርት)',
      'Garlic (ነጭ ሽንኩርት)',
      'Tomato (ቲማቲም)',
      'Potato (ድንች)',
      'Green Pepper / Chili (ቃሪያ/በርበሬ)',
      'Cabbage (ጎመን)',
      'Carrot (ካሮት)',
    ],
  },
  {
    category: 'Fruits & Forage (ፍራፍሬ እና መኖ)',
    crops: ['Avocado (አቮካዶ)', 'Mango (ማንጎ)', 'Papaya (ፓፓያ)', 'Highland Apple (ፖም)', 'Animal Forage / Rhodes Grass (የእንስሳት መኖ)'],
  },
];

/** Defaults for a new field verification. */
export const NEW_BENEFIT_DEFAULTS = {
  scheme_type: 'New Construction',
  funding_source: 'PACT Program (በPACT በጀት)',
  cropping_intensity_ratio: 2.0,
  primary_crops_cultivated: ['Highland Irrigated Wheat (የደጋ ስንዴ)'],
};

/** primary_crops_cultivated is an array on the server; tolerate legacy comma strings. */
export const cropList = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string') return value.split(',').map((c) => c.trim()).filter(Boolean);
  return [];
};
