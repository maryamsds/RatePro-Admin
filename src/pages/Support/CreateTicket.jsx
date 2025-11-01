// src\pages\Support\CreateTicket.jsx

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Container, Row, Col, Form, Button, Spinner } from "react-bootstrap"
import {
  MdSupport,
  MdArrowBack,
  MdSave,
  MdPriorityHigh,
  MdCategory,
  MdDescription,
  MdAttachFile,
  MdInfo,
  MdCheckCircle,
  MdError,
} from "react-icons/md"
import Swal from "sweetalert2"

const CreateTicket = () => {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formChanged, setFormChanged] = useState(false)
  const [validationState, setValidationState] = useState({})

  const [ticket, setTicket] = useState({
    subject: "",
    description: "",
    priority: "",
    category: "",
    email: "",
    attachments: [],
  })

  const [errors, setErrors] = useState({})

  const priorityOptions = [
    { value: "low", label: "Low", color: "success" },
    { value: "medium", label: "Medium", color: "warning" },
    { value: "high", label: "High", color: "danger" },
    { value: "critical", label: "Critical", color: "dark" },
  ]

  const categoryOptions = [
    { value: "technical", label: "Technical Issue" },
    { value: "bug", label: "Bug Report" },
    { value: "feature", label: "Feature Request" },
    { value: "access", label: "Access Request" },
    { value: "training", label: "Training" },
    { value: "other", label: "Other" },
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setTicket((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: "" }))
    setFormChanged(true)

    // Real-time validation feedback
    if (name === "email" && value) {
      const emailResult = validateEmail(value)
      setValidationState((prev) => ({
        ...prev,
        [name]: emailResult.valid ? "valid" : "invalid",
      }))
    } else if (value.trim()) {
      setValidationState((prev) => ({ ...prev, [name]: "valid" }))
    } else {
      setValidationState((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    setTicket((prev) => ({ ...prev, attachments: files }))
    setFormChanged(true)
  }

  const validateForm = () => {
    const newErrors = {}

    const subjectResult = validateRequired(ticket.subject)
    if (!subjectResult.valid) newErrors.subject = subjectResult.error

    const descriptionResult = validateRequired(ticket.description)
    if (!descriptionResult.valid) newErrors.description = descriptionResult.error

    const priorityResult = validateRequired(ticket.priority)
    if (!priorityResult.valid) newErrors.priority = priorityResult.error

    const categoryResult = validateRequired(ticket.category)
    if (!categoryResult.valid) newErrors.category = categoryResult.error

    const emailResult = validateEmail(ticket.email)
    if (!emailResult.valid) newErrors.email = emailResult.error

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Please fill all required fields correctly.",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      Swal.fire({
        icon: "success",
        title: "Ticket Created",
        text: "Your support ticket has been submitted successfully!",
        timer: 2000,
        showConfirmButton: false,
      })

      navigate("/app/support/tickets")
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: error.message || "Failed to create ticket. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="create-ticket-container">
      {/* Header Section */}
      {/* <div className="page-header-section">
        <div className="page-header-content">
          <div className="page-header-left">
            <Button
              variant="outline-secondary"
              className="back-btn"
              onClick={() => navigate("/app/support/tickets")}
            >
              <MdArrowBack className="me-2" /> Back
            </Button>

            <div className="page-title-section">
              <div className="page-icon">
                <MdSupport />
              </div>
              <div>
                <h1 className="page-title">Create Support Ticket</h1>
                <p className="page-subtitle">Submit a new support request</p>
              </div>
            </div>
          </div>

          {formChanged && (
            <div className="form-status-indicator">
              <MdInfo className="me-1" />
              <span>Unsaved changes</span>
            </div>
          )}
        </div>
      </div> */}

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
                    Create Support Ticket
                  </h1>
                </div>
                <p className="page-subtitle">Submit a new support request</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="form-content px-0">
        <div className="form-wrapper">
          <Form onSubmit={handleSubmit} className="ticket-form">
            {/* Basic Information Section */}
            <div className="form-section animate-slide-up" style={{ "--delay": "0.1s" }}>
              <div className="section-header">
                <div className="section-icon">
                  <MdInfo />
                </div>
                <div>
                  <h3 className="section-title" style={{ color: "#1fdae4" }}>
                    Ticket Information
                  </h3>
                  <p className="section-subtitle">Provide details about your issue</p>
                </div>
              </div>

              <div className="section-content">
                <Row className="g-3">
                  <Col md={12}>
                    <div className="form-group">
                      <label className="form-label required">Subject</label>
                      <div
                        className={`input-wrapper ${
                          validationState.subject ? "has-validation" : ""
                        }`}
                      >
                        <MdDescription className="input-icon" />
                        <Form.Control
                          type="text"
                          name="subject"
                          value={ticket.subject}
                          onChange={handleChange}
                          placeholder="Brief description of the issue"
                          className={`form-input ${
                            validationState.subject === "valid"
                              ? "is-valid"
                              : validationState.subject === "invalid"
                              ? "is-invalid"
                              : ""
                          }`}
                        />
                        {validationState.subject === "valid" && (
                          <MdCheckCircle className="validation-icon valid" />
                        )}
                        {validationState.subject === "invalid" && (
                          <MdError className="validation-icon invalid" />
                        )}
                      </div>
                      {errors.subject && <div className="field-error">{errors.subject}</div>}
                    </div>
                  </Col>

                  <Col md={12}>
                    <div className="form-group">
                      <label className="form-label required">Description</label>
                      <div
                        className={`input-wrapper ${
                          validationState.description ? "has-validation" : ""
                        }`}
                      >
                        <Form.Control
                          as="textarea"
                          name="description"
                          rows={6}
                          value={ticket.description}
                          onChange={handleChange}
                          placeholder="Provide detailed information about your issue..."
                          className={`form-input ${
                            validationState.description === "valid"
                              ? "is-valid"
                              : validationState.description === "invalid"
                              ? "is-invalid"
                              : ""
                          }`}
                        />
                      </div>
                      {errors.description && (
                        <div className="field-error">{errors.description}</div>
                      )}
                      <div className="field-help">
                        Include steps to reproduce, error messages, or any relevant details
                      </div>
                    </div>
                  </Col>

                  <Col md={6}>
                    <div className="form-group">
                      <label className="form-label required">Contact Email</label>
                      <div
                        className={`input-wrapper ${
                          validationState.email ? "has-validation" : ""
                        }`}
                      >
                        <Form.Control
                          type="email"
                          name="email"
                          value={ticket.email}
                          onChange={handleChange}
                          placeholder="your.email@example.com"
                          className={`form-input ${
                            validationState.email === "valid"
                              ? "is-valid"
                              : validationState.email === "invalid"
                              ? "is-invalid"
                              : ""
                          }`}
                        />
                        {validationState.email === "valid" && (
                          <MdCheckCircle className="validation-icon valid" />
                        )}
                        {validationState.email === "invalid" && (
                          <MdError className="validation-icon invalid" />
                        )}
                      </div>
                      {errors.email && <div className="field-error">{errors.email}</div>}
                      <div className="field-help">We'll send updates to this email</div>
                    </div>
                  </Col>
                </Row>
              </div>
            </div>

            {/* Classification Section */}
            <div className="form-section animate-slide-up" style={{ "--delay": "0.2s" }}>
              <div className="section-header">
                <div className="section-icon">
                  <MdCategory />
                </div>
                <div>
                  <h3 className="section-title" style={{ color: "#1fdae4" }}>
                    Classification
                  </h3>
                  <p className="section-subtitle">Help us route your ticket efficiently</p>
                </div>
              </div>

              <div className="section-content">
                <Row className="g-3">

                  <Col md={12}>
                    <div className="form-group">
                      <label className="form-label required">Category</label>
                      <div className="input-wrapper">
                        <MdCategory className="input-icon" />
                        <Form.Select
                          name="category"
                          value={ticket.category}
                          onChange={handleChange}
                          className="form-input form-select"
                        >
                          <option value="">Select Category</option>
                          {categoryOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </Form.Select>
                      </div>
                      {errors.category && <div className="field-error">{errors.category}</div>}
                      <div className="field-help">Choose the category that best fits your issue</div>
                    </div>
                  </Col>
                </Row>
              </div>
            </div>

            {/* Attachments Section */}
            <div className="form-section animate-slide-up" style={{ "--delay": "0.3s" }}>
              <div className="section-header">
                <div className="section-icon">
                  <MdAttachFile />
                </div>
                <div>
                  <h3 className="section-title" style={{ color: "#1fdae4" }}>
                    Attachments
                  </h3>
                  <p className="section-subtitle">Add screenshots or relevant files (optional)</p>
                </div>
              </div>

              <div className="section-content">
                <div className="form-group">
                  <label className="form-label">Upload Files</label>
                  <div className="file-upload-wrapper">
                    <Form.Control
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="form-input file-input"
                      accept="image/*,.pdf,.doc,.docx,.txt"
                    />
                  </div>
                  {ticket.attachments.length > 0 && (
                    <div className="attached-files">
                      <p className="mb-2">Attached files:</p>
                      <ul className="file-list">
                        {ticket.attachments.map((file, index) => (
                          <li key={index}>
                            <MdAttachFile className="me-1" />
                            {file.name} ({(file.size / 1024).toFixed(2)} KB)
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="field-help">
                    Supported formats: Images, PDF, DOC, TXT (Max 5MB per file)
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="form-actions animate-slide-up" style={{ "--delay": "0.4s" }}>
              <div className="actions-wrapper">
                <div className="actions-left">
                  {formChanged && (
                    <div className="unsaved-indicator">
                      <MdInfo className="me-1" />
                      <span>You have unsaved changes</span>
                    </div>
                  )}
                </div>

                <div className="actions-right">
                  <Button
                    type="button"
                    variant="outline-secondary"
                    onClick={() => navigate("/app/support/tickets")}
                    disabled={isSubmitting}
                    className="cancel-btn"
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                    className={`submit-btn ${isSubmitting ? "submitting" : ""}`}
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner size="sm" className="me-2" animation="border" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <MdSave className="me-2" />
                        Create Ticket
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </Form>
        </div>
      </div>
    </div>
  )
}

export default CreateTicket

