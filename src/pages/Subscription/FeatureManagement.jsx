// src/pages/Subscription/FeatureManagement.jsx
// Admin screen for managing feature definitions

import React, { useState, useEffect } from 'react';
import {
    Container, Row, Col, Card, Table, Button, Modal, Form,
    Badge, InputGroup, Spinner, Alert
} from 'react-bootstrap';
import {
    MdAdd, MdEdit, MdDelete, MdRefresh, MdSearch,
    MdCheck, MdClose, MdToggleOn, MdToggleOff,
    MdSettings, MdCategory
} from 'react-icons/md';
import Swal from 'sweetalert2';
import {
    getFeatureDefinitions,
    createFeatureDefinition,
    updateFeatureDefinition,
    deleteFeatureDefinition
} from '../../api/services/subscriptionService';

const CATEGORIES = [
    { value: 'core', label: 'Core', color: 'primary' },
    { value: 'analytics', label: 'Analytics', color: 'info' },
    { value: 'distribution', label: 'Distribution', color: 'success' },
    { value: 'branding', label: 'Branding', color: 'warning' },
    { value: 'automation', label: 'Automation', color: 'danger' },
    { value: 'integration', label: 'Integration', color: 'secondary' },
    { value: 'support', label: 'Support', color: 'dark' }
];

