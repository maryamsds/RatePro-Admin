// RatePro-Admin/src/pages/Subscription/MyPlans.jsx
"use client";
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Button, Badge, Modal, ProgressBar, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import { MdReceipt, MdCheck, MdStar, MdWorkspacePremium, MdRocketLaunch, MdBusiness, MdAutorenew, MdHistory, MdCancel, MdTrendingUp, MdDateRange, MdPeople } from 'react-icons/md';
import axios, { axiosInstance } from '../../api/axiosInstance';
import Swal from 'sweetalert2';

const MyPlans = ({ darkMode }) => {
  // State for current subscription
  const [currentPlan, setCurrentPlan] = useState(null);
  // State for available plans
  const [availablePlans, setAvailablePlans] = useState([]);
  // Loading states
  const [loadingCurrent, setLoadingCurrent] = useState(true);
  const [loadingAvailable, setLoadingAvailable] = useState(true);
  // Error states
  const [error, setError] = useState(null);
  // State for upgrade modal
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  // Billing cycle toggle
  const [billingCycle, setBillingCycle] = useState('monthly');

  // Fetch current subscription
  useEffect(() => {
    const fetchCurrentSubscription = async () => {
      try {
        setLoadingCurrent(true);
        console.log('Fetching current subscription...');
        const response = await axiosInstance.get('/subscriptions/user');
        if (response.data.success) {
          const planData = response.data.data;
          // Update currentPlan correctly
          setCurrentPlan({
            id: planData._id || plan.id,
            planName: planData.name || plan.planName || plan.planName,
            price: planData.price || plan.price,
            billingCycle: planData.billingCycle || plan.billingCycle,
            duration: planData.billingCycle === 'monthly' ? 1 : 12,
            surveyLimit: planData.credits === 0 ? -1 : planData.credits,
            surveysUsed: 0,
            status: planData.status || 'active',
            startDate: startDate,
            endDate: endDate,
            features: planData.features || plan.features || []
          });

        } else {
          setError(response.data.message || 'No active subscription found');
          setCurrentPlan(null);
        }
      } catch (err) {
        const status = err.response?.status;

        if (status === 404) {
          // No active subscription → Not an actual error
          setCurrentPlan(null);
          setError(null);
        } else {
          setError(err.response?.data?.message || 'Error fetching current subscription');
          setCurrentPlan(null);
        }
      } finally {
        setLoadingCurrent(false);
      }
    };

    fetchCurrentSubscription();
  }, []);

  // Fetch available plans based on billing cycle
  useEffect(() => {
    const fetchAvailablePlans = async () => {
      try {
        setLoadingAvailable(true);
        const response = await axiosInstance.get(`/subscriptions/user/plans/available?billingCycle=${billingCycle}`);
        if (response.data.success) {
          const plans = response.data.data;
          setAvailablePlans(plans.map((plan, index) => ({
            id: plan._id,
            planName: plan.name,
            price: plan.price,
            billingCycle: plan.billingCycle,
            duration: plan.billingCycle === 'monthly' ? 1 : 12,
            surveyLimit: plan.credits === 0 ? -1 : plan.credits,
            description: Array.isArray(plan.description)
              ? plan.description
              : (plan.description ? plan.description.split('  ') : ['No description available']),

            features: plan.features || [],
            icon: [<MdStar />, <MdRocketLaunch />, <MdBusiness />][index % 3],
            recommended: plan.name.toLowerCase().includes('pro') // Example: Recommend 'pro' plans
          })));
          console.log('Available plans fetched:', plans);
        } else {
          setError(response.data.message || 'Error fetching available plans');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching available plans');
      } finally {
        setLoadingAvailable(false);
      }
    };

    fetchAvailablePlans();
  }, [billingCycle]);

  const handlePlanSelect = async (plan) => {
    if (currentPlan && plan.id === currentPlan.id) {
      Swal.fire({
        icon: 'info',
        title: 'Already Subscribed',
        text: 'You are already on this plan!',
        confirmButtonColor: '#0d6efd'
      });
      return;
    }

    if (!currentPlan) {
      try {
        const now = new Date();
        const startDate = now.toISOString();
        const endDate = new Date(
          now.getFullYear(),
          now.getMonth() + (plan.duration || 1),
          now.getDate()
        ).toISOString();

        const response = await axiosInstance.post('/subscriptions/user/activate', {
          planId: plan.id,
          startDate,
          endDate
        });

        if (response.data.success) {
          setCurrentPlan({
            ...response.data.data,
            startDate,
            endDate
          });

          Swal.fire({
            icon: 'success',
            title: 'Subscription Activated!',
            text: 'Your subscription has been activated.',
            confirmButtonColor: '#0d6efd'
          });
        }
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Activation Failed',
          text: err.response?.data?.message || 'Error activating subscription',
          confirmButtonColor: '#0d6efd'
        });
      }
    } else {
      setSelectedPlan(plan);
      setShowUpgradeModal(true);
    }
  };


  // Confirm upgrade request
  const confirmUpgrade = async () => {
    try {
      const response = await axiosInstance.post('/subscriptions/user/upgrade', {
        planId: selectedPlan.id,
        planName: selectedPlan.planName,
        reason: 'User requested upgrade via dashboard'
      });
      if (response.data.success) {
        setShowUpgradeModal(false);
        setSelectedPlan(null);
        Swal.fire({
          icon: 'success',
          title: 'Upgrade Requested!',
          text: 'Your upgrade request has been submitted. Our team will contact you soon.',
          confirmButtonColor: '#0d6efd',
          timer: 3000,
          showConfirmButton: false
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Request Failed',
        text: err.response?.data?.message || 'Error requesting upgrade',
        confirmButtonColor: '#0d6efd'
      });
    }
  };

  // Get display period
  const getPeriod = (cycle) => cycle === 'yearly' ? '/year' : '/month';

  // Calculate days remaining
  const getDaysRemaining = (endDate) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Calculate usage percentage
  const getUsagePercentage = (used, limit) => {
    if (limit === -1) return 0;
    return (used / limit) * 100;
  };

  if (loadingCurrent || loadingAvailable) {
    return <div>Loading subscription details...</div>;
  }

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
              {currentPlan ? 'Active Subscription' : 'No Active Subscription'}
            </Badge>
          </div>
        </div>

        {/* Current Plan Hero Section */}
        {currentPlan && (
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
                      <span className="period">{getPeriod(currentPlan.billingCycle)}</span>
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
                                now={getUsagePercentage(currentPlan.surveysUsed, currentPlan.surveyLimit)}
                                variant={getUsagePercentage(currentPlan.surveysUsed, currentPlan.surveyLimit) > 80 ? 'danger' : 'primary'}
                              />
                              <span className="usage-percentage">{getUsagePercentage(currentPlan.surveysUsed, currentPlan.surveyLimit).toFixed(0)}% Used</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Col>

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
                            <Badge bg={getDaysRemaining(currentPlan.endDate) < 7 ? 'danger' : 'info'} className="days-badge">
                              {getDaysRemaining(currentPlan.endDate)} days
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
        )}

        {/* Available Plans Section */}
        <div className="available-plans-section">
          <div className="section-header-modern">
            <div>
              <h2>Available Plans</h2>
              <p>Choose a plan that fits your needs and upgrade anytime</p>
            </div>
            <ToggleButtonGroup type="radio" name="billingCycle" defaultValue={billingCycle}>
              <ToggleButton
                id="monthly"
                value="monthly"
                checked={billingCycle === 'monthly'}
                onChange={() => setBillingCycle('monthly')}
              >
                Monthly
              </ToggleButton>

              <ToggleButton
                id="yearly"
                value="yearly"
                checked={billingCycle === 'yearly'}
                onChange={() => setBillingCycle('yearly')}
              >
                Yearly
              </ToggleButton>
            </ToggleButtonGroup>
          </div>

          <Row className="g-4">
            {availablePlans.map(plan => (
              <Col key={plan.id} lg={4} md={6}>
                <div className={`pricing-card ${plan.recommended ? 'recommended' : ''} ${currentPlan && plan.id === currentPlan.id ? 'current' : ''}`}>
                  {plan.recommended && (
                    <div className="recommended-badge">
                      <MdWorkspacePremium />
                      <span>Recommended</span>
                    </div>
                  )}
                  {currentPlan && plan.id === currentPlan.id && (
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
                    {/* <p className="plan-desc">{plan.description}</p> */}
                    <div className="plan-desc-list">
                      {plan.description.map((desc, i) => (
                        <div key={i} className="desc-item">
                          <MdCheck className="check-icon" />
                          <span>{desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pricing-amount">
                    <span className="currency">$</span>
                    <span className="price">{plan.price}</span>
                    <span className="period">{getPeriod(plan.billingCycle)}</span>
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
                    {currentPlan && plan.id === currentPlan.id ? (
                      <Button variant="outline-secondary" disabled className="w-100">
                        Current Plan
                      </Button>
                    ) : (
                      <Button
                        variant={plan.recommended ? 'primary' : 'outline-primary'}
                        className="w-100"
                        onClick={() => handlePlanSelect(plan)}
                      >
                        {currentPlan && plan.price > currentPlan.price
                          ? 'Upgrade Plan'
                          : 'Select Plan'}
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
            {selectedPlan && currentPlan && (
              <div className="plan-comparison">
                <p className="mb-4">You are about to request an upgrade:</p>
                <div className="comparison-card">
                  <div className="comparison-row from">
                    <span className="label">Current Plan</span>
                    <div className="plan-details">
                      <span className="name">{currentPlan.planName}</span>
                      <span className="price">${currentPlan.price}{getPeriod(currentPlan.billingCycle)}</span>
                    </div>
                  </div>
                  <div className="comparison-arrow">
                    <MdTrendingUp />
                  </div>
                  <div className="comparison-row to">
                    <span className="label">New Plan</span>
                    <div className="plan-details">
                      <span className="name">{selectedPlan.planName}</span>
                      <span className="price">${selectedPlan.price}{getPeriod(selectedPlan.billingCycle)}</span>
                    </div>
                  </div>
                </div>
                <div className="price-difference mt-3">
                  <div className="difference-card">
                    <span>Price Difference:</span>
                    <span className="amount">
                      ${Math.abs(selectedPlan.price - currentPlan.price).toFixed(2)}{getPeriod(selectedPlan.billingCycle)}
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
              Request Upgrade
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default MyPlans;