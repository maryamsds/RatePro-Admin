// ============================================================================
// SURVEY BUILDER CONSTANTS
// ============================================================================

// Mode Types - Unified enum for all survey builder modes
export const SURVEY_BUILDER_MODE = {
  CREATE_SURVEY: 'create_survey',           // New survey from scratch
  EDIT_SURVEY: 'edit_survey',               // Edit existing survey (draft or re-edit)
  CREATE_FROM_TEMPLATE: 'create_from_template', // Create survey using template
  CREATE_TEMPLATE: 'create_template',        // Admin creating new template
  EDIT_TEMPLATE: 'edit_template'             // Admin editing existing template
};

// Survey Status (must match backend Survey.js model)
export const SURVEY_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  SCHEDULED: 'scheduled',
  INACTIVE: 'inactive',
  CLOSED: 'closed',
  PUBLISHED: 'published' // For templates
};

// Template Status (must match backend surveyTemplates.js model)
export const TEMPLATE_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published'
};

// Language Constants (must match backend enum)
export const LANGUAGES = {
  ENGLISH: 'en',
  ARABIC: 'ar'
};

export const LANGUAGE_OPTIONS = [
  { label: 'English', value: LANGUAGES.ENGLISH },
  { label: 'Arabic', value: LANGUAGES.ARABIC }
];

// Question Types - Frontend to Backend Mapping
// Frontend uses descriptive names, backend uses short codes
export const QUESTION_TYPE_MAP = {
  frontend: {
    rating: 'rating',
    single_choice: 'radio',
    multiple_choice: 'checkbox',
    text_short: 'text',
    text_long: 'textarea',
    nps: 'nps',
    likert: 'likert',
    yes_no: 'yesno',
    date: 'date',
    time: 'time',
    datetime: 'datetime',
    ranking: 'ranking',
    matrix: 'matrix',
    numeric: 'numeric',
    email: 'email',
    select: 'select',
    imageChoice: 'imageChoice'
  },
  backend: {
    rating: 'rating',
    radio: 'single_choice',
    checkbox: 'multiple_choice',
    text: 'text_short',
    textarea: 'text_long',
    nps: 'nps',
    likert: 'likert',
    yesno: 'yes_no',
    date: 'date',
    time: 'time',
    datetime: 'datetime',
    ranking: 'ranking',
    matrix: 'matrix',
    numeric: 'numeric',
    email: 'email',
    select: 'select',
    imageChoice: 'imageChoice'
  }
};

// Backend valid question types (from Survey.js model enum)
export const VALID_BACKEND_QUESTION_TYPES = [
  'text', 'textarea', 'numeric', 'email', 'radio', 'checkbox', 
  'select', 'imageChoice', 'ranking', 'matrix', 'likert', 'scale', 
  'nps', 'rating', 'yesno', 'date', 'time', 'datetime', 'multiple_choice'
];

// Wizard Steps
export const WIZARD_STEPS = [
  { id: 1, title: 'Survey Details', description: 'Basic information and questions' },
  { id: 2, title: 'Target Audience', description: 'Who will take this survey' },
  { id: 3, title: 'Publish & Schedule', description: 'When and how to deploy' }
];

// Industry/Category Options (must match backend enum)
export const INDUSTRIES = [
  { id: 'corporate', name: 'Corporate / HR' },
  { id: 'education', name: 'Education' },
  { id: 'healthcare', name: 'Healthcare' },
  { id: 'hospitality', name: 'Hospitality & Tourism' },
  { id: 'sports', name: 'Sports & Entertainment' },
  { id: 'banking', name: 'Banking & Financial' },
  { id: 'retail', name: 'Retail & E-Commerce' },
  { id: 'government', name: 'Government & Public' },
  { id: 'construction', name: 'Construction & Real Estate' },
  { id: 'automotive', name: 'Automotive & Transport' },
  { id: 'technology', name: 'Technology & Digital' },
  { id: 'general', name: 'General' }
];

// AI Generation Limits
export const AI_LIMITS = {
  MIN_QUESTIONS: 3,
  MAX_QUESTIONS: 20,
  DEFAULT_QUESTIONS: 8
};

// API Endpoints - Centralized endpoint definitions
export const API_ENDPOINTS = {
  // Survey Endpoints
  SURVEYS: {
    LIST: '/surveys',
    GET: (id) => `/surveys/${id}`,
    CREATE: '/surveys/save-draft',
    UPDATE: (id) => `/surveys/${id}`,
    DELETE: (id) => `/surveys/${id}`,
    PUBLISH: '/surveys/publish',
    PUBLISH_DRAFT: (id) => `/surveys/${id}/publish`,
    SET_AUDIENCE: (id) => `/surveys/${id}/audience`,
    SCHEDULE: (id) => `/surveys/${id}/schedule`
  },
  // Template Endpoints
  TEMPLATES: {
    LIST: '/survey-templates',
    GET: (id) => `/survey-templates/${id}`,
    CREATE: '/survey-templates/create',
    UPDATE: (id) => `/survey-templates/${id}`,
    DELETE: (id) => `/survey-templates/${id}`,
    USE: (id) => `/survey-templates/${id}/use`
  },
  // AI Endpoints
  AI: {
    GENERATE_FROM_PROFILE: '/ai/generate-from-profile'
  },
  // Audience Endpoints
  AUDIENCE: {
    SEGMENTS: '/segments',
    CATEGORIES: '/contact-categories',
    CONTACTS: '/contacts'
  }
};

// Default Survey State
export const DEFAULT_SURVEY_STATE = {
  title: '',
  description: '',
  category: '',
  language: LANGUAGES.ENGLISH,
  isPublic: true,
  allowAnonymous: true,
  collectEmail: false,
  multipleResponses: false,
  thankYouMessage: 'Thank you for your valuable feedback!',
  redirectUrl: '',
  customCSS: '',
  branding: {
    logo: '',
    primaryColor: 'var(--bs-primary)',
    backgroundColor: 'var(--bs-body-bg)',
    textColor: 'var(--bs-body-color)',
    showBranding: true
  },
  translations: { en: {}, ar: {} }
};

// Default Publish Settings
export const DEFAULT_PUBLISH_SETTINGS = {
  publishNow: true,
  scheduleDate: '',
  scheduleTime: '',
  expiryDate: '',
  maxResponses: '',
  notificationEmails: []
};

// Default Company Profile for AI Generation
export const DEFAULT_COMPANY_PROFILE = {
  industry: '',
  products: '',
  targetAudience: '',
  surveyGoal: '',
  questionCount: AI_LIMITS.DEFAULT_QUESTIONS,
  includeNPS: true,
  language: LANGUAGES.ENGLISH, // Fixed: was 'languages'
  tone: 'friendly-professional',
  additionalInstructions: ''
};