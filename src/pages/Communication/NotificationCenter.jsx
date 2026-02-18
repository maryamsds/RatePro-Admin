// src\pages\Communication\NotificationCenter.jsx

"use client"

import { useState, useEffect } from "react"
import {
  MdNotifications,
  MdAdd,
  MdSearch,
  MdFilterList,
  MdEdit,
  MdDelete,
  MdRefresh,
  MdMarkAsUnread,
  MdMarkEmailRead,
  MdPriorityHigh,
  MdInfo,
  MdWarning,
  MdError,
  MdCheckCircle,
} from "react-icons/md"
import Pagination from "../../components/Pagination/Pagination.jsx"

const NotificationCenter = ({ darkMode }) => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState(null)
  const [pagination, setPagination] = useState({ page: 1, limit: 1, total: 0 })

  useEffect(() => {
    setTimeout(() => {
      const allNotifications = [
        {
          id: 1,
          title: "Survey Response Threshold Reached",
          message: "Customer Satisfaction Q4 survey has reached 100 responses",
          type: "Success",
          priority: "Medium",
          isRead: false,
          timestamp: "2024-01-20 14:30",
          source: "Survey System",
          recipient: "Admin",
        },
        {
          id: 2,
          title: "Low Response Rate Alert",
          message: "Product Feedback Survey has only 15% response rate after 3 days",
          type: "Warning",
          priority: "High",
          isRead: false,
          timestamp: "2024-01-20 12:15",
          source: "Analytics Engine",
          recipient: "Marketing Team",
        },
        {
          id: 3,
          title: "Survey Completion Notification",
          message: "Employee Engagement Survey has been completed successfully",
          type: "Success",
          priority: "Low",
          isRead: true,
          timestamp: "2024-01-19 16:45",
          source: "Survey System",
          recipient: "HR Team",
        },
        {
          id: 4,
          title: "System Maintenance Scheduled",
          message: "Scheduled maintenance on January 25th from 2:00 AM to 4:00 AM",
          type: "Info",
          priority: "Medium",
          isRead: false,
          timestamp: "2024-01-19 10:30",
          source: "System Admin",
          recipient: "All Users",
        },
        {
          id: 5,
          title: "Email Delivery Failed",
          message: "Failed to send survey invitation emails to 5 recipients",
          type: "Error",
          priority: "High",
          isRead: true,
          timestamp: "2024-01-18 09:20",
          source: "Email Service",
          recipient: "Admin",
        },
        {
          id: 6,
          title: "New User Registration",
          message: "3 new users have registered for the survey platform",
          type: "Info",
          priority: "Low",
          isRead: true,
          timestamp: "2024-01-18 08:15",
          source: "User Management",
          recipient: "Admin",
        },
        {
          id: 7,
          title: "Survey Template Updated",
          message: "Customer Satisfaction template has been updated with new questions",
          type: "Info",
          priority: "Medium",
          isRead: false,
          timestamp: "2024-01-17 15:30",
          source: "Template Manager",
          recipient: "Content Team",
        },
        {
          id: 8,
          title: "Data Export Completed",
          message: "Survey responses export for Q4 analysis has been completed",
          type: "Success",
          priority: "Low",
          isRead: true,
          timestamp: "2024-01-17 11:45",
          source: "Data Export",
          recipient: "Analytics Team",
        },
      ]
      setNotifications(allNotifications)
      setPagination((prev) => ({ ...prev, total: allNotifications.length }))
      setLoading(false)
    }, 1000)
  }, [])

  const getTypeBadge = (type) => {
    const badgeStyles = {
      Success: "bg-[var(--success-color)] text-white",
      Warning: "bg-[var(--warning-color)] text-white",
      Error: "bg-[var(--danger-color)] text-white",
      Info: "bg-[var(--info-color)] text-white",
    }
    const icons = {
      Success: <MdCheckCircle className="mr-1" size={14} />,
      Warning: <MdWarning className="mr-1" size={14} />,
      Error: <MdError className="mr-1" size={14} />,
      Info: <MdInfo className="mr-1" size={14} />,
    }
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${badgeStyles[type] || "bg-[var(--light-border)] dark:bg-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)]"}`}>
        {icons[type]}
        {type}
      </span>
    )
  }

  const getPriorityBadge = (priority) => {
    const badgeStyles = {
      High: "bg-[var(--danger-color)] text-white",
      Medium: "bg-[var(--warning-color)] text-white",
      Low: "bg-[var(--light-border)] dark:bg-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)]",
    }
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${badgeStyles[priority] || "bg-[var(--light-border)] dark:bg-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)]"}`}>
        {priority === "High" && <MdPriorityHigh className="mr-1" size={14} />}
        {priority}
      </span>
    )
  }

  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === "all" || notification.type.toLowerCase() === filterType.toLowerCase()
    return matchesSearch && matchesFilter
  })

  const currentNotifications = filteredNotifications.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit,
  )

  const handleDelete = (notification) => {
    setSelectedNotification(notification)
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    setNotifications(notifications.filter((n) => n.id !== selectedNotification.id))
    setShowDeleteModal(false)
    setSelectedNotification(null)
  }

  const toggleReadStatus = (id) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n)))
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center" style={{ height: "50vh" }}>
        <div className="w-12 h-12 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="py-4 px-3">
      {/* Header */}
      <div className="mb-4">
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <MdNotifications size={32} className="text-[var(--primary-color)]" />
            <div>
              <h2 className="text-2xl font-bold mb-1 text-[var(--light-text)] dark:text-[var(--dark-text)]">Notification Center</h2>
              <p className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-70 mb-0">Manage system notifications and alerts</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-md font-medium transition-colors border border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-[var(--primary-color)] hover:text-white flex items-center gap-1">
              <MdRefresh />
              Refresh
            </button>
            <button className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:opacity-90 flex items-center gap-1">
              <MdAdd />
              Create Notification
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)] border-l-4 border-l-[var(--primary-color)]">
          <div className="flex items-center justify-between">
            <div className="flex-grow">
              <div className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-70 mb-1">Total Notifications</div>
              <div className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">
                {notifications.length}
              </div>
            </div>
            <MdNotifications size={24} className="text-[var(--primary-color)]" />
          </div>
        </div>
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)] border-l-4 border-l-[var(--warning-color)]">
          <div className="flex items-center justify-between">
            <div className="flex-grow">
              <div className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-70 mb-1">Unread</div>
              <div className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">
                {notifications.filter((n) => !n.isRead).length}
              </div>
            </div>
            <MdMarkAsUnread size={24} className="text-[var(--warning-color)]" />
          </div>
        </div>
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)] border-l-4 border-l-[var(--danger-color)]">
          <div className="flex items-center justify-between">
            <div className="flex-grow">
              <div className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-70 mb-1">High Priority</div>
              <div className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">
                {notifications.filter((n) => n.priority === "High").length}
              </div>
            </div>
            <MdPriorityHigh size={24} className="text-[var(--danger-color)]" />
          </div>
        </div>
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)] border-l-4 border-l-[var(--success-color)]">
          <div className="flex items-center justify-between">
            <div className="flex-grow">
              <div className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-70 mb-1">Success Alerts</div>
              <div className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">
                {notifications.filter((n) => n.type === "Success").length}
              </div>
            </div>
            <MdCheckCircle size={24} className="text-[var(--success-color)]" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4">
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div className="p-3">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              <div className="md:col-span-6 lg:col-span-4">
                <div className="relative flex items-center">
                  <MdSearch className="absolute left-3 text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-50" />
                  <input
                    type="text"
                    className="w-full pl-10 pr-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                    placeholder="Search notifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="md:col-span-3 lg:col-span-2">
                <select
                  className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                  <option value="info">Info</option>
                </select>
              </div>
              <div className="md:col-span-3 lg:col-span-2">
                <button className="w-full px-4 py-2 rounded-md font-medium transition-colors border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-border)] dark:hover:bg-[var(--dark-border)] flex items-center justify-center gap-1">
                  <MdFilterList />
                  More Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Table */}
      <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">
                  <div className="flex items-center gap-2">
                    <MdNotifications size={16} />
                    Notification
                  </div>
                </th>
                <th className="py-3 px-2 text-left text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Type</th>
                <th className="py-3 px-2 text-left text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Priority</th>
                <th className="py-3 px-2 text-left text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Source</th>
                <th className="py-3 px-2 text-left text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Recipient</th>
                <th className="py-3 px-2 text-left text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Timestamp</th>
                <th className="py-3 px-2 text-center text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentNotifications.map((notification) => (
                <tr
                  key={notification.id}
                  className="border-b border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] transition-colors"
                  style={{ opacity: notification.isRead ? 0.7 : 1 }}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-start gap-2">
                      {!notification.isRead && (
                        <div
                          className="bg-[var(--primary-color)] rounded-full mt-1 flex-shrink-0"
                          style={{ width: "8px", height: "8px" }}
                        ></div>
                      )}
                      <div className="flex-grow">
                        <div className="font-medium mb-1 text-[var(--light-text)] dark:text-[var(--dark-text)]">
                          {notification.title}
                        </div>
                        <div className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-70">{notification.message}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-2">{getTypeBadge(notification.type)}</td>
                  <td className="py-3 px-2">{getPriorityBadge(notification.priority)}</td>
                  <td className="py-3 px-2">
                    <span className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">{notification.source}</span>
                  </td>
                  <td className="py-3 px-2">
                    <span className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">{notification.recipient}</span>
                  </td>
                  <td className="py-3 px-2">
                    <span className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">{notification.timestamp}</span>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        className="p-1.5 rounded-md transition-colors border border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-[var(--primary-color)] hover:text-white"
                        onClick={() => toggleReadStatus(notification.id)}
                        title={notification.isRead ? "Mark as unread" : "Mark as read"}
                      >
                        {notification.isRead ? <MdMarkAsUnread size={14} /> : <MdMarkEmailRead size={14} />}
                      </button>
                      <button
                        className="p-1.5 rounded-md transition-colors border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-border)] dark:hover:bg-[var(--dark-border)]"
                        title="Edit notification"
                      >
                        <MdEdit size={14} />
                      </button>
                      <button
                        className="p-1.5 rounded-md transition-colors border border-[var(--danger-color)] text-[var(--danger-color)] hover:bg-[var(--danger-color)] hover:text-white"
                        onClick={() => handleDelete(notification)}
                        title="Delete notification"
                      >
                        <MdDelete size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-3 border-t border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <Pagination
            current={pagination.page}
            total={filteredNotifications.length}
            limit={pagination.limit}
            onChange={(page) => setPagination((prev) => ({ ...prev, page }))}
            darkMode={darkMode}
          />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="fixed inset-0 bg-black bg-opacity-50" 
            onClick={() => setShowDeleteModal(false)}
          ></div>
          <div className="relative bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-lg border border-[var(--light-border)] dark:border-[var(--dark-border)] max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <h5 className="text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">Confirm Delete</h5>
              <button 
                type="button" 
                className="text-[var(--light-text)] dark:text-[var(--dark-text)] hover:opacity-70 transition-opacity"
                onClick={() => setShowDeleteModal(false)}
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            <div className="p-4">
              <p className="text-[var(--light-text)] dark:text-[var(--dark-text)]">
                Are you sure you want to delete "{selectedNotification?.title}"? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 p-4 border-t border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <button 
                className="px-4 py-2 rounded-md font-medium transition-colors border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-border)] dark:hover:bg-[var(--dark-border)]" 
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--danger-color)] text-white hover:opacity-90" 
                onClick={confirmDelete}
              >
                Delete Notification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationCenter
