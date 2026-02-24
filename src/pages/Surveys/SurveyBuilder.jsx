// src/pages/Surveys/SurveyBuilder.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import {
  MdAdd, MdClose, MdDelete, MdEdit, MdPreview, MdSave, MdPublish,
  MdDragHandle, MdContentCopy, MdSettings,
  MdStar, MdRadioButtonChecked, MdCheckBox, MdTextFields,
  MdLinearScale, MdDateRange, MdToggleOn,
  MdViewList, MdGridOn, MdSmartToy, MdAutoAwesome,
  MdTune, MdCode, MdBusiness, MdBuild,
  MdOutlineAccessTime, MdEvent, MdBarChart, MdAlternateEmail, MdImage,
  Md123, MdQuestionAnswer, MdPeople, MdGroup, MdHandshake,
  MdSchedule, MdArrowForward, MdArrowBack,
} from 'react-icons/md';
import { MdFilterList, MdCategory, MdInfo } from "react-icons/md";
import { FaUsers, FaLightbulb, FaPalette } from 'react-icons/fa';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import useDropdownOptions from '../../hooks/useDropdownOptions';
import Swal from 'sweetalert2';

// ── Extracted hooks ──────────────────────────────────────────────
import useQuestions from './hooks/useQuestions';
import useAudience from './hooks/useAudience';

// ── Extracted components ─────────────────────────────────────────
import QuestionTypeSidebar from './components/QuestionTypeSidebar';
import QuestionList from './components/QuestionList';
import ResponsibleUserDropdown from './components/ResponsibleUserDropdown';

