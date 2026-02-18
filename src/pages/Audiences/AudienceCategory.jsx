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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-[var(--light-text)] dark:text-[var(--dark-text)]">Loading categories...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-purple-500/10 dark:bg-purple-500/20 flex items-center justify-center">
              <MdCategory className="text-2xl text-purple-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">Contact Categories</h1>
              <p className="text-sm text-[var(--text-secondary)]">Manage business-defined contact classifications</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] border border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-[var(--light-border)] dark:hover:bg-[var(--dark-border)] flex items-center gap-2" 
              onClick={fetchCategories}
            >
              <MdRefresh /> Refresh
            </button>
            <button 
              className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)] flex items-center gap-2" 
              onClick={handleCreateCategory}
            >
              <MdAdd /> Create Category
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-purple-500/10 dark:bg-purple-500/20 flex items-center justify-center">
              <MdCategory className="text-2xl text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">{categories.length}</p>
              <p className="text-sm text-[var(--text-secondary)]">Total Categories</p>
            </div>
          </div>
        </div>
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-500/10 dark:bg-green-500/20 flex items-center justify-center">
              <MdCheckCircle className="text-2xl text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">{activeCategories}</p>
              <p className="text-sm text-[var(--text-secondary)]">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center">
              <MdPeople className="text-2xl text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">{totalContacts.toLocaleString()}</p>
              <p className="text-sm text-[var(--text-secondary)]">Total Contacts</p>
            </div>
          </div>
        </div>
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-orange-500/10 dark:bg-orange-500/20 flex items-center justify-center">
              <MdBlock className="text-2xl text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">{inactiveCategories}</p>
              <p className="text-sm text-[var(--text-secondary)]">Inactive</p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories List Section */}
      <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div>
            <h2 className="text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">All Categories</h2>
            <p className="text-sm text-[var(--text-secondary)]">View and manage contact categories</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Category Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider hidden sm:table-cell">Description</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Contacts</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider hidden lg:table-cell">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--light-border)] dark:divide-[var(--dark-border)]">
              {categories.map((category) => (
                <tr key={category._id} className="hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">{category.name}</span>
                      {category.isDefault && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-500 text-white">Default</span>
                      )}
                    </div>
                    <div className="text-xs text-[var(--text-secondary)] mt-1">
                      Created: {category.createdAt ? new Date(category.createdAt).toLocaleDateString() : 'N/A'}
                    </div>
                  </td>
                  <td className="px-4 py-4 hidden sm:table-cell">
                    <div className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">
                      {category.description || '-'}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${category.type === 'internal' ? 'bg-[var(--info-color)] text-white' : 'bg-[var(--primary-color)] text-white'}`}>
                      {category.type}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">{(category.contactCount || 0).toLocaleString()}</div>
                    <div className="text-xs text-[var(--text-secondary)]">contacts</div>
                  </td>
                  <td className="px-4 py-4 hidden lg:table-cell">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${category.active ? 'bg-[var(--success-color)] text-white' : 'bg-gray-500 text-white'}`}>
                      {category.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1">
                      <button
                        className="p-2 rounded-md hover:bg-[var(--light-border)] dark:hover:bg-[var(--dark-border)] text-[var(--info-color)] transition-colors"
                        title="View Details"
                        onClick={() => handleView(category)}
                      >
                        <MdVisibility className="text-lg" />
                      </button>
                      {!category.isDefault && (
                        <>
                          <button
                            className="p-2 rounded-md hover:bg-[var(--light-border)] dark:hover:bg-[var(--dark-border)] text-[var(--primary-color)] transition-colors"
                            title="Edit"
                            onClick={() => handleEdit(category)}
                          >
                            <MdEdit className="text-lg" />
                          </button>
                          <button
                            className="p-2 rounded-md hover:bg-[var(--light-border)] dark:hover:bg-[var(--dark-border)] text-[var(--danger-color)] transition-colors"
                            title="Delete"
                            onClick={() => handleDelete(category)}
                          >
                            <MdDelete className="text-lg" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-[var(--text-secondary)]">
                    No categories found. Create your first category!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-[var(--light-border)] dark:border-[var(--dark-border)]">
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
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50" onClick={() => setShowModal(false)}>
          <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-xl max-w-2xl w-full border border-[var(--light-border)] dark:border-[var(--dark-border)]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <h2 className="text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)] flex items-center gap-2">
                {modalMode === 'create' ? <MdAdd /> : <MdEdit />}
                {modalMode === 'create' ? 'Create Category' : 'Edit Category'}
              </h2>
              <button 
                className="text-2xl text-[var(--text-secondary)] hover:text-[var(--light-text)] dark:hover:text-[var(--dark-text)] transition-colors" 
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <form className="flex flex-col gap-4">
                {/* Name - Required */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Category Name *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                    placeholder="e.g., Clients, Partners, Vendors"
                    value={currentCategory.name}
                    onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })}
                  />
                </div>

                {/* Description - Optional */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Description</label>
                  <textarea
                    className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                    rows={2}
                    placeholder="Brief description of this category"
                    value={currentCategory.description}
                    onChange={(e) => setCurrentCategory({ ...currentCategory, description: e.target.value })}
                  />
                </div>

                {/* Type - Required */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Type</label>
                  <select
                    className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                    value={currentCategory.type}
                    onChange={(e) => setCurrentCategory({ ...currentCategory, type: e.target.value })}
                  >
                    <option value="external">External (Clients, Customers, Partners)</option>
                    <option value="internal">Internal (Employees, Staff)</option>
                  </select>
                </div>

                {/* Active Status - Only for Edit */}
                {modalMode === 'edit' && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Status</label>
                    <select
                      className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
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
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 p-4 border-t border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <button
                className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] border border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-[var(--light-border)] dark:hover:bg-[var(--dark-border)] flex items-center justify-center gap-2"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)] flex items-center justify-center gap-2"
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
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50" onClick={() => setShowViewModal(false)}>
          <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-xl max-w-2xl w-full border border-[var(--light-border)] dark:border-[var(--dark-border)]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <h2 className="text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)] flex items-center gap-2">
                <MdVisibility /> Category Details
              </h2>
              <button 
                className="text-2xl text-[var(--text-secondary)] hover:text-[var(--light-text)] dark:hover:text-[var(--dark-text)] transition-colors" 
                onClick={() => setShowViewModal(false)}
              >
                ×
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--text-secondary)]">Name</label>
                <div className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">{viewCategory.name}</div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--text-secondary)]">Description</label>
                <div className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">{viewCategory.description || '-'}</div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--text-secondary)]">Type</label>
                <div className="text-sm">
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${viewCategory.type === 'internal' ? 'bg-[var(--info-color)] text-white' : 'bg-[var(--primary-color)] text-white'}`}>
                    {viewCategory.type}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--text-secondary)]">Status</label>
                <div className="text-sm">
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${viewCategory.active ? 'bg-[var(--success-color)] text-white' : 'bg-gray-500 text-white'}`}>
                    {viewCategory.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--text-secondary)]">Contacts</label>
                <div className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">{(viewCategory.contactCount || 0).toLocaleString()}</div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--text-secondary)]">Default Category</label>
                <div className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">{viewCategory.isDefault ? 'Yes' : 'No'}</div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--text-secondary)]">Created</label>
                <div className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">
                  {viewCategory.createdAt ? new Date(viewCategory.createdAt).toLocaleString() : 'N/A'}
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--text-secondary)]">Last Updated</label>
                <div className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">
                  {viewCategory.updatedAt ? new Date(viewCategory.updatedAt).toLocaleString() : 'N/A'}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <button 
                className="w-full px-4 py-2 rounded-md font-medium transition-colors bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] border border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-[var(--light-border)] dark:hover:bg-[var(--dark-border)]" 
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

export default AudienceCategory