import { useEffect, useState } from "react"
import { 
  MdPerson, MdSecurity, MdNotifications, MdEdit, MdSave, MdCancel,
  MdCheck, MdClose, MdEmail, MdPhone, MdWork, MdInfo,
  MdBusiness, MdLanguage, MdAccessTime, MdLock, MdRefresh,
  MdCamera, MdAssessment, MdPeople, MdTrendingUp
} from "react-icons/md"
import axiosInstance, { getCurrentUser, updateProfile, updateUserProfile } from "../../api/axiosInstance"
import Swal from "sweetalert2"
import { capitalize } from "../../utilities/capitalize"
import { useAuth } from "../../context/AuthContext"
import { useLocation } from "react-router-dom"

const Profile = () => {
  const [activeTab, setActiveTab] = useState("profile")
  const [isEditing, setIsEditing] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [userData, setUserData] = useState("")
  const [userId, setUserId] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [saved, setSaved] = useState(false)
  const { setUser, user, updateCompanyInfo } = useAuth()
  const location = useLocation()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const tab = params.get("tab")
    if (tab) {
      setActiveTab(tab)
    }
  }, [location.search])

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    department: "",
    role: "",
    bio: "",
    timezone: "",
    language: "",
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [formErrors, setFormErrors] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  })

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: false,
    surveyAlerts: true,
    weeklyReports: true,
    systemUpdates: false,
  })

  const [companyData, setCompanyData] = useState({
    name: "",
    address: "",
    contactEmail: "",
    contactPhone: "",
    website: "",
    employees: "",
    departments: [],
  })

  const availableDepartments = [
    { name: "Administration" },
    { name: "Management" },
    { name: "Human Resources" },
    { name: "Finance" },
    { name: "IT" },
    { name: "Marketing" },
    { name: "Sales" },
    { name: "Customer Support" },
  ]

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await getCurrentUser()
        const user = res.data.user
        const nameParts = user.name?.trim().split(" ") || []
        const firstName = nameParts.slice(0, -1).join(" ")
        const lastName = nameParts.slice(-1).join(" ")

        setFormData({
          firstName,
          lastName,
          email: user.email || "",
          phone: user.phone || "",
          department: user.department?._id || "",
          role: user.role || "",
          bio: user.bio || "",
          timezone: user.timezone || "",
          language: user.language || "",
        })

        setUserId(user._id)
        setUserData(user)
        setUser(user)

        if (user.tenant && (user.role === "companyAdmin" || user.role === "member")) {
          const tenant = user.tenant
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
              head: dept.head || "No head assigned",
            })) || [],
          })
        }
      } catch (err) {
        console.error('fetchUserProfile: Error aaya', err.response?.data || err.message)
        if (err.response?.status === 401 || err.response?.status === 404) {
          console.log('fetchUserProfile: Redirecting to login')
          window.location.href = '/login'
        }
      }
    }

    fetchUserProfile()
  }, [setUser])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target
    setNotifications((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSave = async () => {
    const updatedName = `${formData.firstName} ${formData.lastName}`.trim()
    const errors = { firstName: "", lastName: "", phone: "" }

    if (!formData.firstName.trim()) {
      errors.firstName = "First name is required"
    } else if (!/^[A-Za-z]+(?: [A-Za-z]+)*$/.test(formData.firstName)) {
      errors.firstName = "Only alphabets allowed"
    }

    if (formData.lastName && !/^[A-Za-z]+(?: [A-Za-z]+)*$/.test(formData.lastName)) {
      errors.lastName = "Only alphabets allowed"
    }

    if (formData.phone && !/^\+?\d+$/.test(formData.phone)) {
      errors.phone = "Only digits or + allowed"
    }

    setFormErrors(errors)
    if (Object.values(errors).some((e) => e)) return

    try {
      Swal.fire({
        title: "Saving...",
        text: "Please wait while we update your profile.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading()
        },
      })

      await updateUserProfile({
        name: updatedName,
        phone: formData.phone,
        bio: formData.bio,
      })

      Swal.fire({
        icon: "success",
        title: "Profile Updated",
        text: "Your changes have been saved successfully.",
        timer: 2000,
        showConfirmButton: false,
      })

      setIsEditing(false)
      setShowAlert(true)
      setSaved(true)
      setTimeout(() => {
        setShowAlert(false)
        setSaved(false)
      }, 3000)
    } catch (err) {
      Swal.close()
      Swal.fire({
        icon: "error",
        title: "Failed to Save",
        text: err?.response?.data?.message || "An error occurred while saving your profile.",
      })
    }
  }

  const handlePasswordRequest = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordData
    const errors = { currentPassword: "", newPassword: "", confirmPassword: "" }

    if (!currentPassword) errors.currentPassword = "Current password is required"
    if (!newPassword) errors.newPassword = "New password is required"
    if (newPassword !== confirmPassword)
      errors.confirmPassword = "Passwords do not match"

    setPasswordErrors(errors)
    if (Object.values(errors).some((e) => e)) return

    try {
      Swal.fire({
        title: "Updating Password...",
        text: "Please wait",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading()
        },
      })

      await updateUserProfile({ currentPassword, newPassword })

      Swal.fire({
        icon: "success",
        title: "Password Updated",
        text: "Your password has been changed successfully!",
        timer: 2000,
        showConfirmButton: false,
      })

      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
      setPasswordErrors({ currentPassword: "", newPassword: "", confirmPassword: "" })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong"
      Swal.close()

      if (msg.toLowerCase().includes("current password")) {
        setPasswordErrors((prev) => ({ ...prev, currentPassword: msg }))
      } else {
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: msg,
        })
      }
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("avatar", file)

      const res = await axiosInstance.put(`/users/me`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      Swal.fire("Success", "Avatar updated!", "success")
      setUser(res.data.user)
      setUserData(res.data.user)
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Upload failed", "error")
    } finally {
      setIsUploading(false)
    }
  }

  const handleCompanyChange = (e, index) => {
    const { name, value } = e.target

    setCompanyData((prev) => {
      if (typeof index === "number") {
        const updatedDepartments = [...prev.departments]
        updatedDepartments[index] = {
          ...updatedDepartments[index],
          [name === "departmentName" ? "name" : "head"]: value,
        }
        return { ...prev, departments: updatedDepartments }
      }
      return { ...prev, [name]: value }
    })
  }

  const addDepartment = () => {
    setCompanyData((prev) => ({
      ...prev,
      departments: [...prev.departments, { _id: "", name: "", head: "" }],
    }))
  }

  const handleSaveInfo = async () => {
    try {
      Swal.fire({
        title: "Saving...",
        text: "Please wait while we update company info.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading()
        },
      })

      if (!companyData.name) {
        Swal.close()
        Swal.fire({
          icon: "error",
          title: "Validation Error",
          text: "Company name is required.",
        })
        return
      }

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
          head: dept.head || undefined,
        })),
      }

      const response = await axiosInstance.put(`/tenants/${user.tenant?._id}`, tenantPayload)

      if (response.status === 200) {
        updateCompanyInfo(response.data.tenant)
        Swal.fire({
          icon: "success",
          title: "Updated",
          text: "Company info updated successfully!",
          timer: 2000,
          showConfirmButton: false,
        })
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } else {
        Swal.close()
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Update failed. Please try again.",
        })
      }
    } catch (error) {
      console.error("Update error:", error)
      Swal.close()
      Swal.fire({
        icon: "error",
        title: "Something went wrong",
        text: error.response?.data?.message || "Server error. Try again later.",
      })
    }
  }

  const handleSaveNotifications = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

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
              <p>Your changes have been saved successfully!</p>
            </div>
            <button className="notification-close" onClick={() => { setShowAlert(false); setSaved(false); }}>
              <MdClose />
            </button>
          </div>
        </div>
      )}

      {/* Profile Content */}
      <div className="profile-content-grid">
        {/* Profile Sidebar */}
        <div className="profile-sidebar">
          <div className="profile-card">
            <div className="avatar-section">
              <div className="profile-avatar">
                {userData?.avatar?.url ? (
                  <img
                    src={userData.avatar.url}
                    alt="Avatar"
                    className="avatar-image"
                  />
                ) : (
                  <span className="avatar-initial">
                    {userData?.name?.charAt(0)?.toUpperCase() || <MdPerson />}
                  </span>
                )}

                <input
                  id="avatarUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: "none" }}
                />

                <label htmlFor="avatarUpload" className="avatar-edit-btn">
                  <MdCamera />
                </label>
              </div>

              <div className="user-info">
                <h3 className="user-name">
                  {formData.firstName} {formData.lastName}
                </h3>
                <p className="user-email">{formData.email}</p>
                <span className="user-role-badge">
                  {capitalize(formData.role)}
                </span>
              </div>

              {formData.bio && (
                <p className="user-bio">{formData.bio}</p>
              )}
            </div>

            <div className="profile-stats">
              <div className="stat-item">
                <div className="stat-icon">
                  <MdAssessment />
                </div>
                <div className="stat-content">
                  <div className="stat-value">24</div>
                  <div className="stat-label">Surveys</div>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-icon">
                  <MdPeople />
                </div>
                <div className="stat-content">
                  <div className="stat-value">1.2K</div>
                  <div className="stat-label">Responses</div>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-icon">
                  <MdTrendingUp />
                </div>
                <div className="stat-content">
                  <div className="stat-value">78%</div>
                  <div className="stat-label">Completion</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Section */}
        <div className="settings-section">
          <div className="section-card">
            {/* Custom Tab Navigation */}
            <div className="tab-nav">
              <button 
                className={`tab-button ${activeTab === "profile" ? "active" : ""}`}
                onClick={() => setActiveTab("profile")}
              >
                <MdPerson />
                Personal Info
              </button>
              <button 
                className={`tab-button ${activeTab === "security" ? "active" : ""}`}
                onClick={() => setActiveTab("security")}
              >
                <MdLock />
                Security
              </button>
              {(user?.role === "company" || user?.role === "companyAdmin") && (
                <button 
                  className={`tab-button ${activeTab === "company" ? "active" : ""}`}
                  onClick={() => setActiveTab("company")}
                >
                  <MdBusiness />
                  Company Details
                </button>
              )}
              <button 
                className={`tab-button ${activeTab === "notifications" ? "active" : ""}`}
                onClick={() => setActiveTab("notifications")}
              >
                <MdNotifications />
                Notifications
              </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
              {/* Personal Info Tab */}
              {activeTab === "profile" && (
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="firstName">First Name *</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                    {formErrors.firstName && (
                      <span className="form-error">{formErrors.firstName}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="lastName">Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                    {formErrors.lastName && (
                      <span className="form-error">{formErrors.lastName}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      disabled
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">Phone</label>
                    <input
                      type="text"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                    {formErrors.phone && (
                      <span className="form-error">{formErrors.phone}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="role">Role</label>
                    <input
                      type="text"
                      id="role"
                      name="role"
                      value={formData.role}
                      disabled
                    />
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="bio">Bio</label>
                    <textarea
                      id="bio"
                      name="bio"
                      rows="3"
                      value={formData.bio}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    ></textarea>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === "security" && (
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label htmlFor="currentPassword">Current Password</label>
                    <input
                      type="password"
                      id="currentPassword"
                      placeholder="Enter current password"
                      value={passwordData.currentPassword}
                      onChange={(e) => {
                        setPasswordData({ ...passwordData, currentPassword: e.target.value })
                        setPasswordErrors({ ...passwordErrors, currentPassword: "" })
                      }}
                    />
                    {passwordErrors.currentPassword && (
                      <span className="form-error">{passwordErrors.currentPassword}</span>
                    )}
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="newPassword">New Password</label>
                    <input
                      type="password"
                      id="newPassword"
                      placeholder="Enter new password"
                      value={passwordData.newPassword}
                      onChange={(e) => {
                        setPasswordData({ ...passwordData, newPassword: e.target.value })
                        setPasswordErrors({ ...passwordErrors, newPassword: "" })
                      }}
                    />
                    {passwordErrors.newPassword && (
                      <span className="form-error">{passwordErrors.newPassword}</span>
                    )}
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      placeholder="Confirm new password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => {
                        setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                        setPasswordErrors({ ...passwordErrors, confirmPassword: "" })
                      }}
                    />
                    {passwordErrors.confirmPassword && (
                      <span className="form-error">{passwordErrors.confirmPassword}</span>
                    )}
                  </div>

                  <div className="form-group full-width">
                    <button
                      type="button"
                      className="primary-action"
                      onClick={handlePasswordRequest}
                    >
                      <MdLock />
                      Update Password
                    </button>
                  </div>
                </div>
              )}

              {/* Company Details Tab */}
              {activeTab === "company" && (
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="companyName">Company Name *</label>
                    <input
                      type="text"
                      id="companyName"
                      name="name"
                      value={companyData.name}
                      onChange={handleCompanyChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="contactEmail">Company Email</label>
                    <input
                      type="email"
                      id="contactEmail"
                      name="contactEmail"
                      value={companyData.contactEmail}
                      onChange={handleCompanyChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="contactPhone">Company Phone</label>
                    <input
                      type="text"
                      id="contactPhone"
                      name="contactPhone"
                      value={companyData.contactPhone}
                      onChange={handleCompanyChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="website">Website (optional)</label>
                    <input
                      type="text"
                      id="website"
                      name="website"
                      value={companyData.website}
                      onChange={handleCompanyChange}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="address">Company Address</label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={companyData.address}
                      onChange={handleCompanyChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="employees">Total Employees</label>
                    <input
                      type="number"
                      id="employees"
                      name="employees"
                      value={companyData.employees}
                      onChange={handleCompanyChange}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Departments</label>
                    <div className="departments-list">
                      {companyData.departments.map((dept, idx) => (
                        <div key={idx} className="department-row">
                          <input
                            type="text"
                            name="departmentName"
                            placeholder="Department Name"
                            value={dept.name}
                            onChange={(e) => handleCompanyChange(e, idx)}
                          />
                          <input
                            type="text"
                            name="departmentHead"
                            placeholder="Department Head"
                            value={dept.head}
                            onChange={(e) => handleCompanyChange(e, idx)}
                          />
                        </div>
                      ))}
                      <button
                        type="button"
                        className="secondary-action"
                        onClick={addDepartment}
                      >
                        + Add Department
                      </button>
                    </div>
                  </div>

                  <div className="form-group full-width">
                    <button
                      type="button"
                      className="primary-action"
                      onClick={handleSaveInfo}
                    >
                      <MdSave />
                      Save Company Info
                    </button>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === "notifications" && (
                <div className="notifications-grid">
                  {Object.entries(notifications).map(([key, value]) => (
                    <div key={key} className="notification-item">
                      <div className="notification-info">
                        <h4>{key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}</h4>
                        <p>Receive {key.replace(/([A-Z])/g, " $1").toLowerCase()} updates</p>
                      </div>
                      <label className="custom-switch">
                        <input
                          type="checkbox"
                          name={key}
                          checked={value}
                          onChange={handleNotificationChange}
                        />
                        <span className="switch-slider"></span>
                      </label>
                    </div>
                  ))}

                  <div className="form-group full-width">
                    <button
                      type="button"
                      className="primary-action"
                      onClick={handleSaveNotifications}
                    >
                      <MdSave />
                      Save Preferences
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
