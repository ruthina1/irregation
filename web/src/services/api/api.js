import api from '../axios';
import { APP_PERMISSIONS, USER_PERMISSIONS, APPROVAL_PERMISSIONS } from './permission';

/**
 * Top-Level Module Permissions for Sidebar Navigation
 * Groups determine access to major sections of the IAIMS portal.
 */
export const MODULE_PERMISSIONS = {
  // 1. System Overview / Dashboard
  'dashboard': [APP_PERMISSIONS.VIEW_DASHBOARD],

  // 2. Analytics & Reports
  'analytics': [APP_PERMISSIONS.ANALYTICS_OVERVIEW],

  // 3. Extension & Farmer Services
  'extension': [
    APP_PERMISSIONS.MANAGE_FARMERS,
    APP_PERMISSIONS.MANAGE_FTC,
    APP_PERMISSIONS.MANAGE_WORKFORCE,
    APP_PERMISSIONS.MANAGE_EVENTS,
  ],

  // 4. Extension Communication & Digitalization
  'extension-digitalization': [
    APP_PERMISSIONS.MANAGE_MEDIA,
    APP_PERMISSIONS.MANAGE_FARMERS,
    APP_PERMISSIONS.MANAGE_WORKFORCE,
    APP_PERMISSIONS.MANAGE_CROPS,
    APP_PERMISSIONS.MANAGE_FTC,
  ],

  // 5. Watershed & SWC
  'watershed-swc': [
    APP_PERMISSIONS.MANAGE_WATERSHEDS,
    APP_PERMISSIONS.MANAGE_REHABILITATION,
  ],

  // 6. Irrigation Development & Drainage
  'irrigation-development': [
    APP_PERMISSIONS.MANAGE_IRRIGATION,
    APP_PERMISSIONS.MANAGE_LAND,
    APP_PERMISSIONS.MANAGE_CROPS,
  ],

  // 7. User Administration (UMAC)
  'user-admin': [
    APP_PERMISSIONS.VIEW_USERS,
    APP_PERMISSIONS.MANAGE_USERS,
    APP_PERMISSIONS.MANAGE_ROLES,
  ],
};

/**
 * Submodule Permissions for Sidebar Navigation (navigation.jsx & irrigationNavigation.jsx)
 * Keyed by router route path or group key.
 */
