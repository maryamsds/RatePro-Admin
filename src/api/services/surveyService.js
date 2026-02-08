// src/api/services/surveyService.js
// ============================================================================
// 📊 Survey Service - API calls with response transformation
// ============================================================================
import axiosInstance from "../axiosInstance";

/**
 * List surveys with pagination and filters
 * @param {Object} params - Query parameters
 * @returns {Promise<{surveys: Array, total: number, page: number, limit: number}>}
 */
export const listSurveys = async (params = {}) => {
  const { search = "", status, page = 1, limit = 10, sort = "-createdAt" } = params;

  const queryParams = new URLSearchParams();
  if (search) queryParams.append("search", search);
  if (status) queryParams.append("status", status);
  queryParams.append("page", page);
  queryParams.append("limit", limit);
  queryParams.append("sort", sort);

  const response = await axiosInstance.get(`/surveys?${queryParams.toString()}`);

  // Transform response for frontend
  return {
    surveys: response.data.surveys.map(transformSurvey),
    total: response.data.total,
    page: response.data.page,
    limit: response.data.limit,
    totalPages: Math.ceil(response.data.total / response.data.limit),
  };
};

/**
 * Get survey by ID with full details
 * @param {string} surveyId
 * @returns {Promise<Object>}
 */
export const getSurveyById = async (surveyId) => {
  const response = await axiosInstance.get(`/surveys/${surveyId}`);
  return transformSurveyDetail(response.data.survey);
};

/**
 * Get public survey (no auth required)
 * @param {string} surveyId
 * @returns {Promise<Object>}
 */
export const getPublicSurvey = async (surveyId) => {
  const response = await axiosInstance.get(`/surveys/public/${surveyId}`);
  return response.data;
};

/**
 * Create a new survey (draft)
 * @param {Object} surveyData
 * @returns {Promise<Object>}
 */
