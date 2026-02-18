// src/pages/AccessManagement/AccessManagement.jsx
"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { Link } from "react-router-dom"
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
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[var(--text-secondary)]">Loading access management...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Modern Header Section */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-[var(--primary-color)]/10 flex items-center justify-center text-[var(--primary-color)] text-2xl">
              <MdSecurity />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">Access Management</h1>
              <p className="text-sm text-[var(--text-secondary)] mt-1">Manage user roles, permissions and system access</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button className="hidden md:flex px-4 py-2 rounded-md font-medium transition-colors border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-hover)] dark:hover:bg-[var(--dark-hover)] items-center gap-2">
              <MdRefresh />
              Refresh
            </button>
            <Link to="/app/roles" className="hidden sm:flex px-4 py-2 rounded-md font-medium transition-colors border border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-[var(--primary-color)] hover:text-white items-center gap-2">
              <MdGroup />
              Manage Roles
            </Link>
            <Link to="/app/users/form" className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)] flex items-center gap-2">
              <MdPersonAdd />
              <span className="hidden sm:inline">Add User</span>
              <span className="sm:hidden">Add</span>
            </Link>
            <div className="md:hidden relative">
              <button className="px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)]" onClick={() => { }}>
                <MdMoreVert />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xl">
              <MdGroup />
            </div>
            <div>
              <div className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">{users.length}</div>
              <div className="text-sm text-[var(--text-secondary)]">Total Users</div>
            </div>
          </div>
        </div>
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xl">
              <MdSecurity />
            </div>
            <div>
              <div className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">{roles.length}</div>
              <div className="text-sm text-[var(--text-secondary)]">Active Roles</div>
            </div>
          </div>
        </div>
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xl">
              <MdVpnKey />
            </div>
            <div>
              <div className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">{permissionCount}</div>
              <div className="text-sm text-[var(--text-secondary)]">Permissions</div>
            </div>
          </div>
        </div>
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 text-xl">
              <MdSecurity />
            </div>
            <div>
              <div className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">{users.filter((u) => u.status === "Active").length}</div>
              <div className="text-sm text-[var(--text-secondary)]">Active Users</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users Management Section */}
        <div className="lg:col-span-2">
          <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">User Access Management</h3>
                <p className="text-sm text-[var(--text-secondary)] mt-1">Manage user roles, permissions, and access levels</p>
              </div>
              <div className="hidden md:flex">
                <button className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-hover)] dark:hover:bg-[var(--dark-hover)] flex items-center gap-1">
                  <MdFilterList />
                  Filter
                </button>
              </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]">
                  <MdSearch />
                </div>
                <input
                  type="text"
                  className="w-full px-4 py-2 pl-10 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30"
                  placeholder="Search users by name, email, or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="md:hidden">
                <button className="px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)]">
                  <MdFilterList />
                </button>
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] mb-6">
              <table className="min-w-full border-collapse">
                <thead className="bg-[var(--light-bg)] dark:bg-[var(--dark-bg)]">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">User</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">Role</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">Last Login</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((user) => (
                    <tr key={user.id} className="border-b border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-[var(--light-hover)] dark:hover:bg-[var(--dark-hover)]">
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[var(--primary-color)] text-white flex items-center justify-center font-medium">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">{user.name}</div>
                            <div className="text-xs text-[var(--text-secondary)]">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.status === 'Active' 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                            : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">{formatLocalDateTime(user.lastLogin)}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center justify-center gap-2">
                          <Link to={`/app/users/${user.id}/edit`}
                            className="p-2 rounded-md border border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-[var(--primary-color)] hover:text-white transition-colors">
                            <MdEdit />
                          </Link>
                          <button className="p-2 rounded-md border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors">
                            <MdDelete />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden space-y-4 mb-6">
              {paginatedUsers.map((user) => (
                <div key={user.id} className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-4 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--primary-color)] text-white flex items-center justify-center font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">{user.name}</div>
                        <div className="text-xs text-[var(--text-secondary)]">{user.email}</div>
                      </div>
                    </div>
                    <button className="text-[var(--light-text)] dark:text-[var(--dark-text)]">
                      <MdMoreVert />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--text-secondary)]">Role:</span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                        {user.role}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--text-secondary)]">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.status === 'Active' 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                          : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                      }`}>
                        {user.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--text-secondary)]">Last Login:</span>
                      <span className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">{formatLocalDateTime(user.lastLogin)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-6">
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
        <div className="space-y-6">
          {/* Roles Overview */}
          <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">Roles Overview</h3>
              <Link to="/app/roles" className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors border border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-[var(--primary-color)] hover:text-white">
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {roles.map((role) => (
                <div key={role.id} className="flex items-center justify-between p-3 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-[var(--light-hover)] dark:hover:bg-[var(--dark-hover)]">
                  <div>
                    <div className="font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">{role.name}</div>
                    <div className="text-xs text-[var(--text-secondary)] mt-1">{role.description || "No description"}</div>
                  </div>
                  <div className="text-sm text-[var(--text-secondary)] font-medium">
                    {role.userCount} users
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
            <h3 className="text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)] mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link to="/app/users/form" className="w-full px-4 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)] flex items-center gap-2">
                <MdPersonAdd />
                Add New User
              </Link>
              <Link to="/app/roles" className="w-full px-4 py-2 rounded-md font-medium transition-colors border border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-[var(--primary-color)] hover:text-white flex items-center gap-2">
                <MdGroup />
                Manage Roles
              </Link>
              <button className="w-full px-4 py-2 rounded-md font-medium transition-colors border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-hover)] dark:hover:bg-[var(--dark-hover)] flex items-center gap-2">
                <MdSettings />
                Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Task Assignment Section */}
      <div className="mt-6">
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">System Task Assignments</h3>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Assign specific system tasks and permissions to users</p>
          </div>

          {/* Permission Assignment Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {permissions.map((perm, index) => (
              <div key={perm._id} className="p-4 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-[var(--light-hover)] dark:hover:bg-[var(--dark-hover)]">
                <div className="mb-3">
                  <div className="flex items-center gap-2">
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
                      className="w-4 h-4 rounded border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/30"
                    />
                    <label htmlFor={`perm-${index}`} className="text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] cursor-pointer">
                      {perm.description || perm.name}
                    </label>
                  </div>
                </div>
                <div>
                  <select
                    className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30"
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
            ))}
          </div>
        </div>
      </div>

      {/* Task Assignments Overview */}
      <div className="mt-6">
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">Active Task Assignments</h3>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Overview of currently assigned permissions and tasks</p>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
            <table className="min-w-full border-collapse">
              <thead className="bg-[var(--light-bg)] dark:bg-[var(--dark-bg)]">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">Permission</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">Assigned User</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {taskAssignments.map((entry) => {
                  const permission = permissions.find((p) => p._id === entry.permissionId)
                  return (
                    <tr key={entry._id} className="border-b border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-[var(--light-hover)] dark:hover:bg-[var(--dark-hover)]">
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <MdAssignment className="text-[var(--primary-color)]" />
                          <span className="text-[var(--light-text)] dark:text-[var(--dark-text)]">{permission?.description || permission?.name || entry.permission}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">{entry.userName || "Unknown"}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => handleRemoveTask(entry._id)}
                            className="p-2 rounded-md border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                          >
                            <MdDelete />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {taskAssignments.map((entry) => {
              const permission = permissions.find((p) => p._id === entry.permissionId)
              return (
                <div key={entry._id} className="p-4 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="text-[var(--primary-color)]">
                        <MdAssignment />
                      </div>
                      <div className="text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">
                        {permission?.description || permission?.name || entry.permission}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveTask(entry._id)}
                      className="p-2 rounded-md border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                    >
                      <MdDelete />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--text-secondary)]">Assigned to:</span>
                    <span className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">{entry.userName || "Unknown"}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccessManagement