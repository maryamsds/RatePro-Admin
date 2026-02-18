// SurveyTemplates.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  MdDescription,
  MdAdd,
  MdSearch,
  MdFilterList,
  MdVisibility,
  MdStar,
  MdCategory,
  MdMoreVert,
  MdEdit,
  MdPublish,
  MdSave,
  MdDelete,
  MdBlock,
} from "react-icons/md";
import { FaUsers, FaClock, FaLanguage } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { usePermissions } from "../../hooks/usePermissions";
import Pagination from "../../components/Pagination/Pagination";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import axiosInstance from "../../api/axiosInstance.js";
import useDropdownOptions from "../../hooks/useDropdownOptions.js";

const SurveyTemplates = ({ darkMode }) => {
  const navigate = useNavigate();
  const { setGlobalLoading, user } = useAuth();

  // Permission-based access control (mirrors backend)
  const { isSystemAdmin, isCompanyAdmin, hasPermission } = usePermissions();

  // State Management
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all"); // ✅ NEW: Status filter
  const [sortBy, setSortBy] = useState("popular");

  // Modal States
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  // Pagination State
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  });

  // ✅ DYNAMIC CATEGORIES: Fetch from System Settings (DB-driven, no fallbacks)
  const { options: dynamicCategories, loading: categoriesLoading, error: categoriesError } = useDropdownOptions('industry');

  // Transform API response to component format
  // Note: If no categories configured, this will be empty - that's a configuration issue, not code issue
  const categories = dynamicCategories.map(cat => ({
    id: cat.key,
    name: cat.label,
    color: cat.color || "#6c757d"
  }));

  // ✅ STATUS BADGE COMPONENT
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      draft: { label: 'Draft', variant: 'warning', icon: MdSave },
      published: { label: 'Published', variant: 'success', icon: MdPublish },
      active: { label: 'Active', variant: 'success', icon: MdPublish },
      archived: { label: 'Archived', variant: 'secondary', icon: MdDescription }
    };

    const config = statusConfig[status] || statusConfig.draft;
    const StatusIcon = config.icon;

    const variantColors = {
      warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      secondary: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${variantColors[config.variant] || variantColors.secondary}`}>
        <StatusIcon size={12} />
        {config.label}
      </span>
    );
  };

  // ✅ STATUS FILTER COMPONENT 
  const StatusFilter = ({ value, onChange }) => (
    <select value={value} onChange={onChange} className="px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-sm">
      <option value="all">All Status</option>
      <option value="draft">Draft</option>
      <option value="published">Published</option>
      <option value="active">Active</option>
      <option value="archived">Archived</option>
    </select>
  );

  // ✅ TOGGLE TEMPLATE STATUS FUNCTION - Fixed
  const toggleTemplateStatus = async (templateId, currentStatus) => {
    try {
      let newStatus;
      let confirmMessage;

      // ✅ Consistent status flow
      if (currentStatus === 'draft') {
        newStatus = 'published';
        confirmMessage = 'Publish this template? It will be available for all users.';
      } else if (currentStatus === 'published' || currentStatus === 'active') {
        newStatus = 'draft';
        confirmMessage = 'Move this template to draft? It will no longer be available to users.';
      } else {
        newStatus = 'draft';
        confirmMessage = 'Move this template to draft?';
      }

      const result = await Swal.fire({
        title: 'Change Template Status?',
        text: confirmMessage,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: 'var(--bs-primary)',
        cancelButtonColor: 'var(--bs-secondary)',
        confirmButtonText: 'Yes, Change Status',
        cancelButtonText: 'Cancel'
      });

      if (result.isConfirmed) {
        const response = await axiosInstance.patch(`/survey-templates/${templateId}/status`, {
          status: newStatus
        });

        if (response.data.success) {
          // Update local state
          setTemplates(prev => prev.map(template =>
            template._id === templateId
              ? { ...template, status: newStatus }
              : template
          ));

          Swal.fire({
            icon: 'success',
            title: 'Status Updated!',
            text: `Template is now ${newStatus}`,
            timer: 1500,
            showConfirmButton: false
          });
        }
      }
    } catch (error) {
      console.error('Error toggling template status:', error);
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: error.response?.data?.message || 'Failed to update template status'
      });
    }
  };

  // ✅ FETCH TEMPLATES FROM BACKEND API ONLY - No hardcoded data
  const fetchTemplates = async () => {
    try {
      setLoading(true);

      // Build query parameters for backend API
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy: sortBy,
      };

      // Add filters only if not 'all'
      if (selectedCategory !== "all") params.category = selectedCategory;
      if (selectedLanguage !== "all") params.language = selectedLanguage;
      if (selectedStatus !== "all") params.status = selectedStatus; // ✅ NEW: Status filter
      if (searchTerm) params.search = searchTerm;

      const response = await axiosInstance.get("/survey-templates", { params });

      if (response.data.success) {


        // ✅ TEMPORARY FIX: Agar companyAdmin hai aur template draft hai toh active karein
        const processedTemplates = response.data.data.map(template => {
          if (user?.role === 'companyAdmin' && template.status === 'draft') {
            return { ...template, status: 'active' };
          }
          return template;
        });

        // ✅ Use processed data
        setTemplates(processedTemplates);

        // ✅ Use backend pagination
        setPagination((prev) => ({
          ...prev,
          total: response.data.pagination.total,
          pages: response.data.pagination.pages,
        }));
      }
    } catch (error) {
      console.error("Error fetching templates from backend:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load survey templates from database. Please try again.",
      });
      // Set empty templates on error
      setTemplates([]);
      setPagination((prev) => ({ ...prev, total: 0, pages: 0 }));
    } finally {
      setLoading(false);
    }
  };

  // ✅ INITIAL LOAD - Fetch templates only
  useEffect(() => {
    fetchTemplates();
  }, [pagination.page, sortBy, selectedCategory, selectedLanguage, selectedStatus, searchTerm]);

  // ✅ CATEGORY OPTIONS - Using static categories
  const categoryOptions = [
    { value: "all", label: "All Categories" },
    ...categories.map((cat) => ({
      value: cat.id,
      label: cat.name,
    })),
  ];

  // ✅ PREVIEW TEMPLATE - Backend API only

  const handlePreviewTemplate = async (template) => {
    try {
      setGlobalLoading(true);
      const response = await axiosInstance.get(
        `/survey-templates/${template._id}/preview`
      );

      if (response.data.success) {
        setSelectedTemplate(response.data.data);
        setShowPreviewModal(true);
      }
    } catch (error) {
      console.error("Error previewing template:", error);
      // Fallback to basic template data
      setSelectedTemplate(template);
      setShowPreviewModal(true);
    } finally {
      setGlobalLoading(false);
    }
  };

  // ✅ USE TEMPLATE FUNCTION - ENHANCED WITH ROUTE VALIDATION
  const handleUseTemplate = async (template) => {
    try {
      const result = await Swal.fire({
        title: "Create Survey from Template",
        text: `Create a new survey using "${template.name}" template?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#007bff",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Yes, Create Survey",
        cancelButtonText: "Cancel",
      });

      if (result.isConfirmed) {
        // Update usage count (non-blocking)
        await axiosInstance.patch(`/survey-templates/${template._id}/use`);

        // ✅ ENHANCED: Check available routes and navigate accordingly
        const userRole = user?.role || localStorage.getItem("userRole");

        let targetPath;

        // Check if company admin route exists, else fallback to /app
        if (userRole === "companyAdmin") {
          // Try company path first, if fails use app path
          targetPath = "/app/surveys/builder";
        } else {
          targetPath = "/app/surveys/builder";
        }

        // ✅ Use React Router navigation
        navigate(targetPath, {
          state: {
            templateData: template,
            source: "templates",
            mode: "template-edit",
          }
        });

        // ✅ Fallback mechanism - if navigation fails, show error
        setTimeout(() => {
          if (window.location.pathname.includes('templates')) {
            // Still on templates page, navigation failed
            Swal.fire({
              icon: 'error',
              title: 'Navigation Failed',
              text: 'Survey builder route not found. Please contact administrator.',
              confirmButtonText: 'OK'
            });
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Usage count update failed:', error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to create survey from template. Please try again.",
      });
    }
  };

  // ✅ ADMIN TEMPLATE CREATION FUNCTION
  const handleCreateTemplate = () => {
    navigate('/app/surveys/builder', {
      state: {
        createTemplate: true,
        mode: 'template-edit',
        source: 'templates'
      }
    });
  };

  // ✅ EDIT TEMPLATE FUNCTION (Admin only)
  // const handleEditTemplate = (template) => {
  //   navigate(`/app/surveys/builder/${template._id}`, {
  //     state: {
  //       templateData: template,
  //       source: "templates",
  //       mode: "template-edit",
  //       isEditing: true
  //     }
  //   });
  // };
  const handleEditTemplate = (template) => {
    navigate(`/app/surveys/builder/${template._id}`, {
      state: {
        templateData: template,     // Fast load ke liye
        mode: "template-edit"       // Mode detection
      }
    });
  };
  // ✅ DELETE TEMPLATE FUNCTION (Admin only)
  const MySwal = withReactContent(Swal);

  const handleDeleteTemplate = async (id) => {
    try {
      const result = await MySwal.fire({
        title: "Delete Template?",
        text: "This action cannot be undone!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Delete",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#1fdae4",  // teal vibe
        cancelButtonColor: "#6C757D",   // dark tone
        background: "#ffffff",          // dark mode background
        color: "#545454",               // text color
      });

      if (!result.isConfirmed) return;

      const response = await axiosInstance.delete(`/survey-templates/delete/${id}`);

      await MySwal.fire({
        title: "Deleted!",
        text: "Your template has been removed.",
        icon: "success",
        confirmButtonColor: "#1fdae4",
        background: "#ffffff",          // dark mode background
        color: "#545454",               // text color
      });

      fetchTemplates();
    } catch (error) {
      console.error("Error deleting template:", error);
    }
  };


  // ✅ GET STATISTICS - From real backend data only
  const getTemplateStats = () => {
    const publishedCount = templates.filter(t => t.status === 'published').length;
    const draftCount = templates.filter(t => t.status === 'draft').length;

    return {
      total: pagination.total,
      categories: new Set(templates.map((t) => t.category)).size,
      published: publishedCount,
      draft: draftCount
    };
  };

  const stats = getTemplateStats();

  // ✅ FIXED: Dynamic category badge - properly matches categories
  const getCategoryBadge = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);

    if (!category) {
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">{categoryId || "General"}</span>;
    }

    const categoryColor = category.color || "#6c757d";

    return (
      <span
        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
        style={{
          backgroundColor: `${categoryColor}20`,
          color: categoryColor,
          border: `1px solid ${categoryColor}40`,
        }}
      >
        {category.name}
      </span>
    );
  };

  // ✅ CLEAR ALL FILTERS
  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedLanguage("all");
    setSelectedStatus("all");
    setSortBy("popular");
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  return (
    <div className="min-h-screen bg-[var(--light-bg)] dark:bg-[var(--dark-bg)]">
      <div className="px-4 py-2">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between flex-wrap mb-3">
            <div>
              <div className="flex items-center mb-2">
                <MdDescription
                  className="mr-2"
                  style={{ color: "var(--primary-color, #1fdae4)" }}
                  size={28}
                />
                <h1 className="text-2xl font-bold mb-0 text-[var(--light-text)] dark:text-[var(--dark-text)]">Survey Templates</h1>
              </div>
              <p className="text-[var(--light-muted)] dark:text-[var(--dark-muted)] mb-0 hidden sm:block">
                Choose from {stats.total} professional templates across{" "}
                {stats.categories} industries
              </p>
            </div>

            {/* Create Template Button - Show only for Admin */}
            {isSystemAdmin && (
              <button
                className="inline-flex items-center gap-1 px-4 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)]"
                onClick={handleCreateTemplate}
              >
                <MdAdd className="mr-1 sm:mr-2" size={16} />
                <span className="hidden sm:inline">Create Template</span>
                <span className="sm:hidden">Create</span>
              </button>
            )}
          </div>

          {/* Quick Stats */}
          <div className="flex gap-2 flex-wrap mb-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-sm font-medium border border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <MdStar className="mr-1" size={14} />
              <span>{stats.total} Templates</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-sm font-medium border border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <MdCategory className="mr-1" size={14} />
              <span>{stats.categories} Categories</span>
            </div>
            {isSystemAdmin && (
              <>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-sm font-medium border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                  <MdPublish className="mr-1" size={14} />
                  <span>{stats.published} Published</span>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-sm font-medium border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                  <MdSave className="mr-1" size={14} />
                  <span>{stats.draft} Draft</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          {/* Search Bar */}
          <div className="mb-3">
            <div className="relative flex">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--secondary-color)]">
                <MdSearch size={18} />
              </span>
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 pl-10 pr-3 py-2 rounded-l-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30"
              />
              {/* Mobile Filter Button */}
              <button
                className="lg:hidden px-3 py-2 rounded-r-md border border-l-0 border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                onClick={() => setShowMobileFilters(true)}
              >
                <MdFilterList size={18} />
                <span className="ms-1">Filter</span>
              </button>
            </div>
          </div>

          {/* Desktop Filters */}
          <div className="hidden lg:flex items-center gap-3">
            <div>
              <label className="block text-sm font-medium mb-1 text-[var(--light-text)] dark:text-[var(--dark-text)]">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-sm"
              >
                {categoryOptions.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-[var(--light-text)] dark:text-[var(--dark-text)]">Language</label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-sm"
              >
                <option value="all">All Languages</option>
                <option value="english">English</option>
                <option value="arabic">Arabic</option>
              </select>
            </div>

            {/* ✅ NEW: Status Filter - Show only for Admin */}
            {user?.role === 'admin' && (
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--light-text)] dark:text-[var(--dark-text)]">Status</label>
                <StatusFilter
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1 text-[var(--light-text)] dark:text-[var(--dark-text)]">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-sm"
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest</option>
                <option value="alphabetical">A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        {(searchTerm || selectedCategory !== "all" || selectedLanguage !== "all" || selectedStatus !== "all") && (
          <div className="flex items-center justify-between flex-wrap mb-3 p-3 rounded-md bg-[var(--light-card)] dark:bg-[var(--dark-card)] border border-[var(--light-border)] dark:border-[var(--dark-border)]">
            <div>
              <span className="font-semibold text-[var(--primary-color)]">{templates.length}</span>
              <span className="text-[var(--light-muted)] dark:text-[var(--dark-muted)] ml-1">
                of {pagination.total} templates
              </span>
              {searchTerm && (
                <span className="text-[var(--light-muted)] dark:text-[var(--dark-muted)] hidden sm:inline">
                  for "{searchTerm}"
                </span>
              )}
            </div>
            <button
              className="px-4 py-2 rounded-md font-medium transition-colors border border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-[var(--primary-color)] hover:text-white text-sm"
              onClick={handleClearFilters}
            >
              <span className="hidden sm:inline">Clear Filters</span>
              <span className="sm:hidden">Clear</span>
            </button>
          </div>
        )}

        {/* ✅ TEMPLATES GRID - ONLY Backend Database Data */}
        {!loading && templates.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {templates.map((template) => (
              <div key={template._id}>
                <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md hover:shadow-lg p-4 border border-[var(--light-border)] dark:border-[var(--dark-border)] transition-all cursor-pointer h-full flex flex-col">
                  {/* Template Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex flex-wrap gap-1">
                      {getCategoryBadge(template.category)}
                      {/* ✅ NEW: Status Badge */}
                      {user?.role === 'admin' && (
                        <StatusBadge status={template.status} />
                      )}
                      {template.usageCount > 1000 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                          <MdStar size={12} />
                          <span>Popular</span>
                        </span>
                      )}
                      {template.isPremium && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                          <span>Premium</span>
                        </span>
                      )}
                    </div>

                    {/* ✅ NEW: Admin Actions Dropdown - Edit Option Hide for Admin */}
                    {user?.role === 'admin' && (
                      <div className="template-actions-dropdown relative">
                        <button
                          onClick={() => setOpenDropdownId(openDropdownId === template._id ? null : template._id)}
                          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <MdMoreVert size={16} />
                        </button>
                        {openDropdownId === template._id && (
                          <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-[var(--light-border)] dark:border-[var(--dark-border)] z-50 py-1">
                            {/* ✅ EDIT OPTION - Hide for Admin */}
                            {user?.role == 'admin' && (
                              <button onClick={() => { setOpenDropdownId(null); handleEditTemplate(template) }} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                <MdEdit className="me-2" />
                                Edit Template
                              </button>
                            )}
                            <button
                              onClick={() => { setOpenDropdownId(null); toggleTemplateStatus(template._id, template.status) }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                              {template.status === 'draft' ? (
                                <>
                                  <MdPublish className="me-2" />
                                  Publish
                                </>
                              ) : (
                                <>
                                  <MdSave className="me-2" />
                                  Move to Draft
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => { setOpenDropdownId(null); handleDeleteTemplate(template._id) }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                              <MdDelete className="me-2" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Template Content - Direct from Database */}
                  <div className="mb-3 flex-grow">
                    <h5 className="text-lg font-semibold mb-2 text-[var(--light-text)] dark:text-[var(--dark-text)]">{template.name}</h5>
                    <p className="text-sm text-[var(--light-muted)] dark:text-[var(--dark-muted)] line-clamp-2">
                      {template.description}
                    </p>
                  </div>

                  {/* Template Stats - Direct from Database */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1 text-xs text-[var(--light-muted)] dark:text-[var(--dark-muted)]">
                        <FaUsers size={12} />
                        <span>
                          {template.usageCount > 1000
                            ? `${Math.round(template.usageCount / 1000)}k`
                            : template.usageCount}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-[var(--light-muted)] dark:text-[var(--dark-muted)]">
                        <FaClock size={12} />
                        <span>{template.estimatedTime}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-[var(--light-muted)] dark:text-[var(--dark-muted)]">
                        <MdDescription size={12} />
                        <span>{template.questions?.length || 0} Q</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-[var(--light-muted)] dark:text-[var(--dark-muted)]">
                        <MdStar size={12} />
                        <span>{template.rating}</span>
                      </div>
                    </div>

                    {/* Language Support - Direct from Database */}
                    <div className="flex items-center gap-1 text-xs text-[var(--light-muted)] dark:text-[var(--dark-muted)]">
                      <FaLanguage size={12} />
                      <span>
                        {Array.isArray(template.language)
                          ? template.language.join(", ")
                          : "English"}
                      </span>
                    </div>
                  </div>

                  {/* Template Actions */}
                  <div className="flex gap-2 mt-auto pt-3 border-t border-[var(--light-border)] dark:border-[var(--dark-border)]">
                    {/* Use Template - Hidden for SystemAdmin, permission-based for Members */}
                    {!isSystemAdmin && (isCompanyAdmin || hasPermission('template:use')) && (
                      <button
                        className="flex-1 px-4 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)] inline-flex items-center justify-center gap-1 text-sm"
                        onClick={() => handleUseTemplate(template)}
                        disabled={template.status === 'draft'}
                        title={
                          template.status === 'draft'
                            ? "Draft templates cannot be used"
                            : "Use this template to create a survey"
                        }
                        style={template.status === 'draft' ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                      >
                        <MdAdd size={16} />
                        <span>Use Template</span>
                      </button>
                    )}

                    <button
                      className="px-4 py-2 rounded-md font-medium transition-colors border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-gray-50 dark:hover:bg-gray-800"
                      onClick={() => handlePreviewTemplate(template)}
                    >
                      <MdVisibility size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination - Only show if we have multiple pages */}
        {!loading && pagination.pages > 1 && (
          <div className="mt-6">
            <Pagination
              current={pagination.page}
              total={pagination.total}
              limit={pagination.limit}
              onChange={(page) => setPagination((prev) => ({ ...prev, page }))}
              darkMode={darkMode}
            />
          </div>
        )}

        {/* Mobile Filters Drawer */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-[1050]">
            <div className="fixed inset-0 bg-black/50" onClick={() => setShowMobileFilters(false)} />
            <div className="fixed top-0 right-0 h-full w-80 bg-[var(--light-card)] dark:bg-[var(--dark-card)] shadow-xl overflow-y-auto">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                <h5 className="font-semibold flex items-center gap-2 m-0">
                  <MdFilterList />
                  Filter Templates
                </h5>
                <button onClick={() => setShowMobileFilters(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl">&times;</button>
              </div>
              <div className="p-4">
                <div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 text-[var(--light-text)] dark:text-[var(--dark-text)]">Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-sm"
                    >
                      {categoryOptions.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 text-[var(--light-text)] dark:text-[var(--dark-text)]">Language</label>
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-sm"
                    >
                      <option value="all">All Languages</option>
                      <option value="english">English</option>
                      <option value="arabic">Arabic</option>
                    </select>
                  </div>

                  {/* ✅ NEW: Status Filter in Mobile - Show only for Admin */}
                  {user?.role === 'admin' && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-1 text-[var(--light-text)] dark:text-[var(--dark-text)]">Status</label>
                      <StatusFilter
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                      />
                    </div>
                  )}

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 text-[var(--light-text)] dark:text-[var(--dark-text)]">Sort by</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-sm"
                    >
                      <option value="popular">Most Popular</option>
                      <option value="rating">Highest Rated</option>
                      <option value="newest">Newest</option>
                      <option value="alphabetical">A-Z</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <button
                      className="w-full px-4 py-2 rounded-md font-medium transition-colors border border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-[var(--primary-color)] hover:text-white text-sm"
                      onClick={() => {
                        handleClearFilters();
                        setShowMobileFilters(false);
                      }}
                    >
                      Clear All Filters
                    </button>
                    <button
                      className="w-full px-4 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)] text-sm"
                      onClick={() => setShowMobileFilters(false)}
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <span className="inline-block w-8 h-8 border-3 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin mb-3" />
            <div className="mt-3">
              <h5>Loading Templates from Database...</h5>
              <p className="text-muted">Fetching real templates from backend</p>
            </div>
          </div>
        )}

        {/* No Results - When database is empty or no matches */}
        {!loading && templates.length === 0 && (
          <div>
            <div>
              <div className="text-center py-5">
                <MdSearch size={64} className="text-muted mb-3" />
                <h5>No templates found</h5>
                <p className="text-muted mb-4">
                  {searchTerm || selectedCategory !== "all" || selectedLanguage !== "all" || selectedStatus !== "all"
                    ? `No templates match your search criteria. Try different filters.`
                    : "No templates available in the database. Please run the seeder or create templates."}
                </p>
                <button className="inline-flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors border border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-[var(--primary-color)] hover:text-white text-sm" onClick={handleClearFilters}>
                  <MdFilterList />
                  Show All Templates
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Template Preview Modal */}
        {showPreviewModal && (
          <div className="fixed inset-0 z-[1050] flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50" onClick={() => setShowPreviewModal(false)} />
            <div className="relative bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto border border-[var(--light-border)] dark:border-[var(--dark-border)]">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                <h5 className="font-semibold flex items-center gap-2 m-0">
                  <MdVisibility />
                  Template Preview - {selectedTemplate?.name}
                </h5>
                <button onClick={() => setShowPreviewModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl">&times;</button>
              </div>
              {/* Body */}
              <div className="px-6 py-4">
                {selectedTemplate && (
                  <div>
                    <div className="mb-4">
                      <div className="flex items-center mb-3 gap-2">
                        {getCategoryBadge(selectedTemplate.category)}
                        {/* ✅ NEW: Status Badge in Preview */}
                        {user?.role === 'admin' && (
                          <StatusBadge status={selectedTemplate.status} />
                        )}
                        <h4 className="ml-3 mb-0 text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">{selectedTemplate.name}</h4>
                      </div>
                      <p className="text-[var(--light-muted)] dark:text-[var(--dark-muted)]">{selectedTemplate.description}</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      <div className="text-center p-3 bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] rounded-md">
                        <MdDescription size={24} className="text-[var(--primary-color)] mb-2 mx-auto" />
                        <div className="font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">
                          {selectedTemplate.questions?.length || 0}
                        </div>
                        <small className="text-[var(--light-muted)] dark:text-[var(--dark-muted)]">Questions</small>
                      </div>
                      <div className="text-center p-3 bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] rounded-md">
                        <FaClock size={20} className="text-green-500 mb-2 mx-auto" />
                        <div className="font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">
                          {selectedTemplate.estimatedTime}
                        </div>
                        <small className="text-[var(--light-muted)] dark:text-[var(--dark-muted)]">Duration</small>
                      </div>
                      <div className="text-center p-3 bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] rounded-md">
                        <MdStar size={24} className="text-yellow-500 mb-2 mx-auto" />
                        <div className="font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">
                          {selectedTemplate.rating}/5.0
                        </div>
                        <small className="text-[var(--light-muted)] dark:text-[var(--dark-muted)]">Rating</small>
                      </div>
                      <div className="text-center p-3 bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] rounded-md">
                        <FaUsers size={20} className="text-blue-500 mb-2 mx-auto" />
                        <div className="font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">
                          {selectedTemplate.usageCount?.toLocaleString()}
                        </div>
                        <small className="text-[var(--light-muted)] dark:text-[var(--dark-muted)]">Used</small>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h6 className="mb-3 text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">Sample Questions Preview:</h6>
                      <div className="bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] p-3 rounded-md">
                        {(
                          selectedTemplate.sampleQuestions ||
                          selectedTemplate.questions?.slice(0, 3) ||
                          []
                        ).map((question, index) => (
                          <div key={index} className="mb-3">
                            <strong className="text-[var(--light-text)] dark:text-[var(--dark-text)]">
                              {index + 1}. {question.questionText}
                            </strong>
                            <p className="mb-0 text-[var(--light-muted)] dark:text-[var(--dark-muted)] text-sm">
                              Type: {question.type} {question.required && "(Required)"}
                            </p>
                            {question.options && question.options.length > 0 && (
                              <p className="mb-0 text-[var(--light-muted)] dark:text-[var(--dark-muted)] text-sm">
                                Options: {question.options.join(", ")}
                              </p>
                            )}
                          </div>
                        ))}
                        {selectedTemplate.questions?.length > 3 && (
                          <div className="mt-3 text-center">
                            <small className="text-[var(--light-muted)] dark:text-[var(--dark-muted)]">
                              ... and {selectedTemplate.questions.length - 3} more questions
                            </small>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h6 className="mb-2 text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">Available Languages:</h6>
                      <div className="flex gap-2">
                        {Array.isArray(selectedTemplate.language) ? (
                          selectedTemplate.language.map((lang, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                            >
                              <FaLanguage size={12} />
                              {lang}
                            </span>
                          ))
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">English</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {/* Footer */}
              <div className="flex justify-end gap-2 px-6 py-4 border-t border-[var(--light-border)] dark:border-[var(--dark-border)]">
                <button
                  className="px-4 py-2 rounded-md font-medium transition-colors border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
                  onClick={() => setShowPreviewModal(false)}
                >
                  Close
                </button>

                {user?.role === 'admin' ? (
                  <button
                    className="px-4 py-2 rounded-md font-medium bg-[var(--primary-color)] text-white inline-flex items-center gap-2 text-sm"
                    disabled
                    style={{ cursor: 'none', opacity: 0.6 }}
                  >
                    <MdAdd /> Use Template
                  </button>
                ) : (
                  <button
                    className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)] inline-flex items-center gap-2 text-sm"
                    onClick={() => {
                      setShowPreviewModal(false);
                      handleUseTemplate(selectedTemplate);
                    }}
                  >
                    <MdAdd /> Use This Template
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SurveyTemplates;