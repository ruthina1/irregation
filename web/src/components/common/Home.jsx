import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Layout, Button, Typography, Row, Col, Card, Space, Tag,
  ConfigProvider, Drawer, Menu, Modal, Form, Input,
  Checkbox, Divider, Carousel, Dropdown, Grid, message,
  Alert, Tooltip
} from 'antd';
import {
  TeamOutlined, ExperimentOutlined, GlobalOutlined, SafetyOutlined,
  AppstoreOutlined,FlagOutlined, BarChartOutlined, LockOutlined, UserOutlined,
  MenuOutlined, GlobalOutlined as LanguageIcon, ArrowRightOutlined,
  ArrowLeftOutlined, EnvironmentOutlined, FacebookFilled, TwitterSquareFilled,
  LinkedinFilled, YoutubeFilled, EyeOutlined,
  PhoneOutlined, MailOutlined, PictureOutlined,
  FileTextOutlined, SafetyCertificateOutlined,
  HomeOutlined, InfoCircleOutlined, DatabaseOutlined, CloudServerOutlined,
  CaretDownOutlined, DownloadOutlined, SearchOutlined, SolutionOutlined,
  ClusterOutlined, FilePdfOutlined, CheckCircleOutlined, UsergroupAddOutlined,
  AuditOutlined, BankOutlined, DeploymentUnitOutlined, StarFilled, FlagFilled,
  NodeIndexOutlined, DesktopOutlined, ContainerOutlined, RiseOutlined
} from '@ant-design/icons';

// Import local assets
import logo from "../../assets/IAIMS.png";
import agraLogo from "../../assets/agra.png";
import moa from "../../assets/moa.png";
import agritran from "../../assets/agritran.png";
import soil from "../../assets/soil.png";
import oie from "../../assets/oie.png";

// Import API and authentication store
import { authApi } from '../../services/api/authApi';
import { useAuthStore } from '../../store/authStore';

