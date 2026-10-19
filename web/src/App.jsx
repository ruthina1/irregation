import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';

// Layout & Common
import MainLayout from './components/layout/MainLayout';
import Home from './components/common/Home';
import ComingSoon from './components/common/CommingSoon';
import BrandedLoader from './components/common/BrandedLoader';

// UMAC Modules
import Login from './modules/umac/Login';
import UserList from './modules/umac/UserList';
import RoleList from './modules/umac/RoleList';
import DashboardHome from './modules/mera/DashboardHome';
import LocationManagement from './components/common/LocationManagement';
import FtcManagement from './modules/extension/ftc';
import TrainingEventsManagement from './modules/extension/training/TrainingEventsManagement';
import FarmersManagement from './modules/extension/farmer/FarmersManagement';
// Agronomy Modules
import AgronomyDashboard from './modules/Agronomy/AgronomyDashboard';
import LandParcels from './modules/Agronomy/LandParcels';
import CropProduction from './modules/Agronomy/CropProduction';
import PestSurveillanceGrid from './modules/Agronomy/PestSurveillanceGrid';
import SeedMultiplication from './modules/Agronomy/SeedMultiplication';
// State & Hooks
import { useAuthStore } from './store/authStore';
import { usePermissions } from './hooks/usePermissions';
import { APP_PERMISSIONS } from './constants/permissions';
import WorkforceManagement from './modules/extension/workforce/WorkforceManagement';
import PsnpManagement from './modules/psnp/PsnpManagement';
import NutritionManagement from './modules/psnp/nutrition/NutritionManagement';
import EmpowermentManagement from './modules/psnp/empowerment/EmpowermentManagement';
import ModelVillageManagement from './modules/psnp/village/ModelVillageManagement';
import WatershedManagement from './modules/ncm/watershed/WatershedManagement';
import InterventionManagement from './modules/ncm/intervention/InterventionManagement';
import LandUseManagement from './modules/ncm/LandUse/LandUseManagement';
import SmsDashboard from './modules/communication/SmsDashboard';

import InputDistributions from './modules/Agronomy/InputDistributions';
import IrrigationProjects from './modules/Agronomy/IrrigationProjects';
import AnalyticsDashboard from './modules/mera/AnalyticsDashboard';
import TransferList from './modules/psnp/TransferList';
import StrategicPlan from './modules/mera/StrategicPlan';
import StrategicPlanAnalysis from './modules/mera/StrategicPlanAnalysis';



// Agronomy Modules
import ForestryForests from './modules/Agronomy/Forest/ForestryForests';
import ForestryPlantations from './modules/Agronomy/Forest/ForestryPlantations';
import ForestryNurseries from './modules/Agronomy/Forest/ForestryNurseries';
import ForestryProjects from './modules/Agronomy/Forest/ForestryProjects';
import ForestryProtections from './modules/Agronomy/Forest/ForestryProtections';
import NurseryManagement from './modules/Agronomy/NurseryManagement';
import LandRehabilitation from './modules/Agronomy/LandRehabilitation';
import CropRegistration from './modules/Agronomy/Crop/CropRegistration';
import SeedRegistration from './modules/Agronomy/Seed/SeedRegistration';
import SeedVarietyManagement from './modules/Agronomy/Seed/SeedVarietyManagement';
import IrrigationMaintenance from './modules/Agronomy/IrrigationMaintenance/IrrigationMaintenance';

import HorticultureManagement from './modules/ncm/Horticulture/HorticultureManagement';


import WaterManagement from './modules/psnp/Water/WaterManagement';
import SanitationManagement from './modules/psnp/Sanitation/SanitationManagement';
import HygieneManagement from './modules/psnp/Hygiene/HygieneManagement';

import LivestockManagement from './modules/Livestock/LivestockManagement';
import MechanizationManagement from './modules/extension/Mechanization/MechanizationManagement';
import CooperativeManagement from './modules/extension/Cooperative/CooperativeManagement';
import InputRegistrationManagement from './modules/Agronomy/InputRegistrationManagement';

import DocumentManagement from './modules/Media/Documents/DocumentManagement';
import GalleryManagement from './modules/Media/Galleries/GalleryManagement';
import VideoManagement from './modules/Media/Videos/VideoManagement';
import NewsManagement from './modules/Media/News/NewsManagement';

import FeedbackList from './modules/Media/FeedbackList';
import Report from './modules/mera/AnnualReport/Report';


