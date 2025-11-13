// // src\pages\UserManagement\UserList.jsx
"use client"

import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import {
  Container,
  Row,
  Col,
  Table,
  Badge,
  Button,
  InputGroup,
  Form,
  Card,
  Spinner,
  Modal,
} from "react-bootstrap"
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
    <div className="user-list-container">
      {/* Header Section */}
      <div className="user-list-header">
        <div className="header-content">
          <div className="header-left">
            <div className="page-title-section">
              <MdGroup className="page-icon" />
              <div>
                <h1 className="page-title">User Management</h1>
                <p className="page-subtitle">Manage users, roles, and permissions</p>
              </div>
            </div>
          </div>
          
          <div className="header-actions">
            <Button 
              variant="outline-secondary" 
              onClick={handleRefresh}
              disabled={refreshing}
              className="refresh-btn"
            >
              <MdRefresh className={refreshing ? 'spinning' : ''} />
            </Button>
            
            {(currentUser?.role === "companyAdmin" || memberCanUpload) && (
              <Button
                variant="outline-primary"
                onClick={handleShow}
                disabled={!memberCanUpdate}
                className="import-btn"
              >
                <MdUpload className="me-2" /> Import
              </Button>
            )}
            
            {(currentUser?.role === "companyAdmin" || memberCanCreate) && (
              <Button as={Link} to="/app/users/form" variant="primary" className="create-btn">
                <MdAdd className="me-2" /> Create User
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon total">
              <MdGroup />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.total}</div>
              <div className="stat-label">Total Users</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon active">
              <MdCheckCircle />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.active}</div>
              <div className="stat-label">Active Users</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon verified">
              <MdVerified />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.verified}</div>
              <div className="stat-label">Verified Users</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon admins">
              <MdPerson />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.admins + stats.members}</div>
              <div className="stat-label">All Roles</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="search-filter-section">
        <div className="search-filter-top">
          <div className="search-bar">
            <div className="search-input-group">
              <MdSearch className="search-icon" />
              <Form.Control
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
        </div>
        
        <div className={`filters-row ${showFilters ? 'show' : ''} d-md-grid`}>
          <div className="filter-group">
            <label className="filter-label">Role</label>
            <Form.Select name="role" value={filters.role} onChange={handleFilterChange} size="sm">
              <option value="">All Roles</option>
              <option value="companyAdmin">Company Admin</option>
              <option value="member">Member</option>
            </Form.Select>
          </div>
          
          <div className="filter-group">
            <label className="filter-label">Status</label>
            <Form.Select name="status" value={filters.status} onChange={handleFilterChange} size="sm">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Form.Select>
          </div>
        </div>
      </div>
      <br/>

      {/* Users Content */}
      <div className="users-content">
        {loading ? (
          <div className="loading-state">
            <Spinner animation="border" variant="primary" />
            <p>Loading users...</p>
          </div>
        ) : (
          <>
            {/* Mobile Cards View */}
            <div className={`users-cards d-lg-none ${viewMode === 'cards' ? 'd-block' : 'd-none'}`}>
              {users.map((user, index) => (
                <div key={user._id} className="user-card">
                  <div className="user-card-header">
                    <div className="user-info">
                      <div className="user-avatar">
                        {user.avatar?.url ? (
                          <img src={user.avatar.url} alt={user.name} />
                        ) : (
                          <span>{user.name?.charAt(0)}</span>
                        )}
                      </div>
                      <div className="user-details">
                        <h6 className="user-name">{user.name}</h6>
                        <p className="user-email">{user.email}</p>
                      </div>
                    </div>
                    
                    <div className="user-status-badges">
                      <Badge bg={getRoleVariant(user.role)} className="role-badge">
                        {capitalize(user.role)}
                      </Badge>
                      <Badge bg={user.status === "Active" ? "success" : "secondary"} className="status-badge">
                        {user.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="user-card-body">
                    <div className="user-meta">
                      {currentUser.role === "admin" && (
                        <div className="meta-item">
                          <span className="meta-label">Company:</span>
                          <span className="meta-value">{user.tenant?.name || "-"}</span>
                        </div>
                      )}
                      <div className="meta-item">
                        <span className="meta-label">Email Status:</span>
                        <Badge bg={user.isVerified ? "success" : "secondary"} size="sm">
                          {user.isVerified ? <><MdVerified className="me-1" />Verified</> : "Not Verified"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="user-card-actions">
                    <Button 
                      as={Link} 
                      to={`/app/users/${user._id}/edit`} 
                      size="sm" 
                      variant="outline-primary"
                      onClick={(e) => {
                        if (!memberCanUpdate) {
                          e.preventDefault();
                          handleNoPermission("update users");
                        }
                      }}
                    >
                      <MdEdit />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant={user.isActive ? "outline-success" : "outline-secondary"}
                      onClick={() => {
                        if (!memberCanToggle || user._id === currentUserId || user.role === "admin") {
                          handleNoPermission("toggle this user");
                        } else {
                          handleToggleActive(user._id, user.isActive);
                        }
                      }}
                    >
                      {user.isActive ? <MdToggleOn /> : <MdToggleOff />}
                    </Button>
                    
                    <Button
                      variant="outline-info"
                      size="sm"
                      onClick={() => {
                        if (!memberCanNotify) {
                          handleNoPermission("send notifications");
                        } else {
                          handleOpenEmailModal(user._id, user.email);
                        }
                      }}
                    >
                      <MdEmail />
                    </Button>
                    
                    <div className="dropdown">
                      <Button variant="outline-secondary" size="sm" data-bs-toggle="dropdown">
                        <MdMoreVert />
                      </Button>
                      <ul className="dropdown-menu">
                        <li>
                          <button 
                            className="dropdown-item" 
                            onClick={() => {
                              if (!memberCanExport) {
                                handleNoPermission("export users");
                              } else {
                                handleExport(user._id);
                              }
                            }}
                          >
                            <MdPictureAsPdf className="me-2" /> Export PDF
                          </button>
                        </li>
                        <li><hr className="dropdown-divider" /></li>
                        <li>
                          <button 
                            className="dropdown-item text-danger"
                            onClick={() => {
                              if (!memberCanDelete || user._id === currentUserId || user.role === "admin") {
                                handleNoPermission("delete this user");
                              } else {
                                handleDeleteUser(user._id);
                              }
                            }}
                          >
                            <MdDelete className="me-2" /> Delete User
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Desktop Table View */}
            <div className="users-table d-none d-lg-block">
              <div className="table-responsive">
                <Table hover className="modern-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Role</th>
                      {currentUser.role === "admin" && <th>Company</th>}
                      <th>Status</th>
                      <th>Email Status</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, index) => (
                      <tr key={user._id}>
                        <td>
                          <div className="user-info-cell">
                            <div className="user-avatar">
                              {user.avatar?.url ? (
                                <img src={user.avatar.url} alt={user.name} />
                              ) : (
                                <span>{user.name?.charAt(0)}</span>
                              )}
                            </div>
                            <div className="user-details">
                              <div className="user-name">{user.name}</div>
                              <div className="user-email">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <Badge bg={getRoleVariant(user.role)} className="role-badge">
                            {capitalize(user.role)}
                          </Badge>
                        </td>
                        {currentUser.role === "admin" && (
                          <td className="company-cell">{user.tenant?.name || "-"}</td>
                        )}
                        <td>
                          <Badge bg={user.status === "Active" ? "success" : "secondary"} className="status-badge">
                            {user.status === "Active" ? <MdCheckCircle className="me-1" /> : <MdCancel className="me-1" />}
                            {user.status}
                          </Badge>
                        </td>
                        <td>
                          <Badge bg={user.isVerified ? "success" : "secondary"} className="verification-badge">
                            {user.isVerified ? <><MdVerified className="me-1" />Verified</> : "Unverified"}
                          </Badge>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <Button 
                              as={Link} 
                              to={`/app/users/${user._id}/edit`} 
                              size="sm" 
                              variant="outline-primary"
                              onClick={(e) => {
                                if (!memberCanUpdate) {
                                  e.preventDefault();
                                  handleNoPermission("update users");
                                }
                              }}
                            >
                              <MdEdit />
                            </Button>
                            
                            <Button
                              size="sm"
                              variant={user.isActive ? "outline-success" : "outline-secondary"}
                              onClick={() => {
                                if (!memberCanToggle || user._id === currentUserId || user.role === "admin") {
                                  handleNoPermission("toggle this user");
                                } else {
                                  handleToggleActive(user._id, user.isActive);
                                }
                              }}
                            >
                              {user.isActive ? <MdToggleOn /> : <MdToggleOff />}
                            </Button>
                            
                            <Button 
                              variant="outline-secondary" 
                              size="sm"
                              onClick={() => {
                                if (!memberCanExport) {
                                  handleNoPermission("export users");
                                } else {
                                  handleExport(user._id);
                                }
                              }}
                            >
                              <MdPictureAsPdf />
                            </Button>
                            
                            <Button
                              variant="outline-info"
                              size="sm"
                              onClick={() => {
                                if (!memberCanNotify) {
                                  handleNoPermission("send notifications");
                                } else {
                                  handleOpenEmailModal(user._id, user.email);
                                }
                              }}
                            >
                              <MdEmail />
                            </Button>
                            
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => {
                                if (!memberCanDelete || user._id === currentUserId || user.role === "admin") {
                                  handleNoPermission("delete this user");
                                } else {
                                  handleDeleteUser(user._id);
                                }
                              }}
                            >
                              <MdDelete />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </div>
            
            {/* Pagination */}
            {users.length > 0 && (
              <div className="pagination-section">
                <div className="pagination-info">
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
              <div className="empty-state">
                <MdPerson className="empty-icon" />
                <h5>No users found</h5>
                <p>Try adjusting your search or filter criteria</p>
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

      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Import Contacts</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p className="text-center">Upload a .xlsx or .xls file with your contacts</p>
          <input
            className="w-100 border"
            type="file"
            accept=".xlsx,.xls"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <small className="text-muted">
            File should include columns: Name, Email, Phone, Company, Segment
          </small>
          {(currentUser?.role === "companyAdmin" || memberCanDownload) && (
            <div className="mt-3">
              <a
                href="/downloads/import-sample.xlsx"
                download="import-sample.xlsx"
                className="btn btn-outline-secondary"
              >
                📥 Download Template
              </a>
            </div>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="success" onClick={() => handleFileUpload(file)} disabled={!file}>
            Import Contacts
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default UserList;