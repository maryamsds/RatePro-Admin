// src/api/services/actionService.js
// ============================================================================
// ⚡ Action Service - API calls with response transformation
// ============================================================================
import axiosInstance from "../axiosInstance";
import {
  transformAction,
  transformActions,
  transformActionStats,
  toCreateActionPayload,
  toStatusUpdatePayload,
  toPriorityUpdatePayload,
  toAssignmentPayload,
} from "../adapters/actionAdapters";

// ============================================================================
// 📋 Action CRUD Operations
// ============================================================================

/**
 * List actions with filters
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>}
 */
export const listActions = async (params = {}) => {
  const {
    page = 1,
    limit = 20,
    status,
    priority,
    assignee,
    department,
    dateRange,
    tab = "all",
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = params;

  const queryParams = new URLSearchParams();
  queryParams.append("page", page);
  queryParams.append("limit", limit);
  queryParams.append("sortBy", sortBy);
  queryParams.append("sortOrder", sortOrder);

  if (status && status !== "all") queryParams.append("status", status);
  if (priority && priority !== "all") queryParams.append("priority", priority);
  if (assignee && assignee !== "all") queryParams.append("assignedTo", assignee);
  if (department && department !== "all") queryParams.append("category", department);
  if (dateRange && dateRange !== "all") queryParams.append("dateRange", dateRange);
  if (search) queryParams.append("search", search);

  // Handle tab-specific filtering
  if (tab === "high-priority") {
    queryParams.set("priority", "high");
  } else if (tab === "overdue") {
    // Overdue filtering is handled client-side after fetch
  }

  const response = await axiosInstance.get(`/actions?${queryParams.toString()}`);

  // Handle both response structures: { data: { actions } } or { actions }
  const rawData = response.data?.data || response.data;
  const rawActions = rawData?.actions || [];
  const pagination = rawData?.pagination || {};
  const analytics = rawData?.analytics || {};

  const actions = transformActions(rawActions);

  return {
    actions,
    total: pagination.total || rawData?.total || actions.length,
    page: pagination.current || page,
    limit: pagination.limit || limit,
    totalPages: pagination.pages || Math.ceil((pagination.total || actions.length) / limit),
    analytics,
  };
};

/**
 * Get action by ID
 * @param {string} actionId
 * @returns {Promise<Object>}
 */
export const getActionById = async (actionId) => {
  const response = await axiosInstance.get(`/actions/${actionId}`);
  return transformAction(response.data.action || response.data);
};

/**
 * Get actions for a specific survey
 * @param {string} surveyId
 * @param {Object} params
 * @returns {Promise<Object>}
 */
export const getActionsBySurvey = async (surveyId, params = {}) => {
  const { page = 1, limit = 20 } = params;
  const response = await axiosInstance.get(`/actions/survey/${surveyId}?page=${page}&limit=${limit}`);

  return {
    actions: (response.data.actions || []).map(transformAction),
    total: response.data.total || 0,
  };
};

/**
 * Get action statistics
 * @param {Object} params - { period }
 * @returns {Promise<Object>}
 */
export const getActionStats = async (params = {}) => {
  const { period = "30" } = params;
  const response = await axiosInstance.get(`/actions/analytics/summary?period=${period}`);
  return transformActionStats(response.data.data || response.data);
};

/**
 * Create a new action
 * @param {Object} actionData
 * @returns {Promise<Object>}
 */
export const createAction = async (actionData) => {
  const response = await axiosInstance.post("/actions", actionData);
  return response.data;
};

/**
 * Update action
 * @param {string} actionId
 * @param {Object} actionData
 * @returns {Promise<Object>}
 */
export const updateAction = async (actionId, actionData) => {
  const response = await axiosInstance.put(`/actions/${actionId}`, actionData);
  return response.data;
};

/**
 * Update action status
 * @param {string} actionId
 * @param {string} newStatus
 * @returns {Promise<Object>}
 */
export const updateActionStatus = async (actionId, newStatus) => {
  const response = await axiosInstance.put(`/actions/${actionId}/status`, { status: newStatus });
  return response.data;
};

/**
 * Assign action to user/team
 * @param {string} actionId
 * @param {Object} assignmentData - { assigneeId, team }
 * @returns {Promise<Object>}
 */
export const assignAction = async (actionId, assignmentData) => {
  const response = await axiosInstance.put(`/actions/${actionId}/assign`, assignmentData);
  return response.data;
};

/**
 * Delete action
 * @param {string} actionId
 * @returns {Promise<Object>}
 */
export const deleteAction = async (actionId) => {
  const response = await axiosInstance.delete(`/actions/${actionId}`);
  return response.data;
};

/**
 * Add comment to action
 * @param {string} actionId
 * @param {string} comment
 * @returns {Promise<Object>}
 */
export const addActionComment = async (actionId, comment) => {
  const response = await axiosInstance.post(`/actions/${actionId}/comments`, { comment });
  return response.data;
};

// ============================================================================
// 🤖 AI-Generated Actions
// ============================================================================

/**
 * Generate actions from feedback using AI
 * @param {Object} data - { surveyId, responseIds, context }
 * @returns {Promise<Object>}
 */
export const generateActionsFromFeedback = async (data) => {
  const response = await axiosInstance.post("/actions/generate/feedback", data);
  return response.data;
};

/**
 * Analyze feedback with AI
 * @param {Object} data - { surveyId, timeRange }
 * @returns {Promise<Object>}
 */
export const analyzeFeedback = async (data) => {
  const response = await axiosInstance.post("/surveys/feedback/analyze", data);
  return transformFeedbackAnalysis(response.data);
};

/**
 * Generate follow-up recommendations
 * @param {Object} data - { surveyId, responseId }
 * @returns {Promise<Object>}
 */
export const generateFollowUp = async (data) => {
  const response = await axiosInstance.post("/surveys/feedback/follow-up", data);
  return response.data;
};

// ============================================================================
// 📊 Additional Endpoints
// ============================================================================

/**
 * Get actions by priority
 * @param {string} priority - high, medium, low, long-term
 * @returns {Promise<Array>}
 */
export const getActionsByPriority = async (priority) => {
  const response = await axiosInstance.get(`/actions/priority/${priority}`);
  const rawData = response.data?.data || response.data;
  return transformActions(rawData?.actions || []);
};

/**
 * Get actions by status
 * @param {string} status - pending, open, in-progress, resolved
 * @returns {Promise<Array>}
 */
export const getActionsByStatus = async (status) => {
  const response = await axiosInstance.get(`/actions/status/${status}`);
  const rawData = response.data?.data || response.data;
  return transformActions(rawData?.actions || []);
};

/**
 * Bulk update multiple actions
 * @param {Object} data - { actionIds, updates }
 * @returns {Promise<Object>}
 */
export const bulkUpdateActions = async (data) => {
  const response = await axiosInstance.put("/actions/bulk/update", data);
  return response.data;
};

// ============================================================================
// 🔄 Feedback Transform (kept locally for this service)
// ============================================================================

/**
 * Transform feedback analysis response
 */
const transformFeedbackAnalysis = (data) => {
  if (!data || typeof data !== 'object') {
    return {
      summary: {},
      sentiment: { overall: 'neutral', breakdown: { positive: 0, negative: 0, neutral: 0 }, trend: 'stable' },
      topThemes: [],
      keyInsights: [],
      suggestedActions: [],
      urgentIssues: [],
      opportunities: [],
    };
  }

  return {
    summary: data.summary || {},
    sentiment: {
      overall: data.sentiment?.overall || "neutral",
      breakdown: data.sentiment?.breakdown || { positive: 0, negative: 0, neutral: 0 },
      trend: data.sentiment?.trend || "stable",
    },
    topThemes: data.topThemes || data.themes || [],
    keyInsights: data.keyInsights || data.insights || [],
    suggestedActions: data.suggestedActions || data.actions || [],
    urgentIssues: data.urgentIssues || [],
    opportunities: data.opportunities || [],
  };
};

// ============================================================================
// 📦 Default Export
// ============================================================================
export default {
  listActions,
  getActionById,
  getActionsBySurvey,
  getActionStats,
  createAction,
  updateAction,
  updateActionStatus,
  assignAction,
  deleteAction,
  addActionComment,
  generateActionsFromFeedback,
  analyzeFeedback,
  generateFollowUp,
  getActionsByPriority,
  getActionsByStatus,
  bulkUpdateActions,
};

