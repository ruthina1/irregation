import {
  AppstoreOutlined,
  AuditOutlined,
  BankOutlined,
  BarChartOutlined,
  BuildOutlined,
  CheckCircleOutlined,
  DashboardOutlined,
  DollarCircleOutlined,
  ExperimentOutlined,
  FileDoneOutlined,
  FileSearchOutlined,
  FolderOpenOutlined,
  FundOutlined,
  LineChartOutlined,
  NodeIndexOutlined,
  PieChartOutlined,
  ProjectOutlined,
  ReadOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
  ShopOutlined,
  TeamOutlined,
  ToolOutlined,
  TrophyOutlined,
  UsergroupAddOutlined,
} from '@ant-design/icons';
import './irrigationNavigation.css';

/* Sidebar entries for the Irrigation module: outlined icons, no emoji. */

/* Leaf entries get a short dash before the icon, like the reference sidebar. */
const item = (key, label, Icon) => ({
  key,
  label,
  icon: (
    <span className="irr-nav-leaf-icon">
      <span className="irr-nav-dash" aria-hidden="true" />
      <Icon />
    </span>
  ),
});

const group = (key, label, Icon, children) => ({
  key,
  label,
  icon: <Icon />,
  popupClassName: 'irr-nav-popup',
  children,
});

export const irrigationNavigation = {
  ...group('irrigation-development', 'Irrigation Development & Drainage', NodeIndexOutlined, [

    /* Directorate Master Report (ጠቅላላ ሪፖርት) */
    item('/irrigation/reports/directorate-master', 'Directorate Master Report', FileDoneOutlined),

    /* 1. Irrigation Study & Design (የመስኖ ዲዛይን ጥናትና ዲዛይን) */
    group('irrigation-study-design', 'Irrigation Study & Design', ExperimentOutlined, [
      item('/irrigation/study-design/dashboard', 'Study & Design Overview', DashboardOutlined),
      item('/irrigation/study-design/project-identification', 'Project Identification & Pipeline', SearchOutlined),
      item('/irrigation/study-design/projects', 'Study & Design Projects', FolderOpenOutlined),
      item('/irrigation/study-design/document-review', 'Design Document Review', FileSearchOutlined),
      item('/irrigation/study-design/quality-assurance', 'Design Quality Assurance', SafetyCertificateOutlined),
      item('/irrigation/study-design/construction-ready', 'Construction-Ready Designs', FileDoneOutlined),
      item('/irrigation/study-design/capacity-building', 'Professional Capacity Building', ReadOutlined),
      item('/irrigation/reports/study-design', 'Study & Design Reports', BarChartOutlined),
    ]),

    /* 2. Irrigation Construction (የመስኖ ድርጅቶች ግንባታ ክትትል) */
    group('irrigation-construction', 'Irrigation Construction & Monitoring', BuildOutlined, [
      item('/irrigation/construction/projects', 'Construction Projects', ProjectOutlined),
      item('/irrigation/construction/progress', 'Construction Progress & Performance', LineChartOutlined),
      item('/irrigation/construction/completion', 'Project Completion & Handover', CheckCircleOutlined),
      item('/irrigation/construction/funding', 'Project Funding & Special Programs', DollarCircleOutlined),
      item('/irrigation/construction/benefits', 'Developed Land & Beneficiaries', TeamOutlined),
      item('/irrigation/reports/construction', 'Construction Performance Reports', BuildOutlined),
      item('/irrigation/reports/beneficiaries', 'Beneficiary Statistics', TeamOutlined),
    ]),

    /* 3. Irrigation Institutions (የመስኖ ተቋማት አስተዳደርና ጥገና) */
    group('irrigation-institutions', 'Irrigation Institutions Management', BankOutlined, [
      item('/irrigation/institutions/water-users-associations', 'Water Users’ Associations', TeamOutlined),
      item('/irrigation/institutions/assessment-audit', 'Association Strengthening & Audit', AuditOutlined),
      item('/irrigation/institutions/capacity-building', 'Association Capacity Building', UsergroupAddOutlined),
      item('/irrigation/institutions/infrastructure-maintenance', 'Infrastructure Maintenance & Repair', ToolOutlined),
      item('/irrigation/reports/institutions', 'Water Users’ Associations Reports', BankOutlined),
    ]),

    /* 4. Irrigation Water Utilization (የመስኖ ውሃ አጠቃቀም) */
    group('irrigation-water-utilization', 'Irrigation Water Utilization', FundOutlined, [
      item('/irrigation/water-utilization/overview', 'Water Utilization Overview', DashboardOutlined),
      item('/irrigation/water-utilization/irrigated-area', 'Irrigated Land & Seasonal Utilization', AppstoreOutlined),
      item('/irrigation/water-utilization/irrigation-systems', 'Irrigation Systems & Methods', NodeIndexOutlined),
      item('/irrigation/water-utilization/water-sources', 'Water Sources & Irrigation Technologies', ExperimentOutlined),
      item('/irrigation/reports/water-utilization', 'Water Utilization Reports', FundOutlined),
    ]),

    /* 5. Crop Production & Yield (የለማ መሬት እና የምርት መጠን) */
    group('irrigation-crop-production', 'Irrigation Crop Production & Yield', BarChartOutlined, [
      item('/irrigation/production/overview', 'Production Overview', DashboardOutlined),
      item('/irrigation/production/seasonal-production', 'Seasonal Production & Yield', BarChartOutlined),
      item('/irrigation/production/summer-wheat', 'Highland Irrigated Wheat Development', TrophyOutlined),
      item('/irrigation/reports/production', 'Crop Production & Yield Reports', BarChartOutlined),
    ]),

    /* 6. Agricultural Input Utilization (የግብዓት አጠቃቀም) */
    item('/irrigation/inputs', 'Agricultural Input Utilization', ShopOutlined),
  ]),
  className: 'irr-nav',
};

/* Page title for the navbar, looked up from the current path. */
const collectTitles = (node, map) => {
  if (node.children) node.children.forEach((child) => collectTitles(child, map));
  else if (node.key?.startsWith('/')) map[node.key] = node.label;
  return map;
};

const PAGE_TITLES = collectTitles(irrigationNavigation, {});

export const getIrrigationPageTitle = (pathname) => PAGE_TITLES[pathname] ?? null;
