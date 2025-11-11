import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { Container, Row, Col, Card, Form, Button, Table, Badge, Modal, InputGroup } from 'react-bootstrap';
import { MdCreditCard, MdAdd, MdEdit, MdDelete, MdCheck, MdClose, MdSave, MdRefresh, MdSearch, MdFilterList, MdTrendingUp, MdAttachMoney } from 'react-icons/md';
import Swal from 'sweetalert2';
import axios from '../../api/axiosInstance';

const SubscriptionPlans = () => {
  // State for form inputs
  const [formData, setFormData] = useState({
    planName: '',
    price: '',
    duration: '1',
    surveyLimit: '',
    description: '',
    status: 'active'
  });

  // State for existing plans
  const [plans, setPlans] = useState([
    {
      id: 1,
      planName: 'Beginner Plan',
      price: 9.99,
      duration: 1,
      surveyLimit: 10,
      description: 'Perfect for individuals and small teams getting started',
      status: 'active',
      features: ['10 Surveys/month', 'Basic Analytics', 'Email Support'],
      subscribers: 145,
      revenue: 1448.55
    },
    {
      id: 2,
      planName: 'Pro Plan',
      price: 29.99,
      duration: 1,
      surveyLimit: 50,
      description: 'Ideal for growing businesses with advanced needs',
      status: 'active',
      features: ['50 Surveys/month', 'Advanced Analytics', 'Priority Support', 'Custom Branding'],
      subscribers: 89,
      revenue: 2669.11
    },
    {
      id: 3,
      planName: 'Enterprise',
      price: 99.99,
      duration: 1,
      surveyLimit: -1,
      description: 'Complete solution for large organizations',
      status: 'active',
      features: ['Unlimited Surveys', 'White-label Solution', 'Dedicated Support', 'API Access', 'Custom Integrations'],
      subscribers: 23,
      revenue: 2299.77
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // State for modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingPlanId, setDeletingPlanId] = useState(null);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle create plan
  const handleCreatePlan = (e) => {
    e.preventDefault();
    
    const newPlan = {
      id: plans.length + 1,
      ...formData,
      price: parseFloat(formData.price),
      duration: parseInt(formData.duration),
      surveyLimit: parseInt(formData.surveyLimit),
      features: [],
      subscribers: 0,
      revenue: 0
    };

    setPlans([...plans, newPlan]);
    
    setFormData({
      planName: '',
      price: '',
      duration: '1',
      surveyLimit: '',
      description: '',
      status: 'active'
    });

    setShowCreateModal(false);
    
    Swal.fire({
      icon: 'success',
      title: 'Success!',
      text: 'Plan created successfully!',
      confirmButtonColor: '#0d6efd',
      timer: 2000,
      showConfirmButton: false
    });
  };

  // Handle edit plan
  const handleEditPlan = (plan) => {
    setEditingPlan({ ...plan });
    setShowEditModal(true);
  };

  // Handle update plan
  const handleUpdatePlan = () => {
    setPlans(plans.map(p => p.id === editingPlan.id ? editingPlan : p));
    setShowEditModal(false);
    setEditingPlan(null);
    
    Swal.fire({
      icon: 'success',
      title: 'Updated!',
      text: 'Plan updated successfully!',
      confirmButtonColor: '#0d6efd',
      timer: 2000,
      showConfirmButton: false
    });
  };

  // Handle delete plan
  const handleDeletePlan = (planId) => {
    setDeletingPlanId(planId);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    setPlans(plans.filter(p => p.id !== deletingPlanId));
    setShowDeleteModal(false);
    setDeletingPlanId(null);
    
    Swal.fire({
      icon: 'success',
      title: 'Deleted!',
      text: 'Plan deleted successfully!',
      confirmButtonColor: '#0d6efd',
      timer: 2000,
      showConfirmButton: false
    });
  };

  // Handle edit modal input changes
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingPlan(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Calculate totals
  const totalRevenue = plans.reduce((sum, plan) => sum + (plan.revenue || 0), 0);
  const totalSubscribers = plans.reduce((sum, plan) => sum + (plan.subscribers || 0), 0);

  // Filter plans
  const filteredPlans = plans.filter(plan => {
    const matchesSearch = plan.planName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || plan.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="subscription-plans-container">
      <Container fluid className="p-0">
        {/* Header Section */}
        <div className="page-header-section">
          <div className="header-content">
            <div className="header-main">
              <div className="page-title-section">
                <div className="page-icon">
                  <MdCreditCard />
                </div>
                <div className="page-info">
                  <h1 className="page-title">Subscription Plans</h1>
                  <p className="page-subtitle">Create and manage subscription plans for your platform</p>
                </div>
              </div>
              <div className="header-actions d-flex align-items-center gap-2">
                <Button variant="outline-secondary" size="sm">
                  <MdRefresh className="me-1" />
                  Refresh
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowCreateModal(true)}
                >
                  <MdAdd className="me-1" />
                  Create New Plan
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Section */}
        <div className="stats-section">
          <div className="stats-grid">
            <div className="stat-card stat-card-primary">
              <div className="stat-icon-wrapper">
                <div className="stat-icon icon">
                  <MdCreditCard />
                </div>
              </div>
              <div className="stat-content">
                <div className="stat-label">Total Plans</div>
                <div className="stat-number">{plans.length}</div>
                <div className="stat-change positive">
                  <MdTrendingUp /> <span>Active & Ready</span>
                </div>
              </div>
            </div>

            <div className="stat-card stat-card-success">
              <div className="stat-icon-wrapper">
                <div className="stat-icon icon">
                  <MdCheck />
                </div>
              </div>
              <div className="stat-content">
                <div className="stat-label">Active Plans</div>
                <div className="stat-number">{plans.filter(p => p.status === 'active').length}</div>
                <div className="stat-change positive">
                  <MdTrendingUp /> <span>Currently Running</span>
                </div>
              </div>
            </div>

            <div className="stat-card stat-card-info">
              <div className="stat-icon-wrapper">
                <div className="stat-icon icon">
                  <MdAttachMoney />
                </div>
              </div>
              <div className="stat-content">
                <div className="stat-label">Total Subscribers</div>
                <div className="stat-number">{totalSubscribers}</div>
                <div className="stat-change positive">
                  <MdTrendingUp /> <span>+12% this month</span>
                </div>
              </div>
            </div>

            <div className="stat-card stat-card-warning">
              <div className="stat-icon-wrapper">
                <div className="stat-icon icon">
                  <MdAttachMoney />
                </div>
              </div>
              <div className="stat-content">
                <div className="stat-label">Monthly Revenue</div>
                <div className="stat-number">${totalRevenue.toFixed(2)}</div>
                <div className="stat-change positive">
                  <MdTrendingUp /> <span>+8% vs last month</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="content-grid">
          <div className="section-card mb-3">
            <div className="section-body p-3">
              <Row className="align-items-center">
                <Col md={6}>
                  <InputGroup>
                    <InputGroup.Text>
                      <MdSearch />
                    </InputGroup.Text>
                    <Form.Control
                      placeholder="Search plans..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                </Col>
                <Col md={6}>
                  <InputGroup>
                    <InputGroup.Text>
                      <MdFilterList />
                    </InputGroup.Text>
                    <Form.Select 
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="all">All Plans</option>
                      <option value="active">Active Only</option>
                      <option value="inactive">Inactive Only</option>
                    </Form.Select>
                  </InputGroup>
                </Col>
              </Row>
            </div>
          </div>

          {/* Plans Table with Enhanced Design */}
          <div className="section-card">
            <div className="section-header">
              <div className="section-title">
                <h3>Subscription Plans</h3>
                <span className="text-muted ms-2">({filteredPlans.length} plans)</span>
              </div>
            </div>
            <div className="section-body p-0">
              <div className="table-responsive">
                <Table hover className="modern-table mb-0">
                  <thead>
                    <tr>
                      <th>Plan Details</th>
                      <th>Pricing</th>
                      <th>Limits</th>
                      <th>Subscribers</th>
                      <th>Revenue</th>
                      <th>Status</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPlans.map(plan => (
                      <tr key={plan.id} className="plan-row">
                        <td>
                          <div className="plan-info">
                            <div className="plan-name">{plan.planName}</div>
                            <div className="plan-description text-muted small">
                              {plan.description}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="price-info">
                            <span className="price-amount">${plan.price.toFixed(2)}</span>
                            <span className="price-period text-muted">/month</span>
                          </div>
                        </td>
                        <td>
                          {plan.surveyLimit === -1 ? (
                            <Badge bg="success" className="custom-badge">
                              <MdCheck className="me-1" />
                              Unlimited
                            </Badge>
                          ) : (
                            <span className="survey-limit">{plan.surveyLimit} surveys</span>
                          )}
                        </td>
                        <td>
                          <div className="subscriber-count">
                            {plan.subscribers || 0} users
                          </div>
                        </td>
                        <td>
                          <div className="revenue-amount">
                            ${(plan.revenue || 0).toFixed(2)}
                          </div>
                        </td>
                        <td>
                          <Badge 
                            bg={plan.status === 'active' ? 'success' : 'secondary'}
                            className="status-badge"
                          >
                            {plan.status === 'active' ? <MdCheck /> : <MdClose />}
                            {' '}{plan.status}
                          </Badge>
                        </td>
                        <td>
                          <div className="d-flex gap-2 justify-content-center">
                            <Button 
                              size="sm" 
                              variant="outline-primary"
                              className="action-btn"
                              onClick={() => handleEditPlan(plan)}
                            >
                              <MdEdit />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline-danger"
                              className="action-btn"
                              onClick={() => handleDeletePlan(plan.id)}
                            >
                              <MdDelete />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </div>
          </div>
        </div>

        {/* Create Plan Modal */}
        <Modal 
          show={showCreateModal} 
          onHide={() => setShowCreateModal(false)} 
          size="lg"
          centered
          className="modern-modal"
        >
          <Modal.Header closeButton className="border-0">
            <Modal.Title className="d-flex align-items-center">
              <div className="modal-icon me-2">
                <MdAdd />
              </div>
              Create New Plan
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="pt-2">
            <Form onSubmit={handleCreatePlan} id="createPlanForm">
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label-modern">Plan Name *</Form.Label>
                    <Form.Control
                      type="text"
                      name="planName"
                      value={formData.planName}
                      onChange={handleInputChange}
                      placeholder="e.g., Premium Plan"
                      className="form-control-modern"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label-modern">Price ($) *</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>$</InputGroup.Text>
                      <Form.Control
                        type="number"
                        step="0.01"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="29.99"
                        className="form-control-modern"
                        required
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label-modern">Duration (months) *</Form.Label>
                    <Form.Control
                      type="number"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      placeholder="1"
                      className="form-control-modern"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label-modern">Survey Limit *</Form.Label>
                    <Form.Control
                      type="number"
                      name="surveyLimit"
                      value={formData.surveyLimit}
                      onChange={handleInputChange}
                      placeholder="-1 for unlimited"
                      className="form-control-modern"
                      required
                    />
                    <Form.Text className="text-muted small">
                      Enter -1 for unlimited surveys
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label-modern">Status</Form.Label>
                    <Form.Select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="form-control-modern"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label-modern">Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe your plan features and benefits..."
                      className="form-control-modern"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <Button variant="outline-secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" form="createPlanForm" className="btn-modern">
              <MdAdd className="me-2" />
              Create Plan
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Edit Modal */}
        <Modal 
          show={showEditModal} 
          onHide={() => setShowEditModal(false)} 
          size="lg"
          centered
          className="modern-modal"
        >
          <Modal.Header closeButton className="border-0">
            <Modal.Title className="d-flex align-items-center">
              <div className="modal-icon me-2">
                <MdEdit />
              </div>
              Edit Plan
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="pt-2">
            {editingPlan && (
              <Form>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="form-label-modern">Plan Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="planName"
                        value={editingPlan.planName}
                        onChange={handleEditInputChange}
                        className="form-control-modern"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="form-label-modern">Price ($)</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>$</InputGroup.Text>
                        <Form.Control
                          type="number"
                          step="0.01"
                          name="price"
                          value={editingPlan.price}
                          onChange={handleEditInputChange}
                          className="form-control-modern"
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="form-label-modern">Duration (months)</Form.Label>
                      <Form.Control
                        type="number"
                        name="duration"
                        value={editingPlan.duration}
                        onChange={handleEditInputChange}
                        className="form-control-modern"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="form-label-modern">Survey Limit</Form.Label>
                      <Form.Control
                        type="number"
                        name="surveyLimit"
                        value={editingPlan.surveyLimit}
                        onChange={handleEditInputChange}
                        className="form-control-modern"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label className="form-label-modern">Status</Form.Label>
                      <Form.Select
                        name="status"
                        value={editingPlan.status}
                        onChange={handleEditInputChange}
                        className="form-control-modern"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label className="form-label-modern">Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="description"
                        value={editingPlan.description}
                        onChange={handleEditInputChange}
                        className="form-control-modern"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Form>
            )}
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <Button variant="outline-secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleUpdatePlan} className="btn-modern">
              <MdSave className="me-2" />
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Delete Modal */}
        <Modal 
          show={showDeleteModal} 
          onHide={() => setShowDeleteModal(false)}
          centered
          className="modern-modal delete-modal"
        >
          <Modal.Header closeButton className="border-0">
            <Modal.Title className="d-flex align-items-center text-danger">
              <div className="modal-icon me-2">
                <MdDelete />
              </div>
              Confirm Delete
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="text-center py-3">
              <div className="delete-icon mb-3 text">
                <MdDelete />
              </div>
              <h5 className="mb-3 text ">Are you sure?</h5>
              <p className="text-muted mb-0">
                This will permanently delete this subscription plan. This action cannot be undone.
              </p>
            </div>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <Button variant="outline-secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete} className="btn-modern">
              <MdDelete className="me-2" />
              Delete Plan
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default SubscriptionPlans;