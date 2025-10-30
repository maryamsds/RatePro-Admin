// src\pages\Communication\EmailTemplates.jsx

"use client"

import { useState, useEffect } from "react"
import {
  MdEmail,
  MdAdd,
  MdSearch,
  MdFilterList,
  MdEdit,
  MdDelete,
  MdContentCopy,
  MdRefresh,
  MdPreview,
  MdDescription,
  MdCategory,
  MdSettings,
} from "react-icons/md"
import Pagination from "../../components/Pagination/Pagination.jsx"

const EmailTemplates = ({ darkMode }) => {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [pagination, setPagination] = useState({ page: 1, limit: 1, total: 0 })

  useEffect(() => {
    setTimeout(() => {
      const allTemplates = [
        {
          id: 1,
          name: "Survey Invitation Template",
          category: "Survey Invitations",
          description: "Standard template for inviting users to participate in surveys",
          status: "Active",
          usageCount: 45,
          lastModified: "2024-01-20",
          createdBy: "Admin",
        },
        {
          id: 2,
          name: "Survey Reminder Template",
          category: "Reminders",
          description: "Follow-up template to remind users about pending surveys",
          status: "Active",
          usageCount: 32,
          lastModified: "2024-01-18",
          createdBy: "Marketing Team",
        },
        {
          id: 3,
          name: "Thank You Template",
          category: "Thank You",
          description: "Template to thank users for completing surveys",
          status: "Active",
          usageCount: 78,
          lastModified: "2024-01-15",
          createdBy: "Admin",
        },
        {
          id: 4,
          name: "Survey Results Summary",
          category: "Results",
          description: "Template for sharing survey results with stakeholders",
          status: "Draft",
          usageCount: 12,
          lastModified: "2024-01-12",
          createdBy: "Analytics Team",
        },
        {
          id: 5,
          name: "Welcome Email Template",
          category: "Welcome",
          description: "Welcome new users to the survey platform",
          status: "Active",
          usageCount: 156,
          lastModified: "2024-01-10",
          createdBy: "HR Team",
        },
        {
          id: 6,
          name: "Incentive Notification",
          category: "Incentives",
          description: "Notify users about rewards for survey completion",
          status: "Active",
          usageCount: 89,
          lastModified: "2024-01-08",
          createdBy: "Rewards Team",
        },
        {
          id: 7,
          name: "Survey Completion Certificate",
          category: "Certificates",
          description: "Certificate template for survey completion",
          status: "Inactive",
          usageCount: 23,
          lastModified: "2024-01-05",
          createdBy: "Admin",
        },
        {
          id: 8,
          name: "Monthly Newsletter Template",
          category: "Newsletters",
          description: "Monthly updates and survey highlights",
          status: "Active",
          usageCount: 67,
          lastModified: "2024-01-03",
          createdBy: "Content Team",
        },
      ]
      setTemplates(allTemplates)
      setPagination((prev) => ({ ...prev, total: allTemplates.length }))
      setLoading(false)
    }, 1000)
  }, [])

  // Status badges now handled with CSS classes directly in JSX

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterCategory === "all" || template.category === filterCategory
    return matchesSearch && matchesFilter
  })

  const currentTemplates = filteredTemplates.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit,
  )

  const handleDelete = (template) => {
    setSelectedTemplate(template)
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    setTemplates(templates.filter((t) => t.id !== selectedTemplate.id))
    setShowDeleteModal(false)
    setSelectedTemplate(null)
  }

  return (
    <div className="email-templates-container">
      <div className="page-header-section">
        <div className="section-icon">
          <MdEmail />
        </div>
        <div className="section-content">
          <h1>Email Templates</h1>
          <p>Create and manage email templates for surveys</p>
        </div>
        <div className="section-actions">
          <button className="action-button secondary">
            <MdRefresh />
            Refresh
          </button>
          <button className="action-button primary">
            <MdAdd />
            Create Template
          </button>
        </div>
      </div>

      <div className="stats-section">
        <div className="stats-grid">
          <div className="stat-card primary">
            <div className="stat-icon">
              <MdDescription />
            </div>
            <div className="stat-content">
              <div className="stat-label">Total Templates</div>
              <div className="stat-value">{templates.length}</div>
            </div>
          </div>
          <div className="stat-card success">
            <div className="stat-icon">
              <MdEmail />
            </div>
            <div className="stat-content">
              <div className="stat-label">Active Templates</div>
              <div className="stat-value">{templates.filter((t) => t.status === "Active").length}</div>
            </div>
          </div>
          <div className="stat-card info">
            <div className="stat-icon">
              <MdContentCopy />
            </div>
            <div className="stat-content">
              <div className="stat-label">Total Usage</div>
              <div className="stat-value">{templates.reduce((sum, t) => sum + t.usageCount, 0)}</div>
            </div>
          </div>
          <div className="stat-card warning">
            <div className="stat-icon">
              <MdCategory />
            </div>
            <div className="stat-content">
              <div className="stat-label">Categories</div>
              <div className="stat-value">{new Set(templates.map((t) => t.category)).size}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="filter-controls-section">
        <div className="section-card">
          <div className="section-header">
            <div className="section-icon">
              <MdFilterList />
            </div>
            <h2>Filter & Search</h2>
          </div>
          <div className="section-content">
            <div className="controls-grid">
              <div className="search-group">
                <div className="search-input-container">
                  <MdSearch className="search-icon" />
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search templates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="filter-group">
                <select
                  className="filter-select"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  <option value="Survey Invitations">Survey Invitations</option>
                  <option value="Reminders">Reminders</option>
                  <option value="Thank You">Thank You</option>
                  <option value="Results">Results</option>
                  <option value="Welcome">Welcome</option>
                  <option value="Incentives">Incentives</option>
                  <option value="Newsletters">Newsletters</option>
                </select>
              </div>
              <div className="action-group">
                <button className="filter-button">
                  <MdFilterList />
                  More Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="section-card">
        <div className="section-header">
          <div className="section-icon">
            <MdDescription />
          </div>
          <h2>Email Templates</h2>
        </div>
        <div className="section-content">
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>
                    <div className="th-content">
                      <MdDescription />
                      Template Name
                    </div>
                  </th>
                  <th>
                    <div className="th-content">
                      <MdCategory />
                      Category
                    </div>
                  </th>
                  <th>Status</th>
                  <th>Usage Count</th>
                  <th>Last Modified</th>
                  <th>Created By</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentTemplates.map((template) => (
                  <tr key={template.id}>
                    <td>
                      <div className="template-info">
                        <div className="template-name">{template.name}</div>
                        <div className="template-description">{template.description}</div>
                      </div>
                    </td>
                    <td>
                      <span className="category-badge">{template.category}</span>
                    </td>
                    <td>
                      <span className={`status-badge ${template.status.toLowerCase()}`}>
                        {template.status}
                      </span>
                    </td>
                    <td>
                      <span className="usage-count">{template.usageCount}</span>
                    </td>
                    <td>
                      <span className="modified-date">{template.lastModified}</span>
                    </td>
                    <td>
                      <span className="created-by">{template.createdBy}</span>
                    </td>
                    <td className="text-center">
                      <div className="action-buttons">
                        <button className="action-button small primary" title="Preview">
                          <MdPreview />
                        </button>
                        <button className="action-button small secondary" title="Edit">
                          <MdEdit />
                        </button>
                        <button className="action-button small info" title="Copy">
                          <MdContentCopy />
                        </button>
                        <button 
                          className="action-button small danger" 
                          title="Delete"
                          onClick={() => handleDelete(template)}
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
              total={filteredTemplates.length}
              limit={pagination.limit}
              onChange={(page) => setPagination((prev) => ({ ...prev, page }))}
              darkMode={darkMode}
            />
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirm Delete</h3>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete "{selectedTemplate?.name}"? This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="action-button secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button className="action-button danger" onClick={confirmDelete}>
                Delete Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EmailTemplates
