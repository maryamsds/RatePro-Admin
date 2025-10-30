// src/pages/Audiences/Audiences.jsx
"use client"

import { useState } from "react"
import { MdPeople, MdAdd, MdEdit, MdDelete, MdImportExport, MdFilterAlt, MdSave, MdClose, MdRefresh, MdSettings, MdGroup, MdTrendingUp, MdCheckCircle } from "react-icons/md"
import Pagination from "../../components/Pagination/Pagination.jsx"

const Audiences = ({ darkMode }) => {
  const [audiences, setAudiences] = useState([
    { id: 1, name: "Premium Customers", count: 245, filters: [{ field: "rating", operator: ">=", value: "4" }] },
    { id: 2, name: "US Customers", count: 189, filters: [{ field: "country", operator: "=", value: "US" }] }
  ])
  const [showForm, setShowForm] = useState(false)
  const [currentAudience, setCurrentAudience] = useState({
    name: '',
    filters: []
  })
  const [importModal, setImportModal] = useState(false)
  const [file, setFile] = useState(null)
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 })
  const [loading, setLoading] = useState(false)

  const addFilter = () => {
    setCurrentAudience(prev => ({
      ...prev,
      filters: [...prev.filters, { field: '', operator: '=', value: '' }]
    }))
  }

  const handleFilterChange = (index, key, value) => {
    const newFilters = [...currentAudience.filters]
    newFilters[index][key] = value
    setCurrentAudience(prev => ({ ...prev, filters: newFilters }))
  }

  const removeFilter = (index) => {
    const newFilters = [...currentAudience.filters]
    newFilters.splice(index, 1)
    setCurrentAudience(prev => ({ ...prev, filters: newFilters }))
  }

  const saveAudience = (e) => {
    e.preventDefault()
    if (currentAudience.id) {
      setAudiences(audiences.map(a =>
        a.id === currentAudience.id ? currentAudience : a
      ))
    } else {
      setAudiences([...audiences, {
        ...currentAudience,
        id: Date.now(),
        count: 0
      }])
    }
    setShowForm(false)
    setCurrentAudience({ name: '', filters: [] })
  }

  const handleImport = (e) => {
    e.preventDefault()
    // Process file import
    console.log('Importing file:', file)
    setImportModal(false)
    setFile(null)
  }

  const indexOfLastItem = pagination.page * pagination.limit
  const indexOfFirstItem = indexOfLastItem - pagination.limit
  const currentAudiences = audiences.slice(indexOfFirstItem, indexOfLastItem)

  const totalMembers = audiences.reduce((sum, aud) => sum + aud.count, 0)
  const activeAudiences = audiences.filter(a => a.count > 0).length

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading audiences...</p>
      </div>
    )
  }

  return (
    <div className="audiences-container">
      {/* Page Header */}
      <div className="page-header-section">
        <div className="page-header-content">
          <div className="page-title-wrapper">
            <div className="page-icon">
              <MdPeople />
            </div>
            <div>
              <h1 className="page-title">Audience Management</h1>
              <p className="page-subtitle">Create and manage audience segments for targeted surveys</p>
            </div>
          </div>
          <div className="page-actions">
            <button className="action-button secondary-action" onClick={() => setLoading(true)}>
              <MdRefresh /> Refresh
            </button>
            <button className="action-button primary-action" onClick={() => setShowForm(true)}>
              <MdAdd /> Create Audience
            </button>
            <button className="action-button secondary-action" onClick={() => setImportModal(true)}>
              <MdImportExport /> Import
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-section">
        <div className="stat-card primary-card">
          <div className="stat-icon">
            <MdGroup />
          </div>
          <div className="stat-content">
            <div className="stat-value">{audiences.length}</div>
            <div className="stat-label">Total Audiences</div>
          </div>
        </div>
        <div className="stat-card success-card">
          <div className="stat-icon">
            <MdCheckCircle />
          </div>
          <div className="stat-content">
            <div className="stat-value">{activeAudiences}</div>
            <div className="stat-label">Active Audiences</div>
          </div>
        </div>
        <div className="stat-card info-card">
          <div className="stat-icon">
            <MdPeople />
          </div>
          <div className="stat-content">
            <div className="stat-value">{totalMembers}</div>
            <div className="stat-label">Total Members</div>
          </div>
        </div>
        <div className="stat-card warning-card">
          <div className="stat-icon">
            <MdTrendingUp />
          </div>
          <div className="stat-content">
            <div className="stat-value">{audiences.filter(a => a.filters.length > 0).length}</div>
            <div className="stat-label">Filtered Audiences</div>
          </div>
        </div>
      </div>

      {/* Audience Form Section */}
      {showForm && (
        <div className="section-card audience-form-section">
          <div className="section-header">
            <h2 className="section-title">{currentAudience.id ? 'Edit' : 'Create'} Audience</h2>
          </div>
          <form onSubmit={saveAudience} className="audience-form">
            <div className="form-group">
              <label className="form-label">Audience Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter audience name"
                value={currentAudience.name}
                onChange={(e) => setCurrentAudience({ ...currentAudience, name: e.target.value })}
                required
              />
            </div>

            <div className="filters-builder">
              <div className="filters-header">
                <h3 className="filters-title">
                  <MdFilterAlt /> Audience Filters
                </h3>
                <p className="filters-description">Define criteria to segment your audience</p>
              </div>
              
              <div className="filter-rows">
                {currentAudience.filters.map((filter, index) => (
                  <div key={index} className="filter-row">
                    <div className="filter-field">
                      <select
                        className="filter-select"
                        value={filter.field}
                        onChange={(e) => handleFilterChange(index, 'field', e.target.value)}
                        required
                      >
                        <option value="">Select Field</option>
                        <option value="country">Country</option>
                        <option value="rating">Rating</option>
                        <option value="age">Age</option>
                        <option value="gender">Gender</option>
                      </select>
                    </div>
                    <div className="filter-operator">
                      <select
                        className="filter-select"
                        value={filter.operator}
                        onChange={(e) => handleFilterChange(index, 'operator', e.target.value)}
                        required
                      >
                        <option value="=">Equals</option>
                        <option value="!=">Not Equals</option>
                        <option value=">">Greater Than</option>
                        <option value="<">Less Than</option>
                        <option value=">=">Greater or Equal</option>
                        <option value="<=">Less or Equal</option>
                        <option value="contains">Contains</option>
                      </select>
                    </div>
                    <div className="filter-value">
                      <input
                        type="text"
                        className="filter-input"
                        placeholder="Enter value"
                        value={filter.value}
                        onChange={(e) => handleFilterChange(index, 'value', e.target.value)}
                        required
                      />
                    </div>
                    <button
                      type="button"
                      className="filter-remove-btn"
                      onClick={() => removeFilter(index)}
                      title="Remove filter"
                    >
                      <MdClose />
                    </button>
                  </div>
                ))}
              </div>
              
              <button
                type="button"
                className="add-filter-btn"
                onClick={addFilter}
              >
                <MdFilterAlt /> Add Filter
              </button>
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn">
                <MdSave /> Save Audience
              </button>
              <button
                type="button"
                className="cancel-btn"
                onClick={() => {
                  setShowForm(false)
                  setCurrentAudience({ name: '', filters: [] })
                }}
              >
                <MdClose /> Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Import Modal */}
      {importModal && (
        <div className="modal-overlay" onClick={() => setImportModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                <MdImportExport /> Import Audience
              </h2>
              <button className="modal-close" onClick={() => setImportModal(false)}>
                <MdClose />
              </button>
            </div>
            <form onSubmit={handleImport}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">CSV File</label>
                  <input
                    type="file"
                    className="file-input"
                    accept=".csv"
                    onChange={(e) => setFile(e.target.files[0])}
                    required
                  />
                  <p className="help-text">
                    CSV should contain columns: email, name, and any additional demographic data
                  </p>
                </div>
              </div>
              <div className="modal-footer">
                <button type="submit" className="modal-submit-btn">
                  <MdImportExport /> Import
                </button>
                <button
                  type="button"
                  className="modal-cancel-btn"
                  onClick={() => setImportModal(false)}
                >
                  <MdClose /> Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Audiences List Section */}
      <div className="section-card audiences-list-section">
        <div className="section-header">
          <div className="section-title-wrapper">
            <h2 className="section-title">Audiences</h2>
            <p className="section-subtitle">Manage your audience segments</p>
          </div>
          <button className="section-action" onClick={() => {}}>
            <MdSettings /> Settings
          </button>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Members</th>
                <th>Filters</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentAudiences.map(audience => (
                <tr key={audience.id}>
                  <td>
                    <div className="audience-name">{audience.name}</div>
                  </td>
                  <td>
                    <div className="member-count">{audience.count}</div>
                  </td>
                  <td>
                    <div className="filter-badges">
                      {audience.filters.map((filter, i) => (
                        <span key={i} className="filter-badge">
                          <span className="filter-field">{filter.field}</span>
                          <span className="filter-operator">{filter.operator}</span>
                          <span className="filter-value">{filter.value}</span>
                        </span>
                      ))}
                      {audience.filters.length === 0 && (
                        <span className="no-filters">No filters</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn edit-btn"
                        onClick={() => {
                          setCurrentAudience(audience)
                          setShowForm(true)
                        }}
                        title="Edit audience"
                      >
                        <MdEdit />
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => setAudiences(audiences.filter(a => a.id !== audience.id))}
                        title="Delete audience"
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
            total={audiences.length}
            limit={pagination.limit}
            onChange={(page) => setPagination((prev) => ({ ...prev, page }))}
            darkMode={darkMode}
          />
        </div>
      </div>
    </div>
  )
}

export default Audiences