// Henok
import ExtensionUsers from './modules/extension/ExtensionUsers';
import KebeleDAs from './modules/extension/KebeleDAs';
import FullPackageBeneficiaryFarmers from './modules/extension/FullPackageBeneficiaryFarmers';
import ModelFarmers from './modules/extension/ModelFarmers';
import MultilevelSMSSupervision from './modules/extension/MultilevelSMSSupervision';
import FarmersFieldDays from './modules/extension/FarmersFieldDays';
import VideoBasedExtension from './modules/extension/VideoBasedExtension';
import HotlineAdvisory from './modules/extension/HotlineAdvisory';
import RadioPrograms from './modules/extension/RadioPrograms';
import ExtensionMaterials from './modules/extension/ExtensionMaterials';
import PartnerRegistry from './modules/extension/partners/PartnerRegistry';
import NeedsAssessment from './modules/extension/partners/NeedsAssessment';
import PlatformForums from './modules/extension/partners/PlatformForums';
import ConsultativeForums from './modules/extension/partners/ConsultativeForums';
import PartnerActivities from './modules/extension/partners/PartnerActivities';
import SubKebeleCadres from './modules/extension/organizations/SubKebeleCadres';
import DevelopmentGroups from './modules/extension/organizations/DevelopmentGroups';
import DevelopmentWorkTeams from './modules/extension/organizations/DevelopmentWorkTeams';
import CommodityClusters from './modules/extension/organizations/CommodityClusters';
import LargeScaleClusters from './modules/extension/organizations/LargeScaleClusters';
import FarmerFieldSchools from './modules/extension/organizations/FarmerFieldSchools';
import GroupPeerLearning from './modules/extension/organizations/GroupPeerLearning';
import ProjectMandE from './modules/extension/organizations/ProjectMandE';
import ScalablePractices from './modules/extension/organizations/ScalablePractices';

import DemoOverview from './modules/extension/demonstrations/DemoOverview';
import AdaptationDemos from './modules/extension/demonstrations/AdaptationDemos';
import PromotionalDemos from './modules/extension/demonstrations/PromotionalDemos';
import RegularFfsDemos from './modules/extension/demonstrations/RegularFfsDemos';
import DemoEvaluations from './modules/extension/demonstrations/DemoEvaluations';

import FtcEquipmentAuditing from './modules/extension/ftc/FtcEquipmentAuditing';
import FtcDemonstrationLand from './modules/extension/ftc/FtcDemonstrationLand';
import FtcIctIntegration from './modules/extension/ftc/FtcIctIntegration';
import ModelKebeles from './modules/extension/ftc/ModelKebeles';

import DaSpecialistTraining from './modules/extension/ftc/DaSpecialistTraining';
import FarmerPackageTraining from './modules/extension/ftc/FarmerPackageTraining';
import FtcManagementCommittees from './modules/extension/ftc/FtcManagementCommittees';
import ExperienceSharing from './modules/extension/ftc/ExperienceSharing';
import DaAcademicUpgrades from './modules/extension/ftc/DaAcademicUpgrades';
import GenderParticipation from './modules/extension/gender/GenderParticipation';
import AppropriateTechnologies from './modules/extension/gender/AppropriateTechnologies';
import GenderSafeguardTraining from './modules/extension/gender/GenderSafeguardTraining';
import FemaleStaffEmpowerment from './modules/extension/gender/FemaleStaffEmpowerment';

import GenderModelFamilies from './modules/extension/gender/GenderModelFamilies';
import ChildDaycareSupport from './modules/extension/gender/ChildDaycareSupport';
import HivPreventionFund from './modules/extension/gender/HivPreventionFund';
import CommunityAwareness from './modules/extension/gender/CommunityAwareness';
import YouthAgriEnterprises from './modules/extension/gender/YouthAgriEnterprises';

import EmploymentCreation from './modules/extension/gender/EmploymentCreation';
import CollegeRegistry from './modules/extension/colleges/CollegeRegistry';
import StudentEnrollment from './modules/extension/colleges/StudentEnrollment';
import CollegeRegulations from './modules/extension/colleges/CollegeRegulations';
import PedagogicalTraining from './modules/extension/colleges/PedagogicalTraining';
import CollegeSupervision from './modules/extension/colleges/CollegeSupervision';
import UniversityLinkages from './modules/extension/colleges/UniversityLinkages';
import GovernanceReadiness from './modules/extension/colleges/GovernanceReadiness';
import StaffRegistry from './modules/extension/colleges/StaffRegistry';
import InfrastructureFarms from './modules/extension/colleges/InfrastructureFarms';
import CurriculumExtension from './modules/extension/colleges/CurriculumExtension';
import ResearchTechnology from './modules/extension/colleges/ResearchTechnology';




// 2. Import the components using PascalCase (Capital W)
import WatershedRegistry from './modules/Natural/watersheld/WatershedRegistry';
import AnnualEntryPage from './modules/Natural/watersheld/AnnualEntryPage';
import MobilizationPage from './modules/Natural/watersheld/MobilizationPage';
import SoilWaterConservationPage from './modules/Natural/watersheld/SoilWaterConservationPage';
import RehabilitationPage from './modules/Natural/watersheld/RehabilitationPage';
import InvasiveWeedsPage from './modules/Natural/watersheld/InvasiveWeedsPage';
import MaintenancePage from './modules/Natural/watersheld/MaintenancePage';
import WaterHarvestingPage from './modules/Natural/watersheld/WaterHarvestingPage';

import HillsideStructuresReportPage from './modules/Natural/watersheld/HillsideStructuresReportPage';

import WatershedDashboard from './modules/Natural/watersheld/watershedDashboard';

