// src/pages/admin/plans/PlanBuilder.jsx
import React, { useState, useEffect } from 'react';
import {
  Container, Row, Col, Form, Button, Table, Badge, Modal,
  Card, ListGroup, InputGroup, Alert
} from 'react-bootstrap';
import {
  MdAdd, MdEdit, MdDelete, MdSave, MdRefresh, MdSearch,
  MdCheckCircle, MdBlock, MdToggleOn, MdToggleOff
} from 'react-icons/md';
import Swal from 'sweetalert2';
import axiosInstance from '../../api/axiosInstance';

const ALL_FEATURES = [
  { key: "smart_segments", label: "Smart Segments", desc: "Dynamic audience segmentation", tier: "pro" },
  { key: "action_engine", label: "Action Engine", desc: "Auto-create tasks from feedback", tier: "enterprise" },
  { key: "delivery_intelligence", label: "Delivery Intelligence", desc: "Open/click tracking + auto-resend", tier: "pro" },
  { key: "global_ai_brain", label: "Global AI Brain", desc: "Predictive insights & alerts", tier: "enterprise" },
  { key: "advanced_distribution", label: "WhatsApp + SMS", desc: "Multi-channel distribution", tier: "pro" },
  { key: "custom_branding", label: "Custom Branding", desc: "Remove RatePro logo", tier: "pro" },
  { key: "whitelabel", label: "White Label", desc: "Your brand only", tier: "enterprise" },
  { key: "priority_support", label: "Priority Support", desc: "24/7 dedicated support", tier: "enterprise" },
  { key: "api_access", label: "Full API Access", desc: "Programmatic control", tier: "enterprise" },
];

