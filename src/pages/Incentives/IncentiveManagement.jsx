// src\pages\Incentives\IncentiveManagement.jsx

"use client"

import { useState, useEffect } from "react"
import { Container, Row, Col, Card, Table, Badge, Button, Form, InputGroup, Modal, Dropdown } from "react-bootstrap"
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
    const variants = {
      Active: "success",
      Completed: "primary",
      Paused: "warning",
      Draft: "secondary",
      Scheduled: "info",
    }
    return (
      <Badge bg={variants[status] || "secondary"} className="badge-enhanced">
        {status}
      </Badge>
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
  }

  const confirmDelete = () => {
    setIncentives(incentives.filter((i) => i.id !== selectedIncentive.id))
    setShowDeleteModal(false)
    setSelectedIncentive(null)
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
    <Container fluid className="incentive-management-container py-4 fade-in">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            <div className="d-flex align-items-center">
              <MdCampaign size={32} className="text-primary me-3" />
              <div>
                <h2 className={`mb-1 ${darkMode ? "text-white" : "text-dark"}`}>Incentive Management</h2>
                <p className="text-muted mb-0">Create and manage incentive campaigns for survey participation</p>
              </div>
            </div>
            <div className="d-flex gap-2 mt-2 mt-md-0">
              <Button variant="outline-primary" size="sm" className="btn-enhanced">
                <MdRefresh className="me-1" />
                Refresh
              </Button>
              <Button variant="primary" size="sm" className="btn-enhanced">
                <MdAdd className="me-1" />
                Create Campaign
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
                  <div className={`text-muted small mb-1 ${darkMode ? "text-light" : ""}`}>Total Campaigns</div>
                  <div className={`h4 mb-0 fw-bold ${darkMode ? "text-white" : "text-dark"}`}>{incentives.length}</div>
                </div>
                <MdCampaign size={24} style={{ color: "var(--primary-color)" }} />
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
                  <div className={`text-muted small mb-1 ${darkMode ? "text-light" : ""}`}>Active Campaigns</div>
                  <div className={`h4 mb-0 fw-bold ${darkMode ? "text-white" : "text-dark"}`}>
                    {incentives.filter((i) => i.status === "Active").length}
                  </div>
                </div>
                <MdTrendingUp size={24} style={{ color: "var(--success-color)" }} />
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
                  <div className={`text-muted small mb-1 ${darkMode ? "text-light" : ""}`}>Total Participants</div>
                  <div className={`h4 mb-0 fw-bold ${darkMode ? "text-white" : "text-dark"}`}>
                    {incentives.reduce((sum, i) => sum + i.participants, 0)}
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
                  <div className={`text-muted small mb-1 ${darkMode ? "text-light" : ""}`}>Total Budget</div>
                  <div className={`h4 mb-0 fw-bold ${darkMode ? "text-white" : "text-dark"}`}>
                    ${incentives.reduce((sum, i) => sum + i.budget, 0).toLocaleString()}
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
                      placeholder="Search campaigns..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                </Col>
                <Col md={3} lg={2} className="mb-2 mb-md-0">
                  <Form.Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="form-enhanced"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="paused">Paused</option>
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
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

      {/* Incentives Table */}
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
                          <MdCampaign className="me-2" size={16} />
                          Campaign Details
                        </div>
                      </th>
                      <th className="border-0 py-3">Status</th>
                      <th className="border-0 py-3">
                        <div className="d-flex align-items-center">
                          <MdPeople className="me-2" size={16} />
                          Participants
                        </div>
                      </th>
                      <th className="border-0 py-3">
                        <div className="d-flex align-items-center">
                          <MdAttachMoney className="me-2" size={16} />
                          Budget
                        </div>
                      </th>
                      <th className="border-0 py-3">Completion Rate</th>
                      <th className="border-0 py-3">
                        <div className="d-flex align-items-center">
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
                            <div className="d-flex gap-2">
                              <Badge bg="light" text="dark" className="badge-enhanced small">
                                {incentive.type}
                              </Badge>
                              <Badge bg="info" className="badge-enhanced small">
                                {incentive.reward}
                              </Badge>
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
                          <div className="d-flex align-items-center">
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
                          <Dropdown align="end">
                            <Dropdown.Toggle
                              variant="link"
                              className="p-0 border-0"
                              style={{ color: darkMode ? "var(--dark-text)" : "var(--light-text)" }}
                            >
                              <MdMoreVert />
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                              <Dropdown.Item className="d-flex align-items-center">
                                <MdVisibility className="me-2" />
                                View Details
                              </Dropdown.Item>
                              <Dropdown.Item className="d-flex align-items-center">
                                <MdEdit className="me-2" />
                                Edit Campaign
                              </Dropdown.Item>
                              {incentive.status === "Active" ? (
                                <Dropdown.Item className="d-flex align-items-center">
                                  <MdPause className="me-2" />
                                  Pause Campaign
                                </Dropdown.Item>
                              ) : (
                                <Dropdown.Item className="d-flex align-items-center">
                                  <MdPlayArrow className="me-2" />
                                  Resume Campaign
                                </Dropdown.Item>
                              )}
                              <Dropdown.Divider />
                              <Dropdown.Item
                                className="d-flex align-items-center text-danger"
                                onClick={() => handleDelete(incentive)}
                              >
                                <MdDelete className="me-2" />
                                Delete
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
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
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered className="modal-enhanced">
        <Modal.Header closeButton>
          <Modal.Title className={darkMode ? "text-white" : "text-dark"}>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete "{selectedIncentive?.name}"? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)} className="btn-enhanced">
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete} className="btn-enhanced">
            Delete Campaign
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default IncentiveManagement