const { Header, Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;
const { useBreakpoint } = Grid;

// --- Multi-language Localization Dictionary ---
const localization = {
  en: {
    lang: 'English',
    systemName: 'IAIMS Regional Portal',
    fullName: 'Integrated Agriculture Information Management System',
    slogan: '"Agriculture is Beyond Production!"',
    client: 'Amhara National Regional State Bureau of Agriculture',
    heroTitle: 'Regional Agricultural Intelligence Ecosystem',
    heroSub: 'A unified, secure, centralized regional platform driving food sovereignty, macro-agronomy insights, and resource optimization across the Amhara Region.',
    heroDesc: 'Integrated Agriculture Information Management System (IAIMS) is the official digital platform of the Amhara National Regional State Bureau of Agriculture, designed to centralize agricultural information, improve planning, streamline service delivery, monitor agricultural programs, and support evidence-based decision-making.',
    loginBtn: 'Portal Login',
    viewDataBtn: 'Explore Insights',
    
    // About Section
    aboutHeading: 'About IAIMS Platform',
    aboutSub: 'Empowering governance, modernizing agricultural management, and accelerating regional transformation.',
    whatIsIaims: 'What is IAIMS?',
    whatIsIaimsDesc: 'IAIMS is an enterprise digital governance framework that consolidates state-wide agricultural datasets into actionable intelligence.',
    purposeTitle: 'Purpose',
    purposeDesc: 'To digitize agricultural administrative operations, establish data transparency, and optimize resource logistics across all administrative tiers.',
    objectivesTitle: 'Objectives',
    objectivesDesc: 'Standardize demand planning, automate input allocation, track field operations via GIS, and support evidence-based policymaking.',
    benefitsTitle: 'Benefits',
    benefitsDesc: 'Empowers farmers with targeted extension services, gives leadership live operational dashboards, and eliminates supply chain bottlenecks.',
    
    // Pillars
    pillar1: 'Digital Transformation',
    pillar1Desc: 'Digitizing extension, farmer registries, and administrative workflows.',
    pillar2: 'Data Integration',
    pillar2Desc: 'Unified data streams from FTCs, Woredas, Zones, and Regional Bureau.',
    pillar3: 'Decision Support',
    pillar3Desc: 'Real-time analytics and predictive modeling for agricultural policy.',
    pillar4: 'Transparency',
    pillar4Desc: 'Traceable input distribution and public performance dashboards.',
    pillar5: 'Resource Optimization',
    pillar5Desc: 'Efficient allocation of seed, fertilizer, machinery, and water resources.',
    pillar6: 'Agricultural Intelligence',
    pillar6Desc: 'GIS-enabled watershed tracking, pest surveillance, and climate forecasts.',

    // How IAIMS Works
    workflowTitle: 'How IAIMS Works',
    workflowSub: 'An end-to-end digital administrative lifecycle driving regional agricultural operations.',
    step1: 'Farmer Registration',
    step1Desc: 'Enrolling smallholders and profiling land holdings into state records.',
    step2: 'Demand Collection',
    step2Desc: 'Aggregating seasonal seed, fertilizer, and technology requirements.',
    step3: 'Planning',
    step3Desc: 'Formulating regional resource baselines and budget targets.',
    step4: 'Approval',
    step4Desc: 'Bureau & Zone authorization of optimized allocation plans.',
    step5: 'Input Allocation',
    step5Desc: 'Algorithmic distribution matching local soil and crop needs.',
    step6: 'Distribution',
    step6Desc: 'Traceable input delivery through primary unions & FTCs.',
    step7: 'Monitoring',
    step7Desc: 'Real-time field validation, DA reports, and satellite GIS audits.',
    step8: 'Reporting',
    step8Desc: 'Automated executive KPI analytics and strategic review.',

    // Stakeholders
    stakeholdersHeading: 'Platform Stakeholders',
    stakeholdersSub: 'Tailored digital services and responsibilities for every agricultural actor in the Amhara Region.',

    // Analytics
    analyticsHeading: 'Regional Operational Analytics',
    analyticsSub: 'Live operational KPIs and system metrics aggregated across all administrative nodes.',

    // Gallery
    galleryHeading: 'System & Field Media Gallery',
    gallerySub: 'Explore actual IAIMS platform interfaces, GIS mapping tools, and field deployments.',
    searchGallery: 'Search media gallery...',

    // Resources
    resourcesHeading: 'Resources & Download Center',
    resourcesSub: 'Access official manuals, annual reports, policies, guidelines, and training toolkits.',

    // Navigation & General
    home: 'Home',
    about: 'About IAIMS',
    howItWorks: 'How It Works',
    stakeholders: 'Stakeholders',
    coreSystems: 'Core Systems',
    dataAnalytics: 'Analytics',
    media: 'Media Gallery',
    resources: 'Downloads',
    news: 'News',
    contact: 'Contact',
    explore: 'Explore',
    newsTitle: 'Our News & Updates',
    partnersTitle: 'Our Development Partners',
    footerDesc: 'The official Integrated Agriculture Information Management ecosystem engineered for the Amhara National Regional State Bureau of Agriculture.',
    quickLinks: 'Quick Links',
    contactUs: 'Contact Us',
    privacyPolicy: 'Privacy Policy',
    termsOfUse: 'Terms of Use',
    accessInfo: 'Accessibility',
    securityNotice: 'Security Notice',
    allRightsReserved: 'All Institutional Governance Rights Reserved.',
    developedBy: 'Powered by Alyah Technologies',
    phone: '+251 58 226 4135',
    email: 'portal@amharaagri.gov.et',
    address: 'Bahir Dar, Ethiopia',
    loginModalTitle: 'Regional Gateway Login',
    loginModalSub: 'Enter authorized personnel credentials validated for the Regional tier.',
    usernamePlaceholder: 'Regional Account Email',
    passwordPlaceholder: 'Security Password Key',
    rememberMe: 'Remember Terminal',
    forgotPassword: 'Access Reset',
    authenticate: 'Authenticate Session',
    securityWarning: '🔒 WARNING: Restricted system node for authorized regional personnel only.',
  },
  am: {
    lang: 'አማርኛ',
    systemName: 'IAIMS የክልል ፖርታል',
    fullName: 'የተቀናጀ የግብርና መረጃ አስተዳደር ስርዓት',
    slogan: '“ግብርና ከማምረት በላይ ነው!”',
    client: 'የአማራ ብሔራዊ ክልላዊ መንግሥት የግብርና ቢሮ',
    heroTitle: 'የክልሉ ግብርና መረጃ ስነ-ምህዳር',
    heroSub: 'የአማራ ክልል የምግብ ዋስትናን ለማረጋገጥ፣ የማክሮ-አግሮኖሚ ግንዛቤዎችን ለማሳደግ እና የሀብት አጠቃቀምን ለማመቻቸት የተዘረጋ ማዕከላዊ እና ደህንነቱ የተጠበቀ ዲጂታል መድረክ።',
    heroDesc: 'የተቀናጀ የግብርና መረጃ አስተዳደር ስርዓት (IAIMS) የግብርና መረጃዎችን በማዕከላዊነት ለማደራጀት፣ እቅድን ለማሻሻል፣ የአገልግሎት አሰጣጥን ለማፋጠን እና በበቂ መረጃ ላይ የተመሰረተ ውሳኔ ለመስጠት የተዘጋጀ የአማራ ብሔራዊ ክልላዊ መንግሥት የግብርና ቢሮ ኦፊሴላዊ ዲጂታል መድረክ ነው።',
    loginBtn: 'ይግቡ',
    viewDataBtn: 'መረጃዎችን ይመልገቱ',
    
    aboutHeading: 'ስለ IAIMS መድረክ',
    aboutSub: 'የግብርና አስተዳደርን ማዘመን፣ ግልጽነትን መፍጠር እና የክልሉን የግብርና እድገት ማፋጠን።',
    whatIsIaims: 'IAIMS ምንድን ነው?',
    whatIsIaimsDesc: 'IAIMS የመንግስትን የግብርና መረጃዎች ወደ ተግባራዊ ውሳኔዎች የሚቀይር አጠቃላይ የዲጂታል አስተዳደር ስርዓት ነው።',
    purposeTitle: 'አላማ',
    purposeDesc: 'የግብርና ስራዎችን በዲጂታል ማከናወን፣ የመረጃ ግልጽነት መፍጠር እና በሁሉም ደረጃዎች የሀብት ስርጭትን ማመቻቸት።',
    objectivesTitle: 'ግብ',
    objectivesDesc: 'የግብአት ፍላጎት እቅድን ማደራጀት፣ የግብአት ክፍፍልን በሲስተም መምራት እና በጂ.አይ.ኤስ የመስክ ስራዎችን መከታተል።',
    benefitsTitle: 'ጥቅሞች',
    benefitsDesc: 'አርሶ አደሮች ፈጣን የኤክስቴሽን አገልግሎት እንዲያገኙ ማድረግ እና ለአመራሩ የቀጥታ መረጃ ማቅረብ።',

    pillar1: 'ዲጂታል ትራንስፎርሜሽን',
    pillar1Desc: 'የአርሶ አደር ምዝገባን እና የአስተዳደር ስራዎችን ዲጂታላይዝ ማድረግ።',
    pillar2: 'የመረጃ ቅንጅት',
    pillar2Desc: 'ከኤፍ.ቲ.ሲ፣ ከወረዳ፣ ከዞን እና ከቢሮ የሚመጡ መረጃዎችን ማቀናጀት።',
    pillar3: 'የውሳኔ ድጋፍ',
    pillar3Desc: 'ለግብርና ፖሊሲዎች የቀጥታ ትንታኔዎችን እና ትንበያዎችን ማቅረብ።',
    pillar4: 'ግልጽነት',
    pillar4Desc: 'የግብአት ስርጭትን በግልጽ መከታተል እና ይፋዊ መረጃዎችን ማሳየት።',
    pillar5: 'የሀብት አጠቃቀም',
    pillar5Desc: 'የምርጥ ዘር፣ ማዳበሪያ፣ ማሽነሪ እና የውሃ ሀብትን በብቃት መመደብ።',
    pillar6: 'የግብርና መረጃ ጥበብ',
    pillar6Desc: 'በጂ.አይ.ኤስ የተደገፈ የውሃshed ክትትል እና የተባይ ቁጥጥር።',

    workflowTitle: 'IAIMS እንዴት ይሰራል?',
    workflowSub: 'የክልሉን የግብርና ተግባራት የሚያፋጥን ባለ 8-ደረጃ ዲጂታል የስራ ሂደት።',
    step1: 'የአርሶ አደር ምዝገባ',
    step1Desc: 'አርሶ አደሮችን እና የመሬት ይዞታቸውን በዲጂታል መመዝገብ።',
    step2: 'የፍላጎት ስብስብ',
    step2Desc: 'የወቅቱን የምርጥ ዘር፣ ማዳበሪያ እና ቴክኖሎጂ ፍላጎት መሰብሰብ።',
    step3: 'እቅድ ማዘጋጀት',
    step3Desc: 'የክልሉን የሀብት እና የበጀት ፍላጎት በሲስተም ማቀድ።',
    step4: 'ማጽደቅ',
    step4Desc: 'በዞን እና በቢሮ ደረጃ የተዘጋጀውን እቅድ ማረጋገጥ እና ማጽደቅ።',
    step5: 'የግብአት ድልድል',
    step5Desc: 'እንደ አፈር እና ሰብል አይነት ግብአቶችን በሳይንሳዊ መንገድ መደደብ።',
    step6: 'ስርጭት',
    step6Desc: 'በህብረት ስራ ማህበራት እና በኤፍ.ቲ.ሲ በኩል ግብአቶችን ማሰራጨት።',
    step7: 'ክትትል',
    step7Desc: 'በልማት ጣቢያ ሰራተኞች እና በሳተላይት ጂ.አይ.ኤስ የመስክ ስራዎችን መከታተል።',
    step8: 'ሪፖርት ማድረግ',
    step8Desc: 'የአፈፃፀም ሪፖርቶችን እና ዳሽቦርዶችን በራስ-ሰር ማዘጋጀት።',

    stakeholdersHeading: 'የመድረኩ ተጠቃሚዎች',
    stakeholdersSub: 'በአማራ ክልል ለሚገኙ ሁሉም የግብርና ባለድርሻ አካላት የተዘጋጁ ዲጂታል አገልግሎቶች።',

    analyticsHeading: 'የቀጥታ የክልል አፈፃፀም መገለጫዎች',
    analyticsSub: 'በሁሉም የአስተዳደር ደረጃዎች የተሰበሰቡ የቀጥታ የግብርና መረጃዎች።',

    galleryHeading: 'የሲስተም እና የመስክ ምስሎች',
    gallerySub: 'የIAIMS ሶፍትዌር ዳሽቦርዶችን፣ የጂ.አይ.ኤስ ካርታዎችን እና የመስክ ተግባራትን ይመልከቱ።',
    searchGallery: 'ምስሎችን ይፈልጉ...',

    resourcesHeading: 'የመረጃ እና ማውረጃ ማዕከል',
    resourcesSub: 'ኦፊሴላዊ መመሪያዎችን፣ ዓመታዊ ሪፖርቶችን፣ ፖሊሲዎችን እና የስልጠና ቁሳቁሶችን ያውርዱ።',

    home: 'መነሻ',
    about: 'ስለ IAIMS',
    howItWorks: 'እንዴት ይሰራል',
    stakeholders: 'ባለድርሻ አካላት',
    coreSystems: 'ዋና ስርዓቶች',
    dataAnalytics: 'ዳታ እና ትንታኔ',
    media: 'ሚዲያ እና ጋለሪ',
    resources: 'ማውረጃዎች',
    news: 'ዜናዎቻችን',
    contact: 'አግኙን',
    explore: 'ተጨማሪ',
    newsTitle: 'ዜናዎቻችን',
    partnersTitle: 'አጋሮቻችን',
    footerDesc: 'ለአማራ ብሔራዊ ክልላዊ መንግሥት የግብርና ቢሮ የተሰራ ኦፊሴላዊ የተቀናጀ የግብርና መረጃ አስተዳደር ስነ-ምህዳር።',
    quickLinks: 'ፈጣን አገናኞች',
    contactUs: 'አግኙን',
    privacyPolicy: 'የግላዊነት ፖሊሲ',
    termsOfUse: 'የአጠቃቀም ውል',
    accessInfo: 'ተደራሽነት',
    securityNotice: 'የደህንነት ማስታወቂያ',
    allRightsReserved: 'ሁሉም የአስተዳደር መብቶች ተጠብቀዋል።',
    developedBy: 'Powered by Alyah Technologies',
    phone: '+251 58 226 4135',
    email: 'portal@amharaagri.gov.et',
    address: 'ባህር ዳር፣ ኢትዮጵያ',
    loginModalTitle: 'የክልል መግቢያ',
    loginModalSub: 'ለክልል ደረጃ የተረጋገጠ ሰራተኛ ማረጋገጫ ያስገቡ።',
    usernamePlaceholder: 'የክልል መለያ ኢሜይል',
    passwordPlaceholder: 'የደህንነት ይሁንታ ቁልፍ',
    rememberMe: 'ተርሚናል አስታውስ',
    forgotPassword: 'መዳረሻ ዳግም አስጀምር',
    authenticate: 'የተርሚናል ክፍለ ጊዜ አረጋግጥ',
    securityWarning: '🔒 ማስታወቂያ፦ ይህ ስርዓት ለተፈቀደላቸው የክልል ኦፕሬተሮች ብቻ የተገደበ ነው።',
  }
};

// --- SCROLL REVEAL WRAPPER COMPONENT ---
function ScrollReveal({ children, delay = 0, direction = 'up', style = {} }) {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    const currentRef = domRef.current;
    if (currentRef) observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, []);

  const getTransform = () => {
    if (isVisible) return 'translate3d(0, 0, 0)';
    if (direction === 'up') return 'translate3d(0, 35px, 0)';
    if (direction === 'down') return 'translate3d(0, -35px, 0)';
    if (direction === 'left') return 'translate3d(35px, 0, 0)';
    if (direction === 'right') return 'translate3d(-35px, 0, 0)';
    return 'translate3d(0, 35px, 0)';
  };

  return (
    <div
      ref={domRef}
      style={{
        ...style,
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transition: `opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
}

// --- ANIMATED SCROLL-TRIGGERED NUMERIC METRIC COMPONENT ---
function AnimatedMetric({ value }) {
  const [displayValue, setDisplayValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const metricRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
        }
      },
      { threshold: 0.25 }
    );

    const currentRef = metricRef.current;
    if (currentRef) observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [hasAnimated]);

  useEffect(() => {
    if (!hasAnimated) return;

    const rawValue = String(value);
    const cleanString = rawValue.replace(/,/g, '').replace(/\+/g, '').replace(/%/g, '');
    const finalNumber = parseFloat(cleanString);

    if (isNaN(finalNumber)) {
      setDisplayValue(value);
      return;
    }

    let start = 0;
    const duration = 1500;
    const stepTime = 16;
    const totalSteps = duration / stepTime;
    const increment = finalNumber / totalSteps;

    const interval = setInterval(() => {
      start += increment;
      if (start >= finalNumber) {
        setDisplayValue(finalNumber);
        clearInterval(interval);
      } else {
        setDisplayValue(start);
      }
    }, stepTime);

    return () => clearInterval(interval);
  }, [hasAnimated, value]);

  const formatNumber = () => {
    const stringVal = String(value);
    const suffixPlus = stringVal.includes('+') ? '+' : '';
    const suffixPercent = stringVal.includes('%') ? '%' : '';

    if (typeof displayValue === 'number') {
      const parts = String(value).split('.');
      const fractionDigits = parts.length > 1 ? parts[1].replace(/[^0-9]/g, '').length : 0;
      const formattedNum = displayValue.toFixed(fractionDigits).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return `${formattedNum}${suffixPlus}${suffixPercent}`;
    }
    return displayValue;
  };

  return <span ref={metricRef}>{hasAnimated ? formatNumber() : '0'}</span>;
}

// --- SRS Core Functional Modules ---
const srsModules = [
  { key: 'extension', icon: <TeamOutlined />, title: 'Agricultural Extension & Capacity Building', desc: 'Manage extension workforce, communication, training, and stakeholder engagement.', color: '#1e5128' },
  { key: 'crop', icon: <ExperimentOutlined />, title: 'Crop Development, Protection & Post-Harvest', desc: 'Seasonal production tracking, pest surveillance, post-harvest loss reduction.', color: '#2C9647' },
  { key: 'horticulture', icon: <GlobalOutlined />, title: 'Horticulture & Irrigation Water Management', desc: 'Irrigation assets, vegetable/spice production, coffee and fruit development.', color: '#1e5128' },
  { key: 'natural', icon: <SafetyOutlined />, title: 'Natural Resource Development & Conservation', desc: 'Watershed management, forest cover, soil fertility improvement.', color: '#2C9647' },
  { key: 'investment', icon: <AppstoreOutlined />, title: 'Agricultural Investment & Input Supply', desc: 'Fertilizers, seeds, machinery, credit and loan distribution.', color: '#ca8a04' },
  { key: 'food', icon: <SafetyCertificateOutlined />, title: 'Food & Nutrition System', desc: 'Nutrition programs, maternal support, post-harvest loss reduction.', color: '#1e5128' },
  { key: 'irrigation', icon: <CloudServerOutlined />, title: 'Irrigation Infrastructure Development', desc: 'Monitor new projects, irrigable land development, beneficiary tracking.', color: '#2C9647' },
  { key: 'ftc', icon: <HomeOutlined />, title: 'Farmer Training Center (FTC) Management', desc: 'FTC registration, infrastructure, capacity levels, demonstration activities.', color: '#ca8a04' },
  { key: 'watershed', icon: <DatabaseOutlined />, title: 'Watershed Registration & Data', desc: 'Basic watershed data, stage calculations, performance thresholds.', color: '#1e5128' },
  { key: 'model_village', icon: <StarFilled />, title: 'Model Village Certification', desc: 'Certification criteria, multi-sectoral support, nutrition integration.', color: '#2C9647' },
  { key: 'planning', icon: <BarChartOutlined />, title: 'Planning, Monitoring & Evaluation', desc: 'Strategic plans, M&E activities, budget preparation, construction monitoring.', color: '#ca8a04' },
  { key: 'reporting', icon: <FileTextOutlined />, title: 'Reporting & Analytics', desc: 'Automated reports, GIS dashboards, real-time KPIs, decision support.', color: '#1e5128' }
];

// --- Key Stakeholders (Amhara Region scope) ---
const stakeholdersData = [
  {
    key: 'farmers',
    title: 'Farmers',
    icon: <UserOutlined />,
    responsibilities: 'Register land holdings, submit seasonal input demand, record yield outcomes.',
    services: 'Digital extension advice, input vouchers, market prices, weather updates.',
    benefits: 'Guaranteed input access, fair pricing, direct advisory connection with DAs.'
  },
  {
    key: 'da',
    title: 'Development Agents (DAs)',
    icon: <SolutionOutlined />,
    responsibilities: 'Profile local farmers, capture watershed health, conduct field advisory.',
    services: 'Mobile offline data collection, pest reporting tools, demonstration tracking.',
    benefits: 'Simplified field data entry, clear targets, automated workflow reporting.'
  },
  {
    key: 'cooperatives',
    title: 'Cooperatives & Unions',
    icon: <ClusterOutlined />,
    responsibilities: 'Manage local inventory stock, aggregate demand, distribute inputs.',
    services: 'Inventory management dashboard, stock dispatch, beneficiary verification.',
    benefits: 'Zero stock leakage, streamlined logistics, automated financial reconcile.'
  },
  {
    key: 'woreda',
    title: 'Woreda Offices',
    icon: <BankOutlined />,
    responsibilities: 'Validate local agricultural plans, supervise FTC operations, compile reports.',
    services: 'Woreda analytics portal, DA oversight, local emergency response.',
    benefits: 'Real-time visibility across all Kebeles, evidence-based planning.'
  },
  {
    key: 'zone',
    title: 'Zone Offices',
    icon: <DeploymentUnitOutlined />,
    responsibilities: 'Consolidate Woreda plans, monitor regional campaign execution, resource distribution.',
    services: 'Zone performance metrics, multi-woreda GIS tracking, resource rebalancing.',
    benefits: 'Proactive intervention, enhanced resource logistics, accurate monitoring.'
  },
  {
    key: 'regional',
    title: 'Regional Bureau',
    icon: <AuditOutlined />,
    responsibilities: 'Policy formulation, macro-level resource planning, inter-zonal coordination.',
    services: 'Executive BI dashboards, strategic scenario planning, state-wide analytics.',
    benefits: 'Complete state visibility, data-backed policy making, rapid program deployment.'
  },
  {
    key: 'partners',
    title: 'Development Partners',
    icon: <UsergroupAddOutlined />,
    responsibilities: 'Fund targeted agricultural projects, provide technical capacity, support innovation.',
    services: 'Impact monitoring dashboards, grant tracking, multi-sectoral reports.',
    benefits: 'Transparent impact evaluation, verifiable ROI, synchronized program execution.'
  }
];

// --- Operational Analytics KPIs ---
const operationalMetrics = [
  { key: 'farmers', label: 'Registered Farmers', value: '4,250,000+', icon: <UserOutlined /> },
  { key: 'cooperatives', label: 'Cooperatives & Unions', value: '1,850+', icon: <ClusterOutlined /> },
  { key: 'das', label: 'Development Agents (DAs)', value: '14,200+', icon: <SolutionOutlined /> },
  { key: 'ftcs', label: 'Farmer Training Centers (FTCs)', value: '3,180', icon: <HomeOutlined /> },
  { key: 'watersheds', label: 'Watersheds Managed', value: '890', icon: <DatabaseOutlined /> },
  { key: 'irrigation', label: 'Irrigation Schemes', value: '640', icon: <CloudServerOutlined /> },
  { key: 'warehouses', label: 'Warehouses / Stores', value: '420', icon: <BankOutlined /> },
  { key: 'fertilizer', label: 'Fertilizer Distributed (MT)', value: '380,000', icon: <ExperimentOutlined /> },
  { key: 'seeds', label: 'Certified Seeds Distributed (MT)', value: '45,000', icon: <SafetyCertificateOutlined /> },
  { key: 'machinery', label: 'Machinery Allocated (Units)', value: '3,200', icon: <AppstoreOutlined /> },
  { key: 'projects', label: 'Active Projects', value: '128', icon: <BarChartOutlined /> },
  { key: 'users', label: 'Active System Users', value: '85,000+', icon: <TeamOutlined /> }
];

// --- Media Gallery Data ---
const galleryMediaItems = [
  { id: 1, title: 'IAIMS Executive BI Analytics Dashboard', category: 'Dashboards', img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80', desc: 'Real-time regional agricultural performance, crop yield forecasts, and input tracking.' },
  { id: 2, title: 'Interactive Watershed GIS Mapping Tool', category: 'GIS', img: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80', desc: 'Spatial visualization of soil fertility, moisture indices, and irrigation catchments.' },
  { id: 3, title: 'Mobile DA Offline Field Data Collection', category: 'Mobile Data', img: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&w=800&q=80', desc: 'Development Agents registering smallholders offline using smartphone GPS coordinates.' },
  { id: 4, title: 'Regional Cooperative Inventory Management', category: 'Inventory', img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80', desc: 'Tracking fertilizer dispatch and seed warehouse stock balances across unions.' },
  { id: 5, title: 'Development Agents System Training Workshop', category: 'Training', img: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80', desc: 'Hands-on capacity building session for Woreda extension supervisors.' },
  { id: 6, title: 'Highland Wheat Cluster Inspection', category: 'Field Inspections', img: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80', desc: 'Bureau officials verifying wheat disease surveillance data in East Gojjam.' }
];

// --- Download Center Resources ---
const downloadableResources = [
  { id: 1, title: 'IAIMS System User Manual v3.2', category: 'User Manual', size: '14.2 MB', date: '2026-05-10', icon: <DesktopOutlined /> },
  { id: 2, title: 'ANRS Annual Agricultural Statistics Report 2025/26', category: 'Annual Reports', size: '28.5 MB', date: '2026-04-15', icon: <FilePdfOutlined /> },
  { id: 3, title: 'Regional Fertilizer & Seed Subsidy Implementation Policy', category: 'Policies', size: '4.8 MB', date: '2026-02-20', icon: <ContainerOutlined /> },
  { id: 4, title: 'Development Agent Mobile App Operational Guideline', category: 'Guidelines', size: '6.1 MB', date: '2026-03-01', icon: <FileTextOutlined /> },
  { id: 5, title: 'Farmer Registration & Demand Collection Standard Forms', category: 'Forms', size: '2.3 MB', date: '2026-01-12', icon: <SolutionOutlined /> },
  { id: 6, title: 'Amhara Region Crop Calendar & Planting Schedule 2026', category: 'Agricultural Calendar', size: '8.7 MB', date: '2026-05-01', icon: <NodeIndexOutlined /> },
  { id: 7, title: 'FTC Extension Workforce Capacity Toolkit', category: 'Training Materials', size: '19.4 MB', date: '2026-03-18', icon: <UsergroupAddOutlined /> }
];

const carouselItems = [
  { img: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80', title: 'Highland Teff Production Optimization', desc: 'Applying modern row-planting methodologies and seed selections across East Gojjam.' },
  { img: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80', title: 'Ribb Basin Irrigation Expansion', desc: 'Increasing dry season harvests using modern water management infrastructure.' },
  { img: 'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?auto=format&fit=crop&w=1200&q=80', title: 'Wheat Initiative Integration', desc: 'Promoting robust, disease-resistant crop strains to establish food autonomy.' }
];

const newsItems = [
  { 
    id: 'digital-advisory',
    title: 'የክልል የግብርና ቢሮ አዲስ ዲጂታል አገልግሎት አስጀመረ', 
    date: '2026-05-20', 
    summary: 'አርሶ አደሮች በሞባይል የግብርና ምክር እና የገበያ መረጃ ማግኘት ይችላሉ።',
    img: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&w=600&q=80',
    content: 'አዲሱ የዲጂታል ግብርና ማስፋፊያ አገልግሎት አርሶ አደሮች የአየር ንብረት ትንበያዎችን፣ የሰብል በሽታዎችን መከላከያ መንገዶችን እና የገበያ ዋጋዎችን በፈጣን የሞባይል መልእክቶች እንዲያገኙ ያስችላል።'
  },
  { 
    id: 'rainfall-forecast',
    title: 'የመኸር ወቅት የዝናብ ትንበያ ሪፖርት ታትሟል', 
    date: '2026-05-18', 
    summary: 'ለመኸር ወቅት የሚጠበቀው ዝናብ ከመደበኛ በላይ ሊሆን እንደሚችል ተገልጿል።',
    img: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80',
    content: 'በመጪው የመኸር ወቅት በተለያዩ የክልሉ አካባቢዎች መደበኛና ከመደበኛ በላይ ዝናብ ሊኖር እንደሚችል የአየር ንብረት ባለሙያዎች አስታውቀዋል።'
  }
];

const partnersList = [
  { name: 'MoA', logo: moa },
  { name: 'AGRA', logo: agraLogo },
  { name: 'AGRtra', logo: agritran},
  { name: 'Soil', logo: soil},
  { name: 'Oie', logo: oie}
];

// Fallback placeholder used whenever an image fails to load at runtime
const FALLBACK_IMG = "data:image/svg+xml;utf8," + encodeURIComponent(`
<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600'>
  <rect width='100%' height='100%' fill='#eef3ec'/>
  <text x='50%' y='50%' font-family='Arial' font-size='22' fill='#1e5128' text-anchor='middle' dy='.3em'>IAIMS</text>
</svg>`);

const handleImgError = (e) => {
  e.target.onerror = null;
  e.target.src = FALLBACK_IMG;
};

export default function IAIMSRegionalLandingPage() {
  const [lang, setLang] = useState('en');
  const [isLoginVisible, setIsLoginVisible] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  
  // Gallery Filter & Search
  const [mediaCategory, setMediaCategory] = useState('All');
  const [mediaSearch, setMediaSearch] = useState('');
  const [previewMedia, setPreviewMedia] = useState(null);

  // Login Handling
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState(null);

  const screens = useBreakpoint();
  const t = localization[lang];

  const handleLoginSubmit = async (values) => {
    setLoginError(null);
    setLoginLoading(true);
    try {
      const { data } = await authApi.login({
        email: values.email,
        password: values.password,
      });
      login(data.data.user, data.data.token);
      message.success('Authentication successful! Redirecting to dashboard...');
      setIsLoginVisible(false);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Unable to sign in. Please check credentials.';
      setLoginError(msg);
    } finally {
      setLoginLoading(false);
    }
  };

  // --- Slimmed-down primary navigation (grouped into fewer top-level links) ---
  const navItems = [
    { key: 'home', label: t.home, icon: <HomeOutlined />, href: '#home', onClick: () => setSelectedNews(null) },
    { key: 'about', label: t.about, icon: <InfoCircleOutlined />, href: '#about', onClick: () => setSelectedNews(null) },
    { key: 'workflow', label: t.howItWorks, icon: <NodeIndexOutlined />, href: '#how-it-works', onClick: () => setSelectedNews(null) },
    {
      key: 'explore',
      label: (
        <span>
          {t.explore} <CaretDownOutlined style={{ fontSize: 10, marginLeft: 2 }} />
        </span>
      ),
      icon: <AppstoreOutlined />,
      children: [
        { key: 'systems', label: t.coreSystems, href: '#modules' },
        { key: 'stakeholders', label: t.stakeholders, href: '#stakeholders' },
        { key: 'media', label: t.media, href: '#media-gallery' },
        { key: 'resources', label: t.resources, href: '#resources' }
      ]
    },
    { key: 'analytics', label: t.dataAnalytics, icon: <BarChartOutlined />, href: '#analytics', onClick: () => setSelectedNews(null) },
    { key: 'contact', label: t.contact, icon: <MailOutlined />, href: '#contact', onClick: () => setSelectedNews(null) }
  ];

  const renderSectionHeader = (titleText, subtitleText) => (
    <div style={styles.sectionHeaderContainer}>
      <h2 style={styles.sectionTitleStyle}>{titleText}</h2>
      <div style={styles.leafSeparatorWrapper}>
        <div style={styles.separatorLine}></div>
        <div style={styles.leafBox}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M2 22c6-1 10-6 10-12M12 10c0-4 3-7 6-8M12 10c-3-2-7-2-10 1M8 17c4-1 6-3 7-6" stroke="#2C9647" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <div style={styles.separatorLine}></div>
      </div>
      {subtitleText && (
        <Paragraph type="secondary" style={styles.sectionSubtitleStyle}>
          {subtitleText}
        </Paragraph>
      )}
    </div>
  );

  const filteredMedia = galleryMediaItems.filter(item => {
    const matchesCat = mediaCategory === 'All' || item.category === mediaCategory;
    const matchesSearch = item.title.toLowerCase().includes(mediaSearch.toLowerCase()) || item.desc.toLowerCase().includes(mediaSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const languageMenuOptions = {
    items: [
      { key: 'en', label: 'English', onClick: () => setLang('en') },
      { key: 'am', label: 'አማርኛ', onClick: () => setLang('am') }
    ]
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1e5128',
          colorSuccess: '#2C9647',
          borderRadius: 8,
          fontFamily: 'Inter, Montserrat, sans-serif',
        }
      }}
    >
      <Layout style={{ minHeight: '100vh', background: '#f9fafb' }} className="responsive-container">
        
        {/* --- TOP INFOBAR --- */}
        <div style={styles.topInfoBar}>
          <div style={{ ...styles.innerContainerFlex, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Space size="large" wrap style={styles.topBarContactSpace(screens.xs)}>
              <span><EnvironmentOutlined style={{ color: '#ca8a04' }} /> {t.address}</span>
              {!screens.xs && <span><PhoneOutlined style={{ color: '#ca8a04' }} /> {t.phone}</span>}
              {!screens.xs && <span><MailOutlined style={{ color: '#ca8a04' }} /> {t.email}</span>}
            </Space>
            {!screens.xs && (
              <Text style={{ color: '#ca8a04', fontStyle: 'italic', fontWeight: 600, fontSize: 12 }}>
                {t.slogan}
              </Text>
            )}
          </div>
        </div>

        {/* --- NAVIGATION HEADER --- */}
        <Header style={styles.header}>
          <div style={styles.innerContainerFlex}>
            <div style={{ cursor: 'pointer', ...styles.logoGroup }} onClick={() => setSelectedNews(null)}>
              <img src={logo} alt="IAIMS Logo" style={styles.logoAsset} onError={handleImgError} />
            </div>

            {screens.md ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', minWidth: 0, marginLeft: 24 }}>
                <Menu
                  mode="horizontal"
                  disabledOverflow
                  style={{ borderBottom: 'none', background: 'transparent', flex: 1, justifyContent: 'flex-end' }}
                  items={navItems.map(item => (item.children ? {
                    key: item.key,
                    icon: item.icon,
                    label: item.label,
                    children: item.children.map(child => ({
                      key: child.key,
                      label: <a href={child.href} onClick={() => setSelectedNews(null)}>{child.label}</a>,
                    })),
                  } : {
                    key: item.key,
                    icon: item.icon,
                    label: <a href={item.href} onClick={item.onClick}>{item.label}</a>,
                  }))}
                />

                <Space style={{ marginLeft: 16 }} size="small">
                  <Dropdown menu={languageMenuOptions} placement="bottomRight" trigger={['click']}>
                    <Button type="default" icon={<LanguageIcon style={{ color: '#1e5128' }} />} style={styles.outlineLangBtn}>
                      {t.lang} <CaretDownOutlined style={{ fontSize: 10 }} />
                    </Button>
                  </Dropdown>
                  <Button type="primary" icon={<UserOutlined />} onClick={() => setIsLoginVisible(true)} style={styles.heroPrimaryBtnHeader}>
                    {t.loginBtn}
                  </Button>
                </Space>
              </div>
            ) : (
              <Button type="text" icon={<MenuOutlined style={{ fontSize: 22, color: '#1e5128' }} />} onClick={() => setMobileMenuOpen(true)} />
            )}
          </div>
        </Header>

        <Content>
          {/* --- ARTICLE DETAIL VIEW --- */}
          {selectedNews ? (
            <div style={{ ...styles.gridContainer, padding: '40px 24px', minHeight: '60vh' }}>
              <Button onClick={() => setSelectedNews(null)} icon={<ArrowLeftOutlined />} style={{ marginBottom: 24 }}>
                Back to Portal
              </Button>
              <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <Row gutter={[32, 32]}>
                  <Col xs={24} md={12}>
                    <img src={selectedNews.img} alt={selectedNews.title} style={{ width: '100%', borderRadius: 8 }} onError={handleImgError} />
                  </Col>
                  <Col xs={24} md={12}>
                    <Tag color="green" style={{ marginBottom: 12 }}>{selectedNews.date}</Tag>
                    <Title level={2} style={{ color: '#1e5128', marginTop: 0 }}>{selectedNews.title}</Title>
                    <Paragraph style={{ fontSize: 16, lineHeight: 1.8 }}>{selectedNews.content || selectedNews.summary}</Paragraph>
                  </Col>
                </Row>
              </Card>
            </div>
          ) : (
            <>
              {/* --- 1. HERO SECTION WITH CLEAR SYSTEM DESCRIPTION --- */}
              <section id="home" style={styles.heroSection}>
                <Carousel autoplay autoplaySpeed={5000} effect="fade" style={styles.carousel}>
                  {carouselItems.map((item, idx) => (
                    <div key={idx}>
                      <div style={{ ...styles.carouselSlide, backgroundImage: `linear-gradient(0deg, rgba(10,26,14,0.78), rgba(10,26,14,0.5)), url(${item.img})` }}>
                        <div style={styles.carouselContent}>
                          <ScrollReveal direction="down">
                            <Tag color="#ca8a04" style={{ color: '#111827', fontWeight: 700, padding: '4px 14px', fontSize: 13, marginBottom: 16, borderRadius: 20 }}>
                              {t.client}
                            </Tag>
                          </ScrollReveal>

                          <ScrollReveal delay={0.1}>
                            <Title level={1} style={styles.heroMainTitleText}>{item.title}</Title>
                          </ScrollReveal>

                          <ScrollReveal delay={0.2}>
                            <Paragraph style={styles.heroDescriptionText}>{item.desc}</Paragraph>
                          </ScrollReveal>

                          <ScrollReveal delay={0.3}>
                            <div style={styles.heroSystemDescBox}>
                              <Text style={{ color: '#fff', fontSize: 14, lineHeight: 1.6 }}>
                                {t.heroDesc}
                              </Text>
                            </div>
                          </ScrollReveal>

                          <ScrollReveal delay={0.4}>
                            <Space size="middle" wrap style={{ justifyContent: 'center' }}>
                              <Button type="primary" size="large" icon={<LockOutlined />} onClick={() => setIsLoginVisible(true)} style={styles.heroPrimaryBtn}>
                                {t.loginBtn}
                              </Button>
                              <Button size="large" href="#about" style={styles.heroSecondaryBtn}>
                                {t.about} <ArrowRightOutlined />
                              </Button>
                            </Space>
                          </ScrollReveal>
                        </div>
                      </div>
                    </div>
                  ))}
                </Carousel>
              </section>

              {/* --- 2. ABOUT IAIMS SECTION --- */}
              <section id="about" style={styles.whiteSection}>
                <div style={styles.gridContainer}>
                  <ScrollReveal>
                    {renderSectionHeader(t.aboutHeading, t.aboutSub)}
                  </ScrollReveal>

                  <Row gutter={[24, 24]} align="stretch" style={{ marginBottom: 40 }}>
                    {[
                      { title: t.whatIsIaims, desc: t.whatIsIaimsDesc, icon: <InfoCircleOutlined style={styles.aboutIconStyle} /> },
                      { title: t.purposeTitle, desc: t.purposeDesc, icon: <FlagFilled style={styles.aboutIconStyle} /> },
                      { title: t.objectivesTitle, desc: t.objectivesDesc, icon: <StarFilled style={styles.aboutIconStyle} /> },
                      { title: t.benefitsTitle, desc: t.benefitsDesc, icon: <CheckCircleOutlined style={styles.aboutIconStyle} /> }
                    ].map((card, idx) => (
                      <Col xs={24} md={12} lg={6} key={idx}>
                        <ScrollReveal delay={idx * 0.1} style={{ height: "100%" }}>
                          <Card bordered style={styles.aboutInfoCard} className="hover-lift-card">
                            {card.icon}
                            <Title level={4} style={styles.aboutCardTitle}>{card.title}</Title>
                            <Paragraph type="secondary" style={styles.aboutCardDesc}>{card.desc}</Paragraph>
                          </Card>
                        </ScrollReveal>
                      </Col>
                    ))}
                  </Row>

                  <ScrollReveal>
                    <Title level={4} style={{ textAlign: 'center', color: '#1e5128', marginBottom: 28, fontWeight: 700 }}>
                      Core Digital Capabilities & Platform Pillars
                    </Title>
                  </ScrollReveal>

                  <Row gutter={[20, 20]} align="stretch">
                    {[
                      { title: t.pillar1, desc: t.pillar1Desc, icon: <DesktopOutlined /> },
                      { title: t.pillar2, desc: t.pillar2Desc, icon: <ClusterOutlined /> },
                      { title: t.pillar3, desc: t.pillar3Desc, icon: <BarChartOutlined /> },
                      { title: t.pillar4, desc: t.pillar4Desc, icon: <SafetyOutlined /> },
                      { title: t.pillar5, desc: t.pillar5Desc, icon: <AppstoreOutlined /> },
                      { title: t.pillar6, desc: t.pillar6Desc, icon: <GlobalOutlined /> }
                    ].map((pillar, idx) => (
                      <Col xs={24} sm={12} md={8} key={idx}>
                        <ScrollReveal delay={idx * 0.08} style={{ height: "100%" }}>
                          <div className="hover-lift-card" style={{ padding: 24, borderRadius: 12, border: '1px solid #e5e7eb', background: '#fff', height: '100%' }}>
                            <div style={{ fontSize: 28, color: '#1e5128', marginBottom: 12 }}>{pillar.icon}</div>
                            <Title level={5} style={{ margin: '0 0 8px', color: '#111827', fontWeight: 700 }}>{pillar.title}</Title>
                            <Paragraph type="secondary" style={{ margin: 0, fontSize: 13, lineHeight: 1.5 }}>{pillar.desc}</Paragraph>
                          </div>
                        </ScrollReveal>
                      </Col>
                    ))}
                  </Row>
                </div>
              </section>

              {/* --- 3. HOW IAIMS WORKS SECTION --- */}
              <section id="how-it-works" style={styles.greySection}>
                <div style={styles.gridContainer}>
                  <ScrollReveal>
                    {renderSectionHeader(t.workflowTitle, t.workflowSub)}
                  </ScrollReveal>

                  <div style={{ marginTop: 40, position: 'relative' }} className="workflow-track">
                    <Row gutter={[16, 24]} align="stretch">
                      {[
                        { step: '01', title: t.step1, desc: t.step1Desc, icon: <UserOutlined /> },
                        { step: '02', title: t.step2, desc: t.step2Desc, icon: <SolutionOutlined /> },
                        { step: '03', title: t.step3, desc: t.step3Desc, icon: <BarChartOutlined /> },
                        { step: '04', title: t.step4, desc: t.step4Desc, icon: <CheckCircleOutlined /> },
                        { step: '05', title: t.step5, desc: t.step5Desc, icon: <AppstoreOutlined /> },
                        { step: '06', title: t.step6, desc: t.step6Desc, icon: <ClusterOutlined /> },
                        { step: '07', title: t.step7, desc: t.step7Desc, icon: <EyeOutlined /> },
                        { step: '08', title: t.step8, desc: t.step8Desc, icon: <FileTextOutlined /> }
                      ].map((st, i, arr) => (
                        <Col xs={24} sm={12} md={6} lg={3} key={i} style={{ position: 'relative' }}>
                          <ScrollReveal delay={i * 0.06} style={{ height: "100%" }}>
                            <Card bordered={false} style={{ ...styles.workflowCard, position: 'relative', zIndex: 2 }} className="hover-lift-card">
                              <div style={styles.stepBadge}>{st.step}</div>
                              <div style={styles.workflowIcon}>{st.icon}</div>
                              <Text strong style={styles.workflowStepTitle}>{st.title}</Text>
                              <Paragraph type="secondary" style={styles.workflowStepDesc}>{st.desc}</Paragraph>
                            </Card>
                          </ScrollReveal>
                          {i < arr.length - 1 && (
                            <div className="workflow-connector" aria-hidden="true">
                              <ArrowRightOutlined />
                            </div>
                          )}
                        </Col>
                      ))}
                    </Row>
                  </div>
                </div>
              </section>

              {/* --- 4. STAKEHOLDER SECTION --- */}
              <section id="stakeholders" style={styles.whiteSection}>
                <div style={styles.gridContainer}>
                  <ScrollReveal>
                    {renderSectionHeader(t.stakeholdersHeading, t.stakeholdersSub)}
                  </ScrollReveal>

                  <Row gutter={[20, 20]} align="stretch" style={{ marginTop: 32 }}>
                    {stakeholdersData.map((stk, idx) => (
                      <Col xs={24} sm={12} lg={6} key={stk.key}>
                        <ScrollReveal delay={idx * 0.08} style={{ height: "100%" }}>
                          <Card 
                            hoverable 
                            bordered 
                            className="hover-lift-card"
                            style={{ borderRadius: 12, height: '100%', borderColor: '#e5e7eb' }}
                            bodyStyle={{ padding: 20 }}
                          >
                            <Space align="center" style={{ marginBottom: 14 }}>
                              <div style={styles.stakeholderIconBox}>{stk.icon}</div>
                              <Title level={5} style={{ margin: 0, color: '#1e5128', fontWeight: 700 }}>{stk.title}</Title>
                            </Space>
                            <Divider style={{ margin: '8px 0 14px' }} />
                            <div style={{ marginBottom: 10 }}>
                              <Text strong style={{ fontSize: 12, color: '#374151', display: 'block' }}>Responsibilities:</Text>
                              <Text type="secondary" style={{ fontSize: 12 }}>{stk.responsibilities}</Text>
                            </div>
                            <div style={{ marginBottom: 10 }}>
                              <Text strong style={{ fontSize: 12, color: '#374151', display: 'block' }}>Services Available:</Text>
                              <Text type="secondary" style={{ fontSize: 12 }}>{stk.services}</Text>
                            </div>
                            <div>
                              <Text strong style={{ fontSize: 12, color: '#2C9647', display: 'block' }}>Key Benefits:</Text>
                              <Text type="secondary" style={{ fontSize: 12 }}>{stk.benefits}</Text>
                            </div>
                          </Card>
                        </ScrollReveal>
                      </Col>
                    ))}
                  </Row>
                </div>
              </section>

              {/* --- SRS CORE MODULES SECTION --- */}
              <section id="modules" style={styles.greySection}>
                <div style={styles.gridContainer}>
                  <ScrollReveal>
                    {renderSectionHeader(t.coreSystems, "Operational functional modules managing state agricultural frameworks.")}
                  </ScrollReveal>

                  <Row gutter={[20, 20]} align="stretch" style={{ marginTop: 32 }}>
                    {srsModules.map((mod, i) => (
                      <Col xs={24} sm={12} lg={8} xl={6} key={i} id={`module-${mod.key}`}>
                        <ScrollReveal delay={i * 0.05} style={{ height: "100%" }}>
                          <div className="hover-lift-card" style={styles.modernModuleCard}>
                            <div style={styles.moduleCardTopAccent(mod.color)}></div>
                            <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', height: '100%', flex: 1 }}>
                              <div style={{ ...styles.moduleIconWrapper, backgroundColor: `${mod.color}15`, color: mod.color }}>
                                {mod.icon}
                              </div>
                              <Title level={5} style={styles.moduleTitle}>{mod.title}</Title>
                              <Paragraph type="secondary" style={styles.moduleDesc}>{mod.desc}</Paragraph>
                              <div style={{ marginTop: 'auto', paddingTop: 12 }}>
                                <Tag color="green" style={{ borderRadius: 4 }}>Active Node</Tag>
                              </div>
                            </div>
                          </div>
                        </ScrollReveal>
                      </Col>
                    ))}
                  </Row>
                </div>
              </section>

              {/* --- 5. ANALYTICS DASHBOARD WITH SCROLL-COUNT ANIMATION --- */}
              <section id="analytics" style={styles.analyticsSection}>
                <div style={{ ...styles.gridContainer, position: 'relative', zIndex: 10 }}>
                  <ScrollReveal>
                    <div style={{ textAlign: 'center', marginBottom: 40 }}>
                      <h2 style={{ ...styles.sectionTitleStyle, color: '#fff' }}>{t.analyticsHeading}</h2>
                      <Paragraph style={{ ...styles.sectionSubtitleStyle, color: 'rgba(255,255,255,0.88)' }}>{t.analyticsSub}</Paragraph>
                    </div>
                  </ScrollReveal>

                  <Row gutter={[20, 20]} align="stretch">
                    {operationalMetrics.map((metric, idx) => (
                      <Col xs={24} sm={12} md={8} lg={6} key={metric.key}>
                        <ScrollReveal delay={idx * 0.05}>
                          <Card bordered={false} style={styles.analyticsKpiCard} className="hover-lift-card">
                            <Space size="middle" align="center">
                              <div style={styles.kpiIconWrapper}>
                                {metric.icon}
                              </div>
                              <div>
                                <Text style={{ color: '#6b7280', fontSize: 12, display: 'block', fontWeight: 500 }}>{metric.label}</Text>
                                <span style={{ color: '#111827', fontSize: 22, fontWeight: 800 }}>
                                  <AnimatedMetric value={metric.value} />
                                </span>
                              </div>
                            </Space>
                          </Card>
                        </ScrollReveal>
                      </Col>
                    ))}
                  </Row>
                </div>
              </section>

              {/* --- 6. MEDIA GALLERY WITH FILTERS & LIGHTBOX --- */}
              <section id="media-gallery" style={styles.whiteSection}>
                <div style={styles.gridContainer}>
                  <ScrollReveal>
                    {renderSectionHeader(t.galleryHeading, t.gallerySub)}
                  </ScrollReveal>

                  <ScrollReveal delay={0.1}>
                    <Row gutter={[16, 16]} justify="space-between" align="middle" style={{ marginTop: 24, marginBottom: 24 }}>
                      <Col xs={24} md={16}>
                        <Space wrap>
                          {['All', 'Dashboards', 'GIS', 'Mobile Data', 'Inventory', 'Training', 'Field Inspections'].map(cat => (
                            <Tag.CheckableTag
                              key={cat}
                              checked={mediaCategory === cat}
                              onChange={() => setMediaCategory(cat)}
                              style={{ padding: '6px 16px', borderRadius: 20, fontSize: 13 }}
                            >
                              {cat}
                            </Tag.CheckableTag>
                          ))}
                        </Space>
                      </Col>
                      <Col xs={24} md={8}>
                        <Input 
                          placeholder={t.searchGallery} 
                          prefix={<SearchOutlined />} 
                          allowClear
                          value={mediaSearch}
                          onChange={(e) => setMediaSearch(e.target.value)}
                          style={{ borderRadius: 8 }}
                        />
                      </Col>
                    </Row>
                  </ScrollReveal>

                  <Row gutter={[20, 20]} align="stretch">
                    {filteredMedia.map((media, idx) => (
                      <Col xs={24} sm={12} md={8} key={media.id}>
                        <ScrollReveal delay={idx * 0.08} style={{ height: "100%" }}>
                          <Card
                            hoverable
                            className="hover-lift-card"
                            cover={
                              <div style={{ height: 200, overflow: 'hidden', position: 'relative' }}>
                                <img src={media.img} alt={media.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={handleImgError} />
                                <Tag color="green" style={{ position: 'absolute', top: 10, right: 10 }}>{media.category}</Tag>
                              </div>
                            }
                            onClick={() => setPreviewMedia(media)}
                            style={{ borderRadius: 12, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}
                          >
                            <Title level={5} style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 700 }}>{media.title}</Title>
                            <Paragraph type="secondary" style={{ margin: 0, fontSize: 12 }}>{media.desc}</Paragraph>
                          </Card>
                        </ScrollReveal>
                      </Col>
                    ))}
                  </Row>
                </div>
              </section>

              {/* --- 7. RESOURCES & DOWNLOAD CENTER --- */}
              <section id="resources" style={styles.greySection}>
                <div style={styles.gridContainer}>
                  <ScrollReveal>
                    {renderSectionHeader(t.resourcesHeading, t.resourcesSub)}
                  </ScrollReveal>

                  <Row gutter={[20, 20]} align="stretch" style={{ marginTop: 32 }}>
                    {downloadableResources.map((res, idx) => (
                      <Col xs={24} sm={12} md={8} lg={6} key={res.id}>
                        <ScrollReveal delay={idx * 0.06} style={{ height: "100%" }}>
                          <Card bordered style={{ borderRadius: 12, background: '#fff', height: '100%', display: 'flex', flexDirection: 'column' }} className="hover-lift-card">
                            <Space align="start" style={{ marginBottom: 12 }}>
                              <div style={{ fontSize: 28, color: '#1e5128' }}>{res.icon}</div>
                              <div>
                                <Tag color="gold" style={{ fontSize: 10 }}>{res.category}</Tag>
                                <Text strong style={{ display: 'block', marginTop: 4, fontSize: 13, lineHeight: 1.4 }}>{res.title}</Text>
                              </div>
                            </Space>
                            <Divider style={{ margin: '12px 0' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Text type="secondary" style={{ fontSize: 11 }}>{res.size} • {res.date}</Text>
                              <Button 
                                type="primary" 
                                size="small" 
                                icon={<DownloadOutlined />}
                                onClick={() => message.info(`Downloading ${res.title}...`)}
                                style={{ background: '#1e5128', borderRadius: 4 }}
                              >
                                Download
                              </Button>
                            </div>
                          </Card>
                        </ScrollReveal>
                      </Col>
                    ))}
                  </Row>
                </div>
              </section>

              {/* --- OUR NEWS SECTION --- */}
              <section id="news" style={styles.whiteSection}>
                <div style={styles.gridContainer}>
                  <ScrollReveal>
                    {renderSectionHeader(t.newsTitle, "Updates from the regional state agricultural network")}
                  </ScrollReveal>

                  <Row gutter={[24, 24]} align="stretch" style={{ marginTop: 32 }}>
                    {newsItems.map((item, idx) => (
                      <Col xs={24} sm={12} md={12} key={idx}>
                        <ScrollReveal delay={idx * 0.1} style={{ height: "100%" }}>
                          <Card hoverable bordered className="hover-lift-card" style={{ borderRadius: 12, overflow: 'hidden', height: '100%' }}>
                            <Row gutter={16} align="middle">
                              <Col xs={24} sm={10}>
                                <img src={item.img} alt={item.title} style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 8 }} onError={handleImgError} />
                              </Col>
                              <Col xs={24} sm={14}>
                                <Tag color="green">{item.date}</Tag>
                                <Title level={5} style={{ margin: '8px 0', fontSize: 15, fontWeight: 700 }}>{item.title}</Title>
                                <Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 8 }}>{item.summary}</Paragraph>
                                <Button type="link" padding={0} onClick={() => setSelectedNews(item)}>
                                  Read Article <ArrowRightOutlined />
                                </Button>
                              </Col>
                            </Row>
                          </Card>
                        </ScrollReveal>
                      </Col>
                    ))}
                  </Row>
                </div>
              </section>

              {/* --- PARTNERS SECTION --- */}
              <section id="partners-section" style={styles.partnersSection}>
                <div style={styles.gridContainer}>
                  <ScrollReveal>
                    {renderSectionHeader(t.partnersTitle, null)}
                  </ScrollReveal>
                  <div className="partners-marquee-wrapper" style={{ marginTop: 20 }}>
                    <div className="partners-marquee-content">
                      {[...partnersList, ...partnersList, ...partnersList].map((p, idx) => (
                        <div key={idx} className="partner-logo-box">
                          <img src={p.logo} alt={p.name} style={styles.partnerLogoImg} onError={handleImgError} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}
        </Content>

        {/* --- FOOTER --- */}
        <Footer style={styles.footer}>
          <div style={styles.gridContainer}>
            <Row gutter={[40, 40]}>
              <Col xs={24} md={8}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <img src={logo} alt="IAIMS Logo" style={{ height: 60 }} onError={handleImgError} />
                </div>
                <Paragraph style={styles.footerText}>{t.footerDesc}</Paragraph>
                <Space size="middle" style={{ fontSize: 22, marginTop: 16 }}>
                  <FacebookFilled style={styles.socialIcon} />
                  <TwitterSquareFilled style={styles.socialIcon} />
                  <LinkedinFilled style={styles.socialIcon} />
                  <YoutubeFilled style={styles.socialIcon} />
                </Space>
              </Col>
              
              <Col xs={12} sm={6} md={5}>
                <Title level={5} style={styles.footerWidgetTitle}>{t.quickLinks}</Title>
                <ul style={styles.footerLinkList}>
                  <li><a style={{ color: '#ffffff' }} href="#home">{t.home}</a></li>
                  <li><a style={{ color: '#ffffff' }} href="#about">{t.about}</a></li>
                  <li><a style={{ color: '#ffffff' }} href="#how-it-works">{t.howItWorks}</a></li>
                  <li><a style={{ color: '#ffffff' }} href="#stakeholders">{t.stakeholders}</a></li>
                  <li><a style={{ color: '#ffffff' }} href="#analytics">{t.dataAnalytics}</a></li>
                </ul>
              </Col>

              <Col xs={12} sm={6} md={5}>
                <Title level={5} style={styles.footerWidgetTitle}>Legal & Policies</Title>
                <ul style={styles.footerLinkList}>
                  <li><a href="#" style={{ color: '#ffffff' }}>{t.privacyPolicy}</a></li>
                  <li><a href="#" style={{ color: '#ffffff' }}>{t.termsOfUse}</a></li>
                  <li><a href="#" style={{ color: '#ffffff' }}>{t.accessInfo}</a></li>
                  <li><a href="#" style={{ color: '#ffffff' }}>{t.securityNotice}</a></li>
                </ul>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Title level={5} style={styles.footerWidgetTitle}>{t.contactUs}</Title>
                <ul style={styles.footerLinkList}>
                  <li style={{ color: '#ffffff' }}><PhoneOutlined style={{ marginRight: 6 }} /> {t.phone}</li>
                  <li style={{ color: '#ffffff' }}><MailOutlined style={{ marginRight: 6 }} /> {t.email}</li>
                  <li style={{ color: '#ffffff' }}><EnvironmentOutlined style={{ marginRight: 6 }} /> {t.address}</li>
                </ul>
              </Col>
            </Row>
            
            <Divider style={{ borderColor: 'rgba(255,255,255,0.2)', margin: '40px 0 20px' }} />
            <div style={styles.footerBottomContainer}>
              <Text style={{ color: '#ffffff', fontSize: 12 }}>© {new Date().getFullYear()} IAIMS - {t.allRightsReserved}</Text>
              <Text style={{ color: '#ffffff', fontSize: 12 }}>{t.developedBy}</Text>
            </div>
          </div>
        </Footer>

        {/* --- LIGHTBOX MODAL --- */}
        <Modal
          open={!!previewMedia}
          onCancel={() => setPreviewMedia(null)}
          footer={null}
          width={720}
          centered
        >
          {previewMedia && (
            <div>
              <img src={previewMedia.img} alt={previewMedia.title} style={{ width: '100%', borderRadius: 8, marginBottom: 16 }} onError={handleImgError} />
              <Tag color="green">{previewMedia.category}</Tag>
              <Title level={4} style={{ marginTop: 8 }}>{previewMedia.title}</Title>
              <Paragraph type="secondary">{previewMedia.desc}</Paragraph>
            </div>
          )}
        </Modal>

        {/* --- LOGIN MODAL --- */}
        <Modal
          open={isLoginVisible}
          onCancel={() => { setIsLoginVisible(false); setLoginError(null); }}
          footer={null}
          width={420}
          centered
          styles={{ body: { padding: '32px 28px' } }}
        >
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <img src={logo} alt="IAIMS Logo" style={{ height: 48, marginBottom: 12 }} onError={handleImgError} />
            <Title level={3} style={{ margin: 0, color: '#111827' }}>{t.loginModalTitle}</Title>
            <Paragraph type="secondary" style={{ fontSize: 13, marginTop: 4 }}>{t.loginModalSub}</Paragraph>
          </div>

          {loginError && (
            <Alert type="error" message={loginError} showIcon closable onClose={() => setLoginError(null)} style={{ marginBottom: 20 }} />
          )}

          <Form layout="vertical" onFinish={handleLoginSubmit} size="large" requiredMark={false}>
            <Form.Item name="email" rules={[{ required: true, message: 'Please enter your email' }, { type: 'email', message: 'Enter a valid email' }]}>
              <Input prefix={<MailOutlined />} placeholder={t.usernamePlaceholder} />
            </Form.Item>
            <Form.Item name="password" rules={[{ required: true, message: 'Please enter your password' }]}>
              <Input.Password prefix={<LockOutlined />} placeholder={t.passwordPlaceholder} />
            </Form.Item>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>{t.rememberMe}</Checkbox>
              </Form.Item>
              <Link to="/forgot-password" style={{ fontSize: 13 }}>{t.forgotPassword}</Link>
            </div>
            <Button type="primary" htmlType="submit" block style={styles.modalSubmitBtn} loading={loginLoading}>
              {t.authenticate}
            </Button>
            <div style={styles.securityWarningFrame}>
              <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>{t.securityWarning}</Text>
            </div>
          </Form>
        </Modal>

        {/* --- MOBILE DRAWER --- */}
        <Drawer title={t.systemName} placement="right" onClose={() => setMobileMenuOpen(false)} open={mobileMenuOpen} styles={{ body: { padding: 0 } }}>
          <Menu
            mode="inline"
            style={{ borderRight: 'none' }}
            items={[
              ...navItems.map(item => (item.children ? {
                key: item.key,
                icon: item.icon,
                label: item.label,
                children: item.children.map(child => ({
                  key: child.key,
                  label: <a href={child.href}>{child.label}</a>,
                  onClick: () => setMobileMenuOpen(false),
                })),
              } : {
                key: item.key,
                icon: item.icon,
                label: <a href={item.href}>{item.label}</a>,
                onClick: () => setMobileMenuOpen(false),
              })),
              {
                key: 'login',
                icon: <UserOutlined />,
                label: t.loginBtn,
                onClick: () => { setIsLoginVisible(true); setMobileMenuOpen(false); },
              },
            ]}
          />
        </Drawer>

        {/* --- CUSTOM CSS ANIMATIONS & LIFT EFFECTS --- */}
        <style>{`
          html { scroll-behavior: smooth; }
          .hover-lift-card {
            transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1) !important;
          }
          .hover-lift-card:hover {
            transform: translateY(-6px) !important;
            box-shadow: 0 12px 28px rgba(0,0,0,0.09) !important;
          }
          .partners-marquee-wrapper {
            overflow: hidden;
            width: 100%;
            display: flex;
            padding: 12px 0;
          }
          .partners-marquee-content {
            display: flex;
            gap: 60px;
            animation: marquee 25s linear infinite;
          }
          .partner-logo-box { flex-shrink: 0; }
          .partner-logo-box img { max-height: 75px; width: auto; }
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }

          /* Connected & animated "How It Works" flow */
          .workflow-connector {
            display: none;
          }
          @media (min-width: 992px) {
            .workflow-connector {
              display: flex;
              align-items: center;
              justify-content: center;
              position: absolute;
              top: 34px;
              right: -17px;
              width: 24px;
              height: 24px;
              color: #ca8a04;
              font-size: 13px;
              z-index: 3;
              animation: flowPulse 1.6s ease-in-out infinite;
            }
          }
          @keyframes flowPulse {
            0%, 100% { opacity: 0.35; transform: translateX(-2px); }
            50% { opacity: 1; transform: translateX(2px); }
          }
        `}</style>
      </Layout>
    </ConfigProvider>
  );
}

// --- STYLES OBJECT (simplified 3-color palette: deep green, leaf green, harvest gold) ---
const styles = {
  topInfoBar: { background: '#1e5128', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  topBarContactSpace: (isXs) => ({
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    justifyContent: isXs ? 'center' : 'flex-start',
    width: '100%'
  }),
  innerContainerFlex: { maxWidth: 1280, margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' },
  gridContainer: { maxWidth: 1280, margin: '0 auto', padding: '0 24px', width: '100%' },
  header: { background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', height: 80, padding: 0, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 1000, borderBottom: '3px solid #1e5128' },
  logoGroup: { display: 'flex', alignItems: 'center', gap: 12 },
  logoAsset: { height: 58, width: 'auto', objectFit: 'contain' },
  outlineLangBtn: { borderRadius: 6, fontWeight: 600, color: '#1e5128', border: '1px solid #1e5128', background: 'transparent' },
  heroSection: { marginTop: 0 },
  carousel: { height: 'calc(100vh - 120px)', minHeight: 620 },
  carouselSlide: { height: 'calc(100vh - 120px)', minHeight: 620, backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  carouselContent: { textAlign: 'center', maxWidth: 880, padding: '0 24px', color: '#fff' },
  heroMainTitleText: { fontSize: 'clamp(2.2rem, 4.8vw, 3.4rem)', fontWeight: 800, color: '#fff', marginBottom: 12 },
  heroDescriptionText: { fontSize: 16, color: '#f3f4f6', marginBottom: 20 },
  heroSystemDescBox: { background: 'rgba(30, 81, 40, 0.88)', backdropFilter: 'blur(6px)', padding: '16px 24px', borderRadius: 10, borderLeft: '4px solid #ca8a04', marginBottom: 28, textAlign: 'left' },
  heroPrimaryBtn: { background: '#1e5128', borderColor: '#ca8a04', color: '#fff', fontWeight: 700, height: 48, padding: '0 32px', borderRadius: 8 },
  heroPrimaryBtnHeader: { background: '#1e5128', color: '#fff', fontWeight: 600, borderRadius: 6 },
  heroSecondaryBtn: { background: 'transparent', borderColor: '#fff', color: '#fff', height: 48, padding: '0 32px', borderRadius: 8 },
  whiteSection: { padding: '64px 0', background: '#fff' },
  greySection: { padding: '64px 0', background: '#f8fafc' },
  sectionHeaderContainer: { textAlign: 'center', marginBottom: 32 },
  sectionTitleStyle: { color: '#1e5128', fontSize: '28px', fontWeight: '700', margin: 0 },
  sectionSubtitleStyle: { fontSize: '15px', color: '#6b7280', marginTop: 8, maxWidth: '640px', margin: '8px auto 0' },
  leafSeparatorWrapper: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 8 },
  separatorLine: { width: '100px', height: '2px', background: '#2C9647' },
  leafBox: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
  aboutInfoCard: { borderRadius: 12, height: '100%', textAlign: 'center' },
  aboutIconStyle: { fontSize: 32, color: '#1e5128', marginBottom: 12 },
  aboutCardTitle: { fontSize: 16, fontWeight: 700, color: '#111827', margin: '8px 0' },
  aboutCardDesc: { fontSize: 13, lineHeight: 1.5, margin: 0 },
  workflowCard: { borderRadius: 12, textAlign: 'center', height: '100%', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' },
  stepBadge: { background: '#1e5128', color: '#fff', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, margin: '0 auto 12px' },
  workflowIcon: { fontSize: 24, color: '#2C9647', marginBottom: 8 },
  workflowStepTitle: { fontSize: 13, color: '#111827', display: 'block', marginBottom: 4, fontWeight: 700 },
  workflowStepDesc: { fontSize: 11, lineHeight: 1.4, margin: 0 },
  stakeholderIconBox: { width: 40, height: 40, borderRadius: 8, background: '#1e512815', color: '#1e5128', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 },
  modernModuleCard: { borderRadius: 12, background: '#fff', border: '1px solid #f0f0f0', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' },
  moduleCardTopAccent: (color) => ({ height: '4px', width: '100%', backgroundColor: color, position: 'absolute', top: 0, left: 0 }),
  moduleIconWrapper: { fontSize: 26, width: 48, height: 48, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  moduleTitle: { fontSize: 15, fontWeight: 700, marginBottom: 8, color: '#111827' },
  moduleDesc: { fontSize: 12, lineHeight: 1.5, color: '#4b5563', marginBottom: 12 },
  analyticsSection: { padding: '64px 0', background: 'linear-gradient(rgba(10, 30, 15, 0.9), rgba(10, 30, 15, 0.94)), url("https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80")', backgroundSize: 'cover', backgroundAttachment: 'fixed' },
  analyticsKpiCard: { borderRadius: 12, background: 'rgba(255,255,255,0.96)', padding: '16px' },
  kpiIconWrapper: { width: 44, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, background: '#1e512815', color: '#1e5128' },
  partnersSection: { padding: '40px 0', background: '#fff' },
  partnerLogoImg: { maxHeight: '75px', width: 'auto', objectFit: 'contain' },
  footer: { background: '#1e5128', padding: '60px 0 30px', borderTop: '4px solid #2C9647' },
  footerText: { color: '#ffffff', fontSize: 13, lineHeight: 1.6 },
  socialIcon: { color: '#ffffff', cursor: 'pointer' },
  footerWidgetTitle: { color: '#ffffff', fontSize: 16, fontWeight: 700, marginBottom: 16 },
  footerLinkList: { listStyle: 'none', padding: 0, margin: 0, fontSize: 13, display: 'flex', flexDirection: 'column', gap: 10, color: '#ffffff' },
  footerBottomContainer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 },
  modalSubmitBtn: { height: 44, borderRadius: 8, fontWeight: 700, background: '#1e5128', border: 'none' },
  securityWarningFrame: { background: '#fef2f2', border: '1px solid #fee2e2', padding: '12px', borderRadius: 8, marginTop: 20 }
};