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
  const [pagination, setPagination] = useState({ page: 1, limit: 8, total: 0 })

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-md bg-[var(--primary-color)] text-white">
              <MdEmail className="text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">Email Templates</h1>
              <p className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-70">Create and manage email templates for surveys</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] border border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-[var(--light-border)] dark:hover:bg-[var(--dark-border)] flex items-center gap-2">
              <MdRefresh />
              Refresh
            </button>
            <button className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:opacity-90 flex items-center gap-2">
              <MdAdd />
              Create Template
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-md bg-[var(--primary-color)] text-white">
              <MdDescription className="text-2xl" />
            </div>
            <div>
              <div className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-70">Total Templates</div>
              <div className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">{templates.length}</div>
            </div>
          </div>
        </div>
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-md bg-[var(--success-color)] text-white">
              <MdEmail className="text-2xl" />
            </div>
            <div>
              <div className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-70">Active Templates</div>
              <div className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">{templates.filter((t) => t.status === "Active").length}</div>
            </div>
          </div>
        </div>
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-md bg-[var(--info-color)] text-white">
              <MdContentCopy className="text-2xl" />
            </div>
            <div>
              <div className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-70">Total Usage</div>
              <div className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">{templates.reduce((sum, t) => sum + t.usageCount, 0)}</div>
            </div>
          </div>
        </div>
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-md bg-[var(--warning-color)] text-white">
              <MdCategory className="text-2xl" />
            </div>
            <div>
              <div className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-70">Categories</div>
              <div className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">{new Set(templates.map((t) => t.category)).size}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-md bg-[var(--primary-color)] text-white">
            <MdFilterList className="text-xl" />
          </div>
          <h2 className="text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">Filter & Search</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-50" />
            <input
              type="text"
              className="w-full pl-10 pr-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
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
          <button className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] border border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-[var(--light-border)] dark:hover:bg-[var(--dark-border)] flex items-center justify-center gap-2">
            <MdFilterList />
            More Filters
          </button>
        </div>
      </div>

      {/* Email Templates Table */}
      <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
        <div className="p-6 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-md bg-[var(--primary-color)] text-white">
              <MdDescription className="text-xl" />
            </div>
            <h2 className="text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">Email Templates</h2>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <MdDescription />
                    Template Name
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <MdCategory />
                    Category
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] uppercase tracking-wider">Usage Count</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] uppercase tracking-wider">Last Modified</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] uppercase tracking-wider">Created By</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--light-border)] dark:divide-[var(--dark-border)]">
              {currentTemplates.map((template) => (
                <tr key={template.id} className="hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">{template.name}</div>
                      <div className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-70">{template.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-[var(--info-color)] bg-opacity-10 text-[var(--info-color)] border border-[var(--info-color)]">
                      {template.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      template.status === "Active"
                        ? "bg-[var(--success-color)] bg-opacity-10 text-[var(--success-color)] border border-[var(--success-color)]"
                        : template.status === "Draft"
                        ? "bg-[var(--warning-color)] bg-opacity-10 text-[var(--warning-color)] border border-[var(--warning-color)]"
                        : "bg-[var(--danger-color)] bg-opacity-10 text-[var(--danger-color)] border border-[var(--danger-color)]"
                    }`}>
                      {template.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">{template.usageCount}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">{template.lastModified}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">{template.createdBy}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        className="p-2 rounded-md transition-colors bg-[var(--primary-color)] text-white hover:opacity-90"
                        title="Preview"
                      >
                        <MdPreview className="text-lg" />
                      </button>
                      <button 
                        className="p-2 rounded-md transition-colors bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] border border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-[var(--light-border)] dark:hover:bg-[var(--dark-border)]"
                        title="Edit"
                      >
                        <MdEdit className="text-lg" />
                      </button>
                      <button 
                        className="p-2 rounded-md transition-colors bg-[var(--info-color)] text-white hover:opacity-90"
                        title="Copy"
                      >
                        <MdContentCopy className="text-lg" />
                      </button>
                      <button 
                        className="p-2 rounded-md transition-colors bg-[var(--danger-color)] text-white hover:opacity-90"
                        title="Delete"
                        onClick={() => handleDelete(template)}
                      >
                        <MdDelete className="text-lg" />
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
            total={filteredTemplates.length}
            limit={pagination.limit}
            onChange={(page) => setPagination((prev) => ({ ...prev, page }))}
            darkMode={darkMode}
          />
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={() => setShowDeleteModal(false)}>
          <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-lg border border-[var(--light-border)] dark:border-[var(--dark-border)] w-full max-w-md m-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <h3 className="text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">Confirm Delete</h3>
              <button 
                className="text-2xl text-[var(--light-text)] dark:text-[var(--dark-text)] hover:opacity-70 transition-opacity"
                onClick={() => setShowDeleteModal(false)}
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <p className="text-[var(--light-text)] dark:text-[var(--dark-text)]">
                Are you sure you want to delete "{selectedTemplate?.name}"? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <button 
                className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] border border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-[var(--light-border)] dark:hover:bg-[var(--dark-border)]"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--danger-color)] text-white hover:opacity-90"
                onClick={confirmDelete}
              >
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
