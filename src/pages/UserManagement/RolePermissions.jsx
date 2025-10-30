// src\pages\UserManagement\RolePermissions.jsx

"use client"

import { useState } from "react"
import { Container, Row, Col, Card, Table, Badge, Button, Form, Modal } from "react-bootstrap"

const RolePermissions = () => {
  const [roles, setRoles] = useState([
    {
      id: 1,
      name: "Administrator",
      description: "Full system access with all permissions",
      userCount: 2,
      permissions: [
        "surveys.create",
        "surveys.edit",
        "surveys.delete",
        "surveys.view",
        "analytics.view",
        "analytics.export",
        "users.manage",
        "settings.manage",
      ],
      isSystem: true,
    },
    {
      id: 2,
      name: "Manager",
      description: "Can manage surveys and view analytics",
      userCount: 5,
      permissions: ["surveys.create", "surveys.edit", "surveys.view", "analytics.view", "analytics.export"],
      isSystem: false,
    },
    {
      id: 3,
      name: "User",
      description: "Basic user with limited permissions",
      userCount: 12,
      permissions: ["surveys.view", "analytics.view"],
      isSystem: false,
    },
    {
      id: 4,
      name: "Viewer",
      description: "Read-only access to surveys and analytics",
      userCount: 8,
      permissions: ["surveys.view", "analytics.view"],
      isSystem: false,
    },
  ])

  const [showModal, setShowModal] = useState(false)
  const [currentRole, setCurrentRole] = useState({
    name: "",
    description: "",
    permissions: [],
  })

  const allPermissions = [
    {
      category: "Surveys",
      permissions: [
        { id: "surveys.create", label: "Create Surveys", description: "Create new surveys" },
        { id: "surveys.edit", label: "Edit Surveys", description: "Modify existing surveys" },
        { id: "surveys.delete", label: "Delete Surveys", description: "Remove surveys from system" },
        { id: "surveys.view", label: "View Surveys", description: "Access and view surveys" },
        { id: "surveys.publish", label: "Publish Surveys", description: "Make surveys live" },
      ],
    },
    {
      category: "Analytics",
      permissions: [
        { id: "analytics.view", label: "View Analytics", description: "Access analytics dashboard" },
        { id: "analytics.export", label: "Export Data", description: "Export analytics data" },
        { id: "analytics.advanced", label: "Advanced Analytics", description: "Access advanced analytics features" },
      ],
    },
    {
      category: "Users",
      permissions: [
        { id: "users.manage", label: "Manage Users", description: "Add, edit, and remove users" },
        { id: "users.view", label: "View Users", description: "View user information" },
        { id: "users.roles", label: "Manage Roles", description: "Create and modify user roles" },
      ],
    },
    {
      category: "Settings",
      permissions: [
        { id: "settings.manage", label: "Manage Settings", description: "Modify system settings" },
        { id: "settings.billing", label: "Billing Management", description: "Manage billing and subscriptions" },
        {
          id: "settings.integrations",
          label: "Manage Integrations",
          description: "Configure third-party integrations",
        },
      ],
    },
  ]

  const handleCreateRole = () => {
    setCurrentRole({ name: "", description: "", permissions: [] })
    setShowModal(true)
  }

  const handleSaveRole = () => {
    if (currentRole.name.trim()) {
      const newRole = {
        ...currentRole,
        id: Date.now(),
        userCount: 0,
        isSystem: false,
      }
      setRoles([...roles, newRole])
      setShowModal(false)
    }
  }

  const deleteRole = (id) => {
    setRoles(roles.filter((r) => r.id !== id))
  }

  const getPermissionLabel = (permissionId) => {
    for (const category of allPermissions) {
      const permission = category.permissions.find((p) => p.id === permissionId)
      if (permission) return permission.label
    }
    return permissionId
  }

  const togglePermission = (permissionId) => {
    setCurrentRole((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter((p) => p !== permissionId)
        : [...prev.permissions, permissionId],
    }))
  }

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-0">Roles & Permissions</h1>
              <p className="text-muted">Manage user roles and their permissions</p>
            </div>
            <Button variant="primary" onClick={handleCreateRole}>
              <i className="fas fa-plus me-2"></i>
              Create Role
            </Button>
          </div>
        </Col>
      </Row>

      {/* Roles Overview */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <Card.Title className="mb-0">System Roles</Card.Title>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table className="mb-0" hover>
                  <thead className="table-light">
                    <tr>
                      <th>Role Name</th>
                      <th>Description</th>
                      <th>Users</th>
                      <th>Permissions</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roles.map((role) => (
                      <tr key={role.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <span className="fw-medium">{role.name}</span>
                            {role.isSystem && (
                              <Badge bg="info" className="ms-2 small">
                                System
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="text-truncate" style={{ maxWidth: "300px" }}>
                            {role.description}
                          </div>
                        </td>
                        <td>
                          <Badge bg="secondary">{role.userCount} users</Badge>
                        </td>
                        <td>
                          <div className="d-flex flex-wrap gap-1">
                            {role.permissions.slice(0, 3).map((permission) => (
                              <Badge key={permission} bg="outline-primary" className="small">
                                {getPermissionLabel(permission)}
                              </Badge>
                            ))}
                            {role.permissions.length > 3 && (
                              <Badge bg="outline-secondary" className="small">
                                +{role.permissions.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <Button variant="outline-primary" size="sm" title="View Details">
                              <i className="fas fa-eye"></i>
                            </Button>
                            <Button variant="outline-secondary" size="sm" title="Edit" disabled={role.isSystem}>
                              <i className="fas fa-edit"></i>
                            </Button>
                            <Button variant="outline-info" size="sm" title="Duplicate">
                              <i className="fas fa-copy"></i>
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              title="Delete"
                              disabled={role.isSystem || role.userCount > 0}
                              onClick={() => deleteRole(role.id)}
                            >
                              <i className="fas fa-trash"></i>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Permissions Matrix */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <Card.Title className="mb-0">Permissions Matrix</Card.Title>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table className="mb-0" size="sm">
                  <thead>
                    <tr>
                      <th>Permission</th>
                      {roles.map((role) => (
                        <th key={role.id} className="text-center">
                          {role.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {allPermissions.map((category) => (
                      <>
                        <tr key={category.category}>
                          <td colSpan={roles.length + 1} className="table-secondary fw-bold">
                            {category.category}
                          </td>
                        </tr>
                        {category.permissions.map((permission) => (
                          <tr key={permission.id}>
                            <td>
                              <div>
                                <div className="fw-medium">{permission.label}</div>
                                <small className="text-muted">{permission.description}</small>
                              </div>
                            </td>
                            {roles.map((role) => (
                              <td key={role.id} className="text-center">
                                {role.permissions.includes(permission.id) ? (
                                  <i className="fas fa-check text-success"></i>
                                ) : (
                                  <i className="fas fa-times text-muted"></i>
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Create Role Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create New Role</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Role Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter role name"
                value={currentRole.name}
                onChange={(e) => setCurrentRole({ ...currentRole, name: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Describe this role"
                value={currentRole.description}
                onChange={(e) => setCurrentRole({ ...currentRole, description: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Permissions</Form.Label>
              <div className="border rounded p-3" style={{ maxHeight: "400px", overflowY: "auto" }}>
                {allPermissions.map((category) => (
                  <div key={category.category} className="mb-3">
                    <h6 className="text-primary mb-2">{category.category}</h6>
                    {category.permissions.map((permission) => (
                      <Form.Check
                        key={permission.id}
                        type="checkbox"
                        id={permission.id}
                        label={
                          <div>
                            <div className="fw-medium">{permission.label}</div>
                            <small className="text-muted">{permission.description}</small>
                          </div>
                        }
                        checked={currentRole.permissions.includes(permission.id)}
                        onChange={() => togglePermission(permission.id)}
                        className="mb-2"
                      />
                    ))}
                  </div>
                ))}
              </div>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveRole}>
            Create Role
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default RolePermissions
