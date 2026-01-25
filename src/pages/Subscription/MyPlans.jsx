// src/pages/Subscription/MyPlans.jsx
// Company admin billing and subscription management

import React, { useState, useEffect } from 'react';
import {
  Container, Row, Col, Card, Button, Badge, ListGroup,
  ProgressBar, Alert, Spinner, Modal
} from 'react-bootstrap';
import {
  MdCheck, MdClose, MdStar, MdRocketLaunch, MdCreditCard,
  MdUpgrade, MdRefresh, MdPayment, MdCancel, MdArrowDownward
} from 'react-icons/md';
import Swal from 'sweetalert2';
import {
  getPublicPlans,
  getCurrentSubscription,
  getUsageReport,
  createCheckoutSession,
  upgradePlan,
  downgradePlan,
  cancelSubscription,
  getBillingPortalUrl,
  getUsagePercentage,
  getUsageStatus
} from '../../api/services/subscriptionService';

const MyPlans = () => {
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [featureDefinitions, setFeatureDefinitions] = useState({});
  const [usageData, setUsageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Modal states
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [subRes, plansRes, usageRes] = await Promise.all([
        getCurrentSubscription(),
        getPublicPlans(),
        getUsageReport()
      ]);

      setSubscription(subRes.data);
      setPlans(plansRes.data?.plans || []);
      setFeatureDefinitions(plansRes.data?.featureDefinitions || {});
      setUsageData(usageRes.data);
    } catch (error) {
      console.error('Failed to load subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planCode) => {
    const result = await Swal.fire({
      title: 'Upgrade Plan?',
      text: 'Your new features will be available immediately.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Upgrade!',
      confirmButtonColor: '#28a745'
    });

    if (result.isConfirmed) {
      setActionLoading(true);
      try {
        await upgradePlan(planCode);
        Swal.fire('Upgraded!', 'Your plan has been upgraded successfully.', 'success');
        fetchData();
      } catch (error) {
        Swal.fire('Error', error.response?.data?.message || 'Upgrade failed', 'error');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleDowngrade = async (planCode) => {
    const result = await Swal.fire({
      title: 'Downgrade Plan?',
      text: 'The change will take effect at the end of your current billing period.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Downgrade',
      confirmButtonColor: '#dc3545'
    });

    if (result.isConfirmed) {
      setActionLoading(true);
      try {
        const res = await downgradePlan(planCode);
        Swal.fire('Scheduled', res.message || 'Downgrade scheduled for end of billing period.', 'info');
        fetchData();
      } catch (error) {
        Swal.fire('Error', error.response?.data?.message || 'Downgrade failed', 'error');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleCheckout = async (planCode, billingCycle) => {
    setActionLoading(true);
    try {
      const res = await createCheckoutSession(
        planCode,
        billingCycle,
        `${window.location.origin}/app/subscription/my-plan?success=true`,
        `${window.location.origin}/app/subscription/my-plan?cancelled=true`
      );

      if (res.data?.url) {
        window.location.href = res.data.url;
      }
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Checkout failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async (immediate) => {
    setActionLoading(true);
    try {
      const res = await cancelSubscription(immediate);
      Swal.fire('Cancelled', res.message || 'Subscription cancelled.', 'info');
      setShowCancelModal(false);
      fetchData();
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Cancellation failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBillingPortal = async () => {
    setActionLoading(true);
    try {
      const res = await getBillingPortalUrl(`${window.location.origin}/app/subscription/my-plan`);
      if (res.data?.url) {
        window.location.href = res.data.url;
      }
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Could not open billing portal', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const currentPlanCode = subscription?.planCode;
  const currentPlanIndex = plans.findIndex(p => p.code === currentPlanCode);

  const isPlanUpgrade = (planCode) => {
    const planIndex = plans.findIndex(p => p.code === planCode);
    return planIndex > currentPlanIndex;
  };

  const isPlanDowngrade = (planCode) => {
    const planIndex = plans.findIndex(p => p.code === planCode);
    return planIndex < currentPlanIndex && planIndex >= 0;
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading your subscription...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <div className="page-header-section mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="d-flex align-items-center gap-2">
              <MdCreditCard className="text-primary" />
              My Plan
            </h1>
            <p className="text-muted mb-0">
              View your current plan and manage your subscription
            </p>
          </div>
          <div className="d-flex gap-2">
            <Button variant="outline-secondary" onClick={fetchData} disabled={actionLoading}>
              <MdRefresh className="me-1" /> Refresh
            </Button>
            {subscription?.payment?.gateway === 'stripe' && (
              <Button variant="outline-primary" onClick={handleBillingPortal} disabled={actionLoading}>
                <MdPayment className="me-1" /> Billing Portal
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Current Plan Card */}
      <Card className="border-0 shadow-sm mb-4" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <Card.Body className="text-white py-4">
          <Row className="align-items-center">
            <Col md={6}>
              <Badge bg="light" text="dark" className="mb-2">
                Current Plan
              </Badge>
              <h2 className="mb-1">{subscription?.planName || subscription?.planCode || 'Free'}</h2>
              <p className="opacity-75 mb-0">
                Status: <Badge bg={subscription?.billing?.status === 'active' ? 'success' : 'warning'}>
                  {subscription?.billing?.status || 'Unknown'}
                </Badge>
                {' '}
                {subscription?.billing?.cycle && (
                  <Badge bg="light" text="dark">{subscription.billing.cycle} billing</Badge>
                )}
              </p>
              {subscription?.billing?.currentPeriodEnd && (
                <small className="opacity-75">
                  Renews: {new Date(subscription.billing.currentPeriodEnd).toLocaleDateString()}
                </small>
              )}
            </Col>
            <Col md={6} className="text-md-end mt-3 mt-md-0">
              {subscription?.billing?.status === 'active' && currentPlanCode !== 'free' && (
                <Button
                  variant="outline-light"
                  size="sm"
                  onClick={() => setShowCancelModal(true)}
                  disabled={actionLoading}
                >
                  <MdCancel className="me-1" /> Cancel Subscription
                </Button>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Usage Summary */}
      {usageData?.limits && Object.keys(usageData.limits).length > 0 && (
        <Card className="border-0 shadow-sm mb-4">
          <Card.Header className="bg-transparent border-0 d-flex justify-content-between">
            <h5 className="mb-0">Usage This Month</h5>
            <a href="/app/subscription/usage" className="text-primary">View Details →</a>
          </Card.Header>
          <Card.Body>
            <Row>
              {Object.entries(usageData.limits).slice(0, 4).map(([key, data]) => {
                const isUnlimited = data.limit === 'unlimited' || data.limit === -1;
                const pct = isUnlimited ? 0 : getUsagePercentage(data.current, data.limit);
                const status = getUsageStatus(pct);
                const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

                return (
                  <Col key={key} md={3} className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <small>{label}</small>
                      <small className="text-muted">
                        {data.current} / {isUnlimited ? '∞' : data.limit}
                      </small>
                    </div>
                    <ProgressBar
                      now={isUnlimited ? 0 : pct}
                      variant={status}
                      style={{ height: '6px' }}
                    />
                  </Col>
                );
              })}
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Available Plans */}
      <h4 className="mb-3">Available Plans</h4>
      <Row>
        {plans.filter(p => p.isActive).map(plan => {
          const isCurrent = plan.code === currentPlanCode;
          const isUpgrade = isPlanUpgrade(plan.code);
          const isDowngrade = isPlanDowngrade(plan.code);

          return (
            <Col key={plan._id} md={6} lg={3} className="mb-4">
              <Card className={`h-100 border-0 shadow-sm ${isCurrent ? 'border-primary border-2' : ''}`}>
                {plan.badge && (
                  <div className="position-absolute top-0 end-0 m-2">
                    <Badge bg="warning" text="dark">
                      <MdStar className="me-1" />{plan.badge}
                    </Badge>
                  </div>
                )}
                {isCurrent && (
                  <div className="position-absolute top-0 start-0 m-2">
                    <Badge bg="primary">Current</Badge>
                  </div>
                )}
                <Card.Header className="bg-transparent text-center pt-4 pb-2 border-0">
                  <h4 className="mb-0">{plan.name}</h4>
                </Card.Header>
                <Card.Body className="text-center py-2">
                  <div className="mb-3">
                    <span className="fs-1 fw-bold">${plan.pricing?.monthly || 0}</span>
                    <span className="text-muted">/mo</span>
                  </div>
                  {plan.pricing?.yearly > 0 && (
                    <small className="text-success d-block mb-3">
                      ${plan.pricing.yearly}/year (save {Math.round((1 - plan.pricing.yearly / (plan.pricing.monthly * 12)) * 100)}%)
                    </small>
                  )}

                  {/* Key features */}
                  <ListGroup variant="flush" className="text-start small mb-3">
                    {plan.features?.slice(0, 6).map(f => {
                      const def = featureDefinitions[f.featureCode];
                      if (!def) return null;

                      return (
                        <ListGroup.Item key={f.featureCode} className="px-0 py-1 border-0 d-flex">
                          {f.enabled || f.limitValue > 0 || f.limitValue === -1 ? (
                            <MdCheck className="text-success me-2 flex-shrink-0 mt-1" />
                          ) : (
                            <MdClose className="text-muted me-2 flex-shrink-0 mt-1" />
                          )}
                          <span>
                            {def.name}
                            {def.type === 'limit' && f.limitValue !== null && (
                              <Badge bg="secondary" className="ms-1">
                                {f.limitValue === -1 ? '∞' : f.limitValue}
                              </Badge>
                            )}
                          </span>
                        </ListGroup.Item>
                      );
                    })}
                  </ListGroup>
                </Card.Body>
                <Card.Footer className="bg-transparent border-0 text-center pb-4">
                  {isCurrent ? (
                    <Button variant="success" disabled>
                      <MdCheck className="me-1" /> Current Plan
                    </Button>
                  ) : isUpgrade ? (
                    <Button
                      variant="primary"
                      onClick={() => handleUpgrade(plan.code)}
                      disabled={actionLoading}
                    >
                      <MdRocketLaunch className="me-1" /> Upgrade
                    </Button>
                  ) : isDowngrade ? (
                    <Button
                      variant="outline-secondary"
                      onClick={() => handleDowngrade(plan.code)}
                      disabled={actionLoading}
                    >
                      <MdArrowDownward className="me-1" /> Downgrade
                    </Button>
                  ) : (
                    <Button
                      variant="outline-primary"
                      onClick={() => handleCheckout(plan.code, 'monthly')}
                      disabled={actionLoading}
                    >
                      Select Plan
                    </Button>
                  )}
                </Card.Footer>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* Cancel Subscription Modal */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Cancel Subscription</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="warning">
            Are you sure you want to cancel your subscription?
          </Alert>
          <p>You have two options:</p>
          <div className="d-grid gap-2">
            <Button
              variant="outline-warning"
              onClick={() => handleCancel(false)}
              disabled={actionLoading}
            >
              Cancel at End of Billing Period
              <br />
              <small className="text-muted">Keep access until {
                subscription?.billing?.currentPeriodEnd
                  ? new Date(subscription.billing.currentPeriodEnd).toLocaleDateString()
                  : 'period ends'
              }</small>
            </Button>
            <Button
              variant="outline-danger"
              onClick={() => handleCancel(true)}
              disabled={actionLoading}
            >
              Cancel Immediately
              <br />
              <small className="text-muted">Lose access now (no refund)</small>
            </Button>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
            Keep Subscription
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default MyPlans;