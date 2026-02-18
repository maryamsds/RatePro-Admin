// src/pages/Settings/DropdownSettings.jsx
// System Settings page for managing configurable dropdown options

import React, { useState, useEffect, useCallback } from "react";
import {
    MdSettings,
    MdAdd,
    MdEdit,
    MdDelete,
    MdDragIndicator,
    MdCategory,
    MdBusiness,
    MdPeople,
    MdRefresh,
    MdSave,
    MdClose,
} from "react-icons/md";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import axiosInstance from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import { clearDropdownCache } from "../../hooks/useDropdownOptions";

const MySwal = withReactContent(Swal);

// Dropdown type configuration
const DROPDOWN_TYPES = [
    {
        key: "industry",
        label: "Industry Categories",
        description: "Industry/sector categories for surveys and templates",
        icon: MdBusiness,
        color: "#007bff",
    },
    {
        key: "survey_category",
        label: "Survey Categories",
        description: "Categories for classifying surveys",
        icon: MdCategory,
        color: "#28a745",
    },
    {
        key: "target_audience",
        label: "Target Audience",
        description: "Target audience types for survey distribution",
        icon: MdPeople,
        color: "#6f42c1",
    },
    {
        key: "ticket_category",
        label: "Ticket Categories",
        description: "Support ticket categories for issue tracking",
        icon: MdCategory,
        color: "#dc3545",
    },
    {
        key: "priority",
        label: "Priority Levels",
        description: "Priority levels for tickets and tasks",
        icon: MdSettings,
        color: "#fd7e14",
    },
];

