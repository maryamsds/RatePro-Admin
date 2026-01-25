// src/pages/Subscription/UsageDashboard.jsx
// Usage visualization dashboard for company admins

import React, { useState, useEffect } from 'react';
import {
    Container, Row, Col, Card, ProgressBar, Badge, Alert, Spinner
} from 'react-bootstrap';
import {
    MdBarChart, MdRefresh, MdWarning, MdCheck, MdTrendingUp,
    MdEmail, MdSms, MdPeople, MdInsertChart, MdCloud, MdAutorenew
} from 'react-icons/md';
import {
    getUsageReport,
    getCurrentSubscription,
    getUsagePercentage,
    getUsageStatus
} from '../../api/services/subscriptionService';

const LIMIT_ICONS = {
    max_active_surveys: MdInsertChart,
    max_responses_monthly: MdBarChart,
    max_users: MdPeople,
    max_segments: MdAutorenew,
    email_monthly_limit: MdEmail,
    sms_monthly_limit: MdSms,
    storage_gb: MdCloud,
    actions_monthly: MdTrendingUp
};

const LIMIT_LABELS = {
    max_active_surveys: 'Active Surveys',
    max_responses_monthly: 'Monthly Responses',
    max_users: 'Team Members',
    max_segments: 'Audience Segments',
    email_monthly_limit: 'Email Invitations',
    sms_monthly_limit: 'SMS Invitations',
    storage_gb: 'Storage',
    actions_monthly: 'Automated Actions'
};

