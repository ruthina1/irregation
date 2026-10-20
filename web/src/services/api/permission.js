/**
 * Detailed System Permissions for IAIMS Platform
 * 
 * Defines granular action-level permissions including:
 * - User Administration: view user, manage user, create user, edit user, delete user
 * - Approvals & Rejections: approve and reject actions across all domains
 * - Operational & Domain Actions across all modules
 */

// 1. User Management & Access Control (UMAC) Granular Permissions
export const USER_PERMISSIONS = {
  VIEW_USERS: 'view-users',
  MANAGE_USERS: 'manage-users',
  CREATE_USER: 'create-users',
  EDIT_USER: 'edit-users',
  DELETE_USER: 'delete-users',
  TOGGLE_USER_STATUS: 'toggle-user-status',
  VERIFY_USER_EMAIL: 'verify-user-email',
  
  // Approvals & Rejections for Users
  APPROVE_USER: 'approve-user',
  REJECT_USER: 'reject-user',

  // Role Management
  VIEW_ROLES: 'view-roles',
  MANAGE_ROLES: 'manage-roles',
  CREATE_ROLE: 'create-roles',
  EDIT_ROLE: 'edit-roles',
  DELETE_ROLE: 'delete-roles',
  ASSIGN_PERMISSIONS: 'assign-permissions',
};

// 2. Action Approvals & Rejections across Modules
export const APPROVAL_PERMISSIONS = {
  // User Approvals
  APPROVE_USER: 'approve-user',
  REJECT_USER: 'reject-user',

  // Natural Resource & Forestry
  APPROVE_NURSERY: 'approve-nursery',
  REJECT_NURSERY: 'reject-nursery',
  APPROVE_REHABILITATION: 'approve-rehabilitation',
  REJECT_REHABILITATION: 'reject-rehabilitation',

  // Agronomy & Seed
  APPROVE_CROP_REGISTRATION: 'approve-crop-registration',
  REJECT_CROP_REGISTRATION: 'reject-crop-registration',
  APPROVE_SEED_REGISTRATION: 'approve-seed-registration',
  REJECT_SEED_REGISTRATION: 'reject-seed-registration',
  APPROVE_SEED_PRODUCTION: 'approve-seed-production',
  REJECT_SEED_PRODUCTION: 'reject-seed-production',

  // Irrigation & Engineering
  APPROVE_IRRIGATION_MAINTENANCE: 'approve-irrigation-maintenance',
  REJECT_IRRIGATION_MAINTENANCE: 'reject-irrigation-maintenance',
  APPROVE_STUDY_DESIGN: 'approve-study-design',
  REJECT_STUDY_DESIGN: 'reject-study-design',
  APPROVE_CONSTRUCTION: 'approve-construction',
  REJECT_CONSTRUCTION: 'reject-construction',
  APPROVE_WATER_PROJECT: 'approve-water-project',
  REJECT_WATER_PROJECT: 'reject-water-project',

  // Horticulture & Mechanization
  APPROVE_HORTICULTURE: 'approve-horticulture',
  REJECT_HORTICULTURE: 'reject-horticulture',
  APPROVE_MECHANIZATION: 'approve-mechanization',
  REJECT_MECHANIZATION: 'reject-mechanization',

  // Farmer & PSNP Transfers
  APPROVE_FARMER_TRANSFER: 'approve-farmer-transfer',
  REJECT_FARMER_TRANSFER: 'reject-farmer-transfer',
  APPROVE_PSNP_TRANSFER: 'approve-psnp-transfer',
  REJECT_PSNP_TRANSFER: 'reject-psnp-transfer',
  APPROVE_DOCUMENT: 'approve-document',
  REJECT_DOCUMENT: 'reject-document',
};

