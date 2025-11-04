// src/hooks/useTickets.js
// ========================================
// 🎫 Custom Hook for Ticket Management
// ========================================
import { useState, useEffect, useCallback } from "react"
import { 
  getTickets, 
  createTicket, 
  updateTicketStatus, 
  deleteTicket,
  getTicketStats 
} from "../api/ticketApi"
import Swal from "sweetalert2"

/**
 * Custom hook for managing tickets with state and API integration
 * @param {Object} initialParams - Initial parameters for fetching tickets
 * @returns {Object} Ticket state and management functions
 */
export const useTickets = (initialParams = {}) => {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  })
  const [filters, setFilters] = useState(initialParams)

  // Fetch tickets with current filters and pagination
  const fetchTickets = useCallback(async (params = {}) => {
    try {
      setLoading(true)
      setError(null)
      
      const queryParams = { ...filters, ...params }
      const response = await getTickets(queryParams)
      
      setTickets(response.data.data)
      setPagination(response.data.pagination)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch tickets")
      console.error("Fetch tickets error:", err)
    } finally {
      setLoading(false)
    }
  }, [filters])

  // Create a new ticket
  const createNewTicket = async (ticketData, attachments = []) => {
    try {
      const response = await createTicket(ticketData, attachments)
      
      // Add to the beginning of the tickets list
      setTickets(prev => [response.data.data, ...prev])
      
      Swal.fire({
        icon: "success",
        title: "Ticket Created",
        text: "Your support ticket has been created successfully!",
        timer: 2000,
        showConfirmButton: false,
      })
      
      return response.data.data
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to create ticket"
      Swal.fire({
        icon: "error",
        title: "Creation Failed",
        text: errorMessage,
      })
      throw err
    }
  }

  // Update ticket status
  const updateStatus = async (ticketId, newStatus) => {
    try {
      await updateTicketStatus(ticketId, newStatus)
      
      // Update the ticket in the list
      setTickets(prev => prev.map(ticket => 
        ticket._id === ticketId || ticket.id === ticketId
          ? { ...ticket, status: newStatus, updatedAt: new Date().toISOString() }
          : ticket
      ))
      
      Swal.fire({
        icon: "success",
        title: "Status Updated",
        text: `Ticket status changed to ${newStatus}`,
        timer: 2000,
        showConfirmButton: false,
      })
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to update status"
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: errorMessage,
      })
      throw err
    }
  }

  // Delete a ticket
  const removeTicket = async (ticketId) => {
    try {
      const result = await Swal.fire({
        title: "Delete Ticket?",
        text: "This action cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel"
      })

      if (result.isConfirmed) {
        await deleteTicket(ticketId)
        
        // Remove from the tickets list
        setTickets(prev => prev.filter(ticket => 
          ticket._id !== ticketId && ticket.id !== ticketId
        ))
        
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "The ticket has been deleted.",
          timer: 2000,
          showConfirmButton: false,
        })
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to delete ticket"
      Swal.fire({
        icon: "error",
        title: "Delete Failed",
        text: errorMessage,
      })
      throw err
    }
  }

  // Update filters and refetch
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    setPagination(prev => ({ ...prev, page: 1 })) // Reset to first page
  }, [])

  // Change page
  const changePage = useCallback((newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }, [])

  // Refresh tickets
  const refresh = useCallback(() => {
    fetchTickets()
  }, [fetchTickets])

  // Initial fetch
  useEffect(() => {
    fetchTickets()
  }, [fetchTickets, pagination.page, pagination.limit])

  return {
    // State
    tickets,
    loading,
    error,
    pagination,
    filters,
    
    // Actions  
    fetchTickets,
    createNewTicket,
    updateStatus,
    removeTicket,
    updateFilters,
    changePage,
    refresh,
  }
}

/**
 * Custom hook for ticket statistics
 * @returns {Object} Statistics state and fetch function
 */
export const useTicketStats = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await getTicketStats()
      setStats(response.data.data)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch statistics")
      console.error("Fetch stats error:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return {
    stats,
    loading,
    error,
    fetchStats,
  }
}