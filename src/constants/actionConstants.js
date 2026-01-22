// src/constants/actionConstants.js
// ============================================================================
// ⚡ Action Constants - Shared status, priority, and UI configuration
// ============================================================================

/**
 * Action status values matching backend enum
 */
export const ACTION_STATUSES = {
    PENDING: 'pending',
    OPEN: 'open',
    IN_PROGRESS: 'in-progress',
    RESOLVED: 'resolved',
};

/**
 * Action priority values matching backend enum
 */
export const ACTION_PRIORITIES = {
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low',
    LONG_TERM: 'long-term',
};

/**
 * Status display configuration with color and icon
 */
export const STATUS_CONFIG = {
    [ACTION_STATUSES.PENDING]: {
        label: 'Pending',
        color: 'secondary',
        icon: 'MdSchedule',
    },
    [ACTION_STATUSES.OPEN]: {
        label: 'Open',
        color: 'info',
        icon: 'MdAssignment',
    },
    [ACTION_STATUSES.IN_PROGRESS]: {
        label: 'In Progress',
        color: 'primary',
        icon: 'MdTimer',
    },
    [ACTION_STATUSES.RESOLVED]: {
        label: 'Completed',
        color: 'success',
        icon: 'MdCheckCircle',
    },
};

/**
 * Priority display configuration with color and icon
 */
export const PRIORITY_CONFIG = {
    [ACTION_PRIORITIES.HIGH]: {
        label: 'High',
        color: 'danger',
        icon: 'MdPriorityHigh',
    },
    [ACTION_PRIORITIES.MEDIUM]: {
        label: 'Medium',
        color: 'warning',
        icon: 'MdWarning',
    },
    [ACTION_PRIORITIES.LOW]: {
        label: 'Low',
        color: 'info',
        icon: 'MdFlag',
    },
    [ACTION_PRIORITIES.LONG_TERM]: {
        label: 'Long Term',
        color: 'secondary',
        icon: 'MdSchedule',
    },
};

/**
 * Default stats object for fallback
 */
export const DEFAULT_STATS = {
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
    highPriority: 0,
    byStatus: [],
    byPriority: [],
    byDepartment: [],
    avgResolutionTime: null,
    completionRate: 0,
};

/**
 * Default action object for fallback
 */
export const DEFAULT_ACTION = {
    id: null,
    title: 'Untitled Action',
    description: '',
    status: ACTION_STATUSES.PENDING,
    priority: ACTION_PRIORITIES.MEDIUM,
    dueDate: null,
    location: 'N/A',
    department: 'Unassigned',
    assignee: null,
    feedback: {
        count: 0,
        sentiment: 'neutral',
        avgRating: 0,
    },
    isOverdue: false,
    comments: [],
    commentCount: 0,
};

/**
 * Tab configuration for filtering actions
 */
export const ACTION_TABS = {
    ALL: 'all',
    HIGH_PRIORITY: 'high-priority',
    OVERDUE: 'overdue',
};

/**
 * Filter default values
 */
export const DEFAULT_FILTERS = {
    priority: 'all',
    status: 'all',
    assignee: 'all',
    department: 'all',
    dateRange: 'all',
};

/**
 * Departments list for filtering
 */
export const DEPARTMENTS = [
    'Facilities',
    'Operations',
    'Customer Service',
    'Infrastructure',
    'HR',
    'IT',
    'Marketing',
    'Finance',
];

export default {
    ACTION_STATUSES,
    ACTION_PRIORITIES,
    STATUS_CONFIG,
    PRIORITY_CONFIG,
    DEFAULT_STATS,
    DEFAULT_ACTION,
    ACTION_TABS,
    DEFAULT_FILTERS,
    DEPARTMENTS,
};
