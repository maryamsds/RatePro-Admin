// src\pages\Actions\ActionManagement.jsx
"use client"
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Row, Col, Card, Button, Badge, Tab, Tabs,
  Form, Modal, Alert, Spinner, Table, InputGroup,
  OverlayTrigger, Tooltip, Dropdown, ProgressBar,
  ListGroup
} from 'react-bootstrap';
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

  return (
    <Badge bg={config.color} className="d-flex align-items-center gap-1">
      <Icon size={14} />
      {config.label?.toUpperCase() || priority?.toUpperCase() || 'MEDIUM'}
    </Badge>
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

  return (
    <Badge bg={config.color} className="d-flex align-items-center gap-1">
      <Icon size={14} />
      {config.label?.toUpperCase() || status?.replace('-', ' ').toUpperCase() || 'PENDING'}
    </Badge>
  );
};

// ============================================================================
// 🏷️ Source Badge Component (Action Origin)
// ============================================================================

const SourceBadge = ({ source }) => {
  const sourceConfig = {
    'ai_generated': { icon: MdInsights, color: 'info', label: 'AI' },
    'survey_feedback': { icon: MdAssignment, color: 'primary', label: 'Survey' },
    'manual': { icon: MdEdit, color: 'secondary', label: 'Manual' }
  };
  const config = sourceConfig[source] || sourceConfig.manual;
  const Icon = config.icon;

  return (
    <Badge bg={config.color} className="d-flex align-items-center gap-1">
      <Icon size={12} />
      {config.label}
    </Badge>
  );
};

// ============================================================================
// 😊 Sentiment Badge Component (Read-Only Context)
// ============================================================================

const SentimentBadge = ({ sentiment }) => {
  if (!sentiment) return null;

  const sentimentConfig = {
    'positive': { icon: MdSentimentSatisfied, color: 'success', label: 'Positive' },
    'neutral': { icon: MdSentimentNeutral, color: 'warning', label: 'Neutral' },
    'negative': { icon: MdSentimentDissatisfied, color: 'danger', label: 'Negative' }
  };
  const config = sentimentConfig[sentiment] || sentimentConfig.neutral;
  const Icon = config.icon;

  return (
    <Badge bg={config.color} className="bg-opacity-25 text-dark d-flex align-items-center gap-1">
      <Icon size={14} />
      {config.label}
    </Badge>
  );
};

// ============================================================================
// 📊 Stats Cards Component (Redesigned)
// ============================================================================

