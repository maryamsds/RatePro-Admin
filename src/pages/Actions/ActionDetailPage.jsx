// src/pages/Actions/ActionDetailPage.jsx
// ============================================================================
// Action Detail Page - Full-page workspace for action management
// Implements human confirmation workflow for action plans
// Uses Bootstrap 5 components per theme.md guidelines
// ============================================================================
"use client"
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Container, Row, Col, Card, Button, Badge, Spinner,
    Alert, Modal, Form, ProgressBar, ListGroup
} from "react-bootstrap";
import {
    MdAssignment, MdCheckCircle, MdSchedule, MdTimer,
    MdPriorityHigh, MdWarning, MdFlag, MdPerson,
    MdPlayArrow, MdArrowBack, MdAdd, MdError,
    MdTrendingUp, MdTrendingDown, MdRemove,
    MdDescription, MdTrackChanges, MdComment,
    MdGroup, MdCalendarToday, MdDone, MdRefresh
} from "react-icons/md";
import { FiTarget, FiFileText } from "react-icons/fi";
import {
    getActionById,
    getActionPlan,
    createActionPlan,
    confirmActionPlan,
    startActionPlan,
    updateStepStatus,
} from "../../api/services/actionService";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import {
    STATUS_CONFIG,
    PRIORITY_CONFIG,
    ACTION_STATUSES,
    ACTION_PRIORITIES,
} from "../../constants/actionConstants";

// ============================================================================
// Sub-components (Bootstrap 5 themed)
// ============================================================================

// Priority Badge
const PriorityBadge = ({ priority }) => {
    const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG[ACTION_PRIORITIES.MEDIUM];
    return (
        <Badge bg={config.color} className="d-flex align-items-center gap-1">
            <MdPriorityHigh size={14} />
            {config.label?.toUpperCase() || priority?.toUpperCase() || "MEDIUM"}
        </Badge>
    );
};

// Status Badge
const StatusBadge = ({ status }) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG[ACTION_STATUSES.PENDING];
    return (
        <Badge bg={config.color} className="d-flex align-items-center gap-1">
            <MdSchedule size={14} />
            {config.label?.toUpperCase() || status?.replace("-", " ").toUpperCase() || "PENDING"}
        </Badge>
    );
};

// Plan Status Badge
const PlanStatusBadge = ({ status }) => {
    const statusConfig = {
        draft: { bg: "secondary", label: "Draft" },
        approved: { bg: "success", label: "Approved" },
        in_progress: { bg: "primary", label: "In Progress" },
        completed: { bg: "info", label: "Completed" },
        cancelled: { bg: "danger", label: "Cancelled" },
    };
    const config = statusConfig[status] || statusConfig.draft;
    return (
        <Badge bg={config.bg} className="d-flex align-items-center gap-1">
            <MdTrackChanges size={14} />
            Plan: {config.label}
        </Badge>
    );
};

// Trend Indicator
const TrendIndicator = ({ trendData }) => {
    if (!trendData) return null;
    const isUp = trendData.changePercent > 0;
    const isDown = trendData.changePercent < 0;

    const statusLabels = {
        new: "New Issue",
        worsening: "Getting Worse",
        improving: "Improving",
        chronic: "Chronic Issue",
        resolved: "Resolved",
    };

    return (
        <div className="d-flex align-items-center gap-2 mt-3 small">
            {isUp && <MdTrendingUp size={16} className="text-danger" />}
            {isDown && <MdTrendingDown size={16} className="text-success" />}
            {!isUp && !isDown && <MdRemove size={16} className="text-muted" />}
            <span className={isUp ? "text-danger" : isDown ? "text-success" : "text-muted"}>
                {Math.abs(trendData.changePercent)}% vs {trendData.comparisonPeriod}
            </span>
            {trendData.issueStatus && (
                <Badge bg="light" text="dark" className="ms-1">
                    {statusLabels[trendData.issueStatus] || trendData.issueStatus}
                </Badge>
            )}
        </div>
    );
};

