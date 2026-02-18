// src/pages/Subscription/FeatureManagement.jsx
// Admin screen for managing feature definitions

import React, { useState, useEffect } from 'react';
import {
    MdAdd, MdEdit, MdDelete, MdRefresh, MdSearch,
    MdCheck, MdClose, MdToggleOn, MdToggleOff,
    MdSettings, MdCategory
} from 'react-icons/md';
import Swal from 'sweetalert2';
import {
    getFeatureDefinitions,
    createFeatureDefinition,
    updateFeatureDefinition,
    deleteFeatureDefinition
} from '../../api/services/subscriptionService';

const CATEGORIES = [
    { value: 'core', label: 'Core', color: 'bg-[var(--info-color)]' },
    { value: 'analytics', label: 'Analytics', color: 'bg-[var(--primary-color)]' },
    { value: 'distribution', label: 'Distribution', color: 'bg-[var(--success-color)]' },
    { value: 'branding', label: 'Branding', color: 'bg-[var(--warning-color)]' },
    { value: 'automation', label: 'Automation', color: 'bg-[var(--danger-color)]' },
    { value: 'integration', label: 'Integration', color: 'bg-gray-500 dark:bg-gray-400' },
    { value: 'support', label: 'Support', color: 'bg-gray-700 dark:bg-gray-600' }
];

