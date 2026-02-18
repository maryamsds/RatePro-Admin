// src\pages\ContentManagement\Testimonials.jsx

"use client"

import { useState, useEffect } from "react"
import {
  MdAdd, MdEdit, MdDelete, MdSearch, MdRefresh,
  MdStar, MdStarOutline, MdPerson, MdCheck, MdClose,
  MdCheckCircle, MdTrendingUp, MdSettings
} from "react-icons/md"
import Pagination from "./components/Pagination/Pagination.jsx"

const Testimonial = ({ darkMode }) => {
  // State for testimonials data
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // State for CRUD operations
  const [showModal, setShowModal] = useState(false)
  const [currentTestimonial, setCurrentTestimonial] = useState(null)
  const [isEditing, setIsEditing] = useState(false)

  // State for table controls
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRating, setFilterRating] = useState("all")
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 })

  // Rating options for filter
  const ratingOptions = [
    { value: '5', label: '5 Stars' },
    { value: '4', label: '4 Stars' },
    { value: '3', label: '3 Stars' },
    { value: '2', label: '2 Stars' },
    { value: '1', label: '1 Star' }
  ]

  // Fetch testimonials data
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))

        const dummyTestimonials = [
          {
            id: 1,
            name: "John Doe",
            role: "CEO, TechCorp",
            content: "This product transformed our business operations completely!",
            rating: 5,
            avatar: "",
            isApproved: true,
            createdAt: "2024-01-15"
          },
          {
            id: 2,
            name: "Jane Smith",
            role: "Marketing Director",
            content: "Excellent customer support and reliable service.",
            rating: 4,
            avatar: "",
            isApproved: true,
            createdAt: "2024-01-14"
          },
          {
            id: 3,
            name: "Robert Johnson",
            role: "Small Business Owner",
            content: "Good value for money, but could use some improvements.",
            rating: 3,
            avatar: "",
            isApproved: false,
            createdAt: "2024-01-10"
          },
        ]

        setTestimonials(dummyTestimonials)
        setPagination(prev => ({ ...prev, total: dummyTestimonials.length }))
      } catch (error) {
        setError("Failed to load testimonials. Please try again later.")
        console.error("Error fetching testimonials:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTestimonials()
  }, [])

  // Filter testimonials based on search and rating
  const filteredTestimonials = testimonials.filter(testimonial => {
    const matchesSearch =
      testimonial.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      testimonial.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRating = filterRating === "all" || testimonial.rating.toString() === filterRating
    return matchesSearch && matchesRating
  })

  // Calculate stats
  const approvedCount = testimonials.filter(t => t.isApproved).length
  const pendingCount = testimonials.filter(t => !t.isApproved).length
  const averageRating = testimonials.length > 0
    ? (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1)
    : 0

  // Paginate testimonials
  const paginatedTestimonials = filteredTestimonials.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit
  )

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setCurrentTestimonial(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault()

    if (isEditing) {
      // Update existing testimonial
      setTestimonials(testimonials.map(t =>
        t.id === currentTestimonial.id ? currentTestimonial : t
      ))
    } else {
      // Add new testimonial
      const newTestimonial = {
        ...currentTestimonial,
        id: Date.now(),
        createdAt: new Date().toISOString().split('T')[0]
      }
      setTestimonials([...testimonials, newTestimonial])
      setPagination(prev => ({ ...prev, total: prev.total + 1 }))
    }

    setShowModal(false)
  }

  // Handle edit action
  const handleEdit = (testimonial) => {
    setCurrentTestimonial(testimonial)
    setIsEditing(true)
    setShowModal(true)
  }

  // Handle delete action
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this testimonial?")) {
      setTestimonials(testimonials.filter(t => t.id !== id))
      setPagination(prev => ({ ...prev, total: prev.total - 1 }))
    }
  }

  // Toggle approval status
  const toggleApproval = (id) => {
    setTestimonials(testimonials.map(t =>
      t.id === id ? { ...t, isApproved: !t.isApproved } : t
    ))
  }

  // Render star rating
  const renderStars = (rating) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <MdStar
            key={i}
            color={i < rating ? "#ffc107" : "#e4e5e9"}
            size={20}
          />
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading testimonials...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="testimonials-container">
      {/* Page Header */}
      <div className="page-header-section">
        <div className="page-header-content">
          <div className="page-header-left">
            <div className="page-header-icon">
              <MdPerson />
            </div>
            <div className="page-header-text">
              <h1>Testimonial Management</h1>
              <p>Manage customer testimonials and reviews</p>
            </div>
          </div>
          <button
            className="primary-action"
            onClick={() => {
              setCurrentTestimonial({
                name: "",
                role: "",
                content: "",
                rating: 5,
                avatar: "",
                isApproved: true
              })
              setIsEditing(false)
              setShowModal(true)
            }}
          >
            <MdAdd /> Add Testimonial
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-section">
        <div className="stat-card stat-card-primary">
          <div className="stat-icon">
            <MdPerson />
          </div>
          <div className="stat-details">
            <div className="stat-value">{testimonials.length}</div>
            <div className="stat-label">Total Testimonials</div>
          </div>
        </div>
        <div className="stat-card stat-card-success">
          <div className="stat-icon">
            <MdCheckCircle />
          </div>
          <div className="stat-details">
            <div className="stat-value">{approvedCount}</div>
            <div className="stat-label">Approved</div>
          </div>
        </div>
        <div className="stat-card stat-card-warning">
          <div className="stat-icon">
            <MdTrendingUp />
          </div>
          <div className="stat-details">
            <div className="stat-value">{pendingCount}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>
        <div className="stat-card stat-card-info">
          <div className="stat-icon">
            <MdStar />
          </div>
          <div className="stat-details">
            <div className="stat-value">{averageRating}</div>
            <div className="stat-label">Average Rating</div>
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
            placeholder="Search testimonials by name or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="filter-select"
          value={filterRating}
          onChange={(e) => setFilterRating(e.target.value)}
        >
          <option value="all">All Ratings</option>
          {ratingOptions.map(option => (
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

      {/* Testimonials Table */}
      <div className="section-card">
        <div className="section-header">
          <h2>Testimonials</h2>
          <span className="section-count">{filteredTestimonials.length} testimonial(s) found</span>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Avatar</th>
                <th>Name</th>
                <th>Role</th>
                <th>Content</th>
                <th>Rating</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTestimonials.length > 0 ? (
                paginatedTestimonials.map(testimonial => (
                  <tr key={testimonial.id}>
                    <td>
                      {testimonial.avatar ? (
                        <img
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          className="testimonial-avatar"
                        />
                      ) : (
                        <div className="testimonial-avatar-placeholder">
                          <MdPerson />
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="testimonial-details-cell">
                        <div className="testimonial-name">{testimonial.name}</div>
                      </div>
                    </td>
                    <td>{testimonial.role}</td>
                    <td>
                      <div className="testimonial-content">
                        {testimonial.content}
                      </div>
                    </td>
                    <td>
                      <div className="rating-stars">
                        {[...Array(5)].map((_, i) => (
                          i < testimonial.rating ? (
                            <MdStar key={i} className="star-filled" />
                          ) : (
                            <MdStarOutline key={i} className="star-empty" />
                          )
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge status-${testimonial.isApproved ? 'approved' : 'pending'}`}>
                        {testimonial.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td>{testimonial.createdAt}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-btn edit-btn"
                          onClick={() => handleEdit(testimonial)}
                          title="Edit"
                        >
                          <MdEdit />
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDelete(testimonial.id)}
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
                  <td colSpan="8" className="no-data">
                    No testimonials found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          <Pagination
            current={pagination.page}
            total={filteredTestimonials.length}
            limit={pagination.limit}
            onChange={(page) => setPagination((prev) => ({ ...prev, page }))}
            darkMode={darkMode}
          />
        </div>
      </div>

      {/* Add/Edit Testimonial Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-left">
                <MdPerson className="modal-icon" />
                <h2>{isEditing ? "Edit Testimonial" : "Add New Testimonial"}</h2>
              </div>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <MdClose />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {currentTestimonial && (
                  <div className="testimonial-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Name *</label>
                        <input
                          type="text"
                          name="name"
                          className="form-input"
                          value={currentTestimonial.name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Role/Position</label>
                        <input
                          type="text"
                          name="role"
                          className="form-input"
                          value={currentTestimonial.role}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Testimonial Content *</label>
                      <textarea
                        name="content"
                        className="form-textarea"
                        rows="4"
                        value={currentTestimonial.content}
                        onChange={handleInputChange}
                        required
                      ></textarea>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Rating</label>
                        <select
                          name="rating"
                          className="form-select"
                          value={currentTestimonial.rating}
                          onChange={handleInputChange}
                        >
                          <option value="5">5 Stars</option>
                          <option value="4">4 Stars</option>
                          <option value="3">3 Stars</option>
                          <option value="2">2 Stars</option>
                          <option value="1">1 Star</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Avatar URL</label>
                        <input
                          type="text"
                          name="avatar"
                          className="form-input"
                          value={currentTestimonial.avatar}
                          onChange={handleInputChange}
                          placeholder="Optional image URL"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-checkbox">
                        <input
                          type="checkbox"
                          name="isApproved"
                          checked={currentTestimonial.isApproved}
                          onChange={handleInputChange}
                        />
                        <span>Approved</span>
                      </label>
                    </div>
                  </div>
                )}
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
                  <MdAdd /> {isEditing ? "Update Testimonial" : "Add Testimonial"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Testimonial