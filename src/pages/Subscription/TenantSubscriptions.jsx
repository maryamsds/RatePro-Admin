// src/pages/Subscription/TenantSubscriptions.jsx
// Admin screen for managing all tenant subscriptions

import React, { useState, useEffect } from 'react';
import {
    Container, Row, Col, Card, Table, Button, Modal, Form,
    Badge, InputGroup, Spinner, Alert, ProgressBar
} from 'react-bootstrap';
import {
    MdRefresh, MdSearch, MdFilterList, MdBusiness,
    MdCheck, MdClose, MdEdit, MdStar, MdWarning,
    MdCreditCard
} from 'react-icons/md';
import Swal from 'sweetalert2';
import {
    getAllTenantSubscriptions,
    getPlanTemplates,
    getFeatureDefinitions,
    applyPlanToTenant,
    setTenantCustomFeature
} from '../../api/services/subscriptionService';

const STATUS_COLORS = {
    active: 'success',
    trialing: 'info',
    past_due: 'warning',
    cancelled: 'danger',
    unpaid: 'danger'
};

const TenantSubscriptions = () => {
    const [subscriptions, setSubscriptions] = useState([]);
    const [plans, setPlans] = useState([]);
    const [features, setFeatures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterPlan, setFilterPlan] = useState('');

    // Modals
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showApplyPlanModal, setShowApplyPlanModal] = useState(false);
    const [showCustomFeatureModal, setShowCustomFeatureModal] = useState(false);
    const [selectedSubscription, setSelectedSubscription] = useState(null);

    // Form states
    const [selectedPlanCode, setSelectedPlanCode] = useState('');
    const [customFeatureData, setCustomFeatureData] = useState({
        featureCode: '',
        value: '',
        expiresAt: ''
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, [filterStatus, filterPlan]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [subsRes, plansRes, featuresRes] = await Promise.all([
                getAllTenantSubscriptions({ status: filterStatus, planCode: filterPlan, limit: 50 }),
                getPlanTemplates(),
                getFeatureDefinitions()
            ]);

            setSubscriptions(subsRes.data?.subscriptions || []);
            setPagination(subsRes.data?.pagination || { current: 1, pages: 1, total: 0 });
            setPlans(plansRes.data || []);
            setFeatures(featuresRes.data || []);
        } catch (error) {
            Swal.fire('Error', 'Failed to load subscriptions', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (subscription) => {
        setSelectedSubscription(subscription);
        setShowDetailModal(true);
    };

    const handleOpenApplyPlan = (subscription) => {
        setSelectedSubscription(subscription);
        setSelectedPlanCode(subscription.planCode || '');
        setShowApplyPlanModal(true);
    };

    const handleApplyPlan = async () => {
        if (!selectedPlanCode) {
            Swal.fire('Error', 'Please select a plan', 'error');
            return;
        }

        setSaving(true);
        try {
            await applyPlanToTenant(selectedSubscription.tenant._id || selectedSubscription.tenant, selectedPlanCode);
            Swal.fire('Success!', 'Plan applied successfully', 'success');
            setShowApplyPlanModal(false);
            fetchData();
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Failed to apply plan', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleOpenCustomFeature = (subscription) => {
        setSelectedSubscription(subscription);
        setCustomFeatureData({ featureCode: '', value: '', expiresAt: '' });
        setShowCustomFeatureModal(true);
    };

    const handleSetCustomFeature = async () => {
        if (!customFeatureData.featureCode || customFeatureData.value === '') {
            Swal.fire('Error', 'Please select a feature and set a value', 'error');
            return;
        }

        setSaving(true);
        try {
            const featureDef = features.find(f => f.code === customFeatureData.featureCode);
            const value = featureDef?.type === 'boolean'
                ? customFeatureData.value === 'true'
                : parseInt(customFeatureData.value);

            await setTenantCustomFeature(
                selectedSubscription.tenant._id || selectedSubscription.tenant,
                {
                    featureCode: customFeatureData.featureCode,
                    value,
                    expiresAt: customFeatureData.expiresAt || null
                }
            );
            Swal.fire('Success!', 'Custom feature set successfully', 'success');
            setShowCustomFeatureModal(false);
            fetchData();
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Failed to set feature', 'error');
        } finally {
            setSaving(false);
        }
    };

    const getFeatureDisplay = (featureCode, featureData) => {
        const def = features.find(f => f.code === featureCode);
        if (!def) return null;

        if (def.type === 'boolean') {
            return featureData.enabled
                ? <MdCheck className="text-success" />
                : <MdClose className="text-muted" />;
        }

        const value = featureData.limitValue;
        return (
            <Badge bg={value === -1 ? 'success' : 'secondary'}>
                {value === -1 ? '∞' : value}
                {featureData.customValue !== null && (
                    <MdStar className="ms-1 text-warning" title="Custom override" />
                )}
            </Badge>
        );
    };

    // Filter subscriptions by search
    const filteredSubscriptions = subscriptions.filter(sub => {
        const tenantName = sub.tenant?.name || '';
        const tenantEmail = sub.tenant?.contactEmail || '';
        return tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tenantEmail.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <Container fluid className="py-4">
            {/* Header */}
            <div className="page-header-section mb-4">
                <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <h1 className="d-flex align-items-center gap-2">
                            <MdBusiness className="text-primary" />
                            Tenant Subscriptions
                        </h1>
                        <p className="text-muted mb-0">
                            View and manage all tenant subscriptions
                        </p>
                    </div>
                    <Button variant="outline-secondary" onClick={fetchData}>
                        <MdRefresh className="me-1" /> Refresh
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <Row className="mb-4">
                <Col md={3}>
                    <Card className="border-0 shadow-sm bg-success bg-opacity-10">
                        <Card.Body className="text-center">
                            <h3 className="text-success">{subscriptions.filter(s => s.billing?.status === 'active').length}</h3>
                            <small className="text-muted">Active</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 shadow-sm bg-info bg-opacity-10">
                        <Card.Body className="text-center">
                            <h3 className="text-info">{subscriptions.filter(s => s.billing?.status === 'trialing').length}</h3>
                            <small className="text-muted">Trialing</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 shadow-sm bg-warning bg-opacity-10">
                        <Card.Body className="text-center">
                            <h3 className="text-warning">{subscriptions.filter(s => s.billing?.status === 'past_due').length}</h3>
                            <small className="text-muted">Past Due</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 shadow-sm bg-danger bg-opacity-10">
                        <Card.Body className="text-center">
                            <h3 className="text-danger">{subscriptions.filter(s => s.billing?.status === 'cancelled').length}</h3>
                            <small className="text-muted">Cancelled</small>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Filters */}
            <Card className="border-0 shadow-sm mb-4">
                <Card.Body>
                    <Row>
                        <Col md={4}>
                            <InputGroup>
                                <InputGroup.Text><MdSearch /></InputGroup.Text>
                                <Form.Control
                                    placeholder="Search by tenant name or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </InputGroup>
                        </Col>
                        <Col md={4}>
                            <InputGroup>
                                <InputGroup.Text><MdFilterList /></InputGroup.Text>
                                <Form.Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                                    <option value="">All Statuses</option>
                                    <option value="active">Active</option>
                                    <option value="trialing">Trialing</option>
                                    <option value="past_due">Past Due</option>
                                    <option value="cancelled">Cancelled</option>
                                </Form.Select>
                            </InputGroup>
                        </Col>
                        <Col md={4}>
                            <InputGroup>
                                <InputGroup.Text><MdCreditCard /></InputGroup.Text>
                                <Form.Select value={filterPlan} onChange={(e) => setFilterPlan(e.target.value)}>
                                    <option value="">All Plans</option>
                                    {plans.map(p => (
                                        <option key={p._id} value={p.code}>{p.name}</option>
                                    ))}
                                </Form.Select>
                            </InputGroup>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Subscriptions Table */}
            {loading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2">Loading subscriptions...</p>
                </div>
            ) : filteredSubscriptions.length === 0 ? (
                <Alert variant="info">No subscriptions found.</Alert>
            ) : (
                <Card className="border-0 shadow-sm">
                    <Card.Body className="p-0">
                        <Table hover responsive className="mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th>Tenant</th>
                                    <th>Plan</th>
                                    <th>Status</th>
                                    <th>Billing Cycle</th>
                                    <th>Usage</th>
                                    <th>Period End</th>
                                    <th className="text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSubscriptions.map(sub => (
                                    <tr key={sub._id}>
                                        <td>
                                            <div>
                                                <strong>{sub.tenant?.name || 'Unknown'}</strong>
                                                <div className="small text-muted">{sub.tenant?.contactEmail}</div>
                                            </div>
                                        </td>
                                        <td>
                                            <Badge bg="primary">{sub.planCode || 'Free'}</Badge>
                                        </td>
                                        <td>
                                            <Badge bg={STATUS_COLORS[sub.billing?.status] || 'secondary'}>
                                                {sub.billing?.status || 'unknown'}
                                            </Badge>
                                        </td>
                                        <td>{sub.billing?.cycle || 'N/A'}</td>
                                        <td>
                                            <div className="small">
                                                <span>Responses: </span>
                                                <strong>
                                                    {sub.usage?.responsesThisMonth || 0} /
                                                    {sub.features?.find(f => f.featureCode === 'max_responses_monthly')?.limitValue === -1
                                                        ? '∞'
                                                        : sub.features?.find(f => f.featureCode === 'max_responses_monthly')?.limitValue || 0}
                                                </strong>
                                            </div>
                                        </td>
                                        <td>
                                            {sub.billing?.currentPeriodEnd
                                                ? new Date(sub.billing.currentPeriodEnd).toLocaleDateString()
                                                : 'N/A'}
                                        </td>
                                        <td className="text-center">
                                            <Button
                                                size="sm"
                                                variant="outline-info"
                                                className="me-1"
                                                onClick={() => handleViewDetails(sub)}
                                                title="View Details"
                                            >
                                                <MdSearch />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline-primary"
                                                className="me-1"
                                                onClick={() => handleOpenApplyPlan(sub)}
                                                title="Change Plan"
                                            >
                                                <MdCreditCard />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline-warning"
                                                onClick={() => handleOpenCustomFeature(sub)}
                                                title="Custom Feature"
                                            >
                                                <MdStar />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>
            )}

            {/* Detail Modal */}
            <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        Subscription Details: {selectedSubscription?.tenant?.name}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedSubscription && (
                        <Row>
                            <Col md={6}>
                                <h5>Billing Information</h5>
                                <Table size="sm" bordered>
                                    <tbody>
                                        <tr>
                                            <td><strong>Plan</strong></td>
                                            <td><Badge bg="primary">{selectedSubscription.planCode}</Badge></td>
                                        </tr>
                                        <tr>
                                            <td><strong>Status</strong></td>
                                            <td>
                                                <Badge bg={STATUS_COLORS[selectedSubscription.billing?.status]}>
                                                    {selectedSubscription.billing?.status}
                                                </Badge>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td><strong>Billing Cycle</strong></td>
                                            <td>{selectedSubscription.billing?.cycle}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Period End</strong></td>
                                            <td>
                                                {selectedSubscription.billing?.currentPeriodEnd
                                                    ? new Date(selectedSubscription.billing.currentPeriodEnd).toLocaleDateString()
                                                    : 'N/A'}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td><strong>Gateway</strong></td>
                                            <td>{selectedSubscription.payment?.gateway || 'None'}</td>
                                        </tr>
                                    </tbody>
                                </Table>

                                <h5 className="mt-4">Usage This Month</h5>
                                <Table size="sm" bordered>
                                    <tbody>
                                        <tr>
                                            <td>Surveys</td>
                                            <td>{selectedSubscription.usage?.surveysThisMonth || 0}</td>
                                        </tr>
                                        <tr>
                                            <td>Responses</td>
                                            <td>{selectedSubscription.usage?.responsesThisMonth || 0}</td>
                                        </tr>
                                        <tr>
                                            <td>Emails Sent</td>
                                            <td>{selectedSubscription.usage?.emailsSentThisMonth || 0}</td>
                                        </tr>
                                        <tr>
                                            <td>SMS Sent</td>
                                            <td>{selectedSubscription.usage?.smsSentThisMonth || 0}</td>
                                        </tr>
                                    </tbody>
                                </Table>
                            </Col>
                            <Col md={6}>
                                <h5>Active Features</h5>
                                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                    {selectedSubscription.features?.map(f => {
                                        const def = features.find(fd => fd.code === f.featureCode);
                                        return (
                                            <div key={f.featureCode} className="d-flex justify-content-between border-bottom py-1">
                                                <span>
                                                    {def?.name || f.featureCode}
                                                    {f.customValue !== null && (
                                                        <MdStar className="ms-1 text-warning" title="Custom override" />
                                                    )}
                                                </span>
                                                {getFeatureDisplay(f.featureCode, f)}
                                            </div>
                                        );
                                    })}
                                </div>
                            </Col>
                        </Row>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Apply Plan Modal */}
            <Modal show={showApplyPlanModal} onHide={() => setShowApplyPlanModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Apply Plan to {selectedSubscription?.tenant?.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label>Select Plan</Form.Label>
                        <Form.Select
                            value={selectedPlanCode}
                            onChange={(e) => setSelectedPlanCode(e.target.value)}
                        >
                            <option value="">-- Select Plan --</option>
                            {plans.filter(p => p.isActive).map(plan => (
                                <option key={plan._id} value={plan.code}>
                                    {plan.name} (${plan.pricing?.monthly}/mo)
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                    <Alert variant="warning" className="mt-3 small">
                        <MdWarning className="me-1" />
                        This will immediately update the tenant's features to match the selected plan.
                    </Alert>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowApplyPlanModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleApplyPlan} disabled={saving}>
                        {saving ? <Spinner size="sm" /> : 'Apply Plan'}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Custom Feature Modal */}
            <Modal show={showCustomFeatureModal} onHide={() => setShowCustomFeatureModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Set Custom Feature for {selectedSubscription?.tenant?.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Feature</Form.Label>
                        <Form.Select
                            value={customFeatureData.featureCode}
                            onChange={(e) => setCustomFeatureData({ ...customFeatureData, featureCode: e.target.value, value: '' })}
                        >
                            <option value="">-- Select Feature --</option>
                            {features.map(f => (
                                <option key={f._id} value={f.code}>
                                    {f.name} ({f.type})
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    {customFeatureData.featureCode && (
                        <Form.Group className="mb-3">
                            <Form.Label>Value</Form.Label>
                            {features.find(f => f.code === customFeatureData.featureCode)?.type === 'boolean' ? (
                                <Form.Select
                                    value={customFeatureData.value}
                                    onChange={(e) => setCustomFeatureData({ ...customFeatureData, value: e.target.value })}
                                >
                                    <option value="">-- Select --</option>
                                    <option value="true">Enabled</option>
                                    <option value="false">Disabled</option>
                                </Form.Select>
                            ) : (
                                <Form.Control
                                    type="number"
                                    value={customFeatureData.value}
                                    onChange={(e) => setCustomFeatureData({ ...customFeatureData, value: e.target.value })}
                                    placeholder="Enter limit value (-1 for unlimited)"
                                />
                            )}
                        </Form.Group>
                    )}

                    <Form.Group className="mb-3">
                        <Form.Label>Expires At (optional)</Form.Label>
                        <Form.Control
                            type="date"
                            value={customFeatureData.expiresAt}
                            onChange={(e) => setCustomFeatureData({ ...customFeatureData, expiresAt: e.target.value })}
                        />
                        <Form.Text className="text-muted">Leave empty for permanent override</Form.Text>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCustomFeatureModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="warning" onClick={handleSetCustomFeature} disabled={saving}>
                        {saving ? <Spinner size="sm" /> : 'Set Custom Feature'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default TenantSubscriptions;
