// src\pages\Incentives\RewardSystem.jsx

"use client"

import { useState, useEffect } from "react"
import { Container, Row, Col, Card, Table, Badge, Button, Form, InputGroup, Modal } from "react-bootstrap"
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
    const variants = {
      Active: "success",
      Paused: "warning",
      Inactive: "secondary",
    }
    return (
      <Badge bg={variants[status] || "secondary"} className="badge-enhanced">
        {status}
      </Badge>
    )
  }

  const getTypeBadge = (type) => {
    const variants = {
      Points: "primary",
      "Gift Card": "info",
      Cash: "success",
    }
    return (
      <Badge bg={variants[type] || "secondary"} className="badge-enhanced">
        {type}
      </Badge>
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
      <div className="loading-container d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <Container fluid className="reward-system-container py-4 fade-in">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            <div className="d-flex align-items-center">
              <MdCardGiftcard size={32} className="text-primary me-3" />
              <div>
                <h2 className={`mb-1 ${darkMode ? "text-white" : "text-dark"}`}>Reward System</h2>
                <p className="text-muted mb-0">Manage incentives and rewards for survey participants</p>
              </div>
            </div>
            <div className="d-flex gap-2 mt-2 mt-md-0">
              <Button variant="outline-primary" size="sm" className="btn-enhanced">
                <MdRefresh className="me-1" />
                Refresh
              </Button>
              <Button variant="primary" size="sm" className="btn-enhanced">
                <MdAdd className="me-1" />
                Create Reward
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col xs={12} sm={6} lg={3} className="mb-3">
          <Card
            className="stat-card border-0 shadow-sm card-enhanced"
            style={{ borderLeft: "4px solid var(--primary-color)" }}
          >
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <div className={`text-muted small mb-1 ${darkMode ? "text-light" : ""}`}>Total Rewards</div>
                  <div className={`h4 mb-0 fw-bold ${darkMode ? "text-white" : "text-dark"}`}>{rewards.length}</div>
                </div>
                <MdCardGiftcard size={24} style={{ color: "var(--primary-color)" }} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3} className="mb-3">
          <Card
            className="stat-card border-0 shadow-sm card-enhanced"
            style={{ borderLeft: "4px solid var(--success-color)" }}
          >
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <div className={`text-muted small mb-1 ${darkMode ? "text-light" : ""}`}>Active Rewards</div>
                  <div className={`h4 mb-0 fw-bold ${darkMode ? "text-white" : "text-dark"}`}>
                    {rewards.filter((r) => r.status === "Active").length}
                  </div>
                </div>
                <MdStar size={24} style={{ color: "var(--success-color)" }} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3} className="mb-3">
          <Card
            className="stat-card border-0 shadow-sm card-enhanced"
            style={{ borderLeft: "4px solid var(--info-color)" }}
          >
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <div className={`text-muted small mb-1 ${darkMode ? "text-light" : ""}`}>Total Claims</div>
                  <div className={`h4 mb-0 fw-bold ${darkMode ? "text-white" : "text-dark"}`}>
                    {rewards.reduce((sum, r) => sum + r.totalClaimed, 0)}
                  </div>
                </div>
                <MdPeople size={24} style={{ color: "var(--info-color)" }} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3} className="mb-3">
          <Card
            className="stat-card border-0 shadow-sm card-enhanced"
            style={{ borderLeft: "4px solid var(--warning-color)" }}
          >
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <div className={`text-muted small mb-1 ${darkMode ? "text-light" : ""}`}>Total Value</div>
                  <div className={`h4 mb-0 fw-bold ${darkMode ? "text-white" : "text-dark"}`}>
                    ${rewards.reduce((sum, r) => sum + r.totalValue, 0).toLocaleString()}
                  </div>
                </div>
                <MdAttachMoney size={24} style={{ color: "var(--warning-color)" }} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm card-enhanced">
            <Card.Body className="py-3">
              <Row className="align-items-center">
                <Col md={6} lg={4} className="mb-2 mb-md-0">
                  <InputGroup className="form-enhanced">
                    <InputGroup.Text>
                      <MdSearch />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Search rewards..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                </Col>
                <Col md={3} lg={2} className="mb-2 mb-md-0">
                  <Form.Select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="form-enhanced"
                  >
                    <option value="all">All Types</option>
                    <option value="points">Points</option>
                    <option value="giftcard">Gift Card</option>
                    <option value="cash">Cash</option>
                  </Form.Select>
                </Col>
                <Col md={3} lg={2}>
                  <Button variant="outline-secondary" className="w-100 btn-enhanced">
                    <MdFilterList className="me-1" />
                    More Filters
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Rewards Table */}
      <Row>
        <Col>
          <Card className="border-0 shadow-sm card-enhanced">
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table className="mb-0 table-enhanced" hover>
                  <thead className="table-light">
                    <tr>
                      <th className="border-0 py-3 px-4">
                        <div className="d-flex align-items-center">
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
                            <Button variant="outline-primary" size="sm" className="btn-enhanced">
                              <MdEdit size={14} />
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              className="btn-enhanced"
                              onClick={() => handleDelete(reward)}
                            >
                              <MdDelete size={14} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
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
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered className="modal-enhanced">
        <Modal.Header closeButton>
          <Modal.Title className={darkMode ? "text-white" : "text-dark"}>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete "{selectedReward?.name}"? This action cannot be undone.</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)} className="btn-enhanced">
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete} className="btn-enhanced">
            Delete Reward
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default RewardSystem
