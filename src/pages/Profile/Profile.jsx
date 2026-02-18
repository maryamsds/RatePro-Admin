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
    <div className="w-full">
      {/* Loading Overlay */}
      {isUploading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="w-12 h-12 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Page Header */}
      <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] border-b border-[var(--light-border)] dark:border-[var(--dark-border)] mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-[var(--primary-light)] flex items-center justify-center text-[var(--primary-color)] text-2xl flex-shrink-0">
              <MdPerson />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">Profile Settings</h1>
              <p className="text-sm text-[var(--text-secondary)]">Manage your account settings and preferences</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeTab === "profile" && (
              isEditing ? (
                <>
                  <button onClick={handleCancel} className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] border border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-[var(--light-hover)] hover:bg-opacity-10 flex items-center gap-2">
                    <MdCancel />
                    Cancel
                  </button>
                  <button onClick={handleSave} className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)] flex items-center gap-2">
                    <MdSave />
                    Save Changes
                  </button>
                </>
              ) : (
                <button onClick={() => setIsEditing(true)} className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)] flex items-center gap-2">
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4" onClick={() => { setShowAlert(false); setSaved(false); }}>
          <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-lg shadow-lg p-6 max-w-md w-full border border-[var(--success-color)] flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[var(--success-light)] flex items-center justify-center text-[var(--success-color)] text-xl flex-shrink-0">
              <MdCheck />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">Success!</h4>
              <p className="text-sm text-[var(--text-secondary)]">Your changes have been saved successfully!</p>
            </div>
            <button className="w-8 h-8 rounded-full hover:bg-[var(--light-hover)] hover:bg-opacity-10 flex items-center justify-center text-[var(--text-secondary)] transition-colors" onClick={() => { setShowAlert(false); setSaved(false); }}>
              <MdClose />
            </button>
          </div>
        </div>
      )}

      {/* Profile Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Profile Sidebar */}
        <div className="lg:col-span-4">
          <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
            <div className="p-6 text-center border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <div className="relative inline-block mb-4">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[var(--primary-color)] bg-gray-200 dark:bg-gray-700">
                  {userData?.avatar?.url ? (
                    <img
                      src={userData.avatar.url}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="w-full h-full flex items-center justify-center text-3xl font-bold text-[var(--primary-color)]">
                      {userData?.name?.charAt(0)?.toUpperCase() || <MdPerson />}
                    </span>
                  )}
                </div>

                <input
                  id="avatarUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />

                <label htmlFor="avatarUpload" className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[var(--primary-color)] text-white flex items-center justify-center cursor-pointer hover:bg-[var(--primary-hover)] transition-colors">
                  <MdCamera />
                </label>
              </div>

              <div className="mb-4">
                <h3 className="text-xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">
                  {formData.firstName} {formData.lastName}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] mb-2">{formData.email}</p>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-[var(--primary-light)] text-[var(--primary-color)]">
                  {capitalize(formData.role)}
                </span>
              </div>

              {formData.bio && (
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{formData.bio}</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4 p-6">
              <div className="text-center">
                <div className="w-10 h-10 rounded-full bg-[var(--primary-light)] flex items-center justify-center text-[var(--primary-color)] text-lg mx-auto mb-2">
                  <MdAssessment />
                </div>
                <div className="text-lg font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">24</div>
                <div className="text-xs text-[var(--text-secondary)]">Surveys</div>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 rounded-full bg-[var(--primary-light)] flex items-center justify-center text-[var(--primary-color)] text-lg mx-auto mb-2">
                  <MdPeople />
                </div>
                <div className="text-lg font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">1.2K</div>
                <div className="text-xs text-[var(--text-secondary)]">Responses</div>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 rounded-full bg-[var(--primary-light)] flex items-center justify-center text-[var(--primary-color)] text-lg mx-auto mb-2">
                  <MdTrendingUp />
                </div>
                <div className="text-lg font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">78%</div>
                <div className="text-xs text-[var(--text-secondary)]">Completion</div>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Section */}
        <div className="lg:col-span-8">
          <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
            {/* Custom Tab Navigation */}
            <div className="flex flex-wrap gap-2 p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <button 
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${activeTab === "profile" ? "bg-[var(--primary-color)] text-white" : "bg-transparent text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--primary-light)]"}`}
                onClick={() => setActiveTab("profile")}
              >
                <MdPerson />
                <span className="hidden sm:inline">Personal Info</span>
              </button>
              <button 
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${activeTab === "security" ? "bg-[var(--primary-color)] text-white" : "bg-transparent text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--primary-light)]"}`}
                onClick={() => setActiveTab("security")}
              >
                <MdLock />
                <span className="hidden sm:inline">Security</span>
              </button>
              {(user?.role === "company" || user?.role === "companyAdmin") && (
                <button 
                  className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${activeTab === "company" ? "bg-[var(--primary-color)] text-white" : "bg-transparent text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--primary-light)]"}`}
                  onClick={() => setActiveTab("company")}
                >
                  <MdBusiness />
                  <span className="hidden sm:inline">Company Details</span>
                </button>
              )}
              <button 
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${activeTab === "notifications" ? "bg-[var(--primary-color)] text-white" : "bg-transparent text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--primary-light)]"}`}
                onClick={() => setActiveTab("notifications")}
              >
                <MdNotifications />
                <span className="hidden sm:inline">Notifications</span>
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {/* Personal Info Tab */}
              {activeTab === "profile" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">First Name *</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    />
                    {formErrors.firstName && (
                      <span className="text-xs text-[var(--danger-color)]">{formErrors.firstName}</span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="lastName" className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    />
                    {formErrors.lastName && (
                      <span className="text-xs text-[var(--danger-color)]">{formErrors.lastName}</span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      disabled
                      className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="phone" className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Phone</label>
                    <input
                      type="text"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    />
                    {formErrors.phone && (
                      <span className="text-xs text-[var(--danger-color)]">{formErrors.phone}</span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="role" className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Role</label>
                    <input
                      type="text"
                      id="role"
                      name="role"
                      value={formData.role}
                      disabled
                      className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label htmlFor="bio" className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Bio</label>
                    <textarea
                      id="bio"
                      name="bio"
                      rows="3"
                      value={formData.bio}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors resize-none"
                    ></textarea>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === "security" && (
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Current Password</label>
                    <input
                      type="password"
                      id="currentPassword"
                      placeholder="Enter current password"
                      value={passwordData.currentPassword}
                      onChange={(e) => {
                        setPasswordData({ ...passwordData, currentPassword: e.target.value })
                        setPasswordErrors({ ...passwordErrors, currentPassword: "" })
                      }}
                      className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition-colors placeholder:text-[var(--text-secondary)]"
                    />
                    {passwordErrors.currentPassword && (
                      <span className="text-xs text-[var(--danger-color)]">{passwordErrors.currentPassword}</span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="newPassword" className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">New Password</label>
                    <input
                      type="password"
                      id="newPassword"
                      placeholder="Enter new password"
                      value={passwordData.newPassword}
                      onChange={(e) => {
                        setPasswordData({ ...passwordData, newPassword: e.target.value })
                        setPasswordErrors({ ...passwordErrors, newPassword: "" })
                      }}
                      className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition-colors placeholder:text-[var(--text-secondary)]"
                    />
                    {passwordErrors.newPassword && (
                      <span className="text-xs text-[var(--danger-color)]">{passwordErrors.newPassword}</span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Confirm Password</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      placeholder="Confirm new password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => {
                        setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                        setPasswordErrors({ ...passwordErrors, confirmPassword: "" })
                      }}
                      className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition-colors placeholder:text-[var(--text-secondary)]"
                    />
                    {passwordErrors.confirmPassword && (
                      <span className="text-xs text-[var(--danger-color)]">{passwordErrors.confirmPassword}</span>
                    )}
                  </div>

                  <div className="pt-4">
                    <button
                      type="button"
                      className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)] flex items-center gap-2"
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="companyName" className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Company Name *</label>
                    <input
                      type="text"
                      id="companyName"
                      name="name"
                      value={companyData.name}
                      onChange={handleCompanyChange}
                      className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="contactEmail" className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Company Email</label>
                    <input
                      type="email"
                      id="contactEmail"
                      name="contactEmail"
                      value={companyData.contactEmail}
                      onChange={handleCompanyChange}
                      className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="contactPhone" className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Company Phone</label>
                    <input
                      type="text"
                      id="contactPhone"
                      name="contactPhone"
                      value={companyData.contactPhone}
                      onChange={handleCompanyChange}
                      className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="website" className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Website (optional)</label>
                    <input
                      type="text"
                      id="website"
                      name="website"
                      value={companyData.website}
                      onChange={handleCompanyChange}
                      className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition-colors"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Company Address</label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={companyData.address}
                      onChange={handleCompanyChange}
                      className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="employees" className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Total Employees</label>
                    <input
                      type="number"
                      id="employees"
                      name="employees"
                      value={companyData.employees}
                      onChange={handleCompanyChange}
                      className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition-colors"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-2">Departments</label>
                    <div className="space-y-3">
                      {companyData.departments.map((dept, idx) => (
                        <div key={idx} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input
                            type="text"
                            name="departmentName"
                            placeholder="Department Name"
                            value={dept.name}
                            onChange={(e) => handleCompanyChange(e, idx)}
                            className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition-colors placeholder:text-[var(--text-secondary)]"
                          />
                          <input
                            type="text"
                            name="departmentHead"
                            placeholder="Department Head"
                            value={dept.head}
                            onChange={(e) => handleCompanyChange(e, idx)}
                            className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition-colors placeholder:text-[var(--text-secondary)]"
                          />
                        </div>
                      ))}
                      <button
                        type="button"
                        className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] border border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-[var(--primary-light)] hover:text-[var(--primary-color)]"
                        onClick={addDepartment}
                      >
                        + Add Department
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 md:col-span-2">
                    <button
                      type="button"
                      className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)] flex items-center gap-2"
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
                <div className="space-y-4">
                  {Object.entries(notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-4 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)]">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">{key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}</h4>
                        <p className="text-xs text-[var(--text-secondary)]">Receive {key.replace(/([A-Z])/g, " $1").toLowerCase()} updates</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name={key}
                          checked={value}
                          onChange={handleNotificationChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--primary-color)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary-color)]"></div>
                      </label>
                    </div>
                  ))}

                  <div className="pt-4">
                    <button
                      type="button"
                      className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)] flex items-center gap-2"
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
