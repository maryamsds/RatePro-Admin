// src\pages\UserManagement\UserManagement.jsx
"use client"

import { useState, useEffect, useRef } from "react"
import {
  MdAdd,
  MdSearch,
  MdFilterList,
  MdMoreVert,
  MdEdit,
  MdDelete,
  MdBlock,
  MdEmail,
  MdRefresh,
  MdPerson,
} from "react-icons/md"
import Pagination from "../../components/Pagination/Pagination.jsx"
import axiosInstance from "../../api/axiosInstance";


export const fetchUsers = async () => {
  const response = await axiosInstance.get("/user");
  return response.data;
};

const UsersManagement = ({ darkMode }) => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState("all")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [pagination, setPagination] = useState({ page: 1, limit: 5, total: 0 })
  const [openDropdownId, setOpenDropdownId] = useState(null)
  const dropdownRef = useRef(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdownId(null)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/users");
      const fetchedUsers = response.data.data;
      setUsers(fetchedUsers);
      setPagination((prev) => ({
        ...prev,
        total: response.data.count,
      }));
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {

    loadUsers();
  }, []);

  const statusColors = {
    Active: "bg-green-500",
    Inactive: "bg-gray-500",
    Pending: "bg-yellow-500",
    Blocked: "bg-red-500",
  }

  const roleColors = {
    "Super Admin": "bg-red-500",
    Admin: "bg-blue-500",
    Editor: "bg-cyan-500",
    Viewer: "bg-gray-500",
  }

  const getStatusBadge = (status) => (
    <span className={`px-2 py-0.5 ${statusColors[status] || "bg-gray-500"} text-white rounded-full text-xs font-medium`}>
      {status}
    </span>
  )

  const getRoleBadge = (role) => (
    <span className={`px-2 py-0.5 ${roleColors[role] || "bg-gray-500"} text-white rounded-full text-xs font-medium`}>
      {role}
    </span>
  )

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterRole === "all" || user.role.toLowerCase().includes(filterRole.toLowerCase())
    return matchesSearch && matchesFilter
  })

  const currentUsers = filteredUsers.slice((pagination.page - 1) * pagination.limit, pagination.page * pagination.limit)

  const handleDelete = (user) => {
    setSelectedUser(user)
    setShowDeleteModal(true)
    setOpenDropdownId(null)
  }

  const confirmDelete = async () => {
    try {
      await axiosInstance.delete(`/users/${selectedUser._id}`);
      setUsers(users.filter((u) => u._id !== selectedUser._id));
      setShowDeleteModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Failed to delete user", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center" style={{ height: "50vh" }}>
        <div className="w-8 h-8 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="w-full py-4 px-4 animate-fadeIn">
      {/* Header */}
      <div className="mb-4">
        <div className="flex flex-wrap justify-between items-center gap-3">
          <div>
            <h2 className="text-xl font-bold mb-1">Users</h2>
            <p className="text-[var(--text-secondary)] mb-0">Manage user accounts and permissions</p>
          </div>
          <div className="flex gap-2">
            <button onClick={loadUsers} className="px-3 py-1.5 rounded-lg border border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-[var(--primary-color)] hover:text-white transition-colors text-sm inline-flex items-center gap-1">
              <MdRefresh />
              Refresh
            </button>
            <button className="px-3 py-1.5 rounded-lg bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)] transition-colors text-sm inline-flex items-center gap-1">
              <MdAdd />
              Add User
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {[
          { label: "Total Users", value: users.length, color: "var(--primary-color)" },
          { label: "Active Users", value: users.filter((u) => u.status === "Active").length, color: "var(--success-color)" },
          { label: "Pending Users", value: users.filter((u) => u.status === "Pending").length, color: "var(--warning-color)" },
          { label: "Admins", value: users.filter((u) => u.role.includes("Admin")).length, color: "var(--info-color)" },
        ].map((stat, i) => (
          <div key={i} className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-xl shadow-sm border border-[var(--light-border)] dark:border-[var(--dark-border)] p-4" style={{ borderLeft: `4px solid ${stat.color}` }}>
            <div className="flex items-center">
              <div className="flex-grow">
                <div className="text-sm text-[var(--text-secondary)] mb-1">{stat.label}</div>
                <div className="text-2xl font-bold">{stat.value}</div>
              </div>
              <div className="rounded-full flex items-center justify-center w-12 h-12" style={{ backgroundColor: stat.color, opacity: 0.1 }}>
                <MdPerson size={24} style={{ color: stat.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-4">
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-xl shadow-sm border border-[var(--light-border)] dark:border-[var(--dark-border)] p-3">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            <div className="md:col-span-5">
              <div className="flex items-center border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-lg overflow-hidden">
                <span className="px-3 py-2 bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--text-secondary)]">
                  <MdSearch />
                </span>
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-3 py-2 bg-transparent outline-none"
                />
              </div>
            </div>
            <div className="md:col-span-3">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-transparent outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition-all"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <button className="w-full px-3 py-2 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] transition-colors inline-flex items-center justify-center gap-1">
                <MdFilterList />
                More Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-xl shadow-sm border border-[var(--light-border)] dark:border-[var(--dark-border)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <tr>
                <th className="text-left py-3 px-4 font-semibold">User</th>
                <th className="text-left py-3 font-semibold">Role</th>
                <th className="text-left py-3 font-semibold">Department</th>
                <th className="text-left py-3 font-semibold">Status</th>
                <th className="text-left py-3 font-semibold">Last Login</th>
                <th className="text-left py-3 font-semibold">Created</th>
                <th className="text-center py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user) =>
                <tr key={user._id} className="border-b border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-blue-500 flex items-center justify-center w-10 h-10">
                        <MdPerson className="text-white" size={20} />
                      </div>
                      <div>
                        <div className="font-medium mb-0.5">{user.name}</div>
                        <div className="text-sm text-[var(--text-secondary)]">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3">{getRoleBadge(user.role)}</td>
                  <td className="py-3">{user.department}</td>
                  <td className="py-3">{getStatusBadge(user.status)}</td>
                  <td className="py-3">{user.lastLogin}</td>
                  <td className="py-3">{user.created}</td>
                  <td className="py-3 text-center relative" ref={openDropdownId === user._id ? dropdownRef : null}>
                    <button
                      onClick={() => setOpenDropdownId(openDropdownId === user._id ? null : user._id)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                      <MdMoreVert />
                    </button>
                    {openDropdownId === user._id && (
                      <div className="absolute right-4 top-full z-10 bg-[var(--light-card)] dark:bg-[var(--dark-card)] shadow-lg rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)] min-w-[160px]">
                        <button className="w-full text-left px-4 py-2 hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] transition-colors flex items-center gap-2" onClick={() => setOpenDropdownId(null)}>
                          <MdEdit /> Edit
                        </button>
                        <button className="w-full text-left px-4 py-2 hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] transition-colors flex items-center gap-2" onClick={() => setOpenDropdownId(null)}>
                          <MdEmail /> Send Email
                        </button>
                        <button className="w-full text-left px-4 py-2 hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] transition-colors flex items-center gap-2" onClick={() => setOpenDropdownId(null)}>
                          <MdBlock /> Block User
                        </button>
                        <div className="border-t border-[var(--light-border)] dark:border-[var(--dark-border)]"></div>
                        <button
                          className="w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2 text-red-500"
                          onClick={() => handleDelete(user)}
                        >
                          <MdDelete /> Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-3 border-t border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <Pagination
            current={pagination.page}
            total={filteredUsers.length}
            limit={pagination.limit}
            onChange={(page) => setPagination((prev) => ({ ...prev, page }))}
            darkMode={darkMode}
          />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowDeleteModal(false)}>
          <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-xl shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <h5 className="text-lg font-semibold m-0">Confirm Delete</h5>
              <button onClick={() => setShowDeleteModal(false)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors text-xl">×</button>
            </div>
            <div className="p-4">
              Are you sure you want to delete user "{selectedUser?.name}"? This action cannot be undone.
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors font-medium"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UsersManagement
