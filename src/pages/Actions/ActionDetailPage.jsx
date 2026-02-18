// src/pages/Actions/ActionDetailPage.jsx
// ============================================================================
// Action Detail Page - Full-page workspace for action management
// Implements human confirmation workflow for action plans
// Uses Tailwind v4 with theme.md design system
// ============================================================================
"use client"
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    MdAssignment, MdCheckCircle, MdSchedule, MdTimer,
    MdPriorityHigh, MdWarning, MdFlag, MdPerson,
    MdPlayArrow, MdArrowBack, MdAdd, MdError,
    MdTrendingUp, MdTrendingDown, MdRemove,
    MdDescription, MdTrackChanges, MdComment,
    MdGroup, MdCalendarToday, MdDone, MdRefresh, MdClose
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
// Sub-components (Tailwind v4 + theme.md)
// ============================================================================

// Priority Badge
const PriorityBadge = ({ priority }) => {
    const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG[ACTION_PRIORITIES.MEDIUM];
    const colorMap = {
        danger: "bg-[var(--danger-color)] text-white",
        warning: "bg-[var(--warning-color)] text-white",
        info: "bg-[var(--info-color)] text-white",
        primary: "bg-[var(--primary-color)] text-white",
        success: "bg-[var(--success-color)] text-white",
    };
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${colorMap[config.color] || "bg-gray-500 text-white"}`}>
            <MdPriorityHigh size={14} />
            {config.label?.toUpperCase() || priority?.toUpperCase() || "MEDIUM"}
        </span>
    );
};

// Status Badge
const StatusBadge = ({ status }) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG[ACTION_STATUSES.PENDING];
    const colorMap = {
        danger: "bg-[var(--danger-color)] text-white",
        warning: "bg-[var(--warning-color)] text-white",
        info: "bg-[var(--info-color)] text-white",
        primary: "bg-[var(--primary-color)] text-white",
        success: "bg-[var(--success-color)] text-white",
        secondary: "bg-gray-500 text-white",
    };
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${colorMap[config.color] || "bg-gray-500 text-white"}`}>
            <MdSchedule size={14} />
            {config.label?.toUpperCase() || status?.replace("-", " ").toUpperCase() || "PENDING"}
        </span>
    );
};

