// src/pages/Subscription/MyPlans.jsx
// Company admin billing and subscription management

import React, { useState, useEffect } from 'react';
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

const STATUS_BAR_BG = {
  success: 'bg-[var(--success-color)]',
  warning: 'bg-[var(--warning-color)]',
  danger: 'bg-[var(--danger-color)]',
};

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
      <div className="w-full py-12 text-center">
        <div className="w-12 h-12 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-2 text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-60">Loading your subscription...</p>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">
              <MdCreditCard className="text-[var(--primary-color)]" />
              My Plan
            </h1>
            <p className="text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-60 mb-0">
              View your current plan and manage your subscription
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchData}
              disabled={actionLoading}
              className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] border border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-[var(--light-border)] dark:hover:bg-[var(--dark-border)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <MdRefresh /> Refresh
            </button>
            {subscription?.payment?.gateway === 'stripe' && (
              <button
                onClick={handleBillingPortal}
                disabled={actionLoading}
                className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] border border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-[var(--light-border)] dark:hover:bg-[var(--dark-border)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <MdPayment /> Billing Portal
              </button>
            )}
          </div>
        </div>
      </div>
      {/* Current Plan Card */}
      <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md mb-6 overflow-hidden border border-[var(--primary-color)]">
        <div className="bg-gradient-to-r from-[var(--primary-color)] to-[var(--info-color)] py-6 px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center px-3 py-1 bg-white dark:bg-gray-800 text-[var(--light-text)] dark:text-[var(--dark-text)] rounded-full text-sm font-medium mb-2">
                Current Plan
              </span>
              <h2 className="text-2xl font-bold mb-1 text-white">{subscription?.planName || subscription?.planCode || 'Free'}</h2>
              <p className="opacity-90 mb-0 flex items-center gap-2 flex-wrap text-white">
                Status: <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${subscription?.billing?.status === 'active' ? 'bg-[var(--success-color)]' : 'bg-[var(--warning-color)]'} text-white`}>
                  {subscription?.billing?.status || 'Unknown'}
                </span>
                {subscription?.billing?.cycle && (
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-white dark:bg-gray-800 text-[var(--light-text)] dark:text-[var(--dark-text)]">{subscription.billing.cycle} billing</span>
                )}
              </p>
              {subscription?.billing?.currentPeriodEnd && (
                <small className="opacity-90 text-white">
                  Renews: {new Date(subscription.billing.currentPeriodEnd).toLocaleDateString()}
                </small>
              )}
            </div>
            <div>
              {subscription?.billing?.status === 'active' && currentPlanCode !== 'free' && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-md font-medium transition-colors bg-white/20 hover:bg-white/30 text-white border border-white/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <MdCancel /> Cancel Subscription
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Usage Summary */}
      {usageData?.limits && Object.keys(usageData.limits).length > 0 && (
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md mb-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div className="px-4 py-3 border-b border-[var(--light-border)] dark:border-[var(--dark-border)] flex justify-between items-center">
            <h5 className="font-semibold m-0 text-[var(--light-text)] dark:text-[var(--dark-text)]">Usage This Month</h5>
            <a href="/app/subscription/usage" className="text-[var(--primary-color)] text-sm hover:underline">View Details </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
            {Object.entries(usageData.limits).slice(0, 4).map(([key, data]) => {
              const isUnlimited = data.limit === 'unlimited' || data.limit === -1;
              const pct = isUnlimited ? 0 : getUsagePercentage(data.current, data.limit);
              const status = getUsageStatus(pct);
              const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

              return (
                <div key={key}>
                  <div className="flex justify-between mb-1">
                    <small className="text-[var(--light-text)] dark:text-[var(--dark-text)]">{label}</small>
                    <small className="text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-60">
                      {data.current} / {isUnlimited ? '' : data.limit}
                    </small>
                  </div>
                  <div className="w-full bg-[var(--light-border)] dark:bg-[var(--dark-border)] rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${STATUS_BAR_BG[status] || 'bg-[var(--light-border)] dark:bg-[var(--dark-border)]'}`}
                      style={{ width: `${isUnlimited ? 0 : Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Plans */}
      <h4 className="text-lg font-semibold mb-4 text-[var(--light-text)] dark:text-[var(--dark-text)]">Available Plans</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.filter(p => p.isActive).map(plan => {
          const isCurrent = plan.code === currentPlanCode;
          const isUpgrade = isPlanUpgrade(plan.code);
          const isDowngrade = isPlanDowngrade(plan.code);

          return (
            <div key={plan._id} className={`bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border flex flex-col h-full relative hover:shadow-lg transition-shadow ${isCurrent ? 'border-[var(--primary-color)] border-2' : 'border-[var(--light-border)] dark:border-[var(--dark-border)]'}`}>
              {plan.badge && (
                <div className="absolute top-0 right-0 m-2">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-[var(--warning-color)] text-white">
                    <MdStar /> {plan.badge}
                  </span>
                </div>
              )}
              {isCurrent && (
                <div className="absolute top-0 left-0 m-2">
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-[var(--primary-color)] text-white">Current</span>
                </div>
              )}
              <div className="text-center pt-6 pb-2">
                <h4 className="text-lg font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">{plan.name}</h4>
              </div>
              <div className="text-center py-2 flex-grow">
                <div className="mb-3">
                  <span className="text-3xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">${plan.pricing?.monthly || 0}</span>
                  <span className="text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-60">/mo</span>
                </div>
                {plan.pricing?.yearly > 0 && (
                  <small className="text-[var(--success-color)] block mb-3">
                    ${plan.pricing.yearly}/year (save {Math.round((1 - plan.pricing.yearly / (plan.pricing.monthly * 12)) * 100)}%)
                  </small>
                )}

                {/* Key features */}
                <div className="text-left text-sm px-4 mb-4">
                  {plan.features?.slice(0, 6).map(f => {
                    const def = featureDefinitions[f.featureCode];
                    if (!def) return null;

                    return (
                      <div key={f.featureCode} className="flex items-start gap-2 py-1">
                        {f.enabled || f.limitValue > 0 || f.limitValue === -1 ? (
                          <MdCheck className="text-[var(--success-color)] flex-shrink-0 mt-0.5" />
                        ) : (
                          <MdClose className="text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-40 flex-shrink-0 mt-0.5" />
                        )}
                        <span className="text-[var(--light-text)] dark:text-[var(--dark-text)]">
                          {def.name}
                          {def.type === 'limit' && f.limitValue !== null && (
                            <span className="ml-1 px-1.5 py-0.5 bg-[var(--light-border)] dark:bg-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)] rounded text-xs">
                              {f.limitValue === -1 ? '∞' : f.limitValue}
                            </span>
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="text-center pb-4 px-4">
                {isCurrent ? (
                  <button disabled className="w-full px-4 py-2 rounded-md font-medium transition-colors bg-[var(--success-color)] text-white opacity-80 cursor-not-allowed flex items-center justify-center gap-1">
                    <MdCheck /> Current Plan
                  </button>
                ) : isUpgrade ? (
                  <button
                    onClick={() => handleUpgrade(plan.code)}
                    disabled={actionLoading}
                    className="w-full px-4 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                  >
                    <MdRocketLaunch /> Upgrade
                  </button>
                ) : isDowngrade ? (
                  <button
                    onClick={() => handleDowngrade(plan.code)}
                    disabled={actionLoading}
                    className="w-full px-4 py-2 rounded-md font-medium transition-colors bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] border border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-[var(--light-border)] dark:hover:bg-[var(--dark-border)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                  >
                    <MdArrowDownward /> Downgrade
                  </button>
                ) : (
                  <button
                    onClick={() => handleCheckout(plan.code, 'monthly')}
                    disabled={actionLoading}
                    className="w-full px-4 py-2 rounded-md font-medium transition-colors bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--primary-color)] border border-[var(--primary-color)] hover:bg-[var(--primary-color)] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Select Plan
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Cancel Subscription Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowCancelModal(false)}>
          <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-2xl w-full max-w-md overflow-hidden border border-[var(--light-border)] dark:border-[var(--dark-border)]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <h5 className="text-lg font-semibold m-0 text-[var(--light-text)] dark:text-[var(--dark-text)]">Cancel Subscription</h5>
              <button onClick={() => setShowCancelModal(false)} className="p-1 hover:bg-[var(--light-border)] dark:hover:bg-[var(--dark-border)] rounded-full transition-colors text-[var(--light-text)] dark:text-[var(--dark-text)] text-2xl leading-none">×</button>
            </div>
            <div className="p-4">
              <div className="p-3 bg-[var(--warning-color)]/10 border border-[var(--warning-color)]/30 rounded-md text-[var(--light-text)] dark:text-[var(--dark-text)] mb-3">
                Are you sure you want to cancel your subscription?
              </div>
              <p className="text-[var(--light-text)] dark:text-[var(--dark-text)]">You have two options:</p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleCancel(false)}
                  disabled={actionLoading}
                  className="px-4 py-3 rounded-md font-medium transition-colors bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] border border-[var(--warning-color)] hover:bg-[var(--warning-color)]/10 disabled:opacity-50 disabled:cursor-not-allowed text-left"
                >
                  Cancel at End of Billing Period
                  <br />
                  <small className="text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-60">Keep access until {
                    subscription?.billing?.currentPeriodEnd
                      ? new Date(subscription.billing.currentPeriodEnd).toLocaleDateString()
                      : 'period ends'
                  }</small>
                </button>
                <button
                  onClick={() => handleCancel(true)}
                  disabled={actionLoading}
                  className="px-4 py-3 rounded-md font-medium transition-colors bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] border border-[var(--danger-color)] hover:bg-[var(--danger-color)]/10 disabled:opacity-50 disabled:cursor-not-allowed text-left"
                >
                  Cancel Immediately
                  <br />
                  <small className="text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-60">Lose access now (no refund)</small>
                </button>
              </div>
            </div>
            <div className="flex justify-end p-4 border-t border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <button onClick={() => setShowCancelModal(false)} className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] border border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-[var(--light-border)] dark:hover:bg-[var(--dark-border)]">
                Keep Subscription
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPlans;
