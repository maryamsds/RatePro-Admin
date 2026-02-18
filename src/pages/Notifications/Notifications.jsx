// src\pages\Notifications\Notifications.jsx

"use client"
import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
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
      info: <MdInfo className="text-[var(--info-color)]" />,
      success: <MdCheckCircle className="text-[var(--success-color)]" />,
      warning: <MdWarning className="text-[var(--warning-color)]" />,
      error: <MdError className="text-[var(--danger-color)]" />,
      alert: <MdCampaign className="text-[var(--primary-color)]" />,
      system: <MdNotifications className="text-[var(--secondary-color)]" />,
    }
    return icons[type] || icons.info
  }

  // Get priority badge
  const getPriorityBadge = (priority) => {
    const colors = {
      low: "bg-[var(--secondary-color)]",
      normal: "bg-[var(--info-color)]",
      high: "bg-[var(--warning-color)]",
      urgent: "bg-[var(--danger-color)]",
    }
    const labels = { low: "Low", normal: "Normal", high: "High", urgent: "Urgent" }
    return <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${colors[priority] || colors.normal} text-white`}>{labels[priority] || "Normal"}</span>
  }

  // Get status badge
  const getStatusBadge = (status) => {
    const isRead = status === "read"
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${isRead ? "bg-[var(--success-color)]" : "bg-[var(--primary-color)]"} text-white`}>
        {isRead ? "Read" : "Unread"}
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
      <div className="flex items-center justify-center min-h-screen bg-[var(--light-bg)] dark:bg-[var(--dark-bg)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[var(--light-text)] dark:text-[var(--dark-text)] font-medium">Loading notifications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] min-h-screen">
      {/* Page Header */}
      <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)] mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[var(--primary-light)] text-[var(--primary-color)] text-2xl">
              <MdNotifications />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">Notifications</h1>
              <p className="text-sm text-[var(--text-secondary)] dark:text-[var(--dark-text)] opacity-70">Stay updated with all your alerts and messages</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)]"
              onClick={fetchNotifications}
            >
              <MdRefresh /> Refresh
            </button>
            {stats.unread > 0 && (
              <button 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors border border-[var(--success-color)] bg-transparent text-[var(--success-color)] hover:bg-[var(--success-color)] hover:text-white"
                onClick={handleMarkAllAsRead}
              >
                <MdDoneAll /> Mark All Read
              </button>
            )}
            {notifications.length > 0 && (
              <button 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors border border-[var(--danger-color)] bg-transparent text-[var(--danger-color)] hover:bg-[var(--danger-color)] hover:text-white"
                onClick={handleDeleteAll}
              >
                <MdDeleteSweep /> Clear All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-4 border border-[var(--light-border)] dark:border-[var(--dark-border)] flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[var(--primary-light)] text-[var(--primary-color)] text-2xl">
            <MdNotifications />
          </div>
          <div>
            <div className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">{stats.total}</div>
            <div className="text-sm text-[var(--text-secondary)] dark:text-[var(--dark-text)] opacity-70">Total</div>
          </div>
        </div>
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-4 border border-[var(--light-border)] dark:border-[var(--dark-border)] flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[var(--danger-light)] text-[var(--danger-color)] text-2xl">
            <MdInbox />
          </div>
          <div>
            <div className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">{stats.unread}</div>
            <div className="text-sm text-[var(--text-secondary)] dark:text-[var(--dark-text)] opacity-70">Unread</div>
          </div>
        </div>
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-4 border border-[var(--light-border)] dark:border-[var(--dark-border)] flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[var(--warning-light)] text-[var(--warning-color)] text-2xl">
            <MdWarning />
          </div>
          <div>
            <div className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">{stats.high}</div>
            <div className="text-sm text-[var(--text-secondary)] dark:text-[var(--dark-text)] opacity-70">High Priority</div>
          </div>
        </div>
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-4 border border-[var(--light-border)] dark:border-[var(--dark-border)] flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[var(--success-light)] text-[var(--success-color)] text-2xl">
            <MdSchedule />
          </div>
          <div>
            <div className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">{stats.today}</div>
            <div className="text-sm text-[var(--text-secondary)] dark:text-[var(--dark-text)] opacity-70">Today</div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-4 border border-[var(--light-border)] dark:border-[var(--dark-border)] mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] dark:text-[var(--dark-text)] opacity-70" />
            <input
              type="text"
              className="w-full pl-10 pr-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition-all"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition-all"
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
            className="px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition-all"
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
            className="px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition-all"
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
      </div>

      {/* Notifications List */}
      <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
        <div className="flex items-center justify-between p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <h2 className="text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">All Notifications</h2>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[var(--primary-light)] text-[var(--primary-color)]">
            {filteredNotifications.length} notification(s)
          </span>
        </div>

        {filteredNotifications.length > 0 ? (
          <div className="divide-y divide-[var(--light-border)] dark:divide-[var(--dark-border)]">
            {filteredNotifications.map((notification) => (
              <div
                key={notification._id}
                className={`flex items-start gap-4 p-4 transition-all hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] ${
                  notification.status !== "read" 
                    ? "bg-[var(--primary-light)] border-l-4 border-[var(--primary-color)]" 
                    : ""
                }`}
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] flex items-center justify-center text-xl">
                  {getNotificationIcon(notification.type)}
                </div>
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start justify-between gap-4 mb-1">
                    <h4 className="text-base font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">
                      {notification.title}
                    </h4>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {getPriorityBadge(notification.priority)}
                      {getStatusBadge(notification.status)}
                    </div>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] dark:text-[var(--dark-text)] opacity-80 mb-2 line-clamp-2">
                    {notification.message || notification.body}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-xs text-[var(--text-secondary)] dark:text-[var(--dark-text)] opacity-70">
                      <MdSchedule size={14} /> {formatTime(notification.createdAt)}
                    </span>
                    {notification.category && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--text-secondary)] dark:text-[var(--dark-text)]">
                        {notification.category}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {notification.status !== "read" && (
                    <button
                      title="Mark as Read"
                      onClick={() => handleMarkAsRead(notification._id)}
                      className="p-2 rounded-md border border-[var(--success-color)] text-[var(--success-color)] hover:bg-[var(--success-color)] hover:text-white transition-colors"
                    >
                      <MdMarkEmailRead />
                    </button>
                  )}
                  <button
                    title="Archive"
                    onClick={() => handleArchive(notification._id)}
                    className="p-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--text-secondary)] dark:text-[var(--dark-text)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] transition-colors"
                  >
                    <MdArchive />
                  </button>
                  <button
                    title="Delete"
                    onClick={() => handleDelete(notification._id)}
                    className="p-2 rounded-md border border-[var(--danger-color)] text-[var(--danger-color)] hover:bg-[var(--danger-color)] hover:text-white transition-colors"
                  >
                    <MdDelete />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <MdNotifications size={64} className="text-[var(--text-secondary)] dark:text-[var(--dark-text)] opacity-30 mb-4" />
            <h3 className="text-xl font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)] mb-2">No Notifications</h3>
            <p className="text-sm text-[var(--text-secondary)] dark:text-[var(--dark-text)] opacity-70">You're all caught up! No notifications to display.</p>
          </div>
        )}

        {filteredNotifications.length > 0 && (
          <div className="p-4 border-t border-[var(--light-border)] dark:border-[var(--dark-border)]">
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
