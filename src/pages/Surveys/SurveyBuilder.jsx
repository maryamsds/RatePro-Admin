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
  MdDragHandle, MdContentCopy, MdSettings, MdTranslate,
  MdStar, MdRadioButtonChecked, MdCheckBox, MdTextFields,
  MdLinearScale, MdDateRange, MdCloudUpload, MdToggleOn,
  MdViewList, MdGridOn, MdSmartToy, MdAutoAwesome,
  MdTune, MdVisibility, MdCode, MdMobileScreenShare,
  MdQrCode, MdShare, MdAnalytics, MdBusiness, MdBuild,
  MdSchool, MdLocalHospital, MdHotel, MdSports,
  MdAccountBalance, MdShoppingCart, MdLocationCity,
  MdConstruction, MdDirectionsCar, MdComputer
} from 'react-icons/md';
import {
  FaUsers, FaClock, FaLanguage, FaMagic, FaRocket,
  FaChartBar, FaEye, FaHandPointer, FaLightbulb,
  FaGlobe, FaPalette
} from 'react-icons/fa';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';

const SurveyBuilder = ({ darkMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state || {};
  const { id: surveyId } = useParams();
  const { user, setGlobalLoading } = useAuth();

  // ✅ FIXED: Enhanced mode detection with ALL required variables
  const templateData = locationState.templateData;
  const fromTemplates = locationState.source === 'templates';

  // Mode Detection Logic
  const isTemplateEditMode = locationState.mode === 'template-edit' && user?.role === 'admin';
  const isTemplateCreateMode = locationState.createTemplate === true && user?.role === 'admin';
  const isTemplateMode = isTemplateEditMode || isTemplateCreateMode;

  // Survey Mode Detection
  const isEditMode = !!surveyId && !isTemplateMode; // Editing existing survey
  const isCreateMode = !surveyId && !isTemplateMode; // Creating new survey
  const isTemplateBasedSurvey = fromTemplates && templateData && !isTemplateMode; // Tenant using template

  // ✅ ADDED: Backward compatibility variable
  const isEditing = isEditMode || isTemplateEditMode;

  console.log("=== SurveyBuilder Mode Detection ===");
  console.log("User Role:", user?.role);
  console.log("isTemplateEditMode:", isTemplateEditMode);
  console.log("isTemplateCreateMode:", isTemplateCreateMode);
  console.log("isTemplateMode:", isTemplateMode);
  console.log("isEditMode:", isEditMode);
  console.log("isCreateMode:", isCreateMode);
  console.log("isTemplateBasedSurvey:", isTemplateBasedSurvey);
  console.log("isEditing (compat):", isEditing);
  console.log("====================================");

  // Main Survey State
  const [survey, setSurvey] = useState({
    title: '',
    description: '',
    category: '',
    language: ['English'],
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
    languages: ['English'],
    tone: 'friendly-professional',
    additionalInstructions: ''
  });

  // Question Types Configuration
  const questionTypes = [
    {
      id: 'rating',
      name: 'Star Rating',
      icon: MdStar,
      color: 'var(--bs-warning)',
      category: 'rating',
      description: 'Rate using stars (1-5)',
      example: '⭐⭐⭐⭐⭐'
    },
    {
      id: 'single_choice',
      name: 'Single Choice',
      icon: MdRadioButtonChecked,
      color: 'var(--bs-primary)',
      category: 'choice',
      description: 'Select one option',
      example: '🔘 ○ ○'
    },
    {
      id: 'multiple_choice',
      name: 'Multiple Choice',
      icon: MdCheckBox,
      color: 'var(--bs-success)',
      category: 'choice',
      description: 'Select multiple options',
      example: '☑️ ☐ ☐'
    },
    {
      id: 'text_short',
      name: 'Short Text',
      icon: MdTextFields,
      color: 'var(--bs-info)',
      category: 'text',
      description: 'Single line text input',
      example: '📝 Short answer'
    },
    {
      id: 'text_long',
      name: 'Long Text',
      icon: MdViewList,
      color: 'var(--bs-secondary)',
      category: 'text',
      description: 'Multi-line text area',
      example: '📝 Detailed response'
    },
    {
      id: 'nps',
      name: 'NPS Score',
      icon: MdLinearScale,
      color: 'var(--bs-pink)',
      category: 'rating',
      description: 'Net Promoter Score (0-10)',
      example: '0️⃣ 1️⃣ ... 🔟'
    },
    {
      id: 'likert',
      name: 'Likert Scale',
      icon: MdLinearScale,
      color: 'var(--bs-orange)',
      category: 'rating',
      description: 'Agreement scale (1-5)',
      example: '1️⃣ 2️⃣ 3️⃣ 4️⃣ 5️⃣'
    },
    {
      id: 'yes_no',
      name: 'Yes/No',
      icon: MdToggleOn,
      color: 'var(--bs-teal)',
      category: 'choice',
      description: 'Simple yes or no',
      example: '✅ ❌'
    },
    {
      id: 'date',
      name: 'Date Picker',
      icon: MdDateRange,
      color: 'var(--bs-purple)',
      category: 'input',
      description: 'Select a date',
      example: '📅 2025-01-01'
    },
    {
      id: 'file_upload',
      name: 'File Upload',
      icon: MdCloudUpload,
      color: 'var(--bs-danger)',
      category: 'media',
      description: 'Upload files/images',
      example: '📂 ⬆️'
    },
    {
      id: 'ranking',
      name: 'Ranking',
      icon: MdDragHandle,
      color: 'var(--bs-dark)',
      category: 'advanced',
      description: 'Drag & drop ranking',
      example: '⬆️ 1️⃣ 2️⃣ 3️⃣ ⬇️'
    },
    {
      id: 'matrix',
      name: 'Matrix/Grid',
      icon: MdGridOn,
      color: 'var(--bs-gray-dark)',
      category: 'advanced',
      description: 'Grid of questions',
      example: 'Rows × Columns'
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

  // ✅ FIXED: Debug useEffect with correct dependencies
  useEffect(() => {
    console.log("🔍 SurveyBuilder Debug Info:");
    console.log("Survey ID from params:", surveyId);
    console.log("Location state:", location.state);
    console.log("User:", user);
    console.log("Loading state:", loading);
    console.log("Is editing:", isEditing);
    console.log("Template mode:", isTemplateMode);
  }, [surveyId, location.state, user, loading, isEditing, isTemplateMode]);


  useEffect(() => {
    const initializeSurveyBuilder = async () => {
      setGlobalLoading(true);
      setLoading(true);

      try {
        console.log("🔄 Initializing SurveyBuilder with mode:", {
          surveyId,
          isTemplateMode,
          isEditing,
          templateData: !!templateData,
          userRole: user?.role // ✅ User role check
        });

        // ✅ ADMIN CHECK: Agar admin template use karne try kare to redirect
        if (isTemplateBasedSurvey && user?.role === 'admin') {
          console.log("🚫 Admin cannot use templates - redirecting");
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
          console.log("🎯 MODE: Editing existing survey");
          await fetchExistingSurvey(surveyId);
          setShowModeSelector(false);
          setSurveyMode('user-defined');
        }
        // CASE 2: Creating from template
        else if (templateData && !isTemplateMode) {
          console.log("🎯 MODE: Creating survey from template");
          initializeFromTemplate(templateData);
          setShowModeSelector(false);
          setSurveyMode('user-defined');
        }
        // CASE 3: Admin editing template
        else if (isTemplateMode && surveyId) {
          console.log("🎯 MODE: Admin editing template");
          await fetchTemplateData(surveyId);
          setShowModeSelector(false);
          setSurveyMode('user-defined');
        }
        // CASE 4: Admin creating new template
        else if (isTemplateMode && !surveyId) {
          console.log("🎯 MODE: Admin creating new template");
          setShowModeSelector(false);
          setSurveyMode('ai-assisted');
          setShowAIModal(true);
        }
        // CASE 5: Creating new survey (manual/AI)
        else {
          console.log("🎯 MODE: Creating new survey");
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

  // ✅ FIXED: Fetch template data for admin editing
  const fetchTemplateData = async (templateId) => {
    try {
      console.log("📡 Fetching template data for ID:", templateId);
      const response = await axiosInstance.get(`/templates/${templateId}`);

      if (response.data.success && response.data.template) {
        const template = response.data.template;

        setSurvey({
          title: template.name || '',
          description: template.description || '',
          category: template.category || '',
          language: template.language || ['English'],
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
        console.log("✅ Template data loaded successfully");
      }
    } catch (error) {
      console.error('Error fetching template:', error);
      throw new Error('Failed to load template data');
    }
  };

  // ✅ FIXED: Fetch existing survey
  const fetchExistingSurvey = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("📡 Fetching survey data for ID:", surveyId);

      // ✅ CORRECTED: Use /api prefix
      const response = await axiosInstance.get(`/surveys/${surveyId}`);
      console.log("📦 Survey API Response:", response.data);

      if (response.data) {
        const surveyData = response.data.survey || response.data;

        // Transform backend data to frontend format
        setSurvey({
          title: surveyData.title || '',
          description: surveyData.description || '',
          category: surveyData.category || '',
          language: Array.isArray(surveyData.language) ? surveyData.language : ['English'],
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
  // ✅ FIXED: Initialize from template for tenant
  const initializeFromTemplate = (template) => {
    console.log("🔄 Initializing from template:", template);

    const newSurveyData = {
      title: `${template.name} - Copy`,
      description: template.description || '',
      category: template.category || '',
      language: template.language || ['English'],
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
    };

    setSurvey(newSurveyData);

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

    const profileUpdate = {
      industry: template.category,
      surveyGoal: template.description || `Collect feedback using ${template.name} template`,
      targetAudience: 'customers'
    };
    setCompanyProfile(prev => ({ ...prev, ...profileUpdate }));

    console.log("✅ Template initialization complete");
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
      const requestPayload = {
        industry: companyProfile.industry || 'general',
        products: companyProfile.products
          ? companyProfile.products.split(',').map(p => p.trim())
          : [],
        targetAudience: companyProfile.targetAudience || 'customers',
        goal: companyProfile.surveyGoal || aiPrompt || 'customer feedback',
        questionCount: companyProfile.questionCount || 8,
        includeNPS: companyProfile.includeNPS || true,
        languages: companyProfile.languages || ['English'],
        tone: companyProfile.tone || 'friendly-professional',
        additionalInstructions: companyProfile.additionalInstructions || aiPrompt.trim() || ''
      };

      const response = await axiosInstance.post('/ai/generate-from-profile', requestPayload);

      if (response.data && (response.data.success || response.data.data || response.status < 400)) {
        const aiData = response.data.data || response.data;
        const aiSurvey = aiData.survey || {};
        const aiQuestions = aiData.questions || [];

        console.log('✅ AI Response received:', { aiSurvey, questionCount: aiQuestions.length });

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
  const useMockData = false; // Backend ready hone tak true rakhein

  // ✅ DEBUG: Check survey details before update
  const checkSurveyAccess = async () => {
    try {
      console.log("🔍 Checking survey access...");
      console.log("Survey ID:", surveyId);
      console.log("User:", user);
      console.log("User Tenant:", user?.tenant);

      // Test GET request to check if survey exists
      const testResponse = await axiosInstance.get(`/surveys/${surveyId}`);
      console.log("✅ Survey GET Response:", testResponse.data);

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

      console.log("🎯 Save Operation Mode:", {
        isTemplateMode,
        isTemplateCreateMode,
        isTemplateEditMode,
        isEditing,
        surveyId,
        publish,
        userRole: user?.role // ✅ User role bhi log karo
      });

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
        // SURVEY MODE - CompanyAdmin ke liye
        if (user?.role === 'companyAdmin') {
          finalStatus = publish ? 'active' : 'draft';
        } else {
          // Regular user ke liye
          finalStatus = publish ? 'published' : 'draft';
        }
      }

      console.log("📊 Final Status Determination:", {
        userRole: user?.role,
        isTemplateMode,
        publish,
        finalStatus
      });

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
          language: survey.language || ['English'],
          tags: [],
          isPremium: false
        };

        console.log("🚀 Sending template with status:", finalStatus);
        console.log("👤 User role:", user?.role);

        if (isEditing && surveyId) {
          // Update existing template
          console.log("🔄 Updating existing template...");
          response = await axiosInstance.put(`/survey-templates/${surveyId}`, templateData);
          successMessage = `Template ${publish ? 'published' : 'updated'} successfully!`;
        } else {
          // Create new template - ✅ CORRECT ENDPOINT
          console.log("🆕 Creating new template...");
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

        console.log("📤 Sending survey data with status:", finalStatus);

        if (isEditing && surveyId) {
          console.log("🔄 Updating existing survey...");
          response = await axiosInstance.put(`/surveys/${surveyId}`, surveyData);
          successMessage = `Survey ${publish ? 'published' : 'updated'} successfully!`;
        } else {
          console.log("🆕 Creating new survey...");
          const endpoint = publish ? '/surveys/create' : '/surveys/save-draft';
          response = await axiosInstance.post(endpoint, surveyData);
          successMessage = `Survey ${publish ? 'published' : 'saved as draft'} successfully!`;
        }
      }

      console.log("✅ API Response:", response.data);

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
  const saveAsDraft = async () => {
    const result = await Swal.fire({
      title: 'Save as Draft?',
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
        if (!survey.title.trim()) {
          throw new Error('Survey title is required');
        }

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
          status: 'draft'
        };

        console.log("🚀 Sending DRAFT save request...");

        let response;
        if (isEditMode && surveyId) {
          // ✅ CORRECTED: Use /api prefix
          response = await axiosInstance.put(`/surveys/${surveyId}`, surveyData);
        } else {
          // ✅ CORRECTED: Use /api prefix  
          response = await axiosInstance.post('/surveys/save-draft', surveyData);
        }

        console.log("✅ Draft save response:", response.data);

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

  // ✅ FIXED: Publish Survey Function with consistent API endpoint
  const publishSurvey = async () => {
    const result = await Swal.fire({
      title: 'Publish Survey?',
      text: 'Once published, the survey will be available for responses.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: 'var(--bs-success)',
      cancelButtonColor: 'var(--bs-secondary)',
      confirmButtonText: 'Yes, Publish Survey'
    });


    if (result.isConfirmed) {
      setSaving(true);
      try {
        if (!survey.title.trim() || questions.length === 0) {
          throw new Error('Title and at least one question are required');
        }

        const surveyData = {
          title: survey.title,
          description: survey.description,
          category: survey.category,
          themeColor: survey.branding?.primaryColor || '#007bff',
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
            isAnonymous: survey.allowAnonymous
          },
          status: 'active'
        };

        let response;

        console.log("🎯 Updated Mode:", {
          isTemplateMode,
          isEditing,
          surveyId
        });

        if (isTemplateMode) {
          // Template publishing
          if (isEditing && surveyId) {
            response = await axiosInstance.put(`/templates/${surveyId}`, {
              ...surveyData,
              status: 'published'
            });
          } else {
            response = await axiosInstance.post('/templates/create', {
              ...surveyData,
              status: 'published'
            });
          }
        } else {
          // ✅ FIXED: Use PUT for publishing existing surveys instead of PATCH
          if (isEditing && surveyId) {
            response = await axiosInstance.put(`/surveys/${surveyId}`, {
              ...surveyData,
              status: 'active'
            });
          } else {
            response = await axiosInstance.post('/surveys/create', surveyData);
          }
        }

        if (response.data) {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Survey updated successfully!',
            timer: 2000,
            showConfirmButton: false
          });

          setTimeout(() => navigate('/app/surveys'), 1500);
        }

      } catch (error) {
        console.error('Update error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text: error.response?.data?.message || error.message || 'Failed to publish survey. Please try again.'
        });
      } finally {
        setSaving(false);
      }
    }
  };

  // ✅ FIXED: Enhanced action buttons with proper mode-based conditions
  // const renderActionButtons = () => {
  //   return (
  //     <div className="d-flex gap-2 flex-wrap">
  //       {/* AI Assistant Button - Show for all modes */}
  //       <Button
  //         variant="outline-primary"
  //         onClick={() => setShowAIModal(true)}
  //         className="d-flex align-items-center"
  //         disabled={aiLoadingStates.generating}
  //         size="sm"
  //       >
  //         {aiLoadingStates.generating ? (
  //           <Spinner size="sm" className="me-2" />
  //         ) : (
  //           <MdAutoAwesome className="me-2" />
  //         )}
  //         <span className="d-none d-sm-inline">AI Assistant</span>
  //       </Button>

  //       {/* Preview Button */}
  //       <Button
  //         variant="outline-secondary"
  //         onClick={() => setShowPreviewModal(true)}
  //         className="d-flex align-items-center"
  //         size="sm"
  //       >
  //         <MdPreview className="me-2" />
  //         <span className="d-none d-sm-inline">Preview</span>
  //       </Button>

  //       {isTemplateMode && user?.role === 'companyAdmin' && (
  //         <>
  //           <Button
  //             variant="outline-warning"
  //             onClick={() => saveSurvey(false)} // Save Template Draft
  //             disabled={saving}
  //             className="d-flex align-items-center"
  //             size="sm"
  //           >
  //             <MdSave className="me-2" />
  //             Save Draft
  //           </Button>
  //           <Button
  //             variant="success"
  //             onClick={() => saveSurvey(true)} // Publish Template
  //             disabled={saving}
  //             className="d-flex align-items-center"
  //             size="sm"
  //           >
  //             <MdPublish className="me-2" />
  //             Publish
  //           </Button>
  //         </>
  //       )}

  //       {/* 🎯 MODE-BASED ACTION BUTTONS */}
  //       {/* CASE 1: Admin Template Create Mode */}
  //       {isTemplateCreateMode && (
  //         <>
  //           <Button
  //             variant="outline-warning"
  //             onClick={() => saveSurvey(false)} // Save Template Draft
  //             disabled={saving}
  //             className="d-flex align-items-center"
  //             size="sm"
  //           >
  //             <MdSave className="me-2" />
  //             Save Template Draft
  //           </Button>
  //           <Button
  //             variant="success"
  //             onClick={() => saveSurvey(true)} // Publish Template
  //             disabled={saving}
  //             className="d-flex align-items-center"
  //             size="sm"
  //           >
  //             <MdPublish className="me-2" />
  //             Publish Template
  //           </Button>
  //         </>
  //       )}


  //       {/* CASE 3: Tenant Survey Edit Mode */}
  //       {isEditMode && !isTemplateMode && (
  //         <>
  //           {/* <Button
  //             variant="outline-warning"
  //             onClick={saveAsDraft} // Save as draft
  //             disabled={saving}
  //             className="d-flex align-items-center"
  //             size="sm"
  //           >
  //             <MdSave className="me-2" />
  //             Update Draft
  //           </Button> */}
  //           <Button
  //             variant="success"
  //             onClick={saveSurvey} // Publish survey
  //             disabled={saving}
  //             className="d-flex align-items-center"
  //             size="sm"
  //           >
  //             <MdPublish className="me-2" />
  //             Update
  //           </Button>
  //         </>
  //       )}

  //       {/* CASE 3: Tenant Create Survey Mode (New Survey) */}
  //       {/* {isCreateMode && !isTemplateMode && (
  //         <>
  //           <Button
  //             variant="outline-warning"
  //             onClick={saveAsDraft} // Save as Draft
  //             disabled={saving}
  //             className="d-flex align-items-center"
  //             size="sm"
  //           >
  //             <MdSave className="me-2" />
  //             Save as Draft
  //           </Button>
  //           <Button
  //             variant="success"
  //             onClick={publishSurvey} // Publish Survey
  //             disabled={saving}
  //             className="d-flex align-items-center"
  //             size="sm"
  //           >
  //             <MdPublish className="me-2" />
  //             Publish Survey
  //           </Button>
  //         </>
  //       )} */}


  //       {/* CASE 5: Template-based Survey Creation */}
  //       {isTemplateBasedSurvey && (
  //         <>
  //           <Button
  //             variant="outline-warning"
  //             onClick={saveAsDraft} // Save as draft
  //             disabled={saving}
  //             className="d-flex align-items-center"
  //             size="sm"
  //           >
  //             <MdSave className="me-2" />
  //             Save as Draft
  //           </Button>
  //           <Button
  //             variant="success"
  //             onClick={publishSurvey} // Publish survey
  //             disabled={saving}
  //             className="d-flex align-items-center"
  //             size="sm"
  //           >
  //             <MdPublish className="me-2" />
  //             Publish Survey
  //           </Button>
  //         </>
  //       )}

  //     </div>
  //   );
  // };
  // ✅ FIXED: Enhanced action buttons with proper mode-based conditions
  // ✅ FIXED: Enhanced action buttons with proper mode-based conditions
  // const renderActionButtons = () => {
  //   return (
  //     <div className="d-flex gap-2 flex-wrap">
  //       {/* AI Assistant Button - Show for all modes */}
  //       <Button
  //         variant="outline-primary"
  //         onClick={() => setShowAIModal(true)}
  //         className="d-flex align-items-center"
  //         disabled={aiLoadingStates.generating}
  //         size="sm"
  //       >
  //         {aiLoadingStates.generating ? (
  //           <Spinner size="sm" className="me-2" />
  //         ) : (
  //           <MdAutoAwesome className="me-2" />
  //         )}
  //         <span className="d-none d-sm-inline">AI Assistant</span>
  //       </Button>

  //       {/* Preview Button */}
  //       <Button
  //         variant="outline-secondary"
  //         onClick={() => setShowPreviewModal(true)}
  //         className="d-flex align-items-center"
  //         size="sm"
  //       >
  //         <MdPreview className="me-2" />
  //         <span className="d-none d-sm-inline">Preview</span>
  //       </Button>

  //       {/* 🎯 MODE-BASED ACTION BUTTONS */}

  //       {/* CASE 1: CompanyAdmin creating new survey */}
  //       {(user?.role === 'companyAdmin' && isCreateMode && !isTemplateMode) && (
  //         <>
  //           <Button
  //             variant="outline-warning"
  //             onClick={() => saveSurvey(false)} // Save as draft
  //             disabled={saving}
  //             className="d-flex align-items-center"
  //             size="sm"
  //           >
  //             <MdSave className="me-2" />
  //             Save Draft
  //           </Button>
  //           <Button
  //             variant="success"
  //             onClick={() => saveSurvey(true)} // Publish as active
  //             disabled={saving}
  //             className="d-flex align-items-center"
  //             size="sm"
  //           >
  //             <MdPublish className="me-2" />
  //             Publish Survey
  //           </Button>
  //         </>
  //       )}

  //       {/* CASE 2: Admin Template Create Mode */}
  //       {isTemplateCreateMode && (
  //         <>
  //           <Button
  //             variant="outline-warning"
  //             onClick={() => saveSurvey(false)} // Save Template Draft
  //             disabled={saving}
  //             className="d-flex align-items-center"
  //             size="sm"
  //           >
  //             <MdSave className="me-2" />
  //             Save Template Draft
  //           </Button>
  //           <Button
  //             variant="success"
  //             onClick={() => saveSurvey(true)} // Publish Template
  //             disabled={saving}
  //             className="d-flex align-items-center"
  //             size="sm"
  //           >
  //             <MdPublish className="me-2" />
  //             Publish Template
  //           </Button>
  //         </>
  //       )}

  //       {/* CASE 3: Tenant Survey Edit Mode */}
  //       {isEditMode && !isTemplateMode && (
  //         <>
  //           <Button
  //             variant="success"
  //             onClick={() => saveSurvey(true)} // Update survey
  //             disabled={saving}
  //             className="d-flex align-items-center"
  //             size="sm"
  //           >
  //             <MdPublish className="me-2" />
  //             Update
  //           </Button>
  //         </>
  //       )}

  //       {/* CASE 4: Template-based Survey Creation */}
  //       {isTemplateBasedSurvey && (
  //         <>
  //           <Button
  //             variant="outline-warning"
  //             onClick={() => saveSurvey(false)} // Save as draft
  //             disabled={saving}
  //             className="d-flex align-items-center"
  //             size="sm"
  //           >
  //             <MdSave className="me-2" />
  //             Save as Draft
  //           </Button>
  //           <Button
  //             variant="success"
  //             onClick={() => saveSurvey(true)} // Publish survey
  //             disabled={saving}
  //             className="d-flex align-items-center"
  //             size="sm"
  //           >
  //             <MdPublish className="me-2" />
  //             Publish Survey
  //           </Button>
  //         </>
  //       )}
  //     </div>
  //   );
  // };

  const renderActionButtons = () => {
    return (
      <div className="d-flex gap-2 flex-wrap">
        {/* AI Assistant Button - Show for all modes */}
        <Button
          variant="outline-primary"
          onClick={() => setShowAIModal(true)}
          className="d-flex align-items-center"
          disabled={aiLoadingStates.generating}
          size="sm"
        >
          {aiLoadingStates.generating ? (
            <Spinner size="sm" className="me-2" />
          ) : (
            <MdAutoAwesome className="me-2" />
          )}
          <span className="d-none d-sm-inline">AI Assistant</span>
        </Button>

        {/* Preview Button */}
        <Button
          variant="outline-secondary"
          onClick={() => setShowPreviewModal(true)}
          className="d-flex align-items-center"
          size="sm"
        >
          <MdPreview className="me-2" />
          <span className="d-none d-sm-inline">Preview</span>
        </Button>

        {/* CASE 1: CompanyAdmin creating new survey */}
        {(user?.role === 'companyAdmin' && isCreateMode && !isTemplateMode) && (
          <>
            <Button
              variant="outline-warning"
              onClick={() => saveSurvey(false)} // Save as draft
              disabled={saving}
              className="d-flex align-items-center"
              size="sm"
            >
              <MdSave className="me-2" />
              Save Draft
            </Button>
            <Button
              variant="success"
              onClick={() => saveSurvey(true)} // Publish as active
              disabled={saving}
              className="d-flex align-items-center"
              size="sm"
            >
              <MdPublish className="me-2" />
              Publish Survey
            </Button>
          </>
        )}

        {/* 🎯 MODE-BASED ACTION BUTTONS */}
        {/* CASE 1: Admin Template Create Mode */}
        {isTemplateCreateMode && (
          <>
            <Button
              variant="outline-warning"
              onClick={() => saveSurvey(false)} // Save Template Draft
              disabled={saving}
              className="d-flex align-items-center"
              size="sm"
            >
              <MdSave className="me-2" />
              Save Template Draft
            </Button>
            <Button
              variant="success"
              onClick={() => saveSurvey(true)} // Publish Template
              disabled={saving}
              className="d-flex align-items-center"
              size="sm"
            >
              <MdPublish className="me-2" />
              Publish Template
            </Button>
          </>
        )}


        {/* CASE 3: Tenant Survey Edit Mode */}
        {isEditMode && !isTemplateMode && (
          <>
            <Button
              variant="success"
              onClick={saveSurvey} // Publish survey
              disabled={saving}
              className="d-flex align-items-center"
              size="sm"
            >
              <MdPublish className="me-2" />
              Update
            </Button>
          </>
        )}


        {/*  Template-based Survey Creation */}
        {isTemplateBasedSurvey && (
          <>
            <Button
              variant="outline-warning"
              onClick={saveAsDraft} // Save as draft
              disabled={saving}
              className="d-flex align-items-center"
              size="sm"
            >
              <MdSave className="me-2" />
              Save as Draft
            </Button>
            <Button
              variant="success"
              onClick={publishSurvey} // Publish survey
              disabled={saving}
              className="d-flex align-items-center"
              size="sm"
            >
              <MdPublish className="me-2" />
              Publish Survey
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
        title = 'Create Survey Template';
        subtitle = 'Modify an existing survey template';
        badge = <Badge bg="warning">Create Template</Badge>;
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
  const getCompletionPercentage = () => {
    let completed = 0;
    let total = 5;

    if (survey.title.trim()) completed++;
    if (survey.description.trim()) completed++;
    if (questions.length > 0) completed++;
    if (questions.some(q => q.required)) completed++;
    if (survey.thankYouMessage.trim()) completed++;

    return Math.round((completed / total) * 100);
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
                Template Creation Mode
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

          {/* Action Buttons */}
          <div className="header-actions mb-3">
            {renderActionButtons()}
          </div>
        </div>
      </div>

      {/* Main Content with Tabs */}
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
                        <Form.Label className="fw-semibold">Languages</Form.Label>
                        <div className="d-flex gap-2 flex-wrap">
                          {['English', 'Arabic'].map(lang => (
                            <Form.Check
                              key={lang}
                              type="checkbox"
                              id={`lang-${lang}`}
                              label={lang}
                              checked={survey.language.includes(lang)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSurvey({ ...survey, language: [...survey.language, lang] });
                                } else {
                                  setSurvey({ ...survey, language: survey.language.filter(l => l !== lang) });
                                }
                              }}
                            />
                          ))}
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
                    console.log('Industry selected:', e.target.value);
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
                    console.log('Products updated:', e.target.value);
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
                    console.log('Audience selected:', e.target.value);
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
                    console.log('Goal updated:', e.target.value);
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
                      <Form.Select
                        value={companyProfile.questionCount}
                        onChange={(e) => setCompanyProfile({
                          ...companyProfile,
                          questionCount: parseInt(e.target.value)
                        })}
                      >
                        <option value={5}>5 Questions (Quick)</option>
                        <option value={8}>8 Questions (Standard)</option>
                        <option value={12}>12 Questions (Comprehensive)</option>
                        <option value={15}>15 Questions (Detailed)</option>
                      </Form.Select>
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
                      <Form.Label>Languages</Form.Label>
                      <div>
                        {['English', 'Arabic', 'Both'].map(lang => (
                          <Form.Check
                            key={lang}
                            type="checkbox"
                            id={`lang-${lang}`}
                            label={lang}
                            checked={companyProfile.languages.includes(lang)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setCompanyProfile({
                                  ...companyProfile,
                                  languages: [...companyProfile.languages, lang]
                                });
                              } else {
                                setCompanyProfile({
                                  ...companyProfile,
                                  languages: companyProfile.languages.filter(l => l !== lang)
                                });
                              }
                            }}
                          />
                        ))}
                      </div>
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
                console.log('🎯 Generate button clicked with profile:', companyProfile);
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
            backgroundColor: survey.branding.backgroundColor,
            color: survey.branding.textColor,
            padding: '2rem',
            borderRadius: '8px'
          }}>
            <h3 style={{ color: survey.branding.primaryColor }}>
              {survey.title || 'Untitled Survey'}
            </h3>
            {survey.description && (
              <p className="mb-4">{survey.description}</p>
            )}

            {questions.map((question, index) => (
              <div key={question.id} className="mb-4">
                <div className="d-flex align-items-center mb-2">
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
    </Container>
  );
};

export default SurveyBuilder;
