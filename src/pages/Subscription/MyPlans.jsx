import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Button, Badge, Modal, ProgressBar } from 'react-bootstrap';
import { MdReceipt, MdCheck, MdStar, MdWorkspacePremium, MdRocketLaunch, MdBusiness, MdAutorenew, MdHistory, MdCancel, MdTrendingUp, MdDateRange, MdPeople } from 'react-icons/md';
import axios from '../../api/axiosInstance';
import Swal from 'sweetalert2';

const MyPlans = ({ darkMode }) => {
  // Current active subscription (dummy data)
  const [currentPlan, setCurrentPlan] = useState({
    id: 1,
    planName: 'Beginner Plan',
    price: 9.99,
    duration: 1,
    surveyLimit: 10,
    surveysUsed: 7,
    status: 'active',
    startDate: '2024-01-01',
    endDate: '2024-02-01',
    features: ['10 Surveys/month', 'Basic Analytics', 'Email Support']
  });

  // Available plans for upgrade (dummy data)
  const [availablePlans, setAvailablePlans] = useState([
    {
      id: 1,
      planName: 'Beginner Plan',
      price: 9.99,
      duration: 1,
      surveyLimit: 10,
      description: 'Perfect for individuals and small teams getting started',
      features: ['10 Surveys/month', 'Basic Analytics', 'Email Support'],
      icon: <MdStar />,
      recommended: false
    },
    {
      id: 2,
      planName: 'Pro Plan',
      price: 29.99,
      duration: 1,
      surveyLimit: 50,
      description: 'Ideal for growing businesses with advanced needs',
      features: ['50 Surveys/month', 'Advanced Analytics', 'Priority Support', 'Custom Branding'],
      icon: <MdRocketLaunch />,
      recommended: true
    },
    {
      id: 3,
      planName: 'Enterprise',
      price: 99.99,
      duration: 1,
      surveyLimit: -1,
      description: 'Complete solution for large organizations',
      features: ['Unlimited Surveys', 'White-label Solution', 'Dedicated Support', 'API Access', 'Custom Integrations'],
      icon: <MdBusiness />,
      recommended: false
    }
  ]);

  // State for upgrade modal
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Handle upgrade/buy click
  const handlePlanSelect = (plan) => {
    if (plan.id === currentPlan.id) {
      Swal.fire({
        icon: 'info',
        title: 'Already Subscribed',
        text: 'You are already on this plan!',
        confirmButtonColor: '#0d6efd'
      });
      return;
    }
    setSelectedPlan(plan);
    setShowUpgradeModal(true);
  };

  // Confirm upgrade
  const confirmUpgrade = () => {
    setCurrentPlan({
      ...currentPlan,
      ...selectedPlan,
      surveysUsed: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(new Date().setMonth(new Date().getMonth() + selectedPlan.duration)).toISOString().split('T')[0]
    });
    
    setShowUpgradeModal(false);
    setSelectedPlan(null);

    Swal.fire({
      icon: 'success',
      title: 'Plan Updated!',
      text: 'Your subscription plan has been successfully updated.',
      confirmButtonColor: '#0d6efd',
      timer: 2000,
      showConfirmButton: false
    });
  };

  // Calculate days remaining
  const getDaysRemaining = () => {
    const end = new Date(currentPlan.endDate);
    const today = new Date();
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Calculate usage percentage
  const getUsagePercentage = () => {
    if (currentPlan.surveyLimit === -1) return 0;
    return (currentPlan.surveysUsed / currentPlan.surveyLimit) * 100;
  };

  return (
    <div className="my-plans-page">
      <Container fluid>
        {/* Header */}
        <div className="page-header">
          <div className="header-left">
            <div className="page-icon-wrapper">
              <MdReceipt className="page-icon" />
            </div>
            <div>
              <h1 className="page-title">My Subscription</h1>
              <p className="page-subtitle">Manage your subscription plan and billing</p>
            </div>
          </div>
          <div className="d-flex align-items-center justify-content-end mb-3">
            <Badge className="status-badge-large">
              <MdCheck className="me-1" />
              Active Subscription
            </Badge>
          </div>
        </div>

        {/* Current Plan Hero Section */}
        <div className="current-plan-hero">
          <div className="plan-hero-content">
            <Row className="align-items-center">
              <Col lg={4}>
                <div className="plan-info-section">
                  <div className="plan-icon-large text">
                    <MdStar />
                  </div>
                  <h2 className="plan-title text">{currentPlan.planName}</h2>
                  <div className="plan-price-large">
                    <span className="currency">$</span>
                    <span className="amount">{currentPlan.price}</span>
                    <span className="period">/month</span>
                  </div>
                  <div className="plan-features-list text">
                    {currentPlan.features.map((feature, index) => (
                      <div key={index} className="feature-item">
                        <MdCheck className="feature-check" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Col>

              <Col lg={8}>
                <Row className="g-4">
                  {/* Usage Card */}
                  <Col md={6}>
                    <div className="info-card">
                      <div className="info-card-header">
                        <h5>Survey Usage</h5>
                        <MdTrendingUp className="info-icon" />
                      </div>
                      <div className="usage-stats">
                        <div className="usage-numbers">
                          <span className="used">{currentPlan.surveysUsed}</span>
                          <span className="separator">/</span>
                          <span className="total">
                            {currentPlan.surveyLimit === -1 ? '∞' : currentPlan.surveyLimit}
                          </span>
                        </div>
                        {currentPlan.surveyLimit !== -1 && (
                          <div className="usage-bar">
                            <ProgressBar 
                              now={getUsagePercentage()} 
                              variant={getUsagePercentage() > 80 ? 'danger' : 'primary'}
                            />
                            <span className="usage-percentage">{getUsagePercentage().toFixed(0)}% Used</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Col>

                  {/* Billing Period Card */}
                  <Col md={6}>
                    <div className="info-card">
                      <div className="info-card-header">
                        <h5>Billing Period</h5>
                        <MdDateRange className="info-icon" />
                      </div>
                      <div className="billing-info">
                        <div className="billing-row">
                          <span className="label">Start Date</span>
                          <span className="value">{new Date(currentPlan.startDate).toLocaleDateString()}</span>
                        </div>
                        <div className="billing-row">
                          <span className="label">End Date</span>
                          <span className="value">{new Date(currentPlan.endDate).toLocaleDateString()}</span>
                        </div>
                        <div className="billing-row highlight">
                          <span className="label">Days Remaining</span>
                          <Badge bg={getDaysRemaining() < 7 ? 'danger' : 'info'} className="days-badge">
                            {getDaysRemaining()} days
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Col>
            </Row>
          </div>
        </div>

        {/* Available Plans Section */}
        <div className="available-plans-section">
          <div className="section-header-modern">
            <div>
              <h2>Available Plans</h2>
              <p>Choose a plan that fits your needs and upgrade anytime</p>
            </div>
          </div>

          <Row className="g-4">
            {availablePlans.map(plan => (
              <Col key={plan.id} lg={4} md={6}>
                <div className={`pricing-card ${plan.recommended ? 'recommended' : ''} ${plan.id === currentPlan.id ? 'current' : ''}`}>
                  {plan.recommended && (
                    <div className="recommended-badge">
                      <MdWorkspacePremium />
                      <span>Recommended</span>
                    </div>
                  )}
                  {plan.id === currentPlan.id && (
                    <div className="current-badge">
                      <MdCheck />
                      <span>Current Plan</span>
                    </div>
                  )}
                  
                  <div className="pricing-header">
                    <div className="plan-icon-wrapper">
                      {plan.icon}
                    </div>
                    <h3 className="plan-name">{plan.planName}</h3>
                    <p className="plan-desc">{plan.description}</p>
                  </div>

                  <div className="pricing-amount">
                    <span className="currency">$</span>
                    <span className="price">{plan.price}</span>
                    <span className="period">/month</span>
                  </div>

                  <div className="features-list">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="feature">
                        <MdCheck className="check-icon" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pricing-footer">
                    {plan.id === currentPlan.id ? (
                      <Button variant="outline-secondary" disabled className="w-100">
                        Current Plan
                      </Button>
                    ) : (
                      <Button 
                        variant={plan.recommended ? 'primary' : 'outline-primary'}
                        className="w-100"
                        onClick={() => handlePlanSelect(plan)}
                      >
                        {plan.id > currentPlan.id ? 'Upgrade Plan' : 'Switch Plan'}
                      </Button>
                    )}
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </div>

        {/* Upgrade Modal */}
        <Modal 
          show={showUpgradeModal} 
          onHide={() => setShowUpgradeModal(false)}
          centered
          className="modern-modal"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <div className="modal-title-wrapper">
                <div className="modal-icon">
                  <MdRocketLaunch />
                </div>
                <span>Confirm Plan Change</span>
              </div>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedPlan && (
              <div className="plan-comparison">
                <p className="mb-4">You are about to change your subscription:</p>
                <div className="comparison-card">
                  <div className="comparison-row from">
                    <span className="label">Current Plan</span>
                    <div className="plan-details">
                      <span className="name">{currentPlan.planName}</span>
                      <span className="price">${currentPlan.price}/mo</span>
                    </div>
                  </div>
                  <div className="comparison-arrow">
                    <MdTrendingUp />
                  </div>
                  <div className="comparison-row to">
                    <span className="label">New Plan</span>
                    <div className="plan-details">
                      <span className="name">{selectedPlan.planName}</span>
                      <span className="price">${selectedPlan.price}/mo</span>
                    </div>
                  </div>
                </div>
                <div className="price-difference mt-3">
                  <div className="difference-card">
                    <span>Price Difference:</span>
                    <span className="amount">
                      ${Math.abs(selectedPlan.price - currentPlan.price).toFixed(2)}/month
                    </span>
                  </div>
                </div>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setShowUpgradeModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={confirmUpgrade}>
              <MdCheck className="me-2" />
              Confirm Change
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default MyPlans;