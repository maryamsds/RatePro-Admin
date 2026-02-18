// src\pages\AccessManagement\RoleManagement.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
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
  const [mobileDropdownId, setMobileDropdownId] = useState(null);
  const inputRef = useRef(null);
  const mobileDropdownRef = useRef(null);

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
    setSearchTerm(`${user.name} (${user.email})`);
    setShowDropdown(false);
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (mobileDropdownRef.current && !mobileDropdownRef.current.contains(event.target)) {
        setMobileDropdownId(null);
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
      setRoleDescription(rolePermissionMap[firstRole]?.description || "");
      setRolePermissions([]);
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
      await axiosInstance.post(`/roles/assign/${userId}`, { roleId }, { withCredentials: true });
      Swal.fire("Success", "Role assigned successfully", "success");
      setAssignedUserIds((prev) => [...prev, userId]);
      await fetchRoles();
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
      setEditingRole((prev) => ({
        ...prev,
        users: prev.users.filter((u) => u._id !== userId),
        userCount: (prev.userCount || prev.users.length) - 1
      }));
      setAssignedUserIds((prev) => prev.filter((id) => id !== userId));
      setSearchTerm("");
      setShowDropdown(false);
      await fetchRoles();
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
    setRolePermissions([]);
    setRoleDescription(rolePermissionMap[role]?.description || "");
  };

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[var(--light-text)] dark:text-[var(--dark-text)]">Loading roles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Modern Header Section */}
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 mb-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <MdSecurity className="text-2xl text-blue-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">Role Management</h1>
                <p className="text-sm text-[var(--text-secondary)]">Create and manage user roles and permissions</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)]" 
                onClick={() => window.location.reload()}
              >
                <MdRefresh />
                Refresh
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
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
                <MdAdd />
                <span className="hidden sm:inline">Create Role</span>
                <span className="sm:hidden">Create</span>
              </button>
              {/* Mobile more menu */}
              <div className="md:hidden relative" ref={mobileDropdownRef}>
                <button
                  className="p-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)]"
                  onClick={() => setMobileDropdownId(mobileDropdownId === "header" ? null : "header")}
                >
                  <MdMoreVert />
                </button>
                {mobileDropdownId === "header" && (
                  <div className="absolute right-0 mt-2 bg-[var(--light-card)] dark:bg-[var(--dark-card)] shadow-lg rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] py-1 min-w-[160px] z-50">
                    <button className="w-full flex items-center gap-2 px-3 py-2 text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] transition-colors" onClick={() => { window.location.reload(); setMobileDropdownId(null); }}>
                      <MdRefresh />
                      Refresh
                    </button>
                    <button className="w-full flex items-center gap-2 px-3 py-2 text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] transition-colors" onClick={() => setMobileDropdownId(null)}>
                      <MdSettings />
                      Settings
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center">
                <MdGroup className="text-2xl text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">{roles.length}</p>
                <p className="text-sm text-[var(--text-secondary)]">Total Roles</p>
              </div>
            </div>
          </div>
          <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 dark:bg-purple-500/20 flex items-center justify-center">
                <MdVpnKey className="text-2xl text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">{permissions.length}</p>
                <p className="text-sm text-[var(--text-secondary)]">Permissions</p>
              </div>
            </div>
          </div>
          <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-500/10 dark:bg-green-500/20 flex items-center justify-center">
                <MdAssignmentInd className="text-2xl text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">{roles.reduce((sum, role) => sum + (role.userCount || 0), 0)}</p>
                <p className="text-sm text-[var(--text-secondary)]">Assigned Users</p>
              </div>
            </div>
          </div>
          <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-orange-500/10 dark:bg-orange-500/20 flex items-center justify-center">
                <MdSecurity className="text-2xl text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">{availablePredefinedRoles.length}</p>
                <p className="text-sm text-[var(--text-secondary)]">Available Roles</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">System Roles</h3>
                <p className="text-sm text-[var(--text-secondary)]">Manage role permissions and user assignments</p>
              </div>
              <div className="hidden md:flex">
                <button className="flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)]">
                  <MdFilterList />
                  Filter
                </button>
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                  <tr>
                    <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">Role</th>
                    <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">Permissions</th>
                    <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">Users</th>
                    <th className="p-3 text-center text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-[var(--light-card)] dark:bg-[var(--dark-card)]">
                  {!memberCanRead ? (
                    <tr>
                      <td colSpan="4" className="p-12">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-16 h-16 rounded-full bg-red-500/10 dark:bg-red-500/20 flex items-center justify-center">
                            <MdSecurity className="text-3xl text-red-500" />
                          </div>
                          <p className="text-[var(--text-secondary)]">No permission to view roles</p>
                        </div>
                      </td>
                    </tr>
                  ) : roles.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-12">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-16 h-16 rounded-full bg-gray-500/10 dark:bg-gray-500/20 flex items-center justify-center">
                            <MdGroup className="text-3xl text-gray-500" />
                          </div>
                          <p className="text-[var(--text-secondary)]">No roles found</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    roles.map((role) => (
                      <tr key={role._id} className="border-b border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                              <MdSecurity className="text-xl text-blue-500" />
                            </div>
                            <div>
                              <div className="font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">{role.name}</div>
                              <div className="text-sm text-[var(--text-secondary)] mt-0.5">
                                {role.description || "No description"}
                              </div>
                              {role.isSystem && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-500 mt-1">System Role</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-2">
                            {role.permissions && role.permissions.length > 0 ? (
                              <>
                                {role.permissions.slice(0, 2).map((permission, index) => {
                                  const permName = typeof permission === "string"
                                    ? permission
                                    : permission.name;
                                  return (
                                    <span key={permission._id || index} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-500/10 text-purple-500">
                                      {permName.replace(":", " ")}
                                    </span>
                                  );
                                })}
                                {role.permissions.length > 2 && (
                                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium text-[var(--text-secondary)]">
                                    +{role.permissions.length - 2} more
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="text-sm text-[var(--text-secondary)]">No permissions</span>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">{role.userCount || 0}</span>
                            <span className="text-sm text-[var(--text-secondary)]">users</span>
                            {memberCanAssign && (
                              <button
                                className="ml-2 p-1.5 rounded-md text-[var(--primary-color)] hover:bg-[var(--primary-color)]/10 transition-colors disabled:opacity-50"
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
                                <MdAssignmentInd className="text-xl" />
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-2">
                            {memberCanUpdate && (
                              <button
                                className="p-2 rounded-md font-medium transition-colors border border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-[var(--primary-color)] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => handleEditRole(role)}
                                disabled={role.isSystem || isLoading}
                              >
                                <MdEdit />
                              </button>
                            )}
                            {memberCanDelete && (
                              <button
                                className="p-2 rounded-md font-medium transition-colors border border-[var(--danger-color)] text-[var(--danger-color)] hover:bg-[var(--danger-color)] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => handleDeleteRole(role._id)}
                                disabled={role.isSystem || isLoading}
                              >
                                <MdDelete />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden space-y-4">
              {!memberCanRead ? (
                <div className="flex flex-col items-center gap-4 py-12">
                  <div className="w-16 h-16 rounded-full bg-red-500/10 dark:bg-red-500/20 flex items-center justify-center">
                    <MdSecurity className="text-3xl text-red-500" />
                  </div>
                  <p className="text-[var(--text-secondary)]">No permission to view roles</p>
                </div>
              ) : roles.length === 0 ? (
                <div className="flex flex-col items-center gap-4 py-12">
                  <div className="w-16 h-16 rounded-full bg-gray-500/10 dark:bg-gray-500/20 flex items-center justify-center">
                    <MdGroup className="text-3xl text-gray-500" />
                  </div>
                  <p className="text-[var(--text-secondary)]">No roles found</p>
                </div>
              ) : (
                roles.map((role) => (
                  <div key={role._id} className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <MdSecurity className="text-xl text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">{role.name}</div>
                        <div className="text-sm text-[var(--text-secondary)] mt-0.5">{role.description || "No description"}</div>
                      </div>
                      <div className="relative">
                        <button
                          className="p-1 text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] rounded"
                          onClick={() => setMobileDropdownId(mobileDropdownId === role._id ? null : role._id)}
                        >
                          <MdMoreVert />
                        </button>
                        {mobileDropdownId === role._id && (
                          <div className="absolute right-0 mt-2 bg-[var(--light-card)] dark:bg-[var(--dark-card)] shadow-lg rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] py-1 min-w-[160px] z-50">
                            {memberCanUpdate && (
                              <button
                                className="w-full flex items-center gap-2 px-3 py-2 text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] transition-colors disabled:opacity-50"
                                onClick={() => { handleEditRole(role); setMobileDropdownId(null); }}
                                disabled={role.isSystem || isLoading}
                              >
                                <MdEdit />
                                Edit
                              </button>
                            )}
                            {memberCanAssign && (
                              <button
                                className="w-full flex items-center gap-2 px-3 py-2 text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] transition-colors disabled:opacity-50"
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
                                    setMobileDropdownId(null);
                                  }
                                }}
                                disabled={isLoading}
                              >
                                <MdAssignmentInd />
                                Assign Users
                              </button>
                            )}
                            {memberCanDelete && (
                              <button
                                className="w-full flex items-center gap-2 px-3 py-2 text-[var(--danger-color)] hover:bg-red-500/10 transition-colors disabled:opacity-50"
                                onClick={() => { handleDeleteRole(role._id); setMobileDropdownId(null); }}
                                disabled={role.isSystem || isLoading}
                              >
                                <MdDelete />
                                Delete
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-[var(--text-secondary)] mb-1.5 block">Permissions:</span>
                        <div className="flex flex-wrap gap-2">
                          {role.permissions && role.permissions.length > 0 ? (
                            <>
                              {role.permissions.slice(0, 3).map((permission, index) => {
                                const permName = typeof permission === "string"
                                  ? permission
                                  : permission.name;
                                return (
                                  <span key={permission._id || index} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-500/10 text-purple-500">
                                    {permName.replace(":", " ")}
                                  </span>
                                );
                              })}
                              {role.permissions.length > 3 && (
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium text-[var(--text-secondary)]">
                                  +{role.permissions.length - 3}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-sm text-[var(--text-secondary)]">None</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-[var(--text-secondary)]">Users:</span>
                        <span className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">{role.userCount || 0} assigned</span>
                      </div>
                      {role.isSystem && (
                        <div>
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-500/10 text-blue-500">System Role</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            <div className="mt-6 pt-4 border-t border-[var(--light-border)] dark:border-[var(--dark-border)]">
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
        {showModal && (
          <div>
            <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowModal(false)}></div>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-lg w-full max-w-3xl max-h-[90vh] overflow-auto">
                <div className="flex items-center justify-between p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                  <h5 className="text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">{editingRole ? "Edit Role" : "Create New Role"}</h5>
                  <button 
                    type="button" 
                    className="w-8 h-8 flex items-center justify-center rounded-md text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] transition-colors"
                    onClick={() => setShowModal(false)}
                  >
                    ✕
                  </button>
                </div>
                <div className="p-4">
                  <form>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-2">Role Name</label>
                        {editingRole ? (
                          <input
                            type="text"
                            className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-50 cursor-not-allowed"
                            value={selectedRole}
                            disabled
                          />
                        ) : (
                          <>
                            <select
                              className={`w-full px-3 py-2 rounded-md border ${formErrors.selectedRole ? 'border-[var(--danger-color)]' : 'border-[var(--light-border)] dark:border-[var(--dark-border)]'} bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]`}
                              value={selectedRole}
                              onChange={handleRoleChange}
                              disabled={isLoading}
                            >
                              <option value="">-- Select Role --</option>
                              {availablePredefinedRoles.map((role) => (
                                <option key={role} value={role}>
                                  {role}
                                </option>
                              ))}
                            </select>
                            {formErrors.selectedRole && (
                              <div className="text-[var(--danger-color)] text-sm mt-1">
                                {formErrors.selectedRole}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-2">Description</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-50 cursor-not-allowed"
                          value={roleDescription}
                          onChange={(e) => setRoleDescription(e.target.value)}
                          placeholder="Enter role description"
                          disabled
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-2">Permissions</label>
                      {formErrors.rolePermissions && (
                        <div className="text-[var(--danger-color)] text-sm mb-2">{formErrors.rolePermissions}</div>
                      )}
                      <div className="space-y-4">
                        {Object.entries(groupedPermissions).length > 0 ? (
                          Object.entries(groupedPermissions).map(([group, perms]) => (
                            <div key={group}>
                              <h5 className="text-md font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)] mb-3">{group.charAt(0).toUpperCase() + group.slice(1)} Permissions</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {perms.map((permission) =>
                                  permission && permission._id && permission.name ? (
                                    <div key={permission._id} className="bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] rounded-md p-3 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                                      <div className="flex items-start gap-2">
                                        <input
                                          type="checkbox"
                                          className="mt-1 w-4 h-4 rounded border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)] disabled:opacity-50"
                                          id={`permission-${permission._id}`}
                                          checked={memoizedRolePermissions.includes(permission._id)}
                                          onChange={(e) => handlePermissionChange(permission._id, e.target.checked)}
                                          disabled={isLoading}
                                        />
                                        <label className="flex-1 cursor-pointer" htmlFor={`permission-${permission._id}`}>
                                          <span className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">
                                            {permission.name.replace(":", " ")}
                                          </span>
                                          <span className="block text-xs text-[var(--text-secondary)] mt-0.5">
                                            {permission.description || permission.name.replace(":", " ").toUpperCase()}
                                          </span>
                                        </label>
                                      </div>
                                    </div>
                                  ) : null
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-[var(--text-secondary)] text-sm">No permissions available for this role.</p>
                        )}
                      </div>
                    </div>
                    {editingRole && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-2">Assigned Users</label>
                        {editingRole.users && editingRole.users.length > 0 ? (
                          <div className="space-y-2">
                            {editingRole.users.map((u) => (
                              <div
                                key={u._id}
                                className="flex items-center justify-between p-3 bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)]"
                              >
                                <span className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">{u.name} ({u.email})</span>
                                <button
                                  className="p-2 rounded-md font-medium transition-colors border border-[var(--danger-color)] text-[var(--danger-color)] hover:bg-[var(--danger-color)] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                  onClick={() => handleUnassignRole(u._id, editingRole._id)}
                                  disabled={isLoading || !memberCanRemove}
                                >
                                  <MdDelete />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[var(--text-secondary)] text-sm">No users assigned to this role.</p>
                        )}
                      </div>
                    )}
                  </form>
                </div>
                <div className="flex items-center justify-end gap-2 p-4 border-t border-[var(--light-border)] dark:border-[var(--dark-border)]">
                  <button 
                    className="flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] disabled:opacity-50 disabled:cursor-not-allowed" 
                    onClick={() => setShowModal(false)} 
                    disabled={isLoading}
                  >
                    <MdCancel />
                    Cancel
                  </button>
                  <button 
                    className="flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed" 
                    onClick={handleSaveRole} 
                    disabled={
                      isLoading ||
                      (editingRole ? !memberCanUpdate : !memberCanCreate)
                    }
                  >
                    <MdSave />
                    {editingRole ? "Update Role" : "Create Role"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Assign Role Modal */}
        {showAssignModal && (
          <div>
            <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowAssignModal(false)}></div>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-lg w-full max-w-md">
                <div className="flex items-center justify-between p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                  <h5 className="text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">Assign Role: {assigningRole?.name}</h5>
                  <button 
                    type="button" 
                    className="w-8 h-8 flex items-center justify-center rounded-md text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] transition-colors"
                    onClick={() => setShowAssignModal(false)}
                  >
                    ✕
                  </button>
                </div>
                <div className="p-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-2">Select User</label>
                    <div className="relative" ref={inputRef}>
                      <input
                        type="text"
                        className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] disabled:opacity-50"
                        placeholder="Type to search user..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={() => {
                          setSearchTerm("");
                          setShowDropdown(true);
                        }}
                        disabled={isLoading}
                      />
                      {showDropdown && filteredUsers.length > 0 && (
                        <ul className="absolute w-full mt-1 bg-[var(--light-card)] dark:bg-[var(--dark-card)] border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-md shadow-lg max-h-48 overflow-y-auto z-50">
                          {filteredUsers.map((u) => (
                            <li
                              key={u._id}
                              className="px-3 py-2 text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] cursor-pointer transition-colors"
                              onClick={() => handleSelectUser(u)}
                            >
                              {u.name} ({u.email})
                            </li>
                          ))}
                        </ul>
                      )}
                      {showDropdown && searchTerm && filteredUsers.length === 0 && (
                        <div className="absolute w-full mt-1 p-3 bg-[var(--light-card)] dark:bg-[var(--dark-card)] border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-md shadow-lg z-50">
                          <p className="text-[var(--text-secondary)] text-sm">No users found</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 p-4 border-t border-[var(--light-border)] dark:border-[var(--dark-border)]">
                  <button 
                    className="px-4 py-2 rounded-md font-medium transition-colors border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] disabled:opacity-50 disabled:cursor-not-allowed" 
                    onClick={() => setShowAssignModal(false)} 
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--success-color)] text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleManagement;