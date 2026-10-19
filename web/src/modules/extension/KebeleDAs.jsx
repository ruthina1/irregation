import React, { useState, useEffect, useMemo } from 'react';
import {
  App,
  Breadcrumb,
  Typography,
  Row,
  Col,
  Card,
  Statistic,
  Progress,
  Input,
  Select,
  Button,
  Space,
  Table,
  Tag,
  Tooltip,
  Modal,
  Form,
  InputNumber,
  Divider,
  Descriptions,
  Tabs,
  Popconfirm,
  Switch,
} from 'antd';
import {
  HomeOutlined,
  UserOutlined,
  WomanOutlined,
  ManOutlined,
  SearchOutlined,
  PlusOutlined,
  DownloadOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  IdcardOutlined,
  SafetyCertificateOutlined,
  SolutionOutlined,
  ClearOutlined,
  BankOutlined,
  MobileOutlined,
  BookOutlined,
  TeamOutlined,
  CarOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { extensionApi } from '../../services/api/extensionApi';
import { handleApiError } from '../../utils/errorHandler';
import BrandedLoader from '../../components/common/BrandedLoader';
import LocationScopeSelector from '../../components/common/LocationScopeSelector';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

// Helper to safely extract string values from nested relation objects
const extractName = (value, defaultVal = 'Unspecified') => {
  if (!value) return defaultVal;
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    return value.name || value.title || value.kebele_name || value.woreda_name || value.zone_name || defaultVal;
  }
  return String(value);
};

// Registered FTC Master List fallback
const DEFAULT_FTCS = [
  { id: 'FTC-001', name: 'Kurar Farmers Training Center', woreda: 'Dejen', kebele: 'Kurar' },
  { id: 'FTC-002', name: 'Bakel Demonstration & Training Center', woreda: 'Finote Selam', kebele: 'Bakel' },
  { id: 'FTC-003', name: 'Woreta Zuria Agro-Technical FTC', woreda: 'Fogera', kebele: 'Woreta Zuria' },
  { id: 'FTC-004', name: 'Goshebado Model FTC', woreda: 'Basona Werana', kebele: 'Goshebado' },
  { id: 'FTC-005', name: 'Alefa Integrated Training Center', woreda: 'Bure', kebele: 'Alefa' },
  { id: 'FTC-006', name: 'Kuhar Michael Agro FTC', woreda: 'Fogera', kebele: 'Kuhar' },
];

