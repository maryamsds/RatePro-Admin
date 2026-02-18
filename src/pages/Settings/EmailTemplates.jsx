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
    <div className="px-6 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">
          Email Templates
        </h1>
        <button
          onClick={handleNewTemplate}
          disabled={loading}
          className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <MdAdd /> Create Template
        </button>
      </div>

      {/* Success/Error Messages */}
      {error && (
        <div className="px-4 py-3 mb-4 rounded-md border border-red-500 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400">
          <strong>Error:</strong> {error}
        </div>
      )}

      {success && (
        <div className="px-4 py-3 mb-4 rounded-md border border-[var(--success-color)] bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400">
          <strong>Success:</strong> {success}
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md mb-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
        <div className="px-6 py-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <h4 className="m-0 font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">
            Search & Filters
          </h4>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block mb-2 font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">
                Search Templates
              </label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full pl-10 pr-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                  placeholder="Search by name, subject, or type..."
                  value={searchTerm}
                  onChange={handleSearch}
                  disabled={loading}
                />
                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
              </div>
            </div>

            <div>
              <label className="block mb-2 font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">
                Status
              </label>
              <select
                className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                value={statusFilter}
                onChange={handleStatusFilter}
                disabled={loading}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">
                Type
              </label>
              <select
                className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
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

          <div className="flex justify-between items-center mt-4">
            <small className="text-[var(--text-secondary)] text-sm">
              Showing {filteredTemplates.length} of {templates.length} templates
            </small>

            {(searchTerm || statusFilter !== "all" || typeFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setTypeFilter("all");
                }}
                className="px-3 py-1 text-sm rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--text-secondary)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Templates List */}
      <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
        <div className="px-6 py-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <h3 className="m-0 text-xl font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">
            📧 Templates List
            <span className="text-sm font-normal ml-2 text-[var(--text-secondary)]">
              ({filteredTemplates.length} of {templates.length})
            </span>
          </h3>
        </div>

        <div className="p-6">
          {loading && templates.length === 0 ? (
            <div className="text-center py-12 text-[var(--text-secondary)]">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p>Loading templates...</p>
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-12 text-[var(--text-secondary)]">
              <div className="text-4xl mb-4">📭</div>
              <p>No templates found.</p>
              <p className="text-sm mt-2">
                Create your first template using the "Create Template" button above.
              </p>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-12 text-[var(--text-secondary)]">
              <div className="text-4xl mb-4">🔍</div>
              <p>No templates match your search criteria.</p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setTypeFilter("all");
                }}
                className="mt-4 px-4 py-2 rounded-md bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)] transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[var(--light-bg)] dark:bg-[var(--dark-bg)]">
                    <th className="px-3 py-3 text-left font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)] border-b-2 border-[var(--light-border)] dark:border-[var(--dark-border)]">
                      Name
                    </th>
                    <th className="px-3 py-3 text-left font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)] border-b-2 border-[var(--light-border)] dark:border-[var(--dark-border)]">
                      Type
                    </th>
                    <th className="px-3 py-3 text-left font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)] border-b-2 border-[var(--light-border)] dark:border-[var(--dark-border)]">
                      Subject
                    </th>
                    <th className="px-3 py-3 text-left font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)] border-b-2 border-[var(--light-border)] dark:border-[var(--dark-border)]">
                      Status
                    </th>
                    <th className="px-3 py-3 text-left font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)] border-b-2 border-[var(--light-border)] dark:border-[var(--dark-border)]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTemplates.map((template) => (
                    <tr
                      key={template._id}
                      className="border-b border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] transition-colors"
                    >
                      <td className="px-3 py-3 align-top">
                        <div>
                          <strong className="text-sm block mb-1 text-[var(--light-text)] dark:text-[var(--dark-text)]">
                            {template.name}
                          </strong>
                          {template.description && (
                            <small className="text-[var(--text-secondary)] text-xs leading-tight">
                              {template.description}
                            </small>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3 align-top">
                        <code className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 rounded text-xs text-purple-600 dark:text-purple-400 font-mono">
                          {template.type}
                        </code>
                      </td>
                      <td className="px-3 py-3 align-top text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">
                        {template.subject}
                      </td>
                      <td className="px-3 py-3 align-top">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${
                            template.isActive
                              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          {template.isActive ? "✅ Active" : "❌ Inactive"}
                        </span>
                      </td>
                      <td className="px-3 py-3 align-top">
                        <div className="flex gap-2 flex-wrap">
                          <button
                            onClick={() => handleEdit(template)}
                            disabled={loading}
                            title="Edit Template"
                            className="p-1.5 rounded border border-blue-500 text-blue-500 hover:bg-blue-500/10 dark:hover:bg-blue-500/20 transition-colors disabled:opacity-50"
                          >
                            <MdEdit size={14} />
                          </button>
                          <button
                            onClick={() => handlePreview(template)}
                            disabled={loading}
                            title="Preview Template"
                            className="p-1.5 rounded border border-[var(--info-color)] text-[var(--info-color)] hover:bg-[var(--info-color)]/10 dark:hover:bg-[var(--info-color)]/20 transition-colors disabled:opacity-50"
                          >
                            <MdPreview size={14} />
                          </button>
                          <button
                            onClick={() => handleDuplicate(template)}
                            disabled={loading}
                            title="Duplicate Template"
                            className="p-1.5 rounded border border-gray-500 text-gray-500 hover:bg-gray-500/10 dark:hover:bg-gray-500/20 transition-colors disabled:opacity-50"
                          >
                            <MdContentCopy size={14} />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(template._id, template.isActive)}
                            disabled={loading}
                            title={template.isActive ? "Deactivate" : "Activate"}
                            className="p-1.5 rounded border border-[var(--warning-color)] text-[var(--warning-color)] hover:bg-[var(--warning-color)]/10 dark:hover:bg-[var(--warning-color)]/20 transition-colors disabled:opacity-50"
                          >
                            {template.isActive ? <MdToggleOn size={16} /> : <MdToggleOff size={16} />}
                          </button>
                          <button
                            onClick={() => handleDelete(template._id)}
                            disabled={loading}
                            title="Delete Template"
                            className="p-1.5 rounded border border-red-500 text-red-500 hover:bg-red-500/10 dark:hover:bg-red-500/20 transition-colors disabled:opacity-50"
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

      {/* Template Creation/Edit Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000] overflow-auto">
          <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-lg max-w-[90%] max-h-[90%] overflow-auto w-[800px] shadow-2xl my-12">
            <div className="p-6">
              <div className="flex justify-end w-full mb-4">
                <button
                  onClick={closeModal}
                  className="p-1 rounded text-[var(--light-text)] dark:text-[var(--dark-text)] hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  title="Close Modal"
                >
                  <MdClose size={20} />
                </button>
              </div>
              <form onSubmit={handleSave}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Template Name */}
                  <div>
                    <label className="block mb-2 font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">
                      Template Name *
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
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

                  {/* Template Type */}
                  <div>
                    <label className="block mb-2 font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">
                      Template Type *
                    </label>
                    {!editingId && (
                      <select
                        className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
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
                        className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                        style={{ marginTop: editingId ? 0 : '8px' }}
                        value={currentTemplate.type}
                        onChange={(e) => setCurrentTemplate({ ...currentTemplate, type: e.target.value })}
                        placeholder="e.g., birthday_wish, invoice_reminder"
                        required
                        disabled={loading}
                      />
                    )}

                    {editingId && (
                      <small className="text-[var(--text-secondary)] text-xs">
                        Type cannot be changed after creation
                      </small>
                    )}
                  </div>
                </div>

                {/* Subject */}
                <div className="mt-4">
                  <label className="block mb-2 font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">
                    Email Subject *
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
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
                <div className="mt-4">
                  <label className="block mb-2 font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">
                    Description (Optional)
                  </label>
                  <textarea
                    className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] resize-y"
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
                <div className="mt-4">
                  <label className="block mb-2 font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">
                    Email Body (HTML) *
                  </label>
                  <textarea
                    name="body"
                    className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] font-mono resize-y"
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
                  <div className="mt-3">
                    <p className="mb-2 font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">
                      Available Variables {currentTemplate.type ? `for "${currentTemplate.type}"` : ''}
                    </p>

                    {getRelevantVariables().length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {relevantVars.map(variable => (
                          <button
                            key={variable.key}
                            type="button"
                            className="px-3 py-1 text-sm rounded border border-blue-500 text-blue-500 hover:bg-blue-500/10 dark:hover:bg-blue-500/20 transition-colors"
                            onClick={() => handleAddVariableToBody(variable.key)}
                            title={variable.description}
                          >
                            {`{${variable.key}}`}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[var(--text-secondary)] italic text-sm">
                        {currentTemplate.type
                          ? `No specific variables defined for "${currentTemplate.type}". You can use any variable.`
                          : "Select a template type to see relevant variables."
                        }
                      </p>
                    )}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 items-center justify-end border-t border-[var(--light-border)] dark:border-[var(--dark-border)] pt-6 mt-6">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={loading}
                    className="px-5 py-2 rounded-md font-medium transition-colors border border-gray-500 text-gray-500 hover:bg-gray-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <MdCancel size={16} />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000] overflow-auto">
          <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-lg p-8 max-w-[90%] max-h-[90%] overflow-auto w-[700px] shadow-2xl my-12">
            <div className="flex justify-between items-center mb-6 border-b-2 border-[var(--light-border)] dark:border-[var(--dark-border)] pb-4">
              <h3 className="m-0 text-[var(--light-text)] dark:text-[var(--dark-text)] text-xl font-semibold">
                👁️ Preview: {previewTemplate.name}
              </h3>
              <button
                onClick={handleClosePreview}
                className="p-1 rounded text-[var(--text-secondary)] hover:text-red-500 dark:hover:text-red-400 hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] transition-all"
                title="Close Preview"
              >
                <MdClose size={24} />
              </button>
            </div>
            <div>
              <div className="mb-6">
                <strong className="block mb-2 text-[var(--light-text)] dark:text-[var(--dark-text)]">
                  📫 Subject:
                </strong>
                <div className="px-3 py-3 bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">
                  {previewTemplate.subject}
                </div>
              </div>

              <div>
                <strong className="block mb-2 text-[var(--light-text)] dark:text-[var(--dark-text)]">
                  📝 Body:
                </strong>
                <div
                  className="p-4 bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded max-h-[400px] overflow-auto text-[var(--light-text)] dark:text-[var(--dark-text)]"
                  dangerouslySetInnerHTML={{ __html: previewTemplate.body }}
                />
              </div>
            </div>

            {previewTemplate.variables &&
              previewTemplate.variables.length > 0 && (
                <div className="mt-6">
                  <strong className="block mb-2 text-[var(--light-text)] dark:text-[var(--dark-text)]">
                    🔤 Variables:
                  </strong>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {previewTemplate.variables.map((v) => (
                      <span
                        key={v}
                        className="inline-block px-2.5 py-1.5 bg-purple-100 dark:bg-purple-900/30 border border-purple-300 dark:border-purple-700 rounded text-xs font-mono text-purple-600 dark:text-purple-400"
                      >
                        {`{${v}}`}
                      </span>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailTemplates;