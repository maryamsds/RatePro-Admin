// src/pages/Subscription/PlanBuilder.jsx
// Admin screen for managing plan templates with dynamic features

import React, { useState, useEffect } from 'react';
import {
  MdAdd, MdEdit, MdDelete, MdRefresh, MdSearch, MdSave,
  MdCheck, MdClose, MdToggleOn, MdToggleOff, MdCreditCard,
  MdStar, MdAttachMoney
} from 'react-icons/md';
import Swal from 'sweetalert2';
import {
  getFeatureDefinitions,
  getPlanTemplates,
  createPlanTemplate,
  updatePlanTemplate,
  deletePlanTemplate
} from '../../api/services/subscriptionService';

const CATEGORIES = [
  { value: 'core', label: 'Core', color: 'bg-blue-500' },
  { value: 'analytics', label: 'Analytics', color: 'bg-cyan-500' },
  { value: 'distribution', label: 'Distribution', color: 'bg-green-500' },
  { value: 'branding', label: 'Branding', color: 'bg-yellow-500' },
  { value: 'automation', label: 'Automation', color: 'bg-red-500' },
  { value: 'integration', label: 'Integration', color: 'bg-gray-500' },
  { value: 'support', label: 'Support', color: 'bg-gray-800' }
];

const PlanBuilder = () => {
  const [plans, setPlans] = useState([]);
  const [featureDefinitions, setFeatureDefinitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    pricing: { monthly: 0, yearly: 0, currency: 'USD' },
    features: [],
    trial: { enabled: false, days: 14 },
    isPublic: true,
    isActive: true,
    displayOrder: 0,
    badge: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [plansRes, featuresRes] = await Promise.all([
        getPlanTemplates(),
        getFeatureDefinitions()
      ]);
      setPlans(plansRes.data || []);
      setFeatureDefinitions(featuresRes.data || []);
    } catch (error) {
      Swal.fire('Error', 'Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingPlan(null);
    const defaultFeatures = featureDefinitions.map(fd => ({
      featureCode: fd.code,
      enabled: fd.type === 'boolean' ? fd.defaultValue : true,
      limitValue: fd.type === 'limit' ? fd.defaultValue : null
    }));

    setFormData({
      code: '',
      name: '',
      description: '',
      pricing: { monthly: 0, yearly: 0, currency: 'USD' },
      features: defaultFeatures,
      trial: { enabled: false, days: 14 },
      isPublic: true,
      isActive: true,
      displayOrder: plans.length,
      badge: ''
    });
    setShowModal(true);
  };

  const handleOpenEdit = (plan) => {
    setEditingPlan(plan);
    const mergedFeatures = featureDefinitions.map(fd => {
      const existingFeature = plan.features?.find(f => f.featureCode === fd.code);
      return existingFeature || {
        featureCode: fd.code,
        enabled: false,
        limitValue: fd.type === 'limit' ? 0 : null
      };
    });

    setFormData({
      code: plan.code,
      name: plan.name,
      description: plan.description || '',
      pricing: plan.pricing || { monthly: 0, yearly: 0, currency: 'USD' },
      features: mergedFeatures,
      trial: plan.trial || { enabled: false, days: 14 },
      isPublic: plan.isPublic !== false,
      isActive: plan.isActive !== false,
      displayOrder: plan.displayOrder || 0,
      badge: plan.badge || ''
    });
    setShowModal(true);
  };

  const handleFeatureToggle = (featureCode) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map(f =>
        f.featureCode === featureCode
          ? { ...f, enabled: !f.enabled }
          : f
      )
    }));
  };

  const handleLimitChange = (featureCode, value) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map(f =>
        f.featureCode === featureCode
          ? { ...f, limitValue: value === '' ? 0 : (value === '-1' ? -1 : parseInt(value)) }
          : f
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const filteredFeatures = formData.features.filter(f => {
        const def = featureDefinitions.find(fd => fd.code === f.featureCode);
        if (def?.type === 'boolean') return f.enabled;
        if (def?.type === 'limit') return true;
        return false;
      });

      const data = {
        ...formData,
        features: filteredFeatures
      };

      if (editingPlan) {
        await updatePlanTemplate(editingPlan._id, data);
        Swal.fire('Updated!', 'Plan updated successfully', 'success');
      } else {
        await createPlanTemplate(data);
        Swal.fire('Created!', 'Plan created successfully', 'success');
      }

      setShowModal(false);
      fetchData();
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Operation failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (plan) => {
    const result = await Swal.fire({
      title: 'Delete Plan?',
      text: `This will delete "${plan.name}". This cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await deletePlanTemplate(plan._id);
        Swal.fire('Deleted!', 'Plan has been deleted.', 'success');
        fetchData();
      } catch (error) {
        Swal.fire('Error', error.response?.data?.message || 'Delete failed', 'error');
      }
    }
  };

  const getFeatureDef = (code) => featureDefinitions.find(fd => fd.code === code);
  const getFeatureValue = (code) => formData.features.find(f => f.featureCode === code);

  const featuresByCategory = CATEGORIES.reduce((acc, cat) => {
    acc[cat.value] = featureDefinitions.filter(fd => fd.category === cat.value);
    return acc;
  }, {});

  const filteredPlans = plans.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const countEnabledFeatures = (plan) => {
    return plan.features?.filter(f => {
      const def = getFeatureDef(f.featureCode);
      if (def?.type === 'boolean') return f.enabled;
      return f.limitValue > 0 || f.limitValue === -1;
    }).length || 0;
  };

  return (
    <div className="w-full px-4 py-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">
              <MdCreditCard className="text-[var(--primary-color)]" />
              Plan Builder
            </h1>
            <p className="text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-70 mt-1">
              Create and manage subscription plans with dynamic features
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchData} className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] border border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)]">
              <MdRefresh className="inline mr-1" /> Refresh
            </button>
            <button onClick={handleOpenCreate} disabled={featureDefinitions.length === 0} className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed">
              <MdAdd className="inline mr-1" /> Create Plan
            </button>
          </div>
        </div>
      </div>

      {featureDefinitions.length === 0 && !loading && (
        <div className="flex items-center gap-2 p-4 mb-4 bg-[var(--light-card)] dark:bg-[var(--dark-card)] border-l-4 border-[var(--warning-color)] rounded-md shadow-md">
          <span className="text-[var(--warning-color)]">⚠</span>
          <span className="text-[var(--light-text)] dark:text-[var(--dark-text)]">
            No features defined yet. Please create features first before building plans.
          </span>
        </div>
      )}

      {/* Search */}
      <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md mb-4 border border-[var(--light-border)] dark:border-[var(--dark-border)] p-6">
        <div className="max-w-md">
          <div className="flex items-center border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-md overflow-hidden bg-[var(--light-bg)] dark:bg-[var(--dark-bg)]">
            <span className="px-3 text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-50 border-r border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <MdSearch />
            </span>
            <input
              type="text"
              className="w-full px-3 py-2 bg-transparent text-[var(--light-text)] dark:text-[var(--dark-text)] outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
              placeholder="Search plans..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-70">Loading plans...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPlans.map(plan => (
            <div key={plan._id} className={`bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)] flex flex-col h-full relative transition-opacity ${!plan.isActive ? 'opacity-50' : ''}`}>
              {plan.badge && (
                <div className="absolute top-0 right-0 m-2 z-10">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[var(--warning-color)] text-white rounded-full text-xs font-medium shadow-md">
                    <MdStar /> {plan.badge}
                  </span>
                </div>
              )}
              <div className="text-center py-4 rounded-t-md" style={{
                background: plan.isActive 
                  ? 'linear-gradient(135deg, var(--primary-color) 0%, #667eea 100%)' 
                  : 'var(--light-border)',
                color: 'white'
              }}>
                <h4 className="text-lg font-bold mb-0">{plan.name}</h4>
                <small className="opacity-75">({plan.code})</small>
              </div>
              <div className="p-4 flex-grow">
                {/* Pricing */}
                <div className="text-center mb-3">
                  <div className="flex items-center justify-center">
                    <MdAttachMoney className="text-[var(--success-color)] text-2xl" />
                    <span className="text-3xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">{plan.pricing?.monthly || 0}</span>
                    <span className="text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-70">/mo</span>
                  </div>
                  {plan.pricing?.yearly > 0 && (
                    <small className="text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-70">
                      ${plan.pricing.yearly}/year (save {Math.round((1 - plan.pricing.yearly / (plan.pricing.monthly * 12)) * 100)}%)
                    </small>
                  )}
                </div>

                {/* Features summary */}
                <div className="mb-3">
                  <small className="text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-70 flex justify-between">
                    <span>Features included</span>
                    <strong className="text-[var(--light-text)] dark:text-[var(--dark-text)]">{countEnabledFeatures(plan)} / {featureDefinitions.length}</strong>
                  </small>
                  <div className="w-full bg-[var(--light-border)] dark:bg-[var(--dark-border)] rounded-full h-1 mt-1">
                    <div
                      className="h-1 rounded-full bg-[var(--success-color)]"
                      style={{ width: `${(countEnabledFeatures(plan) / featureDefinitions.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Key features preview */}
                <div className="text-sm">
                  {plan.features?.slice(0, 5).map(f => {
                    const def = getFeatureDef(f.featureCode);
                    if (!def) return null;
                    return (
                      <div key={f.featureCode} className="flex justify-between items-center py-1.5 border-b border-[var(--light-border)] dark:border-[var(--dark-border)] last:border-0">
                        <span className="text-[var(--light-text)] dark:text-[var(--dark-text)]">{def.name}</span>
                        {def.type === 'boolean' ? (
                          f.enabled ? <MdCheck className="text-[var(--success-color)]" /> : <MdClose className="text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-40" />
                        ) : (
                          <span className="px-2 py-0.5 bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] rounded-full text-xs border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                            {f.limitValue === -1 ? '∞' : f.limitValue}
                          </span>
                        )}
                      </div>
                    );
                  })}
                  {(plan.features?.length || 0) > 5 && (
                    <div className="py-1.5 text-center text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-70 text-xs">
                      +{plan.features.length - 5} more features
                    </div>
                  )}
                </div>

                {/* Trial info */}
                {plan.trial?.enabled && (
                  <span className="inline-block mt-2 px-2 py-0.5 bg-[var(--info-color)] text-white rounded-full text-xs font-medium">
                    {plan.trial.days} day trial
                  </span>
                )}
              </div>
              <div className="text-center pb-4 px-4 border-t border-[var(--light-border)] dark:border-[var(--dark-border)] pt-3">
                <button
                  onClick={() => handleOpenEdit(plan)}
                  className="px-3 py-1.5 border border-[var(--primary-color)] text-[var(--primary-color)] rounded-md hover:bg-[var(--primary-color)] hover:text-white transition-colors text-sm mr-2"
                >
                  <MdEdit className="inline mr-1" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(plan)}
                  className="px-3 py-1.5 border border-[var(--danger-color)] text-[var(--danger-color)] rounded-md hover:bg-[var(--danger-color)] hover:text-white transition-colors text-sm"
                >
                  <MdDelete className="inline" />
                </button>
              </div>
            </div>
          ))}

          {filteredPlans.length === 0 && !loading && (
            <div className="col-span-full">
              <div className="flex items-center gap-2 p-4 bg-[var(--light-card)] dark:bg-[var(--dark-card)] border-l-4 border-[var(--info-color)] rounded-md shadow-md">
                <span className="text-[var(--info-color)]">ℹ</span>
                <span className="text-[var(--light-text)] dark:text-[var(--dark-text)]">
                  No plans found. Create your first plan to get started.
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col border border-[var(--light-border)] dark:border-[var(--dark-border)]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <h5 className="text-lg font-semibold m-0 text-[var(--light-text)] dark:text-[var(--dark-text)]">
                {editingPlan ? `Edit Plan: ${editingPlan.name}` : 'Create New Plan'}
              </h5>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] rounded-full transition-colors text-xl text-[var(--light-text)] dark:text-[var(--dark-text)]">×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-4 overflow-y-auto" style={{ maxHeight: '70vh' }}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Basic Info */}
                  <div>
                    <h5 className="font-semibold mb-3 text-[var(--light-text)] dark:text-[var(--dark-text)]">Basic Information</h5>
                    <div className="mb-3">
                      <label className="block text-sm font-medium mb-1 text-[var(--light-text)] dark:text-[var(--dark-text)]">Plan Code *</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] disabled:opacity-50"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                        placeholder="e.g., pro"
                        required
                        disabled={!!editingPlan}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="block text-sm font-medium mb-1 text-[var(--light-text)] dark:text-[var(--dark-text)]">Display Name *</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Pro Plan"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="block text-sm font-medium mb-1 text-[var(--light-text)] dark:text-[var(--dark-text)]">Description</label>
                      <textarea
                        rows={2}
                        className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] resize-none"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="block text-sm font-medium mb-1 text-[var(--light-text)] dark:text-[var(--dark-text)]">Badge (optional)</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                        value={formData.badge}
                        onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                        placeholder="e.g., Most Popular"
                      />
                    </div>

                    <h5 className="font-semibold mt-4 mb-3 text-[var(--light-text)] dark:text-[var(--dark-text)]">Pricing</h5>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-1 text-[var(--light-text)] dark:text-[var(--dark-text)]">Monthly ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                          value={formData.pricing.monthly}
                          onChange={(e) => setFormData({
                            ...formData,
                            pricing: { ...formData.pricing, monthly: parseFloat(e.target.value) || 0 }
                          })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-[var(--light-text)] dark:text-[var(--dark-text)]">Yearly ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                          value={formData.pricing.yearly}
                          onChange={(e) => setFormData({
                            ...formData,
                            pricing: { ...formData.pricing, yearly: parseFloat(e.target.value) || 0 }
                          })}
                        />
                      </div>
                    </div>

                    <h5 className="font-semibold mt-4 mb-3 text-[var(--light-text)] dark:text-[var(--dark-text)]">Settings</h5>
                    <label className="flex items-center gap-2 cursor-pointer mb-2">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded accent-[var(--primary-color)]"
                        checked={formData.trial.enabled}
                        onChange={(e) => setFormData({
                          ...formData,
                          trial: { ...formData.trial, enabled: e.target.checked }
                        })}
                      />
                      <span className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">Trial enabled</span>
                    </label>
                    {formData.trial.enabled && (
                      <div className="mb-3 ml-6">
                        <label className="block text-sm font-medium mb-1 text-[var(--light-text)] dark:text-[var(--dark-text)]">Trial Days</label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                          value={formData.trial.days}
                          onChange={(e) => setFormData({
                            ...formData,
                            trial: { ...formData.trial, days: parseInt(e.target.value) || 14 }
                          })}
                        />
                      </div>
                    )}
                    <label className="flex items-center gap-2 cursor-pointer mb-2">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded accent-[var(--primary-color)]"
                        checked={formData.isPublic}
                        onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                      />
                      <span className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">Public (show on pricing page)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded accent-[var(--primary-color)]"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      />
                      <span className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">Active</span>
                    </label>
                  </div>
                  {/* Features */}
                  <div className="md:col-span-2">
                    <h5 className="font-semibold mb-3 text-[var(--light-text)] dark:text-[var(--dark-text)]">Features</h5>
                    <div className="flex items-center gap-2 p-3 bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] border border-[var(--info-color)] rounded-md text-[var(--light-text)] dark:text-[var(--dark-text)] text-sm mb-3">
                      <span className="text-[var(--info-color)]">ℹ</span>
                      <span>Toggle features ON/OFF for boolean types. Set limit values for numeric features. Use -1 for unlimited.</span>
                    </div>

                    {CATEGORIES.map(category => {
                      const categoryFeatures = featuresByCategory[category.value] || [];
                      if (categoryFeatures.length === 0) return null;

                      return (
                        <div key={category.value} className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-md mb-3 overflow-hidden shadow-sm">
                          <div className="px-4 py-2 bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] border-b border-[var(--light-border)] dark:border-[var(--dark-border)] flex items-center gap-2">
                            <span className={`px-2 py-0.5 text-white rounded-full text-xs font-medium ${category.color}`}>{category.label}</span>
                            <small className="text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-70">
                              {categoryFeatures.filter(fd => {
                                const fv = getFeatureValue(fd.code);
                                if (fd.type === 'boolean') return fv?.enabled;
                                return fv?.limitValue > 0 || fv?.limitValue === -1;
                              }).length} / {categoryFeatures.length} enabled
                            </small>
                          </div>
                          <div className="px-4 py-2">
                            {categoryFeatures.map(fd => {
                              const fv = getFeatureValue(fd.code);

                              return (
                                <div key={fd.code} className="flex items-center justify-between py-2 border-b border-[var(--light-border)] dark:border-[var(--dark-border)] last:border-0">
                                  <div>
                                    <strong className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">{fd.name}</strong>
                                    {fd.description && (
                                      <div className="text-xs text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-70">{fd.description}</div>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {fd.type === 'boolean' ? (
                                      <button
                                        type="button"
                                        onClick={() => handleFeatureToggle(fd.code)}
                                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${fv?.enabled ? 'bg-[var(--success-color)] text-white' : 'border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)] bg-[var(--light-card)] dark:bg-[var(--dark-card)]'}`}
                                      >
                                        {fv?.enabled ? <><MdToggleOn className="inline mr-1" /> ON</> : <><MdToggleOff className="inline mr-1" /> OFF</>}
                                      </button>
                                    ) : (
                                      <div className="flex items-center border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-md overflow-hidden bg-[var(--light-card)] dark:bg-[var(--dark-card)]" style={{ width: '150px' }}>
                                        <input
                                          type="number"
                                          className="w-full px-2 py-1 bg-transparent text-[var(--light-text)] dark:text-[var(--dark-text)] outline-none text-sm focus:ring-2 focus:ring-[var(--primary-color)]"
                                          value={fv?.limitValue ?? 0}
                                          onChange={(e) => handleLimitChange(fd.code, e.target.value)}
                                          placeholder="0"
                                        />
                                        {fd.unit && <span className="px-2 py-1 bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-70 text-xs border-l border-[var(--light-border)] dark:border-[var(--dark-border)]">{fd.unit}</span>}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 p-4 border-t border-[var(--light-border)] dark:border-[var(--dark-border)]">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] border border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)]">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed">
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <MdSave /> {editingPlan ? 'Update Plan' : 'Create Plan'}
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanBuilder;