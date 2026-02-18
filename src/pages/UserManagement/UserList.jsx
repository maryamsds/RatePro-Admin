// // src\pages\UserManagement\UserList.jsx
"use client"

import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
// react-bootstrap removed — using native HTML + Bootstrap 5 classes
import {
  MdEdit,
  MdDelete,
  MdSearch,
  MdAdd,
  MdPerson,
  MdToggleOn,
  MdToggleOff,
  MdPictureAsPdf,
  MdEmail,
  MdCloudUpload,
  MdGroup,
  MdFilterList,
  MdViewList,
  MdViewModule,
  MdCheckCircle,
  MdCancel,
  MdVerified,
  MdClose,
  MdDownload,
  MdUpload,
  MdRefresh,
  MdMoreVert
} from "react-icons/md"
import Pagination from "../../components/Pagination/Pagination.jsx"
import axiosInstance, { deleteUserById, exportUserPDF, sendUserNotification, toggleUserActiveStatus } from "../../api/axiosInstance.js"
import { capitalize } from "../../utilities/capitalize.jsx"
import EmailModal from "../../components/Modal/EmailModal.jsx"
import { toast } from "react-toastify"
import Swal from "sweetalert2"
import { useAuth } from "../../context/AuthContext.jsx"


const UserList = ({ darkMode }) => {
  const { user: currentUser, hasPermission, globalLoading, setGlobalLoading } = useAuth();
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [currentUserId, setCurrentUserId] = useState(null)
  const [filters, setFilters] = useState({
    role: "",
    status: "",
  })
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 })
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [emailSubject, setEmailSubject] = useState("")
  const [emailMessage, setEmailMessage] = useState("")
  const [selectedEmail, setSelectedEmail] = useState("")
  const [sending, setSending] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState("")
  const [show, setShow] = useState(false);
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const [viewMode, setViewMode] = useState('cards') // 'cards' or 'table'
  const [showFilters, setShowFilters] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    verified: 0,
    admins: 0,
    members: 0
  })
  // const { loading: authLoading } = useAuth(); 

  const isMember = currentUser?.role === "member";

  const memberCanCreate = !isMember || hasPermission("user:create");
  const memberCanUpdate = !isMember || hasPermission("user:update");
  const memberCanDelete = !isMember || hasPermission("user:delete");
  const memberCanAssign = !isMember || hasPermission("user:assign");
  const memberCanRead = !isMember || hasPermission("user:read");
  const memberCanToggle = !isMember || hasPermission("user:toggle");
  const memberCanExport = !isMember || hasPermission("user:export");
  const memberCanNotify = !isMember || hasPermission("user:notify");
  const memberCanUpload = !isMember || hasPermission("user:mass-upload");
  const memberCanDownload = !isMember || hasPermission("user:file-template");

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setDebouncedSearch(searchTerm)
    }, 500)
    return () => clearTimeout(delayDebounce)
  }, [searchTerm])

  useEffect(() => {
    fetchUsers()
  }, [debouncedSearch, filters.role, filters.status, pagination.page])

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem("authUser"))
    setCurrentUserId(loggedInUser?._id || null)
  }, [])

  // Fetch Users Function
  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await axiosInstance.get("/users", {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          search: debouncedSearch,
          role: filters.role,
          active:
            filters.status === "active"
              ? "true"
              : filters.status === "inactive"
                ? "false"
                : undefined,
        },
      })

      const { users, total, page: currentPage } = response.data

      const authUser = JSON.parse(localStorage.getItem("authUser"))
      const loggedInUserId = authUser?._id
      const loggedInUserRole = authUser?.role?.toLowerCase();
      const processedUsers = users
        .filter((user) => {
          // Exclude the logged-in user
          if (user._id === loggedInUserId) return false;
          // If logged-in user is a member, exclude admin and companyAdmin roles
          if (loggedInUserRole === "member") {
            return !["admin", "companyAdmin"].includes(user.role);
          }
          return true;
        }).map((user) => ({
          ...user,
          status: user.isActive ? "Active" : "Inactive",
          companyName: user.tenant?.name || "-",
        }))

      setUsers(processedUsers)
      setPagination((prev) => ({ ...prev, page: currentPage, total }))

      // Calculate stats
      const activeUsers = processedUsers.filter(u => u.isActive).length
      const verifiedUsers = processedUsers.filter(u => u.isVerified).length
      const admins = processedUsers.filter(u => u.role === 'companyAdmin').length
      const members = processedUsers.filter(u => u.role === 'member').length

      setStats({
        total: processedUsers.length,
        active: activeUsers,
        inactive: processedUsers.length - activeUsers,
        verified: verifiedUsers,
        admins,
        members
      })
    } catch (error) {
      console.error("Failed to fetch users", error)
      toast.error(error.response?.data?.message || "Failed to fetch users")
    } finally {
      setLoading(false)
    }
  }

  //  Handle Filter Change
  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  // Handle Delete User
  const handleDeleteUser = async (userId) => {
    if (userId === currentUserId) {
      Swal.fire({
        icon: "error",
        title: "Action Forbidden",
        text: "You cannot delete your own account!",
      })
      return
    }

    // 🔹 User ko list se find karo
    const targetUser = users.find((u) => u._id === userId)
    const targetUserRole = targetUser?.role || "member" // fallback safe

    const getDeleteMessage = (role) => {
      if (role === "member") {
        return "This user will be deleted!"
      }
      if (role === "companyAdmin") {
        return "This company admin and all associated members will be deleted!"
      }
      return "This user and associated members will be deleted!"
    }

    const result = await Swal.fire({
      title: "Are you sure?",
      text: getDeleteMessage(targetUserRole), // ✅ ab role available hai
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    })

    if (result.isConfirmed) {
      try {
        const res = await deleteUserById(userId)
        const { deletedUserId, affectedUsers, deletedUserRole } = res.data

        setUsers((prev) =>
          prev.filter(
            (user) => user._id !== deletedUserId && !affectedUsers.includes(user._id)
          )
        )
        setPagination((prev) => ({
          ...prev,
          total: prev.total - (1 + affectedUsers.length),
        }))
        if (users.length === 1 && pagination.page > 1) {
          setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
        }

        // ✅ role based success message
        if (deletedUserRole === "member") {
          toast.success("User deleted successfully")
          Swal.fire("Deleted!", "User has been deleted.", "success")
        } else {
          toast.success(res.data.message || "User and associated members deleted successfully")
          Swal.fire("Deleted!", "User and associated members have been deleted.", "success")
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete user")
      }
    }
  }

  // Handle Toggle Active Status
  const handleToggleActive = async (userId, currentStatus) => {
    try {
      const res = await toggleUserActiveStatus(userId)
      const { updatedUser, affectedUsers } = res.data
      setUsers((prev) =>
        prev.map((user) => {
          if (user._id === updatedUser._id) {
            return {
              ...user,
              isActive: updatedUser.isActive,
              status: updatedUser.isActive ? "Active" : "Inactive",
            }
          }
          const affected = affectedUsers.find((u) => u._id === user._id)
          if (affected) {
            return {
              ...user,
              isActive: affected.isActive,
              status: affected.isActive ? "Active" : "Inactive",
            }
          }
          return user
        })
      )
      toast.success(res.data.message || "User status updated")
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update user status")
    }
  }

  // Get Role Badge Variant
  const getRoleVariant = (role) => {
    const map = {
      admin: "primary",
      companyAdmin: "info",
      member: "dark",
    }
    return map[role] || "secondary"
  }

  // Get Status Badge Variant
  const getStatusVariant = (status) => {
    const map = {
      Active: "success",
      Inactive: "danger",
      Pending: "warning",
    }
    return map[status] || "secondary"
  }

  // Handle Open Email Modal
  const handleOpenEmailModal = (id, email) => {
    setSelectedEmail(email)
    setSelectedUserId(id)
    setShowEmailModal(true)
  }

  // Handle Send Email
  const handleSendEmail = async () => {
    if (!emailSubject.trim() || !emailMessage.trim()) {
      Swal.fire("Error", "Please fill out both subject and message.", "error")
      return
    }

    setSending(true)
    try {
      await sendUserNotification(selectedUserId, emailSubject, emailMessage)
      Swal.fire("Success", "Email sent successfully!", "success")
      setShowEmailModal(false)
      setEmailSubject("")
      setEmailMessage("")
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || "Failed to send email", "error")
    } finally {
      setSending(false)
    }
  }

  // Handle Export User PDF 
  const handleExport = async (userId) => {
    try {
      const response = await exportUserPDF(userId)
      const blob = new Blob([response.data], { type: response.headers["content-type"] })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `user-${userId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      console.error("Export error", err)
      toast.error("Failed to export user PDF")
    }
  }

  const handleShow = () => setShow(true);
  const handleClose = () => {
    setFile(null);
    setShow(false);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Handle File Upload
  const handleFileUpload = async (file) => {
    if (!file) return alert("Please select a file first!");
    const formData = new FormData();
    formData.append("excel", file);

    try {
      setGlobalLoading(true); // 👈 loader start

      const res = await axiosInstance.post("/users/bulk-upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      const { createdUsers = [], errors: rawErrors, message } = res.data;

      const errors = rawErrors || []; // null protection

      const successCount = createdUsers.length;
      const errorCount = errors.length;


      // 🟢 summary HTML
      const summaryHtml = `
        <p><b>${successCount}</b> user(s) created successfully.</p>
        ${successCount > 0 ? "<ul>" + createdUsers.map(u => `<li>${u.email}</li>`).join("") + "</ul>" : ""}

        <p><b>${errorCount}</b> user(s) failed to create.</p>
        ${errorCount > 0 ? "<ul>" + errors.map(e => `<li>${e.email} - ${e.message}</li>`).join("") + "</ul>" : ""}
      `;

      Swal.fire({
        icon: errorCount > 0 ? "warning" : "success",
        title: message || "Bulk user creation processed",
        html: summaryHtml,
        width: 600,
      });

      await fetchUsers(); // 👈 refresh users list
      handleClose();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Upload Failed",
        text: err.response?.data?.message || "Something went wrong while importing users.",
      });
      console.error("❌ Upload error:", err.response?.data || err.message);
    } finally {
      setGlobalLoading(false); // 👈 loader stop
    }
  };

  // Handle No Permission
  const handleNoPermission = (action = "perform this action") => {
    Swal.fire({
      icon: "error",
      title: "Access Denied",
      text: `You don't have permission to ${action}.`,
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchUsers()
    setRefreshing(false)
    toast.success("Users list refreshed")
  }

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)] mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-start gap-3">
              <MdGroup className="w-8 h-8 text-[var(--primary-color)] mt-1" />
              <div>
                <h1 className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">User Management</h1>
                <p className="text-sm text-[var(--text-secondary)] mt-1">Manage users, roles, and permissions</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="px-4 py-2 rounded-md font-medium transition-colors border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-hover)] dark:hover:bg-[var(--dark-hover)] flex items-center gap-2"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <MdRefresh className={refreshing ? 'spinning' : ''} />
            </button>

            {(currentUser?.role === "companyAdmin" || memberCanUpload) && (
              <button
                type="button"
                className="px-4 py-2 rounded-md font-medium transition-colors border border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-[var(--primary-color)] hover:text-white flex items-center gap-2"
                onClick={handleShow}
                disabled={!memberCanUpdate}
              >
                <MdUpload /> Import
              </button>
            )}

            {(currentUser?.role === "companyAdmin" || memberCanCreate) && (
              <Link to="/app/users/form" className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)] flex items-center gap-2">
                <MdAdd /> Create User
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                <MdGroup className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">{stats.total}</div>
                <div className="text-sm text-[var(--text-secondary)]">Total Users</div>
              </div>
            </div>
          </div>

          <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                <MdCheckCircle className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">{stats.active}</div>
                <div className="text-sm text-[var(--text-secondary)]">Active Users</div>
              </div>
            </div>
          </div>

          <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                <MdVerified className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">{stats.verified}</div>
                <div className="text-sm text-[var(--text-secondary)]">Verified Users</div>
              </div>
            </div>
          </div>

          <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400">
                <MdPerson className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">{stats.admins + stats.members}</div>
                <div className="text-sm text-[var(--text-secondary)]">All Roles</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)] mb-6">
        <div className="mb-4">
          <div className="relative">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] w-5 h-5" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-2">Role</label>
            <select 
              name="role" 
              value={filters.role} 
              onChange={handleFilterChange}
              className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30"
            >
              <option value="">All Roles</option>
              <option value="companyAdmin">Company Admin</option>
              <option value="member">Member</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-2">Status</label>
            <select 
              name="status" 
              value={filters.status} 
              onChange={handleFilterChange}
              className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Content */}
      <div>
        {loading ? (
          <div className="flex flex-col justify-center items-center min-h-[400px] gap-4">
            <div className="w-12 h-12 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[var(--text-secondary)]">Loading users...</p>
          </div>
        ) : (
          <>
            {/* Mobile Cards View */}
            <div className="lg:hidden grid grid-cols-1 gap-4 mb-6">
              {users.map((user, index) => (
                <div key={user._id} className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)] hover:shadow-lg transition-shadow">
                  <div className="p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--primary-color)] to-[var(--primary-hover)] flex items-center justify-center text-white font-semibold">
                          {user.avatar?.url ? (
                            <img src={user.avatar.url} alt={user.name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <span>{user.name?.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <h6 className="font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">{user.name}</h6>
                          <p className="text-sm text-[var(--text-secondary)]">{user.email}</p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-[var(--info-light)] text-[var(--info-color)]">
                          {capitalize(user.role)}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${user.status === "Active" ? "bg-[var(--success-light)] text-[var(--success-color)]" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"}`}>
                          {user.status}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {currentUser.role === "admin" && (
                        <div className="flex justify-between text-sm">
                          <span className="text-[var(--text-secondary)]">Company:</span>
                          <span className="text-[var(--light-text)] dark:text-[var(--dark-text)] font-medium">{user.tenant?.name || "-"}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-[var(--text-secondary)]">Email Status:</span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${user.isVerified ? "bg-[var(--success-light)] text-[var(--success-color)]" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"}`}>
                          {user.isVerified ? <><MdVerified className="mr-1" />Verified</> : "Not Verified"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 flex flex-wrap gap-2">
                    <Link
                      to={`/app/users/${user._id}/edit`}
                      className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors border border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-[var(--primary-color)] hover:text-white flex items-center gap-1"
                      onClick={(e) => {
                        if (!memberCanUpdate) {
                          e.preventDefault();
                          handleNoPermission("update users");
                        }
                      }}
                    >
                      <MdEdit />
                    </Link>

                    <button
                      type="button"
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${user.isActive ? "text-[var(--success-color)]" : "text-gray-400"}`}
                      onClick={() => {
                        if (!memberCanToggle || user._id === currentUserId || user.role === "admin") {
                          handleNoPermission("toggle this user");
                        } else {
                          handleToggleActive(user._id, user.isActive);
                        }
                      }}
                    >
                      {user.isActive ? <MdToggleOn className="w-5 h-5" /> : <MdToggleOff className="w-5 h-5" />}
                    </button>

                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors border border-[var(--info-color)] text-[var(--info-color)] hover:bg-[var(--info-color)] hover:text-white flex items-center gap-1"
                      onClick={() => {
                        if (!memberCanNotify) {
                          handleNoPermission("send notifications");
                        } else {
                          handleOpenEmailModal(user._id, user.email);
                        }
                      }}
                    >
                      <MdEmail />
                    </button>

                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-hover)] dark:hover:bg-[var(--dark-hover)] flex items-center gap-1"
                      onClick={() => {
                        if (!memberCanExport) {
                          handleNoPermission("export users");
                        } else {
                          handleExport(user._id);
                        }
                      }}
                    >
                      <MdPictureAsPdf /> Export
                    </button>

                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors border border-red-500 text-red-500 hover:bg-red-500 hover:text-white flex items-center gap-1"
                      onClick={() => {
                        if (!memberCanDelete || user._id === currentUserId || user.role === "admin") {
                          handleNoPermission("delete this user");
                        } else {
                          handleDeleteUser(user._id);
                        }
                      }}
                    >
                      <MdDelete />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] mb-6">
              <table className="min-w-full border-collapse">
                <thead className="bg-[var(--light-bg)] dark:bg-[var(--dark-bg)]">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">User</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Role</th>
                    {currentUser.role === "admin" && <th className="px-4 py-3 text-left text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Company</th>}
                    <th className="px-4 py-3 text-left text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Email Status</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr key={user._id} className="border-b border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-[var(--light-hover)] dark:hover:bg-[var(--dark-hover)] transition-colors">
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary-color)] to-[var(--primary-hover)] flex items-center justify-center text-white font-semibold">
                            {user.avatar?.url ? (
                              <img src={user.avatar.url} alt={user.name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                              <span>{user.name?.charAt(0)}</span>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">{user.name}</div>
                            <div className="text-xs text-[var(--text-secondary)]">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-[var(--info-light)] text-[var(--info-color)]">
                          {capitalize(user.role)}
                        </span>
                      </td>
                      {currentUser.role === "admin" && (
                        <td className="px-4 py-3 text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">{user.tenant?.name || "-"}</td>
                      )}
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${user.status === "Active" ? "bg-[var(--success-light)] text-[var(--success-color)]" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"}`}>
                          {user.status === "Active" ? <MdCheckCircle className="mr-1" /> : <MdCancel className="mr-1" />}
                          {user.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${user.isVerified ? "bg-[var(--success-light)] text-[var(--success-color)]" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"}`}>
                          {user.isVerified ? <><MdVerified className="mr-1" />Verified</> : "Unverified"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            to={`/app/users/${user._id}/edit`}
                            className="p-2 rounded-md transition-colors border border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-[var(--primary-color)] hover:text-white"
                            onClick={(e) => {
                              if (!memberCanUpdate) {
                                e.preventDefault();
                                handleNoPermission("update users");
                              }
                            }}
                          >
                            <MdEdit />
                          </Link>

                          <button
                            type="button"
                            className={`p-2 rounded-md transition-colors ${user.isActive ? "text-[var(--success-color)]" : "text-gray-400"}`}
                            onClick={() => {
                              if (!memberCanToggle || user._id === currentUserId || user.role === "admin") {
                                handleNoPermission("toggle this user");
                              } else {
                                handleToggleActive(user._id, user.isActive);
                              }
                            }}
                          >
                            {user.isActive ? <MdToggleOn className="w-5 h-5" /> : <MdToggleOff className="w-5 h-5" />}
                          </button>

                          <button
                            type="button"
                            className="p-2 rounded-md transition-colors border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-hover)] dark:hover:bg-[var(--dark-hover)]"
                            onClick={() => {
                              if (!memberCanExport) {
                                handleNoPermission("export users");
                              } else {
                                handleExport(user._id);
                              }
                            }}
                          >
                            <MdPictureAsPdf />
                          </button>

                          <button
                            type="button"
                            className="p-2 rounded-md transition-colors border border-[var(--info-color)] text-[var(--info-color)] hover:bg-[var(--info-color)] hover:text-white"
                            onClick={() => {
                              if (!memberCanNotify) {
                                handleNoPermission("send notifications");
                              } else {
                                handleOpenEmailModal(user._id, user.email);
                              }
                            }}
                          >
                            <MdEmail />
                          </button>

                          <button
                            type="button"
                            className="p-2 rounded-md transition-colors border border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                            onClick={() => {
                              if (!memberCanDelete || user._id === currentUserId || user.role === "admin") {
                                handleNoPermission("delete this user");
                              } else {
                                handleDeleteUser(user._id);
                              }
                            }}
                          >
                            <MdDelete />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {users.length > 0 && (
              <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-4 border border-[var(--light-border)] dark:border-[var(--dark-border)] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="text-sm text-[var(--text-secondary)]">
                  <span>
                    Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
                  </span>
                </div>
                <Pagination
                  current={pagination.page}
                  total={pagination.total}
                  limit={pagination.limit}
                  onChange={(page) => setPagination((prev) => ({ ...prev, page }))}
                  darkMode={darkMode}
                />
              </div>
            )}

            {users.length === 0 && (
              <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <MdPerson className="w-16 h-16 text-[var(--text-secondary)]" />
                <h5 className="text-xl font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">No users found</h5>
                <p className="text-[var(--text-secondary)]">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </>
        )}
      </div>
      <EmailModal
        show={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onSend={handleSendEmail}
        subject={emailSubject}
        setSubject={setEmailSubject}
        message={emailMessage}
        setMessage={setEmailMessage}
        recipientEmail={selectedEmail}
        sending={sending}
      />

      {show && (
        <div className="fixed inset-0 bg-black/50 z-[1040]" onClick={handleClose} />
      )}
      {show && (
        <div className="fixed inset-0 z-[1050] flex items-center justify-center p-4" tabIndex={-1}>
          <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-lg shadow-xl border border-[var(--light-border)] dark:border-[var(--dark-border)] w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <h5 className="text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">Import Contacts</h5>
              <button 
                type="button" 
                className="p-2 rounded-md hover:bg-[var(--light-hover)] dark:hover:bg-[var(--dark-hover)] transition-colors text-[var(--light-text)] dark:text-[var(--dark-text)]" 
                onClick={handleClose}
              >
                <MdClose />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-center text-[var(--text-secondary)]">Upload a .xlsx or .xls file with your contacts</p>
              <input
                className="w-full px-3 py-2 border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-md bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30"
                type="file"
                accept=".xlsx,.xls"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <small className="block text-xs text-[var(--text-secondary)]">
                File should include columns: Name, Email, Phone, Company, Segment
              </small>
              {(currentUser?.role === "companyAdmin" || memberCanDownload) && (
                <div>
                  <a
                    href="/downloads/user-sample.xlsx"
                    download="user-sample.xlsx"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-hover)] dark:hover:bg-[var(--dark-hover)]"
                  >
                    📥 Download Template
                  </a>
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <button 
                type="button" 
                className="px-4 py-2 rounded-md font-medium transition-colors border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-hover)] dark:hover:bg-[var(--dark-hover)]" 
                onClick={handleClose}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--success-color)] text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed" 
                onClick={() => handleFileUpload(file)} 
                disabled={!file}
              >
                Import Contacts
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserList;