// src/components/UserForm.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Row, Col, Card, Form, Button, Spinner } from "react-bootstrap";
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
  MdInfo
} from "react-icons/md";
import { updateUser, getUserById, axiosInstance } from "../../api/axiosInstance";
import { createUser } from "../../api/createUser";
import { useAuth } from "../../context/AuthContext";


const UserForm = () => {
  const navigate = useNavigate();
  const { user: currentUser, hasPermission } = useAuth();
  const { id } = useParams(); // id may be undefined in create mode
  const isEditMode = Boolean(id);
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    isActive: "",
    tenantName: "", // Changed from companyName
    tenantId: "", // Changed from companyId
    departments: [],
    departmentId: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formChanged, setFormChanged] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [validationState, setValidationState] = useState({});
  const currentUserRole = currentUser?.role || "";
  const memberCanCreate = hasPermission("user:create");
  const memberCanUpdate = hasPermission("user:update");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setFormChanged(true);
    
    // Real-time validation feedback
    if (name === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setValidationState(prev => ({
        ...prev,
        [name]: emailRegex.test(value) ? 'valid' : 'invalid'
      }));
    } else if (name === 'password' && value) {
      setValidationState(prev => ({
        ...prev,
        [name]: value.length >= 8 ? 'valid' : 'invalid'
      }));
    } else if (value.trim()) {
      setValidationState(prev => ({ ...prev, [name]: 'valid' }));
    } else {
      setValidationState(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!user.name.trim()) newErrors.name = "Name is required";
    if (!user.email.trim()) newErrors.email = "Email is required";
    if (!isEditMode && !user.password.trim()) newErrors.password = "Password is required";
    if (!user.role) newErrors.role = "Role is required";
    if (user.isActive === undefined || user.isActive === null)
      newErrors.isActive = "Status is required";
    if (currentUserRole === "admin" && user.role === "companyAdmin" && !user.tenantName.trim())
      newErrors.tenantName = "Tenant Name is required for Company Admin";
    if (
      (currentUserRole === "companyAdmin" || (currentUserRole === "member" && user.role === "member")) &&
      !user.departmentId
    )
      newErrors.departmentId = "Department is required for Member";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchTenantData = async (tenantId) => {
    try {
      const res = await axiosInstance.get(`/tenants/${tenantId}`, { withCredentials: true });
      const tenant = res.data.tenant;
      setUser((prev) => ({
        ...prev,
        tenantId: tenant._id,
        tenantName: tenant.name || "",
        departments: tenant.departments || [],
      }));
    } catch (err) {
      console.error("fetchTenantData error:", err.message);
      Swal.fire("Error", "Failed to load tenant data", "error");
    }
  };

  useEffect(() => {

    const fetchUser = async () => {
      if (!id) return; // Prevent fetching if id is undefined
      try {
        const res = await getUserById(id);
        const userData = res.data.user;

        if (!userData) {
          throw new Error("No user data received from server");
        }

        let tenantName = "";
        let departments = [];
        let tenantId = "";
        let departmentId = "";

        if (userData.tenant && typeof userData.tenant === 'object') {
          tenantName = userData.tenant.name || "";
          tenantId = userData.tenant._id?.toString() || "";
          departments = Array.isArray(userData.tenant.departments)
            ? userData.tenant.departments.map(dept => ({
              _id: dept._id?.toString() || "",
              name: dept.name || "Unknown Department",
            }))
            : [];
          departmentId = userData.department?._id?.toString() || "";
        } else if (userData.role === "companyAdmin" && userData.tenant) {
          const tenantRes = await axiosInstance.get(`/tenants/${userData.tenant}`, { withCredentials: true });
          const tenant = tenantRes.data.tenant;
          tenantName = tenant.name || "";
          tenantId = tenant._id?.toString() || "";
          departments = Array.isArray(tenant.departments)
            ? tenant.departments.map(dept => ({
              _id: dept._id?.toString() || "",
              name: dept.name || "Unknown Department",
            }))
            : [];
        }

        if (!userData.department) {
          console.warn("fetchUser: No department assigned to user", { userId: userData._id });
          Swal.fire("Warning", "No department assigned to this user", "warning");
        }
        if (!departments.length) {
          console.warn("fetchUser: No departments found in tenant", { tenantId });
          Swal.fire("Warning", "No departments available for this tenant", "warning");
        }

        setUser({
          _id: userData._id?.toString() || "",
          name: userData.name || "",
          email: userData.email || "",
          password: "",
          role: userData.role || "",
          isActive: userData.isActive?.toString() || "true",
          tenantId,
          tenantName,
          departments,
          departmentId,
        });
      } catch (err) {
        console.error("Error loading user:", {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
        });
        Swal.fire("Error", err.response?.data?.message || "Failed to load user data", "error");
        navigate("/app/users", { state: { refresh: true }, replace: true });
      }
    };

    if (isEditMode) fetchUser();
  }, [id, navigate, isEditMode]);

  useEffect(() => {
    if (!isEditMode && (currentUserRole === "companyAdmin" || currentUserRole === "member")) {
      let tenantId;
      if (currentUser?.tenant?._id) {
        tenantId = currentUser.tenant._id;
      } else if (typeof currentUser?.tenant === 'string') {
        tenantId = currentUser.tenant;
      }

      if (tenantId) {
        fetchTenantData(tenantId);
      } else {
        console.warn("useEffect: No tenant ID found in currentUser", { currentUser });
        Swal.fire("Error", "No tenant associated with this user", "error");
      }
    }
  }, [isEditMode, currentUserRole, currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Please fill all required fields.",
      });
      return;
    }

    // 🚫 Restrict member without permission
    if (!isEditMode && currentUserRole === "member" && !memberCanCreate) {
      return Swal.fire("Forbidden", "You don't have permission to create users", "error");
    }
    if (isEditMode && currentUserRole === "member" && !memberCanUpdate) {
      return Swal.fire("Forbidden", "You don't have permission to update users", "error");
    }

    setIsSubmitting(true);

    try {
      if (isEditMode) {
        let payload = {};
        if (user.name !== user.originalName) payload.name = user.name;

        if (user.role !== user.originalRole) {
          if (currentUserRole === "admin") {
            if (!(user.originalRole === "companyAdmin" && user.role === "user")) {
              payload.role = user.role;
            } else {
              console.warn("Cannot demote companyAdmin to user");
            }
          }
        }

        if (currentUserRole === "admin" && user.role === "companyAdmin") {
          if (user.tenantName !== user.originalTenantName) payload.tenantName = user.tenantName;
        }

        if (currentUserRole === "companyAdmin" || (currentUserRole === "member" && user.role === "member")) {
          if (user.departmentId !== user.originalDepartmentId) payload.department = user.departmentId;
        }

        // 🔹 Add this
        if (user.isActive !== user.originalIsActive) {
          payload.isActive = user.isActive;
        }

        // ✅ Agar payload empty he to API call hi na ho
        if (Object.keys(payload).length === 0) {
          Swal.fire({ icon: "info", title: "No changes to update" });
          return;
        }

        await updateUser(id, payload);
        Swal.fire({ icon: "success", title: "User Updated" });
      } else {
        const preparedUser = {
          name: user.name,
          email: user.email,
          password: user.password,
          role: user.role,
          isActive: user.isActive === "true",
        };

        if (currentUserRole === "admin" && user.role === "companyAdmin") {
          preparedUser.tenantName = user.tenantName;
        } else if (currentUserRole === "companyAdmin" || (currentUserRole === "member" && user.role === "member")) {
          preparedUser.tenant = user.tenantId;
          preparedUser.department = user.departmentId;
        }

        await createUser(preparedUser);
        Swal.fire({ icon: "success", title: "User Created" });
      }

      navigate("/app/users", { state: { refresh: true }, replace: true });
    } catch (error) {
      console.error("User submission failed:", {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        error,
      });
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: error.response?.data?.message || "Failed to submit user data",
      });
    } finally {
      setIsSubmitting(false);
      if (saveSuccess) {
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    }
  };

  return (
    <div className="user-form-container">
      {/* Header Section */}
      <div className="user-form-header">
        <div className="header-content">
          <div className="header-left">
            <Button
              variant="outline-secondary"
              className="back-btn"
              onClick={() => navigate("/app/users")}
            >
              <MdArrowBack className="me-2" /> Back
            </Button>
            
            <div className="page-title-section">
              <div className="page-icon">
                {isEditMode ? <MdPerson /> : <MdGroup />}
              </div>
              <div>
                <h1 className="page-title">
                  {isEditMode ? 'Edit User' : 'Create User'}
                </h1>
                <p className="page-subtitle">
                  {isEditMode ? 'Update user information and settings' : 'Add a new user to the system'}
                </p>
              </div>
            </div>
          </div>
          
          {formChanged && (
            <div className="form-status-indicator">
              <MdInfo className="me-1" />
              <span>Unsaved changes</span>
            </div>
          )}
          
          {saveSuccess && (
            <div className="success-indicator animate-fade-in">
              <MdCheckCircle className="me-1" />
              <span>Saved successfully!</span>
            </div>
          )}
        </div>
      </div>

      {/* Form Content */}
      <div className="form-content">
        <div className="form-wrapper">
          <Form onSubmit={handleSubmit} className="user-form">
            {/* Basic Information Section */}
            <div className="form-section animate-slide-up" style={{'--delay': '0.1s'}}>
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
                          className={`form-input ${
                            validationState.name === 'valid' ? 'is-valid' : 
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

            {/* Account Information Section */}
            <div className="form-section animate-slide-up" style={{'--delay': '0.2s'}}>
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
                          className={`form-input ${
                            isEditMode ? 'disabled' : ''
                          } ${
                            validationState.email === 'valid' ? 'is-valid' : 
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
                          className={`form-input password-input ${
                            isEditMode ? 'disabled' : ''
                          } ${
                            validationState.password === 'valid' ? 'is-valid' : 
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

            {/* Role & Permissions Section */}
            <div className="form-section animate-slide-up" style={{'--delay': '0.3s'}}>
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

            {/* Company Information Section */}
            {currentUserRole === "admin" && user.role === "companyAdmin" && (
              <div className="form-section animate-slide-up" style={{'--delay': '0.4s'}}>
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

            {/* Department Assignment Section */}
            {(currentUserRole === "companyAdmin" || memberCanCreate) && (
              <div className="form-section animate-slide-up" style={{'--delay': '0.5s'}}>
                <div className="section-header">
                  <div className="section-icon">
                    <MdBusiness />
                  </div>
                  <div>
                    <h3 className="section-title" style={{ color: '#1fdae4' }}>Organization Assignment</h3>
                    <p className="section-subtitle">Company and department information</p>
                  </div>
                </div>
                
                <div className="section-content">
                  <Row className="g-3">
                    <Col md={6}>
                      <div className="form-group">
                        <label className="form-label">Company ID</label>
                        <div className="input-wrapper">
                          <Form.Control 
                            type="text" 
                            value={user.tenantId || ""} 
                            disabled 
                            className="form-input disabled"
                          />
                        </div>
                        <div className="field-help">Auto-assigned company identifier</div>
                      </div>
                    </Col>
                    
                    <Col md={6}>
                      <div className="form-group">
                        <label className="form-label">Company Name</label>
                        <div className="input-wrapper">
                          <MdBusiness className="input-icon" />
                          <Form.Control 
                            type="text" 
                            value={user.tenantName} 
                            disabled 
                            className="form-input disabled"
                          />
                        </div>
                        <div className="field-help">Current organization name</div>
                      </div>
                    </Col>
                    
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
                            {Array.isArray(user.departments) && user.departments.length > 0 ? (
                              user.departments.map((dept) => (
                                <option key={dept._id} value={dept._id}>
                                  {dept.name}
                                </option>
                              ))
                            ) : (
                              <option disabled>No departments available</option>
                            )}
                          </Form.Select>
                        </div>
                        {errors.departmentId && (
                          <div className="field-error">{errors.departmentId}</div>
                        )}
                        <div className="field-help">
                          {user.departments && user.departments.length > 0 
                            ? 'Choose the appropriate department for this user' 
                            : 'No departments found - contact administrator'
                          }
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="form-actions animate-slide-up" style={{'--delay': '0.6s'}}>
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