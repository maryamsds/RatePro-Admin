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
        category: ticket.category,
        submittedBy: ticket.createdBy?.email || ticket.contactEmail,
        submittedByName: ticket.createdBy?.name || "Unknown",
        assignedTo: ticket.assignedTo?.name || "Unassigned",
        createdDate: new Date(ticket.createdAt).toLocaleString(),
        lastUpdated: new Date(ticket.lastUpdated || ticket.updatedAt).toLocaleString(),
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
    const statusColors = {
      open: "bg-[var(--danger-color)]",
      "in-progress": "bg-[var(--warning-color)]",
      inprogress: "bg-[var(--warning-color)]",
      resolved: "bg-[var(--success-color)]",
      closed: "bg-gray-500",
      pending: "bg-[var(--info-color)]",
    }
    const colorClass = statusColors[status.toLowerCase().replace(" ", "-")] || "bg-gray-500"
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${colorClass} text-white`}>
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
        ticket.id === ticketId
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-[var(--light-text)] dark:text-[var(--dark-text)]">Loading support tickets...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center">
              <MdSupport className="text-2xl text-blue-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">Support Tickets</h1>
              <p className="text-sm text-[var(--text-secondary)]">Manage customer support requests and issues</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              className="px-4 py-2 rounded-md font-medium transition-colors bg-gray-100 dark:bg-gray-700 text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center gap-2"
              onClick={() => window.location.reload()}
            >
              <MdRefresh /> Refresh
            </button>
            {user.role !== "admin" && (
              <button 
                className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)] flex items-center gap-2"
                onClick={() => navigate("/app/support/create")}
              >
                <MdAdd /> Create Ticket
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center">
              <MdSupport className="text-2xl text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">{tickets.length}</p>
              <p className="text-sm text-[var(--text-secondary)]">Total Tickets</p>
            </div>
          </div>
        </div>
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-red-500/10 dark:bg-red-500/20 flex items-center justify-center">
              <MdAssignment className="text-2xl text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">{tickets.filter((t) => t.status === "open").length}</p>
              <p className="text-sm text-[var(--text-secondary)]">Open Tickets</p>
            </div>
          </div>
        </div>
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-yellow-500/10 dark:bg-yellow-500/20 flex items-center justify-center">
              <MdSchedule className="text-2xl text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">{tickets.filter((t) => t.status === "in-progress").length}</p>
              <p className="text-sm text-[var(--text-secondary)]">In Progress</p>
            </div>
          </div>
        </div>
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-500/10 dark:bg-green-500/20 flex items-center justify-center">
              <MdCheckCircle className="text-2xl text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">{tickets.filter((t) => t.status === "resolved").length}</p>
              <p className="text-sm text-[var(--text-secondary)]">Resolved</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-4 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input
              type="text"
              className="w-full pl-10 pr-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
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
          <button className="px-4 py-2 rounded-md font-medium transition-colors bg-gray-100 dark:bg-gray-700 text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center gap-2 whitespace-nowrap">
            <MdFilterList /> More Filters
          </button>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)] overflow-hidden">
        <div className="p-6 border-b border-[var(--light-border)] dark:border-[var(--dark-border)] flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">Support Tickets</h2>
          <span className="text-sm text-[var(--text-secondary)]">{filteredTickets.length} ticket(s) found</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <tr>
                <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">
                  <div className="flex items-center gap-2">
                    <MdSupport /> Ticket Details
                  </div>
                </th>
                <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">Status</th>
                <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">
                  <div className="flex items-center gap-2">
                    <MdPerson /> Assigned To
                  </div>
                </th>
                <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">Response Time</th>
                <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">Last Updated</th>
                <th className="p-3 text-center text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-[var(--light-card)] dark:bg-[var(--dark-card)]">
              {currentTickets.length > 0 ? (
                currentTickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] transition-colors">
                    <td className="p-3 cursor-pointer" onClick={() => navigate(`/app/support/${ticket.id}`)}>
                      <div className="space-y-1">
                        <div className="text-sm font-semibold text-[var(--primary-color)]">{ticket.ticketNumber}</div>
                        <div className="text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">{ticket.subject}</div>
                        <div className="text-xs text-[var(--text-secondary)]">{ticket.submittedBy}</div>
                      </div>
                    </td>
                    <td className="p-3 text-[var(--light-text)] dark:text-[var(--dark-text)]">{getStatusBadge(ticket.status)}</td>
                    <td className="p-3 text-[var(--light-text)] dark:text-[var(--dark-text)]">{ticket.assignedTo}</td>
                    <td className="p-3 text-[var(--light-text)] dark:text-[var(--dark-text)]">{ticket.responseTime}</td>
                    <td className="p-3 text-[var(--light-text)] dark:text-[var(--dark-text)]">{ticket.lastUpdated}</td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          className="p-1.5 border border-[var(--primary-color)] text-[var(--primary-color)] rounded hover:bg-blue-500/10 dark:hover:bg-blue-500/20 transition-colors"
                          onClick={() => navigate(`/app/support/tickets/${ticket._id}`)}
                        >
                          <MdVisibility />
                        </button>
                        <button
                          className="p-1.5 border border-red-400 text-red-500 rounded hover:bg-red-500/10 dark:hover:bg-red-500/20 transition-colors"
                          onClick={() => handleDelete(ticket)}
                        >
                          <MdDelete />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-6 text-center text-[var(--text-secondary)]">
                    No tickets found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-[var(--light-border)] dark:border-[var(--dark-border)]">
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
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowDeleteModal(false)}>
          <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-lg shadow-xl max-w-md w-full border border-[var(--light-border)] dark:border-[var(--dark-border)]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <h2 className="text-xl font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">Confirm Delete</h2>
              <button 
                className="text-[var(--text-secondary)] hover:text-[var(--light-text)] dark:hover:text-[var(--dark-text)] transition-colors"
                onClick={() => setShowDeleteModal(false)}
              >
                <MdClose className="text-2xl" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-[var(--light-text)] dark:text-[var(--dark-text)]">
                Are you sure you want to delete ticket <strong>"{selectedTicket?.ticketNumber}"</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <button 
                className="px-4 py-2 rounded-md font-medium transition-colors bg-gray-100 dark:bg-gray-700 text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-gray-200 dark:hover:bg-gray-600"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--danger-color)] text-white hover:opacity-90 flex items-center gap-2"
                onClick={confirmDelete}
              >
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