const StatsCards = ({ stats }) => {
  const cards = [
    { key: 'total', label: 'Total Actions', icon: MdAssignment, bg: 'primary', textColor: 'white' },
    { key: 'pending', label: 'Pending', icon: MdSchedule, bg: 'warning', textColor: 'dark' },
    { key: 'inProgress', label: 'In Progress', icon: MdTimer, bg: 'info', textColor: 'white' },
    { key: 'completed', label: 'Completed', icon: MdCheckCircle, bg: 'success', textColor: 'white' },
    { key: 'overdue', label: 'Overdue', icon: MdAssignmentLate, bg: 'danger', textColor: 'white' },
    { key: 'highPriority', label: 'High Priority', icon: MdPriorityHigh, bg: 'dark', textColor: 'white' },
  ];

  return (
    <Row className="g-3 mb-4">
      {cards.map(({ key, label, icon: Icon, bg, textColor }) => (
        <Col key={key} xl={2} lg={4} md={4} sm={6} xs={6}>
          <Card className={`bg-${bg} text-${textColor} border-0 shadow-sm h-100`}>
            <Card.Body className="d-flex align-items-center p-3">
              <div className={`rounded-circle d-flex align-items-center justify-content-center me-3 bg-white bg-opacity-25`}
                style={{ width: 48, height: 48, minWidth: 48 }}>
                <Icon size={24} />
              </div>
              <div>
                <div className="fw-bold fs-4 lh-1 mb-1">{stats[key] ?? 0}</div>
                <div className="small opacity-75">{label}</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

// ============================================================================
// 🗂️ Empty State Component
// ============================================================================

const EmptyState = ({ onGenerateActions, isGenerating, canGenerate = false }) => (
  <div className="text-center py-5">
    <MdAssignment size={64} className="text-muted mb-3" />
    <h5>No Actions Found</h5>
    <p className="text-muted mb-3">
      No action items match your current filters.
      {canGenerate && ' Try generating AI actions from recent feedback.'}
    </p>
    {/* Generate button only visible for CompanyAdmin */}
    {canGenerate && (
      <Button
        variant="primary"
        onClick={onGenerateActions}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <Spinner animation="border" size="sm" className="me-2" />
        ) : (
          <MdInsights className="me-2" />
        )}
        Generate AI Actions
      </Button>
    )}
  </div>
);

// ============================================================================
// ❌ Error State Component
// ============================================================================

const ErrorState = ({ error, onRetry }) => (
  <Alert variant="danger" className="d-flex align-items-center justify-content-between">
    <div className="d-flex align-items-center">
      <MdError size={24} className="me-2" />
      <span>{error || 'Failed to load actions. Please try again.'}</span>
    </div>
    <Button variant="outline-danger" size="sm" onClick={onRetry}>
      <MdRefresh className="me-1" />
      Retry
    </Button>
  </Alert>
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
    <tr className={isOverdue ? 'table-danger' : ''}>
      {/* Title + Description */}
      <td style={{ minWidth: 280 }}>
        <div className="d-flex align-items-start gap-2">
          <div className="flex-grow-1">
            <div
              className="fw-semibold text-dark mb-1 text-decoration-none cursor-pointer"
              role="button"
              onClick={() => onViewDetails(action)}
              style={{ cursor: 'pointer' }}
            >
              {action.title || 'Untitled Action'}
            </div>
            <p className="text-muted small mb-1 text-truncate" style={{ maxWidth: 320 }}>
              {action.description || 'No description provided'}
            </p>
            <div className="d-flex flex-wrap gap-1">
              <SourceBadge source={action.source} />
              {action.metadata?.sentiment && (
                <SentimentBadge sentiment={action.metadata.sentiment} />
              )}
              {isOverdue && <Badge bg="danger" pill className="small">Overdue</Badge>}
            </div>
          </div>
        </div>
      </td>

      {/* Priority */}
      <td className="align-middle">
        <PriorityBadge priority={action.priority} />
      </td>

      {/* Status */}
      <td className="align-middle">
        <StatusBadge status={action.status} />
      </td>

      {/* Assignee */}
      <td className="align-middle">
        <div className="d-flex align-items-center gap-1 small">
          <MdPerson size={16} className="text-muted" />
          <span className="text-truncate" style={{ maxWidth: 120 }}>
            {action.assigneeName || action.assignee?.name || 'Unassigned'}
          </span>
        </div>
      </td>

      {/* Department */}
      <td className="align-middle">
        <span className="small text-muted">
          {action.department || action.category || '—'}
        </span>
      </td>

      {/* Due Date */}
      <td className="align-middle">
        <span className={`small ${isOverdue ? 'text-danger fw-semibold' : 'text-muted'}`}>
          {action.dueDate ? formatDate(action.dueDate) : '—'}
        </span>
      </td>

      {/* Actions */}
      <td className="align-middle text-end">
        <div className="d-flex gap-1 justify-content-end">
          {action.status === ACTION_STATUSES.PENDING && (
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => onStatusChange(action.id, ACTION_STATUSES.IN_PROGRESS)}
              disabled={isUpdating}
              title="Start"
            >
              {isUpdating ? (
                <Spinner animation="border" size="sm" />
              ) : (
                <MdTimer size={16} />
              )}
            </Button>
          )}

          {action.status === ACTION_STATUSES.IN_PROGRESS && (
            <Button
              variant="outline-success"
              size="sm"
              onClick={() => onStatusChange(action.id, ACTION_STATUSES.RESOLVED)}
              disabled={isUpdating}
              title="Complete"
            >
              {isUpdating ? (
                <Spinner animation="border" size="sm" />
              ) : (
                <MdCheckCircle size={16} />
              )}
            </Button>
          )}

          <Button
            variant="outline-dark"
            size="sm"
            onClick={() => onViewDetails(action)}
            title="View Details"
          >
            <MdArrowForward size={16} />
          </Button>

          {canDelete && (
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => onDelete(action)}
              title="Delete"
            >
              <MdDelete size={16} />
            </Button>
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
    <div className="table-responsive">
      <Table hover className="align-middle mb-0">
        <thead className="table-light">
          <tr>
            <th>Action</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Assignee</th>
            <th>Department</th>
            <th>Due Date</th>
            <th className="text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
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
      </Table>
    </div>
  );
};

// ============================================================================
// 🎛️ Filters Component (Redesigned)
// ============================================================================

const FiltersBar = ({ filters, setFilters, onClearFilters, searchTerm, onSearchChange }) => (
  <Card className="mb-4 border-0 shadow-sm">
    <Card.Body className="py-3">
      <Row className="g-2 align-items-center">
        <Col lg={3} md={6}>
          <InputGroup size="sm">
            <InputGroup.Text className="bg-white">
              <MdFilterList size={16} />
            </InputGroup.Text>
            <Form.Control
              placeholder="Search actions..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </InputGroup>
        </Col>

        <Col lg={2} md={3} sm={6}>
          <Form.Select
            size="sm"
            value={filters.priority}
            onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
          >
            <option value="all">All Priorities</option>
            {Object.values(ACTION_PRIORITIES).map(p => (
              <option key={p} value={p}>
                {PRIORITY_CONFIG[p]?.label || p}
              </option>
            ))}
          </Form.Select>
        </Col>

        <Col lg={2} md={3} sm={6}>
          <Form.Select
            size="sm"
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          >
            <option value="all">All Status</option>
            {Object.values(ACTION_STATUSES).map(s => (
              <option key={s} value={s}>
                {STATUS_CONFIG[s]?.label || s}
              </option>
            ))}
          </Form.Select>
        </Col>

        <Col lg={2} md={3} sm={6}>
          <Form.Select
            size="sm"
            value={filters.department}
            onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
          >
            <option value="all">All Departments</option>
            {DEPARTMENTS.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </Form.Select>
        </Col>

        <Col lg={3} md={3} sm={6}>
          <div className="d-flex gap-2">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={onClearFilters}
              className="d-flex align-items-center"
            >
              <MdRefresh size={16} className="me-1" />
              Reset
            </Button>
          </div>
        </Col>
      </Row>
    </Card.Body>
  </Card>
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
      <Container fluid className="py-5">
        <div className="text-center">
          <MdBlock size={64} className="text-danger mb-3" />
          <h4>Access Restricted</h4>
          <p className="text-muted">
            System Admin cannot access tenant action management.<br />
            Please use Company Admin or Member account to manage actions.
          </p>
        </div>
      </Container>
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

      // Fetch actions first (always works for any role)
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

      const fetchedActions = actionsData.actions || [];
      setActions(fetchedActions);

      // Try to fetch stats from backend (companyAdmin only endpoint)
      // Falls back to computing from actions list if the call fails
      try {
        const statsData = await getActionStats({ period: '30' });
        // Validate that stats actually have data — if all zeros but we have actions, prefer computed
        const backendTotal = statsData?.total || 0;
        if (backendTotal > 0) {
          setStats(statsData);
        } else {
          // Backend returned empty/zero stats — compute from actions
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

    // Tab filtering
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

    // Search filtering (client-side text search)
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

    // Optimistic update
    const previousActions = [...actions];
    setActions(prev => prev.map(a =>
      a.id === actionId ? { ...a, status: newStatus } : a
    ));

    try {
      await updateAction(actionId, { status: newStatus });
      toast.success(`Action ${newStatus === ACTION_STATUSES.RESOLVED ? 'completed' : 'started'} successfully!`);

      // Recompute stats from updated actions
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

    // Optimistic update
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

  // ==========================================
  // Navigate to ActionDetailPage (instead of modal)
  // ==========================================
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
  // 🔄 Loading State
  // ============================================================================

  if (loading) {
    return (
      <Container fluid className="py-5">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Loading action items...</p>
        </div>
      </Container>
    );
  }

  // ============================================================================
  // 🎨 Main Render
  // ============================================================================

  return (
    <Container fluid className="py-4 px-lg-4">
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1 d-flex align-items-center gap-2">
            <MdAssignment size={28} className="text-primary" />
            Action Management
          </h2>
          <p className="text-muted mb-0 small">
            Track and manage action items from survey feedback
          </p>
        </div>
        <div className="d-flex gap-2">
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="d-flex align-items-center"
          >
            {refreshing ? (
              <Spinner animation="border" size="sm" className="me-1" />
            ) : (
              <MdRefresh size={18} className="me-1" />
            )}
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          {isCompanyAdmin && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleGenerateActions}
              disabled={refreshing}
              className="d-flex align-items-center"
            >
              <MdInsights size={18} className="me-1" />
              Generate AI Actions
            </Button>
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
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-bottom py-0">
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="border-0"
          >
            <Tab eventKey={ACTION_TABS.ALL} title={
              <span className="d-flex align-items-center gap-1">
                <MdAssignment size={16} />
                All <Badge bg="secondary" pill className="ms-1">{stats.total}</Badge>
              </span>
            } />
            <Tab eventKey={ACTION_TABS.HIGH_PRIORITY} title={
              <span className="d-flex align-items-center gap-1">
                <MdPriorityHigh size={16} />
                High Priority <Badge bg="danger" pill className="ms-1">{stats.highPriority}</Badge>
              </span>
            } />
            <Tab eventKey={ACTION_TABS.OVERDUE} title={
              <span className="d-flex align-items-center gap-1">
                <MdAssignmentLate size={16} />
                Overdue <Badge bg="warning" text="dark" pill className="ms-1">{stats.overdue}</Badge>
              </span>
            } />
          </Tabs>
        </Card.Header>
        <Card.Body className="p-0">
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
        </Card.Body>
        {/* Results count footer */}
        {filteredActions.length > 0 && (
          <Card.Footer className="bg-white text-muted small py-2">
            Showing {filteredActions.length} of {stats.total} actions
          </Card.Footer>
        )}
      </Card>

      {/* Detail Modal - keeping for quick preview but primary flow is navigate */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Action Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAction && (
            <div>
              <h5>{selectedAction.title}</h5>
              <p className="text-muted">{selectedAction.description}</p>

              <hr />

              <Row>
                <Col md={6}>
                  <p><strong>Status:</strong> <StatusBadge status={selectedAction.status} /></p>
                  <p><strong>Priority:</strong> <PriorityBadge priority={selectedAction.priority} /></p>
                  <p><strong>Department:</strong> {selectedAction.department || 'N/A'}</p>
                </Col>
                <Col md={6}>
                  <p><strong>Due Date:</strong> {formatDate(selectedAction.dueDate)}</p>
                  <p><strong>Created:</strong> {formatDate(selectedAction.createdAt)}</p>
                </Col>
              </Row>

              <hr />
              <h6>Assignment</h6>
              <Row className="align-items-center mb-3">
                <Col md={6}>
                  <p className="mb-1"><strong>Current Assignee:</strong></p>
                  <Badge bg="secondary" className="py-2 px-3">
                    <MdPerson className="me-1" />
                    {selectedAction.assigneeName || 'Unassigned'}
                  </Badge>
                </Col>
                <Col md={6}>
                  {(isCompanyAdmin || canAssignAction(selectedAction)) && (
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handleAssignToMe(selectedAction.id)}
                      disabled={assigningActionId === selectedAction.id}
                    >
                      {assigningActionId === selectedAction.id ? (
                        <Spinner animation="border" size="sm" className="me-1" />
                      ) : (
                        <MdPerson className="me-1" />
                      )}
                      Assign to Me
                    </Button>
                  )}
                </Col>
              </Row>

              {selectedAction.assignmentHistory && selectedAction.assignmentHistory.length > 0 && (
                <>
                  <hr />
                  <AssignmentHistory history={selectedAction.assignmentHistory} />
                </>
              )}

              <hr />
              <h6>Action Source</h6>
              <Row>
                <Col md={6}>
                  <p className="mb-2">
                    <strong>Generated From:</strong>{' '}
                    <SourceBadge source={selectedAction.source} />
                  </p>
                  {selectedAction.metadata?.surveyId && (
                    <p className="mb-2">
                      <strong>Survey ID:</strong>{' '}
                      <code className="small">{selectedAction.metadata.surveyId}</code>
                    </p>
                  )}
                </Col>
                <Col md={6}>
                  {selectedAction.metadata?.sentiment && (
                    <p className="mb-2">
                      <strong>Original Sentiment:</strong>{' '}
                      <SentimentBadge sentiment={selectedAction.metadata.sentiment} />
                    </p>
                  )}
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          {selectedAction && (
            <Button
              variant="primary"
              onClick={() => {
                setShowDetailModal(false);
                handleViewDetails(selectedAction);
              }}
            >
              <MdOpenInNew className="me-1" />
              Open Full View
            </Button>
          )}
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ActionManagement;
