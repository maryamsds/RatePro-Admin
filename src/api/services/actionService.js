// src/api/services/actionService.js
// ============================================================================
// ⚡ Action Service - API calls with response transformation
// ============================================================================
import axiosInstance from "../axiosInstance";

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
    tab = "all" 
  } = params;
  
  const queryParams = new URLSearchParams();
  queryParams.append("page", page);
  queryParams.append("limit", limit);
  if (status && status !== "all") queryParams.append("status", status);
  if (priority && priority !== "all") queryParams.append("priority", priority);
  if (assignee && assignee !== "all") queryParams.append("assignee", assignee);
  if (department && department !== "all") queryParams.append("department", department);
  if (dateRange && dateRange !== "all") queryParams.append("dateRange", dateRange);
  if (tab && tab !== "all") queryParams.append("tab", tab);

  const response = await axiosInstance.get(`/actions?${queryParams.toString()}`);
  
  return {
    actions: (response.data.actions || []).map(transformAction),
    total: response.data.total || 0,
    page: response.data.page || page,
    limit: response.data.limit || limit,
    totalPages: Math.ceil((response.data.total || 0) / limit),
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
  const response = await axiosInstance.post("/surveys/actions/generate", data);
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
// 🔄 Transform Functions
// ============================================================================

/**
 * Transform action item
 */
const transformAction = (action) => ({
  id: action._id,
  _id: action._id,
  title: action.title,
  description: action.description,
  status: action.status || "open",
  priority: action.priority || "medium",
  dueDate: action.dueDate,
  createdAt: action.createdAt,
  updatedAt: action.updatedAt,
  
  // Assignee info
  assignee: action.assignee ? {
    id: action.assignee._id || action.assignee,
    name: action.assignee.name || "Unassigned",
    email: action.assignee.email,
    avatar: action.assignee.avatar,
  } : null,
  
  team: action.team,
  department: action.department,
  
  // Source info
  survey: action.survey ? {
    id: action.survey._id || action.survey,
    title: action.survey.title,
  } : null,
  response: action.response,
  
  // AI-generated metadata
  isAiGenerated: action.isAiGenerated || action.source === "ai",
  aiConfidence: action.aiConfidence,
  suggestedActions: action.suggestedActions || [],
  
  // Progress
  progress: action.progress || 0,
  completedAt: action.completedAt,
  
  // Computed
  isOverdue: action.dueDate ? new Date(action.dueDate) < new Date() && action.status !== "resolved" : false,
  
  // Comments
  comments: action.comments || [],
  commentCount: action.comments?.length || 0,
});

/**
 * Transform action statistics
 */
const transformActionStats = (data) => ({
  total: data.total || sumByField(data.byPriority, "count"),
  pending: getStatusCount(data.byStatus, "open"),
  inProgress: getStatusCount(data.byStatus, "in-progress"),
  completed: getStatusCount(data.byStatus, "resolved"),
  overdue: data.overdue || 0,
  highPriority: getPriorityCount(data.byPriority, "high"),
  
  byStatus: data.byStatus || [],
  byPriority: data.byPriority || [],
  byDepartment: data.byDepartment || [],
  
  avgResolutionTime: data.avgResolutionTime || null,
  completionRate: data.completionRate || 0,
});

/**
 * Transform feedback analysis response
 */
const transformFeedbackAnalysis = (data) => ({
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
});

// ============================================================================
// 🛠️ Helper Functions
// ============================================================================

const sumByField = (arr, field) => {
  if (!Array.isArray(arr)) return 0;
  return arr.reduce((sum, item) => sum + (item[field] || 0), 0);
};

const getStatusCount = (byStatus, status) => {
  if (!Array.isArray(byStatus)) return 0;
  const found = byStatus.find((item) => item._id === status || item.status === status);
  return found?.count || 0;
};

const getPriorityCount = (byPriority, priority) => {
  if (!Array.isArray(byPriority)) return 0;
  const found = byPriority.find((item) => item._id === priority || item.priority === priority);
  return found?.count || 0;
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
};
