// src\pages\Audiences\AudienceSegmentation.jsx

"use client"

import { useState } from "react"
import { MdSegment, MdAdd, MdRefresh, MdSearch, MdSave, MdVisibility, MdEdit, MdDownload, MdDelete, MdSettings, MdPeople, MdTrendingUp, MdCheckCircle, MdFilterAlt } from "react-icons/md"
import Pagination from "../../components/Pagination/Pagination.jsx"

const AudienceSegmentation = ({ darkMode }) => {
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 })
  const [loading, setLoading] = useState(false)
  const [segments, setSegments] = useState([
    {
      id: 1,
      name: "High-Value Customers",
      description: "Customers with high engagement and purchase history",
      criteria: "Purchase > $1000 AND Engagement > 80%",
      size: 1247,
      status: "Active",
      created: "2024-01-10",
    },
    {
      id: 2,
      name: "New Users",
      description: "Users who joined in the last 30 days",
      criteria: "Registration Date > 30 days ago",
      size: 456,
      status: "Active",
      created: "2024-01-08",
    },
    {
      id: 3,
      name: "Inactive Users",
      description: "Users with no activity in the last 90 days",
      criteria: "Last Activity > 90 days ago",
      size: 789,
      status: "Draft",
      created: "2024-01-05",
    },
  ])

  const [showModal, setShowModal] = useState(false)
  const [currentSegment, setCurrentSegment] = useState({
    name: "",
    description: "",
    criteria: "",
  })

  const [filters, setFilters] = useState({
    demographic: "",
    behavior: "",
    engagement: "",
    purchase: "",
  })

  const handleCreateSegment = () => {
    setCurrentSegment({ name: "", description: "", criteria: "" })
    setShowModal(true)
  }

  const handleSaveSegment = () => {
    if (currentSegment.name.trim()) {
      const newSegment = {
        ...currentSegment,
        id: Date.now(),
        size: Math.floor(Math.random() * 1000) + 100,
        status: "Draft",
        created: new Date().toISOString().split("T")[0],
      }
      setSegments([...segments, newSegment])
      setShowModal(false)
    }
  }

  const deleteSegment = (id) => {
    setSegments(segments.filter((s) => s.id !== id))
  }

  const indexOfLastItem = pagination.page * pagination.limit
  const indexOfFirstItem = indexOfLastItem - pagination.limit
  const currentSegments = segments.slice(indexOfFirstItem, indexOfLastItem)

  const totalContacts = segments.reduce((sum, seg) => sum + seg.size, 0)
  const activeSegments = segments.filter(s => s.status === 'Active').length
  const draftSegments = segments.filter(s => s.status === 'Draft').length

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading segments...</p>
      </div>
    )
  }

  return (
    <div className="audience-segmentation-container">
      {/* Page Header */}
      <div className="page-header-section">
        <div className="page-header-content">
          <div className="page-title-wrapper">
            <div className="page-icon">
              <MdSegment />
            </div>
            <div>
              <h1 className="page-title">Audience Segmentation</h1>
              <p className="page-subtitle">Create and manage audience segments for targeted surveys</p>
            </div>
          </div>
          <div className="page-actions">
            <button className="action-button secondary-action" onClick={() => setLoading(true)}>
              <MdRefresh /> Refresh
            </button>
            <button className="action-button primary-action" onClick={handleCreateSegment}>
              <MdAdd /> Create Segment
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-section">
        <div className="stat-card primary-card">
          <div className="stat-icon">
            <MdSegment />
          </div>
          <div className="stat-content">
            <div className="stat-value">{segments.length}</div>
            <div className="stat-label">Total Segments</div>
          </div>
        </div>
        <div className="stat-card success-card">
          <div className="stat-icon">
            <MdCheckCircle />
          </div>
          <div className="stat-content">
            <div className="stat-value">{activeSegments}</div>
            <div className="stat-label">Active Segments</div>
          </div>
        </div>
        <div className="stat-card info-card">
          <div className="stat-icon">
            <MdPeople />
          </div>
          <div className="stat-content">
            <div className="stat-value">{totalContacts.toLocaleString()}</div>
            <div className="stat-label">Total Contacts</div>
          </div>
        </div>
        <div className="stat-card warning-card">
          <div className="stat-icon">
            <MdTrendingUp />
          </div>
          <div className="stat-content">
            <div className="stat-value">{draftSegments}</div>
            <div className="stat-label">Draft Segments</div>
          </div>
        </div>
      </div>

      {/* Segment Builder Section */}
      <div className="section-card segment-builder-section">
        <div className="section-header">
          <div className="section-title-wrapper">
            <h2 className="section-title">
              <MdFilterAlt /> Quick Segment Builder
            </h2>
            <p className="section-subtitle">Build segments using demographic and behavioral filters</p>
          </div>
        </div>

        <div className="filter-grid">
          <div className="filter-group">
            <label className="filter-label">Demographics</label>
            <select
              className="filter-select"
              value={filters.demographic}
              onChange={(e) => setFilters({ ...filters, demographic: e.target.value })}
            >
              <option value="">All Demographics</option>
              <option value="age_18_25">Age 18-25</option>
              <option value="age_26_35">Age 26-35</option>
              <option value="age_36_50">Age 36-50</option>
              <option value="age_50_plus">Age 50+</option>
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">Behavior</label>
            <select
              className="filter-select"
              value={filters.behavior}
              onChange={(e) => setFilters({ ...filters, behavior: e.target.value })}
            >
              <option value="">All Behaviors</option>
              <option value="frequent_user">Frequent User</option>
              <option value="occasional_user">Occasional User</option>
              <option value="new_user">New User</option>
              <option value="inactive_user">Inactive User</option>
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">Engagement</label>
            <select
              className="filter-select"
              value={filters.engagement}
              onChange={(e) => setFilters({ ...filters, engagement: e.target.value })}
            >
              <option value="">All Engagement</option>
              <option value="high">High Engagement</option>
              <option value="medium">Medium Engagement</option>
              <option value="low">Low Engagement</option>
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">Purchase History</label>
            <select
              className="filter-select"
              value={filters.purchase}
              onChange={(e) => setFilters({ ...filters, purchase: e.target.value })}
            >
              <option value="">All Customers</option>
              <option value="high_value">High Value ($1000+)</option>
              <option value="medium_value">Medium Value ($100-$999)</option>
              <option value="low_value">Low Value ($0-$99)</option>
            </select>
          </div>
        </div>

        <div className="builder-actions">
          <button className="preview-btn">
            <MdSearch /> Preview Segment
          </button>
          <button className="save-segment-btn">
            <MdSave /> Save as Segment
          </button>
        </div>
      </div>

      {/* Segments List Section */}
      <div className="section-card segments-list-section">
        <div className="section-header">
          <div className="section-title-wrapper">
            <h2 className="section-title">Existing Segments</h2>
            <p className="section-subtitle">View and manage all audience segments</p>
          </div>
          <button className="section-action">
            <MdSettings /> Settings
          </button>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Segment Name</th>
                <th>Description</th>
                <th className="criteria-column">Criteria</th>
                <th>Size</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentSegments.map((segment) => (
                <tr key={segment.id}>
                  <td>
                    <div className="segment-name">{segment.name}</div>
                    <div className="segment-date">
                      Created: {new Date(segment.created).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    <div className="segment-description">
                      {segment.description}
                    </div>
                  </td>
                  <td className="criteria-column">
                    <code className="criteria-code">{segment.criteria}</code>
                  </td>
                  <td>
                    <div className="segment-size">{segment.size.toLocaleString()}</div>
                    <div className="size-label">contacts</div>
                  </td>
                  <td>
                    <span className={`status-badge ${segment.status.toLowerCase()}-status`}>
                      {segment.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn view-btn" title="View Details">
                        <MdVisibility />
                      </button>
                      <button className="action-btn edit-btn" title="Edit">
                        <MdEdit />
                      </button>
                      <button className="action-btn download-btn" title="Export">
                        <MdDownload />
                      </button>
                      <button
                        className="action-btn delete-btn"
                        title="Delete"
                        onClick={() => deleteSegment(segment.id)}
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

        <div className="table-footer">
          <Pagination
            current={pagination.page}
            total={segments.length}
            limit={pagination.limit}
            onChange={(page) => setPagination((prev) => ({ ...prev, page }))}
            darkMode={darkMode}
          />
        </div>
      </div>

      {/* Create Segment Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                <MdAdd /> Create New Segment
              </h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <form className="segment-form">
                <div className="form-group">
                  <label className="form-label">Segment Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter segment name"
                    value={currentSegment.name}
                    onChange={(e) => setCurrentSegment({ ...currentSegment, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    placeholder="Describe this segment"
                    value={currentSegment.description}
                    onChange={(e) => setCurrentSegment({ ...currentSegment, description: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Criteria</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="Define segment criteria (e.g., Age > 25 AND Location = 'US')"
                    value={currentSegment.criteria}
                    onChange={(e) => setCurrentSegment({ ...currentSegment, criteria: e.target.value })}
                  />
                  <p className="help-text">
                    Use logical operators like AND, OR to combine multiple conditions
                  </p>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="modal-cancel-btn" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="modal-submit-btn" onClick={handleSaveSegment}>
                <MdAdd /> Create Segment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AudienceSegmentation
