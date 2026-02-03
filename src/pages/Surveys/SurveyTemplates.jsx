import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Button,
  Badge,
  Form,
  InputGroup,
  Modal,
  Spinner,
  Offcanvas,
  Dropdown,
} from "react-bootstrap";
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
} from "react-icons/md";
import { FaUsers, FaClock, FaLanguage } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import Pagination from "../../components/Pagination/Pagination";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import axiosInstance from "../../api/axiosInstance.js";
import useDropdownOptions from "../../hooks/useDropdownOptions.js";

const SurveyTemplates = ({ darkMode }) => {
  const navigate = useNavigate();
  const { setGlobalLoading, user } = useAuth();

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

    return (
      <Badge bg={config.variant} className="d-flex align-items-center gap-1">
        <StatusIcon size={12} />
        {config.label}
      </Badge>
    );
  };

  // ✅ STATUS FILTER COMPONENT 
  const StatusFilter = ({ value, onChange }) => (
    <Form.Select value={value} onChange={onChange} size="sm">
      <option value="all">All Status</option>
      <option value="draft">Draft</option>
      <option value="published">Published</option>
      <option value="active">Active</option>
      <option value="archived">Archived</option>
    </Form.Select>
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
      return <Badge bg="secondary">{categoryId || "General"}</Badge>;
    }

    const categoryColor = category.color || "#6c757d";

    return (
      <Badge
        bg="light"
        text="dark"
        style={{
          backgroundColor: `${categoryColor}20`,
          color: categoryColor,
          border: `1px solid ${categoryColor}40`,
        }}
      >
        {category.name}
      </Badge>
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
    <div className="survey-templates-container">
      <Container fluid>
        {/* Header Section */}
        <div className="templates-header">
          <div className="d-flex align-items-center justify-content-between flex-wrap mb-3">
            <div className="header-content">
              <div className="d-flex align-items-center mb-2">
                <MdDescription
                  className="me-2"
                  style={{ color: "var(--primary-color, #1fdae4)" }}
                  size={28}
                />
                <h1 className="h4 mb-0 fw-bold">Survey Templates</h1>
              </div>
              <p className="text-muted mb-0 d-none d-sm-block">
                Choose from {stats.total} professional templates across{" "}
                {stats.categories} industries
              </p>
            </div>

            {/* Create Template Button - Show only for Admin */}
            {user?.role === 'admin' && (
              <Button
                variant="outline-primary"
                className="d-flex align-items-center create-template-btn"
                onClick={handleCreateTemplate}
                size="sm"
              >
                <MdAdd className="me-1 me-sm-2" size={16} />
                <span className="d-none d-sm-inline">Create Template</span>
                <span className="d-sm-none">Create</span>
              </Button>
            )}
          </div>

          {/* Quick Stats */}
          <div className="stats-container d-flex gap-2 flex-wrap mb-3">
            <div className="stat-badge">
              <MdStar className="me-1" size={14} />
              <span>{stats.total} Templates</span>
            </div>
            <div className="stat-badge">
              <MdCategory className="me-1" size={14} />
              <span>{stats.categories} Categories</span>
            </div>
            {user?.role === 'admin' && (
              <>
                <div className="stat-badge">
                  <MdPublish className="me-1" size={14} />
                  <span>{stats.published} Published</span>
                </div>
                <div className="stat-badge">
                  <MdSave className="me-1" size={14} />
                  <span>{stats.draft} Draft</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="search-filters-section">
          {/* Search Bar */}
          <div className="search-container mb-3">
            <InputGroup className="search-input-group">
              <InputGroup.Text>
                <MdSearch size={18} />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {/* Mobile Filter Button */}
              <Button
                variant="outline-secondary"
                className="d-lg-none filter-toggle-btn"
                onClick={() => setShowMobileFilters(true)}
              >
                <MdFilterList size={18} />
                <span className="ms-1">Filter</span>
              </Button>
            </InputGroup>
          </div>

          {/* Desktop Filters */}
          <div className="d-none d-lg-flex filters-row align-items-center gap-3">
            <div className="filter-group">
              <label className="filter-label">Category</label>
              <Form.Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="filter-select"
                size="sm"
              >
                {categoryOptions.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </Form.Select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Language</label>
              <Form.Select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="filter-select"
                size="sm"
              >
                <option value="all">All Languages</option>
                <option value="english">English</option>
                <option value="arabic">Arabic</option>
              </Form.Select>
            </div>

            {/* ✅ NEW: Status Filter - Show only for Admin */}
            {user?.role === 'admin' && (
              <div className="filter-group">
                <label className="filter-label">Status</label>
                <StatusFilter
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                />
              </div>
            )}

            <div className="filter-group">
              <label className="filter-label">Sort by</label>
              <Form.Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
                size="sm"
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest</option>
                <option value="alphabetical">A-Z</option>
              </Form.Select>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        {(searchTerm || selectedCategory !== "all" || selectedLanguage !== "all" || selectedStatus !== "all") && (
          <div className="results-summary d-flex align-items-center justify-content-between flex-wrap mb-3">
            <div className="results-info">
              <span className="results-count">{templates.length}</span>
              <span className="text-muted ms-1">
                of {pagination.total} templates
              </span>
              {searchTerm && (
                <span className="text-muted d-none d-sm-inline">
                  for "{searchTerm}"
                </span>
              )}
            </div>
            <Button
              variant="outline-secondary"
              size="sm"
              className="clear-filters-btn"
              onClick={handleClearFilters}
            >
              <span className="d-none d-sm-inline">Clear Filters</span>
              <span className="d-sm-none">Clear</span>
            </Button>
          </div>
        )}

        {/* ✅ TEMPLATES GRID - ONLY Backend Database Data */}
        {!loading && templates.length > 0 && (
          <div className="templates-grid">
            {templates.map((template) => (
              <div key={template._id} className="template-card-wrapper">
                <div className="template-card">
                  {/* Template Header */}
                  <div className="template-header d-flex justify-content-between align-items-start">
                    <div className="template-badges">
                      {getCategoryBadge(template.category)}
                      {/* ✅ NEW: Status Badge */}
                      {user?.role === 'admin' && (
                        <StatusBadge status={template.status} />
                      )}
                      {template.usageCount > 1000 && (
                        <div className="template-badge popular">
                          <MdStar size={12} />
                          <span>Popular</span>
                        </div>
                      )}
                      {template.isPremium && (
                        <div className="template-badge premium">
                          <span>Premium</span>
                        </div>
                      )}
                    </div>

                    {/* ✅ NEW: Admin Actions Dropdown - Edit Option Hide for Admin */}
                    {user?.role === 'admin' && (
                      <Dropdown className="template-actions-dropdown">
                        <Dropdown.Toggle variant="light" size="sm" className="p-1">
                          <MdMoreVert size={16} />
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          {/* ✅ EDIT OPTION - Hide for Admin */}
                          {user?.role == 'admin' && (
                            <Dropdown.Item onClick={() => handleEditTemplate(template)}>
                              <MdEdit className="me-2" />
                              Edit Template
                            </Dropdown.Item>
                          )}
                          <Dropdown.Item
                            onClick={() => toggleTemplateStatus(template._id, template.status)}
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
                          </Dropdown.Item>
                          <Dropdown.Item
                            onClick={() => handleDeleteTemplate(template._id)}>
                            <>
                              <MdDelete className="me-2" />
                              Delete
                            </>
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    )}
                  </div>

                  {/* Template Content - Direct from Database */}
                  <div className="template-content">
                    <h5 className="template-title">{template.name}</h5>
                    <p className="template-description">
                      {template.description}
                    </p>
                  </div>

                  {/* Template Stats - Direct from Database */}
                  <div className="template-stats">
                    <div className="stats-row">
                      <div className="stat-item">
                        <FaUsers size={12} />
                        <span>
                          {template.usageCount > 1000
                            ? `${Math.round(template.usageCount / 1000)}k`
                            : template.usageCount}
                        </span>
                      </div>
                      <div className="stat-item">
                        <FaClock size={12} />
                        <span>{template.estimatedTime}</span>
                      </div>
                      <div className="stat-item">
                        <MdDescription size={12} />
                        <span>{template.questions?.length || 0} Q</span>
                      </div>
                      <div className="stat-item">
                        <MdStar size={12} />
                        <span>{template.rating}</span>
                      </div>
                    </div>

                    {/* Language Support - Direct from Database */}
                    <div className="template-languages">
                      <FaLanguage size={12} />
                      <span>
                        {Array.isArray(template.language)
                          ? template.language.join(", ")
                          : "English"}
                      </span>
                    </div>
                  </div>

                  {/* Template Actions */}
                  <div className="template-actions">
                    <Button
                      variant="primary"
                      className="use-template-btn"
                      onClick={() => handleUseTemplate(template)}
                      disabled={
                        // ✅ Agar admin hai aur template status draft hai to disabled
                        (user?.role === 'admin' && template.status === 'draft') ||
                        // ✅ Agar admin hai to directly disable karein 
                        user?.role === 'admin'
                      }
                      title={
                        user?.role === 'admin'
                          ? "Admins cannot use templates. Create surveys directly instead."
                          : "Use this template to create a survey"
                      }
                    >
                      <MdAdd size={16} />
                      <span>
                        {user?.role === 'admin' ? 'Use Template' : 'Use Template'}
                      </span>
                    </Button>

                    <Button
                      variant="outline-secondary"
                      className="preview-btn"
                      onClick={() => handlePreviewTemplate(template)}
                    >
                      <MdVisibility size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination - Only show if we have multiple pages */}
        {!loading && pagination.pages > 1 && (
          <div className="pagination-container">
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
        <Offcanvas
          show={showMobileFilters}
          onHide={() => setShowMobileFilters(false)}
          placement="end"
          className="mobile-filters-drawer"
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>
              <MdFilterList className="me-2" />
              Filter Templates
            </Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <div className="mobile-filters">
              <div className="filter-section">
                <label className="filter-label">Category</label>
                <Form.Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="filter-select mb-3"
                >
                  {categoryOptions.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </Form.Select>
              </div>

              <div className="filter-section">
                <label className="filter-label">Language</label>
                <Form.Select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="filter-select mb-3"
                >
                  <option value="all">All Languages</option>
                  <option value="english">English</option>
                  <option value="arabic">Arabic</option>
                </Form.Select>
              </div>

              {/* ✅ NEW: Status Filter in Mobile - Show only for Admin */}
              {user?.role === 'admin' && (
                <div className="filter-section">
                  <label className="filter-label">Status</label>
                  <StatusFilter
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  />
                </div>
              )}

              <div className="filter-section">
                <label className="filter-label">Sort by</label>
                <Form.Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="filter-select mb-3"
                >
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest</option>
                  <option value="alphabetical">A-Z</option>
                </Form.Select>
              </div>

              <div className="filter-actions">
                <Button
                  variant="outline-secondary"
                  className="w-100 mb-2"
                  onClick={() => {
                    handleClearFilters();
                    setShowMobileFilters(false);
                  }}
                >
                  Clear All Filters
                </Button>
                <Button
                  variant="primary"
                  className="w-100"
                  onClick={() => setShowMobileFilters(false)}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </Offcanvas.Body>
        </Offcanvas>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <div className="mt-3">
              <h5>Loading Templates from Database...</h5>
              <p className="text-muted">Fetching real templates from backend</p>
            </div>
          </div>
        )}

        {/* No Results - When database is empty or no matches */}
        {!loading && templates.length === 0 && (
          <Row>
            <Col>
              <div className="text-center py-5">
                <MdSearch size={64} className="text-muted mb-3" />
                <h5>No templates found</h5>
                <p className="text-muted mb-4">
                  {searchTerm || selectedCategory !== "all" || selectedLanguage !== "all" || selectedStatus !== "all"
                    ? `No templates match your search criteria. Try different filters.`
                    : "No templates available in the database. Please run the seeder or create templates."}
                </p>
                <Button variant="outline-primary" onClick={handleClearFilters}>
                  <MdFilterList className="me-2" />
                  Show All Templates
                </Button>
              </div>
            </Col>
          </Row>
        )}

        {/* Template Preview Modal */}
        <Modal
          show={showPreviewModal}
          onHide={() => setShowPreviewModal(false)}
          size="lg"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title className="d-flex align-items-center">
              <MdVisibility className="me-2" />
              Template Preview - {selectedTemplate?.name}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedTemplate && (
              <div>
                <div className="mb-4">
                  <div className="d-flex align-items-center mb-3">
                    {getCategoryBadge(selectedTemplate.category)}
                    {/* ✅ NEW: Status Badge in Preview */}
                    {user?.role === 'admin' && (
                      <StatusBadge status={selectedTemplate.status} />
                    )}
                    <h4 className="ms-3 mb-0 text">{selectedTemplate.name}</h4>
                  </div>
                  <p className="text-muted">{selectedTemplate.description}</p>
                </div>

                <Row className="mb-4">
                  <Col md={3}>
                    <div className="text-center p-3 bg-light rounded">
                      <MdDescription size={24} className="text-primary mb-2" />
                      <div className="fw-semibold text">
                        {selectedTemplate.questions?.length || 0}
                      </div>
                      <small className="text-muted">Questions</small>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="text-center p-3 bg-light rounded">
                      <FaClock size={20} className="text-success mb-2" />
                      <div className="fw-semibold text">
                        {selectedTemplate.estimatedTime}
                      </div>
                      <small className="text-muted">Duration</small>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="text-center p-3 bg-light rounded">
                      <MdStar size={24} className="text-warning mb-2" />
                      <div className="fw-semibold text">
                        {selectedTemplate.rating}/5.0
                      </div>
                      <small className="text-muted">Rating</small>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="text-center p-3 bg-light rounded">
                      <FaUsers size={20} className="text-info mb-2" />
                      <div className="fw-semibold text">
                        {selectedTemplate.usageCount?.toLocaleString()}
                      </div>
                      <small className="text-muted">Used</small>
                    </div>
                  </Col>
                </Row>

                <div className="mb-4">
                  <h6 className="mb-3 text">Sample Questions Preview:</h6>
                  <div className="bg-light p-3 rounded text">
                    {(
                      selectedTemplate.sampleQuestions ||
                      selectedTemplate.questions?.slice(0, 3) ||
                      []
                    ).map((question, index) => (
                      <div key={index} className="mb-3">
                        <strong>
                          {index + 1}. {question.questionText}
                        </strong>
                        <p className="mb-0 text-muted small">
                          Type: {question.type} {question.required && "(Required)"}
                        </p>
                        {question.options && question.options.length > 0 && (
                          <p className="mb-0 text-muted small">
                            Options: {question.options.join(", ")}
                          </p>
                        )}
                      </div>
                    ))}
                    {selectedTemplate.questions?.length > 3 && (
                      <div className="mt-3 text-center">
                        <small className="text-muted">
                          ... and {selectedTemplate.questions.length - 3} more questions
                        </small>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h6 className="mb-2 text">Available Languages:</h6>
                  <div className="d-flex gap-2">
                    {Array.isArray(selectedTemplate.language) ? (
                      selectedTemplate.language.map((lang, index) => (
                        <Badge
                          key={index}
                          bg="secondary"
                          className="d-flex align-items-center"
                        >
                          <FaLanguage className="me-1" size={12} />
                          {lang}
                        </Badge>
                      ))
                    ) : (
                      <Badge bg="secondary">English</Badge>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Modal.Body>

          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowPreviewModal(false)}
            >
              Close
            </Button>

            {user?.role === 'admin' ? (
              <Button
                variant="primary"
                disabled
                style={{ cursor: 'none', opacity: 0.6 }}
              >
                <MdAdd className="me-2" />
                Use Template
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={() => {
                  setShowPreviewModal(false);
                  handleUseTemplate(selectedTemplate);
                }}
              >
                <MdAdd className="me-2" />
                Use This Template
              </Button>
            )}
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default SurveyTemplates;