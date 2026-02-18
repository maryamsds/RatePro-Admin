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
      <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--light-bg)] dark:bg-[var(--dark-bg)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary-color)]"></div>
        <p className="mt-4 text-[var(--light-text)] dark:text-[var(--dark-text)]">Loading audiences...</p>
      </div>
    )
  }

  return (
    <div className="p-6 bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] min-h-screen">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-[var(--primary-color)] bg-opacity-10 flex items-center justify-center text-[var(--primary-color)] text-2xl">
              <MdPeople />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">Audience Management</h1>
              <p className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-70">Create and manage audience segments for targeted surveys</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--light-card)] dark:bg-[var(--dark-card)] border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)] hover:border-[var(--primary-color)] transition-colors" 
              onClick={() => setLoading(true)}
            >
              <MdRefresh /> Refresh
            </button>
            <button 
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--primary-color)] text-white hover:opacity-90 transition-opacity" 
              onClick={() => setShowForm(true)}
            >
              <MdAdd /> Create Audience
            </button>
            <button 
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--light-card)] dark:bg-[var(--dark-card)] border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)] hover:border-[var(--primary-color)] transition-colors" 
              onClick={() => setImportModal(true)}
            >
              <MdImportExport /> Import
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-lg p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[var(--primary-color)] bg-opacity-10 flex items-center justify-center text-[var(--primary-color)] text-2xl">
            <MdGroup />
          </div>
          <div>
            <div className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">{audiences.length}</div>
            <div className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-70">Total Audiences</div>
          </div>
        </div>
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-lg p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[var(--success-color)] bg-opacity-10 flex items-center justify-center text-[var(--success-color)] text-2xl">
            <MdCheckCircle />
          </div>
          <div>
            <div className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">{activeAudiences}</div>
            <div className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-70">Active Audiences</div>
          </div>
        </div>
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-lg p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[var(--info-color)] bg-opacity-10 flex items-center justify-center text-[var(--info-color)] text-2xl">
            <MdPeople />
          </div>
          <div>
            <div className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">{totalMembers}</div>
            <div className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-70">Total Members</div>
          </div>
        </div>
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-lg p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[var(--warning-color)] bg-opacity-10 flex items-center justify-center text-[var(--warning-color)] text-2xl">
            <MdTrendingUp />
          </div>
          <div>
            <div className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">{audiences.filter(a => a.filters.length > 0).length}</div>
            <div className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-70">Filtered Audiences</div>
          </div>
        </div>
      </div>

      {/* Audience Form Section */}
      {showForm && (
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-lg p-6 mb-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">{currentAudience.id ? 'Edit' : 'Create'} Audience</h2>
          </div>
          <form onSubmit={saveAudience} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-2">Audience Name</label>
              <input
                type="text"
                className="w-full px-4 py-2 rounded-lg bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:border-[var(--primary-color)] transition-colors"
                placeholder="Enter audience name"
                value={currentAudience.name}
                onChange={(e) => setCurrentAudience({ ...currentAudience, name: e.target.value })}
                required
              />
            </div>

            <div className="bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-lg p-4">
              <div className="mb-4">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">
                  <MdFilterAlt /> Audience Filters
                </h3>
                <p className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-70 mt-1">Define criteria to segment your audience</p>
              </div>
              
              <div className="space-y-3">
                {currentAudience.filters.map((filter, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <div className="flex-1">
                      <select
                        className="w-full px-3 py-2 rounded-lg bg-[var(--light-card)] dark:bg-[var(--dark-card)] border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:border-[var(--primary-color)] transition-colors"
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
                    <div className="flex-1">
                      <select
                        className="w-full px-3 py-2 rounded-lg bg-[var(--light-card)] dark:bg-[var(--dark-card)] border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:border-[var(--primary-color)] transition-colors"
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
                    <div className="flex-1">
                      <input
                        type="text"
                        className="w-full px-3 py-2 rounded-lg bg-[var(--light-card)] dark:bg-[var(--dark-card)] border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:border-[var(--primary-color)] transition-colors"
                        placeholder="Enter value"
                        value={filter.value}
                        onChange={(e) => handleFilterChange(index, 'value', e.target.value)}
                        required
                      />
                    </div>
                    <button
                      type="button"
                      className="w-10 h-10 flex items-center justify-center rounded-lg bg-[var(--danger-color)] bg-opacity-10 text-[var(--danger-color)] hover:bg-opacity-20 transition-all"
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
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--light-card)] dark:bg-[var(--dark-card)] border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)] hover:border-[var(--primary-color)] transition-colors mt-4"
                onClick={addFilter}
              >
                <MdFilterAlt /> Add Filter
              </button>
            </div>

            <div className="flex gap-3">
              <button 
                type="submit" 
                className="flex items-center gap-2 px-6 py-2 rounded-lg bg-[var(--primary-color)] text-white hover:opacity-90 transition-opacity"
              >
                <MdSave /> Save Audience
              </button>
              <button
                type="button"
                className="flex items-center gap-2 px-6 py-2 rounded-lg bg-[var(--light-card)] dark:bg-[var(--dark-card)] border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)] hover:border-[var(--danger-color)] hover:text-[var(--danger-color)] transition-colors"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setImportModal(false)}>
          <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-lg w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <h2 className="flex items-center gap-2 text-xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">
                <MdImportExport /> Import Audience
              </h2>
              <button 
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] transition-colors" 
                onClick={() => setImportModal(false)}
              >
                <MdClose />
              </button>
            </div>
            <form onSubmit={handleImport}>
              <div className="p-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-2">CSV File</label>
                  <input
                    type="file"
                    className="w-full px-4 py-2 rounded-lg bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:border-[var(--primary-color)] transition-colors"
                    accept=".csv"
                    onChange={(e) => setFile(e.target.files[0])}
                    required
                  />
                  <p className="text-xs text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-70 mt-2">
                    CSV should contain columns: email, name, and any additional demographic data
                  </p>
                </div>
              </div>
              <div className="flex gap-3 p-6 border-t border-[var(--light-border)] dark:border-[var(--dark-border)]">
                <button 
                  type="submit" 
                  className="flex items-center gap-2 px-6 py-2 rounded-lg bg-[var(--primary-color)] text-white hover:opacity-90 transition-opacity"
                >
                  <MdImportExport /> Import
                </button>
                <button
                  type="button"
                  className="flex items-center gap-2 px-6 py-2 rounded-lg bg-[var(--light-card)] dark:bg-[var(--dark-card)] border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)] hover:border-[var(--danger-color)] hover:text-[var(--danger-color)] transition-colors"
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
      <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-lg">
        <div className="flex items-center justify-between p-6 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div>
            <h2 className="text-xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">Audiences</h2>
            <p className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-70 mt-1">Manage your audience segments</p>
          </div>
          <button 
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)] hover:border-[var(--primary-color)] transition-colors" 
            onClick={() => {}}
          >
            <MdSettings /> Settings
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] uppercase tracking-wider">Members</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] uppercase tracking-wider">Filters</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentAudiences.map(audience => (
                <tr key={audience.id} className="border-b border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">{audience.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">{audience.count}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {audience.filters.map((filter, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[var(--primary-color)] bg-opacity-10 text-xs">
                          <span className="font-medium text-[var(--primary-color)]">{filter.field}</span>
                          <span className="text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-70">{filter.operator}</span>
                          <span className="text-[var(--light-text)] dark:text-[var(--dark-text)]">{filter.value}</span>
                        </span>
                      ))}
                      {audience.filters.length === 0 && (
                        <span className="text-xs text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-50">No filters</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--info-color)] bg-opacity-10 text-[var(--info-color)] hover:bg-opacity-20 transition-all"
                        onClick={() => {
                          setCurrentAudience(audience)
                          setShowForm(true)
                        }}
                        title="Edit audience"
                      >
                        <MdEdit />
                      </button>
                      <button
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--danger-color)] bg-opacity-10 text-[var(--danger-color)] hover:bg-opacity-20 transition-all"
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

        <div className="p-6 border-t border-[var(--light-border)] dark:border-[var(--dark-border)]">
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