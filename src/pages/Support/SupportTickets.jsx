// src\pages\Support\SupportTickets.jsx

"use client"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  MdSupport,
  MdAdd,
  MdSearch,
  MdFilterList,
  MdMoreVert,
  MdEdit,
  MdDelete,
  MdRefresh,
  MdAssignment,
  MdPriorityHigh,
  MdPerson,
  MdSchedule,
  MdCheckCircle,
  MdClose,
  MdVisibility,
} from "react-icons/md"
import Pagination from "../../components/Pagination/Pagination.jsx"
import {
  getTickets,
  deleteTicket,
  updateTicketStatus,
  formatTicketForDisplay
} from "../../api/ticketApi"
import { Button } from "react-bootstrap";
import { useAuth } from "../../context/AuthContext.jsx"
import Swal from "sweetalert2"

const SupportTickets = ({ darkMode }) => {
  const navigate = useNavigate()
  const { user, setGlobalLoading } = useAuth();
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 })

  // Fetch tickets function
  const fetchTickets = async () => {
    try {
      setLoading(true)

      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm || undefined,
        status: filterStatus !== "all" ? filterStatus : undefined,
        sort: "-createdAt"
      }

      const response = await getTickets(params)
      const { data, pagination: paginationData } = response.data
      // Format tickets for display
      const formattedTickets = data.map(ticket => ({
        id: ticket._id,
        ticketNumber: `TKT-${ticket._id.slice(-6).toUpperCase()}`,
        subject: ticket.subject,
        description: ticket.description,
        status: ticket.status,
        // priority: ticket.priority,
        category: ticket.category,
        submittedBy: ticket.createdBy?.email || ticket.contactEmail,
        submittedByName: ticket.createdBy?.name || "Unknown",
        assignedTo: ticket.assignedTo?.name || "Unassigned",
        createdDate: new Date(ticket.createdAt).toLocaleString(),
        lastUpdated: new Date(ticket.lastUpdated || ticket.updatedAt).toLocaleString(), // ✅ added support for lastUpdated
        responseTime: ticket.daysSinceCreation ? `${ticket.daysSinceCreation}d` : "New",
        attachmentCount: ticket.attachmentCount || 0,
        ...formatTicketForDisplay(ticket)
      }))

      setTickets(formattedTickets)
      setPagination(prev => ({
        ...prev,
        total: paginationData.totalCount,
        totalPages: paginationData.totalPages
      }))
    } catch (error) {
      console.error("Error fetching tickets:", error)
      Swal.fire({
        icon: "error",
        title: "Error Loading Tickets",
        text: error.response?.data?.message || "Failed to load tickets. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [pagination.page, pagination.limit, searchTerm, filterStatus])

  const getStatusBadge = (status) => {
    const statusClass = status.toLowerCase().replace(" ", "-")
    return (
      <span className={`status-badge status-${statusClass}`}>
        {status}
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

  // Handle ticket deletion
  const handleDelete = (ticket) => {
    setSelectedTicket(ticket)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    try {
      setGlobalLoading(true)
      await deleteTicket(selectedTicket.id)

      // Remove from local state
      setTickets(tickets.filter((t) => t.id !== selectedTicket.id))

      Swal.fire({
        icon: "success",
        title: "Ticket Deleted",
        text: "The ticket has been deleted successfully.",
        timer: 2000,
        showConfirmButton: false,
      })
    } catch (error) {
      console.error("Delete ticket error:", error)
      Swal.fire({
        icon: "error",
        title: "Delete Failed",
        text: error.response?.data?.message || "Failed to delete ticket. Please try again.",
      })
    } finally {
      setGlobalLoading(false)
      setShowDeleteModal(false)
      setSelectedTicket(null)
    }
  }

  // Handle status update
  const handleStatusUpdate = async (ticketId, newStatus) => {
    try {
      await updateTicketStatus(ticketId, newStatus)

      // Update local state
      setTickets(prev => prev.map(ticket =>
        ticket.id === id
          ? { ...ticket, status: newStatus, lastUpdated: new Date().toLocaleString() }
          : ticket
      ))

      Swal.fire({
        icon: "success",
        title: "Status Updated",
        text: `Ticket status changed to ${newStatus}.`,
        timer: 2000,
        showConfirmButton: false,
      })
    } catch (error) {
      console.error("Status update error:", error)
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: error.response?.data?.message || "Failed to update status. Please try again.",
      })
    }
  }

  // Handle refresh
  const handleRefresh = () => {
    fetchTickets()
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
            <button className="secondary-action" onClick={() => window.location.reload()}>
              <MdRefresh /> Refresh
            </button>
            {user.role !== "admin" && (
              <button className="primary-action" onClick={() => navigate("/app/support/create")}>
                <MdAdd /> Create Ticket
              </button>
            )}
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
            <div className="stat-value">{tickets.filter((t) => t.status === "open").length}</div>
            <div className="stat-label">Open Tickets</div>
          </div>
        </div>
        <div className="stat-card stat-card-warning">
          <div className="stat-icon">
            <MdSchedule />
          </div>
          <div className="stat-details">
            <div className="stat-value">{tickets.filter((t) => t.status === "in-progress").length}</div>
            <div className="stat-label">In Progress</div>
          </div>
        </div>
        <div className="stat-card stat-card-success">
          <div className="stat-icon">
            <MdCheckCircle />
          </div>
          <div className="stat-details">
            <div className="stat-value">{tickets.filter((t) => t.status === "resolved").length}</div>
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
                    <td onClick={() => navigate(`/app/support/${ticket.id}`)} style={{ cursor: "pointer" }}>
                      <div className="ticket-details-cell">
                        <div className="ticket-number">{ticket.ticketNumber}</div>
                        <div className="ticket-subject">{ticket.subject}</div>
                        <div className="ticket-submitter">{ticket.submittedBy}</div>
                      </div>
                    </td>
                    <td>{getStatusBadge(ticket.status)}</td>
                    {/* <td>{getPriorityBadge(ticket.priority)}</td> */}
                    <td className="ticket-assigned">{ticket.assignedTo}</td>
                    <td className="ticket-time">{ticket.responseTime}</td>
                    <td className="ticket-time">{ticket.lastUpdated}</td>
                    <td>
                      {/* <div className="ticket-actions">
                        <div className="dropdown">
                          <button className="action-menu-btn">
                            <MdMoreVert />
                          </button>
                          <div className="dropdown-menu">
                            <button className="dropdown-item" onClick={() => navigate(`/app/support/tickets/${ticket._id}`)}>
                              <MdVisibility /> View Details
                            </button>
                          
                            {/* <button className="dropdown-item">
                              <MdAssignment /> Assign
                            </button>
                            <div className="dropdown-divider"></div>
                            <button className="dropdown-item danger" onClick={() => handleDelete(ticket)}>
                              <MdDelete /> Delete
                            </button>
                          </div>
                        </div>
                      </div> */}
                      <div className="action-buttons">
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() => navigate(`/app/support/tickets/${ticket._id}`)}
                        >
                          <MdVisibility />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => handleDelete(ticket)}
                        >
                          <MdDelete />
                        </Button>
                        {/* text-danger */}
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
