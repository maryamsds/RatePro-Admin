"use client"

import { useState, useEffect } from "react"
import { MdAdd, MdEdit, MdDelete, MdSave, MdCancel, MdSecurity } from "react-icons/md"
import Pagination from "../../components/Pagination/Pagination.jsx"

const CATEGORY_COLORS = {
  primary: { bg: 'bg-blue-500', text: 'text-blue-500', light: 'bg-blue-50' },
  success: { bg: 'bg-green-500', text: 'text-green-500', light: 'bg-green-50' },
  danger: { bg: 'bg-red-500', text: 'text-red-500', light: 'bg-red-50' },
  info: { bg: 'bg-cyan-500', text: 'text-cyan-500', light: 'bg-cyan-50' },
  secondary: { bg: 'bg-gray-500', text: 'text-gray-500', light: 'bg-gray-50' },
  warning: { bg: 'bg-yellow-500', text: 'text-yellow-700', light: 'bg-yellow-50' },
}

const PermissionManagement = () => {
  const [permissions, setPermissions] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPermission, setEditingPermission] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    isSystem: false,
  })

  const [paginationStates, setPaginationStates] = useState({})

  useEffect(() => {
    setTimeout(() => {
      const loadedCategories = [
        { id: "content", name: "Content Management", color: "primary" },
        { id: "users", name: "User Management", color: "success" },
        { id: "system", name: "System Administration", color: "danger" },
        { id: "analytics", name: "Analytics & Reports", color: "info" },
      ]
      setCategories(loadedCategories)

      const loadedPermissions = [
        { id: 1, name: "read", displayName: "Read Content", description: "View and read all content", category: "content", isSystem: true, usedInRoles: 4 },
        { id: 2, name: "write", displayName: "Write Content", description: "Create and edit content", category: "content", isSystem: true, usedInRoles: 3 },
        { id: 3, name: "delete", displayName: "Delete Content", description: "Delete content", category: "content", isSystem: true, usedInRoles: 2 },
        { id: 4, name: "manage_users", displayName: "Manage Users", description: "Add/edit users", category: "users", isSystem: true, usedInRoles: 2 },
        { id: 5, name: "manage_settings", displayName: "Manage Settings", description: "Configure system", category: "system", isSystem: true, usedInRoles: 1 },
        { id: 6, name: "view_analytics", displayName: "View Analytics", description: "Access reports", category: "analytics", isSystem: false, usedInRoles: 3 },
        { id: 7, name: "export_data", displayName: "Export Data", description: "Export system data", category: "analytics", isSystem: false, usedInRoles: 2 },
        { id: 8, name: "manage_roles", displayName: "Manage Roles", description: "Create/modify roles", category: "system", isSystem: true, usedInRoles: 1 },
      ]
      setPermissions(loadedPermissions)

      const paginations = {}
      loadedCategories.forEach((category) => {
        const total = loadedPermissions.filter((perm) => perm.category === category.id).length
        paginations[category.id] = { page: 1, limit: 1, total }
      })
      setPaginationStates(paginations)

      setLoading(false)
    }, 1000)
  }, [])

  const handleCreatePermission = () => {
    setEditingPermission(null)
    setFormData({ name: "", description: "", category: "", isSystem: false })
    setShowModal(true)
  }

  const handleEditPermission = (permission) => {
    setEditingPermission(permission)
    setFormData({
      name: permission.displayName,
      description: permission.description,
      category: permission.category,
      isSystem: permission.isSystem,
    })
    setShowModal(true)
  }

  const handleSavePermission = () => {
    if (editingPermission) {
      setPermissions(
        permissions.map((perm) =>
          perm.id === editingPermission.id
            ? { ...perm, displayName: formData.name, description: formData.description, category: formData.category }
            : perm
        )
      )
    } else {
      const newPermission = {
        id: Date.now(),
        name: formData.name.toLowerCase().replace(/\s+/g, "_"),
        displayName: formData.name,
        description: formData.description,
        category: formData.category,
        isSystem: false,
        usedInRoles: 0,
      }
      setPermissions([...permissions, newPermission])

      setPaginationStates((prev) => {
        const prevTotal = prev[formData.category]?.total || 0
        return {
          ...prev,
          [formData.category]: { page: 1, limit: 1, total: prevTotal + 1 },
        }
      })
    }
    setShowModal(false)
  }

  const handleDeletePermission = (permissionId) => {
    if (window.confirm("Are you sure you want to delete this permission?")) {
      const permissionToDelete = permissions.find((p) => p.id === permissionId)
      setPermissions(permissions.filter((p) => p.id !== permissionId))

      setPaginationStates((prev) => {
        const prevTotal = prev[permissionToDelete.category]?.total || 1
        return {
          ...prev,
          [permissionToDelete.category]: {
            ...prev[permissionToDelete.category],
            total: prevTotal - 1,
          },
        }
      })
    }
  }

  const getCategoryColor = (color) => CATEGORY_COLORS[color] || CATEGORY_COLORS.secondary

  const getPaginatedPermissions = (categoryId) => {
    const { page, limit } = paginationStates[categoryId] || { page: 1, limit: 2 }
    const filtered = permissions.filter((perm) => perm.category === categoryId)
    const start = (page - 1) * limit
    return filtered.slice(start, start + limit)
  }

  if (loading) {
    return (
      <div className="w-full py-12 text-center">
        <div className="w-8 h-8 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-[var(--text-secondary)]">Loading permissions...</p>
      </div>
    )
  }

  return (
    <div className="w-full py-4 px-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-bold mb-1">Permission Management</h1>
          <p className="text-[var(--text-secondary)] mb-0">Manage system permissions and access controls</p>
        </div>
        <button onClick={handleCreatePermission} className="px-4 py-2 rounded-lg bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)] transition-colors font-medium inline-flex items-center gap-2">
          <MdAdd />
          Create Permission
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {categories.map((category) => {
          const colors = getCategoryColor(category.color)
          return (
            <div key={category.id} className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-xl shadow-sm border border-[var(--light-border)] dark:border-[var(--dark-border)] p-4 text-center">
              <div className={`${colors.text} mb-2`}>
                <MdSecurity size={32} />
              </div>
              <h5 className="font-semibold">{category.name}</h5>
              <p className="text-[var(--text-secondary)]">{(paginationStates[category.id]?.total || 0)} permissions</p>
            </div>
          )
        })}
      </div>

      {categories.map((category) => {
        const perms = permissions.filter((p) => p.category === category.id)
        if (perms.length === 0) return null

        const paginatedPerms = getPaginatedPermissions(category.id)
        const colors = getCategoryColor(category.color)

        return (
          <div key={category.id} className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-xl shadow-sm border border-[var(--light-border)] dark:border-[var(--dark-border)] mb-4">
            <div className="flex items-center gap-2 p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <span className={`px-2 py-0.5 text-white rounded-full text-xs font-medium ${colors.bg}`}>{category.name}</span>
              <span className="text-[var(--text-secondary)]">({perms.length} permissions)</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">Permission</th>
                    <th className="text-left px-4 py-3 font-semibold">Description</th>
                    <th className="text-left px-4 py-3 font-semibold">Used in Roles</th>
                    <th className="text-left px-4 py-3 font-semibold">Type</th>
                    <th className="text-center px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPerms.map((permission) => (
                    <tr key={permission.id} className="border-b border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium">{permission.displayName}</div>
                        <small className="text-[var(--text-secondary)] font-mono">{permission.name}</small>
                      </td>
                      <td className="px-4 py-3">{permission.description}</td>
                      <td className="px-4 py-3"><span className="px-2 py-0.5 bg-blue-500 text-white rounded-full text-xs font-medium">{permission.usedInRoles} roles</span></td>
                      <td className="px-4 py-3">{permission.isSystem ? <span className="px-2 py-0.5 bg-yellow-500 text-white rounded-full text-xs font-medium">System</span> : <span className="px-2 py-0.5 bg-gray-500 text-white rounded-full text-xs font-medium">Custom</span>}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-1">
                          <button disabled={permission.isSystem} onClick={() => handleEditPermission(permission)} className="p-1.5 border border-blue-400 text-blue-500 rounded hover:bg-blue-50 transition-colors disabled:opacity-50">
                            <MdEdit size={16} />
                          </button>
                          <button disabled={permission.isSystem || permission.usedInRoles > 0} onClick={() => handleDeletePermission(permission.id)} className="p-1.5 border border-red-400 text-red-500 rounded hover:bg-red-50 transition-colors disabled:opacity-50">
                            <MdDelete size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-3">
              <Pagination
                current={paginationStates[category.id]?.page || 1}
                total={paginationStates[category.id]?.total || 0}
                limit={paginationStates[category.id]?.limit || 2}
                onChange={(page) =>
                  setPaginationStates((prev) => ({
                    ...prev,
                    [category.id]: {
                      ...prev[category.id],
                      page,
                    },
                  }))
                }
              />
            </div>
          </div>
        )
      })}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowModal(false)}>
          <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-xl shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <h5 className="text-lg font-semibold m-0">{editingPermission ? "Edit Permission" : "Create Permission"}</h5>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors text-xl">×</button>
            </div>
            <div className="p-4">
              <form>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Permission Name</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-transparent outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition-all" />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-transparent outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition-all resize-y" />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-transparent outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition-all">
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </form>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] transition-colors font-medium inline-flex items-center gap-2">
                <MdCancel /> Cancel
              </button>
              <button onClick={handleSavePermission} className="px-4 py-2 rounded-lg bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)] transition-colors font-medium inline-flex items-center gap-2">
                <MdSave /> {editingPermission ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PermissionManagement