const DropdownSettings = ({ darkMode }) => {
    const { user } = useAuth();
    const isAdmin = user?.role === "admin";

    // State
    const [activeTab, setActiveTab] = useState("industry");
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [typeCounts, setTypeCounts] = useState({});

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState("add"); // "add" or "edit"
    const [currentOption, setCurrentOption] = useState(null);
    const [saving, setSaving] = useState(false);

    // Fetch options for current tab
    const fetchOptions = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await axiosInstance.get(`/settings/dropdowns/${activeTab}`);
            if (response.data.success) {
                setOptions(response.data.options || []);
            }
        } catch (err) {
            console.error("Error fetching dropdown options:", err);
            setError("Failed to load dropdown options. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    // Fetch type counts for badges
    const fetchTypeCounts = useCallback(async () => {
        try {
            const response = await axiosInstance.get("/settings/dropdowns/types");
            if (response.data.success) {
                const counts = {};
                response.data.types.forEach((t) => {
                    counts[t.type] = t.count;
                });
                setTypeCounts(counts);
            }
        } catch (err) {
            console.error("Error fetching type counts:", err);
        }
    }, []);

    useEffect(() => {
        fetchOptions();
        fetchTypeCounts();
    }, [fetchOptions, fetchTypeCounts]);

    // Handle tab change
    const handleTabChange = (key) => {
        setActiveTab(key);
    };

    // Open modal for adding new option
    const handleAddNew = () => {
        setModalMode("add");
        setCurrentOption({
            type: activeTab,
            key: "",
            label: "",
            description: "",
            color: "#6c757d",
            sortOrder: options.length,
        });
        setShowModal(true);
    };

    // Open modal for editing
    const handleEdit = (option) => {
        setModalMode("edit");
        setCurrentOption({ ...option });
        setShowModal(true);
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentOption((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Auto-generate key from label
    const handleLabelChange = (e) => {
        const label = e.target.value;
        setCurrentOption((prev) => ({
            ...prev,
            label,
            // Only auto-generate key if in add mode and key hasn't been manually edited
            key: modalMode === "add" && !prev.keyEdited
                ? label.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "")
                : prev.key,
        }));
    };

    // Save option
    const handleSave = async () => {
        if (!currentOption.key || !currentOption.label) {
            MySwal.fire({
                icon: "warning",
                title: "Missing Fields",
                text: "Key and Label are required.",
            });
            return;
        }

        setSaving(true);

        try {
            let response;

            if (modalMode === "add") {
                response = await axiosInstance.post("/settings/dropdowns", currentOption);
            } else {
                response = await axiosInstance.put(`/settings/dropdowns/${currentOption._id}`, {
                    label: currentOption.label,
                    description: currentOption.description,
                    color: currentOption.color,
                    sortOrder: currentOption.sortOrder,
                });
            }

            if (response.data.success) {
                MySwal.fire({
                    icon: "success",
                    title: modalMode === "add" ? "Option Added" : "Option Updated",
                    text: response.data.message,
                    timer: 1500,
                    showConfirmButton: false,
                });

                setShowModal(false);
                clearDropdownCache(activeTab); // Clear cache so new options are fetched
                fetchOptions();
                fetchTypeCounts();
            }
        } catch (err) {
            console.error("Error saving option:", err);
            MySwal.fire({
                icon: "error",
                title: "Error",
                text: err.response?.data?.message || "Failed to save option.",
            });
        } finally {
            setSaving(false);
        }
    };

    // Delete option
    const handleDelete = async (option) => {
        if (option.isDefault) {
            MySwal.fire({
                icon: "warning",
                title: "Cannot Delete",
                text: "System default options cannot be deleted.",
            });
            return;
        }

        const result = await MySwal.fire({
            icon: "warning",
            title: "Delete Option?",
            text: `Are you sure you want to delete "${option.label}"?`,
            showCancelButton: true,
            confirmButtonColor: "#dc3545",
            confirmButtonText: "Delete",
        });

        if (result.isConfirmed) {
            try {
                const response = await axiosInstance.delete(`/settings/dropdowns/${option._id}`);

                if (response.data.success) {
                    MySwal.fire({
                        icon: "success",
                        title: "Deleted",
                        text: "Option deleted successfully.",
                        timer: 1500,
                        showConfirmButton: false,
                    });

                    clearDropdownCache(activeTab);
                    fetchOptions();
                    fetchTypeCounts();
                }
            } catch (err) {
                console.error("Error deleting option:", err);
                MySwal.fire({
                    icon: "error",
                    title: "Error",
                    text: err.response?.data?.message || "Failed to delete option.",
                });
            }
        }
    };

    // Get current type config
    const currentType = DROPDOWN_TYPES.find((t) => t.key === activeTab);
    const TypeIcon = currentType?.icon || MdSettings;

    return (
        <div className="w-full py-6 px-4">
            {/* Page Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3">
                    <div
                        className="flex items-center justify-center rounded-md bg-[var(--primary-light)]"
                        style={{ width: 48, height: 48 }}
                    >
                        <MdSettings size={24} className="text-[var(--primary-color)]" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">
                            Dropdown Settings
                        </h2>
                        <p className="text-[var(--text-secondary)] text-sm mb-0">
                            Manage configurable dropdown options for your organization
                        </p>
                    </div>
                </div>
            </div>

            {/* Tabs and Content */}
            <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                <div className="p-6">
                    <div>
                        {/* Tab Navigation */}
                        <div className="flex flex-wrap gap-2 mb-6 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                            {DROPDOWN_TYPES.map((type) => (
                                <button
                                    key={type.key}
                                    type="button"
                                    className={`flex items-center gap-2 px-4 py-2 -mb-px border-b-2 font-medium transition-colors ${
                                        activeTab === type.key
                                            ? "border-[var(--primary-color)] text-[var(--primary-color)]"
                                            : "border-transparent text-[var(--text-secondary)] hover:text-[var(--light-text)] dark:hover:text-[var(--dark-text)] hover:border-[var(--light-border)] dark:hover:border-[var(--dark-border)]"
                                    }`}
                                    onClick={() => handleTabChange(type.key)}
                                >
                                    <type.icon size={18} />
                                    <span>{type.label}</span>
                                    {typeCounts[type.key] > 0 && (
                                        <span className="px-2 py-0.5 text-xs rounded-full bg-[var(--text-secondary)] text-white">
                                            {typeCounts[type.key]}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div>
                            {/* Header with description and add button */}
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
                                <div>
                                    <p className="text-[var(--text-secondary)] mb-0">{currentType?.description}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        className="flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)]"
                                        onClick={fetchOptions}
                                    >
                                        <MdRefresh size={16} />
                                        Refresh
                                    </button>
                                    <button
                                        type="button"
                                        className="flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)]"
                                        onClick={handleAddNew}
                                    >
                                        <MdAdd size={16} />
                                        Add Option
                                    </button>
                                </div>
                            </div>

                            {/* Error Alert */}
                            {error && (
                                <div className="mb-4 p-4 rounded-md bg-[var(--danger-light)] border border-[var(--danger-color)] flex items-start justify-between">
                                    <span className="text-[var(--danger-color)] text-sm">{error}</span>
                                    <button
                                        type="button"
                                        className="text-[var(--danger-color)] hover:text-[var(--danger-color)] ml-2"
                                        onClick={() => setError(null)}
                                    >
                                        <MdClose size={18} />
                                    </button>
                                </div>
                            )}

                            {/* Loading State */}
                            {loading ? (
                                <div className="text-center py-12">
                                    <div className="inline-block w-10 h-10 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin"></div>
                                    <p className="mt-3 text-[var(--text-secondary)] text-sm">Loading options...</p>
                                </div>
                            ) : options.length === 0 ? (
                                <div className="text-center py-12">
                                    <TypeIcon size={48} className="text-[var(--text-secondary)] mb-3 mx-auto" />
                                    <p className="text-[var(--text-secondary)] mb-4">No options configured yet.</p>
                                    <button
                                        type="button"
                                        className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)]"
                                        onClick={handleAddNew}
                                    >
                                        <MdAdd className="inline mr-1" size={16} />
                                        Add First Option
                                    </button>
                                </div>
                            ) : (
                                /* Options Table */
                                <div className="overflow-x-auto">
                                    <table className="min-w-full border-collapse">
                                        <thead className="bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                                            <tr>
                                                <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold text-sm" style={{ width: 50 }}>
                                                    #
                                                </th>
                                                <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold text-sm">
                                                    Label
                                                </th>
                                                <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold text-sm">
                                                    Key
                                                </th>
                                                <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold text-sm">
                                                    Color
                                                </th>
                                                <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold text-sm">
                                                    Type
                                                </th>
                                                <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold text-sm" style={{ width: 120 }}>
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-[var(--light-card)] dark:bg-[var(--dark-card)]">
                                            {options.map((option, index) => (
                                                <tr
                                                    key={option._id || index}
                                                    className="border-b border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] transition-colors"
                                                >
                                                    <td className="p-3 text-[var(--light-text)] dark:text-[var(--dark-text)] text-sm">
                                                        {index + 1}
                                                    </td>
                                                    <td className="p-3 text-[var(--light-text)] dark:text-[var(--dark-text)]">
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className="rounded-full"
                                                                style={{
                                                                    width: 12,
                                                                    height: 12,
                                                                    backgroundColor: option.color || "#6c757d",
                                                                }}
                                                            />
                                                            <span className="font-medium text-sm">{option.label}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-3">
                                                        <code className="text-xs px-2 py-1 rounded bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--primary-color)]">
                                                            {option.key}
                                                        </code>
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="color"
                                                                value={option.color || "#6c757d"}
                                                                disabled
                                                                className="w-6 h-6 border-0 rounded cursor-not-allowed"
                                                            />
                                                            <span className="text-xs text-[var(--text-secondary)]">{option.color}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-3">
                                                        {option.isDefault ? (
                                                            <span className="px-2 py-1 text-xs rounded bg-[var(--info-light)] text-[var(--info-color)] font-medium">
                                                                System Default
                                                            </span>
                                                        ) : option.tenant ? (
                                                            <span className="px-2 py-1 text-xs rounded bg-[var(--success-light)] text-[var(--success-color)] font-medium">
                                                                Custom
                                                            </span>
                                                        ) : (
                                                            <span className="px-2 py-1 text-xs rounded bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--text-secondary)] font-medium">
                                                                Global
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="flex gap-1">
                                                            <button
                                                                type="button"
                                                                className="p-2 rounded-md transition-colors border border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-[var(--primary-light)]"
                                                                onClick={() => handleEdit(option)}
                                                                title="Edit"
                                                            >
                                                                <MdEdit size={16} />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className={`p-2 rounded-md transition-colors border ${
                                                                    option.isDefault
                                                                        ? "border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--text-secondary)] cursor-not-allowed opacity-50"
                                                                        : "border-[var(--danger-color)] text-[var(--danger-color)] hover:bg-[var(--danger-light)]"
                                                                }`}
                                                                onClick={() => handleDelete(option)}
                                                                disabled={option.isDefault}
                                                                title={option.isDefault ? "Cannot delete default" : "Delete"}
                                                            >
                                                                <MdDelete size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <>
                    {/* Modal Backdrop */}
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-40"
                        onClick={() => setShowModal(false)}
                    />
                    {/* Modal Dialog */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-lg w-full max-w-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                                <h5 className="text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">
                                    {modalMode === "add" ? "Add New Option" : "Edit Option"}
                                </h5>
                                <button
                                    type="button"
                                    className="text-[var(--text-secondary)] hover:text-[var(--light-text)] dark:hover:text-[var(--dark-text)] transition-colors"
                                    onClick={() => setShowModal(false)}
                                >
                                    <MdClose size={24} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-4">
                                {currentOption && (
                                    <form>
                                        {/* Label Field */}
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-2">
                                                Label *
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                                                name="label"
                                                value={currentOption.label}
                                                onChange={handleLabelChange}
                                                placeholder="e.g., Healthcare"
                                                required
                                            />
                                            <div className="mt-1 text-xs text-[var(--text-secondary)]">
                                                Display name shown in dropdowns
                                            </div>
                                        </div>

                                        {/* Key Field */}
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-2">
                                                Key *
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] disabled:opacity-50 disabled:cursor-not-allowed"
                                                name="key"
                                                value={currentOption.key}
                                                onChange={(e) => {
                                                    setCurrentOption((prev) => ({
                                                        ...prev,
                                                        key: e.target.value.toLowerCase().replace(/\s+/g, "_"),
                                                        keyEdited: true,
                                                    }));
                                                }}
                                                placeholder="e.g., healthcare"
                                                disabled={modalMode === "edit"}
                                                required
                                            />
                                            <div className="mt-1 text-xs text-[var(--text-secondary)]">
                                                Unique identifier (lowercase, no spaces)
                                            </div>
                                        </div>

                                        {/* Description Field */}
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-2">
                                                Description
                                            </label>
                                            <textarea
                                                className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] resize-none"
                                                rows={2}
                                                name="description"
                                                value={currentOption.description || ""}
                                                onChange={handleInputChange}
                                                placeholder="Optional description"
                                            />
                                        </div>

                                        {/* Color Field */}
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-2">
                                                Color
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    className="w-12 h-10 rounded border border-[var(--light-border)] dark:border-[var(--dark-border)] cursor-pointer"
                                                    name="color"
                                                    value={currentOption.color || "#6c757d"}
                                                    onChange={handleInputChange}
                                                />
                                                <input
                                                    type="text"
                                                    className="flex-1 px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                                                    name="color"
                                                    value={currentOption.color || "#6c757d"}
                                                    onChange={handleInputChange}
                                                    placeholder="#000000"
                                                />
                                            </div>
                                        </div>

                                        {/* Sort Order Field */}
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-2">
                                                Sort Order
                                            </label>
                                            <input
                                                type="number"
                                                className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                                                name="sortOrder"
                                                value={currentOption.sortOrder || 0}
                                                onChange={handleInputChange}
                                                min={0}
                                            />
                                        </div>
                                    </form>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="flex items-center justify-end gap-2 p-4 border-t border-[var(--light-border)] dark:border-[var(--dark-border)]">
                                <button
                                    type="button"
                                    className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--text-secondary)] text-white hover:opacity-90"
                                    onClick={() => setShowModal(false)}
                                >
                                    <MdClose className="inline mr-1" size={16} />
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={handleSave}
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <>
                                            <span className="inline-block w-4 h-4 mr-1 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <MdSave className="inline mr-1" size={16} />
                                            {modalMode === "add" ? "Add" : "Save"}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default DropdownSettings;