import DrainagePage from './modules/Natural/watersheld/DrainagePage';

import AgriculturalInputUtilization from './modules/Irrigation/Design&Study/AgriculturalInputUtilization/AgriculturalInputUtilizationManagement';
import IrrigationStudyDesign from './modules/Irrigation/Design&Study/IrrigationStudyDesign/IrrigationStudyDesignManagement';
import ProjectIdentificationPipeline from './modules/Irrigation/Design&Study/ProjectIdentificationPipeline/ProjectIdentificationPipelineManagement';
import StudyDesignDashboard from './modules/Irrigation/Design&Study/StudyDesignDashboard/StudyDesignDashboardManagement';
import DesignDocumentReview from './modules/Irrigation/Design&Study/DesignDocumentReview/DesignDocumentReviewManagement';
import DesignQualityAssurance from './modules/Irrigation/Design&Study/DesignQualityAssurance/DesignQualityAssuranceManagement';
import ConstructionReadyDesigns from './modules/Irrigation/Design&Study/ConstructionReadyDesigns/ConstructionReadyDesignsManagement';
import ProfessionalCapacityBuilding from './modules/Irrigation/Design&Study/ProfessionalCapacityBuilding/ProfessionalCapacityBuildingManagement';
import ConstructionProjects from './modules/Irrigation/Irrigation&Construction/ConstructionProjects/ConstructionProjectsManagement';
import ConstructionProgressPerformance from './modules/Irrigation/Irrigation&Construction/ConstructionProgressPerformance/ConstructionProgressPerformanceManagement';
import ProjectCompletionHandover from './modules/Irrigation/Irrigation&Construction/ProjectCompletionHandover/ProjectCompletionHandoverManagement';
import ProjectFundingFinancing from './modules/Irrigation/Irrigation&Construction/ProjectFundingFinancing/ProjectFundingFinancingManagement';
import DevelopedLandBeneficiaries from './modules/Irrigation/Irrigation&Construction/DevelopedLandBeneficiaries/DevelopedLandBeneficiariesManagement';
import WaterUsersAssociations from './modules/Irrigation/Irrigatio&Institutions&Management/WaterUsersAssociations/WaterUsersAssociationsManagement';
import AssociationStrengtheningAudit from './modules/Irrigation/Irrigatio&Institutions&Management/AssociationStrengtheningAudit/AssociationStrengtheningAuditManagement';
import AssociationCapacityBuilding from './modules/Irrigation/Irrigatio&Institutions&Management/AssociationCapacityBuilding/AssociationCapacityBuildingManagement';
import SchemeMaintenanceCleaning from './modules/Irrigation/Irrigatio&Institutions&Management/SchemeMaintenanceCleaning/SchemeMaintenanceCleaningManagement';
import IrrigatedLandUtilization from './modules/Irrigation/IrrigationWaterUtilization/IrrigatedLandUtilization/IrrigatedLandUtilizationManagement';
import WaterUtilizationOverview from './modules/Irrigation/IrrigationWaterUtilization/WaterUtilizationOverview/WaterUtilizationOverviewManagement';
import IrrigationSystemsMethods from './modules/Irrigation/IrrigationWaterUtilization/IrrigationSystemsMethods/IrrigationSystemsMethodsManagement';
import WaterSourcesTechnologies from './modules/Irrigation/IrrigationWaterUtilization/WaterSourcesTechnologies/WaterSourcesTechnologiesManagement';
import SeasonalCropProductionYield from './modules/Irrigation/IrrigationCropProductionYield/SeasonalCropProductionYield/SeasonalCropProductionYieldManagement';
import HighlandIrrigatedWheat from './modules/Irrigation/IrrigationCropProductionYield/HighlandIrrigatedWheat/HighlandIrrigatedWheatManagement';
import CropProductionOverview from './modules/Irrigation/IrrigationCropProductionYield/CropProductionOverview/CropProductionOverviewManagement';
import StudyDesignReports from './modules/Irrigation/Analytics&Reports/StudyDesignReports/StudyDesignReportsManagement';
import ConstructionPerformanceReports from './modules/Irrigation/Analytics&Reports/ConstructionPerformanceReports/ConstructionPerformanceReportsManagement';
import InstitutionsReports from './modules/Irrigation/Analytics&Reports/InstitutionsReports/InstitutionsReportsManagement';
import WaterUtilizationReports from './modules/Irrigation/Analytics&Reports/WaterUtilizationReports/WaterUtilizationReportsManagement';
import CropProductionReports from './modules/Irrigation/Analytics&Reports/CropProductionReports/CropProductionReportsManagement';
import BeneficiaryStatisticsReports from './modules/Irrigation/Analytics&Reports/BeneficiaryStatisticsReports/BeneficiaryStatisticsReportsManagement';
import IrrigationDirectorateMasterReport from './modules/Irrigation/Analytics&Reports/IrrigationDirectorateMasterReport/IrrigationDirectorateMasterReportManagement';




// ───── Route Guards ─────────────────────────────────────────────