// Plan Status Badge
const PlanStatusBadge = ({ status }) => {
    const statusConfig = {
        draft: { color: "bg-gray-500 text-white", label: "Draft" },
        approved: { color: "bg-[var(--success-color)] text-white", label: "Approved" },
        in_progress: { color: "bg-[var(--primary-color)] text-white", label: "In Progress" },
        completed: { color: "bg-[var(--info-color)] text-white", label: "Completed" },
        cancelled: { color: "bg-[var(--danger-color)] text-white", label: "Cancelled" },
    };
    const config = statusConfig[status] || statusConfig.draft;
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${config.color}`}>
            <MdTrackChanges size={14} />
            Plan: {config.label}
        </span>
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
        <div className="flex items-center gap-2 mt-3 text-sm">
            {isUp && <MdTrendingUp size={16} className="text-[var(--danger-color)]" />}
            {isDown && <MdTrendingDown size={16} className="text-[var(--success-color)]" />}
            {!isUp && !isDown && <MdRemove size={16} className="text-[var(--text-secondary)]" />}
            <span className={isUp ? "text-[var(--danger-color)]" : isDown ? "text-[var(--success-color)]" : "text-[var(--text-secondary)]"}>
                {Math.abs(trendData.changePercent)}% vs {trendData.comparisonPeriod}
            </span>
            {trendData.issueStatus && (
                <span className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-[var(--light-text)] dark:text-[var(--dark-text)] text-xs ml-1">
                    {statusLabels[trendData.issueStatus] || trendData.issueStatus}
                </span>
            )}
        </div>
    );
};

// Checklist Step Item (Tailwind styled)
const ChecklistStep = ({ step, onStatusChange, isLoading }) => {
    const stepTypeVariants = {
        review: "bg-[var(--info-color)] text-white",
        analysis: "bg-[var(--primary-color)] text-white",
        action: "bg-[var(--warning-color)] text-white",
        communication: "bg-[var(--success-color)] text-white",
        measurement: "bg-gray-500 text-white",
    };

    const handleComplete = () => onStatusChange(step._id, "completed");
    const handleStart = () => onStatusChange(step._id, "in_progress");

    return (
        <div className={`flex items-start gap-3 p-3 border-b border-[var(--light-border)] dark:border-[var(--dark-border)] ${step.status === "completed" ? "bg-gray-50 dark:bg-gray-800 opacity-75" : "bg-[var(--light-card)] dark:bg-[var(--dark-card)]"}`}>
            {/* Status Icon */}
            <div className="mt-1">
                {isLoading ? (
                    <div className="w-5 h-5 border-2 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin"></div>
                ) : step.status === "completed" ? (
                    <MdCheckCircle size={20} className="text-[var(--success-color)]" />
                ) : step.status === "in_progress" ? (
                    <MdPlayArrow size={20} className="text-[var(--primary-color)]" />
                ) : (
                    <MdSchedule size={20} className="text-[var(--text-secondary)]" />
                )}
            </div>

            {/* Content */}
            <div className="flex-grow">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">{step.stepNumber}. {step.title}</span>
                    <span className={`px-2 py-1 rounded text-xs ${stepTypeVariants[step.stepType] || "bg-gray-500 text-white"}`}>
                        {step.stepType}
                    </span>
                    {step.isRequired && <span className="px-2 py-1 rounded text-xs bg-[var(--danger-color)] text-white">Required</span>}
                </div>
                {step.description && <p className="text-[var(--text-secondary)] text-sm mb-1">{step.description}</p>}
                {step.assignedTo?.name && (
                    <small className="text-[var(--text-secondary)] flex items-center gap-1">
                        <MdPerson size={14} />
                        Assigned to: {step.assignedTo.name}
                    </small>
                )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                {step.status === "pending" && (
                    <button
                        onClick={handleStart}
                        disabled={isLoading}
                        className="px-3 py-1 rounded-md text-sm font-medium border border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-[var(--primary-color)] hover:text-white transition-colors disabled:opacity-50"
                    >
                        Start
                    </button>
                )}
                {step.status === "in_progress" && (
                    <button
                        onClick={handleComplete}
                        disabled={isLoading}
                        className="px-3 py-1 rounded-md text-sm font-medium border border-[var(--success-color)] text-[var(--success-color)] hover:bg-[var(--success-color)] hover:text-white transition-colors disabled:opacity-50"
                    >
                        Complete
                    </button>
                )}
            </div>
        </div>
    );
};

// Create Plan Modal (Tailwind Modal)
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

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                    <h3 className="text-xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)] flex items-center gap-2">
                        <MdAdd />
                        Create Action Plan
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-[var(--text-secondary)] hover:text-[var(--light-text)] dark:hover:text-[var(--dark-text)] transition-colors"
                    >
                        <MdClose size={24} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit}>
                    <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
                        <p className="text-[var(--text-secondary)] text-sm mb-4">
                            Define what will be done and the expected outcome
                        </p>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-2">
                                What will be done? <span className="text-[var(--danger-color)]">*</span>
                            </label>
                            <textarea
                                rows={3}
                                value={formData.whatWillBeDone}
                                onChange={(e) => setFormData({ ...formData, whatWillBeDone: e.target.value })}
                                placeholder="Describe the action plan..."
                                required
                                className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-2">
                                Expected Outcome <span className="text-[var(--danger-color)]">*</span>
                            </label>
                            <textarea
                                rows={2}
                                value={formData.expectedOutcome}
                                onChange={(e) => setFormData({ ...formData, expectedOutcome: e.target.value })}
                                placeholder="What result do you expect?"
                                required
                                className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-2">
                                Target Audience
                            </label>
                            <select
                                value={formData.targetAudience.type}
                                onChange={(e) => setFormData({ ...formData, targetAudience: { type: e.target.value } })}
                                className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                            >
                                <option value="all_employees">All Employees</option>
                                <option value="department">Specific Department</option>
                                <option value="segment">Segment</option>
                                <option value="individuals">Specific Individuals</option>
                            </select>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-2 p-4 border-t border-[var(--light-border)] dark:border-[var(--dark-border)]">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-md font-medium transition-colors bg-gray-500 text-white hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)] disabled:opacity-50 flex items-center gap-2"
                        >
                            {isLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                            Create Plan
                        </button>
                    </div>
                </form>
            </div>
        </div>
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

    // Fetch action and plan data (independently)
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Step 1: Fetch the action itself — this is required
            const actionData = await getActionById(actionId);
            setAction(actionData);

            // Step 2: Fetch plan — independent call, never blocks action display
            // getActionPlan always returns { actionPlan, steps } — never throws for missing plans
            try {
                const { actionPlan, steps: planSteps } = await getActionPlan(actionId);
                setPlan(actionPlan);       // null if no plan exists (legacy actions)
                setSteps(planSteps || []);
            } catch (planErr) {
                // Defensive: should never reach here, but if it does, don't block the page
                console.warn("Plan fetch failed (non-critical):", planErr.message);
                setPlan(null);
                setSteps([]);
            }
        } catch (err) {
            // Only reaches here if getActionById fails — that IS a real error
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
            <div className="py-8">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-3 text-[var(--text-secondary)]">Loading action...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !action) {
        return (
            <div className="py-8">
                <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--danger-color)] text-center">
                    <MdError size={48} className="text-[var(--danger-color)] mb-3 mx-auto" />
                    <h5 className="text-xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)] mb-2">Action Not Found</h5>
                    <p className="text-[var(--text-secondary)] mb-4">{error || "The requested action could not be loaded."}</p>
                    <button
                        onClick={() => navigate("/app/actions")}
                        className="px-4 py-2 rounded-md font-medium transition-colors border border-[var(--danger-color)] text-[var(--danger-color)] hover:bg-[var(--danger-color)] hover:text-white inline-flex items-center gap-2"
                    >
                        <MdArrowBack />
                        Back to Actions
                    </button>
                </div>
            </div>
        );
    }

    const isCompanyAdmin = user?.role === "companyAdmin";
    const progressPercent = plan?.progress?.percentComplete || 0;

    return (
        <div className="py-4">
            {/* Header Card */}
            <div className="mb-4">
                <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                    <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                        <div className="flex-grow">
                            {/* Back Button */}
                            <div className="flex items-center mb-2">
                                <button
                                    onClick={() => navigate("/app/actions")}
                                    className="p-0 text-[var(--primary-color)] hover:underline flex items-center gap-1"
                                >
                                    <MdArrowBack />
                                    Back to Actions
                                </button>
                            </div>

                            {/* Title */}
                            <h3 className="text-2xl font-bold mb-2 text-[var(--light-text)] dark:text-[var(--dark-text)]">{action.title}</h3>

                            {/* Badges Row */}
                            <div className="flex flex-wrap items-center gap-2">
                                <PriorityBadge priority={action.priority} />
                                <StatusBadge status={action.status} />
                                {plan && <PlanStatusBadge status={plan.status} />}
                                {action.department && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-gray-200 dark:bg-gray-700 text-[var(--light-text)] dark:text-[var(--dark-text)]">
                                        <MdGroup />
                                        {action.department || action.category}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2">
                            {!plan && (
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)] flex items-center gap-2"
                                >
                                    <MdAdd size={16} />
                                    Create Plan
                                </button>
                            )}
                            {plan?.status === "draft" && isCompanyAdmin && (
                                <button
                                    onClick={handleConfirmPlan}
                                    disabled={actionLoading}
                                    className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--success-color)] text-white hover:bg-green-600 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {actionLoading ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <MdDone size={16} />
                                    )}
                                    Confirm Plan
                                </button>
                            )}
                            {plan?.status === "approved" && (
                                <button
                                    onClick={handleStartPlan}
                                    disabled={actionLoading}
                                    className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)] disabled:opacity-50 flex items-center gap-2"
                                >
                                    {actionLoading ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <MdPlayArrow size={16} />
                                    )}
                                    Start Execution
                                </button>
                            )}
                            <button
                                onClick={() => fetchData()}
                                className="px-4 py-2 rounded-md font-medium transition-colors border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] flex items-center gap-1"
                            >
                                <MdRefresh size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left Column - Action Details */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Problem Statement */}
                    <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                        <div className="p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)] flex items-center gap-2">
                            <MdWarning size={20} className="text-[var(--warning-color)]" />
                            <h4 className="text-lg font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">Problem Statement</h4>
                        </div>
                        <div className="p-6">
                            <p className="mb-0 text-[var(--light-text)] dark:text-[var(--dark-text)]">
                                {action.problemStatement || action.description || "No problem statement defined."}
                            </p>

                            {action.rootCause?.summary && (
                                <div className="mt-3 p-3 bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] rounded">
                                    <strong className="text-sm text-[var(--text-secondary)]">Root Cause: </strong>
                                    <span className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">{action.rootCause.summary}</span>
                                    {action.rootCause.category && (
                                        <span className="ml-2 px-2 py-1 rounded text-xs bg-gray-500 text-white">
                                            {action.rootCause.category}
                                        </span>
                                    )}
                                </div>
                            )}

                            {action.trendData && <TrendIndicator trendData={action.trendData} />}
                        </div>
                    </div>

                    {/* Action Plan */}
                    {plan ? (
                        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                            <div className="p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <FiTarget size={20} className="text-[var(--primary-color)]" />
                                        <h4 className="text-lg font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">Action Plan</h4>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6">
                                {/* Progress */}
                                <div className="mb-4">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-[var(--text-secondary)]">Progress</span>
                                        <span className="font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">{progressPercent}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-1">
                                        <div
                                            className="bg-[var(--primary-color)] h-2 rounded-full transition-all"
                                            style={{ width: `${progressPercent}%` }}
                                        ></div>
                                    </div>
                                    <small className="text-[var(--text-secondary)]">
                                        {plan.progress?.completedSteps || 0} of {plan.progress?.totalSteps || 0} steps completed
                                    </small>
                                </div>

                                {/* Plan Details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <div className="mb-3">
                                            <strong className="text-sm text-[var(--text-secondary)] block mb-1">What will be done</strong>
                                            <p className="mb-0 text-[var(--light-text)] dark:text-[var(--dark-text)]">{plan.whatWillBeDone}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="mb-3">
                                            <strong className="text-sm text-[var(--text-secondary)] block mb-1">Expected Outcome</strong>
                                            <p className="mb-0 text-[var(--light-text)] dark:text-[var(--dark-text)]">{plan.expectedOutcome}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Checklist */}
                                {steps.length > 0 && (
                                    <>
                                        <h6 className="font-semibold flex items-center gap-2 mb-3 text-[var(--light-text)] dark:text-[var(--dark-text)]">
                                            <FiFileText size={16} />
                                            Checklist ({steps.length} steps)
                                        </h6>
                                        <div className="border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-md overflow-hidden">
                                            {steps.map((step) => (
                                                <ChecklistStep
                                                    key={step._id}
                                                    step={step}
                                                    onStatusChange={handleStepStatusChange}
                                                    isLoading={stepLoading === step._id}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                            <div className="p-6 text-center py-12">
                                <FiTarget size={48} className="text-[var(--text-secondary)] mb-3 mx-auto" />
                                <h5 className="text-xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)] mb-2">No Action Plan Yet</h5>
                                <p className="text-[var(--text-secondary)] mb-4">
                                    Create an action plan to define what will be done and track progress.
                                </p>
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)] inline-flex items-center gap-2"
                                >
                                    <MdAdd />
                                    Create Action Plan
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column - Sidebar */}
                <div className="space-y-4">
                    {/* Meta Info */}
                    <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                        <div className="p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                            <h4 className="text-lg font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">Details</h4>
                        </div>
                        <div className="p-6">
                            <div className="mb-3 flex items-center gap-2 text-sm">
                                <MdPerson size={16} className="text-[var(--text-secondary)]" />
                                <span className="text-[var(--text-secondary)]">Assigned to:</span>
                                <span className="font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">
                                    {action.assignedTo?.name || action.assigneeName || "Unassigned"}
                                </span>
                            </div>
                            <div className="mb-3 flex items-center gap-2 text-sm">
                                <MdCalendarToday size={16} className="text-[var(--text-secondary)]" />
                                <span className="text-[var(--text-secondary)]">Due:</span>
                                <span className="font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">
                                    {action.dueDate
                                        ? new Date(action.dueDate).toLocaleDateString()
                                        : "No due date"}
                                </span>
                            </div>
                            <div className="mb-3 flex items-center gap-2 text-sm">
                                <MdCalendarToday size={16} className="text-[var(--text-secondary)]" />
                                <span className="text-[var(--text-secondary)]">Created:</span>
                                <span className="font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">
                                    {action.createdAt
                                        ? new Date(action.createdAt).toLocaleDateString()
                                        : "—"}
                                </span>
                            </div>
                            {plan?.primaryOwner && (
                                <div className="flex items-center gap-2 text-sm">
                                    <MdGroup size={16} className="text-[var(--text-secondary)]" />
                                    <span className="text-[var(--text-secondary)]">Plan Owner:</span>
                                    <span className="font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">{plan.primaryOwner.name}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Evidence */}
                    {action.evidence?.respondentCount > 0 && (
                        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                            <div className="p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)] flex items-center gap-2">
                                <MdComment size={16} className="text-[var(--primary-color)]" />
                                <h4 className="text-lg font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">Evidence</h4>
                            </div>
                            <div className="p-6">
                                <h3 className="text-3xl font-bold mb-1 text-[var(--primary-color)]">
                                    {action.evidence.respondentCount}
                                </h3>
                                <p className="text-[var(--text-secondary)] text-sm mb-0">respondents affected</p>

                                {action.evidence.commentExcerpts?.length > 0 && (
                                    <div className="mt-3">
                                        <strong className="text-sm text-[var(--text-secondary)] block mb-2">Sample Comments:</strong>
                                        {action.evidence.commentExcerpts.slice(0, 3).map((excerpt, idx) => (
                                            <div key={idx} className="bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] p-2 rounded mb-2">
                                                <small className="text-[var(--text-secondary)] italic">
                                                    "{excerpt.text}"
                                                </small>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Priority Rationale */}
                    {(action.priorityReason || action.urgencyReason) && (
                        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                            <div className="p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                                <h4 className="text-lg font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">Priority Rationale</h4>
                            </div>
                            <div className="p-6">
                                {action.priorityReason && (
                                    <div className="mb-3">
                                        <strong className="text-sm text-[var(--text-secondary)] block mb-1">Why this priority?</strong>
                                        <p className="text-sm mb-0 text-[var(--light-text)] dark:text-[var(--dark-text)]">{action.priorityReason}</p>
                                    </div>
                                )}
                                {action.urgencyReason && (
                                    <div>
                                        <strong className="text-sm text-[var(--text-secondary)] block mb-1">Why urgent?</strong>
                                        <p className="text-sm mb-0 text-[var(--light-text)] dark:text-[var(--dark-text)]">{action.urgencyReason}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Plan Modal */}
            <CreatePlanModal
                show={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSubmit={handleCreatePlan}
                isLoading={actionLoading}
            />
        </div>
    );
};

export default ActionDetailPage;
