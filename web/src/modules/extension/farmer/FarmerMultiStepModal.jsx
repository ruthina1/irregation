import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Row,
  Col,
  InputNumber,
  Switch,
  Button,
  Steps,
  Space,
  Divider,
  Tag,
  Card,
  Tooltip,
  DatePicker,
  Upload,
  Alert,
  Typography,
  Radio,
  Checkbox,
  message, 
} from 'antd';
import {
  UserOutlined,
  IdcardOutlined,
  SolutionOutlined,
  HomeOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  MedicineBoxOutlined,
  BankOutlined,
  ApartmentOutlined,
  FileTextOutlined,
  CheckCircleFilled,
  InfoCircleOutlined,
  CameraOutlined,
  TagsOutlined,
  BuildOutlined,
  ExperimentOutlined,
  CarOutlined,
  ShopOutlined,
  BookOutlined,
  ClusterOutlined,AppstoreOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import LocationScopeSelector from '../../../components/common/LocationScopeSelector';

const { Text, Title } = Typography;
const { TextArea } = Input;

const GREEN = '#1a5f2c';
const LIGHT_GREEN = '#f6ffed';

const option = (value, label) => ({ value, label });

const genderOptions = [
  option('Male', 'Male (ወንድ)'),
  option('Female', 'Female (ሴት)'),
  option('Other', 'Other'),
];

const maritalOptions = [
  option('Married', 'Married (ባለትዳር)'),
  option('Single', 'Single (ያላገባ/ች)'),
  option('Widowed', 'Widowed (የሞተበት/ባት)'),
  option('Divorced', 'Divorced (የተፋታ/ች)'),
  option('Separated', 'Separated'),
];

const idTypeOptions = [
  option('Fayda', 'Fayda'),
  option('National ID', 'National ID'),
  option('Kebele ID', 'Kebele ID'),
  option('Passport', 'Passport'),
  option('Other Government ID', 'Other Government ID'),
  option('No Formal ID', 'No Formal ID'),
];

const headRoleOptions = [
  option('Household Head', 'Household Head'),
  option('Spouse', 'Spouse'),
  option('Household Member', 'Household Member'),
  option('Dependent', 'Dependent Member'),
];

const educationOptions = [
  option('Cannot Read and Write', 'Cannot Read and Write'),
  option('Can Read and Write', 'Can Read and Write'),
  option('Primary', 'Primary'),
  option('Secondary', 'Secondary'),
  option('Certificate', 'Certificate'),
  option('Diploma', 'Diploma'),
  option('Bachelor', "Bachelor's Degree"),
  option('Master or Above', "Master's or Above"),
  option('Other', 'Other'),
];

const farmerCategoryOptions = [
  option('Regular Smallholder', 'Regular Smallholder'),
  option('Model Farmer', 'Model Farmer (ሞዴል ገበሬ)'),
  option('Private Investor', 'Private Investor'),
  option('Woman Farmer', 'Woman Farmer'),
  option('Youth Farmer', 'Youth Farmer'),
  option('Commercial Farmer', 'Commercial Farmer'),
  option('Full-Package Farmer', 'Full-Package Farmer'),
  option('Irrigated Farmer', 'Irrigated Farmer'),
  option('Horticulture Farmer', 'Horticulture Farmer'),
  option('Livestock Farmer', 'Livestock Farmer'),
  option('Pastoralist', 'Pastoralist'),
  option('Agro-Pastoralist', 'Agro-Pastoralist'),
  option('Urban/Peri-Urban Farmer', 'Urban / Peri-Urban Farmer'),
  option('Other', 'Other'),
];

const livelihoodOptions = [
  option('Crop Production', 'Crop Production'),
  option('Livestock', 'Livestock'),
  option('Horticulture', 'Horticulture'),
  option('Mixed Farming', 'Mixed Farming'),
  option('Agro-Pastoralism', 'Agro-Pastoralism'),
  option('Pastoralism', 'Pastoralism'),
  option('Agribusiness', 'Agribusiness'),
  option('Other', 'Other'),
];

const cooperativeRoleOptions = [
  option('Member', 'Member'),
  option('Board Member', 'Board Member'),
  option('Leader', 'Leader'),
  option('Chairperson', 'Chairperson'),
  option('Secretary', 'Secretary'),
  option('Treasurer', 'Treasurer'),
  option('Other', 'Other'),
];

const landTenureOptions = [
  option('Owned', 'Owned'),
  option('Rented', 'Rented'),
  option('Sharecropped', 'Sharecropped'),
  option('Leased', 'Leased'),
  option('Communal', 'Communal'),
  option('Government Allocated', 'Government Allocated'),
  option('Other', 'Other'),
];

const irrigationSourceOptions = [
  option('River', 'River'),
  option('Groundwater', 'Groundwater'),
  option('Borehole', 'Borehole'),
  option('Well', 'Well'),
  option('Spring', 'Spring'),
  option('Dam', 'Dam'),
  option('Reservoir', 'Reservoir'),
  option('Lake', 'Lake'),
  option('Other', 'Other'),
];

const irrigationMethodOptions = [
  option('Surface', 'Surface Irrigation'),
  option('Pump', 'Pump Irrigation'),
  option('Drip', 'Drip Irrigation'),
  option('Sprinkler', 'Sprinkler Irrigation'),
  option('Canal', 'Canal Irrigation'),
  option('Other', 'Other'),
];

const primaryLivelihoodOptions = livelihoodOptions;

const cropOptions = [
  option('Teff', 'Teff (ጤፍ)'),
  option('Wheat', 'Wheat (ስንዴ)'),
  option('Maize', 'Maize (በቆሎ)'),
  option('Sorghum', 'Sorghum (ማሽላ)'),
  option('Barley', 'Barley (ገብስ)'),
  option('Oats', 'Oats'),
  option('Millet', 'Millet'),
  option('Rice', 'Rice'),
  option('Chickpea', 'Chickpea (ሽንብራ)'),
  option('Faba Bean', 'Faba Bean (ባቄላ)'),
  option('Field Pea', 'Field Pea'),
  option('Lentil', 'Lentil'),
  option('Soybean', 'Soybean'),
  option('Sesame', 'Sesame (ሰሊጥ)'),
  option('Niger Seed', 'Niger Seed (ኑግ)'),
  option('Sunflower', 'Sunflower'),
  option('Cotton', 'Cotton'),
  option('Potato', 'Potato'),
  option('Sweet Potato', 'Sweet Potato'),
  option('Onion', 'Onion'),
  option('Tomato', 'Tomato'),
  option('Pepper', 'Pepper'),
  option('Cabbage', 'Cabbage'),
  option('Garlic', 'Garlic'),
  option('Carrot', 'Carrot'),
  option('Banana', 'Banana'),
  option('Avocado', 'Avocado'),
  option('Mango', 'Mango'),
  option('Coffee', 'Coffee'),
  option('Chat', 'Chat'),
  option('Sugarcane', 'Sugarcane'),
  option('Fodder', 'Fodder'),
];

const disabilityOptions = [
  option('Visual Impairment', 'Visual Impairment (ማየት የተሳነው)'),
  option('Hearing Impairment', 'Hearing Impairment (መስማት የተሳነው)'),
  option('Physical / Mobility', 'Physical / Mobility'),
  option('Speech Impairment', 'Speech Impairment'),
  option('Mental / Cognitive', 'Mental / Cognitive'),
  option('Multiple Disabilities', 'Multiple Disabilities'),
  option('Other', 'Other'),
];

const contactMethodOptions = [
  option('Phone Call', 'Phone Call'),
  option('SMS', 'SMS'),
  option('In Person', 'In Person'),
  option('Other', 'Other'),
];

const householdEconomicOptions = [
  option('Very Poor', 'Very Poor'),
  option('Poor', 'Poor'),
  option('Medium', 'Medium'),
  option('Better Off', 'Better Off'),
  option('Well Off', 'Well Off'),
  option('Not Assessed', 'Not Assessed'),
];

const vulnerabilityOptions = [
  option('None Identified', 'None Identified'),
  option('Female Headed Household', 'Female Headed Household'),
  option('Youth Household', 'Youth Household'),
  option('Disability', 'Disability'),
  option('Elderly', 'Elderly'),
  option('Food Insecure', 'Food Insecure'),
  option('Drought Affected', 'Drought Affected'),
  option('Flood Affected', 'Flood Affected'),
  option('Other', 'Other'),
];

const machineryOptions = [
  option('Tractor', 'Tractor'),
  option('Combine Harvester', 'Combine Harvester'),
  option('Planter', 'Planter'),
  option('Thresher', 'Thresher'),
  option('Water Pump', 'Water Pump'),
  option('Motorized Sprayer', 'Motorized Sprayer'),
  option('Harvester', 'Harvester'),
  option('Other', 'Other'),
];

const waterSourceOptions = [
  option('River', 'River'),
  option('Borehole', 'Borehole'),
  option('Well', 'Well'),
  option('Spring', 'Spring'),
  option('Rainwater', 'Rainwater'),
  option('Dam', 'Dam'),
  option('Reservoir', 'Reservoir'),
  option('Lake', 'Lake'),
  option('Other', 'Other'),
];

const farmerGroupOptions = [
  option('Farmer Group', 'Farmer Group'),
  option('FFS', 'Farmer Field School (FFS)'),
  option('Cluster', 'Cluster'),
  option('Commodity Group', 'Commodity Group'),
  option('Youth Group', 'Youth Group'),
  option('Women Group', 'Women Farmer Group'),
  option('Other', 'Other'),
];

const inputSourceOptions = [
  option('Cooperative', 'Cooperative'),
  option('Union', 'Union'),
  option('Private Supplier', 'Private Supplier'),
  option('Government', 'Government'),
  option('NGO', 'NGO'),
  option('Own Production', 'Own Production'),
  option('Other', 'Other'),
];

const productionSystemOptions = [
  option('Rainfed', 'Rainfed'),
  option('Irrigated', 'Irrigated'),
  option('Mixed', 'Rainfed + Irrigated'),
];

const SectionCard = ({ icon, title, description, children }) => (
  <Card
    size="small"
    bordered
    style={{
      background: '#fcfdfd',
      borderRadius: 8,
      marginBottom: 16,
    }}
    title={
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 6,
            background: '#e6f7ed',
            color: GREEN,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </div>
        <div>
          <div
            style={{
              color: GREEN,
              fontSize: 13,
              fontWeight: 700,
              textTransform: 'uppercase',
            }}
          >
            {title}
          </div>
          {description && (
            <div style={{ fontSize: 11, color: '#888', fontWeight: 400 }}>
              {description}
            </div>
          )}
        </div>
      </div>
    }
  >
    {children}
  </Card>
);

const FieldLabel = ({ children, info }) => (
  <Space size={4}>
    <span style={{ fontWeight: 600 }}>{children}</span>
    {info && (
      <Tooltip title={info}>
        <InfoCircleOutlined style={{ color: '#aaa', fontSize: 12 }} />
      </Tooltip>
    )}
  </Space>
);

const SwitchBox = ({ name, title, description, checked, onColor = LIGHT_GREEN }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 12px',
      background: checked ? onColor : '#fff',
      border: `1px solid ${checked ? '#b7eb8f' : '#f0f0f0'}`,
      borderRadius: 6,
      minHeight: 58,
    }}
  >
    <div>
      <strong style={{ fontSize: 13, color: '#262626' }}>{title}</strong>
      {description && (
        <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
          {description}
        </div>
      )}
    </div>

    <Form.Item name={name} valuePropName="checked" noStyle>
      <Switch checkedChildren="Yes" unCheckedChildren="No" />
    </Form.Item>
  </div>
);

