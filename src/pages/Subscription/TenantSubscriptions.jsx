// src/pages/Subscription/TenantSubscriptions.jsx
// Admin screen for managing all tenant subscriptions

import React, { useState, useEffect } from 'react';
import {
    MdRefresh, MdSearch, MdFilterList, MdBusiness,
    MdCheck, MdClose, MdEdit, MdStar, MdWarning,
    MdCreditCard
} from 'react-icons/md';
import Swal from 'sweetalert2';
import {
    getAllTenantSubscriptions,
    getPlanTemplates,
    getFeatureDefinitions,
    applyPlanToTenant,
    setTenantCustomFeature
} from '../../api/services/subscriptionService';

const STATUS_BADGE = {
    active: 'bg-[var(--success-color)] text-white',
    trialing: 'bg-[var(--info-color)] text-white',
    past_due: 'bg-[var(--warning-color)] text-white',
    cancelled: 'bg-[var(--danger-color)] text-white',
    unpaid: 'bg-[var(--danger-color)] text-white'
};

const TenantSubscriptions = () => {
    const [subscriptions, setSubscriptions] = useState([]);
    const [plans, setPlans] = useState([]);
    const [features, setFeatures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterPlan, setFilterPlan] = useState('');

    // Modals
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showApplyPlanModal, setShowApplyPlanModal] = useState(false);
    const [showCustomFeatureModal, setShowCustomFeatureModal] = useState(false);
    const [selectedSubscription, setSelectedSubscription] = useState(null);

    // Form states
    const [selectedPlanCode, setSelectedPlanCode] = useState('');
    const [customFeatureData, setCustomFeatureData] = useState({
        featureCode: '',
        value: '',
        expiresAt: ''
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, [filterStatus, filterPlan]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [subsRes, plansRes, featuresRes] = await Promise.all([
                getAllTenantSubscriptions({ status: filterStatus, planCode: filterPlan, limit: 50 }),
                getPlanTemplates(),
                getFeatureDefinitions()
            ]);

            setSubscriptions(subsRes.data?.subscriptions || []);
            setPagination(subsRes.data?.pagination || { current: 1, pages: 1, total: 0 });
            setPlans(plansRes.data || []);
            setFeatures(featuresRes.data || []);
        } catch (error) {
            Swal.fire('Error', 'Failed to load subscriptions', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (subscription) => {
        setSelectedSubscription(subscription);
        setShowDetailModal(true);
    };

    const handleOpenApplyPlan = (subscription) => {
        setSelectedSubscription(subscription);
        setSelectedPlanCode(subscription.planCode || '');
        setShowApplyPlanModal(true);
    };

    const handleApplyPlan = async () => {
        if (!selectedPlanCode) {
            Swal.fire('Error', 'Please select a plan', 'error');
            return;
        }

        setSaving(true);
        try {
            await applyPlanToTenant(selectedSubscription.tenant._id || selectedSubscription.tenant, selectedPlanCode);
            Swal.fire('Success!', 'Plan applied successfully', 'success');
            setShowApplyPlanModal(false);
            fetchData();
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Failed to apply plan', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleOpenCustomFeature = (subscription) => {
        setSelectedSubscription(subscription);
        setCustomFeatureData({ featureCode: '', value: '', expiresAt: '' });
        setShowCustomFeatureModal(true);
    };

    const handleSetCustomFeature = async () => {
        if (!customFeatureData.featureCode || customFeatureData.value === '') {
            Swal.fire('Error', 'Please select a feature and set a value', 'error');
            return;
        }

        setSaving(true);
        try {
            const featureDef = features.find(f => f.code === customFeatureData.featureCode);
            const value = featureDef?.type === 'boolean'
                ? customFeatureData.value === 'true'
                : parseInt(customFeatureData.value);

            await setTenantCustomFeature(
                selectedSubscription.tenant._id || selectedSubscription.tenant,
                {
                    featureCode: customFeatureData.featureCode,
                    value,
                    expiresAt: customFeatureData.expiresAt || null
                }
            );
            Swal.fire('Success!', 'Custom feature set successfully', 'success');
            setShowCustomFeatureModal(false);
            fetchData();
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Failed to set feature', 'error');
        } finally {
            setSaving(false);
        }
    };

    const getFeatureDisplay = (featureCode, featureData) => {
        const def = features.find(f => f.code === featureCode);
        if (!def) return null;

        if (def.type === 'boolean') {
            return featureData.enabled
                ? <MdCheck className="text-[var(--success-color)]" />
                : <MdClose className="text-[var(--text-secondary)]" />;
        }

        const value = featureData.limitValue;
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${value === -1 ? 'bg-[var(--success-color)] text-white' : 'bg-[var(--secondary-color)] text-white'}`}>
                {value === -1 ? '∞' : value}
                {featureData.customValue !== null && (
                    <MdStar className="text-[var(--warning-color)]" title="Custom override" />
                )}
            </span>
        );
    };

    // Filter subscriptions by search
    const filteredSubscriptions = subscriptions.filter(sub => {
        const tenantName = sub.tenant?.name || '';
        const tenantEmail = sub.tenant?.contactEmail || '';
        return tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tenantEmail.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="w-full px-4 py-4">
            {/* Header */}
            <div className="mb-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">
                            <MdBusiness className="text-[var(--primary-color)]" />
                            Tenant Subscriptions
                        </h1>
                        <p className="text-[var(--text-secondary)] mt-1">
                            View and manage all tenant subscriptions
                        </p>
                    </div>
                    <button 
                        onClick={fetchData} 
                        className="flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors bg-[var(--secondary-color)] text-white hover:opacity-90"
                    >
                        <MdRefresh /> Refresh
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-[var(--success-light)] flex items-center justify-center">
                            <MdCheck className="text-2xl text-[var(--success-color)]" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">{subscriptions.filter(s => s.billing?.status === 'active').length}</p>
                            <p className="text-sm text-[var(--text-secondary)]">Active</p>
                        </div>
                    </div>
                </div>
                <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-[var(--info-light)] flex items-center justify-center">
                            <MdCreditCard className="text-2xl text-[var(--info-color)]" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">{subscriptions.filter(s => s.billing?.status === 'trialing').length}</p>
                            <p className="text-sm text-[var(--text-secondary)]">Trialing</p>
                        </div>
                    </div>
                </div>
                <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-[var(--warning-light)] flex items-center justify-center">
                            <MdWarning className="text-2xl text-[var(--warning-color)]" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">{subscriptions.filter(s => s.billing?.status === 'past_due').length}</p>
                            <p className="text-sm text-[var(--text-secondary)]">Past Due</p>
                        </div>
                    </div>
                </div>
                <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-[var(--danger-light)] flex items-center justify-center">
                            <MdClose className="text-2xl text-[var(--danger-color)]" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">{subscriptions.filter(s => s.billing?.status === 'cancelled').length}</p>
                            <p className="text-sm text-[var(--text-secondary)]">Cancelled</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md mb-6 border border-[var(--light-border)] dark:border-[var(--dark-border)] p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-md overflow-hidden">
                        <span className="px-3 bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--text-secondary)] border-r border-[var(--light-border)] dark:border-[var(--dark-border)]"><MdSearch /></span>
                        <input
                            type="text"
                            className="w-full px-3 py-2 bg-transparent outline-none text-[var(--light-text)] dark:text-[var(--dark-text)]"
                            placeholder="Search by tenant name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-md overflow-hidden">
                        <span className="px-3 bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--text-secondary)] border-r border-[var(--light-border)] dark:border-[var(--dark-border)]"><MdFilterList /></span>
                        <select
                            className="w-full px-3 py-2 bg-transparent outline-none text-[var(--light-text)] dark:text-[var(--dark-text)]"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="trialing">Trialing</option>
                            <option value="past_due">Past Due</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                    <div className="flex items-center border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-md overflow-hidden">
                        <span className="px-3 bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--text-secondary)] border-r border-[var(--light-border)] dark:border-[var(--dark-border)]"><MdCreditCard /></span>
                        <select
                            className="w-full px-3 py-2 bg-transparent outline-none text-[var(--light-text)] dark:text-[var(--dark-text)]"
                            value={filterPlan}
                            onChange={(e) => setFilterPlan(e.target.value)}
                        >
                            <option value="">All Plans</option>
                            {plans.map(p => (
                                <option key={p._id} value={p.code}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Subscriptions Table */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="w-12 h-12 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-2 text-[var(--text-secondary)]">Loading subscriptions...</p>
                </div>
            ) : filteredSubscriptions.length === 0 ? (
                <div className="flex items-center gap-2 p-4 bg-[var(--info-light)] border border-[var(--info-color)] rounded-md text-[var(--light-text)] dark:text-[var(--dark-text)]">
                    No subscriptions found.
                </div>
            ) : (
                <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse">
                            <thead className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                                <tr>
                                    <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">Tenant</th>
                                    <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">Plan</th>
                                    <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">Status</th>
                                    <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">Billing Cycle</th>
                                    <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">Usage</th>
                                    <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">Period End</th>
                                    <th className="p-3 text-center text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-[var(--light-card)] dark:bg-[var(--dark-card)]">
                                {filteredSubscriptions.map(sub => (
                                    <tr key={sub._id} className="border-b border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] transition-colors">
                                        <td className="p-3 text-[var(--light-text)] dark:text-[var(--dark-text)]">
                                            <div>
                                                <div className="font-semibold">{sub.tenant?.name || 'Unknown'}</div>
                                                <div className="text-xs text-[var(--text-secondary)]">{sub.tenant?.contactEmail}</div>
                                            </div>
                                        </td>
                                        <td className="p-3 text-[var(--light-text)] dark:text-[var(--dark-text)]">
                                            <span className="px-2 py-0.5 bg-[var(--primary-color)] text-white rounded-full text-xs font-medium">{sub.planCode || 'Free'}</span>
                                        </td>
                                        <td className="p-3 text-[var(--light-text)] dark:text-[var(--dark-text)]">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[sub.billing?.status] || 'bg-[var(--secondary-color)] text-white'}`}>
                                                {sub.billing?.status || 'unknown'}
                                            </span>
                                        </td>
                                        <td className="p-3 text-[var(--light-text)] dark:text-[var(--dark-text)]">{sub.billing?.cycle || 'N/A'}</td>
                                        <td className="p-3 text-[var(--light-text)] dark:text-[var(--dark-text)]">
                                            <div className="text-xs">
                                                <span>Responses: </span>
                                                <span className="font-semibold">
                                                    {sub.usage?.responsesThisMonth || 0} /
                                                    {sub.features?.find(f => f.featureCode === 'max_responses_monthly')?.limitValue === -1
                                                        ? '∞'
                                                        : sub.features?.find(f => f.featureCode === 'max_responses_monthly')?.limitValue || 0}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-3 text-[var(--light-text)] dark:text-[var(--dark-text)]">
                                            {sub.billing?.currentPeriodEnd
                                                ? new Date(sub.billing.currentPeriodEnd).toLocaleDateString()
                                                : 'N/A'}
                                        </td>
                                        <td className="p-3 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    onClick={() => handleViewDetails(sub)}
                                                    title="View Details"
                                                    className="p-1.5 border border-[var(--info-color)] text-[var(--info-color)] rounded hover:bg-[var(--info-light)] transition-colors"
                                                >
                                                    <MdSearch />
                                                </button>
                                                <button
                                                    onClick={() => handleOpenApplyPlan(sub)}
                                                    title="Change Plan"
                                                    className="p-1.5 border border-[var(--primary-color)] text-[var(--primary-color)] rounded hover:bg-[var(--primary-light)] transition-colors"
                                                >
                                                    <MdCreditCard />
                                                </button>
                                                <button
                                                    onClick={() => handleOpenCustomFeature(sub)}
                                                    title="Custom Feature"
                                                    className="p-1.5 border border-[var(--warning-color)] text-[var(--warning-color)] rounded hover:bg-[var(--warning-light)] transition-colors"
                                                >
                                                    <MdStar />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {showDetailModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowDetailModal(false)}>
                    <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                            <h5 className="text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)] m-0">
                                Subscription Details: {selectedSubscription?.tenant?.name}
                            </h5>
                            <button onClick={() => setShowDetailModal(false)} className="p-1 hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] rounded-full transition-colors text-xl text-[var(--light-text)] dark:text-[var(--dark-text)]">×</button>
                        </div>
                        <div className="p-4">
                            {selectedSubscription && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h5 className="font-semibold mb-2 text-[var(--light-text)] dark:text-[var(--dark-text)]">Billing Information</h5>
                                        <table className="w-full text-sm border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded">
                                            <tbody>
                                                <tr className="border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                                                    <td className="px-3 py-2 font-semibold bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)]">Plan</td>
                                                    <td className="px-3 py-2 text-[var(--light-text)] dark:text-[var(--dark-text)]">
                                                        <span className="px-2 py-0.5 bg-[var(--primary-color)] text-white rounded-full text-xs">{selectedSubscription.planCode}</span>
                                                    </td>
                                                </tr>
                                                <tr className="border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                                                    <td className="px-3 py-2 font-semibold bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)]">Status</td>
                                                    <td className="px-3 py-2 text-[var(--light-text)] dark:text-[var(--dark-text)]">
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[selectedSubscription.billing?.status] || 'bg-[var(--secondary-color)] text-white'}`}>
                                                            {selectedSubscription.billing?.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                                <tr className="border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                                                    <td className="px-3 py-2 font-semibold bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)]">Billing Cycle</td>
                                                    <td className="px-3 py-2 text-[var(--light-text)] dark:text-[var(--dark-text)]">{selectedSubscription.billing?.cycle}</td>
                                                </tr>
                                                <tr className="border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                                                    <td className="px-3 py-2 font-semibold bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)]">Period End</td>
                                                    <td className="px-3 py-2 text-[var(--light-text)] dark:text-[var(--dark-text)]">
                                                        {selectedSubscription.billing?.currentPeriodEnd
                                                            ? new Date(selectedSubscription.billing.currentPeriodEnd).toLocaleDateString()
                                                            : 'N/A'}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="px-3 py-2 font-semibold bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)]">Gateway</td>
                                                    <td className="px-3 py-2 text-[var(--light-text)] dark:text-[var(--dark-text)]">{selectedSubscription.payment?.gateway || 'None'}</td>
                                                </tr>
                                            </tbody>
                                        </table>

                                        <h5 className="font-semibold mb-2 mt-4 text-[var(--light-text)] dark:text-[var(--dark-text)]">Usage This Month</h5>
                                        <table className="w-full text-sm border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded">
                                            <tbody>
                                                <tr className="border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                                                    <td className="px-3 py-2 text-[var(--light-text)] dark:text-[var(--dark-text)]">Surveys</td>
                                                    <td className="px-3 py-2 text-[var(--light-text)] dark:text-[var(--dark-text)]">{selectedSubscription.usage?.surveysThisMonth || 0}</td>
                                                </tr>
                                                <tr className="border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                                                    <td className="px-3 py-2 text-[var(--light-text)] dark:text-[var(--dark-text)]">Responses</td>
                                                    <td className="px-3 py-2 text-[var(--light-text)] dark:text-[var(--dark-text)]">{selectedSubscription.usage?.responsesThisMonth || 0}</td>
                                                </tr>
                                                <tr className="border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                                                    <td className="px-3 py-2 text-[var(--light-text)] dark:text-[var(--dark-text)]">Emails Sent</td>
                                                    <td className="px-3 py-2 text-[var(--light-text)] dark:text-[var(--dark-text)]">{selectedSubscription.usage?.emailsSentThisMonth || 0}</td>
                                                </tr>
                                                <tr>
                                                    <td className="px-3 py-2 text-[var(--light-text)] dark:text-[var(--dark-text)]">SMS Sent</td>
                                                    <td className="px-3 py-2 text-[var(--light-text)] dark:text-[var(--dark-text)]">{selectedSubscription.usage?.smsSentThisMonth || 0}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div>
                                        <h5 className="font-semibold mb-2 text-[var(--light-text)] dark:text-[var(--dark-text)]">Active Features</h5>
                                        <div className="max-h-96 overflow-y-auto">
                                            {selectedSubscription.features?.map(f => {
                                                const def = features.find(fd => fd.code === f.featureCode);
                                                return (
                                                    <div key={f.featureCode} className="flex justify-between items-center border-b border-[var(--light-border)] dark:border-[var(--dark-border)] py-2">
                                                        <span className="flex items-center gap-1 text-[var(--light-text)] dark:text-[var(--dark-text)]">
                                                            {def?.name || f.featureCode}
                                                            {f.customValue !== null && (
                                                                <MdStar className="text-[var(--warning-color)]" title="Custom override" />
                                                            )}
                                                        </span>
                                                        {getFeatureDisplay(f.featureCode, f)}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end p-4 border-t border-[var(--light-border)] dark:border-[var(--dark-border)]">
                            <button onClick={() => setShowDetailModal(false)} className="px-4 py-2 bg-[var(--secondary-color)] text-white rounded-md hover:opacity-90 transition-colors">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Apply Plan Modal */}
            {showApplyPlanModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowApplyPlanModal(false)}>
                    <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-lg w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                            <h5 className="text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)] m-0">Apply Plan to {selectedSubscription?.tenant?.name}</h5>
                            <button onClick={() => setShowApplyPlanModal(false)} className="p-1 hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] rounded-full transition-colors text-xl text-[var(--light-text)] dark:text-[var(--dark-text)]">×</button>
                        </div>
                        <div className="p-4">
                            <div className="mb-3">
                                <label className="block text-sm font-medium mb-1 text-[var(--light-text)] dark:text-[var(--dark-text)]">Select Plan</label>
                                <select
                                    className="w-full px-3 py-2 border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-md bg-transparent outline-none focus:border-[var(--primary-color)] text-[var(--light-text)] dark:text-[var(--dark-text)]"
                                    value={selectedPlanCode}
                                    onChange={(e) => setSelectedPlanCode(e.target.value)}
                                >
                                    <option value="">-- Select Plan --</option>
                                    {plans.filter(p => p.isActive).map(plan => (
                                        <option key={plan._id} value={plan.code}>
                                            {plan.name} (${plan.pricing?.monthly}/mo)
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center gap-2 p-3 bg-[var(--warning-light)] border border-[var(--warning-color)] rounded-md text-[var(--light-text)] dark:text-[var(--dark-text)] text-sm">
                                <MdWarning className="flex-shrink-0 text-[var(--warning-color)]" />
                                This will immediately update the tenant's features to match the selected plan.
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 p-4 border-t border-[var(--light-border)] dark:border-[var(--dark-border)]">
                            <button onClick={() => setShowApplyPlanModal(false)} className="px-4 py-2 bg-[var(--secondary-color)] text-white rounded-md hover:opacity-90 transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleApplyPlan} disabled={saving} className="px-4 py-2 bg-[var(--primary-color)] text-white rounded-md hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-50">
                                {saving ? (
                                    <span className="flex items-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                        Applying...
                                    </span>
                                ) : 'Apply Plan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Feature Modal */}
            {showCustomFeatureModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowCustomFeatureModal(false)}>
                    <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-lg w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                            <h5 className="text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)] m-0">Set Custom Feature for {selectedSubscription?.tenant?.name}</h5>
                            <button onClick={() => setShowCustomFeatureModal(false)} className="p-1 hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] rounded-full transition-colors text-xl text-[var(--light-text)] dark:text-[var(--dark-text)]">×</button>
                        </div>
                        <div className="p-4">
                            <div className="mb-3">
                                <label className="block text-sm font-medium mb-1 text-[var(--light-text)] dark:text-[var(--dark-text)]">Feature</label>
                                <select
                                    className="w-full px-3 py-2 border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-md bg-transparent outline-none focus:border-[var(--primary-color)] text-[var(--light-text)] dark:text-[var(--dark-text)]"
                                    value={customFeatureData.featureCode}
                                    onChange={(e) => setCustomFeatureData({ ...customFeatureData, featureCode: e.target.value, value: '' })}
                                >
                                    <option value="">-- Select Feature --</option>
                                    {features.map(f => (
                                        <option key={f._id} value={f.code}>
                                            {f.name} ({f.type})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {customFeatureData.featureCode && (
                                <div className="mb-3">
                                    <label className="block text-sm font-medium mb-1 text-[var(--light-text)] dark:text-[var(--dark-text)]">Value</label>
                                    {features.find(f => f.code === customFeatureData.featureCode)?.type === 'boolean' ? (
                                        <select
                                            className="w-full px-3 py-2 border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-md bg-transparent outline-none focus:border-[var(--primary-color)] text-[var(--light-text)] dark:text-[var(--dark-text)]"
                                            value={customFeatureData.value}
                                            onChange={(e) => setCustomFeatureData({ ...customFeatureData, value: e.target.value })}
                                        >
                                            <option value="">-- Select --</option>
                                            <option value="true">Enabled</option>
                                            <option value="false">Disabled</option>
                                        </select>
                                    ) : (
                                        <input
                                            type="number"
                                            className="w-full px-3 py-2 border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-md bg-transparent outline-none focus:border-[var(--primary-color)] text-[var(--light-text)] dark:text-[var(--dark-text)]"
                                            value={customFeatureData.value}
                                            onChange={(e) => setCustomFeatureData({ ...customFeatureData, value: e.target.value })}
                                            placeholder="Enter limit value (-1 for unlimited)"
                                        />
                                    )}
                                </div>
                            )}

                            <div className="mb-3">
                                <label className="block text-sm font-medium mb-1 text-[var(--light-text)] dark:text-[var(--dark-text)]">Expires At (optional)</label>
                                <input
                                    type="date"
                                    className="w-full px-3 py-2 border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-md bg-transparent outline-none focus:border-[var(--primary-color)] text-[var(--light-text)] dark:text-[var(--dark-text)]"
                                    value={customFeatureData.expiresAt}
                                    onChange={(e) => setCustomFeatureData({ ...customFeatureData, expiresAt: e.target.value })}
                                />
                                <small className="text-[var(--text-secondary)]">Leave empty for permanent override</small>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 p-4 border-t border-[var(--light-border)] dark:border-[var(--dark-border)]">
                            <button onClick={() => setShowCustomFeatureModal(false)} className="px-4 py-2 bg-[var(--secondary-color)] text-white rounded-md hover:opacity-90 transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleSetCustomFeature} disabled={saving} className="px-4 py-2 bg-[var(--warning-color)] text-white rounded-md hover:opacity-90 transition-colors disabled:opacity-50">
                                {saving ? (
                                    <span className="flex items-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                        Setting...
                                    </span>
                                ) : 'Set Custom Feature'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TenantSubscriptions;
