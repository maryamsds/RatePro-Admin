// src/pages/Subscription/MyPlan.jsx
"use client";
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Badge, Card, ListGroup, ProgressBar, Alert } from 'react-bootstrap';
import { MdCheck, MdClose, MdStar, MdRocketLaunch, MdUpgrade, MdWorkspacePremium } from 'react-icons/md';
import axiosInstance from '../../api/axiosInstance';
import Swal from 'sweetalert2';

const MyPlan = () => {
  const [tenant, setTenant] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyPlanAndAvailablePlans();
  }, []);

  const fetchMyPlanAndAvailablePlans = async () => {
    try {
      const [tenantRes, plansRes] = await Promise.all([
        axiosInstance.get('/tenants/me'), // ← Yeh route hona chahiye (tenant ka data)
        axiosInstance.get('/plans')
      ]);

      setTenant(tenantRes.data.tenant);
      setPlans(plansRes.data.plans || []);
    } catch (err) {
      Swal.fire('Error', 'Failed to load plan information', 'error');
    } finally {
      setLoading(false);
    }
  };

  const currentPlan = tenant?.plan ? plans.find(p => p._id === tenant.plan.toString()) : null;

  const handleUpgrade = async (planId) => {
    const result = await Swal.fire({
      title: 'Upgrade Plan?',
      text: "Your features will be updated immediately!",
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Upgrade!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await axiosInstance.patch('/tenants/me/plan', { planId });
        Swal.fire('Upgraded!', 'Your plan has been upgraded successfully.', 'success');
        fetchMyPlanAndAvailablePlans();
      } catch (err) {
        Swal.fire('Error', err.response?.data?.message || 'Upgrade failed', 'error');
      }
    }
  };

  if (loading) return <div className="text-center p-5">Loading your plan...</div>;

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>My Plan</h1>
          <p className="text-muted">View your current plan and available upgrades</p>
        </div>
        <Badge bg={currentPlan ? "success" : "warning"} className="fs-6 px-4 py-2">
          {currentPlan ? `${currentPlan.name} Plan` : 'Free Plan'}
        </Badge>
      </div>

      {/* Current Plan Card */}
      <Row className="mb-5">
        <Col lg={12}>
          <Card className="shadow-lg border-0">
            <Card.Header className="bg-primary text-white">
              <h3 className="mb-0 d-flex align-items-center">
                <MdStar className="me-2" />
                Current Plan: <strong className="ms-2">{currentPlan?.name || 'Free'}</strong>
              </h3>
            </Card.Header>
            <Card.Body>
              {currentPlan ? (
                <Row>
                  <Col md={6}>
                    <h5>Active Features</h5>
                    <ListGroup>
                      {Object.entries(tenant.features || {}).map(([key, value]) => (
                        value && (
                          <ListGroup.Item key={key} className="d-flex justify-content-between">
                            <span>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                            <MdCheck className="text-success" />
                          </ListGroup.Item>
                        )
                      ))}
                    </ListGroup>
                  </Col>
                  <Col md={6}>
                    <h5>Usage Limits</h5>
                    <div className="mb-3">
                      <div className="d-flex justify-content-between">
                        <span>Responses This Month</span>
                        <strong>{tenant.usage?.responsesThisMonth || 0} / {tenant.limits?.monthlyResponses || 500}</strong>
                      </div>
                      <ProgressBar 
                        now={(tenant.usage?.responsesThisMonth / tenant.limits?.monthlyResponses) * 100 || 0}
                        variant="info"
                      />
                    </div>
                  </Col>
                </Row>
              ) : (
                <Alert variant="warning">
                  <strong>No active plan!</strong> You're on the free tier with limited features.
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Available Plans */}
      <h2 className="mb-4">Upgrade Your Plan</h2>
      <Row>
        {plans.filter(p => p.isActive).map(plan => {
          const isCurrent = currentPlan?._id === plan._id;
          const isUpgrade = currentPlan && plan.limits.responsesPerMonth > (tenant.limits?.monthlyResponses || 0);

          return (
            <Col key={plan._id} md={4} className="mb-4">
              <Card className={`h-100 ${isCurrent ? 'border-primary' : ''} ${plan.name.toLowerCase().includes('pro') ? 'border-warning' : ''}`}>
                {plan.name.toLowerCase().includes('pro') && (
                  <div className="text-center pt-3">
                    <Badge bg="warning" text="dark">Most Popular</Badge>
                  </div>
                )}
                <Card.Header className="text-center">
                  <h4>{plan.name}</h4>
                </Card.Header>
                <Card.Body>
                  <ListGroup variant="flush">
                    <ListGroup.Item>
                      <strong>Responses:</strong> {plan.limits.responsesPerMonth === 'unlimited' ? '∞' : plan.limits.responsesPerMonth}/month
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Team Members:</strong> {plan.limits.teamMembers}
                    </ListGroup.Item>
                    {Object.entries(plan.features || {}).map(([key, value]) => 
                      value ? (
                        <ListGroup.Item key={key} className="text-success">
                          <MdCheck /> {key.replace(/([A-Z])/g, ' $1').trim()}
                        </ListGroup.Item>
                      ) : (
                        <ListGroup.Item key={key} className="text-muted">
                          <MdClose /> {key.replace(/([A-Z])/g, ' $1').trim()}
                        </ListGroup.Item>
                      )
                    )}
                  </ListGroup>
                </Card.Body>
                <Card.Footer className="text-center">
                  {isCurrent ? (
                    <Button variant="success" disabled>
                      <MdCheck /> Current Plan
                    </Button>
                  ) : (
                    <Button 
                      variant={isUpgrade ? "primary" : "outline-primary"}
                      onClick={() => handleUpgrade(plan._id)}
                    >
                      <MdUpgrade className="me-2" />
                      {isUpgrade ? 'Upgrade Now' : 'Downgrade'}
                    </Button>
                  )}
                </Card.Footer>
              </Card>
            </Col>
          );
        })}
      </Row>
    </Container>
  );
};

export default MyPlan;