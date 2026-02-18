// src\pages\Support\TicketDetail.jsx

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  MdArrowBack,
  MdSupport,
  MdPerson,
  MdEmail,
  MdSchedule,
  MdCategory,
  MdInfo,
  MdAttachFile,
  MdDownload,
  MdSend,
  MdEdit,
  MdClose,
  MdCheckCircle,
  MdAccessTime,
  MdAssignment,
  MdUpdate,
} from "react-icons/md"
import Swal from "sweetalert2"
import {
  getTicketById,
  updateTicketStatus,
  updateTicket,
  formatTicketForDisplay,
  getTicketStatuses
} from "../../api/ticketApi"
import { useAuth } from '../../context/AuthContext';
import axiosInstance from "../../api/axiosInstance"
import { formatLocalDateTime } from "../../utilities/dateUtils"

const TicketDetail = () => {
  const navigate = useNavigate()
  const { user, setGlobalLoading } = useAuth();
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [ticket, setTicket] = useState(null)
  const [newComment, setNewComment] = useState("")
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [isTicketCreator, setIsTicketCreator] = useState(false)

  const fetchTicketDetails = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await getTicketById(id);
      const updatedTicketData = response.data.data || response.data;

      // ✅ Real formatting logic
      const formattedTicket = {
        id: updatedTicketData._id,
        ticketNumber: `TKT-${updatedTicketData._id.slice(-6).toUpperCase()}`,
        subject: updatedTicketData.subject,
        description: updatedTicketData.description,
        status: updatedTicketData.status,
        // priority: updatedTicketData.priority,
        category: updatedTicketData.category,
        submittedBy: {
          name: updatedTicketData.createdBy?.name || "Unknown",
          email: updatedTicketData.createdBy?.email || updatedTicketData.contactEmail,
          phone: updatedTicketData.createdBy?.phone || "N/A",
        },
        assignedTo: {
          name: updatedTicketData.assignedTo?.name || "Unassigned",
          email: updatedTicketData.assignedTo?.email || "N/A",
        },
        createdAt: formatLocalDateTime(updatedTicketData.createdAt),
        updatedAt: formatLocalDateTime(updatedTicketData.updatedAt),
        responseTime: updatedTicketData.daysSinceCreation ? `${updatedTicketData.daysSinceCreation}d` : "New",
        attachments: updatedTicketData.attachments?.map(att => ({
          name: att.fileName,
          size: att.fileSize ? `${(att.fileSize / 1024).toFixed(2)} KB` : "Unknown",
          url: att.fileUrl,
          type: att.fileType
        })) || [],
        comments: updatedTicketData.internalNotes?.map(note => ({
          id: note._id,
          author: note.createdBy?.name || "System",
          role: "support",
          timestamp: formatLocalDateTime(note.createdAt),
          message: note.note,
        })) || [],
        canEdit: updatedTicketData.canEdit || false,
        canDelete: updatedTicketData.canDelete || false,
        isOwner: updatedTicketData.isOwner || false,
        ...formatTicketForDisplay(updatedTicketData), // ✅ use helper if you've defined it
      };

      setTicket(formattedTicket);
    } catch (error) {
      console.error("Error fetching ticket:", error);

      if (error.response?.status === 404) {
        Swal.fire({
          icon: "error",
          title: "Ticket Not Found",
          text: "The requested ticket could not be found.",
        }).then(() => navigate("/app/support"));
      } else {
        Swal.fire({
          icon: "error",
          title: "Error Loading Ticket",
          text: error.response?.data?.message || "Failed to load ticket details.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ticket && user) {
      const isCreator =
        user._id === ticket.createdBy?._id ||
        user.id === ticket.createdBy?._id; // handles both cases

      setIsTicketCreator(isCreator);
    }
  }, [ticket, user]);

  useEffect(() => {
    fetchTicketDetails();
  }, [id]);

  // Handle status change
  const handleStatusChange = async (newStatus) => {
    if (!ticket?.id) return;

    // normalize or map status
    const statusMap = {
      open: "open",
      "Open": "open",
      "In Progress": "in-progress",
      "in progress": "in-progress",
      "In-Progress": "in-progress",
      resolved: "resolved",
      "Resolved": "resolved",
      closed: "closed",
      "Closed": "closed",
    };

    const mappedStatus = statusMap[newStatus] || newStatus.toLowerCase().trim();
    setIsUpdatingStatus(true);
    try {
      await updateTicketStatus(ticket.id, mappedStatus);

      setTicket((prev) => ({
        ...prev,
        status: mappedStatus,
        updatedAt: new Date().toLocaleString(),
      }));

      Swal.fire({
        icon: "success",
        title: "Status Updated",
        text: `Ticket status changed to ${mappedStatus}`,
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Status update error:", error);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: error.response?.data?.message || "Failed to update ticket status",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle adding a new comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !id) return;

    setIsSubmittingComment(true);
    try {
      const response = await axiosInstance.post(`/tickets/${id}/comments`, {
        message: newComment,
      });

      // try common locations where backend might put the comment object
      const resp = response.data || {};
      const raw = resp.data || resp.comment || resp || {};

      // build a normalized comment object that matches your render expectations
      const normalized = {
        id: raw._id || raw.id || `tmp-${Date.now()}`, // unique key in case backend doesn't return id
        author: {
          // if backend returned createdBy as populated object use it, otherwise fallback to current user
          _id: (raw.createdBy && (raw.createdBy._id || raw.createdBy.id)) || user._id || user.id,
          name: (raw.createdBy && (raw.createdBy.name)) || user.name || "You",
          avatar: (raw.createdBy && raw.createdBy.avatar)
            || (user.avatar ? { url: user.avatar.url || user.avatar } : null),
          // you can add other author fields if needed
        },
        role: raw.role || (raw.createdBy ? (raw.createdBy.role || "user") : "user"),
        timestamp: raw.createdAt ? formatLocalDateTime(raw.createdAt) : formatLocalDateTime(new Date()),
        message: raw.message || raw.note || raw.text || newComment,
        // keep original raw for debugging if needed
        _raw: raw,
      };

      setTicket((prevTicket) => ({
        ...prevTicket,
        comments: [...(prevTicket.comments || []), normalized],
      }));

      setNewComment("");

      Swal.fire({
        icon: "success",
        title: "Comment Added",
        text: "Your comment has been added.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Add comment error:", error);
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Could not add comment",
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Render status badge
  const getStatusBadge = (status) => {
    const statusColors = {
      Open: "bg-[var(--danger-color)] text-white",
      open: "bg-[var(--danger-color)] text-white",
      "In Progress": "bg-[var(--warning-color)] text-white",
      "in-progress": "bg-[var(--warning-color)] text-white",
      Resolved: "bg-[var(--success-color)] text-white",
      resolved: "bg-[var(--success-color)] text-white",
      Closed: "bg-[var(--light-border)] dark:bg-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)]",
      closed: "bg-[var(--light-border)] dark:bg-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)]",
      Pending: "bg-[var(--info-color)] text-white",
      pending: "bg-[var(--info-color)] text-white",
    }
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${statusColors[status] || "bg-[var(--light-border)] dark:bg-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)]"}`}>
        {status}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--light-bg)] dark:bg-[var(--dark-bg)]">
        <div className="w-12 h-12 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-[var(--light-text)] dark:text-[var(--dark-text)]">Loading ticket details...</p>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--light-bg)] dark:bg-[var(--dark-bg)]">
        <h2 className="text-2xl font-semibold mb-4 text-[var(--light-text)] dark:text-[var(--dark-text)]">Ticket Not Found</h2>
        <button 
          className="flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:opacity-90"
          onClick={() => navigate("/app/support")}
        >
          <MdArrowBack />
          Back to Tickets
        </button>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Page Header */}
      <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] border-b border-[var(--light-border)] dark:border-[var(--dark-border)] mb-4">
        <div className="px-3 md:px-4 py-3">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
            <div className="flex items-center gap-3 flex-grow">
              <div 
                className="flex items-center justify-center rounded w-12 h-12 bg-[var(--primary-color)]"
              >
                <MdSupport size={24} className="text-white" />
              </div>

              <div className="flex-grow">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-1">
                  <h1 className="text-2xl font-semibold mb-0 text-[var(--light-text)] dark:text-[var(--dark-text)]">
                    {ticket.ticketNumber}
                  </h1>
                  <div className="flex gap-2">
                    {getStatusBadge(ticket.status)}
                  </div>
                </div>
                <p className="mb-0 text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-70">{ticket.subject}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-0 md:px-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4">
          {/* Left Column - Ticket Details & Comments */}
          <div className="lg:col-span-8">
            {/* Ticket Information */}
            <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md mb-4 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <div className="border-b border-[var(--light-border)] dark:border-[var(--dark-border)] p-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="flex items-center justify-center rounded w-10 h-10 bg-[var(--primary-color)]"
                  >
                    <MdInfo size={20} className="text-white" />
                  </div>
                  <div>
                    <h5 className="mb-1 text-lg font-semibold text-[var(--primary-color)]">
                      Ticket Details
                    </h5>
                    <p className="mb-0 text-sm text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-70">Issue description and information</p>
                  </div>
                </div>
              </div>

              <div className="p-3 md:p-4">
                <div className="mb-4">
                  <h6 className="mb-3 font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">Description</h6>
                  <p className="mb-0 text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-80 leading-relaxed">
                    {ticket.description}
                  </p>
                </div>

                {ticket?.attachments?.length > 0 && (
                  <div className="mt-4">
                    <h6 className="mb-3 flex items-center gap-2 font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">
                      <MdAttachFile /> Attachments
                    </h6>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {ticket.attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded border bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] border-[var(--light-border)] dark:border-[var(--dark-border)]">
                          <div className="flex items-center gap-3">
                            <MdAttachFile className="text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-60" size={20} />
                            <div>
                              <div className="font-medium text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">
                                {file.fileName}
                              </div>
                              <div className="text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-60 text-sm">{file.fileSize}</div>
                            </div>
                          </div>
                          <button className="p-1 text-[var(--primary-color)] hover:opacity-80 transition-opacity">
                            <MdDownload size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Comments Section */}
            <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md mb-4 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <div className="border-b border-[var(--light-border)] dark:border-[var(--dark-border)] p-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="flex items-center justify-center rounded w-10 h-10 bg-[var(--primary-color)]"
                  >
                    <MdAssignment size={20} className="text-white" />
                  </div>
                  <div>
                    <h5 className="mb-1 text-lg font-semibold text-[var(--primary-color)]">
                      Comments & Activity
                    </h5>
                    <p className="mb-0 text-sm text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-70">{ticket?.comments?.length} comment(s)</p>
                  </div>
                </div>
              </div>

              <div className="p-3 md:p-4">
                <div className="mb-4">
                  {ticket?.comments?.map((comment, index) => (
                    <div
                      key={comment.id || comment._id || index}
                      className={`mb-4 ${index === ticket.comments.length - 1 ? 'mb-0' : ''} flex ${comment.author?._id === user._id ? 'justify-end' : 'justify-start'
                        }`}
                    >
                      <div
                        className="flex gap-3"
                        style={{
                          flexDirection: comment.author?._id === user._id ? 'row-reverse' : 'row',
                          maxWidth: '80%',
                        }}
                      >
                        {/* Avatar or Icon */}
                        <div
                          className="flex items-center justify-center rounded-full flex-shrink-0 overflow-hidden w-10 h-10"
                          style={{
                            backgroundColor: comment.role === 'support' ? 'var(--primary-color)' : 'var(--light-border)',
                            color: comment.role === 'support' ? 'white' : 'var(--light-text)',
                          }}
                        >
                          {comment.author?.avatar?.url ? (
                            <img
                              src={comment.author.avatar.url}
                              alt={comment.author.name || 'User'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <MdPerson size={20} />
                          )}
                        </div>

                        <div className="flex-grow">
                          <div
                            className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2"
                            style={{
                              textAlign: comment.author?._id === user._id ? 'right' : 'left',
                            }}
                          >
                            <div
                              className="flex items-center gap-2 flex-wrap"
                              style={{
                                flexDirection: comment.author?._id === user._id ? 'row-reverse' : 'row',
                              }}
                            >
                              <span className="font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">
                                {comment.author?._id === user._id ? 'You' : comment.author?.name || 'Unknown User'}
                              </span>
                              {comment.role === 'support' && (
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-[var(--info-color)] text-white">
                                  Support
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-60 text-sm">
                              <MdAccessTime size={16} />
                              {formatLocalDateTime(comment.timestamp)}
                            </div>
                          </div>

                          <div
                            className="p-3 rounded bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] leading-relaxed"
                            style={{
                              borderLeft:
                                comment.author?._id === user._id
                                  ? 'none'
                                  : `3px solid ${comment.role === 'support' ? 'var(--primary-color)' : 'var(--light-border)'
                                  }`,
                              borderRight:
                                comment.author?._id === user._id
                                  ? `3px solid ${comment.role === 'support' ? 'var(--primary-color)' : 'var(--light-border)'
                                  }`
                                  : 'none',
                              textAlign: comment.author?._id === user._id ? 'right' : 'left',
                            }}
                          >
                            {comment.message}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Comment Form */}
                <div className="border-t border-[var(--light-border)] dark:border-[var(--dark-border)] pt-4">
                  <form onSubmit={handleAddComment}>
                    <div className="mb-3">
                      <label className="block font-medium mb-2 text-[var(--light-text)] dark:text-[var(--dark-text)]">
                        Add a Comment
                      </label>
                      <textarea
                        rows={4}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Type your response here..."
                        className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] resize-y"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!newComment.trim() || isSubmittingComment}
                      >
                        {isSubmittingComment ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Sending...
                          </>
                        ) : (
                          <>
                            <MdSend size={18} />
                            Add Comment
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Metadata & Actions */}
          <div className="lg:col-span-4">
            {/* Ticket Status Management */}
            <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md mb-4 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <div className="border-b border-[var(--light-border)] dark:border-[var(--dark-border)] p-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="flex items-center justify-center rounded w-10 h-10 bg-[var(--primary-color)]"
                  >
                    <MdUpdate size={20} className="text-white" />
                  </div>
                  <div>
                    <h5 className="mb-1 text-lg font-semibold text-[var(--primary-color)]">
                      Update Status
                    </h5>
                    <p className="mb-0 text-sm text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-70">Change ticket status</p>
                  </div>
                </div>
              </div>
              <div className="p-3">
                <div className="flex flex-col gap-2">
                  {/* In Progress Button */}
                  {ticket.status !== "resolved" && ticket.status !== "closed" && (
                    <button
                      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
                        ticket.status === "in-progress" 
                          ? "bg-[var(--warning-color)] text-white" 
                          : "border border-[var(--warning-color)] text-[var(--warning-color)] hover:bg-[var(--warning-color)] hover:text-white"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                      onClick={() => handleStatusChange("In Progress")}
                      disabled={isUpdatingStatus || ticket.status === "in-progress" || isTicketCreator}
                    >
                      <MdSchedule size={18} />
                      In Progress
                    </button>
                  )}

                  {/* Resolved Button */}
                  {ticket.status !== "closed" && (
                    <button
                      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
                        ticket.status === "resolved" 
                          ? "bg-[var(--success-color)] text-white" 
                          : "border border-[var(--success-color)] text-[var(--success-color)] hover:bg-[var(--success-color)] hover:text-white"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                      onClick={() => handleStatusChange("Resolved")}
                      disabled={isUpdatingStatus || ticket.status === "resolved" || isTicketCreator}
                    >
                      <MdCheckCircle size={18} />
                      Mark as Resolved
                    </button>
                  )}

                  {/* Closed Button */}
                  <button
                    className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
                      ticket.status === "closed" 
                        ? "bg-[var(--light-border)] dark:bg-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)]" 
                        : "border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-border)] dark:hover:bg-[var(--dark-border)]"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    onClick={() => handleStatusChange("Closed")}
                    disabled={isUpdatingStatus || ticket.status === "closed" || isTicketCreator}
                  >
                    <MdClose size={18} />
                    Close Ticket
                  </button>
                </div>
              </div>
            </div>

            {/* Ticket Metadata */}
            <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md mb-4 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <div className="border-b border-[var(--light-border)] dark:border-[var(--dark-border)] p-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="flex items-center justify-center rounded w-10 h-10 bg-[var(--primary-color)]"
                  >
                    <MdInfo size={20} className="text-white" />
                  </div>
                  <div>
                    <h5 className="mb-0 text-lg font-semibold text-[var(--primary-color)]">
                      Ticket Information
                    </h5>
                  </div>
                </div>
              </div>

              <div className="p-3">
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <div className="flex items-center justify-between py-2 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                      <div className="flex items-center gap-2 text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-70">
                        <MdCategory size={16} />
                        <span className="text-sm">Category</span>
                      </div>
                      <span className="text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">
                        {ticket.category}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between py-2 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between py-2 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                      <div className="flex items-center gap-2 text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-70">
                        <MdSchedule size={16} />
                        <span className="text-sm">Created</span>
                      </div>
                      <span className="text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">
                        {formatLocalDateTime(ticket.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between py-2 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                      <div className="flex items-center gap-2 text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-70">
                        <MdUpdate size={16} />
                        <span className="text-sm">Last Updated</span>
                      </div>
                      <span className="text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">
                        {formatLocalDateTime(ticket.updatedAt)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2 text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-70">
                        <MdAccessTime size={16} />
                        <span className="text-sm">Response Time</span>
                      </div>
                      <span className="text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">
                        {ticket.responseTime}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <div className="border-b border-[var(--light-border)] dark:border-[var(--dark-border)] p-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="flex items-center justify-center rounded w-10 h-10 bg-[var(--primary-color)]"
                  >
                    <MdPerson size={20} className="text-white" />
                  </div>
                  <div>
                    <h5 className="mb-0 text-lg font-semibold text-[var(--primary-color)]">
                      Contact Details
                    </h5>
                  </div>
                </div>
              </div>

              <div className="p-3">
                <div className="mb-4">
                  <h6 className="mb-3 font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">
                    Submitted By
                  </h6>
                  <div className="grid grid-cols-1 gap-2">
                    <div>
                      <div className="flex items-center justify-between py-2 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                        <div className="flex items-center gap-2 text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-70">
                          <MdPerson size={16} />
                          <span className="text-sm">Name</span>
                        </div>
                        <span className="text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">
                          {ticket?.submittedBy?.name}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-2 text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-70">
                          <MdEmail size={16} />
                          <span className="text-sm">Email</span>
                        </div>
                        <a
                          href={`mailto:${ticket?.submittedBy?.email}`}
                          className="text-sm no-underline text-[var(--primary-color)] hover:opacity-80"
                        >
                          {ticket?.submittedBy?.email}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  {/* Assigned To section - commented out in original */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TicketDetail