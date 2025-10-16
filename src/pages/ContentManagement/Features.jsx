// src/pages/ContentManagement/Features.jsx
"use client"

import { useState, useEffect } from "react"
import { 
  MdAdd, MdEdit, MdDelete, MdSearch, MdRefresh,
  MdStar, MdStarOutline, MdLabel, MdCategory,
  MdCheckCircle, MdTrendingUp, MdSettings,
  MdClose
} from "react-icons/md"
import Pagination from "./components/Pagination/Pagination.jsx"

const Features = ({ darkMode }) => {
  // State for features data
  const [features, setFeatures] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  
  // State for CRUD operations
  const [showModal, setShowModal] = useState(false)
  const [currentFeature, setCurrentFeature] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  
  // State for table controls
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 })

  // Category options for filter
  const categoryOptions = [
    { value: 'survey', label: 'Survey' },
    { value: 'analytics', label: 'Analytics' },
    { value: 'reporting', label: 'Reporting' },
    { value: 'integration', label: 'Integration' }
  ]

  // Fetch features data
  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const dummyFeatures = [
          {
            id: 1,
            title: "Advanced Survey Builder",
            description: "Create complex surveys with multiple question types",
            category: "survey",
            isPremium: true,
            status: "active",
            icon: "poll",
            createdAt: "2024-01-15"
          },
          {
            id: 2,
            title: "Real-time Analytics",
            description: "View response data as it comes in",
            category: "analytics",
            isPremium: true,
            status: "active",
            icon: "analytics",
            createdAt: "2024-01-14"
          },
          {
            id: 3,
            title: "Basic Reporting",
            description: "Generate simple reports and charts",
            category: "reporting",
            isPremium: false,
            status: "active",
            icon: "insert_chart",
            createdAt: "2024-01-10"
          },
          // Add more features as needed
        ]
        
        setFeatures(dummyFeatures)
        setPagination(prev => ({ ...prev, total: dummyFeatures.length }))
      } catch (error) {
        setError("Failed to load features. Please try again later.")
        console.error("Error fetching features:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchFeatures()
  }, [])

  // Filter features based on search and category
  const filteredFeatures = features.filter(feature => {
    const matchesSearch = 
      feature.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      feature.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "all" || feature.category === filterCategory
    return matchesSearch && matchesCategory
  })

  // Paginate features
  const paginatedFeatures = filteredFeatures.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit
  )

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setCurrentFeature(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (isEditing) {
      // Update existing feature
      setFeatures(features.map(f => 
        f.id === currentFeature.id ? currentFeature : f
      ))
    } else {
      // Add new feature
      const newFeature = {
        ...currentFeature,
        id: Date.now(),
        createdAt: new Date().toISOString().split('T')[0],
        status: "active"
      }
      setFeatures([...features, newFeature])
      setPagination(prev => ({ ...prev, total: prev.total + 1 }))
    }
    
    setShowModal(false)
  }

  // Handle edit action
  const handleEdit = (feature) => {
    setCurrentFeature(feature)
    setIsEditing(true)
    setShowModal(true)
  }

  // Handle delete action
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this feature?")) {
      setFeatures(features.filter(f => f.id !== id))
      setPagination(prev => ({ ...prev, total: prev.total - 1 }))
    }
  }

  // Toggle premium status
  const togglePremium = (id) => {
    setFeatures(features.map(f => 
      f.id === id ? { ...f, isPremium: !f.isPremium } : f
    ))
  }

  // Calculate stats
  const activeFeatures = features.filter(f => f.status === 'active').length
  const premiumFeatures = features.filter(f => f.isPremium).length
  const totalCategories = [...new Set(features.map(f => f.category))].length

  if (loading) {
    return (
      <div className="features-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading features...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="features-container">
        <div className="error-container">
          <p className="error-message">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="features-container">
      {/* Page Header */}
      <div className="page-header-section">
        <div className="page-header-content">
          <div className="page-title-wrapper">
            <div className="page-icon">
              <MdCategory />
            </div>
            <div>
              <h1 className="page-title">Feature Management</h1>
              <p className="page-subtitle">Manage your platform features and offerings</p>
            </div>
          </div>
          <div className="page-actions">
            <button 
              className="action-button primary-action"
              onClick={() => {
                setCurrentFeature({
                  title: "",
                  description: "",
                  category: "survey",
                  isPremium: false,
                  icon: "poll"
                })
                setIsEditing(false)
                setShowModal(true)
              }}
            >
              <MdAdd /> Add Feature
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-section">
        <div className="stat-card primary-card">
          <div className="stat-icon">
            <MdCategory />
          </div>
          <div className="stat-content">
            <div className="stat-value">{features.length}</div>
            <div className="stat-label">Total Features</div>
          </div>
        </div>
        <div className="stat-card success-card">
          <div className="stat-icon">
            <MdCheckCircle />
          </div>
          <div className="stat-content">
            <div className="stat-value">{activeFeatures}</div>
            <div className="stat-label">Active</div>
          </div>
        </div>
        <div className="stat-card warning-card">
          <div className="stat-icon">
            <MdStar />
          </div>
          <div className="stat-content">
            <div className="stat-value">{premiumFeatures}</div>
            <div className="stat-label">Premium Features</div>
          </div>
        </div>
        <div className="stat-card info-card">
          <div className="stat-icon">
            <MdSettings />
          </div>
          <div className="stat-content">
            <div className="stat-value">{totalCategories}</div>
            <div className="stat-label">Categories</div>
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
              placeholder="Search features..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <select 
              className="filter-select"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categoryOptions.map(option => (
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

      {/* Features Table */}
      <div className="section-card features-table-section">
        <div className="section-header">
          <div className="section-title-wrapper">
            <h2 className="section-title">{filteredFeatures.length} feature(s) found</h2>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th>Description</th>
                <th>Category</th>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedFeatures.map(feature => (
                <tr key={feature.id}>
                  <td>
                    <div className="feature-name-cell">
                      <div className="feature-icon">
                        <MdLabel />
                      </div>
                      <div>
                        <div className="feature-name">{feature.title}</div>
                        <div className="feature-date">Added: {feature.createdAt}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="feature-description">{feature.description}</div>
                  </td>
                  <td>
                    <span className="category-badge">{feature.category}</span>
                  </td>
                  <td>
                    <button 
                      className={`premium-toggle ${feature.isPremium ? 'is-premium' : 'is-standard'}`}
                      onClick={() => togglePremium(feature.id)}
                    >
                      {feature.isPremium ? <MdStar /> : <MdStarOutline />}
                      {feature.isPremium ? 'Premium' : 'Standard'}
                    </button>
                  </td>
                  <td>
                    <span className={`status-badge ${feature.status}-status`}>
                      {feature.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="action-btn edit-btn"
                        onClick={() => handleEdit(feature)}
                        title="Edit"
                      >
                        <MdEdit />
                      </button>
                      <button 
                        className="action-btn delete-btn"
                        onClick={() => handleDelete(feature.id)}
                        title="Delete"
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

        {/* Pagination */}
        <div className="table-footer">
          <Pagination
            current={pagination.page}
            total={filteredFeatures.length}
            limit={pagination.limit}
            onChange={(page) => setPagination(prev => ({ ...prev, page }))}
            darkMode={darkMode}
          />
        </div>
      </div>

      {/* Add/Edit Feature Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                <MdCategory />
                {isEditing ? "Edit Feature" : "Add New Feature"}
              </h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <MdClose />
              </button>
            </div>
            <div className="modal-body">
              <form className="feature-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Feature Title</label>
                  <input
                    type="text"
                    name="title"
                    className="form-input"
                    value={currentFeature?.title || ""}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    rows={3}
                    name="description"
                    className="form-input"
                    value={currentFeature?.description || ""}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      name="category"
                      className="form-select"
                      value={currentFeature?.category || "survey"}
                      onChange={handleInputChange}
                    >
                      {categoryOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Icon</label>
                    <select
                      name="icon"
                      className="form-select"
                      value={currentFeature?.icon || "poll"}
                      onChange={handleInputChange}
                    >
                      <option value="poll">Poll</option>
                      <option value="analytics">Analytics</option>
                      <option value="insert_chart">Chart</option>
                      <option value="people">People</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-checkbox">
                    <input
                      type="checkbox"
                      name="isPremium"
                      checked={currentFeature?.isPremium || false}
                      onChange={handleInputChange}
                    />
                    <span>Premium Feature</span>
                  </label>
                </div>
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
                {isEditing ? "Update Feature" : "Add Feature"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Features