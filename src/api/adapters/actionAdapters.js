// src/api/adapters/actionAdapters.js
// ============================================================================
// 🔄 Action Adapters - Data transformation with null-safety
// ============================================================================

import {
    ACTION_STATUSES,
    ACTION_PRIORITIES,
    DEFAULT_ACTION,
    DEFAULT_STATS,
} from '../../constants/actionConstants';

// ============================================================================
// 🛠️ Utility Helpers
// ============================================================================

/**
 * Safely get nested property with fallback
 * @param {Object} obj - Source object
 * @param {string} path - Dot-notation path (e.g. 'feedback.count')
 * @param {*} fallback - Fallback value if path doesn't exist
 * @returns {*}
 */
export const safeGet = (obj, path, fallback = null) => {
    if (!obj || typeof obj !== 'object') return fallback;

    const keys = path.split('.');
    let result = obj;

    for (const key of keys) {
        if (result == null || typeof result !== 'object') {
            return fallback;
        }
        result = result[key];
    }

    return result ?? fallback;
};

/**
 * Format date safely
 * @param {string|Date} date
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string}
 */
export const formatDate = (date, options = {}) => {
    if (!date) return 'N/A';

    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return 'N/A';

        const defaultOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        };

        return d.toLocaleDateString('en-US', { ...defaultOptions, ...options });
    } catch {
        return 'N/A';
    }
};

/**
 * Check if action is overdue
 * @param {Object} action
 * @returns {boolean}
 */
export const isActionOverdue = (action) => {
    if (!action?.dueDate) return false;

    const dueDate = new Date(action.dueDate);
    if (isNaN(dueDate.getTime())) return false;

    const resolvedStatuses = [ACTION_STATUSES.RESOLVED, 'completed'];
    return dueDate < new Date() && !resolvedStatuses.includes(action.status);
};

// ============================================================================
// 🔄 Action Transformers
// ============================================================================

/**
 * Transform raw backend action to frontend-friendly format
 * Handles null/undefined fields gracefully
 * @param {Object} action - Raw action from backend
 * @returns {Object} Normalized action
 */
export const transformAction = (action) => {
    if (!action || typeof action !== 'object') {
        return { ...DEFAULT_ACTION };
    }

    const id = action._id || action.id || null;

    // Safely extract assignee info
    const assignee = action.assignedTo || action.assignee;
    const normalizedAssignee = assignee
        ? {
            id: assignee._id || assignee.id || assignee,
            name: assignee.name || 'Unassigned',
            email: assignee.email || null,
            avatar: assignee.avatar || null,
        }
        : null;

    // Safely extract feedback info
    const feedback = action.feedback || {};
    const normalizedFeedback = {
        count: safeGet(feedback, 'count', 0),
        sentiment: safeGet(feedback, 'sentiment', 'neutral'),
        avgRating: safeGet(feedback, 'avgRating', 0),
        summary: safeGet(feedback, 'summary', null),
        category: safeGet(feedback, 'category', null),
    };

    // Safely extract survey info
    const survey = action.survey;
    const normalizedSurvey = survey
        ? {
            id: survey._id || survey.id || survey,
            title: survey.title || 'Unknown Survey',
        }
        : null;

    return {
        id,
        _id: id,
        title: action.title || DEFAULT_ACTION.title,
        description: action.description || '',
        status: action.status || ACTION_STATUSES.PENDING,
        priority: action.priority || ACTION_PRIORITIES.MEDIUM,

        // Dates
        dueDate: action.dueDate || null,
        createdAt: action.createdAt || null,
        updatedAt: action.updatedAt || null,
        completedAt: action.completedAt || null,

        // Location & Department
        location: action.location || action.team || 'N/A',
        department: action.department || action.category || 'Unassigned',
        team: action.team || null,
        category: action.category || 'general',

        // Assignment
        assignee: normalizedAssignee,
        assigneeName: normalizedAssignee?.name || 'Unassigned',

        // Relations
        survey: normalizedSurvey,
        feedback: normalizedFeedback,

        // AI metadata
        isAiGenerated: action.isAiGenerated || action.source === 'ai_generated',
        aiConfidence: action.aiConfidence || safeGet(action, 'metadata.confidence', null),
        source: action.source || 'manual',

        // Progress & Resolution
        progress: action.progress || 0,
        resolution: action.resolution || null,

        // Computed
        isOverdue: isActionOverdue(action),

        // Comments
        comments: Array.isArray(action.comments) ? action.comments : [],
        commentCount: Array.isArray(action.comments) ? action.comments.length : 0,

        // Tags
        tags: Array.isArray(action.tags) ? action.tags : [],
    };
};