const ProtectedRoute = ({ children, permissions }) => {
  const { isAuthenticated, isHydrated } = useAuthStore();
  const { hasPermission } = usePermissions();

  if (!isHydrated) {
    return <BrandedLoader message="Authenticating Secure Session..." />;
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (permissions && !hasPermission(permissions)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, isHydrated } = useAuthStore();
  
  if (!isHydrated) {
    return <BrandedLoader message="Initializing IAIMS Platform..." />;
  }
  
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

// ───── Theme ────────────────────────────────────────────────────

const theme = {
  token: {
    colorPrimary: '#2C9647',
    colorInfo:    '#2E75B6',
    colorSuccess: '#2C9647',
    colorWarning: '#F2C84B',
    colorError:   '#D32F2F',
    borderRadius: 8,
    fontFamily:   "'Inter', 'Segoe UI', Roboto, sans-serif",
    fontSize:     14,
  },
  components: {
    Button: { controlHeight: 44, fontWeight: 500, primaryShadow: 'none' },
    Input:  { controlHeight: 44 },
    Select: { controlHeight: 44 },
    Form:   { labelFontSize: 14, verticalLabelPadding: '0 0 6px' },
  },
};

// ───── App ──────────────────────────────────────────────────────

export default function App() {
  return (
    <ConfigProvider theme={theme}>
      <AntApp>
        <Router>
          <Routes>
            {/* Public */}
            <Route path="/" element={<PublicOnlyRoute><Home /></PublicOnlyRoute>} />
            <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
            <Route path="/agronomy" element={<AgronomyDashboard />} />
            
            {/* Protected Routes wrapped in MainLayout */}
            <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              
              {/* Default Dashboard */}
              <Route path="/dashboard" element={<DashboardHome />} />


{/* ───── WATERSHED MODULE ROUTE GROUP ───── */}
  




<Route
  path="/irrigation/reports/directorate-master"
  element={
    <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_WATERSHEDS]}>
      <IrrigationDirectorateMasterReport />
    </ProtectedRoute>
  }
/>


<Route 
  path="/irrigation/reports/beneficiaries" 
  element={
    <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_WATERSHEDS]}>
      <BeneficiaryStatisticsReports />
    </ProtectedRoute>
  } 
/>

<Route 
  path="irrigation/reports/production" 
  element={
    <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_WATERSHEDS]}>
      <CropProductionReports />
    </ProtectedRoute>
  } 
/>

<Route 
  path="/irrigation/reports/water-utilization" 
  element={
    <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_WATERSHEDS]}>
      <WaterUtilizationReports />
    </ProtectedRoute>
  } 
/>

<Route 
  path="/irrigation/reports/institutions" 
  element={
    <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_WATERSHEDS]}>
      <InstitutionsReports />
    </ProtectedRoute>
  } 
/>

<Route 
  path="/irrigation/reports/construction" 
  element={
    <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_WATERSHEDS]}>
      <ConstructionPerformanceReports />
    </ProtectedRoute>
  } 
/>

<Route 
  path="/irrigation/reports/study-design" 
  element={
    <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_WATERSHEDS]}>
      <StudyDesignReports />
    </ProtectedRoute>
  } 
/>

<Route 
  path="/irrigation/production/overview" 
  element={
    <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_WATERSHEDS]}>
      <CropProductionOverview />
    </ProtectedRoute>
  } 
/>
<Route 
  path="/irrigation/production/summer-wheat" 
  element={
    <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_WATERSHEDS]}>
      <HighlandIrrigatedWheat />
    </ProtectedRoute>
  } 
/>

<Route 
  path="/irrigation/production/seasonal-production" 
  element={
    <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_WATERSHEDS]}>
      <SeasonalCropProductionYield />
    </ProtectedRoute>
  } 
/>

<Route 
  path="/irrigation/water-utilization/water-sources" 
  element={
    <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_WATERSHEDS]}>
      <WaterSourcesTechnologies />
    </ProtectedRoute>
  } 
/>

<Route 
  path="/irrigation/water-utilization/irrigation-systems" 
  element={
    <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_WATERSHEDS]}>
      <IrrigationSystemsMethods />
    </ProtectedRoute>
  } 
/>


<Route
  path="/irrigation/water-utilization/overview"
  element={
    <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_WATERSHEDS]}>
      <WaterUtilizationOverview />
    </ProtectedRoute>
  }
/>

<Route 
  path="/irrigation/water-utilization/irrigated-area" 
  element={
    <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_WATERSHEDS]}>
      <IrrigatedLandUtilization />
    </ProtectedRoute>
  } 
/>

<Route 
  path="/irrigation/institutions/infrastructure-maintenance" 
  element={
    <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_WATERSHEDS]}>
      <SchemeMaintenanceCleaning />
    </ProtectedRoute>
  } 
/>
<Route 
  path="/irrigation/institutions/water-users-associations" 
  element={
    <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_WATERSHEDS]}>
      <WaterUsersAssociations />
    </ProtectedRoute>
  } 
/>

<Route 
  path="/irrigation/institutions/assessment-audit" 
  element={
    <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_WATERSHEDS]}>
      <AssociationStrengtheningAudit />
    </ProtectedRoute>
  } 
