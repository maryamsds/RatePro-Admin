// src/pages/Subscription/PlanBuilder.jsx
// Admin screen for managing plan templates with dynamic features

import React, { useState, useEffect } from 'react';
import {
  Container, Row, Col, Card, Table, Button, Modal, Form,
  Badge, InputGroup, Spinner, Alert, ListGroup
} from 'react-bootstrap';
import {
  MdAdd, MdEdit, MdDelete, MdRefresh, MdSearch, MdSave,
  MdCheck, MdClose, MdToggleOn, MdToggleOff, MdCreditCard,
  MdStar, MdAttachMoney
} from 'react-icons/md';
import Swal from 'sweetalert2';
import {
  getFeatureDefinitions,
  getPlanTemplates,
  createPlanTemplate,
  updatePlanTemplate,
  deletePlanTemplate
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

const PlanBuilder = () => {
  const [plans, setPlans] = useState([]);
  const [featureDefinitions, setFeatureDefinitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    pricing: { monthly: 0, yearly: 0, currency: 'USD' },
    features: [],
    trial: { enabled: false, days: 14 },
    isPublic: true,
    isActive: true,
    displayOrder: 0,
    badge: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [plansRes, featuresRes] = await Promise.all([
        getPlanTemplates(),
        getFeatureDefinitions()
      ]);
      setPlans(plansRes.data || []);
      setFeatureDefinitions(featuresRes.data || []);
    } catch (error) {
      Swal.fire('Error', 'Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingPlan(null);
    // Initialize features array with default values from definitions
    const defaultFeatures = featureDefinitions.map(fd => ({
      featureCode: fd.code,
      enabled: fd.type === 'boolean' ? fd.defaultValue : true,
      limitValue: fd.type === 'limit' ? fd.defaultValue : null
    }));

    setFormData({
      code: '',
      name: '',
      description: '',
      pricing: { monthly: 0, yearly: 0, currency: 'USD' },
      features: defaultFeatures,
      trial: { enabled: false, days: 14 },
      isPublic: true,
      isActive: true,
      displayOrder: plans.length,
      badge: ''
    });
    setShowModal(true);
  };

  const handleOpenEdit = (plan) => {
    setEditingPlan(plan);

    // Merge plan features with all available features
    const mergedFeatures = featureDefinitions.map(fd => {
      const existingFeature = plan.features?.find(f => f.featureCode === fd.code);
      return existingFeature || {
        featureCode: fd.code,
        enabled: false,
        limitValue: fd.type === 'limit' ? 0 : null
      };
    });

    setFormData({
      code: plan.code,
      name: plan.name,
      description: plan.description || '',
      pricing: plan.pricing || { monthly: 0, yearly: 0, currency: 'USD' },
      features: mergedFeatures,
      trial: plan.trial || { enabled: false, days: 14 },
      isPublic: plan.isPublic !== false,
      isActive: plan.isActive !== false,
      displayOrder: plan.displayOrder || 0,
      badge: plan.badge || ''
    });
    setShowModal(true);
  };

  const handleFeatureToggle = (featureCode) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map(f =>
        f.featureCode === featureCode
          ? { ...f, enabled: !f.enabled }
          : f
      )
    }));
  };

  const handleLimitChange = (featureCode, value) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map(f =>
        f.featureCode === featureCode
          ? { ...f, limitValue: value === '' ? 0 : (value === '-1' ? -1 : parseInt(value)) }
          : f
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Filter only enabled features for boolean or features with limit values
      const filteredFeatures = formData.features.filter(f => {
        const def = featureDefinitions.find(fd => fd.code === f.featureCode);
        if (def?.type === 'boolean') return f.enabled;
        if (def?.type === 'limit') return true; // Include all limits
        return false;
      });

      const data = {
        ...formData,
        features: filteredFeatures
      };

      if (editingPlan) {
        await updatePlanTemplate(editingPlan._id, data);
        Swal.fire('Updated!', 'Plan updated successfully', 'success');
      } else {
        await createPlanTemplate(data);
        Swal.fire('Created!', 'Plan created successfully', 'success');
      }

      setShowModal(false);
      fetchData();
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Operation failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (plan) => {
    const result = await Swal.fire({
      title: 'Delete Plan?',
      text: `This will delete "${plan.name}". This cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await deletePlanTemplate(plan._id);
        Swal.fire('Deleted!', 'Plan has been deleted.', 'success');
        fetchData();
      } catch (error) {
        Swal.fire('Error', error.response?.data?.message || 'Delete failed', 'error');
      }
    }
  };

  // Get feature definition by code
  const getFeatureDef = (code) => featureDefinitions.find(fd => fd.code === code);

  // Get feature value from form
  const getFeatureValue = (code) => formData.features.find(f => f.featureCode === code);

  // Group features by category
  const featuresByCategory = CATEGORIES.reduce((acc, cat) => {
    acc[cat.value] = featureDefinitions.filter(fd => fd.category === cat.value);
    return acc;
  }, {});

  // Filter plans
  const filteredPlans = plans.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Count enabled features in a plan
  const countEnabledFeatures = (plan) => {
    return plan.features?.filter(f => {
      const def = getFeatureDef(f.featureCode);
      if (def?.type === 'boolean') return f.enabled;
      return f.limitValue > 0 || f.limitValue === -1;
    }).length || 0;
  };

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <div className="page-header-section mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="d-flex align-items-center gap-2">
              <MdCreditCard className="text-primary" />
              Plan Builder
            </h1>
            <p className="text-muted mb-0">
              Create and manage subscription plans with dynamic features
            </p>
          </div>
          <div className="d-flex gap-2">
            <Button variant="outline-secondary" onClick={fetchData}>
              <MdRefresh className="me-1" /> Refresh
            </Button>
            <Button variant="primary" onClick={handleOpenCreate} disabled={featureDefinitions.length === 0}>
              <MdAdd className="me-1" /> Create Plan
            </Button>
          </div>
        </div>
      </div>

      {featureDefinitions.length === 0 && !loading && (
        <Alert variant="warning">
          No features defined yet. Please create features first before building plans.
        </Alert>
      )}

      {/* Search */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text><MdSearch /></InputGroup.Text>
                <Form.Control
                  placeholder="Search plans..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Plans Grid */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Loading plans...</p>
        </div>
      ) : (
        <Row>
          {filteredPlans.map(plan => (
            <Col key={plan._id} md={4} lg={3} className="mb-4">
              <Card className={`h-100 border-0 shadow-sm ${!plan.isActive ? 'opacity-50' : ''}`}>
                {plan.badge && (
                  <div className="position-absolute top-0 end-0 m-2">
                    <Badge bg="warning" text="dark">
                      <MdStar className="me-1" />{plan.badge}
                    </Badge>
                  </div>
                )}
                <Card.Header className="bg-gradient text-center py-3" style={{
                  background: plan.isActive ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#ccc',
                  color: 'white'
                }}>
                  <h4 className="mb-0">{plan.name}</h4>
                  <small className="opacity-75">({plan.code})</small>
                </Card.Header>
                <Card.Body>
                  {/* Pricing */}
                  <div className="text-center mb-3">
                    <div className="d-flex align-items-center justify-content-center">
                      <MdAttachMoney className="text-success fs-4" />
                      <span className="fs-2 fw-bold">{plan.pricing?.monthly || 0}</span>
                      <span className="text-muted">/mo</span>
                    </div>
                    {plan.pricing?.yearly > 0 && (
                      <small className="text-muted">
                        ${plan.pricing.yearly}/year (save {Math.round((1 - plan.pricing.yearly / (plan.pricing.monthly * 12)) * 100)}%)
                      </small>
                    )}
                  </div>

                  {/* Features summary */}
                  <div className="mb-3">
                    <small className="text-muted d-flex justify-content-between">
                      <span>Features included</span>
                      <strong>{countEnabledFeatures(plan)} / {featureDefinitions.length}</strong>
                    </small>
                    <div className="progress" style={{ height: '4px' }}>
                      <div
                        className="progress-bar bg-success"
                        style={{ width: `${(countEnabledFeatures(plan) / featureDefinitions.length) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Key features preview */}
                  <ListGroup variant="flush" className="small">
                    {plan.features?.slice(0, 5).map(f => {
                      const def = getFeatureDef(f.featureCode);
                      if (!def) return null;
                      return (
                        <ListGroup.Item key={f.featureCode} className="px-0 py-1 d-flex justify-content-between">
                          <span>{def.name}</span>
                          {def.type === 'boolean' ? (
                            f.enabled ? <MdCheck className="text-success" /> : <MdClose className="text-muted" />
                          ) : (
                            <Badge bg="secondary">{f.limitValue === -1 ? '∞' : f.limitValue}</Badge>
                          )}
                        </ListGroup.Item>
                      );
                    })}
                    {(plan.features?.length || 0) > 5 && (
                      <ListGroup.Item className="px-0 py-1 text-center text-muted">
                        +{plan.features.length - 5} more features
                      </ListGroup.Item>
                    )}
                  </ListGroup>

                  {/* Trial info */}
                  {plan.trial?.enabled && (
                    <Badge bg="info" className="mt-2">
                      {plan.trial.days} day trial
                    </Badge>
                  )}
                </Card.Body>
                <Card.Footer className="bg-transparent border-0 text-center pb-3">
                  <Button
                    size="sm"
                    variant="outline-primary"
                    className="me-2"
                    onClick={() => handleOpenEdit(plan)}
                  >
                    <MdEdit /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={() => handleDelete(plan)}
                  >
                    <MdDelete />
                  </Button>
                </Card.Footer>
              </Card>
            </Col>
          ))}

          {filteredPlans.length === 0 && !loading && (
            <Col>
              <Alert variant="info">
                No plans found. Create your first plan to get started.
              </Alert>
            </Col>
          )}
        </Row>
      )}

      {/* Create/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingPlan ? `Edit Plan: ${editingPlan.name}` : 'Create New Plan'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            <Row>
              {/* Basic Info */}
              <Col md={4}>
                <h5 className="mb-3">Basic Information</h5>
                <Form.Group className="mb-3">
                  <Form.Label>Plan Code *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                    placeholder="e.g., pro"
                    required
                    disabled={!!editingPlan}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Display Name *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Pro Plan"
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Badge (optional)</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="e.g., Most Popular"
                  />
                </Form.Group>

                <h5 className="mt-4 mb-3">Pricing</h5>
                <Row>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>Monthly ($)</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        value={formData.pricing.monthly}
                        onChange={(e) => setFormData({
                          ...formData,
                          pricing: { ...formData.pricing, monthly: parseFloat(e.target.value) || 0 }
                        })}
                      />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>Yearly ($)</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        value={formData.pricing.yearly}
                        onChange={(e) => setFormData({
                          ...formData,
                          pricing: { ...formData.pricing, yearly: parseFloat(e.target.value) || 0 }
                        })}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <h5 className="mt-4 mb-3">Settings</h5>
                <Form.Check
                  type="switch"
                  label="Trial enabled"
                  checked={formData.trial.enabled}
                  onChange={(e) => setFormData({
                    ...formData,
                    trial: { ...formData.trial, enabled: e.target.checked }
                  })}
                  className="mb-2"
                />
                {formData.trial.enabled && (
                  <Form.Group className="mb-3">
                    <Form.Label>Trial Days</Form.Label>
                    <Form.Control
                      type="number"
                      value={formData.trial.days}
                      onChange={(e) => setFormData({
                        ...formData,
                        trial: { ...formData.trial, days: parseInt(e.target.value) || 14 }
                      })}
                    />
                  </Form.Group>
                )}
                <Form.Check
                  type="switch"
                  label="Public (show on pricing page)"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                  className="mb-2"
                />
                <Form.Check
                  type="switch"
                  label="Active"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
              </Col>

              {/* Features */}
              <Col md={8}>
                <h5 className="mb-3">Features</h5>
                <Alert variant="info" className="small">
                  Toggle features ON/OFF for boolean types. Set limit values for numeric features.
                  Use -1 for unlimited.
                </Alert>

                {CATEGORIES.map(category => {
                  const categoryFeatures = featuresByCategory[category.value] || [];
                  if (categoryFeatures.length === 0) return null;

                  return (
                    <Card key={category.value} className="mb-3">
                      <Card.Header className="py-2">
                        <Badge bg={category.color} className="me-2">{category.label}</Badge>
                        <small className="text-muted">
                          {categoryFeatures.filter(fd => {
                            const fv = getFeatureValue(fd.code);
                            if (fd.type === 'boolean') return fv?.enabled;
                            return fv?.limitValue > 0 || fv?.limitValue === -1;
                          }).length} / {categoryFeatures.length} enabled
                        </small>
                      </Card.Header>
                      <Card.Body className="py-2">
                        {categoryFeatures.map(fd => {
                          const fv = getFeatureValue(fd.code);
                          const isEnabled = fd.type === 'boolean' ? fv?.enabled : (fv?.limitValue > 0 || fv?.limitValue === -1);

                          return (
                            <div key={fd.code} className="d-flex align-items-center justify-content-between py-2 border-bottom">
                              <div>
                                <strong>{fd.name}</strong>
                                {fd.description && (
                                  <div className="small text-muted">{fd.description}</div>
                                )}
                              </div>
                              <div className="d-flex align-items-center gap-2">
                                {fd.type === 'boolean' ? (
                                  <Button
                                    size="sm"
                                    variant={fv?.enabled ? "success" : "outline-secondary"}
                                    onClick={() => handleFeatureToggle(fd.code)}
                                  >
                                    {fv?.enabled ? <MdToggleOn /> : <MdToggleOff />}
                                    {fv?.enabled ? ' ON' : ' OFF'}
                                  </Button>
                                ) : (
                                  <InputGroup size="sm" style={{ width: '150px' }}>
                                    <Form.Control
                                      type="number"
                                      value={fv?.limitValue ?? 0}
                                      onChange={(e) => handleLimitChange(fd.code, e.target.value)}
                                      placeholder="0"
                                    />
                                    {fd.unit && <InputGroup.Text>{fd.unit}</InputGroup.Text>}
                                  </InputGroup>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </Card.Body>
                    </Card>
                  );
                })}
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
                  <MdSave className="me-1" />
                  {editingPlan ? 'Update Plan' : 'Create Plan'}
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default PlanBuilder;