// 3. Complete Application Permissions Registry (APP_PERMISSIONS)
// Compatible with all route guards, components, and backend Spatie permissions
export const APP_PERMISSIONS = {
  // UMAC & Authentication
  VIEW_USERS: 'view-dashboards', 
  VIEW_USERS_DETAILED: 'view-users',
  MANAGE_USERS: 'manage-users',
  CREATE_USER: 'create-users',
  EDIT_USER: 'edit-users',
  DELETE_USER: 'delete-users',
  APPROVE_USER: 'approve-user',
  REJECT_USER: 'reject-user',
  VIEW_ROLES: 'view-roles',
  MANAGE_ROLES: 'manage-roles',

  // Dashboards & Analytics
  VIEW_DASHBOARD: 'view-dashboards',
  VIEW_DASHBOARDS: 'view-dashboards',
  ANALYTICS_OVERVIEW: 'view-analytics',
  VIEW_REPORTS: 'view-reports',
  MANAGE_PLAN: 'manage-plan',

  // Extension & Farmer Services
  MANAGE_FARMERS: 'register-farmers',
  VIEW_FARMERS: 'view-farmers',
  APPROVE_FARMER_TRANSFER: 'approve-farmer-transfer',
  REJECT_FARMER_TRANSFER: 'reject-farmer-transfer',
  MANAGE_FTC: 'manage-ftcs',
  VIEW_FTC: 'view-ftcs',
  MANAGE_EVENTS: 'manage-events',
  VIEW_EVENTS: 'view-events',
  MANAGE_WORKFORCE: 'manage-workforce',
  VIEW_WORKFORCE: 'view-workforce',
  MANAGE_COOPERATIVE: 'manage-cooperative',
  MANAGE_MEDIA: 'manage-media',

  // Natural Resources & Watershed Management
  MANAGE_WATERSHEDS: 'manage-watersheds',
  VIEW_WATERSHEDS: 'view-watersheds',
  MANAGE_LAND: 'land.manage',
  MANAGE_GEO: 'geo.manage',
  MANAGE_FOREST: 'manage-forest',
  MANAGE_NURSERIES: 'manage-nurseries',
  APPROVE_NURSERY: 'approve-nursery',
  REJECT_NURSERY: 'reject-nursery',
  MANAGE_REHABILITATION: 'manage-rehabilitation',
  APPROVE_REHABILITATION: 'approve-rehabilitation',
  REJECT_REHABILITATION: 'reject-rehabilitation',

  // Crops, Seeds & Agronomy
  MANAGE_CROPS: 'manage-crops',
  MANAGE_CROP_PRODUCTION: 'manage-crops',
  MANAGE_PEST_SURVEILLANCE: 'manage-crops',
  MANAGE_CROP_REGISTRATION: 'manage-crop-registration',
  APPROVE_CROP_REGISTRATION: 'approve-crop-registration',
  REJECT_CROP_REGISTRATION: 'reject-crop-registration',
  MANAGE_SEED_REGISTRATION: 'manage-seed-registration',
  APPROVE_SEED_REGISTRATION: 'approve-seed-registration',
  REJECT_SEED_REGISTRATION: 'reject-seed-registration',
  MANAGE_SEED_DISTRIBUTION: 'manage-seed-distribution',
  manage_seed_distribution: 'manage-seed-distribution',
  MANAGE_SEED_PRODUCTION: 'manage-seed-production',
  manage_seed_production: 'manage-seed-production',
  APPROVE_SEED_PRODUCTION: 'approve-seed-production',
  approve_seed_production: 'approve-seed-production',
  REJECT_SEED_PRODUCTION: 'reject-seed-production',

  // Irrigation Development & Engineering
  MANAGE_IRRIGATION: 'land.manage',
  MANAGE_INPUTS: 'land.manage',
  INPUT_REGISTRATION: 'input-management',
  MANAGE_IRRIGATION_MAINTENANCE: 'manage-irrigation-maintenance',
  APPROVE_IRRIGATION_MAINTENANCE: 'approve-irrigation-maintenance',
  REJECT_IRRIGATION_MAINTENANCE: 'reject-irrigation-maintenance',
  MANAGE_STUDY_DESIGN: 'manage-study-design',
  APPROVE_STUDY_DESIGN: 'approve-study-design',
  REJECT_STUDY_DESIGN: 'reject-study-design',
  MANAGE_IRRIGATION_CONSTRUCTION: 'manage-construction',
  APPROVE_CONSTRUCTION: 'approve-construction',
  REJECT_CONSTRUCTION: 'reject-construction',
  MANAGE_IRRIGATION_INSTITUTIONS: 'manage-institutions',
  MANAGE_WATER_UTILIZATION: 'manage-water-utilization',

  // Horticulture & Livestock
  MANAGE_HORTICULTURE: 'manage-horticulture',
  APPROVE_HORTICULTURE: 'approve-horticulture',
  REJECT_HORTICULTURE: 'reject-horticulture',
  MANAGE_MECHANIZATION: 'manage-mechanization',
  APPROVE_MECHANIZATION: 'approve-mechanization',
  REJECT_MECHANIZATION: 'reject-mechanization',
  MANAGE_LIVESTOCK: 'manage-livestock',

  // PSNP & Social Protection
  MANAGE_PSNP: 'manage-psnp',
  APPROVE_PSNP_TRANSFER: 'approve-psnp-transfer',
  REJECT_PSNP_TRANSFER: 'reject-psnp-transfer',
  MANAGE_WASH: 'manage-wash',
  MANAGE_MODEL_VILLAGE: 'manage-model-village',
};

export default APP_PERMISSIONS;
