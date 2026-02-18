// src\pages\Incentives\RewardSystem.jsx

"use client"
import { useState, useEffect } from "react"
import {
  MdCardGiftcard,
  MdAdd,
  MdSearch,
  MdFilterList,
  MdEdit,
  MdDelete,
  MdRefresh,
  MdStar,
  MdPeople,
  MdAttachMoney,
} from "react-icons/md"
import Pagination from "../../components/Pagination/Pagination.jsx"

const RewardSystem = ({ darkMode }) => {
  const [rewards, setRewards] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedReward, setSelectedReward] = useState(null)
  const [pagination, setPagination] = useState({ page: 1, limit: 1, total: 0 })

  useEffect(() => {
    setTimeout(() => {
      const allRewards = [
        {
          id: 1,
          name: "Survey Completion Bonus",
          type: "Points",
          value: 100,
          description: "Reward for completing any survey",
          status: "Active",
          totalClaimed: 245,
          totalValue: 24500,
          createdDate: "2024-01-15",
        },
        {
          id: 2,
          name: "Monthly Survey Champion",
          type: "Gift Card",
          value: 50,
          description: "Top survey participant each month",
          status: "Active",
          totalClaimed: 12,
          totalValue: 600,
          createdDate: "2024-01-10",
        },
        {
          id: 3,
          name: "Feedback Quality Award",
          type: "Cash",
          value: 25,
          description: "High-quality detailed feedback",
          status: "Active",
          totalClaimed: 89,
          totalValue: 2225,
          createdDate: "2024-01-08",
        },
        {
          id: 4,
          name: "Early Bird Bonus",
          type: "Points",
          value: 50,
          description: "Complete survey within first 24 hours",
          status: "Paused",
          totalClaimed: 156,
          totalValue: 7800,
          createdDate: "2024-01-05",
        },
        {
          id: 5,
          name: "Referral Reward",
          type: "Cash",
          value: 10,
          description: "Successful referral of new participant",
          status: "Active",
          totalClaimed: 67,
          totalValue: 670,
          createdDate: "2024-01-03",
        },
      ]
      setRewards(allRewards)
      setPagination((prev) => ({ ...prev, total: allRewards.length }))
      setLoading(false)
    }, 1000)
  }, [])

  const getStatusBadge = (status) => {
    const colors = {
      Active: "bg-green-100 text-green-800",
      Paused: "bg-yellow-100 text-yellow-800",
      Inactive: "bg-gray-100 text-gray-800",
    }
    return (
      <span className={`badge-enhanced px-2 py-1 rounded text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-800"}`}>
        {status}
      </span>
    )
  }

  const getTypeBadge = (type) => {
    const colors = {
      Points: "bg-blue-100 text-blue-800",
      "Gift Card": "bg-cyan-100 text-cyan-800",
      Cash: "bg-green-100 text-green-800",
    }
    return (
      <span className={`badge-enhanced px-2 py-1 rounded text-xs font-medium ${colors[type] || "bg-gray-100 text-gray-800"}`}>
        {type}
      </span>
    )
  }

  const filteredRewards = rewards.filter((reward) => {
    const matchesSearch =
      reward.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reward.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter =
      filterType === "all" || reward.type.toLowerCase().replace(" ", "").includes(filterType.toLowerCase())
    return matchesSearch && matchesFilter
  })

  const currentRewards = filteredRewards.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit,
  )

  const handleDelete = (reward) => {
    setSelectedReward(reward)
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    setRewards(rewards.filter((r) => r.id !== selectedReward.id))
    setShowDeleteModal(false)
    setSelectedReward(null)
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
    <div className="reward-system-container py-4 fade-in px-3">
      {/* Header */}
      <div className="mb-4">
        <div className="flex justify-content-between align-items-center flex-wrap">
          <div className="flex align-items-center">
            <MdCardGiftcard size={32} className="text-primary me-3" />
            <div>
              <h2 className={`mb-1 ${darkMode ? "text-white" : "text-dark"}`}>Reward System</h2>
              <p className="text-muted mb-0">Manage incentives and rewards for survey participants</p>
            </div>
          </div>
          <div className="flex gap-2 mt-2 mt-md-0">
            <button className="btn btn-outline-primary btn-sm btn-enhanced">
              <MdRefresh className="me-1" />
              Refresh
            </button>
            <button className="btn btn-primary btn-sm btn-enhanced">
              <MdAdd className="me-1" />
              Create Reward
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
                <MdCardGiftcard size={24} style={{ color: "var(--primary-color)", marginRight: "8px" }} />
                <div className="flex-grow-1">
                  <div className={`text-muted mb-1 ${darkMode ? "text-light" : ""}`}>Total Rewards</div>
                  <div className={`h4 mb-0 fw-bold ${darkMode ? "text-white" : "text-dark"}`}>{rewards.length}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-lg-3 mb-3">
          <div className="stat-card border-0 shadow-sm card-enhanced card" style={{ borderLeft: "4px solid var(--success-color)" }}>
            <div className="card-body">
              <div className="flex align-items-center">
                <MdStar size={24} style={{ color: "var(--success-color)", marginRight: "8px" }} />
                <div className="flex-grow-1">
                  <div className={`text-muted mb-1 ${darkMode ? "text-light" : ""}`}>Active Rewards</div>
                  <div className={`h4 mb-0 fw-bold ${darkMode ? "text-white" : "text-dark"}`}>
                    {rewards.filter((r) => r.status === "Active").length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-lg-3 mb-3">
          <div className="stat-card border-0 shadow-sm card-enhanced card" style={{ borderLeft: "4px solid var(--info-color)" }}>
            <div className="card-body">
              <div className="flex align-items-center">
                <MdPeople size={24} style={{ color: "var(--info-color)", marginRight: "8px" }} />
                <div className="flex-grow-1">
                  <div className={`text-muted mb-1 ${darkMode ? "text-light" : ""}`}>Total Claims</div>
                  <div className={`h4 mb-0 fw-bold ${darkMode ? "text-white" : "text-dark"}`}>
                    {rewards.reduce((sum, r) => sum + r.totalClaimed, 0)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-lg-3 mb-3">
          <div className="stat-card border-0 shadow-sm card-enhanced card" style={{ borderLeft: "4px solid var(--warning-color)" }}>
            <div className="card-body">
              <div className="flex align-items-center">
                <MdAttachMoney size={24} style={{ color: "var(--warning-color)", marginRight: "8px" }} />
                <div className="flex-grow-1">
                  <div className={`text-muted mb-1 ${darkMode ? "text-light" : ""}`}>Total Value</div>
                  <div className={`h4 mb-0 fw-bold ${darkMode ? "text-white" : "text-dark"}`}>
                    ${rewards.reduce((sum, r) => sum + r.totalValue, 0).toLocaleString()}
                  </div>
                </div>
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
                    placeholder="Search rewards..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-3 col-lg-2 mb-2 mb-md-0">
                <select
                  className="form-select form-enhanced"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="points">Points</option>
                  <option value="giftcard">Gift Card</option>
                  <option value="cash">Cash</option>
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

      {/* Rewards Table */}
      <div className="border-0 shadow-sm card-enhanced card">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table mb-0 table-enhanced table-hover">
              <thead className="table-light">
                <tr>
                  <th className="border-0 py-3 px-4">
                    <div className="flex align-items-center">
                      <MdCardGiftcard className="me-2" size={16} />
                      Reward Details
                    </div>
                  </th>
                  <th className="border-0 py-3">Type</th>
                  <th className="border-0 py-3">Value</th>
                  <th className="border-0 py-3">Status</th>
                  <th className="border-0 py-3">Claims</th>
                  <th className="border-0 py-3">Total Value</th>
                  <th className="border-0 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentRewards.map((reward) => (
                  <tr key={reward.id}>
                    <td className="py-3 px-4 border-0">
                      <div>
                        <div className={`fw-medium mb-1 ${darkMode ? "text-white" : "text-dark"}`}>
                          {reward.name}
                        </div>
                        <div className="small text-muted">{reward.description}</div>
                      </div>
                    </td>
                    <td className="py-3 border-0">{getTypeBadge(reward.type)}</td>
                    <td className="py-3 border-0">
                      <span className={darkMode ? "text-white" : "text-dark"}>
                        {reward.type === "Points" ? `${reward.value} pts` : `$${reward.value}`}
                      </span>
                    </td>
                    <td className="py-3 border-0">{getStatusBadge(reward.status)}</td>
                    <td className="py-3 border-0">
                      <span className={darkMode ? "text-white" : "text-dark"}>{reward.totalClaimed}</span>
                    </td>
                    <td className="py-3 border-0">
                      <span className={darkMode ? "text-white" : "text-dark"}>
                        ${reward.totalValue.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 text-center border-0">
                      <div className="btn-group btn-group-sm">
                        <button className="btn btn-outline-primary btn-sm btn-enhanced">
                          <MdEdit size={14} />
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm btn-enhanced"
                          onClick={() => handleDelete(reward)}
                        >
                          <MdDelete size={14} />
                        </button>
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
              total={filteredRewards.length}
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
              <div className="modal-body p-3">Are you sure you want to delete "{selectedReward?.name}"? This action cannot be undone.</div>
              <div className="modal-footer border-top p-3 flex justify-content-end gap-2">
                <button className="btn btn-secondary btn-enhanced" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-danger btn-enhanced" onClick={confirmDelete}>
                  Delete Reward
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RewardSystem