/>

<Route 
  path="/irrigation/institutions/capacity-building" 
  element={
    <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_WATERSHEDS]}>
      <AssociationCapacityBuilding />
    </ProtectedRoute>
  } 
/>





<Route 
  path="/irrigation/construction/benefits" 
  element={
    <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_WATERSHEDS]}>
      <DevelopedLandBeneficiaries />
    </ProtectedRoute>
  } 
/>

<Route 
  path="/irrigation/construction/funding" 
  element={
    <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_WATERSHEDS]}>
      <ProjectFundingFinancing />
    </ProtectedRoute>
  } 
/>

<Route 
  path="/irrigation/construction/completion" 
  element={
    <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_WATERSHEDS]}>
      <ProjectCompletionHandover />
    </ProtectedRoute>
  } 
/>

<Route 
  path="/irrigation/construction/progress" 
  element={
    <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_WATERSHEDS]}>
      <ConstructionProgressPerformance />
    </ProtectedRoute>
  } 
/>

<Route 
  path="/irrigation/construction/projects" 
  element={
    <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_WATERSHEDS]}>
      <ConstructionProjects />
    </ProtectedRoute>
  } 
/>

<Route 
  path="/irrigation/study-design/capacity-building" 
  element={
    <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_WATERSHEDS]}>
      <ProfessionalCapacityBuilding />
    </ProtectedRoute>
  } 
/>

<Route 
  path="/watershed/dashboard" 
  element={
    <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_WATERSHEDS]}>
      <WatershedDashboard />
    </ProtectedRoute>
  } 
/>

<Route 
  path="/irrigation/study-design/construction-ready" 
  element={
    <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_WATERSHEDS]}>
      <ConstructionReadyDesigns />
    </ProtectedRoute>
  } 
/>



<Route 
  path="/watershed/drainage" 
  element={
    <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_WATERSHEDS]}>
      <DrainagePage />
    </ProtectedRoute>
  } 
/>

<Route 
  path="/irrigation/inputs" 
  element={
    <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_WATERSHEDS]}>
      <AgriculturalInputUtilization />
    </ProtectedRoute>
  } 
/>

<Route 
  path="/irrigation/study-design/projects" 
  element={
    <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_WATERSHEDS]}>
      <IrrigationStudyDesign />
    </ProtectedRoute>
  } 
/>
<Route 
  path="/irrigation/study-design/project-identification" 
  element={
    <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_WATERSHEDS]}>
      <ProjectIdentificationPipeline />
    </ProtectedRoute>
  } 
/>

<Route 
  path="/irrigation/study-design/dashboard" 
  element={
    <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_WATERSHEDS]}>
      <StudyDesignDashboard />
    </ProtectedRoute>
  } 
/>

<Route 
  path="/irrigation/study-design/document-review" 
  element={
    <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_WATERSHEDS]}>
      <DesignDocumentReview />
    </ProtectedRoute>
  } 
/>
<Route 
  path="/irrigation/study-design/quality-assurance" 
  element={
    <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_WATERSHEDS]}>
      <DesignQualityAssurance />
    </ProtectedRoute>
  } 
/>











             <Route 
                path="/watershed/hillside-structures" 
                element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_WATERSHEDS]}>
                    <HillsideStructuresReportPage />
                  </ProtectedRoute>
                } 
              />





<Route 
                path="/watershed/maintenance" 
                element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_WATERSHEDS]}>
                    <MaintenancePage />
                  </ProtectedRoute>
                } 
              />

<Route 
                path="/watershed/Moisture" 
                element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_WATERSHEDS]}>
                    <WaterHarvestingPage />
                  </ProtectedRoute>
                } 
              />


