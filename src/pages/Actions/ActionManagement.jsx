// src\pages\Actions\ActionManagement.jsx
"use client"
import React, { useState, useEffect, useCallback } from 'react';
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
  MdSentimentDissatisfied, MdSentimentNeutral, MdInsights
} from 'react-icons/md';
import {
  FaClock, FaUsers, FaExclamationTriangle, FaChartLine,
  FaBuilding, FaMapMarkerAlt, FaStar, FaRegStar
} from 'react-icons/fa';
import {
  listActions,
  getActionStats,
  updateAction,
  assignAction,
  generateActionsFromFeedback
} from '../../api/services/actionService';
import Swal from 'sweetalert2';


const ActionManagement = () => {
  const navigate = useNavigate();

  // State Management
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    priority: 'all',
    status: 'all',
    assignee: 'all',
    department: 'all',
    dateRange: 'all'
  });

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
    highPriority: 0
  });

  // Toast
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');

  // Fetch data using service layer
  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // Fetch actions and stats in parallel
      const [actionsData, statsData] = await Promise.all([
        listActions({
          priority: filters.priority,
          status: filters.status !== 'all' ? filters.status : activeTab !== 'all' ? activeTab : undefined,
          assignee: filters.assignee,
          department: filters.department,
          dateRange: filters.dateRange,
          tab: activeTab,
          page: 1,
          limit: 20
        }),
        getActionStats({ period: '30' })
      ]);

      setActions(actionsData.actions || []);
      setStats(statsData);
      setError('');
    } catch (err) {
      console.error('Error fetching actions:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load actions');
      
      // Prevent crash by keeping stats safe
      setStats(prev => prev?.total ? prev : {
        total: 0, pending: 0, inProgress: 0, completed: 0, overdue: 0, highPriority: 0
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters, activeTab]);

  // Handle refresh button click
  const handleRefresh = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Action Handlers
  const handleStatusChange = async (actionId, newStatus) => {
    try {
      await updateAction(actionId, { status: newStatus });
      showSuccessToast(`Action ${newStatus} successfully!`);
      handleRefresh();
    } catch (error) {
      console.error('Error updating action status:', error);
      showErrorToast(
        error.response?.data?.message || 'Failed to update action status'
      );
    }
  };

  const isOverdue = (action) => {
  return action.dueDate && 
         new Date(action.dueDate) < new Date() && 
         action.status !== 'completed' && 
         action.status !== 'resolved';
};

  const handleAssignAction = async (actionId, assigneeId, team = null) => {
    try {
      await assignAction(actionId, { assignedTo: assigneeId, team });
      showSuccessToast('Action assigned successfully!');
      handleRefresh();
    } catch (error) {
      console.error('Error assigning action:', error);
      showErrorToast(
        error.response?.data?.message || 'Failed to assign action'
      );
    }
  };

  const handleGenerateActions = async () => {
    try {
      setRefreshing(true);
      await generateActionsFromFeedback({});
      showSuccessToast('AI actions generated successfully!');
      handleRefresh();
    } catch (error) {
      console.error('Error generating AI actions:', error);
      showErrorToast(
        error.response?.data?.message || 'Failed to generate AI actions'
      );
      setRefreshing(false);
    }
  }

  // Toast Functions
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

  // Get Priority Badge
  const getPriorityBadge = (priority) => {
  const map = {
    high: { color: 'danger', icon: MdPriorityHigh },
    medium: { color: 'warning', icon: MdWarning },
    low: { color: 'info', icon: MdFlag },
    'long-term': { color: 'secondary', icon: MdSchedule }
  };
  const item = map[priority] || map.low;
  return (
    <Badge bg={item.color} className="d-flex align-items-center">
      <item.icon className="me-1" />
      {priority.toUpperCase()}
    </Badge>
  );
};

  // Get Status Badge
  const getStatusBadge = (status) => {
    const variants = {
      pending: 'secondary',
      'in-progress': 'primary',
      completed: 'success',
      overdue: 'danger'
    };
    const icons = {
      pending: <MdSchedule />,
      'in-progress': <MdTimer />,
      completed: <MdCheckCircle />,
      overdue: <MdAssignmentLate />
    };
    return (
      <Badge bg={variants[status]} className="d-flex align-items-center">
        {icons[status]} <span className="ms-1">{status.replace('-', ' ').toUpperCase()}</span>
      </Badge>
    );
  };

  // Mock Data (fallback)
  const mockActions = [
    {
      id: 1,
      title: "Improve Restroom Cleanliness",
      description: "Multiple complaints about restroom cleanliness at Riyadh Stadium",
      priority: "high",
      status: "pending",
      assignee: "Facilities Manager",
      department: "Facilities",
      location: "Riyadh Stadium",
      dueDate: "2025-10-02",
      createdAt: "2025-10-01",
      feedback: {
        count: 5,
        sentiment: "negative",
        avgRating: 2.1
      },
      relatedSurvey: "Event Feedback Survey"
    },
    {
      id: 2,
      title: "Reduce Queue Times",
      description: "Long waiting times at Jeddah Airport check-in counters",
      priority: "medium",
      status: "in-progress",
      assignee: "Operations Team",
      department: "Operations",
      location: "Jeddah Airport",
      dueDate: "2025-10-05",
      createdAt: "2025-09-30",
      feedback: {
        count: 12,
        sentiment: "negative",
        avgRating: 2.8
      },
      relatedSurvey: "Customer Service Survey"
    },
    {
      id: 3,
      title: "Install EV Charging Stations",
      description: "Multiple requests for electric vehicle charging stations",
      priority: "low",
      status: "pending",
      assignee: "Infrastructure Team",
      department: "Infrastructure",
      location: "All Locations",
      dueDate: "2025-11-01",
      createdAt: "2025-09-29",
      feedback: {
        count: 8,
        sentiment: "neutral",
        avgRating: 3.5
      },
      relatedSurvey: "Facility Improvement Survey"
    }
  ];

  const mockStats = {
    total: 15,
    pending: 6,
    inProgress: 4,
    completed: 3,
    overdue: 2,
    highPriority: 4
  };

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
                  {/* <Button
                    variant="success"
                    onClick={handleGenerateActions}
                  >
                    <MdInsights className="me-2" />
                    Generate AI Actions
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => setShowCreateModal(true)}
                  >
                    <MdAdd className="me-2" />
                    Create Action
                  </Button> */}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col lg={2} md={4} sm={6} className="mb-3">
          <Card className="stats-card h-100">
            <Card.Body className="p-3 text-center">
              <div className="stats-icon bg-info bg-opacity-10 text-primary rounded-circle p-3 mx-auto mb-2">
                <MdAssignment size={24} />
              </div>
              <h5 className="mb-0">{stats.total}</h5>
              <small className="text-muted">Total Actions</small>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={2} md={4} sm={6} className="mb-3">
          <Card className="stats-card h-100">
            <Card.Body className="p-3 text-center">
              <div className="stats-icon bg-warning bg-opacity-10 text-warning rounded-circle p-3 mx-auto mb-2">
                <MdSchedule size={24} />
              </div>
              <h5 className="mb-0">{stats.pending}</h5>
              <small className="text-muted">Pending</small>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={2} md={4} sm={6} className="mb-3">
          <Card className="stats-card h-100">
            <Card.Body className="p-3 text-center">
              <div className="stats-icon bg-info bg-opacity-10 text-info rounded-circle p-3 mx-auto mb-2">
                <MdTimer size={24} />
              </div>
              <h5 className="mb-0">{stats.inProgress}</h5>
              <small className="text-muted">In Progress</small>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={2} md={4} sm={6} className="mb-3">
          <Card className="stats-card h-100">
            <Card.Body className="p-3 text-center">
              <div className="stats-icon bg-success bg-opacity-10 text-success rounded-circle p-3 mx-auto mb-2">
                <MdCheckCircle size={24} />
              </div>
              <h5 className="mb-0">{stats.completed}</h5>
              <small className="text-muted">Completed</small>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={2} md={4} sm={6} className="mb-3">
          <Card className="stats-card h-100">
            <Card.Body className="p-3 text-center">
              <div className="stats-icon bg-danger bg-opacity-10 text-danger rounded-circle p-3 mx-auto mb-2">
                <MdAssignmentLate size={24} />
              </div>
              <h5 className="mb-0">{stats.overdue}</h5>
              <small className="text-muted">Overdue</small>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={2} md={4} sm={6} className="mb-3">
          <Card className="stats-card h-100">
            <Card.Body className="p-3 text-center">
              <div className="stats-icon bg-danger bg-opacity-10 text-danger rounded-circle p-3 mx-auto mb-2">
                <MdPriorityHigh size={24} />
              </div>
              <h5 className="mb-0">{stats.highPriority}</h5>
              <small className="text-muted">High Priority</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Body>
              <Row className="align-items-center">
                <Col lg={2} md={6} className="mb-2">
                  <Form.Select
                    size="sm"
                    value={filters.priority}
                    onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                  >
                    <option value="all">All Priorities</option>
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </Form.Select>
                </Col>

                <Col lg={2} md={6} className="mb-2">
                  <Form.Select
                    size="sm"
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="overdue">Overdue</option>
                  </Form.Select>
                </Col>

                <Col lg={2} md={6} className="mb-2">
                  <Form.Select
                    size="sm"
                    value={filters.department}
                    onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                  >
                    <option value="all">All Departments</option>
                    <option value="Facilities">Facilities</option>
                    <option value="Operations">Operations</option>
                    <option value="Customer Service">Customer Service</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="HR">Human Resources</option>
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
                      onClick={() => setFilters({
                        priority: 'all',
                        status: 'all',
                        assignee: 'all',
                        department: 'all',
                        dateRange: 'all'
                      })}
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
        </Col>
      </Row>

      {/* Action Items */}
      <Row>
        <Col>
          <Card>
            <Card.Body className="p-0">
              <Tabs
                activeKey={activeTab}
                onSelect={setActiveTab}
                className="action-tabs"
              >
                <Tab eventKey="all" title={
                  <span><MdAssignment className="me-2" />All Actions ({stats.total})</span>
                }>
                  <div className="p-4">
                    {actions.length > 0 ? (
                      <div className="actions-list">
                        {actions.map(action => (
                          <Card key={action.id} className="action-item mb-3 border">
                            <Card.Body>
                              <Row className="align-items-start">
                                <Col lg={6}>
                                  <div className="d-flex align-items-start mb-2">
                                    <div className="me-3">
                                      {getPriorityBadge(action.priority)}
                                    </div>
                                    <div className="flex-grow-1">
                                      <h6 className="mb-1 fw-bold">{action.title}</h6>
                                      <p className="text-muted small mb-2">{action.description}</p>

                                      <div className="d-flex flex-wrap gap-2 mb-2">
                                        <Badge bg="light" text="dark" className="d-flex align-items-center">
                                          <MdLocationOn className="me-1" />
                                          {action.location}
                                        </Badge>
                                        <Badge bg="light" text="dark" className="d-flex align-items-center">
                                          <MdBusiness className="me-1" />
                                          {action.department}
                                        </Badge>
                                        <Badge bg="light" text="dark" className="d-flex align-items-center">
                                          <MdPerson className="me-1" />
                                          {action.assignee}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                </Col>

                                <Col lg={3}>
                                  <div className="mb-2">
                                    {getStatusBadge(action.status)}
                                  </div>
                                  <div className="small text-muted">
                                    <div className="mb-1">
                                      <FaClock className="me-1" />
                                      Due: {new Date(action.dueDate).toLocaleDateString()}
                                    </div>
                                    <div className="mb-1">
                                      <MdComment className="me-1" />
                                      {action.feedback?.count} feedback items
                                    </div>
                                    <div className="d-flex align-items-center">
                                      <FaStar className="me-1 text-warning" />
                                      {action.feedback?.avgRating.toFixed(1)} avg rating
                                    </div>
                                  </div>
                                </Col>

                                <Col lg={3} className="text-end">
                                  <div className="d-flex flex-column gap-1">
                                    {action.status === 'pending' && (
                                      <Button
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={() => handleStatusChange(action.id, 'in-progress')}
                                      >
                                        <MdTimer className="me-1" />
                                        Start
                                      </Button>
                                    )}

                                    {action.status === 'in-progress' && (
                                      <Button
                                        variant="outline-success"
                                        size="sm"
                                        onClick={() => handleStatusChange(action.id, 'completed')}
                                      >
                                        <MdCheckCircle className="me-1" />
                                        Complete
                                      </Button>
                                    )}

                                    <Button
                                      variant="outline-secondary"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedAction(action);
                                        setShowDetailModal(true);
                                      }}
                                    >
                                      <MdVisibility className="me-1" />
                                      Details
                                    </Button>
                                  </div>
                                </Col>
                              </Row>
                            </Card.Body>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-5">
                        <MdAssignment size={64} className="text-muted mb-3" />
                        <h5>No Actions Found</h5>
                        <p className="text-muted mb-3">
                          No action items match your current filters. Try generating AI actions from recent feedback.
                        </p>
                        <Button variant="primary" onClick={handleGenerateActions}>
                          <MdInsights className="me-2" />
                          Generate AI Actions
                        </Button>
                      </div>
                    )}
                  </div>
                </Tab>

                <Tab eventKey="high-priority" title={
                  <span><MdPriorityHigh className="me-2" />High Priority ({stats.highPriority})</span>
                }>
                  <div className="p-4">
                    {/* Similar content filtered by high priority */}
                  </div>
                </Tab>

                <Tab eventKey="overdue" title={
                  <span><MdAssignmentLate className="me-2" />Overdue ({stats.overdue})</span>
                }>
                  <div className="p-4">
                    {/* Similar content filtered by overdue */}
                  </div>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>

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
