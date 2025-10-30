"use client"

import { useState, useEffect } from "react"
import { Container, Row, Col, Card, Table, Badge, Button, Form, Modal } from "react-bootstrap"
import { MdAdd, MdEdit, MdDelete, MdSave, MdCancel, MdSecurity } from "react-icons/md"
import Pagination from "../../components/Pagination/Pagination.jsx"

const PermissionManagement = () => {
  const [permissions, setPermissions] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPermission, setEditingPermission] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    isSystem: false,
  })

  // category-wise pagination state
  const [paginationStates, setPaginationStates] = useState({})

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      const loadedCategories = [
        { id: "content", name: "Content Management", color: "primary" },
        { id: "users", name: "User Management", color: "success" },
        { id: "system", name: "System Administration", color: "danger" },
        { id: "analytics", name: "Analytics & Reports", color: "info" },
      ]
      setCategories(loadedCategories)

      const loadedPermissions = [
        { id: 1, name: "read", displayName: "Read Content", description: "View and read all content", category: "content", isSystem: true, usedInRoles: 4 },
        { id: 2, name: "write", displayName: "Write Content", description: "Create and edit content", category: "content", isSystem: true, usedInRoles: 3 },
        { id: 3, name: "delete", displayName: "Delete Content", description: "Delete content", category: "content", isSystem: true, usedInRoles: 2 },
        { id: 4, name: "manage_users", displayName: "Manage Users", description: "Add/edit users", category: "users", isSystem: true, usedInRoles: 2 },
        { id: 5, name: "manage_settings", displayName: "Manage Settings", description: "Configure system", category: "system", isSystem: true, usedInRoles: 1 },
        { id: 6, name: "view_analytics", displayName: "View Analytics", description: "Access reports", category: "analytics", isSystem: false, usedInRoles: 3 },
        { id: 7, name: "export_data", displayName: "Export Data", description: "Export system data", category: "analytics", isSystem: false, usedInRoles: 2 },
        { id: 8, name: "manage_roles", displayName: "Manage Roles", description: "Create/modify roles", category: "system", isSystem: true, usedInRoles: 1 },
      ]
      setPermissions(loadedPermissions)

      // Initialize pagination per category
      const paginations = {}
      loadedCategories.forEach((category) => {
        const total = loadedPermissions.filter((perm) => perm.category === category.id).length
        paginations[category.id] = { page: 1, limit: 1, total }
      })
      setPaginationStates(paginations)

      setLoading(false)
    }, 1000)
  }, [])

  const handleCreatePermission = () => {
    setEditingPermission(null)
    setFormData({ name: "", description: "", category: "", isSystem: false })
    setShowModal(true)
  }

  const handleEditPermission = (permission) => {
    setEditingPermission(permission)
    setFormData({
      name: permission.displayName,
      description: permission.description,
      category: permission.category,
      isSystem: permission.isSystem,
    })
    setShowModal(true)
  }

  const handleSavePermission = () => {
    if (editingPermission) {
      setPermissions(
        permissions.map((perm) =>
          perm.id === editingPermission.id
            ? { ...perm, displayName: formData.name, description: formData.description, category: formData.category }
            : perm
        )
      )
    } else {
      const newPermission = {
        id: Date.now(),
        name: formData.name.toLowerCase().replace(/\s+/g, "_"),
        displayName: formData.name,
        description: formData.description,
        category: formData.category,
        isSystem: false,
        usedInRoles: 0,
      }
      setPermissions([...permissions, newPermission])

      // Update pagination total
      setPaginationStates((prev) => {
        const prevTotal = prev[formData.category]?.total || 0
        return {
          ...prev,
          [formData.category]: { page: 1, limit: 1, total: prevTotal + 1 },
        }
      })
    }
    setShowModal(false)
  }

  const handleDeletePermission = (permissionId) => {
    if (window.confirm("Are you sure you want to delete this permission?")) {
      const permissionToDelete = permissions.find((p) => p.id === permissionId)
      setPermissions(permissions.filter((p) => p.id !== permissionId))

      // Decrement total in pagination state
      setPaginationStates((prev) => {
        const prevTotal = prev[permissionToDelete.category]?.total || 1
        return {
          ...prev,
          [permissionToDelete.category]: {
            ...prev[permissionToDelete.category],
            total: prevTotal - 1,
          },
        }
      })
    }
  }

  const getCategoryInfo = (categoryId) => categories.find((cat) => cat.id === categoryId) || { name: "Unknown", color: "secondary" }

  const getPaginatedPermissions = (categoryId) => {
    const { page, limit } = paginationStates[categoryId] || { page: 1, limit: 2 }
    const filtered = permissions.filter((perm) => perm.category === categoryId)
    const start = (page - 1) * limit
    return filtered.slice(start, start + limit)
  }

  if (loading) {
    return (
      <Container fluid className="py-4">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status"></div>
          <p>Loading permissions...</p>
        </div>
      </Container>
    )
  }

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-1">Permission Management</h1>
              <p className="text-muted mb-0">Manage system permissions and access controls</p>
            </div>
            <Button variant="primary" onClick={handleCreatePermission}>
              <MdAdd className="me-2" />
              Create Permission
            </Button>
          </div>
        </Col>
      </Row>

      <Row className="g-4 mb-4">
        {categories.map((category) => (
          <Col key={category.id} xs={12} sm={6} lg={3}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center">
                <div className={`text-${category.color} mb-2`}>
                  <MdSecurity size={32} />
                </div>
                <h5>{category.name}</h5>
                <p className="text-muted">{(paginationStates[category.id]?.total || 0)} permissions</p>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {categories.map((category) => {
        const perms = permissions.filter((p) => p.category === category.id)
        if (perms.length === 0) return null

        const paginatedPerms = getPaginatedPermissions(category.id)

        return (
          <Card key={category.id} className="mb-4 border-0 shadow-sm">
            <Card.Header className="bg-transparent">
              <div className="d-flex align-items-center">
                <Badge bg={category.color} className="me-2">{category.name}</Badge>
                <span className="text-muted">({perms.length} permissions)</span>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Permission</th>
                      <th>Description</th>
                      <th>Used in Roles</th>
                      <th>Type</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedPerms.map((permission) => (
                      <tr key={permission.id}>
                        <td>
                          <div className="fw-medium">{permission.displayName}</div>
                          <small className="text-muted font-monospace">{permission.name}</small>
                        </td>
                        <td>{permission.description}</td>
                        <td><Badge bg="primary">{permission.usedInRoles} roles</Badge></td>
                        <td>{permission.isSystem ? <Badge bg="warning">System</Badge> : <Badge bg="secondary">Custom</Badge>}</td>
                        <td>
                          <div className="d-flex justify-content-center gap-1">
                            <Button size="sm" variant="outline-primary" disabled={permission.isSystem} onClick={() => handleEditPermission(permission)}>
                              <MdEdit />
                            </Button>
                            <Button size="sm" variant="outline-danger" disabled={permission.isSystem || permission.usedInRoles > 0} onClick={() => handleDeletePermission(permission.id)}>
                              <MdDelete />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
              <div className="p-3">
                <Pagination
                  current={paginationStates[category.id]?.page || 1}
                  total={paginationStates[category.id]?.total || 0}
                  limit={paginationStates[category.id]?.limit || 2}
                  onChange={(page) =>
                    setPaginationStates((prev) => ({
                      ...prev,
                      [category.id]: {
                        ...prev[category.id],
                        page,
                      },
                    }))
                  }
                />
              </div>
            </Card.Body>
          </Card>
        )
      })}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingPermission ? "Edit Permission" : "Create Permission"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Permission Name</Form.Label>
              <Form.Control type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}><MdCancel className="me-2" />Cancel</Button>
          <Button variant="primary" onClick={handleSavePermission}><MdSave className="me-2" />{editingPermission ? "Update" : "Create"}</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default PermissionManagement