<Route 
                path="/watershed/registry" 
                element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_WATERSHEDS]}>
                    <WatershedRegistry />
                  </ProtectedRoute>
                } 
              />

            

              <Route 
                path="/watershed/invasive-weeds" 
                element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_WATERSHEDS]}>
                    <InvasiveWeedsPage />
                  </ProtectedRoute>
                } 
              />

               <Route 
                path="/watershed/soil-water-conservation" 
                element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_WATERSHEDS]}>
                    <SoilWaterConservationPage />
                  </ProtectedRoute>
                } 
              />


              

              <Route 
                path="/watershed/rehabilitation" 
                element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_WATERSHEDS]}>
                    <RehabilitationPage />
                  </ProtectedRoute>
                } 
              />

               <Route 
                path="/watershed/annual-entry" 
                element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_WATERSHEDS]}>
                    <AnnualEntryPage />
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/watershed/mobilization" 
                element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_WATERSHEDS]}>
                    <MobilizationPage />
                  </ProtectedRoute>
                } 
              />




              
              {/* System Administration */}
              <Route 
                path="/umac" 
                element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_USERS]}>
                    <UserList />
                  </ProtectedRoute>
                } 
              />


       




              <Route 
                path="/roles" 
                element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_ROLES]}>
                    <RoleList />
                  </ProtectedRoute>
                } 
              />

             
              <Route 
                path="/location" 
                element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_GEO]}>
                    <LocationManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/land-parcels" 
                element={ 
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_LAND]}>
                    <LandParcels />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/seed-multiplication" 
                element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_CROPS]}>
                    <SeedMultiplication />
                  </ProtectedRoute>
                } 
              />
              <Route path="/crop-production" element={<ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_CROP_PRODUCTION]}>
                <CropProduction />
              </ProtectedRoute>} />
              <Route path="/pest-surveillance" element={<ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_PEST_SURVEILLANCE]}>
                <PestSurveillanceGrid />
              </ProtectedRoute>} />
              <Route path="/soil-analysis" element={<ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_CROPS]}>
                <ComingSoon moduleName="Soil Analysis" />
              </ProtectedRoute>} />
              <Route path="/ftc" element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_FTC]}>
                    <FtcManagement />
                  </ProtectedRoute>
                } />

              <Route path="/events" element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_EVENTS]}>
                    <TrainingEventsManagement />
                  </ProtectedRoute>
                } />

              <Route path="/farmers" element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_FARMERS]}>
                    <FarmersManagement />
                  </ProtectedRoute>
                } />

              <Route 
                path="/livestock" 
                element={
                    <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_LIVESTOCK]}>
                        <LivestockManagement />
                    </ProtectedRoute>
                } 
              />

              <Route path="/workforce" element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_WORKFORCE]}>
                    <WorkforceManagement />
                  </ProtectedRoute>
                } />

              <Route path="/psnp/households" element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_PSNP]}>
                    <PsnpManagement />
                  </ProtectedRoute>
                } />

              <Route path="/psnp/transfers" element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_PSNP]}>
                    <TransferList/>
                  </ProtectedRoute>
                } />
              <Route path="/nutrition" element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_PSNP]}>
                    <NutritionManagement />
                  </ProtectedRoute>
                } />

              <Route path="/youth-employment" element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_PSNP]}>
                    <EmpowermentManagement />
                  </ProtectedRoute>
                } />

              <Route path="/model-villages" element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_PSNP]}>
                    <ModelVillageManagement />
                  </ProtectedRoute>
                } />

              <Route path="/watersheds" element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_WATERSHEDS]}>
                    <WatershedManagement />
                  </ProtectedRoute>
                } />
              <Route path="/land-use" element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_WATERSHEDS]}>
                    <LandUseManagement />
                  </ProtectedRoute>
                } />
              <Route path="/interventions" element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_WATERSHEDS]}>
                    <InterventionManagement />
                  </ProtectedRoute>
                } />

              <Route path="/communication/sms" element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_USERS]}>
                    <SmsDashboard />
                  </ProtectedRoute>
                } />

              <Route path="/input-distributions" element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_LAND]}>
                   < InputDistributions/>
                  </ProtectedRoute>
                } />

              <Route path="/irrigation" element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_LAND]}>
                    <IrrigationProjects/>
                  </ProtectedRoute>
                } />
              
              <Route path="/analytics" element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.ANALYTICS_OVERVIEW]}>
                    <AnalyticsDashboard />
                  </ProtectedRoute>
                } />
              <Route path="/strategic-plans" element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_PLAN]}>
                    <StrategicPlan />
                  </ProtectedRoute>
                } />
              <Route path="/strategic-plans-analytics" element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_PLAN]}>
                   < StrategicPlanAnalysis />
                  </ProtectedRoute>
                } />

              {/* FORESTRY MODULE ROUTES */}
              <Route path="/forestry/forests" element={
                <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_FOREST]}>
                  <ForestryForests />
                </ProtectedRoute>
              } />
              <Route path="/forestry/plantations" element={
                <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_FOREST]}>
                  <ForestryPlantations />
                </ProtectedRoute>
              } />
              <Route path="/forestry/nurseries" element={
                <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_FOREST]}>
                  <ForestryNurseries />
                </ProtectedRoute>
              } />
              <Route path="/forestry/projects" element={
                <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_FOREST]}>
                  <ForestryProjects />
                </ProtectedRoute>
              } />
              <Route path="/forestry/protections" element={
                <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_FOREST]}>
                  <ForestryProtections />
                </ProtectedRoute>
              } />
              <Route 
                  path="/nurseries" 
                  element={
                      <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_CROPS]}>
                          <NurseryManagement />
                      </ProtectedRoute>
                  } 
              />
              <Route 
                  path="/land-rehabilitation" 
                  element={
                      <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_REHABILITATION]}>
                          <LandRehabilitation />
                      </ProtectedRoute>
                  } 
              />
              <Route 
                  path="/crop/registration" 
                  element={
                      <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_CROP_REGISTRATION]}>
                          <CropRegistration />
                      </ProtectedRoute>
                  } 
              />
              <Route 
                  path="/seed/varieties" 
                  element={
                      <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_SEED_REGISTRATION]}>
                          <SeedVarietyManagement />
                      </ProtectedRoute>
                  } 
              />
              <Route 
                  path="/seed/registration" 
                  element={
                      <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_SEED_REGISTRATION]}>
                          <SeedRegistration />
                      </ProtectedRoute>
                  } 
              />
              <Route 
                  path="/irrigation-maintenance" 
                  element={
                      <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_IRRIGATION_MAINTENANCE]}>
                          <IrrigationMaintenance />
                      </ProtectedRoute>
                  } 
              />

              <Route 
                  path="/horticulture" 
                  element={
                      <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_HORTICULTURE]}>
                          <HorticultureManagement />
                      </ProtectedRoute>
                  } 
              />

              <Route 
                  path="/clean-water"
                  element={
                      <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_PSNP]}>
                          <WaterManagement />
                      </ProtectedRoute>
                  } 
              />  

              <Route 
                  path="/sanitation"
                  element={
                      <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_PSNP]}>
                          <SanitationManagement />
                      </ProtectedRoute>
                  } 
              />  
              <Route 
                  path="/hygiene"
                  element={
                      <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_PSNP]}>
                          <HygieneManagement />
                      </ProtectedRoute>
                  } 
              />  

              <Route 
                  path="/mechanization" 
                  element={
                      <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_MECHANIZATION]}>
                          <MechanizationManagement />
                      </ProtectedRoute>
                  } 
              />


              <Route 
                  path="/cooperative" 
                  element={
                      <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_COOPERATIVE]}>
                          <CooperativeManagement />
                      </ProtectedRoute>
                  } 
              />

              <Route 
                  path="/input-registration"
                  element={
                      <ProtectedRoute permissions={[APP_PERMISSIONS.INPUT_REGISTRATION]}>
                          <InputRegistrationManagement />
                      </ProtectedRoute>
                  } 
              />

              <Route 
                  path="/media/documents" 
                  element={
                      <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_MEDIA]}>
                          <DocumentManagement />
                      </ProtectedRoute>
                  } 
              />
              <Route 
                  path="/media/galleries" 
                  element={
                      <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_MEDIA]}>
                          <GalleryManagement />
                      </ProtectedRoute>
                  } 
              />
              <Route 
                  path="/media/videos" 
                  element={
                      <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_MEDIA]}>
                          <VideoManagement />
                      </ProtectedRoute>
                  } 
              />
              <Route 
                  path="/media/news" 
                  element={
                      <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_MEDIA]}>
                          <NewsManagement />
                      </ProtectedRoute>
                  } 
              />

              <Route 
                  path="/media/feedback" 
                  element={ 
                      <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_MEDIA]}>
                          <FeedbackList />
                      </ProtectedRoute>
                  } 
              />

              <Route
                  path="/report"
                  element={
                      <ProtectedRoute permissions={[APP_PERMISSIONS.ANALYTICS_OVERVIEW]}>
                          <Report />
                      </ProtectedRoute>
                  }
              />



              {/* ───────────────────────────────────────────────────────────── */}
              {/* HENOK'S ROUTES                                                */}
              {/* ───────────────────────────────────────────────────────────── */}

              <Route
                path="/extension/kebele-das"
                element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_FTC]}>
                    <KebeleDAs />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/extension/full-package-farmers"
                element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_FTC]}>
                    <FullPackageBeneficiaryFarmers />
                  </ProtectedRoute>
                }
              />

              <Route 
                path="/extension/extension-users" 
                element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_PSNP]}>
                    <ExtensionUsers />
                  </ProtectedRoute>
                } 
              />

              <Route
                path="/extension/model-farmers"
                element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_FTC]}>
                    <ModelFarmers />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/extension/sms-supervision"
                element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_FTC]}>
                    <MultilevelSMSSupervision />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/extension/farmers-field-days"
                element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_FTC]}>
                    <FarmersFieldDays />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/extension/video-based-extension"
                element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_FTC]}>
                    <VideoBasedExtension />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/extension/hotline-advisory"
                element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_FTC]}>
                    <HotlineAdvisory />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/extension/radio-programs"
                element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_FTC]}>
                    <RadioPrograms />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/extension/extension-materials"
                element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_FTC]}>
                    <ExtensionMaterials />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/partners/extension/partner-registry"
                element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_FTC]}>
                    <PartnerRegistry />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/partners/needs-assessment"
                element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_FTC]}>
                    <NeedsAssessment />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/partners/platform-forums"
                element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_FTC]}>
                    <PlatformForums />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/partners/consultative-forums"
                element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_FTC]}>
                    <ConsultativeForums />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/partners/partner-activities"
                element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_FTC]}>
                    <PartnerActivities />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/organizations/sub-kebele-cadres"
                element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_FTC]}>
                    <SubKebeleCadres />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/organizations/development-groups"
                element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_FTC]}>
                    <DevelopmentGroups />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/organizations/development-work-teams"
                element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_FTC]}>
                    <DevelopmentWorkTeams />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/organizations/commodity-clusters"
                element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_FTC]}>
                    <CommodityClusters />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/organizations/large-scale-clusters"
                element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_FTC]}>
                    <LargeScaleClusters />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/organizations/farmer-field-schools"
                element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_FTC]}>
                    <FarmerFieldSchools />
                  </ProtectedRoute>   
                }
              />

              <Route
                path="/organizations/group-peer-learning"
                element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_FTC]}>
                    <GroupPeerLearning />
                  </ProtectedRoute>   
                }
              />

              <Route
                path="/organizations/project-mand-e"
                element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_FTC]}>
                    <ProjectMandE />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/organizations/scalable-practices"
                element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_FTC]}>
                    <ScalablePractices />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/demonstrations/overview"
                element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_FTC]}>
                    <DemoOverview />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/demonstrations/adaptation-demos"
                element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_FTC]}>
                    <AdaptationDemos />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/demonstrations/promotional-demos"
                element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_FTC]}>
                    <PromotionalDemos />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/demonstrations/regular-ffs-demos"
                element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_FTC]}>
                    <RegularFfsDemos />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/demonstrations/demo-evaluations"
                element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_FTC]}>
                    <DemoEvaluations />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/ftc/equipment-auditing"
                element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_FTC]}>
                    <FtcEquipmentAuditing />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/ftc/demonstration-land"
                element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_FTC]}>
                    <FtcDemonstrationLand />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/ftc/ict-integration"
                element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_FTC]}>
                    <FtcIctIntegration />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/ftc/model-kebele-creation"
                element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_FTC]}>
                    <ModelKebeles />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/ftc/da-specialist-training"
                element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_FTC]}>
                    <DaSpecialistTraining />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/ftc/farmer-package-training"
                element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_FTC]}>
                    <FarmerPackageTraining />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/ftc/management-committees"
                element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_FTC]}>
                    <FtcManagementCommittees />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/ftc/experience-sharing"
                element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_FTC]}>
                    <ExperienceSharing />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/ftc/academic-upgrades"
                element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_FTC]}>
                    <DaAcademicUpgrades />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/gender/participation"
                element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_FTC]}>
                    <GenderParticipation />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/gender-hiv/appropriate-technologies"
                element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_FTC]}>
                    <AppropriateTechnologies />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/gender-hiv/gender-safeguard-training"
                element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_FTC]}>
                    <GenderSafeguardTraining />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/gender-hiv/female-staff-empowerment"
                element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_FTC]}>
                    <FemaleStaffEmpowerment />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/gender-hiv/model-families"
                element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_FTC]}>
                    <GenderModelFamilies />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/gender-hiv/child-daycare-support"
                element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_FTC]}>
                    <ChildDaycareSupport />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/gender-hiv/hiv-prevention-fund"
                element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_FTC]}>
                    <HivPreventionFund />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/gender-hiv/community-awareness"
                element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_FTC]}>
                    <CommunityAwareness />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/gender-hiv/youth-agri-enterprises"
                element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_FTC]}>
                    <YouthAgriEnterprises />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/gender-hiv/employment-creation"
                element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_FTC]}>
                    <EmploymentCreation />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/colleges/registry"
                element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_FTC]}>
                    <CollegeRegistry />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/colleges/student-enrollment"
                element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_FTC]}>
                    <StudentEnrollment />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/colleges/college-regulations"
                element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_FTC]}>
                    <CollegeRegulations />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/colleges/pedagogical-training"
                element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_FTC]}>
                    <PedagogicalTraining />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/colleges/supervision-audits"
                element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_FTC]}>
                    <CollegeSupervision />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/colleges/university-linkages"
                element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_FTC]}>
                    <UniversityLinkages />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/colleges/governance-readiness"
                element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_FTC]}>
                    <GovernanceReadiness />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/colleges/staff-registry"
                element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_FTC]}>
                    <StaffRegistry />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/colleges/infrastructure-farms"
                element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_FTC]}>
                    <InfrastructureFarms />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/colleges/curriculum-extension"
                element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_FTC]}>
                    <CurriculumExtension />
                  </ProtectedRoute>
                }
              />

              <Route 
                path="/colleges/research-technology" 
                element={
                  <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_FTC]}>
                    <ResearchTechnology />
                  </ProtectedRoute>
                } 
              />

              {/* COMING SOON FALLBACKS */}
              <Route path="/farmers" element={
                <ProtectedRoute permissions={[APP_PERMISSIONS.MANAGE_FARMERS]}>
                  <ComingSoon moduleName="Farmer Registration" />
                </ProtectedRoute>
              } />
              <Route path="/ftc" element={<ComingSoon moduleName="FTC Management" />} />
              <Route path="/land-parcels" element={<ComingSoon moduleName="Land Parcels" />} />
              <Route path="/crop-production" element={<ComingSoon moduleName="Crop Production" />} />
              <Route path="/pest-control" element={<ComingSoon moduleName="Pest & Disease Control" />} />
              <Route path="/psnp/households" element={<ComingSoon moduleName="PSNP Vulnerable Households" />} />
              <Route path="/geo-hierarchy" element={<ComingSoon moduleName="Geo-Hierarchy Mapping" />} />
            </Route>

            {/* 404 catch-all */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AntApp>
    </ConfigProvider>
  );
}