const UsageDashboard = () => {
    const [usageData, setUsageData] = useState(null);
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [usageRes, subRes] = await Promise.all([
                getUsageReport(),
                getCurrentSubscription()
            ]);
            setUsageData(usageRes.data);
            setSubscription(subRes.data);
        } catch (error) {
            console.error('Failed to load usage data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2">Loading usage data...</p>
            </Container>
        );
    }

    if (!usageData) {
        return (
            <Container className="py-5">
                <Alert variant="warning">
                    Unable to load usage data. Please try again.
                </Alert>
            </Container>
        );
    }

    const limits = usageData.limits || {};
    const hasWarnings = Object.values(limits).some(l => {
        const pct = typeof l.limit === 'number' && l.limit > 0
            ? (l.current / l.limit) * 100
            : 0;
        return pct >= 80;
    });

    return (
        <Container fluid className="py-4">
            {/* Header */}
            <div className="page-header-section mb-4">
                <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <h1 className="d-flex align-items-center gap-2">
                            <MdBarChart className="text-primary" />
                            Usage Dashboard
                        </h1>
                        <p className="text-muted mb-0">
                            Monitor your subscription usage and limits
                        </p>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                        <Badge bg="primary" className="px-3 py-2">
                            {subscription?.planName || subscription?.planCode || 'Free'} Plan
                        </Badge>
                        <Badge bg={subscription?.billing?.status === 'active' ? 'success' : 'warning'} className="px-3 py-2">
                            {subscription?.billing?.status || 'Unknown'}
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Warning Alert */}
            {hasWarnings && (
                <Alert variant="warning" className="d-flex align-items-center mb-4">
                    <MdWarning className="fs-4 me-2" />
                    <div>
                        <strong>Usage Warning!</strong> Some of your limits are approaching their maximum.
                        Consider upgrading your plan to avoid disruptions.
                    </div>
                </Alert>
            )}

            {/* Last Reset Info */}
            <Card className="border-0 shadow-sm mb-4 bg-light">
                <Card.Body className="py-2 d-flex justify-content-between align-items-center">
                    <small className="text-muted">
                        <MdAutorenew className="me-1" />
                        Usage resets on the 1st of each month
                    </small>
                    <small className="text-muted">
                        Last reset: {usageData.lastResetAt
                            ? new Date(usageData.lastResetAt).toLocaleDateString()
                            : 'Never'}
                    </small>
                </Card.Body>
            </Card>

            {/* Usage Cards Grid */}
            <Row>
                {Object.entries(limits).map(([key, data]) => {
                    const Icon = LIMIT_ICONS[key] || MdBarChart;
                    const label = LIMIT_LABELS[key] || key.replace(/_/g, ' ');
                    const isUnlimited = data.limit === 'unlimited' || data.limit === -1;
                    const percentage = isUnlimited ? 0 : getUsagePercentage(data.current, data.limit);
                    const status = isUnlimited ? 'success' : getUsageStatus(percentage);

                    return (
                        <Col key={key} md={6} lg={4} xl={3} className="mb-4">
                            <Card className="h-100 border-0 shadow-sm">
                                <Card.Body>
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div className={`rounded-circle p-2 bg-${status} bg-opacity-10`}>
                                            <Icon className={`fs-4 text-${status}`} />
                                        </div>
                                        {percentage >= 80 && !isUnlimited && (
                                            <Badge bg={status}>
                                                <MdWarning /> {percentage >= 100 ? 'Limit Reached' : 'Warning'}
                                            </Badge>
                                        )}
                                        {isUnlimited && (
                                            <Badge bg="success">
                                                <MdCheck /> Unlimited
                                            </Badge>
                                        )}
                                    </div>

                                    <h6 className="text-muted mb-2">{label}</h6>

                                    <div className="d-flex align-items-baseline mb-2">
                                        <span className="fs-3 fw-bold me-2">{data.current.toLocaleString()}</span>
                                        <span className="text-muted">
                                            / {isUnlimited ? '∞' : data.limit.toLocaleString()}
                                        </span>
                                    </div>

                                    {!isUnlimited && (
                                        <>
                                            <ProgressBar
                                                now={percentage}
                                                variant={status}
                                                className="mb-2"
                                                style={{ height: '8px' }}
                                            />
                                            <small className="text-muted">
                                                {data.remaining !== undefined
                                                    ? `${data.remaining.toLocaleString()} remaining`
                                                    : `${percentage}% used`}
                                            </small>
                                        </>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    );
                })}
            </Row>

            {/* Quick Stats from subscription usage */}
            {usageData.usage && (
                <Card className="border-0 shadow-sm mt-4">
                    <Card.Header className="bg-transparent border-0">
                        <h5 className="mb-0">This Month's Activity</h5>
                    </Card.Header>
                    <Card.Body>
                        <Row>
                            <Col md={3} className="text-center border-end">
                                <MdInsertChart className="fs-2 text-primary mb-2" />
                                <h4>{usageData.usage.surveysThisMonth || 0}</h4>
                                <small className="text-muted">Surveys Created</small>
                            </Col>
                            <Col md={3} className="text-center border-end">
                                <MdBarChart className="fs-2 text-success mb-2" />
                                <h4>{usageData.usage.responsesThisMonth || 0}</h4>
                                <small className="text-muted">Responses Collected</small>
                            </Col>
                            <Col md={3} className="text-center border-end">
                                <MdEmail className="fs-2 text-info mb-2" />
                                <h4>{usageData.usage.emailsSentThisMonth || 0}</h4>
                                <small className="text-muted">Emails Sent</small>
                            </Col>
                            <Col md={3} className="text-center">
                                <MdSms className="fs-2 text-warning mb-2" />
                                <h4>{usageData.usage.smsSentThisMonth || 0}</h4>
                                <small className="text-muted">SMS Sent</small>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            )}

            {/* Upgrade CTA if limits are being reached */}
            {hasWarnings && (
                <Card className="border-0 shadow-sm mt-4 bg-gradient" style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }}>
                    <Card.Body className="text-white text-center py-4">
                        <h4 className="mb-2">Need more capacity?</h4>
                        <p className="mb-3 opacity-75">
                            Upgrade your plan to unlock higher limits and premium features.
                        </p>
                        <a href="/app/subscription/my-plan" className="btn btn-light btn-lg">
                            <MdTrendingUp className="me-2" />
                            Upgrade Now
                        </a>
                    </Card.Body>
                </Card>
            )}
        </Container>
    );
};

export default UsageDashboard;
