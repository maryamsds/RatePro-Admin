// src/pages/Support/CreateTicket.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

  const categoryOptions = getTicketCategories();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTicket((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setFormChanged(true);

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
        text: "Your support ticket has been submitted.",
        timer: 2000,
        showConfirmButton: false,
      });

      setTimeout(() => {
        navigate("/app/support");
      }, 2000);
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
    <div className="w-full">
      {/* Header */}
      <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] border-b border-[var(--light-border)] dark:border-[var(--dark-border)] mb-6">
        <div className="w-full px-4 md:px-6 py-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
            <div className="flex items-center gap-3 flex-grow">
              <div className="flex items-center justify-center rounded-lg w-12 h-12 bg-[var(--primary-color)]">
                <MdSupport size={24} className="text-white" />
              </div>
              <div className="flex-grow">
                <h1 className="text-xl font-bold mb-0 text-[var(--light-text)] dark:text-[var(--dark-text)]">Create Support Ticket</h1>
                <p className="text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-70 text-sm mb-0">Submit a new support request</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* --- Ticket Info --- */}
            <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)] opacity-0 animate-[slideUp_0.5s_ease-out_0.1s_forwards]">
              <div className="flex items-start gap-3 mb-6">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--primary-color)] bg-opacity-10 text-[var(--primary-color)]">
                  <MdInfo size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1 text-[var(--primary-color)]">
                    Ticket Information
                  </h3>
                  <p className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-70">Provide details about your issue</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-[var(--light-text)] dark:text-[var(--dark-text)]">
                    Subject <span className="text-[var(--danger-color)]">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-50">
                      <MdDescription size={18} />
                    </div>
                    <input
                      type="text"
                      name="subject"
                      value={ticket.subject}
                      onChange={handleChange}
                      placeholder="Brief description of the issue"
                      className={`w-full pl-10 pr-10 py-2 rounded-md border bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 transition-all ${
                        validationState.subject === "valid"
                          ? "border-[var(--success-color)] focus:ring-[var(--success-color)]"
                          : validationState.subject === "invalid"
                            ? "border-[var(--danger-color)] focus:ring-[var(--danger-color)]"
                            : "border-[var(--light-border)] dark:border-[var(--dark-border)] focus:ring-[var(--primary-color)]"
                      }`}
                    />
                    {validationState.subject === "valid" && (
                      <MdCheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--success-color)]" size={18} />
                    )}
                    {validationState.subject === "invalid" && (
                      <MdError className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--danger-color)]" size={18} />
                    )}
                  </div>
                  {errors.subject && (
                    <div className="text-[var(--danger-color)] text-sm mt-1">{errors.subject}</div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-[var(--light-text)] dark:text-[var(--dark-text)]">
                    Description <span className="text-[var(--danger-color)]">*</span>
                  </label>
                  <textarea
                    name="description"
                    rows={6}
                    value={ticket.description}
                    onChange={handleChange}
                    placeholder="Provide detailed information..."
                    className={`w-full px-3 py-2 rounded-md border bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 transition-all resize-y ${
                      validationState.description === "valid"
                        ? "border-[var(--success-color)] focus:ring-[var(--success-color)]"
                        : validationState.description === "invalid"
                          ? "border-[var(--danger-color)] focus:ring-[var(--danger-color)]"
                          : "border-[var(--light-border)] dark:border-[var(--dark-border)] focus:ring-[var(--primary-color)]"
                    }`}
                  />
                  {errors.description && (
                    <div className="text-[var(--danger-color)] text-sm mt-1">{errors.description}</div>
                  )}
                  <div className="text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-60 text-xs mt-1">
                    Include steps to reproduce, error messages, or any relevant details
                  </div>
                </div>

                {/* Email */}
                <div className="md:w-1/2">
                  <label className="block text-sm font-medium mb-2 text-[var(--light-text)] dark:text-[var(--dark-text)]">
                    Contact Email <span className="text-[var(--danger-color)]">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={ticket.email}
                    onChange={handleChange}
                    disabled
                    placeholder="your.email@example.com"
                    className={`w-full px-3 py-2 rounded-md border bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      validationState.email === "valid"
                        ? "border-[var(--success-color)] focus:ring-[var(--success-color)]"
                        : validationState.email === "invalid"
                          ? "border-[var(--danger-color)] focus:ring-[var(--danger-color)]"
                          : "border-[var(--light-border)] dark:border-[var(--dark-border)] focus:ring-[var(--primary-color)]"
                    }`}
                  />
                  {errors.email && (
                    <div className="text-[var(--danger-color)] text-sm mt-1">{errors.email}</div>
                  )}
                  <div className="text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-60 text-xs mt-1">
                    We'll send updates to this email
                  </div>
                </div>
              </div>
            </div>

            {/* --- Classification --- */}
            <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)] opacity-0 animate-[slideUp_0.5s_ease-out_0.2s_forwards]">
              <div className="flex items-start gap-3 mb-6">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--primary-color)] bg-opacity-10 text-[var(--primary-color)]">
                  <MdCategory size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1 text-[var(--primary-color)]">
                    Classification
                  </h3>
                  <p className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-70">Help us route your ticket efficiently</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--light-text)] dark:text-[var(--dark-text)]">
                  Category <span className="text-[var(--danger-color)]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-50 pointer-events-none">
                    <MdCategory size={18} />
                  </div>
                  <select
                    name="category"
                    value={ticket.category}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition-all"
                  >
                    <option value="">Select Category</option>
                    {categoryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.category && (
                  <div className="text-[var(--danger-color)] text-sm mt-1">{errors.category}</div>
                )}
                <div className="text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-60 text-xs mt-1">
                  Choose the category that best fits your issue
                </div>
              </div>
            </div>

            {/* --- Attachments --- */}
            <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)] opacity-0 animate-[slideUp_0.5s_ease-out_0.3s_forwards]">
              <div className="flex items-start gap-3 mb-6">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--primary-color)] bg-opacity-10 text-[var(--primary-color)]">
                  <MdAttachFile size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1 text-[var(--primary-color)]">
                    Attachments
                  </h3>
                  <p className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-70">
                    Add screenshots or relevant files (optional)
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--light-text)] dark:text-[var(--dark-text)]">
                  Upload Files
                </label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition-all file:mr-4 file:py-1 file:px-3 file:rounded-md file:border file:border-[var(--light-border)] dark:file:border-[var(--dark-border)] file:text-sm file:bg-[var(--light-bg)] dark:file:bg-[var(--dark-bg)] file:text-[var(--light-text)] dark:file:text-[var(--dark-text)] file:cursor-pointer"
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />
                {ticket.attachments.length > 0 && (
                  <ul className="mt-3 space-y-1 text-sm text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-70">
                    {ticket.attachments.map((file, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <MdAttachFile size={16} />
                        <span>{file.name} ({(file.size / 1024).toFixed(2)} KB)</span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-60 text-xs mt-2">
                  Supported: Images, PDF, DOC, TXT (Max 5MB per file)
                </div>
              </div>
            </div>

            {/* --- Actions --- */}
            <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)] opacity-0 animate-[slideUp_0.5s_ease-out_0.4s_forwards]">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                {formChanged && (
                  <div className="flex items-center gap-2 text-[var(--warning-color)] text-sm font-medium">
                    <MdInfo size={18} />
                    <span>You have unsaved changes</span>
                  </div>
                )}

                <div className="flex gap-3 ml-auto w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => navigate("/app/support")}
                    disabled={isSubmitting}
                    className="flex-1 sm:flex-none px-6 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-transparent text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 sm:flex-none px-6 py-2 rounded-md bg-[var(--primary-color)] text-white hover:opacity-90 transition-all font-medium inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <MdSave size={18} />
                        Create Ticket
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTicket;