const FeatureManagement = () => {
    const [features, setFeatures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [editingFeature, setEditingFeature] = useState(null);
    const [saving, setSaving] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        description: '',
        category: 'core',
        type: 'boolean',
        defaultValue: false,
        unit: '',
        isPublic: true,
        isActive: true,
        displayOrder: 0
    });

    useEffect(() => {
        fetchFeatures();
    }, []);

    const fetchFeatures = async () => {
        setLoading(true);
        try {
            const response = await getFeatureDefinitions();
            setFeatures(response.data || []);
        } catch (error) {
            Swal.fire('Error', 'Failed to load features', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreate = () => {
        setEditingFeature(null);
        setFormData({
            code: '',
            name: '',
            description: '',
            category: 'core',
            type: 'boolean',
            defaultValue: false,
            unit: '',
            isPublic: true,
            isActive: true,
            displayOrder: features.length
        });
        setShowModal(true);
    };

    const handleOpenEdit = (feature) => {
        setEditingFeature(feature);
        setFormData({
            code: feature.code,
            name: feature.name,
            description: feature.description || '',
            category: feature.category,
            type: feature.type,
            defaultValue: feature.defaultValue,
            unit: feature.unit || '',
            isPublic: feature.isPublic !== false,
            isActive: feature.isActive !== false,
            displayOrder: feature.displayOrder || 0
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            // Prepare data
            const data = {
                ...formData,
                defaultValue: formData.type === 'limit' ? Number(formData.defaultValue) : Boolean(formData.defaultValue)
            };

            if (editingFeature) {
                await updateFeatureDefinition(editingFeature._id, data);
                Swal.fire('Updated!', 'Feature updated successfully', 'success');
            } else {
                await createFeatureDefinition(data);
                Swal.fire('Created!', 'Feature created successfully', 'success');
            }

            setShowModal(false);
            fetchFeatures();
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Operation failed', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (feature) => {
        const result = await Swal.fire({
            title: 'Delete Feature?',
            text: `This will delete "${feature.name}". This cannot be undone!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await deleteFeatureDefinition(feature._id);
                Swal.fire('Deleted!', 'Feature has been deleted.', 'success');
                fetchFeatures();
            } catch (error) {
                Swal.fire('Error', error.response?.data?.message || 'Delete failed', 'error');
            }
        }
    };

    const handleToggleActive = async (feature) => {
        try {
            await updateFeatureDefinition(feature._id, { isActive: !feature.isActive });
            fetchFeatures();
        } catch (error) {
            Swal.fire('Error', 'Failed to update status', 'error');
        }
    };

    // Filter features
    const filteredFeatures = features.filter(f => {
        const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            f.code.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || f.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    // Group by category
    const groupedFeatures = CATEGORIES.reduce((acc, cat) => {
        acc[cat.value] = filteredFeatures.filter(f => f.category === cat.value);
        return acc;
    }, {});

    const getCategoryBadge = (category) => {
        const cat = CATEGORIES.find(c => c.value === category);
        return cat ? <Badge bg={cat.color}>{cat.label}</Badge> : <Badge>{category}</Badge>;
    };

    return (
        <Container fluid className="py-4">
            {/* Header */}
            <div className="page-header-section mb-4">
                <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <h1 className="d-flex align-items-center gap-2">
                            <MdSettings className="text-primary" />
                            Feature Management
                        </h1>
                        <p className="text-muted mb-0">
                            Manage feature definitions for subscription plans
                        </p>
                    </div>
                    <div className="d-flex gap-2">
                        <Button variant="outline-secondary" onClick={fetchFeatures}>
                            <MdRefresh className="me-1" /> Refresh
                        </Button>
                        <Button variant="primary" onClick={handleOpenCreate}>
                            <MdAdd className="me-1" /> New Feature
                        </Button>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <Row className="mb-4">
                <Col md={3}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="text-center">
                            <h3 className="text-primary">{features.length}</h3>
                            <small className="text-muted">Total Features</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="text-center">
                            <h3 className="text-success">{features.filter(f => f.isActive).length}</h3>
                            <small className="text-muted">Active Features</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="text-center">
                            <h3 className="text-info">{features.filter(f => f.type === 'boolean').length}</h3>
                            <small className="text-muted">Boolean Features</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="text-center">
                            <h3 className="text-warning">{features.filter(f => f.type === 'limit').length}</h3>
                            <small className="text-muted">Limit Features</small>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Search & Filter */}
            <Card className="border-0 shadow-sm mb-4">
                <Card.Body>
                    <Row>
                        <Col md={6}>
                            <InputGroup>
                                <InputGroup.Text><MdSearch /></InputGroup.Text>
                                <Form.Control
                                    placeholder="Search features..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </InputGroup>
                        </Col>
                        <Col md={6}>
                            <InputGroup>
                                <InputGroup.Text><MdCategory /></InputGroup.Text>
                                <Form.Select
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                >
                                    <option value="all">All Categories</option>
                                    {CATEGORIES.map(cat => (
                                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                                    ))}
                                </Form.Select>
                            </InputGroup>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Features Table */}
            {loading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2">Loading features...</p>
                </div>
            ) : filteredFeatures.length === 0 ? (
                <Alert variant="info">
                    No features found. Create your first feature to get started.
                </Alert>
            ) : (
                <Card className="border-0 shadow-sm">
                    <Card.Body className="p-0">
                        <Table hover responsive className="mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th>Feature</th>
                                    <th>Code</th>
                                    <th>Category</th>
                                    <th>Type</th>
                                    <th>Default</th>
                                    <th>Status</th>
                                    <th className="text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredFeatures.map(feature => (
                                    <tr key={feature._id}>
                                        <td>
                                            <div>
                                                <strong>{feature.name}</strong>
                                                {feature.description && (
                                                    <div className="small text-muted">{feature.description}</div>
                                                )}
                                            </div>
                                        </td>
                                        <td><code>{feature.code}</code></td>
                                        <td>{getCategoryBadge(feature.category)}</td>
                                        <td>
                                            <Badge bg={feature.type === 'boolean' ? 'info' : 'warning'}>
                                                {feature.type}
                                            </Badge>
                                        </td>
                                        <td>
                                            {feature.type === 'boolean' ? (
                                                feature.defaultValue ? <MdCheck className="text-success" /> : <MdClose className="text-muted" />
                                            ) : (
                                                <span>{feature.defaultValue} {feature.unit}</span>
                                            )}
                                        </td>
                                        <td>
                                            <Button
                                                size="sm"
                                                variant={feature.isActive ? "outline-success" : "outline-secondary"}
                                                onClick={() => handleToggleActive(feature)}
                                            >
                                                {feature.isActive ? <MdToggleOn /> : <MdToggleOff />}
                                                {' '}{feature.isActive ? 'Active' : 'Inactive'}
                                            </Button>
                                        </td>
                                        <td className="text-center">
                                            <Button
                                                size="sm"
                                                variant="outline-primary"
                                                className="me-1"
                                                onClick={() => handleOpenEdit(feature)}
                                            >
                                                <MdEdit />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline-danger"
                                                onClick={() => handleDelete(feature)}
                                            >
                                                <MdDelete />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>
            )}

            {/* Create/Edit Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {editingFeature ? 'Edit Feature' : 'Create Feature'}
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Feature Code *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                                        placeholder="e.g., max_surveys"
                                        required
                                        disabled={!!editingFeature}
                                    />
                                    <Form.Text className="text-muted">
                                        Lowercase with underscores. Cannot be changed after creation.
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Display Name *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g., Maximum Surveys"
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Brief description of the feature"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Category *</Form.Label>
                                    <Form.Select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        {CATEGORIES.map(cat => (
                                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Type *</Form.Label>
                                    <Form.Select
                                        value={formData.type}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            type: e.target.value,
                                            defaultValue: e.target.value === 'boolean' ? false : 0
                                        })}
                                    >
                                        <option value="boolean">Boolean (On/Off)</option>
                                        <option value="limit">Limit (Number)</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Default Value *</Form.Label>
                                    {formData.type === 'boolean' ? (
                                        <Form.Select
                                            value={formData.defaultValue.toString()}
                                            onChange={(e) => setFormData({ ...formData, defaultValue: e.target.value === 'true' })}
                                        >
                                            <option value="false">Disabled (Off)</option>
                                            <option value="true">Enabled (On)</option>
                                        </Form.Select>
                                    ) : (
                                        <Form.Control
                                            type="number"
                                            value={formData.defaultValue}
                                            onChange={(e) => setFormData({ ...formData, defaultValue: e.target.value })}
                                            placeholder="0"
                                        />
                                    )}
                                </Form.Group>
                            </Col>
                            {formData.type === 'limit' && (
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Unit</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={formData.unit}
                                            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                            placeholder="e.g., surveys, responses, GB"
                                        />
                                    </Form.Group>
                                </Col>
                            )}
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Display Order</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={formData.displayOrder}
                                        onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3 pt-4">
                                    <Form.Check
                                        type="switch"
                                        label="Show on public pricing page"
                                        checked={formData.isPublic}
                                        onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3 pt-4">
                                    <Form.Check
                                        type="switch"
                                        label="Feature is active"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="outline-secondary" onClick={() => setShowModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" disabled={saving}>
                            {saving ? (
                                <>
                                    <Spinner size="sm" className="me-1" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    {editingFeature ? 'Update Feature' : 'Create Feature'}
                                </>
                            )}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
};

export default FeatureManagement;
