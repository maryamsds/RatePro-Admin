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
 * Backend returns: { success: true, data: action }
 * @param {string} actionId
 * @returns {Promise<Object>}
 */
export const getActionById = async (actionId) => {
  const response = await axiosInstance.get(`/actions/${actionId}`);
  // Backend shape: { success: true, data: <action document> }
  const raw = response.data?.data || response.data?.action || response.data;
  return transformAction(raw);
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
// 📋 Action Plan Operations (NEW - Action Management Enhancement)
// ============================================================================

/**
 * Get action plan for an action
 * Returns { actionPlan, steps } or { actionPlan: null, steps: [] }
 * Never throws for missing plans — handles both 200+null and legacy 404
 * @param {string} actionId
 * @returns {Promise<Object>}
 */
export const getActionPlan = async (actionId) => {
  try {
    const response = await axiosInstance.get(`/actions/${actionId}/plan`);
    const data = response.data?.data || response.data;

    // Backend now returns 200 with { actionPlan: null } when no plan exists
    if (!data || data.actionPlan === null) {
      return { actionPlan: null, steps: [] };
    }

    // Normalize: ensure consistent shape
    return {
      actionPlan: data.actionPlan || data,
      steps: data.steps || [],
    };
  } catch (error) {
    // Backward compatibility: handle legacy 404 from older backend versions
    if (error.response?.status === 404) {
      return { actionPlan: null, steps: [] };
    }
    throw error;
  }
};

/**
 * Create action plan for an action (starts in draft)
 * @param {string} actionId
 * @param {Object} planData
 * @returns {Promise<Object>}
 */
export const createActionPlan = async (actionId, planData) => {
  const response = await axiosInstance.post(`/actions/${actionId}/plan`, planData);
  return response.data?.data || response.data;
};

/**
 * Update action plan
 * @param {string} planId
 * @param {Object} planData
 * @returns {Promise<Object>}
 */
export const updateActionPlan = async (planId, planData) => {
  const response = await axiosInstance.put(`/action-plans/${planId}`, planData);
  return response.data?.data || response.data;
};

/**
 * Submit action plan for approval
 * @param {string} planId
 * @returns {Promise<Object>}
 */
export const submitActionPlanForApproval = async (planId) => {
  const response = await axiosInstance.post(`/action-plans/${planId}/submit`);
  return response.data?.data || response.data;
};

/**
 * Confirm/approve action plan (human confirmation)
 * @param {string} planId
 * @returns {Promise<Object>}
 */
export const confirmActionPlan = async (planId) => {
  const response = await axiosInstance.post(`/action-plans/${planId}/confirm`);
  return response.data?.data || response.data;
};

/**
 * Start action plan execution
 * @param {string} planId
 * @returns {Promise<Object>}
 */
export const startActionPlan = async (planId) => {
  const response = await axiosInstance.post(`/action-plans/${planId}/start`);
  return response.data?.data || response.data;
};

/**
 * Complete action plan
 * @param {string} planId
 * @param {Object} data - { completionNotes }
 * @returns {Promise<Object>}
 */
export const completeActionPlan = async (planId, data = {}) => {
  const response = await axiosInstance.post(`/action-plans/${planId}/complete`, data);
  return response.data?.data || response.data;
};

/**
 * Get steps for an action plan
 * @param {string} planId
 * @returns {Promise<Object>}
 */
export const getActionPlanSteps = async (planId) => {
  const response = await axiosInstance.get(`/action-plans/${planId}/steps`);
  return response.data?.data || response.data;
};

/**
 * Update step status
 * @param {string} stepId
 * @param {string} status - 'pending', 'in_progress', 'completed', 'skipped'
 * @param {Object} data - { notes, skipReason }
 * @returns {Promise<Object>}
 */
export const updateStepStatus = async (stepId, status, data = {}) => {
  const response = await axiosInstance.put(`/action-steps/${stepId}/status`, { status, ...data });
  return response.data?.data || response.data;
};

/**
 * Add custom step to action plan
 * @param {string} planId
 * @param {Object} stepData
 * @returns {Promise<Object>}
 */
export const addActionStep = async (planId, stepData) => {
  const response = await axiosInstance.post(`/action-plans/${planId}/steps`, stepData);
  return response.data?.data || response.data;
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
  // Action Plan
  getActionPlan,
  createActionPlan,
  updateActionPlan,
  submitActionPlanForApproval,
  confirmActionPlan,
  startActionPlan,
  completeActionPlan,
  getActionPlanSteps,
  updateStepStatus,
  addActionStep,
};

