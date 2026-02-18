// src\pages\Surveys\Surveys.jsx
"use client"
import { useState, useEffect, useRef } from "react"
import {
  MdAdd,
  MdSearch,
  MdFilterList,
  MdMoreVert,
  MdEdit,
  MdDelete,
  MdVisibility,
  MdShare,
  MdDownload,
  MdRefresh,
  MdPoll,
  MdCategory,
  MdTrendingUp,
  MdCalendarToday,
  MdPeople,
} from "react-icons/md"
import Pagination from "../../components/Pagination/Pagination.jsx"

const Surveys = ({ darkMode }) => {
  const [surveys, setSurveys] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedSurvey, setSelectedSurvey] = useState(null)
  const [pagination, setPagination] = useState({ page: 1, limit: 1, total: 0 })
  const [openDropdownId, setOpenDropdownId] = useState(null)
  const dropdownRef = useRef(null)

  useEffect(() => {
    setTimeout(() => {
      const allSurveys = [
        { id: 1, name: "Customer Satisfaction Q4 2024", description: "Quarterly customer satisfaction survey", status: "Active", responses: 156, completion: 78, created: "2024-01-15", lastModified: "2024-01-20", category: "Customer Feedback" },
        { id: 2, name: "Product Feedback Survey", description: "Feedback on new product features", status: "Draft", responses: 0, completion: 0, created: "2024-01-14", lastModified: "2024-01-14", category: "Product Development" },
        { id: 3, name: "Employee Engagement Survey", description: "Annual employee engagement assessment", status: "Completed", responses: 89, completion: 95, created: "2024-01-10", lastModified: "2024-01-18", category: "HR" },
        { id: 4, name: "Market Research Study", description: "Market analysis for new product launch", status: "Active", responses: 234, completion: 65, created: "2024-01-08", lastModified: "2024-01-19", category: "Market Research" },
        { id: 5, name: "Website Usability Test", description: "User experience feedback for website redesign", status: "Paused", responses: 45, completion: 30, created: "2024-01-05", lastModified: "2024-01-12", category: "UX Research" },
        { id: 6, name: "Brand Awareness Survey", description: "Measuring brand recognition and perception", status: "Active", responses: 123, completion: 82, created: "2024-01-03", lastModified: "2024-01-17", category: "Marketing" },
        { id: 7, name: "Training Effectiveness Survey", description: "Evaluating the effectiveness of training programs", status: "Completed", responses: 67, completion: 100, created: "2024-01-01", lastModified: "2024-01-15", category: "HR" },
        { id: 8, name: "Customer Support Feedback", description: "Feedback on customer support experience", status: "Active", responses: 198, completion: 73, created: "2023-12-28", lastModified: "2024-01-16", category: "Customer Service" },
        { id: 9, name: "Mobile App User Experience", description: "User feedback on mobile application", status: "Active", responses: 145, completion: 67, created: "2023-12-25", lastModified: "2024-01-14", category: "UX Research" },
        { id: 10, name: "Quarterly Sales Review", description: "Sales team performance evaluation", status: "Draft", responses: 12, completion: 8, created: "2023-12-20", lastModified: "2024-01-10", category: "Sales" },
      ]
      setSurveys(allSurveys)
      setPagination((prev) => ({ ...prev, total: allSurveys.length }))
      setLoading(false)
    }, 1000)
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdownId(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const getStatusBadge = (status) => {
    const colors = {
      Active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      Draft: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
      Completed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      Paused: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
    }
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status] || colors.Paused}`}>
        {status}
      </span>
    )
  }

  const filteredSurveys = surveys.filter((survey) => {
    const matchesSearch = survey.name.toLowerCase().includes(searchTerm.toLowerCase()) || survey.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || survey.status.toLowerCase() === filterStatus.toLowerCase()
    return matchesSearch && matchesFilter
  })

  const currentSurveys = filteredSurveys.slice((pagination.page - 1) * pagination.limit, pagination.page * pagination.limit)

  const handleDelete = (survey) => {
    setSelectedSurvey(survey)
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    setSurveys(surveys.filter((s) => s.id !== selectedSurvey.id))
    setShowDeleteModal(false)
    setSelectedSurvey(null)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center" style={{ height: "50vh" }}>
        <span className="inline-block w-8 h-8 border-3 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="surveys-container py-4 px-4 fade-in">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-3">
          <MdPoll size={32} className="text-[var(--primary-color)]" />
          <div>
            <h2 className={`text-xl font-bold mb-0.5 ${darkMode ? "text-white" : "text-gray-900"}`}>Surveys</h2>
            <p className="text-[var(--secondary-color)] text-sm">Manage and monitor all your surveys</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-[var(--primary-color)]/10 transition-all">
            <MdRefresh size={16} /> Refresh
          </button>
          <button className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] text-white transition-all">
            <MdAdd size={16} /> Create Survey
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Surveys", value: surveys.length, icon: MdPoll, color: "var(--primary-color)" },
          { label: "Active Surveys", value: surveys.filter((s) => s.status === "Active").length, icon: MdTrendingUp, color: "var(--success-color)" },
          { label: "Total Responses", value: surveys.reduce((sum, s) => sum + s.responses, 0).toLocaleString(), icon: MdPeople, color: "var(--info-color)" },
          { label: "Avg Completion", value: `${Math.round(surveys.reduce((sum, s) => sum + s.completion, 0) / surveys.length)}%`, icon: MdTrendingUp, color: "var(--warning-color)" },
        ].map((stat) => (
          <div key={stat.label} className="card border-0 shadow-sm rounded-xl" style={{ borderLeft: `4px solid ${stat.color}` }}>
            <div className="p-4 flex items-center">
              <div className="flex-1">
                <div className={`text-xs mb-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{stat.label}</div>
                <div className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>{stat.value}</div>
              </div>
              <stat.icon size={24} style={{ color: stat.color }} />
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm rounded-xl mb-6">
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            <div className="md:col-span-5 relative">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--secondary-color)]" size={18} />
              <input
                type="text"
                placeholder="Search surveys..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30"
              />
            </div>
            <div className="md:col-span-3">
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-sm">
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="completed">Completed</option>
                <option value="paused">Paused</option>
              </select>
            </div>
            <div className="md:col-span-4">
              <button className="w-full inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)] text-sm text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                <MdFilterList size={16} /> More Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Surveys Table */}
      <div className="card border-0 shadow-sm rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="custom-table w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50">
                <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider">
                  <div className="flex items-center gap-2"><MdPoll size={16} /> Survey Details</div>
                </th>
                <th className="py-3 px-3 text-left text-xs font-semibold uppercase tracking-wider">
                  <div className="flex items-center gap-2"><MdCategory size={16} /> Category</div>
                </th>
                <th className="py-3 px-3 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
                <th className="py-3 px-3 text-left text-xs font-semibold uppercase tracking-wider">
                  <div className="flex items-center gap-2"><MdPeople size={16} /> Responses</div>
                </th>
                <th className="py-3 px-3 text-left text-xs font-semibold uppercase tracking-wider">
                  <div className="flex items-center gap-2"><MdTrendingUp size={16} /> Completion</div>
                </th>
                <th className="py-3 px-3 text-left text-xs font-semibold uppercase tracking-wider">
                  <div className="flex items-center gap-2"><MdCalendarToday size={16} /> Last Modified</div>
                </th>
                <th className="py-3 px-3 text-center text-xs font-semibold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--light-border)] dark:divide-[var(--dark-border)]">
              {currentSurveys.map((survey) => (
                <tr key={survey.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="py-3 px-4">
                    <div className={`font-medium mb-0.5 ${darkMode ? "text-white" : "text-gray-900"}`}>{survey.name}</div>
                    <div className="text-xs text-[var(--secondary-color)]">{survey.description}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">{survey.category}</span>
                  </td>
                  <td className="py-3 px-3">{getStatusBadge(survey.status)}</td>
                  <td className="py-3 px-3">
                    <span className={darkMode ? "text-white" : "text-gray-900"}>{survey.responses}</span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-[var(--primary-color)] rounded-full" style={{ width: `${survey.completion}%` }} />
                      </div>
                      <span className={`text-xs ${darkMode ? "text-white" : "text-gray-900"}`}>{survey.completion}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className={darkMode ? "text-white" : "text-gray-900"}>{survey.lastModified}</span>
                  </td>
                  <td className="py-3 px-3 text-center relative" ref={openDropdownId === survey.id ? dropdownRef : null}>
                    <button
                      onClick={() => setOpenDropdownId(openDropdownId === survey.id ? null : survey.id)}
                      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      style={{ color: darkMode ? "var(--dark-text)" : "var(--light-text)" }}
                    >
                      <MdMoreVert size={18} />
                    </button>
                    {openDropdownId === survey.id && (
                      <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-[var(--light-border)] dark:border-[var(--dark-border)] z-50 py-1">
                        {[
                          { icon: MdVisibility, label: "View" },
                          { icon: MdEdit, label: "Edit" },
                          { icon: MdShare, label: "Share" },
                          { icon: MdDownload, label: "Export" },
                        ].map((item) => (
                          <button key={item.label} onClick={() => setOpenDropdownId(null)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <item.icon size={16} /> {item.label}
                          </button>
                        ))}
                        <div className="border-t border-[var(--light-border)] dark:border-[var(--dark-border)] my-1" />
                        <button onClick={() => { setOpenDropdownId(null); handleDelete(survey) }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                          <MdDelete size={16} /> Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-3 border-t border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <Pagination
            current={pagination.page}
            total={filteredSurveys.length}
            limit={pagination.limit}
            onChange={(page) => setPagination((prev) => ({ ...prev, page }))}
            darkMode={darkMode}
          />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[1050] flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowDeleteModal(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <h5 className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>Confirm Delete</h5>
              <button onClick={() => setShowDeleteModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl">&times;</button>
            </div>
            <div className="px-6 py-4 text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">
              Are you sure you want to delete "{selectedSurvey?.name}"? This action cannot be undone.
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 rounded-lg text-sm border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2 rounded-lg text-sm bg-red-600 hover:bg-red-700 text-white transition-all">Delete Survey</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Surveys
