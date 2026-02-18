// src/pages/Actions/ActionManagement.jsx
"use client"
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdAssignment, MdFlag, MdCheckCircle, MdWarning,
  MdSchedule, MdPerson, MdLocationOn, MdTrendingUp,
  MdNotifications, MdAdd, MdEdit, MdDelete, MdVisibility,
  MdFilterList, MdRefresh, MdDownload, MdAssignmentTurnedIn,
  MdAssignmentLate, MdPriorityHigh, MdBusiness, MdGroup,
  MdComment, MdAttachment, MdTimer, MdSentimentSatisfied,
  MdSentimentDissatisfied, MdSentimentNeutral, MdInsights,
  MdError, MdBlock, MdArrowForward, MdOpenInNew
} from 'react-icons/md';
import {
  FaClock, FaUsers, FaExclamationTriangle, FaChartLine,
  FaBuilding, FaMapMarkerAlt, FaStar, FaRegStar
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

// Service imports
import {
  listActions,
  getActionStats,
  updateAction,
  assignAction,
  deleteAction,
  createAction,
  generateActionsFromFeedback
} from '../../api/services/actionService';
import { getTenantUsersForPicker } from '../../api/services/userService';

// Hooks
import { usePermissions } from '../../hooks/usePermissions';

// Constants imports
import {
  ACTION_STATUSES,
  ACTION_PRIORITIES,
  STATUS_CONFIG,
  PRIORITY_CONFIG,
  DEFAULT_STATS,
  DEFAULT_FILTERS,
  ACTION_TABS,
  DEPARTMENTS
} from '../../constants/actionConstants';

// Adapters
import { formatDate, isActionOverdue } from '../../api/adapters/actionAdapters';

// Components
import AssignmentHistory from '../../components/Actions/AssignmentHistory';

// ============================================================================
// Helper: Tailwind color mapping for badge configs (Using :root variables)
// ============================================================================

const BADGE_COLOR_MAP = {
  primary: 'bg-[var(--primary-color)]',
  secondary: 'bg-[var(--secondary-color)]',
  success: 'bg-[var(--success-color)]',
  danger: 'bg-[var(--danger-color)]',
  warning: 'bg-[var(--warning-color)]',
  info: 'bg-[var(--info-color)]',
  dark: 'bg-[var(--dark-card)]',
  light: 'bg-[var(--light-card)] text-[var(--light-text)]',
};

const STAT_CARD_COLORS = {
  primary: { bg: 'bg-[var(--primary-color)]', text: 'text-white' },
  warning: { bg: 'bg-[var(--warning-color)]', text: 'text-white' },
  info: { bg: 'bg-[var(--info-color)]', text: 'text-white' },
  success: { bg: 'bg-[var(--success-color)]', text: 'text-white' },
  danger: { bg: 'bg-[var(--danger-color)]', text: 'text-white' },
  dark: { bg: 'bg-[var(--dark-card)]', text: 'text-white' },
};

// ============================================================================
// 🎨 Badge Rendering Components
// ============================================================================

const PriorityBadge = ({ priority }) => {
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG[ACTION_PRIORITIES.MEDIUM];
  const IconMap = {
    MdPriorityHigh,
    MdWarning,
    MdFlag,
    MdSchedule,
  };
  const Icon = IconMap[config.icon] || MdFlag;
  const colorClass = BADGE_COLOR_MAP[config.color] || 'bg-gray-500';

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-white rounded-full text-xs font-medium ${colorClass}`}>
      <Icon size={14} />
      {config.label?.toUpperCase() || priority?.toUpperCase() || 'MEDIUM'}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG[ACTION_STATUSES.PENDING];
  const IconMap = {
    MdSchedule,
    MdAssignment,
    MdTimer,
    MdCheckCircle,
  };
  const Icon = IconMap[config.icon] || MdSchedule;
  const colorClass = BADGE_COLOR_MAP[config.color] || 'bg-gray-500';

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-white rounded-full text-xs font-medium ${colorClass}`}>
      <Icon size={14} />
      {config.label?.toUpperCase() || status?.replace('-', ' ').toUpperCase() || 'PENDING'}
    </span>
  );
};

// ============================================================================
// 🏷️ Source Badge Component (Action Origin)
// ============================================================================

