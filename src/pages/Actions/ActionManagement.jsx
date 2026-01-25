// src\pages\Actions\ActionManagement.jsx
"use client"
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Row, Col, Card, Button, Badge, Tab, Tabs,
  Form, Modal, Alert, Spinner, Table, InputGroup,
  OverlayTrigger, Tooltip, Dropdown, ProgressBar,
  Toast, ToastContainer, ListGroup
} from 'react-bootstrap';
import {
  MdAssignment, MdFlag, MdCheckCircle, MdWarning,
  MdSchedule, MdPerson, MdLocationOn, MdTrendingUp,
  MdNotifications, MdAdd, MdEdit, MdDelete, MdVisibility,
  MdFilterList, MdRefresh, MdDownload, MdAssignmentTurnedIn,
  MdAssignmentLate, MdPriorityHigh, MdBusiness, MdGroup,
  MdComment, MdAttachment, MdTimer, MdSentimentSatisfied,
  MdSentimentDissatisfied, MdSentimentNeutral, MdInsights,
  MdError
} from 'react-icons/md';
import {
  FaClock, FaUsers, FaExclamationTriangle, FaChartLine,
  FaBuilding, FaMapMarkerAlt, FaStar, FaRegStar
} from 'react-icons/fa';
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
// 📋 Action Card Component
// ============================================================================

const ActionCard = ({
  action,
  onStatusChange,
  onViewDetails,
  onDelete,
  isUpdating
}) => {
  const isOverdue = action.isOverdue || isActionOverdue(action);

  return (
    <Card className={`action-item mb-3 border ${isOverdue ? 'border-danger' : ''}`}>
      <Card.Body>
        <Row className="align-items-start">
          <Col lg={6}>
            <div className="d-flex align-items-start mb-2">
              <div className="me-3">
                <PriorityBadge priority={action.priority} />
              </div>
              <div className="flex-grow-1">
                <h6 className="mb-1 fw-bold">
                  {action.title || 'Untitled Action'}
                  {isOverdue && (
                    <Badge bg="danger" className="ms-2" pill>Overdue</Badge>
                  )}
                </h6>
                <p className="text-muted small mb-2">
                  {action.description || 'No description provided'}
                </p>

                <div className="d-flex flex-wrap gap-2 mb-2">
                  <Badge bg="light" text="dark" className="d-flex align-items-center">
                    <MdLocationOn className="me-1" />
                    {action.location || action.team || 'N/A'}
                  </Badge>
                  <Badge bg="light" text="dark" className="d-flex align-items-center">
                    <MdBusiness className="me-1" />
                    {action.department || action.category || 'Unassigned'}
                  </Badge>
                  <Badge bg="light" text="dark" className="d-flex align-items-center">
                    <MdPerson className="me-1" />
                    {action.assigneeName || action.assignee?.name || 'Unassigned'}
                  </Badge>
                </div>
              </div>
            </div>
          </Col>

          <Col lg={3}>
            <div className="mb-2">
              <StatusBadge status={action.status} />
            </div>
            <div className="small text-muted">
              <div className="mb-1">
                <FaClock className="me-1" />
                Due: {action.dueDate ? formatDate(action.dueDate) : 'Not set'}
              </div>
              <div className="mb-1">
                <MdComment className="me-1" />
                {action.feedback?.count ?? 0} feedback items
              </div>
              <div className="d-flex align-items-center">
                <FaStar className="me-1 text-warning" />
                {(action.feedback?.avgRating ?? 0).toFixed(1)} avg rating
              </div>
            </div>
          </Col>

          <Col lg={3} className="text-end">
            <div className="d-flex flex-column gap-1">
              {action.status === ACTION_STATUSES.PENDING && (
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => onStatusChange(action.id, ACTION_STATUSES.IN_PROGRESS)}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <Spinner animation="border" size="sm" className="me-1" />
                  ) : (
                    <MdTimer className="me-1" />
                  )}
                  Start
                </Button>
              )}

              {action.status === ACTION_STATUSES.IN_PROGRESS && (
                <Button
                  variant="outline-success"
                  size="sm"
                  onClick={() => onStatusChange(action.id, ACTION_STATUSES.RESOLVED)}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <Spinner animation="border" size="sm" className="me-1" />
                  ) : (
                    <MdCheckCircle className="me-1" />
                  )}
                  Complete
                </Button>
              )}

              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => onViewDetails(action)}
              >
                <MdVisibility className="me-1" />
                Details
              </Button>

              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => onDelete(action)}
              >
                <MdDelete className="me-1" />
                Delete
              </Button>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