// Checklist Step Item (Bootstrap styled)
const ChecklistStep = ({ step, onStatusChange, isLoading }) => {
    const statusVariants = {
        pending: "secondary",
        in_progress: "primary",
        completed: "success",
        skipped: "light",
    };

    const stepTypeVariants = {
        review: "info",
        analysis: "primary",
        action: "warning",
        communication: "success",
        measurement: "secondary",
    };

    const handleComplete = () => onStatusChange(step._id, "completed");
    const handleStart = () => onStatusChange(step._id, "in_progress");

    return (
        <ListGroup.Item
            className={`d-flex align-items-start gap-3 ${step.status === "completed" ? "bg-light opacity-75" : ""}`}
        >
            {/* Status Icon */}
            <div className="mt-1">
                {isLoading ? (
                    <Spinner animation="border" size="sm" />
                ) : step.status === "completed" ? (
                    <MdCheckCircle size={20} className="text-success" />
                ) : step.status === "in_progress" ? (
                    <MdPlayArrow size={20} className="text-primary" />
                ) : (
                    <MdSchedule size={20} className="text-muted" />
                )}
            </div>

            {/* Content */}
            <div className="flex-grow-1">
                <div className="d-flex align-items-center gap-2 mb-1">
                    <span className="fw-semibold">{step.stepNumber}. {step.title}</span>
                    <Badge bg={stepTypeVariants[step.stepType] || "secondary"} className="small">
                        {step.stepType}
                    </Badge>
                    {step.isRequired && <Badge bg="danger" className="small">Required</Badge>}
                </div>
                {step.description && <p className="text-muted small mb-1">{step.description}</p>}
                {step.assignedTo?.name && (
                    <small className="text-muted">
                        <MdPerson size={14} className="me-1" />
                        Assigned to: {step.assignedTo.name}
                    </small>
                )}
            </div>

            {/* Actions */}
            <div className="d-flex gap-2">
                {step.status === "pending" && (
                    <Button variant="outline-primary" size="sm" onClick={handleStart} disabled={isLoading}>
                        Start
                    </Button>
                )}
                {step.status === "in_progress" && (
                    <Button variant="outline-success" size="sm" onClick={handleComplete} disabled={isLoading}>
                        Complete
                    </Button>
                )}
            </div>
        </ListGroup.Item>
    );
};

