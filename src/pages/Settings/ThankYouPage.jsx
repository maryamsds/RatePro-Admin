// src\pages\Settings\ThankYouPage.jsx

"use client"

import { useState } from "react"
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap"
import { MdCheck, MdSave } from "react-icons/md"

const ThankYouPage = () => {
  const [settings, setSettings] = useState({
    title: "Thank You!",
    message: "Thank you for completing our survey. Your feedback is valuable to us.",
    redirectUrl: "",
    redirectDelay: 5,
    showSocialShare: true,
    customCss: "",
  })
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    // Save logic here
    console.log("Thank You page settings saved:", settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Container fluid className="min-vh-100 py-4">
      <Row className="justify-content-center">
        <Col xs={12} lg={8}>
          {/* Header */}
          <div className="text-center mb-4">
            <h1 className="h3 text-primary fw-bold mb-2">Thank You Page</h1>
            <p className="text-muted">Customize the thank you page that users see after completing a survey</p>
          </div>

          {saved && (
            <Alert variant="success" className="d-flex align-items-center mb-4">
              <MdCheck className="me-2" />
              Thank you page settings saved successfully!
            </Alert>
          )}

          <Row>
            {/* Settings Form */}
            <Col lg={6}>
              <Card className="mb-4 border-0 shadow-sm">
                <Card.Header>
                  <h5 className="mb-0">Page Settings</h5>
                </Card.Header>
                <Card.Body>
                  <Form>
                    <Form.Group className="mb-3">
                      <Form.Label>Page Title</Form.Label>
                      <Form.Control
                        type="text"
                        value={settings.title}
                        onChange={(e) => handleChange("title", e.target.value)}
                        placeholder="Enter page title"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Thank You Message</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        value={settings.message}
                        onChange={(e) => handleChange("message", e.target.value)}
                        placeholder="Enter thank you message"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Redirect URL (Optional)</Form.Label>
                      <Form.Control
                        type="url"
                        value={settings.redirectUrl}
                        onChange={(e) => handleChange("redirectUrl", e.target.value)}
                        placeholder="https://example.com"
                      />
                      <Form.Text className="text-muted">
                        Leave empty to show the thank you page without redirect
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Redirect Delay (seconds)</Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        max="60"
                        value={settings.redirectDelay}
                        onChange={(e) => handleChange("redirectDelay", Number.parseInt(e.target.value))}
                        disabled={!settings.redirectUrl}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Check
                        type="checkbox"
                        label="Show social sharing buttons"
                        checked={settings.showSocialShare}
                        onChange={(e) => handleChange("showSocialShare", e.target.checked)}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Custom CSS (Optional)</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        value={settings.customCss}
                        onChange={(e) => handleChange("customCss", e.target.value)}
                        placeholder="/* Custom CSS styles */"
                        className="font-monospace"
                      />
                    </Form.Group>

                    <Button variant="primary" onClick={handleSave} className="w-100">
                      <MdSave className="me-2" />
                      Save Settings
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </Col>

            {/* Preview */}
            <Col lg={6}>
              <Card className="border-0 shadow-sm">
                <Card.Header>
                  <h5 className="mb-0">Preview</h5>
                </Card.Header>
                <Card.Body>
                  <div
                    className="p-4 border rounded"
                    style={{
                      minHeight: "400px",
                    }}
                  >
                    <div className="text-center">
                      <div
                        className="rounded-circle bg-success d-flex align-items-center justify-content-center mx-auto mb-3"
                        style={{ width: "60px", height: "60px" }}
                      >
                        <MdCheck className="text-white" size={30} />
                      </div>

                      <h2 className="h4 mb-3">{settings.title}</h2>
                      <p className="text-muted mb-4">{settings.message}</p>

                      {settings.showSocialShare && (
                        <div className="mb-4">
                          <p className="small text-muted mb-2">Share this survey:</p>
                          <div className="d-flex justify-content-center gap-2">
                            <Button variant="outline-primary" size="sm">
                              Facebook
                            </Button>
                            <Button variant="outline-info" size="sm">
                              Twitter
                            </Button>
                            <Button variant="outline-success" size="sm">
                              WhatsApp
                            </Button>
                          </div>
                        </div>
                      )}

                      {settings.redirectUrl && (
                        <div className="mt-4">
                          <p className="small text-muted">
                            Redirecting to {settings.redirectUrl} in {settings.redirectDelay} seconds...
                          </p>
                          <div className="progress" style={{ height: "4px" }}>
                            <div className="progress-bar bg-primary" style={{ width: "60%" }} role="progressbar" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {settings.customCss && (
                    <div className="mt-3">
                      <small className="text-muted">Custom CSS will be applied to the actual page</small>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  )
}

export default ThankYouPage
