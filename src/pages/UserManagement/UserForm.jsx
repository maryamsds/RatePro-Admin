// src/pages/UserManagement/UserForm.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Row, Col, Card, Form, Button, Spinner } from "react-bootstrap";
import Select from "react-select"; // <-- ADD THIS
import Swal from "sweetalert2";
import {
  MdSave,
  MdArrowBack,
  MdVisibility,
  MdVisibilityOff,
  MdPerson,
  MdEmail,
  MdBusiness,
  MdGroup,
  MdKey,
  MdToggleOn,
  MdToggleOff,
  MdCheckCircle,
  MdError,
  MdInfo,
  MdCategory // <-- NEW ICON
} from "react-icons/md";
import { updateUser, getUserById, axiosInstance } from "../../api/axiosInstance";
import { createUser } from "../../api/createUser";
import { useAuth } from "../../context/AuthContext";

const UserForm = () => {
  const navigate = useNavigate();
  const { user: currentUser, hasPermission } = useAuth();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    isActive: "true",
    tenantName: "",
    tenantId: "",
    departments: [],
    departmentId: "",
    userCategories: [], // <-- NEW
    userCategoryIds: [] // <-- NEW: for API
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formChanged, setFormChanged] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [validationState, setValidationState] = useState({});
  const [categoryOptions, setCategoryOptions] = useState([]); // <-- NEW

  const currentUserRole = currentUser?.role || "";
  const memberCanCreate = hasPermission("user:create");
  const memberCanUpdate = hasPermission("user:update");

  // === FETCH USER CATEGORIES ===
  const fetchUserCategories = async (tenantId) => {
    try {
      const res = await axiosInstance.get(`/user-categories?tenantId=${tenantId}`);

      let categoriesData = [];
      if (Array.isArray(res?.data?.categories)) {
        categoriesData = res.data.categories;
      } else if (Array.isArray(res?.data)) {
        categoriesData = res.data;
      } else if (Array.isArray(res?.data?.data)) {
        // sometimes backend sends { data: [...] }
        categoriesData = res.data.data;
      }

      const options = categoriesData.map(cat => ({
        value: cat._id,
        label: cat.name,
        type: cat.type
      }));

      setCategoryOptions(options);
    } catch (err) {
      console.error("Failed to load user categories:", err);
      Swal.fire("Error", "Could not load user categories", "error");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: "" }));
    setFormChanged(true);

    // Real-time validation
    if (name === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setValidationState(prev => ({ ...prev, [name]: emailRegex.test(value) ? 'valid' : 'invalid' }));
    } else if (name === 'password' && value) {
      setValidationState(prev => ({ ...prev, [name]: value.length >= 8 ? 'valid' : 'invalid' }));
    } else if (value.trim()) {
      setValidationState(prev => ({ ...prev, [name]: 'valid' }));
    } else {
      setValidationState(prev => ({ ...prev, [name]: '' }));
    }
  };

  // === HANDLE CATEGORY SELECT ===
  const handleCategoryChange = (selected) => {
    const ids = selected.map(opt => opt.value);
    const labels = selected.map(opt => opt.label);
    setUser(prev => ({
      ...prev,
      userCategoryIds: ids,
      userCategories: labels
    }));
    setFormChanged(true);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!user.name.trim()) newErrors.name = "Name is required";
    if (!user.email.trim()) newErrors.email = "Email is required";
    if (!isEditMode && !user.password.trim()) newErrors.password = "Password is required";
    if (!user.role) newErrors.role = "Role is required";
    if (user.isActive === undefined || user.isActive === null) newErrors.isActive = "Status is required";

    if (currentUserRole === "admin" && user.role === "companyAdmin" && !user.tenantName.trim())
      newErrors.tenantName = "Company name is required";

    if ((currentUserRole === "companyAdmin" || (currentUserRole === "member" && user.role === "member")) && !user.departmentId)
      newErrors.departmentId = "Department is required";

    // NEW: Category validation for member
    if (user.role === "member" && user.userCategoryIds.length === 0) {
      newErrors.userCategories = "At least one category is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchTenantData = async (tenantId) => {
    try {
      const res = await axiosInstance.get(`/tenants/${tenantId}`, { withCredentials: true });
      const tenant = res.data.tenant;
      setUser(prev => ({
        ...prev,
        tenantId: tenant._id,
        tenantName: tenant.name || "",
        departments: tenant.departments || [],
      }));
      // Fetch categories
      await fetchUserCategories(tenant._id);
    } catch (err) {
      console.error("fetchTenantData error:", err);
      Swal.fire("Error", "Failed to load tenant data", "error");
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;
      try {
        const res = await getUserById(id);
        const userData = res.data.user;

        let tenantName = "", departments = [], tenantId = "", departmentId = "", categoryIds = [];

        if (userData.tenant && typeof userData.tenant === 'object') {
          tenantName = userData.tenant.name || "";
          tenantId = userData.tenant._id?.toString() || "";
          departments = userData.tenant.departments?.map(dept => ({
            _id: dept._id?.toString(),
            name: dept.name
          })) || [];
          departmentId = userData.department?._id?.toString() || "";
        }

        // Load user categories
        if (userData.userCategories && Array.isArray(userData.userCategories)) {
          categoryIds = userData.userCategories.map(c => c._id?.toString()).filter(Boolean);
        }

        setUser({
          _id: userData._id,
          name: userData.name || "",
          email: userData.email || "",
          password: "",
          role: userData.role || "",
          isActive: userData.isActive?.toString() || "true",
          tenantId,
          tenantName,
          departments,
          departmentId,
          userCategoryIds: categoryIds,
          userCategories: userData.userCategories?.map(c => c.name) || []
        });

        // Fetch categories for edit mode
        if (tenantId) await fetchUserCategories(tenantId);

      } catch (err) {
        console.error("Error loading user:", err);
        Swal.fire("Error", err.response?.data?.message || "Failed to load user", "error");
        navigate("/app/users", { replace: true });
      }
    };

    if (isEditMode) fetchUser();
  }, [id, navigate, isEditMode]);

  useEffect(() => {
    if (!isEditMode && (currentUserRole === "companyAdmin" || currentUserRole === "member")) {
      const tenantId = currentUser?.tenant?._id || currentUser?.tenant;
      if (tenantId) {
        fetchTenantData(tenantId);
      }
    }
  }, [isEditMode, currentUserRole, currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      Swal.fire({ icon: "error", title: "Validation Error", text: "Please fix all errors." });
      return;
    }

    if (!isEditMode && currentUserRole === "member" && !memberCanCreate) {
      return Swal.fire("Forbidden", "You don't have permission to create users", "error");
    }
    if (isEditMode && currentUserRole === "member" && !memberCanUpdate) {
      return Swal.fire("Forbidden", "You don't have permission to update users", "error");
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: user.name,
        email: user.email,
        password: user.password || undefined,
        role: user.role,
        isActive: user.isActive === "true"
      };

      if (currentUserRole === "admin" && user.role === "companyAdmin") {
        payload.tenantName = user.tenantName;
      } else if (user.role === "member") {
        payload.department = user.departmentId;
        payload.userCategories = user.userCategoryIds; // <-- SEND IDS
      }

      if (isEditMode) {
        const updates = {};
        if (user.name !== user.originalName) updates.name = user.name;
        if (user.departmentId !== user.originalDepartmentId) updates.department = user.departmentId;
        if (user.isActive !== user.originalIsActive) updates.isActive = user.isActive === "true";
        if (JSON.stringify(user.userCategoryIds) !== JSON.stringify(user.originalCategoryIds || [])) {
          updates.userCategories = user.userCategoryIds;
        }
        if (Object.keys(updates).length === 0) {
          Swal.fire({ icon: "info", title: "No changes" });
          return;
        }
        await updateUser(id, updates);
        Swal.fire({ icon: "success", title: "User Updated" });
      } else {
        await createUser(payload);
        Swal.fire({ icon: "success", title: "User Created" });
      }

      navigate("/app/users", { state: { refresh: true }, replace: true });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: error.response?.data?.message || "Operation failed"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // === REACT-SELECT STYLES ===
  const selectStyles = {
    control: (base) => ({ ...base, minHeight: 48, borderRadius: 8 }),
    menu: (base) => ({ ...base, zIndex: 9999 })
  };

  return (
    <div className="user-form-container">
      {/* ... HEADER SAME ... */}

      <div className="form-content">
        <div className="form-wrapper">
          <Form onSubmit={handleSubmit} className="user-form">
            {/* BASIC INFO - SAME */}
            <div className="form-section animate-slide-up" style={{ '--delay': '0.1s' }}>
              <div className="section-header">
                <div className="section-icon">
                  <MdPerson />
                </div>
                <div>
                  <h3 className="section-title" style={{ color: '#1fdae4' }}>Basic Information</h3>
                  <p className="section-subtitle">Personal details and identification</p>
                </div>
              </div>

              <div className="section-content">
                <Row className="g-3">
                  {isEditMode && (
                    <Col md={6}>
                      <div className="form-group">
                        <label className="form-label">User ID</label>
                        <div className="input-wrapper">
                          <Form.Control
                            type="text"
                            value={user._id || ""}
                            disabled
                            className="form-input disabled"
                          />
                        </div>
                      </div>
                    </Col>
                  )}

                  <Col md={isEditMode ? 6 : 12}>
                    <div className="form-group">
                      <label className="form-label required">Full Name</label>
                      <div className={`input-wrapper ${validationState.name ? 'has-validation' : ''}`}>
                        <MdPerson className="input-icon" />
                        <Form.Control
                          type="text"
                          name="name"
                          autoComplete="name"
                          value={user.name}
                          onChange={handleChange}
                          placeholder="Enter full name"
                          className={`form-input ${validationState.name === 'valid' ? 'is-valid' :
                            validationState.name === 'invalid' ? 'is-invalid' : ''
                            }`}
                        />
                        {validationState.name === 'valid' && (
                          <MdCheckCircle className="validation-icon valid" />
                        )}
                        {validationState.name === 'invalid' && (
                          <MdError className="validation-icon invalid" />
                        )}
                      </div>
                      {errors.name && <div className="field-error">{errors.name}</div>}
                    </div>
                  </Col>
                </Row>
              </div>
            </div>
            {/* ACCOUNT INFO - SAME */}
            <div className="form-section animate-slide-up" style={{ '--delay': '0.2s' }}>
              <div className="section-header">
                <div className="section-icon">
                  <MdKey />
                </div>
                <div>
                  <h3 className="section-title" style={{ color: '#1fdae4' }}>Account Information</h3>
                  <p className="section-subtitle">Login credentials and access details</p>
                </div>
              </div>

              <div className="section-content">
                <Row className="g-3">
                  <Col md={6}>
                    <div className="form-group">
                      <label className="form-label required">Email Address</label>
                      <div className={`input-wrapper ${validationState.email ? 'has-validation' : ''}`}>
                        <MdEmail className="input-icon" />
                        <Form.Control
                          type="email"
                          name="email"
                          autoComplete="email"
                          value={user.email}
                          onChange={handleChange}
                          placeholder={isEditMode ? user.email : "user@example.com"}
                          disabled={isEditMode}
                          className={`form-input ${isEditMode ? 'disabled' : ''
                            } ${validationState.email === 'valid' ? 'is-valid' :
                              validationState.email === 'invalid' ? 'is-invalid' : ''
                            }`}
                        />
                        {!isEditMode && validationState.email === 'valid' && (
                          <MdCheckCircle className="validation-icon valid" />
                        )}
                        {!isEditMode && validationState.email === 'invalid' && (
                          <MdError className="validation-icon invalid" />
                        )}
                      </div>
                      {errors.email && <div className="field-error">{errors.email}</div>}
                      {isEditMode && (
                        <div className="field-help">Email cannot be changed after registration</div>
                      )}
                    </div>
                  </Col>

                  <Col md={6}>
                    <div className="form-group">
                      <label className="form-label required">Password</label>
                      <div className={`input-wrapper password-wrapper ${validationState.password ? 'has-validation' : ''}`}>
                        <MdKey className="input-icon" />
                        <Form.Control
                          type={showPassword ? "text" : "password"}
                          name="password"
                          autoComplete="new-password"
                          value={user.password}
                          onChange={handleChange}
                          placeholder={isEditMode ? "Password unchanged" : "Minimum 8 characters"}
                          disabled={isEditMode}
                          className={`form-input password-input ${isEditMode ? 'disabled' : ''
                            } ${validationState.password === 'valid' ? 'is-valid' :
                              validationState.password === 'invalid' ? 'is-invalid' : ''
                            }`}
                        />
                        {!isEditMode && (
                          <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                          </button>
                        )}
                        {!isEditMode && validationState.password === 'valid' && (
                          <MdCheckCircle className="validation-icon valid with-toggle" />
                        )}
                        {!isEditMode && validationState.password === 'invalid' && (
                          <MdError className="validation-icon invalid with-toggle" />
                        )}
                      </div>
                      {errors.password && <div className="field-error">{errors.password}</div>}
                      {!isEditMode && (
                        <div className="field-help">Must be at least 8 characters long</div>
                      )}
                      {isEditMode && (
                        <div className="field-help">Leave empty to keep current password</div>
                      )}
                    </div>
                  </Col>
                </Row>
              </div>
            </div>
            {/* ROLE & STATUS - SAME */}
            <div className="form-section animate-slide-up" style={{ '--delay': '0.3s' }}>
              <div className="section-header">
                <div className="section-icon">
                  <MdGroup />
                </div>
                <div>
                  <h3 className="section-title" style={{ color: '#1fdae4' }}>Role & Permissions</h3>
                  <p className="section-subtitle">User access level and account status</p>
                </div>
              </div>

              <div className="section-content">
                <Row className="g-3">
                  <Col md={6}>
                    <div className="form-group">
                      <label className="form-label required">User Role</label>
                      <div className="input-wrapper">
                        <MdGroup className="input-icon" />
                        <Form.Select
                          name="role"
                          value={user.role}
                          onChange={handleChange}
                          autoComplete="off"
                          className="form-input form-select"
                        >
                          <option value="">Select Role</option>
                          {currentUserRole === "admin" && (
                            <>
                              <option value="companyAdmin">Company Admin</option>
                              <option value="user">User</option>
                            </>
                          )}
                          {(currentUserRole === "companyAdmin" || memberCanCreate) && (
                            <option value="member">Member</option>
                          )}
                        </Form.Select>
                      </div>
                      {errors.role && <div className="field-error">{errors.role}</div>}
                      <div className="field-help">
                        {user.role === 'companyAdmin' && 'Full administrative access to company resources'}
                        {user.role === 'member' && 'Limited access based on department permissions'}
                        {user.role === 'user' && 'Standard user with basic permissions'}
                        {!user.role && 'Select the appropriate role for this user'}
                      </div>
                    </div>
                  </Col>

                  <Col md={6}>
                    <div className="form-group">
                      <label className="form-label required">Account Status</label>
                      <div className="status-toggle-wrapper">
                        <div className="status-options">
                          <div
                            className={`status-option ${user.isActive === 'true' ? 'active' : ''}`}
                            onClick={() => {
                              setUser(prev => ({ ...prev, isActive: 'true' }));
                              setFormChanged(true);
                            }}
                          >
                            <div className="status-icon active">
                              <MdToggleOn />
                            </div>
                            <div className="status-content">
                              <div className="status-label">Active</div>
                              <div className="status-description">User can login and access system</div>
                            </div>
                          </div>

                          <div
                            className={`status-option ${user.isActive === 'false' ? 'active' : ''}`}
                            onClick={() => {
                              setUser(prev => ({ ...prev, isActive: 'false' }));
                              setFormChanged(true);
                            }}
                          >
                            <div className="status-icon inactive">
                              <MdToggleOff />
                            </div>
                            <div className="status-content">
                              <div className="status-label">Inactive</div>
                              <div className="status-description">User login is disabled</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      {errors.isActive && <div className="field-error">{errors.isActive}</div>}
                    </div>
                  </Col>
                </Row>
              </div>
            </div>

            {/* COMPANY INFO - SAME */}
            {currentUserRole === "admin" && user.role === "companyAdmin" && (
              <div className="form-section animate-slide-up" style={{ '--delay': '0.4s' }}>
                <div className="section-header">
                  <div className="section-icon">
                    <MdBusiness />
                  </div>
                  <div>
                    <h3 className="section-title" style={{ color: '#1fdae4' }}>Company Information</h3>
                    <p className="section-subtitle">Organization details for company admin</p>
                  </div>
                </div>

                <div className="section-content">
                  <Row className="g-3">
                    <Col md={6}>
                      <div className="form-group">
                        <label className="form-label required">Company Name</label>
                        <div className="input-wrapper">
                          <MdBusiness className="input-icon" />
                          <Form.Control
                            type="text"
                            name="tenantName"
                            value={user.tenantName}
                            onChange={handleChange}
                            placeholder="e.g. Acme Corp"
                            className="form-input"
                          />
                        </div>
                        {errors.tenantName && <div className="field-error">{errors.tenantName}</div>}
                        <div className="field-help">This will create a new company organization</div>
                      </div>
                    </Col>
                  </Row>
                </div>
              </div>
            )}

            {/* ORGANIZATION ASSIGNMENT - UPDATED */}
            {(currentUserRole === "companyAdmin" || memberCanCreate) && user.role === "member" && (
              <div className="form-section animate-slide-up" style={{ '--delay': '0.5s' }}>
                <div className="section-header">
                  <div className="section-icon">
                    <MdBusiness />
                  </div>
                  <div>
                    <h3 className="section-title" style={{ color: '#1fdae4' }}>Assignment</h3>
                    <p className="section-subtitle">Department & Categories</p>
                  </div>
                </div>

                <div className="section-content">
                  <Row className="g-3">
                    <Col md={6}>
                      <div className="form-group">
                        <label className="form-label required">Department</label>
                        <div className="input-wrapper">
                          <MdGroup className="input-icon" />
                          <Form.Select
                            name="departmentId"
                            value={user.departmentId}
                            onChange={handleChange}
                            className="form-input form-select"
                          >
                            <option value="">Select Department</option>
                            {user.departments.map(dept => (
                              <option key={dept._id} value={dept._id}>{dept.name}</option>
                            ))}
                          </Form.Select>
                        </div>
                        {errors.departmentId && <div className="field-error">{errors.departmentId}</div>}
                      </div>
                    </Col>

                    {/* NEW: USER CATEGORIES */}
                    <Col md={6}>
                      <div className="form-group">
                        <label className="form-label required">User Categories</label>
                        <div className="input-wrapper">
                          <MdCategory className="input-icon" />
                          <Select
                            isMulti
                            options={categoryOptions}
                            value={categoryOptions.filter(opt => user.userCategoryIds.includes(opt.value))}
                            onChange={handleCategoryChange}
                            placeholder="Select categories..."
                            styles={selectStyles}
                            className="react-select-container"
                            classNamePrefix="react-select"
                          />
                        </div>
                        {errors.userCategories && <div className="field-error">{errors.userCategories}</div>}
                        <div className="field-help">Assign user to Vendor, Customer, Partner, etc.</div>
                      </div>
                    </Col>
                  </Row>
                </div>
              </div>
            )}

            {/* FORM ACTIONS - SAME */}
            <div className="form-actions animate-slide-up" style={{ '--delay': '0.6s' }}>
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
                    onClick={() => navigate("/app/users", { replace: true })}
                    disabled={isSubmitting}
                    className="cancel-btn"
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting || (!formChanged && isEditMode)}
                    className={`submit-btn ${isSubmitting ? 'submitting' : ''}`}
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner size="sm" className="me-2" animation="border" />
                        {isEditMode ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        <MdSave className="me-2" />
                        {isEditMode ? "Update User" : "Create User"}
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

export default UserForm;