"use client"
import { useState, useEffect } from "react"
import { MdCategory, MdAdd, MdRefresh, MdVisibility, MdEdit, MdDelete, MdPeople, MdCheckCircle, MdBlock } from "react-icons/md"
import Pagination from "../../components/Pagination/Pagination.jsx"
import axiosInstance from '../../api/axiosInstance.js'
import Swal from "sweetalert2"

const AudienceCategory = ({ darkMode }) => {
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 })
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [totalContacts, setTotalContacts] = useState(0)
  const [activeCategories, setActiveCategories] = useState(0)
  const [inactiveCategories, setInactiveCategories] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  
  // 🔥 Match ContactCategory model fields exactly
  const [currentCategory, setCurrentCategory] = useState({
    name: "",
    description: "",
    type: "external",
  })
  const [viewCategory, setViewCategory] = useState(null)

  useEffect(() => {
    fetchCategories()
  }, [pagination.page])

  // ─────────────────────────────────────────────────────────────
  // FETCH CATEGORIES
  // ─────────────────────────────────────────────────────────────
  const fetchCategories = async () => {
    setLoading(true)
    try {
      const res = await axiosInstance.get('/contact-categories')
      
      // Match backend response: { success, count, data: { categories } }
      const list = res?.data?.data?.categories || res?.data?.categories || []
      const count = res?.data?.count || list.length

      // Normalize to match model fields
      const normalized = list.map((item) => ({
        _id: item._id,
        name: item.name,
        description: item.description || '',
        type: item.type || 'external',
        active: item.active !== false,
        isDefault: item.isDefault || false,
        contactCount: item.contactCount || item.size || 0,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }))

      setCategories(normalized)
      setPagination(p => ({ ...p, total: count }))

      // Calculate stats
      const totalContactsCalc = normalized.reduce((sum, cat) => sum + (cat.contactCount || 0), 0)
      const activeCalc = normalized.filter(c => c.active).length
      const inactiveCalc = normalized.filter(c => !c.active).length
      
      setTotalContacts(totalContactsCalc)
      setActiveCategories(activeCalc)
      setInactiveCategories(inactiveCalc)

    } catch (err) {
      console.error("Failed to fetch categories:", err)
      Swal.fire("Error", "Failed to load categories", "error")
    }
    setLoading(false)
  }

  // ─────────────────────────────────────────────────────────────
  // CREATE CATEGORY
  // ─────────────────────────────────────────────────────────────
  const handleCreateCategory = () => {
    setCurrentCategory({
      name: "",
      description: "",
      type: "external",
    })
    setModalMode('create')
    setShowModal(true)
  }

  // ─────────────────────────────────────────────────────────────
  // EDIT CATEGORY
  // ─────────────────────────────────────────────────────────────
  const handleEdit = (cat) => {
    if (cat.isDefault) {
      Swal.fire("Info", "Default categories cannot be edited", "info")
      return
    }
    setCurrentCategory({
      _id: cat._id,
      name: cat.name,
      description: cat.description || '',
      type: cat.type || 'external',
      active: cat.active,
    })
    setModalMode('edit')
    setShowModal(true)
  }

  // ─────────────────────────────────────────────────────────────
  // VIEW CATEGORY
  // ─────────────────────────────────────────────────────────────
  const handleView = async (cat) => {
    try {
      const res = await axiosInstance.get(`/contact-categories/${cat._id}`)
      setViewCategory(res?.data?.data?.category || cat)
      setShowViewModal(true)
    } catch (err) {
      console.error(err)
      setViewCategory(cat)
      setShowViewModal(true)
    }
  }

  // ─────────────────────────────────────────────────────────────
  // SAVE CATEGORY (Create/Update)
  // ─────────────────────────────────────────────────────────────
  const handleSaveCategory = async () => {
    if (!currentCategory.name.trim()) {
      Swal.fire("Error", "Category name is required", "error")
      return
    }

    try {
      // 🔥 Only send fields that exist in ContactCategory model
      const payload = {
        name: currentCategory.name.trim(),
        description: currentCategory.description || '',
        type: currentCategory.type || 'external',
      }

      // Add active field only for updates
      if (modalMode === 'edit' && currentCategory.active !== undefined) {
        payload.active = currentCategory.active
      }

      if (modalMode === 'edit') {
        // 🔥 Backend uses PATCH for updates
        await axiosInstance.patch(`/contact-categories/${currentCategory._id}`, payload)
        
        Swal.fire({
          icon: "success",
          title: "Category Updated",
          text: "Category successfully updated!",
          timer: 1500,
          showConfirmButton: false,
        })
      } else {
        await axiosInstance.post('/contact-categories', payload)
        
        Swal.fire({
          icon: "success",
          title: "Category Created",
          text: "New category added successfully!",
          timer: 1500,
          showConfirmButton: false,
        })
      }

      fetchCategories()
      setShowModal(false)

    } catch (err) {
      console.error(err)
      const message = err?.response?.data?.message || 'Something went wrong!'
      Swal.fire("Error", message, "error")
    }
  }

  // ─────────────────────────────────────────────────────────────
  // DELETE CATEGORY
  // ─────────────────────────────────────────────────────────────
  const handleDelete = (cat) => {
    if (cat.isDefault) {
      Swal.fire("Info", "Default categories cannot be deleted", "info")
      return
    }

    Swal.fire({
      title: 'Delete Category?',
      text: cat.contactCount > 0 
        ? `This category has ${cat.contactCount} contacts. They will need to be reassigned.`
        : "This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.delete(`/contact-categories/${cat._id}`)
          fetchCategories()
          Swal.fire('Deleted!', 'Category has been deactivated.', 'success')
        } catch (err) {
          const message = err?.response?.data?.message || 'Failed to delete'
          Swal.fire('Error', message, 'error')
        }
      }
    })
  }

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading categories...</p>
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
              <MdCategory />
            </div>
            <div>
              <h1 className="page-title">Contact Categories</h1>
              <p className="page-subtitle">Manage business-defined contact classifications</p>
            </div>
          </div>
          <div className="page-actions">
            <button className="action-button secondary-action" onClick={fetchCategories}>
              <MdRefresh /> Refresh
            </button>
            <button className="action-button primary-action" onClick={handleCreateCategory}>
              <MdAdd /> Create Category
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
            <div className="stat-value">{categories.length}</div>
            <div className="stat-label">Total Categories</div>
          </div>
        </div>
        <div className="stat-card success-card">
          <div className="stat-icon">
            <MdCheckCircle />
          </div>
          <div className="stat-content">
            <div className="stat-value">{activeCategories}</div>
            <div className="stat-label">Active</div>
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
            <MdBlock />
          </div>
          <div className="stat-content">
            <div className="stat-value">{inactiveCategories}</div>
            <div className="stat-label">Inactive</div>
          </div>
        </div>
      </div>

      {/* Categories List Section */}
      <div className="section-card segments-list-section">
        <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3 p-4 border-bottom">
          <div>
            <h2 className="section-title">All Categories</h2>
            <p className="section-subtitle">View and manage contact categories</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table w-full">
            <thead>
              <tr>
                <th>Category Name</th>
                <th className="hidden sm:table-cell">Description</th>
                <th>Type</th>
                <th>Contacts</th>
                <th className="hidden lg:table-cell">Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category._id}>
                  <td>
                    <div className="segment-name">
                      {category.name}
                      {category.isDefault && (
                        <span className="badge bg-secondary ms-2" style={{ fontSize: '10px' }}>Default</span>
                      )}
                    </div>
                    <div className="segment-date">
                      Created: {category.createdAt ? new Date(category.createdAt).toLocaleDateString() : 'N/A'}
                    </div>
                  </td>
                  <td className="hidden sm:table-cell">
                    <div className="segment-description">
                      {category.description || '-'}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${category.type === 'internal' ? 'bg-info' : 'bg-primary'}`}>
                      {category.type}
                    </span>
                  </td>
                  <td>
                    <div className="segment-size">{(category.contactCount || 0).toLocaleString()}</div>
                    <div className="size-label">contacts</div>
                  </td>
                  <td className="hidden lg:table-cell">
                    <span className={`status-badge ${category.active ? 'active-status' : 'draft-status'}`}>
                      {category.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button 
                        className="action-btn view-btn" 
                        title="View Details" 
                        onClick={() => handleView(category)}
                      >
                        <MdVisibility />
                      </button>
                      {!category.isDefault && (
                        <>
                          <button 
                            className="action-btn edit-btn" 
                            title="Edit" 
                            onClick={() => handleEdit(category)}
                          >
                            <MdEdit />
                          </button>
                          <button
                            className="action-btn delete-btn"
                            title="Delete"
                            onClick={() => handleDelete(category)}
                          >
                            <MdDelete />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    No categories found. Create your first category!
                  </td>
                </tr>
              )}
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

      {/* Create/Edit Category Modal */}
      {showModal && (
        <div className="modal-overlay flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="modal-container max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="d-flex align-items-center justify-content-between p-4 border-bottom">
              <h2 className="modal-title d-flex align-items-center gap-2">
                {modalMode === 'create' ? <MdAdd /> : <MdEdit />}
                {modalMode === 'create' ? 'Create Category' : 'Edit Category'}
              </h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>
            <div className="p-4">
              <form className="segment-form flex flex-col gap-4">
                {/* Name - Required */}
                <div className="form-group">
                  <label className="form-label">Category Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., Clients, Partners, Vendors"
                    value={currentCategory.name}
                    onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })}
                  />
                </div>

                {/* Description - Optional */}
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    placeholder="Brief description of this category"
                    value={currentCategory.description}
                    onChange={(e) => setCurrentCategory({ ...currentCategory, description: e.target.value })}
                  />
                </div>

                {/* Type - Required */}
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select
                    className="form-select"
                    value={currentCategory.type}
                    onChange={(e) => setCurrentCategory({ ...currentCategory, type: e.target.value })}
                  >
                    <option value="external">External (Clients, Customers, Partners)</option>
                    <option value="internal">Internal (Employees, Staff)</option>
                  </select>
                </div>

                {/* Active Status - Only for Edit */}
                {modalMode === 'edit' && (
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      value={currentCategory.active ? 'true' : 'false'}
                      onChange={(e) => setCurrentCategory({ ...currentCategory, active: e.target.value === 'true' })}
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                )}
              </form>
            </div>
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-stretch align-items-sm-center gap-2 p-4 border-top">
              <button 
                className="modal-cancel-btn d-flex align-items-center justify-content-center gap-2" 
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button 
                className="modal-submit-btn d-flex align-items-center justify-content-center gap-2" 
                onClick={handleSaveCategory}
              >
                {modalMode === 'create' ? <MdAdd /> : <MdEdit />}
                {modalMode === 'create' ? 'Create Category' : 'Update Category'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Category Modal */}
      {showViewModal && viewCategory && (
        <div className="modal-overlay flex items-center justify-center p-4" onClick={() => setShowViewModal(false)}>
          <div className="modal-container max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="d-flex items-center justify-content-between p-4 border-b">
              <h2 className="modal-title d-flex items-center gap-2">
                <MdVisibility /> Category Details
              </h2>
              <button className="modal-close" onClick={() => setShowViewModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Name</label>
                <div className="form-text">{viewCategory.name}</div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <div className="form-text">{viewCategory.description || '-'}</div>
              </div>
              <div className="form-group">
                <label className="form-label">Type</label>
                <div className="form-text">
                  <span className={`badge ${viewCategory.type === 'internal' ? 'bg-info' : 'bg-primary'}`}>
                    {viewCategory.type}
                  </span>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <div className="form-text">
                  <span className={`badge ${viewCategory.active ? 'bg-success' : 'bg-secondary'}`}>
                    {viewCategory.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Contacts</label>
                <div className="form-text">{(viewCategory.contactCount || 0).toLocaleString()}</div>
              </div>
              <div className="form-group">
                <label className="form-label">Default Category</label>
                <div className="form-text">{viewCategory.isDefault ? 'Yes' : 'No'}</div>
              </div>
              <div className="form-group">
                <label className="form-label">Created</label>
                <div className="form-text">
                  {viewCategory.createdAt ? new Date(viewCategory.createdAt).toLocaleString() : 'N/A'}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Last Updated</label>
                <div className="form-text">
                  {viewCategory.updatedAt ? new Date(viewCategory.updatedAt).toLocaleString() : 'N/A'}
                </div>
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

export default AudienceCategory