// src\pages\Surveys\SurveyScheduling.jsx

"use client"

import { useState, useEffect } from "react"
import { Container, Row, Col, Card, Form, Button, Table, Badge, Modal, Spinner, ProgressBar } from "react-bootstrap"
import { MdSchedule, MdAdd, MdEdit, MdDelete, MdPlayArrow as MdPlay, MdPause, MdFilterList, MdViewList, MdViewModule, MdAccessTime, MdPeople, MdTrendingUp } from "react-icons/md"
import { FaCalendarAlt, FaClock, FaUsers, FaChartLine } from "react-icons/fa"
import Pagination from "../../components/Pagination/Pagination.jsx"


const SurveyScheduling = ({ darkMode }) => {
  const [scheduledSurveys, setScheduledSurveys] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState(null)
  const [pagination, setPagination] = useState({ page: 1, limit: 6, total: 0 })
  const [viewMode, setViewMode] = useState('cards') // 'table' or 'cards'
  const [statusFilter, setStatusFilter] = useState('all')
  const [formData, setFormData] = useState({
    surveyId: "",
    title: "",
    startDate: "",
    endDate: "",
    timezone: "UTC",
    frequency: "once",
    reminderEnabled: true,
    reminderDays: 3,
    maxResponses: "",
    targetAudience: "",
  })

  useEffect(() => {
    // Simulate loading scheduled surveys
    setTimeout(() => {
      setScheduledSurveys([
        {
          id: 1,
          surveyId: "survey-1",
          title: "Customer Satisfaction Survey",
          startDate: "2023-07-01T09:00",
          endDate: "2023-07-31T23:59",
          timezone: "UTC",
          frequency: "once",
          status: "scheduled",
          responses: 0,
          maxResponses: 1000,
          targetAudience: "All Customers",
          reminderEnabled: true,
          reminderDays: 3,
        },
        {
          id: 2,
          surveyId: "survey-2",
          title: "Weekly Team Feedback",
          startDate: "2023-06-15T10:00",
          endDate: "2023-12-31T18:00",
          timezone: "UTC",
          frequency: "weekly",
          status: "active",
          responses: 45,
          maxResponses: 500,
          targetAudience: "Team Members",
          reminderEnabled: true,
          reminderDays: 1,
        },
        {
          id: 3,
          surveyId: "survey-3",
          title: "Product Launch Survey",
          startDate: "2023-05-01T08:00",
          endDate: "2023-05-31T20:00",
          timezone: "UTC",
          frequency: "once",
          status: "completed",
          responses: 234,
          maxResponses: 300,
          targetAudience: "Beta Users",
          reminderEnabled: false,
          reminderDays: 0,
        },
      ])
      setPagination((prev) => ({ ...prev, total: 3 }))
      setLoading(false)
    }, 1000)
  }, [])

  const handleCreateSchedule = () => {
    setEditingSchedule(null)
    setFormData({
      surveyId: "",
      title: "",
      startDate: "",
      endDate: "",
      timezone: "UTC",
      frequency: "once",
      reminderEnabled: true,
      reminderDays: 3,
      maxResponses: "",
      targetAudience: "",
    })
    setShowModal(true)
  }

  const handleEditSchedule = (schedule) => {
    setEditingSchedule(schedule)
    setFormData({
      surveyId: schedule.surveyId,
      title: schedule.title,
      startDate: schedule.startDate,
      endDate: schedule.endDate,
      timezone: schedule.timezone,
      frequency: schedule.frequency,
      reminderEnabled: schedule.reminderEnabled,
      reminderDays: schedule.reminderDays,
      maxResponses: schedule.maxResponses.toString(),
      targetAudience: schedule.targetAudience,
    })
    setShowModal(true)
  }

  const handleSaveSchedule = () => {
    if (editingSchedule) {
      // Update existing schedule
      setScheduledSurveys((surveys) =>
        surveys.map((survey) =>
          survey.id === editingSchedule.id
            ? { ...survey, ...formData, maxResponses: Number.parseInt(formData.maxResponses) || 0 }
            : survey,
        ),
      )
    } else {
      // Create new schedule
      const newSchedule = {
        id: Date.now(),
        ...formData,
        maxResponses: Number.parseInt(formData.maxResponses) || 0,
        status: "scheduled",
        responses: 0,
      }
      setScheduledSurveys((surveys) => [...surveys, newSchedule])
    }
    setShowModal(false)
  }

  const handleDeleteSchedule = (scheduleId) => {
    if (window.confirm("Are you sure you want to delete this scheduled survey?")) {
      setScheduledSurveys((surveys) => surveys.filter((survey) => survey.id !== scheduleId))
    }
  }

  const handleStatusChange = (scheduleId, newStatus) => {
    setScheduledSurveys((surveys) =>
      surveys.map((survey) => (survey.id === scheduleId ? { ...survey, status: newStatus } : survey)),
    )
  }

  const getStatusVariant = (status) => {
    switch (status) {
      case "scheduled":
        return "warning"
      case "active":
        return "success"
      case "paused":
        return "secondary"
      case "completed":
        return "primary"
      case "cancelled":
        return "danger"
      default:
        return "secondary"
    }
  }

  const getStatusActions = (schedule) => {
    switch (schedule.status) {
      case "scheduled":
        return (
          <Button
            variant="outline-success"
            size="sm"
            onClick={() => handleStatusChange(schedule.id, "active")}
            title="Start Now"
          >
            <MdPlay />
          </Button>
        )
      case "active":
        return (
          <Button
            variant="outline-warning"
            size="sm"
            onClick={() => handleStatusChange(schedule.id, "paused")}
            title="Pause"
          >
            <MdPause />
          </Button>
        )
      case "paused":
        return (
          <Button
            variant="outline-success"
            size="sm"
            onClick={() => handleStatusChange(schedule.id, "active")}
            title="Resume"
          >
            <MdPlay />
          </Button>
        )
      default:
        return null
    }
  }

  useEffect(() => {
    setPagination((prev) => ({ ...prev, total: scheduledSurveys.length }))
  }, [scheduledSurveys])

  if (loading) {
    return (
      <Container fluid className="py-4">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading scheduled surveys...</p>
        </div>
      </Container>
    )
  }
 
  

  // Get stats for dashboard
  const getStats = () => {
    const active = scheduledSurveys.filter(s => s.status === 'active').length
    const scheduled = scheduledSurveys.filter(s => s.status === 'scheduled').length
    const completed = scheduledSurveys.filter(s => s.status === 'completed').length
    const totalResponses = scheduledSurveys.reduce((sum, s) => sum + s.responses, 0)
    return { active, scheduled, completed, totalResponses }
  }

  const stats = getStats()
  const filteredSurveys = statusFilter === 'all' ? scheduledSurveys : scheduledSurveys.filter(s => s.status === statusFilter)

  return (
    <div className="survey-scheduling-container">
      <Container fluid>
        {/* Header Section */}
        <div className="scheduling-header">
          <div className="d-flex align-items-center justify-content-between flex-wrap mb-3">
            <div className="header-content">
              <div className="d-flex align-items-center mb-2">
                <MdSchedule className="me-2" style={{ color: 'var(--primary-color, #1fdae4)' }} size={28} />
                <h1 className="h4 mb-0 fw-bold">Survey Scheduling</h1>
              </div>
              <p className="text-muted mb-0 d-none d-sm-block">
                Schedule and manage automated survey campaigns
              </p>
            </div>
            <Button 
              variant="primary" 
              className="schedule-btn"
              onClick={handleCreateSchedule}
              size="sm"
            >
              <MdAdd className="me-1 me-sm-2" size={16} />
              <span className="d-none d-sm-inline">Schedule Survey</span>
              <span className="d-sm-none">Schedule</span>
            </Button>
          </div>
          
          {/* Stats Overview */}
          <div className="stats-overview">
            <div className="stat-card active">
              <div className="stat-icon">
                <MdPlay size={20} />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.active}</div>
                <div className="stat-label">Active</div>
              </div>
            </div>
            <div className="stat-card scheduled">
              <div className="stat-icon">
                <FaCalendarAlt size={18} />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.scheduled}</div>
                <div className="stat-label">Scheduled</div>
              </div>
            </div>
            <div className="stat-card completed">
              <div className="stat-icon">
                <MdTrendingUp size={20} />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.completed}</div>
                <div className="stat-label">Completed</div>
              </div>
            </div>
            <div className="stat-card responses d-none d-md-flex">
              <div className="stat-icon">
                <FaUsers size={18} />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.totalResponses}</div>
                <div className="stat-label">Responses</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and View Toggle */}
        <div className="filters-section">
          <div className="d-flex align-items-center justify-content-between flex-wrap">
            <div className="filter-controls">
              <Form.Select 
                size="sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="status-filter"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
              </Form.Select>
            </div>
            
            <div className="view-controls d-none d-lg-flex">
              <Button 
                variant={viewMode === 'cards' ? 'primary' : 'outline-secondary'}
                size="sm"
                onClick={() => setViewMode('cards')}
                className="me-2"
              >
                <MdViewModule size={16} />
              </Button>
              <Button 
                variant={viewMode === 'table' ? 'primary' : 'outline-secondary'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                <MdViewList size={16} />
              </Button>
            </div>
          </div>
        </div>

        {/* Surveys Content */}
        {viewMode === 'cards' || window.innerWidth < 992 ? (
          /* Cards View - Mobile and Desktop Cards */
          <div className="surveys-grid">
            {filteredSurveys
              .slice((pagination.page - 1) * pagination.limit, pagination.page * pagination.limit)
              .map((schedule) => (
                <div key={schedule.id} className="survey-card">
                  {/* Card Header */}
                  <div className="card-header">
                    <div className="survey-info">
                      <h5 className="survey-title">{schedule.title}</h5>
                      <p className="survey-id">ID: {schedule.surveyId}</p>
                    </div>
                    <div className="status-badge">
                      <Badge bg={getStatusVariant(schedule.status)} className="status-pill">
                        {schedule.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="card-content">
                    {/* Schedule Info */}
                    <div className="schedule-info">
                      <div className="info-row">
                        <FaCalendarAlt size={14} className="info-icon" />
                        <div className="info-content">
                          <div className="info-label">Start</div>
                          <div className="info-value">{new Date(schedule.startDate).toLocaleDateString()} at {new Date(schedule.startDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                        </div>
                      </div>
                      <div className="info-row">
                        <FaClock size={14} className="info-icon" />
                        <div className="info-content">
                          <div className="info-label">End</div>
                          <div className="info-value">{new Date(schedule.endDate).toLocaleDateString()} at {new Date(schedule.endDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                        </div>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="metadata">
                      <div className="meta-item">
                        <span className="meta-label">Frequency:</span>
                        <Badge bg="secondary" className="frequency-badge">{schedule.frequency}</Badge>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">Target:</span>
                        <span className="meta-value">{schedule.targetAudience}</span>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="progress-section">
                      <div className="progress-info">
                        <span className="progress-text">{schedule.responses} / {schedule.maxResponses || "∞"} responses</span>
                        {schedule.maxResponses && (
                          <span className="progress-percentage">
                            {Math.round((schedule.responses / schedule.maxResponses) * 100)}%
                          </span>
                        )}
                      </div>
                      {schedule.maxResponses && (
                        <ProgressBar 
                          now={Math.min((schedule.responses / schedule.maxResponses) * 100, 100)}
                          className="custom-progress"
                        />
                      )}
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="card-actions">
                    {getStatusActions(schedule)}
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handleEditSchedule(schedule)}
                      className="action-btn"
                    >
                      <MdEdit size={16} />
                      <span className="btn-text">Edit</span>
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDeleteSchedule(schedule.id)}
                      className="action-btn"
                    >
                      <MdDelete size={16} />
                      <span className="btn-text">Delete</span>
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          /* Table View - Desktop Only */
          <Card className="table-card">
            <div className="table-responsive">
              <Table hover className="surveys-table">
                <thead>
                  <tr>
                    <th>Survey</th>
                    <th>Schedule</th>
                    <th>Frequency</th>
                    <th>Status</th>
                    <th>Progress</th>
                    <th>Target Audience</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSurveys
                    .slice((pagination.page - 1) * pagination.limit, pagination.page * pagination.limit)
                    .map((schedule) => (
                      <tr key={schedule.id}>
                        <td>
                          <div className="survey-cell">
                            <div className="fw-medium">{schedule.title}</div>
                            <small className="text-muted">ID: {schedule.surveyId}</small>
                          </div>
                        </td>
                        <td>
                          <div className="schedule-cell">
                            <div className="schedule-item">
                              <strong>Start:</strong> {new Date(schedule.startDate).toLocaleString()}
                            </div>
                            <div className="schedule-item">
                              <strong>End:</strong> {new Date(schedule.endDate).toLocaleString()}
                            </div>
                          </div>
                        </td>
                        <td>
                          <Badge bg="secondary">{schedule.frequency}</Badge>
                        </td>
                        <td>
                          <Badge bg={getStatusVariant(schedule.status)}>{schedule.status}</Badge>
                        </td>
                        <td>
                          <div className="progress-cell">
                            <div className="progress-text">
                              {schedule.responses} / {schedule.maxResponses || "∞"}
                            </div>
                            {schedule.maxResponses && (
                              <ProgressBar 
                                now={Math.min((schedule.responses / schedule.maxResponses) * 100, 100)}
                                className="table-progress"
                              />
                            )}
                          </div>
                        </td>
                        <td>{schedule.targetAudience}</td>
                        <td>
                          <div className="table-actions">
                            {getStatusActions(schedule)}
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleEditSchedule(schedule)}
                              title="Edit"
                            >
                              <MdEdit />
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDeleteSchedule(schedule.id)}
                              title="Delete"
                            >
                              <MdDelete />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </Table>
            </div>
          </Card>
        )}

        {/* Pagination */}
        <div className="pagination-container">
          <Pagination
            current={pagination.page}
            total={filteredSurveys.length}
            limit={pagination.limit}
            onChange={(page) => setPagination((prev) => ({ ...prev, page }))}
            darkMode={darkMode}
          />
        </div>

        {/* Schedule Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" className="schedule-modal">
          <Modal.Header closeButton className="modal-header-custom">
            <Modal.Title>
              <MdSchedule className="me-2" />
              {editingSchedule ? "Edit Schedule" : "Schedule Survey"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="modal-body-custom">
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Survey</Form.Label>
                  <Form.Select
                    value={formData.surveyId}
                    onChange={(e) => setFormData({ ...formData, surveyId: e.target.value })}
                    required
                  >
                    <option value="">Select a survey</option>
                    <option value="survey-1">Customer Satisfaction Survey</option>
                    <option value="survey-2">Product Feedback Survey</option>
                    <option value="survey-3">Employee Engagement Survey</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Title</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Schedule title"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Start Date & Time</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>End Date & Time</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Timezone</Form.Label>
                  <Form.Select
                    value={formData.timezone}
                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                    <option value="Europe/Paris">Paris</option>
                    <option value="Asia/Tokyo">Tokyo</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Frequency</Form.Label>
                  <Form.Select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  >
                    <option value="once">One Time</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Max Responses</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.maxResponses}
                    onChange={(e) => setFormData({ ...formData, maxResponses: e.target.value })}
                    placeholder="Leave empty for unlimited"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Target Audience</Form.Label>
              <Form.Control
                type="text"
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                placeholder="e.g., All Customers, Team Members, Beta Users"
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    label="Enable reminders"
                    checked={formData.reminderEnabled}
                    onChange={(e) => setFormData({ ...formData, reminderEnabled: e.target.checked })}
                  />
                </Form.Group>
              </Col>
              {formData.reminderEnabled && (
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Reminder (days before end)</Form.Label>
                    <Form.Control
                      type="number"
                      min="1"
                      max="30"
                      value={formData.reminderDays}
                      onChange={(e) => setFormData({ ...formData, reminderDays: Number.parseInt(e.target.value) })}
                    />
                  </Form.Group>
                </Col>
              )}
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveSchedule}>
            {editingSchedule ? "Update Schedule" : "Create Schedule"}
          </Button>
        </Modal.Footer>
        </Modal>
      </Container>
    </div>
  )
}

export default SurveyScheduling
