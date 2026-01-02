"use client"
import { useState, useEffect } from "react"
import { MdSegment, MdAdd, MdRefresh, MdVisibility, MdEdit, MdDelete, MdPeople, MdFilterAlt, MdAutoAwesome } from "react-icons/md"
import Pagination from "../../components/Pagination/Pagination.jsx"
import axiosInstance from '../../api/axiosInstance.js'
import Swal from "sweetalert2"

const AudienceSegments = ({ darkMode }) => {
  const [loading, setLoading] = useState(false)
  const [segments, setSegments] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showBuilderModal, setShowBuilderModal] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  const [filterOptions, setFilterOptions] = useState({})
  const [previewContacts, setPreviewContacts] = useState([])
  const [previewCount, setPreviewCount] = useState(0)
  
  const [currentSegment, setCurrentSegment] = useState({
    name: "",
    description: "",
    filters: {},
  })
  
  const [viewSegment, setViewSegment] = useState(null)
  const [viewContacts, setViewContacts] = useState([])

  // Filter builder state
  const [filters, setFilters] = useState({
    status: "",
    categoryId: "",
    npsCategory: "",
    npsBelow: "",
    respondedLastDays: "",
    inactiveDays: "",
    invitedButNotResponded: false,
    hasTag: "",
    country: "",
    city: "",
  })

  useEffect(() => {
    fetchSegments()
    fetchFilterOptions()
  }, [])

  // ─────────────────────────────────────────────────────────────
  // FETCH SEGMENTS
  // ─────────────────────────────────────────────────────────────
  const fetchSegments = async () => {
    setLoading(true)
    try {
      const res = await axiosInstance.get('/segments')
      const list = res?.data?.data?.segments || []
      
      // Fetch counts for each segment
      const segmentsWithCounts = await Promise.all(
        list.map(async (seg) => {
          try {
            const countRes = await axiosInstance.get(`/segments/${seg._id}/count`)
            return { ...seg, contactCount: countRes?.data?.data?.count || 0 }
          } catch {
            return { ...seg, contactCount: 0 }
          }
        })
      )
      
      setSegments(segmentsWithCounts)
    } catch (err) {
      console.error("Failed to fetch segments:", err)
    }
    setLoading(false)
  }

  // ─────────────────────────────────────────────────────────────
  // FETCH FILTER OPTIONS (for builder UI)
  // ─────────────────────────────────────────────────────────────
  const fetchFilterOptions = async () => {
    try {
      const res = await axiosInstance.get('/segments/filters/options')
      setFilterOptions(res?.data?.data?.filterOptions || {})
    } catch (err) {
      console.error("Failed to fetch filter options:", err)
    }
  }

  // ─────────────────────────────────────────────────────────────
  // PREVIEW FILTERS (before saving)
  // ─────────────────────────────────────────────────────────────
  const handlePreviewFilters = async () => {
    try {
      // Build clean filters object (remove empty values)
      const cleanFilters = {}
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== "" && value !== false && value !== null) {
          // Convert numeric strings to numbers
          if (['npsBelow', 'npsAbove', 'respondedLastDays', 'inactiveDays', 'activeDays', 'createdLastDays'].includes(key)) {
            cleanFilters[key] = parseInt(value)
          } else {
            cleanFilters[key] = value
          }
        }
      })

      const res = await axiosInstance.post('/segments/preview?limit=5', { filters: cleanFilters })
      const data = res?.data?.data || {}
      
      setPreviewContacts(data.contacts || [])
      setPreviewCount(data.total || 0)
      
      Swal.fire({
        title: `Preview: ${data.total || 0} contacts match`,
        html: data.contacts?.length > 0 
          ? `<ul style="text-align:left">${data.contacts.slice(0, 5).map(c => `<li>${c.name} (${c.email})</li>`).join('')}</ul>
             ${data.total > 5 ? `<p>...and ${data.total - 5} more</p>` : ''}`
          : '<p>No contacts match these filters</p>',
        icon: 'info',
      })
    } catch (err) {
      console.error(err)
      Swal.fire("Error", err?.response?.data?.message || "Preview failed", "error")
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CREATE/UPDATE SEGMENT
  // ─────────────────────────────────────────────────────────────
  const handleSaveSegment = async () => {
    if (!currentSegment.name.trim()) {
      Swal.fire("Error", "Segment name is required", "error")
      return
    }

    // Build clean filters
    const cleanFilters = {}
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== "" && value !== false && value !== null) {
        if (['npsBelow', 'npsAbove', 'respondedLastDays', 'inactiveDays', 'activeDays', 'createdLastDays'].includes(key)) {
          cleanFilters[key] = parseInt(value)
        } else {
          cleanFilters[key] = value
        }
      }
    })

    if (Object.keys(cleanFilters).length === 0) {
      Swal.fire("Error", "At least one filter is required", "error")
      return
    }

    try {
      const payload = {
        name: currentSegment.name.trim(),
        description: currentSegment.description || '',
        filters: cleanFilters,
      }

      if (modalMode === 'edit' && currentSegment._id) {
        await axiosInstance.put(`/segments/${currentSegment._id}`, payload)
        Swal.fire({ icon: "success", title: "Segment Updated", timer: 1500, showConfirmButton: false })
      } else {
        await axiosInstance.post('/segments', payload)
        Swal.fire({ icon: "success", title: "Segment Created", timer: 1500, showConfirmButton: false })
      }

      fetchSegments()
      setShowBuilderModal(false)
      resetFilters()

    } catch (err) {
      console.error(err)
      Swal.fire("Error", err?.response?.data?.message || "Failed to save segment", "error")
    }
  }

  // ─────────────────────────────────────────────────────────────
  // VIEW SEGMENT CONTACTS
  // ─────────────────────────────────────────────────────────────
  const handleViewSegment = async (seg) => {
    try {
      const res = await axiosInstance.get(`/segments/${seg._id}/contacts?limit=20`)
      const data = res?.data?.data || {}
      
      setViewSegment(seg)
      setViewContacts(data.items || [])
      setShowViewModal(true)
    } catch (err) {
      console.error(err)
      Swal.fire("Error", "Failed to load segment contacts", "error")
    }
  }

  // ─────────────────────────────────────────────────────────────
  // EDIT SEGMENT
  // ─────────────────────────────────────────────────────────────
  const handleEditSegment = (seg) => {
    if (seg.isSystem) {
      Swal.fire("Info", "System segments cannot be edited", "info")
      return
    }
    
    setCurrentSegment({
      _id: seg._id,
      name: seg.name,
      description: seg.description || '',
      filters: seg.filters || {},
    })
    
    // Populate filter form from segment
    setFilters({
      status: seg.filters?.status || "",
      categoryId: seg.filters?.categoryId || "",
      npsCategory: seg.filters?.npsCategory || "",
      npsBelow: seg.filters?.npsBelow?.toString() || "",
      respondedLastDays: seg.filters?.respondedLastDays?.toString() || "",
      inactiveDays: seg.filters?.inactiveDays?.toString() || "",
      invitedButNotResponded: seg.filters?.invitedButNotResponded || false,
      hasTag: seg.filters?.hasTag || "",
      country: seg.filters?.country || "",
      city: seg.filters?.city || "",
    })
    
    setModalMode('edit')
    setShowBuilderModal(true)
  }

  // ─────────────────────────────────────────────────────────────
  // DELETE SEGMENT
  // ─────────────────────────────────────────────────────────────
  const handleDeleteSegment = (seg) => {
    if (seg.isSystem) {
      Swal.fire("Info", "System segments cannot be deleted", "info")
      return
    }

    Swal.fire({
      title: 'Delete Segment?',
      text: "This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.delete(`/segments/${seg._id}`)
          fetchSegments()
          Swal.fire('Deleted!', 'Segment has been deleted.', 'success')
        } catch (err) {
          Swal.fire('Error', err?.response?.data?.message || 'Failed to delete', 'error')
        }
      }
    })
  }

  // ─────────────────────────────────────────────────────────────
  // RESET FILTERS
  // ─────────────────────────────────────────────────────────────
  const resetFilters = () => {
    setFilters({
      status: "",
      categoryId: "",
      npsCategory: "",
      npsBelow: "",
      respondedLastDays: "",
      inactiveDays: "",
      invitedButNotResponded: false,
      hasTag: "",
      country: "",
      city: "",
    })
    setCurrentSegment({ name: "", description: "", filters: {} })
    setPreviewContacts([])
    setPreviewCount(0)
  }

  // ─────────────────────────────────────────────────────────────
  // OPEN CREATE MODAL
  // ─────────────────────────────────────────────────────────────
  const handleCreateSegment = () => {
    resetFilters()
    setModalMode('create')
    setShowBuilderModal(true)
  }

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────
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
            <div className="page-icon"><MdSegment /></div>
            <div>
              <h1 className="page-title">Audience Segments</h1>
              <p className="page-subtitle">Dynamic, rule-based contact segments for targeted surveys</p>
            </div>
          </div>
          <div className="page-actions">
            <button className="action-button secondary-action" onClick={fetchSegments}>
              <MdRefresh /> Refresh
            </button>
            <button className="action-button primary-action" onClick={handleCreateSegment}>
              <MdAdd /> Create Segment
            </button>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="alert alert-info d-flex align-items-center mb-4">
        <MdAutoAwesome className="me-2" size={24} />
        <div>
          <strong>Dynamic Segments:</strong> Contacts are automatically included based on matching rules. 
          No manual assignment needed - segment membership updates in real-time!
        </div>
      </div>

      {/* Segments Table */}
      <div className="section-card">
        <div className="p-4 border-bottom">
          <h2 className="section-title">All Segments</h2>
          <p className="section-subtitle">System and custom segments</p>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table w-full">
            <thead>
              <tr>
                <th>Segment Name</th>
                <th>Description</th>
                <th>Type</th>
                <th>Matching Contacts</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {segments.map((seg) => (
                <tr key={seg._id}>
                  <td>
                    <div className="segment-name">
                      {seg.name}
                      {seg.isSystem && <span className="badge bg-info ms-2">System</span>}
                    </div>
                    <div className="segment-date text-muted small">
                      {seg.createdAt ? new Date(seg.createdAt).toLocaleDateString() : ''}
                    </div>
                  </td>
                  <td>{seg.description || '-'}</td>
                  <td>
                    <span className={`badge ${seg.isSystem ? 'bg-secondary' : 'bg-primary'}`}>
                      {seg.isSystem ? 'System' : 'Custom'}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      <MdPeople className="me-1" />
                      <strong>{seg.contactCount?.toLocaleString() || 0}</strong>
                      <span className="ms-1 text-muted">contacts</span>
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="icon-btn view-btn" onClick={() => handleViewSegment(seg)} title="View Contacts">
                        <MdVisibility />
                      </button>
                      {!seg.isSystem && (
                        <>
                          <button className="icon-btn edit-btn" onClick={() => handleEditSegment(seg)} title="Edit">
                            <MdEdit />
                          </button>
                          <button className="icon-btn delete-btn" onClick={() => handleDeleteSegment(seg)} title="Delete">
                            <MdDelete />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {segments.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-4">No segments found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Segment Builder Modal */}
      {showBuilderModal && (
        <div className="modal-overlay" onClick={() => setShowBuilderModal(false)}>
          <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><MdFilterAlt className="me-2" />{modalMode === 'edit' ? 'Edit Segment' : 'Create Segment'}</h3>
              <button className="modal-close" onClick={() => setShowBuilderModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {/* Segment Info */}
              <div className="row mb-4">
                <div className="col-md-6">
                  <label className="form-label">Segment Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., Unhappy Customers, VIP Clients"
                    value={currentSegment.name}
                    onChange={(e) => setCurrentSegment({ ...currentSegment, name: e.target.value })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Description</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Brief description"
                    value={currentSegment.description}
                    onChange={(e) => setCurrentSegment({ ...currentSegment, description: e.target.value })}
                  />
                </div>
              </div>

              {/* Filter Builder */}
              <h5 className="mb-3">Define Rules (contacts matching ALL these will be included)</h5>
              
              <div className="row g-3">
                {/* Status */}
                <div className="col-md-4">
                  <label className="form-label">Status</label>
                  <select className="form-select" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                    <option value="">Any Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Blocked">Blocked</option>
                  </select>
                </div>

                {/* NPS Category */}
                <div className="col-md-4">
                  <label className="form-label">NPS Category</label>
                  <select className="form-select" value={filters.npsCategory} onChange={(e) => setFilters({ ...filters, npsCategory: e.target.value })}>
                    <option value="">Any NPS</option>
                    <option value="promoter">Promoters (9-10)</option>
                    <option value="passive">Passives (7-8)</option>
                    <option value="detractor">Detractors (0-6)</option>
                  </select>
                </div>

                {/* NPS Below */}
                <div className="col-md-4">
                  <label className="form-label">NPS Score Below</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="e.g., 6"
                    min="0"
                    max="10"
                    value={filters.npsBelow}
                    onChange={(e) => setFilters({ ...filters, npsBelow: e.target.value })}
                  />
                </div>

                {/* Responded Last Days */}
                <div className="col-md-4">
                  <label className="form-label">Responded in Last (days)</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="e.g., 30"
                    min="1"
                    value={filters.respondedLastDays}
                    onChange={(e) => setFilters({ ...filters, respondedLastDays: e.target.value })}
                  />
                </div>

                {/* Inactive Days */}
                <div className="col-md-4">
                  <label className="form-label">Inactive for (days)</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="e.g., 90"
                    min="1"
                    value={filters.inactiveDays}
                    onChange={(e) => setFilters({ ...filters, inactiveDays: e.target.value })}
                  />
                </div>

                {/* Has Tag */}
                <div className="col-md-4">
                  <label className="form-label">Has Tag</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., VIP"
                    value={filters.hasTag}
                    onChange={(e) => setFilters({ ...filters, hasTag: e.target.value })}
                  />
                </div>

                {/* Country */}
                <div className="col-md-4">
                  <label className="form-label">Country</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., US"
                    value={filters.country}
                    onChange={(e) => setFilters({ ...filters, country: e.target.value })}
                  />
                </div>

                {/* City */}
                <div className="col-md-4">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., New York"
                    value={filters.city}
                    onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                  />
                </div>

                {/* Invited but not responded */}
                <div className="col-md-4">
                  <label className="form-label">&nbsp;</label>
                  <div className="form-check mt-2">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="invitedNotResponded"
                      checked={filters.invitedButNotResponded}
                      onChange={(e) => setFilters({ ...filters, invitedButNotResponded: e.target.checked })}
                    />
                    <label className="form-check-label" htmlFor="invitedNotResponded">
                      Invited but never responded
                    </label>
                  </div>
                </div>
              </div>

              {/* Preview */}
              {previewCount > 0 && (
                <div className="alert alert-success mt-4">
                  <strong>{previewCount}</strong> contacts match these rules
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline-secondary" onClick={resetFilters}>Reset</button>
              <button className="btn btn-outline-info" onClick={handlePreviewFilters}>
                <MdVisibility className="me-1" /> Preview
              </button>
              <button className="btn btn-secondary" onClick={() => setShowBuilderModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveSegment}>
                {modalMode === 'edit' ? 'Update Segment' : 'Create Segment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Segment Contacts Modal */}
      {showViewModal && viewSegment && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <MdPeople className="me-2" />
                {viewSegment.name} - Matching Contacts
              </h3>
              <button className="modal-close" onClick={() => setShowViewModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {/* Segment Info */}
              <div className="alert alert-light mb-3">
                <strong>Rules:</strong> {JSON.stringify(viewSegment.filters || {})}
              </div>
              
              {/* Contacts Table */}
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Company</th>
                    <th>NPS</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {viewContacts.map((c) => (
                    <tr key={c._id}>
                      <td>{c.name}</td>
                      <td>{c.email}</td>
                      <td>{c.company || '-'}</td>
                      <td>
                        {c.surveyStats?.latestNpsScore !== undefined 
                          ? <span className={`badge ${c.surveyStats.npsCategory === 'promoter' ? 'bg-success' : c.surveyStats.npsCategory === 'detractor' ? 'bg-danger' : 'bg-warning'}`}>
                              {c.surveyStats.latestNpsScore}
                            </span>
                          : '-'
                        }
                      </td>
                      <td>
                        <span className={`badge ${c.status === 'Active' ? 'bg-success' : 'bg-secondary'}`}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {viewContacts.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center">No contacts match this segment</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowViewModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AudienceSegments