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
      <div className="flex items-center justify-center min-h-screen bg-[var(--light-bg)] dark:bg-[var(--dark-bg)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[var(--light-text)] dark:text-[var(--dark-text)]">Loading segments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] min-h-screen">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-[var(--primary-color)] text-white">
              <MdSegment size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">Audience Segments</h1>
              <p className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-70">Dynamic, rule-based contact segments for targeted surveys</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] border border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] flex items-center gap-2"
              onClick={fetchSegments}
            >
              <MdRefresh /> Refresh
            </button>
            <button 
              className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:opacity-90 flex items-center gap-2"
              onClick={handleCreateSegment}
            >
              <MdAdd /> Create Segment
            </button>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="mb-6 bg-[var(--info-color)] bg-opacity-10 border border-[var(--info-color)] border-opacity-30 rounded-md p-4 flex items-start gap-3">
        <MdAutoAwesome className="text-[var(--info-color)] flex-shrink-0" size={24} />
        <div className="text-[var(--light-text)] dark:text-[var(--dark-text)]">
          <strong>Dynamic Segments:</strong> Contacts are automatically included based on matching rules.
          No manual assignment needed - segment membership updates in real-time!
        </div>
      </div>

      {/* Segments Table */}
      <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
        <div className="p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <h2 className="text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">All Segments</h2>
          <p className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-70">System and custom segments</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <tr>
                <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">Segment Name</th>
                <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">Description</th>
                <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">Type</th>
                <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">Matching Contacts</th>
                <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-[var(--light-card)] dark:bg-[var(--dark-card)]">
              {segments.map((seg) => (
                <tr key={seg._id} className="border-b border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[var(--light-text)] dark:text-[var(--dark-text)] font-medium">{seg.name}</span>
                      {seg.isSystem && <span className="px-2 py-1 text-xs rounded-md bg-[var(--info-color)] text-white">System</span>}
                    </div>
                    <div className="text-xs text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-60 mt-1">
                      {seg.createdAt ? new Date(seg.createdAt).toLocaleDateString() : ''}
                    </div>
                  </td>
                  <td className="p-3 text-[var(--light-text)] dark:text-[var(--dark-text)]">{seg.description || '-'}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 text-xs rounded-md ${seg.isSystem ? 'bg-gray-500' : 'bg-[var(--primary-color)]'} text-white`}>
                      {seg.isSystem ? 'System' : 'Custom'}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1 text-[var(--light-text)] dark:text-[var(--dark-text)]">
                      <MdPeople />
                      <strong>{seg.contactCount?.toLocaleString() || 0}</strong>
                      <span className="opacity-60">contacts</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button 
                        className="p-2 rounded-md transition-colors bg-[var(--info-color)] bg-opacity-10 text-[var(--info-color)] hover:bg-opacity-20"
                        onClick={() => handleViewSegment(seg)} 
                        title="View Contacts"
                      >
                        <MdVisibility />
                      </button>
                      {!seg.isSystem && (
                        <>
                          <button 
                            className="p-2 rounded-md transition-colors bg-[var(--warning-color)] bg-opacity-10 text-[var(--warning-color)] hover:bg-opacity-20"
                            onClick={() => handleEditSegment(seg)} 
                            title="Edit"
                          >
                            <MdEdit />
                          </button>
                          <button 
                            className="p-2 rounded-md transition-colors bg-[var(--danger-color)] bg-opacity-10 text-[var(--danger-color)] hover:bg-opacity-20"
                            onClick={() => handleDeleteSegment(seg)} 
                            title="Delete"
                          >
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
                  <td colSpan="5" className="p-4 text-center text-[var(--light-text)] dark:text-[var(--dark-text)]">No segments found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Segment Builder Modal */}
      {showBuilderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowBuilderModal(false)}>
          <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)] sticky top-0 bg-[var(--light-card)] dark:bg-[var(--dark-card)] z-10">
              <h3 className="text-xl font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)] flex items-center gap-2">
                <MdFilterAlt />{modalMode === 'edit' ? 'Edit Segment' : 'Create Segment'}
              </h3>
              <button 
                className="text-2xl text-[var(--light-text)] dark:text-[var(--dark-text)] hover:opacity-70 transition-opacity" 
                onClick={() => setShowBuilderModal(false)}
              >
                ×
              </button>
            </div>
            <div className="p-6">
              {/* Segment Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block mb-2 text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Segment Name *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                    placeholder="e.g., Unhappy Customers, VIP Clients"
                    value={currentSegment.name}
                    onChange={(e) => setCurrentSegment({ ...currentSegment, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Description</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                    placeholder="Brief description"
                    value={currentSegment.description}
                    onChange={(e) => setCurrentSegment({ ...currentSegment, description: e.target.value })}
                  />
                </div>
              </div>

              {/* Filter Builder */}
              <h5 className="mb-4 text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">Define Rules (contacts matching ALL these will be included)</h5>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Status */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Status</label>
                  <select 
                    className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]" 
                    value={filters.status} 
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  >
                    <option value="">Any Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Blocked">Blocked</option>
                  </select>
                </div>

                {/* NPS Category */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">NPS Category</label>
                  <select 
                    className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]" 
                    value={filters.npsCategory} 
                    onChange={(e) => setFilters({ ...filters, npsCategory: e.target.value })}
                  >
                    <option value="">Any NPS</option>
                    <option value="promoter">Promoters (9-10)</option>
                    <option value="passive">Passives (7-8)</option>
                    <option value="detractor">Detractors (0-6)</option>
                  </select>
                </div>

                {/* NPS Below */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">NPS Score Below</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                    placeholder="e.g., 6"
                    min="0"
                    max="10"
                    value={filters.npsBelow}
                    onChange={(e) => setFilters({ ...filters, npsBelow: e.target.value })}
                  />
                </div>

                {/* Responded Last Days */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Responded in Last (days)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                    placeholder="e.g., 30"
                    min="1"
                    value={filters.respondedLastDays}
                    onChange={(e) => setFilters({ ...filters, respondedLastDays: e.target.value })}
                  />
                </div>

                {/* Inactive Days */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Inactive for (days)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                    placeholder="e.g., 90"
                    min="1"
                    value={filters.inactiveDays}
                    onChange={(e) => setFilters({ ...filters, inactiveDays: e.target.value })}
                  />
                </div>

                {/* Has Tag */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Has Tag</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                    placeholder="e.g., VIP"
                    value={filters.hasTag}
                    onChange={(e) => setFilters({ ...filters, hasTag: e.target.value })}
                  />
                </div>

                {/* Country */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Country</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                    placeholder="e.g., US"
                    value={filters.country}
                    onChange={(e) => setFilters({ ...filters, country: e.target.value })}
                  />
                </div>

                {/* City */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">City</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                    placeholder="e.g., New York"
                    value={filters.city}
                    onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                  />
                </div>

                {/* Invited but not responded */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]"
                    id="invitedNotResponded"
                    checked={filters.invitedButNotResponded}
                    onChange={(e) => setFilters({ ...filters, invitedButNotResponded: e.target.checked })}
                  />
                  <label className="ml-2 text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]" htmlFor="invitedNotResponded">
                    Invited but never responded
                  </label>
                </div>
              </div>

              {/* Preview */}
              {previewCount > 0 && (
                <div className="mt-6 bg-[var(--success-color)] bg-opacity-10 border border-[var(--success-color)] border-opacity-30 rounded-md p-4">
                  <span className="text-[var(--light-text)] dark:text-[var(--dark-text)]">
                    <strong>{previewCount}</strong> contacts match these rules
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 p-4 border-t border-[var(--light-border)] dark:border-[var(--dark-border)] sticky bottom-0 bg-[var(--light-card)] dark:bg-[var(--dark-card)]">
              <button 
                className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] border border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)]" 
                onClick={resetFilters}
              >
                Reset
              </button>
              <button 
                className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--info-color)] bg-opacity-10 text-[var(--info-color)] border border-[var(--info-color)] border-opacity-30 hover:bg-opacity-20 flex items-center gap-1" 
                onClick={handlePreviewFilters}
              >
                <MdVisibility /> Preview
              </button>
              <button 
                className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] border border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)]" 
                onClick={() => setShowBuilderModal(false)}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:opacity-90" 
                onClick={handleSaveSegment}
              >
                {modalMode === 'edit' ? 'Update Segment' : 'Create Segment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Segment Contacts Modal */}
      {showViewModal && viewSegment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowViewModal(false)}>
          <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)] sticky top-0 bg-[var(--light-card)] dark:bg-[var(--dark-card)] z-10">
              <h3 className="text-xl font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)] flex items-center gap-2">
                <MdPeople />
                {viewSegment.name} - Matching Contacts
              </h3>
              <button 
                className="text-2xl text-[var(--light-text)] dark:text-[var(--dark-text)] hover:opacity-70 transition-opacity" 
                onClick={() => setShowViewModal(false)}
              >
                ×
              </button>
            </div>
            <div className="p-6">
              {/* Segment Info */}
              <div className="mb-4 bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-md p-4">
                <span className="text-[var(--light-text)] dark:text-[var(--dark-text)]">
                  <strong>Rules:</strong> {JSON.stringify(viewSegment.filters || {})}
                </span>
              </div>

              {/* Contacts Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                    <tr>
                      <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">Name</th>
                      <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">Email</th>
                      <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">Company</th>
                      <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">NPS</th>
                      <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-[var(--light-card)] dark:bg-[var(--dark-card)]">
                    {viewContacts.map((c) => (
                      <tr key={c._id} className="border-b border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] transition-colors">
                        <td className="p-3 text-[var(--light-text)] dark:text-[var(--dark-text)]">{c.name}</td>
                        <td className="p-3 text-[var(--light-text)] dark:text-[var(--dark-text)]">{c.email}</td>
                        <td className="p-3 text-[var(--light-text)] dark:text-[var(--dark-text)]">{c.company || '-'}</td>
                        <td className="p-3">
                          {c.surveyStats?.latestNpsScore !== undefined
                            ? <span className={`px-2 py-1 text-xs rounded-md ${c.surveyStats.npsCategory === 'promoter' ? 'bg-[var(--success-color)]' : c.surveyStats.npsCategory === 'detractor' ? 'bg-[var(--danger-color)]' : 'bg-[var(--warning-color)]'} text-white`}>
                              {c.surveyStats.latestNpsScore}
                            </span>
                            : <span className="text-[var(--light-text)] dark:text-[var(--dark-text)]">-</span>
                          }
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-1 text-xs rounded-md ${c.status === 'Active' ? 'bg-[var(--success-color)]' : 'bg-gray-500'} text-white`}>
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {viewContacts.length === 0 && (
                      <tr>
                        <td colSpan="5" className="p-4 text-center text-[var(--light-text)] dark:text-[var(--dark-text)]">No contacts match this segment</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 p-4 border-t border-[var(--light-border)] dark:border-[var(--dark-border)] sticky bottom-0 bg-[var(--light-card)] dark:bg-[var(--dark-card)]">
              <button 
                className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] border border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)]" 
                onClick={() => setShowViewModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AudienceSegments