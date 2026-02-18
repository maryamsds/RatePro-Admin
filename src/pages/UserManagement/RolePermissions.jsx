// src\pages\UserManagement\RolePermissions.jsx
"use client"
import { useState } from "react"

const RolePermissions = () => {
  const [roles, setRoles] = useState([
    {
      id: 1,
      name: "Administrator",
      description: "Full system access with all permissions",
      userCount: 2,
      permissions: [
        "surveys.create",
        "surveys.edit",
        "surveys.delete",
        "surveys.view",
        "analytics.view",
        "analytics.export",
        "users.manage",
        "settings.manage",
      ],
      isSystem: true,
    },
    {
      id: 2,
      name: "Manager",
      description: "Can manage surveys and view analytics",
      userCount: 5,
      permissions: ["surveys.create", "surveys.edit", "surveys.view", "analytics.view", "analytics.export"],
      isSystem: false,
    },
    {
      id: 3,
      name: "User",
      description: "Basic user with limited permissions",
      userCount: 12,
      permissions: ["surveys.view", "analytics.view"],
      isSystem: false,
    },
    {
      id: 4,
      name: "Viewer",
      description: "Read-only access to surveys and analytics",
      userCount: 8,
      permissions: ["surveys.view", "analytics.view"],
      isSystem: false,
    },
  ])

  const [showModal, setShowModal] = useState(false)
  const [currentRole, setCurrentRole] = useState({
    name: "",
    description: "",
    permissions: [],
  })

  const allPermissions = [
    {
      category: "Surveys",
      permissions: [
        { id: "surveys.create", label: "Create Surveys", description: "Create new surveys" },
        { id: "surveys.edit", label: "Edit Surveys", description: "Modify existing surveys" },
        { id: "surveys.delete", label: "Delete Surveys", description: "Remove surveys from system" },
        { id: "surveys.view", label: "View Surveys", description: "Access and view surveys" },
        { id: "surveys.publish", label: "Publish Surveys", description: "Make surveys live" },
      ],
    },
    {
      category: "Analytics",
      permissions: [
        { id: "analytics.view", label: "View Analytics", description: "Access analytics dashboard" },
        { id: "analytics.export", label: "Export Data", description: "Export analytics data" },
        { id: "analytics.advanced", label: "Advanced Analytics", description: "Access advanced analytics features" },
      ],
    },
    {
      category: "Users",
      permissions: [
        { id: "users.manage", label: "Manage Users", description: "Add, edit, and remove users" },
        { id: "users.view", label: "View Users", description: "View user information" },
        { id: "users.roles", label: "Manage Roles", description: "Create and modify user roles" },
      ],
    },
    {
      category: "Settings",
      permissions: [
        { id: "settings.manage", label: "Manage Settings", description: "Modify system settings" },
        { id: "settings.billing", label: "Billing Management", description: "Manage billing and subscriptions" },
        {
          id: "settings.integrations",
          label: "Manage Integrations",
          description: "Configure third-party integrations",
        },
      ],
    },
  ]

  const handleCreateRole = () => {
    setCurrentRole({ name: "", description: "", permissions: [] })
    setShowModal(true)
  }

  const handleSaveRole = () => {
    if (currentRole.name.trim()) {
      const newRole = {
        ...currentRole,
        id: Date.now(),
        userCount: 0,
        isSystem: false,
      }
      setRoles([...roles, newRole])
      setShowModal(false)
    }
  }

  const deleteRole = (id) => {
    setRoles(roles.filter((r) => r.id !== id))
  }

  const getPermissionLabel = (permissionId) => {
    for (const category of allPermissions) {
      const permission = category.permissions.find((p) => p.id === permissionId)
      if (permission) return permission.label
    }
    return permissionId
  }

  const togglePermission = (permissionId) => {
    setCurrentRole((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter((p) => p !== permissionId)
        : [...prev.permissions, permissionId],
    }))
  }

  return (
    <div className="w-full px-4 py-4">
      <div className="mb-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <h1 className="text-xl font-bold mb-1">Roles & Permissions</h1>
            <p className="text-[var(--text-secondary)]">Manage user roles and their permissions</p>
          </div>
          <button onClick={handleCreateRole} className="px-4 py-2 rounded-lg bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)] transition-colors font-medium inline-flex items-center gap-2">
            <i className="fas fa-plus"></i>
            Create Role
          </button>
        </div>
      </div>

      {/* Roles Overview */}
      <div className="mb-4">
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-xl shadow-sm border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div className="p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
            <h5 className="font-semibold m-0">System Roles</h5>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Role Name</th>
                  <th className="text-left px-4 py-3 font-semibold">Description</th>
                  <th className="text-left px-4 py-3 font-semibold">Users</th>
                  <th className="text-left px-4 py-3 font-semibold">Permissions</th>
                  <th className="text-left px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((role) => (
                  <tr key={role.id} className="border-b border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{role.name}</span>
                        {role.isSystem && (
                          <span className="px-2 py-0.5 bg-cyan-500 text-white rounded-full text-xs font-medium">System</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="truncate max-w-[300px]">{role.description}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-gray-500 text-white rounded-full text-xs font-medium">{role.userCount} users</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.slice(0, 3).map((permission) => (
                          <span key={permission} className="px-2 py-0.5 border border-[var(--primary-color)] text-[var(--primary-color)] rounded-full text-xs">
                            {getPermissionLabel(permission)}
                          </span>
                        ))}
                        {role.permissions.length > 3 && (
                          <span className="px-2 py-0.5 border border-gray-400 text-gray-500 rounded-full text-xs">
                            +{role.permissions.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button className="p-1.5 border border-[var(--primary-color)] text-[var(--primary-color)] rounded hover:bg-blue-50 transition-colors" title="View Details">
                          <i className="fas fa-eye text-xs"></i>
                        </button>
                        <button className="p-1.5 border border-gray-400 text-gray-500 rounded hover:bg-gray-50 transition-colors" title="Edit" disabled={role.isSystem}>
                          <i className="fas fa-edit text-xs"></i>
                        </button>
                        <button className="p-1.5 border border-cyan-400 text-cyan-500 rounded hover:bg-cyan-50 transition-colors" title="Duplicate">
                          <i className="fas fa-copy text-xs"></i>
                        </button>
                        <button
                          className="p-1.5 border border-red-400 text-red-500 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                          title="Delete"
                          disabled={role.isSystem || role.userCount > 0}
                          onClick={() => deleteRole(role.id)}
                        >
                          <i className="fas fa-trash text-xs"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Permissions Matrix */}
      <div>
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-xl shadow-sm border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div className="p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
            <h5 className="font-semibold m-0">Permissions Matrix</h5>
          </div>
          <div className="p-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                  <th className="text-left px-3 py-2 font-semibold">Permission</th>
                  {roles.map((role) => (
                    <th key={role.id} className="text-center px-3 py-2 font-semibold">
                      {role.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allPermissions.map((category) => (
                  <React.Fragment key={category.category}>
                    <tr>
                      <td colSpan={roles.length + 1} className="bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] px-3 py-2 font-bold">
                        {category.category}
                      </td>
                    </tr>
                    {category.permissions.map((permission) => (
                      <tr key={permission.id} className="border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                        <td className="px-3 py-2">
                          <div>
                            <div className="font-medium">{permission.label}</div>
                            <small className="text-[var(--text-secondary)]">{permission.description}</small>
                          </div>
                        </td>
                        {roles.map((role) => (
                          <td key={role.id} className="text-center px-3 py-2">
                            {role.permissions.includes(permission.id) ? (
                              <i className="fas fa-check text-green-500"></i>
                            ) : (
                              <i className="fas fa-times text-gray-400"></i>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Role Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowModal(false)}>
          <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <h5 className="text-lg font-semibold m-0">Create New Role</h5>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors text-xl">×</button>
            </div>
            <div className="p-4">
              <form>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Role Name</label>
                  <input
                    type="text"
                    placeholder="Enter role name"
                    value={currentRole.name}
                    onChange={(e) => setCurrentRole({ ...currentRole, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-transparent outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition-all"
                  />
                </div>

                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Describe this role"
                    value={currentRole.description}
                    onChange={(e) => setCurrentRole({ ...currentRole, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-transparent outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition-all resize-vertical"
                  ></textarea>
                </div>

                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Permissions</label>
                  <div className="border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-lg p-3 max-h-[400px] overflow-y-auto">
                    {allPermissions.map((category) => (
                      <div key={category.category} className="mb-3">
                        <h6 className="text-[var(--primary-color)] mb-2 font-semibold">{category.category}</h6>
                        {category.permissions.map((permission) => (
                          <label key={permission.id} className="flex items-start gap-2 mb-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={currentRole.permissions.includes(permission.id)}
                              onChange={() => togglePermission(permission.id)}
                              className="mt-1 accent-[var(--primary-color)]"
                            />
                            <div>
                              <div className="font-medium">{permission.label}</div>
                              <small className="text-[var(--text-secondary)]">{permission.description}</small>
                            </div>
                          </label>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </form>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRole}
                className="px-4 py-2 rounded-lg bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)] transition-colors font-medium"
              >
                Create Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RolePermissions
