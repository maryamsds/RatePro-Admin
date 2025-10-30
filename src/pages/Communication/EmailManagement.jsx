// src\pages\Communication\EmailManagement.jsx

"use client"

import { useState, useEffect } from "react"
import { Container, Row, Col, Card, Table, Badge, Button, Form, InputGroup, Modal, Dropdown } from "react-bootstrap"
import {
  MdEmail,
  MdAdd,
  MdSearch,
  MdFilterList,
  MdMoreVert,
  MdEdit,
  MdDelete,
  MdSend,
  MdRefresh,
  MdSchedule,
  MdPeople,
  MdTrendingUp,
  MdOpenInNew,
} from "react-icons/md"
import Pagination from "../../components/Pagination/Pagination.jsx"

const EmailManagement = ({ darkMode }) => {
  const [emails, setEmails] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedEmail, setSelectedEmail] = useState(null)
  const [pagination, setPagination] = useState({ page: 1, limit: 1, total: 0 })

  useEffect(() => {
    setTimeout(() => {
      const allEmails = [
        {
          id: 1,
          subject: "Survey Invitation - Customer Satisfaction Q4",
          recipient: "customers@company.com",
          status: "Sent",
          sentDate: "2024-01-20 14:30",
          openRate: 78,
          clickRate: 45,
          template: "Survey Invitation",
          campaign: "Q4 Customer Feedback",
        },
        {
          id: 2,
          subject: "Reminder: Complete Your Product Feedback Survey",
          recipient: "users@platform.com",
          status: "Scheduled",
          sentDate: "2024-01-22 09:00",
          openRate: 0,
          clickRate: 0,
          template: "Survey Reminder",
          campaign: "Product Feedback",
        },
        {
          id: 3,
          subject: "Thank You for Your Survey Response",
          recipient: "respondents@survey.com",
          status: "Sent",
          sentDate: "2024-01-19 16:45",
          openRate: 92,
          clickRate: 23,
          template: "Thank You",
          campaign: "Employee Engagement",
        },
        {
          id: 4,
          subject: "New Survey Available - Market Research Study",
          recipient: "participants@research.com",
          status: "Draft",
          sentDate: null,
          openRate: 0,
          clickRate: 0,
          template: "Survey Announcement",
          campaign: "Market Research",
        },
        {
          id: 5,
          subject: "Survey Results Summary - Brand Awareness",
          recipient: "stakeholders@company.com",
          status: "Sent",
          sentDate: "2024-01-18 11:20",
          openRate: 85,
          clickRate: 67,
          template: "Results Summary",
          campaign: "Brand Awareness",
        },
        {
          id: 6,
          subject: "Follow-up Survey - Website Usability",
          recipient: "testers@website.com",
          status: "Failed",
          sentDate: "2024-01-17 13:15",
          openRate: 0,
          clickRate: 0,
          template: "Follow-up Survey",
          campaign: "Website Testing",
        },
        {
          id: 7,
          subject: "Survey Completion Incentive Notification",
          recipient: "participants@incentive.com",
          status: "Sent",
          sentDate: "2024-01-16 10:30",
          openRate: 94,
          clickRate: 78,
          template: "Incentive Notification",
          campaign: "Training Effectiveness",
        },
        {
          id: 8,
          subject: "Monthly Survey Newsletter - January 2024",
          recipient: "subscribers@newsletter.com",
          status: "Scheduled",
          sentDate: "2024-01-25 08:00",
          openRate: 0,
          clickRate: 0,
          template: "Newsletter",
          campaign: "Monthly Updates",
        },
      ]
      setEmails(allEmails)
      setPagination((prev) => ({ ...prev, total: allEmails.length }))
      setLoading(false)
    }, 1000)
  }, [])

  const getStatusBadge = (status) => {
    const variants = {
      Sent: "success",
      Draft: "secondary",
      Scheduled: "warning",
      Failed: "danger",
    }
    return (
      <Badge bg={variants[status] || "secondary"} className="badge-enhanced">
        {status}
      </Badge>
    )
  }

  const filteredEmails = emails.filter((email) => {
    const matchesSearch =
      email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.recipient.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || email.status.toLowerCase() === filterStatus.toLowerCase()
    return matchesSearch && matchesFilter
  })

  const currentEmails = filteredEmails.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit,
  )

  const handleDelete = (email) => {
    setSelectedEmail(email)
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    setEmails(emails.filter((e) => e.id !== selectedEmail.id))
    setShowDeleteModal(false)
    setSelectedEmail(null)
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
    <Container fluid className="email-management-container py-4 fade-in">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            <div className="d-flex align-items-center">
              <MdEmail size={32} className="text-primary me-3" />
              <div>
                <h2 className={`mb-1 ${darkMode ? "text-white" : "text-dark"}`}>Email Management</h2>
                <p className="text-muted mb-0">Manage email campaigns and communications</p>
              </div>
            </div>
            <div className="d-flex gap-2 mt-2 mt-md-0">
              <Button variant="outline-primary" size="sm" className="btn-enhanced">
                <MdRefresh className="me-1" />
                Refresh
              </Button>
              <Button variant="primary" size="sm" className="btn-enhanced">
                <MdAdd className="me-1" />
                Compose Email
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
                  <div className={`text-muted small mb-1 ${darkMode ? "text-light" : ""}`}>Total Emails</div>
                  <div className={`h4 mb-0 fw-bold ${darkMode ? "text-white" : "text-dark"}`}>{emails.length}</div>
                </div>
                <MdEmail size={24} style={{ color: "var(--primary-color)" }} />
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
                  <div className={`text-muted small mb-1 ${darkMode ? "text-light" : ""}`}>Sent Emails</div>
                  <div className={`h4 mb-0 fw-bold ${darkMode ? "text-white" : "text-dark"}`}>
                    {emails.filter((e) => e.status === "Sent").length}
                  </div>
                </div>
                <MdSend size={24} style={{ color: "var(--success-color)" }} />
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
                  <div className={`text-muted small mb-1 ${darkMode ? "text-light" : ""}`}>Scheduled</div>
                  <div className={`h4 mb-0 fw-bold ${darkMode ? "text-white" : "text-dark"}`}>
                    {emails.filter((e) => e.status === "Scheduled").length}
                  </div>
                </div>
                <MdSchedule size={24} style={{ color: "var(--warning-color)" }} />
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
                  <div className={`text-muted small mb-1 ${darkMode ? "text-light" : ""}`}>Avg Open Rate</div>
                  <div className={`h4 mb-0 fw-bold ${darkMode ? "text-white" : "text-dark"}`}>
                    {Math.round(
                      emails.filter((e) => e.openRate > 0).reduce((sum, e) => sum + e.openRate, 0) /
                        emails.filter((e) => e.openRate > 0).length || 0,
                    )}
                    %
                  </div>
                </div>
                <MdTrendingUp size={24} style={{ color: "var(--info-color)" }} />
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
                      placeholder="Search emails..."
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
                    <option value="sent">Sent</option>
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="failed">Failed</option>
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

      {/* Emails Table */}
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
                          <MdEmail className="me-2" size={16} />
                          Subject
                        </div>
                      </th>
                      <th className="border-0 py-3">
                        <div className="d-flex align-items-center">
                          <MdPeople className="me-2" size={16} />
                          Recipient
                        </div>
                      </th>
                      <th className="border-0 py-3">Status</th>
                      <th className="border-0 py-3">Sent Date</th>
                      <th className="border-0 py-3">Open Rate</th>
                      <th className="border-0 py-3">Click Rate</th>
                      <th className="border-0 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentEmails.map((email) => (
                      <tr key={email.id}>
                        <td className="py-3 px-4 border-0">
                          <div>
                            <div className={`fw-medium mb-1 ${darkMode ? "text-white" : "text-dark"}`}>
                              {email.subject}
                            </div>
                            <div className="small text-muted">{email.campaign}</div>
                          </div>
                        </td>
                        <td className="py-3 border-0">
                          <span className={darkMode ? "text-white" : "text-dark"}>{email.recipient}</span>
                        </td>
                        <td className="py-3 border-0">{getStatusBadge(email.status)}</td>
                        <td className="py-3 border-0">
                          <span className={darkMode ? "text-white" : "text-dark"}>{email.sentDate || "Not sent"}</span>
                        </td>
                        <td className="py-3 border-0">
                          <span className={darkMode ? "text-white" : "text-dark"}>{email.openRate}%</span>
                        </td>
                        <td className="py-3 border-0">
                          <span className={darkMode ? "text-white" : "text-dark"}>{email.clickRate}%</span>
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
                                <MdOpenInNew className="me-2" />
                                View
                              </Dropdown.Item>
                              <Dropdown.Item className="d-flex align-items-center">
                                <MdEdit className="me-2" />
                                Edit
                              </Dropdown.Item>
                              <Dropdown.Item className="d-flex align-items-center">
                                <MdSend className="me-2" />
                                Resend
                              </Dropdown.Item>
                              <Dropdown.Divider />
                              <Dropdown.Item
                                className="d-flex align-items-center text-danger"
                                onClick={() => handleDelete(email)}
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
                  total={filteredEmails.length}
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
          Are you sure you want to delete "{selectedEmail?.subject}"? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)} className="btn-enhanced">
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete} className="btn-enhanced">
            Delete Email
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default EmailManagement