// Create Plan Modal (Bootstrap Modal)
const CreatePlanModal = ({ show, onClose, onSubmit, isLoading }) => {
    const [formData, setFormData] = useState({
        whatWillBeDone: "",
        expectedOutcome: "",
        targetAudience: { type: "all_employees" },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.whatWillBeDone || !formData.expectedOutcome) {
            toast.error("Please fill in required fields");
            return;
        }
        onSubmit(formData);
    };

    return (
        <Modal show={show} onHide={onClose} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>
                    <MdAdd className="me-2" />
                    Create Action Plan
                </Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    <p className="text-muted small mb-4">
                        Define what will be done and the expected outcome
                    </p>

                    <Form.Group className="mb-3">
                        <Form.Label>
                            What will be done? <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={formData.whatWillBeDone}
                            onChange={(e) => setFormData({ ...formData, whatWillBeDone: e.target.value })}
                            placeholder="Describe the action plan..."
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>
                            Expected Outcome <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            value={formData.expectedOutcome}
                            onChange={(e) => setFormData({ ...formData, expectedOutcome: e.target.value })}
                            placeholder="What result do you expect?"
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Target Audience</Form.Label>
                        <Form.Select
                            value={formData.targetAudience.type}
                            onChange={(e) => setFormData({ ...formData, targetAudience: { type: e.target.value } })}
                        >
                            <option value="all_employees">All Employees</option>
                            <option value="department">Specific Department</option>
                            <option value="segment">Segment</option>
                            <option value="individuals">Specific Individuals</option>
                        </Form.Select>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button variant="primary" type="submit" disabled={isLoading}>
                        {isLoading && <Spinner animation="border" size="sm" className="me-2" />}
                        Create Plan
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

// ============================================================================
// Main Component
// ============================================================================

const ActionDetailPage = () => {
    const { id: actionId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [action, setAction] = useState(null);
    const [plan, setPlan] = useState(null);
    const [steps, setSteps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [stepLoading, setStepLoading] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [error, setError] = useState(null);

    // Fetch action and plan data
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const actionData = await getActionById(actionId);
            setAction(actionData);

            try {
                const planData = await getActionPlan(actionId);
                if (planData) {
                    setPlan(planData.actionPlan || planData);
                    setSteps(planData.steps || []);
                }
            } catch (planErr) {
                // No plan exists yet — that's expected
                console.log("No action plan found:", planErr.message);
            }
        } catch (err) {
            console.error("Failed to fetch action:", err);
            setError(err.message || "Failed to load action");
        } finally {
            setLoading(false);
        }
    }, [actionId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Create action plan
    const handleCreatePlan = async (formData) => {
        try {
            setActionLoading(true);
            const result = await createActionPlan(actionId, formData);
            setPlan(result.actionPlan || result);
            setSteps(result.steps || []);
            setShowCreateModal(false);
            toast.success("Action plan created! Please confirm to approve.");
        } catch (err) {
            toast.error(err.message || "Failed to create plan");
        } finally {
            setActionLoading(false);
        }
    };

    // Confirm action plan (human confirmation)
    const handleConfirmPlan = async () => {
        try {
            setActionLoading(true);
            await confirmActionPlan(plan._id);
            await fetchData();
            toast.success("Action plan confirmed and approved!");
        } catch (err) {
            toast.error(err.message || "Failed to confirm plan");
        } finally {
            setActionLoading(false);
        }
    };

    // Start action plan execution
    const handleStartPlan = async () => {
        try {
            setActionLoading(true);
            await startActionPlan(plan._id);
            await fetchData();
            toast.success("Action plan execution started!");
        } catch (err) {
            toast.error(err.message || "Failed to start plan");
        } finally {
            setActionLoading(false);
        }
    };

    // Update step status
    const handleStepStatusChange = async (stepId, status) => {
        try {
            setStepLoading(stepId);
            await updateStepStatus(stepId, status);
            await fetchData();
            toast.success(`Step ${status === "completed" ? "completed" : "updated"}!`);
        } catch (err) {
            toast.error(err.message || "Failed to update step");
        } finally {
            setStepLoading(null);
        }
    };

    // Loading state
    if (loading) {
        return (
            <Container fluid className="py-4">
                <div className="text-center">
                    <Spinner animation="border" variant="primary" size="lg" />
                    <p className="mt-3 text-muted">Loading action...</p>
                </div>
            </Container>
        );
    }

    // Error state
    if (error || !action) {
        return (
            <Container fluid className="py-4">
                <Alert variant="danger" className="text-center">
                    <MdError size={48} className="mb-3 d-block mx-auto" />
                    <h5>Action Not Found</h5>
                    <p>{error || "The requested action could not be loaded."}</p>
                    <Button variant="outline-danger" onClick={() => navigate("/app/actions")}>
                        <MdArrowBack className="me-2" />
                        Back to Actions
                    </Button>
                </Alert>
            </Container>
        );
    }

    const isCompanyAdmin = user?.role === "companyAdmin";
    const progressPercent = plan?.progress?.percentComplete || 0;

    return (
        <Container fluid className="py-4">
            {/* Header Card */}
            <Row className="mb-4">
                <Col>
                    <Card className="shadow-sm">
                        <Card.Body className="p-4">
                            <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start gap-3">
                                <div className="flex-grow-1">
                                    {/* Back Button */}
                                    <div className="d-flex align-items-center mb-2">
                                        <Button
                                            variant="link"
                                            className="p-0 me-3 text-primary"
                                            onClick={() => navigate("/app/actions")}
                                        >
                                            <MdArrowBack className="me-1" />
                                            Back to Actions
                                        </Button>
                                    </div>

                                    {/* Title */}
                                    <h3 className="fw-bold mb-2">{action.title}</h3>

                                    {/* Badges Row */}
                                    <div className="d-flex flex-wrap align-items-center gap-2">
                                        <PriorityBadge priority={action.priority} />
                                        <StatusBadge status={action.status} />
                                        {plan && <PlanStatusBadge status={plan.status} />}
                                        {action.department && (
                                            <Badge bg="light" text="dark" className="d-flex align-items-center">
                                                <MdGroup className="me-1" />
                                                {action.department || action.category}
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="d-flex flex-wrap gap-2">
                                    {!plan && (
                                        <Button
                                            variant="primary"
                                            onClick={() => setShowCreateModal(true)}
                                            className="d-flex align-items-center gap-2"
                                        >
                                            <MdAdd size={16} />
                                            Create Plan
                                        </Button>
                                    )}
                                    {plan?.status === "draft" && isCompanyAdmin && (
                                        <Button
                                            variant="success"
                                            onClick={handleConfirmPlan}
                                            disabled={actionLoading}
                                            className="d-flex align-items-center gap-2"
                                        >
                                            {actionLoading ? (
                                                <Spinner animation="border" size="sm" />
                                            ) : (
                                                <MdDone size={16} />
                                            )}
                                            Confirm Plan
                                        </Button>
                                    )}
                                    {plan?.status === "approved" && (
                                        <Button
                                            variant="primary"
                                            onClick={handleStartPlan}
                                            disabled={actionLoading}
                                            className="d-flex align-items-center gap-2"
                                        >
                                            {actionLoading ? (
                                                <Spinner animation="border" size="sm" />
                                            ) : (
                                                <MdPlayArrow size={16} />
                                            )}
                                            Start Execution
                                        </Button>
                                    )}
                                    <Button
                                        variant="outline-secondary"
                                        onClick={() => fetchData()}
                                        className="d-flex align-items-center gap-1"
                                    >
                                        <MdRefresh size={16} />
                                    </Button>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Main Content */}
            <Row>
                {/* Left Column - Action Details */}
                <Col lg={8} className="mb-4">
                    {/* Problem Statement */}
                    <Card className="mb-4 shadow-sm">
                        <Card.Header className="d-flex align-items-center gap-2">
                            <MdWarning size={20} className="text-warning" />
                            <Card.Title className="mb-0">Problem Statement</Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <p className="mb-0">
                                {action.problemStatement || action.description || "No problem statement defined."}
                            </p>

                            {action.rootCause?.summary && (
                                <div className="mt-3 p-3 bg-light rounded">
                                    <strong className="small text-muted">Root Cause: </strong>
                                    <span className="small">{action.rootCause.summary}</span>
                                    {action.rootCause.category && (
                                        <Badge bg="secondary" className="ms-2 small">
                                            {action.rootCause.category}
                                        </Badge>
                                    )}
                                </div>
                            )}

                            {action.trendData && <TrendIndicator trendData={action.trendData} />}
                        </Card.Body>
                    </Card>

                    {/* Action Plan */}
                    {plan ? (
                        <Card className="shadow-sm">
                            <Card.Header>
                                <div className="d-flex align-items-center justify-content-between">
                                    <div className="d-flex align-items-center gap-2">
                                        <FiTarget size={20} className="text-primary" />
                                        <Card.Title className="mb-0">Action Plan</Card.Title>
                                    </div>
                                </div>
                            </Card.Header>
                            <Card.Body>
                                {/* Progress */}
                                <div className="mb-4">
                                    <div className="d-flex justify-content-between small mb-1">
                                        <span className="text-muted">Progress</span>
                                        <span className="fw-semibold">{progressPercent}%</span>
                                    </div>
                                    <ProgressBar
                                        now={progressPercent}
                                        variant="primary"
                                        className="mb-1"
                                    />
                                    <small className="text-muted">
                                        {plan.progress?.completedSteps || 0} of {plan.progress?.totalSteps || 0} steps completed
                                    </small>
                                </div>

                                {/* Plan Details */}
                                <Row className="mb-4">
                                    <Col md={6}>
                                        <div className="mb-3">
                                            <strong className="small text-muted d-block mb-1">What will be done</strong>
                                            <p className="mb-0">{plan.whatWillBeDone}</p>
                                        </div>
                                    </Col>
                                    <Col md={6}>
                                        <div className="mb-3">
                                            <strong className="small text-muted d-block mb-1">Expected Outcome</strong>
                                            <p className="mb-0">{plan.expectedOutcome}</p>
                                        </div>
                                    </Col>
                                </Row>

                                {/* Checklist */}
                                {steps.length > 0 && (
                                    <>
                                        <h6 className="fw-semibold d-flex align-items-center gap-2 mb-3">
                                            <FiFileText size={16} />
                                            Checklist ({steps.length} steps)
                                        </h6>
                                        <ListGroup variant="flush">
                                            {steps.map((step) => (
                                                <ChecklistStep
                                                    key={step._id}
                                                    step={step}
                                                    onStatusChange={handleStepStatusChange}
                                                    isLoading={stepLoading === step._id}
                                                />
                                            ))}
                                        </ListGroup>
                                    </>
                                )}
                            </Card.Body>
                        </Card>
                    ) : (
                        <Card className="shadow-sm">
                            <Card.Body className="text-center py-5">
                                <FiTarget size={48} className="text-muted mb-3 d-block mx-auto" />
                                <h5>No Action Plan Yet</h5>
                                <p className="text-muted mb-3">
                                    Create an action plan to define what will be done and track progress.
                                </p>
                                <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                                    <MdAdd className="me-2" />
                                    Create Action Plan
                                </Button>
                            </Card.Body>
                        </Card>
                    )}
                </Col>

                {/* Right Column - Sidebar */}
                <Col lg={4}>
                    {/* Meta Info */}
                    <Card className="mb-4 shadow-sm">
                        <Card.Header>
                            <Card.Title className="mb-0">Details</Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <div className="mb-3 d-flex align-items-center gap-2 small">
                                <MdPerson size={16} className="text-muted" />
                                <span className="text-muted">Assigned to:</span>
                                <span className="fw-semibold">
                                    {action.assignedTo?.name || action.assigneeName || "Unassigned"}
                                </span>
                            </div>
                            <div className="mb-3 d-flex align-items-center gap-2 small">
                                <MdCalendarToday size={16} className="text-muted" />
                                <span className="text-muted">Due:</span>
                                <span className="fw-semibold">
                                    {action.dueDate
                                        ? new Date(action.dueDate).toLocaleDateString()
                                        : "No due date"}
                                </span>
                            </div>
                            <div className="mb-3 d-flex align-items-center gap-2 small">
                                <MdCalendarToday size={16} className="text-muted" />
                                <span className="text-muted">Created:</span>
                                <span className="fw-semibold">
                                    {action.createdAt
                                        ? new Date(action.createdAt).toLocaleDateString()
                                        : "—"}
                                </span>
                            </div>
                            {plan?.primaryOwner && (
                                <div className="d-flex align-items-center gap-2 small">
                                    <MdGroup size={16} className="text-muted" />
                                    <span className="text-muted">Plan Owner:</span>
                                    <span className="fw-semibold">{plan.primaryOwner.name}</span>
                                </div>
                            )}
                        </Card.Body>
                    </Card>

                    {/* Evidence */}
                    {action.evidence?.respondentCount > 0 && (
                        <Card className="mb-4 shadow-sm">
                            <Card.Header className="d-flex align-items-center gap-2">
                                <MdComment size={16} />
                                <Card.Title className="mb-0">Evidence</Card.Title>
                            </Card.Header>
                            <Card.Body>
                                <h3 className="text-primary fw-bold mb-1">
                                    {action.evidence.respondentCount}
                                </h3>
                                <p className="text-muted small mb-0">respondents affected</p>

                                {action.evidence.commentExcerpts?.length > 0 && (
                                    <div className="mt-3">
                                        <strong className="small text-muted d-block mb-2">Sample Comments:</strong>
                                        {action.evidence.commentExcerpts.slice(0, 3).map((excerpt, idx) => (
                                            <div key={idx} className="bg-light p-2 rounded mb-2">
                                                <small className="text-muted fst-italic">
                                                    "{excerpt.text}"
                                                </small>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    )}

                    {/* Priority Rationale */}
                    {(action.priorityReason || action.urgencyReason) && (
                        <Card className="shadow-sm">
                            <Card.Header>
                                <Card.Title className="mb-0">Priority Rationale</Card.Title>
                            </Card.Header>
                            <Card.Body>
                                {action.priorityReason && (
                                    <div className="mb-3">
                                        <strong className="small text-muted d-block mb-1">Why this priority?</strong>
                                        <p className="small mb-0">{action.priorityReason}</p>
                                    </div>
                                )}
                                {action.urgencyReason && (
                                    <div>
                                        <strong className="small text-muted d-block mb-1">Why urgent?</strong>
                                        <p className="small mb-0">{action.urgencyReason}</p>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    )}
                </Col>
            </Row>

            {/* Create Plan Modal */}
            <CreatePlanModal
                show={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSubmit={handleCreatePlan}
                isLoading={actionLoading}
            />
        </Container>
    );
};

export default ActionDetailPage;
