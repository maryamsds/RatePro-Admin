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

  // Available template types from your backend enum
  const templateTypes = [
    { value: "user_welcome", label: "User Welcome Email" },
    { value: "survey_published", label: "Survey Published" },
    { value: "password_reset", label: "Password Reset" },
    { value: "survey_reminder", label: "Survey Reminder" },
    { value: "admin_notification", label: "Admin Notification" },
  ];

  // Common variables for templates
  const availableVariables = [
    { key: "userName", description: "User's full name" },
    { key: "customerName", description: "Customer's name" },
    { key: "companyName", description: "Your company name" },
    { key: "surveyLink", description: "Link to the survey" },
    { key: "loginDetails", description: "User login credentials" },
    { key: "rating", description: "Customer's rating" },
    { key: "resetLink", description: "Password reset link" },
    { key: "expiryDate", description: "Expiry date" },
  ];

  // Debug logger
  const debugLog = (action, data = {}) => {
    console.log(`🔍 DEBUG [${action}]:`, {
      timestamp: new Date().toISOString(),
      ...data,
    });
  };

  // Fetch templates from backend using axios
  const fetchTemplates = async () => {
    try {
      debugLog("fetchTemplates_start", {
        loading,
        templatesCount: templates.length,
      });
      setLoading(true);
      setError("");

      const response = await emailTemplateAPI.getAll();

      debugLog("fetchTemplates_response", {
        status: response.status,
        data: response.data,
      });

      if (response.data.success) {
        setTemplates(response.data.data || []);
        debugLog("fetchTemplates_success", {
          count: response.data.data?.length,
        });
      } else {
        throw new Error(response.data.message || "Failed to fetch templates");
      }
    } catch (err) {
      debugLog("fetchTemplates_error", {
        error: err.response?.data?.message || err.message,
        status: err.response?.status,
      });
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch templates"
      );
    } finally {
      setLoading(false);
      debugLog("fetchTemplates_finally", { loading: false });
    }
  };

  useEffect(() => {
    debugLog("component_mount");
    fetchTemplates();
  }, []);

  // Open modal for new template
  const handleNewTemplate = () => {
    debugLog("handleNewTemplate");
    resetForm();
    setShowTemplateModal(true);
  };

  // Reset form and close modal
  const resetForm = () => {
    debugLog("resetForm", {
      previousEditingId: editingId,
      previousTemplate: currentTemplate,
    });
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
    debugLog("closeModal");
    setShowTemplateModal(false);
    resetForm();
  };

  // Handle edit template
  const handleEdit = (template) => {
    debugLog("handleEdit", {
      templateId: template._id,
      templateName: template.name,
      templateType: template.type,
    });
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
    debugLog("handleDuplicate", {
      templateId: template._id,
      templateName: template.name,
    });
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
    debugLog("handlePreview", {
      templateId: template._id,
      templateName: template.name,
    });
    setPreviewTemplate(template);
  };

  // Handle save template (create or update)
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      debugLog("handleSave_start", {
        editingId,
        currentTemplate: {
          name: currentTemplate.name,
          type: currentTemplate.type,
          subject: currentTemplate.subject,
          bodyLength: currentTemplate.body.length,
          variables: currentTemplate.variables,
        },
      });

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
        debugLog("handleSave_update", { templateId: editingId, apiData });
        response = await emailTemplateAPI.update(editingId, apiData);
      } else {
        debugLog("handleSave_create", { apiData });
        response = await emailTemplateAPI.create(apiData);
      }

      debugLog("handleSave_response", {
        status: response.status,
        data: response.data,
      });

      if (response.data.success) {
        const message = editingId
          ? "Template updated successfully"
          : "Template created successfully";
        setSuccess(message);
        debugLog("handleSave_success", { message });
        closeModal();
        await fetchTemplates();
      } else {
        throw new Error(response.data.message || "Operation failed");
      }
    } catch (err) {
      debugLog("handleSave_error", {
        error: err.response?.data?.message || err.message,
        status: err.response?.status,
      });
      setError(
        err.response?.data?.message || err.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
      debugLog("handleSave_finally", { loading: false });
    }
  };

  // Handle delete template
  const handleDelete = async (id) => {
    debugLog("handleDelete_confirm", { templateId: id });
    if (
      !confirm(
        "Are you sure you want to delete this template? This action cannot be undone."
      )
    ) {
      debugLog("handleDelete_cancelled", { templateId: id });
      return;
    }

    try {
      setLoading(true);
      debugLog("handleDelete_start", { templateId: id });

      const response = await emailTemplateAPI.delete(id);

      debugLog("handleDelete_response", {
        status: response.status,
        data: response.data,
      });

      if (response.data.success) {
        setSuccess("Template deleted successfully");
        debugLog("handleDelete_success", { templateId: id });
        await fetchTemplates();
      } else {
        throw new Error(response.data.message || "Delete failed");
      }
    } catch (err) {
      debugLog("handleDelete_error", {
        error: err.response?.data?.message || err.message,
        templateId: id,
      });
      setError(err.response?.data?.message || err.message || "Delete failed");
    } finally {
      setLoading(false);
      debugLog("handleDelete_finally", { loading: false });
    }
  };

  // Toggle template status
  const handleToggleStatus = async (id, currentStatus) => {
    try {
      debugLog("handleToggleStatus_start", {
        templateId: id,
        currentStatus,
        newStatus: !currentStatus,
      });

      setLoading(true);
      const response = await emailTemplateAPI.toggleStatus(id);

      debugLog("handleToggleStatus_response", {
        status: response.status,
        data: response.data,
      });

      if (response.data.success) {
        setSuccess(
          `Template ${!currentStatus ? "activated" : "deactivated"
          } successfully`
        );
        debugLog("handleToggleStatus_success", {
          templateId: id,
          newStatus: !currentStatus,
        });
        await fetchTemplates();
      } else {
        throw new Error(response.data.message || "Toggle failed");
      }
    } catch (err) {
      debugLog("handleToggleStatus_error", {
        error: err.response?.data?.message || err.message,
        templateId: id,
      });
      setError(err.response?.data?.message || err.message || "Toggle failed");
    } finally {
      setLoading(false);
      debugLog("handleToggleStatus_finally", { loading: false });
    }
  };

  // Add variable to template body at cursor position
  const handleAddVariableToBody = (variableKey) => {
    debugLog("handleAddVariableToBody", {
      variableKey,
      currentBodyLength: currentTemplate.body.length,
    });

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

      debugLog("handleAddVariableToBody_success", {
        newBodyLength: newBody.length,
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

  // Close preview
  const handleClosePreview = () => {
    debugLog("handleClosePreview");
    setPreviewTemplate(null);
  };

  // Handle search
  const handleSearch = (e) => {
    const value = e.target.value;
    debugLog("handleSearch", { searchTerm: value });
    setSearchTerm(value);
  };

  // Handle status filter
  const handleStatusFilter = (e) => {
    const value = e.target.value;
    debugLog("handleStatusFilter", { statusFilter: value });
    setStatusFilter(value);
  };

  // Handle type filter
  const handleTypeFilter = (e) => {
    const value = e.target.value;
    debugLog("handleTypeFilter", { typeFilter: value });
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

  debugLog("filteredTemplates", {
    originalCount: templates.length,
    filteredCount: filteredTemplates.length,
    searchTerm,
    statusFilter,
    typeFilter,
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
                  debugLog("clearFilters");
                  setSearchTerm("");
                  setStatusFilter("all");
                  setTypeFilter("all");
                }}
                style={{
                  padding: "4px 12px",
                  fontSize: "0.875rem",
                  border: "1px solid #6c757d",
                  borderRadius: "4px",
                  backgroundColor: "transparent",
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
                        //   (e.target.parentElement.style.backgroundColor =
                        //     "#f8f9fa")
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
                                backgroundColor: "transparent",
                                color: "#007bff",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                transition: "all 0.2s",
                              }}
                              onMouseOver={(e) =>
                                (e.target.style.backgroundColor = "#007bff")
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
                                backgroundColor: "transparent",
                                color: "#17a2b8",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                transition: "all 0.2s",
                              }}
                              onMouseOver={(e) =>
                                (e.target.style.backgroundColor = "#22c9e21a")
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
                                backgroundColor: "transparent",
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
                                backgroundColor: "transparent",
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
                                backgroundColor: "transparent",
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
            top: "5%",
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
            }}
          >
            <div
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
                      // color: "#6c757d",
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
                onMouseOver={(e) =>
                  (e.target.style.backgroundColor = "#f8f9fa")
                }
                onMouseOut={(e) =>
                  (e.target.style.backgroundColor = "transparent")
                }
                title="Close Modal"
              >
                <MdClose size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ padding: "1.5rem" }}>
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
                    className="col-md-6"
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
                      <label className="text-muted"
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
                          debugLog("nameChange", { value: e.target.value });
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
                    className="col-md-6"
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
                      <label className="text-muted"
                        style={{
                          display: "block",
                          marginBottom: "0.5rem",
                          fontWeight: "bold",
                        }}
                      >
                        Template Type
                      </label>
                      <select
                        className="form-control"
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          border: "1px solid #ddd",
                          borderRadius: "4px",
                          fontSize: "14px",
                        }}
                        value={currentTemplate.type}
                        onChange={(e) => {
                          debugLog("typeChange", { value: e.target.value });
                          setCurrentTemplate({
                            ...currentTemplate,
                            type: e.target.value,
                          });
                        }}
                        required
                        disabled={loading || editingId}
                      >
                        <option value="">Select Template Type</option>
                        {templateTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                      {editingId && (
                        <small
                          className="text-muted"
                          style={{
                            color: "#6c757d",
                            fontSize: "0.75rem",
                            display: "block",
                            marginTop: "4px",
                          }}
                        >
                          🔒 Template type cannot be changed after creation
                        </small>
                      )}
                    </div>
                  </div>
                </div>

                {/* Subject */}
                <div className="form-group" style={{ marginBottom: "1rem" }}>
                  <label className="text-muted"
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
                      debugLog("subjectChange", { value: e.target.value });
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
                <div className="form-group" style={{ marginBottom: "1rem" }}>
                  <label className="text-muted"
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: "bold",
                    }}
                  >
                    Description
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
                      debugLog("descriptionChange", { value: e.target.value });
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
                <div className="form-group" style={{ marginBottom: "1rem" }}>
                  <label className="text-muted"
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: "bold",
                    }}
                  >
                    Email Body *
                  </label>
                  <textarea
                    name="body"
                    className="form-control"
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      minHeight: "200px",
                      fontFamily: "monospace",
                      fontSize: "14px",
                      resize: "vertical",
                      lineHeight: "1.5",
                    }}
                    value={currentTemplate.body}
                    onChange={(e) => {
                      debugLog("bodyChange", {
                        valueLength: e.target.value.length,
                      });
                      setCurrentTemplate({
                        ...currentTemplate,
                        body: e.target.value,
                      });
                    }}
                    rows={10}
                    required
                    disabled={loading}
                    placeholder="Enter your email template body here. Use variables like {userName}, {companyName}, etc."
                  />

                  {/* Variables Section */}
                  <div className="variables mt-3 text-muted" style={{ marginTop: "1rem" }}>
                    <p
                      style={{
                        marginBottom: "0.5rem",
                        fontWeight: "bold",
                        fontSize: "14px",
                      }}
                    >
                      📝 Available Variables:
                    </p>
                    <div
                      className="variable-buttons"
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "8px",
                        marginBottom: "0.5rem",
                      }}
                    >
                      {availableVariables.map((variable) => (
                        <button
                          key={variable.key}
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          style={{
                            padding: "6px 12px",
                            fontSize: "0.75rem",
                            border: "1px solid #007bff",
                            borderRadius: "4px",
                            backgroundColor: "transparent",
                            color: "#007bff",
                            cursor: "pointer",
                            transition: "all 0.2s",
                          }}
                          onMouseOver={(e) =>
                            (e.target.style.backgroundColor = "#007bff1a")
                          }
                          onMouseOut={(e) =>
                            (e.target.style.backgroundColor = "transparent")
                          }
                          onClick={() => handleAddVariableToBody(variable.key)}
                          disabled={loading}
                          title={variable.description}
                        >
                          {`{${variable.key}}`}
                        </button>
                      ))}
                    </div>
                    <small
                      className="text-muted"
                      style={{
                        color: "#6c757d",
                        fontSize: "0.75rem",
                        display: "block",
                      }}
                    >
                      💡 Click on variables to insert them at cursor position in
                      the body
                    </small>
                  </div>
                </div>

                {/* Active Status */}
                {/* <div
                  className="form-group form-check"
                  style={{
                    marginBottom: "1.5rem",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <input
                    type="checkbox"
                    className="form-check-input"
                    style={{
                      marginRight: "8px",
                      width: "18px",
                      height: "18px",
                      cursor: loading ? "not-allowed" : "pointer",
                    }}
                    id="isActive"
                    checked={currentTemplate.isActive}
                    onChange={(e) => {
                      debugLog("isActiveChange", { checked: e.target.checked });
                      setCurrentTemplate({
                        ...currentTemplate,
                        isActive: e.target.checked,
                      });
                    }}
                    disabled={loading}
                  />
                  <label
                    className="form-check-label"
                    htmlFor="isActive"
                    style={{
                      margin: 0,
                      fontSize: "14px",
                      cursor: loading ? "not-allowed" : "pointer",
                    }}
                  >
                    ✅ Active Template
                  </label>
                </div> */}

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
                      backgroundColor: "transparent",
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
            top: '5%',
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
                    color: "var(--text-muted)",
                    backgroundColor: "var(--dark-bg)",  
                    border: "1px solid #dee2e6",
                    borderRadius: "4px",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  {previewTemplate.subject}
                </div>
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
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
                    color: "var(--text-muted)",
                    backgroundColor: "var(--dark-bg)", 
                    border: "1px solid #dee2e6",
                    borderRadius: "4px",
                    whiteSpace: "pre-wrap",
                    fontFamily: "monospace",
                    fontSize: "13px",
                    lineHeight: "1.5",
                    maxHeight: "400px",
                    overflow: "auto",
                  }}
                >
                  {previewTemplate.body}
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
                            backgroundColor: "var(--dark-bg)",
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
        </div>
      )}
    </div>
  );
};

export default EmailTemplates;
