// src/api/services/subscriptionService.js
// Centralized API service for subscription system

import axiosInstance from '../axiosInstance';

// ============ ADMIN: Feature Definitions ============

/**
 * Get all feature definitions (admin)
 */
export const getFeatureDefinitions = async () => {
    const response = await axiosInstance.get('/admin/subscription/features');
    return response.data;
};

/**
 * Create a new feature definition (admin)
 */
export const createFeatureDefinition = async (data) => {
    const response = await axiosInstance.post('/admin/subscription/features', data);
    return response.data;
};

/**
 * Update a feature definition (admin)
 */
export const updateFeatureDefinition = async (id, data) => {
    const response = await axiosInstance.put(`/admin/subscription/features/${id}`, data);
    return response.data;
};

/**
 * Delete a feature definition (admin)
 */
export const deleteFeatureDefinition = async (id) => {
    const response = await axiosInstance.delete(`/admin/subscription/features/${id}`);
    return response.data;
};

// ============ ADMIN: Plan Templates ============

/**
 * Get all plan templates (admin)
 */
export const getPlanTemplates = async () => {
    const response = await axiosInstance.get('/admin/subscription/plans');
    return response.data;
};

/**
 * Get a single plan template (admin)
 */
export const getPlanTemplate = async (id) => {
    const response = await axiosInstance.get(`/admin/subscription/plans/${id}`);
    return response.data;
};

/**
 * Create a new plan template (admin)
 */
export const createPlanTemplate = async (data) => {
    const response = await axiosInstance.post('/admin/subscription/plans', data);
    return response.data;
};

/**
 * Update a plan template (admin)
 */
export const updatePlanTemplate = async (id, data) => {
    const response = await axiosInstance.put(`/admin/subscription/plans/${id}`, data);
    return response.data;
};

/**
 * Delete a plan template (admin)
 */
export const deletePlanTemplate = async (id) => {
    const response = await axiosInstance.delete(`/admin/subscription/plans/${id}`);
    return response.data;
};

// ============ ADMIN: Tenant Subscriptions ============

/**
 * Get all tenant subscriptions (admin)
 * @param {Object} params - { page, limit, status, planCode }
 */
export const getAllTenantSubscriptions = async (params = {}) => {
    const response = await axiosInstance.get('/admin/subscription/subscriptions', { params });
    return response.data;
};

/**
 * Set custom feature for a tenant (admin)
 * @param {string} tenantId
 * @param {Object} data - { featureCode, value, expiresAt }
 */
export const setTenantCustomFeature = async (tenantId, data) => {
    const response = await axiosInstance.post(`/admin/subscription/subscriptions/${tenantId}/features`, data);
    return response.data;
};

/**
 * Apply a plan to a tenant (admin)
 * @param {string} tenantId
 * @param {string} planCode
 */
export const applyPlanToTenant = async (tenantId, planCode) => {
    const response = await axiosInstance.post(`/admin/subscription/subscriptions/${tenantId}/apply-plan`, { planCode });
    return response.data;
};

// ============ PUBLIC: Plans ============

/**
 * Get public plans (for pricing page)
 */
export const getPublicPlans = async () => {
    const response = await axiosInstance.get('/subscriptions/plans');
    return response.data;
};

/**
 * Compare two plans
 * @param {string} fromPlan
 * @param {string} toPlan
 */
export const comparePlans = async (fromPlan, toPlan) => {
    const response = await axiosInstance.get('/subscriptions/compare', {
        params: { from: fromPlan, to: toPlan }
    });
    return response.data;
};

// ============ COMPANY ADMIN: Subscription Management ============

/**
 * Get current subscription
 */
export const getCurrentSubscription = async () => {
    const response = await axiosInstance.get('/subscriptions/current');
    return response.data;
};

/**
 * Get usage report
 */
export const getUsageReport = async () => {
    const response = await axiosInstance.get('/subscriptions/usage');
    return response.data;
};

/**
 * Subscribe to a plan (for free/manual plans)
 * @param {string} planCode
 * @param {string} billingCycle - 'monthly' or 'yearly'
 */
export const subscribeToPlan = async (planCode, billingCycle = 'monthly') => {
    const response = await axiosInstance.post('/subscriptions/subscribe', { planCode, billingCycle });
    return response.data;
};

/**
 * Create Stripe checkout session
 * @param {string} planCode
 * @param {string} billingCycle - 'monthly' or 'yearly'
 * @param {string} successUrl
 * @param {string} cancelUrl
 */
export const createCheckoutSession = async (planCode, billingCycle = 'monthly', successUrl, cancelUrl) => {
    const response = await axiosInstance.post('/subscriptions/checkout', {
        planCode,
        billingCycle,
        successUrl,
        cancelUrl
    });
    return response.data;
};

/**
 * Upgrade plan (instant)
 * @param {string} planCode
 */
export const upgradePlan = async (planCode) => {
    const response = await axiosInstance.post('/subscriptions/upgrade', { planCode });
    return response.data;
};

/**
 * Downgrade plan (at end of billing period)
 * @param {string} planCode
 */
export const downgradePlan = async (planCode) => {
    const response = await axiosInstance.post('/subscriptions/downgrade', { planCode });
    return response.data;
};

/**
 * Cancel subscription
 * @param {boolean} immediate - Cancel immediately or at period end
 */
export const cancelSubscription = async (immediate = false) => {
    const response = await axiosInstance.post('/subscriptions/cancel', { immediate });
    return response.data;
};

/**
 * Get Stripe billing portal URL
 * @param {string} returnUrl
 */
export const getBillingPortalUrl = async (returnUrl) => {
    const response = await axiosInstance.get('/subscriptions/billing-portal', {
        params: { returnUrl }
    });
    return response.data;
};

// ============ Helper Functions ============

/**
 * Get usage percentage for a limit
 * @param {number} current
 * @param {number|string} limit
 */
export const getUsagePercentage = (current, limit) => {
    if (limit === 'unlimited' || limit === -1) return 0;
    return Math.min(100, Math.round((current / limit) * 100));
};

/**
 * Get usage status based on percentage
 * @param {number} percentage
 * @returns {'success' | 'warning' | 'danger'}
 */
export const getUsageStatus = (percentage) => {
    if (percentage >= 100) return 'danger';
    if (percentage >= 80) return 'warning';
    return 'success';
};

/**
 * Format limit value for display
 * @param {number|string} limit
 * @param {string} unit
 */
export const formatLimit = (limit, unit = '') => {
    if (limit === 'unlimited' || limit === -1) return '∞';
    return `${limit.toLocaleString()}${unit ? ` ${unit}` : ''}`;
};

export default {
    // Admin - Features
    getFeatureDefinitions,
    createFeatureDefinition,
    updateFeatureDefinition,
    deleteFeatureDefinition,
    // Admin - Plans
    getPlanTemplates,
    getPlanTemplate,
    createPlanTemplate,
    updatePlanTemplate,
    deletePlanTemplate,
    // Admin - Tenants
    getAllTenantSubscriptions,
    setTenantCustomFeature,
    applyPlanToTenant,
    // Public
    getPublicPlans,
    comparePlans,
    // Company Admin
    getCurrentSubscription,
    getUsageReport,
    subscribeToPlan,
    createCheckoutSession,
    upgradePlan,
    downgradePlan,
    cancelSubscription,
    getBillingPortalUrl,
    // Helpers
    getUsagePercentage,
    getUsageStatus,
    formatLimit
};
