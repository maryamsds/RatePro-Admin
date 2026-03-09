// src/pages/Subscription/MyPlans.jsx
// Company admin billing and subscription management

import React, { useState, useEffect } from 'react';
import {
  MdCheck, MdClose, MdStar, MdRocketLaunch, MdCreditCard,
  MdRefresh, MdPayment, MdCancel, MdInfo
} from 'react-icons/md';
import Swal from 'sweetalert2';
import {
  getMyPlan,
  getPublicPlans,
  upgradePlan,
  previewUpgrade,
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
  const [myPlanData, setMyPlanData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Upgrade preview modal state
  const [previewModal, setPreviewModal] = useState({ open: false, planCode: null, data: null, loading: false });

  // Cancel modal
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getMyPlan();
      setMyPlanData(res.data);
    } catch (error) {
      console.error('Failed to load plan data:', error);
      Swal.fire('Error', 'Failed to load your plan details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ─── Upgrade Preview → Confirm Flow ───
  const handleUpgradeClick = async (planCode) => {
    // Open preview modal and fetch proration data
    setPreviewModal({ open: true, planCode, data: null, loading: true });
    try {
      const res = await previewUpgrade(planCode);
      setPreviewModal(prev => ({ ...prev, data: res.data, loading: false }));
    } catch (error) {
      console.error('Preview upgrade failed:', error);
      setPreviewModal(prev => ({ ...prev, loading: false }));
      Swal.fire('Error', error.response?.data?.message || 'Failed to preview upgrade.', 'error');
    }
  };

  const handleUpgradeConfirm = async () => {
    const { planCode } = previewModal;
    setPreviewModal(prev => ({ ...prev, open: false }));
    setActionLoading(true);

    try {
      const res = await upgradePlan(planCode, myPlanData?.billing?.cycle || 'monthly');

      if (res.action === 'checkout' && res.data?.url) {
        // Free→Paid: redirect to Stripe Checkout
        window.location.href = res.data.url;
        return;
      }

      // In-place upgrade succeeded
      Swal.fire('Upgraded!', res.message || 'Your plan has been upgraded successfully.', 'success');
      fetchData();
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Upgrade failed.', 'error');
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

  // ─── Derived values ───
  const currentPlanCode = myPlanData?.currentPlan?.code;
  const allPlans = myPlanData?.allPlans || [];
  const featureDefinitions = myPlanData?.featureDefinitions || {};
  const usageData = myPlanData?.usage || {};
  const billing = myPlanData?.billing || {};
  const payment = myPlanData?.payment || {};
  const currentPlanIndex = allPlans.findIndex(p => p.code === currentPlanCode);

  const isPlanUpgrade = (planCode) => {
    const planIndex = allPlans.findIndex(p => p.code === planCode);
    return planIndex > currentPlanIndex;
  };

  if (loading) {
    return (
      <div className="w-full py-12 text-center">
        <div className="w-12 h-12 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-2 text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-60">Loading your subscription...</p>
      </div>
    );
  }

  if (!myPlanData) {
    return (
      <div className="w-full py-12 text-center">
        <p className="text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-60">No subscription data available.</p>
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
            {payment?.gateway === 'stripe' && (
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
              <h2 className="text-2xl font-bold mb-1 text-white">{myPlanData?.currentPlan?.name || currentPlanCode || 'Free'}</h2>
              <p className="opacity-90 mb-0 flex items-center gap-2 flex-wrap text-white">
                Status: <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${billing?.status === 'active' ? 'bg-[var(--success-color)]' : 'bg-[var(--warning-color)]'} text-white`}>
                  {billing?.status || 'Unknown'}
                </span>
                {billing?.cycle && (
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-white dark:bg-gray-800 text-[var(--light-text)] dark:text-[var(--dark-text)]">{billing.cycle} billing</span>
                )}
              </p>
              {/* Plan price */}
              {myPlanData?.currentPlan?.pricing && myPlanData.currentPlan.pricing.monthly > 0 && (
                <p className="text-white opacity-90 mt-1 mb-0">
                  <span className="text-lg font-bold">
                    ${billing?.cycle === 'yearly' ? myPlanData.currentPlan.pricing.yearly : myPlanData.currentPlan.pricing.monthly}
                  </span>
                  <span className="text-sm">/{billing?.cycle === 'yearly' ? 'year' : 'month'}</span>
                </p>
              )}
              {billing?.nextBillingDate && (
                <small className="opacity-90 text-white">
                  Next billing: {new Date(billing.nextBillingDate).toLocaleDateString()}
                </small>
              )}
            </div>
            <div>
              {billing?.status === 'active' && currentPlanCode !== 'free' && (
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
      {Object.keys(usageData).length > 0 && (
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md mb-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div className="px-4 py-3 border-b border-[var(--light-border)] dark:border-[var(--dark-border)] flex justify-between items-center">
            <h5 className="font-semibold m-0 text-[var(--light-text)] dark:text-[var(--dark-text)]">Usage This Month</h5>
            <a href="/app/subscription/usage" className="text-[var(--primary-color)] text-sm hover:underline">View Details </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
            {Object.entries(usageData).slice(0, 4).map(([key, data]) => {
              const isUnlimited = data.limit === 'unlimited' || data.limit === -1;
              const pct = isUnlimited ? 0 : getUsagePercentage(data.current, data.limit);
              const status = getUsageStatus(pct);
              const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

              return (
                <div key={key}>
                  <div className="flex justify-between mb-1">
                    <small className="text-[var(--light-text)] dark:text-[var(--dark-text)]">{label}</small>
                    <small className="text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-60">
                      {data.current} / {isUnlimited ? '∞' : data.limit}
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
        {allPlans.filter(p => p.isPublic !== false).map(plan => {
          const isCurrent = plan.code === currentPlanCode;
          const isUpgrade = isPlanUpgrade(plan.code);

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
                    onClick={() => handleUpgradeClick(plan.code)}
                    disabled={actionLoading}
                    className="w-full px-4 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                  >
                    <MdRocketLaunch /> Upgrade
                  </button>
                ) : (
                  // Lower-tier plan — disabled (no downgrade for now)
                  <button
                    disabled
                    className="w-full px-4 py-2 rounded-md font-medium bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-40 border border-[var(--light-border)] dark:border-[var(--dark-border)] cursor-not-allowed flex items-center justify-center gap-1"
                  >
                    <MdCheck /> Included
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Upgrade Preview Modal */}
      {previewModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setPreviewModal({ open: false, planCode: null, data: null, loading: false })}>
          <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-2xl w-full max-w-md overflow-hidden border border-[var(--light-border)] dark:border-[var(--dark-border)]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <h5 className="text-lg font-semibold m-0 text-[var(--light-text)] dark:text-[var(--dark-text)] flex items-center gap-2">
                <MdRocketLaunch className="text-[var(--primary-color)]" /> Upgrade Preview
              </h5>
              <button onClick={() => setPreviewModal({ open: false, planCode: null, data: null, loading: false })} className="p-1 hover:bg-[var(--light-border)] dark:hover:bg-[var(--dark-border)] rounded-full transition-colors text-[var(--light-text)] dark:text-[var(--dark-text)] text-2xl leading-none">×</button>
            </div>
            <div className="p-5">
              {previewModal.loading ? (
                <div className="text-center py-6">
                  <div className="w-10 h-10 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="mt-3 text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-60">Calculating proration...</p>
                </div>
              ) : previewModal.data ? (
                <div>
                  <div className="flex items-center justify-between mb-4 p-3 bg-[var(--light-border)]/30 dark:bg-[var(--dark-border)]/30 rounded-md">
                    <div className="text-center">
                      <small className="text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-60 block">From</small>
                      <strong className="text-[var(--light-text)] dark:text-[var(--dark-text)]">{previewModal.data.currentPlan}</strong>
                    </div>
                    <span className="text-[var(--primary-color)] text-xl">→</span>
                    <div className="text-center">
                      <small className="text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-60 block">To</small>
                      <strong className="text-[var(--primary-color)]">{previewModal.data.newPlan}</strong>
                    </div>
                  </div>

                  {!previewModal.data.isNewSubscription ? (
                    <>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-[var(--light-text)] dark:text-[var(--dark-text)]">
                          <span>Credit (unused time)</span>
                          <span className="text-[var(--success-color)] font-medium">-${previewModal.data.credit.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-[var(--light-text)] dark:text-[var(--dark-text)]">
                          <span>New plan charge</span>
                          <span className="font-medium">${previewModal.data.charge.toFixed(2)}</span>
                        </div>
                        <hr className="border-[var(--light-border)] dark:border-[var(--dark-border)]" />
                        <div className="flex justify-between text-[var(--light-text)] dark:text-[var(--dark-text)] font-bold text-lg">
                          <span>Total due today</span>
                          <span className="text-[var(--primary-color)]">${previewModal.data.total.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="p-3 bg-[var(--info-color)]/10 border border-[var(--info-color)]/30 rounded-md text-sm text-[var(--light-text)] dark:text-[var(--dark-text)] mb-4 flex items-start gap-2">
                        <MdInfo className="text-[var(--info-color)] flex-shrink-0 mt-0.5" />
                        <span>{previewModal.data.message}</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center mb-4">
                      <p className="text-3xl font-bold text-[var(--primary-color)]">${previewModal.data.total}</p>
                      <p className="text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-60">per {previewModal.data.billingCycle === 'yearly' ? 'year' : 'month'}</p>
                      <div className="p-3 bg-[var(--info-color)]/10 border border-[var(--info-color)]/30 rounded-md text-sm text-[var(--light-text)] dark:text-[var(--dark-text)] mt-4 flex items-start gap-2">
                        <MdInfo className="text-[var(--info-color)] flex-shrink-0 mt-0.5" />
                        <span>You'll be redirected to Stripe Checkout to complete payment.</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-center text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-60">Failed to load preview. Please try again.</p>
              )}
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <button
                onClick={() => setPreviewModal({ open: false, planCode: null, data: null, loading: false })}
                className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] border border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-[var(--light-border)] dark:hover:bg-[var(--dark-border)]"
              >
                Cancel
              </button>
              <button
                onClick={handleUpgradeConfirm}
                disabled={!previewModal.data || previewModal.loading}
                className="px-5 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <MdRocketLaunch /> {previewModal.data?.isNewSubscription ? 'Proceed to Checkout' : 'Confirm Upgrade'}
              </button>
            </div>
          </div>
        </div>
      )}

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
                    billing?.currentPeriodEnd
                      ? new Date(billing.currentPeriodEnd).toLocaleDateString()
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
