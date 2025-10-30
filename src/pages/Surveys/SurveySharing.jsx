// src\pages\Surveys\SurveySharing.jsx

"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { Container, Row, Col, Card, Form, Button, InputGroup, Alert, Tab, Nav } from "react-bootstrap"
import { MdShare, MdLink, MdQrCode, MdEmail, MdContentCopy, MdDownload, MdSecurity } from "react-icons/md"

const SurveySharing = () => {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [survey, setSurvey] = useState(null)
  const [shareSettings, setShareSettings] = useState({
    isPublic: true,
    requirePassword: false,
    password: "",
    allowAnonymous: true,
    requireRegistration: false,
    maxResponses: "",
    expiryDate: "",
    allowMultipleResponses: false,
  })

  useEffect(() => {
    // Simulate loading survey data
    setTimeout(() => {
      setSurvey({
        id: id,
        title: "Customer Satisfaction Survey",
        url: `https://ratepro.com/survey/${id}`,
        embedCode: `<iframe src="https://ratepro.com/survey/${id}" width="100%" height="600" frameborder="0"></iframe>`,
      })
      setLoading(false)
    }, 1000)
  }, [id])

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const generateQRCode = () => {
    // In a real app, you would generate an actual QR code
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(survey.url)}`
    return qrCodeUrl
  }

  const downloadQRCode = () => {
    const link = document.createElement("a")
    link.href = generateQRCode()
    link.download = `survey-${id}-qr-code.png`
    link.click()
  }

  const handleSettingChange = (field, value) => {
    setShareSettings((prev) => ({ ...prev, [field]: value }))
  }

  const saveSettings = () => {
    console.log("Saving share settings:", shareSettings)
    alert("Share settings saved successfully!")
  }

  if (loading) {
    return (
      <Container fluid className="py-4">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading sharing options...</p>
        </div>
      </Container>
    )
  }

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-1">Share Survey</h1>
              <p className="text-muted mb-0">{survey.title}</p>
            </div>
            <Button variant="primary" onClick={saveSettings}>
              <MdSecurity className="me-2" />
              Save Settings
            </Button>
          </div>
        </Col>
      </Row>

      {copied && (
        <Alert variant="success" className="mb-4">
          Link copied to clipboard!
        </Alert>
      )}

      <Row>
        {/* Sharing Options */}
        <Col lg={8}>
          <Tab.Container defaultActiveKey="link">
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-transparent">
                <Nav variant="tabs" className="border-0">
                  <Nav.Item>
                    <Nav.Link eventKey="link" className="d-flex align-items-center">
                      <MdLink className="me-2" />
                      Direct Link
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="qr" className="d-flex align-items-center">
                      <MdQrCode className="me-2" />
                      QR Code
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="embed" className="d-flex align-items-center">
                      <MdShare className="me-2" />
                      Embed Code
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="email" className="d-flex align-items-center">
                      <MdEmail className="me-2" />
                      Email Invitation
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Header>

              <Card.Body>
                <Tab.Content>
                  {/* Direct Link Tab */}
                  <Tab.Pane eventKey="link">
                    <div className="mb-4">
                      <h5>Survey Link</h5>
                      <p className="text-muted">Share this link with your audience to collect responses</p>

                      <InputGroup className="mb-3">
                        <Form.Control type="text" value={survey.url} readOnly className="font-monospace" />
                        <Button variant="outline-primary" onClick={() => copyToClipboard(survey.url)}>
                          <MdContentCopy />
                        </Button>
                      </InputGroup>

                      <div className="d-flex gap-2">
                        <Button variant="primary" href={survey.url} target="_blank">
                          Open Survey
                        </Button>
                        <Button variant="outline-secondary" onClick={() => copyToClipboard(survey.url)}>
                          Copy Link
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h6>Social Media Sharing</h6>
                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(survey.url)}`}
                          target="_blank"
                        >
                          Facebook
                        </Button>
                        <Button
                          variant="outline-info"
                          size="sm"
                          href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(survey.url)}&text=Please take our survey`}
                          target="_blank"
                        >
                          Twitter
                        </Button>
                        <Button
                          variant="outline-success"
                          size="sm"
                          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(survey.url)}`}
                          target="_blank"
                        >
                          LinkedIn
                        </Button>
                        <Button
                          variant="outline-success"
                          size="sm"
                          href={`https://wa.me/?text=${encodeURIComponent(`Please take our survey: ${survey.url}`)}`}
                          target="_blank"
                        >
                          WhatsApp
                        </Button>
                      </div>
                    </div>
                  </Tab.Pane>

                  {/* QR Code Tab */}
                  <Tab.Pane eventKey="qr">
                    <div className="text-center">
                      <h5>QR Code</h5>
                      <p className="text-muted">Let users scan this QR code to access your survey</p>

                      <div className="mb-4">
                        <img
                          src={generateQRCode() || "/placeholder.svg"}
                          alt="Survey QR Code"
                          className="border rounded"
                          style={{ maxWidth: "200px" }}
                        />
                      </div>

                      <div className="d-flex justify-content-center gap-2">
                        <Button variant="primary" onClick={downloadQRCode}>
                          <MdDownload className="me-2" />
                          Download QR Code
                        </Button>
                        <Button variant="outline-secondary" onClick={() => copyToClipboard(survey.url)}>
                          <MdContentCopy className="me-2" />
                          Copy Link
                        </Button>
                      </div>

                      <div className="mt-4">
                        <h6>QR Code Usage Tips</h6>
                        <ul className="text-start text-muted small">
                          <li>Print on business cards, flyers, or posters</li>
                          <li>Display on digital screens or presentations</li>
                          <li>Include in email signatures</li>
                          <li>Add to product packaging</li>
                        </ul>
                      </div>
                    </div>
                  </Tab.Pane>

                  {/* Embed Code Tab */}
                  <Tab.Pane eventKey="embed">
                    <div>
                      <h5>Embed Survey</h5>
                      <p className="text-muted">Embed this survey directly into your website</p>

                      <Form.Group className="mb-3">
                        <Form.Label>Iframe Embed Code</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={4}
                          value={survey.embedCode}
                          readOnly
                          className="font-monospace"
                        />
                        <Form.Text className="text-muted">Copy and paste this code into your website's HTML</Form.Text>
                      </Form.Group>

                      <div className="d-flex gap-2 mb-4">
                        <Button variant="primary" onClick={() => copyToClipboard(survey.embedCode)}>
                          <MdContentCopy className="me-2" />
                          Copy Embed Code
                        </Button>
                      </div>

                      <div>
                        <h6>Customization Options</h6>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Width</Form.Label>
                              <Form.Control type="text" defaultValue="100%" />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Height</Form.Label>
                              <Form.Control type="text" defaultValue="600px" />
                            </Form.Group>
                          </Col>
                        </Row>
                        <Form.Group className="mb-3">
                          <Form.Check type="checkbox" label="Remove border" defaultChecked />
                        </Form.Group>
                      </div>
                    </div>
                  </Tab.Pane>

                  {/* Email Invitation Tab */}
                  <Tab.Pane eventKey="email">
                    <div>
                      <h5>Email Invitation</h5>
                      <p className="text-muted">Send survey invitations via email</p>

                      <Form>
                        <Form.Group className="mb-3">
                          <Form.Label>Email Template</Form.Label>
                          <Form.Select>
                            <option>Default Invitation</option>
                            <option>Friendly Reminder</option>
                            <option>Professional Request</option>
                            <option>Custom Template</option>
                          </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>Subject Line</Form.Label>
                          <Form.Control type="text" defaultValue="We'd love your feedback - Quick Survey" />
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>Email Content</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={6}
                            defaultValue={`Hi there,

We hope you're doing well! We'd love to hear your thoughts and feedback to help us improve our services.

Could you please take a few minutes to complete our survey? It should only take about 3-5 minutes of your time.

[Survey Link]

Thank you for your time and valuable feedback!

Best regards,
The Rate Pro Team`}
                          />
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>Recipients</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Enter email addresses separated by commas or upload a CSV file"
                          />
                        </Form.Group>

                        <div className="d-flex gap-2">
                          <Button variant="primary">
                            <MdEmail className="me-2" />
                            Send Invitations
                          </Button>
                          <Button variant="outline-secondary">Upload CSV</Button>
                          <Button variant="outline-info">Preview Email</Button>
                        </div>
                      </Form>
                    </div>
                  </Tab.Pane>
                </Tab.Content>
              </Card.Body>
            </Card>
          </Tab.Container>
        </Col>

        {/* Share Settings */}
        <Col lg={4}>
          <Card className="border-0 shadow-sm">
            <Card.Header>
              <h6 className="mb-0">Share Settings</h6>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    label="Make survey public"
                    checked={shareSettings.isPublic}
                    onChange={(e) => handleSettingChange("isPublic", e.target.checked)}
                  />
                  <Form.Text className="text-muted">Anyone with the link can access the survey</Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    label="Require password"
                    checked={shareSettings.requirePassword}
                    onChange={(e) => handleSettingChange("requirePassword", e.target.checked)}
                  />
                  {shareSettings.requirePassword && (
                    <Form.Control
                      type="password"
                      placeholder="Enter password"
                      value={shareSettings.password}
                      onChange={(e) => handleSettingChange("password", e.target.value)}
                      className="mt-2"
                    />
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    label="Allow anonymous responses"
                    checked={shareSettings.allowAnonymous}
                    onChange={(e) => handleSettingChange("allowAnonymous", e.target.checked)}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    label="Require user registration"
                    checked={shareSettings.requireRegistration}
                    onChange={(e) => handleSettingChange("requireRegistration", e.target.checked)}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    label="Allow multiple responses per user"
                    checked={shareSettings.allowMultipleResponses}
                    onChange={(e) => handleSettingChange("allowMultipleResponses", e.target.checked)}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Maximum responses</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Leave empty for unlimited"
                    value={shareSettings.maxResponses}
                    onChange={(e) => handleSettingChange("maxResponses", e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Expiry date</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={shareSettings.expiryDate}
                    onChange={(e) => handleSettingChange("expiryDate", e.target.value)}
                  />
                </Form.Group>
              </Form>
            </Card.Body>
          </Card>

          {/* Survey Statistics */}
          <Card className="border-0 shadow-sm mt-4">
            <Card.Header>
              <h6 className="mb-0">Survey Statistics</h6>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-2">
                <span>Total Views:</span>
                <strong>1,234</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Responses:</span>
                <strong>456</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Completion Rate:</span>
                <strong>87%</strong>
              </div>
              <div className="d-flex justify-content-between">
                <span>Last Response:</span>
                <strong>2 hours ago</strong>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default SurveySharing