export default function FarmerMultiStepModal({
  open,
  onCancel,
  onSubmit,
  editingFarmer,
}) {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const values = Form.useWatch([], form) || {};

  const dateOfBirth = Form.useWatch('date_of_birth', form);
  const accessToMobile = Form.useWatch('access_to_mobile_phone', form);
  const isCoopMember = Form.useWatch('is_cooperative_member', form);
  const hasDisability = Form.useWatch('has_disability', form);
  const hasLand = Form.useWatch('has_land', form);
  const hasIrrigation = Form.useWatch('has_irrigation', form);
  const usesMechanization = Form.useWatch('uses_mechanization', form);
  const belongsToGroup = Form.useWatch('belongs_to_farmer_group', form);
  const hasLivestock = Form.useWatch('has_livestock', form);
  const hasHorticulture = Form.useWatch('has_horticulture', form);
  const hasFinancialAccess = Form.useWatch('has_financial_access', form);
  const hasCredit = Form.useWatch('has_credit', form);
  const hasInsurance = Form.useWatch('has_agricultural_insurance', form);
  const psnpBeneficiary = Form.useWatch('psnp_beneficiary', form);
  const hasTraining = Form.useWatch('has_agricultural_training', form);
  const nutritionParticipant = Form.useWatch('nutrition_program_participant', form);

  const calculatedAge = useMemo(() => {
    if (!dateOfBirth) return null;

    const dob = dayjs.isDayjs(dateOfBirth)
      ? dateOfBirth
      : dayjs(dateOfBirth);

    if (!dob.isValid()) return null;

    return dayjs().diff(dob, 'year');
  }, [dateOfBirth]);

  const isYouthCalculated =
    calculatedAge !== null &&
    calculatedAge >= 18 &&
    calculatedAge <= 29;

  const isMinor =
    calculatedAge !== null &&
    calculatedAge < 18;

  useEffect(() => {
    if (!open) return;

    setCurrentStep(0);

    if (editingFarmer) {
      const data = {
        ...editingFarmer,

        date_of_birth: editingFarmer.date_of_birth
          ? dayjs(editingFarmer.date_of_birth)
          : undefined,

        registration_date: editingFarmer.registration_date
          ? dayjs(editingFarmer.registration_date)
          : dayjs(),

        access_to_mobile_phone: Boolean(
          editingFarmer.access_to_mobile_phone ||
            editingFarmer.phone_number
        ),

        is_cooperative_member: Boolean(
          editingFarmer.is_cooperative_member ||
            editingFarmer.cooperative
        ),

        has_disability: Boolean(
          editingFarmer.has_disability ||
            editingFarmer.disability_type
        ),

        farmer_categories:
          editingFarmer.farmer_categories ||
          (editingFarmer.farmer_type
            ? [editingFarmer.farmer_type]
            : ['Regular Smallholder']),

        farmer_group_types:
          editingFarmer.farmer_group_types || [],

        primary_crops:
          editingFarmer.primary_crops || [],

        livestock:
          editingFarmer.livestock || {
            cattle_total: 0,
            sheep_total: 0,
            goat_total: 0,
            camel_total: 0,
            horse_total: 0,
            donkey_total: 0,
            mule_total: 0,
            poultry_total: 0,
            bee_colonies: 0,
          },

        has_land:
          editingFarmer.has_land !== undefined
            ? editingFarmer.has_land
            : true,

        has_irrigation: Boolean(editingFarmer.has_irrigation),

        uses_mechanization: Boolean(
          editingFarmer.uses_mechanization
        ),

        belongs_to_farmer_group: Boolean(
          editingFarmer.belongs_to_farmer_group
        ),

        has_livestock: Boolean(
          editingFarmer.has_livestock
        ),

        has_horticulture: Boolean(
          editingFarmer.has_horticulture
        ),

        has_financial_access: Boolean(
          editingFarmer.has_financial_access
        ),

        has_credit: Boolean(editingFarmer.has_credit),

        has_agricultural_insurance: Boolean(
          editingFarmer.has_agricultural_insurance
        ),

        psnp_beneficiary: Boolean(
          editingFarmer.psnp_beneficiary
        ),

        has_agricultural_training: Boolean(
          editingFarmer.has_agricultural_training
        ),

        nutrition_program_participant: Boolean(
          editingFarmer.nutrition_program_participant
        ),
      };

      form.setFieldsValue(data);
    } else {
      form.resetFields();

      form.setFieldsValue({
        gender: 'Male',
        marital_status: 'Married',
        household_role: 'Household Head',

        registration_date: dayjs(),

        farmer_categories: ['Regular Smallholder'],

        preferred_language: 'Amharic',

        literacy_status: true,

        access_to_mobile_phone: false,
        sms_enabled: false,

        is_cooperative_member: false,
        has_disability: false,

        has_land: true,

        primary_livelihood: 'Crop Production',
        secondary_livelihood: 'Livestock',

        has_irrigation: false,
        uses_mechanization: false,

        belongs_to_farmer_group: false,

        has_livestock: true,
        has_horticulture: false,

        has_financial_access: false,
        has_credit: false,
        has_agricultural_insurance: false,

        psnp_beneficiary: false,

        has_agricultural_training: false,
        nutrition_program_participant: false,

        primary_crops: [],

        livestock: {
          cattle_total: 0,
          sheep_total: 0,
          goat_total: 0,
          camel_total: 0,
          horse_total: 0,
          donkey_total: 0,
          mule_total: 0,
          poultry_total: 0,
          bee_colonies: 0,
        },

        household_size: 1,
        male_members: 1,
        female_members: 0,
        children_count: 0,
        youth_members: 0,
        elderly_members: 0,
        disabled_members: 0,

        total_land_area: 0,
        cultivated_land_area: 0,
        irrigated_land_area: 0,
        rainfed_land_area: 0,
      });
    }
  }, [open, editingFarmer, form]);

  /*
   * Keep calculated classification synchronized.
   *
   * Youth is based on Date of Birth rather than a manually entered age.
   */
  useEffect(() => {
    if (!open || calculatedAge === null) return;

    const categories = form.getFieldValue('farmer_categories') || [];

    const withoutYouth = categories.filter(
      (item) => item !== 'Youth Farmer'
    );

    if (isYouthCalculated) {
      if (!categories.includes('Youth Farmer')) {
        form.setFieldsValue({
          farmer_categories: [...withoutYouth, 'Youth Farmer'],
        });
      }
    } else if (categories.includes('Youth Farmer')) {
      form.setFieldsValue({
        farmer_categories: withoutYouth,
      });
    }
  }, [calculatedAge, isYouthCalculated, open, form]);

  const stepKeys = [
    [
      'full_name',
      'gender',
      'date_of_birth',
      'id_type',
      'national_id',
      'registration_date',
      'region_id',
      'woreda_id',
      'kebele_id',
    ],

    [
      'household_role',
      'marital_status',
      'education_level',
      'primary_livelihood',
      'farmer_categories',
    ],

    [
      'has_land',
      'total_land_area',
      'land_tenure_type',
      'production_system',
    ],

    [
      'primary_crops',
      'has_livestock',
      'has_irrigation',
      'has_horticulture',
    ],

    [
      'access_to_mobile_phone',
      'is_cooperative_member',
      'has_disability',
      'belongs_to_farmer_group',
    ],

    [
      'has_financial_access',
      'has_credit',
      'has_agricultural_insurance',
      'psnp_beneficiary',
      'has_agricultural_training',
    ],

    [
      'verification_status',
      'data_quality_status',
    ],
  ];

  const next = async () => {
    try {
      await form.validateFields(stepKeys[currentStep]);
      setCurrentStep((prev) => prev + 1);
    } catch (error) {
      // Ant Design displays validation messages.
    }
  };

  const prev = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const cleanValues = (rawValues) => {
    const values = { ...rawValues };

    /*
     * Convert Ant Design date objects to API-compatible strings.
     */
    [
      'date_of_birth',
      'registration_date',
      'membership_date',
      'last_extension_visit',
      'next_followup_date',
      'training_date',
      'recognition_date',
      'graduation_date',
    ].forEach((field) => {
      if (values[field] && dayjs.isDayjs(values[field])) {
        values[field] = values[field].format('YYYY-MM-DD');
      }
    });

    /*
     * Preserve location data required by the API.
     * LocationScopeSelector may provide helper values in addition
     * to the actual hierarchy IDs.
     */
    delete values.location_scope;

    /*
     * Age is derived from date_of_birth.
     */
    if (values.date_of_birth) {
      values.age = dayjs().diff(
        dayjs(values.date_of_birth),
        'year'
      );
    }

    values.is_youth =
      values.age >= 18 &&
      values.age <= 29;

    /*
     * Dependent-field cleanup.
     */
    if (!values.access_to_mobile_phone) {
      values.phone_number = null;
      values.sms_enabled = false;
      values.preferred_contact_method = null;
    }

    if (!values.is_cooperative_member) {
      values.cooperative_id = null;
      values.cooperative_name = null;
      values.membership_number = null;
      values.membership_date = null;
      values.cooperative_role = null;
      values.union_id = null;
    }

    if (!values.has_disability) {
      values.disability_type = null;
      values.disability_other = null;
    }

    if (!values.has_land) {
      values.total_land_area = 0;
      values.cultivated_land_area = 0;
      values.irrigated_land_area = 0;
      values.rainfed_land_area = 0;
      values.land_tenure_type = null;
      values.land_certificate_number = null;
    }

    if (!values.has_irrigation) {
      values.irrigation_source = null;
      values.irrigation_method = null;
      values.irrigated_land_area = 0;
      values.potential_irrigable_area = 0;
      values.currently_utilized_irrigated_area = 0;
      values.water_user_association_id = null;
    }

    if (!values.uses_mechanization) {
      values.mechanization_access_type = null;
      values.machinery_types = [];
      values.mechanization_service_provider = null;
    }

    if (!values.belongs_to_farmer_group) {
      values.farmer_group_types = [];
      values.farmer_group_id = null;
      values.ffs_group_id = null;
      values.cluster_id = null;
      values.commodity_group_id = null;
    }

    if (!values.has_livestock) {
      values.livestock = null;
    }

    if (!values.has_horticulture) {
      values.horticulture_type = null;
      values.horticulture_area = 0;
      values.greenhouse_used = false;
      values.nursery_used = false;
    }

    if (!values.has_financial_access) {
      values.bank_account = false;
      values.mobile_money = false;
      values.microfinance_member = false;
    }

    if (!values.has_credit) {
      values.credit_provider = null;
      values.credit_status = null;
      values.loan_amount = null;
      values.loan_purpose = null;
    }

    if (!values.has_agricultural_insurance) {
      values.insurance_provider = null;
      values.insurance_type = null;
    }

    if (!values.psnp_beneficiary) {
      values.psnp_program = null;
      values.psnp_category = null;
      values.graduation_status = null;
    }

    if (!values.has_agricultural_training) {
      values.training_topics = [];
      values.training_provider = null;
      values.training_date = null;
    }

    if (!values.nutrition_program_participant) {
      values.nutrition_program = null;
    }

    return values;
  };

  const handleFinish = async () => {
    try {
      setSaving(true);

      const rawValues = await form.validateFields();
      const values = cleanValues(rawValues);

      await onSubmit(values);

      message.success(
        editingFarmer
          ? 'Farmer profile updated successfully.'
          : 'Farmer registered successfully.'
      );
    } catch (error) {
      console.error(
        'IAIMS Farmer registration validation error:',
        error
      );
    } finally {
      setSaving(false);
    }
  };

  const renderStep1 = () => (
    <div>
      <SectionCard
        icon={<UserOutlined />}
        title="Personal Identification"
        description="Core farmer identity and government identification"
      >
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="full_name"
              label={<FieldLabel>Full Name</FieldLabel>}
              rules={[
                {
                  required: true,
                  message: 'Official full name is required',
                },
              ]}
            >
              <Input
                placeholder="Full name with grandfather name"
                prefix={
                  <UserOutlined style={{ color: '#aaa' }} />
                }
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="father_name"
              label={<FieldLabel>Father's Name</FieldLabel>}
            >
              <Input placeholder="Father's name" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="grandfather_name"
              label={<FieldLabel>Grandfather's Name</FieldLabel>}
            >
              <Input placeholder="Grandfather's name" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="id_type"
              label={<FieldLabel>ID Type</FieldLabel>}
              rules={[
                {
                  required: true,
                  message: 'Select identification type',
                },
              ]}
            >
              <Select
                options={idTypeOptions}
                placeholder="Select ID type"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="national_id"
              label={
                <FieldLabel info="Fayda, National ID, Kebele ID or other government identification number.">
                  National ID / Fayda No.
                </FieldLabel>
              }
              rules={[
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const type = getFieldValue('id_type');

                    if (type === 'No Formal ID') {
                      return Promise.resolve();
                    }

                    if (!value) {
                      return Promise.reject(
                        new Error(
                          'Identification number is required'
                        )
                      );
                    }

                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <Input
                placeholder="e.g. Fayda / Kebele identification number"
                prefix={<IdcardOutlined />}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="alternative_id"
              label={<FieldLabel>Alternative ID</FieldLabel>}
            >
              <Input placeholder="Optional alternative identification number" />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              name="gender"
              label={<FieldLabel>Gender</FieldLabel>}
              rules={[{ required: true }]}
            >
              <Select options={genderOptions} />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              name="date_of_birth"
              label={
                <FieldLabel info="Age is calculated automatically from date of birth.">
                  Date of Birth
                </FieldLabel>
              }
              rules={[
                {
                  required: true,
                  message: 'Date of birth is required',
                },
              ]}
            >
              <DatePicker
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <div
              style={{
                height: '100%',
                minHeight: 56,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {calculatedAge !== null && (
                <Space>
                  <Tag color="blue">
                    Age: {calculatedAge}
                  </Tag>

                  {isYouthCalculated && (
                    <Tag
                      color="orange"
                      icon={<CheckCircleFilled />}
                    >
                      Youth Farmer
                    </Tag>
                  )}

                  {isMinor && (
                    <Tag color="red">
                      Below agricultural adult registration age
                    </Tag>
                  )}
                </Space>
              )}
            </div>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="photo"
              label={<FieldLabel>Farmer Photo</FieldLabel>}
            >
              <Upload
                maxCount={1}
                listType="picture"
                beforeUpload={() => false}
              >
                <Button icon={<CameraOutlined />}>
                  Select Farmer Photo
                </Button>
              </Upload>
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="registration_date"
              label={<FieldLabel>Registration Date</FieldLabel>}
              rules={[{ required: true }]}
            >
              <DatePicker
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
              />
            </Form.Item>
          </Col>
        </Row>
      </SectionCard>

      <SectionCard
        icon={<EnvironmentOutlined />}
        title="Administrative Location"
        description="IAIMS administrative hierarchy and farmer service location"
      >
        <LocationScopeSelector
          form={form}
          editingData={editingFarmer}
        />

        <Divider />

        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item
              name="village_id"
              label={<FieldLabel>Village</FieldLabel>}
            >
              <Input placeholder="Village ID / name" />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              name="development_agent_id"
              label={
                <FieldLabel>
                  Development Agent
                </FieldLabel>
              }
            >
              <Select
                showSearch
                placeholder="Select DA"
                options={[]}
                notFoundContent="Load from IAIMS"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              name="farmer_station_id"
              label={<FieldLabel>Farmer Station / FTC</FieldLabel>}
            >
              <Input placeholder="FTC / station ID" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="latitude"
              label={<FieldLabel>GPS Latitude</FieldLabel>}
            >
              <InputNumber
                style={{ width: '100%' }}
                precision={7}
                placeholder="e.g. 11.5890"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="longitude"
              label={<FieldLabel>GPS Longitude</FieldLabel>}
            >
              <InputNumber
                style={{ width: '100%' }}
                precision={7}
                placeholder="e.g. 37.3908"
              />
            </Form.Item>
          </Col>
        </Row>
      </SectionCard>
    </div>
  );

  const renderStep2 = () => (
    <div>
      <SectionCard
        icon={<HomeOutlined />}
        title="Household & Demographics"
        description="Household structure and farmer demographic classification"
      >
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item
              name="household_id"
              label={<FieldLabel>Household ID</FieldLabel>}
            >
              <Input placeholder="Existing household ID if available" />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              name="household_role"
              label={<FieldLabel>Household Role</FieldLabel>}
              rules={[{ required: true }]}
            >
              <Select options={headRoleOptions} />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              name="marital_status"
              label={<FieldLabel>Marital Status</FieldLabel>}
              rules={[{ required: true }]}
            >
              <Select options={maritalOptions} />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              name="household_size"
              label={<FieldLabel>Household Size</FieldLabel>}
            >
              <InputNumber
                min={1}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              name="male_members"
              label={<FieldLabel>Male Members</FieldLabel>}
            >
              <InputNumber
                min={0}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              name="female_members"
              label={<FieldLabel>Female Members</FieldLabel>}
            >
              <InputNumber
                min={0}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              name="children_count"
              label={<FieldLabel>Children</FieldLabel>}
            >
              <InputNumber
                min={0}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              name="youth_members"
              label={<FieldLabel>Youth Members</FieldLabel>}
            >
              <InputNumber
                min={0}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              name="elderly_members"
              label={<FieldLabel>Elderly Members</FieldLabel>}
            >
              <InputNumber
                min={0}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
        </Row>
      </SectionCard>

      <SectionCard
        icon={<BookOutlined />}
        title="Education & Social Classification"
      >
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item
              name="education_level"
              label={<FieldLabel>Education Level</FieldLabel>}
              rules={[{ required: true }]}
            >
              <Select options={educationOptions} />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              name="literacy_status"
              label={<FieldLabel>Can Read & Write</FieldLabel>}
              valuePropName="checked"
            >
              <Switch
                checkedChildren="Yes"
                unCheckedChildren="No"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              name="digital_literacy"
              label={<FieldLabel>Digital Literacy</FieldLabel>}
            >
              <Select
                options={[
                  option('None', 'None'),
                  option('Basic', 'Basic'),
                  option('Intermediate', 'Intermediate'),
                  option('Advanced', 'Advanced'),
                ]}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              name="preferred_language"
              label={<FieldLabel>Preferred Language</FieldLabel>}
            >
              <Select
                options={[
                  option('Amharic', 'Amharic'),
                  option('Afaan Oromo', 'Afaan Oromo'),
                  option('Tigrinya', 'Tigrinya'),
                  option('Somali', 'Somali'),
                  option('Afar', 'Afar'),
                  option('English', 'English'),
                  option('Other', 'Other'),
                ]}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              name="primary_livelihood"
              label={<FieldLabel>Primary Livelihood</FieldLabel>}
              rules={[{ required: true }]}
            >
              <Select options={primaryLivelihoodOptions} />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              name="secondary_livelihood"
              label={<FieldLabel>Secondary Livelihood</FieldLabel>}
            >
              <Select
                allowClear
                options={primaryLivelihoodOptions}
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              name="farmer_categories"
              label={
                <FieldLabel info="A farmer can belong to multiple classifications simultaneously.">
                  Farmer Categories
                </FieldLabel>
              }
              rules={[
                {
                  required: true,
                  message: 'Select at least one farmer category',
                },
              ]}
            >
              <Select
                mode="multiple"
                options={farmerCategoryOptions}
                placeholder="Select all applicable categories"
                optionFilterProp="label"
              />
            </Form.Item>
          </Col>
        </Row>
      </SectionCard>

      <SectionCard
        icon={<SafetyCertificateOutlined />}
        title="Vulnerability & Inclusion"
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item
              name="vulnerability_category"
              label={<FieldLabel>Vulnerability Category</FieldLabel>}
            >
              <Select options={vulnerabilityOptions} />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <SwitchBox
              name="has_disability"
              title="Person with Disability"
              description="Requires accessible or assisted extension services"
              checked={hasDisability}
              onColor="#fff0f6"
            />
          </Col>

          {hasDisability && (
            <>
              <Col xs={24} md={12}>
                <Form.Item
                  name="disability_type"
                  label={
                    <FieldLabel>
                      Disability Type
                    </FieldLabel>
                  }
                  rules={[
                    {
                      required: true,
                      message: 'Select disability type',
                    },
                  ]}
                >
                  <Select options={disabilityOptions} />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="disability_other"
                  label={<FieldLabel>Other Accessibility Need</FieldLabel>}
                >
                  <Input placeholder="Specify if applicable" />
                </Form.Item>
              </Col>
            </>
          )}
        </Row>
      </SectionCard>
    </div>
  );

  const renderStep3 = () => (
    <div>
      <SectionCard
        icon={<ApartmentOutlined />}
        title="Farm & Land Profile"
        description="High-level farm and landholding information"
      >
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <SwitchBox
              name="has_land"
              title="Has Agricultural Land"
              description="Farmer owns, rents, leases or otherwise uses agricultural land"
              checked={hasLand}
            />
          </Col>

          {hasLand && (
            <>
              <Col xs={24} md={8}>
                <Form.Item
                  name="total_land_area"
                  label={
                    <FieldLabel>
                      Total Land Area (ha)
                    </FieldLabel>
                  }
                  rules={[
                    {
                      required: true,
                      message: 'Land area is required',
                    },
                  ]}
                >
                  <InputNumber
                    min={0}
                    precision={4}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name="cultivated_land_area"
                  label={
                    <FieldLabel>
                      Cultivated Area (ha)
                    </FieldLabel>
                  }
                >
                  <InputNumber
                    min={0}
                    precision={4}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name="land_tenure_type"
                  label={<FieldLabel>Primary Land Tenure</FieldLabel>}
                  rules={[{ required: true }]}
                >
                  <Select options={landTenureOptions} />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="land_certificate_number"
                  label={
                    <FieldLabel>
                      Land Certificate / Holding No.
                    </FieldLabel>
                  }
                >
                  <Input placeholder="Land certificate or holding number" />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="production_system"
                  label={<FieldLabel>Production System</FieldLabel>}
                  rules={[{ required: true }]}
                >
                  <Select options={productionSystemOptions} />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="total_farm_area"
                  label={<FieldLabel>Total Farm Area (ha)</FieldLabel>}
                >
                  <InputNumber
                    min={0}
                    precision={4}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="rainfed_land_area"
                  label={<FieldLabel>Rainfed Area (ha)</FieldLabel>}
                >
                  <InputNumber
                    min={0}
                    precision={4}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
            </>
          )}
        </Row>

        {hasLand && (
          <Alert
            style={{ marginTop: 8 }}
            type="info"
            showIcon
            message="Parcel-level land records"
            description="Individual parcels, GPS boundaries, soil characteristics and seasonal land use should be managed from the Farmer Profile after registration."
          />
        )}
      </SectionCard>

      <SectionCard
        icon={<ExperimentOutlined />}
        title="Natural Resources & Climate"
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Form.Item
              name="soil_conservation"
              label={<FieldLabel>Soil Conservation</FieldLabel>}
            >
              <Select
                options={[
                  option('Yes', 'Practices Soil Conservation'),
                  option('No', 'No'),
                  option('Unknown', 'Not Assessed'),
                ]}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              name="agroforestry"
              label={<FieldLabel>Agroforestry</FieldLabel>}
            >
              <Select
                options={[
                  option('Yes', 'Yes'),
                  option('No', 'No'),
                  option('Unknown', 'Not Assessed'),
                ]}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              name="watershed_participation"
              label={<FieldLabel>Watershed Participation</FieldLabel>}
            >
              <Switch
                checkedChildren="Yes"
                unCheckedChildren="No"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              name="tree_planting"
              label={<FieldLabel>Tree Planting</FieldLabel>}
            >
              <Switch
                checkedChildren="Yes"
                unCheckedChildren="No"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              name="climate_smart_practice"
              label={<FieldLabel>Climate-Smart Agriculture</FieldLabel>}
            >
              <Switch
                checkedChildren="Yes"
                unCheckedChildren="No"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              name="drought_exposure"
              label={<FieldLabel>Drought Exposure</FieldLabel>}
            >
              <Switch
                checkedChildren="Yes"
                unCheckedChildren="No"
              />
            </Form.Item>
          </Col>
        </Row>
      </SectionCard>

      <SectionCard
        icon={<EnvironmentOutlined />}
        title="Irrigation"
      >
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <SwitchBox
              name="has_irrigation"
              title="Has Irrigation Access"
              description="Farmer currently has access to irrigation"
              checked={hasIrrigation}
            />
          </Col>

          {hasIrrigation && (
            <>
              <Col xs={24} md={8}>
                <Form.Item
                  name="irrigation_source"
                  label={<FieldLabel>Water Source</FieldLabel>}
                >
                  <Select options={irrigationSourceOptions} />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name="irrigation_method"
                  label={<FieldLabel>Irrigation Method</FieldLabel>}
                >
                  <Select options={irrigationMethodOptions} />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name="irrigated_land_area"
                  label={<FieldLabel>Irrigated Area (ha)</FieldLabel>}
                >
                  <InputNumber
                    min={0}
                    precision={4}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="potential_irrigable_area"
                  label={
                    <FieldLabel>
                      Potential Irrigable Area (ha)
                    </FieldLabel>
                  }
                >
                  <InputNumber
                    min={0}
                    precision={4}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="currently_utilized_irrigated_area"
                  label={
                    <FieldLabel>
                      Currently Utilized Area (ha)
                    </FieldLabel>
                  }
                >
                  <InputNumber
                    min={0}
                    precision={4}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="irrigation_scheme_id"
                  label={<FieldLabel>Irrigation Scheme</FieldLabel>}
                >
                  <Input placeholder="Scheme ID / name" />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="water_user_association_id"
                  label={
                    <FieldLabel>
                      Water User Association
                    </FieldLabel>
                  }
                >
                  <Input placeholder="WUA ID / name" />
                </Form.Item>
              </Col>
            </>
          )}
        </Row>
      </SectionCard>

      <SectionCard
        icon={<CarOutlined />}
        title="Mechanization"
      >
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <SwitchBox
              name="uses_mechanization"
              title="Uses Agricultural Mechanization"
              description="Owns machinery or accesses mechanization services"
              checked={usesMechanization}
            />
          </Col>

          {usesMechanization && (
            <>
              <Col xs={24} md={12}>
                <Form.Item
                  name="mechanization_access_type"
                  label={
                    <FieldLabel>
                      Access Type
                    </FieldLabel>
                  }
                >
                  <Select
                    options={[
                      option('Own', 'Own Machinery'),
                      option('Rented', 'Rented'),
                      option('Service Provider', 'Service Provider'),
                      option('Cooperative', 'Cooperative'),
                      option('Mixed', 'Multiple Sources'),
                    ]}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="machinery_types"
                  label={<FieldLabel>Machinery Used</FieldLabel>}
                >
                  <Select
                    mode="multiple"
                    options={machineryOptions}
                    placeholder="Select machinery"
                  />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  name="mechanization_service_provider"
                  label={
                    <FieldLabel>
                      Service Provider
                    </FieldLabel>
                  }
                >
                  <Input placeholder="Provider / cooperative / contractor" />
                </Form.Item>
              </Col>
            </>
          )}
        </Row>
      </SectionCard>
    </div>
  );

  const renderStep4 = () => (
    <div>
      <SectionCard
        icon={<AppstoreOutlined />}
        title="Crop Production Profile"
        description="Baseline crop portfolio; seasonal production records belong in Crop Production"
      >
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="primary_crops"
              label={
                <FieldLabel info="This is the farmer's crop portfolio. Seasonal area, input, yield and harvest data should be stored separately.">
                  Primary Crops / Commodities
                </FieldLabel>
              }
            >
              <Select
                mode="tags"
                options={cropOptions}
                placeholder="Select or type crops"
                tokenSeparators={[',']}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              name="seed_source"
              label={<FieldLabel>Primary Seed Source</FieldLabel>}
            >
              <Select
                options={[
                  option('Own Production', 'Own Production'),
                  option('Cooperative', 'Cooperative'),
                  option('Union', 'Union'),
                  option('Private Supplier', 'Private Supplier'),
                  option('Government', 'Government'),
                  option('Other', 'Other'),
                ]}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              name="fertilizer_access"
              label={<FieldLabel>Fertilizer Access</FieldLabel>}
            >
              <Switch
                checkedChildren="Yes"
                unCheckedChildren="No"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              name="improved_seed_use"
              label={<FieldLabel>Uses Improved Seed</FieldLabel>}
            >
              <Switch
                checkedChildren="Yes"
                unCheckedChildren="No"
              />
            </Form.Item>
          </Col>
        </Row>

        <Alert
          type="info"
          showIcon
          message="Seasonal production is not stored here"
          description="Area planted, variety, seed quantity, fertilizer quantity, pesticide use, harvest quantity, yield and production year should be recorded in the Crop Production module and linked to the farmer and land parcel."
        />
      </SectionCard>

      <SectionCard
        icon={<ClusterOutlined />}
        title="Livestock Profile"
      >
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <SwitchBox
              name="has_livestock"
              title="Keeps Livestock"
              description="Farmer maintains livestock or poultry"
              checked={hasLivestock}
            />
          </Col>

          {hasLivestock && (
            <>
              <Col xs={12} md={6}>
                <Form.Item
                  name={['livestock', 'cattle_total']}
                  label={<FieldLabel>Cattle</FieldLabel>}
                >
                  <InputNumber
                    min={0}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>

              <Col xs={12} md={6}>
                <Form.Item
                  name={['livestock', 'sheep_total']}
                  label={<FieldLabel>Sheep</FieldLabel>}
                >
                  <InputNumber
                    min={0}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>

              <Col xs={12} md={6}>
                <Form.Item
                  name={['livestock', 'goat_total']}
                  label={<FieldLabel>Goats</FieldLabel>}
                >
                  <InputNumber
                    min={0}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>

              <Col xs={12} md={6}>
                <Form.Item
                  name={['livestock', 'camel_total']}
                  label={<FieldLabel>Camels</FieldLabel>}
                >
                  <InputNumber
                    min={0}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>

              <Col xs={12} md={6}>
                <Form.Item
                  name={['livestock', 'horse_total']}
                  label={<FieldLabel>Horses</FieldLabel>}
                >
                  <InputNumber
                    min={0}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>

              <Col xs={12} md={6}>
                <Form.Item
                  name={['livestock', 'donkey_total']}
                  label={<FieldLabel>Donkeys</FieldLabel>}
                >
                  <InputNumber
                    min={0}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>

              <Col xs={12} md={6}>
                <Form.Item
                  name={['livestock', 'mule_total']}
                  label={<FieldLabel>Mules</FieldLabel>}
                >
                  <InputNumber
                    min={0}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>

              <Col xs={12} md={6}>
                <Form.Item
                  name={['livestock', 'poultry_total']}
                  label={<FieldLabel>Poultry</FieldLabel>}
                >
                  <InputNumber
                    min={0}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>

              <Col xs={12} md={6}>
                <Form.Item
                  name={['livestock', 'bee_colonies']}
                  label={<FieldLabel>Bee Colonies</FieldLabel>}
                >
                  <InputNumber
                    min={0}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
            </>
          )}
        </Row>
      </SectionCard>

      <SectionCard
        icon={<TagsOutlined />}
        title="Horticulture"
      >
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <SwitchBox
              name="has_horticulture"
              title="Horticulture Farmer"
              description="Produces fruits, vegetables or other horticultural commodities"
              checked={hasHorticulture}
            />
          </Col>

          {hasHorticulture && (
            <>
              <Col xs={24} md={8}>
                <Form.Item
                  name="horticulture_type"
                  label={<FieldLabel>Horticulture Type</FieldLabel>}
                >
                  <Select
                    mode="multiple"
                    options={[
                      option('Vegetables', 'Vegetables'),
                      option('Fruits', 'Fruits'),
                      option('Flowers', 'Flowers'),
                      option('Seedlings/Nursery', 'Seedlings / Nursery'),
                      option('Spices', 'Spices'),
                      option('Other', 'Other'),
                    ]}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name="horticulture_area"
                  label={<FieldLabel>Horticulture Area (ha)</FieldLabel>}
                >
                  <InputNumber
                    min={0}
                    precision={4}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name="market_destination"
                  label={<FieldLabel>Primary Market Destination</FieldLabel>}
                >
                  <Select
                    options={[
                      option('Local Market', 'Local Market'),
                      option('Woreda Market', 'Woreda Market'),
                      option('Regional Market', 'Regional Market'),
                      option('Processor', 'Processor'),
                      option('Cooperative', 'Cooperative'),
                      option('Exporter', 'Exporter'),
                      option('Direct Consumer', 'Direct Consumer'),
                    ]}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <SwitchBox
                  name="greenhouse_used"
                  title="Uses Greenhouse"
                  description="Protected horticulture production"
                  checked={values.greenhouse_used}
                />
              </Col>

              <Col xs={24} md={12}>
                <SwitchBox
                  name="nursery_used"
                  title="Uses Nursery"
                  description="Produces or uses seedlings"
                  checked={values.nursery_used}
                />
              </Col>
            </>
          )}
        </Row>
      </SectionCard>
    </div>
  );

  const renderStep5 = () => (
    <div>
      <SectionCard
        icon={<PhoneOutlined />}
        title="Contact & Digital Connectivity"
      >
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <SwitchBox
              name="access_to_mobile_phone"
              title="Mobile Phone Access"
              description="Enables SMS, 8028 advisory and digital agricultural services"
              checked={accessToMobile}
            />
          </Col>

          {accessToMobile && (
            <>
              <Col xs={24} md={12}>
                <Form.Item
                  name="phone_number"
                  label={
                    <FieldLabel>
                      Direct Mobile Number
                    </FieldLabel>
                  }
                  rules={[
                    {
                      required: true,
                      message: 'Mobile number is required',
                    },
                  ]}
                >
                  <Input
                    placeholder="+251 9XX XXX XXX"
                    prefix={<PhoneOutlined />}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="alternative_phone"
                  label={<FieldLabel>Alternative Phone</FieldLabel>}
                >
                  <Input placeholder="Alternative contact number" />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name="sms_enabled"
                  label={<FieldLabel>SMS Advisory Enabled</FieldLabel>}
                  valuePropName="checked"
                >
                  <Switch
                    checkedChildren="Yes"
                    unCheckedChildren="No"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name="preferred_contact_method"
                  label={
                    <FieldLabel>
                      Preferred Contact
                    </FieldLabel>
                  }
                >
                  <Select options={contactMethodOptions} />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name="email"
                  label={<FieldLabel>Email</FieldLabel>}
                >
                  <Input placeholder="farmer@example.com" />
                </Form.Item>
              </Col>
            </>
          )}
        </Row>
      </SectionCard>

      <SectionCard
        icon={<TeamOutlined />}
        title="Cooperative & Farmer Organizations"
      >
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <SwitchBox
              name="is_cooperative_member"
              title="Cooperative Member"
              description="Member of a primary cooperative, union or agricultural organization"
              checked={isCoopMember}
            />
          </Col>

          {isCoopMember && (
            <>
              <Col xs={24} md={8}>
                <Form.Item
                  name="cooperative_id"
                  label={<FieldLabel>Cooperative ID</FieldLabel>}
                >
                  <Input placeholder="Cooperative ID" />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name="cooperative_name"
                  label={<FieldLabel>Cooperative Name</FieldLabel>}
                >
                  <Input placeholder="Cooperative name" />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name="membership_number"
                  label={<FieldLabel>Membership Number</FieldLabel>}
                >
                  <Input placeholder="Membership number" />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name="membership_date"
                  label={<FieldLabel>Membership Date</FieldLabel>}
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name="cooperative_role"
                  label={<FieldLabel>Cooperative Role</FieldLabel>}
                >
                  <Select options={cooperativeRoleOptions} />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name="union_id"
                  label={<FieldLabel>Union</FieldLabel>}
                >
                  <Input placeholder="Union ID / name" />
                </Form.Item>
              </Col>
            </>
          )}

          <Col span={24}>
            <Divider />
          </Col>

          <Col span={24}>
            <SwitchBox
              name="belongs_to_farmer_group"
              title="Belongs to Farmer Group"
              description="FFS, cluster, commodity group, youth group or other organized farmer group"
              checked={belongsToGroup}
              onColor="#e6f7ff"
            />
          </Col>

          {belongsToGroup && (
            <>
              <Col span={24}>
                <Form.Item
                  name="farmer_group_types"
                  label={<FieldLabel>Organization Types</FieldLabel>}
                >
                  <Select
                    mode="multiple"
                    options={farmerGroupOptions}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name="farmer_group_id"
                  label={<FieldLabel>Farmer Group</FieldLabel>}
                >
                  <Input placeholder="Group ID / name" />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name="ffs_group_id"
                  label={<FieldLabel>FFS Group</FieldLabel>}
                >
                  <Input placeholder="FFS group ID" />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name="cluster_id"
                  label={<FieldLabel>Cluster</FieldLabel>}
                >
                  <Input placeholder="Cluster ID" />
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Form.Item
                  name="commodity_group_id"
                  label={<FieldLabel>Commodity Group</FieldLabel>}
                >
                  <Input placeholder="Commodity group ID" />
                </Form.Item>
              </Col>
            </>
          )}
        </Row>
      </SectionCard>

      <SectionCard
        icon={<MedicineBoxOutlined />}
        title="Extension & Training"
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item
              name="extension_package"
              label={<FieldLabel>Extension Package</FieldLabel>}
            >
              <Select
                mode="multiple"
                options={[
                  option('Crop Production', 'Crop Production'),
                  option('Livestock', 'Livestock'),
                  option('Horticulture', 'Horticulture'),
                  option('Irrigation', 'Irrigation'),
                  option('Mechanization', 'Mechanization'),
                  option('Agribusiness', 'Agribusiness'),
                  option('Post-Harvest', 'Post-Harvest'),
                  option('Climate Smart Agriculture', 'Climate Smart Agriculture'),
                  option('Digital Advisory', 'Digital Advisory'),
                ]}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="service_frequency"
              label={<FieldLabel>Extension Service Frequency</FieldLabel>}
            >
              <Select
                options={[
                  option('Weekly', 'Weekly'),
                  option('Biweekly', 'Biweekly'),
                  option('Monthly', 'Monthly'),
                  option('Quarterly', 'Quarterly'),
                  option('As Needed', 'As Needed'),
                  option('Not Assessed', 'Not Assessed'),
                ]}
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <SwitchBox
              name="has_agricultural_training"
              title="Received Agricultural Training"
              description="Farmer has attended agricultural training, field days or demonstrations"
              checked={hasTraining}
            />
          </Col>

          {hasTraining && (
            <>
              <Col xs={24} md={8}>
                <Form.Item
                  name="training_topics"
                  label={<FieldLabel>Training Topics</FieldLabel>}
                >
                  <Select
                    mode="multiple"
                    options={[
                      option('Crop Production', 'Crop Production'),
                      option('Livestock', 'Livestock'),
                      option('Horticulture', 'Horticulture'),
                      option('Irrigation', 'Irrigation'),
                      option('Post-Harvest', 'Post-Harvest'),
                      option('Market Linkage', 'Market Linkage'),
                      option('Climate Smart Agriculture', 'Climate Smart Agriculture'),
                      option('Digital Agriculture', 'Digital Agriculture'),
                    ]}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name="training_provider"
                  label={<FieldLabel>Training Provider</FieldLabel>}
                >
                  <Input placeholder="Organization / FTC / DA" />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name="training_date"
                  label={<FieldLabel>Most Recent Training</FieldLabel>}
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                  />
                </Form.Item>
              </Col>
            </>
          )}

          <Col xs={24} md={12}>
            <Form.Item
              name="last_extension_visit"
              label={<FieldLabel>Last Extension Visit</FieldLabel>}
            >
              <DatePicker
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="next_followup_date"
              label={<FieldLabel>Next Follow-up Date</FieldLabel>}
            >
              <DatePicker
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
              />
            </Form.Item>
          </Col>
        </Row>
      </SectionCard>
    </div>
  );

  const renderStep6 = () => (
    <div>
      <SectionCard
        icon={<BankOutlined />}
        title="Financial Access"
      >
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <SwitchBox
              name="has_financial_access"
              title="Access to Financial Services"
              description="Bank, mobile money or microfinance access"
              checked={hasFinancialAccess}
            />
          </Col>

          {hasFinancialAccess && (
            <>
              <Col xs={24} md={8}>
                <Form.Item
                  name="bank_account"
                  label={<FieldLabel>Bank Account</FieldLabel>}
                  valuePropName="checked"
                >
                  <Switch
                    checkedChildren="Yes"
                    unCheckedChildren="No"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name="mobile_money"
                  label={<FieldLabel>Mobile Money</FieldLabel>}
                  valuePropName="checked"
                >
                  <Switch
                    checkedChildren="Yes"
                    unCheckedChildren="No"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name="microfinance_member"
                  label={<FieldLabel>Microfinance Member</FieldLabel>}
                  valuePropName="checked"
                >
                  <Switch
                    checkedChildren="Yes"
                    unCheckedChildren="No"
                  />
                </Form.Item>
              </Col>
            </>
          )}
        </Row>
      </SectionCard>

      <SectionCard
        icon={<BankOutlined />}
        title="Credit & Agricultural Finance"
      >
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <SwitchBox
              name="has_credit"
              title="Has Agricultural Credit / Loan"
              description="Current or recent agricultural financing"
              checked={hasCredit}
              onColor="#e6f7ff"
            />
          </Col>

          {hasCredit && (
            <>
              <Col xs={24} md={8}>
                <Form.Item
                  name="credit_provider"
                  label={<FieldLabel>Credit Provider</FieldLabel>}
                >
                  <Input placeholder="Bank / MFI / cooperative / other" />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name="credit_status"
                  label={<FieldLabel>Credit Status</FieldLabel>}
                >
                  <Select
                    options={[
                      option('Active', 'Active'),
                      option('Repaid', 'Repaid'),
                      option('Defaulted', 'Defaulted'),
                      option('Pending', 'Pending'),
                    ]}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name="loan_amount"
                  label={<FieldLabel>Loan Amount (ETB)</FieldLabel>}
                >
                  <InputNumber
                    min={0}
                    style={{ width: '100%' }}
                    formatter={(value) =>
                      value
                        ? `${value}`.replace(
                            /\B(?=(\d{3})+(?!\d))/g,
                            ','
                          )
                        : ''
                    }
                    parser={(value) =>
                      value?.replace(/,/g, '') || ''
                    }
                  />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  name="loan_purpose"
                  label={<FieldLabel>Loan Purpose</FieldLabel>}
                >
                  <Select
                    mode="multiple"
                    options={[
                      option('Seed', 'Seed'),
                      option('Fertilizer', 'Fertilizer'),
                      option('Livestock', 'Livestock'),
                      option('Irrigation', 'Irrigation'),
                      option('Machinery', 'Machinery'),
                      option('Horticulture', 'Horticulture'),
                      option('Working Capital', 'Working Capital'),
                      option('Other', 'Other'),
                    ]}
                  />
                </Form.Item>
              </Col>
            </>
          )}
        </Row>
      </SectionCard>

      <SectionCard
        icon={<SafetyCertificateOutlined />}
        title="Agricultural Insurance"
      >
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <SwitchBox
              name="has_agricultural_insurance"
              title="Agricultural Insurance"
              description="Crop, livestock or agricultural asset insurance"
              checked={hasInsurance}
            />
          </Col>

          {hasInsurance && (
            <>
              <Col xs={24} md={12}>
                <Form.Item
                  name="insurance_provider"
                  label={<FieldLabel>Insurance Provider</FieldLabel>}
                >
                  <Input placeholder="Insurance company / provider" />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="insurance_type"
                  label={<FieldLabel>Insurance Type</FieldLabel>}
                >
                  <Select
                    options={[
                      option('Crop Insurance', 'Crop Insurance'),
                      option('Livestock Insurance', 'Livestock Insurance'),
                      option('Weather Index', 'Weather Index Insurance'),
                      option('Other', 'Other'),
                    ]}
                  />
                </Form.Item>
              </Col>
            </>
          )}
        </Row>
      </SectionCard>

      <SectionCard
        icon={<SafetyCertificateOutlined />}
        title="Social Protection"
      >
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <SwitchBox
              name="psnp_beneficiary"
              title="PSNP Beneficiary"
              description="Productive Safety Net Programme household/member"
              checked={psnpBeneficiary}
            />
          </Col>

          {psnpBeneficiary && (
            <>
              <Col xs={24} md={8}>
                <Form.Item
                  name="psnp_program"
                  label={<FieldLabel>PSNP Program</FieldLabel>}
                >
                  <Input placeholder="Program / phase" />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name="psnp_category"
                  label={<FieldLabel>PSNP Category</FieldLabel>}
                >
                  <Select
                    options={[
                      option('Public Works', 'Public Works'),
                      option('Direct Support', 'Direct Support'),
                      option('Other', 'Other'),
                    ]}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name="graduation_status"
                  label={<FieldLabel>Graduation Status</FieldLabel>}
                >
                  <Select
                    options={[
                      option('Not Graduated', 'Not Graduated'),
                      option('Graduated', 'Graduated'),
                      option('Not Assessed', 'Not Assessed'),
                    ]}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="graduation_date"
                  label={<FieldLabel>Graduation Date</FieldLabel>}
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                  />
                </Form.Item>
              </Col>
            </>
          )}
        </Row>
      </SectionCard>

      <SectionCard
        icon={<MedicineBoxOutlined />}
        title="Nutrition & WASH"
      >
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <SwitchBox
              name="nutrition_program_participant"
              title="Nutrition Program Participant"
              description="Household participates in nutrition-related programs or services"
              checked={nutritionParticipant}
            />
          </Col>

          {nutritionParticipant && (
            <Col xs={24} md={12}>
              <Form.Item
                name="nutrition_program"
                label={<FieldLabel>Nutrition Program</FieldLabel>}
              >
                <Input placeholder="Program / project name" />
              </Form.Item>
            </Col>
          )}

          <Col xs={24} md={8}>
            <Form.Item
              name="safe_drinking_water"
              label={<FieldLabel>Safe Drinking Water</FieldLabel>}
            >
              <Switch
                checkedChildren="Yes"
                unCheckedChildren="No"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              name="latrine_available"
              label={<FieldLabel>Latrine Available</FieldLabel>}
            >
              <Switch
                checkedChildren="Yes"
                unCheckedChildren="No"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              name="handwashing_facility"
              label={<FieldLabel>Handwashing Facility</FieldLabel>}
            >
              <Switch
                checkedChildren="Yes"
                unCheckedChildren="No"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="water_source"
              label={<FieldLabel>Main Water Source</FieldLabel>}
            >
              <Select options={waterSourceOptions} />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="food_security_status"
              label={<FieldLabel>Food Security Status</FieldLabel>}
            >
              <Select
                options={[
                  option('Food Secure', 'Food Secure'),
                  option('Moderately Food Insecure', 'Moderately Food Insecure'),
                  option('Severely Food Insecure', 'Severely Food Insecure'),
                  option('Not Assessed', 'Not Assessed'),
                ]}
              />
            </Form.Item>
          </Col>
        </Row>
      </SectionCard>
    </div>
  );

  const renderStep7 = () => (
    <div>
      <SectionCard
        icon={<FileTextOutlined />}
        title="Farmer Documents"
        description="Identity, land and supporting registration documents"
      >
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Form.Item
              name="documents"
              label={<FieldLabel>Supporting Documents</FieldLabel>}
            >
              <Upload
                multiple
                beforeUpload={() => false}
              >
                <Button icon={<FileTextOutlined />}>
                  Upload Documents
                </Button>
              </Upload>
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              name="document_verification_status"
              label={<FieldLabel>Document Verification</FieldLabel>}
            >
              <Select
                options={[
                  option('Pending', 'Pending'),
                  option('Verified', 'Verified'),
                  option('Partially Verified', 'Partially Verified'),
                  option('Rejected', 'Rejected'),
                ]}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              name="verified_by"
              label={<FieldLabel>Verified By</FieldLabel>}
            >
              <Input placeholder="Verifier user ID / name" />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              name="verified_at"
              label={<FieldLabel>Verification Date</FieldLabel>}
            >
              <DatePicker
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
              />
            </Form.Item>
          </Col>
        </Row>
      </SectionCard>

      <SectionCard
        icon={<SafetyCertificateOutlined />}
        title="Registration Verification"
      >
        <Alert
          type="warning"
          showIcon
          message="Farmer registration requires verification"
          description="The registration record should pass duplicate checking and the applicable Kebele/Woreda verification workflow before the farmer becomes an active IAIMS master record."
          style={{ marginBottom: 16 }}
        />

        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Form.Item
              name="verification_status"
              label={<FieldLabel>Verification Status</FieldLabel>}
              rules={[
                {
                  required: true,
                  message: 'Select verification status',
                },
              ]}
            >
              <Select
                options={[
                  option('Draft', 'Draft'),
                  option('Submitted', 'Submitted'),
                  option('Duplicate Check', 'Duplicate Check'),
                  option('Kebele Verification', 'Kebele Verification'),
                  option('Woreda Verification', 'Woreda Verification'),
                  option('Verified', 'Verified'),
                  option('Rejected', 'Rejected'),
                ]}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              name="duplicate_check_status"
              label={<FieldLabel>Duplicate Check</FieldLabel>}
            >
              <Select
                options={[
                  option('Pending', 'Pending'),
                  option('Clear', 'Clear'),
                  option('Possible Duplicate', 'Possible Duplicate'),
                  option('Confirmed Duplicate', 'Confirmed Duplicate'),
                ]}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              name="data_quality_status"
              label={<FieldLabel>Data Quality</FieldLabel>}
              rules={[
                {
                  required: true,
                  message: 'Select data quality status',
                },
              ]}
            >
              <Select
                options={[
                  option('Complete', 'Complete'),
                  option('Incomplete', 'Incomplete'),
                  option('Needs Review', 'Needs Review'),
                ]}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="kebele_verification_status"
              label={<FieldLabel>Kebele Verification</FieldLabel>}
            >
              <Select
                options={[
                  option('Pending', 'Pending'),
                  option('Verified', 'Verified'),
                  option('Rejected', 'Rejected'),
                ]}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="woreda_approval_status"
              label={<FieldLabel>Woreda Verification / Approval</FieldLabel>}
            >
              <Select
                options={[
                  option('Pending', 'Pending'),
                  option('Verified', 'Verified'),
                  option('Approved', 'Approved'),
                  option('Rejected', 'Rejected'),
                ]}
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              name="rejection_reason"
              label={<FieldLabel>Rejection / Review Reason</FieldLabel>}
            >
              <TextArea
                rows={3}
                placeholder="Complete only if rejected or requires review"
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              name="registration_notes"
              label={<FieldLabel>Registration Notes</FieldLabel>}
            >
              <TextArea
                rows={3}
                placeholder="Additional registration notes"
              />
            </Form.Item>
          </Col>
        </Row>
      </SectionCard>

      <Alert
        type="success"
        showIcon
        icon={<CheckCircleFilled />}
        message="Master Farmer Registration"
        description="After successful verification, IAIMS should generate or confirm the permanent UFIN. All subsequent land, crop, livestock, irrigation, extension, input, program and service records should reference this farmer."
      />
    </div>
  );

  const steps = [
    {
      title: 'Identity & Location',
      icon: <IdcardOutlined />,
      content: renderStep1(),
    },
    {
      title: 'Household & Demographics',
      icon: <UserOutlined />,
      content: renderStep2(),
    },
    {
      title: 'Land & Farm',
      icon: <ApartmentOutlined />,
      content: renderStep3(),
    },
    {
      title: 'Production',
      icon: <AppstoreOutlined />,
      content: renderStep4(),
    },
    {
      title: 'Services & Organizations',
      icon: <TeamOutlined />,
      content: renderStep5(),
    },
    {
      title: 'Finance & Social',
      icon: <BankOutlined />,
      content: renderStep6(),
    },
    {
      title: 'Verification',
      icon: <SafetyCertificateOutlined />,
      content: renderStep7(),
    },
  ];

  return (
    <Modal
      title={
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            paddingBottom: 6,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 7,
              background: '#e6f7ed',
              color: GREEN,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
            }}
          >
            <IdcardOutlined />
          </div>

          <div>
            <div
              style={{
                fontFamily:
                  "'Times New Roman', Times, serif",
                fontSize: 18,
                color: GREEN,
                fontWeight: 'bold',
              }}
            >
              {editingFarmer
                ? 'Edit Farmer Master Profile'
                : 'Register New Farmer'}
            </div>

            <div
              style={{
                fontSize: 11,
                color: '#888',
              }}
            >
              Integrated Agricultural Information Management System
              (IAIMS)
            </div>
          </div>
        </div>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={980}
      destroyOnClose
      maskClosable={false}
      centered
      styles={{
        body: {
          paddingTop: 16,
          maxHeight: 'calc(100vh - 180px)',
          overflowY: 'auto',
        },
      }}
    >
      <Steps
        current={currentStep}
        size="small"
        responsive
        items={steps.map((step) => ({
          title: step.title,
          icon: step.icon,
        }))}
        style={{
          marginBottom: 24,
          padding: '0 4px',
        }}
      />

      <Form
        form={form}
        layout="vertical"
        requiredMark="optional"
      >
        {steps.map((step, index) => (
          <div
            key={step.title}
            style={{
              display:
                currentStep === index
                  ? 'block'
                  : 'none',
            }}
          >
            {step.content}
          </div>
        ))}
      </Form>

      <div
        style={{
          marginTop: 20,
          paddingTop: 16,
          borderTop: '1px solid #f0f0f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          bottom: 0,
          background: '#fff',
          zIndex: 5,
        }}
      >
        <div>
          <Text
            style={{
              fontSize: 12,
              color: '#888',
            }}
          >
            Step {currentStep + 1} of {steps.length}
          </Text>

          {calculatedAge !== null && (
            <Tag
              color={isYouthCalculated ? 'orange' : 'blue'}
              style={{ marginLeft: 8 }}
            >
              {isYouthCalculated
                ? 'Youth Farmer'
                : `Age ${calculatedAge}`}
            </Tag>
          )}
        </div>

        <Space>
          {currentStep > 0 && (
            <Button onClick={prev}>
              Previous
            </Button>
          )}

          {currentStep < steps.length - 1 && (
            <Button
              type="primary"
              onClick={next}
              style={{
                backgroundColor: GREEN,
                borderColor: GREEN,
              }}
            >
              Save & Continue
            </Button>
          )}

          {currentStep === steps.length - 1 && (
            <Button
              type="primary"
              loading={saving}
              onClick={handleFinish}
              icon={<CheckCircleFilled />}
              style={{
                background: GREEN,
                borderColor: GREEN,
                fontWeight: 600,
              }}
            >
              {editingFarmer
                ? 'Update Farmer Profile'
                : 'Complete Registration'}
            </Button>
          )}
        </Space>
      </div>
    </Modal>
  );
}