const SourceBadge = ({ source }) => {
  const sourceConfig = {
    'ai_generated': { icon: MdInsights, color: 'bg-[var(--info-color)]', label: 'AI' },
    'survey_feedback': { icon: MdAssignment, color: 'bg-[var(--primary-color)]', label: 'Survey' },
    'manual': { icon: MdEdit, color: 'bg-[var(--secondary-color)]', label: 'Manual' }
  };
  const config = sourceConfig[source] || sourceConfig.manual;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-white rounded-full text-xs font-medium ${config.color}`}>
      <Icon size={12} />
      {config.label}
    </span>
  );
};

// ============================================================================
// 😊 Sentiment Badge Component (Read-Only Context)
// ============================================================================

const SentimentBadge = ({ sentiment }) => {
  if (!sentiment) return null;

  const sentimentConfig = {
    'positive': { icon: MdSentimentSatisfied, color: 'bg-[var(--success-light)] text-[var(--success-color)]', label: 'Positive' },
    'neutral': { icon: MdSentimentNeutral, color: 'bg-[var(--warning-light)] text-[var(--warning-color)]', label: 'Neutral' },
    'negative': { icon: MdSentimentDissatisfied, color: 'bg-[var(--danger-light)] text-[var(--danger-color)]', label: 'Negative' }
  };
  const config = sentimentConfig[sentiment] || sentimentConfig.neutral;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      <Icon size={14} />
      {config.label}
    </span>
  );
};

// ============================================================================
// 📊 Stats Cards Component (Redesigned)
// ============================================================================

const StatsCards = ({ stats }) => {
  const cards = [
    { key: 'total', label: 'Total Actions', icon: MdAssignment, color: 'primary' },
    { key: 'pending', label: 'Pending', icon: MdSchedule, color: 'warning' },
    { key: 'inProgress', label: 'In Progress', icon: MdTimer, color: 'info' },
    { key: 'completed', label: 'Completed', icon: MdCheckCircle, color: 'success' },
    { key: 'overdue', label: 'Overdue', icon: MdAssignmentLate, color: 'danger' },
    { key: 'highPriority', label: 'High Priority', icon: MdPriorityHigh, color: 'dark' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
      {cards.map(({ key, label, icon: Icon, color }) => {
        const colorConfig = STAT_CARD_COLORS[color] || STAT_CARD_COLORS.primary;
        return (
          <div key={key} className={`${colorConfig.bg} ${colorConfig.text} rounded-md shadow-md p-4 border border-[var(--light-border)] dark:border-[var(--dark-border)]`}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-white/20 dark:bg-white/30 flex items-center justify-center">
                <Icon size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats[key] ?? 0}</p>
                <p className="text-sm opacity-90">{label}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ============================================================================
// 🗂️ Empty State Component
// ============================================================================

const EmptyState = ({ onGenerateActions, isGenerating, canGenerate = false }) => (
  <div className="text-center py-12">
    <MdAssignment size={64} className="text-[var(--text-secondary)] mx-auto mb-3" />
    <h5 className="font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">No Actions Found</h5>
    <p className="text-[var(--text-secondary)] mb-3">
      No action items match your current filters.
      {canGenerate && ' Try generating AI actions from recent feedback.'}
    </p>
    {canGenerate && (
      <button
        onClick={onGenerateActions}
        disabled={isGenerating}
        className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)] disabled:opacity-50"
      >
        {isGenerating ? (
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2"></span>
        ) : (
          <MdInsights className="inline mr-2" />
        )}
        Generate AI Actions
      </button>
    )}
  </div>
);

// ============================================================================
// ❌ Error State Component
// ============================================================================

const ErrorState = ({ error, onRetry }) => (
  <div className="flex items-center justify-between p-4 mb-4 bg-[var(--danger-light)] border border-[var(--danger-color)] rounded-md text-[var(--danger-color)]">
    <div className="flex items-center gap-2">
      <MdError size={24} />
      <span>{error || 'Failed to load actions. Please try again.'}</span>
    </div>
    <button onClick={onRetry} className="px-3 py-1 rounded-md font-medium transition-colors bg-[var(--danger-color)] text-white hover:opacity-90 text-sm">
      <MdRefresh className="inline mr-1" />
      Retry
    </button>
  </div>
);

// ============================================================================
// 📋 Action Table Row Component
// ============================================================================

const ActionTableRow = ({
  action,
  onStatusChange,
  onViewDetails,
  onDelete,
  isUpdating,
  canDelete = false
}) => {
  const isOverdue = action.isOverdue || isActionOverdue(action);

  return (
    <tr className={`border-b border-[var(--light-border)] dark:border-[var(--dark-border)] transition-colors ${
      isOverdue 
        ? 'bg-[var(--danger-light)]' 
        : 'hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)]'
    }`}>
      {/* Title + Description */}
      <td className="px-4 py-3" style={{ minWidth: 280 }}>
        <div className="flex items-start gap-2">
          <div className="flex-grow">
            <div
              className="font-semibold mb-1 cursor-pointer text-[var(--light-text)] dark:text-[var(--dark-text)] hover:text-[var(--primary-color)] transition-colors"
              role="button"
              onClick={() => onViewDetails(action)}
            >
              {action.title || 'Untitled Action'}
            </div>
            <p className="text-[var(--text-secondary)] text-xs mb-1 truncate" style={{ maxWidth: 320 }}>
              {action.description || 'No description provided'}
            </p>
            <div className="flex flex-wrap gap-1">
              <SourceBadge source={action.source} />
              {action.metadata?.sentiment && (
                <SentimentBadge sentiment={action.metadata.sentiment} />
              )}
              {isOverdue && <span className="px-2 py-0.5 bg-[var(--danger-color)] text-white rounded-full text-xs font-medium">Overdue</span>}
            </div>
          </div>
        </div>
      </td>

      {/* Priority */}
      <td className="px-4 py-3 align-middle">
        <PriorityBadge priority={action.priority} />
      </td>

      {/* Status */}
      <td className="px-4 py-3 align-middle">
        <StatusBadge status={action.status} />
      </td>

      {/* Assignee */}
      <td className="px-4 py-3 align-middle">
        <div className="flex items-center gap-1 text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">
          <MdPerson size={16} className="text-[var(--text-secondary)]" />
          <span className="truncate" style={{ maxWidth: 120 }}>
            {action.assigneeName || action.assignee?.name || 'Unassigned'}
          </span>
        </div>
      </td>

      {/* Department */}
      <td className="px-4 py-3 align-middle">
        <span className="text-sm text-[var(--text-secondary)]">
          {action.department || action.category || '—'}
        </span>
      </td>

      {/* Due Date */}
      <td className="px-4 py-3 align-middle">
        <span className={`text-sm ${
          isOverdue 
            ? 'text-[var(--danger-color)] font-semibold' 
            : 'text-[var(--text-secondary)]'
        }`}>
          {action.dueDate ? formatDate(action.dueDate) : '—'}
        </span>
      </td>

      {/* Actions */}
      <td className="px-4 py-3 align-middle text-right">
        <div className="flex gap-1 justify-end">
          {action.status === ACTION_STATUSES.PENDING && (
            <button
              onClick={() => onStatusChange(action.id, ACTION_STATUSES.IN_PROGRESS)}
              disabled={isUpdating}
              title="Start"
              className="p-1.5 rounded-md font-medium transition-colors bg-[var(--info-color)] text-white hover:opacity-90 disabled:opacity-50"
            >
              {isUpdating ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block"></span>
              ) : (
                <MdTimer size={16} />
              )}
            </button>
          )}

          {action.status === ACTION_STATUSES.IN_PROGRESS && (
            <button
              onClick={() => onStatusChange(action.id, ACTION_STATUSES.RESOLVED)}
              disabled={isUpdating}
              title="Complete"
              className="p-1.5 rounded-md font-medium transition-colors bg-[var(--success-color)] text-white hover:opacity-90 disabled:opacity-50"
            >
              {isUpdating ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block"></span>
              ) : (
                <MdCheckCircle size={16} />
              )}
            </button>
          )}

          <button
            onClick={() => onViewDetails(action)}
            title="View Details"
            className="p-1.5 rounded-md font-medium transition-colors border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)]"
          >
            <MdArrowForward size={16} />
          </button>

          {canDelete && (
            <button
              onClick={() => onDelete(action)}
              title="Delete"
              className="p-1.5 rounded-md font-medium transition-colors bg-[var(--danger-color)] text-white hover:opacity-90"
            >
              <MdDelete size={16} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

// ============================================================================
// 📋 Action Table Component
// ============================================================================

const ActionTable = ({
  actions,
  onStatusChange,
  onViewDetails,
  onDelete,
  updatingActionId,
  canDelete,
  onGenerateActions,
  isGenerating,
  canGenerate
}) => {
  if (actions.length === 0) {
    return (
      <EmptyState
        onGenerateActions={onGenerateActions}
        isGenerating={isGenerating}
        canGenerate={canGenerate}
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <tr>
            <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">Action</th>
            <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">Priority</th>
            <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">Status</th>
            <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">Assignee</th>
            <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">Department</th>
            <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">Due Date</th>
            <th className="p-3 text-right text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-[var(--light-card)] dark:bg-[var(--dark-card)]">
          {actions.map(action => (
            <ActionTableRow
              key={action.id || action._id}
              action={action}
              onStatusChange={onStatusChange}
              onViewDetails={onViewDetails}
              onDelete={onDelete}
              isUpdating={updatingActionId === action.id}
              canDelete={canDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ============================================================================
// 🎛️ Filters Component (Redesigned)
// ============================================================================

const FiltersBar = ({ filters, setFilters, onClearFilters, searchTerm, onSearchChange }) => (
  <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md mb-4 border border-[var(--light-border)] dark:border-[var(--dark-border)] p-3">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2 items-center">
      <div className="flex items-center border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-md overflow-hidden">
        <span className="px-3 bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--text-secondary)] border-r border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <MdFilterList size={16} />
        </span>
        <input
          type="text"
          className="w-full px-3 py-2 bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] text-sm"
          placeholder="Search actions..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <select
        className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] text-sm"
        value={filters.priority}
        onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
      >
        <option value="all">All Priorities</option>
        {Object.values(ACTION_PRIORITIES).map(p => (
          <option key={p} value={p}>
            {PRIORITY_CONFIG[p]?.label || p}
          </option>
        ))}
      </select>

      <select
        className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] text-sm"
        value={filters.status}
        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
      >
        <option value="all">All Status</option>
        {Object.values(ACTION_STATUSES).map(s => (
          <option key={s} value={s}>
            {STATUS_CONFIG[s]?.label || s}
          </option>
        ))}
      </select>

      <select
        className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] text-sm"
        value={filters.department}
        onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
      >
        <option value="all">All Departments</option>
        {DEPARTMENTS.map(d => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>

      <button
        onClick={onClearFilters}
        className="flex items-center gap-1 px-3 py-2 rounded-md font-medium transition-colors border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] text-sm"
      >
        <MdRefresh size={16} />
        Reset
      </button>
    </div>
  </div>
);

// ============================================================================
// Helper: Compute stats from the actions list as fallback
// ============================================================================

const computeStatsFromActions = (actions) => {
  if (!Array.isArray(actions) || actions.length === 0) return { ...DEFAULT_STATS };

  const stats = {
    total: actions.length,
    pending: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
    highPriority: 0,
  };

  actions.forEach((a) => {
    const status = a.status;
    if (status === 'pending' || status === 'open') stats.pending++;
    if (status === 'in-progress') stats.inProgress++;
    if (status === 'resolved' || status === 'completed') stats.completed++;
    if (a.isOverdue || isActionOverdue(a)) stats.overdue++;
    if (a.priority === 'high') stats.highPriority++;
  });

  return stats;
};

// ============================================================================
// 🏠 Main Component
// ============================================================================

const ActionManagement = () => {
  const navigate = useNavigate();

  // Permission-based access control (mirrors backend enforceTenantScope)
  const { isSystemAdmin, isCompanyAdmin, hasPermission, canAssignAction, canAccessTenantFeatures } = usePermissions();

  // System Admin blocked from tenant actions - show blocked state
  if (isSystemAdmin) {
    return (
      <div className="w-full py-12 text-center">
        <MdBlock size={64} className="text-[var(--danger-color)] mx-auto mb-3" />
        <h4 className="text-xl font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">Access Restricted</h4>
        <p className="text-[var(--text-secondary)]">
          System Admin cannot access tenant action management.<br />
          Please use Company Admin or Member account to manage actions.
        </p>
      </div>
    );
  }

  // State Management
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(ACTION_TABS.ALL);
  const [updatingActionId, setUpdatingActionId] = useState(null);
  const [assigningActionId, setAssigningActionId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal States
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);

  // Filters
  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS });

  // Stats
  const [stats, setStats] = useState({ ...DEFAULT_STATS });

  // ============================================================================
  // 📡 Data Fetching
  // ============================================================================

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError('');

      const actionsData = await listActions({
        priority: filters.priority,
        status: filters.status !== 'all' ? filters.status : undefined,
        assignee: filters.assignee,
        department: filters.department,
        dateRange: filters.dateRange,
        tab: activeTab,
        page: 1,
        limit: 50
      });

      console.log(actionsData)

      const fetchedActions = actionsData.actions || [];
      setActions(fetchedActions);

      try {
        const statsData = await getActionStats({ period: '30' });
        const backendTotal = statsData?.total || 0;
        if (backendTotal > 0) {
          setStats(statsData);
        } else {
          setStats(computeStatsFromActions(fetchedActions));
        }
      } catch (statsErr) {
        console.warn('Stats endpoint failed, computing from actions list:', statsErr.message);
        setStats(computeStatsFromActions(fetchedActions));
      }

    } catch (err) {
      console.error('Error fetching actions:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load actions');
      setStats(prev => prev.total > 0 ? prev : { ...DEFAULT_STATS });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters, activeTab]);

  const handleRefresh = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ============================================================================
  // 🔄 Filter actions based on active tab + search
  // ============================================================================

  const filteredActions = useMemo(() => {
    if (!Array.isArray(actions)) return [];

    let result = actions;

    switch (activeTab) {
      case ACTION_TABS.HIGH_PRIORITY:
        result = result.filter(a => a.priority === ACTION_PRIORITIES.HIGH);
        break;
      case ACTION_TABS.OVERDUE:
        result = result.filter(a => a.isOverdue || isActionOverdue(a));
        break;
      default:
        break;
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(a =>
        (a.title || '').toLowerCase().includes(term) ||
        (a.description || '').toLowerCase().includes(term) ||
        (a.assigneeName || '').toLowerCase().includes(term) ||
        (a.department || '').toLowerCase().includes(term)
      );
    }

    return result;
  }, [actions, activeTab, searchTerm]);

  // ============================================================================
  // 🎯 Action Handlers with Optimistic Updates
  // ============================================================================

  const handleStatusChange = async (actionId, newStatus) => {
    setUpdatingActionId(actionId);

    const previousActions = [...actions];
    setActions(prev => prev.map(a =>
      a.id === actionId ? { ...a, status: newStatus } : a
    ));

    try {
      await updateAction(actionId, { status: newStatus });
      toast.success(`Action ${newStatus === ACTION_STATUSES.RESOLVED ? 'completed' : 'started'} successfully!`);

      const updated = previousActions.map(a =>
        a.id === actionId ? { ...a, status: newStatus } : a
      );
      setStats(computeStatsFromActions(updated));
    } catch (error) {
      console.error('Error updating action status:', error);
      setActions(previousActions);
      toast.error(error.response?.data?.message || 'Failed to update action status');
    } finally {
      setUpdatingActionId(null);
    }
  };

  const handleDeleteAction = async (action) => {
    const result = await Swal.fire({
      title: 'Delete Action?',
      text: `Are you sure you want to delete "${action.title || 'this action'}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    const previousActions = [...actions];
    const updatedActions = actions.filter(a => a.id !== action.id);
    setActions(updatedActions);
    setStats(computeStatsFromActions(updatedActions));

    try {
      await deleteAction(action.id);
      toast.success('Action deleted successfully!');
    } catch (error) {
      console.error('Error deleting action:', error);
      setActions(previousActions);
      setStats(computeStatsFromActions(previousActions));
      toast.error(error.response?.data?.message || 'Failed to delete action');
    }
  };

  const handleViewDetails = (action) => {
    const actionId = action.id || action._id;
    navigate(`/app/actions/${actionId}`);
  };

  const handleAssignToMe = async (actionId) => {
    setAssigningActionId(actionId);

    try {
      const userDataStr = localStorage.getItem('userData');
      if (!userDataStr) {
        toast.error('Please log in to assign actions');
        return;
      }

      const userData = JSON.parse(userDataStr);
      const currentUserId = userData._id || userData.id;

      if (!currentUserId) {
        toast.error('Unable to get user ID');
        return;
      }

      await assignAction(actionId, { assignedTo: currentUserId });

      setActions(prev => prev.map(a =>
        a.id === actionId ? {
          ...a,
          assignee: { id: currentUserId, name: userData.name || 'Me' },
          assigneeName: userData.name || 'Me'
        } : a
      ));

      if (selectedAction && selectedAction.id === actionId) {
        setSelectedAction(prev => ({
          ...prev,
          assignee: { id: currentUserId, name: userData.name || 'Me' },
          assigneeName: userData.name || 'Me'
        }));
      }

      toast.success('Action assigned to you successfully!');
    } catch (error) {
      console.error('Error assigning action:', error);
      toast.error(error.response?.data?.message || 'Failed to assign action');
    } finally {
      setAssigningActionId(null);
    }
  };

  const handleGenerateActions = async () => {
    setRefreshing(true);
    try {
      await generateActionsFromFeedback({});
      toast.success('AI actions generated successfully!');
      handleRefresh();
    } catch (error) {
      console.error('Error generating AI actions:', error);
      toast.error(error.response?.data?.message || 'Failed to generate AI actions');
      setRefreshing(false);
    }
  };

  const handleClearFilters = () => {
    setFilters({ ...DEFAULT_FILTERS });
    setSearchTerm('');
  };

  // ============================================================================
  // Tab definitions
  // ============================================================================

  const tabItems = [
    { key: ACTION_TABS.ALL, icon: <MdAssignment size={16} />, label: 'All', count: stats.total, countColor: 'bg-[var(--secondary-color)]' },
    { key: ACTION_TABS.HIGH_PRIORITY, icon: <MdPriorityHigh size={16} />, label: 'High Priority', count: stats.highPriority, countColor: 'bg-[var(--danger-color)]' },
    { key: ACTION_TABS.OVERDUE, icon: <MdAssignmentLate size={16} />, label: 'Overdue', count: stats.overdue, countColor: 'bg-[var(--warning-color)] text-gray-800' },
  ];

  // ============================================================================
  // 🔄 Loading State
  // ============================================================================

  if (loading) {
    return (
      <div className="w-full py-12 text-center">
        <div className="w-12 h-12 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-3 text-[var(--text-secondary)]">Loading action items...</p>
      </div>
    );
  }

  // ============================================================================
  // 🎨 Main Render
  // ============================================================================

  return (
    <div className="w-full px-4 py-4">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold mb-1 flex items-center gap-2 text-[var(--light-text)] dark:text-[var(--dark-text)]">
            <MdAssignment size={28} className="text-[var(--primary-color)]" />
            Action Management
          </h2>
          <p className="text-[var(--text-secondary)] text-sm mb-0">
            Track and manage action items from survey feedback
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 rounded-md font-medium transition-colors border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] disabled:opacity-50 text-sm flex items-center gap-1"
          >
            {refreshing ? (
              <span className="w-4 h-4 border-2 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin inline-block"></span>
            ) : (
              <MdRefresh size={18} />
            )}
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          {isCompanyAdmin && (
            <button
              onClick={handleGenerateActions}
              disabled={refreshing}
              className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)] disabled:opacity-50 text-sm flex items-center gap-1"
            >
              <MdInsights size={18} />
              Generate AI Actions
            </button>
          )}
        </div>
      </div>

      {/* Error State */}
      {error && <ErrorState error={error} onRetry={handleRefresh} />}

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Filters Bar */}
      <FiltersBar
        filters={filters}
        setFilters={setFilters}
        onClearFilters={handleClearFilters}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* Tab Content */}
      <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
        {/* Tab Navigation */}
        <div className="flex border-b border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-t-md overflow-x-auto">
          {tabItems.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-b-[var(--primary-color)] text-[var(--primary-color)]'
                  : 'border-b-transparent text-[var(--text-secondary)] hover:text-[var(--light-text)] dark:hover:text-[var(--dark-text)]'
              }`}
            >
              {tab.icon}
              {tab.label}
              <span className={`px-1.5 py-0.5 text-white rounded-full text-xs font-medium ml-1 ${tab.countColor}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Table */}
        <ActionTable
          actions={filteredActions}
          onStatusChange={handleStatusChange}
          onViewDetails={handleViewDetails}
          onDelete={handleDeleteAction}
          updatingActionId={updatingActionId}
          canDelete={isCompanyAdmin}
          onGenerateActions={handleGenerateActions}
          isGenerating={refreshing}
          canGenerate={isCompanyAdmin}
        />

        {/* Results count footer */}
        {filteredActions.length > 0 && (
          <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--text-secondary)] text-sm py-2 px-4 border-t border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-b-md">
            Showing {filteredActions.length} of {stats.total} actions
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowDetailModal(false)}>
          <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col border border-[var(--light-border)] dark:border-[var(--dark-border)]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <h5 className="text-lg font-semibold m-0 text-[var(--light-text)] dark:text-[var(--dark-text)]">Action Details</h5>
              <button onClick={() => setShowDetailModal(false)} className="p-1 hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] rounded-full transition-colors text-xl text-[var(--light-text)] dark:text-[var(--dark-text)]">×</button>
            </div>
            <div className="p-4 overflow-y-auto" style={{ maxHeight: '70vh' }}>
              {selectedAction && (
                <div>
                  <h5 className="font-semibold text-lg text-[var(--light-text)] dark:text-[var(--dark-text)]">{selectedAction.title}</h5>
                  <p className="text-[var(--text-secondary)]">{selectedAction.description}</p>

                  <hr className="my-3 border-[var(--light-border)] dark:border-[var(--dark-border)]" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-[var(--light-text)] dark:text-[var(--dark-text)]"><strong>Status:</strong> <StatusBadge status={selectedAction.status} /></p>
                      <p className="text-[var(--light-text)] dark:text-[var(--dark-text)]"><strong>Priority:</strong> <PriorityBadge priority={selectedAction.priority} /></p>
                      <p className="text-[var(--light-text)] dark:text-[var(--dark-text)]"><strong>Department:</strong> {selectedAction.department || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[var(--light-text)] dark:text-[var(--dark-text)]"><strong>Due Date:</strong> {formatDate(selectedAction.dueDate)}</p>
                      <p className="text-[var(--light-text)] dark:text-[var(--dark-text)]"><strong>Created:</strong> {formatDate(selectedAction.createdAt)}</p>
                    </div>
                  </div>

                  <hr className="my-3 border-[var(--light-border)] dark:border-[var(--dark-border)]" />
                  <h6 className="font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">Assignment</h6>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center mb-3">
                    <div>
                      <p className="mb-1 text-[var(--light-text)] dark:text-[var(--dark-text)]"><strong>Current Assignee:</strong></p>
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-[var(--secondary-color)] text-white rounded-full text-sm">
                        <MdPerson />
                        {selectedAction.assigneeName || 'Unassigned'}
                      </span>
                    </div>
                    <div>
                      {(isCompanyAdmin || canAssignAction(selectedAction)) && (
                        <button
                          onClick={() => handleAssignToMe(selectedAction.id)}
                          disabled={assigningActionId === selectedAction.id}
                          className="px-3 py-2 rounded-md font-medium transition-colors border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--primary-color)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] text-sm disabled:opacity-50"
                        >
                          {assigningActionId === selectedAction.id ? (
                            <span className="w-4 h-4 border-2 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin inline-block mr-1"></span>
                          ) : (
                            <MdPerson className="inline mr-1" />
                          )}
                          Assign to Me
                        </button>
                      )}
                    </div>
                  </div>

                  {selectedAction.assignmentHistory && selectedAction.assignmentHistory.length > 0 && (
                    <>
                      <hr className="my-3 border-[var(--light-border)] dark:border-[var(--dark-border)]" />
                      <AssignmentHistory history={selectedAction.assignmentHistory} />
                    </>
                  )}

                  <hr className="my-3 border-[var(--light-border)] dark:border-[var(--dark-border)]" />
                  <h6 className="font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">Action Source</h6>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="mb-2 text-[var(--light-text)] dark:text-[var(--dark-text)]">
                        <strong>Generated From:</strong>{' '}
                        <SourceBadge source={selectedAction.source} />
                      </p>
                      {selectedAction.metadata?.surveyId && (
                        <p className="mb-2 text-[var(--light-text)] dark:text-[var(--dark-text)]">
                          <strong>Survey ID:</strong>{' '}
                          <code className="text-xs bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] px-1 rounded text-[var(--light-text)] dark:text-[var(--dark-text)]">{selectedAction.metadata.surveyId}</code>
                        </p>
                      )}
                    </div>
                    <div>
                      {selectedAction.metadata?.sentiment && (
                        <p className="mb-2 text-[var(--light-text)] dark:text-[var(--dark-text)]">
                          <strong>Original Sentiment:</strong>{' '}
                          <SentimentBadge sentiment={selectedAction.metadata.sentiment} />
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-[var(--light-border)] dark:border-[var(--dark-border)]">
              {selectedAction && (
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    handleViewDetails(selectedAction);
                  }}
                  className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)]"
                >
                  <MdOpenInNew className="inline mr-1" />
                  Open Full View
                </button>
              )}
              <button onClick={() => setShowDetailModal(false)} className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--secondary-color)] text-white hover:opacity-90">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionManagement;
