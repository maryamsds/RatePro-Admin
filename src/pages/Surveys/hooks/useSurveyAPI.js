import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import axiosInstance from '../../../api/axiosInstance';
import {
  API_ENDPOINTS,
  QUESTION_TYPE_MAP,
  LANGUAGES,
  SURVEY_STATUS
} from '../constants/surveyBuilderConstants';

/**
 * Custom hook for all Survey Builder API operations
 * Centralizes API calls, error handling, and data transformation
 */
export const useSurveyAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  /**
   * Normalize language to canonical backend format ('en' or 'ar')
   */
  const normalizeLanguage = useCallback((lang) => {
    if (!lang) return LANGUAGES.ENGLISH;

    if (Array.isArray(lang)) {
      const first = lang[0];
      if (first === 'Arabic' || first === 'ar') return LANGUAGES.ARABIC;
      return LANGUAGES.ENGLISH;
    }

    if (lang === 'Arabic' || lang === 'ar') return LANGUAGES.ARABIC;
    if (lang === 'English' || lang === 'en') return LANGUAGES.ENGLISH;

    return LANGUAGES.ENGLISH;
  }, []);

  /**
   * Map frontend question type to backend type
   */
  const mapQuestionTypeToBackend = useCallback((frontendType) => {
    return QUESTION_TYPE_MAP.frontend[frontendType] || 'text';
  }, []);

  /**
   * Map backend question type to frontend type
   */
  const mapQuestionTypeFromBackend = useCallback((backendType) => {
    return QUESTION_TYPE_MAP.backend[backendType] || 'text_short';
  }, []);

  /**
   * Transform frontend survey data to backend format
   */
  const transformSurveyToBackend = useCallback((survey, questions, options = {}) => {
    const { targetAudience = [], selectedContacts = [], publishSettings = {} } = options;

    return {
      title: survey.title,
      description: survey.description,
      category: survey.category,
      language: normalizeLanguage(survey.language),
      themeColor: survey.branding?.primaryColor?.startsWith('#')
        ? survey.branding.primaryColor
        : getComputedStyle(document.documentElement)
          .getPropertyValue('--bs-primary')
          .trim() || '#0047AB',

      questions: questions.map((q, index) => ({
        id: q.id?.toString() || (index + 1).toString(),
        questionText: q.title,
        type: mapQuestionTypeToBackend(q.type),
        options: q.options || [],
        required: q.required || false,
        description: q.description || '',
        settings: q.settings || {},
        logicRules: q.logicRules || [],
        translations: q.translations || {}
      })),

      settings: {
        isPublic: survey.isPublic !== false,
        isAnonymous: survey.allowAnonymous !== false,
        collectEmail: survey.collectEmail || false,
        multipleResponses: survey.multipleResponses || false,
        isPasswordProtected: false,
        password: ''
      },

      thankYouPage: {
        message: survey.thankYouMessage || 'Thank you for your feedback!',
        redirectUrl: survey.redirectUrl || null
      },

      branding: survey.branding,
      targetAudience,
      selectedContacts,

      publishSettings: {
        publishNow: publishSettings.publishNow !== false,
        scheduleDate: publishSettings.scheduleDate || null,
        scheduleTime: publishSettings.scheduleTime || null,
        expiryDate: publishSettings.expiryDate || null,
        maxResponses: publishSettings.maxResponses
          ? parseInt(publishSettings.maxResponses)
          : null
      }
    };
  }, [normalizeLanguage, mapQuestionTypeToBackend]);

  /**
   * Transform backend survey data to frontend format
   */
  const transformSurveyFromBackend = useCallback((surveyData) => {
    return {
      survey: {
        title: surveyData.title || '',
        description: surveyData.description || '',
        category: surveyData.category || '',
        language: normalizeLanguage(surveyData.language),
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
        translations: surveyData.translations || { en: {}, ar: {} }
      },

      questions: (surveyData.questions || []).map((q, index) => ({
        id: q.id || uuidv4(),
        type: mapQuestionTypeFromBackend(q.type),
        title: q.questionText || q.title || `Question ${index + 1}`,
        description: q.description || '',
        required: q.required || false,
        options: q.options || [],
        settings: q.settings || {},
        logicRules: q.logicRules || [],
        translations: q.translations || {}
      })),

      targetAudience: surveyData.targetAudience && Array.isArray(surveyData.targetAudience)
        ? surveyData.targetAudience
        : [],

      publishSettings: {
        publishNow: surveyData.publishSettings?.publishNow !== false,
        scheduleDate: surveyData.publishSettings?.scheduleDate || '',
        scheduleTime: surveyData.publishSettings?.scheduleTime || '',
        expiryDate: surveyData.publishSettings?.expiryDate || '',
        maxResponses: surveyData.publishSettings?.maxResponses || '',
        notificationEmails: surveyData.publishSettings?.notificationEmails || []
      },

      logicRules: surveyData.logicRules || [],
      currentStep: surveyData.currentStep || 1,
      status: surveyData.status || SURVEY_STATUS.DRAFT
    };
  }, [normalizeLanguage, mapQuestionTypeFromBackend]);

  // ============================================================================
  // SURVEY API METHODS
  // ============================================================================

  /**
   * Fetch existing survey by ID
   */
  const fetchSurvey = useCallback(async (surveyId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get(API_ENDPOINTS.SURVEYS.GET(surveyId));
      const surveyData = response.data.survey || response.data;
      return transformSurveyFromBackend(surveyData);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load survey';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [transformSurveyFromBackend]);

  /**
   * Save survey as draft
   */
  const saveDraft = useCallback(async (survey, questions, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const surveyData = {
        ...transformSurveyToBackend(survey, questions, options),
        status: SURVEY_STATUS.DRAFT,
        currentStep: options.currentStep || 1
      };

      let response;
      if (options.surveyId) {
        // Update existing draft
        response = await axiosInstance.put(
          API_ENDPOINTS.SURVEYS.UPDATE(options.surveyId),
          surveyData
        );
      } else {
        // Create new draft
        response = await axiosInstance.post(API_ENDPOINTS.SURVEYS.CREATE, surveyData);
      }

      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to save draft';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [transformSurveyToBackend]);

  /**
   * Publish survey (create new or update draft to active)
   */
  const publishSurvey = useCallback(async (survey, questions, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const surveyData = {
        ...transformSurveyToBackend(survey, questions, options),
        status: options.publishSettings?.publishNow !== false
          ? SURVEY_STATUS.ACTIVE
          : SURVEY_STATUS.SCHEDULED,
        metadata: {
          createdAt: new Date().toISOString(),
          completedSteps: 3,
          totalQuestions: questions.length,
          estimatedCompletionTime: `${Math.ceil(questions.length * 1.5)} minutes`
        }
      };

      let response;
      if (options.surveyId) {
        // Update existing survey and trigger publish
        response = await axiosInstance.put(
          API_ENDPOINTS.SURVEYS.UPDATE(options.surveyId),
          surveyData
        );
      } else {
        // Create and publish new survey
        response = await axiosInstance.post(API_ENDPOINTS.SURVEYS.PUBLISH, surveyData);
      }

      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to publish survey';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [transformSurveyToBackend]);

  // ============================================================================
  // TEMPLATE API METHODS
  // ============================================================================

  /**
   * Fetch template by ID
   */
  const fetchTemplate = useCallback(async (templateId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get(API_ENDPOINTS.TEMPLATES.GET(templateId));

      if (response.data.success && response.data.template) {
        return response.data.template;
      } else if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error('Invalid template response format');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load template';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Transform template data to frontend survey format
   */
  const transformTemplateToSurvey = useCallback((template) => {
    return {
      survey: {
        title: template.name || '',
        description: template.description || '',
        category: template.category || '',
        language: normalizeLanguage(template.language), // FIX: Normalize array to string
        isPublic: true,
        allowAnonymous: true,
        collectEmail: false,
        multipleResponses: false,
        thankYouMessage: 'Thank you for completing our survey!',
        redirectUrl: '',
        branding: {
          primaryColor: template.themeColor || 'var(--bs-primary)',
          backgroundColor: 'var(--bs-body-bg)',
          textColor: 'var(--bs-body-color)',
          showBranding: true
        }
      },

      questions: (template.questions || []).map((q, index) => ({
        id: q.id || `q${index + 1}`,
        type: mapQuestionTypeFromBackend(q.type),
        title: q.questionText || q.title || `Question ${index + 1}`,
        description: q.description || '',
        required: q.required || false,
        options: q.options || [],
        settings: q.settings || {},
        translations: q.translations || {}
      }))
    };
  }, [normalizeLanguage, mapQuestionTypeFromBackend]);

  /**
   * Save template (create or update)
   */
  const saveTemplate = useCallback(async (survey, questions, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const templateData = {
        name: survey.title,
        description: survey.description,
        category: survey.category || 'general',
        categoryName: survey.category
          ? survey.category.charAt(0).toUpperCase() + survey.category.slice(1)
          : 'General',
        estimatedTime: Math.ceil(questions.length * 1.5) * 60, // seconds
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
        status: options.publish ? 'published' : 'draft',
        language: normalizeLanguage(survey.language),
        tags: [],
        isPremium: false
      };

      let response;
      if (options.templateId) {
        response = await axiosInstance.put(
          API_ENDPOINTS.TEMPLATES.UPDATE(options.templateId),
          templateData
        );
      } else {
        response = await axiosInstance.post(API_ENDPOINTS.TEMPLATES.CREATE, templateData);
      }

      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to save template';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [normalizeLanguage, mapQuestionTypeToBackend]);

  // ============================================================================
  // AI GENERATION API METHODS
  // ============================================================================

  /**
   * Generate survey using AI
   */
  const generateAISurvey = useCallback(async (companyProfile) => {
    setLoading(true);
    setError(null);

    try {
      const requestPayload = {
        industry: companyProfile.industry || 'general',
        products: companyProfile.products
          ? companyProfile.products.split(',').map(p => p.trim())
          : [],
        targetAudience: companyProfile.targetAudience || 'customers',
        goal: companyProfile.surveyGoal || 'customer feedback',
        questionCount: Math.min(
          Math.max(companyProfile.questionCount || 8, 3),
          20 // AI_LIMITS.MAX_QUESTIONS
        ),
        includeNPS: companyProfile.includeNPS !== false,
        language: normalizeLanguage(companyProfile.language),
        tone: companyProfile.tone || 'friendly-professional',
        additionalInstructions: companyProfile.additionalInstructions || ''
      };

      console.log('🤖 AI Survey Generation Request:', requestPayload);

      const response = await axiosInstance.post(
        API_ENDPOINTS.AI.GENERATE_FROM_PROFILE,
        requestPayload
      );

      if (!response.data || (!response.data.success && !response.data.data)) {
        throw new Error('Invalid AI response format');
      }

      const aiData = response.data.data || response.data;
      const aiSurvey = aiData.survey || {};
      const aiQuestions = aiData.questions || [];

      // Transform AI questions to frontend format
      const transformedQuestions = aiQuestions.map((q, index) => ({
        id: uuidv4(),
        type: mapQuestionTypeFromBackend(q.type),
        title: q.title || q.text || `Question ${index + 1}`,
        description: q.description || '',
        required: q.required !== false,
        options: q.options || [],
        settings: q.settings || {},
        translations: q.translations || {}
      }));

      return {
        survey: {
          title: aiSurvey.title || `${companyProfile.industry} Customer Survey`,
          description: aiSurvey.description || `${companyProfile.surveyGoal} survey`,
          category: companyProfile.industry,
          language: normalizeLanguage(aiSurvey.language || companyProfile.language)
        },
        questions: transformedQuestions
      };
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'AI generation failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [normalizeLanguage, mapQuestionTypeFromBackend]);

  // ============================================================================
  // AUDIENCE API METHODS
  // ============================================================================

  /**
   * Fetch audience segments
   */
  const fetchSegments = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`${API_ENDPOINTS.AUDIENCE.SEGMENTS}?withCounts=true`);

      if (response.data?.success && Array.isArray(response.data?.data?.segments)) {
        return response.data.data.segments.filter(seg => (seg.contactCount || 0) > 0);
      }

      return [];
    } catch (err) {
      console.error('Error fetching segments:', err);
      return [];
    }
  }, []);

  /**
   * Fetch contact categories
   */
  const fetchCategories = useCallback(async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.AUDIENCE.CATEGORIES);

      if (response.data?.success && Array.isArray(response.data?.data?.categories)) {
        return response.data.data.categories.filter(cat => (cat.contactCount || 0) > 0);
      }

      return [];
    } catch (err) {
      console.error('Error fetching categories:', err);
      return [];
    }
  }, []);

  /**
   * Fetch contacts with pagination
   */
  const fetchContacts = useCallback(async (page = 1, limit = 10, search = '') => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.AUDIENCE.CONTACTS, {
        params: { page, limit, search }
      });

      const contactsData = response.data?.data?.contacts || response.data?.contacts || [];
      const totalCount = response.data?.data?.total ?? response.data?.total ?? 0;

      return {
        contacts: Array.isArray(contactsData) ? contactsData : [],
        total: Number(totalCount),
        page
      };
    } catch (err) {
      console.error('Error fetching contacts:', err);
      return { contacts: [], total: 0, page: 1 };
    }
  }, []);

  // ============================================================================
  // UTILITY API METHODS
  // ============================================================================

  /**
   * Check survey access permissions
   */
  const checkSurveyAccess = useCallback(async (surveyId) => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.SURVEYS.GET(surveyId));
      return !!response.data;
    } catch (err) {
      return false;
    }
  }, []);

  return {
    // State
    loading,
    error,

    // Survey Methods
    fetchSurvey,
    saveDraft,
    publishSurvey,
    checkSurveyAccess,

    // Template Methods
    fetchTemplate,
    transformTemplateToSurvey,
    saveTemplate,

    // AI Methods
    generateAISurvey,

    // Audience Methods
    fetchSegments,
    fetchCategories,
    fetchContacts,

    // Utilities
    normalizeLanguage,
    mapQuestionTypeToBackend,
    mapQuestionTypeFromBackend,
    transformSurveyToBackend,
    transformSurveyFromBackend
  };
};

export default useSurveyAPI;