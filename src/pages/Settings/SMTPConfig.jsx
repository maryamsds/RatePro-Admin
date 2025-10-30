// src\pages\Settings\SMTPConfig.jsx
"use client"

import { useState } from "react"
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap"
import { MdSave, MdSend, MdEmail, MdSettings } from "react-icons/md"

const SMTPConfig = ({ darkMode }) => {
  const [config, setConfig] = useState({
    host: "",
    port: 587,
    username: "",
    password: "",
    fromEmail: "",
    fromName: "",
  })
  const [testEmail, setTestEmail] = useState("")
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setConfig((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = (e) => {
    e.preventDefault()
    // Save configuration
    console.log("SMTP config saved:", config)
  }

  const handleTest = async (e) => {
    e.preventDefault()
    setIsTesting(true)
    try {
      // Simulate test email
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setTestResult({
        success: true,
        message: "Test email sent successfully!",
      })
    } catch (error) {
      setTestResult({
        success: false,
        message: "Failed to send test email: " + error.message,
      })
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <Container fluid className="smtp-config-container py-4 fade-in">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center">
            <MdEmail size={32} className="text-primary me-3" />
            <div>
              <h2 className={`mb-1 ${darkMode ? "text-white" : "text-dark"}`}>SMTP Configuration</h2>
              <p className="text-muted mb-0">Configure email server settings for sending notifications</p>
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        <Col lg={8}>
          {/* SMTP Settings Card */}
          <Card className="border-0 shadow-sm card-enhanced mb-4">
            <Card.Header className="border-0 d-flex align-items-center">
              <MdSettings className="text-primary me-2" size={20} />
              <Card.Title className={`mb-0 ${darkMode ? "text-white" : "text-dark"}`}>SMTP Server Settings</Card.Title>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSave}>
                <Row>
                  <Col md={8}>
                    <Form.Group className="mb-3">
                      <Form.Label className={darkMode ? "text-white" : "text-dark"}>SMTP Host</Form.Label>
                      <Form.Control
                        type="text"
                        name="host"
                        value={config.host}
                        onChange={handleChange}
                        placeholder="smtp.example.com"
                        className="form-enhanced"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label className={darkMode ? "text-white" : "text-dark"}>Port</Form.Label>
                      <Form.Control
                        type="number"
                        name="port"
                        value={config.port}
                        onChange={handleChange}
                        className="form-enhanced"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className={darkMode ? "text-white" : "text-dark"}>Username</Form.Label>
                      <Form.Control
                        type="text"
                        name="username"
                        value={config.username}
                        onChange={handleChange}
                        placeholder="your-email@example.com"
                        className="form-enhanced"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className={darkMode ? "text-white" : "text-dark"}>Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="password"
                        value={config.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="form-enhanced"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className={darkMode ? "text-white" : "text-dark"}>From Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="fromEmail"
                        value={config.fromEmail}
                        onChange={handleChange}
                        placeholder="noreply@yourcompany.com"
                        className="form-enhanced"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className={darkMode ? "text-white" : "text-dark"}>From Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="fromName"
                        value={config.fromName}
                        onChange={handleChange}
                        placeholder="Your Company Name"
                        className="form-enhanced"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Button type="submit" variant="primary" className="btn-enhanced">
                  <MdSave className="me-2" />
                  Save Configuration
                </Button>
              </Form>
            </Card.Body>
          </Card>

          {/* Test Email Card */}
          <Card className="border-0 shadow-sm card-enhanced">
            <Card.Header className="border-0 d-flex align-items-center">
              <MdSend className="text-primary me-2" size={20} />
              <Card.Title className={`mb-0 ${darkMode ? "text-white" : "text-dark"}`}>
                Test Email Configuration
              </Card.Title>
            </Card.Header>
            <Card.Body>
              <p className="text-muted mb-3">
                Send a test email to verify your SMTP configuration is working correctly.
              </p>

              <Form onSubmit={handleTest}>
                <Form.Group className="mb-3">
                  <Form.Label className={darkMode ? "text-white" : "text-dark"}>Test Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="recipient@example.com"
                    className="form-enhanced"
                    required
                  />
                </Form.Group>

                <Button type="submit" variant="outline-primary" className="btn-enhanced" disabled={isTesting}>
                  <MdSend className="me-2" />
                  {isTesting ? "Sending..." : "Send Test Email"}
                </Button>
              </Form>

              {testResult && (
                <Alert variant={testResult.success ? "success" : "danger"} className="mt-3 alert-enhanced">
                  {testResult.message}
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          {/* Help Card */}
          <Card className="border-0 shadow-sm card-enhanced">
            <Card.Header className="border-0">
              <Card.Title className={`mb-0 ${darkMode ? "text-white" : "text-dark"}`}>Common SMTP Settings</Card.Title>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <h6 className={`mb-2 ${darkMode ? "text-white" : "text-dark"}`}>Gmail</h6>
                <small className="text-muted">
                  Host: smtp.gmail.com
                  <br />
                  Port: 587 (TLS) or 465 (SSL)
                  <br />
                  Use App Password for 2FA accounts
                </small>
              </div>

              <div className="mb-3">
                <h6 className={`mb-2 ${darkMode ? "text-white" : "text-dark"}`}>Outlook/Hotmail</h6>
                <small className="text-muted">
                  Host: smtp-mail.outlook.com
                  <br />
                  Port: 587 (TLS)
                </small>
              </div>

              <div className="mb-3">
                <h6 className={`mb-2 ${darkMode ? "text-white" : "text-dark"}`}>Yahoo</h6>
                <small className="text-muted">
                  Host: smtp.mail.yahoo.com
                  <br />
                  Port: 587 (TLS) or 465 (SSL)
                </small>
              </div>

              <div className="alert alert-info alert-enhanced">
                <small>
                  <strong>Note:</strong> Make sure to enable "Less secure app access" or use App Passwords for Gmail
                  accounts with 2FA enabled.
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default SMTPConfig
