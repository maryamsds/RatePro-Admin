// src\pages\Surveys\Surveys.jsx
"use client"
import { useState, useEffect } from "react"
import { Container, Row, Col, Card, Table, Badge, Button, Form, InputGroup, Modal, Dropdown } from "react-bootstrap"
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

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const allSurveys = [
        {
          id: 1,
          name: "Customer Satisfaction Q4 2024",
          description: "Quarterly customer satisfaction survey",
          status: "Active",
          responses: 156,
          completion: 78,
          created: "2024-01-15",
          lastModified: "2024-01-20",
          category: "Customer Feedback",
        },
        {
          id: 2,
          name: "Product Feedback Survey",
          description: "Feedback on new product features",
          status: "Draft",
          responses: 0,
          completion: 0,
          created: "2024-01-14",
          lastModified: "2024-01-14",
          category: "Product Development",
        },
        {
          id: 3,
          name: "Employee Engagement Survey",
          description: "Annual employee engagement assessment",
          status: "Completed",
          responses: 89,
          completion: 95,
          created: "2024-01-10",
          lastModified: "2024-01-18",
          category: "HR",
        },
        {
          id: 4,
          name: "Market Research Study",
          description: "Market analysis for new product launch",
          status: "Active",
          responses: 234,
          completion: 65,
          created: "2024-01-08",
          lastModified: "2024-01-19",
          category: "Market Research",
        },
        {
          id: 5,
          name: "Website Usability Test",
          description: "User experience feedback for website redesign",
          status: "Paused",
          responses: 45,
          completion: 30,
          created: "2024-01-05",
          lastModified: "2024-01-12",
          category: "UX Research",
        },
        {
          id: 6,
          name: "Brand Awareness Survey",
          description: "Measuring brand recognition and perception",
          status: "Active",
          responses: 123,
          completion: 82,
          created: "2024-01-03",
          lastModified: "2024-01-17",
          category: "Marketing",
        },
        {
          id: 7,
          name: "Training Effectiveness Survey",
          description: "Evaluating the effectiveness of training programs",
          status: "Completed",
          responses: 67,
          completion: 100,
          created: "2024-01-01",
          lastModified: "2024-01-15",
          category: "HR",
        },
        {
          id: 8,
          name: "Customer Support Feedback",
          description: "Feedback on customer support experience",
          status: "Active",
          responses: 198,
          completion: 73,
          created: "2023-12-28",
          lastModified: "2024-01-16",
          category: "Customer Service",
        },
        {
          id: 9,
          name: "Mobile App User Experience",
          description: "User feedback on mobile application",
          status: "Active",
          responses: 145,
          completion: 67,
          created: "2023-12-25",
          lastModified: "2024-01-14",
          category: "UX Research",
        },
        {
          id: 10,
          name: "Quarterly Sales Review",
          description: "Sales team performance evaluation",
          status: "Draft",
          responses: 12,
          completion: 8,
          created: "2023-12-20",
          lastModified: "2024-01-10",
          category: "Sales",
        },
      ]
      setSurveys(allSurveys)
      setPagination((prev) => ({ ...prev, total: allSurveys.length }))
      setLoading(false)
    }, 1000)
  }, [])

  const getStatusBadge = (status) => {
    const variants = {
      Active: "success",
      Draft: "warning",
      Completed: "primary",
      Paused: "secondary",
    }
    return (
      <Badge bg={variants[status] || "secondary"} className="badge-enhanced">
        {status}
      </Badge>
    )
  }

  const filteredSurveys = surveys.filter((survey) => {
    const matchesSearch =
      survey.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      survey.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || survey.status.toLowerCase() === filterStatus.toLowerCase()
    return matchesSearch && matchesFilter
  })

  const currentSurveys = filteredSurveys.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit,
  )

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
      <div className="loading-container d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <Container fluid className="surveys-container py-4 fade-in">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            <div className="d-flex align-items-center">
              <MdPoll size={32} className="text-primary me-3" />
              <div>
                <h2 className={`mb-1 ${darkMode ? "text-white" : "text-dark"}`}>Surveys</h2>
                <p className="text-muted mb-0">Manage and monitor all your surveys</p>
              </div>
            </div>
            <div className="d-flex gap-2 mt-2 mt-md-0">
              <Button variant="outline-primary" size="sm" className="btn-enhanced">
                <MdRefresh className="me-1" />
                Refresh
              </Button>
              <Button variant="primary" size="sm" className="btn-enhanced">
                <MdAdd className="me-1" />
                Create Survey
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
                  <div className={`text-muted small mb-1 ${darkMode ? "text-light" : ""}`}>Total Surveys</div>
                  <div className={`h4 mb-0 fw-bold ${darkMode ? "text-white" : "text-dark"}`}>{surveys.length}</div>
                </div>
                <MdPoll size={24} style={{ color: "var(--primary-color)" }} />
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
                  <div className={`text-muted small mb-1 ${darkMode ? "text-light" : ""}`}>Active Surveys</div>
                  <div className={`h4 mb-0 fw-bold ${darkMode ? "text-white" : "text-dark"}`}>
                    {surveys.filter((s) => s.status === "Active").length}
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
                  <div className={`text-muted small mb-1 ${darkMode ? "text-light" : ""}`}>Total Responses</div>
                  <div className={`h4 mb-0 fw-bold ${darkMode ? "text-white" : "text-dark"}`}>
                    {surveys.reduce((sum, s) => sum + s.responses, 0).toLocaleString()}
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
                  <div className={`text-muted small mb-1 ${darkMode ? "text-light" : ""}`}>Avg Completion</div>
                  <div className={`h4 mb-0 fw-bold ${darkMode ? "text-white" : "text-dark"}`}>
                    {Math.round(surveys.reduce((sum, s) => sum + s.completion, 0) / surveys.length)}%
                  </div>
                </div>
                <MdTrendingUp size={24} style={{ color: "var(--warning-color)" }} />
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
                      placeholder="Search surveys..."
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
                    <option value="draft">Draft</option>
                    <option value="completed">Completed</option>
                    <option value="paused">Paused</option>
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

      {/* Surveys Table */}
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
                          <MdPoll className="me-2" size={16} />
                          Survey Details
                        </div>
                      </th>
                      <th className="border-0 py-3">
                        <div className="d-flex align-items-center">
                          <MdCategory className="me-2" size={16} />
                          Category
                        </div>
                      </th>
                      <th className="border-0 py-3">Status</th>
                      <th className="border-0 py-3">
                        <div className="d-flex align-items-center">
                          <MdPeople className="me-2" size={16} />
                          Responses
                        </div>
                      </th>
                      <th className="border-0 py-3">
                        <div className="d-flex align-items-center">
                          <MdTrendingUp className="me-2" size={16} />
                          Completion
                        </div>
                      </th>
                      <th className="border-0 py-3">
                        <div className="d-flex align-items-center">
                          <MdCalendarToday className="me-2" size={16} />
                          Last Modified
                        </div>
                      </th>
                      <th className="border-0 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentSurveys.map((survey) => (
                      <tr key={survey.id}>
                        <td className="py-3 px-4 border-0">
                          <div>
                            <div className={`fw-medium mb-1 ${darkMode ? "text-white" : "text-dark"}`}>
                              {survey.name}
                            </div>
                            <div className="small text-muted">{survey.description}</div>
                          </div>
                        </td>
                        <td className="py-3 border-0">
                          <Badge bg="light" text="dark" className="px-2 py-1 badge-enhanced">
                            {survey.category}
                          </Badge>
                        </td>
                        <td className="py-3 border-0">{getStatusBadge(survey.status)}</td>
                        <td className="py-3 border-0">
                          <span className={darkMode ? "text-white" : "text-dark"}>{survey.responses}</span>
                        </td>
                        <td className="py-3 border-0">
                          <div className="d-flex align-items-center">
                            <div className="progress me-2" style={{ width: "60px", height: "6px" }}>
                              <div className="progress-bar bg-primary" style={{ width: `${survey.completion}%` }}></div>
                            </div>
                            <span className={`small ${darkMode ? "text-white" : "text-dark"}`}>
                              {survey.completion}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3 border-0">
                          <span className={darkMode ? "text-white" : "text-dark"}>{survey.lastModified}</span>
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
                                View
                              </Dropdown.Item>
                              <Dropdown.Item className="d-flex align-items-center">
                                <MdEdit className="me-2" />
                                Edit
                              </Dropdown.Item>
                              <Dropdown.Item className="d-flex align-items-center">
                                <MdShare className="me-2" />
                                Share
                              </Dropdown.Item>
                              <Dropdown.Item className="d-flex align-items-center">
                                <MdDownload className="me-2" />
                                Export
                              </Dropdown.Item>
                              <Dropdown.Divider />
                              <Dropdown.Item
                                className="d-flex align-items-center text-danger"
                                onClick={() => handleDelete(survey)}
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
                  total={filteredSurveys.length}
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
        <Modal.Body>Are you sure you want to delete "{selectedSurvey?.name}"? This action cannot be undone.</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)} className="btn-enhanced">
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete} className="btn-enhanced">
            Delete Survey
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default Surveys
