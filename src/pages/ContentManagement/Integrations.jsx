// src\pages\ContentManagement\Integrations.jsx

"use client"

import { useState } from "react"
import { Container, Row, Col, Card, Button, Badge, Form, Modal } from "react-bootstrap"

const Integrations = () => {
  const [integrations, setIntegrations] = useState([
    {
      id: "slack",
      name: "Slack",
      description: "Send survey notifications to Slack channels",
      category: "Communication",
      icon: "fab fa-slack",
      connected: true,
      config: { webhook: "https://hooks.slack.com/...", channel: "#surveys" },
    },
    {
      id: "zapier",
      name: "Zapier",
      description: "Automate workflows with 3000+ apps",
      category: "Automation",
      icon: "fas fa-bolt",
      connected: false,
      config: {},
    },
    {
      id: "salesforce",
      name: "Salesforce",
      description: "Sync survey data with Salesforce CRM",
      category: "CRM",
      icon: "fab fa-salesforce",
      connected: true,
      config: { instance: "mycompany.salesforce.com", object: "Lead" },
    },
    {
      id: "hubspot",
      name: "HubSpot",
      description: "Import contacts and sync survey responses",
      category: "CRM",
      icon: "fab fa-hubspot",
      connected: false,
      config: {},
    },
    {
      id: "mailchimp",
      name: "Mailchimp",
      description: "Send surveys to Mailchimp audiences",
      category: "Email Marketing",
      icon: "fab fa-mailchimp",
      connected: true,
      config: { listId: "abc123", apiKey: "***" },
    },
    {
      id: "google-analytics",
      name: "Google Analytics",
      description: "Track survey engagement and conversions",
      category: "Analytics",
      icon: "fab fa-google",
      connected: false,
      config: {},
    },
  ])

  const [showConfigModal, setShowConfigModal] = useState(false)
  const [currentIntegration, setCurrentIntegration] = useState(null)
  const [filterCategory, setFilterCategory] = useState("all")

  const categories = ["all", "Communication", "Automation", "CRM", "Email Marketing", "Analytics"]

  const toggleIntegration = (id) => {
    setIntegrations(
      integrations.map((integration) =>
        integration.id === id ? { ...integration, connected: !integration.connected } : integration,
      ),
    )
  }

  const configureIntegration = (integration) => {
    setCurrentIntegration(integration)
    setShowConfigModal(true)
  }

  const saveConfiguration = () => {
    // Handle saving configuration
    setShowConfigModal(false)
    setCurrentIntegration(null)
  }

  const filteredIntegrations = integrations.filter(
    (integration) => filterCategory === "all" || integration.category === filterCategory,
  )

  const getStatusBadge = (connected) => {
    return <Badge bg={connected ? "success" : "secondary"}>{connected ? "Connected" : "Not Connected"}</Badge>
  }

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-0">Integrations</h1>
              <p className="text-muted">Connect RatePro with your favorite tools and services</p>
            </div>
            <Button variant="outline-primary">
              <i className="fas fa-plus me-2"></i>
              Request Integration
            </Button>
          </div>
        </Col>
      </Row>

      {/* Filter */}
      <Row className="mb-4">
        <Col lg={4}>
          <Form.Select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === "all" ? "All Categories" : category}
              </option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      {/* Integrations Grid */}
      <Row>
        {filteredIntegrations.map((integration) => (
          <Col key={integration.id} lg={4} md={6} className="mb-4">
            <Card className="h-100 integration-card">
              <Card.Body className="d-flex flex-column">
                <div className="d-flex align-items-start mb-3">
                  <div className="integration-icon me-3">
                    <i className={`${integration.icon} fa-2x text-primary`}></i>
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start">
                      <h5 className="mb-1">{integration.name}</h5>
                      {getStatusBadge(integration.connected)}
                    </div>
                    <Badge bg="light" text="dark" className="small">
                      {integration.category}
                    </Badge>
                  </div>
                </div>

                <p className="text-muted flex-grow-1">{integration.description}</p>

                {integration.connected && Object.keys(integration.config).length > 0 && (
                  <div className="mb-3">
                    <small className="text-muted">Configuration:</small>
                    <div className="bg-light p-2 rounded small">
                      {Object.entries(integration.config).map(([key, value]) => (
                        <div key={key}>
                          <strong>{key}:</strong> {typeof value === "string" && value.includes("***") ? value : value}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="d-flex gap-2 mt-auto">
                  {integration.connected ? (
                    <>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="flex-grow-1"
                        onClick={() => configureIntegration(integration)}
                      >
                        <i className="fas fa-cog me-2"></i>
                        Configure
                      </Button>
                      <Button variant="outline-danger" size="sm" onClick={() => toggleIntegration(integration.id)}>
                        <i className="fas fa-unlink"></i>
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-100"
                      onClick={() => toggleIntegration(integration.id)}
                    >
                      <i className="fas fa-link me-2"></i>
                      Connect
                    </Button>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Configuration Modal */}
      <Modal show={showConfigModal} onHide={() => setShowConfigModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Configure {currentIntegration?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentIntegration && (
            <Form>
              {currentIntegration.id === "slack" && (
                <>
                  <Form.Group className="mb-3">
                    <Form.Label>Webhook URL</Form.Label>
                    <Form.Control
                      type="url"
                      placeholder="https://hooks.slack.com/services/..."
                      defaultValue={currentIntegration.config.webhook}
                    />
                    <Form.Text className="text-muted">
                      Get your webhook URL from Slack's Incoming Webhooks app
                    </Form.Text>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Default Channel</Form.Label>
                    <Form.Control type="text" placeholder="#surveys" defaultValue={currentIntegration.config.channel} />
                  </Form.Group>
                </>
              )}

              {currentIntegration.id === "salesforce" && (
                <>
                  <Form.Group className="mb-3">
                    <Form.Label>Salesforce Instance</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="mycompany.salesforce.com"
                      defaultValue={currentIntegration.config.instance}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Object Type</Form.Label>
                    <Form.Select defaultValue={currentIntegration.config.object}>
                      <option value="Lead">Lead</option>
                      <option value="Contact">Contact</option>
                      <option value="Account">Account</option>
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>API Token</Form.Label>
                    <Form.Control type="password" placeholder="Enter your Salesforce API token" />
                  </Form.Group>
                </>
              )}

              {currentIntegration.id === "mailchimp" && (
                <>
                  <Form.Group className="mb-3">
                    <Form.Label>API Key</Form.Label>
                    <Form.Control type="password" placeholder="Enter your Mailchimp API key" />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Default List ID</Form.Label>
                    <Form.Control type="text" placeholder="abc123" defaultValue={currentIntegration.config.listId} />
                  </Form.Group>
                </>
              )}

              <div className="d-flex gap-2">
                <Button variant="outline-secondary" size="sm">
                  <i className="fas fa-vial me-2"></i>
                  Test Connection
                </Button>
                <Button variant="outline-info" size="sm">
                  <i className="fas fa-book me-2"></i>
                  View Documentation
                </Button>
              </div>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfigModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={saveConfiguration}>
            Save Configuration
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default Integrations