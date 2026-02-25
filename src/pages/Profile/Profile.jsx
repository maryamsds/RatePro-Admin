import { useEffect, useState, useMemo } from "react"
import {
  MdPerson, MdSecurity, MdNotifications, MdEdit, MdSave, MdCancel,
  MdCheck, MdClose, MdEmail, MdPhone, MdWork, MdInfo,
  MdBusiness, MdLanguage, MdAccessTime, MdLock, MdRefresh,
  MdCamera, MdAssessment, MdPeople, MdTrendingUp, MdSend,
  MdHistory, MdPending, MdCheckCircle, MdError
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

  // Notification prefs aligned with backend User.notificationPreferences schema
  const [notifications, setNotifications] = useState({
    inApp: true,
    email: true,
    actionAssigned: true,
    actionEscalated: true,
    actionOverdue: true,
    actionCompleted: true,
    surveyResponses: true,
    systemAlerts: true,
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

  // Company change request state
  const [changeRequestModal, setChangeRequestModal] = useState(false)
  const [proposedChanges, setProposedChanges] = useState({})
  const [requestHistory, setRequestHistory] = useState([])
  const [pendingRequest, setPendingRequest] = useState(null)

  // Sidebar stats
  const [profileStats, setProfileStats] = useState({ surveys: 0, responses: 0, completion: 0 })

  // Password validation
  const passwordRules = useMemo(() => {
    const pw = passwordData.newPassword
    return [
      { label: "At least 8 characters", met: pw.length >= 8 },
      { label: "1 uppercase letter", met: /[A-Z]/.test(pw) },
      { label: "1 lowercase letter", met: /[a-z]/.test(pw) },
      { label: "1 number", met: /[0-9]/.test(pw) },
      { label: "1 special character", met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(pw) },
      { label: "Does not contain email", met: !formData.email || !pw.toLowerCase().includes(formData.email.split("@")[0]?.toLowerCase()) || pw.length === 0 },
    ]
  }, [passwordData.newPassword, formData.email])

  const allPasswordRulesMet = useMemo(() => {
    return passwordData.newPassword.length > 0 && passwordRules.every(r => r.met)
  }, [passwordRules, passwordData.newPassword])

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
        })

        setUserId(user._id)
        setUserData(user)
        setUser(user)

        // Load notification prefs from user model
        if (user.notificationPreferences) {
          setNotifications(prev => ({ ...prev, ...user.notificationPreferences }))
        }

        if (user.tenant && (user.role === "companyAdmin" || user.role === "member")) {
          const tenant = user.tenant
          setCompanyData({
            name: tenant.name || "",
            address: tenant.address || "",
            contactEmail: tenant.contactEmail || "",
            contactPhone: tenant.contactPhone || "",
            website: tenant.website || "",
            employees: tenant.totalEmployees || "",
            departments: tenant.departments?.map(dept => ({
              _id: dept._id,
              name: dept.name,
            })) || [],
          })
        }

        // Fetch sidebar stats (tenant users only)
        if (user.role !== "admin") {
          try {
            const statsRes = await axiosInstance.get("/analytics/executive-dashboard")
            const m = statsRes.data?.metrics || {}
            setProfileStats({
              surveys: m.totalSurveys || 0,
              responses: m.totalResponses || 0,
              completion: m.completionRate || 0,
            })
          } catch { /* keep defaults */ }
        }

        // Fetch change request history (companyAdmin only)
        if (user.role === "companyAdmin") {
          try {
            const reqRes = await axiosInstance.get("/profile-updates")
            const requests = reqRes.data?.data?.requests || []
            setRequestHistory(requests)
            const pending = requests.find(r => r.status === "pending")
            setPendingRequest(pending || null)
          } catch { /* keep empty */ }
        }
      } catch (err) {
        console.error('fetchUserProfile error:', err.response?.data || err.message)
        if (err.response?.status === 401 || err.response?.status === 404) {
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

    // Check frontend validation rules
    if (newPassword && !allPasswordRulesMet) {
      errors.newPassword = "Password does not meet all requirements"
    }

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
      const failures = err.response?.data?.failures || []
      Swal.close()

      if (msg.toLowerCase().includes("current password")) {
        setPasswordErrors((prev) => ({ ...prev, currentPassword: msg }))
      } else if (failures.length > 0) {
        Swal.fire({
          icon: "error",
          title: "Password Requirements Not Met",
          html: `<ul style="text-align:left;margin:0;padding-left:1.2em">${failures.map(f => `<li>${f}</li>`).join("")}</ul>`,
        })
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
          [name === "departmentName" ? "name" : name]: value,
        }
        return { ...prev, departments: updatedDepartments }
      }
      return { ...prev, [name]: value }
    })
  }

  const addDepartment = () => {
    setCompanyData((prev) => ({
      ...prev,
      departments: [...prev.departments, { _id: "", name: "" }],
    }))
  }

  // Submit company change request via approval workflow (companyAdmin)
  const handleRequestChange = async () => {
    try {
      // Build only changed fields
      const changes = {}
      if (proposedChanges.name !== undefined && proposedChanges.name !== companyData.name) changes.name = proposedChanges.name
      if (proposedChanges.address !== undefined && proposedChanges.address !== companyData.address) changes.address = proposedChanges.address
      if (proposedChanges.contactEmail !== undefined && proposedChanges.contactEmail !== companyData.contactEmail) changes.contactEmail = proposedChanges.contactEmail
      if (proposedChanges.contactPhone !== undefined && proposedChanges.contactPhone !== companyData.contactPhone) changes.contactPhone = proposedChanges.contactPhone
      if (proposedChanges.website !== undefined && proposedChanges.website !== companyData.website) changes.website = proposedChanges.website
      if (proposedChanges.totalEmployees !== undefined && String(proposedChanges.totalEmployees) !== String(companyData.employees)) changes.totalEmployees = Number(proposedChanges.totalEmployees)

      if (Object.keys(changes).length === 0) {
        Swal.fire({ icon: "info", title: "No Changes", text: "No fields were modified." })
        return
      }

      Swal.fire({
        title: "Submitting Request...",
        text: "Your change request will be sent to the System Admin for approval.",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      })

      const res = await axiosInstance.post("/profile-updates", { changes })

      setChangeRequestModal(false)
      setPendingRequest(res.data?.data || null)
      setRequestHistory(prev => [res.data?.data, ...prev].filter(Boolean))

      Swal.fire({
        icon: "success",
        title: "Request Submitted",
        text: "Your company profile change request has been submitted for admin approval.",
        timer: 3000,
        showConfirmButton: false,
      })
    } catch (err) {
      Swal.close()
      const msg = err.response?.data?.message || "Failed to submit request"
      Swal.fire({ icon: "error", title: "Request Failed", text: msg })
    }
  }

  // Save departments directly (no approval needed)
  const handleSaveDepartments = async () => {
    try {
      Swal.fire({
        title: "Saving Departments...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      })

      const tenantPayload = {
        departments: companyData.departments.map((dept) => ({
          _id: dept._id || undefined,
          name: dept.name,
        })),
      }

      const response = await axiosInstance.put(`/tenants/${user.tenant?._id}`, tenantPayload)

      if (response.status === 200) {
        updateCompanyInfo(response.data.tenant)
        Swal.fire({
          icon: "success",
          title: "Departments Updated",
          text: "Department changes saved successfully!",
          timer: 2000,
          showConfirmButton: false,
        })
      }
    } catch (error) {
      Swal.close()
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: error.response?.data?.message || "Could not save departments.",
      })
    }
  }

  // Save notification preferences to backend
  const handleSaveNotifications = async () => {
    try {
      await axiosInstance.put("/settings/notifications", notifications)
      Swal.fire({
        icon: "success",
        title: "Preferences Saved",
        text: "Notification preferences updated.",
        timer: 2000,
        showConfirmButton: false,
      })
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: err.response?.data?.message || "Could not save notification preferences.",
      })
    }
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
                <div className="text-lg font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">{profileStats.surveys}</div>
                <div className="text-xs text-[var(--text-secondary)]">Surveys</div>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 rounded-full bg-[var(--primary-light)] flex items-center justify-center text-[var(--primary-color)] text-lg mx-auto mb-2">
                  <MdPeople />
                </div>
                <div className="text-lg font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">{profileStats.responses >= 1000 ? `${(profileStats.responses / 1000).toFixed(1)}K` : profileStats.responses}</div>
                <div className="text-xs text-[var(--text-secondary)]">Responses</div>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 rounded-full bg-[var(--primary-light)] flex items-center justify-center text-[var(--primary-color)] text-lg mx-auto mb-2">
                  <MdTrendingUp />
                </div>
                <div className="text-lg font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">{profileStats.completion}%</div>
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
              {(user?.role === "companyAdmin" || user?.role === "member") && (
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

                    {/* Live Password Rules Checklist */}
                    {passwordData.newPassword.length > 0 && (
                      <div className="mt-2 p-3 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)]">
                        <p className="text-xs font-medium text-[var(--text-secondary)] mb-2">Password Requirements:</p>
                        <ul className="space-y-1">
                          {passwordRules.map((rule, i) => (
                            <li key={i} className={`flex items-center gap-2 text-xs ${rule.met ? "text-[var(--success-color)]" : "text-[var(--danger-color)]"}`}>
                              {rule.met ? <MdCheckCircle className="flex-shrink-0" /> : <MdError className="flex-shrink-0" />}
                              {rule.label}
                            </li>
                          ))}
                        </ul>
                      </div>
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
                      disabled={!allPasswordRulesMet || !passwordData.currentPassword || passwordData.newPassword !== passwordData.confirmPassword}
                      className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2 ${allPasswordRulesMet && passwordData.currentPassword && passwordData.newPassword === passwordData.confirmPassword ? "bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)]" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
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
                <div>
                  {/* Pending Request Banner */}
                  {pendingRequest && (
                    <div className="mb-4 p-3 rounded-md border border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 flex items-center gap-3">
                      <MdPending className="text-yellow-500 text-xl flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Change Request Pending</p>
                        <p className="text-xs text-yellow-600 dark:text-yellow-400">A company profile change request is awaiting admin approval.</p>
                      </div>
                    </div>
                  )}

                  {/* Company Fields — read-only for companyAdmin & member, editable only in modal */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[{ id: "companyName", name: "name", label: "Company Name *", type: "text" },
                    { id: "contactEmail", name: "contactEmail", label: "Company Email", type: "email" },
                    { id: "contactPhone", name: "contactPhone", label: "Company Phone", type: "text" },
                    { id: "website", name: "website", label: "Website (optional)", type: "text" },
                    { id: "address", name: "address", label: "Company Address", type: "text", colSpan: true },
                    { id: "employees", name: "employees", label: "Total Employees", type: "number" },
                    ].map((field) => (
                      <div key={field.id} className={`space-y-2 ${field.colSpan ? "md:col-span-2" : ""}`}>
                        <label htmlFor={field.id} className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">{field.label}</label>
                        <input
                          type={field.type}
                          id={field.id}
                          name={field.name}
                          value={companyData[field.name]}
                          disabled
                          className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Request Change button — companyAdmin only */}
                  {user?.role === "companyAdmin" && (
                    <div className="pt-4 flex flex-wrap gap-3">
                      <button
                        type="button"
                        disabled={!!pendingRequest}
                        className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2 ${pendingRequest ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)]"}`}
                        onClick={() => {
                          setProposedChanges({
                            name: companyData.name,
                            address: companyData.address,
                            contactEmail: companyData.contactEmail,
                            contactPhone: companyData.contactPhone,
                            website: companyData.website,
                            totalEmployees: companyData.employees,
                          })
                          setChangeRequestModal(true)
                        }}
                      >
                        <MdSend />
                        Request Change
                      </button>
                    </div>
                  )}

                  {/* Departments Section — editable by companyAdmin */}
                  <div className="mt-6 pt-4 border-t border-[var(--light-border)] dark:border-[var(--dark-border)]">
                    <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-3">Departments</label>
                    <div className="space-y-3">
                      {companyData.departments.map((dept, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <input
                            type="text"
                            name="departmentName"
                            placeholder="Department Name"
                            value={dept.name}
                            disabled={user?.role !== "companyAdmin"}
                            onChange={(e) => handleCompanyChange(e, idx)}
                            className="flex-1 px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors placeholder:text-[var(--text-secondary)]"
                          />
                        </div>
                      ))}
                      {user?.role === "companyAdmin" && (
                        <div className="flex gap-3">
                          <button
                            type="button"
                            className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] border border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-[var(--primary-light)] hover:text-[var(--primary-color)]"
                            onClick={addDepartment}
                          >
                            + Add Department
                          </button>
                          <button
                            type="button"
                            className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)] flex items-center gap-2"
                            onClick={handleSaveDepartments}
                          >
                            <MdSave />
                            Save Departments
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Request History — companyAdmin only */}
                  {user?.role === "companyAdmin" && requestHistory.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-[var(--light-border)] dark:border-[var(--dark-border)]">
                      <h3 className="text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-3 flex items-center gap-2">
                        <MdHistory /> Change Request History
                      </h3>
                      <div className="space-y-2">
                        {requestHistory.slice(0, 5).map((req) => (
                          <div key={req._id} className="flex items-center justify-between p-3 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)]">
                            <div>
                              <p className="text-xs text-[var(--text-secondary)]">
                                {new Date(req.createdAt).toLocaleDateString()} — {Object.keys(req.proposedChanges || {}).join(", ")}
                              </p>
                              {req.reviewNote && (
                                <p className="text-xs text-[var(--text-secondary)] mt-1 italic">Note: {req.reviewNote}</p>
                              )}
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${req.status === "pending" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300" :
                                req.status === "approved" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" :
                                  "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                              }`}>
                              {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Change Request Modal */}
                  {changeRequestModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4" onClick={() => setChangeRequestModal(false)}>
                      <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-lg shadow-xl p-6 max-w-lg w-full border border-[var(--light-border)] dark:border-[var(--dark-border)]" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">Request Company Profile Change</h3>
                        <p className="text-xs text-[var(--text-secondary)] mb-4">Changes will be submitted to the System Admin for approval.</p>
                        <div className="grid grid-cols-1 gap-3 max-h-[60vh] overflow-y-auto">
                          {[{ key: "name", label: "Company Name" },
                          { key: "contactEmail", label: "Email" },
                          { key: "contactPhone", label: "Phone" },
                          { key: "website", label: "Website" },
                          { key: "address", label: "Address" },
                          { key: "totalEmployees", label: "Total Employees", type: "number" },
                          ].map((f) => (
                            <div key={f.key} className="space-y-1">
                              <label className="block text-xs font-medium text-[var(--text-secondary)]">{f.label}</label>
                              <input
                                type={f.type || "text"}
                                value={proposedChanges[f.key] ?? ""}
                                onChange={(e) => setProposedChanges(prev => ({ ...prev, [f.key]: e.target.value }))}
                                className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition-colors text-sm"
                              />
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-[var(--light-border)] dark:border-[var(--dark-border)]">
                          <button
                            className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] border border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-[var(--light-hover)]"
                            onClick={() => setChangeRequestModal(false)}
                          >
                            Cancel
                          </button>
                          <button
                            className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)] flex items-center gap-2"
                            onClick={handleRequestChange}
                          >
                            <MdSend />
                            Submit Request
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
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
