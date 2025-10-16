// src\pages\ContentManagement\Widgets.jsx

"use client"

import { useState, useEffect } from "react"
import { 
  MdAdd, MdEdit, MdDelete, MdSearch, MdRefresh,
  MdWidgets, MdVisibility, MdVisibilityOff,
  MdCheckCircle, MdTrendingUp, MdSettings
} from "react-icons/md"
import Pagination from "./components/Pagination/Pagination.jsx"

const Widgets = ({ darkMode }) => {
  // State for widgets data
  const [widgets, setWidgets] = useState([])
  const [loading, setLoading] = useState(true)
  
  // State for CRUD operations
  const [showModal, setShowModal] = useState(false)
  const [currentWidget, setCurrentWidget] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  
  // State for table controls
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 })

  // Status options for filter
  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'draft', label: 'Draft' }
  ]

  // Fetch widgets data
  useEffect(() => {
    const fetchWidgets = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const dummyWidgets = [
          {
            id: 1,
            name: "Survey Stats",
            description: "Displays survey statistics and completion rates",
            status: "active",
            position: "dashboard",
            visibility: true,
            createdAt: "2024-01-15"
          },
          {
            id: 2,
            name: "Recent Responses",
            description: "Shows most recent survey responses",
            status: "active",
            position: "dashboard",
            visibility: true,
            createdAt: "2024-01-14"
          },
          {
            id: 3,
            name: "Response Map",
            description: "Geographical distribution of responses",
            status: "inactive",
            position: "analytics",
            visibility: false,
            createdAt: "2024-01-10"
          },
          // Add more widgets as needed
        ]
        
        setWidgets(dummyWidgets)
        setPagination(prev => ({ ...prev, total: dummyWidgets.length }))
      } catch (error) {
        console.error("Error fetching widgets:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchWidgets()
  }, [])

  // Filter widgets based on search and status
  const filteredWidgets = widgets.filter(widget => {
    const matchesSearch = 
      widget.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      widget.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || widget.status === filterStatus
    return matchesSearch && matchesStatus
  })

  // Calculate stats
  const activeWidgets = widgets.filter(w => w.status === 'active').length
  const visibleWidgets = widgets.filter(w => w.visibility).length
  const uniquePositions = [...new Set(widgets.map(w => w.position))].length

  // Paginate widgets
  const paginatedWidgets = filteredWidgets.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit
  )

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setCurrentWidget(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (isEditing) {
      // Update existing widget
      setWidgets(widgets.map(w => 
        w.id === currentWidget.id ? currentWidget : w
      ))
    } else {
      // Add new widget
      const newWidget = {
        ...currentWidget,
        id: Date.now(),
        createdAt: new Date().toISOString().split('T')[0]
      }
      setWidgets([...widgets, newWidget])
      setPagination(prev => ({ ...prev, total: prev.total + 1 }))
    }
    
    setShowModal(false)
  }

  // Handle edit action
  const handleEdit = (widget) => {
    setCurrentWidget(widget)
    setIsEditing(true)
    setShowModal(true)
  }

  // Handle delete action
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this widget?")) {
      setWidgets(widgets.filter(w => w.id !== id))
      setPagination(prev => ({ ...prev, total: prev.total - 1 }))
    }
  }

  // Toggle widget visibility
  const toggleVisibility = (id) => {
    setWidgets(widgets.map(w => 
      w.id === id ? { ...w, visibility: !w.visibility } : w
    ))
  }

  // Get status badge variant
  const getStatusBadge = (status) => {
    const variants = {
      active: "success",
      inactive: "danger",
      draft: "warning"
    }
    return variants[status] || "secondary"
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading widgets...</p>
      </div>
    )
  }

  return (
    <div className="widgets-container">
      {/* Page Header */}
      <div className="page-header-section">
        <div className="page-header-content">
          <div className="page-header-left">
            <div className="page-header-icon">
              <MdWidgets />
            </div>
            <div className="page-header-text">
              <h1>Widget Management</h1>
              <p>Create and manage dashboard widgets</p>
            </div>
          </div>
          <button
            className="primary-action"
            onClick={() => {
              setCurrentWidget({
                name: "",
                description: "",
                status: "active",
                position: "dashboard",
                visibility: true
              })
              setIsEditing(false)
              setShowModal(true)
            }}
          >
            <MdAdd /> Add Widget
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-section">
        <div className="stat-card stat-card-primary">
          <div className="stat-icon">
            <MdWidgets />
          </div>
          <div className="stat-details">
            <div className="stat-value">{widgets.length}</div>
            <div className="stat-label">Total Widgets</div>
          </div>
        </div>
        <div className="stat-card stat-card-success">
          <div className="stat-icon">
            <MdCheckCircle />
          </div>
          <div className="stat-details">
            <div className="stat-value">{activeWidgets}</div>
            <div className="stat-label">Active Widgets</div>
          </div>
        </div>
        <div className="stat-card stat-card-warning">
          <div className="stat-icon">
            <MdVisibility />
          </div>
          <div className="stat-details">
            <div className="stat-value">{visibleWidgets}</div>
            <div className="stat-label">Visible Widgets</div>
          </div>
        </div>
        <div className="stat-card stat-card-info">
          <div className="stat-icon">
            <MdSettings />
          </div>
          <div className="stat-details">
            <div className="stat-value">{uniquePositions}</div>
            <div className="stat-label">Positions</div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="search-input-container">
          <MdSearch className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search widgets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="filter-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button
          className="refresh-button"
          onClick={() => window.location.reload()}
          title="Refresh"
        >
          <MdRefresh />
        </button>
      </div>

      {/* Widgets Table */}
      <div className="section-card">
        <div className="section-header">
          <h2>Widgets</h2>
          <span className="section-count">{filteredWidgets.length} widget(s) found</span>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Position</th>
                <th>Visibility</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedWidgets.length > 0 ? (
                paginatedWidgets.map(widget => (
                  <tr key={widget.id}>
                    <td>
                      <div className="widget-details-cell">
                        <div className="widget-name">{widget.name}</div>
                        <div className="widget-date">Created: {widget.createdAt}</div>
                      </div>
                    </td>
                    <td>
                      <div className="widget-description">
                        {widget.description}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge status-${widget.status}`}>
                        {widget.status}
                      </span>
                    </td>
                    <td>
                      <span className="position-badge">
                        {widget.position}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`visibility-toggle ${widget.visibility ? 'visible' : 'hidden'}`}
                        onClick={() => toggleVisibility(widget.id)}
                      >
                        {widget.visibility ? (
                          <>
                            <MdVisibility /> Visible
                          </>
                        ) : (
                          <>
                            <MdVisibilityOff /> Hidden
                          </>
                        )}
                      </button>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-btn edit-btn"
                          onClick={() => handleEdit(widget)}
                          title="Edit"
                        >
                          <MdEdit />
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDelete(widget.id)}
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
                  <td colSpan="6" className="no-data">
                    No widgets found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          <Pagination
            current={pagination.page}
            total={filteredWidgets.length}
            limit={pagination.limit}
            onChange={(page) => setPagination(prev => ({ ...prev, page }))}
            darkMode={darkMode}
          />
        </div>
      </div>

      {/* Add/Edit Widget Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-left">
                <MdWidgets className="modal-icon" />
                <h2>{isEditing ? "Edit Widget" : "Add New Widget"}</h2>
              </div>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="widget-form">
                  <div className="form-group">
                    <label className="form-label">Widget Name *</label>
                    <input
                      type="text"
                      name="name"
                      className="form-input"
                      value={currentWidget?.name || ""}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                      name="description"
                      className="form-textarea"
                      rows="3"
                      value={currentWidget?.description || ""}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Status</label>
                      <select
                        name="status"
                        className="form-select"
                        value={currentWidget?.status || "active"}
                        onChange={handleInputChange}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="draft">Draft</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Position</label>
                      <select
                        name="position"
                        className="form-select"
                        value={currentWidget?.position || "dashboard"}
                        onChange={handleInputChange}
                      >
                        <option value="dashboard">Dashboard</option>
                        <option value="analytics">Analytics</option>
                        <option value="sidebar">Sidebar</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-checkbox">
                      <input
                        type="checkbox"
                        name="visibility"
                        checked={currentWidget?.visibility || false}
                        onChange={handleInputChange}
                      />
                      <span>Visible</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="modal-button modal-button-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="modal-button modal-button-primary">
                  <MdAdd /> {isEditing ? "Update Widget" : "Add Widget"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Widgets