// src/pages/Settings/EmailTemplates.jsx
"use client";
import { useState, useEffect } from "react";
import {
  MdEdit,
  MdSave,
  MdDelete,
  MdAdd,
  MdToggleOn,
  MdToggleOff,
  MdContentCopy,
  MdPreview,
  MdCancel,
  MdSearch,
  MdClose,
} from "react-icons/md";
import { emailTemplateAPI } from "../../api/axiosInstance";

const EmailTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState({
    name: "",
    type: "",
    subject: "",
    body: "",
    variables: [],
    description: "",
    isActive: true,
  });
  const [availableTemplateTypes, setAvailableTemplateTypes] = useState([]); // DB se aayenge
  const [isCustomType, setIsCustomType] = useState(false);

  const fetchUniqueTypes = async () => {
    try {
      const response = await emailTemplateAPI.getAll();
      if (response.data.success) {
        const uniqueTypes = [...new Set(response.data.data.map(t => t.type))];
        const typeOptions = uniqueTypes.map(type => ({
          value: type,
          label: type
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ')
        }));
        setAvailableTemplateTypes(typeOptions.sort((a, b) => a.label.localeCompare(b.label)));
        setTemplates(response.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch types", err);
      // Fallback to hardcoded
      setAvailableTemplateTypes(templateTypes);
    }
  };

  useEffect(() => {
    fetchUniqueTypes();
  }, []);

  // Available template types from your backend enum
  const templateTypes = [
    { value: "user_welcome", label: "User Welcome Email" },
    { value: "survey_published", label: "Survey Published" },
    { value: "password_reset", label: "Password Reset" },
    { value: "survey_reminder", label: "Survey Reminder" },
    { value: "admin_notification", label: "Admin Notification" },
    { value: "low_rating_followup", label: "low rating followup" }
  ];

  // Common variables for templates
  const availableVariables = [
    { key: "userName", description: "User's full name" },
    { key: "customerName", description: "Customer's name" },
    { key: "companyName", description: "Your company name" },
    { key: "surveyLink", description: "Link to the survey" },
    { key: "userEmail", description: "User email address" },
    { key: "userPassword", description: "User password" },
    { key: "verificationLink", description: "User verification link" },
    { key: "otpExpireMinutes", description: "OTP expiration time in minutes" },
    { key: "rating", description: "Customer's rating" },
    { key: "resetLink", description: "Password reset link" },
    { key: "expiryDate", description: "Expiry date" },
  ];
  // Fetch templates from backend using axios
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await emailTemplateAPI.getAll();

      if (response.data.success) {
        setTemplates(response.data.data || []);
      } else {
        throw new Error(response.data.message || "Failed to fetch templates");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch templates"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  // Open modal for new template
  const handleNewTemplate = () => {
    resetForm();
    setShowTemplateModal(true);
  };

  // Reset form and close modal
  const resetForm = () => {
    setCurrentTemplate({
      name: "",
      type: "",
      subject: "",
      body: "",
      variables: [],
      description: "",
      isActive: true,
    });
    setEditingId(null);
    setError("");
    setSuccess("");
  };

  // Close modal
  const closeModal = () => {
    setShowTemplateModal(false);
    resetForm();
  };

  // Handle edit template
  const handleEdit = (template) => {
    const isCustom = !availableTemplateTypes.some(t => t.value === template.type);
    setIsCustomType(isCustom);

    setEditingId(template._id);
    setCurrentTemplate({
      ...template,
      type: template.type
    });
    setShowTemplateModal(true);
    setEditingId(template._id);
    setCurrentTemplate({
      name: template.name || "",
      type: template.type || "",
      subject: template.subject || "",
      body: template.body || "",
      variables: template.variables || [],
      description: template.description || "",
      isActive: template.isActive !== undefined ? template.isActive : true,
    });
    setShowTemplateModal(true);
    setError("");
    setSuccess("");
  };

  // Handle duplicate template
  const handleDuplicate = (template) => {
    setCurrentTemplate({
      name: `${template.name} (Copy)`,
      type: "", // Type must be unique, so we clear it
      subject: template.subject,
      body: template.body,
      variables: [...template.variables],
      description: template.description ? `${template.description} (Copy)` : "",
      isActive: false,
    });
    setEditingId(null);
    setShowTemplateModal(true);
    setError("");
    setSuccess("");
  };

  // Handle preview template
  const handlePreview = (template) => {
    setPreviewTemplate(template);
  };

  // Handle save template (create or update)
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      // Prepare data for API
      const apiData = {
        name: currentTemplate.name,
        type: currentTemplate.type,
        subject: currentTemplate.subject,
        body: currentTemplate.body,
        variables: currentTemplate.variables,
        description: currentTemplate.description,
        isActive: currentTemplate.isActive,
      };

      let response;

      if (editingId) {
        response = await emailTemplateAPI.update(editingId, apiData);
      } else {
        response = await emailTemplateAPI.create(apiData);
      }

      if (response.data.success) {
        const message = editingId
          ? "Template updated successfully"
          : "Template created successfully";
        setSuccess(message);
        closeModal();
        await fetchTemplates();
      } else {
        throw new Error(response.data.message || "Operation failed");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle delete template
  const handleDelete = async (id) => {
    if (
      !confirm(
        "Are you sure you want to delete this template? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      const response = await emailTemplateAPI.delete(id);

      if (response.data.success) {
        setSuccess("Template deleted successfully");
        await fetchTemplates();
      } else {
        throw new Error(response.data.message || "Delete failed");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  // Toggle template status
  const handleToggleStatus = async (id, currentStatus) => {
    try {
      setLoading(true);
      const response = await emailTemplateAPI.toggleStatus(id);

      if (response.data.success) {
        setSuccess(
          `Template ${!currentStatus ? "activated" : "deactivated"
          } successfully`
        );
        await fetchTemplates();
      } else {
        throw new Error(response.data.message || "Toggle failed");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Toggle failed");
    } finally {
      setLoading(false);
    }
  };

  // Add variable to template body at cursor position
  const handleAddVariableToBody = (variableKey) => {
    const textarea = document.querySelector('textarea[name="body"]');
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const variableText = `{${variableKey}}`;

      const newBody =
        currentTemplate.body.substring(0, start) +
        variableText +
        currentTemplate.body.substring(end);

      setCurrentTemplate({
        ...currentTemplate,
        body: newBody,
        variables: [...new Set([...currentTemplate.variables, variableKey])],
      });

      // Set cursor position after inserted variable
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + variableText.length,
          start + variableText.length
        );
      }, 0);
    }
  };

  // Add this object — tum define karo kon sa type konsa variable use kar sakta hai
  const variablesByType = {
    user_welcome: ["userName", "companyName", "userEmail", "userPassword", "verificationLink", "otpExpireMinutes"],
    password_reset: ["userName", "resetLink", "expiryDate"],
    survey_published: ["userName", "customerName", "surveyLink", "companyName"],
    survey_reminder: ["userName", "customerName", "surveyLink"],
    low_rating_followup: ["userName", "customerName", "rating", "surveyLink"],
    admin_notification: ["userName", "companyName"],
    // Add more as needed
  };

  // Function to get variables for current type
  const getRelevantVariables = () => {
    const type = currentTemplate.type;
    if (!type) return [];

    const keys = variablesByType[type];
    if (!keys) return availableVariables; // custom type = allow all
    return availableVariables.filter(v => keys.includes(v.key));
  };

  const relevantVars = getRelevantVariables();

  // Close preview
  const handleClosePreview = () => {
    setPreviewTemplate(null);
  };

  // Handle search
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  // Handle status filter
  const handleStatusFilter = (e) => {
    const value = e.target.value;
    setStatusFilter(value);
  };

  // Handle type filter
  const handleTypeFilter = (e) => {
    const value = e.target.value;
    setTypeFilter(value);
  };

  // Filter templates based on search and filters
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && template.isActive) ||
      (statusFilter === "inactive" && !template.isActive);

    const matchesType = typeFilter === "all" || template.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="email-templates">
      <div
        className="page-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <h1>Email Templates</h1>
        <button
          className="btn btn-primary"
          onClick={handleNewTemplate}
          disabled={loading}
          style={{
            padding: "10px 16px",
            border: "none",
            borderRadius: "4px",
            backgroundColor: "#007bff",
            color: "white",
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "14px",
            fontWeight: "500",
          }}
        >
          <MdAdd /> Create Template
        </button>
      </div>

      {/* Success/Error Messages */}
      {error && (
        <div
          className="alert alert-danger"
          style={{
            padding: "12px 16px",
            marginBottom: "1rem",
            border: "1px solid #e74c3c",
            borderRadius: "4px",
            backgroundColor: "#f8d7da",
            color: "#721c24",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {success && (
        <div
          className="alert alert-success"
          style={{
            padding: "12px 16px",
            marginBottom: "1rem",
            border: "1px solid #27ae60",
            borderRadius: "4px",
            backgroundColor: "#d4edda",
            color: "#155724",
          }}
        >
          <strong>Success:</strong> {success}
        </div>
      )}

      {/* Search and Filters */}
      <div
        className="card"
        style={{
          border: "1px solid #ddd",
          borderRadius: "8px",
          marginBottom: "2rem",
        }}
      >
        <div
          className="card-header"
          style={{
            padding: "1rem 1.5rem",
            // backgroundColor: "#f8f9fa",
            borderBottom: "1px solid #ddd",
          }}
        >
          <h4 style={{ margin: 0 }}>Search & Filters</h4>
        </div>
        <div className="card-body" style={{ padding: "1.5rem" }}>
          <div
            className="row"
            style={{
              display: "flex",
              flexWrap: "wrap",
              margin: "0 -10px",
              alignItems: "end",
            }}
          >
            <div
              className="col-md-4"
              style={{
                flex: "0 0 33.33%",
                padding: "0 10px",
                maxWidth: "33.33%",
              }}
            >
              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "bold",
                  }}
                >
                  Search Templates
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    className="form-control"
                    style={{
                      width: "100%",
                      padding: "8px 12px 8px 40px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      fontSize: "14px",
                    }}
                    placeholder="Search by name, subject, or type..."
                    value={searchTerm}
                    onChange={handleSearch}
                    disabled={loading}
                  />
                  <MdSearch
                    style={{
                      position: "absolute",
                      left: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#6c757d",
                    }}
                  />
                </div>
              </div>
            </div>

            <div
              className="col-md-4"
              style={{
                flex: "0 0 33.33%",
                padding: "0 10px",
                maxWidth: "33.33%",
              }}
            >
              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "bold",
                  }}
                >
                  Status
                </label>
                <select
                  className="form-control"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "14px",
                  }}
                  value={statusFilter}
                  onChange={handleStatusFilter}
                  disabled={loading}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div
              className="col-md-4"
              style={{
                flex: "0 0 33.33%",
                padding: "0 10px",
                maxWidth: "33.33%",
              }}
            >
              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "bold",
                  }}
                >
                  Type
                </label>
                <select
                  className="form-control"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "14px",
                  }}
                  value={typeFilter}
                  onChange={handleTypeFilter}
                  disabled={loading}
                >
                  <option value="all">All Types</option>
                  {templateTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "0.5rem",
            }}
          >
            <small
              className="text-muted"
              style={{ color: "#6c757d", fontSize: "0.875rem" }}
            >
              Showing {filteredTemplates.length} of {templates.length} templates
            </small>

            {(searchTerm || statusFilter !== "all" || typeFilter !== "all") && (
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setTypeFilter("all");
                }}
                style={{
                  padding: "4px 12px",
                  fontSize: "0.875rem",
                  border: "1px solid #6c757d",
                  borderRadius: "4px",
                  color: "#6c757d",
                  cursor: "pointer",
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Templates List */}
      <div className="templates-list">
        <div
          className="card"
          style={{ border: "1px solid #ddd", borderRadius: "8px" }}
        >
          <div
            className="card-header"
            style={{
              padding: "1rem 1.5rem",
              // backgroundColor: "#f8f9fa",
              borderBottom: "1px solid #ddd",
            }}
          >
            <h3 style={{ margin: 0, fontSize: "1.25rem" }}>
              📧 Templates List
              <span
                style={{
                  fontSize: "0.875rem",
                  fontWeight: "normal",
                  marginLeft: "10px",
                  color: "#6c757d",
                }}
              >
                ({filteredTemplates.length} of {templates.length})
              </span>
            </h3>
          </div>

          <div className="card-body" style={{ padding: "1.5rem" }}>
            {loading && templates.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "3rem",
                  color: "#6c757d",
                }}
              >
                <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⏳</div>
                <p>Loading templates...</p>
              </div>
            ) : templates.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "3rem",
                  color: "#6c757d",
                }}
              >
                <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>📭</div>
                <p>No templates found.</p>
                <p style={{ fontSize: "0.875rem", marginTop: "0.5rem" }}>
                  Create your first template using the "Create Template" button
                  above.
                </p>
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "3rem",
                  color: "#6c757d",
                }}
              >
                <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🔍</div>
                <p>No templates match your search criteria.</p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setTypeFilter("all");
                  }}
                  style={{
                    marginTop: "1rem",
                    padding: "8px 16px",
                    border: "1px solid #007bff",
                    borderRadius: "4px",
                    backgroundColor: "#007bff",
                    color: "white",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="table-responsive">
                <table
                  className="table table-striped"
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "14px",
                  }}
                >
                  <thead>
                    <tr style={{ backgroundColor: "#f8f9fa" }}>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          borderBottom: "2px solid #dee2e6",
                          fontWeight: "600",
                        }}
                      >
                        Name
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          borderBottom: "2px solid #dee2e6",
                          fontWeight: "600",
                        }}
                      >
                        Type
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          borderBottom: "2px solid #dee2e6",
                          fontWeight: "600",
                        }}
                      >
                        Subject
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          borderBottom: "2px solid #dee2e6",
                          fontWeight: "600",
                        }}
                      >
                        Status
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          borderBottom: "2px solid #dee2e6",
                          fontWeight: "600",
                        }}
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTemplates.map((template) => (
                      <tr
                        key={template._id}
                        style={{
                          borderBottom: "1px solid #eee",
                          transition: "background-color 0.2s",
                        }}
                        // onMouseOver={(e) =>
                        // (e.target.parentElement.style.backgroundColor =
                        //   "#f8f9fa")
                        // }
                        onMouseOut={(e) =>
                        (e.target.parentElement.style.backgroundColor =
                          "transparent")
                        }
                      >
                        <td style={{ padding: "12px", verticalAlign: "top" }}>
                          <div>
                            <strong
                              style={{
                                fontSize: "14px",
                                display: "block",
                                marginBottom: "4px",
                              }}
                            >
                              {template.name}
                            </strong>
                            {template.description && (
                              <small
                                className="text-muted"
                                style={{
                                  color: "#6c757d",
                                  fontSize: "0.75rem",
                                  lineHeight: "1.3",
                                }}
                              >
                                {template.description}
                              </small>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: "12px", verticalAlign: "top" }}>
                          <code
                            style={{
                              padding: "4px 8px",
                              backgroundColor: "#e9ecef",
                              borderRadius: "4px",
                              fontSize: "0.75rem",
                              color: "#e83e8c",
                              fontFamily: "monospace",
                            }}
                          >
                            {template.type}
                          </code>
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            verticalAlign: "top",
                            fontSize: "14px",
                          }}
                        >
                          {template.subject}
                        </td>
                        <td style={{ padding: "12px", verticalAlign: "top" }}>
                          <span
                            className={`badge ${template.isActive
                              ? "badge-success"
                              : "badge-secondary"
                              }`}
                            style={{
                              padding: "6px 12px",
                              borderRadius: "12px",
                              fontSize: "0.75rem",
                              fontWeight: "500",
                              backgroundColor: template.isActive
                                ? "#28a745"
                                : "#6c757d",
                              color: "white",
                              display: "inline-block",
                            }}
                          >
                            {template.isActive ? "✅ Active" : "❌ Inactive"}
                          </span>
                        </td>
                        <td style={{ padding: "12px", verticalAlign: "top" }}>
                          <div
                            className="btn-group"
                            style={{
                              display: "flex",
                              gap: "6px",
                              flexWrap: "wrap",
                            }}
                          >
                            <button
                              className="btn btn-sm btn-outline-primary"
                              style={{
                                padding: "6px 8px",
                                border: "1px solid #007bff",
                                borderRadius: "4px",
                                // backgroundColor: "transparent",
                                color: "#007bff",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                transition: "all 0.2s",
                              }}
                              onMouseOver={(e) =>
                                (e.target.style.backgroundColor = "#007bff1a")
                              }
                              onMouseOut={(e) =>
                                (e.target.style.backgroundColor = "transparent")
                              }
                              onClick={() => handleEdit(template)}
                              disabled={loading}
                              title="Edit Template"
                            >
                              <MdEdit size={14} />
                            </button>
                            <button
                              className="btn btn-sm btn-outline-info"
                              style={{
                                padding: "6px 8px",
                                border: "1px solid #17a2b8",
                                borderRadius: "4px",
                                // backgroundColor: "transparent",
                                color: "#17a2b8",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                transition: "all 0.2s",
                              }}
                              onMouseOver={(e) =>
                                (e.target.style.backgroundColor = "#0c72811a")
                              }
                              onMouseOut={(e) =>
                                (e.target.style.backgroundColor = "transparent")
                              }
                              onClick={() => handlePreview(template)}
                              disabled={loading}
                              title="Preview Template"
                            >
                              <MdPreview size={14} />
                            </button>
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              style={{
                                padding: "6px 8px",
                                border: "1px solid #6c757d",
                                borderRadius: "4px",
                                // backgroundColor: "transparent",
                                color: "#6c757d",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                transition: "all 0.2s",
                              }}
                              onMouseOver={(e) =>
                                (e.target.style.backgroundColor = "#6c757d1a")
                              }
                              onMouseOut={(e) =>
                                (e.target.style.backgroundColor = "transparent")
                              }
                              onClick={() => handleDuplicate(template)}
                              disabled={loading}
                              title="Duplicate Template"
                            >
                              <MdContentCopy size={14} />
                            </button>
                            <button
                              className="btn btn-sm btn-outline-warning"
                              style={{
                                padding: "6px 8px",
                                border: "1px solid #ffc107",
                                borderRadius: "4px",
                                // backgroundColor: "transparent",
                                color: "#ffc107",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                transition: "all 0.2s",
                              }}
                              onMouseOver={(e) =>
                                (e.target.style.backgroundColor = "#ffc1071a")
                              }
                              onMouseOut={(e) =>
                                (e.target.style.backgroundColor = "transparent")
                              }
                              onClick={() =>
                                handleToggleStatus(
                                  template._id,
                                  template.isActive
                                )
                              }
                              disabled={loading}
                              title={
                                template.isActive ? "Deactivate" : "Activate"
                              }
                            >
                              {template.isActive ? (
                                <MdToggleOn size={16} />
                              ) : (
                                <MdToggleOff size={16} />
                              )}
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              style={{
                                padding: "6px 8px",
                                border: "1px solid #dc3545",
                                borderRadius: "4px",
                                // backgroundColor: "transparent",
                                color: "#dc3545",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                transition: "all 0.2s",
                              }}
                              onMouseOver={(e) =>
                                (e.target.style.backgroundColor = "#dc35451a")
                              }
                              onMouseOut={(e) =>
                                (e.target.style.backgroundColor = "transparent")
                              }
                              onClick={() => handleDelete(template._id)}
                              disabled={loading}
                              title="Delete Template"
                            >
                              <MdDelete size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Template Creation/Edit Modal */}
      {showTemplateModal && (
        <div
          className="modal-backdrop"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="modal-content"
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              maxWidth: "90%",
              maxHeight: "90%",
              overflow: "auto",
              width: "800px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
              top: "50px",
              transform: "translateY(0)",
            }}
          >
            {/* <div
              className="modal-header"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "1.5rem",
                borderBottom: "2px solid #dee2e6",
                backgroundColor: "#f8f9fa",
                borderTopLeftRadius: "8px",
                borderTopRightRadius: "8px",
              }}
            >
              <h3 style={{ margin: 0, color: "#333", fontSize: "1.5rem" }}>
                {editingId
                  ? "✏️ Edit Email Template"
                  : "📧 Create New Email Template"}
                {currentTemplate.name && (
                  <span
                    style={{
                      display: "block",
                      fontSize: "1rem",
                      color: "#6c757d",
                      marginTop: "4px",
                      fontWeight: "normal",
                    }}
                  >
                    Template: {currentTemplate.name}
                  </span>
                )}
              </h3>
              <button
                onClick={closeModal}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  color: "#6c757d",
                  padding: "4px",
                  borderRadius: "4px",
                  transition: "all 0.2s",
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                // onMouseOver={(e) =>
                //   (e.target.style.backgroundColor = "#f8f9fa")
                // }
                onMouseOut={(e) =>
                  (e.target.style.backgroundColor = "transparent")
                }
                title="Close Modal"
              >
                <MdClose size={20} />
              </button>
            </div> */}

            <div className="modal-body" style={{ padding: "1.5rem" }}>
              <div className="d-flex justify-content-end w-100">
              <button
                onClick={closeModal}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  color: "#fff",
                  padding: "4px",
                  borderRadius: "4px",
                  transition: "all 0.2s",
                  width: "32px",
                  height: "32px",
                }}
                onMouseOver={(e) =>
                  (e.target.style.color = "#da1616ff")
                }
                // onMouseOut={(e) =>
                //   (e.target.style.color = "transparent")
                // }
                title="Close Modal"
              >
                <MdClose size={20} />
              </button>
              </div>
              <form onSubmit={handleSave}>
                <div
                  className="row"
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    margin: "0 -10px",
                  }}
                >
                  {/* Template Name */}
                  <div
                    className="col-md-6 text"
                    style={{
                      flex: "0 0 50%",
                      padding: "0 10px",
                      maxWidth: "50%",
                    }}
                  >
                    <div
                      className="form-group"
                      style={{ marginBottom: "1rem" }}
                    >
                      <label
                        style={{
                          display: "block",
                          marginBottom: "0.5rem",
                          fontWeight: "bold",
                        }}
                      >
                        Template Name *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          border: "1px solid #ddd",
                          borderRadius: "4px",
                          fontSize: "14px",
                        }}
                        value={currentTemplate.name}
                        onChange={(e) => {
                          setCurrentTemplate({
                            ...currentTemplate,
                            name: e.target.value,
                          });
                        }}
                        required
                        disabled={loading}
                        placeholder="Enter template name (e.g., User Registration)"
                      />
                    </div>
                  </div>

                  {/* Template Type */}
                  <div
                    className="col-md-6 text"
                    style={{
                      flex: "0 0 50%",
                      padding: "0 10px",
                      maxWidth: "50%",
                    }}
                  >
                    <div
                      className="form-group"
                      style={{ marginBottom: "1rem" }}
                    >
                      <label
                        style={{
                          display: "block",
                          marginBottom: "0.5rem",
                          fontWeight: "bold",
                        }}
                      >
                        Template Type *
                      </label>
                      {!editingId && (
                        <select
                          className="form-control"
                          value={isCustomType ? '' : currentTemplate.type}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === 'custom') {
                              setIsCustomType(true);
                              setCurrentTemplate({ ...currentTemplate, type: '' });
                            } else {
                              setIsCustomType(false);
                              setCurrentTemplate({ ...currentTemplate, type: val });
                            }
                          }}
                          disabled={loading || editingId}
                        >
                          <option value="">Select Type</option>
                          {availableTemplateTypes.map(t => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                          <option value="custom">+ Add Custom Type</option>
                        </select>
                      )}

                      {(isCustomType || editingId) && (
                        <input
                          type="text"
                          className="form-control"
                          style={{ marginTop: editingId ? 0 : '8px' }}
                          value={currentTemplate.type}
                          onChange={(e) => setCurrentTemplate({ ...currentTemplate, type: e.target.value })}
                          placeholder="e.g., birthday_wish, invoice_reminder"
                          required
                          disabled={loading}
                        />
                      )}

                      {editingId && (
                        <small className="text-muted">
                          Type cannot be changed after creation
                        </small>
                      )}
                    </div>
                  </div>
                </div>

                {/* Subject */}
                <div className="form-group text" style={{ marginBottom: "1rem" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: "bold",
                    }}
                  >
                    Email Subject *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      fontSize: "14px",
                    }}
                    value={currentTemplate.subject}
                    onChange={(e) => {
                      setCurrentTemplate({
                        ...currentTemplate,
                        subject: e.target.value,
                      });
                    }}
                    required
                    disabled={loading}
                    placeholder="Enter email subject line"
                  />
                </div>

                {/* Description */}
                <div className="form-group text" style={{ marginBottom: "1rem" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: "bold",
                    }}
                  >
                    Description (Optional)
                  </label>
                  <textarea
                    className="form-control"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      minHeight: "80px",
                      fontSize: "14px",
                      resize: "vertical",
                    }}
                    value={currentTemplate.description}
                    onChange={(e) => {
                      setCurrentTemplate({
                        ...currentTemplate,
                        description: e.target.value,
                      });
                    }}
                    rows={2}
                    disabled={loading}
                    placeholder="Describe the purpose of this template..."
                  />
                </div>

                {/* Body */}
                <div className="form-group text" style={{ marginBottom: "1rem" }}>
                  <label>Email Body (HTML) *</label>
                  <textarea
                    name="body"
                    className="form-control"
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      minHeight: "100px",
                      fontFamily: "monospace",
                      fontSize: "14px",
                      resize: "vertical",
                      lineHeight: "1.5",
                    }}
                    value={currentTemplate.body}
                    onChange={(e) => {
                      setCurrentTemplate({
                        ...currentTemplate,
                        body: e.target.value,
                      });
                    }}
                    rows={8}
                    required
                    disabled={loading}
                    placeholder={`Enter your email template body in HTML format. You can use variables like {userName}, {companyName}, etc.`}
                  />
                  <div className="variables mt-3">
                    <p style={{ marginBottom: "0.5rem", fontWeight: "bold" }}>
                      Available Variables {currentTemplate.type ? `for "${currentTemplate.type}"` : ''}
                    </p>

                    {getRelevantVariables().length > 0 ? (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {relevantVars.map(variable => (
                          <button
                            key={variable.key}
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleAddVariableToBody(variable.key)}
                            title={variable.description}
                          >
                            {`{${variable.key}}`}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: "#aaa", fontStyle: "italic", fontSize: "14px" }}>
                        {currentTemplate.type
                          ? `No specific variables defined for "${currentTemplate.type}". You can use any variable.`
                          : "Select a template type to see relevant variables."
                        }
                      </p>
                    )}
                  </div>
                </div>

                {/* Form Actions */}
                <div
                  className="form-actions"
                  style={{
                    display: "flex",
                    gap: "12px",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    borderTop: "1px solid #eee",
                    // paddingTop: "1.5rem",
                  }}
                >
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeModal}
                    disabled={loading}
                    style={{
                      padding: "10px 20px",
                      border: "1px solid #6c757d",
                      borderRadius: "4px",
                      // backgroundColor: "transparent",
                      color: "#6c757d",
                      cursor: loading ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "14px",
                      transition: "all 0.2s",
                    }}
                    onMouseOver={(e) =>
                      !loading &&
                      ((e.target.style.backgroundColor = "#6c757d"),
                        (e.target.style.color = "white"))
                    }
                    onMouseOut={(e) =>
                      !loading &&
                      ((e.target.style.backgroundColor = "transparent"),
                        (e.target.style.color = "#6c757d"))
                    }
                  >
                    <MdCancel size={16} />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                    style={{
                      padding: "10px 20px",
                      border: "none",
                      borderRadius: "4px",
                      backgroundColor: "#007bff",
                      color: "white",
                      cursor: loading ? "not-allowed" : "pointer",
                      opacity: loading ? 0.6 : 1,
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "14px",
                      fontWeight: "500",
                      transition: "all 0.2s",
                    }}
                    onMouseOver={(e) =>
                      !loading && (e.target.style.backgroundColor = "#0056b3")
                    }
                    onMouseOut={(e) =>
                      !loading && (e.target.style.backgroundColor = "#007bff")
                    }
                  >
                    <MdSave size={16} />
                    {loading
                      ? "Saving..."
                      : editingId
                        ? "Update Template"
                        : "Create Template"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewTemplate && (
        <div
          className="modal-backdrop"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="modal-content"
            style={{
              backgroundColor: "white",
              padding: "2rem",
              borderRadius: "8px",
              maxWidth: "90%",
              maxHeight: "90%",
              overflow: "auto",
              width: "700px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
              top: "50px",
              transform: "translateY(0)"
            }}
          >
            <div
              className="modal-header"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
                borderBottom: "2px solid #dee2e6",
                paddingBottom: "1rem",
              }}
            >
              <h3 style={{ margin: 0, color: "#333" }}>
                👁️ Preview: {previewTemplate.name}
              </h3>
              <button
                onClick={handleClosePreview}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  color: "#6c757d",
                  padding: "4px",
                  borderRadius: "4px",
                  transition: "all 0.2s",
                }}
                onMouseOver={(e) =>
                  (e.target.style.backgroundColor = "#f8f9fa")
                }
                onMouseOut={(e) =>
                  (e.target.style.backgroundColor = "transparent")
                }
                title="Close Preview"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: "1.5rem" }}>
                <strong
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    color: "#495057",
                  }}
                >
                  📫 Subject:
                </strong>
                <div
                  style={{
                    padding: "12px",
                    backgroundColor: "#f8f9fa",
                    border: "1px solid #dee2e6",
                    borderRadius: "4px",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  {previewTemplate.subject}
                </div>
              </div>

              <div >
                <strong
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    color: "#495057",
                  }}
                >
                  📝 Body:
                </strong>
                <div
                  style={{
                    padding: "1rem",
                    backgroundColor: "#f8f9fa",
                    border: "1px solid #dee2e6",
                    borderRadius: "4px",
                    maxHeight: "400px",
                    overflow: "auto",
                  }}
                  dangerouslySetInnerHTML={{ __html: previewTemplate.body }}
                />
              </div>
            </div>

            {previewTemplate.variables &&
              previewTemplate.variables.length > 0 && (
                <div>
                  <strong
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      color: "#495057",
                    }}
                  >
                    🔤 Variables:
                  </strong>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px",
                      marginTop: "0.5rem",
                    }}
                  >
                    {previewTemplate.variables.map((v) => (
                      <span
                        key={v}
                        style={{
                          display: "inline-block",
                          padding: "6px 10px",
                          backgroundColor: "#e9ecef",
                          border: "1px solid #ced4da",
                          borderRadius: "4px",
                          fontSize: "0.75rem",
                          fontFamily: "monospace",
                          color: "#e83e8c",
                        }}
                      >
                        {`{${v}}`}
                      </span>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>

      )
      }
    </div >
  );
};

export default EmailTemplates;