const SurveyBuilder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state || {};
  const { id: surveyId } = useParams();
  const { user, setGlobalLoading } = useAuth();

  // console.log(location.pathname, 'Location State:', locationState,);

  // ✅ FIXED: Enhanced mode detection with ALL required variables
  const templateData = locationState.templateData;
  const fromTemplates = locationState.source === 'templates';

  // Mode Detection Logic (give createTemplate priority over template-edit flag)
  const isTemplateCreateMode = locationState.createTemplate === true && user?.role === 'admin';
  const isTemplateEditMode = !isTemplateCreateMode && locationState.mode === 'template-edit' && user?.role === 'admin';
  const isTemplateMode = isTemplateEditMode || isTemplateCreateMode;

  // Survey Mode Detection
  const isEditMode = !!surveyId && !isTemplateMode;
  const isCreateMode = !surveyId && !isTemplateMode;
  const isTemplateBasedSurvey = fromTemplates && templateData && !isTemplateMode;

  // ✅ ADDED: Backward compatibility variable
  const isEditing = isEditMode || isTemplateEditMode;
  // Main Survey State
  const [survey, setSurvey] = useState({
    title: '',
    description: '',
    category: '',
    language: "en",
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
    translations: {
      en: {},
      ar: {}
    }
  });


  const [showAIModal, setShowAIModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showSettingsOffcanvas, setShowSettingsOffcanvas] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('builder');

  // ── Unsaved changes tracking ─────────────────────────────────
  const [isDirty, setIsDirty] = useState(false);
  const initialLoadRef = useRef(true);

  // ── Validation state ─────────────────────────────────────
  const [validationErrors, setValidationErrors] = useState([]);

  // Multi-step Wizard States
  const [currentStep, setCurrentStep] = useState(1);
  const [publishSettings, setPublishSettings] = useState({
    publishNow: true,
    scheduleDate: '',
    scheduleTime: '',
    expiryDate: '',
    maxResponses: '',
    notificationEmails: []
  });
  // ── Audience management via extracted hook ────────────────────
  const {
    targetAudience, setTargetAudience,
    audienceSegments, contactCategories,
    loadingSegments, loadingCategories,
    contacts, selectedContacts, setSelectedContacts,
    showCustomContactModal, setShowCustomContactModal,
    loadingContacts, contactSearch, contactPage,
    contactTotal, contactLimit,
    toggleAudience, toggleContactSelection,
    saveSelectedContacts, handleContactSearch,
    handleContactPageChange, fetchContacts,
    fetchAudienceSegments, fetchContactCategories
  } = useAudience({ user, isTemplateMode });


  // AI Workflow States
  const [surveyMode, setSurveyMode] = useState('user-defined');
  const [showModeSelector, setShowModeSelector] = useState(true);
  const [aiWorkflowStep, setAIWorkflowStep] = useState(1);
  const [aiGeneratedDraft, setAIGeneratedDraft] = useState(null);
  const [aiLoadingStates, setAILoadingStates] = useState({
    generating: false,
    optimizing: false,
    suggesting: false,
    translating: false
  });

  const [aiPrompt, setAIPrompt] = useState('');

  // ── beforeunload — warn on browser close / refresh ────────────
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // ── Guarded navigate — prompt on in-app navigation when dirty ──
  const guardedNavigate = useCallback((path) => {
    if (!isDirty) {
      navigate(path);
      return;
    }
    Swal.fire({
      title: 'Unsaved Changes',
      text: 'You have unsaved changes. Are you sure you want to leave?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'var(--bs-danger)',
      cancelButtonColor: 'var(--bs-secondary)',
      confirmButtonText: 'Leave',
      cancelButtonText: 'Stay'
    }).then((result) => {
      if (result.isConfirmed) {
        setIsDirty(false);
        navigate(path);
      }
    });
  }, [isDirty, navigate]);

  const [companyProfile, setCompanyProfile] = useState({
    industry: "",
    products: "",
    targetAudience: "",
    surveyGoal: "",
    questionCount: 8,
    includeNPS: true,
    language: 'en',
    tone: 'friendly-professional',
    additionalInstructions: ''
  });

  const [logicRules, setLogicRules] = useState([]);
  const [showLogicBuilder, setShowLogicBuilder] = useState(false);
  const [currentLogicRule, setCurrentLogicRule] = useState({
    name: '',
    priority: 50,
    conditions: { logic: 'AND', items: [] },
    actions: []
  });

  // Question Types Configuration
  const questionTypes = [
    {
      id: "text",
      name: "Short Text",
      icon: MdTextFields,
      color: "var(--bs-info)",
      category: "text",
      description: "Single line text input",
      example: "📝 Short answer"
    },
    {
      id: "textarea",
      name: "Long Text",
      icon: MdViewList,
      color: "var(--bs-secondary)",
      category: "text",
      description: "Multi-line text area",
      example: "📝 Detailed response"
    },
    {
      id: "numeric",
      name: "Number Input",
      icon: Md123,
      color: "var(--bs-primary)",
      category: "input",
      description: "Enter numeric value",
      example: "🔢 12345"
    },
    {
      id: "email",
      name: "Email Input",
      icon: MdAlternateEmail,
      color: "var(--bs-blue)",
      category: "input",
      description: "Enter a valid email address",
      example: "📧 name@example.com"
    },
    {
      id: "radio",
      name: "Single Choice",
      icon: MdRadioButtonChecked,
      color: "var(--bs-primary)",
      category: "choice",
      description: "Select one option",
      example: "🔘 ○ ○"
    },
    {
      id: "checkbox",
      name: "Multiple Choice",
      icon: MdCheckBox,
      color: "var(--bs-success)",
      category: "choice",
      description: "Select multiple options",
      example: "☑️ ☐ ☐"
    },
    {
      id: "select",
      name: "Dropdown Select",
      icon: MdQuestionAnswer,
      color: "var(--bs-cyan)",
      category: "choice",
      description: "Select one option from dropdown",
      example: "⬇️ Choose one"
    },
    {
      id: "imageChoice",
      name: "Image Choice",
      icon: MdImage,
      color: "var(--bs-warning)",
      category: "media",
      description: "Choose using images",
      example: "🖼️ 🖼️ 🖼️"
    },
    {
      id: "ranking",
      name: "Ranking",
      icon: MdDragHandle,
      color: "var(--bs-dark)",
      category: "advanced",
      description: "Rank options by order",
      example: "⬆️ 1️⃣ 2️⃣ 3️⃣ ⬇️"
    },
    {
      id: "matrix",
      name: "Matrix/Grid",
      icon: MdGridOn,
      color: "var(--bs-gray-dark)",
      category: "advanced",
      description: "Grid-style rating or choice questions",
      example: "Rows × Columns"
    },
    {
      id: "likert",
      name: "Likert Scale",
      icon: MdLinearScale,
      color: "var(--bs-orange)",
      category: "rating",
      description: "Agreement scale (1-5)",
      example: "1️⃣ 2️⃣ 3️⃣ 4️⃣ 5️⃣"
    },
    {
      id: "scale",
      name: "Scale",
      icon: MdBarChart,
      color: "var(--bs-indigo)",
      category: "rating",
      description: "Numeric or visual scale",
      example: "1️⃣ 2️⃣ 3️⃣ 4️⃣ 5️⃣"
    },
    {
      id: "nps",
      name: "NPS Score",
      icon: MdLinearScale,
      color: "var(--bs-pink)",
      category: "rating",
      description: "Net Promoter Score (0-10)",
      example: "0️⃣ 1️⃣ ... 🔟"
    },
    {
      id: "rating",
      name: "Star Rating",
      icon: MdStar,
      color: "var(--bs-warning)",
      category: "rating",
      description: "Rate using stars (1-5)",
      example: "⭐⭐⭐⭐⭐"
    },
    {
      id: "yesno",
      name: "Yes/No",
      icon: MdToggleOn,
      color: "var(--bs-teal)",
      category: "choice",
      description: "Simple yes or no question",
      example: "✅ ❌"
    },
    {
      id: "date",
      name: "Date Picker",
      icon: MdDateRange,
      color: "var(--bs-purple)",
      category: "input",
      description: "Select a date",
      example: "📅 2025-01-01"
    },
    {
      id: "time",
      name: "Time Picker",
      icon: MdOutlineAccessTime,
      color: "var(--bs-purple)",
      category: "input",
      description: "Select a time",
      example: "⏰ 10:30 AM"
    },
    {
      id: "datetime",
      name: "Date & Time",
      icon: MdEvent,
      color: "var(--bs-purple)",
      category: "input",
      description: "Select date and time",
      example: "📅 2025-01-01 ⏰ 10:30 AM"
    },
    {
      id: "multiple_choice",
      name: "Multiple Choice (Alt)",
      icon: MdCheckBox,
      color: "var(--bs-success)",
      category: "choice",
      description: "Choose multiple answers",
      example: "☑️ ☐ ☐"
    }
  ];

  // ── Question management via extracted hook ──────────────────────
  const {
    questions, setQuestions,
    selectedQuestion, setSelectedQuestion,
    showQuestionModal, setShowQuestionModal,
    questionModalMode, setQuestionModalMode,
    addQuestion, updateQuestion, deleteQuestion,
    duplicateQuestion, handleOnDragEnd,
    addLogicRule, removeLogicRule, updateLogicRule,
    setDefaultNextQuestion, openEditModal, closeQuestionModal
  } = useQuestions(questionTypes);

  // ── Mark dirty when survey or questions change (skip initial load) ─
  useEffect(() => {
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      return;
    }
    setIsDirty(true);
  }, [survey, questions]);

  // Dynamic industries from Admin-managed dropdown settings
  const { options: industryOptions, loading: industriesLoading } = useDropdownOptions('industry');
  const industries = industryOptions.map(opt => ({
    id: opt.key,
    name: opt.label,
    icon: MdBusiness // Default icon for all industries
  }));

  const steps = [
    { id: 1, title: 'Survey Details', description: 'Basic information and questions' },
    { id: 2, title: 'Target Audience', description: 'Who will take this survey' },
    { id: 3, title: 'Publish & Schedule', description: 'When and how to deploy' }
  ];

  const addCondition = () => {
    setCurrentLogicRule({
      ...currentLogicRule,
      conditions: {
        ...currentLogicRule.conditions,
        items: [...currentLogicRule.conditions.items, { questionId: '', operator: '==', value: '' }]
      }
    });
  };

  const updateCondition = (index, field, value) => {
    const updated = [...currentLogicRule.conditions.items];
    updated[index][field] = value;
    setCurrentLogicRule({
      ...currentLogicRule,
      conditions: { ...currentLogicRule.conditions, items: updated }
    });
  };

  const removeCondition = (index) => {
    setCurrentLogicRule({
      ...currentLogicRule,
      conditions: {
        ...currentLogicRule.conditions,
        items: currentLogicRule.conditions.items.filter((_, i) => i !== index)
      }
    });
  };

  const addAction = () => {
    setCurrentLogicRule({
      ...currentLogicRule,
      actions: [...currentLogicRule.actions, { type: 'SHOW', targetId: '', value: '' }]
    });
  };

  const updateAction = (index, field, value) => {
    const updated = [...currentLogicRule.actions];
    updated[index][field] = value;
    setCurrentLogicRule({ ...currentLogicRule, actions: updated });
  };

  const removeAction = (index) => {
    setCurrentLogicRule({
      ...currentLogicRule,
      actions: currentLogicRule.actions.filter((_, i) => i !== index)
    });
  };

  const saveLogicRule = async () => {
    if (currentLogicRule.conditions.items.length === 0 || currentLogicRule.actions.length === 0) {
      Swal.fire('Error', 'Add at least one condition and one action', 'error');
      return;
    }

    const newRule = {
      ...currentLogicRule,
      survey: surveyId || 'temp', // Will be set on backend when survey saves
    };

    // Save locally first
    setLogicRules([...logicRules, newRule]);
    setShowLogicBuilder(false);
    setCurrentLogicRule({
      name: '',
      priority: 50,
      conditions: { logic: 'AND', items: [] },
      actions: []
    });

    Swal.fire({
      icon: 'success',
      title: 'Logic Rule Added!',
      text: `${newRule.actions.length} action(s) will trigger when conditions match`,
      timer: 2000
    });
  };
  // ✅ FIXED: Fetch template data for admin editing
  const fetchTemplateData = async (templateId) => {
    try {
      const response = await axiosInstance.get(`/survey-templates/${templateId}`);

      if (response.data.success && response.data.template) {
        const template = response.data.template;

        setSurvey({
          title: template.name || '',
          description: template.description || '',
          category: template.category || '',
          language: template.language || 'en',
          isPublic: true,
          allowAnonymous: true,
          collectEmail: false,
          multipleResponses: false,
          thankYouMessage: 'Thank you for completing our survey!',
          redirectUrl: '',
          branding: {
            primaryColor: 'var(--bs-primary)',
            backgroundColor: 'var(--bs-body-bg)',
            textColor: 'var(--bs-body-color)',
            showBranding: true
          }
        });

        const transformedQuestions = template.questions?.map((q, index) => ({
          id: q.id || `q${index + 1}`,
          type: mapQuestionTypeFromBackend(q.type),
          title: q.questionText || q.title || `Question ${index + 1}`,
          description: q.description || '',
          required: q.required || false,
          options: q.options || [],
          settings: q.settings || {}
        })) || [];

        setQuestions(transformedQuestions);
      }
    } catch (error) {
      console.error('Error fetching template:', error);
      throw new Error('Failed to load template data');
    }
  };

  // ✅ FIXED: Fetch existing survey
  // This function loads a saved survey (including drafts) and restores all 3 steps' data
  const fetchExistingSurvey = async () => {
    try {
      setLoading(true);
      setError(null);

      // ✅ CORRECTED: Use /api prefix
      const response = await axiosInstance.get(`/surveys/${surveyId}`);

      if (response.data) {
        const surveyData = response.data.survey || response.data;

        // ✅ EDIT GUARD: Only draft surveys can be edited
        // If survey status is NOT draft, redirect to detail page with warning
        if (surveyData.status && surveyData.status !== 'draft') {
          console.warn(`[EditGuard] Survey ${surveyId} status is "${surveyData.status}" - editing not allowed`);
          Swal.fire({
            icon: 'warning',
            title: 'Survey Cannot Be Edited',
            text: `This survey is "${surveyData.status}" and cannot be edited. Only draft surveys can be modified.`,
            confirmButtonColor: 'var(--bs-primary)',
            confirmButtonText: 'View Survey Details'
          }).then(() => {
            navigate(`/app/surveys/detail/${surveyId}`);
          });
          return; // Stop further processing
        }

        // STEP 1: Restore Survey Form Data
        // Transform backend data to frontend format
        setSurvey({
          title: surveyData.title || '',
          description: surveyData.description || '',
          category: surveyData.category || '',
          language: surveyData.language || 'en',
          isPublic: surveyData.settings?.isPublic !== false,
          allowAnonymous: surveyData.settings?.isAnonymous !== false,
          collectEmail: surveyData.settings?.collectEmail || false,
          multipleResponses: surveyData.settings?.multipleResponses || false,
          thankYouMessage: surveyData.thankYouPage?.message || 'Thank you for your valuable feedback!',
          redirectUrl: surveyData.thankYouPage?.redirectUrl || '',
          customCSS: surveyData.customCSS || '',
          branding: {
            logo: surveyData.logo?.url || surveyData.branding?.logo || '',
            primaryColor: surveyData.themeColor || surveyData.branding?.primaryColor || 'var(--bs-primary)',
            backgroundColor: surveyData.branding?.backgroundColor || 'var(--bs-body-bg)',
            textColor: surveyData.branding?.textColor || 'var(--bs-body-color)',
            showBranding: surveyData.branding?.showBranding !== false
          },
          translations: surveyData.translations || {
            en: {},
            ar: {}
          }
        });

        // Restore questions
        const transformedQuestions = surveyData.questions?.map((q, index) => ({
          id: q.id || `q${Date.now() + index}`,
          type: mapQuestionTypeFromBackend(q.type),
          title: q.questionText || q.title || `Question ${index + 1}`,
          description: q.description || '',
          required: q.required || false,
          options: q.options || [],
          settings: q.settings || {},
          logicRules: q.logicRules || [],
          translations: q.translations || {}
        })) || [];

        setQuestions(transformedQuestions);

        // STEP 2: Restore Target Audience Data
        // If target audience was previously saved, restore it
        if (surveyData.targetAudience && Array.isArray(surveyData.targetAudience)) {
          setTargetAudience(surveyData.targetAudience);
        }

        // STEP 3: Restore Schedule/Publish Settings
        // If publish settings were previously saved, restore them
        if (surveyData.publishSettings) {
          setPublishSettings({
            publishNow: surveyData.publishSettings.publishNow !== false,
            scheduleDate: surveyData.publishSettings.scheduleDate || '',
            scheduleTime: surveyData.publishSettings.scheduleTime || '',
            expiryDate: surveyData.publishSettings.expiryDate || '',
            maxResponses: surveyData.publishSettings.maxResponses || '',
            notificationEmails: surveyData.publishSettings.notificationEmails || []
          });
        }

        // Restore the step user was on (if saved)
        if (surveyData.currentStep && surveyData.status === 'draft') {
          setCurrentStep(surveyData.currentStep);
        }

        // fetchExistingSurvey ke end mein
        if (surveyData.logicRules && Array.isArray(surveyData.logicRules)) {
          setLogicRules(surveyData.logicRules);
        }
      }

    } catch (err) {
      console.error('❌ Error fetching survey:', err);

      const errorMessage = err.response?.data?.message || err.message || 'Failed to load survey';

      setError(errorMessage);
      Swal.fire({
        icon: 'error',
        title: 'Error Loading Survey',
        text: errorMessage,
        confirmButtonColor: '#dc3545',
      }).then(() => {
        navigate('/app/surveys');
      });
    } finally {
      setLoading(false);
      setGlobalLoading(false);
    }
  };

  const initializeFromTemplate = (template) => {

    setSurvey({
      title: template.name || '',
      description: template.description || '',
      category: template.category || '',
      language: template.language || 'en',
      isPublic: true,
      allowAnonymous: true,
      collectEmail: false,
      multipleResponses: false,
      thankYouMessage: 'Thank you for completing our survey!',
      redirectUrl: '',
      branding: {
        primaryColor: 'var(--bs-primary)',
        backgroundColor: 'var(--bs-body-bg)',
        textColor: 'var(--bs-body-color)',
        showBranding: true
      }
    });

    const initialQuestions = template.questions?.map((q, index) => ({
      id: q.id || `q${index + 1}`,
      type: mapQuestionTypeFromBackend(q.type),
      title: q.questionText || q.title || `Question ${index + 1}`,
      description: q.description || '',
      required: q.required || false,
      options: q.options || [],
      settings: q.settings || {}
    })) || [];

    setQuestions(initialQuestions);
  };

  // Helper functions for question type mapping
  const mapQuestionTypeToBackend = (frontendType) => {
    const typeMapping = {
      'rating': 'rating',
      'single_choice': 'radio',
      'multiple_choice': 'checkbox',
      'text_short': 'text',
      'text_long': 'textarea',
      'nps': 'nps',
      'likert': 'likert',
      'yes_no': 'yesno',
      'date': 'date',
      'file_upload': 'text',
      'ranking': 'ranking',
      'matrix': 'matrix'
    };
    return typeMapping[frontendType] || 'text';
  };

  const mapQuestionTypeFromBackend = (backendType) => {
    const typeMapping = {
      'rating': 'rating',
      'radio': 'single_choice',
      'checkbox': 'multiple_choice',
      'text': 'text_short',
      'textarea': 'text_long',
      'nps': 'nps',
      'likert': 'likert',
      'yesno': 'yes_no',
      'date': 'date',
      'ranking': 'ranking',
      'matrix': 'matrix'
    };
    return typeMapping[backendType] || 'text_short';
  };

  const mapAIQuestionType = (aiType) => {
    const typeMapping = {
      'rating': 'rating',
      'star_rating': 'rating',
      'likert': 'likert',
      'nps': 'nps',
      'single_choice': 'single_choice',
      'multiple_choice': 'multiple_choice',
      'text_short': 'text_short',
      'text_long': 'text_long',
      'yes_no': 'yes_no',
      'date': 'date',
      'number': 'number',
      'ranking': 'ranking',
      'matrix': 'matrix'
    };
    return typeMapping[aiType] || 'text_short';
  };

  // ✅ ADD: Sync companyProfile language with survey language when survey changes
  useEffect(() => {
    if (survey.language && survey.language !== companyProfile.language) {
      setCompanyProfile(prev => ({
        ...prev,
        language: survey.language
      }));
    }
  }, [survey.language]);

  // AI Survey Generation
  const generateAISurvey = async () => {
    if (!aiPrompt.trim() && !companyProfile.industry) {
      Swal.fire({
        icon: 'warning',
        title: 'Input Required',
        text: 'Please provide a survey description or select your company industry.',
      });
      return;
    }

    setAILoadingStates(prev => ({ ...prev, generating: true }));
    setGlobalLoading(true);
    try {
      // ✅ FIX: Use companyProfile.language (canonical 'en'/'ar') instead of languages array
      const selectedLanguage = companyProfile.language || survey.language || 'en';

      const requestPayload = {
        industry: companyProfile.industry || 'general',
        products: companyProfile.products
          ? companyProfile.products.split(',').map(p => p.trim())
          : [],
        targetAudience: companyProfile.targetAudience || 'customers',
        goal: companyProfile.surveyGoal || aiPrompt || 'customer feedback',
        questionCount: companyProfile.questionCount || 8,
        includeNPS: companyProfile.includeNPS || true,
        language: selectedLanguage, // ✅ Send canonical value 'en' or 'ar'
        tone: companyProfile.tone || 'friendly-professional',
        additionalInstructions: companyProfile.additionalInstructions || aiPrompt.trim() || ''
      };

      console.log('🤖 AI Survey Generation Request:', requestPayload);

      const response = await axiosInstance.post('/ai/generate-from-profile', requestPayload);

      if (response.data && (response.data.success || response.data.data || response.status < 400)) {
        const aiData = response.data.data || response.data;
        const aiSurvey = aiData.survey || {};
        const aiQuestions = aiData.questions || [];

        const transformedQuestions = aiQuestions.map((q, index) => ({
          id: Date.now() + index,
          type: mapAIQuestionType(q.type),
          title: q.title || q.text || `Question ${index + 1}`,
          description: q.description || '',
          required: q.required !== false,
          options: q.options || [],
          settings: q.settings || {},
          translations: q.translations || {}
        }));

        setQuestions(transformedQuestions);

        setSurvey(prev => ({
          ...prev,
          title: aiSurvey.title || survey.title || `${companyProfile.industry} Customer Survey`,
          description: aiSurvey.description || survey.description || `${companyProfile.surveyGoal} survey for ${companyProfile.industry}`,
          category: companyProfile.industry || prev.category,
          language: aiSurvey.languages || prev.language
        }));

        setAIWorkflowStep(2);
        setAIGeneratedDraft(aiData);
        setShowAIModal(false);
        setAIPrompt('');

        Swal.fire({
          icon: 'success',
          title: '✨ AI Survey Generated!',
          html: `
            <div style="text-align: left;">
              <p><strong>Industry:</strong> ${companyProfile.industry}</p>
              <p><strong>Target:</strong> ${companyProfile.targetAudience}</p>
              <p><strong>Generated:</strong> ${transformedQuestions.length} optimized questions</p>
              <p><strong>Includes:</strong> Rating scales, multiple choice, NPS, and feedback sections</p>
            </div>
          `,
          timer: 4000,
          showConfirmButton: false
        });
      } else {
        throw new Error('Invalid AI response format');
      }

    } catch (error) {
      console.error('❌ Error generating AI survey:', error);
      Swal.fire({
        icon: 'error',
        title: 'Generation Failed',
        html: `
          <p>Failed to generate AI survey.</p>
          <small>Error: ${error.response?.data?.message || error.message}</small>
          <br><small>Please try again or check your internet connection.</small>
        `
      });
    } finally {
      setAILoadingStates(prev => ({ ...prev, generating: false }));
      setGlobalLoading(false);
    }
  };

  // Question Management — provided by useQuestions hook above
  // (addQuestion, updateQuestion, deleteQuestion, duplicateQuestion, handleOnDragEnd)


  // ✅ DEBUG: Check survey details before update
  const checkSurveyAccess = async () => {
    try {
      // Test GET request to check if survey exists
      const testResponse = await axiosInstance.get(`/surveys/${surveyId}`);

      return true;
    } catch (error) {
      console.error("❌ Survey Access Check Failed:", {
        status: error.response?.status,
        message: error.response?.data?.message,
        surveyId: surveyId
      });
      return false;
    }
  };


  // ✅ FIXED: Save function with proper status handling for companyAdmin
  const saveSurvey = async (publish = false) => {
    setSaving(true);
    try {
      // ✅ ONLY check survey access for SURVEY mode, not TEMPLATE mode
      if (!isTemplateMode && isEditing && surveyId) {
        const canAccess = await checkSurveyAccess();
        if (!canAccess) {
          throw new Error('Cannot access survey. It may not exist or you may not have permission.');
        }
      }

      if (!survey.title.trim()) {
        throw new Error('Title is required');
      }
      if (questions.length === 0) {
        throw new Error('At least one question is required');
      }

      let response;
      let successMessage = '';

      // ✅ FIXED: Proper status determination for companyAdmin
      let finalStatus;

      if (isTemplateMode) {
        // TEMPLATE MODE - Admin ke liye
        if (user?.role === 'admin') {
          finalStatus = publish ? 'published' : 'draft';
        } else {
          // CompanyAdmin template mode - should not happen normally
          finalStatus = 'active';
        }
      } else {
        if (user?.role === 'companyAdmin') {
          finalStatus = publish ? 'active' : 'draft';
        } else {
          finalStatus = publish ? 'published' : 'draft';
        }
      }

      // ✅ FIXED: Template mode with correct API endpoint
      if (isTemplateMode) {
        // ADMIN TEMPLATE MODE
        const templateData = {
          name: survey.title,
          description: survey.description,
          category: survey.category,
          categoryName: survey.category || 'General',
          estimatedTime: 120, // 2 minutes default
          questions: questions.map((q, index) => ({
            id: q.id?.toString() || (index + 1).toString(),
            questionText: q.title,
            type: mapQuestionTypeToBackend(q.type),
            options: q.options || [],
            required: q.required || false,
            translations: q.translations || {},
            logicRules: q.logicRules || []
          })),
          themeColor: survey.branding?.primaryColor || '#007bff',
          status: finalStatus, // ✅ Use the properly determined status
          language: normalizeLanguage(survey.language) || 'en',
          tags: [],
          isPremium: false
        };

        if (isEditing && surveyId) {
          // Update existing template
          // Detect whether to update published or save as draft
          const wasPublished = survey.isPublic === true;
          const isUpdatingPublished = wasPublished;

          if (isUpdatingPublished) {
            // Keep published status, just update content
            response = await axiosInstance.put(`/survey-templates/${surveyId}`, templateData);
            successMessage = "Template updated successfully!";
          } else if (publish) {
            // Publish new or previously draft template
            response = await axiosInstance.put(`/survey-templates/${surveyId}`, {
              ...templateData,
              status: "published"
            });
            successMessage = "Template published successfully!";
          } else {
            // Save draft version
            response = await axiosInstance.put(`/survey-templates/${surveyId}`, {
              ...templateData,
              status: "draft"
            });
            successMessage = "Template saved as draft!";
          }

        } else {
          // Create new template - ✅ CORRECT ENDPOINT
          response = await axiosInstance.post('/survey-templates/create', templateData);
          successMessage = `Template ${publish ? 'published' : 'created'} successfully!`;
        }
      } else {
        // ✅ FIXED: TENANT SURVEY MODE with proper status for companyAdmin
        const surveyData = {
          title: survey.title,
          description: survey.description,
          category: survey.category,
          themeColor: survey.branding?.primaryColor || 'var(--bs-primary)',
          questions: questions.map((q, index) => ({
            id: q.id?.toString() || (index + 1).toString(),
            questionText: q.title,
            type: mapQuestionTypeToBackend(q.type),
            options: q.options || [],
            required: q.required || false,
            translations: q.translations || {},
            logicRules: q.logicRules || []
          })),
          logicRules: logicRules,
          settings: {
            isPublic: survey.isPublic,
            isAnonymous: survey.allowAnonymous,
            isPasswordProtected: false,
            password: ''
          },
          thankYouPage: {
            message: survey.thankYouMessage || 'Thank you for your feedback!',
            redirectUrl: survey.redirectUrl || '',
            qrCode: {
              enabled: false,
              url: ''
            }
          },
          status: finalStatus, // ✅ Use the properly determined status
        };

        if (isEditing && surveyId) {
          response = await axiosInstance.put(`/surveys/${surveyId}`, surveyData);
          successMessage = `Survey ${publish ? 'published' : 'updated'} successfully!`;
        } else {
          const endpoint = publish ? '/surveys/publish/' : '/surveys/save-draft';
          response = await axiosInstance.post(endpoint, surveyData);
          successMessage = `Survey ${publish ? 'published' : 'saved as draft'} successfully!`;
        }
      }

      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: successMessage,
        timer: 2000,
        showConfirmButton: false
      });

      setTimeout(() => {
        setIsDirty(false);
        navigate(isTemplateMode ? '/app/surveys/templates' : '/app/surveys');
      }, 1500);

    } catch (error) {
      console.error('❌ Save error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      });

      let errorMessage = 'Failed to save. Please try again.';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 404) {
        errorMessage = 'API endpoint not found. Please check backend routes.';
      }

      Swal.fire({
        icon: 'error',
        title: 'Save Failed',
        text: errorMessage,
        confirmButtonText: 'OK'
      });
    } finally {
      setSaving(false);
    }
  };

  // ✅ FIXED: Save as Draft Function
  // This function saves the current progress of all 3 steps as a draft
  // Includes: Survey Form + Target Audience + Schedule settings
  const saveAsDraft = async () => {
    const result = await Swal.fire({
      title: 'Save as Draft!',
      text: 'Your survey will be saved as draft and can be published later.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: 'var(--bs-warning)',
      cancelButtonColor: 'var(--bs-secondary)',
      confirmButtonText: 'Yes, Save as Draft'
    });

    if (result.isConfirmed) {
      setSaving(true);
      try {
        // Validate minimum requirements for draft save
        if (!survey.title.trim()) {
          throw new Error('Survey title is required');
        }

        // STEP 1: Prepare Survey Form Data
        const surveyData = {
          title: survey.title,
          description: survey.description,
          category: survey.category,
          themeColor: survey.branding?.primaryColor || 'var(--bs-primary)',
          questions: questions.map((q, index) => ({
            id: q.id?.toString() || (index + 1).toString(),
            questionText: q.title,
            type: mapQuestionTypeToBackend(q.type),
            options: q.options || [],
            required: q.required || false,
            translations: q.translations || {},
            logicRules: q.logicRules || []
          })),
          settings: {
            isPublic: survey.isPublic,
            isAnonymous: survey.allowAnonymous,
            isPasswordProtected: false,
            password: ''
          },

          // STEP 2: Include Target Audience Data
          // Save selected audience types so they can be restored when editing
          targetAudience: targetAudience, // Array of selected audience IDs

          // STEP 3: Include Schedule/Publish Settings
          // Save publish preferences so user doesn't have to reconfigure
          publishSettings: {
            publishNow: publishSettings.publishNow,
            scheduleDate: publishSettings.scheduleDate || null,
            scheduleTime: publishSettings.scheduleTime || null,
            expiryDate: publishSettings.expiryDate || null,
            maxResponses: publishSettings.maxResponses || null
          },

          // Mark as draft so backend knows this is incomplete
          status: 'draft',

          // Save current step for restoration
          currentStep: currentStep
        };

        let response;
        if (isEditMode && surveyId) {
          // Updating existing draft
          response = await axiosInstance.put(`/surveys/${surveyId}`, surveyData);
        } else {
          // Creating new draft
          response = await axiosInstance.post('/surveys/save-draft', surveyData);
        }

        if (response.data) {
          Swal.fire({
            icon: 'success',
            title: 'Saved as Draft!',
            text: response.data.message || 'Your survey has been saved as draft successfully.',
            timer: 2000,
            showConfirmButton: false
          });

          setTimeout(() => {
            setIsDirty(false);
            navigate('/app/surveys');
          }, 2000);
        }
      } catch (error) {
        console.error('Error saving draft:', error);

        const errorMessage = error.response?.data?.message || error.message || 'Failed to save draft.';

        Swal.fire({
          icon: 'error',
          title: 'Save Failed',
          text: errorMessage
        });
      } finally {
        setSaving(false);
      }
    }
  };

  const renderActionButtons = () => {
    const isSurveyFlow = !isTemplateMode;

    return (
      <div className="flex gap-2 flex-wrap">

        {/* AI Assistant */}
        <button
          type="button"
          onClick={() => setShowAIModal(true)}
          disabled={aiLoadingStates.generating}
          className="inline-flex items-center px-3 py-1.5 text-sm border border-[var(--primary-color)] text-[var(--primary-color)] rounded-lg hover:bg-[var(--primary-color)] hover:text-white transition-colors disabled:opacity-50"
        >
          {aiLoadingStates.generating ? (
            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></span>
          ) : (
            <MdAutoAwesome className="mr-2" />
          )}
          <span className="hidden sm:inline">AI Assistant</span>
        </button>

        {/* Preview */}
        <button
          type="button"
          onClick={() => setShowPreviewModal(true)}
          className="inline-flex items-center px-3 py-1.5 text-sm border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--text-secondary)] rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <MdPreview className="mr-2" />
          <span className="hidden sm:inline">Preview</span>
        </button>

        {/* Survey Flow (Create + Edit) */}
        {isSurveyFlow && (
          <>
            <button
              type="button"
              onClick={() => saveAsDraft()}
              disabled={saving || !survey.title.trim()}
              className="inline-flex items-center px-3 py-1.5 text-sm border border-yellow-500 text-yellow-600 rounded-lg hover:bg-yellow-50 transition-colors disabled:opacity-50"
            >
              <MdSave className="mr-2" /> Save Draft
            </button>

            <button
              type="button"
              onClick={() => {
                if (currentStep < 3 && canProceedToNextStep()) {
                  nextStep();
                } else if (currentStep >= 3) {
                  handleStepWizardComplete();
                }
              }}
              disabled={saving || !canProceedToNextStep()}
              className="inline-flex items-center px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <MdPublish className="mr-2" />
              {currentStep < 3 ? 'Next Step' : (isEditMode ? 'Update Survey' : 'Publish Survey')}
            </button>
          </>
        )}

        {/* Template Flow (Create + Edit) */}
        {isTemplateMode && (
          <>
            <button
              type="button"
              onClick={() => saveSurvey(false)}
              disabled={saving || !survey.title.trim()}
              className="inline-flex items-center px-3 py-1.5 text-sm border border-yellow-500 text-yellow-600 rounded-lg hover:bg-yellow-50 transition-colors disabled:opacity-50"
            >
              <MdSave className="mr-2" /> {isTemplateEditMode ? 'Save Template Draft' : 'Save Template Draft'}
            </button>
            <button
              type="button"
              onClick={() => saveSurvey(true)}
              disabled={saving || !survey.title.trim()}
              className="inline-flex items-center px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <MdPublish className="mr-2" /> {isTemplateEditMode ? 'Update Template' : 'Publish Template'}
            </button>
          </>
        )}

      </div>
    );
  };

  // ✅ FIXED: Enhanced header title with mode info
  const renderHeaderTitle = () => {
    let title = '';
    let subtitle = '';
    let badge = null;

    if (isTemplateMode) {
      if (isTemplateEditMode) {
        title = 'Update Survey Template';
        subtitle = 'Modify an existing survey template';
        badge = <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Update Template</span>;
      } else {
        title = 'Create Survey Template';
        subtitle = 'Create a reusable survey template for tenants';
        badge = <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">New Template</span>;
      }
    } else if (isTemplateBasedSurvey) {
      title = 'Create Survey from Template';
      subtitle = `Using template: ${templateData?.name}`;
      badge = <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Template-based</span>;
    } else if (isEditMode) {
      title = 'Edit Survey';
      subtitle = 'Modify your existing survey';
      badge = <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Editing</span>;
    } else {
      title = 'Create Survey';
      subtitle = 'Build a new survey from scratch or with AI assistance';
      badge = <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-[var(--primary-color)] text-white">New Survey</span>;
    }

    return (
      <div className="mb-3">
        <div className="flex items-center flex-wrap">
          <div className="flex items-center mr-3 mb-2 md:mb-0">
            <MdEdit className="mr-2 text-[var(--primary-color)]" size={32} />
            <h1 className="text-xl font-bold mb-0 text-[var(--light-text)] dark:text-[var(--dark-text)]">{title}</h1>
          </div>
          {badge}
        </div>
        <p className="text-[var(--text-secondary)] mb-0 hidden sm:block">{subtitle}</p>
      </div>
    );
  };

  // Get completion percentage
  // This function calculates the overall progress across all 3 steps of survey creation
  const getCompletionPercentage = () => {
    let stepCompletions = {
      step1: 0, // Survey Form (title, description, questions)
      step2: 0, // Target Audience selection
      step3: 0  // Schedule/Publish settings
    };

    // STEP 1: Survey Form Completion (33.33% total)
    // Check if basic survey information is complete
    let step1Progress = 0;
    let step1Total = 3;

    if (survey.title.trim()) step1Progress++; // Title is required
    if (survey.description.trim()) step1Progress++; // Description is required
    if (questions.length > 0) step1Progress++; // At least one question required

    stepCompletions.step1 = (step1Progress / step1Total) * 33.33;

    // STEP 2: Target Audience Completion (33.33% total)
    // Check if at least one target audience is selected
    if (targetAudience.length > 0) {
      stepCompletions.step2 = 33.33;
    }

    // STEP 3: Schedule/Publish Settings Completion (33.33% total)
    // Check if publish settings are configured
    // If publishNow is true, step is complete
    // If scheduled, check if date and time are set
    if (publishSettings.publishNow) {
      stepCompletions.step3 = 33.33;
    } else if (publishSettings.scheduleDate && publishSettings.scheduleTime) {
      stepCompletions.step3 = 33.33;
    }

    // Calculate total completion percentage
    const totalCompletion = stepCompletions.step1 + stepCompletions.step2 + stepCompletions.step3;

    return Math.round(totalCompletion);
  };

  // Other AI functions
  const suggestNextQuestion = async () => {
    // Implementation remains same as before
  };

  const optimizeSurvey = async () => {
    // Implementation remains same as before
  };

  const translateSurvey = async (targetLanguage) => {
    // Implementation remains same as before
  };

  // ── Validation Helpers ────────────────────────────────────
  const isValidUrl = useCallback((url) => {
    if (!url || !url.trim()) return true; // Optional field
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }, []);

  const isScheduleDatePast = useCallback(() => {
    if (publishSettings.publishNow || !publishSettings.scheduleDate) return false;
    const now = new Date();
    const scheduled = new Date(`${publishSettings.scheduleDate}T${publishSettings.scheduleTime || '00:00'}`);
    return scheduled < now;
  }, [publishSettings]);

  const validateQuestions = useCallback(() => {
    const errors = [];
    const choiceTypes = ['radio', 'checkbox', 'single_choice', 'multiple_choice', 'select', 'ranking', 'imageChoice'];
    questions.forEach((q, index) => {
      if (!q.title || !q.title.trim()) {
        errors.push(`Question ${index + 1}: Title is required`);
      }
      if (choiceTypes.includes(q.type) && (!q.options || q.options.length < 2)) {
        errors.push(`Question ${index + 1}: Must have at least 2 options`);
      }
    });
    return errors;
  }, [questions]);

  // Step Navigation Functions
  const nextStep = () => {
    // Validate before proceeding
    if (currentStep === 1) {
      const qErrors = validateQuestions();
      if (qErrors.length > 0) {
        setValidationErrors(qErrors);
        Swal.fire({
          icon: 'warning',
          title: 'Validation Errors',
          html: qErrors.map(e => `<li style="text-align:left">${e}</li>`).join(''),
          confirmButtonText: 'Fix Issues'
        });
        return;
      }
      if (!isValidUrl(survey.redirectUrl)) {
        Swal.fire({
          icon: 'warning',
          title: 'Invalid URL',
          text: 'Please enter a valid redirect URL (e.g., https://example.com) or leave it empty.',
          confirmButtonText: 'Fix'
        });
        return;
      }
    }
    if (currentStep === 3 && isScheduleDatePast()) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Schedule Date',
        text: 'The schedule date/time is in the past. Please select a future date and time.',
        confirmButtonText: 'Fix'
      });
      return;
    }
    setValidationErrors([]);
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Check if user can proceed to next step based on current step requirements
  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        // STEP 1: Survey form must have title and at least 1 question
        return survey.title.trim() && questions.length > 0;
      case 2:
        // STEP 2: At least one target audience must be selected
        return targetAudience.length > 0;
      case 3:
        // STEP 3: Publish settings must be configured
        // Either publish now OR schedule with date/time
        return publishSettings.publishNow ||
          (publishSettings.scheduleDate && publishSettings.scheduleTime);
      default:
        return false;
    }
  };

  // Check if all 3 steps are completed (for showing "Publish" vs "Complete" button)
  const areAllStepsComplete = () => {
    return survey.title.trim() &&
      questions.length > 0 &&
      targetAudience.length > 0 &&
      (publishSettings.publishNow || (publishSettings.scheduleDate && publishSettings.scheduleTime));
  };

  // Audience management functions — provided by useAudience hook above
  // (fetchAudienceSegments, fetchContactCategories, fetchContacts,
  //  toggleAudience, toggleContactSelection, saveSelectedContacts,
  //  handleContactSearch, handleContactPageChange)

  const normalizeLanguage = (lang) => {
    if (Array.isArray(lang)) {
      const first = lang[0];
      if (first === 'Arabic' || first === 'ar') return 'ar';
      return 'en';
    }
    if (lang === 'Arabic' || lang === 'ar') return 'ar';
    if (lang === 'English' || lang === 'en') return 'en';
    return 'en'; // default
  };


  useEffect(() => {
    const initializeSurveyBuilder = async () => {
      setGlobalLoading(true);
      setLoading(true);

      try {
        // ✅ ADMIN CHECK: Agar admin template use karne try kare to redirect
        if (isTemplateBasedSurvey && user?.role === 'admin') {
          Swal.fire({
            icon: 'warning',
            title: 'Access Restricted',
            text: 'Admins cannot use templates. Please create surveys directly.',
            confirmButtonColor: '#007bff',
          }).then(() => {
            navigate('/app/surveys');
          });
          return;
        }

        // CASE 1: Editing existing survey
        if (isEditing && surveyId && !isTemplateMode) {
          await fetchExistingSurvey(surveyId);
          setShowModeSelector(false);
          setSurveyMode('user-defined');
        }
        // CASE 2: Creating from template
        else if (templateData && !isTemplateMode) {
          initializeFromTemplate(templateData);
          setShowModeSelector(false);
          setSurveyMode('user-defined');
        }
        // CASE 3: Admin editing template
        else if (isTemplateMode && surveyId) {

          // Agar state mein templateData hai → usko use karo
          if (templateData) {
            initializeFromTemplate(templateData); // Reuse existing function
          } else {
            // Warna backend se fetch karo
            await fetchTemplateData(surveyId);
          }

          setShowModeSelector(false);
          setSurveyMode('user-defined');
        }
        // CASE 4: Admin creating new template
        else if (isTemplateMode && !surveyId) {
          setShowModeSelector(false);
          setSurveyMode('ai-assisted');
          setShowAIModal(true);
        }
        // CASE 5: Creating new survey (manual/AI)
        else {
          setShowModeSelector(true);
          setSurveyMode('user-defined');
        }

      } catch (error) {
        console.error('Error initializing survey builder:', error);
        setError(error.message);

        Swal.fire({
          icon: 'error',
          title: 'Initialization Failed',
          text: error.message || 'Failed to load survey data. Please try again.',
          confirmButtonColor: '#dc3545',
        });
      } finally {
        setLoading(false);
        setGlobalLoading(false);
      }
    };

    initializeSurveyBuilder();
  }, [surveyId, isTemplateMode, templateData, isEditing, user, navigate]);

  // Handle Step Wizard Completion - Final Publish
  // This function is called when all 3 steps are complete and user clicks "Publish Survey"
  // It sends the complete survey data (form + audience + schedule) to the backend
  const handleStepWizardComplete = async () => {
    // Validate all steps before publishing
    if (!survey.title.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Information',
        text: 'Survey title is required'
      });
      return;
    }

    if (questions.length === 0) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Information',
        text: 'Please add at least one question'
      });
      return;
    }

    if (targetAudience.length === 0) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Information',
        text: 'Please select at least one target audience'
      });
      return;
    }

    // Confirm publication
    const result = await Swal.fire({
      title: 'Publish Survey?',
      text: `Your survey "${survey.title}" will be published and made available to selected audiences.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: 'var(--bs-success)',
      cancelButtonColor: 'var(--bs-secondary)',
      confirmButtonText: 'Yes, Publish Now!'
    });

    if (!result.isConfirmed) return;

    setSaving(true);
    try {
      // BACKEND API CALL: Create/Publish Survey
      // This combines all 3 steps into one complete survey object
      const completeData = {
        // STEP 1: Survey Form Data
        title: survey.title,
        description: survey.description,
        category: survey.category,
        language: normalizeLanguage(survey.language),
        themeColor: survey.branding?.primaryColor?.startsWith('#')
          ? survey.branding.primaryColor
          : getComputedStyle(document.documentElement)
            .getPropertyValue('--bs-primary')
            .trim(),

        // Questions array
        questions: questions.map((q, index) => ({
          id: q.id?.toString() || (index + 1).toString(),
          questionText: q.title,
          type: mapQuestionTypeToBackend(q.type),
          options: q.options || [],
          required: q.required || false,
          description: q.description || '',
          settings: q.settings || {},
          logicRules: q.logicRules || [],
          translations: q.translations || {},
        })),

        // Survey settings
        settings: {
          isPublic: survey.isPublic,
          isAnonymous: survey.allowAnonymous,
          collectEmail: survey.collectEmail,
          multipleResponses: survey.multipleResponses,
          isPasswordProtected: false,
          password: ''
        },

        // Thank you page
        thankYouPage: {
          message: survey.thankYouMessage,
          redirectUrl: survey.redirectUrl || null
        },

        // Branding
        branding: survey.branding,

        // STEP 2: Target Audience Data
        targetAudience: targetAudience,
        selectedContacts: selectedContacts, // ✅ ADD THIS LINE

        // STEP 3: Schedule/Publish Settings
        // Include when and how to publish
        publishSettings: {
          publishNow: publishSettings.publishNow,
          scheduleDate: publishSettings.scheduleDate || null,
          scheduleTime: publishSettings.scheduleTime || null,
          expiryDate: publishSettings.expiryDate || null,
          maxResponses: publishSettings.maxResponses ? parseInt(publishSettings.maxResponses) : null
        },

        // Set status as published (not draft)
        status: publishSettings.publishNow ? 'active' : 'scheduled',

        // Metadata
        metadata: {
          createdAt: new Date().toISOString(),
          completedSteps: 3,
          totalQuestions: questions.length,
          estimatedCompletionTime: `${Math.ceil(questions.length * 1.5)} minutes`
        }
      };
      console.log('🚀 Publishing Survey with data:', completeData);
      // Call the backend API to create/publish the survey
      let response;
      if (isEditMode && surveyId) {
        // Update existing survey
        response = await axiosInstance.put(`/surveys/${surveyId}`, completeData);
      } else {
        // Create new survey (this is the main publish endpoint)
        response = await axiosInstance.post('/surveys/publish/', completeData);
      }

      if (response.data) {
        Swal.fire({
          icon: 'success',
          title: 'Survey Published!',
          html: `
            <div class="text-start">
              <p><strong>${survey.title}</strong> has been published successfully!</p>
              <ul class="text-muted small">
                <li>📊 ${questions.length} questions</li>
                <li>👥 ${targetAudience.length} target audience(s)</li>
                <li>📅 ${publishSettings.publishNow ? 'Published immediately' : 'Scheduled for ' + publishSettings.scheduleDate}</li>
              </ul>
            </div>
          `,
          timer: 3000,
          showConfirmButton: true,
          confirmButtonText: 'View Surveys'
        }).then(() => {
          navigate('/app/surveys');
        });
      }
    } catch (error) {
      console.error('❌ Error publishing survey:', error);

      const errorMessage = error.response?.data?.message || error.message || 'Failed to publish survey';

      Swal.fire({
        icon: 'error',
        title: 'Publication Failed',
        text: errorMessage,
        confirmButtonColor: '#dc3545'
      });
    } finally {
      setSaving(false);
    }
  };

  // Render Step Content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderSurveyDetailsStep();
      case 2:
        return renderTargetAudienceStep();
      case 3:
        return renderPublishScheduleStep();
      default:
        return renderSurveyDetailsStep();
    }
  };

  if (loading) {
    return (
      <div className="w-full px-4">
        <div className="flex justify-center items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--primary-color)] mx-auto mb-3"></div>
            <h5 className="font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">Loading Survey Builder...</h5>
            <p className="text-[var(--text-secondary)]">Please wait while we initialize the editor.</p>
            <div className="mt-3 text-[var(--text-secondary)] text-sm">
              <div>Mode: {isTemplateMode ? 'Template' : 'Survey'}</div>
              <div>Action: {isEditMode ? 'Editing' : 'Creating'}</div>
              <div>User: {user?.role}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step Component Renderers
  const renderSurveyDetailsStep = () => (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-3">
          <QuestionTypeSidebar
            questionTypes={questionTypes}
            onAddQuestion={addQuestion}
          />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-9">
          {/* Survey Information */}
          <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-xl shadow-sm mb-4">
            <div className="flex items-center p-3 border-b border-[var(--light-border)] dark:border-[var(--dark-border)] font-semibold">
              <MdSettings className="mr-2" />
              <strong>Survey Information</strong>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-8">
                  <div className="mb-3">
                    <label className="block font-semibold mb-1.5">Survey Title *</label>
                    <input
                      type="text"
                      value={survey.title}
                      onChange={(e) => setSurvey({ ...survey, title: e.target.value })}
                      placeholder="Enter survey title..."
                      className="w-full px-4 py-2.5 text-base border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-lg bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="block font-semibold mb-1.5">Description</label>
                    <textarea
                      rows={3}
                      value={survey.description}
                      onChange={(e) => setSurvey({ ...survey, description: e.target.value })}
                      placeholder="Describe the purpose of this survey..."
                      className="w-full px-3 py-2 border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-lg bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="md:col-span-4">
                  <div className="mb-3">
                    <label className="block font-semibold mb-1.5">Category</label>
                    <select
                      value={survey.category}
                      onChange={(e) => setSurvey({ ...survey, category: e.target.value })}
                      className="w-full px-3 py-2 border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-lg bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                    >
                      <option value="">Select Category</option>
                      {industries.map(industry => (
                        <option key={industry.id} value={industry.id}>
                          {industry.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="block font-semibold mb-1.5">Languages</label>
                    <div className="flex gap-3">
                      {[
                        { label: "English", value: "en" },
                        { label: "Arabic", value: "ar" },
                      ].map(lang => (
                        <label key={lang.value} className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="language"
                            checked={survey.language === lang.value}
                            onChange={() =>
                              setSurvey({ ...survey, language: lang.value })
                            }
                            className="accent-[var(--primary-color)]"
                          />
                          <span className="text-sm">{lang.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Responsible User - only shown for surveys, not templates */}
                  {!isTemplateMode && (
                    <div className="mb-3">
                      <ResponsibleUserDropdown
                        value={survey.responsibleUserId}
                        onChange={(userId) => setSurvey({ ...survey, responsibleUserId: userId })}
                        creatorId={user?._id}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Questions Section */}
          <QuestionList
            questions={questions}
            questionTypes={questionTypes}
            onDragEnd={handleOnDragEnd}
            onEdit={(question) => {
              setSelectedQuestion(question);
              setQuestionModalMode('edit');
              setShowQuestionModal(true);
            }}
            onDuplicate={duplicateQuestion}
            onDelete={deleteQuestion}
            onSuggest={suggestNextQuestion}
            onOptimize={optimizeSurvey}
            onGenerateAI={() => setShowAIModal(true)}
            isGeneratingAI={isGeneratingAI}
          />
        </div>

        {/* LOGIC RULES PANEL - Right Sidebar */}
        {/* {currentStep === 1 && (
          <div className="lg:col-span-3">
            <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-xl shadow-sm sticky top-4">
              <div className="flex justify-between items-center p-3 border-b border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--primary-color)] text-white rounded-t-xl">
                <div>
                  <MdCode size={20} />
                  <strong className="ml-2">Logic Rules ({logicRules.length})</strong>
                </div>
                <button type="button" onClick={() => setShowLogicBuilder(true)} className="px-2.5 py-1 text-sm bg-white text-[var(--primary-color)] rounded hover:bg-gray-100 transition-colors">
                  <MdAdd /> Add Rule
                </button>
              </div>
              <div className="p-2">
                {logicRules.length === 0 ? (
                  <div className="text-center py-10 text-[var(--text-secondary)]">
                    <MdCode size={48} className="mb-3 opacity-50 mx-auto" />
                    <p className="text-sm font-bold">No Logic Rules Yet</p>
                    <p className="text-sm">Create conditional branching like Typeform</p>
                    <button type="button" onClick={() => setShowLogicBuilder(true)} className="px-3 py-1.5 text-sm border border-[var(--primary-color)] text-[var(--primary-color)] rounded-lg hover:bg-[var(--primary-color)] hover:text-white transition-colors">
                      <MdAdd /> Create First Rule
                    </button>
                  </div>
                ) : (
                  <div>
                    {logicRules.map((rule, idx) => (
                      <div key={idx} className="mb-2 p-2 border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-lg bg-gray-50 dark:bg-gray-800/50">
                        <div className="flex justify-between">
                          <div>
                            <strong>{rule.name || `Rule ${idx + 1}`}</strong>
                            <span className="px-2 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-800 ml-2">Priority {rule.priority}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setLogicRules(logicRules.filter((_, i) => i !== idx))}
                            className="p-1 border border-red-300 text-red-500 rounded hover:bg-red-50 transition-colors"
                          >
                            <MdDelete size={14} />
                          </button>
                        </div>
                        <small className="text-[var(--text-secondary)]">
                          IF {rule.conditions.items.length} condition(s) ({rule.conditions.logic})
                          → {rule.actions.length} action(s)
                        </small>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )} */}
      </div>
    </div>
  );

  const renderTargetAudienceStep = () => (
    <div>
      <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-xl shadow-sm">
        <div className="p-3 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div className="flex items-center">
            <MdGroup className="mr-2" />
            <strong>Select Target Audience</strong>
          </div>
          <p className="text-muted text-sm mb-0 mt-2">
            Choose who will be able to access and respond to this survey. You can select multiple audience types.
          </p>
        </div>
        <div className="p-4">
          {/* ═══════════════════════════════════════════════════════════════
              AUDIENCE SEGMENTS SECTION (from /api/segments)
          ═══════════════════════════════════════════════════════════════ */}
          <div className="mb-4">
            <h6 className="font-bold mb-3">
              <MdFilterList className="mr-2 inline" />
              Audience Segments (Dynamic)
            </h6>
            <p className="text-muted text-sm mb-3">
              Segments are rule-based groups that automatically include contacts matching specific criteria.
            </p>
            {loadingSegments ? (
              <div className="text-center py-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[var(--primary-color)] mx-auto"></div>
                <p className="text-muted text-sm mt-2">Loading segments...</p>
              </div>
            ) : audienceSegments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {audienceSegments.map((segment) => (
                  <div
                    key={segment._id}
                    className={`h-full cursor-pointer rounded-xl border-2 transition-colors ${targetAudience.includes(`segment_${segment._id}`)
                      ? 'border-[var(--primary-color)] bg-blue-50'
                      : 'border-gray-200'
                      }`}
                    onClick={() => toggleAudience(`segment_${segment._id}`)}
                  >
                    <div className="p-3">
                      <div className="flex items-start">
                        <MdFilterList size={24} className="text-[var(--primary-color)] mr-2 mt-1" />
                        <div className="flex-grow">
                          <h6 className="font-bold mb-1">{segment.name}</h6>
                          <p className="text-muted text-sm mb-2">
                            {segment.description || 'Dynamic audience segment'}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 text-xs font-medium rounded bg-[var(--primary-color)] text-white">
                              {segment.contactCount || 0} contacts
                            </span>
                            <input
                              type="checkbox"
                              checked={targetAudience.includes(`segment_${segment._id}`)}
                              onChange={() => toggleAudience(`segment_${segment._id}`)}
                              onClick={(e) => e.stopPropagation()}
                              className="accent-[var(--primary-color)] w-4 h-4"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                <MdInfo className="mr-2 flex-shrink-0" />
                No audience segments with contacts available. Create segments in Audience Segments page.
              </div>
            )}
          </div>

          <hr />

          {/* ═══════════════════════════════════════════════════════════════
              CONTACT CATEGORIES SECTION (from /api/contact-categories)
          ═══════════════════════════════════════════════════════════════ */}
          <div className="mb-4">
            <h6 className="font-bold mb-3">
              <MdCategory className="mr-2 inline" />
              Contact Categories (Static)
            </h6>
            <p className="text-muted text-sm mb-3">
              Categories are fixed groups where contacts are manually assigned.
            </p>
            {loadingCategories ? (
              <div className="text-center py-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500 mx-auto"></div>
                <p className="text-muted text-sm mt-2">Loading categories...</p>
              </div>
            ) : contactCategories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {contactCategories.map((category) => (
                  <div
                    key={category._id}
                    className={`h-full cursor-pointer rounded-xl border-2 transition-colors ${targetAudience.includes(`category_${category._id}`)
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200'
                      }`}
                    onClick={() => toggleAudience(`category_${category._id}`)}
                  >
                    <div className="p-3">
                      <div className="flex items-start">
                        <MdCategory size={24} className="text-green-500 mr-2 mt-1" />
                        <div className="flex-grow">
                          <h6 className="font-bold mb-1">{category.name}</h6>
                          <p className="text-muted text-sm mb-2">
                            {category.description || `${category.type || 'external'} category`}
                          </p>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="px-2 py-0.5 text-xs font-medium rounded bg-green-500 text-white mr-1">
                                {category.contactCount || 0} contacts
                              </span>
                              {category.type && (
                                <span className="px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-800">
                                  {category.type}
                                </span>
                              )}
                            </div>
                            <input
                              type="checkbox"
                              checked={targetAudience.includes(`category_${category._id}`)}
                              onChange={() => toggleAudience(`category_${category._id}`)}
                              onClick={(e) => e.stopPropagation()}
                              className="accent-green-500 w-4 h-4"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                <MdInfo className="mr-2 flex-shrink-0" />
                No contact categories with contacts available. Assign contacts to categories in Contact Management.
              </div>
            )}
          </div>

          <hr />

          {/* ═══════════════════════════════════════════════════════════════
              CUSTOM CONTACT SELECTION
          ═══════════════════════════════════════════════════════════════ */}
          <div className="mb-4">
            <h6 className="font-bold mb-3">
              <FaUsers className="mr-2 inline" />
              Custom Contact Selection
            </h6>
            <div
              className={`cursor-pointer rounded-xl border-2 transition-colors ${targetAudience.includes('custom')
                ? 'border-yellow-500 bg-yellow-50'
                : 'border-gray-200'
                }`}
              onClick={() => {
                toggleAudience('custom');
                if (!targetAudience.includes('custom')) {
                  setShowCustomContactModal(true);
                }
              }}
            >
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FaUsers size={32} className="text-yellow-500 mr-3" />
                    <div>
                      <h6 className="font-bold mb-1">Select Specific Contacts</h6>
                      <p className="text-muted text-sm mb-0">
                        Choose individual contacts from your contact list
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {selectedContacts.length > 0 && (
                      <span className="px-2 py-0.5 text-xs font-medium rounded bg-yellow-100 text-yellow-800 block mb-2">
                        {selectedContacts.length} selected
                      </span>
                    )}
                    <div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowCustomContactModal(true);
                          fetchContacts(1, '');
                        }}
                        className="inline-flex items-center px-3 py-1.5 text-sm bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                      >
                        <MdEdit className="mr-1" />
                        Select Contacts
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════
              SELECTED AUDIENCES SUMMARY
          ═══════════════════════════════════════════════════════════════ */}
          {targetAudience.length > 0 && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <strong>Selected Audiences ({targetAudience.length}):</strong>
              <div className="mt-2 flex flex-wrap gap-2">
                {targetAudience.map(audienceId => {
                  let label = '';
                  let icon = null;

                  if (audienceId.startsWith('segment_')) {
                    const segmentId = audienceId.replace('segment_', '');
                    const segment = audienceSegments.find(s => s._id === segmentId);
                    label = segment ? `🎯 ${segment.name} (${segment.contactCount})` : audienceId;
                    icon = <MdPeople className="mr-1" />;
                  } else if (audienceId.startsWith('category_')) {
                    const categoryId = audienceId.replace('category_', '');
                    const category = contactCategories.find(c => c._id === categoryId);
                    label = category ? `📁 ${category.name} (${category.contactCount})` : audienceId;
                    icon = <MdHandshake className="mr-1" />;
                  } else if (audienceId === 'custom') {
                    label = `👤 Custom (${selectedContacts.length})`;
                    icon = <FaUsers className="mr-1" />;
                  }

                  return (
                    <span
                      key={audienceId}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-gray-600 text-white"
                    >
                      {icon}{label}
                      <MdClose
                        size={14}
                        className="cursor-pointer hover:text-red-300"
                        onClick={() => toggleAudience(audienceId)}
                      />
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderPublishScheduleStep = () => (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-8">
          <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-xl shadow-sm mb-4">
            <div className="p-3 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <div className="flex items-center">
                <MdSchedule className="mr-2" />
                <strong>Publishing Options</strong>
              </div>
            </div>
            <div className="p-4">
              <div className="mb-4">
                <label className="block font-semibold mb-1.5">When to publish this survey?</label>
                <div className="mt-3">
                  <label className="flex items-center gap-2 cursor-pointer mb-2">
                    <input
                      type="radio"
                      name="publishTiming"
                      checked={publishSettings.publishNow}
                      onChange={() => setPublishSettings({ ...publishSettings, publishNow: true })}
                      className="accent-[var(--primary-color)]"
                    />
                    <span>Publish immediately</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="publishTiming"
                      checked={!publishSettings.publishNow}
                      onChange={() => setPublishSettings({ ...publishSettings, publishNow: false })}
                      className="accent-[var(--primary-color)]"
                    />
                    <span>Schedule for later</span>
                  </label>
                </div>
              </div>

              {!publishSettings.publishNow && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block mb-1.5">Schedule Date</label>
                    <input
                      type="date"
                      value={publishSettings.scheduleDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setPublishSettings({
                        ...publishSettings,
                        scheduleDate: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-lg bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block mb-1.5">Schedule Time</label>
                    <input
                      type="time"
                      value={publishSettings.scheduleTime}
                      onChange={(e) => setPublishSettings({
                        ...publishSettings,
                        scheduleTime: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-lg bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5">Survey Expiry Date (Optional)</label>
                  <input
                    type="date"
                    value={publishSettings.expiryDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setPublishSettings({
                      ...publishSettings,
                      expiryDate: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-lg bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                  />
                  <p className="text-muted text-sm mt-1">Leave blank for no expiry</p>
                </div>
                <div>
                  <label className="block mb-1.5">Maximum Responses (Optional)</label>
                  <input
                    type="number"
                    min="1"
                    value={publishSettings.maxResponses}
                    onChange={(e) => setPublishSettings({
                      ...publishSettings,
                      maxResponses: e.target.value
                    })}
                    placeholder="Unlimited"
                    className="w-full px-3 py-2 border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-lg bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                  />
                  <p className="text-muted text-sm mt-1">Survey will close after reaching this number</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-4">
          <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-xl shadow-sm">
            <div className="p-3 border-b border-[var(--light-border)] dark:border-[var(--dark-border)] font-semibold">
              <strong>Survey Summary</strong>
            </div>
            <div className="p-4">
              <div className="mb-3">
                <strong className="text-[var(--light-text)] dark:text-[var(--dark-text)]">Title:</strong>
                <p className="text-[var(--text-secondary)] mb-2">{survey.title || 'Untitled Survey'}</p>
              </div>

              <div className="mb-3">
                <strong className="text-[var(--light-text)] dark:text-[var(--dark-text)]">Questions:</strong>
                <p className="text-[var(--text-secondary)] mb-2">{questions.length} questions</p>
              </div>

              <div className="mb-3">
                <strong>Target Audience:</strong>
                <div className="mt-1">
                  {targetAudience.length === 0 ? (
                    <p className="text-muted text-sm">No audience selected</p>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {targetAudience.map(audienceId => {
                        let label = audienceId;
                        let icon = null;

                        if (audienceId.startsWith('segment_')) {
                          const segmentId = audienceId.replace('segment_', '');
                          const segment = audienceSegments.find(s => s._id === segmentId);
                          label = segment ? segment.name : 'Unknown Segment';
                          icon = <MdPeople className="mr-1" />;
                        } else if (audienceId.startsWith('category_')) {
                          const categoryId = audienceId.replace('category_', '');
                          const category = contactCategories.find(c => c._id === categoryId);
                          label = category ? category.name : 'Unknown Category';
                          icon = <MdHandshake className="mr-1" />;
                        } else if (audienceId === 'custom') {
                          label = `Custom Contacts (${selectedContacts.length})`;
                          icon = <FaUsers className="mr-1" />;
                        }

                        return (
                          <span key={audienceId} className="inline-flex items-center px-2 py-1 text-xs rounded bg-gray-100 text-gray-800">
                            {icon}{label}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-3">
                <strong className="text-[var(--light-text)] dark:text-[var(--dark-text)]">Category:</strong>
                <p className="text-[var(--text-secondary)] mb-2">
                  {survey.category
                    ? industries.find(i => i.id === survey.category)?.name
                    : 'Not specified'
                  }
                </p>
              </div>

              <div className="mb-3">
                <strong className="text-[var(--light-text)] dark:text-[var(--dark-text)]">Languages:</strong>
                <p className="text-[var(--text-secondary)] mb-2">
                  {survey.language === 'en' ? 'English' : survey.language === 'ar' ? 'Arabic' : survey.language || 'Not specified'}
                </p>
              </div>

              <div className="mb-3">
                <strong className="text-[var(--light-text)] dark:text-[var(--dark-text)]">Publish:</strong>
                <p className="text-[var(--text-secondary)] mb-2">
                  {publishSettings.publishNow
                    ? 'Immediately'
                    : `${publishSettings.scheduleDate} at ${publishSettings.scheduleTime}`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full px-4">
      {/* Header */}
      <div className="mb-4">
        {renderHeaderTitle()}

        {/* Mode Indicator */}
        {/* <div className={`bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-lg p-3 mb-3 ${isTemplateMode ? 'bg-yellow-50' :
          isTemplateBasedSurvey ? 'bg-blue-50' :
            'bg-gray-50'
          }`}>
          <h6 className={`font-bold mb-2 ${isTemplateMode ? 'text-yellow-600' :
            isTemplateBasedSurvey ? 'text-blue-500' :
              'text-[var(--primary-color)]'
            }`}>
            {isTemplateMode ? (
              <>
                <MdBuild className="mr-2 inline" />
                Template Updation Mode
              </>
            ) : isTemplateBasedSurvey ? (
              <>
                <MdContentCopy className="mr-2 inline" />
                Template-based Survey
              </>
            ) : (
              <>
                <MdEdit className="mr-2 inline" />
                Survey Editing Mode
              </>
            )}
          </h6>
          <p className="text-secondary text-sm mb-0">
            {isTemplateMode
              ? 'You are creating/editing a reusable survey template. Changes will affect all future surveys created from this template.'
              : isTemplateBasedSurvey
                ? `You are updating a survey based on the "${templateData?.name}" template. Your changes will not affect the original template.`
                : 'You are updating a survey. Use AI assistance or build manually.'
            }
          </p>
        </div> */}

        {/* Survey Mode Selector - Only for tenant creating new survey without template */}
        {showModeSelector && isCreateMode && !isTemplateMode && (
          <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-lg p-3 mb-3">
            <h6 className="font-bold mb-3 text-[var(--light-text)] dark:text-[var(--dark-text)]">Choose Creation Method</h6>
            <p className="text-[var(--text-secondary)] text-sm mb-3">
              Select how you'd like to create your survey. You'll be guided through a 3-step process: Survey Details → Target Audience → Publish Settings.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className={`h-full cursor-pointer rounded-xl border-2 transition-colors ${surveyMode === 'user-defined' ? 'border-[var(--primary-color)]' : 'border-gray-200'}`}
                onClick={() => {
                  setSurveyMode('user-defined');
                  setShowModeSelector(false);
                }}
              >
                <div className="p-4 text-center">
                  <MdBuild size={48} className="text-[var(--primary-color)] mb-3 mx-auto" />
                  <h6 className="font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">Manual Creation</h6>
                  <p className="text-[var(--text-secondary)] text-sm mb-2">Build your survey step-by-step with full control.</p>
                  <button
                    type="button"
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${surveyMode === 'user-defined'
                      ? 'bg-[var(--primary-color)] text-white'
                      : 'border border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-[var(--primary-color)] hover:text-white'
                      }`}
                  >
                    Start Building
                  </button>
                </div>
              </div>
              <div
                className={`h-full cursor-pointer rounded-xl border-2 transition-colors ${surveyMode === 'ai-assisted' ? 'border-green-500' : 'border-gray-200'}`}
                onClick={() => {
                  setSurveyMode('ai-assisted');
                  setShowAIModal(true);
                  setShowModeSelector(false);
                }}
              >
                <div className="p-4 text-center">
                  <MdSmartToy size={48} className="text-green-500 mb-3 mx-auto" />
                  <h6 className="font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">AI-Powered Creation</h6>
                  <p className="text-[var(--text-secondary)] text-sm mb-3">Let AI generate your survey based on your needs.</p>
                  <button
                    type="button"
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${surveyMode === 'ai-assisted'
                      ? 'bg-green-500 text-white'
                      : 'border border-green-500 text-green-600 hover:bg-green-500 hover:text-white'
                      }`}
                  >
                    Get AI Help
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center flex-wrap py-3">
          {/* Progress Indicator */}
          {!isTemplateMode && (
            <div className="flex items-center gap-3 flex-wrap w-1/2">
              <small className="text-[var(--text-secondary)]">Completion:</small>
              <div className="flex-grow max-w-[200px] h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${getCompletionPercentage() > 80 ? 'bg-green-500' : 'bg-[var(--primary-color)]'}`}
                  style={{ width: `${getCompletionPercentage()}%` }}
                ></div>
              </div>
              <small className="font-semibold">{getCompletionPercentage()}%</small>
            </div>
          )}

          {/* Action Buttons */}
          <div className="header-actions mb-3">
            {renderActionButtons()}
          </div>
        </div>
      </div>

      {/* Step Wizard - Shown for all Survey (non-template) flows: create + edit */}
      {!isTemplateMode && (
        <>
          {/* Step Progress Indicator */}
          <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-xl shadow-sm mb-4">
            <div className="py-3 px-4">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center flex-grow">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${currentStep >= step.id ? 'bg-[var(--primary-color)] text-white' : 'bg-gray-100 text-gray-500'}`}>
                        {step.id}
                      </div>
                      <div className="ml-3">
                        <h6 className={`mb-0 font-medium ${currentStep >= step.id ? 'text-[var(--primary-color)]' : 'text-[var(--text-secondary)]'}`}>
                          {step.title}
                        </h6>
                        <small className="text-[var(--text-secondary)]">{step.description}</small>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className="flex-grow mx-4">
                        <div className={`h-0.5 ${currentStep > step.id ? 'bg-[var(--primary-color)]' : 'bg-gray-300'}`}></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Step Content */}
          <div>
            {renderStepContent()}
          </div>

          {/* Step Navigation */}
          <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-xl shadow-sm mt-4">
            <div className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={previousStep}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <MdArrowBack className="mr-2" />
                      Back
                    </button>
                  )}
                </div>

                <div className="text-center">
                  <small className="text-[var(--text-secondary)]">
                    Step {currentStep} of {steps.length}
                  </small>
                </div>

                <div>
                  {currentStep < steps.length ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      disabled={!canProceedToNextStep()}
                      className="inline-flex items-center px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                      <MdArrowForward className="ml-2" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleStepWizardComplete}
                      disabled={saving || !canProceedToNextStep()}
                      className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Publishing...
                        </>
                      ) : (
                        <>
                          <MdPublish className="mr-2" />
                          {isEditMode ? 'Update Survey' : 'Publish Survey'}
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Template modes use the tabbed builder (no multi-step wizard) */}
      {isTemplateMode && (
        <div className="mt-4">
          {/* Custom Tab Navigation */}
          <div className="flex border-b border-[var(--light-border)] dark:border-[var(--dark-border)] mb-4">
            {[{ key: 'builder', icon: MdEdit, label: 'Builder' }, { key: 'design', icon: FaPalette, label: 'Design' }, { key: 'settings', icon: MdTune, label: 'Settings' }].map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${activeTab === tab.key
                  ? 'border-[var(--primary-color)] text-[var(--primary-color)]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <tab.icon />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Builder Tab Content */}
          {activeTab === 'builder' && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Question Types Sidebar */}
                <div className="lg:col-span-3">
                  <QuestionTypeSidebar
                    questionTypes={questionTypes}
                    onAddQuestion={addQuestion}
                  />
                </div>

                {/* Survey Content */}
                <div className="lg:col-span-9">
                  {/* Survey Header */}
                  <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-xl shadow-sm mb-4">
                    <div className="p-3 border-b border-[var(--light-border)] dark:border-[var(--dark-border)] flex items-center">
                      <MdSettings className="mr-2" />
                      <strong>Survey Information</strong>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-8">
                          <div className="mb-3">
                            <label className="block font-semibold mb-1.5">Survey Title *</label>
                            <input
                              type="text"
                              value={survey.title}
                              onChange={(e) => setSurvey({ ...survey, title: e.target.value })}
                              placeholder="Enter survey title..."
                              className="w-full px-3 py-2.5 text-lg border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-lg bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                            />
                          </div>

                          <div className="mb-3">
                            <label className="block font-semibold mb-1.5">Description</label>
                            <textarea
                              rows={3}
                              value={survey.description}
                              onChange={(e) => setSurvey({ ...survey, description: e.target.value })}
                              placeholder="Describe the purpose of this survey..."
                              className="w-full px-3 py-2 border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-lg bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                            />
                          </div>
                        </div>
                        <div className="md:col-span-4">
                          <div className="mb-3">
                            <label className="block font-semibold mb-1.5">Category</label>
                            <select
                              value={survey.category}
                              onChange={(e) => setSurvey({ ...survey, category: e.target.value })}
                              className="w-full px-3 py-2 border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-lg bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                            >
                              <option value="">Select Category</option>
                              {industries.map(industry => (
                                <option key={industry.id} value={industry.id}>
                                  {industry.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="mb-3">
                            <label className="block font-semibold mb-1.5">Language</label>

                            <div className="flex gap-3">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name="survey-language"
                                  value="en"
                                  checked={survey.language === 'en'}
                                  onChange={(e) =>
                                    setSurvey({ ...survey, language: e.target.value })
                                  }
                                  className="accent-[var(--primary-color)]"
                                />
                                <span>English</span>
                              </label>

                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name="survey-language"
                                  value="ar"
                                  checked={survey.language === 'ar'}
                                  onChange={(e) =>
                                    setSurvey({ ...survey, language: e.target.value })
                                  }
                                  className="accent-[var(--primary-color)]"
                                />
                                <span>Arabic</span>
                              </label>
                            </div>
                          </div>

                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Questions List */}
                  <QuestionList
                    questions={questions}
                    questionTypes={questionTypes}
                    onDragEnd={handleOnDragEnd}
                    onEdit={(question) => {
                      setSelectedQuestion(question);
                      setQuestionModalMode('edit');
                      setShowQuestionModal(true);
                    }}
                    onDuplicate={duplicateQuestion}
                    onDelete={deleteQuestion}
                    onSuggest={suggestNextQuestion}
                    onOptimize={optimizeSurvey}
                    onGenerateAI={() => setShowAIModal(true)}
                    isGeneratingAI={isGeneratingAI}
                  />
                </div>
              </div>
            </>
          )}

          {/* Design Tab */}
          {activeTab === 'design' && (
            <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-xl shadow-sm">
              <div className="p-3 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                <strong>Survey Appearance</strong>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="mb-3">
                      <label className="block mb-1.5">Primary Color</label>
                      <input
                        type="color"
                        value={survey.branding.primaryColor}
                        onChange={(e) => setSurvey({
                          ...survey,
                          branding: { ...survey.branding, primaryColor: e.target.value }
                        })}
                        className="w-full h-10 border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-lg cursor-pointer"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="block mb-1.5">Background Color</label>
                      <input
                        type="color"
                        value={survey.branding.backgroundColor}
                        onChange={(e) => setSurvey({
                          ...survey,
                          branding: { ...survey.branding, backgroundColor: e.target.value }
                        })}
                        className="w-full h-10 border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="survey-preview-mini border rounded-lg p-3" style={{
                      // backgroundColor: survey.branding.backgroundColor,
                      // color: survey.branding.textColor
                    }}>
                      <h5 style={{ color: survey.branding.primaryColor }}>
                        {survey.title || 'Survey Title'}
                      </h5>
                      <p className="text-sm">{survey.description || 'Survey description...'}</p>
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="rounded-full"
                          style={{
                            width: '12px',
                            height: '12px',
                            backgroundColor: survey.branding.primaryColor
                          }}
                        ></div>
                        <small>Sample question</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-xl shadow-sm">
                <div className="p-3 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">Response Settings</div>
                <div className="p-4">
                  <label className="flex items-center gap-3 mb-3 cursor-pointer">
                    <input
                      type="checkbox"
                      role="switch"
                      checked={survey.isPublic}
                      onChange={(e) => setSurvey({ ...survey, isPublic: e.target.checked })}
                      className="w-9 h-5 accent-[var(--primary-color)] rounded-full"
                    />
                    <span>Make survey public</span>
                  </label>

                  <label className="flex items-center gap-3 mb-3 cursor-pointer">
                    <input
                      type="checkbox"
                      role="switch"
                      checked={survey.allowAnonymous}
                      onChange={(e) => setSurvey({ ...survey, allowAnonymous: e.target.checked })}
                      className="w-9 h-5 accent-[var(--primary-color)] rounded-full"
                    />
                    <span>Allow anonymous responses</span>
                  </label>

                  <label className="flex items-center gap-3 mb-3 cursor-pointer">
                    <input
                      type="checkbox"
                      role="switch"
                      checked={survey.multipleResponses}
                      onChange={(e) => setSurvey({ ...survey, multipleResponses: e.target.checked })}
                      className="w-9 h-5 accent-[var(--primary-color)] rounded-full"
                    />
                    <span>Allow multiple responses from same user</span>
                  </label>
                </div>
              </div>

              <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-xl shadow-sm">
                <div className="p-3 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">Completion Settings</div>
                <div className="p-4">
                  <div className="mb-3">
                    <label className="block mb-1.5">Thank You Message</label>
                    <textarea
                      rows={3}
                      value={survey.thankYouMessage}
                      onChange={(e) => setSurvey({ ...survey, thankYouMessage: e.target.value })}
                      className="w-full px-3 py-2 border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-lg bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="block mb-1.5">Redirect URL (Optional)</label>
                    <input
                      type="url"
                      value={survey.redirectUrl}
                      onChange={(e) => setSurvey({ ...survey, redirectUrl: e.target.value })}
                      placeholder="https://example.com"
                      className={`w-full px-3 py-2 border rounded-lg bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent ${survey.redirectUrl && !isValidUrl(survey.redirectUrl)
                        ? 'border-red-500'
                        : 'border-[var(--light-border)] dark:border-[var(--dark-border)]'
                        }`}
                    />
                    {survey.redirectUrl && !isValidUrl(survey.redirectUrl) && (
                      <p className="text-red-500 text-xs mt-1">Please enter a valid URL (e.g., https://example.com)</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI Assistant Modal */}
      {showAIModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowAIModal(false)}>
          <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <h5 className="flex items-center m-0 text-lg font-semibold">
                <MdAutoAwesome className="mr-2 text-[var(--primary-color)]" />
                {isTemplateMode ? 'AI Template Assistant' : 'AI Survey Assistant'}
              </h5>
              <button type="button" onClick={() => setShowAIModal(false)} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                <MdClose size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="mb-3">
                    <label className="block mb-1.5 font-semibold">Industry/Category *</label>
                    <select
                      value={companyProfile.industry}
                      onChange={(e) => {
                        setCompanyProfile({ ...companyProfile, industry: e.target.value });
                      }}
                      className="w-full px-3 py-2 border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-lg bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                    >
                      <option value="">Select Industry</option>
                      {industries.map(industry => (
                        <option key={industry.id} value={industry.id}>
                          {industry.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="block mb-1.5 font-semibold">Products/Services</label>
                    <input
                      type="text"
                      value={companyProfile.products}
                      onChange={(e) => {
                        setCompanyProfile({ ...companyProfile, products: e.target.value });
                      }}
                      placeholder="e.g., Hotel Rooms, Restaurant, Spa"
                      className="w-full px-3 py-2 border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-lg bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                    />
                    <small className="text-[var(--text-secondary)]">
                      Separate multiple items with commas
                    </small>
                  </div>
                </div>

                <div>
                  <div className="mb-3">
                    <label className="block mb-1.5 font-semibold">Target Audience *</label>
                    <select
                      value={companyProfile.targetAudience}
                      onChange={(e) => {
                        setCompanyProfile({ ...companyProfile, targetAudience: e.target.value });
                      }}
                      className="w-full px-3 py-2 border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-lg bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                    >
                      <option value="">Select Audience</option>
                      <option value="customers">Customers</option>
                      <option value="guests">Guests/Visitors</option>
                      <option value="employees">Employees</option>
                      <option value="vendors">Vendors/Partners</option>
                      <option value="students">Students</option>
                      <option value="patients">Patients</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="block mb-1.5 font-semibold">Survey Goal *</label>
                    <textarea
                      rows={2}
                      value={companyProfile.surveyGoal}
                      onChange={(e) => {
                        setCompanyProfile({ ...companyProfile, surveyGoal: e.target.value });
                      }}
                      placeholder="e.g., Customer Satisfaction"
                      className="w-full px-3 py-2 border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-lg bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Advanced AI Configuration */}
              <details className="mb-4 border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-lg">
                <summary className="flex items-center p-3 cursor-pointer hover:bg-gray-50 transition-colors font-medium">
                  <MdTune className="mr-2" />
                  Advanced AI Settings
                </summary>
                <div className="p-4 border-t border-[var(--light-border)] dark:border-[var(--dark-border)]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="mb-3">
                        <label className="block mb-1.5">Question Count</label>
                        <input
                          type="number"
                          min={1}
                          max={15}
                          placeholder="Enter number of questions"
                          value={companyProfile.questionCount}
                          onChange={(e) =>
                            setCompanyProfile({
                              ...companyProfile,
                              questionCount: parseInt(e.target.value) || 0
                            })
                          }
                          className="w-full px-3 py-2 border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-lg bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                        />
                      </div>

                      <div className="mb-3">
                        <label className="block mb-1.5">Survey Tone</label>
                        <select
                          value={companyProfile.tone}
                          onChange={(e) => setCompanyProfile({
                            ...companyProfile,
                            tone: e.target.value
                          })}
                          className="w-full px-3 py-2 border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-lg bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                        >
                          <option value="friendly-professional">Friendly & Professional</option>
                          <option value="formal">Formal</option>
                          <option value="casual">Casual & Relaxed</option>
                          <option value="neutral">Neutral</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <div className="mb-3">
                        <label className="block mb-1.5 font-semibold">Language *</label>

                        {[
                          { label: 'English', value: 'en' },
                          { label: 'Arabic', value: 'ar' }
                        ].map(lang => (
                          <label key={lang.value} className="flex items-center gap-2 mb-2 cursor-pointer">
                            <input
                              type="radio"
                              name="survey-language"
                              value={lang.value}
                              checked={companyProfile.language === lang.value}
                              onChange={(e) =>
                                setCompanyProfile({
                                  ...companyProfile,
                                  language: e.target.value
                                })
                              }
                              className="accent-[var(--primary-color)]"
                            />
                            <span>{lang.label}</span>
                          </label>
                        ))}
                      </div>

                      <div className="mb-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={companyProfile.includeNPS}
                            onChange={(e) => setCompanyProfile({
                              ...companyProfile,
                              includeNPS: e.target.checked
                            })}
                            className="accent-[var(--primary-color)]"
                          />
                          <span>Include NPS Question</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="block mb-1.5">Additional Instructions</label>
                    <textarea
                      rows={4}
                      value={companyProfile.additionalInstructions}
                      onChange={(e) => setCompanyProfile({
                        ...companyProfile,
                        additionalInstructions: e.target.value
                      })}
                      placeholder="Specific requirements, question topics to include/exclude, industry-specific needs..."
                      className="w-full px-3 py-2 border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-lg bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                    />
                  </div>
                </div>
              </details>

              {/* Debug Info */}
              {import.meta.env.DEV && (
                <div className="p-3 mb-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                  <strong>Debug Info:</strong><br />
                  Industry: {companyProfile.industry || 'Not selected'}<br />
                  Products: {companyProfile.products || 'Not specified'}<br />
                  Audience: {companyProfile.targetAudience || 'Not selected'}<br />
                  Goal: {companyProfile.surveyGoal || 'Not specified'}
                </div>
              )}

              <div className="flex items-start p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <FaLightbulb className="mr-2 mt-1 text-blue-500 flex-shrink-0" />
                <div>
                  <strong>AI will generate:</strong>
                  <ul className="mb-0 mt-1 list-disc list-inside">
                    <li>8-12 relevant questions based on your industry</li>
                    <li>Mix of Likert scale, rating, choice, and text questions</li>
                    <li>Hospitality-focused sections (rooms, restaurant, spa, staff)</li>
                    <li>Professional yet friendly tone for guest comfort</li>
                    <li>NPS question for recommendation tracking</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between p-4 border-t border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <div>
                {questions.length > 0 && (
                  <button
                    type="button"
                    onClick={suggestNextQuestion}
                    disabled={aiLoadingStates.suggesting}
                    className="inline-flex items-center px-3 py-2 text-sm border border-green-500 text-green-600 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50"
                  >
                    {aiLoadingStates.suggesting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500 mr-2"></div>
                        Suggesting...
                      </>
                    ) : (
                      <>
                        <MdAdd className="mr-2" />
                        Suggest Question
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAIModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => {
                    generateAISurvey();
                  }}
                  disabled={aiLoadingStates.generating || !companyProfile.industry || !companyProfile.targetAudience}
                  className="inline-flex items-center px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {aiLoadingStates.generating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <MdAutoAwesome className="mr-2" />
                      {isTemplateMode ? 'Generate Template' : 'Generate Complete Survey'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Question Modal */}
      {showQuestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowQuestionModal(false)}>
          <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <h5 className="flex items-center m-0 text-lg font-semibold">
                {questionModalMode === 'create' ? 'Create' : 'Edit'} Question
                {selectedQuestion && (
                  <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-gray-200 text-gray-700 rounded ml-2">
                    {questionTypes.find(qt => qt.id === selectedQuestion.type)?.name}
                  </span>
                )}
              </h5>
              <button type="button" onClick={() => setShowQuestionModal(false)} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                <MdClose size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
              {selectedQuestion && (
                <div>
                  <div className="mb-3">
                    <label className="block mb-1.5">Question Title *</label>
                    <input
                      type="text"
                      value={selectedQuestion.title}
                      onChange={(e) => setSelectedQuestion({ ...selectedQuestion, title: e.target.value })}
                      placeholder="Enter your question..."
                      className="w-full px-3 py-2 border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-lg bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="block mb-1.5">Description (Optional)</label>
                    <textarea
                      rows={2}
                      value={selectedQuestion.description}
                      onChange={(e) => setSelectedQuestion({ ...selectedQuestion, description: e.target.value })}
                      placeholder="Add additional context or instructions..."
                      className="w-full px-3 py-2 border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-lg bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                    />
                  </div>

                  {(selectedQuestion.type === 'single_choice' || selectedQuestion.type === 'multiple_choice') && (
                    <div className="mb-3">
                      <label className="block mb-1.5">Answer Options</label>
                      {selectedQuestion.options.map((option, index) => (
                        <div key={index} className="flex items-center mb-2">
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...selectedQuestion.options];
                              newOptions[index] = e.target.value;
                              setSelectedQuestion({ ...selectedQuestion, options: newOptions });
                            }}
                            placeholder={`Option ${index + 1}`}
                            className="w-full px-3 py-2 border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-lg bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                          />
                          {selectedQuestion.options.length > 2 && (
                            <button
                              type="button"
                              className="ml-2 p-1.5 border border-red-400 text-red-500 rounded hover:bg-red-50 transition-colors"
                              onClick={() => {
                                const newOptions = selectedQuestion.options.filter((_, i) => i !== index);
                                setSelectedQuestion({ ...selectedQuestion, options: newOptions });
                              }}
                            >
                              <MdClose />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const newOptions = [...selectedQuestion.options, `Option ${selectedQuestion.options.length + 1}`];
                          setSelectedQuestion({ ...selectedQuestion, options: newOptions });
                        }}
                        className="inline-flex items-center px-3 py-1.5 text-sm border border-[var(--primary-color)] text-[var(--primary-color)] rounded-lg hover:bg-[var(--primary-color)] hover:text-white transition-colors"
                      >
                        <MdAdd className="mr-1" /> Add Option
                      </button>
                    </div>
                  )}

                  {selectedQuestion.type === 'yes_no' && (
                    <div className="mb-3">
                      <label className="block mb-1.5">Yes/No Options</label>
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={selectedQuestion.options[0] || 'Yes'}
                          onChange={(e) => {
                            const newOptions = [e.target.value, selectedQuestion.options[1] || 'No'];
                            setSelectedQuestion({ ...selectedQuestion, options: newOptions });
                          }}
                          placeholder="Yes option text"
                          className="w-full px-3 py-2 border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-lg bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                        />
                        <input
                          type="text"
                          value={selectedQuestion.options[1] || 'No'}
                          onChange={(e) => {
                            const newOptions = [selectedQuestion.options[0] || 'Yes', e.target.value];
                            setSelectedQuestion({ ...selectedQuestion, options: newOptions });
                          }}
                          placeholder="No option text"
                          className="w-full px-3 py-2 border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-lg bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                        />
                      </div>
                    </div>
                  )}

                  {selectedQuestion.type === 'rating' && (
                    <div className="mb-3">
                      <label className="block mb-1.5">Rating Scale</label>
                      <select
                        value={selectedQuestion.settings?.scale || 5}
                        onChange={(e) => setSelectedQuestion({
                          ...selectedQuestion,
                          settings: { ...selectedQuestion.settings, scale: parseInt(e.target.value) }
                        })}
                        className="w-full px-3 py-2 border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-lg bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                      >
                        <option value={3}>3 Stars</option>
                        <option value={5}>5 Stars</option>
                        <option value={10}>10 Stars</option>
                      </select>
                    </div>
                  )}

                  {selectedQuestion.type === 'likert' && (
                    <div className="mb-3">
                      <label className="block mb-1.5">Likert Scale Options</label>
                      {selectedQuestion.options.map((option, index) => (
                        <div key={index} className="flex items-center mb-2">
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...selectedQuestion.options];
                              newOptions[index] = e.target.value;
                              setSelectedQuestion({ ...selectedQuestion, options: newOptions });
                            }}
                            placeholder={`Scale option ${index + 1}`}
                            className="w-full px-3 py-2 border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-lg bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedQuestion.type === 'nps' && (
                    <div className="mb-3">
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <strong>NPS Scale:</strong> 0-10 rating scale where 0 = "Not at all likely" and 10 = "Extremely likely"
                      </div>
                    </div>
                  )}

                  {(selectedQuestion.type === 'text_short' || selectedQuestion.type === 'text_long') && (
                    <div className="mb-3">
                      <label className="block mb-1.5">Text Input Settings</label>
                      <input
                        type="text"
                        value={selectedQuestion.settings?.placeholder || ''}
                        onChange={(e) => setSelectedQuestion({
                          ...selectedQuestion,
                          settings: { ...selectedQuestion.settings, placeholder: e.target.value }
                        })}
                        placeholder="Placeholder text for input field"
                        className="w-full px-3 py-2 border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-lg bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                      />
                    </div>
                  )}

                  <label className="flex items-center gap-3 mt-3 cursor-pointer">
                    <input
                      type="checkbox"
                      role="switch"
                      checked={selectedQuestion.required}
                      onChange={(e) => setSelectedQuestion({ ...selectedQuestion, required: e.target.checked })}
                      className="w-9 h-5 accent-[var(--primary-color)] rounded-full"
                    />
                    <span>Required Question</span>
                  </label>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 p-4 border-t border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <button
                type="button"
                onClick={() => setShowQuestionModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  updateQuestion(selectedQuestion.id, selectedQuestion);
                  setShowQuestionModal(false);
                }}
                disabled={!selectedQuestion?.title?.trim()}
                className="px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {questionModalMode === 'create' ? 'Create' : 'Save'} Question
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowPreviewModal(false)}>
          <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <h5 className="flex items-center m-0 text-lg font-semibold">
                <MdPreview className="mr-2" />
                Survey Preview
              </h5>
              <button type="button" onClick={() => setShowPreviewModal(false)} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                <MdClose size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
              <div className="survey-preview" style={{
                color: survey.branding.textColor,
                padding: '2rem',
                borderRadius: '8px'
              }}>
                <h3 style={{ color: survey.branding.primaryColor }}>
                  {survey.title || 'Untitled Survey'}
                </h3>
                {survey.description && (
                  <p className="mb-4 text">{survey.description}</p>
                )}

                {questions.map((question, index) => (
                  <div key={question.id} className="mb-4">
                    <div className="flex items-center mb-2 text">
                      <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-[var(--primary-color)] text-white rounded mr-2">Q{index + 1}</span>
                      <strong>{question.title}</strong>
                      {question.required && <span className="text-red-500 ml-1">*</span>}
                    </div>
                    {question.description && (
                      <p className="text-muted text-sm mb-2">{question.description}</p>
                    )}

                    {/* Question Type Preview */}
                    {question.type === 'rating' && (
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(i => (
                          <MdStar key={i} className="text-yellow-400" />
                        ))}
                      </div>
                    )}

                    {(question.type === 'single_choice' || question.type === 'multiple_choice') && (
                      <div>
                        {question.options.map((option, idx) => (
                          <div key={idx} className="flex items-center mb-1">
                            <label className="flex items-center gap-2 cursor-default opacity-60">
                              <input
                                type={question.type === 'single_choice' ? 'radio' : 'checkbox'}
                                name={`preview-${question.id}`}
                                disabled
                                className="accent-[var(--primary-color)]"
                              />
                              <span>{option}</span>
                            </label>
                          </div>
                        ))}
                      </div>
                    )}

                    {question.type.includes('text') && (
                      question.type === 'text_long' ? (
                        <textarea
                          rows={3}
                          placeholder="Your answer here..."
                          disabled
                          className="w-full px-3 py-2 border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-lg bg-gray-50 opacity-60"
                        />
                      ) : (
                        <input
                          type="text"
                          placeholder="Your answer here..."
                          disabled
                          className="w-full px-3 py-2 border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-lg bg-gray-50 opacity-60"
                        />
                      )
                    )}
                  </div>
                ))}

                <div className="text-center mt-4">
                  <button
                    type="button"
                    style={{ backgroundColor: survey.branding.primaryColor }}
                    disabled
                    className="px-6 py-2 text-white rounded-lg opacity-60"
                  >
                    Submit Survey
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Offcanvas */}
      {showSettingsOffcanvas && (
        <div className="fixed inset-0 z-50" onClick={() => setShowSettingsOffcanvas(false)}>
          <div className="absolute inset-0 bg-black/50"></div>
          <div
            className="absolute top-0 right-0 h-full w-full max-w-md bg-[var(--light-card)] dark:bg-[var(--dark-card)] shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <h5 className="flex items-center m-0 text-lg font-semibold">
                <MdSettings className="mr-2" />
                Survey Settings
              </h5>
              <button type="button" onClick={() => setShowSettingsOffcanvas(false)} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                <MdClose size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 overflow-y-auto flex-1">
              <form>
                <h6 className="mb-3">Response Settings</h6>

                <label className="flex items-center gap-3 mb-3 cursor-pointer">
                  <input
                    type="checkbox"
                    role="switch"
                    checked={survey.isPublic}
                    onChange={(e) => setSurvey({ ...survey, isPublic: e.target.checked })}
                    className="w-9 h-5 accent-[var(--primary-color)] rounded-full"
                  />
                  <span>Make survey public</span>
                </label>

                <label className="flex items-center gap-3 mb-3 cursor-pointer">
                  <input
                    type="checkbox"
                    role="switch"
                    checked={survey.allowAnonymous}
                    onChange={(e) => setSurvey({ ...survey, allowAnonymous: e.target.checked })}
                    className="w-9 h-5 accent-[var(--primary-color)] rounded-full"
                  />
                  <span>Allow anonymous responses</span>
                </label>

                <label className="flex items-center gap-3 mb-3 cursor-pointer">
                  <input
                    type="checkbox"
                    role="switch"
                    checked={survey.collectEmail}
                    onChange={(e) => setSurvey({ ...survey, collectEmail: e.target.checked })}
                    className="w-9 h-5 accent-[var(--primary-color)] rounded-full"
                  />
                  <span>Collect email addresses</span>
                </label>

                <label className="flex items-center gap-3 mb-4 cursor-pointer">
                  <input
                    type="checkbox"
                    role="switch"
                    checked={survey.multipleResponses}
                    onChange={(e) => setSurvey({ ...survey, multipleResponses: e.target.checked })}
                    className="w-9 h-5 accent-[var(--primary-color)] rounded-full"
                  />
                  <span>Allow multiple responses from same user</span>
                </label>

                <h6 className="mb-3">Branding</h6>

                <div className="mb-3">
                  <label className="block mb-1.5">Primary Color</label>
                  <input
                    type="color"
                    value={survey.branding.primaryColor}
                    onChange={(e) => setSurvey({
                      ...survey,
                      branding: { ...survey.branding, primaryColor: e.target.value }
                    })}
                    className="w-full h-10 border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-lg cursor-pointer"
                  />
                </div>

                <div className="mb-3">
                  <label className="block mb-1.5">Background Color</label>
                  <input
                    type="color"
                    value={survey.branding.backgroundColor}
                    onChange={(e) => setSurvey({
                      ...survey,
                      branding: { ...survey.branding, backgroundColor: e.target.value }
                    })}
                    className="w-full h-10 border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-lg cursor-pointer"
                  />
                </div>

                <div className="mb-4">
                  <label className="block mb-1.5">Text Color</label>
                  <input
                    type="color"
                    value={survey.branding.textColor}
                    onChange={(e) => setSurvey({
                      ...survey,
                      branding: { ...survey.branding, textColor: e.target.value }
                    })}
                    className="w-full h-10 border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-lg cursor-pointer"
                  />
                </div>

                <h6 className="mb-3">Completion</h6>

                <div className="mb-3">
                  <label className="block mb-1.5">Thank You Message</label>
                  <textarea
                    rows={3}
                    value={survey.thankYouMessage}
                    onChange={(e) => setSurvey({ ...survey, thankYouMessage: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-lg bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                  />
                </div>

                <div className="mb-3">
                  <label className="block mb-1.5">Redirect URL (Optional)</label>
                  <input
                    type="url"
                    value={survey.redirectUrl}
                    onChange={(e) => setSurvey({ ...survey, redirectUrl: e.target.value })}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-lg bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                  />
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ✅ NEW: Custom Contact Selector Modal */}
      {showCustomContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowCustomContactModal(false)}>
          <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <h5 className="flex items-center m-0 text-lg font-semibold">
                <FaUsers className="mr-2" />
                Select Custom Contacts
              </h5>
              <button type="button" onClick={() => setShowCustomContactModal(false)} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                <MdClose size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
              {/* Search Bar */}
              <div className="mb-3">
                <div className="flex items-center border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-lg overflow-hidden">
                  <span className="px-3 py-2 bg-gray-50 border-r border-[var(--light-border)] dark:border-[var(--dark-border)]">
                    <MdGroup />
                  </span>
                  <input
                    type="text"
                    placeholder="Search contacts by name, email, or company..."
                    value={contactSearch}
                    onChange={(e) => handleContactSearch(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none"
                  />
                </div>
              </div>

              {/* Contacts List */}
              {loadingContacts ? (
                <div className="text-center py-5">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-color)] mx-auto"></div>
                  <p className="text-muted mt-2">Loading contacts...</p>
                </div>
              ) : contacts.length > 0 ? (
                <>
                  {/* Selected Count */}
                  {selectedContacts.length > 0 && (
                    <div className="p-3 mb-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <strong>{selectedContacts.length}</strong> contact(s) selected
                    </div>
                  )}

                  {/* Contact List */}
                  <div className="border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-lg" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {contacts.map((contact) => (
                      <div
                        key={contact._id}
                        className="flex items-center p-3 border-b border-[var(--light-border)] dark:border-[var(--dark-border)] last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => toggleContactSelection(contact._id)}
                      >
                        <input
                          type="checkbox"
                          checked={selectedContacts.includes(contact._id)}
                          onChange={() => toggleContactSelection(contact._id)}
                          className="mr-3 accent-[var(--primary-color)]"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex-grow">
                          <div className="font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">{contact.name}</div>
                          <div className="text-[var(--text-secondary)] text-sm">
                            {contact.email && (
                              <span className="mr-3">
                                <MdAlternateEmail size={12} className="mr-1 inline" />
                                {contact.email}
                              </span>
                            )}
                            {contact.company && (
                              <span>
                                <MdBusiness size={12} className="mr-1 inline" />
                                {contact.company}
                              </span>
                            )}
                          </div>
                        </div>
                        {contact.segment && (
                          <span className="inline-flex items-center px-2 py-0.5 text-xs bg-gray-100 text-gray-800 rounded">
                            {contact.segment.name}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {contactTotal > contactLimit && (
                    <div className="flex justify-between items-center mt-3">
                      <div className="text-[var(--text-secondary)] text-sm">
                        Showing {((contactPage - 1) * contactLimit) + 1} to {Math.min(contactPage * contactLimit, contactTotal)} of {contactTotal} contacts
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={contactPage === 1}
                          onClick={() => handleContactPageChange(contactPage - 1)}
                          className="inline-flex items-center px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                        >
                          <MdArrowBack /> Previous
                        </button>
                        <button
                          type="button"
                          disabled={contactPage * contactLimit >= contactTotal}
                          onClick={() => handleContactPageChange(contactPage + 1)}
                          className="inline-flex items-center px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                        >
                          Next <MdArrowForward />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                  {contactSearch ? (
                    <>
                      <MdGroup size={48} className="mb-2 mx-auto text-yellow-500" />
                      <p className="mb-0">No contacts found matching "{contactSearch}"</p>
                    </>
                  ) : (
                    <>
                      <MdGroup size={48} className="mb-2 mx-auto text-yellow-500" />
                      <p className="mb-0">No contacts available. Add contacts in Contact Management.</p>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 p-4 border-t border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <button
                type="button"
                onClick={() => {
                  setShowCustomContactModal(false);
                  setContactSearch('');
                  setContactPage(1);
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <MdClose className="mr-1" />
                Cancel
              </button>
              <button
                type="button"
                onClick={saveSelectedContacts}
                disabled={selectedContacts.length === 0}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <MdSave className="mr-1" />
                Save Selection ({selectedContacts.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SurveyBuilder;