// Initial seed data with full attributes
const INITIAL_DAS = [
  {
    id: '1',
    da_code: 'DA-EG-0811',
    employee_id: 'EMP-0811',
    national_id: 'FYD-9821-3312',
    full_name: 'Almaz Mengistu Assefa',
    gender: 'Female',
    age: 29,
    marital_status: 'Married',
    qualification: 'BSc Degree',
    education_level: 'Bachelor',
    field_of_study: 'Plant Sciences',
    graduation_year: 2018,
    specialization: 'Crop Production',
    discipline: 'Crop Production (አዝርዕት)',
    position_title: 'Lead Development Agent',
    duty_status: 'Active Duty',
    employment_status: 'Active',
    employment_type: 'Permanent',
    years_of_service: 6,
    hire_date: '2019-01-10',
    supervisor_name: 'Zelalem Haile',
    phone_number: '+251 918 234 567',
    email: 'almaz.mengistu@moa.gov.et',
    languages: ['Amharic', 'English'],
    ftc_id: 'FTC-001',
    ftc_name: 'Kurar Farmers Training Center',
    assigned_year: 2017,
    has_residential_quarter: true,
    zone: 'East Gojjam',
    woreda: 'Dejen',
    kebele: 'Kurar',
    assigned_kebele_name: 'Kurar Peasant Association',
    assignment_area: 'Kurar Watershed Catchment',
    primary_extension_area: 'Crop Production',
    secondary_extension_area: 'Horticulture',
    assigned_farmer_count: 320,
    farmer_groups_count: 12,
    development_centers_count: 2,
    extension_services: ['Farmer Advisory', 'Farm Visit', 'Training', 'Demonstration'],
    special_programs: ['Cluster Farming', 'Productivity'],
    professional_certified: true,
    certification_name: 'National Agronomy Advisory License',
    certification_number: 'NAAL-2023-451',
    certification_date: '2023-04-12',
    has_extension_training: true,
    extension_training_type: 'Wheat Row Planting & Rust Management ToT',
    last_training_date: '2024-02-15',
    has_mobile_phone: true,
    has_smartphone: true,
    smartphone_number: '+251 918 234 567',
    digital_literacy_level: 'Advanced',
    iaims_user_status: 'Active',
    has_transportation: true,
    transportation_type: 'Motorcycle',
    field_visit_frequency: 'Several times per week',
    field_visit_target: 24,
    annual_training_count: 14,
    annual_farm_visit_count: 160,
    annual_demonstration_count: 8,
    performance_status: 'Excellent',
    remarks: 'Leads cluster row-planting demonstrations across Kurar kebele.',
  },
  {
    id: '2',
    da_code: 'DA-EG-0812',
    employee_id: 'EMP-0812',
    national_id: 'FYD-6541-1120',
    full_name: 'Getachew Bekele Tadesse',
    gender: 'Male',
    age: 34,
    marital_status: 'Married',
    qualification: 'Diploma (Level IV)',
    education_level: 'Diploma',
    field_of_study: 'Natural Resource Conservation',
    graduation_year: 2014,
    specialization: 'Natural Resource Management',
    discipline: 'Natural Resource Management (የተፈጥሮ ሀብት)',
    position_title: 'Senior Development Agent',
    duty_status: 'Active Duty',
    employment_status: 'Active',
    employment_type: 'Permanent',
    years_of_service: 9,
    hire_date: '2016-09-01',
    supervisor_name: 'Zelalem Haile',
    phone_number: '+251 921 345 678',
    email: 'getachew.b@moa.gov.et',
    languages: ['Amharic'],
    ftc_id: 'FTC-001',
    ftc_name: 'Kurar Farmers Training Center',
    assigned_year: 2015,
    has_residential_quarter: true,
    zone: 'East Gojjam',
    woreda: 'Dejen',
    kebele: 'Kurar',
    assigned_kebele_name: 'Kurar',
    assignment_area: 'Gully Rehabilitation Zone',
    primary_extension_area: 'Natural Resources',
    secondary_extension_area: 'Irrigation',
    assigned_farmer_count: 280,
    farmer_groups_count: 8,
    development_centers_count: 1,
    extension_services: ['Farmer Advisory', 'Farm Visit', 'Demonstration'],
    special_programs: ['Climate Smart Agriculture'],
    professional_certified: false,
    has_extension_training: true,
    extension_training_type: 'Soil & Water Conservation Physical Structures',
    last_training_date: '2023-11-20',
    has_mobile_phone: true,
    has_smartphone: true,
    smartphone_number: '+251 921 345 678',
    digital_literacy_level: 'Intermediate',
    iaims_user_status: 'Active',
    has_transportation: false,
    transportation_type: null,
    field_visit_frequency: 'Daily',
    field_visit_target: 30,
    annual_training_count: 10,
    annual_farm_visit_count: 190,
    annual_demonstration_count: 5,
    performance_status: 'Good',
    remarks: 'Oversees hillside terracing and communal nursery sites.',
  },
  {
    id: '3',
    da_code: 'DA-WG-1402',
    employee_id: 'EMP-1402',
    national_id: 'FYD-3301-4451',
    full_name: 'Tadesse Alemu Worku',
    gender: 'Male',
    age: 31,
    marital_status: 'Single',
    qualification: 'BSc Degree',
    education_level: 'Bachelor',
    field_of_study: 'Animal Health & Production',
    graduation_year: 2017,
    specialization: 'Animal Science',
    discipline: 'Animal Science (እንስሳት ሀብት)',
    position_title: 'Development Agent',
    duty_status: 'On Training',
    employment_status: 'On Leave',
    employment_type: 'Permanent',
    years_of_service: 5,
    hire_date: '2019-10-15',
    supervisor_name: 'Mesfin Kassa',
    phone_number: '+251 911 456 789',
    email: 'tadesse.alemu@moa.gov.et',
    languages: ['Amharic', 'English'],
    ftc_id: 'FTC-002',
    ftc_name: 'Bakel Demonstration & Training Center',
    assigned_year: 2018,
    has_residential_quarter: false,
    zone: 'West Gojjam',
    woreda: 'Finote Selam',
    kebele: 'Bakel',
    assigned_kebele_name: 'Bakel',
    assignment_area: 'Livestock Development Center',
    primary_extension_area: 'Livestock',
    secondary_extension_area: 'Crop Production',
    assigned_farmer_count: 210,
    farmer_groups_count: 7,
    development_centers_count: 1,
    extension_services: ['Farmer Advisory', 'Disease Control', 'Input Advisory'],
    special_programs: ['Productivity'],
    professional_certified: true,
    certification_name: 'Veterinary Clinical Paraprofessional',
    certification_number: 'VET-2021-098',
    certification_date: '2021-08-10',
    has_extension_training: false,
    has_mobile_phone: true,
    has_smartphone: false,
    digital_literacy_level: 'Basic',
    iaims_user_status: 'Pending',
    has_transportation: true,
    transportation_type: 'Bicycle',
    field_visit_frequency: 'Weekly',
    field_visit_target: 12,
    annual_training_count: 6,
    annual_farm_visit_count: 90,
    annual_demonstration_count: 3,
    performance_status: 'Needs Improvement',
    remarks: 'Currently attending specialized dairy genetics refresher training.',
  },
  {
    id: '4',
    da_code: 'DA-SG-2109',
    employee_id: 'EMP-2109',
    national_id: 'FYD-8812-7019',
    full_name: 'Bethlehem Hailu Desta',
    gender: 'Female',
    age: 28,
    marital_status: 'Single',
    qualification: 'MSc Degree',
    education_level: 'Master',
    field_of_study: 'Horticulture & Postharvest',
    graduation_year: 2021,
    specialization: 'Horticulture',
    discipline: 'Irrigation & Horticulture (መስኖና አትክልት)',
    position_title: 'Lead Development Agent',
    duty_status: 'Active Duty',
    employment_status: 'Active',
    employment_type: 'Permanent',
    years_of_service: 4,
    hire_date: '2022-03-01',
    supervisor_name: 'Mulugeta Belete',
    phone_number: '+251 930 891 234',
    email: 'bethlehem.h@moa.gov.et',
    languages: ['Amharic', 'English', 'Tigrinya'],
    ftc_id: 'FTC-003',
    ftc_name: 'Woreta Zuria Agro-Technical FTC',
    assigned_year: 2020,
    has_residential_quarter: true,
    zone: 'South Gondar',
    woreda: 'Fogera',
    kebele: 'Woreta Zuria',
    assigned_kebele_name: 'Woreta Zuria',
    assignment_area: 'Ribb Irrigation Scheme',
    primary_extension_area: 'Horticulture',
    secondary_extension_area: 'Irrigation',
    assigned_farmer_count: 410,
    farmer_groups_count: 16,
    development_centers_count: 3,
    extension_services: ['Farmer Advisory', 'Farm Visit', 'Training', 'Market Linkage', 'Technology Transfer'],
    special_programs: ['Irrigation', 'Cluster Farming', 'Productivity'],
    professional_certified: true,
    certification_name: 'Horticultural Export Standards Inspector',
    certification_number: 'HESI-2023-112',
    certification_date: '2023-01-20',
    has_extension_training: true,
    extension_training_type: 'Drip Irrigation & Commercial Vegetable Farming',
    last_training_date: '2024-05-18',
    has_mobile_phone: true,
    has_smartphone: true,
    smartphone_number: '+251 930 891 234',
    digital_literacy_level: 'Advanced',
    iaims_user_status: 'Active',
    has_transportation: true,
    transportation_type: 'Motorcycle',
    field_visit_frequency: 'Several times per week',
    field_visit_target: 28,
    annual_training_count: 18,
    annual_farm_visit_count: 220,
    annual_demonstration_count: 12,
    performance_status: 'Excellent',
    remarks: 'Coordinates onion and tomato commercial cluster along Ribb river.',
  },
  {
    id: '5',
    da_code: 'DA-NS-3301',
    employee_id: 'EMP-3301',
    national_id: 'FYD-2219-0902',
    full_name: 'Kassahun Birhanu Demissie',
    gender: 'Male',
    age: 42,
    marital_status: 'Married',
    qualification: 'Certificate (Level III)',
    education_level: 'Certificate',
    field_of_study: 'General Agriculture',
    graduation_year: 2011,
    specialization: 'Crop Production',
    discipline: 'Crop Production (አዝርዕት)',
    position_title: 'Development Agent',
    duty_status: 'Academic Upgrade',
    employment_status: 'Active',
    employment_type: 'Permanent',
    years_of_service: 12,
    hire_date: '2013-11-15',
    supervisor_name: 'Daniel Kebede',
    phone_number: '+251 913 778 899',
    email: 'kassahun.b@moa.gov.et',
    languages: ['Amharic'],
    ftc_id: 'FTC-004',
    ftc_name: 'Goshebado Model FTC',
    assigned_year: 2014,
    has_residential_quarter: false,
    zone: 'North Shewa',
    woreda: 'Basona Werana',
    kebele: 'Goshebado',
    assigned_kebele_name: 'Goshebado',
    assignment_area: 'Highland Cereal Basin',
    primary_extension_area: 'Crop Production',
    secondary_extension_area: 'Livestock',
    assigned_farmer_count: 195,
    farmer_groups_count: 6,
    development_centers_count: 1,
    extension_services: ['Farmer Advisory', 'Farm Visit'],
    special_programs: ['Productivity'],
    professional_certified: false,
    has_extension_training: true,
    extension_training_type: 'Malt Barley Standard Production',
    last_training_date: '2022-09-10',
    has_mobile_phone: true,
    has_smartphone: true,
    smartphone_number: '+251 913 778 899',
    digital_literacy_level: 'Intermediate',
    iaims_user_status: 'Active',
    has_transportation: false,
    transportation_type: null,
    field_visit_frequency: 'Weekly',
    field_visit_target: 16,
    annual_training_count: 5,
    annual_farm_visit_count: 85,
    annual_demonstration_count: 2,
    performance_status: 'Good',
    remarks: 'Sponsored for BSc degree upgrade program at Debre Berhan University.',
  },
];