// ============================================================================
// 🗂️ Empty State Component
// ============================================================================

const EmptyState = ({ onGenerateActions, isGenerating }) => (
  <div className="text-center py-5">
    <MdAssignment size={64} className="text-muted mb-3" />
    <h5>No Actions Found</h5>
    <p className="text-muted mb-3">
      No action items match your current filters. Try generating AI actions from recent feedback.
    </p>
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
// 📊 Stats Cards Component
// ============================================================================

const StatsCards = ({ stats }) => {
  const cards = [
    { key: 'total', label: 'Total Actions', icon: MdAssignment, color: 'primary', value: stats.total },
    { key: 'pending', label: 'Pending', icon: MdSchedule, color: 'warning', value: stats.pending },
    { key: 'inProgress', label: 'In Progress', icon: MdTimer, color: 'info', value: stats.inProgress },
    { key: 'completed', label: 'Completed', icon: MdCheckCircle, color: 'success', value: stats.completed },
    { key: 'overdue', label: 'Overdue', icon: MdAssignmentLate, color: 'danger', value: stats.overdue },
    { key: 'highPriority', label: 'High Priority', icon: MdPriorityHigh, color: 'danger', value: stats.highPriority },
  ];

  return (
    <Row className="mb-4">
      {cards.map(({ key, label, icon: Icon, color, value }) => (
        <Col key={key} lg={2} md={4} sm={6} className="mb-3">
          <Card className="stats-card h-100">
            <Card.Body className="p-3 text-center">
              <div className={`stats-icon bg-${color} bg-opacity-10 text-${color} rounded-circle p-3 mx-auto mb-2`}>
                <Icon size={24} />
              </div>
              <h5 className="mb-0">{value ?? 0}</h5>
              <small className="text-muted">{label}</small>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

// ============================================================================
// 🎛️ Filters Component
// ============================================================================

const FiltersBar = ({ filters, setFilters, onClearFilters }) => (
  <Card className="mb-4">
    <Card.Body>
      <Row className="align-items-center">
        <Col lg={2} md={6} className="mb-2">
          <Form.Select
            size="sm"
            value={filters.priority}
            onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
          >
            <option value="all">All Priorities</option>
            {Object.values(ACTION_PRIORITIES).map(p => (
              <option key={p} value={p}>
                {PRIORITY_CONFIG[p]?.label || p} Priority
              </option>
            ))}
          </Form.Select>
        </Col>

        <Col lg={2} md={6} className="mb-2">
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

        <Col lg={2} md={6} className="mb-2">
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

        <Col lg={2} md={6} className="mb-2">
          <Form.Select
            size="sm"
            value={filters.dateRange}
            onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </Form.Select>
        </Col>

        <Col lg={4} className="mb-2">
          <div className="d-flex gap-2">
            <Button
              variant="outline-primary"
              size="sm"
              onClick={onClearFilters}
            >
              <MdRefresh className="me-1" />
              Clear Filters
            </Button>
            <Button variant="outline-secondary" size="sm">
              <MdDownload className="me-1" />
              Export
            </Button>
          </div>
        </Col>
      </Row>
    </Card.Body>
  </Card>
);

// ============================================================================
// 🏠 Main Component
// ============================================================================

const ActionManagement = () => {
  const navigate = useNavigate();

  // State Management
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(ACTION_TABS.ALL);
  const [updatingActionId, setUpdatingActionId] = useState(null);
  const [assigningActionId, setAssigningActionId] = useState(null);

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);

  // Filters
  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS });

  // Stats
  const [stats, setStats] = useState({ ...DEFAULT_STATS });

  // Toast
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');

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

      // Fetch actions and stats in parallel
      const [actionsData, statsData] = await Promise.all([
        listActions({
          priority: filters.priority,
          status: filters.status !== 'all' ? filters.status : undefined,
          assignee: filters.assignee,
          department: filters.department,
          dateRange: filters.dateRange,
          tab: activeTab,
          page: 1,
          limit: 50
        }),
        getActionStats({ period: '30' })
      ]);

      setActions(actionsData.actions || []);
      setStats(statsData || { ...DEFAULT_STATS });
    } catch (err) {
      console.error('Error fetching actions:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load actions');

      // Keep previous stats on error
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
  // 🔄 Filter actions based on active tab
  // ============================================================================

  const filteredActions = useMemo(() => {
    if (!Array.isArray(actions)) return [];

    switch (activeTab) {
      case ACTION_TABS.HIGH_PRIORITY:
        return actions.filter(a => a.priority === ACTION_PRIORITIES.HIGH);
      case ACTION_TABS.OVERDUE:
        return actions.filter(a => a.isOverdue || isActionOverdue(a));
      default:
        return actions;
    }
  }, [actions, activeTab]);

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
      showSuccessToast(`Action ${newStatus === ACTION_STATUSES.RESOLVED ? 'completed' : 'started'} successfully!`);

      // Refresh stats after status change
      const statsData = await getActionStats({ period: '30' });
      setStats(statsData || stats);
    } catch (error) {
      console.error('Error updating action status:', error);
      // Revert optimistic update
      setActions(previousActions);
      showErrorToast(error.response?.data?.message || 'Failed to update action status');
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
    setActions(prev => prev.filter(a => a.id !== action.id));

    try {
      await deleteAction(action.id);
      showSuccessToast('Action deleted successfully!');

      // Refresh stats after delete
      const statsData = await getActionStats({ period: '30' });
      setStats(statsData || stats);
    } catch (error) {
      console.error('Error deleting action:', error);
      // Revert optimistic update
      setActions(previousActions);
      showErrorToast(error.response?.data?.message || 'Failed to delete action');
    }
  };

  const handleViewDetails = (action) => {
    setSelectedAction(action);
    setShowDetailModal(true);
  };

  const handleAssignToMe = async (actionId) => {
    setAssigningActionId(actionId);

    try {
      // Get current user ID from localStorage or auth context
      const userDataStr = localStorage.getItem('userData');
      if (!userDataStr) {
        showErrorToast('Please log in to assign actions');
        return;
      }

      const userData = JSON.parse(userDataStr);
      const currentUserId = userData._id || userData.id;

      if (!currentUserId) {
        showErrorToast('Unable to get user ID');
        return;
      }

      // Call assign API
      await assignAction(actionId, { assignedTo: currentUserId });

      // Optimistic update
      setActions(prev => prev.map(a =>
        a.id === actionId ? {
          ...a,
          assignee: { id: currentUserId, name: userData.name || 'Me' },
          assigneeName: userData.name || 'Me'
        } : a
      ));

      // Update selected action if modal is open
      if (selectedAction && selectedAction.id === actionId) {
        setSelectedAction(prev => ({
          ...prev,
          assignee: { id: currentUserId, name: userData.name || 'Me' },
          assigneeName: userData.name || 'Me'
        }));
      }

      showSuccessToast('Action assigned to you successfully!');
    } catch (error) {
      console.error('Error assigning action:', error);
      showErrorToast(error.response?.data?.message || 'Failed to assign action');
    } finally {
      setAssigningActionId(null);
    }
  };

  const handleGenerateActions = async () => {
    setRefreshing(true);
    try {
      await generateActionsFromFeedback({});
      showSuccessToast('AI actions generated successfully!');
      handleRefresh();
    } catch (error) {
      console.error('Error generating AI actions:', error);
      showErrorToast(error.response?.data?.message || 'Failed to generate AI actions');
      setRefreshing(false);
    }
  };

  const handleClearFilters = () => {
    setFilters({ ...DEFAULT_FILTERS });
  };

  // ============================================================================
  // 🍞 Toast Functions
  // ============================================================================

  const showSuccessToast = (message) => {
    setToastMessage(message);
    setToastVariant('success');
    setShowToast(true);
  };

  const showErrorToast = (message) => {
    setToastMessage(message);
    setToastVariant('danger');
    setShowToast(true);
  };

  // ============================================================================
  // 🔄 Loading State
  // ============================================================================

  if (loading) {
    return (
      <Container fluid className="py-4">
        <div className="text-center">
          <Spinner animation="border" variant="primary" size="lg" />
          <p className="mt-3 text-muted">Loading action items...</p>
        </div>
      </Container>
    );
  }

  // ============================================================================
  // 🎨 Main Render
  // ============================================================================

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <Card className="action-header shadow-sm">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="d-flex align-items-center mb-2">
                    <MdAssignment className="me-3 text-primary" size={32} />
                    <div>
                      <h1 className="h3 mb-1 fw-bold">Action Management</h1>
                      <p className="text-muted mb-0">AI-generated action items from survey feedback</p>
                    </div>
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <Button
                    variant="outline-primary"
                    onClick={handleRefresh}
                    disabled={refreshing}
                  >
                    {refreshing ? (
                      <Spinner animation="border" size="sm" className="me-2" />
                    ) : (
                      <MdRefresh className="me-2" />
                    )}
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                  </Button>
                  <Button
                    variant="success"
                    onClick={handleGenerateActions}
                    disabled={refreshing}
                  >
                    <MdInsights className="me-2" />
                    Generate AI Actions
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Error State */}
      {error && <ErrorState error={error} onRetry={handleRefresh} />}

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Filters */}
      <FiltersBar
        filters={filters}
        setFilters={setFilters}
        onClearFilters={handleClearFilters}
      />

      {/* Action Items */}
      <Row>
        <Col>
          <Card>
            <Card.Body className="p-0">
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="action-tabs"
              >
                <Tab eventKey={ACTION_TABS.ALL} title={
                  <span><MdAssignment className="me-2" />All Actions ({stats.total})</span>
                }>
                  <div className="p-4">
                    {filteredActions.length > 0 ? (
                      <div className="actions-list">
                        {filteredActions.map(action => (
                          <ActionCard
                            key={action.id || action._id}
                            action={action}
                            onStatusChange={handleStatusChange}
                            onViewDetails={handleViewDetails}
                            onDelete={handleDeleteAction}
                            isUpdating={updatingActionId === action.id}
                          />
                        ))}
                      </div>
                    ) : (
                      <EmptyState
                        onGenerateActions={handleGenerateActions}
                        isGenerating={refreshing}
                      />
                    )}
                  </div>
                </Tab>

                <Tab eventKey={ACTION_TABS.HIGH_PRIORITY} title={
                  <span><MdPriorityHigh className="me-2" />High Priority ({stats.highPriority})</span>
                }>
                  <div className="p-4">
                    {filteredActions.length > 0 ? (
                      <div className="actions-list">
                        {filteredActions.map(action => (
                          <ActionCard
                            key={action.id || action._id}
                            action={action}
                            onStatusChange={handleStatusChange}
                            onViewDetails={handleViewDetails}
                            onDelete={handleDeleteAction}
                            isUpdating={updatingActionId === action.id}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-5">
                        <MdPriorityHigh size={64} className="text-muted mb-3" />
                        <h5>No High Priority Actions</h5>
                        <p className="text-muted">Great! There are no high priority actions at the moment.</p>
                      </div>
                    )}
                  </div>
                </Tab>

                <Tab eventKey={ACTION_TABS.OVERDUE} title={
                  <span><MdAssignmentLate className="me-2" />Overdue ({stats.overdue})</span>
                }>
                  <div className="p-4">
                    {filteredActions.length > 0 ? (
                      <div className="actions-list">
                        {filteredActions.map(action => (
                          <ActionCard
                            key={action.id || action._id}
                            action={action}
                            onStatusChange={handleStatusChange}
                            onViewDetails={handleViewDetails}
                            onDelete={handleDeleteAction}
                            isUpdating={updatingActionId === action.id}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-5">
                        <MdCheckCircle size={64} className="text-success mb-3" />
                        <h5>No Overdue Actions</h5>
                        <p className="text-muted">Excellent! All actions are on track.</p>
                      </div>
                    )}
                  </div>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Detail Modal */}
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
                </Col>
              </Row>

              {/* Assignment History Timeline */}
              {selectedAction.assignmentHistory && selectedAction.assignmentHistory.length > 0 && (
                <>
                  <hr />
                  <AssignmentHistory history={selectedAction.assignmentHistory} />
                </>
              )}

              {selectedAction.feedback && (
                <>
                  <hr />
                  <h6>Related Feedback</h6>
                  <p>
                    <strong>Feedback Count:</strong> {selectedAction.feedback.count ?? 0}<br />
                    <strong>Sentiment:</strong> {selectedAction.feedback.sentiment || 'N/A'}<br />
                    <strong>Avg Rating:</strong> {(selectedAction.feedback.avgRating ?? 0).toFixed(1)}
                  </p>
                </>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Toast Notifications */}
      <ToastContainer position="top-end" className="p-3">
        <Toast
          show={showToast}
          onClose={() => setShowToast(false)}
          delay={3000}
          autohide
          bg={toastVariant}
        >
          <Toast.Body className="text-white">
            {toastMessage}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
};

export default ActionManagement;
