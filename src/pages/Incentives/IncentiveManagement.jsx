// src\pages\Incentives\IncentiveManagement.jsx

"use client"

import { useState, useEffect, useRef } from "react"
import {
  MdCampaign,
  MdAdd,
  MdSearch,
  MdFilterList,
  MdMoreVert,
  MdEdit,
  MdDelete,
  MdRefresh,
  MdTrendingUp,
  MdPeople,
  MdAttachMoney,
  MdSchedule,
  MdVisibility,
  MdPause,
  MdPlayArrow,
} from "react-icons/md"
import Pagination from "../../components/Pagination/Pagination.jsx"

const IncentiveManagement = ({ darkMode }) => {
  const [incentives, setIncentives] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedIncentive, setSelectedIncentive] = useState(null)
  const [pagination, setPagination] = useState({ page: 1, limit: 1, total: 0 })
  const [openDropdownId, setOpenDropdownId] = useState(null)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdownId(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    setTimeout(() => {
      const allIncentives = [
        {
          id: 1,
          name: "Q1 Customer Feedback Campaign",
          description: "Incentivize customers to provide detailed feedback",
          type: "Survey Completion",
          reward: "$25 Gift Card",
          status: "Active",
          startDate: "2024-01-01",
          endDate: "2024-03-31",
          participants: 156,
          budget: 5000,
          spent: 3900,
          completionRate: 78,
          targetAudience: "All Customers",
        },
        {
          id: 2,
          name: "Employee Engagement Boost",
          description: "Monthly incentive for employee survey participation",
          type: "Monthly Participation",
          reward: "100 Points",
          status: "Active",
          startDate: "2024-01-15",
          endDate: "2024-12-31",
          participants: 89,
          budget: 2000,
          spent: 890,
          completionRate: 92,
          targetAudience: "Employees",
        },
        {
          id: 3,
          name: "Product Launch Feedback",
          description: "Special incentive for new product feedback",
          type: "Product Feedback",
          reward: "$50 Cash",
          status: "Completed",
          startDate: "2024-01-10",
          endDate: "2024-01-25",
          participants: 234,
          budget: 10000,
          spent: 11700,
          completionRate: 85,
          targetAudience: "Beta Users",
        },
        {
          id: 4,
          name: "Market Research Incentive",
          description: "Reward for comprehensive market research participation",
          type: "Research Study",
          reward: "$75 Gift Card",
          status: "Paused",
          startDate: "2024-02-01",
          endDate: "2024-04-30",
          participants: 45,
          budget: 7500,
          spent: 3375,
          completionRate: 67,
          targetAudience: "Target Demographics",
        },
        {
          id: 5,
          name: "Website Usability Testing",
          description: "Incentive for detailed website feedback",
          type: "Usability Testing",
          reward: "$30 Cash",
          status: "Draft",
          startDate: "2024-02-15",
          endDate: "2024-03-15",
          participants: 0,
          budget: 3000,
          spent: 0,
          completionRate: 0,
          targetAudience: "Website Users",
        },
        {
          id: 6,
          name: "Customer Satisfaction Survey",
          description: "Quarterly customer satisfaction incentive program",
          type: "Satisfaction Survey",
          reward: "$20 Gift Card",
          status: "Active",
          startDate: "2024-01-20",
          endDate: "2024-03-20",
          participants: 178,
          budget: 4000,
          spent: 3560,
          completionRate: 89,
          targetAudience: "Recent Customers",
        },
        {
          id: 7,
          name: "Mobile App Feedback",
          description: "Incentive for mobile app user experience feedback",
          type: "App Feedback",
          reward: "150 Points",
          status: "Active",
          startDate: "2024-01-25",
          endDate: "2024-02-25",
          participants: 123,
          budget: 1500,
          spent: 1845,
          completionRate: 76,
          targetAudience: "Mobile Users",
        },
        {
          id: 8,
          name: "Training Effectiveness Study",
          description: "Incentive for training program evaluation",
          type: "Training Evaluation",
          reward: "$15 Cash",
          status: "Scheduled",
          startDate: "2024-02-10",
          endDate: "2024-03-10",
          participants: 67,
          budget: 2000,
          spent: 1005,
          completionRate: 94,
          targetAudience: "Training Participants",
        },
      ]
      setIncentives(allIncentives)
      setPagination((prev) => ({ ...prev, total: allIncentives.length }))
      setLoading(false)
    }, 1000)
  }, [])

  const getStatusBadge = (status) => {
    const colors = {
      Active: "bg-green-100 text-green-800",
      Completed: "bg-blue-100 text-blue-800",
      Paused: "bg-yellow-100 text-yellow-800",
      Draft: "bg-gray-100 text-gray-800",
      Scheduled: "bg-cyan-100 text-cyan-800",
    }
    return (
      <span className={`badge-enhanced px-2 py-1 rounded text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-800"}`}>
        {status}
      </span>
    )
  }

  const filteredIncentives = incentives.filter((incentive) => {
    const matchesSearch =
      incentive.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incentive.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incentive.type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || incentive.status.toLowerCase() === filterStatus.toLowerCase()
    return matchesSearch && matchesFilter
  })

  const currentIncentives = filteredIncentives.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit,
  )

  const handleDelete = (incentive) => {
    setSelectedIncentive(incentive)
    setShowDeleteModal(true)
    setOpenDropdownId(null)
  }

  const confirmDelete = () => {
    setIncentives(incentives.filter((i) => i.id !== selectedIncentive.id))
    setShowDeleteModal(false)
    setSelectedIncentive(null)
  }

  if (loading) {
    return (
      <div className="loading-container flex justify-content-center align-items-center" style={{ height: "50vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="incentive-management-container py-4 fade-in px-3">
      {/* Header */}
      <div className="mb-4">
        <div className="flex justify-content-between align-items-center flex-wrap">
          <div className="flex align-items-center">
            <MdCampaign size={32} className="text-primary me-3" />
            <div>
              <h2 className={`mb-1 ${darkMode ? "text-white" : "text-dark"}`}>Incentive Management</h2>
              <p className="text-muted mb-0">Create and manage incentive campaigns for survey participation</p>
            </div>
          </div>
          <div className="flex gap-2 mt-2 mt-md-0">
            <button className="btn btn-outline-primary btn-sm btn-enhanced">
              <MdRefresh className="me-1" />
              Refresh
            </button>
            <button className="btn btn-primary btn-sm btn-enhanced">
              <MdAdd className="me-1" />
              Create Campaign
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-12 col-sm-6 col-lg-3 mb-3">
          <div className="stat-card border-0 shadow-sm card-enhanced card" style={{ borderLeft: "4px solid var(--primary-color)" }}>
            <div className="card-body">
              <div className="flex align-items-center">
                <div className="flex-grow-1">
                  <div className={`text-muted small mb-1 ${darkMode ? "text-light" : ""}`}>Total Campaigns</div>
                  <div className={`h4 mb-0 fw-bold ${darkMode ? "text-white" : "text-dark"}`}>{incentives.length}</div>
                </div>
                <MdCampaign size={24} style={{ color: "var(--primary-color)" }} />
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-lg-3 mb-3">
          <div className="stat-card border-0 shadow-sm card-enhanced card" style={{ borderLeft: "4px solid var(--success-color)" }}>
            <div className="card-body">
              <div className="flex align-items-center">
                <div className="flex-grow-1">
                  <div className={`text-muted small mb-1 ${darkMode ? "text-light" : ""}`}>Active Campaigns</div>
                  <div className={`h4 mb-0 fw-bold ${darkMode ? "text-white" : "text-dark"}`}>
                    {incentives.filter((i) => i.status === "Active").length}
                  </div>
                </div>
                <MdTrendingUp size={24} style={{ color: "var(--success-color)" }} />
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-lg-3 mb-3">
          <div className="stat-card border-0 shadow-sm card-enhanced card" style={{ borderLeft: "4px solid var(--info-color)" }}>
            <div className="card-body">
              <div className="flex align-items-center">
                <div className="flex-grow-1">
                  <div className={`text-muted small mb-1 ${darkMode ? "text-light" : ""}`}>Total Participants</div>
                  <div className={`h4 mb-0 fw-bold ${darkMode ? "text-white" : "text-dark"}`}>
                    {incentives.reduce((sum, i) => sum + i.participants, 0)}
                  </div>
                </div>
                <MdPeople size={24} style={{ color: "var(--info-color)" }} />
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-lg-3 mb-3">
          <div className="stat-card border-0 shadow-sm card-enhanced card" style={{ borderLeft: "4px solid var(--warning-color)" }}>
            <div className="card-body">
              <div className="flex align-items-center">
                <div className="flex-grow-1">
                  <div className={`text-muted small mb-1 ${darkMode ? "text-light" : ""}`}>Total Budget</div>
                  <div className={`h4 mb-0 fw-bold ${darkMode ? "text-white" : "text-dark"}`}>
                    ${incentives.reduce((sum, i) => sum + i.budget, 0).toLocaleString()}
                  </div>
                </div>
                <MdAttachMoney size={24} style={{ color: "var(--warning-color)" }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4">
        <div className="border-0 shadow-sm card-enhanced card">
          <div className="card-body py-3">
            <div className="row align-items-center">
              <div className="col-md-6 col-lg-4 mb-2 mb-md-0">
                <div className="input-group form-enhanced">
                  <span className="input-group-text">
                    <MdSearch />
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search campaigns..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-3 col-lg-2 mb-2 mb-md-0">
                <select
                  className="form-select form-enhanced"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="paused">Paused</option>
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>
              <div className="col-md-3 col-lg-2">
                <button className="btn btn-outline-secondary w-100 btn-enhanced">
                  <MdFilterList className="me-1" />
                  More Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Incentives Table */}
      <div className="border-0 shadow-sm card-enhanced card">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table mb-0 table-enhanced table-hover">
              <thead className="table-light">
                <tr>
                  <th className="border-0 py-3 px-4">
                    <div className="flex align-items-center">
                      <MdCampaign className="me-2" size={16} />
                      Campaign Details
                    </div>
                  </th>
                  <th className="border-0 py-3">Status</th>
                  <th className="border-0 py-3">
                    <div className="flex align-items-center">
                      <MdPeople className="me-2" size={16} />
                      Participants
                    </div>
                  </th>
                  <th className="border-0 py-3">
                    <div className="flex align-items-center">
                      <MdAttachMoney className="me-2" size={16} />
                      Budget
                    </div>
                  </th>
                  <th className="border-0 py-3">Completion Rate</th>
                  <th className="border-0 py-3">
                    <div className="flex align-items-center">
                      <MdSchedule className="me-2" size={16} />
                      Duration
                    </div>
                  </th>
                  <th className="border-0 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentIncentives.map((incentive) => (
                  <tr key={incentive.id}>
                    <td className="py-3 px-4 border-0">
                      <div>
                        <div className={`fw-medium mb-1 ${darkMode ? "text-white" : "text-dark"}`}>
                          {incentive.name}
                        </div>
                        <div className="small text-muted mb-1">{incentive.description}</div>
                        <div className="flex gap-2">
                          <span className="badge-enhanced small px-2 py-1 rounded bg-gray-100 text-gray-800">
                            {incentive.type}
                          </span>
                          <span className="badge-enhanced small px-2 py-1 rounded bg-cyan-100 text-cyan-800">
                            {incentive.reward}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 border-0">{getStatusBadge(incentive.status)}</td>
                    <td className="py-3 border-0">
                      <span className={darkMode ? "text-white" : "text-dark"}>{incentive.participants}</span>
                      <div className="small text-muted">{incentive.targetAudience}</div>
                    </td>
                    <td className="py-3 border-0">
                      <div className={darkMode ? "text-white" : "text-dark"}>
                        ${incentive.budget.toLocaleString()}
                      </div>
                      <div className="small text-muted">Spent: ${incentive.spent.toLocaleString()}</div>
                    </td>
                    <td className="py-3 border-0">
                      <div className="flex align-items-center">
                        <div className="progress me-2" style={{ width: "60px", height: "6px" }}>
                          <div
                            className="progress-bar bg-primary"
                            style={{ width: `${incentive.completionRate}%` }}
                          ></div>
                        </div>
                        <span className={`small ${darkMode ? "text-white" : "text-dark"}`}>
                          {incentive.completionRate}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 border-0">
                      <div className={darkMode ? "text-white" : "text-dark"}>{incentive.startDate}</div>
                      <div className="small text-muted">to {incentive.endDate}</div>
                    </td>
                    <td className="py-3 text-center border-0">
                      <div className="position-relative d-inline-block" ref={openDropdownId === incentive.id ? dropdownRef : null}>
                        <button
                          className="btn btn-link p-0 border-0"
                          style={{ color: darkMode ? "var(--dark-text)" : "var(--light-text)" }}
                          onClick={() => setOpenDropdownId(openDropdownId === incentive.id ? null : incentive.id)}
                        >
                          <MdMoreVert />
                        </button>
                        {openDropdownId === incentive.id && (
                          <div
                            className="position-absolute end-0 bg-white shadow rounded border py-1"
                            style={{ zIndex: 1050, minWidth: "180px", top: "100%" }}
                          >
                            <button className="dropdown-item flex align-items-center px-3 py-2" onClick={() => setOpenDropdownId(null)}>
                              <MdVisibility className="me-2" />
                              View Details
                            </button>
                            <button className="dropdown-item flex align-items-center px-3 py-2" onClick={() => setOpenDropdownId(null)}>
                              <MdEdit className="me-2" />
                              Edit Campaign
                            </button>
                            {incentive.status === "Active" ? (
                              <button className="dropdown-item flex align-items-center px-3 py-2" onClick={() => setOpenDropdownId(null)}>
                                <MdPause className="me-2" />
                                Pause Campaign
                              </button>
                            ) : (
                              <button className="dropdown-item flex align-items-center px-3 py-2" onClick={() => setOpenDropdownId(null)}>
                                <MdPlayArrow className="me-2" />
                                Resume Campaign
                              </button>
                            )}
                            <hr className="my-1" />
                            <button
                              className="dropdown-item flex align-items-center px-3 py-2 text-danger"
                              onClick={() => handleDelete(incentive)}
                            >
                              <MdDelete className="me-2" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-3 border-top">
            <Pagination
              current={pagination.page}
              total={filteredIncentives.length}
              limit={pagination.limit}
              onChange={(page) => setPagination((prev) => ({ ...prev, page }))}
              darkMode={darkMode}
            />
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-enhanced">
          <div className="modal-backdrop fade show" style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1040 }} onClick={() => setShowDeleteModal(false)}></div>
          <div style={{ position: "fixed", inset: 0, zIndex: 1050, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div className={`modal-content rounded shadow ${darkMode ? "bg-dark text-white" : "bg-white"}`} style={{ maxWidth: "500px", width: "90%" }}>
              <div className="modal-header border-bottom p-3 flex justify-content-between align-items-center">
                <h5 className={`modal-title mb-0 ${darkMode ? "text-white" : "text-dark"}`}>Confirm Delete</h5>
                <button type="button" className="btn-close" onClick={() => setShowDeleteModal(false)}></button>
              </div>
              <div className="modal-body p-3">
                Are you sure you want to delete "{selectedIncentive?.name}"? This action cannot be undone.
              </div>
              <div className="modal-footer border-top p-3 flex justify-content-end gap-2">
                <button className="btn btn-secondary btn-enhanced" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-danger btn-enhanced" onClick={confirmDelete}>
                  Delete Campaign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default IncentiveManagement
