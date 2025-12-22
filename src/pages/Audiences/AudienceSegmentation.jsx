"use client"
import { useState, useEffect } from "react"
import { MdSegment, MdAdd, MdRefresh, MdSearch, MdSave, MdVisibility, MdEdit, MdDownload, MdDelete, MdSettings, MdPeople, MdTrendingUp, MdCheckCircle, MdFilterAlt } from "react-icons/md"
import Pagination from "../../components/Pagination/Pagination.jsx"
import axiosInstance from '../../api/axiosInstance';
import Swal from "sweetalert2";

const AudienceSegmentation = ({ darkMode }) => {
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 })
  const [loading, setLoading] = useState(false)
  const [segments, setSegments] = useState([])
  const [totalContacts, setTotalContacts] = useState(0)
  const [activeSegments, setActiveSegments] = useState(0)
  const [draftSegments, setDraftSegments] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  const [currentSegment, setCurrentSegment] = useState({
    name: "",
    description: "",
    criteria: "",
    size: 0,
    type: 'internal',
    status: 'Draft',
  })
  const [viewSegment, setViewSegment] = useState(null)
  const [filters, setFilters] = useState({
    demographic: "",
    behavior: "",
    engagement: "",
    purchase: "",
  })

  useEffect(() => {
    fetchStats()
    fetchSegments()
  }, [pagination.page])

  const fetchSegments = async () => {
    setLoading(true)
    try {
      const res = await axiosInstance.get(`/contact-categories?page=${pagination.page}&limit=${pagination.limit}`)
      const list = res?.data?.data?.categories || res?.data?.categories || res?.data?.data?.segments || res?.data?.segments || []
      const normalized = Array.isArray(list)
        ? list.map((item) => ({
          ...item,
          status: item.status || (item.active ? 'Active' : 'Draft'),
          type: item.type || 'internal',
          size: item.size ?? item.count ?? 0,
          created: item.created || item.createdAt || item.updatedAt,
        }))
        : []
      setSegments(normalized)
      const total = res?.data?.count ?? normalized.length ?? 0
      setPagination(p => ({ ...p, total }))
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const fetchStats = async () => {
    try {
      const res = await axiosInstance.get('/contact-categories?limit=9999&page=1')
      console.log('Stats response:', res?.data?.data?.categories || res?.data?.categories || res?.data?.data?.segments || res?.data?.segments)
      const allSegments = res?.data?.data?.categories || res?.data?.categories || res?.data?.data?.segments || res?.data?.segments || []
      const safeSegments = Array.isArray(allSegments)
        ? allSegments.map((item) => ({
          ...item,
          status: item.status || (item.active ? 'Active' : 'Draft'),
          size: item.size ?? item.count ?? 0,
        }))
        : []
      const totalContactsCalc = safeSegments.reduce((sum, seg) => sum + (Number(seg.size) || 0), 0)
      const activeCalc = safeSegments.filter(s => s.status === 'Active').length
      const draftCalc = safeSegments.filter(s => s.status === 'Draft').length
      setTotalContacts(totalContactsCalc)
      setActiveSegments(activeCalc)
      setDraftSegments(draftCalc)
    } catch (err) {
      console.error(err)
    }
  }

  const handleCreateSegment = () => {
    setCurrentSegment({ name: "", description: "", criteria: "", size: 0, type: 'internal', status: 'Draft' })
    setModalMode('create')
    setShowModal(true)
  }

  const handleEdit = (seg) => {
    setCurrentSegment({
      ...seg,
      status: seg?.status || (seg?.active ? 'Active' : 'Draft'),
      type: seg?.type || 'internal',
    })
    setModalMode('edit')
    setShowModal(true)
  }

  const handleView = (seg) => {
    setViewSegment(seg)
    setShowViewModal(true)
  }

  const handleSaveSegment = async () => {
    if (currentSegment.name.trim()) {
      try {
        // Only send fields allowed by backend validation
        const payload = {
          name: currentSegment.name.trim(),
          description: currentSegment.description || '',
          type: currentSegment.type || 'internal'
        };

        if (modalMode === 'edit' && currentSegment.status) {
          payload.active = currentSegment.status === 'Active';
        }

        let res;

        if (modalMode === "edit") {
          // Update segment
          res = await axiosInstance.put(
            `/contact-categories/${currentSegment._id}`,
            payload
          );

          Swal.fire({
            icon: "success",
            title: "Segment Updated",
            text: "Segment successfully updated!",
            timer: 1500,
            showConfirmButton: false,
          });

        } else {
          // Create segment
          res = await axiosInstance.post("/contact-categories", payload);

          Swal.fire({
            icon: "success",
            title: "Segment Created",
            text: "New segment added successfully!",
            timer: 1500,
            showConfirmButton: false,
          });
        }

        fetchSegments();
        fetchStats();
        setShowModal(false);

      } catch (err) {
        console.error(err);
        const message = err?.response?.data?.message || 'Something went wrong!';
        Swal.fire({
          icon: "error",
          title: "Error",
          text: message,
        });
      }
    }
  };


  const deleteSegment = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        axiosInstance.delete(`/contact-categories/${id}`).then(() => {
          fetchSegments()
          fetchStats()
          Swal.fire(
            'Deleted!',
            'Your segment has been deleted.',
            'success'
          )
        }).catch(err => console.error(err))
      }
    })
  }

  const handlePreview = async () => {
    try {
      const res = await axiosInstance.post('/contact-categories/preview', filters)
      Swal.fire({
        title: 'Preview',
        text: `Estimated size: ${res.data.preview.estimatedSize}`,
        icon: 'info'
      })
    } catch (err) {
      console.error(err)
    }
  }

  const generateCriteria = () => {
    return Object.entries(filters)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)} = '${v}'`)
      .join(' AND ')
  }

  const handleSaveFromBuilder = () => {
    const criteria = generateCriteria()
    setCurrentSegment({
      name: '',
      description: '',
      criteria,
      status: 'Draft'
    })
    setModalMode('create')
    setShowModal(true)
  }

  const handleExport = (seg) => {
    Swal.fire({
      title: 'Export Segment',
      showCancelButton: true,
      confirmButtonText: 'Excel',
      denyButtonText: 'PDF',
      showDenyButton: true,
      cancelButtonText: 'Cancel',
    }).then(async (result) => {

      const downloadFile = async (type) => {
        const res = await axiosInstance.get(
          `/contact-categories/${seg._id}/export/${type}`,
          { responseType: "blob" }
        );

        const url = window.URL.createObjectURL(new Blob([res.data]));
        const a = document.createElement("a");
        a.href = url;
        a.download = `segment_${seg._id}.${type === 'excel' ? 'xlsx' : 'pdf'}`;
        a.click();
        window.URL.revokeObjectURL(url);
      };

      if (result.isConfirmed) {
        await downloadFile("excel");
      } else if (result.isDenied) {
        await downloadFile("pdf");
      }
    });
  };

  const indexOfLastItem = pagination.page * pagination.limit
  const indexOfFirstItem = indexOfLastItem - pagination.limit
  const currentSegments = Array.isArray(segments)
    ? segments.slice(indexOfFirstItem, indexOfLastItem)
    : []

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
            <button className="action-button secondary-action" onClick={() => { fetchSegments(); fetchStats(); }}>
              <MdRefresh /> Refresh
            </button>
            <button className="action-button primary-action" onClick={handleCreateSegment}>
              <MdAdd /> Create Category
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
            <div className="stat-value">{pagination.total}</div>
            <div className="stat-label">Total Categories</div>
          </div>
        </div>
        <div className="stat-card success-card">
          <div className="stat-icon">
            <MdCheckCircle />
          </div>
          <div className="stat-content">
            <div className="stat-value">{activeSegments}</div>
            <div className="stat-label">Active Categories</div>
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
            <div className="stat-label">Draft Categories</div>
          </div>
        </div>
      </div>
      {/* Segment Builder Section */}
      {/* <div className="section-card segment-builder-section">
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
          <button className="preview-btn" onClick={handlePreview}>
            <MdSearch /> Preview Segment
          </button>
          <button className="save-segment-btn" onClick={handleSaveFromBuilder}>
            <MdSave /> Save as Segment
          </button>
        </div>
      </div> */}
      {/* Segments List Section */}
      <div className="section-card segments-list-section">
        <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3 p-4 border-bottom">
          <div>
            <h2 className="section-title">Existing Categories</h2>
            <p className="section-subtitle">View and manage all audience categories</p>
          </div>
          {/* <button className="section-action flex items-center gap-2">
            <MdSettings /> Settings
          </button> */}
        </div>
        <div className="overflow-x-auto">
          <table className="data-table w-full">
            <thead>
              <tr>
                <th>Category Name</th>
                <th className="hidden sm:table-cell">Description</th>
                <th className="hidden md:table-cell criteria-column">Criteria</th>
                <th>Size</th>
                <th className="hidden lg:table-cell">Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {segments.map((segment) => (
                <tr key={segment._id}>
                  <td>
                    <div className="segment-name">{segment.name}</div>
                    <div className="segment-date">
                      Created: {segment?.created ? new Date(segment.created).toLocaleDateString() : 'N/A'}
                    </div>
                  </td>
                  <td className="hidden sm:table-cell">
                    <div className="segment-description">
                      {segment.description}
                    </div>
                  </td>
                  <td className="hidden md:table-cell criteria-column">
                    <code className="criteria-code text-xs break-all">{segment.criteria}</code>
                  </td>
                  <td>
                    <div className="segment-size">{Number(segment.size || 0).toLocaleString()}</div>
                    <div className="size-label">contacts</div>
                  </td>
                  <td className="hidden lg:table-cell">
                    <span className={`status-badge ${(segment.status || 'Draft').toLowerCase()}-status`}>
                      {segment.status || 'Draft'}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button className="action-btn view-btn" title="View Details" onClick={() => handleView(segment)}>
                        <MdVisibility />
                      </button>
                      <button className="action-btn edit-btn" title="Edit" onClick={() => handleEdit(segment)}>
                        <MdEdit />
                      </button>
                      <button className="action-btn download-btn" title="Export" onClick={() => handleExport(segment)}>
                        <MdDownload />
                      </button>
                      <button
                        className="action-btn delete-btn"
                        title="Delete"
                        onClick={() => deleteSegment(segment._id)}
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
        <div className="p-4 border-t">
          <Pagination
            current={pagination.page}
            total={pagination.total}
            limit={pagination.limit}
            onChange={(page) => setPagination((prev) => ({ ...prev, page }))}
            darkMode={darkMode}
          />
        </div>
      </div>
      {/* Create/Edit Segment Modal */}
      {showModal && (
        <div className="modal-overlay flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="modal-container max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="d-flex align-items-center justify-content-between p-4 border-bottom">
              <h2 className="modal-title d-flex align-items-center gap-2">
                {modalMode === 'create' ? <MdAdd /> : <MdEdit />} {modalMode === 'create' ? 'Create' : 'Edit'} Category
              </h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>
            <div className="p-4">
              <form className="segment-form flex flex-col gap-4">
                <div className="form-group">
                  <label className="form-label">Category Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter category name"
                    value={currentSegment.name}
                    onChange={(e) => setCurrentSegment({ ...currentSegment, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    placeholder="Describe this category"
                    value={currentSegment.description}
                    onChange={(e) => setCurrentSegment({ ...currentSegment, description: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Criteria</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="Define category criteria (e.g., Age > 25 AND Location = 'US')"
                    value={currentSegment.criteria}
                    onChange={(e) => setCurrentSegment({ ...currentSegment, criteria: e.target.value })}
                  />
                  <p className="help-text">
                    Use logical operators like AND, OR to combine multiple conditions
                  </p>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={currentSegment.status || 'Draft'}
                    onChange={(e) => setCurrentSegment({ ...currentSegment, status: e.target.value })}
                  >
                    <option value="Draft">Draft</option>
                    <option value="Active">Active</option>
                  </select>
                </div>
              </form>
            </div>
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-stretch align-items-sm-center gap-2 p-4 border-top">
              <button className="modal-cancel-btn d-flex align-items-center justify-content-center gap-2" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="modal-submit-btn d-flex align-items-center justify-content-center gap-2" onClick={handleSaveSegment}>
                {modalMode === 'create' ? <MdAdd /> : <MdEdit />} {modalMode === 'create' ? 'Create' : 'Update'} Category
              </button>
            </div>
          </div>
        </div>
      )}
      {/* View Segment Modal */}
      {showViewModal && (
        <div className="modal-overlay flex items-center justify-center p-4" onClick={() => setShowViewModal(false)}>
          <div className="modal-container max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="d-flex items-center justify-content-between p-4 border-b">
              <h2 className="modal-title d-flex items-center gap-2">
                <MdVisibility /> View Category
              </h2>
              <button className="modal-close" onClick={() => setShowViewModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Segment Name</label>
                <div className="form-text">{viewSegment.name}</div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <div className="form-text">{viewSegment.description}</div>
              </div>
              <div className="form-group">
                <label className="form-label">Criteria</label>
                <div className="form-text">{viewSegment.criteria}</div>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <div className="form-text">{viewSegment.status}</div>
              </div>
              <div className="form-group">
                <label className="form-label">Size</label>
                <div className="form-text">{Number(viewSegment?.size ?? 0).toLocaleString()}</div>
              </div>
              <div className="form-group">
                <label className="form-label">Created</label>
                <div className="form-text">{viewSegment?.created || viewSegment?.createdAt || viewSegment?.updatedAt ? new Date(viewSegment?.created || viewSegment?.createdAt || viewSegment?.updatedAt).toLocaleDateString() : 'N/A'}</div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="modal-cancel-btn" onClick={() => setShowViewModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
export default AudienceSegmentation