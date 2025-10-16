// src\pages\Audiences\ContactManagement.jsx

"use client"

import { useState } from "react"
import { MdContacts, MdAdd, MdRefresh, MdSearch, MdFilterAlt, MdUpload, MdDownload, MdVisibility, MdEdit, MdEmail, MdDelete, MdSettings, MdPeople, MdCheckCircle, MdTrendingUp, MdLabel, MdMoreVert } from "react-icons/md"
import Pagination from "../../components/Pagination/Pagination.jsx"


const ContactManagement = ({ darkMode }) => {
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 })
  const [loading, setLoading] = useState(false)
  const [contacts, setContacts] = useState([
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      phone: "+1 (555) 123-4567",
      company: "Acme Corp",
      segment: "High-Value Customers",
      status: "Active",
      lastActivity: "2024-01-15",
      tags: ["VIP", "Enterprise"],
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@company.com",
      phone: "+1 (555) 987-6543",
      company: "Tech Solutions",
      segment: "New Users",
      status: "Active",
      lastActivity: "2024-01-14",
      tags: ["New"],
    },
    {
      id: 3,
      name: "Bob Johnson",
      email: "bob@startup.io",
      phone: "+1 (555) 456-7890",
      company: "Startup Inc",
      segment: "Inactive Users",
      status: "Inactive",
      lastActivity: "2023-12-01",
      tags: ["Startup"],
    },
  ])

  const [showModal, setShowModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [currentContact, setCurrentContact] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    segment: "",
    tags: [],
  })

  const [searchTerm, setSearchTerm] = useState("")
  const [filterSegment, setFilterSegment] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedContacts, setSelectedContacts] = useState([])
  const [showBulkActions, setShowBulkActions] = useState(false)

  const segments = ["High-Value Customers", "New Users", "Inactive Users", "Enterprise", "SMB"]

  const handleCreateContact = () => {
    setCurrentContact({ name: "", email: "", phone: "", company: "", segment: "", tags: [] })
    setShowModal(true)
  }

  const handleSaveContact = () => {
    if (currentContact.name.trim() && currentContact.email.trim()) {
      const newContact = {
        ...currentContact,
        id: Date.now(),
        status: "Active",
        lastActivity: new Date().toISOString().split("T")[0],
      }
      setContacts([...contacts, newContact])
      setShowModal(false)
    }
  }

  const deleteContact = (id) => {
    setContacts(contacts.filter((c) => c.id !== id))
  }

  const handleSelectContact = (id) => {
    setSelectedContacts((prev) => (prev.includes(id) ? prev.filter((contactId) => contactId !== id) : [...prev, id]))
  }

  const handleSelectAll = () => {
    if (selectedContacts.length === filteredContacts.length) {
      setSelectedContacts([])
    } else {
      setSelectedContacts(filteredContacts.map((c) => c.id))
    }
  }

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSegment = filterSegment === "all" || contact.segment === filterSegment
    const matchesStatus = filterStatus === "all" || contact.status.toLowerCase() === filterStatus
    return matchesSearch && matchesSegment && matchesStatus
  })

  const totalPages = Math.ceil(filteredContacts.length / pagination.limit)
  const startIndex = (pagination.page - 1) * pagination.limit
  const currentContacts = filteredContacts.slice(startIndex, startIndex + pagination.limit)

  const activeContacts = contacts.filter(c => c.status === 'Active').length
  const totalSegments = [...new Set(contacts.map(c => c.segment))].length
  const recentContacts = contacts.filter(c => {
    const activityDate = new Date(c.lastActivity)
    const daysDiff = Math.floor((new Date() - activityDate) / (1000 * 60 * 60 * 24))
    return daysDiff <= 7
  }).length

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading contacts...</p>
      </div>
    )
  }

  return (
    <div className="contact-management-container">
      {/* Page Header */}
      <div className="page-header-section">
        <div className="page-header-content">
          <div className="page-title-wrapper">
            <div className="page-icon">
              <MdContacts />
            </div>
            <div>
              <h1 className="page-title">Contact Management</h1>
              <p className="page-subtitle">Manage your survey contacts and audience lists</p>
            </div>
          </div>
          <div className="page-actions">
            <button className="action-button secondary-action" onClick={() => setLoading(true)}>
              <MdRefresh /> Refresh
            </button>
            <button className="action-button secondary-action" onClick={() => setShowImportModal(true)}>
              <MdUpload /> Import
            </button>
            <button className="action-button primary-action" onClick={handleCreateContact}>
              <MdAdd /> Add Contact
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-section">
        <div className="stat-card primary-card">
          <div className="stat-icon">
            <MdPeople />
          </div>
          <div className="stat-content">
            <div className="stat-value">{contacts.length}</div>
            <div className="stat-label">Total Contacts</div>
          </div>
        </div>
        <div className="stat-card success-card">
          <div className="stat-icon">
            <MdCheckCircle />
          </div>
          <div className="stat-content">
            <div className="stat-value">{activeContacts}</div>
            <div className="stat-label">Active Contacts</div>
          </div>
        </div>
        <div className="stat-card info-card">
          <div className="stat-icon">
            <MdContacts />
          </div>
          <div className="stat-content">
            <div className="stat-value">{totalSegments}</div>
            <div className="stat-label">Segments</div>
          </div>
        </div>
        <div className="stat-card warning-card">
          <div className="stat-icon">
            <MdTrendingUp />
          </div>
          <div className="stat-content">
            <div className="stat-value">{recentContacts}</div>
            <div className="stat-label">Recent Activity</div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="section-card filters-section">
        <div className="filters-grid">
          <div className="search-input-container">
            <MdSearch className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <select
              className="filter-select"
              value={filterSegment}
              onChange={(e) => setFilterSegment(e.target.value)}
            >
              <option value="all">All Segments</option>
              {segments.map((segment) => (
                <option key={segment} value={segment}>
                  {segment}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <select
              className="filter-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
          {selectedContacts.length > 0 && (
            <div className="bulk-actions-dropdown">
              <button 
                className="bulk-actions-toggle"
                onClick={() => setShowBulkActions(!showBulkActions)}
              >
                <MdMoreVert /> Actions ({selectedContacts.length})
              </button>
              {showBulkActions && (
                <div className="bulk-actions-menu">
                  <button className="bulk-action-item">
                    <MdEmail /> Send Survey
                  </button>
                  <button className="bulk-action-item">
                    <MdLabel /> Add Tags
                  </button>
                  <button className="bulk-action-item">
                    <MdFilterAlt /> Add to Segment
                  </button>
                  <div className="bulk-actions-divider"></div>
                  <button className="bulk-action-item danger">
                    <MdDelete /> Delete Selected
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Contacts Table Section */}
      <div className="section-card contacts-table-section">
        <div className="section-header">
          <div className="section-title-wrapper">
            <h2 className="section-title">Contacts List</h2>
            <p className="section-subtitle">
              {filteredContacts.length} {filteredContacts.length === 1 ? 'contact' : 'contacts'} found
            </p>
          </div>
          <button className="section-action">
            <MdSettings /> Settings
          </button>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th className="checkbox-column">
                  <input
                    type="checkbox"
                    className="table-checkbox"
                    checked={selectedContacts.length === filteredContacts.length && filteredContacts.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th>Name</th>
                <th>Email</th>
                <th className="phone-column">Phone</th>
                <th className="company-column">Company</th>
                <th>Segment</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentContacts.map((contact) => (
                <tr key={contact.id}>
                  <td className="checkbox-column">
                    <input
                      type="checkbox"
                      className="table-checkbox"
                      checked={selectedContacts.includes(contact.id)}
                      onChange={() => handleSelectContact(contact.id)}
                    />
                  </td>
                  <td>
                    <div className="contact-name-cell">
                      <div className="contact-name">{contact.name}</div>
                      {contact.tags.length > 0 && (
                        <div className="contact-tags">
                          {contact.tags.map((tag) => (
                            <span key={tag} className="contact-tag">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="contact-email">{contact.email}</div>
                  </td>
                  <td className="phone-column">
                    <div className="contact-phone">{contact.phone}</div>
                  </td>
                  <td className="company-column">
                    <div className="contact-company">{contact.company}</div>
                  </td>
                  <td>
                    <span className="segment-badge">
                      {contact.segment}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${contact.status.toLowerCase()}-status`}>
                      {contact.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn view-btn" title="View">
                        <MdVisibility />
                      </button>
                      <button className="action-btn edit-btn" title="Edit">
                        <MdEdit />
                      </button>
                      <button className="action-btn email-btn" title="Send Survey">
                        <MdEmail />
                      </button>
                      <button
                        className="action-btn delete-btn"
                        title="Delete"
                        onClick={() => deleteContact(contact.id)}
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
            total={filteredContacts.length}
            limit={pagination.limit}
            onChange={(page) => setPagination((prev) => ({ ...prev, page }))}
            darkMode={darkMode}
          />
        </div>
      </div>

      {/* Add Contact Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                <MdAdd /> Add New Contact
              </h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <form className="contact-form">
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter contact name"
                    value={currentContact.name}
                    onChange={(e) => setCurrentContact({ ...currentContact, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="Enter email address"
                    value={currentContact.email}
                    onChange={(e) => setCurrentContact({ ...currentContact, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="Enter phone number"
                    value={currentContact.phone}
                    onChange={(e) => setCurrentContact({ ...currentContact, phone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Company</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter company name"
                    value={currentContact.company}
                    onChange={(e) => setCurrentContact({ ...currentContact, company: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Segment</label>
                  <select
                    className="form-select"
                    value={currentContact.segment}
                    onChange={(e) => setCurrentContact({ ...currentContact, segment: e.target.value })}
                  >
                    <option value="">Select segment</option>
                    {segments.map((segment) => (
                      <option key={segment} value={segment}>
                        {segment}
                      </option>
                    ))}
                  </select>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="modal-cancel-btn" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="modal-submit-btn" onClick={handleSaveContact}>
                <MdAdd /> Add Contact
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="modal-overlay" onClick={() => setShowImportModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                <MdUpload /> Import Contacts
              </h2>
              <button className="modal-close" onClick={() => setShowImportModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="import-upload-area">
                <MdUpload className="upload-icon" />
                <p className="upload-text">Upload a CSV file with your contacts</p>
              </div>
              <form className="import-form">
                <div className="form-group">
                  <label className="form-label">CSV File</label>
                  <input type="file" className="file-input" accept=".csv" />
                  <p className="help-text">
                    File should include columns: Name, Email, Phone, Company, Segment
                  </p>
                </div>
                <button type="button" className="download-template-btn">
                  <MdDownload /> Download Template
                </button>
              </form>
            </div>
            <div className="modal-footer">
              <button className="modal-cancel-btn" onClick={() => setShowImportModal(false)}>
                Cancel
              </button>
              <button className="modal-submit-btn">
                <MdUpload /> Import Contacts
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ContactManagement
