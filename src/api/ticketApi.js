// src/api/ticketApi.js
// ========================================
// 🎫 Support Tickets API Module
// ========================================
import axiosInstance from "./axiosInstance";

// ========================================
// 🎯 Core CRUD Operations
// ========================================

/**
 * Create a new support ticket
 * @param {Object} ticketData - Ticket form data
 * @param {File[]} attachments - Array of file attachments (optional)
 * @returns {Promise} API response with created ticket
 */
export const createTicket = async (ticketData, attachments = []) => {
  try {
    const formData = new FormData();
    
    // Append ticket data
    Object.keys(ticketData).forEach(key => {
      if (ticketData[key] !== undefined && ticketData[key] !== null) {
        formData.append(key, ticketData[key]);
      }
    });
    
    // Append attachments (up to 2 files as per backend config)
    if (attachments && attachments.length > 0) {
      attachments.slice(0, 2).forEach(file => {
        formData.append('attachments', file);
      });
    }

    console.log("Creating ticket with data:", {
      ...ticketData,
      attachmentCount: attachments.length
    });

    const response = await axiosInstance.post("/tickets", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    // console.log("Ticket created successfully:", response.data);
    return response;
  } catch (error) {
    console.error("Create ticket error:", {
      status: error.response?.status,
      message: error.response?.data?.message,
      details: error.response?.data,
    });
    throw error;
  }
};

/**
 * Get all tickets with pagination and filtering
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Items per page (default: 10)
 * @param {string} params.search - Search term (optional)
 * @param {string} params.status - Filter by status (optional)
 * @param {string} params.category - Filter by category (optional)
 * @param {string} params.sort - Sort order (default: "-createdAt")
 * @returns {Promise} API response with tickets list and pagination
 */
export const getTickets = async (params = {}) => {
  try {
    // console.log("Fetching tickets with params:", params);

    const response = await axiosInstance.get("/tickets", { params });

    // console.log("Tickets fetched successfully:", {
    //   count: response.data.data?.length,
    //   pagination: response.data.pagination
    // });

    return response;
  } catch (error) {
    console.error("Get tickets error:", {
      status: error.response?.status,
      message: error.response?.data?.message,
    });
    throw error;
  }
};

/**
 * Get a single ticket by ID
 * @param {string} ticketId - Ticket ID
 * @returns {Promise} API response with ticket details
 */
export const getTicketById = async (id) => {
  try {
    if (!id) {
      throw new Error("Ticket ID is required");
    }

    // console.log("Fetching ticket by ID:", id);

    const response = await axiosInstance.get(`/tickets/${id}`);

    // console.log("Ticket fetched successfully:", response.data.data?._id);
    return response;
  } catch (error) {
    console.error("Get ticket by ID error:", {
      id,
      status: error.response?.status,
      message: error.response?.data?.message,
    });
    throw error;
  }
};

/**
 * Update a ticket (full update)
 * @param {string} ticketId - Ticket ID
 * @param {Object} updateData - Data to update
 * @returns {Promise} API response with updated ticket
 */
export const updateTicket = async (ticketId, updateData) => {
  try {
    if (!ticketId) {
      throw new Error("Ticket ID is required");
    }

    // console.log("Updating ticket:", { ticketId, updateData });

    const response = await axiosInstance.put(`/tickets/${ticketId}`, updateData);

    // console.log("Ticket updated successfully:", response.data.data?._id);
    return response;
  } catch (error) {
    console.error("Update ticket error:", {
      ticketId,
      status: error.response?.status,
      message: error.response?.data?.message,
    });
    throw error;
  }
};

/**
 * Update ticket status only
 * @param {string} ticketId - Ticket ID
 * @param {string} status - New status (open, in-progress, resolved, closed)
 * @returns {Promise} API response with updated ticket
 */
export const updateTicketStatus = async (ticketId, status) => {
  try {
    if (!ticketId || !status) {
      throw new Error("Ticket ID and status are required");
    }

    const validStatuses = ["open", "in-progress", "resolved", "closed"];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(", ")}`);
    }

    // console.log("Updating ticket status:", { ticketId, status });

    const response = await axiosInstance.patch(`/tickets/${ticketId}/status`, { status });

    // console.log("Ticket status updated successfully:", status);
    return response;
  } catch (error) {
    console.error("Update ticket status error:", {
      ticketId,
      status,
      errorStatus: error.response?.status,
      message: error.response?.data?.message,
    });
    throw error;
  }
};

/**
 * Delete a ticket (admin/companyAdmin only)
 * @param {string} ticketId - Ticket ID
 * @returns {Promise} API response
 */
export const deleteTicket = async (ticketId) => {
  try {
    if (!ticketId) {
      throw new Error("Ticket ID is required");
    }

    // console.log("Deleting ticket:", ticketId);

    const response = await axiosInstance.delete(`/tickets/${ticketId}`);

    // console.log("Ticket deleted successfully:", ticketId);
    return response;
  } catch (error) {
    console.error("Delete ticket error:", {
      ticketId,
      status: error.response?.status,
      message: error.response?.data?.message,
    });
    throw error;
  }
};

// ========================================
// 📊 Statistics & Analytics
// ========================================

/**
 * Get ticket statistics
 * @returns {Promise} API response with ticket statistics
 */
export const getTicketStats = async () => {
  try {
    // console.log("Fetching ticket statistics...");

    const response = await axiosInstance.get("/tickets/stats");

    return response;
  } catch (error) {
    console.error("Get ticket stats error:", {
      status: error.response?.status,
      message: error.response?.data?.message,
    });
    throw error;
  }
};

// ========================================
// 🔄 Bulk Operations
// ========================================

/**
 * Bulk update tickets (admin/companyAdmin only)
 * @param {string[]} ticketIds - Array of ticket IDs
 * @param {Object} updateData - Data to update
 * @returns {Promise} API response with bulk update results
 */
export const bulkUpdateTickets = async (ticketIds, updateData) => {
  try {
    if (!ticketIds || !Array.isArray(ticketIds) || ticketIds.length === 0) {
      throw new Error("Ticket IDs array is required");
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      throw new Error("Update data is required");
    }

    // console.log("Bulk updating tickets:", { 
    //   count: ticketIds.length, 
    //   updateData 
    // });

    const response = await axiosInstance.patch("/tickets/bulk", {
      ticketIds,
      updateData
    });

    // console.log("Bulk update completed:", {
    //   matched: response.data.data?.matchedCount,
    //   modified: response.data.data?.modifiedCount
    // });

    return response;
  } catch (error) {
    console.error("Bulk update tickets error:", {
      status: error.response?.status,
      message: error.response?.data?.message,
    });
    throw error;
  }
};

// ========================================
// 🔧 Utility Functions
// ========================================

/**
 * Get available ticket categories
 * @returns {Array} List of valid categories
 */
export const getTicketCategories = () => {
  return [
    { value: "technical", label: "Technical Issue" },
    { value: "bug", label: "Bug Report" },
    { value: "feature", label: "Feature Request" },
    { value: "access", label: "Access Request" },
    { value: "training", label: "Training" },
    { value: "billing", label: "Billing" },
    { value: "other", label: "Other" },
  ];
};

export const getTicketStatuses = () => {
  return [
    { value: "open", label: "Open", color: "primary" },
    { value: "in-progress", label: "In Progress", color: "info" },
    { value: "resolved", label: "Resolved", color: "success" },
    { value: "closed", label: "Closed", color: "secondary" },
  ];
};

/**
 * Get status badge variant for Bootstrap
 * @param {string} status - Ticket status
 * @returns {string} Bootstrap badge variant
 */
export const getStatusBadgeVariant = (status) => {
  const statusMap = {
    open: "primary",
    "in-progress": "info",
    resolved: "success",
    closed: "secondary",
  };
  return statusMap[status] || "secondary";
};


/**
 * Format ticket data for display
 * @param {Object} ticket - Raw ticket object
 * @returns {Object} Formatted ticket data
 */
export const formatTicketForDisplay = (ticket) => {
  if (!ticket) return null;

  return {
    ...ticket,
    formattedCreatedAt: new Date(ticket.createdAt).toLocaleDateString(),
    formattedUpdatedAt: new Date(ticket.updatedAt).toLocaleDateString(),
    statusBadge: getStatusBadgeVariant(ticket.status),
    categoryLabel: getTicketCategories().find(cat => cat.value === ticket.category)?.label || ticket.category,
    statusLabel: getTicketStatuses().find(stat => stat.value === ticket.status)?.label || ticket.status,
  };
};

// ========================================
// 📤 Export All Functions
// ========================================
export default {
  // CRUD Operations
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  updateTicketStatus,
  deleteTicket,
  
  // Statistics & Analytics
  getTicketStats,
  
  // Bulk Operations
  bulkUpdateTickets,
  
  // Utility Functions
  getTicketCategories,
//   getTicketPriorities,
  getTicketStatuses,
  getStatusBadgeVariant,
//   getPriorityBadgeVariant,
  formatTicketForDisplay,
};