const FeatureManagement = () => {
    const [features, setFeatures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [editingFeature, setEditingFeature] = useState(null);
    const [saving, setSaving] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        description: '',
        category: 'core',
        type: 'boolean',
        defaultValue: false,
        unit: '',
        isPublic: true,
        isActive: true,
        displayOrder: 0
    });

    useEffect(() => {
        fetchFeatures();
    }, []);

    const fetchFeatures = async () => {
        setLoading(true);
        try {
            const response = await getFeatureDefinitions();
            setFeatures(response.data || []);
        } catch (error) {
            Swal.fire('Error', 'Failed to load features', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreate = () => {
        setEditingFeature(null);
        setFormData({
            code: '',
            name: '',
            description: '',
            category: 'core',
            type: 'boolean',
            defaultValue: false,
            unit: '',
            isPublic: true,
            isActive: true,
            displayOrder: features.length
        });
        setShowModal(true);
    };

    const handleOpenEdit = (feature) => {
        setEditingFeature(feature);
        setFormData({
            code: feature.code,
            name: feature.name,
            description: feature.description || '',
            category: feature.category,
            type: feature.type,
            defaultValue: feature.defaultValue,
            unit: feature.unit || '',
            isPublic: feature.isPublic !== false,
            isActive: feature.isActive !== false,
            displayOrder: feature.displayOrder || 0
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const data = {
                ...formData,
                defaultValue: formData.type === 'limit' ? Number(formData.defaultValue) : Boolean(formData.defaultValue)
            };

            if (editingFeature) {
                await updateFeatureDefinition(editingFeature._id, data);
                Swal.fire('Updated!', 'Feature updated successfully', 'success');
            } else {
                await createFeatureDefinition(data);
                Swal.fire('Created!', 'Feature created successfully', 'success');
            }

            setShowModal(false);
            fetchFeatures();
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Operation failed', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (feature) => {
        const result = await Swal.fire({
            title: 'Delete Feature?',
            text: `This will delete "${feature.name}". This cannot be undone!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await deleteFeatureDefinition(feature._id);
                Swal.fire('Deleted!', 'Feature has been deleted.', 'success');
                fetchFeatures();
            } catch (error) {
                Swal.fire('Error', error.response?.data?.message || 'Delete failed', 'error');
            }
        }
    };

    const handleToggleActive = async (feature) => {
        try {
            await updateFeatureDefinition(feature._id, { isActive: !feature.isActive });
            fetchFeatures();
        } catch (error) {
            Swal.fire('Error', 'Failed to update status', 'error');
        }
    };

    // Filter features
    const filteredFeatures = features.filter(f => {
        const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            f.code.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || f.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const getCategoryBadge = (category) => {
        const cat = CATEGORIES.find(c => c.value === category);
        return (
            <span className={`px-2 py-0.5 text-white rounded-full text-xs font-medium ${cat?.color || 'bg-gray-500 dark:bg-gray-400'}`}>
                {cat?.label || category}
            </span>
        );
    };

    return (
        <div className="w-full px-4 py-4 bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <div className="flex justify-between items-center flex-wrap gap-3">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">
                            <MdSettings className="text-[var(--primary-color)]" />
                            Feature Management
                        </h1>
                        <p className="text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-70 mt-1">
                            Manage feature definitions for subscription plans
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={fetchFeatures} 
                            className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] border border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] flex items-center gap-1"
                        >
                            <MdRefresh /> Refresh
                        </button>
                        <button 
                            onClick={handleOpenCreate} 
                            className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:opacity-90 flex items-center gap-1"
                        >
                            <MdAdd /> New Feature
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)] text-center">
                    <h3 className="text-2xl font-bold text-[var(--info-color)]">{features.length}</h3>
                    <small className="text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-70">Total Features</small>
                </div>
                <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)] text-center">
                    <h3 className="text-2xl font-bold text-[var(--success-color)]">{features.filter(f => f.isActive).length}</h3>
                    <small className="text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-70">Active Features</small>
                </div>
                <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)] text-center">
                    <h3 className="text-2xl font-bold text-[var(--primary-color)]">{features.filter(f => f.type === 'boolean').length}</h3>
                    <small className="text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-70">Boolean Features</small>
                </div>
                <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)] text-center">
                    <h3 className="text-2xl font-bold text-[var(--warning-color)]">{features.filter(f => f.type === 'limit').length}</h3>
                    <small className="text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-70">Limit Features</small>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md mb-6 border border-[var(--light-border)] dark:border-[var(--dark-border)] p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-md overflow-hidden bg-[var(--light-card)] dark:bg-[var(--dark-card)]">
                        <span className="px-3 bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-70 border-r border-[var(--light-border)] dark:border-[var(--dark-border)] flex items-center">
                            <MdSearch />
                        </span>
                        <input
                            type="text"
                            className="w-full px-3 py-2 bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                            placeholder="Search features..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-md overflow-hidden bg-[var(--light-card)] dark:bg-[var(--dark-card)]">
                        <span className="px-3 bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-70 border-r border-[var(--light-border)] dark:border-[var(--dark-border)] flex items-center">
                            <MdCategory />
                        </span>
                        <select
                            className="w-full px-3 py-2 bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                        >
                            <option value="all">All Categories</option>
                            {CATEGORIES.map(cat => (
                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Features Table */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="w-12 h-12 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-2 text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-70">Loading features...</p>
                </div>
            ) : filteredFeatures.length === 0 ? (
                <div className="flex items-center gap-2 p-4 bg-[var(--info-color)] bg-opacity-10 border border-[var(--info-color)] rounded-md text-[var(--info-color)]">
                    No features found. Create your first feature to get started.
                </div>
            ) : (
                <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse">
                            <thead className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                                <tr>
                                    <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">Feature</th>
                                    <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">Code</th>
                                    <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">Category</th>
                                    <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">Type</th>
                                    <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">Default</th>
                                    <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">Status</th>
                                    <th className="p-3 text-center text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-[var(--light-card)] dark:bg-[var(--dark-card)]">
                                {filteredFeatures.map(feature => (
                                    <tr key={feature._id} className="border-b border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] transition-colors">
                                        <td className="p-3 text-[var(--light-text)] dark:text-[var(--dark-text)]">
                                            <div>
                                                <strong>{feature.name}</strong>
                                                {feature.description && (
                                                    <div className="text-xs text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-70">{feature.description}</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-3 text-[var(--light-text)] dark:text-[var(--dark-text)]">
                                            <code className="text-sm bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] px-2 py-1 rounded border border-[var(--light-border)] dark:border-[var(--dark-border)]">{feature.code}</code>
                                        </td>
                                        <td className="p-3 text-[var(--light-text)] dark:text-[var(--dark-text)]">{getCategoryBadge(feature.category)}</td>
                                        <td className="p-3 text-[var(--light-text)] dark:text-[var(--dark-text)]">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium text-white ${feature.type === 'boolean' ? 'bg-[var(--primary-color)]' : 'bg-[var(--warning-color)]'}`}>
                                                {feature.type}
                                            </span>
                                        </td>
                                        <td className="p-3 text-[var(--light-text)] dark:text-[var(--dark-text)]">
                                            {feature.type === 'boolean' ? (
                                                feature.defaultValue ? <MdCheck className="text-[var(--success-color)] text-xl" /> : <MdClose className="text-gray-400 dark:text-gray-500 text-xl" />
                                            ) : (
                                                <span>{feature.defaultValue} {feature.unit}</span>
                                            )}
                                        </td>
                                        <td className="p-3">
                                            <button
                                                onClick={() => handleToggleActive(feature)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                    feature.isActive 
                                                        ? 'bg-[var(--success-color)]' 
                                                        : 'bg-gray-300 dark:bg-gray-600'
                                                }`}
                                            >
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                    feature.isActive ? 'translate-x-6' : 'translate-x-1'
                                                }`} />
                                            </button>
                                        </td>
                                        <td className="p-3 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleOpenEdit(feature)}
                                                    className="p-2 rounded-md font-medium transition-colors bg-[var(--info-color)] text-white hover:opacity-90"
                                                >
                                                    <MdEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(feature)}
                                                    className="p-2 rounded-md font-medium transition-colors bg-[var(--danger-color)] text-white hover:opacity-90"
                                                >
                                                    <MdDelete />
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

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)}>
                    <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col border border-[var(--light-border)] dark:border-[var(--dark-border)]" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                            <h5 className="text-lg font-semibold m-0 text-[var(--light-text)] dark:text-[var(--dark-text)]">
                                {editingFeature ? 'Edit Feature' : 'Create Feature'}
                            </h5>
                            <button 
                                onClick={() => setShowModal(false)} 
                                className="p-1 hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] rounded-full transition-colors text-2xl text-[var(--light-text)] dark:text-[var(--dark-text)]"
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="p-4 overflow-y-auto" style={{ maxHeight: '70vh' }}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-[var(--light-text)] dark:text-[var(--dark-text)]">Feature Code *</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] disabled:opacity-50"
                                            value={formData.code}
                                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                                            placeholder="e.g., max_surveys"
                                            required
                                            disabled={!!editingFeature}
                                        />
                                        <small className="text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-70">Lowercase with underscores. Cannot be changed after creation.</small>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-[var(--light-text)] dark:text-[var(--dark-text)]">Display Name *</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g., Maximum Surveys"
                                            required
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium mb-1 text-[var(--light-text)] dark:text-[var(--dark-text)]">Description</label>
                                        <textarea
                                            rows={2}
                                            className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] resize-none"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Brief description of the feature"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-[var(--light-text)] dark:text-[var(--dark-text)]">Category *</label>
                                        <select
                                            className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        >
                                            {CATEGORIES.map(cat => (
                                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-[var(--light-text)] dark:text-[var(--dark-text)]">Type *</label>
                                        <select
                                            className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                                            value={formData.type}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                type: e.target.value,
                                                defaultValue: e.target.value === 'boolean' ? false : 0
                                            })}
                                        >
                                            <option value="boolean">Boolean (On/Off)</option>
                                            <option value="limit">Limit (Number)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-[var(--light-text)] dark:text-[var(--dark-text)]">Default Value *</label>
                                        {formData.type === 'boolean' ? (
                                            <select
                                                className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                                                value={formData.defaultValue.toString()}
                                                onChange={(e) => setFormData({ ...formData, defaultValue: e.target.value === 'true' })}
                                            >
                                                <option value="false">Disabled (Off)</option>
                                                <option value="true">Enabled (On)</option>
                                            </select>
                                        ) : (
                                            <input
                                                type="number"
                                                className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                                                value={formData.defaultValue}
                                                onChange={(e) => setFormData({ ...formData, defaultValue: e.target.value })}
                                                placeholder="0"
                                            />
                                        )}
                                    </div>
                                    {formData.type === 'limit' && (
                                        <div>
                                            <label className="block text-sm font-medium mb-1 text-[var(--light-text)] dark:text-[var(--dark-text)]">Unit</label>
                                            <input
                                                type="text"
                                                className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                                                value={formData.unit}
                                                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                                placeholder="e.g., surveys, responses, GB"
                                            />
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-[var(--light-text)] dark:text-[var(--dark-text)]">Display Order</label>
                                        <input
                                            type="number"
                                            className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                                            value={formData.displayOrder}
                                            onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2 pt-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded accent-[var(--primary-color)]"
                                                checked={formData.isPublic}
                                                onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                                            />
                                            <span className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">Show on public pricing page</span>
                                        </label>
                                    </div>
                                    <div className="flex flex-col gap-2 pt-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded accent-[var(--primary-color)]"
                                                checked={formData.isActive}
                                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                            />
                                            <span className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">Feature is active</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 p-4 border-t border-[var(--light-border)] dark:border-[var(--dark-border)]">
                                <button 
                                    type="button" 
                                    onClick={() => setShowModal(false)} 
                                    className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] border border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)]"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={saving} 
                                    className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:opacity-90 disabled:opacity-50"
                                >
                                    {saving ? (
                                        <span className="flex items-center gap-2">
                                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                            Saving...
                                        </span>
                                    ) : (
                                        editingFeature ? 'Update Feature' : 'Create Feature'
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

export default FeatureManagement;