/**
 * Transform array of actions safely
 * @param {Array} actions
 * @returns {Array}
 */
export const transformActions = (actions) => {
    if (!Array.isArray(actions)) return [];
    return actions.map(transformAction);
};

// ============================================================================
// 📊 Stats Transformers
// ============================================================================

/**
 * Helper to extract count from status array
 */
const getStatusCount = (byStatus, status) => {
    if (!Array.isArray(byStatus)) return 0;
    const found = byStatus.find(
        (item) => item._id === status || item.status === status
    );
    return found?.count || 0;
};

/**
 * Helper to extract count from priority array
 */
const getPriorityCount = (byPriority, priority) => {
    if (!Array.isArray(byPriority)) return 0;
    const found = byPriority.find(
        (item) => item._id === priority || item.priority === priority
    );
    return found?.count || 0;
};

/**
 * Sum counts from array
 */
const sumByField = (arr, field) => {
    if (!Array.isArray(arr)) return 0;
    return arr.reduce((sum, item) => sum + (item[field] || 0), 0);
};

/**
 * Transform backend analytics to frontend stats format
 * @param {Object} data - Raw analytics from backend
 * @returns {Object} Normalized stats
 */
export const transformActionStats = (data) => {
    if (!data || typeof data !== 'object') {
        return { ...DEFAULT_STATS };
    }

    const byStatus = data.byStatus || [];
    const byPriority = data.byPriority || [];

    // Calculate total from priority counts if not provided
    const total = data.total || sumByField(byPriority, 'count') || sumByField(byStatus, 'count');

    return {
        total,
        pending: getStatusCount(byStatus, 'pending') + getStatusCount(byStatus, 'open'),
        inProgress: getStatusCount(byStatus, 'in-progress'),
        completed: getStatusCount(byStatus, 'resolved'),
        overdue: data.overdue || 0,
        highPriority: getPriorityCount(byPriority, 'high'),

        // Raw breakdowns
        byStatus,
        byPriority,
        byDepartment: data.byDepartment || data.byTeam || [],
        timeline: data.timeline || [],

        // Metrics
        avgResolutionTime: data.avgResolutionTime || null,
        completionRate: data.completionRate || 0,
        period: data.period || 30,
    };
};

// ============================================================================
// 📤 Request Adapters (Frontend -> Backend)
// ============================================================================

/**
 * Transform frontend action data for create/update requests
 * @param {Object} data - Frontend action data
 * @returns {Object} Backend-compatible payload
 */
export const toCreateActionPayload = (data) => {
    return {
        title: data.title?.trim() || '',
        description: data.description?.trim() || '',
        priority: data.priority || ACTION_PRIORITIES.MEDIUM,
        status: data.status || ACTION_STATUSES.PENDING,
        dueDate: data.dueDate || null,
        department: data.department || null,
        team: data.team || data.location || null,
        assignedTo: data.assigneeId || data.assignedTo || null,
        category: data.category || 'general',
        tags: Array.isArray(data.tags) ? data.tags : [],
    };
};

/**
 * Transform status update payload
 * @param {string} newStatus
 * @returns {Object}
 */
export const toStatusUpdatePayload = (newStatus) => ({
    status: newStatus,
});

/**
 * Transform priority update payload
 * @param {string} newPriority
 * @returns {Object}
 */
export const toPriorityUpdatePayload = (newPriority) => ({
    priority: newPriority,
});

/**
 * Transform assignment payload
 * @param {Object} data - { assigneeId, team }
 * @returns {Object}
 */
export const toAssignmentPayload = (data) => ({
    assignedTo: data.assigneeId || data.assignedTo || null,
    team: data.team || null,
});

export default {
    safeGet,
    formatDate,
    isActionOverdue,
    transformAction,
    transformActions,
    transformActionStats,
    toCreateActionPayload,
    toStatusUpdatePayload,
    toPriorityUpdatePayload,
    toAssignmentPayload,
};
