// src\pages\Communication\NotificationCenter.jsx

"use client"

import { useState, useEffect } from "react"
import { Container, Row, Col, Card, Table, Badge, Button, Form, InputGroup, Modal } from "react-bootstrap"
import {
  MdNotifications,
  MdAdd,
  MdSearch,
  MdFilterList,
  MdEdit,
  MdDelete,
  MdRefresh,
  MdMarkAsUnread,
  MdMarkEmailRead,
  MdPriorityHigh,
  MdInfo,
  MdWarning,
  MdError,
  MdCheckCircle,
} from "react-icons/md"
import Pagination from "../../components/Pagination/Pagination.jsx"

const NotificationCenter = ({ darkMode }) => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState(null)
  const [pagination, setPagination] = useState({ page: 1, limit:1, total: 0 })

  useEffect(() => {
    setTimeout(() => {
      const allNotifications = [
        {
          id: 1,
          title: "Survey Response Threshold Reached",
          message: "Customer Satisfaction Q4 survey has reached 100 responses",
          type: "Success",
          priority: "Medium",
          isRead: false,
          timestamp: "2024-01-20 14:30",
          source: "Survey System",
          recipient: "Admin",
        },
        {
          id: 2,
          title: "Low Response Rate Alert",
          message: "Product Feedback Survey has only 15% response rate after 3 days",
          type: "Warning",
          priority: "High",
          isRead: false,
          timestamp: "2024-01-20 12:15",
          source: "Analytics Engine",
          recipient: "Marketing Team",
        },
        {
          id: 3,
          title: "Survey Completion Notification",
          message: "Employee Engagement Survey has been completed successfully",
          type: "Success",
          priority: "Low",
          isRead: true,
          timestamp: "2024-01-19 16:45",
          source: "Survey System",
          recipient: "HR Team",
        },
        {
          id: 4,
          title: "System Maintenance Scheduled",
          message: "Scheduled maintenance on January 25th from 2:00 AM to 4:00 AM",
          type: "Info",
          priority: "Medium",
          isRead: false,
          timestamp: "2024-01-19 10:30",
          source: "System Admin",
          recipient: "All Users",
        },
        {
          id: 5,
          title: "Email Delivery Failed",
          message: "Failed to send survey invitation emails to 5 recipients",
          type: "Error",
          priority: "High",
          isRead: true,
          timestamp: "2024-01-18 09:20",
          source: "Email Service",
          recipient: "Admin",
        },
        {
          id: 6,
          title: "New User Registration",
          message: "3 new users have registered for the survey platform",
          type: "Info",
          priority: "Low",
          isRead: true,
          timestamp: "2024-01-18 08:15",
          source: "User Management",
          recipient: "Admin",
        },
        {
          id: 7,
          title: "Survey Template Updated",
          message: "Customer Satisfaction template has been updated with new questions",
          type: "Info",
          priority: "Medium",
          isRead: false,
          timestamp: "2024-01-17 15:30",
          source: "Template Manager",
          recipient: "Content Team",
        },
        {
          id: 8,
          title: "Data Export Completed",
          message: "Survey responses export for Q4 analysis has been completed",
          type: "Success",
          priority: "Low",
          isRead: true,
          timestamp: "2024-01-17 11:45",
          source: "Data Export",
          recipient: "Analytics Team",
        },
      ]
      setNotifications(allNotifications)
      setPagination((prev) => ({ ...prev, total: allNotifications.length }))
      setLoading(false)
    }, 1000)
  }, [])

  const getTypeBadge = (type) => {
    const variants = {
      Success: "success",
      Warning: "warning",
      Error: "danger",
      Info: "info",
    }
    const icons = {
      Success: <MdCheckCircle className="me-1" size={14} />,
      Warning: <MdWarning className="me-1" size={14} />,
      Error: <MdError className="me-1" size={14} />,
      Info: <MdInfo className="me-1" size={14} />,
    }
    return (
      <Badge bg={variants[type] || "secondary"} className="badge-enhanced d-flex align-items-center">
        {icons[type]}
        {type}
      </Badge>
    )
  }

  const getPriorityBadge = (priority) => {
    const variants = {
      High: "danger",
      Medium: "warning",
      Low: "secondary",
    }
    return (
      <Badge bg={variants[priority] || "secondary"} className="badge-enhanced">
        {priority === "High" && <MdPriorityHigh className="me-1" size={14} />}
        {priority}
      </Badge>
    )
  }

  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === "all" || notification.type.toLowerCase() === filterType.toLowerCase()
    return matchesSearch && matchesFilter
  })

  const currentNotifications = filteredNotifications.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit,
  )

  const handleDelete = (notification) => {
    setSelectedNotification(notification)
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    setNotifications(notifications.filter((n) => n.id !== selectedNotification.id))
    setShowDeleteModal(false)
    setSelectedNotification(null)
  }

  const toggleReadStatus = (id) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n)))
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
    <Container fluid className="notification-center-container py-4 fade-in">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            <div className="d-flex align-items-center">
              <MdNotifications size={32} className="text-primary me-3" />
              <div>
                <h2 className={`mb-1 ${darkMode ? "text-white" : "text-dark"}`}>Notification Center</h2>
                <p className="text-muted mb-0">Manage system notifications and alerts</p>
              </div>
            </div>
            <div className="d-flex gap-2 mt-2 mt-md-0">
              <Button variant="outline-primary" size="sm" className="btn-enhanced">
                <MdRefresh className="me-1" />
                Refresh
              </Button>
              <Button variant="primary" size="sm" className="btn-enhanced">
                <MdAdd className="me-1" />
                Create Notification
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
                  <div className={`text-muted small mb-1 ${darkMode ? "text-light" : ""}`}>Total Notifications</div>
                  <div className={`h4 mb-0 fw-bold ${darkMode ? "text-white" : "text-dark"}`}>
                    {notifications.length}
                  </div>
                </div>
                <MdNotifications size={24} style={{ color: "var(--primary-color)" }} />
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
                  <div className={`text-muted small mb-1 ${darkMode ? "text-light" : ""}`}>Unread</div>
                  <div className={`h4 mb-0 fw-bold ${darkMode ? "text-white" : "text-dark"}`}>
                    {notifications.filter((n) => !n.isRead).length}
                  </div>
                </div>
                <MdMarkAsUnread size={24} style={{ color: "var(--warning-color)" }} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3} className="mb-3">
          <Card
            className="stat-card border-0 shadow-sm card-enhanced"
            style={{ borderLeft: "4px solid var(--danger-color)" }}
          >
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <div className={`text-muted small mb-1 ${darkMode ? "text-light" : ""}`}>High Priority</div>
                  <div className={`h4 mb-0 fw-bold ${darkMode ? "text-white" : "text-dark"}`}>
                    {notifications.filter((n) => n.priority === "High").length}
                  </div>
                </div>
                <MdPriorityHigh size={24} style={{ color: "var(--danger-color)" }} />
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
                  <div className={`text-muted small mb-1 ${darkMode ? "text-light" : ""}`}>Success Alerts</div>
                  <div className={`h4 mb-0 fw-bold ${darkMode ? "text-white" : "text-dark"}`}>
                    {notifications.filter((n) => n.type === "Success").length}
                  </div>
                </div>
                <MdCheckCircle size={24} style={{ color: "var(--success-color)" }} />
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
                      placeholder="Search notifications..."
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
                    <option value="success">Success</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                    <option value="info">Info</option>
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

      {/* Notifications Table */}
      <Row>
        <Col>
          <Card className="border-0 card-enhanced">
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table className="mb-0 table-enhanced" >
                  <thead className="table-light">
                    <tr>
                      <th className="border-0 py-3 px-4">
                        <div className="d-flex align-items-center">
                          <MdNotifications className="me-2" size={16} />
                          Notification
                        </div>
                      </th>
                      <th className="border-0 py-3">Type</th>
                      <th className="border-0 py-3">Priority</th>
                      <th className="border-0 py-3">Source</th>
                      <th className="border-0 py-3">Recipient</th>
                      <th className="border-0 py-3">Timestamp</th>
                      <th className="border-0 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentNotifications.map((notification) => (
                      <tr
                        key={notification.id}
                        style={{ opacity: notification.isRead ? 0.8 : 1 }}
                      >
                        <td className="py-3 px-4 border-0">
                          <div className="d-flex align-items-start">
                            {!notification.isRead && (
                              <div
                                className="bg-primary rounded-circle me-2 mt-1"
                                style={{ width: "8px", height: "8px" }}
                              ></div>
                            )}
                            <div>
                              <div className={`fw-medium mb-1 ${darkMode ? "text-white" : "text-dark"}`}>
                                {notification.title}
                              </div>
                              <div className="small text-muted">{notification.message}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 border-0">{getTypeBadge(notification.type)}</td>
                        <td className="py-3 border-0">{getPriorityBadge(notification.priority)}</td>
                        <td className="py-3 border-0">
                          <span className={darkMode ? "text-white" : "text-dark"}>{notification.source}</span>
                        </td>
                        <td className="py-3 border-0">
                          <span className={darkMode ? "text-white" : "text-dark"}>{notification.recipient}</span>
                        </td>
                        <td className="py-3 border-0">
                          <span className={darkMode ? "text-white" : "text-dark"}>{notification.timestamp}</span>
                        </td>
                        <td className="py-3 text-center border-0">
                          <div className="btn-group btn-group-sm">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="btn-enhanced"
                              onClick={() => toggleReadStatus(notification.id)}
                            >
                              {notification.isRead ? <MdMarkAsUnread size={14} /> : <MdMarkEmailRead size={14} />}
                            </Button>
                            <Button variant="outline-secondary" size="sm" className="btn-enhanced">
                              <MdEdit size={14} />
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              className="btn-enhanced"
                              onClick={() => handleDelete(notification)}
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
                  total={filteredNotifications.length}
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
          Are you sure you want to delete "{selectedNotification?.title}"? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)} className="btn-enhanced">
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete} className="btn-enhanced">
            Delete Notification
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default NotificationCenter
