// src/pages/AccessManagement/AccessManagement.jsx
"use client"

import { useState, useEffect, useMemo } from "react"
import { Link } from "react-router-dom"
import {
  Container, Row, Col, Card, Table, Badge, Button,
  Form, InputGroup, Dropdown
} from "react-bootstrap"
import {
  MdAdd, MdEdit, MdDelete, MdSearch, MdFilterList,
  MdSecurity, MdGroup, MdVpnKey, MdMoreVert, MdRefresh,
  MdSettings, MdPersonAdd, MdAssignment
} from "react-icons/md"
import Pagination from "../../components/Pagination/Pagination.jsx"
import axiosInstance from "../../api/axiosInstance"
import Swal from "sweetalert2"
import { formatLocalDateTime } from "../../utilities/dateUtils.js";

const AccessManagement = () => {
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 })
  const [permissions, setPermissions] = useState([])
  const [permissionCount, setPermissionCount] = useState(0)
  const [taskAssignments, setTaskAssignments] = useState([])

  // Fetch data
  useEffect(() => {
    let mounted = true
    const fetchAll = async () => {
      try {
        setLoading(true)

        // Fetch users
        let fetchedUsers = []
        try {
          const { data } = await axiosInstance.get("/users", { withCredentials: true })
          const apiUsers = Array.isArray(data?.users) ? data.users : Array.isArray(data) ? data : []
          fetchedUsers = apiUsers.map((u, idx) => ({
            id: u._id || u.id || idx + 1,
            name: u.name || u.fullName || u.username || "Unknown",
            email: u.email || "",
            role: typeof u.role === "string" ? u.role : (u.role?.name || u.roleName || "Member"),
            lastLogin: u.lastLogin || u.lastSeen || "—",
            status: u.isActive === true ? "Active" : "Inactive",
          }))
        } catch (err) {
          console.error("Users fetch error:", err)
        }

        // Fetch roles
        let fetchedRoles = []
        try {
          const { data } = await axiosInstance.get("/roles", { withCredentials: true })
          const apiRoles = Array.isArray(data?.roles) ? data.roles : Array.isArray(data) ? data : []
          const counts = fetchedUsers.reduce((acc, u) => {
            const key = u.role || "Unknown"
            acc[key] = (acc[key] || 0) + 1
            return acc
          }, {})
          fetchedRoles = apiRoles.map((r, idx) => ({
            id: r._id || r.id || idx + 1,
            name: r.name || "Unnamed Role",
            description: r.description || "",
            permissions: r.permissions || [],
            userCount: typeof r.userCount === "number" ? r.userCount : (counts[r.name] || 0),
          }))
        } catch (err) {
          console.error("Roles fetch error:", err)
          const counts = fetchedUsers.reduce((acc, u) => {
            const key = u.role || "Unknown"
            acc[key] = (acc[key] || 0) + 1
            return acc
          }, {})
          fetchedRoles = Object.entries(counts).map(([roleName, count], i) => ({
            id: i + 1,
            name: roleName,
            description: "",
            permissions: [],
            userCount: count,
          }))
        }

        // Fetch permissions
        try {
          const { data } = await axiosInstance.get("/permissions", { withCredentials: true })
          const apiPermissions = Array.isArray(data?.permissions) ? data.permissions : []
          setPermissions(apiPermissions)
          setPermissionCount(apiPermissions.length)
        } catch (err) {
          console.error("Permissions fetch error:", err)
        }

        // Fetch task assignments
        try {
          const { data } = await axiosInstance.get("/task-assignments", { withCredentials: true })
          const assignments = Array.isArray(data?.assignments) ? data.assignments : []
          setTaskAssignments(assignments.map(a => ({
            _id: a._id,
            permissionId: a.permissionId._id,
            permission: a.permissionId.name,
            userId: a.userId._id,
            userName: a.userId.name
          })))
        } catch (err) {
          console.error("Task assignments fetch error:", err)
        }

        if (!mounted) return
        setUsers(fetchedUsers)
        setRoles(fetchedRoles)
        setPagination((prev) => ({ ...prev, total: fetchedUsers.length }))
      } catch (e) {
        console.error("Fetch error:", e)
        Swal.fire("Error", e?.response?.data?.message || "Failed to load access data", "error")
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchAll()
    return () => { mounted = false }
  }, [])

  // src/pages/AccessManagement/AccessManagement.jsx (only relevant parts shown)
  const handleAssignTask = async (permissionId, userId) => {
    try {
      if (!userId || !permissionId) {
        console.error('Missing userId or permissionId', { userId, permissionId });
        Swal.fire('Error', 'Please select a user and permission', 'error');
        return;
      }

      console.log('Sending request to assign task:', { userId, permissionId });

      const { data } = await axiosInstance.post(
        '/task-assignments',
        { permissionId, userId },
        { withCredentials: true }
      );

      setTaskAssignments((prev) => {
        const exists = prev.find((entry) => entry.permissionId === data.assignment.permissionId._id);
        if (exists) {
          return prev.map((entry) =>
            entry.permissionId === data.assignment.permissionId._id
              ? { ...entry, userId: data.assignment.userId._id, userName: data.assignment.userId.name }
              : entry
          );
        } else {
          return [...prev, {
            _id: data.assignment._id,
            permissionId: data.assignment.permissionId._id,
            permission: data.assignment.permissionId.name,
            userId: data.assignment.userId._id,
            userName: data.assignment.userId.name
          }];
        }
      });

      Swal.fire('Success', 'Task assigned successfully', 'success');
    } catch (err) {
      console.error('Assign task error:', err.response?.data || err);
      Swal.fire('Error', err.response?.data?.message || 'Failed to assign task', 'error');
    }
  };

  const handleRemoveTask = async (assignmentId) => {
    try {
      if (!assignmentId) {
        console.error('Missing assignmentId', { assignmentId });
        Swal.fire('Error', 'Invalid assignment ID', 'error');
        return;
      }

      await axiosInstance.delete(`/task-assignments/${assignmentId}`, { withCredentials: true });
      setTaskAssignments((prev) => prev.filter((a) => a._id !== assignmentId));
      Swal.fire('Success', 'Task removed successfully', 'success');
    } catch (err) {
      console.error('Remove task error:', err.response?.data || err);
      Swal.fire('Error', err.response?.data?.message || 'Failed to remove task', 'error');
    }
  };

  // Helpers
  const getStatusVariant = (status) => {
    switch (status) {
      case "Active": return "success"
      case "Inactive": return "danger"
      case "Pending": return "warning"
      default: return "secondary"
    }
  }

  const getRoleVariant = (role) => {
    switch (role) {
      case "Admin": return "danger"
      case "Editor": return "primary"
      case "Viewer": return "secondary"
      case "HR Manager": return "info"
      default: return "dark"
    }
  }

  // Search + Pagination
  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return users
    return users.filter((u) =>
      (u.name || "").toLowerCase().includes(term) ||
      (u.email || "").toLowerCase().includes(term) ||
      (u.role || "").toLowerCase().includes(term)
    )
  }, [users, searchTerm])

  const paginatedUsers = useMemo(() => {
    const start = (pagination.page - 1) * pagination.limit
    const end = pagination.page * pagination.limit
    return filteredUsers.slice(start, end)
  }, [filteredUsers, pagination])

  useEffect(() => {
    setPagination((prev) => ({ ...prev, total: filteredUsers.length, page: 1 }))
  }, [filteredUsers.length])

  if (loading) {
    return (
      <div className="access-management-container">
        <div className="access-management-loading">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading access management...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="access-management-container">
      <Container fluid className="p-0">
        {/* Modern Header Section */}
        <div className="page-header-section">
          <div className="header-content">
            <div className="header-main">
              <div className="page-title-section">
                <div className="page-icon">
                  <MdSecurity />
                </div>
                <div className="page-info">
                  <h1 className="page-title">Access Management</h1>
                  <p className="page-subtitle">Manage user roles, permissions and system access</p>
                </div>
              </div>
              <div className="header-actions d-flex align-items-center gap-2">
                <Button variant="outline-secondary" size="sm" className="d-none d-md-flex">
                  <MdRefresh className="me-1" />
                  Refresh
                </Button>
                <Button as={Link} to="/app/roles" variant="outline-primary" className="d-none d-sm-flex">
                  <MdGroup className="me-1" />
                  Manage Roles
                </Button>
                <Button as={Link} to="/app/users/form" variant="primary">
                  <MdPersonAdd className="me-1" />
                  <span className="d-none d-sm-inline">Add User</span>
                  <span className="d-sm-none">Add</span>
                </Button>
                <Dropdown className="d-md-none">
                  <Dropdown.Toggle variant="outline-secondary" size="sm">
                    <MdMoreVert />
                  </Dropdown.Toggle>
                  <Dropdown.Menu align="end">
                    <Dropdown.Item as={Link} to="/app/roles">
                      <MdGroup className="me-2" />
                      Manage Roles
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => window.location.reload()}>
                      <MdRefresh className="me-2" />
                      Refresh
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="stats-section">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon stat-icon-users">
                <MdGroup />
              </div>
              <div className="stat-content">
                <div className="stat-number">{users.length}</div>
                <div className="stat-label">Total Users</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon stat-icon-roles">
                <MdSecurity />
              </div>
              <div className="stat-content">
                <div className="stat-number">{roles.length}</div>
                <div className="stat-label">Active Roles</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon stat-icon-permissions">
                <MdVpnKey />
              </div>
              <div className="stat-content">
                <div className="stat-number">{permissionCount}</div>
                <div className="stat-label">Permissions</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon stat-icon-active">
                <MdSecurity />
              </div>
              <div className="stat-content">
                <div className="stat-number">{users.filter((u) => u.status === "Active").length}</div>
                <div className="stat-label">Active Users</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="content-grid">
          {/* Users Management Section */}
          <div className="users-section">
            <div className="section-card">
              <div className="section-header">
                <div className="section-title">
                  <h3>User Access Management</h3>
                  <p>Manage user roles, permissions, and access levels</p>
                </div>
                <div className="section-actions d-none d-md-flex">
                  <Button variant="outline-secondary" size="sm">
                    <MdFilterList className="me-1" />
                    Filter
                  </Button>
                </div>
              </div>
              
              {/* Search and Filter Bar */}
              <div className="search-filter-section">
                <div className="search-input-group">
                  <div className="search-icon">
                    <MdSearch />
                  </div>
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search users by name, email, or role..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="filter-actions">
                  <Button variant="outline-secondary" size="sm" className="d-md-none">
                    <MdFilterList />
                  </Button>
                </div>
              </div>

              {/* Desktop Table View */}
              <div className="users-table d-none d-md-block">
                <div className="modern-table">
                  <div className="table-header">
                    <div className="table-row">
                      <div className="table-cell">User</div>
                      <div className="table-cell">Role</div>
                      <div className="table-cell">Status</div>
                      <div className="table-cell">Last Login</div>
                      <div className="table-cell text-center">Actions</div>
                    </div>
                  </div>
                  <div className="table-body">
                    {paginatedUsers.map((user) => (
                      <div key={user.id} className="table-row">
                        <div className="table-cell">
                          <div className="user-info">
                            <div className="user-avatar">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="user-details">
                              <div className="user-name">{user.name}</div>
                              <div className="user-email">{user.email}</div>
                            </div>
                          </div>
                        </div>
                        <div className="table-cell">
                          <span className={`role-badge role-${user.role.toLowerCase().replace(/\s+/g, '-')}`}>
                            {user.role}
                          </span>
                        </div>
                        <div className="table-cell">
                          <span className={`status-badge status-${user.status.toLowerCase()}`}>
                            {user.status}
                          </span>
                        </div>
                        <div className="table-cell">
                          <span className="last-login">{formatLocalDateTime(user.lastLogin)}</span>
                        </div>
                        <div className="table-cell">
                          <div className="action-buttons">
                            <Button as={Link} to={`/app/users/${user.id}/edit`} 
                                   variant="outline-primary" size="sm" className="action-btn">
                              <MdEdit />
                            </Button>
                            <Button variant="outline-danger" size="sm" className="action-btn">
                              <MdDelete />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mobile Cards View */}
              <div className="users-cards d-md-none">
                {paginatedUsers.map((user) => (
                  <div key={user.id} className="user-card">
                    <div className="user-card-header">
                      <div className="user-avatar">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="user-info">
                        <div className="user-name">{user.name}</div>
                        <div className="user-email">{user.email}</div>
                      </div>
                      <div className="user-actions">
                        <Dropdown>
                          <Dropdown.Toggle variant="link" size="sm">
                            <MdMoreVert />
                          </Dropdown.Toggle>
                          <Dropdown.Menu align="end">
                            <Dropdown.Item as={Link} to={`/app/users/${user.id}/edit`}>
                              <MdEdit className="me-2" />
                              Edit
                            </Dropdown.Item>
                            <Dropdown.Item className="text-danger">
                              <MdDelete className="me-2" />
                              Delete
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </div>
                    </div>
                    <div className="user-card-content">
                      <div className="user-meta">
                        <div className="meta-item">
                          <span className="meta-label">Role:</span>
                          <span className={`role-badge role-${user.role.toLowerCase().replace(/\s+/g, '-')}`}>
                            {user.role}
                          </span>
                        </div>
                        <div className="meta-item">
                          <span className="meta-label">Status:</span>
                          <span className={`status-badge status-${user.status.toLowerCase()}`}>
                            {user.status}
                          </span>
                        </div>
                        <div className="meta-item">
                          <span className="meta-label">Last Login:</span>
                          <span className="meta-value">{formatLocalDateTime(user.lastLogin)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="pagination-section">
                <Pagination
                  current={pagination.page}
                  total={pagination.total}
                  limit={pagination.limit}
                  onChange={(page) => setPagination((prev) => ({ ...prev, page }))}
                />
              </div>
            </div>
          </div>

          {/* Sidebar: Roles & Quick Actions */}
          <div className="sidebar-section">
            {/* Roles Overview */}
            <div className="section-card">
              <div className="section-header">
                <div className="section-title">
                  <h3>Roles Overview</h3>
                </div>
                <Button as={Link} to="/app/roles" variant="outline-primary" size="sm">
                  View All
                </Button>
              </div>
              <div className="roles-list">
                {roles.map((role) => (
                  <div key={role.id} className="role-item">
                    <div className="role-info">
                      <div className="role-name">{role.name}</div>
                      <div className="role-description">{role.description || "No description"}</div>
                    </div>
                    <div className="role-count">
                      {role.userCount} users
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="section-card">
              <div className="section-header">
                <div className="section-title">
                  <h3>Quick Actions</h3>
                </div>
              </div>
              <div className="quick-actions">
                <Button as={Link} to="/app/users/form" variant="primary" className="w-100 mb-2">
                  <MdPersonAdd className="me-2" />
                  Add New User
                </Button>
                <Button as={Link} to="/app/roles" variant="outline-primary" className="w-100 mb-2">
                  <MdGroup className="me-2" />
                  Manage Roles
                </Button>
                <Button variant="outline-secondary" className="w-100">
                  <MdSettings className="me-2" />
                  Settings
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Task Assignment Section */}
        <div className="task-assignment-section">
          <div className="section-card">
            <div className="section-header">
              <div className="section-title">
                <h3>System Task Assignments</h3>
                <p>Assign specific system tasks and permissions to users</p>
              </div>
            </div>
            
            {/* Permission Assignment Cards */}
            <div className="permission-assignment-grid">
              {permissions.map((perm, index) => (
                <div key={perm._id} className="permission-card">
                  <div className="permission-header">
                    <div className="permission-checkbox">
                      <input
                        type="checkbox"
                        id={`perm-${index}`}
                        checked={taskAssignments.some((a) => a.permissionId === perm._id)}
                        onChange={(e) => {
                          if (!e.target.checked) {
                            const assignment = taskAssignments.find((a) => a.permissionId === perm._id)
                            if (assignment) {
                              handleRemoveTask(assignment._id)
                            }
                          }
                        }}
                      />
                      <label htmlFor={`perm-${index}`} className="permission-label">
                        {perm.description || perm.name}
                      </label>
                    </div>
                  </div>
                  <div className="permission-content">
                    <div className="user-select-wrapper">
                      <select
                        className="user-select"
                        value={taskAssignments.find((a) => a.permissionId === perm._id)?.userId || ""}
                        onChange={(e) => handleAssignTask(perm._id, e.target.value)}
                      >
                        <option value="">-- Assign to User --</option>
                        {users
                          .filter((u) => u.role !== "companyAdmin")
                          .map((u) => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                          ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Task Assignments Overview */}
        <div className="assignments-overview-section">
          <div className="section-card">
            <div className="section-header">
              <div className="section-title">
                <h3>Active Task Assignments</h3>
                <p>Overview of currently assigned permissions and tasks</p>
              </div>
            </div>
            
            {/* Desktop Table */}
            <div className="assignments-table d-none d-md-block">
              <div className="modern-table">
                <div className="table-header">
                  <div className="table-row">
                    <div className="table-cell">Permission</div>
                    <div className="table-cell">Assigned User</div>
                    <div className="table-cell text-center">Actions</div>
                  </div>
                </div>
                <div className="table-body">
                  {taskAssignments.map((entry) => {
                    const permission = permissions.find((p) => p._id === entry.permissionId)
                    return (
                      <div key={entry._id} className="table-row">
                        <div className="table-cell">
                          <div className="permission-info">
                            <MdAssignment className="permission-icon" />
                            <span>{permission?.description || permission?.name || entry.permission}</span>
                          </div>
                        </div>
                        <div className="table-cell">
                          <span className="assigned-user">{entry.userName || "Unknown"}</span>
                        </div>
                        <div className="table-cell">
                          <div className="action-buttons">
                            <Button
                              variant="outline-danger"
                              size="sm"
                              className="action-btn"
                              onClick={() => handleRemoveTask(entry._id)}
                            >
                              <MdDelete />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="assignments-cards d-md-none">
              {taskAssignments.map((entry) => {
                const permission = permissions.find((p) => p._id === entry.permissionId)
                return (
                  <div key={entry._id} className="assignment-card">
                    <div className="assignment-header">
                      <div className="assignment-icon">
                        <MdAssignment />
                      </div>
                      <div className="assignment-title">
                        {permission?.description || permission?.name || entry.permission}
                      </div>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleRemoveTask(entry._id)}
                      >
                        <MdDelete />
                      </Button>
                    </div>
                    <div className="assignment-content">
                      <div className="assigned-to">
                        <span className="label">Assigned to:</span>
                        <span className="user-name">{entry.userName || "Unknown"}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}

export default AccessManagement