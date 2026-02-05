// src/pages/Settings/DropdownSettings.jsx
// System Settings page for managing configurable dropdown options

import React, { useState, useEffect, useCallback } from "react";
import {
    Container,
    Row,
    Col,
    Card,
    Button,
    Form,
    Table,
    Badge,
    Modal,
    Spinner,
    Alert,
    Nav,
    Tab,
} from "react-bootstrap";
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
        <Container fluid className="py-4">
            {/* Page Header */}
            <Row className="mb-4">
                <Col>
                    <div className="d-flex align-items-center gap-3">
                        <div
                            className="d-flex align-items-center justify-content-center rounded"
                            style={{
                                width: 48,
                                height: 48,
                                backgroundColor: "rgba(31, 218, 228, 0.1)",
                            }}
                        >
                            <MdSettings size={24} style={{ color: "#1fdae4" }} />
                        </div>
                        <div>
                            <h2 className="mb-0">Dropdown Settings</h2>
                            <p className="text-muted mb-0">
                                Manage configurable dropdown options for your organization
                            </p>
                        </div>
                    </div>
                </Col>
            </Row>

            {/* Tabs and Content */}
            <Card className={darkMode ? "bg-dark text-light" : ""}>
                <Card.Body>
                    <Tab.Container activeKey={activeTab} onSelect={handleTabChange}>
                        {/* Tab Navigation */}
                        <Nav variant="tabs" className="mb-4">
                            {DROPDOWN_TYPES.map((type) => (
                                <Nav.Item key={type.key}>
                                    <Nav.Link
                                        eventKey={type.key}
                                        className="d-flex align-items-center gap-2"
                                    >
                                        <type.icon size={18} />
                                        <span>{type.label}</span>
                                        {typeCounts[type.key] > 0 && (
                                            <Badge bg="secondary" pill>
                                                {typeCounts[type.key]}
                                            </Badge>
                                        )}
                                    </Nav.Link>
                                </Nav.Item>
                            ))}
                        </Nav>

                        {/* Tab Content */}
                        <Tab.Content>
                            {/* Header with description and add button */}
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <div>
                                    <p className="text-muted mb-0">{currentType?.description}</p>
                                </div>
                                <div className="d-flex gap-2">
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        onClick={fetchOptions}
                                    >
                                        <MdRefresh className="me-1" /> Refresh
                                    </Button>
                                    <Button variant="primary" size="sm" onClick={handleAddNew}>
                                        <MdAdd className="me-1" /> Add Option
                                    </Button>
                                </div>
                            </div>

                            {/* Error Alert */}
                            {error && (
                                <Alert variant="danger" dismissible onClose={() => setError(null)}>
                                    {error}
                                </Alert>
                            )}

                            {/* Loading State */}
                            {loading ? (
                                <div className="text-center py-5">
                                    <Spinner animation="border" variant="primary" />
                                    <p className="mt-2 text-muted">Loading options...</p>
                                </div>
                            ) : options.length === 0 ? (
                                <div className="text-center py-5">
                                    <TypeIcon size={48} className="text-muted mb-3" />
                                    <p className="text-muted">No options configured yet.</p>
                                    <Button variant="primary" onClick={handleAddNew}>
                                        <MdAdd className="me-1" /> Add First Option
                                    </Button>
                                </div>
                            ) : (
                                /* Options Table */
                                <Table hover responsive className={darkMode ? "table-dark" : ""}>
                                    <thead>
                                        <tr>
                                            <th style={{ width: 50 }}>#</th>
                                            <th>Label</th>
                                            <th>Key</th>
                                            <th>Color</th>
                                            <th>Type</th>
                                            <th style={{ width: 120 }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {options.map((option, index) => (
                                            <tr key={option._id || index}>
                                                <td>{index + 1}</td>
                                                <td>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <div
                                                            style={{
                                                                width: 12,
                                                                height: 12,
                                                                borderRadius: "50%",
                                                                backgroundColor: option.color || "#6c757d",
                                                            }}
                                                        />
                                                        <span className="fw-medium">{option.label}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <code className="small">{option.key}</code>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <input
                                                            type="color"
                                                            value={option.color || "#6c757d"}
                                                            disabled
                                                            style={{ width: 24, height: 24, border: "none", padding: 0 }}
                                                        />
                                                        <span className="small text-muted">{option.color}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    {option.isDefault ? (
                                                        <Badge bg="info">System Default</Badge>
                                                    ) : option.tenant ? (
                                                        <Badge bg="success">Custom</Badge>
                                                    ) : (
                                                        <Badge bg="secondary">Global</Badge>
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="d-flex gap-1">
                                                        <Button
                                                            variant="outline-primary"
                                                            size="sm"
                                                            onClick={() => handleEdit(option)}
                                                            title="Edit"
                                                        >
                                                            <MdEdit />
                                                        </Button>
                                                        <Button
                                                            variant="outline-danger"
                                                            size="sm"
                                                            onClick={() => handleDelete(option)}
                                                            disabled={option.isDefault}
                                                            title={option.isDefault ? "Cannot delete default" : "Delete"}
                                                        >
                                                            <MdDelete />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            )}
                        </Tab.Content>
                    </Tab.Container>
                </Card.Body>
            </Card>

            {/* Add/Edit Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {modalMode === "add" ? "Add New Option" : "Edit Option"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {currentOption && (
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Label *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="label"
                                    value={currentOption.label}
                                    onChange={handleLabelChange}
                                    placeholder="e.g., Healthcare"
                                    required
                                />
                                <Form.Text className="text-muted">
                                    Display name shown in dropdowns
                                </Form.Text>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Key *</Form.Label>
                                <Form.Control
                                    type="text"
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
                                    disabled={modalMode === "edit"} // Can't change key after creation
                                    required
                                />
                                <Form.Text className="text-muted">
                                    Unique identifier (lowercase, no spaces)
                                </Form.Text>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Description</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    name="description"
                                    value={currentOption.description || ""}
                                    onChange={handleInputChange}
                                    placeholder="Optional description"
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Color</Form.Label>
                                <div className="d-flex align-items-center gap-2">
                                    <Form.Control
                                        type="color"
                                        name="color"
                                        value={currentOption.color || "#6c757d"}
                                        onChange={handleInputChange}
                                        style={{ width: 50, height: 38 }}
                                    />
                                    <Form.Control
                                        type="text"
                                        name="color"
                                        value={currentOption.color || "#6c757d"}
                                        onChange={handleInputChange}
                                        placeholder="#000000"
                                        style={{ width: 100 }}
                                    />
                                </div>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Sort Order</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="sortOrder"
                                    value={currentOption.sortOrder || 0}
                                    onChange={handleInputChange}
                                    min={0}
                                />
                            </Form.Group>
                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        <MdClose className="me-1" /> Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSave} disabled={saving}>
                        {saving ? (
                            <>
                                <Spinner size="sm" className="me-1" /> Saving...
                            </>
                        ) : (
                            <>
                                <MdSave className="me-1" /> {modalMode === "add" ? "Add" : "Save"}
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default DropdownSettings;