function KebeleDAsContent() {
  const { message } = App.useApp();

  const [das, setDas] = useState([]);
  const [ftcList, setFtcList] = useState(DEFAULT_FTCS);
  const [isFetching, setIsFetching] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [zoneFilter, setZoneFilter] = useState(null);
  const [disciplineFilter, setDisciplineFilter] = useState(null);
  const [genderFilter, setGenderFilter] = useState(null);
  const [dutyStatusFilter, setDutyStatusFilter] = useState(null);
  const [qualificationFilter, setQualificationFilter] = useState(null);
  const [ftcFilter, setFtcFilter] = useState(null);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDA, setEditingDA] = useState(null);
  const [selectedDA, setSelectedDA] = useState(null);
  const [isDossierOpen, setIsDossierOpen] = useState(false);

  const [form] = Form.useForm();

  // Modal form watchers for dynamic conditional inputs
  const hasSmartphoneWatch = Form.useWatch('has_smartphone', form);
  const isCertifiedWatch = Form.useWatch('professional_certified', form);
  const hasTrainingWatch = Form.useWatch('has_extension_training', form);
  const hasTransportWatch = Form.useWatch('has_transportation', form);

  // Load both DAs and registered FTC Centers from database
  const loadData = async () => {
    setIsFetching(true);
    try {
      if (extensionApi?.getDAs) {
        const response = await extensionApi.getDAs();
        const list = response?.data?.data?.data || response?.data?.data || response?.data || [];
        setDas(Array.isArray(list) && list.length ? list : INITIAL_DAS);
      } else {
        setDas(INITIAL_DAS);
      }

      if (extensionApi?.getFTCs) {
        const ftcResponse = await extensionApi.getFTCs();
        const ftcs = ftcResponse?.data?.data?.data || ftcResponse?.data?.data || ftcResponse?.data || [];
        if (Array.isArray(ftcs) && ftcs.length) {
          setFtcList(ftcs);
        }
      }
    } catch (error) {
      handleApiError(error, 'Failed to load Kebele DAs roster');
      setDas(INITIAL_DAS);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter pipeline
  const filteredDAs = useMemo(() => {
    return das.filter((d) => {
      const name = extractName(d.full_name).toLowerCase();
      const code = extractName(d.da_code || d.employee_id).toLowerCase();
      const kebele = extractName(d.kebele || d.assigned_kebele_name).toLowerCase();
      const woreda = extractName(d.woreda).toLowerCase();
      const zone = extractName(d.zone).toLowerCase();
      const ftcName = extractName(d.ftc_name).toLowerCase();
      const q = searchTerm.toLowerCase();

      const matchesSearch =
        name.includes(q) || code.includes(q) || kebele.includes(q) || woreda.includes(q) || ftcName.includes(q);
      const matchesZone = zoneFilter ? zone === zoneFilter.toLowerCase() : true;
      const matchesDiscipline = disciplineFilter
        ? d.discipline === disciplineFilter || d.primary_extension_area === disciplineFilter
        : true;
      const matchesGender = genderFilter ? d.gender === genderFilter : true;
      const matchesDutyStatus = dutyStatusFilter
        ? d.duty_status === dutyStatusFilter || d.employment_status === dutyStatusFilter
        : true;
      const matchesQualification = qualificationFilter
        ? (d.qualification || d.education_level) === qualificationFilter
        : true;
      const matchesFtc = ftcFilter ? d.ftc_name === ftcFilter : true;

      return (
        matchesSearch &&
        matchesZone &&
        matchesDiscipline &&
        matchesGender &&
        matchesDutyStatus &&
        matchesQualification &&
        matchesFtc
      );
    });
  }, [
    das,
    searchTerm,
    zoneFilter,
    disciplineFilter,
    genderFilter,
    dutyStatusFilter,
    qualificationFilter,
    ftcFilter,
  ]);

  // Statistics calculation for Indicator 1.1 + Digital & Field Coverage
  const stats = useMemo(() => {
    const total = filteredDAs.length;
    const maleCount = filteredDAs.filter((d) => d.gender === 'Male').length;
    const femaleCount = filteredDAs.filter((d) => d.gender === 'Female').length;
    const activeCount = filteredDAs.filter((d) => {
      const status = (d.duty_status || d.employment_status || '').toLowerCase();
      return status.includes('duty') || status === 'active';
    }).length;
    const femaleRatio = total > 0 ? ((femaleCount / total) * 100).toFixed(1) : 0;
    const smartphoneCount = filteredDAs.filter((d) => d.has_smartphone).length;
    const transportCount = filteredDAs.filter((d) => d.has_transportation).length;

    return { total, maleCount, femaleCount, activeCount, femaleRatio, smartphoneCount, transportCount };
  }, [filteredDAs]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setZoneFilter(null);
    setDisciplineFilter(null);
    setGenderFilter(null);
    setDutyStatusFilter(null);
    setQualificationFilter(null);
    setFtcFilter(null);
  };

  // Open Modal handler with all attributes
  const handleOpenModal = (record = null) => {
    setEditingDA(record);
    if (record) {
      form.setFieldsValue({
        da_code: record.da_code,
        employee_id: record.employee_id || record.da_code,
        national_id: record.national_id,
        full_name: record.full_name,
        gender: record.gender || 'Male',
        age: record.age,
        marital_status: record.marital_status || 'Married',
        qualification: record.qualification || 'BSc Degree',
        education_level: record.education_level || 'Bachelor',
        field_of_study: record.field_of_study,
        graduation_year: record.graduation_year,
        specialization: record.specialization || 'Crop Production',
        discipline: record.discipline || 'Crop Production (አዝርዕት)',
        position_title: record.position_title || 'Development Agent',
        duty_status: record.duty_status || 'Active Duty',
        employment_status: record.employment_status || 'Active',
        employment_type: record.employment_type || 'Permanent',
        years_of_service: record.years_of_service ?? 0,
        hire_date: record.hire_date,
        supervisor_name: record.supervisor_name,
        phone_number: record.phone_number,
        email: record.email,
        languages: record.languages || ['Amharic'],
        ftc_name: record.ftc_name,
        assigned_year: record.assigned_year ? Number(record.assigned_year) : 2018,
        has_residential_quarter: Boolean(record.has_residential_quarter),
        assigned_kebele_name: record.assigned_kebele_name || extractName(record.kebele),
        assignment_area: record.assignment_area,
        primary_extension_area: record.primary_extension_area || 'Crop Production',
        secondary_extension_area: record.secondary_extension_area,
        assigned_farmer_count: record.assigned_farmer_count ?? 0,
        farmer_groups_count: record.farmer_groups_count ?? 0,
        development_centers_count: record.development_centers_count ?? 0,
        extension_services: record.extension_services || ['Farmer Advisory', 'Farm Visit'],
        special_programs: record.special_programs || ['Productivity'],
        professional_certified: Boolean(record.professional_certified),
        certification_name: record.certification_name,
        certification_number: record.certification_number,
        certification_date: record.certification_date,
        has_extension_training: Boolean(record.has_extension_training),
        extension_training_type: record.extension_training_type,
        last_training_date: record.last_training_date,
        has_mobile_phone: Boolean(record.has_mobile_phone || record.phone_number),
        has_smartphone: Boolean(record.has_smartphone),
        smartphone_number: record.smartphone_number || record.phone_number,
        digital_literacy_level: record.digital_literacy_level || 'Intermediate',
        iaims_user_status: record.iaims_user_status || 'Active',
        has_transportation: Boolean(record.has_transportation),
        transportation_type: record.transportation_type,
        field_visit_frequency: record.field_visit_frequency || 'Several times per week',
        field_visit_target: record.field_visit_target || 20,
        annual_training_count: record.annual_training_count ?? 0,
        annual_farm_visit_count: record.annual_farm_visit_count ?? 0,
        annual_demonstration_count: record.annual_demonstration_count ?? 0,
        performance_status: record.performance_status || 'Good',
        remarks: record.remarks,
        zone_id: record.zone_id,
        woreda_id: record.woreda_id,
        kebele_id: record.kebele_id,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        gender: 'Male',
        marital_status: 'Married',
        qualification: 'BSc Degree',
        education_level: 'Bachelor',
        discipline: 'Crop Production (አዝርዕት)',
        primary_extension_area: 'Crop Production',
        position_title: 'Development Agent',
        duty_status: 'Active Duty',
        employment_status: 'Active',
        employment_type: 'Permanent',
        assigned_year: 2019,
        years_of_service: 0,
        assigned_farmer_count: 0,
        farmer_groups_count: 0,
        development_centers_count: 0,
        annual_training_count: 0,
        annual_farm_visit_count: 0,
        annual_demonstration_count: 0,
        has_residential_quarter: false,
        professional_certified: false,
        has_extension_training: false,
        has_mobile_phone: true,
        has_smartphone: false,
        has_transportation: false,
        digital_literacy_level: 'Intermediate',
        iaims_user_status: 'Active',
        performance_status: 'Good',
        languages: ['Amharic'],
      });
    }
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const matchedFtc = ftcList.find(
        (f) => f.name === values.ftc_name || f.id === values.ftc_name
      );
      const payload = {
        ...values,
        ftc_name: matchedFtc ? matchedFtc.name : values.ftc_name,
        ftc_id: matchedFtc ? matchedFtc.id : undefined,
      };

      if (editingDA) {
        if (extensionApi?.updateDA) {
          await extensionApi.updateDA(editingDA.id, payload);
        } else {
          setDas((prev) => prev.map((item) => (item.id === editingDA.id ? { ...item, ...payload } : item)));
        }
        message.success('Development Agent deployment updated successfully');
      } else {
        const newRecord = { ...payload, id: Date.now().toString(), da_code: values.da_code || `DA-${Date.now().toString().slice(-4)}` };
        if (extensionApi?.createDA) {
          await extensionApi.createDA(payload);
        } else {
          setDas((prev) => [newRecord, ...prev]);
        }
        message.success('Development Agent deployed and assigned successfully');
      }
      setIsModalOpen(false);
      if (extensionApi?.getDAs) await loadData();
    } catch (error) {
      handleApiError(error, 'Failed to save DA Record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setIsSubmitting(true);
    try {
      if (extensionApi?.deleteDA) {
        await extensionApi.deleteDA(id);
      } else {
        setDas((prev) => prev.filter((item) => item.id !== id));
      }
      message.success('DA assignment removed');
      if (extensionApi?.getDAs) await loadData();
    } catch (error) {
      handleApiError(error, 'Failed to remove DA');
    } finally {
      setIsSubmitting(false);
    }
  };

  // CSV Exporter for Indicator 1.1 including all attributes
  const exportToCSV = () => {
    if (!filteredDAs.length) {
      message.warning('No DA records available to export');
      return;
    }
    const headers = [
      'DA Code,Full Name,Gender,Age,National ID,Phone,Email,Zone,Woreda,Kebele,FTC Station,Position,Academic Level,Specialization,Duty Status,Farmers Covered,Farmer Groups,Smartphone,Transport,Performance',
    ];
    const rows = filteredDAs.map((d) =>
      [
        `"${d.da_code || d.employee_id || ''}"`,
        `"${d.full_name || ''}"`,
        `"${d.gender || ''}"`,
        `"${d.age || ''}"`,
        `"${d.national_id || ''}"`,
        `"${d.phone_number || ''}"`,
        `"${d.email || ''}"`,
        `"${extractName(d.zone)}"`,
        `"${extractName(d.woreda)}"`,
        `"${extractName(d.kebele || d.assigned_kebele_name)}"`,
        `"${d.ftc_name || ''}"`,
        `"${d.position_title || 'DA'}"`,
        `"${d.qualification || d.education_level || ''}"`,
        `"${d.discipline || d.primary_extension_area || ''}"`,
        `"${d.duty_status || d.employment_status || ''}"`,
        `"${d.assigned_farmer_count ?? 0}"`,
        `"${d.farmer_groups_count ?? 0}"`,
        `"${d.has_smartphone ? 'Yes' : 'No'}"`,
        `"${d.has_transportation ? d.transportation_type || 'Yes' : 'None'}"`,
        `"${d.performance_status || 'Good'}"`,
      ].join(',')
    );

    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Indicator_1_1_Kebele_DAs_Roster_${Date.now()}.csv`;
    a.click();
    message.success('Report Form 2019 exported successfully');
  };

  const columns = [
    {
      title: 'DA Code & Specialist Name',
      key: 'da_info',
      width: 230,
      render: (_, r) => (
        <div>
          <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{r.full_name}</strong>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>
            ID: <span style={{ fontFamily: 'monospace' }}>{r.da_code || r.employee_id || 'DA-PENDING'}</span>
            {r.national_id && <span> | {r.national_id}</span>}
          </div>
        </div>
      ),
    },
    {
      title: 'Gender (ጾታ)',
      dataIndex: 'gender',
      key: 'gender',
      align: 'center',
      width: 105,
      sorter: (a, b) => a.gender.localeCompare(b.gender),
      render: (g) => (
        <Tag
          color={g === 'Female' ? 'purple' : 'blue'}
          icon={g === 'Female' ? <WomanOutlined /> : <ManOutlined />}
          style={{ fontWeight: 600 }}
        >
          {g}
        </Tag>
      ),
    },
    {
      title: 'Academic Level (ደረጃ)',
      dataIndex: 'qualification',
      key: 'qualification',
      width: 160,
      render: (qual, r) => {
        const val = qual || r.education_level;
        let color = 'default';
        if (val === 'MSc Degree' || val === 'Master') color = 'geekblue';
        if (val === 'BSc Degree' || val === 'Bachelor') color = 'cyan';
        if (val?.includes('Diploma')) color = 'gold';
        return <Tag color={color}>{val || 'Diploma (Level IV)'}</Tag>;
      },
    },
    {
      title: 'Discipline / Specialization',
      dataIndex: 'discipline',
      key: 'discipline',
      width: 205,
      render: (text, r) => (
        <div>
          <span style={{ fontWeight: 500, color: '#262626' }}>{text || r.primary_extension_area}</span>
          {r.specialization && (
            <div style={{ fontSize: 11, color: '#888' }}>{r.specialization}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Farmers Covered',
      key: 'coverage',
      align: 'center',
      width: 130,
      render: (_, r) => (
        <div>
          <strong style={{ color: '#1a5f2c' }}>{r.assigned_farmer_count ?? 0}</strong>
          <div style={{ fontSize: 11, color: '#888' }}>{r.farmer_groups_count ?? 0} groups</div>
        </div>
      ),
    },
    {
      title: 'FTC Station Center',
      dataIndex: 'ftc_name',
      key: 'ftc_name',
      width: 210,
      render: (ftc) => (
        <span style={{ fontWeight: 600, color: '#1a5f2c' }}>
          <BankOutlined style={{ marginRight: 5, color: '#1a5f2c' }} />
          {ftc || 'Unassigned FTC'}
        </span>
      ),
    },
    {
      title: 'Station (Location)',
      key: 'station',
      width: 200,
      render: (_, r) => (
        <div style={{ fontSize: 12 }}>
          <Tooltip title={`${extractName(r.zone)} > ${extractName(r.woreda)}`}>
            <span>
              <EnvironmentOutlined style={{ color: '#1a5f2c', marginRight: 4 }} />
              <strong>{extractName(r.kebele || r.assigned_kebele_name)}</strong>
            </span>
          </Tooltip>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>
            {extractName(r.zone)} &gt; {extractName(r.woreda)}
          </div>
        </div>
      ),
    },
    {
      title: 'Digital / Transit',
      key: 'digital_transport',
      align: 'center',
      width: 140,
      render: (_, r) => (
        <Space size={4}>
          <Tooltip title={r.has_smartphone ? `Smartphone App Active: ${r.smartphone_number || r.phone_number}` : 'Feature Phone / Voice only'}>
            <Tag color={r.has_smartphone ? 'green' : 'default'} icon={<MobileOutlined />}>
              {r.has_smartphone ? 'App' : 'Voice'}
            </Tag>
          </Tooltip>
          {r.has_transportation && (
            <Tooltip title={`Transport: ${r.transportation_type || 'Vehicle'}`}>
              <Tag color="blue" icon={<CarOutlined />} />
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: 'Active Duty Status',
      dataIndex: 'duty_status',
      key: 'duty_status',
      align: 'center',
      width: 150,
      render: (status, r) => {
        const val = status || r.employment_status || 'Active Duty';
        let color = 'default';
        let icon = <ClockCircleOutlined />;
        if (val === 'Active Duty' || val === 'Active') {
          color = 'success';
          icon = <CheckCircleOutlined />;
        } else if (val === 'On Training') {
          color = 'processing';
        } else if (val === 'Academic Upgrade') {
          color = 'purple';
        } else if (val === 'Annual Leave' || val === 'On Leave') {
          color = 'warning';
        }
        return (
          <Tag color={color} icon={icon}>
            {val}
          </Tag>
        );
      },
    },
    {
      title: 'Contact',
      dataIndex: 'phone_number',
      key: 'contact',
      width: 140,
      render: (phone) => (
        <span style={{ fontSize: 12, fontFamily: 'monospace' }}>
          <PhoneOutlined style={{ color: '#1a5f2c', marginRight: 4 }} />
          {phone || '-'}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'center',
      fixed: 'right',
      width: 140,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View DA Dossier">
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: '#1890ff' }} />}
              onClick={() => {
                setSelectedDA(record);
                setIsDossierOpen(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Edit Deployment">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: '#52c41a' }} />}
              onClick={() => handleOpenModal(record)}
            />
          </Tooltip>
          <Tooltip title="Remove DA">
            <Popconfirm
              title="Remove DA assignment?"
              description="Are you sure you want to deactivate or reassign this DA?"
              okText="Yes"
              cancelText="No"
              onConfirm={() => handleDelete(record.id)}
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ position: 'relative', minHeight: '100%', padding: 24, background: '#f8fafc' }}>
      {(isFetching || isSubmitting) && (
        <BrandedLoader message={isSubmitting ? 'Saving Deployment...' : 'Loading DA Roster...'} />
      )}

      {/* Navigation Header */}
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item><HomeOutlined /></Breadcrumb.Item>
        <Breadcrumb.Item>Extension Communication & Digitalization</Breadcrumb.Item>
        <Breadcrumb.Item>Kebele DAs (On-Duty)</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#1a5f2c', fontFamily: "'Times New Roman', Times, serif" }}>
            Kebele Development Agents Roster (በስራ ላይ ያሉ የቀበሌ ግብርና ባለሙያዎች - Indicator 1.1)
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Monitoring full on-duty staffing quotas disaggregated by discipline, FTC placement, and gender
          </Text>
        </div>
        <Button icon={<ReloadOutlined />} onClick={loadData} loading={isFetching}>
          Refresh
        </Button>
      </div>

      {/* Indicator 1.1 KPI Dashboard */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #1a5f2c', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Total DAs Deployed</span>}
              value={stats.total}
              prefix={<SolutionOutlined style={{ color: '#1a5f2c', marginRight: 8 }} />}
              valueStyle={{ color: '#1a5f2c', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Active on Duty: <strong style={{ color: '#262626' }}>{stats.activeCount}</strong>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #1890ff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Male Specialists (ወንድ)</span>}
              value={stats.maleCount}
              prefix={<ManOutlined style={{ color: '#1890ff', marginRight: 8 }} />}
              valueStyle={{ color: '#1890ff', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Regional allocation: 11,416 target
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #722ed1', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Female Specialists (ሴት)</span>}
              value={stats.femaleCount}
              prefix={<WomanOutlined style={{ color: '#722ed1', marginRight: 8 }} />}
              valueStyle={{ color: '#722ed1', fontWeight: 'bold', fontSize: 24 }}
            />
            <Progress percent={Number(stats.femaleRatio)} size="small" strokeColor="#722ed1" />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8c8c8c', marginTop: 2 }}>
              <span>Share: <strong style={{ color: '#722ed1' }}>{stats.femaleRatio}%</strong></span>
              <span>Regional Goal: &gt; 35%</span>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, borderLeft: '4px solid #fa8c16', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>Covered FTC Centers</span>}
              value={[...new Set(filteredDAs.map((d) => d.ftc_name).filter(Boolean))].length}
              prefix={<SafetyCertificateOutlined style={{ color: '#fa8c16', marginRight: 8 }} />}
              valueStyle={{ color: '#fa8c16', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              Smartphone ready: <strong style={{ color: '#1890ff' }}>{stats.smartphoneCount}</strong> | Transport: <strong style={{ color: '#fa8c16' }}>{stats.transportCount}</strong>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Filter & Action Toolbar */}
      <Card bordered={false} style={{ marginBottom: 16, borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }} bodyStyle={{ padding: '14px 16px' }}>
        <Row justify="space-between" align="middle" gutter={[12, 12]}>
          <Col xs={24} xxl={16} xl={15}>
            <Space wrap size={[10, 10]}>
              <Input
                placeholder="Search DA Name, Code, or Kebele..."
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: 220 }}
                allowClear
              />

              <Select
                placeholder="Select FTC Center"
                value={ftcFilter}
                onChange={setFtcFilter}
                style={{ width: 195 }}
                allowClear
                showSearch
                optionFilterProp="children"
              >
                {ftcList.map((ftc) => (
                  <Option key={ftc.id || ftc.name} value={ftc.name}>
                    <BankOutlined style={{ marginRight: 6, color: '#1a5f2c' }} />
                    {ftc.name}
                  </Option>
                ))}
              </Select>

              <Select
                placeholder="Active Duty Status"
                value={dutyStatusFilter}
                onChange={setDutyStatusFilter}
                style={{ width: 170 }}
                allowClear
              >
                <Option value="Active Duty">Active Duty (በስራ ላይ ያለ)</Option>
                <Option value="On Training">On Training (ስልጠና ላይ)</Option>
                <Option value="Academic Upgrade">Academic Upgrade (ትምህርት ላይ)</Option>
                <Option value="Annual Leave">Annual Leave (እረፍት ላይ)</Option>
              </Select>

              <Select
                placeholder="Academic Level (ደረጃ)"
                value={qualificationFilter}
                onChange={setQualificationFilter}
                style={{ width: 175 }}
                allowClear
              >
                <Option value="Certificate (Level III)">Certificate (Level III)</Option>
                <Option value="Diploma (Level IV)">Diploma (Level IV)</Option>
                <Option value="BSc Degree">BSc Degree</Option>
                <Option value="MSc Degree">MSc Degree</Option>
              </Select>

              <Select
                placeholder="Filter by Discipline"
                value={disciplineFilter}
                onChange={setDisciplineFilter}
                style={{ width: 190 }}
                allowClear
              >
                <Option value="Crop Production (አዝርዕት)">Crop Production (አዝርዕት)</Option>
                <Option value="Animal Science (እንስሳት ሀብት)">Animal Science (እንስሳት ሀብት)</Option>
                <Option value="Natural Resource Management (የተፈጥሮ ሀብት)">Natural Resources (የተፈጥሮ ሀብት)</Option>
                <Option value="Irrigation & Horticulture (መስኖና አትክልት)">Irrigation & Horticulture (መስኖና አትክልት)</Option>
              </Select>

              <Select
                placeholder="Filter by Zone"
                value={zoneFilter}
                onChange={setZoneFilter}
                style={{ width: 150 }}
                allowClear
              >
                {[...new Set(das.map((d) => extractName(d.zone)))].map((z) => (
                  <Option key={z} value={z}>{z}</Option>
                ))}
              </Select>

              <Select
                placeholder="Gender"
                value={genderFilter}
                onChange={setGenderFilter}
                style={{ width: 105 }}
                allowClear
              >
                <Option value="Male">Male (ወንድ)</Option>
                <Option value="Female">Female (ሴት)</Option>
              </Select>
            </Space>
          </Col>

          <Col xs={24} xxl={8} xl={9} style={{ textAlign: 'right' }}>
            <Space size="small" wrap>
              <Button icon={<DownloadOutlined />} onClick={exportToCSV} style={{ fontWeight: 500 }}>
                Export Form 2019
              </Button>

              <Button
                icon={<ClearOutlined />}
                onClick={handleResetFilters}
                disabled={!(searchTerm || zoneFilter || disciplineFilter || genderFilter || dutyStatusFilter || qualificationFilter || ftcFilter)}
              >
                Reset Filters
              </Button>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => handleOpenModal(null)}
                style={{ backgroundColor: '#1a5f2c', borderColor: '#1a5f2c', fontWeight: 600 }}
              >
                Deploy New DA
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Roster Table */}
      <Table
        columns={columns}
        dataSource={filteredDAs}
        rowKey="id"
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} DAs deployed`,
        }}
        scroll={{ x: 1300 }}
        bordered
        size="middle"
      />

      {/* Deployment & Assignment Form Modal with all operational attributes */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SolutionOutlined style={{ color: '#1a5f2c', fontSize: 18 }} />
            <span style={{ color: '#1a5f2c', fontWeight: 'bold', fontFamily: "'Times New Roman', Times, serif", fontSize: 17 }}>
              {editingDA ? 'Edit Development Agent Deployment' : 'Deploy New Kebele Development Agent'}
            </span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText={editingDA ? 'Update Deployment' : 'Deploy Specialist'}
        okButtonProps={{ style: { backgroundColor: '#1a5f2c', borderColor: '#1a5f2c' }, loading: isSubmitting }}
        width={850}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          {/* SECTION 1: IDENTITY */}
          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Officer Identity & Personal Details
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="da_code" label="Official DA Code" rules={[{ required: true, message: 'Code required' }]}>
                <Input placeholder="e.g. DA-EG-0819" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="employee_id" label="Employee ID">
                <Input placeholder="e.g. EMP-0819" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="national_id" label="National ID / Fayda">
                <Input placeholder="Fayda ID number" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="full_name" label="Full Name (with Grandfather)" rules={[{ required: true, message: 'Full name required' }]}>
                <Input placeholder="e.g. Martha Tesfaye Alemayehu" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="gender" label="Gender (ጾታ)" rules={[{ required: true }]}>
                <Select>
                  <Option value="Male">Male (ወንድ)</Option>
                  <Option value="Female">Female (ሴት)</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="age" label="Age">
                <InputNumber min={18} max={75} style={{ width: '100%' }} placeholder="30" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="marital_status" label="Marital Status">
                <Select>
                  <Option value="Married">Married</Option>
                  <Option value="Single">Single</Option>
                  <Option value="Widowed">Widowed</Option>
                  <Option value="Divorced">Divorced</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="phone_number" label="Mobile Phone Number" rules={[{ required: true }]}>
                <Input placeholder="+251 9..." />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="email" label="Official Email Address">
                <Input placeholder="name@moa.gov.et" />
              </Form.Item>
            </Col>
          </Row>

          {/* SECTION 2: ACADEMICS & POSITION */}
          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Academic Credentials & Employment
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="education_level" label="Education Level" rules={[{ required: true }]}>
                <Select>
                  <Option value="Certificate">Certificate (Level III)</Option>
                  <Option value="Diploma">Diploma (Level IV)</Option>
                  <Option value="Bachelor">Bachelor's Degree</Option>
                  <Option value="Master">Master's Degree</Option>
                  <Option value="PhD">PhD</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="field_of_study" label="Field of Study">
                <Input placeholder="e.g. Plant Science, Agronomy" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="graduation_year" label="Graduation Year (G.C.)">
                <InputNumber min={1980} max={2030} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="position_title" label="Position Title" rules={[{ required: true }]}>
                <Select>
                  <Option value="Development Agent">Development Agent</Option>
                  <Option value="Senior Development Agent">Senior Development Agent</Option>
                  <Option value="Lead Development Agent">Lead Development Agent</Option>
                  <Option value="Agricultural Extension Agent">Agricultural Extension Agent</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="duty_status" label="Active Duty Status" rules={[{ required: true }]}>
                <Select>
                  <Option value="Active Duty">Active Duty (በስራ ላይ ያለ)</Option>
                  <Option value="On Training">On Package Training (ስልጠና ላይ)</Option>
                  <Option value="Academic Upgrade">Academic Study Leave (ትምህርት ላይ)</Option>
                  <Option value="Annual Leave">Annual Leave (እረፍት ላይ)</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="employment_type" label="Employment Type">
                <Select>
                  <Option value="Permanent">Permanent</Option>
                  <Option value="Contract">Contract</Option>
                  <Option value="Temporary">Temporary</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="discipline" label="Specialized Discipline" rules={[{ required: true }]}>
                <Select>
                  <Option value="Crop Production (አዝርዕት)">Crop Production (አዝርዕት)</Option>
                  <Option value="Animal Science (እንስሳት ሀብት)">Animal Science (እንስሳት ሀብት)</Option>
                  <Option value="Natural Resource Management (የተፈጥሮ ሀብት)">Natural Resources (የተፈጥሮ ሀብት)</Option>
                  <Option value="Irrigation & Horticulture (መስኖና አትክልት)">Irrigation & Horticulture (መስኖና አትክልት)</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="years_of_service" label="Years of Service">
                <InputNumber min={0} max={50} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="hire_date" label="Date of Employment">
                <Input type="date" />
              </Form.Item>
            </Col>
          </Row>

          {/* SECTION 3: EXTENSION PORTFOLIO & FARMER COVERAGE */}
          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Extension Scope & Farmer Coverage Quota
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="assigned_farmer_count" label="Assigned Farmers Quota">
                <InputNumber min={0} style={{ width: '100%' }} placeholder="300" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="farmer_groups_count" label="Farmer Groups (Development Teams)">
                <InputNumber min={0} style={{ width: '100%' }} placeholder="10" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="development_centers_count" label="Development Centers">
                <InputNumber min={0} style={{ width: '100%' }} placeholder="1" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="extension_services" label="Primary Extension Services Delivered">
                <Select mode="multiple" placeholder="Select services">
                  <Option value="Farmer Advisory">Farmer Advisory</Option>
                  <Option value="Farm Visit">Farm Visit</Option>
                  <Option value="Training">Farmer Training</Option>
                  <Option value="Demonstration">Demonstration</Option>
                  <Option value="Input Advisory">Input Advisory</Option>
                  <Option value="Market Linkage">Market Linkage</Option>
                  <Option value="Technology Transfer">Technology Transfer</Option>
                  <Option value="Disease Control">Disease Control</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="special_programs" label="Assigned Special Programs">
                <Select mode="tags" placeholder="Programs">
                  <Option value="Cluster Farming">Cluster Farming</Option>
                  <Option value="Productivity">Productivity Program</Option>
                  <Option value="Irrigation">Irrigation Expansion</Option>
                  <Option value="Climate Smart Agriculture">Climate Smart Agriculture</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* SECTION 4: FTC STATION & LOCATION */}
          <Divider orientation="left" style={{ margin: '8px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            FTC Station Center & Accommodation
          </Divider>
          <Row gutter={16}>
            <Col span={10}>
              <Form.Item name="ftc_name" label="Primary FTC Station Center" rules={[{ required: true, message: 'Please select an FTC' }]}>
                <Select placeholder="Select registered FTC" showSearch optionFilterProp="children" allowClear>
                  {ftcList.map((ftc) => (
                    <Option key={ftc.id || ftc.name} value={ftc.name}>
                      <BankOutlined style={{ marginRight: 6, color: '#1a5f2c' }} />
                      {ftc.name}
                      {ftc.kebele ? ` (${ftc.kebele})` : ''}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={7}>
              <Form.Item name="assigned_year" label="Year Assigned (E.C.)" rules={[{ required: true }]}>
                <InputNumber min={2000} max={2030} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={7}>
              <Form.Item name="has_residential_quarter" label="DA Residential Quarters" rules={[{ required: true }]}>
                <Select>
                  <Option value={true}>Available (መኖሪያ ቤት አለው)</Option>
                  <Option value={false}>Unavailable (መኖሪያ ቤት የለውም)</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="assigned_kebele_name" label="Assigned Kebele Name">
                <Input placeholder="Kebele / Peasant Association" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="assignment_area" label="Assignment Catchment Area">
                <Input placeholder="e.g. Watershed / Cluster Area" />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ marginTop: 8 }}>
            <LocationScopeSelector form={form} editingData={editingDA} />
          </div>

          {/* SECTION 5: CERTIFICATION & TRAINING */}
          <Divider orientation="left" style={{ margin: '16px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Certifications & Training
          </Divider>
          <Row gutter={16} align="middle">
            <Col span={8}>
              <Form.Item name="professional_certified" valuePropName="checked" label="Professional Certification">
                <Switch checkedChildren="Certified" unCheckedChildren="No" />
              </Form.Item>
            </Col>
            {isCertifiedWatch && (
              <>
                <Col span={8}>
                  <Form.Item name="certification_name" label="Certification Name" rules={[{ required: true, message: 'Name required' }]}>
                    <Input placeholder="License Name" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="certification_number" label="License / Cert Number">
                    <Input placeholder="Cert ID" />
                  </Form.Item>
                </Col>
              </>
            )}
          </Row>

          <Row gutter={16} align="middle">
            <Col span={8}>
              <Form.Item name="has_extension_training" valuePropName="checked" label="Received Extension Training">
                <Switch checkedChildren="Yes" unCheckedChildren="No" />
              </Form.Item>
            </Col>
            {hasTrainingWatch && (
              <>
                <Col span={8}>
                  <Form.Item name="extension_training_type" label="ToT Training Subject" rules={[{ required: true, message: 'Type required' }]}>
                    <Input placeholder="e.g. Row Planting ToT" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="last_training_date" label="Last Training Date">
                    <Input type="date" />
                  </Form.Item>
                </Col>
              </>
            )}
          </Row>

          {/* SECTION 6: DIGITAL CONNECTIVITY & MOBILITY */}
          <Divider orientation="left" style={{ margin: '16px 0 16px', fontSize: 13, color: '#1a5f2c' }}>
            Digital Access, Transportation & Performance
          </Divider>
          <Row gutter={16} align="middle">
            <Col span={6}>
              <Form.Item name="has_smartphone" valuePropName="checked" label="Smartphone Access">
                <Switch checkedChildren="Yes (IAIMS)" unCheckedChildren="No" />
              </Form.Item>
            </Col>
            {hasSmartphoneWatch && (
              <Col span={6}>
                <Form.Item name="smartphone_number" label="Smartphone Number">
                  <Input placeholder="+251 9..." />
                </Form.Item>
              </Col>
            )}
            <Col span={6}>
              <Form.Item name="digital_literacy_level" label="Digital Literacy">
                <Select>
                  <Option value="Basic">Basic</Option>
                  <Option value="Intermediate">Intermediate</Option>
                  <Option value="Advanced">Advanced</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="iaims_user_status" label="IAIMS System Status">
                <Select>
                  <Option value="Active">Active</Option>
                  <Option value="Pending">Pending</Option>
                  <Option value="Inactive">Inactive</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16} align="middle">
            <Col span={6}>
              <Form.Item name="has_transportation" valuePropName="checked" label="Transport Access">
                <Switch checkedChildren="Yes" unCheckedChildren="No" />
              </Form.Item>
            </Col>
            {hasTransportWatch && (
              <Col span={6}>
                <Form.Item name="transportation_type" label="Transport Type" rules={[{ required: true, message: 'Type required' }]}>
                  <Select>
                    <Option value="Motorcycle">Motorcycle</Option>
                    <Option value="Vehicle">Vehicle</Option>
                    <Option value="Bicycle">Bicycle</Option>
                    <Option value="Public Transport">Public Transport</Option>
                    <Option value="Other">Other</Option>
                  </Select>
                </Form.Item>
              </Col>
            )}
            <Col span={6}>
              <Form.Item name="field_visit_frequency" label="Visit Frequency">
                <Select>
                  <Option value="Daily">Daily</Option>
                  <Option value="Several times per week">Several times per week</Option>
                  <Option value="Weekly">Weekly</Option>
                  <Option value="Monthly">Monthly</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="field_visit_target" label="Monthly Visit Target">
                <InputNumber min={0} style={{ width: '100%' }} placeholder="20" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={6}>
              <Form.Item name="annual_training_count" label="Annual Trainings / Yr">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="annual_farm_visit_count" label="Annual Farm Visits / Yr">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="annual_demonstration_count" label="Annual Demos / Yr">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="performance_status" label="Performance Status">
                <Select>
                  <Option value="Good">Good</Option>
                  <Option value="Excellent">Excellent</Option>
                  <Option value="Needs Improvement">Needs Improvement</Option>
                  <Option value="Under Review">Under Review</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="remarks" label="Supervisor Notes / Operational Remarks">
                <Input.TextArea rows={2} placeholder="Additional observations, specific assignment details..." />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* COMPREHENSIVE DA DOSSIER MODAL WITH FULL ATTRIBUTES */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                backgroundColor: '#e6f7ed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1a5f2c',
                fontSize: 18,
              }}
            >
              <IdcardOutlined />
            </div>
            <div>
              <span style={{ fontSize: 16, fontWeight: 'bold', color: '#1a5f2c', fontFamily: "'Times New Roman', Times, serif" }}>
                {selectedDA?.full_name}
              </span>
              <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                Code: {selectedDA?.da_code || selectedDA?.employee_id} | {selectedDA?.position_title || 'Development Agent'}
              </div>
            </div>
          </div>
        }
        open={isDossierOpen}
        onCancel={() => setIsDossierOpen(false)}
        footer={[
          <Button
            key="edit"
            onClick={() => {
              setIsDossierOpen(false);
              handleOpenModal(selectedDA);
            }}
          >
            Edit Deployment
          </Button>,
          <Button
            key="close"
            type="primary"
            onClick={() => setIsDossierOpen(false)}
            style={{ backgroundColor: '#1a5f2c', borderColor: '#1a5f2c' }}
          >
            Close Dossier
          </Button>,
        ]}
        width={850}
        destroyOnClose
      >
        {selectedDA && (
          <div style={{ paddingTop: 8 }}>
            <Tabs defaultActiveKey="1" type="card">
              {/* Tab 1: Profile & Credentials */}
              <TabPane
                tab={
                  <span>
                    <UserOutlined />
                    Officer Profile
                  </span>
                }
                key="1"
              >
                <Descriptions bordered size="small" column={{ xs: 1, sm: 3 }} style={{ marginBottom: 16 }}>
                  <Descriptions.Item label="Official Name" span={2}>
                    <strong>{selectedDA.full_name}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Gender">
                    <Tag color={selectedDA.gender === 'Female' ? 'purple' : 'blue'}>{selectedDA.gender}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="DA Staff Code">
                    <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{selectedDA.da_code || selectedDA.employee_id}</span>
                  </Descriptions.Item>
                  <Descriptions.Item label="National ID / Fayda">
                    {selectedDA.national_id || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Age & Marital Status">
                    {selectedDA.age ? `${selectedDA.age} yrs` : '-'} | {selectedDA.marital_status || 'Single'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Position Title">
                    <strong style={{ color: '#1a5f2c' }}>{selectedDA.position_title || 'Development Agent'}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Duty / Employment Status">
                    <Tag color="success">{selectedDA.duty_status || selectedDA.employment_status || 'Active'}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Years of Service">
                    {selectedDA.years_of_service ?? 0} yrs (Hired: {selectedDA.hire_date || 'N/A'})
                  </Descriptions.Item>
                  <Descriptions.Item label="Direct Phone">
                    <span style={{ fontFamily: 'monospace' }}>{selectedDA.phone_number}</span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Email Address" span={2}>
                    {selectedDA.email || 'N/A'}
                  </Descriptions.Item>
                </Descriptions>
              </TabPane>

              {/* Tab 2: Station, FTC & Residence */}
              <TabPane
                tab={
                  <span>
                    <EnvironmentOutlined />
                    Station & FTC Base
                  </span>
                }
                key="2"
              >
                <Descriptions bordered size="small" column={{ xs: 1, sm: 3 }} style={{ marginBottom: 16 }}>
                  <Descriptions.Item label="Zone">
                    <strong>{extractName(selectedDA.zone)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Woreda">
                    <strong>{extractName(selectedDA.woreda)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Kebele Base">
                    <span style={{ color: '#1a5f2c', fontWeight: 'bold' }}>{extractName(selectedDA.kebele || selectedDA.assigned_kebele_name)}</span>
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
                  <Descriptions.Item label="Assigned FTC Center" span={2}>
                    <strong style={{ color: '#1a5f2c' }}>
                      <BankOutlined style={{ marginRight: 6 }} />
                      {selectedDA.ftc_name || 'Unassigned FTC'}
                    </strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Residential Quarters">
                    {selectedDA.has_residential_quarter ? (
                      <Tag color="green" icon={<CheckCircleOutlined />}>Housing Provided (አለው)</Tag>
                    ) : (
                      <Tag color="orange">No Housing (የለውም)</Tag>
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Catchment Assignment">
                    {selectedDA.assignment_area || 'General Kebele Jurisdiction'}
                  </Descriptions.Item>
                </Descriptions>
              </TabPane>

              {/* Tab 3: Academics & Technical Qualifications */}
              <TabPane
                tab={
                  <span>
                    <BookOutlined />
                    Qualifications & ToT
                  </span>
                }
                key="3"
              >
                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }} style={{ marginBottom: 16 }}>
                  <Descriptions.Item label="Academic Qualification">
                    <Tag color="cyan">{selectedDA.qualification || selectedDA.education_level || 'Diploma'}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Field of Study">
                    <strong>{selectedDA.field_of_study || 'General Agriculture'}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Assigned Discipline">
                    <Tag color="green">{selectedDA.discipline || selectedDA.primary_extension_area}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Specialization Area">
                    {selectedDA.specialization || selectedDA.secondary_extension_area || 'Standard Practice'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Professional Certification" span={2}>
                    {selectedDA.professional_certified ? (
                      <div>
                        <Tag color="green" icon={<CheckCircleOutlined />}>Certified</Tag>
                        <strong>{selectedDA.certification_name}</strong>
                        {selectedDA.certification_number && (
                          <span style={{ color: '#888', marginLeft: 8 }}>(License: {selectedDA.certification_number})</span>
                        )}
                      </div>
                    ) : (
                      <span style={{ color: '#888' }}>Not certified</span>
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Extension ToT Training Received" span={2}>
                    {selectedDA.has_extension_training ? (
                      <div>
                        <Tag color="blue">Trained</Tag>
                        <span>{selectedDA.extension_training_type}</span>
                        {selectedDA.last_training_date && (
                          <span style={{ color: '#888', marginLeft: 8 }}>(Date: {selectedDA.last_training_date})</span>
                        )}
                      </div>
                    ) : (
                      <span style={{ color: '#888' }}>No recorded ToT training</span>
                    )}
                  </Descriptions.Item>
                </Descriptions>
              </TabPane>

              {/* Tab 4: Field Operations, Coverage & Connectivity */}
              <TabPane
                tab={
                  <span>
                    <TeamOutlined />
                    Coverage & Digital Tools
                  </span>
                }
                key="4"
              >
                <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
                  <Col span={8}>
                    <Card size="small" style={{ background: '#f6ffed', textAlign: 'center' }}>
                      <Statistic title="Assigned Farmers" value={selectedDA.assigned_farmer_count ?? 0} valueStyle={{ color: '#1a5f2c' }} />
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card size="small" style={{ background: '#f0f5ff', textAlign: 'center' }}>
                      <Statistic title="Farmer Groups" value={selectedDA.farmer_groups_count ?? 0} valueStyle={{ color: '#1890ff' }} />
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card size="small" style={{ background: '#fcffe6', textAlign: 'center' }}>
                      <Statistic title="Development Centers" value={selectedDA.development_centers_count ?? 0} valueStyle={{ color: '#d48806' }} />
                    </Card>
                  </Col>
                </Row>

                <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
                  <Descriptions.Item label="Services Delivered" span={2}>
                    {(selectedDA.extension_services || ['Farmer Advisory', 'Farm Visit']).map((srv) => (
                      <Tag key={srv} color="geekblue">{srv}</Tag>
                    ))}
                  </Descriptions.Item>
                  <Descriptions.Item label="Assigned Special Programs" span={2}>
                    {(selectedDA.special_programs || ['Productivity']).map((prog) => (
                      <Tag key={prog} color="purple">{prog}</Tag>
                    ))}
                  </Descriptions.Item>
                  <Descriptions.Item label="Smartphone Access">
                    {selectedDA.has_smartphone ? (
                      <Tag color="green" icon={<CheckCircleOutlined />}>Available ({selectedDA.smartphone_number || selectedDA.phone_number})</Tag>
                    ) : (
                      <Tag color="default" icon={<CloseCircleOutlined />}>No Smartphone</Tag>
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="IAIMS System Status">
                    <Tag color={selectedDA.iaims_user_status === 'Active' ? 'green' : 'orange'}>
                      {selectedDA.iaims_user_status || 'Active'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Field Transportation">
                    {selectedDA.has_transportation ? (
                      <Tag color="blue" icon={<CarOutlined />}>{selectedDA.transportation_type || 'Vehicle'}</Tag>
                    ) : (
                      <Tag color="default">Foot / None</Tag>
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Field Visit Frequency">
                    {selectedDA.field_visit_frequency || 'Regular'} ({selectedDA.field_visit_target || 20} visits/mo)
                  </Descriptions.Item>
                  <Descriptions.Item label="Performance Status">
                    <Tag color="green">{selectedDA.performance_status || 'Good'}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Annual Summary">
                    {selectedDA.annual_training_count ?? 0} Trainings | {selectedDA.annual_farm_visit_count ?? 0} Visits | {selectedDA.annual_demonstration_count ?? 0} Demos
                  </Descriptions.Item>
                  <Descriptions.Item label="Supervisor Notes / Remarks" span={2}>
                    {selectedDA.remarks || 'No remarks recorded.'}
                  </Descriptions.Item>
                </Descriptions>
              </TabPane>
            </Tabs>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default function KebeleDAs() {
  return (
    <App>
      <KebeleDAsContent />
    </App>
  );
}