// src\pages\Notifications\Notifications.jsx

"use client"
import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import "./Notifications.css"
import {
  MdNotifications,
  MdSearch,
  MdFilterList,
  MdRefresh,
  MdCheckCircle,
  MdClose,
  MdMarkEmailRead,
  MdDelete,
  MdDeleteSweep,
  MdArchive,
  MdInfo,
  MdWarning,
  MdError,
  MdCampaign,
  MdVisibility,
  MdDoneAll,
  MdSchedule,
  MdInbox,
} from "react-icons/md"
import { Button, Badge, Form } from "react-bootstrap"
import Pagination from "../../components/Pagination/Pagination.jsx"
import { notificationAPI } from "../../api/axiosInstance.js"
import { useAuth } from "../../context/AuthContext.jsx"
import Swal from "sweetalert2"

const Notifications = ({ darkMode }) => {
  const navigate = useNavigate()
  const { setGlobalLoading } = useAuth()
  
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterType, setFilterType] = useState("all")
  const [filterPriority, setFilterPriority] = useState("all")
  const [selectedNotifications, setSelectedNotifications] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 })

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true)
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        status: filterStatus !== "all" ? filterStatus : undefined,
        type: filterType !== "all" ? filterType : undefined,
        priority: filterPriority !== "all" ? filterPriority : undefined,
      }

      const response = await notificationAPI.getMyNotifications(params)
      
      if (response?.data?.success) {
        const notifs = response.data.data?.notifications || response.data.notifications || []
        setNotifications(notifs)
        setPagination(prev => ({
          ...prev,
          total: response.data.data?.pagination?.total || response.data.pagination?.total || notifs.length,
          totalPages: response.data.data?.pagination?.totalPages || response.data.pagination?.totalPages || 1,
        }))
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
      Swal.fire({
        icon: "error",
        title: "Error Loading Notifications",
        text: error.response?.data?.message || "Failed to load notifications. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, filterStatus, filterType, filterPriority])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Format time
  const formatTime = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
    return date.toLocaleDateString()
  }

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    const icons = {
      info: <MdInfo className="text-info" />,
      success: <MdCheckCircle className="text-success" />,
      warning: <MdWarning className="text-warning" />,
      error: <MdError className="text-danger" />,
      alert: <MdCampaign className="text-primary" />,
      system: <MdNotifications className="text-secondary" />,
    }
    return icons[type] || icons.info
  }

  // Get priority badge
  const getPriorityBadge = (priority) => {
    const badges = {
      low: <Badge bg="secondary">Low</Badge>,
      normal: <Badge bg="info">Normal</Badge>,
      high: <Badge bg="warning">High</Badge>,
      urgent: <Badge bg="danger">Urgent</Badge>,
    }
    return badges[priority] || badges.normal
  }

  // Get status badge
  const getStatusBadge = (status) => {
    const statusClass = status?.toLowerCase().replace(" ", "-") || "unread"
    return (
      <span className={`status-badge status-${statusClass}`}>
        {status === "read" ? "Read" : "Unread"}
      </span>
    )
  }

  // Handle mark as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId)
      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, status: "read" } : n)
      )
      Swal.fire({
        icon: "success",
        title: "Marked as Read",
        timer: 1500,
        showConfirmButton: false,
      })
    } catch (error) {
      console.error("Error marking as read:", error)
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: error.response?.data?.message || "Failed to mark notification as read.",
      })
    }
  }

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      setGlobalLoading(true)
      await notificationAPI.markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, status: "read" })))
      Swal.fire({
        icon: "success",
        title: "All Marked as Read",
        timer: 1500,
        showConfirmButton: false,
      })
    } catch (error) {
      console.error("Error marking all as read:", error)
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: error.response?.data?.message || "Failed to mark all as read.",
      })
    } finally {
      setGlobalLoading(false)
    }
  }

  // Handle archive
  const handleArchive = async (notificationId) => {
    try {
      await notificationAPI.archive(notificationId)
      setNotifications(prev => prev.filter(n => n._id !== notificationId))
      Swal.fire({
        icon: "success",
        title: "Archived",
        timer: 1500,
        showConfirmButton: false,
      })
    } catch (error) {
      console.error("Error archiving:", error)
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: error.response?.data?.message || "Failed to archive notification.",
      })
    }
  }

  // Handle delete
  const handleDelete = async (notificationId) => {
    const result = await Swal.fire({
      title: "Delete Notification?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    })

    if (result.isConfirmed) {
      try {
        await notificationAPI.delete(notificationId)
        setNotifications(prev => prev.filter(n => n._id !== notificationId))
        Swal.fire({
          icon: "success",
          title: "Deleted",
          timer: 1500,
          showConfirmButton: false,
        })
      } catch (error) {
        console.error("Error deleting:", error)
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: error.response?.data?.message || "Failed to delete notification.",
        })
      }
    }
  }

  // Handle delete all
  const handleDeleteAll = async () => {
    const result = await Swal.fire({
      title: "Delete All Notifications?",
      text: "This will permanently delete all your notifications. This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete all!",
    })

    if (result.isConfirmed) {
      try {
        setGlobalLoading(true)
        await notificationAPI.deleteAll()
        setNotifications([])
        Swal.fire({
          icon: "success",
          title: "All Deleted",
          timer: 1500,
          showConfirmButton: false,
        })
      } catch (error) {
        console.error("Error deleting all:", error)
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: error.response?.data?.message || "Failed to delete notifications.",
        })
      } finally {
        setGlobalLoading(false)
      }
    }
  }

  // Handle notification click (navigate to link if exists)
  const handleNotificationClick = (notification) => {
    if (notification.status !== "read") {
      handleMarkAsRead(notification._id)
    }
    if (notification.link) {
      navigate(notification.link)
    }
  }

  // Filter notifications
  const filteredNotifications = notifications.filter((notif) => {
    const matchesSearch =
      notif.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notif.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notif.body?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  // Stats
  const stats = {
    total: notifications.length,
    unread: notifications.filter(n => n.status !== "read").length,
    high: notifications.filter(n => n.priority === "high" || n.priority === "urgent").length,
    today: notifications.filter(n => {
      const date = new Date(n.createdAt)
      const today = new Date()
      return date.toDateString() === today.toDateString()
    }).length,
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading notifications...</p>
      </div>
    )
  }

  return (
    <div className="notifications-container">
      {/* Page Header */}
      <div className="page-header-section">
        <div className="page-header-content">
          <div className="page-header-left">
            <div className="page-header-icon">
              <MdNotifications />
            </div>
            <div className="page-header-text">
              <h1>Notifications</h1>
              <p>Stay updated with all your alerts and messages</p>
            </div>
          </div>
          <div className="page-header-actions">
            <button className="secondary-action" onClick={fetchNotifications}>
              <MdRefresh /> Refresh
            </button>
            {stats.unread > 0 && (
              <button className="secondary-action" onClick={handleMarkAllAsRead}>
                <MdDoneAll /> Mark All Read
              </button>
            )}
            {notifications.length > 0 && (
              <button className="danger-action" onClick={handleDeleteAll}>
                <MdDeleteSweep /> Clear All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-section">
        <div className="stat-card stat-card-primary">
          <div className="stat-icon">
            <MdNotifications />
          </div>
          <div className="stat-details">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total</div>
          </div>
        </div>
        <div className="stat-card stat-card-danger">
          <div className="stat-icon">
            <MdInbox />
          </div>
          <div className="stat-details">
            <div className="stat-value">{stats.unread}</div>
            <div className="stat-label">Unread</div>
          </div>
        </div>
        <div className="stat-card stat-card-warning">
          <div className="stat-icon">
            <MdWarning />
          </div>
          <div className="stat-details">
            <div className="stat-value">{stats.high}</div>
            <div className="stat-label">High Priority</div>
          </div>
        </div>
        <div className="stat-card stat-card-success">
          <div className="stat-icon">
            <MdSchedule />
          </div>
          <div className="stat-details">
            <div className="stat-value">{stats.today}</div>
            <div className="stat-label">Today</div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="search-input-container">
          <MdSearch className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="filter-select"
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value)
            setPagination(prev => ({ ...prev, page: 1 }))
          }}
        >
          <option value="all">All Status</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
        </select>
        <select
          className="filter-select"
          value={filterType}
          onChange={(e) => {
            setFilterType(e.target.value)
            setPagination(prev => ({ ...prev, page: 1 }))
          }}
        >
          <option value="all">All Types</option>
          <option value="info">Info</option>
          <option value="success">Success</option>
          <option value="warning">Warning</option>
          <option value="error">Error</option>
          <option value="alert">Alert</option>
          <option value="system">System</option>
        </select>
        <select
          className="filter-select"
          value={filterPriority}
          onChange={(e) => {
            setFilterPriority(e.target.value)
            setPagination(prev => ({ ...prev, page: 1 }))
          }}
        >
          <option value="all">All Priority</option>
          <option value="low">Low</option>
          <option value="normal">Normal</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      {/* Notifications List */}
      <div className="section-card">
        <div className="section-header">
          <h2>All Notifications</h2>
          <span className="section-count">{filteredNotifications.length} notification(s)</span>
        </div>

        {filteredNotifications.length > 0 ? (
          <div className="notifications-list">
            {filteredNotifications.map((notification) => (
              <div
                key={notification._id}
                className={`notification-item ${notification.status !== "read" ? "unread" : ""}`}
              >
                <div className="notification-icon">
                  {getNotificationIcon(notification.type)}
                </div>
                <div
                  className="notification-content"
                  onClick={() => handleNotificationClick(notification)}
                  style={{ cursor: notification.link ? "pointer" : "default" }}
                >
                  <div className="notification-header">
                    <h4 className="notification-title">{notification.title}</h4>
                    <div className="notification-meta">
                      {getPriorityBadge(notification.priority)}
                      {getStatusBadge(notification.status)}
                    </div>
                  </div>
                  <p className="notification-message">
                    {notification.message || notification.body}
                  </p>
                  <div className="notification-footer">
                    <span className="notification-time">
                      <MdSchedule size={14} /> {formatTime(notification.createdAt)}
                    </span>
                    {notification.category && (
                      <Badge bg="light" text="dark" className="ms-2">
                        {notification.category}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="notification-actions">
                  {notification.status !== "read" && (
                    <Button
                      size="sm"
                      variant="outline-success"
                      title="Mark as Read"
                      onClick={() => handleMarkAsRead(notification._id)}
                    >
                      <MdMarkEmailRead />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    title="Archive"
                    onClick={() => handleArchive(notification._id)}
                  >
                    <MdArchive />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline-danger"
                    title="Delete"
                    onClick={() => handleDelete(notification._id)}
                  >
                    <MdDelete />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <MdNotifications size={64} className="empty-icon" />
            <h3>No Notifications</h3>
            <p>You're all caught up! No notifications to display.</p>
          </div>
        )}

        {filteredNotifications.length > 0 && (
          <div className="table-footer">
            <Pagination
              current={pagination.page}
              total={pagination.total}
              limit={pagination.limit}
              onChange={(page) => setPagination((prev) => ({ ...prev, page }))}
              darkMode={darkMode}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default Notifications
