// src/pages/Support/CreateTicket.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Form, Button, Spinner } from "react-bootstrap";
import {
  MdSupport,
  MdSave,
  MdCategory,
  MdDescription,
  MdAttachFile,
  MdInfo,
  MdCheckCircle,
  MdError,
} from "react-icons/md";
import Swal from "sweetalert2";
import { createTicket, getTicketCategories } from "../../api/ticketApi";
import { useAuth } from '../../context/AuthContext';

// ✅ Validation helpers (since imports were commented out)
const validateRequired = (value) => {
  if (!value || value.trim() === "") {
    return { valid: false, error: "This field is required" };
  }
  return { valid: true, error: "" };
};

const validateEmail = (email) => {
  if (!email || email.trim() === "") {
    return { valid: false, error: "Email is required" };
  }
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email)
    ? { valid: true, error: "" }
    : { valid: false, error: "Invalid email format" };
};

const CreateTicket = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formChanged, setFormChanged] = useState(false);
  const [validationState, setValidationState] = useState({});
   const { user, setGlobalLoading } = useAuth();

  const [ticket, setTicket] = useState({
    subject: "",
    description: "",
    priority: "",
    category: "",
    email: user?.email || "",
    attachments: [],
  });

  const [errors, setErrors] = useState({});

  // Get categories
  const categoryOptions = getTicketCategories();

  // ✅ handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setTicket((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setFormChanged(true);

    // Real-time validation
    if (name === "email" && value) {
      const result = validateEmail(value);
      setValidationState((prev) => ({
        ...prev,
        [name]: result.valid ? "valid" : "invalid",
      }));
    } else if (value.trim()) {
      setValidationState((prev) => ({ ...prev, [name]: "valid" }));
    } else {
      setValidationState((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setTicket((prev) => ({ ...prev, attachments: files }));
    setFormChanged(true);
  };

  // ✅ Form validation before submit
  const validateForm = () => {
    const newErrors = {};

    const subjectResult = validateRequired(ticket.subject);
    if (!subjectResult.valid) newErrors.subject = subjectResult.error;

    const descriptionResult = validateRequired(ticket.description);
    if (!descriptionResult.valid) newErrors.description = descriptionResult.error;

    const categoryResult = validateRequired(ticket.category);
    if (!categoryResult.valid) newErrors.category = categoryResult.error;

    const emailResult = validateEmail(ticket.email);
    if (!emailResult.valid) newErrors.email = emailResult.error;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Please fill all required fields correctly.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const ticketData = {
        subject: ticket.subject,
        description: ticket.description,
        category: ticket.category,
        email: ticket.email,
      };

      const response = await createTicket(ticketData, ticket.attachments);

      Swal.fire({
        icon: "success",
        title: "Ticket Created Successfully!",
        text: `Your support ticket #${response.data.data._id.slice(-6)} has been submitted.`,
        timer: 3000,
        showConfirmButton: true,
        confirmButtonText: "View Ticket",
        showCancelButton: true,
        cancelButtonText: "Create Another",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate(`/app/support/${response.data.data._id}`);
        } else {
          navigate("/app/support/create");
        }
      });
    } catch (error) {
      console.error("Create ticket error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to create ticket. Please try again.";

      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: errorMessage,
        confirmButtonText: "Try Again",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-ticket-container">
      {/* Header */}
      <div
        className="bg-light border-bottom mb-4"
        style={{
          backgroundColor: "var(--light-card)",
          borderColor: "var(--light-border)",
        }}
      >
        <div className="container-fluid px-3 px-md-4 py-3">
          <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-3">
            <div className="d-flex align-items-center gap-3 flex-grow-1">
              <div
                className="d-flex align-items-center justify-content-center rounded"
                style={{
                  width: "48px",
                  height: "48px",
                  backgroundColor: "#1fdae4",
                }}
              >
                <MdSupport size={24} />
              </div>

              <div className="flex-grow-1">
                <h1 className="h4 mb-0">Create Support Ticket</h1>
                <p className="page-subtitle">Submit a new support request</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="form-content px-0">
        <div className="form-wrapper">
          <Form onSubmit={handleSubmit} className="ticket-form">
            {/* --- Ticket Info --- */}
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
                  {/* Subject */}
                  <Col md={12}>
                    <Form.Group className="form-group">
                      <label className="form-label required">Subject</label>
                      <div className="input-wrapper">
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
                    </Form.Group>
                  </Col>

                  {/* Description */}
                  <Col md={12}>
                    <Form.Group className="form-group">
                      <label className="form-label required">Description</label>
                      <Form.Control
                        as="textarea"
                        name="description"
                        rows={6}
                        value={ticket.description}
                        onChange={handleChange}
                        placeholder="Provide detailed information..."
                        className={`form-input ${
                          validationState.description === "valid"
                            ? "is-valid"
                            : validationState.description === "invalid"
                            ? "is-invalid"
                            : ""
                        }`}
                      />
                      {errors.description && (
                        <div className="field-error">{errors.description}</div>
                      )}
                      <div className="field-help">
                        Include steps to reproduce, error messages, or any relevant details
                      </div>
                    </Form.Group>
                  </Col>

                  {/* Email */}
                  <Col md={6}>
                    <Form.Group className="form-group">
                      <label className="form-label required">Contact Email</label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={ticket.email}
                        onChange={handleChange}
                        disabled
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
                      {errors.email && <div className="field-error">{errors.email}</div>}
                      <div className="field-help">We'll send updates to this email</div>
                    </Form.Group>
                  </Col>
                </Row>
              </div>
            </div>

            {/* --- Classification --- */}
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
                    <Form.Group className="form-group">
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
                      <div className="field-help">
                        Choose the category that best fits your issue
                      </div>
                    </Form.Group>
                  </Col>
                </Row>
              </div>
            </div>

            {/* --- Attachments --- */}
            <div className="form-section animate-slide-up" style={{ "--delay": "0.3s" }}>
              <div className="section-header">
                <div className="section-icon">
                  <MdAttachFile />
                </div>
                <div>
                  <h3 className="section-title" style={{ color: "#1fdae4" }}>
                    Attachments
                  </h3>
                  <p className="section-subtitle">
                    Add screenshots or relevant files (optional)
                  </p>
                </div>
              </div>

              <div className="section-content">
                <Form.Group className="form-group">
                  <label className="form-label">Upload Files</label>
                  <Form.Control
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="form-input file-input"
                    accept="image/*,.pdf,.doc,.docx,.txt"
                  />
                  {ticket.attachments.length > 0 && (
                    <ul className="file-list mt-2">
                      {ticket.attachments.map((file, index) => (
                        <li key={index}>
                          <MdAttachFile className="me-1" />
                          {file.name} ({(file.size / 1024).toFixed(2)} KB)
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="field-help">
                    Supported: Images, PDF, DOC, TXT (Max 5MB per file)
                  </div>
                </Form.Group>
              </div>
            </div>

            {/* --- Actions --- */}
            <div className="form-actions animate-slide-up" style={{ "--delay": "0.4s" }}>
              <div className="actions-wrapper d-flex justify-content-between align-items-center">
                {formChanged && (
                  <div className="unsaved-indicator">
                    <MdInfo className="me-1" />
                    <span>You have unsaved changes</span>
                  </div>
                )}

                <div className="d-flex gap-2">
                  <Button
                    type="button"
                    variant="outline-secondary"
                    onClick={() => navigate("/app/support")}
                    disabled={isSubmitting}
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
  );
};

export default CreateTicket;