export const SUBMODULE_PERMISSIONS = {
  /* --- System Overview --- */
  '/dashboard': [APP_PERMISSIONS.VIEW_DASHBOARD],

  /* --- Analytics & Reports --- */
  'analytics': [APP_PERMISSIONS.ANALYTICS_OVERVIEW],
  '/analytics': [APP_PERMISSIONS.ANALYTICS_OVERVIEW],
  '/analytics/kpi': [APP_PERMISSIONS.ANALYTICS_OVERVIEW],
  '/analytics/production': [APP_PERMISSIONS.ANALYTICS_OVERVIEW, APP_PERMISSIONS.MANAGE_CROPS],
  '/analytics/extension': [APP_PERMISSIONS.ANALYTICS_OVERVIEW, APP_PERMISSIONS.MANAGE_FARMERS],
  '/reports': [APP_PERMISSIONS.ANALYTICS_OVERVIEW, APP_PERMISSIONS.VIEW_REPORTS],

  /* --- Extension & Farmer Services --- */
  'extension': [
    APP_PERMISSIONS.MANAGE_FARMERS,
    APP_PERMISSIONS.MANAGE_FTC,
    APP_PERMISSIONS.MANAGE_WORKFORCE,
    APP_PERMISSIONS.MANAGE_EVENTS,
  ],
  'farmers': [APP_PERMISSIONS.MANAGE_FARMERS],
  '/farmers': [APP_PERMISSIONS.MANAGE_FARMERS],
  '/farmers/transfer': [APP_PERMISSIONS.MANAGE_FARMERS, APP_PERMISSIONS.APPROVE_FARMER_TRANSFER],
  '/farmers/service-history': [APP_PERMISSIONS.MANAGE_FARMERS],
  '/ftc': [APP_PERMISSIONS.MANAGE_FTC],
  '/extension-experts': [APP_PERMISSIONS.MANAGE_WORKFORCE],
  '/events': [APP_PERMISSIONS.MANAGE_EVENTS],
  '/workforce': [APP_PERMISSIONS.MANAGE_WORKFORCE],
  '/farmer-feedback': [APP_PERMISSIONS.MANAGE_FARMERS],

  /* --- Extension Communication & Digitalization Submodules --- */
  'ext-comm': [APP_PERMISSIONS.MANAGE_MEDIA, APP_PERMISSIONS.MANAGE_FARMERS],
  '/extension/extension-users': [APP_PERMISSIONS.MANAGE_FARMERS],
  '/extension/kebele-das': [APP_PERMISSIONS.MANAGE_WORKFORCE],
  '/extension/full-package-farmers': [APP_PERMISSIONS.MANAGE_FARMERS],
  '/extension/model-farmers': [APP_PERMISSIONS.MANAGE_FARMERS],
  '/extension/sms-supervision': [APP_PERMISSIONS.MANAGE_MEDIA],
  '/extension/farmers-field-days': [APP_PERMISSIONS.MANAGE_EVENTS],
  '/extension/video-based-extension': [APP_PERMISSIONS.MANAGE_MEDIA],
  '/extension/hotline-advisory': [APP_PERMISSIONS.MANAGE_MEDIA],
  '/extension/radio-programs': [APP_PERMISSIONS.MANAGE_MEDIA],
  '/extension/extension-materials': [APP_PERMISSIONS.MANAGE_MEDIA],

  'ext-partners': [APP_PERMISSIONS.MANAGE_WORKFORCE, APP_PERMISSIONS.MANAGE_FARMERS],
  '/partners/extension/partner-registry': [APP_PERMISSIONS.MANAGE_WORKFORCE],
  '/partners/needs-assessment': [APP_PERMISSIONS.MANAGE_WORKFORCE],
  '/partners/platform-forums': [APP_PERMISSIONS.MANAGE_WORKFORCE],
  '/partners/consultative-forums': [APP_PERMISSIONS.MANAGE_WORKFORCE],
  '/partners/partner-activities': [APP_PERMISSIONS.MANAGE_WORKFORCE],

  'ext-organizations': [APP_PERMISSIONS.MANAGE_FARMERS, APP_PERMISSIONS.MANAGE_COOPERATIVE],
  '/organizations/sub-kebele-cadres': [APP_PERMISSIONS.MANAGE_WORKFORCE],
  '/organizations/development-groups': [APP_PERMISSIONS.MANAGE_FARMERS],
  '/organizations/development-work-teams': [APP_PERMISSIONS.MANAGE_WORKFORCE],
  '/organizations/commodity-clusters': [APP_PERMISSIONS.MANAGE_CROPS],
  '/organizations/large-scale-clusters': [APP_PERMISSIONS.MANAGE_CROPS],
  '/organizations/farmer-field-schools': [APP_PERMISSIONS.MANAGE_FTC],
  '/organizations/group-peer-learning': [APP_PERMISSIONS.MANAGE_EVENTS],
  '/organizations/project-mand-e': [APP_PERMISSIONS.ANALYTICS_OVERVIEW],
  '/organizations/scalable-practices': [APP_PERMISSIONS.MANAGE_FARMERS],

  'ext-demos': [APP_PERMISSIONS.MANAGE_CROPS, APP_PERMISSIONS.MANAGE_FTC],
  '/demonstrations/overview': [APP_PERMISSIONS.MANAGE_CROPS],
  '/demonstrations/adaptation-demos': [APP_PERMISSIONS.MANAGE_CROPS],
  '/demonstrations/promotional-demos': [APP_PERMISSIONS.MANAGE_CROPS],
  '/demonstrations/regular-ffs-demos': [APP_PERMISSIONS.MANAGE_FTC],
  '/demonstrations/demo-evaluations': [APP_PERMISSIONS.MANAGE_CROPS, APP_PERMISSIONS.APPROVE_CROP_REGISTRATION],

  'ext-ftc': [APP_PERMISSIONS.MANAGE_FTC],
  '/ftc/construction-upgrading': [APP_PERMISSIONS.MANAGE_FTC],
  '/ftc/da-residential-quarters': [APP_PERMISSIONS.MANAGE_FTC],
  '/ftc/equipment-auditing': [APP_PERMISSIONS.MANAGE_FTC],
  '/ftc/demonstration-land': [APP_PERMISSIONS.MANAGE_FTC, APP_PERMISSIONS.MANAGE_LAND],
  '/ftc/ict-integration': [APP_PERMISSIONS.MANAGE_FTC],
  '/ftc/model-kebele-creation': [APP_PERMISSIONS.MANAGE_FTC],
  '/ftc/da-specialist-training': [APP_PERMISSIONS.MANAGE_FTC, APP_PERMISSIONS.MANAGE_EVENTS],
  '/ftc/farmer-package-training': [APP_PERMISSIONS.MANAGE_FTC, APP_PERMISSIONS.MANAGE_EVENTS],
  '/ftc/management-committees': [APP_PERMISSIONS.MANAGE_FTC],
  '/ftc/experience-sharing': [APP_PERMISSIONS.MANAGE_FTC],
  '/ftc/academic-upgrades': [APP_PERMISSIONS.MANAGE_WORKFORCE],

  'ext-gender-youth': [APP_PERMISSIONS.MANAGE_FARMERS, APP_PERMISSIONS.MANAGE_WORKFORCE],
  '/gender/participation': [APP_PERMISSIONS.MANAGE_FARMERS],
  '/gender-hiv/appropriate-technologies': [APP_PERMISSIONS.MANAGE_MECHANIZATION],
  '/gender-hiv/gender-safeguard-training': [APP_PERMISSIONS.MANAGE_EVENTS],
  '/gender-hiv/female-staff-empowerment': [APP_PERMISSIONS.MANAGE_WORKFORCE],
  '/gender-hiv/model-families': [APP_PERMISSIONS.MANAGE_FARMERS],
  '/gender-hiv/child-daycare-support': [APP_PERMISSIONS.MANAGE_WORKFORCE],
  '/gender-hiv/hiv-prevention-fund': [APP_PERMISSIONS.MANAGE_WORKFORCE],
  '/gender-hiv/community-awareness': [APP_PERMISSIONS.MANAGE_EVENTS],
  '/gender-hiv/youth-agri-enterprises': [APP_PERMISSIONS.MANAGE_FARMERS],
  '/gender-hiv/employment-creation': [APP_PERMISSIONS.MANAGE_WORKFORCE],

  'ext-colleges': [APP_PERMISSIONS.MANAGE_WORKFORCE, APP_PERMISSIONS.MANAGE_FTC],
  '/colleges/registry': [APP_PERMISSIONS.MANAGE_WORKFORCE],
  '/colleges/student-enrollment': [APP_PERMISSIONS.MANAGE_WORKFORCE],
  '/colleges/staff-registry': [APP_PERMISSIONS.MANAGE_WORKFORCE],
  '/colleges/infrastructure-farms': [APP_PERMISSIONS.MANAGE_WORKFORCE],
  '/colleges/curriculum-extension': [APP_PERMISSIONS.MANAGE_WORKFORCE],
  '/colleges/research-technology': [APP_PERMISSIONS.MANAGE_WORKFORCE],
  '/colleges/college-regulations': [APP_PERMISSIONS.MANAGE_WORKFORCE],
  '/colleges/pedagogical-training': [APP_PERMISSIONS.MANAGE_EVENTS],
  '/colleges/supervision-audits': [APP_PERMISSIONS.MANAGE_WORKFORCE],
  '/colleges/university-linkages': [APP_PERMISSIONS.MANAGE_WORKFORCE],
  '/colleges/governance-readiness': [APP_PERMISSIONS.MANAGE_WORKFORCE],

  /* --- Watershed & SWC Submodules --- */
  'watershed-swc': [APP_PERMISSIONS.MANAGE_WATERSHEDS],
  '/watershed/dashboard': [APP_PERMISSIONS.MANAGE_WATERSHEDS],
  '/watershed/registry': [APP_PERMISSIONS.MANAGE_WATERSHEDS],
  '/watershed/drainage': [APP_PERMISSIONS.MANAGE_WATERSHEDS],
  '/watershed/mobilization': [APP_PERMISSIONS.MANAGE_WATERSHEDS],
  '/watershed/soil-water-conservation': [APP_PERMISSIONS.MANAGE_WATERSHEDS],
  '/watershed/Moisture': [APP_PERMISSIONS.MANAGE_WATERSHEDS],
  '/watershed/rehabilitation': [APP_PERMISSIONS.MANAGE_WATERSHEDS, APP_PERMISSIONS.MANAGE_REHABILITATION],
  '/watershed/invasive-weeds': [APP_PERMISSIONS.MANAGE_WATERSHEDS],
  '/watershed/maintenance': [APP_PERMISSIONS.MANAGE_WATERSHEDS],
  '/watershed/hillside-structures': [APP_PERMISSIONS.MANAGE_WATERSHEDS],

  /* --- Irrigation Development & Drainage Submodules --- */
  'irrigation-development': [APP_PERMISSIONS.MANAGE_IRRIGATION],
  '/irrigation/reports/directorate-master': [APP_PERMISSIONS.MANAGE_IRRIGATION, APP_PERMISSIONS.VIEW_REPORTS],
  'irrigation-study-design': [APP_PERMISSIONS.MANAGE_IRRIGATION, APP_PERMISSIONS.MANAGE_STUDY_DESIGN],
  '/irrigation/study-design/dashboard': [APP_PERMISSIONS.MANAGE_IRRIGATION],
  '/irrigation/study-design/project-identification': [APP_PERMISSIONS.MANAGE_IRRIGATION],
  '/irrigation/study-design/projects': [APP_PERMISSIONS.MANAGE_IRRIGATION],
  '/irrigation/study-design/document-review': [APP_PERMISSIONS.MANAGE_IRRIGATION, APP_PERMISSIONS.APPROVE_STUDY_DESIGN],
  '/irrigation/study-design/quality-assurance': [APP_PERMISSIONS.MANAGE_IRRIGATION, APP_PERMISSIONS.APPROVE_STUDY_DESIGN],
  '/irrigation/study-design/construction-ready': [APP_PERMISSIONS.MANAGE_IRRIGATION],
  '/irrigation/study-design/capacity-building': [APP_PERMISSIONS.MANAGE_IRRIGATION],
  '/irrigation/reports/study-design': [APP_PERMISSIONS.MANAGE_IRRIGATION, APP_PERMISSIONS.VIEW_REPORTS],

  'irrigation-construction': [APP_PERMISSIONS.MANAGE_IRRIGATION, APP_PERMISSIONS.MANAGE_IRRIGATION_CONSTRUCTION],
  '/irrigation/construction/projects': [APP_PERMISSIONS.MANAGE_IRRIGATION],
  '/irrigation/construction/progress': [APP_PERMISSIONS.MANAGE_IRRIGATION],
  '/irrigation/construction/completion': [APP_PERMISSIONS.MANAGE_IRRIGATION, APP_PERMISSIONS.APPROVE_CONSTRUCTION],
  '/irrigation/construction/funding': [APP_PERMISSIONS.MANAGE_IRRIGATION],
  '/irrigation/construction/benefits': [APP_PERMISSIONS.MANAGE_IRRIGATION],
  '/irrigation/reports/construction': [APP_PERMISSIONS.MANAGE_IRRIGATION, APP_PERMISSIONS.VIEW_REPORTS],
  '/irrigation/reports/beneficiaries': [APP_PERMISSIONS.MANAGE_IRRIGATION, APP_PERMISSIONS.VIEW_REPORTS],

  'irrigation-institutions': [APP_PERMISSIONS.MANAGE_IRRIGATION, APP_PERMISSIONS.MANAGE_IRRIGATION_INSTITUTIONS],
  '/irrigation/institutions/water-users-associations': [APP_PERMISSIONS.MANAGE_IRRIGATION],
  '/irrigation/institutions/assessment-audit': [APP_PERMISSIONS.MANAGE_IRRIGATION],
  '/irrigation/institutions/capacity-building': [APP_PERMISSIONS.MANAGE_IRRIGATION],
  '/irrigation/institutions/infrastructure-maintenance': [APP_PERMISSIONS.MANAGE_IRRIGATION, APP_PERMISSIONS.APPROVE_IRRIGATION_MAINTENANCE],
  '/irrigation/reports/institutions': [APP_PERMISSIONS.MANAGE_IRRIGATION, APP_PERMISSIONS.VIEW_REPORTS],

  'irrigation-water-utilization': [APP_PERMISSIONS.MANAGE_IRRIGATION, APP_PERMISSIONS.MANAGE_WATER_UTILIZATION],
  '/irrigation/water-utilization/overview': [APP_PERMISSIONS.MANAGE_IRRIGATION],
  '/irrigation/water-utilization/irrigated-area': [APP_PERMISSIONS.MANAGE_IRRIGATION],
  '/irrigation/water-utilization/irrigation-systems': [APP_PERMISSIONS.MANAGE_IRRIGATION],
  '/irrigation/water-utilization/water-sources': [APP_PERMISSIONS.MANAGE_IRRIGATION],
  '/irrigation/reports/water-utilization': [APP_PERMISSIONS.MANAGE_IRRIGATION, APP_PERMISSIONS.VIEW_REPORTS],

  'irrigation-crop-production': [APP_PERMISSIONS.MANAGE_IRRIGATION, APP_PERMISSIONS.MANAGE_CROP_PRODUCTION],
  '/irrigation/production/overview': [APP_PERMISSIONS.MANAGE_IRRIGATION, APP_PERMISSIONS.MANAGE_CROP_PRODUCTION],
  '/irrigation/production/seasonal-production': [APP_PERMISSIONS.MANAGE_IRRIGATION, APP_PERMISSIONS.MANAGE_CROP_PRODUCTION],
  '/irrigation/production/summer-wheat': [APP_PERMISSIONS.MANAGE_IRRIGATION, APP_PERMISSIONS.MANAGE_CROP_PRODUCTION],
  '/irrigation/reports/production': [APP_PERMISSIONS.MANAGE_IRRIGATION, APP_PERMISSIONS.VIEW_REPORTS],

  '/irrigation/inputs': [APP_PERMISSIONS.MANAGE_IRRIGATION, APP_PERMISSIONS.MANAGE_INPUTS],

  /* --- User Administration (UMAC) Submodules --- */
  'user-admin': [APP_PERMISSIONS.VIEW_USERS, APP_PERMISSIONS.MANAGE_USERS, APP_PERMISSIONS.MANAGE_ROLES],
  '/umac': [APP_PERMISSIONS.VIEW_USERS, APP_PERMISSIONS.MANAGE_USERS],
  '/roles': [APP_PERMISSIONS.MANAGE_ROLES],
};

/**
 * Helper to check if a user has access to a sidebar item or module.
 * 
 * @param {string[]} userPermissions - User's granted permissions array
 * @param {string} itemKey - Route key or group key
 * @param {boolean} isSuperAdmin - Whether user is SuperAdmin (bypasses all checks)
 * @returns {boolean}
 */
export const canAccessSidebarItem = (userPermissions = [], itemKey, isSuperAdmin = false) => {
  if (isSuperAdmin) return true;
  const required = SUBMODULE_PERMISSIONS[itemKey] || MODULE_PERMISSIONS[itemKey];
  if (!required || required.length === 0) return true;
  return required.some((perm) => userPermissions.includes(perm));
};

/**
 * Retrieve permissions required for a module or submodule
 * 
 * @param {string} key - Module or submodule key
 * @returns {string[]} Required permissions array
 */
export const getSidebarPermissions = (key) => {
  return SUBMODULE_PERMISSIONS[key] || MODULE_PERMISSIONS[key] || [];
};

// Re-export detailed permissions for convenience
export { APP_PERMISSIONS, USER_PERMISSIONS, APPROVAL_PERMISSIONS };

// Default export is the axios API client for compatibility
export default api;
