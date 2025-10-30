// src\pages\AccessManagement\RoleManagement.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import { Container, Row, Col, Card, Table, Badge, Button, Form, Modal, OverlayTrigger, Tooltip, Dropdown } from "react-bootstrap";
import { 
  MdAdd, MdEdit, MdDelete, MdSave, MdCancel, MdSecurity, MdGroup, 
  MdMoreVert, MdRefresh, MdAssignmentInd, MdSettings, MdSearch,
  MdFilterList, MdVpnKey, MdPerson
} from "react-icons/md";
import Pagination from "../../components/Pagination/Pagination.jsx";
import axiosInstance from "../../api/axiosInstance";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthContext";

// Predefined roles and their associated permissions
const rolePermissionMap = {
  "User Manager": {
    group: "user",
    description: "Responsible for managing user accounts",
    permissions: [
      "user:create",
      "user:read",
      "user:update",
      "user:delete",
      "user:toggle",
      "user:export",
      "user:notify",
      "user:mass-upload",
      "user:file-template"
    ]
  },
  "Role Manager": {
    group: "role",
    description: "Handles role creation, updates, deletion, and assigning roles to users.",
    permissions: ["role:create", "role:read", "role:update", "role:delete", "role:assign"]
  },
  "Survey Manager": {
    group: "survey",
    description: "Manages survey creation, scheduling, customization, analytics, and response tracking.",
    permissions: [
      "survey:read",
      "survey:create",
      "survey:templates",
      "survey:schedule",
      "survey:responses:view",
      "survey:analytics:view",
      "survey:customize",
      "survey:share",
      "survey:settings:update",
      "survey:detail:view"
    ]
  },
  "Analytics Viewer": {
    group: "analytics",
    description: "Provides access to view analytics reports, trends, and real-time insights.",
    permissions: [
      "analytics:view",
      "analytics:realtime",
      "analytics:trends",
      "analytics:custom",
      "analytics:responses"
    ]
  },
  "Audience Manager": {
    group: "audience",
    description: "Manages audience segmentation, contacts, and targeted groups.",
    permissions: [
      "audience:view",
      "audience:segment",
      "audience:contacts"
    ]
  },
  "Content Manager": {
    group: "content",
    description: "Responsible for managing website/app content such as features, pricing, testimonials, and widgets.",
    permissions: [
      "content:features",
      "content:pricing",
      "content:testimonials",
      "content:widgets"
    ]
  },
  "Support Agent": {
    group: "support",
    description: "Handles customer support tickets and user queries.",
    permissions: ["support:tickets"]
  }
};

