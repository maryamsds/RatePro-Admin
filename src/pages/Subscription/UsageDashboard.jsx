// src/pages/Subscription/UsageDashboard.jsx
// Usage visualization dashboard for company admins

import React, { useState, useEffect } from 'react';
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

const STATUS_ICON_BG = {
    success: 'bg-[var(--success-color)]/10 dark:bg-[var(--success-color)]/20',
    warning: 'bg-[var(--warning-color)]/10 dark:bg-[var(--warning-color)]/20',
    danger: 'bg-[var(--danger-color)]/10 dark:bg-[var(--danger-color)]/20',
};

const STATUS_ICON_COLOR = {
    success: 'text-[var(--success-color)]',
    warning: 'text-[var(--warning-color)]',
    danger: 'text-[var(--danger-color)]',
};

const STATUS_PROGRESS_BG = {
    success: 'bg-[var(--success-color)]',
    warning: 'bg-[var(--warning-color)]',
    danger: 'bg-[var(--danger-color)]',
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
            <div className="w-full py-12 text-center">
                <div className="w-12 h-12 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="mt-2 text-[var(--text-secondary)]">Loading usage data...</p>
            </div>
        );
    }

    if (!usageData) {
        return (
            <div className="w-full py-12">
                <div className="flex items-center gap-2 p-4 bg-[var(--warning-color)]/10 dark:bg-[var(--warning-color)]/20 border border-[var(--warning-color)] rounded-md text-[var(--light-text)] dark:text-[var(--dark-text)]">
                    <MdWarning className="text-xl text-[var(--warning-color)]" />
                    Unable to load usage data. Please try again.
                </div>
            </div>
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
        <div className="w-full px-4 py-4">
            {/* Header */}
            <div className="mb-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">
                            <MdBarChart className="text-[var(--primary-color)]" />
                            Usage Dashboard
                        </h1>
                        <p className="text-[var(--text-secondary)] mb-0">
                            Monitor your subscription usage and limits
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1.5 bg-[var(--primary-color)] text-white rounded-full text-sm font-medium">
                            {subscription?.planName || subscription?.planCode || 'Free'} Plan
                        </span>
                        <span className={`px-3 py-1.5 rounded-full text-sm font-medium text-white ${subscription?.billing?.status === 'active' ? 'bg-[var(--success-color)]' : 'bg-[var(--warning-color)]'}`}>
                            {subscription?.billing?.status || 'Unknown'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Warning Alert */}
            {hasWarnings && (
                <div className="flex items-center gap-2 p-4 mb-4 bg-[var(--warning-color)]/10 dark:bg-[var(--warning-color)]/20 border border-[var(--warning-color)] rounded-md text-[var(--light-text)] dark:text-[var(--dark-text)]">
                    <MdWarning className="text-xl flex-shrink-0 text-[var(--warning-color)]" />
                    <div>
                        <strong>Usage Warning!</strong> Some of your limits are approaching their maximum.
                        Consider upgrading your plan to avoid disruptions.
                    </div>
                </div>
            )}

            {/* Last Reset Info */}
            <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md mb-4 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                <div className="py-2 px-4 flex justify-between items-center">
                    <small className="text-[var(--text-secondary)] flex items-center gap-1">
                        <MdAutorenew />
                        Usage resets on the 1st of each month
                    </small>
                    <small className="text-[var(--text-secondary)]">
                        Last reset: {usageData.lastResetAt
                            ? new Date(usageData.lastResetAt).toLocaleDateString()
                            : 'Never'}
                    </small>
                </div>
            </div>

            {/* Usage Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Object.entries(limits).map(([key, data]) => {
                    const Icon = LIMIT_ICONS[key] || MdBarChart;
                    const label = LIMIT_LABELS[key] || key.replace(/_/g, ' ');
                    const isUnlimited = data.limit === 'unlimited' || data.limit === -1;
                    const percentage = isUnlimited ? 0 : getUsagePercentage(data.current, data.limit);
                    const status = isUnlimited ? 'success' : getUsageStatus(percentage);

                    return (
                        <div key={key} className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)] p-4">
                            <div className="flex justify-between items-start mb-3">
                                <div className={`rounded-lg p-2 ${STATUS_ICON_BG[status] || 'bg-gray-500/10 dark:bg-gray-500/20'}`}>
                                    <Icon className={`text-xl ${STATUS_ICON_COLOR[status] || 'text-gray-500'}`} />
                                </div>
                                {percentage >= 80 && !isUnlimited && (
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white ${STATUS_PROGRESS_BG[status] || 'bg-gray-500'}`}>
                                        <MdWarning /> {percentage >= 100 ? 'Limit Reached' : 'Warning'}
                                    </span>
                                )}
                                {isUnlimited && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--success-color)] text-white">
                                        <MdCheck /> Unlimited
                                    </span>
                                )}
                            </div>

                            <h6 className="text-[var(--text-secondary)] mb-2 text-sm">{label}</h6>

                            <div className="flex items-baseline mb-2">
                                <span className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)] mr-2">{data.current.toLocaleString()}</span>
                                <span className="text-[var(--text-secondary)]">
                                    / {isUnlimited ? '∞' : data.limit.toLocaleString()}
                                </span>
                            </div>

                            {!isUnlimited && (
                                <>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                                        <div
                                            className={`h-2 rounded-full transition-all ${STATUS_PROGRESS_BG[status] || 'bg-gray-500'}`}
                                            style={{ width: `${Math.min(percentage, 100)}%` }}
                                        />
                                    </div>
                                    <small className="text-[var(--text-secondary)]">
                                        {data.remaining !== undefined
                                            ? `${data.remaining.toLocaleString()} remaining`
                                            : `${percentage}% used`}
                                    </small>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Quick Stats from subscription usage */}
            {usageData.usage && (
                <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md mt-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                    <div className="px-4 py-3 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                        <h5 className="font-semibold m-0 text-[var(--light-text)] dark:text-[var(--dark-text)]">This Month's Activity</h5>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-0 md:divide-x divide-[var(--light-border)] dark:divide-[var(--dark-border)]">
                        <div className="text-center py-4">
                            <div className="w-12 h-12 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center mx-auto mb-2">
                                <MdInsertChart className="text-3xl text-blue-500" />
                            </div>
                            <h4 className="text-xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">{usageData.usage.surveysThisMonth || 0}</h4>
                            <small className="text-[var(--text-secondary)]">Surveys Created</small>
                        </div>
                        <div className="text-center py-4">
                            <div className="w-12 h-12 rounded-lg bg-[var(--success-color)]/10 dark:bg-[var(--success-color)]/20 flex items-center justify-center mx-auto mb-2">
                                <MdBarChart className="text-3xl text-[var(--success-color)]" />
                            </div>
                            <h4 className="text-xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">{usageData.usage.responsesThisMonth || 0}</h4>
                            <small className="text-[var(--text-secondary)]">Responses Collected</small>
                        </div>
                        <div className="text-center py-4">
                            <div className="w-12 h-12 rounded-lg bg-cyan-500/10 dark:bg-cyan-500/20 flex items-center justify-center mx-auto mb-2">
                                <MdEmail className="text-3xl text-cyan-500" />
                            </div>
                            <h4 className="text-xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">{usageData.usage.emailsSentThisMonth || 0}</h4>
                            <small className="text-[var(--text-secondary)]">Emails Sent</small>
                        </div>
                        <div className="text-center py-4">
                            <div className="w-12 h-12 rounded-lg bg-[var(--warning-color)]/10 dark:bg-[var(--warning-color)]/20 flex items-center justify-center mx-auto mb-2">
                                <MdSms className="text-3xl text-[var(--warning-color)]" />
                            </div>
                            <h4 className="text-xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">{usageData.usage.smsSentThisMonth || 0}</h4>
                            <small className="text-[var(--text-secondary)]">SMS Sent</small>
                        </div>
                    </div>
                </div>
            )}

            {/* Upgrade CTA if limits are being reached */}
            {hasWarnings && (
                <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md mt-6 overflow-hidden border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                    <div className="text-center py-6 px-4" style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    }}>
                        <h4 className="text-xl font-bold mb-2 text-white">Need more capacity?</h4>
                        <p className="mb-4 text-white/75">
                            Upgrade your plan to unlock higher limits and premium features.
                        </p>
                        <a 
                            href="/app/subscription/my-plan" 
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-800 rounded-md font-semibold hover:bg-gray-100 transition-colors"
                        >
                            <MdTrendingUp />
                            Upgrade Now
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsageDashboard;
