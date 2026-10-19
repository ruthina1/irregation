import React from 'react';
import { irrigationNavigation } from '../modules/Irrigation/shared/irrigationNavigation';

/* ---------- Helpers ---------- */

const item = (key, label, icon, permissions) => ({
  key,
  label: `${icon} ${label}`,
  ...(permissions && { permissions }),
});

const group = (key, label, icon, children) => ({
  key,
  label: `${icon} ${label}`,
  children,
});

/* ---------- Navigation ---------- */

export const navigationMenu = [

  item('/dashboard', 'System Overview', '🏠'),

  { type: 'divider' },

  group('analytics', 'Analytics & Reports', '📊', [
    item('/analytics', 'Executive Dashboard', '📊'),
    item('/analytics/kpi', 'KPI Analytics', '📈'),
    item('/analytics/production', 'Production Analytics', '🌱'),
    item('/analytics/extension', 'Extension Analytics', '👨‍🌾'),
    item('/reports', 'Custom Reports', '📄'),
  ]),

  group('extension', 'Extension & Farmer Services', '👨‍🌾', [
    group('farmers', 'Farmer Registry', '👤', [
      item('/farmers', 'Farmer Registration', '👨‍🌾'),
      item('/farmers/transfer', 'Farmer Transfer', '🔄'),
      item('/farmers/service-history', 'Service History', '📋'),
    ]),
    item('/ftc', 'FTC Management', '🏫'),
    item('/extension-experts', 'Extension & Experts', '🧑‍🏫'),
    item('/events', 'Training & Events', '📅'),
    item('/workforce', 'Workforce & Teams', '👥'),
    item('/farmer-feedback', 'Farmer Feedback', '💬'),
  ]),

  group('extension-digitalization', 'Extension Communication & Digitalization', '📡', [
    /* Pillar 1: Aligned with 2019 EC Digital Extension, 8028/6077 Services, and Video Extension */
    group('ext-comm', 'Extension Communication & Digital Services', '📢', [
      item('/extension/extension-users', 'Extension Beneficiaries & Users', '👥'),
      item('/extension/kebele-das', 'Kebele DAs', '🧑‍🌾'),
      item('/extension/full-package-farmers', 'Full Package Farmers', '📦'),
      item('/extension/model-farmers', 'Model Farmers Development', '⭐'),
      item('/extension/sms-supervision', 'Multilevel SMS Supervision & Support', '🔍'),
      item('/extension/farmers-field-days', 'Farmers Field Days (FTC & Farm Plots)', '🌾'),
      item('/extension/video-based-extension', 'Video-Based Extension (Prep, Show & Adoption)', '🎥'),
      item('/extension/hotline-advisory', 'Helpline & Info Services (8028 Agro / 6077 Market)', '📞'),
      item('/extension/radio-programs', 'Agricultural Radio Programs', '📻'),
      item('/extension/extension-materials', 'Leaflets & Extension Print Media', '📚'),
    ]),

    /* Pillar 2: Research-Extension-Farmer-Linkages (REAC) & Development Partners */
    group('ext-partners', 'Research–Extension–Farmer Linkages & Partners', '🤝', [
      item('/partners/extension/partner-registry', 'Partner & Stakeholder', '🏛️'),
      item('/partners/needs-assessment', 'Community Needs & Gap Assessment', '📋'),
      item('/partners/platform-forums', 'Partner Forums', '🗣️'),
      item('/partners/consultative-forums', 'Consultative Platforms', '💬'),
      item('/partners/partner-activities', 'Joint Partner Activity', '📝'),
    ]),

    /* Pillar 3: Monitoring & Evaluation of Extension Organizations, Groups & Clusters */
    group('ext-organizations', 'Extension Organizations & Program M&E', '📋', [
      item('/organizations/sub-kebele-cadres', 'Sub-Kebele Agricultural Cadres (ቀጠና ተጠሪ)', '📌'),
      item('/organizations/development-groups', 'Agricultural Development Groups (ልማት ቡድን)', '👥'),
      item('/organizations/development-work-teams', 'Development Work Teams', '🧑‍🌾'),
      item('/organizations/commodity-clusters', 'Commodity Clusters', '🌾'),
      item('/organizations/large-scale-clusters', 'Large-Scale Clusters', '🗺️'),
      item('/organizations/farmer-field-schools', 'Farmer Field Schools', '🌱'),
      item('/organizations/group-peer-learning', 'Monthly Development Group Peer Learning', '📖'),
      item('/organizations/project-mand-e', 'Project & Program M&E (Profiles & Supervision)', '📊'),
      item('/organizations/scalable-practices', 'Best & Scalable Practices', '✨'),
    ]),

    /* Pillar 4: Agricultural Field Demonstrations */
    group('ext-demos', 'Agricultural Demonstrations', '🌱', [
      item('/demonstrations/overview', 'Demonstration Overview (FTC & Farmer Plots)', '📍'),
      item('/demonstrations/adaptation-demos', 'Adaptation Demonstrations (Crop & Horticulture)', '🔬'),
      item('/demonstrations/promotional-demos', 'Promotional Demonstrations', '📢'),
      item('/demonstrations/regular-ffs-demos', 'Regular Farm & FFS Demonstrations', '🌾'),
      item('/demonstrations/demo-evaluations', 'Demonstration Results Evaluation & Verification', '✅'),
    ]),

    /* Pillar 5: FTC Management & Extension Training Support */
    group('ext-ftc', 'FTC & Capacity Building', '🎓', [
      item('/ftc/construction-upgrading', 'FTC Construction, Upgrades & Maintenance', '🏗️'),
      item('/ftc/da-residential-quarters', 'DA Residential Quarters (Construction & Maintenance)', '🏡'),
      item('/ftc/equipment-auditing', 'FTC Equipment Inventory & Audit', '📦'),
      item('/ftc/demonstration-land', 'FTC Demonstration Land Holdings', '🌱'),
      item('/ftc/ict-integration', 'FTC ICT Utilization & Digital Connectivity', '💻'),
      item('/ftc/model-kebele-creation', 'Model Kebele Development & Classification', '⭐'),
      item('/ftc/da-specialist-training', 'Training for DAs & Subject Specialists', '🧑‍🏫'),
      item('/ftc/farmer-package-training', 'Farmer Seasonal Modular & Package Training', '🎓'),
      item('/ftc/management-committees', 'FTC Management Committees Training', '👥'),
      item('/ftc/experience-sharing', 'Field Days & Inter-Woreda Experience Sharing', '🔄'),
      item('/ftc/academic-upgrades', 'DA Career Upgrades (Certificate -> Diploma -> Degree -> MSc)', '📜'),
    ]),

    /* Pillar 6: Gender, Youth Enterprises & HIV/AIDS Mainstreaming */
    group('ext-gender-youth', 'Gender, Youth, Inclusion & HIV/AIDS', '⚧', [
      item('/gender/participation', 'Women Participation', '👩'),
      item('/gender-hiv/appropriate-technologies', 'Labor-Saving & Appropriate Technologies for Women', '💡'),
      item('/gender-hiv/gender-safeguard-training', 'Gender & Social Inclusion / Safeguard Training', '🎓'),
      item('/gender-hiv/female-staff-empowerment', 'Female Staff Capacity & Leadership Empowerment', '⭐'),
      item('/gender-hiv/model-families', 'Gender Model Families (New & Supported)', '👨‍👩‍👧‍👦'),
      item('/gender-hiv/child-daycare-support', 'Workplace Child Daycare Support (Region/Zone/Woreda)', '🧸'),
      item('/gender-hiv/hiv-prevention-fund', 'HIV/AIDS Workplace Prevention & Staff Care Fund', '🎗️'),
      item('/gender-hiv/community-awareness', 'HIV/AIDS & Substance Abuse (Khat) Farmer Awareness', '📢'),
      item('/gender-hiv/youth-agri-enterprises', 'Youth Agri-Enterprises (Crop, Irrig, Mechanization, Nursery)', '🚀'),
      item('/gender-hiv/employment-creation', 'Youth Rural & Urban Agri-Job Tracking (Permanent & Temporary)', '💼'),
    ]),

    /* Pillar 7: Agricultural ATVET Colleges */
    group('ext-colleges', 'Agricultural Colleges (ATVET)', '🏫', [
      item('/colleges/registry', 'College Profile', '🏫'),
      item('/colleges/student-enrollment', 'Student Registry (New Admissions & Continuing)', '👨‍🎓'),
      item('/colleges/staff-registry', 'Faculty & Staff Profile & Pedagogical Training', '🧑‍🏫'),
      item('/colleges/infrastructure-farms', 'Infrastructure, Laboratories & Farm Facilities', '🚜'),
      item('/colleges/curriculum-extension', 'Curriculum, Training & Extension Programs', '🌾'),
      item('/colleges/research-technology', 'Research, Technology Transfer & Community Service', '🔬'),
      item('/colleges/college-regulations', 'College Statutes, Policies & Standard Guidelines', '📜'),
      item('/colleges/pedagogical-training', 'Faculty Pedagogical & Instructional Methodology Training', '🧑‍🏫'),
      item('/colleges/supervision-audits', 'College Quality Assurance & Field Supervision', '🔍'),
      item('/colleges/university-linkages', 'University Partnerships & Linkages', '🤝'),
      item('/colleges/governance-readiness', 'Institutional Governance & Readiness Evaluations', '🏛️'),
    ]),
  ]),

  group('watershed-swc', 'Watershed & SWC (ተፋሰስ ልማት)', '🏞️', [
    item('/watershed/dashboard', 'Watershed Dashboard & GIS', '📊'),
    item('/watershed/registry', 'Watershed Registry (የተፋሰስ መዝገብ)', '📋'),
    item('/watershed/drainage', 'Drainage Systems (የጎርፍ መውረጃና ማስተንፈሻ ቦዮች)', '💧'),
    item('/watershed/mobilization', 'Labor & Tools (የሰው ኃይልና መሣሪያ)', '👥'),
    item('/watershed/soil-water-conservation', 'Terracing (የእርከን ሥራዎች)', '🌾'),
    item('/watershed/Moisture', 'Moisture Retention & Runoff (የእርጥበት እቀባና ጎርፍ)', '💧'),
    item('/watershed/rehabilitation', 'Gully & Riverbank Rehab (የቦረቦረና ወንዝ ዳርቻ)', '🪨'),
    item('/watershed/invasive-weeds', 'Invasive Weed Control (መጤ አረሞች)', '🌿'),
    item('/watershed/maintenance', 'SWC Maintenance (የጥገና ሥራዎች)', '🛠️'),
    item('/watershed/hillside-structures', 'Hillside Structures Report', '🏗️'),
  ]),

  irrigationNavigation,

  { type: 'divider' },

  group('user-admin', 'User Administration', '⚙️', [
    item('/umac', 'User Management', '👤'),
    item('/roles', 'Roles & Permissions', '🔐'),
  ]),
];