// RoleManagement component for creating, editing, and assigning roles
const RoleManagement = () => {
  const { user, loading: authLoading, hasPermission } = useAuth();
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [assigningRole, setAssigningRole] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [rolePermissions, setRolePermissions] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [assignedUserIds, setAssignedUserIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef(null);

  const currentUserRole = user?.role || "";
  const isMember = currentUserRole === "member";

  const memberCanCreate = !isMember || hasPermission("role:create");
  const memberCanUpdate = !isMember || hasPermission("role:update");
  const memberCanDelete = !isMember || hasPermission("role:delete");
  const memberCanAssign = !isMember || hasPermission("role:assign");
  const memberCanRemove = !isMember || hasPermission("role:remove");
  const memberCanRead = !isMember || hasPermission("role:read");

  const tenantId = user?.tenant?._id || null;

  // Memoize rolePermissions to prevent unnecessary re-renders
  const memoizedRolePermissions = useMemo(() => rolePermissions, [rolePermissions]);

  const availablePredefinedRoles = useMemo(() => {
    return Object.keys(rolePermissionMap);
  }, []);

  // Filter permissions based on selected role (for both create and edit)
  const filteredPermissions = useMemo(() => {
    // For both create and edit, use the selectedRole (which is set to editingRole.name if editing)
    if (!selectedRole) return [];
    const roleConfig = rolePermissionMap[selectedRole] || { group: null, permissions: [] };
    return permissions.filter((p) => {
      if (!p || !p.name) return false;
      return roleConfig.group
        ? p.group === roleConfig.group
        : roleConfig.permissions.includes(p.name);
    });
  }, [selectedRole, permissions]);

  // Group permissions for display
  const groupedPermissions = useMemo(() => {
    return filteredPermissions.reduce((acc, p) => {
      const group = p.group || "Other";
      acc[group] = acc[group] || [];
      acc[group].push(p);
      return acc;
    }, {});
  }, [filteredPermissions]);

  // Filter users based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers([]);
      setShowDropdown(false);
    } else {
      const filtered = users.filter(
        (user) =>
          user.role !== "companyAdmin" &&
          !assignedUserIds.includes(user._id) &&
          (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredUsers(filtered);
      setShowDropdown(true);
    }
  }, [searchTerm, users, assignedUserIds]);

  // Handle user selection
  const handleSelectUser = (user) => {
    setSelectedUserId(user._id);
    setSearchTerm(`${user.name} (${user.email})`); // Show selected user in input
    setShowDropdown(false); // Close dropdown
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Auto-select first available predefined role when creating
  useEffect(() => {
    if (showModal && !editingRole && availablePredefinedRoles.length > 0 && selectedRole === "") {
      const firstRole = availablePredefinedRoles[0];
      setSelectedRole(firstRole);
      setRoleDescription(rolePermissionMap[firstRole]?.description || ""); // 👈 ab sahi
      setRolePermissions([]); // Ensure no permissions are pre-selected
    }
  }, [showModal, editingRole, availablePredefinedRoles, selectedRole]);

  // Fetch data on mount and when pagination.page changes
  useEffect(() => {
    if (!authLoading && tenantId && (user?.role === "companyAdmin" || hasPermission("role:read"))) {

      let isMounted = true;
      setIsLoading(true);
      Promise.all([fetchRoles(), fetchPermissions(), fetchUsers()])
        .catch((err) => console.error("Error fetching data:", err))
        .finally(() => {
          if (isMounted) setIsLoading(false);
        });
      return () => {
        isMounted = false;
      };
    } else if (!authLoading && !tenantId) {
      Swal.fire("Error", "No tenant found. Please login as companyAdmin.", "error");
    }
  }, [authLoading, tenantId, user, pagination.page]);

  // Fetch roles from backend
  const fetchRoles = async () => {
    try {
      const { data } = await axiosInstance.get("/roles", { withCredentials: true });
      if (!Array.isArray(data.roles)) {
        throw new Error("Invalid roles data format");
      }
      setRoles(data.roles);
      setPagination((prev) => ({ ...prev, total: data.total || data.roles.length }));
    } catch (err) {
      console.error("Error fetching roles:", err);
      Swal.fire("Error", err.response?.data?.message || "Failed to fetch roles", "error");
      setRoles([]);
    }
  };

  // Fetch permissions from backend
  const fetchPermissions = async () => {
    try {
      const { data } = await axiosInstance.get("/permissions", { withCredentials: true });
      if (!Array.isArray(data.permissions)) {
        throw new Error("Invalid permissions data format");
      }
      setPermissions(data.permissions);
    } catch (err) {
      console.error("Error fetching permissions:", err);
      Swal.fire("Error", err.response?.data?.message || "Failed to fetch permissions", "error");
      setPermissions([]);
    }
  };

  // Fetch users from backend
  const fetchUsers = async () => {
    try {
      const { data } = await axiosInstance.get("/users?role=member", { withCredentials: true });
      if (!Array.isArray(data.users)) {
        throw new Error("Invalid users data format");
      }
      setUsers(data.users);
    } catch (err) {
      console.error("Error fetching users:", err);
      Swal.fire("Error", err.response?.data?.message || "Failed to fetch users", "error");
      setUsers([]);
    }
  };

  // Validate form inputs
  const validateForm = () => {
    const errors = {};
    if (!selectedRole && !editingRole) {
      errors.selectedRole = "Please select a role";
    }
    if (rolePermissions.length === 0) {
      errors.rolePermissions = "At least one permission is required";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save or update a role
  const handleSaveRole = async () => {
    if (!validateForm()) {
      Swal.fire("Error", "Please fill all required fields", "error");
      return;
    }
    if (!tenantId) {
      Swal.fire("Error", "No tenant ID found. Please log in again.", "error");
      return;
    }
    try {
      setIsLoading(true);
      const payload = {
        name: editingRole ? editingRole.name : selectedRole,
        permissions: memoizedRolePermissions,
        description: roleDescription,
        tenantId,
      };
      if (editingRole) {
        await axiosInstance.put(`/roles/${editingRole._id}`, payload, { withCredentials: true });
        Swal.fire("Success", "Role updated successfully", "success");
      } else {
        await axiosInstance.post("/roles", payload, { withCredentials: true });
        Swal.fire("Success", "Role added successfully", "success");
      }
      fetchRoles();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error("Error saving role:", error);
      if (error.response?.status === 401) {
        Swal.fire("Error", "Session expired. Please log in again.", "error");
      } else if (error.response?.status === 403) {
        Swal.fire("Error", error.response?.data?.message || "You are not authorized to create this role", "error");
      } else {
        Swal.fire("Error", error.response?.data?.message || "Failed to save role", "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a role
  const handleDeleteRole = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        setIsLoading(true);
        await axiosInstance.delete(`/roles/${id}`, { withCredentials: true });
        fetchRoles();
        Swal.fire("Deleted!", "Role has been deleted.", "success");
      }
    } catch (error) {
      console.error("Error deleting role:", error);
      Swal.fire("Error", error.response?.data?.message || "Failed to delete role", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle permission checkbox changes
  const handlePermissionChange = (permissionId, checked) => {
    if (checked) {
      setRolePermissions([...rolePermissions, permissionId]);
    } else {
      setRolePermissions(rolePermissions.filter((id) => id !== permissionId));
    }
  };

  // Edit a role
  const handleEditRole = async (role) => {
    setIsLoading(true);
    let assignedUsers = [];
    try {
      const { data } = await axiosInstance.get(`/roles/${role._id}/users`, { withCredentials: true });
      assignedUsers = data.users || [];
    } catch (err) {
      console.error("Error fetching assigned users for edit:", err);
      console.error("Error fetching assigned users:", {
        message: err.response?.data?.message,
        status: err.response?.status,
        error: err.message,
      });
      Swal.fire("Error", "Failed to fetch assigned users", "error");
    } finally {
      setEditingRole({ ...role, users: assignedUsers });
      setSelectedRole(role.name);
      setRoleDescription(role.description || "");
      setRolePermissions(role.permissions?.map((p) => p._id) || []);
      setIsLoading(false);
      setShowModal(true);
    }
  };

  // Assign a role to a user
  const handleAssignRole = async (userId, roleId) => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.post(`/roles/assign/${userId}`, { roleId }, { withCredentials: true });
      Swal.fire("Success", "Role assigned successfully", "success");
      setAssignedUserIds((prev) => [...prev, userId]);
      await fetchRoles(); // Refresh roles to update userCount
    } catch (err) {
      console.error("Error assigning role:", err);
      Swal.fire("Error", err.response?.data?.message || "Failed to assign role", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Unassign a role from a user
  const handleUnassignRole = async (userId, roleId) => {
    try {
      setIsLoading(true);
      await axiosInstance.post(`/roles/remove/${userId}`, { roleId }, { withCredentials: true });
      Swal.fire("Success", "Role unassigned successfully", "success");
      // Update editingRole state
      setEditingRole((prev) => ({
        ...prev,
        users: prev.users.filter((u) => u._id !== userId),
        userCount: (prev.userCount || prev.users.length) - 1
      }));


      // 🔥 FIX: assignedUserIds ko bhi update karo
      setAssignedUserIds((prev) => prev.filter((id) => id !== userId));
      setSearchTerm("");
      setShowDropdown(false);
      await fetchRoles(); // Refresh roles to update userCount
    } catch (err) {
      console.error("Error unassigning role:", err);
      Swal.fire("Error", err.response?.data?.message || "Failed to unassign role", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form fields
  const resetForm = () => {
    setEditingRole(null);
    setSelectedRole("");
    setRoleDescription("");
    setRolePermissions([]);
    setFormErrors({});
  };

  // Handle role selection change
  const handleRoleChange = (e) => {
    const role = e.target.value;
    setSelectedRole(role);
    setRolePermissions([]); // Reset permissions to none selected
    setRoleDescription(rolePermissionMap[role]?.description || "");
  };

  if (isLoading || authLoading) {
    return (
      <div className="role-management-container">
        <div className="role-management-loading">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading roles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="role-management-container">
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
                  <h1 className="page-title">Role Management</h1>
                  <p className="page-subtitle">Create and manage user roles and permissions</p>
                </div>
              </div>
              <div className="header-actions d-flex align-items-center gap-2">
                <Button variant="outline-secondary" size="sm" className="d-none d-md-flex" onClick={() => window.location.reload()}>
                  <MdRefresh className="me-1" />
                  Refresh
                </Button>
                <Button 
                  variant="primary"
                  onClick={() => {
                    resetForm();
                    setShowModal(true);
                  }}
                  disabled={
                    isLoading ||
                    authLoading ||
                    availablePredefinedRoles.length === 0 ||
                    !memberCanCreate
                  }
                >
                  <MdAdd className="me-1" />
                  <span className="d-none d-sm-inline">Create Role</span>
                  <span className="d-sm-none">Create</span>
                </Button>
                <Dropdown className="d-md-none">
                  <Dropdown.Toggle variant="outline-secondary" size="sm">
                    <MdMoreVert />
                  </Dropdown.Toggle>
                  <Dropdown.Menu align="end">
                    <Dropdown.Item onClick={() => window.location.reload()}>
                      <MdRefresh className="me-2" />
                      Refresh
                    </Dropdown.Item>
                    <Dropdown.Item>
                      <MdSettings className="me-2" />
                      Settings
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
              <div className="stat-icon stat-icon-roles">
                <MdGroup />
              </div>
              <div className="stat-content">
                <div className="stat-number">{roles.length}</div>
                <div className="stat-label">Total Roles</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon stat-icon-permissions">
                <MdVpnKey />
              </div>
              <div className="stat-content">
                <div className="stat-number">{permissions.length}</div>
                <div className="stat-label">Permissions</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon stat-icon-users">
                <MdAssignmentInd />
              </div>
              <div className="stat-content">
                <div className="stat-number">{roles.reduce((sum, role) => sum + (role.userCount || 0), 0)}</div>
                <div className="stat-label">Assigned Users</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon stat-icon-active">
                <MdSecurity />
              </div>
              <div className="stat-content">
                <div className="stat-number">{availablePredefinedRoles.length}</div>
                <div className="stat-label">Available Roles</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="content-grid">
          <div className="roles-section">
            <div className="section-card">
              <div className="section-header">
                <div className="section-title">
                  <h3>System Roles</h3>
                  <p>Manage role permissions and user assignments</p>
                </div>
                <div className="section-actions d-none d-md-flex">
                  <Button variant="outline-secondary" size="sm">
                    <MdFilterList className="me-1" />
                    Filter
                  </Button>
                </div>
              </div>

              {/* Desktop Table View */}
              <div className="roles-table d-none d-md-block">
                <div className="modern-table">
                  <div className="table-header">
                    <div className="table-row">
                      <div className="table-cell">Role</div>
                      <div className="table-cell">Permissions</div>
                      <div className="table-cell">Users</div>
                      <div className="table-cell text-center">Actions</div>
                    </div>
                  </div>
                  <div className="table-body">
                    {!memberCanRead ? (
                      <div className="empty-state">
                        <div className="empty-state-icon">
                          <MdSecurity />
                        </div>
                        <p>No permission to view roles</p>
                      </div>
                    ) : roles.length === 0 ? (
                      <div className="empty-state">
                        <div className="empty-state-icon">
                          <MdGroup />
                        </div>
                        <p>No roles found</p>
                      </div>
                    ) : (
                      roles.map((role) => (
                        <div key={role._id} className="table-row">
                          <div className="table-cell">
                            <div className="role-info">
                              <div className="role-icon">
                                <MdSecurity />
                              </div>
                              <div className="role-details">
                                <div className="role-name">{role.name}</div>
                                <div className="role-description">
                                  {role.description || "No description"}
                                </div>
                                {role.isSystem && (
                                  <span className="system-badge">System Role</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="table-cell">
                            <div className="permissions-list">
                              {role.permissions && role.permissions.length > 0 ? (
                                <>
                                  {role.permissions.slice(0, 2).map((permission, index) => {
                                    const permName = typeof permission === "string"
                                      ? permission
                                      : permission.name;
                                    return (
                                      <span key={permission._id || index} className="permission-badge">
                                        {permName.replace(":", " ")}
                                      </span>
                                    );
                                  })}
                                  {role.permissions.length > 2 && (
                                    <span className="permission-count">
                                      +{role.permissions.length - 2} more
                                    </span>
                                  )}
                                </>
                              ) : (
                                <span className="no-permissions">No permissions</span>
                              )}
                            </div>
                          </div>
                          <div className="table-cell">
                            <div className="user-count-wrapper">
                              <span className="user-count">{role.userCount || 0}</span>
                              <span className="user-count-label">users</span>
                              {memberCanAssign && (
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="assign-btn"
                                  onClick={async () => {
                                    setAssigningRole(role);
                                    setIsLoading(true);
                                    let assignedIds = [];
                                    try {
                                      const { data } = await axiosInstance.get(`/roles/${role._id}/users`, { withCredentials: true });
                                      assignedIds = data.users?.map((u) => u._id) || [];
                                    } catch (err) {
                                      console.error("Error fetching assigned users:", err);
                                      Swal.fire("Error", "Failed to fetch assigned users", "error");
                                    } finally {
                                      setAssignedUserIds(assignedIds);
                                      setIsLoading(false);
                                      setShowAssignModal(true);
                                    }
                                  }}
                                  disabled={isLoading}
                                >
                                  <MdAssignmentInd />
                                </Button>
                              )}
                            </div>
                          </div>
                          <div className="table-cell">
                            <div className="action-buttons">
                              {memberCanUpdate && (
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  className="action-btn"
                                  onClick={() => handleEditRole(role)}
                                  disabled={role.isSystem || isLoading}
                                >
                                  <MdEdit />
                                </Button>
                              )}
                              {memberCanDelete && (
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  className="action-btn"
                                  onClick={() => handleDeleteRole(role._id)}
                                  disabled={role.isSystem || isLoading}
                                >
                                  <MdDelete />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Mobile Cards View */}
              <div className="roles-cards d-md-none">
                {!memberCanRead ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <MdSecurity />
                    </div>
                    <p>No permission to view roles</p>
                  </div>
                ) : roles.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <MdGroup />
                    </div>
                    <p>No roles found</p>
                  </div>
                ) : (
                  roles.map((role) => (
                    <div key={role._id} className="role-card">
                      <div className="role-card-header">
                        <div className="role-icon">
                          <MdSecurity />
                        </div>
                        <div className="role-info">
                          <div className="role-name">{role.name}</div>
                          <div className="role-description">{role.description || "No description"}</div>
                        </div>
                        <div className="role-actions">
                          <Dropdown>
                            <Dropdown.Toggle variant="link" size="sm">
                              <MdMoreVert />
                            </Dropdown.Toggle>
                            <Dropdown.Menu align="end">
                              {memberCanUpdate && (
                                <Dropdown.Item 
                                  onClick={() => handleEditRole(role)}
                                  disabled={role.isSystem || isLoading}
                                >
                                  <MdEdit className="me-2" />
                                  Edit
                                </Dropdown.Item>
                              )}
                              {memberCanAssign && (
                                <Dropdown.Item
                                  onClick={async () => {
                                    setAssigningRole(role);
                                    setIsLoading(true);
                                    let assignedIds = [];
                                    try {
                                      const { data } = await axiosInstance.get(`/roles/${role._id}/users`, { withCredentials: true });
                                      assignedIds = data.users?.map((u) => u._id) || [];
                                    } catch (err) {
                                      console.error("Error fetching assigned users:", err);
                                      Swal.fire("Error", "Failed to fetch assigned users", "error");
                                    } finally {
                                      setAssignedUserIds(assignedIds);
                                      setIsLoading(false);
                                      setShowAssignModal(true);
                                    }
                                  }}
                                  disabled={isLoading}
                                >
                                  <MdAssignmentInd className="me-2" />
                                  Assign Users
                                </Dropdown.Item>
                              )}
                              {memberCanDelete && (
                                <Dropdown.Item 
                                  className="text-danger"
                                  onClick={() => handleDeleteRole(role._id)}
                                  disabled={role.isSystem || isLoading}
                                >
                                  <MdDelete className="me-2" />
                                  Delete
                                </Dropdown.Item>
                              )}
                            </Dropdown.Menu>
                          </Dropdown>
                        </div>
                      </div>
                      <div className="role-card-content">
                        <div className="role-meta">
                          <div className="meta-item">
                            <span className="meta-label">Permissions:</span>
                            <div className="permissions-mobile">
                              {role.permissions && role.permissions.length > 0 ? (
                                <>
                                  {role.permissions.slice(0, 3).map((permission, index) => {
                                    const permName = typeof permission === "string"
                                      ? permission
                                      : permission.name;
                                    return (
                                      <span key={permission._id || index} className="permission-badge-mobile">
                                        {permName.replace(":", " ")}
                                      </span>
                                    );
                                  })}
                                  {role.permissions.length > 3 && (
                                    <span className="permission-count-mobile">
                                      +{role.permissions.length - 3}
                                    </span>
                                  )}
                                </>
                              ) : (
                                <span className="no-permissions-mobile">None</span>
                              )}
                            </div>
                          </div>
                          <div className="meta-item">
                            <span className="meta-label">Users:</span>
                            <span className="meta-value">{role.userCount || 0} assigned</span>
                          </div>
                          {role.isSystem && (
                            <div className="meta-item">
                              <span className="system-badge-mobile">System Role</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Pagination */}
              <div className="pagination-section">
                <Pagination
                  current={pagination.page}
                  total={pagination.total}
                  limit={pagination.limit}
                  onChange={(page) => {
                    setPagination((prev) => ({ ...prev, page }));
                  }}
                />
              </div>
            </div>
          </div>

          {/* Create/Edit Role Modal */}
          <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
            <Modal.Header closeButton>
              <Modal.Title>{editingRole ? "Edit Role" : "Create New Role"}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Role Name</Form.Label>
                      {editingRole ? (
                        <Form.Control
                          type="text"
                          value={selectedRole}
                          disabled
                        />
                      ) : (
                        <Form.Select
                          value={selectedRole}
                          onChange={handleRoleChange}
                          disabled={isLoading}
                          isInvalid={!!formErrors.selectedRole}
                        >
                          <option value="">-- Select Role --</option>
                          {availablePredefinedRoles.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </Form.Select>
                      )}
                      <Form.Control.Feedback type="invalid">
                        {formErrors.selectedRole}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Description</Form.Label>
                      <Form.Control
                        type="text"
                        value={roleDescription}
                        onChange={(e) => setRoleDescription(e.target.value)}
                        placeholder="Enter role description"
                        disabled
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="mb-3">
                  <Form.Label>Permissions</Form.Label>
                  {formErrors.rolePermissions && (
                    <div className="text-danger mb-2">{formErrors.rolePermissions}</div>
                  )}
                  <div className="permission-grid">
                    {Object.entries(groupedPermissions).length > 0 ? (
                      Object.entries(groupedPermissions).map(([group, perms]) => (
                        <div key={group} className="mb-4 w-100">
                          <h5>{group.charAt(0).toUpperCase() + group.slice(1)} Permissions</h5>
                          <div className="d-flex justify-content-between flex-wrap gap-2 ">
                            {perms.map((permission) =>
                              permission && permission._id && permission.name ? (
                                <Card key={permission._id} className="permission-card mb-2" style={{ width: "15rem" }}>
                                  <Card.Body className="p-3">
                                    <Form.Check
                                      type="checkbox"
                                      id={`permission-${permission._id}`}
                                      label={permission.name.replace(":", " ")}
                                      checked={memoizedRolePermissions.includes(permission._id)}
                                      onChange={(e) => handlePermissionChange(permission._id, e.target.checked)}
                                      disabled={isLoading}
                                    />
                                    <small className="text-muted d-block mt-1">
                                      {permission.description || permission.name.replace(":", " ").toUpperCase()}
                                    </small>
                                  </Card.Body>
                                </Card>
                              ) : null
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted">No permissions available for this role.</p>
                    )}
                  </div>
                </Form.Group>
                {editingRole && (
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Assigned Users</Form.Label>
                    {editingRole.users && editingRole.users.length > 0 ? (
                      <ul className="list-group">
                        {editingRole.users.map((user) => (
                          <li
                            key={user._id}
                            className="list-group-item d-flex justify-content-between align-items-center"
                          >
                            {user.name} ({user.email})
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleUnassignRole(user._id, editingRole._id)}
                              disabled={isLoading || !memberCanRemove}
                            >
                              <MdDelete />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted">No users assigned to this role.</p>
                    )}
                  </Form.Group>
                )}
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)} disabled={isLoading}>
                <MdCancel className="me-2" />
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveRole} disabled={
                isLoading ||
                (editingRole ? !memberCanUpdate : !memberCanCreate)
              }>
                <MdSave className="me-2" />
                {editingRole ? "Update Role" : "Create Role"}
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Assign Role Modal */}
          <Modal show={showAssignModal} onHide={() => setShowAssignModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Assign Role: {assigningRole?.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form.Group>
                <Form.Label>Select User</Form.Label>
                {/* <Form.Select
                  value={selectedUserId || ""}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  disabled={isLoading}
                >
                  <option value="">-- Select User --</option>
                  {users.filter((user) => user.role !== "companyAdmin" &&
                    !assignedUserIds.includes(user._id)).map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                </Form.Select> */}

                <div className="position-relative" ref={inputRef}>
                  <Form.Control
                    type="text"
                    placeholder="Type to search user..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => {
                      setSearchTerm("");
                      setShowDropdown(true);
                    }} // Clear input and show dropdown on focus
                    disabled={isLoading}
                  />
                  {showDropdown && filteredUsers.length > 0 && (
                    <ul
                      className="list-group position-absolute w-100"
                      style={{
                        zIndex: 1000,
                        maxHeight: "200px",
                        overflowY: "auto",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                      }}
                    >
                      {filteredUsers.map((user) => (
                        <li
                          key={user._id}
                          className="list-group-item list-group-item-action"
                          style={{ cursor: "pointer" }}
                          onClick={() => handleSelectUser(user)}
                        >
                          {user.name} ({user.email})
                        </li>
                      ))}
                    </ul>
                  )}
                  {showDropdown && searchTerm && filteredUsers.length === 0 && (
                    <div
                      className="position-absolute w-100 p-2 bg-white"
                      style={{
                        zIndex: 1000,
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                      }}
                    >
                      No users found
                    </div>
                  )}
                </div>
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowAssignModal(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button
                variant="success"
                onClick={async () => {
                  if (!selectedUserId) return;
                  setIsLoading(true);
                  await handleAssignRole(selectedUserId, assigningRole._id);
                  setShowAssignModal(false);
                  setSelectedUserId("");
                  fetchUsers();
                  setIsLoading(false);
                }}
                disabled={!selectedUserId || isLoading || !memberCanAssign}
              >
                Assign
              </Button>
            </Modal.Footer>
          </Modal>

        </div>
      </Container>
    </div>
  );
};

export default RoleManagement;