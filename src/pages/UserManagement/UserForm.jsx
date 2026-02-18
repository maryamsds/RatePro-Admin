// src/pages/UserManagement/UserForm.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
    originalName: "",
    originalDepartmentId: "",
    originalIsActive: "",
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


  // === HANDLE FORM FIELD CHANGES ===
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

  // === FORM VALIDATION ===
  const validateForm = () => {
    const newErrors = {};
    if (!user.name.trim()) newErrors.name = "Name is required";
    if (!user.email.trim()) newErrors.email = "Email is required";
    if (!isEditMode && !user.password.trim()) newErrors.password = "Password is required";
    if (!user.role) newErrors.role = "Role is required";
    if (user.isActive === undefined || user.isActive === null) newErrors.isActive = "Status is required";

    if (currentUserRole === "admin" && user.role === "companyAdmin" && !user.tenantName.trim())
      newErrors.tenantName = "Company name is required";

    if ((currentUserRole === "companyAdmin" || currentUserRole === "member") && user.role === "member" && !user.departmentId)
      newErrors.departmentId = "Department is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // === FETCH TENANT DATA ===
  const fetchTenantData = async (tenantId) => {
    try {
      const res = await axiosInstance.get(`/tenants/${tenantId}`, {
        withCredentials: true,
      });
      const tenant = res.data.tenant;
      setUser((prev) => ({
        ...prev,
        tenantId: tenant._id,
        tenantName: tenant.name || "",
        departments: tenant.departments || [],
      }));
    } catch (err) {
      console.error("fetchTenantData error:", err);
      Swal.fire("Error", "Failed to load tenant data", "error");
    }
  };

  // === LOAD USER DATA IF EDIT MODE ===  
  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;
      try {
        const res = await getUserById(id);
        const userData = res.data.user;

        let tenantName = "", departments = [], tenantId = "", departmentId = "";

        if (userData.tenant && typeof userData.tenant === 'object') {
          tenantName = userData.tenant.name || "";
          tenantId = userData.tenant._id?.toString() || "";
          departments = userData.tenant.departments?.map(dept => ({
            _id: dept._id?.toString(),
            name: dept.name
          })) || [];
          departmentId = userData.department?._id?.toString() || "";
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
          originalName: userData.name || "",
          originalDepartmentId: departmentId,
          originalIsActive: userData.isActive?.toString() || "true",
        });

      } catch (err) {
        console.error("Error loading user:", err);
        Swal.fire("Error", err.response?.data?.message || "Failed to load user", "error");
        navigate("/app/users", { replace: true });
      }
    };

    if (isEditMode) fetchUser();
  }, [id, navigate, isEditMode]);

  // === FETCH TENANT DATA IF NOT ADMIN ===
  useEffect(() => {
    if (!isEditMode && (currentUserRole === "companyAdmin" || currentUserRole === "member")) {
      const tenantId = currentUser?.tenant?._id || currentUser?.tenant;
      if (tenantId) {
        fetchTenantData(tenantId);
      }
    }
  }, [isEditMode, currentUserRole, currentUser]);

  // === HANDLE FORM SUBMISSION ===
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
      }

      if (isEditMode) {
        const updates = {};
        if (user.name !== user.originalName) updates.name = user.name;
        if (user.departmentId !== user.originalDepartmentId) updates.department = user.departmentId;
        if (user.isActive !== user.originalIsActive) updates.isActive = user.isActive === "true";

        if (Object.keys(updates).length === 0) {
          Swal.fire({ icon: "info", title: "No changes" });
          setIsSubmitting(false);
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

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* PAGE HEADER */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              className="px-4 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-hover)] dark:hover:bg-[var(--dark-hover)] transition-colors font-medium inline-flex items-center gap-2"
              onClick={() => navigate("/app/users")}
            >
              <MdArrowBack /> Back
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[var(--primary-light)] flex items-center justify-center text-[var(--primary-color)] text-2xl">
                {isEditMode ? <MdPerson /> : <MdGroup />}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">
                  {isEditMode ? 'Edit User' : 'Create User'}
                </h1>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                  {isEditMode ? 'Update user information and settings' : 'Add a new user to the system'}
                </p>
              </div>
            </div>
          </div>

          {formChanged && (
            <div className="bg-[var(--warning-light)] border border-[var(--warning-color)] text-[var(--warning-color)] px-4 py-2 rounded-md flex items-center gap-2">
              <MdInfo />
              <span className="text-sm font-medium">Unsaved changes</span>
            </div>
          )}

          {saveSuccess && (
            <div className="bg-[var(--success-light)] border border-[var(--success-color)] text-[var(--success-color)] px-4 py-2 rounded-md flex items-center gap-2 animate-pulse">
              <MdCheckCircle />
              <span className="text-sm font-medium">Saved successfully!</span>
            </div>
          )}
        </div>
      </div>
      {/* FORM CONTENT */}
      <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* BASIC INFO */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[var(--primary-light)] flex items-center justify-center text-[var(--primary-color)] text-xl">
                <MdPerson />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[var(--primary-color)]">Basic Information</h3>
                <p className="text-sm text-[var(--text-secondary)]">Personal details and identification</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {isEditMode && (
                    <div>
                      <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-2">User ID</label>
                      <input
                        type="text"
                        value={user._id || ""}
                        disabled
                        className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-50 cursor-not-allowed"
                      />
                    </div>
                  )}

                  <div className={isEditMode ? '' : 'md:col-span-2'}>
                    <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-2">
                      Full Name <span className="text-[var(--danger-color)]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="name"
                        autoComplete="name"
                        value={user.name}
                        onChange={handleChange}
                        placeholder="Enter full name"
                        className={`w-full px-3 py-2 pr-10 rounded-md border bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none transition-all ${
                          validationState.name === 'valid' ? 'border-[var(--success-color)] focus:ring-2 focus:ring-[var(--success-color)]/30' :
                          validationState.name === 'invalid' ? 'border-[var(--danger-color)] focus:ring-2 focus:ring-[var(--danger-color)]/30' : 
                          'border-[var(--light-border)] dark:border-[var(--dark-border)] focus:ring-2 focus:ring-[var(--primary-color)]/30'
                        }`}
                      />
                      {validationState.name === 'valid' && (
                        <MdCheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--success-color)] text-xl" />
                      )}
                      {validationState.name === 'invalid' && (
                        <MdError className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--danger-color)] text-xl" />
                      )}
                    </div>
                    {errors.name && (
                      <div className="text-sm text-[var(--danger-color)] mt-1 flex items-center gap-1">
                        <MdError /> {errors.name}
                      </div>
                    )}
                  </div>
              </div>
            </div>
          </div>

          {/* ACCOUNT INFO */ }
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[var(--primary-light)] flex items-center justify-center text-[var(--primary-color)] text-xl">
                <MdKey />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[var(--primary-color)]">Account Information</h3>
                <p className="text-sm text-[var(--text-secondary)]">Login credentials and access details</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-2">
                      Email Address <span className="text-[var(--danger-color)]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        autoComplete="email"
                        value={user.email}
                        onChange={handleChange}
                        placeholder={isEditMode ? user.email : "user@example.com"}
                        disabled={isEditMode}
                        className={`w-full px-3 py-2 pr-10 rounded-md border bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none transition-all ${
                          isEditMode ? 'opacity-50 cursor-not-allowed' : ''
                        } ${
                          validationState.email === 'valid' && !isEditMode ? 'border-[var(--success-color)] focus:ring-2 focus:ring-[var(--success-color)]/30' :
                          validationState.email === 'invalid' && !isEditMode ? 'border-[var(--danger-color)] focus:ring-2 focus:ring-[var(--danger-color)]/30' : 
                          'border-[var(--light-border)] dark:border-[var(--dark-border)] focus:ring-2 focus:ring-[var(--primary-color)]/30'
                        }`}
                      />
                      {!isEditMode && validationState.email === 'valid' && (
                        <MdCheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--success-color)] text-xl" />
                      )}
                      {!isEditMode && validationState.email === 'invalid' && (
                        <MdError className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--danger-color)] text-xl" />
                      )}
                    </div>
                    {errors.email && (
                      <div className="text-sm text-[var(--danger-color)] mt-1 flex items-center gap-1">
                        <MdError /> {errors.email}
                      </div>
                    )}
                    {isEditMode && (
                      <div className="text-sm text-[var(--text-secondary)] mt-1">Email cannot be changed after registration</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-2">
                      Password <span className="text-[var(--danger-color)]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        autoComplete="new-password"
                        value={user.password}
                        onChange={handleChange}
                        placeholder={isEditMode ? "Password unchanged" : "Minimum 8 characters"}
                        disabled={isEditMode}
                        className={`w-full px-3 py-2 pr-10 rounded-md border bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none transition-all ${
                          isEditMode ? 'opacity-50 cursor-not-allowed' : ''
                        } ${
                          validationState.password === 'valid' && !isEditMode ? 'border-[var(--success-color)] focus:ring-2 focus:ring-[var(--success-color)]/30' :
                          validationState.password === 'invalid' && !isEditMode ? 'border-[var(--danger-color)] focus:ring-2 focus:ring-[var(--danger-color)]/30' : 
                          'border-[var(--light-border)] dark:border-[var(--dark-border)] focus:ring-2 focus:ring-[var(--primary-color)]/30'
                        }`}
                      />
                      {!isEditMode && (
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--light-text)] dark:hover:text-[var(--dark-text)] transition-colors"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <MdVisibilityOff className="text-xl" /> : <MdVisibility className="text-xl" />}
                        </button>
                      )}
                      {!isEditMode && validationState.password === 'valid' && (
                        <MdCheckCircle className="absolute right-10 top-1/2 -translate-y-1/2 text-[var(--success-color)] text-xl" />
                      )}
                      {!isEditMode && validationState.password === 'invalid' && (
                        <MdError className="absolute right-10 top-1/2 -translate-y-1/2 text-[var(--danger-color)] text-xl" />
                      )}
                    </div>
                    {errors.password && (
                      <div className="text-sm text-[var(--danger-color)] mt-1 flex items-center gap-1">
                        <MdError /> {errors.password}
                      </div>
                    )}
                    {!isEditMode && (
                      <div className="text-sm text-[var(--text-secondary)] mt-1">Must be at least 8 characters long</div>
                    )}
                    {isEditMode && (
                      <div className="text-sm text-[var(--text-secondary)] mt-1">Leave empty to keep current password</div>
                    )}
                  </div>
              </div>
            </div>
          </div>

          {/* ROLE & STATUS */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[var(--primary-light)] flex items-center justify-center text-[var(--primary-color)] text-xl">
                <MdGroup />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[var(--primary-color)]">Role & Permissions</h3>
                <p className="text-sm text-[var(--text-secondary)]">User access level and account status</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-2">
                      User Role <span className="text-[var(--danger-color)]">*</span>
                    </label>
                    <select
                      name="role"
                      value={user.role}
                      onChange={handleChange}
                      autoComplete="off"
                      className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30 transition-all"
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
                    </select>
                    {errors.role && (
                      <div className="text-sm text-[var(--danger-color)] mt-1 flex items-center gap-1">
                        <MdError /> {errors.role}
                      </div>
                    )}
                    <div className="text-sm text-[var(--text-secondary)] mt-1">
                      {user.role === 'companyAdmin' && 'Full administrative access to company resources'}
                      {user.role === 'member' && 'Limited access based on department permissions'}
                      {user.role === 'user' && 'Standard user with basic permissions'}
                      {!user.role && 'Select the appropriate role for this user'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-2">
                      Account Status <span className="text-[var(--danger-color)]">*</span>
                    </label>
                    <div className="space-y-3">
                      <div
                        className={`p-4 rounded-md border cursor-pointer transition-all ${
                          user.isActive === 'true' 
                            ? 'border-[var(--success-color)] bg-[var(--success-light)]' 
                            : 'border-[var(--light-border)] dark:border-[var(--dark-border)] hover:border-[var(--success-color)]'
                        }`}
                        onClick={() => {
                          setUser(prev => ({ ...prev, isActive: 'true' }));
                          setFormChanged(true);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`text-2xl ${
                            user.isActive === 'true' ? 'text-[var(--success-color)]' : 'text-[var(--text-secondary)]'
                          }`}>
                            <MdToggleOn />
                          </div>
                          <div>
                            <div className={`font-medium ${
                              user.isActive === 'true' ? 'text-[var(--success-color)]' : 'text-[var(--light-text)] dark:text-[var(--dark-text)]'
                            }`}>Active</div>
                            <div className="text-sm text-[var(--text-secondary)]">User can login and access system</div>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`p-4 rounded-md border cursor-pointer transition-all ${
                          user.isActive === 'false' 
                            ? 'border-[var(--danger-color)] bg-[var(--danger-light)]' 
                            : 'border-[var(--light-border)] dark:border-[var(--dark-border)] hover:border-[var(--danger-color)]'
                        }`}
                        onClick={() => {
                          setUser(prev => ({ ...prev, isActive: 'false' }));
                          setFormChanged(true);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`text-2xl ${
                            user.isActive === 'false' ? 'text-[var(--danger-color)]' : 'text-[var(--text-secondary)]'
                          }`}>
                            <MdToggleOff />
                          </div>
                          <div>
                            <div className={`font-medium ${
                              user.isActive === 'false' ? 'text-[var(--danger-color)]' : 'text-[var(--light-text)] dark:text-[var(--dark-text)]'
                            }`}>Inactive</div>
                            <div className="text-sm text-[var(--text-secondary)]">User login is disabled</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {errors.isActive && (
                      <div className="text-sm text-[var(--danger-color)] mt-1 flex items-center gap-1">
                        <MdError /> {errors.isActive}
                      </div>
                    )}
                  </div>
              </div>
            </div>
          </div>

          {/* COMPANY INFO - For Admin creating CompanyAdmin */ }
          {currentUserRole === "admin" && user.role === "companyAdmin" && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[var(--primary-light)] flex items-center justify-center text-[var(--primary-color)] text-xl">
                  <MdBusiness />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[var(--primary-color)]">Company Information</h3>
                  <p className="text-sm text-[var(--text-secondary)]">Organization details for company admin</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-2">
                      Company Name <span className="text-[var(--danger-color)]">*</span>
                    </label>
                    <input
                      type="text"
                      name="tenantName"
                      value={user.tenantName}
                      onChange={handleChange}
                      placeholder="e.g. Acme Corp"
                      className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30 transition-all"
                    />
                    {errors.tenantName && (
                      <div className="text-sm text-[var(--danger-color)] mt-1 flex items-center gap-1">
                        <MdError /> {errors.tenantName}
                      </div>
                    )}
                    <div className="text-sm text-[var(--text-secondary)] mt-1">This will create a new company organization</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DEPARTMENT ASSIGNMENT - Always visible for members */}
          {(currentUserRole === "companyAdmin" || memberCanCreate) && user.role === "member" && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[var(--primary-light)] flex items-center justify-center text-[var(--primary-color)] text-xl">
                  <MdBusiness />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[var(--primary-color)]">Department Assignment</h3>
                  <p className="text-sm text-[var(--text-secondary)]">Assign user to a department</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-2">
                      Department <span className="text-[var(--danger-color)]">*</span>
                    </label>
                    <select
                      name="departmentId"
                      value={user.departmentId}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30 transition-all"
                    >
                      <option value="">Select Department</option>
                      {user.departments.map(dept => (
                        <option key={dept._id} value={dept._id}>{dept.name}</option>
                      ))}
                    </select>
                    {errors.departmentId && (
                      <div className="text-sm text-[var(--danger-color)] mt-1 flex items-center gap-1">
                        <MdError /> {errors.departmentId}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FORM ACTIONS */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-4 border-t border-[var(--light-border)] dark:border-[var(--dark-border)]">
            <div>
              {formChanged && (
                <div className="bg-[var(--warning-light)] border border-[var(--warning-color)] text-[var(--warning-color)] px-4 py-2 rounded-md flex items-center gap-2">
                  <MdInfo />
                  <span className="text-sm font-medium">You have unsaved changes</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/app/users", { replace: true })}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-md font-medium transition-colors border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-hover)] dark:hover:bg-[var(--dark-hover)] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting || (!formChanged && isEditMode)}
                className="px-6 py-2.5 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <MdSave />
                    {isEditMode ? "Update User" : "Create User"}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;