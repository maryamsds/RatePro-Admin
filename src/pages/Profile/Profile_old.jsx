import { useEffect, useState } from "react"
import { 
  MdPerson, MdSecurity, MdNotifications, MdEdit, MdSave, MdCancel,
  MdCheck, MdClose, MdEmail, MdPhone, MdWork, MdInfo,
  MdBusiness, MdLanguage, MdAccessTime, MdLock, MdRefresh,
  MdCamera, MdAssessment, MdPeople, MdTrendingUp
} from "react-icons/md"
import axiosInstance, { getCurrentUser, updateProfile, updateUserProfile } from "../../api/axiosInstance"
import Swal from "sweetalert2"
import { capitalize } from "../../utilities/capitalize";
import { useAuth } from "../../context/AuthContext"
import { useLocation } from "react-router-dom"

const Profile = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [userData, setUserData] = useState("");
  const [userId, setUserId] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const { setUser, user, updateCompanyInfo } = useAuth();
  const location = useLocation()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const tab = params.get("tab")
    if (tab) {
      setActiveTab(tab)  // agar ?tab=company aaya to direct company tab khulega
    }
  }, [location.search])

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    department: "", // Department._id from Tenant.departments
    role: "",
    bio: "",
    timezone: "",
    language: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [formErrors, setFormErrors] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: false,
    surveyAlerts: true,
    weeklyReports: true,
    systemUpdates: false,
  });

  const [companyData, setCompanyData] = useState({
    name: "",
    address: "",
    contactEmail: "",
    contactPhone: "",
    website: "",
    employees: "",
    departments: [], // Array of { _id, name, head }
  });

  const availableDepartments = [
    { name: "Administration" },
    { name: "Management" },
    { name: "Human Resources" },
    { name: "Finance" },
    { name: "IT" },
    { name: "Marketing" },
    { name: "Sales" },
    { name: "Customer Support" },
  ];

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await getCurrentUser();
        const user = res.data.user;
        const nameParts = user.name?.trim().split(" ") || [];
        const firstName = nameParts.slice(0, -1).join(" ");
        const lastName = nameParts.slice(-1).join(" ");

        setFormData({
          firstName,
          lastName,
          email: user.email || "",
          phone: user.phone || "",
          department: user.department?._id || "", // Department ID
          role: user.role || "",
          bio: user.bio || "",
          timezone: user.timezone || "",
          language: user.language || "",
        });

        setUserId(user._id);
        setUserData(user);
        setUser(user);

        // Load Tenant data for companyAdmin or member roles
        if (user.tenant && (user.role === "companyAdmin" || user.role === "member")) {
          const tenant = user.tenant;
          setCompanyData({
            name: tenant.name || "",
            address: tenant.address || "",
            contactEmail: tenant.contactEmail || "",
            contactPhone: tenant.contactPhone || "",
            website: tenant.website || "",
            employees: tenant.totalEmployees || "",
            departments: tenant.departments.map(dept => ({
              _id: dept._id,
              name: dept.name,
              head: dept.head || "No head assigned", // Head is a User ID
            })) || [],
          });
        }
      } catch (err) {
        console.error('fetchUserProfile: Error aaya', err.response?.data || err.message);
        if (err.response?.status === 401 || err.response?.status === 404) {
          console.log('fetchUserProfile: Redirecting to login');
          window.location.href = '/login';
        }
      }
    };

    fetchUserProfile();
  }, [setUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotifications((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSave = async () => {
    const updatedName = `${formData.firstName} ${formData.lastName}`.trim();
    const errors = { firstName: "", lastName: "", phone: "" };

    // Validate First Name
    if (!formData.firstName.trim()) {
      errors.firstName = "First name is required";
    } else if (!/^[A-Za-z]+(?: [A-Za-z]+)*$/.test(formData.firstName)) {
      errors.firstName = "Only alphabets allowed";
    }

    // Validate Last Name (optional)
    if (formData.lastName && !/^[A-Za-z]+(?: [A-Za-z]+)*$/.test(formData.lastName)) {
      errors.lastName = "Only alphabets allowed";
    }

    // Validate Phone
    if (formData.phone && !/^\+?\d+$/.test(formData.phone)) {
      errors.phone = "Only digits or + allowed";
    }

    // // Validate Department for member role
    // if (user.role === "member" && !formData.department) {
    //   errors.department = "Department is required for members";
    // }

    setFormErrors(errors);
    if (Object.values(errors).some((e) => e)) return;

    try {
      Swal.fire({
        title: "Saving...",
        text: "Please wait while we update your profile.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Update user profile
      await updateUserProfile({
        name: updatedName,
        phone: formData.phone,
        bio: formData.bio,
        // department: formData.department || null, // Send Department._id or null
      });

      Swal.fire({
        icon: "success",
        title: "Profile Updated",
        text: "Your changes have been saved successfully.",
        timer: 2000,
        showConfirmButton: false,
      });

      setIsEditing(false);
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    } catch (err) {
      Swal.close();
      Swal.fire({
        icon: "error",
        title: "Failed to Save",
        text: err?.response?.data?.message || "An error occurred while saving your profile.",
      });
    }
  };

  const handlePasswordRequest = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordData;
    const errors = { currentPassword: "", newPassword: "", confirmPassword: "" };

    // Frontend validations
    if (!currentPassword) errors.currentPassword = "Current password is required";
    if (!newPassword) errors.newPassword = "New password is required";
    if (newPassword !== confirmPassword)
      errors.confirmPassword = "Passwords do not match";

    setPasswordErrors(errors);
    if (Object.values(errors).some((e) => e)) return;

    try {
      Swal.fire({
        title: "Updating Password...",
        text: "Please wait",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      await updateUserProfile({ currentPassword, newPassword });

      Swal.fire({
        icon: "success",
        title: "Password Updated",
        text: "Your password has been changed successfully!",
        timer: 2000,
        showConfirmButton: false,
      });

      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordErrors({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong";
      Swal.close();

      if (msg.toLowerCase().includes("current password")) {
        setPasswordErrors((prev) => ({ ...prev, currentPassword: msg }));
      } else {
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: msg,
        });
      }
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await axiosInstance.put(`/users/me`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire("Success", "Avatar updated!", "success");
      setUser(res.data.user);
      setUserData(res.data.user);
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Upload failed", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCompanyChange = (e, index) => {
    const { name, value } = e.target;

    setCompanyData((prev) => {
      if (typeof index === "number") {
        const updatedDepartments = [...prev.departments];
        updatedDepartments[index] = {
          ...updatedDepartments[index],
          [name === "departmentName" ? "name" : "head"]: value,
        };
        return { ...prev, departments: updatedDepartments };
      }
      return { ...prev, [name]: value };
    });
  };

  const addDepartment = () => {
    setCompanyData((prev) => ({
      ...prev,
      departments: [...prev.departments, { _id: "", name: "", head: "" }],
    }));
  };

  const handleSaveInfo = async () => {
    try {
      Swal.fire({
        title: "Saving...",
        text: "Please wait while we update company info.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Validate company data
      if (!companyData.name) {
        Swal.close();
        Swal.fire({
          icon: "error",
          title: "Validation Error",
          text: "Company name is required.",
        });
        return;
      }

      // Prepare payload for Tenant update
      const tenantPayload = {
        name: companyData.name,
        address: companyData.address,
        contactEmail: companyData.contactEmail,
        contactPhone: companyData.contactPhone,
        website: companyData.website,
        totalEmployees: companyData.employees,
        departments: companyData.departments.map((dept) => ({
          _id: dept._id || undefined,
          name: dept.name,
          head: dept.head || undefined, // User ID for head
        })),
      };

      // Update Tenant
      const response = await axiosInstance.put(`/tenants/${user.tenant?._id}`, tenantPayload);

      if (response.status === 200) {
        updateCompanyInfo(response.data.tenant);
        Swal.fire({
          icon: "success",
          title: "Updated",
          text: "Company info updated successfully!",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        Swal.close();
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Update failed. Please try again.",
        });
      }
    } catch (error) {
      console.error("Update error:", error);
      Swal.close();
      Swal.fire({
        icon: "error",
        title: "Something went wrong",
        text: error.response?.data?.message || "Server error. Try again later.",
      });
    }
  };

  const tabClass = (tab) => `nav-link d-flex align-items-center ${activeTab === tab ? "active" : ""}`;

  return (
    <div className="profile-container">
      {/* Loading Overlay */}
      {isUploading && (
        <div className="loading-overlay">
          <div className="loading-spinner-large"></div>
        </div>
      )}

      {/* Page Header */}
      <div className="page-header-section">
        <div className="page-header-content">
          <div className="page-header-left">
            <div className="page-header-icon">
              <MdPerson />
            </div>
            <div className="page-header-text">
              <h1>Profile Settings</h1>
              <p>Manage your account settings and preferences</p>
            </div>
          </div>
          <div className="page-header-actions">
            {activeTab === "profile" && (
              isEditing ? (
                <>
                  <button onClick={handleCancel} className="secondary-action">
                    <MdCancel />
                    Cancel
                  </button>
                  <button onClick={handleSave} className="primary-action">
                    <MdSave />
                    Save Changes
                  </button>
                </>
              ) : (
                <button onClick={() => setIsEditing(true)} className="primary-action">
                  <MdEdit />
                  Edit Profile
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {(showAlert || saved) && (
        <div className="notification-overlay" onClick={() => { setShowAlert(false); setSaved(false); }}>
          <div className="notification-container success">
            <div className="notification-icon">
              <MdCheck />
            </div>
            <div className="notification-content">
              <h4>Success!</h4>
              <p>Profile updated successfully!</p>
            </div>
            <button className="notification-close" onClick={() => { setShowAlert(false); setSaved(false); }}>
              <MdClose />
            </button>
          </div>
        </div>
      )}

      <Row>
        {/* Profile Card */}
        <Col lg={4} className="mb-4">
          <Card
            className="profile-card border-0 shadow-sm h-100"
            style={{
              backgroundColor: darkMode ? "var(--dark-card)" : "var(--light-card)",
            }}
          >
            <Card.Body className="text-center">
              <div
                className="profile-avatar mx-auto mb-3 rounded-circle d-flex align-items-center justify-content-center position-relative"
                style={{
                  width: "120px",
                  height: "120px",
                  backgroundColor: "var(--primary-color)",
                  color: "var(--bs-white)",
                  fontSize: "3rem",
                  cursor: "pointer",
                }}
              >
                {/* Avatar image or fallback initial */}
                {userData?.avatar?.url ? (
                  <img
                    src={userData.avatar.url}
                    alt="Avatar"
                    className="rounded-circle w-100 h-100 object-fit-cover"
                  />
                ) : (
                  <span>{userData?.name?.charAt(0)?.toUpperCase() || <MdPerson />}</span>
                )}

                {/* Hidden file input */}
                <Form.Control
                  id="avatarUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: "none" }}
                />

                {/* Edit icon trigger */}
                <label
                  htmlFor="avatarUpload"
                  style={{
                    position: "absolute",
                    bottom: "5px",
                    left: "5px",
                    backgroundColor: "var(--bs-white)",
                    borderRadius: "50%",
                    padding: "5px",
                    cursor: "pointer",
                    height: "26px",
                    width: "26px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                  }}
                >
                  <MdEdit size={16} color="var(--primary-color)" />
                </label>
              </div>

              <h4 className={`mb-1 ${darkMode ? "text-white" : "text-dark"}`}>
                {formData.firstName} {formData.lastName}
              </h4>
              <p className="text-muted mb-2">{formData.email}</p>
              <Badge bg="primary" className="mb-3 p-2">
                {capitalize(formData.role)}
              </Badge>
              <p className={`small ${darkMode ? "text-light" : "text-muted"}`}>{formData.bio}</p>
              <div className="profile-stats mt-4">
                <Row>
                  <Col xs={4}>
                    <div className={`fw-bold ${darkMode ? "text-white" : "text-dark"}`}>24</div>
                    <div className="small text-muted">Surveys</div>
                  </Col>
                  <Col xs={4}>
                    <div className={`fw-bold ${darkMode ? "text-white" : "text-dark"}`}>1.2K</div>
                    <div className="small text-muted">Responses</div>
                  </Col>
                  <Col xs={4}>
                    <div className={`fw-bold ${darkMode ? "text-white" : "text-dark"}`}>78%</div>
                    <div className="small text-muted">Completion</div>
                  </Col>
                </Row>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Settings Tabs */}
        <Col lg={8}>
          <Card
            className="settings-card border-0 shadow-sm"
            style={{
              backgroundColor: darkMode ? "var(--dark-card)" : "var(--light-card)",
            }}
          >
            <Card.Body>

              <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                  <button className={tabClass("profile")} onClick={() => setActiveTab("profile")}>
                    <MdPerson className="me-1" /> Personal Info
                  </button>
                </li>
                <li className="nav-item">
                  <button className={tabClass("security")} onClick={() => setActiveTab("security")}>
                    <MdSecurity className="me-1" /> Security
                  </button>
                </li>
                {(user?.role === "company" || user?.role === "companyAdmin") && (
                  <li className="nav-item">
                    <button className={tabClass("company")} onClick={() => setActiveTab("company")}>
                      🏢 Company Details
                    </button>
                  </li>
                )}
                <li className="nav-item">
                  <button className={tabClass("notifications")} onClick={() => setActiveTab("notifications")}>
                    <MdNotifications className="me-1" /> Notifications
                  </button>
                </li>
              </ul>

              {activeTab === "profile" && (
                <form className="row g-3">
                  {[
                    ["First Name", "firstName"],
                    ["Last Name", "lastName"],
                    ["Phone", "phone"],
                  ].map(([label, name]) => (
                    <div className="col-md-6" key={name}>
                      <label className="form-label">{label}</label>
                      <input
                        type="text"
                        name={name}
                        value={formData[name]}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={inputClass}
                      />
                      {/* Show error only for validated fields */}
                      {["firstName", "lastName", "phone"].includes(name) && formErrors[name] && (
                        <small className="text-danger">{formErrors[name]}</small>
                      )}
                    </div>
                  ))}

                  <div className="col-md-6">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      className={inputClass}
                      disabled />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Role</label>
                    <input
                      type="text"
                      name="role"
                      value={formData.role}
                      className={`${inputClass} opacity-75`}
                      disabled
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Bio</label>
                    <textarea
                      name="bio"
                      rows="3"
                      className={inputClass}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      value={formData.bio}
                    ></textarea>
                  </div>
                </form>
              )}

              {activeTab === "security" && (
                <form className="row g-3">
                  <div className="col-md-12">
                    <label className="form-label">Current Password</label>
                    <input
                      type="password"
                      placeholder="Current password"
                      onChange={(e) => {
                        setPasswordData({ ...passwordData, currentPassword: e.target.value });
                        setPasswordErrors((prev) => ({ ...prev, currentPassword: "" }));
                      }}
                      className={inputClass}
                    />
                    {passwordErrors.currentPassword && (
                      <small className="text-danger">{passwordErrors.currentPassword}</small>
                    )}
                  </div>
                  <div className="col-md-12">
                    <label className="form-label">New Password</label>
                    <input
                      type="password"
                      placeholder="New password"
                      onChange={(e) => {
                        setPasswordData({ ...passwordData, newPassword: e.target.value });
                        setPasswordErrors((prev) => ({ ...prev, newPassword: "" }));
                      }}
                      className={inputClass}
                    />
                    {passwordErrors.newPassword && (
                      <small className="text-danger">{passwordErrors.newPassword}</small>
                    )}
                  </div>
                  <div className="col-md-12">
                    <label className="form-label">Confirm Password</label>
                    <input
                      type="password"
                      placeholder="Confirm password"
                      onChange={(e) => {
                        setPasswordData({ ...passwordData, confirmPassword: e.target.value });
                        setPasswordErrors((prev) => ({ ...prev, confirmPassword: "" }));
                      }}
                      className={inputClass}
                    />
                    {passwordErrors.confirmPassword && (
                      <small className="text-danger">{passwordErrors.confirmPassword}</small>
                    )}
                  </div>
                  <div className="col-12">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handlePasswordRequest}
                    >
                      Update Password
                    </button>
                  </div>
                </form>
              )}

              {activeTab === "company" && (
                <form className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Company Name</label>
                    <input
                      type="text"
                      name="name"
                      value={companyData.name}
                      onChange={handleCompanyChange}
                      className={inputClass}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Company Email</label>
                    <input
                      type="email"
                      name="contactEmail"
                      value={companyData.contactEmail}
                      onChange={handleCompanyChange}
                      className={inputClass}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Company Phone</label>
                    <input
                      type="text"
                      name="contactPhone"
                      value={companyData.contactPhone}
                      onChange={handleCompanyChange}
                      className={inputClass}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Website (optional)</label>
                    <input
                      type="text"
                      name="website"
                      value={companyData.website}
                      onChange={handleCompanyChange}
                      className={inputClass}
                    />
                  </div>

                  <div className="col-md-12">
                    <label className="form-label">Company Address</label>
                    <input
                      type="text"
                      name="address"
                      value={companyData.address}
                      onChange={handleCompanyChange}
                      className={inputClass}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Total Employees</label>
                    <input
                      type="number"
                      name="employees"
                      value={companyData.employees}
                      onChange={handleCompanyChange}
                      className={inputClass}
                    />
                  </div>

                  <div className="col-md-12">
                    <label className="form-label">Departments</label>
                    {companyData.departments.map((dept, idx) => (
                      <div key={idx} className="row mb-2">
                        <div className="col-md-5">
                          {/* <select
                            name="departmentName"
                            value={dept.name}
                            onChange={(e) => handleCompanyChange(e, idx)}
                            className={inputClass}
                          >
                            <option value="">Select Department</option>
                            {availableDepartments.map((d) => (
                              <option key={d.name} value={d.name}>
                                {d.name}
                              </option>
                            ))}
                          </select> */}
                          <input
                            type="text"
                            name="departmentName"
                            placeholder="Department Name"
                            value={dept.name}
                            onChange={(e) => handleCompanyChange(e, idx)}
                            className={inputClass}
                          />
                        </div>
                        <div className="col-md-5">
                          <input
                            type="text"
                            name="departmentHead"
                            placeholder="Department Head"
                            value={dept.head}
                            onChange={(e) => handleCompanyChange(e, idx)}
                            className={inputClass}
                          />
                        </div>
                      </div>
                    ))}

                    <Button variant="outline-secondary" size="sm" onClick={addDepartment}>
                      + Add Department
                    </Button>
                  </div>

                  <div className="col-12">
                    <Button type="button" onClick={handleSaveInfo} className="btn btn-primary">
                      Save Company Info
                    </Button>
                  </div>
                </form>
              )}

              {activeTab === "notifications" && (
                <form className="row g-3">
                  {Object.entries(notifications).map(([key, value]) => (
                    <div
                      key={key}
                      className="col-12 d-flex justify-content-between align-items-center"
                    >
                      <label className="form-check-label">
                        {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                      </label>
                      <input
                        type="checkbox"
                        className="form-check-input ms-2"
                        name={key}
                        checked={value}
                        onChange={handleNotificationChange}
                      />
                    </div>
                  ))}
                  <div className="col-12">
                    <button type="button" className="btn btn-primary">
                      Save Preferences
                    </button>
                  </div>
                </form>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default Profile