export const createSurveyDraft = async (surveyData) => {
  const formData = prepareFormData(surveyData);
  const response = await axiosInstance.post("/surveys/save-draft", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

/**
 * Create and publish survey
 * @param {Object} surveyData
 * @returns {Promise<Object>}
 */
export const createAndPublishSurvey = async (surveyData) => {
  const formData = prepareFormData(surveyData);
  const response = await axiosInstance.post("/surveys/create", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

/**
 * Publish an existing survey
 * @param {string} surveyId
 * @returns {Promise<Object>}
 */
export const publishSurvey = async (surveyId) => {
  const response = await axiosInstance.post(`/surveys/${surveyId}/publish`);
  return response.data;
};

/**
 * Update survey
 * @param {string} surveyId
 * @param {Object} surveyData
 * @returns {Promise<Object>}
 */
export const updateSurvey = async (surveyId, surveyData) => {
  const formData = prepareFormData(surveyData);
  const response = await axiosInstance.put(`/surveys/${surveyId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

/**
 * Delete survey
 * @param {string} surveyId
 * @returns {Promise<Object>}
 */
export const deleteSurvey = async (surveyId) => {
  const response = await axiosInstance.delete(`/surveys/${surveyId}`);
  return response.data;
};

/**
 * Toggle survey status (active/inactive)
 * @param {string} surveyId
 * @returns {Promise<Object>}
 */
export const toggleSurveyStatus = async (surveyId) => {
  const response = await axiosInstance.put(`/surveys/toggle/${surveyId}`);
  return response.data;
};

/**
 * Schedule survey
 * @param {string} surveyId
 * @param {Object} scheduleData - { startDate, endDate }
 * @returns {Promise<Object>}
 */
export const scheduleSurvey = async (surveyId, scheduleData) => {
  const response = await axiosInstance.post(`/surveys/${surveyId}/schedule`, scheduleData);
  return response.data;
};

/**
 * Set survey audience
 * @param {string} surveyId
 * @param {Object} audienceData - { segments, contacts, audienceType }
 * @returns {Promise<Object>}
 */
export const setSurveyAudience = async (surveyId, audienceData) => {
  const response = await axiosInstance.post(`/surveys/${surveyId}/audience`, audienceData);
  return response.data;
};

/**
 * Get survey responses
 * @param {string} surveyId
 * @param {Object} params - Pagination and filter params
 * @returns {Promise<Object>}
 */
export const getSurveyResponses = async (surveyId, params = {}) => {
  const { page = 1, limit = 20, sentiment, rating, search } = params;

  const queryParams = new URLSearchParams();
  queryParams.append("page", page);
  queryParams.append("limit", limit);
  if (sentiment && sentiment !== "all") queryParams.append("sentiment", sentiment);
  if (rating && rating !== "all") queryParams.append("rating", rating);
  if (search) queryParams.append("search", search);

  const response = await axiosInstance.get(`/surveys/${surveyId}/responses?${queryParams.toString()}`);

  return {
    responses: response.data.responses?.map(transformResponse) || [],
    total: response.data.total || 0,
    page: response.data.page || page,
    limit: response.data.limit || limit,
    totalPages: Math.ceil((response.data.total || 0) / limit),
  };
};

/**
 * Export survey report
 * @param {string} surveyId
 * @param {string} format - 'pdf' or 'csv'
 * @returns {Promise<Blob>}
 */
export const exportSurveyReport = async (surveyId, format = "pdf") => {
  const response = await axiosInstance.get(`/surveys/report/${surveyId}?format=${format}`, {
    responseType: "blob",
  });
  return response.data;
};

// ============================================================================
// 📱 QR Code APIs
// ============================================================================

/**
 * Get anonymous survey QR code
 * @param {string} surveyId
 * @returns {Promise<Object>}
 */
export const getAnonymousQRCode = async (surveyId) => {
  const response = await axiosInstance.get(`/surveys/${surveyId}/qr`);
  return response.data;
};

/**
 * Get invite-specific QR code
 * @param {string} surveyId
 * @param {string} inviteId
 * @returns {Promise<Object>}
 */
export const getInviteQRCode = async (surveyId, inviteId) => {
  const response = await axiosInstance.get(`/surveys/${surveyId}/invite-qr/${inviteId}`);
  return response.data;
};

// ============================================================================
// 🔄 Transform Functions
// ============================================================================

/**
 * Transform survey list item
 * NOTE: Backend now writes to TOP-LEVEL totalResponses/lastResponseAt fields
 * We read top-level first with nested analytics as fallback for backward compatibility
 */
const transformSurvey = (survey) => ({
  id: survey._id,
  _id: survey._id,
  title: survey.title,
  description: survey.description,
  status: survey.status,
  isActive: survey.isActive,
  questionCount: survey.questions?.length || 0,
  // Read top-level totalResponses first (from new backend), fallback to nested analytics
  responseCount: survey.totalResponses ?? survey.analytics?.totalResponses ?? 0,
  createdAt: survey.createdAt,
  updatedAt: survey.updatedAt,
  createdBy: survey.createdBy?.name || "Unknown",
  createdByEmail: survey.createdBy?.email,
  settings: survey.settings || {},
  // Read top-level lastResponseAt first (from new backend), fallback to nested analytics
  lastResponseAt: survey.lastResponseAt ?? survey.analytics?.lastResponseAt,
  npsScore: survey.analytics?.npsScore,
  avgRating: survey.analytics?.avgRating,
});

/**
 * Transform survey detail (full object)
 */
const transformSurveyDetail = (survey) => ({
  ...transformSurvey(survey),
  questions: survey.questions || [],
  thankYouPage: survey.thankYouPage || {},
  branding: survey.branding || {},
  schedule: survey.schedule || {},
  audience: survey.audience || {},
  // Stats from analytics
  stats: {
    totalResponses: survey.analytics?.totalResponses || 0,
    avgRating: survey.analytics?.avgRating || 0,
    npsScore: survey.analytics?.npsScore || 0,
    completionRate: survey.analytics?.completionRate || 0,
    responseRate: survey.analytics?.responseRate || 0,
    avgCompletionTime: survey.analytics?.avgCompletionTime || null,
  },
});

/**
 * Transform response item
 */
const transformResponse = (response) => ({
  id: response._id,
  _id: response._id,
  respondent: response.contact?.email || response.respondentEmail || "Anonymous",
  submittedAt: response.createdAt,
  completionTime: response.completionTime,
  device: response.metadata?.device || "Unknown",
  location: response.metadata?.location || "Unknown",
  sentiment: response.analysis?.sentiment || "neutral",
  rating: response.overallRating || response.score,
  answers: response.answers || [],
  // AI Analysis
  analysis: response.analysis || null,
});

/**
 * Prepare FormData for survey with logo upload
 */
const prepareFormData = (surveyData) => {
  const formData = new FormData();

  // Handle file upload
  if (surveyData.logo instanceof File) {
    formData.append("logo", surveyData.logo);
  }

  // Append other fields as JSON
  Object.keys(surveyData).forEach((key) => {
    if (key === "logo" && surveyData.logo instanceof File) return;

    if (typeof surveyData[key] === "object" && surveyData[key] !== null) {
      formData.append(key, JSON.stringify(surveyData[key]));
    } else if (surveyData[key] !== undefined && surveyData[key] !== null) {
      formData.append(key, surveyData[key]);
    }
  });

  return formData;
};

// ============================================================================
// 📦 Default Export
// ============================================================================
export default {
  listSurveys,
  getSurveyById,
  getPublicSurvey,
  createSurveyDraft,
  createAndPublishSurvey,
  publishSurvey,
  updateSurvey,
  deleteSurvey,
  toggleSurveyStatus,
  scheduleSurvey,
  setSurveyAudience,
  getSurveyResponses,
  exportSurveyReport,
  getAnonymousQRCode,
  getInviteQRCode,
};
