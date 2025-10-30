// src\pages\UserManagement\UserManagement.jsx
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
  MdBlock,
  MdEmail,
  MdRefresh,
  MdPerson,
} from "react-icons/md"
import Pagination from "../../components/Pagination/Pagination.jsx"
import axiosInstance from "../../api/axiosInstance";


export const fetchUsers = async () => {
  const response = await axiosInstance.get("/user");
  return response.data;
};

const UsersManagement = ({ darkMode }) => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState("all")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [pagination, setPagination] = useState({ page: 1, limit: 5, total: 0 })

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/users"); // endpoint check kar lena `/users` hai ya `/user`
      const fetchedUsers = response.data.data; // check structure in your API response
      setUsers(fetchedUsers);
      setPagination((prev) => ({
        ...prev,
        total: response.data.count,
      }));
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
  
    loadUsers();
  }, []);

  const getStatusBadge = (status) => {
    const variants = {
      Active: "success",
      Inactive: "secondary",
      Pending: "warning",
      Blocked: "danger",
    }
    return (
      <Badge bg={variants[status] || "secondary"} className="badge-enhanced">
        {status}
      </Badge>
    )
  }

  const getRoleBadge = (role) => {
    const variants = {
      "Super Admin": "danger",
      Admin: "primary",
      Editor: "info",
      Viewer: "secondary",
    }
    return (
      <Badge bg={variants[role] || "secondary"} className="badge-enhanced">
        {role}
      </Badge>
    )
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterRole === "all" || user.role.toLowerCase().includes(filterRole.toLowerCase())
    return matchesSearch && matchesFilter
  })

  const currentUsers = filteredUsers.slice((pagination.page - 1) * pagination.limit, pagination.page * pagination.limit)

  const handleDelete = (user) => {
    setSelectedUser(user)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    try {
      await axiosInstance.delete(`/users/${selectedUser._id}`); // id ya _id API ka response check kar lena
      setUsers(users.filter((u) => u._id !== selectedUser._id));
      setShowDeleteModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Failed to delete user", error);
    }
  };

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
    <Container fluid className="users-container py-4 fade-in">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            <div>
              <h2 className={`mb-1 ${darkMode ? "text-white" : "text-dark"}`}>Users</h2>
              <p className="text-muted mb-0">Manage user accounts and permissions</p>
            </div>
            <div className="d-flex gap-2 mt-2 mt-md-0">
              <Button variant="outline-primary" size="sm" className="btn-enhanced" onClick={loadUsers}>
                <MdRefresh className="me-1" />
                Refresh
              </Button>
              <Button variant="primary" size="sm" className="btn-enhanced">
                <MdAdd className="me-1" />
                Add User
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
                  <div className={`text-muted small mb-1 ${darkMode ? "text-light" : ""}`}>Total Users</div>
                  <div className={`h4 mb-0 fw-bold ${darkMode ? "text-white" : "text-dark"}`}>{users.length}</div>
                </div>
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "48px",
                    height: "48px",
                    backgroundColor: "var(--primary-color)",
                    opacity: 0.1,
                  }}
                >
                  <MdPerson size={24} style={{ color: "var(--primary-color)" }} />
                </div>
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
                  <div className={`text-muted small mb-1 ${darkMode ? "text-light" : ""}`}>Active Users</div>
                  <div className={`h4 mb-0 fw-bold ${darkMode ? "text-white" : "text-dark"}`}>
                    {users.filter((u) => u.status === "Active").length}
                  </div>
                </div>
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
                  <div className={`text-muted small mb-1 ${darkMode ? "text-light" : ""}`}>Pending Users</div>
                  <div className={`h4 mb-0 fw-bold ${darkMode ? "text-white" : "text-dark"}`}>
                    {users.filter((u) => u.status === "Pending").length}
                  </div>
                </div>
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
                  <div className={`text-muted small mb-1 ${darkMode ? "text-light" : ""}`}>Admins</div>
                  <div className={`h4 mb-0 fw-bold ${darkMode ? "text-white" : "text-dark"}`}>
                    {users.filter((u) => u.role.includes("Admin")).length}
                  </div>
                </div>
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
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                </Col>
                <Col md={3} lg={2} className="mb-2 mb-md-0">
                  <Form.Select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="form-enhanced"
                  >
                    <option value="all">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="editor">Editor</option>
                    <option value="viewer">Viewer</option>
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

      {/* Users Table */}
      <Row>
        <Col>
          <Card className="border-0 shadow-sm card-enhanced">
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table className="mb-0 table-enhanced" hover>
                  <thead className="table-light">
                    <tr>
                      <th className="border-0 py-3 px-4">User</th>
                      <th className="border-0 py-3">Role</th>
                      <th className="border-0 py-3">Department</th>
                      <th className="border-0 py-3">Status</th>
                      <th className="border-0 py-3">Last Login</th>
                      <th className="border-0 py-3">Created</th>
                      <th className="border-0 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentUsers.map((user) => 
                      <tr key={user._id}>
                        <td className="py-3 px-4 border-0">
                          <div className="d-flex align-items-center">
                            <div
                              className="rounded-circle bg-primary d-flex align-items-center justify-content-center me-3"
                              style={{ width: "40px", height: "40px" }}
                            >
                              <MdPerson className="text-white" size={20} />
                            </div>
                            <div>
                              <div className={`fw-medium mb-1 ${darkMode ? "text-white" : "text-dark"}`}>
                                {user.name}
                              </div>
                              <div className="small text-muted">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 border-0">{getRoleBadge(user.role)}</td>
                        <td className="py-3 border-0">
                          <span className={darkMode ? "text-white" : "text-dark"}>{user.department}</span>
                        </td>
                        <td className="py-3 border-0">{getStatusBadge(user.status)}</td>
                        <td className="py-3 border-0">
                          <span className={darkMode ? "text-white" : "text-dark"}>{user.lastLogin}</span>
                        </td>
                        <td className="py-3 border-0">
                          <span className={darkMode ? "text-white" : "text-dark"}>{user.created}</span>
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
                                <MdEdit className="me-2" />
                                Edit
                              </Dropdown.Item>
                              <Dropdown.Item className="d-flex align-items-center">
                                <MdEmail className="me-2" />
                                Send Email
                              </Dropdown.Item>
                              <Dropdown.Item className="d-flex align-items-center">
                                <MdBlock className="me-2" />
                                Block User
                              </Dropdown.Item>
                              <Dropdown.Divider />
                              <Dropdown.Item
                                className="d-flex align-items-center text-danger"
                                onClick={() => handleDelete(user)}
                              >
                                <MdDelete className="me-2" />
                                Delete
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
              <div className="p-3 border-top">
                <Pagination
                  current={pagination.page}
                  total={filteredUsers.length}
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
          Are you sure you want to delete user "{selectedUser?.name}"? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)} className="btn-enhanced">
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete} className="btn-enhanced">
            Delete User
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default UsersManagement
