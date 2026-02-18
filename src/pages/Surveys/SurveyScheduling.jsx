// src\pages\Surveys\SurveyScheduling.jsx

"use client"

import { useState, useEffect } from "react"
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
          <button
            className="p-1.5 rounded-lg text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
            onClick={() => handleStatusChange(schedule.id, "active")}
            title="Start Now"
          >
            <MdPlay />
          </button>
        )
      case "active":
        return (
          <button
            className="p-1.5 rounded-lg text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors"
            onClick={() => handleStatusChange(schedule.id, "paused")}
            title="Pause"
          >
            <MdPause />
          </button>
        )
      case "paused":
        return (
          <button
            className="p-1.5 rounded-lg text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
            onClick={() => handleStatusChange(schedule.id, "active")}
            title="Resume"
          >
            <MdPlay />
          </button>
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
      <div className="py-4 px-4">
        <div className="text-center">
          <span className="inline-block w-8 h-8 border-3 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin mb-3" />
          <p>Loading scheduled surveys...</p>
        </div>
      </div>
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
      <div className="px-4 py-2">
        {/* Header Section */}
        <div className="scheduling-header">
          <div className="flex align-items-center justify-content-between flex-wrap mb-3">
            <div className="header-content">
              <div className="flex align-items-center mb-2">
                <MdSchedule className="me-2" style={{ color: 'var(--primary-color, #1fdae4)' }} size={28} />
                <h1 className="h4 mb-0 fw-bold">Survey Scheduling</h1>
              </div>
              <p className="text-muted mb-0 d-none d-sm-block">
                Schedule and manage automated survey campaigns
              </p>
            </div>
            <button
              className="schedule-btn inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] text-white transition-all"
              onClick={handleCreateSchedule}
            >
              <MdAdd className="me-1 me-sm-2" size={16} />
              <span className="d-none d-sm-inline">Schedule Survey</span>
              <span className="d-sm-none">Schedule</span>
            </button>
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
            <div className="stat-card responses d-none d-mflex">
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
          <div className="flex align-items-center justify-content-between flex-wrap">
            <div className="filter-controls">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="status-filter px-3 py-1.5 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-sm"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="view-controls d-none d-lg-flex">
              <button
                className={`p-1.5 rounded-lg me-2 transition-colors ${viewMode === 'cards' ? 'bg-[var(--primary-color)] text-white' : 'border border-[var(--light-border)] dark:border-[var(--dark-border)]'}`}
                onClick={() => setViewMode('cards')}
              >
                <MdViewModule size={16} />
              </button>
              <button
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-[var(--primary-color)] text-white' : 'border border-[var(--light-border)] dark:border-[var(--dark-border)]'}`}
                onClick={() => setViewMode('table')}
              >
                <MdViewList size={16} />
              </button>
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
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${schedule.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          schedule.status === 'scheduled' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            schedule.status === 'completed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                              schedule.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                        {schedule.status}
                      </span>
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
                          <div className="info-value">{new Date(schedule.startDate).toLocaleDateString()} at {new Date(schedule.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                      </div>
                      <div className="info-row">
                        <FaClock size={14} className="info-icon" />
                        <div className="info-content">
                          <div className="info-label">End</div>
                          <div className="info-value">{new Date(schedule.endDate).toLocaleDateString()} at {new Date(schedule.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="metadata">
                      <div className="meta-item">
                        <span className="meta-label">Frequency:</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 frequency-badge">{schedule.frequency}</span>
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
                        <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden custom-progress">
                          <div className="h-full bg-[var(--primary-color)] rounded-full" style={{ width: `${Math.min((schedule.responses / schedule.maxResponses) * 100, 100)}%` }} />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="card-actions">
                    {getStatusActions(schedule)}
                    <button
                      className="action-btn p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      onClick={() => handleEditSchedule(schedule)}
                    >
                      <MdEdit size={16} />
                      <span className="btn-text">Edit</span>
                    </button>
                    <button
                      className="action-btn p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      onClick={() => handleDeleteSchedule(schedule.id)}
                    >
                      <MdDelete size={16} />
                      <span className="btn-text">Delete</span>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          /* Table View - Desktop Only */
          <div className="table-card card border-0 shadow-sm rounded-xl overflow-hidden">
            <div className="table-responsive">
              <table className="surveys-table w-full">
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
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">{schedule.frequency}</span>
                        </td>
                        <td>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${schedule.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                              schedule.status === 'scheduled' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                schedule.status === 'completed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                  schedule.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                    'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                            }`}>{schedule.status}</span>
                        </td>
                        <td>
                          <div className="progress-cell">
                            <div className="progress-text">
                              {schedule.responses} / {schedule.maxResponses || "∞"}
                            </div>
                            {schedule.maxResponses && (
                              <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden table-progress">
                                <div className="h-full bg-[var(--primary-color)] rounded-full" style={{ width: `${Math.min((schedule.responses / schedule.maxResponses) * 100, 100)}%` }} />
                              </div>
                            )}
                          </div>
                        </td>
                        <td>{schedule.targetAudience}</td>
                        <td>
                          <div className="table-actions flex items-center justify-center gap-1">
                            {getStatusActions(schedule)}
                            <button
                              className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                              onClick={() => handleEditSchedule(schedule)}
                              title="Edit"
                            >
                              <MdEdit />
                            </button>
                            <button
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              onClick={() => handleDeleteSchedule(schedule.id)}
                              title="Delete"
                            >
                              <MdDelete />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
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
        {showModal && (
          <div className="fixed inset-0 z-[1050] flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50" onClick={() => setShowModal(false)} />
            <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto schedule-modal">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)] modal-header-custom">
                <h5 className="font-semibold flex items-center gap-2 m-0">
                  <MdSchedule />
                  {editingSchedule ? "Edit Schedule" : "Schedule Survey"}
                </h5>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl">&times;</button>
              </div>
              {/* Body */}
              <div className="px-6 py-4 modal-body-custom space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Survey</label>
                    <select
                      value={formData.surveyId}
                      onChange={(e) => setFormData({ ...formData, surveyId: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-sm"
                    >
                      <option value="">Select a survey</option>
                      <option value="survey-1">Customer Satisfaction Survey</option>
                      <option value="survey-2">Product Feedback Survey</option>
                      <option value="survey-3">Employee Engagement Survey</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Schedule title"
                      required
                      className="w-full px-3 py-2 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Start Date & Time</label>
                    <input
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">End Date & Time</label>
                    <input
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Timezone</label>
                    <select
                      value={formData.timezone}
                      onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-sm"
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                      <option value="Europe/London">London</option>
                      <option value="Europe/Paris">Paris</option>
                      <option value="Asia/Tokyo">Tokyo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Frequency</label>
                    <select
                      value={formData.frequency}
                      onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-sm"
                    >
                      <option value="once">One Time</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Max Responses</label>
                    <input
                      type="number"
                      value={formData.maxResponses}
                      onChange={(e) => setFormData({ ...formData, maxResponses: e.target.value })}
                      placeholder="Leave empty for unlimited"
                      className="w-full px-3 py-2 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Target Audience</label>
                  <input
                    type="text"
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                    placeholder="e.g., All Customers, Team Members, Beta Users"
                    className="w-full px-3 py-2 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.reminderEnabled}
                        onChange={(e) => setFormData({ ...formData, reminderEnabled: e.target.checked })}
                        className="w-4 h-4 accent-[var(--primary-color)]"
                      />
                      <span className="text-sm">Enable reminders</span>
                    </label>
                  </div>
                  {formData.reminderEnabled && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Reminder (days before end)</label>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={formData.reminderDays}
                        onChange={(e) => setFormData({ ...formData, reminderDays: Number.parseInt(e.target.value) })}
                        className="w-full px-3 py-2 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-sm"
                      />
                    </div>
                  )}
                </div>
              </div>
              {/* Footer */}
              <div className="flex justify-end gap-2 px-6 py-4 border-t border-[var(--light-border)] dark:border-[var(--dark-border)]">
                <button className="px-4 py-2 rounded-lg text-sm border border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-gray-50 dark:hover:bg-gray-700 transition-all" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button className="px-4 py-2 rounded-lg text-sm bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] text-white transition-all" onClick={handleSaveSchedule}>
                  {editingSchedule ? "Update Schedule" : "Create Schedule"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SurveyScheduling
