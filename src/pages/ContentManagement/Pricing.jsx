// src\pages\ContentManagement\Pricing.jsx

"use client"

import { useState, useEffect } from "react"
import {
  MdAdd, MdEdit, MdDelete, MdSearch, MdRefresh,
  MdAttachMoney, MdCheck, MdClose, MdStar,
  MdCheckCircle, MdTrendingUp, MdSettings
} from "react-icons/md"
import Pagination from "./components/Pagination/Pagination.jsx"

const Pricing = ({ darkMode }) => {
  // State for pricing plans data
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // State for CRUD operations
  const [showModal, setShowModal] = useState(false)
  const [currentPlan, setCurrentPlan] = useState(null)
  const [isEditing, setIsEditing] = useState(false)

  // State for table controls
  const [searchTerm, setSearchTerm] = useState("")
  const [filterTier, setFilterTier] = useState("all")
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 })

  // Tier options for filter
  const tierOptions = [
    { value: 'basic', label: 'Basic' },
    { value: 'standard', label: 'Standard' },
    { value: 'premium', label: 'Premium' },
    { value: 'enterprise', label: 'Enterprise' }
  ]

  // Fetch pricing plans data
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))

        const dummyPlans = [
          {
            id: 1,
            name: "Starter",
            tier: "basic",
            price: 0,
            currency: "USD",
            interval: "month",
            features: ["100 responses/month", "Basic reports"],
            isActive: true,
            isPopular: false,
            createdAt: "2024-01-15"
          },
          {
            id: 2,
            name: "Professional",
            tier: "standard",
            price: 29,
            currency: "USD",
            interval: "month",
            features: ["1000 responses/month", "Advanced reports", "Email support"],
            isActive: true,
            isPopular: true,
            createdAt: "2024-01-14"
          },
          {
            id: 3,
            name: "Business",
            tier: "premium",
            price: 99,
            currency: "USD",
            interval: "month",
            features: ["Unlimited responses", "All reports", "Priority support", "API access"],
            isActive: true,
            isPopular: false,
            createdAt: "2024-01-10"
          },
          // Add more plans as needed
        ]

        setPlans(dummyPlans)
        setPagination(prev => ({ ...prev, total: dummyPlans.length }))
      } catch (error) {
        setError("Failed to load pricing plans. Please try again later.")
        console.error("Error fetching pricing plans:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPlans()
  }, [])

  // Filter plans based on search and tier
  const filteredPlans = plans.filter(plan => {
    const matchesSearch =
      plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.tier.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTier = filterTier === "all" || plan.tier === filterTier
    return matchesSearch && matchesTier
  })

  // Paginate plans
  const paginatedPlans = filteredPlans.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit
  )

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setCurrentPlan(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  // Handle feature input changes
  const handleFeatureChange = (index, value) => {
    const newFeatures = [...currentPlan.features]
    newFeatures[index] = value
    setCurrentPlan(prev => ({
      ...prev,
      features: newFeatures
    }))
  }

  // Add new feature field
  const addFeature = () => {
    setCurrentPlan(prev => ({
      ...prev,
      features: [...prev.features, ""]
    }))
  }

  // Remove feature field
  const removeFeature = (index) => {
    const newFeatures = [...currentPlan.features]
    newFeatures.splice(index, 1)
    setCurrentPlan(prev => ({
      ...prev,
      features: newFeatures
    }))
  }

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault()

    if (isEditing) {
      // Update existing plan
      setPlans(plans.map(p =>
        p.id === currentPlan.id ? currentPlan : p
      ))
    } else {
      // Add new plan
      const newPlan = {
        ...currentPlan,
        id: Date.now(),
        createdAt: new Date().toISOString().split('T')[0]
      }
      setPlans([...plans, newPlan])
      setPagination(prev => ({ ...prev, total: prev.total + 1 }))
    }

    setShowModal(false)
  }

  // Handle edit action
  const handleEdit = (plan) => {
    setCurrentPlan(plan)
    setIsEditing(true)
    setShowModal(true)
  }

  // Handle delete action
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this pricing plan?")) {
      setPlans(plans.filter(p => p.id !== id))
      setPagination(prev => ({ ...prev, total: prev.total - 1 }))
    }
  }

  // Toggle plan status
  const toggleStatus = (id) => {
    setPlans(plans.map(p =>
      p.id === id ? { ...p, isActive: !p.isActive } : p
    ))
  }

  // Toggle popular status
  const togglePopular = (id) => {
    setPlans(plans.map(p =>
      p.id === id ? { ...p, isPopular: !p.isPopular } : p
    ))
  }

  // Format price display
  const formatPrice = (plan) => {
    if (plan.price === 0) return "Free"
    return `${plan.currency}${plan.price}/${plan.interval}`
  }

  // Calculate stats
  const activePlans = plans.filter(p => p.isActive).length
  const popularPlans = plans.filter(p => p.isPopular).length
  const totalTiers = [...new Set(plans.map(p => p.tier))].length

  if (loading) {
    return (
      <div className="pricing-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading pricing plans...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="pricing-container">
        <div className="error-container">
          <p className="error-message">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="pricing-container">
      {/* Page Header */}
      <div className="page-header-section">
        <div className="page-header-content">
          <div className="page-title-wrapper">
            <div className="page-icon">
              <MdAttachMoney />
            </div>
            <div>
              <h1 className="page-title">Pricing Management</h1>
              <p className="page-subtitle">Configure your pricing plans and tiers</p>
            </div>
          </div>
          <div className="page-actions">
            <button
              className="action-button primary-action"
              onClick={() => {
                setCurrentPlan({
                  name: "",
                  tier: "basic",
                  price: 0,
                  currency: "USD",
                  interval: "month",
                  features: [""],
                  isActive: true,
                  isPopular: false
                })
                setIsEditing(false)
                setShowModal(true)
              }}
            >
              <MdAdd /> Add Plan
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-section">
        <div className="stat-card primary-card">
          <div className="stat-icon">
            <MdAttachMoney />
          </div>
          <div className="stat-content">
            <div className="stat-value">{plans.length}</div>
            <div className="stat-label">Total Plans</div>
          </div>
        </div>
        <div className="stat-card success-card">
          <div className="stat-icon">
            <MdCheckCircle />
          </div>
          <div className="stat-content">
            <div className="stat-value">{activePlans}</div>
            <div className="stat-label">Active Plans</div>
          </div>
        </div>
        <div className="stat-card warning-card">
          <div className="stat-icon">
            <MdStar />
          </div>
          <div className="stat-content">
            <div className="stat-value">{popularPlans}</div>
            <div className="stat-label">Popular Plans</div>
          </div>
        </div>
        <div className="stat-card info-card">
          <div className="stat-icon">
            <MdSettings />
          </div>
          <div className="stat-content">
            <div className="stat-value">{totalTiers}</div>
            <div className="stat-label">Pricing Tiers</div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="section-card filters-section">
        <div className="filters-grid">
          <div className="search-input-container">
            <MdSearch className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search plans by name or tier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <select
              className="filter-select"
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
            >
              <option value="all">All Tiers</option>
              {tierOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <button
            className="action-button secondary-action"
            onClick={() => window.location.reload()}
          >
            <MdRefresh /> Refresh
          </button>
        </div>
      </div>

      {/* Pricing Plans Table */}
      <div className="section-card pricing-table-section">
        <div className="section-header">
          <div className="section-title-wrapper">
            <h2 className="section-title">{filteredPlans.length} plan(s) found</h2>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Plan Details</th>
                <th>Tier</th>
                <th>Price</th>
                <th>Features</th>
                <th>Status</th>
                <th>Popular</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPlans.length > 0 ? (
                paginatedPlans.map(plan => (
                  <tr key={plan.id}>
                    <td>
                      <div className="plan-details-cell">
                        <div className="plan-name">{plan.name}</div>
                        <div className="plan-date">Created: {plan.createdAt}</div>
                      </div>
                    </td>
                    <td>
                      <span className={`tier-badge tier-${plan.tier}`}>
                        {plan.tier}
                      </span>
                    </td>
                    <td>
                      <div className="plan-price">{formatPrice(plan)}</div>
                    </td>
                    <td>
                      <ul className="features-list">
                        {plan.features.map((feature, i) => (
                          <li key={i}>
                            <MdCheck className="feature-check" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td>
                      <label className="status-toggle">
                        <input
                          type="checkbox"
                          checked={plan.isActive}
                          onChange={() => toggleStatus(plan.id)}
                        />
                        <span className="toggle-slider"></span>
                        <span className="toggle-label">
                          {plan.isActive ? "Active" : "Inactive"}
                        </span>
                      </label>
                    </td>
                    <td>
                      <label className="popular-toggle">
                        <input
                          type="checkbox"
                          checked={plan.isPopular}
                          onChange={() => togglePopular(plan.id)}
                        />
                        <span className="toggle-slider"></span>
                        <span className="toggle-label">
                          {plan.isPopular ? "Yes" : "No"}
                        </span>
                      </label>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-btn edit-btn"
                          onClick={() => handleEdit(plan)}
                          title="Edit"
                        >
                          <MdEdit />
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDelete(plan.id)}
                          title="Delete"
                        >
                          <MdDelete />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="no-data">
                    No pricing plans found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="table-footer">
          <Pagination
            current={pagination.page}
            total={filteredPlans.length}
            limit={pagination.limit}
            onChange={(page) => setPagination(prev => ({ ...prev, page }))}
            darkMode={darkMode}
          />
        </div>
      </div>

      {/* Add/Edit Plan Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                <MdAttachMoney />
                {isEditing ? "Edit Pricing Plan" : "Add New Pricing Plan"}
              </h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <MdClose />
              </button>
            </div>
            <div className="modal-body">
              <form className="pricing-form" onSubmit={handleSubmit}>
                {currentPlan && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Plan Name</label>
                      <input
                        type="text"
                        name="name"
                        className="form-input"
                        value={currentPlan.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Tier</label>
                      <select
                        name="tier"
                        className="form-select"
                        value={currentPlan.tier}
                        onChange={handleInputChange}
                      >
                        {tierOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Price</label>
                        <div className="price-input-group">
                          <select
                            name="currency"
                            className="currency-select"
                            value={currentPlan.currency}
                            onChange={handleInputChange}
                          >
                            <option value="USD">$</option>
                            <option value="EUR">€</option>
                            <option value="GBP">£</option>
                          </select>
                          <input
                            type="number"
                            name="price"
                            className="price-input"
                            value={currentPlan.price}
                            onChange={handleInputChange}
                            min="0"
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Billing Interval</label>
                        <select
                          name="interval"
                          className="form-select"
                          value={currentPlan.interval}
                          onChange={handleInputChange}
                        >
                          <option value="month">Monthly</option>
                          <option value="year">Yearly</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <div className="features-header">
                        <label className="form-label">Features</label>
                        <button
                          type="button"
                          className="add-feature-btn"
                          onClick={addFeature}
                        >
                          <MdAdd /> Add Feature
                        </button>
                      </div>
                      {currentPlan.features.map((feature, index) => (
                        <div key={index} className="feature-input-group">
                          <input
                            type="text"
                            className="form-input"
                            value={feature}
                            onChange={(e) => handleFeatureChange(index, e.target.value)}
                            placeholder="Enter feature"
                          />
                          <button
                            type="button"
                            className="remove-feature-btn"
                            onClick={() => removeFeature(index)}
                          >
                            <MdClose />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="form-row toggles-row">
                      <div className="form-group">
                        <label className="form-checkbox">
                          <input
                            type="checkbox"
                            name="isActive"
                            checked={currentPlan.isActive}
                            onChange={handleInputChange}
                          />
                          <span>Active Plan</span>
                        </label>
                      </div>
                      <div className="form-group">
                        <label className="form-checkbox">
                          <input
                            type="checkbox"
                            name="isPopular"
                            checked={currentPlan.isPopular}
                            onChange={handleInputChange}
                          />
                          <span>Mark as Popular</span>
                        </label>
                      </div>
                    </div>
                  </>
                )}
              </form>
            </div>
            <div className="modal-footer">
              <button
                className="modal-cancel-btn"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="modal-submit-btn"
                onClick={handleSubmit}
              >
                <MdAdd />
                {isEditing ? "Update Plan" : "Create Plan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Pricing