const PlanBuilder = () => {
  const [plans, setPlans] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true,
    features: {},
    limits: {
      responsesPerMonth: 1000,
      teamMembers: 5,
      surveys: 'unlimited'
    }
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await axiosInstance.get('/plans');
      setPlans(res.data.plans || []);
    } catch (err) {
      Swal.fire('Error', 'Failed to load plans', 'error');
    }
  };

  const handleFeatureToggle = (key) => {
    setFormData(prev => ({
      ...prev,
      features: { ...prev.features, [key]: !prev.features[key] }
    }));
  };

  const handleLimitChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      limits: { ...prev.limits, [field]: value === '' ? 'unlimited' : parseInt(value) }
    }));
  };

  const handleCreatePlan = async () => {
    try {
      await axiosInstance.post('/plans', formData);
      Swal.fire('Success!', 'Plan created successfully', 'success');
      setShowCreateModal(false);
      resetForm();
      fetchPlans();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Failed to create plan', 'error');
    }
  };

  const handleUpdatePlan = async () => {
    try {
      await axiosInstance.put(`/plans/${editingPlan._id}`, formData);
      Swal.fire('Updated!', 'Plan updated successfully', 'success');
      setShowEditModal(false);
      resetForm();
      fetchPlans();
    } catch (err) {
      Swal.fire('Error', 'Failed to update plan', 'error');
    }
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description || '',
      isActive: plan.isActive,
      features: plan.features || {},
      limits: plan.limits || { responsesPerMonth: 1000, teamMembers: 5, surveys: 'unlimited' }
    });
    setShowEditModal(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Plan?',
      text: "This cannot be undone!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      await axiosInstance.delete(`/plans/${id}`);
      Swal.fire('Deleted!', 'Plan has been deleted.', 'success');
      fetchPlans();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      isActive: true,
      features: {},
      limits: { responsesPerMonth: 1000, teamMembers: 5, surveys: 'unlimited' }
    });
  };

  const filteredPlans = plans.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>Plan Builder</h1>
          <p className="text-muted">Create modern feature-based plans</p>
        </div>
        <div>
          <Button onClick={fetchPlans} variant="outline-secondary" className="me-2">
            <MdRefresh /> Refresh
          </Button>
          <Button onClick={() => { resetForm(); setShowCreateModal(true); }}>
            <MdAdd /> Create Plan
          </Button>
        </div>
      </div>

      <Row className="mb-4">
        <Col md={4}>
          <InputGroup>
            <InputGroup.Text><MdSearch /></InputGroup.Text>
            <Form.Control
              placeholder="Search plans..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
      </Row>

      <Row>
        {filteredPlans.map(plan => (
          <Col md={4} key={plan._id} className="mb-4">
            <Card className={`h-100 border ${plan.isActive ? '' : 'border-danger'}`}>
              <Card.Header className="d-flex justify-content-between">
                <h5>{plan.name}</h5>
                <Badge bg={plan.isActive ? 'success' : 'danger'}>
                  {plan.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </Card.Header>
              <Card.Body>
                <ListGroup variant="flush">
                  {ALL_FEATURES.map(f => (
                    <ListGroup.Item key={f.key} className="d-flex justify-content-between">
                      <span>{f.label}</span>
                      {plan.features[f.key] ? <MdCheckCircle className="text-success" /> : <MdBlock className="text-muted" />}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
                <hr />
                <div className="small">
                  <strong>Limits:</strong><br />
                  Responses: {plan.limits.responsesPerMonth === 'unlimited' ? '∞' : plan.limits.responsesPerMonth}/month<br />
                  Team Members: {plan.limits.teamMembers}
                </div>
              </Card.Body>
              <Card.Footer className="text-center">
                <Button size="sm" variant="outline-primary" onClick={() => handleEdit(plan)} className="me-2">
                  <MdEdit /> Edit
                </Button>
                <Button size="sm" variant="outline-danger" onClick={() => handleDelete(plan._id)}>
                  <MdDelete />
                </Button>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Create / Edit Modal */}
      <Modal show={showCreateModal || showEditModal} onHide={() => { setShowCreateModal(false); setShowEditModal(false); }} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>{showEditModal ? 'Edit' : 'Create'} Plan</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Plan Name</Form.Label>
                <Form.Control
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Pro, Enterprise, etc."
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </Form.Group>

              <Form.Check
                type="switch"
                label="Plan Active"
                checked={formData.isActive}
                onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
              />
            </Col>

            <Col md={4}>
              <Card className="h-100">
                <Card.Header>Core Features</Card.Header>
                <Card.Body>
                  {ALL_FEATURES.filter(f => ['pro', 'enterprise'].includes(f.tier)).map(f => (
                    <div key={f.key} className="d-flex justify-content-between align-items-center mb-2">
                      <div>
                        <strong>{f.label}</strong><br />
                        <small className="text-muted">{f.desc}</small>
                      </div>
                      <Button
                        size="sm"
                        variant={formData.features[f.key] ? "success" : "outline-secondary"}
                        onClick={() => handleFeatureToggle(f.key)}
                      >
                        {formData.features[f.key] ? <MdToggleOn /> : <MdToggleOff />}
                      </Button>
                    </div>
                  ))}
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card>
                <Card.Header>Usage Limits</Card.Header>
                <Card.Body>
                  <Form.Group className="mb-3">
                    <Form.Label>Responses / Month</Form.Label>
                    <Form.Control
                      type="number"
                      value={formData.limits.responsesPerMonth === 'unlimited' ? '' : formData.limits.responsesPerMonth}
                      onChange={e => handleLimitChange('responsesPerMonth', e.target.value)}
                      placeholder="Leave empty for unlimited"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Team Members</Form.Label>
                    <Form.Control
                      type="number"
                      value={formData.limits.teamMembers}
                      onChange={e => handleLimitChange('teamMembers', e.target.value)}
                    />
                  </Form.Group>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => { setShowCreateModal(false); setShowEditModal(false); }}>
            Cancel
          </Button>
          <Button variant="primary" onClick={showEditModal ? handleUpdatePlan : handleCreatePlan}>
            <MdSave /> {showEditModal ? 'Update' : 'Create'} Plan
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PlanBuilder;