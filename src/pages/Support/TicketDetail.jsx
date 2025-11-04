// src\pages\Support\TicketDetail.jsx

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Row, Col, Form, Button, Badge, Spinner } from "react-bootstrap"
import {
  MdArrowBack,
  MdSupport,
  MdPerson,
  MdEmail,
  MdSchedule,
  MdPriorityHigh,
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

const TicketDetail = () => {
  const navigate = useNavigate()
  const { user, setGlobalLoading } = useAuth();
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [ticket, setTicket] = useState(null)
  const [newComment, setNewComment] = useState("")
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  const fetchTicketDetails = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await getTicketById(id);
      const ticketData = response.data.data;

      console.log("Fetched ticket data:", ticketData);

      // ✅ Real formatting logic
      const formattedTicket = {
        id: ticketData._id,
        ticketNumber: `TKT-${ticketData._id.slice(-6).toUpperCase()}`,
        subject: ticketData.subject,
        description: ticketData.description,
        status: ticketData.status,
        // priority: ticketData.priority,
        category: ticketData.category,
        submittedBy: {
          name: ticketData.createdBy?.name || "Unknown",
          email: ticketData.createdBy?.email || ticketData.contactEmail,
          phone: ticketData.createdBy?.phone || "N/A",
        },
        assignedTo: {
          name: ticketData.assignedTo?.name || "Unassigned",
          email: ticketData.assignedTo?.email || "N/A",
        },
        createdAt: new Date(ticketData.createdAt).toLocaleString(),
        updatedAt: new Date(ticketData.updatedAt).toLocaleString(),
        responseTime: ticketData.daysSinceCreation ? `${ticketData.daysSinceCreation}d` : "New",
        attachments: ticketData.attachments?.map(att => ({
          name: att.fileName,
          size: att.fileSize ? `${(att.fileSize / 1024).toFixed(2)} KB` : "Unknown",
          url: att.fileUrl,
          type: att.fileType
        })) || [],
        comments: ticketData.internalNotes?.map(note => ({
          id: note._id,
          author: note.createdBy?.name || "System",
          role: "support",
          timestamp: new Date(note.createdAt).toLocaleString(),
          message: note.note,
        })) || [],
        canEdit: ticketData.canEdit || false,
        canDelete: ticketData.canDelete || false,
        isOwner: ticketData.isOwner || false,
        ...formatTicketForDisplay(ticketData) // ✅ use helper if you’ve defined it
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

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim() || !id) return

    setIsSubmittingComment(true)
    try {
      console.log("Sending comment payload:", {
        message: newComment,
      });
      const response = await axiosInstance.post(`/tickets/${id}/comments`, {
        message: newComment,
      });
      console.log("Response received");

      setTicket(response.data)
      setNewComment("")

      Swal.fire({
        icon: "success",
        title: "Comment Added",
        text: "Your comment has been added.",
        timer: 1500,
        showConfirmButton: false,
      })
    } catch (error) {
      console.error("Add comment error:", error)
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Could not add comment",
      })
    } finally {
      setIsSubmittingComment(false)
    }
  }


  const getStatusBadge = (status) => {
    const statusMap = {
      Open: "danger",
      "In Progress": "warning",
      Resolved: "success",
      Closed: "secondary",
      Pending: "info",
    }
    return <Badge bg={statusMap[status] || "secondary"}>{status}</Badge>
  }

  const getPriorityBadge = (priority) => {
    const priorityMap = {
      Low: "success",
      Medium: "warning",
      High: "danger",
      Critical: "dark",
    }
    return (
      <Badge bg={priorityMap[priority] || "secondary"} className="d-flex align-items-center gap-1">
        {priority === "High" || priority === "Critical" ? <MdPriorityHigh /> : null}
        {priority}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="loading-container">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading ticket details...</p>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="error-container">
        <h2>Ticket Not Found</h2>
        <Button variant="primary" onClick={() => navigate("/app/support")}>
          <MdArrowBack className="me-2" />
          Back to Tickets
        </Button>
      </div>
    )
  }

  return (
    <div className="container-fluid p-0">
      {/* Page Header */}
      <div className="bg-light border-bottom mb-4" style={{
        backgroundColor: 'var(--light-card)',
        borderColor: 'var(--light-border)'
      }}>
        <div className="container-fluid px-3 px-md-4 py-3">
          <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-3">
            <div className="d-flex align-items-center gap-3 flex-grow-1">
              <div className="d-flex align-items-center justify-content-center rounded"
                style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#1fdae4',
                  // color: 'white'
                }}>
                <MdSupport size={24} />
              </div>

              <div className="flex-grow-1">
                <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-2 mb-1">
                  <h1 className="h4 mb-0 me-2">
                    {ticket.ticketNumber}
                  </h1>
                  <div className="d-flex gap-2">
                    {getStatusBadge(ticket.status)}
                    {getPriorityBadge(ticket.priority)}
                  </div>
                </div>
                <p className="mb-0 text-muted">{ticket.subject}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-fluid px-md-0">
        <div className="row g-3 g-lg-4">
          {/* Left Column - Ticket Details & Comments */}
          <div className="col-12 col-lg-8">
            {/* Ticket Information */}
            <div className="card shadow-sm mb-4" style={{
              backgroundColor: 'var(--light-card)',
              borderColor: 'var(--light-border)',
              borderRadius: 'var(--border-radius)'
            }}>
              <div className="card-header border-bottom" style={{
                // backgroundColor: 'var(--light-bg)',
                borderColor: 'var(--light-border)'
              }}>
                <div className="d-flex align-items-center gap-3">
                  <div className="d-flex align-items-center justify-content-center rounded"
                    style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: '#1fdae4',
                      color: 'white'
                    }}>
                    <MdInfo size={20} />
                  </div>
                  <div>
                    <h5 className="mb-1" style={{ color: '#1fdae4' }}>
                      Ticket Details
                    </h5>
                    <p className="mb-0 small text-muted">Issue description and information</p>
                  </div>
                </div>
              </div>

              <div className="card-body p-3 p-md-4">
                <div className="mb-4">
                  <h6 className="mb-3">Description</h6>
                  <p className="text-muted mb-0" style={{ lineHeight: '1.6' }}>
                    {ticket.description}
                  </p>
                </div>

                {ticket?.attachments?.length > 0 && (
                  <div className="mt-4">
                    <h6 className="mb-3 d-flex align-items-center gap-2">
                      <MdAttachFile /> Attachments
                    </h6>
                    <div className="row g-2">
                      {ticket.attachments.map((file, index) => (
                        <div key={index} className="col-12 col-sm-6">
                          <div className="d-flex align-items-center justify-content-between p-3 rounded border"
                            style={{
                              backgroundColor: 'var(--light-bg)',
                              borderColor: 'var(--light-border)'
                            }}>
                            <div className="d-flex align-items-center gap-3">
                              <MdAttachFile className="text-muted" size={20} />
                              <div>
                                <div className="fw-medium small" style={{ color: 'var(--light-text)' }}>
                                  {file.fileName}
                                </div>
                                <div className="text-muted small">{file.fileSize}</div>
                              </div>
                            </div>
                            <Button variant="link" size="sm" className="p-1 text-primary">
                              <MdDownload size={18} />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Comments Section */}
            <div className="card shadow-sm mb-4" style={{
              backgroundColor: 'var(--light-card)',
              borderColor: 'var(--light-border)',
              borderRadius: 'var(--border-radius)'
            }}>
              <div className="card-header border-bottom" style={{
                // backgroundColor: 'var(--light-bg)',
                borderColor: 'var(--light-border)'
              }}>
                <div className="d-flex align-items-center gap-3">
                  <div className="d-flex align-items-center justify-content-center rounded"
                    style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: '#1fdae4',
                      color: 'white'
                    }}>
                    <MdAssignment size={20} />
                  </div>
                  <div>
                    <h5 className="mb-1" style={{ color: '#1fdae4' }}>
                      Comments & Activity
                    </h5>
                    <p className="mb-0 small text-muted">{ticket?.comments?.length} comment(s)</p>
                  </div>
                </div>
              </div>

              <div className="card-body p-3 p-md-4">
                <div className="mb-4">
                  {ticket?.comments?.map((comment, index) => (
                    <div key={comment.id} className={`mb-4 ${index === ticket.comments.length - 1 ? 'mb-0' : ''}`}>
                      <div className="d-flex gap-3">
                        <div className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                          style={{
                            width: '40px',
                            height: '40px',
                            backgroundColor: comment.role === 'support' ? '#1fdae4' : 'var(--light-border)',
                            color: comment.role === 'support' ? 'white' : 'var(--light-text)'
                          }}>
                          <MdPerson size={20} />
                        </div>

                        <div className="flex-grow-1">
                          <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between mb-2">
                            <div className="d-flex align-items-center gap-2 flex-wrap">
                              <span className="fw-medium">
                                {comment.author?._id === user._id
                                  ? "You"
                                  : comment.author?.name || "Unknown User"}
                              </span>
                              {comment.role === "support" && (
                                <Badge bg="primary" className="small">Support</Badge>
                              )}
                            </div>
                            <div className="d-flex align-items-center gap-1 text-muted small">
                              <MdAccessTime size={16} />
                              {comment.timestamp}
                            </div>
                          </div>

                          <div className="p-3 rounded"
                            style={{
                              backgroundColor: 'var(--light-bg)',
                              borderLeft: `3px solid ${comment.role === 'support' ? '#1fdae4' : 'var(--light-border)'}`,
                              color: 'var(--light-text)',
                              lineHeight: '1.5'
                            }}>
                            {comment.message}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Comment Form */}
                <div className="border-top pt-4" style={{ borderColor: 'var(--light-border)' }}>
                  <Form onSubmit={handleAddComment}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-medium mb-2">
                        Add a Comment
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Type your response here..."
                        className="border"
                        style={{
                          borderColor: 'var(--light-border)',
                          backgroundColor: 'var(--light-bg)',
                          color: 'var(--light-text)',
                          borderRadius: 'var(--border-radius)',
                          resize: 'vertical'
                        }}
                      />
                    </Form.Group>
                    <div className="d-flex justify-content-end">
                      <Button
                        type="submit"
                        disabled={!newComment.trim() || isSubmittingComment}
                        className="d-flex align-items-center"
                        style={{
                          backgroundColor: '#1fdae4',
                          borderColor: '#1fdae4',
                          color: 'white'
                        }}
                      >
                        {isSubmittingComment ? (
                          <>
                            <Spinner size="sm" className="me-2" animation="border" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <MdSend className="me-2" size={18} />
                            Add Comment
                          </>
                        )}
                      </Button>
                    </div>
                  </Form>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Metadata & Actions */}
          <div className="col-12 col-lg-4">
            {/* Ticket Status Management */}
            <div className="card shadow-sm mb-4" style={{
              backgroundColor: 'var(--light-card)',
              borderColor: 'var(--light-border)',
              borderRadius: 'var(--border-radius)'
            }}>
              <div className="card-header border-bottom" style={{
                // backgroundColor: 'var(--light-bg)',
                borderColor: 'var(--light-border)'
              }}>
                <div className="d-flex align-items-center gap-3">
                  <div className="d-flex align-items-center justify-content-center rounded"
                    style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: '#1fdae4',
                      color: 'white'
                    }}>
                    <MdUpdate size={20} />
                  </div>
                  <div>
                    <h5 className="mb-1" style={{ color: '#1fdae4' }}>
                      Update Status
                    </h5>
                    <p className="mb-0 small text-muted">Change ticket status</p>
                  </div>
                </div>
              </div>

              {/* <div className="card-body p-3">
                <div className="d-grid gap-2">
                  <Button
                    variant="outline-warning"
                    className="d-flex align-items-center justify-content-center button"
                    onClick={() => handleStatusChange("In Progress")}
                    disabled={isUpdatingStatus || ticket.status === "In Progress"}
                  >
                    <MdSchedule className="me-2" size={18} />
                    In Progress
                  </Button>
                  <Button
                    variant="outline-success"
                    className="d-flex align-items-center justify-content-center button resolved"
                    onClick={() => handleStatusChange("Resolved")}
                    disabled={isUpdatingStatus || ticket.status === "Resolved"}
                  >
                    <MdCheckCircle className="me-2" size={18} />
                    Mark as Resolved
                  </Button>
                  <Button
                    variant="outline-secondary"
                    className="d-flex align-items-center justify-content-center button closed"
                    onClick={() => handleStatusChange("Closed")}
                    disabled={isUpdatingStatus || ticket.status === "Closed"}
                  >
                    <MdClose className="me-2" size={18} />
                    Close Ticket
                  </Button>
                </div>
              </div> */}
              <div className="card-body p-3">
                <div className="d-grid gap-2">
                  {/* In Progress Button */}
                  {ticket.status !== "resolved" && ticket.status !== "closed" && (
                    <Button
                      variant={ticket.status === "in-progress" ? "warning" : "outline-warning"}
                      className={`d-flex align-items-center justify-content-center button ${ticket.status === "in-progress" ? "active" : ""
                        }`}
                      onClick={() => handleStatusChange("In Progress")}
                      disabled={isUpdatingStatus || ticket.status === "in-progress"}
                    >
                      <MdSchedule className="me-2" size={18} />
                      In Progress
                    </Button>
                  )}

                  {/* Resolved Button */}
                  {ticket.status !== "closed" && (
                    <Button
                      variant={ticket.status === "resolved" ? "success" : "outline-success"}
                      className={`d-flex align-items-center justify-content-center button resolved ${ticket.status === "resolved" ? "active" : ""
                        }`}
                      onClick={() => handleStatusChange("Resolved")}
                      disabled={isUpdatingStatus || ticket.status === "resolved"}
                    >
                      <MdCheckCircle className="me-2" size={18} />
                      Mark as Resolved
                    </Button>
                  )}

                  {/* Closed Button */}
                  <Button
                    variant={ticket.status === "closed" ? "secondary" : "outline-secondary"}
                    className={`d-flex align-items-center justify-content-center button closed ${ticket.status === "closed" ? "active" : ""
                      }`}
                    onClick={() => handleStatusChange("Closed")}
                    disabled={isUpdatingStatus || ticket.status === "closed"}
                  >
                    <MdClose className="me-2" size={18} />
                    Close Ticket
                  </Button>
                </div>
              </div>
            </div>

            {/* Ticket Metadata */}
            <div className="card shadow-sm mb-4" style={{
              backgroundColor: 'var(--light-card)',
              borderColor: 'var(--light-border)',
              borderRadius: 'var(--border-radius)'
            }}>
              <div className="card-header border-bottom" style={{
                // backgroundColor: 'var(--light-bg)',
                borderColor: 'var(--light-border)'
              }}>
                <div className="d-flex align-items-center gap-3">
                  <div className="d-flex align-items-center justify-content-center rounded"
                    style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: '#1fdae4',
                      color: 'white'
                    }}>
                    <MdInfo size={20} />
                  </div>
                  <div>
                    <h5 className="mb-0" style={{ color: '#1fdae4' }}>
                      Ticket Information
                    </h5>
                  </div>
                </div>
              </div>

              <div className="card-body p-3">
                <div className="row g-3">
                  <div className="col-12">
                    <div className="d-flex align-items-center justify-content-between py-2 border-bottom"
                      style={{ borderColor: 'var(--light-border)' }}>
                      <div className="d-flex align-items-center gap-2 text-muted">
                        <MdCategory size={16} />
                        <span className="small">Category</span>
                      </div>
                      <span className="small fw-medium">
                        {ticket.category}
                      </span>
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="d-flex align-items-center justify-content-between py-2 border-bottom"
                      style={{ borderColor: 'var(--light-border)' }}>
                      <div className="d-flex align-items-center gap-2 text-muted">
                        <MdPriorityHigh size={16} />
                        <span className="small">Priority</span>
                      </div>
                      <div>{getPriorityBadge(ticket.priority)}</div>
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="d-flex align-items-center justify-content-between py-2 border-bottom"
                      style={{ borderColor: 'var(--light-border)' }}>
                      <div className="d-flex align-items-center gap-2 text-muted">
                        <MdSchedule size={16} />
                        <span className="small">Created</span>
                      </div>
                      <span className="small fw-medium">
                        {ticket.createdAt}
                      </span>
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="d-flex align-items-center justify-content-between py-2 border-bottom"
                      style={{ borderColor: 'var(--light-border)' }}>
                      <div className="d-flex align-items-center gap-2 text-muted">
                        <MdUpdate size={16} />
                        <span className="small">Last Updated</span>
                      </div>
                      <span className="small fw-medium">
                        {ticket.updatedAt}
                      </span>
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="d-flex align-items-center justify-content-between py-2">
                      <div className="d-flex align-items-center gap-2 text-muted">
                        <MdAccessTime size={16} />
                        <span className="small">Response Time</span>
                      </div>
                      <span className="small fw-medium">
                        {ticket.responseTime}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="card shadow-sm" style={{
              backgroundColor: 'var(--light-card)',
              borderColor: 'var(--light-border)',
              borderRadius: 'var(--border-radius)'
            }}>
              <div className="card-header border-bottom" style={{
                // backgroundColor: 'var(--light-bg)', 
                borderColor: 'var(--light-border)'
              }}>
                <div className="d-flex align-items-center gap-3">
                  <div className="d-flex align-items-center justify-content-center rounded"
                    style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: '#1fdae4',
                      color: 'white'
                    }}>
                    <MdPerson size={20} />
                  </div>
                  <div>
                    <h5 className="mb-0" style={{ color: '#1fdae4' }}>
                      Contact Details
                    </h5>
                  </div>
                </div>
              </div>

              <div className="card-body p-3">
                <div className="mb-4">
                  <h6 className="mb-3 fw-medium">
                    Submitted By
                  </h6>
                  <div className="row g-2">
                    <div className="col-12">
                      <div className="d-flex align-items-center justify-content-between py-2 border-bottom"
                        style={{ borderColor: 'var(--light-border)' }}>
                        <div className="d-flex align-items-center gap-2 text-muted">
                          <MdPerson size={16} />
                          <span className="small">Name</span>
                        </div>
                        <span className="small fw-medium">
                          {ticket?.submittedBy?.name}
                        </span>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="d-flex align-items-center justify-content-between py-2">
                        <div className="d-flex align-items-center gap-2 text-muted">
                          <MdEmail size={16} />
                          <span className="small">Email</span>
                        </div>
                        <a
                          href={`mailto:${ticket?.submittedBy?.email}`}
                          className="small text-decoration-none"
                          style={{ color: '#1fdae4' }}
                        >
                          {ticket?.submittedBy?.email}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h6 className="mb-3 fw-medium">
                    Assigned To
                  </h6>
                  <div className="row g-2">
                    <div className="col-12">
                      <div className="d-flex align-items-center justify-content-between py-2 border-bottom"
                        style={{ borderColor: 'var(--light-border)' }}>
                        <div className="d-flex align-items-center gap-2 text-muted">
                          <MdPerson size={16} />
                          <span className="small">Team</span>
                        </div>
                        <span className="small fw-medium">
                          {ticket?.assignedTo?.name}
                        </span>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="d-flex align-items-center justify-content-between py-2">
                        <div className="d-flex align-items-center gap-2 text-muted">
                          <MdEmail size={16} />
                          <span className="small">Email</span>
                        </div>
                        <a
                          href={`mailto:${ticket?.assignedTo?.email}`}
                          className="small text-decoration-none"
                          style={{ color: '#1fdae4' }}
                        >
                          {ticket?.assignedTo?.email}
                        </a>
                      </div>
                    </div>
                  </div>
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