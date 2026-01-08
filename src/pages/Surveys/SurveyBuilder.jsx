// src/pages/Surveys/SurveyBuilder.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import {
  Container, Row, Col, Card, Button, Badge, Form,
  InputGroup, Modal, Spinner, Alert, Tabs, Tab,
  OverlayTrigger, Tooltip, Accordion, ListGroup,
  ProgressBar, Offcanvas
} from 'react-bootstrap';
import {
  MdAdd, MdClose, MdDelete, MdEdit, MdPreview, MdSave, MdPublish,
  MdDragHandle, MdContentCopy, MdSettings,
  MdStar, MdRadioButtonChecked, MdCheckBox, MdTextFields,
  MdLinearScale, MdDateRange, MdToggleOn,
  MdViewList, MdGridOn, MdSmartToy, MdAutoAwesome,
  MdTune, MdCode, MdBusiness, MdBuild,
  MdSchool, MdLocalHospital, MdHotel, MdSports,
  MdAccountBalance, MdShoppingCart, MdLocationCity,
  MdConstruction, MdDirectionsCar, MdComputer,
  MdOutlineAccessTime, MdEvent, MdBarChart, MdAlternateEmail, MdImage,
  Md123, MdQuestionAnswer, MdPeople, MdGroup, MdHandshake,
  MdSchedule, MdArrowForward, MdArrowBack,
} from 'react-icons/md';
import { MdFilterList, MdCategory, MdInfo } from "react-icons/md";
import { FaUsers, FaLightbulb, FaPalette } from 'react-icons/fa';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';

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

  const [questions, setQuestions] = useState([]);
  const [activeTab, setActiveTab] = useState('builder');
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [questionModalMode, setQuestionModalMode] = useState('create');
  const [showAIModal, setShowAIModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showSettingsOffcanvas, setShowSettingsOffcanvas] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Multi-step Wizard States
  const [currentStep, setCurrentStep] = useState(1);
  const [targetAudience, setTargetAudience] = useState([]);
  const [publishSettings, setPublishSettings] = useState({
    publishNow: true,
    scheduleDate: '',
    scheduleTime: '',
    expiryDate: '',
    maxResponses: '',
    notificationEmails: []
  });

  // ✅ NEW: Target Audience Enhancement States
  const [audienceSegments, setAudienceSegments] = useState([]);
  const [contactCategories, setContactCategories] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [showCustomContactModal, setShowCustomContactModal] = useState(false);
  const [loadingSegments, setLoadingSegments] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingContacts, setLoadingContacts] = useState(false);

  // Contact Modal States
  const [contactSearch, setContactSearch] = useState('');
  const [contactPage, setContactPage] = useState(1);
  const [contactTotal, setContactTotal] = useState(0);
  const [contactLimit] = useState(10);

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

  const industries = [
    { id: 'corporate', name: 'Corporate / HR', icon: MdBusiness },
    { id: 'education', name: 'Education', icon: MdSchool },
    { id: 'healthcare', name: 'Healthcare', icon: MdLocalHospital },
    { id: 'hospitality', name: 'Hospitality & Tourism', icon: MdHotel },
    { id: 'sports', name: 'Sports & Entertainment', icon: MdSports },
    { id: 'banking', name: 'Banking & Financial', icon: MdAccountBalance },
    { id: 'retail', name: 'Retail & E-Commerce', icon: MdShoppingCart },
    { id: 'government', name: 'Government & Public', icon: MdLocationCity },
    { id: 'construction', name: 'Construction & Real Estate', icon: MdConstruction },
    { id: 'automotive', name: 'Automotive & Transport', icon: MdDirectionsCar },
    { id: 'technology', name: 'Technology & Digital', icon: MdComputer }
  ];

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

  // ✅ FIXED: Debug useEffect with correct dependencies
  // useEffect(() => {
  // }, [surveyId, location.state, user, loading, isEditing, isTemplateMode]);


  // useEffect(() => {
  //   const initializeSurveyBuilder = async () => {
  //     setGlobalLoading(true);
  //     setLoading(true);

  //     try {
  //       // ✅ ADMIN CHECK: Agar admin template use karne try kare to redirect
  //       if (isTemplateBasedSurvey && user?.role === 'admin') {
  //         Swal.fire({
  //           icon: 'warning',
  //           title: 'Access Restricted',
  //           text: 'Admins cannot use templates. Please create surveys directly.',
  //           confirmButtonColor: '#007bff',
  //         }).then(() => {
  //           navigate('/app/surveys');
  //         });
  //         return;
  //       }

  //       // CASE 1: Editing existing survey
  //       if (isEditing && surveyId && !isTemplateMode) {
  //         await fetchExistingSurvey(surveyId);
  //         setShowModeSelector(false);
  //         setSurveyMode('user-defined');
  //       }
  //       // CASE 2: Creating from template
  //       else if (templateData && !isTemplateMode) {
  //         initializeFromTemplate(templateData);
  //         setShowModeSelector(false);
  //         setSurveyMode('user-defined');
  //       }
  //       // CASE 3: Admin editing template
  //       else if (isTemplateMode && surveyId) {

  //         // Agar state mein templateData hai → usko use karo
  //         if (templateData) {
  //           initializeFromTemplate(templateData); // Reuse existing function
  //         } else {
  //           // Warna backend se fetch karo
  //           await fetchTemplateData(surveyId);
  //         }

  //         setShowModeSelector(false);
  //         setSurveyMode('user-defined');
  //       }
  //       // CASE 4: Admin creating new template
  //       else if (isTemplateMode && !surveyId) {
  //         setShowModeSelector(false);
  //         setSurveyMode('ai-assisted');
  //         setShowAIModal(true);
  //       }
  //       // CASE 5: Creating new survey (manual/AI)
  //       else {
  //         setShowModeSelector(true);
  //         setSurveyMode('user-defined');
  //       }

  //     } catch (error) {
  //       console.error('Error initializing survey builder:', error);
  //       setError(error.message);

  //       Swal.fire({
  //         icon: 'error',
  //         title: 'Initialization Failed',
  //         text: error.message || 'Failed to load survey data. Please try again.',
  //         confirmButtonColor: '#dc3545',
  //       });
  //     } finally {
  //       setLoading(false);
  //       setGlobalLoading(false);
  //     }
  //   };

  //   initializeSurveyBuilder();
  // }, [surveyId, isTemplateMode, templateData, isEditing, user, navigate]);

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

  // Question Management
  const addQuestion = (type) => {
    const questionType = questionTypes.find(qt => qt.id === type);

    let defaultOptions = [];
    if (type === 'single_choice' || type === 'multiple_choice') {
      defaultOptions = ['Option 1', 'Option 2', 'Option 3'];
    } else if (type === 'yes_no') {
      defaultOptions = ['Yes', 'No'];
    } else if (type === 'likert') {
      defaultOptions = ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'];
    }

    const newQuestion = {
      id: Date.now(),
      type: type,
      title: `New ${questionType.name}`,
      description: '',
      required: false,
      options: defaultOptions,
      settings: type === 'rating' ? { scale: 5 } : type === 'nps' ? { scale: 10 } : {}
    };

    setQuestions([...questions, newQuestion]);
    setSelectedQuestion(newQuestion);
    setQuestionModalMode('create');
    setShowQuestionModal(true);
  };

  const updateQuestion = (questionId, updates) => {
    setQuestions(questions.map(q =>
      q.id === questionId ? { ...q, ...updates } : q
    ));
  };

  const deleteQuestion = (questionId) => {
    Swal.fire({
      title: 'Delete Question?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'var(--bs-danger)',
      cancelButtonColor: 'var(--bs-secondary)',
      confirmButtonText: 'Yes, Delete'
    }).then((result) => {
      if (result.isConfirmed) {
        setQuestions(questions.filter(q => q.id !== questionId));
      }
    });
  };

  const duplicateQuestion = (question) => {
    const duplicated = {
      ...question,
      id: Date.now(),
      title: `${question.title} (Copy)`
    };
    setQuestions([...questions, duplicated]);
  };

  // Drag and Drop Handler
  const handleOnDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(questions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setQuestions(items);
  };

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
          response = await axiosInstance.post(`/surveys/${surveyId}/publish`, surveyData);
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
    const isSurveyFlow = !isTemplateMode; // Survey create or edit (3-step wizard)

    return (
      <div className="d-flex gap-2 flex-wrap">

        {/* AI Assistant */}
        <Button
          variant="outline-primary"
          onClick={() => setShowAIModal(true)}
          disabled={aiLoadingStates.generating}
          size="sm"
          className="d-flex align-items-center"
        >
          {aiLoadingStates.generating ? (
            <Spinner size="sm" className="me-2" />
          ) : (
            <MdAutoAwesome className="me-2" />
          )}
          <span className="d-none d-sm-inline">AI Assistant</span>
        </Button>

        {/* Preview */}
        <Button
          variant="outline-secondary"
          onClick={() => setShowPreviewModal(true)}
          size="sm"
          className="d-flex align-items-center"
        >
          <MdPreview className="me-2" />
          <span className="d-none d-sm-inline">Preview</span>
        </Button>

        {/* Survey Flow (Create + Edit) */}
        {isSurveyFlow && (
          <>
            <Button
              variant="outline-warning"
              onClick={() => saveAsDraft()}
              disabled={saving || !survey.title.trim()}
              size="sm"
              className="d-flex align-items-center"
            >
              <MdSave className="me-2" /> Save Draft
            </Button>

            <Button
              variant="success"
              onClick={() => {
                if (currentStep < 3 && canProceedToNextStep()) {
                  nextStep();
                } else if (currentStep >= 3) {
                  handleStepWizardComplete();
                }
              }}
              disabled={saving || !canProceedToNextStep()}
              size="sm"
              className="d-flex align-items-center"
            >
              <MdPublish className="me-2" />
              {currentStep < 3 ? 'Next Step' : (isEditMode ? 'Update Survey' : 'Publish Survey')}
            </Button>
          </>
        )}

        {/* Template Flow (Create + Edit) */}
        {isTemplateMode && (
          <>
            <Button
              variant="outline-warning"
              onClick={() => saveSurvey(false)}
              disabled={saving || !survey.title.trim()}
              size="sm"
              className="d-flex align-items-center"
            >
              <MdSave className="me-2" /> {isTemplateEditMode ? 'Save Template Draft' : 'Save Template Draft'}
            </Button>
            <Button
              variant="success"
              onClick={() => saveSurvey(true)}
              disabled={saving || !survey.title.trim()}
              size="sm"
              className="d-flex align-items-center"
            >
              <MdPublish className="me-2" /> {isTemplateEditMode ? 'Update Template' : 'Publish Template'}
            </Button>
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
        badge = <Badge bg="warning">Update Template</Badge>;
      } else {
        title = 'Create Survey Template';
        subtitle = 'Create a reusable survey template for tenants';
        badge = <Badge bg="success">New Template</Badge>;
      }
    } else if (isTemplateBasedSurvey) {
      title = 'Create Survey from Template';
      subtitle = `Using template: ${templateData?.name}`;
      badge = <Badge bg="info">Template-based</Badge>;
    } else if (isEditMode) {
      title = 'Edit Survey';
      subtitle = 'Modify your existing survey';
      badge = <Badge bg="warning">Editing</Badge>;
    } else {
      title = 'Create Survey';
      subtitle = 'Build a new survey from scratch or with AI assistance';
      badge = <Badge bg="primary">New Survey</Badge>;
    }

    return (
      <div className="header-title mb-3">
        <div className="d-flex align-items-center flex-wrap">
          <div className="d-flex align-items-center me-3 mb-2 mb-md-0">
            <MdEdit className="me-2 text-primary" size={32} />
            <h1 className="h3 mb-0 fw-bold">{title}</h1>
          </div>
          {badge}
        </div>
        <p className="text-muted mb-0 d-none d-sm-block">{subtitle}</p>
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

  // Step Navigation Functions
  const nextStep = () => {
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

  // ✅ FIXED: Fetch Audience Segments from /api/segments with counts
  const fetchAudienceSegments = async () => {
    try {
      setLoadingSegments(true);
      const response = await axiosInstance.get('/segments?withCounts=true');

      if (response.data?.success && Array.isArray(response.data?.data?.segments)) {
        // Filter only segments with contacts
        const segmentsWithContacts = response.data.data.segments.filter(
          (seg) => (seg.contactCount || 0) > 0
        );
        setAudienceSegments(segmentsWithContacts);
      } else {
        console.warn("Unexpected segments response format:", response.data);
        setAudienceSegments([]);
      }
    } catch (error) {
      console.error('Error fetching audience segments:', error);
      setAudienceSegments([]);
    } finally {
      setLoadingSegments(false);
    }
  };

  // ✅ FIXED: Fetch Contact Categories from /api/contact-categories
  const fetchContactCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await axiosInstance.get('/contact-categories');

      if (response.data?.success && Array.isArray(response.data?.data?.categories)) {
        // Filter only categories with contacts
        const categoriesWithContacts = response.data.data.categories.filter(
          (cat) => (cat.contactCount || 0) > 0
        );
        setContactCategories(categoriesWithContacts);
      } else {
        console.warn("Unexpected categories response format:", response.data);
        setContactCategories([]);
      }
    } catch (error) {
      console.error('Error fetching contact categories:', error);
      setContactCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  // ✅ Load segments and categories when component mounts (skip in template mode)
  useEffect(() => {
    if (user && !isTemplateMode) {
      fetchAudienceSegments();
      fetchContactCategories();
    }
  }, [user, isTemplateMode]);

  // ✅ FIXED: Debug useEffect with correct dependencies
  // useEffect(() => {
  // }, [surveyId, location.state, user, loading, isEditing, isTemplateMode]);


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

  // Target Audience Functions

  const fetchContacts = async (page = 1, search = '') => {
    try {
      setLoadingContacts(true);
      const { data } = await axiosInstance.get('/contacts', {
        params: { page, limit: contactLimit, search }
      });
      console.log('API Response:', data);
      // Backend returns { success, data: { contacts, total, page, limit, totalPages } }
      const contactsData = data?.data?.contacts || data?.contacts || [];
      const totalCount = data?.data?.total ?? data?.total ?? 0;

      setContacts(Array.isArray(contactsData) ? contactsData : []);
      setContactTotal(Number(totalCount));
      setContactPage(page);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoadingContacts(false);
    }
  };
  const normalizeCategories = (responseData = {}) => {
    if (responseData.success && Array.isArray(responseData.segments)) {
      return responseData.segments;
    }
    if (responseData.data?.segments) {
      return responseData.data.segments;
    }
    if (responseData.data?.categories) {
      return responseData.data.categories;
    }
    if (Array.isArray(responseData.data)) {
      return responseData.data;
    }
    if (Array.isArray(responseData)) {
      return responseData;
    }
    return [];
  };

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

  const toggleAudience = (audienceId) => {
    // Handle "custom" selection differently
    if (audienceId === 'custom') {
      setShowCustomContactModal(true);
      // Fetch contacts when opening modal
      fetchContacts(1, '');
      return;
    }

    setTargetAudience(prev =>
      prev.includes(audienceId)
        ? prev.filter(id => id !== audienceId)
        : [...prev, audienceId]
    );
  };

  // ✅ NEW: Handle Contact Selection in Modal
  const toggleContactSelection = (contactId) => {
    setSelectedContacts(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  // ✅ NEW: Save Selected Contacts and Close Modal
  const saveSelectedContacts = () => {
    if (selectedContacts.length > 0) {
      // Add "custom" to target audience if not already added
      if (!targetAudience.includes('custom')) {
        setTargetAudience(prev => [...prev, 'custom']);
      }
    }
    setShowCustomContactModal(false);
  };

  // ✅ NEW: Handle Contact Search
  const handleContactSearch = (searchTerm) => {
    setContactSearch(searchTerm);
    setContactPage(1);
    fetchContacts(1, searchTerm);
  };

  // ✅ NEW: Handle Contact Page Change
  const handleContactPageChange = (newPage) => {
    fetchContacts(newPage, contactSearch);
  };

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
      <Container fluid className="survey-builder">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <Spinner animation="border" variant="primary" className="mb-3" />
            <h5>Loading Survey Builder...</h5>
            <p className="text-muted">Please wait while we initialize the editor.</p>
            <div className="mt-3 text-muted small">
              <div>Mode: {isTemplateMode ? 'Template' : 'Survey'}</div>
              <div>Action: {isEditMode ? 'Editing' : 'Creating'}</div>
              <div>User: {user?.role}</div>
            </div>
          </div>
        </div>
      </Container>
    );
  }

  // Step Component Renderers
  const renderSurveyDetailsStep = () => (
    <div>
      <Row>
        {/* Question Types Sidebar */}
        <Col lg={3}>
          <Card className="sticky-top" style={{ top: '1rem' }}>
            <Card.Header className="d-flex align-items-center">
              <MdAdd className="me-2" />
              <strong>Add Questions</strong>
            </Card.Header>
            <Card.Body className="p-0">
              <Accordion defaultActiveKey={['0']} alwaysOpen>
                {['choice', 'rating', 'text', 'input', 'advanced'].map((category, idx) => (
                  <Accordion.Item eventKey={idx.toString()} key={category}>
                    <Accordion.Header>
                      <span className="text-capitalize fw-semibold">{category} Questions</span>
                    </Accordion.Header>
                    <Accordion.Body className="p-2">
                      {questionTypes
                        .filter(qt => qt.category === category)
                        .map(questionType => (
                          <Card
                            key={questionType.id}
                            className="question-type-card mb-2 border-0 cursor-pointer"
                            onClick={() => addQuestion(questionType.id)}
                          >
                            <Card.Body className="p-3">
                              <div className="d-flex align-items-center mb-2">
                                <questionType.icon
                                  size={20}
                                  style={{ color: questionType.color }}
                                  className="me-2"
                                />
                                <strong className="small">{questionType.name}</strong>
                              </div>
                              <p className="text-muted small mb-1">{questionType.description}</p>
                              <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                {questionType.example}
                              </div>
                            </Card.Body>
                          </Card>
                        ))}
                    </Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
            </Card.Body>
          </Card>
        </Col>

        {/* Main Content */}
        <Col lg={9}>
          {/* Survey Information */}
          <Card className="mb-4">
            <Card.Header className="d-flex align-items-center">
              <MdSettings className="me-2" />
              <strong>Survey Information</strong>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={8}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Survey Title *</Form.Label>
                    <Form.Control
                      type="text"
                      value={survey.title}
                      onChange={(e) => setSurvey({ ...survey, title: e.target.value })}
                      placeholder="Enter survey title..."
                      className="form-control-lg"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={survey.description}
                      onChange={(e) => setSurvey({ ...survey, description: e.target.value })}
                      placeholder="Describe the purpose of this survey..."
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Category</Form.Label>
                    <Form.Select
                      value={survey.category}
                      onChange={(e) => setSurvey({ ...survey, category: e.target.value })}
                    >
                      <option value="">Select Category</option>
                      {industries.map(industry => (
                        <option key={industry.id} value={industry.id}>
                          {industry.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Languages</Form.Label>
                    <div className="d-flex gap-3">
                      {[
                        { label: "English", value: "en" },
                        { label: "Arabic", value: "ar" },
                      ].map(lang => (
                        <Form.Check
                          key={lang.value}
                          type="radio"
                          name="language"
                          label={lang.label}
                          checked={survey.language === lang.value}
                          onChange={() =>
                            setSurvey({ ...survey, language: lang.value })
                          }
                        />
                      ))}
                    </div>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Questions Section */}
          <Card>
            <Card.Header className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <MdViewList className="me-2" />
                <strong>Questions ({questions.length})</strong>
              </div>
              <div className="d-flex align-items-center gap-2">
                {questions.length > 0 && (
                  <>
                    <Button
                      variant="outline-info"
                      size="sm"
                      onClick={suggestNextQuestion}
                      disabled={isGeneratingAI}
                      className="d-flex align-items-center"
                    >
                      <MdAutoAwesome className="me-1" />
                      {isGeneratingAI ? <Spinner size="sm" /> : 'Suggest'}
                    </Button>

                    <Button
                      variant="outline-warning"
                      size="sm"
                      onClick={optimizeSurvey}
                      disabled={isGeneratingAI}
                      className="d-flex align-items-center"
                    >
                      <MdTune className="me-1" />
                      {isGeneratingAI ? <Spinner size="sm" /> : 'Optimize'}
                    </Button>
                  </>
                )}
                {questions.length > 0 && (
                  <small className="text-muted">Drag to reorder</small>
                )}
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              {questions.length === 0 ? (
                <div className="text-center py-5">
                  <MdAdd size={48} className="text-muted mb-3" />
                  <h5>No Questions Yet</h5>
                  <p className="text-muted mb-4">
                    Add questions from the sidebar or use AI to generate a complete survey
                  </p>
                  <Button
                    variant="outline-primary"
                    onClick={() => setShowAIModal(true)}
                    className="d-flex align-items-center mx-auto"
                  >
                    <MdAutoAwesome className="me-2" />
                    Generate with AI
                  </Button>
                </div>
              ) : (
                <DragDropContext onDragEnd={handleOnDragEnd}>
                  <Droppable droppableId="questions">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef}>
                        {questions.map((question, index) => (
                          <Draggable
                            key={question.id}
                            draggableId={question.id.toString()}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`question-item p-3 border-bottom ${snapshot.isDragging ? 'dragging' : ''
                                  }`}
                              >
                                <div className="d-flex align-items-start">
                                  <div
                                    {...provided.dragHandleProps}
                                    className="drag-handle me-3 mt-1"
                                  >
                                    <MdDragHandle className="text-muted" />
                                  </div>

                                  <div className="flex-grow-1">
                                    <div className="d-flex align-items-center mb-2">
                                      <Badge bg="light" text="dark" className="me-2">
                                        Q{index + 1}
                                      </Badge>
                                      {questionTypes.find(qt => qt.id === question.type) && (
                                        <>
                                          {React.createElement(
                                            questionTypes.find(qt => qt.id === question.type).icon,
                                            {
                                              size: 16,
                                              className: 'me-2',
                                              style: {
                                                color: questionTypes.find(qt => qt.id === question.type).color
                                              }
                                            }
                                          )}
                                          <small className="text-muted me-3">
                                            {questionTypes.find(qt => qt.id === question.type).name}
                                          </small>
                                        </>
                                      )}
                                      {question.required && (
                                        <Badge bg="danger" className="me-2">Required</Badge>
                                      )}
                                    </div>

                                    <h6 className="mb-1">{question.title}</h6>
                                    {question.description && (
                                      <p className="text-muted small mb-2">{question.description}</p>
                                    )}

                                    {question.options.length > 0 && (
                                      <div className="mt-2">
                                        {question.type === 'single_choice' || question.type === 'multiple_choice' ? (
                                          <div className="d-flex gap-2 flex-wrap">
                                            {question.options.slice(0, 3).map((option, idx) => (
                                              <Badge key={idx} bg="light" text="dark" className="border">
                                                {option}
                                              </Badge>
                                            ))}
                                            {question.options.length > 3 && (
                                              <Badge bg="light" text="muted">
                                                +{question.options.length - 3} more
                                              </Badge>
                                            )}
                                          </div>
                                        ) : null}
                                      </div>
                                    )}
                                  </div>

                                  <div className="d-flex gap-1 ms-3">
                                    <Button
                                      variant="outline-primary"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedQuestion(question);
                                        setQuestionModalMode('edit');
                                        setShowQuestionModal(true);
                                      }}
                                    >
                                      <MdEdit size={14} />
                                    </Button>

                                    <Button
                                      variant="outline-secondary"
                                      size="sm"
                                      onClick={() => duplicateQuestion(question)}
                                    >
                                      <MdContentCopy size={14} />
                                    </Button>

                                    <Button
                                      variant="outline-danger"
                                      size="sm"
                                      onClick={() => deleteQuestion(question.id)}
                                    >
                                      <MdDelete size={14} />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* LOGIC RULES PANEL - Right Sidebar */}
        {currentStep === 1 && (
          <Col lg={3}>
            <Card className="sticky-top" style={{ top: '1rem' }}>
              <Card.Header className="d-flex justify-content-between align-items-center bg-primary text-white">
                <div>
                  <MdCode size={20} />
                  <strong className="ms-2">Logic Rules ({logicRules.length})</strong>
                </div>
                <Button size="sm" variant="light" onClick={() => setShowLogicBuilder(true)}>
                  <MdAdd /> Add Rule
                </Button>
              </Card.Header>
              <Card.Body className="p-2">
                {logicRules.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <MdCode size={48} className="mb-3 opacity-50" />
                    <p className="small fw-bold">No Logic Rules Yet</p>
                    <p className="small">Create conditional branching like Typeform</p>
                    <Button size="sm" variant="outline-primary" onClick={() => setShowLogicBuilder(true)}>
                      <MdAdd /> Create First Rule
                    </Button>
                  </div>
                ) : (
                  <div>
                    {logicRules.map((rule, idx) => (
                      <Alert key={idx} variant="light" className="mb-2 p-2 border">
                        <div className="d-flex justify-content-between">
                          <div>
                            <strong>{rule.name || `Rule ${idx + 1}`}</strong>
                            <Badge bg="info" className="ms-2">Priority {rule.priority}</Badge>
                          </div>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => setLogicRules(logicRules.filter((_, i) => i !== idx))}
                          >
                            <MdDelete size={14} />
                          </Button>
                        </div>
                        <small className="text-muted">
                          IF {rule.conditions.items.length} condition(s) ({rule.conditions.logic})
                          → {rule.actions.length} action(s)
                        </small>
                      </Alert>
                    ))}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );

  const renderTargetAudienceStep = () => (
    <div>
      <Card>
        <Card.Header>
          <div className="d-flex align-items-center">
            <MdGroup className="me-2" />
            <strong>Select Target Audience</strong>
          </div>
          <p className="text-muted small mb-0 mt-2">
            Choose who will be able to access and respond to this survey. You can select multiple audience types.
          </p>
        </Card.Header>
        <Card.Body>
          {/* ═══════════════════════════════════════════════════════════════
              AUDIENCE SEGMENTS SECTION (from /api/segments)
          ═══════════════════════════════════════════════════════════════ */}
          <div className="mb-4">
            <h6 className="fw-bold mb-3">
              <MdFilterList className="me-2" />
              Audience Segments (Dynamic)
            </h6>
            <p className="text-muted small mb-3">
              Segments are rule-based groups that automatically include contacts matching specific criteria.
            </p>
            {loadingSegments ? (
              <div className="text-center py-3">
                <Spinner animation="border" size="sm" />
                <p className="text-muted small mt-2">Loading segments...</p>
              </div>
            ) : audienceSegments.length > 0 ? (
              <Row>
                {audienceSegments.map((segment) => (
                  <Col md={6} lg={4} key={segment._id} className="mb-3">
                    <Card
                      className={`h-100 cursor-pointer border-2 ${targetAudience.includes(`segment_${segment._id}`)
                        ? 'border-primary bg-primary bg-opacity-10'
                        : 'border-light'
                        }`}
                      onClick={() => toggleAudience(`segment_${segment._id}`)}
                    >
                      <Card.Body>
                        <div className="d-flex align-items-start">
                          <MdFilterList size={24} className="text-primary me-2 mt-1" />
                          <div className="flex-grow-1">
                            <h6 className="fw-bold mb-1">{segment.name}</h6>
                            <p className="text-muted small mb-2">
                              {segment.description || 'Dynamic audience segment'}
                            </p>
                            <div className="d-flex align-items-center justify-content-between">
                              <Badge bg="primary" className="small">
                                {segment.contactCount || 0} contacts
                              </Badge>
                              <Form.Check
                                type="checkbox"
                                checked={targetAudience.includes(`segment_${segment._id}`)}
                                onChange={() => toggleAudience(`segment_${segment._id}`)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <Alert variant="info" className="small">
                <MdInfo className="me-2" />
                No audience segments with contacts available. Create segments in Audience Segments page.
              </Alert>
            )}
          </div>

          <hr />

          {/* ═══════════════════════════════════════════════════════════════
              CONTACT CATEGORIES SECTION (from /api/contact-categories)
          ═══════════════════════════════════════════════════════════════ */}
          <div className="mb-4">
            <h6 className="fw-bold mb-3">
              <MdCategory className="me-2" />
              Contact Categories (Static)
            </h6>
            <p className="text-muted small mb-3">
              Categories are fixed groups where contacts are manually assigned.
            </p>
            {loadingCategories ? (
              <div className="text-center py-3">
                <Spinner animation="border" size="sm" />
                <p className="text-muted small mt-2">Loading categories...</p>
              </div>
            ) : contactCategories.length > 0 ? (
              <Row>
                {contactCategories.map((category) => (
                  <Col md={6} lg={4} key={category._id} className="mb-3">
                    <Card
                      className={`h-100 cursor-pointer border-2 ${targetAudience.includes(`category_${category._id}`)
                        ? 'border-success bg-success bg-opacity-10'
                        : 'border-light'
                        }`}
                      onClick={() => toggleAudience(`category_${category._id}`)}
                    >
                      <Card.Body>
                        <div className="d-flex align-items-start">
                          <MdCategory size={24} className="text-success me-2 mt-1" />
                          <div className="flex-grow-1">
                            <h6 className="fw-bold mb-1">{category.name}</h6>
                            <p className="text-muted small mb-2">
                              {category.description || `${category.type || 'external'} category`}
                            </p>
                            <div className="d-flex align-items-center justify-content-between">
                              <div>
                                <Badge bg="success" className="small me-1">
                                  {category.contactCount || 0} contacts
                                </Badge>
                                {category.type && (
                                  <Badge bg="light" text="dark" className="small">
                                    {category.type}
                                  </Badge>
                                )}
                              </div>
                              <Form.Check
                                type="checkbox"
                                checked={targetAudience.includes(`category_${category._id}`)}
                                onChange={() => toggleAudience(`category_${category._id}`)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <Alert variant="info" className="small">
                <MdInfo className="me-2" />
                No contact categories with contacts available. Assign contacts to categories in Contact Management.
              </Alert>
            )}
          </div>

          <hr />

          {/* ═══════════════════════════════════════════════════════════════
              CUSTOM CONTACT SELECTION
          ═══════════════════════════════════════════════════════════════ */}
          <div className="mb-4">
            <h6 className="fw-bold mb-3">
              <FaUsers className="me-2" />
              Custom Contact Selection
            </h6>
            <Card
              className={`cursor-pointer border-2 ${targetAudience.includes('custom')
                ? 'border-warning bg-warning bg-opacity-10'
                : 'border-light'
                }`}
              onClick={() => {
                toggleAudience('custom');
                if (!targetAudience.includes('custom')) {
                  setShowCustomContactModal(true);
                }
              }}
            >
              <Card.Body>
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center">
                    <FaUsers size={32} className="text-warning me-3" />
                    <div>
                      <h6 className="fw-bold mb-1">Select Specific Contacts</h6>
                      <p className="text-muted small mb-0">
                        Choose individual contacts from your contact list
                      </p>
                    </div>
                  </div>
                  <div className="text-end">
                    {selectedContacts.length > 0 && (
                      <Badge bg="warning" className="mb-2">
                        {selectedContacts.length} selected
                      </Badge>
                    )}
                    <div>
                      <Button
                        variant="warning"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowCustomContactModal(true);
                          fetchContacts(1, '');
                        }}
                      >
                        <MdEdit className="me-1" />
                        Select Contacts
                      </Button>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>

          {/* ═══════════════════════════════════════════════════════════════
              SELECTED AUDIENCES SUMMARY
          ═══════════════════════════════════════════════════════════════ */}
          {targetAudience.length > 0 && (
            <Alert variant="success" className="mt-4">
              <strong>Selected Audiences ({targetAudience.length}):</strong>
              <div className="mt-2 d-flex flex-wrap gap-2">
                {targetAudience.map(audienceId => {
                  let label = '';
                  let icon = null;

                  if (audienceId.startsWith('segment_')) {
                    const segmentId = audienceId.replace('segment_', '');
                    const segment = audienceSegments.find(s => s._id === segmentId);
                    label = segment ? `🎯 ${segment.name} (${segment.contactCount})` : audienceId;
                    icon = <MdPeople className="me-1" />;
                  } else if (audienceId.startsWith('category_')) {
                    const categoryId = audienceId.replace('category_', '');
                    const category = contactCategories.find(c => c._id === categoryId);
                    label = category ? `📁 ${category.name} (${category.contactCount})` : audienceId;
                    icon = <MdHandshake className="me-1" />;
                  } else if (audienceId === 'custom') {
                    label = `👤 Custom (${selectedContacts.length})`;
                    icon = <FaUsers className="me-1" />;
                  }

                  return (
                    <Badge
                      key={audienceId}
                      bg="secondary"
                      className="d-flex align-items-center gap-1"
                    >
                      {icon}{label}
                      <MdClose
                        size={14}
                        className="cursor-pointer"
                        onClick={() => toggleAudience(audienceId)}
                      />
                    </Badge>
                  );
                })}
              </div>
            </Alert>
          )}
        </Card.Body>
      </Card>
    </div>
  );

  const renderPublishScheduleStep = () => (
    <div>
      <Row>
        <Col md={8}>
          <Card className="mb-4">
            <Card.Header>
              <div className="d-flex align-items-center">
                <MdSchedule className="me-2" />
                <strong>Publishing Options</strong>
              </div>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">When to publish this survey?</Form.Label>
                <div className="mt-3">
                  <Form.Check
                    type="radio"
                    id="publish-now"
                    name="publishTiming"
                    label="Publish immediately"
                    checked={publishSettings.publishNow}
                    onChange={() => setPublishSettings({ ...publishSettings, publishNow: true })}
                    className="mb-2"
                  />
                  <Form.Check
                    type="radio"
                    id="schedule-later"
                    name="publishTiming"
                    label="Schedule for later"
                    checked={!publishSettings.publishNow}
                    onChange={() => setPublishSettings({ ...publishSettings, publishNow: false })}
                  />
                </div>
              </Form.Group>

              {!publishSettings.publishNow && (
                <Row className="mb-4">
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Schedule Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={publishSettings.scheduleDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setPublishSettings({
                          ...publishSettings,
                          scheduleDate: e.target.value
                        })}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Schedule Time</Form.Label>
                      <Form.Control
                        type="time"
                        value={publishSettings.scheduleTime}
                        onChange={(e) => setPublishSettings({
                          ...publishSettings,
                          scheduleTime: e.target.value
                        })}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              )}

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Survey Expiry Date (Optional)</Form.Label>
                    <Form.Control
                      type="date"
                      value={publishSettings.expiryDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setPublishSettings({
                        ...publishSettings,
                        expiryDate: e.target.value
                      })}
                    />
                    <Form.Text className="text-muted">
                      Leave blank for no expiry
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Maximum Responses (Optional)</Form.Label>
                    <Form.Control
                      type="number"
                      min="1"
                      value={publishSettings.maxResponses}
                      onChange={(e) => setPublishSettings({
                        ...publishSettings,
                        maxResponses: e.target.value
                      })}
                      placeholder="Unlimited"
                    />
                    <Form.Text className="text-muted">
                      Survey will close after reaching this number
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card>
            <Card.Header>
              <strong>Survey Summary</strong>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <strong>Title:</strong>
                <p className="text-muted mb-2">{survey.title || 'Untitled Survey'}</p>
              </div>

              <div className="mb-3">
                <strong>Questions:</strong>
                <p className="text-muted mb-2">{questions.length} questions</p>
              </div>

              {/* <div className="mb-3">
                <strong>Target Audience:</strong>
                <div className="mt-1">
                  {targetAudience.length === 0 ? (
                    <p className="text-muted small">No audience selected</p>
                  ) : (
                    targetAudience.map(audienceId => {
                      const audience = audienceTypes.find(a => a.id === audienceId);
                      return (
                        <Badge key={audienceId} bg="light" text="dark" className="me-1 mb-1">
                          {audience?.name}
                        </Badge>
                      );
                    })
                  )}
                </div>
              </div> */}


              <div className="mb-3">
                <strong>Target Audience:</strong>
                <div className="mt-1">
                  {targetAudience.length === 0 ? (
                    <p className="text-muted small">No audience selected</p>
                  ) : (
                    <div className="d-flex flex-wrap gap-1">
                      {targetAudience.map(audienceId => {
                        let label = audienceId;
                        let icon = null;

                        if (audienceId.startsWith('segment_')) {
                          const segmentId = audienceId.replace('segment_', '');
                          const segment = audienceSegments.find(s => s._id === segmentId);
                          label = segment ? segment.name : 'Unknown Segment';
                          icon = <MdPeople className="me-1" />;
                        } else if (audienceId.startsWith('category_')) {
                          const categoryId = audienceId.replace('category_', '');
                          const category = contactCategories.find(c => c._id === categoryId);
                          label = category ? category.name : 'Unknown Category';
                          icon = <MdHandshake className="me-1" />;
                        } else if (audienceId === 'custom') {
                          label = `Custom Contacts (${selectedContacts.length})`;
                          icon = <FaUsers className="me-1" />;
                        }

                        return (
                          <Badge key={audienceId} bg="light" text="dark" className="p-2">
                            {icon}{label}
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-3">
                <strong>Category:</strong>
                <p className="text-muted mb-2">
                  {survey.category
                    ? industries.find(i => i.id === survey.category)?.name
                    : 'Not specified'
                  }
                </p>
              </div>

              <div className="mb-3">
                <strong>Languages:</strong>
                <p className="text-muted mb-2">
                  {survey.language === 'en' ? 'English' : survey.language === 'ar' ? 'Arabic' : survey.language || 'Not specified'}
                </p>
              </div>

              <div className="mb-3">
                <strong>Publish:</strong>
                <p className="text-muted mb-2">
                  {publishSettings.publishNow
                    ? 'Immediately'
                    : `${publishSettings.scheduleDate} at ${publishSettings.scheduleTime}`}
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );

  return (
    <Container fluid className="survey-builder">
      {/* Header */}
      <div className="survey-header mb-4">
        {renderHeaderTitle()}

        {/* Mode Indicator */}
        <div className={`rounded p-3 mb-3 ${isTemplateMode ? 'bg-warning bg-opacity-10' :
          isTemplateBasedSurvey ? 'bg-info bg-opacity-10' :
            'bg-light'
          }`}>
          <h6 className={`fw-bold mb-2 ${isTemplateMode ? 'text-warning' :
            isTemplateBasedSurvey ? 'text-info' :
              'text-primary'
            }`}>
            {isTemplateMode ? (
              <>
                <MdBuild className="me-2" />
                Template Updation Mode
              </>
            ) : isTemplateBasedSurvey ? (
              <>
                <MdContentCopy className="me-2" />
                Template-based Survey
              </>
            ) : (
              <>
                <MdEdit className="me-2" />
                Survey Editing Mode
              </>
            )}
          </h6>
          <p className="text-muted small mb-0">
            {isTemplateMode
              ? 'You are creating/editing a reusable survey template. Changes will affect all future surveys created from this template.'
              : isTemplateBasedSurvey
                ? `You are updating a survey based on the "${templateData?.name}" template. Your changes will not affect the original template.`
                : 'You are updating a survey. Use AI assistance or build manually.'
            }
          </p>
        </div>

        {/* Survey Mode Selector - Only for tenant creating new survey without template */}
        {showModeSelector && isCreateMode && !isTemplateMode && (
          <div className="bg-light rounded p-3 mb-3">
            <h6 className="fw-bold mb-3">Choose Creation Method</h6>
            <p className="text-muted small mb-3">
              Select how you'd like to create your survey. You'll be guided through a 3-step process: Survey Details → Target Audience → Publish Settings.
            </p>
            <Row>
              <Col md={6}>
                <Card
                  className={`h-100 cursor-pointer border-2 ${surveyMode === 'user-defined' ? 'border-primary' : 'border-light'}`}
                  onClick={() => {
                    setSurveyMode('user-defined');
                    setShowModeSelector(false);
                  }}
                >
                  <Card.Body className="text-center">
                    <MdBuild size={48} className="text-primary mb-3" />
                    <h6 className="fw-bold">Manual Creation</h6>
                    <p className="text-muted small">Build your survey step-by-step with full control.</p>
                    <Button
                      variant={surveyMode === 'user-defined' ? 'primary' : 'outline-primary'}
                      size="sm"
                    >
                      Start Building
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card
                  className={`h-100 cursor-pointer border-2 ${surveyMode === 'ai-assisted' ? 'border-success' : 'border-light'}`}
                  onClick={() => {
                    setSurveyMode('ai-assisted');
                    setShowAIModal(true);
                    setShowModeSelector(false);
                  }}
                >
                  <Card.Body className="text-center">
                    <MdSmartToy size={48} className="text-success mb-3" />
                    <h6 className="fw-bold">AI-Powered Creation</h6>
                    <p className="text-muted small">Let AI generate your survey based on your needs.</p>
                    <Button
                      variant={surveyMode === 'ai-assisted' ? 'success' : 'outline-success'}
                      size="sm"
                    >
                      Get AI Help
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </div>
        )}

        <div className="d-flex justify-content-between align-items-center flex-wrap py-3">
          {/* Progress Indicator */}
          {!isTemplateMode && (
            <div className="d-flex align-items-center gap-3 flex-wrap w-50">
              <small className="text-muted">Completion:</small>
              <ProgressBar
                now={getCompletionPercentage()}
                className="flex-grow-1"
                style={{ maxWidth: '200px', height: '8px' }}
                variant={getCompletionPercentage() > 80 ? 'success' : 'primary'}
              />
              <small className="fw-semibold">{getCompletionPercentage()}%</small>
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
          <Card className="mb-4">
            <Card.Body className="py-3">
              <div className="d-flex align-items-center justify-content-between">
                {steps.map((step, index) => (
                  <div key={step.id} className="d-flex align-items-center flex-grow-1">
                    <div className={`step-indicator ${currentStep >= step.id ? 'active' : ''}`}>
                      <div className={`step-number ${currentStep >= step.id ? 'bg-primary text-white' : 'bg-light text-muted'}`}>
                        {step.id}
                      </div>
                      <div className="step-content ms-3">
                        <h6 className={`mb-0 ${currentStep >= step.id ? 'text-primary' : 'text-muted'}`}>
                          {step.title}
                        </h6>
                        <small className="text-muted">{step.description}</small>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`step-connector flex-grow-1 mx-4 ${currentStep > step.id ? 'active' : ''}`}>
                        <div className="connector-line"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>

          {/* Step Content */}
          <div className="step-content-container">
            {renderStepContent()}
          </div>

          {/* Step Navigation */}
          <Card className="mt-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  {currentStep > 1 && (
                    <Button
                      variant="outline-secondary"
                      onClick={previousStep}
                      className="d-flex align-items-center"
                    >
                      <MdArrowBack className="me-2" />
                      Back
                    </Button>
                  )}
                </div>

                <div className="text-center">
                  <small className="text-muted">
                    Step {currentStep} of {steps.length}
                  </small>
                </div>

                <div>
                  {currentStep < steps.length ? (
                    <Button
                      variant="primary"
                      onClick={nextStep}
                      disabled={!canProceedToNextStep()}
                      className="d-flex align-items-center"
                    >
                      Next
                      <MdArrowForward className="ms-2" />
                    </Button>
                  ) : (
                    <Button
                      variant="success"
                      onClick={handleStepWizardComplete}
                      disabled={saving || !canProceedToNextStep()}
                      className="d-flex align-items-center"
                    >
                      {saving ? (
                        <>
                          <Spinner size="sm" className="me-2" />
                          Publishing...
                        </>
                      ) : (
                        <>
                          <MdPublish className="me-2" />
                          {isEditMode ? 'Update Survey' : 'Publish Survey'}
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </Card.Body>
          </Card>
        </>
      )}

      {/* Template modes use the tabbed builder (no multi-step wizard) */}
      {isTemplateMode && (
        <div className="mt-4">
          <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4">
            <Tab eventKey="builder" title={
              <span className="d-flex align-items-center">
                <MdEdit className="me-2" />
                Builder
              </span>
            }>
              <Row>
                {/* Question Types Sidebar */}
                <Col lg={3}>
                  <Card className="sticky-top" style={{ top: '1rem' }}>
                    <Card.Header className="d-flex align-items-center">
                      <MdAdd className="me-2" />
                      <strong>Add Questions</strong>
                    </Card.Header>
                    <Card.Body className="p-0">
                      <Accordion defaultActiveKey={['0']} alwaysOpen>
                        {['choice', 'rating', 'text', 'input', 'advanced'].map((category, idx) => (
                          <Accordion.Item eventKey={idx.toString()} key={category}>
                            <Accordion.Header>
                              <span className="text-capitalize fw-semibold">{category} Questions</span>
                            </Accordion.Header>
                            <Accordion.Body className="p-2">
                              {questionTypes
                                .filter(qt => qt.category === category)
                                .map(questionType => (
                                  <Card
                                    key={questionType.id}
                                    className="question-type-card mb-2 border-0 cursor-pointer"
                                    onClick={() => addQuestion(questionType.id)}
                                  >
                                    <Card.Body className="p-3">
                                      <div className="d-flex align-items-center mb-2">
                                        <questionType.icon
                                          size={20}
                                          style={{ color: questionType.color }}
                                          className="me-2"
                                        />
                                        <strong className="small">{questionType.name}</strong>
                                      </div>
                                      <p className="text-muted small mb-1">{questionType.description}</p>
                                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                        {questionType.example}
                                      </div>
                                    </Card.Body>
                                  </Card>
                                ))}
                            </Accordion.Body>
                          </Accordion.Item>
                        ))}
                      </Accordion>
                    </Card.Body>
                  </Card>
                </Col>

                {/* Survey Content */}
                <Col lg={9}>
                  {/* Survey Header */}
                  <Card className="mb-4">
                    <Card.Header className="d-flex align-items-center">
                      <MdSettings className="me-2" />
                      <strong>Survey Information</strong>
                    </Card.Header>
                    <Card.Body>
                      <Row>
                        <Col md={8}>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Survey Title *</Form.Label>
                            <Form.Control
                              type="text"
                              value={survey.title}
                              onChange={(e) => setSurvey({ ...survey, title: e.target.value })}
                              placeholder="Enter survey title..."
                              className="form-control-lg"
                            />
                          </Form.Group>

                          <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Description</Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={3}
                              value={survey.description}
                              onChange={(e) => setSurvey({ ...survey, description: e.target.value })}
                              placeholder="Describe the purpose of this survey..."
                            />
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Category</Form.Label>
                            <Form.Select
                              value={survey.category}
                              onChange={(e) => setSurvey({ ...survey, category: e.target.value })}
                            >
                              <option value="">Select Category</option>
                              {industries.map(industry => (
                                <option key={industry.id} value={industry.id}>
                                  {industry.name}
                                </option>
                              ))}
                            </Form.Select>
                          </Form.Group>

                          <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Language</Form.Label>

                            <div className="d-flex gap-3">
                              <Form.Check
                                type="radio"
                                name="survey-language"
                                id="lang-en"
                                label="English"
                                value="en"
                                checked={survey.language === 'en'}
                                onChange={(e) =>
                                  setSurvey({ ...survey, language: e.target.value })
                                }
                              />

                              <Form.Check
                                type="radio"
                                name="survey-language"
                                id="lang-ar"
                                label="Arabic"
                                value="ar"
                                checked={survey.language === 'ar'}
                                onChange={(e) =>
                                  setSurvey({ ...survey, language: e.target.value })
                                }
                              />
                            </div>
                          </Form.Group>

                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>

                  {/* Questions List */}
                  <Card>
                    <Card.Header className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center">
                        <MdViewList className="me-2" />
                        <strong>Questions ({questions.length})</strong>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        {questions.length > 0 && (
                          <>
                            <OverlayTrigger
                              placement="top"
                              overlay={<Tooltip>Get AI suggestions for next question</Tooltip>}
                            >
                              <Button
                                variant="outline-info"
                                size="sm"
                                onClick={suggestNextQuestion}
                                disabled={isGeneratingAI}
                                className="d-flex align-items-center"
                              >
                                <MdAutoAwesome className="me-1" />
                                {isGeneratingAI ? <Spinner size="sm" /> : 'Suggest'}
                              </Button>
                            </OverlayTrigger>

                            <OverlayTrigger
                              placement="top"
                              overlay={<Tooltip>Analyze and optimize survey structure</Tooltip>}
                            >
                              <Button
                                variant="outline-warning"
                                size="sm"
                                onClick={optimizeSurvey}
                                disabled={isGeneratingAI}
                                className="d-flex align-items-center"
                              >
                                <MdTune className="me-1" />
                                {isGeneratingAI ? <Spinner size="sm" /> : 'Optimize'}
                              </Button>
                            </OverlayTrigger>
                          </>
                        )}
                        {questions.length > 0 && (
                          <small className="text-muted">Drag to reorder</small>
                        )}
                      </div>
                    </Card.Header>
                    <Card.Body className="p-0">
                      {questions.length === 0 ? (
                        <div className="text-center py-5">
                          <MdAdd size={48} className="text-muted mb-3" />
                          <h5>No Questions Yet</h5>
                          <p className="text-muted mb-4">
                            Add questions from the sidebar or use AI to generate a complete survey
                          </p>
                          <Button
                            variant="outline-primary"
                            onClick={() => setShowAIModal(true)}
                            className="d-flex align-items-center mx-auto"
                          >
                            <MdAutoAwesome className="me-2" />
                            Generate with AI
                          </Button>
                        </div>
                      ) : (
                        <DragDropContext onDragEnd={handleOnDragEnd}>
                          <Droppable droppableId="questions">
                            {(provided) => (
                              <div {...provided.droppableProps} ref={provided.innerRef}>
                                {questions.map((question, index) => (
                                  <Draggable
                                    key={question.id}
                                    draggableId={question.id.toString()}
                                    index={index}
                                  >
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        className={`question-item p-3 border-bottom ${snapshot.isDragging ? 'dragging' : ''
                                          }`}
                                      >
                                        <div className="d-flex align-items-start">
                                          <div
                                            {...provided.dragHandleProps}
                                            className="drag-handle me-3 mt-1"
                                          >
                                            <MdDragHandle className="text-muted" />
                                          </div>

                                          <div className="flex-grow-1">
                                            <div className="d-flex align-items-center mb-2">
                                              <Badge bg="light" text="dark" className="me-2">
                                                Q{index + 1}
                                              </Badge>
                                              {questionTypes.find(qt => qt.id === question.type) && (
                                                <>
                                                  {React.createElement(
                                                    questionTypes.find(qt => qt.id === question.type).icon,
                                                    {
                                                      size: 16,
                                                      className: 'me-2',
                                                      style: {
                                                        color: questionTypes.find(qt => qt.id === question.type).color
                                                      }
                                                    }
                                                  )}
                                                  <small className="text-muted me-3">
                                                    {questionTypes.find(qt => qt.id === question.type).name}
                                                  </small>
                                                </>
                                              )}
                                              {question.required && (
                                                <Badge bg="danger" className="me-2">Required</Badge>
                                              )}
                                            </div>

                                            <h6 className="mb-1">{question.title}</h6>
                                            {question.description && (
                                              <p className="text-muted small mb-2">{question.description}</p>
                                            )}

                                            {/* Question Preview */}
                                            {question.options.length > 0 && (
                                              <div className="mt-2">
                                                {question.type === 'single_choice' || question.type === 'multiple_choice' ? (
                                                  <div className="d-flex gap-2 flex-wrap">
                                                    {question.options.slice(0, 3).map((option, idx) => (
                                                      <Badge key={idx} bg="light" text="dark" className="border">
                                                        {option}
                                                      </Badge>
                                                    ))}
                                                    {question.options.length > 3 && (
                                                      <Badge bg="light" text="muted">
                                                        +{question.options.length - 3} more
                                                      </Badge>
                                                    )}
                                                  </div>
                                                ) : null}
                                              </div>
                                            )}
                                          </div>

                                          <div className="d-flex gap-1 ms-3">
                                            <OverlayTrigger
                                              placement="top"
                                              overlay={<Tooltip>Edit Question</Tooltip>}
                                            >
                                              <Button
                                                variant="outline-primary"
                                                size="sm"
                                                onClick={() => {
                                                  setSelectedQuestion(question);
                                                  setQuestionModalMode('edit');
                                                  setShowQuestionModal(true);
                                                }}
                                              >
                                                <MdEdit size={14} />
                                              </Button>
                                            </OverlayTrigger>

                                            <OverlayTrigger
                                              placement="top"
                                              overlay={<Tooltip>Duplicate</Tooltip>}
                                            >
                                              <Button
                                                variant="outline-secondary"
                                                size="sm"
                                                onClick={() => duplicateQuestion(question)}
                                              >
                                                <MdContentCopy size={14} />
                                              </Button>
                                            </OverlayTrigger>

                                            <OverlayTrigger
                                              placement="top"
                                              overlay={<Tooltip>Delete Question</Tooltip>}
                                            >
                                              <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => deleteQuestion(question.id)}
                                              >
                                                <MdDelete size={14} />
                                              </Button>
                                            </OverlayTrigger>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        </DragDropContext>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Tab>

            {/* Design Tab */}
            <Tab eventKey="design" title={
              <span className="d-flex align-items-center">
                <FaPalette className="me-2" />
                Design
              </span>
            }>
              <Card>
                <Card.Header>
                  <strong>Survey Appearance</strong>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Primary Color</Form.Label>
                        <Form.Control
                          type="color"
                          value={survey.branding.primaryColor}
                          onChange={(e) => setSurvey({
                            ...survey,
                            branding: { ...survey.branding, primaryColor: e.target.value }
                          })}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Background Color</Form.Label>
                        <Form.Control
                          type="color"
                          value={survey.branding.backgroundColor}
                          onChange={(e) => setSurvey({
                            ...survey,
                            branding: { ...survey.branding, backgroundColor: e.target.value }
                          })}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <div className="survey-preview-mini border rounded p-3" style={{
                        // backgroundColor: survey.branding.backgroundColor,
                        // color: survey.branding.textColor
                      }}>
                        <h5 style={{ color: survey.branding.primaryColor }}>
                          {survey.title || 'Survey Title'}
                        </h5>
                        <p className="small">{survey.description || 'Survey description...'}</p>
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <div
                            className="rounded-circle"
                            style={{
                              width: '12px',
                              height: '12px',
                              backgroundColor: survey.branding.primaryColor
                            }}
                          ></div>
                          <small>Sample question</small>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Tab>

            {/* Settings Tab */}
            <Tab eventKey="settings" title={
              <span className="d-flex align-items-center">
                <MdTune className="me-2" />
                Settings
              </span>
            }>
              <Row>
                <Col md={6}>
                  <Card className="mb-4">
                    <Card.Header>Response Settings</Card.Header>
                    <Card.Body>
                      <Form.Check
                        type="switch"
                        id="public-survey"
                        label="Make survey public"
                        checked={survey.isPublic}
                        onChange={(e) => setSurvey({ ...survey, isPublic: e.target.checked })}
                        className="mb-3"
                      />

                      <Form.Check
                        type="switch"
                        id="anonymous-responses"
                        label="Allow anonymous responses"
                        checked={survey.allowAnonymous}
                        onChange={(e) => setSurvey({ ...survey, allowAnonymous: e.target.checked })}
                        className="mb-3"
                      />

                      <Form.Check
                        type="switch"
                        id="multiple-responses"
                        label="Allow multiple responses from same user"
                        checked={survey.multipleResponses}
                        onChange={(e) => setSurvey({ ...survey, multipleResponses: e.target.checked })}
                        className="mb-3"
                      />
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6}>
                  <Card className="mb-4">
                    <Card.Header>Completion Settings</Card.Header>
                    <Card.Body>
                      <Form.Group className="mb-3">
                        <Form.Label>Thank You Message</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          value={survey.thankYouMessage}
                          onChange={(e) => setSurvey({ ...survey, thankYouMessage: e.target.value })}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Redirect URL (Optional)</Form.Label>
                        <Form.Control
                          type="url"
                          value={survey.redirectUrl}
                          onChange={(e) => setSurvey({ ...survey, redirectUrl: e.target.value })}
                          placeholder="https://example.com"
                        />
                      </Form.Group>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Tab>
          </Tabs>
        </div>
      )}

      {/* AI Assistant Modal */}
      <Modal
        show={showAIModal}
        onHide={() => setShowAIModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center">
            <MdAutoAwesome className="me-2 text-primary" />
            {isTemplateMode ? 'AI Template Assistant' : 'AI Survey Assistant'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Industry/Category *</Form.Label>
                <Form.Select
                  value={companyProfile.industry}
                  onChange={(e) => {
                    setCompanyProfile({ ...companyProfile, industry: e.target.value });
                  }}
                >
                  <option value="">Select Industry</option>
                  {industries.map(industry => (
                    <option key={industry.id} value={industry.id}>
                      {industry.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Products/Services</Form.Label>
                <Form.Control
                  type="text"
                  value={companyProfile.products}
                  onChange={(e) => {
                    setCompanyProfile({ ...companyProfile, products: e.target.value });
                  }}
                  placeholder="e.g., Hotel Rooms, Restaurant, Spa"
                />
                <Form.Text className="text-muted">
                  Separate multiple items with commas
                </Form.Text>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Target Audience *</Form.Label>
                <Form.Select
                  value={companyProfile.targetAudience}
                  onChange={(e) => {
                    setCompanyProfile({ ...companyProfile, targetAudience: e.target.value });
                  }}
                >
                  <option value="">Select Audience</option>
                  <option value="customers">Customers</option>
                  <option value="guests">Guests/Visitors</option>
                  <option value="employees">Employees</option>
                  <option value="vendors">Vendors/Partners</option>
                  <option value="students">Students</option>
                  <option value="patients">Patients</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Survey Goal *</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={companyProfile.surveyGoal}
                  onChange={(e) => {
                    setCompanyProfile({ ...companyProfile, surveyGoal: e.target.value });
                  }}
                  placeholder="e.g., Customer Satisfaction"
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Advanced AI Configuration */}
          <Accordion className="mb-4">
            <Accordion.Item eventKey="0">
              <Accordion.Header>
                <MdTune className="me-2" />
                Advanced AI Settings
              </Accordion.Header>
              <Accordion.Body>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Question Count</Form.Label>
                      <Form.Control
                        type="number"
                        min={1}
                        max={15} // optional: set your own limit
                        placeholder="Enter number of questions"
                        value={companyProfile.questionCount}
                        onChange={(e) =>
                          setCompanyProfile({
                            ...companyProfile,
                            questionCount: parseInt(e.target.value) || 0
                          })
                        }
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Survey Tone</Form.Label>
                      <Form.Select
                        value={companyProfile.tone}
                        onChange={(e) => setCompanyProfile({
                          ...companyProfile,
                          tone: e.target.value
                        })}
                      >
                        <option value="friendly-professional">Friendly & Professional</option>
                        <option value="formal">Formal</option>
                        <option value="casual">Casual & Relaxed</option>
                        <option value="neutral">Neutral</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">Language *</Form.Label>

                      {[
                        { label: 'English', value: 'en' },
                        { label: 'Arabic', value: 'ar' }
                      ].map(lang => (
                        <Form.Check
                          key={lang.value}
                          type="radio"
                          name="survey-language"
                          id={`lang-${lang.value}`}
                          label={lang.label}
                          value={lang.value}
                          checked={companyProfile.language === lang.value}
                          onChange={(e) =>
                            setCompanyProfile({
                              ...companyProfile,
                              language: e.target.value
                            })
                          }
                        />
                      ))}
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Check
                        type="checkbox"
                        id="include-nps"
                        label="Include NPS Question"
                        checked={companyProfile.includeNPS}
                        onChange={(e) => setCompanyProfile({
                          ...companyProfile,
                          includeNPS: e.target.checked
                        })}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Additional Instructions</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={companyProfile.additionalInstructions}
                    onChange={(e) => setCompanyProfile({
                      ...companyProfile,
                      additionalInstructions: e.target.value
                    })}
                    placeholder="Specific requirements, question topics to include/exclude, industry-specific needs..."
                  />
                </Form.Group>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>

          {/* Debug Info */}
          {import.meta.env.DEV && (
            <Alert variant="info" className="small">
              <strong>Debug Info:</strong><br />
              Industry: {companyProfile.industry || 'Not selected'}<br />
              Products: {companyProfile.products || 'Not specified'}<br />
              Audience: {companyProfile.targetAudience || 'Not selected'}<br />
              Goal: {companyProfile.surveyGoal || 'Not specified'}
            </Alert>
          )}

          <Alert variant="info" className="d-flex align-items-start">
            <FaLightbulb className="me-2 mt-1" />
            <div>
              <strong>AI will generate:</strong>
              <ul className="mb-0 mt-1">
                <li>8-12 relevant questions based on your industry</li>
                <li>Mix of Likert scale, rating, choice, and text questions</li>
                <li>Hospitality-focused sections (rooms, restaurant, spa, staff)</li>
                <li>Professional yet friendly tone for guest comfort</li>
                <li>NPS question for recommendation tracking</li>
              </ul>
            </div>
          </Alert>
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-between">
          <div>
            {questions.length > 0 && (
              <Button
                variant="outline-success"
                onClick={suggestNextQuestion}
                disabled={aiLoadingStates.suggesting}
                size="sm"
              >
                {aiLoadingStates.suggesting ? (
                  <>
                    <Spinner size="sm" className="me-2" />
                    Suggesting...
                  </>
                ) : (
                  <>
                    <MdAdd className="me-2" />
                    Suggest Question
                  </>
                )}
              </Button>
            )}
          </div>

          <div>
            <Button variant="secondary" onClick={() => setShowAIModal(false)} className="me-2">
              Cancel
            </Button>

            <Button
              variant="primary"
              onClick={() => {
                generateAISurvey();
              }}
              disabled={aiLoadingStates.generating || !companyProfile.industry || !companyProfile.targetAudience}
            >
              {aiLoadingStates.generating ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Generating...
                </>
              ) : (
                <>
                  <MdAutoAwesome className="me-2" />
                  {isTemplateMode ? 'Generate Template' : 'Generate Complete Survey'}
                </>
              )}
            </Button>
          </div>
        </Modal.Footer>
      </Modal>

      {/* Question Modal */}
      <Modal
        show={showQuestionModal}
        onHide={() => setShowQuestionModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {questionModalMode === 'create' ? 'Create' : 'Edit'} Question
            {selectedQuestion && (
              <Badge bg="secondary" className="ms-2">
                {questionTypes.find(qt => qt.id === selectedQuestion.type)?.name}
              </Badge>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedQuestion && (
            <div>
              <Form.Group className="mb-3">
                <Form.Label>Question Title *</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedQuestion.title}
                  onChange={(e) => setSelectedQuestion({ ...selectedQuestion, title: e.target.value })}
                  placeholder="Enter your question..."
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Description (Optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={selectedQuestion.description}
                  onChange={(e) => setSelectedQuestion({ ...selectedQuestion, description: e.target.value })}
                  placeholder="Add additional context or instructions..."
                />
              </Form.Group>

              {(selectedQuestion.type === 'single_choice' || selectedQuestion.type === 'multiple_choice') && (
                <div className="mb-3">
                  <Form.Label>Answer Options</Form.Label>
                  {selectedQuestion.options.map((option, index) => (
                    <div key={index} className="d-flex align-items-center mb-2">
                      <Form.Control
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...selectedQuestion.options];
                          newOptions[index] = e.target.value;
                          setSelectedQuestion({ ...selectedQuestion, options: newOptions });
                        }}
                        placeholder={`Option ${index + 1}`}
                      />
                      {selectedQuestion.options.length > 2 && (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="ms-2"
                          onClick={() => {
                            const newOptions = selectedQuestion.options.filter((_, i) => i !== index);
                            setSelectedQuestion({ ...selectedQuestion, options: newOptions });
                          }}
                        >
                          <MdClose />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => {
                      const newOptions = [...selectedQuestion.options, `Option ${selectedQuestion.options.length + 1}`];
                      setSelectedQuestion({ ...selectedQuestion, options: newOptions });
                    }}
                  >
                    <MdAdd className="me-1" /> Add Option
                  </Button>
                </div>
              )}

              {selectedQuestion.type === 'yes_no' && (
                <div className="mb-3">
                  <Form.Label>Yes/No Options</Form.Label>
                  <div className="d-flex gap-3">
                    <Form.Control
                      type="text"
                      value={selectedQuestion.options[0] || 'Yes'}
                      onChange={(e) => {
                        const newOptions = [e.target.value, selectedQuestion.options[1] || 'No'];
                        setSelectedQuestion({ ...selectedQuestion, options: newOptions });
                      }}
                      placeholder="Yes option text"
                    />
                    <Form.Control
                      type="text"
                      value={selectedQuestion.options[1] || 'No'}
                      onChange={(e) => {
                        const newOptions = [selectedQuestion.options[0] || 'Yes', e.target.value];
                        setSelectedQuestion({ ...selectedQuestion, options: newOptions });
                      }}
                      placeholder="No option text"
                    />
                  </div>
                </div>
              )}

              {selectedQuestion.type === 'rating' && (
                <div className="mb-3">
                  <Form.Label>Rating Scale</Form.Label>
                  <Form.Select
                    value={selectedQuestion.settings?.scale || 5}
                    onChange={(e) => setSelectedQuestion({
                      ...selectedQuestion,
                      settings: { ...selectedQuestion.settings, scale: parseInt(e.target.value) }
                    })}
                  >
                    <option value={3}>3 Stars</option>
                    <option value={5}>5 Stars</option>
                    <option value={10}>10 Stars</option>
                  </Form.Select>
                </div>
              )}

              {selectedQuestion.type === 'likert' && (
                <div className="mb-3">
                  <Form.Label>Likert Scale Options</Form.Label>
                  {selectedQuestion.options.map((option, index) => (
                    <div key={index} className="d-flex align-items-center mb-2">
                      <Form.Control
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...selectedQuestion.options];
                          newOptions[index] = e.target.value;
                          setSelectedQuestion({ ...selectedQuestion, options: newOptions });
                        }}
                        placeholder={`Scale option ${index + 1}`}
                      />
                    </div>
                  ))}
                </div>
              )}

              {selectedQuestion.type === 'nps' && (
                <div className="mb-3">
                  <Alert variant="info">
                    <strong>NPS Scale:</strong> 0-10 rating scale where 0 = "Not at all likely" and 10 = "Extremely likely"
                  </Alert>
                </div>
              )}

              {(selectedQuestion.type === 'text_short' || selectedQuestion.type === 'text_long') && (
                <div className="mb-3">
                  <Form.Label>Text Input Settings</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedQuestion.settings?.placeholder || ''}
                    onChange={(e) => setSelectedQuestion({
                      ...selectedQuestion,
                      settings: { ...selectedQuestion.settings, placeholder: e.target.value }
                    })}
                    placeholder="Placeholder text for input field"
                  />
                </div>
              )}

              <Form.Check
                type="switch"
                id="required-question"
                label="Required Question"
                checked={selectedQuestion.required}
                onChange={(e) => setSelectedQuestion({ ...selectedQuestion, required: e.target.checked })}
                className="mt-3"
              />
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowQuestionModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              updateQuestion(selectedQuestion.id, selectedQuestion);
              setShowQuestionModal(false);
            }}
            disabled={!selectedQuestion?.title?.trim()}
          >
            {questionModalMode === 'create' ? 'Create' : 'Save'} Question
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Preview Modal */}
      <Modal
        show={showPreviewModal}
        onHide={() => setShowPreviewModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center">
            <MdPreview className="me-2" />
            Survey Preview
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="survey-preview" style={{
            // backgroundColor: survey.branding.backgroundColor,
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
                <div className="d-flex align-items-center mb-2 text">
                  <Badge bg="primary" className="me-2">Q{index + 1}</Badge>
                  <strong>{question.title}</strong>
                  {question.required && <span className="text-danger ms-1">*</span>}
                </div>
                {question.description && (
                  <p className="text-muted small mb-2">{question.description}</p>
                )}

                {/* Question Type Preview */}
                {question.type === 'rating' && (
                  <div className="d-flex gap-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <MdStar key={i} className="text-warning" />
                    ))}
                  </div>
                )}

                {(question.type === 'single_choice' || question.type === 'multiple_choice') && (
                  <div>
                    {question.options.map((option, idx) => (
                      <div key={idx} className="d-flex align-items-center mb-1">
                        <Form.Check
                          type={question.type === 'single_choice' ? 'radio' : 'checkbox'}
                          name={`preview-${question.id}`}
                          label={option}
                          disabled
                        />
                      </div>
                    ))}
                  </div>
                )}

                {question.type.includes('text') && (
                  <Form.Control
                    as={question.type === 'text_long' ? 'textarea' : 'input'}
                    rows={question.type === 'text_long' ? 3 : undefined}
                    placeholder="Your answer here..."
                    disabled
                  />
                )}
              </div>
            ))}

            <div className="text-center mt-4">
              <Button
                style={{ backgroundColor: survey.branding.primaryColor }}
                disabled
              >
                Submit Survey
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* Settings Offcanvas */}
      <Offcanvas
        show={showSettingsOffcanvas}
        onHide={() => setShowSettingsOffcanvas(false)}
        placement="end"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title className="d-flex align-items-center">
            <MdSettings className="me-2" />
            Survey Settings
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Form>
            <h6 className="mb-3">Response Settings</h6>

            <Form.Check
              type="switch"
              id="public-survey-off"
              label="Make survey public"
              checked={survey.isPublic}
              onChange={(e) => setSurvey({ ...survey, isPublic: e.target.checked })}
              className="mb-3"
            />

            <Form.Check
              type="switch"
              id="anonymous-responses-off"
              label="Allow anonymous responses"
              checked={survey.allowAnonymous}
              onChange={(e) => setSurvey({ ...survey, allowAnonymous: e.target.checked })}
              className="mb-3"
            />

            <Form.Check
              type="switch"
              id="collect-email-off"
              label="Collect email addresses"
              checked={survey.collectEmail}
              onChange={(e) => setSurvey({ ...survey, collectEmail: e.target.checked })}
              className="mb-3"
            />

            <Form.Check
              type="switch"
              id="multiple-responses-off"
              label="Allow multiple responses from same user"
              checked={survey.multipleResponses}
              onChange={(e) => setSurvey({ ...survey, multipleResponses: e.target.checked })}
              className="mb-4"
            />

            <h6 className="mb-3">Branding</h6>

            <Form.Group className="mb-3">
              <Form.Label>Primary Color</Form.Label>
              <Form.Control
                type="color"
                value={survey.branding.primaryColor}
                onChange={(e) => setSurvey({
                  ...survey,
                  branding: { ...survey.branding, primaryColor: e.target.value }
                })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Background Color</Form.Label>
              <Form.Control
                type="color"
                value={survey.branding.backgroundColor}
                onChange={(e) => setSurvey({
                  ...survey,
                  branding: { ...survey.branding, backgroundColor: e.target.value }
                })}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Text Color</Form.Label>
              <Form.Control
                type="color"
                value={survey.branding.textColor}
                onChange={(e) => setSurvey({
                  ...survey,
                  branding: { ...survey.branding, textColor: e.target.value }
                })}
              />
            </Form.Group>

            <h6 className="mb-3">Completion</h6>

            <Form.Group className="mb-3">
              <Form.Label>Thank You Message</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={survey.thankYouMessage}
                onChange={(e) => setSurvey({ ...survey, thankYouMessage: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Redirect URL (Optional)</Form.Label>
              <Form.Control
                type="url"
                value={survey.redirectUrl}
                onChange={(e) => setSurvey({ ...survey, redirectUrl: e.target.value })}
                placeholder="https://example.com"
              />
            </Form.Group>
          </Form>
        </Offcanvas.Body>
      </Offcanvas>

      {/* ✅ NEW: Custom Contact Selector Modal */}
      <Modal
        show={showCustomContactModal}
        onHide={() => setShowCustomContactModal(false)}
        size="lg"
        backdrop="static"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FaUsers className="me-2" />
            Select Custom Contacts
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Search Bar */}
          <Form.Group className="mb-3">
            <InputGroup>
              <InputGroup.Text>
                <MdGroup />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search contacts by name, email, or company..."
                value={contactSearch}
                onChange={(e) => handleContactSearch(e.target.value)}
              />
            </InputGroup>
          </Form.Group>

          {/* Contacts List */}
          {loadingContacts ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="text-muted mt-2">Loading contacts...</p>
            </div>
          ) : contacts.length > 0 ? (
            <>
              {/* Selected Count */}
              {selectedContacts.length > 0 && (
                <Alert variant="info" className="mb-3">
                  <strong>{selectedContacts.length}</strong> contact(s) selected
                </Alert>
              )}

              {/* Contact List */}
              <div className="border rounded" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <ListGroup variant="flush">
                  {contacts.map((contact) => (
                    <ListGroup.Item
                      key={contact._id}
                      className="d-flex align-items-center cursor-pointer"
                      onClick={() => toggleContactSelection(contact._id)}
                    >
                      <Form.Check
                        type="checkbox"
                        checked={selectedContacts.includes(contact._id)}
                        onChange={() => toggleContactSelection(contact._id)}
                        className="me-3"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-grow-1">
                        <div className="fw-bold">{contact.name}</div>
                        <div className="text-muted small">
                          {contact.email && (
                            <span className="me-3">
                              <MdAlternateEmail size={12} className="me-1" />
                              {contact.email}
                            </span>
                          )}
                          {contact.company && (
                            <span>
                              <MdBusiness size={12} className="me-1" />
                              {contact.company}
                            </span>
                          )}
                        </div>
                      </div>
                      {contact.segment && (
                        <Badge bg="light" text="dark" className="small">
                          {contact.segment.name}
                        </Badge>
                      )}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </div>

              {/* Pagination */}
              {contactTotal > contactLimit && (
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div className="text-muted small">
                    Showing {((contactPage - 1) * contactLimit) + 1} to {Math.min(contactPage * contactLimit, contactTotal)} of {contactTotal} contacts
                  </div>
                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      disabled={contactPage === 1}
                      onClick={() => handleContactPageChange(contactPage - 1)}
                    >
                      <MdArrowBack /> Previous
                    </Button>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      disabled={contactPage * contactLimit >= contactTotal}
                      onClick={() => handleContactPageChange(contactPage + 1)}
                    >
                      Next <MdArrowForward />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <Alert variant="warning" className="text-center">
              {contactSearch ? (
                <>
                  <MdGroup size={48} className="mb-2" />
                  <p className="mb-0">No contacts found matching "{contactSearch}"</p>
                </>
              ) : (
                <>
                  <MdGroup size={48} className="mb-2" />
                  <p className="mb-0">No contacts available. Add contacts in Contact Management.</p>
                </>
              )}
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowCustomContactModal(false);
              setContactSearch('');
              setContactPage(1);
            }}
          >
            <MdClose className="me-1" />
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={saveSelectedContacts}
            disabled={selectedContacts.length === 0}
          >
            <MdSave className="me-1" />
            Save Selection ({selectedContacts.length})
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default SurveyBuilder;