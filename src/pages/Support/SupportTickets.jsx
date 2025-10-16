// src\pages\Support\SupportTickets.jsx

"use client"

import { useState, useEffect } from "react"
import {
  MdSupport,
  MdAdd,
  MdSearch,
  MdFilterList,
  MdMoreVert,
  MdEdit,
  MdDelete,
  MdRefresh,
  MdReply,
  MdAssignment,
  MdPriorityHigh,
  MdPerson,
  MdSchedule,
  MdCheckCircle,
  MdClose,
} from "react-icons/md"
import Pagination from "../../components/Pagination/Pagination.jsx"

const SupportTickets = ({ darkMode }) => {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 })

  useEffect(() => {
    setTimeout(() => {
      const allTickets = [
        {
          id: 1,
          ticketNumber: "TKT-2024-001",
          subject: "Unable to access survey dashboard",
          description: "User cannot log into the survey dashboard after password reset",
          status: "Open",
          priority: "High",
          category: "Technical",
          submittedBy: "john.doe@company.com",
          assignedTo: "Support Team",
          createdDate: "2024-01-20 14:30",
          lastUpdated: "2024-01-20 16:45",
          responseTime: "2h 15m",
        },
        {
          id: 2,
          ticketNumber: "TKT-2024-002",
          subject: "Survey responses not saving",
          description: "Survey responses are not being saved when users submit the form",
          status: "In Progress",
          priority: "Critical",
          category: "Bug",
          submittedBy: "jane.smith@company.com",
          assignedTo: "Dev Team",
          createdDate: "2024-01-20 10:15",
          lastUpdated: "2024-01-20 15:30",
          responseTime: "5h 15m",
        },
        {
          id: 3,
          ticketNumber: "TKT-2024-003",
          subject: "Request for custom survey template",
          description: "Need a custom template for employee satisfaction survey",
          status: "Resolved",
          priority: "Medium",
          category: "Feature Request",
          submittedBy: "hr@company.com",
          assignedTo: "Design Team",
          createdDate: "2024-01-19 09:30",
          lastUpdated: "2024-01-20 11:20",
          responseTime: "1d 2h",
        },
        {
          id: 4,
          ticketNumber: "TKT-2024-004",
          subject: "Email notifications not working",
          description: "Survey invitation emails are not being sent to participants",
          status: "Open",
          priority: "High",
          category: "Technical",
          submittedBy: "marketing@company.com",
          assignedTo: "Support Team",
          createdDate: "2024-01-19 16:45",
          lastUpdated: "2024-01-19 17:30",
          responseTime: "45m",
        },
        {
          id: 5,
          ticketNumber: "TKT-2024-005",
          subject: "Data export functionality issue",
          description: "Cannot export survey results to Excel format",
          status: "Closed",
          priority: "Low",
          category: "Bug",
          submittedBy: "analytics@company.com",
          assignedTo: "Dev Team",
          createdDate: "2024-01-18 14:20",
          lastUpdated: "2024-01-19 10:15",
          responseTime: "19h 55m",
        },
        {
          id: 6,
          ticketNumber: "TKT-2024-006",
          subject: "Account access permission request",
          description: "Request for admin access to survey management system",
          status: "Pending",
          priority: "Medium",
          category: "Access Request",
          submittedBy: "manager@company.com",
          assignedTo: "Admin Team",
          createdDate: "2024-01-18 11:30",
          lastUpdated: "2024-01-18 12:45",
          responseTime: "1h 15m",
        },
        {
          id: 7,
          ticketNumber: "TKT-2024-007",
          subject: "Survey link not working on mobile",
          description: "Survey link redirects to error page when accessed from mobile devices",
          status: "In Progress",
          priority: "High",
          category: "Bug",
          submittedBy: "mobile.user@company.com",
          assignedTo: "Dev Team",
          createdDate: "2024-01-17 13:15",
          lastUpdated: "2024-01-18 09:30",
          responseTime: "20h 15m",
        },
        {
          id: 8,
          ticketNumber: "TKT-2024-008",
          subject: "Training request for new features",
          description: "Request for training session on new survey analytics features",
          status: "Scheduled",
          priority: "Low",
          category: "Training",
          submittedBy: "training@company.com",
          assignedTo: "Training Team",
          createdDate: "2024-01-16 10:45",
          lastUpdated: "2024-01-17 14:20",
          responseTime: "1d 3h 35m",
        },
      ]
      setTickets(allTickets)
      setPagination((prev) => ({ ...prev, total: allTickets.length }))
      setLoading(false)
    }, 1000)
  }, [])

  const getStatusBadge = (status) => {
    const statusClass = status.toLowerCase().replace(" ", "-")
    return (
      <span className={`status-badge status-${statusClass}`}>
        {status}
      </span>
    )
  }

  const getPriorityBadge = (priority) => {
    const priorityClass = priority.toLowerCase()
    return (
      <span className={`priority-badge priority-${priorityClass}`}>
        {priority === "Critical" && <MdPriorityHigh />}
        {priority}
      </span>
    )
  }

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter =
      filterStatus === "all" || ticket.status.toLowerCase().replace(" ", "").includes(filterStatus.toLowerCase())
    return matchesSearch && matchesFilter
  })

  const currentTickets = filteredTickets.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit,
  )

  const handleDelete = (ticket) => {
    setSelectedTicket(ticket)
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    setTickets(tickets.filter((t) => t.id !== selectedTicket.id))
    setShowDeleteModal(false)
    setSelectedTicket(null)
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading support tickets...</p>
      </div>
    )
  }

  return (
    <div className="support-tickets-container">
      {/* Page Header */}
      <div className="page-header-section">
        <div className="page-header-content">
          <div className="page-header-left">
            <div className="page-header-icon">
              <MdSupport />
            </div>
            <div className="page-header-text">
              <h1>Support Tickets</h1>
              <p>Manage customer support requests and issues</p>
            </div>
          </div>
          <div className="page-header-actions">
            <button className="secondary-action">
              <MdRefresh /> Refresh
            </button>
            <button className="primary-action">
              <MdAdd /> Create Ticket
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-section">
        <div className="stat-card stat-card-primary">
          <div className="stat-icon">
            <MdSupport />
          </div>
          <div className="stat-details">
            <div className="stat-value">{tickets.length}</div>
            <div className="stat-label">Total Tickets</div>
          </div>
        </div>
        <div className="stat-card stat-card-danger">
          <div className="stat-icon">
            <MdAssignment />
          </div>
          <div className="stat-details">
            <div className="stat-value">{tickets.filter((t) => t.status === "Open").length}</div>
            <div className="stat-label">Open Tickets</div>
          </div>
        </div>
        <div className="stat-card stat-card-warning">
          <div className="stat-icon">
            <MdSchedule />
          </div>
          <div className="stat-details">
            <div className="stat-value">{tickets.filter((t) => t.status === "In Progress").length}</div>
            <div className="stat-label">In Progress</div>
          </div>
        </div>
        <div className="stat-card stat-card-success">
          <div className="stat-icon">
            <MdCheckCircle />
          </div>
          <div className="stat-details">
            <div className="stat-value">{tickets.filter((t) => t.status === "Resolved").length}</div>
            <div className="stat-label">Resolved</div>
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
            placeholder="Search tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="filter-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="inprogress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
          <option value="pending">Pending</option>
        </select>
        <button className="filter-button">
          <MdFilterList /> More Filters
        </button>
      </div>

      {/* Tickets Table */}
      <div className="section-card">
        <div className="section-header">
          <h2>Support Tickets</h2>
          <span className="section-count">{filteredTickets.length} ticket(s) found</span>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>
                  <div className="th-content">
                    <MdSupport /> Ticket Details
                  </div>
                </th>
                <th>Status</th>
                <th>Priority</th>
                <th>
                  <div className="th-content">
                    <MdPerson /> Assigned To
                  </div>
                </th>
                <th>Response Time</th>
                <th>Last Updated</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentTickets.length > 0 ? (
                currentTickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td>
                      <div className="ticket-details-cell">
                        <div className="ticket-number">{ticket.ticketNumber}</div>
                        <div className="ticket-subject">{ticket.subject}</div>
                        <div className="ticket-submitter">{ticket.submittedBy}</div>
                      </div>
                    </td>
                    <td>{getStatusBadge(ticket.status)}</td>
                    <td>{getPriorityBadge(ticket.priority)}</td>
                    <td className="ticket-assigned">{ticket.assignedTo}</td>
                    <td className="ticket-time">{ticket.responseTime}</td>
                    <td className="ticket-time">{ticket.lastUpdated}</td>
                    <td>
                      <div className="ticket-actions">
                        <div className="dropdown">
                          <button className="action-menu-btn">
                            <MdMoreVert />
                          </button>
                          <div className="dropdown-menu">
                            <button className="dropdown-item">
                              <MdReply /> Reply
                            </button>
                            <button className="dropdown-item">
                              <MdEdit /> Edit
                            </button>
                            <button className="dropdown-item">
                              <MdAssignment /> Assign
                            </button>
                            <div className="dropdown-divider"></div>
                            <button className="dropdown-item danger" onClick={() => handleDelete(ticket)}>
                              <MdDelete /> Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="no-data">
                    No tickets found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          <Pagination
            current={pagination.page}
            total={filteredTickets.length}
            limit={pagination.limit}
            onChange={(page) => setPagination((prev) => ({ ...prev, page }))}
            darkMode={darkMode}
          />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-container delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirm Delete</h2>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)}>
                <MdClose />
              </button>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to delete ticket <strong>"{selectedTicket?.ticketNumber}"</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button className="modal-button modal-button-secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button className="modal-button modal-button-danger" onClick={confirmDelete}>
                <MdDelete /> Delete Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SupportTickets
